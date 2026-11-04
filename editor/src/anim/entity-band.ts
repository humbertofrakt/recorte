/**
 * A faixa da entidade na linha do tempo — degrau 6, tarefa 6.4 (17/09/2026).
 *
 * Spec 7.11 (`skeleton`, o esqueleto aninhado), 9.9 (`nested`) e Apêndice C 1.
 * `ARQUITETO 3` §4.2, E13 e E14; `programa-novo/05`, E12b.
 *
 * A entidade é **uma imagem com relógio**: o slot que mostraria um desenho
 * mostra um esqueleto inteiro, com os ossos e as animações dele. Na folha, uma
 * entidade não é uma fileira de losangos — é uma **faixa**: um retângulo que
 * começa onde ela foi solta, termina onde ela sai de cena, e traz escrito o
 * nome da animação que ela está tocando. É assim que se lê *"a mochila começa
 * a acender aos 0,5 s e apaga aos 1,2"* sem abrir mais nada.
 *
 * Três coisas decidem uma faixa, e nenhuma delas é campo novo (E13):
 *
 * | O quê | De onde vem |
 * |:---|:---|
 * | Onde ela começa | a chave `slot/attachment` que mostra o anexo `skeleton` |
 * | Onde ela acaba | a chave seguinte que mostra outra coisa, ou o fim |
 * | Que animação toca | `nested/animation`, senão `animation` do anexo (7.11) |
 * | Quão rápido | `nested/timeScale`, senão `timeScale` do anexo |
 *
 * **O relógio do filho começa na chave**, e o Apêndice C 1 diz exatamente como
 * achar esse instante sem guardar estado: é o **início da corrida** de chaves
 * `slot/attachment` com o mesmo valor que vale em `t`. Duas chaves seguidas
 * mostrando o mesmo anexo não zeram o relógio duas vezes — e é por isso que a
 * faixa é uma corrida, e não uma chave.
 *
 * Módulo do degrau 1 (`anim/`): puro, sem DOM, sem documento. Lê o JSON e
 * devolve números e nomes; quem desenha é `panels/dopesheet.ts`.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { durationOf, findAnimation, findTimeline, nestedTarget, roundTime, setKey, valueAt } from './keying.js';

// ---------------------------------------------------------------------------
// Achar as entidades do arquivo
// ---------------------------------------------------------------------------

/** Vista frouxa de uma timeline, para não brigar com o tipo união. */
interface TimelineLike {
  keys?: Array<{ time: number; value?: unknown }>;
}

/** Vista frouxa de um anexo `skeleton` (7.11). */
interface SkeletonAttachmentLike {
  type?: string;
  uri?: string;
  animation?: string;
  baseAnimation?: string;
  loop?: boolean;
  timeScale?: number;
  inheritAnimation?: boolean;
}

/** Um slot que mostra um esqueleto inteiro: a **entidade** do editor (7.11). */
export interface EntitySlot {
  /** O slot: a tomada. */
  readonly slot: string;
  /** O nome do placeholder dentro da skin. */
  readonly attachment: string;
  /** A skin em que ele foi achado. */
  readonly skin: string;
  /** O arquivo do filho, relativo a `assets.skeletonsBase`. */
  readonly uri: string;
  /** A animação que o anexo pede (fonte 3 de 7.11), ou `null`. */
  readonly animation: string | null;
  /** A animação de fundo, que roda sempre por baixo (7.11). */
  readonly baseAnimation: string | null;
  readonly loop: boolean;
  readonly timeScale: number;
  /** O filho responde ao pai pelo nome da animação (fonte 2 de 7.11). */
  readonly inheritAnimation: boolean;
}

/**
 * Toda entidade do arquivo, em ordem de slot e depois de skin.
 *
 * `skins` limita às skins dadas; sem ele, todas — inclusive as que não estão
 * na tela. É de propósito: a folha mostra a animação inteira, e uma entidade
 * que só aparece na pele `inverno` continua sendo animada por esta animação.
 * O mesmo slot em duas skins dá duas entidades, porque são dois arquivos
 * diferentes pendurados no mesmo lugar.
 */
export function entitySlots(file: BoneFile, skins?: readonly string[] | null): EntitySlot[] {
  const wanted = skins == null ? null : new Set(skins);
  const out: EntitySlot[] = [];
  const seen = new Set<string>();
  for (const slot of file.slots ?? []) {
    for (const skin of file.skins ?? []) {
      if (wanted !== null && !wanted.has(skin.name)) continue;
      const placeholders = skin.attachments?.[slot.name];
      if (placeholders === undefined) continue;
      for (const [name, raw] of Object.entries(placeholders)) {
        const def = raw as SkeletonAttachmentLike | null;
        if (def === null || def.type !== 'skeleton') continue;
        const uri = typeof def.uri === 'string' ? def.uri : '';
        const id = `${slot.name}|${name}|${skin.name}`;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({
          slot: slot.name,
          attachment: name,
          skin: skin.name,
          uri,
          animation: typeof def.animation === 'string' ? def.animation : null,
          baseAnimation: typeof def.baseAnimation === 'string' ? def.baseAnimation : null,
          loop: def.loop !== false,
          timeScale: typeof def.timeScale === 'number' ? def.timeScale : 1,
          inheritAnimation: def.inheritAnimation === true,
        });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Quando a entidade está em cena
// ---------------------------------------------------------------------------

/** Um trecho de tempo em que o slot está mostrando este anexo. */
export interface ActiveRun {
  readonly from: number;
  readonly to: number;
}

/**
 * Os trechos em que o slot mostra `attachment`, pela timeline `slot/attachment`.
 *
 * **A corrida é a unidade, não a chave** (Apêndice C 1): duas chaves seguidas
 * com o mesmo valor são um trecho só, e o relógio do filho começa na primeira
 * delas. Sem timeline nenhuma para o slot, o anexo do setup vale a animação
 * inteira — e aí o trecho é de 0 ao fim.
 */
export function activeRuns(
  file: BoneFile, animation: string, slot: string, attachment: string,
): ActiveRun[] {
  const owner = findAnimation(file, animation);
  if (owner === null) return [];
  const end = durationOf(owner);
  const target = { type: 'slot', target: slot, property: 'attachment' } as const;
  const timeline = findTimeline(file, animation, target) as TimelineLike | null;
  const keys = timeline?.keys ?? [];

  if (keys.length === 0) {
    // Sem chave de anexo: vale o setup do slot. Se é este anexo, a entidade
    // está em cena a animação inteira; se não é, ela não está nunca.
    const setup = (file.slots ?? []).find((s) => s.name === slot)?.attachment;
    return setup === attachment ? [{ from: 0, to: end }] : [];
  }

  const runs: ActiveRun[] = [];
  let open: number | null = null;
  // Antes da primeira chave vale a PRIMEIRA chave (9.10): se ela já mostra a
  // entidade, a faixa começa em 0 e não no tempo dela.
  if (keys[0].value === attachment) open = 0;
  for (let i = 0; i < keys.length; i++) {
    const mostra = keys[i].value === attachment;
    if (mostra && open === null) open = keys[i].time;
    if (!mostra && open !== null) {
      runs.push({ from: open, to: keys[i].time });
      open = null;
    }
  }
  if (open !== null) runs.push({ from: open, to: Math.max(end, open) });
  return runs;
}

// ---------------------------------------------------------------------------
// A faixa
// ---------------------------------------------------------------------------

/** De onde saiu o nome que a faixa escreve — a precedência de 7.11. */
export type BandSource =
  /** Chave `nested/animation` (fonte 1, a mais forte). */
  | 'chave'
  /** O `animation` do anexo (fonte 3). */
  | 'anexo'
  /** `inheritAnimation`: o filho segue o nome da animação do pai (fonte 2). */
  | 'pai'
  /** Nada: o filho fica na pose de repouso dele (fonte 4). */
  | 'nenhuma';

/** Um pedaço de faixa em que tudo o que se escreve nela vale igual. */
export interface BandSegment {
  readonly from: number;
  readonly to: number;
  /** O nome da animação do filho, ou `null` quando não há uma. */
  readonly animation: string | null;
  readonly source: BandSource;
  /** Relógio do filho = relógio do pai × isto (7.11). */
  readonly timeScale: number;
  /** O que vai escrito no pedaço. */
  readonly text: string;
  /** A frase inteira da dica. */
  readonly title: string;
}

/** O tempo escrito como o resto do painel escreve: `0,50 s`. */
function segundos(time: number): string {
  return `${time.toFixed(2).replace('.', ',')} s`;
}

/** Os tempos das chaves de uma timeline `nested`, ou lista vazia. */
function nestedKeyTimes(file: BoneFile, animation: string, slot: string, property: string): number[] {
  const timeline = findTimeline(file, animation, nestedTarget(slot, property)) as TimelineLike | null;
  return (timeline?.keys ?? []).map((key) => key.time);
}

/**
 * O que a faixa escreve e por quê, num instante — **a precedência de 7.11, até
 * a fonte 3**.
 *
 * A fonte 2 (`inheritAnimation`) fica escrita como *"pelo pai"* em vez de um
 * nome: qual animação o filho toca depende de qual animação o **pai** está
 * tocando, e isso não é dado desta animação. Escrever um nome que pode não ser
 * o que toca seria improvisar — regra 21, e é o erro que a casa já cometeu
 * três vezes numa semana.
 */
function animationAt(
  file: BoneFile, animation: string, entity: EntitySlot, time: number,
): { animation: string | null; source: BandSource } {
  const keyed = valueAt(file, animation, time, nestedTarget(entity.slot, 'animation'));
  if (keyed !== undefined) {
    // Uma chave com `null` GANHA (9.9): quer dizer "nenhuma animação de cima",
    // e não cai para o anexo nem para o pai.
    return { animation: typeof keyed === 'string' ? keyed : null, source: 'chave' };
  }
  if (entity.inheritAnimation) return { animation: null, source: 'pai' };
  if (entity.animation !== null) return { animation: entity.animation, source: 'anexo' };
  return { animation: null, source: 'nenhuma' };
}

/** A velocidade do filho num instante: a chave, senão o anexo (7.11). */
function timeScaleAt(
  file: BoneFile, animation: string, entity: EntitySlot, time: number,
): number {
  const keyed = valueAt(file, animation, time, nestedTarget(entity.slot, 'timeScale'));
  return typeof keyed === 'number' ? keyed : entity.timeScale;
}

/** O nome curto de um corpo ou entidade: `armas/tocha.bone` vira `tocha`. */
export function entityShortName(uri: string): string {
  const file = uri.split(/[\\/]/).pop() ?? uri;
  return file.replace(/\.(bone|boneb|bonez)$/i, '');
}

/** O texto e a dica de um pedaço de faixa. */
function labelOfSegment(
  entity: EntitySlot, animation: string | null, source: BandSource, timeScale: number, from: number,
): { text: string; title: string } {
  const nome = entityShortName(entity.uri);
  const velocidade = timeScale === 1 ? '' : ` ×${String(timeScale).replace('.', ',')}`;
  const porque: Record<BandSource, string> = {
    chave: 'pela chave desta animação',
    anexo: 'como o anexo pede',
    pai: 'pelo nome da animação do pai (`inheritAnimation`)',
    nenhuma: 'nenhuma: o filho fica na pose de repouso dele',
  };
  if (source === 'pai') {
    return {
      text: `${nome}: pelo pai${velocidade}`,
      title: `${nome} segue a animação do pai pelo nome, a partir de ${segundos(from)}. `
        + 'Qual é depende da animação que o pai estiver tocando, e por isso ela não vai escrita aqui',
    };
  }
  if (animation === null) {
    return {
      text: `${nome}: (nenhuma)${velocidade}`,
      title: `${nome} não toca animação nenhuma por cima, a partir de ${segundos(from)} `
        + `(${porque[source]})`,
    };
  }
  return {
    text: `${nome}: ${animation}${velocidade}`,
    title: `${nome} toca ${animation} a partir de ${segundos(from)}, ${porque[source]}`
      + (timeScale === 1 ? '' : `, a ${timeScale}× a velocidade`),
  };
}

/**
 * A faixa de uma entidade: os pedaços dela, em ordem de tempo.
 *
 * Um trecho ativo (`activeRuns`) é cortado em pedaços por toda chave de
 * `nested/animation` e `nested/timeScale` que cai dentro dele — são elas que
 * mudam o que a faixa diz. Pedaços vizinhos que diriam a mesma coisa são
 * juntados: duas células iguais coladas só fazem a folha parecer que algo
 * mudou ali.
 */
export function entityBand(
  file: BoneFile, animation: string, entity: EntitySlot,
): BandSegment[] {
  const cortes = [
    ...nestedKeyTimes(file, animation, entity.slot, 'animation'),
    ...nestedKeyTimes(file, animation, entity.slot, 'timeScale'),
  ];
  const out: BandSegment[] = [];

  for (const run of activeRuns(file, animation, entity.slot, entity.attachment)) {
    const pontos = [run.from, ...cortes.filter((t) => t > run.from && t < run.to)]
      .sort((a, b) => a - b);
    for (let i = 0; i < pontos.length; i++) {
      const from = pontos[i];
      const to = i + 1 < pontos.length ? pontos[i + 1] : run.to;
      const { animation: nome, source } = animationAt(file, animation, entity, from);
      const timeScale = timeScaleAt(file, animation, entity, from);
      const anterior = out[out.length - 1];
      // Junta com o pedaço de antes quando ele diria a mesma coisa e encosta.
      if (anterior !== undefined && anterior.to === from
        && anterior.animation === nome && anterior.source === source
        && anterior.timeScale === timeScale) {
        out[out.length - 1] = { ...anterior, to };
        continue;
      }
      const { text, title } = labelOfSegment(entity, nome, source, timeScale, from);
      out.push({ from, to, animation: nome, source, timeScale, text, title });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// O botão direito: as animações do filho — E12b
// ---------------------------------------------------------------------------

/** Um item do menu que o botão direito abre na faixa. */
export interface BandMenuItem {
  /** O nome da animação do filho, ou `null` para "nenhuma". */
  readonly animation: string | null;
  readonly label: string;
  readonly hint: string;
  /** `true` quando é a que vale no instante do clique. */
  readonly current: boolean;
}

/**
 * O menu do botão direito na faixa — **E12b**, *"o botão direito escolhe a
 * animação da entidade"*.
 *
 * `childAnimations` são os nomes lidos do arquivo do filho. Quando o editor
 * não abriu esse arquivo a lista vem vazia, e o menu **diz isso** em vez de
 * aparecer mudo: um menu vazio faria pensar que a entidade não tem animação
 * nenhuma, quando o que houve foi o editor não achar o arquivo (regra 21).
 *
 * A primeira opção é sempre **(nenhuma)**, que grava `nested/animation` com
 * `null` — e `null` GANHA da precedência de 7.11: quer dizer "nada por cima",
 * e não "cai para o anexo".
 */
export function bandMenu(
  childAnimations: readonly string[], current: string | null,
): BandMenuItem[] {
  const items: BandMenuItem[] = [{
    animation: null,
    label: '(nenhuma)',
    hint: 'A entidade fica na pose de repouso dela. Grava a chave com valor vazio, '
      + 'que ganha do que o anexo pede',
    current: current === null,
  }];
  for (const name of childAnimations) {
    items.push({
      animation: name,
      label: name,
      hint: `A entidade passa a tocar ${name} daqui em diante`,
      current: current === name,
    });
  }
  return items;
}

/** O recado quando o editor não abriu o arquivo do filho — regra 21. */
export function missingChildNotice(uri: string): string {
  return `O editor não abriu ${uri}, então não sabe que animações ele tem. `
    + 'Abra a pasta do projeto para a lista aparecer.';
}

// ---------------------------------------------------------------------------
// A faixa de verdade — rodada 8c, C13 e C14 (05/10/2026)
// ---------------------------------------------------------------------------
//
// O Humberto: *"puxar a ponta para fora / para dentro: toca mais devagar / mais
// rápido · arrastar a faixa: muda quando começa"*. Nenhum campo novo (7.11): a
// ponta é `nested/timeScale`, o começo é a chave `slot/attachment` que mostra
// a entidade. Tudo aqui mexe no JSON e nada mais; quem chama embrulha num
// `EditKeys`, e o gesto inteiro é UM passo de desfazer.

/** A velocidade mais lenta e a mais rápida que a ponta aceita. */
export const MIN_TIME_SCALE = 0.05;
export const MAX_TIME_SCALE = 20;

/**
 * O tamanho de **uma volta** da animação do filho, na régua do pai: a duração
 * dela dividida pela velocidade. `null` quando não se sabe (o filho não abriu,
 * ou a animação não tem tamanho): aí a faixa não tem ponta para puxar.
 */
export function cycleLength(childDuration: number | null, timeScale: number): number | null {
  if (childDuration === null || !(childDuration > 0) || !(timeScale > 0)) return null;
  return childDuration / timeScale;
}

/**
 * C13: a velocidade que faz **uma volta** caber de `from` até `tip`. Para
 * fora (ponta mais longe), mais devagar; para dentro, mais rápido. Presa entre
 * `MIN_TIME_SCALE` e `MAX_TIME_SCALE`, com quatro casas.
 */
export function timeScaleForTip(from: number, tip: number, childDuration: number | null): number | null {
  const tamanho = tip - from;
  if (childDuration === null || !(childDuration > 0) || !(tamanho > 0)) return null;
  const ts = Math.min(MAX_TIME_SCALE, Math.max(MIN_TIME_SCALE, childDuration / tamanho));
  return Math.round(ts * 10000) / 10000;
}

/** Vista frouxa de uma chave, para mexer no tempo dela. */
interface KeyLike { time: number; value?: unknown; curve?: unknown }

function keysOf(file: BoneFile, animation: string, slot: string, property: string): KeyLike[] | null {
  const tl = findTimeline(file, animation, property === 'attachment'
    ? { type: 'slot', target: slot, property: 'attachment' }
    : nestedTarget(slot, property)) as { keys?: KeyLike[] } | null;
  return tl?.keys ?? null;
}

/**
 * C13: grava a velocidade da faixa que começa em `from` — chave
 * `nested/timeScale` em `from`, **em degrau** (sem rampa até a chave seguinte).
 * Quando a linha não existia e `from > 0`, o que valia antes (o `timeScale`
 * do anexo) vai numa chave em 0, no mesmo passo: senão a chave nova valeria
 * desde o começo (9.10), como a K15 já ensinou na animação da faixa.
 */
export function writeBandTimeScale(
  file: BoneFile, animation: string, entity: EntitySlot, from: number, value: number,
): void {
  const alvo = nestedTarget(entity.slot, 'timeScale');
  const t = Math.max(0, roundTime(from));
  if (t > 0 && findTimeline(file, animation, alvo) === null) {
    setKey(file, animation, 0, alvo, entity.timeScale, { curve: 'stepped' });
  }
  setKey(file, animation, t, alvo, value, { curve: 'stepped' });
}

/**
 * C14: **arrasta a faixa inteira** que começa em `run.from`, `dt` segundos.
 *
 * Andam juntos: a chave `slot/attachment` que faz a entidade entrar, a chave
 * que a tira (se houver, antes do fim), e as chaves `nested` do slot dentro da
 * faixa — a animação escolhida e a velocidade vão com ela. A faixa não passa
 * da chave de antes (o que o slot mostrava antes), nem sai da animação.
 *
 * Quando a entidade vinha da base (sem chave nenhuma nesta animação), andar
 * para a direita cria as duas chaves que a fazem entrar: vazio em 0, ela no
 * tempo novo. Devolve o deslocamento que de fato valeu (0 = nada mudou).
 */
export function moveBandRun(
  file: BoneFile, animation: string, entity: EntitySlot, run: ActiveRun, dt: number, frame: number,
): number {
  const owner = findAnimation(file, animation);
  if (owner === null || dt === 0) return 0;
  const fim = durationOf(owner);
  const passo = frame > 0 ? frame : 1 / 30;
  const keys = keysOf(file, animation, entity.slot, 'attachment');

  // Quem é a chave de entrada, quem é a de antes, e quem é a de saída.
  let entrada = -1;
  if (keys !== null) {
    entrada = keys.findIndex((k) => k.value === entity.attachment && k.time >= run.from - 1e-6);
  }
  const antes = entrada > 0 ? keys![entrada - 1]! : null;
  const saida = entrada >= 0
    ? keys!.findIndex((k, i) => i > entrada && k.value !== entity.attachment)
    : -1;
  const saidaKey = saida >= 0 ? keys![saida]! : null;
  const tamanho = (saidaKey?.time ?? run.to) - run.from;

  // Os limites do começo novo.
  const apagaAntes = antes !== null && antes.time <= 1e-6 && antes.value === null && entrada === 1;
  const menor = antes === null ? 0 : (apagaAntes ? 0 : antes.time + passo);
  const maior = saidaKey !== null ? fim - tamanho : fim - passo;
  const novo = roundTime(Math.min(Math.max(run.from + dt, menor), Math.max(menor, maior)));
  const desloc = roundTime(novo - run.from);
  if (desloc === 0) return 0;

  // As chaves `nested` da faixa andam juntas, antes de mexer no `attachment`.
  const ate = saidaKey?.time ?? fim + 1e-6;
  for (const prop of ['animation', 'timeScale', 'time']) {
    const lista = keysOf(file, animation, entity.slot, prop);
    if (lista === null) continue;
    for (const k of lista) {
      if (k.time >= run.from - 1e-6 && k.time < ate - 1e-6) k.time = roundTime(k.time + desloc);
    }
    lista.sort((a, b) => a.time - b.time);
  }

  if (keys === null || entrada < 0) {
    // Vinha da base: nasce a chave vazia em 0 e a entrada no tempo novo.
    const alvo = { type: 'slot', target: entity.slot, property: 'attachment' } as const;
    setKey(file, animation, 0, alvo as never, null as never);
    setKey(file, animation, novo, alvo as never, entity.attachment as never);
    return desloc;
  }

  const k = keys[entrada]!;
  const eraPrimeira = entrada === 0;
  k.time = novo;
  if (saidaKey !== null) saidaKey.time = roundTime(Math.min(fim, saidaKey.time + desloc));
  if (apagaAntes && novo <= 1e-6) keys.splice(entrada - 1, 1);
  // A entrada que era a primeira chave saiu de 0: em 0 passa a valer "nada",
  // senão a primeira chave valeria desde o começo (9.10).
  if (eraPrimeira && novo > 1e-6 && !keys.some((x) => x.time <= 1e-6)) {
    keys.unshift({ time: 0, value: null });
  }
  keys.sort((a, b) => a.time - b.time);
  return desloc;
}

// ---------------------------------------------------------------------------
// Laço, grude no fim, a emenda, esticar junto — rodada 8c, C15 (05/10/2026)
// ---------------------------------------------------------------------------

/** O segundo escrito como o rodapé escreve: `0,7 s`. */
function seg(value: number): string {
  return `${String(Math.round(value * 100) / 100).replace('.', ',')} s`;
}

/**
 * **Soltar a ponta perto do fim gruda no fim** — para a emenda do laço bater.
 *
 * Se a ponta cai perto de um ponto em que um número INTEIRO de voltas fecha
 * exatamente no fim (`from + (end − from) ÷ k`), ela vai para lá. Perto = dois
 * quadros, ou 3% da faixa, o que for maior. Longe de todos, fica onde caiu.
 */
export function snapTipToEnd(from: number, tip: number, end: number, frame: number): number {
  const faixa = end - from;
  if (!(faixa > 0) || !(tip > from)) return tip;
  const perto = Math.max(2 * (frame > 0 ? frame : 1 / 30), 0.03 * faixa);
  let melhor = tip;
  let distancia = Infinity;
  for (let k = 1; k <= 64; k++) {
    const alvo = from + faixa / k;
    const d = Math.abs(tip - alvo);
    if (d <= perto && d < distancia) { melhor = alvo; distancia = d; }
    if (alvo - from < perto) break;
  }
  return melhor;
}

/**
 * **O aviso da emenda** (regra 21) — a entidade em laço, à vista do começo ao
 * fim de uma animação que se repete, e que não cabe um número inteiro de
 * vezes nela: na volta da animação ela salta para o começo dela. A frase diz
 * os dois números e o que fazer. `null` quando não há salto.
 */
export function seamWarning(
  file: BoneFile, animation: string, entity: EntitySlot,
  childDuration: (name: string) => number | null,
): string | null {
  const owner = findAnimation(file, animation);
  if (owner === null || owner.loop !== true || !entity.loop) return null;
  const fim = durationOf(owner);
  const pedacos = entityBand(file, animation, entity);
  const ultimo = pedacos[pedacos.length - 1];
  if (ultimo === undefined || ultimo.animation === null || ultimo.source === 'pai') return null;
  // À vista dos dois lados da emenda: do zero ao fim, num pedaço só.
  if (ultimo.from > 1e-6 || Math.abs(ultimo.to - fim) > 1e-6) return null;
  const volta = cycleLength(childDuration(ultimo.animation), ultimo.timeScale);
  if (volta === null) return null;
  const voltas = fim / volta;
  if (Math.abs(voltas - Math.round(voltas)) < 0.01 && Math.round(voltas) >= 1) return null;
  const nome = entityShortName(entity.uri);
  return `${nome} dura ${seg(volta)} e ${animation} dura ${seg(fim)}: ela dá um salto na emenda. `
    + 'Puxe a ponta até o fim';
}

/** Os avisos da emenda de todas as entidades da animação aberta. */
export function seamWarnings(
  file: BoneFile, animation: string | null, childDuration: (uri: string, name: string) => number | null,
): string[] {
  if (animation === null) return [];
  const out: string[] = [];
  for (const entity of entitySlots(file)) {
    const aviso = seamWarning(file, animation, entity, (name) => childDuration(entity.uri, name));
    if (aviso !== null && !out.includes(aviso)) out.push(aviso);
  }
  return out;
}

/**
 * **Em laço ou com tamanho** — C15. O `loop` do anexo `skeleton` (7.11): em
 * laço a entidade roda sozinha, a partir de onde foi solta, sem fim; sem laço
 * ela toca UMA volta e para no último quadro. É do anexo, e não da animação:
 * vale onde a entidade estiver. `true` é o valor de fábrica e sai do arquivo.
 */
export class SetEntityLoop implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  private antes: { had: boolean; value: unknown } | null = null;

  constructor(private readonly slot: string, private readonly attachment: string,
    private readonly skin: string, private readonly loop: boolean) {
    this.label = loop ? 'Entidade em laço' : 'Entidade sem laço';
  }

  private def(doc: EditorDoc): Record<string, unknown> | null {
    const skin = (doc.file.skins ?? []).find((s) => s.name === this.skin);
    const d = skin?.attachments?.[this.slot]?.[this.attachment] as Record<string, unknown> | undefined;
    return d !== undefined && d['type'] === 'skeleton' ? d : null;
  }

  apply(doc: EditorDoc): void {
    const d = this.def(doc);
    if (d === null) return;
    this.antes = { had: 'loop' in d, value: d['loop'] };
    if (this.loop) delete d['loop'];
    else d['loop'] = false;
  }

  revert(doc: EditorDoc): void {
    const d = this.def(doc);
    if (d === null || this.antes === null) return;
    if (this.antes.had) d['loop'] = this.antes.value;
    else delete d['loop'];
  }
}

/**
 * **Esticar a animação estica junto a faixa em que se escolheu a animação** —
 * C15. Chamado depois de `setDuration(…, stretch = true)`, que já moveu as
 * chaves: a velocidade das entidades que têm a animação ESCOLHIDA (linha
 * `nested/animation`) é dividida pelo fator, para cada volta continuar do
 * tamanho certo na faixa. A entidade que segue o anexo ou o pai não estica:
 * ninguém escolheu nada nela.
 */
export function stretchEntityBands(file: BoneFile, animation: string, factor: number): number {
  if (!(factor > 0) || factor === 1) return 0;
  let mexidas = 0;
  for (const entity of entitySlots(file)) {
    const escolhas = keysOf(file, animation, entity.slot, 'animation');
    if (escolhas === null || escolhas.length === 0) continue;
    const velocidades = keysOf(file, animation, entity.slot, 'timeScale');
    const inicio = timeScaleAt(file, animation, entity, 0);
    if (velocidades !== null && velocidades.length > 0) {
      for (const k of velocidades) {
        if (typeof k.value === 'number') k.value = Math.round((k.value / factor) * 10000) / 10000;
      }
    } else {
      setKey(file, animation, 0, nestedTarget(entity.slot, 'timeScale'),
        Math.round((inicio / factor) * 10000) / 10000, { curve: 'stepped' });
    }
    mexidas++;
  }
  return mexidas;
}
