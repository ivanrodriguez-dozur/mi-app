import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ShopProduct } from '../../types/shop';

type ShopProductModalProps = {
  visible: boolean;
  product?: ShopProduct | null;
  onClose: () => void;
};

export const ShopProductModal: React.FC<ShopProductModalProps> = ({ visible, product, onClose }) => {
  if (!product) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#111" />
          </TouchableOpacity>
          <Image source={{ uri: product.image }} style={styles.hero} resizeMode="cover" />
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.price}>${product.price}</Text>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>Agregar al carrito</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 20, right: 20, padding: 6, zIndex: 10 },
  hero: { width: '100%', height: 200, borderRadius: 16, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center' },
  brand: { fontSize: 14, color: '#666', marginTop: 6 },
  price: { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 12 },
  addBtn: { marginTop: 20, backgroundColor: '#111', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 28 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
