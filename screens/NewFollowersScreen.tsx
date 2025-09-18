import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 8, marginBottom: 8 },
  headerTitle: { flex: 1, fontSize: 20, lineHeight: 24, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  followersContainer: { backgroundColor: '#fff', paddingHorizontal: 0, paddingTop: 8 },
  followerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#fff' },
  followerRowRecent: { backgroundColor: '#F5FAFF' },
  followerAvatarWrapper: { position: 'relative', marginRight: 12 },
  followerAvatar: { width: 44, height: 44, borderRadius: 22 },
  followerDot: { position: 'absolute', right: -2, top: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#2196F3', borderWidth: 2, borderColor: '#fff' },
  followerName: { color: '#222', fontWeight: 'bold', fontSize: 15, lineHeight: 18 },
  followerMsg: { color: '#444', fontSize: 13, lineHeight: 16 },
  followerTime: { color: '#888', fontSize: 12, lineHeight: 14 },
  followBackBtn: { backgroundColor: '#FF3366', borderRadius: 18, paddingVertical: 7, paddingHorizontal: 18, marginLeft: 8 },
  followBackText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

export type FollowerItem = {
  id: string;
  name: string;
  avatar: any;
  message: string;
  time: string;
};

export default function NewFollowersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // params.data can be a string or string[] depending on navigation; normalize to an array
  const rawData = Array.isArray(params.data) ? params.data : (params.data ? [params.data] : []);
  // For now assume callers pass serialized follower objects or real objects; coerce to the expected shape
  const data = (rawData as unknown as FollowerItem[]);
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New followers</Text>
      </View>
      <ScrollView style={styles.followersContainer}>
        {data.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>No followers to show.</Text>
        ) : (
          data.map((follower: FollowerItem, idx: number) => (
            <View key={follower.id} style={[styles.followerRow, idx === 0 && styles.followerRowRecent]}>
              <View style={styles.followerAvatarWrapper}>
                <Image source={follower.avatar} style={styles.followerAvatar} />
                {idx === 0 && <View style={styles.followerDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.followerName}>{follower.name}</Text>
                <Text style={styles.followerMsg}>{follower.message}</Text>
                <Text style={styles.followerTime}>{follower.time}</Text>
              </View>
              <TouchableOpacity style={styles.followBackBtn}><Text style={styles.followBackText}>Follow back</Text></TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
