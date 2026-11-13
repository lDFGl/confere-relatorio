# Confere Relatório

Assistente de IA para revisão técnica e conferência cruzada de relatórios de auditoria interna, com referência a modelos institucionais aprovados e documentos de evidência.

## Funcionalidades

- Recebe relatórios, modelos aprovados e evidências por upload.
- Extrai texto de PDF digital, DOCX, TXT, MD, CSV, XLSX e XLS.
- Analisa estrutura, linguagem, coerência e consistência técnica.
- Compara o relatório com modelos, procedimentos, contratos, medições e planilhas anexados.
- Sinaliza divergências, lacunas de rastreabilidade, cálculos inconsistentes e pontos normativos a confirmar.
- Produz diagnóstico, achados, recomendações e minuta revisada.
- Confere fórmulas SUM simples e exporta a minuta revisada para DOCX.
- Exige senha de acesso e sessão assinada antes de permitir a aplicação ou a API de análise.

## Tipos e limites de arquivos

Formatos aceitos: PDF, DOCX, XLSX, XLS, CSV, TXT e MD.

- Até 15 MB por arquivo.
- Até 12 arquivos por revisão.
- Até 40 MB no conjunto.
- Até 60.000 caracteres extraídos por arquivo e 180.000 caracteres por análise.
- PDFs digitalizados sem camada textual precisam passar por OCR antes do envio.
- Imagens avulsas, DOC antigo, PPT/PPTX e arquivos protegidos por senha não são suportados nesta etapa.

**Atenção à hospedagem:** esses limites são limites da aplicação, não garantias da plataforma. A Vercel documenta limite de 4,5 MB para o corpo de requisições de Functions; portanto, o upload atual de até 40 MB não funciona integralmente nesse ambiente. Não aumente o limite na interface sem adotar upload direto para armazenamento privado ou um servidor que suporte o tamanho necessário.

## Configuração local

Requisitos: Node.js 20+ e chave de API da OpenAI.

1. Instale dependências: `npm install`.
2. Copie `.env.example` para `.env.local`.
3. Preencha as variáveis:
   ```env
   OPENAI_API_KEY=sua_chave
   OPENAI_MODEL=gpt-4.1-mini
   APP_ACCESS_PASSWORD=uma-senha-longa-e-exclusiva
   SESSION_SECRET=gere-um-segredo-aleatorio-com-pelo-menos-32-caracteres
   ```
4. Execute `npm run dev`.
5. Acesse `http://localhost:3000` e entre com a senha definida em `APP_ACCESS_PASSWORD`.

Gere o segredo de sessão com um gerador criptograficamente seguro (por exemplo, `openssl rand -base64 48`). Não reutilize a senha da conta corporativa. Não envie `.env.local` ao GitHub.

## Segurança implementada nesta fase

- Tela de login com senha configurada exclusivamente no servidor.
- Cookie de sessão assinado com HMAC, HttpOnly, SameSite=Strict, Secure em produção e validade de 8 horas.
- A página principal e o endpoint de análise validam a sessão; não basta ocultar a interface.
- Verificação de origem nos endpoints de login e logout.
- Cabeçalhos HTTP: nosniff, frame denial, referrer policy, permissions policy e HSTS.
- Chave da OpenAI mantida no servidor; não usar prefixo NEXT_PUBLIC_.
- Respostas de análise configuradas para não serem armazenadas em cache.
- Nenhuma biblioteca permanente, histórico ou banco de documentos nesta versão.

**Limitações de segurança que permanecem:** o login usa uma senha compartilhada, sem contas individuais, MFA, trilha de auditoria ou bloqueio distribuído de tentativas. A limitação de tentativas em memória não foi implementada porque não seria confiável em ambiente serverless. Para uso corporativo, substitua esse acesso por SSO/OIDC ou autenticação gerenciada, aplique rate limiting persistente e controle de acesso por usuário/grupo.

## Tratamento de dados e confidencialidade

Os arquivos são recebidos e extraídos no servidor e o texto extraído é enviado à API da OpenAI para análise. A aplicação não grava os documentos em banco ou armazenamento permanente nesta versão, mas isso **não significa ausência de tratamento ou retenção por terceiros**:

- A OpenAI informa que dados enviados pela API não são usados para treinar modelos por padrão; logs de monitoramento de abuso podem conter conteúdo e ser retidos por até 30 dias, salvo exceções legais ou de segurança. Verifique os controles e termos vigentes da conta.
- A hospedagem processa as requisições e pode manter metadados operacionais/logs. Não habilite logging de corpo, prompts, respostas ou conteúdo de arquivos.
- Não envie documentos classificados, dados pessoais, dados bancários, informações estratégicas ou conteúdo protegido por sigilo sem aprovação formal de Segurança da Informação, Jurídico/Privacidade e do responsável pelo dado.
- Use dados anonimizados para testes.
- Configure limites de gasto e alertas na conta da OpenAI; a hospedagem gratuita não torna o uso da API gratuito.

A senha compartilhada é uma barreira básica para um MVP, não uma solução de segurança corporativa. Não publique este app abertamente nem o trate como ambiente aprovado para documentos reais sem avaliação formal de risco, LGPD, contratos com fornecedores e controles de acesso.

## CI e validação

O GitHub Actions executa lint, testes automatizados e build. A aprovação do PR depende de todos os três passos passarem. A validação matemática cobre somente SUM de intervalo vertical simples; fórmulas não suportadas devem ser apresentadas como não validadas, nunca como erro confirmado.

## Próximas evoluções recomendadas

1. Trocar a senha compartilhada por autenticação corporativa (SSO/MFA) e autorização por perfil.
2. Rate limiting persistente, monitoramento e trilha de auditoria sem conteúdo sensível.
3. Manter SheetJS na distribuição oficial 0.20.3 (não usar o pacote npm desatualizado 0.18.5) e executar auditoria recorrente das dependências.
4. OCR para PDF digitalizado e imagens.
5. Biblioteca de modelos e normas com versionamento e aprovação.
6. Histórico controlado, política de retenção e exclusão verificável.
7. Exportação DOCX preservando estilos e tabelas do documento original.

## Stack

Next.js 15, React 19, TypeScript, Tailwind CSS, Mammoth, pdf-parse, SheetJS e integração server-side com a API da OpenAI.
