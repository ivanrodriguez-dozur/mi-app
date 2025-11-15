import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState, useEffect } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { AddCardModal } from './AddCardModal';
import { TransferModal } from './TransferModal';
import { WalletSetupModal } from './WalletSetupModal';

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
 * Integrado con blockchain Polygon para transacciones reales
 * Funcionalidades:
 * - Mostrar balance real de tokens BMC en Polygon
 * - Enviar/recibir tokens BMC on-chain
 * - Dirección de wallet real en Polygon
 * - Configuración y backup de wallet
 */
export const WalletModal: React.FC<WalletModalProps> = ({ visible, onClose }) => {
  const { colors, fontScale } = useTheme();
  const {
    walletAddress,
    isWalletLoaded,
    tokenBalance,
    maticBalance,
    tokenSymbol,
    refreshBalances,
    getMnemonic,
  } = useBlockchain();
  
  // Estado del wallet setup
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Métodos de pago del usuario
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
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

  // Actualizar balance cuando el modal se abre
  useEffect(() => {
    if (visible && isWalletLoaded && refreshBalances) {
      refreshBalances();
    }
  }, [visible, isWalletLoaded, refreshBalances]);

  // Mostrar setup si no hay wallet
  useEffect(() => {
    if (visible && !isWalletLoaded) {
      setShowWalletSetup(true);
    }
  }, [visible, isWalletLoaded]);

  const handleAddCard = (cardData: any) => {
    setPaymentMethods([...paymentMethods, cardData]);
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalances();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewSeedPhrase = async () => {
    Alert.alert(
      'Advertencia de Seguridad',
      'Tu frase semilla es la clave de tu wallet. Nunca la compartas con nadie. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ver Frase',
          style: 'destructive',
          onPress: async () => {
            try {
              const mnemonic = await getMnemonic();
              if (mnemonic) {
                Alert.alert(
                  'Tu Frase Semilla',
                  mnemonic,
                  [
                    {
                      text: 'Copiar',
                      onPress: async () => {
                        await Clipboard.setStringAsync(mnemonic);
                        Alert.alert('¡Copiado!', 'Frase semilla copiada al portapapeles');
                      },
                    },
                    { text: 'Cerrar', style: 'cancel' },
                  ]
                );
              } else {
                Alert.alert('Error', 'No se pudo obtener la frase semilla');
              }
            } finally {
              // Do nothing
            }
          },
        },
      ]
    );
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const boomCoinsBalance = parseFloat(tokenBalance || '0');

  const walletOptions = [
    {
      id: 'viewSeed',
      title: 'Ver Frase Semilla',
      description: 'Backup de tu wallet',
      icon: 'key-outline',
      color: '#EF4444',
      onPress: handleViewSeedPhrase
    },
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
      title: `Enviar ${tokenSymbol}`,
      description: 'Transferir a otras direcciones',
      icon: 'arrow-up-circle-outline',
      color: '#10B981',
      onPress: () => {
        if (!isWalletLoaded) {
          Alert.alert('Error', 'Primero debes configurar tu wallet');
          return;
        }
        setTransferType('send');
        setShowTransfer(true);
      }
    },
    {
      id: 'receiveCoins',
      title: `Recibir ${tokenSymbol}`,
      description: 'Mostrar tu dirección',
      icon: 'arrow-down-circle-outline',
      color: '#F59E0B',
      onPress: () => {
        if (!isWalletLoaded || !walletAddress) {
          Alert.alert('Error', 'Primero debes configurar tu wallet');
          return;
        }
        Alert.alert(
          'Tu Dirección de Wallet',
          walletAddress,
          [
            {
              text: 'Copiar',
              onPress: async () => {
                await Clipboard.setStringAsync(walletAddress);
                Alert.alert('¡Copiado!', 'Dirección copiada al portapapeles');
              },
            },
            { text: 'Cerrar', style: 'cancel' },
          ]
        );
      }
    },
    {
      id: 'refresh',
      title: 'Actualizar Balance',
      description: 'Refrescar saldo de blockchain',
      icon: 'refresh-outline',
      color: '#8B5CF6',
      onPress: handleRefreshBalance
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
              <Ionicons name="close" size={24} color={colors.text || '#1e293b'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* BoomCoins Balance Card */}
            <View style={[styles.balanceCard, { backgroundColor: colors.accent || '#CCFF00' }]}>
              <View style={styles.balanceHeader}>
                <Ionicons name="diamond" size={28} color="#000000" />
                <Text style={[styles.balanceTitle, { fontSize: 16 * fontScale }]}>
                  {tokenSymbol} Balance (Polygon)
                </Text>
                {isRefreshing && <ActivityIndicator size="small" color="#000" style={{ marginLeft: 8 }} />}
              </View>
              <Text style={[styles.balanceAmount, { fontSize: 32 * fontScale }]}>
                {boomCoinsBalance.toLocaleString('es-ES', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 6 
                })} {tokenSymbol}
              </Text>
              <View style={styles.boomIdContainer}>
                <Text style={[styles.boomIdLabel, { fontSize: 12 * fontScale }]}>
                  Tu Dirección Polygon:
                </Text>
                <View style={styles.boomIdRow}>
                  <Text style={[styles.boomId, { fontSize: 12 * fontScale }]}>
                    {walletAddress ? formatAddress(walletAddress) : 'No configurada'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={async () => {
                      if (walletAddress) {
                        await Clipboard.setStringAsync(walletAddress);
                        Alert.alert('¡Copiado!', 'Dirección copiada al portapapeles', [
                          { text: 'OK', style: 'default' }
                        ]);
                      }
                    }}
                  >
                    <Ionicons name="copy-outline" size={16} color="#000000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* MATIC Balance for Gas */}
            {isWalletLoaded && (
              <View style={[styles.gasBalanceCard, { backgroundColor: colors.surface || '#f8f9fa' }]}>
                <View style={styles.gasBalanceRow}>
                  <Ionicons name="flash" size={20} color={colors.text || '#1e293b'} />
                  <Text style={[styles.gasBalanceLabel, { color: colors.textSecondary || '#64748b', fontSize: 14 * fontScale }]}>
                    Balance MATIC (para gas):
                  </Text>
                  <Text style={[styles.gasBalanceAmount, { color: colors.text || '#1e293b', fontSize: 14 * fontScale }]}>
                    {parseFloat(maticBalance).toFixed(4)} MATIC
                  </Text>
                </View>
              </View>
            )}

            {/* Payment Methods */}
            {paymentMethods.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
                  Métodos de Pago Adicionales
                </Text>
                
            {paymentMethods.map((method) => (
              <View key={method.id} style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
              </View>
            ))}
              </>
            )}

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
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary || '#64748b'} />
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
        type={transferType}
      />

      {/* Wallet Setup Modal */}
      <WalletSetupModal
        visible={showWalletSetup}
        onClose={() => setShowWalletSetup(false)}
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
  gasBalanceCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  gasBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gasBalanceLabel: {
    flex: 1,
  },
  gasBalanceAmount: {
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});