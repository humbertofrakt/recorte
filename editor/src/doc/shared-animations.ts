/**
 * **As animações compartilhadas tocam no editor** — reaproveitar, noite de
 * 04/11/2026.
 *
 * O diagnóstico: a Biblioteca gravava o arquivo e punha o nome em
 * `assets.animations` (§2.8), e a lista dizia *"Nenhuma animação ainda"*. O
 * jogo tocaria; o editor, não — ele monta o corpo sem ler arquivo de fora.
 * *"O que eu gravo, eu não consigo ler"*, a mesma forma do M17.
 *
 * Aqui o editor passa a ler. Quem monta o corpo (`Doc.rebuild`) pede a este
 * módulo as animações de fora, e a conta é **a do runtime** (`composeExternals`,
 * §2.8): o nome que já existe aqui vale, e o `rig.reference` ajusta o tamanho.
 *
 * DE ONDE VEM O ARQUIVO, em ordem:
 *
 * | Fonte | Quando |
 * |:---|:---|
 * | **o dono, ao vivo** | outra base do projeto compartilha as animações dela (`compartilha` no estado do editor). Mudou lá, muda aqui no próximo desenho: é o "mudar num lugar, os 3 mudam" |
 * | **o arquivo lido** | o que foi gravado nesta sessão, ou lido da pasta do projeto ao abrir |
 *
 * O que não se acha **é dito** (`missing`), e a lista de Animações mostra
 * "não achado" — nunca uma lista vazia que pareça uma animação que não pegou
 * (regra 21).
 *
 * Estado de sessão, como o `knownNames` do `io/export-animation.ts`: nada aqui
 * vai para o documento. Módulo do degrau 1: só o contrato e o runtime.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { composeExternals } from '../../../runtime/src/index.js';

/** Quem dá o conteúdo de um arquivo de fora, ao vivo. `null` = não sabe. */
export type SharedSupplier = (uri: string) => BoneFile | null;

/** Os arquivos lidos ou gravados nesta sessão, pelo uri. */
const files = new Map<string, BoneFile>();
/** Quem responde ao vivo (o projeto, pelos donos). Um só. */
let supplier: SharedSupplier | null = null;

/** Anota o conteúdo de um arquivo de fora (gravado agora, ou lido da pasta). */
export function rememberSharedFile(uri: string, file: BoneFile): void {
  files.set(uri, JSON.parse(JSON.stringify(file)) as BoneFile);
}

/** Põe (ou tira, com `null`) quem responde ao vivo. */
export function setSharedSupplier(next: SharedSupplier | null): void {
  supplier = next;
}

/** Esquece os arquivos lidos: o projeto é outro. */
export function forgetSharedFiles(): void {
  files.clear();
}

/** O arquivo de fora: o do dono ao vivo, ou o lido; `null` quando não se acha. */
export function sharedFileOf(uri: string): BoneFile | null {
  const vivo = supplier?.(uri) ?? null;
  if (vivo !== null) return vivo;
  return files.get(uri) ?? null;
}

/** Os uris de `assets.animations` deste arquivo. */
export function sharedUrisOf(file: BoneFile): string[] {
  const lista = (file as unknown as { assets?: { animations?: unknown } }).assets?.animations;
  return Array.isArray(lista) ? lista.filter((u): u is string => typeof u === 'string') : [];
}

/** O que a composição deu: as animações todas e de onde veio cada uma de fora. */
export interface SharedComposition {
  /** As daqui primeiro, depois as de fora, na ordem do §2.8. */
  animations: unknown[];
  /** O nome de cada animação de fora → o uri do arquivo. */
  origins: Map<string, string>;
  /** Os uris citados que não se achou. */
  missing: string[];
  /** Por arquivo: as linhas que não têm onde cair neste boneco e saíram. */
  dropped: Map<string, string[]>;
  /** Os avisos da composição (§2.8), com o código na frente. */
  warnings: string[];
}

/**
 * As animações deste arquivo **com** as de fora, pela conta do runtime.
 * Sem `assets.animations`, devolve as daqui e nada mais — o caminho de sempre.
 */
export function composeShared(file: BoneFile): SharedComposition {
  const locais = (file.animations ?? []) as unknown[];
  const uris = sharedUrisOf(file);
  const vazio: SharedComposition = { animations: locais, origins: new Map(), missing: [], warnings: [], dropped: new Map() };
  if (uris.length === 0) return vazio;
  const host = JSON.parse(JSON.stringify(file)) as Record<string, unknown>;
  const assets = { ...((host['assets'] as Record<string, unknown> | undefined) ?? {}) };
  // Só as animações: as peles de fora entram por outro caminho (Importar skin).
  delete assets['skins'];
  assets['skeletonsBase'] = '';
  host['assets'] = assets;
  const missing: string[] = [];
  const porArquivo = new Map<unknown, string>();
  const composed = composeExternals(host, '', (entry: string) => {
    const achado = sharedFileOf(entry);
    if (achado === null) { missing.push(entry); return null; }
    const copia = JSON.parse(JSON.stringify(achado)) as Record<string, unknown>;
    for (const a of (copia['animations'] as unknown[] | undefined) ?? []) porArquivo.set(a, entry);
    return copia;
  });
  const todas = ((composed.tree as Record<string, unknown>)['animations'] as unknown[] | undefined) ?? [];
  const origins = new Map<string, string>();
  const nomesLocais = new Set(locais.map((a) => (a as { name?: unknown }).name));
  for (const a of todas) {
    const nome = (a as { name?: unknown }).name;
    if (typeof nome !== 'string' || nomesLocais.has(nome)) continue;
    // A composição pode ter copiado o objeto (o ajuste de tamanho): o uri vem
    // pelo objeto quando dá, e pela ordem dos arquivos quando não.
    origins.set(nome, porArquivo.get(a) ?? originByName(nome, uris));
  }
  // A prova final (05/11): o cavaleiro ligado ao herói INTEIRO ganhava 82
  // avisos — uma linha por slot, regra e evento do herói que o cavaleiro não
  // tem. O leitor ignora essas linhas (§4.7, timeline órfã); aqui elas saem
  // antes, e o porquê vira UMA frase por arquivo (`dropped`).
  const alvos = hostTargets(composed.tree as Record<string, unknown>);
  const dropped = new Map<string, string[]>();
  const animations = todas.map((a) => {
    const nome = (a as { name?: unknown }).name;
    const uri = typeof nome === 'string' ? origins.get(nome) : undefined;
    if (uri === undefined) return a;
    const fora = dropped.get(uri) ?? [];
    dropped.set(uri, fora);
    return keepWhatLands(a, alvos, fora);
  });
  return { animations, origins, missing, warnings: [...composed.warnings], dropped };
}

/** Os nomes que este boneco tem, por tipo: onde uma linha de fora pode cair. */
interface HostTargets { bones: Set<string>; slots: Set<string>; constraints: Set<string>; events: Set<string>; named: Set<string> }

function namesOf(list: unknown): Set<string> {
  const out = new Set<string>();
  if (!Array.isArray(list)) return out;
  for (const item of list) {
    const n = typeof item === 'string' ? item : (item as { name?: unknown })?.name;
    if (typeof n === 'string') out.add(n);
  }
  return out;
}

function hostTargets(tree: Record<string, unknown>): HostTargets {
  return {
    bones: namesOf(tree['bones']), slots: namesOf(tree['slots']), constraints: namesOf(tree['constraints']),
    events: namesOf(tree['events']),
    named: new Set([...namesOf(tree['parameters']), ...namesOf(tree['morphs']), ...namesOf(tree['variables'])]),
  };
}

const SLOT_TYPES = new Set(['slot', 'deform', 'weights', 'sequence', 'nested']);
const PALAVRA: Record<string, string> = { constraint: 'regra', parameter: 'parâmetro', morph: 'forma', variable: 'variável' };

/** A animação só com as linhas que têm onde cair neste boneco; o resto vai para `fora`. */
function keepWhatLands(animation: unknown, h: HostTargets, fora: string[]): unknown {
  const a = animation as { timelines?: unknown[] };
  if (!Array.isArray(a.timelines)) return animation;
  const anota = (t: string): void => { fora.push(t); };
  const timelines = a.timelines.filter((raw) => {
    const tl = raw as { type?: unknown; target?: unknown; keys?: unknown[] };
    const tipo = typeof tl.type === 'string' ? tl.type : '';
    const alvo = typeof tl.target === 'string' ? tl.target : '';
    if (tipo === 'bone') { if (h.bones.has(alvo)) return true; anota(`osso "${alvo}"`); return false; }
    if (SLOT_TYPES.has(tipo)) { if (h.slots.has(alvo)) return true; anota(`slot "${alvo}"`); return false; }
    if (tipo === 'constraint') { if (h.constraints.has(alvo)) return true; anota(`regra "${alvo}"`); return false; }
    if (tipo in PALAVRA) { if (h.named.has(alvo)) return true; anota(`${PALAVRA[tipo]} "${alvo}"`); return false; }
    if (tipo === 'event' && Array.isArray(tl.keys)) {
      const keys = tl.keys.filter((k) => {
        const ev = String((k as { event?: unknown }).event);
        if (h.events.has(ev)) return true;
        anota(`evento "${ev}"`);
        return false;
      });
      return keys.length > 0;
    }
    if (tipo === 'drawOrder' && Array.isArray(tl.keys)) {
      for (const k of tl.keys) {
        const v = (k as { value?: unknown }).value;
        if (!Array.isArray(v)) continue;
        for (const o of v) if (!h.slots.has(String((o as { slot?: unknown }).slot))) anota(`slot "${String((o as { slot?: unknown }).slot)}"`);
        (k as { value: unknown[] }).value = v.filter((o) => h.slots.has(String((o as { slot?: unknown }).slot)));
      }
      return true;
    }
    return true;
  });
  return { ...a, timelines };
}

/**
 * Os avisos das compartilhadas, **um por arquivo**: quantas linhas ficaram de
 * fora e de quê. Vai para a barra de avisos no lugar das dezenas de avisos de
 * linha órfã (regra 21: dizer, uma vez, com o porquê).
 */
export function sharedWarnings(file: BoneFile): string[] {
  if (sharedUrisOf(file).length === 0) return [];
  let c: SharedComposition;
  try { c = composeShared(file); } catch { return []; }
  const out: string[] = [];
  for (const [uri, fora] of c.dropped) {
    if (fora.length === 0) continue;
    const tipos = [...new Set(fora)];
    out.push(`${uri}: ${fora.length} linhas das animações de fora ficam de fora — este boneco não tem `
      + `${tipos.slice(0, 4).join(', ')}${tipos.length > 4 ? ` e mais ${tipos.length - 4}` : ''}. O que combina toca`);
  }
  return out;
}

/** O primeiro arquivo da lista que traz uma animação com esse nome. */
function originByName(nome: string, uris: readonly string[]): string {
  for (const uri of uris) {
    const f = sharedFileOf(uri);
    if ((f?.animations ?? []).some((a) => a.name === nome)) return uri;
  }
  return uris[0] ?? '';
}

/**
 * O arquivo que o `Doc` entrega ao leitor do runtime: o mesmo, com as
 * animações de fora já dentro. Uma cópia — o documento não muda.
 */
export function withSharedAnimations<T>(copy: T): T {
  const file = copy as unknown as BoneFile;
  if (sharedUrisOf(file).length === 0) return copy;
  try {
    const { animations } = composeShared(file);
    (copy as unknown as { animations: unknown[] }).animations = animations;
  } catch {
    // Um arquivo de fora malformado não derruba a base: ela abre com as daqui.
  }
  return copy;
}
