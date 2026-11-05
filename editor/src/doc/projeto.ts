/**
 * O projeto — degrau 4b (17/09/2026). `ARQUITETO 3` §1 e §14, spec 2.9 e 9.13.
 *
 * O documento é UM `.bone`; o projeto tem vários: o homem e o lobisomem, cada
 * um com a base dele, os ossos dele, as peles dele. Palavra do Humberto (BASE
 * §18): *"não existe 'isto é base, aquilo é entidade' por natureza. Existe onde
 * você encaixou."* Então o papel de cada arquivo — corpo ou entidade — é do
 * editor, e mora no `manifest.extras.RECORTE_projeto`, que um leitor ignora:
 *
 *     { "corpos": [uri], "entidades": [uri], "emFoco": uri }
 *
 * A pasta de trabalho é o `.bonez` aberto (saída **a** de §1.3): um
 * `manifest.json`, um `.bone` por corpo e por entidade, um atlas. `main` é o
 * corpo em foco na hora de salvar — o que um jogo toca sem perguntar.
 *
 * Três regras, e cada uma cabe numa linha:
 *
 *   - **`Command` continua por `Doc`.** O comando muda o arquivo do corpo em que
 *     foi aplicado; o projeto não tem comando próprio.
 *   - **Uma pilha de desfazer só.** Todo corpo recebe a mesma `UndoStack`, que
 *     anota o dono de cada passo e reverte nele.
 *   - **Quem ouve é o corpo em foco.** A cena, os painéis e a barra ouvem UM
 *     documento. Um passo dado noutro corpo (a mexida estrutural que foi para a
 *     base do lobisomem) volta para o foco por `reflect`, com o ator refeito e
 *     o rodapé dizendo *"(na base do lobisomem)"*.
 *
 * Módulo do degrau 1: importa só o contrato e a base. Sem DOM.
 */

import type { AtlasPageData, SkeletonData } from '../../../runtime/src/index.js';
import type { DocChange, EditorDoc } from '../contract.js';
import { corpoDe } from '../contract.js';
import { Doc } from './document.js';
import type { BodyProvider } from './document.js';
import type { UndoStack } from './undo.js';

// ---------------------------------------------------------------------------
// O manifesto e as listas — puro
// ---------------------------------------------------------------------------

/** A chave em `manifest.extras` onde as listas do editor moram (spec 2.9). */
export const PROJECT_EXTRA = 'RECORTE_projeto';

/** O `manifest.json` de um pacote `.bonez` (spec 2.9), o que este módulo lê. */
export interface ProjectManifest {
  bonez: { version: string };
  main: string;
  skeletons?: string[];
  atlases?: string[];
  images?: string[];
  audio?: string[];
  hashes?: Record<string, string>;
  extras?: Record<string, unknown>;
}

/** As duas listas da janela e o corpo em foco. Estado do editor. */
export interface ProjectLists {
  corpos: string[];
  entidades: string[];
  emFoco: string;
}

/** Um manifesto novo, de um corpo só. */
export function emptyManifest(main: string): ProjectManifest {
  return { bonez: { version: '1.0' }, main, skeletons: [main] };
}

/** `true` para um texto que é um manifesto de pacote (spec 2.9). */
export function isProjectManifest(value: unknown): value is ProjectManifest {
  if (value === null || typeof value !== 'object') return false;
  const m = value as { bonez?: unknown; main?: unknown };
  return typeof m.main === 'string' && m.main.length > 0
    && m.bonez !== null && typeof m.bonez === 'object';
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/**
 * As listas, lidas do manifesto.
 *
 * Sem `RECORTE_projeto` (um pacote de outro programa, ou de antes do degrau
 * 4b) a regra é a do leitor: `main` é o corpo, e o resto de `skeletons` são
 * entidades. Uri que está na lista mas não em `skeletons` entra mesmo assim:
 * a lista do editor sabe mais do que o leitor precisa. `emFoco` que não é
 * corpo cai no `main`; `main` que não é corpo vira o primeiro corpo.
 */
export function readProjectLists(manifest: ProjectManifest): ProjectLists {
  const skeletons = stringList(manifest.skeletons);
  const extra = manifest.extras?.[PROJECT_EXTRA] as { corpos?: unknown; entidades?: unknown; emFoco?: unknown } | undefined;
  let corpos = extra === undefined ? [] : stringList(extra.corpos);
  let entidades = extra === undefined ? [] : stringList(extra.entidades);
  if (corpos.length === 0) {
    corpos = [manifest.main];
    entidades = skeletons.filter((uri) => uri !== manifest.main);
  }
  if (!corpos.includes(manifest.main)) corpos = [manifest.main, ...corpos];
  entidades = entidades.filter((uri) => !corpos.includes(uri));
  const wanted = extra === undefined ? manifest.main : String(extra.emFoco ?? manifest.main);
  const emFoco = corpos.includes(wanted) ? wanted : corpos[0]!;
  return { corpos: [...new Set(corpos)], entidades: [...new Set(entidades)], emFoco };
}

/**
 * Escreve as listas no manifesto: `main` = o corpo em foco (o que o jogo toca
 * sem perguntar), `skeletons` = todos os corpos e entidades (todo corpo que
 * uma chave `body` cita DEVE estar lá, 2.9), e as listas em `extras`.
 */
export function writeProjectLists(manifest: ProjectManifest, lists: ProjectLists): ProjectManifest {
  const corpos = [...new Set(lists.corpos)];
  const entidades = [...new Set(lists.entidades)].filter((uri) => !corpos.includes(uri));
  const emFoco = corpos.includes(lists.emFoco) ? lists.emFoco : (corpos[0] ?? manifest.main);
  const skeletons = [...new Set([...corpos, ...entidades, ...stringList(manifest.skeletons)])];
  return {
    ...manifest,
    main: emFoco,
    skeletons,
    // Rodada 39: o que mais o editor guarda ali (a montagem de teste) fica.
    // Só as três listas são escritas por cima.
    extras: {
      ...(manifest.extras ?? {}),
      [PROJECT_EXTRA]: { ...((manifest.extras?.[PROJECT_EXTRA] as Record<string, unknown> | undefined) ?? {}), corpos, entidades, emFoco },
    },
  };
}

/** O nome que o rodapé usa para um corpo: `skeleton.name`, ou o uri sem a pasta. */
export function bodyLabel(uri: string, doc: Doc | null): string {
  const name = doc?.file.skeleton?.name;
  if (typeof name === 'string' && name.length > 0) return name;
  return uri.split(/[\\/]/).pop() ?? uri;
}

// ---------------------------------------------------------------------------
// O projeto
// ---------------------------------------------------------------------------

/** Os tipos de mudança de outro corpo que o foco precisa refletir. */
const REFLECTED: ReadonlySet<DocChange['kind']> = new Set(['structure', 'file', 'assets', 'transform']);

export class Projeto implements BodyProvider {
  /** Os corpos, pelo uri (o valor que uma chave `body` escreve). Inclui o foco. */
  readonly corpos = new Map<string, Doc>();
  /** As entidades listadas na janela, pelo uri. Fechadas: não têm `Doc`. */
  readonly entidades = new Set<string>();
  /**
   * Os documentos dos corpos **rebaixados a entidade** nesta sessão — degrau 5.
   *
   * Rebaixar não fecha o arquivo: ele sai da lista Corpos (deixa de ser alvo de
   * uma chave `body`, deixa de ter animações na janela) e fica guardado aqui,
   * inteiro. Promover de volta é instantâneo e não perde uma vírgula — e o
   * desfazer de um passo dado nele continua achando o dono, porque a pilha
   * pergunta primeiro pelo uri e este mapa responde.
   */
  readonly guardados = new Map<string, Doc>();
  /** A pilha de desfazer, uma para todos os corpos. */
  readonly undo: UndoStack;
  /** O manifesto como veio da pasta, ou um novo. As listas são escritas por cima ao salvar. */
  manifesto: ProjectManifest;
  /**
   * **A cena montada** — rodada 8b, C10. Enquanto não é `null`, a base em foco
   * é uma entidade aberta por dentro (`entity`), e a cena desenha em volta
   * dela a base de onde ela saiu (`host`), parada, sem o slot `slot` — que é
   * onde a entidade em foco está. `promoted`: foi a abertura que a pôs em
   * Bases, e a volta a devolve a Entidades.
   */
  cenaMontada: { host: string; slot: string; entity: string; promoted: boolean } | null = null;

  private readonly foco: Doc;
  private focoUri: string;
  private readonly unsubscribe = new Map<Doc, () => void>();
  /** Enquanto um `reflect` corre, nada é refletido de novo: sem eco. */
  private relaying = false;
  /** Enquanto um projeto de vários corpos é montado, `setFile` no foco não zera. */
  private opening = false;

  /**
   * O projeto nasce em volta do documento que a casca já segura: é ele que a
   * cena e os painéis ouvem. Começa como projeto de um corpo — o próprio.
   */
  constructor(foco: Doc, undo?: UndoStack) {
    this.foco = foco;
    // A pilha do foco é a do projeto: os outros corpos nascem com ela.
    this.undo = undo ?? foco.stackForProject();
    this.focoUri = foco.path ?? foco.name;
    this.manifesto = emptyManifest(this.focoUri);
    this.corpos.set(this.focoUri, foco);
    foco.project = this;
    this.listen(this.focoUri, foco);
    // Degrau 5: o foco troca de corpo sem trocar de objeto, e a pilha precisa
    // saber quem segura cada uri AGORA, não quem o segurava quando o passo foi
    // dado. Ver `UndoStack.resolveByUri`.
    this.undo.resolveByUri = (uri) => this.docDe(uri);
  }

  /** O documento de um uri: um corpo da lista, ou um corpo rebaixado guardado. */
  private docDe(uri: string): EditorDoc | null {
    return this.corpos.get(uri) ?? this.guardados.get(uri) ?? null;
  }

  /** O documento em foco: o que a cena mostra e a casca segura. */
  get emFoco(): Doc {
    return this.foco;
  }

  /** O uri do corpo em foco. */
  get emFocoUri(): string {
    return this.focoUri;
  }

  /** As listas de agora, para o manifesto. */
  get lists(): ProjectLists {
    return { corpos: [...this.corpos.keys()], entidades: [...this.entidades], emFoco: this.focoUri };
  }

  /** Os uris dos outros corpos, na ordem da lista. */
  get outrosCorpos(): string[] {
    return [...this.corpos.keys()].filter((uri) => uri !== this.focoUri);
  }

  /**
   * Abre um projeto de vários corpos em volta do foco: o `.bone` em foco entra
   * pelo `setFile` (a porta de sempre), e cada outro corpo vira um `Doc` com a
   * MESMA pilha. `open` recebe já o que o `io/` leu de cada arquivo.
   */
  open(
    manifesto: ProjectManifest,
    lists: ProjectLists,
    bodies: ReadonlyMap<string, { file: Parameters<Doc['setFile']>[0]; options: Parameters<Doc['setFile']>[1] }>,
  ): void {
    const main = bodies.get(lists.emFoco);
    if (main === undefined) throw new Error(`A base em foco "${lists.emFoco}" não foi lido.`);
    this.opening = true;
    try {
      this.reset(lists.emFoco);
      this.manifesto = manifesto;
      for (const uri of lists.entidades) this.entidades.add(uri);
      // Os outros corpos primeiro: o `setFile` do foco monta o ator com eles.
      for (const uri of lists.corpos) {
        if (uri === lists.emFoco) continue;
        const body = bodies.get(uri);
        if (body === undefined) continue;
        const doc = new Doc(body.file, { ...body.options, path: uri, undo: this.undo });
        doc.project = this;
        this.corpos.set(uri, doc);
        this.listen(uri, doc);
      }
      this.foco.setFile(main.file, { ...main.options, path: lists.emFoco });
    } finally {
      this.opening = false;
    }
  }

  /** Volta a ser um projeto de um corpo: o foco, com o uri dado. */
  private reset(focoUri: string): void {
    for (const [uri, doc] of [...this.corpos]) {
      if (doc === this.foco) continue;
      this.unsubscribe.get(doc)?.();
      this.unsubscribe.delete(doc);
      doc.project = null;
      this.corpos.delete(uri);
    }
    this.corpos.delete(this.focoUri);
    this.focoUri = focoUri;
    this.corpos.set(focoUri, this.foco);
    this.entidades.clear();
    this.guardados.clear();
    this.cenaMontada = null;
    this.manifesto = emptyManifest(focoUri);
  }

  /** `true` quando há mais de um arquivo no projeto: é aí que a pasta ganha `manifest.json`. */
  get temVarios(): boolean {
    return this.corpos.size + this.entidades.size > 1;
  }

  /** Marca todos os corpos como salvos, com o foco no caminho dado. */
  markSaved(focoPath: string | null = this.foco.path): void {
    for (const doc of this.corpos.values()) {
      if (doc === this.foco) continue;
      doc.markSaved();
    }
    this.foco.markSaved(focoPath);
  }

  // --- A janela Animação: trocar de corpo, promover, rebaixar (degrau 5) ----

  /**
   * **Troca o corpo em foco** — 5.1. Devolve `false` quando não há o que trocar.
   *
   * O objeto `Doc` que a casca segura não muda: o que muda é o corpo dentro
   * dele (`trocarCorpoCom`). As duas chaves do mapa trocam de valor no mesmo
   * instante, e por isso o ator de cada um continua certo — ele foi montado
   * com *"os outros corpos"*, e os outros são os mesmos.
   *
   * A agulha e a animação aberta viajam com o corpo: quem volta ao homem
   * encontra a animação e o segundo em que estava.
   */
  trocarFoco(uri: string): boolean {
    const alvo = this.corpos.get(uri);
    if (alvo === undefined || alvo === this.foco || uri === this.focoUri) return false;
    const antigo = this.focoUri;
    this.relaying = true;
    try {
      this.foco.trocarCorpoCom(alvo);
      // `set` numa chave que já existe não muda a ORDEM do mapa: a lista
      // Corpos continua na ordem do manifesto depois da troca.
      this.corpos.set(antigo, alvo);
      this.corpos.set(uri, this.foco);
      this.focoUri = uri;
      this.listen(antigo, alvo);
      this.listen(uri, this.foco);
    } finally {
      this.relaying = false;
    }
    this.foco.reflect({ kind: 'file', label: `Base ${this.nameOf(uri)}` });
    return true;
  }

  /**
   * Põe um corpo novo no projeto — o **Salvar como base nova** (5.2) e o
   * **Promover** de uma entidade que o `io/` acabou de ler (5.3).
   *
   * `false` quando o uri já é corpo: dois corpos com o mesmo uri seriam duas
   * respostas para a mesma chave `body`.
   */
  adicionarCorpo(uri: string, doc: Doc): boolean {
    if (uri.length === 0 || this.corpos.has(uri)) return false;
    this.entidades.delete(uri);
    this.guardados.delete(uri);
    doc.project = this;
    this.corpos.set(uri, doc);
    this.listen(uri, doc);
    this.foco.reflect({ kind: 'structure', label: `Base ${this.nameOf(uri)} entrou no projeto` });
    return true;
  }

  /**
   * **Tira um corpo do projeto** — rodada 9, o desfazer do Marcar como slot e o
   * Desmarcar. O documento fica em `guardados`, para o refazer e para a pilha
   * achar o dono de um passo dado nele. Nunca o foco: `false`.
   */
  tirarCorpo(uri: string): boolean {
    const doc = this.corpos.get(uri);
    if (doc === undefined || uri === this.focoUri || doc === this.foco) return false;
    this.unsubscribe.get(doc)?.();
    this.unsubscribe.delete(doc);
    this.corpos.delete(uri);
    this.guardados.set(uri, doc);
    this.foco.reflect({ kind: 'structure', label: `Base ${this.nameOf(uri)} saiu do projeto` });
    return true;
  }

  /**
   * **Uma entidade trazida de fora entra no projeto** — rodada 8b, C18.
   *
   * Arquivo → Trazer para o projeto → Abrir uma entidade… punha o uri na lista
   * e o documento em `guardados`, mas não avisava ninguém: o cartão só aparecia
   * na aba Entidades no desenho seguinte, por outro motivo. Agora o foco avisa
   * quem o ouve, como no Promover e no Rebaixar.
   */
  adicionarEntidade(uri: string, doc: Doc): boolean {
    if (uri.length === 0 || this.corpos.has(uri)) return false;
    doc.project = this;
    this.entidades.add(uri);
    this.guardados.set(uri, doc);
    this.foco.reflect({ kind: 'structure', label: `Entidade ${this.nameOf(uri)} entrou no projeto` });
    return true;
  }

  /**
   * **Promover** uma entidade a corpo — E2, 5.3. *Move de lista; nada muda no
   * dado.* `doc` é o arquivo já lido, quando quem chama teve como lê-lo.
   *
   * Sem `Doc` nenhum — nem guardado desta sessão, nem lido agora — a promoção
   * **não acontece**, e devolve `'sem-arquivo'`: uma entidade é uma
   * `SkeletonData` montada, não um `.bone` que se possa editar, e pôr em Corpos
   * um corpo que não abre seria prometer uma porta que não existe (regra 21).
   */
  promover(uri: string, doc?: Doc): 'feito' | 'ja-e-corpo' | 'sem-arquivo' {
    if (this.corpos.has(uri)) return 'ja-e-corpo';
    const guardado = this.guardados.get(uri) ?? doc ?? null;
    if (guardado === null) return 'sem-arquivo';
    this.adicionarCorpo(uri, guardado);
    return 'feito';
  }

  /**
   * **Rebaixar** um corpo a entidade — E2, 5.3. Ele sai de Corpos, entra em
   * Entidades, e o documento dele fica guardado inteiro (`guardados`).
   *
   * `'e-o-foco'` para o corpo em foco: troque o foco antes. `'ultimo'` para o
   * único corpo do projeto — um projeto sem corpo nenhum não tem o que mostrar.
   */
  rebaixar(uri: string): 'feito' | 'e-o-foco' | 'ultimo' | 'nao-e-corpo' {
    const doc = this.corpos.get(uri);
    if (doc === undefined) return 'nao-e-corpo';
    if (uri === this.focoUri || doc === this.foco) return 'e-o-foco';
    if (this.corpos.size <= 1) return 'ultimo';
    this.unsubscribe.get(doc)?.();
    this.unsubscribe.delete(doc);
    this.corpos.delete(uri);
    this.guardados.set(uri, doc);
    this.entidades.add(uri);
    // O ator do foco segurava aquele corpo: refazer é o que tira a chave `body`
    // que apontava para ele do ar — e ela passa a avisar `BODY_MISSING` (9.13).
    this.foco.reflect({ kind: 'structure', label: `${this.nameOf(uri)} virou entidade` });
    return 'feito';
  }

  // --- BodyProvider --------------------------------------------------------

  bodies(self: Doc): ReadonlyMap<string, SkeletonData> {
    const out = new Map<string, SkeletonData>();
    for (const [uri, doc] of this.corpos) {
      if (doc === self || doc.data === null) continue;
      out.set(uri, doc.data);
    }
    return out;
  }

  docOf(uri: string): Doc | null {
    return this.corpos.get(uri) ?? null;
  }

  /** O uri que aquele documento segura AGORA — degrau 5, para a pilha. */
  uriOf(self: Doc): string | null {
    for (const [uri, doc] of this.corpos) if (doc === self) return uri;
    for (const [uri, doc] of this.guardados) if (doc === self) return uri;
    return null;
  }

  /**
   * A página de uma entidade (ou de outro corpo) para quem a desenha — 05/11.
   * Só a página que pertence a um atlas daquele documento: a identidade manda.
   */
  pageImage(self: Doc, page: AtlasPageData): CanvasImageSource | null {
    for (const doc of [...this.corpos.values(), ...this.guardados.values()]) {
      if (doc === self || !doc.atlases.some((atlas) => atlas.pages.includes(page))) continue;
      const image = doc.ownImageFor(page);
      if (image !== null) return image;
    }
    return null;
  }

  nameOf(uri: string): string {
    return bodyLabel(uri, this.corpos.get(uri) ?? this.guardados.get(uri) ?? null);
  }

  dirtyBeyond(self: Doc): boolean {
    for (const doc of this.corpos.values()) {
      if (doc !== self && doc.dirtyOwn) return true;
    }
    return false;
  }

  fileReplaced(self: Doc): void {
    if (self !== this.foco || this.opening) return;
    // Novo, Abrir, importar: é outro projeto, de um corpo só, com o nome novo.
    this.reset(self.path ?? self.name);
    // As entidades aninhadas do arquivo aberto (7.11) já são a lista Entidades.
    for (const uri of self.skeletons.keys()) this.entidades.add(uri);
    this.manifesto = emptyManifest(this.focoUri);
  }

  // --- O eco de um corpo para o foco --------------------------------------

  private listen(uri: string, doc: Doc): void {
    this.unsubscribe.get(doc)?.();
    this.unsubscribe.set(doc, doc.on((change) => this.relay(uri, doc, change)));
  }

  /**
   * Um corpo mudou. Os OUTROS refazem o ator (o esqueleto que seguram daquele
   * corpo ficou velho); e, se não foi o foco quem mudou, o foco avisa quem o
   * ouve, com o nome do corpo no rodapé. Guardado contra o eco: o `reflect`
   * do foco também emite, e essa emissão não volta aqui.
   */
  private relay(uri: string, source: Doc, change: DocChange): void {
    if (this.relaying || !REFLECTED.has(change.kind)) return;
    this.relaying = true;
    try {
      for (const other of this.corpos.values()) {
        if (other !== source && other !== this.foco) other.refreshBodies();
      }
      if (source !== this.foco) {
        const nome = this.nameOf(uri);
        this.foco.reflect({
          kind: change.kind,
          ...(change.label === undefined ? {} : { label: `${change.label} (na base de ${nome})` }),
        });
      }
    } finally {
      this.relaying = false;
    }
  }
}

/**
 * **A base do instante passa a conhecer o esqueleto da entidade** — rodada 8b,
 * C18. Uma entidade trazida de fora mora em `guardados`, e a base em que ela
 * é pendurada (ou trocada pela grade) ainda não tem o esqueleto dela no mapa
 * dos aninhados (7.11): o slot nasceria vazio, com aviso. Quem pendura chama
 * isto antes. `true` quando havia o que acrescentar.
 */
export function garantirAninhado(doc: EditorDoc, uri: string): boolean {
  const projeto = projetoDe(doc);
  const corpo = corpoDe(doc);
  if (projeto === null || !(corpo instanceof Doc) || corpo.skeletons.has(uri)) return false;
  const data = projeto.guardados.get(uri)?.data ?? projeto.docOf(uri)?.data ?? null;
  if (data === null) return false;
  corpo.replaceNested(uri, data);
  return true;
}

/**
 * **A base de onde a entidade aberta saiu**, para a cena desenhar em volta —
 * rodada 8b, C10. `null` fora da cena montada, ou sem o documento dela.
 */
export function cenaMontadaDe(doc: EditorDoc): { host: Doc; slot: string; entity: string } | null {
  const projeto = projetoDe(doc);
  const cena = projeto?.cenaMontada ?? null;
  if (projeto === null || cena === null || projeto.emFocoUri !== cena.entity) return null;
  const host = projeto.docOf(cena.host);
  return host === null ? null : { host, slot: cena.slot, entity: cena.entity };
}

/**
 * O projeto em que um documento está, ou `null` — degrau 5.
 *
 * A janela Animação precisa da lista de Corpos, e o painel recebe um
 * `EditorDoc`, que é o contrato e não sabe de projeto nenhum. Esta é a porta:
 * um documento de teste, sem projeto, devolve `null`, e a janela mostra o
 * arquivo aberto como o corpo único que ele é.
 */
export function projetoDe(doc: EditorDoc): Projeto | null {
  if (!(doc instanceof Doc)) return null;
  const projeto = doc.project;
  return projeto instanceof Projeto ? projeto : null;
}
