// passos comuns: abrir pasta, arrastar peças, ordem, ossos, P+clique
import { abrir, PECAS } from './lib.mjs';
export const OSSOS = [
  { id: 'quadril', de: [0, 45], ate: [0, 60], pai: null, pecas: [] },
  { id: 'tronco', de: [0, 60], ate: [0, 140], pai: 'quadril', pecas: ['corpo/tronco'] },
  { id: 'cabeca', de: [0, 150], ate: [0, 200], pai: 'tronco', pecas: ['corpo/cabeca'] },
  { id: 'braco_e', de: [32, 128], ate: [32, 75], pai: 'tronco', pecas: ['bracos/braco_frente'] },
  { id: 'braco_d', de: [-32, 128], ate: [-32, 75], pai: 'tronco', pecas: ['bracos/braco_tras'] },
  { id: 'mao', de: [32, 70], ate: [32, 44], pai: 'braco_e', pecas: ['bracos/mao_aberta'] },
  { id: 'perna_e', de: [12, 52], ate: [12, -12], pai: 'quadril', pecas: ['pernas/perna_frente', 'pernas/pe_frente'] },
  { id: 'perna_d', de: [-12, 52], ate: [-12, -12], pai: 'quadril', pecas: ['pernas/perna_tras', 'pernas/pe_tras'] },
];
export const R = [];
export function nota(passo, ok, txt){ R.push({passo,ok,txt}); console.log(`${ok?'OK  ':'FALHA'} ${passo}: ${txt}`); }
export async function linhaArvore(T, nome){
  const l = T.page.locator('.arvore-item').filter({has: T.page.locator('.arvore-nome', {hasText: new RegExp('^'+nome+'$')})}).first();
  return l;
}
export async function montar(T, {ate=99}={}){
  const {page}=T;
  await T.ev(`__r.montarPasta(${JSON.stringify(PECAS)})`);
  await T.menu('Arquivo','Abrir pasta');
  await page.waitForTimeout(800);
  // 3: arrastar cada peça
  for (const p of PECAS) {
    if (p.x===undefined) continue;
    const nome=p.nome.split('/')[1];
    const tile = page.locator('.imagens-linha', {hasText: new RegExp('^'+nome+'$')}).first();
    await tile.scrollIntoViewIfNeeded();
    const b = await tile.boundingBox();
    const alvo = await T.tela(p.x,p.y);
    await T.arrastar({x:b.x+b.width/2,y:b.y+b.height/2}, alvo, 8);
    await page.waitForTimeout(150);
  }
  const n = await T.doc(`(d.file.slots??[]).length`);
  nota(3, n===9, `${n} de 9 peças na cena pelo arrasto`);
  if (ate<4) return;
  // 4: braço de trás para trás — clicar nele e Ctrl+↓ na cena
  const c = await T.ev(`__r.centroDoSlot(__r.slotDe('bracos/braco_tras'))`);
  await T.clicarMundo(c.x, c.y);
  const idx = (img)=>`(d.file.slots??[]).findIndex(s=>s.name===__r.slotDe('${img}'))`;
  for (let i=0;i<12;i++){
    if (await T.doc(`${idx('bracos/braco_tras')} < ${idx('corpo/tronco')}`)) break;
    await page.keyboard.press('Control+ArrowDown'); await page.waitForTimeout(60);
  }
  const ok4 = await T.doc(`${idx('bracos/braco_tras')} < ${idx('corpo/tronco')}`);
  nota(4, ok4, ok4?'Ctrl+↓ na cena mandou o braço de trás para trás':'Ctrl+↓ não moveu');
  if (ate<5) return;
  // 5: ossos com B
  const nomeDe = {};
  for (const o of OSSOS){
    await page.keyboard.press('Escape');
    if (o.pai){ const l = await linhaArvore(T, nomeDe[o.pai]); await l.click(); await page.waitForTimeout(80); }
    else { // clicar no vazio da cena para desescolher
      await T.clicarMundo(-300, -200);
    }
    await T.ev(`__r.focarCena()`);
    await page.keyboard.press('b');
    const antes = await T.doc(`d.file.bones.map(b=>b.name)`);
    await T.arrastar(await T.tela(...o.de), await T.tela(...o.ate), 8);
    const novo = await T.doc(`d.file.bones.map(b=>b.name).find(n=>!${JSON.stringify(antes)}.includes(n))??null`);
    if (!novo){ nota(5,false,`${o.id}: nenhum osso nasceu`); continue;}
    nomeDe[o.id]=novo;
    const pai = await T.doc(`d.file.bones.find(b=>b.name===${JSON.stringify(novo)}).parent??null`);
    const esp = o.pai? nomeDe[o.pai] : await T.doc(`d.file.bones[0].name`);
    if (pai!==esp) nota(5,false,`${o.id} (${novo}) nasceu filho de ${pai}, não de ${esp}`);
  }
  // renomear pela Árvore (duplo clique) para o nome do roteiro
  for (const o of OSSOS){
    const l = await linhaArvore(T, nomeDe[o.id]);
    await l.locator('.arvore-nome').dblclick(); await page.waitForTimeout(120);
    const inp = page.locator('.arvore input, input.arvore-renomear, .arvore-item input').first();
    if (await inp.count()){ await inp.fill(o.id); await inp.press('Enter'); await page.waitForTimeout(100); nomeDe[o.id]=o.id; }
    else { nota(5,false,`duplo clique no nome ${nomeDe[o.id]} não abriu campo de renomear`); break; }
  }
  const ossos = await T.doc(`d.file.bones.map(b=>b.name+'<'+(b.parent??''))`);
  nota(5, ossos.length===9, `ossos: ${ossos.join(' ')}`);
  T.nomeDe = nomeDe;
  if (ate<6) return;
  // 6: P + clique
  await page.keyboard.press('t');
  for (const o of OSSOS){
    if (!o.pecas.length) continue;
    await (await linhaArvore(T, nomeDe[o.id])).click();
    await T.ev(`__r.focarCena()`);
    await page.keyboard.down('p');
    for (const img of o.pecas){
      const slot = await T.ev(`__r.slotDe('${img}')`);
      const antes = await T.ev(`__r.pontosDoSlot('${slot}')`);
      const cc = await T.ev(`__r.centroDoSlot('${slot}')`);
      await T.clicarMundo(cc.x, cc.y);
      const e = await T.ev(`({osso: __r.doc().file.slots.find(s=>s.name==='${slot}').bone, pontos: __r.pontosDoSlot('${slot}'), j: __r.janelas()})`);
      const andou = Math.max(...antes.map((v,i)=>Math.abs(v-e.pontos[i])));
      if (e.osso!==nomeDe[o.id] || andou>1e-3 || e.j) nota(6,false,`${slot}: osso ${e.osso} (queria ${nomeDe[o.id]}), andou ${andou.toFixed(3)}, janelas ${e.j}`);
    }
    await page.keyboard.up('p');
  }
  const presos = await T.doc(`d.file.slots.map(s=>s.name+'→'+s.bone).join(' ')`);
  nota(6, true, presos);
}
