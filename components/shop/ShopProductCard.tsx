import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ShopProduct } from '../../types/shop';

type ShopProductCardProps = {
  product: ShopProduct;
  onPress?: (product: ShopProduct) => void;
  onToggleFavorite?: (product: ShopProduct) => void;
  onAddToCart?: (product: ShopProduct) => void;
  isFavorite?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const ShopProductCard: React.FC<ShopProductCardProps> = ({ product, onPress, onToggleFavorite, onAddToCart, isFavorite, style }) => {
  const handleFavoritePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFavorite?.(product);
  };

  const handleAddToCart = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.9}
      onPress={() => onPress?.(product)}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#FF3366' : '#111'}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
      <Text style={styles.brand}>{product.brand}</Text>
      <TouchableOpacity
        style={styles.addToCartButton}
        activeOpacity={0.9}
        onPress={handleAddToCart}
      >
        <Ionicons name="cart" size={16} color="#fff" />
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginRight: 16,
  },
  imageWrapper: { position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  image: { width: '100%', height: 140 },
  favoriteButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 6 },
  price: { fontWeight: '700', fontSize: 16, color: '#111' },
  name: { fontSize: 14, fontWeight: '600', color: '#111', marginTop: 4 },
  brand: { fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  addToCartButton: {
    marginTop: 12,
    backgroundColor: '#FF3366',
    borderRadius: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  addToCartText: { color: '#fff', fontWeight: '600', fontSize: 12, marginLeft: 6 },
});
