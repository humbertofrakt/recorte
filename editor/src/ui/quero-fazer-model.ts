/**
 * **Ajuda → Quero fazer…** — as tarefas em palavras da pessoa. Noite de 04/11/2026.
 *
 * A queixa do Humberto: *"eu não achava como fazer"*. A Paleta de comandos acha
 * um comando pelo NOME dele; quem não sabe o nome não acha nada. Aqui se
 * procura pela COISA que se quer: "arma", "roupa", "gif".
 *
 * Cada passo que é um comando cita a ação pelo **id** (`'por-entidade'`), e o
 * caminho escrito na tela (**Entidades → Pôr entidade na cena…**) é montado
 * dos menus na hora. Quando outra sessão renomear um item, a janela segue
 * sozinha; quando tirar um item, o teste `quero-fazer.test.ts` fica vermelho.
 *
 * As tarefas saem da folha `O QUE O PROGRAMA FAZ` (gerada do código) e dos
 * capítulos do manual. Módulo puro: a lista, a busca e o texto.
 */

import { NEUTRAL_MENU_STATE, allMenus, isSeparator } from './menus.js';
import type { MenuGroupDef, MenuItem } from './menus.js';
import { fold } from './palette.js';

/** Um passo: um comando do menu, ou um gesto escrito à mão. */
export type Passo =
  | { acao: string; texto: string }
  | { texto: string };

export interface Tarefa {
  id: string;
  /** Em palavras de quem usa: "Pôr uma arma na mão". */
  titulo: string;
  /** Outras palavras que acham a tarefa: "espada", "segurar". */
  palavras: readonly string[];
  /**
   * De 3 a 6. Num passo com `acao`, `{menu}` no texto vira o caminho do menu,
   * com a tecla: "Escolha {menu}." → "Escolha Base → Novo → Osso.".
   */
  passos: readonly Passo[];
  /** O capítulo do manual que conta mais. */
  capitulo?: string;
}

const P = (acao: string, texto = 'Escolha {menu}.'): Passo => ({ acao, texto });
const G = (texto: string): Passo => ({ texto });

export const TAREFAS: readonly Tarefa[] = Object.freeze([
  {
    id: 'comecar-imagens', titulo: 'Começar um boneco com as minhas imagens',
    palavras: ['pasta', 'png', 'arte', 'novo', 'começar', 'peças'],
    passos: [
      P('abrir-pasta'),
      G('Escolha a pasta com os PNGs. Eles aparecem na aba Imagens.'),
      G('Arraste cada imagem da aba Imagens para a cena.'),
      P('salvar', 'Guarde com {menu}.'),
    ],
    capitulo: '1. Montar um corpo',
  },
  {
    id: 'importar-psd', titulo: 'Importar um PSD do Photoshop',
    palavras: ['photoshop', 'camadas', 'psd', 'trazer'],
    passos: [
      P('importar-psd'),
      G('Escolha o arquivo .psd. Cada camada vira um desenho, no lugar.'),
      G('Tem uma camada "ossos" com os ossos desenhados? Use o item de baixo.'),
      P('importar-psd-ossos', 'Com ossos: {menu}.'),
    ],
    capitulo: '1. Montar um corpo',
  },
  {
    id: 'criar-osso', titulo: 'Criar os ossos e prender as peças',
    palavras: ['osso', 'esqueleto', 'prender', 'filho', 'rig'],
    passos: [
      P('novo-osso', 'Crie um osso: {menu}, ou a ferramenta Criar osso (B) e arraste.'),
      G('Escolha o osso na Árvore.'),
      P('virar-filho', 'Prenda as peças: {menu}, e clique em cada peça na cena.'),
      G('Esc termina.'),
    ],
    capitulo: '1. Montar um corpo',
  },
  {
    id: 'frente', titulo: 'Pôr um desenho na frente de outro',
    palavras: ['ordem', 'frente', 'trás', 'camada', 'atrás'],
    passos: [
      G('Clique no desenho, na cena ou na aba Ordem.'),
      P('subir-ordem', 'Escolha {menu} até ele passar para a frente.'),
      G('A aba Ordem mostra quem fica na frente: o de cima da lista.'),
    ],
    capitulo: '1. Montar um corpo',
  },
  {
    id: 'pivo', titulo: 'Dizer onde o osso segura a imagem (o pivô)',
    palavras: ['pivô', 'pivo', 'girar', 'centro', 'encaixe'],
    passos: [
      G('Escolha o desenho na cena ou na Árvore.'),
      P('definir-pivo'),
      G('Clique no ponto da imagem onde ela gira. Confirme.'),
    ],
    capitulo: '1. Montar um corpo',
  },
  {
    id: 'animacao', titulo: 'Criar uma animação',
    palavras: ['animar', 'animação', 'andar', 'movimento', 'chave', 'pose'],
    passos: [
      P('nova-animacao'),
      G('Leve a agulha da linha do tempo para outro tempo.'),
      G('Gire ou mova um osso na cena. A chave nasce sozinha.'),
      P('chavear', 'Para gravar a pose sem mexer: {menu}.'),
      P('tocar', 'Veja: {menu}.'),
    ],
    capitulo: '4. Animar',
  },
  {
    id: 'ciclo', titulo: 'Fazer a caminhada voltar ao começo sem tranco',
    palavras: ['ciclo', 'laço', 'loop', 'caminhada', 'tranco', 'repetir'],
    passos: [
      G('Abra a animação, na aba Animações.'),
      P('fechar-ciclo'),
      P('repetir', 'Ligue {menu} para ver em laço.'),
    ],
    capitulo: '4. Animar',
  },
  {
    id: 'arma', titulo: 'Pôr uma arma na mão',
    palavras: ['arma', 'espada', 'segurar', 'mão', 'motosserra', 'objeto', 'entidade'],
    passos: [
      P('abrir-entidade', 'Traga a arma, feita noutro projeto: {menu}.'),
      G('Escolha o osso da mão, na Árvore.'),
      P('por-entidade', 'Ponha a arma na mão: {menu}.'),
      P('escolher-animacao-entidade', 'Para a arma tocar uma animação dela: {menu}.'),
    ],
    capitulo: '11. A espada de um, o boneco de outro',
  },
  {
    id: 'veiculo', titulo: 'Pôr o boneco dentro de um veículo (o mecha)',
    palavras: ['veículo', 'veiculo', 'mecha', 'carro', 'dentro', 'montar', 'robô'],
    passos: [
      P('abrir-entidade', 'Traga o veículo, feito noutro projeto: {menu}.'),
      P('por-dentro-de', 'Veja o boneco dentro dele, só de teste: {menu}.'),
      P('por-no-projeto', 'Ficou bom? Grave: {menu}.'),
    ],
    capitulo: '5. Entidades',
  },
  {
    // Noite de 04/11: o Guarda-roupa (obra/skins) é a porta da roupa.
    id: 'roupa', titulo: 'Trocar a roupa (skin)',
    palavras: ['roupa', 'skin', 'pele', 'armadura', 'vestir', 'trocar', 'guarda-roupa'],
    passos: [
      P('guarda-roupa', 'Abra {menu}.'),
      G('Cada coluna é uma skin. "+ Nova skin" cria uma roupa nova.'),
      G('Clique numa casa para trocar a imagem daquele desenho naquela skin.'),
      G('"Vestir só esta" veste a roupa na cena.'),
    ],
    capitulo: '3. Skins',
  },
  {
    // Noite de 04/11: Animações de outro boneco… (obra/reaproveitar).
    id: 'animacao-de-outro', titulo: 'Usar a animação de outro boneco',
    palavras: ['reaproveitar', 'outro', 'copiar', 'importar', 'animação', 'pronta', 'goblin'],
    passos: [
      P('usar-animacoes'),
      G('Escolha de onde vêm: o Esqueleto padrão, ou um arquivo .bone.'),
      G('Marque as animações. Confira a tabela: cada osso de lá, o osso daqui.'),
      G('Clique em "Usar as animações".'),
    ],
    capitulo: '2. Bases e animações',
  },
  {
    id: 'seguir-padrao', titulo: 'Fazer o boneco seguir o Esqueleto padrão',
    palavras: ['padrão', 'padrao', 'esqueleto', 'nomes', 'ossos', 'reaproveitar', 'humanoide'],
    passos: [
      P('seguir-esqueleto-padrao'),
      G('Confira a tabela: cada osso daqui ganha o nome de um osso do padrão.'),
      G('Clique em "Renomear os ossos".'),
      P('usar-animacoes', 'Daí, as animações do padrão tocam aqui: {menu}.'),
    ],
    capitulo: '2. Bases e animações',
  },
  // Pronto para acrescentar: "Ver tudo funcionando" → o cartão "Abrir a
  // oficina", quando a sessão Reaproveitar der a ele um id de ação.
  {
    id: 'dobrar', titulo: 'Fazer uma imagem dobrar (malha)',
    palavras: ['malha', 'dobrar', 'curvar', 'mesh', 'peso', 'capa'],
    passos: [
      G('Escolha o desenho na cena ou na Árvore.'),
      P('virar-malha'),
      P('malha-automatica', 'Faça a forma: {menu}.'),
      P('ligar-ossos', 'Diga que ossos puxam: {menu}.'),
      P('pesos-automaticos', 'Reparta os pesos: {menu}.'),
    ],
    capitulo: '6. Malha e pesos',
  },
  {
    id: 'balancar', titulo: 'Fazer o cabelo balançar sozinho',
    palavras: ['física', 'fisica', 'balançar', 'cabelo', 'regra', 'mexer sozinho', 'pé'],
    passos: [
      G('Escolha o osso do cabelo, na Árvore.'),
      P('nova-regra-guiada', 'Escolha {menu} e o tipo física.'),
      P('fisica-simular', 'Veja balançar: {menu}.'),
    ],
    capitulo: '7. As cinco regras',
  },
  {
    id: 'fogo', titulo: 'Pôr fogo, fumaça ou faísca',
    palavras: ['fogo', 'fumaça', 'faísca', 'poeira', 'partícula', 'efeito'],
    passos: [
      G('Escolha o osso de onde o fogo sai, na Árvore.'),
      P('particulas-fogo'),
      G('Ajuste na aba Partículas e em Propriedades.'),
    ],
    capitulo: '10. Partículas e biblioteca',
  },
  {
    id: 'gif', titulo: 'Exportar um GIF ou um vídeo',
    palavras: ['gif', 'vídeo', 'video', 'png', 'imagem', 'folha', 'sprite', 'exportar'],
    passos: [
      P('exportar-imagem'),
      G('Escolha a animação e o formato: GIF animado.'),
      G('Clique em Exportar. O arquivo vai para a pasta de downloads.'),
      P('recorte-na-cena', 'Para cortar a imagem num retângulo seu: {menu}.'),
    ],
    capitulo: '8. Exportar e usar no jogo',
  },
  {
    id: 'jogo', titulo: 'Mandar o boneco para o jogo',
    palavras: ['jogo', 'game', 'construct', 'godot', 'entregar', 'pacote'],
    passos: [
      P('salvar', 'Salve: {menu}.'),
      P('entregar-corpo', 'Só o que o jogo usa: {menu}.'),
      P('salvar-pacote', 'Tudo num arquivo só: {menu}.'),
    ],
    capitulo: '8. Exportar e usar no jogo',
  },
  {
    id: 'achar', titulo: 'Achar um comando pelo nome',
    palavras: ['procurar', 'achar', 'comando', 'nome', 'menu', 'buscar'],
    passos: [
      P('paleta'),
      G('Digite um pedaço do nome. Sem acento serve.'),
      G('Enter faz.'),
    ],
    capitulo: '0. Abrir o Recorte',
  },
]);

// ---------------------------------------------------------------------------
// O caminho do menu, montado da tabela
// ---------------------------------------------------------------------------

export interface Caminho {
  /** `['Base', 'Novo', 'Osso']`. */
  rotulos: string[];
  tecla?: string;
}

function procura(itens: readonly MenuItem[], acao: string, antes: string[]): Caminho | null {
  for (const item of itens) {
    if (isSeparator(item)) continue;
    const aqui = [...antes, item.label];
    if (item.action === acao && (item.children?.length ?? 0) === 0) {
      return { rotulos: aqui, ...(item.shortcut === undefined ? {} : { tecla: item.shortcut }) };
    }
    if (item.children !== undefined) {
      const achou = procura(item.children, acao, aqui);
      if (achou !== null) return achou;
    }
  }
  return null;
}

/** Onde mora a ação nos menus, ou `null` quando ela não tem porta de menu. */
export function caminhoDe(acao: string, menus: readonly MenuGroupDef[] = allMenus(NEUTRAL_MENU_STATE)): Caminho | null {
  for (const grupo of menus) {
    const achou = procura(grupo.entries, acao, [grupo.label]);
    if (achou !== null) return achou;
  }
  return null;
}

/** "Base → Novo → Osso (Ctrl+…)", como se lê na tela. */
export function caminhoEscrito(c: Caminho): string {
  return c.rotulos.join(' → ') + (c.tecla === undefined ? '' : ` (${c.tecla})`);
}

/** O texto do passo, com o caminho de menu de hoje no lugar de `{menu}`. */
export function textoDoPasso(passo: Passo, menus: readonly MenuGroupDef[] = allMenus(NEUTRAL_MENU_STATE)): string {
  if (!('acao' in passo)) return passo.texto;
  const c = caminhoDe(passo.acao, menus);
  // Sem porta: diz que não achou, em vez de inventar um caminho (regra 21).
  const texto = passo.texto.replace('{menu}', c === null ? `(o comando "${passo.acao}" não está nos menus)` : caminhoEscrito(c));
  // "fora…." não: as reticências do rótulo já fecham a frase.
  return texto.replace(/…\./g, '…');
}

/** O primeiro passo que é um comando: é esse que o "Mostrar onde" acende. */
export function primeiroComando(tarefa: Tarefa): string | null {
  for (const passo of tarefa.passos) if ('acao' in passo) return passo.acao;
  return null;
}

// ---------------------------------------------------------------------------
// A busca
// ---------------------------------------------------------------------------

/**
 * As tarefas que casam com o que se digitou. Cada palavra digitada tem de
 * aparecer no título, nas palavras da tarefa ou nos passos. Sem acento serve.
 * Campo vazio: todas.
 */
export function buscarTarefas(texto: string, lista: readonly Tarefa[] = TAREFAS): Tarefa[] {
  const termos = fold(texto).split(/\s+/).filter((t) => t !== '');
  if (termos.length === 0) return [...lista];
  const casa = (onde: string): boolean => termos.every((termo) => fold(onde).includes(termo));
  // Primeiro as que casam pelo título e pelas palavras; depois as que só
  // casam pelo texto dos passos. "animacao de outro" acha "Usar a animação de
  // outro boneco" antes de "Pôr uma arma", que fala de "outro projeto".
  const fortes = lista.filter((t) => casa([t.titulo, ...t.palavras].join(' ')));
  const fracas = lista.filter((t) => !fortes.includes(t) && casa([t.titulo, ...t.palavras, ...t.passos.map((p) => p.texto)].join(' ')));
  return [...fortes, ...fracas];
}
