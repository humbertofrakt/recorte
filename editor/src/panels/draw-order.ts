/**
 * Painel **Ordem** — a ordem de desenho, sozinha (dono C), lote 16, rodada 3.
 *
 * No Spriter é a aba **Z-order**, ao lado de **Hierarchy**: uma lista plana, um
 * desenho por linha, miniatura grande, e arrastar muda quem fica na frente de
 * quem. Print de referência: `documentos/pesquisa/nova pesquisa/spriter/prints/
 * 06-ordem-z_203.jpg` — lista, miniatura à esquerda, nome à direita, a linha
 * escolhida em laranja, e **nenhuma frase de explicação**.
 *
 * **De cima para baixo, o de cima está na FRENTE** — anotação 8 do Humberto:
 * *"Ordem é de cima pra baixo, e você ainda colocou um texto kkkk. Muda isso."*
 * O array `slots` continua sendo a ordem de desenho (§4.3), com o primeiro
 * atrás; a lista é que passou a ser lida de trás para a frente, como em todo
 * programa de camadas. A frase que explicava o contrário saiu.
 *
 * **Só desenho entra** — anotação 9. Caixa, ponto, caminho e máscara não têm
 * imagem, e apareciam aqui como uma miniatura vazia: *"o que é isso?"*. Eles
 * ficam na Árvore, onde cada um tem a sua seção.
 *
 * **Pastas** — anotação 11: *"eu poderia pôr as peças da capa dentro de uma
 * pasta e mover todas de uma vez"*. O `slot.folder` já existe no formato e já
 * vem preenchido do importador de PSD; o que faltava era a tela.
 *
 * Nada aqui reimplementa a Árvore nem refaz a conta: as linhas vêm do
 * `draw-order-model.ts` e o arrasto de uma peça roda a MESMA `MoveSlot` da
 * Árvore, com o mesmo passo de desfazer.
 */

import type { EditorDoc, DocChange, Panel } from '../contract.js';
import { registerPanel, corpoDe, skeletonsDe } from '../contract.js';
import { aroundLines } from '../anim/entity-around.js';
import type { AroundLine } from '../anim/entity-around.js';
import { MoveSlot } from './tree-model.js';
import { clear, el, iconButton } from './dom.js';
import { thumbnailNode } from './thumbnails.js';
import { entityShownName } from './properties-model.js';
import { actionState, registerAction, runAction } from '../ui/actions.js';
import { askForm } from '../ui/dialog.js';
import { drawOrderTarget, keyCreatedNotice, roundTime } from '../anim/keying.js';
import {
  MoveFolder, MoveSlotKeepingFolders, folderMoveSays, ORDER_BUTTONS, PutInFolder, RenameFolder, TakeOutOfFolder, folderMembers, mergeOnRename,
  mergeWarning, movedCount, renameNotice,
  orderEntries, orderRowSelection, arrayZone, dropZone, insertIndex,
  baseOrder, drawOrderAt, keyedMoved, moveBlock, orderDirOfActions, orderSkins, orderTargets, runOrderChange, runOrderStep, drawOrderNow,
  orderPieces, orderPlaceSays,
  orderRowDetail, orderRowHint,
} from './draw-order-model.js';
import { actionsFor, isTyping, keyOf } from '../ui/keys.js';
import type { DropZone, OrderEntry, OrderFolder, OrderPiece } from './draw-order-model.js';
import { redrawPlan, signature } from './list-redraw.js';
import type { ListShape } from './list-redraw.js';

/** O tamanho da miniatura desta aba, em pixels. */
export const ORDER_THUMB = 40;

export { orderEntries, orderPieces, stepIndex } from './draw-order-model.js';

class DrawOrderPanel implements Panel {
  readonly id = 'ordem';
  readonly title = 'Ordem';
  // Lote 66: `time` e `transform` também — em Animando a lista é a ordem
  // posada do quadro de agora, e uma chave de ordem muda o que ela mostra. O
  // `redrawPlan` só refaz quando a lista muda de verdade.
  readonly listensTo = ['file', 'structure', 'selection', 'assets', 'transform', 'time'] as const;

  private doc: EditorDoc | null = null;
  private host: HTMLElement | null = null;
  /** Lote 66: quem uma chave tirou do lugar de montagem, para o losango. */
  private moved = new Set<string>();

  /** Ctrl + setas com o foco na aba, fora de uma linha — lote 66. A linha trata a sua e para. */
  private readonly orderKeys = (event: KeyboardEvent): void => {
    const doc = this.doc;
    // A tecla vem da tabela (`ui/keys.ts`, escopo `ordem`); o Alt não conta.
    const dir = isTyping(event.target) ? null : orderDirOfActions(actionsFor('ordem', keyOf(event, true)));
    if (doc === null || dir === null || orderTargets(corpoDe(doc).file, doc.selection).length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    runOrderStep(doc, dir);
  };
  private list: HTMLElement | null = null;
  /** O que está sendo arrastado: uma peça, ou uma pasta inteira. */
  private dragged: { kind: 'peca'; index: number } | { kind: 'pasta'; from: number; count: number }
  | null = null;
  /** As pastas fechadas. É estado de sessão: não vai para o arquivo. */
  private readonly collapsed = new Set<string>();
  private menu: HTMLElement | null = null;
  /** A barra dos seis botões — anotação 25, lote 35. */
  private toolbar: HTMLElement | null = null;
  private forget: Array<() => void> = [];
  /** O que está desenhado agora — anotação 16. Ver `refresh`. */
  private drawn: ListShape = { rows: '', picked: null };
  /** As linhas desenhadas, por nome, para trocar só o realce. */
  private rows = new Map<string, HTMLElement>();

  mount(doc: EditorDoc, host: HTMLElement): void {
    this.doc = doc;
    this.host = host;
    clear(host);
    // `painel` traz as cores do tema — lote 25. Sem ela, todo
    // `var(--painel-x, claro)` desta folha caía no valor de RESERVA, que é a
    // cor do tema claro: fundo branco de miniatura e texto cinza-escuro em
    // cima do escuro. A aba nasceu no lote 16, dois lotes antes do tema
    // escuro, e ninguém tinha olhado para ela de novo depois dele.
    host.classList.add('painel', 'ordem');

    // Sem frase de explicação: a lista já se lê como toda lista de camadas.
    this.list = el('div', 'ordem-lista');
    // A lista cresce com o arquivo, e por isso pode rolar: a prova
    // `medir-paineis.mjs` lê esta marca e deixa esta caixa em paz.
    this.list.dataset.rolagem = 'lista';
    this.list.setAttribute('role', 'list');
    // A barra vem ANTES da lista: ela é o que responde "e como eu mexo nisso?"
    // — anotação 25. Até o lote 35 a resposta era arrastar, ou uma tecla
    // escrita só na dica de cada linha.
    this.toolbar = this.buildToolbar();
    host.append(this.toolbar, this.list);
    host.addEventListener('keydown', this.orderKeys);
    // Rodada 43, lote 4: a aba escondida não rola; quando ela aparece (a altura
    // sai de zero), a lista vai até a peça escolhida.
    if (typeof ResizeObserver !== 'undefined') {
      let alta = false;
      new ResizeObserver(() => {
        const agora = (this.list?.clientHeight ?? 0) > 0;
        if (agora && !alta) this.scrollToPicked(true);
        alta = agora;
      }).observe(this.list);
    }

    for (const parar of this.forget) parar();
    // Lote A2: os quatro passos, tirar da pasta e copiar a ordem moram em
    // `draw-order-actions.ts`, registradas no arranque: valem com a aba
    // fechada, e os botões daqui chamam `runAction` com o mesmo nome. Nova
    // pasta fica aqui: ela pergunta o nome numa janela desta aba.
    this.forget = [
      registerAction('nova-pasta', {
        run: () => { void this.newFolder(); },
        enabled: () => this.pickedNames().length > 0,
      }),
    ];
    this.render();
  }

  /**
   * **Não refaz a lista quando ela não mudou** — a mesma regra do painel
   * Animações (anotação 16), pelo mesmo `redrawPlan`.
   *
   * Aqui o aviso que chega toda hora é `selection`, e não `time`: escolher um
   * osso na cena refazia vinte e três linhas com miniatura, e derrubava junto a
   * rolagem e a pasta que estava aberta. Trocar o realce basta.
   */
  refresh(change: DocChange): void {
    const doc = this.doc;
    if (doc === null) return;
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
    const ordem = this.currentOrder(doc);
    const movidas = this.movedNow(doc, ordem);
    const file = corpoDe(doc).file;
    // Rodada 8a: trocar imagem por entidade guarda o NOME do anexo; a linha
    // muda mesmo assim, e a assinatura tem de ver a entidade.
    const ent = (p: OrderPiece): string | null => (p.attachment === null ? null : entityShownName(file, p.name, p.attachment));
    const presas = this.aroundNow(doc);
    return {
      rows: signature([...presas.frente, ...presas.atras].map((l) => ['este-boneco', l.slot, l.side, l.count])) + '|'
        + signature(orderEntries(file, ordem).flatMap((entry) => (
        entry.kind === 'peca'
          ? [[entry.piece.name, entry.piece.attachment, entry.piece.faded, movidas.has(entry.piece.name), ent(entry.piece)]]
          : [
            [entry.folder, entry.pieces.length, entry.part, entry.parts],
            ...entry.pieces.map((p) => [p.name, p.attachment, p.faded, movidas.has(p.name), ent(p)]),
          ]
      ))),
      picked: doc.selection.slots[0] ?? doc.selection.attachments[0]?.slot ?? null,
    };
  }

  /** Lote 66: em Animando, a ordem posada do quadro de agora; em Montagem, o array (`undefined`). */
  private currentOrder(doc: EditorDoc): string[] | undefined {
    return drawOrderNow(doc);
  }

  /** Quem uma chave tirou do lugar de montagem. Vazio em Montagem. */
  private movedNow(doc: EditorDoc, ordem: readonly string[] | undefined): Set<string> {
    return ordem === undefined ? new Set() : keyedMoved(baseOrder(corpoDe(doc).file, orderSkins(doc)), ordem);
  }

  /** Troca só o realce. Nenhum nó nasce, nenhum nó morre. */
  private markPicked(picked: string | null): void {
    this.syncToolbar();
    for (const [name, node] of this.rows) {
      node.classList.toggle('ordem-linha-escolhida', name === picked);
    }
    // Rodada 43, lote 4: a escolha que veio da Árvore ou da cena aparece aqui.
    if (this.drawn !== null) this.drawn = { ...this.drawn, picked };
    this.scrollToPicked(false);
  }

  unmount(): void {
    for (const parar of this.forget) parar();
    this.forget = [];
    this.closeMenu();
    this.host?.removeEventListener('keydown', this.orderKeys);
    this.doc = null;
    this.host = null;
    this.list = null;
  }

  // -------------------------------------------------------------------------
  // Mover
  // -------------------------------------------------------------------------

  /**
   * Os seis botões da ordem de desenho — anotação 25, lote 35.
   *
   * Ícone com o nome na dica, como toda barra da casa. Eles chamam as MESMAS
   * ações do menu Esqueleto e do botão direito: uma função, um dono.
   */
  private buildToolbar(): HTMLElement {
    const barra = el('div', 'ordem-barra');
    barra.setAttribute('role', 'toolbar');
    barra.setAttribute('aria-label', 'Ordem de desenho');
    for (const item of ORDER_BUTTONS) {
      const botao = iconButton(item.icon, item.label, () => runAction(item.action));
      botao.dataset['acao'] = item.action;
      botao.title = `${item.label}${item.shortcut === undefined ? '' : ` (${item.shortcut})`}: ${item.hint}`;
      botao.setAttribute('aria-label', botao.title);
      barra.append(botao);
    }
    return barra;
  }

  /** Acende e apaga os botões conforme o que está escolhido. */
  private syncToolbar(): void {
    const barra = this.toolbar;
    if (barra === null) return;
    for (const botao of barra.querySelectorAll('button')) {
      const acao = (botao as HTMLButtonElement).dataset['acao'];
      if (acao === undefined) continue;
      (botao as HTMLButtonElement).disabled = !actionState(acao).enabled;
    }
  }

  /** Os slots escolhidos que existem no arquivo, na ordem do array. */
  private pickedNames(): string[] {
    const doc = this.doc;
    if (doc === null) return [];
    const escolhidos = new Set(doc.selection.slots);
    return (corpoDe(doc).file.slots ?? []).filter((slot) => escolhidos.has(slot.name)).map((s) => s.name);
  }

  /*
   * Frente, trás, frente de tudo, fundo de tudo e tirar da pasta moram em
   * `draw-order-actions.ts` desde o lote A2 (a conta é `runOrderStep`).
   */

  /** Pôr as peças escolhidas numa pasta nova, pela mesma janela do menu. */
  private async newFolder(): Promise<void> {
    const doc = this.doc;
    const nomes = this.pickedNames();
    if (doc === null || nomes.length === 0) return;
    await this.putInFolder(doc, nomes);
  }

  /**
   * Leva `count` linhas de `from` para `to` — o arrasto e a pasta. Em
   * Montagem, `MoveSlot` e `MoveFolder`, como sempre. Em Animando, a mesma
   * conta sobre a ordem posada, e a ordem nova vira chave (lote 66).
   */
  private applyMove(doc: EditorDoc, from: number, count: number, to: number): void {
    if (doc.animation === null) {
      // Rodada 47, lote 6 (doc 69; a nota do Diretor): a peça arrastada entra na pasta onde cai, ou sai da
      // sua — uma pasta nunca se parte por um arrasto. O rodapé diz.
      const antes = count === 1 ? (corpoDe(doc).file.slots ?? [])[from] : undefined;
      corpoDe(doc).run(count === 1 ? new MoveSlotKeepingFolders(from, to) : new MoveFolder(from, count, to));
      if (antes !== undefined) {
        const agora = (corpoDe(doc).file.slots ?? []).find((s) => s.name === antes.name);
        const dito = folderMoveSays(antes.name, antes.folder, agora?.folder);
        if (dito !== '') { doc.notice(dito); return; }
      }
      // Rodada 43, lote 4 (doc 51): o arrasto diz onde a peça ficou.
      if (count === 1) {
        const f = corpoDe(doc).file;
        const nomes = (f.slots ?? []).map((s) => s.name);
        const quem = nomes[to];
        if (quem !== undefined) doc.notice(orderPlaceSays(nomes, new Set(orderPieces(f).map((p) => p.name)), quem));
      }
      return;
    }
    const atual = drawOrderNow(doc) ?? [];
    const saida = runOrderChange(doc, moveBlock(atual, from, count, to), 'Mudar a ordem de desenho');
    if (saida === 'recusado') doc.notice(`A animação "${doc.animation}" não está no arquivo`);
    // P12: o arrasto que vira chave não dizia nada no rodapé.
    else if (saida === 'chave') doc.notice(keyCreatedNotice(drawOrderTarget(), roundTime(doc.time), doc.file));
  }

  /** Um passo da PASTA inteira, mantendo a ordem interna — anotação 11. */
  private stepFolder(folder: OrderFolder, paraFrente: boolean): void {
    const doc = this.doc;
    if (doc === null) return;
    const total = (corpoDe(doc).file.slots ?? []).length;
    const count = folder.to - folder.from + 1;
    const to = paraFrente ? folder.from + 1 : folder.from - 1;
    if (folder.from + count >= total + (paraFrente ? 0 : 1) && paraFrente) {
      doc.notice('A pasta já está na frente de tudo');
      return;
    }
    if (to < 0) {
      doc.notice('A pasta já está atrás de tudo');
      return;
    }
    this.applyMove(doc, folder.from, count, to);
  }

  // -------------------------------------------------------------------------
  // Desenhar
  // -------------------------------------------------------------------------

  private render(): void {
    const doc = this.doc;
    const list = this.list;
    if (doc === null || list === null) return;
    // Rodada 38, lote 4b (doc 33): o Ctrl+↓ só andava na primeira vez. O passo
    // redesenha a lista, a linha que tinha o foco morre, e o foco cai no corpo
    // da página: a segunda tecla não chegava a ninguém. Guardo quem tinha o foco
    // e o devolvo à linha nova do mesmo nome.
    const focada = list.contains(document.activeElement)
      ? [...this.rows].find(([, node]) => node === document.activeElement)?.[0] ?? null
      : null;
    // QA da noite (04/11/2026): a lista vazia no meio da montagem prendia a
    // rolagem em 0, e a linha andava debaixo do dedo. Guardada aqui, devolvida
    // depois de montar, antes do foco e da rolagem até a escolhida.
    const rolagem = list.scrollTop;
    clear(list);
    this.rows = new Map();
    this.drawn = this.shapeNow(doc);

    this.syncToolbar();
    const ordem = this.currentOrder(doc);
    this.moved = this.movedNow(doc, ordem);
    const entries = orderEntries(corpoDe(doc).file, ordem);
    if (entries.length === 0) {
      list.append(el('p', 'ordem-vazio',
        'Nenhum desenho ainda. Caixas, pontos e caminhos ficam na Árvore.'));
      return;
    }
    // Rodada 11: as metades das entidades em volta ("Este boneco", 7.11). A da
    // frente em cima de tudo, a de trás embaixo de tudo, presas: não se arrastam.
    const presas = this.aroundNow(doc);
    // Rodada 43, lote 4 (doc 51): a lista diz onde é a frente e onde é o fundo
    // — só a dica dos botões dizia que o de cima cobre os de baixo.
    const frente = el('div', 'ordem-ponta', 'frente');
    frente.title = 'A frente: o de cima cobre os de baixo';
    list.append(frente);
    for (const linha of presas.frente) list.append(this.buildPinned(linha));
    for (const entry of entries) {
      if (entry.kind === 'peca') list.append(this.buildPiece(doc, entry.piece, false));
      else list.append(this.buildFolder(doc, entry));
    }
    for (const linha of presas.atras) list.append(this.buildPinned(linha));
    const fundo = el('div', 'ordem-ponta', 'fundo');
    fundo.title = 'O fundo: o de baixo fica atrás de todos';
    list.append(fundo);
    list.scrollTop = rolagem;
    if (focada !== null) this.rows.get(focada)?.focus();
    this.scrollToPicked(false);
  }

  /** Rodada 43, lote 4: a última peça escolhida que a lista já mostrou. */
  private shownPicked: string | null = null;

  /**
   * **A lista rola até a peça escolhida** — rodada 43, lote 4 (doc `51`, `21`):
   * abrir a Ordem com uma peça escolhida a deixava 1.289 px abaixo, fora da
   * vista. Só quando a escolha muda (ou a aba aparece): rolar a cada desenho
   * brigaria com quem rola a lista à mão.
   */
  private scrollToPicked(force: boolean): void {
    const list = this.list;
    const picked = this.drawn?.picked ?? null;
    if (list === null || picked === null || list.offsetParent === null) return;
    if (!force && picked === this.shownPicked) return;
    this.shownPicked = picked;
    this.rows.get(picked)?.scrollIntoView({ block: 'nearest' });
  }

  /** As linhas presas do quadro de agora. */
  private aroundNow(doc: EditorDoc): { frente: AroundLine[]; atras: AroundLine[] } {
    const corpo = corpoDe(doc);
    return aroundLines(corpo.file, skeletonsDe(corpo), (slot) => doc.skeleton?.findSlot(slot)?.attachmentName);
  }

  /** Uma linha presa: o nome, o lado, o número, e a dica que explica. Não se arrasta. */
  private buildPinned(linha: AroundLine): HTMLElement {
    const row = el('div', `ordem-linha ordem-presa ordem-presa-${linha.side}`, linha.text);
    row.setAttribute('role', 'listitem');
    row.title = linha.hint;
    return row;
  }

  /**
   * Uma pasta: um cabeçalho dobrável e as peças dela por baixo.
   *
   * A pasta fechada ocupa **uma linha**, e é para isso que ela existe: a capa
   * de oito pedaços vira uma linha, e a lista volta a caber na tela.
   */
  private buildFolder(doc: EditorDoc, folder: OrderFolder): HTMLElement {
    const chave = `${folder.folder}#${folder.part}`;
    const fechada = this.collapsed.has(chave);
    const caixa = el('div', 'ordem-pasta');

    const cabeca = el('div', 'ordem-linha ordem-pasta-cabeca');
    cabeca.setAttribute('role', 'listitem');
    cabeca.tabIndex = 0;
    cabeca.draggable = true;

    const seta = el('span', 'ordem-seta', fechada ? '▸' : '▾');
    seta.setAttribute('aria-hidden', 'true');

    const primeira = folder.pieces[0];
    const cova = el('div', 'ordem-mini');
    // A pasta se mostra pela primeira peça dela. Sem peça nenhuma, o ícone de
    // imagem: uma pasta vazia continua sendo uma pasta, e a linha não fica oca.
    cova.append(primeira === undefined
      ? thumbnailNode(doc, '', null, ORDER_THUMB)
      : thumbnailNode(doc, primeira.name, primeira.attachment, ORDER_THUMB));

    const nomes = el('div', 'ordem-nomes');
    const rotulo = el('span', 'ordem-nome ordem-pasta-nome', folder.folder);
    const parte = folder.parts > 1 ? ` · pedaço ${folder.part} de ${folder.parts}` : '';
    nomes.append(rotulo, el('span', 'ordem-detalhe',
      `${folder.pieces.length} ${folder.pieces.length === 1 ? 'peça' : 'peças'}${parte}`));

    const dica = `Pasta ${folder.folder}, ${folder.pieces.length} peças. `
      + 'Arraste para mover todas juntas; Ctrl+↑ e Ctrl+↓ também. '
      + 'Duplo clique no nome renomeia';
    cabeca.title = dica;
    cabeca.setAttribute('aria-label', dica);
    cabeca.setAttribute('aria-expanded', String(!fechada));

    cabeca.addEventListener('click', () => {
      if (fechada) this.collapsed.delete(chave); else this.collapsed.add(chave);
      this.render();
    });
    rotulo.addEventListener('dblclick', (event) => {
      event.preventDefault();
      event.stopPropagation();
      void this.renameFolder(doc, folder.folder);
    });
    cabeca.addEventListener('keydown', (event) => {
      // A tecla vem da tabela (`ui/keys.ts`, escopo `ordem`, "foco na cabeça da pasta").
      const acoes = actionsFor('ordem', keyOf(event, true));
      const sobe = acoes.includes('local:pasta-sobe');
      if (!sobe && !acoes.includes('local:pasta-desce')) return;
      event.preventDefault();
      event.stopPropagation();
      this.stepFolder(folder, sobe);
    });
    cabeca.addEventListener('dragstart', (event) => {
      this.dragged = { kind: 'pasta', from: folder.from, count: folder.to - folder.from + 1 };
      event.dataTransfer?.setData('text/plain', folder.folder);
      if (event.dataTransfer !== null) event.dataTransfer.effectAllowed = 'move';
    });
    cabeca.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.openMenu(doc, folderMembers(corpoDe(doc).file, folder.folder), folder.folder,
        event.clientX, event.clientY);
    });
    this.wireDrop(doc, cabeca, folder.from);

    cabeca.append(seta, cova, nomes);
    caixa.append(cabeca);

    // A pasta quebrada: uma peça de fora caiu no meio dela, e a ordem de
    // desenho não é mais o que a pasta parece dizer. Avisar é o mínimo.
    if (folder.parts > 1 && folder.part === 1) {
      const aviso = el('div', 'ordem-quebrada');
      aviso.append(el('span', 'ordem-quebrada-texto',
        `A pasta ${folder.folder} está em ${folder.parts} pedaços: há peça de fora no meio dela.`));
      const juntar = el('button', 'ordem-juntar') as HTMLButtonElement;
      juntar.type = 'button';
      juntar.textContent = 'Juntar';
      juntar.title = `Põe as peças de ${folder.folder} lado a lado, na ordem em que já estão`;
      juntar.addEventListener('click', (event) => {
        event.stopPropagation();
        const nomes2 = folderMembers(corpoDe(doc).file, folder.folder);
        corpoDe(doc).run(new PutInFolder(nomes2, folder.folder));
        doc.notice(`Pasta ${folder.folder} juntada`);
      });
      aviso.append(juntar);
      caixa.append(aviso);
    }

    if (!fechada) {
      for (const piece of folder.pieces) caixa.append(this.buildPiece(doc, piece, true));
    }
    return caixa;
  }

  private buildPiece(doc: EditorDoc, row: OrderPiece, dentro: boolean): HTMLElement {
    const escolhido = doc.selection.slots.includes(row.name)
      || doc.selection.attachments.some((item) => item.slot === row.name);
    const classes = ['ordem-linha'];
    if (escolhido) classes.push('ordem-linha-escolhida');
    if (dentro) classes.push('ordem-linha-dentro');
    if (row.faded) classes.push('ordem-linha-apagada');
    const node = el('div', classes.join(' '));
    node.setAttribute('role', 'listitem');
    node.tabIndex = 0;
    node.draggable = true;
    node.dataset['indice'] = String(row.index);

    // Sequência, malha, esqueleto filho ou tipo sem imagem: quem decide o que
    // aparece aqui é o `thumbnailNode`, e ele nunca devolve caixa vazia —
    // anotação 18.
    const cova = el('div', 'ordem-mini');
    cova.append(thumbnailNode(doc, row.name, row.attachment, ORDER_THUMB));

    const nomes = el('div', 'ordem-nomes');
    // Um desenho que só existe noutra pele: ele tem ordem, só não tem imagem
    // agora. Some da lista seria pior — ninguém o reordenaria.
    // Rodada 8a, achado 3: o slot que mostra uma entidade diz o NOME dela. O
    // nome do anexo continua o da imagem que saiu ("face"), para as chaves.
    const entidade = row.attachment === null ? null : entityShownName(corpoDe(doc).file, row.name, row.attachment);
    const detalhe = row.faded
      ? 'sem imagem nesta skin'
      : entidade !== null ? `entidade ${entidade}` : (row.attachment ?? 'sem desenho');
    nomes.append(el('span', 'ordem-nome', row.name));
    // QA da noite (04/11): o detalhe só aparece quando não repete o nome.
    const detalheVisto = orderRowDetail(row.name, detalhe);
    if (detalheVisto !== null) nomes.append(el('span', 'ordem-detalhe', detalheVisto));
    // Lote 66: em Animando, a linha que uma chave tirou do lugar de montagem
    // ganha um losango pequeno, e a dica diz.
    const porChave = this.moved.has(row.name);
    if (porChave) nomes.append(el('span', 'ordem-losango', '◆'));

    const dica = `${orderRowHint(row.name, detalhe, row.bone)}. `
      + (porChave ? 'Mudou de lugar por chave nesta animação. ' : '')
      + 'Arraste para mudar a ordem; Ctrl+↑ e Ctrl+↓ uma casa, Ctrl+→ e Ctrl+← frente e fundo de tudo';
    node.title = dica;
    node.setAttribute('aria-label', dica);

    node.addEventListener('click', (event) => {
      event.stopPropagation();
      // QA da noite (04/11): quem clicou está apontando para a linha — ela
      // já está à vista, e rolar até ela a tirava de debaixo do dedo.
      this.shownPicked = row.name;
      doc.select(orderRowSelection(corpoDe(doc).file, row.name));
    });
    node.addEventListener('keydown', (event) => {
      const dir = orderDirOfActions(actionsFor('ordem', keyOf(event, true)));
      if (dir === null) return;
      event.preventDefault();
      event.stopPropagation();
      doc.select(orderRowSelection(corpoDe(doc).file, row.name));
      runOrderStep(doc, dir);
    });
    node.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const escolhidos = doc.selection.slots.includes(row.name)
        ? [...doc.selection.slots] : [row.name];
      this.openMenu(doc, escolhidos, row.folder, event.clientX, event.clientY);
    });
    node.addEventListener('dragstart', (event) => {
      this.dragged = { kind: 'peca', index: row.index };
      event.dataTransfer?.setData('text/plain', row.name);
      if (event.dataTransfer !== null) event.dataTransfer.effectAllowed = 'move';
    });
    this.wireDrop(doc, node, row.index, true);

    node.append(cova, nomes);
    this.rows.set(row.name, node);
    return node;
  }

  /**
   * Soltar em cima desta linha: leva a peça, ou a pasta inteira, para cá.
   *
   * Lote 50: com `zones`, o terço de cima e o de baixo **inserem** entre duas
   * linhas (uma linha laranja fina mostra onde), e só o terço do meio faz o
   * de sempre. A cabeça da pasta fica só com o do meio.
   */
  private wireDrop(doc: EditorDoc, node: HTMLElement, index: number, zones = false): void {
    const limpa = (): void => node.classList.remove('ordem-alvo', 'ordem-alvo-antes', 'ordem-alvo-depois');
    const zonaDe = (event: DragEvent): DropZone => {
      if (!zones) return 'em-cima';
      const box = node.getBoundingClientRect();
      return dropZone(event.clientY - box.top, box.height);
    };
    node.addEventListener('dragover', (event) => {
      if (this.dragged === null) return;
      event.preventDefault();
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'move';
      limpa();
      const zona = zonaDe(event);
      node.classList.add(zona === 'antes' ? 'ordem-alvo-antes' : zona === 'depois' ? 'ordem-alvo-depois' : 'ordem-alvo');
    });
    node.addEventListener('dragleave', limpa);
    node.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      limpa();
      const arrastado = this.dragged;
      this.dragged = null;
      if (arrastado === null) return;
      const zona = arrayZone(zonaDe(event));
      if (zona !== 'em-cima') {
        const total = corpoDe(doc).file.slots?.length ?? 0;
        const from = arrastado.kind === 'peca' ? arrastado.index : arrastado.from;
        const count = arrastado.kind === 'peca' ? 1 : arrastado.count;
        const to = insertIndex(from, index, zona, total, count);
        if (to === null) return;
        this.applyMove(doc, from, count, to);
        return;
      }
      if (arrastado.kind === 'peca') {
        if (arrastado.index === index) return;
        this.applyMove(doc, arrastado.index, 1, index);
        return;
      }
      const { from, count } = arrastado;
      if (index >= from && index < from + count) return;
      // Solta DEPOIS do alvo quando o bloco vem de trás, e antes quando vem da
      // frente: nos dois casos o bloco cai onde o dedo largou.
      const to = index > from ? index - count + 1 : index;
      this.applyMove(doc, from, count, to);
    });
  }

  // -------------------------------------------------------------------------
  // O botão direito
  // -------------------------------------------------------------------------

  private closeMenu(): void {
    this.menu?.remove();
    this.menu = null;
  }

  /** Pôr numa pasta, tirar da pasta. Nas peças e no cabeçalho da pasta. */
  private openMenu(
    doc: EditorDoc, names: readonly string[], folder: string | null, x: number, y: number,
  ): void {
    this.closeMenu();
    const menu = el('div', 'ordem-menu');
    menu.setAttribute('role', 'menu');
    menu.style.left = `${Math.round(x)}px`;
    menu.style.top = `${Math.round(y)}px`;

    const item = (label: string, hint: string, run: () => void): HTMLElement => {
      const botao = el('button', 'ordem-menu-item') as HTMLButtonElement;
      botao.type = 'button';
      botao.textContent = label;
      botao.title = hint;
      botao.setAttribute('role', 'menuitem');
      botao.addEventListener('click', () => {
        this.closeMenu();
        run();
      });
      return botao;
    };

    const quantas = names.length === 1 ? 'esta peça' : `estas ${names.length} peças`;
    menu.append(item('Pôr numa pasta…',
      `Grava a pasta em ${quantas} e as põe lado a lado na ordem de desenho`,
      () => { void this.putInFolder(doc, names); }));
    if (folder !== null) {
      menu.append(item('Tirar da pasta',
        'Tira a pasta do nome. A ordem de desenho não muda',
        () => {
          corpoDe(doc).run(new TakeOutOfFolder(names));
          doc.notice(names.length === 1 ? 'Peça fora da pasta' : `${names.length} peças fora da pasta`);
        }));
      menu.append(item('Renomear a pasta…',
        'Troca o nome em todas as peças dela',
        () => { void this.renameFolder(doc, folder); }));
    }

    const fora = (event: MouseEvent): void => {
      if (menu.contains(event.target as Node)) return;
      this.closeMenu();
      window.removeEventListener('pointerdown', fora, true);
    };
    window.addEventListener('pointerdown', fora, true);
    document.body.append(menu);
    this.menu = menu;
  }

  /**
   * "Pôr numa pasta…" — pede o nome, e **diz antes** quantas peças vão mudar
   * de lugar.
   *
   * Pôr numa pasta é um gesto de arrumação, mas ele mexe na ordem de desenho,
   * que é o que decide o que cobre o quê. Uma janela que só pede o nome
   * esconderia isso até o desenho mudar na cena.
   */
  private async putInFolder(doc: EditorDoc, names: readonly string[]): Promise<void> {
    const mexidas = movedCount(corpoDe(doc).file, names);
    const aviso = mexidas === 0
      ? 'Nenhuma peça muda de lugar: elas já são vizinhas.'
      : `${mexidas} ${mexidas === 1 ? 'peça muda' : 'peças mudam'} de lugar na ordem de desenho.`;
    const resposta = await askForm({
      title: 'Pôr numa pasta',
      lead: `${names.length} ${names.length === 1 ? 'peça escolhida' : 'peças escolhidas'}. `
        + 'A pasta só agrupa: a ordem de desenho continua sendo a da lista.',
      fields: [{ id: 'nome', label: 'Nome da pasta', value: '', hint: 'Exemplo: capa, braço direito' }],
      yesLabel: 'Pôr na pasta',
      preview: () => aviso,
    });
    const nome = resposta?.['nome']?.trim() ?? '';
    if (nome === '') return;
    corpoDe(doc).run(new PutInFolder(names, nome));
    doc.notice(mexidas === 0
      ? `Pasta ${nome} criada. Nada mudou de lugar`
      : `Pasta ${nome} criada. ${mexidas} ${mexidas === 1 ? 'peça mudou' : 'peças mudaram'} de lugar`);
  }

  private async renameFolder(doc: EditorDoc, folder: string): Promise<void> {
    const resposta = await askForm({
      title: 'Renomear a pasta',
      lead: `Troca o nome em todas as peças de ${folder}.`,
      fields: [{ id: 'nome', label: 'Nome novo', value: folder }],
      yesLabel: 'Renomear',
      // O nome de outra pasta funde as duas: a janela diz ANTES, a cada letra.
      preview: (values) => mergeWarning(corpoDe(doc).file, folder, (values['nome'] ?? '').trim()),
    });
    const nome = resposta?.['nome']?.trim() ?? '';
    if (nome === '' || nome === folder) return;
    const fusao = mergeOnRename(corpoDe(doc).file, folder, nome);
    corpoDe(doc).run(new RenameFolder(folder, nome));
    doc.notice(renameNotice(folder, nome, fusao));
  }
}

export const drawOrderPanel = new DrawOrderPanel();
registerPanel(drawOrderPanel);

export type { OrderEntry, OrderFolder, OrderPiece };
