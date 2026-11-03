# Confere Relatório

Assistente de IA para revisão técnica de relatórios de auditoria interna, com preservação de modelos institucionais aprovados.

## O que faz

- Analisa estrutura, linguagem, coerência e consistência técnica do relatório.
- Usa um relatório aprovado como referência de estrutura e estilo.
- Relaciona achados, evidências, riscos, critérios e recomendações.
- Preserva fatos, valores, datas e referências fornecidos.
- Sinaliza lacunas, contradições e pontos normativos que exigem confirmação.
- Produz diagnóstico e minuta revisada.

## Configuração

Requisitos: Node.js 20+ e uma chave de API da OpenAI.

1. Instale as dependências: `npm install`
2. Crie um arquivo `.env.local` na raiz:
   ```env
   OPENAI_API_KEY=sua_chave
   OPENAI_MODEL=gpt-4.1-mini
   ```
3. Execute: `npm run dev`
4. Acesse `http://localhost:3000`

Na hospedagem, configure `OPENAI_API_KEY` e opcionalmente `OPENAI_MODEL` nas variáveis de ambiente do servidor. Nunca coloque a chave no código do navegador, no repositório ou em variáveis `NEXT_PUBLIC_*`.

## Como usar o modelo de referência

Cole no campo "Modelo institucional aprovado" o conteúdo de um relatório já validado. A IA deve usar esse material para reproduzir estrutura, sequência, nomenclatura e linguagem, sem transportar dados ou conclusões do documento de referência para o novo trabalho.

Nesta versão, a referência é enviada junto com cada revisão e não fica armazenada como memória permanente. O armazenamento de uma biblioteca institucional de modelos, com versões, aprovação e seleção por tipo de auditoria, é uma próxima etapa.

## Limites e governança

- A IA não substitui a validação do auditor.
- Informar uma norma no formulário não comprova sua vigência ou aplicabilidade.
- A ferramenta não deve inventar artigos, requisitos, evidências ou cálculos.
- Para revisão normativa conclusiva, forneça os textos oficiais, versões e procedimentos internos pertinentes.
- Evite inserir dados pessoais ou informações confidenciais que não sejam necessários à análise.

## Stack

Next.js 14, React 18, TypeScript, Tailwind CSS e integração server-side com a API da OpenAI.
