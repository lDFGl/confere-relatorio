import * as XLSX from 'xlsx';

export type CalculationCheck = {
  source: string;
  sheet: string;
  cell: string;
  formula: string;
  calculated: number | null;
  stored: number | null;
  status: 'divergência' | 'sem resultado armazenado' | 'não validado';
};

function numeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && /^-?\d+(?:[.,]\d+)?$/.test(value.trim())) {
    const parsed = Number(value.trim().replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Audita apenas fórmulas SUM com intervalos A1 reconhecíveis; não substitui recálculo integral do Excel. */
export function auditWorkbookFormulas(workbook: XLSX.WorkBook, source: string): CalculationCheck[] {
  const checks: CalculationCheck[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    for (const address of Object.keys(sheet)) {
      if (address.startsWith('!')) continue;
      const cell = sheet[address] as XLSX.CellObject;
      if (!cell.f) continue;
      const formula = String(cell.f).replace(/^=/, '');
      const match = formula.match(/^SUM\(\$?([A-Z]{1,3})\$?(\d+):\$?([A-Z]{1,3})\$?(\d+)\)$/i);
      if (!match) {
        checks.push({ source, sheet: sheetName, cell: address, formula, calculated: null, stored: numeric(cell.v), status: 'não validado' });
        continue;
      }
      const start = XLSX.utils.decode_cell(match[1].toUpperCase() + match[2]);
      const end = XLSX.utils.decode_cell(match[3].toUpperCase() + match[4]);
      if (start.c !== end.c || end.r - start.r > 5000) {
        checks.push({ source, sheet: sheetName, cell: address, formula, calculated: null, stored: numeric(cell.v), status: 'não validado' });
        continue;
      }
      let total = 0;
      for (let row = start.r; row <= end.r; row++) {
        total += numeric(sheet[XLSX.utils.encode_cell({ r: row, c: start.c })]?.v) ?? 0;
      }
      const stored = numeric(cell.v);
      checks.push({
        source, sheet: sheetName, cell: address, formula, calculated: total, stored,
        status: stored === null ? 'sem resultado armazenado' : Math.abs(total - stored) > Math.max(0.01, Math.abs(total) * 0.000001) ? 'divergência' : 'não validado',
      });
      if (stored !== null && Math.abs(total - stored) <= Math.max(0.01, Math.abs(total) * 0.000001)) checks.pop();
    }
  }
  return checks;
}
