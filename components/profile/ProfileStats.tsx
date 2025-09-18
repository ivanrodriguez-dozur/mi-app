import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileStatsProps {
  plays: number;
  followers: number;
  likes: number;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ plays, followers, likes }) => {
  const { colors, fontScale } = useTheme();
  
  // Función para formatear números a formato decimal (1.3k, 1.3M)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  };
  
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 * fontScale, color: colors.text }}>{formatNumber(plays)}</Text>
        <Text style={{ color: colors.textSecondary, fontWeight: 'bold', fontSize: 12 * fontScale }}>Plays</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 * fontScale, color: colors.text }}>{formatNumber(followers)}</Text>
        <Text style={{ color: colors.textSecondary, fontWeight: 'bold', fontSize: 12 * fontScale }}>Followers</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 * fontScale, color: colors.text }}>{formatNumber(likes)}</Text>
        <Text style={{ color: colors.textSecondary, fontWeight: 'bold', fontSize: 12 * fontScale }}>Likes</Text>
      </View>
    </View>
  );
};
