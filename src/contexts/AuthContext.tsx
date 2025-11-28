/**
 * AuthContext - Authentication State Management
 * 
 * Provides authentication state and methods throughout the application.
 * Uses Supabase Auth for user authentication and manages user roles
 * stored in a separate user_roles table for security.
 * 
 * Features:
 * - Email/password authentication (signIn, signUp, signOut)
 * - Role-based access control (admin, comercial, operacional)
 * - Session persistence with automatic token refresh
 * - Loading state for auth operations
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/** Available user roles in the system */
export type UserRole = 'admin' | 'comercial' | 'operacional' | null;

interface AuthContextType {
  /** Current authenticated user or null if not logged in */
  user: User | null;
  /** Current auth session */
  session: Session | null;
  /** User's role for access control */
  userRole: UserRole;
  /** True while checking auth state on initial load */
  loading: boolean;
  /** Last authentication error message */
  authError: string | null;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  /** Create new account with email and password */
  signUp: (email: string, password: string, role?: UserRole) => Promise<{ error: Error | null }>;
  /** Sign out current user */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  /**
   * Fetches user role from the user_roles table
   * Returns 'operacional' as default if no role is found
   */
  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Role table might not exist yet - return default
        return 'operacional';
      }

      return (data?.role as UserRole) || 'operacional';
    } catch {
      return 'operacional';
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST to prevent missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Update state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching with setTimeout to avoid Supabase deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id).then(role => {
              setUserRole(role);
              setLoading(false);
            });
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).then(role => {
          setUserRole(role);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setAuthError(error.message);
      return { error: error as Error };
    }
    
    // Fetch role after successful login
    if (data.user) {
      const role = await fetchUserRole(data.user.id);
      setUserRole(role);
    }
    
    return { error: null };
  };

  const signUp = async (email: string, password: string, role: UserRole = 'operacional') => {
    setAuthError(null);
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    if (error) {
      setAuthError(error.message);
      return { error: error as Error };
    }
    
    // Create user role entry if user was created
    if (data.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: role || 'operacional',
        });
      
      if (roleError) {
        // Non-blocking - role can be assigned later
      }
      
      setUserRole(role);
    }
    
    return { error: null };
  };

  const signOut = async () => {
    setAuthError(null);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userRole, 
      loading, 
      authError,
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
