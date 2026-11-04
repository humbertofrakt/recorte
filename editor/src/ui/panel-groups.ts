/**
 * A coluna da direita em abas, e onde cada aba está (dono A) — item 19.
 *
 * A coluna tinha seis painéis empilhados, cada um com seu título dobrável. Numa
 * janela de 900px cabiam três abertos; os outros três ficavam fora de vista, e
 * "fora de vista" acabou virando "não existe" para metade das funções do
 * programa.
 *
 * Agora são **dois grupos de abas**, um em cima do outro. Um grupo mostra uma
 * aba por vez e ocupa a altura inteira que tem — que é o que faz a Árvore
 * caber sem rolar. Quem quer dois painéis ao mesmo tempo põe um em cada grupo,
 * e é exatamente isso que os dois grupos existem para permitir.
 *
 * Este arquivo não toca em tela nenhuma: ele é a CONTA de onde cada aba está,
 * qual está à frente, e o quanto de altura o grupo de cima leva. A tela é do
 * `ui/shell.ts`.
 */

/** Onde as abas estão, qual está à frente, e a divisão de altura. */
export interface ColumnState {
  /** Um grupo por lista, na ordem em que eles aparecem, de cima para baixo. */
  groups: string[][];
  /** A aba à frente de cada grupo, ou `null` num grupo vazio. */
  active: Array<string | null>;
  /** `true` esconde a coluna inteira e a faixa de baixo — a tecla `Tab`. */
  hidden: boolean;
  /** Fatia da altura que o grupo de CIMA leva, de 0,15 a 0,85. */
  split: number;
  /**
   * Um por grupo: `true` recolhe o grupo, e só a tira de abas fica — o pedido
   * do Humberto, 13/09/2026: *"podia ter também botões para recolher quando
   * não estivesse usando"*. A altura que ele largou vai para o outro grupo.
   */
  collapsed: boolean[];
  /**
   * `true` enquanto a divisão é **automática**: o grupo que está sendo usado
   * leva a maior parte da altura. Arrastar a alça (ou mexer nela pelo teclado)
   * põe isto em `false` e a divisão passa a ser a que a pessoa escolheu — a
   * mão sempre vence a conta, e nunca é desfeita pelas costas dela.
   */
  autoSplit: boolean;
  /** O grupo usado por último. É ele que a divisão automática engorda. */
  focus: number;
  /**
   * Os painéis FECHADOS, e onde eles estavam quando fecharam — 13/09/2026.
   *
   * O Humberto: *"não dá pra fechar um menu e depois abrir ele em 'janelas'.
   * O menu janelas não funciona."* Ele estava certo por um motivo que ninguém
   * tinha visto: **fechar um painel não existia**. Não havia botão nenhum, e o
   * menu Janela só abria — embora cada item tivesse marca de seleção, que é o
   * desenho de um interruptor.
   *
   * Guardar `grupo` e `at` é o que faz a porta de volta levar ao lugar certo:
   * reabrir devolve a aba onde ela estava, e não no fim de um grupo qualquer.
   */
  closed: Array<{ id: string; group: number; at: number }>;
  /**
   * Os painéis DESCOLADOS, flutuando sobre a cena — 13/09/2026.
   *
   * O Humberto, com a foto: *"tentei mover menu pra lá, não foi"*, e antes:
   * *"descolar os menus da barra lateral; ok não fazer pop up, mas seria bom
   * poder descolar como no Photoshop"*.
   *
   * A distinção que ele mesmo fez: **flutuar dentro da janela do editor**, sim;
   * janela do sistema, não. São dois problemas diferentes, e o segundo continua
   * vetado por ele.
   *
   * `group` e `at` guardam de onde o painel saiu, como em `closed`: é o que faz
   * "Voltar ao padrão" devolver cada um ao seu lugar, e não a um canto qualquer.
   */
  floating: Array<{
    id: string; group: number; at: number; x: number; y: number; w: number; h: number;
    /** A quina ou borda da cena em que ele está colado — degrau 11, lote 3. */
    snap?: FloatSnap;
    /**
     * Recolhido até a barra por dois cliques nela — rodada 4, lote 4. A caixa
     * guardada (`h`) continua a de antes: é ela que volta. Sem a marca, aberto.
     */
    recolhido?: boolean;
    /**
     * O grupo solto inteiro — rodada 4, lote 5: todas as abas, na ordem, com a
     * da frente (`id`) dentro. Sem a lista, é o solto de uma aba só. Um leitor
     * de antes deste campo o ignora, e as outras abas voltam ao grupo de
     * fábrica delas (a regra 2 de `parseColumnState`): nada se perde.
     */
    tabs?: string[];
  }>;
}

/**
 * A arrumação de fábrica.
 *
 * Em cima o que se usa o dia inteiro — a Árvore e as Propriedades. Embaixo o
 * que se abre para uma tarefa e se fecha: a lista de animações, a exibição, e
 * a malha, que só aparece com a ferramenta de malha ou de pesos na mão.
 *
 * A Prévia saiu da coluna no mesmo lote e virou aba da faixa de baixo (item
 * 30): ela é sobre TEMPO, e o lugar do tempo é embaixo, ao lado das Curvas.
 */
export const DEFAULT_GROUPS: readonly (readonly string[])[] = Object.freeze([
  Object.freeze(['arvore', 'propriedades']),
  Object.freeze(['animacoes', 'exibicao', 'malha']),
]);

/** A divisão de fábrica: o grupo de cima leva um pouco mais da metade. */
export const DEFAULT_SPLIT = 0.58;

/** Os limites da divisão. Menos que isto não é painel: é uma tira de título. */
export const SPLIT_MIN = 0.15;
export const SPLIT_MAX = 0.85;

/**
 * A fatia do grupo que está sendo USADO, com a divisão automática — 13/09/2026.
 *
 * A divisão de fábrica era 0,58 fixa, e não olhava para onde a pessoa estava
 * trabalhando. A medição de altura mostrou a conta: a Prévia precisa de 405 px
 * e recebia 213; em 1280×720 a lista de animações não mostrava **nenhuma**
 * animação, só a barra de ícones.
 *
 * Com 0,68 numa coluna de 900 px o grupo usado fica com ~610 px, e com ~490 em
 * 720 px — os dois acima dos 405 de que a Prévia precisa.
 *
 * Por que não dar TUDO ao grupo usado: o outro viraria uma tira de abas a cada
 * clique, e a coluna existe justamente para ter dois painéis à vista ao mesmo
 * tempo. Quem quer um só agora tem o botão de recolher, que é explícito e
 * fica onde a pessoa o deixou.
 */
export const FOCUS_SPLIT = 0.68;

/** A arrumação de fábrica, pronta para usar. */
export function defaultColumnState(): ColumnState {
  return {
    groups: DEFAULT_GROUPS.map((group) => [...group]),
    active: DEFAULT_GROUPS.map((group) => group[0] ?? null),
    hidden: false,
    split: DEFAULT_SPLIT,
    collapsed: DEFAULT_GROUPS.map(() => false),
    autoSplit: true,
    focus: 0,
    closed: [],
    floating: [],
  };
}

function clampSplit(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_SPLIT;
  return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, value));
}

/**
 * Lê a arrumação guardada e a **concerta** contra os painéis que existem hoje.
 *
 * Um arquivo pode vir de uma versão com outros painéis, ou de uma mão que
 * editou o JSON. As três regras:
 *
 * 1. Aba de painel que não existe mais é jogada fora — senão haveria uma aba
 *    que não abre nada.
 * 2. Painel que existe e não está em grupo nenhum entra no grupo em que ele
 *    nasce por fábrica, ou no último. Um painel sem aba seria um painel que o
 *    menu Janela promete e a coluna não entrega.
 * 3. Nenhuma aba fica em dois grupos.
 */
export function parseColumnState(saved: unknown, known: readonly string[]): ColumnState {
  const raw = (saved !== null && typeof saved === 'object'
    ? saved as Record<string, unknown>
    : {});
  const rawGroups = Array.isArray(raw['groups']) ? raw['groups'] as unknown[] : [];

  const seen = new Set<string>();
  const groups: string[][] = DEFAULT_GROUPS.map((_, index) => {
    const list = Array.isArray(rawGroups[index]) ? rawGroups[index] as unknown[] : [];
    const out: string[] = [];
    for (const id of list) {
      if (typeof id !== 'string' || !known.includes(id) || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
    return out;
  });

  // Quem foi FECHADO fica de fora dos grupos — mas continua conhecido, e
  // continua escrito no menu Janela. Sem esta leitura antes da regra 2, todo
  // painel fechado reabriria sozinho na abertura seguinte.
  const rawClosed = Array.isArray(raw['closed']) ? raw['closed'] as unknown[] : [];
  const closed: Array<{ id: string; group: number; at: number }> = [];
  for (const item of rawClosed) {
    if (item === null || typeof item !== 'object') continue;
    const campo = item as Record<string, unknown>;
    const id = campo['id'];
    if (typeof id !== 'string' || !known.includes(id) || seen.has(id)) continue;
    if (closed.some((outro) => outro.id === id)) continue;
    const group = typeof campo['group'] === 'number' ? campo['group'] : 0;
    const at = typeof campo['at'] === 'number' ? campo['at'] : 0;
    closed.push({
      id,
      group: Math.min(groups.length - 1, Math.max(0, Math.trunc(group))),
      at: Math.max(0, Math.trunc(at)),
    });
    seen.add(id);
  }

  // Quem está FLUTUANDO também fica de fora dos grupos, pela mesma razão do
  // `closed`: sem esta leitura antes da regra 2, todo painel descolado voltaria
  // para a coluna sozinho na abertura seguinte.
  const rawFloating = Array.isArray(raw['floating']) ? raw['floating'] as unknown[] : [];
  const floating: ColumnState['floating'] = [];
  for (const item of rawFloating) {
    if (item === null || typeof item !== 'object') continue;
    const campo = item as Record<string, unknown>;
    const id = campo['id'];
    if (typeof id !== 'string' || !known.includes(id) || seen.has(id)) continue;
    if (floating.some((outro) => outro.id === id)) continue;
    const numero = (nome: string, chao: number): number => {
      const valor = campo[nome];
      return typeof valor === 'number' && Number.isFinite(valor) ? valor : chao;
    };
    seen.add(id);
    // Rodada 4, lote 5: as abas do grupo solto. O que não existe mais, ou já
    // está em outro lugar, sai; a da frente sempre fica. Sobrando só ela, é o
    // solto de uma aba, e o item fica como era.
    const abas: string[] = [];
    const rawTabs = campo['tabs'];
    if (Array.isArray(rawTabs)) {
      for (const aba of rawTabs) {
        if (aba === id) {
          if (!abas.includes(id)) abas.push(id);
          continue;
        }
        if (typeof aba !== 'string' || !known.includes(aba) || seen.has(aba)) continue;
        abas.push(aba);
        seen.add(aba);
      }
      if (!abas.includes(id)) abas.unshift(id);
    }
    floating.push({
      id,
      group: Math.min(groups.length - 1, Math.max(0, Math.trunc(numero('group', 0)))),
      at: Math.max(0, Math.trunc(numero('at', 0))),
      x: numero('x', 80),
      y: numero('y', 80),
      w: Math.max(FLOAT_MIN_W, numero('w', FLOAT_DEFAULT_W)),
      h: Math.max(FLOAT_MIN_H, numero('h', FLOAT_DEFAULT_H)),
      // Quina desconhecida não vira palpite: o painel fica solto onde estava.
      ...(isFloatSnap(campo['snap']) ? { snap: campo['snap'] } : {}),
      // Rodada 4, lote 4: só `true` recolhe; qualquer outra coisa abre aberto.
      ...(campo['recolhido'] === true ? { recolhido: true } : {}),
      ...(abas.length > 1 ? { tabs: abas } : {}),
    });
  }

  for (const id of known) {
    if (seen.has(id)) continue;
    const home = DEFAULT_GROUPS.findIndex((group) => group.includes(id));
    groups[home === -1 ? groups.length - 1 : home].push(id);
    seen.add(id);
  }

  // Fechar TODOS deixaria a coluna sem aba nenhuma e sem nada para clicar a
  // não ser o menu. O menu resolve — mas um programa que abre assim parece
  // quebrado, e a porta de volta não pode depender de a pessoa adivinhar onde
  // ela está. O último volta.
  if (groups.every((group) => group.length === 0) && floating.length === 0 && closed.length > 0) {
    const volta = closed.shift();
    if (volta !== undefined) groups[Math.min(volta.group, groups.length - 1)]!.push(volta.id);
  }

  const rawActive = Array.isArray(raw['active']) ? raw['active'] as unknown[] : [];
  const active = groups.map((group, index) => {
    const wanted = rawActive[index];
    return typeof wanted === 'string' && group.includes(wanted) ? wanted : group[0] ?? null;
  });

  const rawCollapsed = Array.isArray(raw['collapsed']) ? raw['collapsed'] as unknown[] : [];
  const collapsed = groups.map((_, index) => rawCollapsed[index] === true);
  // Todos os grupos recolhidos deixaria a coluna sem painel nenhum, e nenhum
  // botão à vista para desfazer isso a não ser as tiras. Não é um estado que
  // o programa cria; um arquivo torto poderia trazê-lo, e aqui ele se desfaz.
  if (collapsed.length > 0 && collapsed.every((um) => um)) collapsed[0] = false;

  const rawFocus = raw['focus'];
  const focus = typeof rawFocus === 'number' && Number.isInteger(rawFocus)
    && rawFocus >= 0 && rawFocus < groups.length ? rawFocus : 0;

  return {
    groups,
    active,
    hidden: raw['hidden'] === true,
    split: clampSplit(raw['split']),
    collapsed,
    // Sem a marca gravada, o automático VALE: é o que um arquivo de antes
    // deste lote traz, e é o comportamento novo que se quer nele.
    autoSplit: raw['autoSplit'] !== false,
    focus,
    closed,
    floating,
  };
}

/** Em que grupo aquela aba está, ou `-1`. */
export function groupOf(state: ColumnState, id: string): number {
  return state.groups.findIndex((group) => group.includes(id));
}

/**
 * Põe a aba à frente do grupo dela. Aba que não existe não muda nada.
 *
 * Devolve um estado NOVO: quem chama compara com o de antes para saber se
 * precisa redesenhar, e nada muda pelas costas de ninguém.
 */
export function selectTab(state: ColumnState, id: string): ColumnState {
  const index = groupOf(state, id);
  if (index === -1) return state;
  const active = [...state.active];
  active[index] = id;
  // Escolher uma aba é dizer "é aqui que eu estou trabalhando": o grupo dela
  // passa a ser o que a divisão automática engorda. E abrir uma aba de um
  // grupo recolhido o desdobra — clicar num nome e nada aparecer é um botão
  // que mente.
  const collapsed = [...state.collapsed];
  collapsed[index] = false;
  return { ...state, active, collapsed, focus: index };
}

/**
 * Move uma aba para outro grupo — arrastar a aba, do item 19.
 *
 * `at` é a posição dentro do grupo de destino; sem ela, a aba vai para o fim.
 * Se o grupo de origem ficar vazio, ele fica vazio mesmo: dois grupos é a
 * forma da coluna, e um grupo vazio ainda aceita uma aba arrastada de volta.
 */
export function moveTab(
  state: ColumnState, id: string, toGroup: number, at?: number,
): ColumnState {
  const from = groupOf(state, id);
  if (from === -1 || toGroup < 0 || toGroup >= state.groups.length) return state;

  const groups = state.groups.map((group) => group.filter((other) => other !== id));
  const target = groups[toGroup];
  const where = at === undefined ? target.length : Math.min(target.length, Math.max(0, at));
  target.splice(where, 0, id);

  const active = state.active.map((current, index) => {
    if (index === toGroup) return id;
    // O grupo de onde ela saiu precisa de outra aba à frente.
    if (index === from && current === id) return groups[index][0] ?? null;
    return current;
  });
  return { ...state, groups, active };
}

/** Esconde ou mostra a coluna e a faixa de baixo — a tecla `Tab`. */
export function toggleHidden(state: ColumnState): ColumnState {
  return { ...state, hidden: !state.hidden };
}

/**
 * Muda a divisão de altura, sempre dentro dos limites.
 *
 * Mexer na alça DESLIGA o automático: daí em diante manda a mão. É a regra
 * que evita o pior dos dois mundos — um programa que arruma sozinho o que a
 * pessoa acabou de arrumar.
 */
export function setSplit(state: ColumnState, split: number): ColumnState {
  return { ...state, split: clampSplit(split), autoSplit: false };
}

/** Devolve o automático, que é o que os dois cliques na alça fazem. */
export function restoreAutoSplit(state: ColumnState): ColumnState {
  return { ...state, autoSplit: true };
}

/**
 * Recolhe ou devolve um grupo — o botão da tira de abas.
 *
 * Recolher o último grupo aberto não é permitido: a coluna ficaria com duas
 * tiras e nenhum painel. Quem quer a tela inteira tem o `Tab`, que esconde as
 * colunas de uma vez e diz na barra de baixo como voltar.
 */
export function toggleCollapsed(state: ColumnState, index: number): ColumnState {
  if (index < 0 || index >= state.groups.length) return state;
  const collapsed = [...state.collapsed];
  const querRecolher = collapsed[index] !== true;
  if (querRecolher && collapsed.every((um, i) => (i === index ? true : um === true))) return state;
  collapsed[index] = querRecolher;
  // Recolher o grupo em que se estava trabalhando passa a vez para o outro:
  // senão a altura que ele largou voltaria para ele mesmo.
  const focus = querRecolher && state.focus === index
    ? collapsed.findIndex((um) => um !== true)
    : state.focus;
  return { ...state, collapsed, focus: focus === -1 ? state.focus : focus };
}

/** Aquele grupo está recolhido? */
export function isCollapsed(state: ColumnState, index: number): boolean {
  return state.collapsed[index] === true;
}

/**
 * A fatia de altura de cada grupo — a conta que a tela aplica.
 *
 * `null` quer dizer "só o que a tira de abas pedir": é o grupo recolhido, que
 * não estica nem encolhe.
 *
 * Três casos, nesta ordem:
 *
 * 1. Recolhido: `null`, e a altura dele vai para os outros.
 * 2. Um grupo aberto só: ele leva tudo.
 * 3. Dois abertos: com o automático, o que está sendo usado leva `FOCUS_SPLIT`
 *    e o outro o resto; sem o automático, vale o `split` que a mão deixou.
 */
export function groupShares(state: ColumnState): Array<number | null> {
  const abertos: number[] = [];
  state.groups.forEach((grupo, index) => {
    // Grupo VAZIO não leva altura nenhuma — 13/09/2026. Fechar o último painel
    // de um grupo deixava a tira vazia ocupando a sua fatia, e a divisão
    // automática chegava a engordá-la. Ele some e devolve o espaço; quando o
    // painel volta, o grupo volta com ele.
    if (grupo.length > 0 && !isCollapsed(state, index)) abertos.push(index);
  });
  if (abertos.length === 0) return state.groups.map(() => null);
  if (abertos.length === 1) {
    return state.groups.map((_, index) => (index === abertos[0] ? 1 : null));
  }
  const cima = state.autoSplit
    ? (state.focus === 0 ? FOCUS_SPLIT : 1 - FOCUS_SPLIT)
    : state.split;
  return state.groups.map((grupo, index) => {
    if (grupo.length === 0 || isCollapsed(state, index)) return null;
    return index === 0 ? cima : 1 - cima;
  });
}

/** A menor altura de um grupo, em pixels, quando a alça é arrastada — lote 52. */
export const GROUP_MIN_PX = 80;

/**
 * A divisão depois de arrastar a alça `dy` pixels numa coluna de `room`
 * pixels — lote 52. Tira de um grupo e dá ao outro, e nenhum dos dois fica
 * com menos de `minPx`: abaixo disso sobra só a tira de abas. Os limites de
 * sempre (`SPLIT_MIN`, `SPLIT_MAX`) continuam valendo.
 */
export function resizeSplit(split: number, dy: number, room: number, minPx = GROUP_MIN_PX): number {
  if (!(room > 0)) return clampSplit(split);
  const top = split * room + dy;
  const low = Math.min(room / 2, minPx);
  const bounded = Math.min(room - low, Math.max(low, top));
  return clampSplit(bounded / room);
}

// ---------------------------------------------------------------------------
// Onde a aba arrastada cai — 13/09/2026
// ---------------------------------------------------------------------------

/**
 * A pessoa organiza a coluna do jeito dela — o pedido do Humberto: *"quero
 * formas de organizar o menu do meu jeito; todo programa faz isso"*.
 *
 * COMO OS TRÊS FAZEM, olhado antes de desenhar o gesto:
 *
 * | Programa    | Dá para reorganizar? | Como |
 * |:---|:---|:---|
 * | Spriter     | **não** | os painéis são fixos: file palette, animation palette, z-order, hierarchy, object properties, cada um no seu canto |
 * | Spine       | **sim** | cada painel é uma *view* com aba, e as abas se arrastam de um lugar para outro |
 * | DragonBones | **não** | painéis fixos por função |
 *
 * Dois dos três não deixam. O terceiro deixa, arrastando a aba — e é esse
 * caminho que o Recorte já tinha tomado no lote 19, quando a coluna virou dois
 * grupos de abas. Então não havia gesto novo a inventar: o gesto certo já
 * estava na tela, **pela metade**. Arrastar a aba levava ela para o outro
 * grupo, mas ela caía sempre no FIM, e não onde o dedo soltou.
 *
 * A régua é o Spriter: o gesto mais curto, sem modo novo e sem janela a mais.
 * Completar o arrasto que já existe é mais curto que qualquer coisa que se
 * pudesse acrescentar.
 */

/** Um retângulo de aba na tela, como o `getBoundingClientRect` o devolve. */
export interface TabRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Em que posição da tira a aba solta em `(x, y)` deve entrar.
 *
 * Puro: recebe os retângulos e o ponto, devolve o índice. A tira quebra em
 * várias linhas quando há abas demais (`flex-wrap`), e por isso a conta é em
 * dois passos, e não só pelo `x`:
 *
 * 1. **A linha**: ficam as abas cujo intervalo vertical contém o `y`. Sem
 *    nenhuma — o dedo soltou no vão entre linhas ou na borda —, vale a linha
 *    de centro mais perto.
 * 2. **O lugar na linha**: a primeira aba cujo MEIO está à direita do `x`. Se
 *    nenhuma está, a aba vai depois da última daquela linha.
 *
 * Soltar numa tira vazia devolve 0, que é o único lugar que existe.
 */
export function dropIndex(rects: readonly TabRect[], x: number, y: number): number {
  if (rects.length === 0) return 0;

  let naLinha = rects
    .map((rect, index) => ({ rect, index }))
    .filter(({ rect }) => y >= rect.top && y <= rect.bottom);

  if (naLinha.length === 0) {
    // O vão entre duas linhas, ou fora da tira: a linha de centro mais perto.
    const centro = (rect: TabRect): number => (rect.top + rect.bottom) / 2;
    let melhor = Math.abs(centro(rects[0]!) - y);
    for (const rect of rects) melhor = Math.min(melhor, Math.abs(centro(rect) - y));
    naLinha = rects
      .map((rect, index) => ({ rect, index }))
      .filter(({ rect }) => Math.abs(centro(rect) - y) <= melhor + 0.5);
  }

  for (const { rect, index } of naLinha) {
    if (x < (rect.left + rect.right) / 2) return index;
  }
  return (naLinha[naLinha.length - 1]?.index ?? rects.length - 1) + 1;
}

/**
 * A posição que o `moveTab` espera, a partir da posição VISUAL onde o dedo
 * soltou.
 *
 * `moveTab` tira a aba de onde ela estava antes de pôr onde vai, então o array
 * em que ela entra é um item mais curto. Arrastar uma aba para a direita
 * dentro do mesmo grupo precisa descontar esse um — sem isso, largar a aba
 * "logo à direita" a deixa exatamente onde ela já estava, e o arrasto parece
 * não ter funcionado.
 */
export function insertionIndex(group: readonly string[], id: string, visual: number): number {
  const atual = group.indexOf(id);
  return atual !== -1 && atual < visual ? visual - 1 : visual;
}

// ---------------------------------------------------------------------------
// Fechar um painel, e a porta de volta — 13/09/2026
// ---------------------------------------------------------------------------

/**
 * A REGRA DA CASA para tudo o que se fecha: **nada some sem porta de volta.**
 *
 * O painel fechado sai da tira de abas e passa a viver em `closed`, com o grupo
 * e a posição em que estava. O menu Janela lista os dois — os que estão na tela
 * e os que foram fechados —, e é essa lista que torna o fechar seguro. Fechar
 * sem ela seria perder o painel, e o Humberto já topou com isso hoje.
 */

/** O painel está na tela, isto é, em algum grupo? */
export function isPanelClosed(state: ColumnState, id: string): boolean {
  return state.closed.some((item) => item.id === id);
}

/**
 * Todo painel ABERTO: os da coluna e os que estão flutuando sobre a cena.
 *
 * O flutuante está aberto — ele está na tela, só não está encostado na lateral.
 * Contá-lo aqui é o que impede "o último painel não se fecha" de recusar um
 * fechamento legítimo, e o que impede a coluna de se achar vazia quando só há
 * flutuantes.
 */
export function openPanels(state: ColumnState): string[] {
  // Rodada 4, lote 5: o grupo solto conta todas as abas dele.
  return [...state.groups.flat(), ...state.floating.flatMap((item) => item.tabs ?? [item.id])];
}

/** Só os que estão na coluna, encostados. */
export function dockedPanels(state: ColumnState): string[] {
  return state.groups.flat();
}

/**
 * Fecha um painel: ele sai do grupo e vai para a lista, com o lugar guardado.
 *
 * Fechar o ÚLTIMO painel aberto é recusado, como recolher o último grupo: a
 * coluna ficaria sem nada em que clicar, e a porta de volta passaria a depender
 * de a pessoa saber que ela está no menu Janela. Quem quer a tela inteira tem
 * o `Tab`, que diz na barra de baixo como voltar.
 */
export function closePanel(state: ColumnState, id: string): ColumnState {
  const group = groupOf(state, id);
  if (group === -1) return state;
  if (openPanels(state).length <= 1) return state;
  const at = state.groups[group]!.indexOf(id);
  const groups = state.groups.map((lista) => lista.filter((outro) => outro !== id));
  const active = state.active.map((atual, index) => (
    index === group && atual === id ? groups[index]![0] ?? null : atual
  ));
  // O grupo que ficou vazio não pode continuar levando altura, nem ser o grupo
  // "em uso": a divisão automática engordaria uma tira sem nada dentro.
  const focus = groups[state.focus]?.length === 0
    ? groups.findIndex((lista) => lista.length > 0)
    : state.focus;
  return {
    ...state,
    groups,
    active,
    focus: focus === -1 ? state.focus : focus,
    closed: [...state.closed, { id, group, at }],
  };
}

/**
 * Reabre um painel, **no lugar de onde ele saiu**.
 *
 * Devolver a aba ao fim de um grupo qualquer seria uma porta de volta que leva
 * a outro cômodo: quem fecha a Prévia que estava entre Imagens e Exibição
 * espera encontrá-la ali quando voltar. O grupo pode ter encolhido desde
 * então, e por isso a posição é limitada ao tamanho de agora.
 */
export function reopenPanel(state: ColumnState, id: string): ColumnState {
  const guardado = state.closed.find((item) => item.id === id);
  if (guardado === undefined) return state;
  const group = Math.min(guardado.group, state.groups.length - 1);
  const groups = state.groups.map((lista) => [...lista]);
  const alvo = groups[group]!;
  alvo.splice(Math.min(guardado.at, alvo.length), 0, id);
  const active = [...state.active];
  active[group] = id;
  const collapsed = [...state.collapsed];
  // Reabrir num grupo recolhido tem de mostrar o painel: senão o item do menu
  // responde e nada aparece, que é a queixa de origem com outra roupa.
  collapsed[group] = false;
  return {
    ...state,
    groups,
    active,
    collapsed,
    focus: group,
    closed: state.closed.filter((item) => item.id !== id),
  };
}

/**
 * Fecha um GRUPO inteiro: as abas dele somem juntas, e voltam juntas pelo
 * menu Janela, cada uma no seu lugar.
 *
 * É diferente de recolher: recolher deixa a tira de nomes à vista, fechar tira
 * tudo da tela. O último painel aberto continua protegido — fechar um grupo
 * que levasse o último embora é recusado inteiro, e não pela metade.
 */
export function closeGroup(state: ColumnState, index: number): ColumnState {
  const grupo = state.groups[index];
  if (grupo === undefined || grupo.length === 0) return state;
  if (openPanels(state).length <= grupo.length) return state;
  let proximo = state;
  for (const id of [...grupo]) proximo = closePanel(proximo, id);
  return proximo;
}

// ---------------------------------------------------------------------------
// Descolar o painel da lateral — 13/09/2026
// ---------------------------------------------------------------------------

/**
 * O Humberto: *"descolar os menus da barra lateral; ok não fazer pop up, mas
 * seria bom poder descolar como no Photoshop"*.
 *
 * COMO OS PROGRAMAS FAZEM, olhado antes de desenhar o gesto:
 *
 * | Programa    | Descola? | Como |
 * |:---|:---|:---|
 * | Photoshop   | **sim** | arrastar a aba para fora da barra solta o painel, que passa a flutuar sobre a arte com barra de título própria; arrastar a barra de volta para a borda o cola |
 * | Spine       | **sim** | as *views* saem da lateral e flutuam sobre a cena |
 * | Spriter     | **não** | painéis fixos |
 * | DragonBones | **não** | painéis fixos |
 *
 * O gesto é o mesmo nos dois que descolam, e é o que ele descreveu: **arrastar
 * a aba para fora**. Não há modo novo, não há janela a mais, e é o arrasto que
 * já existe aqui — ele só passou a valer também fora da tira.
 *
 * A régua do tamanho: um painel flutuante **não pode cobrir a cena inteira**
 * nem ficar preso fora da tela. As duas coisas são a mesma armadilha — um
 * painel que não se pega mais —, e as duas são resolvidas por `clampFloat`.
 */

/** Tamanho de fábrica de um painel que acabou de ser descolado. */
export const FLOAT_DEFAULT_W = 280;
export const FLOAT_DEFAULT_H = 320;

/** Menor tamanho que ainda é um painel, e não uma tira de título. */
export const FLOAT_MIN_W = 180;
export const FLOAT_MIN_H = 120;

/**
 * Quanto do painel tem de sobrar dentro da área, em pixels.
 *
 * É o que garante que sempre haja barra de título para pegar: arrastado para
 * fora da janela, ele para com esta faixa ainda visível. Um painel que sai
 * inteiro da tela é um painel perdido, e a barra de título é a única parte que
 * serve para trazê-lo de volta.
 */
export const FLOAT_KEEP = 48;

/** Quanto da cena um flutuante pode ocupar, de cada lado. */
export const FLOAT_MAX_FRACTION = 0.8;

export interface FloatBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Põe a caixa dentro da área: tamanho entre o mínimo e 80% da cena, e posição
 * tal que sobre sempre `FLOAT_KEEP` de painel visível.
 *
 * Puro, e é onde moram as duas armadilhas que o lote tinha de evitar: cobrir a
 * cena inteira, e ficar preso fora da tela.
 */
export function clampFloat(box: FloatBox, areaW: number, areaH: number): FloatBox {
  const maxW = Math.max(FLOAT_MIN_W, Math.floor(areaW * FLOAT_MAX_FRACTION));
  const maxH = Math.max(FLOAT_MIN_H, Math.floor(areaH * FLOAT_MAX_FRACTION));
  const w = Math.min(maxW, Math.max(FLOAT_MIN_W, Math.round(box.w)));
  const h = Math.min(maxH, Math.max(FLOAT_MIN_H, Math.round(box.h)));
  // A faixa que tem de sobrar nunca é maior que o próprio painel.
  const sobra = Math.min(FLOAT_KEEP, w, h);
  const x = Math.min(Math.max(Math.round(box.x), sobra - w), Math.max(0, areaW - sobra));
  const y = Math.min(Math.max(Math.round(box.y), 0), Math.max(0, areaH - sobra));
  return { x, y, w, h };
}

/** Aquele painel está flutuando? */
export function isPanelFloating(state: ColumnState, id: string): boolean {
  return state.floating.some((item) => item.id === id);
}

/** A caixa de um flutuante, ou `null`. */
export function floatBoxOf(state: ColumnState, id: string): FloatBox | null {
  const item = state.floating.find((outro) => outro.id === id);
  return item === null || item === undefined ? null : { x: item.x, y: item.y, w: item.w, h: item.h };
}

/**
 * Descola o painel da coluna: ele sai do grupo e passa a flutuar.
 *
 * Guarda de onde saiu, como o fechar — é o que faz "Voltar ao padrão" e o
 * colar de volta levarem cada um ao seu lugar.
 *
 * Descolar o ÚLTIMO painel da coluna é permitido: ele continua na tela, e a
 * coluna vazia some sozinha. O que não se permite é ficar sem nenhum painel em
 * lugar nenhum, e isso `closePanel` já guarda.
 */
export function floatPanel(state: ColumnState, id: string, box: FloatBox): ColumnState {
  const group = groupOf(state, id);
  if (group === -1) return state;
  const at = state.groups[group]!.indexOf(id);
  const groups = state.groups.map((lista) => lista.filter((outro) => outro !== id));
  const active = state.active.map((atual, index) => (
    index === group && atual === id ? groups[index]![0] ?? null : atual
  ));
  const focus = groups[state.focus]?.length === 0
    ? groups.findIndex((lista) => lista.length > 0)
    : state.focus;
  return {
    ...state,
    groups,
    active,
    focus: focus === -1 ? state.focus : focus,
    floating: [...state.floating, { id, group, at, ...box }],
  };
}

/**
 * Cola o painel de volta na coluna, no grupo pedido.
 *
 * Sem grupo pedido, ele volta para o de onde saiu — que é o que "Voltar ao
 * padrão" quer, e o que a pessoa espera quando arrasta a barra de título de
 * volta sem mirar em nada.
 */
export function dockPanel(
  state: ColumnState, id: string, toGroup?: number, at?: number,
): ColumnState {
  const guardado = state.floating.find((item) => item.id === id);
  if (guardado === undefined) return state;
  const group = Math.min(
    state.groups.length - 1,
    Math.max(0, toGroup === undefined ? guardado.group : toGroup),
  );
  const groups = state.groups.map((lista) => [...lista]);
  const alvo = groups[group]!;
  const onde = at === undefined ? guardado.at : at;
  // Rodada 4, lote 5: o grupo solto volta INTEIRO, na ordem. Antes só o `id`
  // voltava, e as outras abas ficariam em lugar nenhum.
  alvo.splice(Math.min(Math.max(0, onde), alvo.length), 0, ...(guardado.tabs ?? [id]));
  const active = [...state.active];
  active[group] = id;
  const collapsed = [...state.collapsed];
  collapsed[group] = false;
  return {
    ...state,
    groups,
    active,
    collapsed,
    focus: group,
    floating: state.floating.filter((item) => item.id !== id),
  };
}

/** Move ou redimensiona um flutuante, sempre dentro da área. */
export function setFloatBox(
  state: ColumnState, id: string, box: FloatBox, areaW: number, areaH: number,
): ColumnState {
  if (!isPanelFloating(state, id)) return state;
  const dentro = clampFloat(box, areaW, areaH);
  return {
    ...state,
    floating: state.floating.map((item) => (item.id === id ? { ...item, ...dentro } : item)),
  };
}

/**
 * Traz TODOS os flutuantes de volta para a coluna, cada um ao seu lugar.
 *
 * É o resgate de "Voltar ao padrão", e é a rede da armadilha: um painel que
 * ficou onde não se pega mais volta por aqui, sem a pessoa precisar acertá-lo
 * com o ponteiro.
 */
export function dockAllFloating(state: ColumnState): ColumnState {
  let proximo = state;
  // Do último para o primeiro, para o `at` de cada um continuar valendo
  // enquanto os outros ainda não entraram.
  for (const item of [...state.floating].reverse()) proximo = dockPanel(proximo, item.id);
  return proximo;
}

// ---------------------------------------------------------------------------
// Colar na quina — degrau 11, lote 3 (18/09/2026), C1
// ---------------------------------------------------------------------------

/*
 * O Humberto, 13/09: *"no Photoshop, se eu encosto nas quinas, a janela se
 * adapta, 'cola' no lugar."*
 *
 * O painel flutuante que chega perto de uma borda ou de uma quina **da cena**
 * cola nela: encosta sozinho, sem a pessoa acertar o pixel. Enquanto a mão
 * segura, uma sombra mostra onde ele vai parar (`shell.ts` desenha; quem
 * decide é `snapFloat`). Fora da zona, nada cola: ele fica onde foi solto,
 * como sempre ficou.
 *
 * A quina fica GUARDADA (`snap`): quando a janela do programa muda de tamanho,
 * ou uma coluna abre e fecha, o painel continua na quina dele — é o "se
 * adapta". Arrastá-lo para longe solta a quina.
 */

/** Onde o flutuante colou: as quatro quinas e as quatro bordas da cena. */
export type FloatSnap = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

const FLOAT_SNAPS: readonly FloatSnap[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

export function isFloatSnap(value: unknown): value is FloatSnap {
  return typeof value === 'string' && (FLOAT_SNAPS as readonly string[]).includes(value);
}

/** A que distância da borda da cena, em pixels, o painel cola. */
export const SNAP_ZONE = 24;

/** A cena, nas coordenadas da camada dos flutuantes. */
export interface SnapArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A quina ou borda em que esta caixa colaria, ou `null` fora de toda zona.
 *
 * Conta a BORDA DO PAINEL, e não o ponteiro: a barra de título fica em cima, e
 * com o ponteiro como régua a quina de baixo nunca seria alcançada.
 */
export function snapOf(box: FloatBox, area: SnapArea, zone = SNAP_ZONE): FloatSnap | null {
  const perto = (a: number, b: number): boolean => Math.abs(a - b) <= zone;
  const oeste = perto(box.x, area.x);
  const leste = perto(box.x + box.w, area.x + area.w);
  const norte = perto(box.y, area.y);
  const sul = perto(box.y + box.h, area.y + area.h);
  // Painel mais largo que a cena encostaria nos dois lados: ganha o de perto.
  const h = oeste && leste
    ? (Math.abs(box.x - area.x) <= Math.abs(box.x + box.w - area.x - area.w) ? 'w' : 'e')
    : oeste ? 'w' : leste ? 'e' : '';
  const v = norte && sul
    ? (Math.abs(box.y - area.y) <= Math.abs(box.y + box.h - area.y - area.h) ? 'n' : 's')
    : norte ? 'n' : sul ? 's' : '';
  const nome = `${v}${h}`;
  return isFloatSnap(nome) ? nome : null;
}

/** A caixa encostada naquela quina ou borda. O tamanho não muda. */
export function snappedBox(box: FloatBox, snap: FloatSnap, area: SnapArea): FloatBox {
  let { x, y } = box;
  if (snap.includes('w')) x = area.x;
  if (snap.includes('e')) x = area.x + area.w - box.w;
  if (snap.includes('n')) y = area.y;
  if (snap.includes('s')) y = area.y + area.h - box.h;
  return { x: Math.round(x), y: Math.round(y), w: box.w, h: box.h };
}

/** A caixa como ficaria ao soltar: colada, se estiver numa zona; igual, se não. */
export function snapFloat(
  box: FloatBox, area: SnapArea, zone = SNAP_ZONE,
): { box: FloatBox; snap: FloatSnap | null } {
  const snap = snapOf(box, area, zone);
  return { box: snap === null ? box : snappedBox(box, snap, area), snap };
}

/** Os nomes das quinas e bordas, para a frase do rodapé. */
export const SNAP_WORDS: Readonly<Record<FloatSnap, string>> = Object.freeze({
  nw: 'na quina de cima, à esquerda',
  n: 'na borda de cima',
  ne: 'na quina de cima, à direita',
  w: 'na borda esquerda',
  e: 'na borda direita',
  sw: 'na quina de baixo, à esquerda',
  s: 'na borda de baixo',
  se: 'na quina de baixo, à direita',
});

/** Guarda (ou solta) a quina de um flutuante. */
export function setFloatSnap(state: ColumnState, id: string, snap: FloatSnap | null): ColumnState {
  if (!isPanelFloating(state, id)) return state;
  return {
    ...state,
    floating: state.floating.map((item) => {
      if (item.id !== id) return item;
      const { snap: _velha, ...resto } = item;
      return snap === null ? resto : { ...resto, snap };
    }),
  };
}

/** A quina guardada de um flutuante, ou `null`. */
export function floatSnapOf(state: ColumnState, id: string): FloatSnap | null {
  return state.floating.find((item) => item.id === id)?.snap ?? null;
}
