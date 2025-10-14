'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Calendar,
  Users,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Flight } from '@/types';
import Link from 'next/link';

interface FlightResultsProps {
  flights: Flight[];
  isLoading: boolean;
}

export function FlightResults({ flights, isLoading }: FlightResultsProps) {
  const { isAuthenticated } = useAuth();
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Searching for flights...</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or dates to find available flights.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (duration: string) => {
    try {
      const parts = duration.split(':');
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}m`;
      }
    } catch {
      return duration;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Available Flights ({flights.length})
        </h2>
        <div className="text-sm text-gray-600">
          Showing results for your search criteria
        </div>
      </div>

      <div className="grid gap-4">
        {flights.map((flight) => (
          <Card 
            key={flight.flightID} 
            className={`hover:shadow-lg transition-shadow cursor-pointer ${
              selectedFlight === flight.flightID ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedFlight(flight.flightID)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-lg">
                        BT {flight.flightNumber}
                      </span>
                    </div>
                    <Badge 
                      variant={flight.status === 'Scheduled' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {flight.status}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {flight.aircraftModel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="text-center md:text-left">
                      <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-lg">
                          {flight.departureLocation}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {format(parseISO(flight.departureTime), 'HH:mm')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(parseISO(flight.departureTime), 'MMM dd, yyyy')}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                        <div className="h-px bg-gray-300 flex-1"></div>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(flight.duration)}</span>
                      </div>
                    </div>

                    <div className="text-center md:text-right">
                      <div className="flex items-center gap-2 justify-center md:justify-end mb-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-lg">
                          {flight.arrivalLocation}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {format(parseISO(flight.arrivalTime), 'HH:mm')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(parseISO(flight.arrivalTime), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{flight.availableSeats} seats available</span>
                    </div>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-32 mx-6" />

                <div className="text-center space-y-4">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">From</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${flight.basePrice}
                    </div>
                    <div className="text-sm text-gray-600">per person</div>
                  </div>

                  {isAuthenticated ? (
                    <Button 
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <Link href={`/book/${flight.flightID}`}>
                        Select Flight
                      </Link>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        asChild
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        <Link href="/login">
                          Sign In to Book
                        </Link>
                      </Button>
                      <p className="text-xs text-gray-500">
                        Sign in to continue with booking
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Booking Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Prices may vary based on seat selection and additional services</li>
            <li>• Book early for better seat selection and potential savings</li>
            <li>• Check baggage policies before completing your booking</li>
            <li>• Ensure passport validity for international flights</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 