import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Pressable,
  GestureResponderEvent,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Easing,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useShop } from '../../contexts/ShopContext';

const { height, width } = Dimensions.get('window');
const DOUBLE_TAP_DELAY = 260;
const TAP_HEART_SIZE = 96;
const ENERGY_MAX = 1000;

const COMMENT_COLORS = {
  sheet: '#121212',
  text: '#FFFFFF',
  secondaryText: '#A6A6A6',
  divider: '#1F1F1F',
  inputBackground: '#1B1B1B',
};

const ENERGY_GAINS = {
  like: 140,
  doubleTap: 180,
  commentSend: 220,
  commentOpen: 90,
  share: 160,
  productOpen: 130,
  cart: 260,
};

type BoomProduct = {
  id: string;
  image: string;
  name: string;
  price: number;
};

type BoomItem = {
  id: string;
  user: string;
  avatar: string;
  uri: string;
  likes: number;
  comments: number;
  description: string;
  product?: BoomProduct;
};

type FloatingHeart = {
  id: number;
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
  translateY: Animated.Value;
};

type CommentItem = {
  id: string;
  user: string;
  avatar: string;
  message: string;
  likes: number;
  liked: boolean;
  timestamp: string;
};

const USERS = [
  { name: 'Valery', avatar: 'https://randomuser.me/api/portraits/women/71.jpg' },
  { name: 'Diego', avatar: 'https://randomuser.me/api/portraits/men/54.jpg' },
  { name: 'Luz', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { name: 'Mateo', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
];

const MEDIA = [
  'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1444492696363-332accfd8e5d?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1080&q=80',
];

const DESCRIPTIONS = [
  'Boom en la cancha con el equipo completo.',
  'Noches de futsal y buenas vibras.',
  'Entrenamiento listo para el proximo torneo.',
  'Highlights del ultimo partido en casa.',
  'Detalles tecnicos para subir tu nivel.',
];

const PRODUCTS = [
  { image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=240&q=80', name: 'Boom Hoodie', price: 59 },
  { image: 'https://images.unsplash.com/photo-1511558553470-0c0d4f4f9be4?auto=format&fit=crop&w=240&q=80', name: 'Fuego Jersey', price: 72 },
  { image: 'https://images.unsplash.com/photo-1617957743090-630e82f90b5f?auto=format&fit=crop&w=240&q=80', name: 'Street Cap', price: 34 },
];

const COMMENTERS = [
  { name: 'Carla', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Javier', avatar: 'https://randomuser.me/api/portraits/men/18.jpg' },
  { name: 'Sandra', avatar: 'https://randomuser.me/api/portraits/women/21.jpg' },
  { name: 'Bruno', avatar: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { name: 'Gaby', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
  { name: 'Hector', avatar: 'https://randomuser.me/api/portraits/men/76.jpg' },
];

const COMMENT_MESSAGES = [
  'Ese control orientado estuvo brutal, boom total!',
  'Necesito esa camiseta wow',
  'Que manera de definir, crack!',
  'Se nota la intensidad, sigan asi!',
  'Boom tras boom, que nivel!',
  'La edicion quedo muy pro.',
  'Esto me motivo para ir a entrenar ya mismo.',
  'La defensa quedo sembrada wow',
];

const COMMENT_TIMESTAMPS = ['hace 5 min', 'hace 12 min', 'hace 1 h', 'hace 3 h', 'ayer', 'hace 2 dias'];

function createBoomItem(index: number): BoomItem {
  const user = USERS[index % USERS.length];
  const media = MEDIA[index % MEDIA.length];
  const description = DESCRIPTIONS[index % DESCRIPTIONS.length];
  const baseLikes = 240 + ((index * 73) % 860);
  const includeProduct = index % 3 === 0;
  const productSource = PRODUCTS[index % PRODUCTS.length];

  const product = includeProduct
    ? {
        id: 'product-' + index,
        image: productSource.image,
        name: productSource.name,
        price: productSource.price + (index % 6) * 3,
      }
    : undefined;

  return {
    id: 'boom-' + index,
    user: user.name,
    avatar: user.avatar,
    uri: media,
    likes: baseLikes,
    comments: Math.floor(baseLikes / 6),
    description,
    product,
  };
}

function createBoomBatch(start: number, count: number) {
  return Array.from({ length: count }, (_, offset) => createBoomItem(start + offset));
}

function createComments(seed: number, count = 12): CommentItem[] {
  const comments: CommentItem[] = [];
  for (let i = 0; i < count; i++) {
    const commenter = COMMENTERS[(seed + i) % COMMENTERS.length];
    const message = COMMENT_MESSAGES[(seed + i) % COMMENT_MESSAGES.length];
    const likes = 2 + ((seed + i * 7) % 120);
    const timestamp = COMMENT_TIMESTAMPS[(seed + i) % COMMENT_TIMESTAMPS.length];
    comments.push({
      id: `comment-${seed}-${i}`,
      user: commenter.name,
      avatar: commenter.avatar,
      message,
      likes,
      liked: false,
      timestamp,
    });
  }
  return comments;
}

type CommentsModalProps = {
  visible: boolean;
  onClose: () => void;
  comments: CommentItem[];
  onToggleLike: (commentId: string) => void;
  newComment: string;
  onChangeNewComment: (text: string) => void;
  onSendComment: () => void;
  commentCount: number;
};

function CommentsModal({
  visible,
  onClose,
  comments,
  onToggleLike,
  newComment,
  onChangeNewComment,
  onSendComment,
  commentCount,
}: CommentsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.commentsOverlay}>
        <TouchableOpacity style={styles.commentsBackdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          style={styles.commentsSheet}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.commentsHandle} />
          <View style={styles.commentsHeader}>
            <View>
              <Text style={styles.commentsTitle}>Comentarios</Text>
              <Text style={styles.commentsSubtitle}>{commentCount} comentarios</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.commentsCloseBtn}>
              <Ionicons name="close" size={24} color={COMMENT_COLORS.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(comment) => comment.id}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentBody}>
                  <View style={styles.commentHeaderRow}>
                    <Text style={styles.commentName}>{item.user}</Text>
                    <Text style={styles.commentTime}>{item.timestamp}</Text>
                  </View>
                  <Text style={styles.commentMessage}>{item.message}</Text>
                  <View style={styles.commentFooterRow}>
                    <TouchableOpacity
                      onPress={() => onToggleLike(item.id)}
                      style={styles.commentLikeBtn}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={item.liked ? 'heart' : 'heart-outline'}
                        size={18}
                        color={item.liked ? '#FF3A5C' : COMMENT_COLORS.secondaryText}
                      />
                    </TouchableOpacity>
                    <Text style={styles.commentMetaText}>{item.likes}</Text>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.commentInputRow}>
            <TextInput
              value={newComment}
              onChangeText={onChangeNewComment}
              placeholder="Escribe un comentario..."
              placeholderTextColor={COMMENT_COLORS.secondaryText}
              style={styles.commentTextInput}
              multiline
            />
            <TouchableOpacity
              onPress={onSendComment}
              activeOpacity={0.85}
              disabled={newComment.trim().length === 0}
              style={[
                styles.commentSendBtn,
                newComment.trim().length === 0 && styles.commentSendBtnDisabled,
              ]}
            >
              <Ionicons name="send" size={20} color={COMMENT_COLORS.text} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

type FeedItemProps = {
  item: BoomItem;
  energy: number;
  boomCoins: number;
  onEarnEnergy: (amount: number) => void;
};

function FeedItem({ item, energy, boomCoins, onEarnEnergy }: FeedItemProps) {
  const { addToCart } = useShop();
  const [liked, setLiked] = useState(false);
  const [showProduct, setShowProduct] = useState<BoomProduct | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(item.comments);
  const [following, setFollowing] = useState(false);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const heartAnim = useRef(new Animated.Value(1)).current;
  const haloAnim = useRef(new Animated.Value(0)).current;
  const cartFeedbackAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;
  const lastCoinRef = useRef(boomCoins);
  const energyPulse = useRef(new Animated.Value(0)).current;
  const lastEnergyRef = useRef(energy);
  const haloLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const lastTapRef = useRef(0);
  const heartIdRef = useRef(0);

  const itemSeed = useMemo(() => {
    const match = /boom-(\d+)/.exec(item.id);
    return match ? parseInt(match[1], 10) : 0;
  }, [item.id]);

  const [comments, setComments] = useState<CommentItem[]>(() => createComments(itemSeed));

  useEffect(() => {
    setComments(createComments(itemSeed));
    setCommentCount(item.comments);
    setNewComment('');
    setCommentsVisible(false);
  }, [itemSeed, item.comments]);

  useEffect(() => {
    if (energy > lastEnergyRef.current) {
      energyPulse.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(energyPulse, {
            toValue: 1,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(energyPulse, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ).start();
    }
    lastEnergyRef.current = energy;
  }, [energy, energyPulse]);

  useEffect(() => {
    if (boomCoins > lastCoinRef.current) {
      coinAnim.setValue(0);
      Animated.sequence([
        Animated.timing(coinAnim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(coinAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }
    lastCoinRef.current = boomCoins;
  }, [boomCoins, coinAnim]);

  useEffect(() => {
    if (following) {
      haloAnim.setValue(0);
      const loop = Animated.loop(
        Animated.timing(haloAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      haloLoopRef.current = loop;
      loop.start();
    } else {
      haloLoopRef.current?.stop();
      haloLoopRef.current = null;
      haloAnim.setValue(0);
    }
    return () => {
      haloLoopRef.current?.stop();
      haloLoopRef.current = null;
    };
  }, [following, haloAnim]);

  useEffect(() => {
    if (!commentsVisible) {
      setNewComment('');
    }
  }, [commentsVisible]);

  const bounceHeart = useCallback(() => {
    heartAnim.stopAnimation();
    heartAnim.setValue(1);
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.2, duration: 140, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [heartAnim]);

  const triggerEnergyGain = useCallback(
    (amount: number, cb?: () => void) => {
      onEarnEnergy(amount);
      cb?.();
    },
    [onEarnEnergy]
  );

  const toggleLike = useCallback(() => {
    bounceHeart();
    setLiked((value) => {
      const next = !value;
      if (!value) {
        triggerEnergyGain(ENERGY_GAINS.like);
      }
      return next;
    });
  }, [bounceHeart, triggerEnergyGain]);

  const ensureLiked = useCallback(() => {
    bounceHeart();
    setLiked((value) => {
      if (!value) {
        triggerEnergyGain(ENERGY_GAINS.doubleTap);
      }
      return true;
    });
  }, [bounceHeart, triggerEnergyGain]);

  const openComments = useCallback(() => {
    setCommentsVisible(true);
    triggerEnergyGain(ENERGY_GAINS.commentOpen);
  }, [triggerEnergyGain]);

  const closeComments = useCallback(() => {
    setCommentsVisible(false);
  }, []);

  const handleToggleCommentLike = useCallback((commentId: string) => {
    setComments((current) =>
      current.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }
        const nextLiked = !comment.liked;
        const nextLikes = nextLiked ? comment.likes + 1 : Math.max(comment.likes - 1, 0);
        return { ...comment, liked: nextLiked, likes: nextLikes };
      })
    );
  }, []);

  const handleSendComment = useCallback(() => {
    const trimmed = newComment.trim();
    if (!trimmed) {
      return;
    }
    const userComment: CommentItem = {
      id: `local-${Date.now()}`,
      user: 'Tu',
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      message: trimmed,
      likes: 0,
      liked: false,
      timestamp: 'justo ahora',
    };
    setComments((current) => [userComment, ...current]);
    setCommentCount((value) => value + 1);
    setNewComment('');
    triggerEnergyGain(ENERGY_GAINS.commentSend);
  }, [newComment, triggerEnergyGain]);

  const handleShare = useCallback(() => {
    triggerEnergyGain(ENERGY_GAINS.share);
  }, [triggerEnergyGain]);

  const handleShopPress = useCallback(() => {
    if (showProduct) {
      setShowProduct(null);
      return;
    }
    if (item.product) {
      setShowProduct(item.product);
      triggerEnergyGain(ENERGY_GAINS.productOpen);
    }
  }, [item.product, showProduct, triggerEnergyGain]);

  const handleAddCart = useCallback(
    (product: BoomProduct) => {
      if (addToCart) {
        addToCart(product);
      }
      triggerEnergyGain(ENERGY_GAINS.cart, () => setShowProduct(null));
      setCartFeedback('Agregado al carrito');
      cartFeedbackAnim.setValue(0);
      Animated.sequence([
        Animated.timing(cartFeedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(cartFeedbackAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => setCartFeedback(null));
    },
    [addToCart, triggerEnergyGain, cartFeedbackAnim]
  );

  const handleToggleFollow = useCallback(() => {
    setFollowing((prev) => !prev);
  }, []);

  const spawnFloatingHeart = useCallback((x: number, y: number) => {
    const id = heartIdRef.current++;
    const scale = new Animated.Value(0.7);
    const opacity = new Animated.Value(0.75);
    const translateY = new Animated.Value(0);
    const heart: FloatingHeart = { id, x, y, scale, opacity, translateY };

    setFloatingHearts((current) => [...current, heart]);

    Animated.parallel([
      Animated.timing(scale, { toValue: 1.5, duration: 320, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 420, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -80, duration: 420, useNativeDriver: true }),
    ]).start(() => {
      setFloatingHearts((current) => current.filter((floatingHeart) => floatingHeart.id !== id));
    });
  }, []);

  const handleMediaPress = useCallback(
    (event: GestureResponderEvent) => {
      if (showProduct) {
        setShowProduct(null);
        lastTapRef.current = 0;
        return;
      }
      const now = Date.now();
      if (now - lastTapRef.current <= DOUBLE_TAP_DELAY) {
        const { locationX, locationY } = event.nativeEvent;
        ensureLiked();
        spawnFloatingHeart(locationX, locationY);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    },
    [ensureLiked, spawnFloatingHeart, showProduct]
  );

  const likeCount = liked ? item.likes + 1 : item.likes;
  const energyProgress = Math.min(energy / ENERGY_MAX, 1);

  const energyGlowOpacity = energyPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  });

  const energyGlowScale = energyPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const cartFeedbackTranslate = cartFeedbackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const coinScale = coinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const coinGlowOpacity = coinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const openProfile = useCallback(() => {
    setShowProduct(null);
    router.push({ pathname: '/(tabs)/profile', params: { user: item.user } });
  }, [item.user, setShowProduct]);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -60 && Math.abs(gestureState.dy) < 80) {
          openProfile();
        }
      },
      onPanResponderTerminate: (_, gestureState) => {
        if (gestureState.dx < -60 && Math.abs(gestureState.dy) < 80) {
          openProfile();
        }
      },
    }),
  [openProfile]);

  const followRotation = haloAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.itemContainer} {...panResponder.panHandlers}>
      <Pressable onPress={handleMediaPress} style={styles.mediaPressable}>
        <Image source={{ uri: item.uri }} style={styles.media} />
      </Pressable>

      {floatingHearts.map((heart) => (
        <Animated.View
          key={heart.id}
          style={[
            styles.tapHeart,
            {
              left: heart.x - TAP_HEART_SIZE / 2,
              top: heart.y - TAP_HEART_SIZE / 2,
              opacity: heart.opacity,
              transform: [
                { translateY: heart.translateY },
                { scale: heart.scale },
              ],
            },
          ]}
        >
          <Ionicons name="heart" size={TAP_HEART_SIZE} color="#FF3A5C" />
        </Animated.View>
      ))}

      <View style={styles.topTitle}>
        <Text style={styles.topTitleText}>Boom</Text>
      </View>

      <View style={styles.topStatusRow}>
        <View style={styles.energyWrapper}>
          <Text style={styles.energyLabel}>Energia</Text>
          <View style={styles.energyBar}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.energyElectricGlow,
                {
                  opacity: energyGlowOpacity,
                  transform: [{ scaleY: energyGlowScale }],
                },
              ]}
            />
            <Animated.View style={[styles.energyFill, { width: `${energyProgress * 100}%` }]} />
          </View>
          <Text style={styles.energyValue}>{Math.round(energy)} / {ENERGY_MAX}</Text>
        </View>
        <Animated.View style={[styles.coinBadge, { transform: [{ scale: coinScale }] }]}>
          <Animated.View pointerEvents="none" style={[styles.coinHalo, { opacity: coinGlowOpacity }]} />
          <View style={styles.coinStack}>
            <View style={[styles.coinIcon, styles.coinIconBack]} />
            <View style={styles.coinIcon} />
          </View>
          <Text style={styles.coinLabel}>{boomCoins}</Text>
        </Animated.View>
      </View>

      <View style={styles.leftBottom}>
        <TouchableOpacity onPress={handleToggleFollow} activeOpacity={0.85}>
          <View style={styles.avatarContainer}>
            {following ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.avatarHalo,
                  { transform: [{ rotate: followRotation }] },
                ]}
              />
            ) : null}
            <Image source={{ uri: item.avatar }} style={styles.avatarSmallLeft} />
            {!following ? (
              <View style={styles.followPlus}>
                <Text style={styles.followPlusText}>+</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <View style={styles.leftBottomText}>
          <Text style={styles.username}>
            {item.user}
            {following ? <Text style={styles.followingTag}>  siguiendo</Text> : null}
          </Text>
          <Text style={styles.caption}>{item.description}</Text>
        </View>
      </View>

      <View style={styles.sideBarLarge} pointerEvents="box-none">
        <TouchableOpacity style={styles.sideBtnLarge} onPress={toggleLike} activeOpacity={0.85}>
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={34}
              color={liked ? '#FF3A5C' : '#FFFFFF'}
            />
          </Animated.View>
          <Text style={styles.sideCount}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideBtnLarge} onPress={openComments} activeOpacity={0.85}>
          <Ionicons name="chatbubble-ellipses-outline" size={34} color="#FFFFFF" />
          <Text style={styles.sideCount}>{commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideBtnLarge} onPress={handleShare} activeOpacity={0.85}>
          <Ionicons name="arrow-redo-outline" size={34} color="#FFFFFF" />
        </TouchableOpacity>

        {item.product ? (
          <TouchableOpacity style={styles.sideBtnLarge} onPress={handleShopPress} activeOpacity={0.85}>
            <Ionicons name="bag-handle-outline" size={34} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {showProduct && (
        <View style={styles.productBanner}>
          <Image source={{ uri: showProduct.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{showProduct.name}</Text>
            <Text style={styles.productPrice}>{'$' + showProduct.price}</Text>
          </View>
          <TouchableOpacity style={styles.addToCartBtn} onPress={() => handleAddCart(showProduct)}>
            <Text style={styles.addToCartLabel}>Agregar</Text>
          </TouchableOpacity>
        </View>
      )}

      <CommentsModal
        visible={commentsVisible}
        onClose={closeComments}
        comments={comments}
        onToggleLike={handleToggleCommentLike}
        newComment={newComment}
        onChangeNewComment={setNewComment}
        onSendComment={handleSendComment}
        commentCount={commentCount}
      />

      {cartFeedback ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.cartFeedbackToast,
            {
              opacity: cartFeedbackAnim,
              transform: [{ translateY: cartFeedbackTranslate }],
            },
          ]}
        >
          <Text style={styles.cartFeedbackText}>{cartFeedback}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

export default function BoomFeed() {
  const [items, setItems] = useState(() => createBoomBatch(0, 6));
  const [energy, setEnergy] = useState(0);
  const [boomCoins, setBoomCoins] = useState(0);
  const loadingRef = useRef(false);

  const handleEarnEnergy = useCallback((amount: number) => {
    if (amount <= 0) {
      return;
    }
    setEnergy((current) => {
      let nextEnergy = current + amount;
      let coinsEarned = 0;
      while (nextEnergy >= ENERGY_MAX) {
        nextEnergy -= ENERGY_MAX;
        coinsEarned += 1;
      }
      if (coinsEarned > 0) {
        setBoomCoins((value) => value + coinsEarned);
      }
      return nextEnergy;
    });
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    setItems((current) => [...current, ...createBoomBatch(current.length, 4)]);
  }, []);

  useEffect(() => {
    loadingRef.current = false;
  }, [items]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FeedItem item={item} energy={energy} boomCoins={boomCoins} onEarnEnergy={handleEarnEnergy} />
      )}
      pagingEnabled
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.7}
      bounces={false}
      style={{ flex: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  itemContainer: { width, height, backgroundColor: '#000000' },
  mediaPressable: { width, height },
  media: { width, height, resizeMode: 'cover' },
  tapHeart: { position: 'absolute', zIndex: 30, pointerEvents: 'none' },
  topStatusRow: {
    position: 'absolute',
    top: 68,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  energyWrapper: { width: 170 },
  energyLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  energyBar: {
    marginTop: 4,
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  energyFill: { height: '100%', backgroundColor: '#36E2FF' },
  energyElectricGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -4,
    bottom: -4,
    backgroundColor: 'rgba(114,224,255,0.38)',
  },
  energyValue: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 4 },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'visible',
  },
  coinHalo: {
    position: 'absolute',
    top: -12,
    bottom: -12,
    left: -12,
    right: -12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,226,122,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,216,102,0.8)',
  },
  coinStack: { flexDirection: 'row', alignItems: 'center', marginRight: 6 },
  coinIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFE27A',
    borderWidth: 1,
    borderColor: '#F2B900',
  },
  coinIconBack: { marginRight: -8, opacity: 0.85 },
  coinLabel: { color: '#FFFFFF', fontWeight: '700', marginLeft: 6, fontSize: 14 },
  topTitle: { position: 'absolute', top: 56, left: 0, right: 0, alignItems: 'center' },
  topTitleText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  leftBottom: { position: 'absolute', left: 16, bottom: 120, flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  avatarHalo: {
    position: 'absolute',
    top: -8,
    bottom: -8,
    left: -8,
    right: -8,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#36E2FF',
    opacity: 0.9,
  },
  followPlus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3A5C',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followPlusText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  followingTag: { color: '#36E2FF', fontSize: 12, fontWeight: '600' },
  cartFeedbackToast: {
    position: 'absolute',
    bottom: 180,
    left: 40,
    right: 40,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 18,
    alignItems: 'center',
  },
  cartFeedbackText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  avatarSmallLeft: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#FFFFFF' },
  leftBottomText: { marginLeft: 12, maxWidth: width - 180 },
  username: { color: '#FFFFFF', fontWeight: '700', fontSize: 18 },
  caption: { color: '#FFFFFF', marginTop: 6, lineHeight: 20 },
  sideBarLarge: { position: 'absolute', right: 20, bottom: 160, alignItems: 'center' },
  sideBtnLarge: { marginBottom: 28, alignItems: 'center' },
  sideCount: { color: '#FFFFFF', marginTop: 6, fontWeight: '600' },
  productBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 80,
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: { width: 72, height: 72, borderRadius: 12 },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  productPrice: { color: '#AAAAAA', marginTop: 4 },
  addToCartBtn: { backgroundColor: '#FF3A5C', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 },
  addToCartLabel: { color: '#FFFFFF', fontWeight: '700' },
  commentsOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  commentsBackdrop: { flex: 1 },
  commentsSheet: {
    backgroundColor: COMMENT_COLORS.sheet,
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
  },
  commentsHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: COMMENT_COLORS.divider,
    marginBottom: 12,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentsTitle: { color: COMMENT_COLORS.text, fontSize: 20, fontWeight: '700' },
  commentsSubtitle: { color: COMMENT_COLORS.secondaryText, marginTop: 4, fontSize: 14 },
  commentsCloseBtn: { padding: 4 },
  commentsList: { paddingBottom: 16 },
  commentRow: { flexDirection: 'row', marginBottom: 18 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  commentBody: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COMMENT_COLORS.divider,
    paddingBottom: 14,
  },
  commentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  commentName: { color: COMMENT_COLORS.text, fontWeight: '600' },
  commentTime: { color: COMMENT_COLORS.secondaryText, fontSize: 12 },
  commentMessage: { color: COMMENT_COLORS.text, lineHeight: 20, marginBottom: 8 },
  commentFooterRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentLikeBtn: { paddingVertical: 4, paddingRight: 4 },
  commentMetaText: { color: COMMENT_COLORS.secondaryText, fontSize: 12 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    backgroundColor: COMMENT_COLORS.inputBackground,
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
  },
  commentTextInput: {
    flex: 1,
    maxHeight: 100,
    color: COMMENT_COLORS.text,
    fontSize: 15,
    paddingVertical: 6,
  },
  commentSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF3A5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSendBtnDisabled: { opacity: 0.4 },
});



