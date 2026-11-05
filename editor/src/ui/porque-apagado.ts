/**
 * Por que este item está apagado — e o que fazer. Noite de 04/11/2026.
 *
 * O Humberto: *"eu pedia algo, o Claude dizia que programava, mas não aparecia
 * na tela"*. Um item cinza sem motivo é a mesma coisa vista de perto: a porta
 * existe, mas não diz como se abre. O percurso do manual achou um assim:
 * **Editar → Colar espelhado** ficava cinza e a dica falava do que ele faz,
 * não de por que não fazia.
 *
 * A regra: **toda ação que pode ficar cinza diz por quê, e o que fazer.**
 * Quem registra a ação pode dizer o motivo de AGORA (`why` no
 * `registerAction`): esse vence, porque sabe mais. Quem não diz cai aqui, num
 * motivo fixo, escrito para quem lê: primeiro o porquê, depois o gesto.
 *
 * O teste `porque-apagado.test.ts` varre o código: toda ação registrada com
 * `enabled` tem `why` ou tem linha nesta tabela. Ação nova que pode ficar
 * cinza: uma linha aqui, ou um `why` no registro.
 *
 * Módulo puro: texto e uma função.
 */

/** "Abra uma animação primeiro" — o motivo mais comum da linha do tempo. */
const ANIMACAO = 'Abra uma animação primeiro: clique numa, na aba Animações';
const CHAVES_COPIADAS = 'Copie antes: escolha chaves na linha do tempo e use Editar → Copiar (Ctrl+C)';
const DESENHO = 'Escolha um desenho primeiro: clique nele na cena ou na Árvore';
const ESCOLHA = 'Escolha algo primeiro: clique na cena ou na Árvore';
const OSSO_NA_ANIMACAO = 'Abra uma animação e escolha um osso: clique nele na cena ou na Árvore';

/** O motivo fixo, por id de ação. */
export const PORQUE_APAGADO: Readonly<Record<string, string>> = Object.freeze({
  // ---- Animações -----------------------------------------------------------
  'abrir-a-base': 'A base já está aberta',
  'exportar-animacao': 'Não há animação para exportar: crie uma em Animação → Nova animação',
  'duplicar-animacao': ANIMACAO,
  'renomear-animacao': ANIMACAO,
  'apagar-animacao': ANIMACAO,
  'mandar-para-o-topo': ANIMACAO,
  'mudar-duracao': ANIMACAO,
  'limpar-animacao': ANIMACAO,
  'repetir': ANIMACAO,
  'recorte-na-cena': ANIMACAO,
  'tirar-recorte': 'Não há recorte aqui: abra uma animação e faça um em Animação → Recorte na cena (C)',
  'colar-corpo': ANIMACAO,
  'copiar-ordem-animacao': ANIMACAO,

  // ---- Tocar e andar no tempo ---------------------------------------------
  'tocar': ANIMACAO,
  'tocar-tras': ANIMACAO,
  'ir-inicio': ANIMACAO,
  'ir-fim': ANIMACAO,
  'quadro-anterior': ANIMACAO,
  'quadro-seguinte': ANIMACAO,
  'chave-anterior': ANIMACAO,
  'chave-seguinte': ANIMACAO,
  'chave-anterior-escolhido': 'Abra uma animação e escolha o que tem chaves: clique na cena ou na Árvore',
  'chave-seguinte-escolhido': 'Abra uma animação e escolha o que tem chaves: clique na cena ou na Árvore',
  'laco-inicio': ANIMACAO,
  'laco-fim': ANIMACAO,
  'tirar-trecho': 'Não há trecho de laço: marque um em Animação → Trecho de laço → Começo do trecho aqui',
  'nova-marca': ANIMACAO,
  'marca-anterior': ANIMACAO,
  'marca-seguinte': ANIMACAO,

  // ---- Chaves --------------------------------------------------------------
  'chavear': ANIMACAO,
  'chavear-tudo': ANIMACAO,
  'apagar-chave': ANIMACAO,
  'apagar-linhas': ANIMACAO,
  'selecionar-chaves': 'Abra uma animação que tenha chaves: clique numa, na aba Animações',
  'copiar': 'Abra uma animação e escolha chaves na linha do tempo (ou algo na cena, para copiar a pose)',
  'colar': CHAVES_COPIADAS,
  'colar-espelhado': CHAVES_COPIADAS,
  'colar-todas-chaves': CHAVES_COPIADAS,
  'recortar-chaves': 'Escolha chaves na linha do tempo primeiro: clique num losango',
  'copiar-pose': ANIMACAO,
  'copiar-pose-escolhido': ANIMACAO,
  'meio-termo': ANIMACAO,
  'meio-termo-anterior': ANIMACAO,
  'meio-termo-seguinte': ANIMACAO,
  'esticar-selecao': ANIMACAO,
  'espelhar-tempo': ANIMACAO,
  'fechar-ciclo': ANIMACAO,
  'espelhar-lados': ANIMACAO,
  'empurrar-chaves': ANIMACAO,
  'deslocar-em-laco': ANIMACAO,
  'limpar-chaves-repetidas': ANIMACAO,
  'interp-curva': 'Escolha chaves na linha do tempo primeiro: clique num losango',
  'efeito-flash': 'Abra uma animação e escolha um osso que tenha desenho: clique nele na cena ou na Árvore',
  'efeito-pulso': OSSO_NA_ANIMACAO,
  'efeito-tremor': OSSO_NA_ANIMACAO,

  // ---- Ordem de desenho ----------------------------------------------------
  'subir-ordem': DESENHO,
  'descer-ordem': DESENHO,
  'frente-de-tudo': DESENHO,
  'fundo-de-tudo': DESENHO,
  'nova-pasta': 'Escolha um ou mais desenhos na aba Ordem primeiro',
  'tirar-da-pasta': 'Escolha um desenho que está dentro de uma pasta, na aba Ordem',

  // ---- Base, Árvore, Editar ------------------------------------------------
  'duplicar': ESCOLHA,
  'apagar': ESCOLHA,
  'renomear': 'Escolha uma linha na Árvore primeiro: clique no nome',
  'novo-ponto-no-slot': DESENHO,
  'novo-caixa-no-slot': DESENHO,
  'limpar-slots-vazios': 'Não há desenho vazio: todo desenho mostra alguma imagem',
  'copiar-ancora': DESENHO,
  'colar-ancora': 'Copie antes: escolha um desenho e use Editar → Copiar posição no osso; depois escolha onde colar',
  'trocar-imagem-todas-peles': 'Escolha um desenho só: clique nele na cena ou na Árvore',
  'selecionar-tudo': 'Não há nada para escolher: traga imagens ou crie um osso',
  'escolher-filhos': 'Escolha um osso primeiro: clique nele na cena ou na Árvore',
  'escolher-pais': 'Escolha um osso primeiro: clique nele na cena ou na Árvore',
  'desfazer': 'Não há passo para desfazer ainda',
  'refazer': 'Não há passo para refazer: nada foi desfeito',
  'abrir-recente': 'Ainda não há arquivo recente: os que você abrir ou salvar aparecem aqui',

  // ---- Skins ---------------------------------------------------------------
  'esconder-na-pele': 'Ponha o lápis numa skin (Skins → Editar esta skin…) e escolha um desenho',
  'ignorar-na-pele': 'Ponha o lápis numa skin (Skins → Editar esta skin…) e escolha um desenho',

  // ---- Janela --------------------------------------------------------------
  'soltar-painel': 'Nenhum painel preso à parede: abra um em Janela',
  'mover-de-coluna': 'Só há uma coluna aberta: abra um painel na outra, em Janela',
});

/** O motivo fixo de uma ação apagada, ou `null` quando a tabela não tem. */
export function porqueApagado(id: string): string | null {
  return PORQUE_APAGADO[id] ?? null;
}
