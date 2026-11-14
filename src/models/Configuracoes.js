import { Dimensions } from 'react-native';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

export const PECAS = {
  VAZIO: 0,
  PRETA: 1,       // Jogador 1 (Baixo)
  BRANCA: 2,      // Jogador 2 / Computador (Topo)
  DAMA_PRETA: 3,
  DAMA_BRANCA: 4,
};

export const Configuracoes = {
  META: {
    TITULO: 'Damas Classicas',
    SUBTITULO: 'Regras Brasileiras',
    DESENVOLVEDOR: 'Felipe Rocha de Oliveira',
    PROFESSOR: 'Jeferson de Souza Dias',
    DISCIPLINA: 'Programacao para Dispositivos Moveis II',
    TURMA: '5o Semestre',
    CURSO: 'Desenvolvimento de Software Multiplataforma',
    INSTITUICAO: 'FATEC - DSM - 2026',
    ARQUITETURA: 'MVC (Model-View-Controller)',
    SDK: 'Expo SDK 58',
    ENGINE: 'Minimax Alpha-Beta + DFS Captura Livre',
    FRASE_ACADEMICA:
      'Este site é um projeto acadêmico da FATEC, criado apenas para fins de estudo. Não utilize as informações aqui para uso real.',
  },

  TELA: {
    LARGURA: WINDOW_WIDTH,
    ALTURA: WINDOW_HEIGHT,
  },

  PONTUACAO: {
    CAPTURA_PECA: 100,
    PROMOCAO_DAMA: 150,
    VITORIA_PARTIDA: 500,
  },

  MODOS_JOGO: {
    DOIS_JOGADORES: 'local',
    CONTRA_IA: 'ai',
  },

  DIFICULDADES_IA: {
    FACIL: { id: 'easy', nome: 'Facil', profundidade: 2 },
    MEDIO: { id: 'medium', nome: 'Medio', profundidade: 4 },
    DIFICIL: { id: 'hard', nome: 'Dificil', profundidade: 5 },
  },

  // Template de cores para o tabuleiro (pelo menos 2 cores diferentes por template e 3 temas selecionaveis)
  TEMPLATES_TABULEIRO: {
    CLASSICO: {
      id: 'CLASSICO',
      nome: 'Madeira Classica',
      subtitulo: 'Mogno Nobre & Marfim Imperial',
      casaEscura: '#8B4513',
      casaClara: '#DEB887',
      bordaTabuleiro: '#4A250A',
      molduraExterna: '#2C1505',
      corCoordenadas: '#F5DEB3',
      corDestaqueUltimoMov: 'rgba(255, 215, 0, 0.35)',
      corIndicadorMovimento: 'rgba(46, 213, 115, 0.78)',
      corIndicadorCaptura: 'rgba(230, 57, 70, 0.85)',
      corPrimariaUI: '#FFB703',
      corSecundariaUI: '#D4A373',
      corCardUI: 'rgba(28, 19, 14, 0.92)',
      corTextoUI: '#F8F9FA',
      fundoKey: 'CLASSICO',
    },
    ESMERALDA: {
      id: 'ESMERALDA',
      nome: 'Torneio Esmeralda',
      subtitulo: 'Verde Oficial & Creme Real',
      casaEscura: '#2D6A4F',
      casaClara: '#E9F5DB',
      bordaTabuleiro: '#1B4332',
      molduraExterna: '#081C15',
      corCoordenadas: '#B7E4C7',
      corDestaqueUltimoMov: 'rgba(255, 183, 3, 0.38)',
      corIndicadorMovimento: 'rgba(255, 209, 102, 0.88)',
      corIndicadorCaptura: 'rgba(239, 71, 111, 0.88)',
      corPrimariaUI: '#52B788',
      corSecundariaUI: '#95D5B2',
      corCardUI: 'rgba(13, 33, 26, 0.92)',
      corTextoUI: '#F8F9FA',
      fundoKey: 'ESMERALDA',
    },
    REAL: {
      id: 'REAL',
      nome: 'Marmore &Obsidiana',
      subtitulo: 'Ardosia Real & Quartzo Branco',
      casaEscura: '#33415C',
      casaClara: '#E2E8F0',
      bordaTabuleiro: '#1E293B',
      molduraExterna: '#0F172A',
      corCoordenadas: '#CBD5E1',
      corDestaqueUltimoMov: 'rgba(56, 189, 248, 0.38)',
      corIndicadorMovimento: 'rgba(52, 211, 153, 0.85)',
      corIndicadorCaptura: 'rgba(244, 63, 94, 0.88)',
      corPrimariaUI: '#38BDF8',
      corSecundariaUI: '#94A3B8',
      corCardUI: 'rgba(15, 23, 42, 0.93)',
      corTextoUI: '#F8FAFC',
      fundoKey: 'ESMERALDA',
    },
  },

  // Template de cores para as pecas (Pecas Brancas e Pretas em PNG + estilos de anel/destaque)
  TEMPLATES_PECAS: {
    CLASSICO: {
      id: 'CLASSICO',
      nome: 'Pedras Classicas (PNG)',
      descricao: 'Ebano Preto & Marfim Branco com Coroa Real',
      nomePreta: 'Pretas (Ebano)',
      nomeBranca: 'Brancas (Marfim)',
      corAnelPreta: '#4A5568',
      corAnelBranca: '#D6BCFA',
      corGlowSelecionada: '#FFD166',
      corGlowCapturaObrigatoria: '#EF476F',
      tintPreta: null,
      tintBranca: null,
    },
    OURO_NEON: {
      id: 'OURO_NEON',
      nome: 'Pedras Imperiais',
      descricao: 'Ônix Profundo & Perola Dourada',
      nomePreta: 'Pretas (Ônix)',
      nomeBranca: 'Brancas (Perola)',
      corAnelPreta: '#F59E0B',
      corAnelBranca: '#10B981',
      corGlowSelecionada: '#38BDF8',
      corGlowCapturaObrigatoria: '#F43F5E',
      tintPreta: null,
      tintBranca: null,
    },
  },
};

export const AssetsJogo = {
  FUNDOS: {
    CLASSICO: require('../assets/Fundo_Classico.png'),
    ESMERALDA: require('../assets/Fundo_Esmeralda.png'),
  },

  PECAS: {
    PRETA: require('../assets/Peca_Preta.png'),
    BRANCA: require('../assets/Peca_Branca.png'),
    DAMA_PRETA: require('../assets/Dama_Preta.png'),
    DAMA_BRANCA: require('../assets/Dama_Branca.png'),
  },

  SONS: {
    MOVIMENTO: require('../assets/Som_Movimento.wav'),
    CAPTURA: require('../assets/Som_Captura.wav'),
    DAMA: require('../assets/Som_Dama.wav'),
    VITORIA: require('../assets/Som_Vitoria.wav'),
    MUSICA_FUNDO: require('../assets/Musica_Fundo.wav'),
  },
};

const estadoAudioInterno = {
  volumeGeral: 100,
  mudoGeral: false,
  volumeMusica: 75,
  mudoMusica: false,
  volumeEfeitos: 100,
  mudoEfeitos: false,
};

const ouvintesAudio = new Set();

export const obterConfigAudio = () => ({ ...estadoAudioInterno });

export const atualizarConfigAudio = (parcial) => {
  Object.assign(estadoAudioInterno, parcial);
  const copia = obterConfigAudio();
  ouvintesAudio.forEach((fn) => {
    try {
      fn(copia);
    } catch (e) {}
  });
  return copia;
};

export const inscreverConfigAudio = (fn) => {
  ouvintesAudio.add(fn);
  return () => {
    ouvintesAudio.delete(fn);
  };
};

export const calcularMultiplicadorMusica = (cfg = estadoAudioInterno) => {
  if (cfg.mudoGeral || cfg.mudoMusica) return 0;
  return Math.max(0, Math.min(1, (cfg.volumeGeral / 100) * (cfg.volumeMusica / 100)));
};

export const calcularMultiplicadorEfeitos = (cfg = estadoAudioInterno) => {
  if (cfg.mudoGeral || cfg.mudoEfeitos) return 0;
  return Math.max(0, Math.min(1, (cfg.volumeGeral / 100) * (cfg.volumeEfeitos / 100)));
};

export default Configuracoes;
