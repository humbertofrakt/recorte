# SPDX-License-Identifier: Apache-2.0
# O importador que SÓ GUARDA (rodada G8, 05/10/2026).
#
# Não vem do Python: é a casca. O `08`, seção 3: o `.bone` entra pelo
# importador do Godot, mas SEM CONVERTER. O importador só guarda os bytes num
# recurso (`arquivo_recorte.gd`), e assim o Godot leva o arquivo junto ao
# exportar o jogo. Converter para os nós do Godot perderia demais (o `08`,
# seção 1): a conta continua sendo a do leitor.
#
# O atlas (`.atlas.json`) o Godot já leva sozinho: `.json` é recurso dele. As
# imagens o Godot importa como textura, e o nó as pega por `load()`.
@tool
extends EditorImportPlugin

const Arq := preload("arquivo_recorte.gd")


func _get_importer_name() -> String:
	return "recorte.arquivo"


func _get_visible_name() -> String:
	return "Recorte (guarda o arquivo, sem converter)"


func _get_recognized_extensions() -> PackedStringArray:
	return PackedStringArray(["bone", "bonez", "boneb"])


func _get_save_extension() -> String:
	return "res"


func _get_resource_type() -> String:
	return "Resource"


func _get_preset_count() -> int:
	return 1


func _get_preset_name(_preset_index: int) -> String:
	return "Padrão"


func _get_import_options(_path: String, _preset_index: int) -> Array[Dictionary]:
	return []


func _get_option_visibility(_path: String, _option_name: StringName, _options: Dictionary) -> bool:
	return true


func _get_priority() -> float:
	return 1.0


func _get_import_order() -> int:
	return 0


# ARMADILHA (achada na G8): o Godot só reimporta quando o arquivo de ORIGEM
# muda. Mudar só o código deste importador deixa os recursos velhos no lugar,
# sem aviso. Testado: `_get_format_version()` subindo de 1 para 2 NÃO fez o
# `--import` do 4.7.2 reimportar. Mudou o importador? Apague os `*.bone*` de
# `.godot/imported/` (é cache) e importe de novo, ou use "Reimportar" no editor.


func _import(source_file: String, save_path: String, _options: Dictionary,
		_platform_variants: Array[String], _gen_files: Array[String]) -> Error:
	var bytes := FileAccess.get_file_as_bytes(source_file)
	if bytes.is_empty() and FileAccess.get_open_error() != OK:
		push_error("[Recorte] não consegui ler \"%s\" para importar" % source_file)
		return FileAccess.get_open_error()
	var arq := Arq.new()
	arq.bytes = bytes
	arq.formato = source_file.get_extension().to_lower()
	return ResourceSaver.save(arq, "%s.%s" % [save_path, _get_save_extension()])
