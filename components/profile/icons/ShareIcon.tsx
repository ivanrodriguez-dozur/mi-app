import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

interface ShareIconProps {
  size?: number;
  onPress?: () => void;
}

export const ShareIcon: React.FC<ShareIconProps> = ({ size = 24, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="share-outline" size={size} color={colors.text} />
    </TouchableOpacity>
  );
};