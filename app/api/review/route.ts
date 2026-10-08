import { generateAuditRevision } from '@/lib/review-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = generateAuditRevision(body);

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: 'Não foi possível processar o relatório. Verifique os dados enviados.',
      },
      { status: 400 }
    );
  }
}
