import { NextRequest, NextResponse } from 'next/server';
import { generateAuditRevision, type AuditReviewPayload } from '@/lib/review-engine';
import { readUploadedDocuments, type UploadedDocument } from '@/lib/document-reader';
import { isValidSession, SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 120;
const MAX_TEXT_LENGTH = 180000;

function textField(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === 'string' ? value : '';
}

export async function POST(request: NextRequest) {
  if (!isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Sessão expirada. Entre novamente.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    let payload: AuditReviewPayload;
    let uploadedFiles: { name: string; role: string; characters: number }[] = [];
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const documents: UploadedDocument[] = [];
      for (const [field, role] of [['reportFiles', 'report'], ['referenceFiles', 'reference'], ['evidenceFiles', 'evidence']] as const) {
        for (const value of form.getAll(field)) {
          if (typeof value !== 'string' && 'arrayBuffer' in value && value.size > 0) {
            documents.push({ name: value.name, role, file: value as File });
          }
        }
      }
      const extracted = await readUploadedDocuments(documents);
      uploadedFiles = extracted.files;
      payload = {
        company: textField(form, 'company'),
        reportTitle: textField(form, 'reportTitle'),
        auditType: textField(form, 'auditType') || 'Auditoria interna',
        standards: textField(form, 'standards'),
        reportText: [textField(form, 'reportText'), extracted.reportText].filter(Boolean).join('\n\n'),
        referenceModel: [textField(form, 'referenceModel'), extracted.referenceModel].filter(Boolean).join('\n\n'),
        additionalData: [textField(form, 'additionalData'), extracted.additionalData].filter(Boolean).join('\n\n'),
        reviewInstructions: textField(form, 'reviewInstructions'),
      };
    } else if (contentType.includes('application/json')) {
      const body = (await request.json()) as Partial<AuditReviewPayload>;
      payload = {
        company: String(body.company || ''),
        reportTitle: String(body.reportTitle || ''),
        auditType: String(body.auditType || 'Auditoria interna'),
        standards: String(body.standards || ''),
        reportText: typeof body.reportText === 'string' ? body.reportText : '',
        referenceModel: String(body.referenceModel || ''),
        additionalData: String(body.additionalData || ''),
        reviewInstructions: String(body.reviewInstructions || ''),
      };
    } else {
      return NextResponse.json({ error: 'Tipo de conteúdo não suportado.' }, { status: 415 });
    }

    if (!payload.reportText || payload.reportText.trim().length < 30) {
      return NextResponse.json({ error: 'Anexe pelo menos um relatório ou informe o texto (mínimo de 30 caracteres).' }, { status: 400 });
    }
    const totalLength = [payload.reportText, payload.additionalData, payload.referenceModel, payload.reviewInstructions, payload.standards]
      .reduce((sum, value) => sum + value.length, 0);
    if (totalLength > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: 'O conteúdo extraído excede 180.000 caracteres. Reduza a quantidade de arquivos ou divida a análise.' }, { status: 413 });
    }

    const result = await generateAuditRevision(payload);
    return NextResponse.json(
      { ...result, uploadedFiles, originalText: payload.reportText },
      { status: 200, headers: { 'Cache-Control': 'no-store, private' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado ao revisar o relatório.';
    const status = message.includes('OPENAI_API_KEY') || message.includes('SESSION_SECRET')
      ? 503
      : message.includes('excede') || message.includes('máximo')
        ? 413
        : message.includes('Formato não suportado') || message.includes('não foi possível extrair') || message.includes('não contém')
          ? 400
          : 502;
    // Mensagens de parser são úteis ao usuário; detalhes internos do provedor nunca são devolvidos.
    const safeMessage = status === 502 ? 'Não foi possível concluir a análise. Verifique a configuração do serviço e tente novamente.' : message;
    return NextResponse.json({ error: safeMessage }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
