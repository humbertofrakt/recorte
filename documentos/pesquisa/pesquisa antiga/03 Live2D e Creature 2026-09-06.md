# Relatório: Live2D Cubism × Creature Animation

Pesquisa feita em 06/09/2026.

---

## A) Live2D Cubism

### 1. Modelo de dados
- **ArtMesh**: cada camada do PSD vira uma malha de triângulos. Tem clipping mask, blend mode e ordem de desenho.
- **Deformers**: pais dos ArtMeshes. Dois tipos: **Warp** (grade Bézier que distorce tudo dentro) e **Rotation** (gira sem o "encolhimento" da interpolação linear). Formam hierarquia pai-filho.
- **Parameters**: eixos numéricos (ex.: ângulo X, abertura da boca). Cada objeto guarda "keyforms" em pontos do parâmetro; o runtime interpola.
- **Parts**: pastas de objetos, com opacidade própria.
- **Blend Shapes**: parâmetros aditivos com limite de peso (5.x).
- Arquivos do editor: `.cmo3` (modelo), `.can3` (animação), `.cmp3`.

### 2. Ferramentas do editor
- Geração e edição de malha, deform paths, glue, clipping masks, texture atlas.
- Deformers warp/rotation; "Paste inverted shapes", "Restore deformer shapes" (5.2).
- Editor de parâmetros com lista padrão para VTuber.
- **Parameter Controller** (5.2): alça arrastável na tela que move vários parâmetros; pode seguir alvo.
- Animação: timeline, dope sheet, graph editor; export de vídeo/sequência.
- Cubism Viewer para testar modelo/motions/física.

### 3. Recursos de animação
- **Motions** por keyframe (curvas Bézier/linear/stepped).
- **Expressions**: presets aditivos de parâmetros.
- **Física**: modelo de **pêndulo** em cadeia. Entrada = parâmetros. Saída = parâmetros com % de influência. Organizado em **grupos** (cabelo, saia), com presets, FPS de cálculo (15–120). Há vento.
- **Lip sync** por volume do áudio e **Motion-sync** (áudio → visemas).
- Piscar automático, respiração, olhar/eye tracking via parâmetros.

### 4. Exportação e formatos
- `.moc3` (modelo binário compilado) + `.model3.json` (índice).
- `.motion3.json` (curvas), `.physics3.json`, `.exp3.json`, `.pose3.json`, `.cdi3.json`, `.userdata3.json`, `.motionsync3.json`.
- Vídeo, GIF, sequência PNG. Compatibilidade: arquivos antigos abrem em versões novas, não o contrário.

### 5. Runtimes / SDK
- **Cubism Core** (biblioteca fechada em C, com SIMD/NEON) + **Cubism Framework** (aberto).
- SDKs: **Unity**, **Native (C++)**, **Web (TS/JS)**, **Java (Android)**, **Unreal** (beta desde 2025), **Cocos Creator**.
- Apps de terceiros (VTube Studio etc.) usam o SDK.

### 6. Licenciamento
- **Editor FREE**: 30 parâmetros, 3 blend shapes, 100 ArtMeshes, 30 parts, 50 deformers, 1 textura 2048px, vídeo 720p.
- **Editor PRO**: assinatura. Indie ~US$15/mês, ~US$100/ano. Trial de 42 dias.
- **SDK Release License**: pessoas físicas e pequenas empresas isentas. Acima de certo faturamento precisa contrato pago.

### 7. Elogios e críticas
- **Elogiam**: padrão da indústria VTuber; preserva o traço original; física de cabelo/roupa convincente; versão gratuita funciona de verdade; SDK maduro em muitas engines.
- **Criticam**: curva de aprendizado alta; assinatura, sem licença perpétua; limites do FREE aparecem rápido; clipping masks aninhados "vazam"; modelos complexos pesam; sem giro 360°; exige arte pré-separada em camadas. Isso alimenta alternativas abertas como Inochi2D.

**URLs**: docs.live2d.com/en/cubism-editor-manual/top/ · docs.live2d.com/en/cubism-sdk-manual/top/ · docs.live2d.com/en/cubism-editor-manual/deformer/ · docs.live2d.com/en/cubism-editor-manual/physics-operation/ · live2d.com/en/cubism/comparison/ · live2d.com/en/sdk/license/ · live2d.com/en/cubism/update/5-2-00-update-information/ · community.live2d.com/discussion/1301/better-clipping-masks · alternativeto.net/software/live2d

---

## B) Creature Animation (Kestrel Moon)

### 1. Modelo de dados
- **Mesh Regions**: cada PNG importado vira uma região de malha (esculpir, subdividir, cortar).
- **Bones**: esqueleto hierárquico; **weights** pintados à mão ou por pesagem automática.
- **Motors**: componentes de comportamento presos a ossos ou malhas. São a unidade central do sistema.
- **Animations** (clipes), eventos, morph targets, skin swaps, vertex attachments guardados em metadados.

### 2. Ferramentas do editor
- Três modos sequenciais: **Meshing → Rigging → Animation**.
- FK/IK, pesagem automática, editor de curvas, onion skin, rotoscopia (imagem ou vídeo como guia), Motion Paths (splines), captura 2D de movimento, scripting por funções matemáticas.
- Pro: motores de deformação de malha, otimização de resolução de malha, animação por caminho.

### 3. Recursos de animação (procedurais e físicos)
- **Bone motors**: FK, IK, Smooth IK, IK Rotate, **Bend Physics** (caudas, cabelo), Pin Rope Physics (cordas), Rotate Cycle, Move Bounce, Free FK, **Leg Motor** (ciclo de caminhada automático), Custom Cycle, Reverse Foot, Path Bone.
- **Deform motors**: Blink, Cage (FFD), Control Points, Flap (asas), Physics (soft body/músculo), Simple Transform, Grid, Poly.
- **Force Field**: vento.
- Motores procedurais podem ser convertidos para FK e ajustados à mão.
- Em runtime: blending, bend physics ao vivo, IK em tempo real, override de ossos (ragdoll), point caching (2–3× mais rápido).

### 4. Exportação e formatos
- **JSON** (completo) e **FlatBuffers/FlatData** binário (ex.: 10,5 MB → 0,8 MB) + zip.
- **CreaturePack**: binário compacto só de malha, sem ossos/skin swap, para web/mobile (WebAssembly).
- Metadados `.mdata/.json` (ordem de regiões, eventos, bend physics, morphs, skins).
- Sprite sheets, sequência de imagens, GIF, vídeo, FBX.

### 5. Runtimes / SDK
- Código aberto no GitHub (kestrelm): **Unity**, **Unreal**, **Godot**, **Cocos2d-x**, **MonoGame**, **libGDX**, **Haxe**, **C++ genérico**, web: **PixiJS, Phaser, ThreeJS, BabylonJS, Cocos Creator**. Widget WebAssembly para sites.

### 6. Licenciamento
- **Perpétuo, por assento, updates grátis**. Basic US$50; Pro US$99; Enterprise US$800. Trial com tudo do Pro, sem exportar. Foco em Windows 64-bit.

### 7. Elogios e críticas
- **Elogiam**: preço baixo e perpétuo; motores procedurais economizam muito tempo (ciclo completo em 12 min contra 2h24 no Spine); mesh deformation e soft body avançados; formatos compactos e muitos runtimes gratuitos; usado por Ubisoft, NCSoft.
- **Criticam**: comunidade e documentação bem menores que Spine; runtimes mantidos por equipe pequena; interface e fluxo pouco familiares; quase nenhuma review pública; foco em Windows.

**URLs**: kestrelmoon.com/creature/creature2D.html · kestrelmoon.com/creature/purchase.html · kestrelmoon.com/creaturedocs/Overview/Main_Application_Modes.html · kestrelmoon.com/creaturedocs/Animation/Animation_Overview.html · kestrelmoon.com/creaturedocs/Game_Engine_Runtimes_And_Integration/Unity_Runtimes.html · github.com/kestrelm · slant.co/versus/1900/17857/~spine_vs_creature · alternativeto.net/software/creature/about
