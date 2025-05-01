import { User, UserAddress } from '../../types/user';

// User state definition
export interface UserState {
  user: User | null;
  language: string;
}

// Action types
export type UserAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'ADD_ADDRESS'; payload: UserAddress }
  | { type: 'UPDATE_ADDRESS'; payload: UserAddress }
  | { type: 'DELETE_ADDRESS'; payload: string }
  | { type: 'SET_DEFAULT_ADDRESS'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: string };

// Context type definition
export interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  language: string;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  changeLanguage: (lang: string) => void;
  deleteAccount: () => Promise<boolean>;
  deleteAddress: (id: string) => void;
}
