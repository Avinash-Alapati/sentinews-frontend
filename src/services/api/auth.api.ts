import { apiClient } from './client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  GoogleAuthUrlResponse,
  GoogleExchangeRequest,
  GoogleAuthRequest,
} from '@/types/auth.types';

export const authApi = {
  /**
   * Log in user with email & password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  /**
   * Register new user account
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email: credentials.email,
      password: credentials.password,
      full_name: credentials.full_name,
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Get Google OAuth consent URL and CSRF state
   */
  async getGoogleLoginUrl(
    redirectUri?: string,
    returnUrl?: string
  ): Promise<GoogleAuthUrlResponse> {
    const params = new URLSearchParams();
    params.append('redirect', 'false');
    if (redirectUri) params.append('redirect_uri', redirectUri);
    if (returnUrl) params.append('return_url', returnUrl);

    const response = await apiClient.get<GoogleAuthUrlResponse>(
      `/auth/google/login?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Exchange Google authorization code for JWT session
   */
  async exchangeGoogleCode(data: GoogleExchangeRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google/exchange', data);
    return response.data;
  },

  /**
   * Authenticate with Google ID Token (One-Tap / direct credential)
   */
  async loginWithGoogleToken(data: GoogleAuthRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google', data);
    return response.data;
  },

  /**
   * Rotate refresh token and obtain a new short-lived access token
   */
  async refresh(refreshToken?: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Revoke refresh token family on logout
   */
  async logout(refreshToken?: string): Promise<{ detail: string }> {
    const response = await apiClient.post<{ detail: string }>('/auth/logout', {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};
