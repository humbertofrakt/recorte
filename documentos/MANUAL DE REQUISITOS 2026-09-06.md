# MANUAL DE REQUISITOS — Animador por Ossos para Jogos

Versão 0.1 · 06/09/2026
Base: manuais do Spine, DragonBones, Spriter, Live2D, Creature, Unity, Godot, Unreal, Blender, Moho, Cascadeur, Adobe Animate e o padrão glTF.
Relatórios completos em `documentos\pesquisa\`.

---

## 1. A ideia central

O PDF virou padrão porque o **formato** é aberto, estável e qualquer programa lê.
O glTF virou o "JPEG do 3D" pelo mesmo motivo.

Então a regra número um é:

> **O padrão é o ARQUIVO, não o programa.**
> O programa é só a melhor forma de criar esse arquivo.

Hoje nenhum formato 2D por ossos é aberto de verdade. Spine, DragonBones, Live2D e Creature usam JSON próprio. É esse buraco que o projeto preenche.

---

## 2. O que aprendemos com cada programa

| Programa | Ponto forte | Ponto fraco |
|:---:|:---:|:---:|
| **Spine** | Modelo de dados completo. Runtimes para tudo. Física. | Caro. Runtime exige licença. Versão do editor tem que bater com o runtime. |
| **DragonBones** | Grátis. Formato JSON rico. Runtimes MIT. | Editor morreu em 2020. Ninguém confia mais. |
| **Spriter** | Barato. Simples. Character maps. | Sem mesh no formato. Sete anos esperando o Spriter 2. |
| **Live2D** | Deformers e física de cabelo. Padrão VTuber. | Assinatura. Versão grátis limitada. Sem 360°. |
| **Creature** | Motores procedurais. Ciclo de andar em minutos. | Comunidade pequena. Documentação fraca. |
| **Unity 2D** | Dentro da engine. Sprite swap. IK. | Rig preso à Unity. Não exporta. |
| **Godot** | AnimationTree com state machine. glTF nativo. | IK 2D só no editor. Tudo experimental. |
| **Unreal** | Control Rig e state machines 3D. | Não tem ossos 2D. |
| **Blender** | Grátis. NLA, constraints, Rigify. | É 3D. Pesado para 2D. |
| **Moho** | Smart Bones. Exporta glTF. | Sem pintura de peso por vértice. |
| **Cascadeur** | AutoPosing e AutoPhysics por IA. | Não cria rig. Assinatura. |
| **Animate** | Asset Warp fácil. | Não exporta esqueleto. Em manutenção. |
| **glTF** | Aberto, spec formal, validador, extensões. | Só 3D. Não tem sprite nem atlas. |

---

## 3. Requisitos

Legenda: **[M]** = obrigatório · **[I]** = importante · **[D]** = desejável

### 3.1 Formato de arquivo (o coração do projeto)

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| F1 | Formato **aberto e sem royalties**, com especificação escrita e pública. | [M] |
| F2 | Duas versões do mesmo arquivo: **texto (JSON)** para ler e **binário** para o jogo. | [M] |
| F3 | **JSON Schema** oficial. Qualquer arquivo pode ser validado por máquina. | [M] |
| F4 | **Validador oficial** gratuito, em linha de comando e na web. | [M] |
| F5 | Arquivo velho abre em programa novo. **Sempre.** | [M] |
| F6 | Sistema de **extensões** com prefixo, como o glTF (`KHR_`, `EXT_`, marca própria). | [M] |
| F7 | Versão gravada dentro do arquivo. Runtime avisa se não souber ler. | [M] |
| F8 | Nunca exigir reexportar tudo a cada versão do programa (erro do Spine). | [M] |
| F9 | Um único arquivo pode carregar esqueleto, animações, atlas e imagens juntos (`.glb` faz isso). | [I] |
| F10 | Governança pública: quem decide o que entra no formato e como. | [I] |
| F11 | Caminho para virar norma ISO, como o PDF e o glTF. | [D] |

### 3.2 Modelo de dados

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| D1 | **Esqueleto** com hierarquia de ossos. Um osso raiz. | [M] |
| D2 | Osso com posição, rotação, escala e **shear**. Herança desligável por propriedade. | [M] |
| D3 | **Slots** presos a ossos. Ordem de desenho. Cor e alpha. Blend modes. | [M] |
| D4 | **Attachments**: imagem, mesh, caixa de colisão, máscara (clipping), caminho (path), ponto. | [M] |
| D5 | **Mesh** com vértices, arestas, hull e triangulação. | [M] |
| D6 | **Pesos** por vértice ligando a vários ossos. Sem limite fixo de quatro. | [M] |
| D7 | **Skins**: trocar peça, roupa ou personagem inteiro sem mexer no esqueleto. Skins combináveis. | [M] |
| D8 | **Eventos** nomeados com número, texto e áudio. | [M] |
| D9 | **Constraints**: IK, transform, path e física. Todas com "mix" de 0 a 1. | [M] |
| D10 | **Sequências** de imagens dentro de um attachment (frame a frame misturado com ossos). | [I] |
| D11 | **Esqueleto aninhado**: um personagem dentro de outro (DragonBones, Spriter). | [I] |
| D12 | **Parâmetros** numéricos que movem várias coisas de uma vez (Live2D, Smart Bones do Moho). | [I] |
| D13 | **Morph targets** / blend shapes (Blender, Live2D). | [I] |
| D14 | **Variáveis e tags** por animação (Spriter). | [D] |
| D15 | Metadados livres por objeto, para engines guardarem o que quiserem. | [D] |

### 3.3 Editor — rigging

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| R1 | Modos separados: **Setup** (rig) e **Animar**. | [M] |
| R2 | Criar osso, mudar pai, comprimento, cor, ícone. | [M] |
| R3 | **Importar PSD** com camadas já posicionadas. Nativo e rápido. | [M] |
| R4 | Gerar mesh automática. Traçar hull automático. Editar vértice a vértice. | [M] |
| R5 | **Pesos automáticos** por topologia. Pincéis para ajustar. Suavizar, podar, travar. | [M] |
| R6 | Ferramenta de **pose com IK ao vivo**. | [M] |
| R7 | Eixos local, pai e mundo. **Compensação**: mover osso sem mover os filhos. | [M] |
| R8 | Mesh ligada (linked mesh): várias imagens dividem a mesma malha e pesos. | [I] |
| R9 | Modo **pixel art** (sem subpixel, sem filtro). | [I] |
| R10 | Espelhar rig e pesos (esquerda ↔ direita). | [I] |
| R11 | Aviso de problemas com correção automática (Spine 4.3). | [I] |
| R12 | **Templates de rig** (humanoide, quadrúpede) como o Rigify e o Cascadeur. | [D] |
| R13 | Auto-rig por IA: reconhecer partes e sugerir ossos. | [D] |

### 3.4 Editor — animação

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| A1 | **Dopesheet**: só o tempo das chaves. Mover, copiar, escalar, espelhar. | [M] |
| A2 | **Graph editor**: curvas valor × tempo. Stepped, linear, Bézier. Curva por eixo. | [M] |
| A3 | Chave em **qualquer propriedade**: osso, slot, cor, attachment, deform, ordem, evento, constraint. | [M] |
| A4 | **Onion skin** com antes/depois, cores, silhueta e deslocamento para ver "pé escorregando". | [M] |
| A5 | **Camadas de animação** (tracks, NLA): andar embaixo, atirar em cima só nos braços. | [M] |
| A6 | **Loop** com curvas que fecham. Ciclos sem pulo. | [M] |
| A7 | Prévia em tempo real com **mix** entre animações, dentro do editor. | [M] |
| A8 | Presets de easing (ease in/out, bounce, elastic). | [I] |
| A9 | Referência de **vídeo ou imagem** no fundo (rotoscopia). | [I] |
| A10 | Áudio na timeline com forma de onda. Lip sync básico. | [I] |
| A11 | Ações reutilizáveis: uma animação usada como controle (Sliders do Spine, Smart Bones do Moho). | [I] |
| A12 | Tween machine / breakdown automático entre duas poses. | [D] |
| A13 | Auto-pose por IA (Cascadeur). | [D] |

### 3.5 Procedural e física

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| P1 | **Física de osso**: inércia, força, amortecimento, massa, vento, gravidade. Roda no jogo. | [M] |
| P2 | IK de 1, 2 e N ossos (Limb, CCD, FABRIK). Direção da dobra. Stretch. | [M] |
| P3 | Osso segue caminho (path constraint). | [M] |
| P4 | Física convertível para chaves (bake) quando o jogo não quiser simular. | [I] |
| P5 | **Motores procedurais** do Creature: ciclo de andar, bater asas, piscar, corda. | [I] |
| P6 | Física de pêndulo em cadeia para cabelo e roupa (Live2D). | [I] |
| P7 | Campo de força e vento por cena. | [D] |
| P8 | Ragdoll: engine sobrescreve ossos em tempo real. | [D] |

### 3.6 Importação

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| I1 | PSD e PSB em camadas. | [M] |
| I2 | PNG soltos e atlas existentes. | [M] |
| I3 | **Importar projeto Spine, DragonBones e Spriter.** Sem isso ninguém migra. | [M] |
| I4 | Importar Live2D e Creature. | [I] |
| I5 | Importar glTF com skin (rig plano vindo do Blender ou Moho). | [I] |
| I6 | Krita, Clip Studio, Aseprite. | [D] |

### 3.7 Exportação

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| E1 | Formato próprio JSON e binário. | [M] |
| E2 | **Texture packer** embutido: recorte, rotação, padding, polígonos, várias escalas, premultiplied. | [M] |
| E3 | Exportar por skin ou por pasta. | [M] |
| E4 | **Linha de comando** para exportar em lote. | [M] |
| E5 | Sprite sheet, sequência PNG, GIF, vídeo. | [M] |
| E6 | glTF com esqueleto e animação (para engines 3D e Blender). | [I] |
| E7 | Player HTML para mostrar no navegador. | [I] |
| E8 | Exportar de volta para Spine JSON (compatibilidade com quem já usa). | [D] |

### 3.8 Runtimes (bibliotecas que rodam no jogo)

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| T1 | Runtime de referência em **C** ou **C++**, com wrappers gerados para as outras linguagens (Spine 4.3 faz assim). | [M] |
| T2 | Licença **MIT ou Apache**. Qualquer um usa, sem comprar o editor. | [M] |
| T3 | Runtimes oficiais: **Unity, Godot, Unreal, Web (JS/TS), C#, C++**. | [M] |
| T4 | Depois: Phaser, PixiJS, Flutter, iOS, Android, Defold, Construct, GameMaker, Bevy, Love2D. | [I] |
| T5 | O runtime faz: carregar, posar, **mix entre animações** com tracks, trocar skin e attachment, colisão por bounding box, clipping, eventos como callback, física. | [M] |
| T6 | Suite de **testes de conformidade**: todo runtime tem que passar. Igual navegador com HTML. | [M] |
| T7 | **Visualizador** de referência para conferir um export (Skeleton Viewer). | [M] |
| T8 | Teste comparativo: mesma cena, mesmo pixel, em todos os runtimes. | [I] |

### 3.9 Licença e modelo de negócio

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| L1 | **Formato**: aberto, sem royalties, para sempre. | [M] |
| L2 | **Runtimes**: código aberto, MIT. Nunca exigir licença do editor (erro do Spine). | [M] |
| L3 | **Editor**: dar todo o rig e animação na versão gratuita. Sem "capar" IK e mesh (erro do Spine Essential). | [M] |
| L4 | Ganhar dinheiro com: nuvem, colaboração, recursos de estúdio, suporte, IA, marketplace. | [I] |
| L5 | Licença **perpétua** disponível. Assinatura afasta gente (Live2D, Cascadeur, Adobe). | [I] |
| L6 | Plano de continuidade: se a empresa parar, o editor vira open source (erro do DragonBones). | [I] |

### 3.10 Comunidade e documentação

| # | Requisito | Prioridade |
|:---:|:---|:---:|
| C1 | Manual completo, público, com imagens. Em inglês e português desde o início. | [M] |
| C2 | Exemplos oficiais: personagem completo com rig, skins, física e todas as animações. | [M] |
| C3 | Fórum ou Discord oficial. | [M] |
| C4 | Repositório público dos runtimes e da spec, com changelog e issues. | [M] |
| C5 | Vídeos curtos por ferramenta. Academia gratuita. | [I] |
| C6 | Programa para engines menores integrarem (documentação de runtime "como fazer o seu"). | [I] |

---

## 4. O que NÃO fazer

Erros que mataram ou travaram os outros:

1. **Prender o runtime ao editor.** Spine faz isso e é a queixa nº 1.
2. **Cobrar pelo básico.** IK e mesh não são "pro". São o mínimo.
3. **Deixar o editor parar.** DragonBones morreu em 2020. Spriter 2 demorou sete anos.
4. **Quebrar arquivo velho.** Spine obriga reexportar tudo a cada versão.
5. **Só assinatura.** Live2D, Cascadeur e Adobe perdem usuários por isso.
6. **Rig preso à engine.** Unity e Godot não exportam. Ninguém leva o trabalho embora.
7. **Depender de Photoshop.** Aceitar PNG solto e outros editores de imagem.
8. **Documentação fraca.** Creature tem tecnologia boa e ninguém usa.

---

## 5. Ordem sugerida das fases

| Fase | Entrega |
|:---:|:---|
| 1 | **Especificação do formato** (texto + JSON Schema). Validador. Visualizador. |
| 2 | Runtime de referência em C++ com testes de conformidade. Wrapper Web. |
| 3 | Editor mínimo: ossos, slots, imagens, dopesheet, export. |
| 4 | Mesh, pesos, skins, IK, graph editor, onion skin. |
| 5 | Física, path, tracks, import Spine/DragonBones/Spriter. |
| 6 | Runtimes Unity, Godot, Unreal. Texture packer. CLI. |
| 7 | Procedural, IA, nuvem. |

A fase 1 é a mais importante. O formato vem antes do programa. Foi assim com o PDF e com o glTF.

---

## 6. Perguntas em aberto

Precisam de decisão sua antes da fase 1:

1. **Nome** do formato e extensão do arquivo.
2. Só **2D**, ou 2D e 3D no mesmo formato?
3. Código do **editor** aberto ou fechado?
4. Quem cuida da **governança**: fundação, empresa ou comitê?
