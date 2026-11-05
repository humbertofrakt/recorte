/**
 * A linha do tempo: as barras — lote A5b, plano arrumação (v10.9).
 *
 * O tocador (tocar, velocidade, tempo, duração, fim), o botão Detalhes, a
 * barra das chaves e o ⋯ Mais, o cabeçalho, a régua com as ferramentas e a
 * casca de cebola, a linha Resumo e o corpo da folha. Cortado de
 * `dopesheet.ts` pela seção "Toolbars": cada método virou uma função que
 * recebe o painel (`panel`), e a classe guarda um método de uma linha que
 * chama a função. Nada mudou no que cada um faz.
 */

import { campoNumero } from './campo-numero.js';
import { askUser } from '../ui/dialog.js';
import { allKeyTimes, findAnimation, keysAfter, scaleKeys, setDuration } from '../anim/keying.js';
import type { KeyRef } from '../anim/keying.js';
import { DEFAULT_MIRROR_RULES } from '../anim/timeline-tools.js';
import { EditKeys } from '../anim/pose-mode.js';
import { checkbox, clear, colorField, el, numberField, row } from './dom.js';
import { askForm } from '../ui/dialog.js';
import { ONION_ROWS } from './view-panel.js';
import { changeViewSettings, onViewSettings, viewSettings } from '../viewport/onion.js';
import type { OnionSettings } from '../viewport/onion.js';
import { runAction } from '../ui/actions.js';
import {
  MORE_CONTROLS, PLAYER_CONTROLS, SPEED_MAX, SPEED_MIN, controlLabel, formatSeconds, moreButtonHint,
  BASE_CLOCK, baseOpenHint, popupPlacement, sliderFromSpeed, speedFromSlider,
} from './dopesheet-model.js';
import type { MoreControl, PlayerControl } from './dopesheet-model.js';
import { keysAfterEndNotice, selectionModeOf, startsKeyDrag } from './dopesheet-model.js';
import { detailsButton, dockState } from './dock-model.js';
import { paintIcon } from '../ui/icons.js';
import { prefs } from '../ui/prefs.js';
import { animationDuration, parseTime } from './animations-model.js';
import { transport } from '../anim/transport.js';
import { refsAtTime, summaryMarks } from '../anim/summary.js';
import { END_MODES, type EndMode } from '../anim/transport.js';
import { arrowDirection, stepValue } from './properties-model.js';
import type { DopesheetPanel } from './dopesheet.js';
import { percentOf } from './dopesheet.js';
import { fpsOf } from './dopesheet.js';
// Rodada 8c, C15: esticar a animação estica junto a faixa da entidade.
import { stretchEntityBands } from '../anim/entity-band.js';

// -------------------------------------------------------------------------
// Toolbars
// -------------------------------------------------------------------------

export function makeButton(panel: DopesheetPanel, label: string, title: string, run: () => void, strong = false): HTMLButtonElement {
  const node = el('button', strong ? 'dope-botao dope-botao-forte' : 'dope-botao', label);
  node.type = 'button';
  node.title = title;
  node.addEventListener('click', () => {
    run();
    panel.host?.focus();
  });
  return node;
}

/**
 * Um botão da linha em bloco com ÍCONE e sem palavra — lote 23.
 *
 * Pedido do Humberto, 09/09/2026: *"tem muitos nomes onde podia ser trocados
 * por ícones, só isso já ganharíamos muito espaço"*. **Medido**: os sete
 * botões desta linha ocupavam **889px** com a palavra; em ícone ocupam
 * **378**. São 511px de largura devolvidos à folha de chaves.
 *
 * A palavra fica no DOM sempre e some pelo estilo, como na barra de ações: o
 * `title` e o `aria-label` continuam com o nome inteiro, e **Editar →
 * Preferências → Mostrar nome das ferramentas** traz a palavra de volta.
 */
export function makeIconButton(panel: DopesheetPanel, icon: string, label: string, title: string, run: () => void): HTMLButtonElement {
  const node = el('button', 'dope-botao dope-botao-icone');
  node.type = 'button';
  node.title = title;
  node.setAttribute('aria-label', title);
  const glyph = el('span', 'dope-botao-icone');
  if (!paintIcon(glyph, icon, 18)) glyph.textContent = label.slice(0, 1);
  node.append(glyph, el('span', 'dope-botao-nome', label));
  node.addEventListener('click', () => {
    run();
    panel.host?.focus();
  });
  return node;
}

/**
 * A primeira linha: o tocador inteiro, treze controles.
 *
 * **Só o símbolo aparece no botão** — decisão do Humberto, 08/09/2026. O nome
 * e a tecla ficam na dica e no `aria-label`, os dois com o mesmo texto, para
 * quem lê com o mouse e quem lê com o leitor de tela receberem o mesmo.
 *
 * O que cada controle é está em `dopesheet-model.ts`, como dado. Aqui só se
 * desenha, e o clique cai em `runAction`: é a MESMA porta do menu Animação e
 * da tecla, então os três nunca podem discordar.
 */
export function buildPlayerRow(panel: DopesheetPanel): HTMLElement {
  const row = el('div', 'dope-tocador');
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', 'Tocador');
  panel.playerNodes = new Map();
  for (const control of PLAYER_CONTROLS) {
    const node = panel.buildPlayerControl(control);
    panel.playerNodes.set(control.id, node);
    row.append(node);
  }
  // O Detalhes fica FORA do trecho que rola de lado. Dentro dele, numa
  // janela estreita, o botão saía da vista junto com os últimos controles —
  // e o botão que reabre a faixa é justamente o que não pode sumir.
  // O ⋯ Mais mora na linha 1 desde o lote 15, ao lado do Detalhes: ele passou
  // a guardar também o modo de fim e o "Tirar trecho de laço", e os dois
  // precisam existir com a faixa FECHADA. Na barra dos botões em bloco ele
  // sumia junto com ela.
  const linha = el('div', 'dope-linha1');
  linha.append(row, panel.buildMoreButton(), panel.buildDetailsButton());
  return linha;
}

/**
 * O botão **Detalhes**, na ponta direita da linha 1 — lote 14, rodada 3.
 *
 * É o *"só mostra os detalhes quando você clica"* do Spriter. Fechada, a
 * faixa é o tocador, a régua e o Resumo; aberta, ela é tudo o que ela era
 * antes deste lote — as abas, os botões em bloco e uma linha por osso e por
 * desenho.
 *
 * O clique cai em `runAction`, que é a MESMA porta do item **Janela →
 * Detalhes da linha do tempo**. Duas portas para o mesmo lugar se separam com
 * o tempo; uma porta só não tem como.
 */
export function buildDetailsButton(panel: DopesheetPanel): HTMLButtonElement {
  const node = el('button', 'dope-toc-botao dope-detalhes');
  node.type = 'button';
  node.addEventListener('click', () => {
    runAction('detalhes-faixa');
    panel.host?.focus();
  });
  panel.detailsNode = node;
  return node;
}

/**
 * Veste a folha de fechada ou de aberta.
 *
 * Fechada some a linha dos botões em bloco e o pé dos eventos, e a folha
 * desenha só o Resumo. Nada é destruído: o mesmo painel, a mesma seleção, os
 * mesmos nós — só o que aparece muda, e voltar é o mesmo clique.
 */
/** Mostra ou esconde a palavra ao lado do ícone, conforme a preferência. */
export function applyToolNames(panel: DopesheetPanel): void {
  panel.blockBar?.classList.toggle('mostra-nome', prefs().toolNames);
}

export function applyDock(panel: DopesheetPanel): void {
  const open = dockState().open;
  const face = detailsButton(open);
  if (panel.detailsNode !== null) {
    panel.detailsNode.textContent = `${open ? '▾' : '▴'} ${face.label}`;
    panel.detailsNode.title = face.hint;
    panel.detailsNode.setAttribute('aria-label', face.hint);
    panel.detailsNode.setAttribute('aria-expanded', String(face.expanded));
  }
  if (panel.blockBar !== null) panel.blockBar.hidden = !open;
  if (panel.eventBox !== null) panel.eventBox.hidden = !open;
  panel.host?.classList.toggle('dope-compacta', !open);
  panel.render();
}

export function buildPlayerControl(panel: DopesheetPanel, control: PlayerControl): HTMLElement {
  switch (control.kind) {
    case 'barra': return panel.buildSpeedControl(control);
    case 'campo':
      return control.id === 'duracao'
        ? panel.buildDurationControl(control)
        : panel.buildTimeControl(control);
    default: return panel.buildPlayerButton(control);
  }
}

export function buildPlayerButton(panel: DopesheetPanel, control: PlayerControl): HTMLButtonElement {
  const toggle = control.kind === 'liga';
  // Todo botão leva o seu id na classe: é assim que o estilo acha o Chavear
  // para pintá-lo, e é assim que uma conferência automática acha qualquer um
  // deles sem contar posições numa linha que ainda vai mudar.
  const classes = ['dope-toc-botao', `dope-toc-${control.id}`];
  if (toggle) classes.splice(1, 0, 'dope-toc-liga');
  // Os dois de Chavear levam a PALAVRA, e não o símbolo: é assim no Spriter
  // ("key selected" e "key all"), e é assim que o Humberto os reconhece. Os
  // outros onze continuam só com o desenho — a linha não cabe de outro jeito.
  if (control.kind === 'botao-texto') classes.push('dope-toc-palavra');
  const node = el('button', classes.join(' '), control.symbol);
  node.type = 'button';
  const label = controlLabel(control);
  node.title = label;
  node.setAttribute('aria-label', label);
  if (toggle) node.setAttribute('aria-pressed', 'false');
  node.addEventListener('click', () => {
    runAction(control.id);
    panel.host?.focus();
  });
  return node;
}

/**
 * A lista dos modos de fim — item 100, e do lote 15 em diante dentro do
 * ⋯ Mais.
 *
 * Ela ocupava uma lista inteira na linha 1, e a linha 1 é onde o Spriter põe
 * a barra de velocidade e os dois campos de tempo. Escolher o modo de fim se
 * faz uma vez por sessao; a barra de velocidade se mexe o tempo todo.
 */
export function buildEndModeControl(panel: DopesheetPanel, control: MoreControl): HTMLElement {
  const pick = document.createElement('select');
  pick.className = 'dope-toc-velocidade dope-mais-item';
  const label = `${control.label}: ${control.hint}`;
  pick.title = label;
  pick.setAttribute('aria-label', label);
  for (const mode of END_MODES) {
    const node = document.createElement('option');
    node.value = mode.value;
    node.textContent = mode.label;
    node.title = mode.hint;
    if (mode.value === transport.endMode()) node.selected = true;
    pick.append(node);
  }
  pick.addEventListener('change', () => {
    transport.setEndMode(pick.value as EndMode);
    panel.doc?.notice(
      END_MODES.find((m) => m.value === pick.value)?.hint ?? 'Modo de fim mudado',
    );
  });
  return pick;
}

/**
 * A barra de velocidade, com o número ao lado — lote 15.
 *
 * Era uma lista de quatro escolhas: 1/4, metade, normal, dobro. Uma lista de
 * quatro não deixa tocar a 30% para conferir um contato, e conferir contato é
 * o uso que existe. No Spriter é uma barra com o número `100` ao lado, e é
 * isso aqui.
 *
 * A barra e o número escrevem no MESMO lugar, `transport.setSpeed`, pela
 * mesma conta de `dopesheet-model.ts`. Dois caminhos para o mesmo número se
 * separam com o tempo.
 */
export function buildSpeedControl(panel: DopesheetPanel, control: PlayerControl): HTMLElement {
  const box = el('span', 'dope-toc-vel');
  const label = controlLabel(control);
  box.title = label;

  const bar = document.createElement('input');
  bar.type = 'range';
  bar.className = 'dope-toc-barra';
  bar.min = String(SPEED_MIN);
  bar.max = String(SPEED_MAX);
  bar.step = '1';
  bar.value = String(sliderFromSpeed(transport.speed()));
  bar.title = label;
  bar.setAttribute('aria-label', label);

  const field = document.createElement('input');
  field.type = 'text';
  field.className = 'dope-toc-vel-numero';
  field.inputMode = 'numeric';
  field.size = 3;
  field.value = String(sliderFromSpeed(transport.speed()));
  field.title = `${control.name} em por cento. 100 é a velocidade do arquivo`;
  field.setAttribute('aria-label', field.title);

  const escrever = (percent: number): void => {
    const preso = sliderFromSpeed(speedFromSlider(percent));
    bar.value = String(preso);
    field.value = String(preso);
    transport.setSpeed(speedFromSlider(preso));
  };
  bar.addEventListener('input', () => escrever(Number(bar.value)));
  field.addEventListener('change', () => escrever(Number(field.value.replace(',', '.'))));
  field.addEventListener('keydown', (e) => {
    const seta = arrowDirection(e.key);
    if (e.key === 'Enter') {
      e.preventDefault();
      escrever(Number(field.value.replace(',', '.')));
    } else if (seta !== 0) {
      // Lote 48: 1% por toque, Shift 10%.
      e.preventDefault();
      const atual = Number(field.value.replace(',', '.'));
      escrever(stepValue(Number.isFinite(atual) ? atual : 100, seta, 1, { shift: e.shiftKey, alt: e.altKey }));
    }
    e.stopPropagation();
  });
  panel.speedBar = bar;
  panel.speedField = field;
  // Rodada 40, lote 5: o "%" à vista, e não só na dica.
  box.append(bar, field, el('span', 'dope-toc-unidade', '%'));
  return box;
}

export function buildTimeControl(panel: DopesheetPanel, control: PlayerControl): HTMLElement {
  const box = el('span', 'dope-toc-tempo');
  const field = document.createElement('input');
  field.type = 'text';
  field.className = 'dope-toc-campo';
  field.inputMode = 'decimal';
  field.size = 7;
  field.value = formatSeconds(0);
  const label = controlLabel(control);
  field.title = label;
  field.setAttribute('aria-label', label);
  const commit = (): void => {
    const doc = panel.doc;
    const wanted = parseTime(field.value);
    if (doc === null || wanted === null) {
      doc?.notice('Tempo não entendido. Escreva um número de segundos');
      panel.renderClock();
      return;
    }
    panel.goTo(wanted);
    panel.renderClock();
  };
  field.addEventListener('change', commit);
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); panel.host?.focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); panel.renderClock(); panel.host?.focus(); }
    else if (arrowDirection(e.key) !== 0 && panel.doc !== null) {
      // Lote 48: dentro do campo, ↑ e ↓ andam um quadro; Shift dez, Alt um décimo.
      e.preventDefault();
      const doc = panel.doc;
      panel.goTo(stepValue(parseTime(field.value) ?? doc.time, arrowDirection(e.key), 1 / fpsOf(doc),
        { shift: e.shiftKey, alt: e.altKey }));
      field.value = formatSeconds(doc.time);
      panel.renderClock();
    }
    // Fora do campo as setas andam de chave em chave e o Espaço toca: aqui
    // dentro elas são do campo, e só dele.
    e.stopPropagation();
  });
  panel.timeField = field;
  const frame = el('span', 'dope-toc-quadro', 'quadro 0');
  panel.frameLabel = frame;
  box.append(field, frame);
  return box;
}

/**
 * A duração, clicável — item 11.
 *
 * Era um número que só dava para mudar escrevendo `duration` no arquivo à
 * mão. Um clique abre o campo; ao confirmar um valor diferente, ele
 * **pergunta se as chaves vão junto**.
 *
 * A pergunta é o item inteiro. "Esticar" é a caminhada de um segundo virando
 * a mesma caminhada em dois; "só o número" é dar mais tempo no fim sem mexer
 * em nada. Escolher por conta própria seria acertar metade das vezes.
 */
export function buildDurationControl(panel: DopesheetPanel, control: PlayerControl): HTMLElement {
  const box = el('span', 'dope-toc-duracao');
  const field = document.createElement('input');
  field.type = 'text';
  field.className = 'dope-toc-campo';
  field.inputMode = 'decimal';
  field.size = 7;
  field.value = formatSeconds(0);
  const label = controlLabel(control);
  field.title = label;
  field.setAttribute('aria-label', label);

  const commit = (): void => {
    const doc = panel.doc;
    const wanted = parseTime(field.value);
    if (doc === null || doc.animation === null) { panel.syncPlayer(); return; }
    if (wanted === null || wanted <= 0) {
      doc.notice('Duração tem de ser um número maior que zero');
      panel.syncPlayer();
      return;
    }
    panel.setDurationTo(wanted);
  };
  field.addEventListener('change', commit);
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); panel.host?.focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); panel.syncPlayer(); panel.host?.focus(); }
    else if (arrowDirection(e.key) !== 0 && panel.doc !== null) {
      // Lote 48: um quadro por toque, e cada toque é um passo de desfazer.
      e.preventDefault();
      const atual = parseTime(field.value) ?? 0;
      field.value = formatSeconds(stepValue(atual, arrowDirection(e.key), 1 / fpsOf(panel.doc),
        { shift: e.shiftKey, alt: e.altKey }));
      commit();
    }
    e.stopPropagation();
  });
  panel.durationField = field;
  box.append(el('span', 'dope-toc-barra-tempo', '/'), field);
  return box;
}

/**
 * Muda a duração pelo campo: **só o número**, sem esticar as chaves.
 *
 * Digitar num campo é um gesto de ajuste, e um gesto de ajuste não pode abrir
 * uma pergunta no meio. Quem quer esticar as chaves junto usa **Animação →
 * Mudar duração…**, que continua perguntando — e que era um item cinza até
 * este lote. As duas portas chamam o mesmo `setDuration` do `anim/keying.ts`.
 */
export function setDurationTo(panel: DopesheetPanel, seconds: number): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const animation = findAnimation(doc.file, doc.animation);
  if (animation === null) return;
  const old = animationDuration(animation);
  if (Math.abs(seconds - old) < 1e-6) { panel.syncPlayer(); return; }
  const sobrando = keysAfter(doc.file, doc.animation, seconds);
  const name = doc.animation;
  doc.run(new EditKeys(name, 'Mudar a duração', (file, animationName) => {
    setDuration(file, animationName, seconds, false);
  }));
  doc.notice(keysAfterEndNotice(formatSeconds(seconds), sobrando));
}

/** Pergunta a duração nova, e o que fazer com as chaves — item 11. */
export async function askDuration(panel: DopesheetPanel): Promise<void> {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const animation = findAnimation(doc.file, doc.animation);
  if (animation === null) return;
  const old = animationDuration(animation);

  const answer = await askForm({
    title: 'Duração da animação',
    lead: `A animação ${doc.animation} dura ${formatSeconds(old)} agora.`,
    fields: [{
      id: 'segundos', label: 'Segundos', hint: 'Use vírgula ou ponto. Exemplo: 1,5',
      value: String(old),
    }],
    yesLabel: 'Mudar',
  });
  if (answer === null) return;
  const seconds = Number((answer['segundos'] ?? '').replace(',', '.'));
  if (!Number.isFinite(seconds) || seconds <= 0) {
    doc.notice('Duração tem de ser um número maior que zero');
    return;
  }
  if (Math.abs(seconds - old) < 1e-6) return;

  const temChaves = allKeyTimes(doc.file, doc.animation).length > 0;
  const stretch = temChaves && await askUser({
    title: 'Esticar as chaves junto?',
    lead: `De ${formatSeconds(old)} para ${formatSeconds(seconds)}.`,
    lines: [
      'Esticar: tudo acontece na mesma ordem, mais devagar ou mais depressa.',
      'Só o número: as chaves ficam onde estão, e o fim anda sozinho.',
    ],
    yesLabel: 'Esticar as chaves',
    noLabel: 'Só o número',
  });

  // Contado ANTES: depois da mudança, as que passaram do fim já passaram.
  const sobrando = stretch ? 0 : keysAfter(doc.file, doc.animation, seconds);
  const name = doc.animation;
  doc.run(new EditKeys(name, 'Mudar a duração', (file, animationName) => {
    setDuration(file, animationName, seconds, stretch);
    // Rodada 8c, C15: esticar estica junto a faixa em que se escolheu a
    // animação da entidade — a velocidade dela acompanha, no mesmo passo.
    if (stretch && old > 0) stretchEntityBands(file, animationName, seconds / old);
  }));
  doc.notice(sobrando === 0
    ? `Duração: ${formatSeconds(seconds)}${stretch ? ', com as chaves esticadas' : ''}`
    : keysAfterEndNotice(formatSeconds(seconds), sobrando));
}

/**
 * Acerta os controles do tocador com o que está acontecendo agora.
 *
 * Chamado em toda mudança de tempo, de estrutura e de seleção, e também
 * quando o próprio tocador para sozinho no fim da animação.
 */
export function syncPlayer(panel: DopesheetPanel): void {
  const doc = panel.doc;
  const playing = transport.isPlaying();

  const tocar = panel.playerNodes.get('tocar');
  if (tocar instanceof HTMLButtonElement) {
    tocar.textContent = playing ? '❚❚' : '▶';
    tocar.setAttribute('aria-pressed', String(playing));
    tocar.classList.toggle('is-on', playing);
  }

  const animation = doc === null ? null : findAnimation(doc.file, doc.animation);
  const loop = animation?.loop === true;
  const repetir = panel.playerNodes.get('repetir');
  if (repetir instanceof HTMLButtonElement) {
    repetir.setAttribute('aria-pressed', String(loop));
    repetir.classList.toggle('is-on', loop);
  }

  // O "Gravar sozinho" e o semáforo do Chavear saíram no degrau 4a (M6, G13):
  // editar sempre grava, e a marca de chave fica na folha.

  // O tocador nunca apaga (M5): com a base aberta a duração diz `0,00 s`.
  if (panel.durationField !== null && document.activeElement !== panel.durationField) {
    panel.durationField.value = animation === null
      ? BASE_CLOCK : formatSeconds(animationDuration(animation));
  }

  const percent = String(sliderFromSpeed(transport.speed()));
  if (panel.speedBar !== null) panel.speedBar.value = percent;
  if (panel.speedField !== null && document.activeElement !== panel.speedField) {
    panel.speedField.value = percent;
  }

  // Com a base aberta os botões de tocar ficam cinza — com dica —, mas o
  // tocador continua à vista: relógio em `0,00 s` e um losango (M5).
  const open = doc?.animation != null;
  for (const [id, node] of panel.playerNodes) {
    if (id === 'tempo' || id === 'duracao') continue;
    if (node instanceof HTMLButtonElement || node instanceof HTMLSelectElement) {
      node.disabled = !open;
    }
  }
  if (panel.timeField !== null) panel.timeField.disabled = !open;
  if (panel.durationField !== null) panel.durationField.disabled = !open;
  if (panel.speedBar !== null) panel.speedBar.disabled = !open;
  if (panel.speedField !== null) panel.speedField.disabled = !open;

  // Com a base aberta todo botão cinza diz POR QUÊ. Um botão cinza sem
  // explicação é um botão que se aprende a ignorar. A frase é do modelo, para
  // o teste ler exatamente a que a tela mostra.
  for (const control of PLAYER_CONTROLS) {
    if (control.kind !== 'botao-texto' && control.kind !== 'botao' && control.kind !== 'liga') continue;
    const node = panel.playerNodes.get(control.id);
    if (!(node instanceof HTMLButtonElement)) continue;
    const dica = open ? controlLabel(control) : baseOpenHint(control);
    node.title = dica;
    node.setAttribute('aria-label', dica);
  }
}

export function buildKeyGroup(panel: DopesheetPanel): HTMLElement {
  const group = el('div', 'dope-grupo-botoes');
  group.append(
    panel.makeIconButton('key-remove', 'Apagar chave',
      'Apagar chave: apaga a chave do tempo atual', () => panel.unkeyNow()),
    panel.makeIconButton('trash', 'Apagar seleção',
      'Apagar seleção: apaga as chaves escolhidas', () => panel.deleteSelected()),
    panel.makeIconButton('copy', 'Copiar',
      'Copiar: copia as chaves escolhidas', () => panel.copySelected()),
    panel.makeIconButton('paste', 'Colar',
      'Colar: cola as chaves no tempo atual', () => panel.pasteHere()),
    panel.makeIconButton('expand-h', 'Esticar ×2',
      'Esticar ×2: afasta as chaves escolhidas do tempo atual, dobrando o intervalo',
      () => panel.scaleSelected(2)),
    panel.makeIconButton('contract-h', 'Encolher ÷2',
      'Encolher ÷2: aproxima as chaves escolhidas do tempo atual, pela metade',
      () => panel.scaleSelected(0.5)),
    panel.makeIconButton('mirror-h', 'Espelhar',
      'Espelhar: inverte no tempo as chaves escolhidas, em volta do tempo atual',
      () => panel.scaleSelected(-1)),
  );
  return group;
}

/**
 * O botão **⋯ Mais**, e o que cai dele.
 *
 * Aqui moram os gestos de vez em quando: esticar um trecho, espelhar no
 * tempo, fechar o ciclo, trocar as linhas entre os ossos de nome espelhado.
 * Eram uma barra permanente — seis controles com rótulo — para coisas que se
 * usam uma vez por animação, e essa barra era altura tirada das chaves.
 *
 * As quatro ações também estão no menu Animação desde o lote menus. Este menu
 * não é um segundo lugar onde elas moram: as duas portas chamam `runAction`.
 */
export function buildMoreButton(panel: DopesheetPanel): HTMLElement {
  const holder = el('div', 'dope-mais');

  const button = el('button', 'dope-botao dope-mais-botao');
  button.type = 'button';
  const glyph = document.createElement('span');
  if (!paintIcon(glyph, 'more', 18)) glyph.textContent = '⋯';
  button.append(glyph, document.createTextNode(' Mais'));
  button.title = moreButtonHint();
  button.setAttribute('aria-label', button.title);
  button.setAttribute('aria-expanded', 'false');

  const list = el('div', 'dope-mais-lista');
  list.hidden = true;
  for (const control of MORE_CONTROLS) list.append(panel.buildMoreControl(control));

  button.addEventListener('click', () => {
    const abrir = list.hidden;
    list.hidden = !abrir;
    button.setAttribute('aria-expanded', String(abrir));
    if (abrir) panel.renderPairs();
  });
  // Um clique fora fecha. Sem isto o menu ficaria aberto por cima das chaves.
  document.addEventListener('pointerdown', (event) => {
    if (list.hidden || holder.contains(event.target as Node)) return;
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  });

  holder.append(button, list);
  return holder;
}

export function buildMoreControl(panel: DopesheetPanel, control: MoreControl): HTMLElement {
  if (control.kind === 'lista') return panel.buildEndModeControl(control);
  if (control.kind === 'liga') {
    const row = el('label', 'dope-mais-item dope-mais-campo');
    row.title = control.hint;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = panel.onlySelected;
    box.addEventListener('change', () => {
      panel.onlySelected = box.checked;
      panel.render();
      panel.doc?.notice(box.checked
        ? 'Mostrando só as linhas do que está escolhido'
        : 'Mostrando todas as linhas');
    });
    row.append(box, el('span', 'dope-rotulo', control.label));
    return row;
  }
  if (control.id === 'tirar-trecho') {
    const node = panel.makeButton(control.label, control.hint, () => panel.clearLoopRange());
    node.classList.add('dope-mais-item');
    return node;
  }
  if (control.kind === 'acao') {
    const node = panel.makeButton(control.label, control.hint, () => runAction(control.id));
    node.classList.add('dope-mais-item');
    return node;
  }

  const row = el('label', 'dope-mais-item dope-mais-campo');
  row.title = control.hint;
  const field = document.createElement('input');
  field.type = 'text';
  field.className = control.id === 'fator' ? 'dope-campo' : 'dope-campo dope-campo-largo';
  field.setAttribute('aria-label', control.label);
  if (control.id === 'fator') {
    field.inputMode = 'decimal';
    field.value = '2';
    field.size = 4;
    panel.factorBox = field;
  } else {
    field.value = DEFAULT_MIRROR_RULES;
    field.addEventListener('input', () => panel.renderPairs());
    panel.rulesBox = field;
    // O texto que diz quantos pares a regra achou vive junto do campo dele.
    const found = el('p', 'dope-pares', '');
    panel.pairsNode = found;
    const wrap = el('div', 'dope-mais-par');
    wrap.append(el('span', 'dope-rotulo', control.label), field, found);
    return wrap;
  }
  row.append(el('span', 'dope-rotulo', control.label), field);
  return row;
}

/**
 * O cabeçalho: a régua em cima, e o **Resumo** logo abaixo dela.
 *
 * A coluna da esquerda dizia "Alvo", que é o nome da coluna e não o nome de
 * uma linha. Agora ela diz **Resumo**, que é o que a linha ao lado mostra.
 */
export function buildHeader(panel: DopesheetPanel): HTMLElement {
  const header = el('div', 'dope-cabecalho');
  const ruler = el('div', 'dope-regua');
  ruler.addEventListener('pointerdown', panel.onRulerDown);
  panel.ruler = ruler;

  const linha = el('div', 'dope-cabecalho-linha');
  linha.append(panel.buildOnionCorner(), ruler);
  linha.querySelector('.dope-cebola')?.append(...panel.buildRulerTools());

  const nome = el('div', 'dope-cabecalho-nome dope-resumo-nome', 'Resumo');
  nome.title = 'Um losango em cada tempo que tem chave, em qualquer linha';
  const faixa = el('div', 'dope-faixa dope-resumo');
  faixa.addEventListener('pointerdown', (event) => panel.onTrackDown(event));
  panel.summaryTrack = faixa;
  const resumo = el('div', 'dope-cabecalho-linha dope-resumo-linha');
  resumo.append(nome, faixa);

  header.append(linha, resumo);
  return header;
}

/**
 * A casca de cebola, no canto da régua — item 28.
 *
 * Ela morava dobrada no fim do painel Exibição, na coluna da direita. Ligar
 * fantasma é decisão que se toma **olhando o tempo**: "esta pose está longe
 * demais da anterior". Tomar essa decisão com os olhos aqui e a mão do outro
 * lado da tela é o tipo de ida e volta que faz um recurso deixar de ser
 * usado.
 *
 * O ícone liga e desliga. O ⋯ ao lado abre os seis números e as duas cores,
 * exatamente os mesmos campos de antes — as mesmas funções de `dom.ts`, para
 * os dois lugares nunca se comportarem diferente.
 */
/**
 * Os três botões do canto da régua — lote 29, anotação 15, itens **a** e **b**.
 *
 * O trecho de laço só se marcava com **`Alt` + clique** na régua (esquerdo
 * para o começo, direito para o fim), e a marca só com a tecla **`M`** com o
 * foco na faixa. Nenhum dos dois tinha botão, nem menu, nem uma linha em
 * lugar nenhum da tela: quem não leu o manual não sabia que existiam, e quem
 * leu esquecia. Só o "tirar trecho" tinha porta, no ⋯ Mais — havia como
 * desfazer algo que não havia como fazer.
 *
 * Os gestos continuam todos: um botão não tira uma tecla.
 */
export function buildRulerTools(panel: DopesheetPanel): HTMLElement[] {
  const botao = (icone: string, nome: string, acao: string, letra: string): HTMLElement => {
    const node = el('button', 'dope-botao dope-regua-botao') as HTMLButtonElement;
    node.type = 'button';
    const glyph = document.createElement('span');
    if (!paintIcon(glyph, icone, 16)) glyph.textContent = letra;
    node.append(glyph);
    node.title = nome;
    node.setAttribute('aria-label', nome);
    // Pelo `runAction`: é a MESMA porta do menu Animação. Duas portas para o
    // mesmo lugar, e nunca duas funções parecidas.
    node.addEventListener('click', () => { runAction(acao); });
    return node;
  };
  return [
    botao('bracket-open', 'Início do trecho de laço (Alt + clique na régua)',
      'laco-inicio', '['),
    botao('bracket-close', 'Fim do trecho de laço (Alt + botão direito na régua)',
      'laco-fim', ']'),
    botao('marker', 'Pôr ou tirar marca aqui (M)', 'nova-marca', '⚑'),
  ];
}

export function buildOnionCorner(panel: DopesheetPanel): HTMLElement {
  const corner = el('div', 'dope-cabecalho-nome dope-cebola');

  const toggle = el('button', 'dope-botao dope-cebola-botao');
  toggle.type = 'button';
  const glyph = document.createElement('span');
  if (!paintIcon(glyph, 'onion', 18)) glyph.textContent = '◍';
  toggle.append(glyph);
  const syncToggle = (): void => {
    const on = viewSettings().onion.enabled;
    toggle.classList.toggle('is-active', on);
    toggle.setAttribute('aria-pressed', String(on));
    toggle.title = on ? 'Casca de cebola ligada' : 'Casca de cebola desligada';
    toggle.setAttribute('aria-label', toggle.title);
  };
  toggle.addEventListener('click', () => {
    changeViewSettings({ onion: { enabled: !viewSettings().onion.enabled } }, panel.doc);
    syncToggle();
    panel.doc?.notice(viewSettings().onion.enabled
      ? 'Casca de cebola ligada'
      : 'Casca de cebola desligada');
  });
  syncToggle();
  panel.stopOnionWatch = onViewSettings(syncToggle);

  const more = el('button', 'dope-botao dope-cebola-mais');
  more.type = 'button';
  const dots = document.createElement('span');
  if (!paintIcon(dots, 'more', 16)) dots.textContent = '⋯';
  more.append(dots);
  more.title = 'Opções da casca de cebola';
  more.setAttribute('aria-label', more.title);
  more.setAttribute('aria-expanded', 'false');

  const list = el('div', 'dope-cebola-lista');
  list.hidden = true;
  more.addEventListener('click', () => {
    const abrir = list.hidden;
    // Os campos são refeitos a cada abertura: assim eles mostram o valor de
    // agora, mesmo que outra parte do editor tenha mexido nele.
    if (abrir) {
      panel.fillOnionOptions(list);
      // I-O4: presa à janela, para o lado que tem espaço — a folha não corta.
      const box = more.getBoundingClientRect();
      const lugar = popupPlacement(box, window.innerWidth, window.innerHeight);
      list.style.left = `${Math.round(lugar.left)}px`;
      list.style.top = lugar.top === undefined ? '' : `${Math.round(lugar.top)}px`;
      list.style.bottom = lugar.bottom === undefined ? '' : `${Math.round(lugar.bottom)}px`;
      list.style.maxHeight = `${Math.round(lugar.maxHeight)}px`;
    }
    list.hidden = !abrir;
    more.setAttribute('aria-expanded', String(abrir));
  });
  document.addEventListener('pointerdown', (event) => {
    if (list.hidden || corner.contains(event.target as Node)) return;
    list.hidden = true;
    more.setAttribute('aria-expanded', 'false');
  });

  corner.append(toggle, more, list);
  return corner;
}

/** Os oito campos da cebola, os mesmos que o painel Exibição tinha. */
export function fillOnionOptions(panel: DopesheetPanel, list: HTMLElement): void {
  const onion = viewSettings().onion;
  // `changeViewSettings` grava no navegador E no arquivo, como o painel
  // Exibição fazia: quem reabre o `.bone` reencontra a cebola como a deixou.
  const change = (patch: Partial<OnionSettings>): void => {
    changeViewSettings({ onion: patch }, panel.doc);
  };
  clear(list);
  list.append(row('Só nas chaves', checkbox(onion.onlyKeys, (on) => {
    change({ onlyKeys: on });
  }), 'cebola'));
  list.append(row('Desenhar como silhueta', checkbox(onion.silhouette, (on) => {
    change({ silhouette: on });
  }), 'cebola'));
  for (const item of ONION_ROWS) {
    // Rodada 47, lote 5 (nota 2 do doc 85): o número da casa, com a unidade depois
    // da caixa, o rótulo que arrasta e a dica; "Quanto aparece" em %.
    const escala = item.scale ?? 1;
    const linha = el('div', 'prop-linha');
    const rotulo = el('label', 'prop-rotulo', item.label);
    const numero = campoNumero({
      nome: item.label, dica: item.hint, unidade: item.unit, id: `cebola-${item.key}`,
      min: item.min * escala, max: item.max * escala, passo: item.step * escala,
      ler: () => viewSettings().onion[item.key] * escala,
      gravar: (v) => change({ [item.key]: v / escala } as Partial<OnionSettings>),
      falar: (frase) => panel.doc?.notice(frase),
    });
    rotulo.htmlFor = `cebola-${item.key}`;
    rotulo.title = item.hint;
    numero.ligarRotulo(rotulo);
    linha.append(rotulo, numero.caixa);
    list.append(linha);
  }
  list.append(row('Cor de antes', colorField(onion.colorBefore, (value) => {
    change({ colorBefore: value });
  }), 'cebola'));
  list.append(row('Cor de depois', colorField(onion.colorAfter, (value) => {
    change({ colorAfter: value });
  }), 'cebola'));
  list.append(el('p', 'dope-cebola-ajuda',
    'Deslocar para o lado compara uma passada com a outra e mostra o pé escorregando.'));
}

/**
 * Desenha os losangos do Resumo.
 *
 * Um por tempo que tenha chave em qualquer linha. Branco quando o tempo junta
 * mais de um tipo de alvo — um osso e um evento, por exemplo —, porque quem
 * arrasta precisa saber que está levando o evento junto com a pose.
 */
export function renderSummary(panel: DopesheetPanel): void {
  const track = panel.summaryTrack;
  const doc = panel.doc;
  if (track === null) return;
  clear(track);
  if (doc === null || doc.animation === null) return;
  const span = panel.endTime();
  if (span <= 0) return;
  for (const mark of summaryMarks(doc.file, doc.animation)) {
    track.append(panel.buildSummaryMark(mark.time, mark.count, mark.mixed, span));
  }
  panel.renderEdgeHandles(track, span);
}

/**
 * As alças nas pontas da seleção de chaves — item 27.
 *
 * Esticar já existia, pelo campo "Fator" do ⋯ Mais: digitar `1.5` e apertar.
 * Isto é o mesmo gesto com a mão: pega a ponta e puxa, com a OUTRA ponta
 * parada. É como se ajusta ritmo de olho — "este trecho tem que ser um pouco
 * mais rápido" não é um número que alguém sabe de antemão.
 *
 * As alças ficam na linha do Resumo, que atravessa a folha inteira e está
 * sempre à vista. Com menos de duas chaves escolhidas não há o que esticar, e
 * elas não aparecem: uma alça que não faz nada é pior que alça nenhuma.
 */
export function renderEdgeHandles(panel: DopesheetPanel, track: HTMLElement, span: number): void {
  const refs = panel.selectedRefs;
  if (refs.length < 2) return;
  const times = refs.map((ref) => ref.time);
  const first = Math.min(...times);
  const last = Math.max(...times);
  if (last - first < 1e-6) return;

  for (const side of ['inicio', 'fim'] as const) {
    const time = side === 'inicio' ? first : last;
    const pivot = side === 'inicio' ? last : first;
    const node = el('button', `dope-borda dope-borda-${side}`);
    (node as HTMLButtonElement).type = 'button';
    node.style.left = `${percentOf(time, span)}%`;
    const texto = side === 'inicio'
      ? 'Puxe para esticar, com o fim parado'
      : 'Puxe para esticar, com o começo parado';
    node.title = texto;
    node.setAttribute('aria-label', texto);
    node.addEventListener('pointerdown', (event) => panel.onEdgeDown(event, pivot, time));
    track.append(node);
  }
}

/**
 * O arrasto de uma alça de borda — item 27.
 *
 * O fator é a razão entre a distância nova e a antiga até o pivô, que é a
 * outra ponta. Um fator negativo espelharia a seleção sem aviso — puxar a
 * ponta esquerda para além da direita —, então ele é preso num mínimo:
 * espelhar é o `-1` do campo Fator, e é um gesto que se pede, não um que
 * acontece por acidente.
 *
 * Passa pelo MESMO `scaleKeys` do campo Fator, com a mesma junção de passos,
 * então o arrasto inteiro é um passo de desfazer só.
 */
export function onEdgeDown(panel: DopesheetPanel, event: PointerEvent, pivot: number, edge: number): void {
  if (event.button !== 0) return;
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  event.preventDefault();
  event.stopPropagation();

  const track = panel.summaryTrack;
  const span = panel.endTime();
  if (track === null || span <= 0) return;
  const box = track.getBoundingClientRect();
  if (box.width <= 0) return;
  const arm = edge - pivot;
  if (Math.abs(arm) < 1e-6) return;
  const mergeKey = `borda-${Date.now()}`;
  const name = doc.animation;

  const move = (moveEvent: PointerEvent): void => {
    const time = ((moveEvent.clientX - box.left) / box.width) * span;
    // Mínimo de um centésimo do vão: encolher até zero juntaria todas as
    // chaves num instante só, e desfazer não separaria mais o que era de
    // quem.
    const factor = Math.max(0.01, (time - pivot) / arm);
    const refs = panel.selectedRefs;
    let written: KeyRef[] = [];
    doc.run(new EditKeys(name, 'Esticar chaves', (file, animation) => {
      written = scaleKeys(file, animation, refs, pivot, factor);
    }, mergeKey));
    if (written.length > 0) panel.selectKeys(written, 'trocar', true);
  };
  const end = (): void => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    doc.endMerge?.();
    doc.notice('Chaves esticadas');
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
}

export function buildSummaryMark(panel: DopesheetPanel, time: number, count: number, mixed: boolean, span: number): HTMLElement {
  const node = el('button', mixed ? 'dope-chave dope-resumo-chave dope-resumo-misto'
    : 'dope-chave dope-resumo-chave');
  node.type = 'button';
  node.style.left = `${percentOf(time, span)}%`;
  const quantas = count === 1 ? '1 chave' : `${count} chaves`;
  const texto = `${quantas} em ${formatSeconds(time)}${mixed ? ', de mais de um tipo' : ''}`;
  node.title = texto;
  node.setAttribute('aria-label', texto);
  node.dataset['tempo'] = String(time);
  node.addEventListener('pointerdown', (event) => panel.onSummaryDown(event, time));
  // G1 (chat G, 29/09): o botão direito no losango do Resumo não abria nada.
  // Agora escolhe as chaves daquele tempo e abre o MESMO menu das linhas.
  node.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const doc = panel.doc;
    if (doc === null || doc.animation === null) return;
    const refs = refsAtTime(doc.file, doc.animation, time);
    if (refs.length === 0) return;
    panel.selectKeys(refs, 'trocar');
    panel.openKeyMenu(refs[0]!, event.clientX, event.clientY);
  });
  return node;
}

/**
 * Clicar e arrastar um losango do Resumo.
 *
 * Ele escolhe TODAS as chaves daquele tempo e cai no mesmo arrasto de chave
 * que já existe — o mesmo `EditKeys` com `moveKeys`, o mesmo `mergeWith`
 * durante o arrasto, o mesmo passo único de desfazer. Não há um segundo
 * caminho para mover chave.
 */
export function onSummaryDown(panel: DopesheetPanel, event: PointerEvent, time: number): void {
  if (event.button !== 0) return;
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  event.preventDefault();
  event.stopPropagation();
  const refs = refsAtTime(doc.file, doc.animation, time);
  if (refs.length === 0) return;
  // Rodada 40, lote 3: a MESMA regra do losango — Ctrl soma, Shift tira. Era
  // o contrário aqui (doc 39, foto `10`).
  const mode = selectionModeOf(event);
  panel.selectKeys(refs, mode);
  // Rodada 40, lote 1 (S1): o clique simples no Resumo também leva a agulha.
  if (mode === 'trocar' && Math.abs(doc.time - time) > 1e-6) doc.time = time;
  if (!startsKeyDrag(mode)) return;
  panel.drag = 'chaves';
  panel.dragStart = { x: event.clientX, y: event.clientY, time };
  panel.dragDelta = 0;
  window.addEventListener('pointermove', panel.onPointerMove);
  window.addEventListener('pointerup', panel.onPointerUp);
}

export function buildBody(panel: DopesheetPanel): HTMLElement {
  const body = el('div', 'dope-corpo');
  const cursor = el('div', 'dope-cursor');
  // A bandeirinha mora DENTRO da agulha: assim ela anda junto sem uma segunda
  // conta de posição, e não há como as duas discordarem — anotação 7.
  const flag = el('span', 'dope-cursor-bandeira', '');
  cursor.append(flag);
  panel.cursorFlag = flag;
  panel.cursor = cursor;
  panel.body = body;
  return body;
}
