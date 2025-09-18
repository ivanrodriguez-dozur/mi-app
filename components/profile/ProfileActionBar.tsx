import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { FavoritesIcon, ShareIcon, TournamentsIcon, WalletIcon } from './icons';

interface ProfileActionBarProps {
  onWalletPress?: () => void;
  onTournamentsPress?: () => void;
  onSharePress?: () => void;
  onFavoritesPress?: () => void;
  onPublishPress?: () => void;
}

/**
 * Barra de acciones del perfil con iconos pequenos
 * Para personalizar: Modifica los iconos, tamanos o funcionalidades
 * Para agregar iconos: Importa nuevos componentes y agregales al JSX
 */
export const ProfileActionBar: React.FC<ProfileActionBarProps> = ({
  onWalletPress,
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
