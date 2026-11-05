// SPDX-License-Identifier: Apache-2.0
// DIAGNÓSTICO da noite de 04/11/2026: "reaproveitar animação", como pessoa nova.
//
//   node ferramentas/provas/reaproveitar/diagnostico.cjs [--porta 5287] [--fotos PASTA]
//
// Precisa do editor no ar (node ferramentas/provas/vite-quieto.mjs --port 5287).
// Só clica no que está visível: texto de botão, item de menu, dica. A única
// coisa de fora é o DISCO (disco.cjs): a janela do sistema de "escolher pasta"
// e "escolher arquivo". Nada de função interna, nada de mexer no documento.
// Este é o script de ANTES (a tela de 04/11/2026, com o botão "Biblioteca de
// animações" e a seção "De fora"); a tela mudou, e ele fica como registro.
// A prova de depois é prova.cjs.
const path = require('path');
const os = require('os');
const { chromium } = require('playwright');
const fs = require('fs');
const disco = require('./disco.cjs');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const PORTA = arg('--porta', '5287');
const S = arg('--fotos', fs.mkdtempSync(path.join(os.tmpdir(), 'reaproveitar-')));
const B = path.join(S, 'bonecos');
const log = (...a) => console.log(...a);
(async () => {
  const { fazerBonecos } = await import('./fazer-bonecos.mjs');
  fazerBonecos(B);
  const RAIZ = path.resolve(__dirname, '..', '..', '..');
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const arqs = {}; for (const n of fs.readdirSync(B)) arqs[n] = fs.readFileSync(B + '/' + n);
  for (const n of ['heroi.bone', 'heroi.atlas.json', 'heroi.png']) arqs[n] = fs.readFileSync(path.join(RAIZ, 'formato/exemplos', n));
  await disco.instalar(p, arqs);
  p.on('pageerror', e => log('ERRO', e.message));
  p.on('dialog', d => { log('DIALOGO', d.message()); d.accept(); });
  const foto = (n) => p.screenshot({ path: path.join(S, `antes-${n}.png`) });
  const janela = async () => (await p.locator('.dialog-box').first().innerText({ timeout: 800 }).catch(() => '(sem janela)')).replace(/\n+/g, ' | ').slice(0, 600);
  const rodape = async () => (await p.locator('.status-state').first().innerText({ timeout: 800 }).catch(() => '?')).replace(/\s+/g, ' ').slice(0, 260);
  const lista = async () => (await p.locator('.anim-item').allInnerTexts()).map(s => s.replace(/\s+/g, ' ')).join(' / ');
  const menu = async (...path) => {
    await p.locator('.menubar > button, button.menu-top, header button').filter({ hasText: new RegExp('^' + path[0] + '$') }).first().click();
    for (let i = 1; i < path.length; i++) {
      await p.waitForTimeout(200);
      const it = p.locator('.menu-name').filter({ hasText: path[i] }).last();
      if (i < path.length - 1) await it.hover(); else await it.click();
    }
    await p.waitForTimeout(400);
  };
  const botao = (t) => p.locator('.dialog-box button').filter({ hasText: t }).first().click({ timeout: 2000 }).catch(e => log('  (não achei o botão', t, ')'));
  const abrirBoneco = async (nome) => {
    const boas = p.getByRole('button', { name: /^Abrir pasta/ }).first();
    if (await boas.isVisible().catch(() => false)) await boas.click(); else await menu('Arquivo', 'Abrir pasta do projeto…');
    await p.waitForTimeout(800);
    if (await p.locator('.dialog-box').filter({ hasText: 'mudanças' }).count()) { log('  (pergunta de descartar:', await janela(), ')'); await p.locator('.dialog-box button').filter({ hasText: /Descartar|Não salvar|Sem salvar/ }).first().click().catch(()=>{}); await p.waitForTimeout(600); }
    await botao(nome); await p.waitForTimeout(1200);
  };
  await p.goto('http://localhost:' + PORTA + '/'); await p.waitForTimeout(2000);

  log('\n=== (a) o andar do herói num segundo boneco');
  await abrirBoneco('heroi.bone'); log('rodapé:', await rodape());
  await menu('Arquivo', 'Exportar', 'Animações, para outra base…');
  log('janela:', await janela()); await foto('a1');
  log('botões:', (await p.locator('.dialog-box button').allInnerTexts()).join(' ; '));
  await p.locator('.dialog-box button').first().click(); await p.waitForTimeout(800);
  log('rodapé:', await rodape(), '| salvos:', await disco.salvos(p));
  const salvo = (await disco.salvos(p)).slice(-1)[0];
  await abrirBoneco('cavaleiro.bone'); log('rodapé:', await rodape()); await foto('a2');
  await disco.escolher(p, [salvo]);
  await menu('Arquivo', 'Importar', 'Animações, de outra base…');
  log('janela:', await janela()); await foto('a3');
  await p.locator('.dialog-box button').first().click().catch(() => {}); await p.waitForTimeout(800);
  log('rodapé:', await rodape());
  log('lista:', await lista());
  await p.locator('.anim-item').filter({ hasText: 'walk' }).first().click().catch(() => log('TRAVOU: walk não está'));
  await p.waitForTimeout(300); await p.getByRole('button', { name: /^Quadro seguinte/ }).click().catch(()=>{});
  for (let i = 0; i < 8; i++) await p.keyboard.press('.').catch(()=>{});
  await p.waitForTimeout(300); await foto('a4-walk');

  log('\n=== (b) as de fábrica num boneco novo (goblin)');
  await abrirBoneco('goblin.bone');
  await p.getByRole('button', { name: /Biblioteca de animações/ }).click(); await p.waitForTimeout(500);
  log('janela:', await janela()); await foto('b1');
  await botao('Gravar'); await p.waitForTimeout(800);
  log('rodapé:', await rodape()); log('lista:', await lista()); await foto('b2');
  log('"andar" tem clique?', await p.locator('.anim-item').filter({ hasText: /^andar/ }).count());

  log('\n=== (c) robô, nomes diferentes');
  await abrirBoneco('robo.bone');
  await p.getByRole('button', { name: /Biblioteca de animações/ }).click(); await p.waitForTimeout(500);
  log('janela:', await janela()); await foto('c1');
  await botao('Fechar sem');
  for (const m of ['Arquivo', 'Editar', 'Base', 'Animação', 'Skins', 'Entidades']) {
    await p.locator('.menubar > button, header button').filter({ hasText: new RegExp('^' + m + '$') }).first().click().catch(()=>{});
    await p.waitForTimeout(250);
    const itens = await p.locator('.menu-name').allInnerTexts();
    const achou = itens.filter(t => /osso|padr|rig|combin|mape|reaprov|compart|renome/i.test(t));
    log(`  menu ${m}:`, achou.join(' ; ') || '(nada)');
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  }

  log('\n=== (d) três bonecos, uma animação');
  await p.locator('.menubar > button, header button').filter({ hasText: /^Base$/ }).first().click().catch(()=>{});
  await p.waitForTimeout(250); log('  menu Base:', (await p.locator('.menu-name').allInnerTexts()).join(' ; '));
  await p.keyboard.press('Escape');
  log('  aba Animações, botões:', (await p.locator('.anim-panel button, [class*=anim] button').evaluateAll(es => es.map(e => e.title || e.textContent).filter(Boolean).map(s=>s.slice(0,50)))).join(' ; '));
  await b.close();
})();
