import { RAIZ } from './lib.mjs';
import { abrir, PECAS } from './lib.mjs';
import { nota, linhaArvore } from './cena.mjs';
import { importar, renomear } from './psd.mjs';
import { girar, irTempo, tl, novaAnim } from './anim.mjs';
import { menuSub, malhaEmDois } from './malha.mjs';
import { readFileSync } from 'node:fs';
const W=+(process.argv[2]??1440),H=+(process.argv[3]??900);
const T = await abrir(W,H); const {page}=T;
const s0 = await T.doc('d.serialize()');
// pasta de mentira (para salvar), depois o PSD
await T.ev(`__r.montarPasta([])`);
await importar(T); await renomear(T);

// osso novo: alvo do pé, solto
await page.keyboard.press('Escape'); await T.clicarMundo(-300,-200);
await T.ev('__r.focarCena()'); await page.keyboard.press('b');
const ossosAntes = await T.doc('d.file.bones.length');
const pe = await T.ev(`__r.matriz('pe_e')`);
await T.arrastar(await T.tela(pe[4]+10, pe[5]-4), await T.tela(pe[4]+30, pe[5]-4), 8);
const novo = await T.doc('d.file.bones.at(-1).name'); const paiNovo = await T.doc('d.file.bones.at(-1).parent');
nota('osso alvo', (await T.doc('d.file.bones.length'))===ossosAntes+1, `${novo} filho de ${paiNovo}`);
await page.keyboard.press('t');
// IK
await (await linhaArvore(T,'coxa_e')).click();
await (await linhaArvore(T,'canela_e')).click({modifiers:['Control']});
await menuSub(T,'Malha e regras',null,'Nova regra');
let dlg = page.locator('[role=dialog]:visible').first();
const op = (await dlg.locator('select option').allInnerTexts()).find(x=>x.startsWith('cinemática'));
await dlg.locator('select').first().selectOption({label: op});
await dlg.locator('button',{hasText:'Continuar'}).click(); await page.waitForTimeout(300);
dlg = page.locator('[role=dialog]:visible').first();
const marcados = await dlg.locator('input[type=checkbox]:checked').count();
nota('IK: escolhidos vêm marcados', marcados>=2, `${marcados} marcados ao abrir`);
for (const n of ['coxa_e','canela_e']) { const cb = dlg.locator('label',{hasText:new RegExp('^'+n+'$')}).locator('input'); if (!(await cb.isChecked())) await cb.check(); }
await dlg.locator('select').last().selectOption({label: novo});
await dlg.locator('button',{hasText:'Criar a regra'}).click(); await page.waitForTimeout(300);
nota('IK criada', (await T.doc('(d.file.constraints??d.file.ik??[]).length'))>0 || /ik/i.test(await T.doc('JSON.stringify(Object.keys(d.file))')), await T.status());
// mover o alvo e ver a canela seguir
const can0 = await T.ev(`__r.matriz('canela_e')`);
await (await linhaArvore(T,novo)).click(); await T.ev('__r.focarCena()');
await page.keyboard.press('Shift+ArrowUp'); await page.keyboard.press('Shift+ArrowUp');
const can1 = await T.ev(`__r.matriz('canela_e')`);
nota('IK segue o alvo', Math.abs(can0[0]-can1[0])>1e-3, `canela a: ${can0[0].toFixed(3)} → ${can1[0].toFixed(3)}`);
// malha
await malhaEmDois(T,'leg_front','coxa_e','canela_e');
// animação
await novaAnim(T,'andar');
await irTempo(T,0); await girar(T,'coxa_e',20);
await irTempo(T,0.5); await girar(T,'coxa_e',-40);
await irTempo(T,1); await girar(T,'coxa_e',20);
await menuSub(T,'Animação','Chaves','Selecionar todas as chaves');
await menuSub(T,'Animação','Curva da chave','Suave');
await menuSub(T,'Editar',null,'Copiar');
await irTempo(T,0.5); await menuSub(T,'Editar',null,'Colar espelhado');
console.log(await tl(T));
// trocar de pai no meio: P + clique na cena/árvore? usar Base→Virar filho de… não; use P na Árvore
await irTempo(T,0.5);
await (await linhaArvore(T,'tronco')).click();
const le = await linhaArvore(T,'espada'); await le.scrollIntoViewIfNeeded();
await page.keyboard.down('p'); await le.click(); await page.keyboard.up('p'); await page.waitForTimeout(200);
nota('pai no meio (P na Árvore)', /espada/.test(await tl(T)), await T.status());
// tocar
await T.ev('__r.focarCena()'); await page.keyboard.press('Space'); await page.waitForTimeout(700); await page.keyboard.press('Space');
nota('Espaço toca', (await T.doc('d.time'))>0, `t=${(await T.doc('d.time')).toFixed(2)}`);
// desfazer tudo
const sFim = await T.doc('d.serialize()');
let n=0; for(;n<300;n++){ const pode = await T.ev(`!document.querySelector('button[aria-label^="Desfazer"]')?.disabled`); if(!pode) break; await page.keyboard.press('Control+z'); await page.waitForTimeout(25);} 
const sUndo = await T.doc('d.serialize()');
const ord=(v)=>Array.isArray(v)?v.map(ord):(v&&typeof v==='object')?Object.fromEntries(Object.keys(v).sort().map(k=>[k,ord(v[k])])):v;
const limpa=(s)=>{const o=JSON.parse(s); delete o.bone?.modified; delete o.extensions?.RECORTE_editor_state; return JSON.stringify(ord(o));};
const sVazio = await T.doc('d.serialize()');
nota('desfazer tudo', limpa(sUndo)===limpa(s0) , `${n} passos; igual ao depois do PSD? ${limpa(sUndo)===limpa(s0)}; ossos ${JSON.parse(sUndo).bones.length}`);
for(let k=0;k<n;k++){ await page.keyboard.press('Control+Shift+z'); await page.waitForTimeout(25);} 
const sRedo = await T.doc('d.serialize()');
nota('refazer tudo', limpa(sRedo)===limpa(sFim), `igual ao fim? ${limpa(sRedo)===limpa(sFim)}`);
{ const a=JSON.parse(limpa(sRedo)), b=JSON.parse(limpa(sFim)); const dd=(x,y,p)=>{ if(JSON.stringify(x)===JSON.stringify(y))return; if(x&&y&&typeof x==='object'&&typeof y==='object'){ for(const k of new Set([...Object.keys(x),...Object.keys(y)])) dd(x[k],y[k],p+'.'+k);} else console.log('  DIF',p,JSON.stringify(x)?.slice(0,80),'≠',JSON.stringify(y)?.slice(0,80)); }; dd(a,b,''); console.log('dif:', Object.keys({...a,...b}).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]))); }
await T.ev('__r.focarCena()'); await page.keyboard.press('Control+s'); await page.waitForTimeout(3000);
console.log('janelas ao salvar:', await page.evaluate(`[...document.querySelectorAll('[role=dialog]')].filter(e=>e.offsetParent).map(e=>e.innerText.slice(0,300))`));
await page.locator('[role=dialog]:visible button',{hasText:'Escolher a pasta do projeto'}).first().click().catch(e=>console.log('sem botão'));
await page.waitForTimeout(3000);
console.log('janelas depois:', await page.evaluate(`[...document.querySelectorAll('[role=dialog]')].filter(e=>e.offsetParent).map(e=>e.innerText.slice(0,200))`));
const arqs = await T.ev('__r.listar()');
nota('salvar', arqs.some(n=>n.endsWith('.bone')), arqs.join(', ')+' | '+await T.status());
const bytes={}; for (const n of arqs) bytes[n] = n.endsWith('.png')? {b64: await T.ev(`__r.lerArquivoB64(${JSON.stringify(n)})`)} : {texto: await T.ev(`__r.lerArquivo(${JSON.stringify(n)})`)};
const nomeBone = arqs.find(n=>n.endsWith('.bone'));
const salvo = nomeBone ? bytes[nomeBone].texto : null;
await page.goto('http://localhost:5293/'); await page.waitForTimeout(1500);
console.log('janelas ao reabrir:', await page.evaluate(`[...document.querySelectorAll('[role=dialog], .dialog-escolha')].filter(e=>e.offsetParent).map(e=>e.innerText.slice(0,300))`));
const naoAgora = page.locator('.dialog-escolha button', {hasText:'Agora não'}); if (await naoAgora.count()) await naoAgora.click();
const src = readFileSync(RAIZ + '/ferramentas/provas/roteiro-30.mjs','utf8');
await page.evaluate(src.slice(src.indexOf('const AJUDANTES = String.raw`')+29, src.indexOf('true`;'))+'true'); await page.evaluate('__r.carregar()');
await page.evaluate(`__r.recriarPasta(${JSON.stringify(bytes)})`);
await page.locator('.boas-vindas-botao[data-acao="abrir-pasta"]').click();
for (let i=0;i<80;i++){ if (await T.doc('(d.file.slots??[]).length')>0) break; await page.waitForTimeout(250);} await page.waitForTimeout(600);
if (salvo) { const a=JSON.parse(limpa(salvo)), b=JSON.parse(limpa(await T.doc('d.serialize()'))); let nd=0; const dd=(x,y,p)=>{ if(JSON.stringify(x)===JSON.stringify(y))return; if(x&&y&&typeof x==='object'&&typeof y==='object'){ for(const k of new Set([...Object.keys(x),...Object.keys(y)])) dd(x[k],y[k],p+'.'+k);} else {nd++; if(nd<8) console.log('  DIF reaberto',p,JSON.stringify(x)?.slice(0,80),'≠',JSON.stringify(y)?.slice(0,80));} }; dd(a,b,''); nota('reabrir', nd===0, `${nd} diferenças; animação ${await T.doc('d.animation')}`); }
await T.foto('61-reaberto-'+W);
await T.browser.close(); process.exit(0);
await T.foto('60-fim-'+W);
console.log(T.logs.filter(l=>!/vite|debug/.test(l)).slice(0,20).join('\n'));
await T.browser.close();
