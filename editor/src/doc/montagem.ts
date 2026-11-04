/**
 * **A montagem de teste** — rodada 39, lote 2 (06/10/2026). Plano `22`, §3 e §4.
 *
 * Ligar uma entidade num slot **em teste** é o "Character Map ativo" do
 * Spriter: vale na tela, e o arquivo da entidade não muda. Nada disto vai para
 * o `.bone`. Mora no `manifest.json`, em `extras.RECORTE_projeto.montagem`
 * (spec 2.9: *"estado do editor, e um leitor os ignora"*):
 *
 *     { "ligacoes": [{ "host": "heroi.bone", "slot": "mao_e", "uri": "motosserra.bone" }] }
 *
 * | Campo | O que é |
 * |:---|:---|
 * | `host` | o arquivo cujo slot recebe — hoje, o projeto aberto |
 * | `slot` | o slot, pelo nome |
 * | `uri` | a entidade que entrou, como o anexo `skeleton` a escreveria |
 *
 * **Uma ligação de teste por slot.** Soltar outra peça no mesmo slot troca a
 * de antes (o "Trocar a peça" do plano).
 *
 * A montagem é **do projeto, não da animação**: trocar de animação não a
 * mexe. Volta ao reabrir, como ficou.
 *
 * O comando segue a regra 6 (contrato, `Command`): `apply` e `revert` exatos,
 * um passo de desfazer por gesto. Ele muda o manifesto do projeto, nunca o
 * `.bone` — o arquivo sai igual, letra por letra, com e sem montagem.
 *
 * Módulo do degrau 1: importa só o contrato e a base. Sem DOM.
 */

import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { PROJECT_EXTRA, projetoDe } from './projeto.js';
import type { ProjectManifest } from './projeto.js';

/** A chave da montagem dentro de `extras.RECORTE_projeto`. */
export const MONTAGEM_KEY = 'montagem';

/** Uma ligação de teste: a entidade `uri` no slot `slot` do arquivo `host`. */
export interface Ligacao {
  host: string;
  slot: string;
  uri: string;
  /**
   * **O que a peça toca** — lote 6. Sem o campo: parada, na pose de repouso.
   * `''` = a de quem a recebe (o `inheritAnimation` da spec 7.11); um nome =
   * aquela animação dela. Opcional: quem constrói a ligação à mão não muda.
   */
  anima?: string;
  /** **As skins de teste** dela (lote 6), por cima da `default`. Sem o campo: só a `default`. */
  skins?: string[];
}

/**
 * **Uma ligação para cima** — lote 4. A base `base` entra no slot `slot` da
 * entidade `uri`, em teste: o boneco dentro do mecha, no piloto. A cadeia se
 * lê de dentro para fora: o boneco no mecha, o mecha na nave.
 */
export interface Acima {
  base: string;
  uri: string;
  slot: string;
  /** O que o de fora toca, no relógio da agulha (lote 6). Como em `Ligacao`. */
  anima?: string;
  /** As skins de teste do de fora (lote 6). */
  skins?: string[];
}

/** O que se escolhe no cartão de teste (lote 6): o que toca e as skins. */
export interface Escolha {
  anima?: string;
  skins?: string[];
}

/** A escolha de um item lido do manifesto: só o que é texto. */
function escolhaLida(item: Record<string, unknown>): Escolha {
  const out: Escolha = {};
  if (typeof item['anima'] === 'string') out.anima = item['anima'];
  const skins = Array.isArray(item['skins']) ? (item['skins'] as unknown[]).filter((x): x is string => typeof x === 'string' && x !== '') : [];
  if (skins.length > 0) out.skins = [...new Set(skins)];
  return out;
}

/** A escolha para gravar: sem os campos vazios, para o manifesto de antes do lote 6 sair igual. */
function escolhaGravada(e: Escolha): Escolha {
  const out: Escolha = {};
  if (e.anima !== undefined) out.anima = e.anima;
  if (e.skins !== undefined && e.skins.length > 0) out.skins = [...e.skins];
  return out;
}

/** A montagem de teste do projeto. */
export interface Montagem {
  ligacoes: Ligacao[];
  /** As ligações para cima (lote 4). Uma por base: quem está dentro de quem. */
  acima: Acima[];
  /**
   * **Na cena** (lote 3): a cena desenha as peças de teste enquanto se anima.
   * Elas continuam fora da animação e do arquivo. Volta ao reabrir, como ficou.
   */
  naCena: boolean;
}

/** Uma montagem vazia. */
export function emptyMontagem(): Montagem {
  return { ligacoes: [], naCena: false, acima: [] };
}

function isLigacao(value: unknown): value is Ligacao {
  if (value === null || typeof value !== 'object') return false;
  const l = value as Record<string, unknown>;
  return typeof l['host'] === 'string' && l['host'] !== ''
    && typeof l['slot'] === 'string' && l['slot'] !== ''
    && typeof l['uri'] === 'string' && l['uri'] !== '';
}

/**
 * A montagem que o manifesto traz, ou uma vazia. O que não é uma ligação
 * inteira fica de fora; uma segunda ligação no mesmo slot também (vale a
 * primeira), porque a regra é uma por slot.
 */
export function readMontagem(manifest: ProjectManifest): Montagem {
  const extra = manifest.extras?.[PROJECT_EXTRA] as Record<string, unknown> | undefined;
  const raw = extra?.[MONTAGEM_KEY] as { ligacoes?: unknown; naCena?: unknown } | undefined;
  const lista = Array.isArray(raw?.ligacoes) ? raw.ligacoes : [];
  const out: Ligacao[] = [];
  for (const item of lista) {
    if (!isLigacao(item)) continue;
    if (out.some((l) => l.host === item.host && l.slot === item.slot)) continue;
    out.push({ host: item.host, slot: item.slot, uri: item.uri, ...escolhaLida(item as unknown as Record<string, unknown>) });
  }
  const acima: Acima[] = [];
  const listaAcima = Array.isArray((raw as { acima?: unknown } | undefined)?.acima) ? (raw as { acima: unknown[] }).acima : [];
  for (const item of listaAcima) {
    if (item === null || typeof item !== 'object') continue;
    const a = item as Record<string, unknown>;
    if (typeof a['base'] !== 'string' || typeof a['uri'] !== 'string' || typeof a['slot'] !== 'string') continue;
    if (a['base'] === '' || a['uri'] === '' || a['slot'] === '') continue;
    if (acima.some((x) => x.base === a['base'])) continue;
    acima.push({ base: a['base'], uri: a['uri'], slot: a['slot'], ...escolhaLida(a) });
  }
  return { ligacoes: out, naCena: raw?.naCena === true, acima };
}

/** `true` quando a montagem não tem nada a guardar. */
export function isEmptyMontagem(montagem: Montagem): boolean {
  return montagem.ligacoes.length === 0 && !montagem.naCena && montagem.acima.length === 0;
}

/**
 * Escreve a montagem no manifesto. Vazia, a chave **sai**: um projeto sem
 * teste grava o mesmo manifesto de antes da rodada 39.
 */
export function writeMontagem(manifest: ProjectManifest, montagem: Montagem): void {
  const extras = { ...(manifest.extras ?? {}) };
  const extra = { ...((extras[PROJECT_EXTRA] as Record<string, unknown> | undefined) ?? {}) };
  if (isEmptyMontagem(montagem)) delete extra[MONTAGEM_KEY];
  else {
    const guardar: Record<string, unknown> = { ligacoes: montagem.ligacoes.map((l) => ({ host: l.host, slot: l.slot, uri: l.uri, ...escolhaGravada(l) })) };
    if (montagem.naCena) guardar['naCena'] = true;
    if (montagem.acima.length > 0) guardar['acima'] = montagem.acima.map((a) => ({ base: a.base, uri: a.uri, slot: a.slot, ...escolhaGravada(a) }));
    extra[MONTAGEM_KEY] = guardar;
  }
  if (Object.keys(extra).length === 0) delete extras[PROJECT_EXTRA];
  else extras[PROJECT_EXTRA] = extra;
  if (Object.keys(extras).length === 0) delete manifest.extras;
  else manifest.extras = extras;
}

/** A montagem do projeto do documento, ou uma vazia sem projeto. */
export function montagemDe(doc: EditorDoc): Montagem {
  const projeto = projetoDe(doc);
  return projeto === null ? emptyMontagem() : readMontagem(projeto.manifesto);
}

/** A ligação de teste de um slot, ou `null`. */
export function ligacaoEm(montagem: Montagem, host: string, slot: string): Ligacao | null {
  return montagem.ligacoes.find((l) => l.host === host && l.slot === slot) ?? null;
}

/** As ligações de teste de um arquivo, na ordem em que entraram. */
export function ligacoesDe(montagem: Montagem, host: string): Ligacao[] {
  return montagem.ligacoes.filter((l) => l.host === host);
}

// ---------------------------------------------------------------------------
// Os gestos, como conta: a montagem de depois
// ---------------------------------------------------------------------------

/** Põe `uri` no slot, em teste. Se o slot já tinha teste, ele sai (troca). */
export function comLigacao(montagem: Montagem, ligacao: Ligacao): Montagem {
  const resto = montagem.ligacoes.filter((l) => !(l.host === ligacao.host && l.slot === ligacao.slot));
  return { ...montagem, ligacoes: [...resto, { ...ligacao }] };
}

/** Tira o teste do slot. */
export function semLigacao(montagem: Montagem, host: string, slot: string): Montagem {
  return { ...montagem, ligacoes: montagem.ligacoes.filter((l) => !(l.host === host && l.slot === slot)) };
}

/** Passa o teste de um slot para outro do mesmo arquivo; o de destino, se havia, sai. */
export function ligacaoMovida(montagem: Montagem, host: string, de: string, para: string): Montagem {
  const ligacao = ligacaoEm(montagem, host, de);
  if (ligacao === null || de === para) return montagem;
  // A mesma peça muda de lugar: o que ela toca e as skins vão junto.
  return comLigacao(semLigacao(montagem, host, de), { ...ligacao, slot: para });
}

/** Troca o que se escolheu na peça de teste de um slot (lote 6). */
export function comEscolhaBaixo(montagem: Montagem, host: string, slot: string, escolha: Escolha): Montagem {
  return {
    ...montagem,
    ligacoes: montagem.ligacoes.map((l) => (l.host === host && l.slot === slot
      ? { host: l.host, slot: l.slot, uri: l.uri, ...escolhaGravada(escolha) } : l)),
  };
}

/** Troca o que se escolheu no de fora `uri` (lote 6). */
export function comEscolhaCima(montagem: Montagem, uri: string, escolha: Escolha): Montagem {
  return {
    ...montagem,
    acima: montagem.acima.map((a) => (a.uri === uri ? { base: a.base, uri: a.uri, slot: a.slot, ...escolhaGravada(escolha) } : a)),
  };
}

/**
 * **A cadeia de quem está em volta de `base`**, de dentro para fora: o mecha
 * em volta do boneco, depois a nave em volta do mecha. Para numa volta (não
 * deveria haver: o gesto recusa) e em 8 níveis (spec 7.11).
 */
export function cadeiaAcima(montagem: Montagem, base: string): Acima[] {
  const out: Acima[] = [];
  const vistos = new Set<string>([base]);
  let atual = base;
  for (let i = 0; i < 8; i++) {
    const elo = montagem.acima.find((a) => a.base === atual);
    if (elo === undefined || vistos.has(elo.uri)) break;
    out.push({ ...elo });
    vistos.add(elo.uri);
    atual = elo.uri;
  }
  return out;
}

/** Põe `base` dentro do slot de `uri`, em teste. O que `base` tinha em volta sai. */
export function comAcima(montagem: Montagem, elo: Acima): Montagem {
  return { ...montagem, acima: [...montagem.acima.filter((a) => a.base !== elo.base), { ...elo }] };
}

/**
 * Tira `uri` da volta: o elo que o põe em volta de alguém sai, e o que estava
 * em volta DELE também (a nave não fica pendurada no mecha que saiu).
 */
export function semAcima(montagem: Montagem, uri: string): Montagem {
  const sai = new Set<string>([uri]);
  for (let mudou = true; mudou;) {
    mudou = false;
    for (const a of montagem.acima) {
      if (sai.has(a.base) && !sai.has(a.uri)) { sai.add(a.uri); mudou = true; }
    }
  }
  return { ...montagem, acima: montagem.acima.filter((a) => !sai.has(a.uri)) };
}

/** Liga ou desliga o **Na cena**. */
export function comNaCena(montagem: Montagem, naCena: boolean): Montagem {
  return { ...montagem, naCena };
}

// ---------------------------------------------------------------------------
// O comando
// ---------------------------------------------------------------------------

/**
 * **Mudar a montagem de teste** — um passo de desfazer por gesto (ligar,
 * desligar, trocar, mudar de slot).
 *
 * Guarda a montagem de antes e a de depois, inteiras: `revert` devolve a de
 * antes letra por letra. O `.bone` não é tocado. `kind` é `structure` porque
 * a Prévia (e, no lote 3, a cena) remonta o desenho com a peça de teste — e
 * `structure` é o aviso que esses painéis já ouvem.
 */
export class SetMontagem implements Command {
  readonly kind: ChangeKind = 'structure';
  private before: Montagem | null = null;

  constructor(readonly label: string, private readonly after: Montagem) {}

  apply(doc: EditorDoc): void {
    const projeto = projetoDe(doc);
    if (projeto === null) return;
    this.before ??= readMontagem(projeto.manifesto);
    writeMontagem(projeto.manifesto, this.after);
  }

  revert(doc: EditorDoc): void {
    const projeto = projetoDe(doc);
    if (projeto === null || this.before === null) return;
    writeMontagem(projeto.manifesto, this.before);
  }
}
