import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, campo, janelaTexto } from './harness.mjs';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
const L = Number(process.argv[2] ?? 1920), A = Number(process.argv[3] ?? 1080);
const COMPASTA = process.argv[4] === 'pasta';
const D = `${SAIDA}/B-${L}-${COMPASTA ? 'pasta' : 'sem'}`; rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/downloads`, { recursive: true });
const url = await subirEditor();
const { browser, page } = await abrir({ url, largura: L, altura: A, dirDownload: `${D}/downloads` });
const passo = async (n) => { await esperar(900); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   log: ${log.splice(0).join('\n        ')}`); await foto(page, `B${L}${COMPASTA ? 'p' : 's'}-${n}`); };
await menu(page, 'Arquivo', 'Abrir o herói');
if (COMPASTA) { mkdirSync(`${D}/proj`); fila.push(`${D}/proj`); await menu(page, 'Arquivo', 'Salvar como'); await esperar(500); const t = await janelaTexto(page); console.log('JANELA salvar como:', t);
  const b = page.locator('[role=dialog] button', { hasText: /pasta nova|Escolher a pasta|Numa pasta/ }).first(); if (await b.count()) await b.click(); await passo('0-salvou-na-pasta'); console.log('SEGUNDA JANELA?', await janelaTexto(page)); console.log(readdirSync(`${D}/proj`)); }
const casos = [
  ['gif', { Formato: 'GIF animado' }],
  ['png', { Formato: 'Sequência de imagens PNG' }],
  ['png-zip', { Formato: 'Sequência de imagens PNG', 'Um arquivo só (.zip)': true }],
  ['folha', { Formato: 'Folha de sprites, com o índice em JSON' }],
  ['webm', { Formato: 'Vídeo WebM' }],
  ['quadro', { Formato: 'Sequência de imagens PNG', 'Só este quadro (0 s)': true }],
  ['todas-gif', { Formato: 'GIF animado', 'Todas as animações': true }],
];
for (const [nome, opts] of casos) {
  await menu(page, 'Arquivo', 'Exportar', 'GIF, PNG');
  await esperar(400);
  for (const [k, v] of Object.entries(opts)) {
    const c = campo(page, k);
    if (typeof v === 'boolean') { if ((await c.isChecked()) !== v) await c.click(); }
    else await c.selectOption({ label: v });
    await esperar(150);
  }
  const vai = (await janelaTexto(page))?.split('\n').find(l => l.startsWith('Vai sair'));
  console.log(`== ${nome}: ${vai}`);
  if (COMPASTA) fila.push(`${D}/proj`);
  await page.locator('[role=dialog] button', { hasText: /^Exportar$/ }).click();
  await esperar(nome === 'webm' ? 6000 : 2500);
  await passo(`1-${nome}`);
  const res = await janelaTexto(page); console.log('   RESULTADO:', res?.replace(/\n+/g, ' / '));
  const f = page.locator('[role=dialog] button', { hasText: /^Fechar$/ }); if (await f.count()) await f.last().click();
  await esperar(300);
}
console.log('downloads:', readdirSync(`${D}/downloads`));
if (COMPASTA) console.log('proj:', readdirSync(`${D}/proj`, { recursive: true }).join(' '));
await browser.close(); pararEditor();
