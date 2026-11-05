import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useMemo } from 'react';
import { useDados } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import Categoria from '../pages/Categoria';
import Home from '../pages/Home';
import Pictogramas from '../pages/Pictogramas';
import Rotina from '../pages/Rotina';
import RotinaForm from '../pages/RotinaForm';
import Visualizacao from '../pages/Visualizacao';

const Stack = createStackNavigator();

export default function Navegacao() {
  const { dados } = useDados();
  const tema = useTheme();
  const edicao = dados.modo === 'edicao';

  const temaNavegacao = useMemo(() => {
    const base = tema.escuro ? DarkTheme : DefaultTheme;
    return { ...base, colors: { ...base.colors, background: tema.fundo.fundo } };
  }, [tema]);

  return (
    <NavigationContainer theme={temaNavegacao}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {/* Trocar o modo recria a pilha: o dependente não consegue "voltar" para a edição (RF008). */}
        <Stack.Group navigationKey={dados.modo}>
          {edicao ? (
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Rotina" component={Rotina} />
              <Stack.Screen name="RotinaForm" component={RotinaForm} />
            </>
          ) : (
            <Stack.Screen name="Visualizacao" component={Visualizacao} />
          )}
          <Stack.Screen name="Pictogramas" component={Pictogramas} />
          <Stack.Screen name="Categoria" component={Categoria} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
