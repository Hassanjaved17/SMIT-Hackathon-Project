import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Role } from '../types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USERS_KEY = 'maintainiq_demo_users';
const DEMO_SESSION_KEY = 'maintainiq_demo_session';

interface DemoUser extends AuthUser {
  password: string;
}

function loadDemoUsers(): DemoUser[] {
  const raw = localStorage.getItem(DEMO_USERS_KEY);
  if (raw) return JSON.parse(raw);
  const seeded: DemoUser[] = [
    { id: 'admin-1', name: 'Ayesha (Admin)', email: 'admin@maintainiq.app', password: 'admin123', role: 'admin' },
    { id: 'admin-2', name: 'Hassan (Admin)', email: 'hassandeveloper341@gmail.com', password: 'admin123', role: 'admin' },
    { id: 'tech-1', name: 'Bilal (Technician)', email: 'tech@maintainiq.app', password: 'tech123', role: 'technician' },
  ];
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(seeded));
  return seeded;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(async ({ data }) => {
        if (data.session?.user) await hydrateFromSupabase(data.session.user.id, data.session.user.email ?? '');
        setLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) await hydrateFromSupabase(session.user.id, session.user.email ?? '');
        else setUser(null);
      });
      return () => sub.subscription.unsubscribe();
    } else {
      const raw = localStorage.getItem(DEMO_SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
      setLoading(false);
    }
  }, []);

  async function hydrateFromSupabase(id: string, email: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !profile) {
    // No profile row = broken/incomplete account. Don't silently
    // grant technician access — sign out and force a clear error.
    console.error('No profile found for user', id, error);
    await supabase.auth.signOut();
    setUser(null);
    return;
  }

  setUser({ id, email, name: profile.full_name ?? email, role: profile.role as Role });
}

  async function login(email: string, password: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      const users = loadDemoUsers();
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) throw new Error('Invalid email or password');
      const { password: _pw, ...safe } = found;
      setUser(safe);
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safe));
    }
  }

  async function register(name: string, email: string, password: string, role: Role) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role } },
      });
      if (error) throw error;
      // profile row is now created server-side by the handle_new_user trigger
      // (see sql-patches/1-profile-auto-create-trigger.sql) — this avoids the
      // RLS-timing gap where no session exists yet if email confirmation is on.
    } else {
      const users = loadDemoUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Account already exists');
      const newUser: DemoUser = { id: crypto.randomUUID(), name, email, password, role };
      users.push(newUser);
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
      const { password: _pw, ...safe } = newUser;
      setUser(safe);
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safe));
    }
  }

  async function logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(DEMO_SESSION_KEY);
      setUser(null);
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
