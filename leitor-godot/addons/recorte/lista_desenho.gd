# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/draw_list.py (rodada G5, 05/10/2026).
#
# O que se desenha num quadro, em ordem (7.13), aberto filho a filho.
#
# A lista de um esqueleto `S` tem três grupos, desenhados nesta ordem (7.11):
#
#     lista(S) = atras(S) ++ meio(S) ++ frente(S)
#
# Uma volta pela ordem de desenho atual de `S`, com a máscara de 7.7:
#
# - uma peça comum vai para o fim de `meio`;
# - um `skeleton` sem `around` põe a lista inteira do filho no fim de `meio`
#   — um bloco, cortado pela máscara de `S` como qualquer peça;
# - um `skeleton` com `around = m` corta a lista do filho no slot `m` (pela
#   posição de `m` na ordem do filho no instante): o que vem antes vai para o
#   COMEÇO de `atras(S)`, o que vem depois para o FIM de `frente(S)`. O slot
#   `m` não é desenhado, e a máscara de `S` não corta nada dele: ele já não
#   está naquele trecho da ordem.
#
# Pôr o "antes" no começo é a cebola de 7.11: o slot mais alto na ordem de `S`
# abraça o mais baixo, dos dois lados.
#
# Cada peça leva as máscaras dela, de fora para dentro (12.4, canal
# `drawList`). A máscara do filho se resolve na volta do próprio filho, antes
# do corte, e cada peça leva a sua para o grupo em que cai (caso C-318).
#
# Diferença que o GDScript obriga: a tupla (nome, máscaras) vira Array
# [nome, Array de máscaras]; a de `meio`, [slot de S, peça].
@tool
extends RefCounted

const C := preload("carregador.gd")


## As peças de `skeleton` como vão para a tela (7.13, 12.4): [nome, máscaras].
static func draw_list(skeleton, prefix: String = "") -> Array:
	var g := _groups(skeleton, prefix)
	var out: Array = g[0].duplicate()
	for m in g[1]:
		out.append(m[1])
	out.append_array(g[2])
	return out


## O filho vivo que `slot` mostra, ou null (filho não carregado: nada entra).
static func _instance(skeleton, slot, attachment):
	var instance = skeleton.nested_pool.get(slot.name)
	if instance == null or instance.resolved != attachment.resolved:
		return null
	return instance.skeleton


## [atras, meio, frente]. `meio` guarda, para cada peça, o slot de `S` de onde
## ela veio: é contra ele que um corte um nível acima mede "antes" e "depois".
static func _groups(skeleton, prefix: String) -> Array:
	var behind: Array = []
	var middle: Array = []
	var front: Array = []

	var clip = null
	var clip_name := ""
	for slot in skeleton.ordered_slots():
		var attachment = skeleton.attachment_for(slot)[0]
		if attachment == null or not slot.visible:
			continue
		if attachment is C.ClippingAttachment:
			# Uma máscara nova troca a velha (7.7).
			clip = attachment
			clip_name = "%s%s/%s" % [prefix, slot.name, attachment.name]
			continue
		var cut: bool = clip != null and (clip.slots == null or clip.slots.has(slot.name))
		var outer: Array = [clip_name] if cut else []

		if attachment is C.RegionAttachment or attachment is C.MeshAttachment:
			middle.append([slot.name, ["%s%s/%s" % [prefix, slot.name, attachment.name], outer]])
		elif attachment is C.ParticleAttachment:
			# Uma entrada por emissor (12.4). Emissor de forma desconhecida não
			# é desenhado (2.5, a linha do `BONE_particle.shape`), então não entra.
			if attachment.shape_ok:
				middle.append([slot.name, ["%s%s/%s" % [prefix, slot.name, attachment.name], outer]])
		elif attachment is C.SkeletonAttachment:
			var child = _instance(skeleton, slot, attachment)
			if child != null:
				var child_prefix := "%s%s/" % [prefix, slot.name]
				var cg := _groups(child, child_prefix)
				var mark = attachment.around
				if mark != null and not child.slot_by_name.has(mark):
					# 2.5: um slot que o filho não tem — em bloco, como sem o
					# campo, e um aviso uma vez. Nunca um palpite.
					skeleton.warn_once(
						"AROUND_SLOT_MISSING: o slot \"%s\" não existe no filho do slot \"%s\"; o filho é desenhado em bloco (7.11, 2.5)" % [mark, slot.name])
					mark = null
				if mark == null:
					var whole: Array = cg[0].duplicate()
					for m in cg[1]:
						whole.append(m[1])
					whole.append_array(cg[2])
					for piece in whole:
						middle.append([slot.name, [piece[0], outer + piece[1]]])
				else:
					# Pela posição de `m` na ordem do filho no instante. Vazio,
					# escondido ou trocado, o slot guarda o lugar (C-317).
					var position := {}
					var ordered: Array = child.ordered_slots()
					for i in range(ordered.size()):
						position[ordered[i].name] = i
					var at: int = position[mark]
					var before: Array = cg[0].duplicate()
					var after: Array = []
					for m in cg[1]:
						if position[m[0]] < at:
							before.append(m[1])
						elif position[m[0]] > at:
							after.append(m[1])
					after.append_array(cg[2])
					behind = before + behind
					front = front + after
		# O resto (point, boundingbox, path, desconhecido) não desenha nada.

		if clip != null and clip.slots == null and slot.name == clip.end:
			clip = null
	return [behind, middle, front]
