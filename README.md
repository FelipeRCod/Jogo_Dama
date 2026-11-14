# Jogo Dama — Damas Classicas (Regras Brasileiras)

**Jogo Dama** e um aplicativo mobile de **Damas Brasileiras** desenvolvido em **React Native (Expo SDK 58)** sob o padrao arquitetural **MVC (Model-View-Controller)** para a **Atividade Pratica 11 - Dama** da disciplina de *Programacao para Dispositivos Moveis II* na **FATEC (DSM - 5º Semestre)**.

- **Desenvolvedor:** Felipe Rocha de Oliveira
- **Professor:** Jeferson de Souza Dias
- **Instituicao:** FATEC — Curso de Desenvolvimento de Software Multiplataforma (DSM) — 2026
- **Plataforma:** Android / iOS / Web (React Native + Expo SDK 58 e versao Expo Snack SDK 54)
- **Link Direto no Expo Snack (SDK 54):** https://snack.expo.dev/LKNmFBf733bcEEZOC34CJ

---

## Atendimento aos Requisitos da Atividade Pratica 11

1. **Todas as Funcionalidades do Jogo de Damas:**
   - Tabuleiro oficial **8x8** com coordenadas alfanumericas (`A-H` e `1-8`).
   - Movimentacao diagonal das pedras comuns e coroacao automatica ao atingir a ultima fileira (**Dama Voadora** de longo alcance).
   - **Captura Obrigatoria com Livre Escolha do Jogador:** algoritmo de busca em profundidade (*DFS*) que identifica todas as opcoes e cadeias de capturas disponiveis no turno (para frente e para tras), mantendo a obrigatoriedade de capturar, mas deixando **a criterio do jogador escolher livremente** qual peca ou sequencia deseja capturar (mesmo que capture menos pecas ou priorize fazer Dama).
2. **Templates de Cores para o Tabuleiro e para as Pecas:**
   - **3 Templates para o Tabuleiro** (cada um com 2 cores contrastantes para as casas claras e escuras + moldura): *Madeira Classica*, *Torneio Esmeralda* e *Marmore & Obsidiana*.
   - **Pedras Classicas Pretas e Brancas em PNG (`256x256`)** + **2 Templates de Destaque/Estilo** (*Pedras Classicas PNG* e *Pedras Imperiais*).
3. **Navegacao com React Navigation (4 Telas):**
   - `TelaBoasVindas.js`: **Boas-vindas** com preview interativo do tabuleiro e das Damas, selecao de modo de jogo, seletor de templates de cores e mixer de som.
   - `TelaInstrucoes.js`: **Instrucoes do jogo** detalhando regras brasileiras, dama voadora, captura obrigatoria com escolha livre e pontuacao.
   - `TelaJogo.js`: **O jogo** completo com HUD superior, cronometro, placar de capturas e pontos, indicadores visuais de movimentos/capturas e modal de vitoria.
   - `TelaCreditos.js`: **Creditos do jogo** incluindo nome do aluno, FATEC, curso DSM, galeria das pedras PNG e a frase academica obrigatoria:
     > *"Este site é um projeto acadêmico da FATEC, criado apenas para fins de estudo. Não utilize as informações aqui para uso real."*
4. **Funcionalidades Extras Implementadas:**
   - **Dois Jogadores (Local)** no mesmo dispositivo e **Modo vs Computador (IA)** com algoritmo **Minimax e Poda Alfa-Beta** em 3 niveis (*Facil*, *Medio* e *Dificil*).
   - **Som do Jogo (`expo-audio`):** efeitos sonoros de madeira ao mover (`Som_Movimento.wav`), captura (`Som_Captura.wav`), coroacao de Dama (`Som_Dama.wav`), fanfarra de vitoria (`Som_Vitoria.wav`) e trilha sonora de fundo (`Musica_Fundo.wav`), com mixer de volume independente (`0%` a `100%` e `MUDO`).
   - **Pontuacao e Tempo de Jogo:** cronometro em tempo real (`MM:SS`) e sistema de pontuacao (`+100 pts` por captura, `+150 pts` por promocao a Dama e `+500 pts` por vitoria).

---

## Arquitetura do Projeto (MVC)

```text
Jogo_Dama/
├── App.js                        # Configuracao de rotas (React Navigation Native Stack)
├── index.js                      # Ponto de entrada do Expo
├── app.json                      # Manifesto e configuracoes do Expo SDK 58
├── metro.config.js               # Suporte a assets de audio (.wav / .ogg) no Metro Bundler
├── package.json                  # Dependencias e scripts do projeto
└── src/
    ├── assets/                   # 4 sprites de pedras/damas (.png), 2 fundos (.png) e 5 audios (.wav)
    ├── components/
    │   └── PecaDama.js           # Renderizador das pedras Pretas/Brancas e Damas com destaques visuais
    ├── controllers/
    │   └── MotorDamas.js         # Regras Brasileiras, DFS de Capturas e IA Minimax Alfa-Beta
    ├── models/
    │   └── Configuracoes.js      # Constantes, templates de cores, mapeamento de assets e estado de audio
    └── views/
        ├── TelaBoasVindas.js     # Boas-vindas (Menu, Preview, Templates e Mixer de Som)
        ├── TelaInstrucoes.js     # Instrucoes do jogo (Regras Brasileiras e Pontuacao)
        ├── TelaJogo.js           # O jogo (Tabuleiro 8x8, 2 Jogadores / IA, Tempo e Pontos)
        └── TelaCreditos.js       # Creditos do jogo (Dados FATEC/DSM, Frase Obrigatoria e PNGs)
```

---

## Como Executar o Projeto

1. Clone o repositorio:
   ```bash
   git clone https://github.com/FelipeRCod/Jogo_Dama.git
   cd Jogo_Dama
   ```

2. Instale as dependencias:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento do Expo:
   ```bash
   npx expo start --clear
   ```
