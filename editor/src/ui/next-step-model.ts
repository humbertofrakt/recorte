/**
 * **O passo seguinte** — rodada final, P19 (29/09/2026).
 *
 * 🗣️ *"Quero fazer um arroz. Eu pego uma panela, boto água, boto no fogão,
 * quando a água estiver fervendo eu boto o arroz. No programa, eu sinto que
 * não tem panela, que não tem arroz"* — o Humberto, 28/09/2026.
 *
 * O rodapé já dizia ONDE se está (`where-model.ts`: *"Base: heroi"*). Isto diz
 * O QUE VEM DEPOIS, numa frase só, com o caminho de clique escrito. É a quarta
 * pergunta da régua do arroz: *"ficou óbvio qual é o passo seguinte?"*.
 *
 * **A ordem é a do Spriter** (fluxo da casa), lida nas filas dos chats J e K:
 * `SEQUENCIA do zero ao boneco montado 2026-09-28.md` e `SEQUENCIA animar um
 * ciclo de andar 2026-09-28.md`, ambas com link para o manual oficial.
 *
 * | # | Falta | A frase aponta |
 * |:-:|:---|:---|
 * | 1 | imagem nenhuma | Arquivo → Abrir pasta do projeto… |
 * | 2 | imagem fora da cena | arrastar da aba Imagens |
 * | 3 | osso nenhum | Criar osso (B) |
 * | 4 | imagem solta, sem osso | segurar P e clicar (Virar filho de…) |
 * | 5 | nunca salvo | Arquivo → Salvar (Ctrl+S) |
 * | 6 | animação nenhuma | Animação → Nova animação |
 * | 7 | a base aberta | clicar na animação, aba Animações |
 * | 8 | chave nenhuma | posar: mexer grava chave |
 * | 9 | chave num instante só | andar no tempo e posar de novo |
 * | 10 | não repete | Animação → Repetir (L) |
 * | 11 | pronto para ver | tocar (Espaço) |
 *
 * **Só sugere; nunca faz.** E nunca adivinha: o que ela não sabe medir (se a
 * pose está boa, se o pivô está certo) ela não diz — regra 21.
 *
 * Módulo puro: recebe números e devolve palavras. Quem mede é a casca.
 */

import type { BoneFile } from '../../../runtime/src/index.js';

/** O que a dica precisa saber. Tudo contado pela casca, do documento. */
export interface NextStepInput {
  /** Imagens que existem para usar: as da aba Imagens, e as do atlas. */
  images: number;
  /** Desenhos (slots) na cena. */
  drawings: number;
  /** Ossos, **sem contar** as raízes. */
  bones: number;
  /** Quantos desenhos estão pendurados direto numa raiz. */
  drawingsOnRoot: number;
  /** Animações no arquivo. */
  animations: number;
  /** `doc.animation`: `null` = a base aberta. */
  animation: string | null;
  /** Instantes DIFERENTES com chave, na animação aberta. */
  keyTimes: number;
  /** A animação aberta repete (`animation.loop`, §4.6). */
  loops: boolean;
  /** Nunca foi salvo em disco (`doc.path === null`). */
  neverSaved: boolean;
}

export type NextStepId =
  | 'pasta' | 'na-cena' | 'ossos' | 'ligar' | 'salvar' | 'animacao'
  | 'abrir-animacao' | 'posar' | 'outro-tempo' | 'repetir' | 'tocar';

export interface NextStep {
  id: NextStepId;
  /** A frase do rodapé, curta: *"Próximo: crie os ossos"*. */
  text: string;
  /** O caminho de clique, dito por extenso. Vai na dica (`title`) do rodapé. */
  how: string;
  /**
   * **O gesto, curto, e um caminho só** — P66 (29/09/2026). É o que se lê no
   * rodapé, ao lado da frase. Com os três campos brigando por largura, a
   * frase longa era cortada no fim, e perdia justamente o caminho de clique.
   * A frase visível inteira (`nextStepVisible`) tem no máximo 80 letras.
   */
  short: string;
  /**
   * O id de ação que faz o passo, quando há um — para um clique na frase
   * levar lá. Conferido contra `ui/actions-table.ts` pelo teste: a dica não
   * pode citar uma porta que não existe.
   */
  action: string | null;
}

/** As frases, escritas uma vez. O teste confere cada `action` e cada menu. */
export const NEXT_STEPS: Readonly<Record<NextStepId, NextStep>> = Object.freeze({
  'pasta': {
    id: 'pasta', text: 'Próximo: traga as imagens',
    how: 'Arquivo → Abrir pasta do projeto…', short: 'Arquivo → Abrir pasta do projeto…', action: 'abrir-pasta',
  },
  'na-cena': {
    id: 'na-cena', text: 'Próximo: ponha uma imagem na cena',
    how: 'arraste da aba Imagens para a cena', short: 'arraste da aba Imagens para a cena', action: null,
  },
  'ossos': {
    id: 'ossos', text: 'Próximo: crie os ossos',
    how: 'ferramenta Criar osso (B): arraste na cena, do começo ao fim do osso',
    short: 'Criar osso (B), e arraste na cena', action: null,
  },
  'ligar': {
    id: 'ligar', text: 'Próximo: ligue as imagens aos ossos',
    how: 'escolha o osso, segure P e clique na imagem (Base → Virar filho de…)',
    short: 'segure P e clique na imagem', action: 'virar-filho',
  },
  'salvar': {
    id: 'salvar', text: 'Próximo: salve o boneco',
    how: 'Arquivo → Salvar (Ctrl+S)', short: 'Arquivo → Salvar (Ctrl+S)', action: 'salvar',
  },
  'animacao': {
    id: 'animacao', text: 'Próximo: crie uma animação',
    how: 'Animação → Nova animação', short: 'Animação → Nova animação', action: 'nova-animacao',
  },
  'abrir-animacao': {
    id: 'abrir-animacao', text: 'Próximo: abra uma animação',
    how: 'clique no nome dela, na aba Animações', short: 'clique no nome dela, na aba Animações', action: null,
  },
  'posar': {
    id: 'posar', text: 'Próximo: pose o boneco',
    how: 'mexa num osso: a chave nasce sozinha', short: 'mexa num osso: a chave nasce sozinha', action: null,
  },
  'outro-tempo': {
    id: 'outro-tempo', text: 'Próximo: ande no tempo e pose de novo',
    how: 'clique mais adiante na régua da Linha do tempo e mexa no boneco',
    short: 'clique mais adiante na régua', action: null,
  },
  'repetir': {
    id: 'repetir', text: 'Esta animação para no fim',
    how: 'toque com Espaço. Para um ciclo: Animação → Repetir (L)',
    short: 'para um ciclo: Animação → Repetir (L)', action: 'repetir',
  },
  'tocar': {
    id: 'tocar', text: 'Próximo: toque para ver',
    how: 'Animação → Tocar / Pausar (Espaço)', short: 'tecla Espaço', action: 'tocar',
  },
});

/** O que a casca sabe e o arquivo não diz. */
export interface NextStepContext {
  /** `doc.animation`. */
  animation: string | null;
  /** `doc.path`. */
  path: string | null;
  /** Imagens para usar: as da aba Imagens, ou as regiões do atlas. */
  images: number;
}

/**
 * Conta, do `.bone`, o que a dica precisa. Os ossos e desenhos são os do
 * **corpo** em foco; as animações são do arquivo aberto.
 */
export function nextStepInputOf(body: BoneFile, file: BoneFile, context: NextStepContext): NextStepInput {
  const bones = body.bones ?? [];
  const roots = new Set(bones.filter((bone) => bone.parent === undefined).map((bone) => bone.name));
  const slots = body.slots ?? [];
  const animations = file.animations ?? [];
  const open = context.animation === null
    ? undefined
    : animations.find((animation) => animation.name === context.animation);
  const times = new Set<number>();
  for (const timeline of open?.timelines ?? []) {
    const keys = (timeline as { keys?: Array<{ time?: number }> }).keys;
    for (const key of keys ?? []) times.add(key.time ?? 0);
  }
  return {
    images: context.images,
    drawings: slots.length,
    bones: bones.length - roots.size,
    drawingsOnRoot: slots.filter((slot) => roots.has(slot.bone)).length,
    animations: animations.length,
    animation: open === undefined ? null : context.animation,
    keyTimes: times.size,
    // §4.6: sem o campo, a animação NÃO repete. É o K6.
    loops: open?.loop === true,
    neverSaved: context.path === null,
  };
}

/**
 * A frase em duas partes: a que abre, em destaque, e o resto — o ajuste da
 * cor, 29/09/2026. "Próximo:" é a palavra que se procura com o olho; sem ela
 * (a animação que não repete), o destaque é a frase curta inteira.
 */
export function nextStepParts(step: NextStep): { destaque: string; resto: string } {
  const PROXIMO = 'Próximo:';
  if (step.text.startsWith(PROXIMO)) {
    return { destaque: PROXIMO, resto: `${step.text.slice(PROXIMO.length).trim()} — ${step.short}` };
  }
  return { destaque: step.text, resto: `— ${step.short}` };
}

/** A frase que se LÊ no rodapé: a frase e o gesto curto (P66, até 80 letras). */
export function nextStepVisible(step: NextStep): string {
  return `${step.text} — ${step.short}`;
}

/** A frase INTEIRA, com o caminho de clique por extenso: vai na dica (`title`). */
export function nextStepLine(step: NextStep): string {
  return `${step.text} — ${step.how}`;
}

/**
 * O passo seguinte, ou `null` quando não há o que sugerir.
 *
 * A fila é lida de cima para baixo, e o PRIMEIRO buraco ganha: não adianta
 * mandar animar um boneco que não tem osso.
 */
export function nextStep(input: NextStepInput): NextStep | null {
  const step = (id: NextStepId): NextStep => NEXT_STEPS[id];
  // Montar.
  if (input.drawings === 0) return step(input.images === 0 ? 'pasta' : 'na-cena');
  if (input.bones === 0) return step('ossos');
  if (input.drawingsOnRoot === input.drawings) return step('ligar');
  if (input.neverSaved) return step('salvar');
  // Animar.
  if (input.animations === 0) return step('animacao');
  if (input.animation === null) return step('abrir-animacao');
  if (input.keyTimes === 0) return step('posar');
  if (input.keyTimes === 1) return step('outro-tempo');
  if (!input.loops) return step('repetir');
  return step('tocar');
}
