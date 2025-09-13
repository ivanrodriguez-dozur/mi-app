import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileTabsProps {
  selected: 'videos' | 'reels' | 'fotos';
  onSelect: (tab: 'videos' | 'reels' | 'fotos') => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ selected, onSelect }) => {
  const { colors, fontScale } = useTheme();
  
  const tabs = [
    { key: 'videos', label: 'Videos' },
    { key: 'reels', label: 'Booms' },
    { key: 'fotos', label: 'Fotos' }
  ] as const;

  const getSelectedIndex = () => {
    return tabs.findIndex(tab => tab.key === selected);
  };

  const handleTabPress = (tabKey: 'videos' | 'reels' | 'fotos') => {
    onSelect(tabKey);
  };

  return (
    <View style={{ marginVertical: 12 }}>
      {/* Tab Headers */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
        {tabs.map((tab) => (
          <TouchableOpacity 
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}
          >
            <Text style={{
              fontWeight: selected === tab.key ? 'bold' : 'normal',
              color: selected === tab.key ? colors.text : colors.textSecondary,
              fontSize: 16 * fontScale,
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Tab Indicator */}
      <View style={{
        height: 2,
        backgroundColor: colors.border,
        marginHorizontal: 20,
        borderRadius: 1,
        position: 'relative'
      }}>
        <View style={{
          position: 'absolute',
          height: 2,
          backgroundColor: colors.accent,
          borderRadius: 1,
          width: `${100 / tabs.length}%`,
          left: `${(getSelectedIndex() * 100) / tabs.length}%`,
        }} />
      </View>
    </View>
  );
};
