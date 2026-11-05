/**
 * **O Guarda-roupa** — a janela da grade *peça × skin* (noite de 04/11/2026).
 *
 * As contas moram em `skins-wardrobe-model.ts`; aqui só se desenha e se chama
 * o comando (regra 8). O desenho de uso está em
 * `documentos/projeto do programa/noite/skins-o-desenho.md`.
 *
 * | Gesto | O que faz |
 * |:---|:---|
 * | mouse em cima de uma coluna | **prova** a skin na cena (não entra no desfazer) |
 * | clique numa casa | abre a escolha de imagem daquela peça naquela skin |
 * | **Vestir só esta** | a base e esta skin, nada mais |
 * | **Por cima** | liga esta skin no topo, junto com as vestidas |
 * | **Nova a partir desta** | uma cópia, com nome |
 * | **Levar…** | grava a skin num `.bone` só dela (para outro boneco) |
 *
 * A coluna em que se clica é a que muda, e ela passa a ser a vestida e a do
 * lápis: mudar uma roupa que não está na tela é pintar no escuro (I6).
 */

import { CanvasRenderer, Skeleton, smoothingFor } from '../../../runtime/src/index.js';
import type { AtlasPageData } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { el } from './dom.js';
import { askForm } from '../ui/dialog.js';
import { ensureProvisional } from '../io/folder-atlas.js';
import { folderImageNames } from '../io/project-folder.js';
import { thumbnailFor } from './thumbnails.js';
import { SwapSlotImage, paletteNames } from './palette-model.js';
import { SetSkinVerdict } from './skins-model.js';
import { editingSkinOf, setSkinStack, skinStackOf } from '../viewport/onion.js';
import {
  ChangeSkinStack, KeepSkinStack, addSkinNamed, exportSkin, importSkinFromDisk, proposedSkinName, wearSkin,
} from './skins-actions.js';
import { setEditingSkin } from '../viewport/onion.js';
import {
  WARDROBE_HELP, WARDROBE_NOTICES, skinStateLine, cellHint, cellText, chooserTitle, previewStack, toggleOnTopStack,
  DuplicateSkinNamed, wardrobeCell, wardrobeColumns, wardrobePieces, wearOnlyStack,
  type WardrobeCell, type WardrobeColumn, type WardrobePiece,
} from './skins-wardrobe-model.js';

/** Lado da miniatura de uma casa. */
const CELL = 44;
/** Lado da miniatura do boneco inteiro, no topo da coluna. */
const FIGURE = 80;
/** Lado do manequim, o boneco grande ao lado da grade. */
const MANNEQUIN = 220;

let open: Wardrobe | null = null;

/** `true` enquanto o Guarda-roupa está aberto. */
export function isWardrobeOpen(): boolean {
  return open !== null;
}

/**
 * Abre o Guarda-roupa (ou o traz de volta, se já estava aberto). `false` sem
 * janela de navegador — e o rodapé diz isso, em vez de calar (regra 21).
 */
export function openWardrobe(doc: EditorDoc): boolean {
  if (typeof document === 'undefined') {
    doc.notice('O Guarda-roupa é uma janela: precisa do editor aberto no navegador');
    return false;
  }
  if (open !== null) {
    open.render();
    return true;
  }
  open = new Wardrobe(doc);
  doc.notice('Guarda-roupa aberto: clique numa casa para trocar a peça naquela skin');
  return true;
}

/** Fecha, se estiver aberto. */
export function closeWardrobe(): void {
  open?.close();
}

class Wardrobe {
  private readonly fundo: HTMLElement;
  private readonly caixa: HTMLElement;
  private readonly grade: HTMLElement;
  private readonly escolha: HTMLElement;
  /** O boneco grande, à esquerda: mostra o vestido, ou a prova do mouse. */
  private readonly manequim: HTMLImageElement;
  private readonly manequimLegenda: HTMLElement;
  private readonly offDoc: () => void;
  /** A pilha de antes da prova; `null` quando não há prova na cena. */
  private provando: string[] | null = null;
  /** A casa escolhida, para a escolha de imagem embaixo. */
  private casa: { piece: WardrobePiece; skin: string } | null = null;
  private readonly onKey: (event: KeyboardEvent) => void;

  constructor(private readonly doc: EditorDoc) {
    this.fundo = el('div', 'guarda-roupa-fundo');
    this.caixa = el('div', 'guarda-roupa');
    this.caixa.setAttribute('role', 'dialog');
    this.caixa.setAttribute('aria-label', 'Guarda-roupa');

    const cabeca = el('div', 'guarda-roupa-cabeca');
    const titulo = el('h2', 'guarda-roupa-titulo', 'Guarda-roupa');
    titulo.title = 'Peça × skin: cada coluna é uma roupa';
    const fechar = this.botao('Fechar', 'Fecha o Guarda-roupa (Esc). O que mudou fica', () => this.close());
    fechar.classList.add('guarda-roupa-fechar');
    cabeca.append(titulo, fechar);

    const ajuda = el('p', 'guarda-roupa-ajuda', WARDROBE_HELP);
    const barra = el('div', 'guarda-roupa-barra');
    barra.append(
      this.botao('+ Nova skin', 'Uma skin nova, vazia: vira uma coluna, e você troca as peças nela', () => {
        void this.newSkin();
      }),
      this.botao('Trazer skin de fora…', 'Escolha o .bone da skin e, junto, as imagens dela', () => {
        this.stopPreview();
        void importSkinFromDisk(doc).then(() => this.render());
      }),
    );

    this.grade = el('div', 'guarda-roupa-grade');
    this.escolha = el('div', 'guarda-roupa-escolha');
    this.escolha.hidden = true;
    // O manequim dos jogos de roupa: o boneco grande ao lado da grade. A
    // janela cobre a cena, e a prova do mouse tem de aparecer em algum lugar.
    const lado = el('div', 'guarda-roupa-lado');
    this.manequim = el('img', 'guarda-roupa-manequim') as HTMLImageElement;
    this.manequim.width = MANNEQUIN;
    this.manequim.height = MANNEQUIN;
    this.manequim.alt = 'O boneco vestido';
    this.manequimLegenda = el('div', 'guarda-roupa-manequim-legenda');
    lado.append(this.manequim, this.manequimLegenda);
    const meio = el('div', 'guarda-roupa-meio');
    const direita = el('div', 'guarda-roupa-direita');
    direita.append(this.grade, this.escolha);
    meio.append(lado, direita);
    this.caixa.append(cabeca, ajuda, barra, meio);
    this.fundo.append(this.caixa);
    this.fundo.addEventListener('mousedown', (event) => {
      if (event.target === this.fundo) this.close();
    });
    this.onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // Uma pergunta aberta por cima (o nome da skin nova) fica com o Esc.
      if (document.querySelector('.dialog-veil') !== null) return;
      // Regra 12: a tecla é tratada uma vez.
      event.stopPropagation();
      event.preventDefault();
      if (!this.escolha.hidden) {
        this.casa = null;
        this.render();
        return;
      }
      this.close();
    };
    document.addEventListener('keydown', this.onKey, true);
    document.body.append(this.fundo);
    this.offDoc = doc.on((change) => {
      // O desfazer (Ctrl+Z) com a janela aberta: a grade acompanha. Só o que
      // muda a grade: tocar a animação não redesenha a janela a cada quadro.
      if (change.kind !== 'file' && change.kind !== 'structure' && change.kind !== 'assets') return;
      if (this.provando === null) this.render();
    });
    this.render();
  }

  close(): void {
    this.stopPreview();
    this.offDoc();
    document.removeEventListener('keydown', this.onKey, true);
    this.fundo.remove();
    if (open === this) open = null;
  }

  // -------------------------------------------------------------------------
  // A prova: o mouse na coluna veste na cena, sem passo de desfazer
  // -------------------------------------------------------------------------

  private startPreview(name: string): void {
    if (this.provando === null) this.provando = skinStackOf(this.doc);
    setSkinStack(this.doc, previewStack(name));
    this.drawMannequin(previewStack(name), name === 'default' ? 'Provando: só a base' : `Provando: ${name}`);
  }

  private stopPreview(): void {
    if (this.provando === null) return;
    const antes = this.provando;
    this.provando = null;
    setSkinStack(this.doc, antes);
    this.drawMannequin(antes, null);
  }

  /** O manequim com a pilha dada; `legenda` nula = o que está vestido de verdade. */
  private drawMannequin(stack: readonly string[], legenda: string | null): void {
    const url = figureOf(this.doc, stack, MANNEQUIN);
    if (url !== null) this.manequim.src = url;
    this.manequim.hidden = url === null;
    this.manequimLegenda.textContent = legenda ?? skinStateLine(stack, editingSkinOf(this.doc)).split(' · ')[0]!;
    this.manequimLegenda.classList.toggle('guarda-roupa-provando', legenda !== null);
  }

  // -------------------------------------------------------------------------
  // Desenhar
  // -------------------------------------------------------------------------

  private externals(): Array<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> {
    const daqui = new Set((this.doc.file.skins ?? []).map((s) => s.name));
    const out: Array<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> = [];
    for (const skin of this.doc.data?.skins ?? []) {
      if (daqui.has(skin.name)) continue;
      out.push({ name: skin.name, attachments: externalAttachments(skin, (this.doc.data?.slots ?? []).map((x) => x.name)) });
    }
    return out;
  }

  render(): void {
    const doc = this.doc;
    const grade = this.grade;
    grade.replaceChildren();
    const fora = this.externals();
    const pilha = this.provando ?? skinStackOf(doc);
    const colunas = wardrobeColumns(doc.file, pilha, editingSkinOf(doc), fora.map((s) => s.name));
    const pecas = wardrobePieces(doc.file);
    grade.style.gridTemplateColumns = `minmax(90px, auto) repeat(${colunas.length}, minmax(110px, 1fr))`;

    // A linha de cima: um canto vazio, e a cabeça de cada coluna.
    grade.append(el('div', 'guarda-roupa-canto', 'peça'));
    for (const coluna of colunas) grade.append(this.columnHead(coluna));

    if (pecas.length === 0) {
      const vazio = el('div', 'guarda-roupa-vazio', WARDROBE_NOTICES.noPieces);
      vazio.style.gridColumn = `1 / span ${colunas.length + 1}`;
      grade.append(vazio);
    }
    for (const piece of pecas) {
      const nome = el('div', 'guarda-roupa-peca', piece.slot);
      nome.title = `A peça ${piece.slot} (o desenho ${piece.placeholder})`;
      grade.append(nome);
      for (const coluna of colunas) {
        grade.append(this.cellButton(piece, coluna, wardrobeCell(doc.file, coluna.name, piece, fora)));
      }
    }
    this.renderChooser();
    if (this.provando === null) this.drawMannequin(pilha, null);
  }

  private columnHead(coluna: WardrobeColumn): HTMLElement {
    const head = el('div', 'guarda-roupa-coluna');
    head.dataset.pele = coluna.name;
    if (coluna.worn) head.classList.add('guarda-roupa-vestida');
    const nome = el('div', 'guarda-roupa-coluna-nome', coluna.isDefault ? 'base' : coluna.name);
    nome.title = coluna.isDefault
      ? 'A base (skin "default"): o que vale para todas, onde a roupa não troca'
      : `Skin "${coluna.name}"${coluna.external ? ' — vem de outro arquivo' : ''}`;
    head.append(nome);

    const figura = figureThumb(this.doc, coluna.name);
    if (figura !== null) {
      const img = el('img', 'guarda-roupa-figura') as HTMLImageElement;
      img.src = figura;
      img.width = FIGURE;
      img.height = FIGURE;
      img.alt = `O boneco com ${coluna.isDefault ? 'só a base' : `a skin ${coluna.name}`}`;
      head.append(img);
    }

    const estado = el('div', 'guarda-roupa-estado',
      coluna.worn ? (coluna.only ? '● vestida' : '● vestida, junto') : '○ guardada');
    head.append(estado);

    if (!coluna.only) {
      head.append(this.botao(coluna.isDefault ? 'Só a base' : 'Vestir só esta',
        coluna.isDefault
          ? 'Tira todas as skins: o boneco fica só com a base'
          : `Tira as outras e veste a skin "${coluna.name}" por cima da base`,
        () => this.wearOnly(coluna.name)));
    }
    if (!coluna.isDefault) {
      const rotulo = el('label', 'guarda-roupa-por-cima');
      const caixa = el('input') as HTMLInputElement;
      caixa.type = 'checkbox';
      caixa.checked = coluna.worn;
      rotulo.title = coluna.worn
        ? `Desmarque para tirar a skin "${coluna.name}"; as outras ficam`
        : `Marque para vestir a skin "${coluna.name}" por cima das que já estão: armadura + capa`;
      caixa.addEventListener('change', () => this.toggleOnTop(coluna.name));
      rotulo.append(caixa, document.createTextNode(' por cima'));
      head.append(rotulo);
    }
    // Os dois de baixo numa linha só: a cabeça da coluna não pode comer a grade.
    const par = el('div', 'guarda-roupa-par');
    if (!coluna.external) {
      par.append(this.botao('+ Cópia', `Nova a partir desta: uma cópia da skin "${coluna.name}", com outro nome, para mudar só o que quiser`,
        () => { void this.copyFrom(coluna.name); }));
    }
    if (!coluna.isDefault && !coluna.external) {
      par.append(this.botao('Levar…', `Levar: grava a skin "${coluna.name}" num .bone só dela, para usar noutro boneco`,
        () => { void this.exportOne(coluna.name); }));
    }
    if (par.childElementCount > 0) head.append(par);

    head.addEventListener('mouseenter', () => this.startPreview(coluna.name));
    head.addEventListener('mouseleave', () => this.stopPreview());
    return head;
  }

  private cellButton(piece: WardrobePiece, coluna: WardrobeColumn, cell: WardrobeCell): HTMLElement {
    const botao = el('button', `guarda-roupa-casa guarda-roupa-casa-${cell.kind}`) as HTMLButtonElement;
    botao.type = 'button';
    botao.dataset.peca = piece.slot;
    botao.dataset.pele = coluna.name;
    const dica = cellHint(cell, piece, coluna.name, coluna.external);
    botao.title = dica;
    botao.setAttribute('aria-label', `${piece.slot} em ${coluna.isDefault ? 'base' : coluna.name}: ${cellText(cell)}`);
    if (this.casa !== null && this.casa.piece.slot === piece.slot && this.casa.skin === coluna.name) {
      botao.classList.add('guarda-roupa-casa-escolhida');
    }
    if (cell.kind === 'imagem') {
      const url = thumbnailFor(this.doc, cell.image, CELL);
      if (url !== null) {
        const img = el('img') as HTMLImageElement;
        img.src = url;
        img.width = CELL;
        img.height = CELL;
        img.alt = '';
        botao.append(img);
      }
    }
    botao.append(el('span', 'guarda-roupa-casa-texto', cellText(cell)));
    botao.addEventListener('click', () => {
      if (coluna.external) {
        this.doc.notice(WARDROBE_NOTICES.external(coluna.name));
        return;
      }
      this.casa = { piece, skin: coluna.name };
      this.render();
    });
    return botao;
  }

  /** A escolha de imagem embaixo da grade: diz a peça E a skin (T3). */
  private renderChooser(): void {
    const box = this.escolha;
    box.replaceChildren();
    const casa = this.casa;
    box.hidden = casa === null;
    if (casa === null) return;
    const cabeca = el('div', 'guarda-roupa-escolha-cabeca');
    cabeca.append(el('strong', '', chooserTitle(casa.piece, casa.skin)));
    cabeca.append(this.botao('Cancelar', 'Fecha a escolha sem trocar nada (Esc)', () => {
      this.casa = null;
      this.render();
    }));
    box.append(cabeca);

    const lista = el('div', 'guarda-roupa-imagens');
    const nomes = paletteNames(
      this.doc.atlases.flatMap((atlas) => atlas.regions.map((region) => region.name)),
      folderImageNames(this.doc),
    );
    for (const nome of nomes) {
      const item = el('button', 'guarda-roupa-imagem') as HTMLButtonElement;
      item.type = 'button';
      item.title = `Pôr "${nome}" em ${casa.piece.slot}${casa.skin === 'default' ? ', na base' : `, na skin "${casa.skin}"`}`;
      const url = thumbnailFor(this.doc, nome, CELL);
      if (url !== null) {
        const img = el('img') as HTMLImageElement;
        img.src = url;
        img.width = CELL;
        img.height = CELL;
        img.alt = '';
        item.append(img);
      }
      item.append(el('span', 'guarda-roupa-casa-texto', nome));
      item.addEventListener('click', () => { void this.put(casa.piece, casa.skin, nome); });
      lista.append(item);
    }
    box.append(lista);

    if (casa.skin !== 'default') {
      const vereditos = el('div', 'guarda-roupa-vereditos');
      vereditos.append(
        this.botao('Igual à base', `A skin "${casa.skin}" deixa de mexer em ${casa.piece.slot}: vale a de baixo`,
          () => this.verdict(casa.piece, casa.skin, 'ignora')),
        this.botao('Esconder', `Com a skin "${casa.skin}" vestida, ${casa.piece.slot} não aparece`,
          () => this.verdict(casa.piece, casa.skin, 'esconde')),
      );
      box.append(vereditos);
    }
  }

  // -------------------------------------------------------------------------
  // Os gestos
  // -------------------------------------------------------------------------

  private wearOnly(name: string): void {
    this.stopPreview();
    this.doc.run(new ChangeSkinStack(WARDROBE_NOTICES.wearOnly(name), () => ({
      pilha: wearOnlyStack(name),
      lapis: name === 'default' ? null : name,
    })));
    this.doc.notice(WARDROBE_NOTICES.wearOnly(name));
    this.render();
  }

  private toggleOnTop(name: string): void {
    this.stopPreview();
    const liga = !skinStackOf(this.doc).includes(name);
    this.doc.run(new ChangeSkinStack(WARDROBE_NOTICES.onTop(name, liga), (view) => ({
      pilha: toggleOnTopStack(view.pilha, name),
      lapis: !liga && view.lapis === name ? null : view.lapis,
    })));
    this.doc.notice(WARDROBE_NOTICES.onTop(name, liga));
    this.render();
  }

  private async newSkin(): Promise<void> {
    this.stopPreview();
    const pedido = askForm({
      title: 'O nome da skin nova',
      lead: 'Um nome que diga a roupa: inverno, armadura, ferido.',
      fields: [{ id: 'nome', label: 'Nome', value: proposedSkinName(this.doc.file) }],
      yesLabel: 'Criar a skin',
      noLabel: 'Cancelar',
    });
    selectNameField();
    const resposta = await pedido;
    if (resposta === null || resposta === undefined) return;
    addSkinNamed(this.doc, resposta['nome'] ?? proposedSkinName(this.doc.file));
    this.render();
  }

  private async copyFrom(from: string): Promise<void> {
    this.stopPreview();
    const pedido = askForm({
      title: `Nova skin a partir de "${from === 'default' ? 'base' : from}"`,
      lead: 'Ela começa igual. Depois troque só as peças que mudam.',
      fields: [{ id: 'nome', label: 'Nome', value: `${from === 'default' ? 'roupa' : from}2` }],
      yesLabel: 'Criar a cópia',
      noLabel: 'Cancelar',
    });
    selectNameField();
    const resposta = await pedido;
    if (resposta === null || resposta === undefined) return;
    const command = new DuplicateSkinNamed(this.doc, from, resposta['nome'] ?? '');
    this.doc.run(new KeepSkinStack(command, (view) => wearSkin(command.name)(view)));
    this.doc.notice(`Skin "${command.name}" criada a partir de "${from}", vestida e com o lápis nela`);
    this.render();
  }

  private async exportOne(name: string): Promise<void> {
    this.stopPreview();
    // "Exportar skin" grava a do lápis: o lápis vai para ela antes.
    setEditingSkin(this.doc, name);
    await exportSkin(this.doc);
    this.render();
  }

  private async put(piece: WardrobePiece, skin: string, image: string): Promise<void> {
    this.stopPreview();
    const doc = this.doc;
    const origem = sourceSkinOf(doc, piece, skin);
    if (origem === null) {
      doc.notice(`${piece.slot} não tem desenho de imagem em skin nenhuma: não há o que trocar`);
      return;
    }
    if (!await ensureProvisional(doc, image)) {
      doc.notice(`"${image}" não está no atlas nem na pasta, ou o arquivo não abriu`);
      return;
    }
    const swap = new SwapSlotImage(piece.slot, image, origem, piece.placeholder, skin === origem ? undefined : skin);
    if (skin === 'default') doc.run(swap);
    else doc.run(new KeepSkinStack(swap, wearSkin(skin)));
    doc.notice(skin === 'default'
      ? `${piece.slot} agora mostra "${image}" na base`
      : `${piece.slot} agora mostra "${image}" na skin "${skin}", que está vestida`);
    this.casa = null;
    this.render();
  }

  private verdict(piece: WardrobePiece, skin: string, to: 'esconde' | 'ignora'): void {
    this.stopPreview();
    const command = new SetSkinVerdict(skin, [{ slot: piece.slot, attachment: piece.placeholder }], to);
    this.doc.run(new KeepSkinStack(command, wearSkin(skin)));
    this.doc.notice(to === 'esconde'
      ? `${piece.slot} escondida na skin "${skin}"`
      : `A skin "${skin}" deixa de mexer em ${piece.slot}: vale a de baixo`);
    this.casa = null;
    this.render();
  }

  private botao(texto: string, dica: string, acao: () => void): HTMLButtonElement {
    const b = el('button', 'guarda-roupa-botao', texto) as HTMLButtonElement;
    b.type = 'button';
    b.title = dica;
    b.addEventListener('click', acao);
    return b;
  }
}

/** O nome proposto vem selecionado: quem digita troca, e não emenda "skinferro". */
function selectNameField(): void {
  (document.querySelector('.dialog-box .dialog-form-campo') as HTMLInputElement | null)?.select();
}

/**
 * De onde vem o desenho que a troca copia: a própria skin, se ela já põe
 * imagem na peça; senão a base; senão a primeira skin que põe.
 */
function sourceSkinOf(doc: EditorDoc, piece: WardrobePiece, skin: string): string | null {
  const tem = (name: string): boolean => {
    const def = (doc.file.skins ?? []).find((s) => s.name === name)?.attachments?.[piece.slot]?.[piece.placeholder];
    return def !== undefined && def !== null;
  };
  if (tem(skin)) return skin;
  if (tem('default')) return 'default';
  return (doc.file.skins ?? []).find((s) => tem(s.name))?.name ?? null;
}

/**
 * Os anexos de uma skin de fora, no feitio do arquivo (só o que a grade lê).
 * O runtime guarda por ÍNDICE de slot; o nome vem de `data.slots`.
 */
function externalAttachments(
  skin: { attachments: Map<number, Map<string, unknown>> }, slotNames: readonly string[],
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [indice, porNome] of skin.attachments) {
    const slot = slotNames[indice];
    if (slot === undefined) continue;
    const linha: Record<string, unknown> = {};
    for (const [nome, att] of porNome) {
      const a = att as { type?: string; path?: string } | null;
      linha[nome] = a === null ? null : { type: a.type ?? 'region', path: a.path ?? nome };
    }
    out[slot] = linha;
  }
  return out;
}

/** O boneco inteiro, na pose de repouso, vestido só com `skin` (a base embaixo). */
function figureThumb(doc: EditorDoc, skin: string): string | null {
  return figureOf(doc, previewStack(skin), FIGURE);
}

/** O boneco inteiro, na pose de repouso, vestido com a pilha `stack`, num quadrado de `size`. */
function figureOf(doc: EditorDoc, stack: readonly string[], size: number): string | null {
  const FIGURE = size;
  const data = doc.data;
  if (data === null || typeof document === 'undefined') return null;
  let skeleton: Skeleton;
  try {
    skeleton = new Skeleton(data);
    skeleton.setSkinStack(stack.filter((n) => data.skins.some((s) => s.name === n)));
  } catch {
    return null;
  }
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform();
  const bounds = skeleton.getBounds();
  if (!(bounds.width > 0) || !(bounds.height > 0)) return null;
  const canvas = document.createElement('canvas');
  canvas.width = FIGURE;
  canvas.height = FIGURE;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;
  ctx.imageSmoothingEnabled = smoothingFor(doc.file.skeleton);
  const renderer = new CanvasRenderer(ctx, { images: (page: AtlasPageData) => doc.imageFor(page) });
  const zoom = Math.min(FIGURE / bounds.width, FIGURE / bounds.height) * 0.92;
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  ctx.setTransform(zoom, 0, 0, -zoom, FIGURE / 2 - cx * zoom, FIGURE / 2 + cy * zoom);
  try {
    renderer.draw(skeleton);
  } catch {
    return null;
  }
  try {
    return canvas.toDataURL();
  } catch {
    return null;
  }
}
