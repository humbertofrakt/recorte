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

describe('QA 04/11/2026 — a pergunta errada sai com 2 em todas', () => {
  // A prova: `empacotar`, `exportar`, `exportar-imagem`, `fatiar` e
  // `render-png` saíam com 1 numa opção que não existe (o 1 é do erro do
  // trabalho: arquivo que não abre, animação que não há); `importar`,
  // `importar-psd` e o `npm run` de quem chama esperam 2. E `empacotar` sem
  // caminho saía com 1, os outros com 2.
  const HEROI = join(EXEMPLOS, 'heroi.bone');
  const casos: Array<[string, string[]]> = [
    ['ferramentas/empacotar.mjs', [EXEMPLOS, 'x', '--bobagem']],
    ['ferramentas/exportar.mjs', [HEROI, 'x.glb', '--bobagem']],
    ['ferramentas/exportar-imagem.mjs', [HEROI, 'walk', 'x', '--bobagem']],
    ['ferramentas/fatiar.mjs', [HEROI, 'x', '--bobagem']],
    ['ferramentas/render-png.mjs', ['walk', '0', 'x.png', '--bobagem']],
  ];
  for (const [script, args] of casos) {
    it(`${script.split('/').pop()}: opção errada → 2, e diz qual`, () => {
      const r = rodar(script, args);
      expect(r.codigo).toBe(2);
      expect(r.erro).toMatch(/opção desconhecida: --bobagem/);
    });
  }

  it('empacotar sem caminho: o uso, e 2', () => {
    expect(rodar('ferramentas/empacotar.mjs', []).codigo).toBe(2);
  });

  it('o erro do trabalho continua 1: fatiar com animação que não há, e diz quais há', () => {
    const r = rodar('ferramentas/fatiar.mjs', [join(EXEMPLOS, 'mecha-animacoes.bone'), join(tmpdir(), 'fatia-x'), '--animacoes', 'andar']);
    expect(r.codigo).toBe(1);
    expect(r.erro).toMatch(/não achei a animação "andar" no arquivo; há: walk, attack, falar/);
  });
});
