// SPDX-License-Identifier: Apache-2.0
// Mede se algum painel das colunas passa da coluna, de LADO ou de ALTURA.
//
// De lado — lote 65. O Humberto, 11/09/2026, com a foto da aba Malha e pesos:
// "esses menus estão impossíveis de usar". O painel passava da coluna, com
// texto cortado e barra de rolagem de lado. A regra do plano "painéis que
// cabem": nenhum painel é mais largo que a coluna; nunca há rolagem de lado.
//
// De altura — 13/09/2026. O Humberto voltou à mesma aba, agora pela altura:
// "dentro do mesh é tanto texto que mesmo maximizado ainda tem uma caixa de
// rolagem imensa... é uma wikipédia". A medição de lado deixou isso passar,
// porque só olhava a LARGURA: um painel podia caber na coluna e ainda assim
// pedir meia tela de rolagem para baixo. Esta é a rede que faltava — e ela
// mede o mesmo que a de lado, virado noventa graus.
//
// A RÉGUA, em uma frase: **o que rola tem de ser lista que cresce com o
// arquivo — nunca texto fixo do painel.**
//
// Ele não reclamou de rolar; reclamou de ler. A Árvore de dezoito ossos vai
// rolar sempre, e tem de rolar: a lista cresce com o `.bone`, não com o
// painel, e exigir que ela caiba seria uma régua que ninguém consegue cumprir.
// Já o painel de malha rola por texto que está lá sempre, com arquivo nenhum
// aberto — e esse é o defeito.
//
// Como a prova sabe a diferença: a caixa que É uma lista leva
// `data-rolagem="lista"` no HTML, uma linha no painel que a cria (Árvore,
// Ordem, Imagens, Animações, Peles, Regras). A marca é do painel, e não desta
// prova, porque quem sabe se algo é lista é quem a desenha — uma lista de
// nomes escrita aqui envelheceria na primeira aba nova.
//
// A TERCEIRA espécie: o painel com PALCO (`data-rolagem="palco"`), hoje só a
// Prévia. Decisão do Humberto em 13/09/2026, depois de a medição mostrar a
// conta: o palco é um canvas de proporção fixa — 150 px de altura numa coluna
// estreita — e o painel recebe 152 px em 1280×720. Nenhuma arrumação de
// conteúdo faz a Prévia inteira caber; dobrar mais só esconderia melhor. Um
// painel com palco **pode** rolar.
//
// A régua dele é outra, e é exigente do jeito certo: **o palco inteiro, e o
// começo do que vem depois dele, à vista sem rolar**. Isto é, abrir a aba tem
// de mostrar o palco e dizer que há mais coisa abaixo — o que não pode
// acontecer é a aba abrir e o palco sozinho tomar a tela, sem nenhum sinal de
// que existe algo mais.
//
// Como o `roteiro-30.mjs`: sobe o próprio servidor (porta 5192) e um Chrome
// sem janela (9336), com perfil novo, e desliga os dois no fim. Em 1440x900 e
// em 1280x720, abre o herói, escolhe a malha `face` (a única malha do herói)
// e passa por TODAS as abas das duas colunas. Em cada uma, aponta:
//
//   - o corpo do grupo que rola de lado (`scrollWidth > clientWidth`);
//   - qualquer caixa de dentro que rola de lado;
//   - qualquer elemento visível que passa da borda direita da coluna;
//   - o corpo do grupo que rola para baixo (`scrollHeight > clientHeight`);
//   - qualquer caixa de dentro que rola para baixo, **menos as marcadas com
//     `data-rolagem="lista"`**;
//   - a caixa marcada `data-rolagem="palco"` em que o palco, ou o começo do
//     que vem depois dele, fica fora da vista.
//
// TRÊS VEZES ESTA PROVA MENTIU, e de jeitos diferentes. Fica escrito porque
// quem a usa para decidir precisa saber que ela foi caçada:
//
//   1. Ela media a aba Malha e pesos com o painel VAZIO — a seleção se perdia —
//      e dizia "cabe". Conserto: a seleção é reafirmada antes de cada aba.
//   2. A marca `data-rolagem="palco"` ISENTAVA o painel em vez de trocar a
//      régua dele, e a Prévia passou a "caber" nas duas medidas estando errada
//      nas duas. Conserto: marca troca a régua, nunca isenta.
//   3. O estado da coluna ATRAVESSAVA um recarregamento no meio da rodada. O
//      `localStorage` guarda a divisão e sobrevive ao reload dentro do mesmo
//      perfil do Chrome; a página voltava com a divisão de antes, e não com a
//      de fábrica. Os números da mesma tela variaram de 193 a 315 px, com um
//      pico de 94 — e o 94 saiu exatamente da rodada que recarregou. Conserto:
//      `abrirEditor` limpa o que o editor guardou, sempre.
//
// A lição das três é a mesma: **prova que mede outra coisa sai verde**. Toda
// vez que um número melhorar sozinho aqui, desconfie antes de comemorar.
//
// USO, da raiz do projeto:
//
//   node ferramentas/provas/medir-paineis.mjs [--fotos PASTA] [--detalhe ABA]
//
// Com `--detalhe "Prévia"`, a prova ainda mede tudo e, além disso, imprime a
// altura de cada filho direto daquele painel. É como se acha QUEM come a
// altura, em vez de adivinhar lendo o CSS: a medição já sobe o editor e o
// Chrome, então detalhar sai de graça.
//
// Com `--fotos`, uma foto por aba e por tamanho. Código 1 quando alguma aba
// transborda, de lado ou de altura.

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..', '..');
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA_EDITOR = 5192;
const PORTA_CHROME = 9336;
const URL_EDITOR = `http://localhost:${PORTA_EDITOR}/`;
const TAMANHOS = [[1440, 900], [1280, 720]];
/**
 * Rodada 16: a ficha do emissor mede-se também em 1920×1080, a tela do
 * Humberto. Só nesta passada — as outras continuam nas duas telas de sempre,
 * para o número delas não mudar de sentido.
 */
const TAMANHOS_EMISSOR = [...TAMANHOS, [1920, 1080]];
/** `--so-emissor`: só a 3ª passada (para medir a ficha velha contra a nova). */
const SO_EMISSOR = process.argv.includes('--so-emissor');
const FOTOS = (() => {
  const i = process.argv.indexOf('--fotos');
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : null;
})();
/**
 * **A caixa da queda** — 29/09/2026, chat C (P44), o mesmo molde do roteiro.
 *
 * Em toda queda — a medição que não roda, ou uma aba que falta — fica uma
 * pasta com a hora no nome em `backup/provas-quedas/medir/`: `queda.txt` (a
 * frase inteira, o tamanho da tela, o console da página, a carga da máquina)
 * e `tela.png`. Uma prova que cai e não diz por quê nos deixa cegos.
 */
async function guardarQueda(onde, frase) {
  try {
    const agora = new Date();
    const dois = (v) => String(v).padStart(2, '0');
    const carimbo = `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`
      + `_${dois(agora.getHours())}${dois(agora.getMinutes())}${dois(agora.getSeconds())}_${onde.normalize('NFD').replace(/[^\w]+/g, '-')}`;
    const pasta = join(RAIZ, 'backup', 'provas-quedas', 'medir', carimbo);
    mkdirSync(pasta, { recursive: true });
    let tela = '(sem foto)';
    try {
      const foto = await cmd('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(pasta, 'tela.png'), Buffer.from(foto.result.data, 'base64'));
      tela = 'tela.png';
    } catch (erro) { tela = `(a foto falhou: ${String(erro)})`; }
    const { loadavg, cpus } = await import('node:os');
    writeFileSync(join(pasta, 'queda.txt'), [
      `Medição dos painéis — queda em: ${onde}`,
      `Hora: ${agora.toISOString()} · núcleos: ${cpus().length} · carga: ${process.platform === 'win32' ? 'o Windows não informa' : loadavg().join(' ')}`,
      '', 'A frase inteira:', frase, '',
      'Console da página:', ...(consoleDaPagina.length === 0 ? ['  limpo'] : consoleDaPagina.map((c) => `  ${c}`)),
      '', `Foto: ${tela}`,
    ].join('\n'));
    console.log(`            a queda ficou guardada em backup/provas-quedas/medir/${carimbo}/`);
  } catch (erro) {
    console.log(`            NÃO consegui guardar a queda: ${String(erro)}`);
  }
}

const DETALHE = (() => {
  const i = process.argv.indexOf('--detalhe');
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
})();

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Dentro da página
// ---------------------------------------------------------------------------

const AJUDANTES = String.raw`
window.__m = (() => {
  const m = {};
  m.carregar = async () => {
    m.vp = (await import('/src/viewport/viewport.ts')).viewportPanel;
    m.acoes = await import('/src/ui/actions.ts');
    m.contrato = await import('/src/contract.ts');
    return true;
  };
  m.abas = () => [...document.querySelectorAll('.panel-column .panel-tab')]
    .map((t) => t.textContent.trim()).filter((n) => n !== '');
  const descrever = (el) => {
    const classe = typeof el.className === 'string' && el.className.trim() !== '' ? '.' + el.className.trim().split(/\s+/).join('.') : '';
    const texto = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return el.tagName.toLowerCase() + classe + (texto ? ' "' + texto + '"' : '');
  };
  m.medir = (nome) => {
    const aba = [...document.querySelectorAll('.panel-column .panel-tab')].find((t) => t.textContent.trim() === nome);
    if (!aba) return { nome, erro: 'sem aba' };
    const grupo = aba.closest('.panel-group');
    const coluna = aba.closest('.panel-column');
    const corpo = grupo?.querySelector('.panel-group-body') ?? grupo;
    if (!corpo || !coluna) return { nome, erro: 'sem corpo ou sem coluna' };
    const fora = [];
    // A altura vai numa lista PRÓPRIA: são dois defeitos diferentes, com
    // culpados diferentes. Largura é conteúdo largo demais; altura é texto
    // demais. Misturar as duas esconderia uma atrás da outra no relatório.
    const alto = [];
    const limite = coluna.getBoundingClientRect().right + 1;
    if (corpo.scrollWidth > corpo.clientWidth + 1) {
      fora.push('o corpo rola de lado: ' + corpo.scrollWidth + ' > ' + corpo.clientWidth);
    }
    // A marca data-rolagem="lista" diz: esta caixa cresce com o arquivo,
    // e rolar nela é o certo.
    const lista = (el) => el.dataset?.rolagem === 'lista';
    const palco = (el) => el.dataset?.rolagem === 'palco';
    // Quanto do que vem DEPOIS do palco precisa aparecer: uma linha de texto.
    // Menos que isso e a borda de baixo não conta nada a quem olha.
    const LINHA = 24;
    /**
     * A régua do painel com palco: o primeiro filho (o palco) inteiro, e mais
     * uma linha do que vem depois dele, dentro da altura visível.
     */
    const medirPalco = (caixa) => {
      const filhos = [...caixa.children].filter((f) => f.getBoundingClientRect().height > 0);
      if (filhos.length === 0) return [];
      const visivel = caixa.clientHeight;
      const alturaDoPalco = Math.round(filhos[0].getBoundingClientRect().height);
      if (alturaDoPalco > visivel) {
        return ['o palco não cabe: ' + alturaDoPalco + ' px num painel de ' + visivel];
      }
      if (filhos.length > 1 && alturaDoPalco + LINHA > visivel) {
        return ['o palco toma a aba inteira: sobram ' + (visivel - alturaDoPalco)
          + ' px depois dele, e uma linha do que vem a seguir pede ' + LINHA];
      }
      return [];
    };
    if (palco(corpo)) {
      alto.push(...medirPalco(corpo));
    } else if (!lista(corpo) && corpo.scrollHeight > corpo.clientHeight + 1) {
      alto.push('o corpo rola para baixo: sobram ' + (corpo.scrollHeight - corpo.clientHeight)
        + ' px (' + corpo.scrollHeight + ' > ' + corpo.clientHeight + ')');
    }
    for (const el of corpo.querySelectorAll('*')) {
      if (el.getClientRects().length === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden') continue;
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1) {
        fora.push('rola de lado: ' + descrever(el) + ' (' + el.scrollWidth + ' > ' + el.clientWidth + ')');
      }
      // A marca de palco NAO isenta: ela troca a regua. Marcar e nao medir
      // seria o falso verde de novo, agora feito de propósito.
      if (palco(el)) {
        alto.push(...medirPalco(el).map((linha) => descrever(el) + ': ' + linha));
      } else if (!lista(el) && (cs.overflowY === 'auto' || cs.overflowY === 'scroll')
        && el.scrollHeight > el.clientHeight + 1) {
        alto.push('rola para baixo: ' + descrever(el) + ' (sobram '
          + (el.scrollHeight - el.clientHeight) + ' px)');
      }
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > limite) {
        fora.push('passa da coluna ' + Math.round(r.right - limite) + ' px: ' + descrever(el));
      }
    }
    return { nome, fora, alto };
  };
  /**
   * O painel está VAZIO? — A10, degrau 11, lote 8 (18/09/2026).
   *
   * Medir painel vazio é a mentira número 1 do cabeçalho, e ela voltou por
   * outra porta: a aba Malha e pesos foi consertada em 13/09 reafirmando a
   * seleção, mas Imagens, Entidades e Pivôs continuavam sendo medidas com o
   * recado "Nenhuma pasta aberta" no lugar do painel inteiro. Um painel que
   * mostra uma frase no lugar do conteúdo **cabe sempre**, e o verde dele não
   * prova nada.
   *
   * Devolve o motivo, ou texto vazio quando há conteúdo de verdade.
   */
  m.vazio = (nome) => {
    const aba = [...document.querySelectorAll('.panel-column .panel-tab')].find((t) => t.textContent.trim() === nome);
    if (!aba) return 'sem aba';
    const grupo = aba.closest('.panel-group');
    const corpo = grupo?.querySelector('.panel-group-body') ?? grupo;
    if (!corpo) return 'sem corpo';
    // O painel DESTA aba, e não o primeiro da coluna: todos os painéis do
    // grupo moram no DOM ao mesmo tempo, e os escondidos levam o texto deles
    // junto. Ler o primeiro fazia a prova dizer "Imagens mostra Nenhuma
    // entidade" — o texto do vizinho, debaixo do nome errado.
    const host = [...corpo.querySelectorAll('.panel-body')].find((c) => !c.hidden && c.clientHeight > 0)
      ?? corpo;
    const painel = [...host.querySelectorAll('.painel-corpo')].find((c) => c.clientHeight > 0) ?? host;
    const texto = (painel.textContent ?? '').replace(/\s+/g, ' ').trim();
    // As frases que os painéis escrevem no lugar do conteúdo. Cada uma é um
    // painel que não tem o que mostrar agora.
    const FRASES = [
      'Nenhuma pasta aberta', 'Nenhuma imagem', 'Nada aqui ainda', 'Nenhuma entidade',
      'Escolha um desenho', 'Nenhuma pele', 'Nenhuma regra', 'Nenhuma animação',
      'Sem pivô', 'Nenhum pivô', 'Nenhum corpo',
    ];
    // A frase só conta quando ela está NO LUGAR do conteúdo. A aba Imagens diz
    // "Nenhuma pasta aberta" na linha da pasta e mostra a grade cheia logo
    // abaixo: ali a frase é um recado, não um painel vazio. A régua é o
    // tamanho do que há para medir.
    const MINIMO = 160;
    for (const frase of FRASES) {
      if (texto.includes(frase) && painel.scrollHeight < MINIMO) {
        return 'mostra "' + frase + '" no lugar do conteúdo';
      }
    }
    // Sem frase conhecida, a régua é o tamanho: um painel com menos de duas
    // linhas de conteúdo não tem o que medir.
    if (painel.scrollHeight < 40) return 'conteúdo de ' + Math.round(painel.scrollHeight) + ' px: não há o que medir';
    return '';
  };

  /*
   * A pasta de mentira — A10, degrau 11, lote 8. O mesmo molde do
   * roteiro-30.mjs: sem uma pasta aberta, os painéis Imagens, Entidades e
   * Pivôs mostram "Nenhuma pasta aberta" e a medição deles não prova nada.
   */
  m.png = (w, h, cor) => new Promise((ok) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.fillStyle = cor; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
    c.toBlob(ok, 'image/png');
  });
  m.arquivo = (nome, file) => {
    const h = {
      kind: 'file', name: nome, _file: file,
      async getFile() { return h._file; },
      async createWritable() {
        const partes = [];
        return {
          async write(d) { partes.push(d); },
          async close() { h._file = new File(partes, nome, { lastModified: Date.now() }); },
        };
      },
    };
    return h;
  };
  m.pasta = (nome) => {
    const filhos = new Map();
    const h = {
      kind: 'directory', name: nome, _filhos: filhos,
      async *values() { for (const f of filhos.values()) yield f; },
      async queryPermission() { return 'granted'; },
      async requestPermission() { return 'granted'; },
      async getFileHandle(n, o) {
        let f = filhos.get(n);
        if (f === undefined) {
          if (!(o && o.create)) throw new DOMException('nao ha ' + n, 'NotFoundError');
          f = m.arquivo(n, new File([], n)); filhos.set(n, f);
        }
        return f;
      },
      async getDirectoryHandle(n, o) {
        let d = filhos.get(n);
        if (d === undefined) {
          if (!(o && o.create)) throw new DOMException('nao ha ' + n, 'NotFoundError');
          d = m.pasta(n); filhos.set(n, d);
        }
        return d;
      },
      async resolve(alvo) {
        const busca = (dir, caminho) => {
          for (const [n, f] of dir._filhos) {
            if (f === alvo) return [...caminho, n];
            if (f.kind === 'directory') { const achou = busca(f, [...caminho, n]); if (achou) return achou; }
          }
          return null;
        };
        return busca(h, []);
      },
    };
    return h;
  };
  m.montarPasta = async () => {
    const pecas = [
      ['corpo/tronco', 60, 90, '#8fb3d9'], ['corpo/cabeca', 48, 48, '#e8c39e'],
      ['corpo/braco', 24, 70, '#8fb3d9'], ['corpo/perna', 26, 80, '#5b6b8c'],
      ['armas/espada', 18, 90, '#c9ccd4'], ['armas/escudo', 54, 54, '#b08d57'],
    ];
    const raiz = m.pasta('boneco');
    for (const [caminho, w, h, cor] of pecas) {
      const [sub, nome] = caminho.split('/');
      const dir = await raiz.getDirectoryHandle(sub, { create: true });
      const blob = await m.png(w, h, cor);
      dir._filhos.set(nome + '.png', m.arquivo(nome + '.png', new File([blob], nome + '.png', { type: 'image/png', lastModified: Date.now() })));
    }
    window.showDirectoryPicker = async () => raiz;
    window.showSaveFilePicker = async (o) => raiz.getFileHandle((o && o.suggestedName) || 'boneco.bone', { create: true });
    return true;
  };

  // A altura de cada filho direto do corpo do painel, para achar o culpado.
  m.detalhar = (nome) => {
    const aba = [...document.querySelectorAll('.panel-column .panel-tab')].find((t) => t.textContent.trim() === nome);
    if (!aba) return null;
    const grupo = aba.closest('.panel-group');
    const corpo = grupo?.querySelector('.panel-group-body') ?? grupo;
    // O VISÍVEL: todos os painéis da coluna moram no DOM ao mesmo tempo, e os
    // escondidos têm altura zero. Pegar o primeiro .painel-corpo detalhava
    // o painel errado — foi o que aconteceu na primeira tentativa, e o relato
    // saiu com o conteúdo da aba Exibição debaixo do nome "Prévia".
    const painel = [...(corpo?.querySelectorAll('.painel-corpo') ?? [])]
      .find((c) => c.clientHeight > 0) ?? corpo;
    if (!painel) return null;
    const linhas = [];
    for (const f of painel.children) {
      const cs = getComputedStyle(f);
      linhas.push(Math.round(f.getBoundingClientRect().height) + ' px  ' + descrever(f)
        + '  [margem ' + cs.marginTop + '/' + cs.marginBottom + ']');
    }
    return { cabe: Math.round(painel.clientHeight), conteudo: Math.round(painel.scrollHeight), linhas };
  };
  return m;
})();
true`;

// ---------------------------------------------------------------------------
// O servidor, o Chrome e o CDP (o mesmo molde do roteiro)
// ---------------------------------------------------------------------------

const filhos = [];
function encerrar() {
  for (const p of filhos) { try { p.kill(); } catch { /* já saiu */ } }
}
process.on('exit', encerrar);

async function subirEditor() {
  const vite = spawn(process.execPath, [resolve(RAIZ, 'ferramentas/provas/vite-quieto.mjs'), '--port', String(PORTA_EDITOR)], {
    cwd: RAIZ, stdio: 'ignore',
  });
  filhos.push(vite);
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(URL_EDITOR)).ok) return; } catch { /* ainda subindo */ }
    await esperar(250);
  }
  throw new Error(`o editor não subiu em ${URL_EDITOR}`);
}

async function subirChrome(perfil) {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1440,900', `--remote-debugging-port=${PORTA_CHROME}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', 'about:blank',
  ], { stdio: 'ignore' });
  filhos.push(chrome);
  for (let i = 0; i < 60; i++) {
    try {
      const pagina = (await (await fetch(`http://127.0.0.1:${PORTA_CHROME}/json/list`)).json()).find((t) => t.type === 'page');
      if (pagina !== undefined) return pagina;
    } catch { /* ainda subindo */ }
    await esperar(250);
  }
  throw new Error('o Chrome headless não abriu');
}

let ws;
let proximo = 0;
const pendentes = new Map();
const consoleDaPagina = [];

function cmd(method, params = {}) {
  const id = ++proximo;
  return new Promise((ok) => { pendentes.set(id, ok); ws.send(JSON.stringify({ id, method, params })); });
}

/** Avalia na página, sem rede nenhuma. É o que o `abrirEditor` usa. */
async function avaCru(expressao) {
  const r = await cmd('Runtime.evaluate', { expression: expressao, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) {
    const e = r.result.exceptionDetails;
    throw new Error(e.exception?.description ?? e.text ?? 'erro na página');
  }
  return r.result?.result?.value;
}

/**
 * O tamanho da janela agora, para quem precisar reabrir o editor do zero.
 * O `abrirEditor` o escreve; o `ava` o lê.
 */
const janela = { largura: 1440, altura: 900 };

/**
 * Avalia na página, e se a página tiver ido embora no meio, reabre e repete.
 *
 * O Vite recarrega a página sozinho quando alguém salva um arquivo do projeto
 * — e com mais de um chat escrevendo, isso acontece no meio da prova. O sinal
 * é sempre o mesmo: "__m is not defined", os ajudantes foram junto com a
 * página. Uma rede que cai quando o time está trabalhando não é rede.
 *
 * O recarregamento fica ESCRITO no relatório: a prova se recupera, não
 * disfarça.
 */
async function ava(expressao) {
  for (let tentativa = 0; ; tentativa++) {
    try {
      return await avaCru(expressao);
    } catch (erro) {
      const perdeu = String(erro instanceof Error ? erro.message : erro).includes('__m is not defined');
      if (!perdeu || tentativa >= 2) throw erro;
      consoleDaPagina.push('a página se recarregou no meio da medição; o editor foi reaberto');
      await abrirEditor(janela.largura, janela.altura);
    }
  }
}

async function abrirEditor(largura, altura) {
  janela.largura = largura;
  janela.altura = altura;
  await cmd('Emulation.setDeviceMetricsOverride', { width: largura, height: altura, deviceScaleFactor: 1, mobile: false });
  // O ESTADO GUARDADO SAI ANTES — defeito 3 do cabeçalho. A divisão das
  // colunas mora no `localStorage`, que sobrevive a um recarregamento dentro
  // da mesma rodada: a página voltava com a divisão de antes e a medição
  // seguinte media outra tela, sem ninguém perceber. A prova tem de medir
  // sempre a MESMA tela — a de quem abre o programa pela primeira vez.
  try {
    await avaCru('localStorage.clear(); true');
  } catch { /* primeira volta: ainda não há página */ }
  await cmd('Page.navigate', { url: URL_EDITOR });
  let montou = false;
  for (let i = 0; i < 80 && !montou; i++) {
    await esperar(250);
    try { montou = await avaCru(`!!document.querySelector('canvas.viewport-canvas')`); } catch { /* carregando */ }
  }
  if (!montou) throw new Error('o editor não montou');
  await esperar(600);
  await avaCru(AJUDANTES);
  await avaCru('__m.carregar()');
  // De novo depois de montar: o editor grava a divisão ao abrir, e o que
  // interessa é que a PRÓXIMA volta (se houver recarregamento) também nasça
  // limpa. Uma linha barata que fecha o buraco pelos dois lados.
  await avaCru('localStorage.removeItem("RECORTE_divisao_das_colunas"); true');
  // O herói, e a malha dele escolhida: é o estado da foto do Humberto.
  await avaCru(`__m.acoes.runAction('abrir-exemplo')`);
  for (let i = 0; i < 40; i++) {
    if (await avaCru('(__m.vp.doc.file.slots ?? []).length > 0')) break;
    await esperar(150);
  }
  await avaCru(SELECIONAR);
  // A10: o painel tem de estar CHEIO quando for medido. Além da malha
  // escolhida (o `SELECIONAR`), abre-se uma animação — sem ela, Animações
  // mostra a lista e mais nada, e a Prévia não tem o que tocar.
  await avaCru(PREENCHER);
  // A pasta abre lendo arquivo: espera a grade de imagens aparecer.
  for (let i = 0; i < 40; i++) {
    if (await avaCru("!/Nenhuma pasta aberta/.test(document.body.textContent ?? '')")) break;
    await esperar(200);
  }
  await avaCru(MEXER);
  // Abrir a pasta pode ter trocado o documento: o herói volta se sumiu.
  if (!(await avaCru('(__m.vp.doc.file.slots ?? []).length > 0'))) {
    // Alguma coisa levou o herói embora: ele volta, e a prova segue medindo o
    // que dá, dizendo no fim o que ficou sem medir.
    await avaCru("__m.acoes.runAction('abrir-exemplo')");
    for (let i = 0; i < 40; i++) {
      if (await avaCru('(__m.vp.doc.file.slots ?? []).length > 0')) break;
      await esperar(150);
    }
    await avaCru(SELECIONAR);
    await avaCru(MEXER);
  }
  await esperar(400);
}

/**
 * Enche o que dá antes de medir — A10, degrau 11, lote 8.
 *
 * Uma animação aberta, a pilha de peles com as duas do herói, e o histórico
 * com passos de verdade. O que não se consegue encher aqui aparece no
 * relatório como VAZIO, e não como um verde que não prova nada.
 */
const PREENCHER = `(async () => {
  const doc = __m.vp.doc;
  // Uma animação aberta: sem ela a Prévia não tem o que tocar e o Histórico
  // não tem passo nenhum.
  const anim = (doc.file.animations ?? [])[0];
  if (anim) doc.animation = anim.name;
  // As peles todas na pilha, para a aba Peles ter as duas listas cheias.
  const peles = (doc.file.skins ?? []).map((s) => s.name);
  if (peles.length > 0) {
    doc.pilha = peles;
    doc.visibleSkins = peles;
  }
  // A PASTA: é ela que enche a aba Imagens e a aba Pivôs. **Trocar a pasta de
  // origem** (degrau 8) adota a pasta SEM trocar o documento — "Abrir pasta…"
  // abriria um projeto novo e levaria o herói junto, e aí Árvore, Ordem e
  // Animações é que ficariam vazias. Uma prova não pode esvaziar um painel
  // para encher outro.
  await __m.montarPasta();
  const trocar = document.querySelector('.imagens-trocar-pasta');
  if (trocar) trocar.click();
  return true;
})()`;

/** O histórico com passos de verdade: três mexidas que se desfazem. */
const MEXER = `(() => {
  const doc = __m.vp.doc;
  const osso = (doc.file.bones ?? [])[1];
  if (!osso) return false;
  for (const dx of [3, -2, 5]) {
    doc.run({
      label: 'Mover osso',
      kind: 'transform',
      apply: (d) => { const b = (d.file.bones ?? [])[1]; if (b) b.x = (b.x ?? 0) + dx; },
      revert: (d) => { const b = (d.file.bones ?? [])[1]; if (b) b.x = (b.x ?? 0) - dx; },
    });
  }
  return true;
})()`;

/**
 * A malha `face` escolhida — o estado da foto do Humberto.
 *
 * Sai daqui, e não de dentro do `abrirEditor`, porque a seleção precisa ser
 * REAFIRMADA antes de cada aba: um recarregamento do Vite no meio da prova a
 * leva junto, e a aba Malha e pesos passava a ser medida VAZIA, com a frase
 * "Escolha um desenho na árvore ou na tela" no lugar do painel inteiro. Uma
 * medição de painel vazio não prova nada, e o pior é que ela sai verde.
 *
 */
const SELECIONAR = `__m.vp.doc.select({ ...__m.contrato.emptySelection(), `
  + `slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] })`;

/**
 * Só a regra `look_driver`, sem desenho nenhum — para medir Propriedades no
 * caso ALTO, e não no caso bonito.
 *
 * **Por que existe, e o erro que quase entrou no lugar.** O degrau 12 pôs quatro
 * fichas novas em Propriedades, e **três delas só aparecem com uma regra, um
 * parâmetro ou uma variável escolhidos** — são três seleções diferentes, não
 * duas. (A quarta, a da definição do evento, aparece sempre que o arquivo tem
 * evento, sem depender de seleção: essa a prova já media.) A prova rodava com a
 * malha `face` escolhida, via a ficha da imagem, e dava um número: o do MELHOR
 * caso. Otimista é a palavra bonita para errado.
 *
 * A primeira tentativa de consertar foi acrescentar `constraints` à seleção de
 * cima, junto com a malha. **Não funcionou, e o número saiu idêntico** (290 px
 * e 412 px, os mesmos de antes): com um desenho escolhido, o painel mostra a
 * ficha do desenho, e a da regra não aparece. Se aquilo tivesse ficado, a prova
 * seguiria medindo o melhor caso **com um comentário dizendo que media o pior**
 * — que é o defeito de sempre, agora com selo de qualidade. Por isso a segunda
 * medição é separada, com seleção própria, e sai no relatório com nome próprio.
 *
 * `look_driver` é o teto das três, e a conta é esta: grupo Regra, mais "Comando
 * por parâmetro" (2 campos), mais Alvo 1 (`head`/rotação: 3 campos fixos + 3
 * chaves = 6 linhas) e Alvo 2 (`smile`/peso: 3 fixos + 2 chaves = 5 linhas). A
 * ficha do parâmetro tem ~11 campos em três grupos; a da variável tem três
 * campos e é a menor. O caminho e esta conta foram escritos pelo chat
 * `EXECUTANDO · as portas do formato`, que fez as fichas e **não podia mexer na
 * prova** — ele apontou o buraco e a saída, sabendo que outro é que ia executar.
 *
 * **O QUE ESTA MEDIDA AINDA NÃO COBRE, para ninguém supor que agora cobre
 * tudo:** a ficha da definição do evento nasce FECHADA, e a prova não a abre.
 * Aberta, ela acrescenta duas linhas de texto, o caminho do som, o botão de
 * tocar e cinco campos. Ela foi fechada de propósito por causa da altura — mas
 * isso quer dizer que este número é o do painel com ela fechada, e quem
 * trabalha com som passa o dia com ela aberta.
 */
const SO_A_REGRA = `__m.vp.doc.select({ ...__m.contrato.emptySelection(), `
  + `constraints: ['look_driver'] })`;

/**
 * **O emissor escolhido** — a 3ª passada, rodada 16 (05/10/2026).
 *
 * A ficha do emissor pedia 2.736 px num painel de 343 (`CHANGELOG`, medido à
 * mão em 1440×900), e esta prova **nunca a mediu**: o herói não tem emissor, e
 * as duas seleções de cima são a malha e a regra. Aqui o emissor nasce do
 * modelo **fogo** (o mais cheio: curvas de tamanho e de cor) se o arquivo não
 * tiver um, e é escolhido. Devolve `null` se não houver como — e aí a passada
 * diz FALTOU, nunca "cabe" (regra 21: em setembro a prova mediu o painel vazio
 * e disse que cabia).
 */
const O_EMISSOR = `(() => {
  const achar = () => {
    for (const sk of (__m.vp.doc.file.skins ?? [])) {
      for (const [slot, porNome] of Object.entries(sk.attachments ?? {})) {
        for (const [nome, a] of Object.entries(porNome ?? {})) {
          if (a && a.type === 'BONE_particle') return { slot, nome };
        }
      }
    }
    return null;
  };
  let e = achar();
  if (e === null) { __m.acoes.runAction('particulas-fogo'); e = achar(); }
  if (e === null) return null;
  __m.vp.doc.select({ ...__m.contrato.emptySelection(), slots: [e.slot], attachments: [{ slot: e.slot, attachment: e.nome }] });
  return e;
})()`;

/**
 * **O estado da tela em que a ficha do emissor se mede** — segunda conferência
 * da rodada 16 (05/10/2026): em 1280×720, com uma animação aberta e a linha do
 * tempo aberta, a aba Lugar cortava o campo Osso, e esta passada não pegou,
 * porque só media a base. Agora mede os dois: `base` e `animação` (o idle
 * aberto, a agulha em 0,5 s, os Detalhes da linha do tempo abertos).
 */
const MODOS_DO_EMISSOR = ['base', 'animação'];
const PREPARAR_MODO = (modo) => (modo === 'base'
  ? `(() => { const d = __m.vp.doc; if (d.animation !== null) { d.animation = null; d.repose(); } return true; })()`
  : `(() => { const d = __m.vp.doc; if (d.animation !== 'idle') { d.animation = 'idle'; d.time = 0.5; d.repose(); } `
    + `const b = [...document.querySelectorAll('button')].find((e) => /Detalhes/.test(e.textContent ?? '')); `
    + `if (b && /▴/.test(b.textContent)) b.click(); return d.animation === 'idle'; })()`);

/** As abas da ficha do emissor que a tela mostra agora. Vazio = a ficha velha, sem abas. */
const ABAS_DO_EMISSOR = `[...document.querySelectorAll('.prop-abas-barra .prop-aba')].map((b) => ({ id: b.dataset.aba, nome: b.title }))`;

// ---------------------------------------------------------------------------
// Rodar
// ---------------------------------------------------------------------------

const perfil = mkdtempSync(join(tmpdir(), 'recorte-paineis-'));
let codigo = 0;
try {
  await subirEditor();
  const pagina = await subirChrome(perfil);
  ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((ok, erro) => { ws.onopen = ok; ws.onerror = erro; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id !== undefined && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      consoleDaPagina.push(`exceção: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`);
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleDaPagina.push(`erro: ${m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ')}`);
    }
    if (m.method === 'Page.javascriptDialogOpening') void cmd('Page.handleJavaScriptDialog', { accept: true });
  };
  await cmd('Runtime.enable');
  await cmd('Page.enable');
  if (FOTOS !== null) mkdirSync(FOTOS, { recursive: true });

  let medicoes = 0;
  let ruins = 0;
  let altas = 0;
  const vazios = [];
  for (const [largura, altura] of (SO_EMISSOR ? [] : TAMANHOS)) {
    await abrirEditor(largura, altura);
    const abas = await ava('__m.abas()');
    console.log(`\n${largura}x${altura} — ${abas.length} abas`);
    for (const aba of abas) {
      // A página pode recarregar no meio da prova, e aí os ajudantes e o herói
      // vão embora com ela — a medição morria com "__m is not defined". A
      // causa mais comum não é defeito do editor: é o Vite, que recarrega a
      // página sozinho quando alguém salva um arquivo do projeto enquanto a
      // prova roda. Com vários chats escrevendo ao mesmo tempo isso acontece.
      //
      // A prova não pode cair por isso, nem fingir que não houve: ela reabre o
      // editor, repete a aba, e escreve no relatório que aconteceu.
      let r = null;
      for (let tentativa = 0; tentativa < 3 && r === null; tentativa++) {
        if (tentativa > 0 || await ava('typeof window.__m !== "undefined" ? false : true')) {
          if (tentativa > 0) consoleDaPagina.push(`a página se recarregou na aba "${aba}"; o editor foi reaberto`);
          await abrirEditor(largura, altura);
        }
        try {
          // A seleção de novo, antes de cada aba: ver `SELECIONAR`.
          await ava(SELECIONAR);
          await ava(`[...document.querySelectorAll('.panel-column .panel-tab')].find((t) => t.textContent.trim() === ${JSON.stringify(aba)})?.click()`);
          await esperar(250);
          r = await ava(`__m.medir(${JSON.stringify(aba)})`);
        } catch {
          r = null;
        }
      }
      if (r === null) r = { nome: aba, erro: 'a página caiu três vezes seguidas nesta aba' };
      medicoes += 1;
      if (r.erro) {
        ruins += 1; altas += 1; console.log(`  FALTOU  ${aba}: ${r.erro}`);
        await guardarQueda(`${largura}x${altura} ${aba}`, String(r.erro));
        continue;
      }
      // A10: painel vazio NÃO conta como medido. Ele entra na lista dos que
      // não foram provados, e o número honesto cai — que é o ponto.
      const porque = await ava(`__m.vazio(${JSON.stringify(aba)})`);
      if (porque !== '') {
        vazios.push(`${aba} (${largura}x${altura}): ${porque}`);
        ruins += 1;
        altas += 1;
        console.log(`  VAZIO   ${aba}: ${porque} — não medido`);
        continue;
      }
      if (r.fora.length === 0 && r.alto.length === 0) console.log(`  cabe    ${aba}`);
      else {
        if (r.fora.length > 0) {
          ruins += 1;
          console.log(`  PASSA   ${aba}: ${r.fora.length} coisa(s) de lado`);
          for (const linha of r.fora.slice(0, 6)) console.log(`            ${linha}`);
        }
        if (r.alto.length > 0) {
          altas += 1;
          console.log(`  ROLA    ${aba}: ${r.alto.length} coisa(s) de altura`);
          for (const linha of r.alto.slice(0, 6)) console.log(`            ${linha}`);
        }
      }
      if (DETALHE !== null && aba === DETALHE) {
        const d = await ava(`__m.detalhar(${JSON.stringify(aba)})`);
        if (d !== null) {
          console.log(`          detalhe: cabe ${d.cabe} px, conteúdo ${d.conteudo} px`);
          for (const linha of d.linhas) console.log(`            ${linha}`);
        }
      }
      if (FOTOS !== null) {
        const foto = await cmd('Page.captureScreenshot', { format: 'png' });
        const nome = `${largura}x${altura}-${aba.normalize('NFD').replace(/[^\w]+/g, '-').replace(/-+$/, '')}.png`;
        writeFileSync(join(FOTOS, nome), Buffer.from(foto.result.data, 'base64'));
      }
    }

    // Propriedades UMA SEGUNDA VEZ, com a regra `look_driver` e nenhum desenho:
    // é o caso alto do painel, e a seleção de cima não o alcança. Ver
    // `SO_A_REGRA`. Conta como medição própria — se este número for ruim, o
    // total cai, e é para cair: a medição existe para dizer o que não cabe.
    {
      let rr = null;
      for (let tentativa = 0; tentativa < 3 && rr === null; tentativa++) {
        if (tentativa > 0 || await ava('typeof window.__m !== "undefined" ? false : true')) {
          if (tentativa > 0) consoleDaPagina.push('a página se recarregou na aba "Propriedades (regra)"; o editor foi reaberto');
          await abrirEditor(largura, altura);
        }
        try {
          await ava(SO_A_REGRA);
          await ava(`[...document.querySelectorAll('.panel-column .panel-tab')].find((t) => t.textContent.trim() === 'Propriedades')?.click()`);
          await esperar(250);
          rr = await ava('__m.medir("Propriedades")');
        } catch {
          rr = null;
        }
      }
      medicoes += 1;
      if (rr === null || rr.erro) {
        ruins += 1;
        altas += 1;
        console.log(`  FALTOU  Propriedades (regra Comando): ${rr?.erro ?? 'a página caiu três vezes seguidas'}`);
      } else {
        const porqueR = await ava('__m.vazio("Propriedades")');
        if (porqueR !== '') {
          vazios.push(`Propriedades (regra Comando) (${largura}x${altura}): ${porqueR}`);
          ruins += 1;
          altas += 1;
          console.log(`  VAZIO   Propriedades (regra Comando): ${porqueR} — não medido`);
        } else if (rr.fora.length === 0 && rr.alto.length === 0) {
          console.log('  cabe    Propriedades (regra Comando)');
        } else {
          if (rr.fora.length > 0) {
            ruins += 1;
            console.log(`  PASSA   Propriedades (regra Comando): ${rr.fora.length} coisa(s) de lado`);
            for (const linha of rr.fora.slice(0, 6)) console.log(`            ${linha}`);
          }
          if (rr.alto.length > 0) {
            altas += 1;
            console.log(`  ROLA    Propriedades (regra Comando): ${rr.alto.length} coisa(s) de altura`);
            for (const linha of rr.alto.slice(0, 6)) console.log(`            ${linha}`);
          }
        }
      }
    }
  }

  // A 3ª passada: a ficha do emissor, ABA POR ABA, com o número que cada aba
  // pede contra o que o painel tem — rodada 16. Sem abas (a ficha velha), mede
  // a ficha inteira uma vez: é assim que se vê o número grande antes do novo.
  for (const [largura, altura] of TAMANHOS_EMISSOR) for (const modo of MODOS_DO_EMISSOR) {
    await abrirEditor(largura, altura);
    console.log(`\n${largura}x${altura} — a ficha do emissor, ${modo}`);
    let abas = null;
    for (let tentativa = 0; tentativa < 3 && abas === null; tentativa++) {
      if (tentativa > 0) await abrirEditor(largura, altura);
      try {
        const e = await ava(O_EMISSOR);
        if (e === null) break;
        await ava(PREPARAR_MODO(modo));
        await ava(`[...document.querySelectorAll('.panel-column .panel-tab')].find((t) => t.textContent.trim() === 'Propriedades')?.click()`);
        await esperar(250);
        abas = await ava(ABAS_DO_EMISSOR);
      } catch {
        abas = null;
      }
    }
    if (abas === null) {
      medicoes += 1; ruins += 1; altas += 1;
      console.log('  FALTOU  Propriedades (emissor): não houve emissor para escolher');
      continue;
    }
    const passos = abas.length === 0 ? [{ id: null, nome: 'a ficha inteira, sem abas' }] : abas;
    for (const passo of passos) {
      const rotulo = `Propriedades (emissor, ${modo}, ${passo.nome})`;
      let r = null;
      let d = null;
      for (let tentativa = 0; tentativa < 3 && r === null; tentativa++) {
        if (tentativa > 0 || await ava('typeof window.__m !== "undefined" ? false : true')) {
          if (tentativa > 0) consoleDaPagina.push(`a página se recarregou em "${rotulo}"; o editor foi reaberto`);
          await abrirEditor(largura, altura);
        }
        try {
          // A seleção de novo, antes de cada aba, como nas outras passadas.
          if (await ava(O_EMISSOR) === null) { r = { nome: rotulo, erro: 'não houve emissor para escolher' }; break; }
          if (await ava(PREPARAR_MODO(modo)) !== true && modo === 'animação') { r = { nome: rotulo, erro: 'a animação idle não abriu' }; break; }
          await ava(`[...document.querySelectorAll('.panel-column .panel-tab')].find((t) => t.textContent.trim() === 'Propriedades')?.click()`);
          await esperar(150);
          if (passo.id !== null) {
            await ava(`document.querySelector('.prop-abas-barra .prop-aba[data-aba=${JSON.stringify(passo.id)}]')?.click()`);
            await esperar(150);
            // A aba pedida tem de ser a aberta: senão mediríamos outra.
            const aberta = await ava(`document.querySelector('.prop-aba-corpo')?.dataset.aba ?? ''`);
            if (aberta !== passo.id) { r = { nome: rotulo, erro: `a aba "${passo.nome}" não abriu (aberta: "${aberta}")` }; break; }
          }
          r = await ava('__m.medir("Propriedades")');
          d = await ava('__m.detalhar("Propriedades")');
        } catch {
          r = null;
        }
      }
      medicoes += 1;
      if (r === null || r.erro) {
        ruins += 1; altas += 1;
        console.log(`  FALTOU  ${rotulo}: ${r?.erro ?? 'a página caiu três vezes seguidas'}`);
        continue;
      }
      const porque = await ava('__m.vazio("Propriedades")');
      if (porque !== '') {
        vazios.push(`${rotulo} (${largura}x${altura}): ${porque}`);
        ruins += 1; altas += 1;
        console.log(`  VAZIO   ${rotulo}: ${porque} — não medido`);
        continue;
      }
      const numero = d === null ? '' : ` — pede ${d.conteudo} px, o painel tem ${d.cabe} px`;
      if (r.fora.length === 0 && r.alto.length === 0) console.log(`  cabe    ${rotulo}${numero}`);
      if (r.fora.length > 0) {
        ruins += 1;
        console.log(`  PASSA   ${rotulo}: ${r.fora.length} coisa(s) de lado${numero}`);
        for (const linha of r.fora.slice(0, 6)) console.log(`            ${linha}`);
      }
      if (r.alto.length > 0) {
        altas += 1;
        console.log(`  ROLA    ${rotulo}: ${r.alto.length} coisa(s) de altura${numero}`);
        for (const linha of r.alto.slice(0, 6)) console.log(`            ${linha}`);
      }
      if (FOTOS !== null) {
        const foto = await cmd('Page.captureScreenshot', { format: 'png' });
        const nome = `${largura}x${altura}-emissor-${modo === 'base' ? 'base' : 'animacao'}-${(passo.id ?? 'ficha-inteira')}.png`;
        writeFileSync(join(FOTOS, nome), Buffer.from(foto.result.data, 'base64'));
      }
    }
  }

  console.log(`\n${medicoes - ruins} de ${medicoes} medições sem nada passando da coluna.`);
  if (vazios.length > 0) {
    console.log(`\n${vazios.length} medição(ões) NÃO FEITAS, porque o painel estava vazio:`);
    for (const linha of vazios) console.log(`  ${linha}`);
    console.log('  Um painel que mostra uma frase no lugar do conteúdo cabe sempre: medir isso é o falso verde.');
  }
  console.log(`${medicoes - altas} de ${medicoes} medições cabem na altura, sem barra de rolagem.`);
  console.log(consoleDaPagina.length === 0 ? 'Console limpo.' : `Console:\n  ${consoleDaPagina.slice(0, 10).join('\n  ')}`);
  if (ruins > 0 || altas > 0) codigo = 1;
} catch (erro) {
  console.error(`A medição não rodou: ${erro instanceof Error ? erro.message : String(erro)}`);
  await guardarQueda('a medicao nao rodou', erro instanceof Error ? (erro.stack ?? erro.message) : String(erro));
  codigo = 2;
} finally {
  try { ws?.close(); } catch { /* fechado */ }
  encerrar();
  await esperar(300);
  try { rmSync(perfil, { recursive: true, force: true }); } catch { /* o Chrome ainda segura algum arquivo */ }
}
process.exit(codigo);
