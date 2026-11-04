/**
 * O `el` do programa inteiro — lote A4, plano arrumação (v10.7).
 *
 * Havia seis cópias (`shell`, `dialog`, `pivot-dialog`, `export-skin`,
 * `import-psd` e `panels/dom`), em duas formas: com a classe e o texto, ou com
 * um objeto de atributos e os filhos. Esta aceita as duas, e faz em cada uma
 * exatamente o que a cópia fazia.
 *
 * Não importa nada, e por isso qualquer parte pode importá-la — até o `io/`,
 * que desenha as janelas de exportar. É a exceção escrita em `contract.ts`.
 */

/** Atributos de um elemento. `class` e `text` são especiais; `false` não entra. */
export type Attributes = Record<string, string | number | boolean>;

/**
 * Cria um elemento.
 *
 * - `el('div', 'classe', 'texto')`: a classe e o texto;
 * - `el('div', { class: 'x', title: 'y' }, [filho, 'texto'])`: atributos e filhos.
 */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classOrAttributes?: string | Attributes,
  textOrChildren?: string | Array<Node | string>,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (typeof classOrAttributes === 'string') {
    node.className = classOrAttributes;
  } else if (classOrAttributes !== undefined) {
    for (const [name, value] of Object.entries(classOrAttributes)) {
      if (value === false) continue;
      if (name === 'class') node.className = String(value);
      else if (name === 'text') node.textContent = String(value);
      else node.setAttribute(name, String(value));
    }
  }
  if (typeof textOrChildren === 'string') node.textContent = textOrChildren;
  else if (textOrChildren !== undefined) node.append(...textOrChildren);
  return node;
}
