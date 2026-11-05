/**
 * "Ajuda → Manual": opens the manual in a new browser tab (owner A).
 *
 * WHY NOT JUST A LINK TO THE `.md`
 * --------------------------------
 * A browser handed a `.md` either downloads it or shows raw asterisks. Neither
 * is reading. So the chapters are bundled in as text, turned into one plain
 * HTML page, and handed to the tab as a `blob:` address. One tab, no server, no
 * dependency, and it still works from the built page.
 *
 * The whole manual goes in one page on purpose: a reader who has to click
 * between nine files loses the thread. The index at the top jumps to a chapter;
 * every link between chapters becomes a jump inside the same page.
 *
 * The renderer below understands only what the manual actually uses: headings,
 * tables, lists, images, links, rules, code and bold. It is not a Markdown
 * implementation and does not try to be one.
 */

/** The chapters, as text, keyed by their path. Bundled at build time. */
const CHAPTER_TEXT = import.meta.glob('../../../documentos/manual/*.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

/** The pictures the manual shows, keyed by path, as addresses. */
const IMAGE_URL = import.meta.glob('../../../documentos/manual/imagens/*.png', {
  query: '?url', import: 'default', eager: true,
}) as Record<string, string>;

/** Where the manual lives on disk, for the line at the foot of the page. */
export const MANUAL_FOLDER = 'documentos/manual/';

// ---------------------------------------------------------------------------
// Gathering the chapters
// ---------------------------------------------------------------------------

export interface ManualChapter {
  /** File name, such as `01-comecar.md`. */
  file: string;
  /** Anchor used inside the page, such as `cap-01-comecar`. */
  id: string;
  /** Title taken from the first `#` line, or the file name. */
  title: string;
  text: string;
}

function baseName(path: string): string {
  return path.split('/').pop() ?? path;
}

function anchorOf(file: string): string {
  return `cap-${file.replace(/\.md$/i, '')}`;
}

function titleOf(text: string, file: string): string {
  const line = text.split('\n').find((l) => l.startsWith('# '));
  return line === undefined ? file : line.slice(2).trim();
}

/**
 * The chapters in reading order: the `README.md` first, then `01` to `08` by
 * name. Sorting by name is enough because the files are numbered.
 */
export function manualChapters(): ManualChapter[] {
  const chapters: ManualChapter[] = [];
  for (const [path, text] of Object.entries(CHAPTER_TEXT)) {
    const file = baseName(path);
    chapters.push({ file, id: anchorOf(file), title: titleOf(text, file), text });
  }
  chapters.sort((a, b) => {
    if (a.file.toLowerCase() === 'readme.md') return -1;
    if (b.file.toLowerCase() === 'readme.md') return 1;
    return a.file.localeCompare(b.file, 'pt-BR');
  });
  return chapters;
}

// ---------------------------------------------------------------------------
// The little Markdown renderer
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Turns a link written in the manual into something this page can follow. */
function hrefFor(target: string): string {
  const clean = target.trim();
  if (/^(https?:|mailto:)/i.test(clean)) return escapeHtml(clean);
  const file = clean.split('#')[0];
  if (/\.md$/i.test(file)) return `#${anchorOf(baseName(file))}`;
  if (clean.startsWith('#')) return escapeHtml(clean);
  // Anything else (a path into the project) is shown, not followed.
  return '';
}

/** Address of a picture the manual asks for, or `null` when it is not bundled. */
function pictureFor(target: string): string | null {
  const name = baseName(target.trim());
  for (const [path, url] of Object.entries(IMAGE_URL)) {
    if (baseName(path) === name) return url;
  }
  return null;
}

/** Bold, code, pictures and links, in that order, inside one line. */
function inline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_whole, alt: string, target: string) => {
    const url = pictureFor(target);
    return url === null ? `<em>${alt}</em>` : `<img src="${url}" alt="${alt}" />`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_whole, label: string, target: string) => {
    const href = hrefFor(target);
    return href === '' ? label : `<a href="${href}">${label}</a>`;
  });
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s:|-]+\|$/.test(line.trim());
}

function tableCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

/** Renders one chapter as HTML. Only what the manual uses is understood. */
export function renderMarkdown(text: string): string {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed === '') { index += 1; continue; }

    if (trimmed.startsWith('```')) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      out.push('<hr />');
      index += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading !== null) {
      const level = Math.min(6, heading[1].length + 1); // `#` becomes `<h2>`.
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (trimmed.startsWith('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const head = tableCells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      const headHtml = head.map((cell) => `<th>${inline(cell)}</th>`).join('');
      const bodyHtml = rows
        .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`)
        .join('');
      out.push(`<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index];
        const currentTrimmed = current.trim();
        const starts = ordered ? /^\d+\.\s+/.test(currentTrimmed) : /^[-*]\s+/.test(currentTrimmed);
        if (starts) {
          items.push(currentTrimmed.replace(/^([-*]|\d+\.)\s+/, ''));
          index += 1;
          continue;
        }
        // A line indented under the previous item belongs to that item.
        if (items.length > 0 && currentTrimmed !== '' && /^\s{2,}/.test(current)) {
          items[items.length - 1] += ` ${currentTrimmed}`;
          index += 1;
          continue;
        }
        break;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (current === '' || current.startsWith('|') || current.startsWith('#')
        || current.startsWith('```') || /^[-*]\s+/.test(current) || /^-{3,}$/.test(current)) break;
      paragraph.push(current);
      index += 1;
    }
    // Noite de 04/11/2026: uma linha com `|` que não é tabela (sem a linha
    // de traços embaixo) não entrava em ramo nenhum, e o laço girava sem fim
    // no mesmo índice: o F1 travava. Ela vira um parágrafo, como o texto é.
    if (paragraph.length === 0) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    out.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }

  return out.join('\n');
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

const PAGE_CSS = `
  :root { color-scheme: light; }
  body { margin: 0; background: #f6f5f2; color: #1c1c1c;
    font: 17px/1.65 "Segoe UI", system-ui, sans-serif; }
  main { max-width: 46rem; margin: 0 auto; padding: 2rem 1.5rem 6rem; }
  h1 { font-size: 1.9rem; margin: 0 0 1.5rem; }
  h2 { font-size: 1.5rem; margin: 2.5rem 0 0.8rem; }
  h3 { font-size: 1.2rem; margin: 1.8rem 0 0.6rem; }
  p, li { max-width: 42rem; }
  a { color: #12507c; }
  code { background: #e8e6e0; padding: 0 0.25rem; border-radius: 3px;
    font-family: Consolas, monospace; font-size: 0.92em; }
  pre { background: #e8e6e0; padding: 0.9rem 1rem; overflow-x: auto; border-radius: 4px; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; margin: 1rem 0; width: 100%; display: block;
    overflow-x: auto; }
  th, td { border: 1px solid #cfcbc2; padding: 0.45rem 0.7rem; text-align: left;
    vertical-align: top; }
  th { background: #e8e6e0; }
  hr { border: none; border-top: 1px solid #d5d1c8; margin: 2.5rem 0; }
  img { max-width: 100%; height: auto; border: 1px solid #d5d1c8; }
  .capa { background: #1c3d5a; color: #fff; padding: 1.5rem; }
  .capa p { margin: 0.3rem 0 0; opacity: 0.85; }
  .capa h1 { margin: 0; }
  .indice { background: #fff; border: 1px solid #d5d1c8; padding: 1rem 1.5rem; }
  .capitulo { border-top: 2px solid #d5d1c8; padding-top: 1.5rem; margin-top: 3rem; }
  .rodape { color: #5b5b5b; font-size: 0.9rem; margin-top: 3rem; }
`;

/** Builds the whole manual as one HTML page. */
export function manualPageHtml(chapters: readonly ManualChapter[] = manualChapters()): string {
  const index = chapters
    .map((chapter) => `<li><a href="#${chapter.id}">${escapeHtml(chapter.title)}</a></li>`)
    .join('');

  const body = chapters
    .map((chapter) => `<section class="capitulo" id="${chapter.id}">
${renderMarkdown(chapter.text)}
</section>`)
    .join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Manual do Recorte</title>
<style>${PAGE_CSS}</style>
</head>
<body>
<div class="capa"><h1>Manual do Recorte</h1><p>Todos os capítulos numa página só.</p></div>
<main>
<nav class="indice"><h2>Capítulos</h2><ol>${index}</ol></nav>
${body}
<p class="rodape">Os arquivos originais estão em <code>${MANUAL_FOLDER}</code>.</p>
</main>
</body>
</html>`;
}

/**
 * Opens the manual in a new tab. Returns `null` when the browser blocked the
 * pop-up, so the caller can say so instead of failing quietly.
 */
export function openManual(): Window | null {
  const html = manualPageHtml();
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const tab = globalThis.open(url, '_blank');
  // The tab keeps its own copy once it has loaded; ten seconds is plenty.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return tab;
}
