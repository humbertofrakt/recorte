import { linhaArvore, nota } from './cena.mjs';
export async function girar(T, osso, graus){
  const {page}=T;
  const l = await linhaArvore(T, osso); await l.scrollIntoViewIfNeeded(); await l.click(); await page.waitForTimeout(80);
  await T.ev('__r.focarCena()'); await page.keyboard.press('t');
  const cx = await T.ev(`(()=>{const b=__r.caixa.transformBox(__r.doc(),__r.vp.camera.zoom); return b&&{p:b.pivot,k:b.knob}})()`);
  const g=graus*Math.PI/180, dx=cx.k.x-cx.p.x, dy=cx.k.y-cx.p.y;
  const d={x:cx.p.x+dx*Math.cos(g)-dy*Math.sin(g), y:cx.p.y+dx*Math.sin(g)+dy*Math.cos(g)};
  await T.arrastar(await T.tela(cx.k.x,cx.k.y), await T.tela(d.x,d.y), 10);
}
export async function irTempo(T, t){
  const {page}=T;
  const marcas = await T.ev(`__r.q('.dope-regua .dope-marca').map(m=>({t:m.textContent.trim(), x:m.getBoundingClientRect().left}))`);
  const rb = await page.locator('.dope-regua').first().boundingBox();
  const x0 = marcas[0].x, x1 = marcas[1].x; const v = parseFloat(marcas[1].t.replace(',','.'));
  const x = Math.min(x0 + (x1-x0)*t/v + 1, rb.x+rb.width-2);
  await page.mouse.click(x, rb.y+rb.height/2); await page.waitForTimeout(120);
  return T.doc('d.time');
}
export const tl = (T)=>T.doc(`d.file.animations.find(a=>a.name===d.animation).timelines.map(t=>t.type+':'+t.target+'.'+t.property+': '+t.keys.map(k=>(+k.time).toFixed(2)+'='+(typeof k.value==='number'?k.value.toFixed(1):JSON.stringify(k.value))+(k.curve?'~'+JSON.stringify(k.curve):'')).join(', ')).join(' ## ')`);
export async function novaAnim(T, nome){
  const {page}=T;
  if (!(await page.locator('button[aria-label="Nova animação"]:visible').count())) { await page.locator('.panel-tab:visible',{hasText:/^Animações/}).first().click(); await page.waitForTimeout(200); }
  await page.locator('button[aria-label="Nova animação"]:visible').first().click(); await page.waitForTimeout(300);
  await page.keyboard.press('Control+a'); await page.keyboard.type(nome); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
}
