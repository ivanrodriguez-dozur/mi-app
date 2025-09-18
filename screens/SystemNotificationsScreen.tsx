import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const demoNotifications = [
	{
		id: '1',
		avatar: null,
		title: 'Yaniz.Daniela🌙✨.',
		message: 'Por si te interesa el catálogo de g...',
		time: '1d ago',
	},
	{
		id: '2',
		avatar: null,
		title: 'Dilan⍟',
		message: 'Hola dozur',
		time: '1d ago',
	},
	{
		id: '3',
		avatar: null,
		title: 'Novoa🍒...',
		message: 'Buena DOZUR habla con novoa e...',
		time: '2d ago',
	},
	{
		id: '4',
		avatar: null,
		title: 'fabianbonilla545',
		message: 'Panita buenas tardes habla el prof...',
		time: 'Sep 1',
	},
	{
		id: '5',
		avatar: null,
		title: 'Nuñez',
		message: 'Hola buenas tardes, espero que s...',
		time: 'Aug 17',
	},
	{
		id: '6',
		avatar: null,
		title: 'Fuera De Lugar Co ⚽🏆',
		message: 'Como fuen',
		time: 'Aug 8',
	},
	{
		id: '7',
		avatar: null,
		title: 'El rey del chupe',
		message: 'shared a LIVE',
		time: 'Jul 29',
	},
	{
		id: '8',
		avatar: null,
		title: 'Daniel',
		message: 'shared a LIVE',
		time: 'Jul 24',
	},
	{
		id: '9',
		avatar: null,
		title: 'Ramiro Nunes',
		message: 'oi',
		time: 'Jul 8',
	},
	{
		id: '10',
		avatar: null,
		title: 'Jordi Bravo',
		message: 'Hola buenos días, una pregunta ser...',
		time: 'Jul 4',
	},
	{
		id: '11',
		avatar: null,
		title: 'santi#12😒...',
		message: '...',
		time: 'Jul 2',
	},
];

export default function SystemNotificationsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/messages');
    }
  };
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#1a1818ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System notifications</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 24 }}>
        {demoNotifications.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.avatar}>
              <FontAwesome5 name="inbox" size={28} color="#212121" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff', paddingTop: 48, marginTop: 0 },
	headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 8, marginBottom: 16 },
	headerTitle: { flex: 1, fontSize: 20, lineHeight: 24, fontWeight: 'bold', color: '#222', textAlign: 'center' },
	list: { flex: 1, backgroundColor: '#fff', paddingTop: 0 },
	itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#fff' },
	avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
	itemContent: { flex: 1, minWidth: 0 },
	title: { color: '#222', fontWeight: 'bold', fontSize: 15, lineHeight: 18, marginBottom: 2 },
	message: { color: '#444', fontSize: 13, lineHeight: 16, marginBottom: 2 },
	time: { color: '#888', fontSize: 12, lineHeight: 14 },
});



