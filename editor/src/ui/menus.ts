/**
 * O que está em cada menu, como dado (dono A).
 *
 * O `shell` precisa de um navegador para desenhar um menu, mas *o que* o menu
 * oferece é uma lista simples, e uma lista simples um teste lê sem navegador
 * nenhum. Por isso as entradas moram aqui e o `shell` só as vira botões.
 *
 * Cada entrada diz o que faz em palavras e carrega o atalho na mesma coluna,
 * porque um item que só existe como ícone ou como tecla é um item que muita
 * gente nunca encontra. A ordem e os nomes vêm de
 * `documentos/projeto do programa/05 O DESENHO DOS MENUS 2026-10-04.md`,
 * aprovado pelo Humberto e construído na rodada 6 (05/10/2026): doze menus —
 * Arquivo · Editar · Imagens · Base · Malha e regras · Animação · Skins ·
 * Entidades · Partículas · Exibir · Janela · Ajuda —, na ordem do trabalho,
 * como no Spriter, e um menu por tipo de coisa, como no Photoshop. Antes eram
 * sete, do `PROJETO DO MENU 2026-09-08`.
 *
 * O menu nunca esconde um botão: ele chama a MESMA função que o botão chama,
 * pelo registro de `ui/actions.ts`. Entrada cuja função ainda não existe
 * aparece cinza, com a dica do lote em que ela chega, para o mapa inteiro do
 * programa ficar visível desde já.
 */

import type { ViewSettings } from '../viewport/onion.js';
import type { HandleSpace, CompensationFlags } from '../viewport/tools/space.js';
import { arrangementHint, factoryArrangements } from './arrangements.js';
import { CONTEXTS } from './contexts.js';

// ---------------------------------------------------------------------------
// Os tipos de uma entrada
// ---------------------------------------------------------------------------

/**
 * Uma entrada de menu.
 *
 * `action` é o nome da ação no registro, nunca um rótulo: o rótulo muda de
 * língua e de humor, o nome da ação não. `children` faz submenu. `hint` é a
 * frase que explica por que a entrada está cinza.
 */
export interface MenuEntry {
  label: string;
  shortcut?: string;
  action: string;
  /** `false` deixa a entrada cinza. Relido toda vez que o menu abre. */
  enabled: boolean;
  /** Liga-desliga: `true` desenha a marca ao lado do nome. */
  checked?: boolean;
  /** Por que está cinza, em uma frase. Vira a dica do botão. */
  hint?: string;
  children?: MenuItem[];
}

/** A linha fina que separa dois blocos dentro de um menu. */
export interface MenuSeparator {
  separator: true;
}

export type MenuItem = MenuEntry | MenuSeparator;

export function isSeparator(item: MenuItem): item is MenuSeparator {
  return (item as MenuSeparator).separator === true;
}

/** Um menu da barra: o nome que se lê em cima e o que cai dele. */
export interface MenuGroupDef {
  label: string;
  entries: MenuItem[];
}

const SEP: MenuSeparator = { separator: true };

/** A dica de uma entrada que ainda não tem função. Sempre diz onde ela chega. */
/**
 * O que SAIU do menu, e por quê — anotação 22, lote 33.
 *
 * A regra da casa passou a ser: **nenhum item de menu fica cinza para sempre.**
 * Ou ele funciona, ou ele sai. Uma porta cinza com a dica "vem no lote 9" é uma
 * promessa quebrada toda vez que o menu abre, e eram dez delas — de lotes 4, 6,
 * 7, 9 e 12, todos já passados.
 *
 * Nove viraram função no lote 33. O décimo saiu, e está escrito aqui para
 * ninguém achar que foi esquecimento. `auditMenus` recusa `enabled: false` fixo
 * junto com uma dica de "vem no lote", então isto não volta sozinho.
 */
export const MOVED_OUT: ReadonlyArray<{ label: string; why: string }> = Object.freeze([
  {
    label: 'Novo → Esqueleto filho…',
    why: 'Um esqueleto filho precisa do encaixe por nome (socket) para servir '
      + 'de alguma coisa: sem ele, criar um slot com outro arquivo dentro é '
      + 'um item que ninguém consegue usar. Volta ao menu no lote do socket, '
      + 'que tem plano próprio. Até lá o formato já o suporta e o runtime já o '
      + 'desenha: o que não existe é a porta.',
  },
]);

// ---------------------------------------------------------------------------
// O que os menus precisam saber do programa agora
// ---------------------------------------------------------------------------

/** O que o menu "Arquivo" precisa saber. */
export interface FileMenuState {
  /**
   * `true` quando este documento tem imagens importadas para reempacotar.
   * Nenhum menu lê mais desde o lote 62 (o Reempacotar virou o Salvar); o campo
   * fica para quem monta o estado não precisar mudar.
   */
  canRepack: boolean;
}

/** O que o menu "Editar" precisa saber. */
export interface EditMenuState {
  canUndo: boolean;
  undoLabel: string | null;
  canRedo: boolean;
  redoLabel: string | null;
}

/** O que o menu "Exibir" precisa saber: as mesmas caixas do painel Exibição. */
export type ViewMenuState = Pick<
  ViewSettings,
  'bones' | 'boneNames' | 'boundingBoxes' | 'points' | 'meshes' | 'edges' | 'weights'
  | 'grid' | 'rulers' | 'axes' | 'drawings' | 'clippings' | 'hoverNames'
> & Partial<Pick<ViewSettings, 'showGuides' | 'lockGuides'>>
  & { onion: { enabled: boolean }; cleanView: unknown };

/** O que o menu "Esqueleto" precisa saber. */
export interface SkeletonMenuState {
  lockBones: boolean;
  lockDrawings: boolean;
  space: HandleSpace;
  compensation: CompensationFlags;
  canRepack: boolean;
}

/** O que o menu "Animação" precisa saber. */
export interface AnimationMenuState {
  /** `true` quando há uma animação aberta: com a base aberta quase tudo fica cinza. */
  animating: boolean;
  /** Repetir ligado na animação aberta. */
  loop: boolean;
}

/**
 * As dicas dos dois de Chavear — degrau 4a, M6. Com "editar sempre grava",
 * chavear à mão serve para **proteger a pose**: gravar o que NÃO se mexeu,
 * para a próxima chave não levar junto. Os Key selected e Key all do Spriter.
 */
export const KEY_HINTS = Object.freeze({
  chavear: 'Protege a pose: grava uma chave do escolhido no tempo atual, mesmo sem mexer',
  tudo: 'Protege a pose: grava uma chave de todas as linhas da animação no tempo atual',
  base: 'Com a base aberta, mexer já grava na base. Abra uma animação para gravar chave',
});

/** Um arranjo com nome, como o menu Janela o mostra — degrau 11, lote 4. */
export interface ArrangementItem {
  id: string;
  name: string;
  factory: boolean;
  hint?: string;
}

/** O que o menu "Janela" precisa saber: qual painel está aberto. */
export interface WindowMenuState {
  /** Aberto por id de painel. Ausente conta como aberto. */
  open: Readonly<Record<string, boolean>>;
  /**
   * Os arranjos com nome (C6) — degrau 11, lote 4. Os dois de fábrica vêm
   * primeiro; os guardados nesta máquina, depois. Ausente = só os de fábrica,
   * que é o estado neutro de que a tabela de ações sai.
   */
  arrangements?: readonly ArrangementItem[];
}

/** Tudo o que os sete menus precisam saber, de uma vez. */
export interface MenuState
  extends FileMenuState, EditMenuState, SkeletonMenuState, AnimationMenuState, WindowMenuState {
  view: ViewMenuState;
}

/**
 * O estado neutro dos menus: nada aberto, nada desfeito, nada trancado.
 *
 * A TECLA e a AÇÃO de uma entrada não mudam com o estado — só o nome
 * ("Desfazer Mover osso") e o cinza. As tabelas de `ui/keys.ts` e de
 * `ui/actions-table.ts` saem daqui.
 */
export const NEUTRAL_MENU_STATE: MenuState = Object.freeze({
  canRepack: false,
  canUndo: false,
  undoLabel: null,
  canRedo: false,
  redoLabel: null,
  view: {
    bones: true, boneNames: false, boundingBoxes: true, points: true, meshes: true, edges: true,
    weights: false, grid: true, rulers: true, axes: true, drawings: true, clippings: true,
    hoverNames: true, showGuides: true, lockGuides: false, onion: { enabled: false }, cleanView: null,
  },
  lockBones: false,
  lockDrawings: false,
  space: 'local',
  compensation: { children: false, drawings: false, boxes: false },
  animating: true,
  loop: false,
  open: {},
}) as MenuState;

// ---------------------------------------------------------------------------
// Arquivo
// ---------------------------------------------------------------------------

/**
 * O menu "Arquivo".
 *
 * A ordem é a do dia de trabalho: fazer ou abrir um arquivo, salvar, salvar
 * noutra forma, e depois trazer coisa de fora. Importar e Exportar viraram
 * submenu porque eram seis linhas seguidas quase iguais, e seis linhas quase
 * iguais ninguém lê — vira uma linha com três dentro.
 *
 * "Reempacotar atlas" saiu daqui e foi para o menu Esqueleto: é coisa do
 * esqueleto, não do arquivo. O Live2D faz igual.
 */
export function fileMenu(_state: FileMenuState = { canRepack: false }): MenuItem[] {
  return [
    // Degrau 10 (P3): Novo, Abrir e Salvar falam de **projeto e corpo**. O
    // projeto é a caixa (BASE §15); dentro dela moram os corpos e as entidades.
    //
    // **A ordem do trabalho** — rodada final, P33 e P41 (29/09/2026), o c2 do
    // `ONDE FICA CADA BOTAO`: abrir → **importar** → salvar → **exportar**. A
    // arte ENTRA antes de salvar; ela vinha depois, e quem procurava por onde
    // trazer a arte lia seis linhas de salvar antes.
    {
      // Rodada 7: pede a pasta antes, como o Spriter (`File / New Project`).
      label: 'Novo projeto…', shortcut: 'Ctrl+N', action: 'novo', enabled: true,
      hint: 'Pede a pasta do projeto e começa nela, com uma base vazia. O Salvar grava ali',
    },
    {
      label: 'Abrir projeto…', shortcut: 'Ctrl+O', action: 'abrir', enabled: true,
      hint: 'Um .bone, .boneb ou .bonez. O arquivo aberto é a base do projeto',
    },
    // Cinza enquanto a lista está vazia — isso é ESTADO, e o estado muda no
    // primeiro arquivo aberto. Não é a porta cinza para sempre da anotação 22.
    // P41 (b8): junto do "Reabrir o fechado", que é o outro "o de antes".
    {
      label: 'Abrir recente…',
      action: 'abrir-recente',
      enabled: true,
      hint: 'Os arquivos que você abrir ou salvar aparecem aqui',
    },
    // "Reabrir o fechado" (item 105) não é o mesmo que "Abrir recente": ele
    // traz de volta o RASCUNHO, o trabalho que a aba tinha ao morrer, e não um
    // arquivo do disco. É a rede que o `doc/rascunho.ts` já vinha estendendo
    // sem que houvesse porta para chegar nela.
    { label: 'Reabrir o fechado', action: 'reabrir', enabled: true, hint: 'Traz de volta o trabalho que estava aberto quando a aba fechou, guardado sozinho a cada poucos segundos' },
    // O exemplo, pela porta do menu — lote 36. A tela de boas-vindas do
    // documento vazio oferece o mesmo botão, mas ela some assim que o trabalho
    // começa, e quem quer olhar o herói de novo não tem como pedir.
    { label: 'Abrir o herói (exemplo)', action: 'abrir-exemplo', enabled: true, hint: 'O personagem de exemplo, montado e animado, para olhar por dentro' },
    SEP,
    // **A pasta é a arte, e a arte tem o seu bloco** — P41 (29/09/2026). Lote
    // 59, plano pasta do projeto: começar como o Spriter, abrindo a pasta das
    // imagens. Elas ficam na aba Imagens, e nada entra na cena sozinho. O chat
    // H põe aqui "Recarregar a pasta" e "Trocar pasta de origem…".
    {
      label: 'Abrir pasta do projeto…',
      action: 'abrir-pasta',
      enabled: true,
      hint: 'A pasta de trabalho: as imagens aparecem na aba Imagens, por subpasta, e o '
        + 'manifest.json (se houver) traz as bases e as entidades de volta',
    },
    // "Recarregar a pasta" e "Trocar pasta de origem…" foram para o menu
    // Imagens (rodada 6, 05/10/2026): são da arte, e a arte ganhou menu.
    SEP,
    // P41: o Importar espelha o Exportar. Primeiro o que traz ARTE de outro
    // programa; depois, separado, o que traz pedaço de OUTRO BONECO. Quem
    // procura "importar" acha num lugar só.
    {
      label: 'Importar',
      action: 'importar',
      enabled: true,
      hint: 'Traz arte e animação de fora: de outro programa, do Photoshop, ou de outra base',
      children: [
        {
          label: 'De outro programa…', action: 'importar-programa', enabled: true,
          hint: 'Pede a PASTA do projeto do Spriter, do Spine ou do DragonBones; as imagens das subpastas entram junto',
        },
        { label: 'PSD…', action: 'importar-psd', enabled: true, hint: 'Cada camada do Photoshop vira um desenho, no lugar exato em que estava' },
        // Lote 45: a camada `ossos` do PSD vira esqueleto.
        {
          label: 'PSD com ossos…', action: 'importar-psd-ossos', enabled: true,
          hint: 'Como o PSD…, e a camada "ossos" do arquivo vira o esqueleto',
        },
        // "Imagens…" saiu no lote 59: "no Spriter não existe importar imagens".
        // As imagens chegam por Abrir pasta…, ou soltas na janela, e ficam na
        // aba Imagens até alguém arrastar.
        SEP,
        {
          label: 'Animações, de outra base…',
          action: 'importar-animacao',
          enabled: true,
          hint: 'Traz um .bone de animações; a lista do que esta base não tem aparece antes de aplicar. '
            + 'Era Animação → Importar animação…',
        },
        {
          label: 'Skin, de outro boneco…',
          action: 'importar-pele',
          enabled: true,
          hint: 'Traz um .bone de skin: ela entra na lista de Feitas, com os ossos dela. '
            + 'Era Esqueleto → Importar pele…',
        },
      ],
    },
    // "Trazer para o projeto ▸" saiu (rodada 6): os dois de dentro foram para
    // Base ("Trazer uma base de fora…") e Entidades ("Trazer entidade de
    // fora…"), e o submenu ficou vazio. Submenu vazio a casa não aceita.
    SEP,
    {
      label: 'Salvar', shortcut: 'Ctrl+S', action: 'salvar', enabled: true,
      hint: 'Grava a pasta inteira: o .bone, o atlas e as imagens em uso; com mais de uma base ou com entidade, '
        + 'um .bone para cada e o manifest.json',
    },
    {
      label: 'Salvar como…', shortcut: 'Ctrl+Shift+S', action: 'salvar-como', enabled: true,
      hint: 'Uma cópia: numa pasta nova, com o atlas, as imagens e as entidades, ou só o .bone',
    },
    {
      label: 'Salvar a entidade editada…', action: 'salvar-entidade', enabled: true,
      hint: 'Para um arquivo que veio de fora: Novo, cópia neste projeto, ou Por cima, no de origem',
    },
    SEP,
    // **Exportar num lugar só** — P33, bandeira 1 (29/09/2026). Moravam em
    // quatro menus: aqui, o bloco Salvar, Esqueleto e Animação. O Spine tem um
    // diálogo só, o Spriter um item só em File. Dois blocos, sem título: em
    // cima o que vai PARA O JOGO, embaixo o que vai PARA OUTRO BONECO. O nome
    // de cada item diz o destino (N-2: "Imagem…" não dizia GIF nem PNG), e a
    // dica guarda o nome velho, que a Paleta de comandos também acha.
    {
      label: 'Exportar',
      action: 'exportar',
      enabled: true,
      hint: 'Leva para fora: imagem, vídeo, glTF, binário, pacote, uma base para o jogo, ou animação e skin para outra base',
      children: [
        {
          label: 'GIF, PNG, folha, vídeo…', action: 'exportar-imagem', enabled: true,
          hint: 'A animação em GIF, sequência de PNG, folha de sprites ou vídeo. Era Imagem…',
        },
        {
          label: 'Uma imagem por skin…', action: 'exportar-pele', enabled: true,
          hint: 'A mesma exportação de imagem, uma vez para cada skin. Era Por skin…',
        },
        {
          label: 'glTF, para programa 3D…', action: 'exportar-gltf', enabled: true,
          hint: 'Um .glb com os ossos e as animações. Era glTF…',
        },
        {
          label: 'Salvar como binário…', action: 'salvar-binario', enabled: true,
          hint: 'O mesmo .bone num .boneb, menor, para o jogo ler mais rápido',
        },
        {
          label: 'Salvar como pacote…', action: 'salvar-pacote', enabled: true,
          hint: 'Zipa o projeto num .bonez só: as bases, as entidades, o atlas e as imagens',
        },
        // Degrau 10, 10.1 (P2) e 10.3 (E4).
        {
          label: 'Entregar uma base…', action: 'entregar-corpo', enabled: true,
          hint: 'Uma base sozinha para o jogo, com o atlas fatiado: só as imagens que ela usa',
        },
        SEP,
        // Degrau 12, parte `B` (18/09/2026): a biblioteca. Sai um `.bone` com o
        // `rig` gerado do conteúdo, e entra pelo `assets.animations` (§2.8).
        {
          label: 'Animações, para outra base…',
          action: 'exportar-animacao',
          enabled: true,
          hint: 'Grava as animações marcadas num .bone com o contrato de rig, para entrarem noutra base. '
            + 'Era Animação → Exportar animação…',
        },
        // Degrau 9 (18/09/2026), I12 e I13. A pele de fora é o modelo do Dota 2.
        {
          label: 'Skin, para outro boneco…',
          action: 'exportar-pele-arquivo',
          enabled: true,
          hint: 'Grava a skin do lápis num .bone com os ossos que ela traz, para entrar noutra base. '
            + 'Era Esqueleto → Exportar pele…',
        },
      ],
    },
    {
      label: 'Repetir a última exportação', shortcut: 'Ctrl+Shift+E', action: 'repetir-exportacao', enabled: true,
      hint: 'Exporta de novo, com as mesmas escolhas da última vez, sem abrir a janela',
    },
    SEP,
    { label: 'Configurações do projeto…', action: 'configuracoes', enabled: true, hint: 'Quadros por segundo, cor de fundo, grade e o tempo de mistura entre animações' },
    SEP,
    { label: 'Sair', action: 'sair', enabled: true, hint: 'Fecha o programa. O trabalho não salvo fica guardado e volta pelo Reabrir o fechado' },
  ];
}

// ---------------------------------------------------------------------------
// Editar
// ---------------------------------------------------------------------------

/**
 * O menu "Editar". Cada entrada de desfazer nomeia o passo que ela desfaz, para
 * se ler "Desfazer Mover osso" e não só "Desfazer".
 */
/**
 * O menu "Editar" lê também se há uma animação aberta — P41 (29/09/2026).
 * "Copiar a pose do escolhido" e "Colar espelhado" vieram de Animação para cá,
 * e continuam cinza com a base aberta. Ausente conta como aberta, como no
 * estado neutro. Fica fora de `EditMenuState` para não brigar com o
 * `animating` obrigatório de `AnimationMenuState` dentro de `MenuState`.
 */
export function editMenu(state: EditMenuState & { animating?: boolean }): MenuItem[] {
  /** Uma entrada que só faz sentido com uma animação aberta. */
  const naAnimacao = (label: string, action: string, hint: string): MenuEntry => ({
    label, action, enabled: state.animating ?? true,
    hint: (state.animating ?? true) ? hint : 'Abra uma animação primeiro',
  });
  return [
    {
      label: state.canUndo && state.undoLabel !== null ? `Desfazer ${state.undoLabel}` : 'Desfazer',
      shortcut: 'Ctrl+Z',
      action: 'desfazer',
      enabled: state.canUndo,
    },
    {
      label: state.canRedo && state.redoLabel !== null ? `Refazer ${state.redoLabel}` : 'Refazer',
      shortcut: 'Ctrl+Y',
      action: 'refazer',
      enabled: state.canRedo,
    },
    SEP,
    { label: 'Copiar', shortcut: 'Ctrl+C', action: 'copiar', enabled: true },
    { label: 'Colar', shortcut: 'Ctrl+V', action: 'colar', enabled: true },
    // Rodada 47, lote 5 (nota do doc 54): o Colar espelhado mora ao lado do
    // Colar. No submenu Pose ele ficava a dois cliques do Copiar que o enche.
    naAnimacao('Colar espelhado', 'colar-espelhado',
      'Cola a pose trocando esquerda e direita pelo nome. Era Editar → Pose → Colar espelhado'),
    { label: 'Recortar chaves', shortcut: 'Ctrl+X', action: 'recortar-chaves', enabled: true },
    SEP,
    // **Copiar e colar a pose, num degrau só** — b12 (P33). No Spriter todo
    // copiar e colar mora em Edit; aqui dois deles moravam em Animação.
    // "Copiar a ordem na animação" foi para Base, junto da ordem (b11).
    // Rodada 6 (05/10/2026): os quatro num submenu, **Pose ▸** — as teclas
    // continuam valendo de dentro dele.
    {
      label: 'Pose',
      action: 'pose',
      enabled: true,
      children: [
        { label: 'Copiar a pose inteira', shortcut: 'Ctrl+Shift+C', action: 'copiar-pose', enabled: true },
        // Item 9: comando PRÓPRIO, nunca `copiar-pose` mudando de sentido
        // conforme a seleção — "Key all" e "Key selected" são dois botões no
        // Spriter, nunca um só.
        naAnimacao('Copiar a pose do escolhido', 'copiar-pose-escolhido',
          'Copia só a pose do que está escolhido. Era Animação → Copiar a pose do escolhido'),
        { label: 'Colar em todas as chaves', shortcut: 'Ctrl+Shift+V', action: 'colar-todas-chaves', enabled: true },
        // Item 2 (o Colar espelhado) subiu para o lado do Colar — Rodada 47, lote 5.
        // Rodada 17, PL-25 (decisão do Diretor): o meio-termo — uma chave na
        // agulha entre a de antes e a de depois, nos ossos escolhidos.
        SEP,
        naAnimacao('Meio-termo', 'meio-termo',
          'Na agulha, a chave no meio do caminho entre a de antes e a de depois, nos ossos escolhidos (nenhum = a pose inteira)'),
        naAnimacao('Meio-termo → anterior', 'meio-termo-anterior',
          'Como o Meio-termo, mais perto da chave de antes (um terço do caminho)'),
        naAnimacao('Meio-termo → seguinte', 'meio-termo-seguinte',
          'Como o Meio-termo, mais perto da chave de depois (dois terços do caminho)'),
      ],
    },
    SEP,
    // Duplicar e Apagar mexem no QUE ESTÁ ESCOLHIDO, e não na área de
    // transferência: eles são o próprio degrau — lote 37, anotação 26.
    { label: 'Duplicar', shortcut: 'Ctrl+D', action: 'duplicar', enabled: true },
    { label: 'Apagar', shortcut: 'Delete', action: 'apagar', enabled: true },
    SEP,
    { label: 'Selecionar tudo', shortcut: 'Ctrl+A', action: 'selecionar-tudo', enabled: true },
    { label: 'Desmarcar', shortcut: 'Esc', action: 'desmarcar', enabled: true },
    { label: 'Renomear', shortcut: 'F2', action: 'renomear', enabled: true },
    { label: 'Inverter a seleção', shortcut: 'Ctrl+Shift+I', action: 'inverter-selecao', enabled: true },
    { label: 'Substituir nomes…', action: 'substituir-nomes', enabled: true },
    { label: 'Buscar na Árvore…', shortcut: 'Ctrl+F', action: 'buscar', enabled: true },
    SEP,
    // Lote 42 — o "Select children" e o "Select parents" do Spriter. A tecla
    // `Z` é de Inclinar; os colchetes são os do Photoshop para descer e subir
    // nas camadas, e estavam livres.
    {
      label: 'Escolher',
      action: 'escolher',
      enabled: true,
      children: [
        {
          label: 'Os filhos', shortcut: ']', action: 'escolher-filhos', enabled: true,
          hint: 'O osso escolhido, todos os descendentes e os desenhos deles',
        },
        {
          label: 'Os pais', shortcut: '[', action: 'escolher-pais', enabled: true,
          hint: 'O osso escolhido e a corrente de pais até a raiz',
        },
      ],
    },
    SEP,
    // Ligadas no lote 13 (item 33). A âncora é onde o desenho fica dentro do
    // osso: copiar de uma mão e colar em cinco alinha as cinco de uma vez.
    // A palavra **âncora** saiu da tela — anotação 15, item f. Ela é o nome do
    // conceito no formato, e ninguém que não leu a spec sabe o que é; "posição
    // no osso" diz a mesma coisa e se entende de primeira. A palavra continua
    // no manual, como sinônimo, para quem vier da spec achar.
    {
      label: 'Copiar posição no osso',
      action: 'copiar-ancora',
      enabled: true,
      hint: 'Copia onde o desenho está dentro do osso: x, y, giro e as duas escalas (âncora)',
    },
    {
      label: 'Colar posição no osso',
      action: 'colar-ancora',
      enabled: true,
      hint: 'Põe a mesma posição nos desenhos escolhidos (âncora)',
    },
    SEP,
    { label: 'Preferências…', action: 'preferencias', enabled: true },
  ];
}

// ---------------------------------------------------------------------------
// Exibir
// ---------------------------------------------------------------------------

/**
 * O nome da ação de cada caixa do painel Exibição.
 *
 * O painel precisa deste nome para registrar, o menu para chamar. Escrito uma
 * vez só para os dois lados nunca discordarem.
 */
export const VIEW_ACTIONS: Readonly<Record<string, string>> = Object.freeze({
  drawings: 'ver-desenhos',
  bones: 'ver-ossos',
  boneNames: 'ver-nomes',
  boundingBoxes: 'ver-caixas',
  points: 'ver-pontos',
  meshes: 'ver-malhas',
  edges: 'ver-arestas',
  weights: 'ver-pesos',
  grid: 'ver-grade',
  rulers: 'ver-reguas',
  axes: 'ver-eixos',
  clippings: 'ver-mascaras',
  onion: 'ver-cebola',
  lockBones: 'travar-ossos',
  lockDrawings: 'travar-desenhos',
  showGuides: 'ver-guias',
  lockGuides: 'travar-guias',
});

/**
 * O menu "Exibir".
 *
 * As dez primeiras entradas são as MESMAS caixas do painel Exibição: o menu lê
 * o mesmo dado e escreve no mesmo lugar. Marcar aqui e marcar lá são o mesmo
 * gesto, e é por isso que `checked` sai de `viewSettings()` e não de uma cópia.
 */
export function viewMenu(
  view: ViewMenuState,
  lock: { lockBones: boolean; lockDrawings: boolean } = { lockBones: false, lockDrawings: false },
): MenuItem[] {
  return [
    // Lote 18: as cores do programa. Fica no alto do menu Exibir porque é a
    // escolha que muda a tela inteira; o resto do menu muda uma coisa cada.
    {
      label: 'Tema',
      action: 'tema',
      enabled: true,
      // A marca vem da própria ação (`checked()` em `ui/actions.ts`), e não
      // deste estado: o tema é preferência de quem usa, e o menu Exibir só
      // conhece o que a CENA mostra.
      children: [
        { label: 'Escuro', action: 'tema-escuro', enabled: true },
        { label: 'Claro', action: 'tema-claro', enabled: true },
      ],
    },
    SEP,
    // Rodada 6 (05/10/2026): as dezessete caixas em dois submenus, pelo que
    // mostram — **O boneco ▸** e **A cena ▸**. O menu caiu de 39 linhas para
    // 17 à vista; as teclas 7 e 9 continuam valendo de dentro do submenu.
    {
      label: 'O boneco',
      action: 'ver-o-boneco',
      enabled: true,
      children: [
        { label: 'Ossos', shortcut: '7', action: VIEW_ACTIONS['bones'], enabled: true, checked: view.bones },
        { label: 'Desenhos', shortcut: '9', action: VIEW_ACTIONS['drawings'], enabled: true, checked: view.drawings },
        { label: 'Nomes dos ossos', action: VIEW_ACTIONS['boneNames'], enabled: true, checked: view.boneNames },
        { label: 'Pontos', action: VIEW_ACTIONS['points'], enabled: true, checked: view.points },
        { label: 'Caixas', action: VIEW_ACTIONS['boundingBoxes'], enabled: true, checked: view.boundingBoxes },
        { label: 'Máscaras', action: VIEW_ACTIONS['clippings'], enabled: true, checked: view.clippings },
        SEP,
        // Lote 19: o bloco tinha treze caixas numa fila só. Ele foi partido pelo
        // que a caixa mostra: primeiro o ESQUELETO e os desenhos, depois a malha,
        // depois o que é da cena e não do personagem.
        { label: 'Malhas', action: VIEW_ACTIONS['meshes'], enabled: true, checked: view.meshes },
        { label: 'Arestas', action: VIEW_ACTIONS['edges'], enabled: true, checked: view.edges },
        { label: 'Pesos', action: VIEW_ACTIONS['weights'], enabled: true, checked: view.weights },
      ],
    },
    {
      label: 'A cena',
      action: 'ver-a-cena',
      enabled: true,
      children: [
        { label: 'Grade', action: VIEW_ACTIONS['grid'], enabled: true, checked: view.grid },
        { label: 'Réguas', action: VIEW_ACTIONS['rulers'], enabled: true, checked: view.rulers },
        { label: 'Eixos', action: VIEW_ACTIONS['axes'], enabled: true, checked: view.axes },
        { label: 'Casca de cebola', action: VIEW_ACTIONS['onion'], enabled: true, checked: view.onion.enabled },
        { label: 'Nome ao passar o mouse', action: 'ver-nome-no-cursor', enabled: true, checked: view.hoverNames },
        SEP,
        // Lote 42: as guias que se puxam da régua, como no Spriter. Um degrau
        // próprio: são as três coisas que se faz com elas.
        { label: 'Guias', action: VIEW_ACTIONS['showGuides'], enabled: true, checked: view.showGuides ?? true },
        { label: 'Travar guias', action: VIEW_ACTIONS['lockGuides'], enabled: true, checked: view.lockGuides ?? false },
        { label: 'Limpar guias', action: 'limpar-guias', enabled: true },
      ],
    },
    SEP,
    { label: 'Esconder o escolhido', shortcut: 'H', action: 'esconder-escolhido', enabled: true },
    { label: 'Só este: esconde o resto', shortcut: 'Shift+H', action: 'so-este', enabled: true },
    { label: 'Mostrar tudo', shortcut: 'Ctrl+Alt+3', action: 'mostrar-tudo', enabled: true },
    {
      label: 'Ver só o resultado', shortcut: 'Ctrl+Shift+H', action: 'ver-resultado',
      enabled: true, checked: view.cleanView !== null,
    },
    // **Travar ▸** — b10 (P33). Moravam em Esqueleto; no Spriter os quatro
    // botões de ver e travar são vizinhos, e a nossa barra de ações já os junta
    // (7, 8, 9, 0). Esconder e travar são a mesma pergunta: o que o clique pega.
    {
      label: 'Travar',
      action: 'travar',
      enabled: true,
      children: [
        { label: 'Travar ossos', shortcut: '8', action: VIEW_ACTIONS['lockBones'], enabled: true, checked: lock.lockBones },
        { label: 'Travar desenhos', shortcut: '0', action: VIEW_ACTIONS['lockDrawings'], enabled: true, checked: lock.lockDrawings },
        SEP,
        { label: 'Travar o escolhido', shortcut: 'Ctrl+2', action: 'travar-escolhido', enabled: true },
        { label: 'Travar o resto', shortcut: 'Ctrl+Shift+2', action: 'travar-resto', enabled: true },
        { label: 'Destravar tudo', shortcut: 'Ctrl+Alt+2', action: 'destravar-tudo', enabled: true },
      ],
    },
    SEP,
    { label: 'Casca de cebola: opções…', action: 'cebola-opcoes', enabled: true },
    { label: 'Imagem de referência…', action: 'imagem-referencia', enabled: true },
    SEP,
    { label: 'Aproximar', shortcut: 'Ctrl+=', action: 'aproximar', enabled: true },
    { label: 'Afastar', shortcut: 'Ctrl+−', action: 'afastar', enabled: true },
    { label: 'Tamanho real (100%)', shortcut: 'Ctrl+0', action: 'tamanho-real', enabled: true },
    { label: 'Ajustar à tela', shortcut: 'Ctrl+Shift+F', action: 'ajustar', enabled: true },
    { label: 'Enquadrar seleção', shortcut: 'F', action: 'enquadrar', enabled: true },
    SEP,
    { label: 'Mostrar nome das ferramentas', action: 'nome-das-ferramentas', enabled: true },
    // Degrau 7, tarefa 7.5 (defeito A7): o botão direito na cena volta à
    // ferramenta de antes, e ninguém que não visse acontecer saberia disso.
    // O item é a porta; o gesto continua igual.
    {
      label: 'Ferramenta de antes', action: 'ferramenta-de-antes', enabled: true,
      hint: 'O mesmo que o botão direito na cena, fora de um desenho',
    },
  ];
}

// ---------------------------------------------------------------------------
// Esqueleto
// ---------------------------------------------------------------------------

/**
 * O nome da ação de cada caixa de compensação.
 *
 * A cena precisa deste mesmo nome para registrar a ação, e o menu precisa dele
 * para chamar. Escrito uma vez só, aqui, para os dois lados nunca discordarem.
 */
export const COMPENSATION_ACTIONS: Readonly<Record<keyof CompensationFlags, string>> = Object.freeze({
  children: 'compensar-filhos',
  drawings: 'compensar-desenhos',
  boxes: 'compensar-caixas',
});

/**
 * O menu "Base" — era "Esqueleto" até a rodada 6 (05/10/2026).
 *
 * Montar o personagem. A base é a animação de um quadro só (decisões, seção
 * 1): abrir a base, trazer uma de fora, criar osso e peça, quem é pai de quem,
 * a ordem de desenho, as pastas, o repouso. O que era da arte foi para
 * Imagens; a malha, as regras e a física, para Malha e regras; as peles, para
 * Skins; o emissor, para Partículas. Desenho: `05 O DESENHO DOS MENUS`, §4.
 *
 * Lê `animating` para o "Abrir a base", que veio do menu Animação. Ausente
 * conta como aberta, como no estado neutro.
 */
export function skeletonMenu(state: SkeletonMenuState & { animating?: boolean }): MenuItem[] {
  const animando = state.animating ?? true;
  return [
    // Degrau 11, lote 1: o interruptor e o `Ctrl+Tab` saíram. A base tem esta
    // porta e o clique no corpo, na janela Animação; o rodapé diz onde se está.
    // Rodada 6: veio de Animação, para o menu da base.
    {
      label: 'Abrir a base',
      action: 'abrir-a-base',
      enabled: animando,
      hint: 'A base já está aberta',
    },
    // Degrau 10, tarefa 10.2 (E17): trazer outro `.bone` PARA DENTRO do
    // projeto. Era Arquivo → Trazer para o projeto → Abrir outro corpo…
    // Porta da rodada 6: era só o botão da janela Animação.
    {
      label: 'Salvar como base nova…', action: 'salvar-base-nova', enabled: true,
      hint: 'O quadro de agora vira uma base nova, com o nome que você der. A animação não muda',
    },
    {
      label: 'Trazer uma base de fora…',
      action: 'abrir-corpo',
      enabled: true,
      hint: 'Um .bone de fora entra na lista Bases, e a base dele abre. Era Abrir outra base…',
    },
    // Reaproveitar (04/11/2026): os ossos deste boneco ganham os nomes do
    // padrão, e as animações do padrão tocam aqui sem combinar nada.
    {
      label: 'Seguir o Esqueleto padrão…',
      action: 'seguir-esqueleto-padrao',
      enabled: true,
      hint: 'Os ossos ganham os nomes do Esqueleto padrão (quadril, tronco, braco_d…); a janela mostra a tabela antes',
    },
    SEP,
    {
      label: 'Novo',
      action: 'novo-item',
      enabled: true,
      // b14: em blocos pelo que se faz — o que se vê na cena e o que mascara.
      // Rodada 6: a imagem foi para Imagens, o emissor para Partículas, a
      // regra e o parâmetro para Malha e regras, a pele para Skins.
      children: [
        { label: 'Osso', action: 'novo-osso', enabled: true },
        // "Slot" saiu em 13/09/2026. O Humberto: *"eu imagino que eu vou criar
        // imagem, tirar imagens, e vai acabar tendo muitos slots soltos"*. Era
        // a única porta que criava um slot **vazio** sem ninguém pedir.
        { label: 'Ponto', shortcut: 'O', action: 'novo-ponto', enabled: true },
        { label: 'Caixa de colisão', shortcut: 'X', action: 'novo-caixa', enabled: true },
        // Lote 40: com um slot escolhido, o anexo entra NELE (○), sem slot novo.
        {
          label: 'Ponto neste slot',
          action: 'novo-ponto-no-slot',
          enabled: true,
          hint: 'Com um slot escolhido: o ponto entra nele como mais um desenho, sem criar slot',
        },
        {
          label: 'Caixa neste slot',
          action: 'novo-caixa-no-slot',
          enabled: true,
          hint: 'Com um slot escolhido: a caixa entra nele como mais um desenho, sem criar slot',
        },
        SEP,
        { label: 'Máscara', action: 'novo-mascara', enabled: true },
      ],
    },
    // Lote 63a: o P é um gesto só. Rodada 17, J2: o item abre o MESMO gesto,
    // sem segurar a tecla, até o Esc.
    {
      label: 'Virar filho de…', shortcut: 'P', action: 'virar-filho', enabled: true,
      hint: 'Com um osso escolhido: clique em quem vira filho dele, até o Esc. O mesmo que segurar P',
    },
    SEP,
    // Vivos desde o lote 16, com a aba **Ordem**. Ctrl+↑ e Ctrl+↓ fazem o
    // mesmo com o foco numa linha dela. "Subir" e "descer" saíram no lote 25:
    // com a lista de ponta-cabeça (anotação 8), subir na tela é ir para a
    // FRENTE do desenho, e "subir na ordem" passava a poder ser lido dos dois
    // jeitos. Frente e trás não têm esse problema.
    { label: 'Trazer para a frente', shortcut: '+', action: 'subir-ordem', enabled: true },
    { label: 'Mandar para trás', shortcut: '−', action: 'descer-ordem', enabled: true },
    // As duas "de tudo" nasceram com os botões da aba Ordem — lote 35. Elas
    // estão aqui porque a barra da aba só existe com a aba aberta, e a ordem
    // de desenho é assunto do esqueleto inteiro.
    { label: 'Frente de tudo', shortcut: 'Ctrl+Shift+↑', action: 'frente-de-tudo', enabled: true },
    { label: 'Fundo de tudo', shortcut: 'Ctrl+Shift+↓', action: 'fundo-de-tudo', enabled: true },
    // Lote 66 — o "Copy Z-order To All Keyframes" do Spriter. Morava em
    // Editar; b11 (P33): junto das outras quatro da ordem, como no Spriter.
    {
      label: 'Copiar a ordem na animação', action: 'copiar-ordem-animacao', enabled: true,
      hint: 'A ordem de desenho de agora vale para toda a animação: vira a única chave de ordem, em 0',
    },
    SEP,
    // Pasta é arrumação, e não ordem: o degrau separa as duas coisas.
    { label: 'Nova pasta…', action: 'nova-pasta', enabled: true },
    { label: 'Tirar da pasta', action: 'tirar-da-pasta', enabled: true },
    // A vassoura, 13/09/2026. Um slot fica vazio quando se apaga um desenho de
    // dentro de um slot que tinha mais de um, e nos arquivos que vêm de fora.
    // Ele não mostra nada e ainda ocupa uma linha na ordem de desenho.
    {
      label: 'Limpar desenhos vazios',
      action: 'limpar-slots-vazios',
      enabled: true,
      hint: 'Apaga os slots que não mostram nada em skin nenhuma',
    },
    // Rodada 13: tirar uma peça da base guarda as chaves dela. Aqui se vê
    // quantas, de quem, e se joga fora de propósito.
    {
      label: 'Chaves guardadas…',
      action: 'chaves-guardadas',
      enabled: true,
      hint: 'As chaves das peças tiradas da base: quantas, de quem. Voltam com uma peça do mesmo nome',
    },
    SEP,
    { label: 'Voltar à pose de repouso', shortcut: 'Ctrl+1', action: 'repouso-osso', enabled: true },
    { label: 'Voltar tudo ao repouso', shortcut: 'Ctrl+Shift+1', action: 'repouso-todos', enabled: true },
    SEP,
    {
      label: 'Compensar',
      action: 'compensar',
      enabled: true,
      children: [
        {
          label: 'Não mexer nos filhos',
          action: COMPENSATION_ACTIONS.children,
          enabled: true,
          checked: state.compensation.children,
        },
        {
          label: 'Não mexer nos desenhos',
          action: COMPENSATION_ACTIONS.drawings,
          enabled: true,
          checked: state.compensation.drawings,
        },
        {
          label: 'Não mexer nas caixas',
          action: COMPENSATION_ACTIONS.boxes,
          enabled: true,
          checked: state.compensation.boxes,
        },
      ],
    },
    {
      label: 'Eixos das alças',
      action: 'eixos',
      enabled: true,
      children: [
        { label: 'Local', action: 'eixos-local', enabled: true, checked: state.space === 'local' },
        { label: 'Pai', action: 'eixos-pai', enabled: true, checked: state.space === 'pai' },
        { label: 'Mundo', action: 'eixos-mundo', enabled: true, checked: state.space === 'mundo' },
      ],
    },
    // "Reempacotar atlas" saiu no lote 62 (plano pasta do projeto): o atlas
    // nasce ao Salvar, só com as imagens em uso. Reempacotar é o Salvar.
  ];
}

// ---------------------------------------------------------------------------
// Imagens
// ---------------------------------------------------------------------------

/**
 * O menu "Imagens" — rodada 6 (05/10/2026), `05 O DESENHO DOS MENUS`, §3.
 *
 * Trazer as imagens, pôr na cena, acertar o pivô: o primeiro passo do
 * trabalho, como no Spriter. Moravam em Arquivo (a pasta) e em Esqueleto (a
 * imagem na cena, a grade e o pivô).
 */
export function imagesMenu(): MenuItem[] {
  return [
    // Os dois do chat H (P41, 29/09/2026): moravam só como botão na aba
    // Imagens, e com a aba fechada não havia por onde pedir.
    {
      label: 'Recarregar a pasta', action: 'recarregar-pasta', enabled: true,
      hint: 'Relê a pasta do disco: imagem nova entra, apagada sai, e o rodapé diz o que mudou',
    },
    {
      label: 'Trocar pasta de origem…', action: 'trocar-pasta-origem', enabled: true,
      hint: 'Aponte para outra pasta: o acervo passa a ser as imagens dela, com os mesmos nomes',
    },
    SEP,
    // b2 (P33): "Imagem no slot…" virou "Pôr imagem na cena…". Slot é
    // palavra do formato; nos três programas o gesto é pôr a imagem na cena.
    {
      label: 'Pôr imagem na cena…', action: 'novo-imagem', enabled: true,
      hint: 'Escolhe uma imagem e ela entra na cena, presa ao osso escolhido. Era Imagem no slot…',
    },
    // Degrau 7, tarefa 7.5 (defeito A7): a outra metade do botão direito. Em
    // cima de um desenho ele abre esta grade; aqui ela abre pelo desenho
    // escolhido, e quem nunca deu o clique certo encontra a função.
    {
      label: 'Opções do desenho…', action: 'opcoes-do-desenho', enabled: true,
      hint: 'O mesmo que o botão direito em cima de um desenho: trocar a imagem, ordem, duplicar, apagar',
    },
    // Porta da rodada 6: era só o botão direito no nome de uma subpasta.
    {
      label: 'Trazer como sequência', action: 'trazer-sequencia', enabled: true,
      hint: 'Uma subpasta numerada (olho_01, olho_02…) vira um desenho só, que troca de quadro. '
        + 'Com mais de uma, pergunta qual',
    },
    SEP,
    // O pivô, do chat H (P41, 29/09/2026). No Spriter é o duplo clique na
    // imagem; aqui ele também tem porta no menu.
    {
      label: 'Definir pivô…', action: 'definir-pivo', enabled: true,
      hint: 'Abre a janela do pivô para a imagem do desenho escolhido',
    },
    // Rodada 44, lote 7 (doc 75): o "fit" do Spriter para a imagem trocada.
    {
      label: 'Caber no lugar da antiga', action: 'caber-na-antiga', enabled: true,
      hint: 'Muda a escala do desenho escolhido para ele ficar do tamanho do que saiu na última troca',
    },
    // Portas da rodada 6: eram só o botão direito numa imagem da aba.
    {
      label: 'Copiar pivô', action: 'copiar-pivo', enabled: true,
      hint: 'Guarda o pivô da imagem do desenho escolhido, em proporção, para colar em outra',
    },
    {
      label: 'Colar pivô', action: 'colar-pivo', enabled: true,
      hint: 'Põe na imagem do desenho escolhido o pivô copiado, na mesma proporção',
    },
    {
      label: 'Carimbar pivôs', action: 'carimbar-pivos', enabled: true,
      hint: 'Grava no atlas onde cada imagem encaixa no osso',
    },
    // Rodada 13, caso (b): mudar o pivô deixa o desenho parado, e o pivô fica
    // "à mão" — o osso não está nele. Este item o devolve ao osso.
    {
      label: 'Voltar o pivô para o osso', action: 'voltar-pivo-osso', enabled: true,
      hint: 'O pivô à mão volta para onde o osso está. Na imagem escolhida, ou em todas as marcadas',
    },
  ];
}

// ---------------------------------------------------------------------------
// Malha e regras
// ---------------------------------------------------------------------------

/**
 * O menu "Malha e regras" — rodada 6, `05 O DESENHO DOS MENUS`, §5.
 *
 * As ferramentas do Spine num menu só (decisão 4 do Humberto): malha, pesos,
 * regras, parâmetros, física e caminho. O Humberto não entendeu como usar
 * regras, física e caminho porque não estavam nos menus (decisões, §4.3).
 */
export function meshRulesMenu(): MenuItem[] {
  return [
    // Rodada 6: as doze da aba Malha e pesos, que tinha **zero** itens de
    // menu. Cada uma traz a aba à frente e chama o mesmo botão.
    {
      label: 'Malha',
      action: 'malha',
      enabled: true,
      children: [
        {
          label: 'Virar malha', action: 'virar-malha', enabled: true,
          hint: 'A imagem inteira escolhida vira malha, com os mesmos quatro cantos',
        },
        {
          label: 'Gerar automática', action: 'malha-automatica', enabled: true,
          hint: 'Contorno e miolo pela silhueta da imagem',
        },
        {
          label: 'Traçar contorno', action: 'tracar-contorno', enabled: true,
          hint: 'Só o contorno, pela silhueta da imagem',
        },
        SEP,
        {
          label: 'Criar vértice', action: 'criar-vertice', enabled: true,
          hint: 'Liga e desliga: com ele ligado, o clique na malha cria um vértice',
        },
        {
          // Rodada 41, lote 4: a aresta só existia na aba e nas teclas L e K.
          label: 'Criar ou apagar aresta', action: 'criar-aresta', enabled: true,
          hint: 'Liga os dois vértices escolhidos (ou tira a ligação, se já existe): a malha dobra ao longo dela. L cria, K apaga',
        },
        {
          label: 'Apagar vértice', action: 'apagar-vertice', enabled: true,
          hint: 'Apaga os vértices escolhidos na malha (o mesmo que a tecla Delete)',
        },
        SEP,
        {
          label: 'Usar a forma de outra malha', action: 'usar-forma-de-outra', enabled: true,
          hint: 'Malha ligada: empresta a forma de outra malha do mesmo slot e troca só a imagem',
        },
      ],
    },
    {
      label: 'Pesos',
      action: 'pesos',
      enabled: true,
      children: [
        {
          label: 'Ligar ossos', action: 'ligar-ossos', enabled: true,
          hint: 'Liga e desliga: com ele ligado, o clique num osso o liga à malha',
        },
        {
          label: 'Pesos automáticos', action: 'pesos-automaticos', enabled: true,
          hint: 'Cada vértice segue os ossos mais perto, pela distância',
        },
        {
          label: 'Suavizar tudo', action: 'suavizar-pesos', enabled: true,
          hint: 'Mistura os pesos dos vizinhos: a dobra fica mais macia',
        },
        {
          label: 'Podar', action: 'podar-pesos', enabled: true,
          hint: 'Tira os pesos pequenos demais para fazer diferença',
        },
        SEP,
        {
          label: 'Chavear pesos', action: 'chavear-pesos', enabled: true,
          hint: 'Grava os pesos de agora como chave na animação aberta. Pintar continua indo para a base',
        },
        {
          label: 'Tirar pesos', action: 'tirar-pesos', enabled: true,
          hint: 'A malha volta a seguir só o osso do slot',
        },
      ],
    },
    SEP,
    // **Nova regra…** abre a janela guiada da aba Regras — anotação 15, item
    // k. O submenu de cinco tipos criava **adivinhando**: um osso só e um alvo
    // qualquer, sem perguntar. Era Esqueleto → Novo → Regra…
    {
      label: 'Nova regra…',
      action: 'nova-regra-guiada',
      enabled: true,
      hint: 'Abre a janela que pergunta que ossos dobram e o que eles perseguem',
    },
    // Portas da rodada 6: o lápis e a lixeira da linha da regra, na aba Regras.
    {
      label: 'Trocar os ossos da regra…', action: 'trocar-ossos-regra', enabled: true,
      hint: 'Pergunta de novo que ossos a regra escolhida dobra, sem apagar e refazer',
    },
    {
      label: 'Apagar regra', action: 'apagar-regra', enabled: true,
      hint: 'Apaga a regra escolhida. Os ossos ficam',
    },
    SEP,
    {
      label: 'Novo parâmetro', action: 'novo-parametro', enabled: true,
      hint: 'Um valor com nome que o jogo manda de fora, e que move os ossos por regra. Era Esqueleto → Novo → Parâmetro',
    },
    // Portas da rodada 6: a chave e a lixeira da linha do parâmetro.
    {
      label: 'Chave do parâmetro aqui', action: 'chave-parametro', enabled: true,
      hint: 'Grava o alvo do parâmetro escolhido no valor em que ele está agora',
    },
    {
      label: 'Apagar parâmetro', action: 'apagar-parametro', enabled: true,
      hint: 'Apaga o parâmetro escolhido. A regra que o lia fica sem parâmetro',
    },
    SEP,
    // Porta D6 (degrau 12, 18/09/2026): os três gestos da física, num submenu.
    // A regra `physics` já era completa em Propriedades e **simulava sempre**;
    // estes três não tinham porta nenhuma na tela.
    {
      label: 'Física',
      action: 'fisica',
      enabled: true,
      children: [
        {
          label: 'Simular a física', action: 'fisica-simular', enabled: true,
          hint: 'Liga e desliga o balanço na tela. É preferência sua: não vai para o arquivo',
        },
        {
          label: 'Reiniciar esta física', action: 'fisica-reiniciar', enabled: true,
          hint: 'Com uma regra de física escolhida: zera o balanço acumulado (§6.5 physicsReset)',
        },
        {
          label: 'Reiniciar todas as físicas', action: 'fisica-reiniciar-todas', enabled: true,
          hint: 'Zera o balanço acumulado de todas as regras de física de uma vez',
        },
        {
          label: 'Assar a física em chaves…', action: 'fisica-assar', enabled: true,
          hint: 'Troca a simulação por chaves comuns: depois disso a animação toca para trás igual',
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Skins
// ---------------------------------------------------------------------------

/**
 * O menu "Skins" — rodada 6, `05 O DESENHO DOS MENUS`, §7.
 *
 * A skin veste. Edita-se uma por vez; depois se empilham (decisões, §3). Era
 * o submenu Peles ▸ do Esqueleto. Importar e exportar skin ficam no Arquivo
 * (decisão 5 do Humberto).
 */
export function skinsMenu(): MenuItem[] {
  return [
    {
      label: 'Nova skin', action: 'nova-pele', enabled: true,
      hint: 'Uma skin nova, vazia, que passa a ser a do lápis. Era Esqueleto → Novo → Pele',
    },
    // Portas da rodada 6: os botões da aba. "Clonar" é o Duplicar da aba —
    // a rodada 1 conferiu (S10): o clone usa os mesmos ossos.
    {
      label: 'Clonar skin', action: 'clonar-pele', enabled: true,
      hint: 'Uma cópia da skin do lápis, com os mesmos ossos. Era o Duplicar da aba',
    },
    {
      label: 'Fazer a skin de uma pasta…', action: 'pele-de-pasta', enabled: true,
      hint: 'Cada desenho procura, na pasta, uma imagem com o mesmo nome de arquivo',
    },
    {
      label: 'Apagar skin', action: 'apagar-pele', enabled: true,
      hint: 'Apaga a skin do lápis, depois de perguntar. Ctrl+Z devolve',
    },
    SEP,
    {
      label: 'Editar esta skin…', action: 'editar-pele', enabled: true,
      hint: 'O lápis: o que se cria daqui em diante é desta skin, imagens e ossos',
    },
    SEP,
    // Lote 39. A mesma entrada está no botão direito da Árvore.
    {
      label: 'Trocar imagem nas skins…',
      action: 'trocar-imagem-todas-peles',
      enabled: true,
      hint: 'Com um desenho escolhido: a imagem nova troca em toda skin que usa a mesma',
    },
    // Rodada 12: o Set Ignored e o Set Hidden do Spriter. Valem com o lápis
    // numa pele que não seja a default, e um desenho escolhido.
    {
      label: 'Ignorar esta imagem',
      action: 'ignorar-na-pele',
      enabled: true,
      hint: 'A skin do lápis deixa de mexer no desenho escolhido: volta o de baixo, o da base',
    },
    {
      label: 'Esconder esta imagem',
      action: 'esconder-na-pele',
      enabled: true,
      hint: 'O desenho escolhido não é desenhado com a skin do lápis vestida. A base não muda',
    },
    SEP,
    {
      label: 'Promover skin a base…',
      action: 'promover-pele-base',
      enabled: true,
      hint: 'A pilha ligada vira a base de uma base nova, que entra em Bases com animações próprias',
    },
  ];
}

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

/**
 * O menu "Entidades" — rodada 6, `05 O DESENHO DOS MENUS`, §8.
 *
 * Encaixar. Onde cabe uma imagem, cabe uma entidade (decisões, §2).
 */
export function entitiesMenu(): MenuItem[] {
  return [
    // Era Arquivo → Trazer para o projeto → Abrir uma entidade…
    {
      label: 'Trazer entidade de fora…',
      action: 'abrir-entidade',
      enabled: true,
      hint: 'Um .bone de fora entra na lista Entidades, fechado: aparece no painel Entidades '
        + 'e na grade do botão direito. Era Abrir uma entidade…',
    },
    // Portas da rodada 6: arrastar da aba, e o botão direito na faixa.
    {
      label: 'Pôr entidade na cena…', action: 'por-entidade', enabled: true,
      hint: 'A entidade entra presa ao osso escolhido (sem osso, na raiz). O mesmo que arrastá-la da aba',
    },
    {
      label: 'Escolher a animação dela…', action: 'escolher-animacao-entidade', enabled: true,
      hint: 'Com a entidade escolhida e uma animação aberta: qual animação dela toca daqui em diante',
    },
    // Rodada 8c, C15: o laço da entidade. Também no botão direito da faixa.
    {
      label: 'Em laço', action: 'entidade-em-laco', enabled: true,
      hint: 'Com a entidade escolhida: em laço ela roda sozinha, sem fim; sem laço, toca uma volta e para',
    },
    // Rodada 9 (05/10/2026): a imagem escolhida vira uma base, com nome e
    // animações próprias (decisões, seção 2, regra 2). Também no botão direito.
    {
      label: 'Marcar como slot…', action: 'marcar-como-slot', enabled: true,
      hint: 'Com uma imagem escolhida: ela vira uma base do projeto, com o nome que você der e animações próprias. '
        + 'No boneco nada muda no desenho. Também no botão direito da imagem',
    },
    {
      label: 'Desmarcar o slot', action: 'desmarcar-slot', enabled: true,
      hint: 'Com o slot marcado escolhido: a imagem de antes volta, como era, e a base sai do projeto',
    },
    // Rodada 39, lote 2: a montagem de teste. O mesmo que arrastar da
    // prateleira da aba Entidades até a linha do slot. O separador entra
    // porque o menu passou de 12 itens (`menu-audit.ts`: grupo de até 6).
    SEP,
    {
      label: 'Pôr em teste neste slot…', action: 'por-em-teste', enabled: true,
      hint: 'Com uma imagem ou uma entidade escolhida na cena: a entidade que você pegar entra no lugar dela '
        + 'EM TESTE. Vale na Prévia e, com Na cena ligado, na cena; a animação não muda e o arquivo também não. '
        + 'Na aba Entidades, o cartão fica tracejado',
    },
    {
      label: 'Desligar o teste deste slot', action: 'desligar-teste', enabled: true,
      hint: 'Com a imagem ou a entidade escolhida na cena: a peça de teste sai do slot. O arquivo não muda: ela nunca entrou nele',
    },
    // Lote 4: para cima. O mesmo que arrastar o cartão AQUI até a entidade.
    {
      label: 'Pôr o projeto dentro de…', action: 'por-dentro-de', enabled: true,
      hint: 'Pergunta a entidade e o slot dela: o projeto aberto (ou o que já está em volta dele) entra ali EM TESTE, '
        + 'como o boneco no piloto do mecha. Com Na cena ligado, a cena desenha o de fora em volta. Nada entra no arquivo',
    },
    {
      label: 'Tirar de volta', action: 'tirar-de-volta', enabled: true,
      hint: 'O que está mais de fora em volta do projeto sai (era teste). O arquivo não muda',
    },
    // Lote 5: o "Bake Active To Entity" do Spriter. Também na barra da aba.
    {
      label: 'Pôr no projeto…', action: 'por-no-projeto', enabled: true,
      hint: 'Grava uma ligação de teste no arquivo aberto (pergunta qual, se há mais de uma): para baixo, a peça '
        + 'no slot, como a grade; para cima, o de fora entra no boneco com Este boneco. Vai para a base. '
        + 'Ctrl+Z volta a teste',
    },
    SEP,
    // Rodada 39b, lote 6: o que está no cartão de teste da aba Entidades.
    {
      label: 'O que a peça de teste toca…', action: 'anima-do-teste', enabled: true,
      hint: 'Pergunta a peça de teste e o que ela toca: parada (a pose de repouso), a animação de quem a recebe, '
        + 'ou uma animação dela, no relógio da agulha. É teste: o arquivo não muda. O mesmo que o "anima ▾" do cartão',
    },
    {
      label: 'Skins da peça de teste…', action: 'skins-do-teste', enabled: true,
      hint: 'Liga e desliga uma skin da peça de teste, por cima da default. O arquivo dela não muda. '
        + 'O mesmo que o "skins ▾" do cartão',
    },
    {
      label: 'Teste em todas as iguais', action: 'teste-nas-iguais', enabled: true,
      hint: 'A peça de teste entra, em teste, em todos os slots que mostram a mesma imagem que o dela, '
        + 'como as quatro rodas. Um passo de desfazer. O mesmo que o botão "Trocar todas as iguais" do cartão',
    },
    SEP,
    // Rodada 11 (05/10/2026): "Este boneco", a tomada ao contrário (decisões,
    // seção 2). A entidade passa a ser desenhada EM VOLTA de quem a recebe.
    {
      label: 'Este boneco…', action: 'este-boneco', enabled: true,
      hint: 'Com a entidade escolhida: pergunta qual imagem dela marca o meio. O que está atrás dessa imagem '
        + 'vai para trás do boneco inteiro, o que está na frente vai para a frente, e ela não é desenhada. '
        + 'Na base vale em todas as animações; com uma animação aberta, só nela, da agulha em diante',
    },
    {
      label: 'Tirar o Este boneco', action: 'tirar-este-boneco', enabled: true,
      hint: 'Com a entidade escolhida: ela volta a ser desenhada em bloco, no lugar dela na ordem',
    },
    // Rodada 8a (04/10/2026), decisão 6 da conexão. Também no botão direito
    // da entidade, na cena, embaixo da grade. Era Esqueleto → Tirar a entidade.
    {
      label: 'Tirar a entidade',
      action: 'tirar-entidade',
      enabled: true,
      hint: 'Com uma entidade escolhida: sai a entidade, e a imagem de antes volta, como era',
    },
    SEP,
    // Portas da rodada 6: o botão direito da aba Entidades e o botão da janela Animação.
    {
      label: 'Promover a base', action: 'promover-entidade', enabled: true,
      hint: 'A entidade passa para a lista de bases, com as animações dela. Pergunta qual',
    },
    {
      label: 'Rebaixar a entidade', action: 'rebaixar-entidade', enabled: true,
      hint: 'Uma base que não está em foco volta a ser entidade. Pergunta qual',
    },
  ];
}

// ---------------------------------------------------------------------------
// Partículas
// ---------------------------------------------------------------------------

/**
 * O menu "Partículas" — rodada 6, `05 O DESENHO DOS MENUS`, §9.
 *
 * O emissor vazio e os quatro prontos. Moravam em Esqueleto → Novo e em
 * Animação → Efeitos de chave; quem procurava FOGO não achava (decisões, §5).
 */
export function particlesMenu(): MenuItem[] {
  return [
    // Extensão `BONE_particles`: o emissor de partículas. Não pede gesto na
    // cena (é um ponto preso ao osso), então o menu cria direto.
    {
      label: 'Novo emissor vazio',
      action: 'novo-emissor',
      enabled: true,
      hint: 'Fumaça, faísca, poeira: um emissor preso ao osso escolhido. Os campos ficam em Propriedades. '
        + 'Era Esqueleto → Novo → Emissor de partículas',
    },
    SEP,
    // b5 e P5 (29/09/2026): os modelos prontos do chat B. Registrados pela
    // barra da cena; um lugar só na barra de menus.
    {
      label: 'Fogo', action: 'particulas-fogo', enabled: true,
      // Rodada 38, lote 6 (doc 38): a dica diz os números, como a da barra.
      hint: 'Um emissor novo, já como fogo: vida curta (0,6 a 1 s), sobe rápido (60 a 110 px/s), tamanho 1,6 a 2,4, encolhe, amarelo e vermelho. A cor muda na aba Cor, barra Cor na vida: o clique põe as duas pontas; duplo clique numa ponta troca a cor',
    },
    {
      label: 'Fumaça', action: 'particulas-fumaca', enabled: true,
      hint: 'Um emissor novo, já como fumaça: vida longa (1,8 a 2,6 s), sobe devagar (30 a 55 px/s), tamanho 1,6 a 2,2, cresce 2,5 vezes, cinza escuro',
    },
    {
      label: 'Faísca', action: 'particulas-faisca', enabled: true,
      // Rodada 42, lote 1 (doc 41): a Abertura e a cor que se vê no fundo claro entram na receita.
      hint: 'Um emissor novo, já como faísca: dois estouros de 40, vida curtíssima (0,3 a 0,6 s), rápida (180 a 320 px/s), '
        + 'Abertura 180 (para todos os lados; sem ela sai numa coluna), tamanho 0,7 a 1,1, laranja que escurece até vermelho-escuro '
        + '(branco e amarelo-claro somem no fundo claro), cai.'
        // Rodada 42 (doc 48): COMO escurecer, em uma frase.
        + ' Para escurecer: aba Cor, barra Cor na vida — o clique põe as duas pontas; duplo clique na ponta da direita troca a cor',
    },
    {
      label: 'Poeira', action: 'particulas-poeira', enabled: true,
      hint: 'Um emissor novo, já como poeira: nasce numa faixa (40 × 4), vida (0,6 a 1 s), devagar (10 a 30 px/s), tamanho 0,5 a 0,9, bege-claro a pardo, cresce e assenta',
    },
    SEP,
    // Rodada 15 construiu o prender (tecla P, Árvore, campo Osso); a rodada 6
    // dá a porta no menu.
    {
      label: 'Prender ao osso escolhido', action: 'prender-emissor', enabled: true,
      hint: 'O emissor escolhido vira filho do osso, sem sair do lugar. Sem osso escolhido, pergunta qual',
    },
  ];
}

// ---------------------------------------------------------------------------
// Animação
// ---------------------------------------------------------------------------

/**
 * O menu "Animação".
 *
 * Em Montagem quase tudo aqui fica cinza, porque quase tudo aqui só faz sentido
 * com uma animação aberta. O que continua vivo é o que abre uma: nova,
 * duplicar, e a troca entre Montagem e Animando.
 *
 * As quatro últimas — esticar, espelhar, fechar o ciclo, espelhar os lados —
 * são de vez em quando, e é por isso que estão no fim: o Moho guarda as dele
 * no mesmo lugar.
 */
export function animationMenu(state: AnimationMenuState): MenuItem[] {
  const on = state.animating;
  /** Uma entrada que só faz sentido com uma animação aberta. */
  const open = (label: string, action: string, shortcut?: string): MenuEntry => ({
    label,
    action,
    enabled: on,
    // Rodada 40, lote 5 (nota do doc 50): a dica só quando está cinza. Ela
    // dizia "Abra uma animação primeiro" com a animação já aberta.
    ...(on ? {} : { hint: 'Abra uma animação primeiro' }),
    ...(shortcut === undefined ? {} : { shortcut }),
  });
  return [
    // "Abrir a base" foi para o menu Base (rodada 6, 05/10/2026).
    // **Nova animação fica à vista** — P41 (29/09/2026). O c12 punha tudo da
    // lista num submenu; a Nova ficou fora, porque é o primeiro gesto de quem
    // vai animar, e é o passo que a dica do rodapé aponta (P19). A panela não
    // vai para dentro do armário. O resto da lista mora em Animações ▸.
    { label: 'Nova animação', action: 'nova-animacao', enabled: true },
    // Reaproveitar (04/11/2026): à vista, ao lado da Nova — é o outro jeito de
    // ter animação, e quem procura "como o goblin anda igual" acha aqui.
    {
      label: 'Animações de outro boneco…',
      action: 'usar-animacoes',
      enabled: true,
      hint: 'O Esqueleto padrão, outra base do projeto, ou um arquivo: ligadas (mudam junto) ou cópia',
    },
    {
      label: 'Animações',
      action: 'animacoes',
      enabled: true,
      children: [
        open('Duplicar animação', 'duplicar-animacao'),
        open('Renomear animação', 'renomear-animacao'),
        open('Apagar animação', 'apagar-animacao'),
        // Lote 44: a primeira da lista é a padrão.
        open('Mandar para o topo', 'mandar-para-o-topo'),
        SEP,
        // Lote 2: as quatro de fábrica, contra a convenção humanoide-v1. É o
        // mesmo gesto de importar, com o arquivo já escolhido — e a janela diz
        // o que este corpo não tem antes de trazer. Exportar e Importar
        // animação foram para o menu Arquivo (P41).
        {
          label: 'Biblioteca de animações…',
          action: 'biblioteca-animacoes',
          enabled: true,
          hint: 'Parado, andar, correr e pular, prontas; a janela diz o que esta base não tem antes de trazer',
        },
      ],
    },
    SEP,
    open('Mudar duração…', 'mudar-duracao'),
    { ...open('Repetir', 'repetir', 'L'), checked: state.loop },
    // **No fim ▸** — a4 (29/09/2026). O que o TOCADOR faz ao chegar no fim
    // morava só no ⋯ Mais da linha do tempo. Os nomes são os do `END_MODES`
    // de `anim/transport.ts`, um nome só nos dois lugares (o teste confere).
    // A marca de rádio vem de cada ação (`checked`), como a do Tema. Os três
    // últimos são de SESSÃO: jeitos de olhar, que não vão para o arquivo.
    {
      label: 'No fim',
      action: 'no-fim',
      enabled: true,
      hint: 'O que o tocador faz ao chegar no fim da animação. Só "Como o arquivo diz" é o que o jogo faz',
      children: [
        {
          label: 'Como o arquivo diz', action: 'fim-arquivo', enabled: true,
          hint: 'Obedece ao Repetir da animação. É o que o jogo vai fazer',
        },
        { label: 'Parar no fim', action: 'fim-parar', enabled: true, hint: 'Chega ao fim e para' },
        { label: 'Repetir', action: 'fim-repetir', enabled: true, hint: 'Volta ao começo e continua' },
        {
          label: 'Vai e volta', action: 'fim-vai-e-volta', enabled: true,
          hint: 'No fim, toca de trás para a frente',
        },
        {
          label: 'Voltar ao início', action: 'fim-voltar', enabled: true,
          hint: 'Chega ao fim, volta ao começo e para',
        },
      ],
    },
    SEP,
    open('Tocar / Pausar', 'tocar', 'Espaço'),
    { label: 'Tocar para trás', shortcut: 'Shift+Espaço', action: 'tocar-tras', enabled: true },
    // Rodada 17, PL-31: a mesma porta do ícone da barra de ações. Só ABRE
    // (o "Prévia" do menu Janela é o interruptor, que fecha se estiver à frente).
    {
      label: 'Abrir a Prévia', action: 'mostrar-painel-previa', enabled: true,
      hint: 'Abre a aba Prévia, com a animação aberta tocando ao lado da cena',
    },
    // **Ir para ▸** — rodada 6 (05/10/2026). Os oito de andar no tempo, num
    // submenu: as teclas são o jeito de todo dia, e continuam valendo.
    {
      label: 'Ir para',
      action: 'ir-para',
      enabled: true,
      children: [
        open('Início', 'ir-inicio', 'Home'),
        open('Fim', 'ir-fim', 'End'),
        SEP,
        open('Quadro anterior', 'quadro-anterior', '←'),
        open('Quadro seguinte', 'quadro-seguinte', '→'),
        SEP,
        // Andar de chave em chave é outra coisa de andar de quadro em quadro: um
        // pula onde há pose, o outro anda no relógio — lote 19.
        open('Chave anterior', 'chave-anterior', '↑'),
        open('Chave seguinte', 'chave-seguinte', '↓'),
        { label: 'Chave anterior do escolhido', shortcut: 'Shift+↑', action: 'chave-anterior-escolhido', enabled: true },
        { label: 'Chave seguinte do escolhido', shortcut: 'Shift+↓', action: 'chave-seguinte-escolhido', enabled: true },
      ],
    },
    SEP,
    // Degrau 4a (M6): editar sempre grava. O "Gravar sozinho" e a tecla A
    // saíram; os dois de Chavear ficam, para proteger a pose.
    { ...open('Chavear', 'chavear', 'K'), hint: on ? KEY_HINTS.chavear : KEY_HINTS.base },
    { ...open('Chavear tudo', 'chavear-tudo', 'Ctrl+K'), hint: on ? KEY_HINTS.tudo : KEY_HINTS.base },
    // **Troca de base ▸** — rodada 6. O homem vira lobisomem.
    {
      label: 'Troca de base',
      action: 'troca-de-base',
      enabled: true,
      children: [
        // Degrau 4b (M10, spec 9.13): a virada. Grava a chave `body` no tempo
        // de agora; dali em diante a cena mostra o outro corpo do projeto. Sem
        // tecla de propósito: é gesto de uma vez por animação.
        {
          ...open('Colar outra base aqui', 'colar-corpo'),
          hint: on
            ? 'A virada: dali em diante a cena mostra a base escolhida (o homem vira lobisomem). Era Colar base aqui'
            : 'Abra uma animação primeiro',
        },
        // Porta da rodada 6: a troca saía só pelo Delete da folha.
        {
          label: 'Tirar a troca daqui', action: 'tirar-troca-base', enabled: true,
          hint: 'Tira a troca de base que está no quadro da agulha',
        },
      ],
    },
    SEP,
    open('Apagar chave', 'apagar-chave'),
    { ...open('Apagar as linhas', 'apagar-linhas'), shortcut: 'Shift+Delete' },
    open('Limpar a animação inteira…', 'limpar-animacao'),
    SEP,
    {
      // **Curva da chave**, e não "Interpolação" — anotação 15, item g. Os
      // quatro estavam CINZAS desde o lote 12, esperando um lote que já tinha
      // passado: o botão direito no losango faz isto desde então, e ninguém
      // ligou o menu. Quem não sabia do botão direito não tinha como saber que
      // dava. O nome mudou junto: "curva da chave" diz de que chave se fala.
      label: 'Curva da chave',
      action: 'interpolacao',
      enabled: true,
      children: [
        open('Linear', 'interp-linear'),
        open('Suave', 'interp-suave'),
        // Rodada 40, lote 1: os mesmos nomes dos botões da aba Curvas.
        open('Entrada suave', 'interp-entrada-suave'),
        open('Saída suave', 'interp-saida-suave'),
        open('Parada', 'interp-parada'),
        // Rodada 40, lote 3 (doc 44, b): o mesmo nome da dica do losango.
        open('Curva à mão…', 'interp-curva'),
      ],
    },
    // As **marcas** e o **trecho de laço** — anotação 15, itens a e b. Os dois
    // só existiam em gesto: `M` com o foco na faixa, e `Alt` + clique na
    // régua. Só o "tirar trecho" tinha porta, no ⋯ Mais: havia como desfazer
    // algo que não havia como fazer.
    {
      label: 'Marcas',
      action: 'marcas',
      enabled: true,
      children: [
        open('Pôr ou tirar marca aqui', 'nova-marca', 'M'),
        open('Marca anterior', 'marca-anterior', 'Ctrl+↑'),
        open('Marca seguinte', 'marca-seguinte', 'Ctrl+↓'),
      ],
    },
    // b4 e P41: o evento mora ao lado das Marcas — no Spriter é o botão
    // direito na linha do tempo, e no DragonBones uma camada de evento. Saiu
    // de Esqueleto → Novo; o `Novo ▾` da Árvore continua criando.
    { label: 'Novo evento', action: 'novo-evento', enabled: true },
    {
      label: 'Trecho de laço',
      action: 'trecho',
      enabled: true,
      children: [
        open('Começo do trecho aqui', 'laco-inicio'),
        open('Fim do trecho aqui', 'laco-fim'),
        open('Tirar o trecho', 'tirar-trecho'),
      ],
    },
    // Porta G9/P15 (degrau 12): 🗣️ *"variáveis e tags pela tela,
    // provavelmente — com um jeito de desligar"* (RESPOSTAS Q23). b3 (P33):
    // moravam em Esqueleto; no Spriter elas moram na ANIMAÇÃO (a linha "meta
    // data" da Timeline). Criar e mexer, juntos num submenu só.
    {
      label: 'Variáveis e etiquetas',
      action: 'variaveis-e-etiquetas',
      enabled: true,
      children: [
        {
          label: 'Nova variável', action: 'nova-variavel', enabled: true,
          hint: 'Um valor com nome que a animação muda ao longo do tempo e o jogo lê (§8.4)',
        },
        {
          label: 'Nova etiqueta', action: 'nova-etiqueta', enabled: true,
          hint: 'Liga um trecho da animação a uma palavra: "janela de ataque", "pé no chão" (§8.5)',
        },
        SEP,
        {
          label: 'Apagar a variável', action: 'apagar-variavel', enabled: true,
          hint: 'Com uma variável escolhida na aba Regras: apaga ela e as chaves dela',
        },
        // Portas da rodada 6: o lápis e a lixeira da etiqueta, na aba Regras.
        {
          label: 'Renomear etiqueta', action: 'renomear-etiqueta', enabled: true,
          hint: 'O nome novo entra em toda animação e toda chave que cita a etiqueta. Pergunta qual',
        },
        {
          label: 'Apagar etiqueta', action: 'apagar-etiqueta', enabled: true,
          hint: 'Apaga a etiqueta e tira o nome dela de toda animação e chave. Pergunta qual',
        },
        {
          label: 'Mostrar na aba Regras', action: 'mostrar-variaveis', enabled: true,
          hint: 'Liga e desliga a seção na aba Regras. Desligada, ela diz quantas o arquivo tem',
        },
      ],
    },
    SEP,
    /*
     * **Os efeitos que só gravam chaves** — 22/09/2026, `COMO SE FAZ EFEITO`
     * §6. Num submenu, como as Marcas e o Trecho: o menu Animação já tem perto
     * de cinquenta itens, e três linhas soltas no fim ninguém acharia.
     *
     * As reticências dizem a verdade: as três abrem uma janela de números com
     * prévia, e a prévia diz quantas chaves vão nascer ANTES de nascerem.
     *
     * b5 (P33): "Efeitos de chave", e não "Efeitos" — quem procurava FOGO
     * vinha aqui e achava flash. A dica diz onde a partícula mora: desde a
     * rodada 6, o menu Partículas (os quatro prontos saíram daqui).
     */
    {
      label: 'Efeitos de chave',
      action: 'efeitos',
      enabled: true,
      hint: 'Flash, pulso e tremor viram chaves. Fogo, fumaça e as outras partículas moram no menu Partículas',
      children: [
        {
          ...open('Flash…', 'efeito-flash'),
          hint: on
            ? 'Um pico de luz no desenho escolhido, e volta — grava chaves de Cor escura'
            : 'Abra uma animação primeiro',
        },
        {
          ...open('Pulso…', 'efeito-pulso'),
          hint: on
            ? 'A escala do osso cresce e volta — grava chaves de escala, suaves'
            : 'Abra uma animação primeiro',
        },
        {
          ...open('Tremor…', 'efeito-tremor'),
          hint: on
            ? 'Empurrões sorteados por uma semente: a mesma semente dá sempre o mesmo tremor'
            : 'Abra uma animação primeiro',
        },
        // Os quatro modelos prontos de partícula (Fogo, Fumaça, Faísca,
        // Poeira) foram para o menu Partículas — rodada 6.
      ],
    },
    // **Chaves ▸** — rodada 6. Mexer em muitas chaves de uma vez: são de vez
    // em quando, e o Moho guarda as dele no mesmo lugar.
    {
      label: 'Chaves',
      action: 'chaves',
      enabled: true,
      children: [
        // Sem tecla escrita de propósito: `Ctrl+A` é de "Selecionar tudo", no
        // menu Editar, e dois itens com a mesma tecla ao lado do nome é o que a
        // tabela de atalhos existe para não deixar acontecer.
        { label: 'Selecionar todas as chaves', action: 'selecionar-chaves', enabled: true },
        open('Esticar seleção…', 'esticar-selecao'),
        open('Espelhar no tempo', 'espelhar-tempo'),
        open('Fechar ciclo', 'fechar-ciclo'),
        open('Espelhar esquerda e direita…', 'espelhar-lados'),
        // "Colar espelhado" e "Copiar a pose do escolhido" foram para Editar
        // (b12, P33): no Spriter, todo copiar e colar mora em Edit.
        SEP,
        // Item 4: dá porta à `rippleMove`, que já existia sem gesto — pergunta
        // quantos quadros e o lado. Marque as chaves na folha antes de abrir.
        open('Empurrar as chaves…', 'empurrar-chaves'),
        // Rodada 40, lote 4: as linhas andam e o que passa do fim volta no começo.
        open('Deslocar em laço…', 'deslocar-em-laco'),
        // Item 8: tira a chave que não muda nada — o lixo do gravar-sozinho.
        // Nunca mexe numa chave parada (`stepped`): repetida no valor não quer
        // dizer inútil no tempo.
        open('Limpar chaves repetidas', 'limpar-chaves-repetidas'),
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Janela
// ---------------------------------------------------------------------------

/** Id de cada painel na ordem em que ele aparece no menu "Janela". */
export const WINDOW_PANELS: ReadonlyArray<{ id: string; label: string }> = Object.freeze([
  { id: 'arvore', label: 'Árvore' },
  { id: 'ordem', label: 'Ordem' },
  { id: 'propriedades', label: 'Propriedades' },
  { id: 'animacoes', label: 'Animações' },
  { id: 'peles', label: 'Skins' },
  { id: 'regras', label: 'Regras' },
  { id: 'historico', label: 'Histórico' },
  { id: 'imagens', label: 'Imagens' },
  { id: 'entidades', label: 'Entidades' },
  { id: 'particulas', label: 'Partículas' },
  { id: 'pivos', label: 'Pivôs' },
  { id: 'exibicao', label: 'Exibição' },
  { id: 'previa', label: 'Prévia' },
  { id: 'malha', label: 'Malha e pesos' },
  { id: 'linha-do-tempo', label: 'Linha do tempo' },
  { id: 'curvas', label: 'Curvas' },
]);

/**
 * Os painéis do menu Janela, em **três blocos, pelo que se está fazendo**.
 *
 * Treze nomes numa fila não se leem, e cortar de seis em seis só para caber na
 * regra dá um corte que não quer dizer nada. O corte é pela tarefa:
 *
 * | Bloco | Para quê |
 * |:---|:---|
 * | montar | a estrutura do personagem, e as imagens que entram nela |
 * | animar | o que muda no tempo: animações, peles, regras, e o que já foi feito |
 * | olhar | o que ajuda a ver: exibição, prévia, malha, e a faixa de baixo |
 *
 * Cada bloco tem no máximo cinco, que é menos que o limite de seis da auditoria
 * do lote 19 — e sobra espaço para o próximo painel novo entrar sem obrigar a
 * recortar tudo de novo.
 */
export const WINDOW_GROUPS: ReadonlyArray<readonly string[]> = Object.freeze([
  // c4 (P33, 29/09/2026): a arte abre a montagem (Imagens, Pivôs), a malha é
  // montagem, a linha do tempo e as curvas são do animar, e Propriedades e
  // Histórico são do olhar — servem a qualquer tarefa. Entidades continua
  // colada em Imagens: é a promessa E15 do degrau 5.
  Object.freeze(['imagens', 'entidades', 'pivos', 'arvore', 'ordem', 'malha']),
  // Rodada 15: Partículas no animar — o efeito se afina na linha do tempo.
  Object.freeze(['animacoes', 'linha-do-tempo', 'curvas', 'peles', 'regras', 'particulas']),
  Object.freeze(['propriedades', 'exibicao', 'previa', 'historico']),
]);

/**
 * O menu "Janela".
 *
 * O Spine tem a caixa "Views" e o Live2D tem o menu Window: nos dois, um painel
 * fechado por engano nunca some de verdade, porque há uma lista onde ele
 * continua escrito. Aqui é essa lista.
 *
 * **A marca quer dizer "está na coluna"** — 13/09/2026. Antes ela queria dizer
 * "está à frente do grupo", e com onze abas na tela o menu marcava cinco: as
 * outras seis apareciam fechadas sem estar, a um clique de distância na mesma
 * tira. Era metade da queixa do Humberto, *"o menu janelas não funciona"*; a
 * outra metade era não existir jeito nenhum de fechar um painel.
 *
 * Agora o item é um interruptor: desmarcado abre e traz à frente, marcado e já
 * à frente fecha. **Todo painel fechado continua escrito aqui, com o nome que
 * está na aba** — é a porta de volta, e é o que torna o fechar seguro.
 */
export function windowMenu(state: WindowMenuState): MenuItem[] {
  const rotulo = new Map(WINDOW_PANELS.map((panel) => [panel.id, panel.label]));
  const bloco = (ids: readonly string[]): MenuItem[] => ids
    .filter((id) => rotulo.has(id))
    .map((id) => ({
      label: rotulo.get(id) as string,
      action: `painel-${id}`,
      enabled: true,
      checked: state.open[id] ?? true,
    }));
  return [
    // **Arranjos com nome** — degrau 11, lote 4 (C6). O menu guardava UM
    // arranjo só ("Voltar ao padrão"); agora a tela se guarda com nome e volta
    // por aqui. Os dois de fábrica, Pivô e Visualização, são os modos que o
    // Humberto pediu — lugar para uma tarefa, nunca freio.
    //
    // Rodada 6 (05/10/2026): em cima, como a "Área de trabalho" do Photoshop,
    // e o "Voltar ao padrão" entrou nele — no Photoshop o "Redefinir" mora ali.
    {
      label: 'Arranjos',
      action: 'arranjos',
      enabled: true,
      children: [
        // Rodada 4, lote 8: os contextos — a área de trabalho por tarefa, como
        // no Photoshop. Também no botão do canto de cima.
        ...CONTEXTS.map((contexto): MenuItem => ({
          label: contexto.name, action: contexto.id, enabled: true, hint: contexto.hint,
        })),
        SEP,
        ...(state.arrangements ?? factoryArrangements().map((item) => ({
          id: item.id, name: item.name, factory: true, hint: arrangementHint(item.id),
        }))).map((item): MenuItem => ({
          label: item.name,
          action: item.id,
          enabled: true,
          ...(item.hint === undefined ? {} : { hint: item.hint }),
        })),
        SEP,
        {
          label: 'Guardar este arranjo…',
          action: 'guardar-arranjo',
          enabled: true,
          hint: 'Guarda a tela de agora com um nome, nesta máquina',
        },
        {
          label: 'Apagar um arranjo…',
          action: 'apagar-arranjo',
          enabled: true,
          hint: 'Apaga um arranjo guardado. Os de fábrica ficam',
        },
        SEP,
        { label: 'Voltar ao padrão', action: 'layout-padrao', enabled: true },
      ],
    },
    // **Arrumar ▸** — rodada 6. O "Organizar" do Photoshop: o que se faz com
    // os painéis, e não um painel.
    {
      label: 'Arrumar',
      action: 'arrumar',
      enabled: true,
      children: [
        // Chegaram no lote 12 (item 19). A marca fica ao lado de "Esconder
        // painéis" quando eles estão escondidos, para a tecla nunca virar um
        // interruptor cego.
        { label: 'Esconder painéis', shortcut: 'Tab', action: 'esconder-paineis', enabled: true },
        // Rodada 4, lote 6: o Photoshop tem dois — Tab esconde tudo; Shift+Tab
        // esconde os painéis e deixa as ferramentas. Aqui a linha do tempo fica.
        {
          label: 'Esconder só as colunas',
          shortcut: 'Shift+Tab',
          action: 'esconder-colunas',
          enabled: true,
          hint: 'Somem as colunas e os painéis soltos; a linha do tempo fica. De novo, voltam',
        },
        // Rodada 4, lote 1 (05/10/2026): o Photoshop solta o painel puxando a
        // aba. O gesto existe; este item é a porta dele no menu, como o `05`
        // reservou.
        {
          label: 'Soltar o painel da parede',
          action: 'soltar-painel',
          enabled: true,
          hint: 'Solta o painel em uso, no alto da cena. Puxar a aba para fora faz o mesmo',
        },
        // Rodada 4, lote 2: a setinha dupla no topo de cada coluna, no menu.
        {
          label: 'Recolher em ícone',
          action: 'recolher-em-icone',
          enabled: true,
          hint: 'As duas colunas viram faixas de ícones, e a cena cresce. O ícone abre o painel ao lado',
        },
        {
          label: 'Expandir',
          action: 'expandir-paineis',
          enabled: true,
          hint: 'As colunas em ícones voltam a ser colunas',
        },
        // Lote 16: a bancada tem duas colunas. Arrastar uma aba de um lado ao
        // outro atravessa a cena com o mouse, que é um gesto que ninguém acerta
        // de primeira; o botão direito na aba e este item fazem o mesmo.
        {
          label: 'Mover para a outra coluna',
          action: 'mover-de-coluna',
          enabled: true,
          hint: 'Mover um painel para a outra coluna: pergunta qual',
        },
        // Fechar o grupo saiu da TIRA em 13/09/2026: o botão dele custava 27 px
        // de largura ali. O gesto virou o botão direito na tira — e botão
        // direito é gesto escondido, então ele PRECISA desta porta visível.
        {
          label: 'Fechar o grupo',
          action: 'fechar-grupo',
          enabled: true,
          hint: 'Fecha o grupo de abas em uso. Cada painel volta pela lista do menu Janela',
        },
        // Lote 14 (rodada 3): a faixa de baixo nasce fechada, e este item é a
        // segunda porta do botão Detalhes. A marca acende quando ela está aberta.
        { label: 'Detalhes da linha do tempo', action: 'detalhes-faixa', enabled: true },
      ],
    },
    SEP,
    ...bloco(WINDOW_GROUPS[0] as readonly string[]),
    SEP,
    ...bloco(WINDOW_GROUPS[1] as readonly string[]),
    SEP,
    ...bloco(WINDOW_GROUPS[2] as readonly string[]),
  ];
}

// ---------------------------------------------------------------------------
// Ajuda
// ---------------------------------------------------------------------------

/**
 * O menu "Ajuda".
 *
 * O manual, a tabela de atalhos e o "Sobre". Um programa cuja ajuda está
 * escondida numa pasta é um programa cuja ajuda ninguém lê, então ela fica na
 * barra de menus como qualquer outro comando.
 */
export function helpMenu(): MenuItem[] {
  return [
    { label: 'Manual', shortcut: 'F1', action: 'manual', enabled: true },
    {
      label: 'Atalhos do teclado',
      shortcut: 'Shift+F1',
      action: 'atalhos',
      enabled: true,
      // 22/09: a janela ganhou o botão "Procurar um comando…", e a dica diz
      // isso — quem abre os Atalhos procurando *onde está* uma coisa está a um
      // clique de quem a acha por nome, e não tinha como saber.
      hint: 'A lista de teclas, com o lápis para trocar — e o botão de procurar um comando pelo nome',
    },
    // Degrau 11, lote 6: a Janela de Problemas. O botão do rodapé também a
    // abre; um gesto só no rodapé seria uma porta que ninguém acha quando não
    // há aviso nenhum aceso.
    {
      label: 'Problemas do arquivo…',
      action: 'problemas',
      enabled: true,
      hint: 'O que o programa não entendeu ao ler este arquivo, com o conserto onde há',
    },
    // A paleta mora no Ajuda porque a pergunta que ela responde é uma pergunta
    // de ajuda: "existe isso, mas em que menu está?".
    //
    // **A dica, 22/09/2026** — lote 2 do plano `COMO SABER O QUE O PROGRAMA
    // TEM`. O Humberto não sabia que esta linha existia, e ela responde
    // exatamente a pergunta dele. O nome "Paleta de comandos" é palavra de
    // programador: quem está perdido não procura uma paleta, procura *uma
    // coisa que ele sabe que existe*. Então a dica é escrita na língua dele, e
    // é ela que aparece quando o dedo para em cima da linha.
    //
    // Porta que ninguém encontra é porta que não conta.
    {
      label: 'Paleta de comandos',
      shortcut: 'Ctrl+Shift+P',
      action: 'paleta',
      enabled: true,
      hint: 'Sei que existe, mas em qual menu está? Digite parte do nome e o comando aparece — sem acento serve',
    },
    { label: 'Sobre o Recorte', action: 'sobre', enabled: true },
  ];
}

// ---------------------------------------------------------------------------
// Os doze, de uma vez
// ---------------------------------------------------------------------------

/**
 * Os doze menus, na ordem da barra.
 *
 * É desta lista que sai a tabela de atalhos e o mapa de teclas: uma fonte só,
 * nunca uma segunda lista escrita à mão que envelhece sozinha.
 */
export function allMenus(state: MenuState): MenuGroupDef[] {
  return [
    // Rodada 6 (05/10/2026), `05 O DESENHO DOS MENUS`, aprovado pelo
    // Humberto: **a ordem do trabalho, como no Spriter** — trazer as imagens →
    // montar a base → malha e regras → animar → vestir (skins) → encaixar
    // (entidades) → efeito (partículas); e então olhar. Um menu por tipo de
    // coisa, como o Image e o Layer do Photoshop. Eram sete: Arquivo · Editar
    // · Esqueleto · Animação · Exibir · Janela · Ajuda.
    { label: 'Arquivo', entries: fileMenu(state) },
    { label: 'Editar', entries: editMenu(state) },
    { label: 'Imagens', entries: imagesMenu() },
    { label: 'Base', entries: skeletonMenu(state) },
    { label: 'Malha e regras', entries: meshRulesMenu() },
    { label: 'Animação', entries: animationMenu(state) },
    { label: 'Skins', entries: skinsMenu() },
    { label: 'Entidades', entries: entitiesMenu() },
    { label: 'Partículas', entries: particlesMenu() },
    { label: 'Exibir', entries: viewMenu(state.view, state) },
    { label: 'Janela', entries: windowMenu(state) },
    { label: 'Ajuda', entries: helpMenu() },
  ];
}

/** Toda entrada de um menu, submenus incluídos, em ordem de leitura. */
export function flatEntries(entries: readonly MenuItem[]): MenuEntry[] {
  const out: MenuEntry[] = [];
  for (const item of entries) {
    if (isSeparator(item)) continue;
    out.push(item);
    if (item.children !== undefined) out.push(...flatEntries(item.children));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Atalhos
// ---------------------------------------------------------------------------

/** O nome que cada tecla escrita no menu tem no `KeyboardEvent`. */
const KEY_NAMES: Readonly<Record<string, string>> = Object.freeze({
  espaço: ' ',
  esc: 'escape',
  '←': 'arrowleft',
  '→': 'arrowright',
  '↑': 'arrowup',
  '↓': 'arrowdown',
  '−': '-',
  '=': '=',
});

/**
 * O atalho escrito no menu, virado num nome só, sempre igual.
 *
 * "Ctrl+Shift+S" e "shift+ctrl+s" são a mesma tecla e têm que dar o mesmo
 * nome, senão o mapa teria duas entradas para o mesmo gesto e uma delas nunca
 * seria encontrada. Os modificadores saem sempre em ctrl, alt, shift.
 */
export function normalizeShortcut(shortcut: string): string {
  const whole = shortcut.trim().toLowerCase();
  // "+" e "−" são teclas, e "+" é também o sinal que separa os modificadores:
  // partir uma tecla de um caractere só apagaria justamente essas duas.
  if (whole.length === 1) return KEY_NAMES[whole] ?? whole;
  const parts = shortcut.split('+').map((part) => part.trim().toLowerCase()).filter((p) => p !== '');
  const mods = new Set<string>();
  let key = '';
  for (const part of parts) {
    if (part === 'ctrl' || part === 'cmd' || part === 'meta') mods.add('ctrl');
    else if (part === 'alt') mods.add('alt');
    else if (part === 'shift') mods.add('shift');
    else key = KEY_NAMES[part] ?? part;
  }
  const order = ['ctrl', 'alt', 'shift'].filter((mod) => mods.has(mod));
  return [...order, key].join('+');
}

/** O mesmo nome, a partir do que o teclado mandou. */
export function shortcutOfEvent(
  event: { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean; shiftKey: boolean },
): string {
  const mods: string[] = [];
  if (event.ctrlKey || event.metaKey) mods.push('ctrl');
  if (event.altKey) mods.push('alt');
  // Shift num sinal já reescreve a tecla — "=" apertado com Shift chega como
  // "+" —, e aí somar "shift" ao nome contaria a mesma coisa duas vezes. Em
  // letra, em espaço e em tecla de nome comprido (F1, seta, Home) ele não
  // reescreve nada, e aí ele faz parte do gesto.
  const key = event.key.toLowerCase();
  const shiftCounts = key.length > 1 || key === ' ' || /^[a-z]$/.test(key);
  if (event.shiftKey && shiftCounts) mods.push('shift');
  return [...mods, key].join('+');
}

/**
 * De tecla para ação: o mapa que o `shell` consulta no teclado.
 *
 * Sai dos próprios menus, então uma tecla escrita ao lado do item é a tecla que
 * funciona, sempre — não há como as duas discordarem.
 */
export function shortcutMap(menus: readonly MenuGroupDef[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const group of menus) {
    for (const entry of flatEntries(group.entries)) {
      if (entry.shortcut === undefined) continue;
      const key = normalizeShortcut(entry.shortcut);
      if (!map.has(key)) map.set(key, entry.action);
    }
  }
  return map;
}

/** Uma linha da tabela de Ajuda → Atalhos. */
export interface ShortcutRow {
  menu: string;
  item: string;
  shortcut: string;
}

/**
 * A tabela de atalhos, gerada dos menus.
 *
 * Não é uma lista à parte: é a mesma fonte. Uma folha de atalhos escrita à mão
 * fica errada no primeiro lote que mexe numa tecla, e ninguém percebe.
 *
 * Os gestos da cena que não são item de menu (Espaço + arrastar, Ctrl + setas)
 * e as letras das ferramentas moram em `ui/keys.ts` desde o lote A1; a Ajuda
 * sai de `shortcutRows(keyTable(menus))`, que começa por estas linhas.
 */
export function shortcutTable(menus: readonly MenuGroupDef[]): ShortcutRow[] {
  const rows: ShortcutRow[] = [];
  for (const group of menus) {
    for (const entry of flatEntries(group.entries)) {
      if (entry.shortcut === undefined) continue;
      rows.push({ menu: group.label, item: entry.label, shortcut: entry.shortcut });
    }
  }
  return rows;
}

/**
 * **O item cinza que diz por quê** — rodada 17 (sobra da rodada 9, a recusa
 * do slot). Um item cinza com motivo continua clicável, e o clique escreve o
 * motivo no rodapé, sem rodar nada; sem motivo, fica `disabled` como antes.
 * Devolve a frase do rodapé, ou `null` quando o clique roda a ação (ou não há
 * o que dizer).
 */
export function greyItemSays(enabled: boolean, why: string | null): string | null {
  return enabled || why === null || why.trim() === '' ? null : why;
}
