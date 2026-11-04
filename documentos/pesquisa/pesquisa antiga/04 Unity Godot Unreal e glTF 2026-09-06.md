# Animação 2D esquelética embutida nas engines + glTF 2.0

Pesquisa feita em 06/09/2026.

## A) Unity — pacote 2D Animation

**Modelo de dados.** Os bones são criados no **Skinning Editor** (módulo do Sprite Editor) e gravados como *sprite/skin data* dentro do importador da textura — não existe um arquivo de rig separado. Em cena, o componente **Sprite Skin** representa cada bone por um Transform de GameObject. Cada sprite tem malha própria e pesos por vértice.

**Ferramentas (Skinning Editor).** Create/Edit/Split Bone, reparent; Auto Geometry, Create Vertex/Edge, Split Edge; Auto Weights, Weight Slider, Weight Brush; Bone Influence / Sprite Influence; Preview Pose; Copy/Paste de bones+malha (com flip).

**PSD Importer** (pacote separado). Importa `.psb` e `.psd`; cada camada vira um Sprite; "Character Rig" remonta o prefab na posição original das camadas; "Mosaic" gera o atlas. Ignora blend modes, opacidade de camada e efeitos.

**Sprite Library / Sprite Swap.** *Sprite Library Asset* organiza sprites em Categorias/Labels; *Sprite Resolver* pede um sprite por categoria+label em runtime (troca de roupa, expressões). Os sprites trocados **precisam ter esqueleto idêntico**.

**Animação.** Animator Controller: máquina de estados com transições, parâmetros, camadas com máscaras, sub-state machines, e **Blend Trees** (1D, 2D, direct). **IK** via pacote *2D IK*: solvers **Limb** (2 bones), **CCD** e **FABRIK**, com effector, target, weight, chain length, iterations.

**Formatos.** Entrada: PSB/PSD, PNG/atlas. Não há exportação do rig para formato aberto; o rig vive nos metadados do asset Unity.

**Limitações.** Deformação por GPU só no URP; sprites trocados exigem esqueleto idêntico; upgrade de pacote tem passos manuais.

---

## B) Godot 4

**Modelo de dados.** **Skeleton2D** é o ponto de acesso a uma hierarquia de nós **Bone2D**; guarda o *rest pose*. **Bone2D** tem `rest`, `length`, `bone_angle`. Tudo é nó da árvore de cena — o rig é salvo no `.tscn`/`.scn`.

**Deformação.** **Polygon2D** com `skeleton` + lista de bones e `bone_weights` por vértice; `internal_vertex_count` e `polygons` permitem triangulação mais fina. Pesos pintados no editor de UV. Cutout rígido também é possível: nós Sprite2D em cadeia hierárquica, RemoteTransform2D para ordem de profundidade.

**Ferramentas.** Editor de UV/pesos do Polygon2D, toolbar do Skeleton2D (rest pose), timeline do AnimationPlayer com keys seletivas e easing em lote.

**Animação.** **AnimationPlayer**: tracks de propriedade (Continuous/Discrete/Capture; interpolação Nearest/Linear/Cubic), chamada de método, bezier, áudio. **AnimationTree** adiciona **Blend2/3, BlendSpace1D/2D, OneShot, TimeScale, TimeSeek, Transition, StateMachine** (crossfade, *advance conditions/expressions*, `travel()`), além de root motion.

**IK e modificadores.** `SkeletonModificationStack2D` com **CCDIK, FABRIK, TwoBoneIK, LookAt, Jiggle, PhysicalBones**. Tudo marcado **experimental**. O tutorial de cutout avisa que as cadeias IK funcionam **só no editor, não em runtime**.

**Formatos.** 2D: PNG/atlas + cena Godot. 3D: **glTF 2.0 recomendado**, .blend, FBX via ufbx, Collada, OBJ. Godot **exporta glTF** no editor e em runtime.

**Limitações.** Modificadores 2D experimentais; IK 2D não roda em runtime; pesos do Polygon2D exigem retriangulação manual; sem importador nativo de PSD em camadas.

---

## C) Unreal Engine 5 (referência)

**Paper2D.** **Sprites**, **Flipbooks** (sequência de sprites) e **TileSet/TileMap**. **Não oferece bones 2D** — animação é quadro a quadro. Para esqueleto 2D o caminho comum é plugin externo (Spine, Creature) ou mesh 3D plano.

**Pipeline 3D.** **Animation Blueprint** controla o Skeletal Mesh: AnimGraph com **State Machines**, Blend Spaces e nós de blend/IK. **Control Rig** riga e anima dentro da engine (**Full-Body IK**), usável no Sequencer.

**Formatos.** **FBX** é o principal via **Interchange** (UE 5.4+ unifica FBX/glTF/OBJ). **glTF**: importação e exportação **experimental**. Importador trunca influências a 4 joints por vértice.

---

## glTF 2.0 — por que virou o "JPEG do 3D"

**Modelo de esqueleto.** `skin` = array `joints` + `inverseBindMatrices`. A malha traz `JOINTS_0`/`WEIGHTS_0` (4 joints por vértice por conjunto; mais conjuntos permitidos). **Animações** = `channels` (nó alvo + path `translation/rotation/scale/weights`) e `samplers` (tempos, valores, interpolação **STEP / LINEAR / CUBICSPLINE**). Dois contêineres: `.gltf` (JSON + .bin + imagens) e `.glb` (binário único).

**O que o consolidou.**
- **Aberto e royalty-free** pelo Khronos Group; 1.0 em 2015, 2.0 em 2017, publicado como **ISO/IEC 12113:2022**.
- **Spec formal** em HTML/PDF + **JSON Schema** oficial — dá para validar mecanicamente.
- **Validador oficial** (Apache 2.0): CLI, npm, e versão web drag-and-drop; gera relatório JSON.
- **Extensões com governança**: prefixo `KHR_` (ratificadas), `EXT_` multi-vendor, prefixos de vendedor; `extensionsUsed`/`extensionsRequired` no arquivo.
- **Adoção**: Blender nativo, Godot, Unreal, three.js/Babylon, Sample Viewer do Khronos. Foco em *entrega* (leve) e não em edição — a mesma divisão de papéis do JPEG.

**Nota comparativa.** glTF é 3D; um rig 2D pode ser representado como malhas planas com skins, mas não há extensão KHR específica para sprites/atlas 2D — formatos 2D como Spine e DragonBones continuam proprietários.

---

## URLs consultadas

Unity
- https://docs.unity3d.com/Packages/com.unity.2d.animation@17.0/manual/index.html
- https://docs.unity3d.com/Packages/com.unity.2d.animation@10.0/manual/SkinningEditor.html
- https://docs.unity3d.com/Packages/com.unity.2d.animation@17.0/manual/CharacterRig.html
- https://docs.unity3d.com/Packages/com.unity.2d.animation@10.0/manual/SpriteSwapIntro.html
- https://docs.unity3d.com/Packages/com.unity.2d.animation@10.0/manual/2DIK.html
- https://docs.unity3d.com/Packages/com.unity.2d.psdimporter@16.0/manual/index.html
- https://docs.unity3d.com/Manual/AnimationStateMachines.html
- https://docs.unity3d.com/Manual/class-BlendTree.html

Godot
- https://docs.godotengine.org/en/stable/classes/class_skeleton2d.html
- https://docs.godotengine.org/en/stable/classes/class_bone2d.html
- https://docs.godotengine.org/en/stable/classes/class_polygon2d.html
- https://docs.godotengine.org/en/stable/classes/class_skeletonmodification2d.html
- https://docs.godotengine.org/en/stable/tutorials/animation/2d_skeletons.html
- https://docs.godotengine.org/en/stable/tutorials/animation/cutout_animation.html
- https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html
- https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/available_formats.html

Unreal
- https://dev.epicgames.com/documentation/en-us/unreal-engine/paper-2d-overview-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/control-rig-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprints-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/gltf-in-unreal-engine

glTF
- https://www.khronos.org/gltf/
- https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/README.md
- https://github.com/KhronosGroup/glTF/tree/main/extensions
- https://github.com/KhronosGroup/glTF-Validator
- https://github.com/KhronosGroup/glTF-Tutorials/blob/main/gltfTutorial/gltfTutorial_020_Skins.md
- https://github.com/KhronosGroup/glTF-Tutorials/blob/main/gltfTutorial/gltfTutorial_007_Animations.md
