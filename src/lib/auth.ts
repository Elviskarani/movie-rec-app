import { User, UserWithPassword } from './types';
import { setStorageItem, getStorageItem, removeStorageItem } from './storage';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export const loginUser = (email: string, password: string): AuthResult => {
  const users = getStorageItem<UserWithPassword[]>('users') || [];
  const foundUser = users.find(u => u.email === email && u.password === password);
  
  if (foundUser) {
    const userSession: User = { 
      id: foundUser.id, 
      email: foundUser.email, 
      name: foundUser.name 
    };
    setStorageItem('user', userSession);
    return { success: true };
  }
  return { success: false, error: 'Invalid credentials' };
};

export const signupUser = (name: string, email: string, password: string): AuthResult => {
  const users = getStorageItem<UserWithPassword[]>('users') || [];
  
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'Email already exists' };
  }

  const newUser: UserWithPassword = {
    id: Date.now(),
    name,
    email,
    password
  };

  users.push(newUser);
  setStorageItem('users', users);
  
  const userSession: User = { 
    id: newUser.id, 
    email: newUser.email, 
    name: newUser.name 
  };
  setStorageItem('user', userSession);
  
  return { success: true };
};

export const logoutUser = (): void => {
  removeStorageItem('user');
  removeStorageItem('userPreferences');
};

export const getCurrentUser = (): User | null => {
  return getStorageItem<User>('user');
};