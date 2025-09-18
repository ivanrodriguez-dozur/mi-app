import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type ShopSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export const ShopSectionHeader: React.FC<ShopSectionHeaderProps> = ({ title, actionLabel = 'See All', onPressAction }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onPressAction && (
        <TouchableOpacity onPress={onPressAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  action: { fontSize: 14, fontWeight: '600', color: '#1B75FF' },
});
