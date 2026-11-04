/**
 * Fase 4, ligação: as peças novas encaixadas no editor e na linha de comando.
 *
 * O que se prova aqui:
 *   1. O validador conhece os três tipos de arquivo do formato.
 *   2. `loadSkeletonFile` abre os três encodings só pelos bytes.
 *   3. O menu Arquivo tem os quatro itens novos, e "Reempacotar atlas" só
 *      acende quando há imagens importadas.
 *   4. "Importar de outro programa" converte um projeto de verdade.
 *   5. "Salvar como binário" e "Salvar como pacote" produzem bytes que voltam.
 *
 * Sem DOM: o projeto não tem jsdom, então tudo aqui é código puro. O que
 * precisa de navegador foi provado clicando, e a tela está em
 * `editor/tela-importar.png`.
 */

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

import { detectEncoding, loadSkeletonFile } from '../../runtime/src/file.js';
import { loadAtlas, parseBoneText } from '../../runtime/src/index.js';
import { writeBoneb } from '../../runtime/src/binario/escrever.js';
import { writeBonez } from '../../runtime/src/binario/bonez.js';
import {
  editMenu, fileMenu, flatEntries, skeletonMenu,
} from '../../editor/src/ui/menus.js';
import { detectFormat, importForeignFiles } from '../../editor/src/io/import-foreign.js';
import { writeImportIntoFile } from '../../editor/src/io/import-images.js';
import { atlasToJson } from '../../editor/src/io/save-binary.js';
import { dragonBonesParts, importDragonBones } from '../src/importar/dragonbones.js';
import { importSpriter, spriterParts } from '../src/importar/spriter.js';
import type { PackedAtlas } from '../src/atlas/packer.js';
import type { BoneFile } from '../../runtime/src/index.js';

const RAIZ = resolve(__dirname, '..', '..');
const HEROI = join(RAIZ, 'formato', 'exemplos', 'heroi.bone');
const HEROI_ATLAS = join(RAIZ, 'formato', 'exemplos', 'heroi.atlas.json');
const VALIDADOR = join(RAIZ, 'ferramentas', 'validador', 'validar.mjs');

const codec = {
  deflateRaw: (d: Uint8Array) => new Uint8Array(deflateRawSync(d)),
  inflateRaw: (d: Uint8Array) => new Uint8Array(inflateRawSync(d)),
};

/** Roda o validador e devolve saída e código, sem estourar em erro. */
function validar(...caminhos: string[]): { saida: string; codigo: number } {
  try {
    const saida = execFileSync(process.execPath, [VALIDADOR, ...caminhos], { encoding: 'utf8' });
    return { saida, codigo: 0 };
  } catch (erro) {
    const e = erro as { stdout?: string; stderr?: string; status?: number };
    return { saida: `${e.stdout ?? ''}${e.stderr ?? ''}`, codigo: e.status ?? 1 };
  }
}

function pastaTemporaria(): string {
  return mkdtempSync(join(tmpdir(), 'fase4-'));
}

// ---------------------------------------------------------------------------
// 1. O validador conhece os três tipos de arquivo
// ---------------------------------------------------------------------------

describe('validador: esqueleto, atlas e manifesto', () => {
  it('aceita o .atlas.json do exemplo e diz que é um atlas', () => {
    const { saida, codigo } = validar(HEROI_ATLAS);
    expect(codigo).toBe(0);
    expect(saida).toContain('(atlas)');
    expect(saida).toContain('OK');
  });

  it('aceita o .bone do exemplo e diz que é um esqueleto', () => {
    const { saida, codigo } = validar(HEROI);
    expect(codigo).toBe(0);
    expect(saida).toContain('(esqueleto)');
  });

  it('valida os dois de uma vez, cada um contra o seu esquema', () => {
    const { saida, codigo } = validar(HEROI, HEROI_ATLAS);
    expect(codigo).toBe(0);
    expect(saida).toContain('2 válido(s), 0 com erro.');
  });

  it('recusa uma região que passa da borda da página (10.3, L1)', () => {
    const pasta = pastaTemporaria();
    try {
      const atlas = JSON.parse(readFileSync(HEROI_ATLAS, 'utf8'));
      atlas.regions[0].x = 250; // a página tem 256 e a região tem 76 de largura
      const caminho = join(pasta, 'ruim.atlas.json');
      writeFileSync(caminho, JSON.stringify(atlas));
      const { saida, codigo } = validar(caminho);
      expect(codigo).toBe(1);
      expect(saida).toContain('passa da borda direita');
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });

  it('recusa originalWidth menor que offsetX + width (10.3, L1)', () => {
    const pasta = pastaTemporaria();
    try {
      const atlas = JSON.parse(readFileSync(HEROI_ATLAS, 'utf8'));
      const regiao = atlas.regions.find((r: { offsetX?: number }) => r.offsetX !== undefined);
      regiao.originalWidth = regiao.width; // não cabe mais o corte da esquerda
      const caminho = join(pasta, 'corte.atlas.json');
      writeFileSync(caminho, JSON.stringify(atlas));
      const { saida, codigo } = validar(caminho);
      expect(codigo).toBe(1);
      expect(saida).toContain('originalWidth');
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });

  it('recusa dois nomes de região iguais, contando os apelidos (10.5)', () => {
    const pasta = pastaTemporaria();
    try {
      const atlas = JSON.parse(readFileSync(HEROI_ATLAS, 'utf8'));
      atlas.regions[1].aliases = [atlas.regions[0].name];
      const caminho = join(pasta, 'apelido.atlas.json');
      writeFileSync(caminho, JSON.stringify(atlas));
      const { saida, codigo } = validar(caminho);
      expect(codigo).toBe(1);
      expect(saida).toContain('repetido');
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });

  it('recusa rotation diferente de 0 e de 90 (10.4)', () => {
    const pasta = pastaTemporaria();
    try {
      const atlas = JSON.parse(readFileSync(HEROI_ATLAS, 'utf8'));
      atlas.regions[0].rotation = 45;
      const caminho = join(pasta, 'giro.atlas.json');
      writeFileSync(caminho, JSON.stringify(atlas));
      const { codigo } = validar(caminho);
      expect(codigo).toBe(1);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });

  it('a opção --atlas força o tipo mesmo com outro nome de arquivo', () => {
    const pasta = pastaTemporaria();
    try {
      const caminho = join(pasta, 'sem-nome-certo.json');
      writeFileSync(caminho, readFileSync(HEROI_ATLAS, 'utf8'));
      // Sem a opção, o nome manda e ele tenta validar como esqueleto.
      expect(validar(caminho).codigo).toBe(1);
      const forcado = execFileSync(
        process.execPath, [VALIDADOR, '--atlas', caminho], { encoding: 'utf8' },
      );
      expect(forcado).toContain('(atlas)');
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Uma porta de entrada só, para os três encodings
// ---------------------------------------------------------------------------

describe('loadSkeletonFile: .bone, .boneb e .bonez pelos bytes', () => {
  const texto = readFileSync(HEROI, 'utf8');
  const arvore = parseBoneText(texto);
  const bytesBone = new TextEncoder().encode(texto);
  const bytesBoneb = writeBoneb(arvore);

  it('descobre o encoding pela assinatura, não pelo nome', () => {
    expect(detectEncoding(bytesBone)).toBe('bone');
    expect(detectEncoding(bytesBoneb)).toBe('boneb');
    expect(detectEncoding(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0]))).toBe('bonez');
  });

  it('bytes curtos demais não viram binário por engano', () => {
    expect(detectEncoding(new Uint8Array([0x89, 0x42]))).toBe('bone');
    expect(detectEncoding(new Uint8Array(0))).toBe('bone');
  });

  it('abre o .bone e o .boneb com o mesmo esqueleto dentro', () => {
    const doTexto = loadSkeletonFile(bytesBone);
    const doBinario = loadSkeletonFile(bytesBoneb);
    expect(doTexto.encoding).toBe('bone');
    expect(doBinario.encoding).toBe('boneb');
    expect(doBinario.data.bones.length).toBe(doTexto.data.bones.length);
    expect(doBinario.data.animations.map((a) => a.name))
      .toEqual(doTexto.data.animations.map((a) => a.name));
    expect(doBinario.archive).toBeNull();
  });

  it('abre um .bonez e acha o atlas de dentro do pacote sozinho (2.8)', () => {
    const encoder = new TextEncoder();
    const pacote = writeBonez({
      manifest: {
        bonez: { version: '1.0' },
        main: 'heroi.bone',
        skeletons: ['heroi.bone'],
        atlases: ['heroi.atlas.json'],
      },
      files: [
        { name: 'heroi.bone', data: encoder.encode(texto) },
        { name: 'heroi.atlas.json', data: encoder.encode(readFileSync(HEROI_ATLAS, 'utf8')) },
      ],
    }, codec);

    // Sem o pacote, os attachments não acham as regiões e o carregador avisa.
    const solto = loadSkeletonFile(bytesBone);
    expect(solto.data.warnings.length).toBeGreaterThan(0);

    const doPacote = loadSkeletonFile(pacote, { codec });
    expect(doPacote.encoding).toBe('bonez');
    expect(doPacote.atlases.length).toBe(1);
    expect(doPacote.atlases[0].regions.length).toBeGreaterThan(0);
    expect(doPacote.data.warnings).toEqual([]);
    expect(doPacote.archive?.mainName).toBe('heroi.bone');
  });

  it('resolve o atlas na pasta do esqueleto principal, não na raiz do ZIP (2.8)', () => {
    const encoder = new TextEncoder();
    const pacote = writeBonez({
      manifest: {
        bonez: { version: '1.0' },
        main: 'personagem/heroi.bone',
        skeletons: ['personagem/heroi.bone'],
      },
      files: [
        { name: 'personagem/heroi.bone', data: encoder.encode(texto) },
        { name: 'personagem/heroi.atlas.json', data: encoder.encode(readFileSync(HEROI_ATLAS, 'utf8')) },
      ],
    }, codec);

    const aberto = loadSkeletonFile(pacote, { codec });
    expect(aberto.atlases.length).toBe(1);
    expect(aberto.data.warnings).toEqual([]);
  });

  it('avisa, em português, quando o pacote não traz o atlas que o esqueleto pede', () => {
    const encoder = new TextEncoder();
    const pacote = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'heroi.bone', skeletons: ['heroi.bone'] },
      files: [{ name: 'heroi.bone', data: encoder.encode(texto) }],
    }, codec);
    const aberto = loadSkeletonFile(pacote, { codec });
    expect(aberto.warnings.join(' ')).toContain('não traz o atlas');
  });

  it('um pacote com o esqueleto em binário dentro também abre', () => {
    const pacote = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'heroi.boneb', skeletons: ['heroi.boneb'] },
      files: [{ name: 'heroi.boneb', data: bytesBoneb }],
    }, codec);
    const aberto = loadSkeletonFile(pacote, { codec });
    expect(aberto.encoding).toBe('bonez');
    expect(aberto.data.bones.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 3. O menu Arquivo
// ---------------------------------------------------------------------------

describe('menu Arquivo: os quatro itens novos', () => {
  // Desde o lote menus (v1.6) o menu Arquivo tem separadores e dois submenus,
  // e "Reempacotar atlas" mudou para o menu Esqueleto. `flatEntries` abre os
  // submenus e deixa os separadores de fora, que é o que estas provas querem.
  const semImagens = flatEntries(fileMenu());

  const esqueleto = (canRepack: boolean) => flatEntries(skeletonMenu({
    lockBones: false,
    lockDrawings: false,
    space: 'local',
    compensation: { children: false, drawings: false, boxes: false },
    canRepack,
  }));

  it('tem os itens que a fase 4 pediu, escritos por extenso', () => {
    const acoes = semImagens.map((e) => e.action);
    expect(acoes).toContain('importar-programa');
    // Lote 59: "Importar imagens" saiu — "no Spriter não existe importar
    // imagens". A porta das imagens é Abrir pasta….
    expect(acoes).not.toContain('importar-imagens');
    expect(acoes).toContain('abrir-pasta');
    expect(acoes).toContain('salvar-binario');
    expect(acoes).toContain('salvar-pacote');
    const rotulos = semImagens.map((e) => e.label);
    expect(rotulos).toContain('Salvar como binário…');
    expect(rotulos).toContain('Salvar como pacote…');
  });

  it('mantém os itens antigos, na ordem de sempre, com os atalhos', () => {
    const antigos = ['novo', 'abrir', 'salvar', 'salvar-como'];
    const achados = antigos.map((acao) => semImagens.find((e) => e.action === acao));
    // Degrau 10 (10.1, P3): a AÇÃO e a TECLA são as de sempre; o que mudou é o
    // nome, que passou a dizer de que se fala — o projeto é a caixa (BASE §15).
    expect(achados.map((e) => [e?.label, e?.shortcut])).toEqual([
      ['Novo projeto…', 'Ctrl+N'],
      ['Abrir projeto…', 'Ctrl+O'],
      ['Salvar', 'Ctrl+S'],
      ['Salvar como…', 'Ctrl+Shift+S'],
    ]);
    // Continuam nesta ordem, mesmo com "Abrir recente" entrando no meio.
    const posicoes = antigos.map((acao) => semImagens.findIndex((e) => e.action === acao));
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
  });

  it('cada item tem uma ação diferente: nada aponta para o mesmo lugar', () => {
    const acoes = semImagens.map((e) => e.action);
    expect(new Set(acoes).size).toBe(acoes.length);
  });

  it('"Reempacotar atlas" saiu do menu: o atlas nasce ao Salvar (lote 62)', () => {
    // Antes ficava apagado até haver imagens importadas. Desde o plano pasta
    // do projeto o Salvar empacota as imagens em uso, e reempacotar é salvar.
    expect(esqueleto(false).find((e) => e.action === 'reempacotar')).toBeUndefined();
    expect(esqueleto(true).find((e) => e.action === 'reempacotar')).toBeUndefined();
  });

  it('o que já existe fica disponível; o que não existe diz em que lote chega', () => {
    for (const entrada of semImagens) {
      if (entrada.enabled) continue;
      expect(entrada.hint, `${entrada.label} está cinza e não explica`).toBeDefined();
    }
  });

  it('nenhum rótulo é abreviação ou código: todos são palavras inteiras', () => {
    for (const entrada of [...semImagens, ...flatEntries(editMenu({
      canUndo: false, undoLabel: null, canRedo: false, redoLabel: null,
    }))]) {
      expect(entrada.label.length).toBeGreaterThan(3);
      expect(entrada.label).not.toMatch(/[_{}<>]/);
    }
  });

  it('o menu Editar diz o que vai desfazer, quando há o que desfazer', () => {
    const parado = flatEntries(editMenu({
      canUndo: false, undoLabel: null, canRedo: false, redoLabel: null,
    }));
    expect(parado[0]).toMatchObject({ label: 'Desfazer', enabled: false });

    const cheio = flatEntries(editMenu({
      canUndo: true, undoLabel: 'Mover osso', canRedo: true, redoLabel: 'Girar osso',
    }));
    expect(cheio[0]).toMatchObject({ label: 'Desfazer Mover osso', enabled: true });
    expect(cheio[1]).toMatchObject({ label: 'Refazer Girar osso', enabled: true });
  });
});

// ---------------------------------------------------------------------------
// 4. "Importar de outro programa"
// ---------------------------------------------------------------------------

/** Um projeto de Spine pequeno, escrito à mão, com atlas de texto junto. */
const SPINE_JSON = JSON.stringify({
  skeleton: { hash: 'teste', spine: '4.1.23', fps: 30 },
  bones: [
    { name: 'root' },
    { name: 'torso', parent: 'root', y: 40, length: 60 },
    { name: 'cabeca', parent: 'torso', y: 60 },
  ],
  slots: [
    { name: 'corpo', bone: 'torso', attachment: 'body' },
    { name: 'cabeca', bone: 'cabeca', attachment: 'face' },
  ],
  skins: [{
    name: 'default',
    attachments: {
      corpo: { body: { width: 76, height: 84 } },
      cabeca: { face: { width: 64, height: 66 } },
    },
  }],
  animations: {
    balanco: {
      bones: { torso: { rotate: [{ time: 0, value: 0 }, { time: 1, value: 8 }] } },
    },
  },
});

const SPINE_ATLAS = `
pagina.png
size: 256, 256
format: RGBA8888
filter: Linear, Linear
repeat: none
body
  rotate: false
  xy: 2, 2
  size: 76, 84
  orig: 76, 84
  offset: 0, 0
  index: -1
face
  rotate: false
  xy: 154, 2
  size: 64, 66
  orig: 64, 66
  offset: 0, 0
  index: -1
`;

const DRAGONBONES_JSON = JSON.stringify({
  frameRate: 24,
  name: 'boneco',
  version: '5.5',
  armature: [{
    name: 'boneco',
    frameRate: 24,
    bone: [{ name: 'root' }, { name: 'torso', parent: 'root', transform: { y: -40 } }],
    slot: [{ name: 'corpo', parent: 'torso' }],
    skin: [{ slot: [{ name: 'corpo', display: [{ name: 'body', type: 'image' }] }] }],
    animation: [{
      name: 'parado', duration: 24,
      bone: [{ name: 'torso', translateFrame: [{ duration: 24, x: 0, y: 0 }] }],
    }],
  }],
});

const SPRITER_SCML = `<?xml version="1.0" encoding="UTF-8"?>
<spriter_data scml_version="1.0" generator="BrashMonkey Spriter">
  <folder id="0" name="arte">
    <file id="0" name="arte/body.png" width="76" height="84" pivot_x="0.5" pivot_y="0.5"/>
  </folder>
  <entity id="0" name="boneco">
    <animation id="0" name="parado" length="1000">
      <mainline>
        <key id="0" time="0">
          <object_ref id="0" name="corpo" folder="0" file="0" abs_x="0" abs_y="0" abs_angle="0" abs_scale_x="1" abs_scale_y="1" abs_a="1" z_index="0"/>
        </key>
      </mainline>
      <timeline id="0" name="corpo" object_type="sprite">
        <key id="0" time="0" spin="1">
          <object folder="0" file="0" x="0" y="0" angle="0" scale_x="1" scale_y="1" a="1"/>
        </key>
      </timeline>
    </animation>
  </entity>
</spriter_data>`;

/** Um `File` de texto, que é o que o seletor do navegador entrega. */
function arquivo(nome: string, conteudo: string): File {
  return new File([conteudo], nome, { type: 'text/plain' });
}

describe('importar de outro programa: descobrir qual é', () => {
  it('reconhece os três pelo conteúdo, não pela extensão', () => {
    expect(detectFormat(SPINE_JSON)).toBe('spine');
    expect(detectFormat(DRAGONBONES_JSON)).toBe('dragonbones');
    expect(detectFormat(SPRITER_SCML)).toBe('spriter');
  });

  it('devolve null para o que não é projeto de nenhum dos três', () => {
    expect(detectFormat('{"foo": 1}')).toBeNull();
    expect(detectFormat('isto não é json nem xml')).toBeNull();
    expect(detectFormat(readFileSync(HEROI_ATLAS, 'utf8'))).toBeNull();
  });

  it('não confunde o SCON do Spriter com o JSON do Spine', () => {
    const scon = JSON.stringify({ entity: [{ name: 'x' }], folder: [{ file: [] }] });
    expect(detectFormat(scon)).toBe('spriter');
  });
});

describe('importar de outro programa: a conversão inteira', () => {
  it('um projeto de Spine com atlas junto vira documento e atlas', async () => {
    const importado = await importForeignFiles([
      arquivo('heroi-spine.json', SPINE_JSON),
      arquivo('heroi.atlas', SPINE_ATLAS),
    ]);

    expect(importado.format).toBe('spine');
    expect(importado.path).toBe('heroi-spine.bone');
    expect(importado.file.bones.map((b) => b.name)).toEqual(['root', 'torso', 'cabeca']);
    expect(importado.file.animations?.map((a) => a.name)).toEqual(['balanco']);

    // O atlas veio junto, então ele foi montado e apontado no arquivo.
    expect(importado.atlasName).toBe('heroi-spine.atlas.json');
    expect(importado.file.assets?.atlases).toEqual(['heroi-spine.atlas.json']);
    expect(importado.atlases[0].findRegion('body')).not.toBeNull();
    expect(importado.atlases[0].findRegion('face')).not.toBeNull();
  });

  it('sem o .atlas do Spine, avisa em português e converte assim mesmo', async () => {
    const importado = await importForeignFiles([arquivo('so-o-projeto.json', SPINE_JSON)]);
    expect(importado.file.bones.length).toBe(3);
    expect(importado.warnings.join(' ')).toContain('.atlas do Spine não veio junto');
  });

  it('avisa quando a imagem da página não foi escolhida', async () => {
    const importado = await importForeignFiles([
      arquivo('heroi.json', SPINE_JSON),
      arquivo('heroi.atlas', SPINE_ATLAS),
    ]);
    expect(importado.warnings.join(' ')).toContain('pagina.png');
    expect(importado.warnings.join(' ')).toContain('não veio junto');
  });

  it('lê um projeto de DragonBones', async () => {
    const importado = await importForeignFiles([arquivo('boneco_ske.json', DRAGONBONES_JSON)]);
    expect(importado.format).toBe('dragonbones');
    expect(importado.file.bones.map((b) => b.name)).toContain('torso');
    expect(importado.file.animations?.length).toBe(1);
  });

  it('lê um projeto de Spriter em SCML, sem biblioteca de XML', async () => {
    const importado = await importForeignFiles([arquivo('boneco.scml', SPRITER_SCML)]);
    expect(importado.format).toBe('spriter');
    expect(importado.file.animations?.map((a) => a.name)).toEqual(['parado']);
  });

  it('sem nenhum projeto entre os arquivos, o erro diz o que faltou', async () => {
    await expect(importForeignFiles([arquivo('leia-me.txt', 'oi')]))
      .rejects.toThrow(/Nenhum projeto de Spine, DragonBones ou Spriter/);
  });

  it('a saída passa no validador de esquema', async () => {
    const pasta = pastaTemporaria();
    try {
      const importado = await importForeignFiles([
        arquivo('heroi.json', SPINE_JSON),
        arquivo('heroi.atlas', SPINE_ATLAS),
      ]);
      const caminhoBone = join(pasta, 'saida.bone');
      writeFileSync(caminhoBone, JSON.stringify(importado.file, null, 2));
      const caminhoAtlas = join(pasta, 'saida.atlas.json');
      writeFileSync(caminhoAtlas, JSON.stringify(importado.atlasFile, null, 2));

      const { saida, codigo } = validar(caminhoBone, caminhoAtlas);
      expect(codigo, saida).toBe(0);
      expect(saida).toContain('2 válido(s), 0 com erro.');
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// 4a. Escolher qual parte do arquivo converter
// ---------------------------------------------------------------------------

/** Duas armatures no mesmo arquivo, como um projeto de jogo de verdade. */
function duasArmatures(): string {
  const arm = (nome: string, osso: string) => ({
    name: nome, frameRate: 24,
    bone: [{ name: 'root' }, { name: osso, parent: 'root', transform: { y: -40 } }],
    slot: [{ name: 'corpo', parent: osso }],
    skin: [{ slot: [{ name: 'corpo', display: [{ name: 'body', type: 'image' }] }] }],
    animation: [{ name: 'parado', duration: 24 }],
  });
  return JSON.stringify({
    frameRate: 24, name: 'jogo', version: '5.5',
    armature: [arm('heroi', 'torso'), arm('inimigo', 'corpo')],
  });
}

describe('vários esqueletos num arquivo só', () => {
  it('lista as armatures do DragonBones, para quem for escolher', () => {
    expect(dragonBonesParts(JSON.parse(duasArmatures()))).toEqual(['heroi', 'inimigo']);
  });

  it('sem escolha, converte a primeira e diz como pegar as outras', () => {
    const r = importDragonBones(JSON.parse(duasArmatures()));
    expect(r.file.skeleton?.name).toBe('heroi');
    expect(r.avisos.join(' ')).toContain('--parte <nome>');
  });

  it('com --parte, converte a que foi pedida', () => {
    const r = importDragonBones(JSON.parse(duasArmatures()), undefined, { parte: 'inimigo' });
    expect(r.file.skeleton?.name).toBe('inimigo');
    expect(r.file.bones.map((b) => b.name)).toEqual(['root', 'corpo']);
  });

  it('nome que não existe: o erro lista os nomes que existem', () => {
    expect(() => importDragonBones(JSON.parse(duasArmatures()), undefined, { parte: 'fantasma' }))
      .toThrow(/Tem: heroi, inimigo/);
  });

  it('o mesmo vale para as entities do Spriter', () => {
    const duas = SPRITER_SCML.replace(
      '</entity>',
      '</entity>\n  <entity id="1" name="inimigo"><animation id="0" name="parado" length="1000">'
      + '<mainline><key id="0" time="0"/></mainline></animation></entity>',
    );
    expect(spriterParts(duas)).toEqual(['boneco', 'inimigo']);
    expect(importSpriter(duas).file.skeleton?.name).toBe('boneco');
    expect(importSpriter(duas, { parte: 'inimigo' }).file.skeleton?.name).toBe('inimigo');
    expect(() => importSpriter(duas, { parte: 'ninguem' })).toThrow(/Tem: boneco, inimigo/);
  });

  it('a linha de comando aceita --parte e grava a armature escolhida', () => {
    const pasta = pastaTemporaria();
    try {
      const entrada = join(pasta, 'duas.json');
      writeFileSync(entrada, duasArmatures());
      const saida = join(pasta, 'inimigo.bone');
      execFileSync(process.execPath, [
        join(RAIZ, 'ferramentas', 'importar.mjs'), entrada, saida, '--parte', 'inimigo',
      ], { encoding: 'utf8' });
      const gravado = JSON.parse(readFileSync(saida, 'utf8'));
      expect(gravado.skeleton.name).toBe('inimigo');
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// 4b. "Importar imagens": um slot por imagem, apelido ou não
// ---------------------------------------------------------------------------

describe('importar imagens: cada imagem ganha o seu slot', () => {
  /** Um pack de mentira, no formato que `writeImportIntoFile` recebe. */
  function packDeMentira(): PackedAtlas {
    return {
      atlas: { atlas: { version: '1.0', generator: 'teste' }, scale: 1, pages: [], regions: [] },
      pages: [],
      // "braco_esq" é pixel a pixel igual a "braco_dir", então o empacotador
      // guardou uma região só e pôs o segundo nome em `aliases` (10.5).
      regions: [
        { name: 'cabeca', width: 74, height: 74, originalWidth: 90, originalHeight: 90, aliases: [] },
        { name: 'braco_dir', width: 24, height: 84, originalWidth: 40, originalHeight: 100, aliases: ['braco_esq'] },
      ],
      scale: 1,
      imageCount: 3,
      usage: 0.8,
    } as unknown as PackedAtlas;
  }

  function arquivoVazio(): BoneFile {
    return { bone: { version: '1.0', generator: 'teste' }, bones: [{ name: 'root' }] } as BoneFile;
  }

  it('a imagem que virou apelido também ganha slot e anexo', () => {
    const file = arquivoVazio();
    writeImportIntoFile(file, packDeMentira(), 'teste.atlas.json',
      ['cabeca', 'braco_dir', 'braco_esq']);

    // Três imagens entraram, três slots saíram — mesmo com duas partilhando
    // uma região. Um braço direito e um esquerdo são duas coisas na tela.
    expect(file.slots?.map((s) => s.name)).toEqual(['cabeca', 'braco_dir', 'braco_esq']);
    const anexos = file.skins?.[0].attachments ?? {};
    expect(Object.keys(anexos)).toEqual(['cabeca', 'braco_dir', 'braco_esq']);
    expect(anexos.braco_esq.braco_esq).toMatchObject({ type: 'region', width: 40, height: 100 });
  });

  it('aponta o atlas em assets.atlases uma vez só (2.8)', () => {
    const file = arquivoVazio();
    writeImportIntoFile(file, packDeMentira(), 'teste.atlas.json', ['cabeca']);
    writeImportIntoFile(file, packDeMentira(), 'teste.atlas.json', ['braco_dir']);
    expect(file.assets?.atlases).toEqual(['teste.atlas.json']);
  });

  it('não põe mais os anexos em fila (lote 59): nascem na origem do osso', () => {
    // A fila fez 12 imagens virarem 7.000 px e a cena ir a 9%. Imagem da pasta
    // só entra na cena quando é arrastada, no ponto onde foi solta.
    const file = arquivoVazio();
    writeImportIntoFile(file, packDeMentira(), 'teste.atlas.json', ['cabeca', 'braco_dir']);
    const anexos = file.skins?.[0].attachments ?? {};
    const x = (slot: string): number | undefined =>
      (anexos[slot]?.[slot] as { x?: number } | null)?.x;
    expect(x('cabeca')).toBeUndefined();
    expect(x('braco_dir')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 5. Salvar como binário e como pacote
// ---------------------------------------------------------------------------

describe('salvar como binário e como pacote', () => {
  const texto = readFileSync(HEROI, 'utf8');

  it('o .boneb do editor é menor que o .bone e volta igual', () => {
    const bytes = writeBoneb(parseBoneText(texto));
    expect(bytes.length).toBeLessThan(new TextEncoder().encode(texto).length);
    const devolta = loadSkeletonFile(bytes);
    expect(devolta.encoding).toBe('boneb');
    expect(devolta.data.bones.length).toBe(loadSkeletonFile(new TextEncoder().encode(texto)).data.bones.length);
  });

  it('um pacote montado sem compressor ainda abre (modo Store)', () => {
    const encoder = new TextEncoder();
    const pacote = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'heroi.bone', skeletons: ['heroi.bone'] },
      files: [{ name: 'heroi.bone', data: encoder.encode(texto) }],
    }); // sem codec, que é o caso de um navegador sem CompressionStream
    const aberto = loadSkeletonFile(pacote);
    expect(aberto.encoding).toBe('bonez');
    expect(aberto.data.bones.length).toBeGreaterThan(0);
  });

  it('atlasToJson devolve um atlas que o runtime lê de volta igual', () => {
    const original = loadAtlas(parseBoneText(readFileSync(HEROI_ATLAS, 'utf8')));
    const devolta = loadAtlas(atlasToJson(original));

    expect(devolta.warnings).toEqual([]);
    expect(devolta.scale).toBe(original.scale);
    expect(devolta.pages.map((p) => [p.name, p.image, p.width, p.height]))
      .toEqual(original.pages.map((p) => [p.name, p.image, p.width, p.height]));
    expect(devolta.regions.map((r) => [
      r.name, r.x, r.y, r.width, r.height, r.rotation,
      r.offsetX, r.offsetY, r.originalWidth, r.originalHeight, [...r.aliases],
    ])).toEqual(original.regions.map((r) => [
      r.name, r.x, r.y, r.width, r.height, r.rotation,
      r.offsetX, r.offsetY, r.originalWidth, r.originalHeight, [...r.aliases],
    ]));
  });

  it('o atlas reescrito passa no validador', () => {
    const pasta = pastaTemporaria();
    try {
      const original = loadAtlas(parseBoneText(readFileSync(HEROI_ATLAS, 'utf8')));
      const caminho = join(pasta, 'reescrito.atlas.json');
      writeFileSync(caminho, JSON.stringify(atlasToJson(original), null, 2));
      const { saida, codigo } = validar(caminho);
      expect(codigo, saida).toBe(0);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Os scripts da linha de comando
// ---------------------------------------------------------------------------

describe('package.json: os três comandos novos', () => {
  it('tem importar, empacotar e converter apontando para os .mjs', () => {
    const pacote = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8'));
    expect(pacote.scripts.importar).toBe('node ferramentas/importar.mjs');
    expect(pacote.scripts.empacotar).toBe('node ferramentas/empacotar.mjs');
    expect(pacote.scripts.converter).toBe('node ferramentas/converter.mjs');
  });
});
