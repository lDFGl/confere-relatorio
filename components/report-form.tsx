'use client';

import { useState } from 'react';

const initialForm = {
  company: 'Empresa ABC',
  reportTitle: 'Relatório de auditoria interna - Processo de compras',
  reportText: `A empresa realizou auditoria interna no processo de compras durante o ano de 2024. O setor concluiu que os controles são adequados e não houveram não conformidades relevantes. Foram levantados apenas pontos de melhoria no prazo de aprovação de pedidos e no registro de evidências.`,
  standards: 'ISO 9001, Lei Geral de Proteção de Dados (LGPD), COSO',
  additionalData: 'Foram analisados 86 pedidos de compra, 18 fornecedores e 14 evidências de aprovação. O processo de compras é centralizado pela área financeira e os pendentes foram acompanhados por controle mensal.',
};

export default function ReportForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar o relatório');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Novo projeto</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Dados do relatório</h2>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Empresa / unidade
            <input
              value={form.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none ring-0 transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Título do relatório
            <input
              value={form.reportTitle}
              onChange={(e) => handleChange('reportTitle', e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Normas e legislação aplicáveis
            <input
              value={form.standards}
              onChange={(e) => handleChange('standards', e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Texto do relatório de auditoria
            <textarea
              value={form.reportText}
              onChange={(e) => handleChange('reportText', e.target.value)}
              rows={10}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Dados adicionais / evidências / observações
            <textarea
              value={form.additionalData}
              onChange={(e) => handleChange('additionalData', e.target.value)}
              rows={6}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? 'Revisando relatório...' : 'Revisar com IA'}
          </button>

          <span className="text-sm text-slate-500">Baseado em normas + legislação + dados adicionais</span>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}
      </form>

      <aside className="rounded-3xl bg-slate-900 p-6 text-white shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Resultado da IA</p>
        {result ? (
          <div className="mt-5 space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Resumo executivo</h3>
              <p className="mt-2 text-sm leading-7 text-slate-200">{result.executiveSummary}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Status de conformidade</h3>
              <div className="mt-2 rounded-xl bg-slate-800 p-3 text-sm font-medium text-blue-200">
                {result.conformityStatus}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Principais achados</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {result.findings.map((finding: string) => (
                  <li key={finding} className="flex gap-2">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Recomendações</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {result.recommendations.map((rec: string) => (
                  <li key={rec} className="flex gap-2">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-sm leading-7 text-slate-300">
            Envie o relatório para que a IA identifique riscos, lacunas, conformidades e propostas de melhoria com base em normas e legislação.
          </div>
        )}
      </aside>
    </div>
  );
}
