import type {
  User,
  Customer,
  Barber,
  BarberShop,
  Service,
  Appointment,
  QueueEntry,
  Review,
  Address
} from './types';

// Mock Services
export const mockServices: Service[] = [
  {
    id: 'service-1',
    name: 'Classic Haircut',
    description: 'Traditional haircut with styling',
    duration: 30,
    price: 25,
    category: 'haircut'
  },
  {
    id: 'service-2',
    name: 'Beard Trim',
    description: 'Professional beard trimming and shaping',
    duration: 15,
    price: 15,
    category: 'beard'
  },
  {
    id: 'service-3',
    name: 'Hair Wash & Style',
    description: 'Complete hair wash and styling service',
    duration: 45,
    price: 35,
    category: 'styling'
  },
  {
    id: 'service-4',
    name: 'Fade Cut',
    description: 'Modern fade haircut with precision',
    duration: 40,
    price: 30,
    category: 'haircut'
  },
  {
    id: 'service-5',
    name: 'Hot Towel Shave',
    description: 'Traditional hot towel shave experience',
    duration: 25,
    price: 28,
    category: 'beard'
  },
  {
    id: 'service-6',
    name: 'Hair Coloring',
    description: 'Professional hair coloring service',
    duration: 90,
    price: 65,
    category: 'coloring'
  },
  {
    id: 'service-7',
    name: 'Scalp Treatment',
    description: 'Relaxing scalp massage and treatment',
    duration: 20,
    price: 20,
    category: 'treatment'
  },
  {
    id: 'service-8',
    name: 'Kids Haircut',
    description: 'Gentle haircut for children',
    duration: 20,
    price: 18,
    category: 'haircut'
  }
];

// Mock Addresses
const mockAddresses: Address[] = [
  {
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA',
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    street: '456 Oak Avenue',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94110',
    country: 'USA',
    latitude: 37.7599,
    longitude: -122.4148
  },
  {
    street: '789 Pine Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94108',
    country: 'USA',
    latitude: 37.7919,
    longitude: -122.4057
  },
  {
    street: '321 Castro Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94114',
    country: 'USA',
    latitude: 37.7609,
    longitude: -122.4350
  },
  {
    street: '654 Mission Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA',
    latitude: 37.7866,
    longitude: -122.4016
  }
];

// Mock Users - Customers
export const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    email: 'john.doe@email.com',
    name: 'John Doe',
    phone: '+1-555-0101',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    preferences: {
      favoriteShops: ['shop-1', 'shop-3'],
      preferredServices: ['service-1', 'service-2'],
      notificationSettings: {
        sms: true,
        email: true,
        push: true
      }
    },
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '100 Market Street, San Francisco, CA'
    },
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2024-12-15T14:20:00Z'
  },
  {
    id: 'customer-2',
    email: 'jane.smith@email.com',
    name: 'Jane Smith',
    phone: '+1-555-0102',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    preferences: {
      favoriteShops: ['shop-2'],
      preferredServices: ['service-3', 'service-6'],
      notificationSettings: {
        sms: false,
        email: true,
        push: true
      }
    },
    location: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: '200 California Street, San Francisco, CA'
    },
    createdAt: '2023-03-22T09:15:00Z',
    updatedAt: '2024-12-14T16:45:00Z'
  },
  {
    id: 'customer-3',
    email: 'mike.wilson@email.com',
    name: 'Mike Wilson',
    phone: '+1-555-0103',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    preferences: {
      favoriteShops: ['shop-1', 'shop-4'],
      preferredServices: ['service-4', 'service-5'],
      notificationSettings: {
        sms: true,
        email: false,
        push: true
      }
    },
    createdAt: '2023-05-10T11:00:00Z',
    updatedAt: '2024-12-13T13:30:00Z'
  }
];

// Mock Users - Barbers
export const mockBarbers: Barber[] = [
  {
    id: 'barber-1',
    email: 'alex.martinez@email.com',
    name: 'Alex Martinez',
    phone: '+1-555-0201',
    role: 'barber',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    shopId: 'shop-1',
    specialties: ['Classic Cuts', 'Beard Styling', 'Hot Towel Shaves'],
    workingHours: {
      monday: { start: '09:00', end: '18:00', isWorking: true },
      tuesday: { start: '09:00', end: '18:00', isWorking: true },
      wednesday: { start: '09:00', end: '18:00', isWorking: true },
      thursday: { start: '09:00', end: '18:00', isWorking: true },
      friday: { start: '09:00', end: '19:00', isWorking: true },
      saturday: { start: '08:00', end: '17:00', isWorking: true },
      sunday: { start: '10:00', end: '15:00', isWorking: false }
    },
    averageServiceTime: 35,
    isActive: true,
    createdAt: '2022-08-20T08:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z'
  },
  {
    id: 'barber-2',
    email: 'sarah.johnson@email.com',
    name: 'Sarah Johnson',
    phone: '+1-555-0202',
    role: 'barber',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    shopId: 'shop-2',
    specialties: ['Modern Cuts', 'Hair Coloring', 'Styling'],
    workingHours: {
      monday: { start: '10:00', end: '19:00', isWorking: true },
      tuesday: { start: '10:00', end: '19:00', isWorking: true },
      wednesday: { start: '10:00', end: '19:00', isWorking: false },
      thursday: { start: '10:00', end: '19:00', isWorking: true },
      friday: { start: '10:00', end: '20:00', isWorking: true },
      saturday: { start: '09:00', end: '18:00', isWorking: true },
      sunday: { start: '11:00', end: '16:00', isWorking: true }
    },
    averageServiceTime: 42,
    isActive: true,
    createdAt: '2022-11-15T12:00:00Z',
    updatedAt: '2024-12-15T09:30:00Z'
  },
  {
    id: 'barber-3',
    email: 'david.chen@email.com',
    name: 'David Chen',
    phone: '+1-555-0203',
    role: 'barber',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
    shopId: 'shop-1',
    specialties: ['Fade Cuts', 'Precision Styling', 'Hair Treatments'],
    workingHours: {
      monday: { start: '08:00', end: '17:00', isWorking: true },
      tuesday: { start: '08:00', end: '17:00', isWorking: true },
      wednesday: { start: '08:00', end: '17:00', isWorking: true },
      thursday: { start: '08:00', end: '17:00', isWorking: true },
      friday: { start: '08:00', end: '18:00', isWorking: true },
      saturday: { start: '09:00', end: '16:00', isWorking: true },
      sunday: { start: '10:00', end: '14:00', isWorking: false }
    },
    averageServiceTime: 38,
    isActive: true,
    createdAt: '2023-02-10T07:30:00Z',
    updatedAt: '2024-12-14T15:45:00Z'
  }
];

// Mock Barber Shops
export const mockBarberShops: BarberShop[] = [
  {
    id: 'shop-1',
    name: 'Classic Cuts Barbershop',
    description: 'Traditional barbershop experience with modern techniques. Expert barbers providing quality cuts since 1985.',
    address: mockAddresses[0],
    phone: '+1-555-1001',
    email: 'info@classiccuts.com',
    website: 'https://classiccuts.com',
    images: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=600&fit=crop'
    ],
    owner: 'barber-1',
    services: ['service-1', 'service-2', 'service-4', 'service-5', 'service-7'],
    barbers: ['barber-1', 'barber-3'],
    operatingHours: {
      monday: { open: '08:00', close: '18:00', isClosed: false },
      tuesday: { open: '08:00', close: '18:00', isClosed: false },
      wednesday: { open: '08:00', close: '18:00', isClosed: false },
      thursday: { open: '08:00', close: '18:00', isClosed: false },
      friday: { open: '08:00', close: '19:00', isClosed: false },
      saturday: { open: '08:00', close: '17:00', isClosed: false },
      sunday: { open: '10:00', close: '15:00', isClosed: true }
    },
    settings: {
      maxAdvanceBookingDays: 14,
      slotDuration: 30,
      bufferTime: 5,
      acceptsWalkIns: true,
      requiresDeposit: false,
      cancellationPolicy: 'Cancel at least 2 hours in advance to avoid charges.'
    },
    stats: {
      totalReviews: 127,
      averageRating: 4.6,
      averageWaitTime: 18,
      completedAppointments: 1543
    },
    isActive: true,
    createdAt: '2022-08-20T08:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z'
  },
  {
    id: 'shop-2',
    name: 'Modern Mane Studio',
    description: 'Contemporary salon offering the latest in hair fashion and styling. Specializing in color and modern cuts.',
    address: mockAddresses[1],
    phone: '+1-555-1002',
    email: 'hello@modernmane.com',
    website: 'https://modernmane.com',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop'
    ],
    owner: 'barber-2',
    services: ['service-1', 'service-3', 'service-6', 'service-7', 'service-8'],
    barbers: ['barber-2'],
    operatingHours: {
      monday: { open: '10:00', close: '19:00', isClosed: false },
      tuesday: { open: '10:00', close: '19:00', isClosed: false },
      wednesday: { open: '10:00', close: '19:00', isClosed: true },
      thursday: { open: '10:00', close: '19:00', isClosed: false },
      friday: { open: '10:00', close: '20:00', isClosed: false },
      saturday: { open: '09:00', close: '18:00', isClosed: false },
      sunday: { open: '11:00', close: '16:00', isClosed: false }
    },
    settings: {
      maxAdvanceBookingDays: 21,
      slotDuration: 45,
      bufferTime: 10,
      acceptsWalkIns: false,
      requiresDeposit: true,
      cancellationPolicy: 'Cancel at least 24 hours in advance. Deposit non-refundable for same-day cancellations.'
    },
    stats: {
      totalReviews: 89,
      averageRating: 4.8,
      averageWaitTime: 12,
      completedAppointments: 967
    },
    isActive: true,
    createdAt: '2022-11-15T12:00:00Z',
    updatedAt: '2024-12-15T09:30:00Z'
  },
  {
    id: 'shop-3',
    name: 'Downtown Barbers',
    description: 'Convenient downtown location serving busy professionals. Quick, quality cuts for people on the go.',
    address: mockAddresses[2],
    phone: '+1-555-1003',
    email: 'contact@downtownbarbers.com',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=600&fit=crop'
    ],
    owner: 'barber-1',
    services: ['service-1', 'service-2', 'service-4'],
    barbers: ['barber-1'],
    operatingHours: {
      monday: { open: '07:00', close: '19:00', isClosed: false },
      tuesday: { open: '07:00', close: '19:00', isClosed: false },
      wednesday: { open: '07:00', close: '19:00', isClosed: false },
      thursday: { open: '07:00', close: '19:00', isClosed: false },
      friday: { open: '07:00', close: '20:00', isClosed: false },
      saturday: { open: '08:00', close: '18:00', isClosed: false },
      sunday: { open: '09:00', close: '17:00', isClosed: false }
    },
    settings: {
      maxAdvanceBookingDays: 7,
      slotDuration: 20,
      bufferTime: 5,
      acceptsWalkIns: true,
      requiresDeposit: false,
      cancellationPolicy: 'Cancel at least 1 hour in advance.'
    },
    stats: {
      totalReviews: 203,
      averageRating: 4.4,
      averageWaitTime: 25,
      completedAppointments: 2156
    },
    isActive: true,
    createdAt: '2023-01-10T10:00:00Z',
    updatedAt: '2024-12-14T16:20:00Z'
  },
  {
    id: 'shop-4',
    name: "The Gentleman's Cut",
    description: 'Upscale barbershop offering premium grooming services. Complimentary beverages and luxury experience.',
    address: mockAddresses[3],
    phone: '+1-555-1004',
    email: 'info@gentlemanscut.com',
    website: 'https://gentlemanscut.com',
    images: [
      'https://images.unsplash.com/photo-1567552020052-8d4f3c0cd23a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop'
    ],
    owner: 'barber-3',
    services: ['service-1', 'service-2', 'service-4', 'service-5', 'service-7'],
    barbers: ['barber-3'],
    operatingHours: {
      monday: { open: '09:00', close: '20:00', isClosed: false },
      tuesday: { open: '09:00', close: '20:00', isClosed: false },
      wednesday: { open: '09:00', close: '20:00', isClosed: false },
      thursday: { open: '09:00', close: '20:00', isClosed: false },
      friday: { open: '09:00', close: '21:00', isClosed: false },
      saturday: { open: '08:00', close: '19:00', isClosed: false },
      sunday: { open: '10:00', close: '18:00', isClosed: false }
    },
    settings: {
      maxAdvanceBookingDays: 30,
      slotDuration: 60,
      bufferTime: 15,
      acceptsWalkIns: false,
      requiresDeposit: true,
      cancellationPolicy: 'Cancel at least 24 hours in advance. 50% deposit required for booking.'
    },
    stats: {
      totalReviews: 156,
      averageRating: 4.9,
      averageWaitTime: 8,
      completedAppointments: 1203
    },
    isActive: true,
    createdAt: '2023-02-10T07:30:00Z',
    updatedAt: '2024-12-14T15:45:00Z'
  },
  {
    id: 'shop-5',
    name: 'Quick Cuts Express',
    description: 'Fast and affordable haircuts for the whole family. No appointment necessary, first come first served.',
    address: mockAddresses[4],
    phone: '+1-555-1005',
    images: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop'
    ],
    owner: 'barber-2',
    services: ['service-1', 'service-8'],
    barbers: ['barber-2'],
    operatingHours: {
      monday: { open: '08:00', close: '20:00', isClosed: false },
      tuesday: { open: '08:00', close: '20:00', isClosed: false },
      wednesday: { open: '08:00', close: '20:00', isClosed: false },
      thursday: { open: '08:00', close: '20:00', isClosed: false },
      friday: { open: '08:00', close: '21:00', isClosed: false },
      saturday: { open: '07:00', close: '21:00', isClosed: false },
      sunday: { open: '09:00', close: '19:00', isClosed: false }
    },
    settings: {
      maxAdvanceBookingDays: 1,
      slotDuration: 15,
      bufferTime: 2,
      acceptsWalkIns: true,
      requiresDeposit: false,
      cancellationPolicy: 'Walk-ins welcome. No appointment necessary.'
    },
    stats: {
      totalReviews: 67,
      averageRating: 4.1,
      averageWaitTime: 35,
      completedAppointments: 3421
    },
    isActive: true,
    createdAt: '2023-04-05T14:00:00Z',
    updatedAt: '2024-12-13T18:10:00Z'
  }
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'appointment-1',
    customerId: 'customer-1',
    barberId: 'barber-1',
    shopId: 'shop-1',
    services: ['service-1', 'service-2'],
    totalDuration: 45,
    totalPrice: 40,
    requestedAt: '2024-12-15T09:00:00Z',
    scheduledAt: '2024-12-15T14:30:00Z',
    estimatedStartTime: '2024-12-15T14:30:00Z',
    estimatedEndTime: '2024-12-15T15:15:00Z',
    status: 'confirmed',
    queuePosition: 1,
    estimatedWaitTime: 0,
    notes: 'Regular customer, prefers shorter sides',
    notifications: {
      bookingConfirmed: true,
      reminderSent: false,
      readyForService: false
    },
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-15T09:05:00Z'
  },
  {
    id: 'appointment-2',
    customerId: 'customer-2',
    barberId: 'barber-2',
    shopId: 'shop-2',
    services: ['service-3', 'service-6'],
    totalDuration: 135,
    totalPrice: 100,
    requestedAt: '2024-12-15T10:30:00Z',
    scheduledAt: '2024-12-15T16:00:00Z',
    estimatedStartTime: '2024-12-15T16:00:00Z',
    estimatedEndTime: '2024-12-15T18:15:00Z',
    status: 'pending',
    queuePosition: 2,
    estimatedWaitTime: 45,
    notes: 'First time customer, wants balayage highlights',
    specialRequests: 'Allergic to PPD in hair dye',
    notifications: {
      bookingConfirmed: false,
      reminderSent: false,
      readyForService: false
    },
    createdAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-15T10:30:00Z'
  },
  {
    id: 'appointment-3',
    customerId: 'customer-3',
    barberId: 'barber-3',
    shopId: 'shop-4',
    services: ['service-4', 'service-5'],
    totalDuration: 65,
    totalPrice: 58,
    requestedAt: '2024-12-14T15:00:00Z',
    scheduledAt: '2024-12-14T17:00:00Z',
    estimatedStartTime: '2024-12-14T17:00:00Z',
    actualStartTime: '2024-12-14T17:10:00Z',
    estimatedEndTime: '2024-12-14T18:05:00Z',
    actualEndTime: '2024-12-14T18:20:00Z',
    status: 'completed',
    queuePosition: 0,
    estimatedWaitTime: 0,
    notes: 'Regular monthly appointment',
    notifications: {
      bookingConfirmed: true,
      reminderSent: true,
      readyForService: true
    },
    createdAt: '2024-12-14T15:00:00Z',
    updatedAt: '2024-12-14T18:25:00Z'
  }
];

// Mock Queue Entries
export const mockQueueEntries: QueueEntry[] = [
  {
    appointmentId: 'appointment-1',
    customerId: 'customer-1',
    barberId: 'barber-1',
    shopId: 'shop-1',
    position: 1,
    estimatedWaitTime: 0,
    estimatedServiceTime: '2024-12-15T14:30:00Z',
    priority: 'normal',
    status: 'waiting',
    joinedAt: '2024-12-15T09:00:00Z'
  },
  {
    appointmentId: 'appointment-2',
    customerId: 'customer-2',
    barberId: 'barber-2',
    shopId: 'shop-2',
    position: 2,
    estimatedWaitTime: 45,
    estimatedServiceTime: '2024-12-15T16:45:00Z',
    priority: 'normal',
    status: 'waiting',
    joinedAt: '2024-12-15T10:30:00Z'
  }
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 'review-1',
    customerId: 'customer-1',
    shopId: 'shop-1',
    barberId: 'barber-1',
    appointmentId: 'appointment-1',
    rating: 5,
    title: 'Excellent service!',
    comment: 'Alex did an amazing job with my haircut. Very professional and friendly. The shop has a great atmosphere.',
    ratings: {
      service: 5,
      cleanliness: 5,
      punctuality: 4,
      friendliness: 5,
      value: 5
    },
    isVerified: true,
    isAnonymous: false,
    helpfulCount: 12,
    createdAt: '2024-12-10T18:30:00Z',
    updatedAt: '2024-12-10T18:30:00Z'
  },
  {
    id: 'review-2',
    customerId: 'customer-2',
    shopId: 'shop-2',
    barberId: 'barber-2',
    appointmentId: 'appointment-2',
    rating: 4,
    title: 'Great color work',
    comment: 'Sarah did exactly what I wanted with my highlights. Took longer than expected but the results were worth it.',
    ratings: {
      service: 5,
      cleanliness: 4,
      punctuality: 3,
      friendliness: 5,
      value: 4
    },
    isVerified: true,
    isAnonymous: false,
    helpfulCount: 8,
    createdAt: '2024-12-12T19:45:00Z',
    updatedAt: '2024-12-12T19:45:00Z'
  },
  {
    id: 'review-3',
    customerId: 'customer-3',
    shopId: 'shop-4',
    barberId: 'barber-3',
    appointmentId: 'appointment-3',
    rating: 5,
    title: 'Premium experience',
    comment: "The Gentleman's Cut lives up to its name. David is incredibly skilled and the luxury experience is worth every penny.",
    ratings: {
      service: 5,
      cleanliness: 5,
      punctuality: 5,
      friendliness: 5,
      value: 4
    },
    isVerified: true,
    isAnonymous: false,
    helpfulCount: 15,
    createdAt: '2024-12-14T19:00:00Z',
    updatedAt: '2024-12-14T19:00:00Z'
  }
];

// Mock All Users (combined)
export const mockUsers: User[] = [...mockCustomers, ...mockBarbers];

// Helper function to get current queue for a shop
export function getCurrentQueue(shopId: string): QueueEntry[] {
  return mockQueueEntries
    .filter(entry => entry.shopId === shopId && entry.status === 'waiting')
    .sort((a, b) => a.position - b.position);
}

// Helper function to get shop by ID
export function getShopById(shopId: string): BarberShop | undefined {
  return mockBarberShops.find(shop => shop.id === shopId);
}

// Helper function to get user by ID
export function getUserById(userId: string): User | undefined {
  return mockUsers.find(user => user.id === userId);
}

// Helper function to get service by ID
export function getServiceById(serviceId: string): Service | undefined {
  return mockServices.find(service => service.id === serviceId);
}

// Helper function to calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

// Helper function to simulate real-time queue wait times
export function calculateWaitTime(shopId: string, position: number): number {
  const shop = getShopById(shopId);
  if (!shop) return 0;
  
  // Base calculation: position * average service time
  const baseWaitTime = position * shop.stats.averageWaitTime;
  
  // Add some randomness to simulate real conditions
  const variance = Math.random() * 10 - 5; // ±5 minutes variance
  
  return Math.max(0, Math.round(baseWaitTime + variance));
}