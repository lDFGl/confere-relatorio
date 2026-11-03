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
  uploadedFiles?: { name: string; role: string; characters: number }[];
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

function FilePicker({ label, hint, files, onChange, multiple = true }: {
  label: string;
  hint: string;
  files: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
}) {
  return <div className="grid gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <input
      type="file"
      multiple={multiple}
      accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.xls"
      onChange={(event) => onChange(Array.from(event.target.files || []))}
      className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-800"
    />
    <span className="text-xs leading-5 text-slate-500">{hint}</span>
    {files.length > 0 && <ul className="space-y-1 text-xs text-slate-700">
      {files.map((file, index) => <li key={file.name + index} className="flex items-center gap-2"><span className="text-teal-700">✓</span>{file.name} <span className="text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span></li>)}
    </ul>}
  </div>;
}

function OutputSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="mb-3 text-base font-bold text-slate-900">{title}</h3>
    <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{children}</div>
  </section>;
}

export default function ReportForm() {
  const [form, setForm] = useState(emptyForm);
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'review' | 'revision'>('review');

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.reportText.trim().length < 30 && reportFiles.length === 0) {
      setError('Anexe o relatório que deseja revisar ou cole seu conteúdo.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      reportFiles.forEach((file) => data.append('reportFiles', file));
      referenceFiles.forEach((file) => data.append('referenceFiles', file));
      evidenceFiles.forEach((file) => data.append('evidenceFiles', file));

      const response = await fetch('/api/review', { method: 'POST', body: data });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Erro ao processar os documentos.');
      setResult(responseData);
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
  const canSubmit = !loading && (reportFiles.length > 0 || form.reportText.trim().length >= 30);

  return <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Novo trabalho</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Conferência de documentos</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Anexe o relatório, os modelos institucionais aprovados e as evidências. O assistente extrairá o conteúdo e fará a conferência conjunta.</p>
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

      <div className="space-y-3">
        <FilePicker label="1. Relatório que será conferido" hint="Anexe o documento principal. Aceita PDF, DOCX, XLSX, XLS, CSV, TXT e MD. É possível selecionar mais de um arquivo." files={reportFiles} onChange={setReportFiles} />
        <Field label="Ou cole o conteúdo do relatório" hint="Opcional quando você já anexou o documento.">
          <textarea rows={6} className={textClass} value={form.reportText} onChange={(e) => handleChange('reportText', e.target.value)} placeholder="Cole aqui o relatório, achado, recomendação ou seção..." />
        </Field>
      </div>

      <div className="space-y-3">
        <FilePicker label="2. Modelo(s) institucional(is) aprovado(s)" hint="Anexe um ou mais relatórios aprovados. A IA usará estrutura, títulos, sequência, nomenclatura e linguagem como padrão, sem copiar fatos." files={referenceFiles} onChange={setReferenceFiles} />
        <Field label="Ou cole o modelo de referência" hint="Opcional quando o modelo já foi anexado.">
          <textarea rows={5} className={textClass} value={form.referenceModel} onChange={(e) => handleChange('referenceModel', e.target.value)} placeholder="Cole aqui o conteúdo de um relatório aprovado..." />
        </Field>
      </div>

      <div className="space-y-3">
        <FilePicker label="3. Evidências e documentos de suporte" hint="Anexe planilhas de amostragem, memórias de cálculo, procedimentos, normas, contratos, medições, evidências e outros documentos. Máximo de 12 arquivos e 40 MB no conjunto." files={evidenceFiles} onChange={setEvidenceFiles} />
        <Field label="Ou informe contexto complementar">
          <textarea rows={4} className={textClass} value={form.additionalData} onChange={(e) => handleChange('additionalData', e.target.value)} placeholder="Dados adicionais, evidências, valores, datas, sistemas e esclarecimentos..." />
        </Field>
      </div>

      <Field label="Normas e critérios aplicáveis" hint="Informe normas, procedimentos internos, legislação, versões ou dispositivos que devem ser considerados.">
        <textarea rows={3} className={textClass} value={form.standards} onChange={(e) => handleChange('standards', e.target.value)} />
      </Field>

      <Field label="Orientações específicas para esta revisão">
        <textarea rows={3} className={textClass} value={form.reviewInstructions} onChange={(e) => handleChange('reviewInstructions', e.target.value)} />
      </Field>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{error}</div>}

      <button type="submit" disabled={!canSubmit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">
        {loading ? 'Extraindo arquivos e realizando a conferência...' : 'Conferir documentos com IA'}
      </button>
      <p className="text-center text-xs text-slate-500">Limites: 15 MB por arquivo, 40 MB no total e até 12 arquivos. PDF digitalizado como imagem precisa de OCR. Os documentos são processados para esta análise e não formam uma biblioteca permanente nesta versão.</p>
      <p className="text-center text-xs text-slate-500">A revisão é uma minuta técnica. A validação e aprovação final permanecem sob responsabilidade do auditor.</p>
    </form>

    <aside className="space-y-4 xl:sticky xl:top-5">
      <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Assistente de auditoria</p>
        <h2 className="mt-2 text-xl font-bold">Resultado da conferência</h2>
        {result ? <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => setActiveTab('review')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === 'review' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'}`}>Diagnóstico</button>
          <button type="button" onClick={() => setActiveTab('revision')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === 'revision' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'}`}>Texto revisado</button>
        </div> : <p className="mt-3 text-sm leading-6 text-slate-300">A análise dos documentos, o diagnóstico técnico, as recomendações e a versão revisada aparecerão aqui.</p>}
      </div>

      {result && result.uploadedFiles && <OutputSection title="Arquivos processados">{result.uploadedFiles.map((file) => `• ${file.name} — ${file.characters.toLocaleString('pt-BR')} caracteres extraídos`).join('\n')}</OutputSection>}
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
