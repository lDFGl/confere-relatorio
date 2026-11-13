import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import { auditWorkbookFormulas } from '@/lib/math-audit';

export type UploadedDocument = { name: string; role: 'report' | 'reference' | 'evidence'; file: File };
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TEXT_PER_FILE = 60000;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx', '.xls']);
function extensionOf(name: string) { const dot = name.lastIndexOf('.'); return dot >= 0 ? name.slice(dot).toLowerCase() : ''; }

async function extractFile(file: File): Promise<{ text: string; calculationNotes: string }> {
  const ext = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) throw new Error(`Formato não suportado: ${file.name}. Use PDF, DOCX, XLSX, XLS, CSV, TXT ou MD.`);
  if (file.size > MAX_FILE_BYTES) throw new Error(`O arquivo ${file.name} excede o limite de 15 MB.`);
  const buffer = Buffer.from(await file.arrayBuffer());
  let text = '', calculationNotes = '';
  if (ext === '.pdf') {
    const parsed = await pdfParse(buffer); text = parsed.text || '';
    if (text.trim().length < 30) throw new Error(`Não foi possível extrair texto de ${file.name}. O PDF parece digitalizado ou sem camada textual; converta-o para PDF pesquisável antes do envio.`);
  } else if (ext === '.docx') {
    const parsed = await mammoth.extractRawText({ buffer }); text = parsed.value || '';
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, cellFormula: true });
    text = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
      const formulaCells = Object.keys(sheet).filter((key) => !key.startsWith('!') && (sheet[key] as XLSX.CellObject).f);
      const formulaDetails = formulaCells.map((address) => {
        const cell = sheet[address] as XLSX.CellObject;
        return `${address}: =${cell.f} | valor armazenado: ${cell.v ?? 'não disponível'}`;
      });
      return `ABA: ${sheetName}\n${rows}\nFÓRMULAS: ${formulaDetails.length ? formulaDetails.join('; ') : 'não identificadas'}`;
    }).join('\n\n');
    const checks = auditWorkbookFormulas(workbook, file.name);
    calculationNotes = checks.length ? checks.map((item) => `[CÁLCULO ${item.status.toUpperCase()}] Arquivo: ${item.source}; aba: ${item.sheet}; célula: ${item.cell}; fórmula: =${item.formula}; recalculado: ${item.calculated ?? 'não disponível'}; armazenado: ${item.stored ?? 'não disponível'}.`).join('\n') : 'Planilha: nenhuma divergência detectada nas fórmulas SUM simples verificáveis.';
  } else text = buffer.toString('utf8');
  text = text.replace(/\u0000/g, '').trim();
  if (text.length < 10) throw new Error(`O arquivo ${file.name} não contém texto suficiente para análise.`);
  if (text.length > MAX_TEXT_PER_FILE) text = text.slice(0, MAX_TEXT_PER_FILE) + '\n[AVISO: conteúdo truncado pelo limite de extração de 60.000 caracteres.]';
  return { text, calculationNotes };
}

export async function readUploadedDocuments(documents: UploadedDocument[]) {
  const totalBytes = documents.reduce((sum, item) => sum + item.file.size, 0);
  if (documents.length > 12) throw new Error('Envie no máximo 12 arquivos por revisão.');
  if (totalBytes > 40 * 1024 * 1024) throw new Error('O conjunto de arquivos excede o limite total de 40 MB.');
  const extracted = await Promise.all(documents.map(async (item) => ({ name: item.name, role: item.role, ...(await extractFile(item.file)) })));
  const grouped = (role: UploadedDocument['role']) => extracted.filter((x) => x.role === role).map((x) => `ARQUIVO: ${x.name}\n${x.text}`).join('\n\n');
  return {
    reportText: grouped('report'), referenceModel: grouped('reference'),
    additionalData: [grouped('evidence'), ...extracted.map((x) => x.calculationNotes).filter(Boolean)].filter(Boolean).join('\n\n'),
    files: extracted.map(({ name, role, text }) => ({ name, role, characters: text.length })),
  };
}
