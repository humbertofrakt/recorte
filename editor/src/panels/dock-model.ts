/**
 * A faixa de baixo aberta e fechada (dono C) — lote 14, rodada 3.
 *
 * O Humberto pôs a tela do Spriter ao lado da nossa e disse: *"a linha do tempo
 * mostra só a linha principal, e só mostra os detalhes quando você clica para
 * mostrar os detalhes"*. Medido na tela dele, a faixa de baixo do Recorte
 * levava 35% da altura da janela, contra 11% no Spriter — e o que sobrava para
 * a cena eram 43% contra 78%.
 *
 * Então a faixa passa a nascer **fechada**, com três linhas e nada mais:
 *
 * | Linha | O que tem |
 * |:---|:---|
 * | 1 | o tocador |
 * | 2 | a régua, com as marcas e o trecho de laço |
 * | 3 | o **Resumo**: um losango em cada tempo que tem chave |
 *
 * O botão **Detalhes**, na ponta direita da linha 1, abre o resto: as abas
 * Linha do tempo · Curvas · Prévia, a linha dos botões em bloco, e uma linha
 * por osso e por desenho.
 *
 * Este arquivo não toca em tela nenhuma. Ele é a CONTA de quanto a faixa mede
 * e do que aparece nela; a tela é do `ui/shell.ts` e do `panels/dopesheet.ts`.
 * Regra 2 do plano: decisão em módulo puro, DOM só desenha.
 */

/** Aberta ou fechada, e a altura guardada de quando ela está aberta. */
export interface DockState {
  /** `false` é o padrão: a faixa nasce fechada, como a do Spriter. */
  open: boolean;
  /** A altura de quando ela está ABERTA. Fechada, a altura é constante. */
  height: number;
}

/**
 * A altura da faixa fechada, em pixels. **Medida, não chutada.**
 *
 * Somando o que as três linhas ocupam no `dopesheet.css` de hoje:
 *
 * | Linha | O que manda na altura | px |
 * |:---|:---|---:|
 * | tocador | 8 de cima + 36 do botão + 6 de baixo + 1 de borda | 51 |
 * | régua | `.dope-cabecalho-linha:first-child { height: 32px }` | 32 |
 * | Resumo | `.dope-faixa { height: 34px }` + 1 de borda | 35 |
 * | cabeçalho | a borda de baixo dele | 2 |
 *
 * O plano escreveu "≈ 120 px" de cabeça. A primeira medida deu **136**, com a
 * régua escrevendo "quadro N" numa segunda linha. O Humberto olhou a foto e
 * disse: *"se tirar o nome quadro da linha do tempo ele pode ficar ainda mais
 * fina"* — e o quadro já está escrito no tocador, ao lado do tempo.
 *
 * Tirar o texto sozinho não bastava: quem mandava na altura daquela linha eram
 * os dois botões do canto da cebola, de 34px. Eles encolheram para 26 no mesmo
 * lote, e aí sim a linha caiu de 46 para 32. **121**, medido no navegador.
 *
 * Mudou alguma dessas alturas no CSS? Mude aqui junto, e a medida da fração da
 * cena, no Chrome headless, avisa se alguém esquecer.
 */
export const CLOSED_HEIGHT = 121;

/**
 * A menor altura da faixa ABERTA.
 *
 * Abaixo disto a folha não diz nada: a régua e o Resumo sozinhos já comem
 * 85px, e o que sobraria não daria uma linha de osso inteira. É o `DOCK_MIN`
 * de antes do lote 14, que era o mínimo de sempre.
 */
export const OPEN_MIN = 240;

/**
 * A altura com que a faixa abre da primeira vez.
 *
 * Não é o mínimo, é o mínimo **útil**. Em 240px a faixa aberta gasta tudo o
 * que tem com as abas, o tocador, a linha dos botões, a régua e o Resumo, e
 * sobram 26px para as linhas por osso — meia linha. Quem clica em "Detalhes"
 * está pedindo justamente essas linhas; abrir e não mostrar nenhuma seria o
 * botão mentindo. Medido em 1440×900: com 380 aparecem quatro linhas inteiras.
 */
export const DEFAULT_OPEN_HEIGHT = 380;

/**
 * Quanto o dedo precisa puxar a alça, acima da faixa fechada, para ela abrir.
 *
 * Arrastar a borda de cima também abre — é o gesto do Spriter, *"puxar para
 * cima abre uma linha por objeto"*. A folga existe para um tremor de 3px não
 * abrir a faixa sem querer.
 */
export const OPEN_AT = CLOSED_HEIGHT + 40;

/** De fábrica: fechada, e com a altura de abertura padrão guardada. */
export function defaultDockState(): DockState {
  return { open: false, height: DEFAULT_OPEN_HEIGHT };
}

/**
 * Lê o que estava gravado no arquivo e conserta o que vier torto.
 *
 * Valor de outro tipo, campo faltando, JSON de outra versão: tudo vira o
 * padrão daquele campo. Um estado de painel corrompido não pode impedir um
 * `.bone` de abrir.
 */
export function parseDockState(saved: unknown): DockState {
  const out = defaultDockState();
  if (saved === null || typeof saved !== 'object') return out;
  const raw = saved as Record<string, unknown>;
  if (raw['open'] === true) out.open = true;
  const height = raw['height'];
  if (typeof height === 'number' && Number.isFinite(height)) {
    out.height = Math.max(OPEN_MIN, height);
  }
  return out;
}

/**
 * Abre a faixa fechada, e fecha a aberta. A altura de aberta **não se perde**.
 *
 * Devolve um estado NOVO: quem chama compara com o de antes para saber se
 * precisa redesenhar, e nada muda pelas costas de ninguém.
 */
export function toggleDock(state: DockState): DockState {
  return { open: !state.open, height: state.height };
}

/** Guarda a altura de aberta, sempre dentro do mínimo. */
export function setDockHeight(state: DockState, height: number): DockState {
  const clean = Number.isFinite(height) ? height : DEFAULT_OPEN_HEIGHT;
  return { open: state.open, height: Math.max(OPEN_MIN, clean) };
}

/**
 * A altura que a faixa tem agora, em pixels.
 *
 * `rows` é quantas linhas por alvo a animação teria. Ele entra na conta **e é
 * de propósito ignorado quando a faixa está fechada**: uma animação de trinta
 * linhas e uma de uma linha fecham na mesma altura, senão "fechada" seria um
 * tamanho diferente em cada arquivo e a cena mudaria de tamanho ao abrir outro
 * personagem.
 */
export function dockHeightFor(state: DockState, rows: number, entityRow = false): number {
  if (!state.open) return CLOSED_HEIGHT + (entityRow ? ENTITY_ROW_HEIGHT : 0);
  void rows;
  return Math.max(OPEN_MIN, state.height);
}

/**
 * **A linha da entidade na faixa fechada** — rodada 8c, C11 (05/10/2026).
 *
 * O Humberto: *"a entidade já chega animada. Ela aparece como uma faixa, e eu
 * só ajusto a faixa"*. Com os Detalhes fechados a faixa não aparecia: a
 * fechada era só tocador, régua e Resumo. Agora, quando a animação aberta tem
 * entidade, a fechada ganha UMA linha a mais — a faixa da entidade escolhida,
 * ou da primeira. Uma linha só, qualquer que seja o número de entidades: a
 * altura muda entre "tem entidade" e "não tem", e mais nada. É a altura de uma
 * linha de faixa (`.dope-faixa`, 34 px) e a borda dela.
 */
export const ENTITY_ROW_HEIGHT = 35;

/**
 * O que a alça faz quando é largada numa altura.
 *
 * Arrastar para baixo, até perto do chão, fecha; puxar para cima abre. É o
 * mesmo gesto do Spriter, e é o que faz a alça e o botão Detalhes dizerem a
 * mesma coisa em vez de brigarem.
 *
 * **Abrir e fechar não têm a mesma medida** — anotação 4 do Humberto, *"se ela
 * está fechada, não devia abrir do nada"*. Fechada, ela só abre quando a alça
 * foi puxada até `OPEN_MIN`: 40px de folga eram pouco para um esbarrão, e a
 * faixa abria sozinha em cima da cena. Aberta, ela continua fechando em
 * `OPEN_AT`, perto do chão, porque aí o gesto é claramente de fechar.
 */
export function dockFromDrag(state: DockState, height: number): DockState {
  if (state.open) {
    if (height < OPEN_AT) return { open: false, height: state.height };
    return { open: true, height: Math.max(OPEN_MIN, height) };
  }
  // Fechada: abrir é um gesto grande, de propósito.
  if (height < OPEN_MIN) return { open: false, height: state.height };
  return { open: true, height };
}

/**
 * O que a folha desenha por baixo do Resumo.
 *
 * Fechada, **nada**: nem grupo, nem linha por osso, nem linha por desenho. O
 * Resumo continua inteiro, porque ele mora no cabeçalho e é ele que responde
 * "onde estão as poses?" — a única pergunta que a faixa fechada precisa
 * responder.
 */
export function visibleGroups<T>(open: boolean, groups: readonly T[]): readonly T[] {
  return open ? groups : [];
}

/** O botão Detalhes, como ele deve aparecer agora. */
export interface DetailsButton {
  label: string;
  hint: string;
  /** Vai para `aria-expanded`, e é o que faz a seta virar. */
  expanded: boolean;
}

/**
 * O texto e o estado do botão **Detalhes**.
 *
 * A dica diz o que aparece, e não "abre o painel": quem lê a dica quer saber o
 * que vai ganhar na tela, não o nome do gesto.
 */
export function detailsButton(open: boolean): DetailsButton {
  return {
    label: 'Detalhes',
    hint: open
      ? 'Detalhes: fecha e deixa só o tocador, a régua e o Resumo'
      : 'Detalhes: uma linha por osso e desenho, e os botões em bloco',
    expanded: open,
  };
}

// ---------------------------------------------------------------------------
// O estado em uso, para a casca e a folha não discordarem
// ---------------------------------------------------------------------------

let current: DockState = defaultDockState();
const listeners = new Set<(state: DockState) => void>();

/** Como a faixa está agora. Nunca mude o objeto: chame `setDockState`. */
export function dockState(): Readonly<DockState> {
  return current;
}

/** Muda o estado e avisa quem desenha: a casca e a folha, nesta ordem. */
export function setDockState(next: DockState): void {
  current = { open: next.open, height: Math.max(OPEN_MIN, next.height) };
  for (const listener of [...listeners]) listener(current);
}

/** Avisado quando a faixa abre ou fecha. Devolve como parar de ouvir. */
export function onDockChange(listener: (state: DockState) => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Volta ao padrão. Para o teste, que não pode herdar o estado do anterior. */
export function resetDockState(): void {
  setDockState(defaultDockState());
}
