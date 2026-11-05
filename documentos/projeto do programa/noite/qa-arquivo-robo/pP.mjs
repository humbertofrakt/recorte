// P: rascunho recuperado → como trazer as imagens sem perder o recuperado
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { cpSync, mkdirSync, rmSync, readdirSync, readFileSync } from 'node:fs';
const D = `${SAIDA}/P`; rmSync(D, { recursive: true, force: true }); mkdirSync(D, { recursive: true });
cpSync('/home/user/recorte/exemplo/game/mao', `${D}/mao`, { recursive: true });
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, dirDownload: `${D}/dl` });
const st = async (n) => { await esperar(1200); const info = await page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return { slots: d.file.slots?.map(s => s.name), dirty: d.dirty, path: d.path, warn: document.querySelector('.status-warn')?.textContent }; }); console.log(`## ${n}: ${await rodape(page)}\n   ${JSON.stringify(info)}\n   janela: ${(await janelaTexto(page))?.replace(/\n+/g, ' / ').slice(0, 400)}\n   log: ${log.splice(0).filter(l => !l.startsWith('[grava]')).join(' ; ').slice(0, 300)}`); };
fila.push(`${D}/mao`);
await menu(page, 'Arquivo', 'Abrir pasta do projeto'); await esperar(1000);
const canvas = page.locator('.viewport canvas').first(); const cb = await canvas.boundingBox();
await page.locator('.imagens-linha').nth(0).dragTo(canvas, { targetPosition: { x: cb.width / 2, y: cb.height / 2 } });
await page.keyboard.press('Control+s'); await esperar(1500);
await page.locator('.imagens-linha').nth(2).dragTo(canvas, { targetPosition: { x: cb.width / 2 + 120, y: cb.height / 2 } });
await esperar(2500);
await st('1-mexido-sem-salvar');
await page.reload(); await page.waitForSelector('.viewport canvas'); await esperar(1500);
await clicar(page, /^Recuperar/);
await st('2-recuperado');
// o caminho do rodapé: Abrir pasta → Salvar e continuar → pasta → (seletor do .bone) → a pasta reabre
fila.push(`${D}/mao`, `${D}/mao/mao.bone`, `${D}/mao`);
await menu(page, 'Arquivo', 'Abrir pasta do projeto'); await esperar(600);
await clicar(page, /^Salvar e continuar/); await esperar(800);
await clicar(page, /^Escolher a pasta/); await esperar(4000);
for (let i = 0; i < 2; i++) { const j = await janelaTexto(page); if (!j) break; console.log('   JANELA', j.replace(/\n+/g, ' / ').slice(0, 300)); await page.locator('[role=dialog] button:visible').first().click(); await esperar(2500); }
await st('7-fim');
const bone = JSON.parse(readFileSync(`${D}/mao/mao.bone`, 'utf8'));
console.log('   no disco:', bone.slots.map(s => s.name));
await foto(page, 'P-fim');
await browser.close(); pararEditor();
