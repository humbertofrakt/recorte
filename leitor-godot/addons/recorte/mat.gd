# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/skeleton.py, as funções soltas do topo e o
# `order_from_offsets` (rodada G1, 05/10/2026).
#
# Num arquivo à parte por uma razão do GDScript: as classes internas de
# `esqueleto.gd` chamam estas funções, e um arquivo pré-carregado como
# constante é o caminho que o GDScript garante para isso.
@tool
extends RefCounted

const DEG2RAD := PI / 180.0
const RAD2DEG := 180.0 / PI

const MODE_NORMAL := "normal"
const MODE_ONLY_TRANSLATION := "onlyTranslation"
const MODE_NO_ROTATION_OR_REFLECTION := "noRotationOrReflection"
const MODE_NO_SCALE := "noScale"
const MODE_NO_SCALE_OR_REFLECTION := "noScaleOrReflection"
# F3: feitos sobre as fórmulas do Spine acima; seção 5.4.
const MODE_NO_ROTATION := "noRotation"
const MODE_NO_REFLECTION := "noReflection"
const MODE_ONLY_REFLECTION := "onlyReflection"


## Seção 5.3: desde a F3 as oito combinações têm modo próprio.
## (O dicionário de tuplas do Python vira uma escada de `if`.)
static func mode_of(r: bool, s: bool, f: bool) -> String:
	if r and s and f:
		return MODE_NORMAL
	if not r and not s and not f:
		return MODE_ONLY_TRANSLATION
	if not r and s and not f:
		return MODE_NO_ROTATION_OR_REFLECTION
	if r and not s and f:
		return MODE_NO_SCALE
	if r and not s and not f:
		return MODE_NO_SCALE_OR_REFLECTION
	if not r and s and f:
		return MODE_NO_ROTATION
	if r and s and not f:
		return MODE_NO_REFLECTION
	return MODE_ONLY_REFLECTION


static func cosd(degrees: float) -> float:
	return cos(degrees * DEG2RAD)


static func sind(degrees: float) -> float:
	return sin(degrees * DEG2RAD)


## atan2 em graus, com atan2(0, 0) = 0 (3.6).
static func atan2d(y: float, x: float) -> float:
	if y == 0.0 and x == 0.0:
		return 0.0
	return atan2(y, x) * RAD2DEG


static func atan2r(y: float, x: float) -> float:
	if y == 0.0 and x == 0.0:
		return 0.0
	return atan2(y, x)


## Reduz graus a (-180, 180].
static func normalized(degrees: float) -> float:
	if not is_finite(degrees):
		return 0.0
	var value := fmod(degrees, 360.0)
	if value > 180.0:
		value -= 360.0
	elif value <= -180.0:
		value += 360.0
	return value


## Reduz radianos a (-pi, pi]. (Rodada G6: as regras usam.)
static func normalize(radians: float) -> float:
	if not is_finite(radians):
		return 0.0
	var value := fmod(radians, TAU)
	if value > PI:
		value -= TAU
	elif value <= -PI:
		value += TAU
	return value


## Seção 5.5: o que daria NaN ou infinito entra na pose como 0.
static func safe(value: float) -> float:
	return value if is_finite(value) else 0.0


static func clamp_f(value: float, low: float, high: float) -> float:
	return low if value < low else (high if value > high else value)


## O algoritmo de ordem de desenho de 9.5 sobre uma ordem base qualquer.
## `base` lista índices de slot; `entries` são [índice do slot, offset].
## Buracos se enchem na ordem base com quem ninguém citou; o alvo é preso
## nas bordas, e a entrada mais tarde vence a colisão.
static func order_from_offsets(base: Array, entries: Array) -> Array:
	var count := base.size()
	var order: Array = []
	order.resize(count)
	order.fill(-1)
	var position := {}
	for i in range(count):
		position[base[i]] = i
	var named := {}
	for e in entries:
		var slot: int = e[0]
		var offset: int = e[1]
		if not position.has(slot):
			continue
		var index := int(clamp_f(position[slot] + offset, 0, count - 1))
		if order[index] != -1:
			named.erase(order[index])
		order[index] = slot
		named[slot] = true
	var j := 0
	for i in range(count):
		if order[i] == -1:
			while j < count and named.has(base[j]):
				j += 1
			order[i] = base[j]
			j += 1
	return order
