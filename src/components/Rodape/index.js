import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function Rodape({ onVerRotina, onNovaRotina, onPictogramas, verRotinaDisabled }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondary }]}>
      {/* Botão Ver Rotina */}
      <TouchableOpacity 
        style={[styles.button, verRotinaDisabled && styles.disabledButton]}
        onPress={onVerRotina}
        disabled={verRotinaDisabled}
      >
        <FontAwesome5 name="user-friends" size={24} color={colors.text} />
        <Text style={[styles.buttonText, { color: colors.text }]}>VER ROTINA</Text>
      </TouchableOpacity>

      {/* Botão Nova Rotina (Central) */}
      <TouchableOpacity 
        style={[styles.centerButton, { backgroundColor: colors.primary }]}
        onPress={onNovaRotina}
      >
        <MaterialCommunityIcons name="calendar-plus" size={24} color={colors.textLight} />
      </TouchableOpacity>

      {/* Botão Pictogramas */}
      <TouchableOpacity 
        style={styles.button}
        onPress={onPictogramas}
      >
        <FontAwesome5 name="images" size={24} color={colors.text} />
        <Text style={[styles.buttonText, { color: colors.text }]}>PICTOGRAMAS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    height: 90,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
});