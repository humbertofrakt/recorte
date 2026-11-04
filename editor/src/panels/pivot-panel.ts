/**
 * Painel **Pivôs** — degrau 8, tarefa 8.5 (C4).
 *
 * Palavra do Humberto (RESPOSTAS lote 3, Q37): acertar e organizar o pivô de
 * umas trinta peças **rápido, "igual programa de edição"**, dentro do programa,
 * para quem não tem Photoshop. A pesquisa dos modos recomendou, e ele aprovou:
 * **painel**, não modo; **a pasta inteira em grade**, com a cruz em cada
 * miniatura; e **sem janela que tranca**.
 *
 * "Sem janela que tranca" é a regra desta tela inteira, e ela decide tudo:
 *
 * | Na janela Definir pivô… (lote 58) | Aqui |
 * |:---|:---|
 * | uma imagem por vez, e o resto do programa parado | a pasta inteira à vista |
 * | Gravar / Deixar como está | **cada clique já é um passo de desfazer** |
 * | fechar para ver a cena | a cena continua ali do lado, e se mexe junto |
 *
 * Por isso não há botão de gravar: o que grava é o clique, e o que desfaz é o
 * `Ctrl+Z` de sempre. A janela do lote 58 continua existindo para quem chega
 * por um caminho só (o botão direito numa imagem); ela não foi arrancada.
 *
 * O Spriter e o Spine põem o pivô na própria lista de imagens, nunca numa tela
 * à parte — foi o que a pesquisa achou nos dois, e é o que este painel faz.
 *
 * A conta é do `io/pivot-model.ts` e do `io/project-folder.ts`; aqui só há
 * desenho e gesto (regra 8).
 */

import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { corpoDe, registerPanel } from '../contract.js';
import { clear, el } from './dom.js';
import { thumbnailFor } from './thumbnails.js';
import { findAtlasRegion } from '../../../runtime/src/index.js';
import { shownFolderNames } from '../io/folder-save.js';
import {
  folderBitmap, folderImage, folderOf, folderPivotNotice, folderPivotPlan, folderSizeWarning,
  folderThumbnail, onFolderChange, projectFolder, readFolderPivots, sameFolderImages,
} from '../io/project-folder.js';
import { paletteNames } from './palette-model.js';
import { SetFolderPivotCommand, SetPivotCommand, atlasTreesOf } from '../io/pivot-atlas.js';
import {
  NINE_POINTS, imagesOf, ninePoint, pivotFromClick, pivotNotice, pivotStillTail, pivotUsers, readHandPivots, roundPivot,
} from '../io/pivot-model.js';

/** Rodada 13: o que a marca do pivô à mão diz, na dica da célula e da prévia. */
export const HAND_PIVOT_MARK =
  'Pivô à mão: o osso não está nele, e o desenho ficou parado. Imagens → Voltar o pivô para o osso desfaz';
import { NUDGE_HINT, PIVOT_NEXT_SWAP, nudgePivot, snapPivot } from './pivot-dialog.js';
import { PivotSizes } from './pivot-sizes.js';
import { targetOfSelection } from './image-picker.js';
import { swapPickFor } from './skins-model.js';

/** Lado da miniatura da grade, em pixels. Menor que a da aba Imagens: cabem mais. */
export const PIVOT_THUMB = 44;

/** O maior lado da prévia de cima, em pixels de tela. */
const PREVIEW_MAX = 110;

/** Onde fica, no navegador, a escolha do Repetir para a pasta. */
export const PIVOT_REPEAT_KEY = 'RECORTE_pivos_repetir';

/** A frase de quando não há imagem nenhuma para acertar. */
export const NO_PIVOT_IMAGES =
  'Nenhuma imagem. Abra a pasta do projeto (Arquivo → Abrir pasta do projeto…) ou solte PNGs na janela: '
  + 'aqui você acerta o pivô de todas de uma vez, sem sair da tela';

/** A dica da grade: o que o clique faz. */
export const PIVOT_GRID_HINT = 'Clique numa imagem para acertar o pivô dela em cima. '
  + 'Cada clique já vale, e o Ctrl+Z desfaz: não há nada para confirmar';

/**
 * **A imagem que o painel Pivôs mostra quando se escolhe algo** — rodada 13,
 * conserto 3 da conferência. A imagem do desenho escolhido na cena ou na
 * Árvore (a mesma leitura do Definir pivô…), ou `null` quando a escolha não é
 * uma imagem — e aí o painel fica onde estava.
 *
 * Já era assim na v27.3: o painel só olhava o próprio clique, e "pivô no
 * centro" mudava a imagem do painel (`body`) com a coxa escolhida na Árvore.
 */
export function pivotPanelPick(doc: EditorDoc): string | null {
  const alvo = targetOfSelection(doc);
  if (alvo === null) return null;
  const file = corpoDe(doc).file;
  // K8 da segunda conferência: a SEQUÊNCIA (a mão do herói) não é uma imagem
  // só — o `path` dela é um prefixo, não uma região, e o painel caía em `body`.
  // Vai para o primeiro quadro dela, que é uma imagem do atlas com pivô próprio.
  for (const skin of file.skins ?? []) {
    const def = (skin.attachments?.[alvo.slot] as Record<string, unknown> | undefined)?.[alvo.attachment];
    if (def === null || def === undefined || typeof def !== 'object') continue;
    const d = def as Record<string, unknown>;
    if ((d['type'] ?? 'region') === 'region' && d['sequence'] !== undefined) return imagesOf(alvo.attachment, d)[0] ?? null;
    break;
  }
  return swapPickFor(file, alvo.slot, alvo.attachment)?.from ?? null;
}

/**
 * K8 da segunda conferência: com um OSSO escolhido o painel fica na última
 * imagem, e diz que é ela — uma regra só. `true` quando a prévia mostra uma
 * imagem que não é a da escolha de agora.
 */
export function pivotPanelShowsLast(doc: EditorDoc): boolean {
  return pivotPanelPick(doc) === null
    && (doc.selection.bones.length > 0 || doc.selection.slots.length > 0 || doc.selection.attachments.length > 0);
}

/** O tamanho de uma imagem, em px dela. */
export interface PivotSize {
  name: string;
  width: number;
  height: number;
}

class PivotPanel implements Panel {
  readonly id = 'pivos';
  readonly title = 'Pivôs';
  // Rodada 13, conserto 3: `selection` também — escolher uma imagem na cena ou
  // na Árvore leva o painel para ela.
  readonly listensTo = ['file', 'structure', 'assets', 'selection'] as const;

  private doc: EditorDoc | null = null;
  private host: HTMLElement | null = null;
  /** A imagem que a prévia de cima mostra, ou `null`. */
  private chosen: string | null = null;
  /** Os tamanhos já lidos, por nome: a grade não relê o disco a cada desenho. */
  /**
   * Rodada 44, lote 0: o tamanho de cada imagem, pedido UMA vez. Era um mapa
   * sem marca de "a caminho": cada redesenho pedia de novo toda imagem não
   * lida, e cada resposta redesenhava — 105 leituras para 14 imagens, e a
   * página parada por minutos com a pasta `mao` (392×390).
   */
  private sizes = new PivotSizes(() => this.render());
  private stopFolder: (() => void) | null = null;
  /**
   * A prévia tinha o foco quando o painel se redesenhou — lote 3 da rodada
   * final. Cada seta grava e redesenha; sem devolver o foco, a segunda seta
   * já cairia fora do painel.
   */
  private keepFocus = false;

  mount(doc: EditorDoc, host: HTMLElement): void {
    this.doc = doc;
    this.host = host;
    clear(host);
    // `painel` traz as cores do tema; `imagens` traz o estilo da grade irmã.
    host.classList.add('painel', 'pivos');
    this.stopFolder?.();
    this.stopFolder = onFolderChange(() => this.render());
    // Rodada 13, conserto 3: abrir o painel com uma imagem escolhida mostra ela.
    this.lastSelection = JSON.stringify(doc.selection);
    this.chosen = pivotPanelPick(doc) ?? this.chosen;
    this.render();
  }

  refresh(change: DocChange): void {
    // O rodapé também chega como `selection` (`doc.notice`): só uma escolha
    // NOVA mexe na prévia. Sem isto, gravar o pivô de outra imagem do painel
    // (o rodapé) puxaria a prévia de volta para a da cena.
    if (change.kind === 'selection' && this.doc !== null) {
      const key = JSON.stringify(this.doc.selection);
      if (key !== this.lastSelection) {
        this.lastSelection = key;
        const image = pivotPanelPick(this.doc);
        if (image !== null) this.chosen = image;
      }
    }
    this.render();
  }

  /** A última escolha vista, para separar uma escolha nova de um rodapé. */
  private lastSelection = '';

  unmount(): void {
    this.stopFolder?.();
    this.stopFolder = null;
    this.doc = null;
    this.host = null;
  }

  /** Todo nome de imagem que o painel conhece: os dos atlas e os da pasta. */
  private allNames(doc: EditorDoc): string[] {
    const corpo = corpoDe(doc);
    const atlas: string[] = [];
    for (const tree of corpo.atlases) for (const region of tree.regions) atlas.push(region.name);
    return paletteNames(atlas, shownFolderNames(doc));
  }

  /** O pivô de uma imagem hoje, em px dela, ou `null` quando ainda não há. */
  private pivotOf(doc: EditorDoc, name: string): { x: number; y: number } | null {
    const region = findAtlasRegion(corpoDe(doc).atlases, name);
    if (region !== null) {
      if (region.pivotX === undefined && region.pivotY === undefined) return null;
      return { x: region.pivotX ?? region.originalWidth / 2, y: region.pivotY ?? region.originalHeight / 2 };
    }
    const saved = readFolderPivots(doc.file)[name];
    return saved === undefined ? null : { x: saved[0], y: saved[1] };
  }

  /** O tamanho de uma imagem, do atlas ou do arquivo; lê o disco só uma vez. */
  private sizeOf(doc: EditorDoc, name: string): PivotSize | null {
    const known = this.sizes.get(name);
    if (known !== undefined) return known;
    const region = findAtlasRegion(corpoDe(doc).atlases, name);
    if (region !== null) {
      return this.sizes.set({ name, width: region.originalWidth, height: region.originalHeight });
    }
    const own = folderImage(doc, name);
    if (own === null) return null;
    if (own.width !== undefined && own.height !== undefined) {
      return this.sizes.set({ name, width: own.width, height: own.height });
    }
    // Ainda não lida: pede os pixels UMA vez; as respostas de uma leva pedem
    // um redesenho só (rodada 44, lote 0).
    return this.sizes.request(name, () => folderBitmap(own));
  }

  /** `true` quando o Repetir para a pasta está ligado. */
  private repeats(): boolean {
    try {
      return globalThis.localStorage?.getItem(PIVOT_REPEAT_KEY) === 'sim';
    } catch {
      return false;
    }
  }

  private setRepeats(value: boolean): void {
    try {
      globalThis.localStorage?.setItem(PIVOT_REPEAT_KEY, value ? 'sim' : 'nao');
    } catch {
      // Sem armazenamento, a escolha vale até recarregar.
    }
  }

  /**
   * Grava o pivô — **o clique já é o passo de desfazer**, que é o ponto deste
   * painel. Com o Repetir ligado, a pasta inteira no mesmo passo.
   */
  private setPivot(doc: EditorDoc, image: string, pivot: { x: number; y: number }): void {
    const corpo = corpoDe(doc);
    const irmas = sameFolderImages(this.allNames(doc), image);
    if (this.repeats() && irmas.length > 1) {
      const sizes = irmas.map((name) => this.sizeOf(doc, name)).filter((size): size is PivotSize => size !== null);
      const command = new SetFolderPivotCommand(folderPivotPlan(sizes, image, pivot));
      corpo.run(command);
      doc.notice(folderPivotNotice(folderOf(image), command.count, command.moved) + pivotStillTail(command));
      this.render();
      return;
    }
    if (findAtlasRegion(corpo.atlases, image) === null) {
      corpo.run(new SetFolderPivotCommand([{ name: image, x: pivot.x, y: pivot.y }], 'Definir pivô'));
      doc.notice(`${pivotNotice(image, pivot, 0)}. Guardado para quando ela entrar na cena`);
      this.render();
      return;
    }
    const command = new SetPivotCommand(image, pivot);
    corpo.run(command);
    doc.notice(`${pivotNotice(image, pivot, command.moved, command)}${PIVOT_NEXT_SWAP}`);
    this.render();
  }

  private render(): void {
    const doc = this.doc;
    const host = this.host;
    if (doc === null || host === null) return;
    // A prévia com o foco o recebe de volta: uma seta grava, e o gravar
    // redesenha o painel mais de uma vez (o clique e o aviso do documento).
    const refocus = this.keepFocus
      || globalThis.document?.activeElement?.classList.contains('pivos-quadro') === true;
    this.keepFocus = false;
    clear(host);

    const nomes = this.allNames(doc);
    if (nomes.length === 0) {
      host.append(el('p', 'painel-aviso', NO_PIVOT_IMAGES));
      return;
    }
    if (this.chosen === null || !nomes.includes(this.chosen)) this.chosen = nomes[0]!;

    host.append(this.buildPreview(doc, this.chosen));
    host.append(this.buildGrid(doc, nomes));
    if (refocus) host.querySelector<HTMLElement>('.pivos-quadro')?.focus();
  }

  /** A prévia de cima: a imagem grande, a cruz, os nove pontos e o Repetir. */
  private buildPreview(doc: EditorDoc, image: string): HTMLElement {
    const box = el('div', 'pivos-previa');
    const size = this.sizeOf(doc, image);
    const pivot = this.pivotOf(doc, image) ?? (size === null
      ? { x: 0, y: 0 }
      : { x: size.width / 2, y: size.height / 2 });

    const aMao = readHandPivots(corpoDe(doc).file)[image] !== undefined;
    const ultima = pivotPanelShowsLast(doc) ? ' · a última imagem escolhida' : '';
    const nome = el('div', aMao ? 'pivos-nome pivos-a-mao' : 'pivos-nome', `${image}${aMao ? ' · pivô à mão' : ''}${ultima}`);
    nome.title = (size === null
      ? `${image}: o tamanho ainda está sendo lido do disco`
      : `${image}: ${size.width} × ${size.height} px`) + (aMao ? `. ${HAND_PIVOT_MARK}` : '');
    box.append(nome);

    const quadro = el('div', 'pivos-quadro');
    if (size !== null) {
      const zoom = Math.min(PREVIEW_MAX / Math.max(1, size.width), PREVIEW_MAX / Math.max(1, size.height), 8);
      const w = Math.max(1, Math.round(size.width * zoom));
      const h = Math.max(1, Math.round(size.height * zoom));
      quadro.style.width = `${w}px`;
      quadro.style.height = `${h}px`;
      const img = el('img') as HTMLImageElement;
      img.alt = '';
      img.width = w;
      img.height = h;
      const url = thumbnailFor(doc, image, Math.max(w, h));
      if (url !== null) {
        img.src = url;
        quadro.append(img);
      } else {
        const own = folderImage(doc, image);
        if (own !== null) {
          void folderThumbnail(own, Math.max(w, h)).then((feita) => {
            if (feita === null) return;
            img.src = feita;
            quadro.prepend(img);
          });
        }
      }
      // A cruz: onde o pivô cai na prévia. O y do pivô conta de BAIXO, e o da
      // tela conta de cima — é aqui que os dois se encontram.
      const cruz = el('span', 'pivos-cruz');
      cruz.style.left = `${Math.round((pivot.x / Math.max(1, size.width)) * w)}px`;
      cruz.style.top = `${Math.round(h - (pivot.y / Math.max(1, size.height)) * h)}px`;
      quadro.append(cruz);
      const dica = `Clique na articulação: é ali que o osso segura esta imagem. ${NUDGE_HINT}`;
      quadro.title = dica;
      quadro.setAttribute('role', 'button');
      quadro.setAttribute('aria-label', `${dica} (${image})`);
      // Lote 3 da rodada final: a prévia recebe o foco, e as setas andam a
      // cruz — 1 px, e 10 com Shift. Cada seta é um passo de desfazer, como o
      // clique: o painel não tem botão de gravar.
      quadro.tabIndex = 0;
      quadro.addEventListener('click', (event) => {
        const caixa = quadro.getBoundingClientRect();
        const at = snapPivot(pivotFromClick(
          event.clientX - caixa.left, event.clientY - caixa.top,
          caixa.width, caixa.height, size.width, size.height,
        ));
        this.keepFocus = true;
        this.setPivot(doc, image, at);
      });
      quadro.addEventListener('keydown', (event) => {
        const next = nudgePivot(pivot, event.key, event.shiftKey);
        if (next === null) return;
        event.preventDefault();
        event.stopPropagation();
        this.keepFocus = true;
        this.setPivot(doc, image, next);
      });
    } else {
      quadro.append(el('p', 'pivos-lendo', 'Lendo a imagem do disco…'));
    }

    // Rodada 44, lote 3: a unidade à vista, não só na dica.
    const leitura = el('p', 'pivos-leitura', `X ${texto(pivot.x)} px · Y ${texto(pivot.y)} px`);
    leitura.title = 'Em px da imagem, contados da esquerda e de baixo';
    

    const grade = el('div', 'pivos-pontos');
    grade.setAttribute('role', 'group');
    grade.setAttribute('aria-label', 'Os nove pontos da imagem');
    for (const point of NINE_POINTS) {
      const botao = el('button', 'pivo-ponto', point.glyph) as HTMLButtonElement;
      botao.type = 'button';
      botao.title = `Pivô no ${point.label.toLowerCase()}`;
      botao.setAttribute('aria-label', botao.title);
      botao.disabled = size === null;
      botao.addEventListener('click', () => {
        if (size === null) return;
        this.setPivot(doc, image, ninePoint(point.id, size.width, size.height));
      });
      grade.append(botao);
    }
    // Lote 3 da rodada final (Q7): a prévia e os nove pontos LADO A LADO, como
    // na janela do lote 58. Um em cima do outro, a coluna de 1440×900 não os
    // comportava, e os pontos caíam por cima da caixa Repetir.
    const corpo = el('div', 'pivos-corpo');
    corpo.append(quadro, grade);
    box.append(corpo, leitura);

    const pasta = folderOf(image);
    const irmas = sameFolderImages(this.allNames(doc), image);
    const linha = el('label', 'pivos-repetir');
    const caixa = document.createElement('input');
    caixa.type = 'checkbox';
    caixa.className = 'prop-marca';
    caixa.checked = this.repeats();
    caixa.disabled = pasta === '' || irmas.length <= 1;
    // Rodada 44, lote 5 (doc 63): na raiz, uma linha só; o porquê fica na dica.
    const conta = pasta === ''
      ? 'Repetir para a pasta: não vale na raiz'
      : irmas.length <= 1
        ? `Repetir para a pasta ${pasta}: ela é a única imagem da pasta`
        : `Repetir para a pasta ${pasta} (${irmas.length} imagens): mesmo tamanho, mesmo pixel; `
          + 'tamanho diferente, mesma proporção';
    linha.title = pasta === ''
      ? 'Repetir para a pasta: esta imagem está na raiz, sem subpasta. A raiz não é um grupo'
      : conta;
    caixa.addEventListener('change', () => {
      this.setRepeats(caixa.checked);
      this.render();
    });
    linha.append(caixa, el('span', 'pivos-repetir-texto', conta));
    box.append(linha);

    /*
     * I8, "tamanho diferente avisa". O padrão da arte é **sem recorte**: a
     * mesma tela, o encaixe no mesmo pixel. Quando as imagens de uma pasta têm
     * telas de tamanhos diferentes, esse alinhamento não existe — o pivô passa
     * a viajar por proporção, que é um palpite razoável e não a verdade. Então
     * se diz, em vez de deixar o número sair torto sem explicação.
     */
    const sizes = irmas.map((name) => this.sizeOf(doc, name)).filter((s): s is PivotSize => s !== null);
    const aviso = folderSizeWarning(pasta, sizes);
    if (aviso !== null) {
      const texto = el('p', 'pivos-aviso', aviso);
      texto.title = aviso;
      box.append(texto);
    }
    return box;
  }

  /** A pasta inteira em grade, com a cruz em cada miniatura. */
  private buildGrid(doc: EditorDoc, nomes: readonly string[]): HTMLElement {
    const grade = el('div', 'pivos-grade');
    grade.dataset.rolagem = 'lista';
    grade.setAttribute('role', 'listbox');
    grade.setAttribute('aria-label', 'As imagens do projeto, para acertar o pivô');
    grade.title = PIVOT_GRID_HINT;
    // Rodada 13, caso (b): o pivô à mão se vê (regra 21) — uma marca na célula.
    const aMao = readHandPivots(corpoDe(doc).file);
    for (const name of nomes) {
      const escolhida = name === this.chosen;
      const botao = el('button', escolhida ? 'pivos-celula pivos-celula-atual' : 'pivos-celula') as HTMLButtonElement;
      botao.type = 'button';
      botao.setAttribute('role', 'option');
      botao.setAttribute('aria-selected', String(escolhida));
      const pivot = this.pivotOf(doc, name);
      const size = this.sizeOf(doc, name);
      // Rodada 44, lote 5 (doc 63): o tamanho junto do pivô, os dois em px.
      const tamanho = size === null ? '' : ` (${size.width} × ${size.height} px)`;
      botao.title = pivot === null
        ? `${name}${tamanho}: ainda sem pivô. Clique para acertar`
        : `${name}${tamanho}: pivô em ${texto(pivot.x)}, ${texto(pivot.y)} px. Clique para acertar`;
      if (aMao[name] !== undefined) {
        botao.title += `. ${HAND_PIVOT_MARK}`;
        botao.classList.add('pivos-a-mao');
      }
      botao.setAttribute('aria-label', botao.title);
      if (pivot === null) botao.classList.add('pivos-sem-pivo');

      const cova = el('span', 'pivos-mini');
      const url = thumbnailFor(doc, name, PIVOT_THUMB);
      if (url !== null) {
        const img = el('img') as HTMLImageElement;
        img.width = PIVOT_THUMB;
        img.height = PIVOT_THUMB;
        img.alt = '';
        img.src = url;
        cova.append(img);
      } else {
        const own = folderImage(doc, name);
        if (own !== null) {
          const img = el('img') as HTMLImageElement;
          img.width = PIVOT_THUMB;
          img.height = PIVOT_THUMB;
          img.alt = '';
          void folderThumbnail(own, PIVOT_THUMB).then((feita) => {
            if (feita === null) return;
            img.src = feita;
            cova.prepend(img);
          });
        }
      }
      /*
       * A cruz de cada miniatura é desenhada AQUI, e não pela miniatura do
       * atlas (que sabe desenhá-la): assim a imagem que ainda só está na pasta
       * — a que mais precisa deste painel — mostra a cruz do mesmo jeito que a
       * que já tem região. Uma grade com cruz em metade das peças seria pior
       * que uma sem nenhuma.
       */
      if (pivot !== null && size !== null) {
        const encaixe = Math.min(PIVOT_THUMB / Math.max(1, size.width), PIVOT_THUMB / Math.max(1, size.height));
        const w = size.width * encaixe;
        const h = size.height * encaixe;
        const cruz = el('span', 'pivos-cruz pivos-cruz-mini');
        cruz.style.left = `${Math.round((PIVOT_THUMB - w) / 2 + (pivot.x / Math.max(1, size.width)) * w)}px`;
        cruz.style.top = `${Math.round((PIVOT_THUMB - h) / 2 + h - (pivot.y / Math.max(1, size.height)) * h)}px`;
        cova.append(cruz);
      }
      if (aMao[name] !== undefined) {
        const marca = el('span', 'pivos-mao-marca');
        marca.title = HAND_PIVOT_MARK;
        cova.append(marca);
      }
      botao.append(cova);
      botao.addEventListener('click', () => {
        this.chosen = name;
        this.render();
      });
      grade.append(botao);
    }
    return grade;
  }
}

/** Um número como o editor escreve: vírgula, e sem casas à toa. */
function texto(value: number): string {
  return String(roundPivot(value)).replace('.', ',');
}

export const pivotPanel = new PivotPanel();
registerPanel(pivotPanel);
