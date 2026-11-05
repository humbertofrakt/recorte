/**
 * **A aba Entidades como árvore de cartões** — rodada 39, lote 1 (06/10/2026).
 * Plano: `documentos/projeto do programa/22 A ABA DAS ENTIDADES - o plano`.
 *
 * O Humberto pensa em **encaixe**: caixa dentro de caixa, sem fio. Uma linha
 * de slot **contém** o cartão que está nela, e quem está dentro de quem se lê
 * de cima para baixo.
 *
 * | Cartão | O que é |
 * |:---|:---|
 * | **aqui** | o projeto aberto: é ele que se anima na linha do tempo. Há um só |
 * | **projeto** | uma entidade gravada num slot de quem a contém (anexo `skeleton`, spec 7.11) |
 * | **em volta** | a base de onde a entidade aberta por dentro saiu (a cena montada, rodada 8b) |
 * | **teste** | lote 2: uma entidade posta num slot **em teste**. Mora no `manifest.json`, nunca no `.bone` |
 *
 * Que linhas de slot aparecem: as **marcadas** (rodada 9), as que **já têm**
 * uma entidade, e as que têm teste. As outras imagens viram uma linha só,
 * *"+ N outras imagens"*, que abre todas: qualquer imagem pode receber (regra
 * 1 do `02`), sem encher a aba.
 *
 * O slot marcado é **transparente**: por dentro ele é uma base (`<nome>.bone`)
 * com a imagem dentro. A linha mostra o que está dentro dessa base, e não a
 * base — para ele, o slot é o lugar, e a base é o jeito de o lugar ter nome.
 *
 * **Lote 2: a ligação de teste.** Arrastar uma entidade da prateleira para a
 * linha de um slot do cartão AQUI põe a peça ali em teste: borda tracejada, a
 * palavra TESTE. A conta da montagem está em `doc/montagem.ts`; a Prévia
 * desenha o boneco com ela (`dataWithMontagem`).
 *
 * Nada de DOM (regra 8).
 */

import { loadSkeletonData, parseBoneText } from '../../../runtime/src/index.js';
import { Skeleton } from '../../../runtime/src/index.js';
import type { BoneFile, Matrix2x3, SkeletonData } from '../../../runtime/src/index.js';
import { composeMatrix, invertMatrix, multiplyMatrix } from '../../../runtime/src/math.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { corpoDe, skeletonsDe, wentToBase } from '../contract.js';
import { DropEntityAsSlot } from '../doc/drop-entity.js';
import { SetEntityAround } from '../anim/entity-around.js';
import { entityShortName, entitySlots } from '../anim/entity-band.js';
import { garantirAninhado, projetoDe } from '../doc/projeto.js';
import { devolverFoto, fotografar } from './tomadas-model.js';
import { entityFileText } from '../doc/entity-files.js';
import {
  SetMontagem, cadeiaAcima, comAcima, comEscolhaBaixo, comEscolhaCima, comLigacao, comNaCena, ligacaoEm, ligacaoMovida,
  ligacoesDe, montagemDe, semAcima, semLigacao,
} from '../doc/montagem.js';
import type { Acima, Escolha, Ligacao, Montagem } from '../doc/montagem.js';
import { SwapForEntity } from './image-picker-model.js';
import { panView } from '../viewport/view-center.js';
import { shownOfSelection, slotMarkOf } from './slot-base-model.js';

/** Quantos níveis a árvore desce (spec 7.11: a profundidade de aninhamento é 8). */
export const MAX_NIVEIS = 8;

/** O papel do cartão na árvore. */
export type CardRole = 'aqui' | 'projeto' | 'em-volta' | 'teste';

/** Por que um cartão parou de descer. */
export type CardCut = 'volta' | 'fundo' | null;

/** Um cartão: uma entidade (ou o projeto aberto) e os slots dela. */
export interface EntityCard {
  /** O uri do arquivo, como o anexo `skeleton` o escreve. */
  uri: string;
  /** O nome que se lê. */
  nome: string;
  papel: CardRole;
  /**
   * O que a peça toca, como está no anexo: o nome da animação, `''` = a mesma
   * de quem a recebe (`inheritAnimation`), ou `null` = livre, o jogo escolhe.
   * Sem sentido no cartão **aqui** e no **em volta**: lá fica `null`.
   */
  anima: string | null;
  /** "Este boneco" (o campo `around`): o slot dela que marca o meio, ou `null`. */
  emVolta: string | null;
  /** `false` quando o esqueleto dela não está carregado: não se sabe o que tem dentro. */
  carregada: boolean;
  /** As linhas de slot à vista. */
  linhas: SlotLine[];
  /** Os outros slots, que não estão à vista ("+ N outras imagens"). Só no cartão **aqui**. */
  outras: number;
  /** A árvore parou aqui: `volta` (ciclo) ou `fundo` (mais de 8 níveis). */
  corte: CardCut;
  /** A ligação de teste deste cartão (lote 2), ou `null` para os outros papéis. */
  ligacao: Ligacao | null;
  /** A ligação PARA CIMA deste cartão (lote 4): ele está em volta de quem está dentro dele. */
  acima: Acima | null;
  /**
   * **Onde se escolhe o que ele toca e as skins** — lote 6. A peça de teste
   * (para baixo), o de fora (para cima), ou a peça gravada direto num slot do
   * AQUI (a faixa dela). `null`: o cartão não tem o que escolher aqui.
   */
  alvo: CardTarget | null;
  /** As animações que a entidade tem, para o "anima ▾". Vazio sem o esqueleto. */
  animacoes: string[];
  /** As skins que a entidade tem, sem a `default`, para o "skins ▾". */
  skinsDela: string[];
  /** As skins de teste ligadas nela (lote 6). */
  skins: string[];
  /** A mesma entidade mais de uma vez no AQUI: "espada 1 de 3". `null` = uma só. */
  vez: { n: number; de: number } | null;
  /** Lote 6: quantos slots iguais a este o AQUI tem ("Trocar todas as iguais (N)"); 0 = o botão não aparece. */
  iguais: number;
  /** A animação aberta de quem recebe, para o "a de quem recebe" dizer quando ela não tem. */
  paiToca: string | null;
}

/** Onde mora a escolha de um cartão — lote 6. */
export type CardTarget =
  | { kind: 'baixo'; host: string; slot: string; uri: string }
  | { kind: 'cima'; uri: string }
  | { kind: 'projeto'; slot: string; uri: string };

/** Uma linha de slot dentro de um cartão. */
export interface SlotLine {
  /** O nome do slot, como está no arquivo. */
  slot: string;
  /** Slot marcado (rodada 9): virou base, e tem nome e animações próprias. */
  marcado: boolean;
  /** Os cartões que estão neste slot. Vazio = só a imagem. */
  cartoes: EntityCard[];
  /** Slot marcado cuja base o editor não carregou: não se sabe o que tem dentro. */
  semArquivo: boolean;
  /** O slot não mostra nada na pose de repouso: não há imagem para a peça tomar o lugar. */
  vazio: boolean;
  /**
   * O arquivo que receberia uma peça solta nesta linha, em teste (lote 2), ou
   * `null` quando a linha não aceita: só as linhas do cartão AQUI aceitam.
   */
  host: string | null;
  /**
   * Lote 7: o slot da peça de teste **não existe mais** no arquivo (a imagem
   * foi apagada). A peça fica nesta linha, no topo do cartão, com Desligar:
   * nunca some calada (plano `22`, §6).
   */
  semLugar: boolean;
}

/** A árvore inteira: o cartão de fora. A prateleira vem de `palette-entities-model`. */
export interface CardTree {
  topo: EntityCard;
}

/** As opções da árvore. */
export interface TreeOptions {
  /** `true` = toda imagem do AQUI vira uma linha, para receber uma peça. */
  todas?: boolean;
}

type Def = Record<string, unknown>;
type SkinsFile = { skins?: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> };

/** Um anexo `skeleton`, lido do arquivo ou do esqueleto montado. */
interface Placed {
  slot: string;
  uri: string;
  anima: string | null;
  emVolta: string | null;
  marcado: boolean;
  child: SkeletonData | null;
}

/** O esqueleto montado de um uri: aninhado, de um corpo, ou guardado. */
function dataOf(doc: EditorDoc, uri: string): SkeletonData | null {
  const nested = skeletonsDe(doc).get(uri);
  if (nested !== undefined) return nested;
  const projeto = projetoDe(doc);
  return projeto?.docOf(uri)?.data ?? projeto?.guardados.get(uri)?.data ?? null;
}

function animaOf(animation: string | null, inherit: boolean): string | null {
  if (inherit) return '';
  return animation;
}

/** Os anexos `skeleton` de um arquivo, na ordem dos slots. */
function placedInFile(doc: EditorDoc, file: BoneFile): Placed[] {
  const out: Placed[] = [];
  const seen = new Set<string>();
  for (const entity of entitySlots(file)) {
    if (entity.uri === '') continue;
    const id = `${entity.slot}|${entity.uri}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const def = (file as SkinsFile).skins?.find((s) => s.name === entity.skin)?.attachments?.[entity.slot]?.[entity.attachment] as Def | undefined;
    const around = typeof def?.['around'] === 'string' ? def['around'] as string : null;
    out.push({
      slot: entity.slot,
      uri: entity.uri,
      anima: animaOf(entity.animation, entity.inheritAnimation),
      emVolta: around,
      marcado: slotMarkOf(def ?? null) !== null,
      child: dataOf(doc, entity.uri),
    });
  }
  return out;
}

/** Os anexos `skeleton` de um esqueleto montado, na ordem dos slots. */
function placedInData(doc: EditorDoc, data: SkeletonData): Placed[] {
  const out: Placed[] = [];
  const seen = new Set<string>();
  for (const slot of data.slots) {
    for (const skin of data.skins) {
      const porNome = skin.attachments.get(slot.index);
      if (porNome === undefined) continue;
      for (const att of porNome.values()) {
        const sk = att as { type?: string; resolvedUri?: string; uri?: string; child?: SkeletonData | null;
          animation?: string | null; inheritAnimation?: boolean; around?: string | null } | null;
        if (sk === null || sk.type !== 'skeleton') continue;
        const uri = sk.resolvedUri ?? sk.uri ?? '';
        if (uri === '') continue;
        const id = `${slot.name}|${uri}`;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({
          slot: slot.name,
          uri,
          anima: animaOf(sk.animation ?? null, sk.inheritAnimation === true),
          emVolta: sk.around ?? null,
          marcado: false,
          child: sk.child ?? dataOf(doc, uri),
        });
      }
    }
  }
  return out;
}

/**
 * O nome do cartão: o do arquivo, sem a pasta e sem a extensão — o mesmo que
 * a prateleira e a lista de Bases escrevem, para a peça se reconhecer.
 */
function nomeDe(uri: string): string {
  return entityShortName(uri);
}

function novaLinha(slot: string): SlotLine {
  return { slot, marcado: false, cartoes: [], semArquivo: false, vazio: false, host: null, semLugar: false };
}

/** Agrupa os anexos por slot, na ordem em que aparecem, e desce em cada um. */
function linesOf(doc: EditorDoc, placed: readonly Placed[], chain: readonly string[]): SlotLine[] {
  const lines = new Map<string, SlotLine>();
  for (const p of placed) {
    let line = lines.get(p.slot);
    if (line === undefined) {
      line = novaLinha(p.slot);
      lines.set(p.slot, line);
    }
    if (p.marcado) {
      // O slot marcado é transparente: a linha mostra o que está DENTRO da
      // base dele, e não a base.
      line.marcado = true;
      if (p.child === null) {
        line.semArquivo = true;
        continue;
      }
      if (chain.includes(p.uri) || chain.length >= MAX_NIVEIS) continue;
      for (const inner of placedInData(doc, p.child)) {
        line.cartoes.push(cardOf(doc, inner, [...chain, p.uri]));
      }
      continue;
    }
    line.cartoes.push(cardOf(doc, p, chain));
  }
  return [...lines.values()];
}

/** O cartão de uma entidade gravada num slot, e o que está dentro dela. */
function cardOf(doc: EditorDoc, p: Placed, chain: readonly string[]): EntityCard {
  const card: EntityCard = {
    uri: p.uri,
    nome: nomeDe(p.uri),
    papel: 'projeto',
    anima: p.anima,
    emVolta: p.emVolta,
    carregada: p.child !== null,
    linhas: [],
    outras: 0,
    corte: null,
    ligacao: null,
    acima: null,
    alvo: null,
    animacoes: p.child === null ? [] : p.child.animations.map((a) => a.name),
    skinsDela: skinsOf(p.child),
    skins: [],
    vez: null,
    iguais: 0,
    paiToca: null,
  };
  if (chain.includes(p.uri)) {
    card.corte = 'volta';
    return card;
  }
  if (chain.length >= MAX_NIVEIS) {
    card.corte = 'fundo';
    return card;
  }
  if (p.child !== null) card.linhas = linesOf(doc, placedInData(doc, p.child), [...chain, p.uri]);
  return card;
}

/** As skins de um esqueleto, sem a `default` (a que sempre está por baixo). */
function skinsOf(data: SkeletonData | null): string[] {
  return data === null ? [] : data.skins.map((s) => s.name).filter((n) => n !== 'default');
}

/** O cartão de uma ligação de teste, e o que está dentro da entidade. */
function testCard(doc: EditorDoc, ligacao: Ligacao, chain: readonly string[]): EntityCard {
  const child = dataOf(doc, ligacao.uri);
  const card = cardOf(doc, { slot: ligacao.slot, uri: ligacao.uri, anima: null, emVolta: null, marcado: false, child }, chain);
  return {
    ...card, papel: 'teste', ligacao: { ...ligacao },
    // Lote 6: na peça de teste, `null` é parada (a pose de repouso).
    anima: ligacao.anima ?? null,
    skins: [...(ligacao.skins ?? [])],
    alvo: { kind: 'baixo', host: ligacao.host, slot: ligacao.slot, uri: ligacao.uri },
    paiToca: doc.animation,
  };
}

/** Quantos slots do arquivo não estão à vista. */
function otherSlots(file: BoneFile, shown: ReadonlySet<string>): number {
  let n = 0;
  for (const slot of file.slots ?? []) if (!shown.has(slot.name)) n++;
  return n;
}

/**
 * As linhas de um cartão que recebe: as do arquivo, as de teste, e — com
 * `todas` — uma por slot, na ordem dos slots. `host` vai nas linhas que
 * aceitam o soltar.
 */
function hostLines(
  doc: EditorDoc, file: BoneFile, uri: string, montagem: Montagem, chain: readonly string[],
  skipSlot: string | null, todas: boolean, aceita: boolean,
): SlotLine[] {
  const lines = new Map<string, SlotLine>();
  for (const line of linesOf(doc, placedInFile(doc, file).filter((p) => p.slot !== skipSlot), chain)) {
    lines.set(line.slot, line);
  }
  const semLugar: SlotLine[] = [];
  for (const ligacao of ligacoesDe(montagem, uri)) {
    if (ligacao.slot === skipSlot) continue;
    if (!(file.slots ?? []).some((s) => s.name === ligacao.slot)) {
      // Lote 7: o slot sumiu. A peça vai para "sem lugar", no topo, e diz.
      semLugar.push({ ...novaLinha(ligacao.slot), semLugar: true, vazio: true, cartoes: [testCard(doc, ligacao, chain)] });
      continue;
    }
    const line = lines.get(ligacao.slot) ?? novaLinha(ligacao.slot);
    line.cartoes.push(testCard(doc, ligacao, chain));
    lines.set(ligacao.slot, line);
  }
  if (todas) {
    for (const slot of file.slots ?? []) {
      if (slot.name === skipSlot || lines.has(slot.name)) continue;
      lines.set(slot.name, novaLinha(slot.name));
    }
  }
  const ordem = (file.slots ?? []).map((s) => s.name);
  const out = [...lines.values()].sort((a, b) => ordem.indexOf(a.slot) - ordem.indexOf(b.slot));
  for (const line of out) {
    const def = (file.slots ?? []).find((s) => s.name === line.slot);
    line.vazio = def === undefined || drawingOfSlot(file, line.slot) === null;
    if (aceita) line.host = uri;
  }
  for (const line of semLugar) if (aceita) line.host = uri;
  return [...semLugar, ...out];
}

/** O uri e o nome do projeto aberto. */
function openProject(doc: EditorDoc): { uri: string; nome: string } {
  const projeto = projetoDe(doc);
  if (projeto !== null) return { uri: projeto.emFocoUri, nome: projeto.nameOf(projeto.emFocoUri) };
  const name = doc.file.skeleton?.name;
  const uri = doc.path ?? (typeof name === 'string' && name.length > 0 ? name : 'sem nome');
  return { uri, nome: typeof name === 'string' && name.length > 0 ? name : entityShortName(uri) };
}

/** O cartão do projeto aberto: moldura dupla, AQUI. */
function hereCard(doc: EditorDoc, montagem: Montagem, todas: boolean): EntityCard {
  const { uri, nome } = openProject(doc);
  const file = corpoDe(doc).file;
  const linhas = hostLines(doc, file, uri, montagem, [uri], null, todas, true);
  // Lote 6: a peça gravada direto num slot do AQUI escolhe o que toca pela faixa.
  for (const line of linhas) {
    if (line.marcado) continue;
    for (const card of line.cartoes) {
      if (card.papel === 'projeto') card.alvo = { kind: 'projeto', slot: line.slot, uri: card.uri };
      if (card.papel === 'projeto') card.paiToca = doc.animation;
    }
  }
  // A mesma entidade mais de uma vez: "espada 1 de 3", na ordem da aba.
  const diretos = linhas.filter((l) => !l.marcado).flatMap((l) => l.cartoes);
  for (const card of diretos) {
    const iguais = diretos.filter((c) => c.uri === card.uri);
    if (iguais.length > 1) card.vez = { n: iguais.indexOf(card) + 1, de: iguais.length };
  }
  // As rodas: a peça de teste num slot que tem iguais mostra "Trocar todas as iguais (N)".
  for (const card of diretos) {
    if (card.papel !== 'teste' || card.ligacao === null) continue;
    const slots = equalSlots(doc, uri, card.ligacao.slot);
    const faltam = slots.filter((sl) => ligacaoEm(montagem, uri, sl)?.uri !== card.uri);
    card.iguais = slots.length >= 2 && faltam.length > 0 ? slots.length : 0;
  }
  return {
    uri, nome, papel: 'aqui', anima: null, emVolta: null, carregada: true,
    linhas, outras: otherSlots(file, new Set(linhas.map((l) => l.slot))), corte: null, ligacao: null, acima: null,
    alvo: null, animacoes: [], skinsDela: [], skins: [], vez: null, iguais: 0, paiToca: null,
  };
}

/**
 * **A árvore de agora.** O cartão de fora fica no topo.
 *
 * Fora da cena montada, o topo é o projeto aberto. Animando uma entidade por
 * dentro (rodada 8b), o topo é a base de onde ela saiu, e o projeto aberto
 * está na linha do slot dela — é a mesma conta que a cena desenha.
 */
export function cardTree(doc: EditorDoc, options: TreeOptions = {}): CardTree {
  const montagem = montagemDe(doc);
  const aqui = hereCard(doc, montagem, options.todas === true);
  const projeto = projetoDe(doc);
  const cena = projeto?.cenaMontada ?? null;
  const host = cena === null || projeto === null || projeto.emFocoUri !== cena.entity ? null : projeto.docOf(cena.host);
  if (cena === null || projeto === null || host === null) return { topo: wrapUp(doc, montagem, aqui) };
  const linhas = hostLines(doc, host.file, cena.host, montagem, [cena.host, aqui.uri], cena.slot, false, false);
  const minha: SlotLine = { ...novaLinha(cena.slot), cartoes: [aqui] };
  // A linha do slot de onde se abriu fica no lugar dela, na ordem dos slots.
  const ordem = (host.file.slots ?? []).map((s) => s.name);
  const juntas = [...linhas, minha].sort((a, b) => ordem.indexOf(a.slot) - ordem.indexOf(b.slot));
  return {
    topo: {
      uri: cena.host, nome: projeto.nameOf(cena.host), papel: 'em-volta', anima: null, emVolta: null,
      carregada: true, linhas: juntas, outras: 0, corte: null, ligacao: null, acima: null,
      alvo: null, animacoes: [], skinsDela: [], skins: [], vez: null, iguais: 0, paiToca: null,
    },
  };
}

// ---------------------------------------------------------------------------
// O que cada peça diz
// ---------------------------------------------------------------------------

/** A palavra no canto do cartão. Três sinais, nunca só a cor: a borda, a palavra, a cor. */
export function cardTag(card: EntityCard): string {
  if (card.papel === 'aqui') return 'aqui';
  if (card.papel === 'em-volta') return 'em volta';
  if (card.papel === 'teste') return 'teste';
  return 'projeto';
}

/**
 * Lote 7: a linha do cartão cuja entidade sumiu do disco — *"falta o
 * arquivo"* (plano `22`, §6). O cartão fica, e a ligação também. `null` com
 * o arquivo à mão. Numa linha própria: na palavra do canto, comia o nome.
 */
export function cardMissing(card: EntityCard): string | null {
  return card.carregada || card.papel === 'aqui' || card.papel === 'em-volta' ? null : 'falta o arquivo';
}

/** O texto curto do que a peça toca, ou `null` quando o cartão não tem essa linha. */
export function cardAnima(card: EntityCard): string | null {
  // Lote 6: a peça de teste escolhe o que toca; sem escolha, parada (a pose de repouso).
  if (card.papel === 'teste') {
    if (card.anima === null) return 'anima: parada';
    if (card.anima === '') {
      const falta = card.carregada && card.paiToca !== null && !card.animacoes.includes(card.paiToca);
      return falta ? `anima: mexe junto com quem segura — ${card.nome} não tem ${card.paiToca}: parada` : 'anima: mexe junto com quem segura';
    }
    return card.carregada && !card.animacoes.includes(card.anima)
      ? `anima: ${card.anima} — ${card.nome} não tem: parada` : `anima: ${card.anima}`;
  }
  if (card.papel !== 'projeto') return null;
  if (card.anima === null) return 'anima: livre';
  if (card.anima === '') return 'anima: mexe junto com quem segura';
  return `anima: ${card.anima}`;
}

/** A dica do cartão: o que ele é, e onde está gravado. */
export function cardHint(card: EntityCard, pai: string | null, slot: string | null): string {
  if (card.papel === 'aqui') {
    return `${card.nome}: o projeto aberto. É ele que você anima na linha do tempo`;
  }
  if (card.papel === 'em-volta') {
    return `${card.nome}: a base de onde você abriu a entidade por dentro. Ela fica à vista, parada. `
      + `Para voltar: clique numa animação de ${card.nome} na janela Animação`;
  }
  const onde = pai === null || slot === null ? '' : ` no slot ${slot} de ${pai}`;
  const falta = card.carregada ? '' : '. O esqueleto dela não está carregado: não dá para ver o que tem dentro';
  if (card.papel === 'teste' && card.acima !== null) {
    const dentro = entityShortName(card.acima.base);
    return `${card.nome}: TESTE, em volta de ${dentro} (${dentro} no slot ${card.acima.slot}). Com Na cena ligado, `
      + `a cena desenha ${card.nome} em volta, parado. ${cap(dentro)} não leva ${card.nome}: nada entra no arquivo. `
      + `Botão direito: Tirar de volta${falta}`;
  }
  if (card.papel === 'teste') {
    return `${card.nome}${onde}: TESTE (borda tracejada). Vale só na Prévia e não entra no arquivo: `
      + 'a animação não muda. Arraste para outro slot para mudar, ou para a prateleira para desligar. '
      + `Botão direito: Desligar${falta}`;
  }
  const anima = card.anima === null ? 'Ninguém escolheu a animação dela: o jogo escolhe'
    : card.anima === '' ? 'Ela toca a animação de mesmo nome de quem a recebe'
      : `Ela toca ${card.anima}`;
  const volta = card.emVolta === null ? '' : `. Fica em volta de ${pai ?? 'quem a recebe'} ("Este boneco"): o meio é o slot ${card.emVolta}`;
  const corte = card.corte === 'volta' ? `. ${card.nome} já está mais acima nesta árvore: a árvore para aqui, para não dar uma volta sem fim`
    : card.corte === 'fundo' ? `. Mais de ${MAX_NIVEIS} níveis: a árvore para aqui` : '';
  return `${card.nome}: entidade${onde}, gravada no arquivo (borda cheia, a palavra projeto). ${anima}${volta}${falta}${corte}`;
}

/** O texto da linha de slot sem cartão. */
export function emptyLineText(line: SlotLine): string {
  if (line.semArquivo) return 'falta o arquivo';
  if (line.vazio) return 'vazio';
  return line.host === null ? 'só a imagem' : 'só a imagem · solte aqui';
}

/** A dica de uma linha de slot. */
export function lineHint(line: SlotLine): string {
  if (line.semLugar) {
    const onde = line.host === null ? 'o arquivo' : entityShortName(line.host);
    return `${line.slot}: este slot não existe mais em ${onde}. A peça de teste ficou sem lugar: `
      + 'arraste-a até a linha de outro slot, ou botão direito → Desligar';
  }
  const tipo = line.marcado ? `${line.slot}: slot marcado. Ele virou uma base, com nome e animações próprias`
    : line.cartoes.length > 0 ? `${line.slot}: slot com entidade` : `${line.slot}: slot`;
  if (line.vazio) return `${tipo}. Ele não mostra nada na pose de repouso: não há imagem para a peça tomar o lugar`;
  const solte = line.host === null ? ''
    : '. Arraste uma entidade da prateleira até aqui para pô-la neste slot em teste: vale só na Prévia, o arquivo não muda';
  if (line.semArquivo) {
    return `${tipo}. O editor não carregou a base deste slot: não dá para ver o que tem dentro${solte}`;
  }
  if (line.cartoes.length === 0) return `${tipo}. Por enquanto mostra só a imagem dele${solte}`;
  return `${tipo}. O cartão dentro da linha é o que está neste slot${solte}`;
}

/** O texto da linha dos outros slots. */
export function otherLinesText(n: number): string {
  return n === 1 ? '+ 1 outra imagem' : `+ ${n} outras imagens`;
}

/** O texto da linha que esconde os outros slots de novo. */
export const HIDE_OTHERS_TEXT = '− esconder as outras imagens';

/** A dica da linha dos outros slots. */
export const OTHER_LINES_HINT =
  'Qualquer imagem pode receber uma entidade. Clique para ver todas as imagens, uma por linha, '
  + 'e arraste uma entidade da prateleira até a linha dela (teste). Para gravar no arquivo: '
  + 'botão direito na imagem, na cena: a grade troca por uma entidade';

/** A dica do título Montagem. */
export const MONTAGEM_HINT =
  'Quem está dentro de quem, de cima para baixo. O cartão dentro de uma linha está no slot daquela linha';

/** A dica do título Prateleira. */
export const PRATELEIRA_HINT =
  'As entidades do projeto. Arraste uma até a linha de um slot, na Montagem, para pô-la ali em teste; '
  + 'ou para a cena, para pendurá-la no osso em que ela cair. Solte aqui uma peça de teste para desligá-la';

/** O que a árvore mostra, em texto: o painel só se refaz quando isto muda. */
export function treeSignature(tree: CardTree): string {
  return JSON.stringify(tree.topo);
}

// ---------------------------------------------------------------------------
// Lote 2: ligar, desligar, trocar — em teste
// ---------------------------------------------------------------------------

/** As entidades que estão dentro de `uri`, descendo (para a recusa da volta sem fim). */
function descendants(doc: EditorDoc, uri: string): Set<string> {
  const out = new Set<string>();
  const walk = (data: SkeletonData | null, depth: number): void => {
    if (data === null || depth >= MAX_NIVEIS) return;
    for (const p of placedInData(doc, data)) {
      if (out.has(p.uri)) continue;
      out.add(p.uri);
      walk(p.child, depth + 1);
    }
  };
  walk(dataOf(doc, uri), 0);
  return out;
}

/**
 * **O desenho que o slot mostra**, para a peça de teste tomar o lugar: o da
 * pose de repouso, ou — no slot que só aparece por chave, como a entidade
 * pendurada com uma animação aberta (nota da conferência da v30.1) — o
 * primeiro que alguma pele tem para ele. `null` = o slot não tem desenho.
 */
export function drawingOfSlot(file: BoneFile, slot: string): string | null {
  const def = (file.slots ?? []).find((s) => s.name === slot);
  if (def === undefined) return null;
  if (typeof def.attachment === 'string' && def.attachment !== '') return def.attachment;
  for (const skin of (file as SkinsFile).skins ?? []) {
    const nomes = Object.keys(skin.attachments?.[slot] ?? {});
    if (nomes.length > 0) return nomes[0]!;
  }
  return null;
}

/** Por que a linha de um cartão de DENTRO não recebe teste. */
export function innerLineRefusal(pai: string): string {
  return `O teste vale só nos slots do projeto aberto (o cartão AQUI). Esta linha é de dentro de ${pai}: `
    + `para pôr uma peça ali, anime ${pai} por dentro`;
}

/**
 * **Por que esta peça não entra neste slot em teste**, ou `null` quando entra.
 * A recusa é dita antes de soltar (a linha fica vermelha) e no soltar (o
 * rodapé), nunca calada.
 */
export function whyCannotTest(doc: EditorDoc, host: string, slot: string, uri: string): string | null {
  const estrutura = whyCannotHold(doc, host, slot, uri);
  if (estrutura !== null) return estrutura;
  const nome = entityShortName(uri);
  // Nota b do doc 34: soltar a peça onde ela JÁ está não fazia nada, calado.
  if (ligacaoEm(montagemDe(doc), host, slot)?.uri === uri) {
    return `${cap(nome)} já está no slot ${slot}, em teste: arraste outra entidade`;
  }
  if (host === openProject(doc).uri && placedInFile(doc, corpoDe(doc).file).some((p) => p.slot === slot && p.uri === uri)) {
    return `${cap(nome)} já está no slot ${slot}, gravada no arquivo: arraste outra entidade`;
  }
  return null;
}

/**
 * **O slot pode ter esta peça?** — só a estrutura: o slot existe, tem
 * desenho, e não há volta sem fim. É o que a cópia da Prévia e da cena
 * confere em cada ligação que já existe (a própria ligação não é recusa).
 */
export function whyCannotHold(doc: EditorDoc, host: string, slot: string, uri: string): string | null {
  if (projetoDe(doc) === null) return 'A montagem de teste precisa de um projeto aberto (Arquivo → Abrir pasta do projeto…)';
  const nome = entityShortName(uri);
  const hostNome = entityShortName(host);
  const file = corpoDe(doc).file;
  const def = (file.slots ?? []).find((s) => s.name === slot);
  if (def === undefined) return `${hostNome} não tem o slot ${slot}`;
  if (drawingOfSlot(file, slot) === null) {
    return `O slot ${slot} não tem desenho nenhum: não há imagem para ${nome} tomar o lugar`;
  }
  if (uri === host) return `${nome} não pode entrar nela mesma: seria uma volta sem fim`;
  if (descendants(doc, uri).has(host)) {
    return `${nome} já leva ${hostNome}. Pôr ${nome} em ${hostNome} faria uma volta sem fim`;
  }
  return null;
}

/**
 * **Por que esta linha não recebe o que está sendo arrastado**, ou `null` —
 * nota b do doc 34. `de` é o slot de onde saiu o cartão de TESTE arrastado
 * (`null` para uma entidade da prateleira): o próprio slot recusa, e a linha
 * fica vermelha já no caminho.
 */
export function whyCannotDrop(doc: EditorDoc, host: string, slot: string, uri: string, de: string | null): string | null {
  if (de === slot) {
    return `A peça de teste já está no slot ${slot}: arraste-a até a linha de outro slot, ou para a prateleira`;
  }
  return whyCannotTest(doc, host, slot, uri);
}

/** O gesto de soltar, já decidido: o comando e a frase do rodapé. */
export interface TestGesture {
  command: Command;
  frase: string;
}

function cap(texto: string): string {
  return texto.length === 0 ? texto : texto[0]!.toUpperCase() + texto.slice(1);
}

/**
 * **Soltar uma entidade da prateleira na linha de um slot.** Liga em teste;
 * se o slot já tinha teste, troca. `null` quando nada muda (a mesma peça).
 */
export function dropOnSlot(doc: EditorDoc, host: string, slot: string, uri: string): TestGesture | null {
  const montagem = montagemDe(doc);
  const antes = ligacaoEm(montagem, host, slot);
  if (antes !== null && antes.uri === uri) return null;
  const nome = cap(entityShortName(uri));
  const depois = comLigacao(montagem, { host, slot, uri });
  if (antes !== null) {
    return {
      command: new SetMontagem('Trocar a peça de teste', depois),
      frase: `${nome} no lugar de ${entityShortName(antes.uri)}, no slot ${slot}: teste. A animação não muda.`,
    };
  }
  // Nota b do doc 34: o mecha sobre o weapon cobre a espada gravada ali; o rodapé diz qual.
  const gravada = host === openProject(doc).uri
    ? placedInFile(doc, corpoDe(doc).file).find((p) => p.slot === slot && p.uri !== uri) ?? null : null;
  const cobre = gravada === null ? '' : `, por cima de ${entityShortName(gravada.uri)} (que continua no arquivo)`;
  // Lote 6: a mesma entidade outra vez no boneco — cada cópia troca separada.
  const copias = host === openProject(doc).uri ? copiesInHere(doc, uri, slot) + 1 : 1;
  const separadas = copias > 1 ? ` Agora há ${copias} cópias de ${entityShortName(uri)}, separadas.` : '';
  return {
    command: new SetMontagem('Ligar em teste', depois),
    frase: `${nome} no slot ${slot}${cobre}: teste.${separadas} A animação não muda.`,
  };
}

/** **Desligar** a peça de teste de um slot. `null` quando não há teste ali. */
export function unplug(doc: EditorDoc, host: string, slot: string): TestGesture | null {
  const montagem = montagemDe(doc);
  const antes = ligacaoEm(montagem, host, slot);
  if (antes === null) return null;
  return {
    command: new SetMontagem('Desligar o teste', semLigacao(montagem, host, slot)),
    frase: `${cap(entityShortName(antes.uri))} saiu do slot ${slot} (era teste).`,
  };
}

/** **Mudar a peça de teste de slot**, no mesmo arquivo. O teste do destino, se havia, sai. */
export function moveTest(doc: EditorDoc, host: string, de: string, para: string): TestGesture | null {
  const montagem = montagemDe(doc);
  const antes = ligacaoEm(montagem, host, de);
  if (antes === null || de === para) return null;
  const saiu = ligacaoEm(montagem, host, para);
  const nome = cap(entityShortName(antes.uri));
  return {
    command: new SetMontagem('Mudar o teste de slot', ligacaoMovida(montagem, host, de, para)),
    frase: saiu === null
      ? `${nome} passou do slot ${de} para o ${para}: teste.`
      : `${nome} passou do slot ${de} para o ${para}, no lugar de ${entityShortName(saiu.uri)}: teste.`,
  };
}

// ---------------------------------------------------------------------------
// Lote 2: o desenho com a montagem — a Prévia (e a cena, no lote 3)
// ---------------------------------------------------------------------------

/**
 * **O arquivo do projeto aberto com a montagem de teste posta**, ou `null`
 * quando não há teste nele. É uma CÓPIA: cada ligação troca a imagem do slot
 * pela entidade, pela mesma conta da grade (`SwapForEntity`: o mesmo lugar, a
 * mesma ordem, as mesmas chaves, a raiz no pivô da imagem). O documento não é
 * tocado.
 */
export function fileWithMontagem(doc: EditorDoc): BoneFile | null {
  const { uri } = openProject(doc);
  const ligacoes = ligacoesDe(montagemDe(doc), uri);
  if (ligacoes.length === 0) return null;
  const file = JSON.parse(JSON.stringify(corpoDe(doc).file)) as BoneFile;
  const copia = { file, atlases: doc.atlases } as unknown as EditorDoc;
  for (const ligacao of ligacoes) {
    if (whyCannotHold(doc, uri, ligacao.slot, ligacao.uri) !== null) continue;
    const slot = (file.slots ?? []).find((s) => s.name === ligacao.slot);
    const attachment = slot === undefined ? null : drawingOfSlot(file, slot.name);
    if (attachment === null) continue;
    const skin = (file.skins ?? []).find((s) => s.attachments?.[ligacao.slot]?.[attachment] !== undefined);
    if (skin === undefined) continue;
    new SwapForEntity(ligacao.slot, attachment, skin.name, ligacao.uri).apply(copia);
    // Lote 6: o que ela toca e as skins, pelos campos que a spec já tem (7.11).
    const def = skin.attachments?.[ligacao.slot]?.[attachment] as Def | undefined;
    if (def !== undefined) {
      if (ligacao.anima === '') def['inheritAnimation'] = true;
      else if (ligacao.anima !== undefined) def['animation'] = ligacao.anima;
      if (ligacao.skins !== undefined && ligacao.skins.length > 0) def['skins'] = [...ligacao.skins];
    }
  }
  return file;
}

/**
 * **O esqueleto montado com a montagem de teste**, ou `null` sem teste (quem
 * chama usa `doc.data`). A peça de teste cujo esqueleto não está carregado
 * fica vazia, e o leitor avisa (spec 7.11) — nunca um desenho inventado.
 */
export function dataWithMontagem(doc: EditorDoc): SkeletonData | null {
  const file = fileWithMontagem(doc);
  if (file === null) return null;
  const skeletons = new Map(skeletonsDe(doc));
  for (const ligacao of montagemDe(doc).ligacoes) {
    const data = dataOf(doc, ligacao.uri);
    if (data !== null) skeletons.set(ligacao.uri, data);
  }
  try {
    return loadSkeletonData(file as unknown, { atlases: doc.atlases, skeletons });
  } catch {
    return null;
  }
}

/** Quantas peças de teste estão no projeto aberto, para a frase da Prévia. */
export function testPieces(doc: EditorDoc): number {
  return ligacoesDe(montagemDe(doc), openProject(doc).uri).length;
}

/** A frase da Prévia quando há teste. */
export function previewMontagemText(n: number): string {
  return n === 1
    ? 'Montagem de teste à vista: 1 peça. Ela não entra na animação nem no arquivo.'
    : `Montagem de teste à vista: ${n} peças. Elas não entram na animação nem no arquivo.`;
}

// ---------------------------------------------------------------------------
// Lote 2: as portas do menu Entidades (régua 1: toda função tem porta no menu)
// ---------------------------------------------------------------------------

/** O slot da imagem escolhida na cena, no projeto aberto, ou `null`. */
export function testSlotHere(doc: EditorDoc): { host: string; slot: string } | null {
  const shown = shownOfSelection(doc);
  return shown === null ? null : { host: openProject(doc).uri, slot: shown.slot };
}

/** Por que "Pôr em teste neste slot…" não age agora, ou `null`. */
export function whyNoTestHere(doc: EditorDoc): string | null {
  if (projetoDe(doc) === null) return 'A montagem de teste precisa de um projeto aberto (Arquivo → Abrir pasta do projeto…)';
  if (testSlotHere(doc) === null) {
    return 'Escolha uma imagem na cena primeiro (clique nela), ou arraste a entidade da aba Entidades até a linha do slot';
  }
  return null;
}

/** Por que "Desligar o teste deste slot" não age agora, ou `null`. */
export function whyNoUnplugHere(doc: EditorDoc): string | null {
  const aqui = testSlotHere(doc);
  if (aqui === null) return 'Escolha na cena a imagem do slot que tem a peça de teste';
  return ligacaoEm(montagemDe(doc), aqui.host, aqui.slot) === null ? `O slot ${aqui.slot} não tem peça de teste` : null;
}

// ---------------------------------------------------------------------------
// Lote 3: Na cena ("Aparecer na linha do tempo", do `02`)
// ---------------------------------------------------------------------------

/** `true` quando a cena desenha a montagem de teste. */
export function naCena(doc: EditorDoc): boolean {
  return montagemDe(doc).naCena;
}

/** A dica do botão Na cena. */
export function naCenaHint(ligado: boolean, pecas: number): string {
  const estado = ligado ? 'Ligado: a cena desenha' : 'Desligado: só a Prévia desenha';
  const quantas = pecas === 0 ? 'Ainda não há peça de teste'
    : pecas === 1 ? 'Há 1 peça de teste' : `Há ${pecas} peças de teste`;
  return `Na cena: mostra a montagem de teste na cena enquanto você anima. ${estado} as peças de teste. `
    + `Elas não entram na animação nem no arquivo, e o clique passa por elas. ${quantas}`;
}

/** **Na cena**, liga e desliga — um passo de desfazer, e a frase. `null` sem projeto. */
export function toggleNaCena(doc: EditorDoc): TestGesture | null {
  if (projetoDe(doc) === null) return null;
  const montagem = montagemDe(doc);
  const liga = !montagem.naCena;
  return {
    command: new SetMontagem(liga ? 'Montagem na cena' : 'Montagem fora da cena', comNaCena(montagem, liga)),
    frase: liga
      ? 'A montagem de teste está na cena. Ela não entra na animação.'
      : 'A montagem de teste saiu da cena. Ela continua na aba Entidades e na Prévia.',
  };
}

/**
 * Os slots do projeto aberto que mostram uma peça de teste na cena agora, ou
 * um conjunto vazio com Na cena desligado. O clique passa por eles.
 */
export function testSlotsInScene(doc: EditorDoc): Set<string> {
  const montagem = montagemDe(doc);
  if (!montagem.naCena) return new Set();
  return new Set(ligacoesDe(montagem, openProject(doc).uri).map((l) => l.slot));
}

/**
 * A linha da linha do tempo, com Na cena ligado: *"Montagem de teste na cena:
 * espada (parada) no hair. Não entra na animação."* `null` sem nada na cena.
 */
export function montagemLineText(doc: EditorDoc): string | null {
  const montagem = montagemDe(doc);
  if (!montagem.naCena) return null;
  const pecas = ligacoesDe(montagem, openProject(doc).uri);
  const fora = cadeiaAcima(montagem, openProject(doc).uri);
  if (pecas.length === 0 && fora.length === 0) return null;
  const toca = (anima: string | undefined): string => (anima === undefined ? 'parada' : anima === '' ? 'mexe junto com quem segura' : anima);
  const lista = [
    ...pecas.map((l) => `${entityShortName(l.uri)} (${toca(l.anima)}) no ${l.slot}`),
    ...fora.map((a) => `${entityShortName(a.uri)} (${toca(a.anima)}) em volta, no ${a.slot}`),
  ].join(', ');
  return `Montagem de teste na cena: ${lista}. Não entra na animação.`;
}

// ---------------------------------------------------------------------------
// Lote 4: ligar para cima — o boneco dentro do mecha, o mecha na nave
// ---------------------------------------------------------------------------

/**
 * O `.bone` de uma entidade, para pôr alguém dentro dela: o documento guardado
 * (o que a pasta trouxe), o de uma base, ou o texto que o editor leu ao abrir.
 */
export function outerFile(doc: EditorDoc, uri: string): BoneFile | null {
  const projeto = projetoDe(doc);
  const aberto = projeto?.guardados.get(uri) ?? projeto?.docOf(uri) ?? null;
  if (aberto !== null) return aberto.file;
  const texto = entityFileText(uri);
  if (texto === null) return null;
  try {
    return parseBoneText(texto) as BoneFile;
  } catch {
    return null;
  }
}

/** Os slots de `uri` que podem receber alguém por dentro: os que têm desenho. */
export function slotsForUp(doc: EditorDoc, uri: string): string[] {
  const file = outerFile(doc, uri);
  if (file === null) return [];
  return (file.slots ?? []).map((s) => s.name).filter((name) => drawingOfSlot(file, name) !== null);
}

/** A cadeia para cima do projeto aberto, de dentro para fora. */
export function chainUp(doc: EditorDoc): Acima[] {
  return cadeiaAcima(montagemDe(doc), openProject(doc).uri);
}

/** O cartão de fora agora: o último da cadeia, ou o projeto aberto. */
export function topOfChain(doc: EditorDoc): string {
  const cadeia = chainUp(doc);
  return cadeia.length === 0 ? openProject(doc).uri : cadeia[cadeia.length - 1]!.uri;
}

/**
 * **Por que o cartão de fora não entra em `uri`** (no slot `slot`), ou `null`.
 * A volta sem fim e o fundo demais são recusados **antes**, como no Spriter
 * desde a R11 (plano `22`, §6).
 */
export function whyCannotGoUp(doc: EditorDoc, uri: string, slot: string | null): string | null {
  if (projetoDe(doc) === null) return 'A montagem de teste precisa de um projeto aberto (Arquivo → Abrir pasta do projeto…)';
  const aberto = openProject(doc).uri;
  const cadeia = chainUp(doc);
  const topo = topOfChain(doc);
  const nome = entityShortName(uri);
  const topoNome = entityShortName(topo);
  const membros = new Set<string>([aberto, ...cadeia.map((a) => a.uri)]);
  if (membros.has(uri)) return `${nome} já está nesta montagem: arraste outra entidade`;
  const dentro = descendants(doc, uri);
  if ([...membros].some((m) => dentro.has(m))) {
    return `${nome} já leva ${topoNome}. Pôr ${topoNome} dentro de ${nome} faria uma volta sem fim`;
  }
  // E o contrário: a entidade que já está DENTRO de alguém da montagem (a
  // espada na mão do herói) não pode ficar em volta dele.
  const dono = [...membros].find((m) => descendants(doc, m).has(uri));
  if (dono !== undefined) {
    return `${nome} já está dentro de ${entityShortName(dono)}. Pôr ${topoNome} dentro de ${nome} faria uma volta sem fim`;
  }
  if (cadeia.length + 2 > MAX_NIVEIS) return `Fundo demais: a montagem passaria de ${MAX_NIVEIS} níveis (spec 7.11)`;
  const file = outerFile(doc, uri);
  if (file === null) {
    return `O editor não abriu o arquivo ${uri}: não dá para ver os slots dele. Abra a pasta do projeto`;
  }
  if (slot === null) return slotsForUp(doc, uri).length === 0 ? `${nome} não tem slot com desenho para receber ${topoNome}` : null;
  if (drawingOfSlot(file, slot) === null) return `O slot ${slot} de ${nome} não tem desenho: não há lugar para ${topoNome}`;
  return null;
}

/** **Pôr o cartão de fora dentro de `uri`, no slot `slot`, em teste.** */
export function goUp(doc: EditorDoc, uri: string, slot: string): TestGesture {
  const topo = topOfChain(doc);
  const aberto = openProject(doc).uri;
  const nome = entityShortName(uri);
  const leva = topo === aberto ? '' : ` ${cap(entityShortName(aberto))} continua sendo o que você anima.`;
  return {
    command: new SetMontagem('Pôr dentro de, em teste', comAcima(montagemDe(doc), { base: topo, uri, slot })),
    frase: `${cap(entityShortName(topo))} entrou em ${nome}, no slot ${slot}: teste. `
      + `${cap(entityShortName(aberto))} não leva ${nome}.${leva}`,
  };
}

/** **Tirar `uri` de volta** — e o que estava em volta dele. `null` quando ele não está em volta. */
export function unplugUp(doc: EditorDoc, uri: string): TestGesture | null {
  const montagem = montagemDe(doc);
  const elo = montagem.acima.find((a) => a.uri === uri);
  if (elo === undefined) return null;
  return {
    command: new SetMontagem('Tirar de volta, o teste', semAcima(montagem, uri)),
    frase: `${cap(entityShortName(elo.base))} saiu de ${entityShortName(uri)} (era teste).`,
  };
}

/** Envolve o cartão AQUI com a cadeia para cima: o mais de fora fica no topo. */
function wrapUp(doc: EditorDoc, montagem: Montagem, aqui: EntityCard): EntityCard {
  const cadeia = cadeiaAcima(montagem, aqui.uri);
  let dentro = aqui;
  const vistos: string[] = [aqui.uri];
  for (const elo of cadeia) {
    const data = dataOf(doc, elo.uri);
    vistos.push(elo.uri);
    const linhas = data === null ? [] : linesOf(doc, placedInData(doc, data).filter((p) => p.slot !== elo.slot), vistos);
    const minha: SlotLine = { ...novaLinha(elo.slot), cartoes: [dentro] };
    const ordem = data === null ? [] : data.slots.map((sl) => sl.name);
    const juntas = [...linhas, minha].sort((a, b) => ordem.indexOf(a.slot) - ordem.indexOf(b.slot));
    dentro = {
      uri: elo.uri, nome: entityShortName(elo.uri), papel: 'teste', anima: elo.anima ?? null, emVolta: null,
      carregada: data !== null, linhas: juntas, outras: 0, corte: null, ligacao: null, acima: { ...elo },
      alvo: { kind: 'cima', uri: elo.uri },
      animacoes: data === null ? [] : data.animations.map((a) => a.name),
      skinsDela: skinsOf(data), skins: [...(elo.skins ?? [])], vez: null, iguais: 0, paiToca: doc.animation,
    };
  }
  return dentro;
}

// ---------------------------------------------------------------------------
// Lote 5: Pôr no projeto — o teste vira arquivo, só no arquivo aberto
// ---------------------------------------------------------------------------

/**
 * Um passo de desfazer feito de vários: gravar a peça no boneco E tirar o
 * teste. `Ctrl+Z` desfaz os dois juntos, e a ligação volta a ser teste.
 */
class PutIntoProject implements Command {
  readonly kind: ChangeKind = 'structure';
  constructor(readonly label: string, private readonly passos: readonly Command[]) {}
  apply(doc: EditorDoc): void {
    for (const passo of this.passos) passo.apply(doc);
  }
  revert(doc: EditorDoc): void {
    for (let i = this.passos.length - 1; i >= 0; i--) this.passos[i]!.revert(doc);
  }
}

/**
 * **Leva para o arquivo o que a peça tocava no teste** — rodada 42, lote 2
 * (doc 42, defeito 1). O mecha em `idle` virava *livre* ao gravar, sem aviso.
 * A spec já tem os campos (7.11): `animation` (a dela), `inheritAnimation`
 * (a de quem a recebe) e `skins`. Nenhum campo novo. `revert` devolve o anexo
 * como estava, campo a campo.
 */
class KeepTestChoice implements Command {
  readonly label = 'Levar o que a peça toca';
  readonly kind: ChangeKind = 'structure';
  private antes: Array<[string, unknown]> | null = null;
  constructor(
    private readonly skin: string,
    private readonly slot: string,
    private readonly nome: string,
    private readonly escolha: Escolha,
  ) {}
  private def(doc: EditorDoc): Def | null {
    const achado = (doc.file.skins ?? []).find((s) => s.name === this.skin)?.attachments?.[this.slot]?.[this.nome];
    return achado === undefined || achado === null || typeof achado !== 'object' ? null : achado as unknown as Def;
  }
  apply(doc: EditorDoc): void {
    const def = this.def(doc);
    if (def === null) return;
    // 05/11/2026: a foto inteira, na ordem — a volta repõe os campos onde estavam.
    this.antes = fotografar(def);
    delete def['animation'];
    delete def['inheritAnimation'];
    if (this.escolha.anima === '') def['inheritAnimation'] = true;
    else if (this.escolha.anima !== undefined) def['animation'] = this.escolha.anima;
    if (this.escolha.skins !== undefined && this.escolha.skins.length > 0) def['skins'] = [...this.escolha.skins];
  }
  revert(doc: EditorDoc): void {
    const def = this.def(doc);
    if (def === null || this.antes === null) return;
    devolverFoto(def, this.antes);
    this.antes = null;
  }
}

/** A frase do que foi junto: "Mecha continua tocando idle." — ou nada, se ela estava parada. */
function keptChoiceSays(uri: string, escolha: Escolha): string {
  const nome = cap(entityShortName(uri));
  const toca = escolha.anima === undefined ? ''
    : escolha.anima === '' ? ` ${nome} continua tocando a animação de quem a recebe.`
      : ` ${nome} continua tocando ${escolha.anima}.`;
  const skins = escolha.skins !== undefined && escolha.skins.length > 0 ? ` Skins junto: ${escolha.skins.join(', ')}.` : '';
  return toca + skins;
}

/**
 * Anda a vista junto com o boneco que sai da âncora (doc 36). Não toca no
 * arquivo; `revert` anda de volta, para o `Ctrl+Z` também não pular.
 */
class PanWithAnchor implements Command {
  readonly label = 'Andar a vista';
  readonly kind: ChangeKind = 'transform';
  constructor(private readonly dx: number, private readonly dy: number) {}
  apply(): void {
    panView(this.dx, this.dy);
  }
  revert(): void {
    panView(-this.dx, -this.dy);
  }
}

/** Uma ligação de teste que pode ir para o projeto: para baixo, ou para cima (o primeiro de fora). */
export type TestLink =
  | { kind: 'baixo'; ligacao: Ligacao }
  | { kind: 'cima'; elo: Acima };

/** As ligações de teste do projeto aberto, na ordem da aba: para baixo, depois para cima. */
export function testLinks(doc: EditorDoc): TestLink[] {
  const aberto = openProject(doc).uri;
  const montagem = montagemDe(doc);
  return [
    ...ligacoesDe(montagem, aberto).map((ligacao) => ({ kind: 'baixo' as const, ligacao })),
    ...cadeiaAcima(montagem, aberto).map((elo) => ({ kind: 'cima' as const, elo })),
  ];
}

/** O nome que a lista do Pôr no projeto mostra para uma ligação. */
export function testLinkLabel(link: TestLink): string {
  return link.kind === 'baixo'
    ? `${entityShortName(link.ligacao.uri)} no slot ${link.ligacao.slot}`
    : `${entityShortName(link.elo.base)} dentro de ${entityShortName(link.elo.uri)} (${link.elo.slot})`;
}

/**
 * **Por que esta ligação não vai para o projeto**, ou `null`. Só escreve no
 * arquivo ABERTO, nunca noutro (plano `22`, §3): a nave em volta do mecha não
 * está no arquivo aberto, e o botão diz por quê.
 */
export function whyNotIntoProject(doc: EditorDoc, link: TestLink): string | null {
  const aberto = openProject(doc).uri;
  if (projetoDe(doc) === null) return 'Pôr no projeto precisa de um projeto aberto';
  if (link.kind === 'baixo') {
    if (link.ligacao.host !== aberto) return `${entityShortName(link.ligacao.host)} não é o arquivo aberto`;
    // Rodada 42, lote 2 (doc 42, defeito 6; regra 21): gravar apontaria o
    // projeto para um arquivo que não existe. Avisa antes, e não grava.
    if (dataOf(doc, link.ligacao.uri) === null) {
      return `Falta o arquivo ${link.ligacao.uri}: gravar faria o projeto apontar para um arquivo que não existe. `
        + 'Traga o arquivo de volta para a pasta, ou desligue a peça';
    }
    return drawingOfSlot(corpoDe(doc).file, link.ligacao.slot) === null
      ? `O slot ${link.ligacao.slot} não tem desenho para a peça tomar o lugar` : null;
  }
  if (link.elo.base !== aberto) {
    return `${cap(entityShortName(link.elo.uri))} leva ${entityShortName(link.elo.base)}, e nenhum dos dois é o arquivo aberto. `
      + `Para gravar, abra ${entityShortName(link.elo.base)} e ponha ${entityShortName(link.elo.uri)} nele`;
  }
  if (outerFile(doc, link.elo.uri) === null) {
    return `Falta o arquivo ${link.elo.uri}: gravar faria o projeto apontar para um arquivo que não existe. `
      + 'Traga o arquivo de volta para a pasta, ou tire de volta';
  }
  if (outerSlotMatrix(doc, link.elo) === null) return `O editor não conseguiu montar ${link.elo.uri} para achar o lugar do slot ${link.elo.slot}`;
  return null;
}

/**
 * A matriz do slot `elo.slot` de `elo.uri`, na pose de repouso, com o de
 * dentro no lugar da imagem (a mesma conta da cena em camadas).
 */
function outerSlotMatrix(doc: EditorDoc, elo: Acima): Matrix2x3 | null {
  const original = outerFile(doc, elo.uri);
  const desenho = original === null ? null : drawingOfSlot(original, elo.slot);
  if (original === null || desenho === null) return null;
  const file = JSON.parse(JSON.stringify(original)) as BoneFile;
  const skin = (file.skins ?? []).find((s) => s.attachments?.[elo.slot]?.[desenho] !== undefined);
  if (skin === undefined) return null;
  new SwapForEntity(elo.slot, desenho, skin.name, elo.base).apply({ file, atlases: doc.atlases } as unknown as EditorDoc);
  try {
    const filhos = new Map(skeletonsDe(doc));
    filhos.delete(elo.base);
    const skeleton = new Skeleton(loadSkeletonData(file as unknown, { atlases: doc.atlases, skeletons: filhos }));
    skeleton.setToSetupPose();
    skeleton.findSlot(elo.slot)?.setAttachmentName(desenho);
    skeleton.updateWorldTransform(0);
    const vivo = skeleton.findSlot(elo.slot);
    if (vivo === null) return null;
    const anexo = vivo.attachment as { type?: string; computeParentMatrix?: (m: Matrix2x3) => Matrix2x3 } | null;
    const osso = vivo.boneMatrix;
    return anexo?.type === 'skeleton' && typeof anexo.computeParentMatrix === 'function'
      ? anexo.computeParentMatrix(osso)
      : { a: osso.a, b: osso.b, c: osso.c, d: osso.d, worldX: osso.worldX, worldY: osso.worldY };
  } catch {
    return null;
  }
}

/**
 * **Pôr no projeto** — o gesto, já decidido. `null` com o porquê no rodapé.
 *
 * | A ligação | O que grava no boneco |
 * |:---|:---|
 * | para baixo (a espada no cabelo) | a entidade no slot, como a grade (`SwapForEntity`) |
 * | para cima (o boneco no mecha) | o mecha entra **no boneco**, num slot novo, com **Este boneco** no slot onde o boneco estava |
 *
 * Vai para a base, como a grade e toda mexida estrutural (o rodapé diz). E
 * `Ctrl+Z` volta a ligação a teste, num passo.
 */
export function putIntoProject(doc: EditorDoc, link: TestLink): TestGesture | null {
  if (whyNotIntoProject(doc, link) !== null) return null;
  const corpo = corpoDe(doc);
  const montagem = montagemDe(doc);
  const base = wentToBase(doc);
  if (link.kind === 'baixo') {
    const { slot, uri } = link.ligacao;
    const file = corpo.file;
    const desenho = drawingOfSlot(file, slot)!;
    const skin = (file.skins ?? []).find((s) => s.attachments?.[slot]?.[desenho] !== undefined)!;
    const antes = placedInFile(doc, file).find((p) => p.slot === slot)?.uri ?? null;
    garantirAninhado(doc, uri);
    const escolha: Escolha = { ...(link.ligacao.anima === undefined ? {} : { anima: link.ligacao.anima }), ...(link.ligacao.skins === undefined ? {} : { skins: link.ligacao.skins }) };
    const passos: Command[] = [
      new SwapForEntity(slot, desenho, skin.name, uri),
      new KeepTestChoice(skin.name, slot, desenho, escolha),
      new SetMontagem('Tirar o teste', semLigacao(montagem, link.ligacao.host, slot)),
    ];
    const saiu = antes === null || antes === uri ? '' : ` ${cap(entityShortName(antes))} saiu do slot.`;
    return {
      command: new PutIntoProject('Pôr no projeto', passos),
      frase: `${cap(entityShortName(uri))} gravada no slot ${slot}: agora é do projeto${base}.${saiu}${keptChoiceSays(uri, escolha)} Ctrl+Z volta a teste.`,
    };
  }
  const { elo } = link;
  const m = outerSlotMatrix(doc, elo)!;
  const file = corpo.file;
  const raiz = (file.bones ?? [])[0];
  // O de fora, no espaço da raiz do boneco: o inverso de onde o boneco se apoia.
  let inv = invertMatrix(m);
  if (raiz !== undefined) {
    const r = raiz as { x?: number; y?: number; rotation?: number };
    inv = multiplyMatrix(invertMatrix(composeMatrix(r.x ?? 0, r.y ?? 0, r.rotation ?? 0, 1, 1)), inv);
  }
  const giro = (Math.atan2(inv.c, inv.a) * 180) / Math.PI;
  garantirAninhado(doc, elo.uri);
  const pendura = new DropEntityAsSlot(file, elo.uri, raiz?.name ?? 'root', doc.visibleSkins, inv.worldX, inv.worldY, null, giro);
  const volta = new SetEntityAround(pendura.name, pendura.name, pendura.skin, elo.slot);
  const fora = cadeiaAcima(montagem, elo.uri);
  const escolha: Escolha = { ...(elo.anima === undefined ? {} : { anima: elo.anima }), ...(elo.skins === undefined ? {} : { skins: elo.skins }) };
  const passos: Command[] = [pendura, volta, new KeepTestChoice(pendura.skin, pendura.name, pendura.name, escolha), new SetMontagem('Tirar o teste', semAcima(montagem, elo.uri))];
  // Doc 36, defeito 1: com Na cena, o boneco estava SENTADO no mecha (a
  // âncora o tirava da origem). Gravado, ele volta à origem e o mecha passa a
  // ficar em volta dele: o desenho é o mesmo, só que deslocado. A vista anda o
  // mesmo tanto, e na tela nada pula. As chaves do boneco não mudam.
  const ancora = montagem.naCena ? corpo.skeleton?.parentMatrix ?? null : null;
  if (ancora !== null && (ancora.worldX !== 0 || ancora.worldY !== 0)) passos.push(new PanWithAnchor(-ancora.worldX, -ancora.worldY));
  const tambem = fora.length === 0 ? '' : ` ${cap(entityShortName(fora[0]!.uri))}, que estava em volta de ${entityShortName(elo.uri)}, saiu (era teste).`;
  return {
    command: new PutIntoProject('Pôr no projeto', passos),
    frase: `${cap(entityShortName(elo.uri))} entrou em ${entityShortName(elo.base)}, com Este boneco no ${elo.slot}${base}. `
      + `Agora ${entityShortName(elo.base)} LEVA ${entityShortName(elo.uri)}: no teste não levava.${keptChoiceSays(elo.uri, escolha)}${tambem} Ctrl+Z volta a teste.`,
  };
}

// ---------------------------------------------------------------------------
// Lote 6: no cartão — anima ▾, livre, skins ▾, a mesma duas vezes, as iguais
// ---------------------------------------------------------------------------

/**
 * **Os cartões de teste da árvore**, na ordem da aba: as peças de teste (para
 * baixo) e o que está em volta (para cima). As portas do menu perguntam qual.
 */
export function testCards(doc: EditorDoc): EntityCard[] {
  const out: EntityCard[] = [];
  const walk = (card: EntityCard): void => {
    if (card.alvo !== null && card.alvo.kind !== 'projeto') out.push(card);
    for (const line of card.linhas) for (const dentro of line.cartoes) walk(dentro);
  };
  walk(cardTree(doc).topo);
  return out;
}

/** O nome de um cartão de teste na lista do menu. */
export function testCardLabel(card: EntityCard): string {
  const alvo = card.alvo;
  if (alvo === null || alvo.kind === 'projeto') return cardTitle(card);
  return alvo.kind === 'baixo' ? `${cardTitle(card)} no slot ${alvo.slot}` : `${card.nome} em volta`;
}

// ---------------------------------------------------------------------------
// Lote 7: os casos difíceis — o arquivo que falta, sem lugar, a trilha
// ---------------------------------------------------------------------------

/**
 * **Os avisos da montagem de teste**, para a barra de avisos (regra 21): a
 * peça cujo arquivo sumiu, e a que ficou sem lugar. Vazio quando está tudo lá.
 */
export function montagemWarnings(doc: EditorDoc): string[] {
  if (projetoDe(doc) === null) return [];
  const out: string[] = [];
  const aberto = openProject(doc).uri;
  const montagem = montagemDe(doc);
  const file = corpoDe(doc).file;
  for (const l of ligacoesDe(montagem, aberto)) {
    if (!(file.slots ?? []).some((s) => s.name === l.slot)) {
      out.push(`Montagem de teste: o slot ${l.slot} não existe mais em ${entityShortName(aberto)}. `
        + `A peça ${entityShortName(l.uri)} ficou sem lugar: arraste-a para outro slot, ou Desligar`);
    }
    if (dataOf(doc, l.uri) === null) {
      out.push(`Montagem de teste: falta o arquivo ${l.uri} (a peça de teste do slot ${l.slot}). A ligação fica, e nada é desenhado no lugar`);
    }
  }
  for (const a of cadeiaAcima(montagem, aberto)) {
    const fora = outerFile(doc, a.uri);
    if (fora === null) {
      out.push(`Montagem de teste: falta o arquivo ${a.uri} (em volta de ${entityShortName(a.base)}). A ligação fica, e nada é desenhado em volta`);
    } else if (!(fora.slots ?? []).some((s) => s.name === a.slot)) {
      out.push(`Montagem de teste: o slot ${a.slot} não existe mais em ${entityShortName(a.uri)}. `
        + `${cap(entityShortName(a.base))} ficou sem lugar dentro dele: botão direito no cartão → Tirar de volta`);
    }
  }
  return out;
}

/**
 * **A dica de cada slot na pergunta "Em que slot de mecha entra?"** — rodada
 * 42, lote 2 (doc 42, defeito 4). Dizia *"O de fora entra no lugar da imagem
 * body"*, e quem arrastou o herói para DENTRO do mecha lia o contrário. A
 * frase diz quem entra em quê, pelos nomes.
 */
export function upSlotHint(doc: EditorDoc, fora: string, slot: string): string {
  // Quem entra é o de fora da cadeia: com o mecha já em volta, é o mecha que entra no capacete.
  return `${cap(entityShortName(topOfChain(doc)))} entra no slot ${slot} de ${entityShortName(fora)}, no lugar da imagem que está lá`;
}

/**
 * A aba redesenha quando a janela cruza a altura da tela baixa — rodada 42,
 * lote 2 (doc 42, defeito 2). A regra lia a altura só ao desenhar, e
 * redimensionar não desenhava: a trilha e as dobras só vinham com Ctrl+Z.
 */
export function compactFor(altura: number): boolean {
  return altura <= 800;
}

/**
 * **A trilha dos níveis**, de fora para dentro: `nave › mecha › heroi`. Vazia
 * quando nada está em volta do projeto aberto.
 */
export function trailOf(doc: EditorDoc): string[] {
  const cadeia = chainUp(doc);
  if (cadeia.length === 0) return [];
  return [...cadeia.map((a) => a.uri).reverse(), openProject(doc).uri];
}

/**
 * A aba usa a trilha quando há alguém em volta e a tela é baixa (1280×720),
 * ou quando a montagem passa de 4 níveis (plano `22`, "Nas três telas").
 * `emVolta` = quantos estão em volta; `altura` = a da janela, em px.
 */
export function useTrail(emVolta: number, altura: number): boolean {
  return emVolta > 0 && (emVolta + 1 > 4 || altura <= 800);
}

/**
 * O cartão nasce dobrado? Na tela baixa, sim — só o nome e a palavra —,
 * menos o AQUI e a cadeia dele, que nascem abertos (plano `22`, §2).
 */
export function foldedByDefault(card: EntityCard, compacto: boolean): boolean {
  return compacto && card.papel !== 'aqui' && card.papel !== 'em-volta' && card.acima === null;
}

/** Quantas vezes `uri` está nos slots do AQUI (gravada ou em teste), fora o slot `menos`. */
function copiesInHere(doc: EditorDoc, uri: string, menos: string | null): number {
  const aberto = openProject(doc).uri;
  const slots = new Set<string>();
  for (const p of placedInFile(doc, corpoDe(doc).file)) if (p.uri === uri && !p.marcado) slots.add(p.slot);
  for (const l of ligacoesDe(montagemDe(doc), aberto)) {
    if (l.uri === uri) slots.add(l.slot);
    // A peça de teste cobre a que estava gravada no slot: ela não conta mais.
    else slots.delete(l.slot);
  }
  if (menos !== null) slots.delete(menos);
  return slots.size;
}

/** O nome do cartão, com o número da cópia quando a mesma entidade está mais de uma vez. */
export function cardTitle(card: EntityCard): string {
  return card.vez === null ? card.nome : `${card.nome} ${card.vez.n} de ${card.vez.de}`;
}

/** O que o slot mostra, para achar os iguais: a mesma entidade, ou a mesma imagem. */
function contentKey(file: BoneFile, slot: string): string | null {
  const nome = drawingOfSlot(file, slot);
  if (nome === null) return null;
  for (const skin of (file as SkinsFile).skins ?? []) {
    const def = skin.attachments?.[slot]?.[nome] as Def | undefined;
    if (def === undefined) continue;
    if (def['type'] === 'skeleton') return `entidade:${String(def['uri'] ?? '')}`;
    const imagem = def['path'] ?? nome;
    return `${String(def['type'] ?? 'region')}:${String(imagem)}`;
  }
  return null;
}

/**
 * **Os slots iguais a `slot`** no arquivo `host` (o AQUI): os que mostram a
 * mesma imagem ou a mesma entidade, como as quatro rodas — a mesma conta da
 * grade (rodada 9, "Trocar todas as iguais"). Na ordem dos slots, com ele.
 */
export function equalSlots(doc: EditorDoc, host: string, slot: string): string[] {
  if (host !== openProject(doc).uri) return [];
  const file = corpoDe(doc).file;
  const chave = contentKey(file, slot);
  if (chave === null) return [];
  return (file.slots ?? []).map((s) => s.name).filter((nome) => contentKey(file, nome) === chave);
}

/**
 * **Trocar todas as iguais** — a peça de teste do slot entra, em teste, em
 * todos os slots iguais a ele. Um passo de desfazer. `null` quando não há o
 * que trocar. Desligado até ele clicar (plano `22`, §3: "as rodas").
 */
export function testAllEqual(doc: EditorDoc, host: string, slot: string): TestGesture | null {
  const montagem = montagemDe(doc);
  const ligacao = ligacaoEm(montagem, host, slot);
  if (ligacao === null) return null;
  const slots = equalSlots(doc, host, slot).filter((sl) => whyCannotHold(doc, host, sl, ligacao.uri) === null);
  if (slots.length < 2 || slots.every((sl) => ligacaoEm(montagem, host, sl)?.uri === ligacao.uri)) return null;
  let depois = montagem;
  for (const sl of slots) depois = comLigacao(depois, { ...ligacao, slot: sl });
  return {
    command: new SetMontagem(`Trocar todas as iguais (${slots.length})`, depois),
    frase: `${cap(entityShortName(ligacao.uri))} nas ${slots.length} peças iguais (${slots.join(', ')}): teste. A animação não muda.`,
  };
}

/** Uma linha do "anima ▾". `valor`: `null` = parada (teste) ou livre (projeto); `''` = a de quem recebe. */
export interface AnimaChoice {
  valor: string | null;
  label: string;
  hint: string;
  atual: boolean;
}

/** Por que o "anima ▾" deste cartão não age agora, ou `null`. */
export function whyNoCardAnima(doc: EditorDoc, card: EntityCard): string | null {
  if (card.alvo === null) return 'Este cartão não escolhe o que toca aqui';
  if (!card.carregada) return `O arquivo de ${card.nome} não está aberto: o editor não sabe que animações ela tem`;
  // 05/11/2026: com a base aberta o menu abre — "a de quem recebe" vale em
  // todas as animações. As outras escolhas dizem `PROJECT_ANIMA_NEEDS_ANIMATION`.
  return null;
}

/** A frase de quem escolhe a faixa com a base aberta: no projeto, é chave. */
export const PROJECT_ANIMA_NEEDS_ANIMATION =
  'Abra uma animação: no projeto, o que a peça toca vira chave na faixa dela, da agulha em diante';

/**
 * **A peça responde à animação de quem a recebe** — 05/11/2026, a espada de
 * um, o boneco de outro. O campo é da spec (7.11, `inheritAnimation`): o herói
 * toca `attack`, a espada toca o `attack` dela; uma que ela não tem, toca a do
 * anexo. É do anexo, não da faixa: vale em todas as animações, e uma chave na
 * faixa continua ganhando (9.9). Liga e desliga; `revert` devolve como estava.
 */
export class SetInheritAnimation implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  private antes: Array<[string, unknown]> | null = null;
  private feito = false;
  constructor(
    private readonly skin: string,
    private readonly slot: string,
    private readonly nome: string,
    private readonly ligar: boolean,
  ) {
    this.label = ligar ? 'Responder à animação de quem recebe' : 'Deixar de responder à animação de quem recebe';
  }
  private def(doc: EditorDoc): Def | null {
    const achado = (doc.file.skins ?? []).find((s) => s.name === this.skin)?.attachments?.[this.slot]?.[this.nome];
    return achado === undefined || achado === null || typeof achado !== 'object' ? null : achado as unknown as Def;
  }
  apply(doc: EditorDoc): void {
    const def = this.def(doc);
    if (def === null) return;
    this.antes = fotografar(def);
    this.feito = true;
    if (this.ligar) def['inheritAnimation'] = true;
    else delete def['inheritAnimation'];
  }
  revert(doc: EditorDoc): void {
    const def = this.def(doc);
    if (def === null || !this.feito) return;
    if (this.antes !== null) devolverFoto(def, this.antes);
    this.antes = null;
    this.feito = false;
  }
}

/**
 * O passo de "a de quem recebe" no cartão do projeto: liga quando está
 * desligado, desliga quando está ligado. `null` quando a peça não está gravada
 * no slot do cartão.
 */
export function projectInheritGesture(doc: EditorDoc, card: EntityCard): { command: Command; frase: string } | null {
  const alvo = card.alvo;
  if (alvo === null || alvo.kind !== 'projeto') return null;
  const entidade = entitySlots(corpoDe(doc).file).find((e) => e.slot === alvo.slot && e.uri === alvo.uri) ?? null;
  if (entidade === null) return null;
  const ligar = !entidade.inheritAnimation;
  const nome = cap(entityShortName(alvo.uri));
  const dela = entidade.animation === null ? 'fica parada' : `toca ${entidade.animation}`;
  const frase = ligar
    ? `${nome} responde à animação de quem a recebe: toca a de mesmo nome; numa que ela não tem, ${dela}. Vale em todas as animações`
    : `${nome} não responde mais à animação de quem a recebe: ${dela}`;
  return { command: new SetInheritAnimation(entidade.skin, entidade.slot, entidade.attachment, ligar), frase };
}

/** O que se pode escolher no "anima ▾" deste cartão, com a de agora marcada. */
export function animaChoices(doc: EditorDoc, card: EntityCard): AnimaChoice[] {
  if (card.alvo === null) return [];
  const nome = card.nome;
  if (card.alvo.kind === 'projeto') {
    const agora = card.anima;
    const recebe: AnimaChoice = {
      valor: '', label: 'mexe junto com quem segura',
      hint: agora === ''
        ? `${cap(nome)} responde à animação de quem a recebe. Clique para desligar: ela volta a tocar só a dela`
        : `${cap(nome)} toca a animação de mesmo nome que quem a recebe toca; numa que ela não tem, a dela. `
          + 'Vale em todas as animações (inheritAnimation, 7.11)',
      atual: agora === '',
    };
    // 05/11/2026: com a base aberta, só "a de quem recebe" — as outras são chave na faixa.
    if (doc.animation === null) return [recebe];
    return [
      { valor: null, label: 'livre — o jogo escolhe', hint: `Ninguém manda em ${nome}: o jogo escolhe o que ela toca. Vira chave na faixa, da agulha em diante`, atual: agora === null },
      recebe,
      ...card.animacoes.map((a) => ({ valor: a, label: a, hint: `${cap(nome)} toca ${a}, da agulha em diante. Vira chave na faixa`, atual: agora === a })),
    ];
  }
  const recebe = card.alvo.kind === 'cima' ? 'o boneco' : 'quem a recebe';
  return [
    { valor: null, label: 'parada', hint: `${cap(nome)} fica parada, na pose de repouso. Teste: o arquivo não muda`, atual: card.anima === null },
    { valor: '', label: 'mexe junto com quem segura', hint: `${cap(nome)} toca a animação de mesmo nome que ${recebe} toca; sem ela, fica parada. Teste`, atual: card.anima === '' },
    ...card.animacoes.map((a) => ({ valor: a, label: a, hint: `${cap(nome)} toca ${a}, no relógio da agulha. Teste: o arquivo não muda`, atual: card.anima === a })),
  ];
}

/** A escolha de agora de um alvo de teste. */
function escolhaDe(montagem: Montagem, alvo: CardTarget): Escolha | null {
  if (alvo.kind === 'baixo') {
    const l = ligacaoEm(montagem, alvo.host, alvo.slot);
    return l === null ? null : { ...(l.anima === undefined ? {} : { anima: l.anima }), ...(l.skins === undefined ? {} : { skins: [...l.skins] }) };
  }
  if (alvo.kind === 'cima') {
    const a = montagem.acima.find((x) => x.uri === alvo.uri);
    return a === undefined ? null : { ...(a.anima === undefined ? {} : { anima: a.anima }), ...(a.skins === undefined ? {} : { skins: [...a.skins] }) };
  }
  return null;
}

function comEscolha(montagem: Montagem, alvo: CardTarget, escolha: Escolha): Montagem {
  return alvo.kind === 'baixo'
    ? comEscolhaBaixo(montagem, alvo.host, alvo.slot, escolha)
    : comEscolhaCima(montagem, alvo.uri, escolha);
}

/**
 * **O que a peça de TESTE toca** — lote 6. `null` = parada; `''` = a de quem
 * a recebe; um nome = aquela. Um passo de desfazer; o arquivo não muda.
 * `null` como resposta quando o alvo não é de teste ou nada muda.
 */
export function setTestAnima(doc: EditorDoc, alvo: CardTarget, valor: string | null): TestGesture | null {
  if (alvo.kind === 'projeto') return null;
  const montagem = montagemDe(doc);
  const antes = escolhaDe(montagem, alvo);
  if (antes === null) return null;
  const anima = valor === null ? undefined : valor;
  if (antes.anima === anima) return null;
  const escolha: Escolha = { ...antes };
  if (anima === undefined) delete escolha.anima;
  else escolha.anima = anima;
  const depois = comEscolha(montagem, alvo, escolha);
  const nome = cap(entityShortName(alvo.uri));
  const frase = valor === null ? `${nome} parada, na pose de repouso (teste). O arquivo não muda.`
    : valor === '' ? `${nome} toca a animação de quem a recebe (teste). O arquivo não muda.`
      : `${nome} toca ${valor} (teste). O arquivo não muda.`;
  return { command: new SetMontagem('Escolher o que a peça de teste toca', depois), frase };
}

/** O texto do "skins ▾", ou `null` quando a entidade só tem a `default` (ou o cartão não é de teste). */
export function cardSkins(card: EntityCard): string | null {
  if (card.alvo === null || card.alvo.kind === 'projeto' || card.skinsDela.length === 0) return null;
  return `skins: ${card.skins.length === 0 ? 'default' : card.skins.join(', ')}`;
}

/** As skins que se ligam e desligam no "skins ▾" (a `default` fica sempre por baixo). */
export function skinChoices(card: EntityCard): Array<{ nome: string; ligada: boolean }> {
  return card.skinsDela.map((nome) => ({ nome, ligada: card.skins.includes(nome) }));
}

/** **Liga ou desliga uma skin de teste** — lote 6. O arquivo da entidade não muda. */
export function toggleTestSkin(doc: EditorDoc, alvo: CardTarget, skin: string): TestGesture | null {
  if (alvo.kind === 'projeto') return null;
  const montagem = montagemDe(doc);
  const antes = escolhaDe(montagem, alvo);
  if (antes === null) return null;
  const tinha = (antes.skins ?? []).includes(skin);
  const skins = tinha ? (antes.skins ?? []).filter((s) => s !== skin) : [...(antes.skins ?? []), skin];
  const nome = entityShortName(alvo.uri);
  return {
    command: new SetMontagem(tinha ? 'Tirar a skin de teste' : 'Testar a skin', comEscolha(montagem, alvo, { ...antes, skins })),
    frase: tinha ? `Skin ${skin} saiu do ${nome} (era teste).` : `Skin ${skin} no ${nome}: teste. O arquivo de ${nome} não muda.`,
  };
}
