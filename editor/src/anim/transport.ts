/**
 * O motor de tocar (dono C).
 *
 * Tocar não é um estado do arquivo: é o que está acontecendo agora na tela.
 * Por isso ele não mora no `.bone` — o contrato diz que a agulha é estado
 * passageiro. Mas ele também não pode morar dentro de um painel, porque agora
 * são DOIS painéis que precisam dele: a linha do tempo, que tem os botões, e a
 * janela inteira, onde o `Espaço` toca e pausa.
 *
 * O relógio entra de fora. Sem isso um teste de "tocou 200 ms" teria que
 * esperar 200 ms de verdade, e um teste que espera é um teste que às vezes
 * falha por causa da máquina, não por causa do código.
 *
 * O laço vem do ARQUIVO (`animation.loop`, §4.6): tocar respeita o que a
 * animação diz sobre si mesma, e não uma caixinha de sessão que se perde ao
 * fechar a aba.
 */

import type { Crossfade, EditorDoc } from '../contract.js';
import { animationDuration, clampTime, findAnimation } from './animations.js';
import type { LoopRange } from './markers.js';

// ---------------------------------------------------------------------------
// Trocar de animação tocando — lote 46, resposta D8 do Humberto
// ---------------------------------------------------------------------------

/**
 * Clicar noutra animação enquanto toca. `terminar` deixa a atual chegar ao
 * fim e só então entra a próxima, do começo; `na-hora` troca já. Parado, as
 * duas trocam na hora. Mora no `RECORTE_editor_state`: é do tocador.
 */
export type SwitchMode = 'terminar' | 'na-hora';

export const SWITCH_MODES: ReadonlyArray<{ value: SwitchMode; label: string }> = Object.freeze([
  { value: 'terminar', label: 'Terminar a atual antes' },
  { value: 'na-hora', label: 'Trocar na hora' },
]);

export const DEFAULT_SWITCH_MODE: SwitchMode = 'terminar';

/** A dica dos dois campos novos de Configurações. O Humberto pediu: "para não confundir com o loop". */
export const SWITCH_HINT =
  'Isto é do tocador e da mistura. Repetir é outra coisa: é o botão Repetir e o loop do arquivo.';

/** O que um clique numa animação faz: entra na fila, ou troca já. */
export type SwitchPlan = { queued: string | null } | { switchTo: string | null; time: number };

/**
 * **A conta do clique**, pura. `null` é voltar à Montagem: sempre na hora.
 * Tocando em `terminar`, clicar na própria atual tira a fila.
 */
export function switchPlan(
  playing: boolean, current: string | null, next: string | null, mode: SwitchMode,
): SwitchPlan {
  if (next === null) return { switchTo: null, time: 0 };
  if (!playing || mode === 'na-hora') return { switchTo: next, time: 0 };
  if (next === current) return { queued: null };
  return { queued: next };
}

/**
 * **A próxima entra** quando a atual passa do fim, tocando para a frente.
 * `next` é onde a agulha chegaria; `to`, o fim do que está tocando.
 */
export function arrivalPlan(
  queued: string | null, next: number, to: number, direction: 1 | -1,
): { switchTo: string; time: number } | null {
  if (queued === null || direction < 0 || next < to) return null;
  return { switchTo: queued, time: 0 };
}

/**
 * O tempo da mistura que a animação que ENTRA pede: o `defaultMix` dela
 * (§4.6), ou zero. É o mesmo número que o `AnimationStateData.getMix` do
 * runtime lê no jogo.
 */
export function mixSeconds(doc: EditorDoc, name: string): number {
  const value = findAnimation(doc.file, name)?.defaultMix;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/** O relógio e o agendador, injetados para o teste não precisar esperar. */
export interface TransportClock {
  /** Milissegundos de agora. `performance.now` na vida real. */
  now(): number;
  /** Marca a próxima batida. Devolve um número para poder ser cancelada. */
  schedule(run: (stampMs: number) => void): number;
  cancel(id: number): void;
}

/** O que muda quando o tocador anda. */
export type TransportListener = () => void;

/**
 * O que fazer ao chegar no fim — item 100.
 *
 * `arquivo` é o que a animação diz de si mesma (`animation.loop`, §4.6), e é o
 * padrão: o tocador obedece ao arquivo até alguém pedir outra coisa. Os outros
 * três são **de sessão**: são jeitos de OLHAR, não o que o jogo vai fazer, e
 * gravá-los mudaria o arquivo por causa de uma escolha de conferência.
 */
export type EndMode = 'arquivo' | 'parar' | 'repetir' | 'vai-e-volta' | 'voltar';

/** Os quatro modos, na ordem da lista, com o nome que se lê. */
export const END_MODES: ReadonlyArray<{ value: EndMode; label: string; hint: string }> =
  Object.freeze([
    {
      value: 'arquivo',
      label: 'Como o arquivo diz',
      hint: 'Obedece ao Repetir da animação. É o que o jogo vai fazer',
    },
    { value: 'parar', label: 'Parar no fim', hint: 'Chega ao fim e para' },
    { value: 'repetir', label: 'Repetir', hint: 'Volta ao começo e continua' },
    {
      value: 'vai-e-volta',
      label: 'Vai e volta',
      hint: 'Chega ao fim, toca de trás para frente, e assim por diante',
    },
    { value: 'voltar', label: 'Voltar ao início', hint: 'Chega ao fim, volta ao começo e para' },
  ]);

/**
 * O modo de fim de fábrica: **Repetir**, sempre — anotação 14 do Humberto.
 *
 * Nas palavras dele: *"quando clico numa animação sem laço, ela roda uma vez.
 * Deveria rodar sempre enquanto o play estiver ligado"*. E ele tem razão sobre
 * o que é cada coisa: o `loop` do arquivo é o que o **jogo** vai fazer com a
 * animação, e continua sendo — o selo `repete` da lista de Animações mostra
 * exatamente isso. O tocador do editor é outra coisa: é uma pessoa olhando um
 * movimento em cima do outro para ver se ele fecha.
 *
 * "Como o arquivo diz" **continua existindo** no ⋯ Mais, para quem quer ver o
 * que o jogo fará. Só deixou de ser o padrão. **Nada muda no arquivo.**
 */
export const DEFAULT_END_MODE: EndMode = 'repetir';

export interface Transport {
  /**
   * Toca. `sentido` `-1` toca **para trás** — anotação 22, lote 33.
   *
   * O tocador já sabia andar para trás desde o item 100: é o que a volta do
   * "vai e volta" faz, e `landAt` trata os dois sentidos. O que faltava era a
   * porta. Ela é a mesma máquina, começando com o sentido invertido.
   */
  play(doc: EditorDoc, sentido?: 1 | -1): void;
  pause(): void;
  toggle(doc: EditorDoc): void;
  isPlaying(): boolean;
  setSpeed(speed: number): void;
  speed(): number;
  /** O trecho que se repete, ou `null` para a animação inteira — item 81. */
  setRange(range: LoopRange | null): void;
  range(): LoopRange | null;
  /** O que fazer ao chegar no fim — item 100. */
  setEndMode(mode: EndMode): void;
  endMode(): EndMode;
  /**
   * Anda com a agulha até `stampMs`. Respeita `animation.loop` e a duração.
   * Chamado pelo agendador; um teste chama à mão.
   */
  tick(doc: EditorDoc, stampMs: number): void;
  /** Avisa quem desenha. Devolve a função que para de avisar. */
  onChange(listener: TransportListener): () => void;
  /** Esquece a animação que estava tocando. Chamado ao trocar de animação. */
  forget(): void;
  /** A próxima animação, na fila de "terminar a atual antes", ou `null` — lote 46. */
  queued(): string | null;
  /** Põe na fila, ou tira (`null`). */
  queue(name: string | null): void;
  /**
   * Começa a mistura da troca: `from` é a que sai, em `fromTime`. Com
   * `seconds` zero, troca seca.
   */
  startCrossfade(doc: EditorDoc, from: string, fromTime: number, seconds: number): void;
}

/** Velocidade sempre acima de zero: velocidade zero é pausa, e pausa é `pause`. */
function safeSpeed(speed: number): number {
  return Number.isFinite(speed) && speed > 0 ? speed : 1;
}

/** A duração e o laço da animação aberta, ou `null` quando não há uma. */
export function playbackOf(doc: EditorDoc): { duration: number; loop: boolean } | null {
  const animation = findAnimation(doc.file, doc.animation);
  if (animation === null) {
    // Reaproveitar (04/11/2026): a compartilhada (§2.8) não está no arquivo, e
    // sim no que o runtime montou. Sem isto ela abria e não tocava.
    const shared = doc.animation === null ? null : doc.data?.findAnimation(doc.animation) ?? null;
    return shared === null ? null : { duration: shared.duration, loop: shared.loop };
  }
  return { duration: animationDuration(animation), loop: animation.loop === true };
}

/** O começo e o fim do que está sendo tocado: o trecho, ou a animação inteira. */
export function boundsOf(
  duration: number, range: LoopRange | null,
): { from: number; to: number } {
  if (range === null) return { from: 0, to: duration };
  return { from: Math.max(0, range.from), to: Math.min(duration, range.to) };
}

/**
 * Onde a agulha vai parar, e se ela continua tocando — a conta do fim, pura.
 *
 * Recebe onde ela chegaria e devolve onde ela fica. É aqui que os quatro modos
 * do item 100 e o trecho do item 81 viram uma coisa só, e é por isso que dá
 * para conferir os dois sem esperar um relógio.
 */
export function landAt(
  next: number,
  from: number,
  to: number,
  mode: EndMode,
  fileLoop: boolean,
  direction: 1 | -1,
): { time: number; playing: boolean; direction: 1 | -1 } {
  const span = to - from;
  if (span <= 0) return { time: from, playing: false, direction };
  const real = mode === 'arquivo' ? (fileLoop ? 'repetir' : 'parar') : mode;

  if (direction < 0) {
    if (next > from) return { time: next, playing: true, direction };
    // De trás para frente, o "fim" é o começo do trecho.
    if (real === 'vai-e-volta') {
      return { time: from + Math.min(span, from - next), playing: true, direction: 1 };
    }
    if (real === 'repetir') return { time: to - ((from - next) % span), playing: true, direction };
    return { time: from, playing: false, direction: 1 };
  }

  if (next < to) return { time: next, playing: true, direction };
  switch (real) {
    case 'repetir':
      return { time: from + ((next - from) % span), playing: true, direction };
    case 'vai-e-volta':
      return { time: to - Math.min(span, next - to), playing: true, direction: -1 };
    case 'voltar':
      return { time: from, playing: false, direction: 1 };
    default:
      return { time: to, playing: false, direction: 1 };
  }
}

/**
 * O relógio de verdade: `performance.now` e `requestAnimationFrame`.
 *
 * Fora do navegador — num teste que importe este arquivo sem querer — ele
 * devolve um relógio que não agenda nada, em vez de estourar.
 */
export function browserClock(): TransportClock {
  const raf = globalThis.requestAnimationFrame;
  const caf = globalThis.cancelAnimationFrame;
  if (typeof raf !== 'function' || typeof caf !== 'function') {
    return { now: () => Date.now(), schedule: () => 0, cancel: () => {} };
  }
  return {
    now: () => (typeof performance === 'undefined' ? Date.now() : performance.now()),
    schedule: (run) => raf((stamp: number) => run(stamp)),
    cancel: (id) => caf(id),
  };
}

/**
 * Faz um tocador.
 *
 * `tick` recebe o instante do relógio e anda a agulha pela diferença desde a
 * batida anterior, vezes a velocidade. Andar por diferença de relógio, e não
 * por um passo fixo, é o que faz a animação tocar no tempo certo mesmo quando
 * a máquina engasga e pula quadros.
 */
export function createTransport(clock: TransportClock): Transport {
  let playing = false;
  let speed = 1;
  let lastStamp: number | null = null;
  let frame: number | null = null;
  let range: LoopRange | null = null;
  let endMode: EndMode = DEFAULT_END_MODE;
  /** `-1` enquanto "vai e volta" está na volta. */
  let direction: 1 | -1 = 1;
  const listeners = new Set<TransportListener>();
  /** A próxima, na fila — lote 46. */
  let queuedName: string | null = null;
  /** A mistura da troca, e o documento que ela está posando. */
  let mix: Crossfade | null = null;
  let mixDoc: EditorDoc | null = null;

  const announce = (): void => {
    for (const listener of [...listeners]) listener();
  };

  const endMix = (): void => {
    if (mix !== null) mixDoc?.crossfade?.(null);
    mix = null;
    mixDoc = null;
  };

  const stop = (): void => {
    if (frame !== null) clock.cancel(frame);
    frame = null;
    lastStamp = null;
    playing = false;
    // Parado, não há fila nem mistura: a próxima troca é na hora, e a agulha
    // mostra a animação aberta, pura.
    queuedName = null;
    endMix();
  };

  const transport: Transport = {
    play(doc: EditorDoc, sentido: 1 | -1 = 1): void {
      if (playing) return;
      const play = playbackOf(doc);
      // Nada para tocar: uma animação de duração zero tocaria para sempre no
      // mesmo lugar, e o botão ficaria aceso mentindo que algo acontece.
      if (play === null || play.duration <= 0) return;
      playing = true;
      direction = sentido;
      lastStamp = clock.now();
      const beat = (stampMs: number): void => {
        if (!playing) return;
        transport.tick(doc, stampMs);
        if (playing) frame = clock.schedule(beat);
      };
      frame = clock.schedule(beat);
      announce();
    },

    pause(): void {
      if (!playing) return;
      stop();
      announce();
    },

    toggle(doc: EditorDoc): void {
      if (playing) transport.pause();
      else transport.play(doc);
    },

    isPlaying: () => playing,

    setSpeed(next: number): void {
      speed = safeSpeed(next);
      announce();
    },

    speed: () => speed,

    setRange(next: LoopRange | null): void {
      range = next === null ? null : { ...next };
      announce();
    },

    range: () => (range === null ? null : { ...range }),

    setEndMode(mode: EndMode): void {
      endMode = mode;
      direction = 1;
      announce();
    },

    endMode: () => endMode,

    tick(doc: EditorDoc, stampMs: number): void {
      const play = playbackOf(doc);
      if (play === null || play.duration <= 0) {
        if (playing) { stop(); announce(); }
        return;
      }
      const before = lastStamp ?? stampMs;
      lastStamp = stampMs;
      const seconds = Math.max(0, (stampMs - before) / 1000) * speed;
      const edges = boundsOf(play.duration, range);
      // Fora do trecho, a agulha entra nele antes de andar: quem acabou de
      // marcar um trecho quer vê-lo, não esperar a animação chegar lá.
      const now = doc.time < edges.from || doc.time > edges.to ? edges.from : doc.time;

      // Lote 46: a que sai continua andando enquanto se apaga.
      if (mix !== null) {
        const out = findAnimation(doc.file, mix.from);
        mix.elapsed += seconds;
        if (out === null || mix.elapsed >= mix.duration) {
          endMix();
        } else {
          mix.fromTime = clampTime(mix.fromTime + seconds, animationDuration(out), out.loop === true);
          doc.crossfade?.(mix);
        }
      }

      // Lote 46: a atual chegou ao fim e há uma próxima na fila.
      const arrival = arrivalPlan(queuedName, now + seconds * direction, edges.to, direction);
      if (arrival !== null && doc.animation !== null) {
        const from = doc.animation;
        queuedName = null;
        endMix();
        doc.animation = arrival.switchTo;
        doc.time = arrival.time;
        direction = 1;
        transport.startCrossfade(doc, from, edges.to, mixSeconds(doc, arrival.switchTo));
        announce();
        return;
      }

      const land = landAt(
        now + seconds * direction, edges.from, edges.to, endMode, play.loop, direction,
      );
      direction = land.direction;
      doc.time = clampTime(land.time, play.duration, false);
      if (!land.playing && playing) stop();
      announce();
    },

    onChange(listener: TransportListener): () => void {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },

    forget(): void {
      if (playing) { stop(); announce(); return; }
      stop();
    },

    queued: () => queuedName,

    queue(name: string | null): void {
      queuedName = name;
      announce();
    },

    startCrossfade(doc: EditorDoc, from: string, fromTime: number, seconds: number): void {
      endMix();
      if (!(seconds > 0) || from === doc.animation) return;
      mix = { from, fromTime, elapsed: 0, duration: seconds };
      mixDoc = doc;
      doc.crossfade?.(mix);
    },
  };

  return transport;
}

/** O tocador do editor. Um só: a agulha é uma, e o Espaço é o mesmo em toda parte. */
export const transport = createTransport(browserClock());

/**
 * Troca a animação aberta **sem desligar o tocador** — anotação 6 do Humberto:
 * *"quando dou play e mudo de animação, ele não troca a animação
 * automaticamente"*.
 *
 * A regra, nas palavras dele: tocando + escolher outra animação = continua
 * tocando, a nova, do tempo zero. Parado + escolher = parado, no tempo zero.
 *
 * Antes, quem trocava chamava `forget()` direto e o tocador parava. `forget()`
 * continua sendo o certo: a batida velha ainda aponta para a animação velha e
 * tem que morrer. O que faltava era **acender de novo** depois de trocar.
 *
 * `name` a `null` é voltar à Montagem: aí para mesmo, porque não há tempo a
 * andar na pose de repouso.
 *
 * O tocador entra por parâmetro para o teste poder usar um relógio de mentira.
 *
 * Lote 46: `mode` `terminar` (o padrão de Configurações) põe a clicada na fila
 * enquanto toca; quem chama sem dizer o modo troca na hora, como sempre fez.
 * Tocando, a troca mistura pelo `defaultMix` da que entra.
 */
export function switchAnimation(
  doc: EditorDoc, name: string | null, player: Transport = transport, mode: SwitchMode = 'na-hora',
): void {
  const wasPlaying = player.isPlaying();
  const plan = switchPlan(wasPlaying, doc.animation, name, mode);
  if ('queued' in plan) {
    player.queue(plan.queued);
    return;
  }
  const from = doc.animation;
  const fromTime = doc.time;
  player.forget();
  doc.animation = plan.switchTo;
  doc.time = plan.time;
  if (wasPlaying && plan.switchTo !== null) {
    player.play(doc);
    if (from !== null) player.startCrossfade(doc, from, fromTime, mixSeconds(doc, plan.switchTo));
  }
}
