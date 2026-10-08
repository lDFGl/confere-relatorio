import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Confere Relatório',
  description: 'IA para revisão e reescrita de relatórios de auditoria interna',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
