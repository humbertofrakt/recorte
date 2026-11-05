import { abrir } from './lib.mjs';
import { linhaArvore } from './cena.mjs';
import { importar, NOMES } from './psd.mjs';
const W=+(process.argv[2]??1920),H=+(process.argv[3]??1080);
const T = await abrir(W,H); const {page}=T;
await importar(T);
let falhas=0;
for (const [de, para] of Object.entries(NOMES)){
  const l = await linhaArvore(T, de); await l.scrollIntoViewIfNeeded(); await page.waitForTimeout(80);
  const b = await l.locator('.arvore-nome').boundingBox();
  const st0 = await page.evaluate(`window.__rol?.scrollTop ?? (()=>{let p=document.querySelector('.arvore-item'); while(p&&!(p.scrollHeight>p.clientHeight+2&&getComputedStyle(p).overflowY!=='visible')) p=p.parentElement; window.__rol=p; return p.scrollTop})()`);
  await page.mouse.dblclick(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(120);
  const st1 = await page.evaluate('window.__rol.scrollTop');
  const inp = page.locator('input.arvore-renomear').first();
  const val = await inp.inputValue().catch(()=>null);
  if (val!==de) { falhas++; console.log('ERRADO', de, 'abriu', val, 'rolagem', st0, '→', st1); await page.keyboard.press('Escape'); continue; }
  await inp.fill(para); await inp.press('Enter'); await page.waitForTimeout(80);
}
console.log(W, 'falhas:', falhas);
await T.browser.close();
