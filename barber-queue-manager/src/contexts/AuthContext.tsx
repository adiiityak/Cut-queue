import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Customer, Barber } from '@/shared/types';
import { mockUsers } from '@/shared/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, userType: 'customer' | 'barber') => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: 'customer' | 'barber';
  shopId?: string; // Required for barbers
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('queuecut_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('queuecut_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, userType: 'customer' | 'barber'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data (in real app, this would be an API call)
      const foundUser = mockUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.role === userType
      );
      
      if (foundUser) {
        // In a real app, you'd verify the password here
        // For demo purposes, any password works
        setUser(foundUser);
        localStorage.setItem('queuecut_user', JSON.stringify(foundUser));
        return true;
      } else {
        // If not found in mock data, create a demo user
        let newUser: User;
        
        if (userType === 'customer') {
          newUser = {
            id: email === 'demo@customer.com' ? 'customer-1' : `customer-${Date.now()}`,
            email,
            name: email.split('@')[0],
            role: 'customer',
            preferences: {
              favoriteShops: [],
              preferredServices: [],
              notificationSettings: {
                sms: true,
                email: true,
                push: true
              }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Customer;
        } else {
          newUser = {
            id: email === 'demo@barber.com' ? 'barber-1' : `barber-${Date.now()}`,
            email,
            name: email.split('@')[0],
            role: 'barber',
            shopId: 'shop-1', // Default to first shop
            specialties: ['General Haircuts'],
            workingHours: {
              monday: { start: '09:00', end: '17:00', isWorking: true },
              tuesday: { start: '09:00', end: '17:00', isWorking: true },
              wednesday: { start: '09:00', end: '17:00', isWorking: true },
              thursday: { start: '09:00', end: '17:00', isWorking: true },
              friday: { start: '09:00', end: '17:00', isWorking: true },
              saturday: { start: '09:00', end: '15:00', isWorking: true },
              sunday: { start: '10:00', end: '14:00', isWorking: false }
            },
            averageServiceTime: 30,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Barber;
        }
        
        setUser(newUser);
        localStorage.setItem('queuecut_user', JSON.stringify(newUser));
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists
      const existingUser = mockUsers.find(
        u => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (existingUser) {
        return false; // User already exists
      }
      
      // Create new user
      let newUser: User;
      
      if (userData.userType === 'customer') {
        newUser = {
          id: `customer-${Date.now()}`,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          role: 'customer',
          preferences: {
            favoriteShops: [],
            preferredServices: [],
            notificationSettings: {
              sms: true,
              email: true,
              push: true
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Customer;
      } else {
        newUser = {
          id: `barber-${Date.now()}`,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          role: 'barber',
          shopId: userData.shopId || 'shop-1',
          specialties: ['General Haircuts'],
          workingHours: {
            monday: { start: '09:00', end: '17:00', isWorking: true },
            tuesday: { start: '09:00', end: '17:00', isWorking: true },
            wednesday: { start: '09:00', end: '17:00', isWorking: true },
            thursday: { start: '09:00', end: '17:00', isWorking: true },
            friday: { start: '09:00', end: '17:00', isWorking: true },
            saturday: { start: '09:00', end: '15:00', isWorking: true },
            sunday: { start: '10:00', end: '14:00', isWorking: false }
          },
          averageServiceTime: 30,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Barber;
      }
      
      setUser(newUser);
      localStorage.setItem('queuecut_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('queuecut_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() } as User;
      setUser(updatedUser);
      localStorage.setItem('queuecut_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}