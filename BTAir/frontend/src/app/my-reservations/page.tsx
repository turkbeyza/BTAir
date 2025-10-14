'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { reservationsApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Calendar,
  CreditCard,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Reservation } from '@/types';
import { toast } from 'sonner';

export default function MyReservationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/my-reservations');
      return;
    }

    loadReservations();
  }, [isAuthenticated, router, user]);

  const loadReservations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      const data = await reservationsApi.getCustomerReservations(user.userID);
      setReservations(data);
    } catch (error: any) {
      console.error('Failed to load reservations:', error);
      const errorMessage = 'Failed to load your reservations. Please try again.';
      setError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    try {
      await reservationsApi.cancelReservation(reservationId);
      toast.success('Reservation Cancelled', {
        description: 'Your reservation has been successfully cancelled.',
      });
      loadReservations(); // Reload to get updated status
    } catch (error: any) {
      console.error('Failed to cancel reservation:', error);
      toast.error('Cancellation Failed', {
        description: error.response?.data?.message || 'Unable to cancel reservation. Please try again.',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your reservations.</p>
          <Button onClick={() => router.push('/login?redirect=/my-reservations')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reservations</h1>
              <p className="text-gray-600">View and manage your flight bookings</p>
            </div>
            <Button onClick={loadReservations} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reservations Found</h2>
            <p className="text-gray-600 mb-6">You haven't made any flight bookings yet.</p>
            <Button onClick={() => router.push('/')}>
              Search Flights
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <Card key={reservation.reservationID} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Flight BT {reservation.flightNumber}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(reservation.status)} className="ml-2">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(reservation.status)}
                          {reservation.status}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Booking ID: #{reservation.reservationID}
                    </p>
                  </div>
                  <CardDescription>
                    Booked on {format(parseISO(reservation.bookingDateTime), 'MMM dd, yyyy \'at\' HH:mm')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center">
                        <div className="font-semibold text-lg">{reservation.departureLocation}</div>
                        <div className="text-2xl font-bold">
                          {format(parseISO(reservation.departureTime), 'HH:mm')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(parseISO(reservation.departureTime), 'MMM dd')}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="h-px bg-gray-300 flex-1"></div>
                          <Plane className="h-4 w-4 text-gray-500" />
                          <div className="h-px bg-gray-300 flex-1"></div>
                        </div>
                        <div className="text-sm text-gray-600">Direct Flight</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold text-lg">{reservation.arrivalLocation}</div>
                        <div className="text-2xl font-bold">
                          {format(parseISO(reservation.arrivalTime), 'HH:mm')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(parseISO(reservation.arrivalTime), 'MMM dd')}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Passenger</p>
                          <p className="font-medium">{reservation.passengerName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Seat</p>
                          <p className="font-medium">{reservation.seatNumber} ({reservation.seatClass})</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Total Price</p>
                          <p className="font-medium">${reservation.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Passport Number</p>
                      <p className="font-medium">{reservation.passportNumber}</p>
                    </div>

                    
                    {reservation.status.toLowerCase() === 'confirmed' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.reservationID)}
                        >
                          Cancel Booking
                        </Button>
                        <Button variant="outline" size="sm">
                          Download Ticket
                        </Button>
                      </div>
                    )}
                    
                    {reservation.status.toLowerCase() === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.reservationID)}
                        >
                          Cancel Booking
                        </Button>
                        <Button variant="outline" size="sm">
                          Complete Payment
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        
        {reservations.length > 0 && (
          <div className="mt-8 text-center">
            <Button onClick={() => router.push('/')} variant="outline">
              Book Another Flight
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 