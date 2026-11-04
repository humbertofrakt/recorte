# SPDX-License-Identifier: Apache-2.0
# O addon do Recorte no editor do Godot (rodada G1; o importador na G8, 05/10/2026).
#
# O nó `Recorte` aparece sozinho na lista de nós, porque o `recorte.gd` tem
# `class_name Recorte`. Este plugin registra o importador que GUARDA o `.bone`,
# o `.bonez` e o `.boneb` como recurso, sem converter (`importador.gd`), para o
# Godot levá-los junto ao exportar o jogo.
@tool
extends EditorPlugin

var _importador: EditorImportPlugin


func _enter_tree() -> void:
	_importador = preload("importador.gd").new()
	add_import_plugin(_importador)


func _exit_tree() -> void:
	if _importador != null:
		remove_import_plugin(_importador)
		_importador = null
