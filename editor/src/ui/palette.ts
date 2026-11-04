/**
 * A paleta de comandos (dono A) — item 110.
 *
 * `Ctrl+Shift+P`, digita três letras, aperta Enter. É a resposta para "eu sei
 * que existe, mas não sei em qual menu está" — e num programa com sete menus e
 * mais de cem entradas essa pergunta é a mais comum de todas.
 *
 * A busca é sobre `allMenus`, que é a MESMA lista que desenha os menus: um
 * comando novo aparece aqui no dia em que aparece lá, sem ninguém cadastrar
 * nada. E ela mostra o atalho ao lado, porque quem usa a paleta duas vezes na
 * mesma semana é quem devia estar usando a tecla.
 *
 * Sem tela nenhuma neste arquivo: `filterCommands` é uma função sobre listas.
 */

import { liveShortcut } from './keys.js';
import { isSeparator } from './menus.js';
import type { MenuEntry, MenuGroupDef, MenuItem } from './menus.js';

/** Uma linha da paleta. */
export interface Command {
  /** O nome da ação no registro. */
  action: string;
  /** O nome que se lê, como está no menu. */
  label: string;
  /** De que menu ele veio, para desempatar dois nomes parecidos. */
  menu: string;
  /** A tecla, quando tem uma. */
  shortcut: string | null;
  /**
   * **A dica do item de menu, quando ele tem uma** — 22/09/2026.
   *
   * Ela vai junto porque a busca passou a olhar para ela: quem digita
   * *"descendentes"* acha o Duplicar, e tem de **ver por quê**. Uma linha que
   * aparece sem explicação é a busca certa com o resultado inexplicável.
   */
  hint: string | null;
}

/**
 * Tira acento e maiúscula, para "cebola" achar "Casca de cebola" e "animacao"
 * achar "Animação".
 *
 * `normalize('NFD')` separa a letra do acento, e o `replace` joga o acento
 * fora. Sem isso, quem digita sem acento — que é a maioria, e é o mais rápido —
 * não acharia metade dos comandos deste programa.
 */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/**
 * Os comandos que casam com o que foi digitado.
 *
 * Cada **palavra** do que se digitou tem que aparecer em algum lugar do nome,
 * do nome do menu **ou da dica**. "cha ani" acha "Chavear" do menu Animação; a
 * ordem das palavras não importa, porque ninguém lembra a ordem.
 *
 * **A dica entrou em 22/09**, e é a metade de graça de uma coisa cara. A
 * pergunta que uma pessoa faz não é *"onde está o Duplicar?"* — é *"como eu
 * faço uma cópia com os filhos junto?"*. O nome do comando é justamente o que
 * ela não sabe; a **dica** é onde a resposta está escrita, e está escrita na
 * língua dela: são 55 frases nos menus, todas em português de quem usa.
 *
 * Nenhuma lista nova, nenhum cadastro: a dica já estava lá, e ninguém a
 * procurava. É o mesmo desenho da própria paleta — a busca sai da MESMA lista
 * que desenha os menus, e um comando novo aparece aqui no dia em que aparece lá.
 *
 * Texto vazio devolve tudo, que é o que faz a paleta abrir mostrando o mapa
 * inteiro em vez de uma tela em branco.
 *
 * Pais de submenu ficam de fora: eles não rodam nada, só abrem. Mas o NOME
 * deles entra no caminho — rodada 6 (05/10/2026): com os doze menus, muito
 * item mora num submenu (Animação → Ir para → Início), e a paleta diz o
 * caminho inteiro, para quem achou saber onde mora da próxima vez.
 */
export function filterCommands(
  menus: readonly MenuGroupDef[], text: string, limit = 40,
): Command[] {
  const words = fold(text).split(/\s+/).filter((word) => word !== '');
  const out: Command[] = [];
  const seen = new Set<string>();

  for (const group of menus) {
    for (const { entry, path } of withPath(group.entries, group.label)) {
      if (seen.has(entry.action)) continue;
      const haystack = fold(`${entry.label} ${path} ${entry.hint ?? ''}`);
      if (!words.every((word) => haystack.includes(word))) continue;
      seen.add(entry.action);
      out.push({
        action: entry.action,
        label: entry.label,
        menu: path,
        shortcut: liveShortcut(entry.action, entry.shortcut) ?? null,
        hint: entry.hint ?? null,
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** Toda entrada que roda alguma coisa, com o caminho de menus até ela. */
function withPath(entries: readonly MenuItem[], path: string): Array<{ entry: MenuEntry; path: string }> {
  const out: Array<{ entry: MenuEntry; path: string }> = [];
  for (const item of entries) {
    if (isSeparator(item)) continue;
    if (item.children !== undefined && item.children.length > 0) {
      out.push(...withPath(item.children, `${path} → ${item.label}`));
      continue;
    }
    out.push({ entry: item, path });
  }
  return out;
}
