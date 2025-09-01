// API Request/Response Types
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

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  displayName: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  errorCode?: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PasswordResetStartRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
}

export interface PasswordResetResponse {
  status: string;
}