import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Animated, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  onAddCard: (cardData: any) => void;
}

/**
 * Modal para agregar nuevas tarjetas de crédito/débito
 * Incluye animación de tarjeta y validación básica
 */
export const AddCardModal: React.FC<AddCardModalProps> = ({ visible, onClose, onAddCard }) => {
  const { colors, fontScale } = useTheme();
  
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiryDate: '',
    cvv: '',
    type: 'credit' as 'credit' | 'debit'
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = new Animated.Value(0);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.slice(0, 19); // Máximo 16 dígitos + 3 espacios
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);
    
    Animated.timing(flipAnimation, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  const handleSave = () => {
    if (cardData.number.length < 19 || !cardData.name || !cardData.expiryDate || !cardData.cvv) {
      alert('Por favor completa todos los campos');
      return;
    }

    onAddCard({
      ...cardData,
      id: Date.now().toString(),
      cardNumber: '**** **** **** ' + cardData.number.slice(-4),
    });

    // Reset form
    setCardData({
      number: '',
      name: '',
      expiryDate: '',
      cvv: '',
      type: 'credit'
    });
    
    onClose();
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
                Agregar Tarjeta
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Animated Card Preview */}
              <View style={styles.cardContainer}>
                <TouchableOpacity onPress={flipCard} activeOpacity={0.8}>
                  <View style={styles.cardWrapper}>
                    {/* Front of Card */}
                    <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle, { backgroundColor: cardData.type === 'credit' ? '#1a1a2e' : '#16213e' }]}>
                      <View style={styles.cardHeader}>
                        <Ionicons 
                          name={cardData.type === 'credit' ? "card" : "card-outline"} 
                          size={32} 
                        color={cardData.type === 'credit' ? '#CCFF00' : '#4FC3F7'} 
                      />
                      <Text style={[styles.cardType, { fontSize: 12 * fontScale }]}>
                        {cardData.type === 'credit' ? 'CRÉDITO' : 'DÉBITO'}
                      </Text>
                    </View>
                    
                    <Text style={[styles.cardNumber, { fontSize: 18 * fontScale }]}>
                      {cardData.number || '**** **** **** ****'}
                    </Text>
                    
                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={[styles.cardLabel, { fontSize: 10 * fontScale }]}>TITULAR</Text>
                        <Text style={[styles.cardName, { fontSize: 12 * fontScale }]}>
                          {cardData.name || 'NOMBRE APELLIDO'}
                        </Text>
                      </View>
                      <View>
                        <Text style={[styles.cardLabel, { fontSize: 10 * fontScale }]}>VENCE</Text>
                        <Text style={[styles.cardExpiry, { fontSize: 12 * fontScale }]}>
                          {cardData.expiryDate || 'MM/AA'}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>

                  {/* Back of Card */}
                  <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle, { backgroundColor: cardData.type === 'credit' ? '#1a1a2e' : '#16213e' }]}>
                    <View style={styles.magneticStripe} />
                    <View style={styles.cvvContainer}>
                      <Text style={[styles.cvvLabel, { fontSize: 10 * fontScale }]}>CVV</Text>
                      <View style={styles.cvvBox}>
                        <Text style={[styles.cvvText, { fontSize: 12 * fontScale }]}>
                          {cardData.cvv || '***'}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Card Type */}
              <View style={styles.cardTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { backgroundColor: cardData.type === 'credit' ? colors.accent : colors.card },
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setCardData({...cardData, type: 'credit'})}
                >
                  <Text style={[styles.typeText, { 
                    color: cardData.type === 'credit' ? '#000' : colors.text,
                    fontSize: 14 * fontScale 
                  }]}>
                    Crédito
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { backgroundColor: cardData.type === 'debit' ? colors.accent : colors.card },
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setCardData({...cardData, type: 'debit'})}
                >
                  <Text style={[styles.typeText, { 
                    color: cardData.type === 'debit' ? '#000' : colors.text,
                    fontSize: 14 * fontScale 
                  }]}>
                    Débito
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Card Number */}
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Número de tarjeta"
                placeholderTextColor={colors.textSecondary}
                value={cardData.number}
                onChangeText={(text) => setCardData({...cardData, number: formatCardNumber(text)})}
                keyboardType="numeric"
                maxLength={19}
              />

              {/* Card Name */}
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Nombre del titular"
                placeholderTextColor={colors.textSecondary}
                value={cardData.name}
                onChangeText={(text) => setCardData({...cardData, name: text.toUpperCase()})}
                autoCapitalize="characters"
              />

              {/* Expiry and CVV Row */}
              <View style={styles.row}>
                <TextInput
                  style={[styles.inputHalf, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="MM/AA"
                  placeholderTextColor={colors.textSecondary}
                  value={cardData.expiryDate}
                  onChangeText={(text) => setCardData({...cardData, expiryDate: formatExpiryDate(text)})}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.inputHalf, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="CVV"
                  placeholderTextColor={colors.textSecondary}
                  value={cardData.cvv}
                  onChangeText={(text) => setCardData({...cardData, cvv: text})}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  onFocus={() => !isFlipped && flipCard()}
                  onBlur={() => isFlipped && flipCard()}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.accent }]}
                onPress={handleSave}
              >
                <Text style={[styles.saveButtonText, { fontSize: 16 * fontScale }]}>
                  Agregar Tarjeta
                </Text>
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
  cardContainer: {
    height: 200,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: 300,
    height: 180,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    justifyContent: 'space-between',
  },
  cardBack: {
    paddingTop: 40,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardNumber: {
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#cccccc',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  cardName: {
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardExpiry: {
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  magneticStripe: {
    height: 40,
    backgroundColor: '#000',
    marginBottom: 20,
  },
  cvvContainer: {
    alignItems: 'flex-end',
  },
  cvvLabel: {
    color: '#ccc',
    marginBottom: 5,
  },
  cvvBox: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    minWidth: 50,
  },
  cvvText: {
    color: '#000',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  typeText: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});