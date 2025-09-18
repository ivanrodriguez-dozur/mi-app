import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AddCardModal } from './AddCardModal';
import { TransferModal } from './TransferModal';

interface WalletModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'boomcoins';
  cardNumber?: string;
  cardName?: string;
  balance?: number;
  isDefault?: boolean;
}

/**
 * Modal del Wallet con gestión de métodos de pago y BoomCoins
 * Funcionalidades:
 * - Agregar/editar tarjetas de crédito/débito
 * - Mostrar balance de BoomCoins
 * - Enviar/recibir BoomCoins
 * - ID criptográfico único del usuario
 */
export const WalletModal: React.FC<WalletModalProps> = ({ visible, onClose }) => {
  const { colors, fontScale } = useTheme();
  
  // Estado del usuario y wallet
  const [userBoomId] = useState('BC7A9F2E8D1C5B40'); // ID criptográfico único
  const [boomCoinsBalance, setBoomCoinsBalance] = useState(1247.50);
  
  // Métodos de pago del usuario
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'boomcoins',
      balance: 1247.50,
      isDefault: true
    },
    {
      id: '2',
      type: 'credit',
      cardNumber: '**** **** **** 4521',
      cardName: 'DOZURTV CARD',
      isDefault: false
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferType, setTransferType] = useState<'send' | 'receive'>('send');

  const handleAddCard = (cardData: any) => {
    setPaymentMethods([...paymentMethods, cardData]);
  };

  const handleTransfer = (amount: number, recipient: string) => {
    if (transferType === 'send') {
      setBoomCoinsBalance(boomCoinsBalance - amount);
    } else {
      setBoomCoinsBalance(boomCoinsBalance + amount);
    }
  };

  const walletOptions = [
    {
      id: 'addPayment',
      title: 'Agregar Método de Pago',
      description: 'Tarjeta de crédito/débito',
      icon: 'card-outline',
      color: '#4F46E5',
      onPress: () => setShowAddCard(true)
    },
    {
      id: 'sendCoins',
      title: 'Enviar BoomCoins',
      description: 'Transferir a otros usuarios',
      icon: 'arrow-up-circle-outline',
      color: '#10B981',
      onPress: () => {
        setTransferType('send');
        setShowTransfer(true);
      }
    },
    {
      id: 'receiveCoins',
      title: 'Recibir BoomCoins',
      description: 'Recibir de otros usuarios',
      icon: 'arrow-down-circle-outline',
      color: '#F59E0B',
      onPress: () => {
        setTransferType('receive');
        setShowTransfer(true);
      }
    },
    {
      id: 'history',
      title: 'Historial',
      description: 'Ver transacciones',
      icon: 'time-outline',
      color: '#8B5CF6',
      onPress: () => console.log('Mostrar historial')
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, 0.5)` }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>
              Mi Wallet
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* BoomCoins Balance Card */}
            <View style={[styles.balanceCard, { backgroundColor: colors.accent }]}>
              <View style={styles.balanceHeader}>
                <Ionicons name="diamond" size={28} color="#000" />
                <Text style={[styles.balanceTitle, { fontSize: 16 * fontScale }]}>
                  BoomCoins Balance
                </Text>
              </View>
              <Text style={[styles.balanceAmount, { fontSize: 32 * fontScale }]}>
                {boomCoinsBalance.toLocaleString('es-ES', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} BC
              </Text>
              <View style={styles.boomIdContainer}>
                <Text style={[styles.boomIdLabel, { fontSize: 12 * fontScale }]}>
                  Tu BoomID:
                </Text>
                <View style={styles.boomIdRow}>
                  <Text style={[styles.boomId, { fontSize: 14 * fontScale }]}>
                    {userBoomId}
                  </Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={async () => {
                      await Clipboard.setStringAsync(userBoomId);
                      Alert.alert('¡Copiado!', 'Tu BoomID ha sido copiado al portapapeles', [
                        { text: 'OK', style: 'default' }
                      ]);
                    }}
                  >
                    <Ionicons name="copy-outline" size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Payment Methods */}
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
              Métodos de Pago
            </Text>
            
            {paymentMethods.map((method) => (
              <View key={method.id} style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {method.type === 'boomcoins' ? (
                  <>
                    <View style={styles.cardHeader}>
                      <Ionicons name="diamond" size={24} color="#000" />
                      <Text style={[styles.cardType, { color: colors.text, fontSize: 16 * fontScale }]}>
                        BoomCoins Wallet
                      </Text>
                      {method.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.accent }]}>
                          <Text style={[styles.defaultText, { fontSize: 10 * fontScale }]}>Principal</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.cardBalance, { color: colors.text, fontSize: 20 * fontScale }]}>
                      {method.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 })} BC
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={styles.cardHeader}>
                      <Ionicons 
                        name={method.type === 'credit' ? "card" : "card-outline"} 
                        size={24} 
                        color={method.type === 'credit' ? '#FFD700' : '#C0C0C0'} 
                      />
                      <Text style={[styles.cardType, { color: colors.text, fontSize: 16 * fontScale }]}>
                        {method.type === 'credit' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}
                      </Text>
                      {method.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.accent }]}>
                          <Text style={[styles.defaultText, { fontSize: 10 * fontScale }]}>Principal</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.cardNumber, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
                      {method.cardNumber}
                    </Text>
                    <Text style={[styles.cardName, { color: colors.text, fontSize: 12 * fontScale }]}>
                      {method.cardName}
                    </Text>
                  </>
                )}
              </View>
            ))}

            {/* Wallet Options */}
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
              Acciones
            </Text>
            
            {walletOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={option.onPress}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                    {option.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Add Card Modal */}
      <AddCardModal
        visible={showAddCard}
        onClose={() => setShowAddCard(false)}
        onAddCard={handleAddCard}
      />

      {/* Transfer Modal */}
      <TransferModal
        visible={showTransfer}
        onClose={() => setShowTransfer(false)}
        currentBalance={boomCoinsBalance}
        onTransfer={handleTransfer}
        type={transferType}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
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
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#000',
  },
  balanceAmount: {
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  boomIdContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 8,
  },
  boomIdLabel: {
    color: '#000',
    fontWeight: '500',
  },
  boomId: {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
  },
  boomIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  paymentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardType: {
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  defaultBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultText: {
    color: '#000',
    fontWeight: 'bold',
  },
  cardBalance: {
    fontWeight: 'bold',
  },
  cardNumber: {
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  cardName: {
    fontWeight: '500',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontWeight: '400',
  },
});