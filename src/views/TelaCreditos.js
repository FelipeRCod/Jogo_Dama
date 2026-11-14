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

export default function TelaCreditos({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const isPaisagem = width > height;

  const temaTabuleiro = route?.params?.temaTabuleiro || 'CLASSICO';
  const dadosTabuleiro =
    Configuracoes.TEMPLATES_TABULEIRO[temaTabuleiro] ||
    Configuracoes.TEMPLATES_TABULEIRO.CLASSICO;
  const imagemFundo =
    AssetsJogo.FUNDOS[dadosTabuleiro.fundoKey] || AssetsJogo.FUNDOS.CLASSICO;

  const listaPecasPNG = [
    {
      nome: 'Peca_Preta.png',
      desc: 'Pedra Preta (Ebano Classico)',
      img: AssetsJogo.PECAS.PRETA,
    },
    {
      nome: 'Peca_Branca.png',
      desc: 'Pedra Branca (Marfim Real)',
      img: AssetsJogo.PECAS.BRANCA,
    },
    {
      nome: 'Dama_Preta.png',
      desc: 'Dama Preta (Coroa Dourada)',
      img: AssetsJogo.PECAS.DAMA_PRETA,
    },
    {
      nome: 'Dama_Branca.png',
      desc: 'Dama Branca (Coroa Imperial)',
      img: AssetsJogo.PECAS.DAMA_BRANCA,
    },
  ];

  const paddingTopo = isPaisagem
    ? 8
    : Platform.OS === 'android'
    ? (RNStatusBar.currentHeight || 24) + 12
    : 22;

  const paddingBase = isPaisagem ? 8 : 22;

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
              <View>
                <Text style={styles.tituloPaisagem}>CREDITOS DO JOGO</Text>
                <Text style={styles.subtituloPaisagem}>
                  {Configuracoes.META.INSTITUICAO}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.botaoTopoPaisagem,
                  { backgroundColor: dadosTabuleiro.corPrimariaUI },
                ]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.botaoVoltarTexto}>VOLTAR AO MENU</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.header}>
              <Text style={styles.titulo}>CREDITOS DO JOGO</Text>
              <Text style={styles.subtitulo}>
                {Configuracoes.META.INSTITUICAO}
              </Text>
            </View>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Card Principal com Nome, FATEC e Curso */}
            <View
              style={[
                styles.card,
                { backgroundColor: dadosTabuleiro.corCardUI },
              ]}
            >
              <Text
                style={[
                  styles.labelSecao,
                  { color: dadosTabuleiro.corPrimariaUI },
                ]}
              >
                DESENVOLVEDOR E DADOS ACADEMICOS
              </Text>
              <Text
                style={[
                  styles.nomeDev,
                  { color: dadosTabuleiro.corTextoUI },
                ]}
              >
                {Configuracoes.META.DESENVOLVEDOR}
              </Text>

              <View
                style={[
                  styles.infoGrid,
                  isPaisagem && styles.infoGridPaisagem,
                ]}
              >
                <View
                  style={[
                    styles.infoItem,
                    isPaisagem && styles.infoItemPaisagem,
                  ]}
                >
                  <Text
                    style={[
                      styles.infoTitulo,
                      { color: dadosTabuleiro.corTextoUI },
                    ]}
                  >
                    Instituicao:
                  </Text>
                  <Text
                    style={[
                      styles.infoValor,
                      { color: dadosTabuleiro.corTextoUI },
                    ]}
                  >
                    FATEC (Faculdade de Tecnologia)
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoItem,
                    isPaisagem && styles.infoItemPaisagem,
                  ]}
                >
                  <Text
                    style={[
                      styles.infoTitulo,
                      { color: dadosTabuleiro.corTextoUI },
                    ]}
                  >
                    Curso:
                  </Text>
                  <Text
                    style={[
                      styles.infoValor,
                      { color: dadosTabuleiro.corTextoUI },
                    ]}
                  >
                    {Configuracoes.META.CURSO} ({Configuracoes.META.TURMA})
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoItem,
                    isPaisagem && styles.infoItemPaisagem,
                  ]}
                >
                  <Text
                    style={[
                      styles.infoTitulo,
                      { color: dadosTabuleiro.corTextoUI },
                    ]}
                  >
                    Disciplina / Professor:
                  </Text>
                  <Text
                    style={[
                      styles.infoValor,
                      { color: dadosTabuleiro.corTextoUI },
                    ]}
                  >
                    {Configuracoes.META.DISCIPLINA} — Prof.{' '}
                    {Configuracoes.META.PROFESSOR}
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoItem,
                    isPaisagem && styles.infoItemPaisagem,
                  ]}
                >
                  <Text
                    style={[
                      styles.infoTitulo,
                      { color: dadosTabuleiro.corTextoUI },
                    ]}
                  >
                    Arquitetura & Motor:
                  </Text>
                  <Text
                    style={[
                      styles.infoValor,
                      { color: dadosTabuleiro.corTextoUI },
                    ]}
                  >
                    {Configuracoes.META.ARQUITETURA} •{' '}
                    {Configuracoes.META.ENGINE}
                  </Text>
                </View>
              </View>

              {/* Frase Obrigatoria da Atividade Pratica 11 */}
              <View style={styles.caixaFraseObrigatoria}>
                <Text style={styles.textoFraseObrigatoria}>
                  "{Configuracoes.META.FRASE_ACADEMICA}"
                </Text>
              </View>
            </View>

            {/* Galeria das 4 Pedras PNG Classicas */}
            <View
              style={[
                styles.card,
                { backgroundColor: dadosTabuleiro.corCardUI },
              ]}
            >
              <Text
                style={[
                  styles.cardTitulo,
                  { color: '#FFD166' },
                ]}
              >
                Assets Visuais Classicos (Pedras Pretas e Brancas em PNG)
              </Text>

              <View style={styles.spritesGrid}>
                {listaPecasPNG.map((item) => (
                  <View
                    key={item.nome}
                    style={[
                      styles.spriteBox,
                      isPaisagem && styles.spriteBoxPaisagem,
                    ]}
                  >
                    <Image
                      source={item.img}
                      style={styles.spriteImg}
                      resizeMode="contain"
                    />
                    <Text
                      style={[
                        styles.spriteDesc,
                        { color: dadosTabuleiro.corTextoUI },
                      ]}
                    >
                      {item.desc}
                    </Text>
                    <Text style={styles.spriteArquivo}>{item.nome}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {!isPaisagem && (
            <TouchableOpacity
              style={[
                styles.botaoVoltar,
                { backgroundColor: dadosTabuleiro.corPrimariaUI },
              ]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.botaoVoltarTexto}>
                VOLTAR AO MENU PRINCIPAL
              </Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
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
  titulo: {
    fontSize: 24,
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
    fontSize: 13,
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
  card: {
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  labelSecao: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nomeDev: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 8,
  },
  infoGrid: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 8,
  },
  infoGridPaisagem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    marginBottom: 5,
  },
  infoItemPaisagem: {
    width: '48%',
  },
  infoTitulo: {
    fontSize: 11.5,
    fontWeight: '800',
    opacity: 0.78,
  },
  infoValor: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  caixaFraseObrigatoria: {
    marginTop: 10,
    padding: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 209, 102, 0.14)',
    borderWidth: 1.5,
    borderColor: '#FFD166',
  },
  textoFraseObrigatoria: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 17,
  },
  cardTitulo: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  spritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spriteBox: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  spriteBoxPaisagem: {
    width: '23.5%',
  },
  spriteImg: {
    width: 56,
    height: 56,
    marginBottom: 4,
  },
  spriteDesc: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  spriteArquivo: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  botaoVoltar: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginTop: 6,
  },
  botaoTopoPaisagem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  botaoVoltarTexto: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 12.5,
  },
});
