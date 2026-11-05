/**
 * A Árvore: as linhas — lote A5d, plano arrumação (v11.1).
 *
 * Do `.bone` para as linhas que a Árvore desenha: a árvore única do lote 64
 * (o osso com os desenhos por baixo, depois os filhos), a busca que abre, a
 * dobra guardada por arquivo, o que o arrasto de uma linha faz e o que o
 * clique escolhe. Puro, sem DOM. Cortado de `tree-model.ts` pela seção
 * "Rows" sem mudar uma letra; o `tree-model.ts` continua exportando tudo.
 */

import type { AttachmentDef, BoneFile, SlotDef } from '../../../runtime/src/index.js';
import type { Selection } from '../contract.js';
import { emptySelection } from '../contract.js';
import { fold } from './palette-model.js';
import { bonesDepthFirst, canReparent, isDescendantBone, reparentVerdict, type ParentMap } from '../doc/bones.js';
import { isOwnBone, shownBone } from '../doc/own-bone.js';

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

export type TreeRowKind = 'bone' | 'slot' | 'skin' | 'attachment' | 'constraint'
  // Lote 1 do chat D, rodada final (28/09/2026): o grupo do fim da Árvore e
  // as duas linhas que moram nele.
  | 'group' | 'event' | 'parameter';

export interface TreeRow {
  kind: TreeRowKind;
  /** Unique in the whole tree, used as the DOM key. */
  id: string;
  /** Shown to the user. */
  name: string;
  /** Secondary text on the right, e.g. the kind of a constraint. */
  detail?: string;
  /** Indent level. */
  depth: number;
  /** Index in the file array this row came from, or -1. */
  index: number;
  /** Parent bone name, for bone rows. */
  parent?: string;
  /** Owning slot, for attachment rows. */
  slot?: string;
  /** Owning skin, for attachment rows. */
  skin?: string;
  /** Shown instead of `name` when set: the root row reads *raiz* (lote 60a). */
  label?: string;
  /** Tooltip of the row. */
  hint?: string;
  /**
   * Lote 64, a árvore única: o desenho que a linha do slot mostra, na pele em
   * edição (`slotDrawing`). A pele dele vai em `skin`.
   */
  attachment?: string;
  /** O slot não tem desenho nesta pele: a linha fica em cinza. */
  empty?: boolean;
  /** O `id` da linha do osso de cima; nada no nível 0. */
  owner?: string;
  /** O osso tem linhas por baixo, e ganha o triângulo de dobrar. */
  hasChildren?: boolean;
  /**
   * **A pele de quem este osso é** — degrau 9 (18/09/2026), I5.
   *
   * Preenchido só num osso (ou numa regra) `skinRequired`: é o nome da pele
   * que o liga, ou as peles separadas por vírgula quando mais de uma o lista.
   * A Árvore põe um sinal na linha, com o nome na dica — sem ele, o rabo do
   * lobisomem some da cena ao desligar a roupa e nada na tela dizia por quê
   * (regra 21).
   */
  skinOf?: string;
}

/**
 * Esta linha entra na busca da Árvore? — anotação 22, lote 33.
 *
 * Compara **sem acento e sem caixa**, no nome e no detalhe: quem procura a
 * "máscara" digitando "mascara" tem que achar, e quem procura pelo tipo da
 * regra também. Puro, e é o que o teste pina.
 */
export function matchesSearch(row: TreeRow, search: string): boolean {
  const alvo = fold(search.trim());
  if (alvo === '') return true;
  return fold(row.name).includes(alvo) || fold(row.detail ?? '').includes(alvo)
    || fold(row.label ?? '').includes(alvo);
}

const CONSTRAINT_LABELS: Record<string, string> = {
  ik: 'cinemática inversa',
  transform: 'transformação',
  path: 'caminho',
  physics: 'física',
  driver: 'comando',
};

/** Human name of a constraint type, in Portuguese. */
export function constraintTypeLabel(type: string): string {
  return CONSTRAINT_LABELS[type] ?? type;
}

/** Bones depth first, parents before children, with an indent level. */
export function boneRows(file: BoneFile, applied?: ParentMap): TreeRow[] {
  const bones = file.bones ?? [];
  // A ordem mora em `doc/bones.ts` desde o lote A4: a mesma do `sortBonesTopologically`.
  return bonesDepthFirst(bones, applied).map(({ index, depth }): TreeRow => {
    const bone = bones[index]!;
    const agora = applied?.has(bone.name) === true ? applied.get(bone.name) : bone.parent;
    // Lote 1 de 14/09: quem está debaixo de outro por causa de uma chave
    // `parent` (§9.4) diz isso na própria linha. Sem isso, a Árvore do quadro
    // 12 seria igual à do arquivo e estaria mentindo.
    const porChave = agora !== bone.parent;
    // Degrau 9 (I5): o osso que só existe com uma pele diz de qual.
    const daPele = bone.skinRequired === true ? skinsHolding(file, 'bones', bone.name) : '';
    return {
      kind: 'bone',
      id: `bone:${bone.name}`,
      name: bone.name,
      depth,
      index,
      ...(agora === undefined ? {} : { parent: agora }),
      ...(porChave ? { detail: 'por chave', hint: KEYED_PARENT_HINT } : {}),
      ...(daPele === '' ? {} : { skinOf: daPele }),
    };
  });
}

/**
 * As peles que ligam `name`, em uma linha — degrau 9 (I5).
 *
 * Escrito aqui, e não importado de `skins-model.ts`: a Árvore é lida por três
 * chats ao mesmo tempo, e três linhas de conta custam menos que uma porta nova
 * entre dois painéis. Vazio quando pele nenhuma o lista — o que é um arquivo
 * torto (`skinRequired` sem dono), e quem avisa disso é o validador.
 */
export function skinsHolding(
  file: BoneFile, kind: 'bones' | 'constraints', name: string,
): string {
  return (file.skins ?? [])
    .filter((skin) => (skin[kind] ?? []).includes(name))
    .map((skin) => skin.name)
    .join(', ');
}

/** A dica da linha de um osso que só existe com uma pele ligada. */
export function skinOnlyHint(skins: string): string {
  return skins === ''
    ? 'Este osso é marcado "só com a skin", e skin nenhuma o lista: ele nunca aparece'
    : `Só com a skin "${skins}": ele some da cena quando ela sai da pilha`;
}

/** A dica da linha de um osso que mudou de pai por chave. */
export const KEYED_PARENT_HINT = 'O pai deste quadro vem de uma chave. A base tem o pai do arquivo';

/**
 * A raiz fica escondida? — lote 60a, plano pasta do projeto.
 *
 * O Humberto, 10/09/2026, com duas imagens soltas: *"estão presas a um osso
 * maldito, eu não fiz esse osso"*. A raiz é o mundo, e desenho nela é desenho
 * **livre**. Então ela não aparece: nem na cena, nem na Árvore. Aparece só
 * quando ela mesma se mexe — um valor diferente do padrão (alguém a moveu por
 * arquivo) ou uma linha do tempo nela —, porque aí esconder seria esconder um
 * movimento.
 */
export function rootHidden(file: BoneFile): boolean {
  const root = file.bones?.[0];
  if (root === undefined) return false;
  const values = root as unknown as Record<string, unknown>;
  for (const key of ['x', 'y', 'rotation', 'shearX', 'shearY']) {
    if (values[key] !== undefined && values[key] !== 0) return false;
  }
  for (const key of ['scaleX', 'scaleY']) {
    if (values[key] !== undefined && values[key] !== 1) return false;
  }
  for (const animation of file.animations ?? []) {
    for (const timeline of animation.timelines ?? []) {
      if (timeline.type === 'bone' && timeline.target === root.name) return false;
    }
  }
  return true;
}

/** A dica da linha *raiz*, quando ela aparece. */
export const ROOT_HINT = 'O mundo: desenho aqui é livre. Ela aparece porque se mexe';

/**
 * Os ossos da Árvore — lote 60a. A raiz escondida sai, e quem estava
 * debaixo dela sobe um nível: os ossos de cima ficam no nível 0. A raiz que
 * aparece se chama *raiz*, com a dica *o mundo*. `boneRows` continua com
 * todos: a ordem do arquivo (`sortBonesTopologically`) depende dela.
 */
export function treeBoneRows(file: BoneFile, applied?: ParentMap): TreeRow[] {
  // Rodada 8d: o osso próprio de uma imagem não é osso para quem olha. A
  // imagem aparece no lugar de sempre, debaixo do osso visível.
  const rows = boneRows(file, applied).filter((row) => !isOwnBone(file, row.name));
  if (!rootHidden(file)) {
    return rows.map((row) => (row.index === 0 ? { ...row, label: 'raiz', hint: ROOT_HINT } : row));
  }
  const out: TreeRow[] = [];
  let underRoot = false;
  for (const row of rows) {
    if (row.index === 0) {
      underRoot = true;
      continue;
    }
    if (row.depth === 0) underRoot = false;
    out.push(underRoot ? { ...row, depth: row.depth - 1 } : row);
  }
  return out;
}

/** Slots in draw order — the order of the array is the order of drawing. */
export function slotRows(file: BoneFile): TreeRow[] {
  // Slot na raiz escondida é desenho solto: diz *livre*, e não o nome de um
  // osso que ninguém vê (lote 60a).
  const free = rootHidden(file) ? file.bones?.[0]?.name : undefined;
  return (file.slots ?? []).map((slot, index) => ({
    kind: 'slot' as const,
    id: `slot:${slot.name}`,
    name: slot.name,
    detail: shownBone(file, slot.bone) === free ? 'livre' : shownBone(file, slot.bone),
    depth: 0,
    index,
  }));
}

/**
 * Os **desenhos** do arquivo: um por anexo, com o slot e a pele ao lado.
 *
 * Até o lote 26 esta seção se chamava **Peles** e começava com uma linha por
 * pele, com os anexos aninhados sob ela. As peles saíram para a **aba Peles**
 * no lote 27 (anotação 12: *"não sei onde estão as skins"*), e os anexos
 * ficaram: eles são a única porta para escolher um desenho pelo nome, e sem
 * eles não haveria como chegar num anexo que não está na tela — o de uma pele
 * desligada, por exemplo.
 *
 * A pele entra no `detail` quando não é a `default`. Numa lista de vinte e
 * quatro desenhos, "mão" aparece uma vez por pele, e sem o nome da pele as
 * duas linhas seriam idênticas.
 */
export function attachmentRows(file: BoneFile): TreeRow[] {
  const rows: TreeRow[] = [];
  for (const skin of file.skins ?? []) {
    const attachments = skin.attachments ?? {};
    for (const slotName of Object.keys(attachments)) {
      for (const name of Object.keys(attachments[slotName] ?? {})) {
        if (attachments[slotName]![name] === null) continue;
        rows.push({
          kind: 'attachment',
          id: `attachment:${skin.name}:${slotName}:${name}`,
          name,
          detail: skin.name === 'default' ? slotName : `${slotName} · ${skin.name}`,
          depth: 0,
          index: -1,
          slot: slotName,
          skin: skin.name,
        });
      }
    }
  }
  return rows;
}

/** Constraints, with their kind as the secondary text. */
export function constraintRows(file: BoneFile): TreeRow[] {
  return (file.constraints ?? []).map((c, index) => ({
    kind: 'constraint' as const,
    id: `constraint:${c.name}`,
    name: c.name,
    detail: constraintTypeLabel(c.type),
    depth: 0,
    index,
  }));
}

// ---------------------------------------------------------------------------
// Lote 64 — uma árvore só, como a Hierarchy do Spriter
// ---------------------------------------------------------------------------

/**
 * O desenho que um slot mostra na pele em edição — lote 64.
 *
 * Nesta ordem: o desenho do slot (`slot.attachment`) nesta pele; o primeiro
 * desenho do slot nesta pele; o desenho do slot na `default`, que é para onde
 * o leitor cai (§4.4). Nada disso: `null`, e a linha fica cinza.
 *
 * O segundo passo é o que faz trocar a pele trocar a miniatura: a mão aberta na
 * `default` e a fechada na `armadura` são nomes diferentes no mesmo slot.
 */
export function slotDrawing(
  file: BoneFile, slot: SlotDef, skin: string,
): { attachment: string; skin: string } | null {
  type Mapa = Record<string, AttachmentDef | null | undefined>;
  const of = (name: string): Mapa | undefined =>
    (file.skins ?? []).find((entry) => entry.name === name)?.attachments?.[slot.name] as Mapa | undefined;
  const has = (map: Mapa | undefined, name: string): boolean =>
    map !== undefined && map[name] !== undefined && map[name] !== null;
  const own = of(skin);
  const wanted = slot.attachment ?? undefined;
  if (wanted !== undefined && has(own, wanted)) return { attachment: wanted, skin };
  const first = own === undefined ? undefined : Object.keys(own).find((name) => has(own, name));
  if (first !== undefined) return { attachment: first, skin };
  if (skin !== 'default' && wanted !== undefined && has(of('default'), wanted)) {
    return { attachment: wanted, skin: 'default' };
  }
  return null;
}

/** A linha de um slot na árvore única: o nome do slot e o desenho dele. */
function slotLine(file: BoneFile, slot: SlotDef, index: number, depth: number, skin: string): TreeRow {
  const row: TreeRow = { kind: 'slot', id: `slot:${slot.name}`, name: slot.name, depth, index };
  // Rodada 12 (S4): o desenho que a pele em edição ESCONDE (um `null`, §4.4)
  // fica na Árvore, em cinza e escolhível — é por ela que se chega nele para
  // Ignorar, já que na cena ele não está mais.
  const placeholder = slot.attachment ?? undefined;
  const daPele = (file.skins ?? []).find((entry) => entry.name === skin)?.attachments?.[slot.name];
  if (skin !== 'default' && placeholder !== undefined && daPele?.[placeholder] === null) {
    row.empty = true;
    row.attachment = placeholder;
    row.skin = skin;
    row.detail = 'escondida';
    row.hint = `${slot.name}: escondida na skin "${skin}". Skins → Ignorar esta imagem a devolve`;
    return row;
  }
  const drawing = slotDrawing(file, slot, skin);
  if (drawing === null) {
    row.empty = true;
    row.hint = `${slot.name}: sem desenho na skin ${skin}`;
    return row;
  }
  row.attachment = drawing.attachment;
  row.skin = drawing.skin;
  if (drawing.attachment !== slot.name) row.detail = drawing.attachment;
  return row;
}

/**
 * A Árvore — lote 64, plano árvore. O Humberto, 10/09/2026: *"são três listas
 * que não dizem nada: que osso manda em qual peça?"*. Eram três seções (Ossos,
 * Slots, Desenhos), e o desenho estava numa lista e o osso dele noutra.
 *
 * Agora é uma árvore só, como a Hierarchy do Spriter: cada osso tem por baixo,
 * **primeiro os desenhos dele**, depois os ossos filhos, cada um com os seus.
 * Uma linha por slot, com o desenho da pele em edição. Desenho solto (na raiz
 * escondida, lote 60a) fica no nível 0, depois dos ossos.
 *
 * A ordem de desenho mora na aba Ordem; as regras, na aba Regras; as peles, na
 * aba Peles. Nada disso aparece aqui, e as contagens (`Ossos 18`) saíram.
 */
export function hierarchyRows(
  file: BoneFile, skin = 'default', applied?: ParentMap,
  /**
   * Rodada 12 (S8, S9): os ossos que a pilha de peles tira (`bonesGone`, em
   * `doc/skin-bones.ts`). Saem da Árvore com os desenhos pendurados neles,
   * como as caixas *Hide skin bones* do Spine (pág. 115).
   */
  gone: ReadonlySet<string> = new Set(),
  /**
   * Rodada 50, lote 4 (doc `101`): o osso de cada desenho NO QUADRO — a chave
   * `slot/bone` (§9.5). Sem ele vale o osso do arquivo, que é o caso da base.
   */
  slotBones?: ReadonlyMap<string, string>,
): TreeRow[] {
  // Quem some leva os filhos junto (`bonesGone`): o nível dos que ficam não muda.
  const bones = treeBoneRows(file, applied).filter((row) => !gone.has(row.name));
  const shown = new Set(bones.map((row) => row.name));
  const onBone = new Map<string, Array<{ slot: SlotDef; index: number }>>();
  const loose: Array<{ slot: SlotDef; index: number }> = [];
  (file.slots ?? []).forEach((slot, index) => {
    if (gone.has(slot.bone)) return;
    // A imagem com osso próprio mora debaixo do osso que se vê (8d) — o DO
    // QUADRO, com uma animação aberta (rodada 50, lote 4): o osso do desenho
    // pode ter trocado por uma chave `slot/bone`, e o pai do osso, por uma `parent`.
    const on = shownBone(file, slotBones?.get(slot.name) ?? slot.bone, applied);
    if (!shown.has(on)) {
      loose.push({ slot, index });
      return;
    }
    const list = onBone.get(on);
    if (list) list.push({ slot, index });
    else onBone.set(on, [{ slot, index }]);
  });

  const rows: TreeRow[] = [];
  for (const bone of bones) {
    rows.push({ ...bone });
    // Logo abaixo do osso, antes do primeiro filho: a ordem depth-first de
    // `treeBoneRows` põe o filho na linha seguinte.
    for (const { slot, index } of onBone.get(bone.name) ?? []) {
      rows.push(slotLine(file, slot, index, bone.depth + 1, skin));
    }
  }
  for (const { slot, index } of loose) rows.push(slotLine(file, slot, index, 0, skin));

  // Quem mora debaixo de quem, e quem tem gente embaixo.
  const stack: TreeRow[] = [];
  for (const row of rows) {
    while (stack.length > 0 && stack[stack.length - 1]!.depth >= row.depth) stack.pop();
    const owner = stack[stack.length - 1];
    if (owner !== undefined) {
      row.owner = owner.id;
      owner.hasChildren = true;
    }
    if (row.kind === 'bone') stack.push(row);
  }
  return rows;
}

/**
 * A busca na árvore única — lote 64. Fica o acerto e o caminho de ossos até
 * ele; o resto some. É assim que a árvore "abre até cada acerto". Busca vazia
 * devolve tudo.
 */
export function searchHierarchy(
  rows: readonly TreeRow[], search: string,
  /**
   * Rodada 43, lote 4 (doc 62, a): linhas que ficam à vista mesmo sem casar —
   * a peça que acabou de ser renomeada. A busca fica como o usuário digitou, e
   * a peça e os outros achados continuam na lista.
   */
  also?: ReadonlySet<string>,
): TreeRow[] {
  if (search.trim() === '') return rows.slice();
  const byId = new Map(rows.map((row) => [row.id, row]));
  const keep = new Set<string>();
  for (const row of rows) {
    if (!matchesSearch(row, search) && also?.has(row.id) !== true) continue;
    let at: TreeRow | undefined = row;
    while (at !== undefined && !keep.has(at.id)) {
      keep.add(at.id);
      at = at.owner === undefined ? undefined : byId.get(at.owner);
    }
  }
  return rows.filter((row) => keep.has(row.id));
}

/**
 * Dobrar — lote 64: some tudo o que mora debaixo de um osso dobrado. Desde o
 * lote 1 do chat D (28/09), o grupo "Eventos e parâmetros" dobra do mesmo jeito.
 */
export function unfoldedRows(rows: readonly TreeRow[], closed: ReadonlySet<string>): TreeRow[] {
  const out: TreeRow[] = [];
  let hideBelow = Number.POSITIVE_INFINITY;
  for (const row of rows) {
    if (row.depth > hideBelow) continue;
    hideBelow = Number.POSITIVE_INFINITY;
    out.push(row);
    if (foldable(row) && closed.has(row.id)) hideBelow = row.depth;
  }
  return out;
}

/** A linha tem o triângulo de dobrar: osso com gente embaixo, ou o grupo do fim. */
export function foldable(row: TreeRow): boolean {
  return (row.kind === 'bone' || row.kind === 'group') && row.hasChildren === true;
}

// ---------------------------------------------------------------------------
// Lote 1 do chat D, rodada final (28/09/2026) — Evento e Parâmetro na Árvore
// ---------------------------------------------------------------------------

/** O `id` do grupo do fim da Árvore. */
export const EVENTS_GROUP_ID = 'grupo:eventos-e-parametros';

/** O nome do grupo, como a Árvore o escreve. */
export const EVENTS_GROUP_LABEL = 'Eventos e parâmetros';

/**
 * **Evento e Parâmetro ganham linha na Árvore** — auditoria de 27/09, bloco 1:
 * *"nascem pelo Novo ▾ da Árvore, mas não viram linha nenhuma"*. O Humberto
 * criava e não achava.
 *
 * O modelo é o nó `Events` do Spine (`spine-tree`, `spine-events`): um grupo
 * próprio, **fora** da hierarquia dos ossos, porque o evento não é de osso
 * nenhum — é do esqueleto. Fica no **fim**, para o que se olha o dia inteiro
 * (ossos e desenhos) continuar em cima, igual. O parâmetro vai junto: é o
 * mesmo caso, um número do esqueleto sem osso. A referência inteira está em
 * `documentos/pesquisa/nova pesquisa/REFERENCIA arvore malha e linha do tempo 2026-09-28.md`.
 *
 * Arquivo sem evento e sem parâmetro: nada, nem o grupo — um título sem nada
 * embaixo é uma linha a mais para ler e nada a achar.
 */
export function eventParameterRows(file: BoneFile): TreeRow[] {
  const events = file.events ?? [];
  const parameters = file.parameters ?? [];
  if (events.length + parameters.length === 0) return [];
  const rows: TreeRow[] = [{
    kind: 'group',
    id: EVENTS_GROUP_ID,
    name: EVENTS_GROUP_LABEL,
    depth: 0,
    index: -1,
    hasChildren: true,
    hint: 'Os eventos e os parâmetros do boneco: não são de osso nenhum. Crie mais pelo Novo ▾',
  }];
  events.forEach((event, index) => {
    const som = typeof event.audio === 'string' && event.audio !== '';
    rows.push({
      kind: 'event',
      id: `event:${event.name}`,
      name: event.name,
      detail: som ? 'evento com som' : 'evento',
      depth: 1,
      index,
      owner: EVENTS_GROUP_ID,
      hint: `Evento ${event.name}: a chave dele dispara na linha do tempo. A ficha abre em Propriedades`,
    });
  });
  parameters.forEach((parameter, index) => {
    rows.push({
      kind: 'parameter',
      id: `parameter:${parameter.name}`,
      name: parameter.name,
      detail: 'parâmetro',
      depth: 1,
      index,
      owner: EVENTS_GROUP_ID,
      hint: `Parâmetro ${parameter.name}, de ${fmt(parameter.min ?? -1)} a ${fmt(parameter.max ?? 1)}. A ficha abre em Propriedades; as regras que o leem estão na aba Regras`,
    });
  });
  return rows;
}

/**
 * A linha de evento ou de parâmetro que **acabou de nascer**, entre dois
 * desenhos da Árvore — lote 1 do chat D, a régua do arroz ("criei e sumiu").
 *
 * Só quando é UMA: abrir um arquivo faz tudo "nascer" de uma vez, e aí não há
 * uma linha para mostrar. `before` nulo é o primeiro desenho: nada nasceu.
 */
export function newKeyItemRow(before: ReadonlySet<string> | null, rows: readonly TreeRow[]): TreeRow | null {
  if (before === null) return null;
  const novas = rows.filter((row) => (row.kind === 'event' || row.kind === 'parameter') && !before.has(row.id));
  return novas.length === 1 ? novas[0]! : null;
}

/**
 * A escolha em texto, para comparar duas — B2, F7. Os vértices ficam de fora:
 * escolher vértice na Malha não é escolher outra linha da Árvore.
 */
export function selectionKey(selection: Selection): string {
  return JSON.stringify([
    selection.bones, selection.slots, selection.attachments, selection.constraints,
    selection.parameters ?? [], selection.variables ?? [],
  ]);
}

/**
 * O rodapé do olho — I-O1 (chat I, 29/09): esconder calava, e o rodapé ficava
 * com a frase velha. **Escondido é diferente de travado**, e a frase diz isso.
 */
/**
 * O rodapé do cadeado — QA da noite de 04/11/2026. Travar dizia só "Arquivo
 * não salvo.", e o olho ao lado sempre disse o que fez. **Travado é diferente
 * de escondido**: aparece, e o clique passa.
 */
export function lockNotice(kind: 'bone' | 'slot', name: string, locked: boolean): string {
  const o = kind === 'bone' ? 'O osso' : 'O desenho';
  return locked
    ? `${o} "${name}" está travado: aparece, mas o clique passa por ele. O cadeado de novo destrava`
    : `${o} "${name}" está destravado: o clique pega de novo`;
}

export function eyeNotice(kind: 'bone' | 'slot', name: string, hidden: boolean): string {
  const o = kind === 'bone' ? 'O osso' : 'O desenho';
  return hidden
    ? `${o} "${name}" está escondido: não aparece e não pega clique. O olho de novo mostra`
    : `${o} "${name}" está à vista de novo`;
}

/** Um número do jeito que se lê em português. */
function fmt(value: number): string {
  return String(value).replace('.', ',');
}

/** O começo da chave da dobra no `localStorage`. */
export const FOLD_STORAGE_PREFIX = 'recorte.arvore.dobrados:';

/**
 * Onde a dobra da Árvore mora — lote 64: no navegador, por arquivo. Não vai
 * para o `.bone`: é de quem olha, não do personagem.
 */
export function foldKey(path: string | null, file: BoneFile): string {
  return FOLD_STORAGE_PREFIX + (path ?? file.skeleton?.name ?? 'sem nome');
}

/** Lê a dobra guardada. Texto estragado dá dobra nenhuma, sem erro. */
export function parseFolded(text: string | null): Set<string> {
  try {
    const value: unknown = JSON.parse(text ?? '[]');
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

/**
 * Soltar no vazio do fim da Árvore — lote 64: vira **solto**, pendurado na
 * raiz, sem mover. Quem já está na raiz não tem para onde ir.
 */
export function rootDropAction(file: BoneFile, source: TreeRow, applied?: ParentMap): TreeDrop | null {
  const root = file.bones?.[0]?.name;
  if (root === undefined) return null;
  if (source.kind === 'bone') {
    const bone = (file.bones ?? []).find((entry) => entry.name === source.name);
    const pai = applied?.has(source.name) === true ? applied.get(source.name) : bone?.parent;
    if (bone === undefined || pai === root || !canReparent(file, source.name, root, applied)) return null;
    return { kind: 'reparent', selection: { ...emptySelection(), bones: [source.name] }, parent: root };
  }
  const name = source.kind === 'slot' ? source.name : source.kind === 'attachment' ? source.slot : undefined;
  const slot = (file.slots ?? []).find((entry) => entry.name === name);
  if (slot === undefined || slot.bone === root) return null;
  return { kind: 'reparent', selection: { ...emptySelection(), slots: [slot.name] }, parent: root };
}

/**
 * O arrasto da árvore única — lote 64. Em cima de um osso: vira filho dele
 * (`treeDropAction`, lote 63a). No vazio (`null`): solto. Em cima de um
 * desenho: nada — a ordem de desenho mora na aba Ordem.
 */
export function hierarchyDropAction(
  file: BoneFile, source: TreeRow, target: TreeRow | null, applied?: ParentMap,
): TreeDrop | null {
  if (target === null) return rootDropAction(file, source, applied);
  if (target.kind !== 'bone') return null;
  return treeDropAction(file, source, target, applied);
}

/**
 * Selection that a click on a row produces.
 *
 * `keep` é a seleção de agora — lote 69. Com a ferramenta **Malha (M)** ou
 * **Pesos (G)** na mão, clicar num osso na Árvore trocava a seleção inteira: o
 * desenho caía fora, a aba Malha e pesos voltava para *"escolha um desenho"* e
 * a cena parava de desenhar a malha. Era o buraco 2 do plano — no Spine e no
 * DragonBones a malha **não sai** da seleção quando se escolhe o osso a pintar.
 * Com `keep`, o osso entra e os desenhos ficam onde estavam. Sem `keep`, tudo
 * como antes: o clique escolhe só a linha.
 */
export function selectionForRow(row: TreeRow, keep?: Selection): Selection {
  const selection = emptySelection();
  if (row.kind === 'bone') {
    selection.bones = [row.name];
    if (keep !== undefined) {
      selection.slots = keep.slots.slice();
      selection.attachments = keep.attachments.map((item) => ({ ...item }));
    }
  }
  else if (row.kind === 'slot') {
    // Lote 64: a linha do slot mostra um desenho, e o clique escolhe os dois.
    selection.slots = [row.name];
    if (row.attachment !== undefined) selection.attachments = [{ slot: row.name, attachment: row.attachment }];
  }
  else if (row.kind === 'constraint') selection.constraints = [row.name];
  // Lote 1 do chat D: o parâmetro tem seleção própria (`parameters`), e é ela
  // que abre a ficha em Propriedades. O evento não tem: quem o escolhe é o
  // `chooseEvent` do editor de evento, chamado pela Árvore — aqui a seleção
  // fica vazia, e Propriedades abre na ficha do evento escolhido.
  else if (row.kind === 'parameter') selection.parameters = [row.name];
  else if (row.kind === 'attachment' && row.slot !== undefined) {
    selection.attachments = [{ slot: row.slot, attachment: row.name }];
  }
  return selection;
}

// `isDescendantBone` e `canReparent` moram em `doc/bones.ts` desde o lote A4.

/** O que soltar uma linha da Árvore em cima de outra faz. */
export type TreeDrop =
  | { kind: 'reparent'; selection: Selection; parent: string }
  | { kind: 'order'; from: number; to: number };

/**
 * O arrasto da Árvore — lote 63a. O Humberto: *"a Árvore está bugada, não dá
 * para mudar o parentesco por lá"*. Só osso sobre osso trocava o pai: um slot
 * sobre um osso era recusado (os dois tipos tinham de ser iguais), e a linha
 * de um desenho nem arrastava.
 *
 * - osso sobre osso: vira filho, se pode (`reparentVerdict`); soltar um osso
 *   em cima de um descendente dele **troca os dois de lugar** (item 3.2), em
 *   vez de o arrasto ser recusado sem explicação;
 * - slot ou desenho sobre osso: o slot vira filho do osso, sem mover;
 * - slot sobre slot: muda a ordem de desenho, como sempre.
 *
 * Puro: quem roda é a Árvore, pela porta única do lote 34 (`runReparent`).
 */
export function treeDropAction(
  file: BoneFile, source: TreeRow, target: TreeRow, applied?: ParentMap,
): TreeDrop | null {
  if (source.id === target.id) return null;
  if (target.kind === 'bone') {
    if (source.kind === 'bone') {
      // `!== 'no'` e não `canReparent`: o `swap` também é um arrasto que vale.
      // Quem decide entre virar filho e trocar de lugar é a porta única
      // (`runReparent`), para o arrasto da Árvore e a tecla P darem no mesmo.
      return reparentVerdict(file, source.name, target.name) !== 'no'
        ? { kind: 'reparent', selection: { ...emptySelection(), bones: [source.name] }, parent: target.name }
        : null;
    }
    const slot = source.kind === 'slot' ? source.name : source.kind === 'attachment' ? source.slot : undefined;
    if (slot === undefined) return null;
    const current = (file.slots ?? []).find((entry) => entry.name === slot)?.bone;
    if (current === undefined || current === target.name) return null;
    return { kind: 'reparent', selection: { ...emptySelection(), slots: [slot] }, parent: target.name };
  }
  if (source.kind === 'slot' && target.kind === 'slot') {
    return { kind: 'order', from: source.index, to: target.index };
  }
  return null;
}

// ---------------------------------------------------------------------------
// A Árvore escolhe e anda — rodada 43, lote 3 (doc `51`, §2.1)
// ---------------------------------------------------------------------------

/** As linhas que se escolhem com o clique (o grupo do fim e o evento, não). */
function pickable(row: TreeRow): boolean {
  return row.kind === 'bone' || row.kind === 'slot' || row.kind === 'constraint'
    || row.kind === 'parameter' || row.kind === 'attachment';
}

/** A linha já está nesta escolha? A do slot acende também pelo desenho dele. */
export function rowIsChosen(selection: Selection, row: TreeRow): boolean {
  if (row.kind === 'bone') return selection.bones.includes(row.name);
  if (row.kind === 'slot') return selection.slots.includes(row.name) || selection.attachments.some((a) => a.slot === row.name);
  if (row.kind === 'constraint') return selection.constraints.includes(row.name);
  if (row.kind === 'parameter') return (selection.parameters ?? []).includes(row.name);
  if (row.kind === 'attachment') return selection.attachments.some((a) => a.slot === row.slot && a.attachment === row.name);
  return false;
}

/** Junta duas escolhas, sem repetir ninguém. */
function joinSelections(a: Selection, b: Selection): Selection {
  const uniq = <T>(xs: readonly T[], key: (x: T) => string): T[] => {
    const seen = new Set<string>();
    return xs.filter((x) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; });
  };
  return {
    ...emptySelection(),
    bones: uniq([...a.bones, ...b.bones], (x) => x),
    slots: uniq([...a.slots, ...b.slots], (x) => x),
    attachments: uniq([...a.attachments, ...b.attachments], (x) => `${x.slot}/${x.attachment}`),
    constraints: uniq([...a.constraints, ...b.constraints], (x) => x),
    parameters: uniq([...(a.parameters ?? []), ...(b.parameters ?? [])], (x) => x),
  };
}

/**
 * **Ctrl+clique** — rodada 43, lote 3. Soma a linha à escolha; se ela já
 * estava, tira. Os quatro programas fazem assim (Spine p.33, Photoshop, o
 * Spriter na cena); a Árvore trocava a escolha a cada clique (doc `51`, `12`).
 */
export function toggleRowInSelection(selection: Selection, row: TreeRow): Selection {
  if (!pickable(row)) return selection;
  if (!rowIsChosen(selection, row)) return joinSelections(selection, selectionForRow(row));
  const out: Selection = {
    ...selection,
    bones: selection.bones.slice(), slots: selection.slots.slice(),
    attachments: selection.attachments.slice(), constraints: selection.constraints.slice(),
    parameters: (selection.parameters ?? []).slice(),
  };
  if (row.kind === 'bone') out.bones = out.bones.filter((b) => b !== row.name);
  if (row.kind === 'slot') {
    out.slots = out.slots.filter((s) => s !== row.name);
    out.attachments = out.attachments.filter((a) => a.slot !== row.name);
  }
  if (row.kind === 'constraint') out.constraints = out.constraints.filter((c) => c !== row.name);
  if (row.kind === 'parameter') out.parameters = (out.parameters ?? []).filter((p) => p !== row.name);
  if (row.kind === 'attachment') out.attachments = out.attachments.filter((a) => !(a.slot === row.slot && a.attachment === row.name));
  return out;
}

/**
 * **Shift+clique** — rodada 43, lote 3: a faixa entre a âncora (a última linha
 * clicada) e esta, na ordem em que a tela mostra. Sem âncora à vista, só a linha.
 */
export function rangeSelection(visible: readonly TreeRow[], anchorId: string | null, rowId: string): Selection {
  const fim = visible.findIndex((r) => r.id === rowId);
  if (fim < 0) return emptySelection();
  const inicio = anchorId === null ? -1 : visible.findIndex((r) => r.id === anchorId);
  const [de, ate] = inicio < 0 ? [fim, fim] : inicio <= fim ? [inicio, fim] : [fim, inicio];
  let out = emptySelection();
  for (let i = de; i <= ate; i++) {
    const row = visible[i]!;
    if (pickable(row)) out = joinSelections(out, selectionForRow(row));
  }
  return out;
}

/**
 * **↑ e ↓ na Árvore** — rodada 43, lote 3: a linha escolhível de cima ou de
 * baixo, entre as que se veem (o ramo dobrado é pulado). `null` na borda.
 */
export function stepRow(visible: readonly TreeRow[], currentId: string | null, direction: 1 | -1): TreeRow | null {
  const atual = currentId === null ? -1 : visible.findIndex((r) => r.id === currentId);
  if (atual < 0) return visible.find(pickable) ?? null;
  for (let i = atual + direction; i >= 0 && i < visible.length; i += direction) {
    if (pickable(visible[i]!)) return visible[i]!;
  }
  return null;
}

/**
 * **Alt+clique no triângulo** — rodada 43, lote 3 (o Photoshop; o botão
 * direito do Spine): as linhas que dobram no ramo inteiro, a de cima junto.
 */
export function branchFoldIds(rows: readonly TreeRow[], rowId: string): string[] {
  const inicio = rows.findIndex((r) => r.id === rowId);
  if (inicio < 0) return [];
  const topo = rows[inicio]!;
  const out: string[] = foldable(topo) ? [topo.id] : [];
  for (let i = inicio + 1; i < rows.length && rows[i]!.depth > topo.depth; i++) {
    if (foldable(rows[i]!)) out.push(rows[i]!.id);
  }
  return out;
}

/**
 * O rodapé do renomear — rodada 43, lote 3 (regra 21). Dizia só "Renomear."; o
 * nome repetido virava `arm2` calado (doc `51`, `06`).
 */
export function renameSays(from: string, wanted: string, to: string): string {
  return to === wanted.trim() ? `${from} agora se chama ${to}` : `Já existe "${wanted.trim()}": ${from} ficou ${to}`;
}

/** O nome vazio não vale, e diz — rodada 43, lote 3. */
export function emptyNameSays(from: string): string {
  return `O nome não pode ficar vazio: ${from} continua ${from}`;
}

// `searchAfterRename` (lote 3) saiu no lote 4 (doc 62, a): reescrever o texto da
// busca com o nome novo sumia com os outros achados. A peça renomeada agora
// fica à vista pelo `also` de `searchHierarchy`, e a busca não muda.

// ---------------------------------------------------------------------------
// Apagar diz o quê — rodada 43, lote 4 (doc `51`, §2.1; recado da rodada 41)
// ---------------------------------------------------------------------------

/** O que um Delete leva: ossos (os que se veem), desenhos e regras. */
export interface DeletePlan {
  bones: string[];
  slots: string[];
  constraints: string[];
}

/**
 * **O que o Delete vai levar**, antes de apagar — rodada 43, lote 4. A mesma
 * conta do `DeleteItems`: o osso leva os de baixo, os desenhos deles e as
 * regras que os usam. O osso próprio de uma imagem não conta: ninguém o vê.
 */
export function deletePlan(file: BoneFile, selection: Selection): DeletePlan {
  const bones = file.bones ?? [];
  const raiz = bones[0]?.name;
  const vaiOsso = new Set<string>();
  for (const name of selection.bones) {
    if (name === raiz) continue;
    for (const bone of bones) if (isDescendantBone(file, bone.name, name)) vaiOsso.add(bone.name);
  }
  const vaiSlot = new Set(selection.slots);
  for (const slot of file.slots ?? []) if (vaiOsso.has(slot.bone)) vaiSlot.add(slot.name);
  const vaiRegra = new Set(selection.constraints);
  for (const c of (file.constraints ?? []) as unknown as Array<Record<string, unknown>>) {
    const usa = [...(Array.isArray(c['bones']) ? c['bones'] as unknown[] : []), c['bone'], c['target']]
      .some((b) => typeof b === 'string' && vaiOsso.has(b));
    if (usa && typeof c['name'] === 'string') vaiRegra.add(c['name']);
  }
  return {
    bones: bones.filter((b) => vaiOsso.has(b.name) && !isOwnBone(file, b.name)).map((b) => b.name),
    slots: (file.slots ?? []).filter((s) => vaiSlot.has(s.name)).map((s) => s.name),
    constraints: [...vaiRegra],
  };
}

/** Leva mais do que o escolhido (um osso com gente embaixo)? Então pergunta (S1). */
export function deleteNeedsAsking(selection: Selection, plan: DeletePlan): boolean {
  return plan.bones.length > selection.bones.length || plan.slots.length > selection.slots.length;
}

/** "2 ossos, 6 desenhos e 1 regra" — o que vai junto, por extenso. */
export function deleteCount(plan: DeletePlan, attachments = 0): string {
  const partes: string[] = [];
  const n = (k: number, um: string, varios: string): string => `${k} ${k === 1 ? um : varios}`;
  if (plan.bones.length > 0) partes.push(n(plan.bones.length, 'osso', 'ossos'));
  if (plan.slots.length > 0) partes.push(n(plan.slots.length, 'desenho', 'desenhos'));
  if (plan.slots.length === 0 && attachments > 0) partes.push(n(attachments, 'imagem', 'imagens'));
  if (plan.constraints.length > 0) partes.push(n(plan.constraints.length, 'regra', 'regras'));
  if (partes.length <= 1) return partes[0] ?? 'nada';
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`;
}

/** Quem foi escolhido para apagar, em poucas palavras: "arm", "arm, leg", "arm, leg e mais 3". */
export function deleteWho(selection: Selection): string {
  const nomes = [...new Set([...selection.bones, ...selection.slots, ...selection.attachments.map((a) => a.slot), ...selection.constraints])];
  if (nomes.length <= 3) return nomes.join(', ');
  return `${nomes.slice(0, 2).join(', ')} e mais ${nomes.length - 2}`;
}

/**
 * **O rodapé do Delete** — rodada 43, lote 4. Dizia só "Apagar." (recado da
 * rodada 41), ou falava das chaves guardadas e não do que sumiu (doc `51`, `15`).
 */
export function deleteSays(selection: Selection, plan: DeletePlan): string {
  return `Apaguei ${deleteWho(selection)}: ${deleteCount(plan, selection.attachments.length)}. Ctrl+Z volta`;
}

// `sortBonesTopologically` mora em `doc/bones.ts` desde o lote A4.

/** Quanto cada nível anda para a direita: os dois primeiros 16 px, os fundos menos. */
const INDENT_STEPS: readonly number[] = [16, 16, 12, 10, 8];
const INDENT_MIN_STEP = 6;

/**
 * **O recuo da linha** — QA da noite de 04/11/2026. Era `6 + 16 × nível`: no
 * herói do PSD, na profundidade 5, o nome começava em 154 px de uma linha de
 * 191, e "weapon" cortava. Os dois primeiros níveis ficam iguais (a árvore
 * rasa não muda); do terceiro em diante cada nível anda menos, nunca menos
 * de 6 px, para o pai e o filho continuarem em colunas diferentes.
 */
export function treeIndent(depth: number): number {
  let px = 6;
  for (let d = 0; d < depth; d++) px += INDENT_STEPS[d] ?? INDENT_MIN_STEP;
  return px;
}

/**
 * **Quando o redesenho rola a lista** — QA da noite de 04/11/2026. Em
 * 1920×1080, duplo clique em "osso_16" renomeou o "leg_front": o primeiro
 * clique escolhia a linha, o redesenho rolava 14 px para mostrá-la inteira,
 * e o segundo clique caía na vizinha. A escolha que o próprio clique fez
 * (`clicada`) não rola: quem clicou está apontando para a linha. A que veio
 * de fora, ou da seta, rola como sempre — pela escolha que mudou, e pelo foco.
 */
export function treeReveal(
  agora: string, clicada: string | null, mudou: boolean,
): { escolha: boolean; foco: boolean } {
  const doClique = clicada !== null && agora === clicada;
  return { escolha: mudou && !doClique, foco: !doClique };
}
