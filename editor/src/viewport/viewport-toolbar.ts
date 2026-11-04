/**
 * A cena: a barra de cima — lote A5c, plano arrumação (v11.0).
 *
 * A barra de ações (arquivo, editar, ferramentas, eixos, ver e travar), o
 * interruptor Montagem | Animando, os botões de cada ferramenta e de cada modo,
 * o zoom pelos botões e o Ajustar à tela. Cortado de `viewport.ts` pela seção
 * "toolbar": cada método virou uma função que recebe o painel (`panel`), e a
 * classe guarda um método de uma linha que chama a função.
 */

import { getTools, type EditorDoc } from '../contract.js';
import { viewSettings } from './onion.js';
import { HANDLE_SPACES, getHandleSpace, setHandleSpace, type HandleSpace } from './tools/space.js';
import { registerAction, runAction } from '../ui/actions.js';
import { paintIcon } from '../ui/icons.js';
import {
  MORE_HINT, MORE_LABEL, NEVER_IN_MORE, actionBarGroups, fitBar,
} from '../ui/action-bar-model.js';
import type { BarSlot } from '../ui/action-bar-model.js';
import type { ActionBarGroup } from '../ui/action-bar-model.js';
import { prefs } from '../ui/prefs.js';
import { toolbarItems } from '../ui/toolbar-model.js';
import { getActiveToolId, setActiveTool } from './tools/registry.js';
import { openFloatingMenu } from '../ui/floating-menu.js';
import {
  PARTICLE_BUTTON_HINT, PARTICLE_PRESETS, addPresetEmitter, particleMenuItems, presetActionId, wordOnBar,
} from '../panels/particle-presets.js';
import type { ViewportPanel } from './viewport.js';
import type { DocWithCamera } from './viewport.js';
import { SEE_LOCK_KEYS } from './viewport.js';

// -- toolbar ---------------------------------------------------------------

/**
 * A barra da cena — UMA linha, desde o lote 4 (item 15).
 *
 * Ela tinha três linhas em 1440×900 e a cena ficava com 32% da janela. O
 * desenho é o que se olha o dia inteiro; a barra é o que se aperta de vez em
 * quando. O que saiu, e para onde foi, está escrito em
 * `ui/toolbar-model.ts`, em `MOVED_OUT_OF_TOOLBAR`.
 *
 * **Ícone com dica, nunca ícone sozinho.** Todo botão carrega `title` e
 * `aria-label` com o nome por extenso e a tecla, e quem prefere a palavra na
 * tela liga em Editar → Preferências. Um ícone sem nome é uma adivinhação.
 */
/**
 * A barra de ações, acima da cena — lote 17, rodada 3.
 *
 * *"Observe que não temos isso"*, disse o Humberto apontando para os quatro
 * botões em texto laranja do Spriter. A barra passa a ser **uma linha só**,
 * na ordem dele: arquivo · editar · ferramentas · eixos · ver e travar.
 *
 * A LISTA está em `ui/action-bar-model.ts`, como dado, e um teste sem
 * navegador confere que todo botão aponta para uma ação que existe. Aqui só
 * se desenha, e todo clique cai em `runAction` — a MESMA porta do menu e da
 * tecla.
 */
export function buildToolbar(panel: ViewportPanel, doc: EditorDoc): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'viewport-toolbar';
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'Barra de ações');

  panel.toolButtons.clear();
  panel.lockButtons.clear();
  panel.barButtons.clear();
  for (const forget of panel.forgetToolActions) forget();
  panel.forgetToolActions = [];

  // A barra é construída com TODAS as ferramentas, e nenhuma some por modo
  // (degrau 4a, 17/09/2026).
  for (const group of actionBarGroups(getTools())) {
    if (group.id === 'eixos') {
      bar.appendChild(panel.buildSpaceGroup());
      continue;
    }
    bar.appendChild(panel.buildBarGroup(group, doc));
  }
  bar.appendChild(buildParticleGroup(panel));
  // O "Mais ▾" no fim — chat P, P48. A barra refaz a conta quando a janela
  // muda de largura; a troca de ferramenta e a preferência chamam `fitMore`.
  bar.appendChild(buildMoreGroup());
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => fitMore(bar)).observe(bar);

  panel.syncToolButtons();
  panel.syncSpaceButtons();
  panel.syncLockButtons();
  panel.syncToolNames();
  panel.syncEditButtons();
  return bar;
}

// -- o "Mais ▾" — rodada final, chat P, lote 3a (L16, I-O3), decisão P48 ----

/*
 * A barra não rola mais de lado: o que não cabe SAI da barra e entra no menu do
 * "Mais ▾", no fim dela, na mesma ordem. A conta de quem sai é `fitBar`, pura,
 * em `ui/action-bar-model.ts`; aqui só se mede e se esconde. A ferramenta
 * escolhida, Partículas e os eixos nunca saem.
 *
 * O botão escondido continua no DOM: a linha do menu chama `click()` nele, e
 * assim a barra e o menu passam pela MESMA porta (`runAction`), com a mesma
 * dica e o mesmo cinza.
 */
function buildMoreGroup(): HTMLElement {
  const box = document.createElement('div');
  box.className = 'viewport-grupo viewport-grupo-mais';
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', MORE_HINT);
  box.hidden = true;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'viewport-button viewport-acao viewport-mais mostra-nome';
  button.title = MORE_HINT;
  button.setAttribute('aria-label', MORE_HINT);
  button.setAttribute('aria-haspopup', 'menu');
  const glyph = document.createElement('span');
  glyph.className = 'viewport-button-icone';
  if (!paintIcon(glyph, 'more')) glyph.textContent = '…';
  const name = document.createElement('span');
  name.className = 'viewport-button-label';
  name.textContent = MORE_LABEL;
  button.append(glyph, name);

  button.addEventListener('click', () => {
    const bar = button.closest('.viewport-toolbar');
    if (bar === null) return;
    const box = button.getBoundingClientRect();
    const hidden = [...bar.querySelectorAll<HTMLButtonElement>('button[data-no-mais]')];
    openFloatingMenu(box.left, box.bottom + 2, hidden.map((item) => ({
      label: moreItemLabel(item),
      hint: item.title,
      enabled: !item.disabled,
      run: () => { item.click(); },
    })));
  });
  box.appendChild(button);
  return box;
}

/** O nome da linha do menu: a palavra do botão, e ✓ no interruptor ligado. */
function moreItemLabel(button: HTMLButtonElement): string {
  const word = button.querySelector('.viewport-button-label')?.textContent ?? button.textContent ?? '';
  return button.getAttribute('aria-pressed') === 'true' ? `✓ ${word.trim()}` : word.trim();
}

/** Os pedaços da barra na ordem dela: cada botão, e os blocos que não se partem. */
function barUnits(bar: HTMLElement): Array<{ id: string; el: HTMLElement }> {
  const out: Array<{ id: string; el: HTMLElement }> = [];
  for (const child of bar.children) {
    if (!(child instanceof HTMLElement) || child.classList.contains('viewport-grupo-mais')) continue;
    if (child.classList.contains('viewport-espaco')) { out.push({ id: 'eixos', el: child }); continue; }
    if (child.classList.contains('viewport-grupo-particulas')) { out.push({ id: 'particulas', el: child }); continue; }
    for (const button of child.querySelectorAll<HTMLElement>('button[data-acao]')) {
      out.push({ id: button.dataset['acao'] ?? '', el: button });
    }
  }
  return out;
}

/** Refaz a conta: tudo à vista, mede, e manda para o "Mais ▾" o que não cabe. */
export function fitMore(bar: HTMLElement): void {
  const more = bar.querySelector<HTMLElement>('.viewport-grupo-mais');
  if (more === null) return;
  for (const button of bar.querySelectorAll<HTMLElement>('[data-no-mais]')) {
    button.hidden = false;
    delete button.dataset['noMais'];
  }
  for (const group of bar.querySelectorAll<HTMLElement>('.viewport-grupo')) group.hidden = false;
  more.hidden = true;
  // Fora da tela (ainda não montada) a largura é zero: nada a decidir.
  if (bar.clientWidth === 0 || bar.scrollWidth <= bar.clientWidth) return;

  more.hidden = false;
  const keep = new Set([...NEVER_IN_MORE, getActiveToolId() ?? '']);
  // Duas voltas no máximo: a primeira acerta quase sempre; a segunda pega o
  // pixel de arredondamento de um grupo que ficou com um botão só.
  for (let volta = 0; volta < 3 && bar.scrollWidth > bar.clientWidth; volta++) {
    const units = barUnits(bar).filter((unit) => !unit.el.hidden);
    const slots: BarSlot[] = units.map((unit) => ({ id: unit.id, width: unit.el.offsetWidth + 2 }));
    const total = slots.reduce((sum, slot) => sum + slot.width, 0);
    const fit = fitBar(slots, total - (bar.scrollWidth - bar.clientWidth), 0, keep);
    if (fit.more.length === 0) break;
    for (const unit of units) {
      if (!fit.more.includes(unit.id)) continue;
      unit.el.hidden = true;
      unit.el.dataset['noMais'] = '1';
    }
    // O grupo que ficou sem botão à vista some junto, com o traço dele.
    for (const group of bar.querySelectorAll<HTMLElement>('.viewport-grupo')) {
      if (group === more) continue;
      const buttons = [...group.querySelectorAll<HTMLElement>('button[data-acao]')];
      if (buttons.length > 0 && buttons.every((button) => button.hidden)) group.hidden = true;
    }
  }
}

/** A barra onde moram os botões deste painel, ou `null` antes de montar. */
function barOf(panel: ViewportPanel): HTMLElement | null {
  for (const button of panel.barButtons.values()) {
    const bar = button.closest<HTMLElement>('.viewport-toolbar');
    if (bar !== null) return bar;
  }
  return null;
}

/** Um grupo da barra: os botões, e o traço fino que o separa do vizinho. */
export function buildBarGroup(panel: ViewportPanel, group: ActionBarGroup, doc: EditorDoc): HTMLElement {
  const box = document.createElement('div');
  box.className = `viewport-grupo viewport-grupo-${group.id}`;
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', group.label);

  for (const item of group.items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.title = item.hint;
    button.setAttribute('aria-label', item.hint);
    button.dataset['acao'] = item.id;

    if (item.style === 'text-toggle') {
      // Os quatro de ver e travar: PALAVRA, e fundo laranja quando ligados.
      // É assim no Spriter, e é assim que o Humberto os reconhece.
      button.className = 'viewport-button viewport-interruptor';
      button.textContent = item.label;
      button.setAttribute('aria-pressed', 'false');
      panel.lockButtons.set(item.id, button);
    } else {
      button.className = group.id === 'ferramentas'
        ? 'viewport-button viewport-ferramenta'
        : 'viewport-button viewport-acao';
      const glyph = document.createElement('span');
      glyph.className = 'viewport-button-icone';
      if (!paintIcon(glyph, item.icon)) glyph.textContent = item.label.slice(0, 1);
      button.appendChild(glyph);
      // A palavra fica no DOM sempre e some pelo estilo: assim ligar e
      // desligar a preferência não remonta a barra, e o leitor de tela
      // continua achando o nome ali mesmo quando a palavra não é desenhada.
      const name = document.createElement('span');
      name.className = 'viewport-button-label';
      name.textContent = item.label;
      button.appendChild(name);
    }

    if (group.id === 'ferramentas') {
      button.dataset['tool'] = item.id;
      panel.toolButtons.set(item.id, button);
      // A ferramenta vira uma AÇÃO do registro, com o mesmo id que a barra
      // usa: o botão, a tecla e a paleta de comandos passam pela mesma porta.
      panel.forgetToolActions.push(registerAction(item.actionId, {
        run: () => setActiveTool(item.id, doc),
        checked: () => getActiveToolId() === item.id,
      }));
    }
    panel.barButtons.set(item.id, button);
    button.addEventListener('click', () => runAction(item.actionId));
    box.appendChild(button);
  }
  return box;
}

/**
 * **Partículas** — o botão que se acha. Rodada final, Ficha B, lote 1 (28/09/2026).
 *
 * 🗣️ *"Partícula. Eu não sei onde é que acha partícula nesse programa."* A
 * porta existia desde a v21.9, no `Novo ▾` da Árvore e em `Esqueleto → Novo`,
 * no meio de outras oito linhas. Unity e Cocos põem a partícula numa categoria
 * própria, "Effects"; o GDX Particle Editor tem o botão **Template** com os
 * efeitos prontos (a referência: `documentos/pesquisa/nova pesquisa/REFERENCIA
 * particulas 2026-09-28.md`). Aqui a categoria é um botão à vista, no fim da
 * barra, e o menu dele é o Template: o emissor vazio e os quatro prontos.
 *
 * **Fora da lista de `ui/action-bar-model.ts` de propósito.** Aquela lista é
 * de ações dos menus, uma por id, e a tabela de ações é contada. Este botão
 * não é uma ação: é um menu, e cada linha dele chama a MESMA porta que o menu
 * Esqueleto (`novo-emissor`) ou o comando do modelo. Nenhum id novo.
 */
export function buildParticleGroup(panel: ViewportPanel): HTMLElement {
  const box = document.createElement('div');
  box.className = 'viewport-grupo viewport-grupo-particulas';
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Partículas');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'viewport-button viewport-acao';
  button.title = PARTICLE_BUTTON_HINT;
  button.setAttribute('aria-label', PARTICLE_BUTTON_HINT);
  button.setAttribute('aria-haspopup', 'menu');
  button.dataset['acao'] = 'particulas';
  const glyph = document.createElement('span');
  glyph.className = 'viewport-button-icone';
  if (!paintIcon(glyph, 'particle')) glyph.textContent = 'P';
  const name = document.createElement('span');
  name.className = 'viewport-button-label';
  name.textContent = 'Partículas';
  button.append(glyph, name);

  button.addEventListener('click', () => {
    const box = button.getBoundingClientRect();
    openFloatingMenu(box.left, box.bottom + 2, particleMenuItems().map((item) => ({
      label: item.label,
      hint: item.hint,
      run: () => { runAction(item.action); },
    })));
  });
  // Os quatro modelos viram AÇÕES (decisão P5): o mesmo id aqui, no menu
  // Animação → Efeitos de chave e na busca de comandos. A cena está sempre
  // montada, e é por isso que a barra os registra (`where: 'painel'`).
  for (const preset of PARTICLE_PRESETS) {
    panel.forgetToolActions.push(registerAction(presetActionId(preset), {
      run: () => {
        const doc = panel.doc;
        if (doc !== null) addPresetEmitter(doc, preset);
      },
    }));
  }
  // Entra na lista da barra para a preferência "nome ao lado do ícone" valer
  // para ele também (`syncToolNames`).
  panel.barButtons.set('particulas', button);
  box.appendChild(button);
  return box;
}

/**
 * Desfazer, Refazer e Colar ficam cinza quando não há o que fazer.
 *
 * Um botão que não faz nada e não diz por quê é um botão que se aprende a
 * ignorar. Aqui a dica muda junto: "nada a desfazer" é uma frase, e não um
 * cinza mudo.
 */
export function syncEditButtons(panel: ViewportPanel): void {
  const doc = panel.doc;
  if (doc === null) return;
  const cinza = (id: string, ligado: boolean, porque: string, normal: string): void => {
    const button = panel.barButtons.get(id);
    if (button === undefined) return;
    button.disabled = !ligado;
    const dica = ligado ? normal : porque;
    button.title = dica;
    button.setAttribute('aria-label', dica);
  };
  const desfazer = doc.canUndo && doc.undoLabel !== null
    ? `Desfazer ${doc.undoLabel} (Ctrl+Z)` : 'Desfazer (Ctrl+Z)';
  const refazer = doc.canRedo && doc.redoLabel !== null
    ? `Refazer ${doc.redoLabel} (Ctrl+Y)` : 'Refazer (Ctrl+Y)';
  // A tecla fica na dica também com o botão cinza — decisão P38: o botão
  // apagado ensina a tecla do mesmo jeito que o aceso.
  cinza('desfazer', doc.canUndo, 'Desfazer (Ctrl+Z): não há passo nenhum para trás', desfazer);
  cinza('refazer', doc.canRedo, 'Refazer (Ctrl+Y): não há passo nenhum para a frente', refazer);
}

/*
 * `syncToolModes` saiu no degrau 4a (17/09/2026): esconder a ferramenta
 * conforme o modo era o freio — M4, *"nenhuma ferramenta some ao animar"*.
 */

/** Mostra ou esconde a palavra ao lado do ícone, conforme a preferência. */
export function syncToolNames(panel: ViewportPanel): void {
  const on = prefs().toolNames;
  const active = getActiveToolId();
  // Vale para a barra inteira desde o lote 17, e não só para as ferramentas:
  // Novo, Abrir, Salvar, Desfazer e os outros também são ícone com dica.
  for (const [id, button] of panel.barButtons) {
    const tool = panel.toolButtons.get(id) === button;
    button.classList.toggle('mostra-nome', wordOnBar(id, tool ? active : '', on));
  }
  // A palavra "Eixos" acompanha a mesma preferência — lote 23.
  panel.root?.querySelector('.viewport-toolbar')?.classList.toggle('mostra-nome', on);
  // Palavra a mais ou a menos muda a largura: o "Mais ▾" refaz a conta (P48).
  const bar = barOf(panel);
  if (bar !== null) fitMore(bar);
}

/**
 * A dica de cada ferramenta com a tecla que vale AGORA — degrau 11, lote 2.
 * Chamada quando a tabela de troca muda (`ui/key-swaps.ts`): a barra não é
 * remontada, só a frase da dica.
 */
export function syncToolKeys(panel: ViewportPanel): void {
  for (const item of toolbarItems(getTools())) {
    const button = panel.toolButtons.get(item.id);
    if (button === undefined) continue;
    button.title = item.hint;
    button.setAttribute('aria-label', item.hint);
  }
}

/*
 * O grupo dos dois cadeados saiu no lote 17.
 *
 * Ele era "Travar ossos" e "Travar desenhos" em ícone, no fim da barra. Os
 * dois viraram dois dos QUATRO botões de texto de "ver e travar" — o pedido
 * do Humberto, com a tela do Spriter aberta: *"observe que não temos isso"*.
 * A lista dos quatro está em `ui/action-bar-model.ts`, e quem os desenha é o
 * `buildBarGroup` acima. Escrito aqui para ninguém recriar o grupo antigo.
 */

/**
 * Acende os quatro de ver e travar — lote 17.
 *
 * Laranja quando ligado, cinza quando não. `aria-pressed` acompanha, para
 * quem lê com leitor de tela receber o mesmo que quem vê a cor: cor sozinha
 * nunca é informação.
 */
export function syncLockButtons(panel: ViewportPanel): void {
  const view = viewSettings() as unknown as Record<string, boolean>;
  for (const [id, button] of panel.lockButtons) {
    const active = view[SEE_LOCK_KEYS[id] ?? ''] === true;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  }
}

/**
 * "Eixos: Local · Pai · Mundo" — requisito R7, agora numa LISTA.
 *
 * Eram três botões, e três botões com palavra são a largura de meia barra
 * para uma escolha entre três. A lista mostra a palavra escolhida o tempo
 * todo — que era o motivo de não ser um menu — e ocupa o espaço de um botão
 * só. Continua sem ícone: aqui a palavra é a informação.
 */
export function buildSpaceGroup(panel: ViewportPanel): HTMLElement {
  const group = document.createElement('div');
  group.className = 'viewport-espaco';

  const title = document.createElement('label');
  title.className = 'viewport-grupo-titulo';
  title.htmlFor = 'viewport-eixos';
  title.textContent = 'Eixos';
  group.appendChild(title);

  const pick = document.createElement('select');
  pick.id = 'viewport-eixos';
  pick.className = 'viewport-lista';
  // A palavra "Eixos" ao lado some no lote 23; a lista já mostra a escolha.
  // O nome inteiro fica aqui, e no `aria-label`, para ninguém ficar sem ele.
  pick.title = 'Eixos: em que eixos as alças de Mover, Girar e Escalar trabalham';
  pick.setAttribute('aria-label', pick.title);
  for (const entry of HANDLE_SPACES) {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.label;
    option.title = entry.hint;
    pick.append(option);
  }
  pick.addEventListener('change', () => setHandleSpace(pick.value as HandleSpace));
  panel.spacePick = pick;
  panel.spaceButtons.clear();
  group.appendChild(pick);
  return group;
}

/*
 * As três caixas de "Compensar" saíram da barra no lote 4 (item 15).
 *
 * Elas ocupavam meia barra o tempo todo, com frase inteira em cada uma, para
 * três interruptores que só querem dizer alguma coisa com Mover, Girar ou
 * Escalar ativa. Foram para o painel Propriedades, que aparece justamente ao
 * lado do que está sendo editado, e lá só aparecem nessas três ferramentas.
 * Continuam ligadas ao mesmo `setCompensation`, e continuam no menu Esqueleto.
 */

export function syncSpaceButtons(panel: ViewportPanel): void {
  const current = getHandleSpace();
  if (panel.spacePick !== null && panel.spacePick.value !== current) {
    panel.spacePick.value = current;
  }
}

export function syncToolButtons(panel: ViewportPanel): void {
  const on = prefs().toolNames;
  for (const [id, button] of panel.toolButtons) {
    const active = id === getActiveToolId();
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    // P38: a escolhida mostra o nome; as outras voltam ao ícone.
    button.classList.toggle('mostra-nome', wordOnBar(id, active ? id : '', on));
  }
  // A escolhida nunca fica no "Mais ▾", e a palavra dela muda a largura (P48).
  const bar = barOf(panel);
  if (bar !== null) fitMore(bar);
}

export function zoomFromButton(panel: ViewportPanel, steps: number): void {
  panel.camera.zoomBySteps(panel.camera.width / 2, panel.camera.height / 2, steps);
  panel.cameraChanged();
}

/** Hands the new view to the document, so saving remembers it. */
export function cameraChanged(panel: ViewportPanel): void {
  const doc = panel.doc as (EditorDoc & DocWithCamera) | null;
  if (doc !== null && 'camera' in doc) doc.camera = panel.camera.toState();
  panel.showZoom();
  panel.needsDraw = true;
}

/** Frames the whole skeleton, or goes back to the default view. */
export function fitToScreen(panel: ViewportPanel): void {
  const skeleton = panel.doc?.skeleton ?? null;
  if (skeleton === null) {
    panel.camera.reset();
  } else {
    const bounds = skeleton.getBounds();
    if (bounds.width > 1e-6 || bounds.height > 1e-6) panel.camera.fit(bounds, 0.08);
    else panel.camera.reset();
  }
  panel.cameraChanged();
}
