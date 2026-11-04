/**
 * Lote A4 (v10.7) — quem pode importar quem.
 *
 * Sem navegador: lê os `import` de `editor/src/**` com `node:fs`. A regra está
 * escrita no cabeçalho de `contract.ts`: um degrau importa o próprio e os de
 * baixo, nunca os de cima. Vermelho aqui quer dizer que a mudança está na parte
 * errada — é a regra 18 da casa.
 *
 *   0  contract.ts, ui/dom.ts     1  doc/, anim/, mesh/     2  io/
 *   3  viewport/, panels/, ui/    4  ui/shell*.ts, main.ts
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(__dirname, '../src');

/** Todo `.ts` debaixo de uma pasta. */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.ts')) out.push(full);
  }
  return out;
}

const barra = (caminho: string): string => caminho.split('\\').join('/');

interface Importacao { de: string; para: string }

/** Cada importação de um arquivo do editor para outro, com os caminhos a partir de `src/`. */
const IMPORTACOES: Importacao[] = walk(SRC).flatMap((file) => {
  const de = barra(relative(SRC, file));
  // `env.d.ts` só declara os tipos de `*.css` e `*.bone`: não importa nada.
  if (de === 'env.d.ts') return [];
  const texto = readFileSync(file, 'utf8');
  return [...texto.matchAll(/(?:from|import)\s*'(\.[^'?]+)/g)]
    .map((m) => barra(relative(SRC, resolve(dirname(file), m[1]!))).replace(/\.js$/, '.ts'))
    .filter((para) => !para.startsWith('..'))
    .map((para) => ({ de, para }));
});

/** O degrau de um arquivo. */
function degrau(rel: string): number {
  if (rel === 'contract.ts' || rel === 'ui/dom.ts') return 0;
  if (rel === 'main.ts' || /^ui\/shell[^/]*\.ts$/.test(rel)) return 4;
  const pasta = rel.split('/')[0];
  if (pasta === 'doc' || pasta === 'anim' || pasta === 'mesh') return 1;
  if (pasta === 'io') return 2;
  if (pasta === 'viewport' || pasta === 'panels' || pasta === 'ui') return 3;
  return 9;
}

/** As importações que sobem de degrau, saindo de uma pasta. */
function contra(prefixo: string): string[] {
  return IMPORTACOES
    .filter(({ de }) => de === prefixo || de.startsWith(`${prefixo}/`))
    .filter(({ de, para }) => degrau(para) > degrau(de))
    .map(({ de, para }) => `${de} → ${para}`);
}

describe('fronteiras: ninguém importa quem está acima', () => {
  it('lê importações de verdade (sanidade)', () => {
    expect(IMPORTACOES.length).toBeGreaterThan(500);
    expect(IMPORTACOES).toContainEqual({ de: 'doc/reparent.ts', para: 'doc/world-math.ts' });
  });

  it('contract.ts e ui/dom.ts não importam nada do editor', () => {
    expect(contra('contract.ts')).toEqual([]);
    expect(IMPORTACOES.filter(({ de }) => de === 'contract.ts' || de === 'ui/dom.ts')).toEqual([]);
  });

  it('doc/ só importa o contrato e a base', () => {
    expect(contra('doc')).toEqual([]);
  });

  it('anim/ só importa o contrato e a base', () => {
    expect(contra('anim')).toEqual([]);
  });

  it('mesh/ só importa o contrato e a base', () => {
    expect(contra('mesh')).toEqual([]);
  });

  it('io/ não importa cena, painel nem interface (o `el` de ui/dom.ts é de todos)', () => {
    expect(contra('io')).toEqual([]);
  });

  it('viewport/ e panels/ não importam a casca', () => {
    expect([...contra('viewport'), ...contra('panels')]).toEqual([]);
  });

  it('ui/ (os serviços) não importa a casca', () => {
    expect(contra('ui').filter((linha) => !/^ui\/shell/.test(linha))).toEqual([]);
  });

  it('o painel da cena, só o main.ts, pelo index; a casca, ninguém', () => {
    const cena = IMPORTACOES
      .filter(({ para }) => para === 'viewport/viewport.ts')
      .filter(({ de }) => !de.startsWith('viewport/'))
      .map(({ de }) => de);
    expect(cena).toEqual([]);
    const casca = IMPORTACOES
      .filter(({ para }) => /^ui\/shell[^/]*\.ts$/.test(para) || para === 'main.ts')
      .filter(({ de }) => de !== 'main.ts' && !/^ui\/shell/.test(de))
      .map(({ de, para }) => `${de} → ${para}`);
    expect(casca).toEqual([]);
  });

  it('o `el` existe uma vez só, em ui/dom.ts', () => {
    const com = walk(SRC)
      .filter((file) => /\bfunction el\s*</.test(readFileSync(file, 'utf8')))
      .map((file) => barra(relative(SRC, file)));
    expect(com).toEqual(['ui/dom.ts']);
  });
});
