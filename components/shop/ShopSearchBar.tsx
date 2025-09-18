import React, { useMemo, useRef } from 'react';
import { View, TextInput, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ShopProduct } from '../../types/shop';

type ShopSearchBarProps = {
  query: string;
  onChangeQuery: (value: string) => void;
  suggestions: ShopProduct[];
  onSelectSuggestion: (product: ShopProduct) => void;
  inputRef?: React.RefObject<TextInput>;
};

export const ShopSearchBar: React.FC<ShopSearchBarProps> = ({
  query,
  onChangeQuery,
  suggestions,
  onSelectSuggestion,
  inputRef,
}) => {
  const fallbackRef = useRef<TextInput>(null);
  const textInputRef = inputRef ?? fallbackRef;

  const showSuggestions = useMemo(() => query.trim().length > 0 && suggestions.length > 0, [query, suggestions]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={18} color="#777" style={{ marginRight: 10 }} />
        <TextInput
          ref={textInputRef}
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search products"
          placeholderTextColor="#999"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      {showSuggestions && (
        <View style={styles.suggestionsCard}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionRow} onPress={() => onSelectSuggestion(item)}>
                <Text style={styles.suggestionName}>{item.name}</Text>
                <Text style={styles.suggestionPrice}>${item.price}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 16, color: '#111' },
  suggestionsCard: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  suggestionRow: { paddingHorizontal: 16, paddingVertical: 10 },
  suggestionName: { fontSize: 15, fontWeight: '600', color: '#111' },
  suggestionPrice: { fontSize: 13, color: '#777', marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0', marginHorizontal: 16 },
});
