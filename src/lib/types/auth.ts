export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message?: string;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  requestId?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}