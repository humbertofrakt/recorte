// C: Importar PSD, PSD com ossos, De outro programa (bcp.scml); Exportar .bonez e .boneb
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { cpSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs';
const L = Number(process.argv[2] ?? 1920), A = Number(process.argv[3] ?? 1080);
const D = `${SAIDA}/C-${L}`; rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/downloads`, { recursive: true });
cpSync('/home/user/recorte/exemplo/game', `${D}/game`, { recursive: true });
cpSync('/home/user/recorte/formato/exemplos/heroi.psd', `${D}/heroi.psd`);
const url = await subirEditor();
const { browser, page } = await abrir({ url, largura: L, altura: A, dirDownload: `${D}/downloads` });
const docInfo = () => page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; const f = d.file; return { bones: f.bones?.length, slots: f.slots?.length, anims: (f.animations ?? []).length, atlases: d.atlases.length, regions: d.atlases.reduce((n, a) => n + a.regions.length, 0), dirty: d.dirty, path: d.path }; });
const fecharJanela = async () => { for (let i = 0; i < 3; i++) { const t = await janelaTexto(page); if (!t) return; console.log('   JANELA:', t.replace(/\n+/g, ' / ').slice(0, 900)); const b = page.locator('[role=dialog] button:visible').last(); await b.click(); await esperar(400); } };
const passo = async (n) => { await esperar(1200); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   doc: ${JSON.stringify(await docInfo())}\n   log: ${log.splice(0).filter(l => !l.startsWith('[grava]')).join('\n        ').slice(0, 1500)}`); await foto(page, `C${L}-${n}`); };

// 1. PSD
fila.push([`${D}/heroi.psd`]);
await menu(page, 'Arquivo', 'Importar', 'PSD…');
await esperar(2500);
await passo('1-psd'); await fecharJanela();
// 2. PSD com ossos
fila.push([`${D}/heroi.psd`]);
await menu(page, 'Arquivo', 'Importar', 'PSD com ossos');
await esperar(1500);
console.log('   substituir?', await clicar(page, /^Substituir/));
await esperar(2500);
await passo('2-psd-ossos'); await fecharJanela();
// 3. De outro programa: a pasta exemplo/game, bcp.scml
fila.push(`${D}/game`);
await menu(page, 'Arquivo', 'Importar', 'De outro programa');
await esperar(800);
console.log('   descartar?', await clicar(page, /^Descartar/));
await esperar(1500);
console.log('   PERGUNTA:', (await janelaTexto(page))?.replace(/\n+/g, ' / '));
const b = page.locator('[role=dialog] button', { hasText: /^bcp\.scml$/ });
if (await b.count()) await b.click();
await esperar(1500);
for (let i = 0; i < 3; i++) { const t = await janelaTexto(page); if (t && /pesad|Peso|imagens/i.test(t) && !/Importado/.test(t)) { console.log('   PESO:', t.replace(/\n+/g, ' / ').slice(0, 600)); await page.locator('[role=dialog] button:visible').first().click(); await esperar(1500); } }
await esperar(8000);
await passo('3-scml'); await fecharJanela();
console.log('   imagens na aba:', await page.locator('.imagens-linha').count());
await browser.close(); pararEditor();
