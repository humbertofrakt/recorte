/**
 * **"Este boneco": a tomada ao contrário** — rodada 11 (05/10/2026), spec 7.11,
 * campo `around`; `02 AS DECISOES`, seção 2.
 *
 * O Humberto: *"O poder rosa foi feito para receber o personagem. Mas eu estou
 * animando o personagem e quero pôr o poder nele. Ponho o poder na animação;
 * botão direito na imagem do meio do poder; na grade, o primeiro item é Este
 * boneco."* A imagem do meio deixa de ser desenhada; o que está atrás dela vai
 * para trás do personagem INTEIRO, o que está na frente, para a frente.
 *
 * No arquivo é UM campo, no anexo `skeleton` de quem recebe: `around`, com o
 * nome do slot DA ENTIDADE que marca o meio. A marca é do encaixe, e não da
 * entidade: o mesmo poder em outro boneco, sem o campo, entra em bloco.
 *
 * | Onde se fez | O que o comando grava |
 * |:---|:---|
 * | na base | o campo no anexo: vale em todas as animações |
 * | no meio de uma animação | um SEGUNDO placeholder no mesmo slot, igual ao que valia, com a marca (ou sem), e a chave `slot/attachment` naquele quadro: vale só nela, dali em diante. A `uri` é a mesma, então a entidade continua onde estava (7.11) |
 *
 * Módulo puro: sem DOM. O desenho é das portas (`panels/entities-actions.ts`).
 */

import type { BoneFile, SkeletonData } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';
import { keepStartKey, setKey } from './keying.js';
import { entityShortName } from './entity-band.js';
import type { EntitySlot } from './entity-band.js';

export { aroundWarnings } from '../doc/around-warnings.js';

/** A versão do formato em que `around` entrou (schema, `x-since`). */
export const AROUND_SINCE = '1.1';
/** A versão de antes: a de um arquivo que não usa nada da 1.1. */
const BEFORE_AROUND = '1.0';

type Def = Record<string, unknown>;

function skinOf(file: BoneFile, skin: string): { attachments?: Record<string, Record<string, unknown>> } | null {
  return ((file.skins ?? []).find((s) => s.name === skin) as never) ?? null;
}

/** O anexo `skeleton` de `(skin, slot, attachment)`, ou `null`. */
function defOf(file: BoneFile, skin: string, slot: string, attachment: string): Def | null {
  const d = skinOf(file, skin)?.attachments?.[slot]?.[attachment] as Def | null | undefined;
  return d !== null && d !== undefined && d['type'] === 'skeleton' ? d : null;
}

/** O slot da entidade que marca o meio, ou `null` = em bloco. */
export function aroundOf(file: BoneFile, entity: Pick<EntitySlot, 'skin' | 'slot' | 'attachment'>): string | null {
  const around = defOf(file, entity.skin, entity.slot, entity.attachment)?.['around'];
  return typeof around === 'string' ? around : null;
}

/** Algum anexo do arquivo usa `around`? É o que decide o `minVersion`. */
export function fileUsesAround(file: BoneFile): boolean {
  for (const skin of file.skins ?? []) {
    for (const placeholders of Object.values(skin.attachments ?? {})) {
      for (const raw of Object.values((placeholders ?? {}) as Record<string, unknown>)) {
        const def = raw as Def | null;
        if (def !== null && typeof def === 'object' && def['type'] === 'skeleton' && typeof def['around'] === 'string') return true;
      }
    }
  }
  return false;
}

function versionPair(text: unknown): [number, number] | null {
  const m = typeof text === 'string' ? /^(\d+)\.(\d+)$/.exec(text) : null;
  return m === null ? null : [Number(m[1]), Number(m[2])];
}

function older(text: unknown, than: string): boolean {
  const a = versionPair(text);
  const b = versionPair(than)!;
  return a === null || a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
}

/**
 * Põe o cabeçalho de acordo com o conteúdo (spec 2.4, 7.11): com `around` no
 * arquivo, `minVersion` e `version` sobem para 1.1; sem nenhum, um cabeçalho
 * que estava EXATAMENTE em 1.1 volta para 1.0 — `around` é o único campo da
 * 1.1, e um arquivo sem ele não deve pedir um leitor que não precisa.
 * Arquivo que nunca teve `around` não é tocado: sai byte a byte igual.
 */
export function syncAroundHeader(file: BoneFile): void {
  const header = (file as unknown as { bone?: Def }).bone;
  if (header === undefined || header === null) return;
  if (fileUsesAround(file)) {
    if (older(header['minVersion'], AROUND_SINCE)) header['minVersion'] = AROUND_SINCE;
    if (older(header['version'], AROUND_SINCE)) header['version'] = AROUND_SINCE;
    return;
  }
  if (header['minVersion'] === AROUND_SINCE) {
    header['minVersion'] = BEFORE_AROUND;
    if (header['version'] === AROUND_SINCE) header['version'] = BEFORE_AROUND;
  }
}

/** Onde, no tempo, a marca passa a valer: `null` = na base. */
export interface AroundAt {
  readonly animation: string;
  readonly time: number;
}

/**
 * **Este boneco** e **Tirar o Este boneco**: um comando só.
 *
 * `marker` é o slot da entidade que vira o meio; `null` tira a marca. O
 * desfazer devolve o mapa do slot, a animação e o cabeçalho **por texto**: o
 * arquivo volta letra por letra.
 */
export class SetEntityAround implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  /** O placeholder que ficou valendo (o mesmo, na base; o da chave, na animação). */
  name = '';
  private saved: { slotMap: string; header: string | null; index: number; animation: string | null } | null = null;

  constructor(
    private readonly slot: string,
    private readonly attachment: string,
    private readonly skin: string,
    private readonly marker: string | null,
    private readonly at: AroundAt | null = null,
  ) {
    this.label = marker === null ? 'Tirar o Este boneco' : 'Este boneco';
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    const porSlot = skinOf(file, this.skin)?.attachments?.[this.slot];
    const def = defOf(file, this.skin, this.slot, this.attachment);
    if (porSlot === undefined || def === null) return;
    const index = this.at === null ? -1 : (file.animations ?? []).findIndex((a) => a.name === this.at!.animation);
    if (this.at !== null && index < 0) return;
    const header = (file as { bone?: unknown }).bone;
    this.saved = {
      slotMap: JSON.stringify(porSlot),
      header: header === undefined ? null : JSON.stringify(header),
      index,
      animation: index < 0 ? null : JSON.stringify(file.animations![index]),
    };
    if (this.at === null) {
      if (this.marker === null) delete def['around'];
      else def['around'] = this.marker;
      this.name = this.attachment;
    } else {
      // O placeholder que a chave vai mostrar: o que valia, com a marca trocada.
      const novo = JSON.parse(JSON.stringify(def)) as Def;
      if (this.marker === null) delete novo['around'];
      else novo['around'] = this.marker;
      const texto = JSON.stringify(novo);
      const igual = Object.entries(porSlot).find(([, outro]) => JSON.stringify(outro) === texto);
      if (igual !== undefined) {
        this.name = igual[0];
      } else {
        const sufixo = this.marker === null ? 'em_bloco' : 'este_boneco';
        this.name = uniqueName(`${this.attachment}_${sufixo}`, Object.keys(porSlot));
        porSlot[this.name] = novo;
      }
      const target = { type: 'slot', target: this.slot, property: 'attachment' };
      // Antes da primeira chave do slot, o que a base mostra fica gravado em 0 s:
      // senão a chave valeria também para trás (K15).
      keepStartKey(file, this.at.animation, this.at.time, target as never);
      setKey(file, this.at.animation, this.at.time, target as never, this.name as never);
    }
    syncAroundHeader(file);
  }

  revert(doc: EditorDoc): void {
    const saved = this.saved;
    if (saved === null) return;
    const file = doc.file;
    const attachments = skinOf(file, this.skin)?.attachments;
    if (attachments !== undefined) attachments[this.slot] = JSON.parse(saved.slotMap);
    if (saved.animation !== null && file.animations !== undefined) file.animations[saved.index] = JSON.parse(saved.animation);
    if (saved.header !== null) (file as { bone?: unknown }).bone = JSON.parse(saved.header);
    this.saved = null;
  }
}

// ---------------------------------------------------------------------------
// As contas que as portas mostram
// ---------------------------------------------------------------------------

/** Os slots da entidade, na ordem de desenho da base dela: os candidatos a meio. */
export function markerCandidates(child: SkeletonData | null): string[] {
  return child === null ? [] : child.slots.map((s) => s.name);
}

/** Quantas peças da entidade ficam atrás e quantas na frente do boneco. */
export interface AroundCount {
  readonly behind: number;
  readonly front: number;
}

/**
 * Pela ordem da BASE da entidade (o array `slots` dela): quantos slots com
 * desenho vêm antes do meio, e quantos depois. `null` quando a entidade não tem
 * esse slot. Uma chave de ordem da própria entidade muda isso no meio da
 * animação dela (7.11); o número é o da base, e a dica diz.
 */
export function aroundCount(child: SkeletonData | null, marker: string): AroundCount | null {
  if (child === null) return null;
  const at = child.slots.findIndex((s) => s.name === marker);
  if (at < 0) return null;
  const comDesenho = (from: number, to: number): number => child.slots
    .slice(from, to).filter((s) => s.attachmentName !== null).length;
  return { behind: comDesenho(0, at), front: comDesenho(at + 1, child.slots.length) };
}

/** O rodapé de depois do gesto. */
export function aroundNotice(
  uri: string, host: string, marker: string | null, count: AroundCount | null, at: AroundAt | null,
): string {
  const nome = entityShortName(uri);
  const quem = host.length > 0 ? host : 'este boneco';
  const onde = at === null ? '' : `, só nesta animação, de ${formatSeconds(at.time)} em diante`;
  if (marker === null) {
    return `${nome} voltou a ser desenhada em bloco, no lugar dela na ordem de ${quem}${onde}`;
  }
  const conta = count === null ? '' : `: ${count.behind} atrás, ${count.front} na frente`;
  return `${nome} em volta de ${quem}${conta}${onde}. A imagem "${marker}" marca o meio e não é desenhada`;
}

// ---------------------------------------------------------------------------
// A aba Ordem: as duas linhas presas
// ---------------------------------------------------------------------------

/** Uma linha presa da aba Ordem: a metade de uma entidade em volta. */
export interface AroundLine {
  /** O slot de quem recebe. */
  readonly slot: string;
  readonly side: 'frente' | 'atras';
  /** Quantas peças, pela base da entidade; `null` quando ela não está aberta. */
  readonly count: number | null;
  readonly text: string;
  readonly hint: string;
}

/**
 * As metades das entidades em volta, como a aba Ordem as mostra: as da
 * **frente** em cima da lista, as de **trás** embaixo — a lista se lê com a
 * frente em cima. Não se arrastam: a ordem delas é a da própria entidade.
 *
 * Com duas entidades em volta vale a cebola (7.11): a do slot mais alto fica
 * mais na frente em cima, e mais atrás embaixo. Por isso `frente` vem do slot
 * mais alto para o mais baixo, e `atras`, do mais baixo para o mais alto.
 *
 * `now` diz qual placeholder o slot mostra AGORA (a marca pode valer só num
 * trecho da animação); sem ele, o da base.
 */
export function aroundLines(
  file: BoneFile, skeletons: ReadonlyMap<string, SkeletonData>,
  now: (slot: string) => string | null | undefined = () => undefined,
): { frente: AroundLine[]; atras: AroundLine[] } {
  const achadas: Array<{ slot: string; uri: string; marker: string; count: AroundCount | null }> = [];
  for (const slot of file.slots ?? []) {
    const mostrado = now(slot.name);
    const placeholder = mostrado === undefined ? (slot.attachment ?? null) : mostrado;
    if (placeholder === null) continue;
    for (const skin of file.skins ?? []) {
      const def = defOf(file, skin.name, slot.name, placeholder);
      if (def === null || typeof def['around'] !== 'string' || typeof def['uri'] !== 'string') continue;
      const child = skeletons.get(def['uri']) ?? null;
      // Entidade aberta e sem esse slot: está em bloco (a barra de avisos diz).
      if (child !== null && aroundCount(child, def['around']) === null) break;
      achadas.push({ slot: slot.name, uri: def['uri'], marker: def['around'], count: aroundCount(child, def['around']) });
      break;
    }
  }
  const linha = (a: typeof achadas[number], side: 'frente' | 'atras'): AroundLine => {
    const nome = entityShortName(a.uri);
    const n = a.count === null ? null : (side === 'frente' ? a.count.front : a.count.behind);
    const onde = side === 'frente' ? 'na frente' : 'atrás';
    return {
      slot: a.slot, side, count: n,
      text: `${nome} · ${onde}${n === null ? '' : ` (${n})`}`,
      hint: `Este boneco: ${n === null ? 'as peças' : `${n} peça(s)`} de ${nome} ${side === 'frente' ? 'na frente' : 'atrás'} do boneco inteiro. `
        + `O meio é "${a.marker}". A ordem delas é a da própria entidade: não se arrastam aqui. `
        + 'O número é o da base da entidade; uma chave de ordem dela pode mudá-lo no meio da animação',
    };
  };
  // Rodada 13 (fecho da v27.6): a linha de ZERO peças ("espada · na frente
  // (0)") não mostra nada e só ocupa lugar: sai. A de número desconhecido
  // (a entidade ainda não aberta) fica, porque ali pode haver peças.
  return {
    frente: [...achadas].reverse().map((a) => linha(a, 'frente')).filter((l) => l.count !== 0),
    atras: achadas.map((a) => linha(a, 'atras')).filter((l) => l.count !== 0),
  };
}

function formatSeconds(t: number): string {
  return `${t.toFixed(2).replace('.', ',')} s`;
}
