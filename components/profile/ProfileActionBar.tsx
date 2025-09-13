import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { WalletIcon, ShopIcon, TournamentsIcon, ShareIcon, FavoritesIcon } from './icons';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileActionBarProps {
  onWalletPress?: () => void;
  onShopPress?: () => void;
  onTournamentsPress?: () => void;
  onSharePress?: () => void;
  onFavoritesPress?: () => void;
  onPublishPress?: () => void;
}

/**
 * Barra de acciones del perfil con iconos pequeños
 * Para personalizar: Modifica los iconos, tamaños o funcionalidades
 * Para agregar iconos: Importa nuevos componentes y agrégalos al JSX
 */
export const ProfileActionBar: React.FC<ProfileActionBarProps> = ({
  onWalletPress,
  onShopPress,
  onTournamentsPress,
  onSharePress,
  onFavoritesPress,
  onPublishPress,
}) => {
  const { colors } = useTheme();

  const handlePublishPress = () => {
    console.log('Publish (+) pressed');
    onPublishPress?.();
  };

  const handleWalletPress = () => {
    console.log('Wallet pressed');
    onWalletPress?.();
  };

  const handleShopPress = () => {
    console.log('Shop pressed');
    onShopPress?.();
  };

  const handleSharePress = () => {
    console.log('Share pressed');
    onSharePress?.();
  };

  const handleFavoritesPress = () => {
    console.log('Favorites pressed');
    onFavoritesPress?.();
  };

  const handleTournamentsPress = () => {
    console.log('Tournaments pressed');
    onTournamentsPress?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <WalletIcon size={20} onPress={handleWalletPress} />
      <ShopIcon size={20} onPress={handleShopPress} />
      <TournamentsIcon size={20} onPress={handleTournamentsPress} />
      <FavoritesIcon size={20} onPress={handleFavoritesPress} />
      <ShareIcon size={20} onPress={handleSharePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
});