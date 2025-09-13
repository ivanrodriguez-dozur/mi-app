import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface DarkModeModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal de configuración de modo oscuro y personalización
 * Para editar: Modifica las opciones en el array 'themeOptions'
 * Para personalizar: Cambia los colores y estilos en 'styles'
 * Para agregar opciones: Añade nuevos switches y configuraciones
 */
export const DarkModeModal: React.FC<DarkModeModalProps> = ({ visible, onClose }) => {
  const { 
    isDarkMode, 
    isAutoTheme, 
    highContrast,
    reducedAnimations,
    largeFonts,
    colors, 
    toggleDarkMode, 
    toggleAutoTheme, 
    setThemeSettings 
  } = useTheme();

  const themeOptions = [
    {
      id: 'darkMode',
      title: 'Modo Oscuro',
      description: 'Cambia la apariencia a un tema oscuro',
      icon: 'moon',
      value: isDarkMode,
      onToggle: toggleDarkMode,
      color: '#4F46E5',
    },
    {
      id: 'autoTheme',
      title: 'Tema Automático',
      description: 'Sigue el tema del sistema',
      icon: 'phone-portrait',
      value: isAutoTheme,
      onToggle: toggleAutoTheme,
      color: '#10B981',
    },
    {
      id: 'highContrast',
      title: 'Alto Contraste',
      description: 'Mejora la visibilidad con mayor contraste',
      icon: 'contrast',
      value: highContrast,
      onToggle: () => setThemeSettings({ highContrast: !highContrast }),
      color: '#F59E0B',
    },
    {
      id: 'reducedAnimations',
      title: 'Reducir Animaciones',
      description: 'Minimiza las animaciones para mejor rendimiento',
      icon: 'flash-off',
      value: reducedAnimations,
      onToggle: () => setThemeSettings({ reducedAnimations: !reducedAnimations }),
      color: '#EF4444',
    },
    {
      id: 'largeFonts',
      title: 'Fuentes Grandes',
      description: 'Aumenta el tamaño del texto',
      icon: 'text',
      value: largeFonts,
      onToggle: () => setThemeSettings({ largeFonts: !largeFonts }),
      color: '#8B5CF6',
    },
  ];

  const previewColors = {
    light: {
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#1e293b',
      accent: '#CCFF00',
    },
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      accent: '#CCFF00',
    },
  };

  // Usar los colores del contexto global
  const currentTheme = colors;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: currentTheme.surface }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={currentTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
            Personalización
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preview Card */}
          <View style={[styles.previewCard, { backgroundColor: currentTheme.surface }]}>
            <Text style={[styles.previewTitle, { color: currentTheme.text }]}>
              Vista Previa
            </Text>
            <View style={styles.previewContent}>
              <View style={[styles.previewPost, { backgroundColor: currentTheme.background }]}>
                <View style={styles.previewHeader}>
                  <View style={[styles.previewAvatar, { backgroundColor: currentTheme.accent }]} />
                  <View>
                    <Text style={[styles.previewName, { color: currentTheme.text }]}>
                      Usuario
                    </Text>
                    <Text style={[styles.previewTime, { color: currentTheme.text, opacity: 0.6 }]}>
                      hace 2 horas
                    </Text>
                  </View>
                </View>
                <Text style={[styles.previewText, { color: currentTheme.text }]}>
                  Este es un ejemplo de cómo se verá el contenido con el tema seleccionado.
                </Text>
                <View style={styles.previewActions}>
                  <TouchableOpacity style={styles.previewAction}>
                    <Ionicons name="heart-outline" size={20} color={currentTheme.text} />
                    <Text style={[styles.previewActionText, { color: currentTheme.text }]}>
                      Like
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.previewAction}>
                    <Ionicons name="chatbubble-outline" size={20} color={currentTheme.text} />
                    <Text style={[styles.previewActionText, { color: currentTheme.text }]}>
                      Comentar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Theme Options */}
          <View style={[styles.section, { backgroundColor: currentTheme.surface }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Opciones de Tema
            </Text>
            
            {themeOptions.map((option) => (
              <View key={option.id} style={styles.optionContainer}>
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                    <Ionicons name={option.icon as any} size={20} color="#fff" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, { color: currentTheme.text }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionDescription, { color: currentTheme.text, opacity: 0.7 }]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={option.value}
                  onValueChange={option.onToggle}
                  trackColor={{ false: '#d1d5db', true: currentTheme.accent }}
                  thumbColor={option.value ? '#fff' : '#f4f3f4'}
                  ios_backgroundColor="#d1d5db"
                />
              </View>
            ))}
          </View>

          {/* Additional Settings */}
          <View style={[styles.section, { backgroundColor: currentTheme.surface }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Configuración Adicional
            </Text>
            
            <TouchableOpacity style={styles.additionalOption}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#6366f1' }]}>
                  <Ionicons name="color-palette" size={20} color="#fff" />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: currentTheme.text }]}>
                    Color de Acento
                  </Text>
                  <Text style={[styles.optionDescription, { color: currentTheme.text, opacity: 0.7 }]}>
                    Personaliza el color principal
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={currentTheme.text} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.additionalOption}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#059669' }]}>
                  <Ionicons name="download" size={20} color="#fff" />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: currentTheme.text }]}>
                    Descargar Temas
                  </Text>
                  <Text style={[styles.optionDescription, { color: currentTheme.text, opacity: 0.7 }]}>
                    Explora más temas personalizados
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={currentTheme.text} />
            </TouchableOpacity>
          </View>

          {/* Reset Button */}
          <TouchableOpacity 
            style={[styles.resetButton, { borderColor: colors.text + '30' }]}
            onPress={() => {
              setThemeSettings({
                isDarkMode: false,
                isAutoTheme: false,
                highContrast: false,
                reducedAnimations: false,
                largeFonts: false,
              });
            }}
          >
            <Ionicons name="refresh" size={20} color="#EF4444" />
            <Text style={styles.resetButtonText}>Restablecer a Valores por Defecto</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  previewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewPost: {
    padding: 16,
    borderRadius: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewTime: {
    fontSize: 12,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 20,
  },
  previewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewActionText: {
    fontSize: 12,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  additionalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
});