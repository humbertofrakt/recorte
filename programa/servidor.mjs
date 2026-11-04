// Servidor local do editor pronto. Zero dependência: só o Node.
//
// Por que existe: a página montada usa módulos de JavaScript, e o navegador
// não carrega módulo direto do disco (file://). Precisa de um endereço http.
// Este arquivo serve a própria pasta onde está e abre o navegador.
//
// Uso:  node servidor.mjs          (ou clique em "Abrir o editor.bat")

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const PASTA = fileURLToPath(new URL('.', import.meta.url));
const PORTA = Number(process.env.PORTA) || 5180;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.bone': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
};

const servidor = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORTA}`);
    let caminho = decodeURIComponent(url.pathname);
    if (caminho.endsWith('/')) caminho += 'index.html';
    // Nunca sair da pasta.
    const alvo = normalize(join(PASTA, caminho));
    if (!alvo.startsWith(PASTA)) { res.writeHead(403); res.end('Fora da pasta'); return; }
    const info = await stat(alvo).catch(() => null);
    if (info === null || !info.isFile()) { res.writeHead(404); res.end('Não achei: ' + caminho); return; }
    const corpo = await readFile(alvo);
    res.writeHead(200, {
      'Content-Type': TIPOS[extname(alvo).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(corpo);
  } catch (erro) {
    res.writeHead(500);
    res.end(String(erro));
  }
});

servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.log(`A porta ${PORTA} já está em uso. O editor provavelmente já está aberto.`);
    abrirNavegador();
    setTimeout(() => process.exit(0), 500);
    return;
  }
  console.error(erro);
  process.exit(1);
});

servidor.listen(PORTA, '127.0.0.1', () => {
  console.log('');
  console.log('  RECORTE - editor pronto');
  console.log('  -----------------------');
  console.log(`  Endereço: http://localhost:${PORTA}`);
  console.log('  Deixe esta janela aberta enquanto usa o editor.');
  console.log('  Para desligar, feche esta janela.');
  console.log('');
  if (!process.argv.includes('--sem-navegador')) abrirNavegador();
});

function abrirNavegador() {
  const endereco = `http://localhost:${PORTA}`;
  const comando = process.platform === 'win32' ? `start "" "${endereco}"`
    : process.platform === 'darwin' ? `open "${endereco}"` : `xdg-open "${endereco}"`;
  exec(comando);
}
