import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReportForm from '@/components/report-form';
import LogoutButton from '@/components/logout-button';
import { isValidSession, SESSION_COOKIE } from '@/lib/auth';

export default async function Home() {
  const cookieStore = await cookies();
  if (!isValidSession(cookieStore.get(SESSION_COOKIE)?.value)) redirect('/login');

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Confere Relatório</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">IA para revisão e refacção de auditorias internas</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-blue-300 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100">Acesso restrito</div>
              <LogoutButton />
            </div>
          </div>
        </header>
        <ReportForm />
      </div>
    </main>
  );
}
