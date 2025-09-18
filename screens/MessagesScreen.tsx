import ReactNativeModal from 'react-native-modal';

import React, { useCallback, useLayoutEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, TextInput, Modal as NativeModal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PublishModal } from '../components/profile/PublishModal';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useBottomNav } from '../contexts/BottomNavContext';

type FollowerItem = {
  id: string;
  name: string;
  avatar: any;
  message: string;
  time: string;
};
type NotificationItem = { text: string };
// NewFollowersModalProps removed - using dedicated screen instead
type SearchContact = {
  id: string;
  name: string;
  avatar: any;
  summary: string;
  relation: 'following' | 'follower' | 'message';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginBottom: 16 },
  headerSpacer: { width: 64 },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#050505ff', textAlign: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: 64, marginTop: 4 },
  headerIcon: { padding: 6, marginHorizontal: 6, marginTop: 2 },
  storiesRow: { flexGrow: 0, paddingHorizontal: 14, marginBottom: 18 },
  storyRectBox: { alignItems: 'center', marginRight: 22, width: 120 },
  storyRectAvatar: { width: 120, height: 165, borderRadius: 26, marginBottom: 10 },
  storyRectName: { color: '#222', fontSize: 16, textAlign: 'center', maxWidth: 120 },
  storyCreateBox: { alignItems: 'center', marginRight: 24, width: 140 },
  storyCreateCard: { width: 140, height: 200, borderRadius: 32, alignItems: 'center', justifyContent: 'center', padding: 20, overflow: 'hidden' },
  storyCreateCardShadow: { shadowColor: '#0f3a1a', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 8 },
  storyCreateIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  storyCreateText: { color: '#0f3a1a', fontSize: 17, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  notificationsList: { flex: 1, paddingHorizontal: 8, paddingTop: 12 },
  sectionBox: { marginBottom: 8 },
  notificationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  notificationIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notificationLabel: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  notificationText: { color: '#444', fontSize: 14 },
  notificationCount: { backgroundColor: '#FF1744', borderRadius: 10, minWidth: 22, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  notificationCountText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  // --- estilos followers ---
  followersContainer: { backgroundColor: '#fff', paddingHorizontal: 0, paddingTop: 8 },
  followersTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 8, marginLeft: 16 },
  followerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#fff' },
  followerRowRecent: { backgroundColor: '#F5FAFF' },
  followerAvatarWrapper: { position: 'relative', marginRight: 12 },
  followerAvatar: { width: 44, height: 44, borderRadius: 22 },
  followerDot: { position: 'absolute', right: -2, top: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#2196F3', borderWidth: 2, borderColor: '#fff' },
  followerName: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  followerMsg: { color: '#444', fontSize: 14 },
  followerTime: { color: '#888', fontSize: 13 },
  followBackBtn: { backgroundColor: '#FF3366', borderRadius: 18, paddingVertical: 7, paddingHorizontal: 18, marginLeft: 8 },
  followBackText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  viewMoreBtn: { alignSelf: 'center', marginVertical: 8 },
  viewMoreText: { color: '#222', fontWeight: '600', fontSize: 15 },
  suggestedAccountsBox: { marginTop: 16, paddingHorizontal: 16 },
  suggestedTitle: { color: '#222', fontWeight: 'bold', fontSize: 17, marginBottom: 6 },
  suggestedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  suggestedAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  suggestedName: { color: '#222', fontWeight: 'bold', fontSize: 15 },
  suggestedInfo: { color: '#888', fontSize: 13 },
  searchModalWrapper: { flex: 1, margin: 0, justifyContent: 'flex-start' },
  searchCard: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 0 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 16, color: '#111' },
  searchClearBtn: { paddingLeft: 6 },
  searchCancelText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#007AFF' },
  searchResults: { flex: 1 },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  searchResultAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#E0E0E0' },
  searchResultInfo: { flex: 1 },
  searchResultName: { fontSize: 16, fontWeight: '600', color: '#111' },
  searchResultSummary: { fontSize: 13, color: '#666', marginTop: 2 },
  searchResultTag: { fontSize: 12, fontWeight: '600', color: '#444', backgroundColor: '#F2F2F2', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  searchEmptyText: { paddingVertical: 24, textAlign: 'center', color: '#999' },
  mediaViewerBackdrop: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  mediaViewerImage: { width: '100%', height: '100%' },
  mediaViewerClose: { position: 'absolute', top: 48, right: 24, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 24, padding: 8 },
});

const stories = [
  { id: 'create', name: 'Create', avatar: { uri: 'https://placehold.co/80x60?text=Create' } },
  { id: 'user1', name: 'Tina Rodriguez', avatar: { uri: 'https://placehold.co/80x60?text=Tina' } },
  { id: 'user2', name: 'Dayana Herrera', avatar: { uri: 'https://placehold.co/80x60?text=Dayana' } },
  { id: 'user3', name: 'On this day', avatar: { uri: 'https://placehold.co/80x60?text=On+this+day' } },
  { id: 'user4', name: 'Camilo Messi', avatar: { uri: 'https://placehold.co/80x60?text=Camilo' } },
];

const newFollowersData: FollowerItem[] = [
  { id: '1', name: "a'drian s'k", avatar: { uri: 'https://placehold.co/44x44?text=A' }, message: 'started following you.', time: 'Just now' },
  { id: '2', name: "J'ohn P's", avatar: { uri: 'https://placehold.co/44x44?text=J' }, message: 'started following you.', time: '31m ago' },
  { id: '3', name: "xiolysdimaira80", avatar: { uri: 'https://placehold.co/44x44?text=X' }, message: 'started following you.', time: '1h ago' },
  { id: '4', name: "NANCHY", avatar: { uri: 'https://placehold.co/44x44?text=N' }, message: 'started following you.', time: '1h ago' },
  { id: '5', name: "pelota redonda", avatar: { uri: 'https://placehold.co/44x44?text=P' }, message: 'started following you.', time: '1h ago' },
  { id: '6', name: "amorim_ofc011", avatar: { uri: 'https://placehold.co/44x44?text=A' }, message: 'started following you.', time: '3h ago' },
  { id: '7', name: "Ana Maria", avatar: { uri: 'https://placehold.co/44x44?text=A' }, message: 'started following you.', time: '4h ago' },
  { id: '8', name: "RJ Cortes", avatar: { uri: 'https://placehold.co/44x44?text=R' }, message: 'started following you.', time: '5h ago' },
  { id: '9', name: "Edison Valero", avatar: { uri: 'https://placehold.co/44x44?text=E' }, message: 'started following you.', time: '6h ago' }
];

const activityData: NotificationItem[] = [
  { text: 'Tina Rodriguez 🧠⚽ mentioned you in a comment.' },
  { text: 'Luis liked your post.' },
];
const systemNotificationsData: NotificationItem[] = [
  { text: 'TikTok: 👏 50 people liked tin...' },
  { text: 'You received a new message.' },
];

const messageContacts: SearchContact[] = [
  { id: 'msg-1', name: 'Tina Rodriguez', avatar: { uri: 'https://placehold.co/44x44?text=T' }, summary: 'Last message - 2h ago', relation: 'message' },
  { id: 'msg-2', name: 'Dayana Herrera', avatar: { uri: 'https://placehold.co/44x44?text=D' }, summary: 'Shared a video - Yesterday', relation: 'message' },
  { id: 'msg-3', name: 'Luis Ramirez', avatar: { uri: 'https://placehold.co/44x44?text=L' }, summary: 'Voice note - 3d ago', relation: 'message' },
];

const relationLabels: Record<SearchContact['relation'], string> = {
  follower: 'Follower',
  following: 'Following',
  message: 'Messages',
};

// New followers modal removed - we navigate to a dedicated screen instead


const ActivityList: React.FC<{ data: NotificationItem[] }> = ({ data }) => {
  return (
    <View style={styles.sectionBox}>
      <View style={styles.notificationItem}>
        <View style={[styles.notificationIcon, { backgroundColor: '#FFFDE7' }]}> <MaterialIcons name="notifications" size={28} color="#FFD600" /> </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.notificationLabel}>Activity</Text>
          {data.map((n: NotificationItem, i: number) => (
            <Text key={i} style={styles.notificationText}>{n.text}</Text>
          ))}
        </View>
        <View style={styles.notificationCount}><Text style={styles.notificationCountText}>{data.length}</Text></View>
      </View>
    </View>
  );
};

const SystemNotificationsList: React.FC<{ data: NotificationItem[] }> = ({ data }) => {
  return (
    <View style={styles.sectionBox}>
      <View style={styles.notificationItem}>
        <View style={[styles.notificationIcon, { backgroundColor: '#E8F5E9' }]}> <FontAwesome5 name="inbox" size={26} color="#212121" /> </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.notificationLabel}>System notifications</Text>
          {data.map((n: NotificationItem, i: number) => (
            <Text key={i} style={styles.notificationText}>{n.text}</Text>
          ))}
        </View>
        <View style={styles.notificationCount}><Text style={styles.notificationCountText}>{data.length}</Text></View>
      </View>
    </View>
  );
};

export default function MessagesScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { setSelected } = useBottomNav();
  const [isSearchVisible, setSearchVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  // media viewer state (full screen viewer)
  const [isMediaViewerVisible, setIsMediaViewerVisible] = React.useState(false);
  const [selectedMediaUri, setSelectedMediaUri] = React.useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = React.useState(false);
  const [initialSelectedForPublish, setInitialSelectedForPublish] = React.useState<{ uri: string; type: 'photo' | 'video' }[] | undefined>(undefined);
  // openMediaViewer removed; using PublishModal instead for new content
  const closeMediaViewer = () => {
    setSelectedMediaUri(null);
    setIsMediaViewerVisible(false);
  };

  const searchContacts = React.useMemo(() => {
    const directContacts = messageContacts;
    const followingContacts: SearchContact[] = stories
      .filter((story) => story.id !== 'create')
      .map((story) => ({
        id: `following-${story.id}`,
        name: story.name,
        avatar: story.avatar,
        summary: 'Following',
        relation: 'following',
      }));
    const followerContacts: SearchContact[] = newFollowersData.map((item) => ({
      id: `follower-${item.id}`,
      name: item.name,
      avatar: item.avatar,
      summary: `${item.message} - ${item.time}`,
      relation: 'follower',
    }));
    const combined = [...directContacts, ...followingContacts, ...followerContacts];
    const seen = new Set<string>();
    const unique: SearchContact[] = [];

    combined.forEach((contact) => {
      const key = contact.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(contact);
      }
    });

    return unique;
  }, []);

  const filteredContacts = React.useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return searchContacts;
    }
    return searchContacts.filter((contact) =>
      contact.name.toLowerCase().includes(normalized)
    );
  }, [searchContacts, searchQuery]);

  const openSearch = () => {
    setSearchQuery('');
    setSearchVisible(true);
  };

  const closeSearch = () => {
    setSearchVisible(false);
  };

  // Create flow - open image picker then open PublishModal with the selected asset
  const handleCreateStory = React.useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        // permission denied
        return;
      }
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8, allowsMultipleSelection: false });
  const canceled = (res as any).canceled ?? (res as any).cancelled ?? false;
  if (canceled) return;
  // expo-image-picker v13+ returns an object with assets[]; older versions used { canceled/cancelled, uri }
  const asset = (res as any).assets ? (res as any).assets[0] : (res as any);
      if (!asset || !asset.uri) return;

  const type = asset.type === 'video' ? 'video' : 'photo';
  // navigate to full-screen media editor and pass the selected file
  navigation.navigate('media-editor', { uri: asset.uri, type });
    } catch (e) {
      console.warn('Create story error', e);
    }
  }, [navigation]);

  // (media viewer handler removed) use handleCreateStory callback above which opens PublishModal

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setSelected('messages');
    }, [setSelected])
  );

  // nav select handled globally by BottomNavBar

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.container, { paddingBottom: insets.bottom + 110 }]}>
        <ReactNativeModal
        isVisible={isSearchVisible}
        statusBarTranslucent
        onBackdropPress={closeSearch}
        onBackButtonPress={closeSearch}
        backdropOpacity={0.25}
        style={styles.searchModalWrapper}
        useNativeDriver
      >
        <View style={[styles.searchCard, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.searchHeader}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={18} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar contactos"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={closeSearch}>
              <Text style={styles.searchCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
            {filteredContacts.length === 0 ? (
              <Text style={styles.searchEmptyText}>No se encontraron contactos.</Text>
            ) : (
              filteredContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.searchResultRow}
                  activeOpacity={0.7}
                  onPress={closeSearch}
                >
                  <Image source={contact.avatar} style={styles.searchResultAvatar} />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{contact.name}</Text>
                    <Text style={styles.searchResultSummary}>{contact.summary}</Text>
                  </View>
                  <Text style={styles.searchResultTag}>{relationLabels[contact.relation]}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </ReactNativeModal>
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Inbox</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon} onPress={openSearch}>
            <Ionicons name="search" size={26} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-horizontal" size={26} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesRow}>
        {stories.map((story) => {
          if (story.id === 'create') {
            return (
              <TouchableOpacity key={story.id} style={styles.storyCreateBox} onPress={handleCreateStory}>
                <LinearGradient
                  colors={['#C8FCEA', '#6CD89B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={[styles.storyCreateCard, styles.storyCreateCardShadow]}
                >
                  <View style={styles.storyCreateIcon}>
                    <Ionicons name="add" size={40} color="#0f3a1a" />
                  </View>
                  <Text style={styles.storyCreateText}>{story.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          return (
            <View key={story.id} style={styles.storyRectBox}>
              <Image source={story.avatar} style={styles.storyRectAvatar} />
              <Text style={styles.storyRectName} numberOfLines={1}>
                {story.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.notificationsList}>
        <TouchableOpacity
          style={styles.sectionBox}
          onPress={() => navigation.navigate('new-followers', { data: newFollowersData })}
        >
          <View style={styles.notificationItem}>
            <View style={[styles.notificationIcon, { backgroundColor: '#E3F2FD' }]}> 
              <Ionicons name="person-add" size={28} color="#1976D2" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationLabel}>New followers</Text>
              <Text style={styles.notificationText}>{newFollowersData.length} new</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sectionBox}
          onPress={() => navigation.navigate('activity', { data: activityData })}
        >
          <ActivityList data={activityData} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sectionBox}
          onPress={() =>
            navigation.navigate('system-notifications', { data: systemNotificationsData })
          }
        >
          <SystemNotificationsList data={systemNotificationsData} />
        </TouchableOpacity>
      </View>
      <NativeModal
        visible={isMediaViewerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeMediaViewer}
      >
        <View style={styles.mediaViewerBackdrop}>
          {selectedMediaUri && (
            <Image source={{ uri: selectedMediaUri }} style={styles.mediaViewerImage} resizeMode="contain" />
          )}
          <TouchableOpacity style={styles.mediaViewerClose} onPress={closeMediaViewer}>
            <Ionicons name="close" size={36} color="#fff" />
          </TouchableOpacity>
        </View>
      </NativeModal>
      {/* Publish modal invoked when user selects an asset from gallery */}
      <PublishModal
        visible={showPublishModal}
        onClose={() => {
          setShowPublishModal(false);
          setInitialSelectedForPublish(undefined);
        }}
        initialSelected={initialSelectedForPublish}
        onPublished={(url, type) => {
          // close modal after successful publish
          setShowPublishModal(false);
          setInitialSelectedForPublish(undefined);
          console.log('Published', url, type);
        }}
      />
  {/* BottomNavBar is rendered globally in app/_layout.tsx */}
    </View>
  </View>
  );
}
