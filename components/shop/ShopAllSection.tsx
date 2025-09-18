import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ShopProduct } from '../../types/shop';
import { ShopProductCard } from './ShopProductCard';

type ShopAllSectionProps = {
  products: ShopProduct[];
  isFavorite?: (id: string) => boolean;
  onPressProduct?: (product: ShopProduct) => void;
  onToggleFavorite?: (product: ShopProduct) => void;
  onAddToCart?: (product: ShopProduct) => void;
};

export const ShopAllSection: React.FC<ShopAllSectionProps> = ({ products, isFavorite, onPressProduct, onToggleFavorite, onAddToCart }) => {
  const firstTwo = products.slice(0, 2);
  const hero = products.length > 2 ? products[2] : undefined;
  const rest = products.slice(3);

  return (
    <View style={styles.section}>
      <View style={styles.topRow}>
        {firstTwo.map((product) => (
          <ShopProductCard
            key={product.id}
            product={product}
            onPress={onPressProduct}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
            isFavorite={isFavorite?.(product.id)}
            style={styles.topCard}
          />
        ))}
      </View>
      {hero && (
        <TouchableOpacity
          style={styles.heroCard}
          activeOpacity={0.9}
          onPress={() => onPressProduct?.(hero)}
        >
          <Image source={{ uri: hero.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <View style={styles.heroPrice}>
              <Text style={styles.heroPriceText}>${hero.price}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{hero.name}</Text>
              <Text style={styles.heroBrand}>{hero.brand}</Text>
            </View>
            <TouchableOpacity
              style={styles.heroFavorite}
              onPress={(event) => {
                event.stopPropagation();
                onToggleFavorite?.(hero);
              }}
            >
              <Ionicons
                name={isFavorite?.(hero.id) ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite?.(hero.id) ? '#FF3366' : '#111'}
              />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroAddToCart}
                activeOpacity={0.85}
                onPress={(event) => {
                  event.stopPropagation();
                  onAddToCart?.(hero);
                }}
              >
                <Ionicons name="cart" size={18} color="#fff" />
                <Text style={styles.heroAddToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
      {rest.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rectScroll}>
            {rest.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.rectCard}
                activeOpacity={0.9}
                onPress={() => onPressProduct?.(product)}
              >
                <Image source={{ uri: product.image }} style={styles.rectImage} resizeMode="cover" />
                <View style={styles.rectInfo}>
                  <View>
                    <Text style={styles.rectPrice}>${product.price}</Text>
                    <Text style={styles.rectName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.rectBrand}>{product.brand}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.rectAddToCart}
                    activeOpacity={0.85}
                    onPress={(event) => {
                      event.stopPropagation();
                      onAddToCart?.(product);
                    }}
                  >
                    <Ionicons name="cart" size={16} color="#fff" />
                    <Text style={styles.rectAddToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.rectFavorite}
                  onPress={(event) => {
                    event.stopPropagation();
                    onToggleFavorite?.(product);
                  }}
                >
                  <Ionicons
                    name={isFavorite?.(product.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isFavorite?.(product.id) ? '#FF3366' : '#111'}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            <View style={{ width: 12 }} />
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: 24 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  topCard: { width: '48%' },
  heroCard: { marginTop: 12, borderRadius: 24, overflow: 'hidden', position: 'relative', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 8 },
  heroImage: { width: '100%', height: 260 },
  heroOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, padding: 20, justifyContent: 'space-between' },
  heroPrice: { alignSelf: 'flex-start', backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  heroPriceText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  heroInfo: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '80%' },
  heroName: { fontSize: 20, fontWeight: '700', color: '#111' },
  heroBrand: { fontSize: 13, color: '#555', marginTop: 4 },
  heroFavorite: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 18, padding: 8 },
  heroActions: { marginTop: 16 },
  heroAddToCart: { backgroundColor: '#FF3366', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  heroAddToCartText: { color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 8 },
  rectScroll: { paddingVertical: 4 },
  rectCard: { width: 220, marginRight: 16, borderRadius: 20, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 5 },
  rectImage: { width: '100%', height: 140 },
  rectInfo: { padding: 14, gap: 12 },
  rectPrice: { fontWeight: '700', color: '#111' },
  rectName: { fontWeight: '600', color: '#111' },
  rectBrand: { fontSize: 12, color: '#777' },
  rectAddToCart: { backgroundColor: '#FF3366', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  rectAddToCartText: { color: '#fff', fontWeight: '600', fontSize: 13, marginLeft: 6 },
  rectFavorite: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 6 },
});
