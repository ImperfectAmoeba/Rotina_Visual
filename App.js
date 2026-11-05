import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Inicializacao from './src/components/Inicializacao';
import TimerVisual from './src/components/TimerVisual';
import { ConfiguracoesProvider } from './src/contexts/ConfiguracoesContext';
import { DataProvider, useDados } from './src/contexts/DataContext';
import { FeedbackProvider } from './src/contexts/FeedbackContext';
import { useTheme } from './src/contexts/ThemeContext';
import { TimerProvider } from './src/contexts/TimerContext';
import Navegacao from './src/navigation';

function Conteudo() {
  const tema = useTheme();
  return (
    <TimerProvider>
      <FeedbackProvider>
        <ConfiguracoesProvider>
          <StatusBar style={tema.escuro ? 'light' : 'dark'} />
          <Navegacao />
          <TimerVisual />
          <Inicializacao />
        </ConfiguracoesProvider>
      </FeedbackProvider>
    </TimerProvider>
  );
}

function Carregamento() {
  const { dados } = useDados();
  if (!dados) {
    return (
      <View style={estilos.carregando}>
        <ActivityIndicator size="large" accessibilityLabel="Carregando" />
      </View>
    );
  }
  return <Conteudo />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={estilos.raiz}>
      <SafeAreaProvider>
        <DataProvider>
          <Carregamento />
        </DataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  carregando: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
