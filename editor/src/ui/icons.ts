/**
 * Os ícones do editor, como SVG escrito à mão (dono A).
 *
 * **Nada de fonte de ícones e nada de CDN.** O editor tem que abrir sem
 * internet — é um requisito do produto, não uma preferência —, e uma fonte de
 * ícones que não carrega deixa a barra inteira com quadradinhos vazios. Aqui
 * cada ícone é um punhado de linhas dentro de um `<svg>`, e ele existe no
 * arquivo que já foi baixado.
 *
 * São desenhos NOSSOS, feitos de primitivas simples: linhas, círculos,
 * retângulos. Não são de nenhum conjunto de terceiros, e por isso não há nada a
 * creditar no `NOTICE`.
 *
 * REGRAS DE DESENHO, para os próximos ícones seguirem estes:
 *
 * - Caixa de 24×24, traço de 2, pontas e junções arredondadas. Desenhado a 20px
 *   na tela, que é onde 2 de traço ainda se lê.
 * - `currentColor` sempre: o ícone acompanha a cor do botão, inclusive quando o
 *   botão está aceso ou apagado.
 * - Silhueta reconhecível a 20px. Detalhe que só aparece a 48px é detalhe que
 *   ninguém vê.
 * - **Ícone nunca vai sozinho.** Todo botão que usa um ícone carrega
 *   `title` e `aria-label` com o nome por extenso e a tecla. Um ícone sem nome
 *   é uma adivinhação, e o Humberto é disléxico: a palavra é o que salva.
 */

/** O miolo de cada ícone: o que vai dentro do `<svg>`. */
const SHAPES: Readonly<Record<string, string>> = Object.freeze({
  // Ferramentas ------------------------------------------------------------
  /** Selecionar: a seta do ponteiro. */
  select: '<path d="M5 3l14 8-6 1.6L10.5 19z"/>',
  /**
   * Transformar — lote 47: a caixa tracejada do Spriter, com os quadradinhos
   * nos cantos e a haste com a bolinha, que é o que a ferramenta desenha na
   * cena.
   */
  transform:
    '<path d="M6 8h12v12H6z" stroke-dasharray="2 2"/>'
    + '<path d="M4.5 6.5h3v3h-3zM16.5 6.5h3v3h-3zM4.5 18.5h3v3h-3zM16.5 18.5h3v3h-3z"/>'
    + '<path d="M12 14V4.5"/>'
    + '<circle cx="12" cy="3" r="1.5"/>',
  /** Mover: quatro setas saindo do centro. */
  translate:
    '<path d="M12 3v18M3 12h18"/>'
    + '<path d="M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3"/>'
    + '<path d="M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
  /** Girar: um arco com a seta na ponta. */
  rotate:
    '<path d="M20 12a8 8 0 1 1-3.2-6.4"/>'
    + '<path d="M20 4v5h-5"/>',
  /**
   * Escalar: um **L com seta nas duas pontas**, uma para cima e uma para a
   * direita, saindo do mesmo canto.
   *
   * Desenhado pelo Humberto, 09/09/2026. O de antes era um canto com uma seta
   * na diagonal, e ele leu como "inclinar" — o que é justo: uma diagonal é
   * exatamente o que uma inclinação faz. Duas setas em cruz dizem "estica nos
   * dois sentidos", que é o que escalar faz.
   */
  scale:
    '<path d="M4 20V6M4 20h14"/>'
    + '<path d="M1 9l3-3 3 3"/>'
    + '<path d="M15 17l3 3-3 3"/>',
  /**
   * Inclinar: o retângulo que virou **paralelogramo**, com o topo deslocado
   * para a direita, e a seta em cima dizendo para onde ele andou.
   *
   * **Nunca a letra Z.** A ferramenta tem a tecla `Z`, e o botão mostrava a
   * letra por falta de ícone; o Humberto leu "ordem Z" e nem tentou usar:
   * *"isso é ordem Z? O ícone ficou fora do padrão. Tentei usar, não entendi."*
   * A base do desenho fica no chão, que é a metade da regra que a palavra
   * "inclinar" não conta: o topo anda, a base fica.
   */
  shear:
    '<path d="M6 20h8l4-12H10z"/>'
    + '<path d="M11 5h6M15 3l2 2-2 2"/>',
  /** Criar osso: o losango alongado do osso, com a raiz marcada. */
  'create-bone':
    '<path d="M5 19l4-8 10-6-6 10z"/>'
    + '<circle cx="5" cy="19" r="1.6"/>',
  /** Malha: um triângulo dividido. */
  mesh:
    '<path d="M12 3L3 19h18z"/>'
    + '<path d="M12 3v16M3 19l9-8M21 19l-9-8"/>',
  /** Posar: um alfinete sobre um osso. */
  pose:
    '<path d="M4 20l5-6"/>'
    + '<path d="M9 14l7-8 4 4-8 7z"/>'
    + '<circle cx="16" cy="6" r="1.4"/>',
  /** Pesos: um pincel. */
  weights:
    '<path d="M4 20c0-3 2-4 4-4s2 4-1 4c-1.5 0-3 0-3 0z"/>'
    + '<path d="M9 15L19 5l1 1-9 10"/>',

  // A aba Malha e pesos — item 4.3, plano "caixa, ossos e malha" ------------
  /**
   * Usar a forma de outra malha: a malha de sempre, apagada, com uma malha
   * cheia entrando por cima — a forma que ela empresta.
   */
  'mesh-borrow':
    '<path d="M12 3L3 19h18z" opacity="0.4"/>'
    + '<path d="M12 3v16M3 19l9-8M21 19l-9-8" opacity="0.4"/>'
    + '<path d="M20 4l-5 5M20 4h-4M20 4v4"/>',
  /** Gerar automática: a malha com a fagulha, o mesmo "automático" do pincel. */
  'auto-mesh':
    '<path d="M4 20L11 8h6L11 20z" opacity="0.55"/>'
    + '<path d="M18 4l1.2 2.4L21.5 7l-2.3.9L18 10l-1.2-2.1L14.5 7l2.3-.6z"/>',
  /** Traçar contorno: só o laço tracejado, sem vértice por dentro. */
  'trace-outline':
    '<path d="M4 16c0-7 5-11 8-11s8 4 8 11-4 5-8 5-8 2-8-5z" stroke-dasharray="3 3"/>',
  /** Pesos automáticos: o pincel apagado, com a mesma fagulha do "automático". */
  'auto-weights':
    '<path d="M4 20c0-3 2-4 4-4s2 4-1 4c-1.5 0-3 0-3 0z" opacity="0.55"/>'
    + '<path d="M9 15L19 5l1 1-9 10" opacity="0.55"/>'
    + '<path d="M18 4l1.2 2.4L21.5 7l-2.3.9L18 10l-1.2-2.1L14.5 7l2.3-.6z"/>',
  /** Suavizar: a onda, a mesma silhueta de todo ícone de "suave". */
  smooth: '<path d="M3 13c2-6 4 6 6 0s4-6 6 0 4 6 6 0"/>',
  /**
   * Chavear pesos — degrau 7, tarefa 7.6: o losango da chave, com a onda dos
   * pesos por baixo. As duas metades do que o botão faz, na mesma silhueta que
   * a folha de chaves e a seção Pesos já usam.
   */
  'key-weights':
    '<path d="M12 3l5 5-5 5-5-5z"/>'
    + '<path d="M3 18c2-4 4 4 6 0s4-4 6 0 4 4 6 0" opacity="0.65"/>',
  /** Criar aresta: dois vértices e a linha entre eles, com o mais no canto. */
  'edge-add':
    '<circle cx="5" cy="18" r="2.2"/>'
    + '<circle cx="16" cy="9" r="2.2"/>'
    + '<path d="M7 16.5L14 10.5"/>'
    + '<path d="M18 3v6M15 6h6"/>',
  /** Apagar aresta: a mesma linha entre vértices, com o X no canto. */
  'edge-remove':
    '<circle cx="5" cy="18" r="2.2"/>'
    + '<circle cx="16" cy="9" r="2.2"/>'
    + '<path d="M7 16.5L14 10.5"/>'
    + '<path d="M15.5 3.5l5 5M20.5 3.5l-5 5"/>',

  /** Ponto: um alvo com o centro cheio. */
  point:
    '<circle cx="12" cy="12" r="7"/>'
    + '<circle cx="12" cy="12" r="2" fill="currentColor"/>'
    + '<path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  /**
   * Emissor de partículas: a boca e o que sai dela — extensão `BONE_particles`.
   *
   * **Não é o ícone do Ponto com outro nome**, e é por isso que ele existe.
   * Os dois seriam um círculo com o meio cheio, e a linha da Árvore passaria a
   * dizer "um ponto" onde há um emissor — o `POR_TIPO` do `thumbnail-kind.ts`
   * está ali justamente para a pessoa ver o que é, e um glifo emprestado
   * desfaria isso em silêncio (regra 21 da casa).
   *
   * A boca é o ponto cheio embaixo, à esquerda; o que sai dela vai diminuindo
   * para cima e para a direita, porque um emissor tem UM lugar e MUITAS
   * partículas, e é essa a forma que se reconhece de relance.
   */
  particle:
    '<circle cx="5" cy="19" r="2.2" fill="currentColor"/>'
    + '<circle cx="11" cy="14.5" r="1.7" fill="currentColor"/>'
    + '<circle cx="17.5" cy="9.5" r="1.3" fill="currentColor"/>'
    + '<circle cx="11.5" cy="6.5" r="1" fill="currentColor"/>'
    + '<circle cx="19.5" cy="16.5" r="1" fill="currentColor"/>'
    + '<circle cx="6" cy="10" r="0.9" fill="currentColor"/>',

  // As abas da ficha do emissor — rodada 16, lote 1 ---------------------------
  /** Tempo: um relógio. */
  relogio: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  /** Forma: um círculo e um quadrado, as formas de onde a partícula nasce. */
  formas: '<circle cx="8.5" cy="8.5" r="4.5"/><rect x="11" y="11" width="9" height="9" rx="1"/>',
  /** Movimento: um caminho curvo com a seta na ponta. */
  trajeto: '<path d="M4 19c3-9 8-12 15-13"/><path d="M14 4l5 2-3 4"/>',
  /** Forças: a seta que cai até o chão (a gravidade). */
  forca: '<path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',
  // O seletor de forma do emissor — rodada 16, lote 2 ------------------------
  /** Ponto: o lugar só, com quatro riscos saindo. */
  'forma-ponto': '<circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
  /** Retângulo: a caixa tracejada. */
  'forma-retangulo': '<rect x="4" y="6" width="16" height="12" rx="1" stroke-dasharray="3 2.5"/>',
  /** Círculo: o disco, com o centro. */
  'forma-circulo': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  /** Anel: dois círculos. */
  'forma-anel': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
  /** Arco: uma fatia de um quarto. */
  'forma-arco': '<path d="M6 18V6a12 12 0 0 1 12 12z"/>',
  /** Linha: o segmento, com as duas pontas. */
  'forma-linha': '<path d="M5 19L19 5"/><circle cx="5" cy="19" r="1.8" fill="currentColor"/><circle cx="19" cy="5" r="1.8" fill="currentColor"/>',
  /** Cor: uma gota. */
  gota: '<path d="M12 3c4 5 6 8.5 6 11a6 6 0 0 1-12 0c0-2.5 2-6 6-11z"/>',

  /** Caixa de colisão: um retângulo tracejado com os quatro cantos marcados. */
  box:
    '<rect x="4" y="6" width="16" height="12" rx="1"/>'
    + '<circle cx="4" cy="6" r="1.4" fill="currentColor"/>'
    + '<circle cx="20" cy="6" r="1.4" fill="currentColor"/>'
    + '<circle cx="20" cy="18" r="1.4" fill="currentColor"/>'
    + '<circle cx="4" cy="18" r="1.4" fill="currentColor"/>',
  /**
   * Caminho: a curva com as duas alças, como ela aparece na cena.
   *
   * Nasceu no lote 32 (anotação 18) para a miniatura de um attachment do tipo
   * `path`, que não tem imagem nenhuma para recortar.
   */
  path:
    '<path d="M4 18c0-7 5-11 8-11s4 3 8 3"/>'
    + '<circle cx="4" cy="18" r="1.8" fill="currentColor"/>'
    + '<circle cx="20" cy="10" r="1.8" fill="currentColor"/>',
  /** Máscara: o retângulo recortado pelo círculo que passa por cima. */
  mask:
    '<path d="M4 5h9a7 7 0 0 0 7 7v7H4z"/>'
    + '<circle cx="20" cy="5" r="3.2"/>',

  // Ver e travar -----------------------------------------------------------
  /** Cadeado fechado. */
  lock:
    '<rect x="5" y="11" width="14" height="9" rx="2"/>'
    + '<path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  /** Cadeado aberto. */
  unlock:
    '<rect x="5" y="11" width="14" height="9" rx="2"/>'
    + '<path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
  /** Olho aberto. */
  eye:
    '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/>'
    + '<circle cx="12" cy="12" r="2.6"/>',
  /** Osso, para o par "ver ossos". */
  bone: '<path d="M5 19l4-8 10-6-6 10z"/>',
  /** Imagem, para o par "ver desenhos". */
  image:
    '<rect x="3" y="4" width="18" height="16" rx="2"/>'
    + '<path d="M3 16l5-5 4 4 3-3 6 6"/>'
    + '<circle cx="8.5" cy="8.5" r="1.4"/>',

  /**
   * Casca de cebola: três figuras iguais, uma atrás da outra — item 28.
   *
   * Não é uma cebola desenhada. O que o botão faz é mostrar o quadro de antes e
   * o de depois por trás do de agora, e três contornos deslocados dizem isso
   * melhor do que um legume diria.
   */
  onion:
    '<path d="M5 7v10" opacity="0.35"/>'
    + '<path d="M9 5v14" opacity="0.6"/>'
    + '<path d="M14 4v16"/>'
    + '<path d="M19 7v10" opacity="0.35"/>',

  // Barra ------------------------------------------------------------------
  /** Mais: três pontos. Abre o que não cabe na barra. */
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',

  // Arquivo e Editar, na barra de ações — lote 17 -------------------------
  /** Novo: uma folha com o canto dobrado. */
  new:
    '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>'
    + '<path d="M14 3v5h5"/>',
  /** Abrir: uma pasta aberta. */
  open:
    '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3z"/>'
    + '<path d="M3 10h18l-2 8a2 2 0 0 1-2 1.6H6A2 2 0 0 1 4 18z"/>',
  /** Salvar: o disquete, que continua sendo o desenho que todo mundo lê. */
  save:
    '<path d="M5 3h11l3 3v15H5z"/>'
    + '<path d="M8 3v6h7V3"/>'
    + '<rect x="8" y="13" width="8" height="6"/>',
  /** Desfazer: uma seta que volta por cima de um arco. */
  undo:
    '<path d="M9 8H5V4"/>'
    + '<path d="M5 8a8 8 0 1 1 1.5 9"/>',
  /** Refazer: a mesma, espelhada. */
  redo:
    '<path d="M15 8h4V4"/>'
    + '<path d="M19 8a8 8 0 1 0-1.5 9"/>',
  /** Recortar: a tesoura. */
  cut:
    '<circle cx="6" cy="18" r="2.6"/><circle cx="18" cy="18" r="2.6"/>'
    + '<path d="M7.8 16.2 19 3M16.2 16.2 5 3"/>',
  /** Copiar: duas folhas, uma atrás da outra. */
  copy:
    '<rect x="9" y="9" width="11" height="11" rx="2"/>'
    + '<path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  /** Colar: a prancheta com a presilha. */
  paste:
    '<path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>'
    + '<rect x="8" y="3" width="7" height="4" rx="1"/>',
  // Cabeçalho de painel, em ícone — lote 19 ---------------------------------
  /** Novo: um mais. Com a seta ao lado, ele abre a lista do que se pode criar. */
  plus: '<path d="M12 5v14M5 12h14"/>',
  /** Seta para baixo: "isto abre uma lista". */
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  /** Tirar daqui: o xis. Degrau 9 — desligar a pele, na coluna Ativas. */
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  /** Duplicar: dois retângulos, o de trás inteiro. */
  duplicate:
    '<rect x="9" y="3" width="12" height="12" rx="2"/>'
    + '<path d="M15 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2"/>',
  /**
   * Carimbar pivôs — lote 56: o carimbo de borracha, cabo em cima e a base
   * embaixo, com a marca que ele deixa.
   */
  stamp:
    '<path d="M10 3h4v6l4 3v3H6v-3l4-3z"/>'
    + '<path d="M5 18h14"/>'
    + '<path d="M8 21h8"/>',
  /** Ir para — lote 49: a seta entrando no alvo, para o aviso levar até o elemento. */
  target:
    '<circle cx="14" cy="10" r="6"/>'
    + '<circle cx="14" cy="10" r="1.5" fill="currentColor"/>'
    + '<path d="M3 21l7-7M3 16v5h5"/>',
  /** Definir pivô — lote 58: a mira, com o furo no meio onde o osso segura. */
  pivot:
    '<circle cx="12" cy="12" r="3"/>'
    + '<path d="M12 3v5M12 16v5M3 12h5M16 12h5"/>',
  /** Renomear: um lápis sobre uma linha de texto. */
  rename:
    '<path d="M4 20h16"/>'
    + '<path d="M14.5 4.5a2.1 2.1 0 0 1 3 3L9 16l-4 1 1-4z"/>',
  /** Voltar à montagem: uma seta que sai da linha do tempo e volta ao boneco. */
  'back-to-setup':
    '<path d="M20 12H7"/>'
    + '<path d="M11 8l-4 4 4 4"/>'
    + '<path d="M20 5v14"/>',
  /** Buscar: a lupa. */
  search: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5L20 20"/>',
  /** Recarregar a pasta — lote 59: duas setas em roda, uma de cada lado. */
  reload:
    '<path d="M20 11a8 8 0 0 0-14.5-4.6"/>'
    + '<path d="M5 3v4h4"/>'
    + '<path d="M4 13a8 8 0 0 0 14.5 4.6"/>'
    + '<path d="M19 21v-4h-4"/>',

  // A linha dos botões em bloco da folha de chaves — lote 23 ---------------
  /** Apagar chave: o losango da chave com um traço em cima. */
  /**
   * Chave: o losango da linha do tempo, cheio — rodada final, lote 3 (29/09).
   * `iconButton('key', …)` existia desde o degrau 12 ("Assar a física em
   * chaves") e o ícone NÃO: o botão desenhava a letra "A" no lugar, calado.
   */
  key:
    '<path d="M12 4l7 8-7 8-7-8z" fill="currentColor" fill-opacity="0.35"/>',
  'key-remove':
    '<path d="M12 4l6 6-6 6-6-6z"/>'
    + '<path d="M5 19h14"/>',
  /** Esticar: duas setas afastando-se, e a barra no meio que fica parada. */
  'expand-h':
    '<path d="M12 4v16" opacity="0.5"/>'
    + '<path d="M9 12H3M6 9l-3 3 3 3"/>'
    + '<path d="M15 12h6M18 9l3 3-3 3"/>',
  /** Encolher: as mesmas setas, virando para dentro. */
  'contract-h':
    '<path d="M12 4v16" opacity="0.5"/>'
    + '<path d="M3 12h6M6 9l3 3-3 3"/>'
    + '<path d="M21 12h-6M18 9l-3 3 3 3"/>',
  /** Espelhar no tempo: dois triângulos costas com costas. */
  'mirror-h':
    '<path d="M12 3v18" opacity="0.5"/>'
    + '<path d="M9 7L4 12l5 5z"/>'
    + '<path d="M15 7l5 5-5 5z"/>',

  // A régua da linha do tempo — lote 29, anotação 15 -----------------------
  /** Início do trecho de laço: o colchete que abre. */
  'bracket-open':
    '<path d="M15 4H9a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6"/>'
    + '<path d="M8 12h11"/>',
  /** Fim do trecho de laço: o colchete que fecha. */
  'bracket-close':
    '<path d="M9 4h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9"/>'
    + '<path d="M5 12h11"/>',
  /** Marca: a bandeirinha espetada no tempo. */
  marker:
    '<path d="M6 21V4"/>'
    + '<path d="M6 4h11l-3 4 3 4H6z"/>',

  // As cinco regras — lote 28, anotação 13 ---------------------------------
  /*
   * Cada tipo tem o SEU desenho, e não uma bolinha colorida.
   *
   * No Spine a lista de regras se lê pelo ícone colorido de cada tipo
   * (`constraints_tree.png`), e é o que faz uma lista de cinco linhas ser
   * legível de relance. Aqui a cor não pode carregar a informação sozinha —
   * oito por cento dos homens não separam vermelho de verde —, então o que
   * distingue é a FORMA, e a cor vem por cima.
   */
  /** Regra de IK: dois ossos dobrados e o alvo no pé da cadeia. */
  'rule-ik':
    '<path d="M6 4v7l6 5"/>'
    + '<circle cx="6" cy="4" r="1.6"/>'
    + '<circle cx="18" cy="19" r="2.4"/>'
    + '<path d="M12 16l4 2"/>',
  /** Regra de transformação: um osso copiando o outro. */
  'rule-transform':
    '<rect x="3" y="5" width="7" height="7" rx="1.5"/>'
    + '<rect x="14" y="12" width="7" height="7" rx="1.5"/>'
    + '<path d="M10 8.5h5a2 2 0 0 1 2 2v1.5"/>'
    + '<path d="M15 9.5l2-1-2-1" opacity="0.9"/>',
  /** Regra de caminho: a curva com os ossos deslizando por cima. */
  'rule-path':
    '<path d="M3 17c4-10 14-10 18 0"/>'
    + '<circle cx="7" cy="11" r="1.6"/>'
    + '<circle cx="12" cy="8.6" r="1.6"/>'
    + '<circle cx="17" cy="11" r="1.6"/>',
  /** Regra de física: o pêndulo, que balança sozinho. */
  'rule-physics':
    '<path d="M4 4h16"/>'
    + '<path d="M12 4v9"/>'
    + '<circle cx="12" cy="16" r="3.2"/>'
    + '<path d="M6 8c0 3 1 5 3 6" opacity="0.55"/>',
  /** Regra de comando: o cursor de uma barra empurrando uma seta. */
  'rule-driver':
    '<path d="M3 9h18"/>'
    + '<rect x="7" y="6" width="4" height="6" rx="1"/>'
    + '<path d="M6 17h9"/>'
    + '<path d="M12 14l3 3-3 3"/>',

  // A aba Ordem — lote 35, anotação 25 ---------------------------------------
  /*
   * Seis botões para a ordem de desenho, que até aqui só existia no arrasto e
   * numa tecla escrita na dica da linha. As setas apontam para CIMA quando a
   * peça vai para a FRENTE, porque na lista o de cima é o que fica na frente —
   * a mesma convenção de todo programa de camadas.
   */
  /** Trazer para a frente: um passo para cima. */
  'ordem-frente':
    '<path d="M12 20V5"/>'
    + '<path d="M6 11l6-6 6 6"/>',
  /** Mandar para trás: um passo para baixo. */
  'ordem-tras':
    '<path d="M12 4v15"/>'
    + '<path d="M6 13l6 6 6-6"/>',
  /** Frente de tudo: a seta bate no teto. */
  'ordem-topo':
    '<path d="M4 4h16"/>'
    + '<path d="M12 21V8"/>'
    + '<path d="M6 14l6-6 6 6"/>',
  /** Fundo de tudo: a seta bate no chão. */
  'ordem-fundo':
    '<path d="M4 20h16"/>'
    + '<path d="M12 3v13"/>'
    + '<path d="M6 10l6 6 6-6"/>',
  /** Pasta: a aba e o corpo, como toda pasta de arquivo. */
  pasta:
    '<path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  /** Tirar da pasta: a mesma pasta, com a peça saindo por cima. */
  'pasta-fora':
    '<path d="M3 10a1 1 0 0 1 1-1h4l2 2h5"/>'
    + '<path d="M3 10v8a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-4"/>'
    + '<path d="M18 9V3"/>'
    + '<path d="M15 6l3-3 3 3"/>',

  /** Ligar osso à malha: a corrente, dois elos — lote 69. */
  link:
    '<path d="M10.5 13.5a4 4 0 0 1 0-5.6l2.1-2.1a4 4 0 0 1 5.6 5.6l-1.2 1.2"/>'
    + '<path d="M13.5 10.5a4 4 0 0 1 0 5.6l-2.1 2.1a4 4 0 0 1-5.6-5.6l1.2-1.2"/>',

  /**
   * Trocar a pasta de origem — degrau 8, tarefa 8.3. Uma pasta e a seta de
   * troca: não é reler a mesma (o `reload`, que é um ciclo), é apontar para
   * outra.
   */
  'swap-folder':
    '<path d="M3 8a2 2 0 0 1 2-2h3.5l1.5 2H15a2 2 0 0 1 2 2v1"/>'
    + '<path d="M7 16h12"/>'
    + '<path d="M16 13l3 3-3 3"/>',
  /** Apagar: a lixeira. */
  trash:
    '<path d="M4 7h16"/>'
    + '<path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>'
    + '<path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>'
    + '<path d="M10 11v6M14 11v6"/>',
  // Porta D5 (degrau 12): o ▶ de ouvir o som de um evento. Preenchido, porque
  // um triângulo só de traço some no tamanho de 18 px.
  play: '<path d="M8 5l11 7-11 7z" fill="currentColor" stroke-linejoin="round"/>',
  // Lote 1 do chat D, rodada final (28/09/2026): o evento na Árvore. O raio,
  // que é o "dispara" de todo programa — e não a bandeirinha, que já é a marca.
  event: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  // Rodada 17, PL-31: a Prévia na barra de ações — uma tela com o ▶ dentro,
  // para não se confundir com o Tocar do tocador.
  previa: '<rect x="3" y="4" width="18" height="13" rx="2"/>'
    + '<path d="M10 8l5 2.5-5 2.5z" fill="currentColor" stroke-linejoin="round"/>'
    + '<path d="M8 21h8"/>',
});

/** `true` quando existe um ícone com esse nome. */
export function hasIcon(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(SHAPES, id);
}

/** Os nomes de todos os ícones, em ordem. Para conferência e para teste. */
export function iconNames(): string[] {
  return Object.keys(SHAPES).sort();
}

/**
 * O SVG de um ícone, como texto.
 *
 * `aria-hidden` porque quem diz o nome é o botão em volta: um `aria-label` no
 * ícone E no botão faria o leitor de tela dizer a mesma coisa duas vezes.
 * Devolve `''` para um nome que não existe, e nunca estoura: um ícone que falta
 * deixa um botão sem desenho, não um editor sem barra.
 */
export function iconSvg(id: string, size = 20): string {
  const shape = SHAPES[id];
  if (shape === undefined) return '';
  return `<svg class="icone" width="${size}" height="${size}" viewBox="0 0 24 24"`
    + ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"'
    + ` stroke-linejoin="round" aria-hidden="true" focusable="false">${shape}</svg>`;
}

/** Põe o ícone dentro de um elemento. Devolve `false` se o ícone não existe. */
export function paintIcon(node: HTMLElement, id: string, size = 20): boolean {
  const svg = iconSvg(id, size);
  if (svg === '') return false;
  node.innerHTML = svg;
  return true;
}
