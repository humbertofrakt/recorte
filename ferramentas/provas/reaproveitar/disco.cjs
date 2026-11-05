// SPDX-License-Identifier: Apache-2.0
// O DISCO da prova "reaproveitar": uma pasta de mentira, em memória, com o
// jeito da API de arquivos do Chrome — a mesma ideia do roteiro-30.mjs.
//
// O que ela substitui é SÓ a janela do sistema operacional: "escolha a pasta",
// "escolha o arquivo", "salvar como". Quem escolhe é o script, como a pessoa
// escolheria na janela do Windows. Nada aqui toca no documento do editor.
//
//   const disco = require('./disco.cjs');
//   await disco.instalar(page, { 'cavaleiro.bone': Buffer, ... });
//   await disco.escolher(page, ['cavaleiro.bone']);   // a próxima janela de abrir
//   const arquivos = await disco.ler(page);            // { nome: Buffer }
const SCRIPT = (arquivos) => {
  const b64 = (s) => { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
  const arquivo = (nome, file) => {
    const h = {
      kind: 'file', name: nome, _file: file,
      async getFile() { return h._file; },
      async queryPermission() { return 'granted'; },
      async requestPermission() { return 'granted'; },
      async createWritable() {
        const partes = [];
        return { async write(d) { partes.push(d && d.data !== undefined ? d.data : d); }, async close() { h._file = new File(partes, nome, { lastModified: Date.now() }); } };
      },
      async isSameEntry(o) { return o === h; },
    };
    return h;
  };
  const pasta = (nome) => {
    const filhos = new Map();
    const h = {
      kind: 'directory', name: nome, _filhos: filhos,
      async *values() { for (const f of filhos.values()) yield f; },
      async *entries() { for (const [n, f] of filhos) yield [n, f]; },
      async *keys() { for (const n of filhos.keys()) yield n; },
      async queryPermission() { return 'granted'; },
      async requestPermission() { return 'granted'; },
      async getFileHandle(n, o) {
        let f = filhos.get(n);
        if (f === undefined) {
          if (!(o && o.create)) throw new DOMException('não há ' + n, 'NotFoundError');
          f = arquivo(n, new File([], n)); filhos.set(n, f);
        }
        return f;
      },
      async getDirectoryHandle(n, o) {
        let d = filhos.get(n);
        if (d === undefined) { if (!(o && o.create)) throw new DOMException('não há ' + n, 'NotFoundError'); d = pasta(n); filhos.set(n, d); }
        return d;
      },
      async removeEntry(n) { filhos.delete(n); },
      async resolve(alvo) { for (const [n, f] of filhos) if (f === alvo) return [n]; return null; },
      async isSameEntry(o) { return o === h; },
    };
    return h;
  };
  const raiz = pasta('jogo');
  for (const [nome, dado] of Object.entries(arquivos)) {
    const tipo = nome.endsWith('.png') ? 'image/png' : 'application/octet-stream';
    raiz._filhos.set(nome, arquivo(nome, new File([b64(dado)], nome, { type: tipo, lastModified: Date.now() })));
  }
  const disco = { raiz, proximos: [], salvos: [] };
  window.__disco = disco;
  window.showDirectoryPicker = async () => raiz;
  window.showOpenFilePicker = async () => {
    const nomes = disco.proximos; disco.proximos = [];
    if (nomes.length === 0) throw new DOMException('fechou', 'AbortError');
    return nomes.map((n) => raiz._filhos.get(n)).filter(Boolean);
  };
  window.showSaveFilePicker = async (o) => {
    const nome = (o && o.suggestedName) || 'sem-nome.bone';
    disco.salvos.push(nome);
    return raiz.getFileHandle(nome, { create: true });
  };
};

async function instalar(page, arquivos) {
  const dados = {};
  for (const [n, buf] of Object.entries(arquivos)) dados[n] = Buffer.from(buf).toString('base64');
  await page.addInitScript(SCRIPT, dados);
}
/** A próxima janela "Abrir arquivo" devolve estes arquivos (a pessoa os escolheu). */
async function escolher(page, nomes) { await page.evaluate((n) => { window.__disco.proximos = n; }, nomes); }
/** O que está no disco agora: { nome: Buffer }. */
async function ler(page) {
  const d = await page.evaluate(async () => {
    const out = {};
    for (const [n, f] of window.__disco.raiz._filhos) {
      if (f.kind !== 'file') continue;
      const u = new Uint8Array(await f._file.arrayBuffer()); let s = '';
      for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
      out[n] = btoa(s);
    }
    return out;
  });
  const out = {};
  for (const [n, s] of Object.entries(d)) out[n] = Buffer.from(s, 'base64');
  return out;
}
/** Os nomes que o programa gravou pela janela "Salvar como", em ordem. */
async function salvos(page) { return page.evaluate(() => [...window.__disco.salvos]); }
module.exports = { instalar, escolher, ler, salvos };
