import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

/**
 * Pantalla de configuración de modo oscuro
 * Para editar: Modifica el estado del switch y las preferencias de tema
 * Para personalizar: Agrega más opciones de personalización visual
 */
export const DarkModeScreen: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    // Aquí puedes implementar la lógica para cambiar el tema de la app
    console.log('Modo oscuro:', !isDarkMode ? 'Activado' : 'Desactivado');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personalización</Text>
      
      <View style={styles.option}>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Modo Oscuro</Text>
          <Text style={styles.optionDescription}>
            Cambia la apariencia de la aplicación a un tema oscuro
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#ddd', true: '#CCFF00' }}
          thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Otras Opciones de Tema</Text>
        {/* Aquí puedes agregar más opciones de personalización */}
        <Text style={styles.placeholder}>Tamaño de fuente</Text>
        <Text style={styles.placeholder}>Contraste alto</Text>
        <Text style={styles.placeholder}>Reducir animaciones</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
  },
  optionText: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});