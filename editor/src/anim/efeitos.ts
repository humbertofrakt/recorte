/**
 * Flash, pulso e tremor — três efeitos que só gravam chaves.
 *
 * A pesquisa de 16/09 (`documentos/planos/COMO SE FAZ EFEITO 2026-09-16.md`,
 * §6) classificou os três como **"só porta"**: o programa já consegue fazer e
 * não oferece. Nenhum precisa de campo novo no formato; nenhum precisa de
 * runtime novo.
 *
 * **A REGRA DE OURO DOS TRÊS: eles gravam chaves e somem.** Não são um campo
 * novo, não são um modo, não são estado escondido. Depois de aplicados, o que
 * fica na linha do tempo são chaves iguais às que a pessoa faria à mão — ela
 * pode mexer, apagar, copiar, e o `Ctrl+Z` desfaz tudo num passo só. Quem
 * mexer aqui e se pegar precisando guardar alguma coisa no arquivo **além de
 * chaves** parou de escrever um efeito e começou a escrever um campo novo — e
 * campo novo no núcleo do formato é decisão do Humberto (regra 7).
 *
 * ## Duas etapas, e a primeira não escreve nada
 *
 * Cada gesto tem um `planoDo*`, que **lê** o arquivo e devolve a lista de
 * chaves que vai gravar, e o `aplicarPlano`, que as grava. A separação não é
 * enfeite: a janela de parâmetros chama o plano **a cada tecla** para mostrar
 * na prévia o que vai acontecer antes de acontecer, e uma prévia que escrevesse
 * no documento seria uma prévia que estraga o documento.
 *
 * O plano também é onde mora a regra 21: quando não dá para fazer, ele volta
 * com `chaves` vazia e um `aviso` **escrito**, nunca com um silêncio.
 *
 * ## Por que a montagem não é tocada
 *
 * Os três escrevem a primeira chave no tempo em que o efeito começa, com o
 * valor que a propriedade **já tem** ali. Antes da primeira chave vale a
 * primeira chave (spec 9.10), então do zero até o começo do efeito a pose
 * continua sendo a de montagem — que é o que se quer, e é por isso que aqui
 * não se chama o `keepStartKey`.
 */

import type { BoneFile, CurveDef, KeyValue } from '../../../runtime/src/index.js';
import type { TimelineTarget } from './keying.js';
import {
  boneTarget, roundTime, setKey, setupValueFor, slotTarget, targetInfo, valueAt,
} from './keying.js';

// ---------------------------------------------------------------------------
// O acaso: a MESMA conta da extensão, e não uma segunda
// ---------------------------------------------------------------------------

/*
 * O tremor sorteia, e sortear pede um gerador. A casa já tem um, escrito,
 * congelado e provado por 16 casos de conformidade em dois runtimes
 * independentes: o `pcg` da §3.2 de `formato/extensions/BONE_particles.md`.
 *
 * **Usamos aquele, bit a bit.** Duas contas de acaso na mesma casa divergem, e
 * quando divergem ninguém sabe qual está certa. O teste `efeitos` confere os
 * cinco valores de referência da §3.2 antes de qualquer outra coisa — é o que
 * a própria spec manda conferir primeiro.
 *
 * **O que NÃO vem de lá é a tabela de canais da §3.3.** Aquela tabela é dos
 * campos de um emissor (`lifetime`, `speed`, `spread`…) e está congelada para
 * eles. Um tremor não é um emissor: não emite nada, não guarda semente e não
 * entra no arquivo como objeto nenhum. O que ele pega emprestado — e é o que
 * jamais pode divergir — é a função. Os números abaixo são o endereço interno
 * de um sorteio que vive por três milissegundos e vira chave.
 */

/** Um passo de PCG de 32 bits, §3.2. `v` e a saída são inteiros sem sinal. */
export function pcg(v: number): number {
  const state = (Math.imul(v >>> 0, 747796405) + 2891336453) >>> 0;
  const word = Math.imul(((state >>> ((state >>> 28) + 4)) ^ state) >>> 0, 277803737) >>> 0;
  return ((word >>> 22) ^ word) >>> 0;
}

/**
 * Um número em `[0, 1)` a partir de `(semente, fluxo, índice, canal)`, §3.2.
 *
 * `(h >>> 8) / 2^24`: vinte e quatro bits cabem **exatos** em float32, então um
 * leitor que conte em float32 tira o mesmo `u`.
 */
export function acaso(semente: number, fluxo: number, indice: number, canal: number): number {
  let h = pcg(semente);
  h = pcg((h ^ fluxo) >>> 0);
  h = pcg((h ^ (indice >>> 0)) >>> 0); // índice negativo: complemento de 2
  h = pcg((h ^ canal) >>> 0);
  return (h >>> 8) / 16777216;
}

/** O fluxo e os canais do tremor. Ver a nota acima: não é a tabela da §3.3. */
const TREMOR_FLUXO = 0;
const TREMOR_CANAL: Record<string, number> = { x: 0, y: 1 };

// ---------------------------------------------------------------------------
// O plano
// ---------------------------------------------------------------------------

/** Uma chave que o efeito vai gravar. */
export interface ChavePlanejada {
  target: TimelineTarget;
  time: number;
  value: KeyValue;
  /** Ausente = linear, que é o padrão do formato (9.3). */
  curve?: CurveDef;
}

/** O que um gesto vai fazer, antes de fazer. */
export interface PlanoDeEfeito {
  /** O nome no menu Desfazer: `'Flash'`. */
  label: string;
  chaves: ChavePlanejada[];
  /**
   * Por que não vai fazer (nada, ou menos do que se pediu). `null` quando está
   * tudo certo. **Nunca fica calado**: é a regra 21 da casa.
   */
  aviso: string | null;
  /** Uma linha para a prévia da janela: o que vai acontecer, em português. */
  resumo: string;
}

/** `0,25 s` — sem depender do `formatSeconds`, que mora num degrau acima. */
function segundos(t: number): string {
  return `${t.toFixed(2).replace('.', ',')} s`;
}

/** Sete casas: o bastante para o pixel, sem lixo de ponto flutuante no arquivo. */
function arredonda(value: number): number {
  return Math.round(value * 1e7) / 1e7;
}

/**
 * A Bézier "Suave" da 9.3, em coordenadas absolutas: as alças a um terço do
 * caminho no tempo, e na altura de cada ponta. É a mesma conta do `smoothCurve`
 * de `keying.ts`; está repetida aqui **arredondada**, porque uma curva que o
 * efeito grava vai para o disco e não pode levar vinte casas de sujeira.
 */
function suave(t0: number, v0: number, t1: number, v1: number): number[] {
  const terco = (t1 - t0) / 3;
  return [arredonda(t0 + terco), arredonda(v0), arredonda(t1 - terco), arredonda(v1)];
}

const nada = (label: string, aviso: string): PlanoDeEfeito =>
  ({ label, chaves: [], aviso, resumo: aviso });

/** O plural sem gambiarra: `1 desenho`, `3 desenhos`. */
function conta(n: number, um: string, muitos: string): string {
  return `${n} ${n === 1 ? um : muitos}`;
}

const existe = (lista: ReadonlyArray<{ name: string }> | undefined, nome: string): boolean =>
  (lista ?? []).some((item) => item.name === nome);

/** O valor que `target` tem em `time`: a chave que valeria ali, ou a montagem. */
function valorDeAgora(
  file: BoneFile, animation: string, time: number, target: TimelineTarget,
): KeyValue | undefined {
  return valueAt(file, animation, time, target) ?? setupValueFor(file, target);
}

// ---------------------------------------------------------------------------
// Flash
// ---------------------------------------------------------------------------

export interface FlashOptions {
  /** Onde o flash começa, em segundos. */
  tempo: number;
  /** Quanto tempo leva para acender. */
  subida: number;
  /** Quanto tempo leva para apagar. */
  descida: number;
  /** A cor do pico, `[r, g, b]` em `0..1`. Branco, se não disser. */
  cor?: readonly [number, number, number];
  /** Quanto do caminho até a cor. `1` = cor cheia. */
  forca?: number;
}

/**
 * O pico de luz num slot, e volta — o "piscar branco" de quem levou dano.
 *
 * **Por que `darkColor` e não `color`.** A fórmula da 7.12 é
 * `out.rgb = tex.rgb × light.rgb + (1 − tex.rgb) × dark.rgb`. Com
 * `dark = (1, 1, 1)` o pixel vai a **branco puro** seja qual for a textura: é
 * o flash exato, sem shader, sem blend aditivo, sem campo novo. Escrito em
 * `color`, que MULTIPLICA, um flash branco sobre arte clara não mudaria nada —
 * a ação existiria, o arquivo cresceria, e a tela ficaria igual.
 *
 * `darkColor` ausente lê-se `(0, 0, 0)` pela mesma 7.12, então as duas pontas
 * do flash gravam o valor de agora — `[0, 0, 0]` quando não havia nenhum — e o
 * slot fica, no fim, exatamente como estava.
 */
export function planoDoFlash(
  file: BoneFile, animation: string, slots: readonly string[], options: FlashOptions,
): PlanoDeEfeito {
  const label = 'Flash';
  const alvos = slots.filter((nome) => existe(file.slots, nome));
  if (alvos.length === 0) {
    return nada(label, 'Escolha um desenho (um slot) na Árvore antes.');
  }
  if (!(options.subida > 0) || !(options.descida > 0)) {
    return nada(label, 'A subida e a descida têm de ser maior que zero: duas chaves no mesmo tempo seriam uma só.');
  }

  const cor = options.cor ?? [1, 1, 1];
  const forca = options.forca ?? 1;
  const pico = cor.map((c) => arredonda(c * forca)) as number[];
  const t0 = roundTime(Math.max(0, options.tempo));
  const t1 = roundTime(t0 + options.subida);
  const t2 = roundTime(t1 + options.descida);

  const chaves: ChavePlanejada[] = [];
  for (const slot of alvos) {
    const target = slotTarget(slot, 'darkColor');
    const agora = valorDeAgora(file, animation, t0, target);
    // `null` e ausente são a mesma coisa pela 7.12: sem tint black.
    const base = Array.isArray(agora) ? (agora as number[]).map(Number) : [0, 0, 0];
    chaves.push(
      { target, time: t0, value: [...base] },
      { target, time: t1, value: pico },
      { target, time: t2, value: [...base] },
    );
  }
  return {
    label,
    chaves,
    aviso: null,
    resumo: `${conta(chaves.length, 'chave', 'chaves')} de Cor escura em `
      + `${conta(alvos.length, 'desenho', 'desenhos')}, de ${segundos(t0)} a ${segundos(t2)}.`,
  };
}

// ---------------------------------------------------------------------------
// Pulso
// ---------------------------------------------------------------------------

export interface PulsoOptions {
  tempo: number;
  subida: number;
  descida: number;
  /** Quanto a escala cresce no pico. `1.2` = vinte por cento maior. */
  fator: number;
  /** `'ambos'` (o padrão), `'x'` ou `'y'`. */
  eixos?: 'ambos' | 'x' | 'y';
}

/**
 * A escala que cresce e volta, no tempo que a pessoa escolher.
 *
 * As duas primeiras chaves saem **suaves**, e não lineares: um pulso linear
 * anda em bico — cresce a velocidade constante, vira num canto e volta. Quem
 * pede um pulso quer o inchaço, e o inchaço é justamente a curva. A última não
 * leva curva nenhuma: a curva é sempre desta chave até a próxima (9.2), e
 * depois da última não há próxima — escrever ali seria campo morto no arquivo.
 *
 * O pico multiplica a escala **de agora**, e não substitui: um osso desenhado
 * no dobro do tamanho continua no dobro, com o pulso por cima.
 */
export function planoDoPulso(
  file: BoneFile, animation: string, bones: readonly string[], options: PulsoOptions,
): PlanoDeEfeito {
  const label = 'Pulso';
  const alvos = bones.filter((nome) => existe(file.bones, nome));
  if (alvos.length === 0) {
    return nada(label, 'Escolha um osso na Árvore ou na cena antes.');
  }
  if (!(options.subida > 0) || !(options.descida > 0)) {
    return nada(label, 'A subida e a descida têm de ser maior que zero: duas chaves no mesmo tempo seriam uma só.');
  }

  const eixos = options.eixos ?? 'ambos';
  const propriedades = eixos === 'x' ? ['scaleX'] : eixos === 'y' ? ['scaleY'] : ['scaleX', 'scaleY'];
  const t0 = roundTime(Math.max(0, options.tempo));
  const t1 = roundTime(t0 + options.subida);
  const t2 = roundTime(t1 + options.descida);

  const chaves: ChavePlanejada[] = [];
  for (const osso of alvos) {
    for (const propriedade of propriedades) {
      const target = boneTarget(osso, propriedade);
      const agora = valorDeAgora(file, animation, t0, target);
      const base = typeof agora === 'number' ? agora : 1;
      const pico = arredonda(base * options.fator);
      chaves.push(
        { target, time: t0, value: base, curve: suave(t0, base, t1, pico) },
        { target, time: t1, value: pico, curve: suave(t1, pico, t2, base) },
        { target, time: t2, value: base },
      );
    }
  }
  return {
    label,
    chaves,
    aviso: null,
    resumo: `${conta(chaves.length, 'chave', 'chaves')} de escala em `
      + `${conta(alvos.length, 'osso', 'ossos')}, de ${segundos(t0)} a ${segundos(t2)}`
      + ` — o pico é ${options.fator}× a escala de agora.`,
  };
}

// ---------------------------------------------------------------------------
// Tremor
// ---------------------------------------------------------------------------

export interface TremorOptions {
  tempo: number;
  /** Quanto o tremor dura, em segundos. */
  duracao: number;
  /** Quantos passos. `6` dá sete chaves: a primeira, cinco no meio e a de casa. */
  chaves: number;
  /** O maior deslocamento, em pixels. */
  amplitude: number;
  /** A semente. A mesma semente dá sempre o mesmo tremor. `0` é semente válida. */
  semente: number;
}

/**
 * A sequência de deslocamentos sorteados por uma semente fixa.
 *
 * **O balanço morre**: o deslocamento de cada passo é multiplicado por
 * `1 − i/n`, então o último é **zero** e o osso volta exatamente para onde
 * estava. Um tremor que larga o osso fora do lugar é um tremor que a pessoa
 * tem de consertar à mão toda vez.
 *
 * **O defeito do Unity que não vamos repetir** (`OS ERROS QUE NAO VAMOS
 * REPETIR`, §9): lá o Control Track embaralha a semente, e a animação sai
 * outra sem ninguém ter pedido. Aqui não há semente guardada para embaralhar —
 * o gesto sorteia, grava chaves e some. Duplicar a animação copia os números
 * que já estão lá, e eles são os mesmos para sempre.
 */
export function planoDoTremor(
  file: BoneFile, animation: string, bones: readonly string[], options: TremorOptions,
): PlanoDeEfeito {
  const label = 'Tremor';
  const alvos = bones.filter((nome) => existe(file.bones, nome));
  if (alvos.length === 0) {
    return nada(label, 'Escolha um osso na Árvore ou na cena antes.');
  }
  if (!(options.duracao > 0)) {
    return nada(label, 'A duração do tremor tem de ser maior que zero.');
  }
  const passos = Math.max(1, Math.floor(options.chaves));

  const t0 = roundTime(Math.max(0, options.tempo));
  const chaves: ChavePlanejada[] = [];
  for (let osso = 0; osso < alvos.length; osso++) {
    for (const propriedade of ['x', 'y'] as const) {
      const target = boneTarget(alvos[osso], propriedade);
      const agora = valorDeAgora(file, animation, t0, target);
      const base = typeof agora === 'number' ? agora : 0;
      for (let i = 0; i <= passos; i++) {
        const t = roundTime(t0 + (options.duracao * i) / passos);
        // Um osso por vez no sorteio: dois ossos escolhidos juntos não podem
        // tremer em uníssono, ou o grupo anda em bloco em vez de tremer.
        const u = acaso(options.semente, TREMOR_FLUXO + osso, i, TREMOR_CANAL[propriedade]);
        const morrendo = 1 - i / passos;
        // K15, a mesma forma (chat D, 29/09): a PRIMEIRA chave é o valor de
        // agora, sem sorteio. Numa linha nova, antes da primeira chave vale a
        // primeira chave (9.10) — sorteada, ela deixava o osso fora do lugar
        // desde o começo da animação. O tremor começa parado, e só então treme.
        const valor = i === 0 ? base : arredonda(base + (u * 2 - 1) * options.amplitude * morrendo);
        chaves.push({ target, time: t, value: valor });
      }
    }
  }
  const fim = roundTime(t0 + options.duracao);
  return {
    label,
    chaves,
    aviso: null,
    resumo: `${conta(chaves.length, 'chave', 'chaves')} de posição em `
      + `${conta(alvos.length, 'osso', 'ossos')}, de ${segundos(t0)} a ${segundos(fim)}`
      + ` — semente ${options.semente}, e a mesma semente dá sempre o mesmo tremor.`,
  };
}

// ---------------------------------------------------------------------------
// Gravar
// ---------------------------------------------------------------------------

/**
 * Grava as chaves do plano. Devolve quantas.
 *
 * Passa pelo `setKey`, que é a **única porta** por onde chave se escreve neste
 * editor: é ele quem cria a linha quando não há, mantém as chaves em ordem,
 * reparte a curva de um trecho quando a chave cai no meio dele, e levanta a
 * `duration` escrita para o efeito caber (9.11). Um efeito que montasse a
 * linha do tempo por fora perderia as quatro coisas de uma vez.
 *
 * Quem chama envolve isto num `EditKeys` de `pose-mode.ts`, que guarda a
 * animação inteira antes: o efeito desfaz num passo só.
 */
export function aplicarPlano(file: BoneFile, animation: string, plano: PlanoDeEfeito): number {
  for (const chave of plano.chaves) {
    // A curva vale só onde o valor é interpolável; numa linha parada o formato
    // só tem `stepped` (9.3), e escrever uma Bézier ali seria mentira no disco.
    const curva = targetInfo(chave.target, file).interpolable ? chave.curve : undefined;
    setKey(file, animation, chave.time, chave.target, chave.value, curva === undefined ? {} : { curve: curva });
  }
  return plano.chaves.length;
}
