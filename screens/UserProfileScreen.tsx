import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { FollowButton } from '../components/profile/FollowButton';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { ProfileContentGrid } from '../components/profile/ProfileContentGrid';
import { ProfileActionBar } from '../components/profile/ProfileActionBar';
import { FavoritesModal } from '../components/profile/FavoritesModal';
import { SharedVideosModal } from '../components/profile/SharedVideosModal';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../hooks/useProfile';
import EditProfileModal from '../components/profile/EditProfileModal';
import { PublishModal } from '../components/profile/PublishModal';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from '../components/auth/LoginModal';

const initialContent = {
  videos: [
    { id: '1', image: 'https://placehold.co/200x200?text=Video+1' },
    { id: '2', image: 'https://placehold.co/200x200?text=Video+2' },
    { id: '3', image: 'https://placehold.co/200x200?text=Video+3' },
  ],
  reels: [
    { id: '4', image: 'https://placehold.co/200x200?text=Reel+1' },
    { id: '5', image: 'https://placehold.co/200x200?text=Reel+2' },
    { id: '6', image: 'https://placehold.co/200x200?text=Reel+3' },
  ],
  fotos: [
    { id: '7', image: 'https://placehold.co/200x200?text=Foto+1' },
    { id: '8', image: 'https://placehold.co/200x200?text=Foto+2' },
    { id: '9', image: 'https://placehold.co/200x200?text=Foto+3' },
  ]
};

export const UserProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { profile, loading, updateProfile, fetchProfile } = useProfile();
  const { user } = useAuth();
  
  // Estados locales para datos hardcodeados temporalmente
  const [coverImage, setCoverImage] = useState('https://placehold.co/600x200?text=Portada');
  const [profileImage, setProfileImage] = useState('https://placehold.co/100x100?text=Perfil');
  const [name, setName] = useState('Dozurtv');
  const [description, setDescription] = useState('bienvenidos al nuevo mundo del futsal');
  const [email, setEmail] = useState('dozurtv@example.com');
  const [isFollowing, setIsFollowing] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'videos' | 'reels' | 'fotos'>('videos');
  // bottom navigation is global
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showSharedVideosModal, setShowSharedVideosModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdateProfile = async (data: any) => {
    // Map form data to DB fields
    const updates: any = {
      foto_portada: data.coverImage,
      foto_perfil: data.profileImage,
      nombre: data.name,
      descripcion: data.description,
      email: data.email,
      updated_at: new Date().toISOString(),
    };

    try {
      const result = await updateProfile(updates);
      if ((result as any)?.error) {
        console.error('Error saving profile:', (result as any).error);
      } else {
        // Update local UI state
        setCoverImage(data.coverImage);
        setProfileImage(data.profileImage);
        setName(data.name);
        setDescription(data.description);
        setEmail(data.email);
        // Refrescar datos del perfil desde Supabase
        await fetchProfile();
        console.log('Perfil actualizado:', data);
      }
    } catch (err) {
      console.error('Unexpected error saving profile:', err);
    }
  };


  const handleFavoritesPress = () => {
    console.log('Abriendo favorites modal');
    setShowFavoritesModal(true);
  };

  const handleTournamentsPress = () => {
    console.log('Navegando a pantalla de torneos gaming');
    router.push('/tournaments');
  };

  const handleSharePress = () => {
    console.log('Abriendo videos compartidos modal');
    setShowSharedVideosModal(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {!user && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
          <TouchableOpacity
            style={{ backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, marginTop: 48 }}
            onPress={() => { setShowLoginModal(true); }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* El perfil SIEMPRE visible */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.text, marginTop: 10 }}>Cargando perfil...</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            <ProfileHeader
              coverImage={profile?.foto_portada || coverImage}
              profileImage={profile?.foto_perfil || profileImage}
              name={profile?.nombre || name}
              description={profile?.descripcion || description}
              email={profile?.email || email}
              onEditCover={() => setShowEditModal(true)}
              onEditProfile={() => setShowEditModal(true)}
              onEditName={setName}
              onEditDescription={setDescription}
              onUpdateProfile={handleUpdateProfile}
            />
            <ProfileStats 
              plays={profile?.plays || 0} 
              followers={profile?.followers || 0} 
              likes={profile?.likes || 0} 
            />
            {profile && user && profile.id !== user.id && (
              <FollowButton isFollowing={isFollowing} onToggleFollow={() => setIsFollowing(f => !f)} />
            )}
            <ProfileActionBar 
              onFavoritesPress={handleFavoritesPress}
              onTournamentsPress={handleTournamentsPress}
              onSharePress={handleSharePress}
            />
            <ProfileTabs selected={selectedTab} onSelect={setSelectedTab} />
            <ProfileContentGrid 
              items={initialContent[selectedTab]} 
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              allContent={initialContent}
            />
          </ScrollView>
          {/* BottomNavBar is rendered globally in app/_layout.tsx */}
          <FavoritesModal 
            visible={showFavoritesModal} 
            onClose={() => setShowFavoritesModal(false)} 
          />
          <SharedVideosModal 
            visible={showSharedVideosModal} 
            onClose={() => setShowSharedVideosModal(false)} 
          />
          <EditProfileModal
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
            currentData={{
              coverImage: profile?.foto_portada || coverImage,
              profileImage: profile?.foto_perfil || profileImage,
              name: profile?.nombre || name,
              description: profile?.descripcion || description,
              email: profile?.email || email,
            }}
            onSave={handleUpdateProfile}
          />
          <LoginModal
            visible={showLoginModal}
            onClose={() => setShowLoginModal(false)}
          />
          {/* Modal para publicar fotos/videos */}
          <PublishModal visible={showPublishModal} onClose={() => setShowPublishModal(false)} />
        </>
      )}
    </View>
  );
}
