/**
 * O que mostrar na miniatura de cada tipo de desenho — anotação 18, lote 32.
 *
 * O Humberto apontou duas linhas da aba Ordem com o quadrado vazio: *"o que é
 * isso?"*. Eram a `hand`, que é uma **sequência** de três imagens (`hand_01`,
 * `hand_02`, `hand_03`) e cujo `path` — `"hand_"` — não é nome de região
 * nenhuma; e a `weapon`, que é um **esqueleto filho** (`espada.bone`) e não tem
 * imagem para recortar. Nos dois casos a miniatura devolvia nulo e a linha
 * ficava com um buraco.
 *
 * **Quadrado vazio nunca mais.** Este módulo é quem decide, e ele é PURO: lê a
 * definição do attachment e diz o que a tela tem que desenhar — uma imagem
 * (com o nome dela), um esqueleto, ou o ícone do tipo. Quem desenha é o
 * `thumbnails.ts`; quem testa não precisa de navegador.
 */

import type { AttachmentDef, SequenceDef } from '../../../runtime/src/index.js';

/** O que a miniatura vai mostrar. */
export type ThumbPlan =
  /**
   * Uma imagem do atlas. `badge` é o número no cantinho: quantos quadros tem a
   * sequência. Sem sequência não há cantinho.
   */
  | { kind: 'imagem'; source: string; badge?: number }
  /** Um esqueleto filho, desenhado na pose de repouso. `source` é o `uri`. */
  | { kind: 'esqueleto'; source: string }
  /** Sem imagem possível: o ícone do tipo, com o nome do tipo na dica. */
  | { kind: 'icone'; icon: string; tipo: string };

/** O ícone e o nome de cada tipo que não tem imagem para mostrar. */
const POR_TIPO: Readonly<Record<string, { icon: string; tipo: string }>> = Object.freeze({
  boundingbox: { icon: 'box', tipo: 'caixa de colisão' },
  point: { icon: 'point', tipo: 'ponto' },
  path: { icon: 'path', tipo: 'caminho' },
  clipping: { icon: 'mask', tipo: 'máscara' },
  // Rodada 13 (segunda conferência): a palavra da tela é "entidade" desde a rodada 6.
  skeleton: { icon: 'bone', tipo: 'entidade' },
  // Extensão `BONE_particles` (§2.1): o tipo é SEMPRE prefixado e no singular,
  // porque um anexo é um emissor. Sem esta linha um emissor caía no buraco do
  // fim deste arquivo — o ícone genérico, e na dica o nome cru do tipo,
  // `"BONE_particle"`, em inglês e com prefixo. Era o "o que é isso?" da
  // anotação 18 outra vez, num tipo que o programa conhece.
  //
  // O emissor tem `path` (a imagem da partícula, §9.8), e ainda assim ele vem
  // para cá em vez de ir pelo ramo da imagem: a miniatura de UMA partícula não
  // diz que ali há um emissor, e é o emissor que a linha nomeia.
  BONE_particle: { icon: 'particle', tipo: 'emissor de partículas' },
});

/**
 * O nome da imagem do quadro `setup` de uma sequência (§7.10).
 *
 * Com `frames`, é o nome escrito ali. Sem `frames`, é o `path` com o número
 * colado: `start + setup`, com `digits` zeros à esquerda — `"olho_"`, start 1,
 * digits 2, setup 3 dá `"olho_04"`.
 */
export function sequenceFrameName(path: string, sequence: SequenceDef): string {
  const frames = sequence.frames;
  const setup = Math.trunc(sequence.setup ?? 0);
  if (frames !== undefined && frames.length > 0) {
    const i = Math.min(Math.max(setup, 0), frames.length - 1);
    return frames[i]!;
  }
  const start = Math.trunc(sequence.start ?? 1);
  const digits = Math.max(0, Math.trunc(sequence.digits ?? 0));
  const numero = String(start + Math.max(0, setup));
  return path + (digits > 0 ? numero.padStart(digits, '0') : numero);
}

/** Quantos quadros a sequência tem, ou `0` quando não é sequência. */
export function sequenceCount(sequence: SequenceDef | undefined): number {
  if (sequence === undefined) return 0;
  if (sequence.frames !== undefined && sequence.frames.length > 0) return sequence.frames.length;
  return Math.max(0, Math.trunc(sequence.count ?? 0));
}

/**
 * O que mostrar por este attachment.
 *
 * `name` é o nome do desenho, porque o `path` **é opcional**: ausente, o nome
 * do próprio desenho é o nome da imagem (§7.8). Sem definição nenhuma — um
 * slot vazio — o plano é o ícone de imagem, e a dica diz "sem desenho".
 */
export function thumbnailKind(def: AttachmentDef | null | undefined, name = ''): ThumbPlan {
  if (def === null || def === undefined) {
    return { kind: 'icone', icon: 'image', tipo: 'sem desenho' };
  }
  const tipo = def.type;
  if (tipo === 'region' || tipo === 'mesh' || tipo === 'linkedmesh') {
    const path = def.path ?? name;
    const sequence = def.sequence;
    const quantos = sequenceCount(sequence);
    if (sequence !== undefined && quantos > 0) {
      return { kind: 'imagem', source: sequenceFrameName(path, sequence), badge: quantos };
    }
    return { kind: 'imagem', source: path };
  }
  if (tipo === 'skeleton') {
    return { kind: 'esqueleto', source: def.uri };
  }
  const conhecido = POR_TIPO[tipo];
  if (conhecido !== undefined) return { kind: 'icone', ...conhecido };
  // Tipo que este editor não conhece: o arquivo pode ser mais novo que ele.
  // Mostrar o ícone genérico e o nome do tipo é melhor do que nada, e é o que
  // deixa a pessoa ver que ali existe alguma coisa.
  return { kind: 'icone', icon: 'image', tipo };
}
