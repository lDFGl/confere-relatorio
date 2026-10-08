export type AuditReviewResult = {
  executiveSummary: string;
  conformityStatus: string;
  findings: string[];
  recommendations: string[];
};

export function generateAuditRevision(payload: {
  company: string;
  reportTitle: string;
  reportText: string;
  standards: string;
  additionalData: string;
}): AuditReviewResult {
  const text = `${payload.reportText} ${payload.additionalData}`.toLowerCase();
  const hasComplianceGap = text.includes('não') || text.includes('pendente') || text.includes('falha') || text.includes('limite');
  const standards = payload.standards || 'normas internas e legislação aplicável';

  const findings = [
    `O relatório apresenta evidências gerais sobre o processo auditado, mas ainda exige maior detalhamento documental para demonstrar aderência a ${standards}.`,
    hasComplianceGap
      ? 'Há indícios de lacunas operacionais e de rastreabilidade que devem ser melhor evidenciadas para sustentar conclusões de conformidade.'
      : 'Os controles descritos sugerem uma operação geralmente adequada, embora a documentação de monitoramento continue sendo prioritária.',
    'É recomendável reforçar a ligação entre evidências, riscos e ações corretivas para evitar interpretações inconsistentes por parte dos stakeholders.',
  ];

  const recommendations = [
    'Mapear cada requisito da norma ou legislação contra evidências específicas do processo, com referência a responsáveis, datas e registros.',
    'Formalizar ações corretivas e preventivas, com cronograma, responsável e indicadores de acompanhamento.',
    'Incluir observações objetivas sobre riscos, impacto do processo e evidências de mitigação para reforçar a consistência do relatório.',
  ];

  return {
    executiveSummary: `A revisão do relatório de ${payload.company} indica que o texto deve ser aprimorado para evidenciar, de forma mais objetiva, a relação entre controles, evidências e requisitos aplicáveis de ${standards}. O documento atende parcialmente ao propósito de auditoria, mas precisa de maior clareza sobre riscos, conformidade e ações de mitigação.`,
    conformityStatus: hasComplianceGap ? 'Parcialmente conforme / com ajustes necessários' : 'Conforme em linha geral, com melhorias recomendadas',
    findings,
    recommendations,
  };
}
