'use client';

import { useState } from 'react';

type ReviewResult = {
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

const emptyForm = {
  company: '',
  reportTitle: '',
  auditType: 'Auditoria interna',
  standards: 'Normas Globais de Auditoria Interna (IIA), COSO e normas/legislação aplicáveis ao objeto auditado',
  reportText: '',
  additionalData: '',
  referenceModel: '',
  reviewInstructions: 'Preservar integralmente os fatos, valores e evidências. Manter o padrão institucional do modelo de referência. Não inventar informações.',
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700">
    {label}
    {children}
    {hint && <span className="text-xs font-normal leading-5 text-slate-500">{hint}</span>}
  </label>;
}

function OutputSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="mb-3 text-base font-bold text-slate-900">{title}</h3>
    <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{children}</div>
  </section>;
}

export default function ReportForm() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'review' | 'revision'>('review');

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao processar o relatório.');
      setResult(data);
      setActiveTab('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const copyRevision = async () => {
    if (!result?.revisedText) return;
    await navigator.clipboard.writeText(result.revisedText);
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100';
  const textClass = inputClass + ' resize-y leading-6';

  return <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Novo trabalho</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Revisão de relatório</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Informe o documento, as evidências e, principalmente, um relatório aprovado que servirá como referência de estrutura e linguagem.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Empresa / unidade">
          <input className={inputClass} value={form.company} onChange={(e) => handleChange('company', e.target.value)} placeholder="Ex.: FG Empreendimentos" />
        </Field>
        <Field label="Tipo de auditoria">
          <select className={inputClass} value={form.auditType} onChange={(e) => handleChange('auditType', e.target.value)}>
            <option>Auditoria interna</option><option>Auditoria de processos</option><option>Auditoria operacional</option><option>Auditoria de conformidade</option><option>Auditoria de obras</option><option>Auditoria patrimonial</option><option>Outro</option>
          </select>
        </Field>
      </div>

      <Field label="Título do relatório">
        <input className={inputClass} value={form.reportTitle} onChange={(e) => handleChange('reportTitle', e.target.value)} placeholder="Título conforme padrão institucional" />
      </Field>

      <Field label="Relatório ou trecho a revisar" hint="Cole o conteúdo integral ou a seção que deseja revisar. Não inclua dados pessoais desnecessários.">
        <textarea required minLength={30} rows={12} className={textClass} value={form.reportText} onChange={(e) => handleChange('reportText', e.target.value)} placeholder="Cole aqui o relatório, achado, recomendação ou seção que deseja revisar..." />
      </Field>

      <Field label="Modelo institucional aprovado" hint="Cole um relatório já aprovado. A IA usará este conteúdo para aprender estrutura, títulos, sequência, linguagem e padrão de recomendações — não para copiar fatos.">
        <textarea rows={8} className={textClass} value={form.referenceModel} onChange={(e) => handleChange('referenceModel', e.target.value)} placeholder="Cole aqui o conteúdo de um relatório aprovado como referência..." />
      </Field>

      <Field label="Normas e critérios aplicáveis" hint="Informe normas, procedimentos internos, legislação, versões ou dispositivos que devem ser considerados.">
        <textarea rows={3} className={textClass} value={form.standards} onChange={(e) => handleChange('standards', e.target.value)} />
      </Field>

      <Field label="Evidências e contexto complementar" hint="Inclua amostras, valores, datas, sistemas, documentos examinados e esclarecimentos da área auditada.">
        <textarea rows={5} className={textClass} value={form.additionalData} onChange={(e) => handleChange('additionalData', e.target.value)} placeholder="Dados adicionais, evidências, memória de cálculo e contexto..." />
      </Field>

      <Field label="Orientações específicas para esta revisão">
        <textarea rows={3} className={textClass} value={form.reviewInstructions} onChange={(e) => handleChange('reviewInstructions', e.target.value)} />
      </Field>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{error}</div>}

      <button type="submit" disabled={loading || form.reportText.trim().length < 30} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">
        {loading ? 'Analisando conteúdo e modelo...' : 'Revisar relatório com IA'}
      </button>
      <p className="text-center text-xs text-slate-500">A revisão é uma minuta técnica. A validação e aprovação final permanecem sob responsabilidade do auditor.</p>
    </form>

    <aside className="space-y-4 xl:sticky xl:top-5">
      <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Assistente de auditoria</p>
        <h2 className="mt-2 text-xl font-bold">Resultado da análise</h2>
        {result ? <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => setActiveTab('review')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === 'review' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'}`}>Diagnóstico</button>
          <button type="button" onClick={() => setActiveTab('revision')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === 'revision' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'}`}>Texto revisado</button>
        </div> : <p className="mt-3 text-sm leading-6 text-slate-300">O diagnóstico técnico, as recomendações e a versão revisada aparecerão aqui após o processamento.</p>}
      </div>

      {result && activeTab === 'review' && <>
        <OutputSection title="Resumo executivo">{result.executiveSummary}</OutputSection>
        <OutputSection title="Avaliação de conformidade">{result.conformityStatus}</OutputSection>
        <OutputSection title="Análise estrutural">{result.structuralAnalysis}</OutputSection>
        <OutputSection title="Análise técnica">{result.technicalAnalysis}</OutputSection>
        <OutputSection title="Achados identificados">{result.findings.length ? result.findings.map((x, i) => `${i + 1}. ${x}`).join('\n\n') : 'Nenhum achado adicional identificado.'}</OutputSection>
        <OutputSection title="Recomendações">{result.recommendations.length ? result.recommendations.join('\n\n') : 'Não foram propostas recomendações adicionais.'}</OutputSection>
        <OutputSection title="Pontos que exigem confirmação">{result.pointsToConfirm.length ? result.pointsToConfirm.map((x, i) => `${i + 1}. ${x}`).join('\n\n') : 'Nenhum ponto adicional sinalizado.'}</OutputSection>
        <OutputSection title="Ressalvas normativas">{result.standardsCaveat || 'Nenhuma ressalva adicional.'}</OutputSection>
      </>}

      {result && activeTab === 'revision' && <OutputSection title="Texto revisado">{result.revisedText || 'A IA não retornou uma versão revisada.'}
        <button type="button" onClick={copyRevision} className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800">Copiar texto revisado</button>
      </OutputSection>}
    </aside>
  </div>;
}
