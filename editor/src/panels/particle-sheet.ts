/**
 * A ficha do emissor em abas — rodada 16, lote 1.
 *
 * A ficha da 1ª fase pedia **2.736 px num painel de 343** (`CHANGELOG`, medido
 * em 1440×900): doze grupos, cinquenta controles, todos sempre à vista. Rolar
 * não serve — o Humberto quer rolar só o palco e as listas. Então a ficha vira
 * **abas com ícone**, cada uma com no máximo `LINHAS_POR_ABA` linhas, e só
 * aparece o campo que vale agora: o raio só com o círculo, o "Quadros por
 * segundo" só com a folha correndo por segundo, o pré-aquecer só sem repetir.
 * Nada some: o que saiu da vista está a um clique (trocar a forma, desmarcar
 * Repetir, trocar como a folha corre).
 *
 * **Nada aqui escreve.** Os campos são os mesmos `FieldDef` de
 * `attachmentFields`, com os mesmos ponteiros e os mesmos comandos; este
 * módulo só decide em que aba e em que linha cada um mora. Plano:
 * `documentos/projeto do programa/16 AS PARTICULAS - o plano 2026-10-05.md`.
 */

import type { Command, EditorDoc } from '../contract.js';
import { SetProperty, type FieldDef, type FieldGroup } from './properties-model.js';

/**
 * Quantas linhas cabem numa aba. **Um número só, de propósito:** a altura do
 * painel nas três telas ainda vai ser medida (o plano, seção 8), e quem medir
 * troca aqui. 1 linha ≈ 27 px; 1280×720 é a pior tela.
 *
 * **Medido em 05/10/2026, 16h18:** em 1280×720 o painel tem 187 px. Com 6
 * linhas, cinco abas passavam de 3 a 45 px; a Ficha rápida (4 linhas) mais o
 * Osso deram 187 px cravados. Daí 5.
 */
export const LINHAS_POR_ABA = 5;

/** Uma linha da ficha: um campo, ou dois lado a lado (uma faixa, um par X·Y). */
export interface SheetRow {
  label: string;
  fields: FieldDef[];
  /**
   * Rodada 16, lote 2: a linha da forma é o **seletor**, uma fileira de botões
   * com o desenho de cada forma, e não a lista. `base` é o ponteiro do anexo.
   */
  shapes?: { base: string; buttons: ShapeButton[]; exit?: string };
  /** Conserto 5: o que está errado nesta linha (o rótulo fica na cor do aviso). */
  problem?: string;
  /**
   * Quantas linhas a linha ocupa na aba (padrão 1). A curva ao longo da vida
   * ocupa 2; o seletor de forma também (os botões e o nome da forma embaixo).
   */
  lines?: number;
}

export interface SheetTab {
  id: string;
  /** O ícone de `ui/icons.ts`. */
  icon: string;
  /** O nome, que vai na dica do ícone. */
  name: string;
  rows: SheetRow[];
  /** A Ficha rápida mora no topo desta aba (`LINHAS_DA_FICHA_RAPIDA` linhas). */
  quick?: boolean;
  /**
   * O que a aba mostra no lugar da Ficha rápida quando ela não aparece (a
   * escolha sem o slot: a ficha rápida só nasce de UM slot). Sem isto, X, Y e
   * o giro sumiriam calados.
   */
  quickFallback?: SheetRow[];
}

/** O que a ficha precisa ler do anexo para decidir o que mostrar. */
export interface EmitterState {
  shape?: unknown;
  frameMode?: unknown;
  looping?: unknown;
  radiusThickness?: unknown;
  arc?: unknown;
  mesh?: unknown;
  radius?: unknown;
  size?: unknown;
  edge?: unknown;
  rate?: unknown;
  lifetime?: unknown;
  maxParticles?: unknown;
  emitting?: unknown;
  bursts?: unknown;
  sequence?: unknown;
  curve?: unknown;
  direction?: unknown;
  spherizeDirection?: unknown;
}

/**
 * **Qual dos três botões do círculo vale:** o arco manda sobre o anel (um arco
 * com espessura é um arco). `null` quando a forma não é círculo.
 */
export function circleVariant(state: EmitterState): 'circle' | 'ring' | 'arc' | null {
  if (state.shape !== 'circle') return null;
  const espessura = typeof state.radiusThickness === 'number' ? state.radiusThickness : 1;
  const arco = typeof state.arc === 'number' ? state.arc : 360;
  return arco < 360 ? 'arc' : espessura < 1 ? 'ring' : 'circle';
}

/**
 * **O teto está cortando?** — conserto 5 da conferência (05/10/2026): subir a
 * Taxa de 40 para 200 e não ver diferença, sem nada dizer por quê, é a regra 21
 * ao contrário. `vivas` é o que o emissor pede de uma vez (taxa × vida máxima,
 * mais as rajadas inteiras: a conta de cima, a que o Máximo pode cortar);
 * `null` quando o teto não corta.
 */
export function capCutting(state: EmitterState): { vivas: number; teto: number } | null {
  const taxa = state.emitting === false ? 0 : typeof state.rate === 'number' ? state.rate : 10;
  const vida = Array.isArray(state.lifetime) && typeof state.lifetime[1] === 'number' ? state.lifetime[1] : 1;
  const rajadas = Array.isArray(state.bursts)
    ? state.bursts.reduce((n: number, b: unknown) => {
      const o = (b ?? {}) as Record<string, unknown>;
      return n + (typeof o.count === 'number' ? o.count : 1) * (typeof o.cycles === 'number' ? o.cycles : 1);
    }, 0)
    : 0;
  const teto = typeof state.maxParticles === 'number' ? state.maxParticles : 1000;
  const vivas = Math.ceil(taxa * vida + rajadas);
  return vivas > teto ? { vivas, teto } : null;
}

/** A linha de uma chave de campo. `#` escolhe a faixa inteira, pelo nome do campo do arquivo. */
type Slot = string;

/** Os campos de cada forma (§9.4). A forma que não conhecemos mostra só o seletor. */
const SHAPE_FIELDS: Readonly<Record<string, readonly Slot[]>> = {
  point: [],
  circle: ['radius', 'radiusThickness', 'arc'],
  rectangle: ['#size'],
  edge: ['#edge:0+1', '#edge:2+3'],
  bone: [],
  mesh: ['mesh', 'meshMode'],
  path: ['curve'],
};

// ---------------------------------------------------------------------------
// O seletor de forma — rodada 16, lote 2
// ---------------------------------------------------------------------------

/** Um botão do seletor: o desenho, o nome na dica, o que ele grava. */
export interface ShapeButton {
  id: string;
  icon: string;
  name: string;
  /** Os campos que o botão grava no anexo. */
  writes: Readonly<Record<string, unknown>>;
  /** Aceso: é a forma do emissor agora. */
  active: boolean;
  /** Cinza, e por quê. Ausente = pode clicar. */
  disabled?: string;
}

/**
 * **As nove formas do seletor.** O formato tem seis (§9.4); **anel e arco não
 * são formas novas**: são o círculo com `radiusThickness` e `arc`. No seletor
 * eles têm botão próprio, que grava o círculo com valores de partida — o
 * Humberto os nomeou como formas, e é assim que se procuram. O caminho é a
 * forma nova do lote 7 da rodada: até lá, cinza, dizendo por quê.
 *
 * Trocar de forma **não apaga** os campos das outras: voltar ao círculo devolve
 * o raio de antes. Só se grava o que o botão diz.
 */
export function shapeButtons(state: EmitterState, meshes: readonly string[], paths: readonly string[] = []): ShapeButton[] {
  const shape = typeof state.shape === 'string' ? state.shape : 'point';
  const espessura = typeof state.radiusThickness === 'number' ? state.radiusThickness : 1;
  const arco = typeof state.arc === 'number' ? state.arc : 360;
  // Qual dos três botões do círculo acende: o arco manda sobre o anel.
  const circulo = shape !== 'circle' ? null : arco < 360 ? 'arc' : espessura < 1 ? 'ring' : 'circle';
  const b = (
    id: string, icon: string, name: string, writes: Record<string, unknown>, active: boolean, disabled?: string,
  ): ShapeButton => (disabled === undefined ? { id, icon, name, writes, active } : { id, icon, name, writes, active, disabled });
  // Conserto 1 da conferência (05/10): retângulo, linha e círculo nasciam com
  // tamanho ZERO, e a cena não mostrava nada. Escolher a forma dá um tamanho
  // de partida que se vê — **só quando o de agora é zero**: um número que a
  // pessoa pôs nunca é pisado.
  const zero = (v: unknown): boolean => !Array.isArray(v) || v.every((n) => typeof n !== 'number' || n === 0);
  const semRaio = !(typeof state.radius === 'number' && state.radius > 0);
  const raio: Record<string, unknown> = semRaio ? { radius: 30 } : {};
  const caixa: Record<string, unknown> = zero(state.size) ? { size: [60, 40] } : {};
  const segmento: Record<string, unknown> = zero(state.edge) ? { edge: [-30, 0, 30, 0] } : {};
  // A malha escolhida antes fica; sem nenhuma, a primeira do slot.
  const malha: Record<string, unknown> = typeof state.mesh === 'string' && state.mesh !== ''
    ? { shape: 'mesh' }
    : meshes.length > 0 ? { shape: 'mesh', mesh: meshes[0] } : { shape: 'mesh' };
  return [
    b('point', 'forma-ponto', 'Ponto — tudo nasce do mesmo lugar', { shape: 'point' }, shape === 'point'),
    b('rectangle', 'forma-retangulo', 'Retângulo — nasce dentro de uma caixa', { shape: 'rectangle', ...caixa }, shape === 'rectangle'),
    b('circle', 'forma-circulo', 'Círculo — nasce dentro do disco', { shape: 'circle', ...raio, radiusThickness: 1, arc: 360 }, circulo === 'circle'),
    b('ring', 'forma-anel', 'Anel — nasce na borda do círculo', { shape: 'circle', ...raio, radiusThickness: 0.2, arc: 360 }, circulo === 'ring'),
    b('arc', 'forma-arco', 'Arco — um pedaço do círculo', { shape: 'circle', ...raio, arc: 90, radiusThickness: 1 }, circulo === 'arc'),
    b('edge', 'forma-linha', 'Linha — nasce ao longo de um segmento', { shape: 'edge', ...segmento }, shape === 'edge'),
    b('bone', 'bone', 'Osso — nasce ao longo do osso', { shape: 'bone' }, shape === 'bone'),
    b('mesh', 'mesh', 'Malha — nasce de uma malha do mesmo slot', malha, shape === 'mesh',
      meshes.length === 0 && shape !== 'mesh' ? 'Malha: este slot não tem malha. Ponha uma malha no slot do emissor' : undefined),
    // Lote 8: o caminho acende quando o boneco tem pelo menos um. O caminho
    // escolhido antes fica; sem nenhum, o primeiro do boneco.
    b('path', 'path', 'Caminho — nasce ao longo de uma curva',
      typeof state.curve === 'string' && state.curve !== '' ? { shape: 'path' }
        : paths.length > 0 ? { shape: 'path', curve: paths[0] } : { shape: 'path' },
      shape === 'path',
      paths.length === 0 && shape !== 'path' ? 'Caminho: este boneco ainda não tem nenhum caminho (um desenho do tipo caminho)' : undefined),
  ];
}

/**
 * **Para onde as partículas saem** — rodada 38, lote 4 (06/10/2026). O
 * Humberto: *"o círculo e o quadrado não sei o que fazem nem como controlar"*.
 * A forma diz onde nasce; esta frase, para onde sai: a Direção (§9.3, `90` para
 * cima) ou para fora da forma (`spherizeDirection`, de 0 a 1).
 */
export function shapeExitLine(state: { direction?: unknown; spherizeDirection?: unknown }): string {
  const fora = typeof state.spherizeDirection === 'number' ? state.spherizeDirection : 0;
  if (fora >= 1) return 'sai para fora';
  if (fora > 0) return 'sai meio para fora';
  const d = typeof state.direction === 'number' ? ((state.direction % 360) + 360) % 360 : 90;
  const nome: Readonly<Record<number, string>> = { 0: 'para a direita', 90: 'para cima', 180: 'para a esquerda', 270: 'para baixo' };
  return `sai ${nome[d] ?? `a ${Math.round(d * 100) / 100}°`}`;
}

/**
 * **A linha curta que se vê embaixo dos botões** — rodada 38, lote 4. O nome
 * da forma, onde nasce e para onde sai, em ~40 letras: cabe inteira na coluna
 * de 1280×720. A frase longa (`shapeNameLine`) fica na dica.
 */
const ONDE_NASCE: Readonly<Record<string, string>> = {
  point: 'nasce num ponto', rectangle: 'nasce na caixa', circle: 'nasce no disco', ring: 'nasce na borda',
  arc: 'nasce no arco', edge: 'nasce na linha', bone: 'nasce no osso', mesh: 'nasce na malha', path: 'nasce no caminho',
};

export function shapeSummaryLine(buttons: readonly ShapeButton[], exit: string): string {
  const acesa = buttons.find((b) => b.active);
  if (acesa === undefined) return 'Forma desconhecida: escolha uma acima';
  const nome = acesa.name.split(' — ')[0]!;
  return `${nome}: ${ONDE_NASCE[acesa.id] ?? 'nasce'}, ${exit}`;
}

/**
 * **A dica da linha da forma** — rodada 38, lote 5 (doc 35): "sai para cima"
 * valia mesmo quando a pessoa queria outra coisa, e nada dizia onde se muda.
 */
export function shapeExitTitle(name: string, exit: string): string {
  return `${name} · ${exit}. A direção se muda na aba Movimento; "Para fora" faz sair da forma`;
}

/**
 * **O nome da forma escolhida, escrito** — lote 4, pedido do Diretor: o
 * desenho ajuda, o nome confirma (o Humberto é disléxico). Vai embaixo dos
 * nove botões: *"Forma: anel — nasce na borda do círculo"*.
 */
export function shapeNameLine(buttons: readonly ShapeButton[]): string {
  const acesa = buttons.find((b) => b.active);
  if (acesa === undefined) return 'Forma: desconhecida — escolha uma acima';
  const [nome, frase] = acesa.name.split(' — ');
  return frase === undefined ? `Forma: ${nome!.toLowerCase()}` : `Forma: ${nome!.toLowerCase()} — ${frase}`;
}

/**
 * **Escolher uma forma é UM passo no desfazer**, mesmo gravando dois ou três
 * campos (o anel grava `shape`, `radiusThickness` e `arc`).
 */
export class ChooseShape implements Command {
  readonly label: string;
  readonly kind = 'structure' as const;
  private readonly parts: SetProperty[];

  constructor(base: string, button: ShapeButton) {
    this.label = `Forma: ${button.name.split(' — ')[0]!.toLowerCase()}`;
    this.parts = Object.entries(button.writes).map(([campo, valor]) =>
      new SetProperty(`${base}/${campo}`, valor, this.label, 'structure'));
  }

  apply(doc: EditorDoc): void {
    for (const part of this.parts) part.apply(doc);
  }

  revert(doc: EditorDoc): void {
    for (let i = this.parts.length - 1; i >= 0; i--) this.parts[i]!.revert(doc);
  }
}

/**
 * Quantas linhas a **Ficha rápida** ocupa (X·Y, Escala, Ângulo, Alfa) quando
 * mora dentro da aba Lugar. Ela não sai do arquivo: são os mesmos X, Y e giro
 * do emissor, com o disco do ângulo, e o alfa do slot — que não tem outro
 * lugar na ficha. Medido em 05/10/2026: em cima das abas, ela comia 140 dos
 * 187 px que o painel tem em 1280×720.
 */
export const LINHAS_DA_FICHA_RAPIDA = 4;

/** As abas, na ordem da vida da partícula (o Niagara faz assim). */
function layout(state: EmitterState): Array<{ id: string; icon: string; name: string; quick?: true; slots: Slot[] }> {
  const shape = typeof state.shape === 'string' ? state.shape : 'point';
  // Conserto 3 da conferência (05/10): o círculo mostra só o raio; o anel, o
  // raio e a espessura; o arco, os três. Antes os três apareciam sempre, e no
  // círculo dois deles não mudavam nada que se visse.
  const variante = circleVariant(state);
  // Rodada 38, lote 4: no arco, espessura e trecho dividem uma linha — a aba
  // ganhou o "para fora", e cinco linhas é o que cabe em 1280×720.
  const porForma = variante === 'circle' ? ['radius']
    : variante === 'ring' ? ['radius', 'radiusThickness']
      : variante === 'arc' ? ['radius', 'radiusThickness+arc']
        : SHAPE_FIELDS[shape] ?? [];
  // O ponto não tem de onde sair "para fora": a linha some (régua 4 do `26`).
  const paraFora = shape === 'point' ? [] : ['spherizeDirection'];
  const fps = state.frameMode === 'fps';
  const temFolha = state.sequence !== null && typeof state.sequence === 'object';
  const repete = state.looping !== false;
  return [
    { id: 'nascer', icon: 'particle', name: 'Nascer', slots: ['emitting', 'rate', '#lifetime', 'maxParticles', 'bursts'] },
    // Lote 5: as rajadas entraram em Nascer; o atraso veio para cá, e a
    // explosividade divide a linha com a janela dela.
    { id: 'tempo', icon: 'relogio', name: 'Tempo', slots: ['startDelay', 'explosiveness+duration', 'randomness', 'looping', ...(repete ? [] : ['prewarm'])] },
    { id: 'lugar', icon: 'target', name: 'Lugar', quick: true, slots: ['bone'] },
    { id: 'forma', icon: 'formas', name: 'Forma', slots: ['shape', ...porForma, ...paraFora] },
    { id: 'movimento', icon: 'trajeto', name: 'Movimento', slots: ['#speed', 'direction', 'spread', 'alignToVelocity'] },
    // A gravidade e o espaço juntos: é o espaço que diz se a gravidade segue o
    // emissor ou fica no mundo (§9.10), e os rótulos dele dizem isso.
    { id: 'forcas', icon: 'forca', name: 'Forças', slots: ['#gravity', 'drag', 'space'] },
    // Lote 4: a curva do tamanho e o gradiente não cabiam juntos numa aba de
    // cinco linhas. Tamanho e giro numa, a cor na outra.
    { id: 'tamanho', icon: 'scale', name: 'Tamanho e giro', slots: ['#scale', 'scaleOverLifetime', '#angle', '#angularVelocity'] },
    { id: 'cor', icon: 'gota', name: 'Cor', slots: ['startColor0+startColor1', 'colorOverLifetime', 'alphaOverLifetime', 'color'] },
    // Lote 9: a folha de quadros. Sem folha, "a folha corre", as voltas e o
    // quadro de partida não mudam nada — ficam a um clique (pôr quadros).
    { id: 'imagem', icon: 'image', name: 'Imagem', slots: ['path', 'sequenceCount+sequenceStart+sequenceDigits', ...(temFolha ? ['frameMode', fps ? 'fps' : 'cycles', '#startFrame'] : [])] },
    // O resto, que se mexe pouco: o nome, a semente, quem fica na frente.
    { id: 'mais', icon: 'more', name: 'Mais', slots: ['name', 'seed', 'sortMode'] },
  ];
}

/**
 * **O rótulo curto de cada linha, na aba** — medido em 05/10/2026: na coluna de
 * 1280×720 cabem ~17 letras, e um rótulo que quebra em duas linhas come uma
 * linha inteira da aba ("Emitindo (se anima)", "Abertura p/ cada lado"). O
 * rótulo inteiro, com a explicação que ele carregava, vai para a **dica** do
 * campo: nada se perde, e a palavra que se lê é uma só.
 */
const ROTULO_CURTO: Readonly<Record<string, string>> = {
  emitting: 'Emitindo',
  // Rodada 47, lote 2: a unidade (/s) vem depois da caixa; o rótulo não a repete.
  rate: 'Taxa',
  duration: 'Janela',
  looping: 'Repetir',
  prewarm: 'Pré-aquecer',
  angularVelocity: 'Giro',
  path: 'Imagem',
  startFrame: 'Quadro inicial',
  fps: 'Quadros',
  sortMode: 'Na frente',
  radius: 'Raio',
  drag: 'Freio',
  radiusThickness: 'Espessura',
  arc: 'Trecho',
  mesh: 'Malha',
  spread: 'Abertura ±',
  spherizeDirection: 'Para fora',
  alignToVelocity: 'Vira com o voo',
  startColor0: 'Cor ao nascer',
  explosiveness: 'Explosão · janela',
  sequenceCount: 'Folha de quadros',
};

/**
 * **A medida de cada número: a unidade e a faixa** — rodada 38, lote 3
 * (06/10/2026). A régua do `26`: *"todo campo numérico diz a unidade e a faixa,
 * no rótulo ou na dica; nenhum valor solto"*. Na conferência (doc 27, §2.1), 15
 * dos 24 números não diziam. A frase vai no fim da dica, depois do nome.
 *
 * As contas que aparecem aqui são as da §9 da extensão `BONE_particles`: o
 * freio é linear (`v' = −k·v`), então em um segundo a velocidade fica
 * `e^(−k)` — tira 39 % com 0,5, 63 % com 1 e 86 % com 2.
 */
export const MEDIDA: Readonly<Record<string, string>> = {
  rate: 'partículas por segundo, de 0 para cima',
  lifetime: 'em segundos, de 0 para cima; cada partícula sorteia um tempo entre as duas caixas',
  maxParticles: 'partículas vivas de uma vez, de 1 a 10000',
  startDelay: 'em segundos, de 0 para cima',
  explosiveness: 'em %, de 0 a 100, quantas nascem juntas: 0 uma de cada vez, no ritmo da Taxa; 100 todas no mesmo instante, como uma explosão',
  duration: 'em segundos, de 0 para cima: o tempo da explosão inteira — as partículas dela nascem espalhadas nessa janela. Não é a Vida de cada partícula (essa é a Vida, na aba Nascer)',
  randomness: 'em % do intervalo entre duas partículas, de 0 a 100: 0 nascem num ritmo certo, como um relógio; 100 em tempos soltos, como chuva',
  prewarm: 'em segundos, de 0 para cima; só vale sem Repetir',
  radius: 'em px, de 0 para cima',
  radiusThickness: 'em %, de 0 a 100: 0 só a borda, 100 o disco cheio. Em px é raio × espessura: raio 60 e 20 % dão 12 px',
  arc: 'em graus, de 0 a 360, a partir da direita do osso (+X). Para mudar onde começa, gire o emissor',
  size: 'em px, de 0 para cima',
  edge: 'em px, no osso do emissor: X positivo vai para a direita, Y positivo para cima',
  speed: 'em px por segundo, de 0 para cima; cada partícula sorteia entre as duas caixas. Típico: fumaça 30 a 60, fogo 60 a 110, faísca 180 a 320 (com Abertura 180: sem ela sai numa coluna só)',
  direction: 'em graus, de 0 a 360: 0 para a direita, 90 para cima, 180 para a esquerda, 270 para baixo',
  // Rodada 42, lote 1 (doc 41): a faísca do vazio saía numa coluna, e nada dizia por quê.
  spread: 'em graus, de 0 a 180, para cada lado da Direção: 180 solta para todos os lados; com 0 todas saem na mesma linha, numa coluna. '
    + 'Típico: fogo 12, fumaça 20, poeira 60, faísca 180',
  spherizeDirection: 'em %, de 0 a 100: 0 sai na Direção, 100 sai para fora da forma',
  gravity: 'em px por segundo², qualquer número: Y positivo puxa para cima, Y negativo para baixo (o fogo usa 60, a faísca −400)',
  drag: 'de 0 para cima: quanto a velocidade cai em um segundo. 0 não freia; 0,5 tira 39 %; 1 tira 63 %; 2 tira 86 %',
  scale: 'fator da imagem, de 0 para cima: 1 é o tamanho dela, 2 o dobro. Típico: fumaça 1,6 a 2,2 (e cresce na vida), fogo 1,6 a 2,4, faísca 0,7 a 1,1 (com Abertura 180), poeira 0,5 a 0,9',
  angle: 'em graus, de 0 a 360 (negativo gira ao contrário); sorteado entre as duas caixas',
  angularVelocity: 'em graus por segundo, de 0 para cima, ou negativo para girar ao contrário',
  sequenceCount: 'quadros da folha, de 0 para cima (0 = sem folha)',
  sequenceStart: 'o número do primeiro quadro, de 0 para cima',
  sequenceDigits: 'dígitos do número (2 dá 01, 02…), de 0 para cima',
  fps: 'quadros por segundo, de 0 para cima',
  cycles: 'voltas da folha na vida da partícula, de 0 para cima',
  startFrame: 'em quadros, de 0 para cima; sorteado entre as duas caixas',
  x: 'em px, qualquer número: onde o emissor está no osso; positivo vai para a direita',
  y: 'em px, qualquer número: onde o emissor está no osso; positivo vai para cima',
  rotation: 'em graus, de 0 a 360 (negativo gira ao contrário): gira a Direção e a forma juntas',
  alignToVelocity: 'cada partícula gira e aponta para onde vai: bom para faísca e chuva, que viram riscos',
  sortMode: 'quem fica na frente quando duas partículas se cobrem: as mais novas (as que acabaram de nascer) ou as mais velhas',
  seed: 'o número do sorteio, de 0 a 4294967295: o mesmo número dá o mesmo efeito',
  // Rodada 48 (a mão do Humberto): as duas cores não diziam que se multiplicam,
  // e trocar uma não mudava a barra da outra. A conta é a do Unity e do Godot.
  startColor0: 'cada partícula sorteia uma cor entre «de» e «a». Ela multiplica a Cor na vida, como no Unity e no Godot: '
    + 'branco deixa a Cor na vida como está; vermelho sobre amarelo dá vermelho. A cor que se vê está nas duas faixas finas de baixo da barra Cor na vida',
  startColor1: 'a outra ponta do sorteio da cor. Ela multiplica a Cor na vida: branco deixa a Cor na vida como está',
  colorOverLifetime: 'da esquerda (nasce) à direita (morre). Ela multiplica a Cor ao nascer, como no Unity e no Godot: '
    + 'em cima, a Cor na vida; embaixo, finas, a cor que se vê, com a Cor ao nascer «de» e com a «a»',
};

/**
 * **A unidade de cada número, depois da caixa** — rodada 47, lote 2 (régua R2
 * do doc `68`). Ela morava no rótulo: "Vida (s)", "Raio (px)", "Espessura
 * (0–1)". Agora o rótulo é só o nome, e a unidade vem depois da caixa, como na
 * ficha do osso. O que é de 0 a 1 no arquivo aparece de 0 a 100 %.
 */
export const UNIDADE: Readonly<Record<string, { unit: NonNullable<FieldDef['unit']>; scale?: number }>> = {
  rate: { unit: '/s' }, lifetime: { unit: 's' }, startDelay: { unit: 's' }, duration: { unit: 's' },
  prewarm: { unit: 's' }, explosiveness: { unit: '%', scale: 100 }, randomness: { unit: '%', scale: 100 },
  radius: { unit: 'px' }, radiusThickness: { unit: '%', scale: 100 }, arc: { unit: '°' }, size: { unit: 'px' },
  edge: { unit: 'px' }, speed: { unit: 'px/s' }, direction: { unit: '°' }, spread: { unit: '°' },
  spherizeDirection: { unit: '%', scale: 100 }, gravity: { unit: 'px/s²' }, drag: { unit: '/s' }, scale: { unit: '×' },
  angle: { unit: '°' }, angularVelocity: { unit: '°/s' }, fps: { unit: '/s' },
};

/** O campo com a medida no fim da dica (o nome inteiro antes, se não havia dica), e a unidade. */
function comMedida(field: FieldDef, nome: string): FieldDef {
  const medida = MEDIDA[nome];
  const unidade = UNIDADE[nome] ?? {};
  if (medida === undefined) return { ...field, ...unidade };
  return { ...field, ...unidade, hint: `${field.hint ?? field.label} — ${medida}` };
}

/** O campo com o rótulo curto, e o inteiro na dica (se ele não tinha dica própria). */
function curto(field: FieldDef, nome: string): FieldDef {
  const rotulo = ROTULO_CURTO[nome];
  if (rotulo === undefined) return comMedida(field, nome);
  return comMedida({ ...field, label: rotulo, hint: field.hint ?? field.label }, nome);
}

/**
 * **O nome curto entre as caixas** — rodada 38, lote 2 (06/10/2026).
 *
 * O Humberto, na Vida "0,5 · 0,9": *"eu não entendi quando tava usando"*. As
 * duas caixas diziam "mínimo" e "máximo" só na dica. O nome sai do que o rótulo
 * inteiro já diz no fim, entre parênteses: a faixa vira **"de 0,5 a 0,9"**, o
 * par vira **"X 0 Y 40"**. Os dois da explosão não têm parênteses: vão pela chave.
 */
const NOME_ENTRE_CAIXAS: Readonly<Record<string, string>> = {
  'mínimo': 'de', 'máximo': 'a', de: 'de', 'até': 'a',
  X: 'X', Y: 'Y', largura: 'larg.', altura: 'alt.',
};
const NOME_POR_CHAVE: Readonly<Record<string, string>> = { explosiveness: 'força', duration: 'janela', radiusThickness: 'esp.', arc: '°' };

function comNomeCurto(field: FieldDef): FieldDef {
  if (field.short !== undefined) return field;
  const porChave = NOME_POR_CHAVE[field.key];
  if (porChave !== undefined) return { ...field, short: porChave };
  const fim = /\(([^()]*)\)\s*$/.exec(field.label)?.[1] ?? /\b([XY])$/.exec(field.label)?.[1];
  const nome = fim === undefined ? undefined : NOME_ENTRE_CAIXAS[fim];
  return nome === undefined ? field : { ...field, short: nome };
}

/** O nome do campo do arquivo que um `FieldDef` de faixa escreve (o fim do ponteiro). */
function rangeName(field: FieldDef): string | null {
  if (field.component === undefined) return null;
  const cut = field.pointer.lastIndexOf('/');
  return cut < 0 ? null : field.pointer.slice(cut + 1);
}

/** "Vida (s) (mínimo)" → "Vida (s)": o rótulo da linha de uma faixa. */
function rowLabelOf(field: FieldDef): string {
  return field.label.replace(/\s*\([^()]*\)$/, '');
}

/**
 * **As abas da ficha do emissor.** `groups` são os de `attachmentFields` (já
 * passados pelo osso próprio); `state` é o anexo como está no arquivo.
 *
 * Um campo que nenhuma aba pediu **não some**: vai para o fim da última aba.
 * Um teste prende que isso não acontece hoje — se acontecer amanhã, ele
 * aparece fora do lugar em vez de sumir calado (regra 21).
 */
export function particleSheetTabs(groups: readonly FieldGroup[], state: EmitterState): SheetTab[] {
  const fields = groups.flatMap((g) => g.fields);
  const byKey = new Map<string, FieldDef>();
  const byRange = new Map<string, FieldDef[]>();
  for (const field of fields) {
    const range = rangeName(field);
    if (range === null) {
      byKey.set(field.key, field);
      continue;
    }
    const pair = byRange.get(range) ?? [];
    pair[field.component as number] = field;
    byRange.set(range, pair);
  }

  const used = new Set<FieldDef>();
  const rowFor = (slot: Slot): SheetRow | null => {
    if (slot.startsWith('#') && slot.includes(':')) {
      // Um pedaço de um array maior: `#edge:0+1` é o início da linha.
      const [nome, partes] = slot.slice(1).split(':') as [string, string];
      const todos = byRange.get(nome) ?? [];
      const pair = partes.split('+').map((i) => todos[Number(i)]).filter((f): f is FieldDef => f !== undefined);
      if (pair.length === 0) return null;
      pair.forEach((f) => used.add(f));
      const label = partes === '0+1' ? 'Início' : 'Fim';
      return { label, fields: pair.map((f) => comMedida(comNomeCurto({ ...f, hint: f.hint ?? f.label }), nome)) };
    }
    if (slot.startsWith('#')) {
      const pair = (byRange.get(slot.slice(1)) ?? []).filter((f): f is FieldDef => f !== undefined);
      if (pair.length === 0) return null;
      pair.forEach((f) => used.add(f));
      const nome = slot.slice(1);
      const rotulo = ROTULO_CURTO[nome] ?? rowLabelOf(pair[0]!);
      // Cada ponta guarda o rótulo inteiro ("Vida (s) (mínimo)") como dica.
      return { label: rotulo, fields: pair.map((f) => comMedida(comNomeCurto({ ...f, hint: f.hint ?? f.label }), nome)) };
    }
    if (slot.includes('+')) {
      const pair = slot.split('+').map((k) => byKey.get(k)).filter((f): f is FieldDef => f !== undefined);
      if (pair.length === 0) return null;
      pair.forEach((f) => used.add(f));
      const primeiro = slot.split('+')[0]!;
      const label = slot === 'x+y' ? 'X · Y' : slot === 'radiusThickness+arc' ? 'Borda · trecho' : ROTULO_CURTO[primeiro] ?? rowLabelOf(pair[0]!);
      return { label, fields: pair.map((f) => comMedida(pair.length === 2 ? comNomeCurto({ ...f, hint: f.hint ?? f.label }) : { ...f, hint: f.hint ?? f.label }, f.key)) };
    }
    const field = byKey.get(slot);
    if (field === undefined) return null;
    used.add(field);
    if (slot === 'shape') {
      // As malhas do slot já estão na lista do campo Malha (sem a opção vazia).
      const meshes = (byKey.get('mesh')?.options ?? []).map((o) => String(o.value)).filter((v) => v !== '');
      const paths = (byKey.get('curve')?.options ?? []).map((o) => String(o.value)).filter((v) => v !== '');
      const base = field.pointer.slice(0, field.pointer.lastIndexOf('/'));
      return { label: 'Forma', fields: [field], shapes: { base, buttons: shapeButtons(state, meshes, paths), exit: shapeExitLine(state) }, lines: 2 };
    }
    if (slot === 'maxParticles') {
      const corte = capCutting(state);
      if (corte !== null) {
        // Conserto 5: o rótulo diz que corta, com o número; a frase inteira na dica.
        const frase = `O Máximo de vivas corta: o emissor pede ~${corte.vivas} vivas de uma vez (taxa × vida, mais as rajadas) `
          + `e o Máximo de vivas é ${corte.teto}. Subir a taxa não muda a cena até subir o Máximo de vivas`;
        // Segunda conferência, defeito 7: o rótulo diz o NOME do campo ("Máximo
        // de vivas") e o número, em duas linhas curtas na mesma altura.
        return { label: `Máximo de vivas\ncorta ${corte.vivas - corte.teto}`, fields: [{ ...field, hint: frase }], problem: frase };
      }
    }
    const mostrado = curto(field, slot);
    return { label: mostrado.label, fields: [mostrado], ...(field.kind === 'lifeCurve' ? { lines: 2 } : {}) };
  };

  const tabs: SheetTab[] = layout(state).map((tab) => ({
    id: tab.id, icon: tab.icon, name: tab.name,
    ...(tab.quick === true
      ? { quick: true, quickFallback: ['x+y', 'rotation'].map(rowFor).filter((row): row is SheetRow => row !== null) }
      : {}),
    rows: tab.slots.map(rowFor).filter((row): row is SheetRow => row !== null),
  }));

  // Os campos que só se escondem por estado (o raio com a forma ponto) contam
  // como colocados: estão a um clique. X, Y e o giro estão na Ficha rápida da
  // aba Lugar. Os que nenhuma aba conhece, não.
  const hidden = new Set<string>([
    'prewarm', 'fps', 'cycles', 'radius', 'radiusThickness', 'arc', 'size', 'mesh', 'meshMode', 'edge',
    'frameMode', 'startFrame', 'curve', 'spherizeDirection',
  ]);
  const leftovers = fields.filter((f) => !used.has(f) && !hidden.has(rangeName(f) ?? f.key));
  if (leftovers.length > 0) {
    tabs[tabs.length - 1]!.rows.push(...leftovers.map((f) => ({ label: f.label, fields: [f] })));
  }
  return tabs;
}
