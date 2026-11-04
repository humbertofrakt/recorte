/**
 * Panel "Propriedades": the fields of whatever is selected.
 *
 * Two columns of equal width, label on the left, field on the right, so the eye
 * has a straight line to follow. Numeric fields can be dragged sideways to
 * change the value and accept simple arithmetic like `100/2`. Every field
 * writes into the `.bone` JSON through a `SetProperty` command with the right
 * JSON Pointer — there is no intermediate model.
 */

import { groupsOpen } from './properties-model.js';
import { lembrarFoco } from './dom.js';
import type { BoneFile, KeyValue } from '../../../runtime/src/index.js';
import type { DocChange, EditorDoc, Panel, Selection } from '../contract.js';
import { emptySelection, registerPanel, corpoDe } from '../contract.js';
import { runReparent } from '../doc/reparent.js';
import { targetForPointer } from '../anim/keying.js';
import {
  COMPENSATION_LABELS, getCompensation, onCompensationChange, setCompensation,
  type CompensationFlags,
} from '../viewport/tools/space.js';
import { getActiveToolId, onActiveToolChange } from '../viewport/tools/registry.js';
import { currentValueOf, setPropertyOrKey } from '../anim/pose-mode.js';
import { button, checkbox, clear, el, ensureStylesheet, fromHex, iconButton, toHex } from './dom.js';
import { pointerOf } from './json-pointer.js';
import { SetProperty } from '../doc/commands.js';
import { originalImageOf } from './mesh-panel.js';
import { THUMB_SIZE, thumbnailFor } from './thumbnails.js';
import { openImagePicker, targetOfSelection } from './image-picker.js';
import type { PickerTarget } from './image-picker-model.js';
import { swapPickFor } from './skins-model.js';
import { traceHullFromImage } from '../mesh/mesh-edit.js';
import { currentEventChoice, eventFocused, onEventFocus, releaseEventFocus, renderEventKeyEditor } from './event-key-editor.js';
// Degrau 9 (9.9): a ficha da chave `body` — a pilha passa na virada?
import {
  KEEP_SKINS_HINT, KEEP_SKINS_LABEL, SetKeepSkins, bodyKeyView, type BodyKeyView,
  belowQuick, compensationApplies, evalFieldInput, notNumberSays, scrubValue,
} from './properties-model.js';
import {
  alphaDragSays, alphaShown, alphaTip, arrowDirection, emptyGradientSays, EMPTY_GRADIENT_SHORT, buildProperties, entityShownName, evalNumberExpression, fieldIsSet, fieldValue, formatNumberField,
  REFUSED_MESSAGE, findAttachment, silhouetteSources, skinFieldCommand, stepValue, writeFieldValue,
  type FieldDef, type FieldGroup,
} from './properties-model.js';
import { weightBadge, weightHint } from './particle-weight.js';
import { ChooseShape, shapeExitTitle, shapeNameLine, shapeSummaryLine, type ShapeButton, type SheetRow, type SheetTab } from './particle-sheet.js';
import {
  LIFE_PRESETS, addColorKey, addLifeKey, gradientBandsCss, lifeRange, moveColorKey, moveLifeKey, readColorKeys, readStartColors,
  readLifeKeys, removeLifeKey, sampleLife, setColorKey,
} from './life-curve.js';
import { BURST_FIELDS, burstWindowPlace, addBurst, burstSummary, burstsLine, readBursts, removeBurst, setBurstField } from './burst-list.js';
import { openFloatingMenu } from '../ui/floating-menu.js';
import {
  alphaFromSlider, angleFromDial, dialPoint, formatQuick, quickFields, quickSubject,
  heldByRuleAfterWrite, readQuickNow, sliderFromAlpha, worldAngleOfField, writeQuickValue,
} from './quick-model.js';
import type { QuickField } from './quick-model.js';

import { RenameItem, type RenameTarget } from './tree-model.js';

/** A aba aberta da ficha do emissor (rodada 16): estado só da tela, nunca do arquivo. */
let abaDoEmissor = 'nascer';

/** Quanto os losangos do gradiente ficam para dentro da faixa, em px (rodada 16, lote 4). */
const RECUO_DO_LOSANGO = 9;

/** A janelinha das rajadas aberta (rodada 16, lote 5), para fechar de qualquer lugar. */
let janelaRajadas: HTMLElement | null = null;

function fecharRajadas(): void {
  janelaRajadas?.remove();
  janelaRajadas = null;
  document.removeEventListener('pointerdown', foraDaJanela, true);
  document.removeEventListener('keydown', escDaJanela, true);
}

/**
 * O Esc fecha a janela das Rajadas de onde estiver o foco — rodada 17 (sobra
 * da rodada 32). O botão dizia "Fechar (Esc)" e o Esc não fechava: o foco
 * fica no botão "Rajadas ▾", na ficha, e a tecla só era ouvida DENTRO da
 * janela. Ouvida no documento enquanto a janela existe; tratada uma vez
 * (regra 12).
 */
function escDaJanela(e: KeyboardEvent): void {
  if (e.key !== 'Escape' || janelaRajadas === null) return;
  e.preventDefault();
  e.stopPropagation();
  fecharRajadas();
}

function foraDaJanela(e: PointerEvent): void {
  if (janelaRajadas !== null && !janelaRajadas.contains(e.target as Node)) fecharRajadas();
}

/** Nada escolhido: nem osso, nem slot, nem desenho, nem regra, nem parâmetro. */
function isEmptySelection(sel: Selection): boolean {
  return sel.bones.length === 0 && sel.slots.length === 0 && sel.attachments.length === 0
    && sel.constraints.length === 0 && (sel.parameters ?? []).length === 0 && (sel.variables ?? []).length === 0;
}

class PropertiesPanel implements Panel {
  readonly id = 'propriedades';
  readonly title = 'Propriedades';
  readonly listensTo = ['file', 'structure', 'transform', 'selection', 'time'] as const;

  private doc: EditorDoc | null = null;
  private body: HTMLElement | null = null;
  private stopToolWatch: (() => void) | null = null;
  private stopEventFocus: (() => void) | null = null;
  private stopCompensationWatch: (() => void) | null = null;
  private readonly compensationBoxes = new Map<keyof CompensationFlags, HTMLInputElement>();
  private titleNode: HTMLElement | null = null;
  private noticeNode: HTMLElement | null = null;

  mount(doc: EditorDoc, host: HTMLElement): void {
    ensureStylesheet();
    this.doc = doc;
    clear(host);
    host.classList.add('painel');

    const title = el('h2', 'prop-titulo', 'Propriedades');
    const notice = el('p', 'painel-aviso prop-aviso');
    notice.hidden = true;
    // `prop-corpo` aperta o preenchimento de baixo de `.painel-corpo` (16px,
    // de `panels.css`, pensado para uma lista) — prova de altura, 13/09/2026.
    const body = el('div', 'painel-corpo prop-corpo');
    this.titleNode = title;
    this.noticeNode = notice;
    this.body = body;
    host.append(title, notice, body);
    // O bloco Compensar aparece e some com a ferramenta, e as caixas têm que
    // acompanhar quem as mudou pelo menu Esqueleto.
    this.stopToolWatch = onActiveToolChange(() => this.render());
    // Rodada 17, D2: o evento escolhido na Árvore abre a ficha dele.
    this.stopEventFocus = onEventFocus(() => this.render());
    this.stopCompensationWatch = onCompensationChange((flags) => {
      for (const [id, box] of this.compensationBoxes) box.checked = flags[id];
    });
    this.render();
  }

  refresh(change: DocChange): void {
    // D2: outra escolha tira o foco do evento.
    if (change.kind === 'selection' || change.kind === 'file') releaseEventFocus();
    this.render();
  }

  unmount(): void {
    this.stopToolWatch?.();
    this.stopToolWatch = null;
    this.stopEventFocus?.();
    this.stopEventFocus = null;
    this.stopCompensationWatch?.();
    this.stopCompensationWatch = null;
    this.compensationBoxes.clear();
    this.doc = null;
    this.body = null;
    this.titleNode = null;
    this.noticeNode = null;
  }

  private render(): void {
    const doc = this.doc;
    const body = this.body;
    if (!doc || !body) return;
    // Rodada 47, lote 4: a barrinha (o Alfa, a opacidade da cor) mexida pelo
    // teclado continua com o foco depois de gravar e redesenhar.
    const voltarFoco = lembrarFoco(body);
    queueMicrotask(() => voltarFoco());

    // As peles visíveis decidem quais desenhos a lista do campo "Anexo" mostra.
    const model = buildProperties(corpoDe(doc).file, doc.selection, doc.visibleSkins);
    if (this.titleNode) {
      this.titleNode.textContent = model.title;
      // A ficha em abas (rodada 16) muda o título; as outras o devolvem.
      this.titleNode.title = '';
      this.titleNode.classList.remove('prop-titulo-aba');
      // Rodada 43, lote 1: a linha de baixo — a imagem e o osso do desenho.
      if (model.subtitle !== undefined) {
        this.titleNode.append(el('span', 'prop-subtitulo', model.subtitle));
      }
    }

    clear(body);
    if (model.message !== undefined) {
      body.append(el('p', 'painel-aviso', model.message));
      return;
    }
    // Rodada 17, D2: o evento em foco (o clique dele na Árvore) — a ficha dele
    // e mais nada, com o nome no título. A da Base volta na próxima escolha.
    const temEvento = (doc.file.events ?? []).length > 0;
    if (eventFocused() && temEvento && isEmptySelection(doc.selection)) {
      if (this.titleNode) this.titleNode.textContent = `Evento: ${currentEventChoice() || (doc.file.events ?? [])[0]?.name || ''}`;
      const box = el('div', 'prop-eventos');
      body.append(box);
      renderEventKeyEditor(doc, box);
      return;
    }
    // A ficha rápida vem PRIMEIRO: são os seis campos que se mexem o dia
    // inteiro, e no painel de hoje a rotação de um osso está na terceira
    // seção, abaixo de nome, cor, ícone e comprimento — lote 22.
    // Rodada 16: com a ficha do emissor em abas, a Ficha rápida mora DENTRO da
    // aba Lugar (`renderTabs`) — em cima das abas ela comia 140 dos 187 px.
    const ficha = model.tabs === undefined ? this.renderQuick() : null;
    if (ficha !== null) body.append(ficha);

    // O bloco da silhueta só existe para uma máscara escolhida.
    const silhueta = this.renderSilhouette();

    // Compensar vem ANTES dos campos: é o que muda o efeito do arrasto que a
    // pessoa está prestes a fazer, e ler depois dos vinte campos do osso seria
    // ler tarde demais.
    const compensar = this.renderCompensation();
    if (compensar !== null) body.append(compensar);

    // Rodada 16, lote 1: o emissor tem a ficha em abas, sem rolar.
    if (model.tabs !== undefined) {
      body.append(this.renderTabs(model.tabs));
      // Lote 6: o selo de peso, NA FRENTE do título — palavra e número, a
      // conta inteira na dica. Avisa, nunca impede.
      if (model.weight !== undefined && this.titleNode !== null) {
        const nivel = model.weight.emissor.palavra === 'médio' ? 'medio' : model.weight.emissor.palavra;
        const selo = el('span', `prop-selo prop-selo-${nivel}`, weightBadge(model.weight.emissor));
        const dica = weightHint(model.weight.emissor, model.weight.boneco);
        selo.title = dica;
        selo.setAttribute('aria-label', dica);
        this.titleNode.prepend(selo);
        this.titleNode.title = `${dica} — ${this.titleNode.title}`;
      }
    }
    // Rodada 43, lote 1: embaixo da ficha rápida, só o que ela não mostra.
    else for (const node of this.renderGroups(belowQuick(model.groups, ficha === null ? [] : this.quickKeysShown()))) body.append(node);
    if (silhueta !== null) body.append(silhueta);

    // O bloco da chave de evento vem no fim: é onde se escolhe QUAL evento a
    // chave dispara e se editam os cinco valores daquela chave (requisito A3).
    //
    // Porta D5 (degrau 12): ele deixou de ser gatilhado pela animação aberta.
    // Dentro dele mora agora a ficha da **definição** — o som, a pasta dos
    // sons e os cinco padrões —, e isso não é coisa de uma animação só: o som
    // do evento é do arquivo. A parte de chavear continua dizendo "abra uma
    // animação", que é a verdade dela.
    // Rodada 16: não embaixo da ficha do emissor em abas. Ali ele empurrava a
    // ficha para fora do painel; a definição do evento é do arquivo e aparece
    // com qualquer outra escolha.
    //
    // Rodada 43, lote 1 (doc `51`, foto 22): a seção do evento aparecia dentro
    // da ficha de um OSSO e de um DESENHO, comendo a altura de uma ficha que já
    // não cabia. Ela mora agora só onde se escolhe um evento: a linha dele na
    // Árvore (acima) e o quadro "Chave de evento" da linha do tempo.

    // Degrau 9 (9.9, I14): com o cursor EM CIMA de uma virada de corpo, a
    // ficha dela — por enquanto uma pergunta só, e é a que o Humberto fez:
    // *"a pilha de peles passa ou não: quem faz decide"*.
    const virada = bodyKeyView(doc.file, doc.animation, doc.time);
    if (virada !== null) body.append(this.bodyKeyBlock(doc, virada));
  }

  /** A ficha da chave `body` do tempo de agora — degrau 9, tarefa 9.9. */
  private bodyKeyBlock(doc: EditorDoc, virada: BodyKeyView): HTMLElement {
    const box = el('div', 'prop-virada');
    const nome = virada.value ?? 'a base do arquivo';
    box.append(el('h3', 'prop-grupo-titulo', `Virada de base: ${nome}`));
    const marca = checkbox(virada.keepSkins, (on) => {
      doc.run(new SetKeepSkins(doc.animation!, virada.time, on));
      this.render();
    });
    const rotulo = el('label', 'prop-virada-marca');
    rotulo.title = KEEP_SKINS_HINT;
    rotulo.append(marca, el('span', undefined, KEEP_SKINS_LABEL));
    box.append(rotulo, el('p', 'prop-virada-ajuda', KEEP_SKINS_HINT));
    return box;
  }

  /**
   * "Compensar": o que fica no lugar enquanto o osso se mexe.
   *
   * Saiu da barra da cena no lote 4 e veio para cá. **Só aparece com Mover,
   * Girar ou Escalar ativa**, que são as três ferramentas em que ele muda
   * alguma coisa; nas outras ele era meia barra de tela ocupada por três
   * interruptores que não faziam nada.
   *
   * Continua sendo o mesmo `setCompensation` do menu Esqueleto: marcar aqui
   * acende a marca lá, e o contrário também.
   */
  /**
   * A **ficha rápida**: seis campos, sempre os mesmos, sempre no alto.
   *
   * `x` · `y` · escala X · escala Y · o **ângulo com disco** · o **alfa com
   * barra**. É a `Object Properties` do Spriter, e ela existe porque o painel
   * de baixo mostra tudo o que o formato tem, na ordem do formato — que não é
   * a ordem em que se trabalha.
   *
   * Nada some: o resto do painel continua embaixo, inteiro.
   */
  private renderQuick(): HTMLElement | null {
    const doc = this.doc;
    if (doc === null) return null;
    const subject = quickSubject(doc.selection);
    const fields = subject.kind === 'none' ? [] : quickFields(corpoDe(doc).file, subject);
    // Rodada 8a, achado 3: o desenho que é entidade diz o NOME dela — e não a
    // imagem de outra pele que tenha o mesmo nome de anexo ("face").
    const entidade = this.selectedEntityName(doc);
    // Lote 60: o campo Imagem, quando o escolhido é um desenho com imagem.
    const alvo = entidade === null ? targetOfSelection(doc) : null;
    if (fields.length === 0 && alvo === null && entidade === null) return null;

    const box = el('div', 'ficha');
    box.append(el('h3', 'ficha-titulo', 'Ficha rápida'));
    const grade = el('div', 'ficha-grade');
    if (entidade !== null) {
      const dica = `Entidade: ${entidade}. Para trocar, ou para a imagem de antes voltar: botão direito nela, na cena`;
      const nome = el('span', 'ficha-nome', 'Entidade');
      nome.title = dica;
      const caixa = el('div', 'ficha-controle');
      const valor = el('span', 'prop-imagem-nome', entidade);
      valor.title = dica;
      caixa.append(valor);
      grade.append(nome, caixa);
    }
    if (alvo !== null) {
      const partes = this.renderQuickImage(doc, alvo);
      // Rodada 43, lote 3 (doc 58, C2): o clique na cena escolhe o osso E o
      // desenho; a Imagem é a do desenho clicado, e a dica diz de quem.
      if (subject.kind === 'bone' && partes[0] !== undefined) {
        partes[0].title = `A imagem do desenho ${alvo.slot}, escolhido junto com o osso ${subject.name}. ${partes[0].title}`;
      }
      grade.append(...partes);
    }
    // X/Y são uma ideia (a posição) e Escala X/Escala Y são outra (o
    // tamanho): cada par cabe numa linha só — prova de altura, 13/09/2026.
    // Ângulo (disco) e Alfa (barra) ficam cada um na sua: o controle é maior
    // e diferente, e não sobra o mesmo jeito de parear.
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]!;
      const next = fields[i + 1];
      const par = (field.key === 'x' && next?.key === 'y')
        || (field.key === 'scaleX' && next?.key === 'scaleY');
      if (par && next !== undefined) {
        grade.append(this.renderQuickPair(doc, field, next));
        i += 1;
        continue;
      }
      grade.append(...this.renderQuickField(doc, field));
    }
    box.append(grade);
    return box;
  }

  /** As chaves que a ficha rápida mostra em cima, com valor — o painel não as repete embaixo. */
  private quickKeysShown(): string[] {
    const doc = this.doc;
    if (doc === null) return [];
    const subject = quickSubject(doc.selection);
    if (subject.kind === 'none') return [];
    return quickFields(corpoDe(doc).file, subject).filter((f) => f.pointer !== null).map((f) => f.key);
  }

  /** O nome da entidade do desenho escolhido (um desenho, ou um slot só), ou `null`. */
  private selectedEntityName(doc: EditorDoc): string | null {
    const corpo = corpoDe(doc);
    const { attachments, slots } = doc.selection;
    if (attachments.length === 1) {
      const one = attachments[0]!;
      return entityShownName(corpo.file, one.slot, one.attachment);
    }
    if (attachments.length !== 0 || slots.length !== 1) return null;
    const slot = slots[0]!;
    const shown = corpo.skeleton?.findSlot(slot)?.attachment?.name
      ?? (corpo.file.slots ?? []).find((s) => s.name === slot)?.attachment ?? null;
    return shown === null || shown === undefined ? null : entityShownName(corpo.file, slot, shown);
  }

  /** Duas linhas da ficha, lado a lado — só para pares curtos como X/Y. */
  private renderQuickPair(doc: EditorDoc, a: QuickField, b: QuickField): HTMLElement {
    const wrap = el('div', 'ficha-par');
    wrap.append(...this.renderQuickField(doc, a), ...this.renderQuickField(doc, b));
    return wrap;
  }

  /** A linha Imagem da ficha — lote 60: a mesma lista da pasta do campo de baixo. */
  private renderQuickImage(doc: EditorDoc, alvo: PickerTarget): HTMLElement[] {
    const nome = el('label', 'ficha-nome', 'Imagem');
    const caixa = el('div', 'ficha-controle');
    const daBase = swapPickFor(corpoDe(doc).file, alvo.slot, alvo.attachment)?.from ?? alvo.attachment;
    // K8 (P24): com animação aberta, o desenho que o slot mostra NESTE quadro —
    // a troca de imagem na animação já vale, e o campo dizia "face" com o rosto
    // trocado. Sem animação, ou sem desenho no quadro, o da base.
    const noQuadro = doc.animation === null
      ? null
      : doc.skeleton?.findSlot(alvo.slot)?.attachment?.name ?? null;
    const atual = noQuadro ?? daBase;
    const botao = this.imageButton(doc, alvo, atual);
    botao.id = 'ficha-imagem';
    nome.htmlFor = botao.id;
    nome.title = botao.title;
    caixa.append(botao);
    return [nome, caixa];
  }

  /**
   * O campo **Imagem** — lote 60, plano pasta do projeto. A miniatura com o
   * nome; o clique abre, por baixo, as imagens da mesma subpasta, como o campo
   * de imagem do Spriter.
   */
  private imageButton(doc: EditorDoc, alvo: PickerTarget, image: string): HTMLButtonElement {
    const botao = el('button', 'prop-imagem') as HTMLButtonElement;
    botao.type = 'button';
    const url = thumbnailFor(doc, image, 28);
    if (url !== null) {
      const img = el('img') as HTMLImageElement;
      img.src = url;
      img.width = 28;
      img.height = 28;
      img.alt = '';
      botao.append(img);
    }
    botao.append(el('span', 'prop-imagem-nome', image));
    const dica = `Imagem: ${image}. Clique para ver as imagens da mesma pasta e trocar. `
      + 'Shift na escolha troca em todas as skins';
    botao.title = dica;
    botao.setAttribute('aria-label', dica);
    botao.addEventListener('click', () => {
      const box = botao.getBoundingClientRect();
      openImagePicker(doc, box.left, box.bottom + 4, alvo);
    });
    return botao;
  }

  /** Uma linha da ficha: o nome, o número, e o disco ou a barra quando há. */
  private renderQuickField(doc: EditorDoc, field: QuickField): HTMLElement[] {
    const nome = el('label', 'ficha-nome', field.label);
    nome.title = field.hint;
    // Rodada 43, lote 2: arrastar o RÓTULO muda o número (o scrubby do Photoshop).
    if (field.pointer !== null) {
      const ehBarraR = field.control === 'barra';
      this.attachScrub(nome, ehBarraR ? 1 : field.step,
        () => { const v = readQuickNow(doc, field).frame; return ehBarraR ? sliderFromAlpha(v) : v; },
        (v) => this.writeQuick(doc, field, ehBarraR ? alphaFromSlider(v) : v));
    }

    const caixa = el('div', 'ficha-controle');
    if (field.pointer === null) {
      // Vazia, e não cinza: um campo cinza que nunca acende é um campo que se
      // aprende a ignorar. A dica no nome diz por que ela está vazia.
      caixa.classList.add('ficha-vazia');
      caixa.append(el('span', 'ficha-sem', '—'));
      caixa.title = field.hint;
      return [nome, caixa];
    }

    // K8 (P24): o valor DO QUADRO, e não o da base — a ficha grava no quadro,
    // e mostrava a base. A base vai ao lado, em cinza, quando é outra.
    const leitura = readQuickNow(doc, field);
    const atual = leitura.frame;
    const campo = document.createElement('input');
    campo.type = 'text';
    campo.className = 'ficha-campo';
    campo.inputMode = 'decimal';
    campo.value = field.control === 'barra'
      ? String(sliderFromAlpha(atual))
      : formatQuick(atual);
    campo.title = field.hint;
    campo.setAttribute('aria-label', `${field.label}: ${field.hint}`);
    // Rodada 43, lote 3 (doc 59): uma regra (o ik) segura o osso, e o campo
    // mostrava o número digitado como se valesse na tela. O número fica (é o
    // que está guardado), mas o campo ganha a borda de aviso e a dica diz quem manda.
    const preso = heldByRuleAfterWrite(doc, field.pointer, false);
    if (preso !== null) {
      campo.classList.add('ficha-presa');
      campo.title = `${preso}. O número aqui é o guardado; a tela mostra o que a regra manda. ${field.hint}`;
    }
    campo.addEventListener('keydown', (event) => event.stopPropagation());
    const gravar = (valor: number): void => this.writeQuick(doc, field, valor);
    campo.addEventListener('change', () => {
      // Rodada 43, lote 2: a conta (90+15, *2, +-10) e a recusa que fala.
      const agora = field.control === 'barra' ? sliderFromAlpha(atual) : atual;
      const lido = evalFieldInput(campo.value, agora);
      if (lido === null) {
        const mostra = field.control === 'barra' ? String(sliderFromAlpha(atual)) : formatQuick(atual);
        doc.notice(notNumberSays(campo.value, field.label, mostra, field.unit));
        this.render();
        return;
      }
      gravar(field.control === 'barra' ? alphaFromSlider(lido) : lido);
    });
    // Setas — lote 48. O alfa anda de 1 em 1, que é o número que o campo mostra.
    const ehBarra = field.control === 'barra';
    campo.id = `ficha-${field.key}`;
    this.attachArrows(campo, campo.id, ehBarra ? 1 : field.step,
      () => (ehBarra ? sliderFromAlpha(atual) : atual),
      (valor) => gravar(ehBarra ? alphaFromSlider(valor) : valor),
      ehBarra ? (valor) => String(Math.round(valor)) : formatQuick);
    caixa.append(campo);
    // Rodada 43, lote 1: a unidade ao lado do número (régua do doc `26`).
    const unidade = el('span', 'ficha-unidade', field.unit);
    unidade.title = field.hint;
    caixa.append(unidade);

    if (field.control === 'barra') {
      const barra = document.createElement('input');
      barra.type = 'range';
      barra.className = 'ficha-barra';
      barra.dataset.foco = `ficha-barra-${field.key}`;
      barra.min = '0';
      barra.max = '100';
      barra.step = '1';
      barra.value = String(sliderFromAlpha(atual));
      barra.title = field.hint;
      barra.setAttribute('aria-label', field.hint);
      barra.addEventListener('input', () => {
        campo.value = barra.value;
        gravar(alphaFromSlider(Number(barra.value)));
      });
      caixa.append(barra);
    }

    if (field.control === 'disco') {
      // Rodada 43, lote 1: o disco também diz o que é (não tinha dica).
      const disco = this.buildDial(atual, campo, gravar);
      const dica = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      dica.textContent = field.hint;
      disco.prepend(dica);
      disco.setAttribute('aria-label', field.hint);
      caixa.append(disco);
      // Rodada 43, lote 2 (S2): o giro no MUNDO, só para ler, ao lado.
      const mundo = worldAngleOfField(doc, field);
      if (mundo !== null && Math.abs(mundo - atual) > 0.005) {
        const frase = `Giro no mundo: ${formatQuick(mundo)}° (o deste osso somado ao dos pais). `
          + 'Só para ler: o campo grava o giro local, em relação ao pai';
        // Rodada 43, lote 3 (doc 59): com a "base" ao lado (animação aberta), não
        // cabem os dois na coluna — o mundo vai para a dica do disco.
        if (leitura.animated && Math.abs(leitura.frame - leitura.base) > 1e-9) {
          dica.textContent = `${field.hint}. ${frase}`;
          disco.setAttribute('aria-label', dica.textContent);
        } else {
          const m = el('span', 'ficha-mundo', `mundo ${Math.round(mundo)}°`); // inteiro: a coluna é estreita
          m.title = frase;
          caixa.append(m);
        }
      }
    }
    if (leitura.animated && Math.abs(leitura.frame - leitura.base) > 1e-9) {
      const base = el('span', 'ficha-base', `base ${field.control === 'barra'
        ? String(sliderFromAlpha(leitura.base)) : formatQuick(leitura.base)}`);
      base.title = 'O valor na base (montar). O número do campo é o deste quadro da animação';
      caixa.append(base);
    }
    return [nome, caixa];
  }

  /**
   * O **disco** do ângulo: um `<svg>` de 48px com uma agulha.
   *
   * Arrastar grava pelo MESMO caminho do campo de número — mesma `Command`,
   * mesmo passo de desfazer, mesma chave em Animando. Dois caminhos para o
   * mesmo número se separam com o tempo.
   */
  private buildDial(
    atual: number, campo: HTMLInputElement, gravar: (valor: number) => void,
  ): HTMLElement {
    // 13 de raio (15 até a prova de altura de 13/09/2026): a linha do ângulo
    // tem que ter a altura das outras, senão a ficha ganha um degrau no meio.
    const R = 13;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ficha-disco');
    svg.setAttribute('viewBox', '-16 -16 32 32');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.setAttribute('role', 'slider');
    svg.setAttribute('aria-label', 'Ângulo: arraste para girar');
    svg.setAttribute('tabindex', '0');

    const aro = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    aro.setAttribute('r', String(R));
    aro.setAttribute('class', 'ficha-disco-aro');
    const agulha = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    agulha.setAttribute('class', 'ficha-disco-agulha');
    svg.append(aro, agulha);

    const apontar = (graus: number): void => {
      // O SVG cresce para BAIXO e o formato para cima (§3): o `y` da agulha
      // leva o sinal trocado, e só aqui.
      const ponta = dialPoint(graus, R - 2);
      agulha.setAttribute('x1', '0');
      agulha.setAttribute('y1', '0');
      agulha.setAttribute('x2', String(ponta.x));
      agulha.setAttribute('y2', String(-ponta.y));
      svg.setAttribute('aria-valuenow', String(Math.round(graus)));
    };
    apontar(atual);

    let arrastando = false;
    const doPonteiro = (event: PointerEvent): number => {
      const box = svg.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      // De novo o sinal do Y: a tela cresce para baixo.
      return angleFromDial(0, 0, event.clientX - cx, cy - event.clientY);
    };
    svg.addEventListener('pointerdown', (event) => {
      arrastando = true;
      try { svg.setPointerCapture(event.pointerId); } catch { /* sintético */ }
      const graus = doPonteiro(event);
      apontar(graus);
      campo.value = formatQuick(graus);
      gravar(graus);
      event.preventDefault();
    });
    svg.addEventListener('pointermove', (event) => {
      if (!arrastando) return;
      const graus = doPonteiro(event);
      apontar(graus);
      campo.value = formatQuick(graus);
      gravar(graus);
    });
    const soltar = (): void => {
      if (!arrastando) return;
      arrastando = false;
      // Fecha o arrasto: o próximo vira o seu próprio passo de desfazer.
      this.doc?.endMerge?.();
    };
    svg.addEventListener('pointerup', soltar);
    svg.addEventListener('pointercancel', soltar);
    return svg as unknown as HTMLElement;
  }

  /** Grava um campo da ficha pelo mesmo caminho do painel de baixo. */
  private writeQuick(doc: EditorDoc, field: QuickField, valor: number): void {
    // A decisão mora no modelo (`writeQuickValue`): lá o alfa com animação
    // aberta vira chave da cor inteira — K8.
    if (writeQuickValue(doc, field, valor) === 'recusado') { doc.notice(REFUSED_MESSAGE); return; }
    // J9: gravou, e uma regra desfez na tela? O rodapé diz qual.
    const preso = heldByRuleAfterWrite(doc, field.pointer);
    if (preso !== null) doc.notice(preso);
  }

  private renderCompensation(): HTMLElement | null {
    this.compensationBoxes.clear();
    // P6, defeito D1: só com OSSO escolhido. Com um parâmetro, um emissor ou um
    // evento na mão, o bloco empurrava a ficha de verdade para fora da vista.
    if (this.doc === null || !compensationApplies(getActiveToolId(), this.doc.selection)) return null;

    const box = el('fieldset', 'prop-grupo prop-compensar');
    box.append(el('legend', 'prop-grupo-titulo', 'Compensar'));
    const flags = getCompensation();
    for (const entry of COMPENSATION_LABELS) {
      const row = el('label', 'prop-linha prop-caixa-linha');
      row.title = entry.hint;
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'prop-marca';
      // Rodada 43, lote 3 (doc 58): a dica também na caixa, não só na linha.
      check.title = entry.hint;
      check.checked = flags[entry.id];
      check.addEventListener('change', () => {
        setCompensation({ [entry.id]: check.checked } as Partial<CompensationFlags>);
      });
      row.append(check, el('span', 'prop-rotulo-caixa', entry.label));
      box.append(row);
      this.compensationBoxes.set(entry.id, check);
    }
    // Rodada 47, lote 6c (nota 5 do doc 90): Compensar também dobra. Nasce
    // aberto só quando alguma caixa está ligada — uma caixa ligada escondida
    // mudaria o arrasto sem ninguém ver.
    const ligadas = Object.values(flags).filter(Boolean).length;
    this.dobrarGrupo(box, 'Compensar', gruposDaMao.get('Compensar') ?? ligadas > 0);
    return box;
  }

  /**
   * "Usar a silhueta de…" — item 48, só para uma máscara.
   *
   * Recortar pelo contorno de um desenho à mão é mover vinte vértices com o
   * olho; aqui o contorno vem do traçado que a ferramenta Malha já usa
   * (`traceHullFromImage`), e vira o polígono da máscara num comando só.
   *
   * O contorno sai no espaço da IMAGEM daquele anexo. Ele é copiado como está:
   * a máscara passa a ter a forma do desenho, e ajustar posição é arrastar os
   * vértices com a Malha, como em qualquer polígono.
   */
  private renderSilhouette(): HTMLElement | null {
    const doc = this.doc;
    if (doc === null) return null;
    const picked = doc.selection.attachments[0];
    if (picked === undefined || doc.selection.attachments.length !== 1) return null;
    const found = findAttachment(corpoDe(doc).file, picked.slot, picked.attachment);
    if (found === null || found.def.type !== 'clipping') return null;

    const fontes = silhouetteSources(corpoDe(doc).file, doc.visibleSkins);
    const box = el('fieldset', 'prop-grupo');
    box.append(el('legend', 'prop-grupo-titulo', 'Usar a silhueta de…'));
    if (fontes.length === 0) {
      box.append(el('p', 'painel-aviso', 'Não há desenho com imagem para copiar.'));
      return box;
    }

    const pick = el('select', 'prop-selecao') as HTMLSelectElement;
    for (const fonte of fontes) {
      const option = el('option', undefined, fonte.label);
      option.value = fonte.value;
      pick.append(option);
    }
    const row = el('div', 'prop-linha');
    row.append(el('label', 'prop-rotulo', 'Desenho'), pick);
    box.append(row);

    const run = button('Copiar a silhueta', () => {
      const [slot, attachment] = pick.value.split('/');
      this.copySilhouette(doc, picked, slot, attachment);
    });
    run.title = 'Põe o contorno daquele desenho como o polígono desta máscara';
    box.append(run);
    return box;
  }

  private copySilhouette(
    doc: EditorDoc,
    mask: { slot: string; attachment: string },
    slot: string,
    attachment: string,
  ): void {
    const source = findAttachment(corpoDe(doc).file, slot, attachment);
    const target = findAttachment(corpoDe(doc).file, mask.slot, mask.attachment);
    if (source === null || target === null) return;
    const def = source.def as { path?: string; width?: number; height?: number };
    const image = originalImageOf(doc, def.path ?? attachment);
    if (typeof image === 'string') {
      this.say(`Não deu para traçar: ${image}.`);
      return;
    }
    let vertices: number[];
    try {
      const geo = traceHullFromImage(image.image, {
        width: def.width !== undefined && def.width > 0 ? def.width : image.width,
        height: def.height !== undefined && def.height > 0 ? def.height : image.height,
        x: 0,
        y: 0,
      });
      vertices = [...geo.vertices];
    } catch (error) {
      this.say(`Não deu para traçar: ${(error as Error).message}.`);
      return;
    }
    // §7.7 pede pelo menos três vértices, e um polígono que não fecha não
    // recorta nada: recusar é melhor do que gravar uma máscara quebrada.
    if (vertices.length < 6) {
      this.say('O contorno saiu com menos de três cantos. A máscara não mudou.');
      return;
    }
    corpoDe(doc).run(new SetProperty(
      pointerOf('skins', target.skin, 'attachments', mask.slot, mask.attachment, 'vertices'),
      vertices,
      { label: 'Silhueta para a máscara', kind: 'structure', mergeable: false },
    ));
    this.say(`A máscara ficou com ${vertices.length >> 1} cantos.`);
  }

  /**
   * Os grupos do painel, prontos para o corpo — prova de altura, 13/09/2026.
   *
   * Um grupo de **um campo só** (o mais comum: "Cor") não ganha moldura
   * própria — ela custa a mesma borda, o mesmo respiro e a mesma legenda de
   * um grupo de cinco campos. Ele entra como mais uma linha dentro do grupo
   * anterior; a linha já diz "Cor" no próprio rótulo, então nada se perde.
   * O primeiro grupo nunca funde: não há "anterior" para receber.
   */
  private renderGroups(groups: readonly FieldGroup[]): HTMLElement[] {
    const out: HTMLElement[] = [];
    let last: HTMLElement | null = null;
    // Rodada 47, lote 6c (nota 5 do doc 90): os grupos dobram no título; abre o do nome.
    const juntos = groups.filter((g, i) => !(g.fields.length === 1 && i > 0));
    const abertos = groupsOpen(juntos, gruposDaMao);
    let k = 0;
    for (const group of groups) {
      if (group.fields.length === 1 && last !== null) {
        last.append(this.renderField(group.fields[0]!));
        continue;
      }
      const box = this.renderGroup(group);
      if (juntos.length > 2) this.dobrarGrupo(box, group.title, abertos[k] ?? true);
      k += 1;
      out.push(box);
      last = box;
    }
    return out;
  }

  /** O título do grupo vira o botão da dobra — Rodada 47, lote 6c (nota 5 do doc 90). */
  private dobrarGrupo(box: HTMLElement, titulo: string, aberto: boolean): void {
    const legenda = box.querySelector(':scope > .prop-grupo-titulo') as HTMLElement | null;
    if (legenda === null) return;
    box.classList.add('prop-grupo-dobra');
    box.classList.toggle('is-dobrado', !aberto);
    legenda.setAttribute('role', 'button');
    legenda.tabIndex = 0;
    legenda.setAttribute('aria-expanded', String(aberto));
    legenda.title = `${aberto ? 'Dobrar' : 'Abrir'}: ${titulo}`;
    const virar = (event: Event): void => {
      if ((event.target as HTMLElement | null)?.closest('button') !== null) return;
      gruposDaMao.set(titulo, !aberto);
      this.render();
    };
    legenda.addEventListener('click', virar);
    legenda.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      virar(event);
    });
  }

  private renderGroup(group: FieldGroup): HTMLElement {
    const box = el('fieldset', 'prop-grupo');
    const titulo = el('legend', 'prop-grupo-titulo', group.title);
    // Degrau 12, porta D3: os botões em ícone do grupo — "mais um alvo",
    // "tira este". Um array do formato precisa deles; um campo só escreve um
    // valor num ponteiro e não sabe criar nem apagar item de lista.
    for (const action of group.actions ?? []) {
      titulo.append(iconButton(action.icon, action.hint, () => {
        const doc = this.doc;
        if (doc === null) return;
        const command = action.command(doc);
        if (command === null) {
          doc.notice('Não há o que fazer aqui: falta um osso no esqueleto');
          return;
        }
        doc.run(command);
        this.render();
      }));
    }
    box.append(titulo);
    const fields = group.fields;
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]!;
      const next = fields[i + 1];
      // Largura e altura são uma ideia só, o tamanho da imagem: cabem numa
      // linha em vez de duas — prova de altura, 13/09/2026.
      if (field.key === 'width' && next?.key === 'height') {
        box.append(this.renderPairedRow(field, next));
        i += 1;
        continue;
      }
      box.append(this.renderField(field));
    }
    // Regra 21: o que o grupo não sabe fazer, ele DIZ. Um alvo sem chave, uma
    // regra Comando que o runtime ignora, um parâmetro de faixa impossível —
    // tudo isso é verde silencioso enquanto não estiver escrito na tela.
    if (group.problem !== undefined) {
      box.append(el('p', 'prop-grupo-erro', group.problem));
    }
    return box;
  }

  /**
   * A ficha do emissor em abas — rodada 16, lote 1 (`particle-sheet.ts` decide
   * o que vai em cada aba). Uma barra de ícones, cada um com o nome na dica, e
   * o nome da aba aberta escrito ao lado: o ícone sozinho seria adivinhação.
   * A aba aberta é estado só da tela, e fica a mesma de um emissor para outro.
   */
  private renderTabs(tabs: readonly SheetTab[]): HTMLElement {
    const box = el('div', 'prop-abas');
    const aberta = tabs.find((t) => t.id === abaDoEmissor) ?? tabs[0]!;
    const barra = el('div', 'prop-abas-barra');
    barra.setAttribute('role', 'tablist');
    for (const tab of tabs) {
      const botao = iconButton(tab.icon, tab.name, () => {
        abaDoEmissor = tab.id;
        this.render();
      });
      botao.classList.add('prop-aba');
      botao.setAttribute('role', 'tab');
      botao.dataset.aba = tab.id;
      const ativa = tab === aberta;
      botao.classList.toggle('ativo', ativa);
      botao.setAttribute('aria-selected', String(ativa));
      // O aceso de todo botão de painel (`panels.css`) vem do `aria-pressed`.
      botao.setAttribute('aria-pressed', String(ativa));
      barra.append(botao);
    }
    // O nome da aba aberta vai no título do painel, NA FRENTE ("Forma ·
    // Emissor: fogo"): ao lado dos ícones ele quebrava a barra em duas linhas,
    // e no fim do título quebrava o título (medido em 05/10/2026, 1280×720).
    // O título não quebra: o que não cabe é o fim do nome do emissor, e o
    // título inteiro fica na dica.
    if (this.titleNode) {
      const inteiro = `${aberta.name} · ${this.titleNode.textContent ?? ''}`;
      this.titleNode.textContent = inteiro;
      this.titleNode.title = inteiro;
      this.titleNode.classList.add('prop-titulo-aba');
    }
    const corpo = el('fieldset', 'prop-grupo prop-aba-corpo');
    corpo.setAttribute('role', 'tabpanel');
    corpo.dataset.aba = aberta.id;
    if (aberta.quick === true) {
      const rapida = this.renderQuick();
      if (rapida !== null) {
        rapida.classList.add('ficha-na-aba');
        corpo.append(rapida);
      } else {
        for (const row of aberta.quickFallback ?? []) corpo.append(this.renderSheetRow(row));
      }
    }
    for (const row of aberta.rows) corpo.append(this.renderSheetRow(row));
    box.append(barra, corpo);
    return box;
  }

  /** Uma linha da ficha em abas: um campo com o rótulo da linha, ou dois lado a lado. */
  private renderSheetRow(row: SheetRow): HTMLElement {
    if (row.shapes !== undefined) return this.renderShapePicker(row.shapes.base, row.shapes.buttons, row.shapes.exit);
    const linha = row.fields.length >= 2
      ? this.renderRangeRow(row.label, ...row.fields)
      : this.renderField({ ...row.fields[0]!, label: row.label });
    if (row.problem !== undefined) {
      linha.classList.add('prop-linha-problema');
      linha.title = row.problem;
    }
    return linha;
  }

  /**
   * O seletor de forma — rodada 16, lote 2. Uma fileira de nove botões, cada um
   * com o desenho da forma e o nome na dica; o da forma de agora fica aceso. O
   * cinza diz por quê na dica, e o clique nele avisa em vez de calar.
   */
  private renderShapePicker(base: string, buttons: readonly ShapeButton[], exit?: string): HTMLElement {
    const caixa = el('div', 'prop-formas-caixa');
    const fila = el('div', 'prop-formas');
    fila.setAttribute('role', 'radiogroup');
    fila.setAttribute('aria-label', 'Forma');
    for (const button of buttons) {
      const botao = iconButton(button.icon, button.disabled ?? button.name, () => {
        const doc = this.doc;
        if (doc === null) return;
        if (button.disabled !== undefined) {
          doc.notice(button.disabled);
          return;
        }
        if (button.active) return;
        doc.run(new ChooseShape(base, button));
        this.render();
      });
      botao.classList.add('prop-forma');
      botao.dataset.forma = button.id;
      botao.setAttribute('role', 'radio');
      botao.setAttribute('aria-checked', String(button.active));
      botao.setAttribute('aria-pressed', String(button.active));
      if (button.disabled !== undefined) botao.setAttribute('aria-disabled', 'true');
      fila.append(botao);
    }
    // Lote 4, pedido do Diretor: o NOME da forma escrito embaixo dos botões. O
    // desenho ajuda; o nome confirma — o Humberto é disléxico.
    // Rodada 38, lote 4: e para onde as partículas SAEM (`shapeExitLine`).
    // A linha que se vê é curta e cabe inteira; a frase longa vai na dica.
    const nome = el('div', 'prop-forma-nome', exit === undefined ? shapeNameLine(buttons) : shapeSummaryLine(buttons, exit));
    nome.title = exit === undefined ? shapeNameLine(buttons) : shapeExitTitle(shapeNameLine(buttons), exit);
    caixa.append(fila, nome);
    return caixa;
  }

  // -------------------------------------------------------------------------
  // Rodada 16, lote 4: a curva ao longo da vida e o gradiente
  // -------------------------------------------------------------------------

  /**
   * **A curva ao longo da vida** (`scaleOverLifetime`, `alphaOverLifetime`).
   * Da esquerda (o nascimento) à direita (a morte); para cima, mais. Clique
   * põe um ponto, arrastar o move, botão direito o tira; ▾ traz as prontas. A
   * linha é desenhada pela conta do runtime (`sampleLife`). Grava **ao soltar**:
   * o arrasto inteiro é um passo no desfazer.
   */
  private renderLifeCurve(field: FieldDef, id: string): HTMLElement {
    const NS = 'http://www.w3.org/2000/svg';
    const caixa = el('div', 'prop-curva');
    caixa.id = id;
    const nome = field.hint ?? field.label;
    // Segunda conferência, defeito 6: a curva diz como se mexe, como o gradiente.
    // O `<title>` mora DENTRO do SVG: o título da caixa de fora não aparece
    // sobre um desenho SVG no Chrome.
    const comoSeMexe = `${nome}: clique põe um ponto, arraste para mover, botão direito tira o ponto; ▾ traz curvas prontas`;
    caixa.title = comoSeMexe;
    let keys = readLifeKeys(this.value(field));
    const faixa = lifeRange(field.key, keys);
    const W = 200;
    const H = 44;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', nome);
    svg.classList.add('prop-curva-svg');
    const yDe = (v: number): number => H - 3 - ((v - faixa[0]) / (faixa[1] - faixa[0])) * (H - 6);
    const desenhar = (): void => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const dica = document.createElementNS(NS, 'title');
      dica.textContent = comoSeMexe;
      svg.append(dica);
      // A linha do 1 (o tamanho e a transparência de quem não tem curva).
      const um = document.createElementNS(NS, 'line');
      um.setAttribute('x1', '0'); um.setAttribute('x2', String(W));
      um.setAttribute('y1', String(yDe(1))); um.setAttribute('y2', String(yDe(1)));
      um.setAttribute('class', 'prop-curva-um');
      svg.append(um);
      const pts: string[] = [];
      for (let i = 0; i <= 50; i++) pts.push(`${(i / 50) * W},${yDe(sampleLife(keys, i / 50))}`);
      const linha = document.createElementNS(NS, 'polyline');
      linha.setAttribute('points', pts.join(' '));
      linha.setAttribute('class', 'prop-curva-linha');
      svg.append(linha);
      for (const k of keys) {
        const ponto = document.createElementNS(NS, 'rect');
        ponto.setAttribute('x', String(k.time * W - 3)); ponto.setAttribute('y', String(yDe(k.value) - 3));
        ponto.setAttribute('width', '6'); ponto.setAttribute('height', '6');
        ponto.setAttribute('class', 'prop-curva-ponto');
        svg.append(ponto);
      }
    };
    desenhar();
    const doMouse = (e: PointerEvent | MouseEvent): { t: number; v: number } => {
      const r = svg.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (e.clientX - r.left) / Math.max(1, r.width)));
      const alto = (e.clientY - r.top) / Math.max(1, r.height);
      const v = faixa[0] + ((H - 3 - alto * H) / (H - 6)) * (faixa[1] - faixa[0]);
      return { t, v };
    };
    const pontoDebaixo = (e: PointerEvent | MouseEvent): number => {
      const r = svg.getBoundingClientRect();
      return keys.findIndex((k) => Math.abs(r.left + k.time * r.width - e.clientX) <= 7
        && Math.abs(r.top + (yDe(k.value) / H) * r.height - e.clientY) <= 7);
    };
    let ativo = -1;
    svg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const m = doMouse(e);
      ativo = pontoDebaixo(e);
      if (ativo < 0) {
        keys = addLifeKey(keys, m.t, m.v, 1);
        ativo = keys.findIndex((k) => Math.abs(k.time - Math.round(m.t * 1000) / 1000) < 0.0005);
      }
      try { svg.setPointerCapture(e.pointerId); } catch { /* sintético */ }
      desenhar();
      e.preventDefault();
    });
    svg.addEventListener('pointermove', (e) => {
      if (ativo < 0) return;
      const m = doMouse(e);
      keys = moveLifeKey(keys, ativo, m.t, m.v, faixa);
      desenhar();
    });
    const soltar = (): void => {
      if (ativo < 0) return;
      ativo = -1;
      this.write(field, keys);
    };
    svg.addEventListener('pointerup', soltar);
    svg.addEventListener('pointercancel', soltar);
    svg.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const i = pontoDebaixo(e);
      if (i < 0) return;
      const sem = removeLifeKey(keys, i);
      if (sem === null) {
        this.doc?.notice('As duas pontas da curva ficam: arraste-as para cima ou para baixo');
        return;
      }
      this.write(field, sem);
    });
    const prontas = el('button', 'painel-botao prop-curva-prontas', '▾') as HTMLButtonElement;
    prontas.type = 'button';
    prontas.title = `${nome}: curvas prontas`;
    prontas.setAttribute('aria-label', `${nome}: curvas prontas`);
    prontas.addEventListener('click', () => {
      const box = prontas.getBoundingClientRect();
      openFloatingMenu(box.left, box.bottom + 2, (LIFE_PRESETS[field.key] ?? []).map((pronta) => ({
        label: pronta.name,
        hint: `${nome}: ${pronta.name}`,
        run: () => this.write(field, pronta.keys.map((k) => ({ ...k }))),
      })));
    });
    caixa.append(svg as unknown as HTMLElement, prontas);
    return caixa;
  }

  /**
   * **O gradiente da cor ao longo da vida** (`colorOverLifetime`). A faixa é
   * a cor que a partícula tem do nascimento (esquerda) à morte (direita),
   * pela conta do runtime. Clique na faixa põe uma cor (a que já estava ali);
   * arrastar um losango o move; duplo clique troca a cor; botão direito tira.
   */
  private renderGradient(field: FieldDef, id: string): HTMLElement {
    const caixa = el('div', 'prop-gradiente');
    caixa.id = id;
    const nome = field.hint ?? field.label;
    caixa.title = `${nome}. Clique põe uma cor, arraste para mover, duplo clique troca a cor, botão direito tira`;
    let keys = readColorKeys(this.value(field));
    // Rodada 48 (a mão do Humberto): a Cor ao nascer multiplica esta (§9.7), e
    // a barra mostra a cor que se vê nas duas faixas finas de baixo.
    const inicio = readStartColors(this.value({
      ...field, pointer: field.pointer.replace(/colorOverLifetime$/, 'startColor'), fallback: undefined,
    }));
    const faixa = el('div', 'prop-gradiente-faixa');
    faixa.setAttribute('role', 'img');
    faixa.setAttribute('aria-label', nome);
    const marcas: HTMLElement[] = [];
    // Rodada 38, lote 5 (doc 35): sem cor nenhuma, a barra diz o que vale.
    const vazia = el('span', 'prop-gradiente-vazia', EMPTY_GRADIENT_SHORT);
    vazia.title = emptyGradientSays();
    faixa.append(vazia);
    const pintar = (): void => {
      vazia.hidden = keys.length > 0;
      faixa.style.background = gradientBandsCss(inicio, keys, RECUO_DO_LOSANGO);
      keys.forEach((k, i) => {
        const marca = marcas[i];
        if (marca === undefined) return;
        // Recuado 9 px de cada lado: o losango girado tem ~17 px de diagonal, e
        // na ponta direita ele passava da coluna (medido em 05/10, 17h11).
        marca.style.left = `calc(${RECUO_DO_LOSANGO}px + ${k.time} * (100% - ${2 * RECUO_DO_LOSANGO}px))`;
        marca.style.background = toHex(k.value);
      });
    };
    keys.forEach((k, i) => {
      const marca = el('div', 'prop-gradiente-marca');
      marca.title = `Cor em ${Math.round(k.time * 100)}% da vida: arraste, duplo clique troca, botão direito tira`;
      marca.dataset.i = String(i);
      marcas.push(marca);
      faixa.append(marca);
    });
    pintar();
    const tempoDe = (e: PointerEvent): number => {
      const r = faixa.getBoundingClientRect();
      const util = Math.max(1, r.width - 2 * RECUO_DO_LOSANGO);
      return Math.min(1, Math.max(0, (e.clientX - r.left - RECUO_DO_LOSANGO) / util));
    };
    let ativo = -1;
    faixa.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const alvo = (e.target as HTMLElement).dataset?.i;
      if (alvo === undefined) {
        this.write(field, addColorKey(keys, tempoDe(e)));
        return;
      }
      ativo = Number(alvo);
      try { faixa.setPointerCapture(e.pointerId); } catch { /* sintético */ }
      e.preventDefault();
    });
    faixa.addEventListener('pointermove', (e) => {
      if (ativo < 0) return;
      keys = moveColorKey(keys, ativo, tempoDe(e));
      pintar();
    });
    const soltar = (): void => {
      if (ativo < 0) return;
      ativo = -1;
      this.write(field, keys);
    };
    faixa.addEventListener('pointerup', soltar);
    faixa.addEventListener('pointercancel', soltar);
    const seletor = el('input') as HTMLInputElement;
    seletor.type = 'color';
    seletor.className = 'prop-gradiente-seletor';
    seletor.tabIndex = -1;
    seletor.setAttribute('aria-label', `${nome}: escolher a cor`);
    let editando = -1;
    seletor.addEventListener('change', () => {
      if (editando < 0) return;
      this.write(field, setColorKey(keys, editando, fromHex(seletor.value)));
    });
    faixa.addEventListener('dblclick', (e) => {
      const alvo = (e.target as HTMLElement).dataset?.i;
      if (alvo === undefined) return;
      editando = Number(alvo);
      seletor.value = toHex(keys[editando]!.value);
      seletor.click();
    });
    faixa.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const alvo = (e.target as HTMLElement).dataset?.i;
      if (alvo === undefined) return;
      const sem = removeLifeKey(keys, Number(alvo));
      if (sem === null) {
        this.doc?.notice('As duas pontas do gradiente ficam: troque a cor delas com duplo clique');
        return;
      }
      this.write(field, sem);
    });
    caixa.append(faixa, seletor);
    return caixa;
  }

  // -------------------------------------------------------------------------
  // Rodada 16, lote 5: as rajadas
  // -------------------------------------------------------------------------

  /**
   * **As rajadas**: uma linha na ficha (*"2 rajadas · 34 partículas ▾"*) que
   * abre a lista numa janelinha por cima — a lista inteira não cabe numa aba
   * de cinco linhas, e rolar a ficha está fora (rolar só palco e lista).
   */
  private renderBursts(field: FieldDef, id: string): HTMLElement {
    const lista = readBursts(this.value(field));
    const botao = el('button', 'painel-botao prop-rajadas', `${burstsLine(lista)} ▾`) as HTMLButtonElement;
    botao.type = 'button';
    botao.id = id;
    botao.title = 'Rajadas: abrir a lista — quando, quantas, quantas vezes, a cada quanto, a chance';
    botao.addEventListener('click', () => this.openBursts(field, botao.getBoundingClientRect()));
    return botao;
  }

  /** A janelinha das rajadas. Fica aberta enquanto se mexe nela; Esc ou clique fora fecham. */
  private openBursts(field: FieldDef, ancora: DOMRect): void {
    fecharRajadas();
    const janela = el('div', 'prop-rajadas-janela');
    janela.setAttribute('role', 'dialog');
    janela.setAttribute('aria-label', 'Rajadas');
    janela.style.left = `${Math.round(ancora.left)}px`;
    janela.style.top = `${Math.round(ancora.bottom + 2)}px`;
    const montar = (): void => {
      clear(janela);
      const lista = readBursts(this.value(field));
      const topo = el('div', 'prop-rajadas-topo');
      topo.append(el('strong', '', 'Rajadas'));
      topo.append(iconButton('plus', 'Mais uma rajada', () => { this.write(field, addBurst(lista)); montar(); }));
      topo.append(iconButton('close', 'Fechar (Esc)', fecharRajadas));
      janela.append(topo);
      if (lista.length === 0) {
        janela.append(el('p', 'prop-rajadas-vazio', 'Nenhuma rajada. O + põe uma: várias partículas de uma vez.'));
        return;
      }
      const grade = el('div', 'prop-rajadas-grade');
      for (const coluna of BURST_FIELDS) {
        const cab = el('span', 'prop-rajadas-cab', coluna.label);
        cab.title = coluna.hint;
        grade.append(cab);
      }
      grade.append(el('span', 'prop-rajadas-cab', ''));
      lista.forEach((rajada, i) => {
        for (const coluna of BURST_FIELDS) {
          const campo = el('input', 'prop-rajadas-campo') as HTMLInputElement;
          campo.type = 'number';
          campo.step = String(coluna.step);
          campo.value = String(rajada[coluna.field]);
          campo.title = `${coluna.hint} — rajada ${i + 1}: ${burstSummary(rajada)}`;
          campo.setAttribute('aria-label', `${coluna.label}, rajada ${i + 1}`);
          campo.addEventListener('change', () => {
            this.write(field, setBurstField(readBursts(this.value(field)), i, coluna.field, Number(campo.value)));
            montar();
          });
          grade.append(campo);
        }
        grade.append(iconButton('trash', `Tirar a rajada ${i + 1}`, () => {
          this.write(field, removeBurst(readBursts(this.value(field)), i));
          montar();
        }));
      });
      janela.append(grade);
    };
    montar();
    document.body.append(janela);
    janelaRajadas = janela;
    // Segunda conferência, defeito 1: a janela abria por baixo da linha do
    // tempo e passava da tela. Agora fica INTEIRA dentro da tela: se não cabe
    // embaixo do botão, abre em cima; se passa da direita, encosta nela.
    const lugar = burstWindowPlace(ancora, janela.getBoundingClientRect(), window.innerWidth, window.innerHeight);
    janela.style.left = `${lugar.left}px`;
    janela.style.top = `${lugar.top}px`;
    // Esc fecha, de onde estiver o foco, e a tecla para aqui (regra 12).
    document.addEventListener('keydown', escDaJanela, true);
    setTimeout(() => document.addEventListener('pointerdown', foraDaJanela, true), 0);
  }

  /** Uma faixa `[min, max]` (ou um par X·Y) numa linha só: um rótulo, dois campos. */
  private renderRangeRow(label: string, ...campos: FieldDef[]): HTMLElement {
    const row = el('div', 'prop-linha prop-linha-faixa');
    const rotulo = el('label', 'prop-rotulo', label);
    rotulo.htmlFor = `prop-${campos[0]!.key}`;
    const dupla = el('div', 'prop-faixa');
    // Lote 9: a folha de quadros põe TRÊS números numa linha (quadros,
    // primeiro, dígitos). A grade tem tantas colunas quantos campos.
    if (campos.length !== 2) dupla.style.gridTemplateColumns = `repeat(${campos.length}, minmax(0, 1fr))`;
    // Rodada 17 (sobra da rodada 32): com três, o rótulo fica em cima e os
    // três pares ganham a largura inteira. Ao lado do rótulo, o último nome
    // ("díg.") e o campo dele passavam da borda.
    if (campos.length > 2) row.classList.add('prop-linha-faixa-larga');
    const misturadas = new Set(campos.map((c) => c.unit)).size > 1;
    for (const campo of campos) {
      const crua = this.renderControl(campo, `prop-${campo.key}`);
      crua.title = campo.hint ?? campo.label;
      // Pontas de unidades diferentes (Explosão em %, Janela em s): cada uma a sua.
      const c = misturadas ? this.withUnit(campo, crua) : crua;
      c.title = campo.hint ?? campo.label;
      c.setAttribute('aria-label', campo.hint ?? campo.label);
      if (campo.short === undefined) {
        dupla.append(c);
        continue;
      }
      const par = el('label', 'prop-faixa-par');
      const nome = el('span', 'prop-faixa-nome', campo.short);
      nome.title = campo.hint ?? campo.label;
      par.append(nome, c);
      dupla.append(par);
    }
    // Rodada 47, lote 2 (R2): a unidade depois das caixas — uma vez, quando as
    // pontas têm a mesma ("de 1,8 a 2,6 s"); ao lado de cada uma, quando não.
    const unidades = new Set(campos.map((c) => c.unit));
    const unica = unidades.size === 1 ? campos[0]!.unit : undefined;
    if (unica !== undefined) {
      const unidade = el('span', 'prop-unidade', unica);
      unidade.title = campos[0]!.hint ?? campos[0]!.label;
      row.append(rotulo, dupla, unidade);
      row.classList.add('prop-linha-faixa-unidade');
      return row;
    }
    row.append(rotulo, dupla);
    return row;
  }

  /** Duas linhas de sempre, lado a lado — só para pares curtos como largura/altura. */
  private renderPairedRow(a: FieldDef, b: FieldDef): HTMLElement {
    const row = el('div', 'prop-linha prop-linha-par');
    const idA = `prop-${a.key}`;
    const idB = `prop-${b.key}`;
    const labelA = el('label', 'prop-rotulo', a.label);
    labelA.htmlFor = idA;
    const labelB = el('label', 'prop-rotulo', b.label);
    labelB.htmlFor = idB;
    // Rodada 43, lote 1: o par também diz a unidade e a dica (Largura, Altura).
    if (a.hint !== undefined) labelA.title = a.hint;
    if (b.hint !== undefined) labelB.title = b.hint;
    row.append(labelA, this.withUnit(a, this.renderControl(a, idA)),
      labelB, this.withUnit(b, this.renderControl(b, idB)));
    return row;
  }

  /**
   * O controle com a unidade ao lado, quando o campo tem uma — rodada 43, lote
   * 1 (régua do doc `26`: nenhum número solto). A dica vai no controle e na unidade.
   */
  private withUnit(field: FieldDef, controle: HTMLElement): HTMLElement {
    if (field.hint !== undefined && controle.title === '') controle.title = field.hint;
    if (field.unit === undefined) return controle;
    const junto = el('div', 'prop-com-unidade');
    const unidade = el('span', 'prop-unidade', field.unit);
    if (field.hint !== undefined) unidade.title = field.hint;
    junto.append(controle, unidade);
    return junto;
  }

  private renderField(field: FieldDef): HTMLElement {
    const row = el('div', 'prop-linha');
    const id = `prop-${field.key}`;
    const label = el('label', 'prop-rotulo', field.label);
    label.htmlFor = id;
    // Rodada 43, lote 2: o rótulo de um número se arrasta. Rodada 47, lote 2
    // (régua R7 do doc 68): TODO número com ponteiro, com ou sem unidade, na
    // escala da tela.
    if (field.kind === 'number' && field.pointer !== '') {
      const escala = field.scale ?? 1;
      this.attachScrub(label, (field.step ?? 1) * escala, () => Number(this.value(field) ?? 0) * escala,
        (v) => this.write(field, prenderNaFaixa(v / escala, field)));
    }
    // Rodada 16: o rótulo curto da ficha em abas leva o inteiro na dica.
    if (field.hint !== undefined) row.title = field.hint;
    // Rodada 42 (doc 48): a dica também na CAIXA, não só na palavra (a Abertura).
    const controle = this.renderControl(field, id);
    if (field.hint !== undefined && controle.title === '') controle.title = field.hint;
    // Rodada 43, lote 1: o número com unidade leva a unidade ao lado (régua do doc `26`).
    row.append(label, this.withUnit(field, controle));
    if (field.key === 'attachment') {
      const thumb = this.renderThumb(String(this.value(field) ?? ''));
      if (thumb !== null) row.append(thumb);
    }
    return row;
  }

  private renderControl(field: FieldDef, id: string): HTMLElement {
    // Lote 60: o campo Imagem é a miniatura com o nome, e o clique abre a
    // lista da pasta. Sem um desenho só escolhido, fica o campo de texto.
    if (field.key === 'path' && this.doc !== null) {
      const alvo = targetOfSelection(this.doc);
      if (alvo !== null) {
        const botao = this.imageButton(this.doc, alvo, String(this.value(field) ?? ''));
        botao.id = id;
        return botao;
      }
    }
    // Rodada 16, lotes 4 e 5: a curva ao longo da vida, o gradiente, as rajadas.
    if (field.kind === 'lifeCurve') return this.renderLifeCurve(field, id);
    if (field.kind === 'lifeGradient') return this.renderGradient(field, id);
    if (field.kind === 'bursts') return this.renderBursts(field, id);
    if (field.kind === 'checklist') return this.renderChecklist(field, id);
    if (field.kind === 'checkbox') return this.renderCheckbox(field, id);
    if (field.kind === 'select') return this.renderSelect(field, id);
    if (field.kind === 'color' || field.kind === 'color3') return this.renderColor(field, id);
    if (field.kind === 'number') return this.renderNumber(field, id);
    return this.renderText(field, id);
  }

  // -------------------------------------------------------------------------
  // Controls
  // -------------------------------------------------------------------------

  /**
   * Uma lista de caixas cujo valor é um array de nomes.
   *
   * A máscara usa: "Só estes" são os slots que ela recorta, e a lista escrita
   * manda no campo "Recorta até" — §7.7. Nenhuma caixa marcada **tira** o campo
   * do arquivo em vez de gravar `[]`, porque um array vazio e a ausência
   * querem dizer coisas diferentes ali.
   */
  private renderChecklist(field: FieldDef, id: string): HTMLElement {
    const box = el('div', 'prop-checklist');
    box.id = id;
    const atual = new Set(
      Array.isArray(this.value(field)) ? (this.value(field) as string[]) : [],
    );
    for (const option of field.options ?? []) {
      const row = el('label', 'prop-checklist-linha');
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'prop-marca';
      check.checked = atual.has(option.value);
      check.addEventListener('change', () => {
        if (check.checked) atual.add(option.value);
        else atual.delete(option.value);
        // A ordem gravada é a das opções, e não a dos cliques: assim o arquivo
        // não muda quando ninguém mudou nada de verdade.
        const lista = (field.options ?? [])
          .map((o) => o.value)
          .filter((value) => atual.has(value));
        this.write(field, lista.length === 0 ? undefined : lista);
      });
      row.append(check, el('span', 'prop-rotulo-caixa', option.label));
      box.append(row);
    }
    if ((field.options ?? []).length === 0) {
      box.append(el('p', 'painel-aviso', field.skinMember !== undefined
        ? 'Só há a skin default. Crie outra na aba Skins.'
        : 'Não há slot para escolher.'));
    }
    return box;
  }

  /**
   * A miniatura do desenho escolhido, ao lado da lista "Anexo" — item 75.
   *
   * Ao LADO da lista, e não dentro dela: um `<select>` do navegador não carrega
   * imagem, e trocá-lo por uma lista feita à mão custaria o teclado que ele dá
   * de graça — as setas, o digitar para achar, o Esc. A lista da Árvore, essa
   * sim, mostra a miniatura de cada desenho.
   */
  private renderThumb(name: string): HTMLElement | null {
    const doc = this.doc;
    if (doc === null || name === '') return null;
    const url = thumbnailFor(doc, name);
    if (url === null) return null;
    const img = el('img', 'prop-mini') as HTMLImageElement;
    img.src = url;
    img.width = THUMB_SIZE;
    img.height = THUMB_SIZE;
    img.alt = '';
    img.title = name;
    return img;
  }

  private renderText(field: FieldDef, id: string): HTMLElement {
    const input = el('input', 'prop-campo');
    input.type = 'text';
    input.id = id;
    input.value = String(this.value(field) ?? '');
    input.addEventListener('change', () => {
      const text = input.value;
      if (field.renameOf !== undefined) {
        this.rename(field, text);
        return;
      }
      const empty = text.trim() === '' && !fieldIsSet(this.file(), field);
      this.write(field, empty ? undefined : text);
    });
    return input;
  }

  private renderCheckbox(field: FieldDef, id: string): HTMLElement {
    const input = el('input', 'prop-marca');
    input.type = 'checkbox';
    input.id = id;
    input.checked = this.value(field) === true;
    input.addEventListener('change', () => this.write(field, input.checked));
    return input;
  }

  private renderSelect(field: FieldDef, id: string): HTMLElement {
    const select = el('select', 'prop-selecao');
    select.id = id;
    const current = String(this.value(field) ?? '');
    let found = false;
    for (const option of field.options ?? []) {
      const node = el('option', undefined, option.label);
      node.value = option.value;
      if (option.value === current) { node.selected = true; found = true; }
      select.append(node);
    }
    if (!found && current !== '') {
      const node = el('option', undefined, current);
      node.value = current;
      node.selected = true;
      select.append(node);
    }
    select.addEventListener('change', () => {
      // "Nenhum" on a `dropWhenEmpty` field REMOVES the property instead of
      // writing an empty string the format does not define.
      const empty = select.value === '' && field.dropWhenEmpty === true;
      this.write(field, empty ? undefined : select.value);
    });
    return select;
  }

  private renderColor(field: FieldDef, id: string): HTMLElement {
    const box = el('div', 'prop-cor');
    const current = Array.isArray(this.value(field)) ? this.value(field) as number[] : [1, 1, 1, 1];

    const picker = el('input');
    picker.type = 'color';
    picker.id = id;
    picker.value = toHex(current);
    picker.setAttribute('aria-label', `${field.label}, escolher cor`);

    const commit = (): void => {
      const rgb = fromHex(picker.value);
      if (field.kind === 'color3') {
        this.write(field, rgb);
        return;
      }
      const alpha = Number(alphaInput.value) / 100;
      this.write(field, [rgb[0], rgb[1], rgb[2], alpha]);
    };

    const alphaInput = el('input');
    alphaInput.type = 'range';
    alphaInput.dataset.foco = `opacidade-${field.key}`;
    alphaInput.min = '0';
    alphaInput.max = '100';
    alphaInput.value = String(Math.round((current[3] ?? 1) * 100));
    // Rodada 38, lote 3 (doc 31): o número e a faixa, e não só "transparência".
    // Lote 4b (doc 33): e o número à vista, ao lado, que muda enquanto se arrasta.
    const alphaNumero = el('span', 'prop-alfa-numero');
    const dizAlfa = (): void => {
      const dica = alphaTip(field.label, Number(alphaInput.value));
      alphaInput.title = dica;
      alphaInput.setAttribute('aria-label', dica);
      alphaNumero.textContent = alphaShown(Number(alphaInput.value));
      alphaNumero.title = dica;
    };
    dizAlfa();
    alphaInput.addEventListener('input', dizAlfa);
    // Doc 37: na faixa de duas cores o número não cabe ao lado. Arrastando, o rodapé diz.
    alphaInput.addEventListener('input', () => this.doc?.notice(alphaDragSays(field.label, Number(alphaInput.value))));

    picker.addEventListener('change', commit);
    box.append(picker);
    if (field.kind === 'color') {
      alphaInput.addEventListener('change', commit);
      // Depois de gravar: o rodapé diz o número, e não só "Mudar…" (doc 37).
      alphaInput.addEventListener('change', () => this.doc?.notice(alphaDragSays(field.label, Number(alphaInput.value))));
      box.append(alphaInput, alphaNumero);
    }
    return box;
  }

  private renderNumber(field: FieldDef, id: string): HTMLElement {
    const input = el('input', 'prop-campo prop-numero');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.id = id;
    // Rodada 47, lote 2: o número na escala da TELA (0 a 100 %), gravado na do
    // arquivo (0 a 1). A conta, o arrasto e as setas andam na escala da tela.
    const escala = field.scale ?? 1;
    const ler = (): number => Number(this.value(field) ?? 0) * escala;
    // Rodada 47, lote 3 (notas do doc 84): o número fica na faixa do campo (a Força não passa de 100 %).
    const gravar = (v: number): void => this.write(field, prenderNaFaixa(v / escala, field));
    const start = ler();
    input.value = formatNumberField(Number.isFinite(start) ? start : 0);

    input.addEventListener('change', () => {
      // Rodada 43, lote 2: a conta sobre o valor de agora, e a recusa que fala.
      const agora = ler();
      const parsed = evalFieldInput(input.value, agora);
      if (parsed === null) {
        this.doc?.notice(notNumberSays(input.value, field.label, formatNumberField(agora), field.unit));
        input.value = formatNumberField(agora);
        return;
      }
      input.value = formatNumberField(parsed);
      gravar(parsed);
    });

    this.attachDrag(input, field, escala);
    this.attachArrows(input, id, (field.step ?? 1) * escala, ler, gravar, formatNumberField);
    return input;
  }

  /** Sideways drag on a numeric field, one `step` per pixel. */
  private attachDrag(input: HTMLInputElement, field: FieldDef, escala = 1): void {
    let anchorX = 0;
    let anchorValue = 0;
    let dragging = false;
    let armed = false;

    input.addEventListener('pointerdown', (event) => {
      armed = true;
      dragging = false;
      anchorX = event.clientX;
      anchorValue = evalNumberExpression(input.value) ?? 0;
    });

    input.addEventListener('pointermove', (event) => {
      if (!armed) return;
      const moved = event.clientX - anchorX;
      if (!dragging && Math.abs(moved) < 4) return;
      if (!dragging) {
        dragging = true;
        this.endMerge();
        this.arrastandoCampo = true;
        input.setPointerCapture(event.pointerId);
        input.blur();
      }
      const value = anchorValue + moved * (field.step ?? 1) * escala;
      const rounded = Math.round(value * 1000) / 1000;
      const preso = prenderNaFaixa(rounded / escala, field);
      input.value = formatNumberField(preso * escala);
      this.write(field, preso);
    });

    const stop = (event: PointerEvent): void => {
      if (dragging && input.hasPointerCapture(event.pointerId)) {
        input.releasePointerCapture(event.pointerId);
      }
      if (dragging) this.endMerge();
      this.arrastandoCampo = false;
      armed = false;
      dragging = false;
    };
    input.addEventListener('pointerup', stop);
    input.addEventListener('pointercancel', stop);
  }

  /**
   * `↑` e `↓` num campo de número — lote 48. Um `step` por toque, `Shift` dez,
   * `Alt` um décimo: a conta é `stepValue`, pura. A tecla para aqui — `↑` no
   * campo não pode virar "chave anterior" na linha do tempo (regra 12).
   *
   * Segurar a tecla junta os toques num passo de desfazer, como o arrasto; o
   * passo fecha quando a tecla sobe. Gravar redesenha o painel e o campo de
   * antes some, então o foco volta para o campo novo, pelo mesmo `id`.
   */
  private attachArrows(
    input: HTMLInputElement, id: string, step: number,
    read: () => number, write: (value: number) => void, show: (value: number) => string,
  ): void {
    input.addEventListener('keydown', (event) => {
      const direction = arrowDirection(event.key);
      if (direction === 0) return;
      event.preventDefault();
      event.stopPropagation();
      const atual = evalNumberExpression(input.value) ?? read();
      const next = stepValue(atual, direction, step, { shift: event.shiftKey, alt: event.altKey });
      input.value = show(next);
      write(next);
      this.refocus(id);
    });
    input.addEventListener('keyup', (event) => {
      if (arrowDirection(event.key) === 0) return;
      event.stopPropagation();
      this.endMerge();
    });
  }

  /** Põe o foco no campo `id` de novo, depois que o painel se redesenhou. */
  private refocus(id: string): void {
    const again = this.body?.querySelector<HTMLInputElement>(`[id="${id}"]`) ?? null;
    if (again === null || again === document.activeElement) return;
    again.focus();
    again.select();
  }

  // -------------------------------------------------------------------------
  // Writing
  // -------------------------------------------------------------------------

  /**
   * Closes the run of merged commands a drag produced, so the next drag does
   * not swallow this one. `endMerge` is not in the contract yet (request 3 in
   * PEDIDOS-CONTRATO.md), so it is called only when the document has it.
   */
  /** Um arrasto de campo numérico em curso: as escritas dele se juntam num passo. */
  private arrastandoCampo = false;

  /**
   * **Arrastar o rótulo** — rodada 43, lote 2 (doc `51`; o scrubby do
   * Photoshop, o arrasto do número do Spine). Para os lados: um passo por
   * pixel, Shift dez, Alt um décimo (`scrubValue`). Um passo de desfazer por
   * arrasto. Escuta a JANELA, e não o rótulo: cada gravação redesenha o painel
   * e o rótulo do começo do gesto deixa de existir. Um clique sem andar
   * continua sendo o clique do rótulo (põe o foco no campo).
   */
  private attachScrub(label: HTMLElement, step: number, read: () => number, write: (v: number) => void): void {
    label.classList.add('rotulo-arrasta');
    label.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const x0 = event.clientX;
      const v0 = read();
      let andou = false;
      const mexe = (e: PointerEvent): void => {
        const dx = e.clientX - x0;
        if (!andou && Math.abs(dx) < 3) return;
        if (!andou) { andou = true; this.endMerge(); this.arrastandoCampo = true; }
        e.preventDefault();
        write(scrubValue(v0, dx, step, { shift: e.shiftKey, alt: e.altKey }));
      };
      const solta = (): void => {
        window.removeEventListener('pointermove', mexe);
        window.removeEventListener('pointerup', solta);
        window.removeEventListener('pointercancel', solta);
        if (andou) { this.arrastandoCampo = false; this.endMerge(); }
      };
      window.addEventListener('pointermove', mexe);
      window.addEventListener('pointerup', solta);
      window.addEventListener('pointercancel', solta);
    });
  }

  private endMerge(): void {
    const doc = this.doc as unknown as { endMerge?: () => void } | null;
    doc?.endMerge?.();
  }

  private file(): EditorDoc['file'] {
    const doc = this.doc;
    if (!doc) throw new Error('Painel de propriedades sem documento.');
    return corpoDe(doc).file;
  }

  /**
   * What the field shows. With an animation open that is the value the
   * animation gives at the playhead, not the setup value — otherwise the field
   * would contradict the drawing right next to it.
   */
  private value(field: FieldDef): unknown {
    const doc = this.doc;
    if (!doc) return field.fallback;
    if (doc.animation !== null && field.pointer !== '') {
      const target = targetForPointer(corpoDe(doc).file, field.pointer);
      if (target !== null) {
        const animated = currentValueOf(doc, target);
        if (animated !== undefined) return animated;
      }
    }
    return fieldValue(corpoDe(doc).file, field);
  }

  /**
   * Writes one field — and this is where the rule of the two modes reaches the
   * panel (`anim/pose-mode.ts`).
   *
   * With no animation open, nothing changes: the field writes the setup pose.
   * With one open, an ANIMATABLE field writes a key at the playhead instead and
   * the setup pose is left alone; a field that no timeline can carry (a name, a
   * bone's length, a slot's blend) keeps writing the file, because there is no
   * other place for it to go.
   */
  private write(field: FieldDef, value: unknown): void {
    const doc = this.doc;
    if (!doc) return;
    // O campo **Osso** de um slot é uma troca de pai, e não a escrita de um
    // texto: desde o lote 34 ele passa pela mesma porta da tecla `P`, do menu
    // e do arrasto na Árvore — a que guarda a pose de mundo.
    // As duas caixas de pele — lote 39 — não escrevem num ponteiro só: mexem
    // no osso (ou na regra) e nas listas das peles, num passo de desfazer.
    if (field.skinRequiredOf !== undefined || field.skinMember !== undefined) {
      const { command, notice } = skinFieldCommand(corpoDe(doc).file, doc.visibleSkins, field, value);
      if (command !== null) corpoDe(doc).run(command);
      if (notice !== null) doc.notice(notice);
      this.say(null);
      return;
    }
    const slot = slotOfBoneField(corpoDe(doc).file, field);
    if (slot !== null && typeof value === 'string' && value !== '') {
      runReparent(doc, { ...emptySelection(), slots: [slot] }, value);
      this.say(null);
      return;
    }
    // A conta dos dois modos mora em `writeFieldValue`, e não aqui, porque a
    // Árvore escreve o mesmo campo `attachment` pela bolinha de cada anexo.
    const outcome = writeFieldValue(doc, field, value);
    // Conserto 2 da conferência (05/10): digitar 80 e 40 e depois puxar o canto
    // viravam UM passo, porque o `SetProperty` junta com o anterior do mesmo
    // ponteiro. Fora do arrasto de número, cada escrita é um passo seu.
    if (!this.arrastandoCampo) this.endMerge();
    this.say(outcome === 'recusado' ? REFUSED_MESSAGE : null);
    // J9: o mesmo recado da ficha rápida, para o campo de baixo.
    const preso = outcome === 'recusado' ? null : heldByRuleAfterWrite(doc, field.pointer);
    if (preso !== null) doc.notice(preso);
  }

  /** Shows one short line above the fields, or clears it. */
  private say(message: string | null): void {
    const notice = this.noticeNode;
    if (notice === null) return;
    notice.textContent = message ?? '';
    notice.hidden = message === null;
  }

  private rename(field: FieldDef, wanted: string): void {
    const doc = this.doc;
    if (!doc) return;
    const from = String(this.value(field) ?? '');
    if (wanted.trim() === '' || wanted === from) {
      this.render();
      return;
    }
    const target = this.renameTarget(field, from);
    if (!target) return;
    // A animação é deste arquivo; osso, slot, regra e anexo são do corpo do instante (4b).
    const dono = target.kind === 'animation' ? doc : corpoDe(doc);
    dono.run(new RenameItem(dono.file, target, wanted));
  }

  private renameTarget(field: FieldDef, from: string): RenameTarget | null {
    if (field.renameOf === 'bone') return { kind: 'bone', from };
    if (field.renameOf === 'slot') return { kind: 'slot', from };
    if (field.renameOf === 'constraint') return { kind: 'constraint', from };
    if (field.renameOf === 'animation') return { kind: 'animation', from };
    if (field.renameOf === 'attachment' && field.renameScope) {
      return { kind: 'attachment', slot: field.renameScope.slot, from };
    }
    return null;
  }
}

/**
 * O nome do slot quando o campo é o **Osso** dele, ou `null`.
 *
 * Pelo ponteiro, e não pelo rótulo: a regra de física também tem um campo
 * chamado "Osso", e ela não troca pai de nada — o ponteiro dela é
 * `/constraints/N/bone`.
 */
function slotOfBoneField(file: BoneFile, field: FieldDef): string | null {
  if (field.key !== 'bone') return null;
  const casa = /^\/slots\/(\d+)\/bone$/.exec(field.pointer ?? '');
  if (casa === null) return null;
  return (file.slots ?? [])[Number(casa[1])]?.name ?? null;
}

export const propertiesPanel = new PropertiesPanel();
registerPanel(propertiesPanel);

/** O valor dentro da faixa do campo, na escala do arquivo — Rodada 47, lote 3 (notas do doc 84). */
function prenderNaFaixa(valor: number, field: { min?: number; max?: number }): number {
  let v = valor;
  if (field.min !== undefined) v = Math.max(field.min, v);
  if (field.max !== undefined) v = Math.min(field.max, v);
  return v;
}

/** O que a mão abriu ou fechou na ficha completa, por título de grupo — Rodada 47, lote 6c (nota 5 do doc 90). */
const gruposDaMao = new Map<string, boolean>();
