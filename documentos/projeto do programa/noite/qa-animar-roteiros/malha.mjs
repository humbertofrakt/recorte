import { linhaArvore, nota } from './cena.mjs';
export async function menuSub(T, top, sub, item){
  const {page}=T;
  await page.locator('.menu-button',{hasText:top}).click(); await page.waitForTimeout(150);
  if (sub){ await page.locator('.menu-item:visible',{hasText:sub}).first().hover(); await page.waitForTimeout(250); }
  const it = page.locator('.menu-item:visible').filter({hasText:item}).first();
  if (!(await it.count())) { await page.keyboard.press('Escape'); return 'sem item'; }
  const dis = await it.evaluate(e=>e.getAttribute('aria-disabled')==='true'||e.disabled===true);
  await it.click(); await page.waitForTimeout(300);
  return dis?'cinza':'ok';
}
export const botao = (T, nome)=>T.page.locator('button:visible').filter({hasText: nome}).or(T.page.locator(`button[aria-label="${nome}"]:visible`)).first();
export async function malhaEmDois(T, slot, ossoA, ossoB){
  const {page}=T;
  const l = await linhaArvore(T, slot); await l.scrollIntoViewIfNeeded(); await l.click(); await page.waitForTimeout(100);
  console.log('virar malha:', await menuSub(T,'Malha e regras','Malha','Virar malha'), '|', await T.status());
  console.log('gerar:', await menuSub(T,'Malha e regras','Malha','Gerar automática'), '|', await T.status());
  const tab = page.locator('.panel-tab:visible',{hasText:'Malha e pesos'});
  console.log('aba Malha visível?', await tab.count());
  if (!(await tab.count())) console.log('janela:', await menuSub(T,'Janela',null,'Malha e pesos'));
  else await tab.first().click();
  await page.waitForTimeout(300);
  await T.foto('40-malha-aba');
  let lig = botao(T,'Ligar ossos');
  if (!(await lig.count())) { // dobra Ossos
    const tit = page.locator('.malha-secao-titulo:visible',{hasText:'Ossos'}).first(); if (await tit.count()) await tit.click(); await page.waitForTimeout(200);
    lig = botao(T,'Ligar ossos');
  }
  console.log('Ligar visível?', await lig.count());
  await lig.click(); await page.waitForTimeout(200);
  console.log('após ligar:', await T.status());
  for (const o of [ossoA, ossoB]) { const r = await linhaArvore(T,o); await r.scrollIntoViewIfNeeded(); await r.click(); await page.waitForTimeout(200);} 
  console.log('após clicar ossos:', await T.status());
  await botao(T,'Ligar ossos').click(); await page.waitForTimeout(200);
  await T.ev('__r.focarCena()'); await page.keyboard.press('g');
  const pa = botao(T,'Pesos automáticos'); console.log('pesos auto visível', await pa.count());
  await pa.click(); await page.waitForTimeout(300);
  console.log('após pesos:', await T.status());
  const b = await T.doc(`(()=>{ const s=d.file.slots.find(s=>s.name===${JSON.stringify(slot)}); for (const sk of d.file.skins??[]) { const a=sk.attachments?.[s.name]?.[s.attachment]; if (a) return {type:a.type, bones:a.binding?.bones??a.bones, nv:(a.vertices?.length??0)}; } return null; })()`);
  nota('malha', b && b.type==='mesh', JSON.stringify(b));
  await T.foto('41-pesos');
}
