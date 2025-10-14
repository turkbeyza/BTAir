'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { flightsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Flight, FlightSearchDto } from '@/types';
import { toast } from 'sonner';

const flightSearchSchema = z.object({
  departureLocation: z.string().min(1, 'Departure location is required'),
  arrivalLocation: z.string().min(1, 'Arrival location is required'),
  departureDate: z.date({
    required_error: 'Departure date is required',
  }),
  returnDate: z.date().optional(),
  passengers: z.number().min(1, 'At least 1 passenger is required').max(9, 'Maximum 9 passengers allowed'),
  seatClass: z.string().optional(),
  maxPrice: z.number().optional(),
});

type FlightSearchForm = z.infer<typeof flightSearchSchema>;

interface FlightSearchProps {
  onResults: (flights: Flight[]) => void;
  onLoading: (loading: boolean) => void;
}

const popularDestinations = [
  'New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco',
  'London', 'Paris', 'Tokyo', 'Dubai', 'Singapore'
];

const seatClasses = [
  { value: 'Economy', label: 'Economy' },
  { value: 'Business', label: 'Business' },
  { value: 'First', label: 'First Class' },
];

export function FlightSearch({ onResults, onLoading }: FlightSearchProps) {
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [departureDateOpen, setDepartureDateOpen] = useState(false);
  const [returnDateOpen, setReturnDateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FlightSearchForm>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      passengers: 1,
      seatClass: 'Economy',
    },
  });

  const departureDate = watch('departureDate');
  const returnDate = watch('returnDate');

  const onSubmit = async (data: FlightSearchForm) => {
    try {
      onLoading(true);
      
      const searchData: FlightSearchDto = {
        departureLocation: data.departureLocation,
        arrivalLocation: data.arrivalLocation,
        departureDate: data.departureDate.toISOString(),
        passengers: data.passengers,
        seatClass: data.seatClass,
        maxPrice: data.maxPrice,
      };

      if (tripType === 'roundtrip' && data.returnDate) {
        searchData.returnDate = data.returnDate.toISOString();
      }

      const flights = await flightsApi.searchFlights(searchData);
      onResults(flights);
      
      if (flights.length === 0) {
        toast.info('No flights found', {
          description: 'Try adjusting your search criteria or dates.',
        });
      } else {
        toast.success('Flights found', {
          description: `Found ${flights.length} flight(s) matching your criteria.`,
        });
      }
    } catch (error) {
      console.error('Flight search error:', error);
      toast.error('Search failed', {
        description: 'Unable to search for flights. Please try again.',
      });
      onResults([]);
    } finally {
      onLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="flex gap-4 mb-6">
            <Button
              type="button"
              variant={tripType === 'oneway' ? 'default' : 'outline'}
              onClick={() => setTripType('oneway')}
              className="flex-1"
            >
              One Way
            </Button>
            <Button
              type="button"
              variant={tripType === 'roundtrip' ? 'default' : 'outline'}
              onClick={() => setTripType('roundtrip')}
              className="flex-1"
            >
              Round Trip
            </Button>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureLocation">From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="departureLocation"
                  placeholder="Departure city"
                  className="pl-10"
                  {...register('departureLocation')}
                />
              </div>
              {errors.departureLocation && (
                <p className="text-sm text-red-500">{errors.departureLocation.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrivalLocation">To</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="arrivalLocation"
                  placeholder="Destination city"
                  className="pl-10"
                  {...register('arrivalLocation')}
                />
              </div>
              {errors.arrivalLocation && (
                <p className="text-sm text-red-500">{errors.arrivalLocation.message}</p>
              )}
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departure Date</Label>
              <Popover open={departureDateOpen} onOpenChange={setDepartureDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !departureDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, 'PPP') : 'Select departure date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={(date) => {
                      setValue('departureDate', date!);
                      setDepartureDateOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.departureDate && (
                <p className="text-sm text-red-500">{errors.departureDate.message}</p>
              )}
            </div>

            {tripType === 'roundtrip' && (
              <div className="space-y-2">
                <Label>Return Date</Label>
                <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !returnDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, 'PPP') : 'Select return date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={(date) => {
                        setValue('returnDate', date!);
                        setReturnDateOpen(false);
                      }}
                      disabled={(date) => date < (departureDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passengers">Passengers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  max="9"
                  className="pl-10"
                  {...register('passengers', { valueAsNumber: true })}
                />
              </div>
              {errors.passengers && (
                <p className="text-sm text-red-500">{errors.passengers.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Class</Label>
              <Select onValueChange={(value) => setValue('seatClass', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {seatClasses.map((seatClass) => (
                    <SelectItem key={seatClass.value} value={seatClass.value}>
                      {seatClass.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Any price"
                {...register('maxPrice', { valueAsNumber: true })}
              />
            </div>
          </div>

          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Flights
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 