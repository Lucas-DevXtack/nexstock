import React, { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { storage } from '../../utils/storage';

type AuthCtx = {
  token: string;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function saveSession(response: any, setToken: (value: string) => void) {
  const accessToken = response?.accessToken || response?.token || '';
  storage.token = accessToken;
  storage.refreshToken = response?.refreshToken || '';
  setToken(accessToken);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(storage.token);

  async function signup(name: string, email: string, password: string) {
    const r = await api('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    saveSession(r, setToken);
  }

  async function login(email: string, password: string) {
    try {
      const r = await api('/auth/login2', { method: 'POST', body: JSON.stringify({ email, password }) });
      saveSession(r, setToken);
    } catch {
      const r = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      saveSession(r, setToken);
    }
  }

  async function forgotPassword(email: string) {
    await api('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) });
  }

  async function resetPassword(tokenValue: string, newPassword: string) {
    await api('/auth/reset', { method: 'POST', body: JSON.stringify({ token: tokenValue, newPassword }) });
  }

  async function logout() {
    try {
      if (storage.token) {
        await api('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: storage.refreshToken || undefined }) });
      }
    } catch {
      // no-op: local logout still happens
    } finally {
      storage.clearAll();
      setToken('');
    }
  }

  const value = useMemo(() => ({ token, signup, login, forgotPassword, resetPassword, logout }), [token]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
