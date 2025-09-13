import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

interface StatisticsModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal de estadísticas detalladas con gráficos
 * Para editar: Modifica los datos en 'generateMockData'
 * Para personalizar: Cambia los colores y estilos en 'chartConfig'
 * Para agregar métricas: Añade nuevos objetos al array 'statistics'
 */
export const StatisticsModal: React.FC<StatisticsModalProps> = ({ visible, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Datos simulados para los gráficos
  const generateMockData = (metric: string) => {
    const periods = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const days = periods[selectedPeriod];
    const data = [];
    
    for (let i = 0; i < Math.min(days, 12); i++) {
      // Genera datos aleatorios basados en el tipo de métrica
      let value;
      switch (metric) {
        case 'plays':
          value = Math.floor(Math.random() * 1000) + 500;
          break;
        case 'followers':
          value = Math.floor(Math.random() * 100) + 50;
          break;
        case 'likes':
          value = Math.floor(Math.random() * 200) + 100;
          break;
        case 'comments':
          value = Math.floor(Math.random() * 50) + 10;
          break;
        case 'shares':
          value = Math.floor(Math.random() * 30) + 5;
          break;
        default:
          value = Math.floor(Math.random() * 100);
      }
      data.push(value);
    }
    
    return data;
  };

  const statistics = [
    {
      id: 'plays',
      title: 'Reproducciones',
      value: '92.6K',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: 'play-circle' as const,
      color: '#4F46E5',
    },
    {
      id: 'followers',
      title: 'Seguidores',
      value: '9.3K',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: 'people' as const,
      color: '#10B981',
    },
    {
      id: 'likes',
      title: 'Me Gusta',
      value: '5.6K',
      change: '+15.7%',
      changeType: 'positive' as const,
      icon: 'heart' as const,
      color: '#EF4444',
    },
    {
      id: 'comments',
      title: 'Comentarios',
      value: '1.2K',
      change: '+6.3%',
      changeType: 'positive' as const,
      icon: 'chatbubble' as const,
      color: '#F59E0B',
    },
    {
      id: 'shares',
      title: 'Compartidos',
      value: '789',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: 'share' as const,
      color: '#8B5CF6',
    },
  ];

  const periods = [
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: '90d', label: '3 meses' },
    { key: '1y', label: '1 año' },
  ];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.6})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ffffff',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
  };

  const renderChart = (stat: typeof statistics[0]) => {
    const data = generateMockData(stat.id);
    const labels = data.map((_, index) => {
      if (selectedPeriod === '7d') return `${index + 1}d`;
      if (selectedPeriod === '30d') return `${(index + 1) * 2}d`;
      if (selectedPeriod === '90d') return `S${index + 1}`;
      return `M${index + 1}`;
    });

    const customChartConfig = {
      ...chartConfig,
      color: (opacity = 1) => stat.color.replace(')', `, ${opacity})`).replace('#', 'rgba(').replace(/^rgba\(([^)]+)\)/, (match, p1) => {
        const rgb = p1.split(',').slice(0, 3).join(',');
        return `rgba(${rgb.replace(/[^\d,]/g, '')}, ${opacity})`;
      }),
    };

    // Convertir color hex a RGB para mejor compatibilidad
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb = hexToRgb(stat.color);
    const rgbaColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` : stat.color;

    const finalChartConfig = {
      ...chartConfig,
      color: (opacity = 1) => rgbaColor.replace(', 1)', `, ${opacity})`),
    };

    return (
      <View style={styles.chartContainer}>
        <View style={styles.statHeader}>
          <View style={styles.statInfo}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon} size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          </View>
          <View style={styles.statChange}>
            <Text style={[
              styles.changeText,
              { color: stat.changeType === 'positive' ? '#10B981' : '#EF4444' }
            ]}>
              {stat.change}
            </Text>
          </View>
        </View>
        
        <LineChart
          data={{
            labels,
            datasets: [{
              data,
              color: (opacity = 1) => rgbaColor.replace(', 1)', `, ${opacity})`),
              strokeWidth: 3,
            }],
          }}
          width={screenWidth - 60}
          height={180}
          chartConfig={finalChartConfig}
          bezier
          style={styles.chart}
          withDots={true}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={false}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#444" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estadísticas</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Charts */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {statistics.map((stat) => (
            <View key={stat.id}>
              {renderChart(stat)}
            </View>
          ))}
          
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen del Período</Text>
            <Text style={styles.summaryText}>
              Durante los últimos {periods.find(p => p.key === selectedPeriod)?.label.toLowerCase()}, 
              tu contenido ha tenido un crecimiento consistente en la mayoría de métricas.
            </Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>+18.2%</Text>
                <Text style={styles.summaryStatLabel}>Crecimiento promedio</Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>4.2K</Text>
                <Text style={styles.summaryStatLabel}>Nuevos seguidores</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  periodButtonActive: {
    backgroundColor: '#4F46E5',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statChange: {
    alignItems: 'flex-end',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chart: {
    borderRadius: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});