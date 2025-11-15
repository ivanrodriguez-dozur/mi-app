import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { polygonWalletService } from '../lib/polygonWallet';

interface BlockchainContextValue {
  // Wallet state
  walletAddress: string | null;
  isWalletLoaded: boolean;
  isLoading: boolean;
  
  // Balances
  tokenBalance: string;
  maticBalance: string;
  
  // Token info
  tokenName: string;
  tokenSymbol: string;
  
  // Actions
  generateNewWallet: () => Promise<{ address: string; mnemonic: string }>;
  importWallet: (mnemonicOrPrivateKey: string) => Promise<string>;
  loadWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  transferTokens: (toAddress: string, amount: string) => Promise<{ hash: string; success: boolean }>;
  estimateGas: (toAddress: string, amount: string) => Promise<{
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  }>;
  getMnemonic: () => Promise<string | null>;
  clearWallet: () => Promise<void>;
  isValidAddress: (address: string) => boolean;
  
  // Transaction state
  isTransacting: boolean;
  transactionHash: string | null;
  transactionError: string | null;
}

const BlockchainContext = createContext<BlockchainContextValue | undefined>(undefined);

export const BlockchainProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletLoaded, setIsWalletLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [maticBalance, setMaticBalance] = useState('0');
  const [tokenName, setTokenName] = useState('Boom Coin');
  const [tokenSymbol, setTokenSymbol] = useState('BMC');
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Cargar información del token
  useEffect(() => {
    const loadTokenInfo = async () => {
      try {
        const info = await polygonWalletService.getTokenInfo();
        setTokenName(info.name);
        setTokenSymbol(info.symbol);
      } catch (error) {
        console.error('Error loading token info:', error);
      }
    };
    loadTokenInfo();
  }, []);

  // Cargar wallet al iniciar
  const loadWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const address = await polygonWalletService.loadWallet();
      if (address) {
        setWalletAddress(address);
        setIsWalletLoaded(true);
        // Cargar balances
        await refreshBalances();
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // Refrescar balances
  const refreshBalances = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const [tokenBal, maticBal] = await Promise.all([
        polygonWalletService.getTokenBalance(walletAddress),
        polygonWalletService.getMaticBalance(walletAddress),
      ]);
      setTokenBalance(tokenBal);
      setMaticBalance(maticBal);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  }, [walletAddress]);

  // Refrescar balances cada 30 segundos
  useEffect(() => {
    if (!walletAddress) return;

    const interval = setInterval(() => {
      refreshBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [walletAddress, refreshBalances]);

  // Generar nueva wallet
  const generateNewWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await polygonWalletService.generateNewWallet();
      setWalletAddress(result.address);
      setIsWalletLoaded(true);
      await refreshBalances();
      return result;
    } catch (error) {
      console.error('Error generating wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshBalances]);

  // Importar wallet
  const importWallet = useCallback(async (mnemonicOrPrivateKey: string) => {
    setIsLoading(true);
    try {
      const address = await polygonWalletService.importWallet(mnemonicOrPrivateKey);
      setWalletAddress(address);
      setIsWalletLoaded(true);
      await refreshBalances();
      return address;
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshBalances]);

  // Transferir tokens
  const transferTokens = useCallback(async (toAddress: string, amount: string) => {
    setIsTransacting(true);
    setTransactionHash(null);
    setTransactionError(null);

    try {
      const result = await polygonWalletService.transferTokens(toAddress, amount);
      setTransactionHash(result.hash);
      
      // Refrescar balances después de la transacción
      await refreshBalances();
      
      return result;
    } catch (error: any) {
      console.error('Error transferring tokens:', error);
      setTransactionError(error.message);
      throw error;
    } finally {
      setIsTransacting(false);
    }
  }, [refreshBalances]);

  // Estimar gas
  const estimateGas = useCallback(async (toAddress: string, amount: string) => {
    return await polygonWalletService.estimateTransferGas(toAddress, amount);
  }, []);

  // Obtener mnemonic
  const getMnemonic = useCallback(async () => {
    return await polygonWalletService.getMnemonic();
  }, []);

  // Limpiar wallet
  const clearWallet = useCallback(async () => {
    await polygonWalletService.clearWallet();
    setWalletAddress(null);
    setIsWalletLoaded(false);
    setTokenBalance('0');
    setMaticBalance('0');
  }, []);

  // Validar dirección
  const isValidAddress = useCallback((address: string) => {
    return polygonWalletService.isValidAddress(address);
  }, []);

  const value: BlockchainContextValue = {
    walletAddress,
    isWalletLoaded,
    isLoading,
    tokenBalance,
    maticBalance,
    tokenName,
    tokenSymbol,
    generateNewWallet,
    importWallet,
    loadWallet,
    refreshBalances,
    transferTokens,
    estimateGas,
    getMnemonic,
    clearWallet,
    isValidAddress,
    isTransacting,
    transactionHash,
    transactionError,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = (): BlockchainContextValue => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
