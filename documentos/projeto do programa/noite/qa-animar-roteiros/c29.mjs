import { abrir } from './lib.mjs';
import { linhaArvore } from './cena.mjs';
import { importar } from './psd.mjs';
import { novaAnim, irTempo, girar } from './anim.mjs';
const T = await abrir(1440,900); const {page}=T;
await importar(T);
await novaAnim(T,'a'); await irTempo(T,0.5); await girar(T,'osso_3',10); await irTempo(T,0);
const testa = async (onde) => {
  const t0 = await T.doc('d.time'); await page.keyboard.press('Space'); await page.waitForTimeout(500); const t1 = await T.doc('d.time');
  console.log(onde, '| foco', await T.ev('document.activeElement?.className'), '| tocou?', t1!==t0, t0.toFixed(2), t1.toFixed(2), '|', await page.evaluate("document.querySelector('.status-state').title"));
  await page.keyboard.press('Space'); await page.waitForTimeout(150); await irTempo(T,0);
};
await (await linhaArvore(T,'osso_4')).click(); await testa('Árvore');
await page.locator('.panel-tab:visible',{hasText:'Ordem'}).first().click(); await page.waitForTimeout(200);
await page.locator('.ordem-linha').filter({has: page.locator('.ordem-nome',{hasText:/^body$/})}).first().click(); await testa('Ordem');
await page.locator('.anim-lista > li').first().click(); await testa('Animações');
await page.locator('#ficha-x').click(); await page.keyboard.press('Escape'); await testa('Propriedades (depois do Esc)');
await T.browser.close();
