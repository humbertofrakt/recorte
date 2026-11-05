import { RAIZ } from './lib.mjs';
import { readFileSync } from 'node:fs';
import { linhaArvore, nota } from './cena.mjs';
export const NOMES = { osso_2:'quadril', osso_3:'tronco', osso_4:'cabeca', osso_7:'braco_d', osso_8:'antebraco_d', osso_9:'braco_e', osso_10:'antebraco_e', osso_11:'espada', osso_12:'coxa_d', osso_13:'canela_d', osso_14:'pe_d', osso_15:'coxa_e', osso_16:'canela_e', osso_17:'pe_e', osso_5:'capa', osso_6:'capa2', osso_1:'cabelo' };
export async function importar(T){
  const {page}=T;
  const b64 = readFileSync(RAIZ + '/formato/exemplos/heroi.psd').toString('base64');
  await page.evaluate(`window.showOpenFilePicker = async () => { const bin=atob(${JSON.stringify(b64)}); const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i); const f=new File([u],'heroi.psd',{type:'image/vnd.adobe.photoshop'}); return [{kind:'file',name:'heroi.psd',getFile:async()=>f}]; }`);
  await page.locator('.menu-button',{hasText:'Arquivo'}).click(); await page.waitForTimeout(150);
  await page.locator('.menu-item',{hasText:'Importar'}).first().hover(); await page.waitForTimeout(300);
  await page.locator('.menu-item',{hasText:'PSD com ossos'}).first().click(); await page.waitForTimeout(1500);
}
export async function renomear(T){
  const {page}=T; const falhas=[];
  for (const [de, para] of Object.entries(NOMES)){
    const l = await linhaArvore(T, de);
    if (!(await l.count())) { falhas.push(de+' sem linha'); continue; }
    await l.scrollIntoViewIfNeeded();
    await l.locator('.arvore-nome').dblclick(); await page.waitForTimeout(100);
    const inp = page.locator('input.arvore-renomear').first();
    if (!(await inp.count())) { falhas.push(de+' sem campo'); continue; }
    await inp.fill(para); await inp.press('Enter'); await page.waitForTimeout(80);
  }
  const ossos = await T.doc(`d.file.bones.map(b=>b.name)`);
  nota('renomear', falhas.length===0, falhas.join('; ') || ossos.join(' '));
}
