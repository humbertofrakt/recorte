/**
 * Panel "Exibição" (owner D, requirements A4 and D7): what the drawing area
 * shows, and which skins are on.
 *
 * The panel holds no state of its own. Every checkbox reads and writes the one
 * settings store in `viewport/onion.ts`, and the skins go straight into the
 * document's `visibleSkins`. That is why the panel can be closed and reopened
 * without anything being lost, and why the viewport does not have to know that
 * a panel exists.
 *
 * WHERE THE SETTINGS ARE KEPT. In `RECORTE_editor_state`, the editor's own
 * extension inside the `.bone` file, under the key `view` — the same place the
 * camera and the selection live. A copy also goes into the browser's storage,
 * so a brand new document opens the way the last one looked. Saving keeps the
 * key now (PEDIDOS-FASE3B, pedido 10), so a file that carries settings opens
 * with them and the browser copy is only the fallback.
 *
 * FOR A DYSLEXIC READER. Two aligned columns, the written name on the left and
 * the control on the right, one idea per line, no abbreviation, nothing smaller
 * than 15px, and no icon without its word next to it.
 */

import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { readEditorState, registerPanel } from '../contract.js';
// Degrau 9: a pilha e o lapis moram na aba Peles; aqui fica o atalho.
import { skinOff, skinTabRows, stackAddOnTop, stackRemove } from './skins-model.js';
import { putSkinStack } from './skins-actions.js';
import { toggleViewGroup, viewGroupFolded, viewGroupHint } from './view-panel-actions.js';

/**
 * Um grupo da aba Exibição que DOBRA — rodada 17, I8. O título vira botão
 * (clique, Enter ou Espaço); dobrado, sobra o título com ▸. O estado mora em
 * `view-panel-actions.ts`, puro.
 */
function foldGroup(title: string): HTMLFieldSetElement {
  const box = group(title);
  const legend = box.querySelector('legend');
  const folded = viewGroupFolded(title);
  box.classList.toggle('is-dobrado', folded);
  if (legend !== null) {
    legend.textContent = `${folded ? '▸' : '▾'} ${title}`;
    legend.classList.add('prop-grupo-dobra');
    legend.tabIndex = 0;
    legend.setAttribute('role', 'button');
    legend.setAttribute('aria-expanded', String(!folded));
    legend.title = viewGroupHint(title, folded);
    const virar = (): void => {
      const agora = toggleViewGroup(title);
      box.classList.toggle('is-dobrado', agora);
      legend.textContent = `${agora ? '▸' : '▾'} ${title}`;
      legend.setAttribute('aria-expanded', String(!agora));
      legend.title = viewGroupHint(title, agora);
    };
    legend.addEventListener('click', virar);
    legend.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      virar();
    });
  }
  return box;
}
import {
  button, checkbox, clear, colorField, el, ensureStylesheet, group, numberField, row, stylesheetsPreloaded,
} from './dom.js';
import {
  DEFAULT_SKIN, loadStoredViewSettings, onViewSettings, resetViewSettings, setEditableSkin,
  setViewSettings, setVisibleSkins, skinChoices, storeViewSettings, toggleSkin, viewSettings,
  VIEW_STATE_KEY, readViewState, visibleSkinsOf, writeViewState,
  // Degrau 9: a pilha e o lápis, separados.
  editingSkinOf, setEditingSkin, skinStackOf,
  type ViewSettings,
  changeViewSettings,
} from '../viewport/onion.js';

// ---------------------------------------------------------------------------
// The list of checkboxes, written out once
// ---------------------------------------------------------------------------

/** One "show this" checkbox: the field it drives and the words next to it. */
export interface ShowRow {
  readonly key: 'bones' | 'boneNames' | 'boundingBoxes' | 'points' | 'meshes' | 'edges'
    | 'weights' | 'grid' | 'rulers' | 'axes' | 'drawings' | 'clippings';
  readonly label: string;
}

/** Every checkbox of the first group, in the order they are drawn. */
export const SHOW_ROWS: readonly ShowRow[] = Object.freeze([
  { key: 'drawings', label: 'Desenhos' },
  { key: 'bones', label: 'Ossos' },
  { key: 'boneNames', label: 'Nomes dos ossos' },
  { key: 'boundingBoxes', label: 'Caixas de colisão' },
  { key: 'points', label: 'Pontos' },
  { key: 'clippings', label: 'Máscaras' },
  { key: 'meshes', label: 'Malhas' },
  { key: 'edges', label: 'Arestas' },
  { key: 'weights', label: 'Pesos' },
  { key: 'grid', label: 'Grade' },
  // As réguas chegaram no lote 21 (v4.3) e ficaram SEM porta: o item
  // "Exibir → Réguas" existia no menu desde então, cinza, porque ninguém
  // registrou a ação, e não havia caixa nenhuma no painel. Ligadas para
  // sempre, sem jeito de desligar. É o mesmo defeito dos quatro itens de
  // Interpolação do lote 12 — achado ao fotografar o manual, lote 30.
  { key: 'rulers', label: 'Réguas' },
  { key: 'axes', label: 'Eixos' },
]);

/**
 * As guias — lote 42. Um grupo próprio, e não mais duas linhas no meio da
 * cena: uma guia não é um tipo de desenho nem uma coisa que a cena mostra
 * sozinha; é algo que se puxa da régua e se apaga.
 */
export const GUIDE_ROWS: ReadonlyArray<{ readonly key: 'showGuides' | 'lockGuides'; readonly label: string }> =
  Object.freeze([
    { key: 'showGuides', label: 'Guias' },
    { key: 'lockGuides', label: 'Travar guias' },
  ]);

/**
 * Uma linha da Exibição em três colunas — item 20.
 *
 * Um tipo por linha, três caixas: **ver · travar · nome**. É como o Spine faz,
 * e é o que transforma nove caixas soltas numa tabela que se lê de relance.
 *
 * `null` quer dizer que aquele tipo não tem aquela caixa, e a célula fica
 * VAZIA. Travar só existe para osso e para desenho — o cadeado é dos dois
 * grandes, e ponto, caixa e máscara vão junto com o desenho que os carrega.
 * Nome não existe para máscara nem para malha: a máscara é um contorno sem
 * nome próprio na cena, e o nome da malha é o do slot, que já tem caixa.
 * Caixa vazia é melhor que caixa morta.
 */
export interface TypeRow {
  readonly label: string;
  readonly show: keyof Omit<ViewSettings, 'onion'> | null;
  readonly lock: 'lockBones' | 'lockDrawings' | null;
  readonly name: keyof Omit<ViewSettings, 'onion'> | null;
}

/** Os seis tipos, na ordem em que se olha para eles. */
export const TYPE_ROWS: readonly TypeRow[] = Object.freeze([
  { label: 'Ossos', show: 'bones', lock: 'lockBones', name: 'boneNames' },
  { label: 'Desenhos', show: 'drawings', lock: 'lockDrawings', name: 'slotNames' },
  { label: 'Pontos', show: 'points', lock: null, name: 'pointNames' },
  { label: 'Caixas', show: 'boundingBoxes', lock: null, name: 'boxNames' },
  { label: 'Máscaras', show: 'clippings', lock: null, name: null },
  { label: 'Malhas', show: 'meshes', lock: null, name: null },
]);

/** O que sobrou de solto: coisas da cena que não são um tipo de desenho. */
export const SCENE_ROWS: readonly ShowRow[] = Object.freeze([
  { key: 'edges', label: 'Arestas' },
  { key: 'weights', label: 'Pesos' },
  { key: 'grid', label: 'Grade' },
  { key: 'rulers', label: 'Réguas' },
  { key: 'axes', label: 'Eixos' },
]);

/** One number of the onion skin, with the range the panel accepts. */
export interface OnionRow {
  readonly key: 'before' | 'after' | 'step' | 'opacity' | 'offsetX' | 'offsetY';
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** Rodada 47, lote 5 (nota 2 do doc 85): a unidade depois da caixa, a escala da tela e a dica. */
  readonly unit?: string;
  readonly scale?: number;
  readonly hint: string;
}

/** The onion skin numbers, in the order they are drawn. */
export const ONION_ROWS: readonly OnionRow[] = Object.freeze([
  { key: 'before', label: 'Quadros antes', min: 0, max: 20, step: 1, hint: 'Quadros antes: quantos fantasmas de antes, de 0 a 20' },
  { key: 'after', label: 'Quadros depois', min: 0, max: 20, step: 1, hint: 'Quadros depois: quantos fantasmas de depois, de 0 a 20' },
  { key: 'step', label: 'Passo', unit: 's', min: 0.01, max: 2, step: 0.01, hint: 'Passo, em s, de 0,01 a 2: a distância no tempo entre um fantasma e o outro' },
  // 1 é o fantasma bem visível e 0 é o fantasma apagado. "Quanto aparece" diz
  // isso sem que o leitor tenha de inverter "transparência" na cabeça.
  // Rodada 47, lote 5 (nota 2 do doc 85): de 0 a 1 no arquivo, de 0 a 100 % na tela.
  { key: 'opacity', label: 'Quanto aparece', unit: '%', scale: 100, min: 0, max: 1, step: 0.05, hint: 'Quanto aparece, em %, de 0 a 100: 0 o fantasma some, 100 bem visível' },
  { key: 'offsetX', label: 'Para o lado', unit: 'px', min: -2000, max: 2000, step: 1, hint: 'Deslocar para o lado, em px, de −2000 a 2000: compara uma passada com a outra e mostra o pé escorregando' },
  { key: 'offsetY', label: 'Para cima', unit: 'px', min: -2000, max: 2000, step: 1, hint: 'Deslocar para cima, em px, de −2000 a 2000' },
]);

// ---------------------------------------------------------------------------
// Small builders
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// The panel
// ---------------------------------------------------------------------------

class ViewPanel implements Panel {
  readonly id = 'exibicao';
  readonly title = 'Exibição';
  readonly listensTo = ['file', 'structure'] as const;

  private doc: EditorDoc | null = null;
  private body: HTMLElement | null = null;
  private stopListening: (() => void) | null = null;

  mount(doc: EditorDoc, host: HTMLElement): void {
    ensureStylesheet();
    ensureViewStylesheet();
    this.doc = doc;
    clear(host);
    host.classList.add('painel');

    // The document wins over the browser: a file that carries settings was
    // saved by someone who chose them on purpose. The browser copy is the
    // fallback, for a file that carries none.
    setViewSettings(this.settingsForDocument(doc));

    // `exibicao-barra` aperta a faixa do botão (10px de sobra em cima e
    // embaixo, de `panels.css`) — prova de altura, 13/09/2026.
    const bar = el('div', 'painel-barra exibicao-barra');
    const voltar = button('Voltar ao padrão', () => {
      resetViewSettings();
      this.persist();
      this.render();
    });
    voltar.classList.add('exibicao-botao-padrao');
    // Rodada 47, lote 4 (R5): todo botão diz na dica o que faz.
    voltar.title = 'Voltar ao padrão: mostra de novo ossos, desenhos, grade e réguas como o programa abre. Não mexe no arquivo';
    voltar.setAttribute('aria-label', voltar.title);
    bar.append(voltar);

    // `exibicao-corpo` aperta o preenchimento de baixo de `.painel-corpo`
    // (16px, pensado para uma lista) — prova de altura, 13/09/2026.
    const body = el('div', 'painel-corpo exibicao-corpo');
    this.body = body;
    host.append(bar, body);

    // Another surface (a menu, a shortcut) may change the same store.
    this.stopListening = onViewSettings(() => this.render());
    this.render();
  }

  /*
   * As ações do menu Exibir (ver, travar, cebola, esconder o escolhido…)
   * saíram daqui em 29/09/2026 — I3, chat I, decisão P23. Nasciam no
   * `mount()`, e fechar esta aba deixava o botão "Ver ossos" do alto e o menu
   * inteiro sem ação, calados. Moram em `view-panel-actions.ts`, desde o
   * arranque; este painel só desenha as caixas, e se redesenha quando o menu
   * escreve, porque ouve `onViewSettings`.
   */

  refresh(_change: DocChange): void {
    this.render();
  }

  unmount(): void {
    this.stopListening?.();
    this.stopListening = null;
    this.doc = null;
    this.body = null;
  }

  // -------------------------------------------------------------------------
  // Writing a setting
  // -------------------------------------------------------------------------

  /**
   * Saves the settings and asks the drawing area for a new frame.
   *
   * `repose()` is the redraw: the viewport listens to the document and not to
   * this store, so a `transform` change is the only door there is until owner B
   * subscribes — `PEDIDOS-FASE3B.md`, pedido 7.
   */
  private persist(): void {
    const settings = viewSettings() as ViewSettings;
    storeViewSettings(settings);
    const doc = this.doc;
    if (doc === null) return;
    writeViewState(doc.file, settings);
  }

  /**
   * What this document should be shown with: its own saved settings when it
   * carries any, and the ones the browser remembers otherwise.
   */
  private settingsForDocument(doc: EditorDoc): ViewSettings {
    const state = readEditorState(doc.file) as Record<string, unknown>;
    if (state[VIEW_STATE_KEY] !== undefined) return readViewState(doc.file);
    return loadStoredViewSettings();
  }

  private change(patch: Partial<Omit<ViewSettings, 'onion'>>): void {
    // `changeViewSettings` stores, writes into the file and drops what was
    // just locked from the selection. Then the viewport is asked to redraw.
    changeViewSettings(patch, this.doc);
    this.persist();
  }

  // -------------------------------------------------------------------------
  // Drawing the panel
  // -------------------------------------------------------------------------

  private render(): void {
    const body = this.body;
    if (body === null) return;
    // The panel is rebuilt whenever a setting changes, and the list is long.
    // Without this, ticking a box near the bottom threw the panel back to the
    // top and the next click landed on the wrong line.
    const scroller = this.scroller();
    const scrollTop = scroller?.scrollTop ?? 0;
    clear(body);
    // A casca de cebola saiu daqui no lote 12 (item 28): ela mora na RÉGUA da
    // linha do tempo, que é onde se olha ao ligar e desligar fantasma. Ficar
    // dobrada no fim de um painel da coluna era ficar fora de alcance.
    // O grupo **Peles** saiu daqui no lote 27 — anotação 12. Ele era o terceiro
    // lugar onde a pele morava, e o pior dos três: quem procura "onde ligo a
    // armadura" não procura no painel da grade, dos eixos e da cebola. As duas
    // caixas viraram o olho e o lápis da aba Peles.
    body.append(this.typeGroup(), this.sceneGroup());
    if (scroller !== null && scrollTop > 0) scroller.scrollTop = scrollTop;
  }

  /**
   * The box that actually scrolls: the panel's own body, or the frame the shell
   * wraps it in. Asked, never guessed, because the stylesheet decides.
   */
  private scroller(): HTMLElement | null {
    const body = this.body;
    if (body === null) return null;
    if (body.scrollHeight > body.clientHeight) return body;
    const host = body.parentElement;
    if (host !== null && host.scrollHeight > host.clientHeight) return host;
    return body;
  }

  /**
   * A tabela de três colunas: ver · travar · nome — item 20.
   *
   * Nove caixas soltas viraram seis linhas com três colunas. A diferença é de
   * leitura: com a tabela, "o que está ligado para os pontos?" é uma linha, e
   * não uma caçada por nomes parecidos no meio de uma lista.
   *
   * O cabeçalho das colunas fica em cima, e cada caixa carrega no `title` a
   * frase inteira ("Ver pontos", "Travar ossos") — um quadradinho numa grade
   * sem nome ao lado não diz o que ele é.
   */
  private typeGroup(): HTMLElement {
    const settings = viewSettings();
    const box = foldGroup('Mostrar na tela');
    const grid = el('div', 'exibicao-grade');
    grid.append(
      el('span', 'exibicao-grade-canto', ''),
      el('span', 'exibicao-grade-cabeca', 'Ver'),
      el('span', 'exibicao-grade-cabeca', 'Travar'),
      el('span', 'exibicao-grade-cabeca', 'Nome'),
    );
    for (const item of TYPE_ROWS) {
      grid.append(el('span', 'exibicao-grade-nome', item.label));
      for (const [coluna, key] of [
        ['Ver', item.show], ['Travar', item.lock], ['Nome', item.name],
      ] as const) {
        if (key === null) {
          // Célula vazia, e não caixa cinza: um quadradinho que nunca acende é
          // um quadradinho que se aprende a ignorar.
          grid.append(el('span', 'exibicao-grade-vazio', ''));
          continue;
        }
        const marca = checkbox(settings[key] === true, (on) => {
          this.change({ [key]: on } as Partial<ViewSettings>);
        });
        // A tecla vai na dica — prova de altura, 13/09/2026: o grupo "Travar"
        // de baixo, que só repetia estas duas caixas, saiu do painel; a tecla
        // que ele carregava (8, 0) tinha de morar em algum lugar que se lê
        // sem abrir o código, e aqui é onde a caixa já está.
        const tecla = key === 'lockBones' ? ' (8)' : key === 'lockDrawings' ? ' (0)' : '';
        const frase = `${coluna} ${item.label.toLowerCase()}${tecla}`;
        marca.title = frase;
        marca.setAttribute('aria-label', frase);
        grid.append(marca);
      }
    }
    box.append(grid);
    return box;
  }

  /**
   * **A cena**: tudo o que não é um tipo de desenho, numa grade de duas
   * colunas — prova de altura, 13/09/2026. Juntou o que antes eram três
   * grupos (A cena, Guias, Travar): cada `<fieldset>` cobra a mesma borda e a
   * mesma legenda esteja ele cheio ou com duas caixas, e três cobranças
   * dessas era a metade do painel. "Travar ossos/desenhos" saiu de vez — é a
   * MESMA caixa da coluna Travar, ali em cima; duas caixas para a mesma coisa
   * não são duas informações, são a mesma pergunta feita duas vezes.
   *
   * A explicação de como se usa a guia virou dica do quadradinho, em vez de
   * uma linha que aparece sempre, com arquivo nenhum aberto.
   */
  private sceneGroup(): HTMLElement {
    const settings = viewSettings();
    const box = foldGroup('A cena');
    const grid = el('div', 'exibicao-pares');
    const itens: Array<{ label: string; checked: boolean; hint?: string; onChange: (on: boolean) => void }> = [
      ...SCENE_ROWS.map((item) => ({
        label: item.label,
        checked: settings[item.key] === true,
        onChange: (on: boolean) => this.change({ [item.key]: on } as Partial<ViewSettings>),
      })),
      {
        label: 'Guias', checked: settings.showGuides,
        hint: 'Arraste a partir de uma régua para criar uma guia. O Mover imanta nela.',
        onChange: (on: boolean) => this.change({ showGuides: on }),
      },
      {
        label: 'Travar guias', checked: settings.lockGuides,
        hint: 'Guia travada não se arrasta, só se apaga.',
        onChange: (on: boolean) => this.change({ lockGuides: on }),
      },
    ];
    for (const item of itens) {
      const linha = el('label', 'exibicao-par');
      linha.title = item.hint ?? item.label;
      const marca = checkbox(item.checked, item.onChange);
      marca.setAttribute('aria-label', item.label);
      linha.append(marca, el('span', 'exibicao-par-nome', item.label));
      grid.append(linha);
    }
    box.append(grid);
    // Rodada 47, lote 5b (notas do doc 86), nota 4: a cor do fundo diz o que é.
    const fundo = row('Cor do fundo', colorField(settings.background, (value) => {
      this.change({ background: value });
    }));
    fundo.title = 'Cor do fundo: a cor atrás do boneco na cena. Só no editor; não vai para o arquivo exportado';
    box.append(fundo);
    // Quantas guias há: só aparece quando há alguma. Sem guia, a dica do
    // quadradinho "Guias" já conta como se faz uma.
    const quantas = settings.guides.length;
    if (quantas > 0) {
      box.append(el('p', 'exibicao-ajuda',
        `${quantas} ${quantas === 1 ? 'guia' : 'guias'}. Exibir → A cena → Limpar guias apaga todas.`));
    }
    return box;
  }

  private skinGroup(): HTMLElement {
    const box = foldGroup('Skins');
    const doc = this.doc;
    if (doc === null) return box;
    // Degrau 9 (18/09/2026): a pilha mora na aba **Peles**, em duas colunas.
    // Aqui fica o atalho: a mesma pilha, uma marca por pele, para quem já está
    // com o Exibição aberto. A `default` tem marca como as outras — ela pode
    // sair da pilha (I10), e um quadradinho apagado dizendo "sempre embaixo"
    // passou a ser mentira no dia em que ela deixou de estar.
    const stack = skinStackOf(doc);
    const lapis = editingSkinOf(doc);
    const choices = skinTabRows(doc.file, stack, lapis);
    if (choices.length === 0) {
      box.append(el('p', 'exibicao-ajuda', 'Este esqueleto não tem skins.'));
      return box;
    }

    const list = el('ul', 'exibicao-peles');
    for (const choice of choices) {
      const item = el('li', 'exibicao-pele');
      if (choice.editable) item.classList.add('is-editavel');

      const name = el('span', 'exibicao-pele-nome', choice.name);
      // O nome completo fica no `title` mesmo quando a linha cabe: um nome de
      // pele é o que o usuário precisa ler inteiro para saber o que está
      // ligando, e ele não deve depender da largura da janela.
      name.title = choice.name;
      const show = checkbox(choice.visible, (on) => {
        // Rodada 17: a mesma pilha da aba Skins, e o mesmo passo do Desfazer.
        putSkinStack(doc, on ? stackAddOnTop(stack, choice.name) : stackRemove(stack, choice.name),
          `${on ? 'Ligar' : 'Desligar'} a skin "${choice.name}"`);
        if (!on) doc.notice(skinOff(doc.file, choice.name, stack));
        this.render();
      });
      const showLabel = el('label', 'exibicao-pele-marca');
      showLabel.append(show, el('span', undefined, 'Mostrar'));

      const edit = button(
        choice.editable ? 'Editando aqui' : 'Editar aqui',
        () => {
          setEditingSkin(doc, choice.name);
          this.render();
        },
      );
      edit.disabled = choice.editable;
      // Rodada 47, lote 4 (R5): a dica diz o que o botão faz, e por que está apagado.
      edit.title = choice.editable
        ? `Editando aqui: o que você mexer agora vai para a skin "${choice.name}"`
        : `Editar aqui: o que você mexer a seguir vai para a skin "${choice.name}"`;
      edit.setAttribute('aria-label', edit.title);

      item.append(name, showLabel, edit);
      list.append(item);
    }
    box.append(list);
    box.append(el('p', 'exibicao-ajuda',
      `A última ligada fica por cima e cobre as de baixo — inclusive a "${DEFAULT_SKIN}", `
      + 'que é uma skin como as outras. A ordem se arrasta na aba Skins.'));
    return box;
  }
}

// ---------------------------------------------------------------------------
// Stylesheet
// ---------------------------------------------------------------------------

let styleLinked = false;

/** Links `view-panel.css` once, the same way `dom.ts` links `panels.css`. */
export function ensureViewStylesheet(): void {
  if (stylesheetsPreloaded() || styleLinked || typeof document === 'undefined') return;
  styleLinked = true;
  const href = new URL('./view-panel.css', import.meta.url).href;
  if (document.head.querySelector(`link[href="${href}"]`) !== null) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export const viewPanel: Panel = new ViewPanel();
registerPanel(viewPanel);
