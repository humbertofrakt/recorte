# SPDX-License-Identifier: Apache-2.0
# O nó Recorte: o boneco do Recorte dentro do Godot (rodadas G1, G2 e G3, 05/10/2026).
#
# Não vem do Python: é a casca. A conta é dos arquivos copiados do runtime
# Python (`carregador.gd`, `esqueleto.gd`, `animacao.gd`); as listas vêm do
# `desenhador.gd`; este nó só chama o RenderingServer com elas.
#
#   $Heroi.tocar("andar")            # em laço
#   $Heroi.tocar("atacar", false)    # uma vez; o sinal `terminou` avisa o fim
#   $Heroi.tocando                   # o nome da que está tocando ("" = nenhuma)
#   $Heroi.evento.connect(func(nome, dados): print(nome))
#   $Heroi.encaixar("weapon", preload("res://motosserra.bone"))   # G5
#   $Heroi.encaixar("aura", "res://aura.bone", "meio")             # em volta
#   $Heroi.desencaixar("weapon")
#
# A CONEXÃO (rodada G5; `08`, seção 4): encaixar uma entidade num slot,
# desencaixar, encaixar todas, animar a peça, soltar a peça, o sinal
# `encaixado`, a lista dos slots e das entidades, e onde está um osso ou um
# slot. A forma é a do leitor do Construct (K5, `tocador.ts`): os encaixes do
# jogo são UMA skin feita na hora, sempre no TOPO da pilha, acima das que o
# jogo veste. Nenhuma chave da animação a desfaz; a entidade cai no pino da
# imagem que ela substitui e herda a ordem e as chaves dela (chave que esconde
# a imagem esconde a peça); quando sai, a imagem de antes volta.
#
# Onde não entende, AVISA (regra 21): a lista `avisos`, e o console com
# "[Recorte]". A malha e a máscara (G3) são desenhadas: a máscara corta na
# conta (`corte.gd`), antes de chegar ao Godot. As regras (G6) e as
# partículas (G7) também. E a entidade encaixada e a virada de corpo (G5): o
# nó posa pelo `ator.gd` (o `Actor` do Python), como o dump da suíte; os
# eventos de um filho saem pelo mesmo sinal, com o nome `slot/evento`.
#
# As partículas (G7): função pura do tempo, como no editor. O nó dá a elas o
# tempo da animação e, para `space: "world"`, a pose do osso no instante em
# que cada uma nasceu (um segundo esqueleto, só para isso; o resultado se
# guarda por instante, e o guardado nunca muda a resposta).
#
# O relógio da física (G6): o nó passa à regra de física o tempo da animação
# que toca (`_tempo`, que anda `delta × velocidade` a cada `_process`). A regra
# conta em passos FIXOS de 1/fps (60 por segundo, se o `.bone` não diz outro),
# e guarda a sobra para o quadro seguinte. Quadro pulado: o `delta` grande
# vira vários passos de uma vez — a mesma conta do editor e do Python. O
# `tocar` zera o `_tempo`: nesse quadro a física não anda (o tempo voltou), e
# segue no seguinte. Pausado, a física para junto.
@tool
class_name Recorte
extends Node2D

const C := preload("carregador.gd")
const E := preload("esqueleto.gd")
const A := preload("animacao.gd")
const Des := preload("desenhador.gd")
const Arq := preload("arquivo_recorte.gd")
const Ator := preload("ator.gd")

## Avisa a cada evento do `.bone` (as chaves de evento da animação que toca).
## `dados` traz: int, float, string, volume, balance, time.
signal evento(nome: String, dados: Dictionary)
## Avisa quando uma animação tocada UMA VEZ chega ao fim.
signal terminou(animacao: String)
## Avisa a cada encaixe (G5). O leitor não recusa nada: o limite é do jogo,
## que diz "não" aqui, desencaixando. `peca` é o caminho da entidade.
signal encaixado(slot: String, peca: String)

## O nome da skin feita na hora com os encaixes do jogo (a do Construct).
const SKIN_DOS_ENCAIXES := "(encaixes do jogo)"

## O boneco: o arquivo `.bone`, `.bonez` ou `.boneb`. O atlas e a imagem
## ficam na mesma pasta. No editor do Godot o boneco aparece parado (G8).
@export_file("*.bone", "*.bonez", "*.boneb") var arquivo := "":
	set(valor):
		arquivo = valor
		_no_editor_recarregar()
## A animação que toca ao começar (no jogo; no editor ele fica parado).
## Vazio: parado na pose de repouso.
@export var animacao_inicial := ""
## Se a animação inicial volta ao começo.
@export var em_laco := true
## 1 é o tamanho do editor do Recorte.
@export var escala := 1.0:
	set(valor):
		escala = valor
		if esqueleto != null and is_inside_tree():
			_desenhar()
## A velocidade do tempo: 1 é normal, 0.5 é metade, 2 é o dobro.
@export var velocidade := 1.0
## As skins vestidas ao começar, de baixo para cima: a última vence.
## Vazio: só a `default`.
@export var skins_iniciais: PackedStringArray = []:
	set(valor):
		skins_iniciais = valor
		_no_editor_recarregar()

## Tudo o que o leitor não entendeu ou ainda não faz, do primeiro ao último.
var avisos: Array[String] = []
## O nome da animação que está tocando. "" = nenhuma.
var tocando := ""
## Se está pausado (`pausar` e `continuar`).
var pausado := false

var dados = null
## O esqueleto do corpo que está vivo agora (9.13). Muda na virada de corpo.
var esqueleto = null
# G5: quem posa — um esqueleto por corpo, e as entidades encaixadas.
var _ator = null
var _pilha: Array = ["default"]
var _animacao = null
var _laco := true
var _tempo := 0.0
var _anterior := -INF
var _terminou := false
var _texturas := {}
# G5: de que arquivo veio cada imagem (o nome é a chave da página).
var _origem_das_texturas := {}
var _itens: Array[RID] = []
var _materiais := {}
var _avisos_do_desenho := Des.Avisos.new()
# A pose no instante do nascimento (G7): o esqueleto que posa, os slots que têm
# emissor, se algum emissor usa malha (aí não se guarda), e o guardado.
var _posador = null
var _slots_com_emissor: Array = []
var _emissor_com_malha := false
var _poses_guardadas := {}
# G5, a conexão: a pasta do boneco; os encaixes do jogo (slot -> {caminho,
# em_volta}, na ordem em que foram feitos); as peças lidas (caminho ->
# SkeletonData); as ordens para as peças (slot -> {animacao, laco, inicio});
# o relógio das ordens (segundos de jogo, vezes a velocidade); a skin feita
# na hora, ou null.
var _pasta := ""
var _encaixes := {}
var _entidades := {}
var _ordens := {}
var _relogio := 0.0
var _skin_encaixes = null


func _ready() -> void:
	if arquivo != "":
		# No editor do Godot (`@tool`, G8) o boneco aparece PARADO: a animação
		# inicial só toca no jogo.
		if carregar(arquivo) and animacao_inicial != "" and not Engine.is_editor_hint():
			tocar(animacao_inicial, em_laco)


## No editor do Godot: trocou o arquivo ou as skins no Inspetor, o boneco se
## refaz na hora. Fora do editor (e antes de entrar na cena) não faz nada.
func _no_editor_recarregar() -> void:
	if not Engine.is_editor_hint() or not is_inside_tree():
		return
	avisos.clear()
	for item in _itens:
		RenderingServer.canvas_item_clear(item)
	if arquivo != "":
		carregar(arquivo)


## Os itens de desenho são do RenderingServer: devolvem-se quando o nó é apagado.
func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		for item in _itens:
			RenderingServer.free_rid(item)
		_itens.clear()
		if _ator != null:
			_ator.liberar()
			_ator = null
			esqueleto = null
		if _posador != null:
			_posador.liberar()
			_posador = null


## Os bytes de um arquivo do boneco (G8). Primeiro o RECURSO que o importador
## guardou (é o que vai junto no jogo exportado: lá o `.bone` de origem não
## está), depois o arquivo do disco, por fim o `.json` que o Godot leu como
## recurso dele. Devolve null quando não acha.
static func bytes_de(caminho: String):
	if caminho.get_extension().to_lower() in ["bone", "bonez", "boneb"] and ResourceLoader.exists(caminho):
		var r = load(caminho)
		if r is Arq:
			return r.bytes
	if FileAccess.file_exists(caminho):
		return FileAccess.get_file_as_bytes(caminho)
	if caminho.get_extension().to_lower() == "json" and ResourceLoader.exists(caminho):
		var j = load(caminho)
		if j is JSON:
			return JSON.stringify(j.data).to_utf8_buffer()
	return null


## Lê o boneco. Devolve false (e avisa) se não deu para ler.
func carregar(caminho: String) -> bool:
	var bytes = bytes_de(caminho)
	if bytes == null:
		_avisar("não achei o arquivo \"%s\"" % caminho)
		return false
	return carregar_bytes(bytes, caminho.get_base_dir(), caminho)


## Lê o boneco de bytes já lidos (o jogo que guarda o `.bone` do seu jeito).
## O atlas, a imagem e os outros arquivos vêm da `pasta`. `nome` só aparece nos avisos.
func carregar_bytes(bytes: PackedByteArray, pasta: String, nome := "o boneco") -> bool:
	var resolver := func(uri: String):
		return bytes_de(pasta.path_join(uri))
	var r := C.load_skeleton_bytes(bytes, resolver)
	if r["dados"] == null:
		_avisar("\"%s\" não abriu: %s" % [nome, r["erro"]])
		return false
	if _ator != null:
		_ator.liberar()
	dados = r["dados"]
	for w in dados.warnings.messages:
		_avisar(w)
	for m in dados.missing:
		_avisar("arquivo que falta: " + m)
	_ator = Ator.new(dados)
	for s in _ator.skeletons.values():
		s.pose_em = _pose_no_nascimento
	esqueleto = _ator.current
	_pasta = pasta
	_encaixes.clear()
	_entidades.clear()
	_ordens.clear()
	_skin_encaixes = null
	if _posador != null:
		_posador.liberar()
	_posador = E.Skeleton.new(dados)
	_slots_com_emissor = []
	_emissor_com_malha = false
	for skin in dados.skins:
		for slot_name in skin.attachments:
			for n in skin.attachments[slot_name]:
				var a = skin.attachments[slot_name][n]
				if a is C.ParticleAttachment:
					if not _slots_com_emissor.has(slot_name):
						_slots_com_emissor.append(slot_name)
					# A malha e o caminho (G9) leem o esqueleto INTEIRO em `t_i`
					# (outro slot, o deform): sem eles, guarda-se só a matriz.
					if a.shape == "mesh" or a.shape == "path":
						_emissor_com_malha = true
	_poses_guardadas.clear()
	_pilha = ["default"]
	for s in skins_iniciais:
		vestir(s)
	_texturas.clear()
	_origem_das_texturas.clear()
	_carregar_texturas(dados, pasta, pasta, {})
	tocando = ""
	_animacao = null
	_posar()
	return true


## Os nomes das animações do boneco.
func animacoes() -> PackedStringArray:
	var out := PackedStringArray()
	if dados != null:
		for a in dados.animations:
			out.append(a.name)
	return out


## Toca uma animação, do começo. `em_laco` = volta ao começo; sem laço, o
## sinal `terminou` avisa o fim e o boneco fica no último quadro.
func tocar(nome: String, laco := true) -> bool:
	if dados == null:
		_avisar("tocar(\"%s\"): nenhum boneco carregado" % nome)
		return false
	var animacao = dados.find_animation(nome)
	if animacao == null:
		_avisar("tocar(\"%s\"): o boneco não tem essa animação. Tem: %s" % [nome, ", ".join(animacoes())])
		return false
	_animacao = animacao
	_laco = laco
	_tempo = 0.0
	_anterior = -INF
	_terminou = false
	tocando = nome
	_poses_guardadas.clear()
	_posar()
	return true


## Para a animação: o boneco volta à pose de repouso.
func parar() -> void:
	_animacao = null
	tocando = ""
	_poses_guardadas.clear()
	_posar()


func pausar() -> void:
	pausado = true


func continuar() -> void:
	pausado = false


## Se esta animação é a que está tocando.
func esta_tocando(nome: String) -> bool:
	return tocando == nome


## Veste uma skin: ela vai para o topo da pilha, e a de cima vence (4.4).
## Vestir de novo uma que já está vestida a faz subir ao topo.
## Skin que o boneco não tem: avisa e devolve false.
func vestir(nome: String) -> bool:
	if dados == null:
		_avisar("vestir(\"%s\"): nenhum boneco carregado" % nome)
		return false
	if dados.find_skin(nome) == null:
		var tem: Array = []
		for s in dados.skins:
			tem.append(s.name)
		_avisar("vestir(\"%s\"): o boneco não tem essa skin. Tem: %s" % [nome, ", ".join(tem)])
		return false
	_pilha.erase(nome)
	_pilha.append(nome)
	_trocar_pilha()
	return true


## Tira só esta skin da pilha. As outras ficam, na ordem. Se ela não estava
## vestida, nada muda (não é erro: o jogo pode tirar por garantia, como no
## leitor do Construct). Skin que o boneco não tem: avisa e devolve false.
func tirar_skin(nome: String) -> bool:
	if dados == null or dados.find_skin(nome) == null:
		_avisar("tirar_skin(\"%s\"): o boneco não tem essa skin" % nome)
		return false
	_pilha.erase(nome)
	_trocar_pilha()
	return true


## A pilha de skins, de baixo para cima: a última vence.
func skins() -> PackedStringArray:
	return PackedStringArray(_pilha)


## Se esta skin está vestida.
func esta_vestindo(nome: String) -> bool:
	return _pilha.has(nome)


func _trocar_pilha() -> void:
	if esqueleto == null:
		return
	_ator.set_skins(_pilha)
	# G5: a skin dos encaixes fica sempre no topo (no ator, mesmo depois de
	# uma virada de corpo que zera a pilha). `set_skins` de novo em todo corpo
	# limpa o que cada um guardou da skin antiga.
	_ator.topo = [SKIN_DOS_ENCAIXES] if _skin_encaixes != null else []
	for s in _ator.skeletons.values():
		s.set_skins(s.skin_names)
	_posador.set_skins(_pilha + _ator.topo)
	_poses_guardadas.clear()
	_posar()


func _process(delta: float) -> void:
	# Sem animação o tempo anda também (G7): a partícula é do relógio do
	# esqueleto, e a fumaça não para quando o boneco está parado.
	# No editor do Godot o boneco fica parado (G8): o tempo não anda.
	if esqueleto == null or pausado or Engine.is_editor_hint():
		return
	_relogio += delta * velocidade
	# G5: uma peça encaixada anda no relógio dela, mesmo com o boneco parado.
	if _animacao == null and _slots_com_emissor.is_empty() and _ator.pool.is_empty() and _ordens.is_empty():
		return
	_tempo += delta * velocidade
	_posar()


## Põe o boneco no tempo de agora, solta os eventos e desenha.
func _posar() -> void:
	if esqueleto == null:
		return
	# G5: o `Actor.pose` do Python — o corpo do instante (9.13), a animação,
	# os `reset` da física cruzados desde o quadro passado, o mundo, e as
	# entidades encaixadas (7.11).
	var t := _tempo
	if _animacao != null:
		var duracao: float = _animacao.duration
		if _laco and duracao > 0:
			t = fposmod(_tempo, duracao)
		elif t > duracao:
			t = duracao
	var pedidos := {}
	for slot_name in _ordens:
		var o: Dictionary = _ordens[slot_name]
		pedidos[slot_name] = [o["animacao"], _relogio - float(o["inicio"]), o["laco"]]
	_ator.ordens = pedidos
	esqueleto = _ator.pose(_animacao, t, _tempo, _laco, _anterior)
	if _animacao != null:
		_soltar_eventos(_animacao.duration)
	_soltar_eventos_dos_filhos()
	# G7: o tempo das partículas é o da ANIMAÇÃO (a volta do laço tirada); sem
	# laço ele segue além do fim, como no Python (`now_animation_time`).
	esqueleto.playing_animation = _animacao
	esqueleto.playing_loop = _laco and _animacao != null
	esqueleto.playing_time = _tempo
	if _animacao != null and _laco and _animacao.duration > 0:
		esqueleto.playing_time = fposmod(_tempo, _animacao.duration)
	_desenhar()
	for w in esqueleto.warnings:
		_avisar(w)
	for w in _ator.warnings:
		_avisar(w)
	if _animacao != null and not _laco and not _terminou and _tempo >= _animacao.duration:
		_terminou = true
		terminou.emit(tocando)


## O que `vivas` (partículas) lê de um esqueleto posado no nascimento: o
## `slot_by_name`, e de cada slot a matriz (`frame()`). Uma cópia, para guardar.
class _SlotFixo:
	var quadro

	func frame():
		return quadro


class _PoseFixa:
	var slot_by_name := {}


## A pose no instante `birth` (7.2 da `BONE_particles`), como o `pose_em` do
## Python: a animação nesse instante, a física do zero, o mundo. Só os slots
## que têm emissor se guardam; com emissor de malha nada se guarda (a malha
## precisa do esqueleto inteiro), e a resposta é o esqueleto que posa.
func _pose_no_nascimento(birth: float):
	if _poses_guardadas.has(birth):
		return _poses_guardadas[birth]
	var p = _posador
	for c in p.constraints:
		if c.has_method("reset_state"):
			c.reset_state()  # a física começa do zero, como num esqueleto novo
	if _animacao != null:
		var tempo := birth
		if _laco and _animacao.duration > 0:
			tempo = fposmod(birth, _animacao.duration)
		A.apply_animation(p, _animacao, tempo)
		A.fire_physics_resets(p, _animacao, -INF, birth, _laco)
	else:
		p.set_to_setup_pose()
	p.update_pose(birth)
	if _emissor_com_malha:
		return p
	var fixa := _PoseFixa.new()
	for nome in _slots_com_emissor:
		var slot = p.slot_by_name.get(nome)
		if slot == null:
			continue
		var s := _SlotFixo.new()
		s.quadro = E.Frame.of(slot.frame())
		fixa.slot_by_name[nome] = s
	if _poses_guardadas.size() > 4096:
		_poses_guardadas.clear()
	_poses_guardadas[birth] = fixa
	return fixa


## Os eventos entre o quadro passado e este (8.6). A conta é a do `fire_events`;
## aqui só se tira o número de voltas inteiras, para a conta não crescer com o
## tempo de jogo.
func _soltar_eventos(duracao: float) -> void:
	var anterior := _anterior
	var agora := _tempo
	_anterior = _tempo
	if agora <= anterior:
		return
	var base := 0.0
	if _laco and duracao > 0 and anterior > 0:
		base = floor(anterior / duracao) * duracao
	for e in A.fire_events(_ator.file_skeleton, _animacao, anterior - base, agora - base, _laco):
		var d: Dictionary = e.duplicate()
		d["time"] = float(e["time"]) + base
		evento.emit(C._str(e["event"]), d)


## Os eventos das entidades encaixadas desde o quadro passado (7.11), cada um
## com o nome `slot/evento`: o `nested_events` do Python, no relógio do filho.
func _soltar_eventos_dos_filhos() -> void:
	for e in Ator.nested_events(esqueleto, _tempo):
		evento.emit(C._str(e["event"]), e)


# ---------------------------------------------------------------------------
# A conexão (rodada G5; `08`, seção 4). A forma é a do `tocador.ts` do
# leitor do Construct (K5); a conta da entidade é a do `ator.gd`.
# ---------------------------------------------------------------------------

## ENCAIXAR: a entidade `peca` no slot `slot`. `peca` é o recurso
## (`preload("res://espada.bone")`) ou o caminho (`"res://espada.bone"`).
## Com `em_volta` (o "Este boneco", 7.11 `around`): o nome do slot DA PEÇA que
## marca o meio — o que ela tem antes dele fica atrás do boneco inteiro, o que
## tem depois, na frente. Vazio: a peça entra inteira, no lugar da imagem.
## Só aquele slot muda (as duas armas iguais). Slot ou peça que não existe:
## avisa, devolve false, e nada muda.
func encaixar(slot: String, peca, em_volta := "") -> bool:
	if dados == null:
		_avisar("encaixar(\"%s\"): nenhum boneco carregado" % slot)
		return false
	if not _tem_slot(slot, "encaixar"):
		return false
	var caminho := _caminho_da_peca(peca)
	var filho = _entidade(peca, caminho)
	if filho == null:
		return false
	var meio := em_volta.strip_edges()
	if meio != "" and filho.find_slot(meio) == null:
		_avisar("encaixar em volta: a peça \"%s\" não tem o slot \"%s\" para marcar o meio. Ela é desenhada em bloco (7.11)." % [caminho, meio])
	if _nomes_do_slot(slot).is_empty():
		_avisar("encaixar: o slot \"%s\" nunca mostra imagem (nem no repouso, nem numa skin, nem numa chave). A peça \"%s\" fica guardada nele, mas não aparece." % [slot, caminho])
	_encaixes.erase(slot)  # reencaixar põe o slot no fim da ordem dos encaixes
	_encaixes[slot] = {"caminho": caminho, "em_volta": meio if meio != "" else null}
	_ordens.erase(slot)  # peça nova: nenhuma ordem velha manda nela
	_refazer_encaixes()
	encaixado.emit(slot, caminho)
	return true


## DESENCAIXAR: tira o que o jogo encaixou no slot. A imagem de antes volta.
## Nada encaixado pelo jogo ali: não é erro. Slot que não existe: avisa.
func desencaixar(slot: String) -> bool:
	if dados == null or not _tem_slot(slot, "desencaixar"):
		return false
	var tinha_ordem := _ordens.erase(slot)
	if not _encaixes.erase(slot):
		if tinha_ordem:
			_posar()
		return true
	_refazer_encaixes()
	return true


## ENCAIXAR TODAS (as rodas): troca a peça `de` pela `para` em TODO slot que
## a mostra agora — os que o jogo encaixou e os que o arquivo traz. Devolve
## quantos slots trocou; nenhum é aviso.
func encaixar_todas(de, para, em_volta := "") -> int:
	if dados == null:
		_avisar("encaixar_todas: nenhum boneco carregado")
		return 0
	var origem := _caminho_da_peca(de)
	var alvos: Array = []
	for s in esqueleto.slots:
		if origem != "" and peca_do_slot(s.name) == origem:
			alvos.append(s.name)
	if alvos.is_empty():
		_avisar("encaixar_todas: nenhum slot mostra a peça \"%s\" agora. Nada mudou." % origem)
		return 0
	var n := 0
	for nome in alvos:
		if encaixar(nome, para, em_volta):
			n += 1
	return n


## O que o slot mostra agora: o caminho da entidade, o nome da imagem, ou ""
## quando nada.
func peca_do_slot(slot: String) -> String:
	if dados == null or not _tem_slot(slot, "peca_do_slot"):
		return ""
	var s = esqueleto.slot_by_name.get(slot)  # o corpo de agora pode não ter
	var att = esqueleto.attachment_for(s)[0] if s != null else null
	if att == null:
		return ""
	if att is C.SkeletonAttachment:
		if _encaixes.has(slot):
			return _encaixes[slot]["caminho"]
		return _pasta.path_join(att.resolved)
	return att.name


## ANIMAR A PEÇA: a entidade do slot toca `animacao`, do começo, num relógio
## dela (a velocidade do boneco vale; a pausa também). Vale para a peça que o
## jogo encaixou e para a que o arquivo traz. Uma chave `nested/animation` da
## animação do boneco vence (quem escolheu na faixa manda, `08` 6.2): a ordem
## espera, e o leitor avisa. Slot sem entidade, ou animação que a peça não
## tem: avisa, devolve false, e nada muda.
func animar_peca(slot: String, animacao: String, em_laco := true) -> bool:
	if dados == null or not _tem_slot(slot, "animar_peca"):
		return false
	var peca = _dados_da_peca(slot)
	if peca == null:
		_avisar("animar_peca: o slot \"%s\" não mostra entidade agora. Nada mudou." % slot)
		return false
	if peca.find_animation(animacao) == null:
		var tem: Array = []
		for a in peca.animations:
			tem.append(a.name)
		_avisar("animar_peca: a peça do slot \"%s\" não tem a animação \"%s\". Nada mudou. Tem: %s" % [slot, animacao, ", ".join(tem)])
		return false
	_ordens[slot] = {"animacao": animacao, "laco": em_laco, "inicio": _relogio}
	_posar()
	return true


## SOLTAR A PEÇA: ninguém manda nela — nenhuma animação por cima, a pose de
## repouso dela (a `baseAnimation`, se o arquivo der uma, continua embaixo).
func soltar_peca(slot: String) -> bool:
	if dados == null or not _tem_slot(slot, "soltar_peca"):
		return false
	_ordens[slot] = {"animacao": null, "laco": false, "inicio": _relogio}
	_posar()
	return true


## Os nomes dos slots do boneco (o limite do slot é do jogo: ele lê daqui).
func slots() -> PackedStringArray:
	var out := PackedStringArray()
	if dados != null:
		for s in dados.slots:
			out.append(s.name)
	return out


## As entidades carregadas: as que o arquivo traz e as que o jogo encaixou.
func entidades() -> PackedStringArray:
	var out := PackedStringArray()
	if dados == null:
		return out
	for skin in dados.skins:
		for slot_name in skin.attachments:
			for n in skin.attachments[slot_name]:
				var a = skin.attachments[slot_name][n]
				if a is C.SkeletonAttachment and a.child != null and skin != _skin_encaixes:
					var c := _pasta.path_join(a.resolved)
					if not out.has(c):
						out.append(c)
	for c in _entidades:
		if not out.has(c):
			out.append(c)
	return out


## Onde está o osso, no espaço do nó (Y para baixo, com a `escala`). Osso que
## não existe: avisa, e Vector2.ZERO.
func osso_posicao(nome: String) -> Vector2:
	var osso = _osso(nome)
	if osso == null:
		return Vector2.ZERO
	return Des.virar_y(osso.world_x, osso.world_y, escala)


## O ângulo do osso, em graus, no espaço do nó (o `rotation_degrees` do
## Godot: com o Y para baixo, o giro troca de sinal). Osso que não existe: 0.
func osso_angulo(nome: String) -> float:
	var osso = _osso(nome)
	if osso == null:
		return 0.0
	return -rad_to_deg(atan2(osso.c, osso.a))


## Onde está o PINO da peça do slot, no espaço do nó: o osso do slot (com a
## chave `slot/bone`, 9.5) vezes o `x, y, rotation, scale` da imagem ou da
## entidade que ele mostra agora. Malha ou slot vazio: o osso do slot.
func slot_posicao(nome: String) -> Vector2:
	var m = _quadro_do_slot(nome)
	if m == null:
		return Vector2.ZERO
	return Des.virar_y(m.world_x, m.world_y, escala)


## O ângulo do pino da peça do slot, em graus, no espaço do nó.
func slot_angulo(nome: String) -> float:
	var m = _quadro_do_slot(nome)
	if m == null:
		return 0.0
	return -rad_to_deg(atan2(m.c, m.a))


func _osso(nome: String):
	if esqueleto == null:
		return null
	var osso = esqueleto.bone_by_name.get(nome)
	if osso == null:
		_avisar("osso \"%s\": o boneco não tem esse osso. Tem: %s" % [nome, ", ".join(esqueleto.bone_by_name.keys())])
	return osso


func _quadro_do_slot(nome: String):
	if esqueleto == null or not _tem_slot(nome, "slot_posicao/slot_angulo"):
		return null
	var slot = esqueleto.slot_by_name.get(nome)
	if slot == null:
		_avisar("slot \"%s\": o corpo de agora não tem esse slot" % nome)
		return null
	var f = slot.frame()
	if not f is E.Frame:
		f = E.Frame.of(f)
	var att = esqueleto.attachment_for(slot)[0]
	if att is C.RegionAttachment or att is C.SkeletonAttachment:
		return f.times_trs(att.x, att.y, att.rotation, att.scale_x, att.scale_y)
	return f


## O slot existe? Senão avisa com a lista (regra 21).
func _tem_slot(slot: String, gesto: String) -> bool:
	if dados.find_slot(slot) != null:
		return true
	_avisar("%s: o boneco não tem o slot \"%s\". Tem: %s" % [gesto, slot, ", ".join(slots())])
	return false


## O caminho de uma peça: o do recurso, ou o texto. "" quando não é nenhum.
func _caminho_da_peca(peca) -> String:
	if peca is Arq:
		return peca.resource_path
	if typeof(peca) == TYPE_STRING or typeof(peca) == TYPE_STRING_NAME:
		return str(peca)
	return ""


## Os dados da peça, lidos uma vez (com o atlas e as imagens dela, da pasta
## DELA). Null com aviso quando não acha ou não abre.
func _entidade(peca, caminho: String):
	if caminho == "":
		_avisar("encaixar: a peça tem de ser um arquivo do Recorte (preload) ou o caminho dele. Nada mudou.")
		return null
	if _entidades.has(caminho):
		return _entidades[caminho]
	var bytes = peca.bytes if peca is Arq else bytes_de(caminho)
	if bytes == null:
		_avisar("encaixar: não achei a peça \"%s\". Nada mudou." % caminho)
		return null
	var pasta := caminho.get_base_dir()
	var r := C.load_skeleton_bytes(bytes, func(uri: String): return bytes_de(pasta.path_join(uri)))
	if r["dados"] == null:
		_avisar("encaixar: a peça \"%s\" não abriu: %s. Nada mudou." % [caminho, r["erro"]])
		return null
	var filho = r["dados"]
	for w in filho.warnings.messages:
		_avisar("%s: %s" % [caminho.get_file(), w])
	for m in filho.missing:
		_avisar("%s: arquivo que falta: %s" % [caminho.get_file(), m])
	_entidades[caminho] = filho
	_carregar_texturas(filho, pasta, pasta, {})
	return filho


## As imagens das páginas de `data` e de tudo o que ele traz (filhos, corpos).
## `raiz` é a pasta do arquivo aberto primeiro: os caminhos dos filhos são
## dela (o `resolved` do carregador). Mesma imagem em duas pastas: a primeira
## vence, e avisa (a peça do desenhador é pelo nome da imagem).
func _carregar_texturas(data, pasta: String, raiz: String, vistos: Dictionary) -> void:
	if vistos.has(data):
		return
	vistos[data] = true
	for atlas in data.atlases:
		for page in atlas.pages:
			var c := pasta.path_join(page.image)
			if _texturas.has(page.image):
				if _origem_das_texturas.get(page.image, c) != c:
					_avisar("a imagem \"%s\" existe em duas pastas (%s e %s): vale a primeira" % [page.image, _origem_das_texturas[page.image], c])
				continue
			_texturas[page.image] = _textura(c)
			_origem_das_texturas[page.image] = c
	for skin in data.skins:
		for slot_name in skin.attachments:
			for n in skin.attachments[slot_name]:
				var a = skin.attachments[slot_name][n]
				if a is C.SkeletonAttachment and a.child != null:
					_carregar_texturas(a.child, raiz.path_join(a.resolved.get_base_dir()), raiz, vistos)
	for uri in data.bodies:
		_carregar_texturas(data.bodies[uri], raiz.path_join(C._join(data.skeletons_base, uri).get_base_dir()), raiz, vistos)


## Os dados da entidade que o slot mostra agora, ou null.
func _dados_da_peca(slot: String):
	var s = esqueleto.slot_by_name.get(slot)
	var att = esqueleto.attachment_for(s)[0] if s != null else null
	return att.child if att is C.SkeletonAttachment else null


## Todo placeholder que o slot pode pedir: o do repouso, os de toda skin do
## arquivo, os das chaves `slot/attachment` de toda animação. A skin dos
## encaixes cobre todos: é assim que nenhuma chave desfaz o encaixe.
func _nomes_do_slot(slot: String) -> Array:
	var nomes: Array = []
	var sd = dados.find_slot(slot)
	if sd.attachment != null:
		nomes.append(sd.attachment)
	for skin in dados.skins:
		if skin == _skin_encaixes:
			continue
		for n in skin.attachments.get(slot, {}):
			if not nomes.has(n):
				nomes.append(n)
	for anim in dados.animations:
		for tl in anim.timelines:
			if tl.type == "slot" and tl.target == slot and tl.property == "attachment":
				for k in tl.keys:
					if typeof(k.value) == TYPE_STRING and not nomes.has(k.value):
						nomes.append(k.value)
	return nomes


## O que o placeholder `nome` do slot mostraria SEM os encaixes: as skins do
## jogo, a de cima vence (4.4). Devolve [achou, anexo ou null].
func _debaixo(slot: String, nome: String) -> Array:
	var cadeia: Array = []
	for s in _pilha:
		_expandir(s, cadeia)
	for i in range(cadeia.size() - 1, -1, -1):
		var bucket = cadeia[i].attachments.get(slot)
		if bucket != null and bucket.has(nome):
			return [true, bucket[nome]]
	return [false, null]


func _expandir(nome: String, cadeia: Array) -> void:
	var skin = dados.find_skin(nome)
	if skin == null or cadeia.has(skin):
		return
	for inc in skin.includes:
		_expandir(inc, cadeia)
	cadeia.append(skin)


## Refaz a skin dos encaixes a partir do mapa, e a põe no topo da pilha.
func _refazer_encaixes() -> void:
	var corpos: Array = [dados]
	for uri in dados.bodies:
		corpos.append(dados.bodies[uri])
	if _skin_encaixes != null:
		for d in corpos:
			d.skins.erase(_skin_encaixes)
	_skin_encaixes = null
	var skin = null
	for slot_name in _encaixes:
		var e: Dictionary = _encaixes[slot_name]
		var filho = _entidades[e["caminho"]]
		for nome in _nomes_do_slot(slot_name):
			var d := _debaixo(slot_name, nome)
			# Placeholder escondido de propósito (null): a peça some com ele.
			if d[0] and d[1] == null:
				continue
			var imagem = d[1]
			var att := C.SkeletonAttachment.new()
			att.type = "skeleton"
			att.name = nome
			att.uri = e["caminho"]
			att.resolved = e["caminho"]
			att.child = filho
			att.around = e["em_volta"]
			# O pino: o mesmo `x, y, rotation, scaleX, scaleY` da imagem (7.11,
			# 7.3). SUPOSIÇÃO (a do Construct): imagem sem pino (malha), ou
			# nenhuma imagem, cai na origem do osso.
			if imagem is C.RegionAttachment or imagem is C.SkeletonAttachment:
				att.x = imagem.x
				att.y = imagem.y
				att.rotation = imagem.rotation
				att.scale_x = imagem.scale_x
				att.scale_y = imagem.scale_y
			if skin == null:
				skin = C.SkinData.new()
				skin.name = SKIN_DOS_ENCAIXES
			if not skin.attachments.has(slot_name):
				skin.attachments[slot_name] = {}
			skin.attachments[slot_name][nome] = att
	_skin_encaixes = skin
	if skin != null:
		for d in corpos:
			d.skins.append(skin)
	_trocar_pilha()


func _desenhar() -> void:
	var pecas := Des.para_godot(Des.pecas_do_quadro(esqueleto, _avisos_do_desenho), escala)
	for w in _avisos_do_desenho.novos():
		_avisar(w)
	for item in _itens:
		RenderingServer.canvas_item_clear(item)
	var usados := 0
	var chave_atual := ""
	var item := RID()
	for p in pecas:
		var chave: String = p["mistura"] + ("|pre" if p["premultiplicada"] else "")
		if usados == 0 or chave != chave_atual:
			item = _item(usados, chave)
			usados += 1
			chave_atual = chave
		var textura = _texturas.get(p["pagina"])
		RenderingServer.canvas_item_add_triangle_array(item, p["indices"], p["pontos"], p["cores"], p["uv"],
			PackedInt32Array(), PackedFloat32Array(), textura.get_rid() if textura != null else RID())


## O item de desenho número `i`, com a mistura da chave. Um item por troca de
## mistura, na ordem: é assim que a ordem de desenho (7.13) passa ao Godot.
func _item(i: int, chave: String) -> RID:
	while _itens.size() <= i:
		var novo := RenderingServer.canvas_item_create()
		RenderingServer.canvas_item_set_parent(novo, get_canvas_item())
		RenderingServer.canvas_item_set_draw_index(novo, _itens.size())
		if dados != null and dados.pixel_art:
			RenderingServer.canvas_item_set_default_texture_filter(novo, RenderingServer.CANVAS_ITEM_TEXTURE_FILTER_NEAREST)
		_itens.append(novo)
	# A mistura normal é a do Godot sem material nenhum (Mix): não se põe material.
	var m = _material(chave)
	RenderingServer.canvas_item_set_material(_itens[i], m.get_rid() if m != null else RID())
	return _itens[i]


## 7.12 no Godot: normal → Mix, additive → Add, multiply → Mul. Página com
## alpha multiplicado: Premult Alpha no normal; nos outros, avisa.
func _material(chave: String):
	if chave == "normal":
		return null
	if _materiais.has(chave):
		return _materiais[chave]
	var m := CanvasItemMaterial.new()
	var partes := chave.split("|")
	var mistura := partes[0]
	var pre := partes.size() > 1
	if mistura == "additive":
		m.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	elif mistura == "multiply":
		m.blend_mode = CanvasItemMaterial.BLEND_MODE_MUL
	elif pre:
		m.blend_mode = CanvasItemMaterial.BLEND_MODE_PREMULT_ALPHA
	else:
		m.blend_mode = CanvasItemMaterial.BLEND_MODE_MIX
	if pre and mistura != "normal":
		_avisar("mistura %s numa página de alpha multiplicado: o Godot desenha como se não fosse" % mistura)
	_materiais[chave] = m
	return m


## A imagem da página. Primeiro a importada pelo Godot (é a que vai junto ao
## exportar o jogo); se não houver, a lida direto do disco.
func _textura(caminho: String) -> Texture2D:
	if ResourceLoader.exists(caminho):
		var t = load(caminho)
		if t is Texture2D:
			return t
	var imagem := Image.load_from_file(ProjectSettings.globalize_path(caminho))
	if imagem == null:
		_avisar("não achei a imagem \"%s\": o que é dela não será desenhado" % caminho)
		return null
	return ImageTexture.create_from_image(imagem)


func _avisar(texto: String) -> void:
	if avisos.has(texto):
		return
	avisos.append(texto)
	print("[Recorte] " + texto)
