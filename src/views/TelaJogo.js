import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  useWindowDimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as NavigationBar from 'expo-navigation-bar';
import {
  PECAS,
  Configuracoes,
  AssetsJogo,
  obterConfigAudio,
  atualizarConfigAudio,
  inscreverConfigAudio,
  calcularMultiplicadorMusica,
  calcularMultiplicadorEfeitos,
} from '../models/Configuracoes';
import {
  criarTabuleiroInicial,
  ehPecaDoJogador,
  obterOponente,
  obterTodosMovimentosValidos,
  obterMovimentosDaPeca,
  executarMovimento,
  verificarFimDeJogo,
  contarPecas,
  obterMovimentoIA,
} from '../controllers/MotorDamas';
import PecaDama from '../components/PecaDama';

const { VAZIO, PRETA, BRANCA } = PECAS;
const COLUNAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const LINHAS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const ocultarBotoesSistema = () => {
  try {
    RNStatusBar.setHidden(true, 'fade');
    if (Platform.OS === 'android') {
      if (NavigationBar.NavigationBar && NavigationBar.NavigationBar.setHidden) {
        NavigationBar.NavigationBar.setHidden(true);
      }
      if (NavigationBar.setVisibilityAsync) {
        NavigationBar.setVisibilityAsync('hidden').catch(() => {});
      }
    }
  } catch (e) {}
};

export function formatarTempo(segundosTotais) {
  const mins = Math.floor(segundosTotais / 60);
  const segs = segundosTotais % 60;
  const mStr = mins < 10 ? `0${mins}` : `${mins}`;
  const sStr = segs < 10 ? `0${segs}` : `${segs}`;
  return `${mStr}:${sStr}`;
}

export default function TelaJogo({ navigation, route }) {
  const windowDims = useWindowDimensions();
  const isPaisagem = windowDims.width > windowDims.height;

  const [temaTabuleiro, setTemaTabuleiro] = useState(
    route?.params?.temaTabuleiro || 'CLASSICO'
  );
  const [temaPecas, setTemaPecas] = useState(
    route?.params?.temaPecas || 'CLASSICO'
  );
  const [modoJogo, setModoJogo] = useState(
    route?.params?.modoJogo || Configuracoes.MODOS_JOGO.DOIS_JOGADORES
  );
  const [dificuldadeIA, setDificuldadeIA] = useState(
    route?.params?.dificuldadeIA || 'medium'
  );

  // Estado do motor de Damas
  const [tabuleiro, setTabuleiro] = useState(() => criarTabuleiroInicial());
  const [jogadorAtual, setJogadorAtual] = useState(PRETA);
  const [pecaSelecionada, setPecaSelecionada] = useState(null);
  const [movimentosValidos, setMovimentosValidos] = useState([]);
  const [ultimoMovimento, setUltimoMovimento] = useState(null);
  const [vencedor, setVencedor] = useState(null);
  const [iaPensando, setIaPensando] = useState(false);

  // Pontuacao, Capturas e Tempo
  const [capturas, setCapturas] = useState({ [PRETA]: 0, [BRANCA]: 0 });
  const [pontuacao, setPontuacao] = useState({ [PRETA]: 0, [BRANCA]: 0 });
  const [tempoSegundos, setTempoSegundos] = useState(0);
  const [mensagemAviso, setMensagemAviso] = useState('');

  // Audio e Modais
  const [modalAudioVisivel, setModalAudioVisivel] = useState(false);
  const [cfgAudio, setCfgAudio] = useState(obterConfigAudio);

  const avisoTimeoutRef = useRef(null);
  const iaTimeoutRef = useRef(null);

  const opcoesAudio = { keepAudioSessionActive: true, downloadFirst: true };
  const playerMovimento = useAudioPlayer(AssetsJogo.SONS.MOVIMENTO, opcoesAudio);
  const playerCaptura = useAudioPlayer(AssetsJogo.SONS.CAPTURA, opcoesAudio);
  const playerDama = useAudioPlayer(AssetsJogo.SONS.DAMA, opcoesAudio);
  const playerVitoria = useAudioPlayer(AssetsJogo.SONS.VITORIA, opcoesAudio);
  const playerMusicaFundo = useAudioPlayer(AssetsJogo.SONS.MUSICA_FUNDO, opcoesAudio);

  const dadosTabuleiro =
    Configuracoes.TEMPLATES_TABULEIRO[temaTabuleiro] ||
    Configuracoes.TEMPLATES_TABULEIRO.CLASSICO;
  const dadosPecas =
    Configuracoes.TEMPLATES_PECAS[temaPecas] ||
    Configuracoes.TEMPLATES_PECAS.CLASSICO;
  const imagemFundo =
    AssetsJogo.FUNDOS[dadosTabuleiro.fundoKey] || AssetsJogo.FUNDOS.CLASSICO;

  // Cronometro do jogo
  useEffect(() => {
    if (vencedor !== null || modalAudioVisivel) return;
    const timer = setInterval(() => {
      setTempoSegundos((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [vencedor, modalAudioVisivel]);

  // Configuracao de Audio
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
      interruptionModeAndroid: 'mixWithOthers',
    }).catch(() => {});

    const cancelar = inscreverConfigAudio((novaCfg) => {
      setCfgAudio(novaCfg);
    });
    return () => {
      cancelar();
      if (avisoTimeoutRef.current) clearTimeout(avisoTimeoutRef.current);
      if (iaTimeoutRef.current) clearTimeout(iaTimeoutRef.current);
    };
  }, []);

  const sincronizarMusicaFundo = (
    fimDeJogo = vencedor !== null,
    configAudioAtual = obterConfigAudio()
  ) => {
    try {
      const multMusica = calcularMultiplicadorMusica(configAudioAtual);
      if (fimDeJogo || multMusica <= 0) {
        if (playerMusicaFundo && playerMusicaFundo.playing) {
          playerMusicaFundo.pause();
        }
        return;
      }
      if (playerMusicaFundo) {
        playerMusicaFundo.loop = true;
        playerMusicaFundo.muted = false;
        playerMusicaFundo.volume = Math.max(0, Math.min(1, 0.38 * multMusica));
        if (!playerMusicaFundo.playing) {
          playerMusicaFundo.play();
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    sincronizarMusicaFundo(vencedor !== null, cfgAudio);
  }, [vencedor, cfgAudio, playerMusicaFundo]);

  useEffect(() => {
    return () => {
      try {
        if (playerMusicaFundo && playerMusicaFundo.playing) {
          playerMusicaFundo.pause();
        }
      } catch (e) {}
    };
  }, []);

  const tocarSomEfeito = (player, volumeBase = 0.9) => {
    try {
      const mult = calcularMultiplicadorEfeitos();
      if (mult <= 0 || !player) return;
      player.muted = false;
      player.volume = Math.max(0, Math.min(1, volumeBase * mult));
      player.seekTo(0);
      player.play();
    } catch (e) {}
  };

  const exibirAviso = (texto) => {
    setMensagemAviso(texto);
    if (avisoTimeoutRef.current) clearTimeout(avisoTimeoutRef.current);
    avisoTimeoutRef.current = setTimeout(() => {
      setMensagemAviso('');
    }, 2800);
  };

  // Turno da IA quando modoJogo === 'ai' e jogadorAtual === BRANCA
  useEffect(() => {
    if (
      vencedor === null &&
      modoJogo === Configuracoes.MODOS_JOGO.CONTRA_IA &&
      jogadorAtual === BRANCA
    ) {
      setIaPensando(true);
      iaTimeoutRef.current = setTimeout(() => {
        const movIA = obterMovimentoIA(tabuleiro, BRANCA, dificuldadeIA);
        if (!movIA) {
          finalizarPartida(PRETA);
          setIaPensando(false);
          return;
        }
        aplicarMovimentoNoTabuleiro(tabuleiro, movIA, BRANCA);
        setIaPensando(false);
      }, 480);
    }
    return () => {
      if (iaTimeoutRef.current) clearTimeout(iaTimeoutRef.current);
    };
  }, [jogadorAtual, vencedor, modoJogo, tabuleiro, dificuldadeIA]);

  const finalizarPartida = (ganhador) => {
    setVencedor(ganhador);
    setPontuacao((prev) => ({
      ...prev,
      [ganhador]: prev[ganhador] + Configuracoes.PONTUACAO.VITORIA_PARTIDA,
    }));
    tocarSomEfeito(playerVitoria, 1.0);
  };

  const aplicarMovimentoNoTabuleiro = (estadoTabuleiro, movimento, jogadorQueMoveu) => {
    const {
      tabuleiro: novoTabuleiro,
      promoveuDama,
      pecasCapturadas,
    } = executarMovimento(estadoTabuleiro, movimento);

    const pontosGanhos =
      pecasCapturadas * Configuracoes.PONTUACAO.CAPTURA_PECA +
      (promoveuDama ? Configuracoes.PONTUACAO.PROMOCAO_DAMA : 0);

    setTabuleiro(novoTabuleiro);
    setUltimoMovimento(movimento);
    setPecaSelecionada(null);
    setMovimentosValidos([]);

    if (pecasCapturadas > 0) {
      setCapturas((prev) => ({
        ...prev,
        [jogadorQueMoveu]: prev[jogadorQueMoveu] + pecasCapturadas,
      }));
    }

    if (pontosGanhos > 0) {
      setPontuacao((prev) => ({
        ...prev,
        [jogadorQueMoveu]: prev[jogadorQueMoveu] + pontosGanhos,
      }));
    }

    // Sons da jogada
    if (promoveuDama) {
      tocarSomEfeito(playerDama, 0.95);
      exibirAviso('Coroacao! Nova Dama Voadora (+150 pts)');
    } else if (pecasCapturadas > 0) {
      tocarSomEfeito(playerCaptura, 0.95);
      if (pecasCapturadas > 1) {
        exibirAviso(`Captura Multipla! ${pecasCapturadas} pecas (+${pecasCapturadas * 100} pts)`);
      }
    } else {
      tocarSomEfeito(playerMovimento, 0.85);
    }

    const proximoJogador = obterOponente(jogadorQueMoveu);
    const ganhador = verificarFimDeJogo(novoTabuleiro, proximoJogador);

    if (ganhador !== null) {
      finalizarPartida(ganhador);
    } else {
      setJogadorAtual(proximoJogador);
    }
  };

  const ehTurnoHumano = () => {
    if (vencedor !== null || iaPensando) return false;
    if (modoJogo === Configuracoes.MODOS_JOGO.CONTRA_IA) {
      return jogadorAtual === PRETA;
    }
    return true;
  };

  const aoClicarCasa = (r, c) => {
    ocultarBotoesSistema();
    if (!ehTurnoHumano()) return;

    // 1. Se ja existe uma peca selecionada e clicou num destino valido: executa o movimento
    if (pecaSelecionada) {
      const movEscolhido = movimentosValidos.find(
        (m) => m.to.r === r && m.to.c === c
      );
      if (movEscolhido) {
        aplicarMovimentoNoTabuleiro(tabuleiro, movEscolhido, jogadorAtual);
        return;
      }
    }

    const pecaNaCasa = tabuleiro[r][c];

    // 2. Se clicou em uma peca do proprio jogador da vez
    if (ehPecaDoJogador(pecaNaCasa, jogadorAtual)) {
      const movsPeca = obterMovimentosDaPeca(tabuleiro, jogadorAtual, r, c);
      if (movsPeca.length > 0) {
        setPecaSelecionada({ r, c });
        setMovimentosValidos(movsPeca);
      } else {
        setPecaSelecionada(null);
        setMovimentosValidos([]);
        const todosMovs = obterTodosMovimentosValidos(tabuleiro, jogadorAtual);
        if (
          todosMovs.length > 0 &&
          todosMovs[0].captured &&
          todosMovs[0].captured.length > 0
        ) {
          exibirAviso('Captura obrigatoria! Escolha qualquer uma das pecas destacadas.');
        } else {
          exibirAviso('Esta peca nao possui movimentos livres.');
        }
      }
      return;
    }

    // 3. Clicou em casa vazia nao valida ou peca adversaria: limpa selecao
    setPecaSelecionada(null);
    setMovimentosValidos([]);
  };

  const reiniciarPartida = () => {
    ocultarBotoesSistema();
    if (iaTimeoutRef.current) clearTimeout(iaTimeoutRef.current);
    setTabuleiro(criarTabuleiroInicial());
    setJogadorAtual(PRETA);
    setPecaSelecionada(null);
    setMovimentosValidos([]);
    setUltimoMovimento(null);
    setVencedor(null);
    setIaPensando(false);
    setCapturas({ [PRETA]: 0, [BRANCA]: 0 });
    setPontuacao({ [PRETA]: 0, [BRANCA]: 0 });
    setTempoSegundos(0);
    setMensagemAviso('Partida reiniciada! Pretas jogam primeiro.');
  };

  const alternarTemplateTabuleiro = () => {
    const chaves = Object.keys(Configuracoes.TEMPLATES_TABULEIRO);
    const idxAtual = chaves.indexOf(temaTabuleiro);
    const proximo = chaves[(idxAtual + 1) % chaves.length];
    setTemaTabuleiro(proximo);
    exibirAviso(`Tabuleiro: ${Configuracoes.TEMPLATES_TABULEIRO[proximo].nome}`);
  };

  const alternarTemplatePecas = () => {
    const chaves = Object.keys(Configuracoes.TEMPLATES_PECAS);
    const idxAtual = chaves.indexOf(temaPecas);
    const proximo = chaves[(idxAtual + 1) % chaves.length];
    setTemaPecas(proximo);
    exibirAviso(`Pecas: ${Configuracoes.TEMPLATES_PECAS[proximo].nome}`);
  };

  const alternarModoJogo = () => {
    const novoModo =
      modoJogo === Configuracoes.MODOS_JOGO.DOIS_JOGADORES
        ? Configuracoes.MODOS_JOGO.CONTRA_IA
        : Configuracoes.MODOS_JOGO.DOIS_JOGADORES;
    setModoJogo(novoModo);
    if (iaTimeoutRef.current) clearTimeout(iaTimeoutRef.current);
    setTabuleiro(criarTabuleiroInicial());
    setJogadorAtual(PRETA);
    setPecaSelecionada(null);
    setMovimentosValidos([]);
    setUltimoMovimento(null);
    setVencedor(null);
    setIaPensando(false);
    setCapturas({ [PRETA]: 0, [BRANCA]: 0 });
    setPontuacao({ [PRETA]: 0, [BRANCA]: 0 });
    setTempoSegundos(0);
    exibirAviso(
      novoModo === Configuracoes.MODOS_JOGO.CONTRA_IA
        ? 'Modo alterado: Contra Computador (IA)'
        : 'Modo alterado: 2 Jogadores Local'
    );
  };

  // Identifica pecas que tem captura obrigatoria no turno atual
  const todosMovimentosTurno =
    vencedor === null ? obterTodosMovimentosValidos(tabuleiro, jogadorAtual) : [];
  const existeCapturaObrigatoria =
    todosMovimentosTurno.length > 0 &&
    todosMovimentosTurno[0].captured &&
    todosMovimentosTurno[0].captured.length > 0;
  const casasComCapturaObrigatoria = new Set();
  if (existeCapturaObrigatoria) {
    todosMovimentosTurno.forEach((m) => {
      casasComCapturaObrigatoria.add(`${m.from.r},${m.from.c}`);
    });
  }

  const contagemPretas = contarPecas(tabuleiro, PRETA);
  const contagemBrancas = contarPecas(tabuleiro, BRANCA);

  // Dimensionamento responsivo do tabuleiro 8x8
  const tamanhoTabuleiroMax = isPaisagem
    ? Math.min(windowDims.height - 76, windowDims.width * 0.48, 390)
    : Math.min(windowDims.width - 42, windowDims.height - 325, 368);
  const tamanhoCasa = Math.max(30, Math.floor(tamanhoTabuleiroMax / 8));
  const tamanhoPeca = Math.floor(tamanhoCasa * 0.84);

  const nomeJogador1 =
    modoJogo === Configuracoes.MODOS_JOGO.CONTRA_IA
      ? 'Voce (Pretas)'
      : 'Jogador 1 (Pretas)';
  const nomeJogador2 =
    modoJogo === Configuracoes.MODOS_JOGO.CONTRA_IA
      ? `Computador IA (${
          dificuldadeIA === 'easy'
            ? 'Facil'
            : dificuldadeIA === 'hard'
            ? 'Dificil'
            : 'Medio'
        })`
      : 'Jogador 2 (Brancas)';

  const renderizarCardJogador = (corJogador, nome, infoContagem) => {
    const ativo = vencedor === null && jogadorAtual === corJogador;
    const spriteIndicador =
      corJogador === PRETA ? AssetsJogo.PECAS.PRETA : AssetsJogo.PECAS.BRANCA;
    const qtdCapturas = capturas[corJogador];
    const pts = pontuacao[corJogador];

    return (
      <View
        style={[
          styles.cardJogador,
          isPaisagem && styles.cardJogadorPaisagem,
          { backgroundColor: dadosTabuleiro.corCardUI },
          ativo && {
            borderColor: dadosTabuleiro.corPrimariaUI,
            borderWidth: 2.5,
          },
        ]}
      >
        <View style={styles.jogadorTopoRow}>
          <View style={styles.jogadorIdentificacao}>
            <Image
              source={spriteIndicador}
              style={styles.iconeJogador}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.nomeJogadorTexto} numberOfLines={1}>
                {nome}
              </Text>
              <Text style={styles.subinfoJogadorTexto}>
                Pecas: {infoContagem.total}
                {infoContagem.damas > 0 ? ` (${infoContagem.damas} Damas)` : ''}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.badgeTurno,
              ativo
                ? { backgroundColor: dadosTabuleiro.corPrimariaUI }
                : styles.badgeTurnoInativo,
            ]}
          >
            <Text
              style={[
                styles.badgeTurnoTexto,
                ativo && { color: '#0F172A' },
              ]}
            >
              {ativo
                ? corJogador === BRANCA && iaPensando
                  ? 'PENSANDO...'
                  : 'SUA VEZ'
                : 'AGUARDANDO'}
            </Text>
          </View>
        </View>

        <View style={styles.estatisticasJogadorRow}>
          <View style={styles.estatisticaPill}>
            <Text style={styles.estatisticaLabel}>CAPTURAS:</Text>
            <Text style={styles.estatisticaValor}>{qtdCapturas}</Text>
          </View>
          <View style={styles.estatisticaPill}>
            <Text style={styles.estatisticaLabel}>PONTOS:</Text>
            <Text style={[styles.estatisticaValor, { color: '#FFD166' }]}>
              {pts}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderizarTabuleiro = () => (
    <View
      style={[
        styles.molduraExternaTabuleiro,
        {
          backgroundColor: dadosTabuleiro.molduraExterna,
          borderColor: dadosTabuleiro.bordaTabuleiro,
        },
      ]}
    >
      {/* Coordenadas Superiores A-H */}
      <View style={[styles.linhaCoordenadasH, { width: tamanhoCasa * 8 }]}>
        {COLUNAS.map((letra) => (
          <Text
            key={`top_${letra}`}
            style={[
              styles.textoCoordenada,
              { width: tamanhoCasa, color: dadosTabuleiro.corCoordenadas },
            ]}
          >
            {letra}
          </Text>
        ))}
      </View>

      <View style={styles.tabuleiroComLaterais}>
        {/* Coordenadas Esquerda 8-1 */}
        <View style={[styles.colunaCoordenadasV, { height: tamanhoCasa * 8 }]}>
          {LINHAS.map((num) => (
            <View
              key={`left_${num}`}
              style={[styles.celulaCoordenadaV, { height: tamanhoCasa }]}
            >
              <Text
                style={[
                  styles.textoCoordenada,
                  { color: dadosTabuleiro.corCoordenadas },
                ]}
              >
                {num}
              </Text>
            </View>
          ))}
        </View>

        {/* Grade 8x8 */}
        <View
          style={[
            styles.gradeTabuleiro,
            {
              width: tamanhoCasa * 8,
              height: tamanhoCasa * 8,
              borderColor: dadosTabuleiro.bordaTabuleiro,
            },
          ]}
        >
          {tabuleiro.map((linha, r) => (
            <View key={`r_${r}`} style={styles.linhaTabuleiro}>
              {linha.map((peca, c) => {
                const casaEscura = (r + c) % 2 === 1;
                const ehUltimoMov =
                  ultimoMovimento &&
                  ((ultimoMovimento.from.r === r &&
                    ultimoMovimento.from.c === c) ||
                    (ultimoMovimento.to.r === r && ultimoMovimento.to.c === c));

                const movDestino = movimentosValidos.find(
                  (m) => m.to.r === r && m.to.c === c
                );
                const ehDestinoValido = Boolean(movDestino);
                const ehDestinoCaptura =
                  ehDestinoValido &&
                  movDestino.captured &&
                  movDestino.captured.length > 0;

                const estaSelecionada =
                  pecaSelecionada &&
                  pecaSelecionada.r === r &&
                  pecaSelecionada.c === c;

                const temCapturaObrigatoria =
                  existeCapturaObrigatoria &&
                  casasComCapturaObrigatoria.has(`${r},${c}`) &&
                  ehTurnoHumano();

                return (
                  <TouchableOpacity
                    key={`sq_${r}_${c}`}
                    activeOpacity={casaEscura ? 0.75 : 1}
                    disabled={!casaEscura}
                    onPress={() => aoClicarCasa(r, c)}
                    style={[
                      styles.casaTabuleiro,
                      {
                        width: tamanhoCasa,
                        height: tamanhoCasa,
                        backgroundColor: casaEscura
                          ? dadosTabuleiro.casaEscura
                          : dadosTabuleiro.casaClara,
                      },
                    ]}
                  >
                    {ehUltimoMov && (
                      <View
                        style={[
                          styles.destaqueUltimoMov,
                          {
                            backgroundColor:
                              dadosTabuleiro.corDestaqueUltimoMov,
                          },
                        ]}
                        pointerEvents="none"
                      />
                    )}

                    {peca !== VAZIO && (
                      <PecaDama
                        tipo={peca}
                        tamanho={tamanhoPeca}
                        selecionada={estaSelecionada}
                        capturaObrigatoria={temCapturaObrigatoria}
                        desabilitada={
                          !ehPecaDoJogador(peca, jogadorAtual) || !ehTurnoHumano()
                        }
                        templatePecasId={temaPecas}
                      />
                    )}

                    {ehDestinoValido && !ehDestinoCaptura && (
                      <View
                        style={[
                          styles.indicadorMovimentoSimples,
                          {
                            width: tamanhoCasa * 0.34,
                            height: tamanhoCasa * 0.34,
                            borderRadius: (tamanhoCasa * 0.34) / 2,
                            backgroundColor:
                              dadosTabuleiro.corIndicadorMovimento,
                          },
                        ]}
                        pointerEvents="none"
                      />
                    )}

                    {ehDestinoCaptura && (
                      <View
                        style={[
                          styles.indicadorMovimentoCaptura,
                          {
                            width: tamanhoCasa * 0.82,
                            height: tamanhoCasa * 0.82,
                            borderRadius: (tamanhoCasa * 0.82) / 2,
                            borderColor: dadosTabuleiro.corIndicadorCaptura,
                          },
                        ]}
                        pointerEvents="none"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Coordenadas Direita 8-1 */}
        <View style={[styles.colunaCoordenadasV, { height: tamanhoCasa * 8 }]}>
          {LINHAS.map((num) => (
            <View
              key={`right_${num}`}
              style={[styles.celulaCoordenadaV, { height: tamanhoCasa }]}
            >
              <Text
                style={[
                  styles.textoCoordenada,
                  { color: dadosTabuleiro.corCoordenadas },
                ]}
              >
                {num}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Coordenadas Inferiores A-H */}
      <View style={[styles.linhaCoordenadasH, { width: tamanhoCasa * 8 }]}>
        {COLUNAS.map((letra) => (
          <Text
            key={`bot_${letra}`}
            style={[
              styles.textoCoordenada,
              { width: tamanhoCasa, color: dadosTabuleiro.corCoordenadas },
            ]}
          >
            {letra}
          </Text>
        ))}
      </View>
    </View>
  );

  const alterarVolumeCanal = (chaveVolume, chaveMudo, novoValor) => {
    const valorLimitado = Math.max(0, Math.min(100, novoValor));
    atualizarConfigAudio({
      [chaveVolume]: valorLimitado,
      [chaveMudo]: valorLimitado === 0,
    });
  };

  const alternarMudoCanal = (chaveMudo, chaveVolume) => {
    const atualMudo = cfgAudio[chaveMudo];
    const novoMudo = !atualMudo;
    const novoVolume =
      !novoMudo && cfgAudio[chaveVolume] === 0 ? 50 : cfgAudio[chaveVolume];
    atualizarConfigAudio({
      [chaveMudo]: novoMudo,
      [chaveVolume]: novoVolume,
    });
  };

  const renderizarLinhaControleAudio = (
    titulo,
    subtitulo,
    chaveVolume,
    chaveMudo
  ) => {
    const volume = cfgAudio[chaveVolume];
    const mudo = cfgAudio[chaveMudo] || volume === 0;
    const niveis = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    return (
      <View style={styles.blocoAudio}>
        <View style={styles.cabecalhoBlocoAudio}>
          <View style={styles.infoCanalAudio}>
            <Text style={styles.tituloBlocoAudio}>{titulo}</Text>
            <Text style={styles.subtituloBlocoAudio}>{subtitulo}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.botaoMudo,
              mudo ? styles.botaoMudoAtivo : styles.botaoMudoInativo,
            ]}
            onPress={() => alternarMudoCanal(chaveMudo, chaveVolume)}
          >
            <Text style={styles.botaoMudoTexto}>
              {mudo ? 'MUTADO' : `${volume}%`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlesVolumeRow}>
          <TouchableOpacity
            style={styles.botaoAjusteVolume}
            onPress={() => alterarVolumeCanal(chaveVolume, chaveMudo, volume - 10)}
          >
            <Text style={styles.botaoAjusteVolumeTexto}>-</Text>
          </TouchableOpacity>

          <View style={styles.barraSegmentosContainer}>
            {niveis.map((nivel) => {
              const preenchido = !mudo && volume >= nivel;
              return (
                <TouchableOpacity
                  key={`${chaveVolume}_${nivel}`}
                  style={[
                    styles.segmentoVolume,
                    preenchido
                      ? styles.segmentoVolumeAtivo
                      : styles.segmentoVolumeInativo,
                  ]}
                  onPress={() => alterarVolumeCanal(chaveVolume, chaveMudo, nivel)}
                />
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.botaoAjusteVolume}
            onPress={() => alterarVolumeCanal(chaveVolume, chaveMudo, volume + 10)}
          >
            <Text style={styles.botaoAjusteVolumeTexto}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const paddingTopo = isPaisagem
    ? 8
    : Platform.OS === 'android'
    ? (RNStatusBar.currentHeight || 24) + 12
    : 24;

  const paddingBase = isPaisagem ? 8 : 22;

  return (
    <ImageBackground source={imagemFundo} style={styles.container} resizeMode="cover">
      <View
        style={[
          styles.overlayGeral,
          { paddingTop: paddingTopo, paddingBottom: paddingBase },
        ]}
      >
        <View style={styles.topoHudBloco}>
          {/* HUD Superior */}
          <View style={styles.hudTopoRow}>
            <View style={styles.grupoBotoesHud}>
              <TouchableOpacity
                style={styles.botaoHud}
                onPress={() =>
                  navigation.navigate('TelaBoasVindas', {
                    temaTabuleiro,
                    temaPecas,
                    modoJogo,
                    dificuldadeIA,
                  })
                }
              >
                <Text style={styles.botaoHudTexto}>MENU</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoHud, styles.botaoHudEspaco]}
                onPress={() => setModalAudioVisivel(true)}
              >
                <Text style={styles.botaoHudTexto}>
                  {cfgAudio.mudoGeral ? 'SOM: OFF' : 'SOM'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cronometroBox}>
              <Text style={styles.cronometroValor}>
                {formatarTempo(tempoSegundos)}
              </Text>
              <Text style={styles.cronometroLabel}>TEMPO DE JOGO</Text>
            </View>

            <View style={styles.grupoBotoesHud}>
              <TouchableOpacity
                style={styles.botaoHud}
                onPress={alternarTemplateTabuleiro}
              >
                <Text style={styles.botaoHudTexto}>COR TAB.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoHud, styles.botaoHudEspaco]}
                onPress={alternarModoJogo}
              >
                <Text style={styles.botaoHudTexto}>
                  {modoJogo === Configuracoes.MODOS_JOGO.CONTRA_IA ? '1P vs IA' : '2 JOG.'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner de aviso / captura obrigatoria */}
          <View style={styles.faixaAvisoContainer}>
            {mensagemAviso ? (
              <View style={styles.avisoPill}>
                <Text style={styles.avisoTexto}>{mensagemAviso}</Text>
              </View>
            ) : existeCapturaObrigatoria ? (
              <View style={[styles.avisoPill, styles.avisoCapturaObrigatoria]}>
                <Text style={styles.avisoTexto}>
                  CAPTURA OBRIGATORIA! Escolha livremente qual peca deseja capturar.
                </Text>
              </View>
            ) : (
              <Text style={styles.subtituloRegrasTopo}>
                Template: {dadosTabuleiro.nome} • {dadosPecas.nome}
              </Text>
            )}
          </View>
        </View>

        {/* Area Principal (Retrato ou Paisagem) */}
        {isPaisagem ? (
          <View style={styles.conteudoPaisagemRow}>
            <View style={styles.colunaLateralPaisagem}>
              {renderizarCardJogador(BRANCA, nomeJogador2, contagemBrancas)}
              {renderizarCardJogador(PRETA, nomeJogador1, contagemPretas)}

              <View
                style={[
                  styles.barraAcoesPartidaCard,
                  { backgroundColor: dadosTabuleiro.corCardUI },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.botaoControlePartida,
                    { backgroundColor: dadosTabuleiro.corPrimariaUI },
                  ]}
                  onPress={reiniciarPartida}
                >
                  <Text style={[styles.botaoControleTexto, { color: '#0F172A' }]}>
                    REINICIAR
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoControlePartida}
                  onPress={alternarTemplatePecas}
                >
                  <Text style={styles.botaoControleTexto}>ESTILO PECAS</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.colunaTabuleiroPaisagem}>
              {renderizarTabuleiro()}
            </View>
          </View>
        ) : (
          <View style={styles.conteudoRetratoCol}>
            {renderizarCardJogador(BRANCA, nomeJogador2, contagemBrancas)}

            <View style={styles.wrapperCentralTabuleiro}>
              {renderizarTabuleiro()}
            </View>

            {renderizarCardJogador(PRETA, nomeJogador1, contagemPretas)}

            <View
              style={[
                styles.barraAcoesPartidaCard,
                { backgroundColor: dadosTabuleiro.corCardUI },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.botaoControlePartida,
                  { backgroundColor: dadosTabuleiro.corPrimariaUI },
                ]}
                onPress={reiniciarPartida}
              >
                <Text style={[styles.botaoControleTexto, { color: '#0F172A' }]}>
                  REINICIAR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoControlePartida}
                onPress={alternarTemplatePecas}
              >
                <Text style={styles.botaoControleTexto}>MUDAR PECAS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoControlePartida}
                onPress={() =>
                  navigation.navigate('TelaCreditos', {
                    temaTabuleiro,
                    temaPecas,
                    modoJogo,
                    dificuldadeIA,
                  })
                }
              >
                <Text style={styles.botaoControleTexto}>CREDITOS</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Modal de Fim de Jogo */}
      {vencedor !== null && (
        <View style={styles.modalFundoAbsoluto}>
          <View
            style={[
              styles.modalCardFimDeJogo,
              {
                backgroundColor: dadosTabuleiro.corCardUI,
                borderColor: dadosTabuleiro.corPrimariaUI,
              },
            ]}
          >
            <Text style={styles.tituloFimDeJogo}>FIM DE JOGO!</Text>
            <Image
              source={
                vencedor === PRETA
                  ? AssetsJogo.PECAS.DAMA_PRETA
                  : AssetsJogo.PECAS.DAMA_BRANCA
              }
              style={styles.iconeVencedorModal}
              resizeMode="contain"
            />
            <Text style={styles.subtituloVencedor}>
              {modoJogo === Configuracoes.MODOS_JOGO.CONTRA_IA
                ? vencedor === PRETA
                  ? 'Voce Venceu a Partida!'
                  : 'O Computador (IA) Venceu!'
                : vencedor === PRETA
                ? 'Jogador 1 (Pretas) Venceu!'
                : 'Jogador 2 (Brancas) Venceu!'}
            </Text>

            <View style={styles.resumoFinalRow}>
              <View style={styles.resumoFinalItem}>
                <Text style={styles.resumoFinalNumero}>
                  {pontuacao[vencedor]}
                </Text>
                <Text style={styles.resumoFinalLabel}>PONTOS DO VENCEDOR</Text>
              </View>
              <View style={styles.divisorVertical} />
              <View style={styles.resumoFinalItem}>
                <Text style={styles.resumoFinalNumero}>
                  {formatarTempo(tempoSegundos)}
                </Text>
                <Text style={styles.resumoFinalLabel}>TEMPO TOTAL</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.botaoJogarNovamente,
                { backgroundColor: dadosTabuleiro.corPrimariaUI },
              ]}
              onPress={reiniciarPartida}
            >
              <Text style={styles.botaoJogarNovamenteTexto}>
                JOGAR NOVAMENTE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoVoltarMenuModal}
              onPress={() =>
                navigation.navigate('TelaBoasVindas', {
                  temaTabuleiro,
                  temaPecas,
                  modoJogo,
                  dificuldadeIA,
                })
              }
            >
              <Text style={styles.botaoVoltarMenuModalTexto}>
                VOLTAR AO MENU PRINCIPAL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal de Audio */}
      {modalAudioVisivel && (
        <View style={styles.modalFundoAbsoluto}>
          <View style={styles.modalCardAudio}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitulo}>CONFIGURACAO DE SOM</Text>
              <TouchableOpacity
                style={styles.botaoFecharTopo}
                onPress={() => setModalAudioVisivel(false)}
              >
                <Text style={styles.botaoFecharTopoTexto}>FECHAR X</Text>
              </TouchableOpacity>
            </View>

            {renderizarLinhaControleAudio(
              'GERAL',
              'Controla ou muta todos os sons do jogo',
              'volumeGeral',
              'mudoGeral'
            )}

            {renderizarLinhaControleAudio(
              'MUSICA DE FUNDO',
              'Trilha acustica durante a partida',
              'volumeMusica',
              'mudoMusica'
            )}

            {renderizarLinhaControleAudio(
              'EFEITOS SONOROS',
              'Toques de madeira, capturas, dama e vitoria',
              'volumeEfeitos',
              'mudoEfeitos'
            )}

            <TouchableOpacity
              style={[
                styles.botaoJogarNovamente,
                { backgroundColor: dadosTabuleiro.corPrimariaUI, marginTop: 6 },
              ]}
              onPress={() => setModalAudioVisivel(false)}
            >
              <Text style={styles.botaoJogarNovamenteTexto}>CONCLUIR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayGeral: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.36)',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  topoHudBloco: {
    width: '100%',
    maxWidth: 420,
    gap: 6,
  },
  hudTopoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  grupoBotoesHud: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoHud: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  botaoHudEspaco: {
    marginLeft: 6,
  },
  botaoHudTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  cronometroBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFD166',
    alignItems: 'center',
  },
  cronometroValor: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cronometroLabel: {
    color: '#CBD5E1',
    fontSize: 8.5,
    fontWeight: '800',
  },
  faixaAvisoContainer: {
    minHeight: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avisoPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFD166',
  },
  avisoCapturaObrigatoria: {
    backgroundColor: 'rgba(153, 27, 27, 0.95)',
    borderColor: '#FCA5A5',
  },
  avisoTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  subtituloRegrasTopo: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  conteudoRetratoCol: {
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  conteudoPaisagemRow: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  colunaLateralPaisagem: {
    width: '44%',
    justifyContent: 'center',
    gap: 10,
  },
  colunaTabuleiroPaisagem: {
    width: '54%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperCentralTabuleiro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardJogador: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  cardJogadorPaisagem: {
    marginBottom: 0,
  },
  jogadorTopoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jogadorIdentificacao: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconeJogador: {
    width: 30,
    height: 30,
    marginRight: 9,
  },
  nomeJogadorTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  subinfoJogadorTexto: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTurno: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeTurnoInativo: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  badgeTurnoTexto: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '900',
  },
  estatisticasJogadorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
  },
  estatisticaPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estatisticaLabel: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '800',
    marginRight: 4,
  },
  estatisticaValor: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  molduraExternaTabuleiro: {
    padding: 6,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
  },
  linhaCoordenadasH: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 1,
  },
  tabuleiroComLaterais: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colunaCoordenadasV: {
    width: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  celulaCoordenadaV: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCoordenada: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  gradeTabuleiro: {
    borderWidth: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  linhaTabuleiro: {
    flexDirection: 'row',
  },
  casaTabuleiro: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  destaqueUltimoMov: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  indicadorMovimentoSimples: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  indicadorMovimentoCaptura: {
    position: 'absolute',
    borderWidth: 3.5,
    backgroundColor: 'rgba(239, 71, 111, 0.18)',
  },
  barraAcoesPartidaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    gap: 8,
  },
  botaoControlePartida: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  botaoControleTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  modalFundoAbsoluto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    zIndex: 200,
  },
  modalCardFimDeJogo: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 3,
  },
  tituloFimDeJogo: {
    color: '#FFD166',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  iconeVencedorModal: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  subtituloVencedor: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  resumoFinalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  resumoFinalItem: {
    alignItems: 'center',
    flex: 1,
  },
  resumoFinalNumero: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: '900',
  },
  resumoFinalLabel: {
    color: '#CBD5E1',
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 2,
  },
  divisorVertical: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  botaoJogarNovamente: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 8,
  },
  botaoJogarNovamenteTexto: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },
  botaoVoltarMenuModal: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  botaoVoltarMenuModalTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalCardAudio: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2.5,
    borderColor: '#FFD166',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitulo: {
    color: '#FFD166',
    fontSize: 14.5,
    fontWeight: '900',
    flex: 1,
  },
  botaoFecharTopo: {
    backgroundColor: '#E63946',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  botaoFecharTopoTexto: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  blocoAudio: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  cabecalhoBlocoAudio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoCanalAudio: {
    flex: 1,
  },
  tituloBlocoAudio: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  subtituloBlocoAudio: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  botaoMudo: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    minWidth: 68,
    alignItems: 'center',
  },
  botaoMudoAtivo: {
    backgroundColor: '#E63946',
  },
  botaoMudoInativo: {
    backgroundColor: '#2A9D8F',
  },
  botaoMudoTexto: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  controlesVolumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botaoAjusteVolume: {
    width: 30,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAjusteVolumeTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  barraSegmentosContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    height: 18,
    alignItems: 'center',
  },
  segmentoVolume: {
    flex: 1,
    height: 12,
    marginHorizontal: 1.5,
    borderRadius: 3,
  },
  segmentoVolumeAtivo: {
    backgroundColor: '#FFD166',
  },
  segmentoVolumeInativo: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});
