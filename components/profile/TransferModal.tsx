import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState, useEffect } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBlockchain } from '../../contexts/BlockchainContext';

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
  type: 'send' | 'receive';
}

/**
 * Modal para enviar BoomCoins en Polygon blockchain
 * Valida direcciones Ethereum y ejecuta transacciones on-chain
 */
export const TransferModal: React.FC<TransferModalProps> = ({ 
  visible, 
  onClose, 
  currentBalance, 
  type 
}) => {
  const { colors, fontScale } = useTheme();
  const { transferTokens, isValidAddress, estimateGas, tokenSymbol, refreshBalances } = useBlockchain();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isValidAddress_, setIsValidAddress_] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Validar dirección Ethereum
  const validateAddress = (address: string) => {
    if (!address) {
      setIsValidAddress_(null);
      return false;
    }
    const isValid = isValidAddress(address);
    setIsValidAddress_(isValid);
    return isValid;
  };

  // Estimar gas cuando cambian recipient o amount
  useEffect(() => {
    if (type === 'send' && recipient && amount && isValidAddress_) {
      const estimateGasCost = async () => {
        setIsEstimating(true);
        try {
          const estimate = await estimateGas(recipient, amount);
          setGasEstimate(estimate.estimatedCost);
        } catch {
          setGasEstimate(null);
        } finally {
          setIsEstimating(false);
        }
      };
      const timeoutId = setTimeout(estimateGasCost, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setGasEstimate(null);
    }
  }, [recipient, amount, isValidAddress_, type, estimateGas]);

  const formatAmount = (text: string) => {
    const cleaned = text.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 6) {
      return parts[0] + '.' + parts[1].slice(0, 6);
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
      Alert.alert('Error', 'Ingresa la dirección del destinatario');
      return;
    }
    
    if (!validateAddress(recipient)) {
      Alert.alert('Error', 'Dirección inválida. Debe ser una dirección Ethereum válida (0x...)');
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

    try {
      const result = await transferTokens(recipient, amount);
      
      // Esperar un poco para que se actualice el balance
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refreshBalances();
      
      // Reset form
      setRecipient('');
      setAmount('');
      setIsValidAddress_(null);
      setGasEstimate(null);
      
      Alert.alert(
        '¡Transferencia Exitosa!',
        `Se enviaron ${transferAmount} ${tokenSymbol} a ${recipient.substring(0, 6)}...${recipient.substring(recipient.length - 4)}\n\nHash de transacción: ${result.hash.substring(0, 10)}...`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Error en la Transferencia', error.message || 'No se pudo completar la transferencia');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAddressIcon = () => {
    if (isValidAddress_ === null) return 'wallet-outline';
    return isValidAddress_ ? 'checkmark-circle' : 'close-circle';
  };

  const getAddressIconColor = () => {
    if (isValidAddress_ === null) return colors.textSecondary;
    return isValidAddress_ ? '#4CAF50' : '#F44336';
  };

  // Solo mostrar para envío, no para recepción
  if (type === 'receive') {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>
                Recibir {tokenSymbol}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
                Para recibir {tokenSymbol}, comparte tu dirección de wallet desde el menú principal de la wallet.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

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
                Enviar {tokenSymbol}
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
                  Dirección del Destinatario
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: colors.surface, 
                        color: colors.text, 
                        borderColor: isValidAddress_ === false ? '#F44336' : colors.border,
                        fontSize: 12 * fontScale,
                        fontFamily: 'monospace',
                      }
                    ]}
                    placeholder="0x..."
                    placeholderTextColor={colors.textSecondary}
                    value={recipient}
                    onChangeText={(text) => {
                      setRecipient(text);
                      validateAddress(text);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <View style={styles.userIcon}>
                    <Ionicons 
                      name={getAddressIcon()} 
                      size={20} 
                      color={getAddressIconColor()} 
                    />
                  </View>
                </View>
                {isValidAddress_ === false && (
                  <Text style={[styles.errorText, { fontSize: 12 * fontScale }]}>
                    Dirección inválida
                  </Text>
                )}
                {isValidAddress_ === true && (
                  <Text style={[styles.successText, { fontSize: 12 * fontScale }]}>
                    Dirección válida ✓
                  </Text>
                )}
              </View>

              {/* Amount */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text, fontSize: 14 * fontScale }]}>
                  Cantidad ({tokenSymbol})
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
                {amount && parseFloat(amount) > currentBalance && (
                  <Text style={[styles.errorText, { fontSize: 12 * fontScale }]}>
                    Saldo insuficiente
                  </Text>
                )}
              </View>

              {/* Gas Estimate */}
              {gasEstimate && (
                <View style={[styles.gasEstimateBox, { backgroundColor: colors.surface }]}>
                  <Ionicons name="flash" size={16} color={colors.textSecondary} />
                  <Text style={[styles.gasEstimateText, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                    Costo estimado de gas: ~{parseFloat(gasEstimate).toFixed(6)} MATIC
                  </Text>
                </View>
              )}

              {isEstimating && (
                <View style={[styles.gasEstimateBox, { backgroundColor: colors.surface }]}>
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                  <Text style={[styles.gasEstimateText, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                    Estimando gas...
                  </Text>
                </View>
              )}

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                <Text style={[styles.label, { color: colors.text, fontSize: 14 * fontScale }]}>
                  Cantidades rápidas:
                </Text>
                <View style={styles.quickAmountButtons}>
                  {[10, 50, 100, currentBalance / 2].map((quickAmount, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.quickAmountButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => setAmount(Math.min(quickAmount, currentBalance).toFixed(2))}
                    >
                      <Text style={[styles.quickAmountText, { color: colors.text, fontSize: 12 * fontScale }]}>
                        {index === 3 ? '50%' : `${quickAmount}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

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
                  <>
                    <ActivityIndicator size="small" color="#000" />
                    <Text style={[styles.transferButtonText, { fontSize: 16 * fontScale, marginLeft: 8 }]}>
                      Enviando transacción...
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.transferButtonText, { fontSize: 16 * fontScale }]}>
                    Enviar {tokenSymbol}
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
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  transferButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  gasEstimateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  gasEstimateText: {
    flex: 1,
  },
  infoText: {
    textAlign: 'center',
    padding: 20,
    lineHeight: 22,
  },
});