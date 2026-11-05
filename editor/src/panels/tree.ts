/**
 * Panel "Árvore": the structure of the skeleton.
 *
 * Lote 64: one tree, like the Hierarchy of Spriter. Each bone holds its
 * drawings first (one row per slot, with the thumbnail of the editing skin),
 * then its child bones. Clicking selects; dragging onto a bone changes the
 * parent without moving; dragging to the empty end sets it free (root).
 * Double click renames. The draw order lives in the Ordem tab.
 */

import type { Panel, DocChange, EditorDoc, Selection } from '../contract.js';
import { emptySelection, registerPanel, corpoDe } from '../contract.js';
import { appliedParents, appliedSlotBones, reparentExtra, runReparent } from '../doc/reparent.js';
import type { ParentMap } from '../doc/bones.js';
import { isDescendantBone } from '../doc/bones.js';
import { Duplicate } from '../doc/duplicate.js';
import { clear, el, ensureStylesheet, iconButton } from './dom.js';
import {
  currentLocks, isBoneHidden, isSlotHidden, onViewSettings, setBoneHidden, setBoneLocked,
  setSlotHidden, setSlotLocked, setSkinGoneBones, skinStackOf,
} from '../viewport/onion.js';
import { bonesGone } from '../doc/skin-bones.js';
import { AddAttachmentToSlot, AddConstraint, MoveSlot, RenameItem, CONSTRAINT_TYPES, canDeleteSelection, foldKey, hierarchyDropAction, hierarchyRows, parseFolded, searchHierarchy, selectionForRow, unfoldedRows, type RenameTarget, type TreeRow } from './tree-model.js';
// Degrau 9 (I5): o sinal da pele na linha do osso.
import { skinOnlyHint, treeIndent } from './tree-rows.js';
import {
  branchFoldIds, emptyNameSays, matchesSearch, rangeSelection, renameSays, stepRow,
  toggleRowInSelection,
} from './tree-rows.js';
// Lote 1 do chat D (28/09): o grupo do fim, com os eventos e os parâmetros.
import { EVENTS_GROUP_ID, eventParameterRows, eyeNotice, foldable, lockNotice, newKeyItemRow, selectionKey, treeReveal } from './tree-rows.js';
import { DeleteParameter } from './tree-commands.js';
import { chooseEvent, currentEventChoice, focusEvent } from './event-key-editor.js';
import { registerAction, runAction } from '../ui/actions.js';
import { actionsFor, isTyping, keyOf } from '../ui/keys.js';
import { addBone, addEvent, addParameter, askDelete, deleteSelected } from './tree-actions.js';
import { selectTool } from '../viewport/tools/select.js';
import { chosenNotice, handPickedBones } from '../viewport/tools/creation-words.js';
import { getActiveToolId } from '../viewport/tools/registry.js';
import { MESH_TOOLS, bindModeClick } from './mesh-panel-model.js';
import { THUMB_SIZE, forgetThumbnails, thumbnailNode } from './thumbnails.js';
import { paintIcon } from '../ui/icons.js';
import { bonesWithRules } from './rules-model.js';
import {
  DRAG_TYPE, SwapSlotImage, attachmentNameFor, imageOnSlotDef, skinForNew,
} from './palette-model.js';
import { closeFloatingMenu, openFloatingMenu } from '../ui/floating-menu.js';
import type { FloatingItem } from '../ui/floating-menu.js';
import { ensureProvisional } from '../io/folder-atlas.js';
import { swapCommandFor } from './image-picker-model.js';

/**
 * O botão Apagar, marcado para o render achar sem contar posições.
 *
 * A barra tem sete controles agora; procurar o terceiro botão por índice era
 * um jeito de o botão errado ser desligado no dia em que a barra mudasse.
 */
function apagarButton(onClick: () => void): HTMLButtonElement {
  // Lixeira desde o lote 19. A palavra continua no `title` e no `aria-label`.
  const node = iconButton('trash', 'Apagar', onClick);
  node.dataset['acao'] = 'apagar';
  // Rodada 43, lote 4: a dica inteira (era só "Apagar").
  node.title = 'Apagar o escolhido (Delete). O osso leva os de baixo e os desenhos deles, e pergunta antes. Ctrl+Z volta';
  node.setAttribute('aria-label', node.title);
  return node;
}

const CLOSED_ARROW = '▶';
const OPEN_ARROW = '▼';

/** O `localStorage`, quando existe. Aba anônima e teste podem não ter. */
function foldStore(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

class TreePanel implements Panel {
  readonly id = 'arvore';
  readonly title = 'Árvore';
  /**
   * `time` entrou no lote 1 de 14/09: com uma chave `parent` (§9.4), a
   * hierarquia do quadro muda com o tempo, e a Árvore tem que andar junto —
   * no quadro 12 a arma está nas costas. Sem isso, ela mostrava a árvore do
   * instante em que foi desenhada pela última vez, em todos os outros.
   */
  // `transform` só para ver a pilha de peles mudar (rodada 12, S8): vestir e
  // tirar uma skin não é mudança do arquivo, e só chega como uma repose.
  readonly listensTo = ['file', 'structure', 'selection', 'assets', 'time', 'transform'] as const;
  /** A pilha e o lápis do último desenho, para o `transform` saber se mudaram. */
  private drawnStack = '';

  private doc: EditorDoc | null = null;
  private body: HTMLElement | null = null;
  private toolbar: HTMLElement | null = null;
  /** Os ossos dobrados deste arquivo — lote 64. Moram no navegador, por arquivo. */
  private readonly closed = new Set<string>();
  /** A chave do `localStorage` de onde `closed` veio. Outro arquivo, outra dobra. */
  private foldKeyNow: string | null = null;
  /** Onde a tecla P é ouvida quando o foco está na Árvore — lote 64. */
  private keyHost: HTMLElement | null = null;
  /** A lista do **Novo ▾** e o botão dela — lote 19. */
  private newList: HTMLElement | null = null;
  private newButton: HTMLButtonElement | null = null;
  private renaming: string | null = null;
  /** A busca está aberta? — anotação 22, lote 33. */
  private searching = false;
  /** O que está escrito na busca. Vazio mostra a árvore inteira. */
  private filter = '';
  /** O menu do botão direito, quando aberto — anotação 15. */
  /** A lista de tipos ao lado do botão "Nova regra". */
  private rulePick: HTMLSelectElement | null = null;
  private dragged: TreeRow | null = null;
  /** Rodada 43, lote 3: a última linha clicada sem Shift — a ponta fixa da faixa do Shift. */
  private anchor: string | null = null;
  /** Rodada 43, lote 4 (doc 62, c): a linha onde o usuário está — de onde as setas partem. */
  private cursor: string | null = null;
  /** Rodada 43, lote 4 (doc 62, a): a peça renomeada que fica à vista na busca. */
  private keepShown = new Set<string>();
  /** Rodada 43, lote 3: as linhas que a tela mostra agora, na ordem dela. */
  private visible: TreeRow[] = [];
  /** Rodada 43, lote 3: o próximo desenho devolve o foco à linha escolhida. */
  private keepFocus = false;
  /** Rodada 43, lote 3: o recado do arrasto de desenho sobre desenho, uma vez por arrasto. */
  private avisouOrdem = false;
  private stopViewListening: (() => void) | null = null;
  /** O que desfazer no registro de ações quando o painel for desmontado. */
  private forgetActions: Array<() => void> = [];

  /**
   * P segurado com o foco na Árvore — lote 64: o mesmo gesto da cena. A tecla
   * é tratada uma vez: quem trata para a propagação. Campo de texto passa reto.
   */
  private readonly gestureKey = (event: KeyboardEvent): void => {
    // QA da noite (04/11/2026): o Espaço toca, como em toda parte (lote 68) —
    // a linha é um botão, e ele a "apertava" de novo. Na descida E na subida:
    // o botão se aperta na subida.
    if (!isTyping(event.target) && actionsFor('arvore', keyOf(event)).includes('tocar')) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type === 'keydown' && !event.repeat) runAction('tocar');
      return;
    }
    // Rodada 43, lote 3: as setas, da mesma tabela (`ui/keys.ts`, escopo `arvore`).
    if (event.type === 'keydown' && this.arrowKey(event)) return;
    // A tecla vem da tabela (`ui/keys.ts`, escopo `arvore`): P, com ou sem
    // Shift; com Ctrl ou Alt, não.
    if (!actionsFor('arvore', keyOf(event)).includes('local:pegar-filhos')) return;
    if (isTyping(event.target)) return;
    const doc = this.doc;
    if (doc === null) return;
    const tratou = event.type === 'keydown'
      ? selectTool.onKey(doc, event.key)
      : selectTool.onKeyUp(doc, event.key);
    if (tratou) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /**
   * **As setas na Árvore** — rodada 43, lote 3 (doc `51`, §2.1). ↑ e ↓ andam
   * pelas linhas que se veem; ← dobra o osso aberto, ou sobe ao pai; → abre o
   * dobrado. O foco fica na linha (`keepFocus`). `true` = tratada (regra 12).
   */
  private arrowKey(event: KeyboardEvent): boolean {
    if (isTyping(event.target)) return false;
    const acoes = actionsFor('arvore', keyOf(event));
    const acao = acoes.find((a) => a.startsWith('local:arvore-'));
    const doc = this.doc;
    if (acao === undefined || doc === null) return false;
    event.preventDefault();
    event.stopPropagation();
    // Doc 62 (c): as setas partem da linha onde se está (a do Shift+clique
    // também), e não da ponta fixa da faixa.
    const onde = this.cursor ?? this.anchor;
    const atual = onde !== null && this.visible.some((r) => r.id === onde)
      ? onde : this.visible.find((r) => this.isSelected(r))?.id ?? null;
    if (acao === 'local:arvore-sobe' || acao === 'local:arvore-desce') {
      const proxima = stepRow(this.visible, atual, acao === 'local:arvore-desce' ? 1 : -1);
      if (proxima === null) return true;
      this.anchor = this.cursor = proxima.id;
      this.keepFocus = true;
      doc.select(selectionForRow(proxima));
      return true;
    }
    const row = this.visible.find((r) => r.id === atual);
    if (row === undefined) return true;
    const dobrado = this.foldState().has(row.id);
    if (acao === 'local:arvore-dobra') {
      if (foldable(row) && !dobrado) { this.keepFocus = true; this.toggleFold(row); return true; }
      const pai = row.owner === undefined ? undefined : this.visible.find((r) => r.id === row.owner);
      if (pai !== undefined) { this.anchor = this.cursor = pai.id; this.keepFocus = true; doc.select(selectionForRow(pai)); }
      return true;
    }
    if (foldable(row) && dobrado) { this.keepFocus = true; this.toggleFold(row); }
    return true;
  }

  mount(doc: EditorDoc, host: HTMLElement): void {
    ensureStylesheet();
    this.doc = doc;
    clear(host);
    host.classList.add('painel');

    // "Novo:" uma vez, e depois só o substantivo. Com a palavra repetida em
    // seis botões a barra ia a quatro linhas e comia a lista de ossos — que é
    // justamente a lista que mais se lê no painel. O nome inteiro fica no
    // `aria-label` e no `title`, para o botão continuar se explicando sozinho.
    /*
     * O cabeçalho virou UMA linha de ícones — lote 19, rodada 3.
     *
     * Eram oito botões de palavra em três linhas, e as três linhas empurravam
     * o título "Ossos 18" para fora da vista: é o terceiro defeito da tela que
     * o Humberto mandou ("— o … 18"). Agora são três botões: **Novo ▾**, que
     * abre a lista das seis coisas que se criam, **Apagar** e **Buscar**.
     *
     * Nada some: cada uma das seis continua no menu Esqueleto, com a tecla ao
     * lado, e a lista do Novo é o MESMO `menu-list` do `shell.ts` — nada de um
     * segundo componente de menu no programa.
     */
    const toolbar = el('div', 'painel-barra arvore-barra');
    toolbar.append(
      this.newMenuButton(),
      this.duplicarButton(),
      apagarButton(() => this.withDoc((d) => deleteSelected(d, askDelete))),
      this.searchButton(),
    );
    this.toolbar = toolbar;

    const body = el('div', 'painel-corpo');
    // A lista cresce com o arquivo, e por isso pode rolar: a prova
    // `medir-paineis.mjs` lê esta marca e deixa esta caixa em paz.
    body.dataset.rolagem = 'lista';
    this.body = body;
    host.append(toolbar, body);
    this.keyHost?.removeEventListener('keydown', this.gestureKey);
    this.keyHost?.removeEventListener('keyup', this.gestureKey);
    host.addEventListener('keydown', this.gestureKey);
    host.addEventListener('keyup', this.gestureKey);
    this.keyHost = host;
    // The padlocks live in the display settings, which the keyboard and the
    // toolbar also change: the tree must follow them, not only the document.
    this.stopViewListening = onViewSettings(() => this.render());
    this.registerActions();
    this.render();
  }

  /**
   * As ações de menu que só este painel faz: Buscar e Renomear, que abrem um
   * campo DESTE painel, e as cinco regras "adivinhando" (testes e importação).
   *
   * Criar, apagar e duplicar moram em `tree-actions.ts` desde o lote A2, e o
   * botão da barra chama a MESMA função que o menu.
   */
  private registerActions(): void {
    for (const forget of this.forgetActions) forget();
    this.forgetActions = [
      // Buscar na Árvore (Ctrl+F) — anotação 22, lote 33. A porta do menu e o
      // botão do cabeçalho são a mesma coisa: abrem o campo e põem o foco nele.
      registerAction('buscar', { run: () => this.toggleSearch() }),
      // Lote A2: duplicar, novo osso, slot, evento, parâmetro, ponto, caixa,
      // máscara e apagar moram em `tree-actions.ts`, registradas no arranque:
      // valem com a Árvore fechada. Os botões daqui chamam as mesmas funções.
      // 'nova-pele' mora em `skins-actions.ts` (a pele é da aba Peles).
      ...CONSTRAINT_TYPES.map((type) => registerAction(`nova-regra-${type}`, {
        run: () => this.addConstraint(type),
      })),
      registerAction('renomear', {
        run: () => this.startRename(),
        enabled: () => this.renameableRow() !== null,
      }),
    ];
  }

  refresh(change: DocChange): void {
    // Atlas novo: as miniaturas guardadas são de outra imagem.
    if (change.kind === 'assets' || change.kind === 'file') forgetThumbnails();
    // Arquivo novo: as linhas de antes não servem para dizer o que "nasceu".
    if (change.kind === 'file') this.lastIds = null;
    // Andar no tempo só redesenha quando há chave de pai para mudar a árvore:
    // arrastar o cursor da linha do tempo não pode redesenhar a Árvore inteira
    // quadro a quadro à toa.
    if (change.kind === 'time' && !this.hierarchyIsKeyed()) return;
    // Rodada 12 (S8): de uma repose, só interessa a pilha de peles. Mover um
    // osso não redesenha a Árvore; tirar a skin, sim.
    if (change.kind === 'transform') {
      const doc = this.doc;
      if (doc === null || this.stackKey(doc) === this.drawnStack) return;
    }
    this.render();
  }

  /** A pilha de peles e o lápis, numa linha: o que muda a Árvore sem mudar o arquivo. */
  private stackKey(doc: EditorDoc): string {
    return JSON.stringify([skinStackOf(doc), doc.visibleSkins]);
  }

  /** A animação aberta tem alguma chave `parent`? — §9.4. */
  private hierarchyIsKeyed(): boolean {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return false;
    const animation = (doc.file.animations ?? []).find((a) => a.name === doc.animation);
    return (animation?.timelines ?? []).some((line) => {
      const t = line as unknown as { type?: string; property?: string };
      // Degrau 4b: a virada de corpo (9.13) também muda a árvore: o rabo nasce.
      return (t.type === 'bone' && t.property === 'parent') || t.type === 'body';
    });
  }

  unmount(): void {
    for (const forget of this.forgetActions) forget();
    this.forgetActions = [];
    this.closeRowMenu();
    this.stopViewListening?.();
    this.stopViewListening = null;
    this.keyHost?.removeEventListener('keydown', this.gestureKey);
    this.keyHost?.removeEventListener('keyup', this.gestureKey);
    this.keyHost = null;
    this.doc = null;
    this.body = null;
    this.toolbar = null;
  }

  // -------------------------------------------------------------------------
  // Buttons
  // -------------------------------------------------------------------------

  /**
   * Roda uma função de `tree-actions.ts` com o documento deste painel — lote
   * A2. O botão e o menu chamam a MESMA função.
   */
  private withDoc(act: (doc: EditorDoc) => void): void {
    if (this.doc) act(this.doc);
  }

  /**
   * "Nova regra" com a escolha do tipo ao lado.
   *
   * Antes disso não havia nenhum comando para criar regra: dava para editar e
   * apagar as que vinham no arquivo, e um personagem novo nunca ganhava cadeia
   * de IK nem física de cabelo. A escolha é uma lista escrita, não um menu
   * escondido, para os cinco tipos ficarem visíveis de uma vez.
   */
  /**
   * **Novo ▾**: um botão, e a lista do que se pode criar.
   *
   * Seis entradas, e as regras num submenu — cinco tipos de regra caberiam na
   * lista, mas seriam cinco linhas parecidas no meio de seis diferentes.
   */
  private newMenuButton(): HTMLElement {
    const holder = el('span', 'arvore-novo');

    const botao = el('button', 'painel-botao painel-botao-icone arvore-novo-botao');
    (botao as HTMLButtonElement).type = 'button';
    const mais = el('span', 'painel-botao-icone');
    if (!paintIcon(mais, 'plus', 18)) mais.textContent = '+';
    const seta = el('span', 'painel-botao-seta');
    if (!paintIcon(seta, 'chevron-down', 14)) seta.textContent = '▾';
    botao.append(mais, el('span', 'painel-botao-nome', 'Novo'), seta);
    botao.title = 'Novo: osso, regra, evento, skin, parâmetro ou emissor de partículas';
    botao.setAttribute('aria-label', botao.title);
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-haspopup', 'menu');

    const lista = el('ul', 'menu-list arvore-novo-lista');
    lista.setAttribute('role', 'menu');
    lista.hidden = true;
    for (const entrada of this.newMenuEntries()) lista.append(entrada);

    botao.addEventListener('click', () => {
      const abrir = lista.hidden;
      lista.hidden = !abrir;
      botao.setAttribute('aria-expanded', String(abrir));
    });
    document.addEventListener('pointerdown', (event) => {
      if (lista.hidden || holder.contains(event.target as Node)) return;
      lista.hidden = true;
      botao.setAttribute('aria-expanded', 'false');
    });

    this.newList = lista;
    this.newButton = botao as HTMLButtonElement;
    holder.append(botao, lista);
    return holder;
  }

  /** As seis linhas do **Novo ▾**, na ordem em que se usam. */
  private newMenuEntries(): HTMLElement[] {
    const linha = (nome: string, rodar: () => void): HTMLElement => {
      const item = el('li', 'menu-row');
      const botao = el('button', 'menu-item', nome);
      (botao as HTMLButtonElement).type = 'button';
      botao.setAttribute('role', 'menuitem');
      botao.addEventListener('click', () => {
        this.closeNewMenu();
        rodar();
      });
      item.append(botao);
      return item;
    };

    return [
      linha('Osso', () => this.withDoc(addBone)),
      // "Slot" saiu em 13/09/2026, aqui e no menu Esqueleto: era a única porta
      // que criava um gancho vazio. Desenho entra pelo painel Imagens.
      // **Regra…** abre a janela guiada da aba Regras — anotação 15, item k.
      // Eram cinco linhas, uma por tipo, e cada uma criava adivinhando: um
      // osso só e um alvo qualquer. Uma porta, e ela pergunta.
      linha('Regra…', () => { runAction('nova-regra-guiada'); }),
      linha('Evento', () => this.withDoc(addEvent)),
      // Aponta para a **aba Peles**, que é onde a pele mora desde o lote 27.
      linha('Skin', () => { runAction('nova-pele'); }),
      linha('Parâmetro', () => this.withDoc(addParameter)),
      // Extensão `BONE_particles`: o motor estava pronto dos dois lados e esta
      // linha não existia — 🗣️ *"o carro sem o volante"*. Pela ação, e não
      // chamando a função direto, para o id ter UM dono (regra 17).
      linha('Emissor de partículas', () => { runAction('novo-emissor'); }),
    ];
  }

  /** Fecha a lista do Novo, venha o clique de onde vier. */
  private closeNewMenu(): void {
    if (this.newList === null) return;
    this.newList.hidden = true;
    this.newButton?.setAttribute('aria-expanded', 'false');
  }

  /**
   * **Buscar**: a lupa que abre a caixa de filtro da Árvore.
   *
   * A caixa em si é do projeto do menu (`Ctrl+F`) e ainda não existe; o botão
   * já existe e diz isso em voz alta em vez de não estar lá. Um botão que
   * explica por que não faz nada ensina mais que um botão ausente.
   */
  /**
   * Duplicar — anotação 26, lote 37. Ao lado do Apagar, que é o vizinho de
   * sentido: os dois mexem no que está escolhido.
   */
  private duplicarButton(): HTMLButtonElement {
    const node = iconButton('duplicate', 'Duplicar', () => runAction('duplicar'));
    node.dataset['acao'] = 'duplicar';
    node.title = 'Duplicar (Ctrl+D): o osso vem com os filhos e os desenhos, 20 px à direita';
    node.setAttribute('aria-label', node.title);
    return node;
  }

  /**
   * Buscar na Árvore — anotação 22, lote 33.
   *
   * Ele era cinza desde o lote 19, com a dica dizendo "vem no lote seguinte".
   * Numa árvore de dezoito ossos e vinte e três desenhos, achar `forearm_b`
   * rolando a lista é o tipo de trabalho que o programa devia fazer.
   */
  private searchButton(): HTMLButtonElement {
    const node = iconButton('search', 'Buscar', () => this.toggleSearch());
    node.dataset['acao'] = 'buscar';
    node.title = 'Buscar na Árvore (Ctrl+F): filtra pelo nome';
    node.setAttribute('aria-label', node.title);
    return node;
  }

  /** Abre a busca e põe o foco nela; aberta e vazia, fecha. */
  private toggleSearch(focar = true): void {
    if (this.searching && this.filter.trim() === '' && !focar) {
      this.searching = false;
    } else {
      this.searching = true;
    }
    this.render();
    if (!this.searching) return;
    queueMicrotask(() => {
      const campo = this.body?.parentElement?.querySelector('.arvore-busca-campo');
      if (campo instanceof HTMLInputElement) { campo.focus(); campo.select(); }
    });
  }

  /** Fecha a busca e mostra a árvore inteira de novo. */
  private closeSearch(): void {
    this.searching = false;
    this.filter = '';
    this.keepShown.clear();
    this.render();
  }

  /** O campo da busca, quando ela está aberta. */
  private searchField(): HTMLElement {
    const caixa = el('div', 'arvore-busca');
    const campo = el('input', 'arvore-busca-campo') as HTMLInputElement;
    campo.type = 'search';
    campo.placeholder = 'Buscar osso ou desenho';
    campo.value = this.filter;
    campo.setAttribute('aria-label', 'Buscar na Árvore pelo nome');
    campo.addEventListener('input', () => {
      this.filter = campo.value;
      this.keepShown.clear();
      this.render();
      queueMicrotask(() => {
        const vivo = this.body?.parentElement?.querySelector('.arvore-busca-campo');
        if (vivo instanceof HTMLInputElement) {
          vivo.focus();
          vivo.setSelectionRange(vivo.value.length, vivo.value.length);
        }
      });
    });
    campo.addEventListener('keydown', (event) => {
      // Esc fecha a busca sem sair do painel. A tecla é tratada uma vez só.
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.closeSearch(); }
    });
    // Rodada 43, lote 3: um × e não a lixeira — a lixeira é de apagar (doc 51, `02`).
    const fechar = iconButton('close', 'Fechar a busca', () => this.closeSearch());
    fechar.title = 'Fechar a busca e mostrar a árvore inteira';
    caixa.append(campo, fechar);
    return caixa;
  }

  private addConstraint(type?: typeof CONSTRAINT_TYPES[number]): void {
    const doc = this.doc;
    if (!doc) return;
    if ((corpoDe(doc).file.bones ?? []).length === 0) {
      doc.notice('Crie um osso antes de criar uma regra');
      return;
    }
    const chosen = type ?? (this.rulePick?.value ?? 'ik') as typeof CONSTRAINT_TYPES[number];
    const command = new AddConstraint(corpoDe(doc).file, chosen, doc.selection.bones);
    corpoDe(doc).run(command);
    doc.select({ ...doc.selection, bones: [], slots: [], constraints: [command.name] });
  }

  /** "Novo → Máscara": cria e já escolhe, para o painel abrir nos campos dela. */
  /*
   * Máscara, evento, parâmetro, Ponto e Caixa (a ferramenta, com o gesto no
   * rodapé) e "neste slot" moram em `tree-actions.ts` desde o lote A2.
   */

  /**
   * As linhas da árvore única, com o desenho da pele em edição — lote 64.
   *
   * Em Animando, a hierarquia é a **do quadro de agora** (§9.4, lote 1 de
   * 14/09): se uma chave `parent` já passou, a arma aparece nas costas, e não
   * na mão. Em Montagem o mapa é vazio e vale a árvore do arquivo.
   */
  private rows(doc: EditorDoc): TreeRow[] {
    const file = corpoDe(doc).file;
    // Rodada 23, defeito 9: a Árvore põe em dia a lista de ossos que a pilha
    // tira ANTES de desenhar as linhas. Era a cena que a punha, ao desenhar, e
    // a Árvore se redesenhava antes dela: depois de "Devolver o osso" o olho
    // lia a lista velha e mostrava 🚫 num osso que já tinha voltado.
    const gone = bonesGone(corpoDe(doc).file, skinStackOf(doc));
    setSkinGoneBones(gone);
    // Lote 1 do chat D: depois dos ossos e dos desenhos, o grupo "Eventos e
    // parâmetros" — o nó `Events` do Spine. Vazio quando o arquivo não tem.
    return [
      ...hierarchyRows(
        corpoDe(doc).file, skinForNew(corpoDe(doc).file, doc.visibleSkins), this.parentsNow(doc),
        // Rodada 12 (S8, S9): o osso de uma skin que saiu, e o que a skin
        // vestida apagou, saem da Árvore com os desenhos deles.
        gone,
        // Rodada 50, lote 4: o osso de cada desenho no quadro (a chave slot/bone).
        doc.animation === null ? undefined : appliedSlotBones(doc),
      ),
      ...eventParameterRows(file),
    ];
  }

  /** O pai de cada osso no instante de agora; nada em Montagem. */
  private parentsNow(doc: EditorDoc): ParentMap | undefined {
    return doc.animation === null ? undefined : appliedParents(doc);
  }

  /** A primeira linha escolhida que aceita um nome novo, ou `null`. */
  private renameableRow(): TreeRow | null {
    const doc = this.doc;
    if (!doc) return null;
    for (const row of this.rows(doc)) {
      if (this.isSelected(row) && this.renameTarget(row) !== null) return row;
    }
    return null;
  }

  /**
   * Renomear pelo menu ou por F2: o mesmo campo que o duplo clique abre.
   *
   * Os ossos de cima abrem antes: um osso dobrado não desenha as linhas dele, e
   * um campo de texto que não está na tela é um campo que ninguém digita.
   */
  private startRename(): void {
    const doc = this.doc;
    const row = this.renameableRow();
    if (doc === null || row === null) {
      this.doc?.notice('Escolha primeiro o que renomear');
      return;
    }
    const byId = new Map(this.rows(doc).map((entry) => [entry.id, entry]));
    const fechados = this.foldState();
    for (let at = row.owner; at !== undefined; at = byId.get(at)?.owner) fechados.delete(at);
    this.renaming = row.id;
    this.render();
  }

  // -------------------------------------------------------------------------
  // Drawing
  // -------------------------------------------------------------------------

  /** As linhas do último desenho, para saber o que nasceu — lote 1 do chat D. */
  private lastIds: Set<string> | null = null;
  /** A escolha do último desenho, para saber se ela mudou — B2, F7. */
  private lastSelection = '';

  /** A escolha que o último clique numa linha fez — QA da noite (`treeReveal`). */
  private escolhaDoClique: string | null = null;

  /**
   * Escolhe pelo clique na linha: anota a escolha ANTES (o redesenho roda
   * dentro do `select`) e depois (o documento pode completá-la), para que
   * nenhum redesenho role a lista debaixo do dedo — QA da noite de 04/11.
   */
  private escolher(doc: EditorDoc, selection: Selection): void {
    this.escolhaDoClique = selectionKey(selection);
    doc.select(selection);
    this.escolhaDoClique = selectionKey(doc.selection);
  }

  private render(): void {
    const doc = this.doc;
    const body = this.body;
    if (!doc || !body) return;
    this.drawnStack = this.stackKey(doc);

    const remove = this.toolbar?.querySelector('button[data-acao="apagar"]');
    if (remove instanceof HTMLButtonElement) {
      remove.disabled = !canDeleteSelection(corpoDe(doc).file, doc.selection);
    }
    const duplicar = this.toolbar?.querySelector('button[data-acao="duplicar"]');
    if (duplicar instanceof HTMLButtonElement) {
      duplicar.disabled = !new Duplicate(corpoDe(doc).file, doc.selection).hasWork;
    }

    clear(body);
    const caixaBusca = this.toolbar?.parentElement?.querySelector('.arvore-busca');
    caixaBusca?.remove();
    if (this.searching) this.toolbar?.after(this.searchField());

    // Uma árvore só — lote 64. O desenho de cada slot é o da pele em edição.
    const todas = this.rows(doc);
    // Lote 1 do chat D, a régua do arroz: o evento ou o parâmetro que acabou
    // de nascer tem de APARECER — o grupo abre, e a linha rola até a vista.
    const nasceu = newKeyItemRow(this.lastIds, todas);
    this.lastIds = new Set(todas.map((row) => row.id));
    if (nasceu !== null) this.foldState().delete(EVENTS_GROUP_ID);
    // B2 e F7 (29/09): a escolha que veio de FORA da Árvore — a cena, o menu,
    // o emissor que acabou de nascer — abre o caminho até a linha e rola até
    // ela. Só quando a escolha MUDOU: rolar a cada redesenho brigaria com quem
    // está rolando a lista à mão.
    const escolha = selectionKey(doc.selection);
    const mudou = escolha !== this.lastSelection;
    this.lastSelection = escolha;
    // QA da noite (04/11): a escolha que o clique da linha fez não rola.
    const revelar = treeReveal(escolha, this.escolhaDoClique, mudou);
    const achado = revelar.escolha && nasceu === null ? todas.find((row) => this.isSelected(row)) ?? null : null;
    if (achado !== null) {
      const byId = new Map(todas.map((row) => [row.id, row]));
      for (let at = achado.owner; at !== undefined; at = byId.get(at)?.owner) this.foldState().delete(at);
    }
    const mostrar = nasceu ?? achado;
    const busca = this.searching ? this.filter.trim() : '';
    // Buscando, a árvore abre até cada acerto; sem busca, vale a dobra.
    const linhas = busca !== '' ? searchHierarchy(todas, busca, this.keepShown) : unfoldedRows(todas, this.foldState());
    this.visible = linhas;
    // Rodada 43, lote 3: o foco estava numa linha (clique, seta)? Ele volta à
    // linha escolhida depois de redesenhar — sumia, e o teclado parava.
    const ativo = document.activeElement;
    const voltaFoco = this.keepFocus || (ativo instanceof HTMLElement && ativo.classList.contains('arvore-item'));
    this.keepFocus = false;
    if (todas.length === 0) {
      body.append(el('p', 'painel-aviso', 'Nada aqui ainda.'));
    } else if (linhas.length === 0) {
      body.append(el('p', 'painel-aviso', `Nada com "${busca}".`));
    } else {
      const list = el('ul', 'arvore-lista arvore-hierarquia');
      for (const row of linhas) list.append(this.renderRow(row, busca === ''));
      body.append(list);
      // QA da noite (04/11/2026): a zona de soltar do fim entra ANTES de focar
      // ou rolar. O `focus` mede a lista; sem os 48 px da zona, o navegador
      // prendia a rolagem no máximo daquele instante (804 → 756 em 1920), e o
      // segundo clique do duplo clique caía na linha de cima — renomeava o
      // desenho errado.
      body.append(this.rootDropZone());
      if (mostrar !== null) {
        const node = list.querySelector(`[data-linha="${CSS.escape(mostrar.id)}"]`);
        node?.scrollIntoView?.({ block: 'nearest' });
      }
      if (voltaFoco && this.renaming === null) {
        const alvo = (this.anchor === null ? null : list.querySelector(`[data-linha="${CSS.escape(this.anchor)}"]`))
          ?? list.querySelector('.arvore-item[aria-selected="true"]');
        if (alvo instanceof HTMLElement) {
          alvo.focus({ preventScroll: true });
          if (revelar.foco) alvo.scrollIntoView?.({ block: 'nearest' });
        }
      }
    }
    if (body.lastElementChild?.classList.contains('arvore-vazio-fim') !== true) body.append(this.rootDropZone());
  }

  /** A dobra deste arquivo, lida do navegador quando o arquivo muda. */
  private foldState(): Set<string> {
    const doc = this.doc;
    if (doc === null) return this.closed;
    const key = foldKey(doc.path, doc.file);
    if (key !== this.foldKeyNow) {
      this.foldKeyNow = key;
      this.closed.clear();
      for (const id of parseFolded(foldStore()?.getItem(key) ?? null)) this.closed.add(id);
    }
    return this.closed;
  }

  /** Dobra ou abre um osso, e guarda no navegador. */
  private toggleFold(row: TreeRow): void {
    const fechados = this.foldState();
    if (fechados.has(row.id)) fechados.delete(row.id);
    else fechados.add(row.id);
    try {
      if (this.foldKeyNow !== null) foldStore()?.setItem(this.foldKeyNow, JSON.stringify([...fechados]));
    } catch {
      // Navegador sem espaço ou sem permissão: a dobra vale até fechar a aba.
    }
    this.render();
  }

  /** Rodada 43, lote 3: dobra (ou abre) o osso e todos os de baixo dele, num gesto. */
  private foldBranch(row: TreeRow): void {
    const doc = this.doc;
    if (doc === null) return;
    const fechados = this.foldState();
    const fechar = !fechados.has(row.id);
    for (const id of branchFoldIds(this.rows(doc), row.id)) {
      if (fechar) fechados.add(id);
      else fechados.delete(id);
    }
    try {
      if (this.foldKeyNow !== null) foldStore()?.setItem(this.foldKeyNow, JSON.stringify([...fechados]));
    } catch {
      // Navegador sem espaço ou sem permissão: a dobra vale até fechar a aba.
    }
    this.render();
  }

  /**
   * O vazio do fim da Árvore — lote 64. Soltar uma linha aqui deixa o osso ou
   * o desenho **solto**, pendurado na raiz, sem mover.
   */
  private rootDropZone(): HTMLElement {
    const zona = el('div', 'arvore-vazio-fim');
    zona.title = 'Solte aqui para deixar solto, sem osso';
    zona.addEventListener('dragover', (event) => {
      if (!this.canDrop(null)) return;
      event.preventDefault();
      zona.classList.add('arvore-alvo');
    });
    zona.addEventListener('dragleave', () => zona.classList.remove('arvore-alvo'));
    zona.addEventListener('drop', (event) => {
      event.preventDefault();
      zona.classList.remove('arvore-alvo');
      this.drop(null);
    });
    return zona;
  }

  /** Fecha o menu do botão direito, venha o clique de onde vier. */
  private closeRowMenu(): void {
    closeFloatingMenu();
  }

  /**
   * O menu do botão direito numa linha da Árvore — anotação 15, itens f e i.
   *
   * Cada item chama `runAction`, que é a **mesma porta** do menu Editar: duas
   * portas para o mesmo lugar, e nunca duas funções parecidas. Desde o lote 60
   * o menu é o `openFloatingMenu` de `ui/floating-menu.ts`, o mesmo da aba
   * Imagens e da cena, e fecha no `Esc`.
   */
  private openRowMenu(row: TreeRow, x: number, y: number): void {
    const items: FloatingItem[] = [];
    const item = (label: string, hint: string, acao: string): void => {
      items.push({ label, hint, run: () => runAction(acao) });
    };

    // Lote 1 do chat D: o grupo do fim e as linhas dele têm o seu próprio
    // menu. "Substituir nomes" e "posição no osso" não valem para eles.
    const proprio = this.keyItemMenu(row);
    if (proprio !== null) {
      openFloatingMenu(x, y, proprio);
      return;
    }

    if (row.kind === 'attachment' || row.attachment !== undefined) {
      item('Copiar posição no osso',
        'Copia onde o desenho está dentro do osso: x, y, giro e as duas escalas',
        'copiar-ancora');
      item('Colar posição no osso',
        'Põe a mesma posição nos desenhos escolhidos',
        'colar-ancora');
      // Lote 39 — o "Swap image in all character maps" do Spriter.
      item('Trocar a imagem em todas as skins…',
        'Abre o painel Imagens: a imagem que você clicar troca em toda skin que usa a mesma neste slot',
        'trocar-imagem-todas-peles');
    }
    // Rodada 43, lote 4 (doc 51, `16`): o botão direito no osso só tinha
    // Substituir nomes e Renomear. As três que se fazem com a linha na mão.
    if (row.kind === 'bone') {
      item('Novo osso filho', `Um osso novo, filho de ${row.name}`, 'novo-osso');
      item('Duplicar', 'Ctrl+D: o osso vem com os filhos e os desenhos, 20 px à direita', 'duplicar');
    }
    item('Substituir nomes…',
      'Troca um pedaço de nome em vários itens de uma vez, com prévia',
      'substituir-nomes');
    if (this.renameTarget(row) !== null) {
      items.push({
        label: 'Renomear',
        hint: 'O mesmo que o duplo clique no nome',
        run: () => {
          this.renaming = row.id;
          this.render();
        },
      });
    }
    if (row.kind === 'bone' || row.kind === 'slot') {
      item('Apagar', 'Delete: o osso leva os de baixo e os desenhos deles, e pergunta antes. Ctrl+Z volta', 'apagar');
    }
    openFloatingMenu(x, y, items);
  }

  /**
   * O botão direito no grupo "Eventos e parâmetros" e nas linhas dele — lote 1
   * do chat D. `null` para as outras linhas, que seguem o menu de sempre.
   *
   * O parâmetro se apaga aqui (o `DeleteParameter`, o mesmo da aba Regras,
   * que leva as chaves junto). O evento não tem comando de apagar no programa
   * hoje: o menu diz onde a ficha dele está, e não finge um apagar.
   */
  private keyItemMenu(row: TreeRow): FloatingItem[] | null {
    const doc = this.doc;
    if (doc === null) return null;
    if (row.kind === 'parameter') {
      return [
        { label: 'Abrir a ficha em Propriedades', hint: 'Mínimo, máximo, padrão e de onde ele lê',
          run: () => runAction('mostrar-painel-propriedades') },
        { label: 'Ver na aba Regras', hint: 'As regras Comando que leem este parâmetro',
          run: () => runAction('mostrar-painel-regras') },
        { label: 'Apagar o parâmetro', hint: 'Apaga o parâmetro e as chaves dele. As regras que o liam ficam, e avisam',
          run: () => {
            corpoDe(doc).run(new DeleteParameter(row.name));
            doc.select(emptySelection());
          } },
      ];
    }
    if (row.kind === 'event') {
      return [
        { label: 'Abrir a ficha em Propriedades', hint: 'O som e os valores padrão do evento, e a chave dele',
          run: () => runAction('mostrar-painel-propriedades') },
      ];
    }
    if (row.kind === 'group') {
      return [
        { label: 'Novo evento', hint: 'O mesmo do Novo ▾ → Evento', run: () => runAction('novo-evento') },
        { label: 'Novo parâmetro', hint: 'O mesmo do Novo ▾ → Parâmetro', run: () => runAction('novo-parametro') },
      ];
    }
    return null;
  }

  /** O ícone das linhas do grupo do fim — lote 1 do chat D. */
  private keyItemIcon(row: TreeRow): HTMLElement | null {
    const icone = row.kind === 'event' ? 'event'
      : row.kind === 'parameter' ? 'rule-driver'
        : row.kind === 'group' ? 'pasta' : null;
    if (icone === null) return null;
    const node = el('span', 'arvore-icone-osso');
    if (!paintIcon(node, icone, 16)) node.textContent = row.kind === 'event' ? 'E' : row.kind === 'parameter' ? 'P' : '▸';
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  private renderRow(row: TreeRow, canFold: boolean): HTMLElement {
    const item = el('li');
    if (row.empty === true) item.classList.add('arvore-vazio');
    if (this.renaming === row.id) {
      item.append(this.renderRenameField(row));
      return item;
    }

    const node = el('button', 'arvore-item');
    node.type = 'button';
    node.style.paddingLeft = `${treeIndent(row.depth)}px`;
    node.setAttribute('aria-selected', this.isSelected(row) ? 'true' : 'false');
    node.dataset['linha'] = row.id;
    node.append(this.foldToggle(row, canFold));
    const proprio = this.keyItemIcon(row);
    if (proprio !== null) {
      node.append(proprio);
      node.classList.add(row.kind === 'group' ? 'arvore-grupo' : 'arvore-chaveavel');
    } else if (row.kind === 'bone') {
      const osso = el('span', 'arvore-icone-osso');
      if (!paintIcon(osso, 'bone', 16)) osso.textContent = '╱';
      osso.setAttribute('aria-hidden', 'true');
      node.append(osso);
    } else {
      // A miniatura do desenho que o slot mostra na pele em edição — item 75.
      // Ponto, caixa, máscara e malha mostram o ícone do tipo (lote 32).
      const thumb = this.slotThumb(row);
      if (thumb !== null) node.append(thumb);
    }
    const nomeNode = el('span', 'arvore-nome', row.label ?? row.name);
    // Rodada 43, lote 3: buscando, o nome que casou fica em negrito (os pais não).
    if (this.searching && this.filter.trim() !== '' && matchesSearch(row, this.filter)) nomeNode.classList.add('arvore-achado');
    node.append(nomeNode);
    // Rodada 43, lote 3: o nome INTEIRO na dica — na coluna estreita ele corta
    // ("hand_…", "sw… blade"). "Desenho" na tela; "slot" só aqui (decisão do Diretor).
    if (row.hint !== undefined) node.title = row.hint;
    else if (row.attachment !== undefined) node.title = `Desenho ${row.name} (slot), imagem ${row.attachment}. Ctrl+clique soma, Shift+clique faz faixa`;
    else node.title = `${row.label ?? row.name}. Ctrl+clique soma, Shift+clique faz faixa`;
    if (row.detail !== undefined) node.append(el('span', 'arvore-detalhe', row.detail));
    // O osso que tem regra ganha uma marca — lote 28, anotação 13. A seção
    // Regras saiu daqui e virou aba; sem esta marca a Árvore deixaria de dizer
    // quem se mexe sozinho, e é olhando a Árvore que se procura isso.
    if (row.kind === 'bone' && this.doc !== null
      && bonesWithRules(this.doc.file).has(row.name)) {
      const marca = el('span', 'arvore-regra');
      if (!paintIcon(marca, 'rule-ik', 14)) marca.textContent = '⚙';
      const dica = 'Este osso tem regra. Veja na aba Regras';
      marca.title = dica;
      marca.setAttribute('aria-label', dica);
      node.append(marca);
    }
    // Degrau 9 (I5): o osso que só existe com uma pele ganha o sinal dela, com
    // o nome na dica. Sem isso, o rabo do lobisomem sumia da cena ao desligar
    // a roupa e nada na tela dizia por quê (regra 21).
    if (row.skinOf !== undefined) {
      const pele = el('span', 'arvore-pele');
      if (!paintIcon(pele, 'image', 14)) pele.textContent = '◈';
      const dicaPele = skinOnlyHint(row.skinOf);
      pele.title = dicaPele;
      pele.setAttribute('aria-label', dicaPele);
      node.append(pele);
    }

    node.addEventListener('mousedown', (event) => {
      // Com o P segurado, o clique não tira o foco da cena: é lá que a tecla
      // sobe e fecha o gesto.
      if (selectTool.grabbingChildren) event.preventDefault();
    });
    node.addEventListener('click', (event) => {
      const doc = this.doc;
      if (doc === null) return;
      // Lote 1 do chat D: o grupo do fim dobra no clique; o evento é escolhido
      // pelo editor de evento (a seleção fica vazia e Propriedades abre na
      // ficha dele); o parâmetro tem seleção própria.
      if (row.kind === 'group') {
        this.toggleFold(row);
        return;
      }
      if (row.kind === 'event') {
        // Rodada 17, D2: a seleção esvazia ANTES do foco — Propriedades tira
        // o foco a cada escolha, e esta não é outra escolha, é esta.
        doc.select(emptySelection());
        focusEvent(row.name);
        return;
      }
      if (row.kind === 'parameter') {
        doc.select(selectionForRow(row));
        return;
      }
      // P segurado + clique: vira filho do osso escolhido, igual à cena (63a).
      const alvo = { kind: row.kind === 'bone' ? 'bone' as const : 'slot' as const, name: row.name };
      if (selectTool.grabFromTree(doc, alvo)) return;
      // Lote 69: com o modo Ligar aberto, o clique num osso liga (ou tira) ele
      // da malha escolhida, e a seleção não muda — o Bind do Spine.
      if (row.kind === 'bone' && bindModeClick(doc, row.name)) return;
      // Lote 69, item d: com Malha ou Pesos na mão, escolher o osso a pintar
      // não pode derrubar o desenho. A malha fica; só o osso troca.
      const manter = MESH_TOOLS.includes(getActiveToolId()) ? doc.selection : undefined;
      // Rodada 43, lote 3: Ctrl soma (ou tira) a linha; Shift escolhe a faixa
      // desde a última clicada. Os quatro programas fazem assim (doc 51, §1.1).
      this.keepFocus = true;
      if (manter === undefined && (event.ctrlKey || event.metaKey)) {
        this.anchor = this.cursor = row.id;
        this.escolher(doc, toggleRowInSelection(doc.selection, row));
        sayChosen(doc);
        return;
      }
      if (manter === undefined && event.shiftKey) {
        this.cursor = row.id;
        this.escolher(doc, rangeSelection(this.visible, this.anchor, row.id));
        sayChosen(doc);
        return;
      }
      this.anchor = this.cursor = row.id;
      this.escolher(doc, selectionForRow(row, manter));
    });
    node.addEventListener('dblclick', () => {
      if (this.renameTarget(row) === null) return;
      this.renaming = row.id;
      this.render();
    });
    // O botão direito na Árvore — anotação 15, itens f e i. "Substituir nomes"
    // e as duas de posição no osso só existiam no menu **Editar**, que é o
    // último lugar onde se procura o que fazer com a linha que está debaixo do
    // dedo. Todas continuam lá: isto é uma segunda porta, não uma mudança.
    node.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (row.kind === 'event') chooseEvent(row.name);
      this.doc?.select(selectionForRow(row));
      this.openRowMenu(row, event.clientX, event.clientY);
    });

    if (row.kind === 'slot') this.acceptImage(node, row);
    else this.refuseImage(node, row);

    // Lote 63a: a linha do desenho também arrasta — solta num osso, o slot
    // dela vira filho dele. Lote 64: solta no vazio do fim, fica solta.
    const draggable = row.kind === 'bone' || row.kind === 'slot';
    if (draggable) {
      node.draggable = true;
      node.addEventListener('dragstart', (event) => {
        this.dragged = row;
        this.avisouOrdem = false;
        event.dataTransfer?.setData('text/plain', row.id);
      });
      node.addEventListener('dragend', () => {
        this.dragged = null;
        node.classList.remove('arvore-alvo');
      });
      node.addEventListener('dragover', (event) => {
        if (!this.canDrop(row)) {
          // Rodada 43, lote 3 (regra 21): desenho sobre desenho não fazia nada
          // e não dizia nada. A ordem de desenho mora na aba Ordem.
          if (!this.avisouOrdem && this.dragged?.kind === 'slot' && row.kind === 'slot' && this.dragged.id !== row.id) {
            this.avisouOrdem = true;
            this.doc?.notice('Para mudar quem fica na frente, use a aba Ordem: lá se arrasta a ordem de desenho');
          }
          return;
        }
        event.preventDefault();
        node.classList.add('arvore-alvo');
      });
      node.addEventListener('dragleave', () => node.classList.remove('arvore-alvo'));
      node.addEventListener('drop', (event) => {
        event.preventDefault();
        node.classList.remove('arvore-alvo');
        this.drop(row);
      });
    }

    item.append(node);
    const eye = this.renderEye(row);
    if (eye !== null) item.append(eye);
    const lock = this.renderLock(row);
    if (lock !== null) item.append(lock);
    return item;
  }

  /**
   * O triângulo do osso que tem gente embaixo — lote 64. Nas outras linhas, o
   * mesmo espaço vazio, para os nomes do mesmo nível alinharem. Um `<span>`,
   * e não um botão dentro do botão da linha (a razão do olho e do cadeado).
   * Buscando, tudo está aberto e o triângulo não dobra.
   */
  private foldToggle(row: TreeRow, canFold: boolean): HTMLElement {
    const seta = el('span', 'arvore-dobra');
    if (!foldable(row)) return seta;
    if (!canFold) {
      seta.textContent = OPEN_ARROW;
      return seta;
    }
    const aberto = !this.foldState().has(row.id);
    const nome = row.label ?? row.name;
    seta.textContent = aberto ? OPEN_ARROW : CLOSED_ARROW;
    seta.setAttribute('role', 'button');
    seta.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    seta.title = `${aberto ? `Dobrar ${nome}` : `Abrir ${nome}`}. Alt+clique: o ramo inteiro`;
    seta.setAttribute('aria-label', seta.title);
    seta.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      // Rodada 43, lote 3: Alt dobra (ou abre) o ramo inteiro — o Photoshop.
      if (event.altKey) this.foldBranch(row);
      else this.toggleFold(row);
    });
    return seta;
  }

  /**
   * Uma imagem do painel Imagens solta numa linha — lote 56, plano pivô.
   *
   * Num **slot**: um desenho novo nele, na pele do lápis, já no lugar pelo
   * pivô da imagem (sem pivô, no centro do osso). Nasce com a bolinha ○, como
   * o Ponto e a Caixa num slot que já existe.
   * Num **desenho**: troca a imagem dele, posta pelo pivô.
   *
   * O arrasto de dentro da Árvore (trocar de pai, mudar a ordem) não traz
   * `DRAG_TYPE`, e passa reto por aqui.
   */
  /**
   * Uma imagem solta numa linha que **não** é de slot (osso, regra, evento) —
   * rodada 44, lote 1. Ela caía calada (conferência, foto 11: a Árvore rolou no
   * arrasto e a imagem caiu num osso). Agora o rodapé diz onde soltar. A linha
   * não acende como alvo: ela não aceita.
   */
  private refuseImage(node: HTMLElement, row: TreeRow): void {
    const isImage = (event: DragEvent): boolean => event.dataTransfer?.types.includes(DRAG_TYPE) === true;
    node.addEventListener('dragover', (event) => {
      if (isImage(event)) event.preventDefault();
    });
    node.addEventListener('drop', (event) => {
      if (!isImage(event)) return;
      event.preventDefault();
      const doc = this.doc;
      const image = event.dataTransfer?.getData(DRAG_TYPE) ?? '';
      if (!doc || image === '') return;
      void this.dropImage(doc, row, image);
    });
  }

  private acceptImage(node: HTMLElement, row: TreeRow): void {
    const isImage = (event: DragEvent): boolean => event.dataTransfer?.types.includes(DRAG_TYPE) === true;
    node.addEventListener('dragover', (event) => {
      if (!isImage(event)) return;
      event.preventDefault();
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'copy';
      node.classList.add('arvore-alvo');
    });
    node.addEventListener('dragleave', () => node.classList.remove('arvore-alvo'));
    node.addEventListener('drop', (event) => {
      if (!isImage(event)) return;
      event.preventDefault();
      node.classList.remove('arvore-alvo');
      const doc = this.doc;
      const image = event.dataTransfer?.getData(DRAG_TYPE) ?? '';
      if (!doc || image === '') return;
      void this.dropImage(doc, row, image);
    });
  }

  /**
   * A soltura, depois de a imagem ter região — lote 60: a imagem que só está
   * na pasta ganha a região provisória antes, porque o desenho novo nasce
   * pelo pivô dela.
   */
  private async dropImage(doc: EditorDoc, row: TreeRow, image: string): Promise<void> {
    if (!await ensureProvisional(doc, image)) {
      doc.notice(`"${image}" não abriu: o arquivo sumiu da pasta, ou o navegador não conseguiu ler`);
      return;
    }
    if (row.kind !== 'slot') {
      // Rodada 44, lote 1: a soltura numa linha que não aceita fala (regra 21).
      doc.notice(`Solte a imagem na linha de um slot: o desenho dele troca por "${image}". Nesta linha ela não entra`);
      return;
    }
    // Lote 64: a linha do slot mostra um desenho. Com desenho, a imagem troca
    // a dele, posta pelo pivô; sem desenho nesta pele, entra como desenho novo.
    if (row.attachment !== undefined && row.skin !== undefined) {
      // Rodada 44, lote 1: com uma ENTIDADE no slot, ela vira a imagem.
      const troca = swapCommandFor(corpoDe(doc), row.name, image, row.skin, row.attachment);
      corpoDe(doc).run(troca.command);
      doc.notice(troca.entidade
        ? `${row.name} deixa de mostrar a entidade e passa a mostrar a imagem ${image}, pelo pivô dela`
        : `${row.name}/${row.attachment} agora mostra ${image}`);
      return;
    }
    const command = new AddAttachmentToSlot(
      row.name, skinForNew(corpoDe(doc).file, doc.visibleSkins), attachmentNameFor(image),
      imageOnSlotDef(doc.atlases, image), 'Imagem no slot',
    );
    corpoDe(doc).run(command);
    doc.select({ ...emptySelection(), attachments: [{ slot: row.name, attachment: command.name }] });
    doc.notice(`${image} entrou no slot ${row.name} como ${command.name}: escolha-o no campo Anexo das Propriedades para mostrar`);
  }

  /**
   * The padlock of a bone or a slot: locks that one thing on its own.
   *
   * A whole-kind lock (the "Travar" buttons over the canvas) shows here too,
   * greyed out, so the tree never says "free" about something the pointer
   * cannot reach. The glyph carries its meaning in `aria-label` and `title`,
   * because a glyph on its own is a word some people never read.
   */
  private renderLock(row: TreeRow): HTMLButtonElement | null {
    if (row.kind !== 'bone' && row.kind !== 'slot') return null;
    const locks = currentLocks();
    const own = row.kind === 'bone' ? locks.lockedBones.has(row.name) : locks.lockedSlots.has(row.name);
    const whole = row.kind === 'bone' ? locks.lockBones : locks.lockDrawings;
    const locked = own || whole;

    const node = el('button', 'arvore-trava', locked ? '\u{1F512}' : '\u{1F513}');
    node.type = 'button';
    node.dataset['trava'] = row.kind;
    node.dataset['nome'] = row.name;
    node.setAttribute('aria-pressed', own ? 'true' : 'false');
    const what = row.kind === 'bone' ? 'o osso' : 'o desenho';
    node.title = whole
      ? `Todos ${row.kind === 'bone' ? 'os ossos' : 'os desenhos'} estão travados pelo botão Travar`
      : own ? `Destravar ${what} ${row.name}` : `Travar ${what} ${row.name}: o clique passa por ele`;
    node.setAttribute('aria-label', node.title);
    node.classList.toggle('is-travado', locked);
    node.disabled = whole;
    node.addEventListener('click', (event) => {
      event.stopPropagation();
      const doc = this.doc;
      if (row.kind === 'bone') setBoneLocked(row.name, !own, doc);
      else setSlotLocked(row.name, !own, doc);
      // QA da noite (04/11): o cadeado diz o que fez, como o olho.
      doc?.notice(lockNotice(row.kind === 'bone' ? 'bone' : 'slot', row.name, !own));
    });
    return node;
  }

  /*
   * A bolinha ●/○ de cada desenho morava aqui (item 9). Saiu no lote 64 com as
   * três listas: a Árvore tem uma linha por slot, com o desenho que ele mostra.
   * Trocar o desenho do slot é o campo Anexo das Propriedades — o mesmo
   * caminho que a bolinha usava —, ou o botão direito no desenho, na cena.
   */

  /**
   * O olho de cada linha — item 57.
   *
   * Ao lado do cadeado, e com a mesma forma: um `<span>` que engole o clique,
   * dentro do botão da linha. **Escondido é diferente de travado.** Travado
   * aparece e não pega clique; escondido não aparece e também não pega. Duas
   * perguntas diferentes, dois botões.
   *
   * `null` para linha que não é osso nem slot: uma pele não se esconde.
   */
  private renderEye(row: TreeRow): HTMLElement | null {
    const doc = this.doc;
    if (doc === null) return null;
    const isBone = row.kind === 'bone';
    const isSlot = row.kind === 'slot';
    if (!isBone && !isSlot) return null;

    const hidden = isBone ? isBoneHidden(row.name) : isSlotHidden(row.name);
    const node = el('span', hidden ? 'arvore-olho arvore-olho-off' : 'arvore-olho',
      hidden ? '🚫' : '👁');
    node.setAttribute('role', 'button');
    node.tabIndex = -1;
    node.title = hidden
      ? `${row.name} está escondido. Clique para mostrar`
      : `Esconder ${row.name}. Escondido não aparece e não pega clique`;
    node.setAttribute('aria-label', node.title);
    node.setAttribute('aria-pressed', hidden ? 'true' : 'false');
    node.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (isBone) setBoneHidden(row.name, !hidden, doc);
      else setSlotHidden(row.name, !hidden, doc);
      // I-O1 (chat I, 29/09): o olho escondia e calava. Régua do arroz: diz.
      doc.notice(eyeNotice(isBone ? 'bone' : 'slot', row.name, !hidden));
    });
    return node;
  }

  /**
   * A miniatura do desenho — imagem, esqueleto filho, ou o ícone do tipo.
   *
   * Desde o lote 32 ela nunca falta: um ponto, uma caixa de colisão e uma
   * máscara não têm imagem, e mostram o ícone do tipo com o nome na dica.
   */
  private slotThumb(row: TreeRow): HTMLElement | null {
    const doc = this.doc;
    if (doc === null) return null;
    // Slot sem desenho nesta pele: o quadrado vazio, apagado pelo CSS.
    const node = thumbnailNode(doc, row.name, row.attachment ?? null, THUMB_SIZE);
    node.classList.add('arvore-mini');
    return node;
  }

  private renderRenameField(row: TreeRow): HTMLInputElement {
    const input = el('input', 'arvore-renomear');
    input.type = 'text';
    input.value = row.name;
    input.setAttribute('aria-label', 'Novo nome');

    const finish = (save: boolean): void => {
      if (this.renaming !== row.id) return;
      this.renaming = null;
      const doc = this.doc;
      const target = this.renameTarget(row);
      this.keepFocus = true;
      // Rodada 43, lote 3 (regra 21): o nome vazio voltava calado.
      if (save && doc && target && input.value.trim() === '') {
        doc.notice(emptyNameSays(row.name));
        this.render();
        return;
      }
      if (save && doc && target && input.value !== row.name) {
        const comando = new RenameItem(corpoDe(doc).file, target, input.value);
        // Rodada 43, lote 3 (doc 51, T2): a peça renomeada sumia da busca.
        // Doc 62 (a): a busca fica como foi digitada; a peça renomeada continua à vista.
        if (this.searching) this.keepShown.add(`${row.kind}:${comando.to}`);
        if (row.id === `${row.kind}:${row.name}`) this.anchor = this.cursor = `${row.kind}:${comando.to}`;
        corpoDe(doc).run(comando);
        // O rodapé dizia só "Renomear."; o repetido virava `arm2` sem dizer.
        doc.notice(renameSays(row.name, input.value, comando.to));
      } else {
        this.render();
      }
    };

    input.addEventListener('blur', () => finish(true));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); finish(true); }
      if (event.key === 'Escape') { event.preventDefault(); finish(false); }
    });
    queueMicrotask(() => { input.focus(); input.select(); });
    return input;
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private renameTarget(row: TreeRow): RenameTarget | null {
    if (row.kind === 'bone') return { kind: 'bone', from: row.name };
    if (row.kind === 'slot') return { kind: 'slot', from: row.name };
    if (row.kind === 'constraint') return { kind: 'constraint', from: row.name };
    if (row.kind === 'attachment' && row.slot !== undefined) {
      return { kind: 'attachment', slot: row.slot, from: row.name };
    }
    return null;
  }

  private isSelected(row: TreeRow): boolean {
    const selection = this.doc?.selection;
    if (!selection) return false;
    if (row.kind === 'bone') return selection.bones.includes(row.name);
    // Lote 64: a linha do slot acende também quando só o desenho dele está
    // escolhido — é o que o clique na cena escolhe.
    if (row.kind === 'slot') {
      return selection.slots.includes(row.name) || selection.attachments.some((a) => a.slot === row.name);
    }
    if (row.kind === 'constraint') return selection.constraints.includes(row.name);
    if (row.kind === 'parameter') return (selection.parameters ?? []).includes(row.name);
    // O evento acende quando é o escolhido e nada mais está: é o estado em que
    // Propriedades mostra a ficha dele.
    if (row.kind === 'event') return currentEventChoice() === row.name && nothingPicked(selection);
    if (row.kind === 'attachment') {
      return selection.attachments.some(
        (a) => a.slot === row.slot && a.attachment === row.name,
      );
    }
    return false;
  }

  /** `null` é o vazio do fim da Árvore. */
  private canDrop(target: TreeRow | null): boolean {
    const doc = this.doc;
    return doc !== null && this.dragged !== null
      && hierarchyDropAction(corpoDe(doc).file, this.dragged, target, this.parentsNow(doc)) !== null;
  }

  /** Em cima de um osso: vira filho dele. No vazio do fim (`null`): solto. */
  private drop(target: TreeRow | null): void {
    const source = this.dragged;
    const doc = this.doc;
    this.dragged = null;
    if (!source || !doc) return;
    const action = hierarchyDropAction(corpoDe(doc).file, source, target, this.parentsNow(doc));
    if (action === null) return;
    if (action.kind === 'reparent') {
      // O arrasto na Árvore passa pela MESMA porta da tecla P — lote 34 —, e
      // é ela que guarda a pose de mundo. Desde o 63a, desenho sobre osso também.
      if (target !== null) {
        const saida = runReparent(doc, action.selection, action.parent);
        // Rodada 43, lote 3 (doc 51, T3): o rodapé diz QUEM ("1 item" não
        // dizia), e a peça segue escolhida — sumia a escolha depois de soltar.
        // A troca de lugar (pai sobre o filho) já fala com os dois nomes.
        const troca = source.kind === 'bone' && target.kind === 'bone' && isDescendantBone(corpoDe(doc).file, target.name, source.name);
        // Escolher ANTES de falar: escolher redesenha o rodapé e apagava o recado.
        if (saida.moved) {
          this.anchor = this.cursor = source.id;
          this.keepFocus = true;
          doc.select(selectionForRow(source));
        }
        if (saida.moved && !troca) doc.notice(`${source.name} virou filho de ${action.parent}${reparentExtra(saida)}`);
        return;
      }
      // Lote 64: solto. A raiz escondida não tem nome na tela; o recado diz "solto".
      const saida = runReparent(doc, action.selection, action.parent, `${source.name} fica solto`, { quiet: true });
      if (saida.moved) doc.notice(`${source.name} ficou solto, sem osso${reparentExtra(saida)}`);
      return;
    }
    corpoDe(doc).run(new MoveSlot(action.from, action.to));
  }
}

/** Nada escolhido — o estado em que o evento da Árvore acende. */
function nothingPicked(selection: Selection): boolean {
  return selection.bones.length === 0 && selection.slots.length === 0
    && selection.attachments.length === 0 && selection.constraints.length === 0
    && (selection.parameters ?? []).length === 0 && (selection.variables ?? []).length === 0;
}

export const treePanel = new TreePanel();
registerPanel(treePanel);

/**
 * Somar pela Árvore fala como somar pela cena — Rodada 47, lote 4 (nota b do doc 82). Pela cena,
 * Ctrl+clique dizia *"2 escolhidos: torso, body"*; pela Árvore, nada. A frase
 * é a mesma (`chosenNotice`), e o osso que veio de carona com o desenho não conta.
 */
function sayChosen(doc: EditorDoc): void {
  const file = corpoDe(doc).file;
  const sel = doc.selection;
  const boneOfSlot = (slot: string): string | null => (file.slots ?? []).find((s) => s.name === slot)?.bone ?? null;
  const nomes = [...handPickedBones(sel, boneOfSlot), ...sel.attachments.map((a) => a.slot), ...sel.slots];
  const dito = chosenNotice(nomes);
  if (dito !== null) doc.notice(dito);
}
