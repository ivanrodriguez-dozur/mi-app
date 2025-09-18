import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  nombre: string;
  descripcion?: string;
  foto_perfil?: string;
  foto_portada?: string;
  plays: number;
  followers: number;
  likes: number;
  es_verificado: boolean;
  es_privado: boolean;
  // Campos de Wallet
  wallet_balance: number;
  wallet_currency: string;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
        return;
      }
      
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Error inesperado al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        setError(error.message);
        return { error };
      }
      
      // Refrescar los datos después de actualizar
      await fetchProfile();
      return { error: null };
    } catch (err) {
      console.error('Unexpected error updating profile:', err);
      const errorMessage = 'Error inesperado al actualizar el perfil';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const incrementStat = async (stat: 'plays' | 'followers' | 'likes', increment: number = 1) => {
    if (!profile) return;
    
    const newValue = profile[stat] + increment;
    return await updateProfile({ [stat]: newValue });
  };

  // Funciones específicas para Wallet
  const addToWallet = async (amount: number, description?: string) => {
    if (!profile) return;
    
    const newBalance = profile.wallet_balance + amount;
    const newTotalEarned = profile.total_earned + amount;
    
    return await updateProfile({ 
      wallet_balance: newBalance,
      total_earned: newTotalEarned
    });
  };

  const subtractFromWallet = async (amount: number, description?: string) => {
    if (!profile) return;
    
    if (profile.wallet_balance < amount) {
      return { error: { message: 'Saldo insuficiente' } };
    }
    
    const newBalance = profile.wallet_balance - amount;
    const newTotalSpent = profile.total_spent + amount;
    
    return await updateProfile({ 
      wallet_balance: newBalance,
      total_spent: newTotalSpent
    });
  };

  const getWalletBalance = () => {
    return profile?.wallet_balance || 0;
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    incrementStat,
    // Funciones de Wallet
    addToWallet,
    subtractFromWallet,
    getWalletBalance
  };
}