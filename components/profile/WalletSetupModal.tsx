import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBlockchain } from '../../contexts/BlockchainContext';
import * as Clipboard from 'expo-clipboard';

interface WalletSetupModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal para configurar la wallet de Polygon
 * Permite crear una nueva wallet o importar una existente
 */
export const WalletSetupModal: React.FC<WalletSetupModalProps> = ({ visible, onClose }) => {
  const { colors, fontScale } = useTheme();
  const { generateNewWallet, importWallet } = useBlockchain();

  const [mode, setMode] = useState<'choice' | 'create' | 'import'>('choice');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');

  const handleCreateWallet = async () => {
    setIsProcessing(true);
    try {
      const result = await generateNewWallet();
      setGeneratedMnemonic(result.mnemonic);
      setMode('create');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importInput.trim()) {
      Alert.alert('Error', 'Ingresa tu frase semilla o clave privada');
      return;
    }

    setIsProcessing(true);
    try {
      await importWallet(importInput.trim());
      Alert.alert(
        '¡Éxito!',
        'Wallet importada correctamente',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo importar la wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopySeedPhrase = async () => {
    await Clipboard.setStringAsync(generatedMnemonic);
    Alert.alert('¡Copiado!', 'Frase semilla copiada al portapapeles');
  };

  const handleFinishSetup = () => {
    Alert.alert(
      'Wallet Creada',
      '¡Tu wallet ha sido creada exitosamente! Asegúrate de haber guardado tu frase semilla de forma segura.',
      [{ text: 'Entendido', onPress: onClose }]
    );
  };

  const renderChoice = () => (
    <View style={styles.content}>
      <View style={styles.iconContainer}>
        <Ionicons name="wallet" size={64} color={colors.accent || '#CCFF00'} />
      </View>
      
      <Text style={[styles.title, { color: colors.text, fontSize: 24 * fontScale }]}>
        Configura tu Wallet
      </Text>
      
      <Text style={[styles.description, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
        Para usar BoomCoins en Polygon, necesitas una wallet. Puedes crear una nueva o importar una existente.
      </Text>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.accent || '#CCFF00' }]}
        onPress={handleCreateWallet}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <>
            <Ionicons name="add-circle" size={24} color="#000000" />
            <Text style={[styles.primaryButtonText, { fontSize: 16 * fontScale }]}>
              Crear Nueva Wallet
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: colors.border || '#e2e8f0' }]}
        onPress={() => setMode('import')}
        disabled={isProcessing}
      >
        <Ionicons name="download" size={24} color={colors.text || '#1e293b'} />
        <Text style={[styles.secondaryButtonText, { color: colors.text || '#1e293b', fontSize: 16 * fontScale }]}>
          Importar Wallet Existente
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreate = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={64} color="#10B981" />
      </View>
      
      <Text style={[styles.title, { color: colors.text, fontSize: 24 * fontScale }]}>
        ¡Wallet Creada!
      </Text>
      
      <View style={[styles.warningBox, { backgroundColor: colors.surface, borderColor: '#EF4444' }]}>
        <Ionicons name="warning" size={24} color="#EF4444" />
        <Text style={[styles.warningText, { color: colors.text, fontSize: 14 * fontScale }]}>
          Guarda esta frase semilla en un lugar seguro. Es la única forma de recuperar tu wallet. Nunca la compartas con nadie.
        </Text>
      </View>

      <Text style={[styles.label, { color: colors.text, fontSize: 14 * fontScale }]}>
        Tu Frase Semilla (12 palabras):
      </Text>
      
      <View style={[styles.seedPhraseContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.seedPhrase, { color: colors.text, fontSize: 14 * fontScale }]}>
          {generatedMnemonic}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.copyButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handleCopySeedPhrase}
      >
        <Ionicons name="copy" size={20} color={colors.text || '#1e293b'} />
        <Text style={[styles.copyButtonText, { color: colors.text || '#1e293b', fontSize: 14 * fontScale }]}>
          Copiar Frase Semilla
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.accent || '#CCFF00' }]}
        onPress={handleFinishSetup}
      >
        <Text style={[styles.primaryButtonText, { fontSize: 16 * fontScale }]}>
          Ya la guardé, continuar
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderImport = () => (
    <View style={styles.content}>
      <View style={styles.iconContainer}>
        <Ionicons name="download" size={64} color={colors.accent || '#CCFF00'} />
      </View>
      
      <Text style={[styles.title, { color: colors.text, fontSize: 24 * fontScale }]}>
        Importar Wallet
      </Text>
      
      <Text style={[styles.description, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
        Ingresa tu frase semilla de 12 o 24 palabras, o tu clave privada.
      </Text>

      <TextInput
        style={[
          styles.importInput,
          { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontSize: 14 * fontScale }
        ]}
        placeholder="word1 word2 word3... o 0x..."
        placeholderTextColor={colors.textSecondary}
        value={importInput}
        onChangeText={setImportInput}
        multiline
        numberOfLines={4}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.accent || '#CCFF00' }]}
        onPress={handleImportWallet}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={[styles.primaryButtonText, { fontSize: 16 * fontScale }]}>
            Importar Wallet
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: colors.border || '#e2e8f0' }]}
        onPress={() => setMode('choice')}
        disabled={isProcessing}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.text || '#1e293b', fontSize: 16 * fontScale }]}>
          Volver
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: 20 * fontScale }]}>
              Configuración de Wallet
            </Text>
            {mode === 'choice' && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text || '#1e293b'} />
              </TouchableOpacity>
            )}
          </View>

          {mode === 'choice' && renderChoice()}
          {mode === 'create' && renderCreate()}
          {mode === 'import' && renderImport()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '85%',
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    lineHeight: 18,
  },
  seedPhraseContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  seedPhrase: {
    fontFamily: 'monospace',
    lineHeight: 24,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
  },
  copyButtonText: {
    fontWeight: '600',
  },
  importInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
});
