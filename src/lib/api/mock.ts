// Mock API implementation for development
import type { 
  LoginRequest, 
  PasswordResetConfirmRequest,
  PasswordResetResponse, 
  PasswordResetStartRequest, 
  SignupRequest, 
  UserResponse} from "./types";

// Mock delay to simulate network request
const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 800));

// Mock user storage (in-memory for demo)
const mockUsers: Array<UserResponse & { password: string }> = [];

export const mockApi = {
  async login(data: LoginRequest): Promise<UserResponse> {
    await mockDelay();
    
    const user = mockUsers.find(
      (u) => u.email === data.email && u.password === data.password
    );

    if (!user) {
      throw new Error("メールアドレスまたはパスワードが間違っています");
    }

    // Remove password from response
    const { password, ...userResponse } = user;
    return userResponse;
  },

  async signup(data: SignupRequest): Promise<UserResponse> {
    await mockDelay();

    // Check if email or username already exists
    const existingUser = mockUsers.find(
      (u) => u.email === data.email || u.username === data.username
    );

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error("このメールアドレスは既に使用されています");
      }
      if (existingUser.username === data.username) {
        throw new Error("このユーザー名は既に使用されています");
      }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      password: data.password,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    // Remove password from response
    const { password, ...userResponse } = newUser;
    return userResponse;
  },

  async me(): Promise<UserResponse> {
    await mockDelay();
    
    // Return the first user as mock authenticated user
    const user = mockUsers[0];
    if (!user) {
      throw new Error("認証が必要です");
    }

    const { password, ...userResponse } = user;
    return userResponse;
  },

  async logout(): Promise<void> {
    await mockDelay();
    // Mock logout (no actual implementation needed for mock)
  },

  async refresh(): Promise<void> {
    await mockDelay();
    // Mock refresh (no actual implementation needed for mock)
  },

  async startPasswordReset(data: PasswordResetStartRequest): Promise<PasswordResetResponse> {
    await mockDelay();
    
    // Mock implementation - always succeeds for demo
    console.log(`Mock: Password reset requested for ${data.email}`);
    
    return {
      status: "reset_started"
    };
  },

  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<PasswordResetResponse> {
    await mockDelay();
    
    // Mock implementation - accept any token for demo
    if (data.token.length < 10) {
      throw new Error("無効なトークンです");
    }
    
    console.log(`Mock: Password reset confirmed with token ${data.token}`);
    
    return {
      status: "password_reset"
    };
  },
};