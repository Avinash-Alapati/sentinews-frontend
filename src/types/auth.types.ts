export interface User {
  id: number | string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  role?: 'user' | 'admin' | 'pro';
  avatar_url?: string;
  profile_image?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  password?: string;
  full_name?: string;
}

export interface GoogleAuthUrlResponse {
  authorization_url: string;
  state: string;
}

export interface GoogleExchangeRequest {
  code: string;
  redirect_uri?: string;
}

export interface GoogleAuthRequest {
  id_token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
