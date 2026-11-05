// A janela de escolher pasta e arquivo do sistema, ligada ao disco de verdade.
// A pessoa "escolhe" o que o roteiro pôs em window.__proximaPasta /
// window.__proximosArquivos — o resto é o programa, como ele é.
(() => {
  const b64ParaBytes = (b64) => { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
  const bytesParaB64 = (u) => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const tipo = (n) => (n.endsWith('.png') ? 'image/png' : n.endsWith('.json') || n.endsWith('.bone') ? 'application/json' : 'application/octet-stream');
  const nomeDe = (p) => p.split('/').filter(Boolean).pop();
  function arquivo(caminho) {
    const h = {
      kind: 'file', name: nomeDe(caminho), __caminho: caminho,
      async getFile() {
        const b64 = await window.__disco('ler', caminho);
        if (typeof b64 !== 'string') throw new DOMException('não há ' + caminho, 'NotFoundError');
        const data = await window.__disco('data', caminho);
        return new File([b64ParaBytes(b64)], h.name, { type: tipo(h.name), lastModified: Math.round(data) });
      },
      async createWritable() {
        const partes = [];
        return {
          async write(d) { partes.push(d && typeof d === 'object' && 'type' in d && d.type === 'write' ? d.data : d); },
          async truncate() {},
          async close() {
            const blob = new Blob(partes);
            await window.__disco('gravar', caminho, bytesParaB64(new Uint8Array(await blob.arrayBuffer())));
          },
          async abort() {},
        };
      },
      async queryPermission() { return 'granted'; },
      async requestPermission() { return 'granted'; },
      async isSameEntry(o) { return o && o.__caminho === caminho; },
    };
    return h;
  }
  function pasta(caminho) {
    const filho = (n) => caminho.replace(/\/$/, '') + '/' + n;
    const h = {
      kind: 'directory', name: nomeDe(caminho), __caminho: caminho,
      async *values() {
        const lista = await window.__disco('listar', caminho);
        for (const e of lista) yield e.dir ? pasta(filho(e.name)) : arquivo(filho(e.name));
      },
      async *entries() { for await (const v of h.values()) yield [v.name, v]; },
      async *keys() { for await (const v of h.values()) yield v.name; },
      [Symbol.asyncIterator]() { return h.entries(); },
      async getFileHandle(n, o) {
        const e = await window.__disco('existe', filho(n));
        if (e === 'dir') throw new DOMException(n, 'TypeMismatchError');
        if (e === null) {
          if (!(o && o.create)) throw new DOMException('não há ' + n, 'NotFoundError');
          await window.__disco('gravar', filho(n), '');
        }
        return arquivo(filho(n));
      },
      async getDirectoryHandle(n, o) {
        const e = await window.__disco('existe', filho(n));
        if (e === 'file') throw new DOMException(n, 'TypeMismatchError');
        if (e === null) {
          if (!(o && o.create)) throw new DOMException('não há ' + n, 'NotFoundError');
          await window.__disco('mkdir', filho(n));
        }
        return pasta(filho(n));
      },
      async removeEntry(n) { await window.__disco('apagar', filho(n)); },
      async resolve(alvo) {
        const raiz = caminho.replace(/\/$/, '') + '/';
        if (!alvo || !alvo.__caminho || !alvo.__caminho.startsWith(raiz)) return null;
        return alvo.__caminho.slice(raiz.length).split('/');
      },
      async queryPermission() { return 'granted'; },
      async requestPermission() { return 'granted'; },
      async isSameEntry(o) { return o && o.__caminho === caminho; },
    };
    return h;
  }
  window.__pastaDoDisco = pasta;
  window.__arquivoDoDisco = arquivo;
  window.__escolhas = [];
  window.showDirectoryPicker = async () => {
    const p = window.__proximaPasta;
    window.__escolhas.push(['pasta', p]);
    if (!p) throw new DOMException('cancelou', 'AbortError');
    return pasta(p);
  };
  window.showOpenFilePicker = async () => {
    const lista = window.__proximosArquivos;
    window.__escolhas.push(['abrir', lista]);
    if (!lista || lista.length === 0) throw new DOMException('cancelou', 'AbortError');
    return lista.map(arquivo);
  };
  window.showSaveFilePicker = async (o) => {
    const p = window.__proximoSalvar;
    window.__escolhas.push(['salvar', p, o && o.suggestedName]);
    if (!p) throw new DOMException('cancelou', 'AbortError');
    return arquivo(p);
  };
})();
