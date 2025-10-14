'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { flightsApi, adminApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plane, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  AlertTriangle,
  Search,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Flight, Aircraft, CreateFlightDto } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ManageFlightsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFlight, setNewFlight] = useState<CreateFlightDto>({
    flightNumber: 0,
    departureTime: '',
    arrivalTime: '',
    departureLocation: '',
    arrivalLocation: '',
    basePrice: 0,
    aircraftID: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/flights');
      return;
    }

    if (user?.role !== 'Admin') {
      toast.error('Access Denied', {
        description: 'You need admin privileges to access this page.',
      });
      router.push('/');
      return;
    }

    loadData();
  }, [user, isAuthenticated, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [flightsData, aircraftData] = await Promise.all([
        flightsApi.getAllFlights(),
        adminApi.getAllAircraft(),
      ]);
      setFlights(flightsData);
      setAircraft(aircraftData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load flights data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFlight = async () => {
    if (!newFlight.flightNumber || !newFlight.departureTime || !newFlight.arrivalTime || 
        !newFlight.departureLocation || !newFlight.arrivalLocation || !newFlight.basePrice || !newFlight.aircraftID) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await flightsApi.createFlight(newFlight);
      
      setNewFlight({
        flightNumber: 0,
        departureTime: '',
        arrivalTime: '',
        departureLocation: '',
        arrivalLocation: '',
        basePrice: 0,
        aircraftID: 0,
      });
      
      setShowCreateModal(false);
      await loadData();
      toast.success('Flight created successfully!');
    } catch (error: any) {
      console.error('Failed to create flight:', error);
      toast.error('Failed to create flight. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFlight = async () => {
    if (!editingFlight) return;

    try {
      setIsSubmitting(true);
      await flightsApi.updateFlight(editingFlight.flightID, {
        departureTime: editingFlight.departureTime,
        arrivalTime: editingFlight.arrivalTime,
        departureLocation: editingFlight.departureLocation,
        arrivalLocation: editingFlight.arrivalLocation,
        basePrice: editingFlight.basePrice,
        aircraftID: editingFlight.aircraftID,
      });
      
      setShowEditModal(false);
      setEditingFlight(null);
      await loadData();
      
      toast.success('Flight Updated', {
        description: 'Flight has been successfully updated.',
      });
    } catch (error: any) {
      console.error('Failed to update flight:', error);
      toast.error('Update Failed', {
        description: error.response?.data?.message || 'Failed to update flight. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFlight = async (flightId: string) => {
    if (!confirm('Are you sure you want to delete this flight?')) {
      return;
    }

    try {
      await flightsApi.deleteFlight(flightId);
      await loadData();
      toast.success('Flight deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete flight:', error);
      toast.error('Failed to delete flight. Please try again.');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'default';
      case 'boarding': return 'secondary';
      case 'in-flight': return 'default';
      case 'landed': return 'outline';
      case 'cancelled': return 'destructive';
      case 'delayed': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredFlights = flights.filter(flight =>
    flight.flightID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.departureLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.arrivalLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Flights</h1>
              <p className="text-gray-600 mt-1">Create, edit, and manage flight schedules</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Flight
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Flight</DialogTitle>
                  <DialogDescription>
                    Add a new flight to the schedule.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="flightNumber">Flight Number</Label>
                    <Input
                      id="flightNumber"
                      type="number"
                      value={newFlight.flightNumber || ''}
                      onChange={(e) => setNewFlight(prev => ({ ...prev, flightNumber: parseInt(e.target.value) || 0 }))}
                      placeholder="e.g., 1001"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="departureLocation">Departure</Label>
                      <Input
                        id="departureLocation"
                        value={newFlight.departureLocation}
                        onChange={(e) => setNewFlight(prev => ({ ...prev, departureLocation: e.target.value }))}
                        placeholder="e.g., New York"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="arrivalLocation">Arrival</Label>
                      <Input
                        id="arrivalLocation"
                        value={newFlight.arrivalLocation}
                        onChange={(e) => setNewFlight(prev => ({ ...prev, arrivalLocation: e.target.value }))}
                        placeholder="e.g., Los Angeles"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="departureTime">Departure Time</Label>
                      <Input
                        id="departureTime"
                        type="datetime-local"
                        value={newFlight.departureTime}
                        onChange={(e) => setNewFlight(prev => ({ ...prev, departureTime: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="arrivalTime">Arrival Time</Label>
                      <Input
                        id="arrivalTime"
                        type="datetime-local"
                        value={newFlight.arrivalTime}
                        onChange={(e) => setNewFlight(prev => ({ ...prev, arrivalTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="basePrice">Base Price ($)</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        step="0.01"
                        value={newFlight.basePrice || ''}
                        onChange={(e) => setNewFlight(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                        placeholder="299.99"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="aircraftID">Aircraft</Label>
                      <Select 
                        value={newFlight.aircraftID.toString()} 
                        onValueChange={(value) => setNewFlight(prev => ({ ...prev, aircraftID: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select aircraft" />
                        </SelectTrigger>
                        <SelectContent>
                          {aircraft.filter(a => a.status === 'Available').map((plane) => (
                            <SelectItem key={plane.aircraftID} value={plane.aircraftID.toString()}>
                              {plane.model} ({plane.registration})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFlight} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Flight'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search flights by ID, departure, or arrival location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plane className="mr-2 h-5 w-5" />
              Flight Schedule ({filteredFlights.length} flights)
            </CardTitle>
            <CardDescription>
              Manage all flights and their schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading flights...</p>
              </div>
            ) : filteredFlights.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flight</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Aircraft</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlights.map((flight) => (
                      <TableRow key={flight.flightID}>
                        <TableCell>
                          <div className="font-medium">BT {flight.flightNumber}</div>
                          <div className="text-sm text-gray-600">{flight.flightID}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{flight.departureLocation} → {flight.arrivalLocation}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Dep: {format(parseISO(flight.departureTime), 'MMM dd, HH:mm')}</div>
                            <div>Arr: {format(parseISO(flight.arrivalTime), 'MMM dd, HH:mm')}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{flight.aircraftModel}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${flight.basePrice}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(flight.status)}>
                            {flight.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{flight.availableSeats} available</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingFlight(flight);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteFlight(flight.flightID)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No flights match your search criteria.' : 'Get started by creating your first flight.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Flight
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Flight</DialogTitle>
              <DialogDescription>
                Update flight information and schedule.
              </DialogDescription>
            </DialogHeader>
            {editingFlight && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-departureLocation">Departure</Label>
                    <Input
                      id="edit-departureLocation"
                      value={editingFlight.departureLocation}
                      onChange={(e) => setEditingFlight(prev => prev ? { ...prev, departureLocation: e.target.value } : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-arrivalLocation">Arrival</Label>
                    <Input
                      id="edit-arrivalLocation"
                      value={editingFlight.arrivalLocation}
                      onChange={(e) => setEditingFlight(prev => prev ? { ...prev, arrivalLocation: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-departureTime">Departure Time</Label>
                    <Input
                      id="edit-departureTime"
                      type="datetime-local"
                      value={editingFlight.departureTime.slice(0, 16)}
                      onChange={(e) => setEditingFlight(prev => prev ? { ...prev, departureTime: e.target.value + ':00Z' } : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-arrivalTime">Arrival Time</Label>
                    <Input
                      id="edit-arrivalTime"
                      type="datetime-local"
                      value={editingFlight.arrivalTime.slice(0, 16)}
                      onChange={(e) => setEditingFlight(prev => prev ? { ...prev, arrivalTime: e.target.value + ':00Z' } : null)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-basePrice">Base Price ($)</Label>
                  <Input
                    id="edit-basePrice"
                    type="number"
                    step="0.01"
                    value={editingFlight.basePrice}
                    onChange={(e) => setEditingFlight(prev => prev ? { ...prev, basePrice: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditFlight} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Flight'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 