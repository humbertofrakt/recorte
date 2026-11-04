# X-304 — extensão usada, mas não exigida

| Item | Valor |
|:---|:---|
| Nível | X (compatibilidade, obrigatório em todo nível) |
| Spec | 2.7 |
| Esperado | conferido à mão |

## O que este caso prova

Que uma extensão listada em `extensionsUsed` — e **só** ali — é ignorada em
silêncio: o arquivo carrega inteiro e a pose sai igual à de um arquivo sem
extensão nenhuma.

É a metade otimista de 2.7, e é a que faz o formato crescer sem quebrar: quem
grava pode marcar o que usou, e quem lê pode não conhecer nada disso e ainda
assim abrir o personagem.

## O rig

```
extensionsUsed: ["VENDOR_pelo_ao_vento", "VENDOR_luz_de_cena"]
extensions:     VENDOR_pelo_ao_vento no topo do arquivo
                VENDOR_luz_de_cena dentro do osso

root
osso  parent root   x 40   y 10   rotation 90
```

Repare que uma das extensões está no **topo** e a outra **dentro de um osso**:
um leitor que só saiba pular o bloco de cima falha na de dentro.

## Contas (5.2)

```
osso: rotation 90°, escala 1, sem shear

a = cos(90°) = 0     c = sin(90°) = 1
b = cos(180°) = −1   d = sin(180°) = 0
```

O pai é o `root`, identidade, então `worldX = 40`, `worldY = 10`, e a pose
aplicada é a própria pose de repouso.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| recusa o arquivo por causa de `extensionsUsed` | o caso nem carrega |
| tenta interpretar `VENDOR_luz_de_cena` e engasga no osso | o caso nem carrega |
| pula o osso inteiro por ter propriedade desconhecida | `osso` some do dump |

Compare com o **X-305**, que é a outra metade de 2.7: lá a extensão está em
`extensionsRequired`, e o leitor **tem** que recusar.
