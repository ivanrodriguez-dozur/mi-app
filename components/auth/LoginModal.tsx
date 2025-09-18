import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
  const { colors, fontScale } = useTheme();
  const { signIn, signUp, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    onClose();
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      Alert.alert('Error de inicio de sesión', error.message);
    } else {
      Alert.alert('¡Bienvenido!', 'Has iniciado sesión correctamente');
      handleClose();
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, username);
    
    if (error) {
      Alert.alert('Error de registro', error.message);
    } else {
      Alert.alert(
        '¡Registro exitoso!', 
        'Revisa tu email para confirmar tu cuenta',
        [{ text: 'OK', onPress: handleClose }]
      );
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Email enviado',
        'Revisa tu bandeja de entrada para restablecer tu contraseña',
        [{ text: 'OK', onPress: () => setMode('login') }]
      );
    }
    setLoading(false);
  };

  const renderLoginForm = () => (
    <>
      <Text style={[styles.title, { color: colors.text, fontSize: 24 * fontScale }]}>
        Iniciar Sesión
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>
        Accede a tu cuenta
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text, fontSize: 16 * fontScale }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text, fontSize: 16 * fontScale }]}
          placeholder="Contraseña"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.accent }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={[styles.primaryButtonText, { fontSize: 16 * fontScale }]}>
            Iniciar Sesión
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode('forgot')}>
        <Text style={[styles.linkText, { color: colors.accent, fontSize: 14 * fontScale }]}>
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
          o
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: colors.border }]}
        onPress={() => setMode('register')}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.text, fontSize: 16 * fontScale }]}>
          Crear una cuenta
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <Text style={[styles.title, { color: colors.text, fontSize: 24 * fontScale }]}>
        Crear Cuenta
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>
        Únete a la comunidad
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text, fontSize: 16 * fontScale }]}
          placeholder="Nombre de usuario"
          placeholderTextColor={colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text, fontSize: 16 * fontScale }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text, fontSize: 16 * fontScale }]}
          placeholder="Contraseña"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text, fontSize: 16 * fontScale }]}
          placeholder="Confirmar contraseña"
          placeholderTextColor={colors.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.accent }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={[styles.primaryButtonText, { fontSize: 16 * fontScale }]}>
            Crear Cuenta
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode('login')}>
        <Text style={[styles.linkText, { color: colors.accent, fontSize: 14 * fontScale }]}>
          ¿Ya tienes cuenta? Iniciar sesión
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderForgotForm = () => (
    <>
      <Text style={[styles.title, { color: colors.text, fontSize: 24 * fontScale }]}>
        Recuperar Contraseña
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>
        Te enviaremos un enlace a tu email
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text, fontSize: 16 * fontScale }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.accent }]}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={[styles.primaryButtonText, { fontSize: 16 * fontScale }]}>
            Enviar enlace
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode('login')}>
        <Text style={[styles.linkText, { color: colors.accent, fontSize: 14 * fontScale }]}>
          Volver al inicio de sesión
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {mode === 'login' && renderLoginForm()}
            {mode === 'register' && renderRegisterForm()}
            {mode === 'forgot' && renderForgotForm()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontWeight: '500',
  },
});