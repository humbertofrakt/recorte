# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/atlas.py (rodada G1, 05/10/2026).
#
# Leitura do atlas e o mapa de UV (seção 10 da especificação).
# As coordenadas do atlas são pixels da página, com a origem no canto de cima
# e o Y para baixo; o `offsetY` é medido de baixo, como o resto do formato. A
# seção 10.4 é o único lugar que junta os dois, e está aqui palavra por palavra.
#
# Diferença do GDScript: o JSON do Godot lê todo número como float; os campos
# inteiros passam por int() aqui, como o Python faz.
@tool
extends RefCounted


class Page:
	var name := ""
	var image := ""
	var width := 0
	var height := 0
	var format := "rgba8"
	var min_filter := "linear"
	var mag_filter := "linear"
	var wrap_u := "clamp"
	var wrap_v := "clamp"
	var premultiplied := false


class Region:
	var name := ""
	var aliases: Array = []
	var page_index := 0
	var x := 0
	var y := 0
	var width := 0
	var height := 0
	var rotation := 0
	var offset_x := 0
	var offset_y := 0
	var original_width := 0
	var original_height := 0
	var page: Page = null
	var scale := 1.0

	## Seção 10.4: UV da imagem original para UV da página. Devolve [u, v].
	## (Array de float, e não Vector2: o Vector2 do Godot é float de 32 bits,
	## e a conta tem de ser a mesma do Python, em 64.)
	func uv(u0: float, v0: float) -> Array:
		var px := u0 * original_width - offset_x
		var py := v0 * original_height - (original_height - offset_y - height)
		if rotation == 90:
			return [(x + height - py) / float(page.width), (y + px) / float(page.height)]
		return [(x + px) / float(page.width), (y + py) / float(page.height)]


class Atlas:
	var scale := 1.0
	var pages: Array = []
	var regions: Array = []
	var by_name := {}

	func find(name: String) -> Region:
		return by_name.get(name, null)


static func _num(source: Dictionary, key: String, default_value):
	var value = source.get(key, default_value)
	return default_value if value == null else value


## Monta um Atlas a partir do `.atlas.json` já lido.
static func load_atlas(doc: Dictionary) -> Atlas:
	var atlas := Atlas.new()
	atlas.scale = float(_num(doc, "scale", 1))
	if atlas.scale == 0.0:
		atlas.scale = 1.0
	for raw in _list(doc.get("pages")):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var page := Page.new()
		page.name = str(raw.get("name", ""))
		page.image = str(raw.get("image", ""))
		page.width = int(_num(raw, "width", 0))
		page.height = int(_num(raw, "height", 0))
		page.format = str(_num(raw, "format", "rgba8"))
		page.min_filter = str(_num(raw, "minFilter", "linear"))
		page.mag_filter = str(_num(raw, "magFilter", "linear"))
		page.wrap_u = str(_num(raw, "wrapU", "clamp"))
		page.wrap_v = str(_num(raw, "wrapV", "clamp"))
		page.premultiplied = bool(_num(raw, "premultiplied", false))
		atlas.pages.append(page)
	for raw in _list(doc.get("regions")):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var region := Region.new()
		region.width = int(_num(raw, "width", 0))
		region.height = int(_num(raw, "height", 0))
		region.rotation = int(_num(raw, "rotation", 0))
		if region.rotation != 0 and region.rotation != 90:
			region.rotation = 0  # seção 2.5
		region.page_index = int(_num(raw, "page", 0))
		region.name = str(raw.get("name", ""))
		for a in _list(raw.get("aliases")):
			region.aliases.append(str(a))
		region.x = int(_num(raw, "x", 0))
		region.y = int(_num(raw, "y", 0))
		region.offset_x = int(_num(raw, "offsetX", 0))
		region.offset_y = int(_num(raw, "offsetY", 0))
		region.original_width = int(_num(raw, "originalWidth", region.width))
		region.original_height = int(_num(raw, "originalHeight", region.height))
		region.scale = atlas.scale
		if region.page_index >= 0 and region.page_index < atlas.pages.size():
			region.page = atlas.pages[region.page_index]
		atlas.regions.append(region)
		if not atlas.by_name.has(region.name):
			atlas.by_name[region.name] = region
	# Os apelidos só depois de todos os nomes: um nome de verdade sempre vence.
	for region in atlas.regions:
		for alias in region.aliases:
			if not atlas.by_name.has(alias):
				atlas.by_name[alias] = region
	return atlas


## A primeira que bate, na ordem de `assets.atlases` (10.5).
static func find_region(atlases: Array, name: String) -> Region:
	for atlas in atlases:
		var region: Region = atlas.find(name)
		if region != null:
			return region
	return null


static func _list(value) -> Array:
	return value if typeof(value) == TYPE_ARRAY else []
