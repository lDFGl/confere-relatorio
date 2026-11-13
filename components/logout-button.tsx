'use client';

export default function LogoutButton() {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', cache: 'no-store' });
    window.location.assign('/login');
  }
  return <button type="button" onClick={logout} className="rounded-xl border border-white/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Sair</button>;
}
