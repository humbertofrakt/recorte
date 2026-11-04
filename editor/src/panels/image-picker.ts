/**
 * A lista da pasta (dono C) — lote 60, plano pasta do projeto.
 *
 * O campo de imagem do Spriter: um clique mostra as miniaturas das imagens da
 * **mesma subpasta**, com a de agora marcada; outro clique troca. A troca é a
 * de sempre (`SwapSlotImage`, que põe a imagem nova no lugar pelo pivô, lote
 * 56); com `Shift`, em todas as peles; em Animando com Gravar ligado, uma
 * chave de Desenho.
 *
 * Abre em três lugares, e é a mesma lista nos três: o campo **Imagem** das
 * Propriedades, a **Ficha rápida**, e o **clique de novo** no desenho que já
 * está escolhido na cena (o botão direito no desenho é atalho para o mesmo).
 */

import type { EditorDoc } from '../contract.js';
import { corpoDe, wentToBase } from '../contract.js';
import { garantirAninhado } from '../doc/projeto.js';
import { ensureProvisional } from '../io/folder-atlas.js';
import { folderImage, folderThumbnail, projectFolder } from '../io/project-folder.js';
import { shownFolderNames } from '../io/folder-save.js';
import { el } from './dom.js';
import {
  PICKER_HINT, SwapForEntity, SwapForImage, SwapImageAsKey, entityEntries, entityLossNotice, sameEntityTargets, swapAllSame,
  entityLosses, entitySwapNotice, filterPicker, gridNow, gridTarget, pickerEntries, pickerTarget,
  targetOfSlot, everywhereNotice, allSameNotice, swapSizeNote, rememberSizeBefore, fitPlan, fitToPrevious,
  type GridNow, type PickerEntry, type PickerTarget,
} from './image-picker-model.js';
import { SwapSlotImage, paletteNames } from './palette-model.js';
import { SwapImageEverywhere, swapNotice, swapPickFor } from './skins-model.js';
import { thumbnailFor } from './thumbnails.js';
import { setImageGridOpener, setImageGridSync, setImagePickerOpener } from '../ui/picker-hook.js';
import {
  GRID_CELL, GRID_PER_ROW, GRID_SOURCES, gridAnchor, gridCells, gridEntries, gridLayout,
  NO_FOLDER_NOW_HINT, gridEmptyText, gridFolderBreaks, gridSourceFor, gridSourceHint, nextGridIndex, splitGridOptions,
  type GridBox, type GridCamera, type GridOption, type GridSource,
} from './image-grid-model.js';
import { entityThumbnail } from './entity-thumb.js';
import { entityData, listEntities } from './palette-entities-model.js';
import { editingSkinOf } from '../viewport/onion.js';
import { revealKey, roundTime, slotTarget } from '../anim/keying.js';

/** Lado da miniatura da lista, em pixels. O mesmo da aba Imagens. */
export const PICKER_THUMB = 48;

let current: { box: HTMLElement; close: () => void } | null = null;

/** Fecha a lista aberta, se houver. */
export function closeImagePicker(): void {
  current?.close();
}

/** `true` enquanto a lista está aberta. */
export function isImagePickerOpen(): boolean {
  return current !== null;
}

/** Todo nome de imagem que o documento conhece: os dos atlas e os da pasta. */
function knownImages(doc: EditorDoc): string[] {
  const atlas = doc.atlases.flatMap((a) => a.regions.map((region) => region.name));
  return paletteNames(atlas, shownFolderNames(doc));
}

/**
 * O desenho da seleção que a lista troca: um só, e com imagem.
 *
 * Lote 3 da rodada final (Q5): **o slot sozinho também vale**, pelo desenho
 * que ele mostra agora. A imagem solta na cena nasce com o SLOT escolhido, e
 * o "Usar no desenho escolhido" ficava apagado justo no passo seguinte ao de
 * trazer a imagem — a troca do Spriter é escolher a peça e clicar na imagem.
 */
export function targetOfSelection(doc: EditorDoc): PickerTarget | null {
  const corpo = corpoDe(doc);
  const { attachments, slots } = doc.selection;
  if (attachments.length === 1) {
    const picked = attachments[0]!;
    return pickerTarget(corpo.file as never, doc.visibleSkins, picked.slot, picked.attachment);
  }
  if (attachments.length !== 0 || slots.length !== 1) return null;
  const slot = slots[0]!;
  const shown = corpo.skeleton?.findSlot(slot)?.attachment?.name ?? null;
  return targetOfSlot(corpo.file as never, doc.visibleSkins, slot, shown);
}

/**
 * **A pele do lápis**, onde a troca de imagem grava — P27 (M2, I-O2). A de
 * `target` quando o lápis está na `default`, ou numa pele que este corpo não
 * tem: gravar numa pele que não existe seria perder a troca em silêncio.
 */
export function swapSkinFor(doc: EditorDoc, target: PickerTarget): string {
  const lapis = editingSkinOf(doc);
  if (lapis === null) return target.skin;
  return (corpoDe(doc).file.skins ?? []).some((skin) => skin.name === lapis) ? lapis : target.skin;
}

/**
 * Troca a imagem do desenho pela `image` — o clique da lista, e o "Usar no
 * desenho escolhido" da aba Imagens. A imagem da pasta ganha a região
 * provisória antes, porque a troca procura o pivô nela.
 */
export async function chooseImage(
  doc: EditorDoc, target: PickerTarget, image: string, everywhere = false,
): Promise<void> {
  // Degrau 4b: o desenho é do corpo do instante; a chave de troca, deste arquivo.
  const corpo = corpoDe(doc);
  const pick = swapPickFor(corpo.file, target.slot, target.attachment);
  if (pick === null) {
    doc.notice(`${target.slot}/${target.attachment} não desenha imagem: não há o que trocar`);
    return;
  }
  if (!await ensureProvisional(doc, image)) {
    doc.notice(`"${image}" não está no atlas nem na pasta, ou o arquivo não abriu`);
    return;
  }
  if (image === pick.from) {
    doc.notice(`"${image}" já é a imagem de ${target.slot}`);
    return;
  }
  if (everywhere) {
    const command = new SwapImageEverywhere(target.slot, pick.from, image);
    corpo.run(command);
    doc.notice(swapNotice(pick, image, command.changed));
    return;
  }
  // P27: a troca grava na pele do lápis, e o rodapé diz qual.
  const pele = swapSkinFor(doc, target);
  // Com uma animação aberta, trocar a imagem grava chave — sempre (degrau 4a, Q9).
  if (doc.animation !== null) {
    const command = new SwapImageAsKey(
      target.slot, target.attachment, target.skin, image, doc.animation, doc.time, pele,
    );
    doc.run(command);
    // K12 (P12, rodada final): a chave de imagem não se vê na cena; a linha do
    // tempo abre os Detalhes, escolhe a chave e rola até ela.
    revealKey({ target: slotTarget(target.slot, 'attachment'), time: roundTime(doc.time) });
    const quando = `${doc.time.toFixed(2).replace('.', ',')} s`;
    doc.notice(`${target.slot} mostra "${image}" a partir de ${quando}, só nesta animação${naPele(pele)}`);
    return;
  }
  // Rodada 44, lote 7: o tamanho da que sai, para o "Caber no lugar da antiga".
  rememberSizeBefore(doc, target);
  corpo.run(new SwapSlotImage(target.slot, image, target.skin, target.attachment, pele));
  const tamanho = swapSizeNote(doc, target, image);
  doc.notice(tamanho !== ''
    ? `${target.slot}: ${tamanho}${wentToBase(doc)}`
    : `${target.slot}/${target.attachment} agora mostra "${image}"${naPele(pele)}${wentToBase(doc)}`);
}

/** O pedaço do rodapé que diz em que pele a troca gravou — P27. */
export function naPele(skin: string): string {
  return skin === 'default' ? ', na skin default (a de todos)' : `, na skin "${skin}"`;
}

/** A miniatura de uma linha: do atlas quando há região, senão lida da pasta. */
function thumbInto(doc: EditorDoc, name: string, cova: HTMLElement, size = PICKER_THUMB): void {
  const img = el('img') as HTMLImageElement;
  img.width = size;
  img.height = size;
  img.alt = '';
  const url = thumbnailFor(doc, name, size);
  if (url !== null) {
    img.src = url;
    cova.append(img);
    return;
  }
  const image = folderImage(doc, name);
  if (image === null) return;
  // A lista é de uma subpasta só: poucas imagens, lidas todas de uma vez.
  void folderThumbnail(image, size).then((made) => {
    if (made === null) return;
    img.src = made;
    cova.append(img);
  });
}

/**
 * Abre a lista em `x, y` (pixels da janela) para o desenho `target`. Com
 * `everywhere`, o clique troca em todas as peles (o "Trocar em todas as
 * peles…" do botão direito); sem, só o `Shift` faz isso.
 */
export function openImagePicker(
  doc: EditorDoc, x: number, y: number, target: PickerTarget, options: { everywhere?: boolean } = {},
): void {
  closeImagePicker();
  const pick = swapPickFor(corpoDe(doc).file, target.slot, target.attachment);
  const list = pickerEntries(knownImages(doc), pick?.from ?? null, { folderOpen: projectFolder(doc) !== null });
  const everywhere = options.everywhere === true;

  const box = el('div', 'imagem-lista');
  box.setAttribute('role', 'dialog');
  const titulo = everywhere
    ? `Trocar a imagem de ${target.slot} em todas as skins`
    : `Trocar a imagem de ${target.slot}`;
  box.setAttribute('aria-label', titulo);
  box.style.left = `${Math.round(x)}px`;
  box.style.top = `${Math.round(y)}px`;

  const cabeca = el('div', 'imagem-lista-cabeca');
  cabeca.append(el('span', 'imagem-lista-titulo', titulo));
  const onde = list.folder === '' ? (list.hint === null ? 'raiz da pasta' : 'todas') : list.folder;
  cabeca.append(el('span', 'imagem-lista-pasta', onde));
  box.append(cabeca);
  box.append(el('p', 'imagem-lista-dica', list.hint ?? PICKER_HINT));

  const busca = document.createElement('input');
  busca.type = 'search';
  busca.className = 'imagem-lista-busca';
  busca.placeholder = 'Buscar';
  busca.setAttribute('aria-label', 'Buscar imagem nesta lista');
  box.append(busca);

  const grade = el('div', 'imagem-lista-grade');
  grade.setAttribute('role', 'listbox');
  box.append(grade);

  let buttons: HTMLButtonElement[] = [];
  const escolher = (name: string, shift: boolean): void => {
    close();
    void chooseImage(doc, target, name, everywhere || shift);
  };
  const desenhar = (entries: readonly PickerEntry[]): void => {
    grade.replaceChildren();
    buttons = [];
    if (entries.length === 0) {
      grade.append(el('p', 'imagem-lista-vazia', 'Nenhuma imagem com esse nome aqui'));
      return;
    }
    for (const entry of entries) {
      const botao = el('button', entry.current ? 'imagem-lista-item imagem-lista-atual' : 'imagem-lista-item') as HTMLButtonElement;
      botao.type = 'button';
      botao.setAttribute('role', 'option');
      botao.setAttribute('aria-selected', String(entry.current));
      const cova = el('span', 'imagem-lista-mini');
      thumbInto(doc, entry.name, cova);
      botao.append(cova, el('span', 'imagem-lista-nome', entry.label));
      botao.title = entry.current
        ? `${entry.name}: é a imagem de agora`
        : `${entry.name}: clique para trocar. Shift + clique troca em todas as skins`;
      botao.addEventListener('click', (event) => escolher(entry.name, event.shiftKey));
      grade.append(botao);
      buttons.push(botao);
    }
  };
  desenhar(list.entries);
  busca.addEventListener('input', () => desenhar(filterPicker(list.entries, busca.value)));

  // As teclas da lista param aqui: tecla tratada uma vez.
  const onKey = (event: KeyboardEvent): void => {
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === 'Enter' && at >= 0) {
      event.preventDefault();
      event.stopPropagation();
      buttons[at]!.click();
      return;
    }
    const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (passo === undefined) {
      // Letras vão para a busca; nenhuma tecla do editor corre por baixo.
      event.stopPropagation();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (buttons.length === 0) return;
    const next = at < 0 ? 0 : (at + passo + buttons.length) % buttons.length;
    buttons[next]!.focus();
  };
  const onOutside = (event: PointerEvent): void => {
    if (box.contains(event.target as Node)) return;
    close();
  };
  function close(): void {
    box.removeEventListener('keydown', onKey);
    window.removeEventListener('pointerdown', onOutside, true);
    box.remove();
    if (current?.box === box) current = null;
  }

  box.addEventListener('keydown', onKey);
  window.addEventListener('pointerdown', onOutside, true);
  document.body.append(box);
  const caixa = box.getBoundingClientRect();
  if (caixa.right > window.innerWidth) box.style.left = `${Math.max(0, Math.round(window.innerWidth - caixa.width - 8))}px`;
  if (caixa.bottom > window.innerHeight) box.style.top = `${Math.max(0, Math.round(window.innerHeight - caixa.height - 8))}px`;
  current = { box, close };
  (buttons.find((b) => b.classList.contains('imagem-lista-atual')) ?? buttons[0] ?? busca).focus();
}

/**
 * A miniatura de uma entidade dentro da grade. Sem o esqueleto carregado, a
 * célula fica com a inicial do nome em vez de um quadrado cinza que parece uma
 * peça (regra 21).
 */
function entityThumbInto(doc: EditorDoc, uri: string, cova: HTMLElement): void {
  const data = entityData(doc, uri);
  const url = data === null ? null : entityThumbnail(doc, data, GRID_CELL);
  if (url === null) {
    cova.classList.add('grade-entidade-sem-desenho');
    cova.append(el('span', 'grade-entidade-inicial', '?'));
    return;
  }
  const img = el('img') as HTMLImageElement;
  img.width = GRID_CELL;
  img.height = GRID_CELL;
  img.alt = '';
  img.src = url;
  cova.append(img);
}

/**
 * **Trocar por entidade** — degrau 8, E7. Vai para a base do corpo do
 * instante, como toda mexida estrutural: o anexo muda de tipo, e um anexo não
 * é pose. As chaves que o apontavam continuam apontando, porque o nome fica.
 */
function swapForEntity(doc: EditorDoc, target: PickerTarget, uri: string, label: string): void {
  const corpo = corpoDe(doc);
  // Rodada 8a, achado 4: o que não passa se conta ANTES, e se diz em português.
  const perdas = entityLosses(corpo.file as never, target.slot, target.attachment);
  // Rodada 8b, C18: a entidade trazida de fora passa a ser conhecida da base.
  garantirAninhado(doc, uri);
  const command = new SwapForEntity(target.slot, target.attachment, target.skin, uri);
  corpo.run(command);
  const naoPassa = entityLossNotice(perdas, target.attachment, label);
  doc.notice(entitySwapNotice(target.slot, label, command.pin, wentToBase(doc))
    + (naoPassa === '' ? '' : `. ${naoPassa}`));
}

/**
 * **Trocar todas as iguais** — rodada 9, lote 2. Todas as peças com a mesma
 * entidade trocam pelo que foi clicado, num passo só de desfazer.
 */
function swapAllSameIn(
  doc: EditorDoc, targets: readonly PickerTarget[], kind: 'entidade' | 'imagem', name: string, label: string,
): void {
  const corpo = corpoDe(doc);
  const lista = targets.map((t) => t.slot).join(', ');
  if (kind === 'entidade') {
    garantirAninhado(doc, name);
    corpo.run(swapAllSame(targets, { kind, name }));
    doc.notice(`${targets.length} peças iguais trocadas por ${label}: ${lista}${wentToBase(doc)}`);
    return;
  }
  void ensureProvisional(doc, name).then((ok) => {
    if (!ok) {
      doc.notice(`"${name}" não está no atlas nem na pasta, ou o arquivo não abriu`);
      return;
    }
    corpo.run(swapAllSame(targets, { kind, name }));
    doc.notice(`${targets.length} peças iguais voltam a mostrar a imagem "${name}": ${lista}${wentToBase(doc)}`);
  });
}

/** **Trocar a entidade pela imagem** — a volta, pelo pivô da imagem nova. */
function swapForImage(doc: EditorDoc, target: PickerTarget, image: string): void {
  const corpo = corpoDe(doc);
  void ensureProvisional(doc, image).then((ok) => {
    if (!ok) {
      doc.notice(`"${image}" não está no atlas nem na pasta, ou o arquivo não abriu`);
      return;
    }
    rememberSizeBefore(doc, target);
    corpo.run(new SwapForImage(target.slot, target.attachment, target.skin, image));
    const tamanho = swapSizeNote(doc, target, image);
    doc.notice(tamanho !== ''
      ? `${target.slot}: ${tamanho}${wentToBase(doc)}`
      : `${target.slot} volta a mostrar a imagem "${image}", pelo pivô dela${wentToBase(doc)}`);
  });
}

// ---------------------------------------------------------------------------
// A grade de imagens na cena — lote 60b, plano consertos do teste
// ---------------------------------------------------------------------------

/**
 * A fonte da grade **aberta** — rodada 44, lote 2. Ela abre sempre em
 * `pasta`, como a fileira do Spriter; a escolha vale enquanto a grade está
 * aberta. Antes ela ficava guardada no navegador, e a fonte "objeto" de uma
 * peça voltava na peça seguinte, que só mostrava a si mesma (doc 55, foto 29).
 */
let gridSource: GridSource = 'pasta';

/**
 * As imagens que cada slot mostrou **nesta sessão** — rodada 44, lote 2. A
 * fonte "objeto" lia só o arquivo, e o `blade` que o slot mostrou um momento
 * antes de virar machado sumia dela (doc 55, foto 21).
 */
const shownThisSession = new Map<string, string[]>();

/** Guarda que o slot mostrou esta imagem. */
export function rememberShown(slot: string, image: string): void {
  const lista = shownThisSession.get(slot) ?? [];
  if (!lista.includes(image)) shownThisSession.set(slot, [...lista, image]);
}

let grid: { box: HTMLElement; key: string } | null = null;
/**
 * Lote 60c: o desenho em que o botão direito abriu a grade. Ela só aparece
 * para ele. Escolher outra coisa, clicar fora, `Esc`, trocar a imagem ou usar
 * uma opção fecham.
 */
let openFor: string | null = null;
/** As opções embaixo da grade, que a cena mandou ao abrir. */
let gridOptions: readonly GridOption[] = [];
/** "Em todas as peles" ligado: o clique troca em toda pele, como o Shift. */
let everywhere = false;
/**
 * "Trocar todas as iguais" ligado — rodada 9, lote 2 (as rodas). Desligado
 * por padrão: as duas armas trocam separadas. Volta a desligar quando a grade
 * fecha.
 */
let allSame = false;
/** A última chamada da cena, para refazer a grade quando a fonte muda. */
let last: { doc: EditorDoc; stage: HTMLElement; camera: GridCamera; box: GridBox | null } | null = null;

function hideGrid(): void {
  if (grid !== null) window.removeEventListener('pointerdown', onOutsideGrid, true);
  grid?.box.remove();
  grid = null;
}

/** Fecha de vez: a grade só volta pelo botão direito. */
function closeGrid(): void {
  openFor = null;
  everywhere = false;
  allSame = false;
  hideGrid();
}

/** O clique fora da grade fecha ela. */
function onOutsideGrid(event: PointerEvent): void {
  if (grid !== null && grid.box.contains(event.target as Node)) return;
  closeGrid();
}

/** O desenho escolhido, como chave: um só, ou `null`. */
function selectedKey(doc: EditorDoc): string | null {
  const one = doc.selection.attachments.length === 1 ? doc.selection.attachments[0]! : null;
  return one === null ? null : `${one.slot}/${one.attachment}`;
}

/**
 * Abre a grade no desenho escolhido — o botão direito da cena (lote 60c,
 * `ui/picker-hook.ts`). O foco vai para a imagem de agora: setas, Enter e Esc
 * já valem.
 */
export function openImageGridIn(
  doc: EditorDoc, stage: HTMLElement, camera: GridCamera, box: GridBox, options: readonly GridOption[],
): void {
  hideGrid();
  openFor = selectedKey(doc);
  gridSource = 'pasta';
  gridOptions = options;
  everywhere = false;
  allSame = false;
  syncImageGridIn(doc, stage, camera, box);
  grid?.box.querySelector<HTMLButtonElement>('.grade-imagem-atual, .grade-imagem')?.focus();
}

/**
 * Mostra, move ou esconde a grade — a cena chama a cada quadro desenhado
 * (`ui/picker-hook.ts`). `box` é a caixa de mundo do desenho escolhido, ou
 * `null` para esconder (nada escolhido, arrasto em curso, opção desligada).
 * O DOM só é refeito quando o que a grade mostra muda; no resto do tempo, só
 * a posição anda, com o zoom e o pan.
 */
export function syncImageGridIn(doc: EditorDoc, stage: HTMLElement, camera: GridCamera, box: GridBox | null): void {
  last = { doc, stage, camera, box };
  const chosen = selectedKey(doc);
  // Escolheu outra coisa: a grade daquele desenho fecha.
  if (chosen !== openFor) closeGrid();
  // Degrau 8: o alvo vale também quando o desenho já é uma entidade — senão a
  // troca por entidade fechava a porta por onde ela entrou.
  const picked = box === null || openFor === null ? null : doc.selection.attachments[0] ?? null;
  const target = picked === null
    ? null
    : gridTarget(corpoDe(doc).file as never, doc.visibleSkins, picked.slot, picked.attachment);
  const now = target === null ? null : gridNow(corpoDe(doc).file as never, target.skin, target.slot, target.attachment);
  if (box === null || target === null || now === null) {
    hideGrid();
    return;
  }
  // Rodada 44, lote 4 (doc 61): numa entidade, "pasta" vira "todas", e diz.
  const source = gridSourceFor(gridSource, now.kind === 'entidade');
  const entries = gridCells(
    gridEntries(corpoDe(doc).file, knownImages(doc), target.slot, source, {
      current: now.kind === 'imagem' ? now.name : null, folderOpen: projectFolder(doc) !== null,
      recent: shownThisSession.get(target.slot) ?? [],
    }),
    entityEntries(listEntities(doc).map((row) => ({ uri: row.uri, name: row.name })), now),
  );
  const key = JSON.stringify([
    chosen, target.skin, source, everywhere, allSame, gridOptions.map((option) => option.label),
    entries.map((entry) => [entry.name, entry.current, entry.kind ?? 'imagem']),
  ]);
  if (grid === null || grid.key !== key || grid.box.parentElement !== stage) {
    const hadFocus = grid !== null && grid.box.contains(document.activeElement);
    hideGrid();
    grid = { box: buildGrid(doc, target, entries, source, now), key };
    stage.append(grid.box);
    window.addEventListener('pointerdown', onOutsideGrid, true);
    if (hadFocus) (grid.box.querySelector<HTMLButtonElement>('.grade-imagem-atual, .grade-imagem'))?.focus();
  }
  // "Em todas as peles" conta como uma opção a mais embaixo da grade; e
  // "Trocar todas as iguais", quando aparece, mais uma.
  const iguais = sameEntityTargets(corpoDe(doc).file as never, target).length >= 2 ? 1 : 0;
  // Cada cabeçalho de pasta (rodada 44, lote 4) ocupa uma linha a mais.
  const cabecalhos = source === 'todas'
    ? gridFolderBreaks(entries.filter((e) => e.kind !== 'entidade').map((e) => e.name)).length : 0;
  const caberConta = fitPlan(doc, target) !== null ? 1 : 0;
  const place = gridAnchor(box, camera, gridLayout(entries.length), gridOptions.length + 1 + iguais + cabecalhos + caberConta);
  grid.box.style.left = `${Math.round(place.left)}px`;
  grid.box.style.top = `${Math.round(place.top)}px`;
  grid.box.dataset['lado'] = place.side;
}

/** Um botão de opção da grade: fecha a grade e faz. */
function optionButton(opcao: GridOption): HTMLButtonElement {
  const botao = el('button', 'grade-imagens-opcao', opcao.label) as HTMLButtonElement;
  botao.type = 'button';
  botao.title = opcao.hint;
  botao.addEventListener('click', () => {
    closeGrid();
    opcao.run();
  });
  return botao;
}

/** A grade em si: as miniaturas, até 6 por linha, e o seletor da fonte embaixo. */
function buildGrid(
  doc: EditorDoc, target: PickerTarget, entries: readonly PickerEntry[], source: GridSource,
  now: GridNow,
): HTMLElement {
  const box = el('div', 'grade-imagens');
  // Rodada 9, lote 2: as outras peças com a mesma entidade (a clicada junto).
  const iguais = sameEntityTargets(corpoDe(doc).file as never, target);
  const todasIguais = allSame && iguais.length >= 2;
  box.setAttribute('role', 'listbox');
  box.setAttribute('aria-label', `Imagens e entidades para ${target.slot}`);

  // Rodada 13 (fecho da v27.6, palavra do Humberto): o "Este boneco" é o
  // PRIMEIRO item, antes das miniaturas. As outras opções ficam embaixo.
  const { top, bottom } = splitGridOptions(gridOptions);
  if (top.length > 0) {
    const primeiras = el('div', 'grade-imagens-opcoes grade-imagens-opcoes-topo');
    for (const opcao of top) primeiras.append(optionButton(opcao));
    box.append(primeiras);
  }

  const cells = el('div', 'grade-imagens-celulas');
  cells.style.gridTemplateColumns = `repeat(${Math.max(1, Math.min(GRID_PER_ROW, entries.length))}, ${GRID_CELL}px)`;
  const buttons: HTMLButtonElement[] = [];
  // Rodada 44, lote 4 (doc 61): em "todas", um cabeçalho por pasta.
  const quebras = new Map((source === 'todas'
    ? gridFolderBreaks(entries.filter((e) => e.kind !== 'entidade').map((e) => e.name)) : [])
    .map((q) => [q.at, q.folder] as const));
  let indice = 0;
  // Rodada 44 (doc 67): as entidades depois das imagens, com cabeçalho — a
  // marcada em laranja é a entidade de agora, e sem o cabeçalho ela parecia
  // uma imagem a mais da última pasta.
  let cabecaEntidades = false;
  for (const entry of entries) {
    if (entry.kind === 'entidade' && !cabecaEntidades && indice > 0) {
      cabecaEntidades = true;
      const cabeca = el('p', 'grade-imagens-pasta', 'entidades');
      cabeca.style.gridColumn = '1 / -1';
      cabeca.style.margin = '4px 0 0';
      cabeca.style.fontSize = '12px';
      cabeca.style.fontWeight = '600';
      cabeca.style.color = '#333333';
      cabeca.title = 'As entidades do projeto. A marcada em laranja é a de agora';
      cells.append(cabeca);
    }
    const pasta = entry.kind === 'entidade' ? undefined : quebras.get(indice);
    if (entry.kind !== 'entidade') indice += 1;
    if (pasta !== undefined) {
      const cabeca = el('p', 'grade-imagens-pasta', pasta === '' ? 'raiz' : `${pasta}/`);
      cabeca.style.gridColumn = '1 / -1';
      cabeca.style.margin = '4px 0 0';
      cabeca.style.fontSize = '12px';
      cabeca.style.fontWeight = '600';
      // A mesma tinta do "fonte:" embaixo: o fundo da grade é claro nos dois temas.
      cabeca.style.color = '#333333';
      cabeca.title = pasta === '' ? 'As imagens que não estão em subpasta' : `As imagens da subpasta ${pasta}`;
      cells.append(cabeca);
    }
    const entidade = entry.kind === 'entidade';
    const classes = ['grade-imagem'];
    if (entry.current) classes.push('grade-imagem-atual');
    if (entidade) classes.push('grade-entidade');
    const botao = el('button', classes.join(' ')) as HTMLButtonElement;
    botao.type = 'button';
    botao.setAttribute('role', 'option');
    botao.setAttribute('aria-selected', String(entry.current));
    botao.title = entry.current
      ? `${entry.name}: é ${entidade ? 'a entidade' : 'a imagem'} de agora`
      : entidade
        ? `${entry.label}: entidade, uma base inteira com relógio. Clique para pôr no lugar `
          + 'desta imagem: osso, pivô, ordem e chaves ficam como estão'
        : `${entry.name}: clique para trocar. Shift + clique troca em todas as skins`;
    botao.setAttribute('aria-label', botao.title);
    if (entidade) entityThumbInto(doc, entry.name, botao);
    else thumbInto(doc, entry.name, botao, GRID_CELL);
    botao.addEventListener('click', (event) => {
      // Trocar fecha a grade, como soltar sobre a miniatura no Spriter.
      const todas = everywhere || event.shiftKey;
      // Rodada 44, lote 2: a imagem que sai fica na fonte "objeto".
      if (now.kind === 'imagem') rememberShown(target.slot, now.name);
      closeGrid();
      if (todasIguais) swapAllSameIn(doc, iguais, entidade ? 'entidade' : 'imagem', entry.name, entry.label);
      else if (entidade) swapForEntity(doc, target, entry.name, entry.label);
      else if (now.kind === 'entidade') swapForImage(doc, target, entry.name);
      else void chooseImage(doc, target, entry.name, todas);
    });
    cells.append(botao);
    buttons.push(botao);
  }
  if (entries.length === 0) {
    cells.append(el('p', 'grade-imagens-vazia', gridEmptyText(source)));
  }
  box.append(cells);
  // Rodada 44, lote 6 (doc 71): a laranja dita por escrito, não só na dica.
  if (entries.some((entry) => entry.current)) {
    const legenda = el('p', 'grade-imagens-legenda', 'Laranja: a de agora');
    legenda.style.margin = '2px 0 0';
    legenda.style.fontSize = '11px';
    legenda.style.color = '#333333';
    box.append(legenda);
  }

  const fonte = el('div', 'grade-imagens-fonte');
  fonte.append(el('span', 'grade-imagens-fonte-nome', 'fonte:'));
  for (const qual of GRID_SOURCES) {
    const botao = el('button', 'grade-imagens-fonte-botao', qual) as HTMLButtonElement;
    botao.type = 'button';
    botao.setAttribute('aria-pressed', String(qual === source));
    botao.title = qual === 'pasta' && now.kind === 'entidade' ? NO_FOLDER_NOW_HINT : gridSourceHint(qual);
    botao.addEventListener('click', () => {
      gridSource = qual;
      if (last !== null) syncImageGridIn(last.doc, last.stage, last.camera, last.box);
    });
    fonte.append(botao);
  }
  box.append(fonte);

  // Lote 60c: as opções do botão direito, embaixo, como no Spriter.
  const opcoes = el('div', 'grade-imagens-opcoes');
  const todas = el('button', 'grade-imagens-opcao', 'Em todas as skins') as HTMLButtonElement;
  todas.type = 'button';
  todas.setAttribute('aria-pressed', String(everywhere));
  todas.title = 'Ligado: a imagem que você clicar troca em toda skin que usa a mesma neste slot (o mesmo que Shift + clique)';
  todas.addEventListener('click', () => {
    everywhere = !everywhere;
    // Rodada 17, M13: o interruptor diz no rodapé o que mudou.
    doc.notice(everywhereNotice(everywhere));
    if (last !== null) syncImageGridIn(last.doc, last.stage, last.camera, last.box);
  });
  opcoes.append(todas);
  // Rodada 44, lote 7 (doc 75): "Caber no lugar da antiga", quando há o que caber.
  if (fitPlan(doc, target) !== null) {
    const caber = el('button', 'grade-imagens-opcao', 'Caber no lugar da antiga') as HTMLButtonElement;
    caber.type = 'button';
    caber.title = 'Muda a escala deste desenho para o lado maior dele ficar do tamanho do que saiu na última troca. Vale na base';
    caber.addEventListener('click', () => {
      closeGrid();
      fitToPrevious(doc, target);
    });
    opcoes.append(caber);
  }
  if (iguais.length >= 2) {
    const mesmas = el('button', 'grade-imagens-opcao', `Trocar todas as iguais (${iguais.length})`) as HTMLButtonElement;
    mesmas.type = 'button';
    mesmas.setAttribute('aria-pressed', String(allSame));
    mesmas.title = `Ligado: o que você clicar troca nas ${iguais.length} peças que mostram esta mesma entidade `
      + `(${iguais.map((t) => t.slot).join(', ')}), num passo só de desfazer. Desligado: só esta`;
    mesmas.addEventListener('click', () => {
      allSame = !allSame;
      doc.notice(allSameNotice(allSame, iguais.length));
      if (last !== null) syncImageGridIn(last.doc, last.stage, last.camera, last.box);
    });
    opcoes.append(mesmas);
  }
  for (const opcao of bottom) opcoes.append(optionButton(opcao));
  box.append(opcoes);

  // As teclas da grade param aqui: tecla tratada uma vez. As outras seguem.
  box.addEventListener('keydown', (event) => {
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeGrid();
      return;
    }
    if (event.key === 'Enter' && at >= 0) {
      event.preventDefault();
      event.stopPropagation();
      buttons[at]!.click();
      return;
    }
    const next = nextGridIndex(at, event.key, buttons.length);
    if (next === null) return;
    event.preventDefault();
    event.stopPropagation();
    buttons[next]?.focus();
  });
  return box;
}

// A cena chama a lista e a grade por esta porta: ver `ui/picker-hook.ts`.
setImagePickerOpener(openImagePicker);
setImageGridSync(syncImageGridIn);
setImageGridOpener(openImageGridIn);
