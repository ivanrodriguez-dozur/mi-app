import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useShop } from '../../contexts/ShopContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ShopProduct } from '../../types/shop';

type ShopFavoritesModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectProduct?: (product: ShopProduct) => void;
};

export const ShopFavoritesModal: React.FC<ShopFavoritesModalProps> = ({ visible, onClose, onSelectProduct }) => {
  const { favorites, toggleFavorite, addToCart } = useShop();
  const { colors, fontScale } = useTheme();

  const handleOpenProduct = (product: ShopProduct) => {
    onSelectProduct?.(product);
    onClose();
  };

  const handleAddToCart = (product: ShopProduct) => {
    addToCart(product);
  };

  const handleRemoveFavorite = (product: ShopProduct) => {
    toggleFavorite(product);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="heart" size={24} color="#FF3366" />
              <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>Favoritos</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {favorites.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={40} color="#B0B0B0" />
                <Text style={[styles.emptyTitle, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>Aún no tienes favoritos</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>Toca el corazón en un producto para guardarlo aquí.</Text>
              </View>
            ) : (
              favorites.map((product) => (
                <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TouchableOpacity style={styles.productImageWrapper} onPress={() => handleOpenProduct(product)} activeOpacity={0.85}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                  </TouchableOpacity>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text, fontSize: 16 * fontScale }]} numberOfLines={1}>{product.name}</Text>
                    <Text style={[styles.productBrand, { color: colors.textSecondary, fontSize: 13 * fontScale }]} numberOfLines={1}>{product.brand}</Text>
                    <Text style={[styles.productPrice, { color: colors.text, fontSize: 15 * fontScale }]}>${product.price}</Text>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleAddToCart(product)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="cart" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Agregar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveFavorite(product)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF3366" />
                        <Text style={[styles.removeButtonText, { color: '#FF3366' }]}>Quitar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontWeight: '700' },
  closeButton: { padding: 4, borderRadius: 20 },
  scrollContent: { paddingVertical: 16, gap: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  emptyTitle: { fontWeight: '600' },
  emptySubtitle: { textAlign: 'center', paddingHorizontal: 16 },
  productCard: { flexDirection: 'row', borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 12, alignItems: 'center', gap: 16 },
  productImageWrapper: { width: 80, height: 80, borderRadius: 16, overflow: 'hidden' },
  productImage: { width: '100%', height: '100%' },
  productInfo: { flex: 1, gap: 6 },
  productName: { fontWeight: '600' },
  productBrand: {},
  productPrice: { fontWeight: '700' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3366', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  actionButtonText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  removeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,51,102,0.1)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  removeButtonText: { fontWeight: '600', marginLeft: 6 },
});
