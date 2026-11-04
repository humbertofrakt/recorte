/**
 * **Os modelos prontos de partícula** — rodada final, Ficha B, lote 1 (28/09/2026).
 *
 * 🗣️ *"Partícula. Eu não sei onde é que acha partícula nesse programa."*
 *
 * O emissor tinha porta desde a v21.9 — `Esqueleto → Novo` e o `Novo ▾` da
 * Árvore — e o Humberto não a achou. E quem achasse ganhava um emissor que **não
 * desenha nada**: sem imagem, a §9.8 da extensão manda usar o nome do anexo
 * como região, e nome de anexo não é imagem. Duas barreiras antes de ver
 * qualquer coisa se mexer.
 *
 * Este módulo tira as duas. A referência está em
 * `documentos/pesquisa/nova pesquisa/REFERENCIA particulas 2026-09-28.md`:
 * Spriter, Spine e DragonBones não têm partícula; Unity e Cocos põem a
 * partícula numa categoria própria, "Effects"; o GDX Particle Editor tem um
 * botão **Template** com chama, fumaça e faíscas. Daí:
 *
 * | O quê | Onde |
 * |:---|:---|
 * | quatro modelos — fogo, fumaça, faísca, poeira — só com campos da extensão | `PARTICLE_PRESETS` |
 * | a imagem que vem com eles: um ponto branco de borda suave | `softDotPixels` |
 * | o comando que cria, num passo de desfazer só | `AddPresetEmitter` |
 * | o menu do botão da barra da cena | `particleMenuItems` |
 *
 * **Nenhum campo novo.** Tudo o que um modelo escreve já está na §9 da
 * extensão: o modelo é um emissor com os campos preenchidos, e nada mais.
 *
 * **Mistura normal nos quatro, e foi a foto que decidiu.** O fogo nasceu com o
 * slot aditivo, como se faz em jogo — e na foto do lote saiu um borrão BRANCO:
 * aditivo sobre o fundo claro da cena satura. Quem quer aditivo muda o `blend`
 * do slot (§9.9: a mistura mora no slot, não no emissor).
 *
 * **Por que a imagem é pintada aqui, e não escolhida.** Pegar uma imagem do
 * personagem para servir de partícula seria um palpite silencioso (regra 21 da
 * casa): o fogo sairia feito de cabeças do herói. O ponto suave é branco, e a
 * cor vem de `startColor` e `colorOverLifetime` — é assim que a partícula é
 * tingida em todo programa da referência.
 */

import type { AtlasData, AtlasPageData, AttachmentDef, BoneFile } from '../../../runtime/src/index.js';
import type { PackerItem } from '../../../ferramentas/src/atlas/packer.js';
import type { EditorDoc, Selection } from '../contract.js';
import { corpoDe, emptySelection } from '../contract.js';
import { isOwnBone, shownBoneOfSlot } from '../doc/own-bone.js';
import { boneTip, distanceToSegment } from '../viewport/picking.js';
import { viewCenter } from '../viewport/view-center.js';
import {
  addImportedItems, importedStock, mergedAssets, packImportedStock, restoreImportedStock,
  setImportedAtlas, type ImportedAtlas, type ImportedStock,
} from '../io/import-images.js';
import { visibleSkinsOf } from '../viewport/onion.js';
import { AddParticleEmitter, particleAttachment } from './tree-commands.js';

// ---------------------------------------------------------------------------
// A imagem: um ponto branco de borda suave
// ---------------------------------------------------------------------------

/** O nome da região da imagem que vem com os modelos. */
export const SOFT_DOT_REGION = 'fx/ponto-suave';

/** O lado da imagem, em px. Pequeno: `scale` do emissor a aumenta. */
export const SOFT_DOT_SIZE = 32;

/**
 * Os pixels do ponto suave, RGBA de 8 bits, linha a linha de cima para baixo.
 *
 * Branco em tudo; o alfa cai do centro para a borda como `(1 − d)²`, com `d` a
 * distância ao centro medida em raios. Fora do círculo, alfa zero. **Puro**: o
 * teste confere o centro, a borda e os cantos sem navegador.
 */
export function softDotPixels(size = SOFT_DOT_SIZE): Uint8Array {
  const pixels = new Uint8Array(size * size * 4);
  const r = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Pelo centro do pixel, para a imagem sair simétrica.
      const d = Math.hypot(x + 0.5 - r, y + 0.5 - r) / r;
      const a = d >= 1 ? 0 : (1 - d) * (1 - d);
      const at = (y * size + x) * 4;
      pixels[at] = 255;
      pixels[at + 1] = 255;
      pixels[at + 2] = 255;
      pixels[at + 3] = Math.round(a * 255);
    }
  }
  return pixels;
}

/** A imagem como o empacotador a recebe. */
export function softDotItem(): PackerItem {
  return { name: SOFT_DOT_REGION, width: SOFT_DOT_SIZE, height: SOFT_DOT_SIZE, pixels: softDotPixels() };
}

/** `true` quando algum atlas carregado já tem a região do ponto suave. */
export function hasSoftDot(atlases: readonly AtlasData[]): boolean {
  return atlases.some((atlas) => atlas.regions.some(
    (region) => region.name === SOFT_DOT_REGION || region.aliases.includes(SOFT_DOT_REGION),
  ));
}

// ---------------------------------------------------------------------------
// Os quatro modelos
// ---------------------------------------------------------------------------

export type PresetId = 'fogo' | 'fumaca' | 'faisca' | 'poeira' | 'vazio';

/** Um modelo pronto: o nome, a dica e os campos do emissor. */
export interface ParticlePreset {
  readonly id: PresetId;
  /** O nome no menu, em português. */
  readonly label: string;
  /** A dica: o que ele faz, e o que mudar primeiro. */
  readonly hint: string;
  /**
   * Os campos do emissor, todos da §9 da extensão. **Sem `type`, `seed` e
   * `path`**: esses três o comando põe — a semente é tirada na hora (§9.9, duas
   * fogueiras nunca com a mesma), e a imagem é a do ponto suave.
   */
  readonly fields: Readonly<Record<string, unknown>>;
}

/**
 * Os quatro, na ordem da ficha. Os números saíram de olhar a tela, com o herói
 * aberto, e foram escolhidos para **se verem de primeira** — quem quer outro
 * fogo muda na ficha. Y para cima, `direction: 90` aponta para cima (§9).
 */
export const PARTICLE_PRESETS: readonly ParticlePreset[] = Object.freeze([
  {
    id: 'fogo',
    label: 'Fogo',
    // Rodada 38, lote 5: a dica diz que é um emissor NOVO, começado deste exemplo,
    // e os três ou quatro números que o fazem ser o que é (doc 35).
    hint: 'Um emissor novo, já como fogo: mude o que quiser na ficha. O que o faz fogo: vida curta (0,6 a 1 s), '
      + 'sobe rápido (60 a 110 px/s), encolhe na vida, amarelo no pé e vermelho na ponta',
    // Rodada 38, lote 1: os três exemplos ficaram maiores. Na foto
    // `06_exemplos_todos` o fogo era uma chama de ~30 px, a fumaça uma mancha
    // cinza-clara sobre a grade, e a faísca sumia depois do primeiro estouro.
    fields: {
      rate: 40,
      lifetime: [0.6, 1],
      maxParticles: 200,
      shape: 'circle',
      radius: 10,
      speed: [60, 110],
      direction: 90,
      spread: 12,
      gravity: [0, 60],
      drag: 0.5,
      scale: [1.6, 2.4],
      scaleOverLifetime: [{ time: 0, value: 1 }, { time: 1, value: 0.2 }],
      colorOverLifetime: [
        { time: 0, value: [1, 0.95, 0.6, 1] },
        { time: 0.4, value: [1, 0.5, 0.1, 0.9] },
        { time: 1, value: [0.5, 0.1, 0.05, 0] },
      ],
      space: 'world',
    },
  },
  {
    id: 'fumaca',
    label: 'Fumaça',
    hint: 'Um emissor novo, já como fumaça: mude o que quiser na ficha. O que a faz fumaça: vida longa (1,8 a 2,6 s), '
      + 'sobe devagar (30 a 55 px/s), cresce 2,5 vezes, aparece e some. Solta do osso: fica para trás quando ele anda',
    fields: {
      rate: 10,
      lifetime: [1.8, 2.6],
      maxParticles: 200,
      shape: 'circle',
      radius: 12,
      speed: [30, 55],
      direction: 90,
      spread: 20,
      drag: 0.3,
      angle: [0, 360],
      angularVelocity: [-40, 40],
      scale: [1.6, 2.2],
      scaleOverLifetime: [{ time: 0, value: 0.6 }, { time: 1, value: 2.5 }],
      // Cinza ESCURO: o fundo da cena é claro, e o cinza-claro de antes sumia nele.
      startColor: [[0.35, 0.35, 0.35, 1], [0.5, 0.5, 0.5, 1]],
      alphaOverLifetime: [{ time: 0, value: 0 }, { time: 0.15, value: 0.75 }, { time: 1, value: 0 }],
      space: 'world',
    },
  },
  {
    id: 'faisca',
    label: 'Faísca',
    hint: 'Um emissor novo, já como faísca: mude o que quiser na ficha. O que a faz faísca: taxa 0 e dois estouros '
      + '(0 e 0,5 s) de 40, vida curtíssima (0,3 a 0,6 s), rápida (180 a 320 px/s), Abertura 180 (para todos os lados; sem ela sai numa coluna), '
      + 'tamanho 0,7 a 1,1, laranja que escurece até vermelho-escuro no fim da vida (branco e amarelo-claro somem no fundo claro), '
      + 'cai (gravidade −400) e vira com o voo.' + ' Para escurecer: aba Cor, barra Cor na vida — o clique põe as duas pontas; duplo clique na ponta da direita troca a cor',
    fields: {
      rate: 0,
      // Dois estouros, a 0 e a 0,5 s: cabem até na animação mais curta do herói
      // (0,6 s), e a faísca não some depois do primeiro (§4.3: `time + c·interval`).
      // Rodada 38, lote 6 (doc 38): a faísca pronta era quase invisível. Mais
      // faíscas, maiores, laranja cheio (o amarelo-claro sumia no fundo claro).
      bursts: [{ time: 0, count: 40, cycles: 2, interval: 0.5 }],
      lifetime: [0.3, 0.6],
      maxParticles: 100,
      speed: [180, 320],
      direction: 90,
      spread: 180,
      gravity: [0, -400],
      alignToVelocity: true,
      scale: [0.7, 1.1],
      startColor: [[1, 0.55, 0.1, 1], [1, 0.3, 0.05, 1]],
      // Rodada 42, lote 1 (doc 41): ainda pálida no fundo claro. Escurece até
      // vermelho-escuro (a cor na vida multiplica a de nascer, §9.7) e fica
      // inteira até 75 % da vida: o fim escuro chega a ser visto.
      colorOverLifetime: [{ time: 0, value: [1, 1, 1, 1] }, { time: 1, value: [0.45, 0.2, 0.1, 1] }],
      alphaOverLifetime: [{ time: 0, value: 1 }, { time: 0.75, value: 1 }, { time: 1, value: 0 }],
      space: 'world',
    },
  },
  {
    id: 'poeira',
    label: 'Poeira',
    hint: 'Um emissor novo, já como poeira: mude o que quiser na ficha. O que a faz poeira: nasce numa faixa '
      + '(retângulo 40 × 4), devagar (10 a 30 px/s), bege-claro a pardo, cresce e assenta. Bom no pé',
    fields: {
      rate: 15,
      lifetime: [0.6, 1],
      maxParticles: 100,
      shape: 'rectangle',
      size: [40, 4],
      speed: [10, 30],
      direction: 90,
      spread: 60,
      gravity: [0, -20],
      drag: 1,
      scale: [0.5, 0.9],
      scaleOverLifetime: [{ time: 0, value: 0.5 }, { time: 1, value: 1.5 }],
      startColor: [[0.7, 0.6, 0.45, 1], [0.6, 0.5, 0.4, 1]],
      alphaOverLifetime: [{ time: 0, value: 0.8 }, { time: 1, value: 0 }],
      space: 'world',
    },
  },
]);

/**
 * **O emissor vazio** — rodada 15, linha 7 (04/10/2026).
 *
 * Nascia `{ type, seed }` e mais nada: sem imagem, a §9.8 usa o nome do anexo
 * como região, o carregador não acha, e o emissor **não desenha nada** (foto
 * 04 da rodada 15). Agora ele nasce com o ponto suave, como os quatro modelos,
 * e com os padrões da extensão em tudo o mais: dez por segundo, para cima, a
 * 100 px/s, um segundo de vida. Um fio de pontos que se vê de primeira.
 *
 * **Os campos continuam ausentes**: o padrão é o da extensão, e um padrão
 * escrito no arquivo deixaria de segui-la (o mesmo motivo de `particleAttachment`).
 * Só o `path` entra, porque sem ele não há o que desenhar.
 */
export const EMPTY_PRESET: ParticlePreset = Object.freeze({
  id: 'vazio',
  label: 'Emissor vazio',
  hint: 'Um emissor com o ponto suave e os padrões da extensão: tudo se muda em Propriedades',
  // Rodada 38, lote 5 (doc 35): o vazio eram pontinhos brancos pálidos, que
  // sumiam no fundo claro da cena. Nasce agora com o que se vê: mais pontos,
  // maiores, magenta, que somem no fim da vida. O resto segue a extensão.
  fields: Object.freeze({
    rate: 20,
    scale: [1.2, 1.6],
    // Magenta: azul sumia na roupa do herói (foto `a0_novo_vazio`, lote 5).
    startColor: [[0.85, 0.2, 0.6, 1], [0.95, 0.3, 0.7, 1]],
    alphaOverLifetime: [{ time: 0, value: 1 }, { time: 1, value: 0 }],
  }),
});

/**
 * O id de ação de um modelo — decisão P5: botão sem id não aparece no menu nem
 * na busca de comandos. É o MESMO id no botão da barra e no menu Animação →
 * Efeitos de chave, uma porta só.
 */
export function presetActionId(preset: ParticlePreset): string {
  // O vazio é o "Emissor de partículas" de sempre: o id que já existia.
  return preset.id === 'vazio' ? 'novo-emissor' : `particulas-${preset.id}`;
}

/**
 * **Em que osso o emissor novo nasce** — rodada 15, linha 6.
 *
 * | Escolhido | Nasce em |
 * |:---|:---|
 * | um osso | nele |
 * | uma imagem (ou outra peça) | no osso dela — o que a pessoa vê, não o osso próprio (8d) |
 * | nada | no osso **mais perto do meio da cena**, que se vê e se clica |
 *
 * Antes, sem nada escolhido, ele nascia na **raiz**: invisível, e o clique
 * não a pega (foto 04). A raiz só fica quando ela é o único osso.
 *
 * `center` é o meio do que a câmera mostra (`viewport/view-center.ts`), ou
 * `null` sem cena: aí vale o primeiro osso que se vê.
 */
export function boneForNewEmitter(
  file: BoneFile, selection: Selection, bones: readonly SceneBone[], center: { x: number; y: number } | null,
): { bone: string; nearCenter: boolean } | null {
  const escolhido = selection.bones[0];
  if (escolhido !== undefined) return { bone: escolhido, nearCenter: false };
  const peca = selection.attachments[0]?.slot ?? selection.slots[0];
  if (peca !== undefined) {
    const doSlot = shownBoneOfSlot(file, peca);
    if (doSlot !== null) return { bone: doSlot, nearCenter: false };
  }
  const raiz = file.bones?.[0]?.name;
  if (raiz === undefined) return null;
  const candidatos = bones.filter((b) => b.name !== raiz && b.visible && !isOwnBone(file, b.name));
  if (candidatos.length === 0) return { bone: raiz, nearCenter: false };
  if (center === null) return { bone: candidatos[0]!.name, nearCenter: false };
  let melhor = candidatos[0]!;
  let menor = Infinity;
  for (const b of candidatos) {
    const d = distanceToSegment(center.x, center.y, b.x, b.y, b.tipX, b.tipY);
    if (d < menor) { menor = d; melhor = b; }
  }
  return { bone: melhor.name, nearCenter: true };
}

/** Um osso da cena, como a escolha do lugar o lê: origem, ponta e se se vê. */
export interface SceneBone {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly tipX: number;
  readonly tipY: number;
  readonly visible: boolean;
}

/** `x`, `y`, `rotation` do emissor novo no osso (§9.10 da extensão). */
export interface EmitterPlacement {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
}

/**
 * **Onde, dentro do osso, o emissor novo nasce** — rodada 15, depois do lote 2.
 *
 * Duas coisas, as duas pela §9.10:
 *
 * - **apontando para cima no mundo**: o `rotation` desfaz o giro do osso. Na
 *   foto 21 o emissor vazio, no tronco do herói (girado 90°), soltava o jato
 *   para a ESQUERDA — `direction 90` é do osso, não do mundo. Quem nasce num
 *   osso torto não deve nascer torto;
 * - **no meio da cena**, quando ninguém escolheu o osso (`center` não nulo): o
 *   `x`, `y` levam a origem do emissor ao ponto do meio, medido no osso.
 *
 * `bone` é a matriz de mundo do osso. Números arredondados a 0,01: o arquivo
 * não precisa de quinze casas para um lugar escolhido pelo programa.
 */
export function placementFor(
  bone: { a: number; b: number; c: number; d: number; worldX: number; worldY: number },
  center: { x: number; y: number } | null,
): EmitterPlacement {
  const r2 = (v: number): number => {
    const r = Math.round(v * 100) / 100;
    return r === 0 ? 0 : r;
  };
  const giro = r2(-(Math.atan2(bone.c, bone.a) * 180) / Math.PI);
  if (center === null) return { x: 0, y: 0, rotation: giro };
  const det = bone.a * bone.d - bone.b * bone.c;
  if (Math.abs(det) < 1e-12) return { x: 0, y: 0, rotation: giro };
  const dx = center.x - bone.worldX;
  const dy = center.y - bone.worldY;
  return { x: r2((bone.d * dx - bone.b * dy) / det), y: r2((bone.a * dy - bone.c * dx) / det), rotation: giro };
}

/** Os ossos do esqueleto posado do documento, para `boneForNewEmitter`. */
export function sceneBonesOf(doc: EditorDoc): SceneBone[] {
  const sk = corpoDe(doc).skeleton ?? doc.skeleton;
  if (sk === null) return [];
  return sk.bones.map((b) => {
    const tip = boneTip(b);
    return { name: b.data.name, x: b.worldX, y: b.worldY, tipX: tip.x, tipY: tip.y, visible: b.data.visible !== false };
  });
}

/** O modelo pelo id, ou `null`. */
export function presetById(id: string): ParticlePreset | null {
  return PARTICLE_PRESETS.find((preset) => preset.id === id) ?? null;
}

/**
 * O anexo de um modelo: o emissor cru (tipo e semente) com a imagem e os campos
 * do modelo por cima. **Cópia funda**: dois emissores do mesmo modelo não podem
 * dividir a mesma lista de chaves, senão mexer num mexe no outro.
 */
export function presetAttachment(preset: ParticlePreset, seed: number): AttachmentDef {
  const fields = JSON.parse(JSON.stringify(preset.fields)) as Record<string, unknown>;
  return {
    ...(particleAttachment(seed) as unknown as Record<string, unknown>),
    path: SOFT_DOT_REGION,
    ...fields,
  } as unknown as AttachmentDef;
}

// ---------------------------------------------------------------------------
// O comando
// ---------------------------------------------------------------------------

/**
 * O documento que troca os atlas da cena. `Doc` tem; o contrato não, porque
 * quase nenhum módulo tem por que trocá-los — a mesma vista estreita do
 * `io/import-images.ts`.
 */
interface AssetHolder extends EditorDoc {
  setAssets(atlases: readonly AtlasData[], images: ReadonlyMap<string, CanvasImageSource>): void;
}

function asHolder(doc: EditorDoc): AssetHolder | null {
  const holder = doc as AssetHolder;
  return typeof holder.setAssets === 'function' ? holder : null;
}

/** A imagem que entra com o modelo: o pacote pronto e o item que o formou. */
export interface PresetImage {
  readonly atlas: ImportedAtlas;
  readonly item: PackerItem;
}

/**
 * **Criar um emissor de um modelo pronto** — UM passo de desfazer.
 *
 * É o `AddParticleEmitter` (a semente nova, o slot, a pele, a `extensionsUsed`),
 * mais três coisas que ele não faz:
 *
 * 1. o anexo sai com os campos do modelo e `path` no ponto suave;
 * 2. quando o documento ainda não tem o ponto suave, **a imagem entra junto**:
 *    no acervo de imagens do documento (o mesmo do "Importar imagens" e do
 *    PSD), no `assets.atlases` do arquivo, e na cena. O Salvar grava esse
 *    acervo como atlas ao lado do `.bone` — a imagem não some ao reabrir.
 *
 * O desfazer devolve as duas: o slot sai, o `assets` do
 * arquivo volta **letra por letra**, o acervo volta ao que era e a cena ganha os
 * atlas de antes.
 *
 * O pacote chega **pronto** no construtor (`image`), e não é feito aqui: montar
 * a página pede um `<canvas>`, e o comando tem de rodar num teste sem navegador.
 */
export class AddPresetEmitter extends AddParticleEmitter {
  readonly preset: ParticlePreset;
  private readonly image: PresetImage | null;
  /** O `assets` do arquivo antes, em texto; `null` = não havia `assets`. */
  private previousAssets: string | null = null;
  private previousStock: ImportedStock | null = null;
  private previousScene: { atlases: readonly AtlasData[]; images: Map<string, CanvasImageSource> } | null = null;

  /** Onde ele nasce dentro do osso (§9.10 da extensão), ou `null` = na origem do osso. */
  private readonly place: EmitterPlacement | null;

  constructor(
    file: BoneFile, bone: string, visibleSkins: readonly string[],
    preset: ParticlePreset, image: PresetImage | null, place: EmitterPlacement | null = null,
  ) {
    super(file, bone, visibleSkins);
    this.preset = preset;
    this.image = image;
    this.place = place;
  }

  protected override build(): AttachmentDef {
    const def = presetAttachment(this.preset, this.seed) as unknown as Record<string, unknown>;
    if (this.place !== null) {
      // Só o que não é zero: o padrão da §9.10 é zero, e o arquivo carrega só
      // o que a pessoa (ou o lugar) escolheu.
      if (this.place.x !== 0) def['x'] = this.place.x;
      if (this.place.y !== 0) def['y'] = this.place.y;
      if (this.place.rotation !== 0) def['rotation'] = this.place.rotation;
    }
    return def as unknown as AttachmentDef;
  }

  override apply(doc: EditorDoc): void {
    super.apply(doc);
    const file = doc.file;
    if (this.image === null) return;

    this.previousAssets = file.assets === undefined ? null : JSON.stringify(file.assets);
    // A referência ao atlas (§2.8), como o "Importar imagens" escreve.
    file.assets ??= {};
    const listed = file.assets.atlases ?? [];
    file.assets.atlases = listed.includes(this.image.atlas.fileName)
      ? [...listed]
      : [...listed, this.image.atlas.fileName];

    const holder = asHolder(doc);
    if (holder !== null) this.previousScene = sceneOf(holder);
    this.previousStock = importedStock(doc);
    addImportedItems(doc, [this.image.item]);
    setImportedAtlas(doc, this.image.atlas);
    if (holder !== null && this.previousScene !== null) {
      const merged = mergedAssets(this.previousScene, this.previousStock.current?.data ?? null, this.image.atlas);
      holder.setAssets(merged.atlases, merged.images);
    }
  }

  override revert(doc: EditorDoc): void {
    if (this.image !== null) {
      const file = doc.file as BoneFile & { assets?: unknown };
      if (this.previousAssets === null) delete file.assets;
      else file.assets = JSON.parse(this.previousAssets) as BoneFile['assets'];
      if (this.previousStock !== null) restoreImportedStock(doc, this.previousStock);
      const holder = asHolder(doc);
      if (holder !== null && this.previousScene !== null) {
        holder.setAssets(this.previousScene.atlases, this.previousScene.images);
      }
    }
    super.revert(doc);
  }
}

/** Os atlas e as imagens que a cena desenha agora. */
function sceneOf(holder: AssetHolder): { atlases: readonly AtlasData[]; images: Map<string, CanvasImageSource> } {
  return {
    atlases: holder.atlases,
    images: new Map(holder.atlases.flatMap((atlas) => atlas.pages.map(
      (page: AtlasPageData) => [page.image, holder.imageFor(page)] as const,
    ).filter((pair): pair is readonly [string, CanvasImageSource] => pair[1] !== null))),
  };
}

// ---------------------------------------------------------------------------
// O gesto
// ---------------------------------------------------------------------------

/**
 * Cria o emissor do modelo no osso escolhido — ou no primeiro, como o
 * "Emissor de partículas" do menu. Nasce **escolhido**, para Propriedades abrir
 * nele: é o que Unity e Godot fazem com o que acabou de nascer.
 *
 * O pacote da imagem é montado AQUI, no navegador, e só quando falta: um
 * documento que já tem o ponto suave (o segundo fogo, ou um arquivo salvo e
 * reaberto) não empacota de novo.
 */
export function addPresetEmitter(doc: EditorDoc, preset: ParticlePreset): void {
  const corpo = corpoDe(doc);
  const onde = boneForNewEmitter(corpo.file, doc.selection, sceneBonesOf(doc), viewCenter());
  if (onde === null) {
    doc.notice('Crie um osso antes de criar um emissor de partículas');
    return;
  }
  const bone = onde.bone;
  let image: PresetImage | null = null;
  if (!hasSoftDot(corpo.atlases)) {
    const item = softDotItem();
    // Empacotar pede um `<canvas>`. Sem ele (um teste sem navegador) o emissor
    // nasce sem a imagem, e o aviso "sem imagem" diz — nunca um verde calado.
    try {
      image = { atlas: packImportedStock(corpo, [item], {}, 'particulas'), item };
    } catch {
      image = null;
    }
  }
  // §9.10: nasce apontando para cima no mundo; e no meio da cena quando o osso
  // foi escolhido pelo programa, e não pela pessoa.
  const vivo = (corpo.skeleton ?? doc.skeleton)?.findBone(bone) ?? null;
  const place = vivo === null ? null : placementFor(vivo, onde.nearCenter ? viewCenter() : null);
  // Conserto 6 da conferência (05/10): clicar Fogo de novo criava um segundo
  // emissor no mesmo osso sem dizer. Agora diz, com os nomes.
  const vizinhos = emittersOnBone(corpo.file, bone);
  const command = new AddPresetEmitter(corpo.file, bone, visibleSkinsOf(doc), preset, image, place);
  corpo.run(command);
  doc.select({
    ...emptySelection(),
    attachments: [{ slot: command.name, attachment: command.name }],
  });
  const extra = image === null ? '' : ` A imagem ${SOFT_DOT_REGION} entrou junto.`;
  const perto = onde.nearCenter ? ' (o mais perto do meio da cena)' : '';
  const outro = vizinhos.length === 0 ? '' : `Mais um emissor neste osso (já havia ${vizinhos.join(', ')}). `;
  doc.notice(`${outro}${preset.label}: emissor ${command.name} no osso ${bone}${perto}, semente ${command.seed}. Toque a animação para ver.${extra} Os campos estão em Propriedades`);
}

/** Os emissores que já moram num osso (os slots dele com um anexo de partícula, em qualquer pele). */
export function emittersOnBone(file: BoneFile, bone: string): string[] {
  const nomes: string[] = [];
  for (const slot of file.slots ?? []) {
    if (slot.bone !== bone) continue;
    for (const skin of file.skins ?? []) {
      const porNome = (skin.attachments as Record<string, Record<string, { type?: string }>> | undefined)?.[slot.name] ?? {};
      for (const [nome, def] of Object.entries(porNome)) {
        if (def?.type === 'BONE_particle' && !nomes.includes(nome)) nomes.push(nome);
      }
    }
  }
  return nomes;
}

// ---------------------------------------------------------------------------
// O menu do botão da barra da cena
// ---------------------------------------------------------------------------

/** Uma linha do menu: o nome, a dica, o modelo (`null` = o emissor vazio) e a ação. */
export interface ParticleMenuItem {
  readonly label: string;
  readonly hint: string;
  readonly preset: ParticlePreset | null;
  /** O id de ação que a linha roda: a MESMA porta do menu da barra de cima. */
  readonly action: string;
}

/**
 * As cinco linhas do menu, na ordem: o vazio primeiro — é o que já existia, e
 * quem sabe o que quer começa dele —, depois os quatro modelos.
 */
export function particleMenuItems(): ParticleMenuItem[] {
  return [
    {
      label: 'Novo: vazio',
      hint: 'Um emissor novo, magenta, subindo: o ponto de partida para fazer o seu. Tudo se muda em Propriedades',
      preset: null,
      action: 'novo-emissor',
    },
    ...PARTICLE_PRESETS.map((preset) => ({
      label: `Novo: ${preset.label.toLowerCase()}`, hint: preset.hint, preset, action: presetActionId(preset),
    })),
  ];
}

/** A dica do botão da barra: o nome e o que ele abre. */
export const PARTICLE_BUTTON_HINT =
  'Partículas: cria um emissor no osso escolhido — vazio, ou pronto: fogo, fumaça, faísca, poeira';

/**
 * **Quais botões mostram a palavra ao lado do ícone** — decisão P38 (29/09/2026).
 *
 * Achados J12 e L1: a dica existia nos 26 botões da barra, e mesmo assim o
 * botão de criar osso e o pincel de pesos "não se acham" — o nome só aparecia
 * passando o mouse. A regra do Humberto fica de pé (botão em ícone, nome na
 * dica), com duas exceções que são o modelo do Spine:
 *
 * - a **ferramenta escolhida** mostra o nome dela: é a que está na mão, e dizer
 *   qual é custa uma palavra só;
 * - **Partículas** mostra a palavra sempre: é a porta que o Humberto não achou.
 *
 * Com a preferência "nome ao lado do ícone" ligada, todos mostram, como antes.
 * Pura, para o teste sem navegador. Mora aqui, e não em `viewport-toolbar.ts`,
 * porque importar a barra puxa a cena inteira (`viewport.ts`), e isso muda a
 * ordem em que as ferramentas se registram — medido: o teste "escolher vem
 * antes de criar" de `cena.test.ts` ficou vermelho só com o `import`.
 */
export function wordOnBar(id: string, activeTool: string, prefOn: boolean): boolean {
  if (prefOn) return true;
  if (!WORDS_ON_BAR) return false;
  return id === 'particulas' || id === activeTool;
}

/**
 * **A chave das duas palavras** (P38), numa linha só. Medido em 29/09, 05:1x:
 * com as duas palavras a barra pede +145 px em 1440×900 (Transformar na mão) e
 * +305 px em 1280×720. O "Mais ▾" do chat P recolhe o resto; se ele não entrar
 * na versão, esta linha vira `false` e a barra volta a ser só ícones — a
 * preferência "nome ao lado do ícone" continua valendo.
 */
export const WORDS_ON_BAR = true;
