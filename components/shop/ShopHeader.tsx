import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopIcon } from '../profile/icons/ShopIcon';

export type ShopHeaderProps = {
  userName?: string;
  avatarUrl?: string;
  onProfilePress?: () => void;
  onFavoritesPress?: () => void;
  favoritesCount?: number;
};

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  userName = 'Jobby',
  avatarUrl = 'https://placehold.co/60x60?text=U',
  onProfilePress,
  onFavoritesPress,
  favoritesCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Welcome Back</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onFavoritesPress} style={styles.iconButton} activeOpacity={0.85}>
          <Ionicons name="heart" size={24} color={favoritesCount > 0 ? '#FF3366' : '#B0B0B0'} />
          {favoritesCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{favoritesCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.cartWrapper}>
          <ShopIcon size={22} />
        </View>
        <TouchableOpacity onPress={onProfilePress} style={styles.avatarButton} activeOpacity={0.85}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  greeting: { color: '#777', fontSize: 14 },
  userName: { color: '#111', fontSize: 24, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cartWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
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
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatarButton: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
});
