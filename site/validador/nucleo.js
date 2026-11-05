// SPDX-License-Identifier: Apache-2.0
/**
 * Core of the web validator — pure functions, no DOM and no Node.
 *
 * Everything the page shows is decided here: which file this is, what is wrong
 * with it, and what it contains. The page (`validador.js`) only paints.
 *
 * The semantic checks are the ones `ferramentas/validador/validar.mjs`
 * runs: since the rascunho 0.2 (17/09/2026) the command line **imports this
 * file** instead of carrying a copy, so the browser and the command line
 * cannot disagree. The schema part is the very same Ajv, compiled ahead of time by
 * `construir-esquema.mjs`; see `esquema-compilado.js`.
 *
 * `ferramentas/testes/site.test.ts` runs both against the example files and
 * fails when they drift apart.
 */

// ---------------------------------------------------------------------------
// Which file is this
// ---------------------------------------------------------------------------

/** First bytes of a `.boneb` file (spec 11.2). */
const BONEB_SIGNATURE = [0x89, 0x42, 0x4f, 0x4e, 0x45, 0x0d, 0x0a, 0x1a]
/** First bytes of any ZIP local header, so of any `.bonez` (spec 2.9). */
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]

function startsWith(bytes, signature) {
  if (bytes.length < signature.length) return false
  for (let i = 0; i < signature.length; i++) if (bytes[i] !== signature[i]) return false
  return true
}

/**
 * Which of the three encodings these bytes are, by the bytes alone — never by
 * the file name, which an upload or a download is free to change (spec 1.2).
 * Same rule as `detectEncoding` in the runtime's `file.ts`.
 */
export function detectarEmbalagem(bytes) {
  if (startsWith(bytes, ZIP_SIGNATURE)) return 'bonez'
  if (startsWith(bytes, BONEB_SIGNATURE)) return 'boneb'
  return 'bone'
}

/** Human label of an encoding, for the screen. */
export const NOME_DA_EMBALAGEM = {
  bone: 'Texto JSON (.bone)',
  boneb: 'Binário (.boneb)',
  bonez: 'Pacote ZIP (.bonez)',
}

/** Human label of a document type, for the screen. */
export const NOME_DO_TIPO = {
  esqueleto: 'Esqueleto',
  atlas: 'Atlas',
  manifesto: 'Manifesto do pacote',
}

/**
 * Which of the three documents a JSON text is. The name decides, exactly as on
 * the command line (`tipoPeloNome`); when there is no useful name, the content
 * decides.
 */
export function tipoPeloNome(nome) {
  const limpo = String(nome ?? '').toLowerCase()
  const base = limpo.slice(limpo.lastIndexOf('/') + 1)
  if (base.endsWith('.atlas.json')) return 'atlas'
  if (base === 'manifest.json' || base === 'manifesto.json') return 'manifesto'
  return 'esqueleto'
}

/** Last resort when the name says nothing: look at the top-level keys. */
export function tipoPeloConteudo(doc) {
  if (doc === null || typeof doc !== 'object' || Array.isArray(doc)) return 'esqueleto'
  if (typeof doc.main === 'string' && doc.bonez !== undefined) return 'manifesto'
  if (Array.isArray(doc.pages) && Array.isArray(doc.regions)) return 'atlas'
  if (Array.isArray(doc.bones) || doc.bone !== undefined) return 'esqueleto'
  if (typeof doc.main === 'string') return 'manifesto'
  return 'esqueleto'
}

/**
 * Full identification of a dropped file: encoding from the bytes, document
 * type from the name and, when the name is silent, from the content.
 *
 * `doc` is optional: pass the parsed JSON when there is one.
 */
export function detectarTipo(nome, bytes, doc) {
  const embalagem = detectarEmbalagem(bytes ?? new Uint8Array(0))
  if (embalagem === 'bonez') return { embalagem, tipo: 'esqueleto' }
  if (embalagem === 'boneb') return { embalagem, tipo: 'esqueleto' }
  const limpo = String(nome ?? '').toLowerCase()
  const base = limpo.slice(limpo.lastIndexOf('/') + 1)
  const nomeFala = base.endsWith('.atlas.json') || base === 'manifest.json' ||
    base === 'manifesto.json' || base.endsWith('.bone')
  const tipo = nomeFala || doc === undefined ? tipoPeloNome(base) : tipoPeloConteudo(doc)
  return { embalagem, tipo }
}

/** True when this file is an image the page should keep for drawing. */
export function ehImagem(nome, bytes) {
  const limpo = String(nome ?? '').toLowerCase()
  if (/\.(png|jpg|jpeg|webp|gif|bmp)$/.test(limpo)) return true
  const b = bytes ?? new Uint8Array(0)
  return startsWith(b, [0x89, 0x50, 0x4e, 0x47]) || startsWith(b, [0xff, 0xd8, 0xff])
}

// ---------------------------------------------------------------------------
// JSON Pointer -> line of the text
// ---------------------------------------------------------------------------

/**
 * Line of the file where each JSON Pointer starts, 1-based.
 *
 * A tiny scanner over the raw text — not a second parser. It only needs to
 * know where strings end and where each value begins, which is enough to hand
 * the reader a line number to click on. Bad JSON returns what it managed to
 * read before the trouble.
 */
export function mapaDeLinhas(texto) {
  const linhas = new Map()
  const n = texto.length
  let i = 0
  let linha = 1

  const pular = () => {
    while (i < n) {
      const c = texto[i]
      if (c === '\n') { linha++; i++ }
      else if (c === ' ' || c === '\t' || c === '\r') i++
      else break
    }
  }

  const lerTexto = () => {
    // Assumes texto[i] === '"'.
    let fora = ''
    i++
    while (i < n) {
      const c = texto[i]
      if (c === '\\') {
        const seguinte = texto[i + 1]
        if (seguinte === 'u') {
          fora += String.fromCharCode(parseInt(texto.slice(i + 2, i + 6), 16) || 0)
          i += 6
        } else {
          const mapa = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '"': '"', '\\': '\\', '/': '/' }
          fora += mapa[seguinte] ?? seguinte ?? ''
          i += 2
        }
        continue
      }
      if (c === '"') { i++; return fora }
      if (c === '\n') linha++
      fora += c
      i++
    }
    return fora
  }

  const lerValor = (ponteiro, profundidade) => {
    pular()
    if (i >= n || profundidade > 200) return
    if (!linhas.has(ponteiro)) linhas.set(ponteiro, linha)
    const c = texto[i]
    if (c === '{') {
      i++
      for (;;) {
        pular()
        if (i >= n) return
        if (texto[i] === '}') { i++; return }
        if (texto[i] === ',') { i++; continue }
        if (texto[i] !== '"') { i++; continue }
        const chave = lerTexto()
        pular()
        if (texto[i] === ':') i++
        lerValor(`${ponteiro}/${escaparPonteiro(chave)}`, profundidade + 1)
      }
    }
    if (c === '[') {
      i++
      let indice = 0
      for (;;) {
        pular()
        if (i >= n) return
        if (texto[i] === ']') { i++; return }
        if (texto[i] === ',') { i++; continue }
        lerValor(`${ponteiro}/${indice}`, profundidade + 1)
        indice++
      }
    }
    if (c === '"') { lerTexto(); return }
    // number, true, false, null
    while (i < n && !',]}\n \t\r'.includes(texto[i])) i++
  }

  try { lerValor('', 0) } catch { /* bad JSON: keep what we have */ }
  return linhas
}

/** Escapes one JSON Pointer segment (RFC 6901). */
export function escaparPonteiro(segmento) {
  return String(segmento).replace(/~/g, '~0').replace(/\//g, '~1')
}

/** Reads one JSON Pointer segment back to its plain name. */
export function desescaparPonteiro(segmento) {
  return String(segmento).replace(/~1/g, '/').replace(/~0/g, '~')
}

// ---------------------------------------------------------------------------
// Semantic checks — the same the command line runs
// ---------------------------------------------------------------------------

/** Names of a list of `{ name }` objects. */
function nomesDe(lista) {
  const fora = new Set()
  for (const x of Array.isArray(lista) ? lista : []) if (x && typeof x.name === 'string') fora.add(x.name)
  return fora
}

/** The `uri`s the `body` keys of one animation cite (spec 9.13). */
function corposCitadosPor(animacao) {
  const uris = []
  for (const tl of Array.isArray(animacao?.timelines) ? animacao.timelines : []) {
    if (!tl || tl.type !== 'body') continue
    for (const k of Array.isArray(tl.keys) ? tl.keys : []) {
      if (k && typeof k.value === 'string' && !uris.includes(k.value)) uris.push(k.value)
    }
  }
  return uris
}

/**
 * Every `uri` a skeleton file points at through `body` keys, raw (relative to
 * `assets.skeletonsBase`). The caller resolves and loads them; `checarSemantica`
 * receives them back in `contexto.corpos` (spec 9.13, 4.7).
 */
export function corposCitados(doc) {
  const fora = []
  for (const a of Array.isArray(doc?.animations) ? doc.animations : []) {
    for (const uri of corposCitadosPor(a)) if (!fora.includes(uri)) fora.push(uri)
  }
  return fora
}

/**
 * Finds the attachment a `deform` / `weights` timeline points at, with the
 * search order of spec 9.6: the timeline's skin, then `default`, then any skin
 * with the same slot and placeholder.
 */
function anexoDaTimeline(doc, tl) {
  const skins = Array.isArray(doc.skins) ? doc.skins : []
  const procurar = (nome) => {
    for (const pele of skins) {
      if (!pele || (nome !== null && pele.name !== nome)) continue
      const porSlot = pele.attachments && pele.attachments[tl.target]
      if (porSlot && Object.prototype.hasOwnProperty.call(porSlot, tl.attachment)) return porSlot[tl.attachment]
    }
    return undefined
  }
  const a = procurar(typeof tl.skin === 'string' ? tl.skin : 'default')
  if (a !== undefined) return a
  const b = procurar('default')
  if (b !== undefined) return b
  return procurar(null)
}

/**
 * Skeleton rules a JSON Schema cannot express: levels L1 (`erro`) and L2
 * (`aviso`), each with the code of spec 12.3.
 *
 * `contexto.corpos` is an optional `Map<uri, doc | null>` with the files the
 * `body` keys cite (spec 9.13), already loaded by whoever has a disk or a ZIP:
 * a name that is not in this file but is in a cited body is **not** L1 (4.7).
 * `null` means "cited, could not be loaded". Without the map, every cited body
 * counts as not loaded, and the unknown names of that animation come out as
 * `aviso` `BODY_UNMET` instead of `erro`, because nobody can tell.
 *
 * The other exception is the `rig` (4.8): inside a file with a `rig`, a name
 * of `rig.bones` / `rig.slots` counts as existing. That is what lets a skin
 * file hang a `skinRequired` bone on a bone of the host.
 *
 * The command line imports this very function, so the page and the terminal
 * can never disagree.
 */
export function checarSemantica(doc, contexto = {}) {
  const problemas = []
  const erro = (codigo, ponteiro, regra, texto) => problemas.push({ gravidade: 'erro', codigo, ponteiro, regra, texto })
  const aviso = (codigo, ponteiro, regra, texto) => problemas.push({ gravidade: 'aviso', codigo, ponteiro, regra, texto })
  const corpos = contexto.corpos instanceof Map ? contexto.corpos : null

  const skels = Array.isArray(doc.skeletons) ? doc.skeletons : (doc.skeleton ? [doc.skeleton] : [])
  const bones = Array.isArray(doc.bones) ? doc.bones : (skels[0] && skels[0].bones) || []
  const slots = Array.isArray(doc.slots) ? doc.slots : []
  const skins = Array.isArray(doc.skins) ? doc.skins : []
  const rig = doc.rig && typeof doc.rig === 'object' ? doc.rig : null
  const rigBones = new Set(Array.isArray(rig?.bones) ? rig.bones : [])
  const rigSlots = new Set(Array.isArray(rig?.slots) ? rig.slots : [])
  const nomesOsso = nomesDe(bones)
  const nomesSlot = nomesDe(slots)
  const nomesEvento = nomesDe(doc.events)
  const temOsso = (n) => nomesOsso.has(n) || rigBones.has(n)
  const temSlot = (n) => nomesSlot.has(n) || rigSlots.has(n)

  // -- bones: unique, one root, parent exists (or comes from the rig), no cycle
  if (Array.isArray(bones) && bones.length) {
    const nomes = new Map()
    bones.forEach((b, i) => {
      if (!b || typeof b.name !== 'string') return
      if (nomes.has(b.name)) {
        erro('REF_NAME_DUPLICATE', `/bones/${i}/name`, '4.2',
          `O osso "${b.name}" aparece duas vezes (nas posições ${nomes.get(b.name)} e ${i}). Cada osso precisa de um nome só dele.`)
      }
      nomes.set(b.name, i)
    })
    const raizes = bones.filter(b => b && (b.parent === undefined || b.parent === null))
    if (raizes.length !== 1) {
      erro('ORDER_BONE_PARENT', '/bones', '4.2',
        `O esqueleto precisa de exatamente 1 osso raiz (osso sem pai). Este tem ${raizes.length}.`)
    }
    bones.forEach((b, i) => {
      if (!b || b.parent == null || nomes.has(b.parent)) return
      if (rigBones.has(b.parent)) return // 4.8: o pai vem do hospedeiro, e o rig o declara
      erro('REF_BONE_MISSING', `/bones/${i}/parent`, '4.2',
        `O osso "${b.name}" diz que o pai dele é "${b.parent}", e esse osso não existe no arquivo${rig ? ' nem no rig' : ''}.`)
    })
    const visitando = new Set()
    const ok = new Set()
    const temCiclo = nome => {
      if (ok.has(nome)) return false
      if (visitando.has(nome)) return true
      visitando.add(nome)
      const b = bones[nomes.get(nome)]
      const r = b && b.parent != null && nomes.has(b.parent) ? temCiclo(b.parent) : false
      visitando.delete(nome)
      ok.add(nome)
      return r
    }
    for (const nome of nomes.keys()) {
      if (temCiclo(nome)) {
        erro('ORDER_BONE_PARENT', `/bones/${nomes.get(nome)}`, '4.2',
          `Os pais dos ossos fazem uma volta fechada, passando pelo osso "${nome}". A árvore de ossos não pode voltar para trás.`)
        break
      }
    }
  }

  // -- slots: unique, bone exists (or comes from the rig)
  const vistosSlot = new Map()
  slots.forEach((sl, i) => {
    if (!sl || typeof sl.name !== 'string') return
    if (vistosSlot.has(sl.name)) {
      erro('REF_NAME_DUPLICATE', `/slots/${i}/name`, '4.3',
        `O slot "${sl.name}" aparece duas vezes (nas posições ${vistosSlot.get(sl.name)} e ${i}).`)
    }
    vistosSlot.set(sl.name, i)
    if (typeof sl.bone === 'string' && !temOsso(sl.bone)) {
      erro('REF_BONE_MISSING', `/slots/${i}/bone`, '4.3',
        `O slot "${sl.name}" está preso ao osso "${sl.bone}", e esse osso não existe no arquivo${rig ? ' nem no rig' : ''}.`)
    }
  })

  // -- skins: slots cited exist (7.1); skin.bones exist and are skinRequired (7.1)
  skins.forEach((pele, i) => {
    if (!pele || typeof pele !== 'object') return
    const mapa = pele.attachments && typeof pele.attachments === 'object' ? pele.attachments : {}
    for (const nomeSlot of Object.keys(mapa)) {
      if (temSlot(nomeSlot)) continue
      erro('REF_SLOT_MISSING', `/skins/${i}/attachments/${escaparPonteiro(nomeSlot)}`, '7.1',
        `A pele "${pele.name}" dá desenho ao slot "${nomeSlot}", e esse slot não existe no arquivo${rig ? ' nem no rig' : ''}.`)
    }
    const ossosDaPele = Array.isArray(pele.bones) ? pele.bones : []
    ossosDaPele.forEach((nome, j) => {
      if (!temOsso(nome)) {
        erro('REF_BONE_MISSING', `/skins/${i}/bones/${j}`, '4.4',
          `A pele "${pele.name}" lista o osso "${nome}", e esse osso não existe no arquivo${rig ? ' nem no rig' : ''}.`)
        return
      }
      const osso = bones.find(b => b && b.name === nome)
      if (osso && osso.skinRequired !== true) {
        aviso('HINT_SKIN_BONE', `/skins/${i}/bones/${j}`, '7.1',
          `A pele "${pele.name}" lista o osso "${nome}", que não tem skinRequired. Um osso comum não pertence a pele nenhuma.`)
      }
    })
    // 0.1 leftovers: the socket left the format (Apêndice A, 62)
    for (const [nomeSlot, porSlot] of Object.entries(mapa)) {
      if (!porSlot || typeof porSlot !== 'object') continue
      for (const [ph, anexo] of Object.entries(porSlot)) {
        if (!anexo || typeof anexo !== 'object') continue
        const base = `/skins/${i}/attachments/${escaparPonteiro(nomeSlot)}/${escaparPonteiro(ph)}`
        if (anexo.type === 'point' && anexo.socket !== undefined) {
          aviso('HINT_UNKNOWN_PROPERTY', `${base}/socket`, '7.9',
            `O ponto "${ph}" traz "socket", um campo do rascunho 0.1 que saiu do formato. É ignorado: a entidade segue a imagem (7.11).`)
        }
        if (anexo.type === 'skeleton') {
          for (const campo of ['socket', 'childSocket']) {
            if (anexo[campo] !== undefined) {
              aviso('HINT_UNKNOWN_PROPERTY', `${base}/${campo}`, '7.11',
                `O esqueleto aninhado "${ph}" traz "${campo}", um campo do rascunho 0.1 que saiu do formato. É ignorado: a raiz do filho cai em x, y do próprio anexo.`)
            }
          }
        }
      }
    }
  })
  if (rig && rig.sockets !== undefined) {
    aviso('HINT_UNKNOWN_PROPERTY', '/rig/sockets', '4.8',
      'O rig traz "sockets", um campo do rascunho 0.1 que saiu do formato. É ignorado.')
  }

  // -- a skin file (2.8): it has a rig that names things it does NOT have (the
  //    host's), skins with attachments, and no animations. Every bone but the
  //    root must then be skinRequired. A rig file that documents its own names
  //    (rigs/humanoide-v1.bone) is not a skin file: its rig names only itself.
  const rigFalaDoHospedeiro = [...rigBones].some(n => !nomesOsso.has(n)) || [...rigSlots].some(n => !nomesSlot.has(n))
  const temDesenhoEmPele = skins.some(p => p && p.attachments && Object.keys(p.attachments).length > 0)
  const arquivoDePele = rig !== null && rigFalaDoHospedeiro && temDesenhoEmPele && !(Array.isArray(doc.animations) && doc.animations.length > 0)
  if (arquivoDePele) {
    bones.forEach((b, i) => {
      if (i === 0 || !b || b.skinRequired === true) return
      aviso('EXTERNAL_BONE_NOT_SKIN', `/bones/${i}`, '2.8',
        `O osso "${b.name}" não tem skinRequired. Num arquivo de pele de fora, um osso comum é ignorado pelo hospedeiro: só o osso de pele entra.`)
    })
    ;(Array.isArray(doc.constraints) ? doc.constraints : []).forEach((c, i) => {
      if (!c || c.skinRequired === true) return
      aviso('EXTERNAL_BONE_NOT_SKIN', `/constraints/${i}`, '2.8',
        `A regra "${c.name}" não tem skinRequired. Num arquivo de pele de fora, uma regra comum é ignorada pelo hospedeiro.`)
    })
  }

  // -- animations and timelines (4.7, 9.1, 9.5, 9.6, 9.13)
  const animacoes = Array.isArray(doc.animations) ? doc.animations : []
  const avisouCorpo = new Set()
  animacoes.forEach((anim, ai) => {
    if (!anim || typeof anim !== 'object') return
    const base = `/animations/${ai}`
    const timelines = Array.isArray(anim.timelines) ? anim.timelines : []

    // which names the bodies cited by THIS animation bring (9.13)
    const citados = corposCitadosPor(anim)
    const ossosDeFora = new Set()
    const slotsDeFora = new Set()
    let algumSemArquivo = false
    for (const uri of citados) {
      const corpo = corpos ? corpos.get(uri) : undefined
      if (!corpo) {
        algumSemArquivo = true
        if (!avisouCorpo.has(uri)) {
          avisouCorpo.add(uri)
          aviso('BODY_MISSING', base, '9.13',
            corpos
              ? `A animação "${anim.name}" vira para o corpo "${uri}", que não foi encontrado. Os nomes que só existem nele não puderam ser conferidos.`
              : `A animação "${anim.name}" vira para o corpo "${uri}". Ele não foi aberto junto, então os nomes que só existem nele não foram conferidos.`)
        }
        continue
      }
      for (const n of nomesDe(corpo.bones)) ossosDeFora.add(n)
      for (const n of nomesDe(corpo.slots)) slotsDeFora.add(n)
    }
    const ossoOk = (n) => temOsso(n) || ossosDeFora.has(n)
    const slotOk = (n) => temSlot(n) || slotsDeFora.has(n)
    // a name that is nowhere: L1 — unless a cited body could not be read, and then nobody can tell (L2)
    const faltaOsso = (ponteiro, texto) => algumSemArquivo
      ? aviso('BODY_UNMET', ponteiro, '9.13', `${texto} Pode existir num corpo citado por body que não foi aberto.`)
      : erro('REF_BONE_MISSING', ponteiro, '4.7', texto)
    const faltaSlot = (ponteiro, texto) => algumSemArquivo
      ? aviso('BODY_UNMET', ponteiro, '9.13', `${texto} Pode existir num corpo citado por body que não foi aberto.`)
      : erro('REF_SLOT_MISSING', ponteiro, '4.7', texto)
    const naoNoArquivo = (n) => `"${n}" não existe neste arquivo${rig ? ' nem no rig' : ''}${citados.length && !algumSemArquivo ? ' nem nos corpos citados por body' : ''}.`

    const vistas = new Map()
    let linhasBody = 0
    timelines.forEach((tl, ti) => {
      if (!tl || typeof tl !== 'object') return
      const p = `${base}/timelines/${ti}`
      const keys = Array.isArray(tl.keys) ? tl.keys : []
      const chave = [tl.type, tl.target ?? '', tl.property ?? '', tl.skin ?? 'default', tl.attachment ?? ''].join('|')
      if (tl.type !== 'event' && vistas.has(chave)) {
        erro('ORDER_TIMELINE_DUPLICATE', p, '9.1',
          `A animação "${anim.name}" tem duas linhas para o mesmo alvo (${tl.type} ${tl.target ?? ''} ${tl.property ?? ''}); a outra é a de posição ${vistas.get(chave)}.`)
      }
      vistas.set(chave, ti)

      switch (tl.type) {
        case 'bone':
          if (typeof tl.target === 'string' && !ossoOk(tl.target)) {
            faltaOsso(`${p}/target`, `A linha de osso aponta para ${naoNoArquivo(tl.target)}`)
          }
          if (tl.property === 'parent') {
            keys.forEach((k, ki) => {
              if (k && typeof k.value === 'string' && !ossoOk(k.value)) {
                faltaOsso(`${p}/keys/${ki}/value`, `A chave de pai manda "${tl.target}" para o osso ${naoNoArquivo(k.value)}`)
              }
            })
          }
          break
        case 'slot':
          if (typeof tl.target === 'string' && !slotOk(tl.target)) {
            faltaSlot(`${p}/target`, `A linha de slot aponta para ${naoNoArquivo(tl.target)}`)
          }
          if (tl.property === 'bone') {
            keys.forEach((k, ki) => {
              if (k && typeof k.value === 'string' && !ossoOk(k.value)) {
                faltaOsso(`${p}/keys/${ki}/value`, `A chave de troca de osso manda o slot "${tl.target}" para o osso ${naoNoArquivo(k.value)}`)
              }
            })
          }
          break
        case 'deform':
        case 'weights':
        case 'sequence':
          if (typeof tl.target === 'string' && !slotOk(tl.target)) {
            faltaSlot(`${p}/target`, `A linha de ${tl.type} aponta para o slot ${naoNoArquivo(tl.target)}`)
          }
          if (tl.type === 'weights' && typeof tl.target === 'string' && typeof tl.attachment === 'string') {
            const anexo = anexoDaTimeline(doc, tl)
            if (anexo === undefined) break // pode morar noutra pele de fora; não se afirma nada
            const binding = anexo && typeof anexo === 'object' ? anexo.binding : undefined
            if (!binding || !Array.isArray(binding.weights)) {
              erro('ORDER_TIMELINE_TARGET', p, '9.6',
                `A linha de pesos aponta para "${tl.target}/${tl.attachment}", que não tem binding. Só um anexo com pesos anima pesos.`)
              break
            }
            const counts = Array.isArray(binding.counts) ? binding.counts : []
            keys.forEach((k, ki) => {
              if (!k || !Array.isArray(k.value)) return
              if (k.value.length !== binding.weights.length) {
                erro('RANGE_WEIGHTS_SIZE', `${p}/keys/${ki}/value`, '9.6',
                  `A chave de pesos tem ${k.value.length} números; o binding de "${tl.target}/${tl.attachment}" tem ${binding.weights.length}. Só os pesos animam, todos, na ordem do binding.`)
                return
              }
              let j = 0
              for (let v = 0; v < counts.length; v++) {
                let soma = 0
                for (let c = 0; c < counts[v]; c++) soma += Number(k.value[j++]) || 0
                if (Math.abs(soma - 1) > 1e-4) {
                  erro('RANGE_WEIGHT_SUM', `${p}/keys/${ki}/value`, '9.6',
                    `Na chave de pesos, o vértice ${v} soma ${soma.toFixed(4)}, e a soma tem de ser 1 (7.4). O leitor não renormaliza.`)
                  break
                }
              }
            })
          }
          break
        case 'drawOrder':
          keys.forEach((k, ki) => {
            if (!k || !Array.isArray(k.value)) return
            k.value.forEach((e, ei) => {
              if (e && typeof e.slot === 'string' && !slotOk(e.slot)) {
                faltaSlot(`${p}/keys/${ki}/value/${ei}/slot`, `A ordem de desenho cita o slot ${naoNoArquivo(e.slot)}`)
              }
            })
          })
          break
        case 'event':
          keys.forEach((k, ki) => {
            if (k && typeof k.event === 'string' && !nomesEvento.has(k.event)) {
              erro('REF_EVENT_MISSING', `${p}/keys/${ki}/event`, '9.7',
                `A chave de evento dispara "${k.event}", e esse evento não está em events.`)
            }
          })
          break
        case 'body':
          linhasBody++
          if (linhasBody === 2) {
            erro('ORDER_TIMELINE_DUPLICATE', p, '9.13',
              `A animação "${anim.name}" tem duas linhas body. Uma animação vira de corpo por uma linha só.`)
          }
          keys.forEach((k, ki) => {
            if (k && k.time === 0 && typeof k.value === 'string') {
              aviso('BODY_AT_START', `${p}/keys/${ki}`, '9.13',
                `A animação "${anim.name}" já começa em outro corpo ("${k.value}"). Esta animação é de outro corpo: guarde-a lá.`)
            }
          })
          break
        default:
          break
      }
    })
  })

  for (const p of checarExtensoes(doc, contexto.extensoes)) problemas.push(p)
  for (const p of checarUsoDeExtensoes(doc, contexto.extensoes, contexto.extensoesRegistradas)) problemas.push(p)
  for (const p of checarParticulas(doc)) problemas.push(p)
  for (const p of checarRig(doc, contexto)) problemas.push(p)

  return problemas
}

// ---------------------------------------------------------------------------
// rig (spec 4.8 and 2.8)
// ---------------------------------------------------------------------------

/**
 * Every uri `assets.animations` and `assets.skins` cite, raw (relative to
 * `assets.skeletonsBase`), with which list each came from.
 *
 * Irmã de `corposCitados`: aquela lê as chaves `body`, esta lê as duas listas
 * de externos da 2.8. Quem tem disco ou ZIP carrega as duas do mesmo jeito.
 */
export function externosCitados(doc) {
  const fora = []
  const juntar = (lista, tipo) => {
    for (const uri of Array.isArray(lista) ? lista : []) {
      if (typeof uri === 'string' && !fora.some(e => e.uri === uri)) fora.push({ uri, lista: tipo })
    }
  }
  juntar(doc?.assets?.animations, 'animations')
  juntar(doc?.assets?.skins, 'skins')
  return fora
}

/** Os alvos de timeline de um arquivo, separados em ossos e slots (4.8). */
function alvosDeTimeline(doc) {
  const ossos = new Set()
  const slots = new Set()
  for (const a of Array.isArray(doc?.animations) ? doc.animations : []) {
    for (const tl of Array.isArray(a?.timelines) ? a.timelines : []) {
      if (typeof tl?.target !== 'string') continue
      // A 4.8 nomeia as duas listas: `bone` de um lado; `slot`, `deform`,
      // `weights` e `sequence` do outro.
      if (tl.type === 'bone') ossos.add(tl.target)
      else if (tl.type === 'slot' || tl.type === 'deform' || tl.type === 'weights' || tl.type === 'sequence') slots.add(tl.target)
    }
  }
  return { ossos, slots }
}

/** Os slots que as peles de um arquivo preenchem (4.8). */
function slotsDasPeles(doc) {
  const fora = new Set()
  for (const pele of Array.isArray(doc?.skins) ? doc.skins : []) {
    const porSlot = pele && pele.attachments
    if (!porSlot || typeof porSlot !== 'object') continue
    for (const slot of Object.keys(porSlot)) fora.add(slot)
  }
  return fora
}

/**
 * O `rig` (spec 4.8), que o validador **DEVE** conferir "quando tem os dois em
 * mãos, e listar cada nome que falta" — e não conferia.
 *
 * Três regras, e as três estão na 4.8:
 *
 * | `RIG_REFERENCE`   | L1 | `rig.reference.length <= 0` |
 * | `RIG_UNMET`       | L2 | nome de `rig.bones`/`rig.slots` de um externo que ESTE arquivo não tem; osso de `rig.reference` que falta ou tem `length` zero |
 * | `RIG_INCOMPLETE`  | L2 | o `rig` de um externo cita **menos** do que o arquivo dele usa |
 *
 * `contexto.externos` é um `Map<uri, doc | null>` com os arquivos de
 * `assets.animations` e `assets.skins` já lidos por quem tem disco ou ZIP.
 * **Sem o mapa, nada é acusado:** não ter o arquivo em mãos não é o mesmo que
 * o nome faltar, e um aviso aí seria um palpite.
 *
 * O `RIG_INCOMPLETE` só é medido num arquivo que ESTE aqui carrega como
 * externo, e nunca num arquivo solto. O motivo está escrito na 4.8: um `rig`
 * num esqueleto comum é "permitido e inerte", documentação e nada mais —
 * acusá-lo de incompleto seria ruído em todo arquivo que traz a linha do
 * contrato. Num externo não há dúvida: os `bones` locais dele são **ignorados**
 * na importação (2.8), então todo alvo de timeline `bone` que o `rig` não lista
 * é um nome que o hospedeiro precisa ter e ninguém declarou.
 */
export function checarRig(doc, contexto = {}) {
  const problemas = []
  const erro = (codigo, ponteiro, regra, texto) => problemas.push({ gravidade: 'erro', codigo, ponteiro, regra, texto })
  const aviso = (codigo, ponteiro, regra, texto) => problemas.push({ gravidade: 'aviso', codigo, ponteiro, regra, texto })

  // 1. `reference.length > 0` neste arquivo (L1)
  const ref = doc?.rig?.reference
  if (ref && typeof ref === 'object' && 'length' in ref) {
    if (!(typeof ref.length === 'number' && ref.length > 0)) {
      erro('RIG_REFERENCE', '/rig/reference/length', '4.8',
        `O rig.reference.length tem de ser maior que zero (está ${JSON.stringify(ref.length)}). É o divisor do ajuste de tamanho: com zero, a animação não tem como ser escalada.`)
    }
  }

  // 1b. RIG_INCOMPLETE neste arquivo, quando ele TEM `rig` (4.8)
  //
  // Um `rig` incompleto num arquivo que vai ser DISTRIBUÍDO faz o hospedeiro
  // aplicar menos do que devia, **em silêncio**: ele não tem como reclamar do
  // que o rig não citou, e quem publicou nunca descobre. Por isso a conta roda
  // no arquivo solto também, e não só quando alguém o carrega.
  //
  // O desconto é o que mata o falso positivo, e ele é diferente por tipo:
  //
  // - **ossos**: desconta só os `skinRequired`, que são os que uma pele leva
  //   junto (2.8). Um osso comum do arquivo **não** conta: os `bones` de um
  //   arquivo de animações são **ignorados** na importação, então animá-lo sem
  //   citá-lo no rig é exatamente o defeito;
  // - **slots**: desconta os slots locais, que uma pele leva junto e que o
  //   hospedeiro não precisa ter (é o `rigs/lobisomem-rabo.bone`).
  //
  // Medido antes de escrever, em 18/09/2026, sobre os 110 `.bone` do projeto
  // (12 com `rig`): **zero** acusados. E com o defeito plantado — tirar
  // `tronco` do rig de `rigs/humanoide-v1-animacoes.bone` sem tirar a timeline
  // que o anima — a conta acusa `tronco`. É o que o chat `B` conferiu à mão ao
  // fazer as quatro animações de fábrica, porque o validador não fazia.
  if (doc?.rig && typeof doc.rig === 'object') {
    const rigOssos = new Set(Array.isArray(doc.rig.bones) ? doc.rig.bones : [])
    const rigSlots = new Set(Array.isArray(doc.rig.slots) ? doc.rig.slots : [])
    const trazOssos = new Set((Array.isArray(doc.bones) ? doc.bones : [])
      .filter(b => b && b.skinRequired).map(b => b.name))
    const trazSlots = new Set((Array.isArray(doc.slots) ? doc.slots : [])
      .map(s => s && s.name).filter(n => typeof n === 'string'))
    const { ossos: usaOssos, slots: usaSlots } = alvosDeTimeline(doc)

    for (const nome of usaOssos) {
      if (!rigOssos.has(nome) && !trazOssos.has(nome)) {
        aviso('RIG_INCOMPLETE', '/rig/bones', '4.8',
          `Este arquivo anima o osso "${nome}" e não o lista em rig.bones. Se ele for usado como arquivo de animações de fora, os ossos dele são ignorados: o corpo precisa ter "${nome}", e o rig não diz isso a ninguém.`)
      }
    }
    for (const nome of new Set([...usaSlots, ...slotsDasPeles(doc)])) {
      if (!rigSlots.has(nome) && !trazSlots.has(nome)) {
        aviso('RIG_INCOMPLETE', '/rig/slots', '4.8',
          `Este arquivo usa o slot "${nome}", não o traz e não o lista em rig.slots. Quem carregar este arquivo precisa ter esse slot, e o rig não declara.`)
      }
    }
  }

  const externos = contexto.externos instanceof Map ? contexto.externos : null
  if (!externos || externos.size === 0) return problemas

  const bones = Array.isArray(doc.bones) ? doc.bones : []
  const nomesOsso = new Set(bones.map(b => b && b.name).filter(n => typeof n === 'string'))
  const nomesSlot = new Set((Array.isArray(doc.slots) ? doc.slots : []).map(s => s && s.name).filter(n => typeof n === 'string'))
  const deQualLista = new Map(externosCitados(doc).map(e => [e.uri, e.lista]))

  for (const [uri, ext] of externos) {
    if (!ext || typeof ext !== 'object') continue    // não carregou: não dá para conferir
    const ponteiro = `/assets/${deQualLista.get(uri) === 'skins' ? 'skins' : 'animations'}`
    const rig = ext.rig && typeof ext.rig === 'object' ? ext.rig : null

    if (rig) {
      // 2. RIG_UNMET: cada nome que o hospedeiro não tem, um aviso (4.8)
      for (const nome of Array.isArray(rig.bones) ? rig.bones : []) {
        if (typeof nome === 'string' && !nomesOsso.has(nome)) {
          aviso('RIG_UNMET', ponteiro, '4.8',
            `"${uri}" exige o osso "${nome}", que este corpo não tem. O arquivo abre mesmo assim, e o que dependia desse osso é ignorado.`)
        }
      }
      for (const nome of Array.isArray(rig.slots) ? rig.slots : []) {
        if (typeof nome === 'string' && !nomesSlot.has(nome)) {
          aviso('RIG_UNMET', ponteiro, '4.8',
            `"${uri}" exige o slot "${nome}", que este corpo não tem. O arquivo abre mesmo assim, e o que dependia desse slot é ignorado.`)
        }
      }
      const r = rig.reference
      if (r && typeof r === 'object' && typeof r.bone === 'string') {
        const osso = bones.find(b => b && b.name === r.bone)
        if (!osso) {
          aviso('RIG_UNMET', ponteiro, '2.8',
            `"${uri}" ajusta o tamanho pelo osso "${r.bone}", que este corpo não tem. A animação entra sem ajuste (k = 1), e pode ficar do tamanho errado.`)
        } else if (!(typeof osso.length === 'number' && osso.length > 0)) {
          aviso('RIG_UNMET', ponteiro, '2.8',
            `"${uri}" ajusta o tamanho pelo osso "${r.bone}", e esse osso tem length zero neste corpo. A animação entra sem ajuste (k = 1).`)
        }
      }
    }

    // 3. RIG_INCOMPLETE: o rig do externo cita menos do que ele usa (4.8)
    const declaradosOsso = new Set(Array.isArray(rig?.bones) ? rig.bones : [])
    const declaradosSlot = new Set(Array.isArray(rig?.slots) ? rig.slots : [])
    const { ossos: usaOssos, slots: usaSlots } = alvosDeTimeline(ext)
    const trazSlots = new Set((Array.isArray(ext.slots) ? ext.slots : []).map(s => s && s.name).filter(n => typeof n === 'string'))

    if (deQualLista.get(uri) !== 'skins') {
      // Arquivo de animações: os `bones` e `slots` locais dele são IGNORADOS na
      // importação (2.8), então todo alvo tem de estar no rig.
      for (const nome of usaOssos) {
        if (!declaradosOsso.has(nome)) {
          aviso('RIG_INCOMPLETE', ponteiro, '4.8',
            `"${uri}" anima o osso "${nome}" e não o lista em rig.bones. Os ossos do próprio arquivo de animações são ignorados na importação: sem o nome no rig, ninguém avisa quando o corpo não tem esse osso.`)
        }
      }
      for (const nome of usaSlots) {
        if (!declaradosSlot.has(nome)) {
          aviso('RIG_INCOMPLETE', ponteiro, '4.8',
            `"${uri}" anima o slot "${nome}" e não o lista em rig.slots. Mesma coisa: sem o nome no rig, a falta passa calada.`)
        }
      }
    } else {
      // Arquivo de pele: os slots que ele PREENCHE e não TRAZ são do hospedeiro.
      for (const nome of slotsDasPeles(ext)) {
        if (!trazSlots.has(nome) && !declaradosSlot.has(nome)) {
          aviso('RIG_INCOMPLETE', ponteiro, '4.8',
            `"${uri}" preenche o slot "${nome}", não traz esse slot e não o lista em rig.slots. Uma pele de fora declara no rig os slots do hospedeiro que ela preenche.`)
        }
      }
    }
  }

  return problemas
}

// ---------------------------------------------------------------------------
// Extensions (spec 2.7 and 12.7)
// ---------------------------------------------------------------------------

/**
 * Walks every `extensions` object of the document, top down, and calls
 * `visitar(nomeDaExtensao, objeto, ponteiro)` for each one.
 *
 * Spec 2.7 says "todo objeto pode ter `extensions`", so there is no shorter
 * way than walking: a list of the places it may appear would go stale the
 * first time the core grows an object.
 */
function percorrerExtensoes(valor, ponteiro, visitar, profundidade = 0) {
  if (profundidade > 64 || valor === null || typeof valor !== 'object') return // 12.6: depth
  if (Array.isArray(valor)) {
    valor.forEach((v, i) => percorrerExtensoes(v, `${ponteiro}/${i}`, visitar, profundidade + 1))
    return
  }
  const ext = valor.extensions
  if (ext !== null && typeof ext === 'object' && !Array.isArray(ext)) {
    for (const nome of Object.keys(ext)) {
      visitar(nome, ext[nome], `${ponteiro}/extensions/${escaparPonteiro(nome)}`)
    }
  }
  for (const chave of Object.keys(valor)) {
    if (chave === 'extensions' || chave === 'extras') continue
    percorrerExtensoes(valor[chave], `${ponteiro}/${escaparPonteiro(chave)}`, visitar, profundidade + 1)
  }
}

/** Every attachment of every skin, with its JSON pointer. */
function percorrerAnexos(doc, visitar) {
  const skins = Array.isArray(doc.skins) ? doc.skins : []
  skins.forEach((pele, i) => {
    const porSlot = pele && pele.attachments
    if (!porSlot || typeof porSlot !== 'object') return
    for (const slot of Object.keys(porSlot)) {
      const porNome = porSlot[slot]
      if (!porNome || typeof porNome !== 'object') continue
      for (const nome of Object.keys(porNome)) {
        const anexo = porNome[nome]
        if (!anexo || typeof anexo !== 'object') continue
        visitar(anexo, `/skins/${i}/attachments/${escaparPonteiro(slot)}/${escaparPonteiro(nome)}`, slot, nome)
      }
    }
  })
}

/**
 * Applies the JSON Schema an extension publishes, **by name** — which is what
 * spec 12.7 asks for and what nobody was doing: `definitions/extensions` of
 * `bone.schema.json` checks the key name (the 2.7 regex) and that the value is
 * an object, and stops there. The content of an extension object, and every
 * attachment with a prefixed `type`, went through unread.
 *
 * `registro` is `{ "<NOME_DA_EXTENSAO>": { validar, tiposDeAnexo } }`:
 *
 * - `validar` is an Ajv-compiled function (with `.errors`) for the extension's
 *   own schema, in `formato/extensions/<NOME>.schema.json`;
 * - `tiposDeAnexo` lists the prefixed `attachment.type` values that schema
 *   describes, from the schema's `x-attachment-types`.
 *
 * The command line builds it with Ajv at run time; the page gets it compiled
 * ahead of time by `construir-esquema.mjs`. Without a registry this returns
 * nothing: a reader that does not know the extension is **not** wrong (2.5),
 * and silence here is the fallback, not a miss.
 */
export function checarExtensoes(doc, registro) {
  const problemas = []
  if (!registro || typeof registro !== 'object') return problemas
  const nomes = Object.keys(registro)
  if (nomes.length === 0) return problemas

  const contar = (validar, valor, ponteiro, nomeExt, oQue) => {
    if (typeof validar !== 'function') return
    if (validar(valor)) return
    for (const e of enxugarErros(validar.errors)) {
      problemas.push({
        gravidade: 'erro',
        codigo: 'EXT_SCHEMA',
        ponteiro: `${ponteiro}${e.instancePath || ''}`,
        regra: '2.7',
        texto: `${oQue} não bate com o schema da extensão "${nomeExt}": ${e.message}.`,
      })
    }
  }

  // 1. every `extensions.<nome>` object whose extension we know
  percorrerExtensoes(doc, '', (nome, objeto, ponteiro) => {
    const entrada = registro[nome]
    if (!entrada) return
    contar(entrada.validarObjeto, objeto, ponteiro, nome, 'O bloco da extensão')
  })

  // 2. every attachment with a prefixed `type` this registry describes
  const donoDoTipo = new Map()
  for (const nome of nomes) {
    for (const tipo of registro[nome].tiposDeAnexo ?? []) donoDoTipo.set(tipo, nome)
  }
  if (donoDoTipo.size) {
    percorrerAnexos(doc, (anexo, ponteiro) => {
      const nome = donoDoTipo.get(anexo.type)
      if (!nome) return
      contar(registro[nome].validar, anexo, ponteiro, nome, 'O anexo')
    })
  }

  return problemas
}

/**
 * Every extension the document actually uses: a key of any `extensions`
 * object, or the prefix of any prefixed `type` (attachment or timeline).
 *
 * A prefixed type names the extension by its PREFIX plus the type name, and
 * the two are not the same string: the type is `BONE_particle` and the
 * extension is `BONE_particles`. Only the registry knows which extension owns
 * a type, so the type side needs it; the `extensions` keys do not.
 */
function extensoesUsadas(doc, registro) {
  const usadas = new Set()
  percorrerExtensoes(doc, '', (nome) => usadas.add(nome))

  const donoDoTipo = new Map()
  for (const nome of Object.keys(registro ?? {})) {
    const e = registro[nome]
    for (const t of e.tiposDeAnexo ?? []) donoDoTipo.set(t, nome)
    for (const t of e.tiposDeTimeline ?? []) donoDoTipo.set(t, nome)
  }
  if (donoDoTipo.size === 0) return usadas

  percorrerAnexos(doc, (anexo) => {
    const dono = donoDoTipo.get(anexo.type)
    if (dono) usadas.add(dono)
  })
  for (const a of Array.isArray(doc.animations) ? doc.animations : []) {
    for (const tl of Array.isArray(a?.timelines) ? a.timelines : []) {
      const dono = donoDoTipo.get(tl?.type)
      if (dono) usadas.add(dono)
    }
  }
  return usadas
}

/**
 * `extensionsUsed` and `extensionsRequired` (spec 2.7 and 12.3).
 *
 * Two rules, and the spec puts both at L1 under one code:
 *
 * - a name in `extensionsRequired` that is not in `extensionsUsed`;
 * - an extension the file **uses** and does not list in `extensionsUsed`.
 *
 * The second is the one that bites: a reader decides what it can show by
 * reading `extensionsUsed` alone. A file with a `BONE_particle` attachment and
 * an empty `extensionsUsed` tells every reader "nothing to see here" and then
 * hands them a type they do not know.
 *
 * `registrados` is the set of names of `formato/extensions/REGISTRY.md` — the
 * registry spec 2.7 points at. A name outside it is legal and gets L2
 * `EXT_UNREGISTERED`, exactly as 2.7 says. Without the set, no L2 is raised:
 * not having the list is not the same as the name being unregistered.
 */
export function checarUsoDeExtensoes(doc, registro, registrados) {
  const problemas = []
  const erro = (codigo, ponteiro, regra, texto) => problemas.push({ gravidade: 'erro', codigo, ponteiro, regra, texto })
  const aviso = (codigo, ponteiro, regra, texto) => problemas.push({ gravidade: 'aviso', codigo, ponteiro, regra, texto })

  const declaradas = Array.isArray(doc.extensionsUsed) ? doc.extensionsUsed : []
  const exigidas = Array.isArray(doc.extensionsRequired) ? doc.extensionsRequired : []

  exigidas.forEach((nome, i) => {
    if (typeof nome === 'string' && !declaradas.includes(nome)) {
      erro('EXT_REQUIRED_NOT_USED', `/extensionsRequired/${i}`, '2.7',
        `A extensão "${nome}" está em extensionsRequired e não está em extensionsUsed. Quem não conhecer essa extensão vai recusar o arquivo, e quem conhecer não vai saber que ela está aqui.`)
    }
  })

  for (const nome of extensoesUsadas(doc, registro)) {
    if (!declaradas.includes(nome)) {
      erro('EXT_REQUIRED_NOT_USED', '/extensionsUsed', '2.7',
        `O arquivo usa a extensão "${nome}" e não a lista em extensionsUsed. Um leitor decide o que consegue mostrar lendo essa lista: sem o nome nela, ele diz que abriu tudo e não abriu.`)
    }
  }

  if (registrados instanceof Set && registrados.size > 0) {
    declaradas.forEach((nome, i) => {
      if (typeof nome === 'string' && !registrados.has(nome)) {
        aviso('EXT_UNREGISTERED', `/extensionsUsed/${i}`, '2.7',
          `A extensão "${nome}" não está no registro (formato/extensions/REGISTRY.md). O nome é válido, mas nada impede outra pessoa de usar o mesmo para outra coisa.`)
      }
    })
  }

  return problemas
}

// ---------------------------------------------------------------------------
// BONE_particles (formato/extensions/BONE_particles.md)
// ---------------------------------------------------------------------------

/** As faixas `[min, max]` de um emissor, e onde cada uma mora. */
const FAIXAS_DE_PARTICULA = ['lifetime', 'speed', 'angle', 'angularVelocity', 'scale', 'startFrame']

/** É uma Bézier de §9.3: quatro números em vez de "linear" ou "stepped". */
function ehBezier(curva) {
  return Array.isArray(curva) && curva.length >= 4
}

/**
 * The five rules of `BONE_particles` a JSON Schema cannot express, each with
 * the code the extension spec names (§11 there):
 *
 * | `RANGE_PARTICLE_MINMAX`     | L1 | `min > max` in any range        |
 * | `RANGE_PARTICLE_RATE`       | L1 | `rate` negative, field or key   |
 * | `RANGE_PARTICLE_RATE_CURVE` | L2 | Bézier on a `rate` key          |
 * | `REF_PARTICLE_MESH`         | L1 | `mesh` outside the slot         |
 * | `REF_PARTICLE_CURVE`        | L1 | `curve` not a `path` (1.1)     |
 * | `LIMIT_PARTICLE_COUNT`      | L2 | `rate × lifetime.max` over 10 000 |
 *
 * A schema cannot say any of them: `min > max` compares two items of the same
 * array, the mesh reference is a name in another object, and the count is a
 * product. They are exactly the L1/L2 layer of 12.7 ("o schema é o mínimo").
 */
export function checarParticulas(doc) {
  const problemas = []
  const erro = (codigo, ponteiro, regra, texto) => problemas.push({ gravidade: 'erro', codigo, ponteiro, regra, texto })
  const aviso = (codigo, ponteiro, regra, texto) => problemas.push({ gravidade: 'aviso', codigo, ponteiro, regra, texto })

  /** O teto da §10 da spec da extensão, e da §12.6 da spec do formato. */
  const TETO_DE_VIVAS = 10000

  // As timelines de `rate`, indexadas por (slot, placeholder), para a busca
  // de chave negativa e de Bézier. A spec da extensão prefixa o tipo.
  const timelinesDeRate = []
  ;(Array.isArray(doc.animations) ? doc.animations : []).forEach((a, ai) => {
    ;(Array.isArray(a?.timelines) ? a.timelines : []).forEach((tl, ti) => {
      if (tl?.type === 'BONE_particle' && tl?.property === 'rate') {
        timelinesDeRate.push({ tl, ponteiro: `/animations/${ai}/timelines/${ti}` })
      }
    })
  })

  for (const { tl, ponteiro } of timelinesDeRate) {
    ;(Array.isArray(tl.keys) ? tl.keys : []).forEach((k, ki) => {
      if (typeof k?.value === 'number' && k.value < 0) {
        erro('RANGE_PARTICLE_RATE', `${ponteiro}/keys/${ki}/value`, 'BONE_particles 4.2',
          `A taxa de nascimento não pode ser negativa (${k.value}). O leitor troca por 0 na chave, antes de integrar — e é melhor o arquivo já vir com 0.`)
      }
      if (ehBezier(k?.curve)) {
        aviso('RANGE_PARTICLE_RATE_CURVE', `${ponteiro}/keys/${ki}/curve`, 'BONE_particles 4.2',
          'Chave de taxa com Bézier. A integral da taxa só é exata com "linear" ou "stepped": o leitor vai usar "linear" e avisar. O editor não oferece Bézier neste campo.')
      }
    })
  }

  // Os slots, para saber a que slot um anexo pertence e o que mais mora nele.
  percorrerAnexos(doc, (anexo, ponteiro, slot, nome) => {
    if (anexo.type !== 'BONE_particle') return

    for (const campo of FAIXAS_DE_PARTICULA) {
      const v = anexo[campo]
      if (!Array.isArray(v) || v.length < 2) continue
      if (typeof v[0] !== 'number' || typeof v[1] !== 'number') continue
      if (v[0] > v[1]) {
        erro('RANGE_PARTICLE_MINMAX', `${ponteiro}/${campo}`, 'BONE_particles 9',
          `A faixa "${campo}" do emissor "${nome}" está de trás para frente: min ${v[0]} é maior que max ${v[1]}. O sorteio é min + (max − min) × u, e com a faixa invertida ele anda para o lado errado.`)
      }
    }

    if (typeof anexo.rate === 'number' && anexo.rate < 0) {
      erro('RANGE_PARTICLE_RATE', `${ponteiro}/rate`, 'BONE_particles 4.1',
        `A taxa de nascimento do emissor "${nome}" não pode ser negativa (${anexo.rate}).`)
    }

    if (anexo.shape === 'mesh' || typeof anexo.mesh === 'string') {
      const alvo = anexo.mesh
      // §9.4: o `mesh` aponta para um placeholder de anexo `mesh` DO MESMO SLOT.
      // Basta existir em uma pele: uma pele pode trazer a malha e outra o emissor.
      let achou = false
      percorrerAnexos(doc, (outro, _p, outroSlot, outroNome) => {
        if (outroSlot === slot && outroNome === alvo && outro.type === 'mesh') achou = true
      })
      if (!achou) {
        erro('REF_PARTICLE_MESH', `${ponteiro}/mesh`, 'BONE_particles 9.4',
          `O emissor "${nome}" nasce da malha "${alvo}", e não há nenhum anexo "mesh" com esse nome no slot "${slot}". A malha tem de estar no MESMO slot: é dela que saem os vértices deformados em t_i.`)
      }
    }

    // §9.4.2 (1.1): `curve` é "<slot>/<placeholder>" de um anexo `path` de
    // QUALQUER slot. O slot é o que vem antes da PRIMEIRA barra; o resto é o
    // placeholder. Basta existir em uma pele, como a malha.
    if (anexo.shape === 'path' || typeof anexo.curve === 'string') {
      const alvo = typeof anexo.curve === 'string' ? anexo.curve : ''
      const barra = alvo.indexOf('/')
      const slotDoCaminho = barra > 0 ? alvo.slice(0, barra) : null
      const nomeDoCaminho = barra > 0 ? alvo.slice(barra + 1) : null
      let achou = false
      if (slotDoCaminho !== null && nomeDoCaminho !== '') {
        percorrerAnexos(doc, (outro, _p, outroSlot, outroNome) => {
          if (outroSlot === slotDoCaminho && outroNome === nomeDoCaminho && outro.type === 'path') achou = true
        })
      }
      if (!achou) {
        erro('REF_PARTICLE_CURVE', `${ponteiro}/curve`, 'BONE_particles 9.4.2',
          alvo === ''
            ? `O emissor "${nome}" nasce ao longo de um caminho e não diz qual: falta o campo curve ("<slot>/<anexo>"). O leitor não desenha o emissor.`
            : `O emissor "${nome}" nasce ao longo do caminho "${alvo}", e não há nenhum anexo "path" com esse nome nesse slot. O formato é "<slot>/<anexo>": o slot vem antes da primeira barra. O leitor não desenha o emissor.`)
      }
    }

    // O teto olha a taxa mais alta que o arquivo pede: a do anexo e a de
    // qualquer chave. Emissor com taxa animada por chave passaria batido se
    // olhássemos só o número parado.
    let maiorTaxa = typeof anexo.rate === 'number' ? anexo.rate : 10
    for (const { tl } of timelinesDeRate) {
      if (tl.target !== slot || tl.attachment !== nome) continue
      for (const k of Array.isArray(tl.keys) ? tl.keys : []) {
        if (typeof k?.value === 'number' && k.value > maiorTaxa) maiorTaxa = k.value
      }
    }
    const vidaMax = Array.isArray(anexo.lifetime) && typeof anexo.lifetime[1] === 'number'
      ? anexo.lifetime[1]
      : 1
    const esperadas = maiorTaxa * vidaMax
    if (esperadas > TETO_DE_VIVAS) {
      aviso('LIMIT_PARTICLE_COUNT', ponteiro, 'BONE_particles 10',
        `O emissor "${nome}" pede taxa ${maiorTaxa}/s com vida de até ${vidaMax} s: ${Math.round(esperadas)} partículas vivas ao mesmo tempo, acima do teto de ${TETO_DE_VIVAS}. Um leitor PODE recusar. O maxParticles corta o desenho, mas a conta de nascimento continua sendo feita.`)
    }
  })

  return problemas
}

/**
 * Atlas rules a JSON Schema cannot express (spec 10.3 to 10.5, level L1).
 * Port of `checarAtlas`.
 */
export function checarAtlas(doc) {
  const problemas = []
  const pages = Array.isArray(doc.pages) ? doc.pages : []
  const regions = Array.isArray(doc.regions) ? doc.regions : []

  const nomesPagina = new Set()
  pages.forEach((p, i) => {
    if (!p || typeof p.name !== 'string') return
    if (nomesPagina.has(p.name)) {
      problemas.push({
        ponteiro: `/pages/${i}/name`,
        regra: '10.3',
        texto: `A página "${p.name}" aparece duas vezes. Cada página precisa de um nome só dela.`,
      })
    }
    nomesPagina.add(p.name)
  })

  // `name` and `aliases` share one name space (spec 10.3 and 10.5).
  const nomesRegiao = new Map()
  const anota = (nome, onde, ponteiro) => {
    if (typeof nome !== 'string') return
    if (nomesRegiao.has(nome)) {
      problemas.push({
        ponteiro,
        regra: '10.5',
        texto: `O nome de região "${nome}" está repetido: aparece em ${nomesRegiao.get(nome)} e em ${onde}. Nome e apelido dividem a mesma lista.`,
      })
    } else nomesRegiao.set(nome, onde)
  }

  regions.forEach((r, i) => {
    if (!r || typeof r !== 'object') return
    const onde = `regions[${i}]`
    const base = `/regions/${i}`
    anota(r.name, onde, `${base}/name`)
    const apelidos = Array.isArray(r.aliases) ? r.aliases : []
    apelidos.forEach((apelido, j) => anota(apelido, `${onde}.aliases`, `${base}/aliases/${j}`))

    const pagina = pages[r.page]
    if (pagina === undefined) {
      problemas.push({
        ponteiro: `${base}/page`,
        regra: '10.3',
        texto: `A região "${r.name}" usa a página número ${r.page}, e essa página não existe.`,
      })
      return
    }
    const girado = r.rotation === 90
    const largura = girado ? r.height : r.width
    const altura = girado ? r.width : r.height
    if (r.x + largura > pagina.width) {
      problemas.push({
        ponteiro: `${base}/x`,
        regra: '10.4',
        texto: `A região "${r.name}" passa da borda direita da página: ${r.x} + ${largura} é maior que ${pagina.width}.`,
      })
    }
    if (r.y + altura > pagina.height) {
      problemas.push({
        ponteiro: `${base}/y`,
        regra: '10.4',
        texto: `A região "${r.name}" passa da borda de baixo da página: ${r.y} + ${altura} é maior que ${pagina.height}.`,
      })
    }
    const offsetX = r.offsetX ?? 0
    const offsetY = r.offsetY ?? 0
    const originalWidth = r.originalWidth ?? r.width
    const originalHeight = r.originalHeight ?? r.height
    if (originalWidth < offsetX + r.width) {
      problemas.push({
        ponteiro: `${base}/originalWidth`,
        regra: '10.4',
        texto: `A região "${r.name}" não cabe no desenho original: originalWidth ${originalWidth} é menor que offsetX ${offsetX} mais width ${r.width}.`,
      })
    }
    if (originalHeight < offsetY + r.height) {
      problemas.push({
        ponteiro: `${base}/originalHeight`,
        regra: '10.4',
        texto: `A região "${r.name}" não cabe no desenho original: originalHeight ${originalHeight} é menor que offsetY ${offsetY} mais height ${r.height}.`,
      })
    }
    if (r.rotation !== undefined && r.rotation !== 0 && r.rotation !== 90) {
      problemas.push({
        ponteiro: `${base}/rotation`,
        regra: '10.4',
        texto: `A região "${r.name}" tem rotation ${r.rotation}, que não existe. Use 0 ou 90.`,
      })
    }
  })
  return problemas
}

/** Package manifest rules the schema does not express (spec 2.9). */
export function checarManifesto(doc) {
  const problemas = []
  if (typeof doc.main === 'string') {
    const listados = Array.isArray(doc.skeletons) ? doc.skeletons : []
    if (listados.length > 0 && !listados.includes(doc.main)) {
      problemas.push({
        ponteiro: '/main',
        regra: '2.9',
        texto: `O arquivo principal "${doc.main}" não está na lista "skeletons".`,
      })
    }
  }
  return problemas
}

// ---------------------------------------------------------------------------
// Ajv error -> one problem in plain Portuguese
// ---------------------------------------------------------------------------

const NOME_DO_VALOR = {
  object: 'um objeto',
  array: 'uma lista',
  string: 'um texto',
  number: 'um número',
  integer: 'um número inteiro',
  boolean: 'sim ou não',
  null: 'nulo',
}

function nomeDoValor(tipo) {
  const partes = String(tipo).split(',').map(t => NOME_DO_VALOR[t.trim()] ?? t.trim())
  return partes.join(' ou ')
}

function trecho(valor, limite = 60) {
  let texto
  try { texto = JSON.stringify(valor) } catch { texto = String(valor) }
  if (texto === undefined) texto = String(valor)
  return texto.length > limite ? `${texto.slice(0, limite)}…` : texto
}

/**
 * Which section of the specification a pointer falls under. Cited next to the
 * problem so a reader can look the rule up instead of guessing.
 */
export function regraDoPonteiro(ponteiro, tipo) {
  if (tipo === 'atlas') {
    if (ponteiro.startsWith('/pages')) return '10.2'
    if (ponteiro.startsWith('/regions')) return '10.3'
    return '10.1'
  }
  if (tipo === 'manifesto') return '2.9'
  const raiz = ponteiro.split('/')[1] ?? ''
  const mapa = {
    bone: '2.3',
    skeleton: '4.1',
    assets: '2.8',
    bones: '4.2',
    slots: '4.3',
    skins: '7.1',
    events: '4.5',
    animations: '9.1',
    constraints: '6.1',
    parameters: '8.1',
    morphs: '8.3',
    variables: '8.4',
    tags: '8.5',
    extensionsUsed: '2.7',
    extensionsRequired: '2.7',
    extensions: '2.7',
    extras: '2.6',
  }
  return mapa[raiz] ?? '2.2'
}

/**
 * Turns one Ajv error into one problem the reader can act on: plain sentence,
 * severity, pointer and the section of the spec that says so.
 */
export function classificarProblema(erro, tipo) {
  const ponteiro = erro.instancePath || ''
  const p = erro.params ?? {}
  let texto
  switch (erro.keyword) {
    case 'required':
      texto = `Falta a propriedade obrigatória "${p.missingProperty}".`
      break
    case 'additionalProperties':
      texto = `A propriedade "${p.additionalProperty}" não é aceita aqui.`
      break
    case 'type':
      texto = `Aqui é preciso ${nomeDoValor(p.type)}.`
      break
    case 'enum':
      texto = `Este valor não está na lista aceita: ${(p.allowedValues ?? []).map(v => trecho(v, 24)).join(', ')}.`
      break
    case 'const':
      texto = `Este valor tem que ser exatamente ${trecho(p.allowedValue)}.`
      break
    case 'minimum':
      texto = `O número tem que ser ${p.comparison === '>' ? 'maior que' : 'no mínimo'} ${p.limit}.`
      break
    case 'exclusiveMinimum':
      texto = `O número tem que ser maior que ${p.limit}.`
      break
    case 'maximum':
      texto = `O número tem que ser no máximo ${p.limit}.`
      break
    case 'exclusiveMaximum':
      texto = `O número tem que ser menor que ${p.limit}.`
      break
    case 'minItems':
      texto = `A lista precisa de pelo menos ${p.limit} ${p.limit === 1 ? 'item' : 'itens'}.`
      break
    case 'maxItems':
      texto = `A lista pode ter no máximo ${p.limit} ${p.limit === 1 ? 'item' : 'itens'}.`
      break
    case 'minLength':
      texto = `O texto precisa de pelo menos ${p.limit} ${p.limit === 1 ? 'letra' : 'letras'}.`
      break
    case 'maxLength':
      texto = `O texto pode ter no máximo ${p.limit} letras.`
      break
    case 'uniqueItems':
      texto = `A lista tem o mesmo item duas vezes, nas posições ${p.i} e ${p.j}.`
      break
    case 'pattern':
      texto = `O texto não segue a forma exigida aqui.`
      break
    case 'format':
      texto = p.format === 'date-time'
        ? 'A data precisa estar no formato "2026-09-06T12:00:00Z".'
        : `O texto não está no formato "${p.format}".`
      break
    case 'propertyNames':
      texto = `O nome da propriedade "${p.propertyName}" não é aceito aqui.`
      break
    case 'anyOf':
    case 'oneOf':
      texto = 'Este trecho não bate com nenhuma das formas aceitas aqui.'
      break
    case 'not':
      texto = 'Este trecho usa uma combinação que a especificação proíbe.'
      break
    default:
      texto = erro.message ?? 'Valor fora do que a especificação aceita.'
  }
  return {
    gravidade: 'erro',
    ponteiro,
    regra: regraDoPonteiro(ponteiro, tipo),
    texto,
    origem: 'esquema',
    chave: erro.keyword,
  }
}

/**
 * Errors from a branch (`anyOf` / `oneOf`) explode: one per branch tried. The
 * page shows the branch error itself and drops the noise under it, which is
 * how a person reads the file too.
 */
export function enxugarErros(erros) {
  const lista = erros ?? []
  const ramos = new Set()
  for (const e of lista) {
    if (e.keyword === 'anyOf' || e.keyword === 'oneOf' || e.keyword === 'if') {
      ramos.add(`${e.instancePath}|${e.schemaPath}`)
    }
  }
  const dentroDeRamo = (e) => {
    for (const chave of ramos) {
      const [caminho, esquema] = chave.split('|')
      if (!e.instancePath.startsWith(caminho)) continue
      const raiz = esquema.replace(/\/(anyOf|oneOf|if)$/, '')
      if (e.schemaPath.startsWith(`${raiz}/anyOf/`)) return true
      if (e.schemaPath.startsWith(`${raiz}/oneOf/`)) return true
      if (e.schemaPath.startsWith(`${raiz}/then`)) return true
      if (e.schemaPath.startsWith(`${raiz}/else`)) return true
    }
    return false
  }
  const fora = lista.filter(e => !dentroDeRamo(e))
  const vistos = new Set()
  return (fora.length > 0 ? fora : lista).filter(e => {
    const chave = `${e.instancePath}|${e.keyword}|${e.message}|${JSON.stringify(e.params ?? {})}`
    if (vistos.has(chave)) return false
    vistos.add(chave)
    return true
  })
}

// ---------------------------------------------------------------------------
// The verdict
// ---------------------------------------------------------------------------

/**
 * Validates one already-parsed document.
 *
 * `validadores` is `{ esqueleto, atlas, manifesto }` — the three compiled Ajv
 * functions of `esquema-compilado.js`, passed in so this module stays free of
 * imports and easy to test.
 *
 * `contexto` is passed on to `checarSemantica`: `{ corpos: Map<uri, doc | null> }`
 * with the bodies the `body` keys cite, when the caller could load them.
 *
 * Returns `{ valido, tipo, problemas }`. A problem carries `gravidade`
 * (`"erro"` or `"aviso"`), `texto` in plain Portuguese, `ponteiro`, `regra`,
 * the section of the spec, and `codigo` (spec 12.3) when a rule gave one.
 * Only `erro` makes a file invalid.
 */
export function validarDocumento(doc, tipo, validadores, contexto = {}) {
  const problemas = []
  const validar = validadores[tipo]
  if (typeof validar === 'function') {
    const passou = validar(doc)
    if (!passou) {
      for (const erro of enxugarErros(validar.errors)) problemas.push(classificarProblema(erro, tipo))
    }
  }
  const semanticos =
    tipo === 'atlas' ? checarAtlas(doc)
      : tipo === 'manifesto' ? checarManifesto(doc)
        : checarSemantica(doc, contexto)
  for (const s of semanticos) problemas.push({ gravidade: 'erro', origem: 'regra', chave: 'semantica', ...s })
  for (const a of avisos(doc, tipo)) problemas.push(a)
  const valido = problemas.every(p => p.gravidade !== 'erro')
  return { valido, tipo, problemas }
}

/**
 * Things that are legal but worth saying out loud. They never make a file
 * invalid; they are the difference between "passa" and "está bom".
 */
export function avisos(doc, tipo) {
  const fora = []
  if (tipo !== 'esqueleto') return fora
  // `extensionsRequired` fora de `extensionsUsed` MOROU AQUI, como aviso sem
  // código. A §12.3 diz que é L1 `EXT_REQUIRED_NOT_USED`, e um aviso deixava
  // o arquivo passar por válido. A regra está agora em `checarUsoDeExtensoes`,
  // com o código e a severidade que a spec manda.
  const atlases = Array.isArray(doc.assets?.atlases) ? doc.assets.atlases : []
  const temDesenho = (Array.isArray(doc.skins) ? doc.skins : []).some(pele =>
    pele && pele.attachments && Object.keys(pele.attachments).length > 0)
  if (atlases.length === 0 && temDesenho) {
    fora.push({
      gravidade: 'aviso',
      origem: 'regra',
      chave: 'atlas',
      ponteiro: '/assets',
      regra: '2.8',
      texto: 'O arquivo tem desenhos mas não nomeia nenhum atlas em assets.atlases. Sem atlas, nada aparece na tela.',
    })
  }
  // Animação de fora (`assets.animations`, 2.8) também é animação: o boneco
  // que toca as do `humanoide-v1-animacoes.bone` não é pose de montagem
  // (achado da Oficina, 05/11/2026). O resumo diz de onde elas vêm.
  const deFora = Array.isArray(doc.assets?.animations) ? doc.assets.animations.filter(u => typeof u === 'string') : []
  if ((!Array.isArray(doc.animations) || doc.animations.length === 0) && deFora.length === 0) {
    fora.push({
      gravidade: 'aviso',
      origem: 'regra',
      chave: 'animacao',
      ponteiro: '/animations',
      regra: '9.1',
      texto: 'Este arquivo não tem nenhuma animação. Ele é uma pose de montagem.',
    })
  }
  return fora
}

// ---------------------------------------------------------------------------
// What is inside the file
// ---------------------------------------------------------------------------

/** Human name of every feature the summary can report. */
export const NOME_DO_RECURSO = {
  region: 'Desenhos soltos (region)',
  mesh: 'Malhas (mesh)',
  linkedmesh: 'Malha ligada (linkedmesh)',
  boundingbox: 'Caixas de colisão (boundingbox)',
  clipping: 'Máscara de recorte (clipping)',
  path: 'Caminhos (path)',
  point: 'Pontos (point)',
  skeleton: 'Esqueleto dentro de esqueleto',
  pesos: 'Malha com pesos por osso',
  sequencia: 'Sequência de imagens',
  ik: 'Regra de IK',
  transform: 'Regra de transformar',
  caminho: 'Regra de caminho',
  fisica: 'Regra de física',
  driver: 'Regra de comando (driver)',
  darkColor: 'Cor escura (dark color)',
  blend: 'Modo de mistura de cor',
  deform: 'Animação de deformar malha',
  ordemDeDesenho: 'Troca de ordem de desenho',
  eventos: 'Eventos',
  parametros: 'Parâmetros',
  morphs: 'Morph targets',
  variaveis: 'Variáveis',
  tags: 'Tags',
  extensoes: 'Extensões',
  virada: 'Virada de corpo (body)',
  pesosAnimados: 'Pesos animados (weights)',
}

const RECURSO_DA_REGRA = {
  ik: 'ik',
  transform: 'transform',
  path: 'caminho',
  physics: 'fisica',
  driver: 'driver',
}

/** Timeline types (spec 9.1) that are worth naming in the summary. */
const RECURSO_DA_TRILHA = {
  deform: 'deform',
  sequence: 'sequencia',
  drawOrder: 'ordemDeDesenho',
  event: 'eventos',
  parameter: 'parametros',
  morph: 'morphs',
  variable: 'variaveis',
  tag: 'tags',
  nested: 'skeleton',
  body: 'virada',
  weights: 'pesosAnimados',
}

function contar(v) {
  return Array.isArray(v) ? v.length : 0
}

/**
 * Short description of what a skeleton file holds: the counts a person asks
 * for first, and the list of features the file actually uses.
 */
export function resumirEsqueleto(doc) {
  const recursos = new Set()
  const bones = Array.isArray(doc.bones) ? doc.bones : []
  const slots = Array.isArray(doc.slots) ? doc.slots : []
  const skins = Array.isArray(doc.skins) ? doc.skins : []
  const constraints = Array.isArray(doc.constraints) ? doc.constraints : []
  const animations = Array.isArray(doc.animations) ? doc.animations : []

  let anexos = 0
  for (const pele of skins) {
    const mapa = pele && typeof pele.attachments === 'object' && pele.attachments !== null ? pele.attachments : {}
    for (const porSlot of Object.values(mapa)) {
      if (porSlot === null || typeof porSlot !== 'object') continue
      for (const anexo of Object.values(porSlot)) {
        anexos++
        if (anexo === null || typeof anexo !== 'object') continue
        const t = typeof anexo.type === 'string' ? anexo.type : 'region'
        if (NOME_DO_RECURSO[t] !== undefined) recursos.add(t)
        if ((t === 'mesh' || t === 'linkedmesh') && Array.isArray(anexo.bones) && anexo.bones.length > 0) recursos.add('pesos')
        if (anexo.sequence !== undefined) recursos.add('sequencia')
      }
    }
  }

  for (const regra of constraints) {
    if (regra === null || typeof regra !== 'object') continue
    const nome = RECURSO_DA_REGRA[regra.type]
    if (nome !== undefined) recursos.add(nome)
  }

  for (const slot of slots) {
    if (slot === null || typeof slot !== 'object') continue
    if (slot.darkColor !== undefined) recursos.add('darkColor')
    if (slot.blend !== undefined && slot.blend !== 'normal') recursos.add('blend')
  }

  let chaves = 0
  let trilhas = 0
  let duracao = 0
  for (const animacao of animations) {
    if (animacao === null || typeof animacao !== 'object') continue
    duracao = Math.max(duracao, Number(animacao.duration) || 0)
    const linhas = Array.isArray(animacao.timelines) ? animacao.timelines : []
    trilhas += linhas.length
    for (const linha of linhas) {
      if (linha === null || typeof linha !== 'object') continue
      if (Array.isArray(linha.keys)) chaves += linha.keys.length
      const recurso = RECURSO_DA_TRILHA[linha.type]
      if (recurso !== undefined) recursos.add(recurso)
    }
  }

  if (contar(doc.events) > 0) recursos.add('eventos')
  if (contar(doc.parameters) > 0) recursos.add('parametros')
  if (contar(doc.morphs) > 0) recursos.add('morphs')
  if (contar(doc.variables) > 0) recursos.add('variaveis')
  if (contar(doc.tags) > 0) recursos.add('tags')
  if (contar(doc.extensionsUsed) > 0) recursos.add('extensoes')

  return {
    tipo: 'esqueleto',
    nome: (doc.skeleton && typeof doc.skeleton.name === 'string' ? doc.skeleton.name : '') || 'sem nome',
    versao: doc.bone && typeof doc.bone.version === 'string' ? doc.bone.version : '?',
    versaoMinima: doc.bone && typeof doc.bone.minVersion === 'string' ? doc.bone.minVersion : '?',
    programa: doc.bone && typeof doc.bone.generator === 'string' ? doc.bone.generator : 'não informado',
    contas: [
      ['Ossos', bones.length],
      ['Slots', slots.length],
      ['Peles', skins.length],
      ['Desenhos', anexos],
      ['Regras', constraints.length],
      ['Animações', animations.length],
      ['Trilhas', trilhas],
      ['Chaves', chaves],
    ],
    duracao,
    animacoes: animations.map(a => ({
      nome: a && typeof a.name === 'string' ? a.name : 'sem nome',
      duracao: Number(a?.duration) || 0,
      laco: a?.loop === true,
    })),
    atlases: Array.isArray(doc.assets?.atlases) ? doc.assets.atlases.slice() : [],
    // As animações que vêm de outro arquivo (2.8): o boneco as toca pelo nome.
    animacoesDeFora: Array.isArray(doc.assets?.animations) ? doc.assets.animations.filter(u => typeof u === 'string') : [],
    extensoes: Array.isArray(doc.extensionsUsed) ? doc.extensionsUsed.slice() : [],
    recursos: [...recursos],
  }
}

/** Short description of an atlas file. */
export function resumirAtlas(doc) {
  const pages = Array.isArray(doc.pages) ? doc.pages : []
  const regions = Array.isArray(doc.regions) ? doc.regions : []
  const recursos = new Set()
  let girados = 0
  let aparados = 0
  for (const r of regions) {
    if (r === null || typeof r !== 'object') continue
    if (r.rotation === 90) girados++
    if ((r.originalWidth ?? r.width) !== r.width || (r.originalHeight ?? r.height) !== r.height) aparados++
    if (Array.isArray(r.aliases) && r.aliases.length > 0) recursos.add('Apelidos de região')
  }
  if (girados > 0) recursos.add('Regiões giradas 90°')
  if (aparados > 0) recursos.add('Regiões aparadas (trim)')
  return {
    tipo: 'atlas',
    nome: pages.map(p => p?.name).filter(Boolean).join(', ') || 'sem nome',
    contas: [
      ['Páginas', pages.length],
      ['Regiões', regions.length],
      ['Giradas', girados],
      ['Aparadas', aparados],
    ],
    imagens: pages.map(p => (p && typeof p.image === 'string' ? p.image : '?')),
    recursos: [...recursos],
  }
}

/** Short description of a package manifest. */
export function resumirManifesto(doc) {
  return {
    tipo: 'manifesto',
    nome: typeof doc.main === 'string' ? doc.main : 'sem principal',
    contas: [
      ['Esqueletos', contar(doc.skeletons)],
      ['Atlas', contar(doc.atlases)],
      ['Imagens', contar(doc.images)],
    ],
    recursos: [],
  }
}

/** The summary for whichever of the three documents this is. */
export function resumirConteudo(doc, tipo) {
  if (tipo === 'atlas') return resumirAtlas(doc)
  if (tipo === 'manifesto') return resumirManifesto(doc)
  return resumirEsqueleto(doc)
}

/** One line saying how the file did, for the top of the page. */
export function frasePlacar(resultado) {
  const erros = resultado.problemas.filter(p => p.gravidade === 'erro').length
  const avisosN = resultado.problemas.filter(p => p.gravidade === 'aviso').length
  if (erros === 0 && avisosN === 0) return 'Arquivo válido. Nenhum problema.'
  if (erros === 0) return `Arquivo válido. ${avisosN} ${avisosN === 1 ? 'aviso' : 'avisos'}.`
  const parte = `${erros} ${erros === 1 ? 'erro' : 'erros'}`
  return avisosN === 0
    ? `Arquivo inválido. ${parte}.`
    : `Arquivo inválido. ${parte} e ${avisosN} ${avisosN === 1 ? 'aviso' : 'avisos'}.`
}
