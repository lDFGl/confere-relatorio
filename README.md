# Confere Relatório

Plataforma web com IA para revisar e refazer relatórios de auditoria interna com base em:

- normas e legislações aplicáveis
- evidências e dados adicionais enviados pelo usuário
- contexto operacional e riscos do processo auditado

## Objetivo

A solução permite ao usuário enviar um relatório, selecionar os critérios normativos e complementar com informações relevantes, e receber uma revisão técnica com:

- resumo executivo
- status de conformidade
- achados
- recomendações
- texto revisado e reescrito

## Stack sugerida

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: API Routes do Next.js
- IA: integração com OpenAI / Anthropic / Azure OpenAI
- Armazenamento: PostgreSQL + Supabase ou Neon
- Uploads: PDF / DOCX / TXT
- Exportação: PDF, DOCX e HTML

## Estrutura do MVP

```bash
app/
  api/
    review/
      route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  report-form.tsx
lib/
  review-engine.ts
```

## Como executar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Observação importante

Este MVP já possui uma engine de revisão local, pronta para ser substituída por uma integração real com IA quando houver a chave da API do provedor escolhido.

## Próximos passos sugeridos

1. Conectar com OpenAI ou Anthropic
2. Implementar upload de arquivos PDF/DOCX
3. Persistir projetos e histórico de versões
4. Gerar relatório final em formato Word/PDF
5. Adicionar autenticação e segregação por usuário

## Melhorias futuras

- painel analítico por processo, unidade e risco
- checklist de conformidade por norma
- comparação entre versão original e revisada
- auditoria de aprovação e rastreabilidade de alterações
