# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/particles.py (rodada G7, 05/10/2026).
#
# A extensão `BONE_particles`, módulo P, primeira fase. A regra que o arquivo
# inteiro obedece: **uma partícula é função pura do tempo**. Nasce num instante
# que a taxa calcula, o acaso dela vem de uma semente fixa, e a posição é
# aritmética sobre a idade. Arrastar a linha do tempo para trás mostra o mesmo
# quadro, bit a bit — nada se guarda de um quadro para o outro, nunca.
#
# Diferenças que o GDScript obriga:
#   - o `int` do GDScript é de 64 bits com sinal: as contas de 32 bits do PCG
#     cabem nele, e a máscara `& MASK32` faz o resto, como no Python;
#   - não há `math.expm1`: `_expm1` usa a conta de Kahan (exp, e a correção
#     pelo log), que guarda os dígitos pequenos como o expm1;
#   - o `%` do Python em número negativo vira `fposmod`/`posmod`;
#   - `sorted(key=...)` vira `sort_custom` com a chave inteira mais a posição
#     de antes no desempate (o `sort_custom` não é estável);
#   - `Campos.__getattr__` vira `Campos.g(nome)`;
#   - o par e o trio do Python viram Array de float.
#
# A forma `path` (1.1 da extensão, §9.4.2) veio na rodada G9, copiada do
# `particles.py` de 05/10/2026: `ler_curve`, `poligonal_do_caminho`,
# `ponto_no_caminho`, `_caminho_de`, `_p0_no_caminho`.
#
# DESVIO DO PYTHON, de propósito, pela spec (§9.4.2 passo 7 e §7.2, a linha
# de `"world"`): o ponto da MALHA e o do CAMINHO nascem no espaço do
# esqueleto e voltam ao referencial do emissor pela inversa de M_emissor(t_i)
# NOS DOIS ESPAÇOS; daí em diante são um `p0` como o de qualquer forma. O
# Python de 05/10 só faz a volta em `local`: no caminho em `world` ele chega
# ao mesmo número por outro lado (não leva ao esqueleto de novo, e mede o
# `spherize` no ponto trazido de volta); na MALHA em `world` ele leva o ponto
# ao esqueleto duas vezes. Nenhum caso da suíte tem malha em `world`: quem
# prova é o teste `G9: malha em world` de `testes.gd`, com a conta à mão.
@tool
extends RefCounted

const C := preload("carregador.gd")
const E := preload("esqueleto.gd")
const A := preload("animacao.gd")

# ---------------------------------------------------------------------------
# 3.2 O hash: PCG, 32 bits
# ---------------------------------------------------------------------------

const MASK32 := 0xFFFFFFFF


## O PCG de 32 bits de Jarzynski e Olano (JCGT 2020), como 3.2 o escreve.
static func pcg(value: int) -> int:
	value &= MASK32
	var state := (value * 747796405 + 2891336453) & MASK32
	var word := (((state >> ((state >> 28) + 4)) ^ state) * 277803737) & MASK32
	return ((word >> 22) ^ word) & MASK32


## `u` em [0, 1) para um canal de uma partícula (3.2). Índice negativo entra
## como complemento de dois em 32 bits (`& MASK32`); o pré-aquecimento de 6
## depende disso. O último passo guarda 24 bits: exato em float32.
static func acaso(seed: int, flow: int, index: int, channel: int) -> float:
	var h := pcg(seed)
	h = pcg(h ^ (flow & MASK32))
	h = pcg(h ^ (index & MASK32))
	h = pcg(h ^ (channel & MASK32))
	return (h >> 8) / 16777216.0


# 3.3 A tabela de canais é CONGELADA: um número de canal nunca muda de sentido.
const CANAL_LIFETIME := 0
const CANAL_SPEED := 1
const CANAL_SPREAD := 2
const CANAL_SHAPE_1 := 3
const CANAL_SHAPE_2 := 4
const CANAL_ANGLE := 5
const CANAL_ANGULAR := 6
const CANAL_SCALE := 7
const CANAL_START_COLOR := 8
const CANAL_START_FRAME := 9
const CANAL_RANDOMNESS := 10
const CANAL_PROBABILITY := 11
const CANAL_MESH := 12
# 13-15 reservados (ruído, 2a fase). Este leitor não os toca.


## Um campo `[min, max]`: `min + (max - min) * u` (3.3).
static func faixa(minimum: float, maximum: float, u: float) -> float:
	return minimum + (maximum - minimum) * u


# ---------------------------------------------------------------------------
# 4 Quando uma partícula nasce
# ---------------------------------------------------------------------------

## A identidade de uma partícula e o instante do nascimento: 3.1 e 4 inteiros.
class Birth:
	var flow := 0
	var index := 0
	var birth := 0.0

	func _init(flow_: int, index_: int, birth_: float) -> void:
		flow = flow_
		index = index_
		birth = birth_


## Os trechos de taxa efetiva desde a origem `o = startDelay` (4.2).
##
## **O nascimento do índice `i` é o instante em que `E(t) = i` — o INVERSO da
## integral, nunca uma soma aplicada depois.** Um trecho com `emitting` falso
## tem taxa 0, área zero, e **não consome índice**.
class Trechos:
	var origem := 0.0
	var inicios: Array = []
	var taxas: Array = []
	var acumulado: Array = []
	var r0 := 0.0

	func _init(emitter, timelines, ate: float) -> void:
		origem = emitter.start_delay
		# 4.2: taxa negativa vira 0 NA CHAVE, antes de integrar.
		var rate := maxf(0.0, emitter.rate)
		var timeline = timelines.get("emitting") if timelines != null else null

		var cortes: Array = [origem]
		if timeline != null:
			for key in timeline.keys:
				if key.time > origem and key.time > cortes[-1]:
					cortes.append(key.time)
				if key.time > ate:
					break

		inicios = cortes
		taxas = []
		for inicio in cortes:
			taxas.append(rate if emitting_at(emitter, timelines, inicio) else 0.0)
		# E_k: as áreas dos trechos 0..k-1, somadas nesta ordem, em float64. É a
		# ÚNICA acumulação que a spec deixa — por chave, nunca por quadro (3.4).
		acumulado = [0.0]
		for k in range(1, cortes.size()):
			var largura: float = cortes[k] - cortes[k - 1]
			acumulado.append(acumulado[k - 1] + taxas[k - 1] * largura)
		# 4.2 + 9.10 da spec: antes da primeira chave vale a primeira, então o
		# pré-aquecimento de 6 tem taxa conhecida.
		r0 = taxas[0]

	## `emitting` lido no relógio do ESQUELETO, sem desconto (4.1). O
	## `startDelay` desloca NASCIMENTOS, não CHAVES. (`_emitting_at` solta no
	## Python; aqui dentro da classe que o usa.)
	static func emitting_at(emitter, timelines, t: float) -> bool:
		var timeline = timelines.get("emitting") if timelines != null else null
		if timeline == null:
			return emitter.emitting
		return bool(A.evaluate_keys(timeline.keys, t))

	## Quantos nascimentos houve até `t`, contados da origem.
	func E(t: float) -> float:
		if t <= origem:
			return 0.0
		var k := inicios.size() - 1
		while k > 0 and inicios[k] > t:
			k -= 1
		return acumulado[k] + taxas[k] * (t - inicios[k])

	## O instante do esqueleto em que `E(t) = index` (4.2), ou `INF`. Índice
	## negativo é o pré-aquecimento de 6: `t_cont = o + i / r0`.
	func instante(index: int) -> float:
		if index < 0:
			if r0 <= 0:
				return -INF
			return origem + index / r0
		for k in range(inicios.size()):
			var taxa: float = taxas[k]
			if taxa <= 0:
				continue
			var fim: float = acumulado[k + 1] if k + 1 < acumulado.size() else INF
			if index < fim or k + 1 == inicios.size():
				return inicios[k] + (index - acumulado[k]) / taxa
		return INF

	## `E` no fim: quantos o último trecho ainda vai alcançar.
	func total() -> float:
		return INF if taxas[-1] > 0 else acumulado[-1]


## 4.2 + 4.4: quando nasce a partícula contínua `index`.
static func _birth_of_index(emitter, trechos, index: int) -> float:
	var t_cont: float = trechos.instante(index)
	if not is_finite(t_cont):
		return INF

	var explosiveness: float = emitter.explosiveness
	if explosiveness != 0 and emitter.duration > 0:
		# A janela do `explosiveness` é `duration`, nunca a da animação.
		var inicio: float = floor(t_cont / emitter.duration) * emitter.duration
		t_cont = inicio + (1 - explosiveness) * (t_cont - inicio)

	if emitter.randomness != 0:
		# O tremor fica DENTRO da vaga da própria partícula: a ordem dos
		# nascimentos nunca muda. Com taxa local 0 não há vaga onde tremer.
		var taxa: float = trechos.taxas[0] if trechos.taxas.size() == 1 else maxf(0.0, emitter.rate)
		if taxa > 0:
			t_cont += emitter.randomness * acaso(emitter.seed, 0, index, CANAL_RANDOMNESS) / taxa
	return t_cont


## Todo nascimento contínuo (fluxo 0) que ainda pode estar vivo em `t` (5, 6).
static func continuous_births(emitter, timelines, t: float, duration: float, _loop: bool) -> Array:
	if emitter.rate <= 0:
		return []
	var life_max: float = emitter.lifetime[1]
	if life_max <= 0:
		return []

	var em_laco: bool = emitter.looping and duration > 0
	var ate: float = duration if em_laco else maxf(t, emitter.start_delay)
	var trechos := Trechos.new(emitter, timelines, ate)

	var births: Array = []
	if em_laco:
		# 6: uma volta traz os índices `0 <= i < E(D)`, e a volta de antes é a
		# MESMA lista com `t_i` deslocado de -D. O acaso NÃO inclui o número da
		# volta.
		var por_volta := int(floor(trechos.E(duration) + 1e-9))
		if por_volta <= 0:
			return []
		var voltas := int(floor(life_max / duration)) + 2
		for lap in range(voltas + 1):
			var shift: float = lap * duration
			for index in range(0, por_volta):
				var instante := _birth_of_index(emitter, trechos, index) - shift
				if instante > t or instante <= t - life_max:
					continue
				births.append(Birth.new(0, index, instante))
	else:
		# 6: sem laço os nascimentos são os de `[-prewarm, t]`. Os índices do
		# pré-aquecimento são NEGATIVOS, e o hash os aceita (3.2). O `prewarm`
		# conta para trás a partir da origem do emissor, o `startDelay`.
		var ultimo := minf(trechos.E(t), trechos.total())
		# 5: candidatos de `ceil(E(t - lifetime.max)) - 1` a `floor(E(t)) + 1`.
		var primeiro := int(ceil(trechos.E(t - life_max))) - 1
		if trechos.r0 > 0:
			primeiro = mini(primeiro, -int(ceil(emitter.prewarm * trechos.r0)) - 1)
		else:
			primeiro = maxi(primeiro, 0)
		for index in range(primeiro, int(floor(ultimo)) + 2):
			var instante := _birth_of_index(emitter, trechos, index)
			if instante > t or instante < emitter.start_delay - emitter.prewarm:
				continue
			if instante <= t - life_max:
				continue
			births.append(Birth.new(0, index, instante))
	return births


## 4.3 + 6: toda partícula de rajada que ainda pode estar viva em `t`. A rajada
## `b` nasce no fluxo `1 + b`, e `probability` se sorteia POR PARTÍCULA no canal
## 11. **A rajada volta também nas voltas de trás**, e **uma volta leva só os
## ciclos cujo instante cai em `[0, D)`**; os que ficam de fora se avisam.
static func burst_births(emitter, t: float, duration: float = 0.0, loop: bool = false, avisar = null) -> Array:
	var life_max: float = emitter.lifetime[1]
	var em_laco := loop and duration > 0
	var voltas := 0
	if em_laco:
		# 6: quantas voltas para trás ainda chegam na janela de 5.
		voltas = int(floor(life_max / duration)) + 2

	var births: Array = []
	for b in range(emitter.bursts.size()):
		var burst = emitter.bursts[b]
		var flow := 1 + b
		var fora := 0
		for cycle in range(burst.cycles):
			var instant: float = emitter.start_delay + burst.time + cycle * burst.interval
			if em_laco and not (0 <= instant and instant < duration):
				fora += 1
				continue
			var nascidas: Array = []
			for j in range(burst.count):
				var idx: int = cycle * burst.count + j
				if acaso(emitter.seed, flow, idx, CANAL_PROBABILITY) < burst.probability:
					nascidas.append(idx)
			for lap in range(voltas + 1):
				var quando: float = instant - lap * duration if em_laco else instant
				if quando > t or quando <= t - life_max:
					continue
				# O acaso NÃO inclui o número da volta (6).
				for index in nascidas:
					births.append(Birth.new(flow, index, quando))
		if fora > 0 and avisar != null:
			avisar.call("BURST_OUT_OF_LAP: a rajada %d tem %d ciclo(s) fora da volta (duracao %s); no laco a volta leva so os de [0, D) (4.3, 6)" % [b, fora, C._str(duration)])
	return births


# ---------------------------------------------------------------------------
# 8 Onde ela está: a forma fechada
# ---------------------------------------------------------------------------

# 3.6 da spec. Um runtime **DEVE** usar exatamente este número.
const LIMIAR_ARRASTO := 0.00001


## `expm1(x)`: `e^x - 1` sem perder os dígitos pequenos quando `x` é pequeno.
## O GDScript não tem; esta é a conta de Kahan (exata a poucos ulp).
static func _expm1(x: float) -> float:
	var u := exp(x)
	if u == 1.0:
		return x
	var um := u - 1.0
	if um == -1.0:
		return -1.0
	return um * x / log(u)


## `p(a)` e `v(a)` de 8, para `v' = g - k*v`. Aritmética sobre a idade, nunca
## soma de passos (3.4). Devolve [[px, py], [vx, vy]].
static func posicao(p0: Array, v0: Array, g: Array, k: float, age: float) -> Array:
	if k < LIMIAR_ARRASTO:
		return [[p0[0] + v0[0] * age + 0.5 * g[0] * age * age,
				p0[1] + v0[1] * age + 0.5 * g[1] * age * age],
			[v0[0] + g[0] * age, v0[1] + g[1] * age]]
	var f := -_expm1(-k * age) / k
	var decay := exp(-k * age)
	var gx: float = g[0] / k
	var gy: float = g[1] / k
	return [[p0[0] + gx * age + (v0[0] - gx) * f, p0[1] + gy * age + (v0[1] - gy) * f],
		[gx + (v0[0] - gx) * decay, gy + (v0[1] - gy) * decay]]


## Mistura dois ângulos pelo caminho CURTO (9.3, `spherizeDirection`).
static func mistura_de_angulos(a: float, b: float, amount: float) -> float:
	if amount == 0:
		return a
	var delta := fposmod(b - a + 180, 360) - 180
	return a + delta * amount


# ---------------------------------------------------------------------------
# 9 Os campos, lidos no instante do nascimento
# ---------------------------------------------------------------------------

const _CAMPOS_N := {
	"speed": "speed", "direction": "direction", "spread": "spread",
	"radius": "radius", "radiusThickness": "radius_thickness", "arc": "arc",
	"size": "size", "edge": "edge", "gravity": "gravity", "drag": "drag",
	"angle": "angle", "angularVelocity": "angular_velocity",
	"scale": "scale", "startColor": "start_color", "startFrame": "start_frame",
}


## Os campos do emissor como a partícula `i` os viu ao nascer (9). Campo sem
## timeline é o número do anexo; com timeline, ela lida em `t_i`, nunca em `t`.
class Campos:
	var _emitter
	var _values := {}

	func _init(emitter, timelines, birth: float) -> void:
		_emitter = emitter
		if timelines == null or timelines.is_empty():
			return
		for name in _CAMPOS_N:
			var timeline = timelines.get(name)
			if timeline == null:
				continue
			var value = A.evaluate_keys(timeline.keys, birth, timeline.components)
			if value != null:
				_values[_CAMPOS_N[name]] = value

	func g(name: String):
		if _values.has(name):
			return _values[name]
		return _emitter.get(name)


## 9.4: onde, dentro da forma do emissor, a partícula nasce. Só os canais 3 e 4
## (e o 12 na malha). Devolve [x, y].
## `caminho` é o `p0` de `shape: "path"`, já achado no caminho em `t_i` e já
## no referencial do emissor (9.4.2): ele precisa da pose do nascimento, que
## só o `vivas` tem.
static func ponto_da_forma(emitter, campos, flow: int, index: int, bone_length: float, malha,
		caminho = null) -> Array:
	if emitter.shape == "path":
		return caminho if caminho != null else [0.0, 0.0]
	var seed: int = emitter.seed
	var u3 := acaso(seed, flow, index, CANAL_SHAPE_1)
	var u4 := acaso(seed, flow, index, CANAL_SHAPE_2)
	var shape: String = emitter.shape

	if shape == "point":
		return [0.0, 0.0]

	if shape == "circle":
		# Uniforme na ÁREA: a raiz quadrada não deixa o meio lotar.
		var inner: float = 1.0 - campos.g("radius_thickness")
		var r: float = campos.g("radius") * sqrt(inner * inner + u3 * (1 - inner * inner))
		var phi := deg_to_rad(u4 * campos.g("arc"))
		return [r * cos(phi), r * sin(phi)]

	if shape == "rectangle":
		var size: Array = campos.g("size")
		return [(u3 - 0.5) * size[0], (u4 - 0.5) * size[1]]

	if shape == "edge":
		var e: Array = campos.g("edge")
		return [e[0] + (e[2] - e[0]) * u3, e[1] + (e[3] - e[1]) * u3]

	if shape == "bone":
		# 9.4: o `edge` de (0, 0) a (comprimento, 0) do próprio osso.
		return [bone_length * u3, 0.0]

	if shape == "mesh":
		return ponto_da_malha(emitter, flow, index, u3, u4, malha)

	# Forma desconhecida nunca chega aqui: o emissor não se desenha (7.4).
	return [0.0, 0.0]


## 9.4 `shape: "mesh"`: um ponto numa malha do mesmo slot, deformada em `t_i`.
## `malha` é [vértices, triângulos], já posada.
static func ponto_da_malha(emitter, flow: int, index: int, u3: float, u4: float, malha) -> Array:
	if malha == null:
		return [0.0, 0.0]
	var vertices: Array = malha[0]
	var triangles: Array = malha[1]
	var count := int(vertices.size() / 2)
	if count == 0:
		return [0.0, 0.0]
	var u12 := acaso(emitter.seed, flow, index, CANAL_MESH)
	var mode: String = emitter.mesh_mode

	if mode == "triangle" and triangles.size() >= 3:
		var faces := int(triangles.size() / 3)
		var acumulada: Array = []
		var total := 0.0
		for f in range(faces):
			var a := _vertice(vertices, triangles[3 * f])
			var b := _vertice(vertices, triangles[3 * f + 1])
			var c := _vertice(vertices, triangles[3 * f + 2])
			total += absf((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2
			acumulada.append(total)
		if total <= 0:
			return _vertice(vertices, triangles[0])
		var alvo := u12 * total
		var face := 0
		while face < faces - 1 and acumulada[face] <= alvo:
			face += 1
		var a2 := _vertice(vertices, triangles[3 * face])
		var b2 := _vertice(vertices, triangles[3 * face + 1])
		var c2 := _vertice(vertices, triangles[3 * face + 2])
		var s := u3
		var w := u4
		if s + w > 1:  # dobrado de volta para dentro do triângulo
			s = 1 - s
			w = 1 - w
		return [a2[0] + s * (b2[0] - a2[0]) + w * (c2[0] - a2[0]),
			a2[1] + s * (b2[1] - a2[1]) + w * (c2[1] - a2[1])]

	if mode == "edge" and triangles.size() >= 3:
		var arestas := arestas_unicas(triangles)
		if not arestas.is_empty():
			var ar: Array = arestas[mini(int(u12 * arestas.size()), arestas.size() - 1)]
			var pa := _vertice(vertices, ar[0])
			var pb := _vertice(vertices, ar[1])
			return [pa[0] + (pb[0] - pa[0]) * u3, pa[1] + (pb[1] - pa[1]) * u3]

	# 9.4.1 `vertex`: `v = floor(u12 * N)`.
	return _vertice(vertices, mini(int(u12 * count), count - 1))


static func _vertice(vertices: Array, i: int) -> Array:
	return [vertices[2 * i], vertices[2 * i + 1]]


## 9.4.1: as arestas únicas DA TRIANGULAÇÃO, `(a, b)` com `a < b`, sem repetir,
## **em ordem crescente do par**. A ordem é normativa: é ela que
## `floor(u12 * M)` indexa.
static func arestas_unicas(triangles: Array) -> Array:
	var vistas := {}
	for f in range(int(triangles.size() / 3)):
		var t0: int = triangles[3 * f]
		var t1: int = triangles[3 * f + 1]
		var t2: int = triangles[3 * f + 2]
		for par in [[t0, t1], [t1, t2], [t2, t0]]:
			var a: int = par[0]
			var b: int = par[1]
			var par_certo: Array = [a, b] if a < b else [b, a]
			vistas["%d,%d" % [par_certo[0], par_certo[1]]] = par_certo
	var out: Array = vistas.values()
	out.sort_custom(func(x, y): return x[0] < y[0] or (x[0] == y[0] and x[1] < y[1]))
	return out


# ---------------------------------------------------------------------------
# Uma partícula, num instante
# ---------------------------------------------------------------------------

## O que 14.1 mede, mais a cor e o quadro de 9.7 e 9.8. Feita de
## (arquivo, animação, t) e mais nada.
class Particle:
	var flow := 0
	var index := 0
	var birth := 0.0
	var life := 0.0
	var age := 0.0
	var x := 0.0
	var y := 0.0
	var angle := 0.0
	var scale := 1.0
	var color: Array = [1.0, 1.0, 1.0, 1.0]
	var frame := 0

	func _init(flow_: int, index_: int, birth_: float, life_: float, age_: float) -> void:
		flow = flow_
		index = index_
		birth = birth_
		life = life_
		age = age_


## `life_i`, canal 0 (9.2). Não é animável: `lifetime.max` é a janela.
static func vida_de(emitter, flow: int, index: int) -> float:
	return faixa(emitter.lifetime[0], emitter.lifetime[1], acaso(emitter.seed, flow, index, CANAL_LIFETIME))


## As curvas sobre a vida (9.6, 9.7): 9.2-9.3 da spec, com `time` em 0..1.
static func _curva_da_vida(keys, fraction: float, default_value, components: int = 1):
	if keys == null or keys.is_empty():
		return default_value
	var value = A.evaluate_keys(keys, fraction, components)
	return default_value if value == null else value


## Uma partícula em `t`, no espaço do ESQUELETO: 8, 9 e 7.2 juntos. `frame` é a
## matriz do slot em `t`, e `frame_ti` a de `t_i`.
static func avaliar(emitter, campos, flow: int, index: int, birth: float, life: float,
		age: float, frame, frame_ti, bone_length: float, malha, frames: int, caminho = null) -> Particle:
	var seed: int = emitter.seed
	# 9.4.2 passo 7: o `p0` de toda forma está no referencial do emissor —
	# também o da malha e o do caminho, já trazidos de volta no `vivas`. O
	# `spherizeDirection` mede a partir da origem do emissor, nos dois espaços.
	var p0 := ponto_da_forma(emitter, campos, flow, index, bone_length, malha, caminho)

	# 9.3: a velocidade escalar, e a direção à parte.
	var spd: Array = campos.g("speed")
	var speed := faixa(spd[0], spd[1], acaso(seed, flow, index, CANAL_SPEED))
	var base: float = campos.g("direction")
	if campos.g("spherize_direction") != 0 and (p0[0] != 0.0 or p0[1] != 0.0):
		var fora := rad_to_deg(atan2(p0[1], p0[0]))
		base = mistura_de_angulos(base, fora, campos.g("spherize_direction"))
	var theta: float = base + campos.g("spread") * (2 * acaso(seed, flow, index, CANAL_SPREAD) - 1)
	var v0: Array = [speed * cos(deg_to_rad(theta)), speed * sin(deg_to_rad(theta))]

	var gv: Array = campos.g("gravity")
	var g: Array = [gv[0], gv[1]]
	var k: float = campos.g("drag")

	var usado
	if emitter.space == "world":
		# 7.2: `p0` e `v0` vão ao espaço do esqueleto pela matriz em `t_i`.
		p0 = frame_ti.local_to_world(p0[0], p0[1])
		v0 = [frame_ti.a * v0[0] + frame_ti.b * v0[1], frame_ti.c * v0[0] + frame_ti.d * v0[1]]
		usado = frame_ti
	else:
		usado = frame

	var pv := posicao(p0, v0, g, k, age)
	var p: Array = pv[0]
	var v: Array = pv[1]

	var particle := Particle.new(flow, index, birth, life, age)
	if emitter.space == "world":
		particle.x = p[0]
		particle.y = p[1]
	else:
		# `local`: a posição desenhada é `p(a)` pela matriz do osso em `t`.
		var w: Array = frame.local_to_world(p[0], p[1])
		particle.x = w[0]
		particle.y = w[1]

	# 9.6: o ângulo sai COMO É, nunca dobrado para -180..180 (14.1).
	var ang: Array = campos.g("angle")
	var angle_i := faixa(ang[0], ang[1], acaso(seed, flow, index, CANAL_ANGLE))
	var angv: Array = campos.g("angular_velocity")
	var angular := faixa(angv[0], angv[1], acaso(seed, flow, index, CANAL_ANGULAR))
	var theta_a := angle_i + angular * age
	if emitter.align_to_velocity:
		theta_a += rad_to_deg(atan2(v[1], v[0]))
	particle.angle = theta_a + rotacao_de(usado)

	var fraction := age / life if life > 0 else 0.0
	var sc: Array = campos.g("scale")
	var scale_i := faixa(sc[0], sc[1], acaso(seed, flow, index, CANAL_SCALE))
	scale_i *= float(_curva_da_vida(emitter.scale_over_lifetime, fraction, 1.0))
	particle.scale = scale_i * escala_de(usado)

	# 9.7: UM `u` para os quatro componentes, depois o gradiente sobre a vida.
	var u8 := acaso(seed, flow, index, CANAL_START_COLOR)
	var sc_cor: Array = campos.g("start_color")
	var c1: Array = sc_cor[0]
	var c2: Array = sc_cor[1]
	var color: Array = []
	for i in range(4):
		color.append(faixa(c1[i], c2[i], u8))
	var gradient = _curva_da_vida(emitter.color_over_lifetime, fraction, null, 4)
	if gradient != null:
		for i in range(4):
			color[i] = color[i] * float(gradient[i])
	var alpha = _curva_da_vida(emitter.alpha_over_lifetime, fraction, null)
	if alpha != null:
		color[3] *= float(alpha)
	particle.color = color

	particle.frame = quadro(emitter, campos, flow, index, age, fraction, frames)
	return particle


## 9.8: que quadro da folha a partícula mostra. A guarda `+ 0.00001` é a de 9.6
## da spec.
static func quadro(emitter, campos, flow: int, index: int, age: float, fraction: float, frames: int) -> int:
	if frames <= 0:
		return 0
	var k: int
	if emitter.frame_mode == "fps":
		k = posmod(int(floor(age * emitter.fps + 0.00001)), frames)
	else:
		k = posmod(int(floor(fraction * emitter.cycles * frames + 0.00001)), frames)
	var sf: Array = campos.g("start_frame")
	var inicio := posmod(int(floor(faixa(sf[0], sf[1], acaso(emitter.seed, flow, index, CANAL_START_FRAME)))), frames)
	return posmod(k + inicio, frames)


## A rotação de mundo de uma matriz de osso, em graus (7.2).
static func rotacao_de(frame) -> float:
	return rad_to_deg(atan2(frame.c, frame.a))


## A escala de mundo de uma matriz de osso (7.2).
static func escala_de(frame) -> float:
	return sqrt(frame.a * frame.a + frame.c * frame.c)


# ---------------------------------------------------------------------------
# Tudo junto: quem está vivo em `t`
# ---------------------------------------------------------------------------

## As timelines `BONE_particle` deste emissor, pela propriedade (9).
static func timelines_do_emissor(animation, slot_name: String, attachment_name: String, skin_name: String) -> Dictionary:
	var out := {}
	if animation == null:
		return out
	for timeline in animation.timelines:
		if timeline.type != "BONE_particle" or timeline.target != slot_name:
			continue
		if timeline.attachment != null and timeline.attachment != attachment_name:
			continue
		if timeline.skin != "default" and timeline.skin != skin_name:
			continue
		out[timeline.property if timeline.property != null else ""] = timeline
	return out


## A malha do MESMO slot que `shape: "mesh"` aponta (9.4), posada.
static func _malha_de(skeleton, slot, emitter, _skin_name: String):
	if emitter.mesh == null:
		return null
	var found: Array = skeleton.resolve_attachment(slot.name, emitter.mesh)
	var attachment = found[0]
	if not attachment is C.MeshAttachment:
		skeleton.warn_once("REF_PARTICLE_MESH: o emissor \"%s\" no slot \"%s\" aponta para \"%s\", que nao e uma malha do mesmo slot" % [
			emitter.name, slot.name, emitter.mesh])
		return null
	return [skeleton.world_vertices(slot, attachment, found[1]), attachment.triangles]


## Toda partícula de um emissor viva em `t`, ainda sem ordem (5, 7.1).
## `pose_em(t_i)` dá o esqueleto posado no instante do nascimento; só se pede
## quando a resposta depende dele (`space: "world"`, `shape: "mesh"` ou
## `shape: "path"`).
static func vivas(skeleton, slot, emitter, skin_name: String, t: float,
		animation = null, duration: float = 0.0, loop: bool = false, pose_em = null) -> Array:
	if not emitter.shape_ok:
		# 7.4: forma desconhecida não desenha NADA.
		return []

	var alvo = null
	if emitter.shape == "path":
		# 9.4.2: `curve` ausente, ou que não é caminho, não desenha nada.
		alvo = _caminho_de(skeleton, emitter)
		if alvo == null:
			return []

	var timelines := timelines_do_emissor(animation, slot.name, emitter.name, skin_name)
	var nascimentos := continuous_births(emitter, timelines, t, duration, loop)
	nascimentos.append_array(burst_births(emitter, t, duration, loop,
		func(aviso): skeleton.warn_once("%s — emissor \"%s\" no slot \"%s\"" % [aviso, emitter.name, slot.name])))

	# 9.10: "a matriz do osso" é a do emissor, em `t` e em `t_i`.
	var frame = quadro_do_emissor(slot.frame(), emitter)
	# O caminho também (9.4.2): ele é lido em `t_i`, osso e deform.
	var precisa_pose: bool = emitter.space == "world" or emitter.shape == "mesh" or emitter.shape == "path"
	if precisa_pose and pose_em == null:
		skeleton.warn_once("PARTICLE_NO_POSE: o emissor \"%s\" no slot \"%s\" pede a pose do osso no instante do nascimento (space \"world\" ou shape \"mesh\") e ela nao foi oferecida; emissor nao desenhado" % [
			emitter.name, slot.name])
		return []
	# 9.8: quantos quadros a folha tem. Sem `sequence` (7.10), um só.
	var frames: int = emitter.sequence.count if emitter.sequence != null else 1

	var out: Array = []
	for birth in nascimentos:
		var life := vida_de(emitter, birth.flow, birth.index)
		if life <= 0:
			continue
		var age: float = t - birth.birth
		# 5: `t_i <= t < t_i + life_i`.
		if age < 0 or age >= life:
			continue

		var frame_ti = frame
		var bone_length: float = slot.bone.length()
		var malha = null
		var caminho = null
		if precisa_pose:
			var no_nascimento = pose_em.call(birth.birth)
			if no_nascimento == null:
				skeleton.warn_once("PARTICLE_NO_POSE: o emissor \"%s\" no slot \"%s\" nao existia no instante do nascimento; sem a matriz de t_i nao ha o que desenhar" % [
					emitter.name, slot.name])
				return []
			var slot_ti = no_nascimento.slot_by_name.get(slot.name, slot)
			frame_ti = quadro_do_emissor(slot_ti.frame(), emitter)
			if emitter.shape == "mesh":
				malha = _malha_de(no_nascimento, slot_ti, emitter, skin_name)
				if malha != null and (emitter.mesh_mode == "edge" or emitter.mesh_mode == "triangle") and malha[1].size() < 3:
					skeleton.warn_once("PARTICLE_MESH_NO_TRIANGLES: o emissor \"%s\" no slot \"%s\" pede meshMode \"%s\", e a malha \"%s\" nao tem triangulacao" % [
						emitter.name, slot.name, emitter.mesh_mode, emitter.mesh])
					return []
				if malha != null:
					# A malha se mede no espaço do esqueleto em `t_i`, e volta ao
					# referencial do emissor NOS DOIS ESPAÇOS (9.4.2 passo 7,
					# 7.2). Desvio do Python, ver o topo.
					malha = [_para_o_osso(frame_ti, malha[0]), malha[1]]
			if alvo != null:
				caminho = _p0_no_caminho(no_nascimento, alvo, emitter, birth.flow, birth.index, frame_ti)
				if caminho == null:
					skeleton.warn_once("REF_PARTICLE_CURVE: o emissor \"%s\" no slot \"%s\" nao acha o caminho \"%s\" no instante do nascimento; emissor nao desenhado (9.4.2)" % [
						emitter.name, slot.name, emitter.curve])
					return []

		var campos := Campos.new(emitter, timelines, birth.birth)
		out.append(avaliar(emitter, campos, birth.flow, birth.index, birth.birth, life, age,
			frame, frame_ti, bone_length, malha, frames, caminho))
	return out


## 9.10: a matriz do EMISSOR, `M_osso x T(x, y) . R(rotation)`. Com os três
## campos em 0 é a matriz do próprio osso, intocada.
static func quadro_do_emissor(frame, emitter):
	if emitter.x == 0 and emitter.y == 0 and emitter.rotation == 0:
		return frame
	var base = frame if frame is E.Frame else E.Frame.of(frame)
	return base.times_trs(emitter.x, emitter.y, emitter.rotation, 1.0, 1.0)


## Do espaço do esqueleto de volta ao quadro do osso: o inverso de `frame`.
static func _para_o_osso(frame, vertices: Array) -> Array:
	var det: float = frame.a * frame.d - frame.b * frame.c
	if det == 0:
		return vertices.duplicate()
	var out: Array = []
	for i in range(0, vertices.size(), 2):
		var x: float = vertices[i] - frame.world_x
		var y: float = vertices[i + 1] - frame.world_y
		out.append((frame.d * x - frame.b * y) / det)
		out.append((frame.a * y - frame.c * x) / det)
	return out


# ---------------------------------------------------------------------------
# 7.1 O teto de vivas, e a ordem de desenho
# ---------------------------------------------------------------------------

## As que se desenham de fato, na ordem de desenho (7.1, 9.9): a ordem
## `(t_i decrescente, flow crescente, index decrescente)`; corta nas
## `maxParticles` MAIS NOVAS.
static func desenhar(emitter, particles: Array) -> Array:
	var marcadas: Array = []
	for i in range(particles.size()):
		marcadas.append([particles[i], i])
	marcadas.sort_custom(func(x, y):
		var a: Particle = x[0]
		var b: Particle = y[0]
		if a.birth != b.birth:
			return a.birth > b.birth
		if a.flow != b.flow:
			return a.flow < b.flow
		if a.index != b.index:
			return a.index > b.index
		return x[1] < y[1])
	var cortadas: Array = []
	for i in range(mini(marcadas.size(), emitter.max_particles)):
		cortadas.append(marcadas[i][0])
	if emitter.sort_mode == "oldestInFront":
		# 9.9: a mesma ordem, pela outra ponta.
		cortadas.reverse()
	return cortadas


## Tudo de um emissor em `t`: quem está vivo, cortado e em ordem.
static func particulas_do_slot(skeleton, slot, emitter, skin_name: String, t: float,
		animation = null, duration: float = 0.0, loop: bool = false, pose_em = null) -> Array:
	var vivos := vivas(skeleton, slot, emitter, skin_name, t, animation, duration, loop, pose_em)
	if vivos.size() > emitter.max_particles:
		skeleton.warn_once("PARTICLE_CUT: o emissor \"%s\" no slot \"%s\" passou de maxParticles (%d); %d cortadas neste quadro (7.1)" % [
			emitter.name, slot.name, emitter.max_particles, vivos.size() - emitter.max_particles])
	return desenhar(emitter, vivos)


# ---------------------------------------------------------------------------
# `shape: "path"` (9.4.2, 1.1 da extensão). Copiado do particles.py (G9).
# ---------------------------------------------------------------------------

## 9.4.2: cada curva de Bézier do caminho vira 10 segmentos retos — a mesma
## régua de comprimento da 6.4 da spec. Não o comprimento exato: dois leitores
## que medissem "o comprimento de verdade" com passos diferentes discordariam.
const SEGMENTOS_POR_CURVA := 10


## 9.4.2: `"<slot>/<placeholder>"`. O slot é o texto antes da PRIMEIRA barra;
## o placeholder é todo o resto, e pode ter barra. Devolve [slot, placeholder]
## ou null.
static func ler_curve(curve):
	if typeof(curve) != TYPE_STRING or not curve.contains("/"):
		return null
	var i: int = curve.find("/")
	var slot_name: String = curve.substr(0, i)
	var placeholder: String = curve.substr(i + 1)
	if slot_name == "" or placeholder == "":
		return null
	return [slot_name, placeholder]


## 9.4.2 passos 2 e 3: a poligonal, como a lista dos pontos dela, em ordem.
## `W` tem 3K pontos achatados (6K números): o ponto 3i é a alça de chegada da
## âncora i, 3i+1 a âncora, 3i+2 a alça de saída (6.4 da spec). Aberto: K − 1
## curvas. Fechado: K, a última liga a âncora K−1 à 0, com a alça de saída de
## K−1 e a de chegada de 0.
static func poligonal_do_caminho(W: Array, closed: bool) -> Array:
	var K: int = W.size() / 6
	var curvas: int = K if closed else K - 1
	var pontos: Array = []
	for k in range(curvas):
		var seguinte: int = (k + 1) % K
		var a: Array = [W[2 * (3 * k + 1)], W[2 * (3 * k + 1) + 1]]
		var h1: Array = [W[2 * (3 * k + 2)], W[2 * (3 * k + 2) + 1]]
		var h2: Array = [W[2 * (3 * seguinte)], W[2 * (3 * seguinte) + 1]]
		var c: Array = [W[2 * (3 * seguinte + 1)], W[2 * (3 * seguinte + 1) + 1]]
		# O primeiro ponto de uma curva é o último da anterior: escrito uma vez.
		for j in range(0 if k == 0 else 1, SEGMENTOS_POR_CURVA + 1):
			var t: float = float(j) / SEGMENTOS_POR_CURVA
			var m: float = 1 - t
			var b0: float = m * m * m
			var b1: float = 3 * m * m * t
			var b2: float = 3 * m * t * t
			var b3: float = t * t * t
			pontos.append([b0 * a[0] + b1 * h1[0] + b2 * h2[0] + b3 * c[0],
				b0 * a[1] + b1 * h1[1] + b2 * h2[1] + b3 * c[1]])
	return pontos


## 9.4.2 passos 4 a 6: o ponto a `s = u3 · total` do começo, NA POLIGONAL — a
## corda, nunca o `B(t)` relido dentro do segmento. Sempre por comprimento: o
## `constantSpeed` e os `lengths` do caminho são ignorados.
static func ponto_no_caminho(W: Array, closed: bool, u3: float) -> Array:
	var pontos := poligonal_do_caminho(W, closed)
	if pontos.is_empty():
		return [W[2], W[3]] if W.size() >= 4 else [0.0, 0.0]
	var comprimentos: Array = []
	for k in range(pontos.size() - 1):
		# O `math.hypot` do Python, em float de 64 bits (o Vector2 é de 32).
		var dx: float = pontos[k + 1][0] - pontos[k][0]
		var dy: float = pontos[k + 1][1] - pontos[k][1]
		comprimentos.append(sqrt(dx * dx + dy * dy))
	var total := 0.0
	for L in comprimentos:  # somados na ordem do caminho (passo 4)
		total += L
	if total <= 0:
		# Passo 6: "total = 0: p0 = a primeira âncora".
		return pontos[0]
	var s := u3 * total
	var acc := 0.0
	for k in range(comprimentos.size()):
		var L: float = comprimentos[k]
		if L > 0 and acc + L >= s:
			var f := (s - acc) / L
			return [pontos[k][0] + (pontos[k + 1][0] - pontos[k][0]) * f,
				pontos[k][1] + (pontos[k + 1][1] - pontos[k][1]) * f]
		acc += L
	# `u3 < 1`, então `s < total` e o laço sempre devolve; o fim do caminho
	# fica aqui só para uma troca do acaso não cair dele calada.
	return pontos[-1]


## 9.4.2: o anexo `path` para onde `curve` aponta, ou null com aviso. Procurado
## nas skins como qualquer placeholder (4.4 da spec), SEJA QUAL FOR o anexo que
## o slot mostra: um caminho nunca é desenhado.
static func _caminho_de(skeleton, emitter):
	var alvo = ler_curve(emitter.curve)
	var motivo = null
	if alvo == null:
		motivo = ("curve \"%s\" ausente ou sem \"<slot>/<placeholder>\"" % emitter.curve) if emitter.curve != null and emitter.curve != "" else "sem curve"
	else:
		if not skeleton.slot_by_name.has(alvo[0]):
			motivo = "o slot \"%s\" de curve nao existe" % alvo[0]
		else:
			var attachment = skeleton.resolve_attachment(alvo[0], alvo[1])[0]
			if not attachment is C.PathAttachment:
				motivo = "\"%s\" nao e um anexo path" % emitter.curve
			elif attachment.vertex_count / 3 < 2:
				motivo = "o caminho \"%s\" tem menos de 2 ancoras" % emitter.curve
	if motivo != null:
		# 9.4.2: não desenha, e diz uma vez — nunca cai para `point`.
		skeleton.warn_once("REF_PARTICLE_CURVE: o emissor \"%s\" tem shape \"path\" e %s; emissor nao desenhado (9.4.2)" % [
			emitter.name, motivo])
		return null
	return alvo


## 9.4.2 passos 1 e 7: o caminho em `t_i`, no espaço do esqueleto — o osso do
## slot DO CAMINHO e o deform desse anexo nesse slot, os dois em `t_i` — e
## depois de volta ao referencial do emissor pela inversa de M_emissor(t_i),
## nos dois espaços (desvio do Python, ver o topo).
static func _p0_no_caminho(no_nascimento, alvo: Array, emitter, flow: int, index: int, frame_ti):
	var slot_c = no_nascimento.slot_by_name.get(alvo[0])
	if slot_c == null:
		return null
	var found: Array = no_nascimento.resolve_attachment(alvo[0], alvo[1])
	var attachment = found[0]
	if not attachment is C.PathAttachment:
		return null
	var W: Array = no_nascimento.world_vertices(slot_c, attachment, found[1])
	if W.size() < 12:
		return null
	var u3 := acaso(emitter.seed, flow, index, CANAL_SHAPE_1)
	var p0 := ponto_no_caminho(W, attachment.closed, u3)
	var volta := _para_o_osso(frame_ti, [p0[0], p0[1]])
	return [volta[0], volta[1]]
