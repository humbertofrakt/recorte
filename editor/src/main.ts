/**
 * Entry point (owner A).
 *
 * Order matters. The viewport, the five tools and the three panels register
 * themselves as a side effect of being imported, so they are all loaded before
 * the shell asks the registries what to show. Static imports, not dynamic
 * ones: a missing module must fail loudly at build time, not turn into a blank
 * window nobody can explain.
 */

/*
 * Todo o estilo dos painéis, importado aqui em cima.
 *
 * Antes, os cinco CSS dos painéis entravam por <link> criado pelo JavaScript
 * na hora em que o painel montava — e <link> criado por script NÃO bloqueia a
 * pintura. Existia portanto uma janela em que a estrutura já estava na tela e
 * os painéis ainda estavam sem estilo, que é o que a tela-final.png mostrava.
 * Pior: sem CSS o texto perde o espaço entre as palavras ("Ossos18",
 * "idle2,00 s"), e é isso que sai ao copiar e é isso que um leitor de tela
 * fala. Importado como módulo, o estilo entra antes do primeiro desenho.
 */
import './panels/panels.css';
// Lote A6: um CSS por painel, cortados do `panels.css`. Esta ordem é a que
// mantém cada regra vencendo como antes — conferido regra por regra e por foto.
import './panels/properties.css';
import './panels/animations.css';
import './panels/draw-order.css';
import './panels/tree.css';
import './panels/skins.css';
import './panels/palette.css';
import './panels/pivot-panel.css';
import './panels/particles-panel.css';
import './panels/rules.css';
import './panels/history.css';
import './panels/quick-sheet.css';
import './panels/mesh-panel.css';
import './panels/view-panel.css';
import './panels/dopesheet.css';
import './panels/graph.css';
import './panels/preview.css';

import {
  clearAllDrafts, describeDraftTime, draftLabels, draftsToOffer, keepCurrentDraft, readDraft, takeKeptDraft,
} from './doc/rascunho.js';
import { switchAnimation } from './anim/transport.js';
import type { DraftStorage } from './doc/rascunho.js';
import { markStylesheetsPreloaded } from './panels/dom.js';
import { Doc } from './doc/document.js';
import { Projeto } from './doc/projeto.js';
import { createEmptyFile } from './doc/new-file.js';
import { fetchDocument, forgetHandle } from './io/open-save.js';
// Rodada 45, lote 5: o exemplo não herda a pasta do projeto de antes.
import { forgetProjectFolder } from './io/project-folder.js';
import { registerAction, runAction } from './ui/actions.js';
import { registerCoreActions } from './ui/register-actions.js';
import { askChoice, tellUser } from './ui/dialog.js';
import { mountShell } from './ui/shell.js';
import type { Shell } from './ui/shell.js';

// Registers the viewport panel and the tools "Selecionar", "Mover", "Girar",
// "Escalar" and "Criar osso".
import { onActiveToolChange, setActiveTool } from './viewport/index.js';
// Registers the panels "Árvore", "Propriedades" and "Animações".
import './panels/index.js';

// The example that opens on the first run. The `?url` asks the bundler for the
// address of the file, not its contents: a `.json` imported without it would be
// turned into a module, and `fetch` would get JavaScript back.
import exampleBoneUrl from '../../formato/exemplos/heroi.bone?url';
import exampleAtlasUrl from '../../formato/exemplos/heroi.atlas.json?url';
import examplePageUrl from '../../formato/exemplos/heroi.png?url';
// The sword in the hero's hand is a whole skeleton of its own (spec 7.11).
import exampleSwordUrl from '../../formato/exemplos/espada.bone?url';
import { EXAMPLE_FIRST_STEP } from './viewport/welcome-model.js';
// A oficina: o exemplo que mostra tudo junto (05/11/2026).
import { OFICINA_PRIMEIRO_PASSO, oficinaFolder } from './io/oficina.js';

const EXAMPLE_BONE = exampleBoneUrl;
/** O nome do exemplo, o do arquivo: o endereço do empacotador vem carimbado. */
const EXAMPLE_NAME = 'heroi.bone';
const EXAMPLE_ASSETS: Record<string, string> = {
  'heroi.atlas.json': exampleAtlasUrl,
  'heroi.png': examplePageUrl,
  'espada.bone': exampleSwordUrl,
};

function exampleUrl(name: string): string {
  const key = name.split(/[\\/]/).pop() ?? name;
  return EXAMPLE_ASSETS[key] ?? key;
}

/** Keeps the shell's idea of the active tool and the viewport's the same. */
function bridgeTools(shell: Shell, doc: Doc): void {
  shell.onToolChange((tool) => {
    if (tool !== null) setActiveTool(tool.id, doc);
  });
  onActiveToolChange((id) => shell.setTool(id));
  // Both sides start on the same tool.
  const first = shell.tool;
  if (first !== null) setActiveTool(first.id, doc);
}

async function start(): Promise<void> {
  // O estilo dos painéis já entrou pelos imports do topo deste arquivo.
  // Nenhum painel precisa ligar folha por conta própria.
  markStylesheetsPreloaded();

  const root = document.getElementById('app');
  if (root === null) throw new Error('A página não tem o elemento #app.');

  const doc = new Doc(createEmptyFile());
  // Degrau 4b: o documento vive num projeto — de um corpo só, até uma pasta
  // com `manifest.json` trazer mais. A cena e os painéis continuam ouvindo
  // este `doc`; o projeto é quem sabe dos outros corpos.
  const projeto = new Projeto(doc);
  // Lote A2: as ações que não precisam de painel existem desde já, com
  // qualquer aba fechada. Ver `ui/actions-table.ts`.
  registerCoreActions(doc);
  const shell: Shell = mountShell(doc, root);
  bridgeTools(shell, doc);

  // A bridge for modules that need the shell but must not import it, until the
  // contract owns the active tool. See editor/PEDIDOS-CONTRATO.md.
  (globalThis as unknown as { recorte?: unknown }).recorte = { doc, shell, projeto };

  /**
   * Abrir o herói — a porta que as boas-vindas do documento vazio oferecem
   * (anotação 24, lote 36).
   *
   * Registrada aqui porque é o `main.ts` que sabe onde o exemplo mora: os
   * endereços vêm do empacotador, e nenhum painel tem como adivinhá-los.
   */
  const abrirExemplo = async (): Promise<void> => {
    // Rodada 50, lote 2 (doc 98): o herói abria POR CIMA de mudanças não
    // salvas, sem perguntar — a única porta de abrir que não passava pela
    // janela das mudanças (rodada 45, lote 5).
    if (!(await shell.confirmDiscard())) return;
    try {
      const opened = await fetchDocument(EXAMPLE_BONE, exampleUrl);
      // Rodada 45, lote 5 (prova final): com a pasta de outro projeto aberta, o
      // herói a herdava, e o Ctrl+S gravava heroi.bone DENTRO dela, calado.
      // O exemplo começa sem pasta e sem arquivo: o Salvar pergunta onde.
      forgetHandle();
      forgetProjectFolder(doc);
      // A2 (29/09/2026): o nome é o do ARQUIVO, e não o do endereço. No
      // programa montado o empacotador carimba o endereço (`heroi-DUlefYnW.bone`),
      // e esse carimbo virava o título da janela e o nome de toda exportação.
      doc.setFile(opened.file, {
        path: EXAMPLE_NAME, atlases: opened.atlases, images: opened.images,
        skeletons: opened.skeletons,
      });
      // Rodada 46, lote 5 (doc `66`, T1): o herói abria a 100%, com 140 px de
      // altura numa cena de 1366 px. Abre ajustado; o recado do "Abriu" vem depois.
      runAction('ajustar');
      // Lote 68: o exemplo abre em Montagem. Abrir um arquivo seu continua
      // entrando na primeira animação (o pedido de 10/09, `openFirstAnimation`).
      switchAnimation(doc, null);
      // Prova de pessoa (05/11/2026): o herói abre na base, com o ▶ cinza, e
      // quem nunca abriu o programa clicava no ▶ e nada acontecia. O rodapé
      // diz o primeiro passo.
      doc.notice(EXAMPLE_FIRST_STEP);
    } catch (error) {
      console.warn('O exemplo não abriu:', error);
      doc.notice('O exemplo não veio junto com este programa');
    }
  };
  registerAction('abrir-exemplo', { run: () => { void abrirExemplo(); } });

  // A oficina (05/11/2026): o exemplo que mostra tudo junto, como pasta de
  // projeto — pela mesma porta da pasta solta na janela.
  const abrirOficina = async (): Promise<void> => {
    const pasta = oficinaFolder();
    if (pasta === null) { doc.notice('A oficina não veio junto com este programa'); return; }
    await shell.openDroppedFolder(pasta);
    if (projeto.corpos.size > 1) {
      runAction('ajustar');
      // Depois dos recados da abertura (as bases se remontam): o primeiro passo fica.
      setTimeout(() => { shell.statusState.textContent = OFICINA_PRIMEIRO_PASSO; }, 600);
    }
  };
  registerAction('abrir-oficina', { run: () => { void abrirOficina(); } });

  // Lote 68 (roteiro dos 30 minutos, passo 1): o programa abre VAZIO, em
  // Montagem, com o Transformar na mão, como o Spriter abre um projeto novo.
  // O herói fica em Arquivo → Abrir o herói (exemplo) e nas boas-vindas.
  void offerDraft(doc);
}

/**
 * Oferece de volta o trabalho que a aba anterior não chegou a salvar.
 *
 * Só pergunta: nada é aberto por conta própria, porque abrir por cima do que a
 * pessoa esperava ver assusta mais do que ajuda.
 *
 * **A2 — degrau 11, lote 7 (18/09/2026).** A pergunta era um `confirm` do
 * navegador, e ali os botões são **OK** e **Cancelar**: duas palavras que não
 * dizem o que vai acontecer. Pior, **Cancelar APAGAVA o rascunho** — o botão
 * que em toda parte quer dizer *"não faça nada"* era o que destruía o
 * trabalho, sem volta. Agora a janela é nossa, cada botão diz o que faz, e
 * **fechar a janela guarda**: o rascunho fica e a pergunta volta na próxima
 * abertura. Quem quiser jogá-lo fora diz isso com todas as letras.
 */
async function offerDraft(doc: Doc): Promise<void> {
  let storage: DraftStorage | null = null;
  try {
    storage = globalThis.localStorage ?? null;
  } catch {
    return;
  }
  if (storage === null) return;

  // P55 (29/09/2026): o atual E os guardados. "Agora não" guardava num lugar
  // que o próximo trabalho ocupava; agora cada recusado fica na lista.
  const rascunhos = draftsToOffer(storage);
  if (rascunhos.length === 0) return;
  const atual = readDraft(storage);
  const um = rascunhos.length === 1;
  const primeiro = rascunhos[0]!;
  const nomes = draftLabels(rascunhos);

  const escolha = await askChoice({
    title: um ? 'Havia trabalho não salvo' : `Havia ${rascunhos.length} trabalhos não salvos`,
    lead: um
      ? `O programa guardou sozinho o que estava em "${primeiro.name}", de ${describeDraftTime(primeiro.savedAt)}. O que fazer com ele?`
      : 'O programa guardou sozinho estes trabalhos. Nenhum se perde até você mandar apagar.',
    options: [
      ...rascunhos.map((rascunho, i) => ({
        id: `recuperar:${i}`,
        label: um ? 'Recuperar este trabalho' : `Recuperar ${nomes[i]}`,
        hint: 'Abre o rascunho como ele estava. O arquivo no disco não é tocado até você salvar.',
      })),
      {
        id: 'guardar',
        label: um ? 'Agora não — guardar o rascunho' : 'Agora não — guardar os rascunhos',
        hint: 'Começa como sempre. O que está aqui fica guardado, e a pergunta volta da próxima vez — '
          + 'mesmo que você mexa em outro trabalho.',
      },
      {
        id: 'apagar',
        label: um ? 'Apagar o rascunho' : 'Apagar os rascunhos',
        hint: um ? 'Joga este trabalho fora. Não tem volta.' : 'Joga TODOS estes trabalhos fora. Não tem volta.',
        danger: true,
      },
    ],
    // Esc, ou clicar fora, é "agora não". Fechar NUNCA apaga.
    cancelId: 'guardar',
  });
  if (escolha === 'apagar') {
    clearAllDrafts(storage);
    return;
  }
  if (escolha === 'guardar') {
    // P55: uma CÓPIA vai para os guardados, e o trabalho novo não a alcança.
    if (!keepCurrentDraft(storage)) {
      void tellUser({
        title: 'O rascunho não pôde ser guardado à parte',
        lead: 'O navegador não deixou gravar (sem espaço, ou armazenamento negado). O rascunho '
          + 'continua no lugar de sempre, mas o próximo trabalho que você mexer vai gravar por cima dele. '
          + 'Para não perder: recupere agora e salve com Ctrl+S.',
      });
    }
    return;
  }
  const indice = Number(escolha.slice('recuperar:'.length));
  const escolhido = rascunhos[indice];
  if (escolhido === undefined) return;
  // O atual abre direto; um guardado troca de lugar com o atual, e nada some.
  const rascunho = atual !== null && escolhido === rascunhos[0] && atual.savedAt === escolhido.savedAt
    ? escolhido
    : takeKeptDraft(storage, escolhido.savedAt) ?? escolhido;
  try {
    const file = JSON.parse(rascunho.json) as Parameters<Doc['setFile']>[0];
    // QA 04/11/2026 (D4): o recuperado não está no disco — nasce "não salvo".
    doc.setFile(file, { path: rascunho.path, atlases: [], images: new Map(), unsaved: true });
  } catch {
    // O rascunho quebrado NÃO é apagado sem avisar: quem apaga é quem escolhe.
    void tellUser({
      title: 'O rascunho não abriu',
      lead: 'O texto guardado não é um arquivo válido. Ele continua guardado, e a pergunta volta '
        + 'na próxima vez — para apagar, escolha "Apagar o rascunho".',
    });
  }
}

void start();
