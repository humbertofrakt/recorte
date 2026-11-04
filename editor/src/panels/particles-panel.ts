/**
 * **O painel Partículas** — rodada 15, linha 5 (04/10/2026).
 *
 * O emissor morava na Árvore, como um slot `<osso>_particulas` entre as
 * imagens, e o Humberto não o achou. As decisões (`02`, seção 4): *partículas
 * com menu próprio*. Este é o lugar delas:
 *
 * | Botão | Faz |
 * |:---|:---|
 * | **Novo ▾** | o emissor vazio, ou um dos quatro modelos — o MESMO menu do botão Partículas da cena |
 * | **Duplicar** | copia o emissor escolhido, com **semente nova** (§9.9) |
 * | **Apagar** | apaga o emissor escolhido |
 *
 * E a lista: um emissor por linha, com o osso dele e o aviso curto. Clicar na
 * linha escolhe o emissor, e Propriedades abre na ficha dele — o mesmo que
 * clicar na marca da cena.
 *
 * **Nada aqui faz conta.** A lista é do `particles-model.ts`; criar, duplicar e
 * apagar são as ações de sempre (`novo-emissor`, `particulas-*`, `duplicar`,
 * `apagar`), as mesmas do menu e da Árvore. Uma função, um dono.
 */

import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { registerPanel } from '../contract.js';
import { isParticleAttachment } from '../../../runtime/src/index.js';
import { actionState, runAction } from '../ui/actions.js';
import { openFloatingMenu } from '../ui/floating-menu.js';
import { paintIcon } from '../ui/icons.js';
import { emitterProblem } from '../viewport/particles-view.js';
import { clear, el } from './dom.js';
import { particleMenuItems } from './particle-presets.js';
import { EMPTY_LIST_TEXT, emitterRows, selectionForRow, type EmitterRow } from './particles-model.js';
import { corpoDe } from '../contract.js';

class ParticlesPanel implements Panel {
  readonly id = 'particulas';
  readonly title = 'Partículas';
  readonly listensTo = ['file', 'structure', 'selection', 'assets'] as const;

  private doc: EditorDoc | null = null;
  private list: HTMLElement | null = null;
  private duplicar: HTMLButtonElement | null = null;
  private apagar: HTMLButtonElement | null = null;

  mount(doc: EditorDoc, host: HTMLElement): void {
    this.doc = doc;
    clear(host);
    host.classList.add('painel', 'particulas');

    const barra = el('div', 'painel-barra particulas-barra');
    barra.append(this.newButton(), this.duplicateButton(), this.deleteButton());

    const corpo = el('div', 'painel-corpo particulas-corpo');
    // A lista cresce com o arquivo e pode rolar: a prova de medição lê a marca.
    corpo.dataset.rolagem = 'lista';
    const lista = el('div', 'particulas-lista');
    lista.setAttribute('role', 'list');
    corpo.append(lista);
    this.list = lista;
    host.append(barra, corpo);
    this.render();
  }

  refresh(_change: DocChange): void {
    this.render();
  }

  unmount(): void {
    this.doc = null;
    this.list = null;
    this.duplicar = null;
    this.apagar = null;
  }

  /** O **Novo ▾**: o ícone das partículas, a palavra e a seta. */
  private newButton(): HTMLElement {
    const botao = el('button', 'painel-botao painel-botao-icone particulas-novo') as HTMLButtonElement;
    botao.type = 'button';
    const icone = el('span', 'painel-botao-icone');
    if (!paintIcon(icone, 'particle', 18)) icone.textContent = '✦';
    const seta = el('span', 'painel-botao-seta');
    if (!paintIcon(seta, 'chevron-down', 14)) seta.textContent = '▾';
    botao.append(icone, el('span', 'painel-botao-nome', 'Novo'), seta);
    botao.title = 'Novo emissor: vazio, ou pronto — fogo, fumaça, faísca, poeira. Nasce no osso escolhido, ou no do meio da cena';
    botao.setAttribute('aria-label', botao.title);
    botao.setAttribute('aria-haspopup', 'menu');
    botao.addEventListener('click', () => {
      const box = botao.getBoundingClientRect();
      openFloatingMenu(box.left, box.bottom + 2, particleMenuItems().map((item) => ({
        label: item.label,
        hint: item.hint,
        run: () => { runAction(item.action); },
      })));
    });
    return botao;
  }

  private iconButton(icon: string, fallback: string, hint: string, action: string): HTMLButtonElement {
    const botao = el('button', 'painel-botao painel-botao-icone') as HTMLButtonElement;
    botao.type = 'button';
    const icone = el('span', 'painel-botao-icone');
    if (!paintIcon(icone, icon, 18)) icone.textContent = fallback;
    botao.append(icone);
    botao.title = hint;
    botao.setAttribute('aria-label', hint);
    botao.addEventListener('click', () => { runAction(action); });
    return botao;
  }

  private duplicateButton(): HTMLButtonElement {
    this.duplicar = this.iconButton('duplicate', '⧉', 'Duplicar o emissor escolhido, com semente nova: as duas fogueiras não saem iguais', 'duplicar');
    // Duplicar deixa escolhido o SLOT novo (é o gesto da Árvore); aqui quem
    // duplicou um emissor quer o emissor novo, com a ficha dele aberta.
    this.duplicar.addEventListener('click', () => {
      const doc = this.doc;
      if (doc === null) return;
      const sel = doc.selection;
      if (sel.attachments.length > 0 || sel.slots.length !== 1) return;
      const row = emitterRows(corpoDe(doc).file, sel).find((r) => r.slot === sel.slots[0]);
      if (row !== undefined) doc.select(selectionForRow(row));
    });
    return this.duplicar;
  }

  private deleteButton(): HTMLButtonElement {
    this.apagar = this.iconButton('trash', '✕', 'Apagar o emissor escolhido', 'apagar');
    return this.apagar;
  }

  private render(): void {
    const doc = this.doc;
    const list = this.list;
    if (doc === null || list === null) return;
    const file = corpoDe(doc).file;
    const rows = emitterRows(file, doc.selection, this.shorts(doc));
    clear(list);
    if (rows.length === 0) list.append(el('p', 'particulas-vazio', EMPTY_LIST_TEXT));
    for (const row of rows) list.append(this.buildRow(doc, row));
    const temEmissor = rows.some((row) => row.selected);
    if (this.duplicar !== null) this.duplicar.disabled = !temEmissor || !actionState('duplicar').enabled;
    if (this.apagar !== null) this.apagar.disabled = !temEmissor || !actionState('apagar').enabled;
  }

  /** O aviso curto de cada emissor, pelo esqueleto posado (o mesmo da marca na cena). */
  private shorts(doc: EditorDoc): Map<string, string | null> {
    const out = new Map<string, string | null>();
    const sk = doc.skeleton;
    if (sk === null) return out;
    for (const slot of sk.slots) {
      const att = slot.attachment;
      if (att === null || !isParticleAttachment(att)) continue;
      out.set(`${slot.data.name}/${att.name}`, emitterProblem(att, sk)?.short ?? null);
    }
    return out;
  }

  private buildRow(doc: EditorDoc, row: EmitterRow): HTMLElement {
    const node = el('button', `particulas-linha${row.selected ? ' particulas-escolhida' : ''}`) as HTMLButtonElement;
    node.type = 'button';
    node.setAttribute('role', 'listitem');
    const icone = el('span', 'particulas-icone');
    if (!paintIcon(icone, 'particle', 16)) icone.textContent = '✦';
    // O nome que se lê é o do SLOT: é ele que a Árvore e a Ordem mostram, e é
    // o que muda ao duplicar (o anexo da cópia guarda o nome do original).
    node.append(icone, el('span', 'particulas-nome', row.slot), el('span', 'particulas-osso', `osso ${row.bone}`));
    if (row.short !== null) node.append(el('span', 'particulas-aviso', row.short));
    const dica = `${row.slot}, no osso ${row.bone}${row.short === null ? '' : ` — ${row.short}`}. Clique para escolher: a ficha abre em Propriedades`;
    node.title = dica;
    node.setAttribute('aria-label', dica);
    if (row.selected) node.setAttribute('aria-current', 'true');
    node.addEventListener('click', () => {
      doc.select(selectionForRow(row));
      doc.notice(`Emissor ${row.slot} escolhido. A ficha está em Propriedades`);
    });
    return node;
  }
}

export const particlesPanel = new ParticlesPanel();
registerPanel(particlesPanel);
