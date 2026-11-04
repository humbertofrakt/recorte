/**
 * A auditoria dos sete menus (dono A) — lote 19, rodada 3.
 *
 * *"Nossos menus são muito bagunçados e não temos coisas básicas que o Spriter
 * tem"*, disse o Humberto. A parte do "não temos" foi trabalho dos lotes 15,
 * 16 e 17. Esta é a parte do **bagunçados**.
 *
 * O `PROJETO DO MENU 2026-09-08` continua mandando sobre **quais** itens
 * existem. Este arquivo manda sobre **como eles se leem**: nome curto, tecla
 * escrita, nenhum item repetido na barra inteira, e menu comprido partido em
 * grupos por separador.
 *
 * `auditMenus` devolve a **lista do que está errado**, e não um `throw`: o
 * teste espera lista vazia, e quando ela não está vazia ele diz de uma vez
 * tudo o que falta, em vez de um por rodada.
 */

import { flatEntries, isSeparator } from './menus.js';
import type { MenuEntry, MenuGroupDef, MenuItem } from './menus.js';

/** Uma coisa errada num menu. */
export interface MenuViolation {
  /** O menu onde ela está, ou `'(barra)'` quando é da barra inteira. */
  menu: string;
  /** O item, ou `''`. */
  item: string;
  /** A regra quebrada, escrita para uma pessoa ler. */
  regra: string;
}

/**
 * O maior comprimento do nome de um item, em letras.
 *
 * O nome de um item de menu é uma etiqueta, não uma frase: a explicação vai na
 * dica, que aparece ao passar o mouse e é lida em voz alta pelo leitor de
 * tela. Um menu de nomes longos vira um parágrafo em coluna, e o Humberto é
 * disléxico.
 *
 * **28 letras, e não "três palavras".** O plano escreveu as duas coisas: "até
 * 3 palavras" na regra e "comprimento do `label`" na coluna de como conferir.
 * Contar palavras reprovava "Não mexer nos filhos" (20 letras, que se lê de um
 * golpe) e aprovava "Reempacotar atlas" (17). O que cansa o olho é a largura
 * da linha, não quantos espaços ela tem.
 */
export const MAX_CHARS = 28;

/**
 * A partir de quantos itens um menu precisa de separadores.
 *
 * Doze é o ponto em que um menu deixa de se ler de uma vez. Acima dele, o olho
 * precisa de degraus, e o degrau é o separador.
 */
export const LONG_MENU = 12;

/**
 * O maior grupo entre dois separadores, num menu comprido.
 *
 * Seis é o tanto que se conta sem apontar o dedo na tela.
 */
export const MAX_GROUP = 6;

/**
 * A ordem que cada menu segue, escrita à mão.
 *
 * Não é uma regra automática, e não deveria ser: "o mais usado em cima" é uma
 * decisão sobre o trabalho, e não sobre o código. Esta tabela é a decisão, num
 * lugar só, para o próximo lote não a refazer de cabeça.
 */
export const MENU_ORDER: Readonly<Record<string, string>> = Object.freeze({
  // Rodada 6 (05/10/2026): os doze do `05 O DESENHO DOS MENUS`.
  Arquivo: 'novo e abrir · a pasta · importar · salvar · exportar · configurações · sair',
  Editar: 'desfazer · área de transferência · pose · duplicar e apagar · seleção · escolher · posição no osso · preferências',
  Imagens: 'a pasta · pôr na cena · o pivô',
  Base: 'abrir e trazer a base · criar · ordem de desenho · pastas · repouso · compensar e eixos',
  'Malha e regras': 'malha e pesos · regras · parâmetros · física e caminho',
  Animação: 'animações · duração · tocar e andar no tempo · chavear · apagar · marcas e eventos · em bloco',
  Skins: 'criar · editar · por imagem · promover e testar',
  Entidades: 'trazer e pôr · slot · promover · visualizador',
  Partículas: 'o emissor vazio · os prontos · prender',
  Exibir: 'tema · o boneco e a cena · esconder e travar · cebola e referência · zoom · nomes',
  Janela: 'arranjos e arrumar · os painéis, na ordem da barra',
  Ajuda: 'manual · atalhos · sobre',
});

/** O comprimento do nome, sem contar as reticências do "isto abre uma janela". */
export function labelLength(label: string): number {
  return label.replace(/…|\.\.\./g, '').trim().length;
}

/**
 * Os tamanhos dos grupos entre separadores, na ordem.
 *
 * Um menu sem separador nenhum devolve um grupo só, com tudo dentro — que é
 * exatamente o caso que a regra dos doze pega.
 */
export function groupSizes(entries: readonly MenuItem[]): number[] {
  const out: number[] = [];
  let atual = 0;
  for (const item of entries) {
    if (isSeparator(item)) {
      out.push(atual);
      atual = 0;
      continue;
    }
    atual += 1;
  }
  out.push(atual);
  return out.filter((n) => n > 0);
}

/**
 * Confere os sete menus. Devolve a lista do que está errado.
 *
 * | Regra | Como se confere |
 * |:---|:---|
 * | um item aparece **uma vez** na barra inteira | conjunto de `actionId` sem repetido |
 * | menu com mais de 12 itens tem grupos de até 6 | contagem entre separadores |
 * | todo item tem nome e ação | texto não vazio |
 * | nome curto: até 28 letras | comprimento do `label` |
 * | todo menu tem a ordem escrita na tabela | `MENU_ORDER` |
 */
export function auditMenus(menus: readonly MenuGroupDef[]): MenuViolation[] {
  const erros: MenuViolation[] = [];
  const vistas = new Map<string, string>();

  for (const menu of menus) {
    const itens = flatEntries(menu.entries);

    if (MENU_ORDER[menu.label] === undefined) {
      erros.push({ menu: menu.label, item: '', regra: 'não tem a ordem escrita em MENU_ORDER' });
    }

    const soltos = menu.entries.filter((item): item is MenuEntry => !isSeparator(item));
    if (soltos.length > LONG_MENU) {
      for (const tamanho of groupSizes(menu.entries)) {
        if (tamanho > MAX_GROUP) {
          erros.push({
            menu: menu.label,
            item: '',
            regra: `menu de ${soltos.length} itens tem um grupo de ${tamanho}`
              + ` entre separadores; o limite é ${MAX_GROUP}`,
          });
          break;
        }
      }
    }

    for (const item of itens) {
      // **Nenhum item cinza para sempre** — anotação 22, lote 33. Um item que
      // nasce apagado com a dica "Vem no lote N" é uma promessa que envelhece:
      // eram dez, de lotes que já tinham passado. Cinza por ESTADO — desfazer
      // com a pilha vazia — continua certo, e não tem dica de lote.
      if (item.enabled === false && /vem no lote/i.test(item.hint ?? '')) {
        erros.push({
          menu: menu.label,
          item: item.label,
          regra: 'cinza para sempre, prometendo um lote. Ou funciona, ou sai do '
            + 'menu com uma linha em MOVED_OUT dizendo por quê',
        });
      }
      if (item.label.trim() === '') {
        erros.push({ menu: menu.label, item: item.action, regra: 'sem nome' });
      }
      if (item.action.trim() === '') {
        erros.push({ menu: menu.label, item: item.label, regra: 'sem ação' });
      }
      if (labelLength(item.label) > MAX_CHARS) {
        erros.push({
          menu: menu.label,
          item: item.label,
          regra: `nome com ${labelLength(item.label)} letras; o limite é ${MAX_CHARS}`,
        });
      }
      // Um pai de submenu não é uma ação: ele existe para abrir a lista, e o
      // mesmo pai pode aparecer com o mesmo nome em outro menu sem confundir.
      const ehPai = item.children !== undefined && item.children.length > 0;
      if (!ehPai) {
        const antes = vistas.get(item.action);
        if (antes !== undefined) {
          erros.push({
            menu: menu.label,
            item: item.label,
            regra: `a ação ${item.action} já aparece no menu ${antes}`,
          });
        } else {
          vistas.set(item.action, menu.label);
        }
      }
    }
  }
  return erros;
}
