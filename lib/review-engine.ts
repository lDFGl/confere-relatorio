export type AuditReviewPayload = {
  company: string;
  reportTitle: string;
  reportText: string;
  standards: string;
  additionalData: string;
  referenceModel: string;
  reviewInstructions: string;
  auditType: string;
};

export type AuditReviewResult = {
  executiveSummary: string;
  conformityStatus: string;
  structuralAnalysis: string;
  technicalAnalysis: string;
  findings: string[];
  recommendations: string[];
  revisedText: string;
  pointsToConfirm: string[];
  standardsCaveat: string;
};

const SYSTEM_PROMPT = `
Você é um especialista sênior em auditoria interna, controles internos, gestão de riscos e redação técnica.
Sua tarefa é revisar relatórios com rigor profissional, sem inventar fatos, evidências, normas, artigos, números, datas ou conclusões.

REGRAS OBRIGATÓRIAS:
1. Preserve o conteúdo factual, os valores, percentuais, datas, nomes de sistemas, referências e conclusões sustentadas pelas evidências fornecidas.
2. Nunca transforme ausência de informação em prova de descumprimento. Diferencie: não evidenciado, não apresentado, não aplicável, parcialmente atendido e não atendido.
3. Não declare conformidade normativa sem requisito identificável e evidência suficiente. Se a norma, versão ou dispositivo não estiver confirmado, sinalize para validação.
4. Separe claramente fatos/evidências, critérios, condição, causa (somente se demonstrada), risco/efeito e recomendação.
5. Identifique contradições, lacunas de rastreabilidade, cálculos inconsistentes e conclusões que excedam as evidências.
6. Recomendações devem ser específicas, executáveis, proporcionais ao risco e indicar formalização, responsável/aprovação e evidência de implementação quando pertinente.
7. O modelo de referência fornecido prevalece quanto à estrutura, nomenclatura, ordem, tom, formatação textual e estilo. Não copie fatos específicos do modelo para o relatório atual.
8. Se não houver modelo de referência, use linguagem formal, objetiva, impessoal e técnica de auditoria interna.
9. Não crie achados, riscos, causas, impactos ou recomendações genéricas apenas para preencher seções.
10. Se faltarem dados essenciais, registre-os em pontosToConfirm e use marcações explícitas no texto revisado, sem adivinhar.
11. Considere normas nacionais e internacionais somente conforme aplicabilidade e escopo. COSO, Normas Globais de Auditoria Interna do IIA, ISO e normas brasileiras não são intercambiáveis.
12. Escreva em português do Brasil.

FORMATO DE SAÍDA:
Retorne exclusivamente JSON válido com as chaves:
executiveSummary (string), conformityStatus (string), structuralAnalysis (string), technicalAnalysis (string), findings (array de strings), recommendations (array de strings), revisedText (string), pointsToConfirm (array de strings), standardsCaveat (string).
Em recommendations, quando houver recomendações, respeite literalmente o cabeçalho "Recomendação da AI:" e a numeração romana I., II., III. se esse padrão estiver presente no modelo ou nas instruções. Não use recomendações vazias ou desconectadas dos achados.
`.trim();

export async function generateAuditRevision(payload: AuditReviewPayload): Promise<AuditReviewResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada. Cadastre a chave nas variáveis de ambiente do servidor.');
  }

  const userPrompt = `
DADOS DO TRABALHO
Empresa/unidade: ${payload.company || 'Não informada'}
Título: ${payload.reportTitle || 'Não informado'}
Tipo de auditoria: ${payload.auditType || 'Auditoria interna'}
Critérios/normas indicados pelo usuário: ${payload.standards || 'Não informados'}

MODELO INSTITUCIONAL DE REFERÊNCIA (use apenas para aprender estrutura e estilo):
${payload.referenceModel || 'Nenhum modelo fornecido.'}

INSTRUÇÕES ADICIONAIS DO AUDITOR:
${payload.reviewInstructions || 'Nenhuma.'}

RELATÓRIO A REVISAR:
${payload.reportText}

EVIDÊNCIAS, DADOS E CONTEXTO COMPLEMENTAR:
${payload.additionalData || 'Não fornecidos.'}

Execute a revisão completa. Preserve os dados originais. Aponte explicitamente qualquer requisito normativo que dependa de confirmação de versão, vigência ou aplicabilidade. O texto revisado deve ser utilizável como minuta, mantendo a estrutura do modelo quando fornecido.
`.trim();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('OpenAI API error:', response.status, detail.slice(0, 1000));
    throw new Error(response.status === 401
      ? 'A chave da IA foi rejeitada. Verifique OPENAI_API_KEY.'
      : 'A IA não conseguiu concluir a revisão. Verifique a configuração e tente novamente.');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('A IA retornou uma resposta vazia.');

  const parsed = JSON.parse(content);
  return {
    executiveSummary: String(parsed.executiveSummary || ''),
    conformityStatus: String(parsed.conformityStatus || 'Não foi possível classificar'),
    structuralAnalysis: String(parsed.structuralAnalysis || ''),
    technicalAnalysis: String(parsed.technicalAnalysis || ''),
    findings: Array.isArray(parsed.findings) ? parsed.findings.map(String) : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String) : [],
    revisedText: String(parsed.revisedText || ''),
    pointsToConfirm: Array.isArray(parsed.pointsToConfirm) ? parsed.pointsToConfirm.map(String) : [],
    standardsCaveat: String(parsed.standardsCaveat || ''),
  };
}
