/**
 * **As tomadas** — 05/11/2026, o pedido do Humberto pelo Diretor: *"isso é
 * como TOMADAS que vão se encaixando. Isso deveria ser claro."* O desenho está
 * em `documentos/projeto do programa/noite/tomadas-o-desenho.md`.
 *
 * Uma **tomada** é um lugar num osso onde uma peça entra. Uma **peça
 * encaixada** é outro projeto (`.bone`) dentro dela: a espada na mão, o herói
 * na cabine do mecha. O formato não muda (regra 7):
 *
 *   - tomada com peça = slot com anexo `skeleton` (7.11);
 *   - tomada vazia    = slot sem imagem nenhuma, em pele nenhuma — um slot
 *     assim não serve para outra coisa, e não precisa de campo novo.
 *
 * As duas direções são o mesmo gesto: o herói SEGURA a espada (a tomada da mão
 * recebe `espada.bone`) e o herói ENTRA NO mecha (a tomada da cabine, no
 * projeto do mecha, recebe `heroi.bone`).
 *
 * Este arquivo é a conta e os comandos. Não desenha nada.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';

// ---------------------------------------------------------------------------
// As palavras da tela
// ---------------------------------------------------------------------------

/** As palavras da pessoa. O nome técnico vai só na dica, depois. */
export const PALAVRAS = Object.freeze({
  tomada: 'Tomada',
  peca: 'Peça encaixada',
  encaixar: 'Encaixar um projeto…',
  porTomada: 'Pôr uma tomada aqui…',
  tirar: 'Tirar a peça',
  mexeJunto: 'mexe junto com quem segura',
});

type Def = Record<string, unknown>;
type Skins = Array<{ name: string; attachments?: Record<string, Record<string, Def | null>> }>;

// ---------------------------------------------------------------------------
// A conta
// ---------------------------------------------------------------------------

/** Uma tomada do arquivo: o slot, o osso, e a peça (o uri), ou `null` vazia. */
export interface Tomada {
  slot: string;
  bone: string;
  /** O uri do projeto encaixado, ou `null` quando a tomada está vazia. */
  peca: string | null;
  /** O nome do anexo da peça, quando há. */
  anexo: string | null;
  /** A peça mexe junto com quem segura (`inheritAnimation`). */
  mexeJunto: boolean;
}

function skinsOf(file: BoneFile): Skins {
  return ((file as { skins?: Skins }).skins ?? []);
}

/**
 * As tomadas do arquivo, na ordem dos slots: todo slot cuja única coisa, em
 * todas as peles, é um anexo `skeleton` — ou nada.
 */
export function tomadasDe(file: BoneFile): Tomada[] {
  const out: Tomada[] = [];
  for (const slot of file.slots ?? []) {
    let peca: string | null = null;
    let anexo: string | null = null;
    let mexeJunto = false;
    let outra = false;
    for (const skin of skinsOf(file)) {
      for (const [nome, def] of Object.entries(skin.attachments?.[slot.name] ?? {})) {
        if (def === null || typeof def !== 'object') continue;
        if (def['type'] !== 'skeleton') { outra = true; continue; }
        if (peca === null || nome === slot.attachment) {
          peca = typeof def['uri'] === 'string' ? def['uri'] as string : null;
          anexo = nome;
          mexeJunto = def['inheritAnimation'] === true;
        }
      }
    }
    if (outra) continue;
    out.push({ slot: slot.name, bone: slot.bone, peca, anexo, mexeJunto });
  }
  return out;
}

/** As tomadas de um osso. */
export function tomadasDoOsso(file: BoneFile, bone: string): Tomada[] {
  return tomadasDe(file).filter((t) => t.bone === bone);
}

/** O nome de uma tomada nova num osso: `tomada_mao`, sem repetir slot. */
export function nomeDeTomada(file: BoneFile, bone: string, pedido = ''): string {
  const limpo = pedido.trim().replace(/\s+/g, '_');
  return uniqueName(limpo.length > 0 ? limpo : `tomada_${bone}`, (file.slots ?? []).map((s) => s.name));
}

/** O nome que se lê de uma peça: `espada.bone` → `espada`. */
export function nomeDaPeca(uri: string): string {
  return (uri.split(/[\\/]/).pop() ?? uri).replace(/\.bone[bz]?$/i, '');
}

/** A dica do ícone da tomada na cena: o nome, o que segura, e o gesto. */
export function dicaDaTomada(t: Tomada): string {
  return t.peca === null
    ? `Tomada ${t.slot}, vazia, no osso ${t.bone}. Clique: ${PALAVRAS.encaixar}`
    : `Tomada ${t.slot}: segura ${nomeDaPeca(t.peca)}. Clique: trocar ou tirar a peça (slot com anexo skeleton, 7.11)`;
}

// ---------------------------------------------------------------------------
// Os comandos
// ---------------------------------------------------------------------------

/** **Pôr uma tomada aqui**: um slot vazio no osso, no fim da ordem de desenho. */
export class PutSocket implements Command {
  readonly label = 'Pôr uma tomada';
  readonly kind: ChangeKind = 'structure';
  private feito = false;
  constructor(readonly bone: string, readonly name: string) {}
  apply(doc: EditorDoc): void {
    const slots = doc.file.slots ?? (doc.file.slots = []);
    if (slots.some((s) => s.name === this.name)) return;
    slots.push({ name: this.name, bone: this.bone });
    this.feito = true;
  }
  revert(doc: EditorDoc): void {
    if (!this.feito) return;
    const slots = doc.file.slots ?? [];
    const at = slots.findIndex((s) => s.name === this.name);
    if (at >= 0) slots.splice(at, 1);
    this.feito = false;
  }
}

/**
 * **Encaixar um projeto** na tomada: o anexo `skeleton` na pele `default`, e o
 * slot mostrando-o. Já nasce mexendo junto com quem segura (`inheritAnimation`)
 * — o herói ataca, a espada ataca; `toca` é a animação dela quando quem segura
 * toca uma que ela não tem. Uma peça que já estava ali sai (trocar). `revert`
 * devolve o mapa do slot e o `attachment` exatamente como eram.
 */
export class PlugIntoSocket implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  private antes: { map: string | null; attachment: string | undefined; madeSkin: boolean } | null = null;
  readonly anexo: string;
  constructor(
    readonly slot: string, readonly uri: string, readonly toca: string | null,
    /** O giro do anexo: a peça nasce em pé no mundo, mesmo num osso girado (como o arrasto da prateleira). */
    readonly rotation = 0,
  ) {
    this.anexo = nomeDaPeca(uri);
    this.label = `Encaixar ${this.anexo}`;
  }
  apply(doc: EditorDoc): void {
    const file = doc.file;
    const slot = (file.slots ?? []).find((s) => s.name === this.slot);
    if (slot === undefined) return;
    const skins = (file.skins ?? (file.skins = [])) as unknown as Skins;
    let skin = skins.find((s) => s.name === 'default');
    const madeSkin = skin === undefined;
    if (skin === undefined) {
      skin = { name: 'default', attachments: {} };
      skins.unshift(skin);
    }
    const attachments = skin.attachments ?? (skin.attachments = {});
    this.antes = {
      map: attachments[this.slot] === undefined ? null : JSON.stringify(attachments[this.slot]),
      attachment: slot.attachment ?? undefined,
      madeSkin,
    };
    attachments[this.slot] = {
      [this.anexo]: {
        type: 'skeleton', uri: this.uri, x: 0, y: 0,
        ...(Math.abs(this.rotation) < 1e-6 ? {} : { rotation: Math.round(this.rotation * 1e4) / 1e4 }),
        inheritAnimation: true,
        ...(this.toca === null ? {} : { animation: this.toca }),
      },
    };
    slot.attachment = this.anexo;
  }
  revert(doc: EditorDoc): void {
    const antes = this.antes;
    if (antes === null) return;
    const file = doc.file;
    const skins = (file.skins ?? []) as unknown as Skins;
    const at = skins.findIndex((s) => s.name === 'default');
    if (antes.madeSkin && at >= 0) skins.splice(at, 1);
    else if (at >= 0) {
      const attachments = skins[at]!.attachments ?? {};
      if (antes.map === null) delete attachments[this.slot];
      else attachments[this.slot] = JSON.parse(antes.map) as Record<string, Def | null>;
    }
    const slot = (file.slots ?? []).find((s) => s.name === this.slot);
    if (slot !== undefined) {
      if (antes.attachment === undefined) delete slot.attachment;
      else slot.attachment = antes.attachment;
    }
    this.antes = null;
  }
}

/** **Tirar a peça**: a tomada fica vazia, e continua lá. */
export class UnplugSocket implements Command {
  readonly label = 'Tirar a peça';
  readonly kind: ChangeKind = 'structure';
  private antes: { maps: Array<[number, string]>; attachment: string | undefined } | null = null;
  constructor(readonly slot: string) {}
  apply(doc: EditorDoc): void {
    const file = doc.file;
    const slot = (file.slots ?? []).find((s) => s.name === this.slot);
    if (slot === undefined) return;
    const skins = (file.skins ?? []) as unknown as Skins;
    const maps: Array<[number, string]> = [];
    skins.forEach((skin, i) => {
      const map = skin.attachments?.[this.slot];
      if (map === undefined) return;
      maps.push([i, JSON.stringify(map)]);
      delete skin.attachments![this.slot];
    });
    this.antes = { maps, attachment: slot.attachment ?? undefined };
    delete slot.attachment;
  }
  revert(doc: EditorDoc): void {
    const antes = this.antes;
    if (antes === null) return;
    const skins = (doc.file.skins ?? []) as unknown as Skins;
    for (const [i, json] of antes.maps) {
      const skin = skins[i];
      if (skin === undefined) continue;
      (skin.attachments ?? (skin.attachments = {}))[this.slot] = JSON.parse(json) as Record<string, Def | null>;
    }
    const slot = (doc.file.slots ?? []).find((s) => s.name === this.slot);
    if (slot !== undefined && antes.attachment !== undefined) slot.attachment = antes.attachment;
    this.antes = null;
  }
}

/** Vários passos num passo de desfazer: pôr a tomada e encaixar. */
export class Passos implements Command {
  readonly kind: ChangeKind = 'structure';
  constructor(readonly label: string, private readonly passos: readonly Command[]) {}
  apply(doc: EditorDoc): void { for (const p of this.passos) p.apply(doc); }
  revert(doc: EditorDoc): void { for (let i = this.passos.length - 1; i >= 0; i--) this.passos[i]!.revert(doc); }
}

/** A frase do rodapé depois de encaixar. */
export function encaixouDiz(peca: string, slot: string, nova: boolean): string {
  return `Encaixei ${nomeDaPeca(peca)} na tomada ${slot}${nova ? ' (tomada nova)' : ''}. `
    + 'A peça mexe junto com quem segura: isso muda na aba Tomadas, no cartão dela';
}
