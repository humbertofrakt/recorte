/**
 * O menu do botão direito, um só para o programa inteiro (dono A) — lote 60.
 *
 * Até aqui havia duas cópias quase iguais: a da Árvore (`tree.ts`) e a da aba
 * Imagens (`palette.ts`), cada uma com o seu `arvore-menu`, o seu "fecha ao
 * clicar fora" e nenhuma das duas fechando no `Esc`. O lote 60 pediu um
 * terceiro — o botão direito no desenho, na cena —, e três cópias é quando
 * vira uma.
 *
 * Fecha no `Esc`, no clique fora e depois do clique num item. As setas andam
 * entre os itens. A tecla é tratada **uma vez**: quem tratou para ali.
 */

/** Um item do menu. Cinza (`enabled: false`) continua com a dica dizendo por quê. */
export interface FloatingItem {
  label: string;
  hint: string;
  run: () => void;
  enabled?: boolean;
}

/** O que uma tecla faz com o menu aberto. Puro, para o teste sem navegador. */
export type FloatingKey = 'fechar' | 'descer' | 'subir' | null;

export function floatingMenuKey(key: string): FloatingKey {
  if (key === 'Escape') return 'fechar';
  if (key === 'ArrowDown') return 'descer';
  if (key === 'ArrowUp') return 'subir';
  return null;
}

let current: { menu: HTMLElement; close: () => void } | null = null;

/** Fecha o menu que estiver aberto. Sem menu, nada. */
export function closeFloatingMenu(): void {
  current?.close();
}

/** `true` enquanto há um menu aberto. */
export function isFloatingMenuOpen(): boolean {
  return current !== null;
}

/**
 * Abre o menu em `x, y` (pixels da janela), no lugar do que estiver aberto.
 * Ele não sai da janela: perto da borda, abre para o outro lado.
 */
export function openFloatingMenu(
  x: number, y: number, items: readonly FloatingItem[], extraClass = '',
): HTMLElement {
  closeFloatingMenu();
  const menu = document.createElement('div');
  menu.className = extraClass === '' ? 'menu-flutuante' : `menu-flutuante ${extraClass}`;
  menu.setAttribute('role', 'menu');
  menu.style.left = `${Math.round(x)}px`;
  menu.style.top = `${Math.round(y)}px`;

  const buttons: HTMLButtonElement[] = [];
  for (const item of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu-flutuante-item';
    button.textContent = item.label;
    button.title = item.hint;
    button.setAttribute('role', 'menuitem');
    const enabled = item.enabled !== false;
    if (!enabled) {
      // `aria-disabled`, e não `disabled`: o botão desligado some da dica em
      // alguns navegadores, e a dica é o que diz por que ele está cinza.
      button.setAttribute('aria-disabled', 'true');
      button.classList.add('menu-flutuante-cinza');
    }
    button.addEventListener('click', () => {
      if (!enabled) return;
      close();
      item.run();
    });
    menu.append(button);
    buttons.push(button);
  }

  const onKey = (event: KeyboardEvent): void => {
    const what = floatingMenuKey(event.key);
    if (what === null) return;
    event.preventDefault();
    event.stopPropagation();
    if (what === 'fechar') {
      close();
      return;
    }
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const step = what === 'descer' ? 1 : -1;
    const next = buttons[(at + step + buttons.length) % buttons.length];
    next?.focus();
  };
  const onOutside = (event: PointerEvent): void => {
    if (menu.contains(event.target as Node)) return;
    close();
  };
  function close(): void {
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('pointerdown', onOutside, true);
    menu.remove();
    if (current?.menu === menu) current = null;
  }

  window.addEventListener('keydown', onKey, true);
  window.addEventListener('pointerdown', onOutside, true);
  document.body.append(menu);
  // Perto da borda de baixo ou da direita, abre para o outro lado.
  const box = menu.getBoundingClientRect();
  if (box.right > window.innerWidth) menu.style.left = `${Math.max(0, Math.round(x - box.width))}px`;
  if (box.bottom > window.innerHeight) menu.style.top = `${Math.max(0, Math.round(y - box.height))}px`;
  current = { menu, close };
  buttons.find((button) => button.getAttribute('aria-disabled') !== 'true')?.focus();
  return menu;
}
