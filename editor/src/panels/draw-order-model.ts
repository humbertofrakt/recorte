/**
 * A conta da aba **Ordem** (dono C) — lote 25, rodada 3.
 *
 * Sem DOM. Aqui mora tudo o que a aba precisa DECIDIR: quem entra na lista, em
 * que ordem ela é lida, como as pastas se formam, e o que cada gesto de mover
 * faz com o array `slots`. A tela é do `draw-order.ts`.
 *
 * Três decisões do Humberto, de 09/09/2026, usando o programa:
 *
 * | # | Nas palavras dele |
 * |:---:|:---|
 * | 8 | *"Ordem é de cima pra baixo, e você ainda colocou um texto kkkk. Muda isso."* |
 * | 9 | *"O que é isso?"*, apontando `hitbox`, `hand_point` e `cape_path` com miniatura vazia |
 * | 11 | *"Deixar criar pastas para guardar imagens na Ordem"* |
 *
 * **A ordem de desenho continua sendo o array `slots`** (§4.3): o primeiro do
 * array é desenhado primeiro e fica atrás. O que mudou é só a leitura — a
 * lista mostra o array **de trás para a frente**, e assim o de cima da tela é o
 * que está na frente do desenho, como no Spriter, no Spine e em todo programa
 * de camadas. A frase que explicava o contrário saiu; a explicação certa é não
 * precisar de frase.
 *
 * `folder` **já existe no formato** (§4.3, informativo): o importador de PSD
 * grava nele o grupo do Photoshop, e `npm run fatiar` corta por ele. Nenhum
 * campo novo — o que faltava era a tela.
 */

import type { BoneFile, SlotDef } from '../../../runtime/src/index.js';
import { orderFromOffsets } from '../../../runtime/src/draw-order.js';
import type { ChangeKind, Command, EditorDoc, Selection } from '../contract.js';
import { corpoDe, emptySelection } from '../contract.js';
import { findAttachment } from './properties-model.js';
import { slotRows } from './tree-model.js';
import {
  TIME_EPSILON, drawOrderTarget, findAnimation, findTimeline, revealKey, roundTime, setKey,
} from '../anim/keying.js';
import { EditKeys } from '../anim/pose-mode.js';
// A pilha de peles (§4.4) mora na vista da cena, e é conta pura: a Ordem a lê,
// não a escreve.
import { skinStackOf } from '../viewport/onion.js';

// ---------------------------------------------------------------------------
// Quem é desenho, e quem não é — anotação 9
// ---------------------------------------------------------------------------

/**
 * Os cinco tipos de anexo que **desenham** alguma coisa (§7, e o emissor da
 * extensão de partículas).
 *
 * Ficam de fora `boundingbox`, `point`, `path` e `clipping`: eles têm posição,
 * têm osso e têm nome, mas não têm imagem. Numa lista de ordem de desenho eles
 * apareciam como uma miniatura vazia, e foi exatamente isso que o Humberto
 * apontou: *"o que é isso?"*. Eles continuam na **Árvore**, onde cada um tem a
 * sua seção.
 */
export const DRAWING_TYPES: ReadonlySet<string> = new Set([
  'region', 'mesh', 'linkedmesh', 'skeleton',
  // Rodada 38, lote 1: o emissor DESENHA, no lugar do slot dele (§9.9 da
  // extensão BONE_particles). Ficava de fora, com a caixa e o ponto, e não
  // havia como pô-lo na frente ou atrás das imagens.
  'BONE_particle',
]);

/** O tipo do anexo, com o padrão do formato: sem `type` escrito, é `region`. */
function typeOf(def: { type?: string }): string {
  return def.type ?? 'region';
}

/** `true` se o slot tem, em alguma pele, ao menos um anexo que desenha. */
function hasDrawingSomewhere(file: BoneFile, slot: string): boolean {
  for (const skin of file.skins ?? []) {
    for (const def of Object.values(skin.attachments?.[slot] ?? {})) {
      if (DRAWING_TYPES.has(typeOf(def as { type?: string }))) return true;
    }
  }
  return false;
}

/**
 * O que a aba Ordem faz com um slot.
 *
 * | resposta | quer dizer |
 * |:---|:---|
 * | `desenho` | o anexo de agora desenha: entra na lista, com miniatura |
 * | `sem-imagem` | tem desenho **em outra pele**, ou está vazio agora: entra, apagado. Ele tem ordem, só não tem imagem neste momento |
 * | `fora` | é caixa, ponto, caminho ou máscara: **não entra** |
 */
export function slotLook(file: BoneFile, slot: string): 'desenho' | 'sem-imagem' | 'fora' {
  const def = (file.slots ?? []).find((s) => s.name === slot);
  if (def === undefined) return 'fora';
  const attachment = def.attachment;
  if (typeof attachment === 'string' && attachment !== '') {
    const found = findAttachment(file, slot, attachment);
    // Nome escrito que não existe em pele nenhuma: ele tem ordem, e some da
    // lista seria pior — ninguém conseguiria consertar o que não vê.
    if (found === null) return hasDrawingSomewhere(file, slot) ? 'sem-imagem' : 'fora';
    return DRAWING_TYPES.has(typeOf(found.def)) ? 'desenho' : 'fora';
  }
  // Slot vazio agora. Ele desenha noutra pele? Então ele tem ordem.
  return hasDrawingSomewhere(file, slot) ? 'sem-imagem' : 'fora';
}

// ---------------------------------------------------------------------------
// As linhas
// ---------------------------------------------------------------------------

/** Uma peça da lista: um slot que desenha. */
export interface OrderPiece {
  name: string;
  /** Posição no array `slots`, que **é** a ordem de desenho. */
  index: number;
  /** O osso a que ela está presa. */
  bone: string;
  /** O desenho que ela mostra agora, ou `null`. */
  attachment: string | null;
  /** A pasta a que ela pertence, ou `null`. */
  folder: string | null;
  /** `true` quando não há imagem para mostrar agora: o nome sai em cinza. */
  faded: boolean;
}

/** Uma pasta na lista: um punhado de peças vizinhas com a mesma `folder`. */
export interface OrderFolder {
  kind: 'pasta';
  folder: string;
  /** As peças dela, já na ordem de leitura (a da frente em cima). */
  pieces: OrderPiece[];
  /** Qual pedaço desta pasta é este, de `parts`. `1 de 1` é a pasta inteira. */
  part: number;
  parts: number;
  /** O trecho que ela ocupa no array `slots`, do primeiro ao último. */
  from: number;
  to: number;
}

/** Uma peça solta, fora de qualquer pasta. */
export interface OrderLoose {
  kind: 'peca';
  piece: OrderPiece;
}

export type OrderEntry = OrderFolder | OrderLoose;

/**
 * Todas as peças que a aba mostra, na ordem do array (a de trás primeiro).
 *
 * Lote 66: com `order` — os nomes na ordem posada do quadro de agora, em
 * Animando —, a leitura segue essa ordem, e `index` é a posição nela.
 */
export function orderPieces(file: BoneFile, order?: readonly string[]): OrderPiece[] {
  const slots = file.slots ?? [];
  const rows = slotRows(file);
  const byName = new Map(rows.map((row) => [row.name, row]));
  const lidas = order === undefined
    ? rows
    : order.flatMap((name) => {
      const row = byName.get(name);
      return row === undefined ? [] : [row];
    });
  const out: OrderPiece[] = [];
  lidas.forEach((row, position) => {
    const slot = slots[row.index];
    if (slot === undefined) return;
    const look = slotLook(file, row.name);
    if (look === 'fora') return;
    const folder = typeof slot.folder === 'string' && slot.folder !== '' ? slot.folder : null;
    out.push({
      name: row.name,
      index: order === undefined ? row.index : position,
      bone: row.detail ?? '',
      attachment: slot.attachment ?? null,
      folder,
      faded: look === 'sem-imagem',
    });
  });
  return out;
}

/**
 * A lista da aba, **de cima para baixo**, e o de cima é o que está na FRENTE.
 *
 * Duas coisas acontecem aqui, nesta ordem:
 *
 * 1. as peças vizinhas com a mesma `folder` viram uma **pasta**;
 * 2. a lista inteira é lida de trás para a frente.
 *
 * Vizinhas conta na lista **já filtrada**: o `cape_path` do herói é um caminho,
 * está na pasta `capa` e mora longe das outras duas, mas ele não entra na
 * lista — então a pasta `capa` continua inteira, e não quebrada em duas por
 * causa de algo que ninguém vê.
 *
 * Uma pasta com peça de fora no meio de verdade (`capa`, `hair`, `capa`)
 * aparece **quebrada**, com `parts` maior que 1: mentir que ela é uma só
 * esconderia que a ordem de desenho não é o que a pasta parece dizer.
 */
export function orderEntries(file: BoneFile, order?: readonly string[]): OrderEntry[] {
  const pieces = orderPieces(file, order);
  const runs: OrderEntry[] = [];
  let i = 0;
  while (i < pieces.length) {
    const piece = pieces[i]!;
    if (piece.folder === null) {
      runs.push({ kind: 'peca', piece });
      i += 1;
      continue;
    }
    let j = i;
    while (j + 1 < pieces.length && pieces[j + 1]!.folder === piece.folder) j += 1;
    const dentro = pieces.slice(i, j + 1);
    runs.push({
      kind: 'pasta',
      folder: piece.folder,
      pieces: [...dentro].reverse(),
      part: 1,
      parts: 1,
      from: dentro[0]!.index,
      to: dentro[dentro.length - 1]!.index,
    });
    i = j + 1;
  }
  // Quantos pedaços cada pasta tem, agora que todos foram achados.
  const contagem = new Map<string, number>();
  for (const entry of runs) {
    if (entry.kind !== 'pasta') continue;
    contagem.set(entry.folder, (contagem.get(entry.folder) ?? 0) + 1);
  }
  const vistos = new Map<string, number>();
  for (const entry of runs) {
    if (entry.kind !== 'pasta') continue;
    const n = (vistos.get(entry.folder) ?? 0) + 1;
    vistos.set(entry.folder, n);
    entry.part = n;
    entry.parts = contagem.get(entry.folder) ?? 1;
  }
  return runs.reverse();
}

/** Os nomes das peças de uma pasta, na ordem do array. */
export function folderMembers(file: BoneFile, folder: string): string[] {
  return orderPieces(file).filter((p) => p.folder === folder).map((p) => p.name);
}

// ---------------------------------------------------------------------------
// Subir e descer, na leitura invertida
// ---------------------------------------------------------------------------

/**
 * Para onde `Ctrl+↑` e `Ctrl+↓` levam, **em índices do array**.
 *
 * Na tela, para cima é para a frente. No array, a frente é o FIM. Então
 * `Ctrl+↑` é `+1` no array, e é aqui que essa inversão mora — uma vez só, para
 * a tela não ter que lembrar dela em cada lugar.
 *
 * Nas pontas, `null`: quem chama não roda comando nenhum, e a pilha de desfazer
 * não ganha um passo que não mudou nada.
 */
export function stepIndex(index: number, paraFrente: boolean, total: number): number | null {
  if (index < 0 || index >= total) return null;
  const alvo = index + (paraFrente ? 1 : -1);
  if (alvo < 0 || alvo >= total) return null;
  return alvo;
}

// ---------------------------------------------------------------------------
// Os comandos
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// A barra da aba — anotação 25, lote 35
// ---------------------------------------------------------------------------

/** Um botão da barra da Ordem. */
export interface OrderButton {
  /** A ação registrada que ele chama. A mesma do menu e do botão direito. */
  action: string;
  /** O ícone, que tem que existir em `icons.ts`. */
  icon: string;
  /** O nome por extenso. Ícone nunca vai sozinho. */
  label: string;
  /** A tecla, quando há uma. */
  shortcut?: string;
  /** A frase da dica, que diz o que acontece. */
  hint: string;
}

/**
 * Os seis botões, na ordem em que aparecem.
 *
 * Escrita aqui, e não montada no meio do painel: a barra é uma decisão sobre o
 * trabalho — o que se faz com a ordem de desenho —, e uma lista escrita se lê,
 * se testa e se muda sem abrir o desenho da tela.
 *
 * Os quatro primeiros movem; os dois últimos agrupam. A separação está na
 * ordem, e o CSS põe o espaço entre eles.
 */
export const ORDER_BUTTONS: readonly OrderButton[] = Object.freeze([
  {
    action: 'subir-ordem', icon: 'ordem-frente', label: 'Trazer para a frente', shortcut: 'Ctrl+↑',
    hint: 'sobe um lugar na lista, e passa a cobrir quem ficou abaixo',
  },
  {
    action: 'descer-ordem', icon: 'ordem-tras', label: 'Mandar para trás', shortcut: 'Ctrl+↓',
    hint: 'desce um lugar, e passa a ser coberto por quem ficou acima',
  },
  {
    // Lote 66: Ctrl + → e Ctrl + ←, como no Spriter. Ctrl + Shift + ↑ / ↓
    // continuam valendo, pelo menu Esqueleto.
    action: 'frente-de-tudo', icon: 'ordem-topo', label: 'Frente de tudo', shortcut: 'Ctrl+→',
    hint: 'vai para o topo da lista num passo só. Peça de pasta leva a pasta inteira',
  },
  {
    action: 'fundo-de-tudo', icon: 'ordem-fundo', label: 'Fundo de tudo', shortcut: 'Ctrl+←',
    hint: 'vai para o fim da lista num passo só. Peça de pasta leva a pasta inteira',
  },
  {
    action: 'nova-pasta', icon: 'pasta', label: 'Nova pasta',
    hint: 'junta as peças escolhidas numa pasta, e as põe lado a lado',
  },
  {
    action: 'tirar-da-pasta', icon: 'pasta-fora', label: 'Tirar da pasta',
    hint: 'tira a pasta do nome. A ordem de desenho não muda',
  },
]);

/** Guarda o array de slots inteiro, que é a única prova de que desfazer devolve. */
abstract class SlotArrayCommand implements Command {
  abstract readonly label: string;
  readonly kind: ChangeKind = 'structure';
  private before: SlotDef[] = [];

  apply(doc: EditorDoc): void {
    const slots = doc.file.slots ?? (doc.file.slots = []);
    this.before = slots.map((slot) => ({ ...slot }));
    const next = this.rewrite(slots, doc);
    if (next === null) return;
    slots.length = 0;
    slots.push(...next);
  }

  revert(doc: EditorDoc): void {
    const slots = doc.file.slots ?? (doc.file.slots = []);
    slots.length = 0;
    slots.push(...this.before);
  }

  /** O array novo, ou `null` para não mexer em nada. */
  protected abstract rewrite(slots: readonly SlotDef[], doc: EditorDoc): SlotDef[] | null;
}

/**
 * Move uma pasta inteira, **mantendo a ordem interna** — anotação 11.
 *
 * O bloco vai do primeiro ao último slot da pasta, no array, e vai inteiro:
 * arrastar oito peças uma a uma para o mesmo lugar são oito passos de desfazer
 * e sete chances de largar no lugar errado.
 *
 * O que estiver **dentro** do trecho sem ser da pasta — uma caixa, um ponto —
 * viaja junto, e é o certo: ele estava desenhado entre aquelas peças, e tem que
 * continuar entre elas.
 */
export class MoveFolder extends SlotArrayCommand {
  readonly label = 'Mover pasta';

  constructor(
    private readonly from: number,
    private readonly count: number,
    private readonly to: number,
  ) { super(); }

  protected rewrite(slots: readonly SlotDef[]): SlotDef[] | null {
    if (this.count <= 0 || this.from < 0 || this.from + this.count > slots.length) return null;
    const bloco = slots.slice(this.from, this.from + this.count);
    const resto = [...slots.slice(0, this.from), ...slots.slice(this.from + this.count)];
    const at = Math.max(0, Math.min(this.to, resto.length));
    return [...resto.slice(0, at), ...bloco, ...resto.slice(at)];
  }
}

// ---------------------------------------------------------------------------
// Soltar ENTRE duas linhas — lote 50, rodada 5
// ---------------------------------------------------------------------------

/**
 * Onde, dentro da linha, o arrasto está: o terço de cima, o do meio, o de
 * baixo. Na TELA: `antes` é acima da linha. Como no Spine e no Spriter, os
 * terços de cima e de baixo inserem; o do meio faz o que sempre fez.
 */
export type DropZone = 'antes' | 'em-cima' | 'depois';

export function dropZone(offsetY: number, rowHeight: number): DropZone {
  if (rowHeight <= 0) return 'em-cima';
  if (offsetY < rowHeight / 3) return 'antes';
  if (offsetY > (rowHeight * 2) / 3) return 'depois';
  return 'em-cima';
}

/**
 * A aba Ordem é de ponta-cabeça (lote 25): a linha de cima fica na FRENTE,
 * que no arquivo é mais tarde. Então acima da linha, na tela, é depois dela
 * no array, e abaixo é antes.
 */
export function arrayZone(screen: DropZone): DropZone {
  return screen === 'antes' ? 'depois' : screen === 'depois' ? 'antes' : 'em-cima';
}

/**
 * O `to` de `MoveSlot` e de `MoveFolder` para inserir o que sai de `from`
 * (`count` peças em bloco) antes ou depois da linha `target` — em índices do
 * array de slots. `null` quando nada muda. `to` é contado sem o bloco, que é o
 * que os dois comandos esperam.
 */
export function insertIndex(
  from: number, target: number, zone: 'antes' | 'depois', total: number, count = 1,
): number | null {
  const dest = zone === 'antes' ? target : target + 1;
  if (dest >= from && dest <= from + count) return null;
  const to = dest > from ? dest - count : dest;
  const clamped = Math.max(0, Math.min(to, Math.max(0, total - count)));
  return clamped === from ? null : clamped;
}

/**
 * Quantas peças **mudam de lugar** ao juntar estas numa pasta.
 *
 * A janela avisa antes de mexer: pôr numa pasta é um gesto de arrumação, e ele
 * mexe na ordem de desenho, que é o que decide o que cobre o quê. Quem escolhe
 * duas peças já vizinhas não mexe em nada, e a janela também diz isso.
 */
export function movedCount(file: BoneFile, names: readonly string[]): number {
  const slots = file.slots ?? [];
  const idxs = names
    .map((name) => slots.findIndex((s) => s.name === name))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
  if (idxs.length === 0) return 0;
  const base = idxs[0]!;
  return idxs.filter((idx, k) => idx !== base + k).length;
}

/**
 * Põe as peças escolhidas numa pasta, e as deixa **vizinhas**.
 *
 * A âncora é a peça que já estava mais atrás: as outras são puxadas para junto
 * dela, na ordem em que já estavam. Puxar para a frente moveria o bloco para
 * cima de quem não foi escolhido, e ninguém pediu isso.
 */
export class PutInFolder extends SlotArrayCommand {
  readonly label = 'Pôr numa pasta';

  constructor(
    private readonly names: readonly string[],
    private readonly folder: string,
  ) { super(); }

  protected rewrite(slots: readonly SlotDef[]): SlotDef[] | null {
    const escolhidos = new Set(this.names);
    const idxs = slots
      .map((slot, i) => (escolhidos.has(slot.name) ? i : -1))
      .filter((i) => i >= 0);
    if (idxs.length === 0) return null;
    const base = idxs[0]!;
    const bloco = idxs.map((i) => ({ ...slots[i]!, folder: this.folder }));
    const resto = slots.filter((slot) => !escolhidos.has(slot.name));
    return [...resto.slice(0, base), ...bloco, ...resto.slice(base)];
  }
}

/**
 * Tira as peças da pasta. **A ordem não muda** — só o agrupamento.
 *
 * `folder` é apagado, e não posto em branco: um campo informativo com string
 * vazia é ruído que todo leitor teria que aprender a ignorar.
 */
export class TakeOutOfFolder extends SlotArrayCommand {
  readonly label = 'Tirar da pasta';

  constructor(private readonly names: readonly string[]) { super(); }

  protected rewrite(slots: readonly SlotDef[]): SlotDef[] | null {
    const escolhidos = new Set(this.names);
    if (escolhidos.size === 0) return null;
    return slots.map((slot) => {
      if (!escolhidos.has(slot.name)) return { ...slot };
      const copia = { ...slot };
      delete copia.folder;
      return copia;
    });
  }
}

/** O que acontece quando o nome novo de uma pasta já é o de outra. */
export interface FolderMerge {
  from: string;
  to: string;
  /** Peças que chegam, vindas da pasta renomeada. */
  moving: number;
  /** Peças que a pasta de destino já tinha. */
  already: number;
  /** Em quantos pedaços a pasta aparece na aba depois: 1 = inteira. */
  parts: number;
}

/**
 * Renomear para o nome de OUTRA pasta funde as duas. `null` = nome livre.
 *
 * Conta no ARQUIVO, e não na lista da aba: o `cape_path` do herói está na
 * pasta `capa` e não aparece na aba, mas o nome dele muda junto — e quem lê
 * "3 peças" tem de poder conferir abrindo o `.bone`.
 *
 * Os pedaços saem da mesma `orderEntries` que desenha a aba, rodada sobre o
 * arquivo como ele FICARIA: a janela não pode prometer uma conta e a aba
 * mostrar outra.
 */
export function mergeOnRename(file: BoneFile, from: string, to: string): FolderMerge | null {
  if (to === '' || to === from) return null;
  const slots = file.slots ?? [];
  const already = slots.filter((slot) => slot.folder === to).length;
  if (already === 0) return null;
  const moving = slots.filter((slot) => slot.folder === from).length;
  const depois = {
    ...file,
    slots: slots.map((slot) => (slot.folder === from ? { ...slot, folder: to } : slot)),
  } as BoneFile;
  const parts = orderEntries(depois)
    .filter((entry) => entry.kind === 'pasta' && entry.folder === to).length;
  return { from, to, moving, already, parts: Math.max(1, parts) };
}

function pecas(n: number): string {
  return `${n} ${n === 1 ? 'peça' : 'peças'}`;
}

/** A frase da janela, ANTES de renomear. Vazia quando o nome está livre. */
export function mergeWarning(file: BoneFile, from: string, to: string): string {
  const fusao = mergeOnRename(file, from, to);
  if (fusao === null) return '';
  const base = `Já existe a pasta ${fusao.to}, com ${pecas(fusao.already)}. `
    + `As ${pecas(fusao.moving)} de ${fusao.from} entram nela: as duas viram uma só.`;
  if (fusao.parts <= 1) return base;
  return `${base} Elas não são vizinhas na ordem: a pasta vai aparecer em `
    + `${fusao.parts} pedaços, com o botão Juntar.`;
}

/** A frase do rodapé, DEPOIS de renomear. */
export function renameNotice(from: string, to: string, fusao: FolderMerge | null): string {
  if (fusao === null) return `Pasta ${from} agora é ${to}`;
  const total = fusao.moving + fusao.already;
  const pedacos = fusao.parts > 1 ? `, em ${fusao.parts} pedaços` : '';
  return `Pasta ${from} entrou em ${to}: agora são ${pecas(total)}${pedacos}`;
}

/** Troca o nome da pasta em todas as peças dela. Duplo clique no nome. */
export class RenameFolder extends SlotArrayCommand {
  readonly label = 'Renomear a pasta';

  constructor(
    private readonly from: string,
    private readonly to: string,
  ) { super(); }

  protected rewrite(slots: readonly SlotDef[]): SlotDef[] | null {
    if (this.to === '' || this.to === this.from) return null;
    return slots.map((slot) => (
      slot.folder === this.from ? { ...slot, folder: this.to } : { ...slot }
    ));
  }
}

// ---------------------------------------------------------------------------
// Lote 66 — como o Z-Order do Spriter
// ---------------------------------------------------------------------------

/**
 * Os quatro passos da ordem de desenho — lote 66, plano ordem. O Humberto:
 * *"ORDEM: olha o manual do Spriter."* Lá, Ctrl + ↑ / ↓ sobe e desce o sprite
 * uma casa, e Ctrl + → / ← manda para a frente e para o fundo, **na cena**,
 * sem abrir painel. E a ordem é por quadro-chave.
 */
export type OrderDir = 'frente-1' | 'fundo-1' | 'frente' | 'fundo';

/** Uma entrada de chave `drawOrder` (§9.5): o slot e quantas casas ele anda. */
export interface OrderOffset {
  slot: string;
  offset: number;
}

const ORDER_DIR_LABEL: Readonly<Record<OrderDir, string>> = Object.freeze({
  'frente-1': 'Trazer para a frente',
  'fundo-1': 'Mandar para trás',
  frente: 'Frente de tudo',
  fundo: 'Fundo de tudo',
});

/** O nome do passo de desfazer de "Copiar a ordem para toda a animação". */
export const COPY_ORDER_LABEL = 'Copiar a ordem para toda a animação';

/**
 * Um passo na ordem — lote 66. `order` são nomes, e o ÚLTIMO está na frente
 * (o array `slots`, §4.3). Os escolhidos vizinhos andam juntos e mantêm a
 * ordem entre si. Já na ponta: a mesma ordem, e `moved: false`.
 */
export function stepOrder(
  order: readonly string[], names: readonly string[], dir: OrderDir, visible?: ReadonlySet<string>,
): { order: string[]; moved: boolean } {
  const escolhidos = new Set(names);
  // Rodada 38, lote 3 (doc 30, nota a): o passo de UMA casa anda até o vizinho
  // que a aba mostra. Trocar com uma caixa, um ponto ou um caminho dizia "andou"
  // e não mudava nada na lista nem na cena. Os que não se veem ficam nas casas
  // deles; os que se veem andam entre si.
  if (visible !== undefined && (dir === 'frente-1' || dir === 'fundo-1')) {
    const conta = (name: string): boolean => visible.has(name) || escolhidos.has(name);
    const vistos = order.filter(conta);
    const passo = stepOrder(vistos, names, dir);
    if (!passo.moved) return { order: order.slice(), moved: false };
    let k = 0;
    return { order: order.map((name) => (conta(name) ? passo.order[k++]! : name)), moved: true };
  }
  if (dir === 'frente' || dir === 'fundo') {
    const eles = order.filter((name) => escolhidos.has(name));
    const resto = order.filter((name) => !escolhidos.has(name));
    const nova = dir === 'frente' ? [...resto, ...eles] : [...eles, ...resto];
    return { order: nova, moved: nova.some((name, i) => name !== order[i]) };
  }
  const out = order.slice();
  let moved = false;
  if (dir === 'frente-1') {
    for (let i = out.length - 2; i >= 0; i--) {
      if (escolhidos.has(out[i]!) && !escolhidos.has(out[i + 1]!)) {
        [out[i], out[i + 1]] = [out[i + 1]!, out[i]!];
        moved = true;
      }
    }
  } else {
    for (let i = 1; i < out.length; i++) {
      if (escolhidos.has(out[i]!) && !escolhidos.has(out[i - 1]!)) {
        [out[i], out[i - 1]] = [out[i - 1]!, out[i]!];
        moved = true;
      }
    }
  }
  return { order: out, moved };
}

/**
 * **Onde a peça ficou** — rodada 43, lote 4 (doc `51`, T4). O rodapé dizia só
 * "Mandar para trás.": sem olhar a lista não se sabia onde a peça estava.
 * Conta de cima (a frente) para baixo, entre as peças que a aba mostra.
 */
export function orderPlaceSays(order: readonly string[], visible: ReadonlySet<string>, name: string): string {
  const deCima = order.filter((n) => visible.has(n) || n === name).reverse();
  const i = deCima.indexOf(name);
  if (i < 0) return name;
  const total = deCima.length;
  const onde = i === 0 ? 'na frente de tudo'
    : i === total - 1 ? 'atrás de tudo'
      : `entre ${deCima[i - 1]} e ${deCima[i + 1]}`;
  return `${name}: ${i + 1}ª de ${total}, ${onde}`;
}

/**
 * **Um passo que não parte pasta** — rodada 43, lote 4 (S3). Ctrl+↑/↓ numa
 * peça solta entrava na pasta vizinha e a partia em duas ("perna · pedaço 2
 * de 2", doc `51`, `19`). Agora a peça de fora pula a pasta inteira; para
 * entrar numa pasta, arrasta-se (o Photoshop faz assim). Peça de dentro da
 * pasta anda como sempre.
 */
export function stepOrderOverFolders(
  file: BoneFile, order: readonly string[], names: readonly string[], dir: OrderDir, visible: ReadonlySet<string>,
): { order: string[]; moved: boolean } {
  const primeiro = stepOrder(order, names, dir, visible);
  if (!primeiro.moved || (dir !== 'frente-1' && dir !== 'fundo-1')) return primeiro;
  const pasta = new Map((file.slots ?? []).map((s) => [s.name, typeof s.folder === 'string' && s.folder !== '' ? s.folder : null]));
  const minhas = new Set(names.map((n) => pasta.get(n) ?? null));
  const dentroDeOutra = (atual: readonly string[]): boolean => {
    const vistos = atual.filter((n) => visible.has(n) || names.includes(n));
    return names.some((n) => {
      const i = vistos.indexOf(n);
      const a = pasta.get(vistos[i - 1] ?? '') ?? null;
      const b = pasta.get(vistos[i + 1] ?? '') ?? null;
      return a !== null && a === b && !minhas.has(a);
    });
  };
  let passo = primeiro;
  for (let guarda = 0; guarda < order.length && dentroDeOutra(passo.order); guarda++) {
    const proximo = stepOrder(passo.order, names, dir, visible);
    if (!proximo.moved) break;
    passo = proximo;
  }
  return passo;
}

/** A ordem que o runtime monta com estas entradas sobre `base` (§9.5). */
export function orderWithOffsets(base: readonly string[], entries: readonly OrderOffset[]): string[] {
  const posicao = new Map(base.map((name, i) => [name, i]));
  const convertidas = entries.flatMap((entry) => {
    const slot = posicao.get(entry.slot);
    return slot === undefined ? [] : [{ slot, offset: entry.offset }];
  });
  return orderFromOffsets(base.map((_, i) => i), convertidas).map((id) => base[id]!);
}

function sameNames(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((name, i) => name === b[i]);
}

/**
 * A chave `drawOrder` que leva `base` a `wanted` — lote 66. A menor lista que
 * o runtime transforma em `wanted`: começa com uma entrada por slot que mudou
 * de casa, e tira cada uma que não faz falta. `wanted` igual à base dá `[]`.
 */
export function offsetsFor(base: readonly string[], wanted: readonly string[]): OrderOffset[] {
  const posicao = new Map(base.map((name, i) => [name, i]));
  let entries: OrderOffset[] = [];
  wanted.forEach((name, i) => {
    const antes = posicao.get(name);
    if (antes !== undefined && antes !== i) entries.push({ slot: name, offset: i - antes });
  });
  entries.sort((a, b) => posicao.get(a.slot)! - posicao.get(b.slot)!);
  for (let i = 0; i < entries.length;) {
    const sem = [...entries.slice(0, i), ...entries.slice(i + 1)];
    if (sameNames(orderWithOffsets(base, sem), wanted)) entries = sem;
    else i += 1;
  }
  return entries;
}

/**
 * A ordem base (§4.4): o array `slots`, com a `drawOrder` de **cada pele da
 * pilha** por cima, de baixo para cima, cada uma pelo algoritmo da §9.5. É
 * dela que as entradas de uma chave são medidas.
 *
 * **A `default` não é mais posta por fora** — degrau 9 (18/09/2026, I10). Até
 * aqui esta conta punha a `default` na frente da lista, sempre, e tirava-a das
 * peles recebidas. Era a leitura certa enquanto a `default` estava obrigada a
 * ficar por baixo de tudo; com a pilha, ela é uma pele como as outras e **pode
 * sair**. A conta velha aplicava o `drawOrder` de uma pele desligada, e a aba
 * Ordem mostrava uma ordem que a cena não desenhava.
 *
 * Agora vale exatamente o que vem em `skins`, na ordem em que vem — que é a
 * pilha, de baixo para cima, com a `default` dentro quando ela está ligada.
 * Quem tem um documento e não uma lista pede `orderSkins(doc)`.
 */
export function baseOrder(file: BoneFile, skins: readonly string[] = []): string[] {
  let order = (file.slots ?? []).map((slot) => slot.name);
  for (const name of skins) {
    const skin = (file.skins ?? []).find((entry) => entry.name === name) as { drawOrder?: unknown } | undefined;
    const entries = Array.isArray(skin?.drawOrder) ? skin.drawOrder as OrderOffset[] : [];
    if (entries.length > 0) order = orderWithOffsets(order, entries);
  }
  return order;
}

/**
 * As peles que a ordem enxerga: **a pilha**, de baixo para cima (§4.4).
 *
 * `visibleSkins` não serve para isto por duas razões, e as duas dão ordem
 * errada: ela é o lápis PRIMEIRO e as outras depois (a pilha é de baixo para
 * cima), e ela é uma vista calculada, não o estado. A pilha é o estado.
 */
export function orderSkins(doc: EditorDoc): string[] {
  return skinStackOf(doc);
}

/**
 * A ordem de desenho posada — lote 66. Em Montagem, a base. Com uma animação
 * aberta, a da chave `drawOrder` que vale em `time`; antes da primeira chave
 * vale a primeira, como no runtime.
 */
export function drawOrderAt(
  file: BoneFile, animation: string | null, time: number, skins: readonly string[] = [],
  /** Degrau 4b: o arquivo das CHAVES, quando a base é de outro corpo (9.13). */
  keysFile: BoneFile = file,
): string[] {
  const base = baseOrder(file, skins);
  if (animation === null) return base;
  const timeline = findTimeline(keysFile, animation, drawOrderTarget()) as unknown as
    { keys?: Array<{ time: number; value?: unknown }> } | null;
  const keys = timeline?.keys ?? [];
  if (keys.length === 0) return base;
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (keys[k]!.time <= time + TIME_EPSILON) i = k;
  const value = keys[i]!.value;
  return Array.isArray(value) && value.length > 0 ? orderWithOffsets(base, value as OrderOffset[]) : base;
}

/**
 * A tecla da ordem — lote 66. Ctrl + ↑ / ↓: uma casa. Ctrl + → / ←: frente e
 * fundo de tudo (Ctrl + Shift + ↑ / ↓ também, como desde o lote 35). Num
 * campo de texto, nada: lá as setas são do campo.
 */
export function orderKeyDir(key: string, ctrl: boolean, shift: boolean, inTextField: boolean): OrderDir | null {
  if (!ctrl || inTextField) return null;
  if (key === 'ArrowUp') return shift ? 'frente' : 'frente-1';
  if (key === 'ArrowDown') return shift ? 'fundo' : 'fundo-1';
  if (key === 'ArrowRight') return 'frente';
  if (key === 'ArrowLeft') return 'fundo';
  return null;
}

/**
 * A direção de cada ação da ordem — lote A1. A tecla vem de `ui/keys.ts`
 * (escopos `cena` e `ordem`); a conta, daqui. `orderKeyDir` e a tabela dizem
 * a mesma coisa, e o teste `teclas` confere.
 */
export const ORDER_ACTION_DIR: Readonly<Record<string, OrderDir>> = Object.freeze({
  'subir-ordem': 'frente-1',
  'descer-ordem': 'fundo-1',
  'frente-de-tudo': 'frente',
  'fundo-de-tudo': 'fundo',
});

/** A primeira ação da lista que é um passo na ordem, como direção; `null` se nenhuma. */
export function orderDirOfActions(actions: readonly string[]): OrderDir | null {
  for (const action of actions) {
    const dir = ORDER_ACTION_DIR[action];
    if (dir !== undefined) return dir;
  }
  return null;
}

/**
 * **O que um clique numa linha da Ordem escolhe** — rodada 38, lote 3 (doc 30,
 * nota b). No Godot e no Unity, escolher o nó abre a ficha dele. Escolher o
 * emissor aqui abria a ficha do SLOT (X, Y, Osso), e a do emissor só vinha
 * pela estrela na cena. O emissor agora é escolhido como desenho — a mesma
 * escolha da cena e da Árvore —, e a imagem continua escolhendo o slot.
 */
export function orderRowSelection(file: BoneFile, slot: string): Selection {
  const def = (file.slots ?? []).find((s) => s.name === slot);
  const nome = def?.attachment;
  if (typeof nome === 'string' && nome !== '') {
    const achado = findAttachment(file, slot, nome);
    if ((achado?.def as { type?: string } | undefined)?.type === 'BONE_particle') {
      return { ...emptySelection(), attachments: [{ slot, attachment: nome }] };
    }
  }
  return { ...emptySelection(), slots: [slot] };
}

/**
 * Os slots que a ordem move: os escolhidos, e os dos desenhos escolhidos (o
 * clique na cena escolhe o desenho). Na ordem do array.
 */
export function orderTargets(file: BoneFile, selection: Pick<Selection, 'slots' | 'attachments'>): string[] {
  const nomes = new Set([...selection.slots, ...selection.attachments.map((item) => item.slot)]);
  return (file.slots ?? []).map((slot) => slot.name).filter((name) => nomes.has(name));
}

/** Quem está fora da casa da base — em Animando, quem uma chave tirou do lugar. */
export function keyedMoved(base: readonly string[], current: readonly string[]): Set<string> {
  return new Set(current.filter((name, i) => base[i] !== name));
}

/** `count` nomes de `from` levados para `to` — a mesma conta de `MoveSlot` e `MoveFolder`. */
export function moveBlock(list: readonly string[], from: number, count: number, to: number): string[] {
  if (count <= 0 || from < 0 || from + count > list.length) return list.slice();
  const bloco = list.slice(from, from + count);
  const resto = [...list.slice(0, from), ...list.slice(from + count)];
  const at = Math.max(0, Math.min(to, resto.length));
  return [...resto.slice(0, at), ...bloco, ...resto.slice(at)];
}

/** Montagem: o array `slots` na ordem destes nomes. Nome que falta: nada muda. */
export class ReorderSlots extends SlotArrayCommand {
  constructor(private readonly order: readonly string[], readonly label = 'Mudar a ordem de desenho') {
    super();
  }

  protected rewrite(slots: readonly SlotDef[]): SlotDef[] | null {
    if (this.order.length !== slots.length) return null;
    const byName = new Map(slots.map((slot) => [slot.name, slot]));
    const out: SlotDef[] = [];
    for (const name of this.order) {
      const slot = byName.get(name);
      if (slot === undefined) return null;
      out.push({ ...slot });
    }
    return out;
  }
}

/**
 * Muda a ordem de desenho pela regra dos dois modos — lote 66.
 *
 * Em Montagem, o array `slots`. Em Animando, uma **chave `drawOrder`** no
 * tempo de agora (§9.5), como toda propriedade — editar sempre grava (degrau
 * 4a). A primeira chave de ordem depois do 0 leva
 * junto a ordem de antes em 0 — o começo se guarda sozinho (lote 68).
 */
export function runOrderChange(doc: EditorDoc, next: readonly string[], label: string): 'montagem' | 'chave' | 'recusado' {
  const animation = doc.animation;
  if (animation === null) {
    corpoDe(doc).run(new ReorderSlots(next, label));
    return 'montagem';
  }
  if (findAnimation(doc.file, animation) === null) return 'recusado';
  // Degrau 4b: a base é a do corpo do instante; a chave vai para a animação deste arquivo.
  const value = offsetsFor(baseOrder(corpoDe(doc).file, orderSkins(doc)), next);
  const time = doc.time;
  const alvo = drawOrderTarget();
  doc.run(new EditKeys(animation, label, (file, name) => {
    if (roundTime(time) > 0 && findTimeline(file, name, alvo) === null) setKey(file, name, 0, alvo, [] as never);
    setKey(file, name, time, alvo, JSON.parse(JSON.stringify(value)) as never);
  }));
  // P12 (29/09/2026): a chave de ordem não se vê na cena. Com a linha do tempo
  // em Resumo ela era um losango e mais nada: "criei e sumiu". A linha abre os
  // Detalhes, escolhe a chave e rola até ela.
  revealKey({ target: alvo, time: roundTime(time) });
  return 'chave';
}

/**
 * A ordem posada de agora, lida como a cena lê — degrau 4b (9.13): a base é a
 * do corpo do instante, e as chaves `drawOrder` são da animação aberta neste
 * arquivo. `undefined` com a base aberta (o array vale).
 */
export function drawOrderNow(doc: EditorDoc): string[] | undefined {
  if (doc.animation === null) return undefined;
  return drawOrderAt(corpoDe(doc).file, doc.animation, doc.time, orderSkins(doc), doc.file);
}

/**
 * Frente e fundo de tudo levam o PEDAÇO de pasta inteiro (lote 35), com o que
 * estiver no meio dele: tirar uma peça do meio da capa desmancharia a pasta.
 */
function withFolderRun(
  file: BoneFile, names: readonly string[], order: readonly string[], posed: boolean,
): { names: string[]; folder: string | null } {
  const escolhidos = new Set(names);
  const out = new Set(names);
  let folder: string | null = null;
  for (const entry of orderEntries(file, posed ? order : undefined)) {
    if (entry.kind !== 'pasta' || !entry.pieces.some((piece) => escolhidos.has(piece.name))) continue;
    for (const name of order.slice(entry.from, entry.to + 1)) out.add(name);
    folder = entry.folder;
  }
  return { names: order.filter((name) => out.has(name)), folder };
}

function seconds(time: number): string {
  return `${time.toFixed(2).replace('.', ',')} s`;
}

/**
 * Um passo da ordem com o que está escolhido — lote 66. A mesma porta para as
 * teclas na cena, as teclas e os botões da aba Ordem e o menu Esqueleto.
 * Devolve `true` quando mudou alguma coisa.
 */
export function runOrderStep(doc: EditorDoc, dir: OrderDir): boolean {
  const escolhidos = orderTargets(doc.file, doc.selection);
  if (escolhidos.length === 0) {
    doc.notice('Escolha um desenho primeiro: a ordem mexe no que está escolhido');
    return false;
  }
  const posed = doc.animation !== null;
  const atual = posed
    ? drawOrderAt(doc.file, doc.animation, doc.time, orderSkins(doc))
    : (doc.file.slots ?? []).map((slot) => slot.name);
  const deTudo = dir === 'frente' || dir === 'fundo';
  const alvo = deTudo ? withFolderRun(doc.file, escolhidos, atual, posed) : { names: escolhidos, folder: null };
  const frente = dir === 'frente-1' || dir === 'frente';
  const visiveis = new Set(orderPieces(doc.file, posed ? atual : undefined).map((piece) => piece.name));
  // Rodada 43, lote 4 (S3): a peça solta pula a pasta inteira.
  const passo = deTudo ? stepOrder(atual, alvo.names, dir, visiveis) : stepOrderOverFolders(doc.file, atual, alvo.names, dir, visiveis);
  if (!passo.moved) {
    doc.notice(`${alvo.folder !== null ? 'A pasta já está' : 'Já está'} ${frente ? 'na frente de tudo' : 'atrás de tudo'}`);
    return false;
  }
  const saida = runOrderChange(doc, passo.order, ORDER_DIR_LABEL[dir]);
  if (saida === 'recusado') {
    doc.notice(`A animação "${doc.animation}" não está no arquivo`);
    return false;
  }
  const quando = saida === 'chave' ? ` (chave em ${seconds(doc.time)})` : '';
  if (deTudo) {
    const quem = alvo.folder !== null
      ? `Pasta ${alvo.folder}`
      : escolhidos.length === 1 ? escolhidos[0]! : `${escolhidos.length} peças`;
    doc.notice(`${quem} ${frente ? 'na frente de tudo' : 'atrás de tudo'}${quando}`);
  } else if (escolhidos.length === 1) {
    // Rodada 43, lote 4 (doc 51, T4): o passo diz onde a peça ficou.
    doc.notice(`${orderPlaceSays(passo.order, visiveis, escolhidos[0]!)}${quando}`);
  } else if (saida === 'chave') {
    doc.notice(`Ordem de desenho${quando}`);
  }
  return true;
}

/**
 * Os tempos em que a cópia da ordem escreve — degrau 8, tarefa 8.2 (G3).
 *
 * **Chave a chave**, palavra do Humberto: a ordem de agora vai para **cada
 * chave `drawOrder` que já existe**, e não só para uma em 0. O zero entra
 * sempre, senão a ordem de agora não valeria do começo da animação até a
 * primeira chave.
 *
 * Por que isso não é o mesmo que apagar tudo e gravar uma chave em 0: os
 * tempos das chaves são trabalho de alguém. Apagá-los para escrever um valor
 * só é jogar fora onde a ordem mudava — e depois de um Ctrl+Z parcial, ou de
 * uma mudança de ideia, não há de onde tirar esses tempos de volta.
 */
export function copyOrderTimes(
  file: BoneFile, animation: string,
): number[] {
  const timeline = findTimeline(file, animation, drawOrderTarget()) as unknown as
    { keys?: Array<{ time: number }> } | null;
  const times = new Set<number>([0]);
  for (const key of timeline?.keys ?? []) times.add(Math.max(0, roundTime(key.time)));
  return [...times].sort((a, b) => a - b);
}

/** A frase do rodapé da cópia da ordem. */
export function copyOrderNotice(animation: string, times: number): string {
  const chaves = times === 1 ? '1 chave' : `${times} chaves`;
  return `A ordem de agora vale para toda a animação ${animation}: gravada em ${chaves}`;
}

/**
 * **Editar → Copiar a ordem para toda a animação** — o "Copy Z-order To All
 * Keyframes" do Spriter. A ordem de agora vai para **cada chave `drawOrder`
 * da animação**, e para a de 0 (G3). As outras animações não mudam. Um passo
 * de desfazer.
 */
export function runCopyOrderToAnimation(doc: EditorDoc): boolean {
  const animation = doc.animation;
  if (animation === null || findAnimation(doc.file, animation) === null) {
    doc.notice('Abra uma animação primeiro: a ordem é copiada para as chaves dela');
    return false;
  }
  const value = offsetsFor(
    baseOrder(corpoDe(doc).file, orderSkins(doc)),
    drawOrderAt(corpoDe(doc).file, animation, doc.time, orderSkins(doc), doc.file),
  );
  const alvo = drawOrderTarget();
  const times = copyOrderTimes(doc.file, animation);
  doc.run(new EditKeys(animation, COPY_ORDER_LABEL, (file, name) => {
    for (const time of copyOrderTimes(file, name)) {
      setKey(file, name, time, alvo, JSON.parse(JSON.stringify(value)) as never);
    }
  }));
  doc.notice(copyOrderNotice(animation, times.length));
  return true;
}

// ---------------------------------------------------------------------------
// Mover uma peça sem partir pasta — Rodada 47, lote 6 (doc 69; a nota do Diretor)
// ---------------------------------------------------------------------------

/**
 * A pasta que a peça leva depois de cair em `to` — como no Photoshop: solta
 * entre duas da mesma pasta, ela ENTRA na pasta; solta fora, ela SAI da sua
 * (a não ser que caia colada à própria pasta, na borda dela).
 *
 * O defeito (doc `69`): arrastar uma peça para a frente de outra deixava a
 * peça com a pasta antiga, e isso partia em dois a pasta em que ela caía (e às
 * vezes a de onde saía). A janela oferecia Juntar, mas ninguém tinha pedido.
 * Com esta regra, uma pasta nunca se parte por um arrasto.
 */
export function folderAfterMove(slots: readonly SlotDef[], from: number, to: number): string | undefined {
  const propria = slots[from]?.folder;
  const resto = [...slots.slice(0, from), ...slots.slice(from + 1)];
  const at = Math.max(0, Math.min(to, resto.length));
  const antes = resto[at - 1]?.folder;
  const depois = resto[at]?.folder;
  if (antes !== undefined && antes === depois) return antes;
  if (propria !== undefined && (propria === antes || propria === depois)) return propria;
  return undefined;
}

/** A frase do rodapé quando a pasta da peça mudou. Vazia quando não mudou. */
export function folderMoveSays(name: string, before: string | undefined, after: string | undefined): string {
  if (before === after) return '';
  if (after === undefined) return `${name} saiu da pasta ${before}`;
  if (before === undefined) return `${name} entrou na pasta ${after}`;
  return `${name} saiu da pasta ${before} e entrou na pasta ${after}`;
}

/** Move uma peça e acerta a pasta dela pela `folderAfterMove`. Um passo de desfazer. */
export class MoveSlotKeepingFolders extends SlotArrayCommand {
  readonly label = 'Mover peça';

  constructor(private readonly from: number, private readonly to: number) { super(); }

  protected rewrite(slots: readonly SlotDef[]): SlotDef[] | null {
    if (this.from < 0 || this.from >= slots.length) return null;
    const pasta = folderAfterMove(slots, this.from, this.to);
    const peca: SlotDef = { ...slots[this.from]! };
    if (pasta === undefined) delete (peca as { folder?: string }).folder;
    else (peca as { folder?: string }).folder = pasta;
    const resto = [...slots.slice(0, this.from), ...slots.slice(this.from + 1)];
    const at = Math.max(0, Math.min(this.to, resto.length));
    return [...resto.slice(0, at), peca, ...resto.slice(at)];
  }
}
