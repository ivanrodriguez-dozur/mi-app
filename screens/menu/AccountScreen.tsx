import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Pantalla de configuración de cuenta del usuario
 * Para editar: Modifica las secciones dentro del ScrollView
 * Para agregar opciones: Añade nuevos componentes de configuración
 */
export const AccountScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configuración de Cuenta</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        {/* Aquí puedes agregar campos editables para nombre, email, etc. */}
        <Text style={styles.placeholder}>Editar nombre de usuario</Text>
        <Text style={styles.placeholder}>Cambiar email</Text>
        <Text style={styles.placeholder}>Actualizar teléfono</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidad</Text>
        {/* Aquí puedes agregar configuraciones de privacidad */}
        <Text style={styles.placeholder}>Cuenta privada</Text>
        <Text style={styles.placeholder}>Visibilidad del perfil</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        {/* Aquí puedes agregar opciones de seguridad */}
        <Text style={styles.placeholder}>Cambiar contraseña</Text>
        <Text style={styles.placeholder}>Autenticación de dos factores</Text>
      </View>
    </ScrollView>
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