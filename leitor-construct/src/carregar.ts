// SPDX-License-Identifier: Apache-2.0
/**
 * Carregar um boneco por um leitor ASSÍNCRONO de arquivos (rodada K2).
 *
 * O `loadSkeletonFile` do runtime pede os arquivos de fora NA HORA, por uma
 * função síncrona (`files`). No Construct, ler um arquivo da pasta *Files* é
 * assíncrono (`getProjectFileUrl` + `fetch`). Então este módulo faz as voltas:
 * carrega, anota o que o leitor pediu e não tinha, busca, e carrega de novo,
 * até ninguém pedir nada novo. É puro: quem lê os bytes é a função `ler`, que o
 * addon dá (no Construct) e o teste dá (no Node, do disco).
 *
 * Devolve também, por nome de página do atlas, o caminho da IMAGEM daquela
 * página — o addon faz uma textura de cada.
 */

import { detectEncoding, loadSkeletonFile, type LoadedFile } from '../../runtime/src/file.js';
import { loadAtlas, parseBoneText } from '../../runtime/src/loader.js';
import { joinUri } from '../../runtime/src/uri.js';
import type { AtlasData } from '../../runtime/src/data.js';

/** Os bytes de um arquivo da pasta do projeto, ou `null` quando não existe. */
export type LerArquivo = (caminho: string) => Promise<Uint8Array | null>;

export interface Boneco {
  readonly arquivo: LoadedFile;
  /** Nome da página do atlas → caminho da imagem dela, a partir da pasta *Files*. */
  readonly imagens: ReadonlyMap<string, string>;
  /** Tudo o que o leitor quer que se saiba, em português. */
  readonly avisos: readonly string[];
}

/** Voltas de "carrega, busca o que faltou" antes de desistir. Cada nível aninhado gasta uma. */
export const MAXIMO_DE_VOLTAS = 12;

const decodificador = new TextDecoder('utf-8');

function pastaDe(caminho: string): string {
  const i = caminho.lastIndexOf('/');
  return i < 0 ? '' : caminho.slice(0, i + 1);
}

/** Se os bytes são um atlas (JSON com `pages` e `regions`), o atlas; senão `null`. */
function comoAtlas(bytes: Uint8Array): AtlasData | null {
  let arvore: unknown;
  try {
    arvore = parseBoneText(decodificador.decode(bytes));
  } catch {
    return null;
  }
  if (typeof arvore !== 'object' || arvore === null) return null;
  const o = arvore as Record<string, unknown>;
  if (!Array.isArray(o.pages) || !Array.isArray(o.regions)) return null;
  return loadAtlas(arvore as never);
}

/**
 * Carrega `caminho` (um `.bone` ou `.boneb`, relativo à pasta *Files*) e tudo o
 * que ele cita: atlas, esqueletos aninhados, animações e skins de fora.
 */
export async function carregarBoneco(caminho: string, ler: LerArquivo): Promise<Boneco> {
  const avisos: string[] = [];
  const base = pastaDe(caminho);
  const bytes = await ler(caminho);
  if (bytes === null) throw new Error(`O arquivo "${caminho}" não está na pasta Files do projeto.`);

  const codificacao = detectEncoding(bytes);
  if (codificacao === 'bonez') {
    throw new Error(`"${caminho}" é um pacote .bonez: o leitor do Construct ainda não abre pacote (rodada K7). Use o .bone com o atlas e a imagem ao lado.`);
  }

  const imagens = new Map<string, string>();
  const anotarPaginas = (atlas: AtlasData, caminhoDoAtlas: string): void => {
    for (const pagina of atlas.pages) {
      const img = joinUri(pastaDe(caminhoDoAtlas), pagina.image);
      const ja = imagens.get(pagina.name);
      if (ja !== undefined && ja !== img) {
        avisos.push(`Duas imagens diferentes para a página "${pagina.name}" do atlas: "${ja}" e "${img}". Fica a primeira.`);
        continue;
      }
      imagens.set(pagina.name, img);
    }
  };

  // O atlas do arquivo principal: o `loadSkeletonFile` não o busca sozinho num
  // `.bone` solto (é quem chama que entrega), como faz o adaptador da conformidade.
  const atlases: AtlasData[] = [];
  if (codificacao === 'bone') {
    const arvore = parseBoneText(decodificador.decode(bytes)) as { assets?: { atlases?: unknown } };
    const nomes = Array.isArray(arvore.assets?.atlases) ? arvore.assets.atlases as unknown[] : [];
    for (const nome of nomes) {
      if (typeof nome !== 'string') continue;
      const rel = joinUri(base, nome);
      const b = await ler(rel);
      if (b === null) {
        avisos.push(`O atlas "${nome}" não está na pasta Files: as imagens do boneco não vão aparecer.`);
        continue;
      }
      const atlas = comoAtlas(b);
      if (atlas === null) {
        avisos.push(`"${nome}" não é um atlas que o leitor entenda.`);
        continue;
      }
      atlases.push(atlas);
      anotarPaginas(atlas, rel);
    }
  }

  // As voltas. O `files` do runtime pede caminhos relativos à pasta do arquivo
  // principal; a pasta *Files* conhece caminhos a partir da raiz dela.
  const lidos = new Map<string, Uint8Array | null>();
  let arquivo: LoadedFile | null = null;
  for (let volta = 0; volta < MAXIMO_DE_VOLTAS; volta++) {
    const pedidos = new Set<string>();
    arquivo = loadSkeletonFile(bytes, {
      atlases,
      files: (pedido) => {
        if (lidos.has(pedido)) return lidos.get(pedido);
        pedidos.add(pedido);
        return null;
      },
    });
    if (pedidos.size === 0) break;
    for (const pedido of pedidos) {
      const rel = joinUri(base, pedido);
      const b = await ler(rel);
      lidos.set(pedido, b);
      // Um atlas pedido por um esqueleto aninhado: a imagem dele também vira textura.
      if (b !== null && /\.atlas(\.json)?$/i.test(pedido)) {
        const atlas = comoAtlas(b);
        if (atlas !== null) anotarPaginas(atlas, rel);
      }
    }
    if (volta === MAXIMO_DE_VOLTAS - 1) {
      avisos.push(`O boneco pediu arquivos por mais de ${MAXIMO_DE_VOLTAS} voltas; parei de buscar.`);
    }
  }
  const final = arquivo as LoadedFile;

  for (const w of final.warnings) avisos.push(w);
  for (const w of final.data.warnings) avisos.push(`${w.pointer} ${w.message}`);
  for (const f of final.missingFiles) avisos.push(`Falta o arquivo "${joinUri(base, f)}" na pasta Files.`);
  for (const img of final.data.missingImages) avisos.push(`O atlas não tem a imagem "${img}".`);
  if (final.bodies.size > 0) {
    avisos.push(`O boneco troca de base (9.13) em ${final.bodies.size} animação(ões): o Construct ainda não troca a base; toca tudo na base principal.`);
  }
  return { arquivo: final, imagens, avisos: [...new Set(avisos)] };
}
