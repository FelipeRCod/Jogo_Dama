import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  useWindowDimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import {
  PECAS,
  Configuracoes,
  AssetsJogo,
  obterConfigAudio,
  atualizarConfigAudio,
  inscreverConfigAudio,
} from '../models/Configuracoes';
import PecaDama from '../components/PecaDama';

const NOMES_CURTOS_TABULEIRO = {
  CLASSICO: 'CLASSICO',
  ESMERALDA: 'TORNEIO',
  REAL: 'MARMORE',
};

export default function TelaBoasVindas({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const isPaisagem = width > height;

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
  const [mostrarDamaPreview, setMostrarDamaPreview] = useState(false);
  const [modalAudioVisivel, setModalAudioVisivel] = useState(false);
  const [cfgAudio, setCfgAudio] = useState(obterConfigAudio);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setMostrarDamaPreview((prev) => !prev);
    }, 1800);
    const cancelarInscricao = inscreverConfigAudio((novaCfg) => {
      setCfgAudio(novaCfg);
    });
    return () => {
      clearInterval(intervalo);
      cancelarInscricao();
    };
  }, []);

  const dadosTabuleiro =
    Configuracoes.TEMPLATES_TABULEIRO[temaTabuleiro] ||
    Configuracoes.TEMPLATES_TABULEIRO.CLASSICO;
  const dadosPecas =
    Configuracoes.TEMPLATES_PECAS[temaPecas] ||
    Configuracoes.TEMPLATES_PECAS.CLASSICO;
  const imagemFundo =
    AssetsJogo.FUNDOS[dadosTabuleiro.fundoKey] || AssetsJogo.FUNDOS.CLASSICO;

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
      <View
        style={[
          styles.blocoAudio,
          isPaisagem && styles.blocoAudioPaisagem,
        ]}
      >
        <View
          style={[
            styles.cabecalhoBlocoAudio,
            isPaisagem && styles.cabecalhoBlocoAudioPaisagem,
          ]}
        >
          <View style={styles.infoCanalAudio}>
            <Text style={styles.tituloBlocoAudio}>{titulo}</Text>
            {!isPaisagem && (
              <Text style={styles.subtituloBlocoAudio}>{subtitulo}</Text>
            )}
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

        <View
          style={[
            styles.controlesVolumeRow,
            isPaisagem && styles.controlesVolumeRowPaisagem,
          ]}
        >
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
    : 22;

  const parametrosNavegacao = {
    temaTabuleiro,
    temaPecas,
    modoJogo,
    dificuldadeIA,
  };

  const renderizarCardPreview = () => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setMostrarDamaPreview((prev) => !prev)}
      style={[
        styles.previewCard,
        isPaisagem && styles.previewCardPaisagem,
        {
          backgroundColor: dadosTabuleiro.corCardUI,
          borderColor: dadosTabuleiro.corPrimariaUI,
        },
      ]}
    >
      <View
        style={[
          styles.miniTabuleiroBox,
          {
            borderColor: dadosTabuleiro.bordaTabuleiro,
            backgroundColor: dadosTabuleiro.molduraExterna,
          },
        ]}
      >
        {[0, 1].map((r) => (
          <View key={`row_${r}`} style={styles.miniTabuleiroLinha}>
            {[0, 1, 2, 3].map((c) => {
              const escura = (r + c) % 2 === 1;
              let tipoPeca = PECAS.VAZIO;
              if (r === 0 && c === 1) {
                tipoPeca = mostrarDamaPreview ? PECAS.DAMA_BRANCA : PECAS.BRANCA;
              } else if (r === 1 && c === 2) {
                tipoPeca = mostrarDamaPreview ? PECAS.DAMA_PRETA : PECAS.PRETA;
              } else if (r === 0 && c === 3) {
                tipoPeca = PECAS.BRANCA;
              } else if (r === 1 && c === 0) {
                tipoPeca = PECAS.PRETA;
              }

              return (
                <View
                  key={`sq_${r}_${c}`}
                  style={[
                    styles.miniCasa,
                    isPaisagem && styles.miniCasaPaisagem,
                    {
                      backgroundColor: escura
                        ? dadosTabuleiro.casaEscura
                        : dadosTabuleiro.casaClara,
                    },
                  ]}
                >
                  {tipoPeca !== PECAS.VAZIO && (
                    <PecaDama
                      tipo={tipoPeca}
                      tamanho={isPaisagem ? 38 : 48}
                      selecionada={r === 1 && c === 2 && mostrarDamaPreview}
                      templatePecasId={temaPecas}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={[styles.dicaPreview, { color: dadosTabuleiro.corTextoUI }]}>
        {mostrarDamaPreview
          ? 'Modo Dama Real (Coroa Dourada) — Toque para alternar'
          : 'Pedras Classicas Pretas e Brancas (PNG) — Toque para ver Damas'}
      </Text>

      <View style={styles.itensResumoRow}>
        <View style={styles.itemBadge}>
          <Image
            source={AssetsJogo.PECAS.PRETA}
            style={styles.iconeMiniPeca}
            resizeMode="contain"
          />
          <Text style={[styles.itemBadgeTexto, { color: dadosTabuleiro.corTextoUI }]}>
            {dadosPecas.nomePreta}
          </Text>
        </View>
        <View style={styles.itemBadge}>
          <Image
            source={AssetsJogo.PECAS.BRANCA}
            style={styles.iconeMiniPeca}
            resizeMode="contain"
          />
          <Text style={[styles.itemBadgeTexto, { color: dadosTabuleiro.corTextoUI }]}>
            {dadosPecas.nomeBranca}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderizarControlesMenu = () => (
    <View style={styles.blocoDireitoMenu}>
      {/* Card de Configuracoes da Partida e Cores */}
      <View
        style={[
          styles.painelOpcoesCard,
          { backgroundColor: dadosTabuleiro.corCardUI },
        ]}
      >
        <View style={styles.seletorBloco}>
          <Text style={styles.seletorLabel}>MODO DE PARTIDA:</Text>
          <View style={styles.botoesOpcoesRow}>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                modoJogo === Configuracoes.MODOS_JOGO.DOIS_JOGADORES && {
                  backgroundColor: dadosTabuleiro.corPrimariaUI,
                  borderColor: '#FFFFFF',
                },
              ]}
              onPress={() => setModoJogo(Configuracoes.MODOS_JOGO.DOIS_JOGADORES)}
            >
              <Text
                style={[
                  styles.botaoOpcaoTexto,
                  modoJogo === Configuracoes.MODOS_JOGO.DOIS_JOGADORES &&
                    styles.botaoOpcaoTextoAtivo,
                ]}
              >
                2 JOGADORES
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                modoJogo === Configuracoes.MODOS_JOGO.CONTRA_IA && {
                  backgroundColor: dadosTabuleiro.corPrimariaUI,
                  borderColor: '#FFFFFF',
                },
              ]}
              onPress={() => setModoJogo(Configuracoes.MODOS_JOGO.CONTRA_IA)}
            >
              <Text
                style={[
                  styles.botaoOpcaoTexto,
                  modoJogo === Configuracoes.MODOS_JOGO.CONTRA_IA &&
                    styles.botaoOpcaoTextoAtivo,
                ]}
              >
                VS COMPUTADOR (IA)
              </Text>
            </TouchableOpacity>
          </View>

          {modoJogo === Configuracoes.MODOS_JOGO.CONTRA_IA && (
            <View style={styles.dificuldadeRow}>
              {Object.values(Configuracoes.DIFICULDADES_IA).map((dif) => {
                const ativo = dificuldadeIA === dif.id;
                return (
                  <TouchableOpacity
                    key={dif.id}
                    style={[
                      styles.botaoDificuldade,
                      ativo && {
                        backgroundColor: dadosTabuleiro.corSecundariaUI,
                        borderColor: '#FFFFFF',
                      },
                    ]}
                    onPress={() => setDificuldadeIA(dif.id)}
                  >
                    <Text
                      style={[
                        styles.botaoDificuldadeTexto,
                        ativo && { color: '#0F172A' },
                      ]}
                    >
                      IA: {dif.nome.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.seletorBloco}>
          <Text style={styles.seletorLabel}>CORES DO TABULEIRO:</Text>
          <View style={styles.botoesOpcoesRow}>
            {Object.values(Configuracoes.TEMPLATES_TABULEIRO).map((tpl) => {
              const ativo = temaTabuleiro === tpl.id;
              return (
                <TouchableOpacity
                  key={tpl.id}
                  style={[
                    styles.botaoOpcao,
                    ativo && {
                      backgroundColor: tpl.corPrimariaUI,
                      borderColor: '#FFFFFF',
                    },
                  ]}
                  onPress={() => setTemaTabuleiro(tpl.id)}
                >
                  <View style={styles.amostraCoresRow}>
                    <View
                      style={[
                        styles.quadradinhoCor,
                        { backgroundColor: tpl.casaClara },
                      ]}
                    />
                    <View
                      style={[
                        styles.quadradinhoCor,
                        { backgroundColor: tpl.casaEscura },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.botaoOpcaoTextoPequeno,
                      ativo && styles.botaoOpcaoTextoAtivo,
                    ]}
                    numberOfLines={1}
                  >
                    {NOMES_CURTOS_TABULEIRO[tpl.id] || tpl.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.seletorBloco, { marginBottom: 0 }]}>
          <Text style={styles.seletorLabel}>ESTILO DAS PEDRAS (PNG):</Text>
          <View style={styles.botoesOpcoesRow}>
            {Object.values(Configuracoes.TEMPLATES_PECAS).map((tplPeca) => {
              const ativo = temaPecas === tplPeca.id;
              return (
                <TouchableOpacity
                  key={tplPeca.id}
                  style={[
                    styles.botaoOpcao,
                    ativo && {
                      backgroundColor: dadosTabuleiro.corPrimariaUI,
                      borderColor: '#FFFFFF',
                    },
                  ]}
                  onPress={() => setTemaPecas(tplPeca.id)}
                >
                  <Text
                    style={[
                      styles.botaoOpcaoTexto,
                      ativo && styles.botaoOpcaoTextoAtivo,
                    ]}
                    numberOfLines={1}
                  >
                    {tplPeca.id === 'CLASSICO'
                      ? 'CLASSICAS (PNG)'
                      : 'IMPERIAIS (PNG)'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Botoes de Acao e Navegacao */}
      <View style={styles.menuBotoes}>
        <TouchableOpacity
          style={[
            styles.botaoPrincipal,
            isPaisagem && styles.botaoPrincipalPaisagem,
            { backgroundColor: dadosTabuleiro.corPrimariaUI },
          ]}
          onPress={() => navigation.navigate('TelaJogo', parametrosNavegacao)}
        >
          <Text style={styles.botaoPrincipalTexto}>JOGAR AGORA</Text>
        </TouchableOpacity>

        <View style={styles.botoesSecundariosRow}>
          <TouchableOpacity
            style={[styles.botaoSecundario, isPaisagem && styles.botaoSecundarioPaisagem]}
            onPress={() => navigation.navigate('TelaInstrucoes', parametrosNavegacao)}
          >
            <Text style={styles.botaoSecundarioTexto}>INSTRUCOES</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoSecundario, isPaisagem && styles.botaoSecundarioPaisagem]}
            onPress={() => setModalAudioVisivel(true)}
          >
            <Text style={styles.botaoSecundarioTexto}>
              {cfgAudio.mudoGeral ? 'SOM: OFF' : 'SOM / AUDIO'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoSecundario, isPaisagem && styles.botaoSecundarioPaisagem]}
            onPress={() => navigation.navigate('TelaCreditos', parametrosNavegacao)}
          >
            <Text style={styles.botaoSecundarioTexto}>CREDITOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground source={imagemFundo} style={styles.fundo} resizeMode="cover">
      <View style={styles.safeArea}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.overlay,
            { paddingTop: paddingTopo },
            isPaisagem && styles.overlayPaisagem,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {isPaisagem ? (
            <View style={styles.containerPaisagemRow}>
              <View style={styles.colunaEsquerdaPaisagem}>
                <View style={styles.headerPaisagemRow}>
                  <Text style={styles.tituloPaisagem}>DAMAS CLASSICAS</Text>
                  <View style={styles.badgeTopoPaisagem}>
                    <Text style={styles.badgeTexto}>{Configuracoes.META.INSTITUICAO}</Text>
                  </View>
                </View>
                {renderizarCardPreview()}
              </View>

              <View style={styles.colunaDireitaPaisagem}>
                {renderizarControlesMenu()}
              </View>
            </View>
          ) : (
            <View style={styles.containerRetratoCol}>
              <View style={styles.topoBlocoRetrato}>
                <View style={styles.badgeTopo}>
                  <Text style={styles.badgeTexto}>{Configuracoes.META.INSTITUICAO}</Text>
                </View>

                <View style={styles.headerContainer}>
                  <Text style={styles.tituloSombra}>DAMAS CLASSICAS</Text>
                  <Text style={styles.titulo}>DAMAS CLASSICAS</Text>
                  <Text style={styles.subtitulo}>{dadosTabuleiro.subtitulo}</Text>
                </View>
              </View>

              {renderizarCardPreview()}
              {renderizarControlesMenu()}
            </View>
          )}
        </ScrollView>
      </View>

      {modalAudioVisivel && (
        <View style={styles.modalFundoAbsoluto}>
          <View style={[styles.modalCard, isPaisagem && styles.modalCardPaisagem]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitulo}>CONFIGURACAO DE SOM DO JOGO</Text>
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
              'Trilha acustica classica durante a partida',
              'volumeMusica',
              'mudoMusica'
            )}

            {renderizarLinhaControleAudio(
              'EFEITOS SONOROS',
              'Sons de movimento na madeira, captura, dama e vitoria',
              'volumeEfeitos',
              'mudoEfeitos'
            )}

            <TouchableOpacity
              style={[
                styles.botaoFecharModal,
                isPaisagem && styles.botaoFecharModalPaisagem,
                { backgroundColor: dadosTabuleiro.corPrimariaUI },
              ]}
              onPress={() => setModalAudioVisivel(false)}
            >
              <Text style={styles.botaoFecharModalTexto}>SALVAR E FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.36)',
  },
  overlay: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPaisagem: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    justifyContent: 'center',
  },
  containerRetratoCol: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  topoBlocoRetrato: {
    alignItems: 'center',
    width: '100%',
  },
  containerPaisagemRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colunaEsquerdaPaisagem: {
    width: '45%',
    justifyContent: 'center',
  },
  colunaDireitaPaisagem: {
    width: '53%',
    justifyContent: 'center',
  },
  blocoDireitoMenu: {
    width: '100%',
    gap: 14,
  },
  headerPaisagemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeTopo: {
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 209, 102, 0.55)',
    marginBottom: 8,
  },
  badgeTopoPaisagem: {
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  badgeTexto: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerContainer: {
    alignItems: 'center',
  },
  tituloSombra: {
    position: 'absolute',
    top: 3,
    fontSize: 34,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1.5,
  },
  titulo: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFD166',
    letterSpacing: 1.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tituloPaisagem: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFD166',
    letterSpacing: 1.2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitulo: {
    marginTop: 5,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewCard: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 2.5,
  },
  previewCardPaisagem: {
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  miniTabuleiroBox: {
    borderWidth: 4,
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
  },
  miniTabuleiroLinha: {
    flexDirection: 'row',
  },
  miniCasa: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCasaPaisagem: {
    width: 44,
    height: 44,
  },
  dicaPreview: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  itensResumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 8,
  },
  itemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconeMiniPeca: {
    width: 28,
    height: 28,
    marginRight: 7,
  },
  itemBadgeTexto: {
    fontSize: 12,
    fontWeight: '800',
  },
  painelOpcoesCard: {
    width: '100%',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  seletorBloco: {
    width: '100%',
    marginBottom: 12,
  },
  seletorLabel: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.7,
  },
  botoesOpcoesRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 8,
  },
  botaoOpcao: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  botaoOpcaoTexto: {
    color: '#F1F5F9',
    fontWeight: '800',
    fontSize: 12,
  },
  botaoOpcaoTextoPequeno: {
    color: '#F1F5F9',
    fontWeight: '800',
    fontSize: 11.5,
  },
  botaoOpcaoTextoAtivo: {
    color: '#0F172A',
    fontWeight: '900',
  },
  amostraCoresRow: {
    flexDirection: 'row',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quadradinhoCor: {
    width: 12,
    height: 12,
  },
  dificuldadeRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
    gap: 8,
  },
  botaoDificuldade: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  botaoDificuldadeTexto: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
  },
  menuBotoes: {
    width: '100%',
    gap: 10,
  },
  botaoPrincipal: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  botaoPrincipalPaisagem: {
    paddingVertical: 11,
  },
  botaoPrincipalTexto: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  botoesSecundariosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  botaoSecundario: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  botaoSecundarioPaisagem: {
    paddingVertical: 9,
  },
  botaoSecundarioTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalFundoAbsoluto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 200,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 2.5,
    borderColor: '#FFD166',
  },
  modalCardPaisagem: {
    maxWidth: 620,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitulo: {
    color: '#FFD166',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.6,
    flex: 1,
  },
  botaoFecharTopo: {
    backgroundColor: '#E63946',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginLeft: 8,
  },
  botaoFecharTopoTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  blocoAudio: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  blocoAudioPaisagem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  cabecalhoBlocoAudio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cabecalhoBlocoAudioPaisagem: {
    width: 185,
    marginBottom: 0,
    marginRight: 10,
  },
  infoCanalAudio: {
    flex: 1,
  },
  tituloBlocoAudio: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
  subtituloBlocoAudio: {
    color: '#CBD5E1',
    fontSize: 10.5,
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
  controlesVolumeRowPaisagem: {
    flex: 1,
  },
  botaoAjusteVolume: {
    width: 32,
    height: 30,
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
  botaoFecharModal: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  botaoFecharModalPaisagem: {
    paddingVertical: 8,
  },
  botaoFecharModalTexto: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
