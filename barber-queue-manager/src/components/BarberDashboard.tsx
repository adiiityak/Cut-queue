import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  Clock,
  CheckCircle,
  X,
  Scissors,
  LogOut,
  Settings,
  BarChart3,
  Star,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointments } from '@/contexts/AppointmentsContext';
import type { Barber, BarberShop, Appointment } from '@/shared/types';
import { mockBarberShops, mockAppointments, getShopById } from '@/shared/mockData';

export default function BarberDashboard() {
  const { user, logout } = useAuth();
  const { getPendingAppointmentsForShop, getAppointmentsForShop, updateAppointment } = useAppointments();
  const barber = user as Barber;
  const shop = getShopById(barber.shopId);
  
  if (!shop) {
    return <div>Shop not found</div>;
  }

  // Get real appointments from context
  const allShopAppointments = getAppointmentsForShop(shop.id);
  const todayAppointments = allShopAppointments.filter(
    apt => new Date(apt.scheduledAt).toDateString() === new Date().toDateString()
  );
  
  const contextPendingRequests = getPendingAppointmentsForShop(shop.id);
  
  // Add demo appointment for demonstration purposes
  const demoPendingAppointment: Appointment = {
    id: 'demo-pending-appointment',
    customerId: 'customer-1',
    shopId: shop.id,
    barberId: barber.id,
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
    notes: 'Please use scissors only, no clippers. I prefer a classic style.',
    specialRequests: 'Please use scissors only, no clippers. I prefer a classic style.',
    notifications: {
      bookingConfirmed: false,
      reminderSent: false,
      readyForService: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const pendingRequests = [...contextPendingRequests, demoPendingAppointment];
  const confirmedAppointments = todayAppointments.filter(apt => apt.status === 'confirmed');
  const currentAppointment = todayAppointments.find(apt => apt.status === 'in_progress');

  const handleAcceptAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, {
      status: 'confirmed',
      notifications: {
        bookingConfirmed: true,
        reminderSent: false,
        readyForService: false
      }
    });
    console.log('Accepting appointment:', appointmentId);
  };

  const handleDeclineAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, {
      status: 'cancelled'
    });
    console.log('Declining appointment:', appointmentId);
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    console.log('Completing appointment:', appointmentId);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
              {shop.name}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={barber.avatar} />
                <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">{barber.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Queue</p>
                  <p className="text-2xl font-bold">{confirmedAppointments.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shop Rating</p>
                  <p className="text-2xl font-bold">{shop.stats.averageRating}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Wait Time</p>
                  <p className="text-2xl font-bold">{shop.stats.averageWaitTime}m</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="queue">Queue Management</TabsTrigger>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="queue" className="space-y-6">
            {/* Current Customer */}
            {currentAppointment && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">Currently Serving</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>CU</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">Customer #{currentAppointment.id.slice(-4)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Services: {currentAppointment.services.length} item(s)
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleCompleteAppointment(currentAppointment.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Queue */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Queue ({confirmedAppointments.length})</CardTitle>
                <CardDescription>
                  Confirmed appointments for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {confirmedAppointments.map((appointment, index) => (
                    <div 
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>CU</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">Customer #{appointment.id.slice(-4)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(appointment.scheduledAt)} • {appointment.services.length} service(s)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {appointment.totalDuration}min
                        </Badge>
                        <Badge variant="outline">
                          ${appointment.totalPrice}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {confirmedAppointments.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No appointments today</h3>
                      <p className="text-muted-foreground">
                        Your queue is empty for today.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Booking Requests ({pendingRequests.length})</CardTitle>
                <CardDescription>
                  Review and manage incoming appointment requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>CU</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">Customer #{appointment.id.slice(-4)}</h4>
                          <p className="text-sm text-muted-foreground">
                            Requested: {formatTime(appointment.scheduledAt)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {appointment.totalDuration}min • ${appointment.totalPrice}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-blue-600 mt-1">
                              Note: {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeclineAppointment(appointment.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptAppointment(appointment.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Demo appointment for showcase */}
                  <div className="space-y-4">
                    <Card className="border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-gray-900">John Demo Customer</h4>
                              <p className="text-sm text-gray-600">demo@customer.com</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Classic Haircut
                                </Badge>
                                <span className="text-sm text-gray-500">$25 • 30 min</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })} at {new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            <Badge variant="outline" className="text-orange-600 border-orange-200 mt-1">
                              Pending Review
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Special Requests:</h5>
                          <p className="text-sm text-gray-600">
                            Please use scissors only, no clippers. I prefer a classic style, not too short on the sides.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-4">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              // In real app, this would update the appointment status
                              alert('Appointment accepted! Customer will be notified.');
                            }}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              // In real app, this would update the appointment status
                              alert('Appointment declined. Customer will be notified.');
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="text-center py-4 text-sm text-gray-500">
                      🎆 This is a live demo appointment showcasing the barber workflow!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                  Manage your working hours and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(barber.workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium capitalize w-20">{day}</span>
                        <Badge variant={hours.isWorking ? 'default' : 'secondary'}>
                          {hours.isWorking ? 'Working' : 'Off'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {hours.isWorking ? `${hours.start} - ${hours.end}` : 'Closed'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Barber Settings</CardTitle>
                <CardDescription>
                  Manage your profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={barber.avatar} />
                      <AvatarFallback className="text-lg">{barber.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{barber.name}</h3>
                      <p className="text-muted-foreground">{barber.email}</p>
                      {barber.phone && <p className="text-sm text-muted-foreground">{barber.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Specialties</h4>
                      <div className="flex gap-2">
                        {barber.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Average Service Time</h4>
                      <p className="text-muted-foreground">
                        {barber.averageServiceTime} minutes per appointment
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <Badge variant={barber.isActive ? 'default' : 'secondary'}>
                        {barber.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}