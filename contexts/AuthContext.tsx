import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: asegura que exista una fila en la tabla `users` para el user de supabase
  const ensureUserRow = async (authUser: User, suggestedUsername?: string) => {
    try {
      const payload: any = {
        id: authUser.id,
        email: authUser.email ?? undefined,
        username: suggestedUsername ?? authUser.user_metadata?.username ?? authUser.email?.split('@')[0] ?? null,
        nombre: authUser.user_metadata?.name ?? authUser.user_metadata?.username ?? authUser.email?.split('@')[0] ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Usar upsert para crear o actualizar la fila sin fallar si ya existe
      const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.error('Error upserting user row:', error);
      }
    } catch (err) {
      console.error('Unexpected error ensuring user row:', err);
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Si hay un usuario autenticado, asegurar que exista la fila en la tabla `users`
        (async () => {
          try {
            const authUser = session?.user ?? null;
            if (authUser) {
              await ensureUserRow(authUser);
            }
          } catch (err) {
            console.error('Error ensuring user row after auth change:', err);
          }
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Si el SDK devuelve el user inmediatamente, intentar crear/upsert en la tabla `users`
      const createdUser = data?.user ?? null;
      if (createdUser) {
        try {
          await ensureUserRow(createdUser, username);
        } catch (err) {
          console.error('Error creating users row after signUp:', err);
        }
      }

      return { error: null };
    } catch (err: any) {
      console.error('Unexpected error during signUp:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}