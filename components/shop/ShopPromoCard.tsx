import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type ShopPromoCardProps = {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  countdownLabel?: string;
  onPress?: () => void;
  colors?: [string, string];
};

export const ShopPromoCard: React.FC<ShopPromoCardProps> = ({
  title,
  subtitle,
  ctaLabel = 'Shop Now',
  countdownLabel,
  onPress,
  colors = ['#1B1B1F', '#2C2C34'],
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {countdownLabel && (
          <View style={styles.countdownChip}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.countdownText}>{countdownLabel}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onPress} style={styles.ctaButton}>
        <Text style={styles.ctaText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#DADAE2', fontSize: 14, marginBottom: 16 },
  countdownChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  countdownText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  ctaButton: { backgroundColor: '#7CF67C', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  ctaText: { fontWeight: '700', color: '#0B4210' },
});
