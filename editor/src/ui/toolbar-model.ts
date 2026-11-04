/**
 * O que vai na barra da cena, como dado (dono A/B).
 *
 * A barra tinha três linhas em 1440×900 e comia a altura do desenho, que é o
 * que se olha o dia inteiro. Este arquivo é a lista do que fica nela — e o que
 * **saiu** dela está escrito aqui também, com o motivo, para o próximo lote não
 * trazer de volta sem querer.
 *
 * Sem navegador nenhum: um teste lê a lista e confere que todo botão tem nome e
 * ícone. Um botão sem nome é uma adivinhação.
 */

import { getTools } from '../contract.js';
import type { Tool } from '../contract.js';
import { hasIcon } from './icons.js';
import { swappedToolKey } from './keys.js';

/** Um botão da barra da cena. */
export interface ToolbarItem {
  /** Id da ferramenta, e também o nome do ícone. */
  id: string;
  /** O nome do ícone em `icons.ts`. */
  icon: string;
  /** O nome por extenso. Vai na dica sempre, e no botão quando ligado. */
  label: string;
  /** A tecla de uma letra, ou `null`. */
  key: string | null;
  /** A dica inteira: nome e tecla. */
  hint: string;
}

/*
 * `toolsForMode` saiu no degrau 4a (17/09/2026): nenhuma ferramenta some por
 * modo — M4, *"tudo sempre disponível"*. A barra mostra todas, sempre.
 */

/**
 * A ordem da barra, escrita — lote 26.
 *
 * Ela era a ordem em que os módulos se importavam no `viewport.ts`, e ninguém
 * sabia disso ao ler a barra. O `shear` se importava antes do `scale`, e a
 * barra saía **Girar · Inclinar · Escalar**, que não é a ordem de trabalho de
 * programa nenhum. O Humberto tropeçou nisso: *"o ícone ficou fora do
 * padrão"*.
 *
 * Escrita aqui, a ordem é uma decisão que se lê, e mover um `import` de lugar
 * não a muda mais por acidente. Ferramenta que não estiver nesta lista vai para
 * o fim, na ordem em que se registrou.
 *
 * A ordem é a do gesto: primeiro a que faz tudo, depois Selecionar, depois as
 * quatro que **mexem** no que foi escolhido uma de cada vez, e só então as que
 * **criam** coisa nova.
 *
 * **O Transformar é o primeiro** — item 2.2 do plano de 13/09/2026. O
 * Humberto: *"no Spriter só tem uma ferramenta; a que está selecionada tem que
 * ser a junção das outras, e podia ser a primeira"*. Ela já era a que abre o
 * programa (`START_TOOL`), mas nascia no segundo botão, e o primeiro botão da
 * barra é onde o olho procura a ferramenta principal.
 */
export const TOOL_ORDER: readonly string[] = Object.freeze([
  'transform', 'select', 'translate', 'rotate', 'scale', 'shear',
  'pose', 'create-bone', 'point', 'box', 'mesh', 'weights',
]);

/**
 * A ferramenta na mão ao abrir o programa — lote 47: **Transformar**. Mover,
 * girar, escalar e inclinar sem trocar de ferramenta, como no Spriter. Mover,
 * Girar, Escalar e Inclinar continuam na barra, para quem quer uma de cada vez
 * — item 2.4 do plano de 13/09/2026.
 */
export const START_TOOL = 'transform';

/**
 * O que mais a dica de uma ferramenta diz, além do nome e da tecla.
 *
 * Só entra aqui a ferramenta cujo nome **não** conta o que ela faz. "Girar"
 * conta; "Inclinar" não conta que a base fica parada, e sem isso o primeiro
 * arrasto parece um Mover torto.
 */
const TOOL_NOTES: Readonly<Record<string, string>> = Object.freeze({
  // Lote 47: o nome não conta que são quatro gestos numa caixa só. O `Alt`
  // do Inclinar entrou em 13/09/2026 (item 2.3), e uma tecla que ninguém vê
  // precisa estar escrita em algum lugar que se lê sem abrir o código.
  transform: 'Dentro: move · bolinha: gira · quadradinho: escala · Alt + quadradinho do meio: inclina',
  // Rodada 46, lote 4 (nota do doc `76`): a dica não dizia que se arrasta.
  shear: 'Arraste o osso escolhido: o topo anda, a base fica',
  // Anotação 15, item d: os dois modificadores do Criar osso existiam **só num
  // comentário do código**. Ctrl cria o osso já preso aos desenhos escolhidos,
  // e Alt em cima de um osso o redesenha sem mover os filhos — duas coisas que
  // poupam minutos por osso, e que ninguém tinha como descobrir.
  // Acréscimo ao lote 60: com desenhos escolhidos, o osso novo os pega. O Ctrl,
  // que fazia isso, virou o contrário: cria sem pegar.
  // Rodada 46, lote 5 (nota (b) do doc `80`): a dica diz o pai e o nome.
  'create-bone': 'Arraste para criar. Com desenhos escolhidos, o osso novo pega os desenhos e leva o nome do primeiro escolhido; '
    + 'nasce no osso escolhido, ou solto · Ctrl: cria sem pegar · Alt sobre um osso: redesenha',
  // Rodada 46, lote 2 (doc `66`, §2.3): nove das doze dicas eram só o nome.
  // O nome conta O QUE a ferramenta faz; a nota conta o gesto e as teclas
  // que mudam o gesto — que ninguém descobre sem ler o código.
  select: 'Clique escolhe · Shift ou Ctrl+clique soma · arrastar no vazio: retângulo · Alt+clique de novo: a peça de baixo',
  translate: 'Arraste o escolhido · Shift: trava um eixo · Ctrl + arrastar: leva uma cópia',
  rotate: 'Arraste em volta do pivô · Shift: de 15 em 15°',
  scale: 'Para longe do pivô cresce, para perto encolhe · Shift: os dois eixos juntos',
  pose: 'Arraste a ponta de um osso: a cadeia dobra junto, sem criar regra',
  point: 'Alt + arrastar: cria o ponto, e o arrasto dá o ângulo · arrastar: move · Shift: gira',
  box: 'Alt + arrastar: cria a caixa, de um canto ao outro',
  mesh: 'Clique num vértice e arraste · Ctrl+clique no vazio: vértice novo · Delete apaga · L e K: aresta',
  weights: 'Pinte o peso do osso escolhido na Árvore · [ e ]: raio do pincel',
});

/**
 * A frase do rodapé de cada ferramenta que não tinha nenhuma — rodada 46,
 * lote 2 (doc `66`, §2.3: sete de doze caladas). A linha diz o que a
 * ferramenta é e como se usa, com o osso escolhido ou sem; as que têm uma
 * condição que falta (Inclinar) ou um gesto escondido (Posar, Criar osso,
 * Ponto, Caixa) continuam com a frase delas.
 */
export const TOOL_FOOTERS: Readonly<Record<string, string>> = Object.freeze({
  transform: 'Transformar: clique escolhe. Dentro da caixa arrasta, a bolinha gira, o quadradinho escala, '
    + 'Alt no quadradinho do meio inclina.',
  select: 'Selecionar: clique escolhe, Shift ou Ctrl+clique soma, arrastar no vazio faz um retângulo. '
    + 'Alt+clique de novo pega a peça de baixo.',
  translate: 'Mover: arraste o escolhido. Shift trava um eixo; Ctrl leva uma cópia.',
  rotate: 'Girar: arraste em volta do pivô. Shift gira de 15 em 15°.',
  scale: 'Escalar: arraste para longe do pivô para crescer. Shift cresce os dois eixos juntos.',
  mesh: 'Malha: escolha um desenho com malha. Clique num vértice e arraste; Ctrl+clique no vazio cria um vértice.',
  weights: 'Pesos: escolha o osso na Árvore e pinte os vértices da malha. [ e ] mudam o raio.',
});

/** Onde cada ferramenta fica na barra. Fora da lista, no fim. */
function orderOf(id: string): number {
  const at = TOOL_ORDER.indexOf(id);
  return at === -1 ? TOOL_ORDER.length : at;
}

/**
 * Os botões de ferramenta da barra, na ordem escrita em `TOOL_ORDER`.
 *
 * A ordenação é **estável**: duas ferramentas fora da lista mantêm entre si a
 * ordem em que se registraram.
 */
export function toolbarItems(tools: readonly Tool[] = getTools()): ToolbarItem[] {
  return tools
    .map((tool, at) => ({ tool, at }))
    .sort((a, b) => (orderOf(a.tool.id) - orderOf(b.tool.id)) || (a.at - b.at))
    .map(({ tool }) => {
      const nota = TOOL_NOTES[tool.id];
      // Degrau 11, lote 2: a letra que vale AGORA, com a troca desta máquina.
      const trocada = tool.shortcut === null ? null : swappedToolKey(tool.id, tool.shortcut);
      const tecla = trocada ?? tool.shortcut;
      const nome = tecla === null ? tool.label : `${tool.label} (${trocada ?? tecla.toUpperCase()})`;
      return {
        id: tool.id,
        // O ícone leva o nome da ferramenta. Sem um, o botão fica só com a
        // palavra, que é feio e é legível — nunca um botão vazio.
        icon: hasIcon(tool.id) ? tool.id : '',
        label: tool.label,
        key: tecla,
        hint: nota === undefined ? nome : `${nome}. ${nota}`,
      };
    });
}

/**
 * As teclas das ferramentas, para Ajuda → Atalhos — lote 47. A tabela saía só
 * dos menus, e as ferramentas não moram em menu nenhum: `W`, `E`, `R` e agora
 * `T` não apareciam na lista. Na ordem da barra.
 */
export function toolShortcutRows(
  tools: readonly Tool[] = getTools(),
): Array<{ menu: string; item: string; shortcut: string }> {
  return toolbarItems(tools)
    .filter((item) => item.key !== null)
    .map((item) => ({ menu: 'Ferramentas', item: item.label, shortcut: (item.key ?? '').toUpperCase() }));
}

/**
 * As ferramentas que **não fazem nada** sem um osso escolhido.
 *
 * É uma só: **Inclinar**. Mover, Girar e Escalar caem no desenho quando não há
 * osso — inclinar não pode cair, porque um anexo não tem inclinação própria no
 * formato (§7), e inventar uma aqui criaria um campo que nenhum leitor entende.
 * Até aqui a ferramenta simplesmente **não respondia**, e não dizia por quê:
 * era o desvio 6 do lote 13, e o Humberto encontrou o silêncio: *"tentei usar,
 * não entendi"*.
 */
export const NEEDS_BONE: readonly string[] = Object.freeze(['shear']);

/**
 * A linha do rodapé da ferramenta **Posar** — lote 28, anotação 13.
 *
 * Posar dobra a cadeia agora, arrastando, e **não cria regra nenhuma**: ela
 * escreve rotações na pose, como qualquer outra ferramenta. Ninguém dizia isso
 * na tela, e é a confusão mais cara que existe aqui — quem pensa que "posou uma
 * perna de IK" descobre no jogo que ela não dobra sozinha.
 *
 * Esta frase aparece com a ferramenta na mão, com osso escolhido ou sem: ela
 * não é sobre o que falta fazer, é sobre o que a ferramenta **é**.
 */
export const POSE_FOOTER =
  'Posar dobra a cadeia agora, sem criar regra. '
  + 'Para o jogo dobrar sozinho, crie uma regra de IK.';

/**
 * A linha do rodapé para a ferramenta na mão, ou `null` quando não há o que
 * dizer.
 *
 * Diz o que fazer, e não o que está errado: "escolha um osso e arraste" é um
 * caminho; "nenhum osso escolhido" é um muro.
 */
/**
 * A linha do rodapé do **Criar osso** — anotação 15, item d.
 *
 * As duas teclas moravam num comentário do `create-bone.ts`. A frase diz o
 * gesto de sempre primeiro, e os dois atalhos depois: quem está criando o
 * primeiro osso não precisa saber dos dois, e quem está criando o vigésimo
 * precisa.
 */
// Rodada 46, lote 4 (nota do doc `76`): a frase inteira pedia 1.154 px e o
// rodapé tem 707 em 1280×720. Mais curta, com o mesmo gesto; o "arraste para
// criar" mora na dica do botão.
export const CREATE_BONE_FOOTER =
  'Com desenhos escolhidos, o osso novo pega os desenhos. Ctrl: sem pegar. Alt num osso: redesenha.';

/**
 * As linhas do rodapé da **Caixa** e do **Ponto** — rodada final, chat P, F4.
 *
 * As duas criam com **Alt + arrastar** (`box-tool.ts`, `point-tool.ts`), e o
 * arrasto seco não cria nada. O Criar osso dizia o gesto ao ser pego na barra;
 * estas duas ficavam caladas até o primeiro arrasto falhar. Agora dizem antes.
 */
export const BOX_FOOTER = 'Caixa: segure Alt e arraste, de um canto ao outro.';
export const POINT_FOOTER =
  'Ponto: segure Alt e arraste para criar. Sem Alt, arraste um ponto para mover; com Shift, gira.';

export function toolFooter(toolId: string, hasBone: boolean): string | null {
  if (toolId === 'pose') return POSE_FOOTER;
  if (toolId === 'create-bone') return CREATE_BONE_FOOTER;
  if (toolId === 'box') return BOX_FOOTER;
  if (toolId === 'point') return POINT_FOOTER;
  const frase = TOOL_FOOTERS[toolId];
  if (frase !== undefined) return frase;
  if (hasBone || !NEEDS_BONE.includes(toolId)) return null;
  if (toolId === 'shear') {
    return 'Inclinar: escolha um osso e arraste. O topo anda, a base fica.';
  }
  return null;
}

/** Os dois cadeados que ficam na barra, ao lado das ferramentas. */
export interface LockItem {
  id: 'lockBones' | 'lockDrawings';
  icon: string;
  label: string;
  key: string;
  hint: string;
}

export const LOCK_ITEMS: readonly LockItem[] = Object.freeze([
  {
    id: 'lockBones',
    icon: 'bone',
    label: 'Travar ossos',
    key: '8',
    hint: 'Travar ossos: o clique passa por eles, mas eles continuam à vista (8)',
  },
  {
    id: 'lockDrawings',
    icon: 'image',
    label: 'Travar desenhos',
    key: '0',
    hint: 'Travar desenhos: o clique passa por eles, mas eles continuam à vista (0)',
  },
]);

/**
 * O que SAIU da barra da cena no lote 4, e para onde foi.
 *
 * Escrito como dado, e não só num comentário, porque é isto que impede um lote
 * futuro de devolver um deles à barra sem perceber que a barra é justamente o
 * lugar de onde ele foi tirado.
 */
export const MOVED_OUT_OF_TOOLBAR: ReadonlyArray<{ what: string; to: string }> = Object.freeze([
  {
    what: 'Aproximar, Afastar, Ajustar à tela',
    to: 'o canto da cena, no lote 1 (v1.7), e o menu Exibir',
  },
  {
    what: 'Compensar: as três caixas',
    to: 'o painel Propriedades, visível só com Mover, Girar ou Escalar ativa',
  },
  {
    what: 'Eixos: os três botões',
    to: 'uma lista de três palavras na própria barra, que ocupa um botão em vez de três',
  },
]);
