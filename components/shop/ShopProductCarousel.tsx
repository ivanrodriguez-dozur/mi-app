import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ShopProduct } from '../../types/shop';
import { ShopProductCard } from './ShopProductCard';

type ShopProductCarouselProps = {
  products: ShopProduct[];
  isFavorite?: (id: string) => boolean;
  onPressProduct?: (product: ShopProduct) => void;
  onToggleFavorite?: (product: ShopProduct) => void;
  onAddToCart?: (product: ShopProduct) => void;
};

export const ShopProductCarousel: React.FC<ShopProductCarouselProps> = ({ products, isFavorite, onPressProduct, onToggleFavorite, onAddToCart }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {products.map((product) => (
        <ShopProductCard
          key={product.id}
          product={product}
          onPress={onPressProduct}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
          isFavorite={isFavorite?.(product.id)}
        />
      ))}
      <View style={{ width: 8 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 4, paddingRight: 16 },
});
