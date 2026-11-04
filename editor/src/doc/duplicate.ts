/**
 * Duplicar — anotação 26, lote 37.
 *
 * *"Não há como duplicar um osso, um slot ou um membro inteiro"*: `Copiar` e
 * `Colar` ficavam cinzas com um osso escolhido — eles são só de chaves —, e
 * `Duplicar` só existia para animação e para pele. Montar a metade de trás de
 * um personagem era refazer braço, antebraço e mão à mão, um osso de cada vez.
 *
 * O que este comando faz, e por que assim:
 *
 * - **Um osso leva o membro inteiro**: os filhos dele, e os desenhos que
 *   pendem de todos eles. Duplicar só o osso deixaria uma cópia pelada, que
 *   ninguém quer.
 * - **Os nomes ganham `_2`**, `_3`… Nunca dois nomes iguais no mesmo arquivo:
 *   o formato os usa como chave (§7.2).
 * - **A cópia nasce deslocada 20 px para a direita**, no MUNDO, e já escolhida.
 *   Nascer em cima do original é nascer invisível.
 * - **As regras não são duplicadas nem redirecionadas**, e a tela diz quantas
 *   ficaram de fora. Uma regra de IK duplicada às cegas passaria a puxar dois
 *   braços pelo mesmo alvo, que é pior do que não ter regra nenhuma.
 *
 * **Espelhar ao duplicar fica para depois**, de propósito: precisa da decisão
 * do eixo e da regra de nome (`_esq` / `_dir`), que são do dono. Está escrito
 * para não voltar sem decisão.
 */

import type {
  AttachmentDef, BoneDef, BoneFile, SlotDef,
} from '../../../runtime/src/index.js';
import { isOwnBone } from './own-bone.js';
import type { ChangeKind, Command, EditorDoc, Selection } from '../contract.js';
import { emptySelection, uniqueName } from '../contract.js';
import { setupWorldMatrices } from './reparent.js';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * O nome da cópia: `arm` → `arm_2` → `arm_3`, e não `arm_2_2`.
 *
 * O sufixo de número é **trocado**, e não empilhado: duplicar a cópia de uma
 * cópia daria `arm_2_2_2`, e ninguém lê isso. Um nome que já acaba em `_N`
 * perde o número e disputa o primeiro livre a partir de 2.
 */
export function copyName(base: string, taken: Iterable<string>): string {
  const usados = new Set(taken);
  const raiz = base.replace(/_\d+$/, '');
  for (let i = 2; ; i++) {
    const nome = `${raiz}_${i}`;
    if (!usados.has(nome)) return nome;
  }
}

/** Quanto a cópia anda, em unidades do mundo. À direita, como no Spine. */
export const DUPLICATE_OFFSET = { x: 20, y: 0 };

/** O que uma seleção duplica, e o que fica de fora. */
export interface DuplicateTargets {
  /** Ossos a duplicar, na ordem do arquivo: os escolhidos e os filhos deles. */
  bones: string[];
  /** Slots a duplicar: os escolhidos, e os que pendem dos ossos acima. */
  slots: string[];
  /** Regras que apontam para o que vai ser duplicado. Elas NÃO são copiadas. */
  constraints: string[];
}

/** Todos os descendentes de `name`, ele incluído, na ordem do arquivo. */
function subtree(file: BoneFile, name: string): string[] {
  const bones = file.bones ?? [];
  const dentro = new Set([name]);
  for (const bone of bones) {
    if (bone.parent !== undefined && dentro.has(bone.parent)) dentro.add(bone.name);
  }
  return bones.filter((bone) => dentro.has(bone.name)).map((bone) => bone.name);
}

/** Uma regra fala deste osso? Pelos campos que o formato define (§8). */
function constraintTouches(rule: Record<string, unknown>, bones: ReadonlySet<string>): boolean {
  const lista = rule['bones'];
  if (Array.isArray(lista) && lista.some((n) => typeof n === 'string' && bones.has(n))) return true;
  for (const chave of ['bone', 'target', 'parameter']) {
    const valor = rule[chave];
    if (typeof valor === 'string' && bones.has(valor)) return true;
  }
  return false;
}

/**
 * O que esta seleção duplica.
 *
 * A **raiz nunca** entra: ela é o chão do arquivo, e um segundo chão não faz
 * sentido (§7.2 exige exatamente um osso sem pai).
 */
export function duplicateTargets(
  file: BoneFile, selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
): DuplicateTargets {
  const bones = file.bones ?? [];
  const raiz = bones[0]?.name;
  const dentro = new Set<string>();
  for (const nome of selection.bones) {
    if (nome === raiz) continue;
    for (const filho of subtree(file, nome)) dentro.add(filho);
  }

  const slots = new Set<string>();
  for (const slot of file.slots ?? []) {
    if (dentro.has(slot.bone)) slots.add(slot.name);
  }
  for (const nome of selection.slots) {
    if ((file.slots ?? []).some((slot) => slot.name === nome)) slots.add(nome);
  }
  for (const item of selection.attachments) {
    if ((file.slots ?? []).some((slot) => slot.name === item.slot)) slots.add(item.slot);
  }
  // Rodada 8d: a imagem com osso próprio vai com ele. Sem isso a cópia ficaria
  // pendurada no osso próprio da original, e mover uma moveria as duas.
  for (const slot of file.slots ?? []) {
    if (slots.has(slot.name) && !dentro.has(slot.bone) && isOwnBone(file, slot.bone)) dentro.add(slot.bone);
  }

  const constraints = (file.constraints ?? [])
    .filter((rule) => constraintTouches(rule as unknown as Record<string, unknown>, dentro))
    .map((rule) => rule.name);

  return {
    bones: bones.filter((bone) => dentro.has(bone.name)).map((bone) => bone.name),
    slots: (file.slots ?? []).filter((slot) => slots.has(slot.name)).map((slot) => slot.name),
    constraints,
  };
}

/** Duplica ossos, slots e desenhos num passo de desfazer só. */
export class Duplicate implements Command {
  readonly label: string = 'Duplicar';
  readonly kind: ChangeKind = 'structure';

  /** Os nomes novos, na mesma ordem dos originais. */
  readonly newBones = new Map<string, string>();
  readonly newSlots = new Map<string, string>();
  readonly targets: DuplicateTargets;

  private beforeBones: BoneDef[] | null = null;
  private beforeSlots: SlotDef[] | null = null;
  private beforeSkins: unknown = null;

  constructor(
    file: BoneFile,
    selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
    readonly offset: { x: number; y: number } = DUPLICATE_OFFSET,
  ) {
    this.targets = duplicateTargets(file, selection);
    this.ownBones = new Set(this.targets.bones.filter((name) => isOwnBone(file, name)));
  }

  get hasWork(): boolean {
    return this.targets.bones.length > 0 || this.targets.slots.length > 0;
  }

  /** A seleção que fica depois: só o que nasceu. O osso próprio copiado não (8d): ele não se vê. */
  selectionAfter(): Selection {
    return {
      ...emptySelection(),
      bones: [...this.newBones.entries()].filter(([original]) => !this.ownBones.has(original)).map(([, novo]) => novo),
      slots: [...this.newSlots.values()],
    };
  }

  /** Os ossos próprios de imagem que entraram na cópia junto com a imagem (8d). */
  private readonly ownBones: ReadonlySet<string>;

  apply(doc: EditorDoc): void {
    const file = doc.file;
    const bones = file.bones ?? (file.bones = []);
    const slots = file.slots ?? (file.slots = []);
    this.beforeBones = clone(bones);
    this.beforeSlots = clone(slots);
    this.beforeSkins = clone(file.skins ?? []);
    this.newBones.clear();
    this.newSlots.clear();

    const mundo = setupWorldMatrices(file);
    const usados = new Set(bones.map((bone) => bone.name));
    for (const nome of this.targets.bones) {
      const novo = copyName(nome, usados);
      usados.add(novo);
      this.newBones.set(nome, novo);
    }

    // Os ossos novos entram logo depois do último do bloco original, para o
    // arquivo continuar com o pai antes do filho (§7.2) sem reordenar nada.
    const copias: BoneDef[] = [];
    for (const nome of this.targets.bones) {
      const original = bones.find((bone) => bone.name === nome);
      if (original === undefined) continue;
      const copia = clone(original);
      copia.name = this.newBones.get(nome)!;
      const pai = original.parent;
      if (pai !== undefined && this.newBones.has(pai)) copia.parent = this.newBones.get(pai)!;
      copias.push(copia);
    }

    // O deslocamento vale para o **topo** do bloco: os filhos andam junto
    // porque eles medem a partir dele.
    //
    // A conta é do VETOR, e não da matriz inteira: 20 px do mundo viram
    // `P⁻¹ · (20, 0)` no espaço do pai, e o resto da pose — giro, escala,
    // inclinação — fica exatamente como estava. Recompor a pose a partir da
    // matriz de mundo copiaria junto o que uma REGRA fez com o original (a
    // cópia não tem regra nenhuma), e a cópia sairia torta.
    const topo = this.targets.bones.find(
      (nome) => !this.newBones.has(bones.find((b) => b.name === nome)?.parent ?? ''),
    );
    if (topo !== undefined && mundo !== null) {
      const copia = copias.find((bone) => bone.name === this.newBones.get(topo));
      const paiNome = bones.find((bone) => bone.name === topo)?.parent;
      const doPai = paiNome === undefined ? null : mundo.get(paiNome) ?? null;
      if (copia !== undefined && doPai !== null) {
        const det = doPai.a * doPai.d - doPai.b * doPai.c;
        if (Math.abs(det) > 1e-12) {
          const dx = (doPai.d * this.offset.x - doPai.b * this.offset.y) / det;
          const dy = (doPai.a * this.offset.y - doPai.c * this.offset.x) / det;
          copia.x = round((original(bones, topo)?.x ?? 0) + dx);
          copia.y = round((original(bones, topo)?.y ?? 0) + dy);
        }
      }
    }
    bones.push(...copias);

    // Os slots entram **logo depois** do original, para a cópia ficar vizinha
    // dele na ordem de desenho em vez de ir para trás de tudo.
    const nomesSlots = new Set(slots.map((slot) => slot.name));
    for (const nome of this.targets.slots) {
      const novo = copyName(nome, nomesSlots);
      nomesSlots.add(novo);
      this.newSlots.set(nome, novo);
    }
    for (const nome of [...this.targets.slots].reverse()) {
      const at = slots.findIndex((slot) => slot.name === nome);
      if (at < 0) continue;
      const copia = clone(slots[at]!);
      copia.name = this.newSlots.get(nome)!;
      const doOsso = this.newBones.get(copia.bone);
      if (doOsso !== undefined) copia.bone = doOsso;
      slots.splice(at + 1, 0, copia);
    }

    // Os desenhos: a mesma tabela, no slot novo, com os mesmos nomes de anexo.
    // Nome de anexo é chave DENTRO do slot (§7.8), então não há choque.
    const sementes = usedSeeds(file);
    for (const skin of file.skins ?? []) {
      const tabela = skin.attachments;
      if (tabela === undefined) continue;
      for (const [slotNome, entradas] of Object.entries(tabela)) {
        const novo = this.newSlots.get(slotNome);
        if (novo === undefined || entradas === undefined) continue;
        const copia = clone(entradas) as Record<string, AttachmentDef>;
        // Rodada 15: o emissor copiado ganha SEMENTE NOVA. A §9.9 da extensão:
        // "Duplicar um emissor DEVE dar semente nova" — duas fogueiras com a
        // mesma semente são a mesma fogueira. A menor que ninguém usa, contada
        // do arquivo de antes: refazer dá o mesmo número.
        for (const def of Object.values(copia)) {
          const d = def as unknown as Record<string, unknown> | null;
          if (d === null || d['type'] !== 'BONE_particle') continue;
          let semente = 0;
          while (sementes.has(semente)) semente++;
          sementes.add(semente);
          d['seed'] = semente;
        }
        tabela[novo] = copia;
      }
    }
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    if (this.beforeBones !== null) {
      const bones = file.bones ?? (file.bones = []);
      bones.length = 0;
      bones.push(...clone(this.beforeBones));
    }
    if (this.beforeSlots !== null) {
      const slots = file.slots ?? (file.slots = []);
      slots.length = 0;
      slots.push(...clone(this.beforeSlots));
    }
    if (this.beforeSkins !== null) {
      file.skins = clone(this.beforeSkins) as BoneFile['skins'];
    }
  }
}

/** As sementes que os emissores do arquivo já usam, em todas as skins (§9.9). */
function usedSeeds(file: BoneFile): Set<number> {
  const out = new Set<number>();
  for (const skin of file.skins ?? []) {
    for (const entradas of Object.values(skin.attachments ?? {})) {
      for (const def of Object.values(entradas ?? {})) {
        const d = def as unknown as Record<string, unknown> | null;
        if (d === null || d['type'] !== 'BONE_particle') continue;
        out.add(typeof d['seed'] === 'number' ? d['seed'] : 0);
      }
    }
  }
  return out;
}

/** O osso do arquivo, por nome. */
function original(bones: readonly BoneDef[], nome: string): BoneDef | undefined {
  return bones.find((bone) => bone.name === nome);
}

/** Sete casas: o bastante para o pixel, sem lixo de ponto flutuante. */
function round(value: number): number {
  const arredondado = Number(value.toFixed(7));
  return Object.is(arredondado, -0) ? 0 : arredondado;
}

/**
 * Duplica o que está escolhido, e conta o que aconteceu.
 *
 * A porta única: o botão da Árvore, o menu **Editar → Duplicar** e o `Ctrl+D`
 * passam por aqui.
 */
export function runDuplicate(doc: EditorDoc): boolean {
  const comando = new Duplicate(doc.file, doc.selection);
  if (!comando.hasWork) {
    doc.notice('Escolha um osso ou um desenho para duplicar');
    return false;
  }
  doc.run(comando);
  doc.select(comando.selectionAfter());

  const ossos = comando.newBones.size;
  const desenhos = comando.newSlots.size;
  const partes: string[] = [];
  if (ossos > 0) partes.push(`${ossos} ${ossos === 1 ? 'osso' : 'ossos'}`);
  if (desenhos > 0) partes.push(`${desenhos} ${desenhos === 1 ? 'desenho' : 'desenhos'}`);
  const regras = comando.targets.constraints.length;
  const semRegra = regras === 0
    ? ''
    : `. ${regras} ${regras === 1 ? 'regra ficou' : 'regras ficaram'} de fora: `
      + `${comando.targets.constraints.join(', ')}`;
  doc.notice(`${partes.join(' e ')} ${ossos + desenhos === 1 ? 'duplicado' : 'duplicados'}, `
    + `20 px à direita${semRegra}`);
  return true;
}

// ---------------------------------------------------------------------------
// Lote 42 — Escolher os filhos, Escolher os pais, e clonar arrastando
// ---------------------------------------------------------------------------

/** `name` e todos os descendentes, na ordem do arquivo. */
export function descendantsOf(file: BoneFile, name: string): string[] {
  return subtree(file, name);
}

/** `name` e a corrente de pais até a raiz, na ordem do arquivo. */
export function ancestorsOf(file: BoneFile, name: string): string[] {
  const bones = file.bones ?? [];
  const pais = new Map(bones.map((bone) => [bone.name, bone.parent]));
  const corrente = new Set<string>();
  let atual: string | undefined = name;
  while (atual !== undefined && pais.has(atual) && !corrente.has(atual)) {
    corrente.add(atual);
    atual = pais.get(atual);
  }
  return bones.filter((bone) => corrente.has(bone.name)).map((bone) => bone.name);
}

/**
 * **Editar → Escolher → Os filhos** (`]`): cada osso escolhido, todos os
 * descendentes, e os desenhos de todos eles. Um slot escolhido continua
 * escolhido — slot não tem filho.
 */
export function selectChildren(file: BoneFile, selection: Selection): Selection {
  const dentro = new Set<string>();
  for (const nome of selection.bones) for (const osso of subtree(file, nome)) dentro.add(osso);
  const escolhidos = new Set(selection.slots);
  return {
    ...emptySelection(),
    bones: (file.bones ?? []).filter((bone) => dentro.has(bone.name)).map((bone) => bone.name),
    slots: (file.slots ?? [])
      .filter((slot) => dentro.has(slot.bone) || escolhidos.has(slot.name))
      .map((slot) => slot.name),
  };
}

/**
 * **Editar → Escolher → Os pais** (`[`): cada osso escolhido e a corrente de
 * pais até a raiz. De um slot ou de um desenho, a corrente começa no osso dele.
 */
export function selectParents(file: BoneFile, selection: Selection): Selection {
  const slots = file.slots ?? [];
  const partida = [...selection.bones];
  for (const nome of [...selection.slots, ...selection.attachments.map((item) => item.slot)]) {
    const slot = slots.find((s) => s.name === nome);
    if (slot !== undefined) partida.push(slot.bone);
  }
  const corrente = new Set<string>();
  for (const nome of partida) for (const osso of ancestorsOf(file, nome)) corrente.add(osso);
  return {
    ...emptySelection(),
    bones: (file.bones ?? []).filter((bone) => corrente.has(bone.name)).map((bone) => bone.name),
  };
}

/**
 * Anda um anexo no espaço do osso dele: `x`/`y` de região e ponto, ou os
 * vértices de um contorno sem peso. Um vértice COM peso (§7.4) mede a partir
 * de vários ossos, e andar com ele é outra conta: ele fica onde está.
 */
function shiftAttachment(def: unknown, lx: number, ly: number): void {
  if (def === null || typeof def !== 'object') return;
  const anexo = def as {
    type?: string; x?: number; y?: number; vertices?: unknown; bones?: unknown; binding?: unknown;
  };
  const tipo = anexo.type ?? 'region';
  if (tipo === 'region' || tipo === 'point') {
    anexo.x = round((anexo.x ?? 0) + lx);
    anexo.y = round((anexo.y ?? 0) + ly);
    return;
  }
  const v = anexo.vertices;
  if (anexo.bones !== undefined || anexo.binding !== undefined || !Array.isArray(v)) return;
  if (!v.every((n) => typeof n === 'number')) return;
  anexo.vertices = (v as number[]).map((n, i) => round(n + (i % 2 === 0 ? lx : ly)));
}

/**
 * **Ctrl + arrastar** na ferramenta Mover — lote 42, o gesto do Spriter.
 *
 * É o Duplicar do lote 37, com o deslocamento do arrasto no lugar dos 20 px:
 * o membro vem inteiro, e o topo do bloco anda o vetor de mundo. O original
 * não se mexe. Um **desenho solto** — slot escolhido sem o osso dele — anda
 * também: o anexo copiado leva o mesmo vetor, levado ao espaço do osso.
 *
 * O `revert` é o do Duplicar: a foto de ossos, slots e peles de antes.
 */
export class CloneDrag extends Duplicate {
  override readonly label = 'Clonar arrastando';

  constructor(
    file: BoneFile,
    selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
    delta: { x: number; y: number },
  ) {
    super(file, selection, delta);
  }

  override apply(doc: EditorDoc): void {
    super.apply(doc);
    const file = doc.file;
    const soltos = [...this.newSlots.entries()].filter(([original]) => {
      const slot = (file.slots ?? []).find((s) => s.name === original);
      return slot !== undefined && !this.newBones.has(slot.bone);
    });
    if (soltos.length === 0 || (this.offset.x === 0 && this.offset.y === 0)) return;
    const mundo = setupWorldMatrices(file);
    if (mundo === null) return;
    for (const [, novo] of soltos) {
      const slot = (file.slots ?? []).find((s) => s.name === novo);
      const m = slot === undefined ? undefined : mundo.get(slot.bone);
      if (m === undefined) continue;
      const det = m.a * m.d - m.b * m.c;
      if (Math.abs(det) < 1e-12) continue;
      const lx = (m.d * this.offset.x - m.b * this.offset.y) / det;
      const ly = (m.a * this.offset.y - m.c * this.offset.x) / det;
      for (const skin of file.skins ?? []) {
        for (const def of Object.values(skin.attachments?.[novo] ?? {})) shiftAttachment(def, lx, ly);
      }
    }
  }
}
