
import { User } from '../types/user';

export const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const saveUserToStorage = (user: User | null): void => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const clearUserStorage = (): void => {
  localStorage.removeItem('user');
};

export const getLanguageFromStorage = (): string => {
  return localStorage.getItem('language') || 'en';
};

export const saveLanguageToStorage = (language: string): void => {
  localStorage.setItem('language', language);
};
