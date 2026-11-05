/**
 * Painel "Animações": **Corpos em cima, Animações do corpo embaixo** (M8).
 *
 * Degrau 5 (17/09/2026). Era a lista de animações e só ela, porque o documento
 * era um arquivo só. O documento virou projeto no 4b — o homem e o lobisomem,
 * cada um com a base dele e as animações dele — e esta janela é onde se anda
 * entre os dois. As palavras do Humberto: *"a lista Corpos em cima, Animações
 * do corpo embaixo; clicar no corpo sem animação abre a base."*
 *
 * Clicar num CORPO troca o corpo em foco e abre a **base** dele
 * (`doc.animation === null`, o quadro 0 de §5.1). Clicar numa ANIMAÇÃO abre a
 * animação daquele corpo. Os dois botões de cima são do corpo: **Salvar como
 * base nova** (M9) e **Rebaixar a entidade** (E2); os cinco de baixo são da
 * animação, como sempre foram.
 *
 * Um projeto de um corpo mostra uma linha em Corpos, e nada muda para quem
 * abre o herói: a lista de baixo continua sendo a lista que sempre foi.
 *
 * O TOCADOR NÃO MORA MAIS AQUI. Ele foi para a primeira linha da linha do
 * tempo no lote 2 (v1.8) — item 6 da pesquisa de interface. Ele vivia escondido
 * no fim deste painel, que é a lista de animações e não o lugar onde se
 * trabalha o tempo; nos cinco programas pesquisados o tocador fica encostado na
 * linha do tempo, que é onde a mão já está.
 *
 * O Repetir de cada linha é **só leitura**. Um lugar só para ligar — o botão do
 * tocador —, como no Live2D: dois lugares que escrevem no mesmo campo é onde
 * nascem as duas verdades.
 */

import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { registerPanel } from '../contract.js';
import { clear, el, ensureStylesheet, separador, iconButton} from './dom.js';
import {
  DeleteAnimation, DuplicateAnimation, MoveAnimationToTop,
  animationRowMenu, baseLineLabel, renameAfter, renameAnswer, renamedNotice, showBodiesList,
  externalCount, externalHint, formatTime, listAnimations, listBodies, listExternalAnimations,
  entityBaseHint, hostOfEntityView, listEntityBases,
} from './animations-model.js';
import type { EntityBaseRow } from './animations-model.js';
import { isMarkedSlotBase, isSlotBaseRow } from './slot-base-model.js';
import { openFloatingMenu } from '../ui/floating-menu.js';
import { askForm } from '../ui/dialog.js';
import type { BodyRow } from './animations-model.js';

/** A dica do botão e do sinal da primeira linha — lote 44. */
const TOPO_DICA = 'A primeira da lista é a que o jogo abre';

// A dica do Salvar como base nova mora em `animations-actions.ts` desde a
// rodada 6: o menu Base faz a mesma pergunta.

/** A dica do Rebaixar — E2, degrau 5. */
const REBAIXAR_DICA = 'Rebaixar a entidade: a base sai da lista Bases e vai para o painel '
  + 'Entidades, inteira. Promover devolve. A base em foco não se rebaixa: abra outra antes';

/** A dica de uma linha da lista Corpos. */
export function bodyHint(row: BodyRow): string {
  const quantas = row.animations === 0 ? 'sem animação'
    : row.animations === 1 ? '1 animação' : `${row.animations} animações`;
  return row.focused
    ? `${row.name}: a base em foco, ${quantas}. Clique para voltar a ela`
    : `${row.name}: ${quantas}. Clique para abrir a base desta base`;
}

/** A dica da Biblioteca — degrau 12, parte `B`, lote 2. */
const BIBLIOTECA_DICA = 'Usar animações de outro boneco: as do Esqueleto padrão (parado, andar, '
  + 'correr e pular), as de outra base do projeto, ou de um arquivo. A tabela combina os ossos antes';

/** O título da seção das que vêm de fora — spec 2.8, `assets.animations`. */
const DE_FORA_DICA = 'Compartilhadas: animações que este boneco toca LIGADAS a outro arquivo '
  + '(assets.animations). Mudam junto com o original. Clique para ver tocar; "Abrir o original" vai '
  + 'para onde se muda';

/** A dica do sinal da próxima — lote 46. */
const PROXIMA_DICA =
  'Próxima: entra do começo quando a atual chegar ao fim. Isto é do tocador; Repetir é outra coisa.';
import { RenameItem } from './tree-model.js';
// Reaproveitar animação (04/11/2026): as compartilhadas, e a porta da janela.
import { listShared, sharedFrom } from './reuse-model.js';
import { openOriginal, ownerOf, useAnimations } from './reuse-actions.js';
import { projetoDe } from '../doc/projeto.js';
import { registerAction } from '../ui/actions.js';
import { transport } from '../anim/transport.js';
import {
  BASE_NOVA_DICA, addAnimation as addAnimationNow, askNewBase, demoteBody, exportAnimation, openAnimation,
  openBody, openEntityAnimation, pickEntitySlots, returnToHost, takeNameRequest,
} from './animations-actions.js';
import { redrawPlan, signature } from './list-redraw.js';
import type { ListShape } from './list-redraw.js';

class AnimationsPanel implements Panel {
  readonly id = 'animacoes';
  readonly title = 'Animações';
  // `transform` — K7: ligar o Repetir é um comando `transform`, e sem ouvi-lo
  // a etiqueta "repete" só aparecia depois de trocar de animação e voltar. O
  // `redrawPlan` só refaz a lista quando a assinatura muda: um arrasto na cena
  // custa uma comparação de texto, nada mais.
  readonly listensTo = ['file', 'structure', 'time', 'transform'] as const;

  private doc: EditorDoc | null = null;
  private list: HTMLElement | null = null;
  /** A lista Corpos, em cima — degrau 5. */
  private corpos: HTMLElement | null = null;
  /** O título da lista de baixo: "Animações de fulano". */
  private tituloAnimacoes: HTMLElement | null = null;
  /** O que está desenhado na lista Corpos, para não refazer o DOM à toa. */
  private drawnBodies = '';
  /** Os botões de corpo, por uri, para trocar só o realce. */
  private bodyButtons = new Map<string, HTMLElement>();
  /** O corpo em que a mão está, para os botões de cima agirem nele. */
  private picked: string | null = null;
  /** O que desfazer no registro de ações quando o painel for desmontado. */
  private forgetActions: Array<() => void> = [];
  /** O que está desenhado agora. Ver `refresh`. */
  private drawn: ListShape = { rows: '', picked: null };
  /** Os botões desenhados, por nome, para trocar só o realce. */
  private buttons = new Map<string, HTMLElement>();
  /** Para de ouvir o tocador — a fila da próxima mora nele (lote 46). */
  private stopTransport: (() => void) | null = null;
  /** A tira e a lista das que vêm de fora — degrau 12, parte `B`, lote 2. */
  private tiraDeFora: HTMLElement | null = null;
  private deFora: HTMLElement | null = null;
  /** A tira "Corpos" e os dois botões do corpo, que mudam de casa — P33. */
  private tiraCorpos: HTMLElement | null = null;
  private bodyTools: HTMLElement[] = [];
  /**
   * A animação com o campo de nome aberto, ou `null` — Q2/K14. Duplo clique,
   * lápis, o botão direito e a animação que acabou de nascer abrem o mesmo campo.
   */
  private renaming: string | null = null;
  /** A que a Nova animação criou e ainda não foi aberta: o campo espera por ela. */
  private waitingBorn: string | null = null;
  /** O tipo da mudança que pediu este desenho — `file` nunca abre o campo. */
  private drawingFor: DocChange['kind'] = 'structure';

  mount(doc: EditorDoc, host: HTMLElement): void {
    ensureStylesheet();
    this.doc = doc;
    clear(host);
    host.classList.add('painel');

    /*
     * Cinco ícones numa linha — lote 19, rodada 3.
     *
     * Eram cinco botões de palavra em duas linhas, e a segunda linha ficava
     * cortada pelo cabeçalho do painel de cima na foto que o Humberto mandou.
     * A palavra continua no `title` e no `aria-label`, e volta ao lado do
     * ícone com **Editar → Preferências → Mostrar nome das ferramentas**.
     */
    /*
     * Os seis ícones moram na tira "Animações" — lote 3 do chat G, Q1/K1.
     *
     * Em duas linhas de barra eles comiam 112 dos 129 px do painel em
     * 1440×900, e a lista ficava com **17 px**: a animação nova nascia fora da
     * vista, e o mouse não alcançava nenhuma linha. Na tira, ao lado do título
     * da lista em que agem, eles custam a altura de uma linha só — é onde o
     * Spine põe o ícone de nova animação: no título da aba Animations.
     */
    const toolbar = el('div', 'anim-secao-botoes');
    // Lote 44: a primeira da lista é a padrão (§4.6). O nome fica no
    // `aria-label`; a dica diz o nome e o porquê.
    const topo = iconButton('ordem-topo', 'Mandar para o topo', () => this.moveToTop());
    topo.title = `Mandar para o topo: ${TOPO_DICA.toLowerCase()}`;
    // Degrau 12, parte `B`, lote 2: a biblioteca. Sexto ícone, com o nome na
    // dica (regra 12) — a porta que o Spine tem em `File -> Import -> Project`.
    const biblioteca = iconButton('pasta', 'Usar animações de outro boneco', () => this.openLibrary());
    biblioteca.title = BIBLIOTECA_DICA;
    toolbar.append(
      iconButton('plus', 'Nova animação', () => this.addAnimation()),
      iconButton('duplicate', 'Duplicar', () => this.duplicateAnimation()),
      iconButton('rename', 'Renomear', () => this.renameAnimation()),
      topo,
      iconButton('trash', 'Apagar', () => this.deleteAnimation()),
      biblioteca,
    );
    /*
     * "Voltar à montagem" SAIU daqui no lote 23.
     *
     * A volta virou o interruptor de modo, e o interruptor saiu da barra no
     * degrau 11 (18/09/2026). As portas de hoje: um clique no CORPO, aqui em
     * cima, abre a base; **Animação → Abrir a base** faz o mesmo; e o rodapé
     * diz onde se está. Nada some.
     */

    const body = el('div', 'painel-corpo anim-corpo');
    // A lista cresce com o arquivo, e por isso pode rolar: a prova
    // `medir-paineis.mjs` lê esta marca e deixa esta caixa em paz.
    body.dataset.rolagem = 'lista';

    /*
     * Corpos em cima — M8, degrau 5.
     *
     * Os dois botões desta tira são do CORPO, e por isso moram na tira dela e
     * não na de cima: quem lê a janela de cima para baixo encontra o botão ao
     * lado da lista em que ele age. Ícone com o nome na dica (regra 12).
     */
    const tiraCorpos = el('div', 'anim-secao');
    tiraCorpos.append(el('span', 'anim-secao-nome', 'Bases'));
    const baseNova = iconButton('back-to-setup', 'Salvar como base nova', () => this.saveAsNewBase());
    baseNova.title = BASE_NOVA_DICA;
    const rebaixar = iconButton('ordem-fundo', 'Rebaixar a entidade', () => this.demoteBody());
    rebaixar.title = REBAIXAR_DICA;
    // Com um corpo só a tira some e os dois botões vão para a linha
    // "Base — montar" (P33); com mais, voltam para cá. `renderBodies` decide.
    this.tiraCorpos = tiraCorpos;
    this.bodyTools = [baseNova, rebaixar];
    const corpos = el('ul', 'anim-corpos');
    this.corpos = corpos;

    const tiraAnimacoes = el('div', 'anim-secao anim-secao-animacoes');
    this.tituloAnimacoes = el('span', 'anim-secao-nome', 'Animações');
    tiraAnimacoes.append(this.tituloAnimacoes, toolbar);

    const list = el('ul', 'anim-lista');
    // Rodada 8b: é esta `ul` que rola (o corpo é flex e dá a ela o resto da
    // altura). Com as entidades encaixadas a lista cresce com o arquivo, e a
    // marca de lista tem de estar em quem rola, não só na caixa de fora.
    list.dataset.rolagem = 'lista';

    // "De fora" — degrau 12, parte `B`, lote 2. A tira e a lista nascem aqui e
    // ficam escondidas enquanto não houver arquivo externo nenhum: um título
    // vazio ocupa a altura do painel, e a altura é o que falta nesta coluna.
    const tiraDeFora = el('div', 'anim-secao');
    tiraDeFora.title = DE_FORA_DICA;
    tiraDeFora.append(el('span', 'anim-secao-nome', 'Compartilhadas'));
    const deFora = el('ul', 'anim-lista anim-de-fora');
    tiraDeFora.hidden = true;
    deFora.hidden = true;
    this.tiraDeFora = tiraDeFora;
    this.deFora = deFora;

    body.append(tiraCorpos, corpos, tiraAnimacoes, list, tiraDeFora, deFora);
    this.list = list;

    host.append(body);
    this.registerActions();
    // A fila muda sem o documento mudar: o sinal "próxima" ouve o tocador. O
    // `redrawPlan` só refaz a lista quando a assinatura muda.
    this.stopTransport?.();
    this.stopTransport = transport.onChange(() => this.refresh({ kind: 'time' }));
    this.render();
  }

  /**
   * As ações do menu Animação que este painel faz.
   *
   * Tocar e Repetir saíram daqui no lote 2: quem responde por eles agora é a
   * linha do tempo, que é quem os desenha. Quem desenha um botão responde por
   * ele — é a regra que impede duas verdades sobre o mesmo estado.
   */
  private registerActions(): void {
    for (const forget of this.forgetActions) forget();
    const open = (): boolean => this.doc?.animation != null;
    this.forgetActions = [
      // Lote A2: 'abrir-a-base' e 'nova-animacao' moram em
      // `animations-actions.ts`, registradas no arranque.
      registerAction('duplicar-animacao', { run: () => this.duplicateAnimation(), enabled: open }),
      registerAction('renomear-animacao', { run: () => this.renameAnimation(), enabled: open }),
      registerAction('apagar-animacao', { run: () => this.deleteAnimation(), enabled: open }),
      registerAction('mandar-para-o-topo', { run: () => this.moveToTop(), enabled: open }),
    ];
  }

  /**
   * **Não refaz a lista quando ela não mudou** — anotação 16 do Humberto.
   *
   * Este painel escuta `time`, porque a duração escrita em cada linha vem do
   * arquivo e a linha aberta ganha destaque. Tocando, o tempo muda a cada
   * quadro, e refazer o DOM a cada quadro comia o clique: o botão em que o dedo
   * descia já não existia quando ele subia, e o navegador não dispara `click`
   * entre dois elementos diferentes. *"Atualmente isso está travado"* — não
   * estava travado; a lista fugia da mão.
   *
   * A conta de refazer ou não é o `redrawPlan`, puro, e é a mesma de todo
   * painel de lista.
   */
  refresh(change: DocChange): void {
    const doc = this.doc;
    if (doc === null) return;
    // Outro arquivo (abrir, reabrir a pasta): nada nasceu aqui — passo 14 do
    // roteiro. O campo de nome aberto e a espera morrem com o arquivo velho.
    if (change.kind === 'file') {
      this.renaming = null;
      this.waitingBorn = null;
    }
    this.drawingFor = change.kind;
    // A lista Corpos muda por fora do arquivo aberto (trocar o foco, criar uma
    // base nova, rebaixar): a assinatura dela é conferida à parte, e qualquer
    // diferença refaz as duas listas de uma vez.
    if (bodiesSignature(listBodies(doc)) !== this.drawnBodies) {
      this.render();
      return;
    }
    this.markBase(doc);
    // Q1: a nova acabou de ser aberta — o desenho inteiro, com o campo de nome.
    if (this.waitingBorn !== null && doc.animation === this.waitingBorn) {
      this.render();
      return;
    }
    const agora = this.shapeNow(doc);
    switch (redrawPlan(change.kind, this.drawn, agora)) {
      case 'nada':
        return;
      case 'so-escolha':
        this.markPicked(agora.picked);
        this.drawn = agora;
        return;
      default:
        this.render();
    }
  }

  /** A assinatura do que a lista mostraria agora. */
  private shapeNow(doc: EditorDoc): ListShape {
    const queued = transport.queued();
    return {
      rows: signature([
        ...listAnimations(doc.file)
          .map((row) => [row.name, formatTime(row.duration), row.loop, row.name === queued]),
        // As de fora entram na assinatura: sem isto, importar um arquivo não
        // refaria a lista, e a seção "De fora" só apareceria no desenho
        // seguinte, por outro motivo — um verde que não é verde (regra 21).
        ...listExternalAnimations(doc.file).map((row) => [row.uri, externalCount(row)]),
        // Reaproveitar: as compartilhadas, uma por animação, com a duração —
        // o dono mudou o andar, a lista do goblin muda junto.
        ...listShared(doc.file).map((row) => [row.uri, row.name, formatTime(row.duration)]),
        // Rodada 8b, C9: as entidades encaixadas, com as animações delas.
        ...[hostOfEntityView(doc), ...listEntityBases(doc)].filter((row) => row !== null).map((row) => [
          row.uri, row.slots.join(','), (row.animations ?? []).map((a) => a.name).join(','),
        ]),
      ]),
      picked: doc.animation,
    };
  }

  /**
   * A linha "Base — montar" acende quando a base está aberta — P33. É a
   * resposta, à vista, para "onde estou": na base, ou numa animação.
   */
  private markBase(doc: EditorDoc): void {
    const foco = listBodies(doc).find((row) => row.focused)?.uri ?? null;
    const um = this.bodyButtons.size === 1;
    for (const [uri, node] of this.bodyButtons) {
      const naBase = uri === foco && doc.animation === null;
      node.classList.toggle('anim-base-aberta', naBase);
      // Um corpo só: aceso quer dizer "estou montando". Aceso com uma animação
      // aberta mentia sobre onde se está — medido na foto do lote 3.
      if (um) node.setAttribute('aria-selected', naBase ? 'true' : 'false');
    }
  }

  /** Troca só o realce. Nenhum nó nasce, nenhum nó morre. */
  private markPicked(picked: string | null): void {
    for (const [name, node] of this.buttons) {
      node.setAttribute('aria-selected', name === picked ? 'true' : 'false');
    }
  }

  unmount(): void {
    for (const forget of this.forgetActions) forget();
    this.forgetActions = [];
    this.stopTransport?.();
    this.stopTransport = null;
    transport.forget();
    this.doc = null;
    this.list = null;
    this.tiraDeFora = null;
    this.deFora = null;
  }

  // -------------------------------------------------------------------------
  // Buttons
  // -------------------------------------------------------------------------

  /*
   * **Abrir a base** (`openBase`) mora em `animations-actions.ts`. O
   * `toggleMode` saiu com o interruptor, no degrau 11.
   */

  /**
   * Abre uma animação. A agulha volta a zero, e o tocador **segue tocando** se
   * já estava tocando — anotação 6. A conta está em `openAnimation`.
   */
  private open(doc: EditorDoc, name: string): void {
    openAnimation(doc, name);
    // Só o realce, quando a lista é a mesma — lote 3 do chat G. Refazer a
    // lista no primeiro clique (e rolar até a aberta) punha OUTRA linha debaixo
    // do segundo clique, e o duplo clique renomeava a vizinha. Medido na foto.
    this.refresh({ kind: 'time' });
  }

  /**
   * **Usar animações de outro boneco…** (reaproveitar, 04/11/2026). Era a
   * Biblioteca de fábrica; as quatro continuam lá, como a primeira fonte da
   * janela ("Esqueleto padrão"). A Biblioteca antiga segue no menu.
   */
  private openLibrary(): void {
    const doc = this.doc;
    if (!doc) return;
    void useAnimations(doc).then(() => this.render());
  }

  /** A mesma animação nova do menu (`animations-actions.ts`), e a lista redesenhada. */
  private addAnimation(): void {
    const doc = this.doc;
    if (!doc) return;
    addAnimationNow(doc);
    this.render();
  }

  private duplicateAnimation(): void {
    const doc = this.doc;
    if (!doc || doc.animation === null) return;
    const command = new DuplicateAnimation(doc.file, doc.animation);
    doc.run(command);
    this.open(doc, command.name);
  }

  private deleteAnimation(): void {
    const doc = this.doc;
    if (!doc || doc.animation === null) return;
    transport.forget();
    doc.run(new DeleteAnimation(doc.animation));
    doc.animation = doc.file.animations?.[0]?.name ?? null;
    this.render();
  }

  /** Leva a aberta para o primeiro lugar. Já sendo a primeira, diz e não faz nada. */
  private moveToTop(): void {
    const doc = this.doc;
    if (!doc || doc.animation === null) return;
    if (doc.file.animations?.[0]?.name === doc.animation) {
      doc.notice(`${doc.animation} já é a primeira: é a que o jogo abre`);
      return;
    }
    doc.run(new MoveAnimationToTop(doc.animation));
    this.render();
  }

  /**
   * Renomear **na própria linha** — Q2/K14. Era uma janela do navegador, fora
   * do programa, que o Spriter e o Spine não têm: nos dois, o duplo clique no
   * nome abre o campo ali mesmo.
   */
  private renameAnimation(): void {
    const doc = this.doc;
    if (!doc || doc.animation === null) return;
    this.renaming = doc.animation;
    this.render();
  }

  /** Grava (ou não) o nome digitado, e diz o que fez — K2. */
  private finishRename(from: string, typed: string, save: boolean): void {
    const doc = this.doc;
    if (this.renaming !== from) return;
    this.renaming = null;
    const resposta = renameAnswer(from, typed, save);
    if (doc === null || resposta.kind === 'cancelar') {
      this.render();
      return;
    }
    const command = new RenameItem(doc.file, { kind: 'animation', from }, resposta.to);
    doc.run(command);
    if (doc.animation === from) doc.animation = command.to;
    // Depois de trocar o nome aberto: o documento acabou de escrever "Abriu a
    // animação", e quem renomeou não abriu nada.
    doc.notice(renamedNotice(from, command.to));
    this.render();
  }

  /** O campo de nome, no lugar do botão da linha — o mesmo gesto da Árvore. */
  private renameField(name: string): HTMLInputElement {
    const input = el('input', 'arvore-renomear anim-renomear') as HTMLInputElement;
    input.type = 'text';
    input.value = name;
    input.setAttribute('aria-label', `Novo nome da animação ${name}. Enter grava, Esc desiste`);
    input.title = 'Enter grava, Esc desiste';
    input.addEventListener('blur', () => this.finishRename(name, input.value, true));
    input.addEventListener('keydown', (event) => {
      // A tecla é tratada uma vez (regra 12): digitar um nome não toca a
      // animação no Espaço nem apaga nada no Delete.
      event.stopPropagation();
      if (event.key === 'Enter') { event.preventDefault(); this.finishRename(name, input.value, true); }
      if (event.key === 'Escape') { event.preventDefault(); this.finishRename(name, input.value, false); }
    });
    queueMicrotask(() => { input.focus(); input.select(); });
    return input;
  }

  /**
   * **O botão direito no nome** — Q3. Abre a animação (as ações valem na
   * aberta, como os ícones) e oferece o que os ícones fazem.
   */
  private openRowMenu(doc: EditorDoc, name: string, x: number, y: number): void {
    if (doc.animation !== name) this.open(doc, name);
    const run: Record<string, () => void> = {
      renomear: () => this.renameAnimation(),
      duplicar: () => this.duplicateAnimation(),
      topo: () => this.moveToTop(),
      exportar: () => { void exportAnimation(doc); },
      apagar: () => this.deleteAnimation(),
    };
    openFloatingMenu(x, y, animationRowMenu(doc.file, name).map((item) => ({
      label: item.label, hint: item.hint, enabled: item.enabled, run: run[item.id] ?? (() => undefined),
    })));
  }

  /**
   * **Salvar como base nova** — M9. Pergunta o nome e cria o corpo.
   *
   * O nome de fábrica é o do corpo do instante com o segundo no fim, porque é
   * isso que se está gravando: *"o homem em 0,50 s"*. Quem tem outro nome na
   * cabeça apaga e escreve.
   */
  private saveAsNewBase(): void {
    const doc = this.doc;
    if (doc === null) return;
    // Rodada 6: a pergunta mora em `askNewBase`, a mesma do menu Base.
    void askNewBase(doc).then(() => this.render());
  }

  /** **Rebaixar a entidade** — E2. Age no corpo escolhido que não é o foco. */
  private demoteBody(): void {
    const doc = this.doc;
    if (doc === null) return;
    const escolhido = this.picked ?? listBodies(doc).find((row) => row.focused)?.uri ?? null;
    if (escolhido === null) return;
    demoteBody(doc, escolhido);
    this.render();
  }

  // -------------------------------------------------------------------------
  // Drawing
  // -------------------------------------------------------------------------

  /**
   * A lista **Corpos** — M8. Uma linha por corpo, com o nome, quantas animações
   * ele tem, e o realce no que está em foco.
   */
  private renderBodies(doc: EditorDoc): void {
    const corpos = this.corpos;
    if (corpos === null) return;
    clear(corpos);
    this.bodyButtons = new Map();
    const rows = listBodies(doc);
    this.drawnBodies = bodiesSignature(rows);
    /*
     * "Base — montar" — decisão P33 e Q1. Com um corpo só a tira "Corpos" some
     * e o corpo vira UMA linha, com os dois botões dele ao lado: a caixa de
     * 68 px que não escolhia nada devolve a altura à lista de animações, e a
     * linha diz o que o clique faz — voltar a montar.
     */
    const many = showBodiesList(rows.length);
    if (this.tiraCorpos !== null) {
      this.tiraCorpos.hidden = !many;
      if (many) this.tiraCorpos.append(...this.bodyTools);
    }
    corpos.classList.toggle('anim-corpos-um', !many);
    for (const row of rows) {
      const item = el('li', 'anim-corpo-linha');
      const node = el('button', 'anim-corpo-item');
      node.type = 'button';
      const escolhido = row.uri === this.picked || (this.picked === null && row.focused);
      node.setAttribute('aria-selected', escolhido ? 'true' : 'false');
      if (row.focused) node.classList.add('anim-corpo-foco');
      node.title = bodyHint(row);
      node.setAttribute('aria-label', `${baseLineLabel(row.name, many)}. ${bodyHint(row)}`);
      node.dataset['corpo'] = row.uri;
      // Um corpo só: a conta mora na dica. "Base — montar 4" leria como nome.
      node.append(el('span', 'arvore-nome', baseLineLabel(row.name, many)));
      if (many) node.append(separador(), el('span', 'anim-corpo-conta', String(row.animations)));
      // Rodada 17: a base que nasceu de um slot marcado abre POR DENTRO, com o
      // boneco à vista — a mesma porta da linha "slot" (abria sozinha).
      const slotMarcado = !row.focused && isMarkedSlotBase(doc, row.uri);
      if (slotMarcado) node.title = `${row.name}: a imagem marcada como slot. Clique para montá-la por dentro, com o boneco à vista`;
      node.addEventListener('click', () => {
        this.picked = row.uri;
        if (slotMarcado) openEntityAnimation(doc, row.uri, null);
        else openBody(doc, row.uri);
        this.render();
      });
      this.bodyButtons.set(row.uri, node);
      item.append(node);
      if (!many && row.focused) item.append(...this.bodyTools);
      corpos.append(item);
    }
    this.markBase(doc);
    const foco = rows.find((row) => row.focused)?.name ?? '';
    if (this.tituloAnimacoes !== null) {
      // P33: o título é "Animações". O nome do corpo vai na dica, e na linha
      // de cima quando há mais de um.
      this.tituloAnimacoes.textContent = 'Animações';
      this.tituloAnimacoes.title = foco === '' ? 'As animações desta base' : `As animações de ${foco}`;
    }
  }

  private render(): void {
    const doc = this.doc;
    const list = this.list;
    if (!doc || !list) return;

    this.renderBodies(doc);
    clear(list);
    this.buttons = new Map();
    this.drawn = this.shapeNow(doc);
    const rows = listAnimations(doc.file);
    // Q1/K1: a que a Nova animação criou entra à vista, com o nome aberto.
    // Só ela: reabrir a pasta também faz a lista crescer (roteiro, passo 14).
    const nomes = rows.map((row) => row.name);
    const agora = renameAfter(this.drawingFor, this.waitingBorn, takeNameRequest(), doc.animation);
    this.drawingFor = 'structure';
    this.waitingBorn = agora.waiting;
    if (agora.renaming !== null) this.renaming = agora.renaming;
    if (this.renaming !== null && !nomes.includes(this.renaming)) this.renaming = null;
    if (rows.length === 0) {
      // Reaproveitar: com compartilhadas, "nenhuma animação" era mentira (regra 21).
      list.append(el('li', 'painel-aviso', listShared(doc.file).length > 0
        ? 'Nenhuma própria: as que ele toca estão em "Compartilhadas".'
        : 'Nenhuma animação ainda. Clique no + ao lado de "Animações".'));
    }
    // A que está aberta, para rolar a lista até ela no fim do desenho. Antes
    // disso a lista mostrava uma linha de cada vez e nunca andava: a barra de
    // estado dizia "Animando: walk" e na lista só aparecia "idle 2,00 s".
    let aberta: HTMLElement | null = null;
    for (const row of rows) {
      const item = el('li');
      const node = el('button', 'anim-item');
      node.type = 'button';
      const escolhida = row.name === doc.animation;
      if (escolhida) aberta = item;
      node.setAttribute('aria-selected', escolhida ? 'true' : 'false');
      // Rodada 47, lote 5b (notas do doc 86), nota 4: a linha diz o que é e o que o clique faz.
      node.title = `${row.name}: ${formatTime(row.duration)}${row.loop ? ', repete' : ''}. Clique abre a animação na linha do tempo`;
      node.append(
        el('span', 'arvore-nome', row.name),
        separador(),
        el('span', 'anim-duracao', formatTime(row.duration)),
      );
      // "repete" depois da duração, só leitura: dá para ver de relance quais
      // animações voltam ao começo, sem abrir uma por uma. Ligar é no tocador.
      if (row.loop) {
        const marca = el('span', 'anim-repete', 'repete');
        marca.title = 'Esta animação volta ao começo. Ligue e desligue no tocador (L)';
        node.append(marca);
      }
      // Lote 44: o sinal discreto da padrão, a primeira da lista. A palavra
      // "padrão" mora na dica, para não gastar a largura da linha.
      if (row.index === 0) {
        const padrao = el('span', 'anim-padrao', '★');
        padrao.setAttribute('aria-hidden', 'true');
        node.title = `${row.name} — padrão. ${TOPO_DICA}`;
        node.setAttribute('aria-description', 'padrão');
        node.prepend(padrao);
      }
      // Lote 46: a próxima, na fila de "terminar a atual antes".
      if (row.name === transport.queued()) {
        const proxima = el('span', 'anim-proxima', '⏭');
        proxima.title = PROXIMA_DICA;
        node.title = node.title === '' ? `${row.name} — ${PROXIMA_DICA}` : `${node.title} ${PROXIMA_DICA}`;
        node.append(proxima);
      }
      node.addEventListener('click', () => this.open(doc, row.name));
      // Q2: duplo clique renomeia ali mesmo — Spriter e Spine.
      node.addEventListener('dblclick', (event) => {
        event.preventDefault();
        if (doc.animation !== row.name) this.open(doc, row.name);
        this.renameAnimation();
      });
      // Q3: botão direito, o menu do que os ícones fazem.
      node.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.openRowMenu(doc, row.name, event.clientX, event.clientY);
      });
      this.buttons.set(row.name, node);
      if (this.renaming === row.name) {
        item.append(this.renameField(row.name));
      } else {
        item.append(node);
      }
      list.append(item);
    }
    this.renderEntities(doc, list);
    this.renderExternal(doc);
    // `block: 'nearest'` não mexe na lista quando o item já está visível.
    aberta?.scrollIntoView?.({ block: 'nearest' });
  }

  /**
   * **As entidades, como bases** — rodada 8b, C9.
   *
   * Na mesma lista que rola, logo abaixo das animações da base em foco: uma
   * linha com o nome da entidade (a "base" dela) e as animações dela embaixo,
   * recuadas. É o desenho do Humberto — *motosserra-base: parado, ativo*. O
   * clique no nome escolhe a entidade na cena; o clique numa animação dela é o
   * C10 (`openEntityAnimation`).
   */
  private renderEntities(doc: EditorDoc, list: HTMLElement): void {
    // C10: animando a espada por dentro, o herói aparece aqui, como a base de
    // onde ela saiu. Clicar numa animação dele é voltar.
    const host = hostOfEntityView(doc);
    if (host !== null) {
      const dica = `${host.name}: a base de onde esta entidade saiu. Clique numa animação `
        + `de ${host.name} para voltar a ela`;
      this.renderGroup(list, host, 'base', dica, () => returnToHost(doc, null),
        (anim) => returnToHost(doc, anim), (anim) => `${host.name}: ${anim}. Clique para voltar a ${host.name}`);
    }
    for (const row of listEntityBases(doc)) {
      // Rodada 9: o slot marcado é uma base com nome: o clique no nome abre a
      // base dele por dentro, com o boneco montado em volta.
      if (isSlotBaseRow(doc, row)) {
        this.renderGroup(list, row, 'slot', `${row.name}: a imagem marcada como slot. Clique para montar ${row.name} `
          + 'por dentro, com o boneco à vista; clique numa animação dela para animá-la',
        () => openEntityAnimation(doc, row.uri, null),
        (anim) => openEntityAnimation(doc, row.uri, anim),
        (anim) => `${row.name}: ${anim}. Clique para animar ${row.name} por dentro, com a cena montada à vista`);
        continue;
      }
      this.renderGroup(list, row, 'entidade', entityBaseHint(row), () => pickEntitySlots(doc, row.uri, row.slots),
        (anim) => openEntityAnimation(doc, row.uri, anim),
        (anim) => `${row.name}: ${anim}. Clique para animar ${row.name} por dentro, com a cena montada à vista`);
    }
  }

  /** Um grupo da lista: o nome (entidade, ou a base de onde ela saiu) e as animações embaixo. */
  private renderGroup(
    list: HTMLElement, row: EntityBaseRow, marca: string, dica: string, onName: () => void,
    onAnimation: (name: string) => void, animationHint: (name: string) => string,
  ): void {
    const cabeca = el('li', 'anim-entidade-linha');
    const node = el('button', 'anim-corpo-item anim-entidade-cabeca');
    node.type = 'button';
    node.title = dica;
    node.setAttribute('aria-label', `${row.name}, ${marca}. ${dica}`);
    node.dataset['entidade'] = row.uri;
    const conta = row.animations === null ? 'não aberta' : String(row.animations.length);
    node.append(
      el('span', 'arvore-nome', row.name),
      el('span', 'anim-entidade-marca', marca),
      separador(),
      el('span', 'anim-corpo-conta', conta),
    );
    node.addEventListener('click', onName);
    cabeca.append(node);
    list.append(cabeca);
    for (const anim of row.animations ?? []) {
      const item = el('li');
      const botao = el('button', 'anim-item anim-item-entidade');
      botao.type = 'button';
      botao.dataset['entidade'] = row.uri;
      botao.setAttribute('aria-selected', 'false');
      botao.title = animationHint(anim.name);
      botao.append(
        el('span', 'arvore-nome', anim.name),
        separador(),
        el('span', 'anim-duracao', formatTime(anim.duration)),
      );
      if (anim.loop) {
        const repete = el('span', 'anim-repete', 'repete');
        repete.title = `${anim.name} volta ao começo`;
        botao.append(repete);
      }
      botao.addEventListener('click', () => onAnimation(anim.name));
      item.append(botao);
      list.append(item);
    }
  }

  /**
   * **De fora** — uma linha por arquivo de `assets.animations` (2.8).
   *
   * Sem clique: as animações de fora não são deste arquivo, e abri-las aqui
   * pediria que o editor as carregasse, que é trabalho de quem lê, não de quem
   * edita. A linha diz o que o arquivo traz **quando o editor sabe**, e diz que
   * não sabe quando não sabe — nunca uma lista vazia que pareça uma importação
   * que não pegou (regra 21).
   */
  private renderExternal(doc: EditorDoc): void {
    const lista = this.deFora;
    const tira = this.tiraDeFora;
    if (lista === null || tira === null) return;
    // Reaproveitar (04/11/2026): uma linha por ANIMAÇÃO, com de onde ela vem,
    // e ela toca com um clique. Era uma linha por arquivo, sem clique, e a
    // compartilhada não tocava — o diagnóstico (b).
    const rows = listShared(doc.file, ownerOf(doc));
    clear(lista);
    const vazio = rows.length === 0;
    tira.hidden = vazio;
    lista.hidden = vazio;
    if (vazio) return;
    const projeto = projetoDe(doc);
    const nomeDe = (uri: string): string => projeto?.nameOf(uri) ?? uri;
    // Agrupadas por origem: a linha de cima diz DE ONDE e tem o "Abrir o
    // original"; embaixo, só os nomes — a coluna é estreita (1440×900).
    const origens = [...new Set(rows.map((r) => r.uri))];
    for (const uri of origens) {
      const doGrupo = rows.filter((r) => r.uri === uri);
      const primeira = doGrupo[0]!;
      const cab = el('li', 'anim-compartilhada-origem');
      cab.style.display = 'flex';
      cab.style.alignItems = 'center';
      cab.style.gap = '6px';
      cab.style.padding = '2px 8px';
      if (primeira.name === null) {
        const dica = `${uri}: este boneco cita o arquivo, e ele não foi achado na pasta do projeto. `
          + 'O jogo também não vai achar. Grave o arquivo ao lado do .bone, ou use Animações de outro boneco… de novo';
        cab.title = dica;
        cab.setAttribute('aria-label', dica);
        cab.append(el('span', 'arvore-nome', uri), el('span', 'anim-repete', 'não achado'));
        lista.append(cab);
        continue;
      }
      const de = sharedFrom(primeira, nomeDe);
      const rotulo = el('span', 'anim-duracao', `↗ ${de}`);
      rotulo.style.flex = '1 1 auto';
      rotulo.title = `Ligadas a ${uri}: mudam junto com o original`;
      const original = el('button', 'anim-original', 'Abrir o original') as HTMLButtonElement;
      original.type = 'button';
      original.title = primeira.owner !== null
        ? `Vai para ${nomeDe(primeira.owner)}, com a animação aberta. Mudou lá, muda em todos os que a usam ligada`
        : `Estas vêm de ${uri}: diz onde se muda`;
      original.setAttribute('aria-label', `Abrir o original ${de}`);
      original.addEventListener('click', () => {
        const aberta = doGrupo.find((r) => r.name === doc.animation)?.name ?? primeira.name!;
        openOriginal(doc, aberta, uri);
      });
      cab.append(rotulo, original);
      lista.append(cab);
      for (const row of doGrupo) {
        const nome = row.name!;
        const item = el('li');
        const botao = el('button', 'anim-item anim-item-fora');
        if (doc.animation === nome) botao.classList.add('is-active');
        const dica = `${nome}, ${de}: ligada, muda junto com o original. Clique para ver tocar aqui; `
          + 'para mudar, Abrir o original';
        botao.title = dica;
        botao.setAttribute('aria-label', `${nome} ${de}`);
        botao.append(el('span', 'arvore-nome', nome), separador(), el('span', 'anim-duracao', formatTime(row.duration)));
        if (row.loop) botao.append(el('span', 'anim-repete', 'repete'));
        botao.addEventListener('click', () => {
          openAnimation(doc, nome);
          doc.notice(`"${nome}" ${de}: compartilhada, só para ver aqui; para mudar, Abrir o original`);
        });
        item.append(botao);
        lista.append(item);
      }
    }
  }
}

/** O que a lista Corpos mostraria agora, em texto: uri, nome, contagem e foco. */
function bodiesSignature(rows: readonly BodyRow[]): string {
  return rows.map((row) => `${row.uri}|${row.name}|${row.animations}|${row.focused}`).join(' // ');
}

export const animationsPanel = new AnimationsPanel();
registerPanel(animationsPanel);
