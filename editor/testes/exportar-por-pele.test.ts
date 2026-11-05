/**
 * "Arquivo → Exportar por pele…" (requisito E3).
 *
 * O projeto não tem jsdom, então a janela não é clicada aqui. O que se prova é
 * a parte que DECIDE, e ela foi escrita de propósito sem DOM nenhum:
 *
 *   1. o menu oferece a entrada, logo depois de "Exportar imagem…";
 *   2. fatiar o documento aberto dá o mesmo resultado da linha de comando;
 *   3. os números que a janela escreve na hora batem com o arquivo que sai;
 *   4. o nome sugerido separa um personagem do outro;
 *   5. a lista do que saiu está em português, item por item.
 *
 * A janela em si — as caixas, o veil, o botão — é `exportSkinWindow`, e ela só
 * toca em `document` dentro da função, então importar este módulo num teste sem
 * navegador não quebra nada.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Doc } from '../src/doc/document.js';
import { fileMenu, flatEntries } from '../src/ui/menus.js';
import {
  animationNames, countRows, skinExportLine, skinExportReport, skinNames,
  sliceDoc, slicedText, suggestedName, textBytes,
} from '../src/io/export-skin.js';
import type { SkinExportRun } from '../src/io/export-skin.js';
import { loadSkeletonData } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';

const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');

function exampleDoc(): Doc {
  return new Doc(JSON.parse(readFileSync(EXAMPLE, 'utf8')) as BoneFile);
}

describe('a entrada do menu', () => {
  // P41 (29/09/2026), N-2: os nomes dizem o que sai. "Imagem…" virou
  // "GIF, PNG, folha, vídeo…", e "Por pele…" virou "Uma imagem por pele…".
  // Rodada 6 (05/10/2026): "pele" virou "skin" (decisão 1 do Humberto).
  it('"Exportar" oferece "Uma imagem por skin…", logo depois de "GIF, PNG, folha, vídeo…"', () => {
    const exportar = flatEntries(fileMenu()).find((entry) => entry.action === 'exportar');
    const labels = flatEntries(exportar?.children ?? []).map((entry) => entry.label);
    expect(labels).toContain('Uma imagem por skin…');
    expect(labels.indexOf('Uma imagem por skin…')).toBe(labels.indexOf('GIF, PNG, folha, vídeo…') + 1);
  });

  it('a entrada está sempre ligada: todo arquivo pode ser fatiado', () => {
    const entry = flatEntries(fileMenu()).find((e) => e.action === 'exportar-pele');
    expect(entry).toBeDefined();
    expect(entry?.enabled).toBe(true);
  });
});

describe('as caixas da janela', () => {
  it('oferece as três peles e as três animações do herói, na ordem do arquivo', () => {
    const doc = exampleDoc();
    expect(skinNames(doc)).toEqual(['default', 'armadura', 'armadura_capa']);
    expect(animationNames(doc)).toEqual(['idle', 'walk', 'attack']);
  });

  it('desmarcar uma pele e duas animações tira exatamente isso', () => {
    const doc = exampleDoc();
    const result = sliceDoc(doc, { skins: ['default', 'armadura'], animations: ['idle'] });
    expect(result.skins).toEqual(['default', 'armadura']);
    expect(result.animations).toEqual(['idle']);
    const saiu = result.removed.map((item) => `${item.kind}:${item.name}`);
    expect(saiu).toEqual(['skin:armadura_capa', 'animation:walk', 'animation:attack', 'event:step', 'event:hit']);
  });

  it('a pele padrão vai sempre, marcada ou não (§4.4)', () => {
    const doc = exampleDoc();
    const result = sliceDoc(doc, { skins: ['armadura'], animations: ['idle', 'walk', 'attack'] });
    expect(result.skins).toContain('default');
  });

  it('o arquivo que sai carrega sem um aviso', () => {
    const doc = exampleDoc();
    const result = sliceDoc(doc, { skins: ['default'], animations: ['walk'] });
    const data = loadSkeletonData(JSON.parse(slicedText(result)), {});
    expect(data.warnings).toEqual([]);
  });

  it('não mexe no documento aberto', () => {
    const doc = exampleDoc();
    const antes = doc.serialize();
    sliceDoc(doc, { skins: ['default'], animations: [] });
    // `serialize` reescreve `modified`, então a comparação ignora essa linha.
    const semData = (texto: string) => texto.replace(/"modified": "[^"]*"/, '');
    expect(semData(doc.serialize())).toBe(semData(antes));
  });
});

describe('os números que a janela mostra na hora', () => {
  it('a coluna "agora" bate com o arquivo que sai, campo por campo', () => {
    const doc = exampleDoc();
    const result = sliceDoc(doc, { skins: ['default'], animations: ['idle'] });
    const texto = slicedText(result);
    const rows = countRows(result, textBytes(texto), textBytes(`${JSON.stringify(doc.file, null, 2)}\n`));
    const porRotulo = new Map(rows.map((row) => [row.label, row]));

    expect(porRotulo.get('Ossos')?.now).toBe(result.file.bones.length);
    expect(porRotulo.get('Slots')?.now).toBe((result.file.slots ?? []).length);
    expect(porRotulo.get('Skins')?.now).toBe((result.file.skins ?? []).length);
    expect(porRotulo.get('Animações')?.now).toBe((result.file.animations ?? []).length);
    expect(porRotulo.get('Tamanho em bytes')?.now).toBe(textBytes(texto));
  });

  it('a coluna do arquivo inteiro nunca é menor que a do resultado', () => {
    const doc = exampleDoc();
    const result = sliceDoc(doc, { skins: ['default'], animations: ['idle'] });
    const rows = countRows(result, 10, 100);
    for (const row of rows) expect(row.whole).toBeGreaterThanOrEqual(row.now);
  });

  it('todo rótulo está por extenso, sem abreviação', () => {
    const doc = exampleDoc();
    const rows = countRows(sliceDoc(doc, { skins: ['default'], animations: [] }), 1, 1);
    expect(rows.map((row) => row.label)).toEqual([
      'Ossos', 'Slots', 'Skins', 'Desenhos', 'Regras', 'Eventos', 'Animações', 'Chaves', 'Tamanho em bytes',
    ]);
    for (const row of rows) expect(row.label).not.toMatch(/\./);
  });
});

describe('o nome e o relatório', () => {
  it('o nome sugerido separa um personagem do outro', () => {
    const doc = exampleDoc();
    expect(suggestedName(doc, { skins: ['default'], animations: [] })).toBe('heroi.bone');
    expect(suggestedName(doc, { skins: ['default', 'armadura'], animations: [] })).toBe('heroi-armadura.bone');
  });

  it('a linha da barra de estado diz o nome, os bytes e as contas', () => {
    const doc = exampleDoc();
    const result = sliceDoc(doc, { skins: ['default'], animations: ['idle'] });
    const run: SkinExportRun = {
      choice: { skins: ['default'], animations: ['idle'] },
      result,
      name: 'heroi.bone',
      size: textBytes(slicedText(result)),
    };
    const linha = skinExportLine(run);
    expect(linha).toContain('heroi.bone');
    expect(linha).toContain('ossos');
    expect(linha).toContain('animações');
  });

  it('a lista do que saiu vem em português, uma linha por item', () => {
    const doc = exampleDoc();
    const result = sliceDoc(doc, { skins: ['default'], animations: ['idle'] });
    const run: SkinExportRun = {
      choice: { skins: ['default'], animations: ['idle'] }, result, name: 'x.bone', size: 1,
    };
    const linhas = skinExportReport(run);
    expect(linhas).toHaveLength(result.removed.length);
    expect(linhas[0]).toMatch(/^pele armadura /);
    expect(linhas.some((linha) => linha.startsWith('evento step'))).toBe(true);
    for (const linha of linhas) expect(linha).toContain(' — ');
  });
});

describe('QA 04/11/2026 — D16: sem cortar nada, o tamanho é o do arquivo inteiro', () => {
  // A prova (Chromium sem janela): herói → Exportar → "Uma imagem por skin…",
  // tudo marcado. A tabela dizia "Tamanho em bytes 48.326 / 48.319": o recorte
  // 7 bytes MAIOR que o inteiro (doc 57 já anotava 48.485 / 48.478). A conta do
  // inteiro era o `doc.file` cru; a do recorte, o mesmo arquivo com o carimbo
  // "Recorte editor 0.1.0" no `generator` — sete letras a mais.
  it('tudo marcado: agora == inteiro', async () => {
    const { sliceDoc, slicedText, textBytes, wholeText } = await import('../src/io/export-skin.js');
    const doc = exampleDoc();
    const skins = (doc.file.skins ?? []).map((s) => s.name);
    const animations = (doc.file.animations ?? []).map((a) => a.name);
    const agora = textBytes(slicedText(sliceDoc(doc, { skins, animations })));
    expect(agora).not.toBe(textBytes(`${JSON.stringify(doc.file, null, 2)}\n`));
    expect(agora).toBe(textBytes(wholeText(doc)));
  });

  it('a janela conta o inteiro pela mesma régua', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-skin.ts'), 'utf8');
    expect(fonte).toContain('const whole = wholeText(doc);');
  });
});
