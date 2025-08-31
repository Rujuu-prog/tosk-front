// Security utility functions

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .trim();
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5322 limit
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("パスワードは8文字以上で入力してください");
  }
  
  if (password.length > 128) {
    errors.push("パスワードは128文字以下で入力してください");
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push("パスワードは英字を含む必要があります");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("パスワードは数字を含む必要があります");
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /(.)\1{3,}/, // Same character repeated 4+ times
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push("より複雑なパスワードを設定してください");
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Username validation
export function validateUsername(username: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push("ユーザー名は3文字以上で入力してください");
  }

  if (username.length > 30) {
    errors.push("ユーザー名は30文字以下で入力してください");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push("ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます");
  }

  // Reserved usernames
  const reservedNames = [
    "admin", "administrator", "root", "api", "www", "mail", "ftp", "test",
    "user", "guest", "anonymous", "null", "undefined", "system", "support"
  ];

  if (reservedNames.includes(username.toLowerCase())) {
    errors.push("このユーザー名は使用できません");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Rate limiting for client-side (simple implementation)
class SimpleRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canAttempt(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      return true;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.delete(key);
      return true;
    }

    return record.count < this.maxAttempts;
  }

  recordAttempt(key: string, success: boolean = false): void {
    const now = Date.now();
    const record = this.attempts.get(key) || { count: 0, lastAttempt: now };

    if (success) {
      // Reset on successful login
      this.attempts.delete(key);
      return;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return;
    }

    // Increment failed attempts
    record.count += 1;
    record.lastAttempt = now;
    this.attempts.set(key, record);
  }

  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return this.maxAttempts;
    
    const now = Date.now();
    if (now - record.lastAttempt > this.windowMs) {
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - record.count);
  }

  getResetTime(key: string): number | null {
    const record = this.attempts.get(key);
    if (!record) return null;

    return record.lastAttempt + this.windowMs;
  }
}

export const loginRateLimiter = new SimpleRateLimiter();

// Environment validation
export function validateEnvironment(): {
  isSecure: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let isSecure = true;

  // Check if in production and using HTTP
  if (typeof window !== "undefined") {
    const isProduction = process.env.NODE_ENV === "production";
    const isHTTPS = window.location.protocol === "https:";

    if (isProduction && !isHTTPS) {
      warnings.push("本番環境でHTTPSを使用していません");
      isSecure = false;
    }

    // Check for development mode in production
    if (isProduction && process.env.NEXT_PUBLIC_APP_ENV === "development") {
      warnings.push("本番環境で開発モードが有効になっています");
      isSecure = false;
    }
  }

  return { isSecure, warnings };
}