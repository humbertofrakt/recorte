import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const require = createRequire(RAIZ + '/');
export const { chromium } = require('playwright');
const src = readFileSync(RAIZ + '/ferramentas/provas/roteiro-30.mjs','utf8');
const AJ = src.slice(src.indexOf('const AJUDANTES = String.raw`')+'const AJUDANTES = String.raw`'.length, src.indexOf('true`;')) + 'true';
export const PECAS = JSON.parse(JSON.stringify(eval('(' + src.slice(src.indexOf('const PECAS = [')+14, src.indexOf('];', src.indexOf('const PECAS = ['))+1) + ')')));
export const URL = process.env.EDITOR ?? 'http://localhost:5293/';
export const FOTOS = process.env.FOTOS ?? (RAIZ + '/../fotos-qa');
mkdirSync(FOTOS,{recursive:true});
export const esperar = (ms)=>new Promise(r=>setTimeout(r,ms));
export async function abrir(w=1440,h=900){
  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});
  const page = await ctx.newPage();
  const logs=[];
  page.on('console', m => { if (m.type()!=='debug') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));
  page.on('dialog', d => { logs.push(`[dialog ${d.type()}] ${d.message()}`); d.accept(); });
  await page.goto(URL); await page.waitForTimeout(1500);
  await page.evaluate(AJ); await page.evaluate('__r.carregar()');
  const T = {
    page, logs, browser,
    ev: (s)=>page.evaluate(s),
    async tela(x,y){ return page.evaluate(`__r.tela(${x},${y})`); },
    async foto(n){ await page.screenshot({path:`${FOTOS}/${n}.png`}); },
    async menu(top, item){
      await page.locator('.menu-button', {hasText: top}).first().click();
      await page.waitForTimeout(150);
      const it = page.locator('.menu-item').filter({hasText: item}).first();
      await it.click(); await page.waitForTimeout(250);
    },
    async arrastar(a,b,passos=10,mods=[]){
      for (const m of mods) await page.keyboard.down(m);
      await page.mouse.move(a.x,a.y); await page.mouse.down();
      for(let i=1;i<=passos;i++){ await page.mouse.move(a.x+(b.x-a.x)*i/passos, a.y+(b.y-a.y)*i/passos); await page.waitForTimeout(16);}
      await page.mouse.up(); await page.waitForTimeout(150);
      for (const m of mods) await page.keyboard.up(m);
    },
    async clicarMundo(x,y,opt={}){ const p=await T.tela(x,y); await page.mouse.click(p.x,p.y,opt); await page.waitForTimeout(120); return p;},
    doc: (expr)=>page.evaluate(`(()=>{const d=__r.doc(); return ${expr};})()`),
    texto: ()=>page.evaluate('document.body.innerText'),
    status: ()=>page.evaluate(`[...document.querySelectorAll('.status-bar, .barra-status, footer, [class*=status]')].map(e=>e.textContent.trim()).filter(Boolean).join(' | ').slice(0,400)`),
  };
  return T;
}
