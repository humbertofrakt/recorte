// SPDX-License-Identifier: Apache-2.0
/**
 * The web validator page.
 *
 * Everything runs in the visitor's browser. The file never leaves the machine:
 * there is no `fetch` to any server here, no upload, no beacon. The only
 * network calls this module can make are for the example button, and those go
 * to files sitting next to this page.
 *
 * The verdict comes from `nucleo.js` (the same checks the command line runs)
 * plus `esquema-compilado.js` (the same Ajv, compiled ahead of time). The
 * drawing comes from the real runtime in `ferramentas/visualizador/dist`, so
 * what the page shows is what a player would show.
 */

import * as nucleo from './nucleo.js'
import { validateSkeleton, validateAtlas, validateManifest } from './esquema-compilado.js'
import { registroDeExtensoes, extensoesRegistradas } from './extensoes-compiladas.js'

import { loadAtlas, loadSkeletonData, parseBoneText } from '../../ferramentas/visualizador/dist/loader.js'
import { readBoneb } from '../../ferramentas/visualizador/dist/binario/ler.js'
import { readBonezAsync } from '../../ferramentas/visualizador/dist/binario/bonez.js'
import { Skeleton } from '../../ferramentas/visualizador/dist/skeleton.js'
import { pose } from '../../ferramentas/visualizador/dist/animation.js'
import { CanvasRenderer } from '../../ferramentas/visualizador/dist/render/canvas.js'
// Register the real constraint types (imported for the side effect).
import '../../ferramentas/visualizador/dist/constraints/ik.js'
import '../../ferramentas/visualizador/dist/constraints/transform.js'
import '../../ferramentas/visualizador/dist/constraints/physics.js'
import '../../ferramentas/visualizador/dist/constraints/path.js'
import '../../ferramentas/visualizador/dist/constraints/driver.js'

const VALIDADORES = {
  esqueleto: validateSkeleton,
  atlas: validateAtlas,
  manifesto: validateManifest,
}

/** How many problems the table shows before it stops. */
const LIMITE_DE_LINHAS = 200

const decodificador = new TextDecoder('utf-8')

// ---------------------------------------------------------------------------
// The bits of the page
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id)

const area = $('area')
const resultado = $('resultado')
const placar = $('placar')
const placarTitulo = $('placarTitulo')
const placarDetalhe = $('placarDetalhe')
const ficha = $('ficha')
const contas = $('contas')
const recursos = $('recursos')
const tituloRecursos = $('tituloRecursos')
const listaProblemas = $('listaProblemas')
const tabelaProblemas = $('tabelaProblemas')
const semProblemas = $('semProblemas')
const cortados = $('cortados')
const tela = $('tela')
const ctx = tela.getContext('2d')
const recadoDesenho = $('recadoDesenho')
const listaAnimacoes = $('animacoes')
const relogio = $('relogio')

const cena = {
  esqueleto: null,
  renderizador: null,
  animacao: null,
  tempo: 0,
  relogio: 0,
  tocando: true,
  escalaBase: 1,
  centro: { x: 0, y: 0 },
}

// ---------------------------------------------------------------------------
// Reading the dropped files
// ---------------------------------------------------------------------------

/** One dropped file, already in memory. */
async function lerArquivo(file) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  return { nome: file.name, tamanho: bytes.length, bytes }
}

/**
 * Sorts what was dropped: the main document, the atlases beside it and the
 * images. Dropping the skeleton, the atlas and the PNG together is what makes
 * the drawing come out complete.
 */
function separar(arquivos) {
  const imagens = []
  const atlases = []
  let principal = null
  for (const a of arquivos) {
    if (nucleo.ehImagem(a.nome, a.bytes)) { imagens.push(a); continue }
    const { tipo, embalagem } = nucleo.detectarTipo(a.nome, a.bytes)
    if (tipo === 'atlas') { atlases.push(a); continue }
    if (principal === null) principal = { ...a, tipo, embalagem }
  }
  // Only an atlas was dropped: then the atlas is the subject.
  if (principal === null && atlases.length > 0) {
    const primeiro = atlases.shift()
    principal = { ...primeiro, tipo: 'atlas', embalagem: 'bone' }
    atlases.unshift(primeiro)
  }
  return { principal, atlases, imagens }
}

// ---------------------------------------------------------------------------
// The verdict
// ---------------------------------------------------------------------------

/**
 * Validates one document already decoded into a plain tree, and stamps every
 * problem with the file it came from and the line it sits on.
 */
function conferirTrecho(doc, tipo, arquivo, linhas) {
  const r = nucleo.validarDocumento(doc, tipo, VALIDADORES, { extensoes: registroDeExtensoes, extensoesRegistradas })
  for (const p of r.problemas) {
    p.arquivo = arquivo
    p.linha = linhas ? linhaMaisProxima(linhas, p.ponteiro) : null
  }
  return r
}

/** Line of the pointer, or of the closest parent that has one. */
function linhaMaisProxima(linhas, ponteiro) {
  let caminho = ponteiro
  for (;;) {
    const linha = linhas.get(caminho)
    if (linha !== undefined) return linha
    if (caminho === '') return null
    caminho = caminho.slice(0, caminho.lastIndexOf('/'))
  }
}

/**
 * The whole job for one dropped set: decode, validate, summarize, draw.
 *
 * A `.bonez` is a package, so it gets three verdicts in one: the manifest, the
 * main skeleton and every atlas inside. They are shown as one list, each
 * problem labelled with the entry it came from.
 */
async function conferir(arquivos) {
  const { principal, atlases, imagens } = separar(arquivos)
  if (principal === null) {
    mostrarFalha('Nenhum arquivo do Recorte', 'Solte um arquivo .bone, .boneb, .bonez ou .atlas.json.')
    return null
  }

  const problemas = []
  let resumo = null
  let valido = true
  const linhasDeInfo = []

  if (principal.embalagem === 'bonez') {
    let pacote
    try {
      pacote = await readBonezAsync(principal.bytes)
    } catch (erro) {
      mostrarFalha('Pacote ilegível', `Não deu para abrir o .bonez: ${mensagem(erro)}`)
      return null
    }
    for (const aviso of pacote.warnings ?? []) {
      problemas.push({ gravidade: 'aviso', texto: aviso, ponteiro: '', regra: '2.9', arquivo: principal.nome, linha: null })
    }
    // The manifest, read from the entry itself so the text is the real one.
    const bytesManifesto = pacote.read('manifest.json')
    if (bytesManifesto !== undefined) {
      const texto = decodificador.decode(bytesManifesto)
      const r = comTexto(texto, 'manifesto', 'manifest.json')
      problemas.push(...r.problemas)
      valido = valido && r.valido
    }
    // The main skeleton.
    const bytesMain = pacote.read(pacote.mainName)
    if (bytesMain === undefined) {
      problemas.push({ gravidade: 'erro', texto: `O pacote não traz "${pacote.mainName}", que o manifesto aponta como principal.`, ponteiro: '/main', regra: '2.9', arquivo: 'manifest.json', linha: null })
      valido = false
    } else {
      const r = comBytes(bytesMain, 'esqueleto', pacote.mainName)
      problemas.push(...r.problemas)
      valido = valido && r.valido
      resumo = r.resumo
    }
    // Every atlas the manifest lists.
    for (const nome of pacote.manifest.atlases ?? []) {
      const bytesAtlas = pacote.read(nome)
      if (bytesAtlas === undefined) {
        problemas.push({ gravidade: 'aviso', texto: `O pacote lista a folha de imagens "${nome}" e não traz o arquivo.`, ponteiro: '/atlases', regra: '2.9', arquivo: 'manifest.json', linha: null })
        continue
      }
      const r = comTexto(decodificador.decode(bytesAtlas), 'atlas', nome)
      problemas.push(...r.problemas)
      valido = valido && r.valido
    }
    linhasDeInfo.push(['Entradas no pacote', String(pacote.entries.length)])
    linhasDeInfo.push(['Arquivo principal', pacote.mainName])
  } else if (principal.embalagem === 'boneb') {
    let arvore
    try {
      arvore = readBoneb(principal.bytes)
    } catch (erro) {
      mostrarFalha('Binário ilegível', `Não deu para ler o .boneb: ${mensagem(erro)}`)
      return null
    }
    const r = conferirTrecho(arvore, 'esqueleto', principal.nome, null)
    problemas.push(...r.problemas)
    valido = r.valido
    resumo = nucleo.resumirConteudo(arvore, 'esqueleto')
  } else {
    const texto = decodificador.decode(principal.bytes)
    let doc
    try {
      doc = JSON.parse(texto)
    } catch (erro) {
      // The browser's own JSON message is in English and points at a byte
      // offset. The reader gets a sentence and a line instead.
      mostrarFalha('Arquivo ilegível',
        `Este arquivo não é JSON válido${linhaDoErroJson(erro, texto)}. Confira vírgula, aspas e chaves.`)
      console.warn('Recorte:', mensagem(erro))
      return null
    }
    const tipo = nucleo.detectarTipo(principal.nome, principal.bytes, doc).tipo
    const r = conferirTrecho(doc, tipo, principal.nome, nucleo.mapaDeLinhas(texto))
    problemas.push(...r.problemas)
    valido = r.valido
    resumo = nucleo.resumirConteudo(doc, tipo)
    principal.tipo = tipo
  }

  const total = { valido, problemas }
  mostrarPlacar(total, principal)
  mostrarResumo(resumo, principal, linhasDeInfo)
  mostrarProblemas(problemas)
  resultado.hidden = false
  await desenharArquivo(principal, atlases, imagens)
  return total

  function comTexto(texto, tipo, nome) {
    let doc
    try {
      doc = JSON.parse(texto)
    } catch (erro) {
      return {
        valido: false,
        problemas: [{ gravidade: 'erro', texto: `Não é JSON válido${linhaDoErroJson(erro, texto)}. Confira vírgula, aspas e chaves.`, ponteiro: '', regra: '2.1', arquivo: nome, linha: null }],
        resumo: null,
      }
    }
    const r = conferirTrecho(doc, tipo, nome, nucleo.mapaDeLinhas(texto))
    return { valido: r.valido, problemas: r.problemas, resumo: nucleo.resumirConteudo(doc, tipo) }
  }

  function comBytes(bytes, tipo, nome) {
    if (bytes[0] === 0x89 && bytes[1] === 0x42) {
      const arvore = readBoneb(bytes)
      const r = conferirTrecho(arvore, tipo, nome, null)
      return { valido: r.valido, problemas: r.problemas, resumo: nucleo.resumirConteudo(arvore, tipo) }
    }
    return comTexto(decodificador.decode(bytes), tipo, nome)
  }
}

function mensagem(erro) {
  return erro instanceof Error ? erro.message : String(erro)
}

/** `" na linha 12"`, when the browser said where the JSON went bad. */
function linhaDoErroJson(erro, texto) {
  const achado = /position (\d+)/.exec(mensagem(erro))
  if (achado === null) return ''
  const corte = Number(achado[1])
  if (!Number.isFinite(corte) || corte < 0 || corte > texto.length) return ''
  const linha = texto.slice(0, corte).split('\n').length
  return ` (o problema começa na linha ${linha})`
}

// ---------------------------------------------------------------------------
// Painting the verdict
// ---------------------------------------------------------------------------

function mostrarFalha(titulo, detalhe) {
  resultado.hidden = false
  placar.className = 'placar invalido'
  placarTitulo.textContent = titulo
  placarDetalhe.textContent = detalhe
  ficha.replaceChildren()
  contas.replaceChildren()
  recursos.replaceChildren()
  tituloRecursos.hidden = true
  listaProblemas.replaceChildren()
  tabelaProblemas.hidden = true
  semProblemas.hidden = true
  cortados.hidden = true
  pararDesenho('Sem desenho: o arquivo não pôde ser lido.')
}

function mostrarPlacar(total, principal) {
  const erros = total.problemas.filter(p => p.gravidade === 'erro').length
  const avisos = total.problemas.filter(p => p.gravidade === 'aviso').length
  placar.className = `placar ${total.valido ? 'valido' : 'invalido'}`
  placarTitulo.textContent = total.valido ? 'Arquivo válido' : 'Arquivo inválido'
  const partes = []
  partes.push(erros === 0 ? 'Nenhum erro' : `${erros} ${erros === 1 ? 'erro' : 'erros'}`)
  partes.push(avisos === 0 ? 'nenhum aviso' : `${avisos} ${avisos === 1 ? 'aviso' : 'avisos'}`)
  placarDetalhe.textContent = `${principal.nome} — ${partes.join(', ')}.`
}

function linhaFicha(rotulo, valor) {
  const tr = document.createElement('tr')
  const th = document.createElement('th')
  th.scope = 'row'
  th.textContent = rotulo
  const td = document.createElement('td')
  td.textContent = valor
  tr.append(th, td)
  return tr
}

function mostrarResumo(resumo, principal, extras) {
  ficha.replaceChildren()
  ficha.append(linhaFicha('Arquivo', principal.nome))
  ficha.append(linhaFicha('Tipo', nucleo.NOME_DO_TIPO[principal.tipo] ?? principal.tipo))
  // Only a skeleton is ever a `.bone`; an atlas and a manifest are plain JSON.
  const embalagem = principal.embalagem === 'bone' && principal.tipo !== 'esqueleto'
    ? 'Texto JSON'
    : nucleo.NOME_DA_EMBALAGEM[principal.embalagem]
  ficha.append(linhaFicha('Embalagem', embalagem))
  ficha.append(linhaFicha('Tamanho', `${(principal.tamanho / 1024).toFixed(1)} kB`))
  for (const [rotulo, valor] of extras) ficha.append(linhaFicha(rotulo, valor))

  contas.replaceChildren()
  recursos.replaceChildren()
  tituloRecursos.hidden = true
  if (resumo === null) return

  if (resumo.tipo === 'esqueleto') {
    ficha.append(linhaFicha('Nome do personagem', resumo.nome))
    ficha.append(linhaFicha('Versão do formato', resumo.versao))
    ficha.append(linhaFicha('Leitor mínimo', resumo.versaoMinima))
    ficha.append(linhaFicha('Gravado por', resumo.programa))
    if (resumo.atlases.length > 0) ficha.append(linhaFicha('Folha de imagens (atlas)', resumo.atlases.join(', ')))
    if (resumo.animacoesDeFora.length > 0) ficha.append(linhaFicha('Animações de fora', `vêm de ${resumo.animacoesDeFora.join(', ')}`))
    if (resumo.extensoes.length > 0) ficha.append(linhaFicha('Extensões', resumo.extensoes.join(', ')))
  } else if (resumo.tipo === 'atlas') {
    ficha.append(linhaFicha('Páginas', resumo.nome))
    ficha.append(linhaFicha('Imagens', resumo.imagens.join(', ')))
  } else {
    ficha.append(linhaFicha('Arquivo principal', resumo.nome))
  }

  for (const [rotulo, valor] of resumo.contas) {
    const caixa = document.createElement('div')
    caixa.className = 'conta'
    const b = document.createElement('b')
    b.textContent = String(valor)
    const s = document.createElement('span')
    s.textContent = rotulo
    caixa.append(b, s)
    contas.append(caixa)
  }

  const nomes = resumo.recursos.map(r => nucleo.NOME_DO_RECURSO[r] ?? r)
  if (nomes.length > 0) {
    tituloRecursos.hidden = false
    for (const nome of nomes) {
      const li = document.createElement('li')
      li.textContent = nome
      recursos.append(li)
    }
  }
}

function mostrarProblemas(problemas) {
  listaProblemas.replaceChildren()
  const ordem = { erro: 0, aviso: 1 }
  const lista = [...problemas].sort((a, b) => (ordem[a.gravidade] - ordem[b.gravidade]) ||
    ((a.linha ?? 1e9) - (b.linha ?? 1e9)))
  if (lista.length === 0) {
    tabelaProblemas.hidden = true
    semProblemas.hidden = false
    cortados.hidden = true
    return
  }
  semProblemas.hidden = true
  tabelaProblemas.hidden = false
  for (const p of lista.slice(0, LIMITE_DE_LINHAS)) {
    const tr = document.createElement('tr')

    const tdGrav = document.createElement('td')
    const marca = document.createElement('span')
    marca.className = `grav ${p.gravidade}`
    marca.textContent = p.gravidade === 'erro' ? 'Erro' : 'Aviso'
    tdGrav.append(marca)

    const tdLinha = document.createElement('td')
    tdLinha.className = 'linha'
    tdLinha.textContent = p.linha === null || p.linha === undefined ? '—' : String(p.linha)

    const tdTexto = document.createElement('td')
    tdTexto.textContent = p.texto

    const tdOnde = document.createElement('td')
    tdOnde.className = 'onde'
    const codigo = document.createElement('code')
    codigo.textContent = p.ponteiro === '' ? '(o arquivo inteiro)' : p.ponteiro
    if (p.arquivo !== undefined && p.arquivo !== null) {
      const dentro = document.createElement('div')
      dentro.textContent = p.arquivo
      tdOnde.append(dentro)
    }
    tdOnde.append(codigo)

    const tdRegra = document.createElement('td')
    tdRegra.className = 'regra'
    tdRegra.textContent = `§ ${p.regra}`

    tr.append(tdGrav, tdLinha, tdTexto, tdOnde, tdRegra)
    listaProblemas.append(tr)
  }
  const sobra = lista.length - LIMITE_DE_LINHAS
  cortados.hidden = sobra <= 0
  if (sobra > 0) cortados.textContent = `A lista mostra os ${LIMITE_DE_LINHAS} primeiros. Faltam mais ${sobra}.`
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function pararDesenho(recado) {
  cena.esqueleto = null
  cena.renderizador = null
  cena.animacao = null
  listaAnimacoes.replaceChildren()
  recadoDesenho.textContent = recado
  recadoDesenho.classList.add('ruim')
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, tela.width, tela.height)
}

async function imagemDeBytes(bytes) {
  const blob = new Blob([bytes])
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob)
  const url = URL.createObjectURL(blob)
  try {
    return await new Promise((ok, erro) => {
      const img = new Image()
      img.onload = () => ok(img)
      img.onerror = () => erro(new Error('imagem ilegível'))
      img.src = url
    })
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }
}

function nomeCurto(caminho) {
  const texto = String(caminho ?? '')
  return texto.slice(texto.lastIndexOf('/') + 1).toLowerCase()
}

/**
 * Builds the skeleton and starts the loop. Missing images are not a failure:
 * the bones are drawn anyway, which is already enough to see the rig.
 */
async function desenharArquivo(principal, atlasesSoltos, imagensSoltas) {
  recadoDesenho.classList.remove('ruim')
  const avisos = []
  try {
    const atlases = []
    const porImagem = new Map()
    for (const img of imagensSoltas) porImagem.set(nomeCurto(img.nome), img.bytes)

    for (const a of atlasesSoltos) {
      try {
        atlases.push(loadAtlas(parseBoneText(decodificador.decode(a.bytes))))
      } catch (erro) {
        avisos.push(`Atlas "${a.nome}" não pôde ser lido: ${mensagem(erro)}`)
      }
    }

    let dados = null
    if (principal.embalagem === 'bonez') {
      const pacote = await readBonezAsync(principal.bytes)
      for (const nome of pacote.names()) {
        if (/\.(png|jpg|jpeg|webp)$/i.test(nome)) {
          const bytes = pacote.read(nome)
          if (bytes !== undefined) porImagem.set(nomeCurto(nome), bytes)
        }
      }
      for (const nome of pacote.manifest.atlases ?? []) {
        const bytes = pacote.read(nome)
        if (bytes === undefined) continue
        try { atlases.push(loadAtlas(parseBoneText(decodificador.decode(bytes)))) } catch { /* já avisado */ }
      }
      const bytesMain = pacote.read(pacote.mainName)
      if (bytesMain === undefined) { pararDesenho('O pacote não traz o boneco principal.'); return }
      const arvore = bytesMain[0] === 0x89 && bytesMain[1] === 0x42
        ? readBoneb(bytesMain)
        : parseBoneText(decodificador.decode(bytesMain))
      dados = loadSkeletonData(arvore, { atlases })
    } else if (principal.embalagem === 'boneb') {
      dados = loadSkeletonData(readBoneb(principal.bytes), { atlases })
    } else if (principal.tipo === 'esqueleto') {
      dados = loadSkeletonData(parseBoneText(decodificador.decode(principal.bytes)), { atlases })
    } else {
      pararDesenho('Este arquivo não é um boneco, então não há nada para desenhar. Solte o .bone junto com ele.')
      return
    }

    const imagens = new Map()
    for (const atlas of atlases) {
      for (const pagina of atlas.pages) {
        const bytes = porImagem.get(nomeCurto(pagina.image)) ?? porImagem.get(nomeCurto(pagina.name))
        if (bytes === undefined) continue
        try { imagens.set(pagina.name, await imagemDeBytes(bytes)) } catch { /* segue sem ela */ }
      }
    }

    const esqueleto = new Skeleton(dados)
    const renderizador = new CanvasRenderer(ctx, {
      images: imagens,
      debug: { bones: $('verOssos').checked },
      onWarning: () => { /* já contado abaixo */ },
    })
    cena.esqueleto = esqueleto
    cena.renderizador = renderizador
    cena.tempo = 0
    cena.relogio = 0
    enquadrar()
    montarAnimacoes(dados.animations)
    escolherAnimacao(dados.animations[0] ?? null)

    if (imagens.size === 0) {
      avisos.push(atlases.length === 0
        ? 'Sem a folha de imagens: aparecem só os ossos. Solte o .atlas.json e o .png junto para ver o desenho.'
        : 'Sem as imagens da folha: aparecem só os ossos. Solte o .png junto.')
    }
    for (const falta of dados.missingImages.slice(0, 3)) avisos.push(`A imagem "${falta}" não está na folha de imagens.`)
    recadoDesenho.textContent = avisos.length > 0
      ? avisos.join(' ')
      : `${dados.bones.length} ossos, ${dados.slots.length} desenhos, ${dados.animations.length} animações.`
  } catch (erro) {
    // The loader speaks English and speaks to programmers. The page does not
    // repeat it: the reason is already spelled out in the list of problems.
    pararDesenho('Sem desenho: o leitor não conseguiu montar o boneco. Veja a lista de problemas.')
    console.warn('Recorte:', mensagem(erro))
  }
}

function montarAnimacoes(animacoes) {
  listaAnimacoes.replaceChildren()
  if (animacoes.length === 0) {
    const vazio = document.createElement('p')
    vazio.textContent = 'Este arquivo não tem animação.'
    listaAnimacoes.append(vazio)
    return
  }
  for (const animacao of animacoes) {
    const botao = document.createElement('button')
    botao.type = 'button'
    botao.setAttribute('aria-pressed', 'false')
    botao.dataset.nome = animacao.name
    const titulo = document.createElement('span')
    titulo.textContent = animacao.name
    const detalhe = document.createElement('small')
    detalhe.textContent = `${animacao.duration.toFixed(2)} s · ${animacao.loop ? 'em laço' : 'uma vez'}`
    botao.append(titulo, detalhe)
    botao.addEventListener('click', () => { escolherAnimacao(animacao); cena.tocando = true })
    listaAnimacoes.append(botao)
  }
}

function escolherAnimacao(animacao) {
  cena.animacao = animacao
  cena.tempo = 0
  for (const botao of listaAnimacoes.querySelectorAll('button')) {
    botao.setAttribute('aria-pressed', String(animacao !== null && botao.dataset.nome === animacao.name))
  }
}

function enquadrar() {
  if (cena.esqueleto === null) return
  const limites = cena.esqueleto.getBounds()
  const largura = limites.width > 0 ? limites.width : 100
  const altura = limites.height > 0 ? limites.height : 100
  const caixa = tela.getBoundingClientRect()
  const l = caixa.width > 0 ? caixa.width : 600
  const a = caixa.height > 0 ? caixa.height : 380
  cena.escalaBase = Math.min(l / (largura * 1.3), a / (altura * 1.12))
  cena.centro = { x: limites.x + largura / 2, y: limites.y + altura / 2 }
}

function ajustarTamanho() {
  const dpr = window.devicePixelRatio || 1
  const caixa = tela.getBoundingClientRect()
  const largura = Math.max(1, Math.round(caixa.width * dpr))
  const altura = Math.max(1, Math.round(caixa.height * dpr))
  if (tela.width !== largura || tela.height !== altura) {
    tela.width = largura
    tela.height = altura
  }
}

let ultimoQuadro = 0

function quadro(agora) {
  requestAnimationFrame(quadro)
  const dt = ultimoQuadro === 0 ? 0 : Math.min((agora - ultimoQuadro) / 1000, 0.1)
  ultimoQuadro = agora
  const esqueleto = cena.esqueleto
  if (esqueleto === null) return
  ajustarTamanho()

  if (cena.tocando) {
    cena.tempo += dt
    cena.relogio += dt
  }
  const animacao = cena.animacao
  if (animacao !== null && animacao.duration > 0) {
    if (animacao.loop) cena.tempo %= animacao.duration
    else if (cena.tempo > animacao.duration) cena.tempo = animacao.duration
  }
  if (animacao !== null) pose(esqueleto, animacao, cena.tempo, cena.relogio)
  else esqueleto.updateWorldTransform(cena.relogio)

  relogio.textContent = `${cena.tempo.toFixed(2).replace('.', ',')} s`

  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, tela.width, tela.height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, tela.width, tela.height)
  const escala = cena.escalaBase * dpr
  ctx.save()
  ctx.translate(tela.width / 2, tela.height / 2)
  // The skeleton has y going up; the canvas has y going down.
  ctx.scale(escala, -escala)
  ctx.translate(-cena.centro.x, -cena.centro.y)
  cena.renderizador.draw(esqueleto)
  ctx.restore()
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

$('tocar').addEventListener('click', () => { cena.tocando = true })
$('parar').addEventListener('click', () => { cena.tocando = false })
$('reiniciar').addEventListener('click', () => { cena.tempo = 0 })
$('verOssos').addEventListener('change', (e) => {
  if (cena.renderizador !== null) cena.renderizador.debug.bones = e.target.checked
})

window.addEventListener('resize', enquadrar)

for (const evento of ['dragenter', 'dragover']) {
  area.addEventListener(evento, (e) => { e.preventDefault(); area.classList.add('ativa') })
}
for (const evento of ['dragleave', 'drop']) {
  area.addEventListener(evento, () => area.classList.remove('ativa'))
}
area.addEventListener('drop', async (e) => {
  e.preventDefault()
  const arquivos = [...(e.dataTransfer?.files ?? [])]
  if (arquivos.length === 0) return
  await conferir(await Promise.all(arquivos.map(lerArquivo)))
})

$('escolher').addEventListener('change', async (e) => {
  const arquivos = [...(e.target.files ?? [])]
  if (arquivos.length === 0) return
  await conferir(await Promise.all(arquivos.map(lerArquivo)))
})

/**
 * Loads the example that ships with the project. This is the only place in the
 * page that touches the network, and it only ever reads files sitting next to
 * this one. Nothing is ever sent.
 */
async function carregarExemplo() {
  // Resolved against the page, not against `import.meta.url`: a dev server may
  // rewrite `new URL(..., import.meta.url)` into an asset path of its own.
  const base = new URL('../../formato/exemplos/', document.baseURI)
  const nomes = ['heroi.bone', 'heroi.atlas.json', 'heroi.png']
  try {
    const arquivos = await Promise.all(nomes.map(async (nome) => {
      const alvo = new URL(nome, base)
      const resposta = await fetch(alvo)
      if (!resposta.ok) throw new Error(`${resposta.status} em ${alvo.href}`)
      return { nome, bytes: new Uint8Array(await resposta.arrayBuffer()), tamanho: 0 }
    }))
    for (const a of arquivos) a.tamanho = a.bytes.length
    await conferir(arquivos)
  } catch (erro) {
    mostrarFalha('Exemplo indisponível', `Não deu para buscar o exemplo: ${mensagem(erro)}`)
  }
}

/**
 * Loads the file next to this page that was broken on purpose. Somebody who
 * has never seen the validator can then see what a rejection looks like
 * without having to break a file of their own.
 */
async function carregarExemploComErro() {
  try {
    const alvo = new URL('./exemplo-com-erro.bone', document.baseURI)
    const resposta = await fetch(alvo)
    if (!resposta.ok) throw new Error(`${resposta.status} em ${alvo.href}`)
    const bytes = new Uint8Array(await resposta.arrayBuffer())
    await conferir([{ nome: 'exemplo-com-erro.bone', bytes, tamanho: bytes.length }])
  } catch (erro) {
    mostrarFalha('Exemplo indisponível', `Não deu para buscar o exemplo: ${mensagem(erro)}`)
  }
}

$('exemplo').addEventListener('click', carregarExemplo)
$('exemploComErro').addEventListener('click', carregarExemploComErro)

// `…/validador/?exemplo` e `?exemplo=erro` abrem já com o arquivo carregado.
// É o link para mandar para alguém que nunca viu a página.
const pedido = new URLSearchParams(window.location.search)
if (pedido.has('exemplo')) {
  if (pedido.get('exemplo') === 'erro') carregarExemploComErro()
  else carregarExemplo()
}

requestAnimationFrame(quadro)

// A door for the console and for the automated check: the page can be driven
// without ever opening the operating system's file dialog.
window.recorte = {
  cena,
  nucleo,
  /** Checks files already in memory: `[{ nome, bytes }]`. */
  conferirArquivos: (arquivos) => conferir(arquivos.map(a => ({ ...a, tamanho: a.bytes.length }))),
  /** Fetches files next to this page and checks them. */
  conferirUrls: async (urls) => {
    const arquivos = await Promise.all(urls.map(async (u) => {
      const resposta = await fetch(u)
      const bytes = new Uint8Array(await resposta.arrayBuffer())
      return { nome: u.slice(u.lastIndexOf('/') + 1), bytes, tamanho: bytes.length }
    }))
    return conferir(arquivos)
  },
}
