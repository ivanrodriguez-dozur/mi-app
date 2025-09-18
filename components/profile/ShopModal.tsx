import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import { ShopCartItem, useShop } from '../../contexts/ShopContext';

interface ShopModalProps {
  visible: boolean;
  onClose: () => void;
}

type CartItem = ShopCartItem;

/**
 * Modal del carrito de compras
 * Muestra productos agregados con opción de editar cantidades y eliminar
 */
export const ShopModal: React.FC<ShopModalProps> = ({ visible, onClose }) => {
  const { colors, fontScale } = useTheme();
  
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useShop();


  const [paymentMethod, setPaymentMethod] = useState<'cop' | 'boomcoins' | 'mixed'>('cop');
  const [copPercentage, setCopPercentage] = useState(50); // Para pago mixto
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const updateQuantity = (id: string, change: number) => {
    const item = cartItems.find((entry) => entry.id === id);
    if (!item) {
      return;
    }
    updateCartItemQuantity(id, item.quantity + change);
  };

  const removeItem = (id: string) => {
    removeFromCart(id);
  };

  const calculateTotal = () => {
    const totalCOP = cartItems.reduce((total, item) => total + (item.priceCOP * item.quantity), 0);
    const totalBoomCoins = cartItems.reduce((total, item) => total + (item.priceBoomCoins * item.quantity), 0);
    
    if (paymentMethod === 'mixed') {
      return {
        cop: totalCOP * (copPercentage / 100),
        boomcoins: totalBoomCoins * ((100 - copPercentage) / 100)
      };
    }
    
    return paymentMethod === 'cop' ? totalCOP : totalBoomCoins;
  };

  const getDisplayTotal = () => {
    const total = calculateTotal();
    
    if (paymentMethod === 'mixed' && typeof total === 'object') {
      return `$${total.cop.toLocaleString('es-CO')} COP + ${total.boomcoins.toFixed(2)} BC`;
    } else if (typeof total === 'number') {
      return paymentMethod === 'cop' 
        ? `$${total.toLocaleString('es-CO')} COP`
        : `${total.toFixed(2)} BC`;
    }
    return '';
  };

  const handleCheckout = () => {
    const total = calculateTotal();
    
    let message = '';
    if (paymentMethod === 'mixed' && typeof total === 'object') {
      message = `Total Mixto:\n${total.cop.toLocaleString('es-CO')} COP\n${total.boomcoins.toFixed(2)} BC\n\n¿Proceder con el pago?`;
    } else if (typeof total === 'number') {
      const currency = paymentMethod === 'cop' ? 'COP' : 'BC';
      message = `Total: ${total.toLocaleString('es-CO', { 
        minimumFractionDigits: paymentMethod === 'cop' ? 0 : 2 
      })} ${currency}\n\n¿Proceder con el pago?`;
    }
    
    Alert.alert(
      'Confirmar Compra',
      message,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Pagar', 
          style: 'default',
          onPress: () => {
            Alert.alert('¡Compra Exitosa!', 'Tu pedido está siendo procesado');
            clearCart();
            onClose();
          }
        }
      ]
    );
  };

  const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => {
    const [translateX] = useState(new Animated.Value(0));
    const [isSwipeOpen, setIsSwipeOpen] = useState(false);

    const onSwipeGesture = (event: any) => {
      const { translationX, translationY, state } = event.nativeEvent;
      
      // Solo procesar si el movimiento es más horizontal que vertical
      const isHorizontalSwipe = Math.abs(translationX) > Math.abs(translationY) && Math.abs(translationX) > 10;
      
      if (!isHorizontalSwipe && state !== State.END) {
        return; // Permitir scroll vertical
      }
      
      // Actualizar la posición en tiempo real solo para movimientos horizontales
      if (state === State.ACTIVE && isHorizontalSwipe) {
        // Limitar el deslizamiento entre -100 y 20
        const clampedTranslation = Math.max(-100, Math.min(20, translationX));
        translateX.setValue(clampedTranslation);
        
        // Mostrar botón de eliminar cuando se desliza más de -50
        if (translationX < -50 && !isSwipeOpen) {
          setIsSwipeOpen(true);
        } else if (translationX > -20 && isSwipeOpen) {
          setIsSwipeOpen(false);
        }
      }
      
      // Al finalizar el gesto
      if (state === State.END) {
        if (translationX < -60 && isHorizontalSwipe) {
          // Mantener abierto
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
          setIsSwipeOpen(true);
        } else {
          // Volver a la posición original
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setIsSwipeOpen(false);
        }
      }
    };

    const closeSwipe = () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      setIsSwipeOpen(false);
    };

    const handleDelete = () => {
      removeItem(item.id);
      closeSwipe();
    };

    return (
      <GestureHandlerRootView style={styles.gestureContainer}>
        <View style={[styles.cartItemWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Fondo de eliminar solo con ícono */}
          <View style={styles.deleteBackground}>
            <Ionicons name="trash-outline" size={28} color="#FFF" />
          </View>
          
          {/* Contenido del item con animación */}
          <PanGestureHandler 
            onGestureEvent={onSwipeGesture} 
            onHandlerStateChange={onSwipeGesture}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-20, 20]}
            shouldCancelWhenOutside={true}
          >
            <Animated.View 
              style={[
                styles.cartItem, 
                { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  transform: [{ translateX }]
                }
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.productImage} />
              
              {/* Información del producto (sin precios) */}
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text, fontSize: 16 * fontScale }]}>
                  {item.name}
                </Text>
                <Text style={[styles.productDescription, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                  {item.description}
                </Text>
                <Text style={[styles.productSize, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                  Talla: {item.size}
                </Text>
              </View>

              {/* Precios en el lado derecho */}
              <View style={styles.rightSection}>
                <View style={styles.priceContainer}>
                  <View style={styles.priceRow}>
                    <Ionicons name="cash-outline" size={14} color="#4CAF50" />
                    <Text style={[styles.price, { color: colors.text, fontSize: 12 * fontScale }]}>
                      ${item.priceCOP.toLocaleString('es-CO')}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Ionicons name="diamond" size={14} color="#000" />
                    <Text style={[styles.price, { color: colors.text, fontSize: 12 * fontScale }]}>
                      {item.priceBoomCoins.toFixed(2)} BC
                    </Text>
                  </View>
                </View>

                {/* Controles de cantidad */}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Ionicons name="remove" size={14} color={colors.text} />
                  </TouchableOpacity>
                  
                  <Text style={[styles.quantity, { color: colors.text, fontSize: 14 * fontScale }]}>
                    {item.quantity}
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Ionicons name="add" size={14} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </PanGestureHandler>
          
          {/* Botón de eliminar flotante */}
          {isSwipeOpen && (
            <TouchableOpacity 
              style={styles.deleteFloatingButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </GestureHandlerRootView>
    );
  };

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
            <View style={styles.headerLeft}>
              <Ionicons name="bag-outline" size={24} color={colors.text} />
              <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>
                Carrito de Compras
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Payment Method Toggle */}
          <View style={styles.paymentToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { 
                  backgroundColor: paymentMethod === 'cop' ? colors.accent : colors.surface,
                  borderColor: colors.border 
                }
              ]}
              onPress={() => setPaymentMethod('cop')}
            >
              <Ionicons 
                name="cash-outline" 
                size={20} 
                color={paymentMethod === 'cop' ? '#000' : colors.text} 
              />
              <Text style={[
                styles.toggleText, 
                { 
                  color: paymentMethod === 'cop' ? '#000' : colors.text,
                  fontSize: 14 * fontScale 
                }
              ]}>
                Pesos COP
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { 
                  backgroundColor: paymentMethod === 'boomcoins' ? colors.accent : colors.surface,
                  borderColor: colors.border 
                }
              ]}
              onPress={() => setPaymentMethod('boomcoins')}
            >
              <Ionicons 
                name="diamond" 
                size={20} 
                color={paymentMethod === 'boomcoins' ? '#000' : '#000'} 
              />
              <Text style={[
                styles.toggleText, 
                { 
                  color: paymentMethod === 'boomcoins' ? '#000' : colors.text,
                  fontSize: 14 * fontScale 
                }
              ]}>
                BoomCoins
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { 
                  backgroundColor: paymentMethod === 'mixed' ? colors.accent : colors.surface,
                  borderColor: colors.border 
                }
              ]}
              onPress={() => setPaymentMethod('mixed')}
            >
              <Ionicons 
                name="swap-horizontal" 
                size={20} 
                color={paymentMethod === 'mixed' ? '#000' : colors.text} 
              />
              <Text style={[
                styles.toggleText, 
                { 
                  color: paymentMethod === 'mixed' ? '#000' : colors.text,
                  fontSize: 14 * fontScale 
                }
              ]}>
                Mixto
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Mix Slider */}
          {paymentMethod === 'mixed' && (
            <View style={[styles.mixedPaymentContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.mixedPaymentTitle, { color: colors.text, fontSize: 15 * fontScale }]}>
                Ajustar Proporción de Pago
              </Text>
              
              <View style={styles.sliderContainer}>
                <View style={styles.sliderLabels}>
                  <Text style={[styles.sliderLabel, { color: colors.text, fontSize: 13 * fontScale }]}>
                    COP: {copPercentage}%
                  </Text>
                  <Text style={[styles.sliderLabel, { color: colors.text, fontSize: 13 * fontScale }]}>
                    BC: {100 - copPercentage}%
                  </Text>
                </View>
                
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={copPercentage}
                  onValueChange={setCopPercentage}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor={colors.border}
                  step={5}
                  onSlidingStart={() => {
                    setScrollEnabled(false);
                  }}
                  onSlidingComplete={() => {
                    setScrollEnabled(true);
                  }}
                />
                
                <View style={styles.mixedPreview}>
                  <View style={styles.previewRow}>
                    <Ionicons name="cash-outline" size={14} color="#4CAF50" />
                    <Text style={[styles.previewText, { color: colors.text, fontSize: 11 * fontScale }]}>
                      ${((calculateTotal() as any)?.cop || 0).toLocaleString('es-CO')} COP
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Ionicons name="diamond" size={14} color="#000" />
                    <Text style={[styles.previewText, { color: colors.text, fontSize: 11 * fontScale }]}>
                      {((calculateTotal() as any)?.boomcoins || 0).toFixed(2)} BC
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Cart Items */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
          >
            {cartItems.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons name="bag-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>
                  Tu carrito está vacío
                </Text>
              </View>
            ) : (
              cartItems.map((item) => (
                <CartItemComponent key={item.id} item={item} />
              ))
            )}
          </ScrollView>

          {/* Footer */}
          {cartItems.length > 0 && (
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={styles.totalContainer}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
                  Total:
                </Text>
                <Text style={[styles.totalAmount, { color: colors.text, fontSize: 24 * fontScale }]}>
                  {getDisplayTotal()}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.checkoutButton, { backgroundColor: colors.accent }]}
                onPress={handleCheckout}
              >
                <Ionicons name="card-outline" size={20} color="#000" />
                <Text style={[styles.checkoutText, { fontSize: 16 * fontScale }]}>
                  Proceder al Pago
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  paymentToggle: {
    flexDirection: 'row',
    margin: 20,
    marginBottom: 10,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  toggleText: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    zIndex: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productDescription: {
    fontWeight: '400',
    lineHeight: 16,
  },
  productSize: {
    fontWeight: '500',
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  priceContainer: {
    gap: 4,
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontWeight: '600',
    fontSize: 11,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quantity: {
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    padding: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontWeight: '600',
  },
  totalAmount: {
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutText: {
    color: '#000',
    fontWeight: 'bold',
  },
  gestureContainer: {
    width: '100%',
  },
  cartItemWrapper: {
    position: 'relative',
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteFloatingButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFF',
  },
  mixedPaymentContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  mixedPaymentTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 15,
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sliderLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  slider: {
    width: '100%',
    height: 30,
    marginVertical: 4,
  },
  mixedPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewText: {
    fontWeight: '500',
  },
});