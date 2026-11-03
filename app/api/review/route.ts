import { generateAuditRevision, type AuditReviewPayload } from '@/lib/review-engine';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AuditReviewPayload>;

    if (!body.reportText || typeof body.reportText !== 'string' || body.reportText.trim().length < 30) {
      return Response.json({ error: 'Informe o conteúdo do relatório (mínimo de 30 caracteres).' }, { status: 400 });
    }

    const totalLength = [
      body.reportText,
      body.additionalData,
      body.referenceModel,
      body.reviewInstructions,
    ].reduce((sum, value) => sum + (typeof value === 'string' ? value.length : 0), 0);

    if (totalLength > 180000) {
      return Response.json({ error: 'O conteúdo excede o limite de 180.000 caracteres. Divida o material em etapas.' }, { status: 413 });
    }

    const result = await generateAuditRevision({
      company: String(body.company || ''),
      reportTitle: String(body.reportTitle || ''),
      reportText: body.reportText,
      standards: String(body.standards || ''),
      additionalData: String(body.additionalData || ''),
      referenceModel: String(body.referenceModel || ''),
      reviewInstructions: String(body.reviewInstructions || ''),
      auditType: String(body.auditType || 'Auditoria interna'),
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado ao revisar o relatório.';
    const status = message.includes('OPENAI_API_KEY') ? 503 : 502;
    return Response.json({ error: message }, { status });
  }
}
