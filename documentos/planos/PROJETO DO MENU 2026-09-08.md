# Projeto do menu do Recorte — feito a partir dos manuais dos outros programas

Escrito em 08/09/2026 pelo planejador, a pedido do Humberto.
Ordem dele: **ler os manuais dos melhores programas e projetar o nosso em cima deles.**

## O que foi lido

| Programa | Manual lido | Onde está o que foi lido |
|:---:|:---:|:---:|
| Spine | sim, 20 páginas do manual oficial | `documentos/pesquisa/manuais/Spine - menus e organizacao 2026-09-08.md` |
| Spriter Pro | sim, 36 páginas, o manual inteiro | `documentos/pesquisa/manuais/Spriter - menus e organizacao 2026-09-08.md` |
| Live2D Cubism | sim, os 9 menus, item por item, e os 77 atalhos | `documentos/pesquisa/manuais/DragonBones e Live2D - menus e organizacao 2026-09-08.md` |
| DragonBones | **não**: o site oficial não abriu. Só trechos de busca | mesmo arquivo, parte 1 |
| Moho | sim, os 9 menus, o tocador e os atalhos | `documentos/pesquisa/manuais/Moho e Aseprite - menus 2026-09-08.md` |
| Aseprite | sim, os 8 menus, o tocador e os atalhos | mesmo arquivo |
| Blender, Unity, Godot | só as convenções, lidas antes pelo pesquisador | `documentos/pesquisa/menu/04` |

---

## 1. O que os manuais mostram sobre a barra de menus

| Programa | Barra de menus | Menus |
|:---:|:---:|:---|
| Live2D | clássica, completa | File · Edit · **Show** · **Modeling** · **Animation** · **Window** · Help |
| DragonBones | clássica | File · Edit · View · Window · Help |
| Aseprite | clássica | File · Edit · Sprite · Layer · Frame · Select · View · Help |
| Moho | clássica | File · Edit · Draw · **Bone** · **Animation** · Scripts · View · Window · Help |
| Spine | **um menu só**, no logo | Abrir · Salvar · Importar · Exportar · Configurações |
| Spriter | quase nada no menu | File · Edit. O resto vive em botão de paleta e em Alt + arrastar |
| **Recorte hoje** | incompleta | Arquivo · Editar (2 itens) · Ajuda (1 item) |

**O que dá para aprender:**

1. Quatro dos seis têm a barra clássica: **Arquivo · Editar · Exibir · [o assunto do programa] · Animação · Janela · Ajuda**.
2. O menu "do assunto" muda de nome: Live2D chama **Modeling**, Moho chama **Bone**. No Recorte é **Esqueleto**.
3. Spine não tem barra e compensa com **caixa "Views"**, **abas** e **68 atalhos**. Spriter não tem e é **criticado** por isso: função só no botão direito, ninguém acha. O Spriter 2 anunciou que vai trazer tudo à vista.
4. Live2D põe **cada palette** no menu Window. Spine põe na caixa Views. Os dois têm **"voltar ao padrão"** do layout.
5. Live2D põe **travar** e **esconder** no menu (Ctrl+2, Ctrl+3). Spriter põe em botão acima da cena (7 8 9 0). Nós já temos os dois: fica assim.
6. Todo atalho aparece **escrito ao lado do item**. Live2D e Aseprite deixam **remapear** (Ctrl+Alt+Shift+K nos dois).
7. Moho só mostra o menu **Bone** quando uma camada de osso está ativa. Live2D só mostra **Mesh Edit** dentro da edição de malha. Menu que muda com o contexto é normal. No Recorte, **Esqueleto** fica sempre, mas as entradas que não valem no modo ficam cinza.
8. Aseprite põe **Timeline (Tab)**, **Home** e **Onion Skin** no menu View. Moho põe **Reset Bone** e **Reset All Bones** no menu Bone. Os dois entram no nosso.

**Conclusão:** o Recorte precisa da barra clássica com 7 menus. Nada some da tela: o botão continua onde está. O menu é o lugar onde se **descobre** a função e o atalho.

---

## 2. O que os manuais mostram sobre o resto da tela

| Assunto | Spine | Live2D | Spriter | O que o Recorte faz hoje | O que fazer |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Ferramentas | uma barra, embaixo da cena, ícone ou texto (opção) | uma barra em cima, muda com a área de trabalho | uma seção pequena | **3 linhas** de texto em cima | uma linha de ícones com dica. Opção "mostrar nome" como o Spine |
| Zoom | canto inferior esquerdo: 100% e ajustar. Roda | Ctrl+0 tudo, F foco. Roda | roda, Ctrl+Espaço | **uma linha inteira** com 3 botões | canto da cena. Roda |
| Painéis | abas que se arrastam. F9 esconde tudo. Views para recuperar | menu Window abre cada um. Reset layout | paletas fixas | **6 empilhados** | abas em 2 grupos. Tab esconde. Janela → Voltar ao padrão |
| Tocador | dentro do Dopesheet | em cima da Timeline | dentro da Timeline | **escondido** no painel Animações | primeira linha da linha do tempo |
| Tocar/pausar | D | Enter | 4 | sem tecla | Espaço |
| Repetir | Ctrl+R | botão na Timeline | não documentado | botão escondido, não grava | L, gravado no arquivo |
| Chave anterior/seguinte | S / W | J / K | 1 / 2 | ↑ / ↓ | ↑ / ↓ |
| Só do escolhido | — | Shift+J / Shift+K | Shift+1 / Shift+2 | não tem | Shift+↑ / Shift+↓ |
| Chavear | K | (por parâmetro) | Key All / Key Selected | botão | K |
| Setup ⇄ Animate | ícone no canto da cena | troca de área de trabalho | não tem | botão no painel Animações | **também** no menu Animação e na barra |
| Botão direito na cena | volta à ferramenta anterior | — | menus (criticado) | nada | volta à ferramenta anterior |
| Virar filho | P | — | segurar B | P (feito) | P |
| Ordem de desenho | + e − | Change draw order | Ctrl+↑↓ | arrastar na Árvore | + e − |
| Renomear | F2, duplo clique | — | duplo clique | duplo clique | F2 e duplo clique |
| Buscar na árvore | filtro | Ctrl+F | — | não tem | Ctrl+F |
| Histórico de seleção | Page Up/Down | — | — | não tem | depois |
| Atalhos remapeáveis | sim | sim, Ctrl+Alt+Shift+K | — | não | depois. Primeiro a tabela |

---

## 3. O menu do Recorte, item por item

Sete menus. Cada linha diz o **atalho** e **onde a função mora hoje**.
"novo" = ainda não existe no programa. O menu chama a **mesma função** do botão: nunca uma cópia.

### Arquivo

| Item | Atalho | Hoje |
|:---|:---:|:---:|
| Novo | Ctrl+N | menu |
| Abrir… | Ctrl+O | menu |
| Abrir recente ▸ | | novo |
| Salvar | Ctrl+S | menu |
| Salvar como… | Ctrl+Shift+S | menu |
| Salvar como binário… | | menu |
| Salvar como pacote… | | menu |
| ─ | | |
| Importar ▸ de outro programa… · PSD… · imagens… | | menu |
| Exportar ▸ glTF… · imagem… · por pele… | | menu |
| ─ | | |
| Sair | | novo |

O que sai daqui: **Reempacotar atlas** vai para Esqueleto. É coisa do esqueleto, não do arquivo. Live2D faz igual: Texture Atlas fica em Modeling.

### Editar

| Item | Atalho | Hoje |
|:---|:---:|:---:|
| Desfazer [nome do passo] | Ctrl+Z | menu |
| Refazer [nome do passo] | Ctrl+Y | menu |
| ─ | | |
| Copiar | Ctrl+C | só chaves, na linha do tempo |
| Colar | Ctrl+V | só chaves |
| Colar em todas as chaves | Ctrl+Shift+V | novo (Spriter) |
| Apagar | Delete | botão na Árvore e na linha do tempo |
| ─ | | |
| Selecionar tudo | Ctrl+A | novo |
| Desmarcar | Esc | tecla |
| Renomear | F2 | duplo clique |
| Buscar na Árvore… | Ctrl+F | novo (Spine, Live2D) |
| ─ | | |
| Copiar âncora do desenho | | novo (Spriter) |
| Colar âncora nos desenhos | | novo |
| ─ | | |
| Preferências… | | novo (Moho, Aseprite). Nome das ferramentas, atalhos |

### Exibir

| Item | Atalho | Hoje |
|:---|:---:|:---:|
| Ossos | 7 | painel Exibição, tecla |
| Desenhos | 9 | painel Exibição, tecla |
| Nomes dos ossos | | painel Exibição |
| Pontos | | painel Exibição |
| Caixas | | painel Exibição |
| Malhas · Arestas · Pesos | | painel Exibição |
| Grade | | painel Exibição |
| Eixos | | painel Exibição |
| Casca de cebola | | painel Exibição |
| Casca de cebola: opções… | | painel Exibição |
| ─ | | |
| Aproximar | Ctrl+= | botão |
| Afastar | Ctrl+− | botão |
| Tamanho real (100%) | Ctrl+0 | novo (Live2D) |
| Ajustar à tela | Ctrl+Shift+F | botão |
| Enquadrar seleção | F | novo (Live2D, Unity) |
| ─ | | |
| Mostrar nome das ferramentas | | novo (Spine) |

Cada caixa aparece **marcada** no menu quando está ligada. É o mesmo dado do painel Exibição.

### Esqueleto

É o menu "do assunto". Live2D chama Modeling, Moho chama Bone.

| Item | Atalho | Hoje |
|:---|:---:|:---:|
| Novo ▸ Osso | | botão na Árvore |
| Novo ▸ Slot | | botão na Árvore |
| Novo ▸ Imagem no slot… | | novo |
| Novo ▸ Ponto | | novo. Formato pronto |
| Novo ▸ Caixa de colisão | | novo. Formato pronto |
| Novo ▸ Máscara | | novo. Formato pronto |
| Novo ▸ Esqueleto filho… | | novo. Formato pronto |
| Novo ▸ Regra ▸ IK · Transformar · Caminho · Física · Deslizante | | botão na Árvore |
| Novo ▸ Evento · Pele · Parâmetro | | botão na Árvore |
| ─ | | |
| Virar filho de… | P | tecla |
| Subir na ordem de desenho | + | arrastar na Árvore (Spine: +) |
| Descer na ordem de desenho | − | arrastar na Árvore |
| ─ | | |
| Travar ossos | 8 | botão, tecla |
| Travar desenhos | 0 | botão, tecla |
| Travar o escolhido | Ctrl+2 | cadeado na Árvore (Live2D: Ctrl+2) |
| Destravar tudo | Ctrl+Alt+2 | novo (Live2D) |
| ─ | | |
| Voltar o osso à pose de repouso | | novo (Moho: Reset Bone). Em Animando grava a chave com o valor da montagem |
| Voltar todos os ossos à pose de repouso | | novo (Moho: Reset All Bones) |
| ─ | | |
| Compensar ▸ filhos · desenhos · caixas | | 3 caixas na barra de cima |
| Eixos ▸ Local · Pai · Mundo | | 3 botões na barra de cima |
| ─ | | |
| Reempacotar atlas | | menu Arquivo |

### Animação

| Item | Atalho | Hoje |
|:---|:---:|:---:|
| Montagem ⇄ Animando | | botão "Voltar à montagem" |
| Nova animação | | botão no painel Animações |
| Duplicar · Renomear · Apagar animação | | botões no painel Animações |
| Mudar duração… | | novo (Spriter) |
| Repetir | L | botão escondido; passa a gravar no arquivo |
| ─ | | |
| Tocar / Pausar | Espaço | botão escondido |
| Tocar para trás | Shift+Espaço | novo (Spine: A, Blender) |
| Início · Fim | Home · End | botões |
| Quadro anterior · seguinte | ← · → | botões |
| Chave anterior · seguinte | ↑ · ↓ | botões |
| Chave anterior · seguinte do escolhido | Shift+↑ · Shift+↓ | novo (Spriter, Live2D) |
| ─ | | |
| Chavear | K | botão |
| Gravar sozinho | A | caixa |
| Apagar chave | | botão |
| Interpolação ▸ Linear · Suave · Parada · Curva… | | painel Curvas |
| ─ | | |
| Selecionar todas as chaves | Ctrl+A na linha do tempo | novo (Moho) |
| Esticar seleção… | | segunda barra (Moho: Rescale Keyframes) |
| Espelhar no tempo | | segunda barra |
| Fechar ciclo | | segunda barra |
| Espelhar esquerda e direita… | | segunda barra |

Os quatro últimos são de vez em quando. Saem das barras permanentes e ficam **só aqui** e no botão **⋯ Mais** da linha do tempo.

### Janela

Live2D: menu Window abre cada palette. Spine: caixa Views. Os dois têm "voltar ao padrão".

| Item | Atalho | Hoje |
|:---|:---:|:---:|
| Árvore | | sempre aberto |
| Propriedades | | sempre aberto |
| Animações | | sempre aberto |
| Exibição | | dobrado |
| Prévia | | dobrado |
| Malha e pesos | | dobrado |
| Linha do tempo | | aba de baixo |
| Curvas | | aba de baixo |
| ─ | | |
| Esconder painéis | Tab | novo (Spine: F9. Aseprite: Tab) |
| Voltar ao padrão | | novo (Live2D, DragonBones) |

Cada painel aparece **marcado** quando está aberto.

### Ajuda

| Item | Atalho | Hoje |
|:---|:---:|:---:|
| Manual | F1 | menu |
| Atalhos do teclado | Shift+F1 | novo. Tabela gerada dos próprios menus |
| Sobre o Recorte | | novo. Versão, licença |

---

## 4. As teclas: o que veio de onde

| Tecla | Faz | Copiado de |
|:---:|:---|:---:|
| Espaço | tocar / pausar | Blender, Moho (na linha do tempo), Unity, Godot. Aseprite e Live2D usam Enter |
| Shift+Espaço | tocar para trás | Blender (Rewind), Spine (A) |
| L | repetir | proposta do pesquisador; Spine usa Ctrl+R, Live2D botão |
| K | chavear | Spine |
| A | gravar sozinho | proposta do pesquisador (DragonBones tem o botão) |
| ↑ ↓ | chave anterior / seguinte | Blender |
| Shift+↑ ↓ | só do escolhido | Spriter (Shift+1 2), Live2D (Shift+J K) |
| ← → | quadro | todos |
| Home End | início / fim | Live2D, Blender |
| F | enquadrar seleção | Live2D, Unity |
| Ctrl+0 | 100% | Live2D (Display All), Spriter |
| Ctrl+Shift+F | ajustar à tela | Live2D (Shift+F = área toda). Moho e Aseprite usam Home |
| Ctrl+= Ctrl+− | aproximar / afastar | Blender (Numpad), Spriter (Ctrl+Espaço) |
| P | virar filho | Spine. Spriter usa B |
| + − | ordem de desenho | Spine |
| 7 8 9 0 | ver / travar ossos e desenhos | Spriter |
| Ctrl+2 | travar o escolhido | Live2D |
| F2 | renomear | Spine |
| Ctrl+F | buscar | Live2D |
| Ctrl+A | selecionar tudo | Live2D, Spriter, Moho, Aseprite |
| Ctrl+Shift+V | colar em todas as chaves | Spriter |
| Tab | esconder painéis | Aseprite (View → Timeline, Tab). Spine usa F9 |
| F1 | manual | todos |
| botão direito na cena | ferramenta anterior | Spine |

Conflitos evitados: Spine usa Q W E R S D F A para o tocador. Nós já usamos Q W E R nas ferramentas, como Unity. Fica ↑ ↓ ← → Home End para o tempo, como Blender.

---

## 5. O que muda na ordem dos lotes

O Humberto pediu o menu. O menu vira **o primeiro lote**. Motivo técnico também: `ui/menus.ts` é dado puro e testável, e dá **endereço** para tudo o que vem depois. Cada lote seguinte só liga o botão à entrada que já existe.

| Versão | Lote | O que entra |
|:---:|:---:|:---|
| v1.6 | **menus** | os 7 menus da seção 3. Entrada cinza quando a função ainda não existe, com a dica "vem no lote N". Ajuda → Atalhos gerada dos menus. Botão direito na cena |
| v1.7 | zoom | item 14 |
| v1.8 | tocador | itens 6, 7 |
| v1.9 | lista de desenhos e semáforo | itens 9, 10 |
| v2.0 | resumo | item 8 |
| depois | uma linha de ícones, abas, Ponto, Caixa, Máscara… | lotes 4 a 10 do `07` |

O `PLANO rodada 1` é atualizado com esse lote na frente.

---

## 6. Regras que os manuais deixam e que valem para nós

| Regra | Quem | Como fica no Recorte |
|:---|:---:|:---|
| Toda função tem lugar no menu, com atalho escrito ao lado | Live2D, Moho, Aseprite | os 7 menus. Nenhum item sem nome |
| Menu não esconde botão | Live2D (palettes continuam) | o botão continua onde está |
| O painel nunca some de verdade | Spine ("Views select box") | Janela lista todos. Voltar ao padrão |
| Botão direito não é o único caminho | crítica ao Spriter 1 | botão direito só como atalho |
| Ícone tem dica com nome e tecla | Spine (opção texto/ícone) | `title` e `aria-label` em todo botão |
| Travar e esconder são dois pares separados | Spriter (7 8 9 0), Live2D (Ctrl+2, Ctrl+3) | como já está, mais no menu |
| Uma tabela de atalhos | Spine (cheat sheet), Live2D (lista) | Ajuda → Atalhos, gerada dos menus |
