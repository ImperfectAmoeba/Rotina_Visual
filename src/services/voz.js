// Fala as palavras e frases dos pictogramas (RF010).
import * as Speech from 'expo-speech';

export const falar = (texto) => {
  Speech.stop();
  Speech.speak(texto, { language: 'pt-BR' });
};
