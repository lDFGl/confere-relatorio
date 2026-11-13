import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionToken, isValidSession, passwordMatches } from '../lib/auth';

test('valida uma sessão assinada e rejeita token adulterado', () => {
  process.env.SESSION_SECRET = 'test-secret-with-at-least-thirty-two-characters';
  const token = createSessionToken();
  assert.equal(isValidSession(token), true);
  assert.equal(isValidSession(token + 'x'), false);
  assert.equal(isValidSession(''), false);
});

test('compara a senha configurada sem aceitar valor incorreto', () => {
  process.env.APP_ACCESS_PASSWORD = 'senha-de-teste-forte';
  assert.equal(passwordMatches('senha-de-teste-forte'), true);
  assert.equal(passwordMatches('senha-errada'), false);
});
