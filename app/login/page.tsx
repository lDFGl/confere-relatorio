'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível autenticar.');
      window.location.assign('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Acesso restrito</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Confere Relatório</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Informe a senha de acesso fornecida pelo administrador.</p>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Senha
          <input autoComplete="current-password" type="password" required maxLength={256} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button disabled={loading || !password} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800 disabled:bg-slate-300">{loading ? 'Validando...' : 'Entrar'}</button>
      </form>
    </main>
  );
}
