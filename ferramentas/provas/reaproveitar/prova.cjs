// SPDX-License-Identifier: Apache-2.0
// A PROVA de pessoa da noite de 04/11/2026: "reaproveitar animação".
//
//   node ferramentas/provas/reaproveitar/prova.cjs [--porta 5287] [--fotos PASTA] [--saida PASTA]
//
// Precisa do editor no ar (node ferramentas/provas/vite-quieto.mjs --port 5287).
// É o diagnostico.cjs refeito com as portas novas. Só clica no que se vê: texto
// de botão, item de menu, dica. O disco (disco.cjs) é a janela do sistema.
//
// Os 4 objetivos, num projeto com 3 bases (cavaleiro, goblin, robô):
//   (b) cavaleiro recebe as 4 do Esqueleto padrão (Cópia: ele vira o dono)
//   (a) cavaleiro recebe o "walk" do herói (outros nomes e proporções)
//   (c) robô, com outros nomes de osso, recebe as do cavaleiro (Ligadas)
//   (d) goblin também; mexer no "andar" do cavaleiro muda os 3
// No fim, Salvar. Os arquivos vão para --saida, para o validador e o runtime.
// Sai com código 1 se algum passo travar.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');
const disco = require('./disco.cjs');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const PORTA = arg('--porta', '5287');
const FOTOS = arg('--fotos', null);
const SAIDA = arg('--saida', fs.mkdtempSync(path.join(os.tmpdir(), 'reaproveitar-saida-')));
const RAIZ = path.resolve(__dirname, '..', '..', '..');
const log = (...a) => console.log(...a);
let travou = 0;
const passo = (ok, texto) => { log(`${ok ? 'passou' : 'TRAVOU'}  ${texto}`); if (!ok) travou++; };

(async () => {
  const B = fs.mkdtempSync(path.join(os.tmpdir(), 'reaproveitar-bonecos-'));
  const { fazerBonecos } = await import('./fazer-bonecos.mjs');
  fazerBonecos(B);
  const arqs = {};
  for (const n of fs.readdirSync(B)) arqs[n] = fs.readFileSync(path.join(B, n));
  for (const n of ['heroi.bone', 'heroi.atlas.json', 'heroi.png']) arqs[n] = fs.readFileSync(path.join(RAIZ, 'formato/exemplos', n));

  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await disco.instalar(p, arqs);
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  p.on('dialog', (d) => { log('  (o navegador perguntou:', d.message(), ')'); d.accept(); });
  const foto = async (n) => { if (FOTOS) { fs.mkdirSync(FOTOS, { recursive: true }); await p.screenshot({ path: path.join(FOTOS, `${n}.png`) }); } };
  const rodape = async () => ((await p.locator('.status-state').getAttribute('title')) ?? '').replace(/\s+/g, ' ');
  const janela = () => p.locator('.dialog-box').first();
  const menu = async (...caminho) => {
    await p.locator('button').filter({ hasText: new RegExp(`^${caminho[0]}$`) }).first().click();
    for (let i = 1; i < caminho.length; i++) {
      await p.waitForTimeout(200);
      const item = p.locator('.menu-name').filter({ hasText: caminho[i] }).last();
      if (i < caminho.length - 1) await item.hover(); else await item.click();
    }
    await p.waitForTimeout(400);
  };
  const botaoDaJanela = (texto) => janela().locator('button').filter({ hasText: texto }).first();
  const lista = async () => (await p.locator('.anim-item').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim());
  const focarBase = async (nome) => {
    await p.locator('.anim-corpos button, .anim-corpos [role=button]').filter({ hasText: nome }).first().click();
    await p.waitForTimeout(500);
  };
  const usarAnimacoes = async ({ fonte, so, modo }) => {
    await p.getByRole('button', { name: 'Usar animações de outro boneco' }).click();
    await p.waitForTimeout(500);
    if (fonte === 'arquivo') {
      await disco.escolher(p, ['heroi.bone', 'heroi.atlas.json', 'heroi.png']);
      await botaoDaJanela('Um arquivo .bone…').click();
      await p.waitForTimeout(800);
    } else {
      await janela().locator('label').filter({ hasText: fonte }).first().click();
      await p.waitForTimeout(300);
    }
    if (so) {
      for (const caixa of await janela().locator('.reaproveitar-quais label').all()) {
        const nome = (await caixa.innerText()).trim();
        const marcada = await caixa.locator('input').isChecked();
        if (marcada !== so.includes(nome)) await caixa.locator('input').click();
      }
    }
    await janela().locator('label').filter({ hasText: modo === 'copia' ? 'Cópia' : 'Ligadas' }).first().click();
    const tabela = (await janela().locator('.reaproveitar-subtitulo').filter({ hasText: 'Combinar os ossos' }).innerText()).trim();
    return tabela;
  };

  await p.goto(`http://localhost:${PORTA}/`);
  await p.waitForTimeout(2000);

  // --- o projeto: 3 bases ------------------------------------------------
  await p.getByRole('button', { name: /^Abrir pasta/ }).first().click();
  await p.waitForTimeout(800);
  await botaoDaJanela('cavaleiro.bone').click();
  await p.waitForTimeout(1200);
  for (const outro of ['goblin.bone', 'robo.bone']) {
    await disco.escolher(p, [outro, 'bonecos.atlas.json', 'bonecos.png']);
    await menu('Base', 'Trazer uma base de fora…');
    await p.waitForTimeout(1200);
  }
  const bases = (await p.locator('.anim-corpos').innerText()).replace(/\s+/g, ' ');
  passo(/cavaleiro/.test(bases) && /goblin/.test(bases) && /robo/.test(bases), `o projeto tem as 3 bases (${bases.slice(0, 80)})`);

  // --- (b) o cavaleiro recebe as 4 do Esqueleto padrão -------------------
  await focarBase('cavaleiro');
  let t = await usarAnimacoes({ fonte: 'Esqueleto padrão', modo: 'copia' });
  await foto('1-janela-padrao');
  passo(/combinam 14 de 14/.test(t), `(b) a janela diz "${t}"`);
  await botaoDaJanela('Usar as animações').click();
  await p.waitForTimeout(800);
  let l = await lista();
  passo(['parado', 'andar', 'correr', 'pular'].every((n) => l.some((x) => x.replace(/^★\s*/, '').startsWith(n))), `(b) o cavaleiro tem parado, andar, correr, pular — "${await rodape()}"`);
  await p.locator('.anim-item').filter({ hasText: /^andar/ }).first().click();
  await p.getByRole('button', { name: /^Tocar/ }).first().click();
  await p.waitForTimeout(600);
  await p.getByRole('button', { name: /^Pausar|^Tocar/ }).first().click();
  await foto('2-cavaleiro-andando');

  // --- (a) o walk do herói no cavaleiro ----------------------------------
  t = await usarAnimacoes({ fonte: 'arquivo', so: ['walk'], modo: 'copia' });
  await foto('3-janela-heroi');
  passo(/combinam 1[0-9] de 1[0-9]/.test(t), `(a) o herói (hips, torso, arm_b…) combina: "${t}"`);
  await botaoDaJanela('Usar as animações').click();
  await p.waitForTimeout(800);
  l = await lista();
  passo(l.some((x) => x.startsWith('walk')), `(a) o cavaleiro tem "walk" — "${await rodape()}"`);

  // --- (c) o robô, com outros nomes, liga nas do cavaleiro ---------------
  await focarBase('robo');
  t = await usarAnimacoes({ fonte: 'cavaleiro', so: ['parado', 'andar', 'correr', 'pular'], modo: 'ligadas' });
  const aviso = (await janela().locator('.reaproveitar-aviso').innerText()).trim();
  await foto('4-janela-robo');
  passo(/combinam 14 de 14/.test(t), `(c) o robô (braco_direito, perna_esquerda…) combina: "${t}"`);
  passo(/braco_direito → braco_d/.test(aviso), `(c) a janela diz antes o que muda de nome: "${aviso.slice(0, 90)}…"`);
  await botaoDaJanela('Usar as animações').click();
  await p.waitForTimeout(900);
  const comp = (await p.locator('.anim-de-fora').innerText()).replace(/\s+/g, ' ');
  passo(/andar/.test(comp) && /do cavaleiro/.test(comp), `(c) Compartilhadas no robô: "${comp.slice(0, 90)}"`);
  await p.locator('button.anim-item-fora').filter({ hasText: 'andar' }).click();
  await p.getByRole('button', { name: /^Tocar/ }).first().click();
  await p.waitForTimeout(500);
  await p.getByRole('button', { name: /^Pausar|^Tocar/ }).first().click();
  await foto('5-robo-andando');

  // --- (d) o goblin também; mudar num lugar ------------------------------
  await focarBase('goblin');
  await usarAnimacoes({ fonte: 'cavaleiro', so: ['parado', 'andar', 'correr', 'pular'], modo: 'ligadas' });
  await botaoDaJanela('Usar as animações').click();
  await p.waitForTimeout(900);
  // Abrir o original, do goblin: vai para o cavaleiro, com a animação aberta.
  await p.locator('button.anim-item-fora').filter({ hasText: 'andar' }).click();
  await p.waitForTimeout(400);
  const cena = p.locator('canvas').first();
  const goblinAntes = await cena.screenshot();
  await p.getByRole('button', { name: /Abrir o original/ }).first().click();
  await p.waitForTimeout(800);
  const onde = (await p.locator('.anim-corpos').innerText()).replace(/\s+/g, ' ');
  passo(/Animação: andar/.test(await p.locator('body').innerText()) && /cavaleiro/.test(await rodape()),
    `(d) "Abrir o original" levou ao cavaleiro com "andar" aberta — "${await rodape()}"`);
  void onde;
  // Mudar o andar no cavaleiro: a cabeça inclinada, no quadro 0.
  // A cabeça, pela busca da Árvore (o botão da lupa): a pessoa não sabe onde ela está na árvore.
  await p.getByRole('button', { name: /^Buscar na Árvore/ }).first().click();
  await p.getByPlaceholder('Buscar osso ou desenho').fill('cabeca');
  await p.waitForTimeout(400);
  await p.locator('.arvore-item', { has: p.locator('.arvore-nome', { hasText: /^cabeca$/ }) }).first().click();
  await p.waitForTimeout(300);
  // Propriedades → Ficha rápida → Ângulo.
  const campo = p.getByText('Ângulo', { exact: true }).first().locator('xpath=following::input[1]');
  await campo.click();
  await campo.fill('35');
  await campo.press('Enter');
  await p.waitForTimeout(500);
  passo(/[Cc]have|rota/i.test(await rodape()), `(d) mexi no "andar" do cavaleiro: "${await rodape()}"`);
  await foto('6-cavaleiro-mudou');
  // E o goblin, sem fazer nada nele:
  await focarBase('goblin');
  await p.locator('button.anim-item-fora').filter({ hasText: 'andar' }).click();
  await p.waitForTimeout(600);
  const goblinDepois = await cena.screenshot();
  passo(!goblinAntes.equals(goblinDepois), '(d) a cena do goblin mudou sem ninguém mexer nele (o "andar" é o do cavaleiro)');
  await foto('7-goblin-mudou-junto');

  // --- Salvar --------------------------------------------------------------
  // DEFEITO ACHADO (de outra parte, o Salvar do projeto — 05/11/2026): com o
  // foco numa base que NÃO é a principal (a que abriu a pasta), o Salvar grava
  // essa base por cima da principal e depois a principal por cima dela — a
  // base em foco some do manifesto e as mudanças dela se perdem. Por isso a
  // prova volta ao cavaleiro antes de salvar. Está no relatório, com o dono.
  await focarBase('cavaleiro');
  await p.keyboard.press('Control+s');
  await p.waitForTimeout(1500);
  await p.locator('.dialog-box button').filter({ hasText: /Salvar assim mesmo|Salvar mesmo/ }).first().click({ timeout: 800 }).catch(() => {});
  await p.waitForTimeout(1200);
  passo(/Salvo/.test(await rodape()), `Salvar: "${await rodape()}"`);
  const avisos = (await p.getByRole('button', { name: /aviso/ }).last().getAttribute('title')) ?? '';
  log(`  (barra de avisos: ${avisos.replace(/\s+/g, ' ').slice(0, 200)})`);
  const salvos = await disco.ler(p);
  fs.mkdirSync(SAIDA, { recursive: true });
  for (const [n, buf] of Object.entries(salvos)) fs.writeFileSync(path.join(SAIDA, n), buf);
  passo('cavaleiro-animacoes.bone' in salvos, `o arquivo das compartilhadas foi gravado ao lado: ${Object.keys(salvos).filter((n) => n.endsWith('.bone')).join(', ')}`);
  log(`arquivos em ${SAIDA}`);

  // --- (e) fechar e reabrir: a ligação atravessa o disco -------------------
  // Página nova, memória vazia; o disco é o que o Salvar gravou.
  const p2 = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await disco.instalar(p2, salvos);
  p2.on('pageerror', (e) => erros.push(e.message));
  await p2.goto(`http://localhost:${PORTA}/`);
  await p2.waitForTimeout(2000);
  await p2.getByRole('button', { name: /^Abrir pasta/ }).first().click();
  await p2.waitForTimeout(1500);
  await p2.locator('.anim-corpos button, .anim-corpos [role=button]').filter({ hasText: 'goblin' }).first().click();
  await p2.waitForTimeout(800);
  const reaberto = (await p2.locator('.anim-de-fora').innerText().catch(() => '')).replace(/\s+/g, ' ');
  passo(/andar/.test(reaberto) && /do cavaleiro/.test(reaberto), `(e) reaberto do disco, o goblin ainda toca as do cavaleiro: "${reaberto.slice(0, 70)}"`);
  if (FOTOS) await p2.screenshot({ path: path.join(FOTOS, '8-reaberto.png') });
  await p2.close();

  // --- (f) o goblin sozinho, numa pasta sem o cavaleiro: o arquivo basta -----
  const soGoblin = { ...salvos };
  delete soGoblin['manifest.json']; delete soGoblin['cavaleiro.bone']; delete soGoblin['robo.bone']; delete soGoblin['heroi.bone'];
  const p3 = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await disco.instalar(p3, soGoblin);
  p3.on('pageerror', (e) => erros.push(e.message));
  await p3.goto(`http://localhost:${PORTA}/`);
  await p3.waitForTimeout(2000);
  await p3.getByRole('button', { name: /^Abrir pasta/ }).first().click();
  await p3.waitForTimeout(1500);
  await p3.locator('.dialog-box button').filter({ hasText: 'goblin.bone' }).first().click({ timeout: 2000 }).catch(() => {});
  await p3.waitForTimeout(1500);
  const sozinho = (await p3.locator('.anim-de-fora').innerText().catch(() => '')).replace(/\s+/g, ' ');
  passo(/andar/.test(sozinho) && /cavaleiro-animacoes\.bone/.test(sozinho),
    `(f) o goblin sozinho lê cavaleiro-animacoes.bone da pasta: "${sozinho.slice(0, 70)}"`);
  await p3.close();

  if (erros.length > 0) { log('erros da página:'); for (const e of erros) log('  ', e); travou += erros.length; }
  await b.close();
  log(travou === 0 ? '\nOs 4 objetivos, só com cliques: nenhum passo travou.' : `\n${travou} passo(s) travaram.`);
  process.exit(travou === 0 ? 0 : 1);
})();
