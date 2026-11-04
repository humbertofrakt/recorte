/**
 * A Árvore: os comandos de criar e apagar — lote A5d, plano arrumação (v11.1).
 *
 * Mudar a ordem de um slot, criar osso, slot, ponto, caixa, máscara, regra,
 * evento, pele e parâmetro, pôr um anexo num slot que já existe, apagar o que
 * está escolhido e varrer os slots vazios. Cada um é um `Command` com `apply`
 * e `revert` exatos.
 * Cortado de `tree-model.ts` pela seção "Commands" sem mudar uma letra; o
 * `tree-model.ts` continua exportando tudo.
 */

import type {
  AttachmentDef, BoneDef, BoneFile, ConstraintDef, ConstraintType, SkinDef, SlotDef,
} from '../../../runtime/src/index.js';
import { ownBoneOfSlot } from '../doc/own-bone.js';
import type { ChangeKind, Command, EditorDoc, Selection } from '../contract.js';
import { emptySelection, uniqueName } from '../contract.js';
import { applyRemoval } from '../doc/commands.js';
import { guardRemoved, type GuardSummary } from '../doc/guarded-keys.js';
import { isDescendantBone } from '../doc/bones.js';
import { constraintTypeLabel } from './tree-rows.js';

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/*
 * `ReparentBone` e `ReparentMany` moravam aqui. Os dois foram substituídos, no
 * lote 34, por um comando só — `Reparent`, em `doc/reparent.ts` —, que guarda a
 * pose de MUNDO ao trocar de pai. Três códigos para o mesmo trabalho é onde um
 * deles envelhece sozinho, e era o que estava acontecendo: o arrasto da Árvore
 * não sabia mexer em slot, e o campo Osso das Propriedades não sabia
 * compensar nada.
 */

/** Moves a slot in the draw order. `to` is the index it ends up at. */
export class MoveSlot implements Command {
  readonly label = 'Mudar a ordem de desenho';
  readonly kind: ChangeKind = 'structure';
  private before: SlotDef[] = [];

  constructor(private readonly from: number, private readonly to: number) {}

  apply(doc: EditorDoc): void {
    const slots = doc.file.slots ?? [];
    this.before = slots.slice();
    if (this.from < 0 || this.from >= slots.length) return;
    const moved = slots.splice(this.from, 1)[0]!;
    const target = Math.max(0, Math.min(this.to, slots.length));
    slots.splice(target, 0, moved);
  }

  revert(doc: EditorDoc): void {
    const slots = doc.file.slots ?? [];
    slots.length = 0;
    slots.push(...this.before);
  }
}

/** Adds a bone under `parent`, or under the root when `parent` is null. */
/**
 * O comprimento do osso que nasce pelo menu ou pelo Novo ▾ — J3. Um osso sem
 * comprimento é um ponto na cena; 40 se vê no herói (os ossos dele vão de 25 a
 * 60) e se estica com a ferramenta depois.
 */
export const NEW_BONE_LENGTH = 40;

export class AddBone implements Command {
  readonly label = 'Novo osso';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;
  private added: BoneDef | null = null;

  constructor(file: BoneFile, private readonly parent: string | null) {
    this.name = uniqueName('osso', (file.bones ?? []).map((b) => b.name));
  }

  apply(doc: EditorDoc): void {
    const bones = doc.file.bones ?? (doc.file.bones = []);
    const parent = this.parent ?? bones[0]?.name;
    // J3 (chat J, 29/09): pelo menu, o osso nascia de comprimento ZERO na
    // origem do pai — quase invisível. Agora nasce com um tamanho que se vê e,
    // com um osso escolhido, NA PONTA dele, como no Spine. Na raiz, na origem.
    const pai = parent === undefined ? undefined : bones.find((bone) => bone.name === parent);
    const ponta = pai === undefined || pai === bones[0] ? 0 : (pai.length ?? 0);
    const bone: BoneDef = parent === undefined
      ? { name: this.name, length: NEW_BONE_LENGTH }
      : { name: this.name, parent, length: NEW_BONE_LENGTH, ...(ponta !== 0 ? { x: roundValue(ponta) } : {}) };
    this.added = bone;
    bones.push(bone);
  }

  revert(doc: EditorDoc): void {
    const bones = doc.file.bones ?? [];
    // Pelo NOME guardado no construtor, nunca pelo objeto nem pelo nome lido
    // do objeto vivo — defeito 1 (19/09/2026). Quem repõe a lista com cópias
    // mata a referência; quem renomeia reescreve o nome por dentro. O `string`
    // do construtor não muda, e o `revert` do renomear já correu antes deste.
    const at = bones.findIndex((bone) => bone.name === this.name);
    if (at >= 0) bones.splice(at, 1);
  }
}

/** Adds a slot on `bone`, at the end of the draw order. */
export class AddSlot implements Command {
  readonly label = 'Novo slot';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;
  private added: SlotDef | null = null;

  constructor(file: BoneFile, private readonly bone: string) {
    this.name = uniqueName('slot', (file.slots ?? []).map((s) => s.name));
  }

  apply(doc: EditorDoc): void {
    const slots = doc.file.slots ?? (doc.file.slots = []);
    const slot: SlotDef = { name: this.name, bone: this.bone };
    this.added = slot;
    slots.push(slot);
  }

  revert(doc: EditorDoc): void {
    const slots = doc.file.slots ?? [];
    // Pelo NOME guardado no construtor — defeito 1 (19/09/2026), como acima.
    const at = slots.findIndex((slot) => slot.name === this.name);
    if (at >= 0) slots.splice(at, 1);
  }
}

// ---------------------------------------------------------------------------
// Criar Ponto e Caixa de colisão (itens 12 e 13)
// ---------------------------------------------------------------------------

/**
 * A pele onde um anexo novo nasce.
 *
 * A primeira das peles visíveis, que é a regra do contrato (`visibleSkins`), e
 * `default` quando não há nenhuma escolhida. Sem isto um Ponto criado com a
 * pele `armadura` aberta nasceria na `default` e sumiria da tela na hora.
 */
function skinForNew(file: BoneFile, visibleSkins: readonly string[]): string {
  const first = visibleSkins[0];
  if (first !== undefined && (file.skins ?? []).some((skin) => skin.name === first)) {
    return first;
  }
  return 'default';
}

/** Acha a pele pelo nome, criando-a se ela ainda não existir. */
function ensureSkin(file: BoneFile, name: string): SkinDef {
  const skins = file.skins ?? (file.skins = []);
  const found = skins.find((skin) => skin.name === name);
  if (found !== undefined) return found;
  const made: SkinDef = { name, attachments: {} };
  skins.push(made);
  return made;
}

/**
 * O que os dois comandos abaixo têm em comum: um slot novo num osso, e um
 * anexo novo na pele editável, criados e desfeitos como uma coisa só.
 *
 * Um slot sem anexo é um slot que não mostra nada, e um anexo sem slot é um
 * anexo que o arquivo carrega e ninguém desenha. Os dois nascem juntos e
 * morrem juntos, num passo de desfazer.
 */
abstract class AddSlotWithAttachment implements Command {
  abstract readonly label: string;
  readonly kind: ChangeKind = 'structure';
  /** Nome do slot criado. Quem chamou usa para escolher o que acabou de criar. */
  readonly name: string;
  readonly skin: string;
  private addedSlot: SlotDef | null = null;
  /** `true` quando a pele não existia e este comando a criou. */
  private madeSkin = false;
  private madeSlotMap = false;
  /**
   * `true` quando o arquivo não tinha `slots` e este comando criou a lista.
   *
   * Achado em 22/09, ao escrever o desfazer do emissor: num arquivo **sem
   * slots** — um esqueleto que só tem ossos — criar e desfazer deixava
   * `"slots": []` para trás. O arquivo não voltava letra por letra, e a linha
   * de baixo, a das peles, já dizia por escrito que ele tem de voltar.
   *
   * **A forma:** *criei DUAS listas e só cuidei de uma no desfazer.* Vale para
   * o Ponto, a Caixa e a Máscara, que herdam este `apply` — o emissor só foi
   * o primeiro a ser provado num arquivo cru, porque o herói já tem slots e
   * nenhum teste partia de um que não tem.
   */
  private madeSlots = false;

  constructor(
    file: BoneFile,
    protected readonly bone: string,
    visibleSkins: readonly string[],
    suffix: string,
  ) {
    this.name = uniqueName(`${bone}${suffix}`, (file.slots ?? []).map((s) => s.name));
    this.skin = skinForNew(file, visibleSkins);
  }

  /** O anexo em si. Cada comando devolve o seu. */
  protected abstract build(): AttachmentDef;

  apply(doc: EditorDoc): void {
    const file = doc.file;
    this.madeSkin = !(file.skins ?? []).some((skin) => skin.name === this.skin);
    const skin = ensureSkin(file, this.skin);
    const attachments = skin.attachments ?? (skin.attachments = {});
    this.madeSlotMap = attachments[this.name] === undefined;
    attachments[this.name] = { [this.name]: this.build() };

    this.madeSlots = file.slots === undefined;
    const slots = file.slots ?? (file.slots = []);
    const slot: SlotDef = { name: this.name, bone: this.bone, attachment: this.name };
    this.addedSlot = slot;
    // A ordem do array de slots É a ordem de desenho. Quase tudo entra no fim,
    // por cima; uma máscara entra na FRENTE, porque ela recorta o que vem
    // depois dela e no fim não recortaria nada.
    if (this.atFront()) slots.unshift(slot);
    else slots.push(slot);
  }

  /** `true` para entrar no começo da ordem de desenho. Só a máscara quer isso. */
  protected atFront(): boolean {
    return false;
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    const slots = file.slots ?? [];
    // Pelo NOME guardado no construtor — defeito 1 (19/09/2026), como acima.
    const at = slots.findIndex((slot) => slot.name === this.name);
    if (at >= 0) slots.splice(at, 1);
    // A lista que este comando criou não sobrevive ao desfazer, do mesmo jeito
    // que a pele logo abaixo. `slots === []` num arquivo que não tinha `slots`
    // é uma diferença pequena e é uma diferença: o arquivo tem de voltar letra
    // por letra ao que era.
    if (this.madeSlots && slots.length === 0) delete (file as { slots?: unknown }).slots;

    const skins = file.skins ?? [];
    const skinAt = skins.findIndex((skin) => skin.name === this.skin);
    const skin = skins[skinAt];
    if (skin === undefined) return;
    if (this.madeSlotMap) delete skin.attachments?.[this.name];
    // Uma pele que este comando criou não pode sobreviver ao desfazer: o
    // arquivo tem que voltar letra por letra ao que era.
    if (this.madeSkin) skins.splice(skinAt, 1);
    if (skins.length === 0) delete (file as { skins?: unknown }).skins;
  }
}

/**
 * "Novo → Ponto" — item 12.
 *
 * Um `point` é posição e rotação com nome: a boca do cano da arma, o lugar de
 * onde sai a faísca, o alvo da câmera. O jogo lê a matriz de mundo dele e
 * pendura o que quiser ali. §7.9 do formato.
 *
 * `x`, `y` e `rotation` são do espaço do osso, e é por isso que a ferramenta
 * converte o clique do mundo para o osso antes de chamar aqui.
 */
export class AddPointAttachment extends AddSlotWithAttachment {
  readonly label = 'Novo ponto';

  constructor(
    file: BoneFile,
    bone: string,
    visibleSkins: readonly string[],
    private readonly x: number,
    private readonly y: number,
    private readonly rotation: number,
  ) {
    super(file, bone, visibleSkins, '_ponto');
  }

  protected build(): AttachmentDef {
    return pointAttachment(this.x, this.y, this.rotation);
  }
}

/** O `point` que nasce da ferramenta: posição e giro no espaço do osso. */
export function pointAttachment(x: number, y: number, rotation: number): AttachmentDef {
  return {
    type: 'point',
    x: roundValue(x),
    y: roundValue(y),
    rotation: roundValue(rotation),
  } as AttachmentDef;
}

/** A caixa que nasce da ferramenta: um polígono, no espaço do osso. */
export function boxAttachment(vertices: readonly number[]): AttachmentDef {
  return {
    type: 'boundingbox',
    shape: 'polygon',
    vertices: vertices.map(roundValue),
  } as AttachmentDef;
}

/**
 * "Novo → Caixa de colisão" — item 13.
 *
 * Um `boundingbox` é o contorno com que o jogo pergunta "isto encostou
 * naquilo?". Não desenha nada. §7.6.
 *
 * Nasce como **polígono de quatro vértices**, e não como `rectangle`, porque um
 * polígono é o que a ferramenta Malha já sabe editar: depois de criado, arrastar
 * os cantos é o mesmo gesto de sempre. Um `rectangle` teria largura e altura e
 * nenhuma alça.
 */
export class AddBoundingBox extends AddSlotWithAttachment {
  readonly label = 'Nova caixa de colisão';

  constructor(
    file: BoneFile,
    bone: string,
    visibleSkins: readonly string[],
    private readonly vertices: readonly number[],
  ) {
    super(file, bone, visibleSkins, '_caixa');
  }

  protected build(): AttachmentDef {
    return boxAttachment(this.vertices);
  }
}

// ---------------------------------------------------------------------------
// Emissor de partículas — extensão `BONE_particles`, lote 1 das partículas
// ---------------------------------------------------------------------------

/** O nome da extensão, como ele vai em `extensionsUsed` (§2.1: no PLURAL). */
export const PARTICLES_EXTENSION = 'BONE_particles';

/** O `type` do anexo, como ele vai no arquivo (§2.1: prefixado e no SINGULAR). */
export const PARTICLE_TYPE = 'BONE_particle';

/** `true` se este anexo é um emissor de partículas. */
export function isParticleDef(def: { type?: string } | null | undefined): boolean {
  return def?.type === PARTICLE_TYPE;
}

/** Toda semente já usada por um emissor do arquivo, em qualquer pele. */
export function usedSeeds(file: BoneFile): Set<number> {
  const seeds = new Set<number>();
  for (const skin of file.skins ?? []) {
    for (const porSlot of Object.values(skin.attachments ?? {})) {
      for (const def of Object.values(porSlot as Record<string, { type?: string; seed?: unknown }>)) {
        if (!isParticleDef(def)) continue;
        const seed = def.seed;
        if (typeof seed === 'number' && Number.isInteger(seed) && seed >= 0) seeds.add(seed);
      }
    }
  }
  return seeds;
}

/**
 * **Uma semente que nenhum outro emissor do arquivo usa** — §9.9 da extensão.
 *
 * *"Duplicar um emissor **DEVE** dar semente nova — é o defeito do Unity, e é o
 * que faz duas fogueiras lado a lado parecerem a mesma fogueira."* A spec diz,
 * com essas palavras, que isso é **regra de editor**: um leitor só lê o número
 * que está no arquivo. Então é aqui que ela se cumpre, ou em lugar nenhum.
 *
 * O número é o **menor inteiro livre**, e não um sorteio. Dois motivos, e os
 * dois pesam mais do que "parecer aleatório":
 *
 * - `Math.random` aqui faria o mesmo arquivo dar arquivos diferentes a cada
 *   vez que se criasse um emissor. O teste não teria o que prender, e o
 *   `.bone` deixaria de ser função do que a pessoa fez.
 * - a extensão não pede semente "espalhada": pede semente **diferente**. O
 *   `pcg` da §3.2 é um hash, não um contador — `0`, `1` e `2` dão fluxos de
 *   acaso sem nenhum parentesco entre si, que é o que a régua quer.
 *
 * `0` é semente válida (§9.9), e é a que o primeiro emissor recebe.
 */
export function freshSeed(file: BoneFile): number {
  const usadas = usedSeeds(file);
  for (let i = 0; ; i++) if (!usadas.has(i)) return i;
}

/**
 * O emissor que nasce do menu: o tipo, a semente, e nada mais.
 *
 * **Todo o resto fica ausente de propósito.** Cada campo da §9 tem padrão
 * escrito na extensão, e um padrão escrito no arquivo é um padrão que deixa de
 * seguir a extensão quando ela mudar de ideia. O arquivo só carrega o que a
 * pessoa escolheu — e a ficha (lote 3) escreve campo a campo, conforme ela
 * mexe.
 *
 * `path` também fica de fora, e isso **tem consequência visível**: sem `path`,
 * §9.8 manda usar o nome do próprio anexo como nome de região, e o carregador
 * avisa que a imagem não existe. É o aviso certo — o emissor ainda não tem
 * imagem, e dizer isso é melhor do que escolher uma imagem no lugar da pessoa.
 */
export function particleAttachment(seed: number): AttachmentDef {
  return { type: PARTICLE_TYPE, seed } as unknown as AttachmentDef;
}

/**
 * **"Novo → Emissor de partículas"** — o volante da extensão `BONE_particles`.
 *
 * O motor estava pronto dos dois lados (os dois runtimes, 16 casos de
 * conformidade) e **não havia um botão**: 🗣️ *"o carro sem o volante"*. Este
 * comando é o botão.
 *
 * Ele faz uma coisa que nenhum irmão dele faz: escreve `extensionsUsed`. A §2.7
 * da spec **exige** que todo `type` prefixado tenha a extensão declarada ali, e
 * a §2.2 desta extensão repete. Sem isso o arquivo nasce inválido — e inválido
 * de um jeito que só o validador vê, que é a pior espécie.
 *
 * O desfazer tira a declaração **só se este comando a pôs** (`madeExtension`).
 * Um arquivo que já tinha outro emissor continua declarando a extensão depois
 * de se desfazer este: ela ainda é usada.
 */
export class AddParticleEmitter extends AddSlotWithAttachment {
  readonly label = 'Novo emissor de partículas';
  /** A semente deste emissor, tirada no construtor. Quem chamou pode dizê-la. */
  readonly seed: number;
  /** `true` quando `extensionsUsed` não citava a extensão e este comando citou. */
  private madeExtension = false;

  constructor(file: BoneFile, bone: string, visibleSkins: readonly string[]) {
    super(file, bone, visibleSkins, '_particulas');
    // No CONSTRUTOR, e guardada. Ler a semente do arquivo vivo dentro do
    // `apply` daria um número novo a cada refazer, e o refazer deixaria de ser
    // o inverso do desfazer — é a forma do defeito 1 de 19/09: *guardei uma
    // chave que o próprio programa pode reescrever*.
    this.seed = freshSeed(file);
  }

  protected build(): AttachmentDef {
    return particleAttachment(this.seed);
  }

  apply(doc: EditorDoc): void {
    super.apply(doc);
    const file = doc.file as BoneFile & { extensionsUsed?: string[] };
    const usadas = file.extensionsUsed ?? (file.extensionsUsed = []);
    this.madeExtension = !usadas.includes(PARTICLES_EXTENSION);
    if (this.madeExtension) usadas.push(PARTICLES_EXTENSION);
  }

  revert(doc: EditorDoc): void {
    const file = doc.file as BoneFile & { extensionsUsed?: string[] };
    if (this.madeExtension) {
      const usadas = file.extensionsUsed ?? [];
      const at = usadas.indexOf(PARTICLES_EXTENSION);
      if (at >= 0) usadas.splice(at, 1);
      if (usadas.length === 0) delete file.extensionsUsed;
    }
    super.revert(doc);
  }
}

// ---------------------------------------------------------------------------
// Lote 40 — ponto e caixa dentro de um slot que já existe (Spine 4)
// ---------------------------------------------------------------------------

/**
 * Onde um ponto ou uma caixa nova nasce.
 *
 * - **Um slot escolhido, e nenhum osso** → dentro dele, como mais um desenho
 *   do slot. É o que se tem escolhendo o slot na Árvore.
 * - Qualquer outra coisa → o de sempre: slot novo no osso escolhido, ou no
 *   primeiro osso.
 *
 * O "nenhum osso" é de propósito. Clicar num desenho na cena escolhe o osso,
 * o slot e o desenho juntos; se isso bastasse, o gesto de todo dia — escolher
 * pela cena e criar — mudaria de lugar sem ninguém pedir.
 */
export type ShapeTarget =
  | { kind: 'slot'; slot: string; bone: string }
  | { kind: 'bone'; bone: string };

export function shapeTarget(file: BoneFile, selection: Selection): ShapeTarget | null {
  if (selection.slots.length === 1 && selection.bones.length === 0) {
    const slot = (file.slots ?? []).find((s) => s.name === selection.slots[0]);
    if (slot !== undefined) return { kind: 'slot', slot: slot.name, bone: slot.bone };
  }
  // Item 3.1, 13/09/2026: o osso que veio de carona com um desenho clicado na
  // cena não conta como escolhido. Sem osso escolhido com a mão, o ponto e a
  // caixa nascem **soltos**, na raiz — a mesma regra do osso novo
  // (`newBoneParent`). Era daqui que saía o "vira parente de coisa que não
  // estava selecionada" no Ponto e na Caixa.
  // Rodada 46, lote 5 (nota (a) do doc `80`, a mesma regra do osso novo): com
  // desenho na escolha, só o osso de carona (o do próprio desenho) não conta.
  const carona = new Set(
    [...selection.slots, ...selection.attachments.map((a) => a.slot)]
      .map((slot) => (file.slots ?? []).find((s) => s.name === slot)?.bone)
      .filter((b): b is string => b !== undefined),
  );
  const escolhido = selection.attachments.length > 0 ? selection.bones.find((b) => !carona.has(b)) : selection.bones[0];
  const bone = escolhido ?? file.bones?.[0]?.name;
  return bone === undefined ? null : { kind: 'bone', bone };
}

/**
 * Um nome de anexo livre dentro do slot, olhando **todas** as peles.
 *
 * Todas, e não só a do lápis: a chave `slot/attachment` troca pelo nome, e o
 * mesmo nome em duas peles é a mesma peça para a linha do tempo. `hand_ponto`,
 * depois `hand_ponto_2`, como o Duplicar.
 */
export function attachmentNameInSlot(file: BoneFile, slot: string, base: string): string {
  const taken = new Set<string>();
  for (const skin of file.skins ?? []) {
    for (const name of Object.keys(skin.attachments?.[slot] ?? {})) taken.add(name);
  }
  if (!taken.has(base)) return base;
  const raiz = base.replace(/_\d+$/, '');
  for (let i = 2; ; i++) {
    const nome = `${raiz}_${i}`;
    if (!taken.has(nome)) return nome;
  }
}

/**
 * Põe um anexo num slot que **já existe**, sem torná-lo o ativo.
 *
 * O slot não muda: nem de osso, nem de lugar na ordem, nem de desenho ativo.
 * O anexo nasce com a bolinha `○` da Árvore, e passa a valer por uma chave
 * `slot/attachment` ou pela bolinha — como qualquer outro desenho do slot. É
 * assim que ponto e caixa trocam por chave e por pele, como o formato sempre
 * permitiu (§7.1).
 *
 * O nome final sai na primeira aplicação (`attachmentNameInSlot`) e fica
 * guardado: refazer dá o mesmo nome.
 */
export class AddAttachmentToSlot implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  /** O nome que o anexo ganhou. Vale depois do primeiro `apply`. */
  name: string;
  private resolved = false;
  private hadSkins = false;
  private madeSkin = false;
  private madeAttachments = false;
  private madeSlotMap = false;

  constructor(
    readonly slot: string,
    readonly skin: string,
    wanted: string,
    private readonly def: AttachmentDef,
    label = 'Novo anexo no slot',
  ) {
    this.name = wanted;
    this.label = label;
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    if (!this.resolved) {
      this.name = attachmentNameInSlot(file, this.slot, this.name);
      this.resolved = true;
    }
    this.hadSkins = file.skins !== undefined;
    this.madeSkin = !(file.skins ?? []).some((skin) => skin.name === this.skin);
    const skin = ensureSkin(file, this.skin);
    this.madeAttachments = skin.attachments === undefined;
    const attachments = skin.attachments ?? (skin.attachments = {});
    this.madeSlotMap = attachments[this.slot] === undefined;
    const map = attachments[this.slot] ?? (attachments[this.slot] = {});
    map[this.name] = JSON.parse(JSON.stringify(this.def)) as AttachmentDef;
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    const skins = file.skins ?? [];
    const skinAt = skins.findIndex((skin) => skin.name === this.skin);
    const skin = skins[skinAt];
    if (skin === undefined) return;
    const map = skin.attachments?.[this.slot];
    if (map !== undefined) delete map[this.name];
    if (this.madeSlotMap) delete skin.attachments?.[this.slot];
    if (this.madeAttachments) delete skin.attachments;
    if (this.madeSkin) skins.splice(skinAt, 1);
    if (!this.hadSkins) delete (file as { skins?: unknown }).skins;
  }
}

/** A frase do rodapé depois de pôr um ponto ou uma caixa num slot que já existe. */
export function inSlotNotice(kind: 'Ponto' | 'Caixa', name: string, slot: string): string {
  // Lote 64: a bolinha ○ saiu com as três listas; a Árvore tem uma linha por
  // slot. Quem troca o desenho do slot é o campo Anexo das Propriedades.
  return `${kind} ${name} entrou no slot ${slot}: `
    + 'escolha-o no campo Anexo das Propriedades, ou grave uma chave, para usá-lo';
}

/** Lado do quadrado com que uma máscara nova nasce, no espaço do osso. */
export const DEFAULT_MASK_SIZE = 100;

/**
 * "Novo → Máscara" — item 47.
 *
 * Um `clipping` (§7.7) é um polígono que RECORTA: o que estiver fora dele, dos
 * slots que ele alcança, não aparece. É como se põe o cabelo dentro do gorro, o
 * olho dentro da pálpebra, a barra da roupa dentro do cinto — sem apagar
 * desenho nenhum, e sem refazer a arte.
 *
 * DUAS COISAS QUE PRECISAM SER ASSIM, E O MOTIVO:
 *
 * 1. **Ela entra na FRENTE da ordem de desenho.** Uma máscara recorta do seu
 *    próprio slot em diante; criada no fim, ela não alcançaria nada e pareceria
 *    quebrada.
 * 2. **`end` é o último slot que existia antes dela.** É o "recorta tudo" que
 *    se espera de uma máscara recém-criada, e é o que se ajusta depois no campo
 *    "Recorta até" — sem `end` nem `slots`, §7.7 diz que ela não recorta nada.
 */
export class AddClipping extends AddSlotWithAttachment {
  readonly label = 'Nova máscara';
  private readonly end: string | undefined;

  constructor(file: BoneFile, bone: string, visibleSkins: readonly string[]) {
    super(file, bone, visibleSkins, '_mascara');
    const slots = file.slots ?? [];
    this.end = slots[slots.length - 1]?.name;
  }

  protected override atFront(): boolean {
    return true;
  }

  protected build(): AttachmentDef {
    const half = DEFAULT_MASK_SIZE / 2;
    const def: Record<string, unknown> = {
      type: 'clipping',
      vertices: boxVertices(-half, -half, half, half),
    };
    if (this.end !== undefined) def['end'] = this.end;
    return def as unknown as AttachmentDef;
  }
}

/**
 * Os quatro vértices de uma caixa a partir de dois cantos, no espaço do osso.
 *
 * Em ordem, sem se cruzar: canto de baixo à esquerda, de baixo à direita, de
 * cima à direita, de cima à esquerda. Um contorno que se cruza é L2 no formato.
 */
export function boxVertices(
  x1: number, y1: number, x2: number, y2: number,
): number[] {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  return [minX, minY, maxX, minY, maxX, maxY, minX, maxY];
}

/** Arredonda para o arquivo não encher de casas que ninguém pediu. */
function roundValue(value: number): number {
  return Math.round(value * 1e4) / 1e4;
}

// ---------------------------------------------------------------------------
// Criar regra, evento, pele e parâmetro (E1)
// ---------------------------------------------------------------------------

/**
 * As cinco regras que dá para criar, na ordem em que aparecem na escolha.
 *
 * Sem isto, um personagem montado do zero no editor nunca ganhava cadeia de IK
 * nem física de cabelo: dava para escolher, editar e apagar as regras que já
 * vinham no arquivo, e só. Isso derrubava na prática D9, P1, P2 e P3.
 */
export const CONSTRAINT_TYPES: readonly ConstraintType[] = [
  'ik', 'transform', 'path', 'physics', 'driver',
];

/** Prefixo do nome novo de cada tipo, para o nome nascer legível. */
const CONSTRAINT_PREFIX: Record<ConstraintType, string> = {
  ik: 'ik',
  transform: 'transformar',
  path: 'caminho',
  physics: 'fisica',
  driver: 'comando',
};

/**
 * Uma regra nova, já ligada em ossos que existem.
 *
 * Os padrões seguem a especificação (§6): `mix` 1, e os ossos escolhidos —
 * ou, se nada estiver escolhido, o primeiro osso do arquivo. Uma regra que
 * nasce apontando para o vazio não carrega, e o editor mostraria um aviso em
 * vez de uma regra.
 */
export class AddConstraint implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  readonly name: string;
  private added: ConstraintDef | null = null;

  constructor(
    file: BoneFile,
    private readonly type: ConstraintType,
    private readonly bones: readonly string[] = [],
  ) {
    this.name = uniqueName(
      CONSTRAINT_PREFIX[type],
      (file.constraints ?? []).map((c) => c.name),
    );
    this.label = `Nova regra de ${constraintTypeLabel(type)}`;
    this.added = buildConstraint(file, type, this.name, bones);
  }

  apply(doc: EditorDoc): void {
    this.created = doc.file.constraints === undefined;
    const list = doc.file.constraints ?? (doc.file.constraints = []);
    // Reconstrói contra o arquivo vivo: entre construir e aplicar o documento
    // pode ter sido trocado, e desfazer/refazer aplica o mesmo comando de novo.
    this.added = buildConstraint(doc.file, this.type, this.name, this.bones);
    list.push(this.added);
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.constraints ?? [];
    const at = list.findIndex((c) => c.name === this.name);
    if (at >= 0) list.splice(at, 1);
    if (this.created && list.length === 0) delete doc.file.constraints;
  }

  /** Lote 1 do chat D: a lista nasceu aqui, e o desfazer a leva embora. */
  private created = false;
}

function buildConstraint(
  file: BoneFile,
  type: ConstraintType,
  name: string,
  picked: readonly string[],
): ConstraintDef {
  const all = (file.bones ?? []).map((b) => b.name);
  const chain = picked.filter((b) => all.includes(b));
  const first = chain[0] ?? all[0] ?? 'root';
  // O alvo não pode ser um osso da cadeia: uma regra que persegue a si mesma
  // não tem solução. Cai no último osso livre, ou no primeiro do arquivo.
  const target = all.find((b) => !chain.includes(b)) ?? first;

  switch (type) {
    case 'ik':
      return { type: 'ik', name, bones: [first], target, mix: 1 };
    case 'transform':
      return { type: 'transform', name, bones: [first], target, mix: 1 };
    case 'path':
      return { type: 'path', name, bones: [first], target, mix: 1 };
    case 'physics':
      return { type: 'physics', name, bone: first, mix: 1, rotation: 1 };
    case 'driver':
    default:
      return { type: 'driver', name, parameter: '', targets: [], mix: 1 };
  }
}

/** Um evento novo, para uma chave de evento ter o que disparar. */
export class AddEvent implements Command {
  readonly label = 'Novo evento';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(file: BoneFile) {
    this.name = uniqueName('evento', (file.events ?? []).map((e) => e.name));
  }

  /**
   * A lista `events` nasceu neste comando? — lote 1 do chat D (28/09).
   * *Criei a lista e não cuidei dela no desfazer*: num arquivo sem eventos,
   * criar e desfazer deixava `"events": []`, e o texto não voltava igual. A
   * mesma forma do `AddSlotWithAttachment` (lote 1 das partículas, 22/09).
   */
  private created = false;

  apply(doc: EditorDoc): void {
    this.created = doc.file.events === undefined;
    const list = doc.file.events ?? (doc.file.events = []);
    list.push({ name: this.name });
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.events ?? [];
    const at = list.findIndex((e) => e.name === this.name);
    if (at >= 0) list.splice(at, 1);
    if (this.created && list.length === 0) delete doc.file.events;
  }
}

/**
 * Uma pele nova, vazia.
 *
 * Antes disso uma pele só nascia importando imagens, então uma segunda roupa
 * para o mesmo personagem não tinha por onde começar dentro do editor.
 */
export class AddSkin implements Command {
  readonly label = 'Nova skin';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(file: BoneFile) {
    // Rodada 23 (defeito 2 do `07`): nascia "pele", a sobra de palavra que o
    // usuário mais via ("Skin "pele" criada…"). A palavra da tela é skin.
    this.name = uniqueName('skin', (file.skins ?? []).map((s) => s.name));
  }

  /** A lista nasceu aqui? A mesma forma do `AddEvent` (lote 1 do chat D). */
  private created = false;

  apply(doc: EditorDoc): void {
    this.created = doc.file.skins === undefined;
    const list = doc.file.skins ?? (doc.file.skins = []);
    list.push({ name: this.name, attachments: {} });
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.skins ?? [];
    const at = list.findIndex((s) => s.name === this.name);
    if (at >= 0) list.splice(at, 1);
    if (this.created && list.length === 0) delete doc.file.skins;
  }
}

/** Um parâmetro novo, com a faixa padrão de -1 a 1 da especificação (§4.5). */
export class AddParameter implements Command {
  readonly label = 'Novo parâmetro';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(file: BoneFile) {
    this.name = uniqueName('parametro', (file.parameters ?? []).map((p) => p.name));
  }

  /** A lista nasceu aqui? A mesma forma do `AddEvent` (lote 1 do chat D). */
  private created = false;

  apply(doc: EditorDoc): void {
    this.created = doc.file.parameters === undefined;
    const list = doc.file.parameters ?? (doc.file.parameters = []);
    list.push({ name: this.name, min: -1, max: 1, default: 0 });
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.parameters ?? [];
    const at = list.findIndex((p) => p.name === this.name);
    if (at >= 0) list.splice(at, 1);
    if (this.created && list.length === 0) delete doc.file.parameters;
  }
}

/**
 * Apaga um parâmetro **e as chaves dele** — degrau 12, porta D3.
 *
 * As regras Comando que o liam continuam no arquivo, e ficam em vermelho na
 * lista dizendo que o parâmetro não existe (`driverProblems`): apagar a regra
 * junto seria apagar trabalho que ninguém pediu para apagar, e o rodapé da
 * aba Regras já nomeia quem ficou sem.
 *
 * Guarda o arquivo inteiro, como o `DeleteItems`: o desfazer devolve o mesmo
 * texto, letra por letra.
 */
export class DeleteParameter implements Command {
  readonly label = 'Apagar o parâmetro';
  readonly kind: ChangeKind = 'structure';
  private saved: string | null = null;

  constructor(private readonly name: string) {}

  apply(doc: EditorDoc): void {
    this.saved = JSON.stringify(doc.file);
    const list = doc.file.parameters ?? [];
    const at = list.findIndex((p) => p.name === this.name);
    if (at >= 0) list.splice(at, 1);
    for (const animation of doc.file.animations ?? []) {
      const bag = animation as { timelines?: Array<{ type?: string; target?: string }> };
      if (!Array.isArray(bag.timelines)) continue;
      bag.timelines = bag.timelines.filter(
        (tl) => !(tl.type === 'parameter' && tl.target === this.name),
      );
    }
  }

  revert(doc: EditorDoc): void {
    if (this.saved === null) return;
    const before = JSON.parse(this.saved) as BoneFile;
    const file = doc.file as unknown as Record<string, unknown>;
    for (const key of Object.keys(file)) delete file[key];
    Object.assign(file, before);
  }
}

/**
 * Says whether `DeleteItems` would actually remove anything.
 *
 * Without this the Apagar button stayed lit with only the root bone picked:
 * the command ran, wrote "Apagar" on the status bar, marked the file dirty and
 * pushed an undo step — and deleted nothing. Silent no-op, the kind of thing
 * that makes a person click again thinking the first click did not take.
 */
export function canDeleteSelection(file: BoneFile, selection: Selection): boolean {
  if (selection.slots.length > 0) return true;
  if (selection.constraints.length > 0) return true;
  if (selection.attachments.length > 0) return true;
  const rootName = (file.bones ?? [])[0]?.name;
  return selection.bones.some((name) => name !== rootName);
}

/**
 * Deletes bones (with everything under them), slots and constraints.
 *
 * The root bone is never deleted. Slots on a deleted bone go with it, and so do
 * the attachments of a deleted slot and the constraints that point at it, so
 * the file stays loadable.
 *
 * Lote 57, plano pivô: and so do their **timelines**, in every animation, with
 * every other reference (`applyRemoval` of `doc/commands.ts`). Deleting an
 * animated bone used to leave orphan timelines behind. The undo keeps the
 * whole file, so it gives the very same text back.
 */
export class DeleteItems implements Command {
  readonly label = 'Apagar';
  readonly kind: ChangeKind = 'structure';
  private saved: string | null = null;

  constructor(private readonly selection: Selection) {}

  apply(doc: EditorDoc): void {
    const file = doc.file;
    this.saved = JSON.stringify(file);

    const bones = file.bones ?? [];
    const rootName = bones[0]?.name;
    const doomedBones = new Set<string>();
    for (const name of this.selection.bones) {
      if (name === rootName) continue;
      for (const bone of bones) {
        if (isDescendantBone(file, bone.name, name)) doomedBones.add(bone.name);
      }
    }

    const doomedSlots = new Set(this.selection.slots);
    for (const slot of file.slots ?? []) {
      if (doomedBones.has(slot.bone)) doomedSlots.add(slot.name);
    }
    // Rodada 8d: a imagem leva junto o osso próprio dela, com as chaves dele.
    // Ele só existia para ela; ficaria no arquivo escondido e sem dono.
    for (const name of doomedSlots) {
      const own = ownBoneOfSlot(file, name);
      if (own === null) continue;
      const others = (file.slots ?? []).some((s) => s.bone === own && !doomedSlots.has(s.name));
      if (!others) doomedBones.add(own);
    }

    const doomedConstraints = new Set(this.selection.constraints);
    for (const c of file.constraints ?? []) {
      const uses = constraintBones(c).some((b) => doomedBones.has(b));
      if (uses) doomedConstraints.add(c.name);
    }

    file.bones = bones.filter((b) => !doomedBones.has(b.name));
    if (file.slots) file.slots = file.slots.filter((s) => !doomedSlots.has(s.name));
    if (file.constraints) {
      file.constraints = file.constraints.filter((c) => !doomedConstraints.has(c.name));
    }
    for (const skin of file.skins ?? []) {
      if (!skin.attachments) continue;
      for (const slotName of Object.keys(skin.attachments)) {
        if (doomedSlots.has(slotName)) delete skin.attachments[slotName];
      }
      skin.bones = skin.bones?.filter((b) => !doomedBones.has(b));
      skin.constraints = skin.constraints?.filter((c) => !doomedConstraints.has(c));
    }
    for (const { slot, attachment } of this.selection.attachments) {
      for (const skin of file.skins ?? []) {
        if (skin.attachments?.[slot]) delete skin.attachments[slot]![attachment];
      }
    }
    // Rodada 13: as chaves das peças que saem ficam GUARDADAS no arquivo, e
    // voltam quando uma peça com o mesmo nome voltar (`doc/guarded-keys.ts`).
    this.guarded = guardRemoved(file, { bones: doomedBones, slots: doomedSlots, constraints: doomedConstraints });
    applyRemoval(file, { bones: doomedBones, slots: doomedSlots, constraints: doomedConstraints });
  }

  /** O que a última aplicação guardou, para o rodapé (`guardNotice`). */
  guarded: GuardSummary = { keys: 0, animations: 0, names: [] };

  revert(doc: EditorDoc): void {
    if (this.saved === null) return;
    // In place, key by key: `doc.file` is the document, not a copy of it.
    const target = doc.file as unknown as Record<string, unknown>;
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, JSON.parse(this.saved));
    this.saved = null;
  }
}

/**
 * Os slots que não mostram nada — a conta da vassoura, 13/09/2026.
 *
 * O Humberto: *"eu imagino que eu vou criar imagem, tirar imagens, e vai
 * acabar tendo muitos slots soltos. Porque eu não sei como é que eu vou
 * administrar eles."*
 *
 * Um slot está vazio quando **pele nenhuma** põe um anexo nele. Três coisas
 * que PARECEM vazio e não são:
 *
 * - **ponto, caixa e máscara são anexos.** Um slot com um ponto dentro mostra
 *   alguma coisa, mesmo que ela não tenha imagem;
 * - **slot vestido só numa pele.** Ficar vazio na pele `default` e cheio na
 *   `armadura` é exatamente o trabalho das peles;
 * - **slot que outra coisa cita pelo nome:** o `end` e a lista de uma máscara
 *   (7.7), o alvo de uma regra de caminho, o alvo de um morph. Ali um slot
 *   vazio é um marco, não é lixo.
 *
 * Módulo puro: lê o arquivo e devolve nomes. Não toca no documento.
 */
export function emptySlots(file: BoneFile): string[] {
  const dressed = new Set<string>();
  const cited = new Set<string>();

  for (const skin of file.skins ?? []) {
    for (const [slot, byName] of Object.entries(skin.attachments ?? {})) {
      for (const attachment of Object.values(byName ?? {})) {
        // `null` é a pele que ESCONDE aquele anexo (13.3, o character map do
        // Spriter sem alvo). Esconder não é vestir.
        if (attachment === null || attachment === undefined) continue;
        dressed.add(slot);
        if (attachment.type !== 'clipping') continue;
        if (typeof attachment.end === 'string') cited.add(attachment.end);
        for (const name of attachment.slots ?? []) cited.add(name);
      }
    }
  }

  for (const constraint of file.constraints ?? []) {
    if (constraint.type === 'path') cited.add(constraint.target);
  }
  for (const morph of file.morphs ?? []) {
    for (const target of morph.targets ?? []) cited.add(target.slot);
  }

  return (file.slots ?? [])
    .filter((slot) => !dressed.has(slot.name) && !cited.has(slot.name))
    .map((slot) => slot.name);
}

/**
 * Apaga de uma vez todos os slots vazios, num passo de desfazer só.
 *
 * Montado em cima do `DeleteItems`, que já sabe levar junto o que fica órfão
 * (`applyRemoval`): as timelines de slot, de deform e de sequência, as
 * entradas de ordem de desenho, e as citações numa máscara. Refazer a conta
 * aqui seria uma segunda verdade envelhecendo sozinha.
 *
 * `names` é calculado no construtor, e não no `apply`: assim o menu sabe de
 * antemão se há trabalho, e o botão não acende para não fazer nada — a mesma
 * razão do `canDeleteSelection` acima.
 */
export class CleanEmptySlots implements Command {
  readonly label = 'Limpar desenhos vazios';
  readonly kind: ChangeKind = 'structure';
  /** Os slots que serão apagados. Vazio = não há trabalho. */
  readonly names: readonly string[];
  private inner: DeleteItems | null = null;

  constructor(file: BoneFile) {
    this.names = emptySlots(file);
  }

  get hasWork(): boolean {
    return this.names.length > 0;
  }

  apply(doc: EditorDoc): void {
    if (this.names.length === 0) return;
    this.inner = new DeleteItems({ ...emptySelection(), slots: [...this.names] });
    this.inner.apply(doc);
  }

  revert(doc: EditorDoc): void {
    this.inner?.revert(doc);
    this.inner = null;
  }
}

/** Bone names a constraint depends on. */
export function constraintBones(def: ConstraintDef): string[] {
  const names: string[] = [];
  if ('bones' in def && Array.isArray(def.bones)) names.push(...def.bones);
  if ('bone' in def && typeof def.bone === 'string') names.push(def.bone);
  if (def.type === 'ik' || def.type === 'transform') names.push(def.target);
  return names;
}
