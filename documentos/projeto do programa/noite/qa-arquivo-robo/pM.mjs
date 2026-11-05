// M: Fazer a skin de uma pasta; Nova skin; Clonar; Salvar; validar
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const D = `${SAIDA}/M`; rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/proj/inverno`, { recursive: true });
execFileSync('python3', ['-c', `
from PIL import Image, ImageDraw
def peca(p, w, h, c):
    im = Image.new('RGBA', (w, h), (0,0,0,0)); d = ImageDraw.Draw(im); d.rectangle([2,2,w-3,h-3], fill=c, outline=(20,20,20,255), width=2); im.save(p)
peca('${D}/proj/corpo.png', 60, 90, (80,120,200,255)); peca('${D}/proj/cabeca.png', 50, 50, (230,180,120,255))
peca('${D}/proj/inverno/corpo.png', 64, 94, (240,240,255,255)); peca('${D}/proj/inverno/cabeca.png', 54, 54, (200,220,255,255))
`]);
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, dirDownload: `${D}/dl` });
const skins = () => page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return { skins: (d.file.skins ?? []).map(s => `${s.name}:${JSON.stringify(Object.fromEntries(Object.entries(s.attachments ?? {}).map(([k, v]) => [k, Object.values(v ?? {}).map(a => a?.path ?? '·')])))}`), pilha: d.pilha }; });
const passo = async (n) => { await esperar(900); const j = await janelaTexto(page); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   ${JSON.stringify(await skins())}\n   janela: ${j?.replace(/\n+/g, ' / ').slice(0, 500)}`); await foto(page, `M-${n}`); return j; };
fila.push(`${D}/proj`);
await menu(page, 'Arquivo', 'Abrir pasta do projeto'); await esperar(1200);
const canvas = page.locator('.viewport canvas').first(); const cb = await canvas.boundingBox();
await page.locator('.imagens-linha[data-imagem="corpo"]').dragTo(canvas, { targetPosition: { x: cb.width / 2, y: cb.height / 2 + 40 } }); await esperar(400);
await page.locator('.imagens-linha[data-imagem="cabeca"]').dragTo(canvas, { targetPosition: { x: cb.width / 2, y: cb.height / 2 - 60 } }); await esperar(400);
await passo('1-montado');
await menu(page, 'Skins', 'Fazer a skin de uma pasta');
let j = await passo('2-janela');
await clicar(page, /^Fazer a skin/);
await passo('3-feita');
await page.keyboard.press('Control+s'); await esperar(2500);
await passo('4-salvo');
console.log('proj:', readdirSync(`${D}/proj`));
await browser.close(); pararEditor();
