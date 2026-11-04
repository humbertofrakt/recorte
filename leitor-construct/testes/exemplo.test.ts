// SPDX-License-Identifier: Apache-2.0
/**
 * O projeto de exemplo do Construct (`exemplo/heroi-andando/`) confere com o
 * addon (rodada K2, item 5).
 *
 * A parte nativa do projeto (layout, teclado, texto, eventos) foi montada e
 * conferida pela skill `construct3-suprema-lts` (cinco portões; o oráculo dela
 * não conhece o nosso addon). Este teste é o portão da parte NOSSA: o que o
 * projeto pede do objeto Recorte — ações, parâmetros, itens de combo,
 * expressões, propriedades, versão — tem de existir no addon com o mesmo nome.
 * Um nome errado aqui o Construct recusa ao abrir.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// As regras do runtime (ik, física, caminho…) só existem depois deste import, como no addon:
// sem ele o esqueleto roda com regras 'noop' e o herói NÃO é o do jogo (achado na K5).
import '../src/pacote.js';
// @ts-expect-error -- módulo .mjs sem tipos
import { ID_DO_ADDON } from '../id.mjs';
// @ts-expect-error -- módulo .mjs sem tipos
import { heroiComFogo } from '../exemplo/fazer-heroi-fogo.mjs';
// @ts-expect-error -- módulo .mjs sem tipos
import { aura } from '../exemplo/fazer-aura.mjs';
// @ts-expect-error -- módulo .mjs sem tipos
import { arquivosDoExemplo } from '../montar.mjs';
import { inflateRawSync } from 'node:zlib';
import { carregarBoneco } from '../src/carregar.js';
import { Avisos, pecasDoQuadro } from '../src/desenhador.js';
import { Tocador } from '../src/tocador.js';

const LEITOR = join(dirname(fileURLToPath(import.meta.url)), '..');
const ADDON = join(LEITOR, 'addon');
const EXEMPLO = join(LEITOR, 'exemplo', 'heroi-andando');
const RAIZ = join(LEITOR, '..');

const json = (p: string): any => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));
const addon = json(join(ADDON, 'addon.json'));
const aces = json(join(ADDON, 'aces.json'));
const projeto = json(join(EXEMPLO, 'project.c3proj'));
const folha = json(join(EXEMPLO, 'eventSheets', 'Eventos.json'));
const layout = json(join(EXEMPLO, 'layouts', 'Heroi.json'));

/** Os objetos do projeto que são o nosso plugin. */
const nossos = (projeto.objectTypes.items as string[]).filter(
  (n) => json(join(EXEMPLO, 'objectTypes', `${n}.json`))['plugin-id'] === addon.id,
);

function todasAs(tipo: 'actions' | 'conditions'): any[] {
  const saida: any[] = [];
  const andar = (eventos: any[]) => {
    for (const e of eventos ?? []) {
      for (const a of e[tipo] ?? []) saida.push(a);
      andar(e.children);
    }
  };
  andar(folha.events);
  return saida;
}

function aceDoAddon(tipo: 'actions' | 'conditions', id: string): any {
  for (const cat of Object.values<any>(aces)) for (const a of cat[tipo] ?? []) if (a.id === id) return a;
  return undefined;
}

describe('o exemplo usa o addon como ele é', () => {
  it('tem um objeto do nosso plugin, e o addon citado tem a versão e o id do addon.json', () => {
    expect(addon.id).toBe(ID_DO_ADDON);
    expect(nossos).toEqual(['Heroi']);
    const usado = projeto.usedAddons.find((a: any) => a.id === addon.id);
    expect(usado).toMatchObject({ type: 'plugin', version: addon.version, sdkVersion: 2 });
  });

  it('cada ação do Heroi existe no aces.json, com os mesmos parâmetros e itens de combo válidos', () => {
    const acoes = todasAs('actions').filter((a) => nossos.includes(a.objectClass));
    expect(acoes.length).toBeGreaterThan(0);
    for (const a of acoes) {
      const def = aceDoAddon('actions', a.id);
      expect(def, a.id).toBeDefined();
      // Ação sem parâmetro (Pausar, Continuar) não tem a chave "parameters" no arquivo.
      expect(Object.keys(a.parameters ?? {}).sort()).toEqual((def.params ?? []).map((p: any) => p.id).sort());
      for (const p of def.params ?? []) if (p.type === 'combo') expect(p.items, `${a.id}.${p.id}`).toContain(a.parameters[p.id]);
    }
  });

  it('cada expressão Heroi.X citada existe no aces.json', () => {
    const texto = JSON.stringify(folha);
    const citadas = [...texto.matchAll(new RegExp(`\\b(?:${nossos.join('|')})\\.(\\w+)`, 'g'))].map((m) => m[1]);
    expect(citadas.length).toBeGreaterThan(0);
    const existentes = Object.values<any>(aces).flatMap((c) => (c.expressions ?? []).map((e: any) => e.expressionName));
    for (const nome of citadas) expect(existentes, nome).toContain(nome);
  });

  it('a instância tem exatamente as propriedades do plugin.js, com o tipo de cada uma', () => {
    const plugin = readFileSync(join(ADDON, 'plugin.js'), 'utf8');
    const props = [...plugin.matchAll(/new SDK\.PluginProperty\("(\w+)",\s*"([\w-]+)"/g)].map((m) => ({ tipo: m[1], id: m[2] }));
    const inst = layout.layers.flatMap((c: any) => c.instances).find((i: any) => nossos.includes(i.type));
    expect(Object.keys(inst.properties).sort()).toEqual(props.map((p) => p.id).sort());
    const js = { text: 'string', check: 'boolean', float: 'number' } as Record<string, string>;
    for (const p of props) expect(typeof inst.properties[p.id], p.id).toBe(js[p.tipo]);
  });

  it('cada condição do Heroi existe no aces.json, com os mesmos parâmetros', () => {
    const conds = todasAs('conditions').filter((c) => nossos.includes(c.objectClass));
    expect(conds.length).toBeGreaterThan(0);
    for (const c of conds) {
      const def = aceDoAddon('conditions', c.id);
      expect(def, c.id).toBeDefined();
      expect(Object.keys(c.parameters ?? {}).sort()).toEqual((def.params ?? []).map((p: any) => p.id).sort());
    }
  });

  it('o heroi-fogo.bone é o herói do formato mais a skin "fogo", exatamente o que o fazer-heroi-fogo.mjs gera', () => {
    const heroi = json(join(RAIZ, 'formato', 'exemplos', 'heroi.bone'));
    expect(json(join(EXEMPLO, 'files', 'heroi-fogo.bone'))).toEqual(heroiComFogo(heroi));
    const inst = layout.layers.flatMap((c: any) => c.instances).find((i: any) => nossos.includes(i.type));
    expect(inst.properties.arquivo).toBe('heroi-fogo.bone');
  });

  it('o arquivo da propriedade está na pasta Files do projeto, com o que ele cita, igual ao exemplo do formato', () => {
    const lista = projeto.rootFileFolders.general.items.map((i: any) => i.name).sort();
    expect(lista).toEqual(['aura.bone', 'capacete.bone', 'espada.bone', 'heroi-fogo.bone', 'heroi.atlas.json', 'heroi.bone', 'heroi.png']);
    for (const nome of lista.filter((n: string) => n !== 'heroi-fogo.bone' && n !== 'aura.bone')) {
      const aqui = join(EXEMPLO, 'files', nome);
      expect(existsSync(aqui), nome).toBe(true);
      expect(readFileSync(aqui).equals(readFileSync(join(RAIZ, 'formato', 'exemplos', nome))), `${nome} igual ao de formato/exemplos`).toBe(true);
    }
  });
});

describe('a conexão no exemplo (rodada K5): as teclas E e Q', () => {
  it('o aura.bone é exatamente o que o fazer-aura.mjs gera', () => {
    expect(json(join(EXEMPLO, 'files', 'aura.bone'))).toEqual(aura());
  });

  it('o .c3p da saída é a pasta do exemplo, arquivo a arquivo, byte a byte (o montar.mjs o refaz)', () => {
    const zip = readFileSync(join(LEITOR, 'saida', 'heroi-andando.c3p'));
    const lidos = new Map<string, Buffer>();
    let i = 0;
    while (zip.readUInt32LE(i) === 0x04034b50) {
      const comp = zip.readUInt32LE(i + 18);
      const n = zip.readUInt16LE(i + 26);
      const extra = zip.readUInt16LE(i + 28);
      const nome = zip.subarray(i + 30, i + 30 + n).toString('utf8');
      const ini = i + 30 + n + extra;
      lidos.set(nome, inflateRawSync(zip.subarray(ini, ini + comp)));
      i = ini + comp;
    }
    const pasta = arquivosDoExemplo() as { nome: string; bytes: Buffer }[];
    // Os *.uistate.json são o arranjo de tela do Construct: o .gitignore do
    // exemplo os deixa fora do GitHub. Num clone eles não existem na pasta,
    // mas continuam no .c3p — e não mudam o que o projeto faz.
    const noGit = existsSync(join(EXEMPLO, 'project.uistate.json'));
    for (const nome of [...lidos.keys()]) if (!noGit && nome.endsWith('.uistate.json')) lidos.delete(nome);
    expect([...lidos.keys()]).toEqual(pasta.map((a) => a.nome));
    // O git troca CRLF por LF nos .json ao subir: compara sem o \r.
    const igual = (nome: string, a: Buffer, b: Buffer) => nome.endsWith('.json')
      ? a.toString('utf8').replace(/\r\n/g, '\n') === b.toString('utf8').replace(/\r\n/g, '\n')
      : a.equals(b);
    for (const a of pasta) expect(igual(a.nome, lidos.get(a.nome)!, a.bytes), a.nome).toBe(true);
  });

  it('E troca a espada pelo capacete e volta; Q põe a aura em volta do herói e tira', async () => {
    const ler = async (c: string) => { try { return new Uint8Array(readFileSync(join(EXEMPLO, 'files', c))); } catch { return null; } };
    const avisos = new Avisos();
    const t = new Tocador((await carregarBoneco('heroi-fogo.bone', ler)).arquivo.data, avisos);
    for (const nome of ['capacete.bone', 'aura.bone']) t.registrarEntidade(nome, (await carregarBoneco(nome, ler)).arquivo.data);
    t.tocar('walk', true);
    t.avancar(0.2);
    const nomes = () => pecasDoQuadro(t.esqueleto, avisos, { cortar: false }).map((p) => p.nome);
    const sem = nomes();
    // E: o que os eventos fazem (o slot mostra o capacete? desencaixa; senão encaixa e anima).
    expect(t.pecaDoSlot('weapon')).toBe('espada.bone');
    t.encaixar('weapon', 'capacete.bone');
    t.animarPeca('weapon', 'piscar', true);
    expect(nomes().some((n) => n.startsWith('weapon/casco/'))).toBe(true);
    t.desencaixar('weapon');
    expect(nomes()).toEqual(sem);
    // Q: a aura em volta de "meio" — a bola de trás antes de tudo, a da frente depois de tudo.
    t.encaixar('aura', 'aura.bone', 'meio');
    t.animarPeca('aura', 'girar', true);
    t.avancar(0.5);
    const com = nomes();
    expect(com[0]).toBe('aura/bola_tras/bola_tras');
    expect(com[com.length - 1]).toBe('aura/bola_frente/bola_frente');
    expect(com.slice(1, -1)).toEqual(nomes().slice(1, -1).filter((n) => !n.startsWith('aura/')));
    t.desencaixar('aura');
    expect(nomes().some((n) => n.startsWith('aura/'))).toBe(false);
    // O único aviso é o de sempre do cabelo (a cor escura, que o Construct ainda não desenha).
    expect(avisos.todos().filter((x) => !x.includes('cor escura'))).toEqual([]);
  });
});
