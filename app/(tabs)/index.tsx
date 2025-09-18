import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const { height, width } = Dimensions.get('window');

const SAMPLE = Array.from({ length: 10 }).map((_, i) => ({
  id: `item-${i}`,
  user: `Valery`,
  avatar: 'https://placehold.co/60x60?text=U',
  uri: 'https://placehold.co/1080x1920',
  likes: Math.floor(Math.random() * 500),
  comments: Math.floor(Math.random() * 40),
}));

function FeedItem({ item }: { item: any }) {
  const router = useRouter();
  return (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.uri }} style={styles.media} />
      <View style={styles.overlayBottom}>
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{item.user}</Text>
          <Text style={styles.caption}>Contains: WHERE SHE GOES - Bad Bunny</Text>
        </View>
        <View style={styles.sideBar}>
          <TouchableOpacity style={styles.sideBtn} onPress={() => {}}>
            <View style={styles.iconCircle}><Text style={{ color: '#fff' }}>+</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={() => {}}>
            <Text style={styles.sideText}>❤</Text>
            <Text style={styles.sideCount}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={() => router.push('/messages')}>
            <Text style={styles.sideText}>💬</Text>
            <Text style={styles.sideCount}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={() => {}}>
            <Text style={styles.sideText}>🔖</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={() => {}}>
            <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function BoomFeed() {
  return (
    <FlatList
      data={SAMPLE}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <FeedItem item={item} />}
      pagingEnabled
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  itemContainer: { width, height, backgroundColor: '#000' },
  media: { width, height, resizeMode: 'cover' },
  overlayBottom: { position: 'absolute', bottom: 32, left: 12, right: 12, flexDirection: 'row', alignItems: 'flex-end' },
  username: { color: '#fff', fontWeight: '700', fontSize: 18 },
  caption: { color: '#fff', marginTop: 6 },
  sideBar: { width: 72, alignItems: 'center', marginLeft: 12 },
  sideBtn: { marginBottom: 18, alignItems: 'center' },
  sideText: { color: '#fff', fontSize: 22 },
  sideCount: { color: '#fff', marginTop: 6 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ff3366', alignItems: 'center', justifyContent: 'center' },
  avatarSmall: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
});
