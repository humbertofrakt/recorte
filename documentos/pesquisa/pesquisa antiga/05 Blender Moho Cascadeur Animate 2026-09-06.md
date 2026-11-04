# Relatório: animação por ossos em Blender, Moho, Cascadeur e Adobe Animate

Pesquisa feita em 06/09/2026. Foco: rig de personagens para jogos. `docs.blender.org` e `helpx.adobe.com` bloquearam leitura direta; o conteúdo veio dos trechos oficiais retornados pela busca. Moho e Cascadeur foram lidos direto.

---

## A) Blender (3D + Grease Pencil 2D)

**Modelo de ossos/rig**
- *Armature* = objeto com ossos. Cada osso tem raiz (head), ponta (tail) e *roll*. Head/tail têm raio, usado no método de deformação por *envelope*.
- Hierarquia pai/filho; modos Edit (pose de descanso) e Pose (animar).
- *Bendy Bones* (B-Bones): o osso vira um segmento de Bézier subdividido. Bom para cauda/coluna cartoon, mas exportadores de jogo não entendem B-Bones.

**Ferramentas de rig e pesos**
- Parenting *Armature Deform*: cria vertex groups com o nome de cada osso deformador.
- *Automatic Weights* (bone heat); *Auto Normalize* mantém a soma dos pesos em 1.
- Weight Paint: pincéis, suavizar, gradiente, espelhar.
- *Shape Keys*: Relativas (expressões faciais e corretivas) e Absolutas (morph em sequência). Podem ser dirigidas por *drivers* ligados a osso.
- *Rigify* (add-on oficial): meta-rig → *Generate Rig*. Gera membros com IK/FK (slider), coluna, rosto.

**Editores de animação**
- *Dope Sheet* (Dope Sheet, Action Editor, Shape Key Editor, Grease Pencil, Mask).
- *Graph Editor*: F-Curves, tangentes, interpolação/extrapolação, modificadores de F-Curve, Drivers.
- *NLA*: pilha de *tracks* com *strips* que instanciam *Actions*; blending, repetição, *Tweak Mode*.
- *Actions*: blocos nomeados e reutilizáveis (idle, walk, jump). Desde o 4.4 são *slotted*.

**Recursos**
- Constraints de osso: Copy Location/Rotation/Scale/Transforms, Limit, Transformation, IK, Spline IK, Damped Track, Track To, Stretch To, Child Of (troca de pai animável), Armature, Action. Todos com Influence animável.
- *IK*: comprimento de cadeia, pole target, iterações, stretch. *Auto IK* no Pose Mode.
- *Spline IK*: cadeia segue uma curva (cauda, tentáculo, corda).
- Física: Rigid Body, Cloth, Soft Body (precisam de *bake*).
- Onion skin: nativo no Grease Pencil.
- *Grease Pencil 2D rig* (cut-out): modificador *Armature* deforma traços por vertex group.

**Exportação**
- *FBX*: *Only Deform Bones*, *Add Leaf Bones*, *Bake Animation* com NLA Strips / All Actions / Simplify. Shape keys como blend shapes.
- *glTF 2.0*: skinning, *Deformation Bones Only*, shape keys como morph targets, animação por Actions / NLA Tracks / Scene.
- Restrição prática: até 4 influências por vértice e só ossos deformadores para motores de jogo.

**Licença**: GNU GPL v2+; tudo que você cria é seu.

Fontes: docs.blender.org/manual/en/latest/animation/armatures/... · .../animation/constraints/tracking/ik_solver.html · .../animation/constraints/tracking/spline_ik.html · .../editors/nla/introduction.html · .../animation/actions.html · .../grease_pencil/modifiers/deform/armature.html · .../addons/import_export/scene_fbx.html · .../addons/scene_gltf2.html · .../addons/rigify/basics.html

---

## B) Moho (ex-Anime Studio) — 2D

**Modelo de ossos/rig**
- Ossos vivem numa *Bone Layer*; camadas de vetor/imagem/grupo ficam como filhas e são "bindadas" (por camada, por ponto, ou *flexi-bind*).
- *Smart Bones*: seleciona-se um osso, cria-se uma *Action* com o nome dele e anima-se o que deve acontecer conforme o ângulo. Girar o osso reproduz aquela ação (joelho sem distorção, virada de cabeça, expressões, troca de *Switch Layer*).
- *Vitruvian Bones*: alterna conjuntos de ossos e desenhos (escorço).
- *Target Bones* (prender pés ao chão), *Control Bones* e *Delayed Constraints* (Moho 14).

**Ferramentas de deformação e pesos**
- *Mesh / Quad Mesh*: malha sobre imagem; *Warp using bones* — o osso mais próximo tem mais peso (força por raio do osso, não pintura vértice a vértice).
- *Smart Warp*: camada de malha que deforma vetor ou imagem; usada em head turns.
- *Curvers* (14): dobra vetores/imagens e anima largura de linha.
- *Switch Layers*: troca de desenhos (bocas, mãos) por keyframe ou Smart Bone.

**Editores de animação**: Timeline com canais por propriedade e *Graph Mode*; interpolações Smooth, Step, Ease In/Out, Bounce, Elastic; ciclos; *Actions* reutilizáveis.

**Recursos**: FK e IK; limites de ângulo; *Bone Dynamics* (follow-through), *Wind*, gravidade e física de camada (Pro); partículas; onion skin.

**Exportação**
- Vídeo/imagem/sequência PNG.
- *FBX* (Pro): esqueleto + imagens para Unity.
- *glTF/GLB* (14.4): esqueleto completo, *Actions* como clipes, Dynamic/Smart Bones, animação de pontos vira Morph Target. Alvos: Unity, Unreal, Godot, Blender.

**Licença**: proprietária, perpétua. Pro US$ 399,99; Debut US$ 59,99.

Fontes: moho.lostmarble.com/pages/features · moho.lostmarble.com/products/moho-pro-14 · moho.lostmarble.com/blogs/news/free-update-export-to-video-game-engines-with-the-moho-14-4-side-quest · lostmarble.com/moho/manual/ · moho.lostmarble.com/pages/buy

---

## C) Cascadeur — 3D, foco em animação corporal

**Modelo de ossos/rig**
- **Não cria esqueleto nem skinning**: o modelo entra já skinnado (FBX/DAE/USD). Constrói apenas um *control rig* por cima.
- *Quick Rigging Tool*: templates Humanoid e Quadruped; reconhece esqueletos padrão (UE Mannequin, Mixamo, Daz).

**Ferramentas de animação**
- *AutoPosing*: IA de pose — mover um controlador ajusta o corpo inteiro.
- *AutoPhysics*: analisa a animação e propõe versão fisicamente correta; trajetórias balísticas, movimento secundário.
- IK/FK com troca por track; *Interval Edit Mode*, *Tween Machine*.

**Editores**: Timeline, *Animation Tracks* como camadas, *Graph Editor*, *Ghosts* (onion skin 3D), referência de vídeo.

**Exportação**: FBX, DAE, USD; *bake* por quadro. Limites: nomes duplicados quebram a exportação, um único root bone.

**Licença**: assinatura. *Free* (sem exportar FBX), *Indie*, *Pro*, *Teams*.

Fontes: cascadeur.com/help/faq · cascadeur.com/help/rig · cascadeur.com/help/quick_rigging_tool · cascadeur.com/help/tools/animation_tools/autoposing · cascadeur.com/help/tools/physics_tools/autophysics · cascadeur.com/help/getting_started/export_fbxdae

---

## D) Adobe Animate — 2D

**Modelo de ossos/rig**
- *Bone tool* (IK clássico): armaduras sobre **símbolos** ou sobre uma **forma** vetorial. Pose é keyframe em *Pose Layer*.
- *Asset Warp* (2020+): malha triangulada sobre vetor ou bitmap; pins viram joints; ossos *hard* ou *soft*; slider de densidade de malha.

**Pesos**: sem pintura de pesos; a influência vem da malha e do tipo de osso.

**Editores**: Timeline por camadas/quadros; *Motion Editor* só para motion tweens. Não há NLA. Onion skin nativo.

**Recursos**: IK com limites de rotação e translação; *Spring* (Strength/Damping). Produto em **modo de manutenção**.

**Exportação**: sprite sheet e *texture atlas* (JSON + PNG) com plug-ins para Unity e Starling; HTML5 Canvas; vídeo. Não exporta esqueleto.

**Licença**: assinatura Creative Cloud.

Fontes: helpx.adobe.com/animate/using/bone-tool-animation.html · helpx.adobe.com/animate/using/character-rigging-in-animate.html · helpx.adobe.com/animate/how-to/asset-warping.html · helpx.adobe.com/animate/using/create-sprite-sheet.html

---

## Resumo comparativo (jogos)

| | Blender | Moho | Cascadeur | Animate |
|---|---|---|---|---|
| Cria esqueleto + pesos | Sim (3D e GP 2D) | Sim (2D) | Não (só control rig) | Sim (2D, sem pesos) |
| IK / constraints | Completo | FK/IK, ângulo, Smart Bones | IK/FK + IA | IK, limites, spring |
| Física | Rigid/Cloth (bake) | Bone Dynamics, Wind | AutoPhysics | Spring |
| NLA / camadas | NLA + Actions | Actions | Tracks | Não |
| Onion skin | GP sim | Sim | Ghosts | Sim |
| Export p/ engine | FBX, glTF | glTF (14.4), FBX | FBX, DAE, USD | Sprite sheet, atlas |
| Licença | GPL, grátis | Perpétua US$ 60/400 | Assinatura | Assinatura CC |
