import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';

export type UploadedDocument = {
  name: string;
  role: 'report' | 'reference' | 'evidence';
  file: File;
};

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TEXT_PER_FILE = 60000;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx', '.xls']);

function extensionOf(name: string) {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

async function extractFile(file: File): Promise<string> {
  const ext = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Formato não suportado: ${file.name}. Use PDF, DOCX, XLSX, XLS, CSV, TXT ou MD.`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`O arquivo ${file.name} excede o limite de 15 MB.`);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  let text = '';

  if (ext === '.pdf') {
    const parsed = await pdfParse(buffer);
    text = parsed.text || '';
    if (text.trim().length < 30) {
      throw new Error(`Não foi possível extrair texto de ${file.name}. Se for um PDF digitalizado como imagem, será necessário aplicar OCR antes do envio.`);
    }
  } else if (ext === '.docx') {
    const parsed = await mammoth.extractRawText({ buffer });
    text = parsed.value || '';
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    text = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
      return `ABA: ${sheetName}\n${rows}`;
    }).join('\n\n');
  } else {
    text = buffer.toString('utf8');
  }

  text = text.replace(/\u0000/g, '').trim();
  if (text.length < 10) throw new Error(`O arquivo ${file.name} não contém texto suficiente para análise.`);
  return text.slice(0, MAX_TEXT_PER_FILE);
}

export async function readUploadedDocuments(documents: UploadedDocument[]) {
  const totalBytes = documents.reduce((sum, item) => sum + item.file.size, 0);
  if (documents.length > 12) throw new Error('Envie no máximo 12 arquivos por revisão.');
  if (totalBytes > 40 * 1024 * 1024) throw new Error('O conjunto de arquivos excede o limite total de 40 MB.');

  const extracted = await Promise.all(documents.map(async (item) => ({
    name: item.name,
    role: item.role,
    text: await extractFile(item.file),
  })));

  return {
    reportText: extracted.filter((x) => x.role === 'report').map((x) => `ARQUIVO DO RELATÓRIO: ${x.name}\n${x.text}`).join('\n\n'),
    referenceModel: extracted.filter((x) => x.role === 'reference').map((x) => `MODELO DE REFERÊNCIA: ${x.name}\n${x.text}`).join('\n\n'),
    additionalData: extracted.filter((x) => x.role === 'evidence').map((x) => `DOCUMENTO DE EVIDÊNCIA: ${x.name}\n${x.text}`).join('\n\n'),
    files: extracted.map(({ name, role, text }) => ({ name, role, characters: text.length })),
  };
}
