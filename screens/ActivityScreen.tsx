
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 8, marginBottom: 16 },
  headerTitle: { flex: 1, fontSize: 20, lineHeight: 24, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  tabRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 8 },
  tabScroll: { flexGrow: 0 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F5F5F5', marginRight: 8 },
  badge: {
    backgroundColor: '#FF1744',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  tabBtnActive: { backgroundColor: '#E3F7FF' },
  tabLabel: { color: '#222', fontWeight: '600', fontSize: 15 },
  tabLabelActive: { color: '#039BE5' },
  tabSettings: { padding: 6, marginLeft: 4 },
  activityList: { flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#fff' },
  itemRowRecent: { backgroundColor: '#E3F7FF' },
  avatarBox: { position: 'relative', marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  dot: { position: 'absolute', left: -6, top: 18, width: 10, height: 10, borderRadius: 5, backgroundColor: '#039BE5' },
  itemContent: { flex: 1 },
  name: { color: '#222', fontWeight: 'bold', fontSize: 15, lineHeight: 18 },
  message: { color: '#222', fontSize: 14, lineHeight: 17 },
  time: { color: '#888', fontSize: 12, lineHeight: 14, marginTop: 1 },
  rightThumb: { width: 44, height: 44, borderRadius: 8, marginLeft: 8 },
  commentActions: { flexDirection: 'row', marginTop: 6 },
  commentBtn: { backgroundColor: '#F5F5F5', borderRadius: 14, paddingVertical: 4, paddingHorizontal: 12, marginRight: 8 },
  commentBtnText: { color: '#222', fontWeight: '600', fontSize: 14 },
});


const tabs = [
  { key: 'all', label: 'All' },
  { key: 'comments', label: 'Comments' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'likes', label: 'Likes' },
  { key: 'shared', label: 'Shared' },
];


const demoData = [
  {
    id: '1',
    avatar: { uri: 'https://placehold.co/44x44?text=A' },
    name: "a'drian s'k",
    message: 'liked your video.',
    time: 'Just now',
    thumb: { uri: 'https://placehold.co/44x44?text=V1' },
    recent: true,
    type: 'likes',
  },
  {
    id: '2',
    avatar: { uri: 'https://placehold.co/44x44?text=A' },
    name: "a'drian s'k",
    message: 'liked your video.',
    time: '7m ago',
    thumb: { uri: 'https://placehold.co/44x44?text=V2' },
    type: 'likes',
  },
  {
    id: '3',
    avatar: { uri: 'https://placehold.co/44x44?text=S' },
    name: 'arturo',
    message: 'liked your video.',
    time: '20m ago',
    thumb: { uri: 'https://placehold.co/44x44?text=V3' },
    type: 'likes',
  },
  {
    id: '4',
    avatar: { uri: 'https://placehold.co/44x44?text=AL' },
    name: 'Alejo',
    message: 'liked your video.',
    time: '21m ago',
    thumb: { uri: 'https://placehold.co/44x44?text=V4' },
    type: 'likes',
  },
  {
    id: '5',
    avatar: { uri: 'https://placehold.co/44x44?text=M' },
    name: 'Maicol',
    message: 'added your video to Favorites.',
    time: '26m ago',
    thumb: { uri: 'https://placehold.co/44x44?text=V5' },
    type: 'shared',
  },
  {
    id: '6',
    avatar: { uri: 'https://placehold.co/44x44?text=JP' },
    name: 'Juan Pablo',
    message: 'commented: 😍',
    time: '35m ago',
    thumb: { uri: 'https://placehold.co/44x44?text=V6' },
    comment: true,
    type: 'comments',
  },
  {
    id: '7',
    avatar: { uri: 'https://placehold.co/44x44?text=D' },
    name: 'Darian.',
    message: 'mentioned you in a video.',
    time: '45m ago',
    thumb: { uri: 'https://placehold.co/44x44?text=V7' },
    type: 'mentions',
  },
  {
    id: '8',
    avatar: { uri: 'https://placehold.co/44x44?text=EN' },
    name: 'Elkin Novoa and Santiago',
    message: 'liked your video.',
    time: '45m ago',
    thumb: { uri: 'https://placehold.co/44x44?text=V8' },
    type: 'likes',
  },
  {
    id: '9',
    avatar: { uri: 'https://placehold.co/44x44?text=E9' },
    name: 'Ego09',
    message: 'liked your video.',
    time: '48m ago',
    thumb: { uri: 'https://placehold.co/44x44?text=V9' },
    type: 'likes',
  },
  {
    id: '10',
    avatar: { uri: 'https://placehold.co/44x44?text=CM' },
    name: 'Cristian M',
    message: 'liked your video.',
    time: '50m ago',
    thumb: { uri: 'https://placehold.co/44x44?text=V10' },
    type: 'likes',
  },
];

export default function ActivityScreen() {
  const router = useRouter();
  // const params = useLocalSearchParams();
  // const data = Array.isArray(params.data) ? params.data : (params.data ?? []);
  const [selectedTab, setSelectedTab] = React.useState('all');

  // Filtrado por tipo
  const filteredData = selectedTab === 'all'
    ? demoData
    : demoData.filter(item => item.type === selectedTab);

  // Contadores por tipo
  const tabCounts: Record<string, number> = {
    all: demoData.length,
    comments: demoData.filter(i => i.type === 'comments').length,
    mentions: demoData.filter(i => i.type === 'mentions').length,
    likes: demoData.filter(i => i.type === 'likes').length,
    shared: demoData.filter(i => i.type === 'shared').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
  <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/messages')}>
          <Ionicons name="arrow-back" size={28} color="#1a1818ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={{ width: 28 }} />
      </View>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, selectedTab === tab.key && styles.tabBtnActive]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={[styles.tabLabel, selectedTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
              {tabCounts[tab.key] > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tabCounts[tab.key]}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Tuerca eliminada */}
      </View>
      {/* Activity List */}
      <ScrollView style={styles.activityList}>
        {filteredData.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>No activity notifications.</Text>
        ) : (
          filteredData.map((item, idx) => (
            <View key={item.id} style={[styles.itemRow, item.recent && styles.itemRowRecent]}>
              <View style={styles.avatarBox}>
                <Image source={item.avatar} style={styles.avatar} />
                {item.recent && <View style={styles.dot} />}
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{item.time}</Text>
                {item.comment && (
                  <View style={styles.commentActions}>
                    <TouchableOpacity style={styles.commentBtn}><Text style={styles.commentBtnText}>Like</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.commentBtn}><Text style={styles.commentBtnText}>Reply</Text></TouchableOpacity>
                  </View>
                )}
              </View>
              <Image source={item.thumb} style={styles.rightThumb} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
