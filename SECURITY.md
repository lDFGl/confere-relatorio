# Segurança

## Comunicação responsável de vulnerabilidades

Não publique detalhes de vulnerabilidades, credenciais, tokens, documentos de auditoria ou dados pessoais em Issues ou Pull Requests públicos.

Para comunicar um problema, utilize o recurso **Private vulnerability reporting** do GitHub, caso esteja habilitado no repositório. Se o recurso não estiver disponível, entre em contato diretamente com o mantenedor por um canal privado.

## Regras para uso da aplicação

- Nunca armazene `OPENAI_API_KEY`, `APP_ACCESS_PASSWORD` ou `SESSION_SECRET` no código, em commits, Issues ou arquivos versionados.
- Cadastre segredos somente nas variáveis de ambiente do ambiente de execução ou em GitHub Actions Secrets quando estritamente necessário para automações.
- Não envie documentos sigilosos, dados pessoais ou informações corporativas reais a ambientes de teste sem autorização formal do responsável pelos dados e das áreas de Segurança da Informação e Privacidade.
- Utilize arquivos anonimizados para testes e evite registrar conteúdo de documentos em logs.
- A autenticação por senha compartilhada disponível nesta versão é uma proteção inicial de MVP; não substitui SSO, MFA, gestão individual de usuários, limitação persistente de tentativas ou trilha de auditoria.

## Escopo

Este projeto é fornecido como ferramenta de apoio à revisão. As análises geradas por IA devem ser validadas por profissional responsável antes de qualquer uso oficial.
