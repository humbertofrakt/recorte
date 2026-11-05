/**
 * Toda ação dos doze menus, com dono — lote A2, plano arrumação (v10.5); doze
 * desde a rodada 6 (05/10/2026).
 *
 * O Humberto, 11/09: *"organizar o programa para só abrir a parte que vamos
 * mexer"*. Esta tabela diz, para cada item de menu, **quem faz** e **quando a
 * ação existe**:
 *
 * | `where` | Quem registra | A ação existe |
 * |:---|:---|:---|
 * | `arranque` | `registerCoreActions(doc)`, no `main.ts`, logo depois do documento | sempre, com qualquer aba fechada, e num teste sem navegador |
 * | `casca` | a casca (`ui/shell.ts`), ou o `main.ts` | sempre que o programa está aberto |
 * | `painel` | o painel, ao montar (a cena também é um painel) | com o painel montado |
 * | `submenu` | ninguém: é o item que abre um submenu | — |
 *
 * `needsPanel` é `true` só para `painel`. Uma ação vai para o arranque quando a
 * conta dela está num modelo e ela não lê nada do DOM do painel. As que ficam
 * no painel dizem por quê, no comentário do grupo.
 *
 * Ação nova: o id no grupo do dono. O teste `acoes` confere que todo item de
 * menu está aqui, e que as de arranque existem sem painel nenhum.
 *
 * Módulo puro: lê os menus, e só.
 */

import { NEUTRAL_MENU_STATE, WINDOW_PANELS, allMenus, flatEntries } from './menus.js';

/** A parte do programa que faz a ação. */
export type ActionOwner =
  | 'casca' | 'cena' | 'arvore' | 'ordem' | 'linha-do-tempo' | 'exibicao'
  | 'animacoes' | 'peles' | 'regras' | 'documento' | 'imagens';

/** Quem registra a ação, e portanto quando ela existe. */
export type ActionWhere = 'arranque' | 'casca' | 'painel' | 'submenu';

/** Uma linha da tabela. */
export interface ActionRow {
  /** O id no registro de ações: `'subir-ordem'`. */
  id: string;
  /** O nome no menu: `'Trazer para a frente'`. */
  label: string;
  owner: ActionOwner;
  where: ActionWhere;
  /** `true` = só existe com o painel montado. */
  needsPanel: boolean;
  /** Quando fica cinza, por escrito. Só nas de arranque. */
  greyWhen?: string;
}

interface ActionGroup {
  owner: ActionOwner;
  where: ActionWhere;
  ids: readonly string[];
}

/** Os grupos, por dono. A ordem é a do programa: casca, cena, painéis. */
const GROUPS: readonly ActionGroup[] = Object.freeze([
  // ---- A casca: arquivo, desfazer, seleção, ajuda, janelas --------------
  {
    owner: 'casca', where: 'casca', ids: [
      'novo', 'abrir', 'abrir-pasta', 'abrir-recente', 'reabrir',
      // Degrau 10: o projeto é a caixa — abrir outro `.bone` para dentro dela,
      // entregar um corpo ao jogo, e o Novo/Por cima da entidade editada.
      'abrir-corpo', 'abrir-entidade', 'entregar-corpo', 'salvar-entidade',
      'salvar', 'salvar-como', 'salvar-binario', 'salvar-pacote',
      'importar-programa', 'importar-psd', 'importar-psd-ossos',
      'exportar-gltf', 'exportar-imagem', 'exportar-pele', 'repetir-exportacao',
      'configuracoes', 'sair',
      'desfazer', 'refazer', 'selecionar-tudo', 'desmarcar', 'substituir-nomes',
      'escolher-filhos', 'escolher-pais', 'copiar-ancora', 'colar-ancora', 'preferencias',
      'tema-escuro', 'tema-claro', 'cebola-opcoes', 'nome-das-ferramentas',
      'novo-imagem', 'trocar-imagem-todas-peles',
      'esconder-paineis', 'mover-de-coluna', 'fechar-grupo', 'detalhes-faixa', 'layout-padrao',
      // Rodada 4, lote 1: a porta de menu do gesto de puxar a aba.
      'soltar-painel',
      // Rodada 4, lote 2: a setinha dupla, no menu.
      'recolher-em-icone', 'expandir-paineis',
      // Rodada 4, lote 6: o Shift+Tab.
      'esconder-colunas',
      // Rodada 4, lote 8: os contextos, em Janela → Arranjos e no botão.
      'contexto-montar', 'contexto-animar', 'contexto-pesos',
      // Degrau 11, lote 4 (C6): os arranjos com nome. Os dois de fábrica são
      // ids fixos; um arranjo guardado por quem usa ganha o id do nome dele,
      // e a casca o registra quando ele nasce.
      'arranjo-pivo', 'arranjo-visualizacao', 'guardar-arranjo', 'apagar-arranjo',
      'manual', 'atalhos', 'problemas', 'paleta', 'sobre', 'quero-fazer',
    ],
  },
  // O menu Janela: um item por painel, todos da casca.
  { owner: 'casca', where: 'casca', ids: WINDOW_PANELS.map((panel) => `painel-${panel.id}`) },
  // Rodada 17, PL-31: Animação → Abrir a Prévia, a porta do ícone da barra.
  // Só abre (o `painel-previa` acima é o interruptor do menu Janela).
  { owner: 'casca', where: 'casca', ids: ['mostrar-painel-previa'] },
  // O `main.ts` registra: é ele que sabe onde o exemplo mora.
  { owner: 'documento', where: 'casca', ids: ['abrir-exemplo'] },
  // Itens que só abrem um submenu. Não são ações.
  {
    owner: 'casca', where: 'submenu', ids: [
      'importar', 'exportar', 'escolher', 'tema', 'novo-item', 'compensar', 'eixos',
      // Degrau 11, lote 4: o submenu dos arranjos com nome.
      'arranjos',
      'interpolacao', 'marcas', 'trecho', 'efeitos',
      // A ordem dos menus (P33, P41 — 29/09/2026): os submenus novos.
      'animacoes', 'travar',
      // a4 (29/09/2026): o "No fim" do tocador.
      'no-fim',
      // Rodada 6 (05/10/2026): as cabeças de submenu do desenho dos menus.
      // "trazer-para-projeto" e "peles" saíram com os menus de que eram parte.
      'pose', 'ir-para', 'troca-de-base', 'chaves', 'ver-o-boneco', 'ver-a-cena', 'arrumar',
      // Rodada 6, lote 2: as cabeças do menu Malha e regras.
      'malha', 'pesos',
    ],
  },

  // ---- A cena: câmera, pose de repouso, eixos. Sempre montada -------------
  {
    owner: 'cena', where: 'painel', ids: [
      'aproximar', 'afastar', 'ajustar', 'tamanho-real', 'enquadrar',
      'repouso-osso', 'repouso-todos', 'inverter-selecao', 'virar-filho', 'imagem-referencia',
      'compensar-filhos', 'compensar-desenhos', 'compensar-caixas',
      // Degrau 7, tarefa 7.5: as duas portas do botão direito na cena.
      'ferramenta-de-antes', 'opcoes-do-desenho',
      'eixos-local', 'eixos-pai', 'eixos-mundo',
      // N-4b: o recorte da exportação, arrastado na cena (`viewport/crop-model.ts`).
      'recorte-na-cena', 'tirar-recorte',
    ],
  },
  // Rodada final, chat B, lote 1 (P5): os modelos prontos de partícula.
  // Registrados pela barra da cena (`viewport/viewport-toolbar.ts`), onde mora
  // o botão Partículas; a cena está sempre montada. O pacote da imagem pede um
  // `<canvas>`, e é por isso que não são de arranque.
  {
    owner: 'cena', where: 'painel', ids: [
      'particulas-fogo', 'particulas-fumaca', 'particulas-faisca', 'particulas-poeira',
    ],
  },

  // ---- Árvore -------------------------------------------------------------
  {
    owner: 'arvore', where: 'arranque', ids: [
      'duplicar', 'novo-osso', 'novo-ponto', 'novo-caixa',
      'novo-ponto-no-slot', 'novo-caixa-no-slot', 'novo-mascara', 'novo-evento', 'novo-parametro',
      // Extensão `BONE_particles`: o emissor. Registrado em `tree-actions.ts`,
      // no arranque, como os irmãos dele — o Novo ▾ e o menu Esqueleto usam o
      // MESMO id, e é por isso que ele funciona com a aba Árvore fechada.
      'novo-emissor',
      'apagar', 'limpar-slots-vazios',
      // Rodada 13: as chaves das peças tiradas da base.
      'chaves-guardadas',
    ],
  },
  // Buscar abre o campo da Árvore; Renomear abre o campo na linha dela.
  { owner: 'arvore', where: 'painel', ids: ['buscar', 'renomear'] },

  // ---- Ordem de desenho ---------------------------------------------------
  {
    owner: 'ordem', where: 'arranque', ids: [
      'subir-ordem', 'descer-ordem', 'frente-de-tudo', 'fundo-de-tudo', 'tirar-da-pasta',
      'copiar-ordem-animacao',
    ],
  },
  // Nova pasta pergunta o nome numa janela da aba.
  { owner: 'ordem', where: 'painel', ids: ['nova-pasta'] },

  // ---- Exibição: o que a cena mostra e o que se trava ---------------------
  // Registradas pelo painel Exibição, que escreve e redesenha as caixas dele.
  {
    // I3, chat I, 29/09/2026 (P23): de ARRANQUE, em `view-panel-actions.ts`.
    // Fechar a aba deixava o botão do alto e o menu Exibir sem ação.
    owner: 'exibicao', where: 'arranque', ids: [
      'ver-ossos', 'ver-desenhos', 'ver-nomes', 'ver-pontos', 'ver-caixas', 'ver-mascaras',
      'ver-malhas', 'ver-arestas', 'ver-pesos', 'ver-grade', 'ver-reguas', 'ver-eixos', 'ver-cebola',
      'ver-nome-no-cursor', 'ver-guias', 'travar-guias', 'limpar-guias',
      'esconder-escolhido', 'so-este', 'mostrar-tudo', 'ver-resultado',
      'travar-ossos', 'travar-desenhos', 'travar-escolhido', 'travar-resto', 'destravar-tudo',
    ],
  },

  // ---- Animações ----------------------------------------------------------
  // Degrau 12, parte `B` (18/09/2026): a biblioteca. Exportar animação abre a
  // janela de marcar; Importar animação pede o arquivo e mostra o que este
  // corpo não tem ANTES de aplicar. As duas moram no arranque porque não leem
  // o DOM da aba — é a mesma divisão de `nova-animacao`.
  {
    owner: 'animacoes', where: 'arranque', ids: [
      'abrir-a-base', 'nova-animacao', 'exportar-animacao', 'importar-animacao',
      'biblioteca-animacoes',
      // Reaproveitar (04/11/2026): muitos bonecos, as mesmas animações.
      'usar-animacoes', 'seguir-esqueleto-padrao',
    ],
  },
  // Colar corpo aqui pergunta qual corpo numa janela: é da casca (degrau 4b).
  { owner: 'animacoes', where: 'casca', ids: ['colar-corpo'] },
  // Duplicar, renomear, apagar e mandar para o topo agem na animação da lista.
  {
    owner: 'animacoes', where: 'painel', ids: [
      'duplicar-animacao', 'renomear-animacao', 'apagar-animacao', 'mandar-para-o-topo',
    ],
  },

  // ---- Peles e regras -----------------------------------------------------
  // Degrau 9 (18/09/2026): Exportar pele, Importar pele e Promover pele a base.
  // `importar-pele` morava no PAINEL; é de arranque desde 29/09/2026 (I3,
  // P23): o seletor de arquivo não é da aba, e o menu ficava sem ação.
  // `exportar-pele` (Arquivo › Por pele…) FATIA o corpo inteiro; este aqui
  // grava só a roupa, num `.bone` com `rig`, para entrar noutro corpo. São
  // duas coisas, e por isso são dois ids (regra 17).
  { owner: 'peles', where: 'arranque', ids: ['nova-pele', 'exportar-pele-arquivo', 'promover-pele-base'] },
  { owner: 'peles', where: 'arranque', ids: ['importar-pele'] },
  // Rodada 12 (04/10/2026): Esconder e Ignorar nesta pele, o Set Hidden e o
  // Set Ignored do Spriter. Menu Esqueleto › Peles e a grade do botão direito.
  { owner: 'peles', where: 'arranque', ids: ['esconder-na-pele', 'ignorar-na-pele'] },
  /*
   * **As nove da aba Regras são de ARRANQUE desde 22/09** — defeito 2.
   *
   * Eram `'painel'`, e isso não era rótulo errado: era o defeito escrito na
   * tabela. Ação de painel só existe enquanto o painel está montado, e com a
   * aba Regras fechada o menu chamava sem que nada acontecesse **e sem
   * avisar**. Agora nascem com o documento (`registerRuleActions`, em
   * `panels/rules.ts`) e cada uma traz a aba à frente antes de agir — o
   * mesmo molde da pele, desde o lote A2.
   *
   * `fisica` e `variaveis-e-etiquetas` continuam onde estavam: são o item que
   * abre o submenu, e não uma ação que alguém registre.
   */
  { owner: 'regras', where: 'arranque', ids: ['nova-regra-guiada'] },
  // Porta D6 (degrau 12): os três gestos da física. Um id cada, regra 17.
  { owner: 'regras', where: 'painel', ids: ['fisica'] },
  {
    owner: 'regras', where: 'arranque', ids: [
      'fisica-simular', 'fisica-reiniciar', 'fisica-reiniciar-todas', 'fisica-assar',
    ],
  },
  // Porta G9/P15 (degrau 12): variáveis e marcas, com o desligar (Q23).
  { owner: 'regras', where: 'painel', ids: ['variaveis-e-etiquetas'] },
  {
    owner: 'regras', where: 'arranque', ids: [
      'nova-variavel', 'apagar-variavel', 'nova-etiqueta', 'mostrar-variaveis',
    ],
  },

  // ---- Imagens e pivô: P33 (rodada final, 29/09/2026, chat H) --------------
  // O pivô só existia em painel. As quatro nascem com o documento
  // (`panels/palette-actions.ts`), e a aba Imagens chama as mesmas contas.
  {
    owner: 'imagens', where: 'arranque', ids: [
      'definir-pivo', 'carimbar-pivos', 'recarregar-pasta', 'trocar-pasta-origem',
      // Rodada 8a: a imagem de antes volta. Mora em `palette-actions.ts`.
      'tirar-entidade',
      // Rodada 6, lote 2: as portas do botão direito da aba Imagens.
      'trazer-sequencia', 'copiar-pivo', 'colar-pivo',
      // Rodada 44, lote 7: o desenho trocado cabe no tamanho do que saiu.
      'caber-na-antiga',
      // Rodada 13, caso (b): o pivô à mão volta para onde o osso está.
      'voltar-pivo-osso',
    ],
  },
  // ---- As portas da rodada 6, lote 2 (05/10/2026) -------------------------
  // De ARRANQUE: cada uma nasce com o documento e, quando precisa da aba,
  // traz a aba à frente antes de agir (o molde de `rules-actions.ts`).
  {
    // `panels/mesh-actions.ts`: as doze da aba Malha e pesos.
    owner: 'cena', where: 'arranque', ids: [
      'virar-malha', 'malha-automatica', 'tracar-contorno', 'criar-vertice', 'apagar-vertice',
      'usar-forma-de-outra', 'ligar-ossos', 'pesos-automaticos', 'suavizar-pesos', 'podar-pesos',
      'chavear-pesos', 'tirar-pesos',
      // Rodada 41, lote 4.
      'criar-aresta',
    ],
  },
  {
    // `panels/rules-actions.ts`: o lápis, a chave e as lixeiras da aba Regras.
    owner: 'regras', where: 'arranque', ids: [
      'trocar-ossos-regra', 'apagar-regra', 'chave-parametro', 'apagar-parametro',
      'renomear-etiqueta', 'apagar-etiqueta',
    ],
  },
  {
    // `panels/animations-actions.ts`: os botões da janela Animação e a troca.
    owner: 'animacoes', where: 'arranque', ids: ['salvar-base-nova', 'rebaixar-entidade', 'tirar-troca-base'],
  },
  {
    // `panels/skins-actions.ts`: os botões e o lápis da aba Peles.
    owner: 'peles', where: 'arranque', ids: ['clonar-pele', 'pele-de-pasta', 'apagar-pele', 'editar-pele',
      // Noite de 04/11/2026: a grade peça × skin.
      'guarda-roupa'],
  },
  {
    // `panels/entities-actions.ts` e `panels/particles-actions.ts`.
    owner: 'imagens', where: 'arranque', ids: [
      'por-entidade', 'escolher-animacao-entidade', 'promover-entidade', 'prender-emissor',
      // Rodada 8c, C15.
      'entidade-em-laco',
      // Rodada 11: "Este boneco" (7.11, `around`).
      'este-boneco', 'tirar-este-boneco',
      // Rodada 9: marcar a imagem como slot, e a volta.
      'marcar-como-slot', 'desmarcar-slot',
      // Rodada 39, lote 2: a montagem de teste (aba Entidades), pelo menu.
      'por-em-teste', 'desligar-teste',
      // Lote 4: para cima.
      'por-dentro-de', 'tirar-de-volta',
      // Lote 5: o teste vira arquivo.
      'por-no-projeto',
      // Rodada 39b, lote 6: o cartão de teste — o que toca, as skins, as iguais.
      'anima-do-teste', 'skins-do-teste', 'teste-nas-iguais',
    ],
  },

  // ---- Os efeitos que so gravam chaves ------------------------------------
  /*
   * Flash, pulso e tremor (22/09/2026) — `COMO SE FAZ EFEITO`, §6: os tres que
   * a pesquisa chamou de **"so porta"**. Nenhum e campo novo, nenhum e modo:
   * eles gravam chaves comuns e somem, e dai em diante as chaves sao de quem
   * usa. A conta esta em `anim/efeitos.ts`; a porta, em `ui/efeitos-actions.ts`
   * — `anim/` e degrau 1 e nao pode importar o registro de acoes.
   *
   * De ARRANQUE porque a escolha vem de `doc.selection` e o tempo de
   * `doc.time`: nenhuma le o DOM de painel nenhum. Ficam cinzas sem animacao
   * aberta ou sem nada escolhido, que e uma resposta; o rodape diz o resto.
   */
  {
    owner: 'linha-do-tempo', where: 'arranque', ids: [
      'efeito-flash', 'efeito-pulso', 'efeito-tremor',
    ],
  },

  // ---- Linha do tempo -----------------------------------------------------
  { owner: 'linha-do-tempo', where: 'arranque', ids: ['copiar-pose', 'copiar-pose-escolhido', 'colar-todas-chaves'] },
  // a4 (chat D, 29/09): o "No fim" do tocador, que só existia no ⋯ Mais.
  {
    owner: 'linha-do-tempo', where: 'arranque', ids: [
      'fim-arquivo', 'fim-parar', 'fim-repetir', 'fim-vai-e-volta', 'fim-voltar',
    ],
  },
  /*
   * **O tocador é de ARRANQUE desde 22/09/2026.** Era `'painel'`, e isso
   * **prometia que a BARRA DE ESPAÇO pode sumir** junto com a linha do tempo.
   *
   * Hoje ela não some, e é por acidente: os painéis da faixa de baixo nunca
   * desmontam (`ui/shell.ts:783`), por um motivo bom e antigo que não tem nada
   * a ver com a barra de espaço — não perder seleção, rolagem e campo em
   * digitação. **A casca salvava a tabela sem saber.**
   *
   * E é por isso que aba de COLUNA e faixa de BAIXO não são o mesmo caso:
   * coluna fecha de verdade (foi o defeito 2, da aba Regras, em 19/09), faixa
   * não fecha nunca. Quem for julgar o próximo `where: 'painel'` precisa saber
   * disso antes de decidir se o silêncio é vivo ou latente.
   */
  { owner: 'linha-do-tempo', where: 'arranque', ids: ['tocar', 'tocar-tras'] },
  // O resto lê a folha: as chaves e as linhas escolhidas nela, o tocador, as
  // marcas e o trecho de laço desenhados nela.
  {
    owner: 'linha-do-tempo', where: 'painel', ids: [
      'copiar', 'colar', 'colar-espelhado', 'recortar-chaves',
      'mudar-duracao', 'repetir',
      'ir-inicio', 'ir-fim', 'quadro-anterior', 'quadro-seguinte',
      'chave-anterior', 'chave-seguinte', 'chave-anterior-escolhido', 'chave-seguinte-escolhido',
      'chavear', 'chavear-tudo', 'apagar-chave', 'apagar-linhas', 'limpar-animacao',
      'interp-linear', 'interp-suave', 'interp-parada', 'interp-curva',
      // Rodada 40, lote 1: os dois suaves do gráfico também no menu da chave.
      'interp-entrada-suave', 'interp-saida-suave',
      'nova-marca', 'marca-anterior', 'marca-seguinte', 'laco-inicio', 'laco-fim', 'tirar-trecho',
      'selecionar-chaves', 'esticar-selecao', 'espelhar-tempo', 'fechar-ciclo', 'espelhar-lados',
      'empurrar-chaves', 'limpar-chaves-repetidas',
      // Rodada 40, lote 4: o Offset do Spine.
      'deslocar-em-laco',
      // Rodada 17, PL-25: o meio-termo, em Editar → Pose.
      'meio-termo', 'meio-termo-anterior', 'meio-termo-seguinte',
    ],
  },
]);

/** Quando uma ação de arranque fica cinza. As outras dizem no próprio menu. */
const GREY_WHEN: Readonly<Record<string, string>> = Object.freeze({
  duplicar: 'sem nada escolhido que se duplique',
  'novo-ponto-no-slot': 'sem um desenho escolhido',
  'novo-caixa-no-slot': 'sem um desenho escolhido',
  apagar: 'sem nada escolhido, ou só a raiz',
  'limpar-slots-vazios': 'sem nenhum desenho vazio no arquivo',
  'subir-ordem': 'sem desenho escolhido',
  'descer-ordem': 'sem desenho escolhido',
  'frente-de-tudo': 'sem desenho escolhido',
  'fundo-de-tudo': 'sem desenho escolhido',
  'tirar-da-pasta': 'sem peça de pasta escolhida',
  'copiar-ordem-animacao': 'sem animação aberta',
  'copiar-pose': 'sem animação aberta',
  'colar-todas-chaves': 'sem animação aberta, ou sem nada copiado',
  'tirar-entidade': 'sem uma entidade escolhida que tenha substituído uma imagem',
});

/** A tabela inteira, com o nome de cada item tirado dos próprios menus. */
function buildTable(): ActionRow[] {
  const labels = new Map<string, string>();
  for (const group of allMenus(NEUTRAL_MENU_STATE)) {
    for (const entry of flatEntries(group.entries)) {
      if (!labels.has(entry.action)) labels.set(entry.action, entry.label);
    }
  }
  return GROUPS.flatMap((group) => group.ids.map((id): ActionRow => ({
    id,
    label: labels.get(id) ?? '',
    owner: group.owner,
    where: group.where,
    needsPanel: group.where === 'painel',
    ...(GREY_WHEN[id] === undefined ? {} : { greyWhen: GREY_WHEN[id] }),
  })));
}

/** Toda ação dos menus, com dono. */
export const ACTION_TABLE: readonly ActionRow[] = Object.freeze(buildTable());

/** A linha de uma ação, ou `null`. */
export function actionRow(id: string): ActionRow | null {
  return ACTION_TABLE.find((row) => row.id === id) ?? null;
}
