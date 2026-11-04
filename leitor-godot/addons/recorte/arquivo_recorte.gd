# SPDX-License-Identifier: Apache-2.0
# O arquivo do Recorte como recurso do Godot (rodada G8, 05/10/2026).
#
# Não vem do Python: é a casca. O importador (`importador.gd`) põe aqui os
# BYTES do `.bone`, do `.bonez` ou do `.boneb`, sem converter nada. É o que o
# Spine faz com o `SpineSkeletonFileResource`: o arquivo vira recurso só para
# o Godot levá-lo junto ao exportar o jogo (arquivo que não é recurso fica
# para trás). Quem lê é o mesmo `carregador.gd` de sempre.
@tool
extends Resource

## Os bytes do arquivo, como estão no disco.
@export var bytes: PackedByteArray = PackedByteArray()
## "bone", "bonez" ou "boneb": a extensão do arquivo de origem.
@export var formato := "bone"
