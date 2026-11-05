// Q: o projeto grande do Spriter (bcp) — exportar GIF e PNG; quanto demora, o que sai
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar, campo } from './harness.mjs';
import { cpSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
const D = `${SAIDA}/Q`; rmSync(D, { recursive: true, force: true }); mkdirSync(D, { recursive: true });
cpSync('/home/user/recorte/exemplo/game', `${D}/game`, { recursive: true });
rmSync(`${D}/game/bcp 2026-09-09.bone`);
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, dirDownload: `${D}/dl` });
fila.push(`${D}/game`);
await menu(page, 'Arquivo', 'Importar', 'De outro programa'); await esperar(800);
await clicar(page, /^bcp\.scml$/); await esperar(800); await clicar(page, /^Abrir com as imagens/); await esperar(9000);
await clicar(page, /^Fechar/);
console.log('rodapé', await rodape(page));
const anims = await page.evaluate(async () => (await import('/src/viewport/viewport.ts')).viewportPanel.doc.file.animations.map(a => `${a.name}:${a.duration}`));
console.log('animações', anims.join(', '));
await menu(page, 'Arquivo', 'Exportar', 'GIF, PNG'); await esperar(500);
console.log((await janelaTexto(page))?.split('\n').filter(l => /Vai sair/.test(l)).join(' | '));
fila.push(`${D}/game`);
const t0 = Date.now();
await page.evaluate(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.trim() === 'Exportar'); setTimeout(() => b.click(), 10); });
page.setDefaultTimeout(600000);
let ultimo = Date.now(); const batidas = [];
const pulso = setInterval(() => {}, 1000);
for (let i = 0; i < 100; i++) { await esperar(1000); const t1 = Date.now(); const and = await page.evaluate(() => document.querySelector('[role=dialog] progress, .exp-andamento, [class*=andamento]')?.getAttribute('value') ?? document.querySelector('[role=dialog]')?.innerText.match(/\d+ de \d+/)?.[0]); batidas.push(`${((t1 - t0) / 1000).toFixed(0)}s:${((Date.now() - t1) / 1000).toFixed(1)}s:${and}`); const j = await janelaTexto(page); if (j && /Imagem exportada|Não deu/.test(j)) { console.log('JANELA', j.replace(/\n+/g, ' / ').slice(0, 500)); break; } }
clearInterval(pulso); console.log('respostas da página (tempo:espera:andamento)', batidas.join(' ')); console.log('tempo', ((Date.now() - t0) / 1000).toFixed(1), 's; rodapé', await rodape(page));
await foto(page, 'Q-gif');
const ex = `${D}/game/exportar`; try { for (const n of readdirSync(ex)) console.log(n, statSync(`${ex}/${n}`).size); } catch (e) { console.log('sem exportar/', readdirSync(`${D}/dl`, { recursive: true })); }
console.log(log.filter(l => /error|erro/i.test(l)).slice(0, 5).join('\n'));
await browser.close(); pararEditor();
