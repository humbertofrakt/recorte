// SPDX-License-Identifier: Apache-2.0
/**
 * O addon do Construct confere consigo mesmo (rodada K1, item 5).
 *
 * Ninguém aqui abre o Construct: instalar no r449 é a mão do Humberto. O que
 * dá para provar sem ele está aqui — a versão mínima, o SDK, que todo arquivo
 * citado existe, que todo nome tem texto, e que o .c3addon leva exatamente o
 * que o addon.json lista.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
// @ts-expect-error -- módulo .mjs sem tipos
import { ID_DO_ADDON } from '../id.mjs';
// @ts-expect-error -- módulo .mjs sem tipos
import { propagarId, zipar } from '../montar.mjs';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const LEITOR = join(dirname(fileURLToPath(import.meta.url)), '..');
const ADDON = join(LEITOR, 'addon');

function json(caminho: string): any {
  return JSON.parse(readFileSync(caminho, 'utf8').replace(/^﻿/, ''));
}
function texto(caminho: string): string {
  return readFileSync(join(ADDON, caminho), 'utf8');
}
function todos(pasta: string): string[] {
  const lista: string[] = [];
  for (const nome of readdirSync(pasta)) {
    const p = join(pasta, nome);
    if (statSync(p).isDirectory()) lista.push(...todos(p));
    else lista.push(relative(ADDON, p).split(sep).join('/'));
  }
  return lista.sort();
}

const addon = json(join(ADDON, 'addon.json'));
const aces = json(join(ADDON, 'aces.json'));
const lang = json(join(ADDON, 'lang', 'en-US.json'));
const ID: string = ID_DO_ADDON;
const textos = lang.text.plugins[ID.toLowerCase()];

/** Lê um zip feito pelo `zipar`: nome → bytes. */
function lerZip(zip: Buffer): Map<string, Buffer> {
  const fim = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const n = zip.readUInt16LE(fim + 10);
  let pos = zip.readUInt32LE(fim + 16);
  const saida = new Map<string, Buffer>();
  for (let i = 0; i < n; i++) {
    const comp = zip.readUInt32LE(pos + 20);
    const tamNome = zip.readUInt16LE(pos + 28);
    const local = zip.readUInt32LE(pos + 42);
    const nome = zip.subarray(pos + 46, pos + 46 + tamNome).toString('utf8');
    const ini = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    saida.set(nome, inflateRawSync(zip.subarray(ini, ini + comp)));
    pos += 46 + tamNome + zip.readUInt16LE(pos + 30) + zip.readUInt16LE(pos + 32);
  }
  return saida;
}

describe('addon.json', () => {
  it('é um plugin do SDK v2 que instala a partir do r449', () => {
    expect(addon['is-c3-addon']).toBe(true);
    expect(addon['sdk-version']).toBe(2);
    expect(addon['min-construct-version']).toBe('r449');
    expect(addon.type).toBe('plugin');
    expect(addon.id).toBe(ID);
  });

  it('todo arquivo citado existe, e nenhum arquivo da pasta fica de fora da lista', () => {
    const lista: string[] = addon['file-list'];
    for (const nome of lista) expect(existsSync(join(ADDON, nome)), nome).toBe(true);
    expect([...lista].sort()).toEqual(todos(ADDON));
    for (const nome of addon['editor-scripts']) expect(lista).toContain(nome);
  });

  it('o runtime empacotado está na lista e é o que o plugin.js carrega', () => {
    const plugin = texto('plugin.js');
    const dep = /AddFileDependency\(\{\s*filename:\s*"([^"]+)",\s*type:\s*"external-runtime-script"/.exec(plugin);
    expect(dep?.[1]).toBe('c3runtime/recorte-runtime.js');
    expect(addon['file-list']).toContain(dep![1]);
    const main = /SetRuntimeModuleMainScript\("([^"]+)"\)/.exec(plugin)?.[1];
    expect(addon['file-list']).toContain(main);
  });

  it('o id é o mesmo nos sete arquivos que o citam', () => {
    for (const f of ['plugin.js', 'type.js', 'instance.js']) expect(texto(f)).toContain(`SDK.Plugins.${ID}`);
    for (const f of ['plugin.js', 'type.js', 'instance.js', 'actions.js', 'conditions.js', 'expressions.js']) {
      expect(texto(`c3runtime/${f}`)).toContain(`C3.Plugins.${ID}`);
    }
    expect(textos).toBeDefined();
  });
});

describe('os textos (lang/en-US.json)', () => {
  it('toda propriedade do plugin.js tem nome e descrição', () => {
    const props = [...texto('plugin.js').matchAll(/new SDK\.PluginProperty\("(\w+)",\s*"([\w-]+)"/g)].map((m) => m[2]);
    expect(props.length).toBeGreaterThan(0);
    for (const id of props) {
      expect(textos.properties[id]?.name, id).toBeTruthy();
      expect(textos.properties[id]?.desc, id).toBeTruthy();
    }
  });

  it('toda ação, condição e expressão do aces.json tem texto, e todo parâmetro também', () => {
    for (const categoria of Object.keys(aces)) {
      expect(textos.aceCategories[categoria], categoria).toBeTruthy();
      for (const tipo of ['conditions', 'actions', 'expressions'] as const) {
        for (const ace of aces[categoria][tipo] ?? []) {
          const t = textos[tipo][ace.id];
          expect(t, `${tipo} ${ace.id}`).toBeDefined();
          expect(tipo === 'expressions' ? t['translated-name'] : t['list-name'], ace.id).toBeTruthy();
          for (const p of ace.params ?? []) expect(t.params?.[p.id]?.name, `${ace.id}.${p.id}`).toBeTruthy();
        }
      }
    }
  });

  it('toda ação, condição e expressão do aces.json tem o seu método no c3runtime', () => {
    const corpo = { conditions: texto('c3runtime/conditions.js'), actions: texto('c3runtime/actions.js'), expressions: texto('c3runtime/expressions.js') };
    for (const categoria of Object.keys(aces)) {
      for (const tipo of ['conditions', 'actions', 'expressions'] as const) {
        for (const ace of aces[categoria][tipo] ?? []) {
          const nome = tipo === 'expressions' ? ace.expressionName : ace.scriptName;
          expect(corpo[tipo], `${tipo} ${nome}`).toMatch(new RegExp(`\\n\\t${nome}\\(`));
        }
      }
    }
  });
});

describe('o .c3addon', () => {
  it('o zip leva exatamente a lista do addon.json, byte a byte', () => {
    const arquivos = (addon['file-list'] as string[]).map((nome) => ({ nome, bytes: readFileSync(join(ADDON, nome)) }));
    const lido = lerZip(zipar(arquivos));
    expect([...lido.keys()]).toEqual(addon['file-list']);
    for (const a of arquivos) expect(lido.get(a.nome)!.equals(a.bytes), a.nome).toBe(true);
  });
});

describe('o id numa constante só (id.mjs)', () => {
  it('trocar a constante leva o id novo a todo arquivo do addon e do exemplo, e o velho some', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'recorte-id-'));
    try {
      const a = join(tmp, 'addon');
      const e = join(tmp, 'exemplo');
      cpSync(ADDON, a, { recursive: true });
      cpSync(join(LEITOR, 'exemplo', 'heroi-andando'), e, { recursive: true });
      const n = propagarId('Bone_Leitor', a, e);
      expect(n).toBeGreaterThan(8);
      const tudo = [a, e].flatMap((p) => {
        const lista: string[] = [];
        const andar = (d: string) => { for (const x of readdirSync(d)) { const q = join(d, x); if (statSync(q).isDirectory()) andar(q); else if (/\.(js|json|c3proj)$/.test(x) && x !== 'recorte-runtime.js') lista.push(q); } };
        andar(p);
        return lista;
      });
      for (const q of tudo) {
        const t = readFileSync(q, 'utf8');
        expect(t, q).not.toContain(ID);
        expect(t, q).not.toContain(`"${ID.toLowerCase()}"`);
      }
      expect(json(join(a, 'addon.json')).id).toBe('Bone_Leitor');
      expect(json(join(a, 'lang', 'en-US.json')).text.plugins.bone_leitor).toBeDefined();
      expect(readFileSync(join(a, 'c3runtime', 'type.js'), 'utf8')).toContain('C3.Plugins.Bone_Leitor.Type');
      expect(json(join(e, 'objectTypes', 'Heroi.json'))['plugin-id']).toBe('Bone_Leitor');
      // Rodar de novo com o mesmo id não muda nada.
      expect(propagarId('Bone_Leitor', a, e)).toBe(0);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
