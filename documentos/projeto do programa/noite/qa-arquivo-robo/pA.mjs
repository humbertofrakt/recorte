// A: Novo projeto (pasta) · Abrir pasta · soltar peça · Salvar · Salvar como · reabrir · rascunho
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA } from './harness.mjs';
import { cpSync, rmSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
const L = Number(process.argv[2] ?? 1920), A = Number(process.argv[3] ?? 1080);
const D = `${SAIDA}/A-${L}`; rmSync(D, { recursive: true, force: true }); mkdirSync(D, { recursive: true });
cpSync('/home/user/recorte/exemplo/game/mao', `${D}/mao`, { recursive: true });
const url = await subirEditor();
const { browser, page } = await abrir({ url, largura: L, altura: A, dirDownload: `${D}/downloads` });
const passo = async (n) => { await esperar(700); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   log: ${log.splice(0).join('\n        ')}`); await foto(page, `A${L}-${n}`); };

// 1. Novo projeto
mkdirSync(`${D}/novo1`);
fila.push(`${D}/novo1`);
await page.keyboard.press('Control+n');
await passo('1-novo-projeto');
console.log('   novo1:', readdirSync(`${D}/novo1`));

// 2. Abrir pasta do projeto
fila.push(`${D}/mao`);
await menu(page, 'Arquivo', 'Abrir pasta do projeto');
await passo('2-abrir-pasta');

// 3. arrastar duas peças para a cena (arrasto HTML5 de verdade)
const canvas = page.locator('.viewport canvas').first();
const cb = await canvas.boundingBox();
const linhas = page.locator('.imagens-linha');
console.log('   linhas na aba:', await linhas.count());
await linhas.nth(0).dragTo(canvas, { targetPosition: { x: cb.width / 2 - 100, y: cb.height / 2 } });
await esperar(300);
await linhas.nth(2).dragTo(canvas, { targetPosition: { x: cb.width / 2 + 100, y: cb.height / 2 } });
await passo('3-arrastar');
console.log('   slots:', await page.evaluate(async () => (await import('/src/viewport/viewport.ts')).viewportPanel.doc.file.slots?.map(s => s.name)));

// 4. Salvar (Ctrl+S)
await page.locator('.viewport').first().click({ position: { x: 20, y: 20 } });
await page.keyboard.press('Control+s');
await passo('4-salvar');
console.log('   novo1:', existsSync(`${D}/novo1`) ? readdirSync(`${D}/novo1`) : '-', ' mao:', readdirSync(`${D}/mao`).filter(f => !f.endsWith('.png')));

// 5. Salvar como → numa pasta nova
await menu(page, 'Arquivo', 'Salvar como');
await esperar(400);
await foto(page, `A${L}-5a-salvar-como`);
const botoes = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].filter(b => b.getClientRects().length).map(b => b.textContent.trim()));
console.log('   botões da janela:', botoes);

mkdirSync(`${D}/so-bone`);
fila.push(`${D}/so-bone/copia.bone`);
await page.evaluate(() => { window.__st=[]; new MutationObserver(() => window.__st.push(document.querySelector('.status-state').textContent)).observe(document.querySelector('.status-state'), {childList:true,characterData:true,subtree:true}); });
await page.locator('[role=dialog] button', { hasText: 'Só o arquivo .bone' }).click();
await passo("5b-so-o-bone"); console.log("   ST:", JSON.stringify(await page.evaluate(() => window.__st))); console.log("   NOTA:", await page.evaluate(async () => (await import("/src/io/open-save.ts")).lastSaveNote()));
console.log('   so-bone:', readdirSync(`${D}/so-bone`));
await menu(page, 'Arquivo', 'Salvar como');
mkdirSync(`${D}/pasta-nova`);
fila.push(`${D}/pasta-nova`);
await page.locator('[role=dialog] button', { hasText: 'Numa pasta nova' }).click();
await passo('5c-pasta-nova');
console.log('   pasta-nova:', readdirSync(`${D}/pasta-nova`));

// 6. mexe sem salvar (move a peça com o mouse) e recarrega: rascunho?
const docAntes = await page.evaluate(async () => JSON.stringify((await import('/src/viewport/viewport.ts')).viewportPanel.doc.file));
await page.mouse.move(cb.x + cb.width / 2 + 100, cb.y + cb.height / 2);
await page.mouse.down(); await page.mouse.move(cb.x + cb.width / 2 + 160, cb.y + cb.height / 2 + 40, { steps: 8 }); await page.mouse.up();
await esperar(2500);
const docMexido = await page.evaluate(async () => JSON.stringify((await import('/src/viewport/viewport.ts')).viewportPanel.doc.file));
console.log('   mexeu?', docAntes !== docMexido);
await page.reload(); await page.waitForSelector('.viewport canvas'); await esperar(1500);
await passo('6-recarregou');
const janelas = await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .welcome, .boas-vindas')].filter(e => e.getClientRects().length).map(e => e.textContent.trim().slice(0, 300)));
console.log('   janelas:', janelas);

await page.locator('[role=dialog] button', { hasText: 'Recuperar este trabalho' }).click();
await passo('7-recuperou');
const docRec = await page.evaluate(async () => JSON.stringify((await import('/src/viewport/viewport.ts')).viewportPanel.doc.file));
console.log('   recuperado == mexido?', docRec === docMexido, docRec.length, docMexido.length);
{ const a = JSON.parse(docRec), b = JSON.parse(docMexido); for (const k of Object.keys(b)) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) console.log('   DIF', k, JSON.stringify(a[k]).slice(0,300), '\n       vs', JSON.stringify(b[k]).slice(0,300)); }
console.log('   avisos:', await page.evaluate(() => [...document.querySelectorAll('.warn-list li')].map(l => l.textContent)));
console.log('   dirty:', await page.evaluate(async () => (await import('/src/viewport/viewport.ts')).viewportPanel.doc.dirty));
// 8. Fecha e reabre o salvo: recarrega sem rascunho, Ctrl+O
await page.evaluate(() => { indexedDB.databases?.().then(()=>{}); });
fila.push([`${D}/pasta-nova/copia.bone`]);
await page.keyboard.press('Control+o');
await passo('8-ctrl-o');
const docAberto = await page.evaluate(async () => (await import('/src/viewport/viewport.ts')).viewportPanel.doc.file);
console.log('   aberto: slots', docAberto.slots?.map(s => s.name), 'atlas', JSON.stringify(docAberto.assets));
const img = await page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return d.atlases.map(a => a.pages.map(p => [p.image, !!d.imageFor(p)])); });
console.log('   páginas com imagem:', JSON.stringify(img));
await browser.close(); pararEditor();
