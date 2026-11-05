/**
 * As ações de ver, travar e da cebola, desde o arranque — I3, chat I,
 * 29/09/2026 (decisão P23 do Planejador).
 *
 * Moravam no `mount()` do painel Exibição. A forma do defeito: **a ação mora
 * no painel, a porta mora no menu; fechado o painel, a porta fica e a ação
 * some.** Fechar a aba Exibição deixava o botão "Ver ossos" do alto e o menu
 * Exibir inteiro sem ação, e calados — medido na fila do lote 2.
 *
 * Agora elas nascem com o documento, como as de `skins-actions.ts`, e o painel
 * só desenha as caixas: marcar no menu, no botão do alto ou na caixa escreve
 * no MESMO lugar (`changeViewSettings`), e quem desenha ouve `onViewSettings`.
 *
 * As frases do rodapé são funções puras, para o teste sem navegador (regra 8).
 */

import type { EditorDoc, Selection } from '../contract.js';
import { registerAction } from '../ui/actions.js';
import {
  changeViewSettings, hideSelected, isCleanView, lockOthers, lockSelected, namesOfSelection,
  showAll, soloSelected, toggleCleanView, unlockAll, viewSettings,
  type ViewSettings,
} from '../viewport/onion.js';

type Switch = keyof Omit<ViewSettings, 'onion'>;

/**
 * Quantas PEÇAS estão escolhidas: ossos e slots, contando o slot de cada
 * desenho uma vez só — I1. Somar `slots` e `attachments` dava "2 escondido"
 * para um desenho, porque escolher um desenho escolhe o slot E o anexo.
 */
export function pickedCount(selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>): number {
  const names = namesOfSelection(selection);
  return names.bones.length + names.slots.length;
}

/**
 * A recusa de "esconder / travar o escolhido" sem nada escolhido — I2.
 *
 * `Shift+H` com a seleção vazia escondia TUDO e dizia *"Só o escolhido"*: a
 * regra 21 inteira — fazer outra coisa e dizer que fez a pedida. E a seleção
 * fica vazia sozinha logo depois de um `H`, porque o escondido sai da
 * seleção: o segundo gesto da fila caía justamente aqui.
 */
export const NOTHING_PICKED =
  'Nada escolhido. Escolha uma peça na cena ou na Árvore, e aperte de novo';

/** "1 peça escondida" / "3 peças escondidas", com a volta. */
export function hiddenNotice(n: number): string {
  return `${n === 1 ? '1 peça escondida' : `${n} peças escondidas`}. Ctrl+Alt+3 mostra tudo`;
}

/** "1 peça travada" / "3 peças travadas", com a volta. */
export function lockedNotice(n: number): string {
  return `${n === 1 ? '1 peça travada' : `${n} peças travadas`}. Ctrl+Alt+2 destrava tudo`;
}

/**
 * A frase dos quatro botões do alto — os do Spriter. O botão muda de cor, e
 * isso é a marca; o rodapé diz o que a cor quer dizer e a tecla da volta.
 * Os outros interruptores não falam (`null`): a caixa marcada já diz.
 */
export function switchNotice(key: Switch, on: boolean): string | null {
  switch (key) {
    case 'bones': return on ? 'Ossos à vista (7)' : 'Ossos escondidos. 7 traz de volta';
    case 'drawings': return on ? 'Desenhos à vista (9)' : 'Desenhos escondidos. 9 traz de volta';
    case 'lockBones': return on ? 'Ossos travados: o clique passa por eles. 8 destrava' : 'Ossos destravados (8)';
    case 'lockDrawings': return on ? 'Desenhos travados: o clique passa por eles. 0 destrava' : 'Desenhos destravados (0)';
    default: return null;
  }
}

/** A frase de "Limpar guias" sem guia nenhuma: o estado é o motivo. */
export const NO_GUIDES = 'Não há guias para limpar. Arraste a partir de uma régua para criar uma';

/** Apaga todas as guias e devolve a frase do rodapé: quantas saíram, ou por que nada. */
export function clearGuides(doc: EditorDoc): string {
  const quantas = viewSettings().guides.length;
  if (quantas === 0) return NO_GUIDES;
  changeViewSettings({ guides: [] }, doc);
  return quantas === 1 ? '1 guia apagada' : `${quantas} guias apagadas`;
}

/** Registra as ações. Devolve como tirá-las. */
export function registerViewActions(doc: EditorDoc): Array<() => void> {
  const flip = (key: Switch): (() => void) => () => {
    const on = viewSettings()[key] !== true;
    changeViewSettings({ [key]: on } as Partial<Omit<ViewSettings, 'onion'>>, doc);
    const frase = switchNotice(key, on);
    if (frase !== null) doc.notice(frase);
  };
  const reads = (key: Switch): (() => boolean) => () => viewSettings()[key] === true;

  /**
   * Roda uma das contas puras de `onion.ts` e diz o que aconteceu. `pede`:
   * a ação age no escolhido, e sem escolha ela recusa em voz alta (I2).
   */
  const apply = (
    compute: (view: Readonly<ViewSettings>) => Partial<ViewSettings>,
    say: (quantos: number) => string,
    pede = false,
  ): void => {
    const quantos = pickedCount(doc.selection);
    if (pede && quantos === 0) {
      doc.notice(NOTHING_PICKED);
      return;
    }
    changeViewSettings(compute(viewSettings()) as Partial<Omit<ViewSettings, 'onion'>>, doc);
    doc.notice(say(quantos));
  };

  // Cada id vai escrito por extenso, abaixo: os vigias `acoes` e `menus` leem
  // o TEXTO do arquivo, e um id montado por conta não seria achado. `VIEW_ACTIONS`, de
  // `ui/menus.ts`, é o outro lado: o teste `exibicao` confere que cada id dele
  // está registrado aqui.
  return [
    registerAction('ver-desenhos', { run: flip('drawings'), checked: reads('drawings') }),
    registerAction('ver-ossos', { run: flip('bones'), checked: reads('bones') }),
    registerAction('ver-nomes', { run: flip('boneNames'), checked: reads('boneNames') }),
    registerAction('ver-caixas', { run: flip('boundingBoxes'), checked: reads('boundingBoxes') }),
    registerAction('ver-pontos', { run: flip('points'), checked: reads('points') }),
    registerAction('ver-mascaras', { run: flip('clippings'), checked: reads('clippings') }),
    registerAction('ver-malhas', { run: flip('meshes'), checked: reads('meshes') }),
    registerAction('ver-arestas', { run: flip('edges'), checked: reads('edges') }),
    registerAction('ver-pesos', { run: flip('weights'), checked: reads('weights') }),
    registerAction('ver-grade', { run: flip('grid'), checked: reads('grid') }),
    registerAction('ver-reguas', { run: flip('rulers'), checked: reads('rulers') }),
    registerAction('ver-eixos', { run: flip('axes'), checked: reads('axes') }),
    registerAction('travar-ossos', { run: flip('lockBones'), checked: reads('lockBones') }),
    registerAction('travar-desenhos', { run: flip('lockDrawings'), checked: reads('lockDrawings') }),
    registerAction('ver-cebola', {
      run: () => {
        const on = !viewSettings().onion.enabled;
        changeViewSettings({ onion: { enabled: on } }, doc);
        doc.notice(on ? 'Casca de cebola ligada' : 'Casca de cebola desligada');
      },
      checked: () => viewSettings().onion.enabled,
    }),
    registerAction('ver-nome-no-cursor', { run: flip('hoverNames'), checked: reads('hoverNames') }),
    // Lote 42: as guias. Mostrar e travar são caixas como as outras.
    registerAction('ver-guias', { run: flip('showGuides'), checked: reads('showGuides') }),
    registerAction('travar-guias', { run: flip('lockGuides'), checked: reads('lockGuides') }),
    // Apaga todas as guias de uma vez. Sem guia nenhuma, DIZ — P58, 29/09:
    // ficava cinza, e um cinza sem motivo escrito é onde o defeito se esconde
    // (o vigia `existir-nao-e-funcionar` o acusou quando ela foi para o arranque).
    registerAction('limpar-guias', {
      run: () => doc.notice(clearGuides(doc)),
    }),

    // ---- Ver e travar um a um — itens 57, 58 e 61 ------------------------
    registerAction('esconder-escolhido', {
      run: () => apply((view) => hideSelected(view, doc.selection), hiddenNotice, true),
    }),
    registerAction('so-este', {
      run: () => apply(
        () => soloSelected(viewSettings(), doc.file, doc.selection),
        () => 'Só o escolhido à vista. Ctrl+Alt+3 mostra tudo',
        true,
      ),
    }),
    registerAction('mostrar-tudo', {
      run: () => apply(() => showAll(), () => 'Tudo à vista de novo'),
    }),
    registerAction('travar-escolhido', {
      run: () => apply((view) => lockSelected(view, doc.selection), lockedNotice, true),
    }),
    registerAction('travar-resto', {
      run: () => apply(() => lockOthers(doc.file, doc.selection), () => 'Travado tudo menos o escolhido', true),
    }),
    registerAction('destravar-tudo', {
      run: () => apply(() => unlockAll(), () => 'Nada travado'),
    }),
    registerAction('ver-resultado', {
      run: () => apply(
        (view) => toggleCleanView(view),
        () => (isCleanView() ? 'Vendo só o resultado' : 'De volta ao que estava'),
      ),
      checked: () => isCleanView(),
    }),
  ];
}

// ---------------------------------------------------------------------------
// Os grupos da aba Exibição dobram — rodada 17, I8 (05/10/2026)
// ---------------------------------------------------------------------------

/**
 * Os grupos dobrados da aba Exibição, pelo título. A aba rola e é longa (a
 * medição: sobram 138 px em 1440×900), e clicar em *MOSTRAR NA TELA* ou *A
 * CENA* não fazia nada: o título parecia o de Malha e pesos, que dobra. Agora
 * dobra igual. O estado vive na sessão, como o do Pincel: a aba é refeita a
 * cada mudança, e sem guardar isto o grupo abriria de novo a cada clique.
 */
const escolhidos = new Map<string, boolean>();

/**
 * Os grupos que NASCEM dobrados na tela baixa (até 800 px de altura) —
 * 04/11/2026, a Exibição em 1280×720. Ali a coluna dá 191 px à aba, e a
 * tabela "Mostrar na tela" sozinha pede 165: "A cena" nasce dobrada, com o
 * título à vista, e abre num clique. Na tela grande, tudo nasce aberto, como
 * sempre. O que a mão escolheu vale acima disto, nas duas telas. (A grade, as
 * réguas, os eixos e as guias moram também no menu Exibir.)
 */
const DOBRADOS_NA_TELA_BAIXA: readonly string[] = ['A cena'];

/** A tela é baixa? A mesma marca da Ordem compacta e da Malha: até 800 px. */
export function telaBaixa(altura: number): boolean {
  return altura <= 800;
}

/** O grupo está dobrado? `baixa`: a tela tem até 800 px de altura. */
export function viewGroupFolded(title: string, baixa = false): boolean {
  return escolhidos.get(title) ?? (baixa && DOBRADOS_NA_TELA_BAIXA.includes(title));
}

/** Dobra ou abre. Devolve o estado novo: `true` = dobrado. */
export function toggleViewGroup(title: string, baixa = false): boolean {
  const agora = !viewGroupFolded(title, baixa);
  escolhidos.set(title, agora);
  return agora;
}

/** Para o teste começar limpo. */
export function resetViewGroups(): void {
  escolhidos.clear();
}

/** A dica do título: o que o clique faz. */
export function viewGroupHint(title: string, folded: boolean): string {
  return folded ? `Abrir o grupo ${title}` : `Dobrar o grupo ${title}`;
}
