/**
 * As etiquetas do Aseprite viram animação — rodada final, Ficha E, lote 2
 * (28/09/2026). Decisão D3 do encargo: *"sim, uma por etiqueta, com aviso no
 * rodapé"*.
 *
 * Desde a v22.5 a folha entra arrastando e vira UM desenho com `sequence`
 * (§7.10). As etiquetas eram lidas (`sheet.tags`) e não viravam nada: quem
 * soltava `heroi.png` + `heroi.json` com `andar`, `correr` e `pular` ganhava
 * o desenho e tinha de refazer à mão as três animações que o Aseprite já sabia.
 *
 * ## Uma chave por quadro, e não uma chave só
 *
 * A casa escolheu, no degrau 6, *"uma chave só: a sequência é uma função do
 * tempo"* (`anim/sequence-key.ts`). Aqui não dá, por dois motivos medidos:
 *
 * - o modo `loop` anda pela sequência INTEIRA (0 a n−1), e a etiqueta é um
 *   **trecho** dela (os quadros 4 a 6 de uma folha de 12);
 * - o Aseprite deixa cada quadro com a sua duração, e `delay` é um só.
 *
 * Então cada quadro é uma chave `hold` com o `index` dele, no tempo somado
 * das durações. É o modelo do Spriter — uma chave a cada troca de imagem —,
 * e é o único exato. A referência está em
 * `documentos/pesquisa/nova pesquisa/REFERENCIA arquivo e importar 2026-09-28.md`.
 *
 * Módulo do degrau 2 (`io/`): puro, sem DOM. O comando também mora aqui,
 * porque ele só precisa do contrato.
 */

import type { AnimationDef, BoneFile, KeyDef } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';
import { sequenceKeyValue } from '../anim/sequence-key.js';
import type { AsepriteSheet, SheetTag } from './aseprite-sheet.js';

// ---------------------------------------------------------------------------
// A ordem dos quadros
// ---------------------------------------------------------------------------

/** As quatro direções que o Aseprite escreve (`src/doc/anidir.cpp`). */
export const ASEPRITE_DIRECTIONS: readonly string[] = Object.freeze([
  'forward', 'reverse', 'pingpong', 'pingpong_reverse',
]);

/** `a, a+1, …, b` quando `a <= b`; `a, a−1, …, b` quando `a > b`. */
function run(a: number, b: number): number[] {
  const out: number[] = [];
  const step = a <= b ? 1 : -1;
  for (let i = a; i !== b + step; i += step) out.push(i);
  return out;
}

/**
 * Os quadros de uma etiqueta, na ordem em que o Aseprite os toca, numa volta.
 * `null` quando a direção é desconhecida — quem chamou diz isso por escrito.
 *
 * | direção | etiqueta 0–3, sem `repeat` | com `repeat: 3` |
 * |:---|:---|:---|
 * | `forward` | 0 1 2 3 | 0 1 2 3 ×3 |
 * | `reverse` | 3 2 1 0 | 3 2 1 0 ×3 |
 * | `pingpong` | 0 1 2 3 2 1 | 0 1 2 3 2 1 0 1 2 3 |
 * | `pingpong_reverse` | 3 2 1 0 1 2 | 3 2 1 0 1 2 3 2 1 0 |
 *
 * **No vai-e-volta cada SENTIDO gasta uma repetição**, e a ponta da virada
 * não se repete — é o que `src/doc/playback.cpp` faz. Sem `repeat`, o
 * vai-e-volta é uma ida e uma volta sem as duas pontas da volta, para que o
 * laço (`loop: true`) emende sem mostrar o quadro 0 duas vezes seguidas.
 */
export function tagFrameOrder(tag: SheetTag): number[] | null {
  const { from, to } = tag;
  switch (tag.direction) {
    case 'forward':
    case 'reverse': {
      const once = tag.direction === 'forward' ? run(from, to) : run(to, from);
      const times = tag.repeat ?? 1;
      const out: number[] = [];
      for (let i = 0; i < times; i++) out.push(...once);
      return out;
    }
    case 'pingpong':
    case 'pingpong_reverse': {
      const [start, end] = tag.direction === 'pingpong' ? [from, to] : [to, from];
      if (from === to) return [from];
      if (tag.repeat === null) {
        // Ida inteira, volta sem as pontas: 0 1 2 3 | 2 1.
        const back = run(end, start).slice(1, -1);
        return [...run(start, end), ...back];
      }
      // N sentidos; a partir do segundo, a ponta da virada não se repete.
      const out = run(start, end);
      for (let pass = 1; pass < tag.repeat; pass++) {
        const forward = pass % 2 === 0;
        out.push(...(forward ? run(start, end) : run(end, start)).slice(1));
      }
      return out;
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// A animação
// ---------------------------------------------------------------------------

/** Onde as chaves vão: o desenho que a folha acabou de criar (§9.6). */
export interface SheetTarget {
  slot: string;
  attachment: string;
  skin: string;
}

/** O que a tradução deu: as animações prontas, e o que ficou de fora e por quê. */
export interface TagAnimations {
  animations: AnimationDef[];
  /** Uma frase por etiqueta que NÃO virou animação. Nunca some calada (regra 21). */
  skipped: string[];
}

/**
 * Uma animação por etiqueta da folha.
 *
 * `taken` são os nomes de animação que o arquivo já tem: um `andar` que já
 * existe não é trocado, e o da folha entra como `andar2`.
 *
 * O tempo é somado em **milissegundos inteiros** e só então dividido por mil:
 * três quadros de 100 ms dão `0.3`, e não o `0.30000000000000004` que a soma
 * de `0.1` três vezes daria — uma chave em `time == duration` que escapa por
 * um fio vira L1 (§9.11).
 */
export function tagAnimations(
  sheet: AsepriteSheet, target: SheetTarget, taken: Iterable<string>,
): TagAnimations {
  const used = new Set(taken);
  const animations: AnimationDef[] = [];
  const skipped: string[] = [];
  const count = sheet.frames.length;

  for (const tag of sheet.tags) {
    const name = tag.name.trim();
    if (name === '') {
      skipped.push(`uma etiqueta sem nome (quadros ${tag.from + 1} a ${tag.to + 1})`);
      continue;
    }
    if (!Number.isInteger(tag.from) || !Number.isInteger(tag.to)
      || tag.from < 0 || tag.to >= count || tag.from > tag.to) {
      skipped.push(`"${name}": quadros ${tag.from + 1} a ${tag.to + 1}, e a folha tem ${count}`);
      continue;
    }
    const order = tagFrameOrder(tag);
    if (order === null) {
      skipped.push(`"${name}": direção "${tag.direction}", que o Aseprite não escreve`);
      continue;
    }

    const keys: KeyDef[] = [];
    let ms = 0;
    for (const index of order) {
      keys.push({ time: ms / 1000, value: sequenceKeyValue('hold', index, 0, count) as never });
      // Quadro sem duração (0 ou ausente já vira 100 na leitura) ainda anda um
      // milissegundo: duas chaves no mesmo `time` são L1 (§9.1).
      ms += Math.max(1, Math.round(sheet.durations[index] ?? 100));
    }

    const unique = uniqueName(name, used);
    used.add(unique);
    animations.push({
      name: unique,
      duration: ms / 1000,
      // Sem `repeat` o Aseprite repete sempre na tela dele. Com número, toca
      // aquilo e para — a volta já está escrita inteira nas chaves.
      loop: tag.repeat === null,
      timelines: [{
        type: 'sequence', target: target.slot, skin: target.skin, attachment: target.attachment, keys,
      }],
    });
  }
  return { animations, skipped };
}

/** A frase do rodapé: quantas entraram, com os nomes, e o que ficou de fora. */
export function tagAnimationsNotice(result: TagAnimations): string {
  const n = result.animations.length;
  const entraram = n === 0
    ? 'Nenhuma etiqueta virou animação'
    : `${n} ${n === 1 ? 'etiqueta virou animação' : 'etiquetas viraram animação'} `
      + `(${result.animations.map((a) => a.name).join(', ')})`;
  if (result.skipped.length === 0) return entraram;
  return `${entraram}. Ficou de fora: ${result.skipped.join('; ')}`;
}

// ---------------------------------------------------------------------------
// Os comandos
// ---------------------------------------------------------------------------

/**
 * Põe as animações das etiquetas no fim da lista, e as tira de volta.
 *
 * O `revert` tira pelo NOME guardado, e não pela posição: é a forma do
 * defeito 1 de 19/09 (*"guardei o índice, e outro comando mexeu na lista"*).
 */
export class AddSheetAnimations implements Command {
  readonly label = 'Etiquetas do Aseprite viram animação';
  readonly kind: ChangeKind = 'structure';
  private madeList = false;

  constructor(private readonly animations: readonly AnimationDef[]) {}

  apply(doc: EditorDoc): void {
    const file = doc.file as BoneFile;
    this.madeList = file.animations === undefined;
    const list = file.animations ?? (file.animations = []);
    // Cópia a cada `apply`: refazer depois de desfazer não pode entregar ao
    // arquivo o mesmo objeto que alguém mexeu no meio do caminho.
    for (const animation of this.animations) list.push(JSON.parse(JSON.stringify(animation)));
  }

  revert(doc: EditorDoc): void {
    const file = doc.file as BoneFile;
    const names = new Set(this.animations.map((a) => a.name));
    if (file.animations !== undefined) {
      file.animations = file.animations.filter((a) => !names.has(a.name));
      if (this.madeList && file.animations.length === 0) delete (file as { animations?: unknown }).animations;
    }
  }
}

/**
 * Dois comandos que são UM gesto: o desenho da folha e as animações dela.
 *
 * Soltar a folha é um gesto só, e um `Ctrl+Z` tem de tirar tudo o que ele
 * trouxe — o desenho E as animações. Duas entradas na pilha deixariam, depois
 * do primeiro `Ctrl+Z`, animações apontando para um slot que já não existe.
 *
 * Os dois recebem o MESMO documento: a animação aponta para o slot, e o slot
 * tem de estar no arquivo em que a animação mora (§9.6).
 */
export class SheetDropCommand implements Command {
  readonly kind: ChangeKind = 'structure';

  constructor(
    readonly label: string,
    private readonly first: Command,
    private readonly second: Command,
  ) {}

  apply(doc: EditorDoc): void {
    this.first.apply(doc);
    this.second.apply(doc);
  }

  revert(doc: EditorDoc): void {
    this.second.revert(doc);
    this.first.revert(doc);
  }
}
