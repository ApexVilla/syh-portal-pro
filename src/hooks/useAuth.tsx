/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  cod_empresa: string | null;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [codEmpresa, setCodEmpresa] = useState<string | null>(null);

  const loadProfile = async (userId: string) => {
    try {
      // 1. Intentar cargar el perfil
      let { data: profile, error } = await supabase
        .from('profiles' as any)
        .select('cod_empresa')
        .eq('id', userId)
        .single();

      // 2. Si no existe, crear uno por defecto (001)
      if (error || !profile) {
        console.log("Perfil no encontrado, creando uno nuevo...");
        const { data: newProfile, error: createError } = await supabase
          .from('profiles' as any)
          .insert([{ id: userId, cod_empresa: '001' }])
          .select()
          .single();
        
        if (!createError && newProfile) {
          profile = newProfile;
        }
      }

      if (profile) {
        setCodEmpresa((profile as any).cod_empresa || '001');
      }
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
      setCodEmpresa('001'); // Fallback
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setCodEmpresa(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signInError) {
      // Bypass for local development if credentials match user's request
      const testUsers: Record<string, string> = {
        'villarroelsamir85@gmail.com': '123456',
        'samir@apexvilla.com': '231317',
        'richard@apexvilla.com': '123456a'
      };

      const normalizedEmail = email.toLowerCase();
      if (testUsers[normalizedEmail] && testUsers[normalizedEmail] === password) {
        console.warn("Bypassing auth for local development user:", normalizedEmail);
        const mockUser = {
          id: `dev-user-${normalizedEmail}`,
          email: normalizedEmail,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString(),
        } as User;
        
        const mockSession = {
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUser,
        } as Session;
        
        setSession(mockSession);
        setUser(mockUser);
        setCodEmpresa('001');
        setLoading(false);
        return { error: null };
      }

      return { error: signInError };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCodEmpresa(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, cod_empresa: codEmpresa, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
