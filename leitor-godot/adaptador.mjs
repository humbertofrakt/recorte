// SPDX-License-Identifier: Apache-2.0
/**
 * O adaptador do leitor do Godot, do jeito que a suíte pede (rodada G1).
 *
 * Contrato da suíte (`conformidade/como-provar-conformidade.md`, passo 2):
 * a pasta do caso no último argumento, a sonda na entrada padrão, o dump na
 * saída padrão, recusa com código diferente de zero.
 *
 * Quem faz a conta é o Godot, sem janela (`adaptador.gd`). Este arquivo só
 * passa a sonda e o dump por arquivos, porque o Godot escreve o nome dele na
 * saída padrão ao abrir, e isso estragaria o JSON.
 *
 *   node ferramentas/conformidade.mjs --adaptador "node leitor-godot/adaptador.mjs" --nivel A --nivel X
 *
 * O Godot: a variável RECORTE_GODOT com o caminho do executável (o
 * `..._console.exe`, no Windows). Sem ela, procura `godot` no PATH.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const GODOT = process.env.RECORTE_GODOT || 'godot';

const pasta = process.argv[process.argv.length - 1];
if (!pasta || process.argv.length < 3) {
  process.stderr.write('falta a pasta do caso\n');
  process.exit(2);
}

const temp = mkdtempSync(join(tmpdir(), 'recorte-godot-'));
const sonda = join(temp, 'sonda.json');
const saida = join(temp, 'saida.json');
let codigo = 1;
try {
  writeFileSync(sonda, readFileSync(0, 'utf8'));
  const r = spawnSync(GODOT, [
    '--headless', '--path', AQUI, '--script', 'res://adaptador.gd', '--', pasta, sonda, saida,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) {
    process.stderr.write(`o Godot não rodou (${GODOT}): ${r.error.message}\n`);
  } else if (!existsSync(saida)) {
    process.stderr.write(`o Godot saiu com ${r.status} e não escreveu o dump:\n${(r.stderr || '').slice(0, 2000)}\n`);
  } else {
    const texto = readFileSync(saida, 'utf8');
    if (r.status === 0) {
      process.stdout.write(texto);
      codigo = 0;
    } else {
      let motivo = texto;
      try { motivo = JSON.parse(texto).erro; } catch { /* fica o texto */ }
      process.stderr.write(`${motivo}\n`);
      codigo = r.status || 1;
    }
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
process.exit(codigo);
