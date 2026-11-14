import { PECAS, Configuracoes } from '../models/Configuracoes';

const { VAZIO, PRETA, BRANCA, DAMA_PRETA, DAMA_BRANCA } = PECAS;

// Direcoes diagonais: superior-esquerda, superior-direita, inferior-esquerda, inferior-direita
const DIRECOES = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

// ===================================================
//  INICIALIZACAO E UTILITARIOS DO TABULEIRO (8x8)
// ===================================================

export function criarTabuleiroInicial() {
  const b = Array.from({ length: 8 }, () => Array(8).fill(VAZIO));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) b[r][c] = BRANCA;
        else if (r > 4) b[r][c] = PRETA;
      }
    }
  }
  return b;
}

export function clonarTabuleiro(b) {
  return b.map((linha) => [...linha]);
}

export function dentroDoTabuleiro(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function ehPecaDoJogador(peca, jogador) {
  if (jogador === PRETA) return peca === PRETA || peca === DAMA_PRETA;
  return peca === BRANCA || peca === DAMA_BRANCA;
}

export function ehPecaOponente(peca, jogador) {
  if (peca === VAZIO) return false;
  if (jogador === PRETA) return peca === BRANCA || peca === DAMA_BRANCA;
  return peca === PRETA || peca === DAMA_PRETA;
}

export function ehDama(peca) {
  return peca === DAMA_PRETA || peca === DAMA_BRANCA;
}

export function corDaPeca(peca) {
  if (peca === PRETA || peca === DAMA_PRETA) return PRETA;
  if (peca === BRANCA || peca === DAMA_BRANCA) return BRANCA;
  return VAZIO;
}

export function obterOponente(jogador) {
  return jogador === PRETA ? BRANCA : PRETA;
}

// ===================================================
//  GERACAO DE MOVIMENTOS (REGRAS BRASILEIRAS COM ESCOLHA LIVRE DE CAPTURA)
//  - Damas voadoras (longo alcance nas diagonais)
//  - Captura obrigatoria para frente e para tras
//  - Se houver mais de uma opcao de captura, o jogador tem livre escolha!
// ===================================================

export function encontrarSequenciasDeCaptura(b, r, c, peca) {
  const dama = ehDama(peca);
  const jogador = corDaPeca(peca);
  const resultados = [];

  function dfs(row, col, caminho, capturadas, estadoTabuleiro) {
    let encontrouMais = false;

    for (const [dr, dc] of DIRECOES) {
      if (dama) {
        // Dama voadora: varre a diagonal procurando peca adversaria
        let dist = 1;
        while (true) {
          const mr = row + dr * dist;
          const mc = col + dc * dist;
          if (!dentroDoTabuleiro(mr, mc)) break;

          const pecaMeio = estadoTabuleiro[mr][mc];

          if (ehPecaDoJogador(pecaMeio, jogador)) break;

          if (ehPecaOponente(pecaMeio, jogador)) {
            const jaCapturada = capturadas.some((cp) => cp.r === mr && cp.c === mc);
            if (jaCapturada) break;

            let landDist = 1;
            while (true) {
              const lr = mr + dr * landDist;
              const lc = mc + dc * landDist;
              if (!dentroDoTabuleiro(lr, lc)) break;
              if (estadoTabuleiro[lr][lc] !== VAZIO) break;

              encontrouMais = true;

              const novasCapturadas = [...capturadas, { r: mr, c: mc }];
              const novoCaminho = [...caminho, { r: lr, c: lc }];

              const novoTabuleiro = clonarTabuleiro(estadoTabuleiro);
              novoTabuleiro[row][col] = VAZIO;
              novoTabuleiro[mr][mc] = VAZIO;
              novoTabuleiro[lr][lc] = peca;

              dfs(lr, lc, novoCaminho, novasCapturadas, novoTabuleiro);
              landDist++;
            }

            break;
          }

          dist++;
        }
      } else {
        // Pedra comum: captura pulando sobre oponente adjacente (frente ou tras)
        const mr = row + dr;
        const mc = col + dc;
        const lr = row + dr * 2;
        const lc = col + dc * 2;

        if (!dentroDoTabuleiro(lr, lc)) continue;
        if (!ehPecaOponente(estadoTabuleiro[mr][mc], jogador)) continue;
        if (capturadas.some((cp) => cp.r === mr && cp.c === mc)) continue;
        if (estadoTabuleiro[lr][lc] !== VAZIO) continue;

        encontrouMais = true;

        const novasCapturadas = [...capturadas, { r: mr, c: mc }];
        const novoCaminho = [...caminho, { r: lr, c: lc }];

        const novoTabuleiro = clonarTabuleiro(estadoTabuleiro);
        novoTabuleiro[row][col] = VAZIO;
        novoTabuleiro[mr][mc] = VAZIO;
        novoTabuleiro[lr][lc] = peca;

        dfs(lr, lc, novoCaminho, novasCapturadas, novoTabuleiro);
      }
    }

    if (!encontrouMais && capturadas.length > 0) {
      resultados.push({ path: caminho, captured: capturadas });
    }
  }

  dfs(r, c, [{ r, c }], [], clonarTabuleiro(b));
  return resultados;
}

export function obterMovimentosSimples(b, r, c, peca) {
  const dama = ehDama(peca);
  const jogador = corDaPeca(peca);
  const movimentos = [];

  for (const [dr, dc] of DIRECOES) {
    if (!dama) {
      // Pedras comuns andam apenas para frente
      const sentidoFrente = jogador === PRETA ? -1 : 1;
      if (dr !== sentidoFrente) continue;

      const nr = r + dr;
      const nc = c + dc;
      if (dentroDoTabuleiro(nr, nc) && b[nr][nc] === VAZIO) {
        movimentos.push({
          from: { r, c },
          to: { r: nr, c: nc },
          path: [{ r, c }, { r: nr, c: nc }],
          captured: [],
        });
      }
    } else {
      // Dama voadora desliza pelas diagonais livres
      let dist = 1;
      while (true) {
        const nr = r + dr * dist;
        const nc = c + dc * dist;
        if (!dentroDoTabuleiro(nr, nc) || b[nr][nc] !== VAZIO) break;
        movimentos.push({
          from: { r, c },
          to: { r: nr, c: nc },
          path: [{ r, c }, { r: nr, c: nc }],
          captured: [],
        });
        dist++;
      }
    }
  }

  return movimentos;
}

export function obterTodosMovimentosValidos(b, jogador) {
  const todasCapturas = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (!ehPecaDoJogador(b[r][c], jogador)) continue;

      const sequencias = encontrarSequenciasDeCaptura(b, r, c, b[r][c]);
      for (const seq of sequencias) {
        todasCapturas.push({
          from: seq.path[0],
          to: seq.path[seq.path.length - 1],
          path: seq.path,
          captured: seq.captured,
        });
      }
    }
  }

  // Mantem a obrigatoriedade de capturar, mas permite escolher qualquer captura disponivel!
  if (todasCapturas.length > 0) {
    return todasCapturas;
  }

  const movimentosRegulares = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (!ehPecaDoJogador(b[r][c], jogador)) continue;
      movimentosRegulares.push(...obterMovimentosSimples(b, r, c, b[r][c]));
    }
  }

  return movimentosRegulares;
}

export function obterMovimentosDaPeca(b, jogador, r, c) {
  const todos = obterTodosMovimentosValidos(b, jogador);
  return todos.filter((m) => m.from.r === r && m.from.c === c);
}

// ===================================================
//  EXECUCAO DE MOVIMENTO E PROMOCAO A DAMA
// ===================================================

export function executarMovimento(b, movimento) {
  const novoTabuleiro = clonarTabuleiro(b);
  const peca = novoTabuleiro[movimento.from.r][movimento.from.c];

  novoTabuleiro[movimento.from.r][movimento.from.c] = VAZIO;

  for (const cap of movimento.captured) {
    novoTabuleiro[cap.r][cap.c] = VAZIO;
  }

  let pecaFinal = peca;
  let promoveuDama = false;

  if (peca === PRETA && movimento.to.r === 0) {
    pecaFinal = DAMA_PRETA;
    promoveuDama = true;
  } else if (peca === BRANCA && movimento.to.r === 7) {
    pecaFinal = DAMA_BRANCA;
    promoveuDama = true;
  }

  novoTabuleiro[movimento.to.r][movimento.to.c] = pecaFinal;

  return {
    tabuleiro: novoTabuleiro,
    promoveuDama,
    pecasCapturadas: movimento.captured.length,
  };
}

// ===================================================
//  VERIFICACAO DE ESTADO E CONTAGEM
// ===================================================

export function verificarFimDeJogo(b, jogadorDaVez) {
  let temPecas = false;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (ehPecaDoJogador(b[r][c], jogadorDaVez)) {
        temPecas = true;
        break;
      }
    }
    if (temPecas) break;
  }

  if (!temPecas) return obterOponente(jogadorDaVez);

  const movimentos = obterTodosMovimentosValidos(b, jogadorDaVez);
  if (movimentos.length === 0) {
    return obterOponente(jogadorDaVez);
  }

  return null;
}

export function contarPecas(b, jogador) {
  let total = 0;
  let damas = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (ehPecaDoJogador(p, jogador)) {
        total++;
        if (ehDama(p)) damas++;
      }
    }
  }
  return { total, damas };
}

// ===================================================
//  INTELIGENCIA ARTIFICIAL - MINIMAX COM PODA ALFA-BETA
// ===================================================

export function avaliarTabuleiro(b, iaPlayer) {
  const humanoPlayer = obterOponente(iaPlayer);
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const peca = b[r][c];
      if (peca === VAZIO) continue;

      const dono = corDaPeca(peca);
      const dama = ehDama(peca);
      const mult = dono === iaPlayer ? 1 : -1;

      score += mult * (dama ? 7 : 3);

      const centerR = Math.abs(3.5 - r);
      const centerC = Math.abs(3.5 - c);
      score += mult * (4 - centerR - centerC) * 0.15;

      if (!dama) {
        const avanco = dono === PRETA ? 7 - r : r;
        score += mult * avanco * 0.3;
      }

      if (c === 0 || c === 7) {
        score += mult * 0.5;
      }

      if (dama) {
        const mobilidade = obterMovimentosSimples(b, r, c, peca).length;
        score += mult * mobilidade * 0.1;
      }
    }
  }

  const movsIA = obterTodosMovimentosValidos(b, iaPlayer).length;
  const movsHumano = obterTodosMovimentosValidos(b, humanoPlayer).length;
  score += (movsIA - movsHumano) * 0.2;

  if (movsHumano === 0) score += 1000;
  if (movsIA === 0) score -= 1000;

  return score;
}

export function minimax(b, depth, alpha, beta, maximizing, iaPlayer) {
  const jogador = maximizing ? iaPlayer : obterOponente(iaPlayer);
  const vencedor = verificarFimDeJogo(b, jogador);

  if (vencedor !== null) {
    return vencedor === iaPlayer ? 10000 - (10 - depth) : -10000 + (10 - depth);
  }

  if (depth === 0) {
    return avaliarTabuleiro(b, iaPlayer);
  }

  const movimentos = obterTodosMovimentosValidos(b, jogador);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of movimentos) {
      const { tabuleiro: novoB } = executarMovimento(b, move);
      const evalScore = minimax(novoB, depth - 1, alpha, beta, false, iaPlayer);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of movimentos) {
      const { tabuleiro: novoB } = executarMovimento(b, move);
      const evalScore = minimax(novoB, depth - 1, alpha, beta, true, iaPlayer);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function obterMovimentoIA(b, iaPlayer = BRANCA, dificuldade = 'medium') {
  const mapaProfundidade = {
    easy: Configuracoes.DIFICULDADES_IA.FACIL.profundidade,
    medium: Configuracoes.DIFICULDADES_IA.MEDIO.profundidade,
    hard: Configuracoes.DIFICULDADES_IA.DIFICIL.profundidade,
  };
  const depth = mapaProfundidade[dificuldade] || 4;

  const movimentos = obterTodosMovimentosValidos(b, iaPlayer);
  if (movimentos.length === 0) return null;
  if (movimentos.length === 1) return movimentos[0];

  if (dificuldade === 'easy' && Math.random() < 0.35) {
    return movimentos[Math.floor(Math.random() * movimentos.length)];
  }

  let melhorScore = -Infinity;
  let melhoresMovimentos = [];

  for (const move of movimentos) {
    const { tabuleiro: novoB } = executarMovimento(b, move);
    const score = minimax(novoB, depth - 1, -Infinity, Infinity, false, iaPlayer);

    if (score > melhorScore) {
      melhorScore = score;
      melhoresMovimentos = [move];
    } else if (score === melhorScore) {
      melhoresMovimentos.push(move);
    }
  }

  return melhoresMovimentos[Math.floor(Math.random() * melhoresMovimentos.length)];
}

export const MotorDamas = {
  criarTabuleiroInicial,
  clonarTabuleiro,
  dentroDoTabuleiro,
  ehPecaDoJogador,
  ehPecaOponente,
  ehDama,
  corDaPeca,
  obterOponente,
  encontrarSequenciasDeCaptura,
  obterMovimentosSimples,
  obterTodosMovimentosValidos,
  obterMovimentosDaPeca,
  executarMovimento,
  verificarFimDeJogo,
  contarPecas,
  obterMovimentoIA,
};

export default MotorDamas;
