// API service with mock/real switching
import { apiClient } from "./client";
import { mockApi } from "./mock";
import type { 
  LoginRequest, 
  PasswordResetConfirmRequest,
  PasswordResetResponse, 
  PasswordResetStartRequest, 
  SignupRequest, 
  UserResponse} from "./types";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "api";

interface ApiService {
  login(data: LoginRequest): Promise<UserResponse>;
  signup(data: SignupRequest): Promise<UserResponse>;
  me(): Promise<UserResponse>;
  logout(): Promise<void>;
  refresh(): Promise<void | { status: string }>;
  startPasswordReset(data: PasswordResetStartRequest): Promise<PasswordResetResponse>;
  confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<PasswordResetResponse>;
}

class ApiServiceImpl implements ApiService {
  private isUsingMock: boolean;

  constructor() {
    this.isUsingMock = API_MODE === "mock";
    
    if (typeof window !== "undefined") {
      console.log(`🔧 API Mode: ${this.isUsingMock ? "Mock" : "Real API"}`);
      if (!this.isUsingMock) {
        console.log(`🌐 API Base URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);
      }
    }
  }

  async login(data: LoginRequest): Promise<UserResponse> {
    if (this.isUsingMock) {
      return mockApi.login(data);
    }
    return apiClient.login(data);
  }

  async signup(data: SignupRequest): Promise<UserResponse> {
    if (this.isUsingMock) {
      return mockApi.signup(data);
    }
    return apiClient.signup(data);
  }

  async me(): Promise<UserResponse> {
    if (this.isUsingMock) {
      return mockApi.me();
    }
    return apiClient.me();
  }

  async logout(): Promise<void> {
    if (this.isUsingMock) {
      return mockApi.logout();
    }
    return apiClient.logout();
  }

  async refresh(): Promise<void | { status: string }> {
    if (this.isUsingMock) {
      return mockApi.refresh();
    }
    return apiClient.refresh();
  }

  async startPasswordReset(data: PasswordResetStartRequest): Promise<PasswordResetResponse> {
    if (this.isUsingMock) {
      return mockApi.startPasswordReset(data);
    }
    return apiClient.startPasswordReset(data);
  }

  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<PasswordResetResponse> {
    if (this.isUsingMock) {
      return mockApi.confirmPasswordReset(data);
    }
    return apiClient.confirmPasswordReset(data);
  }

  // Utility method to check current mode
  get isMockMode(): boolean {
    return this.isUsingMock;
  }
}

export const authApi = new ApiServiceImpl();
export type { 
  LoginRequest, 
  PasswordResetConfirmRequest,
  PasswordResetResponse, 
  PasswordResetStartRequest, 
  SignupRequest, 
  UserResponse} from "./types";