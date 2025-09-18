import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShopCategoryTabs } from '../../components/shop/ShopCategoryTabs';
import { ShopHeader } from '../../components/shop/ShopHeader';
import { ShopProductCarousel } from '../../components/shop/ShopProductCarousel';
import { ShopPromoCard } from '../../components/shop/ShopPromoCard';
import { ShopSearchBar } from '../../components/shop/ShopSearchBar';
import { ShopSectionHeader } from '../../components/shop/ShopSectionHeader';
import { ShopAllSection } from '../../components/shop/ShopAllSection';
import { ShopFavoritesModal } from '../../components/shop/ShopFavoritesModal';
import { useAuth } from '../../contexts/AuthContext';
import { useBottomNav } from '../../contexts/BottomNavContext';
import { useShop } from '../../contexts/ShopContext';
import { useProfile } from '../../hooks/useProfile';
import { ShopCategory, ShopProduct } from '../../types/shop';
import { SHOP_PRODUCTS } from '../../data/shopProducts';

const CATEGORIES: ShopCategory[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'jacket', label: 'Jacket' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'pants', label: 'Pants' },
  { id: 'accessories', label: 'Accessories' },
];

const ALL_PRODUCTS: ShopProduct[] = SHOP_PRODUCTS;

const PROMO_PALETTE: [string, string][] = [
  ['#1B1B1F', '#2C2C34'],
  ['#2E1065', '#7C3AED'],
  ['#064E3B', '#34D399'],
];

const INITIAL_COUNTDOWN_SECONDS = 10 * 3600 + 5 * 60 + 3;

export default function ShopScreen() {
  const { setSelected } = useBottomNav();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { user } = useAuth();
  const router = useRouter();

  const { toggleFavorite, isFavorite, addToCart, favoriteCount, feedback, dismissFeedback } = useShop();

  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [promoColorIndex, setPromoColorIndex] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(INITIAL_COUNTDOWN_SECONDS);

  useFocusEffect(
    useCallback(() => {
      setSelected('shop');
    }, [setSelected])
  );

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setPromoColorIndex((prev) => (prev + 1) % PROMO_PALETTE.length);
    }, 40000);
    return () => clearInterval(colorInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => {
      dismissFeedback();
    }, 2500);
    return () => clearTimeout(timeout);
  }, [feedback, dismissFeedback]);

  const formattedCountdown = useMemo(() => {
    const hours = Math.floor(countdownSeconds / 3600);
    const minutes = Math.floor((countdownSeconds % 3600) / 60);
    const seconds = countdownSeconds % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }, [countdownSeconds]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'popular') {
      return ALL_PRODUCTS;
    }
    switch (selectedCategory) {
      case 'jacket':
        return ALL_PRODUCTS.filter((product) => product.name.toLowerCase().includes('jacket'));
      case 'shoes':
        return ALL_PRODUCTS.filter((product) => product.type === 'shoe');
      case 'pants':
        return ALL_PRODUCTS.filter((product) => product.name.toLowerCase().includes('pant') || product.name.toLowerCase().includes('jogger'));
      case 'accessories':
        return ALL_PRODUCTS.filter((product) => product.type === 'gear' || product.type === 'accessory');
      default:
        return ALL_PRODUCTS;
    }
  }, [selectedCategory]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const normalized = searchQuery.trim().toLowerCase();
    return ALL_PRODUCTS.filter((product) =>
      product.name.toLowerCase().includes(normalized) || product.brand.toLowerCase().includes(normalized)
    ).slice(0, 6);
  }, [searchQuery]);

  const handleToggleFavorite = useCallback((product: ShopProduct) => {
    toggleFavorite(product);
  }, [toggleFavorite]);

  const handleAddToCart = useCallback((product: ShopProduct) => {
    addToCart(product);
  }, [addToCart]);

  const handleOpenProduct = useCallback((product: ShopProduct) => {
    router.push({ pathname: '/product/[productId]', params: { productId: product.id } });
  }, [router]);

  const handleSelectSuggestion = useCallback((product: ShopProduct) => {
    setSearchQuery('');
    handleOpenProduct(product);
  }, [handleOpenProduct]);

  const userName = profile?.nombre ?? user?.user_metadata?.full_name ?? 'Jobby';
  const avatarUrl = profile?.foto_perfil ?? user?.user_metadata?.avatar_url ?? 'https://placehold.co/60x60?text=U';

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

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <ShopHeader
          userName={userName}
          avatarUrl={avatarUrl}
          favoritesCount={favoriteCount}
          onFavoritesPress={() => setShowFavoritesModal(true)}
        />
        <ShopSearchBar
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
        />
        <ShopPromoCard
          title="Get attractive discounts of the year here"
          subtitle="Limited time offers on streetwear essentials."
          countdownLabel={formattedCountdown}
          colors={PROMO_PALETTE[promoColorIndex]}
        />
        <ShopCategoryTabs
          categories={CATEGORIES}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <ShopSectionHeader title="Popular Product" />
        <ShopProductCarousel
          products={filteredProducts}
          isFavorite={isFavorite}
          onPressProduct={handleOpenProduct}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
        />
        <View style={{ height: 24 }} />
        <ShopSectionHeader title="All" />
        <ShopAllSection
          products={ALL_PRODUCTS}
          isFavorite={isFavorite}
          onPressProduct={handleOpenProduct}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
        />
        <View style={{ height: 32 }} />
      </ScrollView>
      {feedback && feedbackConfig && (
        <View
          style={[
            styles.feedbackToast,
            {
              bottom: insets.bottom + 110,
              backgroundColor: feedbackConfig.backgroundColor,
            },
          ]}
        >
          <Ionicons name={feedbackConfig.icon as any} size={18} color="#fff" />
          <Text style={styles.feedbackText}>{feedback.message}</Text>
        </View>
      )}
  {/* BottomNavBar rendered globally in layout */}
      <ShopFavoritesModal
        visible={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={handleOpenProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F7F9' },
  content: { paddingHorizontal: 24 },
  feedbackToast: {
    position: 'absolute',
    left: 24,
    right: 24,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  feedbackText: { color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 12, flexShrink: 1 },
});
