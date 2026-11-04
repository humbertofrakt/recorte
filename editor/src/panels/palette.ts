/**
 * Painel **Imagens** (dono C) — lote 20, rodada 3.
 *
 * A `Palette` do Spriter: todas as imagens do atlas, com miniatura de 48px,
 * uma caixa de busca em cima, e um número ao lado dizendo quantos slots usam
 * cada uma. **Arrastar uma para a cena cria o desenho ali.**
 *
 * Antes deste lote, pôr uma imagem no personagem eram três passos — criar
 * slot, criar anexo, escolher a região numa lista de nomes — e em nenhum deles
 * a imagem aparecia antes de ser escolhida.
 *
 * Lote 56, plano pivô: o botão **Carimbar pivôs** na linha da busca, uma cruz
 * no pivô de cada miniatura, os avisos de imagem usada com pivôs diferentes
 * (cada um com o seu botão de duplicar), e o botão direito com **Duplicar no
 * atlas**.
 */

import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { corpoDe, registerPanel, wentToBase } from '../contract.js';
import { clear, el, iconButton } from './dom.js';
import { forgetThumbnails, thumbnailFor } from './thumbnails.js';
import { closeFloatingMenu, openFloatingMenu } from '../ui/floating-menu.js';
import type { FloatingItem } from '../ui/floating-menu.js';
import { ensureProvisional, provisionalNames, refreshProvisional } from '../io/folder-atlas.js';
import { shownFolderNames } from '../io/folder-save.js';
import { chooseImage, targetOfSelection } from './image-picker.js';
import {
  DRAG_TYPE, DropImageAsSlot, FOLDED_KEY, NO_ATLAS, ROOT_SECTION, SwapFolderImages, dropPlace,
  paletteEntries, paletteNames, paletteSections, parseFolded, sequenceDropNotice, toggleFolded,
  usedImages, OPEN_FOLDER_CHOICES, hasCharacter, openFolderLead,
} from './palette-model.js';
import type { PaletteEntry } from './palette-model.js';
import { numberedSequence, sequenceNotice, type NumberedRun } from '../io/drop-plan.js';
import {
  folderBitmap, folderImage, folderImageNames, folderOf, folderPivotNotice, folderPivotPlan,
  folderBecomesSource, folderSwapNewImages, folderSwapNotice, folderSwapPlan, folderThumbnail, imagesInUse, onFolderChange, pickProjectFolder,
  projectFolder, readFolderPivots, reloadFolder, reloadNotice, sameFolderImages, setProjectFolder,
} from '../io/project-folder.js';
import type { PivotDialogOptions } from './pivot-dialog.js';
import { runAction } from '../ui/actions.js';
import { askChoice, askPick } from '../ui/dialog.js';
import { SwapImageEverywhere, swapNotice, swapPickFor, type SwapPick } from './skins-model.js';
import {
  DuplicateInAtlasCommand, ResetPivotToBone, SetFolderPivotCommand, SetPivotCommand, StampPivotsCommand, atlasTreesOf,
} from '../io/pivot-atlas.js';
import {
  pastePivot, pivotNotice, pivotStillTail, pivotUsers, readHandPivots, refsUsing, stampNotice, stampPivots,
  type AttachmentRef, type PivotConflict,
} from '../io/pivot-model.js';
import { findAtlasRegion } from '../../../runtime/src/index.js';
import { originalImageOf } from './mesh-panel.js';
import { PIVOT_NEXT_SWAP, askPivot } from './pivot-dialog.js';

/** Lado da miniatura desta lista, em pixels. */
export const PALETTE_THUMB = 48;

/**
 * A dica do Carimbar. A regra da arte mora aqui enquanto o manual estiver
 * pausado (plano pivô, lote 56): sem ela o botão acerta o número e a imagem
 * nova continua caindo torta.
 */
export const STAMP_HINT = 'Carimbar pivôs: grava no atlas onde cada imagem encaixa no osso, '
  + 'tirado do personagem montado. Assim a imagem trocada cai no lugar. '
  + 'Para isso, desenhe cada variação no quadro da original, com a articulação no mesmo pixel';

/** A dica do Abrir pasta — lote 59. Mora aqui enquanto o manual está pausado. */
export const OPEN_FOLDER_HINT = 'Abrir pasta do projeto…: escolha a pasta das imagens do personagem. '
  + 'Elas aparecem aqui, por subpasta (as mãos numa, as cabeças noutra), e nada entra na cena '
  + 'sozinho: arraste a imagem para montar. Com um personagem aberto, pergunta antes: '
  + 'projeto novo, ou só a pasta dele';

/**
 * **O Abrir pasta da aba, com um personagem aberto** — rodada 44, lote 1.
 *
 * Abrir pasta é começar um projeto (o Spriter: a pasta É o projeto), e o
 * herói aberto sumia sem pergunta nenhuma, trocado por um vazio — quem só
 * queria trazer a arma nova perdia a tela. Com slots na base, a janela
 * pergunta, com o nome de cada caminho no botão. Sem personagem, abre direto.
 */
async function openFolderFromTab(doc: EditorDoc | null): Promise<void> {
  if (doc === null || !hasCharacter(corpoDe(doc).file)) {
    runAction('abrir-pasta');
    return;
  }
  const escolha = await askChoice({
    title: 'Abrir uma pasta com um personagem aberto',
    lead: openFolderLead(corpoDe(doc).file),
    options: OPEN_FOLDER_CHOICES,
    cancelId: 'nada',
  });
  if (escolha === 'novo') runAction('abrir-pasta');
  else if (escolha === 'origem') runAction('trocar-pasta-origem');
  else doc.notice('Nada mudou: o personagem continua aberto');
}

/** A dica do Recarregar — lote 59. */
export const RELOAD_HINT = 'Recarregar a pasta: imagem nova entra, apagada sai, '
  + 'e a que você mudou no Photoshop aparece de novo';

/** A dica do Trocar pasta de origem — degrau 8, tarefa 8.3 (I4). */
export const SWAP_FOLDER_HINT = 'Trocar pasta de origem…: aponte para outra pasta e o personagem '
  + 'inteiro passa a usar as imagens DELA com os mesmos nomes de arquivo — o herói de armadura, '
  + 'o herói ferido. As trocas de imagem voltam com Ctrl+Z; a pasta não: para voltar, aponte a '
  + 'pasta de antes. Nome de arquivo repetido em duas subpastas de lá avisa e '
  + 'não troca: só você sabe qual é a certa';

/** A dica do botão Definir pivô — lote 58. */
export const PIVOT_HINT = 'Definir pivô… da imagem do desenho escolhido: '
  + 'clique na articulação, ou use os nove pontos. Repetir para a pasta põe o mesmo pivô '
  + 'em todas as imagens da subpasta. Duplo clique numa imagem abre o pivô dela; '
  + 'botão direito: Definir, Copiar e Colar pivô';

/**
 * O pedaço da dica de cada imagem que ensina o duplo clique — lote 3 da
 * rodada final. É o gesto do Spriter (*Setting Default Pivot Points*: duplo
 * clique na imagem da paleta abre o diálogo do pivô).
 */
export const DOUBLE_CLICK_HINT = 'Duplo clique: Definir pivô…';

/**
 * A frase de Copiar pivô — lote 3 da rodada final. Sempre diz o que copiou:
 * antes, na imagem que só estava na pasta, o gesto calava (regra 21).
 */
export function copyNotice(image: string, saved: boolean): string {
  const qual = saved ? `Pivô de "${image}" copiado` : `"${image}" ainda não tem pivô: copiado o centro dela`;
  return `${qual}. Botão direito em outra imagem: Colar pivô`;
}

/**
 * Onde a cruz de um pivô cai numa miniatura quadrada de `size` px: a imagem
 * inteira cabe no quadrado, centrada, e o y do pivô conta de BAIXO. A conta
 * do painel Pivôs, para a aba Imagens mostrar a cruz da imagem da pasta.
 */
export function crossInThumb(
  pivot: { x: number; y: number }, image: { width: number; height: number }, size: number,
): { x: number; y: number } {
  const w0 = Math.max(1, image.width);
  const h0 = Math.max(1, image.height);
  const encaixe = Math.min(size / w0, size / h0);
  const w = w0 * encaixe;
  const h = h0 * encaixe;
  return { x: (size - w) / 2 + (pivot.x / w0) * w, y: (size - h) / 2 + h - (pivot.y / h0) * h };
}

/**
 * O pivô copiado, em px da imagem de onde veio — lote 58. Colar leva a
 * proporção. Da sessão, como a âncora copiada: não vai para o arquivo.
 */
let pivotClipboard: { image: string; ow: number; oh: number; x: number; y: number } | null = null;

/** Os pixels de uma imagem lida da pasta, como a janela do pivô desenha. */
function pixelsOf(bitmap: ImageBitmap): { width: number; height: number; data: ArrayLike<number> } | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;
  ctx.drawImage(bitmap, 0, 0);
  try {
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } catch {
    return null; // Canvas "sujo": a janela abre sem a imagem, com a grade.
  }
}

/** A frase do rodapé depois de duplicar. */
export function duplicateNotice(image: string, names: readonly string[], moved: number): string {
  if (names.length === 0) return `"${image}" não está em nenhum atlas aberto`;
  const copias = names.length === 1
    ? `a cópia "${names[0]}"`
    : `as cópias ${names.map((name) => `"${name}"`).join(', ')}`;
  const quem = moved === 0 ? ''
    : moved === 1 ? '; 1 desenho passou a usá-la' : `; ${moved} desenhos passaram a usar as cópias`;
  return `"${image}" ganhou ${copias} no atlas${quem}`;
}

// ---------------------------------------------------------------------------
// As contas da aba que valem com ela FECHADA — P33 (rodada final, 29/09/2026)
// ---------------------------------------------------------------------------
//
// O chat O achou: *"o pivô só existe em painel"*. Definir pivô, Carimbar
// pivôs, Recarregar e Trocar origem ganham id de ação, registrado no arranque
// (`palette-actions.ts`), e por isso a conta não pode depender da aba montada.
// A aba chama as mesmas funções: um caminho só, e ele não envelhece sozinho.

/** Todo nome de imagem que o documento conhece: os dos atlas e os da pasta. */
export function allImageNames(doc: EditorDoc): string[] {
  const atlas: string[] = [];
  for (const tree of doc.atlases) for (const region of tree.regions) atlas.push(region.name);
  return paletteNames(atlas, shownFolderNames(doc));
}

// ---------------------------------------------------------------------------
// As portas do menu Imagens — rodada 6 (05/10/2026), `05 O DESENHO DOS MENUS`
// ---------------------------------------------------------------------------
//
// Copiar e Colar pivô e Trazer como sequência só existiam no botão direito da
// aba. O menu age no que está ESCOLHIDO (o desenho, na cena ou na Árvore), como
// o Definir pivô… já fazia; a sequência pergunta qual subpasta quando há mais
// de uma. As contas são as mesmas da aba: um caminho só.

/** A imagem do desenho escolhido, ou `null`. */
function imageOfSelection(doc: EditorDoc): string | null {
  const alvo = targetOfSelection(doc);
  return alvo === null ? null : swapPickFor(corpoDe(doc).file, alvo.slot, alvo.attachment)?.from ?? null;
}

/** **Imagens → Copiar pivô**: o pivô da imagem do desenho escolhido. */
export async function copyPivotOfSelection(doc: EditorDoc): Promise<void> {
  const image = imageOfSelection(doc);
  if (image === null) { doc.notice(PICK_FOR_PIVOT); return; }
  await palettePanel.copyPivot(doc, image);
}

/** **Imagens → Colar pivô**: na imagem do desenho escolhido. */
export async function pastePivotOnSelection(doc: EditorDoc): Promise<void> {
  const image = imageOfSelection(doc);
  if (image === null) { doc.notice(PICK_FOR_PIVOT); return; }
  await palettePanel.pastePivotOn(doc, image);
}

/** `true` quando há um pivô copiado para colar. */
export function hasPivotClip(): boolean {
  return pivotClipboard !== null;
}

/** As subpastas que são uma corrida numerada (olho_01, olho_02…). */
export function numberedRunsOf(doc: EditorDoc): Array<{ folder: string; run: NumberedRun }> {
  const secoes = paletteSections(paletteEntries(allImageNames(doc), doc.file, ''));
  return secoes.flatMap((secao) => {
    const run = numberedSequence(secao.entries.map((entry) => entry.name));
    return run === null ? [] : [{ folder: secao.folder, run }];
  });
}

/** Por que não há sequência a trazer, ou `null`. */
export const NO_NUMBERED_RUN = 'Nenhuma subpasta é uma corrida numerada: as imagens têm de ter o mesmo nome '
  + 'com números seguidos no fim (olho_01, olho_02, olho_03…)';

/** **Imagens → Trazer como sequência**: uma subpasta só vai direto; mais, pergunta qual. */
export async function bringSequenceOf(doc: EditorDoc): Promise<void> {
  const runs = numberedRunsOf(doc);
  if (runs.length === 0) { doc.notice(NO_NUMBERED_RUN); return; }
  let escolhida = runs[0]!;
  if (runs.length > 1) {
    const nome = (folder: string): string => (folder === '' ? ROOT_SECTION : folder);
    const id = await askPick({
      title: 'Trazer como sequência',
      placeholder: 'Qual subpasta?',
      search: (text) => runs
        .filter((r) => nome(r.folder).toLowerCase().includes(String(text).trim().toLowerCase()))
        .map((r) => ({ id: r.folder, label: nome(r.folder), hint: sequenceNotice(r.run) })),
    });
    const achada = runs.find((r) => r.folder === id);
    if (id === null || achada === undefined) return;
    escolhida = achada;
  }
  await palettePanel.dropSequence(doc, escolhida.run);
}

/**
 * O tamanho de cada imagem, em px dela: o da região quando há, senão o do
 * arquivo da pasta (lido agora, se ainda não foi). É o que o Repetir para a
 * pasta precisa para decidir entre o mesmo pixel e a mesma proporção.
 */
async function sizesOf(
  doc: EditorDoc, names: readonly string[],
): Promise<Array<{ name: string; width: number; height: number }>> {
  const out: Array<{ name: string; width: number; height: number }> = [];
  for (const name of names) {
    const region = findAtlasRegion(doc.atlases, name);
    if (region !== null) {
      out.push({ name, width: region.originalWidth, height: region.originalHeight });
      continue;
    }
    const own = folderImage(doc, name);
    const bitmap = own === null ? null : await folderBitmap(own);
    if (bitmap !== null) out.push({ name, width: bitmap.width, height: bitmap.height });
  }
  return out;
}

/**
 * **Definir pivô…**: a janela, e um passo de desfazer quando ela grava.
 *
 * Lote 61: vale também para a imagem que ainda está só na pasta (o pivô fica
 * guardado para quando ela entrar na cena), e a caixa **Repetir para a
 * pasta** põe o mesmo pivô em toda imagem da mesma subpasta.
 */
export async function definePivotOf(doc: EditorDoc, image: string): Promise<void> {
  const region = findAtlasRegion(doc.atlases, image);
  let ow: number;
  let oh: number;
  let pivot: { x: number; y: number };
  let picture: PivotDialogOptions['picture'] = null;
  if (region !== null) {
    ow = region.originalWidth;
    oh = region.originalHeight;
    pivot = { x: region.pivotX ?? ow / 2, y: region.pivotY ?? oh / 2 };
    const got = originalImageOf(doc, image);
    picture = typeof got === 'string' ? null : got.image;
  } else {
    const own = folderImage(doc, image);
    const bitmap = own === null ? null : await folderBitmap(own);
    if (bitmap === null) {
      doc.notice(`"${image}" não está em nenhum atlas aberto, nem na pasta`);
      return;
    }
    ow = bitmap.width;
    oh = bitmap.height;
    const saved = readFolderPivots(doc.file)[image];
    pivot = saved === undefined ? { x: ow / 2, y: oh / 2 } : { x: saved[0], y: saved[1] };
    picture = pixelsOf(bitmap);
  }
  const irmas = sameFolderImages(allImageNames(doc), image);
  const answer = await askPivot({
    image, ow, oh, pivot,
    users: region === null ? 0 : pivotUsers(corpoDe(doc).file, atlasTreesOf(corpoDe(doc)), image).length,
    picture,
    repeat: { folder: folderOf(image), count: irmas.length },
  });
  if (answer === null) return;
  if (answer.repeat && irmas.length > 1) {
    const plan = folderPivotPlan(await sizesOf(doc, irmas), image, answer);
    const command = new SetFolderPivotCommand(plan);
    doc.run(command);
    doc.notice(folderPivotNotice(folderOf(image), command.count, command.moved) + pivotStillTail(command));
    return;
  }
  if (region === null) {
    doc.run(new SetFolderPivotCommand([{ name: image, x: answer.x, y: answer.y }], 'Definir pivô'));
    doc.notice(`${pivotNotice(image, answer, 0)}. Guardado para quando ela entrar na cena`);
    return;
  }
  const command = new SetPivotCommand(image, answer);
  doc.run(command);
  doc.notice(`${pivotNotice(image, answer, command.moved, command)}${PIVOT_NEXT_SWAP}`);
}

/** O que o rodapé diz antes de abrir o seletor da pasta nova. */
export const SWAP_FOLDER_ASK = 'Escolha a pasta nova. As imagens trocam pelo nome do arquivo.';

/** A frase de quando não há desenho escolhido para o Definir pivô… do menu. */
export const PICK_FOR_PIVOT =
  'Escolha um desenho, na cena ou na Árvore, ou dê duplo clique numa imagem da aba Imagens';

/** **Definir pivô…** da imagem do desenho escolhido — o botão da aba, e o menu. */
export async function definePivotOfSelection(doc: EditorDoc): Promise<void> {
  // Lote 3 da rodada final: o slot escolhido sozinho também vale (Q5).
  const alvo = targetOfSelection(doc);
  const image = alvo === null ? null
    : swapPickFor(corpoDe(doc).file, alvo.slot, alvo.attachment)?.from ?? null;
  if (image === null) {
    doc.notice(PICK_FOR_PIVOT);
    return;
  }
  await definePivotOf(doc, image);
}

/** Por que "Voltar o pivô para o osso" está cinza. */
export const NO_HAND_PIVOT = 'Nenhuma imagem tem pivô à mão: o pivô de todas é onde o osso está';

/** As imagens com pivô à mão no corpo do instante. */
export function handPivotImages(doc: EditorDoc): string[] {
  return Object.keys(readHandPivots(corpoDe(doc).file));
}

/**
 * **Voltar o pivô para o osso** — rodada 13, caso (b). Na imagem do desenho
 * escolhido; sem nada escolhido, em todas as marcadas. Nenhum desenho anda: é
 * o pivô que volta para onde a origem do osso cai na imagem. Ctrl+Z devolve.
 */
export function resetPivotOfSelection(doc: EditorDoc): void {
  const corpo = corpoDe(doc);
  const marcadas = handPivotImages(doc);
  if (marcadas.length === 0) {
    doc.notice(NO_HAND_PIVOT);
    return;
  }
  const alvo = targetOfSelection(doc);
  const image = alvo === null ? null : swapPickFor(corpo.file, alvo.slot, alvo.attachment)?.from ?? null;
  if (image !== null && !marcadas.includes(image)) {
    doc.notice(`"${image}" não tem pivô à mão: o pivô dela já é onde o osso está`);
    return;
  }
  const command = new ResetPivotToBone(image === null ? null : [image]);
  corpo.run(command);
  const n = command.done.length;
  doc.notice(n === 1 ? `Pivô de "${command.done[0]}" de volta ao osso. Nenhum desenho andou`
    : `${n} pivôs de volta ao osso. Nenhum desenho andou`);
}

/**
 * **Carimbar pivôs.** Um passo de desfazer quando muda alguma coisa; quando
 * nada muda, só a frase. Devolve as imagens com pivôs diferentes, para a aba
 * mostrar cada uma com o seu botão de duplicar.
 */
export function stampPivotsOf(doc: EditorDoc): PivotConflict[] {
  // Degrau 8, tarefa 8.7 (4b, sup. 12): num projeto de vários corpos, o pivô
  // é carimbado no atlas do **corpo do instante** — é a base dele que diz
  // onde cada imagem encaixa no osso. Carimbar o do arquivo em foco poria os
  // números do homem no atlas do lobisomem.
  const corpo = corpoDe(doc);
  if (corpo.atlases.length === 0) {
    doc.notice(NO_ATLAS);
    return [];
  }
  const preview = stampPivots(corpo.file, atlasTreesOf(corpo));
  if (preview.changed > 0) corpo.run(new StampPivotsCommand());
  doc.notice(stampNotice(preview));
  return preview.conflicts;
}

/**
 * **Recarregar**: relê a pasta do disco, e o rodapé diz o que mudou.
 * `true` quando alguma imagem mudou e a aba tem de redesenhar.
 */
export async function reloadFolderOf(doc: EditorDoc): Promise<boolean> {
  const folder = projectFolder(doc);
  if (folder === null || folder.name === '') {
    doc.notice('Nenhuma pasta aberta. Arquivo → Abrir pasta do projeto…');
    return false;
  }
  const plan = await reloadFolder(doc, usedImages(doc.file));
  let mudou = false;
  // Lote 60: o desenho na cena que usa uma imagem mudada ganha os pixels novos.
  if (plan !== null && plan.changed.length > 0) {
    await refreshProvisional(doc, plan.changed);
    forgetThumbnails();
    mudou = true;
  }
  doc.notice(plan === null
    ? `Este navegador não deixa reler ${folder.name} sozinho. Abra de novo: Arquivo → Abrir pasta do projeto…`
    : reloadNotice(folder.name, plan));
  return mudou;
}

/**
 * **Trocar pasta de origem…** — degrau 8, tarefa 8.3 (I4).
 *
 * Aponta para outra pasta e troca o acervo inteiro pelas imagens de mesmo
 * **nome de arquivo**. Um só passo de desfazer, e nome repetido lá **avisa e
 * não troca**: escolher por conta própria seria pôr a arte errada no
 * personagem em silêncio (regra 21).
 */
export async function swapFolderOf(doc: EditorDoc): Promise<void> {
  const corpo = corpoDe(doc);
  const usadas = [...imagesInUse(corpo.file)];
  if (usadas.length === 0) {
    doc.notice('Este personagem ainda não usa imagem nenhuma: não há acervo para trocar');
    return;
  }
  // Diz ANTES de abrir o seletor (P de 29/09, régua do arroz): um seletor que
  // abre sem dizer para quê é "fez e não avisou". E cancelar também diz.
  doc.notice(SWAP_FOLDER_ASK);
  // O seletor pode falhar (navegador sem ele, ou nenhum navegador, como no
  // teste das ações). A falha vira frase no rodapé, e não um erro solto que
  // estoura depois, longe de quem o causou — a forma dos "4 erros soltos" de
  // 28/09: pulei a conferência e não pulei a chamada.
  let nova: Awaited<ReturnType<typeof pickProjectFolder>>;
  try {
    nova = await pickProjectFolder();
  } catch (erro) {
    doc.notice(`O seletor de pasta não abriu: ${erro instanceof Error ? erro.message : String(erro)}. Nada mudou.`);
    return;
  }
  if (nova === null) {
    doc.notice('Nada mudou.');
    return;
  }
  const plan = folderSwapPlan(usadas, [...nova.images.keys()]);
  // Rodada 44, lote 1: a pasta vira a origem sempre que tem um nome em comum
  // com o personagem — e não só quando há troca. Antes o rodapé dizia "virou a
  // origem" e a aba continuava na pasta velha, sem as imagens novas.
  // Rodada 44, lote 5: as "novas" são as que a pasta de ANTES não tinha.
  const antigas = folderImageNames(doc);
  const vira = folderBecomesSource(plan);
  if (vira) {
    // A pasta nova passa a ser a do documento ANTES da troca: as imagens
    // dela precisam existir para ganhar a região provisória e o pivô.
    setProjectFolder(doc, nova);
    forgetThumbnails();
  }
  if (plan.swaps.length > 0) {
    for (const swap of plan.swaps) await ensureProvisional(doc, swap.to);
    const command = new SwapFolderImages(plan.swaps);
    corpo.run(command);
    forgetThumbnails();
  }
  const novas = vira ? folderSwapNewImages([...usadas, ...antigas], [...nova.images.keys()], plan) : 0;
  // Rodada 44, lote 5: o mesmo nome em OUTRA pasta é outro arquivo. As que
  // são da pasta ganham os pixels de lá (o mesmo conserto do Recarregar); as
  // de um atlas salvo continuam do atlas, e o rodapé diz quais.
  let mesmos: { recarregadas: string[]; noAtlas: string[] } | undefined;
  if (vira && plan.same.length > 0) {
    const daPasta = new Set(provisionalNames(doc));
    const recarregadas = plan.same.filter((name) => daPasta.has(name));
    await refreshProvisional(doc, recarregadas);
    forgetThumbnails();
    mesmos = { recarregadas, noAtlas: plan.same.filter((name) => !daPasta.has(name)) };
  }
  // Rodada 44, lote 6 (doc 71): a pasta não é passo de desfazer, e o rodapé diz.
  const volta = vira ? `. Para voltar, Trocar pasta de origem com a pasta de antes${plan.swaps.length > 0 ? ' (as trocas de imagem voltam com Ctrl+Z)' : ''}` : '';
  doc.notice(`${folderSwapNotice(nova.name, plan, novas, mesmos)}${plan.swaps.length > 0 ? wentToBase(doc) : ''}${volta}`);
}

/**
 * O tamanho da imagem para a dica, `" (46 × 42 px)"`, ou vazio quando não se
 * sabe — rodada 44, lote 3. O tamanho da tela inteira (sem o recorte), que é o
 * que o pivô conta.
 */
function imageSizeText(doc: EditorDoc, name: string): string {
  const region = findAtlasRegion(doc.atlases, name);
  const w = region === null ? folderImage(doc, name)?.width : (region.originalWidth ?? region.width);
  const h = region === null ? folderImage(doc, name)?.height : (region.originalHeight ?? region.height);
  return w === undefined || h === undefined ? '' : ` (${w} × ${h} px)`;
}

class PalettePanel implements Panel {
  readonly id = 'imagens';
  readonly title = 'Imagens';
  readonly listensTo = ['file', 'structure', 'assets'] as const;

  private doc: EditorDoc | null = null;
  private list: HTMLElement | null = null;
  private field: HTMLInputElement | null = null;
  private filtro = '';
  /**
   * A troca em todas as peles esperando a imagem nova — lote 39. Enquanto ela
   * está armada, **clicar** numa imagem troca; sem ela, clicar não faz nada e
   * o gesto do painel continua sendo arrastar.
   */
  private pick: SwapPick | null = null;
  private banner: HTMLElement | null = null;
  /** As imagens com pivôs diferentes do último Carimbar — lote 56. */
  private conflicts: PivotConflict[] = [];
  private warnBox: HTMLElement | null = null;
  /** A linha com o nome da pasta aberta, e os dois botões da pasta. */
  private folderLine: HTMLElement | null = null;
  private folderText: HTMLElement | null = null;
  private openButton: HTMLButtonElement | null = null;
  private reloadButton: HTMLButtonElement | null = null;
  private swapButton: HTMLButtonElement | null = null;
  private stopFolder: (() => void) | null = null;
  /** Lê a miniatura da pasta só quando a linha aparece na tela. */
  private watcher: IntersectionObserver | null = null;

  /** Arma a troca: a próxima imagem clicada substitui `pick.from`. */
  armSwap(pick: SwapPick): void {
    this.pick = pick;
    this.render();
  }

  /** Desarma a troca sem mudar nada. */
  cancelSwap(): void {
    if (this.pick === null) return;
    this.pick = null;
    this.render();
  }

  /** `true` enquanto a troca espera a imagem nova. Para os testes e o shell. */
  get swapArmed(): boolean {
    return this.pick !== null;
  }

  mount(doc: EditorDoc, host: HTMLElement): void {
    this.doc = doc;
    clear(host);
    // `painel` traz as cores do tema — o mesmo defeito da aba Ordem (lote 25).
    host.classList.add('painel', 'imagens');

    const busca = el('div', 'imagens-busca');
    const field = document.createElement('input');
    field.type = 'search';
    field.className = 'imagens-campo';
    field.placeholder = 'Buscar imagem';
    field.setAttribute('aria-label', 'Buscar imagem pelo nome');
    // Rodada 47, lote 5b (notas do doc 86), nota 4.
    field.title = 'Buscar imagem: escreva um pedaço do nome; a grade mostra só as que têm. Vazio mostra todas';
    field.value = this.filtro;
    // Filtra ao digitar: esperar o Enter para ver a lista encolher faz a busca
    // parecer quebrada nas duas primeiras letras.
    field.addEventListener('input', () => {
      this.filtro = field.value;
      this.render();
    });
    // As teclas do editor não podem roubar as letras de dentro do campo. O Esc
    // daqui desarma a troca em todas as peles, e para aqui: tecla tratada uma vez.
    field.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Escape' && this.pick !== null) {
        event.preventDefault();
        this.cancelSwap();
      }
    });
    this.field = field;
    // O Carimbar mora na linha da busca, e não numa linha própria: a coluna é
    // curta, e cada linha tirada dela é uma linha a menos de lista.
    const carimbar = iconButton('stamp', STAMP_HINT, () => this.stamp());
    carimbar.classList.add('imagens-carimbar');
    const pivo = iconButton('pivot', PIVOT_HINT, () => this.definePivotOfPicked());
    pivo.classList.add('imagens-pivo');
    busca.append(field, carimbar, pivo);

    // Lote 59: a linha da pasta, sempre à vista, com o botão dela — Abrir
    // quando não há pasta, Recarregar quando há. Na linha da busca não cabia:
    // com três botões a caixa de busca encolhia até "Bus".
    this.folderLine = el('div', 'imagens-pasta');
    this.folderText = el('span', 'imagens-pasta-nome');
    this.openButton = iconButton('open', OPEN_FOLDER_HINT, () => { void openFolderFromTab(this.doc); });
    this.openButton.classList.add('imagens-abrir');
    this.reloadButton = iconButton('reload', RELOAD_HINT, () => { void this.reload(); });
    this.reloadButton.classList.add('imagens-recarregar');
    // Degrau 8: trocar a pasta de ORIGEM é outro gesto que o Recarregar, e
    // mora ao lado dele porque é da mesma linha: a pasta.
    this.swapButton = iconButton('swap-folder', SWAP_FOLDER_HINT, () => { void this.swapFolder(); });
    this.swapButton.classList.add('imagens-trocar-pasta');
    this.folderLine.append(this.folderText, this.openButton, this.reloadButton, this.swapButton);
    this.stopFolder?.();
    this.stopFolder = onFolderChange(() => this.render());

    this.banner = el('div', 'imagens-troca');
    this.banner.hidden = true;

    this.warnBox = el('div', 'imagens-avisos');
    this.warnBox.hidden = true;

    this.list = el('div', 'imagens-lista');
    // A lista cresce com o arquivo, e por isso pode rolar: a prova
    // `medir-paineis.mjs` lê esta marca e deixa esta caixa em paz.
    this.list.dataset.rolagem = 'lista';
    this.list.setAttribute('role', 'list');
    host.append(busca, this.folderLine, this.banner, this.warnBox, this.list);
    this.render();
  }

  /** **Recarregar**: relê a pasta do disco, e o rodapé diz o que mudou. */
  private async reload(): Promise<void> {
    const doc = this.doc;
    if (doc === null) return;
    if (await reloadFolderOf(doc)) this.render();
  }

  /**
   * **Trocar pasta de origem…** — degrau 8, tarefa 8.3 (I4).
   *
   * Aponta para outra pasta e troca o acervo inteiro pelas imagens de mesmo
   * **nome de arquivo**. Um só passo de desfazer, e nome repetido lá **avisa e
   * não troca**: escolher por conta própria seria pôr a arte errada no
   * personagem em silêncio (regra 21).
   */
  private async swapFolder(): Promise<void> {
    const doc = this.doc;
    if (doc === null) return;
    await swapFolderOf(doc);
    this.render();
  }

  /** A linha da pasta e os botões dela, conforme há pasta ou não. */
  private renderFolder(doc: EditorDoc): void {
    const folder = projectFolder(doc);
    const named = folder !== null && folder.name !== '';
    if (this.openButton !== null) this.openButton.hidden = named;
    if (this.reloadButton !== null) this.reloadButton.hidden = !named;
    // A troca de origem só faz sentido com um personagem montado: sem desenho
    // nenhum não há acervo para trocar.
    if (this.swapButton !== null) this.swapButton.hidden = imagesInUse(corpoDe(doc).file).size === 0;
    const texto = this.folderText;
    if (texto === null) return;
    // Lote 62: conta só o que a aba mostra — a página do atlas não é peça.
    const total = folder === null ? 0 : shownFolderNames(doc).length;
    const quantas = folder === null ? ''
      : total === 1 ? '1 imagem' : `${total} imagens`;
    texto.textContent = folder === null ? 'Nenhuma pasta aberta'
      : named ? `Pasta ${folder.name} · ${quantas}` : `Imagens soltas · ${quantas}`;
    texto.title = folder === null ? OPEN_FOLDER_HINT
      : named
        ? `A pasta do projeto: ${folder.name}. Nada entra na cena sozinho: arraste a imagem`
        : 'Imagens soltas na janela. Para ter as subpastas: Arquivo → Abrir pasta do projeto…';
  }

  /** As subpastas dobradas, do navegador. */
  private folded(): string[] {
    try {
      return parseFolded(globalThis.localStorage?.getItem(FOLDED_KEY) ?? null);
    } catch {
      return [];
    }
  }

  private toggleSection(folder: string): void {
    const next = toggleFolded(this.folded(), folder);
    try {
      globalThis.localStorage?.setItem(FOLDED_KEY, JSON.stringify(next));
    } catch {
      // Sem armazenamento a dobra vale até a próxima volta da lista.
    }
    this.render();
  }

  /** A faixa que diz o que o clique vai fazer enquanto a troca está armada. */
  private renderBanner(): void {
    const banner = this.banner;
    if (banner === null) return;
    clear(banner);
    const pick = this.pick;
    banner.hidden = pick === null;
    if (pick === null) return;
    const peles = pick.skins.length === 1 ? '1 skin' : `${pick.skins.length} skins`;
    banner.append(el('span', 'imagens-troca-texto',
      `Clique na imagem nova para ${pick.from} (slot ${pick.slot}, ${peles}). Esc cancela.`));
    const fechar = document.createElement('button');
    fechar.type = 'button';
    fechar.className = 'imagens-troca-fechar';
    fechar.textContent = '✕';
    fechar.title = 'Cancelar a troca da imagem';
    fechar.setAttribute('aria-label', fechar.title);
    fechar.addEventListener('click', () => this.cancelSwap());
    banner.append(fechar);
  }

  /** Os avisos do último Carimbar, cada um com o botão que resolve. */
  private renderWarnings(doc: EditorDoc): void {
    const box = this.warnBox;
    if (box === null) return;
    clear(box);
    box.hidden = this.conflicts.length === 0;
    for (const conflict of this.conflicts) {
      const linha = el('div', 'imagens-aviso');
      linha.append(el('span', 'imagens-aviso-texto',
        `"${conflict.image}" é usada em ${conflict.count} lugares com pivôs diferentes`));
      linha.append(iconButton('duplicate',
        `Duplicar "${conflict.image}" no atlas: cada lugar com pivô diferente ganha a sua cópia`,
        () => this.duplicate(doc, conflict.image, conflict.groups.slice(1))));
      box.append(linha);
    }
  }

  /** Troca a imagem em todas as peles pela `name` e desarma. */
  private async finishSwap(doc: EditorDoc, name: string): Promise<void> {
    const pick = this.pick;
    if (pick === null) return;
    this.pick = null;
    // Lote 60: a imagem da pasta ganha a região antes, para cair pelo pivô.
    await ensureProvisional(doc, name);
    const command = new SwapImageEverywhere(pick.slot, pick.from, name);
    if (name !== pick.from) doc.run(command);
    doc.notice(swapNotice(pick, name, command.changed));
    this.render();
  }

  /**
   * **Carimbar pivôs.** Um passo de desfazer quando muda alguma coisa; quando
   * nada muda, só a frase. Os avisos ficam no painel, com o botão do lado.
   */
  private stamp(): void {
    const doc = this.doc;
    if (doc === null) return;
    this.conflicts = stampPivotsOf(doc);
    this.render();
  }

  /** Os avisos de um Carimbar feito pelo menu, com a aba fechada ou aberta. */
  showConflicts(conflicts: PivotConflict[]): void {
    this.conflicts = conflicts;
    this.render();
  }

  /** **Duplicar no atlas**: uma cópia por grupo, e os desenhos do grupo apontando para ela. */
  private duplicate(doc: EditorDoc, image: string, groups: ReadonlyArray<readonly AttachmentRef[]>): void {
    const command = new DuplicateInAtlasCommand(image, groups);
    doc.run(command);
    const moved = groups.reduce((total, group) => total + group.length, 0);
    this.conflicts = this.conflicts.filter((conflict) => conflict.image !== image);
    doc.notice(duplicateNotice(image, command.names, moved));
    this.render();
  }

  private closeMenu(): void {
    closeFloatingMenu();
  }

  /**
   * O botão com ícone: a imagem do desenho escolhido na Árvore. Público desde
   * o lote 60: o botão direito no desenho, na cena, chama o mesmo.
   */
  definePivotOfPicked(): void {
    const doc = this.doc;
    if (doc === null) return;
    void definePivotOfSelection(doc);
  }

  /** **Definir pivô…** da imagem `image`: a mesma de `definePivotOf`. */
  private async definePivot(doc: EditorDoc, image: string): Promise<void> {
    await definePivotOf(doc, image);
  }

  /** Todo nome de imagem que a aba conhece: os dos atlas e os da pasta. */
  private allNames(): string[] {
    const doc = this.doc;
    return doc === null ? [] : allImageNames(doc);
  }

  /**
   * O tamanho e o pivô de hoje de uma imagem — da região, ou do arquivo da
   * pasta com o pivô guardado para ela. `saved` diz se havia pivô de verdade,
   * ou se é o centro, que é o que a imagem sem pivô usa. `null` quando a
   * imagem não está em lugar nenhum.
   */
  private async pivotInfo(doc: EditorDoc, image: string): Promise<
    { ow: number; oh: number; x: number; y: number; saved: boolean; inAtlas: boolean } | null
  > {
    const region = findAtlasRegion(doc.atlases, image);
    if (region !== null) {
      const ow = region.originalWidth;
      const oh = region.originalHeight;
      const saved = region.pivotX !== undefined || region.pivotY !== undefined;
      return { ow, oh, x: region.pivotX ?? ow / 2, y: region.pivotY ?? oh / 2, saved, inAtlas: true };
    }
    const own = folderImage(doc, image);
    const bitmap = own === null ? null : await folderBitmap(own);
    if (bitmap === null) return null;
    const guardado = readFolderPivots(doc.file)[image];
    const ow = bitmap.width;
    const oh = bitmap.height;
    return guardado === undefined
      ? { ow, oh, x: ow / 2, y: oh / 2, saved: false, inAtlas: false }
      : { ow, oh, x: guardado[0], y: guardado[1], saved: true, inAtlas: false };
  }

  /**
   * **Copiar pivô**: o de hoje, ou o centro quando a imagem não tem. Lote 3 da
   * rodada final: vale também para a imagem que só está na pasta, e SEMPRE
   * diz o que fez — antes, nela, calava (regra 21).
   */
  async copyPivot(doc: EditorDoc, image: string): Promise<void> {
    const info = await this.pivotInfo(doc, image);
    if (info === null) {
      doc.notice(`"${image}" não está em nenhum atlas aberto, nem na pasta: não há pivô para copiar`);
      return;
    }
    pivotClipboard = { image, ow: info.ow, oh: info.oh, x: info.x, y: info.y };
    doc.notice(copyNotice(image, info.saved));
  }

  /** **Colar pivô**: a proporção do copiado, no tamanho desta imagem — da pasta também. */
  async pastePivotOn(doc: EditorDoc, image: string): Promise<void> {
    const clip = pivotClipboard;
    if (clip === null) {
      doc.notice('Copie o pivô de uma imagem primeiro: botão direito, Copiar pivô');
      return;
    }
    const info = await this.pivotInfo(doc, image);
    if (info === null) {
      doc.notice(`"${image}" não está em nenhum atlas aberto, nem na pasta`);
      return;
    }
    const pivot = pastePivot(clip, clip, { ow: info.ow, oh: info.oh });
    if (!info.inAtlas) {
      doc.run(new SetFolderPivotCommand([{ name: image, x: pivot.x, y: pivot.y }], 'Colar pivô'));
      doc.notice(`${pivotNotice(image, pivot, 0)}, colado de "${clip.image}". Guardado para quando ela entrar na cena`);
      return;
    }
    const command = new SetPivotCommand(image, pivot, 'Colar pivô');
    doc.run(command);
    doc.notice(`${pivotNotice(image, pivot, command.moved, command)}, colado de "${clip.image}"`);
  }

  /**
   * O botão direito numa imagem — lote 56. Com um desenho escolhido na Árvore
   * que usa esta imagem, a cópia vai para ele; sem, é só a cópia.
   */
  private openMenu(doc: EditorDoc, image: string, x: number, y: number): void {
    const items: FloatingItem[] = [];
    const item = (label: string, hint: string, run: () => void): void => {
      items.push({ label, hint, run });
    };

    // Lote 60: o gesto do Spriter — o botão direito numa imagem troca o
    // desenho escolhido por ela. Cinza sem desenho escolhido, e a dica diz.
    const alvo = targetOfSelection(doc);
    items.push({
      label: 'Usar no desenho escolhido',
      hint: alvo === null
        ? 'Escolha antes um desenho com imagem, na cena ou na Árvore'
        : `${alvo.slot}/${alvo.attachment} passa a mostrar "${image}", no lugar pelo pivô`,
      enabled: alvo !== null,
      run: () => { if (alvo !== null) void chooseImage(doc, alvo, image); },
    });

    // Lote 58: o pivô à mão, para a imagem que ainda não tem rig.
    item('Definir pivô…', `Abre a janela: clique na articulação de "${image}", ou use os nove pontos`,
      () => { void this.definePivot(doc, image); });
    item('Copiar pivô', `Guarda o pivô de "${image}", em proporção, para colar em outra imagem`,
      () => { void this.copyPivot(doc, image); });
    item('Colar pivô', pivotClipboard === null
      ? 'Copie o pivô de uma imagem primeiro'
      : `Põe em "${image}" o pivô copiado de "${pivotClipboard.image}", na mesma proporção`,
    () => { void this.pastePivotOn(doc, image); });

    const picked = doc.selection.attachments[0];
    const refs = picked === undefined ? []
      : refsUsing(corpoDe(doc).file, picked.slot, picked.attachment, image);
    const onde = picked === undefined ? '' : `${picked.slot}/${picked.attachment}`;
    item('Duplicar no atlas', refs.length === 0
      ? `Faz uma cópia de "${image}" no atlas, com outro nome e o mesmo desenho`
      : `Faz uma cópia de "${image}" no atlas, e ${onde} passa a usar a cópia`,
    () => this.duplicate(doc, image, [refs]));

    openFloatingMenu(x, y, items, 'imagens-menu');
  }

  /**
   * O botão direito no cabeçalho de uma subpasta — degrau 8, tarefa 8.6.
   *
   * Uma opção só, e ela só fica acesa quando a subpasta é mesmo uma corrida
   * numerada. Apagada, a dica diz **por quê** — que é o ponto: quem tem
   * `fogo_01, fogo_02, fogo_09` precisa saber que falta o meio, e não ficar
   * olhando um botão morto sem explicação (regra 21).
   */
  private openSectionMenu(
    doc: EditorDoc, secao: { folder: string; entries: readonly PaletteEntry[] },
    run: NumberedRun | null, x: number, y: number,
  ): void {
    const nome = secao.folder === '' ? ROOT_SECTION : secao.folder;
    openFloatingMenu(x, y, [{
      label: 'Trazer como sequência',
      hint: run === null
        ? `${nome} não é uma corrida numerada: para virar sequência, as imagens têm de ter o `
          + 'mesmo nome com números seguidos no fim, do mesmo tamanho de algarismos '
          + '(olho_01, olho_02, olho_03…)'
        : `${sequenceNotice(run)}. Ele nasce na raiz, na origem, como uma imagem arrastada`,
      enabled: run !== null,
      run: () => { if (run !== null) void this.dropSequence(doc, run); },
    }], 'imagens-menu');
  }

  /** Cria o desenho de sequência na cena, num passo de desfazer. */
  async dropSequence(doc: EditorDoc, run: NumberedRun): Promise<void> {
    // Cada quadro precisa de região: sem isso o primeiro quadro não desenha, e
    // a peça entraria invisível.
    for (const frame of run.frames) await ensureProvisional(doc, frame);
    const corpo = corpoDe(doc);
    const place = dropPlace(corpo.skeleton, corpo.file, 0, 0);
    const command = new DropImageAsSlot(
      corpo.file, run.frames[0]!, place.bone, doc.visibleSkins, place.x, place.y, null, run,
    );
    corpo.run(command);
    doc.notice(`${sequenceDropNotice(command.name, run)}${wentToBase(doc)}`);
    this.render();
  }

  refresh(change: DocChange): void {
    // Outro arquivo, outros avisos: os do Carimbar de antes não valem mais.
    if (change.kind === 'file') this.conflicts = [];
    this.render();
  }

  unmount(): void {
    this.closeMenu();
    this.stopFolder?.();
    this.stopFolder = null;
    this.watcher?.disconnect();
    this.watcher = null;
    this.doc = null;
    this.list = null;
    this.field = null;
    this.warnBox = null;
  }

  /** Todo nome de região dos atlas do documento, na ordem em que estão. */
  private atlasNames(): string[] {
    const doc = this.doc;
    if (doc === null) return [];
    const out: string[] = [];
    for (const atlas of doc.atlases) {
      for (const region of atlas.regions) out.push(region.name);
    }
    return out;
  }

  private render(): void {
    const doc = this.doc;
    const list = this.list;
    if (doc === null || list === null) return;
    this.renderBanner();
    this.renderWarnings(doc);
    list.classList.toggle('imagens-escolhendo', this.pick !== null);
    clear(list);
    this.renderFolder(doc);
    this.watcher?.disconnect();
    this.watcher = null;

    const atlas = this.atlasNames();
    // Lote 62: as páginas de atlas que moram na pasta não são peças.
    const nomes = paletteNames(atlas, shownFolderNames(doc));
    if (nomes.length === 0) {
      list.append(el('p', 'imagens-vazio', NO_ATLAS));
      return;
    }

    const linhas = paletteEntries(nomes, doc.file, this.filtro);
    if (linhas.length === 0) {
      list.append(el('p', 'imagens-vazio',
        `Nenhuma imagem com "${this.filtro}". São ${nomes.length} ao todo.`));
      return;
    }
    const naAtlas = new Set(atlas);
    const secoes = paletteSections(linhas);
    // Buscando, tudo aberto: a busca que acha a imagem numa pasta dobrada e não
    // mostra parece que não achou.
    const dobradas = this.filtro.trim() === '' ? new Set(this.folded()) : new Set<string>();
    for (const secao of secoes) {
      // Uma seção só dispensa o cabeçalho: não há o que separar.
      if (secoes.length > 1) {
        const fechada = dobradas.has(secao.folder);
        const cabeca = el('button', 'imagens-secao') as HTMLButtonElement;
        cabeca.type = 'button';
        cabeca.setAttribute('aria-expanded', String(!fechada));
        const nome = secao.folder === '' ? ROOT_SECTION : secao.folder;
        cabeca.append(el('span', 'imagens-secao-seta', fechada ? '▸' : '▾'),
          el('span', 'imagens-secao-nome', nome),
          el('span', 'imagens-secao-conta', String(secao.entries.length)));
        // Degrau 8, tarefa 8.6: a subpasta numerada é UM desenho que pisca.
        const run = numberedSequence(secao.entries.map((entry) => entry.name));
        cabeca.title = run === null
          ? `${fechada ? 'Abrir' : 'Dobrar'} a subpasta ${nome}: ${secao.entries.length} imagens`
          : `${fechada ? 'Abrir' : 'Dobrar'} a subpasta ${nome}. ${sequenceNotice(run)}. `
            + 'Botão direito: Trazer como sequência';
        if (run !== null) {
          cabeca.append(el('span', 'imagens-secao-sequencia', '▶'));
          cabeca.classList.add('imagens-secao-numerada');
        }
        cabeca.addEventListener('click', () => this.toggleSection(secao.folder));
        cabeca.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.openSectionMenu(doc, secao, run, event.clientX, event.clientY);
        });
        list.append(cabeca);
        if (fechada) continue;
      }
      for (const linha of secao.entries) list.append(this.buildRow(doc, linha, naAtlas.has(linha.name)));
    }
  }

  /**
   * A miniatura de uma imagem que só está na pasta — lote 59. Os pixels são
   * lidos quando a linha aparece na tela, e não quando a pasta abre.
   */
  private lazyThumb(doc: EditorDoc, name: string, img: HTMLImageElement, cova: HTMLElement): void {
    const image = folderImage(doc, name);
    if (image === null) return;
    const load = (): void => {
      void folderThumbnail(image, PALETTE_THUMB).then(async (url) => {
        if (url === null) return;
        img.src = url;
        cova.append(img);
        // Lote 3 da rodada final (Q4): o pivô guardado para a imagem que ainda
        // só está na pasta aparece na miniatura, como o da que já tem região.
        // Sem isto o pivô era gravado e não se via — "criei e sumiu".
        const guardado = readFolderPivots(doc.file)[name];
        if (guardado === undefined) return;
        const tamanho = image.width !== undefined && image.height !== undefined
          ? { width: image.width, height: image.height }
          : await folderBitmap(image);
        if (tamanho === null) return;
        const at = crossInThumb({ x: guardado[0], y: guardado[1] }, tamanho, PALETTE_THUMB);
        const cruz = el('span', 'pivos-cruz pivos-cruz-mini imagens-cruz');
        cruz.style.left = `${Math.round(at.x)}px`;
        cruz.style.top = `${Math.round(at.y)}px`;
        cova.append(cruz);
      });
    };
    if (typeof IntersectionObserver !== 'function') {
      load();
      return;
    }
    if (this.watcher === null) {
      this.watcher = new IntersectionObserver((seen) => {
        for (const item of seen) {
          if (!item.isIntersecting) continue;
          this.watcher?.unobserve(item.target);
          (item.target as HTMLElement & { recorteLoad?: () => void }).recorteLoad?.();
        }
      }, { root: this.list, rootMargin: '200px' });
    }
    (cova as HTMLElement & { recorteLoad?: () => void }).recorteLoad = load;
    this.watcher.observe(cova);
  }

  private buildRow(doc: EditorDoc, entry: PaletteEntry, inAtlas = true): HTMLElement {
    const node = el('div', entry.usedBy === 0 ? 'imagens-linha imagens-sem-uso' : 'imagens-linha');
    node.setAttribute('role', 'listitem');
    // Lote 60: toda imagem arrasta. A que só está na pasta ganha a região
    // provisória na hora em que é solta, na cena ou na Árvore.
    node.draggable = true;
    node.dataset['imagem'] = entry.name;

    const cova = el('div', 'imagens-mini');
    const img = el('img') as HTMLImageElement;
    img.width = PALETTE_THUMB;
    img.height = PALETTE_THUMB;
    // A imagem é decoração: quem diz o nome é o texto embaixo dela.
    img.alt = '';
    // A cruz laranja é o pivô da imagem, quando ele está carimbado — lote 56.
    const url = inAtlas ? thumbnailFor(doc, entry.name, PALETTE_THUMB, true) : null;
    if (url !== null) {
      img.src = url;
      cova.append(img);
    } else if (!inAtlas) {
      this.lazyThumb(doc, entry.name, img, cova);
    }

    // O nome sem a subpasta: a subpasta já está no cabeçalho da seção.
    const curto = entry.name.slice(entry.name.lastIndexOf('/') + 1);
    const nome = el('span', 'imagens-nome', curto);
    const quantos = entry.usedBy === 0
      ? 'nenhum slot usa esta imagem'
      : entry.usedBy === 1 ? 'um slot usa esta imagem' : `${entry.usedBy} slots usam esta imagem`;
    // O ponto com o número: só em imagem usada. A que só está na pasta fica sem.
    if (entry.usedBy > 0) {
      const conta = el('span', 'imagens-conta', String(entry.usedBy));
      conta.title = quantos;
      node.append(conta);
    }
    const sumiu = folderImage(doc, entry.name)?.missing === true;
    if (sumiu) node.classList.add('imagens-sumiu');

    // Rodada 44, lote 3: o tamanho em px, como o Spine mostra ao parar o mouse.
    const tamanho = imageSizeText(doc, entry.name);
    const dica = this.pick !== null
      ? `${entry.name}: clique para trocar ${this.pick.from} por esta, em todas as skins`
      : !inAtlas
        ? `${entry.name}${tamanho}: na pasta do projeto${sumiu ? ', mas o arquivo sumiu' : ''}. ${quantos}. `
          + `Arraste para a cena para criar o desenho ali. ${DOUBLE_CLICK_HINT}. `
          + 'Botão direito: Usar no desenho escolhido'
        : `${entry.name}${tamanho}: ${quantos}. Arraste para a cena para criar o desenho ali, `
          + `ou para um slot ou desenho da Árvore. ${DOUBLE_CLICK_HINT}. Botão direito: Duplicar no atlas`;
    node.title = dica;
    node.setAttribute('aria-label', dica);
    if (this.pick !== null) {
      // Armada, a linha vira botão: clique e Enter trocam.
      node.setAttribute('role', 'button');
      node.tabIndex = 0;
      node.addEventListener('click', () => this.finishSwap(doc, entry.name));
      node.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        this.finishSwap(doc, entry.name);
      });
    }

    node.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.openMenu(doc, entry.name, event.clientX, event.clientY);
    });

    // Lote 3 da rodada final (Q1): o duplo clique abre o pivô, como no Spriter.
    // Com a troca armada o clique já troca: aí o duplo clique não abre nada.
    node.addEventListener('dblclick', (event) => {
      if (this.pick !== null) return;
      event.preventDefault();
      event.stopPropagation();
      void this.definePivot(doc, entry.name);
    });

    node.addEventListener('dragstart', (event) => {
      event.dataTransfer?.setData(DRAG_TYPE, entry.name);
      // `text/plain` junto, para o arrasto funcionar em navegador que ignora
      // um tipo próprio — o nome sozinho não faz mal a ninguém.
      event.dataTransfer?.setData('text/plain', entry.name);
      if (event.dataTransfer !== null) event.dataTransfer.effectAllowed = 'copy';
    });

    node.append(cova, nome);
    return node;
  }
}

export const palettePanel = new PalettePanel();
registerPanel(palettePanel);
