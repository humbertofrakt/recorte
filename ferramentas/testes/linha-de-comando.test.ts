// SPDX-License-Identifier: Apache-2.0
/**
 * A linha de comando, de fora: cada `npm run …` com `--ajuda`, sem nada, com
 * uma opção que não existe e com um caso real — QA da noite de 04/11/2026
 * (`documentos/projeto do programa/noite/qa-arquivo.md`).
 *
 * A régua: **a ajuda sai com 0; a pergunta errada sai com 2 e diz o que
 * errou; o erro do trabalho sai com 1.** Opção que o programa não conhece
 * nunca passa calada (regra 21): `validar --help` validava os exemplos, e
 * `converter --qualquer` convertia como se nada.
 */
import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const RAIZ = resolve(__dirname, '..', '..');
const EXEMPLOS = join(RAIZ, 'formato', 'exemplos');

function rodar(script: string, args: string[]): { codigo: number | null; saida: string; erro: string } {
  const r = spawnSync(process.execPath, [join(RAIZ, script), ...args], { encoding: 'utf8', timeout: 60_000 });
  return { codigo: r.status, saida: r.stdout, erro: r.stderr };
}

describe('validar: a ajuda e a opção errada', () => {
  const VALIDAR = 'ferramentas/validador/validar.mjs';

  it('--help e --ajuda mostram o uso, saem com 0 e NÃO validam os exemplos', () => {
    for (const pedido of ['--help', '--ajuda']) {
      const r = rodar(VALIDAR, [pedido]);
      expect(r.codigo).toBe(0);
      expect(r.saida).toMatch(/Uso:/);
      expect(r.saida).not.toMatch(/^OK /m);
    }
  });

  it('uma opção que não existe para com 2 e diz qual era', () => {
    const r = rodar(VALIDAR, ['--bobagem', join(EXEMPLOS, 'heroi.bone')]);
    expect(r.codigo).toBe(2);
    expect(r.erro).toMatch(/opção desconhecida: --bobagem/);
    expect(r.saida).not.toMatch(/^OK /m);
  });

  it('as opções de sempre continuam valendo', () => {
    const r = rodar(VALIDAR, ['--json', join(EXEMPLOS, 'heroi.bone')]);
    expect(r.codigo).toBe(0);
    expect(JSON.parse(r.saida).validos).toBe(1);
  });
});

describe('converter: a ajuda, a falta e a opção errada', () => {
  const CONVERTER = 'ferramentas/converter.mjs';

  it('--ajuda sai com 0; sem caminho nenhum é pergunta errada: uso e 2', () => {
    const ajuda = rodar(CONVERTER, ['--ajuda']);
    expect(ajuda.codigo).toBe(0);
    expect(ajuda.saida).toMatch(/Converter arquivos/);
    const nada = rodar(CONVERTER, []);
    expect(nada.codigo).toBe(2);
    expect(nada.erro).toMatch(/Converter arquivos/);
  });

  it('uma opção que não existe para com 2, sem gravar nada', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'conv-'));
    try {
      const r = rodar(CONVERTER, ['--bobagem', join(EXEMPLOS, 'heroi.bone'), join(pasta, 'h.boneb')]);
      expect(r.codigo).toBe(2);
      expect(r.erro).toMatch(/opção desconhecida: --bobagem/i);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });

  it('a tabela fala português com acento: Saída, Redução', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'conv-'));
    try {
      const r = rodar(CONVERTER, [join(EXEMPLOS, 'heroi.bone'), join(pasta, 'h.boneb')]);
      expect(r.codigo).toBe(0);
      expect(r.saida).toMatch(/Saída/);
      expect(r.saida).toMatch(/Redução/);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });
});
