# SPDX-License-Identifier: Apache-2.0
# Copiado de leitor-construct/src/recorte.ts (rodada G3, 05/10/2026). O runtime
# Python não desenha, então não tem corte: o modelo é o do leitor do Construct,
# que é provado contra o recorte do editor.
#
# O recorte por máscara (spec 7.7) feito NA CONTA. O Godot até tem
# `clip_children`, mas só pelo desenho do nó pai, e a máscara do `.bone` corta
# um trecho da ordem de desenho, não um nó. Então a peça cortada vira OUTROS
# triângulos: só o pedaço que fica. É a referência da própria spec: "decompor o
# polígono em partes convexas e recortar cada triângulo desenhado contra cada
# parte (Sutherland–Hodgman)".
#
#   - a máscara (pode ser côncava) vira triângulos, por orelhas;
#   - dentro: cada triângulo da peça é cortado contra cada triângulo da máscara;
#   - `invert` (fica o que está FORA): a peça perde, um a um, os triângulos da
#     máscara; cada perda se faz pelos lados do triângulo, em pedaços que não
#     se sobrepõem.
#
# O uv do vértice novo é a mistura linear do uv das pontas: dentro de um
# triângulo o uv é afim, então isto é exato.
#
# Diferenças do TypeScript: um vértice `V` é um Array [x, y, u, v]; uma
# máscara é um Dictionary {"triangulos": Array de Arrays de 6, "inverter": bool};
# `triangular_mascara` devolve null quando o polígono se cruza.
@tool
extends RefCounted

const AREA_MINIMA := 1e-9


## Área com sinal (positiva = anti-horário, com Y para cima).
static func area_com_sinal(p: Array) -> float:
	var a := 0.0
	var n := p.size() / 2
	for i in range(n):
		var j := (i + 1) % n
		a += p[i * 2] * p[j * 2 + 1] - p[j * 2] * p[i * 2 + 1]
	return a / 2


static func _cruz(ax: float, ay: float, bx: float, by: float, cx: float, cy: float) -> float:
	return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)


## O polígono em triângulos anti-horários, pelo corte de orelhas. Devolve null
## quando não dá (o polígono se cruza): quem chama avisa (regra 21).
static func triangular_mascara(poligono: Array):
	var n := poligono.size() / 2
	if se_cruza(poligono):
		return null
	var idx: Array = []
	for i in range(n):
		idx.append(i)
	if n < 3:
		return []
	if area_com_sinal(poligono) < 0:
		idx.reverse()
	var saida: Array = []
	var guarda := 0
	while idx.size() > 3:
		guarda += 1
		if guarda > n * n + 10:
			return null
		var achou := false
		for k in range(idx.size()):
			var a: int = idx[(k + idx.size() - 1) % idx.size()]
			var b: int = idx[k]
			var c: int = idx[(k + 1) % idx.size()]
			var giro := _cruz(poligono[a * 2], poligono[a * 2 + 1], poligono[b * 2], poligono[b * 2 + 1], poligono[c * 2], poligono[c * 2 + 1])
			if giro == 0:
				# Três pontos em linha: o do meio não faz canto, sai sem triângulo.
				idx.remove_at(k)
				achou = true
				break
			if giro < 0:
				continue  # canto côncavo: não é orelha
			var dentro := false
			for p in idx:
				if p == a or p == b or p == c:
					continue
				var px: float = poligono[p * 2]
				var py: float = poligono[p * 2 + 1]
				if _cruz(poligono[a * 2], poligono[a * 2 + 1], poligono[b * 2], poligono[b * 2 + 1], px, py) >= 0 \
						and _cruz(poligono[b * 2], poligono[b * 2 + 1], poligono[c * 2], poligono[c * 2 + 1], px, py) >= 0 \
						and _cruz(poligono[c * 2], poligono[c * 2 + 1], poligono[a * 2], poligono[a * 2 + 1], px, py) >= 0:
					dentro = true
					break
			if dentro:
				continue
			saida.append([poligono[a * 2], poligono[a * 2 + 1], poligono[b * 2], poligono[b * 2 + 1], poligono[c * 2], poligono[c * 2 + 1]])
			idx.remove_at(k)
			achou = true
			break
		if not achou:
			return null
	var a2: int = idx[0]
	var b2: int = idx[1]
	var c2: int = idx[2]
	if _cruz(poligono[a2 * 2], poligono[a2 * 2 + 1], poligono[b2 * 2], poligono[b2 * 2 + 1], poligono[c2 * 2], poligono[c2 * 2 + 1]) > 0:
		saida.append([poligono[a2 * 2], poligono[a2 * 2 + 1], poligono[b2 * 2], poligono[b2 * 2 + 1], poligono[c2 * 2], poligono[c2 * 2 + 1]])
	return saida


static func _sinal(v: float) -> int:
	return 1 if v > 0 else (-1 if v < 0 else 0)


## Dois lados não vizinhos do polígono se tocam? (7.7: "não pode se cruzar").
static func se_cruza(p: Array) -> bool:
	var n := p.size() / 2
	for i in range(n):
		var i2 := (i + 1) % n
		for j in range(i + 1, n):
			var j2 := (j + 1) % n
			if j == i2 or j2 == i:
				continue  # vizinhos dividem uma ponta
			var a := _sinal(_cruz(p[i * 2], p[i * 2 + 1], p[i2 * 2], p[i2 * 2 + 1], p[j * 2], p[j * 2 + 1]))
			var b := _sinal(_cruz(p[i * 2], p[i * 2 + 1], p[i2 * 2], p[i2 * 2 + 1], p[j2 * 2], p[j2 * 2 + 1]))
			var c := _sinal(_cruz(p[j * 2], p[j * 2 + 1], p[j2 * 2], p[j2 * 2 + 1], p[i * 2], p[i * 2 + 1]))
			var d := _sinal(_cruz(p[j * 2], p[j * 2 + 1], p[j2 * 2], p[j2 * 2 + 1], p[i2 * 2], p[i2 * 2 + 1]))
			if a * b < 0 and c * d < 0:
				return true
	return false


## Corta o polígono convexo `p` pelo lado ab: fica a esquerda ou a direita.
static func _meio_plano(p: Array, ax: float, ay: float, bx: float, by: float, esquerda: bool) -> Array:
	var saida: Array = []
	for i in range(p.size()):
		var cur: Array = p[i]
		var prox: Array = p[(i + 1) % p.size()]
		var dc := _cruz(ax, ay, bx, by, cur[0], cur[1])
		var dp := _cruz(ax, ay, bx, by, prox[0], prox[1])
		if not esquerda:
			dc = -dc
			dp = -dp
		if dc >= 0:
			saida.append(cur)
		if (dc >= 0) != (dp >= 0):
			var t := dc / (dc - dp)
			saida.append([
				cur[0] + (prox[0] - cur[0]) * t, cur[1] + (prox[1] - cur[1]) * t,
				cur[2] + (prox[2] - cur[2]) * t, cur[3] + (prox[3] - cur[3]) * t,
			])
	return saida


static func _area_v(p: Array) -> float:
	var a := 0.0
	for i in range(p.size()):
		var j := (i + 1) % p.size()
		a += p[i][0] * p[j][1] - p[j][0] * p[i][1]
	return a / 2


static func _lados(t: Array) -> Array:
	return [[t[0], t[1], t[2], t[3]], [t[2], t[3], t[4], t[5]], [t[4], t[5], t[0], t[1]]]


## Os pedaços de `p` (convexo) que ficam com a máscara `m`.
static func _cortar_poligono(p: Array, m: Dictionary) -> Array:
	if not m["inverter"]:
		var saida: Array = []
		for t in m["triangulos"]:
			var q := p
			for l in _lados(t):
				q = _meio_plano(q, l[0], l[1], l[2], l[3], true)
				if q.size() < 3:
					break
			if q.size() >= 3 and absf(_area_v(q)) > AREA_MINIMA:
				saida.append(q)
		return saida
	# Fora da máscara: tira-se um triângulo dela de cada vez.
	var pedacos: Array = [p]
	for t in m["triangulos"]:
		var proximos: Array = []
		for pedaco in pedacos:
			var resto: Array = pedaco
			for l in _lados(t):
				var fora := _meio_plano(resto, l[0], l[1], l[2], l[3], false)
				if fora.size() >= 3 and absf(_area_v(fora)) > AREA_MINIMA:
					proximos.append(fora)
				resto = _meio_plano(resto, l[0], l[1], l[2], l[3], true)
				if resto.size() < 3:
					break
			# o que sobrou em `resto` está dentro do triângulo da máscara: some
		pedacos = proximos
	return pedacos


## Corta uma peça (os triângulos dela, com uv) por todas as máscaras, na ordem.
## Sem máscara, devolve a peça como veio. Devolve {"mundo", "uvs", "triangulos"}.
static func cortar_peca(mundo: Array, uvs: Array, triangulos: Array, mascaras: Array) -> Dictionary:
	if mascaras.is_empty():
		return {"mundo": mundo.duplicate(), "uvs": uvs.duplicate(), "triangulos": triangulos.duplicate()}
	var poligonos: Array = []
	var k := 0
	while k + 2 < triangulos.size():
		var tri: Array = []
		for o in range(3):
			var i: int = triangulos[k + o]
			tri.append([mundo[i * 2], mundo[i * 2 + 1], uvs[i * 2], uvs[i * 2 + 1]])
		k += 3
		var a := _area_v(tri)
		if absf(a) <= AREA_MINIMA:
			continue
		if a < 0:
			tri = [tri[0], tri[2], tri[1]]
		poligonos.append(tri)
	for m in mascaras:
		var proximos: Array = []
		for p in poligonos:
			proximos.append_array(_cortar_poligono(p, m))
		poligonos = proximos

	var m2: Array = []
	var u2: Array = []
	var t2: Array = []
	var v := 0
	for p in poligonos:
		for q in p:
			m2.append(q[0])
			m2.append(q[1])
			u2.append(q[2])
			u2.append(q[3])
		for i in range(1, p.size() - 1):
			t2.append(v)
			t2.append(v + i)
			t2.append(v + i + 1)
		v += p.size()
	return {"mundo": m2, "uvs": u2, "triangulos": t2}
