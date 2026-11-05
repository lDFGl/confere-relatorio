import { generateAuditRevision, type AuditReviewPayload } from '@/lib/review-engine';
import { readUploadedDocuments, type UploadedDocument } from '@/lib/document-reader';
export const runtime = 'nodejs';
const MAX_TEXT_LENGTH = 180000;
function textField(form: FormData, key: string) { const value = form.get(key); return typeof value === 'string' ? value : ''; }

export async function POST(request: Request) {
  try {
    let payload: AuditReviewPayload;
    let uploadedFiles: { name: string; role: string; characters: number }[] = [];
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData(), documents: UploadedDocument[] = [];
      for (const [field, role] of [['reportFiles', 'report'], ['referenceFiles', 'reference'], ['evidenceFiles', 'evidence']] as const) {
        for (const value of form.getAll(field)) if (typeof value !== 'string' && 'arrayBuffer' in value && value.size > 0) documents.push({ name: value.name, role, file: value as File });
      }
      const extracted = await readUploadedDocuments(documents); uploadedFiles = extracted.files;
      payload = {
        company: textField(form, 'company'), reportTitle: textField(form, 'reportTitle'),
        auditType: textField(form, 'auditType') || 'Auditoria interna', standards: textField(form, 'standards'),
        reportText: [textField(form, 'reportText'), extracted.reportText].filter(Boolean).join('\n\n'),
        referenceModel: [textField(form, 'referenceModel'), extracted.referenceModel].filter(Boolean).join('\n\n'),
        additionalData: [textField(form, 'additionalData'), extracted.additionalData].filter(Boolean).join('\n\n'),
        reviewInstructions: textField(form, 'reviewInstructions'),
      };
    } else {
      const body = (await request.json()) as Partial<AuditReviewPayload>;
      payload = { company: String(body.company || ''), reportTitle: String(body.reportTitle || ''), auditType: String(body.auditType || 'Auditoria interna'), standards: String(body.standards || ''), reportText: typeof body.reportText === 'string' ? body.reportText : '', referenceModel: String(body.referenceModel || ''), additionalData: String(body.additionalData || ''), reviewInstructions: String(body.reviewInstructions || '') };
    }
    if (!payload.reportText || payload.reportText.trim().length < 30) return Response.json({ error: 'Anexe pelo menos um relatório em PDF/DOCX ou informe o texto (mínimo de 30 caracteres).' }, { status: 400 });
    const totalLength = [payload.reportText, payload.additionalData, payload.referenceModel, payload.reviewInstructions, payload.standards].reduce((sum, value) => sum + value.length, 0);
    if (totalLength > MAX_TEXT_LENGTH) return Response.json({ error: 'O conteúdo extraído excede 180.000 caracteres. Reduza a quantidade de arquivos ou divida a análise.' }, { status: 413 });
    const result = await generateAuditRevision(payload);
    return Response.json({ ...result, uploadedFiles, originalText: payload.reportText }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado ao revisar o relatório.';
    const status = message.includes('OPENAI_API_KEY') ? 503 : message.includes('excede') || message.includes('máximo') ? 413 : message.includes('Formato não suportado') || message.includes('não foi possível extrair') || message.includes('não contém') ? 400 : 502;
    return Response.json({ error: message }, { status });
  }
}
