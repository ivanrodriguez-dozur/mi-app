import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

/**
 * Pantalla de términos y condiciones de la aplicación
 * Para editar: Modifica el contenido de los términos en las secciones
 * Para actualizar: Cambia la fecha de última actualización
 */
export const TermsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Términos y Condiciones</Text>
      <Text style={styles.lastUpdated}>Última actualización: 12 de septiembre, 2025</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Aceptación de los Términos</Text>
        <Text style={styles.content}>
          Al acceder y usar esta aplicación, aceptas estar sujeto a estos términos y condiciones de uso.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Uso de la Aplicación</Text>
        <Text style={styles.content}>
          Esta aplicación está destinada para el entretenimiento y compartir contenido relacionado con el fútsal.
          Los usuarios deben usar la aplicación de manera responsable y respetuosa.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Contenido del Usuario</Text>
        <Text style={styles.content}>
          Los usuarios son responsables del contenido que suben. No se permite contenido ofensivo,
          ilegal o que viole los derechos de terceros.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Privacidad</Text>
        <Text style={styles.content}>
          Respetamos tu privacidad. La información personal se maneja según nuestra política de privacidad.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Modificaciones</Text>
        <Text style={styles.content}>
          Nos reservamos el derecho de modificar estos términos en cualquier momento.
          Los cambios serán notificados a los usuarios.
        </Text>
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
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});