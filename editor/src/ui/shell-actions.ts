/**
 * A casca: as ações que ela mesma faz — lote A5a, plano arrumação (v10.8).
 *
 * `registerShellActions` (arquivo, desfazer, seleção, janelas, ajuda), abrir
 * um painel, Substituir nomes, Preferências, Ajuda → Atalhos e Sobre, Abrir
 * recente, Sair, escolher tudo, os filhos e os pais, imagem no slot e trocar a
 * imagem em todas as peles. Cortado de `shell.ts` pela seção "As ações que o
 * shell mesmo faz": cada método virou uma função que recebe a casca (`shell`),
 * e a classe `Shell` guarda um método de uma linha que chama a função.
 */

import pkg from '../../../package.json';
import { emptySelection } from '../contract.js';
import { openRecentDocument } from '../io/open-save.js';
import { adoptFolderAtlases } from '../io/folder-save.js';
import { recentFiles, pastasPrimeiro } from '../io/recent.js';
import { forgetImportedImages } from '../io/import-images.js';
import { isRecentFolder, reopenRecentFolder } from '../io/project-folder.js';
import { palettePanel } from '../panels/palette.js';
import { selectChildren, selectParents } from '../doc/duplicate.js';
import { Projeto } from '../doc/projeto.js';
import { pasteBodyHere } from '../anim/body.js';
import { bodyTarget, revealKey, roundTime } from '../anim/keying.js';
import { swapPickFor } from '../panels/skins-model.js';
import { MANUAL_FOLDER } from '../io/manual.js';
import { askForm, askPick, showOptions, showTable, tellUser } from './dialog.js';
import { keyTable } from './keys.js';
import { showKeysDialog } from './keys-dialog.js';

import {
  allArrangements, arrangements, deleteArrangement, onArrangementsChange,
  saveArrangement, savedList, setArrangements,
} from './arrangements.js';
import { CONTEXTS } from './contexts.js';
import { RenameMany, renameMany } from '../panels/tree-model.js';
import { prefs, setPrefs } from './prefs.js';
import { registerAction } from './actions.js';
import { WINDOW_PANELS } from './menus.js';
import type { Shell } from './shell.js';
import { DOCK_PANELS } from './shell.js';

// -------------------------------------------------------------------------
// As ações que o shell mesmo faz
// -------------------------------------------------------------------------

/**
 * Liga no registro tudo o que é do shell: o arquivo, o desfazer, a ajuda e os
 * painéis. Os painéis e a cena registram as deles ao montar.
 */
export function registerShellActions(shell: Shell): void {
  const add = (id: string, run: () => void | Promise<void>, enabled?: () => boolean): void => {
    registerAction(id, enabled === undefined ? { run } : { run, enabled });
  };

  add('novo', () => shell.newFile());
  add('abrir', () => shell.open());
  add('salvar', () => shell.save(false));
  add('salvar-como', () => shell.save(true));
  add('salvar-binario', () => shell.saveBinary());
  add('salvar-pacote', () => shell.savePackage());
  add('exportar-gltf', () => shell.exportGltf());
  add('exportar-imagem', () => shell.exportImage());
  add('exportar-pele', () => shell.exportBySkin());
  add('importar-programa', () => shell.importForeign());
  add('importar-psd', () => shell.importPsdFile());
  add('importar-psd-ossos', () => shell.importPsdFile(true));
  add('abrir-pasta', () => shell.openFolder());
  // Degrau 10: o projeto é a caixa (P2, P3, E4, E17).
  add('abrir-corpo', () => shell.openAnother('corpo'));
  add('abrir-entidade', () => shell.openAnother('entidade'));
  add('entregar-corpo', () => shell.deliverOneBody());
  add('salvar-entidade', () => shell.saveEntityFile());

  add('desfazer', () => shell.doc.undo(), () => shell.doc.canUndo);
  add('refazer', () => shell.doc.redo(), () => shell.doc.canRedo);
  // Degrau 4b: a virada de corpo (M10, spec 9.13).
  add('colar-corpo', () => pasteBody(shell), () => shell.doc.animation !== null);

  // Esc: o mesmo desmarcar que a cena faz, para valer também com o foco na
  // Árvore ou na linha do tempo. Quando a cena tem o foco é ela quem trata,
  // e ela para o evento ali mesmo: a tecla nunca é atendida duas vezes.
  // Preferências: escolhas de quem usa, guardadas no navegador. Estão em dois
  // lugares de propósito — o interruptor solto no menu Exibir, para quem já
  // sabe o que quer, e a janela em Editar, para quem foi procurar.
  add('preferencias', () => shell.showPrefs());
  registerAction('nome-das-ferramentas', {
    run: () => setPrefs({ toolNames: !prefs().toolNames }),
    checked: () => prefs().toolNames,
  });

  // Copiar e colar a âncora do desenho — item 33.
  add('copiar-ancora', () => shell.copyAnchor(), () => shell.doc.selection.attachments.length > 0);
  add('colar-ancora', () => shell.pasteAnchorNow(),
    () => shell.anchor !== null && shell.doc.selection.attachments.length > 0);
  // Lote 39 — trocar a imagem em todas as peles.
  add('trocar-imagem-todas-peles', () => shell.swapImageEverywhere(),
    () => shell.doc.selection.attachments.length === 1);

  add('desmarcar', () => shell.doc.select(emptySelection()));
  add('cebola-opcoes', () => shell.showPanel('exibicao'));
  add('substituir-nomes', () => shell.replaceNames());

  add('reabrir', () => shell.reopenClosed());
  // Os quatro que eram cinzas para sempre — anotação 22, lote 33.
  add('abrir-recente', () => shell.openRecent(), () => recentFiles().length > 0);
  add('sair', () => shell.quit());
  add('selecionar-tudo', () => shell.selectAll(), () => shell.hasAnythingToSelect());
  // Lote 42 — Editar → Escolher → Os filhos (`]`) e Os pais (`[`).
  add('escolher-filhos', () => shell.selectFamily('filhos'), () => shell.hasSelection());
  add('escolher-pais', () => shell.selectFamily('pais'), () => shell.hasSelection());
  add('novo-imagem', () => shell.newImageInSlot());
  add('repetir-exportacao', () => shell.repeatExport());
  add('configuracoes', () => shell.projectSettings());
  add('paleta', () => shell.commandPalette());

  add('manual', () => shell.showManual());
  add('atalhos', () => shell.showShortcuts());
  add('sobre', () => shell.showAbout());

  // Exibir → Tema. Trocar é escrever as variáveis na raiz: nenhum painel é
  // remontado, e o campo que estava sendo digitado continua sendo digitado.
  for (const name of ['claro', 'escuro'] as const) {
    registerAction(`tema-${name}`, {
      run: () => shell.useTheme(name),
      checked: () => prefs().theme === name,
    });
  }
  registerAction('esconder-paineis', {
    run: () => shell.toggleChrome(),
    checked: () => shell.chromeHidden,
  });
  // Rodada 4, lote 6: o `Shift+Tab` do Photoshop — só as colunas.
  registerAction('esconder-colunas', {
    run: () => shell.toggleColumnsOnly(),
    checked: () => shell.columnsOnlyHidden,
  });
  // O botão Detalhes da linha 1 e o item do menu Janela: a MESMA função.
  registerAction('detalhes-faixa', {
    run: () => shell.toggleDockOpen(),
    checked: () => shell.dockView.open,
  });
  add('problemas', () => shell.showProblems());
  add('layout-padrao', () => shell.resetLayout());
  add('fechar-grupo', () => shell.closeFocusedGroup());
  registerAction('soltar-painel', {
    run: () => shell.soltarPainelEmUso(),
    enabled: () => shell.hasDockedPanel(),
  });
  registerAction('recolher-em-icone', {
    run: () => shell.setIconColumns(true),
    enabled: () => shell.iconMenuState().recolher.enabled,
    why: () => shell.iconMenuState().recolher.why || null,
  });
  registerAction('expandir-paineis', {
    run: () => shell.setIconColumns(false),
    enabled: () => shell.iconMenuState().expandir.enabled,
    why: () => shell.iconMenuState().expandir.why || null,
  });
  registerAction('mover-de-coluna', {
    run: () => { void shell.askMovePanel(); },
    enabled: () => shell.columnEntries.size > 1,
  });

  /*
   * **Os arranjos com nome** — degrau 11, lote 4 (C6).
   *
   * Os dois de fábrica têm id fixo e estão na tabela de ações; um arranjo
   * guardado por quem usa ganha o id do nome dele, e é registrado aqui toda
   * vez que a lista muda — senão o item do menu existiria e não faria nada.
   */
  const registrarArranjos = (): void => {
    for (const item of allArrangements(arrangements())) {
      registerAction(item.id, { run: () => shell.applyArrangement(item.id) });
    }
  };
  registrarArranjos();
  onArrangementsChange(registrarArranjos);

  // Rodada 4, lote 8: os contextos. A marca acende no que está em uso.
  for (const contexto of CONTEXTS) {
    registerAction(contexto.id, {
      run: () => shell.applyContext(contexto.id),
      checked: () => shell.currentContext === contexto.id,
    });
  }

  add('guardar-arranjo', () => { void saveArrangementDialog(shell); });
  add('apagar-arranjo', () => { void deleteArrangementDialog(shell); });

  for (const panel of WINDOW_PANELS) {
    registerAction(`painel-${panel.id}`, {
      run: () => togglePanel(shell, panel.id),
      checked: () => (DOCK_PANELS.includes(panel.id)
        ? shell.activeDock === panel.id
        : shell.isPanelOpen(panel.id)),
    });
    /*
     * **Trazer à frente, que NÃO é o mesmo que o interruptor** — defeito 2
     * (19/09/2026).
     *
     * `painel-*` virou interruptor em 13/09, e com a aba aberta e à frente ele
     * FECHA. Quem só quer mostrar o painel antes de fazer alguma coisa nele —
     * *Novo → Regra…*, *Novo → Pele* — chamava o interruptor, e o gesto
     * fechava a aba em vez de abri-la. Os dois são certos; eram um só.
     *
     * Não dá para o painel chamar `showPanel` direto: ele é do degrau 3 e a
     * casca é do 4 (`fronteiras.test.ts`). Por isso é uma AÇÃO, que é como um
     * painel pede alguma coisa à casca sem importá-la.
     */
    registerAction(`mostrar-painel-${panel.id}`, {
      run: () => bringPanelToFront(shell, panel.id),
    });
  }
}

/**
 * Traz um painel à vista pelo id, venha ele da coluna ou da faixa de baixo.
 *
 * Nos dois casos ele só ABRE: um item do menu Janela que fechasse o painel ao
 * ser clicado de novo faria o Humberto perder de vista justamente o que ele
 * foi buscar. Com os painéis escondidos pelo `Tab`, trazer um de volta traz a
 * coluna junto — pedir um painel e não ver nada seria pior que nada.
 */
/**
 * O item do menu Janela, agora um INTERRUPTOR de verdade — 13/09/2026.
 *
 * O Humberto: *"não dá pra fechar um menu e depois abrir ele em 'janelas'. O
 * menu janelas não funciona."* Ele estava certo, e por dois motivos somados:
 * não havia como fechar painel nenhum, e cada item já tinha a MARCA de
 * seleção — o desenho universal de um interruptor — sem ser um.
 *
 * A regra antiga, "o item só abre", não foi descuido: foi **cuidado**, escrito
 * quando fechar um painel era o mesmo que perdê-lo de vista sem caminho de
 * volta. O cuidado continua certo. O que mudou é que agora existe a lista onde
 * o painel fechado fica escrito — o próprio menu Janela —, e é ela que torna o
 * fechar seguro.
 *
 * Três casos, e o terceiro é o que fazia o item parecer morto:
 *
 * 1. **Fechado**: reabre, no lugar de onde saiu, e traz à frente.
 * 2. **Aberto, mas atrás de outra aba**: traz à frente. Não fecha — quem foi
 *    procurar o painel no menu quer vê-lo, não sumir com ele.
 * 3. **Aberto e já à frente**: fecha. É o único caso em que clicar não tinha
 *    resposta nenhuma, e é onde a marca prometia um interruptor.
 *
 * A faixa de baixo (Linha do tempo e Curvas) continua como era: lá o item
 * escolhe a aba da faixa, e fechar é o botão da própria faixa.
 */
export function togglePanel(shell: Shell, id: string): void {
  if (DOCK_PANELS.includes(id)) {
    showPanel(shell, id);
    return;
  }
  if (shell.isPanelHidden(id)) {
    bringPanelToFront(shell, id);
    return;
  }
  if (shell.isPanelInFront(id) && !shell.layout.hidden) {
    shell.closePanelById(id);
    return;
  }
  bringPanelToFront(shell, id);
}

/**
 * **Traz o painel à vista, venha de onde vier — e NUNCA fecha.**
 *
 * É o `togglePanel` sem o caso 3, e existe porque "trazer à frente" e
 * "alternar" são duas coisas, e eram uma só: com a aba à frente, quem pedia
 * *Novo → Regra…* via a aba FECHAR (defeito 2, 19/09/2026).
 *
 * Os dois casos que ele resolve, e o segundo é o que faltava no conserto:
 *
 * 1. **Fechado** — volta para o lugar de onde saiu (`reopenPanelById`).
 *    `showPanel` sozinho **não reabre** o que foi fechado, e a primeira versão
 *    deste conserto morria aqui: a ação existia, rodava, devolvia `true`, e a
 *    aba continuava fechada.
 * 2. **Aberto** — à frente do grupo, esteja ele atrás de outra aba ou já à
 *    vista.
 */
export function bringPanelToFront(shell: Shell, id: string): void {
  if (!DOCK_PANELS.includes(id) && shell.isPanelHidden(id)) {
    shell.reopenPanelById(id);
    return;
  }
  showPanel(shell, id);
}

export function showPanel(shell: Shell, id: string): void {
  if (DOCK_PANELS.includes(id)) {
    if (shell.layout.hidden) shell.toggleChrome();
    // Este é o ÚNICO caminho que abre a faixa por conta própria, e ele é um
    // gesto do Humberto: ele escolheu o painel no menu Janela. Pedir Curvas
    // e não ver nada seria pior que nada — anotação 4.
    if (!shell.dockView.open && id !== 'linha-do-tempo') {
      shell.setDock({ ...shell.dockView, open: true });
    }
    shell.showDockPanel(id);
    return;
  }
  shell.showColumnPanel(id);
}

/**
 * "Substituir nomes…" — item 73.
 *
 * Trocar `_esq` por `_e` em vinte ossos é vinte cliques e vinte chances de
 * errar, e cada osso é citado pelos filhos, pelos slots, pelas regras e por
 * toda chave da linha do tempo.
 *
 * A janela mostra **quantos e quais** antes de qualquer coisa acontecer, e o
 * que ela vai pular e por quê: renomear em cima de um nome que já existe
 * juntaria dois ossos num só, e desfazer não teria como separá-los.
 */
export async function replaceNames(shell: Shell): Promise<void> {
  const answer = await askForm({
    title: 'Substituir nomes',
    lead: 'Troca um pedaço do nome em ossos, desenhos (slots) e regras — e em tudo o que '
      + 'os cita, inclusive nas chaves.',
    fields: [
      { id: 'de', label: 'Trocar', hint: 'O pedaço a procurar. Exemplo: _esq' },
      { id: 'para', label: 'Por', hint: 'O que entra no lugar. Exemplo: _e' },
    ],
    yesLabel: 'Trocar em todos',
    preview: (values) => {
      const de = values['de'] ?? '';
      if (de === '') return 'Escreva o pedaço a procurar.';
      const plan = renameMany(shell.doc.file, de, values['para'] ?? '');
      if (plan.renomeados.length === 0 && plan.pulados.length === 0) {
        return `Nenhum nome tem "${de}".`;
      }
      const linhas = plan.renomeados.slice(0, 6)
        .map((item) => `${item.from} → ${item.to}`);
      if (plan.renomeados.length > 6) {
        linhas.push(`… e mais ${plan.renomeados.length - 6}`);
      }
      const pulados = plan.pulados.length === 0
        ? ''
        : `  ·  ${plan.pulados.length} pulado${plan.pulados.length === 1 ? '' : 's'}: `
          + plan.pulados.map((item) => `${item.from} (${item.porque})`).join(', ');
      return `${plan.renomeados.length} a trocar: ${linhas.join(', ')}${pulados}`;
    },
  });
  if (answer === null) return;
  const de = answer['de'] ?? '';
  if (de === '') return;
  const plan = renameMany(shell.doc.file, de, answer['para'] ?? '');
  if (plan.renomeados.length === 0) {
    shell.doc.notice(`Nenhum nome com "${de}" pôde ser trocado`);
    return;
  }
  const command = new RenameMany(plan);
  shell.doc.run(command);
  const pulados = plan.pulados.length === 0
    ? ''
    : `, ${plan.pulados.length} pulado${plan.pulados.length === 1 ? '' : 's'}`;
  shell.doc.notice(`${command.count} nome${command.count === 1 ? '' : 's'} trocado${command.count === 1 ? '' : 's'}${pulados}`);
}

/** Editar → Preferências: as escolhas que valem para todo arquivo. */
export function showPrefs(shell: Shell): void {
  showOptions({
    title: 'Preferências',
    lead: 'Escolhas suas, guardadas neste navegador. Elas não vão dentro do arquivo.',
    options: [{
      id: 'toolNames',
      label: 'Mostrar nome das ferramentas',
      hint: 'A palavra ao lado do ícone, na barra da cena. Desligada, a cena fica maior '
        + '— e a dica com o nome e a tecla continua nos dois casos.',
      checked: prefs().toolNames,
    }, {
      // P19 (29/09/2026): a dica do passo seguinte, no rodapé.
      id: 'nextStep',
      label: 'Mostrar o passo seguinte',
      hint: 'No rodapé, uma frase com o próximo passo da tarefa e o caminho de clique: '
        + '"Próximo: crie os ossos — ferramenta Criar osso (B)". Desligada, o rodapé fala só da ferramenta.',
      checked: prefs().nextStep,
    }],
    onToggle: (id, on) => {
      if (id === 'toolNames') setPrefs({ toolNames: on });
      if (id === 'nextStep') setPrefs({ nextStep: on });
    },
  });
}

/**
 * **Janela → Guardar este arranjo…** — degrau 11, lote 4 (C6).
 *
 * Um campo com o nome, e a tela de agora inteira por trás. Nome repetido
 * regrava o de antes e **diz isso**; nome de arranjo de fábrica é recusado com
 * a razão escrita, em vez de sumir com o Pivô de todo mundo.
 */
export async function saveArrangementDialog(shell: Shell): Promise<void> {
  const resposta = await askForm({
    title: 'Guardar este arranjo',
    lead: 'A tela de agora — os painéis, as colunas e as larguras — fica guardada NESTA MÁQUINA, '
      + 'com o nome que você der. Ela não vai dentro do arquivo do personagem.',
    fields: [{ id: 'nome', label: 'Nome do arranjo', value: '', hint: 'Exemplo: Pintar pesos' }],
    yesLabel: 'Guardar o arranjo',
  });
  if (resposta === null) return;
  const r = saveArrangement(arrangements(), resposta['nome'] ?? '', shell.layoutSnapshot());
  if (!r.ok) {
    shell.doc.notice(r.notice);
    return;
  }
  const gravou = setArrangements(r.arranjos);
  shell.doc.notice(gravou
    ? `${r.notice} Janela → Arranjos traz de volta`
    : `${r.notice} Mas o navegador não deixou gravar: vale só até fechar o programa`);
}

/** **Janela → Apagar um arranjo…**: só os guardados; os de fábrica ficam. */
export async function deleteArrangementDialog(shell: Shell): Promise<void> {
  const guardados = savedList(arrangements());
  if (guardados.length === 0) {
    shell.doc.notice('Nenhum arranjo guardado ainda. Janela → Arranjos → Guardar este arranjo…');
    return;
  }
  const escolhido = await askPick({
    title: 'Apagar um arranjo',
    placeholder: 'Nome do arranjo',
    search: (texto) => {
      const busca = texto.trim().toLowerCase();
      return guardados
        .filter((item) => item.name.toLowerCase().includes(busca))
        .map((item) => ({ id: item.id, label: item.name, hint: 'Guardado nesta máquina' }));
    },
  });
  if (escolhido === null) return;
  const r = deleteArrangement(arrangements(), escolhido);
  if (!r.ok) {
    shell.doc.notice(r.notice);
    return;
  }
  setArrangements(r.arranjos);
  shell.doc.notice(r.notice);
}

/** Ajuda → Atalhos: a tabela, gerada dos próprios menus. */
export function showShortcuts(shell: Shell): void {
  // Lote 47: as teclas das ferramentas entram também; elas não moram em menu.
  // Lote 68: e os gestos da cena que não são menu (Espaço + arrastar).
  // Lote A1: as três saem da mesma tabela, `ui/keys.ts`, com os menus de agora.
  // Degrau 11, lote 2 (G7): a mesma tabela, agora com o lápis de trocar a
  // tecla, as trocadas marcadas e o conflito escrito (`ui/keys-dialog.ts`).
  showKeysDialog({ table: keyTable(shell.groups()) });
}

/** A versão que o Vite escreve ao montar (`vite.config.ts`); vazia nos testes. */
declare const __RECORTE_VERSAO__: string | undefined;

/** O número do "Sobre": a versão guardada, ou o do pacote quando não há (rodada 23). */
export function aboutVersion(): string {
  const guardada = typeof __RECORTE_VERSAO__ === 'string' ? __RECORTE_VERSAO__ : '';
  return guardada !== '' ? guardada : pkg.version;
}

/** Ajuda → Sobre o Recorte. */
export function showAbout(shell: Shell): void {
  void tellUser({
    title: 'Sobre o Recorte',
    lead: 'Animação 2D por ossos para jogos. Formato aberto .bone.',
    lines: [
      `Versão ${aboutVersion()}`,
      `Licença ${pkg.license}`,
      `Manual em ${MANUAL_FOLDER} — ou aperte F1`,
    ],
  });
}

/**
 * Arquivo → Abrir recente — anotação 22, lote 33.
 *
 * A lista sai numa janela com busca, e não num submenu: o submenu teria que
 * nascer e morrer a cada arquivo aberto, e o mesmo item de menu mudaria de
 * nome debaixo do dedo. Uma janela com busca é o mesmo caminho do "Virar
 * filho de…", que ele já conhece.
 */
export async function openRecent(shell: Shell): Promise<void> {
  // Doc 78, d: a pasta (o projeto) vem antes do .bone solto.
  const lista = pastasPrimeiro(recentFiles(), isRecentFolder);
  if (lista.length === 0) {
    shell.doc.notice('Nenhum arquivo aberto ainda. Use Arquivo → Abrir');
    return;
  }
  const escolhido = await askPick({
    title: 'Abrir um arquivo recente',
    placeholder: 'Nome do arquivo',
    search: (texto) => {
      const busca = texto.trim().toLowerCase();
      return lista
        .filter((item) => busca === '' || item.name.toLowerCase().includes(busca))
        .map((item) => ({
          id: item.name,
          // Lote 59: a pasta entra na mesma lista, e diz que é pasta.
          label: isRecentFolder(item.name) ? `${item.name.slice(0, -1)} (pasta)` : item.name,
        }));
    },
  });
  if (escolhido === null) return;
  if (!(await shell.confirmDiscard())) return;
  if (isRecentFolder(escolhido)) {
    const pasta = await reopenRecentFolder(escolhido);
    const nome = escolhido.slice(0, -1);
    if ('erro' in pasta) {
      shell.doc.notice(pasta.erro === 'sem-permissao'
        ? `${nome}: o navegador não deu permissão. Abra por Arquivo → Abrir pasta do projeto…`
        : pasta.erro === 'sumiu'
          ? `A pasta ${nome} não está mais onde estava. Abra por Arquivo → Abrir pasta do projeto…`
          : `${nome}: este navegador não guarda o caminho. Abra por Arquivo → Abrir pasta do projeto…`);
      return;
    }
    await shell.startInFolder(pasta.folder);
    return;
  }
  const saida = await openRecentDocument(escolhido);
  if ('erro' in saida) {
    const recado = saida.erro === 'sem-permissao'
      ? `${escolhido}: o navegador não deu permissão. Abra por Arquivo → Abrir`
      : saida.erro === 'sumiu'
        ? `${escolhido} não está mais onde estava. Abra por Arquivo → Abrir`
        : `${escolhido}: este navegador não guarda o caminho. Abra por Arquivo → Abrir`;
    shell.doc.notice(recado);
    return;
  }
  const aberto = saida.doc;
  forgetImportedImages(shell.doc);
  shell.doc.setFile(aberto.file, {
    path: aberto.path, atlases: aberto.atlases, images: aberto.images,
    skeletons: aberto.skeletons,
  });
  await adoptFolderAtlases(shell.doc);
  if (aberto.warnings.length > 0) shell.statusState.textContent = aberto.warnings[0];
}

/**
 * Arquivo → Sair.
 *
 * Fechar a aba é do navegador, e uma aba que a pessoa não abriu por script
 * ele se recusa a fechar. Então: tenta fechar, e quando o navegador recusa,
 * diz o que fazer. O aviso de arquivo sujo é o `beforeunload` de sempre.
 */
export async function quit(shell: Shell): Promise<void> {
  if (!(await shell.confirmDiscard())) return;
  shell.saveDraft(true);
  const janela = globalThis as { close?: () => void };
  try {
    janela.close?.();
  } catch {
    // Alguns navegadores estouram em vez de só recusar.
  }
  shell.doc.notice('Se a aba não fechou, feche pelo X do navegador: o trabalho está guardado');
}

/** `true` quando há osso ou desenho no arquivo para escolher. */
export function hasAnythingToSelect(shell: Shell): boolean {
  return (shell.doc.file.bones?.length ?? 0) > 0 || (shell.doc.file.slots?.length ?? 0) > 0;
}

/**
 * Editar → Selecionar tudo (`Ctrl+A`) — anotação 22.
 *
 * Todos os ossos e todos os desenhos, que é o que "tudo" quer dizer no
 * documento. As chaves têm o item próprio, **Selecionar todas as chaves**,
 * no menu Animação: são duas coisas diferentes e cada uma tem a sua porta.
 */
/** `true` quando há alguma coisa escolhida — osso, slot ou desenho. */
export function hasSelection(shell: Shell): boolean {
  const s = shell.doc.selection;
  return s.bones.length + s.slots.length + s.attachments.length > 0;
}

/**
 * **Escolher → Os filhos** e **Os pais** — lote 42, o gesto do Spriter.
 *
 * A conta é pura, do `doc/duplicate.ts`; aqui só se escolhe e se diz quantos.
 */
export function selectFamily(shell: Shell, which: 'filhos' | 'pais'): void {
  const escolha = which === 'filhos'
    ? selectChildren(shell.doc.file, shell.doc.selection)
    : selectParents(shell.doc.file, shell.doc.selection);
  if (escolha.bones.length + escolha.slots.length === 0) {
    shell.doc.notice('Escolha um osso ou um desenho primeiro');
    return;
  }
  shell.doc.select(escolha);
  const ossos = escolha.bones.length === 1 ? '1 osso' : `${escolha.bones.length} ossos`;
  shell.doc.notice(which === 'filhos'
    ? `${ossos} e ${escolha.slots.length} desenho(s): o escolhido e os filhos`
    : `${ossos}: o escolhido e os pais até a raiz`);
}

export function selectAll(shell: Shell): void {
  const bones = (shell.doc.file.bones ?? []).map((bone) => bone.name);
  const slots = (shell.doc.file.slots ?? []).map((slot) => slot.name);
  shell.doc.select({ ...emptySelection(), bones, slots });
  const quantos = bones.length + slots.length;
  shell.doc.notice(`${quantos} ${quantos === 1 ? 'item escolhido' : 'itens escolhidos'}`);
}

/**
 * Esqueleto → Novo → Imagem no slot… — anotação 22.
 *
 * O que cria o slot a partir de uma imagem **já existe**: é arrastar a
 * miniatura do painel Imagens para a cena, desde o lote 20. O que faltava
 * era a porta no menu para quem não sabe do arrasto. Ela abre o painel e põe
 * o foco na busca, com o recado do gesto no rodapé.
 */
export function newImageInSlot(shell: Shell): void {
  shell.showPanel('imagens');
  shell.doc.notice('Arraste a imagem do painel Imagens para a cena: o desenho nasce no osso escolhido');
  queueMicrotask(() => {
    const campo = shell.root?.querySelector('.imagens-busca input');
    if (campo instanceof HTMLInputElement) campo.focus();
  });
}

/**
 * **Trocar a imagem em todas as peles…** — lote 39, Spriter 7.
 *
 * Abre o painel Imagens com a troca armada e o foco na busca: a próxima
 * imagem clicada troca em toda pele que usa a mesma naquele slot.
 */
export function swapImageEverywhere(shell: Shell): void {
  const picked = shell.doc.selection.attachments[0];
  if (picked === undefined) {
    shell.doc.notice('Escolha um desenho na Árvore primeiro');
    return;
  }
  const pick = swapPickFor(shell.doc.file, picked.slot, picked.attachment);
  if (pick === null) {
    shell.doc.notice(`${picked.attachment} não tem imagem: ponto, caixa e máscara não desenham`);
    return;
  }
  shell.showPanel('imagens');
  palettePanel.armSwap(pick);
  const peles = pick.skins.length === 1 ? '1 skin' : `${pick.skins.length} skins`;
  shell.doc.notice(`Clique na imagem nova no painel Imagens: troca ${pick.from} em ${peles}`);
  queueMicrotask(() => {
    const campo = shell.root?.querySelector('.imagens-busca input');
    if (campo instanceof HTMLInputElement) campo.focus();
  });
}

// -------------------------------------------------------------------------
// Colar corpo aqui — degrau 4b (M10, spec 9.13)
// -------------------------------------------------------------------------

/**
 * A virada: grava a chave `body` no tempo de agora, na animação aberta. Com
 * um outro corpo só no projeto, cola ele sem perguntar; com vários, pergunta
 * qual numa lista, que traz também "o corpo do arquivo" (a chave `null`, a
 * volta). Sem outro corpo, diz o que falta — e não improvisa.
 */
export async function pasteBody(shell: Shell): Promise<void> {
  const doc = shell.doc;
  if (doc.animation === null) {
    shell.statusState.textContent = 'Abra uma animação primeiro: a virada é uma chave dela';
    return;
  }
  const projeto = doc.project;
  const outros = projeto instanceof Projeto ? projeto.outrosCorpos : [];
  if (outros.length === 0) {
    shell.statusState.textContent = 'Este projeto tem uma base só: não há outra base para colar';
    await tellUser({
      title: 'Nenhuma outra base no projeto',
      lead: 'Colar base aqui troca a base da animação dali em diante (o homem vira lobisomem). '
        + 'Para isso o projeto precisa de mais de uma base:',
      lines: [
        'Abra a pasta de um projeto que tenha mais de uma base (Arquivo → Abrir pasta do projeto…). Quem lista as bases é o manifest.json da pasta.',
        'Cada base é um .bone ao lado do outro, na raiz da pasta.',
      ],
    });
    return;
  }
  const nome = (uri: string): string => (projeto instanceof Projeto ? projeto.nameOf(uri) : uri);
  let escolhido: string | null = outros[0]!;
  if (outros.length > 1 || doc.body !== null) {
    const opcoes = [
      ...outros.map((uri) => ({ id: uri, label: nome(uri), aside: uri, hint: 'base do projeto' })),
      { id: '', label: 'A base do arquivo', aside: doc.name, hint: 'a volta: dali em diante vale a base desta animação' },
    ];
    const resposta = await askPick({
      title: 'Colar base aqui',
      placeholder: 'Qual base vale daqui em diante?',
      search: (text) => opcoes.filter((o) => o.label.toLowerCase().includes(text.toLowerCase())),
    });
    if (resposta === null) return;
    escolhido = resposta === '' ? null : resposta;
  }
  const quando = roundTime(doc.time);
  const frase = pasteBodyHere(doc, escolhido, escolhido === null ? '' : nome(escolhido));
  shell.statusState.textContent = frase ?? 'A animação aberta não está no arquivo';
  // P12 (29/09/2026): a chave da virada não se vê na cena, e em Resumo era um
  // losango e mais nada. A linha do tempo abre os Detalhes e rola até ela. A
  // frase do rodapé continua a de cima, que já diz o corpo e o tempo.
  if (frase !== null) revealKey({ target: bodyTarget(), time: quando });
}
