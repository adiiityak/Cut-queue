import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment } from '../shared/types';

interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => void;
  getAppointmentsForCustomer: (customerId: string) => Appointment[];
  getAppointmentsForBarber: (barberId: string) => Appointment[];
  getAppointmentsForShop: (shopId: string) => Appointment[];
  getPendingAppointmentsForShop: (shopId: string) => Appointment[];
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }
  return context;
}

interface AppointmentsProviderProps {
  children: React.ReactNode;
}

export function AppointmentsProvider({ children }: AppointmentsProviderProps) {
  // Initialize with a test appointment for demo purposes
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'demo-appointment-1',
      customerId: 'customer-1',
      shopId: 'shop-1',
      barberId: 'barber-1',
      services: ['service-1'],
      totalDuration: 30,
      totalPrice: 25,
      requestedAt: new Date().toISOString(),
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      estimatedStartTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      estimatedEndTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      queuePosition: 1,
      estimatedWaitTime: 15,
      notes: 'Please use scissors only, no clippers. Demo appointment for testing.',
      specialRequests: 'Please use scissors only, no clippers. Demo appointment for testing.',
      notifications: {
        bookingConfirmed: false,
        reminderSent: false,
        readyForService: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Load appointments from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('queuecut_appointments');
    if (stored) {
      try {
        setAppointments(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load appointments:', error);
      }
    }
  }, []);

  // Save appointments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('queuecut_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = (appointment: Appointment) => {
    console.log('Adding appointment:', appointment);
    setAppointments(prev => {
      const updated = [...prev, appointment];
      console.log('Updated appointments:', updated);
      return updated;
    });
  };

  const updateAppointment = (appointmentId: string, updates: Partial<Appointment>) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
          : apt
      )
    );
  };

  const getAppointmentsForCustomer = (customerId: string) => {
    return appointments
      .filter(apt => apt.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getAppointmentsForBarber = (barberId: string) => {
    return appointments
      .filter(apt => apt.barberId === barberId)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  };

  const getAppointmentsForShop = (shopId: string) => {
    return appointments
      .filter(apt => apt.shopId === shopId)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  };

  const getPendingAppointmentsForShop = (shopId: string) => {
    console.log('Getting pending appointments for shop:', shopId);
    console.log('All appointments:', appointments);
    const pending = appointments
      .filter(apt => apt.shopId === shopId && apt.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    console.log('Pending appointments for shop:', pending);
    return pending;
  };

  const value: AppointmentsContextType = {
    appointments,
    addAppointment,
    updateAppointment,
    getAppointmentsForCustomer,
    getAppointmentsForBarber,
    getAppointmentsForShop,
    getPendingAppointmentsForShop,
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}