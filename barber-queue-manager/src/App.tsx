import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import LoginForm from "@/components/LoginForm";
import CustomerDashboard from "@/components/CustomerDashboard";
import BarberDashboard from "@/components/BarberDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  Scissors, 
  Users, 
  CheckCircle, 
  Smartphone,
  Calendar,
  Timer,
  Star
} from "lucide-react";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'barber' | null>(null);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is logged in, show their dashboard
  if (user) {
    if (user.role === 'customer') {
      return <CustomerDashboard />;
    } else {
      return <BarberDashboard />;
    }
  }
  
  // If login modal is open, show it
  if (showLogin) {
    return <LoginForm onClose={() => setShowLogin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              QueueCut
            </span>
          </div>
          <div className="flex gap-3">
            <Button 
              variant={userType === 'customer' ? 'default' : 'outline'}
              onClick={() => setUserType('customer')}
              className="hidden sm:flex"
            >
              For Customers
            </Button>
            <Button 
              variant={userType === 'barber' ? 'default' : 'outline'}
              onClick={() => setUserType('barber')}
              className="hidden sm:flex"
            >
              For Barbers
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              <Timer className="w-3 h-3 mr-1" />
              Save Time
            </Badge>
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              <Smartphone className="w-3 h-3 mr-1" />
              Smart Booking
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Skip the Wait,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Get the Perfect Cut
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Find barber shops with the shortest queues, book your appointment from home, 
            and get precise timing for when to arrive. No more waiting in long lines.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => setShowLogin(true)}
            >
              <Users className="w-5 h-5 mr-2" />
              I'm a Customer
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 hover:bg-gray-50"
              onClick={() => setShowLogin(true)}
            >
              <Scissors className="w-5 h-5 mr-2" />
              I'm a Barber
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How QueueCut Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to revolutionize your barber shop experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">1. Find Nearby Shops</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Search for barber shops around you and see real-time queue lengths and wait times.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">2. Book Your Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Choose the shop with the shortest wait time and book your appointment instantly.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">3. Arrive on Time</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get notified exactly when to leave home to arrive just in time for your haircut.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppointmentsProvider>
        <AppContent />
      </AppointmentsProvider>
    </AuthProvider>
  );
}