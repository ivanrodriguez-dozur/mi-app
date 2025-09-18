import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Pantalla de estadísticas detalladas del usuario
 * Para editar: Modifica los datos mostrados y agrega nuevas métricas
 * Para personalizar: Cambia los estilos en el objeto 'styles'
 */
export const StatisticsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Estadísticas Detalladas</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>92.6K</Text>
          <Text style={styles.statLabel}>Total de Plays</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>9.3K</Text>
          <Text style={styles.statLabel}>Seguidores</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>5.6K</Text>
          <Text style={styles.statLabel}>Likes Recibidos</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>247</Text>
          <Text style={styles.statLabel}>Videos Subidos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rendimiento Mensual</Text>
        {/* Aquí puedes agregar gráficos o más estadísticas */}
        <Text style={styles.placeholder}>Gráfico de crecimiento</Text>
        <Text style={styles.placeholder}>Videos más populares</Text>
        <Text style={styles.placeholder}>Engagement rate</Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#444',
  },
  statLabel: {
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