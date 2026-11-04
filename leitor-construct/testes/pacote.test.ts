// SPDX-License-Identifier: Apache-2.0
/**
 * O pacote do leitor do Construct (rodada K1, itens 2 e 3).
 *
 * Os casos de `conformidade/casos/` sobre o pacote rodam fora daqui, pelo executor
 * da casa: `npm run leitor:construct:conformidade` (cada caso é um processo; a
 * suíte do Vitest não os repete). Aqui fica o que o executor não vê: que o
 * pacote é o runtime INTEIRO menos o canvas, que ele se instala sozinho em
 * `globalThis.RecorteRuntime`, e que a escrita é a que o Construct aceita.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';
// @ts-expect-error -- módulo .mjs sem tipos
import { pacoteEmMemoria } from '../montar.mjs';

const LEITOR = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAIZ = join(LEITOR, '..');
const PACOTE = join(LEITOR, 'addon', 'c3runtime', 'recorte-runtime.js');
const PROVA = join(LEITOR, 'saida', 'prova', 'pose-dump.mjs');

/** Os módulos que um arquivo reexporta ou importa por efeito, sem a pasta. */
function modulos(arquivo: string, prefixo: string): Set<string> {
  const texto = readFileSync(arquivo, 'utf8');
  const saida = new Set<string>();
  for (const m of texto.matchAll(/^(?:export \*|import|export \{[^}]*\}) (?:from )?'([^']+)';/gms)) {
    if (m[1].startsWith(prefixo)) saida.add(m[1].slice(prefixo.length));
  }
  return saida;
}

describe('o pacote no disco é o do código de agora', () => {
  it('montado de novo na memória, sai igual ao arquivo que vai no addon (senão: npm run leitor:construct)', async () => {
    const agora = (await pacoteEmMemoria()).replace(/\r\n/g, '\n');
    expect(readFileSync(PACOTE, 'utf8').replace(/\r\n/g, '\n') === agora).toBe(true);
  });
});

describe('o pacote é o runtime inteiro, menos o desenho em Canvas', () => {
  it('todo módulo que o runtime/src/index.ts traz, o pacote traz; só o render/canvas fica de fora', () => {
    const doIndex = modulos(join(RAIZ, 'runtime', 'src', 'index.ts'), './');
    const doPacote = modulos(join(LEITOR, 'src', 'pacote.ts'), '../../runtime/src/');
    const faltam = [...doIndex].filter((m) => !doPacote.has(m));
    expect(faltam).toEqual(['render/canvas.js']);
  });

  it('nenhum módulo do pacote importa o render/canvas, nem toca no DOM', () => {
    const texto = readFileSync(PACOTE, 'utf8');
    expect(texto).not.toMatch(/class CanvasRenderer/);
    expect(texto).not.toMatch(/\bdocument\./);
    expect(texto).not.toMatch(/getContext\(/);
  });
});

/** O que o Construct ainda não aceita (escrita depois do ES2021), achado no texto. */
function depoisDoEs2021(texto: string): string[] {
  const fonte = ts.createSourceFile('x.js', texto, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);
  const achados: string[] = [];
  const visitar = (no: ts.Node): void => {
    if (ts.isPropertyDeclaration(no)) achados.push(`campo ${no.name.getText(fonte)}`);
    if (ts.isClassStaticBlockDeclaration(no)) achados.push('bloco estático');
    if (ts.isPrivateIdentifier(no)) achados.push(`privado ${no.text}`);
    ts.forEachChild(no, visitar);
  };
  visitar(fonte);
  return achados;
}

describe('o arquivo do pacote', () => {
  const texto = readFileSync(PACOTE, 'utf8');

  it('o detector pega o que tem de pegar (regra 26: antes de provar o verde, ver o vermelho)', () => {
    expect(depoisDoEs2021('class A { x = 1; static { } #y = 2; }')).toEqual(['campo x', 'bloco estático', 'campo #y', 'privado #y']);
    expect(depoisDoEs2021('class A { constructor() { this.x = 1; } }')).toEqual([]);
  });

  it('é ES2021: sem campo de classe, sem bloco estático, sem nome #privado (o Construct ainda não aceita)', () => {
    expect(depoisDoEs2021(texto).slice(0, 5)).toEqual([]);
  });

  it('é um script comum: sem import nem export no nível de cima', () => {
    expect(texto).not.toMatch(/^(import|export)\b/m);
    expect(texto).toMatch(/globalThis\.RecorteRuntime = RecorteRuntime;\s*$/);
  });
});

describe('o pacote rodando no Node', () => {
  let R: any;
  beforeAll(async () => {
    await import(pathToFileURL(PACOTE).href);
    R = (globalThis as any).RecorteRuntime;
  });

  it('deixa o runtime em globalThis.RecorteRuntime, com o leitor e o desenhador juntos', () => {
    for (const nome of ['loadSkeletonFile', 'loadAtlas', 'Skeleton', 'AnimationState', 'collectDrawables',
      'IkConstraint', 'PhysicsConstraint', 'ParticleAttachment', 'MeshAttachment',
      'pecasDoQuadro', 'montarLotes', 'paraConstruct', 'carregarBoneco', 'Tocador']) {
      expect(R[nome], nome).toBeDefined();
    }
    expect(R.CanvasRenderer).toBeUndefined();
  });

  it('as regras reais estão instaladas (o efeito colateral dos imports não se perdeu)', () => {
    // Sem os imports por efeito do index.ts, o createConstraint cai no "noop".
    expect(R.createConstraint).toBeDefined();
    const nomes = ['IkConstraint', 'TransformConstraint', 'PathConstraint', 'PhysicsConstraint', 'DriverConstraint'];
    for (const n of nomes) expect(typeof R[n], n).toBe('function');
  });

  it('a prova dos casos de conformidade não leva uma segunda cópia do runtime: lê tudo do pacote', () => {
    const prova = readFileSync(PROVA, 'utf8');
    expect(prova).toContain('globalThis.RecorteRuntime');
    expect(prova).not.toMatch(/class (Skeleton|MeshAttachment|RegionAttachment|Bone)\b/);
  });
});
