/**
 * **A oficina** — o exemplo que mostra tudo junto (noite de 04 para 05/11/2026).
 *
 * Uma pasta de projeto de verdade (`exemplo/oficina/`, com `manifest.json`),
 * gerada por `ferramentas/fazer-oficina.mjs`: o herói com a motosserra, o
 * mecha com o herói na cabine, três bonecos com as mesmas animações, e as
 * duas roupas do herói.
 *
 * Os arquivos vão DENTRO do programa (o empacotador dá um endereço para cada
 * um, como faz com o herói). Para abrir, o editor recebe uma **pasta de
 * leitura**: a mesma porta da pasta solta na janela (`openDroppedFolder`), e
 * daí o caminho de sempre — o manifesto, as bases, as entidades.
 *
 * A pasta é só de leitura, de propósito: o exemplo não se estraga. O Salvar
 * não acha onde gravar nela e pergunta onde, como no herói.
 */

import type { FolderDirectoryHandle } from './project-folder.js';

/** Os arquivos da oficina, pelo nome: o endereço que o empacotador deu. */
const OFICINA = import.meta.glob('../../../exemplo/oficina/*.{bone,json,png}', {
  query: '?url', import: 'default', eager: true,
}) as Record<string, string>;

/** O nome da pasta, como aparece no rodapé e na aba Imagens. */
export const OFICINA_NOME = 'oficina';

/** Os arquivos da oficina: nome → endereço. Vazio quando o programa não a trouxe. */
export function oficinaFiles(): Map<string, string> {
  const out = new Map<string, string>();
  for (const [path, url] of Object.entries(OFICINA)) out.set(path.slice(path.lastIndexOf('/') + 1), url);
  return out;
}

/** O tipo pela extensão, para a aba Imagens reconhecer o PNG. */
function tipoDe(nome: string): string {
  if (nome.endsWith('.png')) return 'image/png';
  if (nome.endsWith('.json')) return 'application/json';
  return 'application/octet-stream';
}

/**
 * A oficina como uma pasta **de leitura**. `fetchFile` busca um endereço (o
 * teste passa um de mentira). `null` quando o programa não trouxe a oficina.
 */
export function oficinaFolder(
  files: ReadonlyMap<string, string> = oficinaFiles(),
  fetchFile: (url: string) => Promise<Blob> = async (url) => (await fetch(url)).blob(),
): FolderDirectoryHandle | null {
  if (files.size === 0) return null;
  const arquivo = (nome: string, url: string): unknown => ({
    kind: 'file' as const,
    name: nome,
    async getFile(): Promise<File> {
      const blob = await fetchFile(url);
      return new File([blob], nome, { type: tipoDe(nome), lastModified: 0 });
    },
  });
  const handles = new Map([...files].map(([nome, url]) => [nome, arquivo(nome, url)]));
  const pasta = {
    kind: 'directory' as const,
    name: OFICINA_NOME,
    async *values() { for (const h of handles.values()) yield h; },
    async *entries() { for (const [n, h] of handles) yield [n, h]; },
    async *keys() { for (const n of handles.keys()) yield n; },
    async getFileHandle(nome: string, options?: { create?: boolean }): Promise<unknown> {
      if (options?.create === true) {
        throw new DOMException('A oficina é um exemplo, só de leitura', 'NotAllowedError');
      }
      const h = handles.get(nome);
      if (h === undefined) throw new DOMException(`A oficina não tem ${nome}`, 'NotFoundError');
      return h;
    },
    async resolve(alvo: unknown): Promise<string[] | null> {
      for (const [n, h] of handles) if (h === alvo) return [n];
      return null;
    },
  };
  return pasta as unknown as FolderDirectoryHandle;
}

/** A frase do rodapé depois de abrir: o primeiro passo de cada caso. */
export const OFICINA_PRIMEIRO_PASSO = 'Oficina aberta — no herói, abra walk e aperte ▶ (a motosserra gira sozinha); '
  + 'em Bases, o mecha leva o herói na cabine; cavaleiro, goblin e robô andam com as mesmas animações (Compartilhadas); '
  + 'na aba Skins, a outra roupa do herói';
