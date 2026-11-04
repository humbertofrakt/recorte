// O editor para as PROVAS: o mesmo Vite do editor, sem vigiar arquivos e sem HMR.
//
//   node ferramentas/provas/vite-quieto.mjs --port 5191
//
// Por quê — 29/09/2026, chat C (dono das provas, P44). Com a casa aberta, cinco
// ou dez chats gravam em `editor/src` enquanto uma prova roda. O Vite de
// sempre vê cada gravação e faz uma de duas coisas, as duas ruins para quem mede:
//
//   1. recarrega a página no meio da prova, e tudo o que a prova montou some
//      (`Cannot read properties of null (reading 'file')`, medir de 05:01);
//   2. põe um carimbo `?t=…` no módulo mexido, e o `import('/src/…')` da prova
//      pega OUTRA cópia do módulo, que nunca foi montada.
//
// A forma: *a prova media o arquivo que o vizinho estava gravando, e não o que
// ela abriu.* Sem vigia, a prova vê o código como ele estava quando ela subiu
// — e é isso que "medir a versão" quer dizer.
//
// A configuração é a do `editor/vite.config.ts`, inteira: só o servidor muda.
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const RAIZ = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const i = process.argv.indexOf('--port');
const porta = i >= 0 ? Number(process.argv[i + 1]) : NaN;
if (!Number.isInteger(porta)) {
  console.error('uso: node ferramentas/provas/vite-quieto.mjs --port N');
  process.exit(2);
}

const servidor = await createServer({
  configFile: resolve(RAIZ, 'editor', 'vite.config.ts'),
  server: { port: porta, strictPort: true, hmr: false, watch: null },
  logLevel: 'error',
});
await servidor.listen();

const parar = () => { void servidor.close().finally(() => process.exit(0)); };
process.on('SIGTERM', parar);
process.on('SIGINT', parar);
