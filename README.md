# Confere Relatório

Assistente de IA para revisão técnica e conferência cruzada de relatórios de auditoria interna, com referência a modelos institucionais aprovados e documentos de evidência.

## Funcionalidades

- Recebe relatórios, modelos aprovados e evidências por upload.
- Extrai texto de PDF digital, DOCX, TXT, MD, CSV, XLSX e XLS.
- Analisa estrutura, linguagem, coerência e consistência técnica.
- Compara o relatório com modelos, procedimentos, contratos, medições e planilhas anexados.
- Sinaliza divergências, lacunas de rastreabilidade, cálculos inconsistentes e pontos normativos a confirmar.
- Produz diagnóstico, achados, recomendações e minuta revisada.

## Tipos e limites de arquivos

Formatos aceitos: PDF, DOCX, TXT, MD, CSV, XLSX e XLS.

- Até 15 MB por arquivo.
- Até 12 arquivos por revisão.
- Até 40 MB no conjunto.
- Até 60.000 caracteres extraídos por arquivo e 180.000 caracteres por análise.
- PDFs digitalizados como imagem (sem camada de texto) não são lidos nesta versão; precisam passar por OCR antes do envio.
- Imagens avulsas, DOC antigo, PPT/PPTX e arquivos protegidos por senha não são suportados nesta etapa.

O relatório principal, os modelos e as evidências devem ser enviados nas respectivas áreas. Também é possível complementar com texto digitado ou colado.

## Configuração

Requisitos: Node.js 20+ e uma chave de API da OpenAI.

1. Instale as dependências: \`npm install\`
2. Crie um arquivo \`.env.local\` na raiz:
   \`\`\`env
   OPENAI_API_KEY=sua_chave
   OPENAI_MODEL=gpt-4.1-mini
   \`\`\`
3. Execute: \`npm run dev\`
4. Acesse \`http://localhost:3000\`

Na hospedagem, configure \`OPENAI_API_KEY\` e opcionalmente \`OPENAI_MODEL\` nas variáveis de ambiente do servidor. Nunca coloque a chave no código do navegador, no repositório ou em variáveis \`NEXT_PUBLIC_*\`.

A hospedagem precisa executar Next.js com runtime Node.js e permitir requisições multipart com tamanho compatível com os limites acima. Plataformas serverless podem impor limites de requisição menores; nesses ambientes, ajuste os limites ou implemente upload direto para armazenamento privado.

## Como usar os modelos de referência

Anexe um ou mais relatórios já aprovados na seção "Modelo(s) institucional(is) aprovado(s)". A IA usará esses arquivos para aprender estrutura, sequência, nomenclatura e linguagem, sem transportar dados ou conclusões do modelo para o relatório atual.

Nesta versão, os arquivos são processados durante a requisição e não são mantidos em uma biblioteca permanente pela aplicação. A biblioteca institucional com versões, aprovação, classificação por tipo de auditoria e seleção automática é uma evolução futura.

## Segurança e governança

- O conteúdo é extraído no servidor e enviado à API da OpenAI para análise; não é salvo em banco de dados pela aplicação nesta versão.
- Antes de enviar, verifique se a política interna permite compartilhar os documentos com o provedor de IA e remova dados pessoais ou sigilosos desnecessários.
- A IA não substitui a validação do auditor.
- Informar uma norma no formulário não comprova sua vigência ou aplicabilidade.
- A ferramenta não verifica autenticidade de assinaturas, integridade criptográfica ou validade jurídica dos documentos.
- Para revisão normativa conclusiva, forneça os textos oficiais, versões e procedimentos internos pertinentes.
- O conteúdo dos documentos é tratado como evidência, não como instrução para o assistente.

## Próximas evoluções recomendadas

1. OCR para PDF digitalizado e imagens.
2. Biblioteca permanente de modelos e normas, com controle de versão e aprovação.
3. Exportação da versão revisada para DOCX, preservando estilos e tabelas do documento original.
4. Histórico de revisões e registro de feedback aprovado pelo auditor.

## Stack

Next.js 14, React 18, TypeScript, Tailwind CSS, Mammoth (DOCX), pdf-parse (PDF), SheetJS (planilhas) e integração server-side com a API da OpenAI.
