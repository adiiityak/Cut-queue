import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, X, User, CreditCard, Check } from 'lucide-react';
import { BarberShop, Service, User as UserType, Appointment } from '../shared/types';
import { getServiceById, calculateWaitTime, getShopById } from '../shared/mockData';
import { useAuth } from '../contexts/AuthContext';

interface BookingModalProps {
  shop: BarberShop | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (appointment: Appointment) => void;
}

export default function BookingModal({ shop, isOpen, onClose, onBookingConfirmed }: BookingModalProps) {
  const { user } = useAuth();
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [step, setStep] = useState<'services' | 'datetime' | 'review' | 'confirmation'>('services');
  const [isBooking, setIsBooking] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedServices([]);
      setSelectedDate('');
      setSelectedTime('');
      setSpecialRequests('');
      setStep('services');
      setIsBooking(false);
    }
  }, [isOpen]);

  if (!isOpen || !shop || !user) return null;

  const availableServices = shop.services
    .map(serviceId => getServiceById(serviceId))
    .filter((service): service is Service => service !== undefined);

  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
  const totalPrice = selectedServices.reduce((total, service) => total + service.price, 0);
  const estimatedWaitTime = calculateWaitTime(shop.id, 1); // Position 1 for new booking

  // Generate available time slots (simplified - in real app would check barber availability)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const now = new Date();
    const selectedDateObj = new Date(selectedDate);
    
    // Don't allow booking for past dates
    if (selectedDateObj < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      return [];
    }

    let startHour = 9;
    let endHour = 18;
    
    // If selected date is today, start from current hour + 1
    if (selectedDate === now.toISOString().split('T')[0]) {
      startHour = Math.max(startHour, now.getHours() + 1);
    }

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > 0) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleBooking = async () => {
    if (!user || user.role !== 'customer') return;
    
    setIsBooking(true);

    // Create appointment object
    const appointmentDateTime = `${selectedDate}T${selectedTime}:00.000Z`;
    const appointment: Appointment = {
      id: `apt_${Date.now()}`,
      customerId: user.id,
      shopId: shop.id,
      barberId: shop.barbers[0], // For now, assign to first barber
      services: selectedServices.map(s => s.id),
      totalDuration: totalDuration,
      totalPrice,
      requestedAt: new Date().toISOString(),
      scheduledAt: appointmentDateTime,
      estimatedStartTime: appointmentDateTime,
      estimatedEndTime: new Date(new Date(appointmentDateTime).getTime() + totalDuration * 60000).toISOString(),
      status: 'pending',
      queuePosition: 1,
      estimatedWaitTime,
      notes: specialRequests,
      specialRequests,
      notifications: {
        bookingConfirmed: false,
        reminderSent: false,
        readyForService: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate API call
    setTimeout(() => {
      onBookingConfirmed(appointment);
      setStep('confirmation');
      setIsBooking(false);
    }, 2000);
  };

  const handleClose = () => {
    onClose();
  };

  const canProceedToDateTime = selectedServices.length > 0;
  const canProceedToReview = selectedDate && selectedTime;
  const canBookAppointment = selectedServices.length > 0 && selectedDate && selectedTime;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {shop.name}
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'services' ? 'text-blue-600' : step === 'datetime' || step === 'review' || step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'services' ? 'bg-blue-600 text-white' : step === 'datetime' || step === 'review' || step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {step === 'datetime' || step === 'review' || step === 'confirmation' ? <Check className="w-3 h-3" /> : '1'}
              </div>
              <span className="text-sm font-medium">Services</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'datetime' ? 'text-blue-600' : step === 'review' || step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'datetime' ? 'bg-blue-600 text-white' : step === 'review' || step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {step === 'review' || step === 'confirmation' ? <Check className="w-3 h-3" /> : '2'}
              </div>
              <span className="text-sm font-medium">Date & Time</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'review' ? 'text-blue-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'review' ? 'bg-blue-600 text-white' : step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {step === 'confirmation' ? <Check className="w-3 h-3" /> : '3'}
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 'services' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Services</h3>
              <div className="space-y-3">
                {availableServices.map(service => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceToggle(service)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedServices.find(s => s.id === service.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            ${service.price}
                          </span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedServices.find(s => s.id === service.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedServices.find(s => s.id === service.id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedServices.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Total Duration:</span>
                    <span className="font-medium">{totalDuration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Total Price:</span>
                    <span className="font-medium">${totalPrice}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'datetime' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(''); // Reset time when date changes
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 14 days ahead
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Times
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {generateTimeSlots().map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          selectedTime === time
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Estimated Wait Time */}
              {selectedTime && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Estimated wait time: {estimatedWaitTime} minutes</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    We'll notify you when to leave home to arrive just in time!
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Booking</h3>
              
              {/* Shop Info */}
              <div className="border rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Barber Shop</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{shop.name}</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{shop.stats.averageRating}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{shop.address.street}, {shop.address.city}, {shop.address.state}</p>
              </div>

              {/* Selected Services */}
              <div className="border rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Selected Services</h4>
                <div className="space-y-2">
                  {selectedServices.map(service => (
                    <div key={service.id} className="flex justify-between text-sm">
                      <span>{service.name}</span>
                      <span>${service.price}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* DateTime */}
              <div className="border rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Duration: {totalDuration} minutes</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any specific requests or preferences..."
                />
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Request Sent!</h3>
              <p className="text-gray-600 mb-4">
                Your booking request has been sent to {shop.name}. They will review and confirm your appointment shortly.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="space-y-1 text-left">
                  <li>• The barber will review your request</li>
                  <li>• You'll receive a confirmation notification</li>
                  <li>• We'll notify you when to leave home</li>
                  <li>• Arrive at the perfect time!</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            {step !== 'confirmation' && (
              <>
                {selectedServices.length > 0 && (
                  <span>{selectedServices.length} service(s) • ${totalPrice}</span>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {step === 'services' && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('datetime')}
                  disabled={!canProceedToDateTime}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </>
            )}
            
            {step === 'datetime' && (
              <>
                <button
                  onClick={() => setStep('services')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  disabled={!canProceedToReview}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </>
            )}
            
            {step === 'review' && (
              <>
                <button
                  onClick={() => setStep('datetime')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={!canBookAppointment || isBooking}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isBooking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </>
            )}
            
            {step === 'confirmation' && (
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}