// SPDX-License-Identifier: Apache-2.0
// Transforma os .md da página na web em HTML que se lê.
//
// O GitHub Pages entrega um .md CRU: asteriscos, barras e cerquilhas na tela.
// Quem chega de fora clica em "Especificação" e vê código. Este programa passa
// por cada .md de uma pasta (a _site do workflow `pagina.yml`) e grava, ao
// lado, um .html com o mesmo nome: títulos, tabelas, listas, código, imagens e
// links. Link para um .md vira link para o .html dele. Um README.md vira
// também o index.html da pasta, para que "documentos/manual/" abra.
//
// Não é um Markdown completo, e não tenta ser: entende o que a spec, o manual
// e os documentos da casa usam. O .md original fica ao lado, intacto.
//
// USO:
//   node ferramentas/pagina-md.mjs _site
//
// Sem dependência: roda com o Node puro, no workflow e na máquina.

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, basename, dirname, resolve, sep } from 'node:path';

const escapa = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Onde o arquivo sendo convertido mora, para resolver os links dele. Um link
 * para um arquivo do projeto que NÃO vai para a página (um plano, um código)
 * vira o mesmo arquivo no GitHub, e não um 404.
 */
const contexto = { arquivo: null, raiz: null };
const REPO = process.env.RECORTE_REPO ?? 'https://github.com/humbertofrakt/recorte/blob/main/';

/** O endereço de um link: `.md` vira `.html`, e espaço vira `%20`. */
export function endereco(alvo) {
  const t = alvo.trim().replace(/^<|>$/g, '');
  if (/^(https?:|mailto:|#)/i.test(t)) return t;
  const [caminho, ancora] = t.split('#');
  if (contexto.arquivo !== null && caminho !== '') {
    const absoluto = resolve(dirname(contexto.arquivo), decodeURIComponentSeguro(caminho));
    const dentro = absoluto.startsWith(contexto.raiz + sep);
    if (dentro && !existsSync(absoluto)) {
      const doRepo = relative(contexto.raiz, absoluto).split(sep).map(encodeURIComponent).join('/');
      return `${REPO}${doRepo}${ancora === undefined ? '' : `#${ancora}`}`;
    }
  }
  let c = caminho.replace(/\.md$/i, '.html');
  c = c.split('/').map((p) => encodeURIComponent(decodeURIComponentSeguro(p))).join('/');
  return ancora === undefined ? c : `${c}#${ancora}`;
}

function decodeURIComponentSeguro(p) {
  try { return decodeURIComponent(p); } catch { return p; }
}

/** Âncora de um título, como o GitHub faz (minúsculas, sem pontuação, hífens). */
export function ancoraDe(texto) {
  return texto.toLowerCase().replace(/<[^>]+>/g, '').replace(/[`*_]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-');
}

function emLinha(texto) {
  // O código primeiro, guardado de lado: dentro dele nada se interpreta.
  const codigos = [];
  let t = texto.replace(/`([^`]+)`/g, (_s, c) => { codigos.push(c); return `\u0000${codigos.length - 1}\u0000`; });
  t = escapa(t);
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_s, alt, alvo) => `<img src="${endereco(alvo)}" alt="${alt}">`);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_s, rotulo, alvo) => `<a href="${endereco(alvo.replace(/&amp;/g, '&'))}">${rotulo}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^\w*])\*([^*\s][^*]*)\*(?!\w)/g, '$1<em>$2</em>');
  t = t.replace(/(^|\s)_([^_]+)_(?=\s|$|[.,;:!?)])/g, '$1<em>$2</em>');
  t = t.replace(/\u0000(\d+)\u0000/g, (_s, i) => `<code>${escapa(codigos[Number(i)])}</code>`);
  return t;
}

const celulas = (linha) => {
  const s = linha.trim().replace(/^\|/, '').replace(/\|$/, '');
  const out = []; let atual = ''; let emCodigo = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && s[i + 1] === '|') { atual += '|'; i++; continue; }
    if (c === '`') emCodigo = !emCodigo;
    if (c === '|' && !emCodigo) { out.push(atual.trim()); atual = ''; continue; }
    atual += c;
  }
  out.push(atual.trim());
  return out;
};

/** O Markdown de um arquivo, em HTML (só o corpo). */
export function markdownParaHtml(md) {
  const linhas = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const paragrafo = [];
  const fechaParagrafo = () => {
    if (paragrafo.length > 0) out.push(`<p>${emLinha(paragrafo.join(' '))}</p>`);
    paragrafo.length = 0;
  };
  while (i < linhas.length) {
    const l = linhas[i];
    const cerca = /^(\s*)(```|~~~)(.*)$/.exec(l);
    if (cerca !== null) {
      fechaParagrafo();
      const bloco = [];
      i++;
      while (i < linhas.length && !linhas[i].trim().startsWith(cerca[2])) { bloco.push(linhas[i]); i++; }
      out.push(`<pre><code>${escapa(bloco.join('\n'))}</code></pre>`);
      i++;
      continue;
    }
    const titulo = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(l);
    if (titulo !== null) {
      fechaParagrafo();
      const n = titulo[1].length;
      const html = emLinha(titulo[2]);
      out.push(`<h${n} id="${ancoraDe(titulo[2])}">${html}</h${n}>`);
      i++;
      continue;
    }
    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(l)) { fechaParagrafo(); out.push('<hr>'); i++; continue; }
    if (l.trim().startsWith('|') && i + 1 < linhas.length && /^\s*\|?\s*:?-{2,}/.test(linhas[i + 1])) {
      fechaParagrafo();
      const cab = celulas(l);
      const alin = celulas(linhas[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : ''));
      const est = (k) => (alin[k] ? ` style="text-align:${alin[k]}"` : '');
      let html = '<div class="tabela"><table><thead><tr>' + cab.map((c, k) => `<th${est(k)}>${emLinha(c)}</th>`).join('') + '</tr></thead><tbody>';
      i += 2;
      while (i < linhas.length && linhas[i].trim().startsWith('|')) {
        html += '<tr>' + celulas(linhas[i]).map((c, k) => `<td${est(k)}>${emLinha(c)}</td>`).join('') + '</tr>';
        i++;
      }
      out.push(html + '</tbody></table></div>');
      continue;
    }
    if (/^\s*>/.test(l)) {
      fechaParagrafo();
      const bloco = [];
      while (i < linhas.length && /^\s*>/.test(linhas[i])) { bloco.push(linhas[i].replace(/^\s*>\s?/, '')); i++; }
      out.push(`<blockquote>${markdownParaHtml(bloco.join('\n'))}</blockquote>`);
      continue;
    }
    const item = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(l);
    if (item !== null) {
      fechaParagrafo();
      const ordenada = /\d/.test(item[2]);
      const itens = [];
      while (i < linhas.length) {
        const m = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(linhas[i]);
        if (m !== null) { itens.push(m[3]); i++; continue; }
        if (linhas[i].trim() !== '' && /^\s{2,}/.test(linhas[i]) && itens.length > 0) { itens[itens.length - 1] += ' ' + linhas[i].trim(); i++; continue; }
        break;
      }
      const tag = ordenada ? 'ol' : 'ul';
      out.push(`<${tag}>${itens.map((t) => `<li>${emLinha(t)}</li>`).join('')}</${tag}>`);
      continue;
    }
    if (l.trim() === '') { fechaParagrafo(); i++; continue; }
    paragrafo.push(l.trim());
    i++;
  }
  fechaParagrafo();
  return out.join('\n');
}

const ESTILO = `
:root { --fundo:#f6f5f2; --texto:#1d1d1f; --suave:#5b5b60; --azul:#2f6fdc; --cartao:#ffffff; --borda:#e2e0da; --codigo:#efeee9; }
@media (prefers-color-scheme: dark) { :root { --fundo:#17181b; --texto:#ececef; --suave:#a3a3aa; --azul:#6d9cff; --cartao:#212227; --borda:#34353b; --codigo:#2a2b30; } }
* { box-sizing: border-box; }
body { margin:0; background:var(--fundo); color:var(--texto); font:17px/1.6 system-ui, sans-serif; }
header { border-bottom:1px solid var(--borda); background:var(--cartao); }
header div { max-width:900px; margin:0 auto; padding:12px 16px; display:flex; gap:18px; flex-wrap:wrap; align-items:center; }
header a { color:var(--azul); text-decoration:none; }
header b { margin-right:auto; }
main { max-width:900px; margin:0 auto; padding:24px 16px 64px; overflow-wrap:anywhere; }
a { color:var(--azul); }
h1 { font-size:32px; line-height:1.2; } h2 { margin-top:2em; border-bottom:1px solid var(--borda); padding-bottom:4px; }
code { background:var(--codigo); padding:1px 5px; border-radius:4px; font-size:0.92em; }
pre { background:var(--codigo); padding:12px 14px; border-radius:8px; overflow-x:auto; }
pre code { background:none; padding:0; }
.tabela { overflow-x:auto; margin:1em 0; }
table { border-collapse:collapse; min-width:50%; }
th, td { border:1px solid var(--borda); padding:6px 10px; vertical-align:top; text-align:left; }
th { background:var(--cartao); }
blockquote { margin:1em 0; padding:4px 16px; border-left:4px solid var(--azul); background:var(--cartao); }
img { max-width:100%; height:auto; }
`;

/** A página inteira, com a faixa de cima que leva de volta. */
export function pagina(titulo, corpo, raizRelativa) {
  const r = raizRelativa === '' ? './' : raizRelativa;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapa(titulo)} — Recorte</title>
<link rel="icon" href="${r}site/favicon.ico">
<style>${ESTILO}</style>
</head>
<body>
<header><div><b>Recorte</b><a href="${r}index.html">Início</a><a href="${r}editor/index.html">Abrir o editor</a><a href="${r}site/index.html">O formato</a></div></header>
<main>
${corpo}
</main>
</body>
</html>
`;
}

function todosOsMd(pasta) {
  const out = [];
  for (const nome of readdirSync(pasta)) {
    const c = join(pasta, nome);
    if (statSync(c).isDirectory()) {
      if (nome === 'node_modules' || nome === 'editor') continue;
      out.push(...todosOsMd(c));
    } else if (/\.md$/i.test(nome)) out.push(c);
  }
  return out;
}

/** Converte todos os .md de `raiz`. Devolve quantos gravou. */
export function converterPasta(raiz) {
  let n = 0;
  for (const arquivo of todosOsMd(raiz)) {
    const md = readFileSync(arquivo, 'utf8').replace(/^﻿/, '');
    const titulo = (/^#\s+(.*)$/m.exec(md)?.[1] ?? basename(arquivo, '.md')).replace(/[`*]/g, '');
    const fundo = relative(dirname(arquivo), raiz).split(/[\\/]/).filter(Boolean).map(() => '..').join('/');
    contexto.arquivo = resolve(arquivo);
    contexto.raiz = resolve(raiz);
    const html = pagina(titulo, markdownParaHtml(md), fundo === '' ? '' : `${fundo}/`);
    contexto.arquivo = null;
    writeFileSync(arquivo.replace(/\.md$/i, '.html'), html);
    n++;
    if (/^readme\.md$/i.test(basename(arquivo))) {
      const indice = join(dirname(arquivo), 'index.html');
      if (!existsSync(indice)) writeFileSync(indice, html);
    }
  }
  // Um endereço que não muda para a spec: o nome dela traz a data, e a data
  // muda a cada rascunho. `formato/especificacao.html` é sempre a mais nova.
  const formato = join(raiz, 'formato');
  if (existsSync(formato)) {
    const specs = readdirSync(formato).filter((f) => /^ESPECIFICACAO.*\.html$/.test(f)).sort();
    if (specs.length > 0) writeFileSync(join(formato, 'especificacao.html'), readFileSync(join(formato, specs[specs.length - 1])));
  }
  return n;
}

if (process.argv[1] !== undefined && /pagina-md\.mjs$/.test(process.argv[1])) {
  const raiz = process.argv[2];
  if (raiz === undefined) {
    console.error('uso: node ferramentas/pagina-md.mjs PASTA');
    process.exit(2);
  }
  console.log(`${converterPasta(raiz)} páginas .md viraram .html em ${raiz}`);
}
