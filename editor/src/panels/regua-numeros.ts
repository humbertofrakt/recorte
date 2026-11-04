/**
 * **A régua dos números da ficha** — rodada 47, lote 2 (07/10/2026).
 *
 * A ficha completa tinha ~79 campos feitos com `num()`: sem unidade, sem
 * faixa, sem dica — `0.5` sozinho, a queixa que abriu o polimento (doc `26`:
 * *"uma caixa com (0.5), não entendi: é de 0 a 1?"*). Aqui mora, num lugar só,
 * o que cada um desses números É: a unidade (depois da caixa, régua R2 do doc
 * `68`), a escala da tela e a dica no molde da casa (R4):
 *
 *     Nome, em UNIDADE, de X a Y: o que faz. Típico: …
 *
 * **O que é de 0 a 1 no arquivo aparece de 0 a 100 %** (`scale: 100`). É o que
 * o Pincel já faz desde a rodada 41 (doc `43`, S2) e o que o Spine faz com o
 * *mix*: ninguém lê `0,35` como "35 %". O arquivo continua de 0 a 1.
 *
 * As frases vêm da especificação (`formato/ESPECIFICACAO`, §6.2 a §6.5, §3.5),
 * e não de memória: cada linha diz o que o runtime faz com o número.
 *
 * Puro: uma tabela e uma função. Quem aplica é o `properties-model.ts`.
 */

/** As unidades que um número da ficha pode ter. Vazio: o rótulo já diz o que é. */
export type Unidade = 'px' | '°' | '×' | '%' | 's' | '/s' | 'px/s' | 'px/s²' | '°/s' | '';

/** O que a régua sabe de um número. */
export interface Medida {
  unit: Unidade;
  /** O número na tela é o do arquivo vezes isto. Sem escala, 1. */
  scale?: number;
  /**
   * A faixa, na escala do ARQUIVO — Rodada 47, lote 3 (notas do doc 84): arrastar o rótulo da Força
   * (0 a 100 %) passava a 140. A ficha trava nela, na conta, nas setas e no
   * arrasto.
   */
  min?: number;
  max?: number;
  hint: string;
  /** O rótulo curto, quando o de hoje passa de três palavras ou leva a unidade. */
  label?: string;
}

const pct = (nome: string, faz: string, tipico = 100): Medida => ({
  unit: '%', scale: 100, min: 0, max: 1,
  hint: `${nome}, em %, de 0 a 100: ${faz}. Típico: ${tipico} %`,
});

const forca = (parte: string): Medida => pct(`Força ${parte}`, `quanto ${parte} do alvo o osso copia; 0 não copia nada`);

/**
 * A tabela: `onde|chave`. `onde` é a seção da ficha (`regra`, `ik`,
 * `transformacao`, `caminho`, `fisica`, `base`, `ponto`, `emissor`).
 */
export const REGUA: Readonly<Record<string, Medida>> = Object.freeze({
  // §6 — toda regra
  'regra|mix': pct('Força da regra', '0 desliga a regra, 100 é a regra inteira'),

  // §6.2 — IK
  'ik|softness': {
    unit: 'px',
    hint: 'Suavidade, em px, de 0 a +∞: a distância antes do braço esticar todo em que o movimento amacia. 0 é seco. Típico: 0 a 20 px',
  },

  // §6.3 — transformação
  'transformacao|offsetRotation': { unit: '°', label: 'Somar giro', hint: 'Somar giro, em graus (°), de −360 a 360: somado ao giro do alvo. 0 não muda' },
  'transformacao|offsetX': { unit: 'px', label: 'Somar X', hint: 'Somar X, em px, de −∞ a +∞, no espaço do alvo: somado à posição dele. 0 não muda' },
  'transformacao|offsetY': { unit: 'px', label: 'Somar Y', hint: 'Somar Y, em px, de −∞ a +∞, no espaço do alvo: somado à posição dele. 0 não muda' },
  'transformacao|offsetScaleX': { unit: '×', label: 'Somar escala X', hint: 'Somar escala X, em × (vezes), de −∞ a +∞: somado à escala do alvo; 0 não muda, 0,5 soma meia' },
  'transformacao|offsetScaleY': { unit: '×', label: 'Somar escala Y', hint: 'Somar escala Y, em × (vezes), de −∞ a +∞: somado à escala do alvo; 0 não muda, 0,5 soma meia' },
  'transformacao|offsetShearY': { unit: '°', label: 'Somar inclinação Y', hint: 'Somar inclinação Y, em graus (°), de −360 a 360: somado à inclinação Y do alvo. 0 não muda' },
  'transformacao|mixRotation': { ...forca('da rotação'), label: 'Rotação' },
  'transformacao|mixX': { ...forca('de X'), label: 'X' },
  'transformacao|mixY': { ...forca('de Y'), label: 'Y' },
  'transformacao|mixScaleX': { ...forca('da escala X'), label: 'Escala X' },
  'transformacao|mixScaleY': { ...forca('da escala Y'), label: 'Escala Y' },
  'transformacao|mixShearY': { ...forca('da inclinação Y'), label: 'Inclinação Y' },

  // §6.4 — caminho (posição e espaço dependem do modo: `medidaDoCaminho`)
  'caminho|offsetRotation': { unit: '°', label: 'Somar giro', hint: 'Somar giro, em graus (°), de −360 a 360: somado à rotação que o caminho dá. 0 não muda' },
  'caminho|mixRotation': { ...forca('da rotação'), label: 'Rotação' },
  'caminho|mixX': { ...forca('de X'), label: 'X' },
  'caminho|mixY': { ...forca('de Y'), label: 'Y' },

  // §6.5 — física
  'fisica|x': { ...pct('Em X', 'quanto da simulação vai para a posição X do osso; 0 não balança em X', 0), label: 'Em X' },
  'fisica|y': { ...pct('Em Y', 'quanto da simulação vai para a posição Y do osso; 0 não balança em Y', 0), label: 'Em Y' },
  'fisica|rotation': { ...pct('No giro', 'quanto da simulação vai para o giro do osso', 0), label: 'No giro' },
  'fisica|scaleX': { ...pct('Na escala X', 'quanto da simulação estica e encolhe o osso', 0), label: 'Na escala X' },
  'fisica|shearX': { ...pct('Na inclinação X', 'quanto da simulação entorta o osso', 0), label: 'Na inclinação X' },
  'fisica|inertia': pct('Inércia', 'quanto do movimento do osso vira atraso', 50),
  'fisica|damping': pct('Amortecimento', '100 não freia; menos freia a velocidade a cada 1/60 s'),
  'fisica|strength': { unit: '', min: 0, hint: 'Força da mola, de 0 a +∞: puxa o osso de volta ao lugar. 0 solta. Típico: 100' },
  'fisica|mass': { unit: '', min: 0.01, hint: 'Massa, de 0,01 a +∞: mais pesado responde mais devagar. Típico: 1' },
  'fisica|wind': { unit: '', hint: 'Vento, de −∞ a +∞, para a direita (negativo: para a esquerda): uma força que não para. Típico: 0' },
  'fisica|gravity': { unit: '', hint: 'Gravidade, de −∞ a +∞, para baixo (negativo: para cima): uma força que não para. Típico: 0' },
  'fisica|limit': { unit: 'px/s', hint: 'Limite, em px/s, de 0 a +∞: o movimento do osso acima disto não entra na simulação. Típico: 5000 px/s' },
  'fisica|fps': { unit: '/s', label: 'Passos', hint: 'Passos da simulação, em /s (por segundo), de 1 a +∞: mais é mais fino e mais caro. Típico: 60 /s' },

  // §3 — a base (o esqueleto)
  'base|fps': { unit: '/s', label: 'Quadros', hint: 'Quadros da animação, em /s (por segundo), de 1 a +∞: é a grade da linha do tempo. Típico: 30 /s' },
  'base|x': { unit: 'px', hint: 'Posição X da área de desenho, em px, de −∞ a +∞, a partir da origem da cena' },
  'base|y': { unit: 'px', hint: 'Posição Y da área de desenho, em px, de −∞ a +∞, a partir da origem da cena' },
  'base|width': { unit: 'px', hint: 'Largura da área de desenho, em px, de 0 a +∞' },
  'base|height': { unit: 'px', hint: 'Altura da área de desenho, em px, de 0 a +∞' },
  'base|referenceScale': { unit: 'px', label: 'Escala da física', hint: 'Escala da física, em px por unidade, de 1 a +∞: quantos px valem 1 unidade de física, para o mesmo rig se mexer igual em arte 1x e 4x. Típico: 100 px' },

  // §7.9 — o ponto, e onde o emissor está (os mesmos números)
  'ponto|x': { unit: 'px', label: 'X', hint: 'Posição X, em px, de −∞ a +∞, no espaço do osso: positivo vai para a direita' },
  'ponto|y': { unit: 'px', label: 'Y', hint: 'Posição Y, em px, de −∞ a +∞, no espaço do osso: positivo vai para cima' },
  'ponto|rotation': { unit: '°', label: 'Giro', hint: 'Giro, em graus (°), de −360 a 360, contra o relógio: 0° aponta para a direita, 90° para cima' },
});

/** O que a régua sabe de `onde|chave`, ou `null`. */
export function medidaDe(onde: string, chave: string): Medida | null {
  return REGUA[`${onde}|${chave}`] ?? null;
}

/**
 * Posição e espaço do caminho: a unidade é a do MODO (§6.4). `percent` é de 0
 * a 1 no arquivo, e aparece em %; `fixed` e `length` são px.
 */
export function medidaDoCaminho(chave: 'position' | 'spacing', modo: string): Medida {
  if (chave === 'position') {
    return modo === 'fixed'
      ? { unit: 'px', hint: 'Posição do primeiro osso, em px ao longo do caminho, de 0 a +∞' }
      : { unit: '%', scale: 100, min: 0, max: 1, hint: 'Posição do primeiro osso, em %, de 0 a 100 do comprimento do caminho' };
  }
  if (modo === 'percent') {
    return { unit: '%', scale: 100, label: 'Espaço', hint: 'Espaço entre os ossos, em % do comprimento do caminho, de 0 a +∞' };
  }
  if (modo === 'proportional') {
    return { unit: '×', label: 'Espaço', hint: 'Espaço entre os ossos, em × (vezes), de 0 a +∞: os comprimentos dos ossos reescalados para somar isto. Típico: 1' };
  }
  return {
    unit: 'px', label: 'Espaço',
    hint: modo === 'fixed'
      ? 'Espaço entre os ossos, em px, de −∞ a +∞, fixo'
      : 'Espaço entre os ossos, em px, de −∞ a +∞, somado ao comprimento de cada osso',
  };
}

/**
 * O campo com a régua: unidade, escala, dica e o rótulo curto. Campo que a
 * régua não conhece volta como veio — e o teste da ficha o acusa pelo nome.
 */
/**
 * Os números do Comando (§8.2): o valor que o alvo toma com o parâmetro num
 * ponto — Rodada 47, lote 3 (notas do doc 84). O rótulo era "Com o parâmetro em −1" e quebrava em três
 * linhas; agora "Em −1", e a unidade é a da propriedade que o Comando mexe.
 */
export function medidaDoComando(propriedade: string, entrada: string): Medida {
  const angulo = propriedade === 'rotation' || propriedade.startsWith('shear');
  const escala = propriedade.startsWith('scale');
  const nome = `Com o parâmetro em ${entrada}`;
  if (angulo) return { unit: '°', label: `Em ${entrada}`, hint: `${nome}, em graus (°), de −360 a 360: o valor que o alvo toma ali; entre dois pontos, ele passa de um ao outro` };
  if (escala) return { unit: '×', label: `Em ${entrada}`, hint: `${nome}, em × (vezes), de −∞ a +∞: o valor que o alvo toma ali; 1 é o tamanho de montar, negativo espelha` };
  if (propriedade === 'x' || propriedade === 'y') return { unit: 'px', label: `Em ${entrada}`, hint: `${nome}, em px, de −∞ a +∞: o valor que o alvo toma ali; entre dois pontos, ele passa de um ao outro` };
  // Alvo que não é osso (o peso de uma deformação, um parâmetro, um slot): a
  // unidade é a dele, e a régua não a conhece — nada de palpite (regra 21).
  return { unit: '', label: `Em ${entrada}`, hint: `${nome}: o valor que "${propriedade}" toma ali, na medida dele; entre dois pontos, ele passa de um ao outro` };
}

export function comRegua<T extends { key: string; label: string; unit?: unknown; hint?: string; scale?: number; min?: number; max?: number }>(
  campo: T, onde: string, medida: Medida | null = medidaDe(onde, campo.key),
): T {
  if (medida === null) return campo;
  return {
    ...campo,
    label: medida.label ?? campo.label,
    unit: medida.unit === '' ? undefined : medida.unit,
    hint: medida.hint,
    ...(medida.scale === undefined ? {} : { scale: medida.scale }),
    ...(medida.min === undefined ? {} : { min: medida.min }),
    ...(medida.max === undefined ? {} : { max: medida.max }),
  };
}
