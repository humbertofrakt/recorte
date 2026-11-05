import { abrir } from './lib.mjs';
import { linhaArvore } from './cena.mjs';
import { importar } from './psd.mjs';
import { novaAnim, irTempo, girar } from './anim.mjs';
const T = await abrir(1440,900); const {page}=T;
await importar(T);
await novaAnim(T,'andar'); await irTempo(T,0.5); await girar(T,'osso_3',10); await irTempo(T,0);
const anims = ()=>T.doc('d.file.animations.map(a=>a.name).join(",")');
const testa = async (rot, seletor) => {
  const b = page.locator(seletor).first(); await b.click(); await page.waitForTimeout(200);
  const a0 = await anims(); const t0 = await T.doc('d.time');
  await page.keyboard.press('Space'); await page.waitForTimeout(400);
  console.log(rot, '| foco', await T.ev('document.activeElement?.getAttribute("aria-label")||document.activeElement?.className'), '| antes', a0, '| depois do Espaço', await anims(), '| tocou?', t0 !== await T.doc('d.time'));
  await page.keyboard.press('Escape');
};
await testa('Duplicar', 'button[aria-label="Duplicar"]:visible');
await testa('Chavear tudo', 'button:visible:has-text("Chavear tudo")');
await T.browser.close();
