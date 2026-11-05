/**
 * Panel "Prévia" (requirements A5 and A7): up to four animation layers mixed
 * live, on a skeleton of their own.
 *
 * WHY A SECOND SKELETON. The preview plays with the runtime's `AnimationState`
 * over a `Skeleton` built from the same data but kept apart from
 * `doc.skeleton`. Nothing the preview does reaches the drawing area, the
 * playhead or the file: the artist can leave "andar" mixing with "atirar" in a
 * corner of the screen while going on editing a key.
 *
 * WHAT EACH LAYER HAS. The animation, whether it repeats, how fast it plays,
 * how much of it appears (the layer weight), how long the crossfade lasts when
 * the animation is swapped, and which bones it may move. Layer 0 is the base;
 * the ones above write over it. That is what "andar na camada 0, atirar na
 * camada 1 só nos braços" means.
 *
 * FOR A DYSLEXIC READER. Two aligned columns, the written name on the left and
 * the control on the right. One idea per line. Every button carries its word.
 * No abbreviation, nothing under 14px, and the list of what a copy loses is on
 * the screen in full, not behind a tooltip.
 */

/*
 * O estilo NÃO entra aqui: `preview.css` é importado no topo do `main.ts`,
 * junto com os outros cinco CSS de painel. `<link>` criado por script não
 * bloqueia a primeira pintura, e sem CSS o texto perde o espaço entre as
 * palavras — a razão está escrita por extenso lá. `ensurePreviewStylesheet`
 * abaixo cobre só o caso de um painel montado fora da página, num teste ou
 * numa bancada, onde o `main.ts` não rodou.
 */

import { campoNumero } from './campo-numero.js';
import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { registerPanel } from '../contract.js';
import type { AtlasPageData, SkeletonData } from '../../../runtime/src/index.js';
import { AnimationState, CanvasRenderer, Skeleton } from '../../../runtime/src/index.js';
// Degrau 9: a pilha de peles, pela conta única de `viewport/onion.ts`.
import { skinStackOf } from '../viewport/onion.js';
import { button, clear, el, ensureStylesheet, stylesheetsPreloaded } from './dom.js';
import { findAnimation, formatTime, listAnimations, SPEED_OPTIONS } from './animations-model.js';
import { dataWithMontagem, previewMontagemText, testPieces } from './entities-cards-model.js';
import { drawChainAround, posedChain, previewChainAnchor } from '../viewport/montagem-view.js';
import {
  AddBakedAnimation, BAKE_LOSSES, LAYER_COUNT, LAYER_HINT, LAYER_SAYS, bakeMix, bakedName, buildPreviewState,
  defaultLayers, effectiveLayers, findAnimationData, followNotice, followShort, hasAnyLayer, previewDuration,
  type LayerConfig,
  layerNoneLabel,
} from './preview-model.js';

/** Keys per second the copy writes. */
const BAKE_FPS = 30;

/**
 * Size of the little stage, in canvas pixels. The stylesheet stretches it to
 * the width of the panel; a fixed backing store keeps the drawing maths free of
 * the device pixel ratio.
 */
const STAGE_WIDTH = 480;
const STAGE_HEIGHT = 300;

/**
 * Quem está aberto no painel, entre uma redesenhada e outra — 13/09/2026.
 *
 * A Prévia mostrava as QUATRO camadas e a caixa de copiar abertas o tempo
 * todo: 1.933 px de conteúdo num painel que recebe pouco mais de cem. A medição
 * de altura (`ferramentas/provas/medir-paineis.mjs`) apontou, e o Humberto já
 * tinha dito a frase, sobre o painel de malha: *"é uma wikipédia"*.
 *
 * Agora só a **camada 0** nasce aberta — é a de todo dia —, e as outras três e
 * a caixa de copiar nascem dobradas. Uma camada com animação escolhida abre
 * sozinha: o que está configurado nunca fica escondido.
 *
 * O estado mora no MÓDULO, e não no documento: é arrumação de tela, não é
 * conteúdo do `.bone`. É o mesmo jeito do `linkOpen`, no painel de malha.
 */
const aberto = { camadas: [true, false, false, false], copiar: false };

/**
 * Os controles do tocador, em SÍMBOLO — 13/09/2026.
 *
 * A barra da Prévia tinha quatro botões escritos por extenso, e numa coluna de
 * 256 px eles quebravam em **duas linhas**: 106 px de altura antes do painel
 * começar. Era isso que fazia o palco (160 px) não caber no que sobrava (152).
 *
 * A REGRA que decide quando um botão vira desenho, e é a que evita a próxima
 * discussão: **ícone só quando o desenho é universal**. `▶`, `■` e `⏮` são os
 * de qualquer tocador, e são os MESMOS que a linha do tempo já usa aqui do
 * lado — o Humberto os reconhece de todo programa que já abriu. Foi por isso
 * que os botões do painel de malha voltaram a ter NOME no mesmo dia: "Criar
 * aresta" não tem desenho que se leia, e ícone que ninguém entende é pior que
 * palavra comprida.
 *
 * **"Tela cheia" fica com o nome escrito**, pelo mesmo motivo: o símbolo dela
 * não é da família do tocador, e nem toda fonte o desenha. Barra meio símbolo
 * meio palavra é menos bonita que uma barra só de símbolos, e é a que se lê.
 *
 * O nome inteiro está sempre na dica e no `aria-label`.
 */
function botaoSimbolo(simbolo: string, nome: string, dica: string, onClick: () => void): HTMLButtonElement {
  const node = el('button', 'painel-botao previa-simbolo', simbolo) as HTMLButtonElement;
  node.type = 'button';
  node.title = dica;
  node.setAttribute('aria-label', nome);
  node.addEventListener('click', onClick);
  return node;
}

/** Uma dobra: o título abre e fecha, e o painel lembra do estado. */
function dobra(titulo: string, dica: string, comecaAberta: boolean, aoMudar: (open: boolean) => void): HTMLDetailsElement {
  const caixa = el('details', 'previa-dobra') as HTMLDetailsElement;
  caixa.open = comecaAberta;
  const cabeca = el('summary', 'previa-dobra-titulo', titulo);
  cabeca.title = dica;
  caixa.append(cabeca);
  caixa.addEventListener('toggle', () => aoMudar(caixa.open));
  return caixa;
}

/** Links `preview.css` once, the same way `dom.ts` links `panels.css`. */
function ensurePreviewStylesheet(): void {
  if (stylesheetsPreloaded() || typeof document === 'undefined') return;
  const href = new URL('./preview.css', import.meta.url).href;
  if (document.head.querySelector(`link[href="${href}"]`) !== null) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * One line: the written name on the left, the control on the right.
 *
 * A `<label for>` only binds to a form control. When the right-hand side is a
 * box (a slider with its number, a clock) the name is tied by
 * `aria-labelledby`, so a screen reader still says which line it is on.
 */
function row(label: string, control: HTMLElement, id: string): HTMLElement {
  const line = el('div', 'prop-linha');
  const text = el('label', 'prop-rotulo', label);
  text.id = `${id}-rotulo`;
  control.id = id;
  if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement) text.htmlFor = id;
  else control.setAttribute('aria-labelledby', text.id);
  line.append(text, control);
  return line;
}

/** The controls of one layer, kept together so `refresh` can rebuild them. */
interface LayerUi {
  readonly animation: HTMLSelectElement;
  readonly loop: HTMLInputElement;
  readonly speed: HTMLSelectElement;
  readonly alpha: HTMLInputElement;
  readonly alphaText: HTMLElement;
  readonly mix: HTMLInputElement;
  readonly allBones: HTMLInputElement;
  readonly boneList: HTMLElement;
  readonly time: HTMLElement;
}

class PreviewPanel implements Panel {
  readonly id = 'previa';
  readonly title = 'Prévia';
  readonly listensTo = ['file', 'structure', 'assets'] as const;

  private doc: EditorDoc | null = null;
  private host: HTMLElement | null = null;
  private body: HTMLElement | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private renderer: CanvasRenderer | null = null;
  private skeleton: Skeleton | null = null;
  private state: AnimationState | null = null;
  private view = { x: 0, y: 0, zoom: 1 };

  private readonly layers: LayerConfig[] = defaultLayers();
  private readonly ui: LayerUi[] = [];
  private playButton: HTMLButtonElement | null = null;
  private copyButton: HTMLButtonElement | null = null;
  private message: HTMLElement | null = null;

  private playing = false;
  /** A animação aberta que a camada 0 segue agora, ou `null` (G-Q4). */
  private seguindo: string | null = null;
  private frame = 0;
  private lastStamp = 0;

  /**
   * A tela cheia da Visualização — degrau 11, lote 5 (C5).
   *
   * Vai a tela cheia uma caixa PRÓPRIA, com o palco no meio, a lista de
   * animações de um lado e a pilha de peles do outro: *"rodar as animações e
   * pôr e tirar peles para testar"*, nas palavras do Humberto (Q37). Antes ia
   * só o palco, e para trocar de animação era preciso sair.
   */
  private fullBox: HTMLElement | null = null;
  private fullAnims: HTMLElement | null = null;
  private fullSkins: HTMLElement | null = null;
  /**
   * A pilha que a tela cheia está mostrando, ou `null` fora dela.
   *
   * Pôr e tirar pele aqui é **testar**, e testar não edita o personagem: a
   * pilha do documento fica como está, e ao sair a Prévia volta a segui-la. A
   * frase na tela diz isso, para ninguém achar que gravou.
   */
  private fullStack: string[] | null = null;
  /** De onde o palco saiu, para voltar exatamente para lá. */
  private fullHome: HTMLElement | null = null;
  private fullAt: Element | null = null;

  // -------------------------------------------------------------------------
  // Mounting
  // -------------------------------------------------------------------------

  mount(doc: EditorDoc, host: HTMLElement): void {
    ensureStylesheet();
    ensurePreviewStylesheet();
    this.doc = doc;
    this.host = host;
    clear(host);
    host.classList.add('painel');

    const toolbar = el('div', 'painel-barra');
    this.playButton = botaoSimbolo('▶', 'Tocar', 'Toca e pausa (Espaço)', () => this.togglePlay());
    // "Tela cheia" (item 102): a Prévia é onde se JULGA a animação, e julgar
    // numa caixa de trezentos pixels ao lado de quatro painéis é julgar mal. A
    // tecla é `F11`, e só vale com o foco aqui dentro — `F11` do navegador
    // continua sendo `F11` do navegador em qualquer outro lugar da tela.
    const full = button('Tela cheia', () => this.toggleFullscreen());
    full.title = 'Tela cheia (F11). Esc volta';
    full.setAttribute('aria-label', 'Tela cheia (F11). Esc volta');
    toolbar.append(
      this.playButton,
      botaoSimbolo('■', 'Parar', 'Parar', () => this.stop()),
      botaoSimbolo('⏮', 'Reiniciar', 'Reiniciar: volta ao começo', () => this.restart()),
      full,
    );

    // O painel escuta a tecla ele mesmo, na fase de captura, e PARA o evento:
    // assim `F11` nunca chega ao navegador quando o foco está na Prévia, e
    // nunca é atendido duas vezes.
    host.addEventListener('keydown', (event) => {
      if (event.key !== 'F11') return;
      event.preventDefault();
      event.stopPropagation();
      this.toggleFullscreen();
    });

    const body = el('div', 'painel-corpo');
    // Este painel tem PALCO — decisão do Humberto, 13/09/2026. O palco é um
    // canvas de proporção fixa, e num painel baixo ele sozinho já ocupa tudo:
    // exigir que a Prévia inteira caiba sem rolar seria uma régua que nenhuma
    // arrumação de conteúdo cumpre. A régua dela passa a ser outra, e a prova
    // `medir-paineis.mjs` a conhece por esta marca: o palco inteiro, e o começo
    // do que vem depois dele, à vista sem rolar.
    body.dataset.rolagem = 'palco';
    this.body = body;
    host.append(toolbar, body);

    this.build();
    this.startLoop();
  }

  refresh(_change: DocChange): void {
    this.build();
  }

  unmount(): void {
    this.stopLoop();
    this.doc = null;
    this.host = null;
    this.body = null;
    this.canvas = null;
    this.renderer = null;
    this.skeleton = null;
    this.state = null;
    this.ui.length = 0;
  }

  // -------------------------------------------------------------------------
  // Building the body
  // -------------------------------------------------------------------------

  private build(): void {
    const body = this.body;
    const doc = this.doc;
    if (body === null || doc === null) return;
    clear(body);
    this.ui.length = 0;

    const data = doc.data;
    if (data === null) {
      body.append(el('p', 'painel-aviso', 'O arquivo ainda não carregou.'));
      return;
    }
    const animations = listAnimations(doc.file);
    if (animations.length === 0) {
      body.append(el('p', 'painel-aviso', 'Este arquivo ainda não tem animação.'));
      return;
    }

    // Keep only names that still exist, so a renamed animation does not leave
    // a layer pointing at nothing.
    const names = new Set(animations.map((a) => a.name));
    for (const layer of this.layers) {
      if (layer.animation !== null && !names.has(layer.animation)) layer.animation = null;
      if (layer.bones !== null) {
        const kept = layer.bones.filter((bone) => data.bones.some((b) => b.name === bone));
        layer.bones = kept.length === 0 ? null : kept;
      }
    }

    body.append(this.buildStage(doc));
    this.message = el('p', 'previa-recado', '');
    body.append(this.message);

    for (let i = 0; i < LAYER_COUNT; i++) {
      body.append(this.buildLayer(i, data, animations.map((a) => a.name)));
    }

    body.append(this.buildCopyBox());
    this.rebuildState();
    this.syncButtons();
  }

  private buildStage(doc: EditorDoc): HTMLElement {
    const box = el('div', 'previa-tela');
    const canvas = el('canvas', 'previa-canvas');
    canvas.setAttribute('aria-label', 'Prévia da mistura de camadas');
    canvas.width = STAGE_WIDTH;
    canvas.height = STAGE_HEIGHT;
    box.append(canvas);
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    this.renderer = ctx === null ? null : new CanvasRenderer(ctx, {
      images: (page: AtlasPageData) => doc.imageFor(page),
    });
    return box;
  }

  /**
   * Põe o palco da Prévia em tela cheia, e o tira — item 102.
   *
   * Vai a tela cheia a CAIXA do palco, e não o canvas: o canvas tem tamanho
   * fixo em pixels, e sozinho ele apareceria pequeno no meio de um retângulo
   * preto. A caixa estica, e o CSS centraliza o canvas nela.
   *
   * `Esc` já é o jeito do navegador de sair, e por isso não há tecla nossa para
   * isso: inventar uma segunda seria ensinar errado.
   */
  private toggleFullscreen(): void {
    const palco = this.canvas?.parentElement ?? null;
    if (palco === null) return;
    const dono = palco.ownerDocument;
    if (dono.fullscreenElement !== null) {
      void dono.exitFullscreen().catch(() => undefined);
      return;
    }
    const caixa = this.buildFullscreen(palco);
    // Navegador que recusa a tela cheia — permissão negada, ou dentro de um
    // quadro sem `allowfullscreen` — não pode derrubar o painel.
    const pedido = caixa.requestFullscreen?.();
    if (pedido === undefined) {
      this.leaveFullscreen();
      return;
    }
    void pedido.catch(() => this.leaveFullscreen());
  }

  /**
   * Monta a caixa da tela cheia e leva o palco para dentro dela.
   *
   * O palco MUDA DE CASA em vez de ser recriado: o canvas é o mesmo, com o
   * mesmo contexto e o mesmo renderizador, e a animação não pisca ao entrar.
   */
  private buildFullscreen(palco: HTMLElement): HTMLElement {
    const doc = this.doc;
    const caixa = el('div', 'previa-cheia');
    const anims = el('aside', 'previa-cheia-lado');
    const peles = el('aside', 'previa-cheia-lado');
    this.fullBox = caixa;
    this.fullAnims = anims;
    this.fullSkins = peles;
    this.fullStack = doc === null ? [] : [...skinStackOf(doc)];
    this.fullHome = palco.parentElement;
    this.fullAt = palco.nextElementSibling;

    const sair = button('Sair da tela cheia', () => this.toggleFullscreen());
    sair.title = 'Sair da tela cheia (Esc)';
    const topo = el('div', 'previa-cheia-topo', undefined);
    topo.append(el('strong', undefined, 'Visualização'), el('span', 'previa-cheia-dica', 'Esc volta'), sair);

    caixa.append(topo, anims, palco, peles);
    (this.host ?? document.body).append(caixa);
    this.fillFullscreenLists();
    // Sair pelo Esc é do navegador, e a caixa tem de ir embora junto.
    const aoTrocar = (): void => {
      if (caixa.ownerDocument.fullscreenElement === caixa) return;
      caixa.ownerDocument.removeEventListener('fullscreenchange', aoTrocar);
      this.leaveFullscreen();
    };
    caixa.ownerDocument.addEventListener('fullscreenchange', aoTrocar);
    return caixa;
  }

  /** Devolve o palco ao painel e desmonta a caixa da tela cheia. */
  private leaveFullscreen(): void {
    const caixa = this.fullBox;
    const palco = this.canvas?.parentElement ?? null;
    if (caixa === null) return;
    if (palco !== null && this.fullHome !== null) {
      this.fullHome.insertBefore(palco, this.fullAt);
    }
    caixa.remove();
    this.fullBox = null;
    this.fullAnims = null;
    this.fullSkins = null;
    this.fullHome = null;
    this.fullAt = null;
    // A pilha de teste morre aqui: fora da tela cheia vale a do documento.
    this.fullStack = null;
    this.rebuildState();
  }

  /**
   * As duas listas da tela cheia: as animações do corpo e a pilha de peles.
   *
   * A animação escolhida toca na camada 0, que é a de baixo — é a que se olha.
   * A pele ligada e desligada é **teste**: o arquivo não muda, e a frase
   * embaixo da lista diz isso.
   */
  private fillFullscreenLists(): void {
    const doc = this.doc;
    const anims = this.fullAnims;
    const peles = this.fullSkins;
    if (doc === null || anims === null || peles === null) return;

    clear(anims);
    anims.append(el('h3', 'previa-cheia-titulo', 'Animações'));
    const nomes = listAnimations(doc.file).map((item) => item.name);
    if (nomes.length === 0) {
      anims.append(el('p', 'previa-cheia-vazio', 'Esta base ainda não tem animação.'));
    }
    const atual = this.layers[0]?.animation ?? null;
    for (const nome of nomes) {
      const linha = button(nome, () => this.playFullscreen(nome));
      linha.className = nome === atual ? 'previa-cheia-item is-ativa' : 'previa-cheia-item';
      linha.setAttribute('aria-pressed', String(nome === atual));
      anims.append(linha);
    }

    clear(peles);
    peles.append(el('h3', 'previa-cheia-titulo', 'Skins'));
    const pilha = this.fullStack ?? [];
    const todas = (doc.file.skins ?? []).map((skin) => skin.name);
    if (todas.length === 0) {
      peles.append(el('p', 'previa-cheia-vazio', 'Esta base tem só a skin de sempre.'));
    }
    // De cima para baixo, como no painel Peles: a de cima vence (spec §4.4).
    for (const nome of [...todas].reverse()) {
      const ligada = pilha.includes(nome);
      const linha = button(ligada ? `${nome} — ligada` : nome, () => this.toggleFullscreenSkin(nome));
      linha.className = ligada ? 'previa-cheia-item is-ativa' : 'previa-cheia-item';
      linha.setAttribute('aria-pressed', String(ligada));
      peles.append(linha);
    }
    peles.append(el('p', 'previa-cheia-vazio', 'Aqui é teste: pôr e tirar skin não mexe no arquivo.'));
    // Rodada 39, lote 2: a montagem de teste está no desenho, e a frase diz.
    const pecas = testPieces(doc);
    if (pecas > 0) peles.append(el('p', 'previa-cheia-vazio', previewMontagemText(pecas)));
  }

  /** Toca uma animação na camada 0, de dentro da tela cheia. */
  private playFullscreen(name: string): void {
    const layer = this.layers[0];
    if (layer === undefined) return;
    layer.animation = name;
    const escolhida = this.doc === null ? null : findAnimation(this.doc.file, name);
    if (escolhida !== null) layer.loop = escolhida.loop === true;
    this.rebuildState();
    if (!this.playing) this.togglePlay();
    this.fillFullscreenLists();
  }

  /** Põe e tira uma pele da pilha DE TESTE, sem tocar no arquivo. */
  private toggleFullscreenSkin(name: string): void {
    const pilha = this.fullStack;
    if (pilha === null) return;
    this.fullStack = pilha.includes(name)
      ? pilha.filter((outra) => outra !== name)
      : [...pilha, name];
    this.rebuildState();
    this.fillFullscreenLists();
  }

  private buildLayer(index: number, data: SkeletonData, names: readonly string[]): HTMLElement {
    const layer = this.layers[index];
    const box = el('fieldset', 'prop-grupo');
    const title = index === 0 ? 'Camada 0 — a de baixo' : `Camada ${index}`;

    // Animation
    const animation = el('select', 'prop-selecao') as HTMLSelectElement;
    animation.title = 'Animação: o que esta camada toca. Na camada 0, vazio segue a animação aberta';
    // G-Q4: na camada 0, o vazio é seguir a animação aberta.
    const none = el('option', undefined, layerNoneLabel(index));
    none.value = '';
    animation.append(none);
    for (const name of names) {
      const option = el('option', undefined, name);
      option.value = name;
      animation.append(option);
    }
    animation.value = layer.animation ?? '';
    animation.addEventListener('change', () => {
      layer.animation = animation.value === '' ? null : animation.value;
      // A camada nasce com o Repetir da animação escolhida: desde o lote 2 o
      // `loop` mora no arquivo, e a Prévia tem que começar mostrando o que a
      // animação diz de si mesma. Depois disso o campo é de sessão — mexer
      // aqui é experimentar, não editar o arquivo.
      const escolhida = this.doc === null
        ? null : findAnimation(this.doc.file, layer.animation);
      if (escolhida !== null) {
        layer.loop = escolhida.loop === true;
        loop.checked = layer.loop;
      }
      this.rebuildState();
      this.syncButtons();
    });

    // Loop
    const loop = el('input', 'prop-marca') as HTMLInputElement;
    loop.type = 'checkbox';
    loop.title = 'Repetir: a camada volta ao começo quando acaba. Só na Prévia; não muda o arquivo';
    loop.checked = layer.loop;
    loop.addEventListener('change', () => {
      layer.loop = loop.checked;
      this.applyLive(index);
    });

    // Speed
    const speed = el('select', 'prop-selecao') as HTMLSelectElement;
    speed.title = 'Velocidade: quão rápido esta camada toca, em %. Só na Prévia; não muda o arquivo';
    for (const option of SPEED_OPTIONS) {
      const node = el('option', undefined, option.label);
      node.value = String(option.value);
      speed.append(node);
    }
    speed.value = String(layer.speed);
    speed.addEventListener('change', () => {
      layer.speed = Number(speed.value);
      this.applyLive(index);
    });

    // Weight
    const alpha = el('input', 'previa-faixa') as HTMLInputElement;
    alpha.type = 'range';
    alpha.min = '0';
    alpha.max = '1';
    alpha.step = '0.05';
    alpha.value = String(layer.alpha);
    // Rodada 47, lote 5 (nota 3 do doc 85): a barra diz o que é, com a faixa.
    alpha.title = 'Quanto aparece, em %, de 0 a 100: 0 esta camada some, 100 ela entra inteira por cima da de baixo';
    alpha.setAttribute('aria-label', alpha.title);
    const alphaText = el('span', 'previa-numero', percent(layer.alpha));
    alpha.addEventListener('input', () => {
      layer.alpha = Number(alpha.value);
      alphaText.textContent = percent(layer.alpha);
      this.applyLive(index);
    });
    const alphaBox = el('div', 'previa-faixa-linha');
    alphaBox.append(alpha, alphaText);

    // Crossfade
    // Rodada 47, lote 3 (R7 do doc 68): o número da casa, em s, com a faixa na dica.
    const misturaCampo = campoNumero({
      nome: 'Mistura', unidade: 's', min: 0, max: 5, passo: 0.05, id: `previa-mix-${index}`,
      dica: 'Mistura, em s, de 0 a 5: quanto tempo esta camada leva para entrar por cima da de baixo. 0 entra de uma vez',
      ler: () => layer.mix,
      gravar: (v) => { layer.mix = v; },
      falar: (frase) => this.doc?.notice(frase),
    });
    const mix = misturaCampo.input;

    // Bone mask
    const allBones = el('input', 'prop-marca') as HTMLInputElement;
    allBones.type = 'checkbox';
    // Rodada 47, lote 5b (notas do doc 86), nota 4.
    allBones.title = 'Todos os ossos: esta camada move o boneco inteiro. Desmarcado, só os ossos marcados abaixo';
    allBones.checked = layer.bones === null;
    const boneList = el('div', 'previa-ossos');
    allBones.addEventListener('change', () => {
      layer.bones = allBones.checked ? null : data.bones.map((b) => b.name);
      this.fillBoneList(boneList, index, data);
      this.applyLive(index);
    });

    const time = el('div', 'previa-tempo', 'parada');

    box.append(
      row('Animação', animation, `previa-anim-${index}`),
      row('Repetir', loop, `previa-laco-${index}`),
      row('Velocidade', speed, `previa-vel-${index}`),
      row('Quanto aparece', alphaBox, `previa-peso-${index}`),
      comRotuloQueArrasta(row('Mistura', misturaCampo.caixa, `previa-mix-${index}`), misturaCampo.ligarRotulo),
      row('Todos os ossos', allBones, `previa-todos-${index}`),
      boneList,
      row('Tempo', time, `previa-tempo-${index}`),
    );
    // Rodada 47, lote 6d (doc 90; o detalhe do conferente): nada dizia o que é uma camada.
    if (index === 0) box.append(el('p', 'previa-dica', LAYER_SAYS));

    this.ui.push({ animation, loop, speed, alpha, alphaText, mix, allBones, boneList, time });
    this.fillBoneList(boneList, index, data);

    // Dobrada, com o título dizendo o que tem dentro: "Camada 2 — walk" lê-se
    // fechada; "Camada 2" com a camada vazia também. Uma camada com animação
    // escolhida abre sozinha, para o que foi configurado nunca sumir de vista.
    if (layer.animation !== null) aberto.camadas[index] = true;
    // G-Q4: a camada 0 vazia segue a animação aberta, e o título diz qual.
    const aberta = index === 0 ? this.doc?.animation ?? null : null;
    const resumo = layer.animation !== null ? `${title} — ${layer.animation}`
      : aberta !== null ? `${title} — segue ${aberta}` : `${title} — vazia`;
    const caixa = dobra(resumo, LAYER_HINT, aberto.camadas[index] === true,
      (open) => { aberto.camadas[index] = open; });
    caixa.append(box);
    return caixa;
  }

  /** The checkbox per bone. Empty while the layer moves every bone. */
  private fillBoneList(host: HTMLElement, index: number, data: SkeletonData): void {
    clear(host);
    const layer = this.layers[index];
    if (layer.bones === null) {
      host.append(el('p', 'previa-dica', 'Esta camada move a base inteira.'));
      return;
    }
    host.append(el('p', 'previa-dica', 'Marque os ossos que esta camada pode mover.'));
    const chosen = new Set(layer.bones);
    const list = el('ul', 'previa-lista-ossos');
    for (const bone of data.bones) {
      const item = el('li', 'previa-osso');
      const label = el('label', 'previa-osso-rotulo');
      const box = el('input', 'prop-marca') as HTMLInputElement;
      box.type = 'checkbox';
      box.checked = chosen.has(bone.name);
      box.addEventListener('change', () => {
        if (box.checked) chosen.add(bone.name);
        else chosen.delete(bone.name);
        layer.bones = [...chosen];
        this.applyLive(index);
      });
      label.append(box, el('span', 'previa-osso-nome', bone.name));
      item.append(label);
      list.append(item);
    }
    host.append(list);
  }

  private buildCopyBox(): HTMLElement {
    const box = el('fieldset', 'prop-grupo');
    // Rodada 47, lote 5b (notas do doc 86), nota 4: uma linha à vista; a frase inteira está na dica do botão.
    // Rodada 47, lote 6b (doc 88): a frase anterior ainda quebrava em duas linhas.
    box.append(el('p', 'previa-dica', 'Uma chave por quadro'));
    const losses = el('ul', 'previa-perdas');
    for (const line of BAKE_LOSSES) losses.append(el('li', undefined, line));
    box.append(el('p', 'previa-perdas-titulo', 'O que se perde na cópia:'), losses);
    this.copyButton = button('Copiar para a linha do tempo', () => this.copyToTimeline());
    // Rodada 47, lote 4 (R5): a dica diz o que o botão faz.
    this.copyButton.title = 'Copiar para a linha do tempo: grava a mistura como uma animação nova, com uma chave por quadro';
    this.copyButton.setAttribute('aria-label', this.copyButton.title);
    box.append(this.copyButton);
    // Dobrada: são 537 px de aviso do que se perde na cópia, e a cópia é coisa
    // de uma vez por animação. O aviso continua inteiro, um clique adiante.
    const caixa = dobra('Copiar para a linha do tempo',
      'Grava a mistura como uma animação nova, com uma chave por quadro',
      aberto.copiar, (open) => { aberto.copiar = open; });
    caixa.append(box);
    return caixa;
  }

  // -------------------------------------------------------------------------
  // Playback
  // -------------------------------------------------------------------------

  /** Rebuilds the skeleton and the state from the current layer settings. */
  private rebuildState(): void {
    const doc = this.doc;
    // Rodada 39, lote 2: a Prévia mostra a montagem de teste, sempre (plano
    // `22`, §5). O esqueleto dela é outro, montado de uma CÓPIA do arquivo
    // com as peças de teste no lugar; sem teste, é o `data` de sempre.
    const data = doc === null ? null : (dataWithMontagem(doc) ?? doc.data);
    if (doc === null || data === null) {
      this.skeleton = null;
      this.state = null;
      return;
    }
    const skeleton = new Skeleton(data);
    // Degrau 9 (18/09/2026): a pilha INTEIRA, pelo `setSkinStack` da spec §4.4,
    // e não mais pelo `setSkin` de compatibilidade. Com a `default` fora da
    // pilha (I10), a conta velha punha a arte do homem por baixo do lobisomem:
    // a Prévia mostraria o que a cena já não mostra, que é a pior coisa que uma
    // prévia pode fazer.
    // Degrau 11, lote 5: dentro da tela cheia vale a pilha DE TESTE; fora
    // dela, a do documento.
    const pilha = (this.fullStack ?? skinStackOf(doc)).filter(
      (name) => (doc.file.skins ?? []).some((skin) => skin.name === name),
    );
    try {
      skeleton.setSkinStack(pilha);
    } catch {
      // A skin that no longer exists is not worth breaking the preview for.
    }
    this.skeleton = skeleton;
    // G-Q4 (rodada 17): a camada 0 vazia segue a animação aberta.
    this.seguindo = this.layers[0]?.animation === null ? doc.animation : null;
    this.state = buildPreviewState(data, effectiveLayers(this.layers, doc.animation));
    this.fitView();
    this.drawFrame();
  }

  /** Pushes a changed setting into the running state without restarting it. */
  private applyLive(index: number): void {
    const state = this.state;
    const layer = this.layers[index];
    const entry = state?.getCurrent(index) ?? null;
    if (state === null || entry === null) {
      this.rebuildState();
      return;
    }
    entry.loop = layer.loop;
    entry.timeScale = layer.speed;
    entry.alpha = Math.max(0, Math.min(1, layer.alpha));
    entry.boneMask = layer.bones === null ? null : new Set(layer.bones);
    this.drawFrame();
  }

  private togglePlay(): void {
    this.playing = !this.playing;
    this.lastStamp = 0;
    if (this.playing && this.state === null) this.rebuildState();
    this.syncButtons();
  }

  private stop(): void {
    this.playing = false;
    this.syncButtons();
  }

  private restart(): void {
    this.rebuildState();
    this.syncButtons();
  }

  private syncButtons(): void {
    const doc = this.doc;
    const data = doc?.data ?? null;
    const ready = data !== null && hasAnyLayer(data, effectiveLayers(this.layers, doc?.animation ?? null));
    if (this.playButton !== null) {
      // `❚❚` é a pausa de todo tocador, e a palavra inteira fica na dica.
      this.playButton.textContent = this.playing ? '❚❚' : '▶';
      this.playButton.title = this.playing ? 'Pausar (Espaço)' : 'Toca e pausa (Espaço)';
      this.playButton.setAttribute('aria-label', this.playing ? 'Pausar' : 'Tocar');
      this.playButton.disabled = !ready;
    }
    if (this.copyButton !== null) this.copyButton.disabled = !ready;
    if (this.message !== null) {
      // Rodada 47, lote 4 (R10): uma linha à vista; a frase inteira na dica.
      this.message.textContent = !ready
        ? 'Escolha a animação da camada 0'
        : this.seguindo !== null ? followShort(this.seguindo) : '';
      this.message.title = !ready
        ? 'Escolha uma animação na camada 0 para ver a mistura.'
        : this.seguindo !== null ? followNotice(this.seguindo) : '';
    }
    this.updateTimes();
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const step = (stamp: number): void => {
      // G-Q4: a animação aberta mudou e a camada 0 a segue: refaz.
      const doc = this.doc;
      if (doc !== null && this.layers[0]?.animation === null && doc.animation !== this.seguindo) {
        this.build();
      }
      // Seguindo a aberta, e a Prévia sem tocar por conta própria: ela mostra
      // o quadro da agulha — anda quando a linha do tempo toca, e para junto.
      if (!this.playing && this.seguindo !== null && doc !== null) {
        const entry = this.state?.getCurrent(0) ?? null;
        if (entry !== null && Math.abs(entry.trackTime - doc.time) > 1e-6) {
          entry.trackTime = doc.time;
          this.drawFrame();
        }
      }
      if (this.playing) {
        const delta = this.lastStamp === 0 ? 0 : Math.min(0.25, (stamp - this.lastStamp) / 1000);
        this.lastStamp = stamp;
        this.state?.update(delta);
        this.drawFrame();
      }
      this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  private stopLoop(): void {
    if (this.frame !== 0 && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.playing = false;
  }

  /** Poses the preview skeleton and paints it. */
  private drawFrame(): void {
    const skeleton = this.skeleton;
    const state = this.state;
    const canvas = this.canvas;
    const renderer = this.renderer;
    const doc = this.doc;
    // Lote 7: quem está em volta (o mecha) toca no relógio da Prévia.
    const tempo = state?.getCurrent(0)?.animationTime ?? 0;
    if (skeleton !== null && state !== null) {
      state.apply(skeleton);
      skeleton.parentMatrix = doc === null ? null : previewChainAnchor(doc, tempo);
      skeleton.updateWorldTransform();
    }
    this.updateTimes();
    if (canvas === null || renderer === null) return;
    const ctx = renderer.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (skeleton === null) return;
    // Y goes up in the file and down on a canvas (spec 3.3).
    ctx.setTransform(
      this.view.zoom, 0, 0, -this.view.zoom,
      (canvas.width / 2) + this.view.x, (canvas.height / 2) + this.view.y,
    );
    if (doc === null) renderer.draw(skeleton);
    else drawChainAround(doc, tempo, (fora) => renderer.draw(fora), () => renderer.draw(skeleton));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /** Fits the character in the little stage, once per rebuild. */
  private fitView(): void {
    const skeleton = this.skeleton;
    const canvas = this.canvas;
    if (skeleton === null || canvas === null) return;
    skeleton.setToSetupPose();
    // Lote 7: o conjunto inteiro cabe, com quem está em volta.
    const doc = this.doc;
    skeleton.parentMatrix = doc === null ? null : previewChainAnchor(doc, 0);
    skeleton.updateWorldTransform();
    const bounds = skeleton.getBounds();
    for (const fora of doc === null ? [] : posedChain(doc, 0)) {
      const b = fora.getBounds();
      if (b.width <= 0 || b.height <= 0) continue;
      const x0 = Math.min(bounds.x, b.x);
      const y0 = Math.min(bounds.y, b.y);
      bounds.width = Math.max(bounds.x + bounds.width, b.x + b.width) - x0;
      bounds.height = Math.max(bounds.y + bounds.height, b.y + b.height) - y0;
      bounds.x = x0;
      bounds.y = y0;
    }
    const width = canvas.width;
    const height = canvas.height;
    if (bounds.width <= 0 || bounds.height <= 0) {
      this.view = { x: 0, y: 0, zoom: 1 };
      return;
    }
    const zoom = Math.min(width / bounds.width, height / bounds.height) * 0.85;
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    this.view = { x: -cx * zoom, y: cy * zoom, zoom };
  }

  /** Writes the clock of every layer on the screen. */
  private updateTimes(): void {
    const state = this.state;
    for (let i = 0; i < this.ui.length; i++) {
      const box = this.ui[i].time;
      const entry = state?.getCurrent(i) ?? null;
      if (entry === null) {
        box.textContent = 'parada';
        continue;
      }
      const total = entry.animation.duration;
      const mixing = entry.mixingFrom !== null
        ? ` · misturando ${Math.round(entry.mixProgress * 100)}%`
        : '';
      box.textContent = `${formatTime(entry.animationTime)} de ${formatTime(total)}${mixing}`;
    }
  }

  // -------------------------------------------------------------------------
  // Copy to the timeline
  // -------------------------------------------------------------------------

  private copyToTimeline(): void {
    const doc = this.doc;
    const data = doc?.data ?? null;
    if (doc === null || data === null) return;
    if (!hasAnyLayer(data, this.layers)) {
      doc.notice('Escolha uma animação antes de copiar.');
      return;
    }
    if (previewDuration(data, this.layers) <= 0) {
      doc.notice('A mistura dura zero segundo. Não há o que copiar.');
      return;
    }
    const baked = bakeMix(data, this.layers, { fps: BAKE_FPS, name: bakedName(doc.file) });
    if (baked === null) {
      doc.notice('Não deu para copiar a mistura.');
      return;
    }
    doc.run(new AddBakedAnimation(baked));
    const count = baked.timelines?.length ?? 0;
    // Sem ponto no fim: a barra de estado põe o dela e sairiam dois.
    const faixas = count === 1 ? '1 faixa de osso' : `${count} faixas de osso`;
    doc.notice(`Animação "${baked.name}" criada, com ${faixas} e ${BAKE_FPS} chaves por segundo`);
  }
}

/** `0,5` shown the way a Portuguese reader expects a percentage. */
function percent(alpha: number): string {
  return `${Math.round(alpha * 100)}%`;
}

export const previewPanel = new PreviewPanel();
registerPanel(previewPanel);

/** Rodada 47, lote 5 (nota 3 do doc 85): o rótulo da linha arrasta o número, como na ficha. */
function comRotuloQueArrasta(linha: HTMLElement, ligar: (rotulo: HTMLElement) => void): HTMLElement {
  const rotulo = linha.querySelector('label');
  if (rotulo !== null) ligar(rotulo);
  return linha;
}
