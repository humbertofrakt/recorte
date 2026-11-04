/**
 * O painel **Entidades**, como conta — degrau 5 (17/09/2026), tarefa 5.4.
 *
 * E15, palavra do Humberto (BASE §21): *"painel Entidades ao lado do Imagens"*.
 * E16, veto dele no mesmo dia: a miniatura é **parada**. Uma fila de bonecos se
 * mexendo ao lado da cena rouba o olho de quem está animando, e a miniatura
 * existe para reconhecer a peça, não para mostrá-la funcionando.
 *
 * Uma entidade é um `.bone` inteiro no papel de peça: a espada na mão, o
 * capacete na cabeça, o piloto na cabine. Ela **segue a imagem** (E5): arrastá-la
 * para a cena cria o mesmo slot que uma imagem criaria, com um anexo `skeleton`
 * no lugar do `region`. O soltar é da cena (D7, tarefa 7.2); daqui sai só o
 * arrasto, com o uri dentro.
 *
 * Este arquivo é a conta: quais entidades existem, qual delas tem arquivo
 * aberto, e o que cada linha diz. Ele não desenha nada.
 */

import type { SkeletonData } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { bodyLabel, projetoDe } from '../doc/projeto.js';

/**
 * O tipo que o arrasto de uma entidade carrega.
 *
 * É outro tipo, e não o das imagens (`DRAG_TYPE`): quem recebe precisa saber, no
 * `dragover`, se o que vem é uma imagem ou um corpo inteiro — e descobrir isso
 * só no `drop` deixaria o cursor mentindo o caminho todo.
 */
export const ENTITY_DRAG_TYPE = 'text/x-recorte-entidade';

/** Uma linha do painel Entidades. */
export interface EntityRow {
  /** O uri do arquivo, como o anexo `skeleton` o escreve (§7.11). */
  uri: string;
  /** O nome que se lê: o `skeleton.name` quando ele é conhecido, ou o arquivo. */
  name: string;
  /**
   * `true` quando o `.bone` dela está aberto nesta sessão — um corpo que foi
   * rebaixado. Só essas podem ser promovidas de volta na hora; as outras
   * precisam que o arquivo seja lido da pasta do projeto.
   */
  aberta: boolean;
  /** Rodada 39: uma base do projeto (não o aberto), na prateleira. */
  base?: boolean;
}

/**
 * As entidades do projeto, na ordem em que entraram na lista.
 *
 * Um documento **sem projeto** não tem lista nenhuma: as entidades vivem no
 * `manifest.extras.RECORTE_projeto`, e sem manifesto não há projeto. A lista
 * vem vazia, e o painel diz o que fazer em vez de ficar mudo (regra 21).
 */
export function listEntities(doc: EditorDoc): EntityRow[] {
  const projeto = projetoDe(doc);
  if (projeto === null) return [];
  return [...projeto.entidades].map((uri) => {
    const guardado = projeto.guardados.get(uri) ?? null;
    return { uri, name: entityName(uri, guardado), aberta: guardado !== null };
  });
}

/**
 * O nome que se lê numa linha: o `skeleton.name` do arquivo aberto, ou o nome
 * do arquivo **sem a extensão**.
 *
 * `espada.bone` vira `espada`. A linha tem 76px de largura, e quatro letras de
 * extensão repetidas em toda linha não dizem nada que a aba já não diga.
 */
function entityName(uri: string, guardado: Parameters<typeof bodyLabel>[1]): string {
  const nome = bodyLabel(uri, guardado);
  return nome === uri.split(/[\\/]/).pop() ? nome.replace(/\.bone$/i, '') : nome;
}

/**
 * O esqueleto montado de uma entidade, para a miniatura, ou `null`.
 *
 * Duas procedências, e as duas valem: o esqueleto aninhado que veio com o
 * arquivo aberto (§7.11, o caminho de sempre) e o `data` de um corpo que foi
 * rebaixado nesta sessão. Sem nenhum dos dois a linha fica com o nome e sem
 * desenho — que é a verdade, e não um quadrado cinza fingindo uma peça.
 */
export function entityData(doc: EditorDoc, uri: string): SkeletonData | null {
  const projeto = projetoDe(doc);
  const guardado = projeto?.guardados.get(uri)?.data ?? null;
  if (guardado !== null) return guardado;
  const nested = (doc as { skeletons?: ReadonlyMap<string, SkeletonData> }).skeletons;
  return nested?.get(uri) ?? null;
}

/** A frase de quando não há entidade nenhuma. */
export const NO_ENTITIES =
  'Nenhuma entidade. Uma entidade é um `.bone` inteiro usado como peça: a espada na mão, '
  + 'o capacete na cabeça. Elas entram pela pasta do projeto (Arquivo → Abrir pasta do projeto…), '
  + 'ou rebaixando uma base na janela Animação';

/** A dica de uma linha: o que ela é, e os dois gestos que ela aceita. */
export function entityHint(row: EntityRow, temDesenho: boolean): string {
  const estado = row.aberta
    ? 'base rebaixada nesta sessão, com o arquivo inteiro guardado'
    : 'entidade do projeto';
  const sem = temDesenho ? '' : '. O esqueleto dela não está carregado: a miniatura fica sem desenho';
  return `${row.name}: ${estado}${sem}. Arraste para a cena para pendurar esta peça. `
    + 'Botão direito: Promover a base';
}

/** O rodapé de quando o arquivo de uma entidade não está na pasta do projeto. */
export function entityFileMissing(uri: string, pasta: string | null): string {
  return pasta === null
    ? `Não há pasta de projeto aberta para procurar ${uri}. Arquivo → Abrir pasta do projeto…`
    : `${uri} não está na raiz da pasta ${pasta}`;
}

/**
 * **A prateleira da aba** — rodada 39, lote 2 (nota da conferência do lote 1).
 *
 * As entidades do projeto, e depois **as outras bases**: *"base ou entidade
 * depende de onde eu estou"* (`02`, seção 2). Promover a espada a base tirava
 * ela da lista de entidades, e a prateleira dizia "Nenhuma entidade" com a
 * espada ainda na mão do herói. O projeto aberto não entra: há um só, e ele é
 * o cartão AQUI.
 */
export function shelfRows(doc: EditorDoc): EntityRow[] {
  const rows = listEntities(doc);
  const projeto = projetoDe(doc);
  if (projeto === null) return rows;
  const ja = new Set(rows.map((row) => row.uri));
  for (const uri of projeto.outrosCorpos) {
    if (ja.has(uri)) continue;
    rows.push({ uri, name: entityName(uri, projeto.docOf(uri)), aberta: false, base: true });
  }
  return rows;
}

/** O esqueleto de uma linha da prateleira: entidade, ou base do projeto. */
export function shelfData(doc: EditorDoc, uri: string): SkeletonData | null {
  return entityData(doc, uri) ?? projetoDe(doc)?.docOf(uri)?.data ?? null;
}

/** A dica de uma linha da prateleira que é uma base do projeto. */
export function shelfBaseHint(row: EntityRow): string {
  return `${row.name}: base do projeto. Arraste até a linha de um slot, na Montagem, para pô-la ali em teste, `
    + 'ou para a cena, para pendurá-la no osso em que ela cair';
}
