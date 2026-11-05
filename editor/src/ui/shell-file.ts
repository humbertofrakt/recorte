/**
 * A casca: os comandos de arquivo — lote A5a, plano arrumação (v10.8).
 *
 * Novo, Abrir, Abrir pasta, Salvar e as outras formas de salvar, Exportar,
 * Importar, Reabrir o fechado, Repetir a exportação, Configurações, a paleta de
 * comandos e o manual; e as entradas dos menus. Cortado de `shell.ts` pela
 * seção "File commands": cada método virou uma função que recebe a casca
 * (`shell`), e a classe `Shell` guarda um método de uma linha que chama a
 * função. Nada mudou no que cada um faz.
 */

import { setViewSettings, viewSettings } from '../viewport/onion.js';
import { createEmptyFile } from '../doc/new-file.js';
import { describeDraftTime, draftsToOffer, readDraft, takeKeptDraft } from '../doc/rascunho.js';
import {
  abrindoPelaPasta, cameFromOutside, deliverBody, deliveredLine, entitySaveLines, forgetHandle, forgetOutside,
  hasOpenHandle, lastSaveNote, openAnotherSkeleton, openDocument, readOpenedFiles, rememberOutside,
  saveDocument, uriForOpened, useOpenHandle,
} from '../io/open-save.js';
import { perguntaSalvarComAvisos } from './salvar-avisos.js';
import { adoptFolderAtlases } from '../io/folder-save.js';
import { Doc } from '../doc/document.js';
import { projetoDe } from '../doc/projeto.js';
import { atlasFileText, forgetImportedImages } from '../io/import-images.js';
import { avisoDaPastaSolta } from '../io/drop-folder.js';
import type { FolderDirectoryHandle } from '../io/project-folder.js';
import { addFolderImages, boneFilesInFolder, folderBone, folderFromHandle, forgetProjectFolder, hasFolderPicker, openedNotice, pickProjectFolder, projectFolder, rememberFolder, rootFileNames, setProjectFolder } from '../io/project-folder.js';
import { avisoSemPasta, boneDaPasta, escolhasDoPedido, novoNaPasta, pedirPastaAntes, pedirPastaNoSalvarComo, perguntarPastaVazia, salvarComoEscolhas } from '../io/pedir-pasta.js';
import { hasCharacter } from '../panels/palette-model.js';
import { corpoDe } from '../contract.js';
import { resumoDoGltf } from '../io/export-gltf.js';
import { openEntityFromOutside, pacoteAbertoNotice } from '../io/open-save.js';
import type { GestoSemPasta } from '../io/pedir-pasta.js';
import type { ProjectFolder } from '../io/project-folder.js';
import { openProjectFiles, openProjectInto, projectOpenedNotice, readManifestInFolder } from '../io/project-open.js';
import { Projeto } from '../doc/projeto.js';
import { FORMAT_LABELS, adoptForeignImages, agruparAvisos, importFromOtherProgram } from '../io/import-foreign.js';
import { importPsd, psdWarningsNote } from '../io/import-psd.js';
import { saveAsBinary, saveAsPackage, savingLine, stem as fileStem } from '../io/save-binary.js';
import { gltfLine, saveAsGltf } from '../io/export-gltf.js';
import {
  buildImageExport, exportImageWindow, imageExportLine, imageExportReport,
  saveExport,
} from '../io/export-image.js';
import type { ImageExportOptions } from '../io/export-image.js';
import { SWITCH_HINT, SWITCH_MODES } from '../anim/transport.js';
import { SetDefaultMixAll, formatMix, parseMixAnswer } from '../panels/animations-model.js';
import {
  EXPORT_LABELS, loadLastExport, loadMostRecentExport, saveLastExport,
} from '../io/last-export.js';
import { filterCommands } from './palette.js';
import type { BoneFile } from '../../../runtime/src/index.js';
import { skeletonFields, writeFieldValue } from '../panels/properties-model.js';
import { exportSkinWindow, skinExportLine, skinExportReport } from '../io/export-skin.js';
import { MANUAL_FOLDER, openManual } from '../io/manual.js';
import { askChoice, askForm, askPick, askUser, tellUser } from './dialog.js';
import { actionState, hasAction, runAction } from './actions.js';
import { flatEntries } from './menus.js';
import type { Shell } from './shell.js';
import { abrirPelaPastaSeCouber, gateHeavyForeign } from './shell-drop.js';
import { takePickerProblem } from '../io/picker-problem.js';

// -------------------------------------------------------------------------
// File commands
// -------------------------------------------------------------------------

/**
 * **Arquivo → Novo projeto** — degrau 10, tarefa 10.1 (P3).
 *
 * *"O projeto é a caixa"* (BASE §15): o que nasce aqui é um projeto, com **um
 * corpo** dentro. O rodapé diz isso com as duas palavras, porque é o vocabulário
 * do programa inteiro daqui para a frente — corpo, entidade, projeto.
 */
export async function newFile(shell: Shell): Promise<void> {
  if (!(await shell.confirmDiscard())) return;
  // Rodada 7: a pasta ANTES do projeto vazio, como o Spriter (`File / New
  // Project`: escolher a pasta raiz). Sem o seletor (Firefox), como antes.
  if (hasFolderPicker()) {
    const antes = projectFolder(shell.doc)?.name ?? null;
    const folder = await pickProjectFolder();
    if (folder === null) {
      shell.statusState.textContent = avisoSemPasta('novo', antes);
      return;
    }
    const plano = novoNaPasta(folder.name, await rootFileNames(folder.handle), folderBone(folder.name));
    if (plano.kind === 'tem-projeto') {
      const escolha = await askChoice({
        title: `A pasta ${folder.name} já tem um projeto`,
        lead: `Nela está ${plano.existente}. Abrir ele, ou começar um projeto novo ao lado, sem tocar nele?`,
        options: [
          { id: 'abrir', label: `Abrir ${plano.existente}`, hint: 'Continua de onde parou, com as imagens da pasta' },
          {
            id: 'novo', label: `Começar um novo: ${plano.nome}.bone`,
            hint: `Uma base vazia. O Salvar grava ${plano.nome}.bone na pasta; ${plano.existente} não é tocado`,
          },
          { id: 'cancelar', label: 'Cancelar', hint: 'Nada muda' },
        ],
        cancelId: 'cancelar',
      });
      if (escolha === 'cancelar') {
        shell.statusState.textContent = avisoSemPasta('novo', antes);
        return;
      }
      if (escolha === 'abrir') {
        recusouPasta.delete(shell.doc);
        await startInFolder(shell, folder, plano.existente);
        void rememberFolder(folder);
        return;
      }
    }
    forgetHandle();
    forgetImportedImages(shell.doc);
    forgetOutside();
    recusouPasta.delete(shell.doc);
    setProjectFolder(shell.doc, folder);
    shell.showPanel('imagens');
    shell.doc.setFile(createEmptyFile(plano.nome), { path: null, atlases: [], images: new Map() });
    void rememberFolder(folder);
    const n = folder.images.size;
    shell.statusState.textContent = `Projeto novo na pasta ${folder.name}, com uma base vazia. `
      + `${n === 1 ? '1 imagem' : `${n} imagens`} na aba Imagens; o Salvar grava ${plano.nome}.bone ali`;
    return;
  }
  forgetHandle();
  forgetImportedImages(shell.doc);
  forgetOutside();
  // Novo é outro começo: a pasta do projeto anterior não vem junto.
  forgetProjectFolder(shell.doc);
  shell.doc.setFile(createEmptyFile(), { path: null, atlases: [], images: new Map() });
  shell.statusState.textContent = 'Projeto novo, com uma base vazia. Este navegador não abre pasta com escrita: o projeto está sem pasta';
}

/** Quem disse "agora não" ao pedido da pasta, neste documento — rodada 7. */
const recusouPasta = new WeakSet<object>();

/**
 * **O primeiro gesto que precisa de pasta** — rodada 7, item 2. Salvar, ou
 * soltar imagem, com o projeto sem pasta: em vez de seguir calado, a janela
 * pede a pasta (o mesmo seletor do Novo projeto…). A janela vem antes do
 * seletor porque soltar não é clique: o navegador só abre o seletor depois de
 * um clique da pessoa.
 *
 * Devolve `'pasta'` (a pasta entrou no projeto), `'sem'` (seguir como antes)
 * ou `'cancelar'` (nada acontece; o rodapé diz).
 */
export async function askFolderFirst(
  shell: Shell, gesto: GestoSemPasta, salvarComo = false,
): Promise<'pasta' | 'sem' | 'cancelar'> {
  const atual = projectFolder(shell.doc);
  const temPasta = atual !== null && atual.name !== '';
  // Rodada 45, lote 1: o Salvar como de um projeto com mais de um arquivo,
  // sem pasta, pede a pasta — senão o manifesto ia para os Downloads.
  const pedir = salvarComo
    ? pedirPastaNoSalvarComo({ temPasta, temVarios: projetoDe(shell.doc)?.temVarios ?? false, seletorDePasta: hasFolderPicker() })
    : pedirPastaAntes(gesto, {
      temPasta,
      temArquivoAberto: hasOpenHandle(),
      seletorDePasta: hasFolderPicker(),
      recusou: recusouPasta.has(shell.doc),
    });
  if (!pedir) return 'sem';
  const escolha = await askChoice({
    title: 'O projeto ainda não tem pasta',
    lead: gesto === 'salvar'
      ? 'Como no Spriter, o projeto mora na pasta das imagens. Escolha a pasta, e o Salvar grava ali.'
      : 'Como no Spriter, o projeto mora na pasta das imagens. Escolha a pasta: as imagens dela e as que você soltou ficam na aba Imagens.',
    options: [
      ...escolhasDoPedido(gesto),
      { id: 'cancelar', label: 'Cancelar', hint: gesto === 'salvar' ? 'Nada é salvo' : 'As imagens não entram' },
    ],
    cancelId: 'cancelar',
  });
  if (escolha === 'sem') {
    recusouPasta.add(shell.doc);
    return 'sem';
  }
  const folder = escolha === 'pasta' ? await pickProjectFolder() : null;
  if (folder === null) {
    shell.statusState.textContent = avisoSemPasta(gesto, null);
    return 'cancelar';
  }
  // A pasta entra no projeto que está aberto: o trabalho fica, e as imagens
  // soltas antes continuam na aba (as da pasta ganham, no mesmo nome).
  const soltas = atual !== null && atual.name === '' ? [...atual.images.values()] : [];
  setProjectFolder(shell.doc, folder);
  const faltam = soltas.filter((image) => !folder.images.has(image.name));
  if (faltam.length > 0) addFolderImages(shell.doc, faltam);
  void rememberFolder(folder);
  shell.showPanel('imagens');
  return 'pasta';
}

/**
 * **Arquivo → Abrir pasta…** — lote 59, plano pasta do projeto.
 *
 * Começar como o Spriter: a pasta das imagens do personagem. É um documento
 * novo, vazio, e as imagens da pasta ficam na aba Imagens, por subpasta.
 * **Nada entra na cena sozinho**: o personagem nasce do arrasto.
 */
export async function openFolder(shell: Shell, solta?: FolderDirectoryHandle): Promise<void> {
  if (!(await shell.confirmDiscard())) return;
  // Rodada 48 (a mão do Humberto): a pasta solta na janela vem com a alça, e
  // não passa pelo seletor. O resto é o mesmo caminho do Abrir pasta.
  const folder = solta === undefined ? await pickProjectFolder() : await folderFromHandle(solta);
  if (folder === null) return;
  const podeGravar = solta === undefined || await pedirGravar(solta);
  // Rodada 45, lote 4 (doc 64, a): a pasta sem imagem nem projeto, com um
  // personagem aberto, pergunta antes de trocá-lo por um vazio.
  const nomes = folder.handle === null ? [] : await rootFileNames(folder.handle);
  const temProjeto = nomes.some((nome) => /\.bone$/i.test(nome) || nome.toLowerCase() === 'manifest.json');
  if (perguntarPastaVazia({ imagens: folder.images.size, temProjeto, temPersonagem: hasCharacter(corpoDe(shell.doc).file) })) {
    const quem = shell.doc.file.skeleton?.name ?? 'o personagem';
    const abrir = await askUser({
      title: `A pasta ${folder.name} está vazia`,
      lead: `Ela não tem imagens nem projeto. Abrir a pasta fecha ${quem} e começa um projeto vazio.`,
      yesLabel: 'Abrir a pasta vazia',
      noLabel: 'Deixar como está',
    });
    if (!abrir) {
      shell.statusState.textContent = `Nada mudou: ${quem} continua aberto`;
      return;
    }
  }
  await shell.startInFolder(folder);
  void rememberFolder(folder);
  if (solta === undefined) return;
  const vazio = shell.statusState.textContent === openedNotice(folder.name, [...folder.images.keys()]);
  if (vazio) shell.statusState.textContent = avisoDaPastaSolta(folder.name, folder.images.size, podeGravar);
  else if (!podeGravar) shell.statusState.textContent += '. Para gravar na pasta, o Salvar vai pedir licença uma vez';
}

/**
 * A licença de gravar na pasta solta, se o navegador der sem perguntar. A alça
 * do arrasto vem só para ler; sem clique da pessoa o pedido pode ser recusado,
 * e aí o Salvar (que é um clique) pede. `true` = já pode gravar.
 */
async function pedirGravar(handle: FolderDirectoryHandle): Promise<boolean> {
  try {
    if (typeof handle.queryPermission !== 'function') return true;
    if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted') return true;
    if (typeof handle.requestPermission !== 'function') return false;
    return await handle.requestPermission({ mode: 'readwrite' }) === 'granted';
  } catch {
    return false;
  }
}

/**
 * A pasta aberta, e a aba Imagens à vista. Lote 62: quando o Salvar já
 * gravou um `.bone` na raiz desta pasta, ele reabre — **continuar de onde
 * parou**. Sem ele, o documento vazio.
 */
export async function startInFolder(shell: Shell, folder: ProjectFolder, boneEscolhido?: string): Promise<void> {
  // Rodada 45, lote 6 (doc 78, a): a pergunta "qual .bone?" vem ANTES de mudar
  // qualquer coisa, e Cancelar (ou Esc) deixa o que está aberto como estava.
  // Antes ela vinha no meio, com o Esc valendo "começar vazio".
  if (boneEscolhido === undefined && folderBone(folder.name) === null && folder.handle !== null) {
    const raiz = await rootFileNames(folder.handle);
    const achado = raiz.includes('manifest.json') ? { kind: 'nenhum' as const } : boneDaPasta(raiz);
    if (achado.kind === 'um') boneEscolhido = achado.nome;
    else if (achado.kind === 'varios') {
      const escolha = await askChoice({
        title: `A pasta ${folder.name} tem ${achado.nomes.length} arquivos .bone`,
        lead: 'Qual abrir? As imagens da pasta ficam na aba Imagens do mesmo jeito.',
        options: [
          ...achado.nomes.map((nome) => ({ id: nome, label: nome, hint: `Abre ${nome}, de onde parou` })),
          { id: 'vazio', label: 'Nenhum: começar vazio', hint: 'Um projeto vazio na pasta; os .bone dela não são tocados' },
          { id: 'cancelar', label: 'Cancelar', hint: 'Nada muda: o que está aberto continua aberto' },
        ],
        cancelId: 'cancelar',
      });
      if (escolha === 'cancelar') {
        shell.statusState.textContent = `Nada mudou: a pasta ${folder.name} não foi aberta`;
        return;
      }
      // '' = nenhum .bone: o projeto começa vazio, na pasta.
      boneEscolhido = escolha === 'vazio' ? '' : escolha;
    }
  }
  // Rodada 45, lote 1: o aviso do atlas que falta diz o que falta NESTA pasta,
  // e não manda escolher a pasta que acabou de ser escolhida (doc 57, foto 31).
  abrindoPelaPasta(folder.name);
  try {
    await abrirNaPasta(shell, folder, boneEscolhido);
  } finally {
    abrindoPelaPasta(null);
  }
}

async function abrirNaPasta(shell: Shell, folder: ProjectFolder, boneEscolhido?: string): Promise<void> {
  forgetHandle();
  forgetImportedImages(shell.doc);
  // A pasta antes do `setFile`: quem ouve o documento novo já a encontra.
  setProjectFolder(shell.doc, folder);
  shell.showPanel('imagens');
  // Degrau 4b: a pasta com `manifest.json` é um projeto — um `.bone` por
  // corpo, e o corpo em foco no `main`. Abre todos, e o manifesto manda.
  const projeto = shell.doc.project;
  const manifest = folder.handle === null || !(projeto instanceof Projeto)
    ? null : await readManifestInFolder(folder.handle);
  if (manifest !== null && folder.handle !== null && projeto instanceof Projeto) {
    try {
      const lido = await openProjectFiles(folder.handle, manifest);
      if (lido !== null) {
        openProjectInto(projeto, lido);
        if (lido.mainHandle !== null) useOpenHandle(lido.mainHandle);
        await adoptFolderAtlases(shell.doc);
        shell.statusState.textContent = lido.warnings.length > 0
          ? `${projectOpenedNotice(folder.name, lido.lists)}. ${lido.warnings[0]}`
          : projectOpenedNotice(folder.name, lido.lists);
        return;
      }
      shell.statusState.textContent = `Pasta ${folder.name}: o manifest.json cita ${manifest.main}, que não está na pasta`;
    } catch (error) {
      shell.statusState.textContent = `Pasta ${folder.name}: o projeto não abriu: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  // Rodada 45, lote 4 (4.11) e lote 6: o .bone da raiz já foi escolhido em
  // startInFolder, antes de mexer em nada ('' = começar vazio).
  const bone = boneEscolhido ?? folderBone(folder.name);
  const achado = bone === null || bone === '' || folder.handle === null ? null : await boneFilesInFolder(folder.handle, bone);
  if (achado !== null) {
    try {
      const aberto = await readOpenedFiles(achado.files);
      if (aberto !== null) {
        shell.doc.setFile(aberto.file, {
          path: aberto.path, atlases: aberto.atlases, images: aberto.images,
          skeletons: aberto.skeletons,
        });
        useOpenHandle(achado.handle);
        await adoptFolderAtlases(shell.doc);
        shell.statusState.textContent = `Pasta ${folder.name}: ${bone} reaberto de onde parou`;
        return;
      }
    } catch {
      // O `.bone` não abriu: cai no documento vazio, como antes.
    }
  }
  shell.doc.setFile(createEmptyFile(), { path: null, atlases: [], images: new Map() });
  shell.statusState.textContent = openedNotice(folder.name, [...folder.images.keys()]);
}

export async function open(shell: Shell): Promise<void> {
  if (!(await shell.confirmDiscard())) return;
  try {
    // Doc 74, c: com a pasta do projeto aberta, o aviso do atlas que falta diz a pasta.
    const pastaAberta = projectFolder(shell.doc)?.name ?? '';
    abrindoPelaPasta(pastaAberta === '' ? null : pastaAberta);
    let opened: Awaited<ReturnType<typeof openDocument>>;
    try {
      opened = await openDocument();
    } finally {
      abrindoPelaPasta(null);
    }
    if (opened === null) return;
    // Doc 78, b: o .bone da pasta aberta, com o atlas lá, abre pela pasta.
    if (await abrirPelaPastaSeCouber(shell, opened)) return;
    forgetImportedImages(shell.doc);
    shell.doc.setFile(opened.file, {
      path: opened.path, atlases: opened.atlases, images: opened.images,
      skeletons: opened.skeletons,
    });
    // Lote 62: com a pasta aberta, as imagens dela voltam a vir da pasta.
    await adoptFolderAtlases(shell.doc);
    if (opened.warnings.length > 0) shell.statusState.textContent = opened.warnings[0];
    // Rodada 45, lote 4 (doc 64, c): o pacote diz o que veio dentro.
    else if (/\.bonez$/i.test(opened.path ?? '')) {
      shell.statusState.textContent = pacoteAbertoNotice(opened.path ?? '', [...(opened.skeletons?.keys() ?? [])], opened.atlases.length);
    }
  } catch (error) {
    shell.statusState.textContent = error instanceof Error ? error.message : String(error);
  }
}

export async function save(shell: Shell, saveAs: boolean): Promise<void> {
  // Rodada 7: sem pasta, o Salvar primeiro pede a pasta (Salvar como… não).
  if (!saveAs && await askFolderFirst(shell, 'salvar') === 'cancelar') return;
  if (saveAs && await askFolderFirst(shell, 'salvar', true) === 'cancelar') return;
  // Rodada 45, lote 4 (doc 64, d): com o projeto numa pasta, Salvar como
  // pergunta: pasta nova (leva tudo) ou só o .bone.
  const pastaAtual = projectFolder(shell.doc);
  if (saveAs && pastaAtual !== null && pastaAtual.name !== '' && hasFolderPicker()) {
    const escolha = await askChoice({
      title: 'Salvar como…',
      lead: `O projeto mora na pasta ${pastaAtual.name}. Onde vai a cópia?`,
      options: [...salvarComoEscolhas(pastaAtual.name), { id: 'cancelar', label: 'Cancelar', hint: 'Nada é salvo' }],
      cancelId: 'cancelar',
    });
    if (escolha === 'cancelar') return;
    if (escolha === 'pasta') {
      const nova = await pickProjectFolder();
      if (nova === null) {
        shell.statusState.textContent = avisoSemPasta('salvar', pastaAtual.name);
        return;
      }
      // As imagens da pasta de antes continuam valendo: o atlas sai delas.
      setProjectFolder(shell.doc, { ...nova, images: new Map([...pastaAtual.images, ...nova.images]) });
      forgetHandle();
      void rememberFolder(nova);
      saveAs = false;
    }
  }
  try {
    const name = await saveDocument(shell.doc, {
      saveAs,
      // Rodada 45, lote 1: a pergunta da casa, em português. Sem este gancho
      // o `saveDocument` caía no `confirm()` do navegador, em inglês (doc 57).
      confirmProblems: (problems) => askUser(perguntaSalvarComAvisos(shell.doc.file, problems)),
    });
    // Rodada 23, defeito 8: o seletor fechado ou bloqueado diz no rodapé.
    const problema = takePickerProblem();
    if (name === null && problema !== null) shell.statusState.textContent = problema;
    if (name !== null) {
      // Lote 62: o que o Salvar fez com o atlas da pasta, ou por que baixou.
      const nota = lastSaveNote();
      const extra = nota !== null ? ` ${nota}.`
        : atlasFileText(shell.doc) === null ? '' : ' Atlas e páginas gravados junto.';
      shell.statusState.textContent = `Salvo em ${name}.${extra}`;
    }
  } catch (error) {
    shell.statusState.textContent = error instanceof Error ? error.message : String(error);
  }
}

// -------------------------------------------------------------------------
// Abrir outro `.bone`, entregar um corpo, salvar a entidade — degrau 10
// -------------------------------------------------------------------------

/**
 * **Arquivo → Abrir outro corpo… / Abrir uma entidade…** — 10.2 (E17).
 *
 * `ARQUITETO 3` §1.4, com todas as letras:
 *
 * | Gesto | O que faz |
 * |:---|:---|
 * | **Abrir como corpo** | entra na lista Corpos, e **a base dele abre**: passa a ser o corpo em foco |
 * | **Abrir como entidade** | entra na lista Entidades e fica **fechado** — ninguém o edita |
 *
 * Nenhum dos dois toma o lugar do arquivo aberto: o `Ctrl+S` continua gravando
 * o projeto de sempre, e agora com um arquivo a mais dentro dele.
 */
export async function openAnother(shell: Shell, como: 'corpo' | 'entidade'): Promise<void> {
  const projeto = projetoDe(shell.doc);
  if (projeto === null) {
    shell.statusState.textContent = 'Este documento não é um projeto: abra ou salve um projeto antes';
    return;
  }
  try {
    // Rodada 8b, C18: o arquivo que vem sozinho procura as imagens nos atlas
    // que o projeto já tem abertos.
    const known = { atlases: shell.doc.atlases, images: shell.doc.pageImages };
    // 05/11/2026: a entidade de fora traz o atlas DELA. Escolheu só o .bone?
    // O programa pede a pasta dela, em vez de deixá-la sem imagem.
    const opened = como === 'entidade'
      ? await openEntityFromOutside(known, (bone, missing) => askEntityFolder(bone, missing))
      : await openAnotherSkeleton(known);
    if (opened === null) return;
    const lists = projeto.lists;
    const uri = uriForOpened(opened.path, [...lists.corpos, ...lists.entidades]);
    const doc = new Doc(opened.file, {
      path: uri, undo: projeto.undo,
      atlases: opened.atlases, images: opened.images, skeletons: opened.skeletons,
    });
    rememberOutside(uri, opened.path);
    if (como === 'corpo') {
      projeto.adicionarCorpo(uri, doc);
      projeto.trocarFoco(uri);
      shell.statusState.textContent = uri === opened.path
        ? `${uri} entrou como base, e a base dele está aberta`
        : `${opened.path} entrou como base com o nome ${uri} (o de origem já estava em uso), e a base dele está aberta`;
    } else {
      // Rodada 8b, C18: entra avisando os painéis — o cartão aparece na hora.
      projeto.adicionarEntidade(uri, doc);
      // Rodada 39 (nota c do `29`): o nome em uso vira uma CÓPIA com outro
      // nome, e isso se diz — a mesma entidade várias vezes é a da prateleira.
      shell.statusState.textContent = uri === opened.path
        ? `${uri} entrou como entidade, fechada. Ela aparece no painel Entidades e na grade do botão direito`
        : `${opened.path} entrou como entidade com o nome ${uri}: o nome ${opened.path} já estava em uso, `
          + `e esta é uma CÓPIA. Para usar a que já existe, arraste-a da prateleira da aba Entidades`;
    }
    if (opened.warnings.length > 0) {
      await tellUser({
        title: `${opened.path} entrou no projeto, com avisos`,
        lead: 'O arquivo entrou. Estes pontos ficaram por resolver:',
        lines: opened.warnings,
      });
    }
  } catch (error) {
    await shell.reportFailure('Não deu para abrir o arquivo', error);
  }
}

/**
 * A pergunta de quem trouxe só o `.bone` de uma entidade com atlas próprio —
 * 05/11/2026. O botão diz o que acontece; o seletor de pasta abre no clique.
 */
async function askEntityFolder(bone: string, missing: readonly string[]): Promise<FolderDirectoryHandle | null> {
  if (!hasFolderPicker()) return null;
  const escolha = await askChoice({
    title: `${bone}: falta ${missing.join(', ')}`,
    lead: `As imagens de ${bone} moram em ${missing.join(', ')}, ao lado dele. Escolha a pasta onde ${bone} está, `
      + 'e o atlas e as imagens vêm juntos.',
    options: [
      { id: 'pasta', label: `Escolher a pasta de ${bone}…`, hint: 'O .bone, o atlas e as imagens entram juntos' },
      { id: 'sem', label: 'Trazer sem as imagens', hint: 'A peça entra sem desenho, e o rodapé avisa' },
    ],
    cancelId: 'sem',
  });
  if (escolha !== 'pasta') return null;
  try {
    const w = globalThis as unknown as { showDirectoryPicker(o?: unknown): Promise<FolderDirectoryHandle> };
    return await w.showDirectoryPicker({ id: 'recorte-entidade', mode: 'read' });
  } catch {
    return null; // Fechou a janela.
  }
}

/**
 * **Arquivo → Entregar um corpo…** — 10.1 (P2).
 *
 * *"Salvar grava o projeto inteiro; entregar ao jogo pode levar só um corpo."*
 * Com mais de um corpo, pergunta qual; com um só, entrega esse.
 */
/**
 * **Qual corpo do projeto** — a pergunta de quem entrega um corpo só (P2) ou
 * exporta um glTF (10.6). Com um corpo só, é ele, sem pergunta nenhuma;
 * `null` quando a pessoa fechou a janela.
 */
export async function pickBody(shell: Shell, title: string, placeholder: string): Promise<Doc | null> {
  const projeto = projetoDe(shell.doc);
  const corpos = projeto === null ? [] : projeto.lists.corpos;
  if (projeto === null || corpos.length <= 1) return shell.doc;
  const casa = (uri: string, text: string): boolean => {
    const busca = text.trim().toLowerCase();
    return projeto.nameOf(uri).toLowerCase().includes(busca) || uri.toLowerCase().includes(busca);
  };
  const escolhido = await askPick({
    title,
    placeholder,
    search: (text) => corpos.filter((uri) => casa(uri, text)).map((uri) => ({
      id: uri, label: projeto.nameOf(uri), aside: uri,
      hint: uri === projeto.emFocoUri ? 'A base aberta agora' : 'Outra base deste projeto',
    })),
  });
  if (escolhido === null) return null;
  return projeto.docOf(escolhido) ?? shell.doc;
}

export async function deliverOneBody(shell: Shell): Promise<void> {
  const alvo = await pickBody(shell, 'Entregar uma base', 'Qual base vai para o jogo?');
  if (alvo === null) return;
  try {
    const result = await deliverBody(alvo);
    if (result === null) return;
    shell.statusState.textContent = deliveredLine(result);
    await tellUser({
      title: 'Base entregue',
      lead: result.atlas === null
        ? `Saiu ${result.name}, sozinho. Não havia imagem da pasta para fatiar: o atlas que ele já citava vale.`
        : `Saíram ${result.name} e ${result.atlas}, com ${result.images} ${result.images === 1 ? 'imagem' : 'imagens'} — só as que ESTA base usa.`,
      // Rodada 45, lote 4: sem atlas novo, a frase de cima já diz o aviso de baixo.
      lines: result.atlas === null ? result.warnings.filter((aviso) => !aviso.startsWith('As imagens desta base não vieram da pasta')) : result.warnings,
    });
  } catch (error) {
    await shell.reportFailure('Não deu para entregar a base', error);
  }
}

/**
 * **Arquivo → Salvar a entidade editada…** — 10.3 (E4).
 *
 * Um arquivo que veio de fora (E17) tem dois lugares possíveis: a cópia dentro
 * deste projeto (**Novo**) ou o arquivo de origem (**Por cima**). A janela diz
 * quantos corpos deste projeto o usam — e **admite que não sabe** dos outros
 * projetos, que é o que a regra 21 cobra de um programa que não adivinha.
 */
export async function saveEntityFile(shell: Shell): Promise<void> {
  const projeto = projetoDe(shell.doc);
  if (projeto === null) return;
  const uri = projeto.emFocoUri;
  const origem = cameFromOutside(uri);
  if (origem === null) {
    shell.statusState.textContent = `${uri} não veio de fora: o Salvar grava a pasta do projeto`;
    return;
  }
  const usos = bodiesUsing(projeto, uri);
  const porCima = await askUser({
    title: 'Salvar a entidade editada',
    lead: `${uri} veio de ${origem}. Onde a versão editada deve ficar?`,
    lines: entitySaveLines(uri, usos),
    yesLabel: 'Por cima do arquivo de origem',
    noLabel: 'Novo, dentro deste projeto',
  });
  if (!porCima) {
    shell.statusState.textContent =
      `${uri} fica como cópia deste projeto. O Salvar grava a pasta, e ${origem} não muda`;
    return;
  }
  try {
    const result = await deliverBody(projeto.docOf(uri) ?? shell.doc);
    if (result === null) return;
    shell.statusState.textContent = `${deliveredLine(result)} — por cima, como pedido`;
  } catch (error) {
    await shell.reportFailure('Não deu para gravar por cima', error);
  }
}

/**
 * Quantos corpos deste projeto apontam para `uri` — numa chave `body` (9.13)
 * ou num anexo `skeleton` (7.11). É o número que a pergunta do E4 mostra.
 */
export function bodiesUsing(projeto: Projeto, uri: string): number {
  let count = 0;
  for (const [outro, doc] of projeto.corpos) {
    if (outro === uri) continue;
    if (fileCites(doc.file, uri)) count++;
  }
  return count;
}

/** `true` quando este `.bone` cita `uri` como corpo (9.13) ou como entidade (7.11). */
export function fileCites(file: BoneFile, uri: string): boolean {
  for (const animation of file.animations ?? []) {
    for (const timeline of animation.timelines ?? []) {
      if ((timeline as { type?: string }).type !== 'body') continue;
      for (const key of (timeline as { keys?: Array<{ value?: unknown }> }).keys ?? []) {
        if (key.value === uri) return true;
      }
    }
  }
  for (const skin of file.skins ?? []) {
    for (const bucket of Object.values(skin.attachments ?? {})) {
      for (const attachment of Object.values(bucket)) {
        if (attachment !== null && (attachment as { uri?: unknown }).uri === uri) return true;
      }
    }
  }
  return false;
}

// -------------------------------------------------------------------------
// The four new entries of the "Arquivo" menu
// -------------------------------------------------------------------------

/** "Salvar como binário…": the same document, in the layout of spec 11. */
export async function saveBinary(shell: Shell): Promise<void> {
  try {
    const result = await saveAsBinary(shell.doc);
    if (result === null) return;
    shell.statusState.textContent = savingLine(result);
  } catch (error) {
    await shell.reportFailure('Não deu para salvar como binário', error);
  }
}

/** "Salvar como pacote…": skeleton, atlas and images in one `.bonez`. */
export async function savePackage(shell: Shell): Promise<void> {
  try {
    const result = await saveAsPackage(shell.doc);
    if (result === null) return;
    const size = result.size.toLocaleString('pt-BR');
    shell.statusState.textContent =
      `Salvo em ${result.name}. ${result.entries.length} arquivos dentro, ${size} bytes.`;
    if (result.warnings.length > 0) {
      await tellUser({
        title: 'O pacote foi salvo, com avisos',
        lead: `Arquivo: ${result.name}. Estes itens ficaram de fora.`,
        lines: result.warnings,
      });
    }
  } catch (error) {
    await shell.reportFailure('Não deu para salvar o pacote', error);
  }
}

/**
 * "Exportar glTF…": the same character in the format every 3D tool reads.
 *
 * glTF has no constraints, no draw order and no shear, so an export always
 * leaves something behind. The list of what was left behind goes on screen in
 * the plain message window, never only into the status bar — a loss nobody
 * read is a loss discovered inside the game engine, hours later.
 */
export async function exportGltf(shell: Shell): Promise<void> {
  try {
    // Degrau 10 (10.6): o exportador recebe UM corpo. Com vários no projeto,
    // pergunta qual — o glTF guarda um esqueleto só, e adivinhar qual deles o
    // artista quis é o tipo de palpite que a regra 21 proíbe.
    const alvo = await pickBody(shell, 'Exportar glTF', 'Qual base vai para o glTF?');
    if (alvo === null) return;
    const result = await saveAsGltf(alvo);
    if (result === null) return;
    shell.statusState.textContent = gltfLine(result);
    saveLastExport('gltf', { format: result.format });
    const shape = result.format === 'glb' ? 'binário (.glb)' : 'JSON (.gltf)';
    await tellUser({
      title: 'glTF exportado',
      lead: result.warnings.length === 0
        ? `Arquivo ${result.name}, no formato ${shape}. Nada se perdeu na conversão.`
        : `Arquivo ${result.name}, no formato ${shape}. glTF não tem lugar para estes pontos:`,
      // Rodada 45, lote 4: uma linha por animação, sem a língua do formato.
      lines: resumoDoGltf(result.warnings),
    });
  } catch (error) {
    await shell.reportFailure('Não deu para exportar o glTF', error);
  }
}

/**
 * "Exportar imagem…": a sequência de PNG, a folha de sprites ou o GIF.
 *
 * A janela é de `io/export-image.ts` (owner C) e faz tudo: as opções, a barra
 * de andamento e a entrega dos arquivos. Aqui só sobra a linha da barra de
 * estado e o resumo do que saiu — que inclui, sempre, a frase de que MP4 não
 * sai daqui e o comando do ffmpeg pronto para copiar.
 */
export async function exportImage(shell: Shell): Promise<void> {
  try {
    const run = await exportImageWindow(shell.doc);
    if (run === null) return;
    // Rodada 48, lote 3 (doc 95): o rodapé também diz para onde foi.
    shell.statusState.textContent = imageExportLine(run.result, run.options, run.where);
    // Guarda para o `Ctrl+Shift+E` — item 103.
    saveLastExport('imagem', run.options as unknown as Record<string, unknown>);
    await tellUser({
      title: 'Imagem exportada',
      lead: `${run.result.files.length} arquivo(s) gravado(s).`,
      lines: imageExportReport(run.result, run.options, run.base, run.where),
    });
  } catch (error) {
    await shell.reportFailure('Não deu para exportar a imagem', error);
  }
}

/**
 * "Exportar por pele…": um arquivo por personagem (requisito E3).
 *
 * A janela é de `io/export-skin.ts` e faz tudo: as caixas, os números que
 * mudam a cada clique e a gravação. Aqui só sobra a linha da barra de estado
 * e a lista do que saiu, que merece a janela inteira e não meia linha.
 */
export async function exportBySkin(shell: Shell): Promise<void> {
  try {
    const run = await exportSkinWindow(shell.doc);
    if (run === null) return;
    shell.statusState.textContent = skinExportLine(run);
    saveLastExport('pele', { name: run.name });
    await tellUser({
      title: 'Arquivo fatiado',
      lead: run.result.removed.length === 0
        ? `Arquivo ${run.name}. Nada saiu: ele já era só isto.`
        : `Arquivo ${run.name}. Saíram ${run.result.removed.length} item(ns):`,
      lines: skinExportReport(run),
    });
  } catch (error) {
    await shell.reportFailure('Não deu para exportar por skin', error);
  }
}

/**
 * "Arquivo → Reabrir o fechado" — item 105.
 *
 * O rascunho já era gravado a cada três segundos desde sempre, para o caso de
 * a aba morrer. O que faltava era a porta: sem ela, o trabalho ficava
 * guardado e ninguém tinha como pedir de volta.
 *
 * **Pergunta antes**, com a hora da gravação escrita na pergunta, porque
 * abrir o rascunho joga fora o que está aberto agora. E não apaga o rascunho
 * ao abrir: se a escolha foi errada, ele ainda está lá no minuto seguinte.
 */
export async function reopenClosed(shell: Shell): Promise<void> {
  const storage = shell.draftStorage();
  // P55 (29/09/2026): o atual, ou o guardado mais novo. Sem isso, com o atual
  // vazio e um guardado na lista, esta porta dizia "não há nada guardado" —
  // e havia.
  const atual = storage === null ? null : readDraft(storage);
  const draft = atual ?? (storage === null ? null : draftsToOffer(storage)[0] ?? null);
  if (draft === null) {
    shell.statusState.textContent = 'Não há nada guardado para reabrir';
    await tellUser({
      title: 'Nada para reabrir',
      lead: 'O editor guarda sozinho o que está aberto, a cada poucos segundos, '
        + 'e o oferece de volta aqui. Não há nada guardado agora:',
      lines: [
        'Ou nada foi editado nesta máquina ainda.',
        'Ou o último trabalho foi salvo em disco — ao salvar, o guardado é apagado.',
        'Ou passaram mais de sete dias desde a última edição.',
      ],
    });
    return;
  }

  const quando = describeDraftTime(draft.savedAt);
  const yes = await askUser({
    title: 'Reabrir o fechado',
    lead: `Guardado ${quando}: ${draft.name}. Isto substitui o que está aberto agora.`,
    lines: shell.doc.dirty
      ? ['O arquivo de agora tem mudanças não salvas, e elas se perdem.']
      : [],
    yesLabel: 'Reabrir',
  });
  if (!yes) return;
  // Um guardado troca de lugar com o atual, e nada some.
  if (atual === null && storage !== null) takeKeptDraft(storage, draft.savedAt);

  try {
    const file = JSON.parse(draft.json) as BoneFile;
    forgetImportedImages(shell.doc);
    shell.doc.setFile(file, { path: draft.path, atlases: [], images: new Map() });
    // As imagens NÃO voltam: o rascunho guarda o `.bone`, e não os PNG. Com o
    // arquivo já salvo em disco, abrir por Arquivo → Abrir traz tudo.
    // Rodada 50, lote 4 (doc 100): a frase dizia o porquê e não o remédio.
    shell.statusState.textContent = `Reaberto o de ${quando}. As imagens não vêm no guardado: para trazê-las, Arquivo → Abrir pasta do projeto…`;
  } catch (error) {
    await shell.reportFailure('O guardado não pôde ser lido', error);
  }
}

/**
 * "Arquivo → Repetir a última exportação" (`Ctrl+Shift+E`) — item 103.
 *
 * Exportar é gesto que se repete dez vezes por tarde: mexeu, exporta, olha no
 * jogo. Responder às mesmas cinco perguntas dez vezes é o atrito que faz
 * alguém parar de conferir no jogo.
 *
 * Sem nada guardado, ele **abre a janela normal** em vez de adivinhar. E o
 * que ele repete são as OPÇÕES, nunca o destino: onde gravar é sempre
 * pergunta do navegador, e nenhum programa de dentro da aba escreve em disco
 * sem essa pergunta.
 */
export async function repeatExport(shell: Shell): Promise<void> {
  const last = loadMostRecentExport();
  if (last === null) {
    shell.statusState.textContent = 'Nada exportado ainda; abrindo a janela';
    await shell.exportImage();
    return;
  }
  if (last.kind === 'gltf') { await shell.exportGltf(); return; }
  if (last.kind === 'pele') { await shell.exportBySkin(); return; }

  const saved = loadLastExport('imagem');
  if (saved === null) { await shell.exportImage(); return; }
  const options = saved.options as unknown as ImageExportOptions;
  try {
    shell.statusState.textContent = `Repetindo a exportação de ${EXPORT_LABELS['imagem']}…`;
    const result = await buildImageExport(shell.doc, options);
    // Lote 51: a sequência sai num `.zip` só, como a janela decidiu.
    const onde = await saveExport(result, options, fileStem(shell.doc), shell.doc);
    shell.statusState.textContent = imageExportLine(result, options, onde);
  } catch (error) {
    await shell.reportFailure('Não deu para repetir a exportação', error);
  }
}

/**
 * "Arquivo → Configurações do projeto…" — item 106.
 *
 * Três coisas que valem para o projeto inteiro e que ninguém achava: os
 * quadros por segundo do esqueleto, a cor de fundo da cena e a densidade da
 * grade.
 *
 * O FPS vai para o ARQUIVO, porque é do personagem — é o passo do quadro que
 * o jogo vai usar. Os outros dois são de quem olha, e vão para as opções de
 * ver, que já viajam no `RECORTE_editor_state`.
 *
 * Lote 46: "Ao trocar de animação tocando" é do tocador (opções de ver); o
 * "Tempo de mistura" vai para o arquivo, no `defaultMix` de cada animação.
 */
export async function projectSettings(shell: Shell): Promise<void> {
  const skeleton = (shell.doc.file as { skeleton?: Record<string, unknown> }).skeleton ?? {};
  const view = viewSettings();
  const answer = await askForm({
    title: 'Configurações do projeto',
    lead: 'Os quadros por segundo e o tempo de mistura vão no arquivo, porque são do '
      + 'personagem. A cor de fundo, a grade e a troca de animação são de quem olha.',
    fields: [
      {
        id: 'fps', label: 'Quadros por segundo',
        hint: 'O passo do quadro. 30 é o comum; 24 é cinema; 60 é jogo rápido.',
        value: String(typeof skeleton['fps'] === 'number' ? skeleton['fps'] : 30),
      },
      {
        id: 'fundo', label: 'Cor de fundo', hint: 'Em #rrggbb. Exemplo: #f2f2f0',
        value: view.background,
      },
      {
        id: 'grade', label: 'Grade, em pixels',
        hint: 'De quanto as linhas não podem chegar mais perto. Menor = grade mais fina.',
        value: String(view.gridPixels),
      },
      {
        id: 'troca', label: 'Ao trocar de animação tocando',
        hint: `Terminar: a atual chega ao fim e a clicada entra do começo. ${SWITCH_HINT}`,
        value: view.switchMode,
        choices: SWITCH_MODES,
      },
      {
        id: 'mistura', label: 'Tempo de mistura, em segundos',
        hint: '0 = troca seca. Vai para todas as animações do arquivo: o jogo lê o mesmo número. '
          + SWITCH_HINT,
        value: formatMix(shell.doc.file),
      },
    ],
    yesLabel: 'Aplicar',
  });
  if (answer === null) return;

  // Lote 46: um passo de desfazer só, e nada gravado se o campo não mudou.
  const mistura = parseMixAnswer(shell.doc.file, answer['mistura'] ?? '');
  if (mistura !== null && (shell.doc.file.animations ?? []).length > 0) {
    shell.doc.run(new SetDefaultMixAll(mistura));
  }
  const troca = answer['troca'];

  // O FPS passa pelo MESMO caminho do painel Propriedades: o campo é o
  // `skeletonFields` de lá, e escrever nele é um `Command` como outro
  // qualquer. Um segundo caminho para escrever `skeleton.fps` seria um
  // segundo lugar para ele ficar errado.
  const fps = Number((answer['fps'] ?? '').replace(',', '.'));
  const field = skeletonFields(shell.doc.file)
    .flatMap((group) => group.fields)
    .find((f) => f.key === 'fps');
  if (Number.isFinite(fps) && fps > 0 && field !== undefined) {
    writeFieldValue(shell.doc, field, fps);
  }
  const fundo = (answer['fundo'] ?? '').trim();
  const grade = Number((answer['grade'] ?? '').replace(',', '.'));
  setViewSettings({
    ...(/^#[0-9a-fA-F]{6}$/.test(fundo) ? { background: fundo } : {}),
    ...(Number.isFinite(grade) ? { gridPixels: Math.min(400, Math.max(8, grade)) } : {}),
    ...(troca === 'terminar' || troca === 'na-hora' ? { switchMode: troca } : {}),
  });
  shell.statusState.textContent = 'Configurações do projeto aplicadas';
}

/**
 * "Ajuda → Paleta de comandos" (`Ctrl+Shift+P`) — item 110.
 *
 * Sete menus e mais de cem entradas: a pergunta mais comum deste programa é
 * "eu sei que existe, mas em qual menu está?". A paleta responde com três
 * letras.
 *
 * Ela busca sobre a MESMA lista que desenha os menus, então um comando novo
 * aparece aqui no dia em que aparece lá. E mostra o atalho ao lado, porque
 * quem procura o mesmo comando duas vezes é quem devia estar usando a tecla.
 */
export async function commandPalette(shell: Shell): Promise<void> {
  const menus = shell.groups();
  const action = await askPick({
    title: 'Paleta de comandos',
    placeholder: 'Digite parte do nome. Exemplo: cha, cebola, exportar',
    search: (text) => filterCommands(menus, text).map((command) => ({
      id: command.action,
      label: command.label,
      aside: command.shortcut ?? '',
      // **A dica na tela, e não só na busca** — 22/09/2026.
      //
      // Desde hoje a busca olha para a dica: quem digita "descendentes" acha o
      // Duplicar. Se a dica não aparecesse aqui, a linha surgiria **sem
      // explicação** — a busca certa com o resultado inexplicável, que é a
      // regra 21 pelo avesso: não é o programa adivinhando, é ele acertando e
      // não contando por quê.
      //
      // O menu continua à frente, que é o que desempata dois nomes parecidos.
      hint: command.hint === null ? command.menu : `${command.menu} · ${command.hint}`,
    })),
  });
  if (action === null) return;
  if (!hasAction(action)) {
    shell.statusState.textContent = 'Esse comando ainda não existe';
    return;
  }
  runAction(action);
}

/** "Ajuda → Manual": the manual, whole, in a new tab. */
export function showManual(shell: Shell): void {
  const tab = openManual();
  if (tab === null) {
    shell.statusState.textContent = 'O navegador bloqueou a aba nova.';
    void tellUser({
      title: 'O navegador bloqueou a aba nova',
      lead: 'O manual não abriu porque este navegador está barrando janelas novas. Dois caminhos:',
      lines: [
        'Libere as janelas para este endereço na barra do navegador e escolha Ajuda → Manual de novo.',
        `Ou abra os arquivos direto na pasta ${MANUAL_FOLDER} do projeto.`,
      ],
    });
    return;
  }
  shell.statusState.textContent = 'Manual aberto numa aba nova.';
}

/**
 * "Importar de outro programa…": Spine, DragonBones or Spriter.
 *
 * This replaces the whole document, so it asks before throwing unsaved work
 * away, and the list of what did not survive the conversion goes on screen.
 */
export async function importForeign(shell: Shell): Promise<void> {
  if (!(await shell.confirmDiscard())) return;
  try {
    // E6 (rodada 3): o peso, antes de ler as imagens — o mesmo do arrasto.
    // Rodada 45, lote 3: a pasta com mais de um projeto pergunta qual.
    const escolherProjeto = async (projetos: readonly string[]): Promise<string | null> => {
      const escolha = await askChoice({
        title: 'Qual projeto abrir?',
        lead: `A pasta tem ${projetos.length} projetos na raiz. As imagens das subpastas entram com o escolhido.`,
        options: [
          ...projetos.map((nome) => ({ id: nome, label: nome, hint: `Importa ${nome}; os outros projetos da pasta não são tocados` })),
          { id: '', label: 'Cancelar', hint: 'Nada é importado' },
        ],
        cancelId: '',
      });
      return escolha === '' ? null : escolha;
    };
    const imported = await importFromOtherProgram(undefined, (files) => gateHeavyForeign(shell, files), escolherProjeto);
    if (imported === null) return;
    forgetHandle();
    forgetImportedImages(shell.doc);
    shell.doc.setFile(imported.file, {
      path: imported.path, atlases: imported.atlases, images: imported.images,
    });
    const program = FORMAT_LABELS[imported.format];
    // E3b (29/09/2026): o passo 2, o mesmo do arrasto. Um projeto do Spriter
    // traz as imagens SOLTAS, e pelo menu elas não entravam: o boneco abria
    // sem desenho nenhum, e só o arrasto mostrava. Agora as imagens vão para a
    // aba Imagens, as que o boneco usa aparecem na cena, e o rodapé diz o
    // andamento e o resultado — quantas, e quais faltaram.
    shell.statusState.textContent = `Importado do ${program}: ${imported.path}. Lendo as imagens…`;
    const ligadas = await adoptForeignImages(shell.doc, imported, (feitas, total) => {
      shell.statusState.textContent =
        `Importado do ${program}: ${imported.path}. Lendo as imagens… ${feitas} de ${total}`;
    });
    if (ligadas.notice !== null) shell.showPanel('imagens');
    shell.statusState.textContent = `Importado do ${program}: ${imported.path}. `
      + `${imported.warnings.length} avisos.${ligadas.notice === null ? '' : ` ${ligadas.notice}`}`;

    // A `.bone` holds one skeleton. When the source file had several, say so
    // in the same window, with the names, instead of leaving them silent.
    // Rodada 45, lote 3: as linhas iguais viram uma, com a conta (doc 57, T10).
    const lines = agruparAvisos(imported.warnings);
    if (imported.parts.length > 1) {
      lines.push(
        `O arquivo de origem tem ${imported.parts.length} esqueletos: ${imported.parts.join(', ')}. `
        + 'Só o primeiro entrou. Para os outros, use a linha de comando: '
        + 'npm run importar entrada.json saida.bone -- --parte <nome>.',
      );
    }
    await tellUser({
      title: `Importado do ${program}`,
      lead: lines.length === 0
        ? `O arquivo ${imported.path} entrou inteiro. Nada se perdeu na conversão.`
        : `O arquivo ${imported.path} está aberto. Estes pontos não vieram iguais:`,
      lines,
    });
  } catch (error) {
    await shell.reportFailure('Não deu para importar', error);
  }
}

/**
 * "Importar PSD…": the art, straight out of Photoshop, layer by layer.
 *
 * Everything the import writes is one undo step, and everything it could not
 * carry over is on screen in the plain window before the user touches
 * anything — never only in the status bar.
 */
export async function importPsdFile(shell: Shell, bones = false): Promise<void> {
  try {
    // Lote 45: "PSD com ossos…" lê a camada `ossos` como esqueleto.
    const result = await importPsd(shell.doc, bones ? { bones: true } : {});
    if (result === null) return;
    // Lote A4: a janela dos avisos saiu do `io/`; a casca mostra, como antes.
    const aviso = psdWarningsNote(result);
    if (aviso !== null) await tellUser(aviso);
    shell.statusState.textContent = result.summary;
  } catch (error) {
    await shell.reportFailure('Não deu para importar o PSD', error);
  }
}

// "Reempacotar atlas" saiu no lote 62: o atlas nasce ao Salvar.

/** One place for "it did not work", so every failure reads the same way. */
export async function reportFailure(shell: Shell, title: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  shell.statusState.textContent = `${title}: ${message}`;
  await tellUser({ title, lines: [message] });
}

/** For tests: the entries of one menu, as they would be drawn right now. */
export function menuEntries(shell: Shell, label: string): Array<{ label: string; enabled: boolean }> {
  const group = shell.groups().find((g) => g.label === label);
  if (group === undefined) return [];
  return flatEntries(group.entries).map((entry) => {
    const state = actionState(entry.action);
    const hasChildren = entry.children !== undefined && entry.children.length > 0;
    return {
      label: entry.label,
      enabled: hasChildren || (entry.enabled && state.exists && state.enabled),
    };
  });
}

/** For tests and for the keyboard: runs one menu entry by its label. */
export function runMenuEntry(shell: Shell, menu: string, label: string): void {
  const group = shell.groups().find((g) => g.label === menu);
  const entry = group === undefined
    ? undefined
    : flatEntries(group.entries).find((e) => e.label === label);
  if (entry === undefined) throw new Error(`O menu ${menu} não tem "${label}".`);
  runAction(entry.action);
}
