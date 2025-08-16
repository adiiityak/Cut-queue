import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BookingModal from './BookingModal';
import GoogleMap from './GoogleMap';
import LocationSearch from './LocationSearch';
import { useGeolocation } from '../hooks/useGeolocation';
import { Appointment } from '../shared/types';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  Calendar, 
  Filter,
  Navigation,
  Phone,
  Globe,
  Scissors,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointments } from '@/contexts/AppointmentsContext';
import type { Customer, BarberShop, SearchResult } from '@/shared/types';
import { mockBarberShops, mockServices, calculateDistance } from '@/shared/mockData';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { addAppointment, getAppointmentsForCustomer } = useAppointments();
  const customer = user as Customer;
  const { location: geoLocation, error: geoError, getCurrentPosition } = useGeolocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'wait_time'>('distance');
  
  // Booking modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<BarberShop | null>(null);
  
  // Get user's appointments from context
  const userAppointments = getAppointmentsForCustomer(customer.id);

  // Current location - use geolocation if available, otherwise fallback to customer location or default
  const currentLocation = geoLocation 
    ? { ...geoLocation, address: 'Your current location' }
    : customer.location || {
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'San Francisco, CA'
      };

  // Calculate search results
  const searchResults: SearchResult[] = useMemo(() => {
    let results = mockBarberShops
      .filter(shop => shop.isActive)
      .map(shop => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          shop.address.latitude,
          shop.address.longitude
        );
        
        const currentWaitTime = Math.floor(Math.random() * 45) + 5;
        
        return {
          shop,
          distance,
          currentWaitTime,
          availableSlots: Math.floor(Math.random() * 8) + 2,
          nextAvailableTime: new Date(Date.now() + currentWaitTime * 60000).toISOString()
        };
      });

    // Apply filters
    if (searchQuery) {
      results = results.filter(result => 
        result.shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.shop.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedService !== 'all') {
      results = results.filter(result => 
        result.shop.services.includes(selectedService)
      );
    }

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.shop.stats.averageRating - a.shop.stats.averageRating;
        case 'wait_time':
          return a.currentWaitTime - b.currentWaitTime;
        default:
          return 0;
      }
    });

    return results;
  }, [searchQuery, selectedService, sortBy, currentLocation]);

  const handleBookAppointment = (shopId: string) => {
    const shop = mockBarberShops.find(s => s.id === shopId);
    if (shop) {
      setSelectedShop(shop);
      setBookingModalOpen(true);
    }
  };

  const handleBookingConfirmed = (appointment: Appointment) => {
    // Add to global appointments
    addAppointment(appointment);
    
    // Close the modal
    setBookingModalOpen(false);
    setSelectedShop(null);
    
    // Show success message (for now just log)
    console.log('Booking confirmed:', appointment);
  };

  const getServiceName = (serviceId: string) => {
    return mockServices.find(service => service.id === serviceId)?.name || serviceId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                QueueCut
              </span>
            </div>
            
            <div className="hidden md:block text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 inline mr-1" />
              {currentLocation.address}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={customer.avatar} />
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">{customer.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">Find Shops</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search barber shops..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {mockServices.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="wait_time">Wait Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Nearby Barber Shops</h2>
                <span className="text-sm text-muted-foreground">
                  {searchResults.length} shops found
                </span>
              </div>
              
              <div className="grid gap-4">
                {searchResults.map((result) => (
                  <Card key={result.shop.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <Scissors className="w-8 h-8 text-gray-400" />
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{result.shop.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {result.shop.description}
                              </p>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">
                                  {result.shop.stats.averageRating}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({result.shop.stats.totalReviews})
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Navigation className="w-3 h-3" />
                                {result.distance.toFixed(1)} km
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {result.shop.services.slice(0, 3).map(serviceId => (
                              <Badge key={serviceId} variant="secondary" className="text-xs">
                                {getServiceName(serviceId)}
                              </Badge>
                            ))}
                            {result.shop.services.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{result.shop.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="font-medium text-orange-600">
                                  {result.currentWaitTime} min wait
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-green-500" />
                                <span className="text-green-600">
                                  {result.availableSlots} slots available
                                </span>
                              </div>
                            </div>
                            
                            <Button 
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              onClick={() => handleBookAppointment(result.shop.id)}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {searchResults.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No shops found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search criteria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="map" className="space-y-6">
            <div className="space-y-6">
              {/* Location search and current location display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </CardTitle>
                  <CardDescription>
                    Search for your location or use current location to find nearby shops
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <LocationSearch
                      placeholder="Search for your location..."
                      onLocationSelect={(location) => {
                        // In a real app, you'd update the customer's location
                        console.log('Selected location:', location);
                      }}
                    />
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Current: {currentLocation.address}
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={getCurrentPosition}
                        disabled={!navigator.geolocation}
                        className="text-blue-600 border-blue-200"
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Update Location
                      </Button>
                    </div>
                    
                    {geoError && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">⚠️ {geoError}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Google Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Nearby Barber Shops</CardTitle>
                  <CardDescription>
                    Click on shop markers to see details and get directions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GoogleMap
                    shops={searchResults.map(result => result.shop)}
                    userLocation={currentLocation}
                    selectedShop={selectedShop}
                    onShopSelect={(shop) => {
                      setSelectedShop(shop);
                      setBookingModalOpen(true);
                    }}
                    height="500px"
                    className="w-full"
                  />
                </CardContent>
              </Card>
              
              {/* Shop cards below map */}
              <Card>
                <CardHeader>
                  <CardTitle>Shop List</CardTitle>
                  <CardDescription>
                    All nearby shops sorted by {sortBy.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div key={result.shop.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{result.shop.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {result.distance.toFixed(1)} mi
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                {result.shop.stats.averageRating}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ~{result.currentWaitTime} min
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleBookAppointment(result.shop.id)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Book
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
                <CardDescription>
                  View and manage your appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Book your first appointment to see it here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAppointments.map(appointment => {
                      const shop = mockBarberShops.find(s => s.id === appointment.shopId);
                      const appointmentDate = new Date(appointment.scheduledAt);
                      
                      return (
                        <Card key={appointment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                  <Scissors className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{shop?.name || 'Unknown Shop'}</h4>
                                  <p className="text-sm text-gray-600">
                                    {appointmentDate.toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })} at {appointmentDate.toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant={appointment.status === 'pending' ? 'outline' : 
                                              appointment.status === 'confirmed' ? 'default' : 
                                              appointment.status === 'in_progress' ? 'secondary' : 'outline'}
                                    >
                                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      ${appointment.totalPrice} • {appointment.totalDuration} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                {appointment.status === 'pending' && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                                    Awaiting confirmation
                                  </Badge>
                                )}
                                {appointment.status === 'confirmed' && (
                                  <div className="text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>Position #{appointment.queuePosition}</span>
                                    </div>
                                    <div className="text-green-600 font-medium mt-1">
                                      Est. wait: {appointment.estimatedWaitTime} min
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {appointment.specialRequests && (
                              <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                <strong>Special requests:</strong> {appointment.specialRequests}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={customer.avatar} />
                      <AvatarFallback className="text-lg">{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{customer.name}</h3>
                      <p className="text-muted-foreground">{customer.email}</p>
                      {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Notification Settings</h4>
                      <div className="flex gap-2">
                        <Badge variant={customer.preferences.notificationSettings.sms ? 'default' : 'outline'}>
                          SMS: {customer.preferences.notificationSettings.sms ? 'On' : 'Off'}
                        </Badge>
                        <Badge variant={customer.preferences.notificationSettings.email ? 'default' : 'outline'}>
                          Email: {customer.preferences.notificationSettings.email ? 'On' : 'Off'}
                        </Badge>
                        <Badge variant={customer.preferences.notificationSettings.push ? 'default' : 'outline'}>
                          Push: {customer.preferences.notificationSettings.push ? 'On' : 'Off'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Booking Modal */}
      <BookingModal
        shop={selectedShop}
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedShop(null);
        }}
        onBookingConfirmed={handleBookingConfirmed}
      />
    </div>
  );
}