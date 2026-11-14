import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  useWindowDimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Configuracoes, AssetsJogo } from '../models/Configuracoes';

export default function TelaInstrucoes({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const isPaisagem = width > height;

  const temaTabuleiro = route?.params?.temaTabuleiro || 'CLASSICO';
  const temaPecas = route?.params?.temaPecas || 'CLASSICO';
  const modoJogo = route?.params?.modoJogo || Configuracoes.MODOS_JOGO.DOIS_JOGADORES;
  const dificuldadeIA = route?.params?.dificuldadeIA || 'medium';

  const dadosTabuleiro =
    Configuracoes.TEMPLATES_TABULEIRO[temaTabuleiro] ||
    Configuracoes.TEMPLATES_TABULEIRO.CLASSICO;
  const imagemFundo =
    AssetsJogo.FUNDOS[dadosTabuleiro.fundoKey] || AssetsJogo.FUNDOS.CLASSICO;

  const paddingTopo = isPaisagem
    ? 8
    : Platform.OS === 'android'
    ? (RNStatusBar.currentHeight || 24) + 12
    : 22;

  const paddingBase = isPaisagem ? 8 : 22;

  const paramsJogo = {
    temaTabuleiro,
    temaPecas,
    modoJogo,
    dificuldadeIA,
  };

  return (
    <ImageBackground source={imagemFundo} style={styles.fundo} resizeMode="cover">
      <View style={styles.safeArea}>
        <View
          style={[
            styles.overlay,
            { paddingTop: paddingTopo, paddingBottom: paddingBase },
            isPaisagem && styles.overlayPaisagem,
          ]}
        >
          {isPaisagem ? (
            <View style={styles.headerPaisagemRow}>
              <TouchableOpacity
                style={styles.botaoTopoPaisagem}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.botaoVoltarTexto}>VOLTAR</Text>
              </TouchableOpacity>

              <View style={styles.headerCentroPaisagem}>
                <Text style={styles.tituloPaisagem}>INSTRUCOES DO JOGO</Text>
                <Text style={styles.subtituloPaisagem}>
                  Regras Brasileiras - Damas Classicas
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.botaoJogarTopoPaisagem,
                  { backgroundColor: dadosTabuleiro.corPrimariaUI },
                ]}
                onPress={() => navigation.navigate('TelaJogo', paramsJogo)}
              >
                <Text style={styles.botaoJogarTexto}>JOGAR AGORA</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.header}>
              <Text style={styles.titulo}>INSTRUCOES DO JOGO</Text>
              <Text style={styles.subtitulo}>
                Guia Completo - Damas Classicas (Regras Brasileiras)
              </Text>
            </View>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={isPaisagem ? styles.gridPaisagemRow : null}>
              <View
                style={[
                  styles.card,
                  isPaisagem && styles.cardMetadePaisagem,
                  { backgroundColor: dadosTabuleiro.corCardUI },
                ]}
              >
                <Text style={[styles.cardTitulo, { color: '#FFD166' }]}>
                  1. Objetivo e Movimento das Pedras
                </Text>
                <View style={styles.itemRow}>
                  <Image
                    source={AssetsJogo.PECAS.PRETA}
                    style={styles.iconePeca}
                    resizeMode="contain"
                  />
                  <Image
                    source={AssetsJogo.PECAS.BRANCA}
                    style={styles.iconePeca}
                    resizeMode="contain"
                  />
                  <View style={styles.textoCol}>
                    <Text style={[styles.itemTexto, { color: dadosTabuleiro.corTextoUI }]}>
                      - <Text style={styles.negrito}>Tabuleiro 8x8:</Text> Cada jogador inicia
                      com 12 pedras posicionadas nas casas escuras.
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTabuleiro.corTextoUI }]}>
                      - <Text style={styles.negrito}>Pedras Pretas:</Text> Iniciam a partida
                      movendo-se uma casa na diagonal para frente.
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTabuleiro.corTextoUI }]}>
                      - <Text style={styles.negrito}>Vitoria:</Text> Vence quem capturar ou
                      bloquear todas as pecas do adversario.
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.card,
                  isPaisagem && styles.cardMetadePaisagem,
                  { backgroundColor: dadosTabuleiro.corCardUI },
                ]}
              >
                <Text style={[styles.cardTitulo, { color: '#FFD166' }]}>
                  2. Promocao a Dama Voadora
                </Text>
                <View style={styles.itemRow}>
                  <Image
                    source={AssetsJogo.PECAS.DAMA_PRETA}
                    style={styles.iconePeca}
                    resizeMode="contain"
                  />
                  <Image
                    source={AssetsJogo.PECAS.DAMA_BRANCA}
                    style={styles.iconePeca}
                    resizeMode="contain"
                  />
                  <View style={styles.textoCol}>
                    <Text style={[styles.itemTexto, { color: dadosTabuleiro.corTextoUI }]}>
                      - <Text style={styles.negrito}>Coroacao:</Text> Ao alcancar a ultima
                      fileira adversaria, a pedra recebe a <Text style={styles.negrito}>Coroa Dourada</Text> e vira <Text style={styles.negrito}>Dama</Text>.
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTabuleiro.corTextoUI }]}>
                      - <Text style={styles.negrito}>Dama Voadora:</Text> Move-se e captura a
                      quantas casas livres quiser na diagonal (frente e tras).
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: dadosTabuleiro.corCardUI }]}>
              <Text style={[styles.cardTitulo, { color: '#FFD166' }]}>
                3. Captura Obrigatoria com Escolha Livre, Pontos e Modos
              </Text>

              <View style={isPaisagem ? styles.gridPaisagemRow : null}>
                <View style={[styles.itemRow, isPaisagem && styles.itemMetadePaisagem]}>
                  <View style={[styles.badgeRegra, { backgroundColor: '#EF476F' }]}>
                    <Text style={styles.badgeRegraTexto}>CAPTURA</Text>
                  </View>
                  <View style={styles.textoCol}>
                    <Text style={[styles.subtituloItem, { color: '#FFD166' }]}>
                      Captura Obrigatoria (Escolha Livre)
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTabuleiro.corTextoUI }]}>
                      A captura e obrigatoria (para <Text style={styles.negrito}>frente e para tras</Text>). Se houver mais de uma opcao de captura disponivel, o jogador tem <Text style={styles.negrito}>total liberdade para escolher</Text> qual peca ou caminho deseja capturar!
                    </Text>
                  </View>
                </View>

                {!isPaisagem && <View style={styles.divisor} />}

                <View style={[styles.itemRow, isPaisagem && styles.itemMetadePaisagem]}>
                  <View style={[styles.badgeRegra, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.badgeRegraTexto}>EXTRAS</Text>
                  </View>
                  <View style={styles.textoCol}>
                    <Text style={[styles.subtituloItem, { color: '#52B788' }]}>
                      2 Jogadores, IA, Pontos, Tempo e Som
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTabuleiro.corTextoUI }]}>
                      Cada captura soma <Text style={styles.negrito}>+100 pts</Text>, promocao a Dama soma <Text style={styles.negrito}>+150 pts</Text> e vitoria <Text style={styles.negrito}>+500 pts</Text>. Inclui cronometro em tempo real, templates de cores e mixer de som.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {!isPaisagem && (
            <View style={styles.footerBotoes}>
              <TouchableOpacity
                style={styles.botaoVoltar}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.botaoVoltarTexto}>VOLTAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoJogar,
                  { backgroundColor: dadosTabuleiro.corPrimariaUI },
                ]}
                onPress={() => navigation.navigate('TelaJogo', paramsJogo)}
              >
                <Text style={styles.botaoJogarTexto}>JOGAR AGORA</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  overlayPaisagem: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerPaisagemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerCentroPaisagem: {
    alignItems: 'center',
  },
  titulo: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FFD166',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  tituloPaisagem: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFD166',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitulo: {
    fontSize: 12.5,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtituloPaisagem: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  gridPaisagemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  cardMetadePaisagem: {
    width: '49%',
  },
  itemMetadePaisagem: {
    width: '48.5%',
  },
  cardTitulo: {
    fontSize: 14.5,
    fontWeight: '900',
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconePeca: {
    width: 44,
    height: 44,
    marginRight: 6,
  },
  badgeRegra: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 66,
  },
  badgeRegraTexto: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  textoCol: {
    flex: 1,
  },
  subtituloItem: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  itemTexto: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 2,
  },
  negrito: {
    fontWeight: '800',
    color: '#FFD166',
  },
  divisor: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 8,
  },
  footerBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  botaoVoltar: {
    flex: 1,
    marginRight: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  botaoTopoPaisagem: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  botaoVoltarTexto: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12.5,
  },
  botaoJogar: {
    flex: 1.4,
    marginLeft: 6,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  botaoJogarTopoPaisagem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  botaoJogarTexto: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 12.5,
  },
});
