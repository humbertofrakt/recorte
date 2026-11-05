/**
 * Pasta do projeto — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote59-pasta-do-projeto`, `lote60-lista-da-pasta`, `lote62-salvar-empacota`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadAtlas, loadSkeletonData } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { avisoSemPasta, escolhasDoPedido, nomeParaSalvar, novoNaPasta, pedirPastaAntes, salvarDireto } from '../src/io/pedir-pasta.js';
import { addFolderImages, addLooseFiles, folderImageNames, folderTree, forgetProjectFolder, imageNameOf, isFolderImage, isRecentFolder, naturalCompare, onFolderChange, openedNotice, projectFolder, recentFolderKey, relativeInsideFolder, reloadFolder, reloadNotice, reloadPlan, scanDirectory, setProjectFolder, skipFolderEntry, PROVISIONAL_IMAGE, isProvisionalAtlas, provisionalRegion, sameFolderImages, withProvisional, FOLDER_BONE_KEY, parseFolderBones } from '../src/io/project-folder.js';
import type { FolderDirectoryHandle, FolderFileHandle, FolderImage } from '../src/io/project-folder.js';
import { NO_ATLAS, ROOT_SECTION, paletteEntries, paletteNames, paletteSections, parseFolded, toggleFolded, usedImages, DropImageAsSlot, SwapSlotImage } from '../src/panels/palette-model.js';
import { dropHintFor, dropPlan, replacesDocument } from '../src/io/drop-plan.js';
import { auditMenus } from '../src/ui/menu-audit.js';
import { allMenus, fileMenu, flatEntries, isSeparator } from '../src/ui/menus.js';
import type { MenuItem, MenuState } from '../src/ui/menus.js';
import { WELCOME_BUTTONS } from '../src/viewport/welcome-model.js';
import { hasIcon } from '../src/ui/icons.js';
import * as importImagesModule from '../src/io/import-images.js';
import { viewMenuState } from './ajuda-view.js';
import { emptySelection } from '../src/contract.js';
import { ensureProvisional, provisionalNames } from '../src/io/folder-atlas.js';
import { atlasFilesForDisk } from '../src/io/pivot-atlas.js';
import { NO_FOLDER_HINT, PICKER_CLICK_SLOP, SwapImageAsKey, filterPicker, opensPicker, pickerEntries, pickerTarget } from '../src/panels/image-picker-model.js';
import { floatingMenuKey } from '../src/ui/floating-menu.js';
import type { PackerItem } from '../../ferramentas/src/atlas/packer.js';
import { atlasForSave, folderAtlasNames, folderSaveRoute, isOwnFolderAtlas, packForSave, shownFolderNames, withAtlasName } from '../src/io/folder-save.js';

// ---------------------------------------------------------------------------
// pasta do projeto (lote 59) — era `lote59-pasta-do-projeto.test.ts`
// ---------------------------------------------------------------------------

describe('pasta do projeto (lote 59)', () => {
/**
 * Lote 59 (plano pasta do projeto): Abrir pasta; a aba Imagens mostra a pasta.
 *
 * Sem DOM. O Humberto, 10/09/2026: *"para começar o projeto, a gente segue o
 * caminho do Spriter. Ele pede para abrir uma pasta."* E: *"no Spriter não
 * existe importar imagens."* O que se prova aqui é a conta da pasta — nomes,
 * subpastas, a ordem natural, o Recarregar —, que o menu perdeu o Importar →
 * Imagens…, e que soltar doze PNG na janela **não cria slot nenhum**: o defeito
 * da fila de 7.000 px.
 */
const AQUI = resolve(__dirname, '../src');
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile, { path: EXAMPLE });
}

function vazio(): Doc {
  return new Doc({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
  } as unknown as BoneFile);
}

/** Um arquivo de mentira, com a data que o Recarregar lê. */
function arquivo(name: string, modified = 1): FolderFileHandle {
  return { kind: 'file', name, getFile: async () => new File([], name, { lastModified: modified }) };
}

/** Uma pasta de mentira, com o que estiver em `entries` na hora da varredura. */
function pasta(name: string, entries: () => Array<FolderFileHandle | FolderDirectoryHandle>): FolderDirectoryHandle {
  return {
    kind: 'directory',
    name,
    values: async function* values() { yield* entries(); },
  };
}

function state(): MenuState {
  return {
    canRepack: false, canUndo: false, undoLabel: null, canRedo: false, redoLabel: null,
    view: viewMenuState(), lockBones: false, lockDrawings: false, space: 'local',
    compensation: { children: false, drawings: false, boxes: false },
    animating: true, loop: false, open: {},
  };
}

// ---------------------------------------------------------------------------
// A conta da pasta
// ---------------------------------------------------------------------------

describe('a pasta vira subpastas', () => {
  it('folderTree: as subpastas em ordem, a raiz por último', () => {
    const tree = folderTree(['maos/a', 'maos/b', 'cabecas/c', 'solta']);
    expect(tree.map((s) => s.folder)).toEqual(['cabecas', 'maos', '']);
    expect(tree[0]!.images).toEqual(['cabecas/c']);
    expect(tree[1]!.images).toEqual(['maos/a', 'maos/b']);
    expect(tree[2]!.images).toEqual(['solta']);
  });

  it('ordem natural: 01 (2) antes de 01 (10)', () => {
    expect(folderTree(['a/01 (10)', 'a/01 (2)'])[0]!.images).toEqual(['a/01 (2)', 'a/01 (10)']);
    const doze = Array.from({ length: 12 }, (_, i) => `01 (${i + 1})`);
    const embaralhado = [...doze].sort();
    expect(embaralhado[1]).toBe('01 (10)'); // a ordem das letras erra
    expect([...embaralhado].sort(naturalCompare)).toEqual(doze);
    expect(naturalCompare('mao_9', 'mao_10')).toBeLessThan(0);
  });

  it('o nome da imagem é o caminho sem a extensão, e o <input> perde o nome da pasta', () => {
    expect(imageNameOf('maos/mao_aberta.png')).toBe('maos/mao_aberta');
    expect(imageNameOf('01 (3).png')).toBe('01 (3)');
    expect(relativeInsideFolder('exemplos/maos/a.png')).toBe('maos/a.png');
    expect(relativeInsideFolder('solta.png')).toBe('solta.png');
    expect(isFolderImage('a.PNG')).toBe(true);
    expect(isFolderImage('heroi.bone')).toBe(false);
    expect(skipFolderEntry('.git')).toBe(true);
    expect(skipFolderEntry('node_modules')).toBe(true);
    expect(skipFolderEntry('maos')).toBe(false);
  });

  it('a varredura desce nas subpastas, pula as escondidas e o que não é imagem', async () => {
    const raiz = pasta('personagem', () => [
      arquivo('corpo.png'),
      arquivo('leiame.txt'),
      pasta('maos', () => [arquivo('mao_aberta.png'), arquivo('mao_fechada.png')]),
      pasta('.git', () => [arquivo('lixo.png')]),
      pasta('node_modules', () => [arquivo('icone.png')]),
    ]);
    const achadas = await scanDirectory(raiz);
    expect(achadas.map((i) => i.name).sort()).toEqual(['corpo', 'maos/mao_aberta', 'maos/mao_fechada']);
    expect(achadas.find((i) => i.name === 'maos/mao_aberta')?.path).toBe('maos/mao_aberta.png');
  });

  it('a frase de abrir diz quantas imagens e quantas subpastas', () => {
    expect(openedNotice('heroi', ['maos/a', 'maos/b', 'cabecas/c', 'solta']))
      .toBe('Pasta heroi: 4 imagens em 2 subpastas, na aba Imagens. Arraste uma para a cena');
    expect(openedNotice('vazia', [])).toContain('não tem imagens');
  });
});

// ---------------------------------------------------------------------------
// A aba Imagens com a pasta
// ---------------------------------------------------------------------------

describe('a aba Imagens mostra a pasta', () => {
  it('pasta aberta e atlas vazio: as imagens da pasta, sem uso, e a busca acha', () => {
    const doc = vazio();
    const nomes = ['maos/mao_aberta', 'maos/mao_fechada', 'cabecas/feliz'];
    const linhas = paletteEntries(paletteNames([], nomes), doc.file);
    expect(linhas.map((l) => l.name)).toEqual(nomes);
    expect(linhas.every((l) => l.usedBy === 0)).toBe(true);
    expect(paletteEntries(paletteNames([], nomes), doc.file, 'mao').map((l) => l.name))
      .toEqual(['maos/mao_aberta', 'maos/mao_fechada']);
  });

  it('atlas e pasta juntos não repetem nome', () => {
    expect(paletteNames(['body', 'face'], ['face', 'maos/a'])).toEqual(['body', 'face', 'maos/a']);
  });

  it('as linhas se agrupam por subpasta, a raiz por último', () => {
    const doc = heroi();
    const secoes = paletteSections(paletteEntries(['face', 'armadura/body', 'body'], doc.file));
    expect(secoes.map((s) => s.folder)).toEqual(['armadura', '']);
    expect(secoes[1]!.entries.map((e) => e.name)).toEqual(['body', 'face']);
    // O uso continua contado: o `face` do herói tem três.
    expect(secoes[1]!.entries.find((e) => e.name === 'face')?.usedBy).toBe(3);
    expect(ROOT_SECTION).not.toBe('');
  });

  it('a dobra das subpastas: liga, desliga, e texto estragado não derruba', () => {
    expect(toggleFolded([], 'maos')).toEqual(['maos']);
    expect(toggleFolded(['maos', 'cabecas'], 'maos')).toEqual(['cabecas']);
    expect(parseFolded('["maos",3,"cabecas"]')).toEqual(['maos', 'cabecas']);
    expect(parseFolded('{estragado')).toEqual([]);
    expect(parseFolded(null)).toEqual([]);
  });

  it('sem imagem nenhuma, a frase aponta para Abrir pasta', () => {
    expect(NO_ATLAS).toContain('Abrir pasta');
  });
});

// ---------------------------------------------------------------------------
// O defeito: doze PNG soltos na janela
// ---------------------------------------------------------------------------

describe('soltar doze PNG na janela', () => {
  const doze = Array.from({ length: 12 }, (_, i) => new File([], `01 (${i + 1}).png`, { type: 'image/png' }));

  it('o plano do arrasto é "imagens", e não troca o documento', () => {
    const plano = dropPlan(doze.map((f) => f.name));
    expect(plano.kind).toBe('imagens');
    expect(replacesDocument(plano)).toBe(false);
    expect(dropHintFor(plano)).toBe('Solte para pôr 12 imagens na aba Imagens');
  });

  it('12 entradas na aba, NENHUM slot, câmera e desfazer intocados', () => {
    const doc = vazio();
    doc.camera = { x: 0, y: 100, zoom: 1.5 };
    const antes = JSON.stringify(doc.file);
    const avisos: number[] = [];
    const parar = onFolderChange(() => avisos.push(1));

    const feito = addLooseFiles(doc, doze);
    parar();

    expect(feito.added).toHaveLength(12);
    expect(folderImageNames(doc)).toHaveLength(12);
    expect(folderImageNames(doc)).toContain('01 (12)');
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(doc.file.slots ?? []).toHaveLength(0);
    expect(doc.camera).toEqual({ x: 0, y: 100, zoom: 1.5 });
    expect(doc.dirty).toBe(false);
    expect(doc.canUndo).toBe(false);
    expect(avisos).toHaveLength(1);
    // Na aba, na ordem natural.
    const secao = paletteSections(paletteEntries(folderImageNames(doc), doc.file))[0]!;
    expect(secao.entries.map((e) => e.name).slice(0, 3)).toEqual(['01 (1)', '01 (2)', '01 (3)']);
  });

  it('soltar a mesma imagem de novo substitui, sem duplicar', () => {
    const doc = vazio();
    addLooseFiles(doc, doze.slice(0, 2));
    const segunda = addLooseFiles(doc, doze.slice(1, 3));
    expect(segunda.replaced).toEqual(['01 (2)']);
    expect(segunda.added).toEqual(['01 (3)']);
    expect(folderImageNames(doc)).toHaveLength(3);
  });

  it('as imagens soltas são de um documento só, e o Novo esquece', () => {
    const a = vazio();
    const b = vazio();
    addLooseFiles(a, doze.slice(0, 1));
    expect(folderImageNames(b)).toEqual([]);
    forgetProjectFolder(a);
    expect(projectFolder(a)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Recarregar
// ---------------------------------------------------------------------------

describe('Recarregar', () => {
  it('reloadPlan: nova entra, apagada sai, a usada fica marcada, a mudada refaz', () => {
    const plano = reloadPlan(
      [{ name: 'a', modified: 1 }, { name: 'b', modified: 1 }, { name: 'c', modified: 1 }, { name: 'd', modified: 1 }],
      [{ name: 'a', modified: 1 }, { name: 'b', modified: 2 }, { name: 'e', modified: 1 }],
      new Set(['c']),
    );
    expect(plano).toEqual({ added: ['e'], removed: ['d'], missing: ['c'], changed: ['b'] });
    expect(reloadNotice('proj', plano)).toContain('1 imagem nova');
    expect(reloadNotice('proj', { added: [], removed: [], missing: [], changed: [] })).toContain('igual');
  });

  it('reloadFolder relê a pasta de verdade, e guarda a usada que sumiu', async () => {
    const doc = heroi();
    let conteudo: FolderFileHandle[] = [arquivo('face.png'), arquivo('velha.png')];
    const handle = pasta('proj', () => conteudo);
    const imagens = await scanDirectory(handle);
    setProjectFolder(doc, { name: 'proj', handle, images: new Map(imagens.map((i) => [i.name, i])) });

    conteudo = [arquivo('nova.png'), arquivo('velha.png', 5)];
    const plano = await reloadFolder(doc, usedImages(doc.file));
    expect(plano).toEqual({ added: ['nova'], removed: [], missing: ['face'], changed: ['velha'] });
    expect(folderImageNames(doc).sort()).toEqual(['face', 'nova', 'velha']);
    expect(projectFolder(doc)?.images.get('face')?.missing).toBe(true);
  });

  it('pasta sem jeito de reler devolve nulo', async () => {
    const doc = vazio();
    addFolderImages(doc, []);
    expect(await reloadFolder(doc, new Set())).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Os menus, as boas-vindas e os recentes
// ---------------------------------------------------------------------------

describe('o menu Arquivo', () => {
  // P41 (29/09/2026): a pasta é a arte, e a arte ganhou um bloco próprio,
  // logo depois dos "abrir": o primeiro item depois do primeiro separador.
  it('ganhou Abrir pasta…, no primeiro item do bloco da pasta, depois dos "abrir"', () => {
    const topo = fileMenu();
    const primeiroCorte = topo.findIndex((e) => isSeparator(e));
    const depois = topo[primeiroCorte + 1] as { action?: string };
    expect(depois.action).toBe('abrir-pasta');
    const acoes = flatEntries(topo).map((e) => e.action);
    expect(acoes.indexOf('abrir-pasta')).toBeGreaterThan(acoes.indexOf('abrir'));
    const item = flatEntries(fileMenu()).find((e) => e.action === 'abrir-pasta');
    // Degrau 10 (10.1, P3): o rótulo passou a dizer de que pasta se fala — a
    // **pasta do projeto**, que é o `.bonez` aberto (§1.3, saída a).
    expect(item?.label).toBe('Abrir pasta do projeto…');
    expect(item?.hint ?? '').toContain('aba Imagens');
  });

  // P41 (29/09/2026): o Importar espelha o Exportar e ganhou, depois de um
  // separador, o bloco "de outro boneco". O bloco da arte continua com três.
  it('Importar → Imagens… saiu, e o bloco da arte do submenu ficou com três', () => {
    const importar = fileMenu().find((e) => 'action' in e && e.action === 'importar') as {
      children?: MenuItem[];
    };
    const filhos = importar.children ?? [];
    const corte = filhos.findIndex((c) => isSeparator(c));
    const arte = (corte < 0 ? filhos : filhos.slice(0, corte)) as Array<{ label: string }>;
    expect(arte.map((c) => c.label)).toEqual(['De outro programa…', 'PSD…', 'PSD com ossos…']);
    expect(flatEntries(fileMenu()).map((e) => e.action)).not.toContain('importar-imagens');
  });

  it('a auditoria dos sete menus continua sem nada', () => {
    expect(auditMenus(allMenus(state()))).toEqual([]);
  });
});

describe('as portas em volta', () => {
  it('as boas-vindas começam por Abrir pasta, com ícone que existe', () => {
    expect(WELCOME_BUTTONS[0]!.action).toBe('abrir-pasta');
    expect(hasIcon(WELCOME_BUTTONS[0]!.icon)).toBe(true);
    expect(hasIcon('reload')).toBe(true);
  });

  it('a pasta entra nos recentes com a barra no fim', () => {
    expect(recentFolderKey('heroi')).toBe('heroi/');
    expect(isRecentFolder('heroi/')).toBe(true);
    expect(isRecentFolder('heroi.bone')).toBe(false);
  });

  it('importar imagens e a fila saíram do código', () => {
    expect('importImages' in importImagesModule).toBe(false);
    const texto = readFileSync(resolve(AQUI, 'io/import-images.ts'), 'utf8');
    expect(texto).not.toContain("layout: 'fila'");
    expect(texto).not.toContain('cursorX');
  });
});
});

// ---------------------------------------------------------------------------
// lista da pasta (lote 60) — era `lote60-lista-da-pasta.test.ts`
// ---------------------------------------------------------------------------

describe('lista da pasta (lote 60)', () => {
/**
 * Lote 60 (plano pasta do projeto): da aba para a cena, e trocar a imagem pela
 * lista da pasta.
 *
 * Sem DOM. O Humberto, 10/09/2026: *"quero trocar as imagens como no Spriter:
 * com o botão esquerdo ele abre as imagens que estão na pasta; mostra a imagem
 * que está na mesma pasta."* O que se prova aqui: a região provisória (a
 * imagem da pasta vira região sem empacotar nada), a lista da mesma subpasta,
 * quando o clique na cena abre a lista, a troca pelo pivô com desfazer letra
 * por letra, a troca como chave em Animando, e o menu flutuante único.
 */
const SRC = resolve(__dirname, '../src');

/** Um atlas provisório com as três mãos da pasta, 100×50, pivô no pulso. */
function maos(): ReturnType<typeof loadAtlas> {
  let tree = withProvisional(null, { name: 'maos/mao_aberta', path: 'maos/mao_aberta.png', width: 100, height: 50 }, [40, 45]);
  tree = withProvisional(tree, { name: 'maos/mao_fechada', path: 'maos/mao_fechada.png', width: 100, height: 50 }, [40, 45]);
  tree = withProvisional(tree, { name: 'maos/mao_2', path: 'maos/mao_2.png', width: 100, height: 50 }, [40, 45]);
  return loadAtlas(JSON.parse(JSON.stringify(tree)));
}

/** Um boneco de um osso, com a mão aberta num slot e a animação `walk`. */
function boneco(): Doc {
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'mao', bone: 'root', attachment: 'mao' }],
    skins: [{
      name: 'default',
      attachments: {
        mao: {
          mao: { type: 'region', path: 'maos/mao_aberta', x: 5, y: 5, width: 10, height: 10 },
          alvo: { type: 'point' },
        },
      },
    }],
    animations: [{ name: 'walk' }],
  } as unknown as BoneFile;
  return new Doc(file, { atlases: [maos()] });
}

// ---------------------------------------------------------------------------
// A região provisória
// ---------------------------------------------------------------------------

describe('a região provisória', () => {
  it('provisionalRegion: a imagem inteira, na página que é ela', () => {
    expect(provisionalRegion({ name: 'maos/mao_aberta', path: 'maos/mao_aberta.png', width: 120, height: 80 }))
      .toEqual({
        name: 'maos/mao_aberta', page: 'maos/mao_aberta.png', x: 0, y: 0, width: 120, height: 80,
        originalWidth: 120, originalHeight: 80,
      });
    const comPivo = provisionalRegion({ name: 'a', path: 'a.png', width: 10, height: 10 }, [3, 4]);
    expect([comPivo.pivotX, comPivo.pivotY]).toEqual([3, 4]);
  });

  it('o atlas provisório lê no runtime, e cada página é uma imagem da pasta', () => {
    const atlas = maos();
    expect(isProvisionalAtlas(atlas)).toBe(true);
    expect(atlas.pages).toHaveLength(3);
    expect(atlas.pages.every((p) => p.image.startsWith(PROVISIONAL_IMAGE))).toBe(true);
    const region = atlas.findRegion('maos/mao_fechada');
    expect([region?.width, region?.height, region?.pivotX, region?.pivotY]).toEqual([100, 50, 40, 45]);
    // O atlas do herói não é provisório.
    expect(isProvisionalAtlas({ pages: [{ image: 'heroi.png' }] })).toBe(false);
  });

  it('trocar os pixels de uma imagem guarda o pivô que ela já tinha', () => {
    const tree = withProvisional(null, { name: 'a', path: 'a.png', width: 10, height: 10 }, [2, 3]);
    const outra = withProvisional(tree, { name: 'a', path: 'a.png', width: 20, height: 20 });
    expect(outra.pages).toHaveLength(1);
    expect(outra.regions[0]).toMatchObject({ width: 20, height: 20, pivotX: 2, pivotY: 3 });
    // Puro: a árvore de entrada ficou como estava.
    expect(tree.regions[0]).toMatchObject({ width: 10 });
  });

  it('o atlas provisório não vai para o disco como atlas', () => {
    const doc = boneco();
    expect(provisionalNames(doc).sort()).toEqual(['maos/mao_2', 'maos/mao_aberta', 'maos/mao_fechada']);
    expect(atlasFilesForDisk(doc).files).toEqual([]);
  });

  it('ensureProvisional: imagem que já tem região não relê nada; desconhecida é falso', async () => {
    const doc = boneco();
    expect(await ensureProvisional(doc, 'maos/mao_aberta')).toBe(true);
    expect(await ensureProvisional(doc, 'nao/existe')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// A lista da mesma subpasta
// ---------------------------------------------------------------------------

describe('a lista mostra a mesma subpasta', () => {
  const nomes = ['maos/mao_aberta', 'maos/mao_10', 'maos/mao_2', 'cabecas/feliz', 'solta'];

  it('sameFolderImages: as da mesma subpasta; da raiz, só as da raiz', () => {
    expect(sameFolderImages(['maos/a', 'maos/b', 'cabecas/c'], 'maos/a')).toEqual(['maos/a', 'maos/b']);
    expect(sameFolderImages(nomes, 'solta')).toEqual(['solta']);
  });

  it('pickerEntries: três mãos, a de agora marcada, em ordem natural', () => {
    const lista = pickerEntries(nomes, 'maos/mao_aberta');
    expect(lista.entries.map((e) => e.label)).toEqual(['mao_2', 'mao_10', 'mao_aberta']);
    expect(lista.entries.filter((e) => e.current).map((e) => e.name)).toEqual(['maos/mao_aberta']);
    expect(lista.hint).toBeNull();
    expect(lista.folder).toBe('maos');
  });

  it('atlas importado sem pasta: o mesmo prefixo; sem prefixo, todas com a dica', () => {
    const atlas = ['body', 'face', 'armadura/body', 'armadura/elmo'];
    expect(pickerEntries(atlas, 'armadura/body').entries.map((e) => e.name))
      .toEqual(['armadura/body', 'armadura/elmo']);
    const soltas = pickerEntries(atlas, 'body');
    expect(soltas.entries).toHaveLength(4);
    expect(soltas.hint).toBe(NO_FOLDER_HINT);
    // Com a pasta aberta, a raiz mostra só a raiz, sem a dica.
    const raiz = pickerEntries(atlas, 'body', { folderOpen: true });
    expect(raiz.entries.map((e) => e.name)).toEqual(['body', 'face']);
    expect(raiz.hint).toBeNull();
  });

  it('a busca da lista ignora acento e caixa', () => {
    const lista = pickerEntries(['maos/mão_aberta', 'maos/mao_fechada'], 'maos/mao_fechada');
    expect(filterPicker(lista.entries, 'ABERTA').map((e) => e.label)).toEqual(['mão_aberta']);
    expect(filterPicker(lista.entries, '  ')).toHaveLength(2);
  });

  it('pickerTarget acha a pele do desenho; ponto não tem imagem', () => {
    const doc = boneco();
    expect(pickerTarget(doc.file as never, [], 'mao', 'mao')).toEqual({ slot: 'mao', attachment: 'mao', skin: 'default' });
    expect(pickerTarget(doc.file as never, [], 'mao', 'alvo')).toBeNull();
    expect(pickerTarget(doc.file as never, [], 'mao', 'nada')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// O clique na cena
// ---------------------------------------------------------------------------

describe('o clique na cena abre a lista', () => {
  const escolhido = { ...emptySelection(), bones: ['root'], slots: ['mao'], attachments: [{ slot: 'mao', attachment: 'mao' }] };
  const naMao = { kind: 'attachment', slot: 'mao', attachment: 'mao' };

  it('clique parado no desenho já escolhido: abre', () => {
    expect(opensPicker(escolhido, naMao, 0)).toEqual({ slot: 'mao', attachment: 'mao' });
    expect(opensPicker(escolhido, naMao, PICKER_CLICK_SLOP - 1)).not.toBeNull();
  });

  it('clique e arrasto de 4 px: não abre, e o arrasto move', () => {
    expect(PICKER_CLICK_SLOP).toBe(4);
    expect(opensPicker(escolhido, naMao, 4)).toBeNull();
  });

  it('desenho que não estava escolhido só escolhe; botão direito e vazio não abrem', () => {
    expect(opensPicker(emptySelection(), naMao, 0)).toBeNull();
    expect(opensPicker(escolhido, { kind: 'attachment', slot: 'outro', attachment: 'x' }, 0)).toBeNull();
    expect(opensPicker(escolhido, { kind: 'bone', slot: null, attachment: null }, 0)).toBeNull();
    expect(opensPicker(escolhido, naMao, 0, 2)).toBeNull();
    expect(opensPicker(escolhido, null, 0)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Escolher na lista
// ---------------------------------------------------------------------------

describe('escolher outra mão', () => {
  it('o desenho aponta para a nova, o pivô dela cai onde estava o da velha, sem tamanho; desfazer volta por texto', () => {
    const doc = boneco();
    const antes = JSON.stringify(doc.file);
    doc.run(new SwapSlotImage('mao', 'maos/mao_fechada', 'default', 'mao'));
    const def = (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>)['mao']!['mao']!;
    expect(def['path']).toBe('maos/mao_fechada');
    // H1, P15a (29/09/2026): o pivô da nova cai ONDE ESTAVA o da velha — o
    // Spriter, e o padrão do Humberto de 16/09. Conta à mão: a aberta
    // (100×50, pivô 40; 45) está em (5; 5) esticada para 10×10, então o pivô
    // dela está no osso em (5 − 1; 5 + 4) = (4; 9). A fechada, no tamanho
    // dela, se desloca (10; −20) do pivô: fica em (4 + 10; 9 − 20) = (14; −11).
    // A regra velha punha o pivô na ORIGEM do osso, e dava (10; −20).
    expect(def['x']).toBeCloseTo(14, 6);
    expect(def['y']).toBeCloseTo(-11, 6);
    expect(def).not.toHaveProperty('width');
    expect(def).not.toHaveProperty('height');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('em Animando com Gravar: uma chave de Desenho, e a Montagem não muda', () => {
    const doc = boneco();
    const antes = JSON.stringify(doc.file);
    const command = new SwapImageAsKey('mao', 'mao', 'default', 'maos/mao_fechada', 'walk', 0.5);
    doc.run(command);
    expect(command.name).toBe('mao_fechada');
    const porSlot = (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>)['mao']!;
    expect(porSlot['mao_fechada']?.['path']).toBe('maos/mao_fechada');
    // O desenho de agora continua na Montagem.
    expect(porSlot['mao']?.['path']).toBe('maos/mao_aberta');
    expect(doc.file.slots![0]!.attachment).toBe('mao');
    const walk = JSON.stringify(doc.file.animations![0]);
    expect(walk).toContain('mao_fechada');
    expect(walk).toContain('0.5');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('em Animando, a imagem que o slot já tem num desenho reaproveita o desenho', () => {
    const doc = boneco();
    const command = new SwapImageAsKey('mao', 'mao', 'default', 'maos/mao_aberta', 'walk', 0);
    doc.run(command);
    expect(command.name).toBe('mao');
    expect(Object.keys((doc.file.skins![0]!.attachments as Record<string, object>)['mao']!)).toEqual(['mao', 'alvo']);
  });
});

// ---------------------------------------------------------------------------
// Da aba para a cena
// ---------------------------------------------------------------------------

describe('arrastar uma imagem da pasta para a cena', () => {
  it('o slot leva o nome sem a subpasta; o desenho guarda o caminho', () => {
    const doc = boneco();
    const command = new DropImageAsSlot(doc.file, 'maos/mao_fechada', 'root', [], 12, 34);
    doc.run(command);
    expect(command.name).toBe('mao_fechada');
    const def = (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>)['mao_fechada']!['mao_fechada']!;
    expect(def['path']).toBe('maos/mao_fechada');
    // A imagem da pasta tem região (provisória): o arquivo lê sem aviso.
    expect(doc.warnings).toEqual([]);
    // Duas vezes a mesma: nomes diferentes, sem barra.
    const outra = new DropImageAsSlot(doc.file, 'maos/mao_fechada', 'root', [], 0, 0);
    doc.run(outra);
    expect(outra.name).toBe('mao_fechada2');
  });
});

// ---------------------------------------------------------------------------
// O menu flutuante único
// ---------------------------------------------------------------------------

describe('o menu flutuante é um só', () => {
  it('Esc fecha; as setas andam; o resto passa', () => {
    expect(floatingMenuKey('Escape')).toBe('fechar');
    expect(floatingMenuKey('ArrowDown')).toBe('descer');
    expect(floatingMenuKey('ArrowUp')).toBe('subir');
    expect(floatingMenuKey('a')).toBeNull();
  });

  it('a Árvore e a aba Imagens usam o mesmo menu, sem arvore-menu próprio', () => {
    for (const arquivo of ['panels/tree.ts', 'panels/palette.ts']) {
      const texto = readFileSync(resolve(SRC, arquivo), 'utf8');
      expect(texto, arquivo).toContain('openFloatingMenu');
      expect(texto, arquivo).not.toContain("'arvore-menu");
    }
    const css = readFileSync(resolve(SRC, 'panels/panels.css'), 'utf8');
    expect(css).toContain('.menu-flutuante');
    expect(css).not.toContain('.arvore-menu');
  });

  // Lote 60c: o botão direito no desenho abre a grade das imagens, com as
  // opções; o "Definir pivô…" saiu dele. O Humberto: "era para ser trocar
  // imagens e algumas opções como no Spriter".
  it('o botão direito no desenho abre a grade das imagens; o pivô saiu dele', () => {
    const cena = readFileSync(resolve(SRC, 'viewport/viewport.ts'), 'utf8');
    expect(cena).toContain('requestImageGrid(doc, stage, this.camera');
    expect(cena).not.toContain("'Trocar por…'");
    expect(cena).not.toContain("'Definir pivô…'");
    expect(cena).toContain("opcao('Mandar para trás'");
    const aba = readFileSync(resolve(SRC, 'panels/palette.ts'), 'utf8');
    expect(aba).toContain("'Usar no desenho escolhido'");
  });
});
});

// ---------------------------------------------------------------------------
// salvar empacota (lote 62) — era `lote62-salvar-empacota.test.ts`
// ---------------------------------------------------------------------------

describe('salvar empacota (lote 62)', () => {
/**
 * Lote 62 (plano pasta do projeto): o Salvar empacota.
 *
 * Sem DOM. O Humberto, 10/09/2026: *"ao salvar em .bone, o programa empacota
 * o atlas e o resto."* O que se prova aqui: uma função só decide o que vai
 * para o atlas (`atlasForSave`), só o que está **em uso** entra, os nomes com
 * `/` e os pivôs vão junto, salvar → abrir sem a pasta → salvar de novo dá o
 * mesmo arquivo, o runtime lê o que saiu, a rota da pasta (gravar ou baixar,
 * e por quê), e que o Reempacotar saiu do menu.
 */
const SRC = resolve(__dirname, '../src');

/** Cinco imagens da pasta, 4×4, com pivô; três em uso no boneco, duas só na aba. */
function boneco(): Doc {
  let tree = null as ReturnType<typeof withProvisional> | null;
  for (const name of ['maos/mao_a', 'maos/mao_b', 'maos/mao_c', 'cabecas/feliz', 'cabecas/brava']) {
    tree = withProvisional(tree, { name, path: `${name}.png`, width: 4, height: 4 }, [1, 1]);
  }
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [
      { name: 'a', bone: 'root', attachment: 'a' },
      { name: 'b', bone: 'root', attachment: 'b' },
      { name: 'c', bone: 'root', attachment: 'c' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        a: { a: { type: 'region', path: 'maos/mao_a', x: 1, y: 1 } },
        b: { b: { type: 'region', path: 'maos/mao_b', x: 1, y: 1 } },
        c: { c: { type: 'region', path: 'cabecas/feliz', x: 1, y: 1 } },
      },
    }],
  } as unknown as BoneFile;
  return new Doc(file, { atlases: [loadAtlas(JSON.parse(JSON.stringify(tree)))], path: 'boneco.bone' });
}

/**
 * Os itens do plano, com pixels de mentira: é o que o navegador leria do canvas.
 * Cada um com uma cor: imagens iguais o empacotador junta numa região só, com
 * apelidos (§10.5), e aqui cada mão é uma mão.
 */
function comPixels(items: ReturnType<typeof atlasForSave>['items']): PackerItem[] {
  return items.map((item, index) => ({
    name: item.name, width: item.width, height: item.height,
    pixels: new Uint8Array(item.width * item.height * 4).fill(40 + index * 50),
    ...(item.pivotX === undefined ? {} : { pivotX: item.pivotX }),
    ...(item.pivotY === undefined ? {} : { pivotY: item.pivotY }),
  }));
}

/** O `.bone` sem a hora da gravação, que muda a cada Salvar. */
function semHora(text: string): string {
  return text.replace(/"modified": "[^"]*"/, '"modified": "-"');
}

describe('o que vai para o atlas: uma função só decide', () => {
  it('3 provisórias em uso e 2 só na aba: 3 itens, nomes com barra, pivôs presentes', () => {
    const plano = atlasForSave(boneco());
    expect(plano.reuse).toBe(false);
    expect(plano.items.map((i) => i.name).sort()).toEqual(['cabecas/feliz', 'maos/mao_a', 'maos/mao_b']);
    for (const item of plano.items) {
      expect(item.name).toContain('/');
      expect(item.pivotX, item.name).toBeDefined();
      expect(item.pivotY, item.name).toBeDefined();
    }
  });

  it('sem nada da pasta: reaproveita os atlas de sempre', () => {
    const doc = new Doc({ bone: { version: '1.0' }, bones: [{ name: 'root' }] } as unknown as BoneFile);
    expect(atlasForSave(doc)).toEqual({ items: [], reuse: true });
  });

  it('o empacotador guarda os nomes com barra e os pivôs, e o runtime lê', () => {
    const doc = boneco();
    const packed = packForSave(comPixels(atlasForSave(doc).items), 'boneco-atlas');
    expect(packed.atlas.regions.map((r) => r.name).sort()).toEqual(['cabecas/feliz', 'maos/mao_a', 'maos/mao_b']);
    expect(packed.atlas.regions.every((r) => r.pivotX !== undefined && r.pivotY !== undefined)).toBe(true);
    expect(packed.pages[0]!.image).toBe('boneco-atlas.png');
    const atlas = loadAtlas(JSON.parse(JSON.stringify(packed.atlas)));
    expect(atlas.warnings).toEqual([]);
  });
});

describe('salvar, abrir sem a pasta, salvar de novo', () => {
  it('o segundo arquivo é igual ao primeiro, texto contra texto', () => {
    // Primeiro Salvar: com a pasta, as provisórias em uso viram o atlas.
    const doc = boneco();
    const packed = packForSave(comPixels(atlasForSave(doc).items), 'boneco-atlas');
    withAtlasName(doc.file, 'boneco.atlas.json', null);
    const bone1 = doc.serialize();
    const atlas1 = `${JSON.stringify(packed.atlas, null, 2)}\n`;
    expect(JSON.parse(bone1).assets.atlases).toEqual(['boneco.atlas.json']);

    // O runtime lê o par que saiu, sem aviso e sem imagem faltando.
    const lido = loadSkeletonData(JSON.parse(bone1), { atlases: [loadAtlas(JSON.parse(atlas1))] });
    expect(lido.warnings).toEqual([]);
    expect(lido.missingImages).toEqual([]);

    // Abrir sem a pasta: pelo atlas salvo, como sempre.
    const doc2 = new Doc(JSON.parse(bone1) as BoneFile, {
      atlases: [loadAtlas(JSON.parse(atlas1))], path: 'boneco.bone',
    });
    expect(doc2.warnings).toEqual([]);
    // Segundo Salvar: nada da pasta, nada a reempacotar, e o atlas em disco fica.
    expect(atlasForSave(doc2)).toEqual({ items: [], reuse: true });
    expect(atlasFilesForDisk(doc2).files.filter((f) => f.fromImport || f.changed)).toEqual([]);
    expect(semHora(doc2.serialize())).toBe(semHora(bone1));
  });
});

describe('os nomes e a rota', () => {
  it('o atlas leva o nome do .bone, e não pisa no atlas que veio com o arquivo', () => {
    const file = { bone: {}, bones: [], assets: { atlases: ['heroi.atlas.json'] } } as unknown as BoneFile;
    expect(folderAtlasNames(file, 'heroi', null, new Set())).toEqual({
      atlas: 'heroi-pasta.atlas.json', page: 'heroi-pasta-atlas',
    });
    // O que o próprio Salvar gravou antes é reaproveitado.
    expect(folderAtlasNames(file, 'heroi', 'heroi.atlas.json', new Set()).atlas).toBe('heroi.atlas.json');
    // A página nunca tem o nome de uma imagem da pasta.
    const vazio = { bone: {}, bones: [] } as unknown as BoneFile;
    expect(folderAtlasNames(vazio, 'boneco', null, new Set(['boneco-atlas.png'])).page).toBe('boneco-atlas2');
  });

  it('o nome novo toma o lugar do antigo em assets.atlases', () => {
    const file = { bone: {}, bones: [], assets: { atlases: ['a.atlas.json', 'velho.atlas.json'] } } as unknown as BoneFile;
    withAtlasName(file, 'novo.atlas.json', 'velho.atlas.json');
    expect(file.assets?.atlases).toEqual(['a.atlas.json', 'novo.atlas.json']);
    withAtlasName(file, 'novo.atlas.json', 'novo.atlas.json');
    expect(file.assets?.atlases).toEqual(['a.atlas.json', 'novo.atlas.json']);
  });

  it('pasta aberta só para ler: baixa, e a frase diz por quê', () => {
    const rota = folderSaveRoute({ name: 'heroi', handle: null }, null);
    expect(rota.kind).toBe('baixar');
    expect(rota.kind === 'baixar' ? rota.why : '').toContain('só para ler');
  });

  it('o .bone dentro da pasta: grava ao lado; fora: baixa; sem pasta: o caminho de sempre', () => {
    const pasta = { name: 'heroi', handle: {} };
    expect(folderSaveRoute(pasta, ['heroi.bone'])).toEqual({ kind: 'pasta', path: [] });
    expect(folderSaveRoute(pasta, ['bones', 'heroi.bone'])).toEqual({ kind: 'pasta', path: ['bones'] });
    const fora = folderSaveRoute(pasta, null);
    expect(fora.kind === 'baixar' ? fora.why : '').toContain('fora da pasta');
    expect(folderSaveRoute(null, null)).toEqual({ kind: 'ao-lado' });
    expect(folderSaveRoute({ name: '', handle: null }, null).kind).toBe('baixar');
  });
});

describe('reabrir dentro da pasta', () => {
  const imagem = (name: string, path: string): FolderImage => ({
    name, path, read: async () => new File([], path),
  });

  it('o atlas salvo é reconhecido: toda região é uma imagem da pasta', () => {
    const packed = packForSave(comPixels(atlasForSave(boneco()).items), 'boneco-atlas');
    const atlas = loadAtlas(JSON.parse(JSON.stringify(packed.atlas)));
    expect(isOwnFolderAtlas(atlas, new Set(['maos/mao_a', 'maos/mao_b', 'cabecas/feliz', 'outra']))).toBe(true);
    expect(isOwnFolderAtlas(atlas, new Set(['maos/mao_a']))).toBe(false);
  });

  it('a página que o Salvar grava na pasta não aparece como peça na aba', () => {
    const doc = boneco();
    withAtlasName(doc.file, 'boneco.atlas.json', null);
    setProjectFolder(doc, {
      name: 'boneco', handle: null,
      images: new Map([
        ['boneco-atlas', imagem('boneco-atlas', 'boneco-atlas.png')],
        ['maos/mao_a', imagem('maos/mao_a', 'maos/mao_a.png')],
      ]),
    });
    expect(shownFolderNames(doc)).toEqual(['maos/mao_a']);
  });

  it('a pasta lembra o .bone que foi salvo nela; texto estragado não derruba', () => {
    expect(FOLDER_BONE_KEY).toBe('RECORTE_pasta_bone');
    expect(parseFolderBones('{"heroi":"heroi.bone","x":3}')).toEqual({ heroi: 'heroi.bone' });
    expect(parseFolderBones('{estragado')).toEqual({});
  });
});

describe('Reempacotar saiu: reempacotar é o Salvar', () => {
  function state(): MenuState {
    return {
      canRepack: true, canUndo: false, undoLabel: null, canRedo: false, redoLabel: null,
      view: viewMenuState(), lockBones: false, lockDrawings: false, space: 'local',
      compensation: { children: false, drawings: false, boxes: false },
      animating: true, loop: false, open: {},
    };
  }

  it('nenhum menu tem mais o item, e a auditoria continua limpa', () => {
    const todas = allMenus(state()).flatMap((g) => flatEntries(g.entries)).map((e) => e.action);
    expect(todas).not.toContain('reempacotar');
    expect(auditMenus(allMenus(state()))).toEqual([]);
    expect('repackAtlas' in importImagesModule).toBe(false);
    expect(readFileSync(resolve(SRC, 'ui/shell.ts'), 'utf8')).not.toContain("'reempacotar'");
  });

  it('o Salvar, o Salvar como e o pacote passam pela mesma função', () => {
    const salvar = readFileSync(resolve(SRC, 'io/open-save.ts'), 'utf8');
    const pacote = readFileSync(resolve(SRC, 'io/save-binary.ts'), 'utf8');
    expect(salvar).toContain('buildFolderPack');
    expect(pacote).toContain('buildFolderPack');
    expect(salvar).toContain('startIn');
  });
});
});

// ---------------------------------------------------------------------------
// O painel Entidades — degrau 5 (17/09/2026), tarefa 5.4, E15 e E16
// ---------------------------------------------------------------------------

import { readFileSync as lerD5 } from 'node:fs';
import { join as juntarD5, resolve as resolverD5 } from 'node:path';
import { parseBoneText as lerBoneD5 } from '../../runtime/src/index.js';
import type { BoneFile as BoneFileD5 } from '../../runtime/src/index.js';
import { Doc as DocD5 } from '../src/doc/document.js';
import { createEmptyFile as arquivoVazioD5 } from '../src/doc/new-file.js';
import {
  Projeto as ProjetoD5, emptyManifest as manifestoVazioD5,
  readProjectLists as lerListasD5, writeProjectLists as gravarListasD5,
} from '../src/doc/projeto.js';
import { demoteBody as rebaixarD5 } from '../src/panels/animations-actions.js';
import {
  ENTITY_DRAG_TYPE, NO_ENTITIES, entityData, entityFileMissing, entityHint, listEntities,
} from '../src/panels/palette-entities-model.js';
import { DRAG_TYPE as DRAG_IMAGEM_D5 } from '../src/panels/palette-model.js';
import { WINDOW_GROUPS as GRUPOS_JANELA_D5, WINDOW_PANELS as PAINEIS_JANELA_D5 } from '../src/ui/menus.js';
import { RIGHT_GROUPS as GRUPOS_DIREITA_D5, defaultLayout as defaultLayoutD5 } from '../src/ui/layout-model.js';

describe('o painel Entidades, ao lado do Imagens (degrau 5)', () => {
/**
 * E15: *"painel Entidades ao lado do Imagens"*. E16: a miniatura é **parada**
 * — veto do Humberto em 15/09, e ele substituiu a "miniatura animada" que o
 * manual tinha proposto.
 *
 * Sem DOM (regra 8): prova-se a conta (`palette-entities-model.ts`), o lugar
 * no menu Janela, e o desenho do painel como TEXTO.
 */
const CASO290_D5 = resolverD5(__dirname, '..', '..', 'conformidade', 'casos', 'C-290-virada-corte-seco');

function corpoD5(nome: string): BoneFileD5 {
  return lerBoneD5(lerD5(juntarD5(CASO290_D5, nome), 'utf8')) as BoneFileD5;
}

/** Um projeto de dois corpos e uma entidade listada, como o manifesto o traz. */
function projetoComEntidade(): { doc: DocD5; projeto: ProjetoD5 } {
  const doc = new DocD5(arquivoVazioD5());
  const projeto = new ProjetoD5(doc);
  const manifest = gravarListasD5(manifestoVazioD5('entrada.bone'), {
    corpos: ['entrada.bone', 'lobisomem.bone'],
    entidades: ['espada.bone'],
    emFoco: 'entrada.bone',
  });
  projeto.open(manifest, lerListasD5(manifest), new Map([
    ['entrada.bone', { file: corpoD5('entrada.bone'), options: {} }],
    ['lobisomem.bone', { file: corpoD5('lobisomem.bone'), options: {} }],
  ]));
  return { doc, projeto };
}

it('lista as entidades do projeto, na ordem do manifesto', () => {
  const { doc } = projetoComEntidade();
  expect(listEntities(doc)).toEqual([{ uri: 'espada.bone', name: 'espada', aberta: false }]);
});

it('um documento sem projeto não tem lista, e a aba diz de onde elas vêm', () => {
  const doc = new DocD5(corpoD5('entrada.bone'), { path: 'entrada.bone' });
  expect(listEntities(doc)).toEqual([]);
  expect(NO_ENTITIES).toContain('Abrir pasta');
  expect(NO_ENTITIES).toContain('rebaixando uma base');
});

it('um corpo rebaixado entra na lista com o nome dele, e marcado como aberto', () => {
  const { doc } = projetoComEntidade();
  rebaixarD5(doc, 'lobisomem.bone');
  expect(listEntities(doc)).toEqual([
    { uri: 'espada.bone', name: 'espada', aberta: false },
    { uri: 'lobisomem.bone', name: 'lobisomem', aberta: true },
  ]);
});

it('a miniatura de um corpo rebaixado sai do esqueleto dele, já montado', () => {
  const { doc } = projetoComEntidade();
  rebaixarD5(doc, 'lobisomem.bone');
  const data = entityData(doc, 'lobisomem.bone');
  expect(data).not.toBeNull();
  expect(data!.findBone('rabo')).not.toBeNull();
  // A entidade que ninguém carregou fica sem desenho, e a dica diz isso em vez
  // de mostrar um quadrado cinza que parece uma peça (regra 21).
  expect(entityData(doc, 'espada.bone')).toBeNull();
  expect(entityHint({ uri: 'espada.bone', name: 'espada', aberta: false }, false))
    .toContain('não está carregado');
});

it('a dica de uma linha diz os dois gestos', () => {
  const dica = entityHint({ uri: 'espada.bone', name: 'espada', aberta: false }, true);
  expect(dica).toContain('Arraste para a cena');
  expect(dica).toContain('Promover a base');
  expect(dica).not.toContain('não está carregado');
});

it('o arrasto da entidade tem tipo PRÓPRIO, diferente do da imagem', () => {
  // Quem recebe precisa saber no `dragover` se o que vem é uma imagem ou um
  // corpo inteiro: descobrir só no `drop` deixa o cursor mentindo o caminho todo.
  expect(ENTITY_DRAG_TYPE).not.toBe(DRAG_IMAGEM_D5);
  expect(ENTITY_DRAG_TYPE).toBe('text/x-recorte-entidade');
});

it('quando o arquivo não está na pasta, a barra diz qual pasta foi olhada', () => {
  expect(entityFileMissing('espada.bone', null)).toContain('Abrir pasta');
  expect(entityFileMissing('espada.bone', 'heroi')).toContain('pasta heroi');
});

it('o painel arrasta com o uri dentro, e a miniatura é a pose de repouso', () => {
  const fonte = lerD5(resolverD5(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
  expect(fonte).toContain("readonly id = 'entidades'");
  expect(fonte).toContain("readonly title = 'Tomadas'");
  expect(fonte).toContain('setData(ENTITY_DRAG_TYPE, row.uri)');
  /*
   * E16: PARADA. A miniatura sai da pose de repouso, uma vez — nem
   * `AnimationState`, nem relógio, nem quadro a quadro.
   *
   * Degrau 8: o desenho da miniatura mudou de casa para `entity-thumb.ts`,
   * porque a grade do botão direito precisa da mesma peça e importar o painel
   * só para desenhá-la registraria a aba Entidades em todo lugar que abre a
   * grade. O veto do Humberto é sobre o DESENHO, então é lá que ele se prova —
   * e nos dois arquivos, para ninguém pôr um relógio de volta num deles.
   */
  const desenho = lerD5(resolverD5(__dirname, '../src/panels/entity-thumb.ts'), 'utf8');
  expect(desenho).toContain('skeleton.setToSetupPose()');
  for (const texto of [fonte, desenho]) {
    expect(texto).not.toContain('AnimationState');
    expect(texto).not.toContain('requestAnimationFrame');
  }
});

it('a aba fica ao lado do Imagens, no menu Janela e no bloco de montar', () => {
  const ids = PAINEIS_JANELA_D5.map((painel) => painel.id);
  expect(ids).toContain('entidades');
  expect(ids.indexOf('entidades')).toBe(ids.indexOf('imagens') + 1);
  const montar = GRUPOS_JANELA_D5[0]!;
  expect(montar).toContain('entidades');
  expect([...montar].indexOf('entidades')).toBe([...montar].indexOf('imagens') + 1);
});

it('na arrumação de fábrica a aba nasce colada na Imagens, na coluna da direita', () => {
  /*
   * "Ao lado do Imagens" (E15) é uma promessa sobre a arrumação de FÁBRICA, e
   * quem a cumpre é o `RIGHT_GROUPS` do `layout-model.ts` — não os grupos do
   * `panel-groups.ts`, que só arrumam o que já está numa coluna.
   *
   * Este teste nasceu de um vermelho de verdade: o painel novo aparecia no
   * menu Janela e **não nascia na coluna**, porque `columnFrom` só deixa
   * passar o id que está escrito nos grupos. A prova `npm run medir` mostrou o
   * buraco ao contar 11 abas onde deviam ser 12 — ela não o mediu, e um painel
   * que a prova não vê é o defeito da regra 21 outra vez.
   */
  const conhecidos = PAINEIS_JANELA_D5.map((painel) => painel.id);
  const direita = GRUPOS_DIREITA_D5.map((grupo) => [...grupo]);
  const comImagens = direita.find((grupo) => grupo.includes('imagens'));
  expect(comImagens).toBeDefined();
  expect(comImagens!.indexOf('entidades')).toBe(comImagens!.indexOf('imagens') + 1);
  // E ela é um painel que a casca conhece: sem isso o `columnFrom` a filtraria.
  expect(conhecidos).toContain('entidades');
  const bancada = defaultLayoutD5(conhecidos);
  expect(bancada.right.groups.flat()).toContain('entidades');
});

it('a folha das Imagens traz o estilo da aba irmã', () => {
  const folha = lerD5(resolverD5(__dirname, '../src/panels/palette.css'), 'utf8');
  expect(folha).toMatch(/\.entidades-sem-desenho\s*\{/);
  expect(folha).toMatch(/\.entidades-aberta\s*\{/);
});
});

// ---------------------------------------------------------------------------
// Pasta numerada vira sequência (degrau 8, tarefa 8.6 — D4 gesto)
// ---------------------------------------------------------------------------

import { numberedSequence, sequenceNotice } from '../src/io/drop-plan.js';
import {
  DropImageAsSlot as TrazerD8, sequenceDropNotice, sequenceSlotName,
} from '../src/panels/palette-model.js';
import { Doc as DocD8 } from '../src/doc/document.js';
import { loadAtlas as lerAtlasD8, pose as poseD8, Skeleton as EsqueletoD8, loadSkeletonData as montarD8 } from '../../runtime/src/index.js';
import { withProvisional as provisoriaD8 } from '../src/io/project-folder.js';

describe('pasta numerada vira sequência (degrau 8)', () => {
/**
 * Palavra do Humberto: *"pasta numerada vira sequência"*. `olho_01…olho_08`
 * não são oito desenhos: são **um** desenho que pisca, e o formato já sabe
 * disso (§7.10). O modelo é o Spine 4.2, onde arrastar um grupo numerado cria
 * UM attachment de sequência.
 *
 * Sem DOM: prova-se a decisão (que é onde mora o erro — um buraco no meio da
 * numeração, nomes de tamanhos diferentes) e o anexo que nasce.
 */
it('oito imagens numeradas são uma sequência: prefixo, começo, algarismos e conta', () => {
  const nomes = ['olho_03', 'olho_01', 'olho_08', 'olho_02', 'olho_04', 'olho_05', 'olho_06', 'olho_07'];
  const corrida = numberedSequence(nomes)!;
  expect(corrida).not.toBe(null);
  expect(corrida.path).toBe('olho_');
  expect(corrida.start).toBe(1);
  expect(corrida.digits).toBe(2);
  expect(corrida.count).toBe(8);
  expect(corrida.frames[0]).toBe('olho_01');
  expect(corrida.frames.at(-1)).toBe('olho_08');
});

it('a extensão não atrapalha: o que conta é o número no fim do nome', () => {
  const corrida = numberedSequence(['fogo_1.png', 'fogo_2.png', 'fogo_3.png'])!;
  expect(corrida.path).toBe('fogo_');
  // Um algarismo só é "sem zero à esquerda" (§7.10): `digits` fica em 0.
  expect(corrida.digits).toBe(0);
  expect(corrida.frames).toEqual(['fogo_1', 'fogo_2', 'fogo_3']);
});

it('o que NÃO é sequência: sem número, buraco no meio, algarismos diferentes, prefixo diferente', () => {
  // Um buraco quase sempre é um arquivo que ficou para trás. Virar sequência
  // ali esconderia o erro em vez de mostrá-lo (regra 21).
  expect(numberedSequence(['fogo_01', 'fogo_02', 'fogo_09'])).toBe(null);
  expect(numberedSequence(['mao_aberta', 'mao_fechada'])).toBe(null);
  expect(numberedSequence(['fogo_1', 'fogo_02'])).toBe(null);
  expect(numberedSequence(['fogo_01', 'agua_02'])).toBe(null);
  // Uma imagem sozinha não é uma sequência: não há o que trocar.
  expect(numberedSequence(['fogo_01'])).toBe(null);
  expect(numberedSequence([])).toBe(null);
});

it('a sequência não precisa começar em 1', () => {
  const corrida = numberedSequence(['passo_12', 'passo_13', 'passo_14'])!;
  expect(corrida.start).toBe(12);
  expect(corrida.count).toBe(3);
});

it('o slot perde o separador do fim: `efeitos/olho_` vira `olho`', () => {
  expect(sequenceSlotName({ path: 'efeitos/olho_', start: 1, digits: 2, count: 8, frames: [] })).toBe('olho');
  expect(sequenceSlotName({ path: 'olho-', start: 1, digits: 0, count: 2, frames: [] })).toBe('olho');
  expect(sequenceSlotName({ path: '_', start: 1, digits: 0, count: 2, frames: [] })).toBe('sequencia');
});

it('nasce UM desenho com `sequence`, e o runtime troca o quadro por ele', () => {
  const corrida = numberedSequence(['olho_01', 'olho_02', 'olho_03'])!;
  let tree = null as ReturnType<typeof provisoriaD8> | null;
  for (const frame of corrida.frames) {
    tree = provisoriaD8(tree, { name: frame, path: `${frame}.png`, width: 20, height: 20 });
  }
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [],
    skins: [{ name: 'default', attachments: {} }],
  } as unknown as BoneFileD5;
  const doc = new DocD8(file, { atlases: [lerAtlasD8(JSON.parse(JSON.stringify(tree)) as never)] });
  const command = new TrazerD8(doc.file, corrida.frames[0]!, 'root', [], 0, 0, null, corrida);
  doc.run(command);
  expect(command.name).toBe('olho');
  const anexo = (doc.file.skins![0]!.attachments!['olho'] as unknown as Record<string, Record<string, unknown>>)['olho']!;
  // §7.10: o `path` é o PREFIXO; o nome do quadro sai de `path + número`.
  expect(anexo['path']).toBe('olho_');
  expect(anexo['sequence']).toEqual({ count: 3, start: 1, digits: 2 });
  // UM slot, não três.
  expect(doc.file.slots!.map((s) => s.name)).toEqual(['olho']);
  // E o runtime lê: sem chave, o quadro de repouso é o primeiro.
  const data = montarD8(doc.file);
  const skeleton = new EsqueletoD8(data);
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform();
  expect(data.findSlot('olho')).not.toBe(null);
});

it('desfazer tira o slot e o anexo, num passo só', () => {
  const corrida = numberedSequence(['olho_01', 'olho_02'])!;
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [],
    skins: [{ name: 'default', attachments: {} }],
  } as unknown as BoneFileD5;
  const doc = new DocD8(file);
  const texto = JSON.stringify(doc.file);
  doc.run(new TrazerD8(doc.file, corrida.frames[0]!, 'root', [], 0, 0, null, corrida));
  expect(JSON.stringify(doc.file)).not.toBe(texto);
  doc.undo();
  expect(JSON.stringify(doc.file)).toBe(texto);
});

it('as frases dizem quantos quadros, e que é UM desenho', () => {
  const corrida = numberedSequence(['olho_01', 'olho_02', 'olho_03'])!;
  expect(sequenceNotice(corrida)).toContain('3 imagens numeradas');
  expect(sequenceNotice(corrida)).toContain('UM desenho');
  const rodape = sequenceDropNotice('olho', corrida);
  expect(rodape).toContain('3 quadros');
  expect(rodape).toContain('olho_01');
  expect(rodape).toContain('olho_03');
});

it('as portas do gesto: o cabeçalho da subpasta, e a frase de quem solta na janela', () => {
  const painel = lerD5(resolverD5(__dirname, '../src/panels/palette.ts'), 'utf8');
  expect(painel).toContain("label: 'Trazer como sequência'");
  expect(painel).toContain('numberedSequence(secao.entries.map((entry) => entry.name))');
  // Apagada, a opção diz POR QUÊ (regra 21) em vez de ficar muda.
  expect(painel).toContain('não é uma corrida numerada');
  const soltar = lerD5(resolverD5(__dirname, '../src/ui/shell-drop.ts'), 'utf8');
  expect(soltar).toContain('numberedSequence([...feito.added, ...feito.replaced])');
  // A cena continua não ganhando nada sozinha (lote 59): o que muda é a frase.
  expect(soltar).toContain('Trazer como sequência');
});
});

// ---------------------------------------------------------------------------
// Trocar a pasta de origem (degrau 8, tarefa 8.3 — I4)
// ---------------------------------------------------------------------------

import { folderSizeWarning, folderSwapNotice, folderSwapPlan } from '../src/io/project-folder.js';
import { SWAP_FOLDER_HINT } from '../src/panels/palette.js';
import { SwapFolderImages } from '../src/panels/palette-model.js';
import { loadAtlas as lerAtlasI4 } from '../../runtime/src/index.js';
import { withProvisional as provisoriaI4 } from '../src/io/project-folder.js';

describe('trocar a pasta de origem (degrau 8)', () => {
/**
 * Ideia do Humberto, 16/09: *"apontar para outra pasta e trocar todo o acervo
 * pelas imagens de mesmo nome"*. É o character map por nome de ARQUIVO: o
 * herói de armadura, o herói ferido, a mesma montagem.
 *
 * O Recarregar não serve: ele compara nomes inteiros, e a pasta nova tem os
 * mesmos nomes em outro lugar. Sem DOM: prova-se a decisão e o comando.
 */
const AGORA = ['maos/mao_aberta', 'maos/mao_fechada', 'cabeca/rosto'];

it('casa pelo nome do arquivo, e não pelo caminho inteiro', () => {
  const plan = folderSwapPlan(AGORA, [
    'ferido/maos/mao_aberta', 'ferido/maos/mao_fechada', 'ferido/cabeca/rosto',
  ]);
  expect(plan.swaps).toEqual([
    { from: 'cabeca/rosto', to: 'ferido/cabeca/rosto' },
    { from: 'maos/mao_aberta', to: 'ferido/maos/mao_aberta' },
    { from: 'maos/mao_fechada', to: 'ferido/maos/mao_fechada' },
  ]);
  expect(plan.ambiguous).toEqual([]);
  expect(plan.missing).toEqual([]);
});

it('NOME REPETIDO NA PASTA NOVA AVISA E NÃO TROCA: só a pessoa sabe qual é', () => {
  // Escolher uma das duas seria pôr a arte errada no personagem em silêncio.
  const plan = folderSwapPlan(['maos/mao_aberta'], ['a/mao_aberta', 'b/mao_aberta']);
  expect(plan.swaps).toEqual([]);
  expect(plan.ambiguous).toEqual([
    { base: 'mao_aberta', from: 'maos/mao_aberta', candidates: ['a/mao_aberta', 'b/mao_aberta'] },
  ]);
  const frase = folderSwapNotice('ferido', plan);
  expect(frase).toContain('NÃO foi trocado');
  expect(frase).toContain('a/mao_aberta e b/mao_aberta');
});

it('o que a pasta nova não tem fica como está, e a frase diz qual é', () => {
  const plan = folderSwapPlan(AGORA, ['ferido/maos/mao_aberta']);
  expect(plan.swaps.map((s) => s.to)).toEqual(['ferido/maos/mao_aberta']);
  expect(plan.missing).toEqual(['cabeca/rosto', 'maos/mao_fechada']);
  expect(folderSwapNotice('ferido', plan)).toContain('ficaram como estavam');
});

it('a imagem que casa com ela mesma não conta como troca', () => {
  const plan = folderSwapPlan(['maos/mao_aberta'], ['maos/mao_aberta']);
  expect(plan.swaps).toEqual([]);
  expect(plan.missing).toEqual([]);
  expect(plan.ambiguous).toEqual([]);
});

it('pasta sem nenhum nome em comum: diz que nada mudou', () => {
  const plan = folderSwapPlan(AGORA, ['outra/coisa']);
  expect(folderSwapNotice('vazia', plan)).toContain('Nada mudou');
});

it('o comando troca o acervo inteiro num passo só, e o desfazer devolve o texto', () => {
  let tree = provisoriaI4(null, { name: 'maos/mao_aberta', path: 'a.png', width: 40, height: 40 }, [20, 4]);
  tree = provisoriaI4(tree, { name: 'ferido/maos/mao_aberta', path: 'b.png', width: 40, height: 40 }, [10, 8]);
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'mao', bone: 'root', attachment: 'mao' }],
    skins: [
      { name: 'default', attachments: { mao: { mao: { type: 'region', path: 'maos/mao_aberta', x: 0, y: 16 } } } },
      { name: 'luva', attachments: { mao: { mao: { type: 'region', path: 'maos/mao_aberta', x: 0, y: 16 } } } },
    ],
  } as unknown as BoneFile;
  const doc = new Doc(file, { atlases: [lerAtlasI4(JSON.parse(JSON.stringify(tree)) as never)] });
  const texto = JSON.stringify(doc.file);
  const command = new SwapFolderImages([{ from: 'maos/mao_aberta', to: 'ferido/maos/mao_aberta' }]);
  doc.run(command);
  // As DUAS peles trocaram: o acervo é do personagem inteiro.
  expect(command.changed).toBe(2);
  const anexo = (doc.file.skins![0]!.attachments!['mao'] as unknown as Record<string, Record<string, unknown>>)['mao']!;
  expect(anexo['path']).toBe('ferido/maos/mao_aberta');
  // E a imagem nova entrou PELO PIVÔ dela, que é outro: (10, 8) numa 40×40.
  expect(anexo['x']).toBe(10);
  expect(anexo['y']).toBe(12);
  doc.undo();
  expect(JSON.stringify(doc.file)).toBe(texto);
});

it('a sequência fica de fora: o `path` dela é um prefixo, não um nome de imagem', () => {
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'olho', bone: 'root', attachment: 'olho' }],
    skins: [{
      name: 'default',
      attachments: { olho: { olho: { type: 'region', path: 'olho_', sequence: { count: 3, start: 1 } } } },
    }],
  } as unknown as BoneFile;
  const doc = new Doc(file);
  const command = new SwapFolderImages([{ from: 'olho_', to: 'ferido/olho_' }]);
  doc.run(command);
  expect(command.changed).toBe(0);
});

it('a porta: um botão em ícone na linha da pasta, com o nome na dica', () => {
  const painel = lerD5(resolverD5(__dirname, '../src/panels/palette.ts'), 'utf8');
  expect(painel).toContain("iconButton('swap-folder', SWAP_FOLDER_HINT");
  expect(hasIcon('swap-folder')).toBe(true);
  // A dica diz o que o gesto faz E o que ele NÃO faz sozinho (regra 21).
  expect(SWAP_FOLDER_HINT).toContain('Trocar pasta de origem');
  expect(SWAP_FOLDER_HINT).toContain('repetido');
});

it('tamanho diferente avisa: o padrão da arte é a MESMA tela (I8)', () => {
  const iguais = [
    { name: 'maos/a', width: 40, height: 40 },
    { name: 'maos/b', width: 40, height: 40 },
  ];
  expect(folderSizeWarning('maos', iguais)).toBe(null);
  // Uma imagem sozinha não tem com quem discordar.
  expect(folderSizeWarning('maos', [iguais[0]!])).toBe(null);
  const aviso = folderSizeWarning('maos', [...iguais, { name: 'maos/c', width: 64, height: 40 }])!;
  expect(aviso).toContain('tamanhos diferentes');
  expect(aviso).toContain('40×40');
  expect(aviso).toContain('64×40');
  expect(aviso).toContain('proporção');
});
});

// ---------------------------------------------------------------------------
// "Este boneco": a entidade em volta de quem a recebe — rodada 11 (05/10/2026)
// ---------------------------------------------------------------------------
import { loadSkeletonData as carregarR11, collectDrawList as listaDeDesenhoR11 } from '../../runtime/src/index.js';
import type { BoneFile as BoneFileR11 } from '../../runtime/src/index.js';
import { Doc as DocR11 } from '../src/doc/document.js';
import {
  AROUND_SINCE, SetEntityAround, aroundCount, aroundLines, aroundNotice, aroundOf, aroundWarnings, fileUsesAround,
  markerCandidates, syncAroundHeader,
} from '../src/anim/entity-around.js';
import {
  AROUND_WHY, ENTITY_WHY as ENTITY_WHY_R11, aroundGridOption, aroundGridOptions, entityNow, setAround, whyNoAround, whyNoTakeOffAround,
} from '../src/panels/entities-actions.js';
import { DropEntityAsSlot as DropEntityAsSlotR13 } from '../src/doc/drop-entity.js';
import { allMenus as menusR11, flatEntries as entradasR11, NEUTRAL_MENU_STATE as ESTADO_NEUTRO_R11 } from '../src/ui/menus.js';
import { emptySelection as selecaoVaziaR11 } from '../src/contract.js';
import {
  NO_LOCKS as SEM_TRAVAS_R11, markerOutline as contornoDoMeioR11, nestedHit as nestedHitR11, pickAll as pickAllR11,
  withChosen as comEscolhidosR11,
} from '../src/viewport/picking.js';

describe('"Este boneco": a entidade em volta de quem a recebe (rodada 11)', () => {
  /** O slot `n` com o placeholder `n`: uma imagem de 10 × 10. */
  const regiao = (n: string): Record<string, unknown> => ({ [n]: { [n]: { type: 'region', path: n, width: 10, height: 10 } } });

  /** O poder: bola_a · anel · meio · brilho · bola_b, uma imagem em cada. */
  function poder(slots = ['bola_a', 'anel', 'meio', 'brilho', 'bola_b']): BoneFileR11 {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      skeleton: { name: 'poder' },
      bones: [{ name: 'root' }],
      slots: slots.map((s) => ({ name: s, bone: 'root', attachment: s })),
      skins: [{ name: 'default', attachments: Object.assign({}, ...slots.map(regiao)) }],
      animations: [],
    } as unknown as BoneFileR11;
  }

  /** O herói: perna · tronco · aura (o poder) · cabeca, e uma animação `andar` de 1 s. */
  function heroi(): BoneFileR11 {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      skeleton: { name: 'heroi' },
      assets: { skeletonsBase: '' },
      bones: [{ name: 'root' }],
      slots: [
        { name: 'perna', bone: 'root', attachment: 'perna' }, { name: 'tronco', bone: 'root', attachment: 'tronco' },
        { name: 'aura', bone: 'root', attachment: 'poder' }, { name: 'cabeca', bone: 'root', attachment: 'cabeca' },
      ],
      skins: [{ name: 'default', attachments: {
        ...regiao('perna'), ...regiao('tronco'), ...regiao('cabeca'),
        aura: { poder: { type: 'skeleton', uri: 'poder.bone' } },
      } }],
      animations: [{ name: 'andar', duration: 1, timelines: [
        { type: 'bone', target: 'root', property: 'x', keys: [{ time: 0, value: 0 }, { time: 1, value: 0 }] },
      ] }],
    } as unknown as BoneFileR11;
  }

  function abrir(filho: BoneFileR11 | null = poder(), file: BoneFileR11 = heroi()): DocR11 {
    const skeletons = filho === null ? new Map() : new Map([['poder.bone', carregarR11(JSON.parse(JSON.stringify(filho)))]]);
    return new DocR11(file, { skeletons, path: 'heroi.bone' });
  }

  /** O arquivo, letra por letra. (`serialize()` carimba a hora de salvar; por isso não é ele.) */
  const letras = (doc: DocR11): string => JSON.stringify(doc.file);
  const naTela = (doc: DocR11): string[] => listaDeDesenhoR11(doc.skeleton!).map((p) => p.name);
  const EM_BLOCO = [
    'perna/perna', 'tronco/tronco', 'aura/bola_a/bola_a', 'aura/anel/anel', 'aura/meio/meio',
    'aura/brilho/brilho', 'aura/bola_b/bola_b', 'cabeca/cabeca',
  ];
  const EM_VOLTA = [
    'aura/bola_a/bola_a', 'aura/anel/anel', 'perna/perna', 'tronco/tronco', 'cabeca/cabeca',
    'aura/brilho/brilho', 'aura/bola_b/bola_b',
  ];
  const ENTIDADE = { skin: 'default', slot: 'aura', attachment: 'poder' };

  it('na base: grava `around` no anexo, a cena passa a desenhar em volta, e o desfazer devolve letra por letra', () => {
    const doc = abrir();
    const texto = letras(doc);
    expect(naTela(doc)).toEqual(EM_BLOCO);
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio'));
    expect(aroundOf(doc.file, ENTIDADE)).toBe('meio');
    expect(naTela(doc)).toEqual(EM_VOLTA);
    doc.undo();
    expect(letras(doc)).toBe(texto);
    expect(naTela(doc)).toEqual(EM_BLOCO);
    doc.redo();
    expect(naTela(doc)).toEqual(EM_VOLTA);
  });

  it('o `minVersion` só sobe para 1.1 quando o campo existe, e volta quando ele sai', () => {
    const doc = abrir();
    const texto = letras(doc);
    expect(texto).not.toContain('"1.1"');
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio'));
    expect((doc.file.bone as { minVersion: string; version: string }).minVersion).toBe(AROUND_SINCE);
    expect((doc.file.bone as { minVersion: string; version: string }).version).toBe(AROUND_SINCE);
    // Tirar a marca (um comando novo, não o desfazer) devolve o arquivo de antes.
    doc.run(new SetEntityAround('aura', 'poder', 'default', null));
    expect(fileUsesAround(doc.file)).toBe(false);
    expect(letras(doc)).toBe(texto);
  });

  it('arquivo SEM `around` não é tocado: o cabeçalho e o texto salvo saem byte a byte iguais', () => {
    const file = heroi();
    const antes = JSON.stringify(file);
    syncAroundHeader(file);
    expect(JSON.stringify(file)).toBe(antes);
    // Nem um arquivo que já dizia 1.3 por outro motivo: só o 1.1 exato desce.
    const novo = heroi();
    (novo.bone as { version: string; minVersion: string }).version = '1.3';
    const antesNovo = JSON.stringify(novo);
    syncAroundHeader(novo);
    expect(JSON.stringify(novo)).toBe(antesNovo);
    // E abrir, mexer em outra coisa e salvar não escreve nada da 1.1.
    const doc = abrir();
    expect(doc.serialize()).not.toContain('around');
    expect(doc.serialize()).not.toContain('"1.1"');
  });

  it('no meio de uma animação: um segundo placeholder e a chave; vale só nela, daquele quadro em diante', () => {
    const doc = abrir();
    const texto = letras(doc);
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio', { animation: 'andar', time: 0.5 }));
    // A base não mudou: o anexo de sempre continua sem a marca.
    expect(aroundOf(doc.file, ENTIDADE)).toBeNull();
    expect(aroundOf(doc.file, { ...ENTIDADE, attachment: 'poder_este_boneco' })).toBe('meio');
    const linha = (doc.file.animations![0]!.timelines as unknown as Array<Record<string, unknown>>)
      .find((t) => t['type'] === 'slot' && t['target'] === 'aura' && t['property'] === 'attachment')!;
    expect((linha['keys'] as Array<{ time: number; value: string }>).map((k) => [k.time, k.value]))
      .toEqual([[0, 'poder'], [0.5, 'poder_este_boneco']]);
    // Com a base aberta, em bloco; na animação, antes do quadro em bloco, depois em volta.
    expect(naTela(doc)).toEqual(EM_BLOCO);
    doc.animation = 'andar';
    doc.time = 0.25;
    expect(naTela(doc)).toEqual(EM_BLOCO);
    doc.time = 0.75;
    expect(naTela(doc)).toEqual(EM_VOLTA);
    doc.undo();
    expect(letras(doc)).toBe(texto);
  });

  it('tirar a marca só num trecho: o placeholder em bloco e a chave; a base continua marcada', () => {
    const doc = abrir();
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio'));
    const marcado = letras(doc);
    doc.run(new SetEntityAround('aura', 'poder', 'default', null, { animation: 'andar', time: 0.5 }));
    expect(aroundOf(doc.file, ENTIDADE)).toBe('meio');
    expect(aroundOf(doc.file, { ...ENTIDADE, attachment: 'poder_em_bloco' })).toBeNull();
    expect((doc.file.bone as { minVersion: string }).minVersion).toBe(AROUND_SINCE);
    doc.animation = 'andar';
    doc.time = 0.25;
    expect(naTela(doc)).toEqual(EM_VOLTA);
    doc.time = 0.75;
    expect(naTela(doc)).toEqual(EM_BLOCO);
    doc.undo();
    expect(letras(doc)).toBe(marcado);
  });

  it('marcar duas vezes na mesma animação reusa o placeholder: não nasce `poder_este_boneco2`', () => {
    const doc = abrir();
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio', { animation: 'andar', time: 0.25 }));
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio', { animation: 'andar', time: 0.75 }));
    const nomes = Object.keys((doc.file.skins![0]!.attachments as Record<string, Record<string, unknown>>)['aura']!);
    expect(nomes).toEqual(['poder', 'poder_este_boneco']);
  });

  it('as contas: os candidatos a meio, quantas atrás e na frente, e o rodapé', () => {
    const filho = carregarR11(JSON.parse(JSON.stringify(poder())));
    expect(markerCandidates(filho)).toEqual(['bola_a', 'anel', 'meio', 'brilho', 'bola_b']);
    expect(markerCandidates(null)).toEqual([]);
    expect(aroundCount(filho, 'meio')).toEqual({ behind: 2, front: 2 });
    expect(aroundCount(filho, 'bola_a')).toEqual({ behind: 0, front: 4 });
    expect(aroundCount(filho, 'nao_existe')).toBeNull();
    expect(aroundCount(null, 'meio')).toBeNull();
    expect(aroundNotice('poder.bone', 'heroi', 'meio', { behind: 2, front: 2 }, null))
      .toBe('poder em volta de heroi: 2 atrás, 2 na frente. A imagem "meio" marca o meio e não é desenhada');
    expect(aroundNotice('poder.bone', 'heroi', 'meio', { behind: 2, front: 2 }, { animation: 'andar', time: 0.5 }))
      .toContain('só nesta animação, de 0,50 s em diante');
    expect(aroundNotice('poder.bone', 'heroi', null, null, null)).toContain('voltou a ser desenhada em bloco');
  });

  it('o slot do meio que não existe mais na entidade: a barra de avisos diz, e a cena desenha em bloco', () => {
    // A entidade foi aberta e salva sem o slot `meio`.
    const semMeio = poder(['bola_a', 'anel', 'brilho', 'bola_b']);
    const file = heroi();
    ((file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)['aura']!['poder']!)['around'] = 'meio';
    const doc = abrir(semMeio, file);
    const avisos = doc.warnings.filter((w) => w.startsWith('Este boneco'));
    expect(avisos.length).toBe(1);
    expect(avisos[0]).toContain('"meio"');
    expect(avisos[0]).toContain('poder');
    expect(avisos[0]).toContain('em bloco');
    expect(naTela(doc)).toEqual(['perna/perna', 'tronco/tronco', 'aura/bola_a/bola_a', 'aura/anel/anel',
      'aura/brilho/brilho', 'aura/bola_b/bola_b', 'cabeca/cabeca']);
    // Com o slot no lugar não há aviso; com a entidade fechada, não se julga.
    expect(aroundWarnings(file, new Map([['poder.bone', carregarR11(JSON.parse(JSON.stringify(poder())))]]))).toEqual([]);
    expect(aroundWarnings(file, new Map())).toEqual([]);
    expect(aroundWarnings(heroi(), new Map())).toEqual([]);
  });

  it('as portas: cinza diz por quê, e a entidade é a do placeholder que o slot mostra AGORA', () => {
    const doc = abrir();
    expect(whyNoAround(doc)).toBe(ENTITY_WHY_R11.escolher);
    expect(whyNoTakeOffAround(doc)).toBe(ENTITY_WHY_R11.escolher);
    doc.select({ ...selecaoVaziaR11(), slots: ['aura'] });
    expect(whyNoAround(doc)).toBeNull();
    expect(whyNoTakeOffAround(doc)).toBe(AROUND_WHY.semMarca);
    // Marca só na animação, de 0,5 em diante.
    doc.animation = 'andar';
    doc.time = 0.5;
    expect(setAround(doc, 'meio')).toBe(true);
    expect(entityNow(doc)!.attachment).toBe('poder_este_boneco');
    expect(whyNoTakeOffAround(doc)).toBeNull();
    doc.time = 0.25;
    expect(entityNow(doc)!.attachment).toBe('poder');
    expect(whyNoTakeOffAround(doc)).toBe(AROUND_WHY.semMarca);
    // Um slot que a entidade não tem: nada é gravado.
    const antes = letras(doc);
    expect(setAround(doc, 'nao_existe')).toBe(false);
    expect(letras(doc)).toBe(antes);
    // Entidade fechada: a porta diz que não sabe que imagens ela tem.
    const fechado = abrir(null);
    fechado.select({ ...selecaoVaziaR11(), slots: ['aura'] });
    expect(whyNoAround(fechado)).toBe(AROUND_WHY.fechada('poder.bone'));
  });

  it('o menu Entidades tem as duas portas, com dica', () => {
    // 05/11/2026: o menu Entidades virou Tomadas.
    const entradas = menusR11(ESTADO_NEUTRO_R11).find((g) => g.label === 'Tomadas')!;
    const porId = new Map(entradasR11(entradas.entries).map((e) => [e.action, e]));
    expect(porId.get('este-boneco')!.label).toBe('Este boneco…');
    expect(porId.get('tirar-este-boneco')!.label).toBe('Tirar o Este boneco');
    expect(String(porId.get('este-boneco')!.hint)).toContain('marca o meio');
  });
  // ---- parte 2 (05/10/2026): o clique, a grade, o contorno e a aba Ordem ----
  //
  // Todas as imagens do herói e do poder são quadrados de 10 × 10 no (0, 0):
  // o clique em (0, 0) acerta TODAS, e a ordem dos acertos é a de cima para baixo.

  const acertos = (doc: DocR11, locks = SEM_TRAVAS_R11): string[] => pickAllR11(doc.skeleton, 0, 0, 1, locks)
    .filter((h) => h.kind === 'attachment').map((h) => (h.inner === undefined ? h.slot! : `${h.slot}>${h.inner}`));

  it('o clique segue a ordem em volta: o que está desenhado por cima é o que ele pega', () => {
    const doc = abrir();
    // Em bloco: a aura está entre o tronco e a cabeça.
    expect(acertos(doc)).toEqual(['cabeca', 'aura>bola_b', 'tronco', 'perna']);
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio'));
    // Em volta: a metade da frente da aura fica por cima da cabeça. Um acerto só por peça.
    expect(acertos(doc)).toEqual(['aura>bola_b', 'cabeca', 'tronco', 'perna']);
  });

  it('o clique diz QUAL imagem de dentro: a de cima da metade, e nunca o meio', () => {
    const doc = abrir();
    const aura = (): never => doc.skeleton!.findSlot('aura') as never;
    const anexo = (): never => doc.skeleton!.findSlot('aura')!.attachment as never;
    expect(nestedHitR11(aura(), anexo(), 0, 0)).toBe('bola_b');
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio'));
    expect(nestedHitR11(aura(), anexo(), 0, 0, { marker: 'meio', part: 'front' })).toBe('bola_b');
    expect(nestedHitR11(aura(), anexo(), 0, 0, { marker: 'meio', part: 'back' })).toBe('anel');
    // Fora de todo desenho: nada.
    expect(nestedHitR11(aura(), anexo(), 500, 500)).toBeNull();
    // O meio é a ÚLTIMA peça da entidade: sem nada na frente dele, a metade da frente não acerta nada.
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'bola_b'));
    expect(nestedHitR11(aura(), anexo(), 0, 0, { marker: 'bola_b', part: 'front' })).toBeNull();
    expect(nestedHitR11(aura(), anexo(), 0, 0, { marker: 'bola_b', part: 'back' })).toBe('brilho');
  });

  it('o meio, que não é desenhado, só pega o clique com a peça ESCOLHIDA', () => {
    const doc = abrir();
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio'));
    expect(acertos(doc)[0]).toBe('aura>bola_b');
    expect(acertos(doc, comEscolhidosR11(SEM_TRAVAS_R11, ['aura']))[0]).toBe('aura>meio');
    // Outra peça escolhida não libera o meio da aura.
    expect(acertos(doc, comEscolhidosR11(SEM_TRAVAS_R11, ['perna']))[0]).toBe('aura>bola_b');
    // Sem a marca não há meio: a peça escolhida não muda nada.
    doc.undo();
    expect(acertos(doc, comEscolhidosR11(SEM_TRAVAS_R11, ['aura']))).toEqual(['cabeca', 'aura>bola_b', 'tronco', 'perna']);
  });

  it('o contorno do meio: os quatro cantos da imagem que não é desenhada, com o nome', () => {
    const doc = abrir();
    expect(contornoDoMeioR11(doc.skeleton, 'aura')).toBeNull();
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio'));
    const meio = contornoDoMeioR11(doc.skeleton, 'aura')!;
    expect(meio.name).toBe('meio');
    expect(meio.vertices.length).toBe(8);
    expect(Math.min(...meio.vertices)).toBeCloseTo(-5, 9);
    expect(Math.max(...meio.vertices)).toBeCloseTo(5, 9);
    expect(contornoDoMeioR11(doc.skeleton, 'perna')).toBeNull();
    expect(contornoDoMeioR11(doc.skeleton, 'nao_existe')).toBeNull();
    expect(contornoDoMeioR11(null, 'aura')).toBeNull();
  });

  it('o primeiro item da grade: Este boneco marca; na imagem que já é o meio aparece marcado, e clicar tira', () => {
    const doc = abrir();
    const texto = letras(doc);
    // O clique não foi numa imagem de dentro de entidade: a grade não ganha o item.
    expect(aroundGridOption(doc, 'aura', undefined)).toBeNull();
    expect(aroundGridOption(doc, 'perna', 'perna')).toBeNull();
    expect(aroundGridOption(doc, 'aura', 'nao_existe')).toBeNull();
    const marcar = aroundGridOption(doc, 'aura', 'brilho')!;
    expect(marcar.label).toBe('Este boneco');
    expect(marcar.checked).toBe(false);
    expect(marcar.hint).toContain('3 atrás do boneco inteiro, 1 na frente');
    expect(marcar.run()).toBe(true);
    expect(aroundOf(doc.file, ENTIDADE)).toBe('brilho');
    // A mesma imagem, de novo: marcado, e clicar tira.
    const tirar = aroundGridOption(doc, 'aura', 'brilho')!;
    expect(tirar.label).toBe('Este boneco ✓');
    expect(tirar.checked).toBe(true);
    // Outra imagem, com a marca ligada: troca o meio, e a dica diz qual é o de hoje.
    const trocar = aroundGridOption(doc, 'aura', 'anel')!;
    expect(trocar.checked).toBe(false);
    expect(trocar.hint).toContain('Hoje o meio é "brilho"');
    expect(tirar.run()).toBe(true);
    expect(aroundOf(doc.file, ENTIDADE)).toBeNull();
    expect(letras(doc)).toBe(texto);
  });

  it('v27.7, o defeito 5 do "15": soltar UMA entidade nova cria UM slot; "poder52" só nasce de uma SEGUNDA soltura', () => {
    const doc = abrir();
    const antes = (doc.file.slots ?? []).length;
    const um = new DropEntityAsSlotR13(doc.file, 'poder5.bone', 'root', doc.visibleSkins, 0, 0, null);
    doc.run(um);
    expect(um.name).toBe('poder5');
    expect((doc.file.slots ?? []).length).toBe(antes + 1);
    expect((doc.file.slots ?? []).filter((s) => s.name.startsWith('poder5'))).toHaveLength(1);
    // O nome que a conferência viu é o da segunda soltura do mesmo arquivo.
    const dois = new DropEntityAsSlotR13(doc.file, 'poder5.bone', 'root', doc.visibleSkins, 0, 0, null);
    expect(dois.name).toBe('poder52');
  });

  it('v27.7: com a marca ligada, o botão direito em QUALQUER imagem de dentro traz "Tirar o Este boneco" no alto', () => {
    const doc = abrir();
    const texto = letras(doc);
    // Sem a marca: só "Este boneco".
    expect(aroundGridOptions(doc, 'aura', 'anel').map((o) => o.label)).toEqual(['Este boneco']);
    aroundGridOptions(doc, 'aura', 'brilho')[0]!.run();
    expect(aroundOf(doc.file, ENTIDADE)).toBe('brilho');
    // Outra imagem de dentro: Tirar primeiro, e trocar o meio depois.
    const outra = aroundGridOptions(doc, 'aura', 'anel');
    expect(outra.map((o) => o.label)).toEqual(['Tirar o Este boneco', 'Este boneco: o meio passa a ser esta']);
    // O meio mesmo: só Tirar.
    expect(aroundGridOptions(doc, 'aura', 'brilho').map((o) => o.label)).toEqual(['Tirar o Este boneco']);
    // Fora de entidade: nada.
    expect(aroundGridOptions(doc, 'aura', undefined)).toEqual([]);
    // Tirar pela outra imagem desfaz de verdade.
    expect(outra[0]!.run()).toBe(true);
    expect(aroundOf(doc.file, ENTIDADE)).toBeNull();
    expect(letras(doc)).toBe(texto);
  });

  it('a aba Ordem: duas linhas presas, a da frente e a de trás, com o número e a dica', () => {
    const doc = abrir();
    const filhos = new Map([['poder.bone', carregarR11(JSON.parse(JSON.stringify(poder())))]]);
    expect(aroundLines(doc.file, filhos)).toEqual({ frente: [], atras: [] });
    doc.run(new SetEntityAround('aura', 'poder', 'default', 'meio'));
    const linhas = aroundLines(doc.file, filhos);
    expect(linhas.frente.map((l) => l.text)).toEqual(['poder · na frente (2)']);
    expect(linhas.atras.map((l) => l.text)).toEqual(['poder · atrás (2)']);
    expect(linhas.frente[0]!.hint).toContain('não se arrastam');
    expect(linhas.frente[0]!.hint).toContain('"meio"');
    // Entidade fechada: as linhas existem, sem número (não se inventa a conta).
    expect(aroundLines(doc.file, new Map()).frente.map((l) => l.text)).toEqual(['poder · na frente']);
    // A marca só num trecho: vale o placeholder que o slot mostra AGORA.
    const trecho = abrir();
    trecho.run(new SetEntityAround('aura', 'poder', 'default', 'meio', { animation: 'andar', time: 0.5 }));
    expect(aroundLines(trecho.file, filhos, () => 'poder').frente).toEqual([]);
    expect(aroundLines(trecho.file, filhos, () => 'poder_este_boneco').frente.length).toBe(1);
  });

  it('duas entidades em volta: na aba Ordem a do slot mais alto fica mais em cima E mais embaixo (a cebola)', () => {
    const file = heroi();
    const mapa = file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>;
    (file.slots as unknown as Array<Record<string, unknown>>).unshift({ name: 'escudo', bone: 'root', attachment: 'escudo' });
    mapa['escudo'] = { escudo: { type: 'skeleton', uri: 'escudo.bone', around: 'centro' } };
    mapa['aura']!['poder']!['around'] = 'meio';
    const escudo = poder(['fundo', 'centro', 'frente']);
    const filhos = new Map([
      ['poder.bone', carregarR11(JSON.parse(JSON.stringify(poder())))],
      ['escudo.bone', carregarR11(JSON.parse(JSON.stringify(escudo)))],
    ]);
    const linhas = aroundLines(file, filhos);
    expect(linhas.frente.map((l) => l.text)).toEqual(['poder · na frente (2)', 'escudo · na frente (1)']);
    expect(linhas.atras.map((l) => l.text)).toEqual(['escudo · atrás (1)', 'poder · atrás (2)']);
  });

  it('rodada 13 (fecho da v27.6): a linha de ZERO peças não aparece — "espada · na frente (0)" saía', () => {
    const file = heroi();
    const mapa = file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>;
    // O meio é a ÚLTIMA peça do escudo: nada fica na frente dele.
    (file.slots as unknown as Array<Record<string, unknown>>).unshift({ name: 'escudo', bone: 'root', attachment: 'escudo' });
    mapa['escudo'] = { escudo: { type: 'skeleton', uri: 'escudo.bone', around: 'centro' } };
    const filhos = new Map([['escudo.bone', carregarR11(JSON.parse(JSON.stringify(poder(['fundo', 'centro']))))]]);
    const linhas = aroundLines(file, filhos);
    expect(linhas.frente.map((l) => l.text)).toEqual([]);
    expect(linhas.atras.map((l) => l.text)).toEqual(['escudo · atrás (1)']);
  });
});

/**
 * Rodada 7 (05/10/2026) — **o programa pede a pasta ao começar o projeto**,
 * como o Spriter (`File / New Project`: escolher a pasta raiz; o `.scml` mora
 * nela). A decisão é pura e mora em `io/pedir-pasta.ts`; o seletor do sistema
 * só a mão abre.
 */
describe('rodada 7 — pedir a pasta ao começar', () => {
  const semNada = { temPasta: false, temArquivoAberto: false, seletorDePasta: true, recusou: false };

  it('Salvar e soltar imagem sem pasta levam ao pedido; com pasta, ou com o arquivo aberto, seguem', () => {
    expect(pedirPastaAntes('salvar', semNada)).toBe(true);
    expect(pedirPastaAntes('soltar', semNada)).toBe(true);
    expect(pedirPastaAntes('salvar', { ...semNada, temPasta: true })).toBe(false);
    expect(pedirPastaAntes('soltar', { ...semNada, temPasta: true })).toBe(false);
    // Aberto por "Abrir projeto…": o Salvar já sabe onde gravar.
    expect(pedirPastaAntes('salvar', { ...semNada, temArquivoAberto: true })).toBe(false);
    // Recusou uma vez: soltar não pergunta de novo; salvar pergunta sempre.
    expect(pedirPastaAntes('soltar', { ...semNada, recusou: true })).toBe(false);
    expect(pedirPastaAntes('salvar', { ...semNada, recusou: true })).toBe(true);
    // Navegador sem pasta com escrita: não há o que pedir.
    expect(pedirPastaAntes('salvar', { ...semNada, seletorDePasta: false })).toBe(false);
  });

  it('o pedido tem a pasta primeiro e o caminho de antes como segunda escolha, com nome', () => {
    for (const gesto of ['salvar', 'soltar'] as const) {
      const escolhas = escolhasDoPedido(gesto);
      expect(escolhas.map((e) => e.id)).toEqual(['pasta', 'sem']);
      for (const e of escolhas) {
        expect(e.label.length).toBeGreaterThan(0);
        expect(e.hint.length).toBeGreaterThan(0);
      }
    }
  });

  it('cancelar DIZ que o projeto está sem pasta, ou em qual pasta continua', () => {
    expect(avisoSemPasta('novo', null)).toMatch(/sem pasta/);
    expect(avisoSemPasta('novo', 'heroi')).toMatch(/pasta heroi/);
    expect(avisoSemPasta('salvar', null)).toMatch(/sem pasta/);
    expect(avisoSemPasta('soltar', null)).toMatch(/sem pasta/);
  });

  it('Novo projeto numa pasta sem projeto nasce com o nome da pasta', () => {
    expect(novoNaPasta('heroi', ['ler-me.txt'], null)).toEqual({ kind: 'vazio', nome: 'heroi' });
  });

  it('Novo projeto numa pasta que já tem projeto oferece abrir, ou um novo AO LADO, sem pisar no outro', () => {
    expect(novoNaPasta('heroi', ['heroi.bone', 'heroi.atlas.json'], null))
      .toEqual({ kind: 'tem-projeto', existente: 'heroi.bone', nome: 'heroi2' });
    // O `.bone` lembrado manda, mesmo com outro nome.
    expect(novoNaPasta('heroi', ['boneco.bone', 'espada.bone'], 'boneco.bone'))
      .toEqual({ kind: 'tem-projeto', existente: 'boneco.bone', nome: 'heroi' });
    expect(novoNaPasta('heroi', ['heroi.bone', 'heroi2.bone'], 'heroi.bone'))
      .toEqual({ kind: 'tem-projeto', existente: 'heroi.bone', nome: 'heroi3' });
  });

  it('Salvar grava direto na pasta só quando não pisa em arquivo que não foi aberto', () => {
    const base = { temArquivoAberto: false, salvarComo: false, pastaGravavel: true, nome: 'heroi.bone', nomesNaRaiz: ['mao.png'] };
    expect(salvarDireto(base)).toBe(true);
    expect(salvarDireto({ ...base, nomesNaRaiz: ['heroi.bone'] })).toBe(false);
    expect(salvarDireto({ ...base, salvarComo: true })).toBe(false);
    expect(salvarDireto({ ...base, temArquivoAberto: true })).toBe(false);
    expect(salvarDireto({ ...base, pastaGravavel: false })).toBe(false);
  });

  it('o arquivo salvo na pasta leva o nome do arquivo, do boneco, ou o da pasta', () => {
    expect(nomeParaSalvar('heroi.bone', 'qualquer', 'pasta')).toBe('heroi.bone');
    expect(nomeParaSalvar(null, 'mecha', 'pasta')).toBe('mecha.bone');
    expect(nomeParaSalvar(null, 'sem nome', 'heroi')).toBe('heroi.bone');
    expect(nomeParaSalvar(null, undefined, '')).toBe('sem-nome.bone');
  });

  it('o menu diz que Novo projeto pede a pasta (as reticências, e a dica)', () => {
    const item = flatEntries(fileMenu()).find((e) => e.action === 'novo') as Extract<MenuItem, { label: string }>;
    expect(item.label).toBe('Novo projeto…');
    expect(item.hint).toMatch(/pasta/);
  });
});

// ---------------------------------------------------------------------------
// Rodada 39, lote 1: a aba Entidades como árvore de cartões
// ---------------------------------------------------------------------------

import { readFileSync as lerR39 } from 'node:fs';
import { join as juntarR39, resolve as resolverR39 } from 'node:path';
import { loadSkeletonData as carregarR39 } from '../../runtime/src/index.js';
import type { BoneFile as BoneFileR39 } from '../../runtime/src/index.js';
import { Doc as DocR39 } from '../src/doc/document.js';
import { Projeto as ProjetoR39 } from '../src/doc/projeto.js';
import { rememberEntityFile as lembrarR39 } from '../src/doc/entity-files.js';
import { openEntityAnimation as abrirPorDentroR39 } from '../src/panels/animations-actions.js';
import {
  MAX_NIVEIS, OTHER_LINES_HINT, cardAnima, cardHint, cardTag, cardTree, emptyLineText, lineHint, otherLinesText,
} from '../src/panels/entities-cards-model.js';

describe('a aba Entidades como árvore de cartões (rodada 39, lote 1)', () => {
  /*
   * Plano `22`: caixa dentro de caixa, sem fio. O projeto aberto é um cartão
   * (AQUI); uma entidade gravada num slot é um cartão dentro da linha do slot
   * (PROJETO). Este lote só mostra o que já está no arquivo.
   */
  const regiao = (n: string): Record<string, unknown> => ({ [n]: { [n]: { type: 'region', path: n, width: 10, height: 10 } } });

  /** Um `.bone` de slots com imagem, e anexos `skeleton` onde se pedir. */
  function arquivo(nome: string, slots: string[], pecas: Record<string, Record<string, unknown>> = {}): BoneFileR39 {
    const attachments: Record<string, unknown> = {};
    for (const s of slots) Object.assign(attachments, pecas[s] === undefined ? regiao(s) : { [s]: { [s]: pecas[s] } });
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      skeleton: { name: nome },
      assets: { skeletonsBase: '' },
      bones: [{ name: 'root' }],
      slots: slots.map((s) => ({ name: s, bone: 'root', attachment: s })),
      skins: [{ name: 'default', attachments }],
      animations: [],
    } as unknown as BoneFileR39;
  }
  type Dados = ReturnType<typeof carregarR39>;
  const carregar = (f: BoneFileR39, filhos: Map<string, Dados> = new Map()): Dados =>
    carregarR39(JSON.parse(JSON.stringify(f)), { skeletons: filhos });

  /** O herói com o poder na aura; o poder com a faísca no meio. */
  function heroiComPoder(): DocR39 {
    const faisca = carregar(arquivo('faisca', ['luz']));
    const poder = carregar(arquivo('poder', ['anel', 'meio'], {
      meio: { type: 'skeleton', uri: 'faisca.bone', animation: 'brilhar' },
    }), new Map([['faisca.bone', faisca]]));
    const heroi = arquivo('heroi', ['perna', 'tronco', 'aura', 'cabeca'], {
      aura: { type: 'skeleton', uri: 'poder.bone' },
    });
    return new DocR39(heroi, { path: 'heroi.bone', skeletons: new Map([['poder.bone', poder], ['faisca.bone', faisca]]) });
  }

  it('o projeto aberto é o cartão de fora, com a palavra AQUI', () => {
    const { topo } = cardTree(heroiComPoder());
    expect(topo.papel).toBe('aqui');
    expect(topo.nome).toBe('heroi');
    expect(cardTag(topo)).toBe('aqui');
    expect(cardAnima(topo)).toBeNull();
    expect(cardHint(topo, null, null)).toContain('É ele que você anima');
  });

  it('caixa dentro de caixa: a entidade mora na linha do slot, e o que está dentro dela também', () => {
    const { topo } = cardTree(heroiComPoder());
    expect(topo.linhas.map((l) => l.slot)).toEqual(['aura']);
    const poder = topo.linhas[0]!.cartoes[0]!;
    expect(poder).toMatchObject({ nome: 'poder', papel: 'projeto', carregada: true, anima: null });
    expect(cardTag(poder)).toBe('projeto');
    expect(poder.linhas.map((l) => l.slot)).toEqual(['meio']);
    const faisca = poder.linhas[0]!.cartoes[0]!;
    expect(faisca).toMatchObject({ nome: 'faisca', papel: 'projeto', anima: 'brilhar' });
    expect(cardAnima(faisca)).toBe('anima: brilhar');
    expect(cardHint(faisca, 'poder', 'meio')).toContain('na tomada meio de poder');
  });

  it('as outras imagens viram uma linha só, que diz como uma delas recebe', () => {
    const { topo } = cardTree(heroiComPoder());
    expect(topo.outras).toBe(3);
    expect(otherLinesText(3)).toBe('+ 3 outras imagens');
    expect(otherLinesText(1)).toBe('+ 1 outra imagem');
    expect(OTHER_LINES_HINT).toContain('Qualquer imagem pode receber');
    expect(OTHER_LINES_HINT).toContain('botão direito');
  });

  it('livre e "a de quem recebe" se dizem por extenso, nunca em branco', () => {
    const heroi = arquivo('heroi', ['mao', 'costas'], {
      mao: { type: 'skeleton', uri: 'espada.bone', inheritAnimation: true },
      costas: { type: 'skeleton', uri: 'capa.bone' },
    });
    const { topo } = cardTree(new DocR39(heroi, { path: 'heroi.bone' }));
    const [mao, costas] = topo.linhas.map((l) => l.cartoes[0]!);
    expect(cardAnima(mao!)).toBe('anima: mexe junto com quem segura');
    expect(cardAnima(costas!)).toBe('anima: livre');
    expect(cardHint(costas!, 'heroi', 'costas')).toContain('o jogo escolhe');
  });

  it('a entidade que o editor não carregou fica, com o nome, e diz que não dá para ver dentro (regra 21)', () => {
    const heroi = arquivo('heroi', ['mao'], { mao: { type: 'skeleton', uri: 'armas/canhao.bone' } });
    const card = cardTree(new DocR39(heroi, { path: 'heroi.bone' })).topo.linhas[0]!.cartoes[0]!;
    expect(card).toMatchObject({ nome: 'canhao', carregada: false, linhas: [] });
    expect(cardHint(card, 'heroi', 'mao')).toContain('não está carregado');
  });

  it('"Este boneco": a peça em volta diz o slot do meio', () => {
    const heroi = arquivo('heroi', ['aura'], { aura: { type: 'skeleton', uri: 'poder.bone', around: 'meio' } });
    const card = cardTree(new DocR39(heroi, { path: 'heroi.bone' })).topo.linhas[0]!.cartoes[0]!;
    expect(card.emVolta).toBe('meio');
    expect(cardHint(card, 'heroi', 'aura')).toContain('o meio é a imagem meio');
  });

  it('a volta sem fim não trava a árvore: o cartão que já está acima para ali', () => {
    // O poder leva o herói, que é o projeto aberto: o cartão do herói, dentro
    // do poder, para ali em vez de descer de novo.
    const poder = carregar(arquivo('poder', ['meio'], { meio: { type: 'skeleton', uri: 'heroi.bone' } }));
    const heroi = arquivo('heroi', ['aura'], { aura: { type: 'skeleton', uri: 'poder.bone' } });
    const { topo } = cardTree(new DocR39(heroi, { path: 'heroi.bone', skeletons: new Map([['poder.bone', poder]]) }));
    const dentro = topo.linhas[0]!.cartoes[0]!.linhas[0]!.cartoes[0]!;
    expect(dentro).toMatchObject({ uri: 'heroi.bone', corte: 'volta', linhas: [] });
    expect(cardHint(dentro, 'poder', 'meio')).toContain('volta sem fim');
    expect(MAX_NIVEIS).toBe(8);
  });

  it('o slot marcado é transparente: a linha mostra o que está dentro da base dele', () => {
    const marca = (nome: string): Record<string, unknown> => ({ RECORTE_editor_state: { slotMarcado: { nome, slotDeAntes: nome } } });
    const motosserra = carregar(arquivo('motosserra', ['lamina']));
    const maoD = carregar(arquivo('mao_d', ['mao_d', 'arma'], { arma: { type: 'skeleton', uri: 'motosserra.bone' } }),
      new Map([['motosserra.bone', motosserra]]));
    const maoE = carregar(arquivo('mao_e', ['mao_e']));
    const heroi = arquivo('heroi', ['mao_d', 'mao_e', 'pe'], {
      mao_d: { type: 'skeleton', uri: 'mao_d.bone', extensions: marca('mao_d') },
      mao_e: { type: 'skeleton', uri: 'mao_e.bone', extensions: marca('mao_e') },
      pe: { type: 'skeleton', uri: 'pe.bone', extensions: marca('pe') },
    });
    const doc = new DocR39(heroi, { path: 'heroi.bone', skeletons: new Map([['mao_d.bone', maoD], ['mao_e.bone', maoE]]) });
    const [d, e, pe] = cardTree(doc).topo.linhas;
    expect(d).toMatchObject({ slot: 'mao_d', marcado: true });
    expect(d!.cartoes.map((c) => c.nome)).toEqual(['motosserra']);
    expect(e).toMatchObject({ slot: 'mao_e', marcado: true, cartoes: [], semArquivo: false });
    // Lote 2: a linha do AQUI aceita o soltar, e diz isso.
    expect(emptyLineText(e!)).toBe('só a imagem · solte aqui');
    expect(lineHint(e!)).toContain('imagem-base');
    // A base do slot que o editor não carregou: a linha diz, não inventa.
    expect(pe).toMatchObject({ slot: 'pe', marcado: true, cartoes: [], semArquivo: true });
    expect(emptyLineText(pe!)).toBe('falta o arquivo');
  });

  it('animando a espada por dentro, o herói fica por fora, e a espada é o AQUI dentro da mão', () => {
    const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
    const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');
    lembrarR39('espada.bone', texto('espada.bone'));
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))]]),
    });
    new ProjetoR39(doc);
    const antes = cardTree(doc).topo;
    expect(antes).toMatchObject({ nome: 'heroi', papel: 'aqui' });
    expect(antes.linhas.find((l) => l.slot === 'weapon')!.cartoes[0]).toMatchObject({ nome: 'espada', anima: 'idle' });
    expect(abrirPorDentroR39(doc, 'espada.bone', 'attack')).toBe(true);
    const { topo } = cardTree(doc);
    expect(topo).toMatchObject({ uri: 'heroi.bone', papel: 'em-volta' });
    expect(cardTag(topo)).toBe('em volta');
    const mao = topo.linhas.find((l) => l.slot === 'weapon')!;
    expect(mao.cartoes.map((c) => [c.uri, c.papel])).toEqual([['espada.bone', 'aqui']]);
  });

  it('o painel desenha a montagem em cima e a prateleira embaixo, num rolo só que a medição deixa rolar', () => {
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    expect(fonte).toContain('cardTree(doc, { todas: this.todas }).topo');
    expect(fonte).toContain("el('section', 'entidades-montagem')");
    expect(fonte).toContain("el('section', 'entidades-prateleira')");
    expect(fonte.indexOf("'entidades-montagem'")).toBeLessThan(fonte.indexOf("'entidades-prateleira'"));
    expect(fonte).toContain("list.dataset.rolagem = 'lista'");
    // O arrasto para a cena de hoje continua: a prateleira é a lista de antes.
    expect(fonte).toContain('setData(ENTITY_DRAG_TYPE, row.uri)');
    const folha = lerR39(resolverR39(__dirname, '../src/panels/palette.css'), 'utf8');
    // Três sinais, nunca só a cor: a moldura do AQUI é dupla, a do projeto é cheia.
    expect(folha).toMatch(/\.entidades-cartao-aqui\s*\{[^}]*double/);
    expect(folha).toMatch(/\.entidades-cartao-projeto\s*\{[^}]*solid/);
    expect(folha).toMatch(/\.entidades-linha-dentro\s*\{[^}]*padding-left:\s*12px/);
  });
});

// ---------------------------------------------------------------------------
// Rodada 39, lote 2: ligar para baixo, em teste
// ---------------------------------------------------------------------------

import {
  SetMontagem as SetMontagemR39, emptyMontagem as montagemVaziaR39, montagemDe as montagemDeR39,
  readMontagem as lerMontagemR39, writeMontagem as gravarMontagemR39,
} from '../src/doc/montagem.js';
import { emptySelection as emptySelectionR39 } from '../src/contract.js';
import { emptyManifest as manifestoVazioR39, writeProjectLists as gravarListasR39 } from '../src/doc/projeto.js';
import { montagemMapped as montagemMapeadaR39, projectFilesToSave as arquivosParaSalvarR39 } from '../src/io/project-open.js';
import {
  dataWithMontagem, dropOnSlot, fileWithMontagem, moveTest, previewMontagemText, testPieces, unplug, whyCannotTest,
  whyNoTestHere, whyNoUnplugHere,
} from '../src/panels/entities-cards-model.js';

describe('ligar para baixo, em teste (rodada 39, lote 2)', () => {
  /*
   * Plano `22`, §3 e §4: arrastar da prateleira para a linha de um slot liga
   * a peça EM TESTE. Ela mora no `manifest.json` (extras.RECORTE_projeto), e o
   * `.bone` sai igual, letra por letra. Um passo de desfazer por gesto.
   */
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');

  /** O herói do exemplo como projeto, com a espada carregada. */
  function projeto(): { doc: DocR39; projeto: ProjetoR39 } {
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))]]),
    });
    return { doc, projeto: new ProjetoR39(doc) };
  }
  const letras = (doc: DocR39): string => JSON.stringify(doc.file);
  /** O texto salvo, sem a hora que o `serialize` carimba. */
  const salvo = (doc: DocR39): string => doc.serialize().replace(/"modified": "[^"]*"/, '"modified": ""');

  it('ligar grava no manifesto, nunca no .bone: o arquivo sai igual letra por letra', () => {
    const { doc, projeto: p } = projeto();
    // O `serialize` grava o estado do editor no arquivo: ele vem primeiro.
    const salvoAntes = salvo(doc);
    const antes = letras(doc);
    const gesto = dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!;
    // Rodada 39b, lote 6: a espada já está no weapon — a frase diz que agora são duas, separadas.
    expect(gesto.frase).toBe('Espada na tomada hair: teste. Agora há 2 cópias de espada, separadas. A animação não muda.');
    doc.run(gesto.command);
    expect(montagemDeR39(doc).ligacoes).toEqual([{ host: 'heroi.bone', slot: 'hair', uri: 'espada.bone' }]);
    expect(lerMontagemR39(p.manifesto).ligacoes).toHaveLength(1);
    expect(letras(doc)).toBe(antes);
    expect(salvo(doc)).toBe(salvoAntes);
    // Marca o projeto como não salvo: é o manifesto que tem de ir para o disco.
    expect(doc.dirty).toBe(true);
  });

  it('Ctrl+Z desfaz o gesto inteiro, um passo; refazer devolve', () => {
    const { doc } = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    expect(doc.undoLabel).toBe('Ligar em teste');
    doc.undo();
    expect(montagemDeR39(doc).ligacoes).toEqual([]);
    doc.redo();
    expect(montagemDeR39(doc).ligacoes).toEqual([{ host: 'heroi.bone', slot: 'hair', uri: 'espada.bone' }]);
  });

  it('trocar, mudar de slot e desligar: cada um diz o que fez, e um slot tem um teste só', () => {
    const { doc } = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    // A mesma peça no mesmo slot: nada muda, nenhum passo de desfazer.
    expect(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')).toBeNull();
    const troca = dropOnSlot(doc, 'heroi.bone', 'hair', 'capa.bone')!;
    expect(troca.command.label).toBe('Trocar a peça de teste');
    expect(troca.frase).toContain('Capa no lugar de espada, na tomada hair: teste');
    doc.run(troca.command);
    expect(montagemDeR39(doc).ligacoes.map((l) => l.uri)).toEqual(['capa.bone']);
    const muda = moveTest(doc, 'heroi.bone', 'hair', 'head')!;
    expect(muda.frase).toBe('Capa passou da tomada hair para a head: teste.');
    doc.run(muda.command);
    expect(montagemDeR39(doc).ligacoes).toEqual([{ host: 'heroi.bone', slot: 'head', uri: 'capa.bone' }]);
    const sai = unplug(doc, 'heroi.bone', 'head')!;
    expect(sai.frase).toBe('Capa saiu da tomada head (era teste).');
    doc.run(sai.command);
    expect(montagemDeR39(doc).ligacoes).toEqual([]);
    expect(unplug(doc, 'heroi.bone', 'head')).toBeNull();
  });

  it('a recusa é dita: sem projeto, slot sem imagem, e a volta sem fim', () => {
    const solto = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, { path: 'heroi.bone' });
    expect(whyCannotTest(solto, 'heroi.bone', 'hair', 'espada.bone')).toContain('projeto aberto');
    const { doc } = projeto();
    expect(whyCannotTest(doc, 'heroi.bone', 'nao-existe', 'espada.bone')).toContain('não tem a tomada');
    expect(whyCannotTest(doc, 'heroi.bone', 'hair', 'heroi.bone')).toContain('volta sem fim');
    // A espada que leva o herói: pôr a espada no herói daria uma volta.
    const leva = carregarR39(JSON.parse(JSON.stringify({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' }, skeleton: { name: 'arma' },
      bones: [{ name: 'root' }], slots: [{ name: 'dono', bone: 'root', attachment: 'dono' }],
      skins: [{ name: 'default', attachments: { dono: { dono: { type: 'skeleton', uri: 'heroi.bone' } } } }],
      animations: [],
    })));
    const comArma = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, {
      path: 'heroi.bone', skeletons: new Map([['arma.bone', leva]]),
    });
    new ProjetoR39(comArma);
    expect(whyCannotTest(comArma, 'heroi.bone', 'hair', 'arma.bone')).toBe(
      'arma já leva heroi. Pôr arma em heroi faria uma volta sem fim',
    );
    expect(whyCannotTest(doc, 'heroi.bone', 'hair', 'espada.bone')).toBeNull();
  });

  it('na aba: o cartão de teste mora na linha do slot, tracejado, com a palavra TESTE', () => {
    const { doc } = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    const { topo } = cardTree(doc);
    const hair = topo.linhas.find((l) => l.slot === 'hair')!;
    expect(hair.host).toBe('heroi.bone');
    const card = hair.cartoes[0]!;
    expect(card).toMatchObject({ papel: 'teste', nome: 'espada', ligacao: { host: 'heroi.bone', slot: 'hair', uri: 'espada.bone' } });
    expect(cardTag(card)).toBe('teste');
    expect(cardAnima(card)).toBe('anima: parada');
    expect(cardHint(card, 'heroi', 'hair')).toContain('não entra no arquivo');
    // A peça de projeto dentro dela continua de projeto: só a ligação é teste.
    const weapon = topo.linhas.find((l) => l.slot === 'weapon')!;
    expect(weapon.cartoes[0]!.papel).toBe('projeto');
  });

  it('"+ N outras imagens" abre uma linha por imagem, e só as linhas do AQUI aceitam o soltar', () => {
    const { doc } = projeto();
    const fechada = cardTree(doc).topo;
    const aberta = cardTree(doc, { todas: true }).topo;
    expect(aberta.linhas).toHaveLength(fechada.linhas.length + fechada.outras);
    expect(aberta.outras).toBe(0);
    expect(aberta.linhas.every((l) => l.host === 'heroi.bone')).toBe(true);
    // A linha dentro da espada (um nível abaixo) não recebe: o teste é do arquivo aberto.
    const espada = aberta.linhas.find((l) => l.slot === 'weapon')!.cartoes[0]!;
    expect(espada.linhas.every((l) => l.host === null)).toBe(true);
    expect(emptyLineText(aberta.linhas.find((l) => l.slot === 'hair')!)).toBe('só a imagem · solte aqui');
  });

  it('a Prévia desenha a cópia com a peça no lugar da imagem; o documento não muda', () => {
    const { doc } = projeto();
    expect(fileWithMontagem(doc)).toBeNull();
    expect(dataWithMontagem(doc)).toBeNull();
    const antes = letras(doc);
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    const copia = fileWithMontagem(doc)!;
    const hair = (copia.skins![0]!.attachments as Record<string, Record<string, { type?: string; uri?: string }>>)['hair']!;
    expect(Object.values(hair)[0]).toMatchObject({ type: 'skeleton', uri: 'espada.bone' });
    expect(letras(doc)).toBe(antes);
    const data = dataWithMontagem(doc)!;
    const slot = data.slots.find((s) => s.name === 'hair')!;
    const att = data.defaultSkin.getAttachment(slot.index, slot.attachmentName!) as { type?: string; child?: unknown };
    expect(att.type).toBe('skeleton');
    expect(att.child).not.toBeNull();
    expect(testPieces(doc)).toBe(1);
    expect(previewMontagemText(1)).toContain('não entra na animação');
    expect(previewMontagemText(3)).toContain('3 peças');
  });

  it('salvar leva a montagem no manifest.json, e as listas não a apagam', () => {
    const { doc, projeto: p } = projeto();
    // Sem teste e sem outra base, o projeto de um corpo só salva como sempre.
    expect(arquivosParaSalvarR39(p, 'heroi.bone')).toEqual([]);
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    const arquivos = arquivosParaSalvarR39(p, 'heroi.bone');
    expect(arquivos.map((a) => a.name)).toEqual(['manifest.json']);
    const manifesto = JSON.parse(arquivos[0]!.text) as Parameters<typeof lerMontagemR39>[0];
    expect(lerMontagemR39(manifesto).ligacoes).toEqual([{ host: 'heroi.bone', slot: 'hair', uri: 'espada.bone' }]);
    // As listas são escritas por cima, e a montagem fica.
    const regravado = gravarListasR39(manifesto, { corpos: ['heroi.bone'], entidades: [], emFoco: 'heroi.bone' });
    expect(lerMontagemR39(regravado).ligacoes).toHaveLength(1);
  });

  it('o manifesto fala em caminhos; o editor, em uris — e a montagem vazia não deixa rastro', () => {
    const m = { ligacoes: [{ host: 'heroi.bone', slot: 'mao', uri: 'armas/canhao.bone' }], naCena: false, acima: [] };
    expect(montagemMapeadaR39(m, (u) => `corpos/${u}`).ligacoes[0]).toEqual({ host: 'corpos/heroi.bone', slot: 'mao', uri: 'corpos/armas/canhao.bone' });
    const manifesto = manifestoVazioR39('heroi.bone');
    const antes = JSON.stringify(manifesto);
    gravarMontagemR39(manifesto, m);
    expect(lerMontagemR39(manifesto).ligacoes).toHaveLength(1);
    gravarMontagemR39(manifesto, montagemVaziaR39());
    expect(JSON.stringify(manifesto)).toBe(antes);
    // O que não é ligação inteira fica de fora; o segundo teste no mesmo slot também.
    const sujo = { ...manifestoVazioR39('h.bone'), extras: { RECORTE_projeto: { montagem: { ligacoes: [
      { host: 'h.bone', slot: 'a', uri: 'x.bone' }, { host: 'h.bone', slot: 'a', uri: 'y.bone' }, { slot: 'b' }, 7,
    ] } } } };
    expect(lerMontagemR39(sujo).ligacoes).toEqual([{ host: 'h.bone', slot: 'a', uri: 'x.bone' }]);
  });

  it('o comando sozinho: apply e revert exatos, mesmo sem nada antes', () => {
    const { doc, projeto: p } = projeto();
    const antes = JSON.stringify(p.manifesto);
    const cmd = new SetMontagemR39('Ligar em teste', { ligacoes: [{ host: 'heroi.bone', slot: 'hair', uri: 'espada.bone' }], naCena: false, acima: [] });
    cmd.apply(doc);
    expect(JSON.stringify(p.manifesto)).not.toBe(antes);
    cmd.revert(doc);
    expect(JSON.stringify(p.manifesto)).toBe(antes);
  });

  it('as portas do menu: cinzas sem imagem escolhida, e dizem por quê', () => {
    const { doc } = projeto();
    expect(whyNoTestHere(doc)).toContain('Escolha uma imagem');
    expect(whyNoUnplugHere(doc)).toContain('Escolha na cena');
    doc.select({ ...emptySelectionR39(), slots: ['hair'] });
    expect(whyNoTestHere(doc)).toBeNull();
    expect(whyNoUnplugHere(doc)).toBe('A tomada hair não tem peça de teste');
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    expect(whyNoUnplugHere(doc)).toBeNull();
  });

  it('o painel recebe na linha e na prateleira; a Prévia usa a cópia montada', () => {
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    expect(fonte).toContain("export const TEST_DRAG_TYPE = 'text/x-recorte-teste'");
    expect(fonte).toContain('this.acceptDrop(doc, node, line.host, line.slot, pai)');
    expect(fonte).toContain('this.acceptUnplug(doc, prateleira)');
    expect(fonte).toContain('doc.run(gesto.command)');
    const previa = lerR39(resolverR39(__dirname, '../src/panels/preview.ts'), 'utf8');
    expect(previa).toContain('dataWithMontagem(doc) ?? doc.data');
    const folha = lerR39(resolverR39(__dirname, '../src/panels/palette.css'), 'utf8');
    expect(folha).toMatch(/\.entidades-cartao-teste\s*\{[^}]*dashed/);
    expect(folha).toMatch(/\.entidades-linha\.entidades-recusa\s*\{/);
  });
});

import { openProjectFiles as abrirPastaR39, openProjectInto as montarProjetoR39, readManifestInFolder as lerManifestoR39 } from '../src/io/project-open.js';
import type { FolderDirectoryHandle as PastaR39, FolderFileHandle as ArquivoR39 } from '../src/io/project-folder.js';
import { createEmptyFile as arquivoVazioR39 } from '../src/doc/new-file.js';

describe('a montagem de teste volta ao reabrir a pasta (rodada 39, lote 2)', () => {
  it('salvar, reabrir: a ligação de teste está lá, como ficou', async () => {
    const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
    const heroiTexto = lerR39(juntarR39(EXEMPLOS, 'heroi.bone'), 'utf8');
    const doc = new DocR39(JSON.parse(heroiTexto) as BoneFileR39, { path: 'heroi.bone' });
    const p = new ProjetoR39(doc);
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    const salvos = arquivosParaSalvarR39(p, 'heroi.bone');
    const arquivo = (name: string, conteudo: string): ArquivoR39 => ({ kind: 'file', name, getFile: async () => new File([conteudo], name) });
    const pasta: PastaR39 = {
      kind: 'directory', name: 'heroi',
      values: async function* values() {
        yield arquivo('heroi.bone', heroiTexto);
        for (const s of salvos) yield arquivo(s.name, s.text);
      },
    };
    const lido = (await abrirPastaR39(pasta, (await lerManifestoR39(pasta))!))!;
    const outro = new DocR39(arquivoVazioR39());
    montarProjetoR39(new ProjetoR39(outro), lido);
    expect(montagemDeR39(outro).ligacoes).toEqual([{ host: 'heroi.bone', slot: 'hair', uri: 'espada.bone' }]);
    expect(cardTree(outro).topo.linhas.find((l) => l.slot === 'hair')!.cartoes[0]!.papel).toBe('teste');
  });
});

import { shelfBaseHint as dicaDeBaseR39, shelfRows as prateleiraR39 } from '../src/panels/palette-entities-model.js';

describe('as duas notas da conferência do lote 1 (rodada 39, lote 2)', () => {
  it('a prateleira mostra as outras bases: promover não a esvazia', () => {
    const heroiTexto = lerR39(juntarR39(resolverR39(__dirname, '../../formato/exemplos'), 'heroi.bone'), 'utf8');
    const doc = new DocR39(JSON.parse(heroiTexto) as BoneFileR39, { path: 'heroi.bone' });
    const p = new ProjetoR39(doc);
    p.entidades.add('espada.bone');
    // A espada promovida a base sai das entidades — e continua na prateleira.
    p.adicionarCorpo('capa.bone', new DocR39(arquivoVazioR39(), { path: 'capa.bone' }));
    expect(prateleiraR39(doc).map((r) => [r.uri, r.base === true])).toEqual([['espada.bone', false], ['capa.bone', true]]);
    // O projeto aberto não entra: ele é o cartão AQUI.
    expect(prateleiraR39(doc).some((r) => r.uri === p.emFocoUri)).toBe(false);
    expect(dicaDeBaseR39({ uri: 'lobisomem.bone', name: 'lobisomem', aberta: false, base: true })).toContain('base do projeto');
  });

  it('o tracejado é só do teste: a entidade aberta ganha borda cheia', () => {
    const folha = lerR39(resolverR39(__dirname, '../src/panels/palette.css'), 'utf8');
    const aberta = /\.entidades-aberta\s*\{([^}]*)\}/.exec(folha)![1]!;
    expect(aberta).not.toContain('dashed');
    expect(aberta).toContain('solid');
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    expect(fonte).toContain('const rows = shelfRows(doc);');
  });
});

import { collectDrawList as listaDeDesenhoR39 } from '../../runtime/src/index.js';
import { drawWithTestPieces } from '../src/viewport/montagem-view.js';
import { pickAll as pegarR39 } from '../src/viewport/picking.js';
import { montagemLineText, naCena as naCenaR39, naCenaHint, testSlotsInScene, toggleNaCena } from '../src/panels/entities-cards-model.js';

describe('Na cena: a montagem de teste enquanto ele anima (rodada 39, lote 3)', () => {
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');
  function comTeste(): DocR39 {
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))]]),
    });
    new ProjetoR39(doc);
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    return doc;
  }
  const nomes = (doc: DocR39): string[] => listaDeDesenhoR39(doc.skeleton!).map((p) => p.name);

  it('o botão liga e desliga, um passo de desfazer cada, e diz o que fez', () => {
    const doc = comTeste();
    expect(naCenaR39(doc)).toBe(false);
    const liga = toggleNaCena(doc)!;
    expect(liga.frase).toBe('A montagem de teste está na cena. Ela não entra na animação.');
    doc.run(liga.command);
    expect(naCenaR39(doc)).toBe(true);
    expect(testSlotsInScene(doc)).toEqual(new Set(['hair']));
    doc.undo();
    expect(naCenaR39(doc)).toBe(false);
    expect(testSlotsInScene(doc)).toEqual(new Set());
    expect(naCenaHint(true, 1)).toContain('o clique passa por elas');
    expect(naCenaHint(false, 0)).toContain('Ainda não há peça de teste');
  });

  it('na cena, a espada é desenhada no lugar do cabelo, na ordem dele; e o esqueleto volta como estava', () => {
    const doc = comTeste();
    const antes = nomes(doc);
    const cabelo = doc.skeleton!.findSlot('hair')!;
    const anexo = cabelo.attachment;
    // Desligado: o desenho é o de sempre.
    let visto: string[] = [];
    expect(drawWithTestPieces(doc, doc.skeleton!, () => { visto = nomes(doc); })).toBe(0);
    expect(visto).toEqual(antes);
    doc.run(toggleNaCena(doc)!.command);
    expect(drawWithTestPieces(doc, doc.skeleton!, () => { visto = nomes(doc); })).toBe(1);
    const i = visto.findIndex((n) => n.startsWith('hair/'));
    expect(i).toBeGreaterThanOrEqual(0);
    expect(visto.filter((n) => n.startsWith('hair/'))).not.toEqual(['hair/hair']);
    // A espada entra no lugar do cabelo, entre os mesmos vizinhos.
    expect(visto[i - 1]).toBe(antes[antes.indexOf('hair/hair') - 1]);
    // Depois do quadro, o slot é o do arquivo: o mesmo anexo, nada mudou.
    expect(cabelo.attachment).toBe(anexo);
    expect(nomes(doc)).toEqual(antes);
  });

  it('o clique nunca pega a peça de teste: com e sem Na cena, o clique acha o mesmo', () => {
    const doc = comTeste();
    const cabelo = doc.skeleton!.findSlot('hair')!;
    const bone = cabelo.bone;
    const pegar = () => JSON.stringify(pegarR39(doc.skeleton, bone.worldX, bone.worldY, 1));
    const sem = pegar();
    doc.run(toggleNaCena(doc)!.command);
    drawWithTestPieces(doc, doc.skeleton!, () => undefined);
    expect(pegar()).toBe(sem);
  });

  it('a linha da linha do tempo diz o que está na cena, e só com Na cena ligado', () => {
    const doc = comTeste();
    expect(montagemLineText(doc)).toBeNull();
    doc.run(toggleNaCena(doc)!.command);
    expect(montagemLineText(doc)).toBe('Montagem de teste na cena: espada (parada) no hair. Não entra na animação.');
  });

  it('Na cena vai para o manifesto e volta; o .bone continua igual', () => {
    const doc = comTeste();
    const letras = JSON.stringify(doc.file);
    doc.run(toggleNaCena(doc)!.command);
    expect(JSON.stringify(doc.file)).toBe(letras);
    const p = doc.project as ProjetoR39;
    const m = lerMontagemR39(p.manifesto);
    expect(m.naCena).toBe(true);
    const copia = manifestoVazioR39('heroi.bone');
    gravarMontagemR39(copia, m);
    expect(lerMontagemR39(copia)).toEqual(m);
  });
});

describe('Na cena: as duas ligações (rodada 39, lote 3)', () => {
  it('a cena desenha pela conta da montagem, e a linha do tempo mostra a linha de teste', () => {
    const cena = lerR39(resolverR39(__dirname, '../src/viewport/viewport-draw.ts'), 'utf8');
    expect(cena).toContain('drawWithTestPieces(doc, skeleton, () => renderer.draw(skeleton))');
    const tempo = lerR39(resolverR39(__dirname, '../src/panels/dopesheet.ts'), 'utf8');
    expect(tempo).toContain('const teste = testMontagemLine(this.doc);');
    expect(tempo).toContain("el('div', 'dope-linha dope-linha-teste')");
    const folha = lerR39(resolverR39(__dirname, '../src/panels/palette.css'), 'utf8');
    expect(folha).toMatch(/\.dope-linha-teste \.dope-faixa-teste\s*\{[^}]*dashed/);
    // O botão Na cena: ícone e palavra, e a frase inteira na dica.
    const aba = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    expect(aba).toContain("iconButton('eye', 'Na cena'");
    expect(aba).toContain("el('div', 'entidades-barra painel-barra mostra-nome')");
    expect(aba).toContain("botao.setAttribute('aria-pressed', String(ligado))");
  });
});

import { drawingOfSlot, innerLineRefusal } from '../src/panels/entities-cards-model.js';
import { saveDocument as salvarR39 } from '../src/io/open-save.js';
import { takePickerProblem as fraseDoSalvarR39 } from '../src/io/picker-problem.js';
import { entitiesMenu as menuEntidadesR39 } from '../src/ui/menus.js';

describe('as notas da conferência da v30.1 (rodada 39, lote 4)', () => {
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');

  it('(a) o slot que só aparece por chave (a entidade pendurada numa animação) recebe teste', () => {
    const file = JSON.parse(texto('heroi.bone')) as BoneFileR39;
    // O slot pendurado com uma animação aberta nasce sem desenho na pose de repouso.
    file.slots!.push({ name: 'poder5', bone: 'root', attachment: null } as never);
    (file.skins![0]!.attachments as Record<string, unknown>)['poder5'] = { poder5: { type: 'skeleton', uri: 'espada.bone' } };
    const doc = new DocR39(file, { path: 'heroi.bone', skeletons: new Map([['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))]]) });
    new ProjetoR39(doc);
    expect(drawingOfSlot(doc.file, 'poder5')).toBe('poder5');
    expect(whyCannotTest(doc, 'heroi.bone', 'poder5', 'capa.bone')).toBeNull();
    const linha = cardTree(doc).topo.linhas.find((l) => l.slot === 'poder5')!;
    expect(linha).toMatchObject({ vazio: false, host: 'heroi.bone' });
    doc.run(dropOnSlot(doc, 'heroi.bone', 'poder5', 'capa.bone')!.command);
    const copia = fileWithMontagem(doc)!;
    expect((copia.skins![0]!.attachments as Record<string, Record<string, { uri?: string }>>)['poder5']!['poder5']!.uri).toBe('capa.bone');
    // O slot sem desenho nenhum continua recusando, e dizendo.
    file.slots!.push({ name: 'nada', bone: 'root' } as never);
    expect(whyCannotTest(doc, 'heroi.bone', 'nada', 'capa.bone')).toContain('não tem desenho nenhum');
  });

  it('(a) a linha que não recebe diz por quê: a de dentro de outro cartão', () => {
    expect(innerLineRefusal('espada')).toContain('só nas tomadas do projeto aberto');
    expect(innerLineRefusal('espada')).toContain('anime espada por dentro');
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    // Toda linha responde ao arrasto; a recusa vai ao rodapé.
    expect(fonte).toContain('this.acceptDrop(doc, node, line.host, line.slot, pai);');
    expect(fonte).not.toContain('if (line.host !== null && !line.vazio) this.acceptDrop');
    expect(fonte).toContain('doc.notice(recusa ?? innerLineRefusal(pai));');
  });

  it('(b) a dica de Pôr em teste diz que vale com entidade também', () => {
    const item = menuEntidadesR39().find((e) => (e as { action?: string }).action === 'por-em-teste') as { hint: string };
    expect(item.hint).toContain('uma entidade escolhida');
  });

  it('(d) o Salvar que para antes de gravar diz por quê, em vez de ficar calado', async () => {
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, { path: 'heroi.bone' });
    fraseDoSalvarR39();
    const nome = await salvarR39(doc, { confirmProblems: () => false });
    expect(nome).toBeNull();
    // Nota a do doc 34: a frase é em português, diz o arquivo, e não cita o caminho interno.
    const frase = fraseDoSalvarR39() ?? '';
    expect(frase).toMatch(/^Salvar: parou antes de gravar, porque heroi\.bone tem \d+ problemas?\. Nada foi gravado$/);
    expect(frase).not.toContain('/skins');
    expect(frase).not.toContain('nested');
  });
});

import { drawWithChain, syncChainAnchor } from '../src/viewport/montagem-view.js';
import { chainUp, goUp as paraCimaR39, outerFile, slotsForUp, unplugUp, whyCannotGoUp } from '../src/panels/entities-cards-model.js';
import { UP_DRAG_TYPE, putProjectInside } from '../src/panels/palette-entities.js';

describe('ligar para cima: o boneco dentro do mecha, o mecha na nave (rodada 39, lote 4)', () => {
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');
  const regiao = (n: string): Record<string, unknown> => ({ [n]: { [n]: { type: 'region', path: n, width: 40, height: 40 } } });
  /** Uma entidade de fora: slots com imagem, e anexos `skeleton` onde se pedir. */
  function fora(nome: string, slots: string[], pecas: Record<string, Record<string, unknown>> = {}): BoneFileR39 {
    const attachments: Record<string, unknown> = {};
    for (const s of slots) Object.assign(attachments, pecas[s] === undefined ? regiao(s) : { [s]: { [s]: pecas[s] } });
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' }, skeleton: { name: nome },
      bones: [{ name: 'root' }, { name: 'banco', parent: 'root', x: 30, y: 50 }],
      slots: slots.map((s) => ({ name: s, bone: s === 'piloto' || s === 'cabine' ? 'banco' : 'root', attachment: s })),
      skins: [{ name: 'default', attachments }], animations: [],
    } as unknown as BoneFileR39;
  }
  function projeto(mecha = fora('mecha', ['perna', 'piloto', 'braco'])): { doc: DocR39; p: ProjetoR39 } {
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, { path: 'heroi.bone' });
    const p = new ProjetoR39(doc);
    p.adicionarEntidade('mecha.bone', new DocR39(mecha, { path: 'mecha.bone' }));
    p.adicionarEntidade('nave.bone', new DocR39(fora('nave', ['casco', 'cabine', 'vidro']), { path: 'nave.bone' }));
    return { doc, p };
  }
  const escolhe = (slot: string) => async (): Promise<string | null> => slot;

  it('o boneco entra no mecha, no piloto: teste; a árvore põe o mecha por fora', async () => {
    const { doc } = projeto();
    expect(slotsForUp(doc, 'mecha.bone')).toEqual(['perna', 'piloto', 'braco']);
    const ditos: string[] = [];
    const original = doc.notice.bind(doc);
    doc.notice = (t: string) => { ditos.push(t); original(t); };
    expect(await putProjectInside(doc, 'mecha.bone', escolhe('piloto'))).toBe(true);
    expect(ditos.at(-1)).toBe('Heroi entrou em mecha, na tomada piloto: teste. Heroi não leva mecha.');
    expect(chainUp(doc)).toEqual([{ base: 'heroi.bone', uri: 'mecha.bone', slot: 'piloto' }]);
    const { topo } = cardTree(doc);
    expect(topo).toMatchObject({ uri: 'mecha.bone', papel: 'teste', acima: { base: 'heroi.bone', slot: 'piloto' } });
    expect(cardTag(topo)).toBe('teste');
    expect(cardHint(topo, null, null)).toContain('não leva mecha');
    const piloto = topo.linhas.find((l) => l.slot === 'piloto')!;
    expect(piloto.cartoes.map((c) => [c.uri, c.papel])).toEqual([['heroi.bone', 'aqui']]);
    expect(topo.linhas.map((l) => l.slot)).toEqual(['piloto']);
  });

  it('o mecha na nave: o de fora entra no de mais fora, e a cadeia se lê de dentro para fora', async () => {
    const { doc } = projeto();
    await putProjectInside(doc, 'mecha.bone', escolhe('piloto'));
    await putProjectInside(doc, 'nave.bone', escolhe('cabine'));
    expect(chainUp(doc).map((a) => [a.base, a.uri, a.slot])).toEqual([
      ['heroi.bone', 'mecha.bone', 'piloto'], ['mecha.bone', 'nave.bone', 'cabine'],
    ]);
    const { topo } = cardTree(doc);
    expect(topo.uri).toBe('nave.bone');
    expect(topo.linhas[0]!.cartoes[0]!.uri).toBe('mecha.bone');
    expect(topo.linhas[0]!.cartoes[0]!.linhas[0]!.cartoes[0]!.papel).toBe('aqui');
    // Tirar o mecha de volta leva a nave junto: ela não fica pendurada no nada.
    const tira = unplugUp(doc, 'mecha.bone')!;
    expect(tira.frase).toBe('Heroi saiu de mecha (era teste).');
    doc.run(tira.command);
    expect(chainUp(doc)).toEqual([]);
    doc.undo();
    expect(chainUp(doc)).toHaveLength(2);
  });

  it('recusa a volta sem fim, o que já está na montagem, e o slot sem desenho — antes de soltar', async () => {
    const leva = fora('mecha', ['piloto', 'dono'], { dono: { type: 'skeleton', uri: 'heroi.bone' } });
    // O mecha que já leva o herói: pôr o herói nele daria uma volta.
    const { doc } = projeto(leva);
    expect(whyCannotGoUp(doc, 'mecha.bone', null)).toContain('volta sem fim');
    const { doc: d2 } = projeto();
    await putProjectInside(d2, 'mecha.bone', escolhe('piloto'));
    expect(whyCannotGoUp(d2, 'mecha.bone', null)).toContain('já está nesta montagem');
    expect(whyCannotGoUp(d2, 'heroi.bone', null)).toContain('já está nesta montagem');
    expect(whyCannotGoUp(d2, 'nave.bone', 'nao-existe')).toContain('não tem desenho');
    expect(whyCannotGoUp(d2, 'sumiu.bone', null)).toContain('não abriu o arquivo sumiu.bone');
    expect(outerFile(d2, 'nave.bone')).not.toBeNull();
    // A espada já está na mão do herói: pôr o herói dentro dela daria a volta ao contrário.
    const comEspada = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))]]),
    });
    const pe = new ProjetoR39(comEspada);
    pe.adicionarEntidade('espada.bone', new DocR39(JSON.parse(texto('espada.bone')) as BoneFileR39, { path: 'espada.bone' }));
    expect(whyCannotGoUp(comEspada, 'espada.bone', null)).toBe(
      'espada já está dentro de heroi. Pôr heroi dentro de espada faria uma volta sem fim',
    );
  });

  it('na cena: o mecha por trás e pela frente do boneco, e o boneco preso ao piloto — as chaves não mudam', async () => {
    const { doc } = projeto();
    await putProjectInside(doc, 'mecha.bone', escolhe('piloto'));
    const letras = JSON.stringify(doc.file);
    // Desligado: nada em volta, nenhuma âncora.
    syncChainAnchor(doc);
    expect(doc.skeleton!.parentMatrix).toBeNull();
    const ordem: string[] = [];
    expect(drawWithChain(doc, () => ordem.push('fora'), () => ordem.push('boneco'))).toBe(0);
    expect(ordem).toEqual(['boneco']);
    doc.run(toggleNaCena(doc)!.command);
    syncChainAnchor(doc);
    // O boneco se apoia no slot do mecha: a raiz dele sai da origem.
    const pai = doc.skeleton!.parentMatrix!;
    expect(pai).not.toBeNull();
    expect(pai.worldX).toBeCloseTo(30, 3);
    expect(pai.worldY).toBeCloseTo(50, 3);
    // De fora: o que vem antes do piloto, o boneco, o que vem depois.
    const visto: Array<string | string[]> = [];
    const n = drawWithChain(doc, (sk) => visto.push(sk.drawOrder.filter((s) => s.visible).map((s) => s.data.name)), () => visto.push('boneco'));
    expect(n).toBe(1);
    expect(visto).toEqual([['perna'], 'boneco', ['braco']]);
    expect(JSON.stringify(doc.file)).toBe(letras);
    // Desligar o Na cena tira a âncora: o boneco volta à origem.
    doc.run(toggleNaCena(doc)!.command);
    syncChainAnchor(doc);
    expect(doc.skeleton!.parentMatrix).toBeNull();
  });

  it('a cadeia vai para o manifesto, e volta', async () => {
    const { doc, p } = projeto();
    await putProjectInside(doc, 'mecha.bone', escolhe('piloto'));
    const m = lerMontagemR39(p.manifesto);
    expect(m.acima).toEqual([{ base: 'heroi.bone', uri: 'mecha.bone', slot: 'piloto' }]);
    const copia = manifestoVazioR39('heroi.bone');
    gravarMontagemR39(copia, m);
    expect(lerMontagemR39(copia)).toEqual(m);
    expect(paraCimaR39(doc, 'nave.bone', 'cabine').command.label).toBe('Pôr dentro de, em teste');
  });

  it('o painel: o cartão de fora se arrasta, a prateleira o recebe, e o de fora tem Tirar de volta', () => {
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    expect(UP_DRAG_TYPE).toBe('text/x-recorte-para-cima');
    expect(fonte).toContain('this.acceptUp(doc, node, row.uri);');
    expect(fonte).toContain("label: 'Tirar de volta'");
    // A recusa vai ao rodapé já no arrasto: com o cursor de "não" o navegador nem solta.
    expect(fonte.split('sayRefusal(doc, motivo);').length - 1).toBe(2);
    const cena = lerR39(resolverR39(__dirname, '../src/viewport/viewport-draw.ts'), 'utf8');
    expect(cena).toContain('if (doc !== null) syncChainAnchor(doc);');
    expect(cena).toContain('drawWithChain(doc, (fora) =>');
  });
});

import { putIntoProject, testLinkLabel, testLinks, whyNotIntoProject } from '../src/panels/entities-cards-model.js';
import { applyIntoProject, chooseIntoProject } from '../src/panels/palette-entities.js';

describe('Pôr no projeto: o teste vira arquivo, só no arquivo aberto (rodada 39, lote 5)', () => {
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');
  const regiao = (n: string): Record<string, unknown> => ({ [n]: { [n]: { type: 'region', path: n, width: 40, height: 40 } } });
  function fora(nome: string, slots: string[]): BoneFileR39 {
    const attachments: Record<string, unknown> = {};
    for (const s of slots) Object.assign(attachments, regiao(s));
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' }, skeleton: { name: nome },
      bones: [{ name: 'root' }, { name: 'banco', parent: 'root', x: 30, y: 50 }],
      slots: slots.map((s) => ({ name: s, bone: s === 'piloto' || s === 'cabine' ? 'banco' : 'root', attachment: s })),
      skins: [{ name: 'default', attachments }], animations: [],
    } as unknown as BoneFileR39;
  }
  function projeto(): DocR39 {
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))]]),
    });
    const p = new ProjetoR39(doc);
    p.adicionarEntidade('mecha.bone', new DocR39(fora('mecha', ['perna', 'piloto', 'braco']), { path: 'mecha.bone' }));
    p.adicionarEntidade('nave.bone', new DocR39(fora('nave', ['casco', 'cabine']), { path: 'nave.bone' }));
    return doc;
  }
  type Anexos = Record<string, Record<string, { type?: string; uri?: string; around?: string; x?: number; y?: number }>>;
  const anexos = (doc: DocR39): Anexos => doc.file.skins![0]!.attachments as unknown as Anexos;

  it('para baixo: a espada de teste vai para o cabelo, de verdade; Ctrl+Z volta a teste, letra por letra', () => {
    const doc = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    const letras = JSON.stringify(doc.file);
    const [link] = testLinks(doc);
    expect(testLinkLabel(link!)).toBe('espada na tomada hair');
    expect(whyNotIntoProject(doc, link!)).toBeNull();
    const gesto = putIntoProject(doc, link!)!;
    expect(gesto.frase).toContain('Espada gravada na tomada hair: agora é do projeto');
    expect(gesto.frase).toContain('Ctrl+Z volta a teste');
    doc.run(gesto.command);
    expect(anexos(doc)['hair']!['hair']).toMatchObject({ type: 'skeleton', uri: 'espada.bone' });
    expect(testLinks(doc)).toEqual([]);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(letras);
    expect(testLinks(doc)).toHaveLength(1);
  });

  it('para cima: o mecha entra NO boneco, com Este boneco no piloto, e no lugar certo; o rodapé avisa que agora ele leva', async () => {
    const doc = projeto();
    await putProjectInside(doc, 'mecha.bone', async () => 'piloto');
    const letras = JSON.stringify(doc.file);
    const link = testLinks(doc).find((l) => l.kind === 'cima')!;
    const gesto = putIntoProject(doc, link)!;
    expect(gesto.frase).toContain('Mecha entrou em heroi, com Este boneco no piloto');
    expect(gesto.frase).toContain('heroi LEVA mecha');
    doc.run(gesto.command);
    const novo = Object.values(anexos(doc)).flatMap((porNome) => Object.values(porNome)).find((a) => a.uri === 'mecha.bone')!;
    expect(novo).toMatchObject({ type: 'skeleton', around: 'piloto' });
    // O piloto (no banco, em 30, 50) cai na raiz do boneco: o mecha vai para -30, -50.
    expect(novo.x).toBeCloseTo(-30, 3);
    expect(novo.y).toBeCloseTo(-50, 3);
    expect(chainUp(doc)).toEqual([]);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(letras);
    expect(chainUp(doc)).toHaveLength(1);
  });

  it('dois níveis para cima: a nave leva o mecha, e nenhum dos dois é o arquivo aberto — o botão diz por quê', async () => {
    const doc = projeto();
    await putProjectInside(doc, 'mecha.bone', async () => 'piloto');
    await putProjectInside(doc, 'nave.bone', async () => 'cabine');
    const nave = testLinks(doc).find((l) => l.kind === 'cima' && l.elo.uri === 'nave.bone')!;
    expect(whyNotIntoProject(doc, nave)).toContain('nenhum dos dois é o arquivo aberto');
    expect(applyIntoProject(doc, nave)).toBe(false);
    // O primeiro de fora vai, e leva a nave junto, dizendo.
    const mecha = testLinks(doc).find((l) => l.kind === 'cima' && l.elo.uri === 'mecha.bone')!;
    expect(putIntoProject(doc, mecha)!.frase).toContain('Nave, que estava em volta de mecha, saiu (era teste)');
  });

  it('a barra e o menu: uma ligação grava; várias perguntam qual; nenhuma diz o que fazer', async () => {
    const doc = projeto();
    expect(await chooseIntoProject(doc, async () => 0)).toBe(false);
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    doc.run(dropOnSlot(doc, 'heroi.bone', 'head', 'espada.bone')!.command);
    expect(await chooseIntoProject(doc, async (links) => links.findIndex((l) => l.kind === 'baixo' && l.ligacao.slot === 'head'))).toBe(true);
    expect(testLinks(doc).map((l) => (l.kind === 'baixo' ? l.ligacao.slot : ''))).toEqual(['hair']);
    // Com DUAS, quem não escolhe não grava nada.
    doc.run(dropOnSlot(doc, 'heroi.bone', 'cape_upper', 'espada.bone')!.command);
    expect(await chooseIntoProject(doc, async () => null)).toBe(false);
    expect(testLinks(doc)).toHaveLength(2);
  });

  it('a barra tem o botão, e o (c) do doc 29: a cópia com outro nome agora se diz', () => {
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    expect(fonte).toContain("iconButton('save', 'Pôr no projeto'");
    expect(fonte).toContain("intoProjectItem(doc, { kind: 'baixo', ligacao })");
    const casca = lerR39(resolverR39(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(casca).toContain('e esta é uma CÓPIA. Para usar a que já existe, arraste-a da prateleira');
  });
});

import { whyCannotDrop } from '../src/panels/entities-cards-model.js';

describe('as notas da conferência da v30.6 (rodada 39b, doc 34)', () => {
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');
  function projeto(): DocR39 {
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, {
      path: 'heroi.bone', skeletons: new Map([
        ['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))],
        ['mecha.bone', carregarR39(JSON.parse(texto('mecha.bone')))],
      ]),
    });
    new ProjetoR39(doc);
    return doc;
  }

  it('(b) a entidade solta no slot onde ela JÁ está é recusada, com o porquê: no arquivo e em teste', () => {
    const doc = projeto();
    // A espada está gravada no weapon do herói.
    expect(whyCannotTest(doc, 'heroi.bone', 'weapon', 'espada.bone')).toBe('Espada já está na tomada weapon, gravada no arquivo: arraste outra peça');
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    expect(whyCannotTest(doc, 'heroi.bone', 'hair', 'espada.bone')).toBe('Espada já está na tomada hair, em teste: arraste outra peça');
  });

  it('(b) o cartão de teste solto no próprio slot é recusado, e a linha sabe de onde ele saiu', () => {
    const doc = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'capacete.bone')!.command);
    expect(whyCannotDrop(doc, 'heroi.bone', 'hair', 'capacete.bone', 'hair'))
      .toBe('A peça de teste já está na tomada hair: arraste-a até a linha de outra tomada, ou para a lista Peças');
    expect(whyCannotDrop(doc, 'heroi.bone', 'head', 'capacete.bone', 'hair')).toBeNull();
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    // O arrasto guarda de onde o cartão de teste saiu, e a recusa usa isso já no dragover.
    expect(fonte).toContain('arrastandoDe = { host: ligacao.host, slot: ligacao.slot };');
    expect(fonte).toContain('whyCannotDrop(doc, host, slot, uri, arrastandoDe');
  });

  it('(b) o mecha sobre o weapon é aceito: ele cobre a espada, e o rodapé diz qual', () => {
    const doc = projeto();
    expect(whyCannotTest(doc, 'heroi.bone', 'weapon', 'mecha.bone')).toBeNull();
    expect(dropOnSlot(doc, 'heroi.bone', 'weapon', 'mecha.bone')!.frase)
      .toBe('Mecha na tomada weapon, por cima de espada (que continua no arquivo): teste. A animação não muda.');
  });
});

import {
  animaChoices, cardSkins, cardTitle, setTestAnima, skinChoices, testAllEqual, toggleTestSkin, whyNoCardAnima,
} from '../src/panels/entities-cards-model.js';
import { setCardAnima } from '../src/panels/palette-entities.js';

describe('no cartão: o que a peça toca, as skins, a mesma duas vezes, as iguais (rodada 39b, lote 6)', () => {
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');
  const regiao = (n: string, path = n): Record<string, unknown> => ({ type: 'region', path, width: 40, height: 40 });
  /** Um robô: um braço, um banco com o piloto; a skin águia troca o braço; a animação andar gira o banco. */
  function robo(): BoneFileR39 {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' }, skeleton: { name: 'robo' },
      bones: [{ name: 'root' }, { name: 'banco', parent: 'root', x: 30, y: 50 }],
      slots: [{ name: 'braco', bone: 'root', attachment: 'braco' }, { name: 'piloto', bone: 'banco', attachment: 'piloto' }],
      skins: [
        { name: 'default', attachments: { braco: { braco: regiao('braco') }, piloto: { piloto: regiao('piloto') } } },
        { name: 'aguia', attachments: { braco: { braco: regiao('braco', 'asa') } } },
      ],
      animations: [{
        name: 'andar', duration: 1,
        timelines: [{ type: 'bone', target: 'banco', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 90 }] }],
      }],
    } as unknown as BoneFileR39;
  }
  /** O herói, com a espada carregada, o robô no projeto, e — se pedir — quatro rodas iguais. */
  function projeto(rodas = false): DocR39 {
    const file = JSON.parse(texto('heroi.bone')) as BoneFileR39;
    if (rodas) {
      for (const n of ['roda1', 'roda2', 'roda3', 'roda4']) {
        file.slots!.push({ name: n, bone: 'root', attachment: 'roda' } as never);
        (file.skins![0]!.attachments as Record<string, unknown>)[n] = { roda: regiao('roda') };
      }
    }
    const doc = new DocR39(file, {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))]]),
    });
    const p = new ProjetoR39(doc);
    p.adicionarEntidade('robo.bone', new DocR39(robo(), { path: 'robo.bone' }));
    return doc;
  }
  const naLinha = (doc: DocR39, slot: string, i = 0) => cardTree(doc).topo.linhas.find((l) => l.slot === slot)?.cartoes[i];
  type Def = { animation?: string; inheritAnimation?: boolean; skins?: string[]; uri?: string };
  const defNaCopia = (doc: DocR39, slot: string): Def =>
    Object.values((fileWithMontagem(doc)!.skins![0]!.attachments as Record<string, Record<string, Def>>)[slot]!)[0]!;

  it('anima ▾ na peça de teste: parada, a de quem recebe, ou uma dela; vai ao manifesto num passo, e o .bone não muda', () => {
    const doc = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'robo.bone')!.command);
    const letras = JSON.stringify(doc.file);
    let card = naLinha(doc, 'hair')!;
    expect(cardAnima(card)).toBe('anima: parada');
    expect(card.alvo).toEqual({ kind: 'baixo', host: 'heroi.bone', slot: 'hair', uri: 'robo.bone' });
    expect(animaChoices(doc, card).map((c) => c.label)).toEqual(['parada', 'mexe junto com quem segura', 'andar']);
    const gesto = setTestAnima(doc, card.alvo!, 'andar')!;
    expect(gesto.frase).toBe('Robo toca andar (teste). O arquivo não muda.');
    doc.run(gesto.command);
    card = naLinha(doc, 'hair')!;
    expect(cardAnima(card)).toBe('anima: andar');
    expect(animaChoices(doc, card).find((c) => c.atual)!.label).toBe('andar');
    expect(defNaCopia(doc, 'hair')).toMatchObject({ uri: 'robo.bone', animation: 'andar' });
    expect(JSON.stringify(doc.file)).toBe(letras);
    doc.undo();
    expect(cardAnima(naLinha(doc, 'hair')!)).toBe('anima: parada');
    // Mudar a peça de slot leva a escolha junto: é a mesma peça.
    doc.redo();
    doc.run(moveTest(doc, 'heroi.bone', 'hair', 'head')!.command);
    expect(cardAnima(naLinha(doc, 'head')!)).toBe('anima: andar');
  });

  it('"a de quem recebe" que a peça não tem: ela fica parada, e o cartão diz', () => {
    const doc = projeto();
    doc.animation = 'idle';
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'robo.bone')!.command);
    doc.run(setTestAnima(doc, naLinha(doc, 'hair')!.alvo!, '')!.command);
    expect(cardAnima(naLinha(doc, 'hair')!)).toBe('anima: mexe junto com quem segura — robo não tem idle: parada');
    expect(defNaCopia(doc, 'hair')).toMatchObject({ inheritAnimation: true });
  });

  it('skins ▾: liga e desliga uma skin da peça de teste; o arquivo dela não muda', () => {
    const doc = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'robo.bone')!.command);
    let card = naLinha(doc, 'hair')!;
    expect(cardSkins(card)).toBe('skins: default');
    expect(skinChoices(card)).toEqual([{ nome: 'aguia', ligada: false }]);
    const liga = toggleTestSkin(doc, card.alvo!, 'aguia')!;
    expect(liga.frase).toBe('Skin aguia no robo: teste. O arquivo de robo não muda.');
    doc.run(liga.command);
    card = naLinha(doc, 'hair')!;
    expect(cardSkins(card)).toBe('skins: aguia');
    expect(defNaCopia(doc, 'hair').skins).toEqual(['aguia']);
    const desliga = toggleTestSkin(doc, card.alvo!, 'aguia')!;
    expect(desliga.frase).toBe('Skin aguia saiu do robo (era teste).');
    // A espada só tem a default: nada para testar, e o cartão não mostra a lista.
    doc.run(dropOnSlot(doc, 'heroi.bone', 'head', 'espada.bone')!.command);
    expect(cardSkins(naLinha(doc, 'head')!)).toBeNull();
  });

  it('o robô em volta toca a animação do cartão, no relógio da agulha; o boneco segue o banco', async () => {
    const doc = projeto();
    await putProjectInside(doc, 'robo.bone', async () => 'piloto');
    doc.run(toggleNaCena(doc)!.command);
    const fora = cardTree(doc).topo;
    expect(fora.alvo).toEqual({ kind: 'cima', uri: 'robo.bone' });
    expect(cardAnima(fora)).toBe('anima: parada');
    doc.run(setTestAnima(doc, fora.alvo!, 'andar')!.command);
    expect(cardAnima(cardTree(doc).topo)).toBe('anima: andar');
    syncChainAnchor(doc);
    doc.animation = 'idle';
    doc.time = 0;
    doc.repose();
    const a0 = { ...doc.skeleton!.parentMatrix! };
    doc.time = 0.5;
    doc.repose();
    const a1 = { ...doc.skeleton!.parentMatrix! };
    // Parado, o banco não gira; tocando andar, em 0,5 s ele girou 45°.
    expect(Math.atan2(a0.c, a0.a) * 180 / Math.PI).toBeCloseTo(0, 3);
    expect(Math.abs(Math.atan2(a1.c, a1.a) * 180 / Math.PI)).toBeCloseTo(45, 1);
    expect(montagemLineText(doc)).toContain('robo (andar) em volta, no piloto');
  });

  it('a mesma entidade duas vezes: "espada 1 de 3" e as outras; o rodapé diz que são separadas', () => {
    const doc = projeto();
    // A espada já está gravada no weapon.
    expect(cardTitle(naLinha(doc, 'weapon')!)).toBe('espada');
    const segunda = dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!;
    expect(segunda.frase).toBe('Espada na tomada hair: teste. Agora há 2 cópias de espada, separadas. A animação não muda.');
    doc.run(segunda.command);
    doc.run(dropOnSlot(doc, 'heroi.bone', 'head', 'espada.bone')!.command);
    expect(cardTitle(naLinha(doc, 'hair')!)).toBe('espada 1 de 3');
    expect(cardTitle(naLinha(doc, 'head')!)).toBe('espada 2 de 3');
    expect(cardTitle(naLinha(doc, 'weapon')!)).toBe('espada 3 de 3');
  });

  it('as rodas: soltar o robô numa de 4 rodas iguais mostra "Trocar todas as iguais (4)"; um passo põe nas 4', () => {
    const doc = projeto(true);
    doc.run(dropOnSlot(doc, 'heroi.bone', 'roda2', 'robo.bone')!.command);
    expect(naLinha(doc, 'roda2')!.iguais).toBe(4);
    expect(naLinha(doc, 'hair')).toBeUndefined();
    const todas = testAllEqual(doc, 'heroi.bone', 'roda2')!;
    expect(todas.command.label).toBe('Trocar todas as iguais (4)');
    expect(todas.frase).toBe('Robo nas 4 peças iguais (roda1, roda2, roda3, roda4): teste. A animação não muda.');
    doc.run(todas.command);
    expect(montagemDeR39(doc).ligacoes.map((l) => l.slot).sort()).toEqual(['roda1', 'roda2', 'roda3', 'roda4']);
    expect(naLinha(doc, 'roda2')!.iguais).toBe(0);
    doc.undo();
    expect(montagemDeR39(doc).ligacoes.map((l) => l.slot)).toEqual(['roda2']);
  });

  it('anima ▾ na peça do projeto: é a faixa, da agulha em diante; com a base aberta, diz por quê', () => {
    const doc = projeto();
    const espada = naLinha(doc, 'weapon')!;
    expect(espada.alvo).toEqual({ kind: 'projeto', slot: 'weapon', uri: 'espada.bone' });
    // 05/11/2026: com a base aberta o menu abre — "a de quem recebe" vale em
    // todas as animações. As outras escolhas é que pedem uma animação aberta.
    const ditos: string[] = [];
    doc.on((c) => { if (c.label !== undefined) ditos.push(c.label); });
    expect(whyNoCardAnima(doc, espada)).toBeNull();
    expect(animaChoices(doc, espada).map((c) => c.label)).toEqual(['mexe junto com quem segura']);
    expect(setCardAnima(doc, espada, 'brilho')).toBe(false);
    expect(ditos.at(-1)).toBe('Abra uma animação: no projeto, o que a peça toca vira chave na faixa dela, da agulha em diante');
    doc.animation = 'idle';
    doc.time = 0;
    expect(whyNoCardAnima(doc, espada)).toBeNull();
    expect(animaChoices(doc, espada).map((c) => c.label)).toEqual(['livre — o jogo escolhe', 'mexe junto com quem segura', 'idle', 'brilho', 'attack']);
    expect(setCardAnima(doc, espada, 'brilho')).toBe(true);
    type Linha = { type: string; target: string; property: string; keys: Array<{ value: unknown }> };
    const linhas = (doc.file.animations!.find((a) => a.name === 'idle') as unknown as { timelines: Linha[] }).timelines;
    const faixa = linhas.find((t) => t.type === 'nested' && t.target === 'weapon' && t.property === 'animation')!;
    expect(faixa.keys.map((k) => k.value)).toEqual(['brilho']);
    expect(setCardAnima(doc, espada, null)).toBe(true);
  });

  it('a espada responde à animação do herói (inheritAnimation): pelo cartão do projeto, na base, um passo', () => {
    // O defeito (05/11/2026, a espada de um, o boneco de outro): a peça que
    // entrou no projeto — arrastada para a cena — não tinha como "responder à
    // animação". O "a de quem recebe" só existia no cartão de TESTE; no de
    // projeto, só a faixa, chave por chave, e nada com a base aberta.
    const doc = projeto();
    const espada = naLinha(doc, 'weapon')!;
    const def = (): Def => (doc.file.skins![0]!.attachments as Record<string, Record<string, Def>>)['weapon']!['sword']!;
    const ditos: string[] = [];
    doc.on((c) => { if (c.label !== undefined) ditos.push(c.label); });
    expect(def().inheritAnimation).toBeUndefined();
    expect(setCardAnima(doc, espada, '')).toBe(true);
    expect(def().inheritAnimation).toBe(true);
    // A animação dela fica: é o que ela toca quando o herói toca uma que ela não tem.
    expect(def().animation).toBe('idle');
    expect(naLinha(doc, 'weapon')!.anima).toBe('');
    expect(animaChoices(doc, naLinha(doc, 'weapon')!).find((c) => c.atual)!.label).toBe('mexe junto com quem segura');
    expect(ditos.some((d) => d.includes('responde à animação de quem a recebe'))).toBe(true);
    doc.undo();
    expect(def().inheritAnimation).toBeUndefined();
    doc.redo();
    expect(def().inheritAnimation).toBe(true);
    // De novo, desliga: ela volta a tocar só a dela.
    expect(setCardAnima(doc, naLinha(doc, 'weapon')!, '')).toBe(true);
    expect(def().inheritAnimation).toBeUndefined();
    expect(def().animation).toBe('idle');
  });
});

import { setViewPanSink } from '../src/viewport/view-center.js';

describe('Pôr no projeto para cima: o desenho fica onde estava no teste (doc 36, defeito 1)', () => {
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');
  const regiao = (n: string): Record<string, unknown> => ({ [n]: { [n]: { type: 'region', path: n, width: 40, height: 40 } } });
  function mecha(): BoneFileR39 {
    const attachments: Record<string, unknown> = {};
    for (const s of ['perna', 'piloto']) Object.assign(attachments, regiao(s));
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' }, skeleton: { name: 'mecha' },
      bones: [{ name: 'root' }, { name: 'banco', parent: 'root', x: 30, y: 135 }],
      slots: [{ name: 'perna', bone: 'root', attachment: 'perna' }, { name: 'piloto', bone: 'banco', attachment: 'piloto' }],
      skins: [{ name: 'default', attachments }], animations: [],
    } as unknown as BoneFileR39;
  }
  async function noMecha(): Promise<DocR39> {
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, { path: 'heroi.bone' });
    new ProjetoR39(doc).adicionarEntidade('mecha.bone', new DocR39(mecha(), { path: 'mecha.bone' }));
    await putProjectInside(doc, 'mecha.bone', async () => 'piloto');
    return doc;
  }

  it('com Na cena, a vista anda o que a âncora andava: o boneco não pula na tela; Ctrl+Z devolve', async () => {
    const doc = await noMecha();
    doc.run(toggleNaCena(doc)!.command);
    syncChainAnchor(doc);
    // No teste o boneco está 135 px acima, sentado no banco.
    expect(doc.skeleton!.parentMatrix!.worldY).toBeCloseTo(135, 3);
    const vista = { x: 0, y: 0 };
    setViewPanSink((dx, dy) => { vista.x += dx; vista.y += dy; });
    try {
      doc.run(putIntoProject(doc, testLinks(doc).find((l) => l.kind === 'cima')!)!.command);
      // O boneco volta à origem; a vista desce junto, e na tela nada se move.
      expect(vista.x).toBeCloseTo(-30, 3);
      expect(vista.y).toBeCloseTo(-135, 3);
      doc.undo();
      expect(vista.x).toBeCloseTo(0, 3);
      expect(vista.y).toBeCloseTo(0, 3);
    } finally {
      setViewPanSink(null);
    }
  });

  it('sem Na cena, a cena mostrava o boneco no lugar dele: a vista não anda', async () => {
    const doc = await noMecha();
    const vista = { x: 0, y: 0 };
    setViewPanSink((dx, dy) => { vista.x += dx; vista.y += dy; });
    try {
      doc.run(putIntoProject(doc, testLinks(doc).find((l) => l.kind === 'cima')!)!.command);
      expect(vista).toEqual({ x: 0, y: 0 });
    } finally {
      setViewPanSink(null);
    }
  });
});

import { cardMissing, foldedByDefault, montagemWarnings, trailOf, useTrail } from '../src/panels/entities-cards-model.js';
import { previewChainAnchor, drawChainAround } from '../src/viewport/montagem-view.js';

describe('os casos difíceis: o arquivo que falta, sem lugar, a trilha, a Prévia (rodada 39b, lote 7)', () => {
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');
  const regiao = (n: string): Record<string, unknown> => ({ [n]: { [n]: { type: 'region', path: n, width: 40, height: 40 } } });
  function fora(nome: string, slots: string[]): BoneFileR39 {
    const attachments: Record<string, unknown> = {};
    for (const s of slots) Object.assign(attachments, regiao(s));
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' }, skeleton: { name: nome },
      bones: [{ name: 'root' }, { name: 'banco', parent: 'root', x: 30, y: 50 }],
      slots: slots.map((s) => ({ name: s, bone: s === 'piloto' || s === 'cabine' ? 'banco' : 'root', attachment: s })),
      skins: [{ name: 'default', attachments }], animations: [],
    } as unknown as BoneFileR39;
  }
  function projeto(): { doc: DocR39; p: ProjetoR39 } {
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))]]),
    });
    const p = new ProjetoR39(doc);
    p.adicionarEntidade('mecha.bone', new DocR39(fora('mecha', ['perna', 'piloto', 'braco']), { path: 'mecha.bone' }));
    p.adicionarEntidade('nave.bone', new DocR39(fora('nave', ['casco', 'cabine']), { path: 'nave.bone' }));
    return { doc, p };
  }

  it('a entidade que sumiu do disco: o cartão fica, com "?" e "falta o arquivo"; a ligação não some; a barra de avisos diz o nome', () => {
    const { doc } = projeto();
    // A motosserra está no manifesto, mas o arquivo dela não veio com a pasta.
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'motosserra.bone')!.command);
    const card = cardTree(doc).topo.linhas.find((l) => l.slot === 'hair')!.cartoes[0]!;
    expect(card).toMatchObject({ papel: 'teste', carregada: false });
    expect(cardTag(card)).toBe('teste');
    expect(cardMissing(card)).toBe('falta o arquivo');
    expect(cardMissing(cardTree(doc).topo)).toBeNull();
    expect(montagemDeR39(doc).ligacoes).toHaveLength(1);
    expect(montagemWarnings(doc)).toEqual([
      'Encaixe de teste: falta o arquivo motosserra.bone (a peça de teste da tomada hair). A ligação fica, e nada é desenhado no lugar',
    ]);
    // A casca junta estes avisos aos do documento.
    const casca = lerR39(resolverR39(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain('extra.push(...montagemWarnings(doc));');
  });

  it('o slot que some: a peça de teste vai para "sem lugar", no topo do cartão, e diz; nunca some calada', () => {
    const { doc } = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    // O slot hair sai do arquivo (outra mão apagou a imagem).
    (doc.file as { slots: Array<{ name: string }> }).slots = doc.file.slots!.filter((s) => s.name !== 'hair') as never;
    const linhas = cardTree(doc).topo.linhas;
    expect(linhas[0]).toMatchObject({ slot: 'hair', semLugar: true });
    expect(linhas[0]!.cartoes[0]!.uri).toBe('espada.bone');
    expect(lineHint(linhas[0]!)).toContain('não existe mais em heroi');
    expect(montagemWarnings(doc)).toContain(
      'Encaixe de teste: a tomada hair não existe mais em heroi. A peça espada ficou sem lugar: arraste-a para outra tomada, ou Desligar',
    );
    // Desligar continua valendo.
    expect(unplug(doc, 'heroi.bone', 'hair')).not.toBeNull();
  });

  it('a trilha: com quem está em volta, numa tela baixa ou com mais de 4 níveis, os de fora viram "nave › mecha › heroi"', async () => {
    const { doc } = projeto();
    expect(trailOf(doc)).toEqual([]);
    await putProjectInside(doc, 'mecha.bone', async () => 'piloto');
    await putProjectInside(doc, 'nave.bone', async () => 'cabine');
    expect(trailOf(doc)).toEqual(['nave.bone', 'mecha.bone', 'heroi.bone']);
    expect(useTrail(2, 1080)).toBe(false);
    expect(useTrail(2, 720)).toBe(true);
    expect(useTrail(4, 1080)).toBe(true);
    expect(useTrail(0, 720)).toBe(false);
  });

  it('dobrado por padrão na tela baixa: só o AQUI e a cadeia dele nascem abertos', () => {
    const { doc } = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    const topo = cardTree(doc).topo;
    const espada = topo.linhas.find((l) => l.slot === 'hair')!.cartoes[0]!;
    expect(foldedByDefault(topo, true)).toBe(false);
    expect(foldedByDefault(espada, true)).toBe(true);
    expect(foldedByDefault(espada, false)).toBe(false);
  });

  it('a Prévia mostra o mecha em volta, sempre — com ou sem Na cena —, no relógio dela', async () => {
    const { doc } = projeto();
    expect(previewChainAnchor(doc, 0)).toBeNull();
    await putProjectInside(doc, 'mecha.bone', async () => 'piloto');
    // Na cena desligado: a cena não mostra, a Prévia mostra.
    const ancora = previewChainAnchor(doc, 0)!;
    expect(ancora.worldX).toBeCloseTo(30, 3);
    expect(ancora.worldY).toBeCloseTo(50, 3);
    const ordem: Array<string | string[]> = [];
    expect(drawChainAround(doc, 0, (sk) => ordem.push(sk.drawOrder.filter((s) => s.visible).map((s) => s.data.name)), () => ordem.push('boneco'))).toBe(1);
    expect(ordem).toEqual([['perna'], 'boneco', ['braco']]);
    const previa = lerR39(resolverR39(__dirname, '../src/panels/preview.ts'), 'utf8');
    expect(previa).toContain('previewChainAnchor(doc, tempo)');
    expect(previa).toContain('drawChainAround(doc, tempo,');
  });
});

import { compactFor, upSlotHint } from '../src/panels/entities-cards-model.js';
import { setTestAnima as setTestAnimaR42 } from '../src/panels/entities-cards-model.js';
import { warningRow as warningRowR42 } from '../src/panels/warning-model.js';

// Rodada 42, lote 2 — as sobras da aba das entidades (docs 40 e 42).
describe('as sobras da aba das entidades (rodada 42, lote 2)', () => {
  const EXEMPLOS = resolverR39(__dirname, '../../formato/exemplos');
  const texto = (nome: string): string => lerR39(juntarR39(EXEMPLOS, nome), 'utf8');
  const regiao = (n: string): Record<string, unknown> => ({ [n]: { [n]: { type: 'region', path: n, width: 40, height: 40 } } });
  function fora(nome: string, slots: string[]): BoneFileR39 {
    const attachments: Record<string, unknown> = {};
    for (const s of slots) Object.assign(attachments, regiao(s));
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' }, skeleton: { name: nome },
      bones: [{ name: 'root' }, { name: 'banco', parent: 'root', x: 30, y: 50 }],
      slots: slots.map((s) => ({ name: s, bone: s === 'piloto' ? 'banco' : 'root', attachment: s })),
      skins: [{ name: 'default', attachments }], animations: [{ name: 'idle', timelines: [] }],
    } as unknown as BoneFileR39;
  }
  function projeto(): DocR39 {
    const doc = new DocR39(JSON.parse(texto('heroi.bone')) as BoneFileR39, {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', carregarR39(JSON.parse(texto('espada.bone')))]]),
    });
    const p = new ProjetoR39(doc);
    p.adicionarEntidade('mecha.bone', new DocR39(fora('mecha', ['perna', 'piloto', 'braco']), { path: 'mecha.bone' }));
    return doc;
  }
  type Anexo = { type?: string; uri?: string; animation?: string; inheritAnimation?: boolean; skins?: string[] };
  const todos = (doc: DocR39): Anexo[] => (doc.file.skins ?? []).flatMap((s) => Object.values(s.attachments ?? {})
    .flatMap((porNome) => Object.values((porNome ?? {}) as Record<string, Anexo | null>)).filter((a): a is Anexo => a !== null));

  it('para cima: o mecha em idle continua em idle depois de Pôr no projeto, e o rodapé diz; Ctrl+Z volta a teste com idle', async () => {
    const doc = projeto();
    await putProjectInside(doc, 'mecha.bone', async () => 'piloto');
    doc.run(setTestAnimaR42(doc, { kind: 'cima', uri: 'mecha.bone' }, 'idle')!.command);
    const gesto = putIntoProject(doc, testLinks(doc).find((l) => l.kind === 'cima')!)!;
    expect(gesto.frase).toContain('Mecha continua tocando idle');
    doc.run(gesto.command);
    expect(todos(doc).find((a) => a.uri === 'mecha.bone')).toMatchObject({ type: 'skeleton', animation: 'idle' });
    doc.undo();
    expect(montagemDeR39(doc).acima[0]).toMatchObject({ uri: 'mecha.bone', anima: 'idle' });
    expect(todos(doc).some((a) => a.uri === 'mecha.bone')).toBe(false);
  });

  it('para baixo: "a de quem recebe" vira inheritAnimation, e uma animação dela vira animation; parada fica sem campo', () => {
    const doc = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'espada.bone')!.command);
    doc.run(setTestAnimaR42(doc, { kind: 'baixo', host: 'heroi.bone', slot: 'hair', uri: 'espada.bone' }, '')!.command);
    const gesto = putIntoProject(doc, testLinks(doc)[0]!)!;
    expect(gesto.frase).toContain('Espada continua tocando a animação de quem a recebe');
    doc.run(gesto.command);
    const hair = (doc.file.skins![0]!.attachments as Record<string, Record<string, Anexo>>)['hair']!['hair']!;
    expect(hair).toMatchObject({ type: 'skeleton', uri: 'espada.bone', inheritAnimation: true });
    expect(hair.animation).toBeUndefined();
    doc.undo();
    doc.run(setTestAnimaR42(doc, { kind: 'baixo', host: 'heroi.bone', slot: 'hair', uri: 'espada.bone' }, 'brilho')!.command);
    doc.run(putIntoProject(doc, testLinks(doc)[0]!)!.command);
    expect((doc.file.skins![0]!.attachments as Record<string, Record<string, Anexo>>)['hair']!['hair']).toMatchObject({ animation: 'brilho' });
    // E o cartão do projeto diz o mesmo que o teste dizia.
    const card = cardTree(doc).topo.linhas.find((l) => l.slot === 'hair')!.cartoes[0]!;
    expect(card.anima).toBe('brilho');
  });

  it('Pôr no projeto com o arquivo faltando avisa ANTES e não grava (regra 21)', () => {
    const doc = projeto();
    doc.run(dropOnSlot(doc, 'heroi.bone', 'hair', 'motosserra.bone')!.command);
    const link = testLinks(doc)[0]!;
    expect(whyNotIntoProject(doc, link)).toContain('Falta o arquivo motosserra.bone');
    const letras = JSON.stringify(doc.file);
    expect(applyIntoProject(doc, link)).toBe(false);
    expect(JSON.stringify(doc.file)).toBe(letras);
  });

  it('a janela de problemas fala português, diz o nome do arquivo e não mostra caminho interno', () => {
    const doc = projeto();
    const row = warningRowR42(doc.file, '/skins/.../sword/uri: nested skeleton "entidades/espada.bone" was not provided; placeholder treated as empty (spec 7.11)');
    expect(row.text).toContain('espada.bone');
    expect(row.text).toContain('falta o arquivo');
    expect(row.text).not.toMatch(/\/skins|spec|nested|entidades\//);
  });

  it('a pergunta do slot diz quem entra em quê: o herói entra no slot do mecha', () => {
    const doc = projeto();
    expect(upSlotHint(doc, 'mecha.bone', 'body')).toBe('Heroi entra na tomada body de mecha, no lugar da imagem que está lá');
  });

  it('no segundo nível, quem entra é o de fora: o mecha entra no slot da nave, não o herói', async () => {
    const doc = projeto();
    (doc as unknown as { project: ProjetoR39 }).project.adicionarEntidade('nave.bone', new DocR39(fora('nave', ['casco', 'cabine']), { path: 'nave.bone' }));
    await putProjectInside(doc, 'mecha.bone', async () => 'piloto');
    expect(upSlotHint(doc, 'nave.bone', 'cabine')).toBe('Mecha entra na tomada cabine de nave, no lugar da imagem que está lá');
  });

  it('a aba redesenha ao cruzar a altura da tela baixa, e a Prateleira fica presa ao pé da aba', () => {
    expect(compactFor(720)).toBe(true);
    expect(compactFor(1080)).toBe(false);
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    expect(fonte).toContain("addEventListener?.('resize', this.onResize)");
    expect(fonte).toContain("removeEventListener?.('resize', this.onResize)");
    const css = lerR39(resolverR39(__dirname, '../src/panels/palette.css'), 'utf8');
    // Rodada 47, lote 6 (reescrito de propósito, nota 4 do doc 87): a Montagem
    // cresce com o conteúdo e a aba rola; nenhuma caixa rola dentro da outra.
    expect(css).toMatch(/\.entidades-rolo > \.entidades-montagem \{[^}]*flex: 0 0 auto;[^}]*overflow: visible;/);
    expect(css).toMatch(/\.entidades-rolo > \.entidades-prateleira \{[^}]*flex: 0 0 auto;[^}]*overflow: visible;/);
  });

  it('o mecha sobre o slot weapon é ACEITO como teste: Spriter e DragonBones não medem o tamanho de quem entra (decisão escrita no plano)', () => {
    const doc = projeto();
    expect(whyCannotDrop(doc, 'heroi.bone', 'weapon', 'mecha.bone', null)).toBeNull();
  });
});

describe('a aba Entidades não rola inteira: a Montagem e a Prateleira são listas (rodada 42, v32.1)', () => {
  it('quem rola é o rolo da aba, que é lista; a Montagem não rola por dentro (rodada 47, lote 6)', () => {
    // Reescrito de propósito (nota 4 do doc 87): a Montagem era uma caixa de
    // 60 px com rolagem própria dentro da rolagem da aba. Agora cresce com o
    // conteúdo; a marca de lista fica no rolo, que é quem rola.
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette-entities.ts'), 'utf8');
    expect(fonte).toContain("list.dataset.rolagem = 'lista';");
    expect(fonte).not.toContain("montagem.dataset['rolagem'] = 'lista';");
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 1 (06/10/2026) — a pasta vira a origem de verdade
// ---------------------------------------------------------------------------

import { folderBecomesSource as viraR44, folderSwapNewImages as novasR44 } from '../src/io/project-folder.js';
import { OPEN_FOLDER_CHOICES as escolhasR44, hasCharacter as temR44, openFolderLead as fraseR44 } from '../src/panels/palette-model.js';

describe('trocar a pasta de origem: a pasta do Spriter (rodada 44, lote 1)', () => {
  /**
   * Na conferência (doc 55, foto 08): a pasta com a roupa de inverno numa
   * subpasta de MESMOS nomes (`body` e `inverno/body`) era recusada inteira —
   * "8 nomes repetidos" —, e o rodapé dizia "virou a origem" com a aba ainda
   * na pasta velha. Mas o candidato de MESMO caminho é a imagem de agora: não
   * é palpite (a regra I4 continua: repetido sem par exato avisa e não troca).
   */
  const AGORA = ['body', 'hair', 'blade'];
  const PASTA = ['body', 'hair', 'blade', 'armas/machado', 'inverno/body', 'inverno/hair'];

  it('o mesmo caminho é a mesma imagem: nada de ambíguo', () => {
    const plan = folderSwapPlan(AGORA, PASTA);
    expect(plan.ambiguous).toEqual([]);
    expect(plan.swaps).toEqual([]);
    expect(plan.same).toEqual(['blade', 'body', 'hair']);
  });

  it('repetido SEM par exato continua avisando e não troca (I4)', () => {
    const plan = folderSwapPlan(['maos/mao'], ['a/mao', 'b/mao']);
    expect(plan.ambiguous.length).toBe(1);
    expect(plan.same).toEqual([]);
  });

  it('a pasta vira a origem quando tem um nome em comum, e conta as novas', () => {
    const plan = folderSwapPlan(AGORA, PASTA);
    expect(viraR44(plan)).toBe(true);
    expect(novasR44(AGORA, PASTA, plan)).toBe(3);
    const frase = folderSwapNotice('heroi', plan, 3);
    expect(frase).toContain('virou a origem');
    expect(frase).toContain('3 já eram dela');
    expect(frase).toContain('3 imagens novas na aba Imagens');
    expect(frase).not.toContain('0 imagens');
  });

  it('sem nome em comum, nada vira origem e a frase diz que nada mudou', () => {
    const plan = folderSwapPlan(AGORA, ['outra/coisa']);
    expect(viraR44(plan)).toBe(false);
    expect(folderSwapNotice('vazia', plan)).toContain('Nada mudou');
  });

  it('a imagem trocada não conta como nova', () => {
    const plan = folderSwapPlan(['maos/mao'], ['ferido/maos/mao', 'ferido/x']);
    expect(novasR44(['maos/mao'], ['ferido/maos/mao', 'ferido/x'], plan)).toBe(1);
  });
});

describe('o Abrir pasta da aba pergunta (rodada 44, lote 1)', () => {
  it('só pergunta com personagem aberto', () => {
    expect(temR44({ slots: [] })).toBe(false);
    expect(temR44({})).toBe(false);
    expect(temR44({ slots: [{}] })).toBe(true);
  });

  it('cada escolha diz o que faz, e fechar é o caminho inofensivo', () => {
    expect(escolhasR44.map((e) => e.id)).toEqual(['origem', 'novo', 'nada']);
    for (const e of escolhasR44) expect(e.hint.length).toBeGreaterThan(5);
    expect(fraseR44({ skeleton: { name: 'heroi' }, slots: [{}, {}] })).toBe('"heroi" está aberto, com 2 slots. O que a pasta nova faz com ele?');
  });

  it('o botão da aba passa pela pergunta, e a dica avisa', () => {
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette.ts'), 'utf8');
    expect(fonte).toContain("iconButton('open', OPEN_FOLDER_HINT, () => { void openFolderFromTab(this.doc); });");
    expect(fonte).toContain("cancelId: 'nada',");
    expect(fonte).toContain('Com um personagem aberto, pergunta antes');
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 5 (06/10/2026) — mesmo nome em outra pasta é outro arquivo
// ---------------------------------------------------------------------------

import { namesForNotice as nomesR44b } from '../src/io/project-folder.js';

describe('trocar a pasta de origem: mesmo nome, outra pasta (rodada 44, lote 5)', () => {
  /**
   * A conferência da v32.7 (doc 60): a subpasta `alt`, mesmos nomes e cores
   * invertidas, ouviu "3 já eram dela (mesmo nome, mesmo lugar)" e a cena não
   * mudou. E o rodapé dizia só a conta das que não existem lá.
   */
  it('as da pasta mostram as de lá; as do atlas salvo continuam, e o rodapé diz quais', () => {
    const plan = folderSwapPlan(['mao_a', 'mao_b', 'body'], ['mao_a', 'mao_b', 'body']);
    const frase = folderSwapNotice('alt', plan, 0, { recarregadas: ['mao_a', 'mao_b'], noAtlas: ['body'] });
    expect(frase).toContain('2 de mesmo nome: a cena mostra as de lá');
    expect(frase).toContain('1 de mesmo nome está no atlas salvo, e a cena continua com ela (body)');
    expect(frase).not.toContain('mesmo lugar');
  });

  it('as que não existem lá: diz quais, até três e "e mais"', () => {
    expect(nomesR44b(['a', 'b'])).toBe('a, b');
    expect(nomesR44b(['a', 'b', 'c', 'd', 'e'])).toBe('a, b, c e mais 2');
    const plan = folderSwapPlan(['maos/m1', 'maos/m2', 'cabeca/r'], ['ferido/maos/m1']);
    expect(folderSwapNotice('ferido', plan)).toContain('2 não existem lá e ficaram como estavam (cabeca/r, maos/m2)');
  });

  it('o Trocar pasta recarrega os pixels das de mesmo nome', () => {
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette.ts'), 'utf8');
    expect(fonte).toContain('await refreshProvisional(doc, recarregadas);');
  });
});


describe('trocar a pasta de origem: a dica não promete desfazer (rodada 44, lote 6, doc 71)', () => {
  it('a dica diz o que volta com Ctrl+Z e o que não volta; o rodapé ensina a voltar', () => {
    expect(SWAP_FOLDER_HINT).not.toContain('Um só desfazer');
    expect(SWAP_FOLDER_HINT).toContain('a pasta não: para voltar, aponte a pasta de antes');
    const fonte = lerR39(resolverR39(__dirname, '../src/panels/palette.ts'), 'utf8');
    expect(fonte).toContain('. Para voltar, Trocar pasta de origem com a pasta de antes');
  });
});


// ---------------------------------------------------------------------------
// A espada de um, o boneco de outro — 05/11/2026
// ---------------------------------------------------------------------------

import { Projeto as ProjetoEB } from '../src/doc/projeto.js';
import { garantirAninhado as garantirAninhadoEB } from '../src/doc/projeto.js';
import { createEmptyFile as vazioEB } from '../src/doc/new-file.js';
import { atlasesNotPicked, entityAtlasesForFolder } from '../src/io/open-save.js';
import { ownPagesOnDisk } from '../src/io/folder-save.js';

/** A espada da pessoa A: um `.bone` com o atlas DELA, e não o do herói. */
function espadaDaPessoaA(): { doc: Doc; pagina: object; imagem: object } {
  const atlas = loadAtlas({
    atlas: { version: '1.0' },
    pages: [{ name: 'espada-atlas', image: 'espada-atlas.png', width: 8, height: 8 }],
    regions: [{ name: 'lamina', page: 0, x: 0, y: 0, width: 8, height: 2 }],
  });
  const file = {
    bone: { version: '1.0' }, skeleton: { name: 'espada' }, assets: { atlases: ['espada.atlas.json'] },
    bones: [{ name: 'root' }], slots: [{ name: 'lamina', bone: 'root', attachment: 'lamina' }],
    skins: [{ name: 'default', attachments: { lamina: { lamina: { type: 'region', width: 8, height: 2 } } } }],
    animations: [],
  } as unknown as BoneFile;
  const imagem = { width: 8, height: 8, marca: 'a página da espada' };
  const doc = new Doc(file, {
    path: 'espada.bone', atlases: [atlas], images: new Map([['espada-atlas.png', imagem as unknown as CanvasImageSource]]),
  });
  return { doc, pagina: atlas.pages[0]!, imagem };
}

describe('a espada de um, o boneco de outro (05/11/2026)', () => {
  it('a espada trazida de fora desenha no herói: a página dela vem do documento DELA', () => {
    // O defeito: a espada da pessoa A tem atlas próprio. O herói só conhecia as
    // páginas dele, e a espada pendurada na mão não aparecia — nem na cena,
    // nem na miniatura da prateleira. A espada de exemplo usa o atlas do
    // herói, e por isso ninguém tinha visto.
    const heroi = new Doc(vazioEB(), { path: 'heroi.bone' });
    const projeto = new ProjetoEB(heroi);
    const { doc: espada, pagina, imagem } = espadaDaPessoaA();
    projeto.adicionarEntidade('espada.bone', espada);
    garantirAninhadoEB(heroi, 'espada.bone');
    expect(heroi.imageFor(pagina as never)).toBe(imagem);
  });

  it('a página de outro atlas de MESMO nome não é emprestada: vale a identidade da página', () => {
    const heroi = new Doc(vazioEB(), { path: 'heroi.bone' });
    const projeto = new ProjetoEB(heroi);
    const { doc: espada } = espadaDaPessoaA();
    projeto.adicionarEntidade('espada.bone', espada);
    const estranha = loadAtlas({
      atlas: { version: '1.0' }, pages: [{ name: 'espada-atlas', image: 'espada-atlas.png', width: 8, height: 8 }], regions: [],
    }).pages[0]!;
    expect(heroi.imageFor(estranha)).toBeNull();
  });

  it('quem escolhe só o espada.bone fica sabendo do atlas que ficou de fora — e o programa pede a pasta dela', () => {
    // O defeito: Trazer entidade de fora… com só o espada.bone (o gesto
    // natural) trazia a espada sem imagem, e o aviso só dizia que as imagens
    // tinham sido procuradas nos atlas do herói. Agora o programa sabe o que
    // falta, e a casca pede a pasta da espada para trazer junto.
    const file = { assets: { atlases: ['espada.atlas.json'] } } as unknown as BoneFile;
    expect(atlasesNotPicked(file, ['espada.bone'])).toEqual(['espada.atlas.json']);
    expect(atlasesNotPicked(file, ['espada.bone', 'espada.atlas.json', 'espada-atlas.png'])).toEqual([]);
    expect(atlasesNotPicked({ assets: { atlases: ['imgs/espada.atlas.json'] } } as unknown as BoneFile, ['espada.atlas.json'])).toEqual([]);
    expect(atlasesNotPicked({} as BoneFile, ['espada.bone'])).toEqual([]);
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain('openEntityFromOutside(');
  });

  it('salvar de novo, noutro dia, grava a página por cima da dela — não nasce espada-atlas2.png', async () => {
    // O defeito: reaberta a pasta, a página do Salvar de ontem (espada-atlas.png)
    // era tomada por uma imagem da pasta, e o Salvar de hoje fugia dela para
    // espada-atlas2.png. Cada salvar deixava um arquivo a mais, e quem
    // entregava os três arquivos da espada entregava a página velha.
    const texto = JSON.stringify({ atlas: { version: '1.0' }, pages: [{ name: 'espada-atlas', image: 'espada-atlas.png', width: 8, height: 8 }], regions: [] });
    const atlasNoDisco: FolderFileHandle = { kind: 'file', name: 'espada.atlas.json', getFile: async () => new File([texto], 'espada.atlas.json') };
    const vazioEm = (name: string): FolderFileHandle => ({ kind: 'file', name, getFile: async () => new File([], name) });
    const raiz: FolderDirectoryHandle = {
      kind: 'directory', name: 'espada',
      values: async function* values() { yield* [atlasNoDisco, vazioEm('espada-atlas.png'), vazioEm('lamina.png')]; },
    };
    expect(await ownPagesOnDisk(raiz, 'espada.atlas.json')).toEqual(['espada-atlas.png']);
    expect(await ownPagesOnDisk(raiz, 'outro.atlas.json')).toEqual([]);
    const paths = new Set(['espada-atlas.png', 'lamina.png']);
    for (const p of await ownPagesOnDisk(raiz, 'espada.atlas.json')) paths.delete(p);
    expect(folderAtlasNames({} as BoneFile, 'espada', null, paths).page).toBe('espada-atlas');
    const fonte = readFileSync(resolve(__dirname, '../src/io/folder-save.ts'), 'utf8');
    expect(fonte).toContain('await ownPagesOnDisk(folder.handle,');
  });

  it('o Salvar leva para a pasta o atlas e a página da espada, não só o espada.bone', () => {
    // O defeito: o herói salvo levava espada.bone para a pasta, e o
    // espada.atlas.json e a espada-atlas.png ficavam para trás. Reaberto, ou
    // lido por um jogo, a espada vinha sem imagem nenhuma.
    const { doc: espada } = espadaDaPessoaA();
    const levar = entityAtlasesForFolder(espada, ['heroi.bone', 'heroi.atlas.json', 'heroi.png']);
    expect(levar.atlases.map((a) => a.name)).toEqual(['espada.atlas.json']);
    expect(JSON.parse(levar.atlases[0]!.text).pages[0].image).toBe('espada-atlas.png');
    expect(levar.pages.map((p) => p.name)).toEqual(['espada-atlas.png']);
    // Já está na pasta: não leva de novo.
    const nada = entityAtlasesForFolder(espada, ['espada.atlas.json', 'espada-atlas.png']);
    expect(nada.atlases).toEqual([]);
    expect(nada.pages).toEqual([]);
  });
});


// ---------------------------------------------------------------------------
// As tomadas — 05/11/2026, o pedido do Humberto pelo Diretor
// ---------------------------------------------------------------------------

import {
  PutSocket, PlugIntoSocket, UnplugSocket, Passos, tomadasDe, tomadasDoOsso, nomeDeTomada, nomeDaPeca, dicaDaTomada,
  SetBaseAnimation, animacaoPropria,
} from '../src/panels/tomadas-model.js';
import { SetInheritAnimation as SetInheritAnimationEB } from '../src/panels/entities-cards-model.js';

describe('as tomadas: o lugar no osso, e a peça encaixada (05/11/2026)', () => {
  const EX = resolve(__dirname, '../../formato/exemplos');
  const mecha = (): Doc => new Doc(JSON.parse(readFileSync(resolve(EX, 'mecha.bone'), 'utf8')) as BoneFile, { path: 'mecha.bone' });

  it('o slot com anexo skeleton é tomada com peça; o de imagem não é tomada', () => {
    const doc = mecha();
    const t = tomadasDe(doc.file);
    expect(t.map((x) => [x.slot, x.bone, x.peca, x.mexeJunto])).toEqual([['weapon', 'hand', 'espada.bone', true]]);
    expect(tomadasDoOsso(doc.file, 'hand').length).toBe(1);
    expect(tomadasDoOsso(doc.file, 'torso')).toEqual([]);
    expect(dicaDaTomada(t[0]!)).toContain('segura espada');
  });

  it('Pôr uma tomada aqui: um slot vazio no osso, que é tomada vazia; desfaz exato', () => {
    const doc = mecha();
    const antes = JSON.stringify(doc.file);
    const nome = nomeDeTomada(doc.file, 'torso', 'cabine');
    expect(nome).toBe('cabine');
    doc.run(new PutSocket('torso', nome));
    expect(tomadasDoOsso(doc.file, 'torso')).toEqual([{ slot: 'cabine', bone: 'torso', peca: null, anexo: null, mexeJunto: false }]);
    expect(dicaDaTomada(tomadasDoOsso(doc.file, 'torso')[0]!)).toContain('vazia');
    expect(nomeDeTomada(doc.file, 'torso', 'cabine')).not.toBe('cabine');
    expect(nomeDeTomada(doc.file, 'hand')).toBe('tomada_hand');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('Encaixar um projeto: o herói na cabine, mexendo junto; um passo; desfaz exato', () => {
    const doc = mecha();
    const antes = JSON.stringify(doc.file);
    doc.run(new Passos('Encaixar heroi', [new PutSocket('torso', 'cabine'), new PlugIntoSocket('cabine', 'heroi.bone', 'idle')]));
    const t = tomadasDoOsso(doc.file, 'torso')[0]!;
    expect([t.peca, t.anexo, t.mexeJunto]).toEqual(['heroi.bone', 'heroi', true]);
    const def = (doc.file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)['cabine']!['heroi']!;
    expect(def).toEqual({ type: 'skeleton', uri: 'heroi.bone', x: 0, y: 0, inheritAnimation: true, animation: 'idle' });
    expect(doc.file.slots!.find((s) => s.name === 'cabine')!.attachment).toBe('heroi');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('trocar a peça e tirar a peça: a tomada fica; os dois desfazem exato', () => {
    const doc = mecha();
    const antes = JSON.stringify(doc.file);
    doc.run(new PlugIntoSocket('weapon', 'motosserra.bone', null));
    expect(tomadasDoOsso(doc.file, 'hand')[0]!.peca).toBe('motosserra.bone');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    doc.run(new UnplugSocket('weapon'));
    expect(tomadasDoOsso(doc.file, 'hand')).toEqual([{ slot: 'weapon', bone: 'hand', peca: null, anexo: null, mexeJunto: false }]);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a peça nasce em pé no mundo: o anexo desfaz o giro do osso (o herói entrava deitado na cabine)', () => {
    // O defeito, visto na foto da prova: o tronco do mecha está a 90°, e o
    // herói encaixado nascia deitado, no eixo do osso.
    const doc = mecha();
    doc.run(new Passos('Encaixar', [new PutSocket('torso', 'cabine'), new PlugIntoSocket('cabine', 'heroi.bone', null, -90)]));
    const def = (doc.file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)['cabine']!['heroi']!;
    expect(def['rotation']).toBe(-90);
    doc.undo();
    doc.run(new PlugIntoSocket('weapon', 'espada.bone', null, 0));
    expect('rotation' in (doc.file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)['weapon']!['espada']!).toBe(false);
  });

  it('Animação própria, sempre ligada (baseAnimation): liga, troca, tira, desfaz exato — antes não havia porta', () => {
    const doc = mecha();
    const antes = JSON.stringify(doc.file);
    const t = () => tomadasDoOsso(doc.file, 'hand')[0]!;
    expect(animacaoPropria(doc.file, t())).toBe('brilho');
    doc.run(new SetBaseAnimation('weapon', 'sword', null));
    expect(animacaoPropria(doc.file, t())).toBeNull();
    doc.run(new SetBaseAnimation('weapon', 'sword', 'idle'));
    expect(animacaoPropria(doc.file, t())).toBe('idle');
    doc.undo();
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a volta é exata até na ordem dos campos: tirar a peça e desligar o mexer junto, no herói', () => {
    // A forma do erro: apagar um campo e, na volta, pô-lo de novo NO FIM do
    // objeto. O slot `weapon` do herói tem `visible` depois de `attachment`.
    const doc = new Doc(JSON.parse(readFileSync(resolve(EX, 'heroi.bone'), 'utf8')) as BoneFile, { path: 'heroi.bone' });
    const antes = JSON.stringify(doc.file);
    doc.run(new UnplugSocket('weapon'));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    doc.run(new PlugIntoSocket('weapon', 'motosserra.bone', null));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    const comMexe = JSON.stringify(mecha().file);
    const m = mecha();
    m.run(new SetInheritAnimationEB('default', 'weapon', 'sword', false));
    m.undo();
    expect(JSON.stringify(m.file)).toBe(comMexe);
  });

  it('o nome da peça é o do arquivo, sem a extensão', () => {
    expect(nomeDaPeca('pecas/espada.bone')).toBe('espada');
    expect(nomeDaPeca('mecha.bonez')).toBe('mecha');
  });
});

describe('QA 04/11/2026 — D14: o .bone sem atlas, aberto pela pasta, mostra as imagens que estão nela', () => {
  // A prova (Chromium sem janela): Abrir pasta exemplo/game (ou soltá-la na
  // cena). A pasta tem `bcp 2026-09-09.bone` na raiz — o projeto do Spriter
  // convertido pela linha de comando, sem atlas, com as imagens soltas
  // (`bot/01 (6)` → `bot/01 (6).png`). O editor reabria o .bone e dizia
  // "176 avisos (88 iguais)": 88 imagens "não encontradas" que ESTÃO na pasta
  // (a aba Imagens mostrava as 128). Importar o mesmo bcp.scml as ligava todas.
  const GAME = resolve(__dirname, '../../exemplo/game');

  it('as imagens em uso que nenhum atlas tem e a pasta tem: 87 das 88 do bcp', async () => {
    const { looseImagesInFolder } = await import('../src/io/folder-save.js');
    const { readdirSync, statSync } = await import('node:fs');
    const nomes: string[] = [];
    const anda = (dir: string, pre: string): void => {
      for (const n of readdirSync(dir)) {
        const p = resolve(dir, n);
        if (statSync(p).isDirectory()) anda(p, `${pre}${n}/`);
        else if (/\.png$/i.test(n)) nomes.push(imageNameOf(`${pre}${n}`));
      }
    };
    anda(GAME, '');
    const file = JSON.parse(readFileSync(resolve(GAME, 'bcp 2026-09-09.bone'), 'utf8')) as BoneFile;
    const soltas = looseImagesInFolder(file, [], new Set(nomes));
    expect(soltas).toContain('bot/01 (6)');
    expect(soltas).toContain('Camada 87');
    // 87 das 88: a que falta (`mao/_0000_Camada-1-copiar_tmp5068`) é uma PASTA
    // no disco, e não um PNG — ela continua sendo dita pela barra de avisos.
    expect(soltas.length).toBe(87);
    expect(soltas).not.toContain('mao/_0000_Camada-1-copiar_tmp5068');
  });

  it('o que já está num atlas, ou não está na pasta, fica de fora', async () => {
    const { looseImagesInFolder } = await import('../src/io/folder-save.js');
    const file = {
      skins: [{ name: 'default', attachments: { a: { a: { type: 'region' } }, b: { b: { type: 'region' } }, c: { c: { type: 'region' } } } }],
    } as unknown as BoneFile;
    const atlas = loadAtlas({ atlas: { version: '1.0' }, pages: [{ name: 'p', image: 'p.png', width: 4, height: 4 }], regions: [{ name: 'a', page: 0, x: 0, y: 0, width: 2, height: 2 }] });
    expect(looseImagesInFolder(file, [atlas], new Set(['a', 'b']))).toEqual(['b']);
  });

  it('o adoptFolderAtlases liga as soltas, também quando nenhum atlas é da pasta', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/folder-save.ts'), 'utf8');
    const corpo = fonte.slice(fonte.indexOf('export async function adoptFolderAtlases('));
    const ate = corpo.indexOf('if (ours.length === 0)');
    expect(corpo.slice(0, ate)).toContain('ensureProvisionalMany(doc, looseImagesInFolder(');
  });
});

describe('QA 04/11/2026 — D22: o Salvar do projeto grande diz que está salvando, e a tela respira', () => {
  // A prova (Chromium sem janela): exemplo/game → bcp.scml → Ctrl+S. A página
  // ficou 8 s parada, e o rodapé sem palavra nenhuma, até "Salvo em bcp.bone".
  // Medido: o buildFolderPack (91 imagens lidas, empacotadas, 3 páginas PNG)
  // levava 7,2 s num pedaço só.
  it('o buildFolderPack aceita o andamento e pausa entre as imagens e as páginas', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/folder-save.ts'), 'utf8');
    const corpo = fonte.slice(fonte.indexOf('export async function buildFolderPack('), fonte.indexOf('/** Desce da pasta do projeto'));
    expect(corpo).toContain('onProgress?: (feito: number, total: number, fase: string) => void');
    expect(corpo.match(/await respirar\(\);/g)?.length).toBe(2);
  });

  it('o Salvar passa o andamento até o rodapé', () => {
    const io = readFileSync(resolve(__dirname, '../src/io/open-save.ts'), 'utf8');
    expect(io.match(/buildFolderPack\(doc, stemOfName\(handle\.name\), options\.onProgress\)/g)?.length).toBe(1);
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(casca).toContain('onProgress: (feito, total, fase) => { shell.statusState.textContent = `Salvando ${feito} de ${total}: ${fase}…`; },');
  });
});

describe('as palavras da aba Tomadas: nenhum texto de tela diz "slot" fora dos parênteses (05/11/2026)', () => {
  // O dicionário da tela (§5): o lugar no osso é a TOMADA; a imagem que vira
  // base é a IMAGEM-BASE. O nome técnico só entre parênteses, depois da
  // palavra da pessoa. Este teste prende as 71 trocas: um texto novo com
  // "slot" à vista volta a ficar vermelho aqui, com o arquivo e a frase.
  const ARQUIVOS = [
    'panels/entities-actions.ts', 'panels/entities-cards-model.ts', 'panels/palette-entities.ts',
    'panels/palette-entities-model.ts', 'panels/slot-base-model.ts', 'doc/around-warnings.ts',
    'panels/tomadas.ts', 'panels/tomadas-model.ts',
  ];
  it('cada texto entre aspas, sem o que está entre parênteses, não tem a palavra slot', () => {
    const ruins: string[] = [];
    for (const arquivo of ARQUIVOS) {
      const fonte = readFileSync(resolve(__dirname, '../src', arquivo), 'utf8')
        .split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
      for (const m of fonte.matchAll(/'([^'\n]*)'|`([^`]*)`/g)) {
        const texto = (m[1] ?? m[2] ?? '').replace(/\$\{[^}]*\}/g, 'X');
        if (!/\s/.test(texto)) continue; // nome de campo, classe, chave: não é frase
        const fora = texto.replace(/\([^)]*\)/g, '');
        if (/\bslots?\b/.test(fora)) ruins.push(`${arquivo}: ${texto.slice(0, 90)}`);
      }
    }
    expect(ruins).toEqual([]);
  });

  it('a prova de que o teste pega: uma frase velha seria acusada', () => {
    const velha = 'A peça de teste já está no slot X: arraste-a até a linha de outro slot';
    expect(/\bslots?\b/.test(velha.replace(/\([^)]*\)/g, ''))).toBe(true);
    expect(/\bslots?\b/.test('Uma tomada vazia (um slot sem imagem)'.replace(/\([^)]*\)/g, ''))).toBe(false);
  });
});
