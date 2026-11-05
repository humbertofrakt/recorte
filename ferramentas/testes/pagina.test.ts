/**
 * A página na web (`pagina/index.html`, `site/`, o workflow `pagina.yml`) —
 * noite de 05/11/2026.
 *
 * Uma pessoa de fora chega por https://humbertofrakt.github.io/recorte/ e
 * clica. Este teste prende o que a noite consertou:
 *
 * 1. todo link das duas páginas de entrada aponta para algo que o workflow
 *    PUBLICA (o site citava `ESPECIFICACAO 2026-09-06.md`, que não existia, e
 *    `.md` crus, que o Pages mostra como código);
 * 2. o texto das páginas não tem palavra de programador fora de parênteses
 *    (`editor/src/ui/jargao.ts`);
 * 3. o workflow transforma os `.md` em HTML, e o conversor faz o que diz.
 *
 * A prova de clicar (Playwright, servidor em /recorte/) é da noite e está no
 * relatório `documentos/projeto do programa/noite/runtime.md`.
 */

import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix } from 'node:path';
import { describe, expect, it } from 'vitest';
import { jargaoNaFrase } from '../../editor/src/ui/jargao.js';
// @ts-expect-error — módulo .mjs sem tipos
import { markdownParaHtml, converterPasta, endereco } from '../pagina-md.mjs';

const RAIZ = process.cwd();
const WORKFLOW = readFileSync(join(RAIZ, '.github', 'workflows', 'pagina.yml'), 'utf8');

/**
 * Onde um endereço da página publicada mora no repositório, ou `null` se o
 * workflow não o publica. É o mapa do passo "Juntar" do `pagina.yml`.
 */
function noRepositorio(publicado: string): string | null {
  const p = decodeURIComponent(publicado);
  if (p === 'index.html') return 'pagina/index.html';
  if (p.startsWith('editor/')) return p === 'editor/index.html' ? 'editor/index.html' : null;
  if (p === 'LICENSE.txt') return 'LICENSE';
  if (p === 'formato/LICENSE.txt') return 'formato/LICENSE';
  if (p === 'formato/especificacao.html') return 'formato/ESPECIFICACAO 2026-09-17.md';
  const md = p.replace(/\.html$/, '.md');
  const candidatos = [p, md, p.replace(/index\.html$/, 'README.md')];
  const publicadas = ['site/', 'ferramentas/visualizador/', 'formato/', 'documentos/manual/', 'conformidade/'];
  const raiz = ['ESTADO.md', 'README.md', 'ESTADO.html', 'README.html'];
  if (!publicadas.some((d) => p.startsWith(d)) && !raiz.includes(p)) return null;
  if (p.startsWith('conformidade/') && p.includes('/', 'conformidade/'.length)) return null;
  return candidatos.find((c) => existsSync(join(RAIZ, c))) ?? null;
}

function linksDe(arquivoNoRepo: string, publicadoEm: string): { href: string; destino: string }[] {
  const html = readFileSync(join(RAIZ, arquivoNoRepo), 'utf8');
  const out: { href: string; destino: string }[] = [];
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1]!;
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    const destino = posix.normalize(posix.join(posix.dirname(publicadoEm), href.split('#')[0]!));
    out.push({ href, destino });
  }
  return out;
}

/** O texto que a pessoa lê: sem tags, sem `<code>`, sem o que está entre parênteses. */
function textoVisivel(arquivo: string): string {
  return readFileSync(join(RAIZ, arquivo), 'utf8')
    .replace(/<head>[\s\S]*?<\/head>/, ' ')
    .replace(/<style>[\s\S]*?<\/style>/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<code>[\s\S]*?<\/code>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ');
}

const ENTRADAS: readonly [string, string][] = [
  ['pagina/index.html', 'index.html'],
  ['site/index.html', 'site/index.html'],
  ['site/validador/index.html', 'site/validador/index.html'],
  ['ferramentas/visualizador/index.html', 'ferramentas/visualizador/index.html'],
];

describe('a página na web: os links das páginas de entrada abrem', () => {
  for (const [repo, publicado] of ENTRADAS) {
    it(`${repo}: todo link aponta para algo que o workflow publica`, () => {
      const quebrados = linksDe(repo, publicado)
        .filter(({ destino }) => noRepositorio(destino) === null)
        .map(({ href, destino }) => `${href} → ${destino}`);
      expect(quebrados).toEqual([]);
    });
  }

  it('"Abrir o editor" está nas duas páginas de entrada, e em destaque no site', () => {
    expect(readFileSync(join(RAIZ, 'pagina/index.html'), 'utf8')).toMatch(/class="grande" href="\.\/editor\/index\.html"><b>Abrir o editor<\/b>/);
    expect(readFileSync(join(RAIZ, 'site/index.html'), 'utf8')).toMatch(/<a class="botao" href="\.\.\/editor\/index\.html"[^>]*>Abrir o editor<\/a>/);
  });
});

describe('a página na web: palavras simples (ui/jargao.ts)', () => {
  for (const [repo] of ENTRADAS) {
    it(`${repo}: nenhuma palavra de programador fora de parênteses`, () => {
      expect(jargaoNaFrase(textoVisivel(repo))).toEqual([]);
    });
  }
});

describe('a página na web: os .md viram HTML', () => {
  it('o workflow roda o conversor e gera o runtime do visualizador', () => {
    expect(WORKFLOW).toContain('node ferramentas/pagina-md.mjs _site');
    expect(WORKFLOW).toContain('npx tsc -p ferramentas/visualizador/tsconfig.json');
    expect(WORKFLOW).toContain('cp LICENSE _site/LICENSE.txt');
  });

  it('o workflow roda a suíte ANTES de montar, e usa as actions de Node 24', () => {
    const suite = WORKFLOW.indexOf('npx vitest run');
    const montar = WORKFLOW.indexOf('npx vite build editor');
    expect(suite).toBeGreaterThan(0);
    expect(suite).toBeLessThan(montar);
    for (const a of ['actions/checkout@v7', 'actions/setup-node@v7', 'actions/setup-python@v7',
      'actions/upload-pages-artifact@v5', 'actions/deploy-pages@v5']) expect(WORKFLOW).toContain(a);
    expect(WORKFLOW).not.toMatch(/@v[1-4]\b/);
  });

  it('título, tabela, código, lista e link .md → .html', () => {
    const html = markdownParaHtml([
      '# Título', '', 'Um **forte** e `código`.', '',
      '| a | b |', '|:---|---:|', '| 1 | `x \\| y` |', '',
      '- um', '- dois', '', 'Veja [o manual](manual/README.md#parte).',
    ].join('\n'));
    expect(html).toContain('<h1 id="título">Título</h1>');
    expect(html).toContain('<strong>forte</strong>');
    expect(html).toContain('<code>código</code>');
    expect(html).toContain('<td style="text-align:right"><code>x | y</code></td>');
    expect(html).toContain('<ul><li>um</li><li>dois</li></ul>');
    expect(html).toContain('<a href="manual/README.html#parte">o manual</a>');
    expect(endereco('ESPECIFICACAO 2026-09-17.md')).toBe('ESPECIFICACAO%202026-09-17.html');
  });

  it('link para um arquivo que a página não publica vai para o GitHub, e não para um 404', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'pagina-md-'));
    mkdirSync(join(pasta, 'formato'));
    writeFileSync(join(pasta, 'formato', 'a.md'), '# A\n\n[b](b.md) e [plano](../documentos/planos/x.md)\n');
    writeFileSync(join(pasta, 'formato', 'b.md'), '# B\n');
    writeFileSync(join(pasta, 'formato', 'ESPECIFICACAO 2026-01-01.md'), '# Velha\n');
    writeFileSync(join(pasta, 'formato', 'ESPECIFICACAO 2026-02-01.md'), '# Nova\n');
    expect(converterPasta(pasta)).toBe(4);
    const a = readFileSync(join(pasta, 'formato', 'a.html'), 'utf8');
    expect(a).toContain('<a href="b.html">b</a>');
    expect(a).toContain('<a href="https://github.com/humbertofrakt/recorte/blob/main/documentos/planos/x.md">plano</a>');
    // o endereço fixo da spec é a MAIS NOVA
    expect(readFileSync(join(pasta, 'formato', 'especificacao.html'), 'utf8')).toContain('Nova');
    expect(existsSync(join(dirname(join(pasta, 'formato', 'a.html')), 'a.html'))).toBe(true);
  });
});
