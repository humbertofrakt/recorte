/**
 * "Chave de evento": which event a key fires, and what it carries (owner C).
 *
 * O MESMO BLOCO EM DOIS LUGARES
 * Ele aparece no painel **Propriedades** e no painel **Linha do tempo**, porque
 * é nos dois que a pessoa está quando pensa no assunto: nas Propriedades ao
 * lado do resto do que se edita, e na Linha do tempo com o cursor já no
 * instante certo. Um bloco só, desenhado duas vezes — nunca duas telas com
 * regras diferentes.
 *
 * COMO SE LÊ
 *   Evento          uma lista com os eventos do arquivo. É a escolha que
 *                   faltava: até agora uma chave de evento não dizia QUAL.
 *   Chavear evento  grava a chave no tempo do cursor.
 *   Chaves aqui     as chaves que já existem neste instante — pode haver mais
 *                   de uma (9.7), e cada uma com seus cinco campos.
 *
 * Cada campo diz de onde veio o valor: **da chave** ou **da definição**. São
 * duas coisas diferentes que na tela parecem uma só, e a diferença aparece no
 * dia em que a definição muda.
 *
 * Nenhuma decisão mora aqui: tudo é `anim/event-keys.ts`, que é puro e tem
 * teste. Este arquivo só desenha.
 */

import { campoNumero } from './campo-numero.js';
import type { EditorDoc } from '../contract.js';
import {
  EVENT_DEF_FIELDS, EVENT_FIELDS, EVENT_HINT, SOUND_BASE_HINT, SOUND_HINT, animationSounds, audioBaseOf, eventDefProblems, eventFoldOpen,
  eventFieldViews, eventKeysAt, eventNames, hasEventKey, keyEvent, resolvedEventAudio, unkeyEvent,
  type EventFieldDef, type EventKeyEdit, type EventKeyRow,
} from '../anim/event-keys.js';
import { button, clear, el, iconButton } from './dom.js';
// Porta D5 (degrau 12): a ficha da definição escreve pelo mesmo `SetProperty`
// de qualquer campo, e o ▶ lê o arquivo da pasta aberta do projeto.
import { SetProperty } from './properties-model.js';
import { pointerOf } from './json-pointer.js';
import { projectFolder } from '../io/project-folder.js';
import { descend } from '../io/folder-save.js';

/**
 * Which event the two panels have chosen. It lives outside both of them on
 * purpose: choosing "passo" in the Linha do tempo and finding "som" still
 * selected in Propriedades would be two tools pretending to be one.
 */
let chosenEvent = '';

/** The event the panels currently point at, for a test to read. */
export function currentEventChoice(): string {
  return chosenEvent;
}

/** Points the panels at one event. Ignored when the file has no such event. */
export function chooseEvent(name: string): void {
  chosenEvent = name;
}

/**
 * **O evento escolhido na Árvore abre a ficha DELE** — rodada 17, D2.
 *
 * Escolher o evento `step` na Árvore esvaziava a seleção, e a seleção vazia é
 * a ficha da **Base**: o título dizia "Base", e a ficha do evento (Chave de
 * evento, Definição do evento) ficava no fim de Propriedades, abaixo da dobra.
 * Agora o clique põe o evento **em foco**: Propriedades abre na ficha dele, no
 * alto, com o nome no título — como o parâmetro (D1). A próxima escolha
 * (qualquer outra) tira o foco.
 */
let focoNoEvento = false;
const ouvintesDoFoco = new Set<() => void>();

/** Escolhe o evento e o põe em foco; quem desenha Propriedades é avisado. */
export function focusEvent(name: string): void {
  chosenEvent = name;
  focoNoEvento = true;
  for (const ouvir of ouvintesDoFoco) ouvir();
}

/** O evento está em foco (o último clique foi nele, na Árvore)? */
export function eventFocused(): boolean {
  return focoNoEvento;
}

/** Tira o foco: outra coisa foi escolhida. */
export function releaseEventFocus(): void {
  focoNoEvento = false;
}

/** Ouve o foco no evento. Devolve como parar de ouvir. */
export function onEventFocus(ouvir: () => void): () => void {
  ouvintesDoFoco.add(ouvir);
  return () => ouvintesDoFoco.delete(ouvir);
}

/** "0,50 s" — vírgula, porque a interface é em português. */
function seconds(time: number): string {
  return `${time.toFixed(2).replace('.', ',')} s`;
}

/** The event to work on: the one chosen, or the first of the file. */
function eventFor(doc: EditorDoc): string {
  const names = eventNames(doc.file);
  if (names.includes(chosenEvent)) return chosenEvent;
  return names[0] ?? '';
}

/**
 * Draws the whole block into `host`, replacing whatever was there.
 *
 * `onChange` is called after every edit, so the panel that owns `host` can
 * redraw itself — the document already told it, but the block may live inside
 * a panel that does not listen to `structure`.
 */
export function renderEventKeyEditor(
  doc: EditorDoc, host: HTMLElement, onChange: () => void = () => {},
  options: { collapsible?: boolean } = {},
): void {
  // Rodada 40, lote 2: na Linha do tempo nasce fechado (`eventFoldOpen`).
  const wasOpen = eventFoldOpen(host.querySelector('details')?.open);
  clear(host);
  host.classList.add('evento-bloco');
  const box = el('fieldset', 'prop-grupo');
  const redraw = (): void => renderEventKeyEditor(doc, host, onChange, options);

  // Na Linha do tempo o bloco pode ser dobrado: aquele painel é onde as faixas
  // precisam de altura, e um bloco fixo no pé tira altura de quem trabalha.
  // No painel Propriedades ele fica sempre aberto — lá o painel já rola.
  if (options.collapsible === true) {
    const fold = el('details', 'evento-dobra');
    fold.open = wasOpen;
    fold.append(el('summary', 'prop-grupo-titulo', 'Chave de evento'), box);
    host.append(fold);
  } else {
    box.append(el('legend', 'prop-grupo-titulo', 'Chave de evento'));
    host.append(box);
  }

  const names = eventNames(doc.file);
  if (names.length === 0) {
    box.append(el('p', 'painel-aviso',
      'Este arquivo ainda não tem evento nenhum. Crie um no painel Árvore, em Eventos.'));
    return;
  }

  const time = doc.time;
  const current = eventFor(doc);

  // --- escolher qual evento
  const pickRow = el('div', 'prop-linha');
  const label = el('label', 'prop-rotulo', 'Evento');
  label.title = EVENT_HINT;
  label.htmlFor = 'evento-escolha';
  const select = el('select', 'prop-selecao') as HTMLSelectElement;
  select.id = 'evento-escolha';
  for (const name of names) {
    const option = el('option', undefined, name);
    option.value = name;
    select.append(option);
  }
  select.value = current;
  select.addEventListener('change', () => {
    chosenEvent = select.value;
    redraw();
  });
  pickRow.append(label, select);
  box.append(pickRow);

  // --- a DEFINIÇÃO: o som e os padrões (porta D5). Vale com a base aberta
  // também: o som do evento não é coisa de uma animação só.
  box.append(buildDefinition(doc, current, redraw));

  // --- gravar e apagar: isto, sim, precisa de uma animação aberta.
  const animation = doc.animation;
  if (animation === null) {
    box.append(el('p', 'painel-aviso', 'Abra uma animação para chavear um evento.'));
    return;
  }
  const already = hasEventKey(doc.file, animation, time, current);
  const buttons = el('div', 'malha-botoes');
  const write = button(
    already ? `Regravar aqui (${seconds(time)})` : `Chavear evento em ${seconds(time)}`,
    () => {
      doc.run(keyEvent(animation, time, current));
      onChange();
      redraw();
    },
  );
  const erase = button('Apagar esta chave', () => {
    doc.run(unkeyEvent(animation, time, current));
    onChange();
    redraw();
  });
  erase.disabled = !already;
  // Rodada 47, lote 4 (R5): os dois botões dizem o que fazem, e o apagado diz por quê.
  write.title = already
    ? `Regravar aqui: troca a chave de "${current}" em ${seconds(time)} pelos valores de agora`
    : `Chavear evento: grava "${current}" em ${seconds(time)}, o tempo da agulha`;
  write.setAttribute('aria-label', write.title);
  erase.title = already
    ? `Apagar esta chave: tira "${current}" de ${seconds(time)}`
    : `Apagar esta chave: não há chave de "${current}" em ${seconds(time)}`;
  erase.setAttribute('aria-label', erase.title);
  buttons.append(write, erase);
  box.append(buttons);

  // --- o que já existe neste instante
  const rows = eventKeysAt(doc.file, animation, time);
  if (rows.length === 0) {
    box.append(el('p', 'painel-aviso', `Nenhuma chave de evento em ${seconds(time)}.`));
    const vazio = buildSounds(doc, animation);
    if (vazio !== null) box.append(vazio);
    return;
  }
  box.append(el('p', 'painel-aviso', rows.length === 1
    ? `1 chave em ${seconds(time)}.`
    : `${rows.length} chaves em ${seconds(time)} — vários eventos podem dividir o mesmo instante.`));
  for (const row of rows) box.append(buildRow(doc, row, onChange, redraw));
  const sons = buildSounds(doc, animation);
  if (sons !== null) box.append(sons);
}

/*
 * A lista dos sons vai no fim do bloco, e por isso aparece nos DOIS painéis que
 * o hospedam — Propriedades e Linha do tempo. É assim que "o som na linha do
 * tempo" entra sem que este lote escreva uma linha no `dopesheet.ts`, que é de
 * outra parte. O que fica de fora (a onda desenhada na faixa) está nos Desvios.
 */

/** Os sons desta animação, para o painel que hospeda o bloco pôr onde quiser. */
export function renderAnimationSounds(doc: EditorDoc, host: HTMLElement): void {
  clear(host);
  if (doc.animation === null) return;
  const bloco = buildSounds(doc, doc.animation);
  if (bloco !== null) host.append(bloco);
}

/** One event key at this instant, with its five fields. */
function buildRow(
  doc: EditorDoc, row: EventKeyRow, onChange: () => void, redraw: () => void,
): HTMLElement {
  const box = el('fieldset', 'prop-grupo');
  box.append(el('legend', 'prop-grupo-titulo', row.event === '' ? '(sem evento)' : row.event));
  if (row.unknownEvent) {
    box.append(el('p', 'painel-aviso',
      `O evento "${row.event}" não existe mais neste arquivo. A chave não vai disparar nada.`));
  }
  if (row.audio !== null) {
    const linha = el('p', 'painel-aviso');
    const caminho = resolvedEventAudio(doc.file, row.event) ?? row.audio;
    linha.append(`Som da definição: ${caminho}. O som não muda por chave. `);
    // Porta D5: ouvir com o volume e o balanço DESTA chave, que é o que o
    // jogo vai ouvir — e não com os da definição, que podem ser outros.
    linha.append(iconButton('play', `Ouvir "${caminho}" com os valores desta chave`, () => {
      void playEventSound(doc, row.event,
        row.values.volume ?? row.defaults.volume ?? 1,
        row.values.balance ?? row.defaults.balance ?? 0,
      ).then((falha) => { if (falha !== null) doc.notice(falha); });
    }));
    box.append(linha);
  }

  for (const view of eventFieldViews(row)) {
    box.append(buildField(doc, row, view.field, view.value, view.origem, onChange, redraw));
  }
  return box;
}

/** One value of one key: the field, plus where the number came from. */
function buildField(
  doc: EditorDoc, row: EventKeyRow, field: EventFieldDef,
  value: number | string | undefined, origem: 'chave' | 'definição' | 'vazio',
  onChange: () => void, redraw: () => void,
): HTMLElement {
  const line = el('div', 'prop-linha');
  const id = `evento-${row.event}-${field.key}`;
  const label = el('label', 'prop-rotulo', field.label);
  label.htmlFor = id;

  const vazio = origem === 'definição' ? 'vindo da definição' : 'vazio';
  const note = el('span', 'evento-origem', origem === 'chave' ? 'nesta chave' : origem === 'definição' ? 'da definição' : 'vazio');
  const field2 = el('div', 'prop-campo-com-nota');
  if (field.kind !== 'texto') {
    // Rodada 47, lote 3 (R7 do doc 68): o número da casa, com a dica, e volume e balanço em %.
    const escala = field.scale ?? 1;
    const gravarValor = (v: number | null): void => {
      if (doc.animation === null) return;
      const edit: EventKeyEdit = {};
      edit[field.key] = v;
      doc.run(keyEvent(doc.animation, row.time, row.event, edit,
        `Mudar ${field.label.toLowerCase()} do evento ${row.event}`));
      onChange();
      redraw();
    };
    const numero = campoNumero({
      nome: field.label, dica: field.hint ?? field.label, unidade: field.unit, id, vazio,
      passo: field.kind === 'inteiro' ? 1 : 0.01 * escala, inteiro: field.kind === 'inteiro',
      min: field.min === undefined ? undefined : field.min * escala,
      max: field.max === undefined ? undefined : field.max * escala,
      ler: () => (typeof value === 'number' ? value * escala : Number.NaN),
      gravar: (v) => gravarValor(v / escala),
      apagar: () => gravarValor(null),
      falar: (frase) => doc.notice(frase),
    });
    numero.ligarRotulo(label);
    field2.append(numero.caixa, note);
    line.append(label, field2);
    return line;
  }
  const input = el('input', 'prop-campo') as HTMLInputElement;
  input.id = id;
  input.type = 'text';
  input.value = value === undefined ? '' : String(value);
  input.placeholder = vazio;

  const write = (): void => {
    const raw = input.value.trim();
    const edit: EventKeyEdit = {};
    if (raw === '') {
      // Campo apagado: o valor SAI da chave e a definição volta a responder.
      edit[field.key] = null;
    } else if (field.kind === 'texto') {
      edit[field.key] = raw;
    } else {
      const parsed = Number(raw.replace(',', '.'));
      if (!Number.isFinite(parsed)) {
        redraw();
        return;
      }
      edit[field.key] = parsed;
    }
    if (doc.animation === null) return;
    doc.run(keyEvent(doc.animation, row.time, row.event, edit,
      `Mudar ${field.label.toLowerCase()} do evento ${row.event}`));
    onChange();
    redraw();
  };
  input.addEventListener('change', write);
  field2.append(input, note);
  line.append(label, field2);
  return line;
}

// ---------------------------------------------------------------------------
// D5 — tocar o som (degrau 12, 18/09/2026)
// ---------------------------------------------------------------------------

/*
 * **Hoje o editor não toca som nenhum.** O `audio` da §4.5 aparecia na tela
 * só para ler, e a única maneira de saber se o arquivo certo estava no campo
 * era abrir o jogo.
 *
 * O runtime **NÃO DEVE** tocar áudio (§8.6, última linha): ele entrega o
 * caminho e o jogo decide. Isso vale para o runtime — o editor é o programa de
 * autoria, e nele ouvir é o único jeito de conferir. Por isso a leitura do
 * arquivo mora aqui, no painel, e não em `runtime/` nem em `anim/`.
 */

/** O som que está tocando agora, para um clique novo cortar o anterior. */
let playing: HTMLAudioElement | null = null;
/** O `objectURL` do som tocando, para soltá-lo quando o próximo entrar. */
let playingUrl: string | null = null;

/** Para o som e devolve a memória. Chamado antes de cada toque novo. */
export function stopEventSound(): void {
  playing?.pause();
  playing = null;
  if (playingUrl !== null) URL.revokeObjectURL(playingUrl);
  playingUrl = null;
}

/**
 * Toca o som de um evento, e **diz** quando não dá.
 *
 * Devolve a frase do rodapé: `null` quando tocou. Um botão que não faz nada e
 * não fala é o engano que a regra 21 proíbe, e aqui há quatro jeitos de não
 * dar: o evento é mudo, não há pasta aberta, a pasta é só de leitura, ou o
 * arquivo não está lá.
 */
export async function playEventSound(
  doc: EditorDoc, event: string, volume = 1, balance = 0,
): Promise<string | null> {
  const caminho = resolvedEventAudio(doc.file, event);
  if (caminho === null) return `O evento "${event}" não tem som escrito na definição.`;
  const folder = projectFolder(doc);
  if (folder === null) {
    return `Abra a pasta do projeto para ouvir "${caminho}" — o som mora no disco, não no .bone.`;
  }
  const raiz = folder.handle;
  if (raiz === null) {
    return `A pasta "${folder.name}" foi aberta só para leitura de imagens; não dá para buscar "${caminho}".`;
  }
  const partes = caminho.split('/').filter((p) => p !== '' && p !== '.');
  const nome = partes.pop();
  if (nome === undefined) return `O caminho "${caminho}" não nomeia um arquivo.`;
  try {
    const pasta = await descend(raiz, partes);
    if (typeof pasta.getFileHandle !== 'function') {
      return `Não dá para ler dentro de "${folder.name}" neste navegador.`;
    }
    const arquivo = await (await pasta.getFileHandle(nome)).getFile();
    stopEventSound();
    playingUrl = URL.createObjectURL(arquivo);
    const som = new Audio(playingUrl);
    // §4.5: volume 0..1, balanço −1..1. O `<audio>` do navegador não faz
    // panning sozinho; o balanço fica escrito na tela e vai para o jogo, e
    // quem ouve aqui ouve no meio. Está nos Desvios, e não escondido.
    som.volume = Math.min(1, Math.max(0, volume));
    playing = som;
    await som.play();
    return balance === 0 ? null
      : `Tocando "${caminho}" — o balanço ${fmtNum(balance)} vai para o jogo; aqui sai no meio.`;
  } catch {
    return `Não achei "${caminho}" dentro da pasta "${folder.name}".`;
  }
}

/** Um número do jeito que ele se lê em português. */
function fmtNum(value: number): string {
  return String(Math.round(value * 1000) / 1000).replace('.', ',');
}

/**
 * **A ficha da DEFINIÇÃO do evento** — o som e os padrões (§4.5).
 *
 * Fechada por padrão: a medição de altura já acusa Propriedades apertada, e
 * esta ficha só se abre quando se vai mexer no som. Aberta, ela traz o
 * caminho do som, a **pasta dos sons** (§2.8 `assets.audioBase`, que vale para
 * o arquivo inteiro), a junção dos dois já feita, e os cinco padrões que a
 * chave herda.
 */
function buildDefinition(doc: EditorDoc, event: string, redraw: () => void): HTMLElement {
  const fold = el('details', 'evento-definicao');
  fold.open = definitionOpen;
  fold.addEventListener('toggle', () => { definitionOpen = fold.open; });
  fold.append(el('summary', 'prop-grupo-titulo', `Definição do evento "${event}"`));

  const i = (doc.file.events ?? []).findIndex((e) => e.name === event);
  if (i < 0) {
    fold.append(el('p', 'painel-aviso', `O evento "${event}" não está no arquivo.`));
    return fold;
  }
  const def = (doc.file.events ?? [])[i]!;

  const escrever = (pointer: string, value: unknown, label: string): void => {
    doc.run(new SetProperty(pointer, value, label, 'structure'));
    redraw();
  };

  // --- o som, e a pasta dos sons
  fold.append(textRow('evento-def-audio', 'Som', typeof def.audio === 'string' ? def.audio : '',
    'passo.ogg', (valor) => escrever(
      pointerOf('events', i, 'audio'), valor === '' ? undefined : valor, 'Som do evento',
    ), SOUND_HINT));
  fold.append(textRow('evento-def-base', 'Pasta dos sons', audioBaseOf(doc.file), 'sons/',
    (valor) => escrever(
      pointerOf('assets', 'audioBase'), valor === '' ? undefined : valor, 'Pasta dos sons',
    ), SOUND_BASE_HINT));

  // A junção já feita, que é a mesma conta do runtime (§2.8). Ler o resultado
  // responde a pergunta de sempre — "o caminho está certo?" — sem abrir o jogo.
  const caminho = resolvedEventAudio(doc.file, event);
  const linha = el('div', 'prop-linha');
  linha.append(el('span', 'prop-rotulo', 'O arquivo'));
  linha.append(el('span', 'evento-caminho', caminho ?? '(este evento é mudo)'));
  if (caminho !== null) {
    linha.append(iconButton('play', `Ouvir "${caminho}"`, () => {
      void playEventSound(doc, event,
        typeof def.volume === 'number' ? def.volume : 1,
        typeof def.balance === 'number' ? def.balance : 0,
      ).then((falha) => { if (falha !== null) doc.notice(falha); });
    }));
  }
  fold.append(linha);

  // --- os cinco padrões da definição
  for (const field of EVENT_DEF_FIELDS) {
    const atual = (def as unknown as Record<string, unknown>)[field.key];
    fold.append(numberOrTextRow(`evento-def-${field.key}`, field, atual, (valor) => escrever(
      pointerOf('events', i, field.key), valor, `${field.label} do evento`,
    )));
  }

  for (const problema of eventDefProblems(doc.file, event)) {
    fold.append(el('p', 'prop-grupo-erro', problema));
  }
  return fold;
}

/** Lembra se a ficha da definição estava aberta, entre um desenho e o outro. */
let definitionOpen = false;

/** Uma linha de texto simples. */
function textRow(
  id: string, label: string, value: string, placeholder: string,
  write: (valor: string) => void,
  dica?: string,
): HTMLElement {
  const line = el('div', 'prop-linha');
  const rotulo = el('label', 'prop-rotulo', label);
  rotulo.htmlFor = id;
  const input = el('input', 'prop-campo') as HTMLInputElement;
  input.id = id;
  if (dica !== undefined) { rotulo.title = dica; input.title = dica; }
  input.type = 'text';
  input.value = value;
  input.placeholder = placeholder;
  input.addEventListener('change', () => write(input.value.trim()));
  line.append(rotulo, input);
  return line;
}

/** Uma linha de número (ou de texto), que apaga o campo do arquivo quando vazia. */
function numberOrTextRow(
  id: string, field: EventFieldDef, value: unknown, write: (valor: unknown) => void,
): HTMLElement {
  const line = el('div', 'prop-linha');
  const rotulo = el('label', 'prop-rotulo', field.label);
  rotulo.htmlFor = id;
  if (field.kind !== 'texto') {
    // Rodada 47, lote 3 (R7 do doc 68): o número da casa, e vazio volta ao padrão do formato.
    const escala = field.scale ?? 1;
    const numero = campoNumero({
      nome: field.label, dica: field.hint ?? field.label, unidade: field.unit, id, vazio: 'o padrão do formato',
      passo: field.kind === 'inteiro' ? 1 : 0.01 * escala, inteiro: field.kind === 'inteiro',
      min: field.min === undefined ? undefined : field.min * escala,
      max: field.max === undefined ? undefined : field.max * escala,
      ler: () => (typeof value === 'number' ? value * escala : Number.NaN),
      gravar: (v) => write(v / escala),
      apagar: () => write(undefined),
    });
    numero.ligarRotulo(rotulo);
    line.append(rotulo, numero.caixa);
    return line;
  }
  const input = el('input', 'prop-campo') as HTMLInputElement;
  input.id = id;
  input.type = 'text';
  input.value = value === undefined || value === null ? '' : String(value);
  input.placeholder = 'o padrão do formato';
  // Rodada 48 (doc 93, defeito 2): o Texto tinha a dica no modelo e não na tela.
  const dica = `${field.hint ?? field.label}. Vazio: o padrão do formato (sem texto)`;
  rotulo.title = dica;
  input.title = dica;
  input.addEventListener('change', () => {
    const raw = input.value.trim();
    write(raw === '' ? undefined : raw);
  });
  line.append(rotulo, input);
  return line;
}

/**
 * **Os sons desta animação**, em ordem de tempo, cada um com o seu ▶.
 *
 * É o que dá para ver do som na Linha do tempo sem desenhar onda: em que
 * instante toca o quê, com que volume, e um botão para ouvir sem sair daqui.
 * O bloco é desenhado dentro do painel Linha do tempo e do Propriedades, que é
 * onde ele já morava.
 */
function buildSounds(doc: EditorDoc, animation: string): HTMLElement | null {
  const rows = animationSounds(doc.file, animation);
  if (rows.length === 0) return null;
  const box = el('fieldset', 'prop-grupo evento-sons');
  box.append(el('legend', 'prop-grupo-titulo', `Sons de "${animation}"`));
  for (const row of rows) {
    const linha = el('div', 'evento-som-linha');
    linha.append(el('span', 'evento-som-tempo', seconds(row.time)));
    linha.append(el('span', 'evento-som-nome', row.event === '' ? '(sem evento)' : row.event));
    const descricao = row.unknownEvent
      ? 'o evento não existe mais'
      : row.audio ?? '(mudo)';
    linha.append(el('span', 'evento-som-arquivo', descricao));
    if (row.audio !== null) {
      linha.append(iconButton('play', `Ouvir "${row.audio}" (volume ${fmtNum(row.volume)})`, () => {
        void playEventSound(doc, row.event, row.volume, row.balance)
          .then((falha) => { if (falha !== null) doc.notice(falha); });
      }));
    }
    if (row.unknownEvent || row.audio === null) linha.classList.add('evento-som-mudo');
    box.append(linha);
  }
  return box;
}
