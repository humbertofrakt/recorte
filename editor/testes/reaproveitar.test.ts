/**
 * Reaproveitar animação — noite de 04/11/2026. A parte nova: "muitos bonecos,
 * as mesmas animações". Combinar os ossos, ligar, copiar, compartilhar.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { BoneFile } from '../../runtime/src/index.js';
import {
  bodyPartOf, bonesUsedBy, chooseBone, matchBones, matchTitle, rememberedOf, renamesFor,
  translateAnimations,
} from '../src/anim/bone-match.js';

const RAIZ = resolve(__dirname, '..', '..');
const ler = (p: string): BoneFile => JSON.parse(readFileSync(join(RAIZ, p), 'utf8')) as BoneFile;
const PADRAO = ler('formato/rigs/humanoide-v1.bone');
const FABRICA = ler('formato/rigs/humanoide-v1-animacoes.bone');
const HEROI = ler('formato/exemplos/heroi.bone');
const nomes = (f: BoneFile): string[] => (f.bones ?? []).map((b) => b.name);

/** Os nomes do robô da prova (`fazer-bonecos.mjs`): quem montou antes de conhecer o padrão. */
const ROBO = [
  'raiz', 'bacia', 'corpo', 'pescoco', 'cabeca', 'braco_esquerdo', 'antebraco_esquerdo', 'mao_esquerda',
  'braco_direito', 'antebraco_direito', 'mao_direita', 'perna_esquerda', 'canela_esquerda', 'pe_esquerdo',
  'perna_direita', 'canela_direita', 'pe_direito',
];

describe('combinar os ossos: o nome parecido', () => {
  it('lê a parte e o lado em português e em inglês', () => {
    expect(bodyPartOf('braco_direito')).toEqual({ parte: 'braco', lado: 'd' });
    expect(bodyPartOf('braco_d')).toEqual({ parte: 'braco', lado: 'd' });
    expect(bodyPartOf('LeftForeArm')).toEqual({ parte: 'antebraco', lado: 'e' });
    expect(bodyPartOf('perna_esquerda')).toEqual({ parte: 'coxa', lado: 'e' });
    expect(bodyPartOf('hips')).toEqual({ parte: 'quadril', lado: '' });
    expect(bodyPartOf('cape1')).toBeNull();
  });

  it('o robô (nomes diferentes) combina os 14 ossos das animações de fábrica', () => {
    const pede = bonesUsedBy(FABRICA.animations ?? []);
    expect(pede.length).toBe(14);
    // Antes: o mesmo nome só. É o que a janela de hoje faz — e diz "não tem 14 nomes".
    const soNome = pede.filter((n) => ROBO.includes(n)).length;
    expect(soNome).toBe(2); // pescoco e cabeca
    const m = matchBones(pede, ROBO);
    expect(m.matched).toBe(14);
    expect(m.rows.find((r) => r.from === 'braco_d')).toEqual({ from: 'braco_d', to: 'braco_direito', how: 'parecido' });
    expect(m.rows.find((r) => r.from === 'coxa_e')?.to).toBe('perna_esquerda');
    expect(m.rows.find((r) => r.from === 'tronco')?.to).toBe('corpo');
    expect(matchTitle(m)).toBe('Combinar os ossos — combinam 14 de 14');
  });

  it('o herói (inglês, arm e arm_b) combina com o Esqueleto padrão', () => {
    const pede = bonesUsedBy((HEROI.animations ?? []).filter((a) => a.name === 'walk'));
    const m = matchBones(pede, nomes(PADRAO));
    const de = (n: string): string | null => m.rows.find((r) => r.from === n)?.to ?? null;
    expect(de('hips')).toBe('quadril');
    expect(de('torso')).toBe('tronco');
    expect(de('arm')).toBe('braco_d');
    expect(de('arm_b')).toBe('braco_e');
    expect(de('shin_b')).toBe('canela_e');
    expect(de('foot')).toBe('pe_d');
    // O cabelo e a capa não têm par: FALTA, dito, e não um palpite.
    expect(m.rows.filter((r) => r.to === null).map((r) => r.from).sort()).toEqual(
      pede.filter((n) => bodyPartOf(n) === null).sort(),
    );
  });

  it('um osso daqui vale para uma linha só; a escolha tira da outra', () => {
    const m = matchBones(['braco_d', 'mao_d'], ['braco_direito', 'mao_direita']);
    const n = chooseBone(m, 'mao_d', 'braco_direito');
    expect(n.rows.find((r) => r.from === 'braco_d')?.to).toBeNull();
    expect(n.rows.find((r) => r.from === 'mao_d')).toEqual({ from: 'mao_d', to: 'braco_direito', how: 'escolhido' });
    expect(n.matched).toBe(1);
  });

  it('a tabela lembrada vence o parecido, e só guarda o que muda de nome', () => {
    const m = matchBones(['braco_d', 'cabeca'], ['cabeca', 'braco_direito', 'garra'], { braco_d: 'garra' });
    expect(m.rows[0]).toEqual({ from: 'braco_d', to: 'garra', how: 'lembrado' });
    expect(rememberedOf(m)).toEqual({ braco_d: 'garra' });
  });
});

describe('Ligadas: renomear os ossos daqui', () => {
  it('diz o que muda e acha o conflito', () => {
    const m = matchBones(['braco_d', 'tronco'], ['braco_direito', 'corpo', 'braco_d_velho']);
    expect(renamesFor(m, ['braco_direito', 'corpo']).renames).toEqual([
      { de: 'braco_direito', para: 'braco_d' }, { de: 'corpo', para: 'tronco' },
    ]);
    // Um osso daqui já se chama "tronco", e não está na tabela: conflito.
    const c = chooseBone(matchBones(['tronco'], ['corpo', 'tronco']), 'tronco', 'corpo');
    expect(renamesFor(c, ['corpo', 'tronco']).conflicts).toEqual(['tronco']);
  });
});

describe('Cópia: traduzir as chaves', () => {
  it('as timelines de osso vão para o osso daqui; o que não tem onde cair sai contado', () => {
    const walk = (HEROI.animations ?? []).filter((a) => a.name === 'walk');
    const m = matchBones(bonesUsedBy(walk), nomes(PADRAO));
    const t = translateAnimations(walk, m, []);
    const alvos = bonesUsedBy(t.animations);
    expect(alvos.every((a) => nomes(PADRAO).includes(a))).toBe(true);
    expect(alvos).toContain('quadril');
    // As 13 linhas de osso do andar acham par; o slot "hand", a regra "ik_arm" e a
    // variável não têm onde cair num boneco sem eles, e saem DITAS.
    expect(t.dropped).toContain('walk: slot "hand"');
    expect(t.dropped).toContain('walk: constraint "ik_arm"');
    // O original não muda.
    expect(bonesUsedBy(walk)).toContain('hips');
  });
});

// ---------------------------------------------------------------------------
// As compartilhadas tocam no editor
// ---------------------------------------------------------------------------

import { Doc } from '../src/doc/document.js';
import {
  composeShared, forgetSharedFiles, rememberSharedFile, setSharedSupplier,
} from '../src/doc/shared-animations.js';

/** Um boneco do padrão que cita as de fábrica, como a Biblioteca deixa. */
function padraoCitando(uri: string): BoneFile {
  const f = JSON.parse(JSON.stringify(PADRAO)) as BoneFile & { assets?: Record<string, unknown> };
  f.assets = { animations: [uri] };
  f.animations = [];
  return f;
}

describe('as animações compartilhadas tocam no editor', () => {
  it('ANTES (o defeito): sem o arquivo na mão, a base não tem "andar" — e diz que não achou', () => {
    forgetSharedFiles();
    setSharedSupplier(null);
    const doc = new Doc(padraoCitando('humanoide-v1-animacoes.bone'));
    expect(doc.data?.findAnimation('andar') ?? null).toBeNull();
    expect(composeShared(doc.file).missing).toEqual(['humanoide-v1-animacoes.bone']);
  });

  it('com o arquivo lido, "andar" toca, e a lista sabe de onde ele veio', () => {
    forgetSharedFiles();
    rememberSharedFile('humanoide-v1-animacoes.bone', FABRICA);
    const doc = new Doc(padraoCitando('humanoide-v1-animacoes.bone'));
    expect(doc.data?.findAnimation('andar')).not.toBeNull();
    const c = composeShared(doc.file);
    expect(c.origins.get('correr')).toBe('humanoide-v1-animacoes.bone');
    // O documento não ganhou animação nenhuma: o arquivo de fora continua de fora.
    expect(doc.file.animations).toEqual([]);
    forgetSharedFiles();
  });

  it('o dono ao vivo: mudou lá, muda aqui no próximo desenho', () => {
    forgetSharedFiles();
    let duracao = 1;
    setSharedSupplier((uri) => (uri !== 'cavaleiro-animacoes.bone' ? null : {
      ...FABRICA, animations: [{ name: 'andar', duration: duracao, timelines: [] }],
    } as unknown as BoneFile));
    const doc = new Doc(padraoCitando('cavaleiro-animacoes.bone'));
    expect(doc.data?.findAnimation('andar')?.duration).toBe(1);
    duracao = 3;
    doc.rebuild();
    expect(doc.data?.findAnimation('andar')?.duration).toBe(3);
    setSharedSupplier(null);
  });
});

// ---------------------------------------------------------------------------
// Usar animações de outro boneco: Ligadas, Cópia, a base dona
// ---------------------------------------------------------------------------

import {
  baseSource, copyCommand, initialMatch, linkCommand, listShared, ownerSharedFile, PADRAO_URI,
  renameBones, reuseNotice, shareCommand, sharedFileName, sharedFrom,
} from '../src/panels/reuse-model.js';
import type { ReuseSource } from '../src/panels/reuse-model.js';
import { readEditorState } from '../src/contract.js';

const PADRAO_NOMES = nomes(PADRAO);
/** O robô: o padrão com os nomes de quem montou antes de conhecer o padrão. */
function robo(): BoneFile {
  const f = JSON.parse(JSON.stringify(PADRAO)) as BoneFile;
  renameBones(f, PADRAO_NOMES.map((de, i) => ({ de, para: ROBO[i]! })).filter((r) => r.de !== r.para));
  f.animations = [];
  return f;
}
const fabrica = (): ReuseSource => ({
  kind: 'padrao', label: 'Esqueleto padrão', uri: PADRAO_URI, file: FABRICA,
  animations: ['parado', 'andar', 'correr', 'pular'],
});

describe('Ligadas: o robô toca as de fábrica', () => {
  it('ANTES: sem renomear, o robô cita o arquivo e "andar" não mexe osso nenhum', () => {
    forgetSharedFiles();
    rememberSharedFile(PADRAO_URI, FABRICA);
    const f = robo();
    (f as unknown as { assets: unknown }).assets = { animations: [PADRAO_URI] };
    const doc = new Doc(f);
    const andar = doc.data?.findAnimation('andar');
    // A animação existe, mas nenhuma timeline achou osso: a forma do defeito.
    expect(andar).not.toBeNull();
    expect(andar!.timelines.length).toBe(0);
  });

  it('DEPOIS: Ligadas renomeia os 12 ossos, cita o arquivo, e "andar" mexe 14 ossos', () => {
    forgetSharedFiles();
    rememberSharedFile(PADRAO_URI, FABRICA);
    const doc = new Doc(robo());
    const m = initialMatch(doc.file, fabrica(), ['parado', 'andar', 'correr', 'pular']);
    expect(m.matched).toBe(14);
    const r = linkCommand(doc.file, fabrica(), m);
    if ('refused' in r) throw new Error(r.refused);
    doc.run(r.command);
    expect(nomes(doc.file)).toContain('braco_d');
    expect(nomes(doc.file)).not.toContain('braco_direito');
    // O slot do robô segue o osso (o desenho continua no braço).
    expect(doc.data?.findAnimation('andar')!.timelines.length).toBeGreaterThan(10);
    expect(reuseNotice(fabrica(), r.report)).toContain('ligadas: mudam junto com o original');
    expect(reuseNotice(fabrica(), r.report)).toContain('ossos mudaram de nome');
    // A tabela fica lembrada, pelo arquivo.
    expect(readEditorState(doc.file).mapaDeOssos?.[PADRAO_URI]?.['braco_d']).toBe('braco_direito');
    // Um passo de desfazer volta tudo.
    doc.undo();
    expect(nomes(doc.file)).toContain('braco_direito');
    expect((doc.file as unknown as { assets?: { animations?: string[] } }).assets?.animations ?? []).toEqual([]);
  });
});

describe('Cópia: o andar do herói no boneco do padrão', () => {
  it('entra com os nomes daqui, mexe o quadril, e diz o que ficou de fora', () => {
    const host = JSON.parse(JSON.stringify(PADRAO)) as BoneFile;
    host.animations = [];
    const doc = new Doc(host);
    const src: ReuseSource = { kind: 'arquivo', label: 'heroi.bone', uri: 'heroi.bone', file: HEROI, animations: ['walk'] };
    const m = initialMatch(doc.file, src, ['walk']);
    const r = copyCommand(doc.file, src, ['walk'], m);
    doc.run(r.command);
    const walk = (doc.file.animations ?? []).find((a) => a.name === 'walk')!;
    expect(walk).toBeDefined();
    expect(bonesUsedBy([walk])).toContain('quadril');
    expect(bonesUsedBy([walk])).not.toContain('hips');
    expect(reuseNotice(src, r.report)).toContain('copiadas: são só deste boneco');
    expect(r.report.dropped.length).toBeGreaterThan(0);
    doc.undo();
    expect(doc.file.animations).toEqual([]);
  });
});

describe('a base dona: mudar num lugar, os outros mudam', () => {
  it('o cavaleiro compartilha; o goblin cita; mexer no cavaleiro muda o do goblin', () => {
    forgetSharedFiles();
    const cav = new Doc(JSON.parse(JSON.stringify(PADRAO)) as BoneFile);
    cav.file.animations = JSON.parse(JSON.stringify(FABRICA.animations));
    const arquivo = sharedFileName('cavaleiro.bone');
    expect(arquivo).toBe('cavaleiro-animacoes.bone');
    cav.run(shareCommand(arquivo, ['andar', 'correr']));
    setSharedSupplier((uri) => ownerSharedFile(cav.file, uri));
    const fonte = baseSource('cavaleiro.bone', 'cavaleiro', cav.file)!;
    expect(fonte.uri).toBe(arquivo);
    const gob = new Doc(JSON.parse(JSON.stringify(PADRAO)) as BoneFile);
    gob.file.animations = [];
    const r = linkCommand(gob.file, { ...fonte, animations: ['andar', 'correr'] }, initialMatch(gob.file, fonte, ['andar', 'correr']));
    if ('refused' in r) throw new Error(r.refused);
    gob.run(r.command);
    expect(gob.data?.findAnimation('andar')?.duration).toBe(1);
    // Mexer no original (o cavaleiro):
    cav.file.animations!.find((a) => a.name === 'andar')!.duration = 1.5;
    gob.rebuild();
    expect(gob.data?.findAnimation('andar')?.duration).toBe(1.5);
    // A lista diz de onde vem, e quem é a dona.
    const rows = listShared(gob.file, (uri) => (uri === arquivo ? 'cavaleiro.bone' : null));
    expect(rows.map((x) => x.name)).toEqual(['andar', 'correr']);
    expect(sharedFrom(rows[0]!, () => 'cavaleiro')).toBe('do cavaleiro');
    setSharedSupplier(null);
  });

  it('arquivo citado que não se acha vira linha "não achado", nunca lista vazia (regra 21)', () => {
    forgetSharedFiles();
    const f = JSON.parse(JSON.stringify(PADRAO)) as BoneFile & { assets?: unknown };
    f.assets = { animations: ['sumiu.bone'] };
    expect(listShared(f)).toEqual([{ name: null, uri: 'sumiu.bone', duration: 0, loop: false, owner: null }]);
  });
});

// ---------------------------------------------------------------------------
// A prova de pessoa achou (05/11): a Cópia do "walk" deixava o cavaleiro
// INVÁLIDO — a ordem citava o slot "arm" e o evento "step", que ele não tem.
// ---------------------------------------------------------------------------

// O mesmo núcleo do validador de linha de comando e do site.
import { checarSemantica } from '../../site/validador/nucleo.js';

describe('a Cópia não deixa o boneco inválido', () => {
  it('a ordem, o evento e a etiqueta que citam nomes que este boneco não tem saem, ditos', () => {
    const host = JSON.parse(JSON.stringify(PADRAO)) as BoneFile;
    host.animations = [];
    const doc = new Doc(host);
    const src: ReuseSource = { kind: 'arquivo', label: 'heroi.bone', uri: 'heroi.bone', file: HEROI, animations: ['walk'] };
    const r = copyCommand(doc.file, src, ['walk'], initialMatch(doc.file, src, ['walk']));
    doc.run(r.command);
    const walk = (doc.file.animations ?? []).find((a) => a.name === 'walk')!;
    const json = JSON.stringify(walk);
    expect(json).not.toContain('"slot":"arm"');
    expect(json).not.toContain('"event":"step"');
    expect(r.report.dropped).toContain('walk: evento "step"');
    expect(r.report.dropped).toContain('walk: ordem do slot "arm"');
    const problemas = checarSemantica(JSON.parse(doc.serialize())) as Array<{ gravidade: string; codigo: string }>;
    expect(problemas.filter((x) => x.gravidade === 'erro').map((x) => x.codigo)).toEqual([]);
  });
});
