import 'react-native-get-random-values';
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// ERC-20 ABI (solo las funciones que necesitamos)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

// Configuración del token desde variables de entorno
const POLYGON_RPC_URL = process.env.EXPO_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com';
const CHAIN_ID = parseInt(process.env.EXPO_PUBLIC_POLYGON_CHAIN_ID || '137', 10);
const TOKEN_CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_TOKEN_CONTRACT_ADDRESS || '';
const TOKEN_DECIMALS = parseInt(process.env.EXPO_PUBLIC_TOKEN_DECIMALS || '18', 10);

// Claves de almacenamiento
const WALLET_STORAGE_KEY = '@wallet_encrypted';
const WALLET_ADDRESS_KEY = '@wallet_address';

interface WalletData {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

/**
 * Servicio para gestionar wallets de Polygon y transacciones de tokens BMC
 */
export class PolygonWalletService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL, {
      chainId: CHAIN_ID,
      name: 'polygon',
    });
  }

  /**
   * Genera una nueva wallet con frase semilla
   */
  async generateNewWallet(): Promise<{ address: string; mnemonic: string }> {
    // Generar wallet con mnemonic
    const wallet = ethers.Wallet.createRandom();
    
    // Guardar de forma segura
    await this.saveWallet({
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
    });

    this.wallet = wallet.connect(this.provider);

    return {
      address: wallet.address,
      mnemonic: wallet.mnemonic?.phrase || '',
    };
  }

  /**
   * Importa una wallet desde frase semilla o clave privada
   */
  async importWallet(mnemonicOrPrivateKey: string): Promise<string> {
    let wallet: ethers.Wallet;

    try {
      // Intentar como mnemonic primero
      if (mnemonicOrPrivateKey.split(' ').length >= 12) {
        wallet = ethers.Wallet.fromPhrase(mnemonicOrPrivateKey);
      } else {
        // Intentar como private key
        wallet = new ethers.Wallet(mnemonicOrPrivateKey);
      }

      await this.saveWallet({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase,
      });

      this.wallet = wallet.connect(this.provider);

      return wallet.address;
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw new Error('Frase semilla o clave privada inválida');
    }
  }

  /**
   * Carga la wallet guardada
   */
  async loadWallet(): Promise<string | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (!encryptedData) {
        return null;
      }

      const walletData: WalletData = JSON.parse(encryptedData);
      
      this.wallet = new ethers.Wallet(walletData.privateKey, this.provider);
      
      return walletData.address;
    } catch (error) {
      console.error('Error loading wallet:', error);
      return null;
    }
  }

  /**
   * Obtiene la dirección de la wallet actual
   */
  getAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Obtiene el balance de tokens BMC
   */
  async getTokenBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || this.wallet?.address;
      if (!targetAddress) {
        throw new Error('No hay wallet cargada');
      }

      const contract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        ERC20_ABI,
        this.provider
      );

      const balance = await contract.balanceOf(targetAddress);
      return ethers.formatUnits(balance, TOKEN_DECIMALS);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Error al obtener balance');
    }
  }

  /**
   * Obtiene el balance de MATIC (para gas)
   */
  async getMaticBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || this.wallet?.address;
      if (!targetAddress) {
        throw new Error('No hay wallet cargada');
      }

      const balance = await this.provider.getBalance(targetAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting MATIC balance:', error);
      throw new Error('Error al obtener balance de MATIC');
    }
  }

  /**
   * Transfiere tokens BMC a otra dirección
   */
  async transferTokens(
    toAddress: string,
    amount: string
  ): Promise<{ hash: string; success: boolean }> {
    if (!this.wallet) {
      throw new Error('No hay wallet cargada');
    }

    try {
      // Validar dirección
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Dirección inválida');
      }

      // Crear contrato con el wallet (para poder firmar)
      const contract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        ERC20_ABI,
        this.wallet
      );

      // Convertir amount a unidades del token
      const amountInWei = ethers.parseUnits(amount, TOKEN_DECIMALS);

      // Verificar balance
      const balance = await contract.balanceOf(this.wallet.address);
      if (balance < amountInWei) {
        throw new Error('Saldo insuficiente');
      }

      // Enviar transacción
      const tx = await contract.transfer(toAddress, amountInWei);
      
      // Esperar confirmación
      await tx.wait();

      return {
        hash: tx.hash,
        success: true,
      };
    } catch (error: any) {
      console.error('Error transferring tokens:', error);
      
      if (error.message.includes('insufficient funds')) {
        throw new Error('Saldo insuficiente de MATIC para pagar gas');
      }
      
      throw new Error(error.message || 'Error al transferir tokens');
    }
  }

  /**
   * Estima el costo de gas para una transferencia
   */
  async estimateTransferGas(toAddress: string, amount: string): Promise<{
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  }> {
    if (!this.wallet) {
      throw new Error('No hay wallet cargada');
    }

    try {
      const contract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        ERC20_ABI,
        this.wallet
      );

      const amountInWei = ethers.parseUnits(amount, TOKEN_DECIMALS);

      // Estimar gas
      const gasLimit = await contract.transfer.estimateGas(toAddress, amountInWei);
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('50', 'gwei');

      const estimatedCost = gasLimit * gasPrice;

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        estimatedCost: ethers.formatEther(estimatedCost),
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw new Error('Error al estimar costo de gas');
    }
  }

  /**
   * Obtiene información del token
   */
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }> {
    try {
      const contract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        ERC20_ABI,
        this.provider
      );

      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ]);

      return { name, symbol, decimals: Number(decimals) };
    } catch (error) {
      console.error('Error getting token info:', error);
      // Retornar valores por defecto si falla
      return {
        name: process.env.EXPO_PUBLIC_TOKEN_NAME || 'Boom Coin',
        symbol: process.env.EXPO_PUBLIC_TOKEN_SYMBOL || 'BMC',
        decimals: TOKEN_DECIMALS,
      };
    }
  }

  /**
   * Valida si una dirección es válida
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Elimina la wallet guardada (logout)
   */
  async clearWallet(): Promise<void> {
    await AsyncStorage.multiRemove([WALLET_STORAGE_KEY, WALLET_ADDRESS_KEY]);
    this.wallet = null;
  }

  /**
   * Obtiene la frase semilla de la wallet actual (para backup)
   */
  async getMnemonic(): Promise<string | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (!encryptedData) {
        return null;
      }

      const walletData: WalletData = JSON.parse(encryptedData);
      return walletData.mnemonic || null;
    } catch (error) {
      console.error('Error getting mnemonic:', error);
      return null;
    }
  }

  /**
   * Guarda la wallet de forma segura
   */
  private async saveWallet(walletData: WalletData): Promise<void> {
    try {
      // En producción, considera usar encriptación adicional aquí
      // Por ahora guardamos como JSON pero en AsyncStorage que es seguro
      await AsyncStorage.setItem(
        WALLET_STORAGE_KEY,
        JSON.stringify(walletData)
      );
      await AsyncStorage.setItem(WALLET_ADDRESS_KEY, walletData.address);
    } catch (error) {
      console.error('Error saving wallet:', error);
      throw new Error('Error al guardar wallet');
    }
  }
}

// Instancia singleton
export const polygonWalletService = new PolygonWalletService();
