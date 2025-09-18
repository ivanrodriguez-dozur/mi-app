import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ShopCategory } from '../../types/shop';

type ShopCategoryTabsProps = {
  categories: ShopCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export const ShopCategoryTabs: React.FC<ShopCategoryTabsProps> = ({ categories, selectedId, onSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categories.map((category) => {
        const isActive = category.id === selectedId;
        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={[styles.chip, isActive && styles.chipActive]}
            activeOpacity={0.85}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{category.label}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={{ width: 12 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 16, paddingHorizontal: 4 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18, backgroundColor: '#F4F5F7', marginHorizontal: 6 },
  chipActive: { backgroundColor: '#111' },
  label: { color: '#444', fontWeight: '600' },
  labelActive: { color: '#fff' },
});
