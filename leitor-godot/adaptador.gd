# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/adaptador.py (rodada G1, 05/10/2026).
#
# O adaptador do leitor do Godot para a suíte de conformidade (§12.4), rodado
# pelo próprio Godot, sem janela:
#
#   godot --headless --path leitor-godot --script res://adaptador.gd -- <pasta do caso> <sonda.json> <saida.json>
#
# Diferença do Python, e por quê: o contrato da suíte é "sonda na entrada
# padrão, dump na saída padrão". O Godot escreve o nome dele na saída padrão
# ao abrir, e isso estragaria o JSON. Então a sonda chega por arquivo, e o
# dump sai por arquivo. Quem cumpre o contrato da suíte é o `adaptador.mjs`,
# que chama este script e copia o arquivo para a saída padrão.
#
# Recusa (2.7, arquivo quebrado): sai com código 1, e o motivo vai no arquivo
# de saída como {"erro": "..."}, para o `adaptador.mjs` o pôr na saída de erro.
extends SceneTree

const C := preload("res://addons/recorte/carregador.gd")
const D := preload("res://addons/recorte/dump.gd")

const NOMES_DE_ENTRADA := ["entrada.bone", "entrada.boneb", "entrada.bonez"]


func _initialize() -> void:
	var args := OS.get_cmdline_user_args()
	if args.size() < 3:
		printerr("uso: -- <pasta do caso> <sonda.json> <saida.json>")
		quit(2)
		return
	var pasta: String = args[0]
	var saida: String = args[2]

	# G8: o `physicsDt` e os `times` relidos do texto com o número exato (o
	# JSON do Godot lê 1/60 uma casa binária abaixo; ver `dump.gd`).
	var sonda = D.sonda_de_texto(FileAccess.get_file_as_string(args[1]))
	if typeof(sonda) != TYPE_DICTIONARY:
		_recusar(saida, "a sonda nao e um objeto JSON", 2)
		return

	var entrada := ""
	for nome in NOMES_DE_ENTRADA:
		if FileAccess.file_exists(pasta.path_join(nome)):
			entrada = pasta.path_join(nome)
			break
	if entrada == "":
		_recusar(saida, "caso sem entrada em " + pasta, 2)
		return

	var resolver := func(uri: String):
		var arquivo := pasta.path_join(uri)
		if not FileAccess.file_exists(arquivo):
			return null
		return FileAccess.get_file_as_bytes(arquivo)

	var r := C.load_skeleton_bytes(FileAccess.get_file_as_bytes(entrada), resolver)
	if r["dados"] == null:
		_recusar(saida, r["erro"], 1)
		return
	var dump := D.build_pose_dump(r["dados"], sonda)
	var f := FileAccess.open(saida, FileAccess.WRITE)
	f.store_string(JSON.stringify(dump, "", false, true))
	f.close()
	quit(0)


func _recusar(saida: String, motivo: String, codigo: int) -> void:
	var f := FileAccess.open(saida, FileAccess.WRITE)
	if f != null:
		f.store_string(JSON.stringify({"erro": motivo}))
		f.close()
	printerr(motivo)
	quit(codigo)
