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
  const vazio: SharedComposition = { animations: locais, origins: new Map(), missing: [], warnings: [] };
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
  const animations = ((composed.tree as Record<string, unknown>)['animations'] as unknown[] | undefined) ?? [];
  const origins = new Map<string, string>();
  const nomesLocais = new Set(locais.map((a) => (a as { name?: unknown }).name));
  for (const a of animations) {
    const nome = (a as { name?: unknown }).name;
    if (typeof nome !== 'string' || nomesLocais.has(nome)) continue;
    // A composição pode ter copiado o objeto (o ajuste de tamanho): o uri vem
    // pelo objeto quando dá, e pela ordem dos arquivos quando não.
    origins.set(nome, porArquivo.get(a) ?? originByName(nome, uris));
  }
  return { animations, origins, missing, warnings: [...composed.warnings] };
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
