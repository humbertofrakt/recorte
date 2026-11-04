/**
 * A ordem da aba Malha e pesos — lote 65, plano "painéis que cabem".
 *
 * O Humberto, 11/09/2026, com a foto da aba: *"esses menus estão impossíveis
 * de usar"*. A seção **Malha ligada**, que é a avançada, vinha em cima de
 * tudo, antes de Forma e Pesos. Agora a aba começa pelo que se faz sempre, e
 * a malha ligada fica no fim, dobrada.
 *
 * Puro: o painel desenha nesta ordem, e o teste confere a ordem sem DOM.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { boundsOf, type MeshGeometry } from '../mesh/mesh-edit.js';
import { selectedMesh, toggleMeshBone } from '../mesh/mesh-doc.js';
import { influencingBones, type WeightTable } from '../mesh/weights.js';
import { pickAll } from '../viewport/picking.js';

export type MeshSectionId = 'desenho' | 'forma' | 'ossos' | 'pesos' | 'pincel' | 'ligada';

export interface MeshSection {
  readonly id: MeshSectionId;
  readonly title: string;
  /** `true` para nascer dobrada: o título à vista, o miolo escondido. */
  readonly collapsed: boolean;
}

const SECTIONS: readonly MeshSection[] = Object.freeze([
  { id: 'desenho', title: 'Desenho escolhido', collapsed: false },
  { id: 'forma', title: 'Forma', collapsed: false },
  { id: 'ossos', title: 'Ossos que influenciam', collapsed: false },
  { id: 'pesos', title: 'Pesos', collapsed: false },
  // Ajuste fino — dobrada por padrão desde 13/09/2026 (a aba não cabia na
  // altura). Abre sozinha com a ferramenta Pesos na mão; ver `buildBrushSection`.
  { id: 'pincel', title: 'Pincel', collapsed: true },
  { id: 'ligada', title: 'Avançado: malha ligada', collapsed: true },
]);

/** As seções da aba, na ordem em que aparecem. */
export function meshPanelSections(): readonly MeshSection[] {
  return SECTIONS;
}

/**
 * **Abre a seção da ferramenta na mão** — Rodada 47, lote 5 (R11 do doc 68, opção A).
 *
 * A aba tinha 857 px de texto fixo numa caixa de 472 em 1920×1080: rolava 385
 * px, e o Pincel morava a 840 px do topo (doc `68`, §2.2). As três seções
 * grandes viram dobras, e quem abre é a ferramenta: com a **Malha** na mão,
 * a Forma; com os **Pesos**, os Ossos e os Pesos; com outra, a Forma. A mão
 * vence: o que a pessoa abriu ou fechou fica assim até a ferramenta mudar.
 */
export const MESH_FOLDS = ['forma', 'ossos', 'pesos'] as const;
export type MeshFold = typeof MESH_FOLDS[number];

export function meshFoldsOpen(
  tool: string, hand: Partial<Record<MeshFold, boolean>> = {}, binding = false,
): Record<MeshFold, boolean> {
  const pesos = tool === 'weights';
  const padrao: Record<MeshFold, boolean> = { forma: !pesos, ossos: pesos, pesos };
  // Com o modo Ligar aberto, a lista dos Ossos fica à vista: é nela que cada
  // osso ligado aparece, com a cor dele.
  return { ...padrao, ...hand, ...(binding ? { ossos: true } : {}) };
}

// ---------------------------------------------------------------------------
// O modo Ligar — lote 69, plano "uma imagem em dois ossos"
// ---------------------------------------------------------------------------

/**
 * O modo **Ligar**, como o *Bind* do Spine e o *Bind Bone* do DragonBones.
 *
 * O Humberto, 12/09/2026: *"não consigo usar peso de forma decente; pega uma
 * imagem e liga a dois ossos; o sistema não está completo"*. Até aqui o único
 * jeito de ligar um osso a uma malha era o **P segurado**, gesto que nenhum
 * dos três programas tem, e que só valia com a ferramenta Selecionar na mão.
 *
 * Nos três, o caminho é o mesmo: um **botão** abre um modo, e enquanto o modo
 * está aberto cada clique num osso liga (ou tira). O botão de novo, ou Esc,
 * fecha. A malha nunca sai da seleção no meio do caminho.
 *
 * O estado mora aqui, num módulo sem DOM, porque quem pergunta por ele é a
 * aba, a Árvore e a cena — três donos, um lugar só.
 */
let bindOpen = false;
const bindListeners = new Set<(open: boolean) => void>();

/** A frase do rodapé com o modo aberto. */
export const BIND_NOTICE = 'Clique nos ossos que puxam esta malha. Ligar ossos de novo termina.';

/** `true` enquanto o modo Ligar está aberto. */
export function bindModeOpen(): boolean {
  return bindOpen;
}

/** Abre ou fecha o modo. Devolve `true` quando alguma coisa mudou. */
export function setBindMode(open: boolean): boolean {
  if (bindOpen === open) return false;
  bindOpen = open;
  for (const listener of bindListeners) listener(open);
  return true;
}

/** O botão Ligar: abre se está fechado, fecha se está aberto. Devolve o novo estado. */
export function toggleBindMode(): boolean {
  setBindMode(!bindOpen);
  return bindOpen;
}

/** Avisa quando o modo abre ou fecha. Devolve a função que desliga o aviso. */
export function onBindModeChange(listener: (open: boolean) => void): () => void {
  bindListeners.add(listener);
  return () => bindListeners.delete(listener);
}

/**
 * O que um clique num osso faz com o modo aberto: `ligar` quando ele está fora
 * da lista, `tirar` quando já está nela. Puro — a conta que a dica do botão e
 * o teste leem sem tocar no documento.
 */
export function bindClick(table: WeightTable, bone: number): 'ligar' | 'tirar' {
  return influencingBones(table).includes(bone) ? 'tirar' : 'ligar';
}

/**
 * O clique num osso com o modo aberto, na cena ou na Árvore: liga ou tira, num
 * passo de desfazer só, pelo mesmo `toggleMeshBone` do lote 63. Devolve `true`
 * quando tratou o clique — e aí a seleção NÃO muda, que é a regra do Spine: a
 * malha fica escolhida do começo ao fim.
 */
export function bindModeClick(doc: EditorDoc, bone: string): boolean {
  if (!bindOpen) return false;
  const ref = selectedMesh(doc);
  if (ref === null) return false;
  doc.notice(toggleMeshBone(doc, bone, ref.slot, ref.attachment));
  return true;
}

/**
 * O clique na CENA com o modo aberto — conserto do lote 70.
 *
 * O Humberto, 12/09/2026, na v11.6: *"eu vi onde estava a corrente; quando
 * clica nela e no osso, não funciona"*. E não funcionava mesmo: o clique só
 * ligava com a ferramenta **Pesos** na mão, e o programa abre com o
 * **Transformar**. Quem aperta Ligar e clica no osso estava só trocando a
 * seleção — e, pior, derrubando a malha junto.
 *
 * No Spine e no DragonBones, Bind é um **modo**: enquanto está aberto, o
 * clique no osso liga, com qualquer ferramenta na mão. Por isso quem atende
 * agora é a CENA, antes da ferramenta. Clique fora de osso nenhum não faz
 * nada: um modo faz uma coisa só, e deixar o clique passar derrubaria a malha.
 *
 * Devolve `true` quando o modo tratou o clique — e aí a ferramenta não o vê.
 */
export function bindModeSceneClick(
  doc: EditorDoc, worldX: number, worldY: number, scale: number,
): boolean {
  if (!bindOpen) return false;
  const hit = pickAll(doc.skeleton, worldX, worldY, scale).find((pick) => pick.kind === 'bone');
  if (hit === undefined) return true;
  bindModeClick(doc, hit.bone);
  return true;
}

// ---------------------------------------------------------------------------
// A cor de cada osso ligado — lote 69
// ---------------------------------------------------------------------------

/**
 * As cores dos ossos sem cor própria. Oito matizes bem separados, que se
 * distinguem no claro e no escuro, e que não são o azul do contorno da malha
 * nem o amarelo da seleção.
 */
const PALETA: readonly string[] = Object.freeze([
  '#e0533d', '#2f7fd8', '#4f9e3f', '#d08a1e',
  '#8e55c6', '#1d9b95', '#c8407f', '#6f7d33',
]);

/** Um `Color4` do formato (`0..1`) como o navegador lê. */
function cssColor(color: readonly number[]): string {
  const byte = (value: number): number => Math.max(0, Math.min(255, Math.round((value ?? 0) * 255)));
  return `rgb(${byte(color[0]!)}, ${byte(color[1]!)}, ${byte(color[2]!)})`;
}

/**
 * A cor de um osso na pizza dos pesos e na bolinha da lista — lote 69.
 *
 * O Spine e o DragonBones dão **uma cor a cada osso ligado**: é o que faz duas
 * influências serem lidas de uma olhada. Osso com cor própria no arquivo usa a
 * dele; sem cor, uma da paleta **pelo índice**, sempre a mesma, para a cor não
 * pular de osso quando a lista muda.
 */
export function boneColor(file: BoneFile, index: number): string {
  const own = file.bones?.[index]?.color;
  if (own !== undefined && own.length >= 3) return cssColor(own);
  const slot = ((index % PALETA.length) + PALETA.length) % PALETA.length;
  return PALETA[slot]!;
}

// ---------------------------------------------------------------------------
// O raio do pincel — lote 69, buraco 6
// ---------------------------------------------------------------------------

/** O raio com que o pincel nasce, em px do esqueleto. */
export const FACTORY_RADIUS = 40;

/**
 * O raio que o pincel devia ter para esta malha — **um quarto do maior lado**,
 * nunca menos que 4.
 *
 * O pincel nascia com 40 para toda malha. Numa peça de 44 px de largura uma
 * pincelada cobria a peça inteira, e pintar peso virava tudo ou nada. Um
 * quarto do lado maior dá quatro passadas de ponta a ponta, que é o que o
 * Spine e o DragonBones mostram nos seus vídeos.
 */
export function initialRadius(geometry: MeshGeometry): number {
  const box = boundsOf(geometry.vertices);
  const side = Math.max(box.maxX - box.minX, box.maxY - box.minY);
  return Math.max(4, Math.round(side / 4));
}

// ---------------------------------------------------------------------------
// A linha "Escolha a ferramenta" — lote 69, buraco 5
// ---------------------------------------------------------------------------

/** As ferramentas com que a aba Malha e pesos trabalha. */
export const MESH_TOOLS: readonly string[] = Object.freeze(['mesh', 'weights']);

/**
 * A aba precisa dizer *"Escolha a ferramenta Malha (M) ou Pesos (G)"*? — puro.
 *
 * A linha ficava na tela depois de apertar G, porque a aba só se refazia
 * quando o DOCUMENTO mudava, e trocar de ferramenta não muda o documento. A
 * conta mora aqui; quem ouve a troca é a aba (`onActiveToolChange`).
 */
export function toolHintNeeded(toolId: string): boolean {
  return !MESH_TOOLS.includes(toolId);
}

// ---------------------------------------------------------------------------
// A porta é uma só — pedido de 13/09/2026
// ---------------------------------------------------------------------------

/**
 * A aba deve ligar a ferramenta Malha sozinha agora? — puro.
 *
 * O Humberto: *"quando está mexendo com as malhas, podia ligar a ferramenta
 * Malha. Eu mexo na aba mas as coisas só aparecem quando mexo na
 * ferramenta."* Como o Spine e o DragonBones: entrar no editor de malha liga
 * o gesto na cena sozinho — a porta é uma só.
 *
 * `true` só numa TROCA de malha (`key` mudou desde a última vez), com a
 * ferramenta de agora fora de Malha/Pesos. Nunca `true` de novo enquanto a
 * pessoa segue na mesma malha, e nunca quando ela já está com Malha ou Pesos
 * na mão: uma ferramenta que muda sozinha sem esse cuidado assusta.
 *
 * Vale nos dois modos desde 14/09/2026 (plano "fluxo criar e animar", lote
 * 2): a ferramenta Malha deixou de existir só em Montagem, e o gesto
 * automático é o mesmo motivo dos dois lados — ninguém quer abrir a aba e
 * ter que apertar M também.
 *
 * **Desde 29/09/2026 (K11, decisão P21): só a malha RECÉM-CRIADA.** Achado por
 * dois chats de uso: com Transformar na mão, CLICAR no rosto do herói ligava
 * a Malha e o gizmo do osso sumia — e com a aba Malha e pesos escondida atrás
 * de Animações. Escolher não troca de ferramenta. `created` é o
 * `slot/anexo` que o "Virar malha" acabou de fazer — um clique na própria
 * aba, que portanto está à vista; `null` para todo o resto.
 */
export function shouldAutoPickMeshTool(created: string | null, activeTool: string): boolean {
  return created !== null && !MESH_TOOLS.includes(activeTool);
}

// ---------------------------------------------------------------------------
// Os pesos que se veem — rodada 17, L2 + L3, L1a, L11b (05/10/2026)
// ---------------------------------------------------------------------------

/**
 * Depois de **Pesos automáticos**, Suavizar e Podar, a cena tem de mostrar o
 * que mudou (L2). Com a Malha na mão ela mostrava os quadrados brancos de
 * sempre, e o rodapé só repetia o nome do botão. A pizza de cada vértice é
 * da ferramenta **Pesos** (`G`): é ela que entra na mão, como no Spine, onde
 * o resultado de Auto aparece na vista Weights.
 */
export function shouldTakeWeightsTool(activeTool: string): boolean {
  return activeTool !== 'weights';
}

/** Como testar e como voltar — L11b. Uma linha, sob os botões de Pesos. */
export const WEIGHTS_TEST_HINT =
  'Testar: gire um osso ligado e veja a malha seguir. Ctrl+Z volta o último passo dos pesos';

/**
 * A frase do rodapé depois de um gesto de pesos — L2 e L3: o resultado no
 * rodapé (e não só no fim da aba, abaixo da dobra), e o que a cena mostra.
 */
export function weightsDoneNotice(result: string, tookTool: boolean): string {
  const base = result.replace(/[.\s]+$/, '');
  return tookTool
    ? `${base}. A ferramenta Pesos (G) ligou: cada vértice mostra a pizza dos ossos que o puxam`
    : base;
}

/** O Pincel aberto pela mão põe a ferramenta Pesos na mão — L1a. */
export const BRUSH_TOOL_NOTICE =
  'Pincel na mão (ferramenta Pesos, G): escolha o osso na lista ou na cena e arraste sobre a malha';

// ---------------------------------------------------------------------------
// O padrão da aba — rodada 41, lote 1 (06/10/2026)
// ---------------------------------------------------------------------------

/**
 * Um número do Pincel, com unidade e faixa — rodada 41, lote 1.
 *
 * O Humberto, 06/10, sobre outro painel: *"uma caixa com (0.5), não entendi:
 * é de 0 a 1?"*. A conferência da rodada 41 (doc `43`, foto `30`) achou a
 * mesma caixa aqui: **Raio 11** e **Força 0,5**, sem unidade, sem faixa, sem
 * dica. O Spine mostra a força em **%**; o arquivo e o pincel continuam em
 * `0..1` — só a tela converte (`toScreen` / `fromScreen`).
 */
export interface BrushField {
  readonly id: 'radius' | 'strength';
  /** Rótulo curto, com a unidade: "Raio (px)". */
  readonly label: string;
  readonly unit: 'px' | '%';
  /** Faixa e passo NA TELA. */
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** A frase inteira: o que é, a unidade e a faixa. */
  readonly tip: string;
  /** Do pincel (`BrushSettings`) para a tela. */
  toScreen(value: number): number;
  /** Da tela para o pincel. */
  fromScreen(value: number): number;
}

export const BRUSH_FIELDS: Readonly<Record<'radius' | 'strength', BrushField>> = Object.freeze({
  radius: Object.freeze({
    id: 'radius', label: 'Raio', unit: 'px', min: 1, max: 400, step: 1,
    tip: 'Raio do pincel, em pixels do esqueleto, de 1 a 400 px. O círculo azul na cena mostra o tamanho. Com a ferramenta Pesos na mão, as teclas [ e ] diminuem e aumentam',
    toScreen: (value: number) => Math.round(value),
    fromScreen: (value: number) => value,
  }),
  strength: Object.freeze({
    id: 'strength', label: 'Força', unit: '%', min: 0, max: 100, step: 5,
    tip: 'Quanto cada passada empurra o peso, de 0 a 100 %. Com 100 % uma passada só já pinta tudo',
    toScreen: (value: number) => Math.round(value * 100),
    fromScreen: (value: number) => value / 100,
  }),
}) as Readonly<Record<'radius' | 'strength', BrushField>>;

/** Os quatro modos do Pincel, com a dica de cada um (regra 12). */
export const BRUSH_MODES: ReadonlyArray<{
  readonly id: 'add' | 'subtract' | 'replace' | 'smooth'; readonly label: string; readonly tip: string;
}> = Object.freeze([
  { id: 'add', label: 'Somar', tip: 'Somar: a passada dá mais peso ao osso escolhido, e os outros perdem o mesmo tanto' },
  { id: 'subtract', label: 'Subtrair', tip: 'Subtrair: a passada tira peso do osso escolhido e devolve aos outros' },
  { id: 'replace', label: 'Substituir', tip: 'Substituir: a passada leva o peso do osso escolhido até 100 %, no passo da Força' },
  { id: 'smooth', label: 'Suavizar', tip: 'Suavizar: a passada mistura o peso de cada vértice com o dos vizinhos' },
]);

/**
 * As dicas dos botões da aba, **as mesmas do menu** Malha e regras — rodada
 * 41, lote 1. A aba repetia o nome na dica (*"Suavizar tudo"* dizia *"Suavizar
 * tudo"*), enquanto o menu já tinha a frase inteira. O teste confere que cada
 * frase daqui está escrita em `ui/menus.ts`, letra por letra.
 */
export const MESH_BUTTON_TIPS = Object.freeze({
  suavizar: 'Mistura os pesos dos vizinhos: a dobra fica mais macia',
  podar: 'Tira os pesos pequenos demais para fazer diferença',
  tirarPesos: 'A malha volta a seguir só o osso do slot',
  apagarVertice: 'Apaga os vértices escolhidos na malha (o mesmo que a tecla Delete)',
});

/**
 * A linha sobre a lista **Ossos que influenciam**: o que é o número de cada
 * osso — rodada 41, lote 1 (e lote 2, o vértice escolhido).
 *
 * A lista mostrava *"27%"* sem dizer que era a **média da malha inteira**: quem
 * clicava num vértice achava que lia o peso dele (doc `43`, foto `27`).
 */
export function boneListCaption(selectedVertices: number): string {
  if (selectedVertices === 1) return '% = peso do vértice escolhido · a caixa trava o osso';
  // Conferência da v31.9 (doc `49`): a frase dizia "médio" e a caixa "vários";
  // uma palavra só.
  if (selectedVertices > 1) return `% = peso dos ${selectedVertices} vértices escolhidos ("vários" = diferente entre eles) · a caixa trava o osso`;
  return '% = peso médio na malha inteira · a caixa trava o osso';
}

/** A dica da caixa Travar de um osso. */
export function lockTip(bone: string): string {
  return `Travar ${bone}: o pincel, Suavizar e Podar não mexem no peso dele`;
}

/**
 * O que a aba diz de um desenho que não é imagem nem malha — rodada 41,
 * lote 1. Dizia *"Este anexo é do tipo linkedmesh. A malha só vale para
 * desenhos"*: o nome interno, e falso (a malha ligada É desenho); e, depois de
 * desfazer o "Usar forma", *"do tipo nenhum"* — a escolha tinha ficado num
 * anexo que já não existia (doc `43`, foto `23`).
 *
 * `null` = imagem ou malha: a aba segue com a Forma.
 */
export function attachmentKindLine(type: string | null, parent?: string): string | null {
  if (type === 'region' || type === 'mesh') return null;
  if (type === null) return 'Escolha um desenho na árvore ou na tela.';
  if (type === 'linkedmesh') {
    return parent !== undefined && parent !== ''
      ? `Malha ligada: usa a forma de "${parent}". A forma e os pesos se mudam lá`
      : 'Malha ligada: usa a forma de outra malha. A forma e os pesos se mudam lá';
  }
  const nomes: Record<string, string> = {
    boundingbox: 'uma caixa de colisão',
    clipping: 'uma máscara',
    path: 'um caminho',
    point: 'um ponto',
    skeleton: 'uma entidade',
  };
  return `Este desenho é ${nomes[type] ?? `do tipo ${type}`}: virar malha só vale para imagens.`;
}

/** A frase do rodapé depois de Gerar ou Traçar: o resultado, não o nome do botão. */
export function shapeDoneNotice(hullOnly: boolean, vertices: number, triangles: number, suffix = ''): string {
  return `${hullOnly ? 'Contorno traçado' : 'Malha gerada'}: ${vertices} vértices, ${triangles} triângulos${suffix}`;
}

// ---------------------------------------------------------------------------
// O pincel na cena — rodada 41, lote 3 (06/10/2026)
// ---------------------------------------------------------------------------

/**
 * O pincel sem osso escolhido — rodada 41, lote 3. Arrastar na malha sem osso
 * na lista não fazia nada, e calado (doc `43`, §2.3; regra 21).
 */
export const BRUSH_NO_BONE_NOTICE =
  'Escolha o osso que vai pintar: clique no nome dele em Ossos que influenciam, ou no osso na cena, fora da malha';

/**
 * A frase do rodapé ao soltar uma pincelada — rodada 41, lote 3. Dizia só o
 * nome do comando, *"Pintar pesos."*: nem o osso, nem que foi para a base com
 * uma animação aberta (doc `43`, foto `50`).
 */
export function brushStrokeNotice(bone: string, changed: number, suffix = ''): string {
  // Conferência da v31.9 (doc `49`): diga quantos vértices mudaram.
  if (changed === 0) return `Peso de ${bone}: a pincelada não mudou nenhum vértice${suffix}`;
  return `Peso de ${bone} pintado em ${changed} ${changed === 1 ? 'vértice' : 'vértices'}${suffix}`;
}

/** Quantos vértices mudaram de peso entre duas tabelas — a conta do rodapé da pincelada. */
export function changedVertices(before: readonly ReadonlyMap<number, number>[], after: readonly ReadonlyMap<number, number>[]): number {
  let n = 0;
  for (let v = 0; v < after.length; v++) {
    const a = before[v] ?? new Map<number, number>();
    const b = after[v]!;
    const bones = new Set([...a.keys(), ...b.keys()]);
    for (const bone of bones) {
      if (Math.abs((a.get(bone) ?? 0) - (b.get(bone) ?? 0)) > 1e-6) { n++; break; }
    }
  }
  return n;
}

// ---------------------------------------------------------------------------
// A aba cabe, e o segundo osso ganha peso — rodada 41, lote 4 (06/10/2026)
// ---------------------------------------------------------------------------

/**
 * O aviso do alto da aba com uma animação aberta, numa linha só — rodada 41,
 * lote 4. Eram quatro linhas em 1280×720, e era ELE que empurrava todos os
 * botões para baixo da dobra (doc `43`, foto `54`). A frase inteira
 * (`MESH_REST_POSE_NOTICE`) vai na dica.
 */
// Rodada 47, lote 5 (R9 do doc 68): a frase de antes saía cortada com "…" nas
// duas telas (a coluna é 258 px). Curta à vista; a inteira na dica.
export const MESH_REST_POSE_SHORT = 'Forma e pesos gravam na base';

/**
 * Fechar o Ligar deve repartir os pesos sozinho? — rodada 41, lote 4, S1.
 *
 * O Spine reparte o peso sozinho na primeira ligação; aqui o segundo osso
 * entrava com **0 %** e a capa não dobrava até a pessoa achar Pesos
 * automáticos (doc `43`, §3, T2). `true` quando há dois ossos ou mais na lista
 * e algum deles não tem peso em vértice nenhum.
 */
export function shouldAutoWeightAfterBind(table: readonly ReadonlyMap<number, number>[]): boolean {
  const bones = new Set<number>();
  for (const vertex of table) for (const bone of vertex.keys()) bones.add(bone);
  if (bones.size < 2) return false;
  for (const bone of bones) {
    let soma = 0;
    for (const vertex of table) soma += vertex.get(bone) ?? 0;
    if (soma <= 1e-9) return true;
  }
  return false;
}

/** O rodapé quando fechar o Ligar repartiu os pesos sozinho. */
export function bindClosedNotice(bones: number, vertices: number): string {
  return `Os ${bones} ossos ligados repartiram o peso sozinhos (Pesos automáticos em ${vertices} vértices). `
    + 'Pinte para ajustar; Ctrl+Z volta';
}
