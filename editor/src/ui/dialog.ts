/**
 * One plain window for messages the user has to read (owner A).
 *
 * An import brings back a list of things that did not survive the conversion.
 * That list belongs on screen, whole and readable, not squeezed into the status
 * bar and not in a `window.alert` that runs the lines together.
 *
 * Written for a reader with dyslexia: a title in words, one warning per line
 * with room around it, no icon without a label, and a single button that says
 * what it does. `Esc` and a click outside close it too.
 */

import './dialog.css';
// O `el` é um só, em `ui/dom.ts`, desde o lote A4.
import { el } from './dom.js';

export interface MessageDialogOptions {
  /** Words at the top. Short. */
  title: string;
  /** One or two lines under the title, before the list. */
  lead?: string;
  /** One line each, in the order they should be read. */
  lines?: readonly string[];
  /** Label of the closing button. Default `Fechar`. */
  closeLabel?: string;
  /** Where to put it. Default: the document body. */
  host?: HTMLElement;
}

/** What `showMessage` gives back, so a test can close the window itself. */
export interface OpenDialog {
  root: HTMLElement;
  close(): void;
  /** Resolves when the window closes. */
  closed: Promise<void>;
}

/**
 * Shows the window and returns right away. Await `closed` to wait for the user.
 *
 * More than {@link LIST_LIMIT} lines would turn into a wall of text nobody
 * reads, so the rest are counted in one last line instead.
 */
export const LIST_LIMIT = 40;

export function showMessage(options: MessageDialogOptions): OpenDialog {
  const host = options.host ?? document.body;
  const lines = options.lines ?? [];

  const list = el('ul', { class: 'dialog-list' });
  for (const line of lines.slice(0, LIST_LIMIT)) list.append(el('li', { text: line }));
  if (lines.length > LIST_LIMIT) {
    list.append(el('li', { class: 'dialog-more', text: `… e mais ${lines.length - LIST_LIMIT} avisos.` }));
  }

  const closeButton = el('button', {
    class: 'dialog-close', type: 'button', text: options.closeLabel ?? 'Fechar',
  }) as HTMLButtonElement;

  const body: Node[] = [el('h2', { class: 'dialog-title', text: options.title })];
  if (options.lead !== undefined) body.push(el('p', { class: 'dialog-lead', text: options.lead }));
  if (lines.length > 0) body.push(list);
  body.push(el('div', { class: 'dialog-buttons' }, [closeButton]));

  const box = el('div', {
    class: 'dialog-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': options.title,
  }, body);
  const root = el('div', { class: 'dialog-veil' }, [box]);

  let done = (): void => {};
  const closed = new Promise<void>((resolve) => { done = resolve; });
  let open = true;

  const close = (): void => {
    if (!open) return;
    open = false;
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    done();
  };

  function onKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    close();
  }

  closeButton.addEventListener('click', close);
  root.addEventListener('pointerdown', (event) => {
    if (event.target === root) close();
  });
  document.addEventListener('keydown', onKey, true);

  host.append(root);
  closeButton.focus();
  return { root, close, closed };
}

/** Shows the window and waits for it to close. */
export async function tellUser(options: MessageDialogOptions): Promise<void> {
  await showMessage(options).closed;
}

// ---------------------------------------------------------------------------
// Uma janela de tabela
// ---------------------------------------------------------------------------

export interface TableDialogOptions {
  title: string;
  lead?: string;
  /** O nome de cada coluna. Decide quantas colunas a tabela tem. */
  head: readonly string[];
  /** Uma linha por item, na ordem de leitura. */
  rows: ReadonlyArray<readonly string[]>;
  closeLabel?: string;
  host?: HTMLElement;
}

/**
 * A mesma janela, com uma tabela no lugar da lista.
 *
 * A lista de `showMessage` serve para avisos, que são frases. A tabela de
 * atalhos são três coisas curtas por linha — menu, item, tecla — e três coisas
 * curtas numa frase só viram um borrão: alinhadas em coluna, o olho desce pela
 * coluna da tecla sem ler o resto. É por isso que esta janela existe.
 */
export function showTable(options: TableDialogOptions): OpenDialog {
  const host = options.host ?? document.body;

  const head = el('tr', { class: 'dialog-table-head' });
  for (const name of options.head) head.append(el('th', { text: name, scope: 'col' }));

  const body = el('tbody');
  for (const row of options.rows) {
    const tr = el('tr');
    for (const cell of row) tr.append(el('td', { text: cell }));
    body.append(tr);
  }

  const table = el('table', { class: 'dialog-table' }, [el('thead', {}, [head]), body]);
  const scroller = el('div', { class: 'dialog-table-box' }, [table]);

  const closeButton = el('button', {
    class: 'dialog-close', type: 'button', text: options.closeLabel ?? 'Fechar',
  }) as HTMLButtonElement;

  const inside: Node[] = [el('h2', { class: 'dialog-title', text: options.title })];
  if (options.lead !== undefined) inside.push(el('p', { class: 'dialog-lead', text: options.lead }));
  inside.push(scroller, el('div', { class: 'dialog-buttons' }, [closeButton]));

  const box = el('div', {
    class: 'dialog-box dialog-box-larga', role: 'dialog', 'aria-modal': 'true',
    'aria-label': options.title,
  }, inside);
  const root = el('div', { class: 'dialog-veil' }, [box]);

  let done = (): void => {};
  const closed = new Promise<void>((resolve) => { done = resolve; });
  let open = true;

  const close = (): void => {
    if (!open) return;
    open = false;
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    done();
  };

  function onKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    close();
  }

  closeButton.addEventListener('click', close);
  root.addEventListener('pointerdown', (event) => {
    if (event.target === root) close();
  });
  document.addEventListener('keydown', onKey, true);

  host.append(root);
  closeButton.focus();
  return { root, close, closed };
}

// ---------------------------------------------------------------------------
// Uma janela de liga-desliga
// ---------------------------------------------------------------------------

export interface OptionDef {
  id: string;
  label: string;
  /** Uma linha explicando o que a escolha muda. Aparece sob o nome. */
  hint?: string;
  checked: boolean;
}

export interface OptionsDialogOptions {
  title: string;
  lead?: string;
  options: readonly OptionDef[];
  /** Chamado na hora em que a caixa muda. Não há botão "aplicar". */
  onToggle(id: string, on: boolean): void;
  closeLabel?: string;
  host?: HTMLElement;
}

/**
 * A janela das preferências: uma caixa por escolha, e cada uma vale na hora.
 *
 * Sem "aplicar" e sem "cancelar" de propósito. São escolhas de aparência, todas
 * reversíveis com um segundo clique, e um botão "aplicar" para isso só cria a
 * dúvida de se a escolha pegou ou não.
 */
export function showOptions(options: OptionsDialogOptions): OpenDialog {
  const host = options.host ?? document.body;

  const list = el('ul', { class: 'dialog-options' });
  for (const option of options.options) {
    const box = el('input', { class: 'dialog-option-box', type: 'checkbox' }) as HTMLInputElement;
    box.checked = option.checked;
    box.addEventListener('change', () => options.onToggle(option.id, box.checked));

    const words: Node[] = [el('span', { class: 'dialog-option-nome', text: option.label })];
    if (option.hint !== undefined) {
      words.push(el('span', { class: 'dialog-option-dica', text: option.hint }));
    }
    const row = el('label', { class: 'dialog-option' }, [box, el('span', {}, words)]);
    list.append(el('li', {}, [row]));
  }

  const closeButton = el('button', {
    class: 'dialog-close', type: 'button', text: options.closeLabel ?? 'Fechar',
  }) as HTMLButtonElement;

  const body: Node[] = [el('h2', { class: 'dialog-title', text: options.title })];
  if (options.lead !== undefined) body.push(el('p', { class: 'dialog-lead', text: options.lead }));
  body.push(list, el('div', { class: 'dialog-buttons' }, [closeButton]));

  const box = el('div', {
    class: 'dialog-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': options.title,
  }, body);
  const root = el('div', { class: 'dialog-veil' }, [box]);

  let done = (): void => {};
  const closed = new Promise<void>((resolve) => { done = resolve; });
  let open = true;

  const close = (): void => {
    if (!open) return;
    open = false;
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    done();
  };

  function onKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    close();
  }

  closeButton.addEventListener('click', close);
  root.addEventListener('pointerdown', (event) => {
    if (event.target === root) close();
  });
  document.addEventListener('keydown', onKey, true);

  host.append(root);
  closeButton.focus();
  return { root, close, closed };
}

// ---------------------------------------------------------------------------
// Uma janela com campos para preencher
// ---------------------------------------------------------------------------

export interface FormFieldDef {
  id: string;
  label: string;
  hint?: string;
  value?: string;
  /** Com opções, o campo é uma lista, e não uma caixa de texto — lote 46. */
  choices?: ReadonlyArray<{ value: string; label: string }>;
}

export interface FormDialogOptions {
  title: string;
  lead?: string;
  fields: readonly FormFieldDef[];
  /** O que o botão de confirmar diz. Diga o que VAI ACONTECER, nunca "OK". */
  yesLabel: string;
  noLabel?: string;
  /**
   * Chamado a cada tecla, com o que está escrito. O texto devolvido aparece
   * abaixo dos campos — é onde se mostra o que a troca vai fazer ANTES de ela
   * acontecer.
   */
  preview?(values: Record<string, string>): string;
  /**
   * O que está errado, ou `null` — Rodada 47, lote 3 (doc 68, a nota do doc 54). Enquanto devolver texto, o
   * botão de confirmar fica cinza, a frase aparece no lugar da prévia e o Enter
   * não fecha. É a régua da janela guiada: **a janela não fecha errada**.
   */
  validate?(values: Record<string, string>): string | null;
  host?: HTMLElement;
}

/**
 * Uma janela de campos, com prévia.
 *
 * Existe para "Substituir nomes": trocar um pedaço de nome em vinte ossos de
 * uma vez é rápido e é irreversível de cabeça, então a janela mostra **quantos
 * e quais** antes de qualquer coisa acontecer. Sem a prévia, seria um botão que
 * pede fé.
 */
export function askForm(options: FormDialogOptions): Promise<Record<string, string> | null> {
  const host = options.host ?? document.body;
  const values: Record<string, string> = {};
  const inputs: Array<HTMLInputElement | HTMLSelectElement> = [];

  const list = el('div', { class: 'dialog-form' });
  for (const field of options.fields) {
    values[field.id] = field.value ?? '';
    let input: HTMLInputElement | HTMLSelectElement;
    if (field.choices !== undefined) {
      const select = el('select', { class: 'dialog-form-campo' }) as HTMLSelectElement;
      for (const choice of field.choices) {
        const option = el('option', { text: choice.label }) as HTMLOptionElement;
        option.value = choice.value;
        select.append(option);
      }
      input = select;
    } else {
      input = el('input', { class: 'dialog-form-campo', type: 'text' }) as HTMLInputElement;
    }
    input.value = values[field.id];
    input.id = `dialog-${field.id}`;
    const label = el('label', { class: 'dialog-form-rotulo', text: field.label });
    label.htmlFor = input.id;
    const row = el('div', { class: 'dialog-form-linha' }, [label, input]);
    if (field.hint !== undefined) {
      row.append(el('p', { class: 'dialog-form-dica', text: field.hint }));
    }
    inputs.push(input);
    list.append(row);
  }

  const preview = el('p', { class: 'dialog-form-previa' });
  const yes = el('button', {
    class: 'dialog-close', type: 'button', text: options.yesLabel,
  }) as HTMLButtonElement;
  let erro: string | null = null;
  const refresh = (): void => {
    for (let i = 0; i < inputs.length; i++) values[options.fields[i].id] = inputs[i].value;
    erro = options.validate?.(values) ?? null;
    yes.disabled = erro !== null;
    preview.classList.toggle('dialog-form-erro', erro !== null);
    preview.textContent = erro ?? options.preview?.(values) ?? '';
  };
  for (const input of inputs) {
    input.addEventListener('input', refresh);
    input.addEventListener('change', refresh);
  }
  refresh();

  const no = el('button', {
    class: 'dialog-close', type: 'button', text: options.noLabel ?? 'Deixar como está',
  }) as HTMLButtonElement;

  const body: Node[] = [el('h2', { class: 'dialog-title', text: options.title })];
  if (options.lead !== undefined) body.push(el('p', { class: 'dialog-lead', text: options.lead }));
  body.push(list, preview, el('div', { class: 'dialog-buttons' }, [yes, no]));

  const box = el('div', {
    class: 'dialog-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': options.title,
  }, body);
  const root = el('div', { class: 'dialog-veil' }, [box]);

  return new Promise<Record<string, string> | null>((resolve) => {
    let open = true;
    const finish = (answer: Record<string, string> | null): void => {
      if (!open) return;
      open = false;
      document.removeEventListener('keydown', onKey, true);
      root.remove();
      resolve(answer);
    };
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        finish(null);
      } else if (event.key === 'Enter' && root.contains(event.target as Node)) {
        event.preventDefault();
        refresh();
        // Rodada 47, lote 3 (doc 68, a nota do doc 54): errada, a janela fica aberta; a frase já está nela.
        if (erro !== null) return;
        finish({ ...values });
      }
    }
    yes.addEventListener('click', () => { refresh(); if (erro === null) finish({ ...values }); });
    no.addEventListener('click', () => finish(null));
    root.addEventListener('pointerdown', (event) => {
      if (event.target === root) finish(null);
    });
    document.addEventListener('keydown', onKey, true);
    host.append(root);
    inputs[0]?.focus();
  });
}

// ---------------------------------------------------------------------------
// Uma janela GUIADA: uma pergunta por linha, e ela não fecha errada
// ---------------------------------------------------------------------------

/** Uma escolha de uma lista. */
export interface GuidedOption {
  value: string;
  label: string;
}

/** Uma pergunta da janela guiada. */
export type GuidedField =
  /** Escolher UM de uma lista. */
  | {
    id: string; label: string; kind: 'escolha';
    options: readonly GuidedOption[]; value?: string; hint?: string;
  }
  /** Escolher VÁRIOS, e a ordem em que foram marcados é a ordem gravada. */
  | {
    id: string; label: string; kind: 'varios';
    options: readonly GuidedOption[]; value?: readonly string[]; hint?: string;
  }
  /** Sim ou não. */
  | { id: string; label: string; kind: 'liga'; value?: boolean; hint?: string };

export interface GuidedDialogOptions {
  title: string;
  /** Uma frase: o que esta coisa FAZ. */
  lead?: string;
  /** Uma segunda frase, mais fraca: o exemplo. */
  note?: string;
  fields: readonly GuidedField[];
  yesLabel: string;
  noLabel?: string;
  /**
   * O que está errado, ou `null`. Roda a cada mexida.
   *
   * Enquanto devolver texto, o botão de confirmar fica **cinza** e a frase
   * aparece embaixo. A janela **não fecha errada**: uma janela que fecha e
   * depois avisa no rodapé faz a pessoa refazer o caminho todo por uma palavra.
   */
  validate?(values: Record<string, string[]>): string | null;
  host?: HTMLElement;
}

/**
 * A janela de perguntas — lote 28, anotação 13.
 *
 * *"Entendi as 5 regras. Mas não sei como usar."* O que faltava não era a lista
 * de campos: era **a pergunta**. "Que ossos dobram?" é uma pergunta; `bones` é
 * um campo, e um campo só se responde sabendo a resposta de antemão.
 *
 * Desenho copiado de `spine/prints/ik_properties1.png`: rótulo à esquerda,
 * valor à direita, uma linha por pergunta.
 *
 * Devolve, por id, a **lista** de escolhas — um item nas de escolha única,
 * `['1']` ou `[]` nas de ligar, e a ordem de marcação nas de vários.
 */
export function askGuided(
  options: GuidedDialogOptions,
): Promise<Record<string, string[]> | null> {
  const host = options.host ?? document.body;
  const values: Record<string, string[]> = {};

  const list = el('div', { class: 'dialog-form' });
  const erro = el('p', { class: 'dialog-guiado-erro', role: 'alert' });
  const yes = el('button', {
    class: 'dialog-close', type: 'button', text: options.yesLabel,
  }) as HTMLButtonElement;

  const revalidate = (): void => {
    const texto = options.validate?.(values) ?? null;
    erro.textContent = texto ?? '';
    erro.hidden = texto === null;
    yes.disabled = texto !== null;
    yes.title = texto ?? options.yesLabel;
  };

  for (const field of options.fields) {
    const rotulo = el('span', { class: 'dialog-form-rotulo', text: field.label });
    const linha = el('div', { class: 'dialog-form-linha' }, [rotulo]);

    if (field.kind === 'liga') {
      values[field.id] = field.value === true ? ['1'] : [];
      const caixa = el('input', {
        class: 'dialog-guiado-liga', type: 'checkbox',
      }) as HTMLInputElement;
      caixa.checked = field.value === true;
      caixa.addEventListener('change', () => {
        values[field.id] = caixa.checked ? ['1'] : [];
        revalidate();
      });
      linha.append(caixa);
    } else if (field.kind === 'escolha') {
      values[field.id] = field.value === undefined ? [] : [field.value];
      const lista = el('select', { class: 'dialog-guiado-lista' }) as HTMLSelectElement;
      lista.append(el('option', { value: '', text: '(escolha)' }));
      for (const opcao of field.options) {
        lista.append(el('option', { value: opcao.value, text: opcao.label }));
      }
      lista.value = field.value ?? '';
      lista.addEventListener('change', () => {
        values[field.id] = lista.value === '' ? [] : [lista.value];
        revalidate();
      });
      linha.append(lista);
    } else {
      const marcados: string[] = [...(field.value ?? [])];
      values[field.id] = marcados;
      const caixas = el('div', { class: 'dialog-guiado-varios' });
      for (const opcao of field.options) {
        const caixa = el('input', {
          class: 'dialog-guiado-caixa', type: 'checkbox',
        }) as HTMLInputElement;
        caixa.checked = marcados.includes(opcao.value);
        const marca = el('label', { class: 'dialog-guiado-item' }, [
          caixa, el('span', { text: opcao.label }),
        ]);
        caixa.addEventListener('change', () => {
          const at = marcados.indexOf(opcao.value);
          if (caixa.checked && at < 0) marcados.push(opcao.value);
          else if (!caixa.checked && at >= 0) marcados.splice(at, 1);
          // A ORDEM é a de marcação, e ela é o que vai para o arquivo: numa
          // cadeia de IK a ordem é pai → filho, e trocá-la troca o que dobra.
          values[field.id] = [...marcados];
          revalidate();
        });
        caixas.append(marca);
      }
      linha.append(caixas);
    }

    if (field.hint !== undefined) {
      linha.append(el('p', { class: 'dialog-form-dica', text: field.hint }));
    }
    list.append(linha);
  }

  const no = el('button', {
    class: 'dialog-close', type: 'button', text: options.noLabel ?? 'Deixar como está',
  }) as HTMLButtonElement;

  const body: Node[] = [el('h2', { class: 'dialog-title', text: options.title })];
  if (options.lead !== undefined) body.push(el('p', { class: 'dialog-lead', text: options.lead }));
  if (options.note !== undefined) {
    body.push(el('p', { class: 'dialog-guiado-nota', text: options.note }));
  }
  body.push(list, erro, el('div', { class: 'dialog-buttons' }, [yes, no]));

  const box = el('div', {
    class: 'dialog-box dialog-guiado', role: 'dialog', 'aria-modal': 'true',
    'aria-label': options.title,
  }, body);
  const root = el('div', { class: 'dialog-veil' }, [box]);
  revalidate();

  return new Promise<Record<string, string[]> | null>((resolve) => {
    let open = true;
    const finish = (answer: Record<string, string[]> | null): void => {
      if (!open) return;
      open = false;
      document.removeEventListener('keydown', onKey, true);
      root.remove();
      resolve(answer);
    };
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        finish(null);
      }
    }
    yes.addEventListener('click', () => {
      if (yes.disabled) return;
      finish({ ...values });
    });
    no.addEventListener('click', () => finish(null));
    root.addEventListener('pointerdown', (event) => {
      if (event.target === root) finish(null);
    });
    document.addEventListener('keydown', onKey, true);
    host.append(root);
  });
}

// ---------------------------------------------------------------------------
// A question with the answer written on each button
// ---------------------------------------------------------------------------

export interface QuestionDialogOptions extends MessageDialogOptions {
  /** Label of the button that goes ahead. Say what will HAPPEN, never "OK". */
  yesLabel: string;
  /** Label of the button that backs out. Default `Deixar como está`. */
  noLabel?: string;
}

/**
 * Asks a yes-or-no question and waits for the answer.
 *
 * NÃO É `window.confirm`. O confirm do navegador escreve "OK" e "Cancelar",
 * que não dizem o que vai acontecer, corta a lista longa e não obedece ao
 * estilo do editor. Aqui cada botão carrega a frase inteira do que ele faz, a
 * lista aparece por extenso, e `Esc` ou um clique fora valem por "não".
 */
export function askUser(options: QuestionDialogOptions): Promise<boolean> {
  const host = options.host ?? document.body;
  const lines = options.lines ?? [];

  const list = el('ul', { class: 'dialog-list' });
  for (const line of lines.slice(0, LIST_LIMIT)) list.append(el('li', { text: line }));
  if (lines.length > LIST_LIMIT) {
    list.append(el('li', { class: 'dialog-more', text: `… e mais ${lines.length - LIST_LIMIT} linhas.` }));
  }

  const yes = el('button', {
    class: 'dialog-close', type: 'button', text: options.yesLabel,
  }) as HTMLButtonElement;
  const no = el('button', {
    class: 'dialog-close', type: 'button', text: options.noLabel ?? 'Deixar como está',
  }) as HTMLButtonElement;

  const body: Node[] = [el('h2', { class: 'dialog-title', text: options.title })];
  if (options.lead !== undefined) body.push(el('p', { class: 'dialog-lead', text: options.lead }));
  if (lines.length > 0) body.push(list);
  body.push(el('div', { class: 'dialog-buttons' }, [yes, no]));

  const box = el('div', {
    class: 'dialog-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': options.title,
  }, body);
  const root = el('div', { class: 'dialog-veil' }, [box]);

  return new Promise<boolean>((resolve) => {
    let open = true;
    const finish = (answer: boolean): void => {
      if (!open) return;
      open = false;
      document.removeEventListener('keydown', onKey, true);
      root.remove();
      resolve(answer);
    };

    function onKey(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      finish(false);
    }

    yes.addEventListener('click', () => finish(true));
    no.addEventListener('click', () => finish(false));
    root.addEventListener('pointerdown', (event) => {
      if (event.target === root) finish(false);
    });
    document.addEventListener('keydown', onKey, true);

    host.append(root);
    yes.focus();
  });
}

// ---------------------------------------------------------------------------
// A janela de busca: escrever e escolher — item 110
// ---------------------------------------------------------------------------

/** Uma linha da lista de busca. */
export interface PickRow {
  /** O que volta quando a linha é escolhida. */
  id: string;
  /** O nome, em negrito na linha. */
  label: string;
  /** À direita, mais fraco: de onde vem, ou a tecla. */
  aside?: string;
  /** Debaixo do nome, mais fraco ainda. */
  hint?: string;
}

export interface PickDialogOptions {
  title: string;
  /** O que aparece no campo vazio, para dizer o que se digita ali. */
  placeholder: string;
  /** Chamado a cada tecla. Devolve as linhas que casam. */
  search(text: string): readonly PickRow[];
  host?: HTMLElement;
}

/**
 * Uma caixa de busca com uma lista embaixo: digita, as setas andam, Enter
 * escolhe — item 110.
 *
 * O foco vai para o CAMPO, e não para a lista: quem abre isto veio digitar. As
 * setas são atendidas pelo campo mesmo, e por isso a lista anda sem que o dedo
 * saia das letras. `Esc` fecha e devolve `null`, e clicar fora faz o mesmo.
 *
 * A lista inteira é remontada a cada tecla. São dezenas de linhas, não
 * milhares: remontar é mais barato de ler do que um diff, e nunca deixa uma
 * linha velha na tela.
 */
export function askPick(options: PickDialogOptions): Promise<string | null> {
  const host = options.host ?? document.body;

  const field = el('input', {
    class: 'dialog-pick-campo', type: 'text', placeholder: options.placeholder,
    'aria-label': options.placeholder,
  }) as HTMLInputElement;
  const list = el('ul', { class: 'dialog-pick-lista', role: 'listbox' });
  const count = el('p', { class: 'dialog-pick-conta' });

  const box = el('div', {
    class: 'dialog-box dialog-pick', role: 'dialog', 'aria-modal': 'true',
    'aria-label': options.title,
  }, [
    el('h2', { class: 'dialog-title', text: options.title }),
    field,
    list,
    count,
  ]);
  const root = el('div', { class: 'dialog-veil' }, [box]);

  let rows: readonly PickRow[] = [];
  let cursor = 0;
  let open = true;
  let done: (value: string | null) => void = () => {};
  const answer = new Promise<string | null>((resolve) => { done = resolve; });

  const close = (value: string | null): void => {
    if (!open) return;
    open = false;
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    done(value);
  };

  function paint(): void {
    list.textContent = '';
    rows.forEach((row, index) => {
      const name = el('span', { class: 'dialog-pick-nome', text: row.label });
      const parts: Node[] = [name];
      if (row.aside !== undefined && row.aside !== '') {
        parts.push(el('span', { class: 'dialog-pick-lado', text: row.aside }));
      }
      const item = el('li', {
        class: index === cursor ? 'dialog-pick-linha is-active' : 'dialog-pick-linha',
        role: 'option', 'aria-selected': index === cursor ? 'true' : 'false',
      }, parts);
      if (row.hint !== undefined) {
        item.append(el('span', { class: 'dialog-pick-dica', text: row.hint }));
      }
      // `pointerdown` e não `click`: o clique começaria tirando o foco do
      // campo, e a janela fecha antes de o clique terminar de qualquer jeito.
      item.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        close(row.id);
      });
      list.append(item);
    });
    count.textContent = rows.length === 0
      ? 'Nada com esse nome.'
      : `${rows.length} comando(s). Setas andam, Enter escolhe.`;
  }

  function refresh(): void {
    rows = options.search(field.value);
    cursor = 0;
    paint();
  }

  function move(step: number): void {
    if (rows.length === 0) return;
    cursor = (cursor + step + rows.length) % rows.length;
    paint();
    list.children[cursor]?.scrollIntoView({ block: 'nearest' });
  }

  function onKey(event: KeyboardEvent): void {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(null); return; }
    if (event.key === 'ArrowDown') { event.preventDefault(); event.stopPropagation(); move(1); return; }
    if (event.key === 'ArrowUp') { event.preventDefault(); event.stopPropagation(); move(-1); return; }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      const row = rows[cursor];
      if (row !== undefined) close(row.id);
    }
  }

  field.addEventListener('input', refresh);
  root.addEventListener('pointerdown', (event) => {
    if (event.target === root) close(null);
  });
  document.addEventListener('keydown', onKey, true);

  host.append(root);
  refresh();
  field.focus();
  return answer;
}

// ---------------------------------------------------------------------------
// Uma escolha entre caminhos, cada um com o nome do que faz
// ---------------------------------------------------------------------------

/** Um caminho da janela: o botão, e a frase que diz o que ele vai fazer. */
export interface ChoiceOption {
  id: string;
  label: string;
  /** O que acontece ao escolher. Uma frase, sempre. */
  hint: string;
  /** `true` pinta o botão como o caminho sem volta. */
  danger?: boolean;
}

export interface ChoiceDialogOptions {
  title: string;
  lead?: string;
  options: readonly ChoiceOption[];
  /**
   * O que vale quando a janela é fechada no `Esc` ou no clique fora.
   *
   * É o campo que impede o erro do A2: fechar uma janela **nunca** pode ser o
   * mesmo que escolher o caminho sem volta. Aqui se diz qual é o caminho
   * inofensivo, por escrito.
   */
  cancelId: string;
  host?: HTMLElement;
}

/**
 * Uma escolha entre caminhos, com o nome de cada um no botão — degrau 11,
 * lote 7 (A2).
 *
 * O `confirm` do navegador dá **OK** e **Cancelar**: duas palavras que não
 * dizem o que vai acontecer, e que quem lê com dificuldade tem de traduzir
 * lendo a pergunta de novo. Aqui cada botão diz o que faz, e embaixo dele a
 * frase do que acontece.
 */
export function askChoice(options: ChoiceDialogOptions): Promise<string> {
  const host = options.host ?? document.body;
  const lista = el('div', { class: 'dialog-escolhas' });
  const botoes: HTMLButtonElement[] = [];

  const body: Node[] = [el('h2', { class: 'dialog-title', text: options.title })];
  if (options.lead !== undefined) body.push(el('p', { class: 'dialog-lead', text: options.lead }));
  body.push(lista);

  const box = el('div', {
    class: 'dialog-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': options.title,
  }, body);
  const root = el('div', { class: 'dialog-veil' }, [box]);

  return new Promise<string>((resolve) => {
    let open = true;
    const finish = (id: string): void => {
      if (!open) return;
      open = false;
      document.removeEventListener('keydown', onKey, true);
      root.remove();
      resolve(id);
    };
    function onKey(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      finish(options.cancelId);
    }
    for (const option of options.options) {
      const caixa = el('div', { class: 'dialog-escolha' });
      const botao = el('button', {
        class: option.danger === true ? 'dialog-close dialog-perigo' : 'dialog-close',
        type: 'button', text: option.label,
      }) as HTMLButtonElement;
      botao.addEventListener('click', () => finish(option.id));
      botoes.push(botao);
      caixa.append(botao, el('p', { class: 'dialog-escolha-frase', text: option.hint }));
      lista.append(caixa);
    }
    root.addEventListener('pointerdown', (event) => {
      if (event.target === root) finish(options.cancelId);
    });
    document.addEventListener('keydown', onKey, true);
    host.append(root);
    botoes[0]?.focus();
  });
}
