// F: partículas — fumaça, fogo, faísca; cor ao nascer × cor na vida; emitindo na linha do tempo
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar, campo } from './harness.mjs';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const L = Number(process.argv[2] ?? 1920), A = Number(process.argv[3] ?? 1080);
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, largura: L, altura: A, dirDownload: `${SAIDA}/F-${L}` });
const emissores = () => page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; const out = []; for (const s of d.file.skins ?? []) for (const [slot, m] of Object.entries(s.attachments ?? {})) for (const [n, a] of Object.entries(m ?? {})) if (a && a.type === 'BONE_particle') out.push({ slot, n, rate: a.rate, start: a.startColor, life: a.colorOverLifetime ? 'sim' : 'não', path: a.path }); return { slots: d.file.slots?.map(s => `${s.name}@${s.bone}`), out, anims: (d.file.animations ?? []).map(a => a.name), time: d.time }; });
const passo = async (n) => { await esperar(700); const j = await janelaTexto(page); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   ${JSON.stringify(await emissores())}\n   janela: ${j?.replace(/\n+/g, ' / ').slice(0, 500)}\n   log: ${log.splice(0).join(' ; ').slice(0, 600)}`); await foto(page, `F${L}-${n}`); return j; };
await clicar(page, /Começar vazio/);
for (const p of ['Fumaça', 'Fogo', 'Faísca']) { await menu(page, 'Partículas', p); await passo(`1-${p}`); const j = await janelaTexto(page); if (j) await page.locator('[role=dialog] button:visible').first().click(); }
await menu(page, 'Animação', 'Nova animação');
await esperar(500);
const j2 = await janelaTexto(page); console.log('   NOVA ANIM:', j2?.replace(/\n+/g, ' / ').slice(0, 300));
if (j2) { await page.keyboard.press('Enter'); await esperar(500); }
await passo('2-nova-animacao');
// o tempo anda: tocar e fotografar a cena em 3 momentos
const canvas = page.locator('.viewport canvas').first();
const fotoCena = async (n) => { const p = `${SAIDA}/fotos/F${L}-cena-${n}.png`; await canvas.screenshot({ path: p }); return p; };
const t0 = await fotoCena('t0');
await page.locator('.viewport').first().focus();
await page.keyboard.press('Space'); await esperar(900);
const t1 = await fotoCena('t1'); await esperar(600);
const t2 = await fotoCena('t2');
await page.keyboard.press('Space'); await esperar(300);
console.log('   tocando? tempo agora', (await emissores()).time);
console.log('FOTOS', t0, t1, t2);
await browser.close(); pararEditor();
