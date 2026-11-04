/**
 * Painel **Entidades** — degrau 5 (17/09/2026), tarefa 5.4, E15 e E16.
 *
 * A aba vizinha da Imagens, e pelo mesmo motivo: é de onde se **arrasta** a
 * peça para a cena. A Imagens tem os desenhos; esta tem os corpos inteiros que
 * entram como peça — a espada, o capacete, o piloto.
 *
 * **A miniatura é parada** (E16, veto do Humberto em 15/09). Ela é desenhada
 * uma vez, na pose de repouso da entidade, e fica. Uma fila de bonecos andando
 * ao lado da cena rouba o olho de quem está animando.
 *
 * O que sai daqui é o arrasto, com o uri dentro (`ENTITY_DRAG_TYPE`). Quem
 * recebe — a cena, criando slot e anexo `skeleton` no osso em que a peça foi
 * solta — é do degrau 7, tarefa 7.2.
 *
 * A conta está em `palette-entities-model.ts`, sem DOM, como manda a regra 8.
 */

import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { registerPanel } from '../contract.js';
import { clear, el, iconButton } from './dom.js';
import { closeFloatingMenu, openFloatingMenu } from '../ui/floating-menu.js';
import { askPick } from '../ui/dialog.js';
import type { FloatingItem } from '../ui/floating-menu.js';
import { Doc } from '../doc/document.js';
import { projetoDe } from '../doc/projeto.js';
import { promoteEntity } from './animations-actions.js';
import {
  ENTITY_DRAG_TYPE, NO_ENTITIES, entityFileMissing, entityHint, listEntities, shelfBaseHint, shelfData, shelfRows,
} from './palette-entities-model.js';
import type { EntityRow } from './palette-entities-model.js';
import {
  HIDE_OTHERS_TEXT, MONTAGEM_HINT, OTHER_LINES_HINT, PRATELEIRA_HINT, cardAnima, cardHint, cardTag, cardTree,
  dropOnSlot, emptyLineText, goUp, innerLineRefusal, putIntoProject, testLinkLabel, testLinks, whyNotIntoProject, lineHint, moveTest, slotsForUp, topOfChain, unplugUp,
  whyCannotGoUp, naCena, naCenaHint, otherLinesText, testPieces, toggleNaCena,
  treeSignature, unplug, whyCannotDrop,
  animaChoices, cardSkins, cardTitle, setTestAnima, skinChoices, testAllEqual, toggleTestSkin, whyNoCardAnima,
  cardMissing, foldedByDefault, trailOf, useTrail, compactFor, upSlotHint,
} from './entities-cards-model.js';
import type { EntityCard, SlotLine, TestGesture, TestLink } from './entities-cards-model.js';
import { entitySlots, entityShortName } from '../anim/entity-band.js';
import { setEntityAnimationAt } from './dopesheet-actions.js';
import { formatSeconds } from './dopesheet-model.js';
import { corpoDe } from '../contract.js';
import { boneFilesInFolder, projectFolder } from '../io/project-folder.js';
import { readOpenedFiles } from '../io/open-save.js';

// A miniatura mudou de casa no degrau 8: `entity-thumb.ts`, sem registro de
// painel, para a grade de imagens poder desenhar a mesma peça. Quem já
// importava daqui continua importando daqui.
import { ENTITY_THUMB, entityThumbnail } from './entity-thumb.js';

export { ENTITY_THUMB, entityThumbnail };

class EntitiesPanel implements Panel {
  readonly id = 'entidades';
  readonly title = 'Entidades';
  readonly listensTo = ['file', 'structure', 'assets'] as const;

  private doc: EditorDoc | null = null;
  /** O rolo da aba: a montagem em cima, a prateleira embaixo. */
  private list: HTMLElement | null = null;
  /** O que está desenhado agora, para não refazer a lista a cada mudança. */
  private drawn = '';
  /**
   * Lote 2: o cartão AQUI mostra uma linha por imagem ("+ N outras imagens"
   * aberto). Estado da aba, não do arquivo: é só o que está à vista.
   */
  private todas = false;
  /**
   * Lote 7: os cartões que ele abriu (ou dobrou) contra o padrão da tela, pela
   * chave `pai|slot|uri`. E o nível da trilha que está aberto, ou `null` = o AQUI.
   */
  private virados = new Set<string>();
  private nivel: string | null = null;
  /** A tela é baixa (1280×720): cartões dobrados e a trilha. */
  private compacto = false;

  mount(doc: EditorDoc, host: HTMLElement): void {
    this.doc = doc;
    clear(host);
    // `painel` traz as cores do tema; `imagens` traz o estilo da aba vizinha,
    // que é a mesma lista de miniaturas com nome embaixo.
    host.classList.add('painel', 'imagens', 'entidades');

    // Rodada 39, lote 1: um rolo só, com a montagem em cima e a prateleira
    // embaixo. A marca é a mesma: a árvore e a prateleira crescem com o
    // projeto, e a medição de altura (`medir-paineis.mjs`) as deixa rolar.
    const list = el('div', 'entidades-rolo');
    list.dataset.rolagem = 'lista';
    this.list = list;
    host.append(list);
    this.render();
    // Rodada 42, lote 2 (doc 42, defeito 2): diminuir a janela para 720 não
    // redesenhava a aba, e a trilha e as dobras só vinham com Ctrl+Z.
    globalThis.addEventListener?.('resize', this.onResize);
  }

  /** Redesenha só quando a janela cruza a altura da tela baixa. */
  private readonly onResize = (): void => {
    if (this.doc === null || typeof globalThis.innerHeight !== 'number') return;
    if (compactFor(globalThis.innerHeight) !== this.compacto) this.render();
  };

  refresh(_change: DocChange): void {
    const doc = this.doc;
    if (doc === null) return;
    if (signature(doc, this.todas) === this.drawn) return;
    this.render();
  }

  unmount(): void {
    closeFloatingMenu();
    globalThis.removeEventListener?.('resize', this.onResize);
    this.doc = null;
    this.list = null;
  }

  private render(): void {
    const doc = this.doc;
    const list = this.list;
    if (doc === null || list === null) return;
    clear(list);
    this.drawn = signature(doc, this.todas);

    // Lote 3: a barra de cima. Um botão por função que existe: só o Na cena,
    // por enquanto (o Pôr no projeto chega no lote 5).
    // `painel-barra mostra-nome`: a casa esconde a palavra do botão de ícone, e
    // esta barra a mostra (régua 3: ícone E palavra).
    const barra = el('div', 'entidades-barra painel-barra mostra-nome');
    const ligado = naCena(doc);
    const botao = iconButton('eye', 'Na cena', () => this.runGesture(doc, toggleNaCena(doc)));
    botao.classList.toggle('is-ativo', ligado);
    botao.setAttribute('aria-pressed', String(ligado));
    const dicaNaCena = naCenaHint(ligado, testPieces(doc));
    botao.title = dicaNaCena;
    botao.setAttribute('aria-label', dicaNaCena);
    barra.append(botao);
    // Lote 5: Pôr no projeto — grava a ligação de teste no arquivo aberto.
    const ligacoes = testLinks(doc);
    const gravar = iconButton('save', 'Pôr no projeto', () => { void chooseIntoProject(doc); });
    gravar.disabled = ligacoes.length === 0;
    const dicaGravar = ligacoes.length === 0
      ? 'Pôr no projeto: grava uma ligação de teste no arquivo aberto. Ainda não há ligação de teste'
      : `Pôr no projeto: grava uma ligação de teste no arquivo aberto (${ligacoes.length === 1 ? 'há 1' : `há ${ligacoes.length}`}). `
        + 'Vai para a base, e vale em todas as animações. Ctrl+Z volta a teste';
    gravar.title = dicaGravar;
    gravar.setAttribute('aria-label', dicaGravar);
    barra.append(gravar);
    list.append(barra);

    const montagem = el('section', 'entidades-montagem');
    // Rodada 42 (v32.1): a montagem e a prateleira rolam por dentro e crescem com
    // o projeto: são listas, como o rolo (a medição de altura as deixa rolar).
    // Rodada 47, lote 6: a Montagem não rola mais por dentro (quem rola é o rolo).
    montagem.setAttribute('aria-label', 'Montagem');
    const tituloM = el('h3', 'entidades-titulo', 'Montagem');
    tituloM.title = MONTAGEM_HINT;
    montagem.append(tituloM);
    // Lote 7: a tela baixa dobra os cartões e põe os de fora numa trilha.
    const altura = typeof globalThis.innerHeight === 'number' ? globalThis.innerHeight : 1080;
    this.compacto = compactFor(altura);
    const topo = cardTree(doc, { todas: this.todas }).topo;
    const trilha = trailOf(doc);
    if (trilha.length > 0 && useTrail(trilha.length - 1, altura)) {
      const aberto = trilha[trilha.length - 1]!;
      if (this.nivel === null || !trilha.includes(this.nivel)) this.nivel = aberto;
      montagem.append(this.buildTrail(trilha));
      montagem.append(this.buildCard(doc, cardAt(topo, this.nivel) ?? topo, null, null));
    } else {
      this.nivel = null;
      montagem.append(this.buildCard(doc, topo, null, null));
    }

    const prateleira = el('section', 'entidades-prateleira');
    prateleira.dataset['rolagem'] = 'lista';
    prateleira.setAttribute('aria-label', 'Prateleira');
    const tituloP = el('h3', 'entidades-titulo', 'Prateleira');
    tituloP.title = PRATELEIRA_HINT;
    tituloP.append(el('span', 'entidades-titulo-dica', 'arraste para um slot'));
    prateleira.append(tituloP);
    // Lote 2: soltar uma peça de teste na prateleira a desliga.
    this.acceptUnplug(doc, prateleira);
    const rows = shelfRows(doc);
    if (rows.length === 0) {
      prateleira.append(el('p', 'painel-aviso', NO_ENTITIES));
    } else {
      const grade = el('div', 'entidades-grade');
      grade.setAttribute('role', 'list');
      grade.setAttribute('aria-label', 'Entidades do projeto');
      for (const row of rows) grade.append(this.buildRow(doc, row));
      prateleira.append(grade);
    }
    list.append(montagem, prateleira);
  }

  /**
   * Um cartão: o nome e a palavra no topo, a linha do que ele toca, e as
   * linhas de slot, cada uma com o que está dentro dela. Caixa dentro de
   * caixa: o cartão de dentro mora na linha do slot.
   */
  private buildCard(doc: EditorDoc, card: EntityCard, pai: string | null, slot: string | null): HTMLElement {
    const node = el('div', `entidades-cartao entidades-cartao-${card.papel}`);
    node.dataset['entidade'] = card.uri;
    const dica = cardHint(card, pai, slot);
    node.setAttribute('aria-label', dica);
    const ligacao = card.ligacao;
    if (ligacao !== null) {
      // A peça de teste se arrasta: para outro slot muda, para a prateleira desliga.
      node.draggable = true;
      node.addEventListener('dragstart', (event) => {
        event.stopPropagation();
        event.dataTransfer?.setData(TEST_DRAG_TYPE, JSON.stringify({ host: ligacao.host, slot: ligacao.slot }));
        if (event.dataTransfer !== null) event.dataTransfer.effectAllowed = 'move';
        arrastando = ligacao.uri;
        // Nota b do doc 34: a linha precisa saber DE ONDE ele saiu, para o próprio slot ficar vermelho.
        arrastandoDe = { host: ligacao.host, slot: ligacao.slot };
      });
      node.addEventListener('dragend', () => { arrastando = null; arrastandoDe = null; });
      node.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openFloatingMenu(event.clientX, event.clientY, [{
          label: 'Desligar',
          hint: 'Tira a peça de teste deste slot. O arquivo não muda: ela nunca entrou nele',
          run: () => this.runGesture(doc, unplug(doc, ligacao.host, ligacao.slot)),
        }, intoProjectItem(doc, { kind: 'baixo', ligacao })], 'imagens-menu');
      });
    }

    const topo = el('div', 'entidades-cartao-topo');
    topo.title = dica;
    // Lote 7: na tela baixa o cartão nasce dobrado (só o nome e a palavra); o ▸ abre.
    const chave = `${pai ?? ''}|${slot ?? ''}|${card.uri}`;
    const dobravel = card.papel === 'teste' || card.papel === 'projeto';
    const dobrado = dobravel && foldedByDefault(card, this.compacto) !== this.virados.has(chave);
    if (dobravel && (this.compacto || this.virados.has(chave))) {
      const dobra = el('button', 'entidades-dobra', dobrado ? '▸' : '▾') as HTMLButtonElement;
      dobra.type = 'button';
      const dicaDobra = dobrado ? `Abrir o cartão de ${card.nome}` : `Dobrar o cartão de ${card.nome}: fica só o nome e a palavra`;
      dobra.title = dicaDobra;
      dobra.setAttribute('aria-label', dicaDobra);
      dobra.setAttribute('aria-expanded', String(!dobrado));
      dobra.addEventListener('click', (event) => {
        event.stopPropagation();
        if (this.virados.has(chave)) this.virados.delete(chave);
        else this.virados.add(chave);
        this.render();
      });
      topo.append(dobra);
    }
    const nome = el('span', 'entidades-cartao-nome', card.carregada ? cardTitle(card) : `? ${cardTitle(card)}`);
    topo.append(nome, el('span', 'entidades-cartao-palavra', cardTag(card)));
    node.append(topo);
    if (!card.carregada) node.classList.add('entidades-cartao-falta');
    const falta = cardMissing(card);
    if (falta !== null) node.append(el('div', 'entidades-cartao-falta-texto', falta));
    if (dobrado) {
      node.classList.add('entidades-cartao-dobrado');
      return node;
    }

    const anima = cardAnima(card);
    if (anima !== null && card.alvo === null) node.append(el('div', 'entidades-cartao-anima', anima));
    // Lote 6: no cartão que escolhe, "anima ▾" e "skins ▾" são botões de lista.
    if (anima !== null && card.alvo !== null) node.append(this.animaButton(doc, card, anima));
    const skins = cardSkins(card);
    if (skins !== null) node.append(this.skinsButton(doc, card, skins));
    if (card.iguais > 0 && card.ligacao !== null) {
      const ligacao = card.ligacao;
      const iguais = el('button', 'entidades-cartao-escolha entidades-cartao-iguais', `Trocar todas as iguais (${card.iguais})`) as HTMLButtonElement;
      iguais.type = 'button';
      iguais.title = `Trocar todas as iguais: põe ${card.nome} em teste nos ${card.iguais} slots que mostram a mesma imagem que ${ligacao.slot}, `
        + 'num passo só. Desligado até você clicar. O arquivo não muda';
      iguais.addEventListener('click', (event) => {
        event.stopPropagation();
        this.runGesture(doc, testAllEqual(doc, ligacao.host, ligacao.slot));
      });
      node.append(iguais);
    }
    if (card.corte !== null) node.append(el('div', 'entidades-cartao-corte', card.corte === 'volta' ? '… já está acima' : '… fundo demais'));
    // Lote 4: o cartão de FORA se arrasta até uma entidade da prateleira, e
    // entra nela (para cima). Só o de fora: é ele que fica dentro do novo.
    if (pai === null && (card.papel === 'aqui' || card.acima !== null)) {
      topo.draggable = true;
      topo.title = `${dica}. Arraste este cartão até uma entidade da prateleira para pô-lo dentro dela, em teste`;
      topo.addEventListener('dragstart', (event) => {
        event.stopPropagation();
        event.dataTransfer?.setData(UP_DRAG_TYPE, card.uri);
        if (event.dataTransfer !== null) event.dataTransfer.effectAllowed = 'link';
      });
    }
    const acima = card.acima;
    if (acima !== null) {
      node.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openFloatingMenu(event.clientX, event.clientY, [{
          label: 'Tirar de volta',
          hint: `${card.nome} deixa de ficar em volta (e o que estava em volta dele também). O arquivo não muda`,
          run: () => this.runGesture(doc, unplugUp(doc, acima.uri)),
        }, intoProjectItem(doc, { kind: 'cima', elo: acima })], 'imagens-menu');
      });
    }

    for (const line of card.linhas) node.append(this.buildLine(doc, line, card.nome));
    if (card.papel === 'aqui' && (card.outras > 0 || this.todas)) {
      // Um botão de verdade: abre e fecha as linhas de todas as imagens.
      const texto = this.todas ? HIDE_OTHERS_TEXT : otherLinesText(card.outras);
      const outras = el('button', 'entidades-linha entidades-linha-outras', texto) as HTMLButtonElement;
      outras.type = 'button';
      outras.title = this.todas ? 'Mostra de novo só os slots com entidade, com teste, ou marcados' : OTHER_LINES_HINT;
      outras.setAttribute('aria-expanded', String(this.todas));
      outras.addEventListener('click', () => {
        this.todas = !this.todas;
        this.render();
      });
      node.append(outras);
    }
    return node;
  }

  /** **anima ▾** — lote 6. A lista do que a peça toca; a de agora com ✓. */
  private animaButton(doc: EditorDoc, card: EntityCard, texto: string): HTMLElement {
    const botao = el('button', 'entidades-cartao-anima entidades-cartao-escolha', `${texto} ▾`) as HTMLButtonElement;
    botao.type = 'button';
    const porque = whyNoCardAnima(doc, card);
    const dica = porque ?? (card.alvo?.kind === 'projeto'
      ? `O que ${card.nome} toca: é a faixa dela. A escolha vira chave no instante da agulha, como o botão direito na faixa`
      : `O que ${card.nome} toca, em teste: parada, a de quem a recebe, ou uma animação dela. O arquivo não muda`);
    botao.title = dica;
    botao.setAttribute('aria-label', dica);
    botao.addEventListener('click', (event) => {
      event.stopPropagation();
      if (porque !== null) {
        doc.notice(porque);
        return;
      }
      const r = botao.getBoundingClientRect();
      openFloatingMenu(r.left, r.bottom, animaChoices(doc, card).map((c) => ({
        label: `${c.atual ? '✓ ' : ''}${c.label}`,
        hint: c.hint,
        run: () => { setCardAnima(doc, card, c.valor); },
      })), 'imagens-menu');
    });
    return botao;
  }

  /** **skins ▾** — lote 6. Liga e desliga uma skin de teste; a `default` fica por baixo. */
  private skinsButton(doc: EditorDoc, card: EntityCard, texto: string): HTMLElement {
    const botao = el('button', 'entidades-cartao-skins entidades-cartao-escolha', `${texto} ▾`) as HTMLButtonElement;
    botao.type = 'button';
    const dica = `As skins de ${card.nome}, em teste: ligue e desligue. A default fica sempre por baixo. O arquivo de ${card.nome} não muda`;
    botao.title = dica;
    botao.setAttribute('aria-label', dica);
    botao.addEventListener('click', (event) => {
      event.stopPropagation();
      const alvo = card.alvo;
      if (alvo === null) return;
      const r = botao.getBoundingClientRect();
      openFloatingMenu(r.left, r.bottom, skinChoices(card).map((c) => ({
        label: `${c.ligada ? '✓ ' : ''}${c.nome}`,
        hint: c.ligada ? `Tira a skin ${c.nome} de ${card.nome} (era teste)` : `Veste ${card.nome} com a skin ${c.nome}, em teste`,
        run: () => this.runGesture(doc, toggleTestSkin(doc, alvo, c.nome)),
      })), 'imagens-menu');
    });
    return botao;
  }

  /** **A trilha** — lote 7: `nave › mecha › heroi`; clicar num nome abre aquele nível. */
  private buildTrail(trilha: readonly string[]): HTMLElement {
    const nav = el('nav', 'entidades-trilha');
    nav.setAttribute('aria-label', 'Os níveis da montagem, de fora para dentro');
    trilha.forEach((uri, i) => {
      if (i > 0) nav.append(el('span', 'entidades-trilha-seta', '›'));
      const nome = uri.replace(/\.bone$/i, '').split(/[\\/]/).pop() ?? uri;
      const botao = el('button', 'entidades-trilha-nivel', i === trilha.length - 1 ? nome.toUpperCase() : nome) as HTMLButtonElement;
      botao.type = 'button';
      const atual = uri === this.nivel;
      botao.classList.toggle('is-ativo', atual);
      botao.setAttribute('aria-current', atual ? 'true' : 'false');
      const dica = i === trilha.length - 1
        ? `${nome}: o projeto aberto. Mostra só ele e o que está dentro dele`
        : `${nome}: em volta, em teste. Mostra este nível e o que está dentro dele`;
      botao.title = dica;
      botao.setAttribute('aria-label', dica);
      botao.addEventListener('click', () => {
        this.nivel = uri;
        this.render();
      });
      nav.append(botao);
    });
    return nav;
  }

  private buildLine(doc: EditorDoc, line: SlotLine, pai: string): HTMLElement {
    const node = el('div', line.marcado ? 'entidades-linha entidades-linha-marcada' : 'entidades-linha');
    if (line.semLugar) node.classList.add('entidades-linha-sem-lugar');
    node.dataset['slot'] = line.slot;
    const dica = lineHint(line);
    const nome = el('span', 'entidades-linha-slot', line.semLugar ? `sem lugar · ${line.slot}` : line.slot);
    nome.title = dica;
    node.append(nome);
    // Toda linha responde ao arrasto: a que não aceita fica vermelha e DIZ por
    // quê (nota da conferência da v30.1: a recusa calada parecia defeito).
    this.acceptDrop(doc, node, line.host, line.slot, pai);
    if (line.cartoes.length === 0) {
      const vazio = el('span', 'entidades-linha-vazia', emptyLineText(line));
      vazio.title = dica;
      node.append(vazio);
      return node;
    }
    const dentro = el('div', 'entidades-linha-dentro');
    for (const card of line.cartoes) dentro.append(this.buildCard(doc, card, pai, line.slot));
    node.append(dentro);
    return node;
  }

  /**
   * **A linha do slot recebe** — lote 2. A entidade da prateleira liga em
   * teste (ou troca a de teste que estava); a peça de teste de outra linha
   * muda de slot. A recusa (a volta sem fim, o slot vazio) é dita antes de
   * soltar, com a linha vermelha e o cursor de "não", e de novo no rodapé.
   */
  private acceptDrop(doc: EditorDoc, node: HTMLElement, host: string | null, slot: string, pai: string): void {
    /** Por que esta linha não recebe `uri` agora, ou `null` quando recebe. */
    const porque = (uri: string | null): string | null => {
      if (host === null) return innerLineRefusal(pai);
      if (uri === null) return null;
      return whyCannotDrop(doc, host, slot, uri, arrastandoDe === null || arrastandoDe.host !== host ? null : arrastandoDe.slot);
    };
    const carrega = (event: DragEvent): 'entidade' | 'teste' | null => {
      const tipos = [...(event.dataTransfer?.types ?? [])];
      if (tipos.includes(TEST_DRAG_TYPE)) return 'teste';
      if (tipos.includes(ENTITY_DRAG_TYPE)) return 'entidade';
      return null;
    };
    node.addEventListener('dragover', (event) => {
      const tipo = carrega(event);
      if (tipo === null) return;
      event.preventDefault();
      event.stopPropagation();
      const motivo = porque(arrastando);
      const recusa = motivo !== null;
      // Com o cursor de "não", o navegador nem solta: o porquê vai ao rodapé
      // JÁ no arrasto, uma vez por motivo (nota da v30.1: a recusa calada).
      sayRefusal(doc, motivo);
      node.classList.toggle('entidades-recusa', recusa);
      node.classList.toggle('entidades-alvo', !recusa);
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = recusa ? 'none' : tipo === 'teste' ? 'move' : 'copy';
    });
    node.addEventListener('dragleave', (event) => {
      if (event.relatedTarget instanceof Node && node.contains(event.relatedTarget)) return;
      node.classList.remove('entidades-alvo', 'entidades-recusa');
    });
    node.addEventListener('drop', (event) => {
      const tipo = carrega(event);
      node.classList.remove('entidades-alvo', 'entidades-recusa');
      if (tipo === null) return;
      event.preventDefault();
      event.stopPropagation();
      if (tipo === 'teste') {
        const de = readTestDrag(event);
        if (de === null) return;
        const recusa = porque(arrastando) ?? (de.host === host ? null : innerLineRefusal(pai));
        if (recusa !== null || host === null) {
          doc.notice(recusa ?? innerLineRefusal(pai));
          return;
        }
        if (de.slot === slot) {
          doc.notice(`A peça de teste já está no slot ${slot}: arraste-a até a linha de outro slot, ou para a prateleira`);
          return;
        }
        this.runGesture(doc, moveTest(doc, host, de.slot, slot));
        return;
      }
      const uri = event.dataTransfer?.getData(ENTITY_DRAG_TYPE) ?? '';
      if (uri === '') return;
      const recusa = porque(uri);
      if (recusa !== null || host === null) {
        doc.notice(recusa ?? innerLineRefusal(pai));
        return;
      }
      this.runGesture(doc, dropOnSlot(doc, host, slot, uri));
    });
  }

  /**
   * **A entidade da prateleira recebe o cartão de fora** — lote 4, ligar para
   * cima. Soltar o boneco no mecha pergunta em que slot do mecha ele entra; a
   * volta sem fim e o fundo demais ficam vermelhos já no arrasto.
   */
  private acceptUp(doc: EditorDoc, node: HTMLElement, uri: string): void {
    const leva = (event: DragEvent): boolean => [...(event.dataTransfer?.types ?? [])].includes(UP_DRAG_TYPE);
    node.addEventListener('dragover', (event) => {
      if (!leva(event)) return;
      event.preventDefault();
      event.stopPropagation();
      const motivo = whyCannotGoUp(doc, uri, null);
      const recusa = motivo !== null;
      sayRefusal(doc, motivo);
      node.classList.toggle('entidades-recusa', recusa);
      node.classList.toggle('entidades-alvo', !recusa);
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = recusa ? 'none' : 'link';
    });
    node.addEventListener('dragleave', (event) => {
      if (event.relatedTarget instanceof Node && node.contains(event.relatedTarget)) return;
      node.classList.remove('entidades-alvo', 'entidades-recusa');
    });
    node.addEventListener('drop', (event) => {
      node.classList.remove('entidades-alvo', 'entidades-recusa');
      if (!leva(event)) return;
      event.preventDefault();
      event.stopPropagation();
      void putProjectInside(doc, uri);
    });
  }

  /** A prateleira recebe a peça de teste de volta: Desligar. */
  private acceptUnplug(doc: EditorDoc, node: HTMLElement): void {
    const leva = (event: DragEvent): boolean => [...(event.dataTransfer?.types ?? [])].includes(TEST_DRAG_TYPE);
    node.addEventListener('dragover', (event) => {
      if (!leva(event)) return;
      event.preventDefault();
      event.stopPropagation();
      node.classList.add('entidades-alvo');
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'move';
    });
    node.addEventListener('dragleave', (event) => {
      if (event.relatedTarget instanceof Node && node.contains(event.relatedTarget)) return;
      node.classList.remove('entidades-alvo');
    });
    node.addEventListener('drop', (event) => {
      node.classList.remove('entidades-alvo');
      if (!leva(event)) return;
      event.preventDefault();
      event.stopPropagation();
      const de = readTestDrag(event);
      if (de !== null) this.runGesture(doc, unplug(doc, de.host, de.slot));
    });
  }

  /** Um gesto de teste: um passo de desfazer, e a frase no rodapé. */
  private runGesture(doc: EditorDoc, gesto: TestGesture | null): void {
    if (gesto === null) return;
    doc.run(gesto.command);
    doc.notice(gesto.frase);
  }

  private buildRow(doc: EditorDoc, row: EntityRow): HTMLElement {
    const node = el('div', 'imagens-linha');
    node.setAttribute('role', 'listitem');
    node.draggable = true;
    node.dataset['entidade'] = row.uri;
    this.acceptUp(doc, node, row.uri);

    const cova = el('div', 'imagens-mini');
    const data = shelfData(doc, row.uri);
    const url = data === null ? null : entityThumbnail(doc, data);
    if (url !== null) {
      const img = el('img') as HTMLImageElement;
      img.width = ENTITY_THUMB;
      img.height = ENTITY_THUMB;
      // A imagem é decoração: quem diz o nome é o texto embaixo dela.
      img.alt = '';
      img.src = url;
      cova.append(img);
    } else {
      // Sem esqueleto carregado não há desenho, e a linha diz isso em vez de
      // mostrar um quadrado cinza que parece uma peça (regra 21).
      cova.classList.add('entidades-sem-desenho');
      cova.textContent = '?';
    }

    const curto = row.uri.replace(/\.bone$/i, '').split(/[\\/]/).pop() ?? row.uri;
    const nome = el('span', 'imagens-nome', row.name === '' ? curto : row.name);
    const dica = row.base === true ? shelfBaseHint(row) : entityHint(row, url !== null);
    node.title = dica;
    node.setAttribute('aria-label', dica);
    if (row.aberta) node.classList.add('entidades-aberta');
    if (row.base === true) node.classList.add('entidades-base');

    node.addEventListener('dragstart', (event) => {
      event.dataTransfer?.setData(ENTITY_DRAG_TYPE, row.uri);
      // `text/plain` junto, para o arrasto valer em navegador que ignora um
      // tipo próprio — o mesmo que a aba Imagens faz.
      event.dataTransfer?.setData('text/plain', row.uri);
      if (event.dataTransfer !== null) event.dataTransfer.effectAllowed = 'copy';
      // O navegador não deixa ler o arrasto antes de soltar: a linha do slot
      // precisa saber QUEM vem para recusar a volta sem fim já no caminho.
      arrastando = row.uri;
      arrastandoDe = null;
    });
    node.addEventListener('dragend', () => { arrastando = null; });

    node.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      // A base já está em Bases: o único item do menu (Promover) não vale para ela.
      if (row.base !== true) this.openMenu(doc, row, event.clientX, event.clientY);
    });

    node.append(cova, nome);
    return node;
  }

  private openMenu(doc: EditorDoc, row: EntityRow, x: number, y: number): void {
    const items: FloatingItem[] = [{
      label: 'Promover a base',
      hint: 'Ela passa para a lista Bases, na janela Animação, com as bases e as '
        + 'animações dela. Nada muda no arquivo',
      run: () => { void this.promote(doc, row); },
    }];
    openFloatingMenu(x, y, items, 'imagens-menu');
  }

  /**
   * **Promover a corpo** — E2, tarefa 5.3, a metade que é da tela.
   *
   * Três caminhos, nesta ordem: o arquivo guardado de um corpo rebaixado nesta
   * sessão (instantâneo, nada se perde); o `.bone` lido da raiz da pasta do
   * projeto; e, sem nenhum dos dois, a recusa **escrita** — uma entidade que
   * veio montada dentro de outro arquivo é um esqueleto pronto, não um `.bone`
   * que se possa abrir e editar.
   */
  private async promote(doc: EditorDoc, row: EntityRow): Promise<void> {
    // Rodada 6: a conta mora em `promoteEntityRow`, a mesma do menu Entidades.
    await promoteEntityRow(doc, row);
    this.render();
  }
}

/**
 * **Promover a base** — a conta do botão direito da aba e do menu Entidades
 * (rodada 6). Três caminhos, nesta ordem: o arquivo guardado de um corpo
 * rebaixado nesta sessão; o `.bone` lido da raiz da pasta do projeto; e, sem
 * nenhum dos dois, a recusa **escrita**.
 */
export async function promoteEntityRow(doc: EditorDoc, row: EntityRow): Promise<void> {
  {
    const projeto = projetoDe(doc);
    if (projeto === null || row.aberta) {
      promoteEntity(doc, row.uri);
      return;
    }
    const folder = projectFolder(doc);
    const handle = folder?.handle ?? null;
    if (handle === null) {
      doc.notice(entityFileMissing(row.uri, folder?.name ?? null));
      return;
    }
    let lido: Doc | null = null;
    try {
      const found = await boneFilesInFolder(handle, row.uri);
      const opened = found === null ? null : await readOpenedFiles(found.files);
      if (opened !== null) {
        lido = new Doc(opened.file, {
          atlases: opened.atlases,
          images: opened.images,
          skeletons: opened.skeletons,
          path: row.uri,
          undo: projeto.undo,
        });
      }
    } catch (erro) {
      doc.notice(`Não deu para abrir ${row.uri}: ${erro instanceof Error ? erro.message : String(erro)}`);
      return;
    }
    if (lido === null) {
      doc.notice(entityFileMissing(row.uri, folder?.name ?? null));
      return;
    }
    promoteEntity(doc, row.uri, lido);
  }
}

/**
 * **O que a peça do cartão toca** — lote 6, o "anima ▾".
 *
 * | O cartão | O que grava |
 * |:---|:---|
 * | teste (para baixo ou para cima) | a escolha no manifesto: o arquivo não muda |
 * | projeto (gravada num slot do AQUI) | a chave na faixa dela, no instante da agulha (`setEntityAnimationAt`); `null` = livre |
 *
 * Devolve `false` com o porquê no rodapé.
 */
export function setCardAnima(doc: EditorDoc, card: EntityCard, valor: string | null): boolean {
  const porque = whyNoCardAnima(doc, card);
  const alvo = card.alvo;
  if (porque !== null || alvo === null) {
    doc.notice(porque ?? 'Este cartão não escolhe o que toca aqui');
    return false;
  }
  if (alvo.kind !== 'projeto') {
    const gesto = setTestAnima(doc, alvo, valor);
    if (gesto === null) {
      doc.notice(`${card.nome} já toca isso`);
      return false;
    }
    doc.run(gesto.command);
    doc.notice(gesto.frase);
    return true;
  }
  const entidade = entitySlots(corpoDe(doc).file).find((e) => e.slot === alvo.slot && e.uri === alvo.uri) ?? null;
  if (entidade === null) {
    doc.notice(`${card.nome} não está gravada no slot ${alvo.slot} deste arquivo`);
    return false;
  }
  setEntityAnimationAt(doc, entidade, valor);
  // "livre": a chave diz "nenhuma por cima" — quem escolhe é o jogo (spec 7.11).
  if (valor === null) doc.notice(`Ninguém manda em ${entityShortName(alvo.uri)}: o jogo escolhe, de ${formatSeconds(doc.time)} em diante`);
  return true;
}

/**
 * **Pôr o cartão de fora dentro de `uri`, em teste** — lote 4. O arrasto da
 * aba e o menu Entidades → Pôr dentro de… chamam esta conta. Pergunta o slot
 * (um só: entra direto), e diz no rodapé o que fez ou por que não fez.
 */
export async function putProjectInside(
  doc: EditorDoc, uri: string,
  ask: (slots: string[], nome: string) => Promise<string | null> = (slots, nome) => askUpSlot(doc, slots, nome),
): Promise<boolean> {
  const porque = whyCannotGoUp(doc, uri, null);
  if (porque !== null) {
    doc.notice(porque);
    return false;
  }
  const slots = slotsForUp(doc, uri);
  const slot = slots.length === 1 ? slots[0]! : await ask(slots, uri);
  if (slot === null) {
    doc.notice(`Nada mudou: nenhum slot de ${uri} foi escolhido`);
    return false;
  }
  const recusa = whyCannotGoUp(doc, uri, slot);
  if (recusa !== null) {
    doc.notice(recusa);
    return false;
  }
  const gesto = goUp(doc, uri, slot);
  doc.run(gesto.command);
  doc.notice(gesto.frase);
  return true;
}

/** A janela de escolher o slot, como a do "Este boneco". */
function askUpSlot(doc: EditorDoc, slots: string[], uri: string): Promise<string | null> {
  return askPick({
    title: `Em que slot de ${uri.replace(/\.bone$/i, '')} entra?`,
    placeholder: 'Qual slot?',
    search: (text) => slots
      .filter((nome) => nome.toLowerCase().includes(String(text).trim().toLowerCase()))
      .map((nome) => ({ id: nome, label: nome, hint: upSlotHint(doc, uri, nome) })),
  });
}

/** O cartão de fora agora, para a porta do menu. */
export { topOfChain };

/** O item "Pôr no projeto" do botão direito de um cartão de teste: aceso, ou cinza dizendo por quê. */
function intoProjectItem(doc: EditorDoc, link: TestLink): FloatingItem {
  const porque = whyNotIntoProject(doc, link);
  return {
    label: 'Pôr no projeto',
    hint: porque ?? 'Grava esta ligação no arquivo aberto: deixa de ser teste. Vai para a base. Ctrl+Z volta a teste',
    enabled: porque === null,
    run: () => { applyIntoProject(doc, link); },
  };
}

/** Grava a ligação; o rodapé diz o que fez, ou por que não fez. */
export function applyIntoProject(doc: EditorDoc, link: TestLink): boolean {
  const porque = whyNotIntoProject(doc, link);
  const gesto = porque === null ? putIntoProject(doc, link) : null;
  if (gesto === null) {
    doc.notice(porque ?? 'Nada mudou');
    return false;
  }
  corpoDe(doc).run(gesto.command);
  doc.notice(gesto.frase);
  return true;
}

/**
 * **Pôr no projeto** pela barra e pelo menu: uma ligação, grava; várias,
 * pergunta qual (a lista diz o que cada uma é).
 */
export async function chooseIntoProject(
  doc: EditorDoc, ask: (links: TestLink[]) => Promise<number | null> = (links) => askTestLink(doc, links),
): Promise<boolean> {
  const links = testLinks(doc);
  if (links.length === 0) {
    doc.notice('Não há ligação de teste para pôr no projeto. Arraste uma entidade da prateleira até a linha de um slot');
    return false;
  }
  const i = links.length === 1 ? 0 : await ask(links);
  if (i === null) {
    doc.notice('Nada mudou: nenhuma ligação foi escolhida');
    return false;
  }
  return applyIntoProject(doc, links[i]!);
}

function askTestLink(doc: EditorDoc, links: TestLink[]): Promise<number | null> {
  return askPick({
    title: 'Que ligação de teste vai para o projeto?',
    placeholder: 'Qual?',
    search: (text) => links
      .map((link, i) => ({ id: String(i), label: testLinkLabel(link), hint: whyNotIntoProject(doc, link) ?? '' }))
      .filter((item) => item.label.toLowerCase().includes(String(text).trim().toLowerCase())),
  }).then((id) => (id === null ? null : Number(id)));
}

/** O cartão de `uri` na cadeia de fora (o AQUI ou alguém em volta), descendo do topo. */
function cardAt(card: EntityCard, uri: string): EntityCard | null {
  if (card.uri === uri && (card.papel === 'aqui' || card.acima !== null)) return card;
  for (const line of card.linhas) {
    for (const dentro of line.cartoes) {
      const achado = cardAt(dentro, uri);
      if (achado !== null) return achado;
    }
  }
  return null;
}

/** O que a aba mostraria agora, em texto: a árvore e a prateleira. */
function signature(doc: EditorDoc, todas: boolean): string {
  const rows = shelfRows(doc).map((row) => `${row.uri}|${row.name}|${row.aberta}|${row.base === true}`).join(' // ');
  return `${treeSignature(cardTree(doc, { todas }))} ## ${rows} ## na cena ${naCena(doc)}`;
}

/**
 * O tipo que o arrasto de uma peça de TESTE carrega — lote 2. É outro, e não
 * o da entidade da prateleira: soltar a peça de teste muda ela de slot (ou a
 * desliga), e soltar a da prateleira liga uma nova.
 */
export const TEST_DRAG_TYPE = 'text/x-recorte-teste';

/** O tipo do arrasto do cartão de FORA (lote 4): ele entra numa entidade da prateleira. */
export const UP_DRAG_TYPE = 'text/x-recorte-para-cima';

/** A entidade da prateleira que está sendo arrastada agora, ou `null`. */
let arrastando: string | null = null;
/** De que slot saiu o cartão de TESTE que está sendo arrastado, ou `null` (nota b do doc 34). */
let arrastandoDe: { host: string; slot: string } | null = null;

/** O último porquê dito no rodapé durante um arrasto, para não repetir a cada movimento. */
let ultimaRecusa: string | null = null;

/** Diz a recusa no rodapé, uma vez por motivo; `null` limpa a memória. */
function sayRefusal(doc: EditorDoc, motivo: string | null): void {
  if (motivo === ultimaRecusa) return;
  ultimaRecusa = motivo;
  if (motivo !== null) doc.notice(motivo);
}

function readTestDrag(event: DragEvent): { host: string; slot: string } | null {
  try {
    const valor = JSON.parse(event.dataTransfer?.getData(TEST_DRAG_TYPE) ?? '') as { host?: unknown; slot?: unknown };
    return typeof valor.host === 'string' && typeof valor.slot === 'string' ? { host: valor.host, slot: valor.slot } : null;
  } catch {
    return null;
  }
}

export const entitiesPanel = new EntitiesPanel();
registerPanel(entitiesPanel);
