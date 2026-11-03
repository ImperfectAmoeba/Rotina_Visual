import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import RotinaItem from '../../components/RotinaItem';
import Rodape from '../../components/Rodape';

export default function Home() {
  const { colors } = useTheme();
  
  // Dados mockados para visualização inicial
  const [rotinas, setRotinas] = useState([
    { id: '1', nome: 'Rotina em Casa' },
    { id: '2', nome: 'Rotina na Casa da Vó' },
  ]);
  
  const [rotinaSelecionada, setRotinaSelecionada] = useState(null);

  const handleExcluir = (id) => {
    Alert.alert(
      'Excluir Rotina',
      'Tem certeza que deseja excluir esta rotina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            setRotinas(rotinas.filter(r => r.id !== id));
            if (rotinaSelecionada === id) setRotinaSelecionada(null);
            Alert.alert('Sucesso', 'Rotina excluída!');
          }
        }
      ]
    );
  };

  const handleEditar = (id) => {
    // Navegação futura para a tela de edição
    Alert.alert('Editar', `Editar rotina ID: ${id} (Tela em construção)`);
  };

  const handleNovaRotina = () => {
    Alert.alert('Nova Rotina', 'Tela de criação em construção');
  };

  const handleVerRotina = () => {
    if (rotinaSelecionada) {
      Alert.alert('Ver Rotina', `Visualizando rotina ID: ${rotinaSelecionada}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho Customizado */}
      <View style={[styles.header, { backgroundColor: colors.secondary }]}>
        <TouchableOpacity style={styles.settingsButton}>
          <FontAwesome5 name="cog" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>ROTINA VISUAL</Text>
        <View style={{ width: 28 }} /> {/* Espaçador para centralizar o título */}
      </View>

      {/* Lista de Rotinas */}
      <FlatList
        data={rotinas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RotinaItem 
            nome={item.nome} 
            onEditar={() => handleEditar(item.id)}
            onExcluir={() => handleExcluir(item.id)}
          />
        )}
        contentContainerStyle={{ paddingVertical: 20 }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Nenhuma rotina criada ainda.
          </Text>
        }
      />

      {/* Rodapé Fixo */}
      <Rodape 
        onVerRotina={handleVerRotina}
        onNovaRotina={handleNovaRotina}
        onPictogramas={() => Alert.alert('Pictogramas', 'Tela em construção')}
        verRotinaDisabled={!rotinaSelecionada}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40, // Ajuste para SafeArea no Android
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    opacity: 0.6,
  },
});