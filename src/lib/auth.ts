import { User } from './types';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

/**
 * Login user via API
 */
export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

/**
 * Sign up user via API
 */
export const signupUser = async (name: string, email: string, password: string): Promise<AuthResult> => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

/**
 * Logout user via API
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Get current user from server
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.user : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};