/**
 * **O peso do emissor** — rodada 16, lote 6 (05/10/2026).
 *
 * O Humberto pediu balanceamento: o que é bom ter, e o que pesa demais. O selo
 * diz, **com palavra** (leve · médio · pesado) e com o número, quantas
 * partículas o emissor tem vivas de uma vez — e o boneco inteiro. **Avisa,
 * nunca impede**: o jogo pode ter um boneco só na tela.
 *
 * De onde vêm os números (plano `16 AS PARTICULAS`, seção 6):
 *
 * | Medida | Fonte |
 * |:---|:---|
 * | ~50 µs por partícula no Godot | rodada G8: dez heróis com faíscas, 34 a 37 ms por quadro |
 * | "algumas centenas" derrubam o Construct | o manual do Construct; o leitor K6 avisa acima de 300 |
 * | meio quadro a 60 fps = 8 ms ≈ 160 partículas | a conta |
 *
 * As vivas são uma **estimativa de cima**, sem rodar o tempo: a taxa vezes a
 * vida mais longa, mais o maior número de rajadas que nasce dentro de uma vida,
 * tudo cortado pelo Máximo de vivas. É o número que o leitor do jogo desenha
 * no pior quadro. Pura: nada aqui lê a tela.
 */

import type { BoneFile } from '../../../runtime/src/index.js';

/** Microssegundos por partícula, medidos no leitor do Godot (G8, 05/10/2026). */
export const MICROSSEGUNDOS_POR_PARTICULA = 50;

/** Os tetos de cada palavra: por emissor, e pelo boneco inteiro (a soma). */
export const LIMITES_DO_EMISSOR = { leve: 60, medio: 150 } as const;
export const LIMITES_DO_BONECO = { leve: 100, medio: 300 } as const;

export type WeightWord = 'leve' | 'médio' | 'pesado';

export interface Weight {
  readonly vivas: number;
  readonly palavra: WeightWord;
  /** Quanto custa no Godot, em ms por quadro, por boneco assim. */
  readonly ms: number;
}

const num = (v: unknown, padrao: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : padrao);

/** Teto de nascimentos de rajada que se conta, para uma rajada de um milhão de ciclos não travar a conta. */
const CICLOS_CONTADOS = 4096;

/**
 * **Quantas vivas de uma vez, no pior quadro** (estimativa de cima). A taxa
 * contínua dá `taxa × vida máxima`; as rajadas, o maior número delas que nasce
 * dentro de uma janela de uma vida. O Máximo de vivas corta tudo.
 */
export function emitterLiveEstimate(def: Record<string, unknown>): number {
  const vida = Array.isArray(def.lifetime) ? num(def.lifetime[1], 1) : 1;
  const taxa = def.emitting === false ? 0 : num(def.rate, 10);
  const continuas = taxa * vida;
  // As rajadas: cada nascimento é (instante, quantas); a pior janela de uma vida.
  const nascimentos: Array<[number, number]> = [];
  if (Array.isArray(def.bursts)) {
    for (const b of def.bursts) {
      const o = (b ?? {}) as Record<string, unknown>;
      const ciclos = Math.min(CICLOS_CONTADOS, Math.max(1, Math.round(num(o.cycles, 1))));
      const passo = num(o.interval, 1);
      const quantas = Math.max(1, num(o.count, 1)) * Math.min(1, Math.max(0, num(o.probability, 1)));
      for (let c = 0; c < ciclos; c++) nascimentos.push([num(o.time, 0) + c * passo, quantas]);
    }
  }
  nascimentos.sort((a, b) => a[0] - b[0]);
  let rajadas = 0;
  let soma = 0;
  let ini = 0;
  for (let fim = 0; fim < nascimentos.length; fim++) {
    soma += nascimentos[fim]![1];
    while (nascimentos[fim]![0] - nascimentos[ini]![0] >= vida) { soma -= nascimentos[ini]![1]; ini++; }
    rajadas = Math.max(rajadas, soma);
  }
  const teto = Math.max(1, num(def.maxParticles, 1000));
  return Math.min(teto, Math.ceil(continuas + rajadas));
}

function palavra(vivas: number, limites: { leve: number; medio: number }): WeightWord {
  return vivas <= limites.leve ? 'leve' : vivas <= limites.medio ? 'médio' : 'pesado';
}

const ms = (vivas: number): number => Math.round((vivas * MICROSSEGUNDOS_POR_PARTICULA) / 100) / 10;

export function emitterWeight(def: Record<string, unknown>): Weight {
  const vivas = emitterLiveEstimate(def);
  return { vivas, palavra: palavra(vivas, LIMITES_DO_EMISSOR), ms: ms(vivas) };
}

/** Os emissores do arquivo: um por slot e nome, mesmo que mais de uma skin o tenha. */
export function emittersOf(file: BoneFile): Array<{ slot: string; name: string; def: Record<string, unknown> }> {
  const vistos = new Map<string, { slot: string; name: string; def: Record<string, unknown> }>();
  for (const skin of file.skins ?? []) {
    const porSlot = (skin.attachments ?? {}) as Record<string, Record<string, Record<string, unknown>>>;
    for (const [slot, porNome] of Object.entries(porSlot)) {
      for (const [name, def] of Object.entries(porNome ?? {})) {
        if (def?.type !== 'BONE_particle') continue;
        const chave = `${slot}/${name}`;
        if (!vistos.has(chave)) vistos.set(chave, { slot, name, def });
      }
    }
  }
  return [...vistos.values()];
}

/** O boneco inteiro: a soma das vivas de todos os emissores. */
export function skeletonWeight(file: BoneFile): Weight {
  const vivas = emittersOf(file).reduce((n, e) => n + emitterLiveEstimate(e.def), 0);
  return { vivas, palavra: palavra(vivas, LIMITES_DO_BONECO), ms: ms(vivas) };
}

const virgula = (v: number): string => String(v).replace('.', ',');

/** **O selo**: a palavra e o número, curto, para o título da ficha. */
export function weightBadge(w: Weight): string {
  return `${w.palavra} · ${w.vivas}`;
}

/** **A dica do selo**: de onde vem a conta, e o que cada palavra quer dizer. */
export function weightHint(emissor: Weight, boneco: Weight): string {
  return `Peso: ${emissor.palavra}. Este emissor tem até ~${emissor.vivas} partículas vivas de uma vez `
    + `(a taxa vezes a vida, mais as rajadas, até o Máximo de vivas). `
    + `No Godot cada partícula custa ~${MICROSSEGUNDOS_POR_PARTICULA} µs: ~${virgula(emissor.ms)} ms por quadro por boneco assim `
    + `(meio quadro a 60 fps são 8 ms). Leve até ${LIMITES_DO_EMISSOR.leve}, médio até ${LIMITES_DO_EMISSOR.medio}, pesado acima. `
    + `O boneco inteiro: ~${boneco.vivas} vivas, ${boneco.palavra} (leve até ${LIMITES_DO_BONECO.leve}, médio até ${LIMITES_DO_BONECO.medio}). `
    + 'Só avisa: nada é impedido.';
}

/**
 * **As linhas da barra de avisos** — só o que é **pesado**. O médio fica no
 * selo: aviso que aparece sempre deixa de ser lido.
 */
export function weightWarningLines(file: BoneFile): string[] {
  const out: string[] = [];
  for (const e of emittersOf(file)) {
    const w = emitterWeight(e.def);
    if (w.palavra !== 'pesado') continue;
    out.push(`emissor "${e.name}" (slot ${e.slot}): pesado — ~${w.vivas} partículas vivas de uma vez, ~${virgula(w.ms)} ms por quadro no Godot. `
      + `Acima de ${LIMITES_DO_EMISSOR.medio} pesa; baixe a taxa ou a vida, ou ponha um Máximo de vivas`);
  }
  const boneco = skeletonWeight(file);
  if (boneco.palavra === 'pesado') {
    out.push(`o boneco: pesado — ~${boneco.vivas} partículas vivas somando os emissores, ~${virgula(boneco.ms)} ms por quadro no Godot. `
      + `Acima de ${LIMITES_DO_BONECO.medio} o Construct também sofre ("algumas centenas", diz o manual)`);
  }
  return out;
}
