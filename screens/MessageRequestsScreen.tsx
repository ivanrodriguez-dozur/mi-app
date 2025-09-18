import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 8 },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  headerCount: { color: '#888', fontSize: 17, fontWeight: 'bold', marginLeft: 6 },
  messageList: { flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#fff' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  itemContent: { flex: 1, minWidth: 0 },
  name: { color: '#222', fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  message: { color: '#444', fontSize: 15, marginBottom: 2 },
  time: { color: '#888', fontSize: 13 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    tabsRow: { paddingHorizontal: 12, marginBottom: 12 },
    tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18, marginRight: 8, backgroundColor: '#F5F5F5' },
    tabActive: { backgroundColor: '#FF3366' },
    tabLabel: { color: '#444' },
    tabLabelActive: { color: '#fff' },
});

const demoMessages = [
  {
    id: '1',
    avatar: { uri: 'https://placehold.co/44x44?text=Y' },
    name: 'Yaniz.Daniela🌙✨.',
    message: 'Por si te interesa el catálogo de g...',
    time: '1d ago',
  },
  {
    id: '2',
    avatar: { uri: 'https://placehold.co/44x44?text=D' },
    name: 'Dilan⍟',
    message: 'Hola dozur',
    time: '1d ago',
  },
  {
    id: '3',
    avatar: { uri: 'https://placehold.co/44x44?text=N' },
    name: 'Novoa🍒...',
    message: 'Buena DOZUR habla con novoa e...',
    time: '2d ago',
  },
  {
    id: '4',
    avatar: { uri: 'https://placehold.co/44x44?text=F' },
    name: 'fabianbonilla545',
    message: 'Panita buenas tardes habla el prof...',
    time: 'Sep 1',
  },
  {
    id: '5',
    avatar: { uri: 'https://placehold.co/44x44?text=N' },
    name: 'Nuñez',
    message: 'Hola buenas tardes, espero que s...',
    time: 'Aug 17',
  },
  {
    id: '6',
    avatar: { uri: 'https://placehold.co/44x44?text=FL' },
    name: 'Fuera De Lugar Co ⚽🏆',
    message: 'Como fuen',
    time: 'Aug 8',
  },
  {
    id: '7',
    avatar: { uri: 'https://placehold.co/44x44?text=RC' },
    name: 'El rey del chupe',
    message: 'shared a LIVE',
    time: 'Jul 29',
  },
  {
    id: '8',
    avatar: { uri: 'https://placehold.co/44x44?text=DA' },
    name: 'Daniel',
    message: 'shared a LIVE',
    time: 'Jul 24',
  },
  {
    id: '9',
    avatar: { uri: 'https://placehold.co/44x44?text=RN' },
    name: 'Ramiro Nunes',
    message: 'oi',
    time: 'Jul 8',
  },
  {
    id: '10',
    avatar: { uri: 'https://placehold.co/44x44?text=JB' },
    name: 'Jordi Bravo',
    message: 'Hola buenos días, una pregunta ser...',
    time: 'Jul 4',
  },
  {
    id: '11',
    avatar: { uri: 'https://placehold.co/44x44?text=S' },
    name: 'santi#12😒...',
    message: '...',
    time: 'Jul 2',
  },
];

export default function MessageRequestsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('all');
  const filteredRequests = demoMessages; // Puedes filtrar según el tab
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'primary', label: 'Primary' },
    { key: 'general', label: 'General' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/messages')}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Message requests <Text style={styles.headerCount}>({filteredRequests.length})</Text>
        </Text>
        <View style={styles.headerActions}>
          <Ionicons name="document-outline" size={22} color="#222" style={{ marginRight: 16 }} />
          <Ionicons name="ellipsis-horizontal" size={22} color="#222" />
        </View>
      </View>
      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Message List */}
      <ScrollView style={styles.messageList}>
        {filteredRequests.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image source={item.avatar} style={styles.avatar} />
            <View style={styles.itemContent}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.message} numberOfLines={1}>{item.message}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}


