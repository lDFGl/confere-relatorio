import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import { auditWorkbookFormulas } from '../lib/math-audit';

function workbookWithSum(stored: number) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([[10], [20], [stored]]);
  sheet.A3 = { t: 'n', v: stored, f: 'SUM(A1:A2)' };
  XLSX.utils.book_append_sheet(workbook, sheet, 'Medições');
  return workbook;
}

test('identifica divergência entre soma e resultado armazenado', () => {
  const result = auditWorkbookFormulas(workbookWithSum(35), 'amostra.xlsx');
  assert.equal(result.length, 1);
  assert.equal(result[0].status, 'divergência');
  assert.equal(result[0].calculated, 30);
  assert.equal(result[0].stored, 35);
});

test('não sinaliza divergência quando a soma confere', () => {
  const result = auditWorkbookFormulas(workbookWithSum(30), 'amostra.xlsx');
  assert.equal(result.length, 0);
});

test('marca fórmula fora do padrão suportado como não validada', () => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([[2, 3, 6]]);
  sheet.C1 = { t: 'n', v: 6, f: 'A1*B1' };
  XLSX.utils.book_append_sheet(workbook, sheet, 'Resumo');
  const result = auditWorkbookFormulas(workbook, 'amostra.xlsx');
  assert.equal(result.length, 1);
  assert.equal(result[0].status, 'não validado');
});
