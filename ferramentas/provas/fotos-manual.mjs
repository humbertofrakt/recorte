// SPDX-License-Identifier: Apache-2.0
// Tira as fotos do manual, todas na mesma sessão do editor.
//
// Por que existe: as fotos do manual envelheciam uma a uma. Cada lote mexia
// num painel e trocava a foto daquele painel; seis meses depois metade das
// imagens era de uma tela que não existe mais — tema claro, painel do outro
// lado, botão com outro nome. Uma lista escrita num arquivo tira TODAS de novo
// num comando, e uma foto velha deixa de ser um acidente possível.
//
// Como as fotos são tiradas, e por quê:
//
// - **Chrome headless de verdade**, dirigido por CDP. O painel do navegador da
//   automação não compõe quadros (medido: `requestAnimationFrame` roda zero
//   vezes por segundo lá), e uma foto do editor sem quadro composto sai com a
//   cena em branco. É o mesmo caminho do `conferir-editor.mjs`.
// - **1440x900 exatos**, que é o tamanho de janela em que a interface foi
//   medida e desenhada.
// - **Tema escuro**, que é como o editor abre desde o lote 18.
// - Cada passo diz o que arrumar na tela antes de fotografar, em JavaScript
//   que roda dentro da página, e o pedaço que interessa. Um recorte pequeno
//   sai em escala 2, senão o texto do botão não se lê no manual.
//
// Uso, da raiz do projeto, com o editor servindo em 5173
// (`npm run editor` numa outra janela):
//
//   node ferramentas/provas/fotos-manual.mjs PERFIL
//
// PERFIL é uma pasta descartável para o Chrome. Exemplo:
//
//   node ferramentas/provas/fotos-manual.mjs %TEMP%/perfil-fotos
//
// Sai um relatório em colunas: uma linha por foto, com o tamanho em bytes, e
// no fim toda linha de console que a página tiver escrito. Console sujo é
// motivo para não publicar as fotos.

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DESTINO = resolve(AQUI, '..', '..', 'documentos', 'manual', 'imagens');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA = 9334;
const PERFIL = process.argv[2];
// Lote 47: um pedaço do nome no terceiro argumento tira só as fotos que o têm.
// Sem ele, todas, como sempre.
const SO = process.argv[3] ?? null;
const URL = 'http://localhost:5173/';

if (PERFIL === undefined) {
  console.error('uso: node fotos-manual.mjs PASTA-DE-PERFIL');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// As ajudantes que moram dentro da página
// ---------------------------------------------------------------------------

/**
 * Um punhado de funções curtas, injetadas uma vez, para os passos abaixo não
 * repetirem `[...document.querySelectorAll(...)].find(...)` trinta vezes.
 *
 * Toda ajudante devolve `true` quando achou o que procurava e `false` quando
 * não achou. Um passo que devolve `false` derruba o programa: uma foto tirada
 * de uma tela que não entrou no estado pedido é pior que foto nenhuma.
 */
const AJUDANTES = `
window.__foto = {
  q(s) { return [...document.querySelectorAll(s)]; },
  aba(nome) {
    const b = this.q('.panel-tab, .dock-tab').find((x) => x.textContent.trim() === nome);
    if (b === undefined) return false;
    b.click();
    return true;
  },
  ferramenta(comeco) {
    const b = this.q('.viewport-ferramenta').find((x) => (x.title || '').startsWith(comeco));
    if (b === undefined) return false;
    b.click();
    return true;
  },
  titulo(pedaco) {
    const b = this.q('button[title]').find((x) => x.title.includes(pedaco));
    if (b === undefined) return false;
    b.click();
    return true;
  },
  menu(nome) {
    const b = this.q('.menu-button').find((x) => x.textContent.trim() === nome);
    if (b === undefined) return false;
    b.click();
    return true;
  },
  /*
   * Abre um submenu.
   *
   * O submenu abre por CSS, com ':hover' ou ':focus-within' — nunca por
   * clique, que é decisão do lote dos menus. Foto nenhuma consegue passar o
   * mouse; o foco, sim: dar foco ao botão pai acende o ':focus-within' e o
   * submenu aparece, exatamente como aparece para quem anda de Tab.
   */
  item(texto) {
    const b = this.q('.menu-item-pai').find((x) => x.textContent.trim().startsWith(texto));
    if (b === undefined) return false;
    b.focus();
    return true;
  },
  clicarItem(texto) {
    const b = this.q('.menu-item').find((x) => x.textContent.trim().startsWith(texto));
    if (b === undefined) return false;
    b.click();
    return true;
  },
  animacao(nome) {
    const b = this.q('.anim-item').find((x) => x.textContent.trim().startsWith(nome + ' '));
    if (b === undefined) return false;
    b.click();
    return true;
  },
  arvore(nome) {
    const b = this.q('.arvore-nome, .arvore-item').find((x) => x.textContent.trim() === nome);
    if (b === undefined) return false;
    b.click();
    return true;
  },
  botao(texto) {
    const b = this.q('button').find((x) => x.textContent.trim() === texto);
    if (b === undefined) return false;
    b.click();
    return true;
  },
  /*
   * Muda a altura entre os dois grupos de abas de uma coluna.
   *
   * É o MESMO gesto da alça entre os dois grupos: ela escreve
   * 'flex: <fração> 1 0px' no estilo do grupo, e é isso que esta linha faz.
   * Sem ela, o painel de baixo fica com 90 pixels e a foto sai mostrando só a
   * tira de abas.
   */
  divisao(coluna, fracaoDoTopo) {
    const g = this.q('.panel-column-' + coluna + ' .panel-group');
    if (g.length < 2) return false;
    g[0].style.flex = fracaoDoTopo + ' 1 0px';
    g[1].style.flex = (1 - fracaoDoTopo) + ' 1 0px';
    return true;
  },
  /*
   * Rola a barra de ações até o fim.
   *
   * Em 1440 de largura a barra não cabe inteira e rola de lado — de propósito:
   * ela nunca quebra em duas linhas, porque a segunda linha seria altura
   * tirada do desenho. O último botão fica meio fora da tela, e uma foto dos
   * quatro de "ver e travar" precisa deles inteiros.
   */
  rolarBarra() {
    const b = document.querySelector('.viewport-toolbar');
    if (b === null) return false;
    b.scrollLeft = b.scrollWidth;
    return true;
  },
  regra(nome) {
    const alvo = this.q('.regras-nome').find((x) => x.textContent.trim() === nome);
    if (alvo === undefined) return false;
    (alvo.closest('.regras-linha') ?? alvo).click();
    return true;
  },
  mostrarPele(nome) {
    const b = this.q('button[title]').find((x) => x.title === 'Mostrar a pele "' + nome + '"');
    if (b === undefined) return true;
    b.click();
    return true;
  },
  /*
   * Tira o foco de onde ele estiver.
   *
   * Um passo antes pode ter deixado o foco numa caixa de texto — criar um osso
   * deixa —, e a casca ignora tecla de gesto com o foco numa caixa de texto,
   * porque ali a tecla é letra. Clicar num nome da Árvore não tira o foco de
   * lá: um <span> não é focável. Isto tira.
   */
  semFoco() {
    const alvo = document.activeElement;
    if (alvo !== null && typeof alvo.blur === 'function') alvo.blur();
    return true;
  },
  esc() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.body.click();
    return true;
  },
  escolher(pedaco) {
    const s = this.q('.dialog-box select').find(
      (x) => [...x.options].some((o) => o.textContent.toLowerCase().includes(pedaco)),
    );
    if (s === undefined) return false;
    const opcao = [...s.options].find((o) => o.textContent.toLowerCase().includes(pedaco));
    s.value = opcao.value;
    s.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  },
  montagem() {
    const b = document.querySelector('.viewport-modo-montagem');
    if (b === null) return false;
    b.click();
    return true;
  },
  fecharFaixa() {
    const faixa = document.querySelector('.dock');
    if (faixa === null) return false;
    if (faixa.classList.contains('dock-fechada')) return true;
    // A dica do botão muda de "abre" para "fecha" conforme a faixa: o que não
    // muda é o começo dela.
    const b = this.q('button[title]').find((x) => x.title.startsWith('Detalhes:'));
    if (b === undefined) return false;
    b.click();
    return true;
  },
  caixa(seletor, folga) {
    const e = document.querySelector(seletor);
    if (e === null) return null;
    const r = e.getBoundingClientRect();
    const m = folga ?? 0;
    return {
      x: Math.max(0, Math.round(r.x - m)),
      y: Math.max(0, Math.round(r.y - m)),
      width: Math.min(1440, Math.round(r.width + m * 2)),
      height: Math.min(900, Math.round(r.height + m * 2)),
    };
  },
};
true`;

// ---------------------------------------------------------------------------
// A lista das fotos
// ---------------------------------------------------------------------------

/**
 * Uma linha por foto, na ordem dos capítulos.
 *
 * `arruma` roda dentro da página e tem de devolver `true`. `corte` é o
 * seletor do pedaço que interessa; sem ele sai a janela inteira. `escala 2`
 * é para recorte estreito, em que o texto do botão precisa ser lido.
 */
const FOTOS = [
  // --- 0. O fluxo de trabalho padrao --------------------------------------
  // Dez passos, dez fotos, na ordem em que ele trabalha. E o capitulo que se
  // le primeiro, e por isso e o primeiro a ser fotografado: a sessao ainda
  // esta limpa, em Montagem, com a faixa de baixo fechada.
  {
    nome: '00-1-importar.png',
    arruma: '__foto.menu("Arquivo") && __foto.item("Importar")',
    espera: 500,
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 560,
    largura: 760,
  },
  {
    nome: '00-2-ordem.png',
    arruma: '__foto.esc() && __foto.divisao("esquerda", 0.78) && __foto.aba("Ordem")',
    corte: '.panel-column-esquerda .panel-group:first-child',
    folga: 2,
  },
  {
    nome: '00-3-ossos.png',
    arruma: '__foto.aba("\u00c1rvore") && __foto.ferramenta("Criar osso")',
    espera: 700,
  },
  {
    nome: '00-4-prender.png',
    arruma: '__foto.ferramenta("Selecionar") && __foto.divisao("esquerda", 0.20)'
      + ' && __foto.arvore("weapon")',
    espera: 600,
    corte: '.panel-column-esquerda .panel-group:last-child',
    folga: 2,
  },
  {
    nome: '00-5-regra.png',
    arruma: '__foto.divisao("direita", 0.16) && __foto.aba("Regras") && __foto.regra("ik_arm")',
    espera: 700,
    corte: '.panel-column-esquerda .panel-group:last-child',
    folga: 2,
  },
  {
    nome: '00-6-pele.png',
    arruma: '__foto.aba("Peles") && __foto.mostrarPele("armadura")',
    espera: 900,
  },
  {
    nome: '00-7-animacao.png',
    arruma: '__foto.aba("Anima\u00e7\u00f5es")',
    espera: 700,
    corte: '.panel-column-direita .panel-group:last-child',
    folga: 2,
  },
  {
    nome: '00-8-chaves.png',
    arruma: '__foto.animacao("walk") && __foto.titulo("Detalhes: uma linha por osso")',
    espera: 900,
  },
  {
    // Tocando de verdade: o botao vira pausa e o relogio anda. E a unica foto
    // do manual em que o editor esta em movimento, e o Chrome headless compoe
    // quadros de verdade - 61 por segundo, medido.
    nome: '00-9-tocar.png',
    arruma: '__foto.titulo("Tocar: Toca e pausa")',
    espera: 1200,
  },
  {
    nome: '00-10-exportar.png',
    arruma: '__foto.titulo("Tocar: Toca e pausa") && __foto.montagem() && __foto.fecharFaixa()'
      + ' && __foto.menu("Arquivo") && __foto.item("Exportar")',
    espera: 700,
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 700,
    largura: 760,
  },

  // --- 1. Abrir o Recorte -------------------------------------------------
  {
    nome: '01-a-tela.png',
    arruma: '__foto.aba("Árvore") && __foto.aba("Imagens")',
  },
  {
    nome: '01-barra-de-acoes.png',
    arruma: 'true',
    corte: '.viewport-toolbar',
    folga: 2,
    escala: 2,
  },
  {
    nome: '01-modo.png',
    arruma: 'true',
    corte: '.viewport-grupo-modo',
    folga: 6,
    escala: 3,
  },
  // Os sete menus, um por foto, cada um inteiro.
  //
  // "Explicando TUDO que o programa e capaz de fazer" quer dizer que nenhum
  // item pode ficar de fora, e um item de menu E um botao: o print mostra o
  // botao. Os menus altos crescem a janela so para a propria foto - o menu
  // Animacao tem vinte e nove itens e nao cabe em 900 pixels, e fotografar um
  // menu cortado seria esconder justamente os ultimos.
  {
    // Com a `walk` aberta: um menu fotografado em Montagem sai com o menu
    // Animacao inteiro cinza, e cinza no manual se le como "nao existe".
    nome: '01-menu-arquivo.png',
    arruma: '__foto.esc() && __foto.aba("Animações") && __foto.animacao("walk")'
      + ' && __foto.menu("Arquivo")',
    espera: 700,
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 660,
    largura: 560,
  },
  {
    nome: '01-menu-editar.png',
    arruma: '__foto.esc() && __foto.menu("Editar")',
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 800,
    largura: 620,
    alturaJanela: 1000,
  },
  {
    nome: '01-menu-exibir.png',
    arruma: '__foto.esc() && __foto.menu("Exibir")',
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 1080,
    largura: 620,
    alturaJanela: 1200,
  },
  {
    nome: '01-menu-esqueleto.png',
    // Rodada 6 (05/10/2026): o menu Esqueleto passou a se chamar Base. O nome
    // da foto fica, porque o manual (parado) o cita.
    arruma: '__foto.esc() && __foto.menu("Base")',
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 1080,
    largura: 620,
    alturaJanela: 1200,
  },
  {
    nome: '01-menu-animacao.png',
    arruma: '__foto.esc() && __foto.menu("Anima\u00e7\u00e3o")',
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 1560,
    largura: 620,
    alturaJanela: 1700,
  },
  {
    nome: '01-menu-janela.png',
    arruma: '__foto.esc() && __foto.menu("Janela")',
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 900,
    largura: 620,
    alturaJanela: 1050,
  },
  {
    nome: '01-menu-ajuda.png',
    arruma: '__foto.esc() && __foto.menu("Ajuda")',
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 280,
    largura: 620,
  },

  // --- 2. Montar o personagem --------------------------------------------
  {
    nome: '02-arvore.png',
    arruma: '__foto.esc() && __foto.montagem() && __foto.fecharFaixa()'
      + ' && __foto.divisao("esquerda", 0.78) && __foto.aba("Árvore")',
    espera: 700,
    corte: '.panel-column-esquerda .panel-group:first-child',
    folga: 2,
  },
  {
    nome: '02-imagens.png',
    arruma: '__foto.divisao("direita", 0.78) && __foto.aba("Imagens")',
    corte: '.panel-column-direita .panel-group:first-child',
    folga: 2,
  },
  {
    nome: '02-ordem.png',
    arruma: '__foto.divisao("esquerda", 0.78) && __foto.aba("Ordem")',
    corte: '.panel-column-esquerda .panel-group:first-child',
    folga: 2,
  },
  {
    nome: '02-propriedades.png',
    arruma: '__foto.divisao("esquerda", 0.22) && __foto.aba("Árvore") && __foto.arvore("torso")',
    corte: '.panel-column-esquerda .panel-group:last-child',
    folga: 2,
  },
  {
    nome: '02-exibicao.png',
    arruma: '__foto.divisao("direita", 0.94) && __foto.aba("Exibição")',
    corte: '.panel-column-direita .panel-group:first-child',
    folga: 2,
  },

  // --- 3. Peles ------------------------------------------------------------
  {
    nome: '03-peles.png',
    arruma: '__foto.divisao("direita", 0.16) && __foto.aba("Peles")',
    corte: '.panel-column-direita .panel-group:last-child',
    folga: 2,
  },

  // --- 4. Animar -----------------------------------------------------------
  {
    nome: '04-animando.png',
    arruma: '__foto.aba("Animações") && __foto.animacao("walk")',
    espera: 900,
  },
  {
    nome: '04-tocador.png',
    arruma: 'true',
    corte: '.dock-body',
    folga: 2,
    escala: 2,
  },
  {
    nome: '04-linha-do-tempo.png',
    arruma: '__foto.titulo("Detalhes: uma linha por osso")',
    espera: 700,
    corte: '.dock',
    folga: 2,
  },
  {
    nome: '04-curvas.png',
    arruma: '__foto.aba("Curvas")',
    espera: 700,
    corte: '.dock',
    folga: 2,
  },
  {
    nome: '04-casca-de-cebola.png',
    arruma: '__foto.aba("Linha do tempo") && __foto.titulo("Casca de cebola desligada")',
    espera: 900,
    corte: '.shell-center',
    folga: 2,
  },

  // --- 5. As cinco regras --------------------------------------------------
  {
    nome: '05-regras.png',
    // Volta para Montagem e fecha a faixa antes: com a linha do tempo aberta,
    // o grupo de baixo da coluna fica com três dedos de altura e a foto sai
    // mostrando só a tira de abas.
    arruma: '__foto.titulo("Casca de cebola ligada") && __foto.montagem()'
      + ' && __foto.fecharFaixa() && __foto.divisao("direita", 0.16) && __foto.aba("Regras")',
    espera: 800,
    corte: '.panel-column-direita .panel-group:last-child',
    folga: 2,
  },
  {
    // A janela tem duas partes: primeiro o tipo, depois as perguntas daquele
    // tipo. A foto é da segunda, que é o que o capítulo explica.
    nome: '05-nova-regra.png',
    arruma: '__foto.titulo("Nova regra") && __foto.escolher("inversa")'
      + ' && __foto.botao("Continuar")',
    espera: 900,
    corte: '.dialog-box',
    folga: 8,
  },

  // --- 6. Malha e pesos ----------------------------------------------------
  // Malha é coisa de Montagem: volta para Montagem e fecha a faixa de baixo
  // antes das duas fotos, senão elas saem com a linha do tempo aberta.
  {
    nome: '06-malha.png',
    // A ferramenta ANTES da aba: o painel se monta com o que vale na hora, e
    // aberto primeiro ele mostra "escolha a ferramenta Malha ou Pesos".
    // O `face` do herói é uma malha de quatro vértices; **Gerar automática**
    // dá a malha de verdade, que é o que o capítulo ensina. Nada é salvo.
    arruma: '__foto.esc() && __foto.montagem() && __foto.fecharFaixa()'
      + ' && __foto.aba("Árvore") && __foto.arvore("face") && __foto.ferramenta("Malha")'
      + ' && __foto.aba("Malha e pesos") && __foto.botao("Gerar automática")',
    espera: 1200,
  },
  {
    nome: '06-pesos.png',
    arruma: '__foto.ferramenta("Pesos") && __foto.botao("Pesos automáticos")',
    espera: 1200,
  },

  // --- 7. Exportar ---------------------------------------------------------
  {
    nome: '07-menu-exportar.png',
    arruma: '__foto.ferramenta("Selecionar") && __foto.menu("Arquivo") && __foto.item("Exportar")',
    espera: 500,
    corte: '.menu-bar',
    folga: 0,
    alturaMinima: 700,
    largura: 760,
  },

  // --- Os gestos: antes e depois --------------------------------------------
  //
  // Um gesto nao se fotografa apontando para um botao, porque nao ha botao: o
  // retangulo de selecao e o Ctrl + arrastar do Criar osso so existem como
  // movimento do mouse. Estas quatro fotos sao o antes e o depois de cada um,
  // e o arrasto do meio e de verdade, disparado no canvas.
  //
  // Ficam no FIM da lista de proposito: os dois gestos mexem no documento - um
  // escolhe dezessete ossos, o outro cria um osso -, e nenhuma foto depois
  // deles poderia sair limpa. Nada e salvo.
  {
    nome: '02-gesto-retangulo-antes.png',
    arruma: '__foto.esc() && __foto.montagem() && __foto.fecharFaixa()'
      + ' && __foto.divisao("esquerda", 0.78) && __foto.aba("\u00c1rvore")'
      + ' && __foto.divisao("direita", 0.78) && __foto.aba("Imagens") && __foto.ferramenta("Selecionar")',
    espera: 800,
  },
  {
    nome: '02-gesto-retangulo-depois.png',
    arruma: 'true',
    gesto: { de: [600, 140], ate: [860, 480] },
    esperaDepois: 700,
  },
  {
    nome: '02-gesto-criar-osso-antes.png',
    arruma: '__foto.esc() && __foto.ferramenta("Criar osso")',
    espera: 700,
  },
  {
    nome: '02-gesto-criar-osso-depois.png',
    arruma: 'true',
    gesto: { de: [950, 200], ate: [950, 320] },
    esperaDepois: 700,
  },

  // O gesto do lote 31: o pai pega os filhos. Nao ha botao nenhum para
  // apontar - o que existe e a tecla P segurada, o cursor mudado e o rodape
  // dizendo de quem os cliques estao virando filhos. A foto do "depois" e
  // tirada COM a tecla ainda embaixo, que e o unico instante em que o gesto
  // esta a vista; a tecla e solta depois da foto.
  {
    nome: '02-gesto-pegar-filhos-antes.png',
    arruma: '__foto.esc() && __foto.ferramenta("Selecionar")'
      + ' && __foto.aba("Árvore") && __foto.arvore("hips") && __foto.semFoco()',
    espera: 700,
  },
  {
    nome: '02-gesto-pegar-filhos-depois.png',
    arruma: '__foto.semFoco()',
    teclaSegurada: 'p',
    esperaDepois: 500,
    // O que a foto tem que mostrar e o convite do rodape. O cursor tambem
    // muda, mas cursor nao sai em foto: o Chrome nao o desenha no quadro.
    confere: 'document.querySelector(".status-bar").textContent.includes("virar filhos de hips")',
  },

  // O gesto do lote 47: Transformar. A caixa tracejada so aparece com algo
  // escolhido e a ferramenta na mao; o "depois" gira o braco pela bolinha da
  // haste, com um arrasto de verdade.
  {
    nome: '02-gesto-transformar-antes.png',
    arruma: '__foto.esc() && __foto.montagem() && __foto.fecharFaixa()'
      + ' && __foto.aba("Árvore") && __foto.ferramenta("Transformar")'
      + ' && __foto.botao("Ajustar") && __foto.semFoco()',
    espera: 800,
    // Um clique na coxa da frente: escolhe o desenho da perna, e a caixa o
    // envolve. A perna, porque ela nao tem regra: o braco esta num IK, a
    // cabeca num transform (head_lean), a capa num caminho e o cabelo na
    // fisica - todas passam por cima da rotacao, e o "depois" sairia igual.
    gesto: { de: [745, 505], ate: [745, 505] },
    esperaDepois: 600,
  },
  {
    nome: '02-gesto-transformar-depois.png',
    arruma: 'true',
    // A bolinha da haste, arrastada uns 35 graus em volta do pivo: a perna
    // vai para a frente, sem trocar de ferramenta.
    gesto: { de: [735, 499], ate: [768, 485] },
    esperaDepois: 700,
  },

  // --- 8. Vindo do Spriter -------------------------------------------------
  {
    nome: '08-ver-e-travar.png',
    arruma: '__foto.esc() && __foto.rolarBarra()',
    corte: '.viewport-grupo-verTravar',
    folga: 6,
    escala: 3,
  },
];

// ---------------------------------------------------------------------------
// O Chrome, e a conversa com ele
// ---------------------------------------------------------------------------

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  '--force-device-scale-factor=1', '--window-size=1440,900',
  `--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL}`,
  '--no-first-run', '--no-default-browser-check', URL,
], { stdio: 'ignore' });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function alvo() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORTA}/json/list`);
      const lista = await r.json();
      const p = lista.find((t) => t.type === 'page' && t.url.startsWith(URL));
      if (p !== undefined) return p;
    } catch { /* ainda subindo */ }
    await esperar(500);
  }
  throw new Error('o Chrome headless não abriu a página');
}

const pagina = await alvo();
const ws = new WebSocket(pagina.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0;
const pendentes = new Map();
const console_ = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id !== undefined && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled') {
    console_.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ')}`);
  }
  if (m.method === 'Log.entryAdded') console_.push(`${m.params.entry.level}: ${m.params.entry.text}`);
  if (m.method === 'Runtime.exceptionThrown') console_.push(`exceção: ${m.params.exceptionDetails.text ?? ''}`);
};
function cmd(method, params = {}) {
  const meu = ++id;
  return new Promise((res) => { pendentes.set(meu, res); ws.send(JSON.stringify({ id: meu, method, params })); });
}
async function ava(expr) {
  const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails !== undefined) {
    throw new Error(`${expr}\n  ${r.result.exceptionDetails.text ?? 'exceção'}`);
  }
  return r.result?.result?.value;
}

await cmd('Runtime.enable');
await cmd('Log.enable');
await cmd('Page.enable');
await cmd('Emulation.setDeviceMetricsOverride', {
  width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
});

// Espera o editor MONTAR: o canvas da cena e a árvore de ossos.
let pronto = false;
for (let i = 0; i < 60; i++) {
  pronto = await ava(
    "!!document.querySelector('canvas.viewport-canvas') && document.body.innerText.includes('Ossos')",
  );
  if (pronto === true) break;
  await esperar(500);
}
if (pronto !== true) throw new Error('o editor não montou em 30 s');
await esperar(1500);

// O tema escuro é o padrão desde o lote 18, mas o Chrome guarda a escolha
// anterior no perfil. Uma foto do manual é sempre escura: fixa aqui.
await ava(`(() => {
  const r = document.documentElement;
  if (r.dataset.tema !== undefined && r.dataset.tema !== 'escuro') r.dataset.tema = 'escuro';
  if (r.classList.contains('tema-claro')) { r.classList.remove('tema-claro'); r.classList.add('tema-escuro'); }
  return true;
})()`);
await ava(AJUDANTES);

mkdirSync(DESTINO, { recursive: true });

// ---------------------------------------------------------------------------
// Tirar as fotos
// ---------------------------------------------------------------------------

/**
 * A janela em que a foto é tirada.
 *
 * Quase toda foto é em 1440x900, que é onde a interface foi medida. As
 * exceções são os menus altos: o menu Animação tem vinte e nove itens e não
 * cabe em 900 pixels. Fotografar um menu cortado seria esconder justamente os
 * itens do fim, então a janela cresce só para aquela foto e volta depois.
 */
async function janela(altura) {
  await cmd('Emulation.setDeviceMetricsOverride', {
    width: 1440, height: altura, deviceScaleFactor: 1, mobile: false,
  });
  await esperar(300);
}

/**
 * Um arrasto de verdade na cena, com os modificadores.
 *
 * Um gesto não se fotografa clicando num botão: o retângulo de seleção e o
 * `Ctrl` + arrastar do Criar osso só existem como movimento do mouse. Isto
 * dispara os três eventos que o navegador dispararia — descer, andar, subir —
 * com pausas, porque o editor desenha entre um e outro.
 *
 * `modificadores` é o bitmap do CDP: 2 é Ctrl, 1 é Alt, 8 é Shift.
 */
async function arrastar(de, ate, modificadores = 0) {
  const passos = 8;
  await cmd('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: de[0], y: de[1], button: 'left', buttons: 1,
    clickCount: 1, modifiers: modificadores,
  });
  for (let i = 1; i <= passos; i++) {
    await cmd('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: Math.round(de[0] + ((ate[0] - de[0]) * i) / passos),
      y: Math.round(de[1] + ((ate[1] - de[1]) * i) / passos),
      button: 'left', buttons: 1, modifiers: modificadores,
    });
    await esperar(40);
  }
  await cmd('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: ate[0], y: ate[1], button: 'left', buttons: 0,
    clickCount: 1, modifiers: modificadores,
  });
  await esperar(250);
}

/**
 * Uma tecla segurada, e um clique enquanto ela esta embaixo.
 *
 * O gesto de pegar filhos nao e um arrasto: e uma tecla que fica embaixo
 * enquanto o mouse clica. Sao os mesmos eventos que o teclado de verdade
 * manda, pelo mesmo caminho do `arrastar`.
 */
async function tecla(tipo, chave) {
  const codigo = `Key${chave.toUpperCase()}`;
  await cmd('Input.dispatchKeyEvent', {
    type: tipo,
    key: chave,
    code: codigo,
    windowsVirtualKeyCode: chave.toUpperCase().charCodeAt(0),
    nativeVirtualKeyCode: chave.toUpperCase().charCodeAt(0),
    ...(tipo === 'keyDown' ? { text: chave } : {}),
  });
  await esperar(120);
}

const feitas = [];
let alturaAgora = 900;
for (const foto of FOTOS.filter((f) => SO === null || f.nome.includes(SO))) {
  const alturaPedida = foto.alturaJanela ?? 900;
  if (alturaPedida !== alturaAgora) {
    await janela(alturaPedida);
    alturaAgora = alturaPedida;
  }

  const ok = await ava(foto.arruma);
  if (ok !== true) throw new Error(`o passo de "${foto.nome}" não achou o que precisava: ${foto.arruma}`);
  await esperar(foto.espera ?? 450);

  if (foto.gesto !== undefined) {
    await arrastar(foto.gesto.de, foto.gesto.ate, foto.gesto.modificadores ?? 0);
    await esperar(foto.esperaDepois ?? 400);
  }

  if (foto.teclaSegurada !== undefined) {
    await tecla('keyDown', foto.teclaSegurada);
    await esperar(foto.esperaDepois ?? 400);
  }
  if (foto.confere !== undefined) {
    const certo = await ava(foto.confere);
    if (certo !== true) {
      throw new Error(`"${foto.nome}": a tela nao entrou no estado: ${foto.confere}`
        + `
  a pagina devolveu: ${JSON.stringify(certo)}`);
    }
  }

  let clip;
  if (foto.corte !== undefined) {
    const caixa = await ava(`__foto.caixa(${JSON.stringify(foto.corte)}, ${foto.folga ?? 0})`);
    if (caixa === null) throw new Error(`"${foto.nome}": não achei o pedaço ${foto.corte}`);
    if (foto.alturaMinima !== undefined) caixa.height = Math.max(caixa.height, foto.alturaMinima);
    if (foto.largura !== undefined) caixa.width = Math.min(1440 - caixa.x, foto.largura);
    caixa.height = Math.min(caixa.height, alturaAgora - caixa.y);
    clip = { ...caixa, scale: foto.escala ?? 1 };
  }

  const r = await cmd('Page.captureScreenshot', {
    format: 'png',
    ...(clip === undefined ? {} : { clip, captureBeyondViewport: false }),
  });
  const dados = r.result?.data;
  if (dados === undefined) throw new Error(`"${foto.nome}": o Chrome não devolveu a imagem`);
  const bytes = Buffer.from(dados, 'base64');
  writeFileSync(resolve(DESTINO, foto.nome), bytes);
  // A tecla so sobe DEPOIS da foto: e ela que faz o gesto existir.
  if (foto.teclaSegurada !== undefined) await tecla('keyUp', foto.teclaSegurada);
  feitas.push({ nome: foto.nome, bytes: bytes.length });
}

// ---------------------------------------------------------------------------
// O relatório
// ---------------------------------------------------------------------------

const largura = Math.max(...feitas.map((f) => f.nome.length));
for (const f of feitas) {
  console.log(`  ${f.nome.padEnd(largura)}  ${String(f.bytes).padStart(8)} bytes`);
}
console.log(`\n  ${feitas.length} fotos em documentos/manual/imagens/`);
console.log(console_.length === 0 ? '  console limpo' : `\n  CONSOLE:\n${console_.map((l) => `    ${l}`).join('\n')}`);

ws.close();
chrome.kill();
process.exit(0);
