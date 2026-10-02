import { create } from 'zustand';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth.types';
import { authApi } from '@/services/api/auth.api';

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogleCode: (code: string, redirectUri?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  initAuth: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Immediately hydrate cached user to eliminate initial render delay
let cachedUser: User | null = null;
try {
  const storedUser = localStorage.getItem('auth_user');
  if (storedUser) {
    cachedUser = JSON.parse(storedUser);
  }
} catch (e) {
  cachedUser = null;
}
const rawToken = localStorage.getItem('auth_token');
const cachedToken = (rawToken && rawToken !== 'undefined' && rawToken !== 'null') ? rawToken : null;

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: cachedUser,
  token: cachedToken,
  isAuthenticated: Boolean(cachedToken && cachedUser),
  isLoading: false,
  isInitialized: Boolean(cachedUser || !cachedToken),
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);

      localStorage.setItem('auth_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to sign in. Please verify your credentials.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(credentials);

      localStorage.setItem('auth_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Registration failed. Please check the provided information.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  loginWithGoogleCode: async (code: string, redirectUri?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.exchangeGoogleCode({
        code,
        redirect_uri: redirectUri,
      });

      localStorage.setItem('auth_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Google authentication failed.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  initAuth: async () => {
    const raw = localStorage.getItem('auth_token');
    const token = (raw && raw !== 'undefined' && raw !== 'null') ? raw : null;
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
      return;
    }

    try {
      const user = await authApi.getMe();
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Try single token refresh on startup if refresh token is present
        const refreshToken = localStorage.getItem('refresh_token') || undefined;
        if (refreshToken) {
          try {
            const refreshRes = await authApi.refresh(refreshToken);
            localStorage.setItem('auth_token', refreshRes.access_token);
            if (refreshRes.refresh_token) {
              localStorage.setItem('refresh_token', refreshRes.refresh_token);
            }
            localStorage.setItem('auth_user', JSON.stringify(refreshRes.user));
            set({
              user: refreshRes.user,
              token: refreshRes.access_token,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
            return;
          } catch (e) {
            // Refresh failed
          }
        }

        // Invalid or expired token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        // Network error: use cached user if present
        const storedUserStr = localStorage.getItem('auth_user');
        let user: User | null = null;
        if (storedUserStr) {
          try {
            user = JSON.parse(storedUserStr);
          } catch (e) {
            user = null;
          }
        }
        set({
          user: user || get().user,
          token,
          isAuthenticated: Boolean(token),
          isInitialized: true,
          isLoading: false,
        });
      }
    }
  },

  logout: () => {
    const refreshToken = localStorage.getItem('refresh_token') || undefined;
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('sentinews_auth_channel');
        bc.postMessage({ type: 'LOGOUT' });
        bc.close();
      }
    } catch (e) {
      // ignore
    }

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

// Multi-tab logout listener
if (typeof window !== 'undefined') {
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('sentinews_auth_channel');
    channel.onmessage = (event) => {
      if (event.data?.type === 'LOGOUT') {
        useAuthStore.getState().logout();
      }
    };
  }

  window.addEventListener('storage', (event) => {
    if (event.key === 'auth_token' && !event.newValue) {
      useAuthStore.getState().logout();
    }
  });
}
