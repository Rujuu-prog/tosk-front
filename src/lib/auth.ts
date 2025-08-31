import { ErrorResponse, LoginRequest, SignupRequest, User } from './types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Mock data for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    username: 'testuser',
    displayName: 'Test User',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class AuthService {
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}/api/auth${endpoint}`;
    
    return fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  }

  async login(credentials: LoginRequest): Promise<User> {
    if (USE_MOCK) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const user = mockUsers.find(u => u.email === credentials.email);
      if (!user || credentials.password !== 'password') {
        throw new Error('Invalid credentials');
      }
      
      // Store mock auth state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return user;
    }

    const response = await this.apiCall('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    // After successful login, get user info
    return this.getCurrentUser();
  }

  async signup(userData: SignupRequest): Promise<User> {
    if (USE_MOCK) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (mockUsers.some(u => u.email === userData.email)) {
        throw new Error('User already exists');
      }
      
      const newUser: User = {
        id: String(mockUsers.length + 1),
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockUsers.push(newUser);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      return newUser;
    }

    const response = await this.apiCall('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    if (USE_MOCK) {
      // Mock implementation
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
      return;
    }

    const response = await this.apiCall('/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      console.warn('Logout failed, but clearing local state');
    }
  }

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK) {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        throw new Error('Not authenticated');
      }
      return JSON.parse(userStr);
    }

    const response = await this.apiCall('/me');

    if (!response.ok) {
      throw new Error('Not authenticated');
    }

    return response.json();
  }

  async refreshToken(): Promise<void> {
    if (USE_MOCK) {
      // Mock implementation - just check if user exists
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        throw new Error('Not authenticated');
      }
      return;
    }

    const response = await this.apiCall('/refresh', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    if (USE_MOCK) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Password reset email sent to ${email} (mock)`);
      return;
    }

    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append('email', email);

    const response = await this.apiCall('/password/reset/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    if (USE_MOCK) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password reset confirmed (mock)');
      return;
    }

    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append('token', token);
    formData.append('password', password);

    const response = await this.apiCall('/password/reset/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Password reset confirmation failed');
    }
  }

  isAuthenticated(): boolean {
    if (USE_MOCK) {
      return localStorage.getItem('isAuthenticated') === 'true';
    }
    
    // For real API, we'll check if we can get current user
    // This is handled by the auth context
    return false;
  }
}

export const authService = new AuthService();