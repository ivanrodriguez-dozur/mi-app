import React, { useEffect, useMemo, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useBottomNav } from '../../contexts/BottomNavContext';
import { useShop } from '../../contexts/ShopContext';
import { SHOP_PRODUCTS } from '../../data/shopProducts';
import { ShopProduct } from '../../types/shop';

const QUANTITY_MIN = 1;
const QUANTITY_MAX = 10;
const BC_EXCHANGE_RATE = 1; // 1 USD = 1 BoomCoin por defecto

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ productId: string }>();
  const { setSelected } = useBottomNav();
  const { toggleFavorite, isFavorite, addToCart, feedback, dismissFeedback } = useShop();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    setSelected('shop');
  }, [setSelected]);

  const product = useMemo<ShopProduct | undefined>(() => {
    return SHOP_PRODUCTS.find((item) => item.id === params.productId);
  }, [params.productId]);

  const sizeOptions = useMemo(() => {
    if (!product) return [];
    if (product.availableSizes && product.availableSizes.length > 0) {
      return product.availableSizes;
    }
    if (product.type === 'clothing') {
      return ['S', 'M', 'L', 'XL'];
    }
    if (product.type === 'shoe') {
      return ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'];
    }
    return [];
  }, [product]);

  useEffect(() => {
    setSelectedSize(sizeOptions.length > 0 ? sizeOptions[0] : null);
  }, [sizeOptions]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => {
      dismissFeedback();
    }, 2500);
    return () => clearTimeout(timeout);
  }, [feedback, dismissFeedback]);

  if (!product) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Producto no encontrado.</Text>
        <TouchableOpacity style={styles.fallbackButton} onPress={() => router.back()}>
          <Text style={styles.fallbackButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const reviewsLabel = product.reviews ? `${(product.reviews / 1000).toFixed(1)}k Reviews` : 'Reviews';
  const boomcoinsPrice = Math.round(product.price * BC_EXCHANGE_RATE);
  const isFavoriteProduct = isFavorite(product.id);

  const feedbackConfig = useMemo(() => {
    if (!feedback) return null;
    switch (feedback.kind) {
      case 'favorite-added':
        return { icon: 'heart', backgroundColor: '#E91E63' };
      case 'favorite-removed':
        return { icon: 'heart-dislike', backgroundColor: '#9E9E9E' };
      case 'cart-updated':
        return { icon: 'cart', backgroundColor: '#3949AB' };
      case 'cart-added':
      default:
        return { icon: 'cart', backgroundColor: '#1E88E5' };
    }
  }, [feedback]);

  const decreaseQuantity = () => setQuantity((prev) => Math.max(QUANTITY_MIN, prev - 1));
  const increaseQuantity = () => setQuantity((prev) => Math.min(QUANTITY_MAX, prev + 1));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Detail</Text>
          <TouchableOpacity style={styles.headerIcon} onPress={() => toggleFavorite(product)}>
            <Ionicons
              name={isFavoriteProduct ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavoriteProduct ? '#FF3366' : '#111'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productHero}>
          <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="contain" />
          <View style={styles.priceChip}>
            <Text style={styles.priceText}>${product.price}</Text>
          </View>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.rowGap}>
            <Text style={styles.brandText}>{product.brand}</Text>
            <View style={styles.reviewsChip}>
              <Ionicons name="star" size={14} color="#111" />
              <Text style={styles.reviewsText}>{reviewsLabel}</Text>
            </View>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.mainPrice}>${product.price}</Text>
            <Text style={styles.bcPrice}>{boomcoinsPrice} BC</Text>
          </View>
          {sizeOptions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Select Size</Text>
              <View style={styles.sizesRow}>
                {sizeOptions.map((size) => {
                  const isActive = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[styles.sizeChip, isActive && styles.sizeChipActive]}
                      onPress={() => setSelectedSize(size)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.sizeChipLabel, isActive && styles.sizeChipLabelActive]}>{size}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description ?? 'No description available.'}</Text>
        </View>
      </ScrollView>
      {feedback && feedbackConfig && (
        <View
          style={[
            styles.feedbackToast,
            {
              bottom: insets.bottom + 120,
              backgroundColor: feedbackConfig.backgroundColor,
            },
          ]}
        >
          <Ionicons name={feedbackConfig.icon as any} size={18} color="#fff" />
          <Text style={styles.feedbackText}>{feedback.message}</Text>
        </View>
      )}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity style={styles.qtyButton} onPress={decreaseQuantity}>
            <Ionicons name="remove" size={18} color="#111" />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyButton} onPress={increaseQuantity}>
            <Ionicons name="add" size={18} color="#111" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addToCart}
          activeOpacity={0.85}
          onPress={() => addToCart(product, quantity)}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingHorizontal: 24 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 24 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F2F5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  productHero: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 6 },
  productImage: { width: '100%', height: 320 },
  priceChip: { position: 'absolute', left: 16, bottom: 16, backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  priceText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  productInfo: { marginTop: 24 },
  productName: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  mainPrice: { fontSize: 20, fontWeight: '700', color: '#111' },
  bcPrice: { fontSize: 16, fontWeight: '600', color: '#3DAB4F', backgroundColor: '#E8FBEA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  rowGap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  brandText: { color: '#5B5B5B', fontSize: 14 },
  reviewsChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F5F5F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  reviewsText: { fontSize: 13, color: '#111', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  sizeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, backgroundColor: '#F4F5F7' },
  sizeChipActive: { backgroundColor: '#111' },
  sizeChipLabel: { fontWeight: '600', color: '#444' },
  sizeChipLabelActive: { color: '#fff' },
  description: { color: '#555', lineHeight: 20 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.95)', gap: 16 },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 24, paddingHorizontal: 12, paddingVertical: 10, gap: 16 },
  qtyButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  qtyValue: { color: '#fff', fontWeight: '700', fontSize: 16 },
  addToCart: { flex: 1, backgroundColor: '#8BF965', borderRadius: 28, paddingVertical: 16, alignItems: 'center' },
  addToCartText: { color: '#0B4210', fontWeight: '700', fontSize: 16 },
  feedbackToast: { position: 'absolute', left: 24, right: 24, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  feedbackText: { color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 12, flexShrink: 1 },
  fallbackContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  fallbackText: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#111' },
  fallbackButton: { backgroundColor: '#111', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  fallbackButtonText: { color: '#fff', fontWeight: '600' },
});
