// SPDX-License-Identifier: Apache-2.0
/**
 * A referência do desenhador do Godot (rodada G1, item 6).
 *
 * Roda o desenhador do leitor do Construct (`leitor-construct/src/desenhador.ts`,
 * que já bate peça a peça com o desenhador do editor) sobre o herói PARADO, e
 * grava as listas dele em `testes/referencia/`. O teste do Godot
 * (`testes/testes.gd`) compara as listas do `desenhador.gd` com estas.
 *
 * Só LÊ o leitor do Construct e o `runtime/`: não muda nada neles.
 *
 * Dois arquivos, porque as regras (ik, transform, path, física) são a rodada
 * G6 e mexem no herói já parado:
 *   heroi-parado-sem-regras.json  o herói com o bloco `constraints` tirado.
 *                                 O Godot TEM de bater peça a peça.
 *   heroi-parado.json             o herói como é. O teste do Godot diz quais
 *                                 peças saem diferentes, pelo nome — e não chama isso de verde.
 *   heroi-quadros-sem-regras.json (G3) sem regras, CORTADO pela máscara, parado
 *                                 e em seis quadros das três animações.
 *   heroi-quadros.json            (G6) COM as regras, cortado, pelo caminho do
 *                                 Tocador: nasce, `tocar`, e `avancar(1/den)`
 *                                 N vezes. A física depende desse caminho.
 *   faiscas.json                  (G7) o `heroi-fogo.bone` do exemplo do
 *                                 Construct, com a skin "fogo" vestida: as
 *                                 faíscas pelo desenhador do Construct, em
 *                                 vários quadros, e variantes do emissor (folha
 *                                 de quadros por fps e pela vida; muitas vivas).
 *   caminho.json                  (G9) as faíscas com `shape: "path"` na capa
 *                                 do herói (`curve: "cape_path/cape_path"`,
 *                                 outro slot), em `world` e em `local`.
 *   fumaca.json                   (G7) o `particulas.bone` (sem atlas: não se
 *                                 desenha), partícula a partícula, pelo
 *                                 adaptador de referência da suíte.
 *
 *   npx vite-node leitor-godot/testes/gerar-referencia.mjs
 *   npx vite-node leitor-godot/testes/gerar-referencia.mjs caminho.json   (só esta)
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { carregarBoneco } from '../../leitor-construct/src/carregar.ts';
import { Avisos, pecasDoQuadro } from '../../leitor-construct/src/desenhador.ts';
import { Tocador } from '../../leitor-construct/src/tocador.ts';
// G6: as regras do `runtime/` se registram por efeito colateral, ao importar
// o arquivo de cada uma (é o que o `pacote.ts` do Construct faz). Sem estas
// cinco linhas toda regra vira a "noop" do `constraint.ts`: até a G5 a
// referência "com regras" saía IGUAL à "sem regras", e ninguém comparou as duas.
import '../../runtime/src/constraints/ik.ts';
import '../../runtime/src/constraints/transform.ts';
import '../../runtime/src/constraints/path.ts';
import '../../runtime/src/constraints/physics.ts';
import '../../runtime/src/constraints/driver.ts';

const AQUI = dirname(fileURLToPath(import.meta.url));
const EXEMPLOS = join(AQUI, '..', '..', 'formato', 'exemplos');
const SAIDA = join(AQUI, 'referencia');

function leitor(semRegras) {
  return async (caminho) => {
    try {
      const bytes = new Uint8Array(readFileSync(join(EXEMPLOS, caminho)));
      if (semRegras && caminho === 'heroi.bone') {
        const doc = JSON.parse(new TextDecoder().decode(bytes));
        delete doc.constraints;
        return new TextEncoder().encode(JSON.stringify(doc));
      }
      return bytes;
    } catch {
      return null;
    }
  };
}

function lista(pecas) {
  return pecas.map((p) => ({
    cores: p.coresPorVertice ? Array.from(p.coresPorVertice) : null,
    slot: p.slot,
    anexo: p.anexo,
    tipo: p.tipo,
    pagina: p.pagina.image ?? p.pagina.name,
    mistura: p.mistura,
    profundidade: p.profundidade,
    mundo: Array.from(p.mundo),
    uvs: Array.from(p.uvs),
    triangulos: Array.from(p.triangulos),
    cor: Array.from(p.cor),
    recortes: p.recortes.map((r) => r.nome),
  }));
}

function gravar(nome, conteudo) {
  mkdirSync(SAIDA, { recursive: true });
  writeFileSync(join(SAIDA, nome), JSON.stringify({
    gerado: 'leitor-godot/testes/gerar-referencia.mjs, pelo desenhador do Construct',
    ...conteudo,
  }, null, 1) + '\n');
}

/** O herói parado (G1). `cortar: false`: as peças inteiras. */
async function parado(semRegras, nome) {
  const boneco = await carregarBoneco('heroi.bone', leitor(semRegras));
  const tocador = new Tocador(boneco.arquivo.data);
  const saida = lista(pecasDoQuadro(tocador.esqueleto, new Avisos(), { cortar: false }));
  gravar(nome, { semRegras, pecas: saida });
  console.log(`${nome}: ${saida.length} peças (${saida.filter((p) => p.tipo === 'region' && p.profundidade === 0).length} regiões do herói)`);
}

/**
 * G3: o herói SEM regras, cortado pela máscara, parado e em quadros das três
 * animações. Os instantes caem entre chaves de propósito: o deform do rosto
 * no idle, a sequência da mão, a cor, a troca de imagem e a ordem no walk.
 */
const QUADROS = [
  [null, 0], ['idle', 0.37], ['idle', 1.3], ['walk', 0.18], ['walk', 0.61], ['attack', 0.27], ['attack', 0.5],
];

async function quadros(nome) {
  const boneco = await carregarBoneco('heroi.bone', leitor(true));
  const saida = [];
  for (const [animacao, tempo] of QUADROS) {
    const tocador = new Tocador(boneco.arquivo.data);
    if (animacao !== null) {
      tocador.tocar(animacao, true);
      tocador.avancar(tempo);
    }
    saida.push({ animacao, tempo, pecas: lista(pecasDoQuadro(tocador.esqueleto, new Avisos(), { cortar: true })) });
  }
  gravar(nome, { semRegras: true, cortado: true, quadros: saida });
  console.log(`${nome}: ${saida.length} quadros, ${saida.map((q) => q.pecas.length).join('/')} peças`);
}

/**
 * G4: as pilhas de skin, pelo `vestir` e `tirar` do Construct, sobre o herói
 * sem regras (cortado), parado e no walk; e o mecha com a skin de OUTRO
 * arquivo (`mecha-pele-inverno.bone`).
 */
const PILHAS = [
  [],
  [['vestir', 'armadura']],
  [['vestir', 'armadura'], ['vestir', 'armadura_capa']],
  [['vestir', 'armadura_capa'], ['vestir', 'armadura']],
  [['vestir', 'armadura'], ['tirar', 'default']],
  [['vestir', 'armadura'], ['vestir', 'armadura_capa'], ['vestir', 'armadura']],
  [['vestir', 'armadura'], ['tirar', 'armadura']],
];

async function pilhas(nome) {
  const saida = [];
  for (const [arquivo, animacao, tempo, listas] of [
    ['heroi.bone', null, 0, PILHAS], ['heroi.bone', 'walk', 0.61, PILHAS],
    ['mecha.bone', null, 0, [[], [['vestir', 'inverno']]]], ['mecha.bone', 'idle', 0.4, [[['vestir', 'inverno']]]],
  ]) {
    const boneco = await carregarBoneco(arquivo, leitor(true));
    for (const ops of listas) {
      const tocador = new Tocador(boneco.arquivo.data);
      for (const [op, skin] of ops) (op === 'vestir' ? tocador.vestir(skin) : tocador.tirar(skin));
      if (animacao !== null) {
        tocador.tocar(animacao, true);
        tocador.avancar(tempo);
      }
      saida.push({
        arquivo, animacao, tempo, ops, pilha: tocador.esqueleto.skinStack.map((s) => s.name),
        pecas: lista(pecasDoQuadro(tocador.esqueleto, new Avisos(), { cortar: true })),
      });
    }
  }
  gravar(nome, { semRegras: true, cortado: true, pilhas: saida });
  console.log(`${nome}: ${saida.length} pilhas: ${saida.map((s) => s.pilha.join('+')).join(' | ')}`);
}

/**
 * G6: o herói COM as regras (ik do braço, a cabeça, a capa no caminho, a
 * física do cabelo, o driver do olhar), cortado. Cada quadro: [animação,
 * denominador do passo, número de passos]. O passo vai como denominador
 * inteiro porque o JSON do Godot lê `0.016666666666666666` uma casa binária
 * abaixo de 1/60, e a física decide passo a passo por `acumulado >= passo`.
 * Os de um passo só são o quadro pulado do jogo: o tempo inteiro de uma vez.
 */
const QUADROS_COM_REGRAS = [
  [null, 60, 0], ['idle', 60, 22], ['idle', 60, 78], ['idle', 10, 13],
  ['walk', 60, 11], ['walk', 60, 37], ['walk', 60, 87], ['walk', 100, 61],
  ['attack', 60, 16], ['attack', 60, 30], ['attack', 60, 40],
  ['walk', 1, 1], ['idle', 2, 3],
];

async function quadrosComRegras(nome) {
  const boneco = await carregarBoneco('heroi.bone', leitor(false));
  const saida = [];
  for (const [animacao, den, passos] of QUADROS_COM_REGRAS) {
    const tocador = new Tocador(boneco.arquivo.data);
    if (animacao !== null) tocador.tocar(animacao, animacao !== 'attack');
    for (let i = 0; i < passos; i++) tocador.avancar(1 / den);
    saida.push({ animacao, den, passos, pecas: lista(pecasDoQuadro(tocador.esqueleto, new Avisos(), { cortar: true })) });
  }
  gravar(nome, { semRegras: false, cortado: true, quadros: saida });
  console.log(`${nome}: ${saida.length} quadros, ${saida.map((q) => q.pecas.length).join('/')} peças`);
}

/**
 * G7: as faíscas. O emissor é o da skin "fogo" do `heroi-fogo.bone`; cada
 * variante é um REMENDO nos campos dele, gravado no arquivo de referência para
 * o teste do Godot aplicar o mesmo remendo.
 */
const EXEMPLO_CONSTRUCT = join(AQUI, '..', '..', 'leitor-construct', 'exemplo', 'heroi-andando', 'files');
const FOLHA = { frames: ['hand_01', 'hand_02', 'hand_03'], setup: 0 };
const VARIANTES_FAISCAS = [
  ['como-e', {}, [[null, 60, 30], ['walk', 60, 6], ['walk', 60, 25], ['walk', 60, 61], ['walk', 60, 100], ['idle', 60, 40], ['walk', 1, 1]]],
  ['folha-fps', { sequence: FOLHA, frameMode: 'fps', fps: 10, startFrame: [0, 3] }, [['walk', 60, 25], ['walk', 60, 61]]],
  ['folha-vida', { sequence: FOLHA, frameMode: 'lifetime', cycles: 2, startFrame: [1, 1] }, [['walk', 60, 25], ['walk', 60, 61]]],
  ['muitas', { rate: 600, maxParticles: 1000 }, [['walk', 60, 61]]],
];

function leitorFogo(remendo) {
  return async (caminho) => {
    try {
      const bytes = new Uint8Array(readFileSync(join(EXEMPLO_CONSTRUCT, caminho)));
      if (caminho !== 'heroi-fogo.bone') return bytes;
      const doc = JSON.parse(new TextDecoder().decode(bytes));
      const pele = doc.skins.find((k) => k.name === 'fogo');
      Object.assign(pele.attachments.fogo.faisca, remendo);
      return new TextEncoder().encode(JSON.stringify(doc));
    } catch {
      return null;
    }
  };
}

/** G9: a forma "ao longo de um caminho" (9.4.2), o caminho da capa, de outro slot. */
const CAPA = { shape: 'path', curve: 'cape_path/cape_path', rate: 40 };
const VARIANTES_CAMINHO = [
  ['caminho-world', CAPA, [['walk', 60, 25], ['walk', 60, 61], ['idle', 60, 40]]],
  ['caminho-local', { ...CAPA, space: 'local' }, [['walk', 60, 25], ['walk', 60, 61]]],
];

async function faiscas(nome, lista_de_variantes = VARIANTES_FAISCAS) {
  const variantes = [];
  for (const [rotulo, remendo, quadrosDela] of lista_de_variantes) {
    const boneco = await carregarBoneco('heroi-fogo.bone', leitorFogo(remendo));
    const quadros = [];
    for (const [animacao, den, passos] of quadrosDela) {
      const tocador = new Tocador(boneco.arquivo.data);
      tocador.vestir('fogo');
      if (animacao !== null) tocador.tocar(animacao, true);
      for (let i = 0; i < passos; i++) tocador.avancar(1 / den);
      const avisos = new Avisos();
      const pecas = lista(pecasDoQuadro(tocador.esqueleto, avisos, { cortar: true }));
      quadros.push({ animacao, den, passos, avisos: [...avisos.todos()], pecas });
    }
    variantes.push({ rotulo, remendo, quadros });
  }
  gravar(nome, { semRegras: false, cortado: true, variantes });
  console.log(`${nome}: ${variantes.map((v) => `${v.rotulo} ${v.quadros.map((q) => q.pecas.filter((p) => p.tipo === 'BONE_particle').reduce((n, p) => n + p.mundo.length / 8, 0)).join('/')}`).join(' · ')} partículas`);
}

/** G7: a fumaça, partícula a partícula, pelo adaptador de referência (o runtime TypeScript). */
const SONDAS_FUMACA = [
  { measure: ['particles'], times: [0.37, 1.23, 2.71] },
  { animation: 'fumar', loop: true, measure: ['particles'], times: [0.37, 1.23, 1.99, 2.71, 4.37] },
];

async function fumaca(nome) {
  const { mkdtempSync, rmSync, copyFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { spawnSync } = await import('node:child_process');
  const pasta = mkdtempSync(join(tmpdir(), 'recorte-fumaca-'));
  const saida = [];
  try {
    copyFileSync(join(EXEMPLOS, 'particulas.bone'), join(pasta, 'entrada.bone'));
    for (const sonda of SONDAS_FUMACA) {
      const r = spawnSync('node', [join(AQUI, '..', '..', 'conformidade', 'adaptador-referencia.mjs'), pasta],
        { input: JSON.stringify(sonda), encoding: 'utf8', maxBuffer: 1 << 28 });
      if (r.status !== 0) throw new Error(`adaptador de referência: ${r.stderr}`);
      saida.push({ sonda, dump: JSON.parse(r.stdout) });
    }
  } finally {
    rmSync(pasta, { recursive: true, force: true });
  }
  gravar(nome, { arquivo: 'formato/exemplos/particulas.bone', sondas: saida });
  console.log(`${nome}: ${saida.map((s) => s.dump.samples.map((a) => Object.values(a.particles).reduce((n, l) => n + l.length, 0)).join('/')).join(' · ')} partículas`);
}

/**
 * G8: as misturas que nenhum boneco do exemplo usava. O herói com o REMENDO de
 * mistura em três slots (gravado na referência, para o Godot aplicar igual),
 * parado e andando.
 */
const MISTURAS = { arm: 'additive', body: 'multiply', cape_upper: 'additive' };

async function misturas(nome) {
  const ler = async (caminho) => {
    try {
      const bytes = new Uint8Array(readFileSync(join(EXEMPLOS, caminho)));
      if (caminho !== 'heroi.bone') return bytes;
      const doc = JSON.parse(new TextDecoder().decode(bytes));
      for (const s of doc.slots) if (MISTURAS[s.name]) s.blend = MISTURAS[s.name];
      return new TextEncoder().encode(JSON.stringify(doc));
    } catch {
      return null;
    }
  };
  const boneco = await carregarBoneco('heroi.bone', ler);
  const quadros = [];
  for (const [animacao, den, passos] of [[null, 60, 0], ['walk', 60, 37]]) {
    const tocador = new Tocador(boneco.arquivo.data);
    if (animacao !== null) tocador.tocar(animacao, true);
    for (let i = 0; i < passos; i++) tocador.avancar(1 / den);
    quadros.push({ animacao, den, passos, pecas: lista(pecasDoQuadro(tocador.esqueleto, new Avisos(), { cortar: true })) });
  }
  gravar(nome, { remendo: MISTURAS, quadros });
  console.log(`${nome}: ${quadros.map((q) => q.pecas.filter((p) => p.mistura !== 'normal').map((p) => `${p.slot}=${p.mistura}`).join(',')).join(' | ')}`);
}

// G9: com nomes na linha de comando, refaz só esses.
const SO = process.argv.slice(2).filter((a) => a.endsWith('.json'));
const quer = (n) => SO.length === 0 || SO.includes(n);
if (quer('heroi-parado-sem-regras.json')) await parado(true, 'heroi-parado-sem-regras.json');
if (quer('skins-sem-regras.json')) await pilhas('skins-sem-regras.json');
if (quer('heroi-parado.json')) await parado(false, 'heroi-parado.json');
if (quer('heroi-quadros-sem-regras.json')) await quadros('heroi-quadros-sem-regras.json');
if (quer('heroi-quadros.json')) await quadrosComRegras('heroi-quadros.json');
if (quer('faiscas.json')) await faiscas('faiscas.json');
if (quer('caminho.json')) await faiscas('caminho.json', VARIANTES_CAMINHO);
if (quer('fumaca.json')) await fumaca('fumaca.json');
if (quer('misturas.json')) await misturas('misturas.json');
