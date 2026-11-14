import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { PECAS, Configuracoes, AssetsJogo } from '../models/Configuracoes';

export function obterSpritePeca(tipoPeca) {
  switch (tipoPeca) {
    case PECAS.DAMA_PRETA:
      return AssetsJogo.PECAS.DAMA_PRETA;
    case PECAS.DAMA_BRANCA:
      return AssetsJogo.PECAS.DAMA_BRANCA;
    case PECAS.BRANCA:
      return AssetsJogo.PECAS.BRANCA;
    case PECAS.PRETA:
    default:
      return AssetsJogo.PECAS.PRETA;
  }
}

export default function PecaDama({
  tipo = PECAS.PRETA,
  tamanho = 40,
  selecionada = false,
  capturaObrigatoria = false,
  desabilitada = false,
  templatePecasId = 'CLASSICO',
}) {
  if (!tipo || tipo === PECAS.VAZIO) return null;

  const sprite = obterSpritePeca(tipo);
  const templatePeca =
    Configuracoes.TEMPLATES_PECAS[templatePecasId] ||
    Configuracoes.TEMPLATES_PECAS.CLASSICO;

  const ehPreta = tipo === PECAS.PRETA || tipo === PECAS.DAMA_PRETA;
  const corAnelEspecial =
    templatePecasId === 'OURO_NEON'
      ? ehPreta
        ? templatePeca.corAnelPreta
        : templatePeca.corAnelBranca
      : null;

  return (
    <View
      style={[
        styles.container,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
        },
        corAnelEspecial && {
          borderWidth: 2,
          borderColor: corAnelEspecial,
        },
        capturaObrigatoria && {
          borderWidth: 2.5,
          borderColor: templatePeca.corGlowCapturaObrigatoria,
          backgroundColor: 'rgba(239, 71, 111, 0.22)',
        },
        selecionada && {
          transform: [{ scale: 1.12 }],
          borderWidth: 2.5,
          borderColor: templatePeca.corGlowSelecionada,
          backgroundColor: 'rgba(255, 209, 102, 0.28)',
        },
        desabilitada && styles.desabilitada,
      ]}
      pointerEvents="none"
    >
      <Image source={sprite} style={styles.imagem} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagem: {
    width: '94%',
    height: '94%',
  },
  desabilitada: {
    opacity: 0.88,
  },
});
