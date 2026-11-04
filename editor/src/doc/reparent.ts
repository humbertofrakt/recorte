/**
 * Trocar de pai sem mexer no que está na tela — anotação 19, lote 34.
 *
 * Até aqui, reparentar guardava a pose **local**: o osso mantinha `x`, `y` e o
 * giro que tinha, e como esses números passam a ser medidos a partir de outro
 * pai, o desenho **pulava de lugar**. Não era novo — os três caminhos faziam
 * assim desde sempre —, mas o gesto do lote 31 pôs isso à vista: com o `P`
 * segurado, cada clique jogava um filho para o outro lado da tela.
 *
 * O Spriter e o Spine guardam a pose de **mundo**: o filho fica onde está, e o
 * que muda é de quem ele passa a depender. A conta é
 *
 *     L' = P'⁻¹ · W
 *
 * — a mesma do **Compensar** do lote 6 —, onde `W` é a matriz de mundo de antes
 * e `P'` a do novo pai. Quem sabe fazê-la é o `localFromWorld`, e é ele que
 * este arquivo usa: não há uma segunda decomposição de matriz no projeto.
 *
 * **Um comando só.** Havia três: `ReparentBone` (arrasto na Árvore),
 * `ReparentMany` (a tecla `P` e o menu) e o campo **Osso** do painel
 * Propriedades, que escrevia `slot.bone` direto. Três códigos para o mesmo
 * trabalho é onde um deles envelhece sozinho.
 */

import type { AttachmentDef, BoneDef, BoneFile, Matrix2x3 } from '../../../runtime/src/index.js';
import { ownBoneOfSlot } from './own-bone.js';
import { Skeleton, applyAnimation, loadSkeletonData } from '../../../runtime/src/index.js';
import { corpoDe } from '../contract.js';
import type { ChangeKind, Command, EditorDoc, Selection } from '../contract.js';
import { canReparent, reparentVerdict, sortBonesTopologically, type ParentMap } from './bones.js';
import { fixAttachment, fixMatrix, localFromWorld } from './world-math.js';
import { boneTarget, findTimeline, keepStartKey, keyTimes, roundTime, setKey, setupValueFor, slotTarget, valueAt } from '../anim/keying.js';
import { EditKeys } from '../anim/pose-mode.js';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Um desenho, por pele, slot e nome: o endereço que o arquivo usa. */
interface AttachmentAddress {
  skin: number;
  slot: string;
  attachment: string;
}

/**
 * As matrizes de mundo de **todos** os ossos, na pose de repouso.
 *
 * De repouso, e não do tempo de agora: quem troca de pai está mexendo na
 * estrutura, e a estrutura mora na pose de repouso. Usar a pose animada
 * escreveria a pose do quadro 12 dentro do arquivo.
 *
 * `null` quando o arquivo não carrega — e aí o comando não compensa nada, só
 * troca o pai, que é o comportamento de antes. Um arquivo que não carrega já
 * tem um problema maior, e estourar aqui não ajudaria ninguém.
 */
export function setupWorldMatrices(file: BoneFile): Map<string, Matrix2x3> | null {
  try {
    const skeleton = new Skeleton(loadSkeletonData(file));
    skeleton.setToSetupPose();
    skeleton.updateWorldTransform();
    const saida = new Map<string, Matrix2x3>();
    for (const bone of skeleton.bones) {
      saida.set(bone.data.name, {
        a: bone.a, b: bone.b, c: bone.c, d: bone.d,
        worldX: bone.worldX, worldY: bone.worldY,
      });
    }
    return saida;
  } catch {
    return null;
  }
}

/**
 * As matrizes de mundo da pose que está **na tela** — lote 63a. Em Animando é
 * a pose do quadro de agora, lida do esqueleto vivo da cena.
 */
export function liveWorldMatrices(doc: EditorDoc): Map<string, Matrix2x3> | null {
  const skeleton = doc.skeleton;
  if (skeleton === null) return null;
  const saida = new Map<string, Matrix2x3>();
  for (const bone of skeleton.bones) {
    saida.set(bone.data.name, {
      a: bone.a, b: bone.b, c: bone.c, d: bone.d, worldX: bone.worldX, worldY: bone.worldY,
    });
  }
  return saida;
}

/** O que uma seleção consegue pendurar em `parent`, e o que fica de fora. */
export function reparentTargets(
  file: BoneFile, selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>, parent: string,
  applied?: ParentMap,
): { bones: string[]; slots: string[]; skipped: string[] } {
  const nomes = new Set(selection.slots);
  for (const item of selection.attachments) nomes.add(item.slot);
  // Rodada 8d: a imagem com osso próprio pendura o OSSO PRÓPRIO, e não o slot.
  // Ele vai com as chaves dele; o slot continua nele. Pendurar o slot direto
  // deixaria o osso próprio para trás, sem imagem, e as chaves sem efeito.
  const querem = [...new Set(selection.bones)];
  for (const name of [...nomes]) {
    const own = ownBoneOfSlot(file, name);
    if (own === null) continue;
    nomes.delete(name);
    if (!querem.includes(own)) querem.push(own);
  }
  const bones = querem.filter((name) => canReparent(file, name, parent, applied));
  const skipped = querem.filter((name) => !canReparent(file, name, parent, applied));
  const slots = [...nomes].filter((name) => (file.slots ?? []).some((slot) => slot.name === name));
  return { bones, slots, skipped };
}

/**
 * Pendura ossos e desenhos em `parent`, **sem mexer no que está na tela**.
 *
 * O que é guardado para o `revert`: a ordem do array de ossos, uma cópia
 * profunda de cada osso movido (a pose local dele é reescrita), o osso de cada
 * slot movido, e o desenho inteiro de cada anexo mexido. Nada é reconstruído de
 * memória na volta.
 */
export class Reparent implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  readonly bones: string[];
  readonly slots: string[];
  readonly skipped: string[];

  /**
   * A ordem do array de ossos antes, **por NOME**. Trocar de pai reordena.
   *
   * Eram os **objetos** — e isso é a forma do defeito 1 (19/09/2026), que a
   * varredura daquele dia pôs na coluna *"repõe, mas com os mesmos objetos —
   * não é a forma"*. É a forma: se o comando desfeito antes deste repôs
   * `file.bones` com CÓPIAS (todo `SnapshotCommand` faz isso), o `revert`
   * daqui consertava as cópias e logo abaixo as jogava fora, devolvendo os
   * objetos velhos e sujos que a lista ainda segurava. Achado pelo teste de
   * par em `documento.test.ts`, nos pares `trocar de pai → Ctrl+D`,
   * `→ apagar osso` e `→ renomear osso`.
   *
   * Nome é chave que o `revert` do renomear já devolveu ao original quando
   * este `revert` corre; objeto é chave que o programa pode trocar por baixo.
   */
  private beforeOrder: string[] = [];
  /** Cópia profunda de cada osso movido, porque a pose local é reescrita. */
  private beforeBones = new Map<string, BoneDef>();
  private beforeSlotBones = new Map<string, string>();
  private beforeAttachments: Array<{ at: AttachmentAddress; def: AttachmentDef | null }> = [];

  constructor(
    file: BoneFile,
    selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
    readonly parent: string,
    label?: string,
    /**
     * A pose em que o mundo é medido. `null` é a de repouso, o de sempre.
     * Lote 63a: em Animando, pendurar só desenhos mede na pose da tela, e o
     * desenho fica onde está NO QUADRO que se vê. Guardada aqui, e não lida
     * no `apply`, para refazer dar o mesmo resultado em qualquer quadro.
     */
    private readonly pose: Map<string, Matrix2x3> | null = null,
  ) {
    const alvos = reparentTargets(file, selection, parent);
    this.bones = alvos.bones;
    this.slots = alvos.slots;
    this.skipped = alvos.skipped;
    this.label = label ?? `Virar filho de ${parent}`;
  }

  /**
   * O desenho de algum slot movido **não coube** no osso novo.
   *
   * Uma `region` tem `x, y, rotation, scaleX, scaleY` e mais nada — não tem
   * inclinação. Quando os dois ossos têm escalas diferentes nos dois eixos, ou
   * um deles já vem inclinado, a conta exata pede uma inclinação que o formato
   * não tem onde escrever: a posição fica certa, o desenho entorta um pouco.
   * O osso nunca cai nesse caso, porque `shearY` existe para ele.
   *
   * Fica escrito aqui, e não num `console.warn`, para a tela poder dizer.
   */
  distorted = false;

  /** `true` quando há pelo menos uma coisa para mover. */
  get hasWork(): boolean {
    return this.bones.length > 0 || this.slots.length > 0;
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    const bones = file.bones ?? [];
    const mundo = this.pose ?? setupWorldMatrices(file);
    const doPai = mundo?.get(this.parent) ?? null;

    this.beforeOrder = bones.map((bone) => bone.name);
    this.beforeBones.clear();
    this.beforeAttachments = [];
    this.beforeSlotBones.clear();

    for (const name of this.bones) {
      const bone = bones.find((b) => b.name === name);
      if (bone === undefined) continue;
      this.beforeBones.set(name, clone(bone));
      const antes = mundo?.get(name) ?? null;
      bone.parent = this.parent;
      // A pose de mundo fica onde estava: `L' = P'⁻¹ · W`.
      if (antes !== null && doPai !== null) writeLocal(bone, localFromWorld(antes, doPai));
    }

    const ordenados = sortBonesTopologically(bones);
    bones.length = 0;
    bones.push(...ordenados);

    for (const slot of file.slots ?? []) {
      if (!this.slots.includes(slot.name)) continue;
      const deAntes = slot.bone;
      this.beforeSlotBones.set(slot.name, deAntes);
      slot.bone = this.parent;
      const origem = mundo?.get(deAntes) ?? null;
      if (origem === null || doPai === null || deAntes === this.parent) continue;
      // O desenho é escrito no espaço do osso do slot: para o mundo dele não
      // mudar, o que está escrito anda por `F = novo⁻¹ · velho`.
      this.moveDrawings(file, slot.name, fixMatrix(origem, doPai));
    }
  }

  /**
   * Anda com os desenhos de um slot, para eles ficarem onde estão.
   *
   * Malha **com pesos** fica de fora de propósito: os vértices dela são somados
   * pelos ossos do `binding`, e o osso do slot não entra nessa conta. Mexer
   * neles moveria o desenho de verdade — o contrário do que este lote faz.
   */
  private moveDrawings(file: BoneFile, slot: string, fix: Matrix2x3): void {
    if (!isSimilarity(fix)) this.distorted = true;
    const skins = file.skins ?? [];
    for (let s = 0; s < skins.length; s++) {
      const entradas = skins[s]?.attachments?.[slot];
      if (entradas === undefined) continue;
      for (const [nome, def] of Object.entries(entradas)) {
        if (def === null || def === undefined) continue;
        const atual = def as AttachmentDef & { binding?: unknown };
        if (atual.binding !== undefined) continue;
        const at: AttachmentAddress = { skin: s, slot, attachment: nome };
        this.beforeAttachments.push({ at, def: clone(atual) });
        entradas[nome] = fixAttachment(atual, fix, -1, true);
      }
    }
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    const bones = file.bones ?? [];
    for (const [name, antes] of this.beforeBones) {
      const bone = bones.find((b) => b.name === name);
      if (bone === undefined) continue;
      // Trocadas por dentro, e não substituídas: quem mais estiver segurando
      // este osso continua olhando para o objeto certo.
      const cru = bone as unknown as Record<string, unknown>;
      for (const chave of Object.keys(cru)) delete cru[chave];
      Object.assign(bone, clone(antes));
    }
    // A ordem volta pelos NOMES, sobre os ossos que estão no arquivo AGORA.
    // Um nome que sumiu (o osso foi apagado por um comando de cima, e este
    // `revert` corre antes do dele) simplesmente não entra.
    const porNome = new Map(bones.map((bone) => [bone.name, bone]));
    const ordenados = this.beforeOrder
      .map((name) => porNome.get(name))
      .filter((bone): bone is BoneDef => bone !== undefined);
    for (const bone of bones) if (!this.beforeOrder.includes(bone.name)) ordenados.push(bone);
    bones.length = 0;
    bones.push(...ordenados);

    for (const slot of file.slots ?? []) {
      const antes = this.beforeSlotBones.get(slot.name);
      if (antes !== undefined) slot.bone = antes;
    }
    for (const { at, def } of this.beforeAttachments) {
      const entradas = (file.skins ?? [])[at.skin]?.attachments?.[at.slot];
      if (entradas === undefined || def === null) continue;
      entradas[at.attachment] = clone(def);
    }
  }
}

/**
 * **Trocar os dois de lugar** — item 3.2, 13/09/2026.
 *
 * O Humberto: *"mandei um osso filho virar o pai do pai dele e ele não virou"*.
 * Pendurar um osso debaixo de um descendente dele seria um ciclo, e o arquivo
 * não aguenta um: `canReparent` recusava, e recusar é o certo para o arquivo.
 * O que faltava era o gesto. Aqui ele existe: em vez de recusar, os dois
 * **trocam de lugar**.
 *
 * Como os três programas resolvem (olhado antes de escolher, em
 * `documentos/pesquisa/`): nenhum dos três tem um "trocar de lugar" com nome
 * próprio. O Spriter e o DragonBones simplesmente **não deixam** soltar o pai
 * dentro do filho — o arrasto não é aceito —, e o Spine faz o mesmo. Então não
 * havia gesto para copiar, e este é o do pedido dele, escrito no plano.
 *
 * São dois passos, e um passo só de desfazer:
 *
 * 1. o **novo pai sobe** para o lugar que o outro ocupava (o pai de antes dele);
 * 2. o **antigo pai desce** e vira filho dele.
 *
 * Numa cadeia `raiz → A → C → B`, trocar `A` com `B` dá `raiz → B → A → C`: os
 * dois trocam de posto e a cadeia continua de pé, ninguém fica órfão. Cada
 * passo é o `Reparent` de sempre, então a pose de **mundo** de todo mundo fica
 * onde estava (`L' = P'⁻¹ · W`) — inclusive a dos filhos que não se mexem.
 */
export class SwapBones implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  /** Os dois passos da última aplicação, na ordem em que foram feitos. */
  private steps: Reparent[] = [];
  /** `true` quando algum desenho não coube exato no osso novo. */
  distorted = false;

  constructor(
    /** O osso que desce: o pai (ou avô) de antes. */
    readonly child: string,
    /** O osso que sobe: o descendente que vira pai. */
    readonly parent: string,
    label?: string,
  ) {
    this.label = label ?? `${this.parent} e ${this.child} trocaram de lugar`;
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    const antigo = (file.bones ?? []).find((b) => b.name === this.child)?.parent;
    // Sem pai é a raiz, e a raiz não troca de lugar com ninguém (§4.2).
    if (antigo === undefined) return;
    const vazio = { bones: [] as string[], slots: [] as string[], attachments: [] as Selection['attachments'] };
    const sobe = new Reparent(file, { ...vazio, bones: [this.parent] }, antigo, this.label);
    sobe.apply(doc);
    const desce = new Reparent(file, { ...vazio, bones: [this.child] }, this.parent, this.label);
    desce.apply(doc);
    this.steps = [sobe, desce];
    this.distorted = sobe.distorted || desce.distorted;
  }

  revert(doc: EditorDoc): void {
    for (const step of [...this.steps].reverse()) step.revert(doc);
    this.steps = [];
  }
}

/**
 * `true` quando a matriz é giro + escala IGUAL nos dois eixos (uma semelhança).
 *
 * É a condição para `T · R · S` — que é tudo o que uma `region` tem — dar conta
 * de `F · A` seja qual for o `A`. Fora dela, a decomposição perde a inclinação
 * que a conta exata pediria.
 */
export function isSimilarity(m: Matrix2x3, epsilon = 1e-9): boolean {
  const c1 = Math.hypot(m.a, m.c);
  const c2 = Math.hypot(m.b, m.d);
  if (c1 <= epsilon || c2 <= epsilon) return false;
  const perpendicular = Math.abs(m.a * m.b + m.c * m.d) / (c1 * c2);
  return perpendicular <= 1e-7 && Math.abs(c1 - c2) / Math.max(c1, c2) <= 1e-7;
}

/** Escreve a pose local calculada, sem deixar campo velho para trás. */
function writeLocal(
  bone: BoneDef,
  pose: { x: number; y: number; rotation: number; scaleX: number; scaleY: number; shearY: number },
): void {
  const alvo = bone as BoneDef & Record<string, number | undefined>;
  alvo['x'] = round(pose.x);
  alvo['y'] = round(pose.y);
  alvo['rotation'] = round(pose.rotation);
  alvo['scaleX'] = round(pose.scaleX);
  alvo['scaleY'] = round(pose.scaleY);
  // `shearX` não muda: a decomposição da §5.5 sempre o devolve zerado, e
  // escrever zero por cima de um valor do arquivo seria perder informação.
  if (Math.abs(pose.shearY) > 1e-9 || alvo['shearY'] !== undefined) {
    alvo['shearY'] = round(pose.shearY);
  }
}

/** Sete casas: o bastante para 1e-6 no mundo, sem lixo de ponto flutuante. */
function round(value: number): number {
  const arredondado = Number(value.toFixed(7));
  return Object.is(arredondado, -0) ? 0 : arredondado;
}


// ---------------------------------------------------------------------------
// A chave `parent` — §9.4, lote 1 de 14/09/2026
// ---------------------------------------------------------------------------

/**
 * **Trocar de pai dentro da animação vira uma CHAVE.**
 *
 * A lei do Humberto, 14/09/2026: *"como o Spriter faz? Isso é lei."* No Spriter
 * a hierarquia é definida por chave na `mainline`: trocar de pai é gravar
 * aquela chave, e ele nunca pergunta nada. Então, em Animando, os quatro gestos
 * gravam uma chave `bone/parent` (§9.4) no tempo de agora — sem janelinha, sem
 * *"volte à Montagem"*. Em Montagem, o arquivo muda, como sempre.
 *
 * O caso que mandou fazer isto: o personagem segura a arma e a guarda nas
 * costas no meio da animação. A arma muda de pai e de ordem de desenho. A
 * ordem já era chave desde o lote 66; o pai é o que faltava.
 *
 * **Sem conversão pelo runtime (§9.4).** A partir da chave, os locais do osso
 * passam a ser medidos do pai novo, e quem grava a chave grava os locais já
 * convertidos. É por isso que aqui vai junto um punhado de chaves de `x`, `y`,
 * `rotation`, `scaleX`, `scaleY` e `shearY`: sem elas o desenho saltaria no
 * quadro da troca. A conta é a mesma do `Reparent` (`L' = P'⁻¹ · W`), só que
 * medida na pose da TELA, e não na de repouso.
 */

/** O pai de cada osso no instante que está na tela, lido do esqueleto vivo. */
export function appliedParents(doc: EditorDoc): ParentMap {
  const out = new Map<string, string | undefined>();
  const skeleton = doc.skeleton;
  if (skeleton === null) return out;
  for (const bone of skeleton.bones) out.set(bone.data.name, bone.parent?.data.name);
  return out;
}

/**
 * O osso de cada desenho **no instante de agora** — rodada 50, lote 4 (doc
 * `101`). A chave `slot/bone` (§9.5) troca o osso de um desenho no meio da
 * animação: *"body virou filho de head (chave de pai em 0,00 s)"*. O esqueleto
 * vivo já a aplica (`Slot.bone` é o osso APLICADO); a Árvore lia o do arquivo
 * e continuava mostrando body debaixo de torso.
 */
export function appliedSlotBones(doc: EditorDoc): ReadonlyMap<string, string> {
  const out = new Map<string, string>();
  const skeleton = doc.skeleton;
  if (skeleton === null) return out;
  for (const slot of skeleton.slots) out.set(slot.data.name, slot.bone.data.name);
  return out;
}

/** As chaves que uma troca de pai em Animando grava, para um osso. */
export interface ParentKeyPlan {
  bone: string;
  /** Valor da chave `parent`: o nome do osso novo, ou `null` = o pai do arquivo. */
  parent: string | null;
  /** Os locais no espaço do pai novo. */
  locals: Array<{ property: string; value: number }>;
  /** As chaves de pose de depois, já convertidas para o pai novo. */
  after: ConvertedKey[];
}

/**
 * As chaves que põem `bone` debaixo de `parent` no tempo de agora **sem ele
 * sair do lugar na tela**.
 *
 * **O `shearX` não se perde.** A decomposição de §5.5 devolve sempre
 * `shearX = 0` — ela tem um grau de liberdade a menos que a matriz. Escrever
 * esse zero por cima de um osso inclinado entortaria a pose no quadro da
 * troca, calado. A saída é exata e não custa nada: com o `shearX` do osso
 * valendo `s`, a mesma matriz se escreve com
 *
 *     rotation' = rotation − s        shearY' = shearY + s
 *
 * porque a primeira coluna é construída com `rotation + shearX` e a segunda com
 * `rotation + 90 + shearY` (§5.4). O `shearX` fica onde estava, e o mundo sai
 * idêntico ao que estava na tela.
 */
/** Um osso do esqueleto vivo: a matriz de mundo e a inclinação aplicada. */
interface OssoVivo extends Matrix2x3 {
  shearX: number;
}

/** A pose local de um osso medida a partir de outro, com o `shearX` guardado. */
function poseNoPaiNovo(filho: OssoVivo, pai: OssoVivo): Array<{ property: string; value: number }> {
  const mundo: Matrix2x3 = {
    a: filho.a, b: filho.b, c: filho.c, d: filho.d,
    worldX: filho.worldX, worldY: filho.worldY,
  };
  const doPai: Matrix2x3 = {
    a: pai.a, b: pai.b, c: pai.c, d: pai.d, worldX: pai.worldX, worldY: pai.worldY,
  };
  const pose = localFromWorld(mundo, doPai);
  const inclinado = filho.shearX;
  return [
    { property: 'x', value: round(pose.x) },
    { property: 'y', value: round(pose.y) },
    { property: 'rotation', value: round(pose.rotation - inclinado) },
    { property: 'scaleX', value: round(pose.scaleX) },
    { property: 'scaleY', value: round(pose.scaleY) },
    { property: 'shearY', value: round(pose.shearY + inclinado) },
  ];
}

export function parentKeyPlan(doc: EditorDoc, bone: string, parent: string): ParentKeyPlan | null {
  const skeleton = doc.skeleton;
  if (skeleton === null) return null;
  const filho = skeleton.findBone(bone);
  const pai = skeleton.findBone(parent);
  if (filho === null || pai === null) return null;
  const doArquivo = (corpoDe(doc).file.bones ?? []).find((b) => b.name === bone)?.parent;
  return {
    bone,
    parent: parent === doArquivo ? null : parent,
    locals: poseNoPaiNovo(filho, pai),
    after: convertKeysAfter(doc, bone, parent, doc.time),
  };
}

// ---------------------------------------------------------------------------
// As chaves que vêm DEPOIS da troca
// ---------------------------------------------------------------------------

/** As propriedades de pose que uma troca de pai reescreve. */
const LOCAIS = ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'shearY'] as const;

/** Uma chave de pose posterior à troca, já medida do pai novo. */
export interface ConvertedKey {
  time: number;
  locals: Array<{ property: string; value: number }>;
}

/**
 * Até quando esta troca manda: o tempo da **próxima** chave `parent` do osso,
 * ou o infinito.
 *
 * Dali em diante quem manda é a próxima chave, e as poses daquele trecho já
 * foram escritas pensando naquele outro pai. Reescrevê-las seria mexer em
 * decisão que não é desta troca.
 */
function reinadoAte(file: BoneFile, animation: string, bone: string, time: number): number {
  const tempos = keyTimes(file, animation, boneTarget(bone, 'parent'));
  for (const t of tempos) if (t > time + 1e-9) return t;
  return Number.POSITIVE_INFINITY;
}

/** Os instantes com chave de pose do osso dentro de um trecho, sem repetir. */
function instantesDePose(
  file: BoneFile, animation: string, bone: string, de: number, ate: number,
): number[] {
  const todos = new Set<number>();
  for (const property of [...LOCAIS, 'shearX']) {
    for (const t of keyTimes(file, animation, boneTarget(bone, property))) {
      if (t > de + 1e-9 && t < ate - 1e-9) todos.add(t);
    }
  }
  return [...todos].sort((a, b) => a - b);
}

/**
 * **As chaves de depois vão junto** — peça de 14/09/2026.
 *
 * Depois da chave `parent`, as poses que a pessoa já tinha gravado continuavam
 * escritas no espaço do pai **velho**: quem animasse depois da troca via o
 * braço saltar e não sabia por quê. A barra só avisava, e meia entrega apodrece
 * mais rápido que assunto não começado.
 *
 * Agora elas são **convertidas** para o espaço do pai novo, no mesmo comando e
 * no mesmo passo de desfazer. O critério é o do Spriter, e é simples de
 * conferir: **a pose de cada chave fica onde estava na tela**.
 *
 * Como: para cada instante com chave de pose no reinado desta troca, o mundo do
 * osso é lido como está HOJE (com o pai velho), e reescrito medido do pai novo
 * naquele mesmo instante. O `shearX` é preservado pela mesma conta exata da
 * troca (`rotation − s`, `shearY + s`).
 *
 * **Todas as seis propriedades ganham chave naquele instante**, mesmo as que
 * não tinham. Não há escolha: uma propriedade sem chave ali seguiria
 * interpolando um valor escrito para o pai velho, e a pose daquele quadro
 * sairia torta — que é justamente o defeito que esta peça vem consertar.
 *
 * Fora do reinado, nada é tocado: nem chave de antes da troca, nem chave de
 * outro osso, nem o trecho de uma segunda troca mais adiante.
 */
export function convertKeysAfter(
  doc: EditorDoc, bone: string, parent: string, time: number,
): ConvertedKey[] {
  const animation = doc.animation;
  if (animation === null) return [];
  const fim = reinadoAte(doc.file, animation, bone, time);
  const instantes = instantesDePose(doc.file, animation, bone, time, fim);
  if (instantes.length === 0) return [];

  let esqueleto: Skeleton;
  try {
    esqueleto = new Skeleton(loadSkeletonData(doc.file));
  } catch {
    return [];
  }
  const dados = esqueleto.data.findAnimation(animation);
  if (dados === null) return [];

  const saida: ConvertedKey[] = [];
  for (const t of instantes) {
    esqueleto.setToSetupPose();
    applyAnimation(esqueleto, dados, t);
    esqueleto.updateWorldTransform();
    const filho = esqueleto.findBone(bone);
    const pai = esqueleto.findBone(parent);
    if (filho === null || pai === null) continue;
    saida.push({ time: t, locals: poseNoPaiNovo(filho, pai) });
  }
  return saida;
}

/** O tempo como a barra de baixo escreve: `0,50 s`. */
function segundos(time: number): string {
  return `${time.toFixed(2).replace('.', ',')} s`;
}

/**
 * Grava as chaves de um ou mais planos, num passo de desfazer só.
 *
 * A linha do `parent` que nasce depois do zero leva junto um `null` em 0 — o
 * começo se guarda sozinho (lote 68), e `null` é o pai do arquivo (§9.4). É o
 * que o caso C-281 da conformidade grava à mão.
 *
 * **A CHAVE DE SEGURAR, no quadro anterior.** Achado na tela, 14/09/2026: só
 * com as duas chaves (a de 0 e a da troca) a espada saía da mão ANTES da hora.
 * O motivo: os locais de 0 até a troca são medidos do pai VELHO, e o valor da
 * troca é medido do pai NOVO — a reta entre os dois passa por lugar nenhum, e o
 * desenho ia deslizando para as costas durante o caminho todo.
 *
 * A conta certa é que o trecho de antes não pode rampar para o valor novo: ele
 * **segura** o valor de antes até o instante da troca, e aí muda de uma vez,
 * junto com o pai. Por isso cada local ganha, no **quadro anterior**, uma chave
 * `stepped` com o valor que a animação já tinha ali. Um quadro de espera, que
 * ninguém vê, e a troca vira o evento seco que ela é.
 *
 * O que NÃO é feito aqui: converter as chaves que vêm **depois**. Elas foram
 * escritas no espaço do pai velho e continuam lá; quem chama avisa na barra de
 * baixo. Converter a animação inteira para trás é outra decisão, e é do
 * Humberto.
 */
/**
 * O desenho troca de osso **por chave** — F8, spec 9.5; degrau 7, tarefa 7.3.
 *
 * Até aqui, trocar o osso de um desenho com uma animação aberta escrevia na
 * BASE (degrau 4a, desvio 4 do Chat C): o desenho mudava de osso em toda
 * animação do corpo, e o gesto custava **dois** passos de desfazer — um para
 * as chaves de pai dos ossos, outro para os desenhos.
 *
 * Agora é uma chave `slot/bone` no instante de agora, como o Spriter grava no
 * `object_ref` de cada chave. Para o desenho **não saltar**, a chave carrega a
 * posição dele medida do osso novo:
 *
 *     M_antigo × anexo  =  M_novo × T·R·S × anexo   ⇒   T·R·S = M_novo⁻¹ × M_antigo
 *
 * que é a mesma conta de `localFromWorld` do lote 34, e a mesma escolha de
 * §9.4: quem carrega o número é a chave, nunca o runtime (Q27).
 */
export interface SlotBoneKeyPlan {
  slot: string;
  /** O valor da chave: o osso novo, ou `null` = o osso do arquivo. */
  bone: string | null;
  /** O `transform` da chave, ou `null` quando é a identidade (9.5). */
  transform: { x: number; y: number; rotation: number; scaleX: number; scaleY: number } | null;
  /** `true` quando os dois ossos têm inclinações diferentes e o `transform` não a guarda. */
  distorted: boolean;
}

/** Quase zero, para não gravar `x: 0.0000001` nem `scaleX: 0.9999999`. */
function quaseIgual(value: number, alvo: number): boolean {
  return Math.abs(value - alvo) < 1e-6;
}

/**
 * A chave que põe o desenho de `slot` no osso `parent` sem ele sair do lugar
 * na tela, ou `null` quando não há como medir (esqueleto fora do ar).
 */
export function slotBoneKeyPlan(doc: EditorDoc, slot: string, parent: string): SlotBoneKeyPlan | null {
  const skeleton = doc.skeleton;
  if (skeleton === null) return null;
  const vivo = skeleton.slots.find((entry) => entry.data.name === slot);
  const novo = skeleton.findBone(parent);
  if (vivo === undefined || novo === null) return null;
  // `boneMatrix`, e não `bone`: quando o slot JÁ está sob uma chave
  // `slot/bone`, o desenho está onde o `transform` daquela chave o pôs, e é
  // desse lugar que a chave nova tem de medir (9.5).
  const antigo = vivo.boneMatrix;
  const doArquivo = (corpoDe(doc).file.slots ?? []).find((entry) => entry.name === slot)?.bone;
  const mundo: Matrix2x3 = {
    a: antigo.a, b: antigo.b, c: antigo.c, d: antigo.d,
    worldX: antigo.worldX, worldY: antigo.worldY,
  };
  const doNovo: Matrix2x3 = {
    a: novo.a, b: novo.b, c: novo.c, d: novo.d, worldX: novo.worldX, worldY: novo.worldY,
  };
  const pose = localFromWorld(mundo, doNovo);
  const identidade = quaseIgual(pose.x, 0) && quaseIgual(pose.y, 0)
    && quaseIgual(pose.rotation, 0) && quaseIgual(pose.scaleX, 1) && quaseIgual(pose.scaleY, 1);
  return {
    slot,
    // Voltar ao osso do arquivo é `null`, e aí o `transform` é ignorado (9.5).
    bone: parent === doArquivo ? null : parent,
    transform: parent === doArquivo || identidade ? null : {
      x: round(pose.x), y: round(pose.y), rotation: round(pose.rotation),
      scaleX: round(pose.scaleX), scaleY: round(pose.scaleY),
    },
    // O `transform` de 9.5 não tem inclinação: quando ela sobra, o desenho
    // entorta um pouco, e quem chamou diz isso no rodapé (regra 21).
    distorted: !quaseIgual(pose.shearY, 0),
  };
}

export function runParentKeys(
  doc: EditorDoc, plans: readonly ParentKeyPlan[], label: string,
  /**
   * As chaves `slot/bone` do mesmo gesto — degrau 7, tarefa 7.3. Elas entram
   * no MESMO `EditKeys`: virar filho com osso e desenho juntos é **um** passo
   * de desfazer, e não dois (desvio 4 do Chat C, degrau 4a).
   */
  slotPlans: readonly SlotBoneKeyPlan[] = [],
): boolean {
  const animation = doc.animation;
  if (animation === null || (plans.length === 0 && slotPlans.length === 0)) return false;
  const time = doc.time;
  const fps = doc.file.skeleton?.fps ?? 30;
  const anterior = roundTime(time - 1 / (fps > 0 ? fps : 30));
  const escreverSlots = slotPlans.map((plan) => ({
    ...plan, transform: plan.transform === null ? null : { ...plan.transform },
  }));
  const escrever = plans.map((plan) => ({
    ...plan,
    locals: plan.locals.map((item) => ({ ...item })),
    after: plan.after.map((chave) => ({ time: chave.time, locals: chave.locals.map((i) => ({ ...i })) })),
  }));
  doc.run(new EditKeys(animation, label, (file, name) => {
    for (const plan of escrever) {
      const alvo = boneTarget(plan.bone, 'parent');
      if (roundTime(time) > 0 && findTimeline(file, name, alvo) === null) {
        setKey(file, name, 0, alvo, null);
      }
      setKey(file, name, time, alvo, plan.parent);
      for (const item of plan.locals) {
        const alvoLocal = boneTarget(plan.bone, item.property);
        keepStartKey(file, name, time, alvoLocal);
        if (anterior > 0) {
          const segurar = valueAt(file, name, anterior, alvoLocal)
            ?? setupValueFor(file, alvoLocal);
          if (segurar !== undefined) {
            setKey(file, name, anterior, alvoLocal, segurar, { curve: 'stepped', keepCurve: false });
          }
        }
        setKey(file, name, time, alvoLocal, item.value);
      }
      // As chaves de depois, medidas do pai novo, no mesmo passo de desfazer.
      for (const chave of plan.after) {
        for (const item of chave.locals) {
          setKey(file, name, chave.time, boneTarget(plan.bone, item.property), item.value);
        }
      }
    }
    // O desenho troca de osso por chave (F8, 9.5), no mesmo comando.
    for (const plan of escreverSlots) {
      const alvo = slotTarget(plan.slot, 'bone');
      // Antes da troca vale o osso do arquivo: sem esta chave em 0, o desenho
      // já nasceria no osso novo desde o começo da animação.
      if (roundTime(time) > 0 && findTimeline(file, name, alvo) === null) {
        setKey(file, name, 0, alvo, null);
      }
      const chave = setKey(file, name, time, alvo, plan.bone);
      if (plan.transform === null) delete chave.transform;
      else chave.transform = { ...plan.transform };
    }
  }));
  return true;
}

/** Quantos instantes de pose foram convertidos, somando os planos. */
export function convertedCount(plans: readonly ParentKeyPlan[]): number {
  return plans.reduce((total, plan) => total + plan.after.length, 0);
}


// ---------------------------------------------------------------------------
// A porta única: os quatro caminhos passam por aqui
// ---------------------------------------------------------------------------

/** O que uma troca de pai fez, para a tela poder contar. */
export interface ReparentOutcome {
  /** `true` quando alguma coisa mudou de pai. */
  moved: boolean;
  /**
   * `true` quando a troca virou **chave** no tempo de agora, em vez de mexer no
   * arquivo — lote 1 de 14/09/2026, §9.4.
   */
  keyed: boolean;
  /** O tempo da chave, para o recado dizer onde ela ficou. */
  time: number;
  /** Desenhos que ficaram de fora por serem desenho: §9.4 é só de osso. */
  drawingsLeftOut: string[];
  /** `true` quando algum desenho não coube exato no osso novo. */
  distorted: boolean;
}

/**
 * A frase que explica o que a troca fez além de trocar. Vazia quando nada.
 *
 * **Saiu daqui o *"estrutura muda na Montagem, e voltei para ela"***: em
 * Animando ninguém mais é mandado de volta — a troca vira chave (§9.4).
 */
export function reparentExtra(outcome: ReparentOutcome): string {
  const partes: string[] = [];
  if (outcome.keyed) partes.push(`chave de pai em ${segundos(outcome.time)}`);
  if (outcome.drawingsLeftOut.length > 0) {
    partes.push('o desenho ficou no osso de antes: a chave de pai é só de osso');
  }
  if (outcome.distorted) partes.push('o desenho entortou um pouco: os dois ossos têm escalas diferentes');
  return partes.length === 0 ? '' : ` (${partes.join('; ')})`;
}

/** O resultado de um gesto que não fez nada. */
function nadaFeito(): ReparentOutcome {
  return { moved: false, keyed: false, time: 0, drawingsLeftOut: [], distorted: false };
}

/**
 * Pendura o que está escolhido em `parent`, e conta o que aconteceu.
 *
 * **Ninguém é mandado de volta para a Montagem** — lote 1 de 14/09/2026. Onde
 * a troca vai parar depende de onde a pessoa está:
 *
 * | Onde | O que o gesto faz |
 * |:---|:---|
 * | **Animando**, com osso | grava a **chave `parent`** no tempo de agora (§9.4), com os locais já medidos do pai novo |
 * | **Animando**, só desenho | troca o osso do slot, medindo o mundo na pose da TELA (lote 63a) |
 * | **Montagem** | muda o pai no arquivo, como sempre |
 *
 * Seleção com osso E desenho, em Animando: o **osso ganha chave**, o desenho
 * fica onde está, e a barra de baixo diz por quê — a §9.5 não tem timeline
 * para o osso de um slot, então trocar o dono de um desenho é mexer na
 * estrutura, não no quadro.
 *
 * Devolve o que aconteceu, para quem chamou compor o próprio recado.
 */
/**
 * O `SwapBones` deste gesto, ou `null` quando o gesto é o de sempre.
 *
 * Só com **um osso** e **nenhum desenho** na seleção: trocar dois ossos de
 * lugar é um gesto de um para um, e fazê-lo com cinco ossas escolhidos seria
 * adivinhar qual troca com qual. Com mais de um, quem não pode continua
 * ficando de fora, com o recado de sempre (`skipped`).
 */
function trocaDeLugar(
  doc: EditorDoc,
  selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
  parent: string,
  applied?: ParentMap,
): string | null {
  const bones = [...new Set(selection.bones)];
  if (bones.length !== 1) return null;
  if (selection.slots.length > 0 || selection.attachments.length > 0) return null;
  const child = bones[0]!;
  // O ciclo é medido na árvore DAQUELE quadro (§9.4): no quadro 12 o pai já
  // pode ser outro, e é essa hierarquia que decide se a troca fecha um ciclo.
  if (reparentVerdict(corpoDe(doc).file, child, parent, applied) !== 'swap') return null;
  return child;
}

/**
 * A troca de lugar, em Animando, são **duas chaves de pai** — uma para cada um.
 *
 * O que sobe recebe o pai que o outro tinha naquele instante; o que desce
 * recebe o que subiu. As duas contas saem das MESMAS matrizes de agora: como
 * cada uma guarda o mundo do seu osso, a segunda não é afetada pela primeira.
 */
function trocaPorChave(doc: EditorDoc, child: string, parent: string, applied: ParentMap): ParentKeyPlan[] {
  const acima = applied.get(child);
  if (acima === undefined) return [];
  const sobe = parentKeyPlan(doc, parent, acima);
  const desce = parentKeyPlan(doc, child, parent);
  return sobe === null || desce === null ? [] : [sobe, desce];
}

/** As chaves `slot/bone` de vários desenhos, sem as que não dá para medir. */
export function slotBoneKeyPlans(
  doc: EditorDoc, slots: readonly string[], parent: string,
): SlotBoneKeyPlan[] {
  const out: SlotBoneKeyPlan[] = [];
  for (const slot of slots) {
    const plan = slotBoneKeyPlan(doc, slot, parent);
    if (plan !== null) out.push(plan);
  }
  return out;
}

/** O pedaço do rodapé que fala dos desenhos, ou vazio quando não há nenhum. */
function frasesDoDesenho(plans: readonly SlotBoneKeyPlan[], parent: string): string {
  if (plans.length === 0) return '';
  const quem = plans.length === 1
    ? `O desenho de ${plans[0]!.slot} trocou para o osso ${parent}, por chave`
    : `${plans.length} desenhos trocaram para o osso ${parent}, por chave`;
  const entortou = plans.some((plan) => plan.distorted)
    ? '. O desenho entortou um pouco: os dois ossos têm inclinações diferentes'
    : '';
  return `. ${quem}${entortou}`;
}

export function runReparent(
  doc: EditorDoc,
  selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
  parent: string,
  label?: string,
  /** `quiet` deixa o recado do fim para quem chamou — é o gesto do lote 31. */
  options: { quiet?: boolean } = {},
): ReparentOutcome {
  const animando = doc.animation !== null;
  const aplicados = appliedParents(doc);
  const nome = label ?? `Virar filho de ${parent}`;
  const alvos = reparentTargets(corpoDe(doc).file, selection, parent, animando ? aplicados : undefined);

  // ------------------------------------------------------------------
  // 1. Trocar de lugar: o filho vira pai do pai (item 3.2, v12.0)
  // ------------------------------------------------------------------
  const troca = trocaDeLugar(doc, selection, parent, animando ? aplicados : undefined);
  if (troca !== null) {
    const frase = `${parent} e ${troca} trocaram de lugar: ${troca} agora é filho de ${parent}`;
    if (animando) {
      const plans = trocaPorChave(doc, troca, parent, aplicados);
      if (plans.length === 2 && runParentKeys(doc, plans, `${parent} e ${troca} trocam de lugar`)) {
        const saida: ReparentOutcome = {
          moved: true, keyed: true, time: doc.time, drawingsLeftOut: [], distorted: false,
        };
        if (options.quiet !== true) doc.notice(`${frase} (chave de pai em ${segundos(doc.time)})`);
        return saida;
      }
      return nadaFeito();
    }
    const comando = new SwapBones(troca, parent, label);
    doc.run(comando);
    const saida: ReparentOutcome = {
      moved: true, keyed: false, time: 0, drawingsLeftOut: [], distorted: comando.distorted,
    };
    if (options.quiet !== true) doc.notice(frase);
    return saida;
  }

  // ------------------------------------------------------------------
  // 2. Animando, com osso: a troca vira CHAVE (§9.4)
  // ------------------------------------------------------------------
  if (animando && alvos.bones.length > 0) {
    const plans: ParentKeyPlan[] = [];
    for (const bone of alvos.bones) {
      const plan = parentKeyPlan(doc, bone, parent);
      if (plan !== null) plans.push(plan);
    }
    // As chaves de pose que vinham depois vão junto, medidas do pai novo. A
    // barra de baixo diz QUANTAS foram — número, não adjetivo.
    const convertidas = convertedCount(plans);
    // Degrau 7, tarefa 7.3 (F8): o desenho escolhido junto também vira CHAVE
    // — `slot/bone` com o `transform` que o mantém no lugar (9.5) — e as duas
    // coisas entram no MESMO comando: um passo de desfazer, não dois, que era
    // o desvio 4 do Chat C no degrau 4a.
    const desenhos = slotBoneKeyPlans(doc, alvos.slots, parent);
    if (plans.length === 0 && desenhos.length === 0) return nadaFeito();
    if (!runParentKeys(doc, plans, nome, desenhos)) return nadaFeito();
    const saida: ReparentOutcome = {
      moved: true,
      keyed: true,
      time: doc.time,
      drawingsLeftOut: [],
      distorted: desenhos.some((plan) => plan.distorted),
    };
    if (options.quiet === true) return saida;
    const quantos = plans.length === 1
      ? `${plans[0]!.bone} virou filho de ${parent}`
      : `${plans.length} ossos viraram filhos de ${parent}`;
    doc.notice(`${quantos}, por chave em ${segundos(doc.time)}${
      frasesDoDesenho(desenhos, parent)}${
      convertidas > 0 ? `. ${convertidas} ${convertidas === 1 ? 'chave depois desta foi convertida' : 'chaves depois desta foram convertidas'} para o pai novo` : ''}${
      alvos.skipped.length > 0 ? `. ${alvos.skipped.join(', ')} ficou onde estava` : ''}`);
    return saida;
  }

  // ------------------------------------------------------------------
  // 2b. Animando, SÓ desenho: a troca também vira chave (F8, 9.5)
  // ------------------------------------------------------------------
  if (animando && alvos.slots.length > 0) {
    const desenhos = slotBoneKeyPlans(doc, alvos.slots, parent);
    if (desenhos.length > 0 && runParentKeys(doc, [], nome, desenhos)) {
      const saida: ReparentOutcome = {
        moved: true,
        keyed: true,
        time: doc.time,
        drawingsLeftOut: [],
        distorted: desenhos.some((plan) => plan.distorted),
      };
      if (options.quiet !== true) {
        doc.notice(`${frasesDoDesenho(desenhos, parent).replace(/^\. /, '')}, em ${segundos(doc.time)}${
          alvos.skipped.length > 0 ? `. ${alvos.skipped.join(', ')} ficou onde estava` : ''}`);
      }
      return saida;
    }
  }

  // ------------------------------------------------------------------
  // 3. O caminho de sempre: a Montagem, e o desenho solto em Animando
  // ------------------------------------------------------------------
  // Só desenhos, em Animando, fica em Animando e mede o mundo na pose da TELA
  // (lote 63a). O Humberto: *"associei um objeto ao osso, ele arrastou o
  // objeto"* — sair do modo jogava tudo na pose de repouso.
  const naPose = animando ? liveWorldMatrices(doc) : null;
  const comando = new Reparent(corpoDe(doc).file, selection, parent, label, naPose);
  if (!comando.hasWork) {
    doc.notice(comando.skipped.length > 0
      ? `${comando.skipped.join(', ')} não pode virar filho de ${parent}`
      : 'Nada para virar filho');
    return nadaFeito();
  }

  corpoDe(doc).run(comando);

  const quantos = comando.bones.length + comando.slots.length;
  const sobrou = comando.skipped.length > 0
    ? `. ${comando.skipped.join(', ')} ficou onde estava`
    : '';
  const entortou = comando.distorted
    ? '. O desenho entortou um pouco: os dois ossos têm escalas diferentes'
    : '';
  const saida: ReparentOutcome = {
    moved: true, keyed: false, time: 0, drawingsLeftOut: [], distorted: comando.distorted,
  };
  // Calado: quem chamou tem um recado melhor — o do gesto, com o nome do
  // filho — e recebe o que mudou para acrescentar ao dele.
  if (options.quiet === true) return saida;
  doc.notice(`${quantos} ${quantos === 1 ? 'item virou' : 'itens viraram'} filho de ${parent}${sobrou}${entortou}`);
  return saida;
}
