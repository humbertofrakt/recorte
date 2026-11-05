import { RAIZ } from './lib.mjs';
import { abrir } from './lib.mjs';
import { montar, nota, linhaArvore } from './cena.mjs';
const W=+(process.argv[2]??1440),H=+(process.argv[3]??900); const T = await abrir(W,H); const {page}=T;
await montar(T);
// 7
const e7 = await T.ev(`({nomes: __r.q('.arvore-item .arvore-nome').map(n=>n.textContent.trim()), cortados: __r.q('.arvore-item .arvore-nome').filter(n=>n.scrollWidth>n.clientWidth).map(n=>n.textContent.trim()+(n.title||n.closest('[title]')?.title?' [tem dica]':' [sem dica]'))})`);
nota(7, true, `árvore: ${e7.nomes.join(',')} | cortados: ${e7.cortados.join(', ')}`);
// 8 botão direito na mão
const slot = await T.ev(`__r.slotDe('bracos/mao_aberta')`);
const c = await T.ev(`__r.centroDoSlot('${slot}')`);
await page.keyboard.press('Escape');
const p = await T.tela(c.x,c.y);
await page.mouse.click(p.x,p.y,{button:'right'}); await page.waitForTimeout(300);
await T.foto('08-grade-'+W);
const g = page.locator('.grade-imagem').filter({has: page.locator('xpath=self::*[starts-with(@title,"bracos/mao_fechada")]')});
const alvo = await T.ev(`(()=>{const b=__r.q('.grade-imagem').find(x=>x.title.startsWith('bracos/mao_fechada')); return b?__r.centro(b):null})()`);
if (alvo) { await page.mouse.click(alvo.x,alvo.y); await page.waitForTimeout(200); }
nota(8, (await T.ev(`__r.slotDe('bracos/mao_fechada')`))===slot, `grade ${alvo?'abriu':'NÃO abriu'}`);
await page.keyboard.press('Escape');
// 9 nova animação pelo +
const mais = page.locator('button[aria-label="Nova animação"]').first();
await mais.click(); await page.waitForTimeout(400);
await T.foto('09-nova-'+W);
const an = await T.doc(`({a:d.animation,t:d.time})`);
nota(9, an.a!==null, JSON.stringify(an));
// renomear? ver se abriu campo
console.log('foco:', await T.ev(`document.activeElement?.tagName+' '+document.activeElement?.className+' '+(document.activeElement?.value??'')`));


await page.keyboard.type('andar'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
console.log('anim:', await T.doc(`d.animation`));
// 10: régua para 0,5 s por clique
const regua = page.locator('.dope-regua').first();
const rb = await regua.boundingBox();
const marcas = await T.ev(`__r.q('.dope-regua .dope-marca').map(m=>({t:m.textContent.trim(), x:m.getBoundingClientRect().left}))`);
console.log('régua', JSON.stringify(rb), JSON.stringify(marcas.slice(0,6)));
const m5 = marcas.find(m=>m.t.startsWith('0,50'));
await page.mouse.click(m5.x+1, rb.y+rb.height/2); await page.waitForTimeout(200);
console.log('tempo após clique na régua em 0,50:', await T.doc('d.time'));
async function girar(osso, graus){
  await (await linhaArvore(T, osso)).click(); await page.waitForTimeout(100);
  await T.ev('__r.focarCena()'); await page.keyboard.press('t');
  const cx = await T.ev(`(()=>{const b=__r.caixa.transformBox(__r.doc(),__r.vp.camera.zoom); return b&&{p:b.pivot,k:b.knob}})()`);
  const g=graus*Math.PI/180, dx=cx.k.x-cx.p.x, dy=cx.k.y-cx.p.y;
  const d={x:cx.p.x+dx*Math.cos(g)-dy*Math.sin(g), y:cx.p.y+dx*Math.sin(g)+dy*Math.cos(g)};
  await T.arrastar(await T.tela(cx.k.x,cx.k.y), await T.tela(d.x,d.y), 10);
}
await girar('tronco', 15); await girar('braco_e', 30);
const keys = await T.doc(`d.file.animations.find(a=>a.name===d.animation).timelines.map(t=>t.target+'.'+t.property+':'+t.keys.map(k=>k.time+'='+JSON.stringify(k.value)).join(','))`);
nota(10, keys.length>0, keys.join(' | '));
await T.foto('10-chaves-'+W);
// 11: ir para 0, escolher as chaves de 0 na linha Resumo? clicar no losango do resumo em 0
const los = await T.ev(`__r.q('.dope-corpo [class*=losango], .dope-corpo [class*=chave]').slice(0,12).map(e=>({c:e.className, r:e.getBoundingClientRect().toJSON()}))`);
console.log(JSON.stringify(los).slice(0,1500));

const tl = ()=>T.doc(`d.file.animations.find(a=>a.name===d.animation).timelines.map(t=>t.target+'.'+t.property+':'+t.keys.map(k=>(+k.time).toFixed(2)+'='+JSON.stringify(k.value)).join(',')).join(' | ')`);
// 11
await page.mouse.click(los[0].r.x+los[0].r.width/2, los[0].r.y+los[0].r.height/2); await page.waitForTimeout(150);
console.log('foco depois de clicar losango:', await T.ev(`document.activeElement?.className`), 'escolhidas:', await T.ev(`__r.q('.dope-chave.escolhida, .dope-chave[aria-selected=true], .dope-chave.is-selected').length`));
await page.keyboard.press('Control+c'); await page.waitForTimeout(150);
console.log('status', await T.status());
await page.mouse.click(rb.x+rb.width-2, rb.y+rb.height/2); await page.waitForTimeout(150);
console.log('tempo', await T.doc('d.time'));
await page.keyboard.press('Control+v'); await page.waitForTimeout(200);
console.log('status', await T.status());
const k11 = await tl();
nota(11, /1\.00=/.test(k11), k11);
await T.foto('11-colar-'+W);
// 12: espaço na cena
await page.mouse.click(rb.x+3, rb.y+rb.height/2);
await T.ev('__r.focarCena()');
await page.keyboard.press('Space');
const tempos=[]; for(let i=0;i<14;i++){ tempos.push(await T.doc('d.time')); await page.waitForTimeout(120);} 
await page.keyboard.press('Space');
const anda = new Set(tempos.map(t=>t.toFixed(2))).size>3, volta = tempos.some((t,i)=>i&&t<tempos[i-1]-0.05);
nota(12, anda&&volta, tempos.map(t=>t.toFixed(2)).join(' '));

// 13
await T.ev('__r.focarCena()');
await page.keyboard.press('Control+s'); await page.waitForTimeout(2500);
const arqs = await T.ev('__r.listar()');
nota(13, arqs.some(n=>n.endsWith('.bone')), arqs.join(', ') + ' | ' + await T.status());
await T.foto('13-salvo-'+W);
const bytes={}; for (const n of arqs) bytes[n] = n.endsWith('.png')? {b64: await T.ev(`__r.lerArquivoB64(${JSON.stringify(n)})`)} : {texto: await T.ev(`__r.lerArquivo(${JSON.stringify(n)})`)};
const salvo = bytes[arqs.find(n=>n.endsWith('.bone')&&!n.includes('/'))].texto;
// 14
await page.goto('http://localhost:5293/'); await page.waitForTimeout(1500);
await T.foto('14-reabre-janela-'+W);
console.log('janelas:', await page.evaluate(`[...document.querySelectorAll('[role=dialog], .dialog-escolha')].filter(e=>e.offsetParent).map(e=>e.innerText.slice(0,300))`));
const naoAgora = page.locator('.dialog-escolha button', {hasText:'Agora não'});
if (await naoAgora.count()) await naoAgora.click();
const src = (await import('node:fs')).readFileSync(RAIZ + '/ferramentas/provas/roteiro-30.mjs','utf8');
const AJ = src.slice(src.indexOf('const AJUDANTES = String.raw`')+29, src.indexOf('true`;'))+'true';
await page.evaluate(AJ); await page.evaluate('__r.carregar()');
await page.evaluate(`__r.recriarPasta(${JSON.stringify(bytes)})`);
const bv = page.locator('.boas-vindas-botao[data-acao="abrir-pasta"]');
console.log('boas-vindas abrir pasta visível:', await bv.isVisible());
await bv.click();
for (let i=0;i<60;i++){ if (await T.doc('(d.file.slots??[]).length')>0) break; await page.waitForTimeout(250);} 
await page.waitForTimeout(500);
const agora = JSON.parse(await T.doc('d.serialize()')), a=JSON.parse(salvo);
delete a.bone.modified; delete agora.bone.modified;
const dif = Object.keys({...a,...agora}).filter(k=>JSON.stringify(a[k])!==JSON.stringify(agora[k]));
nota(14, dif.length===0, `diferenças: ${dif.join(',')||'nenhuma'}; animação aberta: ${await T.doc('d.animation')}`);
await T.foto('14-reaberto-'+W);
console.log(T.logs.filter(l=>!/vite|HMR/.test(l)).slice(0,20).join('\n'));
await T.browser.close();
