import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
  onTransfer: (amount: number, recipient: string) => void;
  type: 'send' | 'receive';
}

/**
 * Modal para enviar/recibir BoomCoins
 * Incluye búsqueda de usuarios por BoomID y validación de montos
 */
export const TransferModal: React.FC<TransferModalProps> = ({ 
  visible, 
  onClose, 
  currentBalance, 
  onTransfer, 
  type 
}) => {
  const { colors, fontScale } = useTheme();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Simulación de usuarios válidos
  const validUsers = [
    'BC7A9F2E8D1C5B40', 'BC4E7D9A2F8C1B56', 'BC8F2A5D7C9E1B34',
    'BC1D6E8A3F7B9C25', 'BC9C3F7A1E5D8B42', 'BC2A8D5E9F1C7B63'
  ];

  const validateUser = (userId: string) => {
    const isValid = validUsers.includes(userId.toUpperCase());
    setIsValidUser(isValid);
    return isValid;
  };

  const formatAmount = (text: string) => {
    const cleaned = text.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return cleaned;
  };

  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount);
    
    if (!recipient) {
      Alert.alert('Error', 'Ingresa el BoomID del destinatario');
      return;
    }
    
    if (!validateUser(recipient)) {
      Alert.alert('Error', 'Usuario no encontrado o BoomID inválido');
      return;
    }
    
    if (!amount || transferAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    
    if (type === 'send' && transferAmount > currentBalance) {
      Alert.alert('Error', 'Saldo insuficiente');
      return;
    }

    setIsProcessing(true);
    startPulseAnimation();

    // Simular procesamiento
    setTimeout(() => {
      onTransfer(transferAmount, recipient);
      setIsProcessing(false);
      
      // Reset form
      setRecipient('');
      setAmount('');
      setIsValidUser(null);
      
      Alert.alert(
        'Transferencia Exitosa',
        `${type === 'send' ? 'Enviaste' : 'Recibiste'} ${transferAmount} BC ${type === 'send' ? 'a' : 'de'} ${recipient}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }, 2000);
  };

  const getUserIcon = () => {
    if (isValidUser === null) return 'person-outline';
    return isValidUser ? 'person-circle' : 'person-remove';
  };

  const getUserIconColor = () => {
    if (isValidUser === null) return colors.textSecondary;
    return isValidUser ? '#4CAF50' : '#F44336';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>
                {type === 'send' ? 'Enviar BoomCoins' : 'Recibir BoomCoins'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Balance Info */}
            <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                Balance Actual
              </Text>
              <Text style={[styles.balanceAmount, { color: colors.text, fontSize: 24 * fontScale }]}>
                {currentBalance.toFixed(2)} BC
              </Text>
            </View>

            {/* Transfer Icon */}
            <Animated.View style={[
              styles.transferIcon, 
              { backgroundColor: colors.accent },
              { transform: [{ scale: pulseAnimation }] }
            ]}>
              <Ionicons 
                name={type === 'send' ? 'arrow-up' : 'arrow-down'} 
                size={32} 
                color="#000" 
              />
            </Animated.View>

            {/* Form */}
            <View style={styles.form}>
              {/* Recipient */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text, fontSize: 14 * fontScale }]}>
                  {type === 'send' ? 'Destinatario (BoomID)' : 'Remitente (BoomID)'}
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: colors.surface, 
                        color: colors.text, 
                        borderColor: isValidUser === false ? '#F44336' : colors.border,
                        fontSize: 16 * fontScale 
                      }
                    ]}
                    placeholder="BC7A9F2E8D1C5B40"
                    placeholderTextColor={colors.textSecondary}
                    value={recipient}
                    onChangeText={(text) => {
                      setRecipient(text.toUpperCase());
                      if (text.length === 16) {
                        validateUser(text);
                      } else {
                        setIsValidUser(null);
                      }
                    }}
                    autoCapitalize="characters"
                    maxLength={16}
                  />
                  <View style={styles.userIcon}>
                    <Ionicons 
                      name={getUserIcon()} 
                      size={20} 
                      color={getUserIconColor()} 
                    />
                  </View>
                </View>
                {isValidUser === false && (
                  <Text style={[styles.errorText, { fontSize: 12 * fontScale }]}>
                    Usuario no encontrado
                  </Text>
                )}
                {isValidUser === true && (
                  <Text style={[styles.successText, { fontSize: 12 * fontScale }]}>
                    Usuario válido ✓
                  </Text>
                )}
              </View>

              {/* Amount */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text, fontSize: 14 * fontScale }]}>
                  Cantidad (BC)
                </Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.surface, 
                      color: colors.text, 
                      borderColor: colors.border,
                      fontSize: 18 * fontScale,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  value={amount}
                  onChangeText={(text) => setAmount(formatAmount(text))}
                  keyboardType="numeric"
                  autoFocus={false}
                  selectionColor={colors.accent}
                />
                {type === 'send' && amount && parseFloat(amount) > currentBalance && (
                  <Text style={[styles.errorText, { fontSize: 12 * fontScale }]}>
                    Saldo insuficiente
                  </Text>
                )}
              </View>

              {/* Quick Amount Buttons (solo para envío) */}
              {type === 'send' && (
                <View style={styles.quickAmounts}>
                  <Text style={[styles.label, { color: colors.text, fontSize: 14 * fontScale }]}>
                    Cantidades rápidas:
                  </Text>
                  <View style={styles.quickAmountButtons}>
                    {[10, 50, 100, currentBalance / 2].map((quickAmount, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.quickAmountButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => setAmount(quickAmount.toFixed(2))}
                      >
                        <Text style={[styles.quickAmountText, { color: colors.text, fontSize: 12 * fontScale }]}>
                          {index === 3 ? '50%' : `${quickAmount} BC`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Transfer Button */}
              <TouchableOpacity
                style={[
                  styles.transferButton, 
                  { 
                    backgroundColor: isProcessing ? colors.textSecondary : colors.accent,
                    opacity: isProcessing ? 0.7 : 1 
                  }
                ]}
                onPress={handleTransfer}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Text style={[styles.transferButtonText, { fontSize: 16 * fontScale }]}>
                    Procesando...
                  </Text>
                ) : (
                  <Text style={[styles.transferButtonText, { fontSize: 16 * fontScale }]}>
                    {type === 'send' ? 'Enviar BoomCoins' : 'Confirmar Recepción'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  transferIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontWeight: '600',
    textAlign: 'left',
  },
  userIcon: {
    position: 'absolute',
    right: 12,
  },
  errorText: {
    color: '#F44336',
    fontWeight: '500',
  },
  successText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  quickAmounts: {
    gap: 8,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickAmountText: {
    fontWeight: '500',
  },
  transferButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  transferButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});