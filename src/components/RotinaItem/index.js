import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function RotinaItem({ nome, onEditar, onExcluir }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Botão da Rotina */}
      <TouchableOpacity 
        style={[styles.rotinaButton, { backgroundColor: colors.primary }]}
        onPress={() => { /* Selecionar rotina - implementar depois */ }}
      >
        <Text style={[styles.rotinaText, { color: colors.textLight }]} numberOfLines={1}>
          {nome.toUpperCase()}
        </Text>
      </TouchableOpacity>

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={onEditar}
        >
          <FontAwesome5 name="pencil-alt" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.danger }]}
          onPress={onExcluir}
        >
          <FontAwesome5 name="trash" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 15,
  },
  rotinaButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginRight: 10,
  },
  rotinaText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});