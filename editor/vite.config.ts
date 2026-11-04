/**
 * Vite configuration for the editor.
 *
 * The editor lives in `editor/`, but it imports two things from outside it:
 * the runtime (`runtime/src`) and the example (`formato/exemplos`). So the dev
 * server has to be allowed to serve files from the project root, and the build
 * has to be told where to put its output.
 */

import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

const editorDir = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = fileURLToPath(new URL('..', import.meta.url));

/**
 * A versão que o "Sobre" diz — rodada 23, defeito 13. Dizia "0.1.0", o número
 * do `package.json`, com o programa em v25.7. O número de verdade é o da última
 * versão guardada em `backup/versoes`, o mesmo que o `montar-programa.py`
 * escreve no LEIA-ME.
 */
function versaoGuardada(): string {
  // Rodada 4, consertos (05/10/2026): o Sobre ficava UMA VERSÃO ATRÁS, porque o
  // fecho monta o `programa/` antes de o `versao.py` guardar a versão nova (e
  // tem de ser nessa ordem: o zip leva o `programa/` dentro). Agora o
  // `montar-programa.py <número>` passa o número que vai ser fechado; sem ele,
  // vale a maior guardada, como antes.
  const pedida = process.env['RECORTE_VERSAO'];
  if (pedida !== undefined && /^\d+\.\d+$/.test(pedida)) return `v${pedida}`;
  try {
    const nums = readdirSync(fileURLToPath(new URL('../backup/versoes', import.meta.url)))
      .map((nome) => /^recorte v(\d+)\.(\d+) /.exec(nome))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => [Number(m[1]), Number(m[2])] as const)
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const maior = nums.at(-1);
    return maior === undefined ? '' : `v${maior[0]}.${maior[1]}`;
  } catch {
    return '';
  }
}

export default defineConfig({
  define: { __RECORTE_VERSAO__: JSON.stringify(versaoGuardada()) },
  root: editorDir,
  // Relative addresses, so the built page also opens straight from the disk.
  base: './',
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      // `runtime/src` and `formato/exemplos` are outside `editor/`.
      allow: [projectRoot],
    },
  },
  build: {
    outDir: fileURLToPath(new URL('../backup/editor-build', import.meta.url)),
    emptyOutDir: true,
    target: 'es2022',
  },
});
