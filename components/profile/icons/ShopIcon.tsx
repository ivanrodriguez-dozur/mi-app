import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { ShopModal } from '../ShopModal';

interface ShopIconProps {
  size?: number;
  onPress?: () => void;
}

export const ShopIcon: React.FC<ShopIconProps> = ({ size = 24, onPress }) => {
  const { colors } = useTheme();
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
        <Ionicons name="storefront-outline" size={size} color={colors.text} />
      </TouchableOpacity>

      <ShopModal
        visible={showShopModal}
        onClose={() => setShowShopModal(false)}
      />
    </>
  );
};