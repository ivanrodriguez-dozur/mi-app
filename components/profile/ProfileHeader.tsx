import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuButton } from './menu/MenuButton';
import { ProfileMenu } from './menu/ProfileMenu';
import EditProfileModal from './EditProfileModal';
import { StatisticsModal } from './StatisticsModal';
import { DarkModeModal } from './DarkModeModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileHeaderProps {
  coverImage: string;
  profileImage: string;
  name: string;
  description: string;
  email: string;
  onEditCover: () => void;
  onEditProfile: () => void;
  onEditName: (newName: string) => void;
  onEditDescription: (newDesc: string) => void;
  onUpdateProfile: (data: any) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  coverImage,
  profileImage,
  name,
  description,
  email,
  onEditCover,
  onEditProfile,
  onEditName,
  onEditDescription,
  onUpdateProfile,
}) => {
  const { colors, fontScale } = useTheme();
  const { signOut } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [editingDesc, setEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(description);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [darkModeModalVisible, setDarkModeModalVisible] = useState(false);

  const handleMenuNavigation = (screen: string) => {
    // Cerrar el menú inmediatamente para evitar efectos fantasma
    setMenuVisible(false);
    
    // Usar setTimeout para asegurar que el cierre se complete antes de abrir otros modales
    setTimeout(async () => {
      if (screen === 'account') {
        setEditModalVisible(true);
      } else if (screen === 'statistics') {
        setStatsModalVisible(true);
      } else if (screen === 'darkMode') {
        setDarkModeModalVisible(true);
      } else if (screen === 'logout') {
        try {
          const { error } = await signOut();
          if (error) {
            console.error('Error al cerrar sesión:', error);
          } else {
            console.log('Sesión cerrada exitosamente');
          }
        } catch (error) {
          console.error('Error inesperado al cerrar sesión:', error);
        }
      } else {
        console.log('Navegar a:', screen);
        // Aquí puedes implementar la navegación a las otras pantallas
      }
    }, 50); // Pequeño delay para asegurar fluidez
  };

  return (
    <View>
      <View style={{ position: 'relative' }}>
        <TouchableOpacity onPress={onEditCover}>
          <Image
            source={coverImage ? { uri: coverImage } : undefined}
            style={{
              height: 180,
              width: '100%',
              backgroundColor: coverImage ? undefined : '#f0f0f0',
              borderWidth: 2,
              borderColor: '#ddd',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onEditCover}
          style={{ position: 'absolute', right: 12, bottom: 12, backgroundColor: colors.card, borderRadius: 16, padding: 4, elevation: 2 }}
        >
          <Ionicons name="camera" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: 'center', marginTop: -50 }}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={onEditProfile}>
            <Image
              source={profileImage ? { uri: profileImage } : undefined}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 2,
                borderColor: colors.border,
                backgroundColor: profileImage ? undefined : colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onEditProfile}
            style={{ position: 'absolute', right: -4, bottom: -4, backgroundColor: colors.card, borderRadius: 16, padding: 4, elevation: 2 }}
          >
            <Ionicons name="camera" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        {editingName ? (
          <View>
            <TextInput
              value={tempName}
              onChangeText={setTempName}
              onBlur={() => {
                setEditingName(false);
                onEditName(tempName);
              }}
              style={{ fontSize: 20 * fontScale, fontWeight: 'bold', textAlign: 'center', color: colors.text }}
            />
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)}>
            <Text style={{ fontSize: 20 * fontScale, fontWeight: 'bold', marginTop: 8, color: colors.text }}>{name}</Text>
          </TouchableOpacity>
        )}
        {/* Descripción editable debajo del nombre */}
        {editingDesc ? (
          <View style={{ marginTop: 4 }}>
            <TextInput
              value={tempDesc}
              onChangeText={setTempDesc}
              onBlur={() => {
                setEditingDesc(false);
                onEditDescription(tempDesc);
              }}
              style={{ fontSize: 15 * fontScale, textAlign: 'center', color: colors.text, backgroundColor: colors.surface, borderRadius: 8, padding: 4, marginTop: 4 }}
              maxLength={80}
            />
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingDesc(true)}>
            <Text style={{ fontSize: 15 * fontScale, textAlign: 'center', color: colors.text, marginTop: 4 }}>
              {description || 'Agrega una descripción...'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Botón de menú en la esquina superior derecha */}
      <MenuButton onPress={() => setMenuVisible(true)} />
      
      {/* Modal del menú */}
      <ProfileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={handleMenuNavigation}
      />
      
      {/* Modal de edición de perfil */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        currentData={{
          coverImage,
          profileImage,
          name,
          description,
          email,
        }}
        onSave={onUpdateProfile}
      />
      
      {/* Modal de estadísticas */}
      <StatisticsModal
        visible={statsModalVisible}
        onClose={() => setStatsModalVisible(false)}
      />
      
      {/* Modal de modo oscuro */}
      <DarkModeModal
        visible={darkModeModalVisible}
        onClose={() => setDarkModeModalVisible(false)}
      />
    </View>
  );
};
