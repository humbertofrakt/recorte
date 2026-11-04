# Relatório — DragonBones e Spriter (animação 2D por ossos)

Pesquisa feita em 06/09/2026. `docs.egret.com` e `brashmonkey.com` recusaram acesso automático. Usei os repositórios oficiais no GitHub, `dragonbones.github.io`, loja Steam e buscas.

---

## A) DragonBones (DragonBones Pro 5.6 → LoongBones)

### 1. Modelo de dados (JSON 5.5)
- **Raiz**: `name`, `version`, `compatibleVersion`, `frameRate` (padrão 24), `armature[]`.
- **Armature** (esqueleto): `bone[]`, `slot[]`, `skin[]`, `ik[]`, `animation[]`, `defaultActions`.
- **Bone**: `name`, `parent`, `transform` (x, y, skX/skY = rotação/skew, scX/scY = escala).
- **Slot**: `name`, `parent` (osso), `displayIndex`, `blendMode`, `color`, `zOrder`.
- **Skin → slot → display[]**. Tipos de display: `image`, `armature` (armature filha aninhada), `mesh` (vertices, uvs, triangles, weights por osso), `boundingBox` (colisão).
- **IK**: `target`, `bone`, `chain` (nº de ossos), `bendPositive`, `weight`.
- **Animação**: timelines de osso (translate, rotate, scale), de slot (display, color), `ffd` (deformação de mesh), `ik`, `zOrder`, e frames de ação/evento. Cada frame tem `duration`, `tweenEasing` ou `curve [x1,y1,x2,y2]` (bezier).
- **Atlas**: JSON separado com `imagePath` e lista `SubTexture`.

### 2. Ferramentas do editor (Pro 5.x)
- Criação de ossos, slots, hierarquia; pivô; ferramenta Pose com IK multi-osso.
- Mesh: edição de malha, pesos automáticos e manuais por vértice.
- Constraints IK: 1 ou 2 ossos; keyframes de bend e weight; linhas vermelha (IK) e verde (FK).
- Timeline com keyframes, velocidade, tween; editor de curvas; onion skin; bounding boxes.
- Importa camadas do Photoshop, Flash Pro, Spine e Cocos. Empacota atlas de textura.
- Armatures aninhadas e "movie clips" (sequências de frames).

### 3. Recursos de animação
Tween com curvas bezier, IK animável, FFD de mesh, troca de display (skins), cor por slot, z-order animado, eventos e ações por frame, animação aninhada.

### 4. Exportação e formatos
- Projeto: `.dbproj`.
- Saída: skeleton `.json` ou binário `.dbbin` + atlas `.json` + `.png`.
- Também exporta Egret MovieClip, sequências de imagem e GIF.
- Formatos documentados: 4.0/4.5, 5.0, 5.5.

### 5. Runtimes e engines
Todos MIT no GitHub: **DragonBonesJS** (Egret, PixiJS, Phaser, Hilo, Cocos Creator), **DragonBonesCPP** (Cocos2d-x, SFML), **DragonBonesCSharp** + **DragonBonesUnity**, **DragonBonesAS** (Flash), **Godot-DragonBones** (GDExtension Godot 4). Comunidade: MonoGame, HaxeFlixel, StageXL, Defold, axmol.

### 6. Licenciamento / status
- Runtimes: **open source, MIT, ainda mantidos** (commits em 2025–2026).
- Editor **DragonBones Pro**: gratuito, mas **não open source**. Última versão desktop é a **5.6.3 (2020)**; o site antigo saiu do ar.
- O projeto foi **renomeado LoongBones**: editor **online** (HTML5, nuvem), gera o mesmo formato DragonBones.

### 7. Elogios e críticas
- **Elogios**: gratuito; IK com um clique; simples de aprender; bom para rig e mesh básicos; muitos runtimes.
- **Críticas**: menos recursos que Spine; ajustar pesos de mesh à mão é lento; depende de Photoshop/Illustrator; editor desktop parado desde 2020; editor não é open source; migração para ferramenta online gera insegurança.

---

## B) Spriter Pro e Spriter 2 (BrashMonkey)

### 1. Modelo de dados (SCML = XML, SCON = JSON; mesma estrutura)
- **spriter_data** → `folder`/`file` (imagens, pivô) → `entity[]`.
- **Entity**: `obj_info[]` (tipos: `bone`, `sprite`, `box` = colisão, `point` = ponto de ação, `sound`, `entity` = sub-entidade), `character_map[]` (troca ou oculta um arquivo por outro), `variable`, `animation[]`.
- **Animation**: `mainline` (keys com `bone_ref` e `object_ref` — hierarquia, z-order e qual timeline usa), `timeline[]` (keys com x, y, angle, scale, pivot, alpha, `spin`), `eventline`, `soundline`, `meta` (`varline`, `tagline`).
- **Curvas por key**: instant, linear, quadratic, cubic, quartic, quintic, bezier.
- **Sem meshes nem IK salvos** no SCML; IK é só ferramenta de pose no editor.

### 2. Ferramentas do editor (Spriter Pro)
- Ferramenta de osso; ligar sprites a ossos; trocar parent, adicionar/remover ossos e trocar sprites no meio da animação.
- IK para posar; character maps; sub-entidades; pontos de ação; caixas de colisão; variáveis e tags; sons por frame com volume; lip-sync via Papagayo.
- Z-order por frame; edição de curvas; "deformação" experimental.

### 3. Recursos de animação
Tween com 7 tipos de curva, reaproveitar animações, blending em runtime, gatilhos de som e evento, troca de skin via character map, animação modular.

### 4. Exportação e formatos
- Projeto/dados: `.scml` (XML) e `.scon` (JSON).
- Também: spritesheets, sequências PNG, GIF animado.
- Spriter 2 (beta): formato novo, ainda em mudança.

### 5. Runtimes e engines
- Oficiais/apoiados: Unity, Construct 2/3, C#, C++, JavaScript, MonoGame.
- Comunidade: **SpriterDotNet** (C#, Unity, MonoGame, zlib), **spriter.ts**, Java, Haxe, Godot, Defold, AGK. Os runtimes cobrem ossos, curvas, pontos, caixas, sub-entidades, eventos, sons, variáveis, tags e character maps — **não IK**.

### 6. Licenciamento / status
- **Spriter Pro**: comercial, fechado, ~R$ 106 na Steam (nov/2014). Sem atualizações relevantes há anos. Royalty-free.
- **Spriter 2**: em desenvolvimento desde 2019. Beta em 2026: z-order animável, deformação por "atratores", malha de deformação, desenho e frame-a-frame no mesmo app. Upgrade grátis para quem tem Pro. Feito em Unity.
- Nenhum dos dois é open source; só runtimes de terceiros.

### 7. Elogios e críticas
- **Elogios**: preço acessível; simples para animação modular; tweening suave; bom para iniciantes; 70% positivo na Steam.
- **Críticas**: travamentos; interface desajeitada; timeline difícil; sem mesh real e sem onion skin no Pro; export de spritesheet ruim; um sprite não aceita vários ossos; anos de espera pelo Spriter 2.

---

## Resumo em uma linha cada
- **DragonBones**: formato JSON rico (mesh, IK, skins, eventos), runtimes MIT vivos, editor desktop morto (2020) e substituído pelo LoongBones online.
- **Spriter**: formato SCML/SCON simples (sem mesh/IK nos dados), Pro estagnado, Spriter 2 em beta em 2026 após 7 anos.

## URLs consultadas
- https://github.com/DragonBones
- https://github.com/DragonBones/DragonBonesJS
- https://github.com/DragonBones/DragonBonesCPP
- https://github.com/DragonBones/Tools/blob/master/doc/dragonbones_json_format_5.5.md
- https://dragonbones.github.io/en/animation.html
- https://github.com/dragonbones/loongbones-doc/blob/main/en/editor/loongbones.md
- https://www.loongbones.com/doc/en/tutorial/editor
- https://docs.cocos.com/creator/2.4/manual/en/asset-workflow/dragonbones.html
- https://www.slant.co/topics/588/versus/~spine_vs_dragonbones-pro_vs_spriter
- https://store.steampowered.com/app/332360/Spriter_Pro/
- https://steamcommunity.com/app/332360/negativereviews/?browsefilter=toprated
- https://store.steampowered.com/news/app/332360/view/497219150210400270
- https://github.com/loodakrawa/SpriterDotNet
- https://github.com/flyover/spriter.ts
