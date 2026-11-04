/**
 * A casca: soltar arquivo na janela, e não perder o trabalho — lote A5a,
 * plano arrumação (v10.8).
 *
 * A faixa que diz o que vai acontecer ao soltar, abrir o que foi solto, a
 * pergunta antes de jogar trabalho fora, a guarda de fechar a aba e o
 * rascunho automático. Cortado de `shell.ts` pelas seções "Soltar arquivo na
 * janela" e "Não perder o trabalho": cada método virou uma função que recebe
 * a casca (`shell`), e a classe `Shell` guarda um método de uma linha.
 */

import { clearDraft, draftMove, draftOnExit, shouldWriteDraft, writeDraft } from '../doc/rascunho.js';
import type { DraftStorage } from '../doc/rascunho.js';
import { abrindoPelaPasta, forgetHandle, readOpenedFiles } from '../io/open-save.js';
import { adoptFolderAtlases } from '../io/folder-save.js';
import {
  asepritePair, dropHintFor, dropPlan, isInternalDrag, numberedSequence, replacesDocument,
} from '../io/drop-plan.js';
import { asepriteSheet, sheetNotice } from '../io/aseprite-sheet.js';
import {
  AddSheetAnimations, SheetDropCommand, tagAnimations, tagAnimationsNotice,
} from '../io/aseprite-tags.js';
import { ensureSheet } from '../io/folder-atlas.js';
import { DropImageAsSlot, dropPlace, sequenceDropNotice } from '../panels/palette-model.js';
import { corpoDe, wentToBase } from '../contract.js';
import { forgetImportedImages } from '../io/import-images.js';
import { addLooseFiles, projectFolder, rootFileNames } from '../io/project-folder.js';
import type { FolderDirectoryHandle } from '../io/project-folder.js';
import { FORMAT_LABELS, adoptForeignImages, importForeignProject } from '../io/import-foreign.js';
import { dropEntries, filesOfEntries, hasFolder, pedirAlcas, planoDaPastaSolta } from '../io/drop-folder.js';
import { importPsd, psdWarningsNote } from '../io/import-psd.js';
import { askChoice, askPick, tellUser } from './dialog.js';
import { isHeavy, weighImageFiles, weightLead, weightOptions } from '../io/import-weight.js';
import { isFolderImage } from '../io/project-folder.js';
import { el } from './dom.js';
import type { Shell } from './shell.js';
import { namesOfDrag } from './shell.js';

// -------------------------------------------------------------------------
// Soltar arquivo na janela — anotação 23, lote 36
// -------------------------------------------------------------------------

/**
 * Aceita arquivo solto em qualquer canto da janela.
 *
 * Só arquivo: um arrasto de dentro do programa — a aba de um painel, a linha
 * da Árvore, a miniatura do painel Imagens — não carrega `Files` no
 * `dataTransfer`, e passa reto por aqui.
 *
 * Os ouvintes ficam no `document` porque a janela inteira é o alvo: quem
 * arrasta um `.bone` não mira o canvas, mira o programa.
 */
export function armFileDrop(shell: Shell): void {
  // J5 (29/09/2026): um arrasto de DENTRO do programa (a miniatura da aba
  // Imagens, uma pele, uma entidade) também pode trazer `Files`. Ele já tem
  // dono, e a janela não o trata uma segunda vez (regra 12).
  const temArquivo = (event: DragEvent): boolean => (
    event.dataTransfer !== null && [...event.dataTransfer.types].includes('Files')
    && !isInternalDrag(event.dataTransfer.types)
  );
  document.addEventListener('dragover', (event) => {
    if (!temArquivo(event)) return;
    // Sem o `preventDefault` o navegador ABRE o arquivo por cima da página,
    // e o trabalho da sessão morre sem uma palavra.
    event.preventDefault();
    if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'copy';
    shell.showDropBanner(dropHintFor(dropPlan(namesOfDrag(event))));
  });
  document.addEventListener('dragleave', (event) => {
    // `relatedTarget` nulo é a saída pela borda da janela; entre elementos de
    // dentro ele aponta para o vizinho, e aí a faixa não pode piscar.
    if (event.relatedTarget === null) shell.hideDropBanner();
  });
  document.addEventListener('drop', (event) => {
    if (!temArquivo(event)) return;
    event.preventDefault();
    shell.hideDropBanner();
    // E3 (29/09/2026): uma PASTA solta chega aqui só com o nome. As entradas
    // são pegas agora — depois do evento o navegador as esvazia — e a leitura
    // desce nas subpastas, como o Spriter e o Spine fazem com a pasta do projeto.
    const entradas = dropEntries(event.dataTransfer);
    // Rodada 48 (a mão do Humberto): a alça da pasta, pedida agora também.
    // Com ela, a pasta solta abre como projeto, sem o seletor do Windows.
    const alcas = pedirAlcas(event.dataTransfer);
    if (entradas !== null && hasFolder(entradas)) {
      void (async () => {
        const lidas = alcas === null ? null : await Promise.all(alcas);
        const alca = lidas?.[0] as FolderDirectoryHandle | null | undefined;
        const raiz = alca?.kind === 'directory' ? await rootFileNames(alca) : [];
        if (planoDaPastaSolta(entradas, lidas, raiz).kind === 'abrir-pasta' && alca) {
          await shell.openDroppedFolder(alca);
          return;
        }
        const { files, unread } = await filesOfEntries(entradas);
        if (unread.length > 0) {
          shell.doc.notice(`${unread.length} arquivo(s) da pasta não se deixaram ler: ${unread.slice(0, 3).join(', ')}`);
        }
        if (files.length > 0) await shell.openDropped(files);
      })();
      return;
    }
    const arquivos = [...(event.dataTransfer?.files ?? [])];
    if (arquivos.length > 0) void shell.openDropped(arquivos);
  });
}

/** A faixa "Solte para…", que diz o que vai acontecer ANTES de acontecer. */
export function showDropBanner(shell: Shell, text: string): void {
  let faixa = shell.dropBanner;
  if (faixa === null) {
    faixa = el('div', { class: 'drop-faixa' });
    shell.root?.append(faixa);
    shell.dropBanner = faixa;
  }
  faixa.textContent = text;
  faixa.hidden = false;
}

export function hideDropBanner(shell: Shell): void {
  if (shell.dropBanner !== null) shell.dropBanner.hidden = true;
}

/**
 * Faz o que o `dropPlan` decidiu.
 *
 * Cada caminho é o MESMO do menu: abrir, importar PSD, importar de outro
 * programa, pôr imagem no atlas. O arrasto é uma porta nova para portas que
 * já existiam, e não um segundo jeito de fazer as mesmas coisas.
 */
/**
 * A folha do Aseprite, se for uma. `true` quando ela foi tratada aqui.
 *
 * O caminho inteiro, e nenhum passo é palpite: o par candidato sai do NOME
 * (`asepritePair`), o `.json` é lido e conferido pelo CONTEÚDO
 * (`asepriteSheet`), o PNG entra na aba Imagens como qualquer imagem solta, os
 * quadros viram regiões de uma página só (`ensureSheet`), e o desenho que
 * pisca nasce na cena pelo MESMO comando que o botão direito da subpasta usa
 * desde o degrau 8. Uma folha e uma pasta numerada chegam ao mesmo lugar.
 *
 * Em qualquer tropeço devolve `false` sem escrever nada, e o arrasto segue
 * pelo caminho de antes — que ao menos diz que não sabe (regra 21).
 */
async function dropAsepriteSheet(shell: Shell, files: readonly File[]): Promise<boolean> {
  const par = asepritePair(files.map((file) => file.name));
  if (par === null) return false;
  const jsonFile = files.find((file) => file.name === par.json);
  const pngFile = files.find((file) => file.name === par.image);
  if (jsonFile === undefined || pngFile === undefined) return false;
  const folha = asepriteSheet(await jsonFile.text(), par.image);
  if (folha === null) return false;

  const doc = shell.doc;
  addLooseFiles(doc, [pngFile]);
  const nome = par.image.replace(/\.[^.]+$/, '');
  if (!await ensureSheet(doc, folha, nome)) {
    doc.notice(`${sheetNotice(folha)} — mas o navegador não conseguiu ler os pixels de ${par.image}`);
    return true;
  }

  const corpo = corpoDe(doc);
  const place = dropPlace(corpo.skeleton, corpo.file, 0, 0);
  const run = {
    path: `${nome}_`, start: 1,
    digits: String(folha.names.length).length > 2 ? String(folha.names.length).length : 2,
    count: folha.names.length, frames: folha.names,
  };
  const drop = new DropImageAsSlot(
    corpo.file, folha.names[0]!, place.bone, doc.visibleSkins, place.x, place.y, null, run,
  );
  // Rodada final, lote 2 (28/09/2026): cada etiqueta vira uma animação, e o
  // desenho e as animações entram como UM passo de desfazer. Com a animação
  // aberta num OUTRO corpo (9.13) o desenho vai para a base dele, e a animação
  // — que mora neste arquivo — não pode apontar para um slot de lá: aí as
  // etiquetas não viram nada, e o rodapé diz.
  const etiquetas = folha.tags.length === 0 || corpo !== doc
    ? null
    : tagAnimations(
      folha, { slot: drop.name, attachment: drop.name, skin: drop.skin },
      (doc.file.animations ?? []).map((animation) => animation.name),
    );
  corpo.run(etiquetas !== null && etiquetas.animations.length > 0
    ? new SheetDropCommand(drop.label, drop, new AddSheetAnimations(etiquetas.animations))
    : drop);
  shell.showPanel('imagens');
  const sobreEtiquetas = folha.tags.length === 0
    ? ''
    : etiquetas === null
      ? '. As etiquetas NÃO viraram animação: a animação aberta é de outra base, e o desenho '
        + 'foi para a base dele. Abra a base deste arquivo e solte a folha de novo'
      : `. ${tagAnimationsNotice(etiquetas)}`;
  shell.statusState.textContent =
    `${sheetNotice(folha)}. ${sequenceDropNotice(drop.name, run)}${wentToBase(doc)}${sobreEtiquetas}`;
  return true;
}

/**
 * **O .bone que está na pasta aberta abre pela pasta** — rodada 45, lote 6
 * (doc `78`, b). O Ctrl+O e o arrasto trazem só o arquivo escolhido; o atlas,
 * que está na mesma pasta, nem era lido, e o aviso dizia "não está na pasta" —
 * falso. Quando o `.bone` e os atlas que ele cita estão na raiz da pasta do
 * projeto, ele abre por ela, com as imagens. `true` = abriu assim.
 */
export async function abrirPelaPastaSeCouber(
  shell: Shell, opened: { path: string | null; file: { assets?: { atlases?: readonly string[] } }; atlases: readonly unknown[] },
): Promise<boolean> {
  const folder = projectFolder(shell.doc);
  if (folder === null || folder.handle === null || opened.path === null) return false;
  const wanted = opened.file.assets?.atlases ?? [];
  if (wanted.length === 0 || opened.atlases.length > 0) return false;
  const raiz = await rootFileNames(folder.handle);
  const nome = opened.path.split(/[\\/]/).pop() ?? opened.path;
  if (!atlasNaPasta(nome, wanted, raiz)) return false;
  await shell.startInFolder(folder, nome);
  return true;
}

/** `true` quando o `.bone` e todos os atlas que ele cita estão na raiz. Puro. */
export function atlasNaPasta(bone: string, atlases: readonly string[], raiz: readonly string[]): boolean {
  if (!raiz.includes(bone)) return false;
  return atlases.every((atlas) => raiz.includes(atlas.split(/[\\/]/).pop() ?? atlas));
}

export async function openDropped(shell: Shell, files: readonly File[]): Promise<void> {
  const plano = dropPlan(files.map((file) => file.name));
  if (plano.kind === 'nada') {
    shell.doc.notice(plano.why);
    return;
  }
  // **A folha animada do Aseprite** — §6 item 1, a outra metade (22/09/2026).
  //
  // Vem ANTES do `switch` de propósito: pelo NOME, o `.json` da folha é igual
  // ao do Spine, ao do DragonBones e ao `.scon` do Spriter, então o `dropPlan`
  // — que só vê nomes — manda o par para `'outro'`, o `detectFormat` devolve
  // `null`, e a pessoa leva um *"não sei de que programa é"* com o PNG jogado
  // fora. Quem desempata é o CONTEÚDO, e o conteúdo só se lê aqui.
  if (await dropAsepriteSheet(shell, files)) return;
  if (replacesDocument(plano) && !(await shell.confirmDiscard())) return;
  try {
    switch (plano.kind) {
      case 'escolher': {
        // Vários esqueletos: quem escolhe é a pessoa. O escolhido vai na
        // FRENTE da lista, porque é o primeiro que o leitor encontra; os
        // outros continuam na lista e servem de esqueleto filho (§7.11).
        const qual = await askPick({
          title: 'Qual boneco abrir?',
          placeholder: 'Nome do arquivo',
          search: (texto) => {
            const busca = texto.trim().toLowerCase();
            return plano.skeletons
              .filter((nome) => busca === '' || nome.toLowerCase().includes(busca))
              .map((nome) => ({ id: nome, label: nome }));
          },
        });
        if (qual === null) return;
        const ordenados = [
          ...files.filter((file) => file.name === qual),
          ...files.filter((file) => file.name !== qual),
        ];
        const aberto = await readOpenedFiles(ordenados);
        if (aberto === null) return;
        // Doc 78, b: o .bone da pasta aberta, com o atlas lá, abre pela pasta.
        if (await abrirPelaPastaSeCouber(shell, aberto)) return;
        forgetHandle();
        forgetImportedImages(shell.doc);
        shell.doc.setFile(aberto.file, {
          path: aberto.path, atlases: aberto.atlases, images: aberto.images,
          skeletons: aberto.skeletons,
        });
        await adoptFolderAtlases(shell.doc);
        shell.statusState.textContent = aberto.warnings[0] ?? `${qual} aberto pelo arrasto.`;
        return;
      }
      case 'abrir': {
        // Rodada 45, lote 4 (doc 64, b): com a pasta do projeto aberta, o aviso
        // do atlas que falta diz a pasta, em vez de mandar abrir a pasta.
        const pastaAberta = projectFolder(shell.doc)?.name ?? '';
        abrindoPelaPasta(pastaAberta === '' ? null : pastaAberta);
        let aberto: Awaited<ReturnType<typeof readOpenedFiles>>;
        try {
          aberto = await readOpenedFiles(files);
        } finally {
          abrindoPelaPasta(null);
        }
        if (aberto === null) return;
        forgetHandle();
        forgetImportedImages(shell.doc);
        shell.doc.setFile(aberto.file, {
          path: aberto.path, atlases: aberto.atlases, images: aberto.images,
          skeletons: aberto.skeletons,
        });
        await adoptFolderAtlases(shell.doc);
        shell.statusState.textContent = aberto.warnings[0]
          ?? `${plano.skeleton} aberto pelo arrasto.`;
        return;
      }
      case 'psd': {
        const alvo = files.find((file) => file.name === plano.file);
        if (alvo === undefined) return;
        const feito = await importPsd(shell.doc, { file: alvo });
        if (feito !== null) {
          const aviso = psdWarningsNote(feito);
          if (aviso !== null) await tellUser(aviso);
          shell.statusState.textContent = feito.summary;
        }
        return;
      }
      case 'outro': {
        // E2 (29/09/2026): o projeto do Spriter traz as imagens soltas. Elas
        // entram na aba Imagens, e as que o boneco usa vão para a cena.
        const escolhidos = await gateHeavyForeign(shell, files);
        if (escolhidos === null) return;
        const importado = await importForeignProject(escolhidos);
        forgetHandle();
        forgetImportedImages(shell.doc);
        shell.doc.setFile(importado.file, {
          path: importado.path, atlases: importado.atlases, images: importado.images,
        });
        const programa = FORMAT_LABELS[importado.format];
        shell.statusState.textContent = `Importado do ${programa}: ${importado.path}. Lendo as imagens…`;
        const ligadas = await adoptForeignImages(shell.doc, importado, (feitas, total) => {
          shell.statusState.textContent =
            `Importado do ${programa}: ${importado.path}. Lendo as imagens… ${feitas} de ${total}`;
        });
        if (ligadas.notice !== null) shell.showPanel('imagens');
        shell.statusState.textContent =
          `Importado do ${programa}: ${importado.path}.${ligadas.notice === null ? '' : ` ${ligadas.notice}`}`;
        return;
      }
      default: {
        // Lote 59: as imagens vão para a aba Imagens, e não para a cena.
        // Nada de fila, nada de atlas empacotado na hora, nada de passo de
        // desfazer: o personagem só muda quando alguém arrasta.
        const escolhidas = files.filter((file) => plano.files.includes(file.name));
        // Rodada 7: sem pasta, soltar imagem pede a pasta antes (uma vez).
        if (await shell.askFolderFirst('soltar') === 'cancelar') return;
        const feito = addLooseFiles(shell.doc, escolhidas);
        shell.showPanel('imagens');
        const quantas = feito.added.length + feito.replaced.length;
        // Degrau 8, tarefa 8.6: soltas juntas, imagens numeradas são UM desenho
        // que pisca. A cena continua não ganhando nada sozinha (lote 59): o que
        // muda é a frase, que diz onde está o gesto em vez de deixar quem
        // soltou oito quadros de fogo achando que virou bagunça.
        const corrida = numberedSequence([...feito.added, ...feito.replaced]);
        shell.statusState.textContent = corrida !== null
          ? `${quantas} imagens numeradas entraram na aba Imagens: são UM desenho de `
            + `${corrida.count} quadros. Botão direito na subpasta → Trazer como sequência`
          : quantas === 1
            ? '1 imagem entrou na aba Imagens. Arraste para a cena para usar'
            : `${quantas} imagens entraram na aba Imagens. Arraste para a cena para usar`;
        // Rodada 7: sem pasta, o rodapé diz (regra 21).
        if (projectFolder(shell.doc)?.name === '') shell.statusState.textContent += '. O projeto está sem pasta';
      }
    }
  } catch (error) {
    await shell.reportFailure('Não deu para abrir o que você soltou', error);
  }
}

/**
 * **O peso, antes de ler** — E6, rodada 3 (05/10/2026).
 *
 * Um projeto de outro programa que, aberto, passa de 150 MB pergunta antes, e
 * diz o número: *"128 imagens: 9 MB no disco, e perto de 801 MB abertas"*. Os
 * três caminhos: com as imagens, sem as imagens (só ossos e animações), ou não
 * abrir. Abaixo da linha, não pergunta nada. O arrasto e o menu passam aqui.
 *
 * Devolve os arquivos a importar, ou `null` quando a pessoa desistiu (e aí o
 * rodapé diz que nada mudou).
 */
export async function gateHeavyForeign(shell: Shell, files: readonly File[]): Promise<readonly File[] | null> {
  const imagens = files.filter((file) => isFolderImage(file.name));
  if (imagens.length === 0) return files;
  const peso = await weighImageFiles(imagens);
  if (!isHeavy(peso)) return files;
  const spriter = files.some((file) => /\.(scml|scon)$/i.test(file.name));
  const memoria = (globalThis.navigator as { deviceMemory?: unknown } | undefined)?.deviceMemory;
  const escolha = await askChoice({
    title: 'Este projeto é pesado',
    lead: weightLead(spriter ? 'Spriter' : null, peso, typeof memoria === 'number' ? memoria : null),
    options: weightOptions(peso),
    cancelId: 'cancelar',
  });
  if (escolha === 'cancelar') {
    shell.doc.notice('Não abri o projeto pesado. Nada mudou');
    return null;
  }
  return escolha === 'sem' ? files.filter((file) => !isFolderImage(file.name)) : files;
}

/**
 * **Mudanças não salvas: a janela do programa** — rodada 45, lote 5 (doc `74`, a).
 *
 * Era o `confirm()` do navegador, em 7 lugares (abrir, abrir pasta, novo,
 * importar, soltar, recentes, sair). Respondendo "não", nada acontecia e
 * parecia que o menu não respondia. Agora: Salvar e continuar · Descartar ·
 * Cancelar, cada um com a frase, e o rodapé diz o que houve.
 */
export async function confirmDiscard(shell: Shell): Promise<boolean> {
  if (!shell.doc.dirty) return true;
  const nome = shell.doc.name;
  const escolha = await askChoice({
    title: `${nome} tem mudanças não salvas`,
    lead: 'O que fazer com elas antes de seguir?',
    options: DISCARD_CHOICES,
    cancelId: 'cancelar',
  });
  if (escolha === 'cancelar') {
    shell.statusState.textContent = `Nada mudou: ${nome} continua aberto, com as mudanças`;
    return false;
  }
  if (escolha === 'salvar') {
    await shell.save(false);
    if (shell.doc.dirty) {
      shell.statusState.textContent = `${nome} não foi salvo: nada mudou, e as mudanças continuam aqui`;
      return false;
    }
  }
  return true;
}

/** As três saídas, na ordem de ler — rodada 45, lote 5. */
export const DISCARD_CHOICES = [
  { id: 'salvar', label: 'Salvar e continuar', hint: 'Grava como o Ctrl+S, e segue' },
  { id: 'descartar', label: 'Descartar as mudanças', hint: 'Segue sem salvar: as mudanças deste arquivo se perdem' },
  { id: 'cancelar', label: 'Cancelar', hint: 'Nada muda: o arquivo continua aberto, com as mudanças' },
] as const;

// -------------------------------------------------------------------------
// Não perder o trabalho
// -------------------------------------------------------------------------

/**
 * Pergunta antes de fechar a aba, e guarda um rascunho a cada mudança.
 *
 * Fechar a aba, apertar F5 ou clicar num link com o arquivo sujo apagava uma
 * sessão inteira sem uma palavra. `beforeunload` traz a pergunta do próprio
 * navegador; o rascunho é a segunda rede, para o caso de a aba morrer sem
 * perguntar nada (queda de energia, aba derrubada por falta de memória).
 */
export function armUnloadGuard(shell: Shell): void {
  globalThis.addEventListener?.('beforeunload', (event: BeforeUnloadEvent) => {
    // A3 e J13 (29/09/2026): limpo, não há o que guardar — e gravar aqui
    // trocava o rascunho de um trabalho de verdade pelo documento limpo.
    if (!draftOnExit(shell.doc.dirty)) return;
    shell.saveDraft(true);
    event.preventDefault();
    // Navegadores antigos querem o valor de volta; os novos ignoram o texto.
    event.returnValue = '';
  });
  shell.doc.on((change) => {
    const move = draftMove(shell.doc.dirty, change);
    if (move === 'gravar') {
      shell.saveDraft(false);
      return;
    }
    // A3: só o SALVAR apaga. Escolher, trocar de ferramenta ou abrir outro
    // arquivo deixa o rascunho onde está.
    if (move === 'deixar') return;
    const storage = shell.draftStorage();
    if (storage !== null) clearDraft(storage);
    shell.lastDraftAt = null;
  });
}

/** `localStorage`, quando existe. Aba anônima e teste devolvem `null`. */
export function draftStorage(shell: Shell): DraftStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * O recado de quando o rascunho não conseguiu ser gravado — A1, degrau 11,
 * lote 7 (18/09/2026).
 *
 * O rascunho falha quando o armazenamento está cheio ou negado, e até aqui
 * falhava **calado**: quem trabalhava seguia acreditando que havia uma rede
 * embaixo, e não havia. É a regra 21 — o programa avisa, não improvisa.
 */
export const DRAFT_FAILED =
  'O rascunho automático não pôde ser gravado (o navegador não deixou, ou não há espaço). '
  + 'O que você fizer daqui para a frente NÃO será recuperado se a aba fechar: salve com Ctrl+S.';

/**
 * Grava o rascunho, respeitando a espera — salvo na saída, que é agora.
 *
 * Falhou? **Avisa uma vez**, e não a cada trinta segundos: um recado repetido
 * vira ruído e deixa de ser lido, e o que ele diz continua valendo. Voltando a
 * gravar, o aviso pode acontecer de novo se falhar outra vez.
 */
export function saveDraft(shell: Shell, now: boolean): void {
  const storage = shell.draftStorage();
  if (storage === null) return;
  const at = Date.now();
  if (!now && !shouldWriteDraft(shell.lastDraftAt, at)) return;
  let json: string;
  try {
    json = shell.doc.serialize();
  } catch {
    failedDraft(shell);
    return;
  }
  const ok = writeDraft(storage, {
    savedAt: at, name: shell.doc.name, path: shell.doc.path, json,
  });
  if (ok) {
    shell.lastDraftAt = at;
    shell.draftWarned = false;
    return;
  }
  failedDraft(shell);
}

/** Diz uma vez que o rascunho não está sendo gravado. */
function failedDraft(shell: Shell): void {
  if (shell.draftWarned) return;
  shell.draftWarned = true;
  shell.doc.notice(DRAFT_FAILED);
}
