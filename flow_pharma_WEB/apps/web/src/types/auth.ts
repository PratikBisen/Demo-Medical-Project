export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  language: string;
  phone?: string;
  createdAt: string;
}

export interface AuthSession {
  user: ApiUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  preferredLanguage: string;
  accountType: string;
}

export interface AuthResponse {
  session: AuthSession | null;
  redirectTo: string | null;
  demo: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
