'use client';

export const runtime = "edge";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { flightsApi, reservationsApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Users, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Calendar,
  Plus,
  X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Flight, Seat, Passenger, CreatePassengerDto } from '@/types';
import { toast } from 'sonner';

export default function BookFlightPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const flightId = params.flightId as string;

  const [flight, setFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [currentStep, setCurrentStep] = useState<'flight' | 'seat' | 'passenger' | 'payment' | 'confirmation'>('flight');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddPassengerModal, setShowAddPassengerModal] = useState(false);
  const [isAddingPassenger, setIsAddingPassenger] = useState(false);
  const [newPassenger, setNewPassenger] = useState({
    fullName: '',
    passportNumber: '',
    nationality: '',
    dateOfBirth: '',
    gender: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/book/${flightId}`);
      return;
    }

    loadBookingData();
  }, [isAuthenticated, flightId, router]);

  const loadBookingData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load flight details and seats
      const [flightData, seatsData, passengersData] = await Promise.all([
        flightsApi.getFlight(flightId),
        flightsApi.getFlightSeats(flightId),
        user ? reservationsApi.getCustomerPassengers(user.userID) : Promise.resolve([])
      ]);

      setFlight(flightData);
      setSeats(seatsData);
      setPassengers(passengersData);
      
      if (flightData && seatsData.length > 0) {
        setCurrentStep('seat');
      }
    } catch (error: any) {
      console.error('Failed to load booking data:', error);
      const errorMessage = error.response?.status === 404 
        ? 'Flight not found' 
        : 'Failed to load booking information';
      setError(errorMessage);
      toast.error('Booking Error', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatSelect = (seat: Seat) => {
    if (!seat.isAvailable) {
      toast.error('Seat Unavailable', {
        description: `Seat ${seat.seatNumber} is already booked by another passenger.`,
      });
      return;
    }
    setSelectedSeat(seat);
    setCurrentStep('passenger');
    toast.success('Seat Selected', {
      description: `You've selected seat ${seat.seatNumber} (${seat.seatClass})`,
    });
  };

  const handlePassengerSelect = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setCurrentStep('payment');
  };

  const handleAddPassenger = async () => {
    if (!user) return;

    try {
      setIsAddingPassenger(true);

      // Calculate age from date of birth
      const birthDate = new Date(newPassenger.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - 
        (today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

      const passengerData: CreatePassengerDto = {
        fullName: newPassenger.fullName,
        passportNumber: newPassenger.passportNumber,
        nationality: newPassenger.nationality,
        age: age,
        gender: newPassenger.gender,
        dateOfBirth: newPassenger.dateOfBirth,
      };

      const createdPassenger = await reservationsApi.createPassenger(user.userID, passengerData);
      
      // Add to local passengers list
      setPassengers(prev => [...prev, createdPassenger]);
      
      // Reset form
      setNewPassenger({
        fullName: '',
        passportNumber: '',
        nationality: '',
        dateOfBirth: '',
        gender: '',
      });
      
      setShowAddPassengerModal(false);
      
      toast.success('Passenger Added', {
        description: 'New passenger has been successfully added.',
      });

    } catch (error: any) {
      console.error('Failed to add passenger:', error);
      toast.error('Failed to Add Passenger', {
        description: error.response?.data?.message || 'Unable to add passenger. Please try again.',
      });
    } finally {
      setIsAddingPassenger(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSeat || !selectedPassenger || !user) {
      toast.error('Booking Error', {
        description: 'Please complete all booking steps.',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create reservation
      const reservation = await reservationsApi.createReservation(user.userID, {
        flightID: flightId,
        passengerID: selectedPassenger.passengerID,
        seatID: selectedSeat.seatID,
      });

      // Process payment (simplified for demo)
      await reservationsApi.processPayment({
        reservationID: reservation.reservationID,
        paymentMethod: 'Credit Card',
        cardNumber: '****-****-****-1234', // Demo data
        cardHolderName: user.name,
        expiryDate: '12/25',
        cvv: '***',
      });

      setCurrentStep('confirmation');
      toast.success('Booking Confirmed!', {
        description: 'Your flight has been successfully booked.',
      });

    } catch (error: any) {
      console.error('Booking failed:', error);
      toast.error('Booking Failed', {
        description: error.response?.data?.message || 'Unable to complete booking. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to continue with your booking.</p>
          <Button onClick={() => router.push(`/login?redirect=/book/${flightId}`)}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button onClick={() => router.push('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Flight</h1>
          <p className="text-gray-600">Complete your booking in a few simple steps</p>
        </div>

        
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { key: 'seat', label: 'Select Seat', icon: Plane },
              { key: 'passenger', label: 'Passenger Info', icon: Users },
              { key: 'payment', label: 'Payment', icon: CreditCard },
              { key: 'confirmation', label: 'Confirmation', icon: CheckCircle },
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['seat', 'passenger', 'payment', 'confirmation'].indexOf(currentStep) > 
                                ['seat', 'passenger', 'payment', 'confirmation'].indexOf(step.key);
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-600 text-white' : 
                    isActive ? 'bg-blue-600 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
              <Tabs value={currentStep} className="w-full">
                
                <TabsContent value="flight" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Flight Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {flight && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Plane className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold">BT {flight.flightNumber}</span>
                              <Badge>{flight.status}</Badge>
                            </div>
                            <span className="text-sm text-gray-600">{flight.aircraftModel}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-center">
                              <div className="font-semibold text-lg">{flight.departureLocation}</div>
                              <div className="text-2xl font-bold">
                                {format(parseISO(flight.departureTime), 'HH:mm')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {format(parseISO(flight.departureTime), 'MMM dd')}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="h-px bg-gray-300 flex-1"></div>
                                <Clock className="h-4 w-4 text-gray-500" />
                                <div className="h-px bg-gray-300 flex-1"></div>
                              </div>
                              <div className="text-sm text-gray-600">Duration</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-semibold text-lg">{flight.arrivalLocation}</div>
                              <div className="text-2xl font-bold">
                                {format(parseISO(flight.arrivalTime), 'HH:mm')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {format(parseISO(flight.arrivalTime), 'MMM dd')}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                
                <TabsContent value="seat" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Your Seat</CardTitle>
                      <CardDescription>
                        Choose your preferred seat for the flight
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {seats.length > 0 ? (
                        <div className="space-y-6">
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {seats.filter(s => s.isAvailable).length} of {seats.length} seats available
                              </span>
                              <span className="text-gray-600">
                                {Math.round((seats.filter(s => s.isAvailable).length / seats.length) * 100)}% available
                              </span>
                            </div>
                          </div>

                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-green-600 rounded"></div>
                              <span>Available ({seats.filter(s => s.isAvailable).length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-red-600 rounded"></div>
                              <span>Booked ({seats.filter(s => !s.isAvailable).length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-600 rounded ring-2 ring-blue-300"></div>
                              <span>Selected</span>
                            </div>
                          </div>

                          
                          <div className="space-y-6">
                            
                            {['First', 'Business', 'Economy'].map((seatClass) => {
                              const classSeats = seats.filter(s => s.seatClass === seatClass);
                              if (classSeats.length === 0) return null;
                              
                              return (
                                <div key={seatClass} className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">{seatClass} Class</h4>
                                    <span className="text-sm text-gray-600">
                                      {classSeats.filter(s => s.isAvailable).length}/{classSeats.length} available
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
                                    {classSeats.map((seat) => (
                                      <button
                                        key={seat.seatID}
                                        onClick={() => handleSeatSelect(seat)}
                                        disabled={!seat.isAvailable}
                                        title={
                                          !seat.isAvailable 
                                            ? `Seat ${seat.seatNumber} is already booked` 
                                            : `Select seat ${seat.seatNumber} (${seat.seatClass}) - $${(flight!.basePrice * seat.priceMultiplier).toFixed(2)}`
                                        }
                                        className={`
                                          w-10 h-10 rounded text-xs font-medium transition-all relative
                                          ${seat.isAvailable 
                                            ? selectedSeat?.seatID === seat.seatID
                                              ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-lg' 
                                              : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                                            : 'bg-red-600 text-white cursor-not-allowed opacity-75'
                                          }
                                        `}
                                      >
                                        {seat.seatNumber}
                                        {!seat.isAvailable && (
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <X className="h-3 w-3" />
                                          </div>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {selectedSeat && (
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <p className="font-semibold">Selected Seat: {selectedSeat.seatNumber}</p>
                              <p className="text-sm text-gray-600">Class: {selectedSeat.seatClass}</p>
                              <p className="text-sm text-gray-600">
                                Price: ${(flight!.basePrice * selectedSeat.priceMultiplier).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-gray-600 py-8">No seats available for this flight.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                
                <TabsContent value="passenger" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Passenger</CardTitle>
                      <CardDescription>
                        Choose who will be traveling on this flight
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {passengers.map((passenger) => (
                          <div
                            key={passenger.passengerID}
                            onClick={() => handlePassengerSelect(passenger)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedPassenger?.passengerID === passenger.passengerID
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{passenger.fullName}</h3>
                                <p className="text-sm text-gray-600">
                                  Passport: {passenger.passportNumber}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Age: {passenger.age} • {passenger.nationality}
                                </p>
                              </div>
                              {selectedPassenger?.passengerID === passenger.passengerID && (
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}

                        <div className="mt-4">
                          <Dialog open={showAddPassengerModal} onOpenChange={setShowAddPassengerModal}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Passenger
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Add New Passenger</DialogTitle>
                                <DialogDescription>
                                  Add a new passenger to your account for booking.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="fullName">Full Name</Label>
                                  <Input
                                    id="fullName"
                                    value={newPassenger.fullName}
                                    onChange={(e) => setNewPassenger(prev => ({ ...prev, fullName: e.target.value }))}
                                    placeholder="Enter full name"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="passportNumber">Passport Number</Label>
                                  <Input
                                    id="passportNumber"
                                    value={newPassenger.passportNumber}
                                    onChange={(e) => setNewPassenger(prev => ({ ...prev, passportNumber: e.target.value }))}
                                    placeholder="Enter passport number"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="nationality">Nationality</Label>
                                  <Input
                                    id="nationality"
                                    value={newPassenger.nationality}
                                    onChange={(e) => setNewPassenger(prev => ({ ...prev, nationality: e.target.value }))}
                                    placeholder="Enter nationality"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                  <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={newPassenger.dateOfBirth}
                                    onChange={(e) => setNewPassenger(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="gender">Gender</Label>
                                  <Select 
                                    value={newPassenger.gender} 
                                    onValueChange={(value) => setNewPassenger(prev => ({ ...prev, gender: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Male">Male</SelectItem>
                                      <SelectItem value="Female">Female</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowAddPassengerModal(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleAddPassenger}
                                  disabled={isAddingPassenger || !newPassenger.fullName || !newPassenger.passportNumber || !newPassenger.nationality || !newPassenger.dateOfBirth || !newPassenger.gender}
                                >
                                  {isAddingPassenger ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Adding...
                                    </>
                                  ) : (
                                    'Add Passenger'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {passengers.length === 0 && (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">No passengers found.</p>
                            <p className="text-sm text-gray-500">Use the button above to add your first passenger.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                
                <TabsContent value="payment" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                      <CardDescription>
                        Complete your booking payment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            This is a demo booking system. No real payment will be processed.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-2">Demo Payment Details</h3>
                            <div className="text-sm space-y-1">
                              <p><strong>Card Number:</strong> ****-****-****-1234</p>
                              <p><strong>Cardholder:</strong> {user?.name}</p>
                              <p><strong>Expiry:</strong> 12/25</p>
                              <p><strong>CVV:</strong> ***</p>
                            </div>
                          </div>

                          <Button 
                            onClick={handleBooking}
                            className="w-full"
                            size="lg"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Complete Booking
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                
                <TabsContent value="confirmation" className="mt-0">
                  <Card>
                    <CardContent className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
                      <p className="text-gray-600 mb-8">
                        Your flight has been successfully booked. You will receive a confirmation email shortly.
                      </p>
                      <div className="space-x-4">
                        <Button onClick={() => router.push('/my-reservations')}>
                          View My Bookings
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/')}>
                          Book Another Flight
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {flight && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Flight BT {flight.flightNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {flight.departureLocation} → {flight.arrivalLocation}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(flight.departureTime), 'MMM dd, HH:mm')}
                        </p>
                      </div>

                      <Separator />

                      {selectedSeat && (
                        <div>
                          <h4 className="font-medium">Selected Seat</h4>
                          <p className="text-sm text-gray-600">
                            {selectedSeat.seatNumber} ({selectedSeat.seatClass})
                          </p>
                        </div>
                      )}

                      {selectedPassenger && (
                        <div>
                          <h4 className="font-medium">Passenger</h4>
                          <p className="text-sm text-gray-600">{selectedPassenger.fullName}</p>
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Base Price</span>
                          <span>${flight.basePrice}</span>
                        </div>
                        {selectedSeat && selectedSeat.priceMultiplier !== 1 && (
                          <div className="flex justify-between">
                            <span>Seat Premium</span>
                            <span>×{selectedSeat.priceMultiplier}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total</span>
                          <span>
                            ${selectedSeat 
                              ? (flight.basePrice * selectedSeat.priceMultiplier).toFixed(2)
                              : flight.basePrice.toFixed(2)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 