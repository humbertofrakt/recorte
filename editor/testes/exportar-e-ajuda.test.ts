/**
 * The two menu entries added last: "Exportar glTF…" and "Ajuda → Manual".
 *
 * Everything here is pure — no DOM — because the project has no jsdom. So the
 * dialogs are not driven; what is checked is the part that decides: what the
 * menus offer, what bytes the export produces, and what the manual page says.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Doc } from '../src/doc/document.js';
import { fileMenu, flatEntries, helpMenu } from '../src/ui/menus.js';
import { formatOfName, gltfBytes } from '../src/io/export-gltf.js';
import { manualChapters, manualPageHtml, renderMarkdown } from '../src/io/manual.js';
import type { BoneFile } from '../../runtime/src/index.js';

const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');

function exampleDoc(): Doc {
  return new Doc(JSON.parse(readFileSync(EXAMPLE, 'utf8')) as BoneFile);
}

describe('menu entries', () => {
  // Desde o lote menus os três "Exportar" moram num submenu, e não mais soltos
  // no fim do menu Arquivo: eram seis linhas quase iguais em sequência.
  // P33 e P41 (29/09/2026): Exportar num lugar só, com o nome dizendo o que
  // sai. O glTF deixou de ser o primeiro: o primeiro é o GIF/PNG, o mais pedido.
  it('"Arquivo" offers glTF inside "Exportar", named for what it is for', () => {
    const exportar = flatEntries(fileMenu()).find((entry) => entry.action === 'exportar');
    expect(exportar?.label).toBe('Exportar');
    expect(exportar?.children).toBeDefined();
    const gltf = flatEntries(exportar?.children ?? []).find((entry) => entry.action === 'exportar-gltf');
    expect(gltf?.label).toBe('glTF, para programa 3D…');
    expect(gltf?.action).toBe('exportar-gltf');
    expect(gltf?.enabled).toBe(true);
  });

  it('"Ajuda" offers the manual, with its key written next to it', () => {
    const manual = flatEntries(helpMenu())[0];
    expect(manual.label).toBe('Manual');
    expect(manual.shortcut).toBe('F1');
    expect(manual.enabled).toBe(true);
  });

  it('"Ajuda" also offers the shortcut table and "Sobre"', () => {
    const actions = flatEntries(helpMenu()).map((entry) => entry.action);
    // "paleta" entrou no lote 11 (item 110): a pergunta "existe, mas em qual
    // menu está?" é uma pergunta de ajuda.
    // "problemas" entrou no degrau 11, lote 6: a Janela de Problemas tem a
    // porta do rodapé (o botão de avisos) e esta, que se acha mesmo quando
    // não há aviso nenhum aceso.
    // "quero-fazer" entrou na noite de 04/11: logo depois do Manual, porque é
    // a pergunta de quem não sabe o nome do que procura.
    expect(actions).toEqual(['manual', 'quero-fazer', 'atalhos', 'problemas', 'paleta', 'sobre']);
  });
});

describe('exporting glTF', () => {
  it('the file name decides the shape', () => {
    expect(formatOfName('heroi.glb')).toBe('glb');
    expect(formatOfName('heroi.gltf')).toBe('gltf');
    expect(formatOfName('HEROI.GLTF')).toBe('gltf');
    expect(formatOfName('sem-extensao')).toBe('glb');
  });

  it('a .glb comes out with the glTF magic word and a version 2 header', async () => {
    const built = await gltfBytes(exampleDoc(), 'glb');
    const view = new DataView(built.bytes.buffer, built.bytes.byteOffset, built.bytes.byteLength);
    expect(view.getUint32(0, true)).toBe(0x46546c67); // "glTF"
    expect(view.getUint32(4, true)).toBe(2);
    expect(view.getUint32(8, true)).toBe(built.bytes.length);
    expect(built.stats.joints).toBeGreaterThan(0);
    expect(built.stats.animations).toBeGreaterThan(0);
  });

  it('a .gltf is JSON that carries its own numbers, so no .bin is needed', async () => {
    const built = await gltfBytes(exampleDoc(), 'gltf');
    const tree = JSON.parse(new TextDecoder().decode(built.bytes)) as {
      asset: { version: string };
      buffers: Array<{ uri: string }>;
    };
    expect(tree.asset.version).toBe('2.0');
    expect(tree.buffers).toHaveLength(1);
    expect(tree.buffers[0].uri.startsWith('data:application/octet-stream;base64,')).toBe(true);
  });

  it('says in Portuguese what glTF has no place for', async () => {
    const built = await gltfBytes(exampleDoc(), 'glb');
    expect(built.warnings.length).toBeGreaterThan(0);
    expect(built.warnings.some((line) => line.includes('constraint'))).toBe(true);
  });

  it('refuses a document that did not load, instead of writing an empty file', async () => {
    const doc = new Doc({ bone: { version: '1.0' } } as unknown as BoneFile);
    doc.setFile({ bone: { version: '1.0' }, skeleton: null } as unknown as BoneFile);
    if (doc.data !== null) return; // The empty file did load: nothing to check.
    await expect(gltfBytes(doc, 'glb')).rejects.toThrow(/carregou/);
  });
});

describe('the manual page', () => {
  it('carries every chapter, with the README first', () => {
    const chapters = manualChapters();
    expect(chapters.length).toBeGreaterThanOrEqual(12);
    expect(chapters[0].file.toLowerCase()).toBe('readme.md');
    // O lote 30 reescreveu o manual e renomeou os oito capítulos. O que este
    // teste guarda não é o NOME do primeiro: é que o índice venha antes dele,
    // e que a ordem seja a dos números. 07/10/2026: o manual da v36.5 tem
    // onze capítulos, de 00-abrir-o-recorte a 10-particulas-e-biblioteca.
    // 05/11/2026: doze — o 11, a espada de um, o boneco de outro.
    expect(chapters[1].file).toBe('00-abrir-o-recorte.md');
    expect(chapters.map((c) => c.file.slice(0, 2))).toEqual(
      ['RE', '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
    );
    expect(chapters[chapters.length - 1].file).toBe('11-a-espada-de-um-o-boneco-de-outro.md');
  });

  it('turns a table into a table and a link between chapters into a jump', () => {
    const html = renderMarkdown('| A | B |\n|:--|:--|\n| 1 | 2 |\n\nVeja o [capítulo 1](01-comecar.md).');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
    expect(html).toContain('href="#cap-01-comecar"');
  });

  it('escapes what came from the file, so no text can inject markup', () => {
    expect(renderMarkdown('um <script>alert(1)</script> solto')).not.toContain('<script>');
  });

  it('builds one whole page, with an index and every chapter anchored', () => {
    const html = manualPageHtml();
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<title>Manual do Recorte</title>');
    for (const chapter of manualChapters()) expect(html).toContain(`id="${chapter.id}"`);
  });
});

// Noite de 04/11/2026: uma linha com `|` sem a linha de traços embaixo não
// entrava em ramo nenhum do renderMarkdown, e o laço girava no mesmo lugar
// (o Ajuda → Manual travava). Ela vira parágrafo.
describe('o manual não trava numa linha com | que não é tabela', () => {
  it('termina, e o texto aparece', () => {
    const html = renderMarkdown('Antes.\n\n| só uma linha |\n\nDepois.');
    expect(html).toContain('só uma linha');
    expect(html).toContain('Depois.');
  });
});
