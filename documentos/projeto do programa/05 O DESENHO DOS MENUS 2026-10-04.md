# O desenho dos menus — 04/10/2026

Rodada 5. Escrito por `EXECUTANDO · rodada 5 — o desenho dos menus`.
**Só desenho. Nenhum código foi mexido.** O Humberto risca; a rodada 6 constrói.

---

## A barra

**Arquivo · Editar · Imagens · Base · Malha e regras · Animação · Skins · Entidades · Partículas · Exibir · Janela · Ajuda**

| | Hoje | Desenho |
|:---|:---:|:---:|
| Menus | 7 | 12 |
| Itens de hoje | 232 | 232 (231 com lugar, 1 sai — ver a conta) |
| Maior menu, à vista | Animação, 66 | Animação, 21 |

**A ordem segue o trabalho**, como no Spriter:
trazer as imagens → montar a base → malha e regras → animar → vestir (skins) → encaixar (entidades) → efeito (partículas).
Exportar fica no **Arquivo**, como no Spriter e no Photoshop.

---

## Como ler as tabelas

| Marca | Quer dizer |
|:---|:---|
| **(novo)** | função que as decisões pedem e o programa ainda **não tem** |
| **(porta)** | função que **já existe** num painel ou botão, e **não tinha item de menu** |
| ↳ | dentro de um submenu |
| "De onde veio" | o menu de hoje. Nome em *itálico* = o nome de hoje, quando muda |

As **teclas não mudam.** Item com tecla continua com a mesma tecla, dentro ou fora de submenu.

---

## 1. Arquivo — 15 à vista

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Novo projeto… | **pede a pasta** e começa o projeto nela, como o Spriter **(novo: pedir a pasta)** | Arquivo |
| 1 | Abrir projeto… | abre um projeto salvo | Arquivo |
| 1 | Abrir recente… | os últimos que eu abri | Arquivo |
| 1 | Reabrir o fechado | traz de volta o trabalho da aba que fechou | Arquivo |
| 1 | Abrir o herói (exemplo) | abre o boneco de exemplo | Arquivo |
| 2 | Abrir pasta do projeto… | abre a pasta de trabalho | Arquivo |
| 3 | Importar ▸ | traz de fora | Arquivo |
| | ↳ De outro programa… | Spriter, Spine, DragonBones | Arquivo |
| | ↳ PSD… | as camadas viram imagens | Arquivo |
| | ↳ PSD com ossos… | a camada `ossos` vira esqueleto | Arquivo |
| | ↳ Animações, de outra base… | traz animações de outro boneco | Arquivo, *de outro corpo* |
| | ↳ Skin, de outro boneco… | traz uma skin de outro boneco | Arquivo, *Pele, de outro boneco* |
| 4 | Salvar | grava a pasta inteira | Arquivo |
| 4 | Salvar como… | grava com outro nome | Arquivo |
| 4 | Salvar a entidade editada… | Novo ou Por cima | Arquivo |
| 4 | Salvar como entidade… | o projeto vira entidade, para encaixar em outro **(novo)** | (novo) |
| 5 | Exportar ▸ | leva para fora | Arquivo |
| | ↳ GIF, PNG, folha, vídeo… | a animação em imagem | Arquivo |
| | ↳ Uma imagem por skin… | a mesma, uma vez por skin | Arquivo, *por pele* |
| | ↳ glTF, para programa 3D… | um `.glb` | Arquivo |
| | ↳ Salvar como binário… | `.boneb`, menor | Arquivo |
| | ↳ Salvar como pacote… | `.bonez`, tudo num arquivo | Arquivo |
| | ↳ Entregar uma base… | uma base sozinha para o jogo | Arquivo, *Entregar um corpo* |
| | ↳ Para o Godot… | **(novo — rodada 18)**. Só entra quando funcionar | (novo) |
| | ↳ Para o Construct… | **(novo — rodada 19)**. Só entra quando funcionar | (novo) |
| | ↳ Animações, para outra base… | leva animações a outro boneco | Arquivo, *para outro corpo* |
| | ↳ Skin, para outro boneco… | leva a skin a outro boneco | Arquivo, *Pele, para outro boneco* |
| 5 | Repetir a última exportação | Ctrl+Shift+E | Arquivo |
| 6 | Configurações do projeto… | | Arquivo |
| 7 | Sair | | Arquivo |

---

## 2. Editar — 18 à vista

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Desfazer | diz o que desfaz | Editar |
| 1 | Refazer | | Editar |
| 2 | Copiar | | Editar |
| 2 | Colar | | Editar |
| 2 | Recortar chaves | | Editar |
| 3 | Pose ▸ | copiar e colar a pose **(submenu novo)** | (novo, só a cabeça) |
| | ↳ Copiar a pose inteira | Ctrl+Shift+C | Editar |
| | ↳ Copiar a pose do escolhido | | Editar |
| | ↳ Colar em todas as chaves | Ctrl+Shift+V | Editar |
| | ↳ Colar espelhado | troca esquerda e direita | Editar |
| 4 | Duplicar | | Editar |
| 4 | Apagar | com uma skin em edição, o osso sai **só daquela skin** (decisão 3.5) | Editar |
| 5 | Selecionar tudo | | Editar |
| 5 | Desmarcar | | Editar |
| 5 | Renomear | | Editar |
| 5 | Inverter a seleção | | Editar |
| 5 | Substituir nomes… | | Editar |
| 5 | Buscar na Árvore… | | Editar |
| 6 | Escolher ▸ | | Editar |
| | ↳ Os filhos | | Editar |
| | ↳ Os pais | | Editar |
| 7 | Copiar posição no osso | | Editar |
| 7 | Colar posição no osso | | Editar |
| 8 | Preferências… | | Editar |

---

## 3. Imagens — 9 à vista (menu novo)

Trazer as imagens, pôr na cena, acertar o pivô.

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Recarregar a pasta | relê a pasta do disco | Arquivo |
| 1 | Trocar pasta de origem… | as imagens passam a ser as de outra pasta | Arquivo |
| 2 | Pôr imagem na cena… | a imagem entra presa ao osso escolhido | Esqueleto → Novo |
| 2 | Opções do desenho… | **a grade** do botão direito: imagens **e entidades** | Esqueleto |
| 2 | Trazer como sequência | a subpasta numerada vira uma sequência | (porta) aba Imagens, botão direito na pasta |
| 3 | Definir pivô… | | Esqueleto |
| 3 | Copiar pivô | | (porta) aba Imagens, botão direito |
| 3 | Colar pivô | | (porta) aba Imagens, botão direito |
| 3 | Carimbar pivôs | grava no atlas onde cada imagem encaixa | Esqueleto |

**Não entra agora:** *Editar pivôs da pasta* — está em "Depois, não agora" (decisões, seção 6).

---

## 4. Base — 18 à vista (era Esqueleto)

Montar o personagem. A base é a animação de um quadro só.

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Abrir a base | sai da animação e abre a base | Animação |
| 1 | Salvar como base nova… | o quadro de agora vira uma base nova (decisão 1.3) | (porta) janela Animação, botão |
| 1 | Clonar a base | a base e as animações dela (decisão 1.2) **(novo)** | (novo) |
| 1 | Trazer uma base de fora… | um `.bone` de fora entra como base | Arquivo → Trazer para o projeto, *Abrir outro corpo* |
| 2 | Novo ▸ | | Esqueleto |
| | ↳ Osso | | Esqueleto |
| | ↳ Ponto | O | Esqueleto |
| | ↳ Caixa de colisão | X | Esqueleto |
| | ↳ Ponto neste slot | | Esqueleto |
| | ↳ Caixa neste slot | | Esqueleto |
| | ↳ Máscara | | Esqueleto |
| 2 | Virar filho de… | P | Esqueleto |
| 3 | Trazer para a frente | + | Esqueleto |
| 3 | Mandar para trás | − | Esqueleto |
| 3 | Frente de tudo | | Esqueleto |
| 3 | Fundo de tudo | | Esqueleto |
| 3 | Copiar a ordem na animação | | Esqueleto |
| 4 | Nova pasta… | | Esqueleto |
| 4 | Tirar da pasta | | Esqueleto |
| 4 | Limpar desenhos vazios | | Esqueleto |
| 5 | Voltar à pose de repouso | Ctrl+1 | Esqueleto |
| 5 | Voltar tudo ao repouso | Ctrl+Shift+1 | Esqueleto |
| 6 | Compensar ▸ | | Esqueleto |
| | ↳ Não mexer nos filhos | | Esqueleto |
| | ↳ Não mexer nos desenhos | | Esqueleto |
| | ↳ Não mexer nas caixas | | Esqueleto |
| 6 | Eixos das alças ▸ | | Esqueleto |
| | ↳ Local · Pai · Mundo | três itens | Esqueleto |

---

## 5. Malha e regras — 10 à vista (menu novo)

As ferramentas do Spine. Hoje a malha tem **zero** itens de menu.

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Malha ▸ | **(submenu novo)** | (novo, só a cabeça) |
| | ↳ Virar malha | a imagem inteira vira malha | (porta) aba Malha e pesos |
| | ↳ Gerar automática | contorno e miolo, pela silhueta | (porta) aba Malha e pesos |
| | ↳ Traçar contorno | só o contorno | (porta) aba Malha e pesos |
| | ↳ Criar vértice | | (porta) aba Malha e pesos |
| | ↳ Apagar vértice | | (porta) aba Malha e pesos |
| | ↳ Usar a forma de outra malha | malha ligada | (porta) aba Malha e pesos |
| 1 | Pesos ▸ | **(submenu novo)** | (novo, só a cabeça) |
| | ↳ Ligar ossos | | (porta) aba Malha e pesos |
| | ↳ Pesos automáticos | | (porta) aba Malha e pesos |
| | ↳ Suavizar tudo | | (porta) aba Malha e pesos |
| | ↳ Podar | | (porta) aba Malha e pesos |
| | ↳ Chavear pesos | | (porta) aba Malha e pesos |
| | ↳ Tirar pesos | | (porta) aba Malha e pesos |
| 2 | Nova regra… | a janela que pergunta que ossos dobram e o que perseguem | Esqueleto → Novo, *Regra…* |
| 2 | Trocar os ossos da regra… | sem apagar e refazer | (porta) existe sem botão nenhum (`O QUE NAO TEM PORTA`) |
| 2 | Apagar regra | | (porta) aba Regras |
| 3 | Novo parâmetro | o valor que o jogo manda de fora | Esqueleto → Novo, *Parâmetro* |
| 3 | Chave do parâmetro aqui | grava o alvo no valor de agora | (porta) existe sem botão nenhum |
| 3 | Apagar parâmetro | | (porta) aba Regras |
| 4 | Física ▸ | | Esqueleto |
| | ↳ Simular a física | | Esqueleto |
| | ↳ Reiniciar esta física | | Esqueleto |
| | ↳ Reiniciar todas as físicas | | Esqueleto |
| | ↳ Assar a física em chaves… | | Esqueleto |
| 4 | Caminho ▸ | **(submenu novo)** | (novo, só a cabeça) |
| | ↳ Novo caminho | desenhar o caminho. **(novo)**: não achei no código como criar o desenho do caminho, só a regra | (novo) |
| | ↳ Ossos seguem o caminho… | a janela da regra, já no tipo caminho | (novo — a mesma janela de *Nova regra…*, aberta no tipo certo) |

---

## 6. Animação — 21 à vista

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Nova animação | nasce da base | Animação |
| 1 | Animações ▸ | | Animação |
| | ↳ Duplicar animação | | Animação |
| | ↳ Renomear animação | | Animação |
| | ↳ Apagar animação | | Animação |
| | ↳ Mandar para o topo | a primeira é a padrão | Animação |
| | ↳ Biblioteca de animações… | parado, andar, correr, pular | Animação |
| 2 | Mudar duração… | | Animação |
| 2 | Repetir | L | Animação |
| 2 | No fim ▸ | o que o tocador faz no fim | Animação |
| | ↳ Como o arquivo diz · Parar no fim · Repetir · Vai e volta · Voltar ao início | cinco itens | Animação |
| 3 | Tocar / Pausar | Espaço | Animação |
| 3 | Tocar para trás | Shift+Espaço | Animação |
| 3 | Ir para ▸ | **(submenu novo)** | (novo, só a cabeça) |
| | ↳ Início · Fim | Home · End | Animação |
| | ↳ Quadro anterior · Quadro seguinte | ← · → | Animação |
| | ↳ Chave anterior · Chave seguinte | ↑ · ↓ | Animação |
| | ↳ Chave anterior do escolhido · Chave seguinte do escolhido | Shift+↑ · Shift+↓ | Animação |
| 4 | Chavear | K — protege a pose | Animação |
| 4 | Chavear tudo | Ctrl+K | Animação |
| 4 | Troca de base ▸ | **(submenu novo)** — o homem vira lobisomem | (novo, só a cabeça) |
| | ↳ Colar outra base aqui | daqui em diante, a cena mostra a outra base | Animação, *Colar corpo aqui* |
| | ↳ Tirar a troca daqui | | (porta) existe sem botão nenhum |
| 5 | Apagar chave | | Animação |
| 5 | Apagar as linhas | Shift+Delete | Animação |
| 5 | Limpar a animação inteira… | | Animação |
| 6 | Curva da chave ▸ | | Animação |
| | ↳ Linear · Suave · Parada · Curva… | quatro itens | Animação |
| 6 | Marcas ▸ | | Animação |
| | ↳ Pôr ou tirar marca aqui · Marca anterior · Marca seguinte | M · Ctrl+↑ · Ctrl+↓ | Animação |
| 6 | Novo evento | | Animação |
| 6 | Trecho de laço ▸ | | Animação |
| | ↳ Começo do trecho aqui · Fim do trecho aqui · Tirar o trecho | três itens | Animação |
| 6 | Variáveis e etiquetas ▸ | moram na animação, como no Spriter | Animação |
| | ↳ Nova variável · Nova etiqueta | | Animação |
| | ↳ Apagar a variável · Mostrar na aba Regras | | Animação |
| | ↳ Renomear etiqueta · Apagar etiqueta | | (porta) existem sem botão nenhum |
| 7 | Efeitos de chave ▸ | flash, pulso e tremor viram chaves. **Partícula não mora aqui** | Animação |
| | ↳ Flash… · Pulso… · Tremor… | três itens | Animação |
| 7 | Chaves ▸ | **(submenu novo)** — mexer em muitas chaves de uma vez | (novo, só a cabeça) |
| | ↳ Selecionar todas as chaves | | Animação |
| | ↳ Esticar seleção… | | Animação |
| | ↳ Espelhar no tempo | | Animação |
| | ↳ Fechar ciclo | | Animação |
| | ↳ Espelhar esquerda e direita… | | Animação |
| | ↳ Empurrar as chaves… | | Animação |
| | ↳ Limpar chaves repetidas | | Animação |

---

## 7. Skins — 10 à vista (menu novo)

A skin veste. Edita-se uma por vez; depois se empilham.

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Nova skin | | Esqueleto → Novo, *Pele* |
| 1 | Clonar skin | o clone usa **os mesmos ossos** (decisão 3.6) **(novo)**. A aba já tem *Duplicar pele*: a rodada 1 diz se é o mesmo | (novo) |
| 1 | Fazer a skin de uma pasta… | troca a pasta inteira pelos nomes iguais | (porta) aba Peles |
| 1 | Apagar skin | | (porta) aba Peles |
| 2 | Editar esta skin | o lápis: o que eu crio agora é dela, imagens e ossos | (porta) o lápis da aba Peles |
| 3 | Trocar imagem nas skins… | | Esqueleto → Peles ▸, *nas peles* |
| 3 | Ignorar esta imagem | a skin não mexe nela **(novo)** | (novo) |
| 3 | Esconder esta imagem | a imagem não é desenhada nesta skin **(novo)** | (novo) |
| 4 | Promover skin a base… | a pilha ligada vira uma base nova | Esqueleto → Peles ▸ |
| 4 | Testar no visualizador… | abre o visualizador de montagem com as skins **(novo)** | (novo) — o mesmo do menu Entidades |

O submenu **Peles ▸** do Esqueleto virou este menu.
Importar e exportar skin ficam no **Arquivo** (pergunta 4).

---

## 8. Entidades — 9 à vista (menu novo)

Encaixar. Onde cabe uma imagem, cabe uma entidade.

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Trazer entidade de fora… | um `.bone` de fora entra na lista Entidades | Arquivo → Trazer para o projeto, *Abrir uma entidade* |
| 1 | Pôr entidade na cena… | hoje só arrastando da aba | (porta) aba Entidades, arrastar |
| 1 | Escolher a animação da entidade… | quem recebe manda nela | (porta) botão direito na faixa da linha do tempo |
| 2 | Marcar como slot | a imagem escolhida vira uma base, com nome e animações **(novo)** | (novo) |
| 2 | Este boneco | a imagem do meio marca o personagem: o de trás vai atrás dele, o da frente na frente **(novo)** | (novo) |
| 3 | Promover a base | a entidade passa para a lista de bases | (porta) aba Entidades, *Promover a corpo* |
| 3 | Rebaixar a entidade | a base volta a ser entidade | (porta) janela Animação |
| 4 | Visualizador de montagem… | encaixar e desencaixar para testar. Descartável **(novo)** | (novo) |
| 4 | Aparecer na linha do tempo | liga e desliga: mostra o teste enquanto eu animo **(novo)** | (novo) |

---

## 9. Partículas — 6 à vista (menu novo)

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Novo emissor vazio | | Esqueleto → Novo, *Emissor de partículas* |
| 2 | Fogo | já com imagem | Animação → Efeitos de chave |
| 2 | Fumaça | | Animação → Efeitos de chave |
| 2 | Faísca | | Animação → Efeitos de chave |
| 2 | Poeira | | Animação → Efeitos de chave |
| 3 | Prender ao osso escolhido | **(novo — rodada 15)**. Hoje não prende | (novo) |

O resto (clicar, mover e girar na cena) é gesto, não menu. O sistema completo vem da rodada 14.

---

## 10. Exibir — 17 à vista

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Tema ▸ | | Exibir |
| | ↳ Escuro · Claro | | Exibir |
| 2 | O boneco ▸ | **(submenu novo)** — o que se vê do boneco | (novo, só a cabeça) |
| | ↳ Ossos · Desenhos | 7 · 9 | Exibir |
| | ↳ Nomes dos ossos · Pontos · Caixas · Máscaras | | Exibir |
| | ↳ Malhas · Arestas · Pesos | | Exibir |
| 2 | A cena ▸ | **(submenu novo)** — o que se vê da cena | (novo, só a cabeça) |
| | ↳ Grade · Réguas · Eixos | | Exibir |
| | ↳ Casca de cebola · Nome ao passar o mouse | | Exibir |
| | ↳ Guias · Travar guias · Limpar guias | | Exibir |
| 3 | Esconder o escolhido | H | Exibir |
| 3 | Só este: esconde o resto | Shift+H | Exibir |
| 3 | Mostrar tudo | | Exibir |
| 3 | Ver só o resultado | | Exibir |
| 3 | Travar ▸ | | Exibir |
| | ↳ Travar ossos · Travar desenhos | 8 · 0 | Exibir |
| | ↳ Travar o escolhido · Travar o resto · Destravar tudo | | Exibir |
| 4 | Casca de cebola: opções… | | Exibir |
| 4 | Imagem de referência… | | Exibir |
| 5 | Aproximar · Afastar | | Exibir |
| 5 | Tamanho real (100%) · Ajustar à tela · Enquadrar seleção | | Exibir |
| 6 | Mostrar nome das ferramentas | | Exibir |
| 6 | Ferramenta de antes | | Exibir |

---

## 11. Janela — 18 à vista, como a do Photoshop

| Bloco | Item | O que faz | De onde veio |
|:---:|:---|:---|:---|
| 1 | Arranjos ▸ | o "Área de trabalho" do Photoshop | Janela |
| | ↳ Pivô · Visualização | os dois de fábrica | Janela |
| | ↳ Guardar este arranjo… | | Janela |
| | ↳ Apagar um arranjo… | | Janela |
| | ↳ Voltar ao padrão | no Photoshop, o "Redefinir" mora aqui dentro | Janela (estava fora do submenu) |
| 1 | Arrumar ▸ | **(submenu novo)** — o "Organizar" do Photoshop | (novo, só a cabeça) |
| | ↳ Esconder painéis | Tab | Janela |
| | ↳ Mover para a outra coluna | | Janela |
| | ↳ Fechar o grupo | | Janela |
| | ↳ Detalhes da linha do tempo | | Janela |
| | ↳ Soltar o painel da parede · Recolher em ícone · Expandir | **(novo, ou conferir)**: o `ESTADO` diz que existem; na mão dele não funcionaram. Rodadas 2 e 4 | (novo) |
| 2 | Imagens · Entidades · Pivôs | os painéis, na ordem da barra | Janela |
| 2 | Árvore · Ordem · Malha e pesos | | Janela |
| 3 | Animações · Linha do tempo · Curvas | | Janela |
| 3 | Skins · Regras | | Janela, *Peles* |
| 3 | Visualizador de montagem | **(novo)** | (novo) |
| 4 | Propriedades · Exibição · Prévia · Histórico | | Janela |

Cada painel é um liga-desliga. Painel fechado continua escrito aqui: é a porta de volta.

---

## 12. Ajuda — 5, igual

| Item | De onde veio |
|:---|:---|
| Manual · Atalhos do teclado · Problemas do arquivo… · Paleta de comandos · Sobre o Recorte | Ajuda |

---

## O que mudou de lugar

Só os que trocaram de menu. Os que só entraram num submenu do mesmo menu estão na tabela de baixo.

| # | Item | Hoje | Desenho |
|:---:|:---|:---|:---|
| 1 | Recarregar a pasta | Arquivo | Imagens |
| 2 | Trocar pasta de origem… | Arquivo | Imagens |
| 3 | Abrir outro corpo… | Arquivo → Trazer para o projeto | Base, *Trazer uma base de fora…* |
| 4 | Abrir uma entidade… | Arquivo → Trazer para o projeto | Entidades, *Trazer entidade de fora…* |
| 5 | Pôr imagem na cena… | Esqueleto → Novo | Imagens |
| 6 | Opções do desenho… | Esqueleto | Imagens |
| 7 | Definir pivô… | Esqueleto | Imagens |
| 8 | Carimbar pivôs | Esqueleto | Imagens |
| 9 | Emissor de partículas | Esqueleto → Novo | Partículas, *Novo emissor vazio* |
| 10 | Regra… | Esqueleto → Novo | Malha e regras, *Nova regra…* |
| 11 | Parâmetro | Esqueleto → Novo | Malha e regras, *Novo parâmetro* |
| 12–16 | Física ▸ e os 4 de dentro | Esqueleto | Malha e regras |
| 17 | Pele | Esqueleto → Novo | Skins, *Nova skin* |
| 18 | Peles ▸ | Esqueleto | virou o menu Skins |
| 19 | Trocar imagem nas peles… | Esqueleto → Peles ▸ | Skins |
| 20 | Promover pele a base… | Esqueleto → Peles ▸ | Skins |
| 21 | Abrir a base | Animação | Base |
| 22–25 | Fogo · Fumaça · Faísca · Poeira | Animação → Efeitos de chave | Partículas |

**25 itens mudaram de menu.** O resto do Esqueleto (26) fica no mesmo menu, que passa a se chamar **Base**.

### Mesmo menu, dentro de submenu novo

| Menu | Submenu novo | Quantos entraram |
|:---|:---|:---:|
| Editar | Pose ▸ | 4 |
| Animação | Ir para ▸ | 8 |
| Animação | Troca de base ▸ | 1 (+1 porta) |
| Animação | Chaves ▸ | 7 |
| Exibir | O boneco ▸ | 9 |
| Exibir | A cena ▸ | 8 |
| Janela | Arrumar ▸ | 4 |
| Janela | Arranjos ▸ (já existia) | 1: Voltar ao padrão |

---

## A conta dos 232

| Menu de hoje | Itens | Para onde foram |
|:---|:---:|:---|
| Arquivo | 32 | 27 Arquivo · 2 Imagens · 1 Base · 1 Entidades · **1 sai** |
| Editar | 23 | 23 Editar |
| Esqueleto | 42 | 26 Base · 4 Imagens · 7 Malha e regras · 4 Skins · 1 Partículas |
| Animação | 66 | 61 Animação · 1 Base · 4 Partículas |
| Exibir | 39 | 39 Exibir |
| Janela | 25 | 25 Janela |
| Ajuda | 5 | 5 Ajuda |
| **Soma** | **232** | |

| Menu do desenho | Itens de hoje que caíram nele |
|:---|:---:|
| Arquivo | 27 |
| Editar | 23 |
| Imagens | 6 |
| Base | 28 |
| Malha e regras | 7 |
| Animação | 61 |
| Skins | 4 |
| Entidades | 1 |
| Partículas | 5 |
| Exibir | 39 |
| Janela | 25 |
| Ajuda | 5 |
| **Soma** | **231** |

**232 entraram. 231 têm lugar. 1 sai:**

| Sai | Por quê |
|:---|:---|
| **Trazer para o projeto ▸** (Arquivo) | era só a **cabeça** de um submenu, sem função. Os dois de dentro foram para Base e Entidades, e ela ficou vazia. Submenu vazio a casa não aceita |

**Função nenhuma sai.**

Além dos 232, o desenho **acrescenta**:

| Tipo | Quantos | Quais |
|:---|:---:|:---|
| **(novo)** — função que falta | 17 | pedir a pasta · salvar como entidade · Godot · Construct · clonar base · novo caminho · ossos seguem o caminho · clonar skin · ignorar imagem · esconder imagem · testar skin no visualizador · marcar como slot · Este boneco · visualizador de montagem (menu e painel) · aparecer na linha do tempo · prender partícula ao osso · soltar, recolher e expandir painel |
| **(porta)** — já existe, sem menu | 30 | os 12 da malha e dos pesos · trocar os ossos da regra · apagar regra · chave do parâmetro · apagar parâmetro · tirar a troca de base · renomear e apagar etiqueta · salvar como base nova · trazer como sequência · copiar e colar pivô · fazer skin de pasta · apagar skin · editar esta skin · pôr entidade na cena · escolher a animação da entidade · promover a base · rebaixar a entidade |
| Cabeça de submenu nova | 10 | Pose · Malha · Pesos · Caminho · Ir para · Troca de base · Chaves · O boneco · A cena · Arrumar |

---

## Como o Photoshop faz — o que eu li

| O quê | O Photoshop | Fonte |
|:---|:---|:---|
| A barra | File · Edit · **Image · Layer · Type · Select · Filter** · 3D · View · Window · Help. **Um menu por tipo de coisa**: imagem, camada, texto, seleção, filtro | [lista dos menus](https://www.slideshare.net/slideshow/interface-layout-of-adobe-photoshop/27880856) · [phlearn](https://phlearn.com/?p=1169023) |
| O menu Janela | **todos os painéis** se abrem por ele. Serve para esconder e mostrar painéis e arrumar a área de trabalho | [webucator](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) |
| Área de trabalho | Janela → Área de trabalho → **Nova área de trabalho…** guarda o arranjo com nome; **Redefinir Essenciais** volta ao padrão | [teachucomp](https://www.teachucomp.com/?p=31521) · [ajuda da Adobe](https://helpx.adobe.com/lt/photoshop/desktop/get-started/learn-the-basics/restore-workspaces.html) |
| Painéis | se agrupam, empilham e encaixam na parede; **recolhem em ícone**; **soltam** puxando a aba; Tab esconde todos | [webucator](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) |

**O que eu tirei disso:** um menu para cada coisa (Imagens, Skins, Entidades, Partículas, como o Image e o Layer dele). E o menu Janela com os arranjos em cima e todos os painéis embaixo.
A página de ajuda principal da Adobe recusou a leitura (erro 403). Li as outras.

---

## Perguntas para o Humberto

| # | Pergunta | A minha suposição |
|:---:|:---|:---|
| 1 | Troco **"pele" por "skin"** no programa inteiro (menus, abas, avisos)? | **sim**. O desenho já escreve skin |
| 2 | O menu **Esqueleto passa a se chamar "Base"**? | **sim**: é a sua palavra para o corpo montado |
| 3 | Malha, pesos, regras, física e caminho num **menu só, "Malha e regras"**? Ou dois: Malha · Regras? | **um só**. Doze menus já é o número do Photoshop |
| 4 | Importar e exportar **skin e animação** ficam no **Arquivo** (um lugar só, como hoje)? Ou vão para os menus Skins e Animação? | **ficam no Arquivo**. Foi decidido em 29/09: quem procura "exportar" acha num lugar só |
| 5 | Nos nomes, **"corpo" vira "base"**? (Entregar um corpo → Entregar uma base · Colar corpo aqui → Colar outra base aqui) | **sim**. O desenho já escreve base |

---

## O que este desenho NÃO diz

| Não diz | Por quê |
|:---|:---|
| Se cada item funciona | não abri o programa. A rodada 1 e a 2 conferem |
| Se o *Duplicar pele* de hoje já é o *Clonar skin* | só usando se sabe |
| Quanto custa construir | é a rodada 6 |
