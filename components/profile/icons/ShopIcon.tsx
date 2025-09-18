import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useShop } from '../../../contexts/ShopContext';
import { ShopModal } from '../ShopModal';

interface ShopIconProps {
  size?: number;
  onPress?: () => void;
}

export const ShopIcon: React.FC<ShopIconProps> = ({ size = 24, onPress }) => {
  const { colors } = useTheme();
  const { cartCount } = useShop();
  const [showShopModal, setShowShopModal] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowShopModal(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={{
          padding: 8,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="bag-handle-outline" size={size} color={colors.text} />
        {cartCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              paddingHorizontal: 4,
              backgroundColor: '#FF1744',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <ShopModal
        visible={showShopModal}
        onClose={() => setShowShopModal(false)}
      />
    </>
  );
};