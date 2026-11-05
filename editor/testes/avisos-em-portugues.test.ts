/**
 * Os avisos do leitor chegam à tela em português — noite de 05/11/2026.
 *
 * A lista NÃO é copiada à mão: o teste lê `runtime/src/loader.ts`,
 * `runtime/src/curve.ts` e `runtime/src/uri.ts`, acha cada frase de aviso no
 * código, preenche os `${…}` com um valor de exemplo e passa por
 * `translateWarning`. Frase nova no leitor sem tradução: vermelho, com a frase.
 *
 * Três réguas por frase:
 * 1. ela muda (não volta igual, em inglês);
 * 2. não sobra palavra inglesa fora de aspas e de parênteses;
 * 3. não sobra palavra de programador fora de parênteses (`ui/jargao.ts`).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { translateWarning } from '../src/panels/warning-model.js';
import { jargaoNaFrase } from '../src/ui/jargao.js';

const RAIZ = process.cwd();
const ler = (arquivo: string): string => readFileSync(join(RAIZ, 'runtime', 'src', arquivo), 'utf8');

/** O texto de cada argumento de cada chamada a `nomeDaChamada(`, com parênteses e textos balanceados. */
function argumentos(src: string, chamada: RegExp): string[][] {
  const out: string[][] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(chamada.source, 'g');
  while ((m = re.exec(src)) !== null) {
    let i = re.lastIndex;
    let fundo = 1;
    const args: string[] = [];
    let atual = '';
    while (i < src.length && fundo > 0) {
      const c = src[i]!;
      if (c === '`' || c === "'" || c === '"') {
        let j = i + 1;
        let dentro = 0;
        while (j < src.length) {
          if (src[j] === '\\') { j += 2; continue; }
          if (c === '`' && src[j] === '$' && src[j + 1] === '{') { dentro++; j += 2; continue; }
          if (c === '`' && dentro > 0 && src[j] === '}') { dentro--; j++; continue; }
          if (src[j] === c && dentro === 0) break;
          j++;
        }
        atual += src.slice(i, j + 1);
        i = j + 1;
        continue;
      }
      if (c === '(' || c === '[' || c === '{') fundo++;
      if (c === ')' || c === ']' || c === '}') { fundo--; if (fundo === 0) break; }
      if (c === ',' && fundo === 1) { args.push(atual.trim()); atual = ''; i++; continue; }
      atual += c;
      i++;
    }
    if (atual.trim() !== '') args.push(atual.trim());
    out.push(args);
  }
  return out;
}

/** Os textos literais de um argumento ('…' ou `…`), um por ramo de um `? :`. */
function literais(arg: string): string[] {
  const out: string[] = [];
  const re = /`((?:[^`\\]|\\.|\$\{[^}]*\})*)`|'((?:[^'\\]|\\.)*)'/g;
  let m: RegExpExecArray | null;
  // Um literal DENTRO de `${…}` não é ramo: tira-se o miolo dos `${}` antes.
  const fora = arg.replace(/\$\{[^}]*\}/g, (s) => s.replace(/['`]/g, '§'));
  while ((m = re.exec(fora)) !== null) out.push((m[1] ?? m[2])!.replace(/§/g, "'"));
  return out;
}

/** Os problemas de endereço de `uri.ts`, preenchidos. */
const PROBLEMAS = literais(argumentos(ler('uri.ts'), /\breturn\s*\(/).flat().join(' ') + ' '
  + (ler('uri.ts').match(/return [`'][^\n]*[`'];/g) ?? []).join(' '))
  .map((t) => preencher(t, null))
  .filter((t) => t.startsWith('uri '));

/** Troca cada `${…}` por um valor de exemplo. */
function preencher(t: string, problema: string | null): string {
  return t.replace(/\$\{([^}]*)\}/g, (_s, expr: string) => {
    if (expr.trim() === 'message') return 'required extensions not supported: x1';
    if (expr.trim() === 'problem') return problema ?? 'uri is absolute; it must be relative (spec 2.8 rule 1)';
    const q = /'([^']*)'/.exec(expr);
    return q !== null ? q[1]! : 'x1';
  }).replace(/\\(["'`\\])/g, '$1');
}

/** Todas as frases de aviso do leitor, prontas para traduzir. */
function frasesDoLeitor(): string[] {
  const frases = new Set<string>();
  const loader = ler('loader.ts');
  const juntar = (lista: string[][], prefixo: string): void => {
    for (const args of lista) {
      const ultimo = args[args.length - 1]!;
      for (const lit of literais(ultimo)) {
        // Os embrulhos (`${code}: ${message}`) recebem as frases de `missingTarget`, já contadas abaixo.
        if (/^(?:\$\{code\}|TARGET_MISSING): \$\{message\}$/.test(lit)) continue;
        const variantes = lit.includes('${problem}') ? PROBLEMAS : [null];
        for (const p of variantes) frases.add(prefixo + preencher(lit, p));
      }
    }
  };
  juntar(argumentos(loader, /\b(?:ctx|b\.ctx|this)\.(?:warn|issue)\(/), '');
  juntar(argumentos(loader, /\bmissingTarget\(\s*b\s*,/), 'TARGET_MISSING: ');
  juntar(argumentos(ler('curve.ts'), /\bwarn\?\.\(/), '');
  return [...frases];
}

const INGLES = /\b(?:the|is|are|must|ignored|using|not|does|exist|expected|unknown|needs?|treated|clamped|truncated|outside|duplicate|required|allowed|cannot|got|has|of|and|with|reader|file|bone|skin|key|keys|empty|only|least|one|every|each|number|numbers)\b/i;

/** O que sobra depois de tirar o que está entre aspas, crases e parênteses. */
function solto(texto: string): string {
  let t = texto.replace(/"[^"]*"/g, ' ').replace(/`[^`]*`/g, ' ');
  for (let i = 0; i < 2; i++) t = t.replace(/\([^()]*\)/g, ' ');
  return t;
}

/**
 * As frases antigas, presas letra por letra por `acabamento.test.ts`, que ainda
 * dizem "atlas" e "skin"/"slot" fora de parênteses. Dívida com dono: a parte
 * do editor que é dona desses testes.
 */
const PRESAS = [/não está em nenhum atlas/];

describe('os avisos do leitor chegam em português (lista viva de runtime/src)', () => {
  const frases = frasesDoLeitor();

  it('a lista foi tirada do código, e não está vazia', () => {
    // Em 05/11/2026: 179 frases no loader, 7 de curva, 9 problemas de endereço.
    // Se este número despencar, o extrator quebrou, e o resto do teste mente.
    expect(frases.length).toBeGreaterThan(170);
    expect(PROBLEMAS.length).toBeGreaterThanOrEqual(8);
  });

  it('nenhuma frase volta em inglês', () => {
    const sobram = frases.filter((f) => translateWarning(f) === f);
    expect(sobram).toEqual([]);
  });

  it('nenhuma palavra inglesa fica solta na frase traduzida', () => {
    const ruins = frases
      .map((f) => ({ f, pt: translateWarning(f) }))
      .filter(({ pt }) => INGLES.test(solto(pt)))
      .map(({ f, pt }) => `${f}  →  ${pt}`);
    expect(ruins).toEqual([]);
  });

  it('nenhuma palavra de programador fora de parênteses (ui/jargao.ts)', () => {
    const ruins = frases
      .map((f) => ({ f, pt: translateWarning(f) }))
      .filter(({ pt }) => !PRESAS.some((re) => re.test(pt)))
      .filter(({ pt }) => jargaoNaFrase(pt.replace(/"[^"]*"/g, '""')).length > 0)
      .map(({ f, pt }) => `${f}  →  ${pt}  [${jargaoNaFrase(pt.replace(/"[^"]*"/g, '""')).join(', ')}]`);
    expect(ruins).toEqual([]);
  });

  it('o código do aviso vai para o fim, entre parênteses', () => {
    expect(translateWarning('TARGET_MISSING: bone "braco" does not exist; timeline ignored'))
      .toBe('não existe osso com o nome "braco": essas chaves ficam sem efeito (TARGET_MISSING)');
  });

  it('o que não é frase do leitor fica como está', () => {
    expect(translateWarning('A pasta abriu.')).toBe('A pasta abriu.');
    expect(translateWarning('FOO_BAR: coisa nenhuma')).toBe('FOO_BAR: coisa nenhuma');
  });
});
