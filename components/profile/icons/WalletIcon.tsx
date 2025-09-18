import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { WalletModal } from '../WalletModal';

interface WalletIconProps {
  size?: number;
  onPress?: () => void;
}

export const WalletIcon: React.FC<WalletIconProps> = ({ size = 24, onPress }) => {
  const { colors } = useTheme();
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  const handlePress = () => {
    setWalletModalVisible(true);
    onPress?.();
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
        <Ionicons name="wallet-outline" size={size} color={colors.text} />
      </TouchableOpacity>
      
      <WalletModal
        visible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
      />
    </>
  );
};