// User and Authentication Types
export type UserRole = 'customer' | 'barber';

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends BaseUser {
  role: 'customer';
  preferences: {
    favoriteShops: string[];
    preferredServices: string[];
    notificationSettings: {
      sms: boolean;
      email: boolean;
      push: boolean;
    };
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Barber extends BaseUser {
  role: 'barber';
  shopId: string;
  specialties: string[];
  workingHours: {
    [key: string]: {
      start: string; // HH:MM format
      end: string;   // HH:MM format
      isWorking: boolean;
    };
  };
  averageServiceTime: number; // minutes
  isActive: boolean;
}

export type User = Customer | Barber;

// Location and Address Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: 'haircut' | 'styling' | 'coloring' | 'beard' | 'treatment' | 'other';
}

// Barber Shop Types
export interface BarberShop {
  id: string;
  name: string;
  description: string;
  address: Address;
  phone: string;
  email?: string;
  website?: string;
  images: string[];
  
  // Business Information
  owner: string; // User ID
  services: string[]; // Service IDs
  barbers: string[]; // Barber IDs
  
  // Operating Hours
  operatingHours: {
    [key: string]: {
      open: string; // HH:MM format
      close: string; // HH:MM format
      isClosed: boolean;
    };
  };
  
  // Settings
  settings: {
    maxAdvanceBookingDays: number;
    slotDuration: number; // minutes
    bufferTime: number; // minutes between appointments
    acceptsWalkIns: boolean;
    requiresDeposit: boolean;
    cancellationPolicy: string;
  };
  
  // Statistics and Ratings
  stats: {
    totalReviews: number;
    averageRating: number;
    averageWaitTime: number; // minutes
    completedAppointments: number;
  };
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Queue and Appointment Types
export type AppointmentStatus = 
  | 'pending'     // Requested by customer, awaiting barber acceptance
  | 'confirmed'   // Accepted by barber
  | 'in_progress' // Customer is being served
  | 'completed'   // Service completed
  | 'cancelled'   // Cancelled by customer or barber
  | 'no_show';    // Customer didn't show up

export interface Appointment {
  id: string;
  customerId: string;
  barberId: string;
  shopId: string;
  
  // Service Details
  services: string[]; // Service IDs
  totalDuration: number; // minutes
  totalPrice: number;
  
  // Timing
  requestedAt: string;
  scheduledAt: string;
  estimatedStartTime: string;
  actualStartTime?: string;
  estimatedEndTime: string;
  actualEndTime?: string;
  
  // Status and Queue Info
  status: AppointmentStatus;
  queuePosition: number;
  estimatedWaitTime: number; // minutes until service starts
  
  // Additional Info
  notes?: string;
  specialRequests?: string;
  
  // Notifications
  notifications: {
    bookingConfirmed: boolean;
    reminderSent: boolean;
    readyForService: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
}

// Queue Management Types
export interface QueueEntry {
  appointmentId: string;
  customerId: string;
  barberId: string;
  shopId: string;
  position: number;
  estimatedWaitTime: number;
  estimatedServiceTime: string;
  priority: 'normal' | 'high' | 'vip';
  status: 'waiting' | 'called' | 'in_service' | 'completed';
  joinedAt: string;
  calledAt?: string;
  serviceStartedAt?: string;
}

// Review and Rating Types
export interface Review {
  id: string;
  customerId: string;
  shopId: string;
  barberId?: string;
  appointmentId: string;
  
  rating: number; // 1-5
  title?: string;
  comment?: string;
  
  // Detailed ratings
  ratings: {
    service: number;
    cleanliness: number;
    punctuality: number;
    friendliness: number;
    value: number;
  };
  
  // Metadata
  isVerified: boolean;
  isAnonymous: boolean;
  helpfulCount: number;
  
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled' 
  | 'queue_update'
  | 'service_ready'
  | 'reminder'
  | 'promotion'
  | 'review_request';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// Search and Filter Types
export interface SearchFilters {
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // km
  };
  services?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number; // minimum rating
  availableNow?: boolean;
  maxWaitTime?: number; // minutes
  sortBy?: 'distance' | 'rating' | 'wait_time' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  shop: BarberShop;
  distance: number; // km
  currentWaitTime: number; // minutes
  availableSlots: number;
  nextAvailableTime?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Real-time Update Types
export type SocketEvent = 
  | 'queue_updated'
  | 'appointment_status_changed'
  | 'new_booking'
  | 'booking_cancelled'
  | 'barber_status_changed';

export interface SocketMessage {
  event: SocketEvent;
  data: any;
  timestamp: string;
  userId?: string;
  shopId?: string;
}

// Component Props Types
export interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export interface ShopCardProps {
  shop: BarberShop;
  distance?: number;
  currentWaitTime: number;
  onBook: (shopId: string) => void;
  onViewDetails: (shopId: string) => void;
}

export interface QueueDisplayProps {
  queue: QueueEntry[];
  currentPosition?: number;
  estimatedWaitTime?: number;
  onRefresh: () => void;
}

export interface BookingModalProps {
  shop: BarberShop;
  selectedServices: Service[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Partial<Appointment>) => void;
}