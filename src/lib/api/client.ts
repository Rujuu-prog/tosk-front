// Real API client implementation
import type { 
  LoginRequest, 
  PasswordResetConfirmRequest,
  PasswordResetResponse, 
  PasswordResetStartRequest, 
  SignupRequest, 
  UserResponse} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Important for cookies
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // Network error
        throw new Error("ネットワークエラーが発生しました。接続を確認してください。");
      }
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<UserResponse> {
    return this.request<UserResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async signup(data: SignupRequest): Promise<UserResponse> {
    return this.request<UserResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async me(): Promise<UserResponse> {
    return this.request<UserResponse>("/auth/me", {
      method: "GET",
    });
  }

  async logout(): Promise<void> {
    return this.request<void>("/auth/logout", {
      method: "POST",
    });
  }

  async refresh(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/auth/refresh", {
      method: "POST",
    });
  }

  async startPasswordReset(data: PasswordResetStartRequest): Promise<PasswordResetResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("email", data.email);

    return this.request<PasswordResetResponse>(`/auth/password/reset/start?${searchParams}`, {
      method: "POST",
    });
  }

  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<PasswordResetResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("token", data.token);
    searchParams.append("password", data.password);

    return this.request<PasswordResetResponse>(`/auth/password/reset/confirm?${searchParams}`, {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();