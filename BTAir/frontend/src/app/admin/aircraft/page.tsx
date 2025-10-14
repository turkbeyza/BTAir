'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  AlertTriangle,
  Search,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Aircraft, CreateAircraftDto } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ManageAircraftPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAircraft, setNewAircraft] = useState<CreateAircraftDto>({
    model: '',
    seatingCapacity: 0,
    registration: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/aircraft');
      return;
    }

    if (user?.role !== 'Admin') {
      toast.error('Access Denied');
      router.push('/');
      return;
    }

    loadAircraft();
  }, [user, isAuthenticated, router]);

  const loadAircraft = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAllAircraft();
      setAircraft(data);
    } catch (error) {
      console.error('Failed to load aircraft:', error);
      toast.error('Failed to load aircraft data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAircraft = async () => {
    if (!newAircraft.model || !newAircraft.seatingCapacity || !newAircraft.registration) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminApi.createAircraft(newAircraft);
      
      setNewAircraft({
        model: '',
        seatingCapacity: 0,
        registration: '',
      });
      
      setShowCreateModal(false);
      await loadAircraft();
      toast.success('Aircraft created successfully!');
    } catch (error: any) {
      console.error('Failed to create aircraft:', error);
      toast.error('Failed to create aircraft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAircraft = async () => {
    if (!editingAircraft) return;

    try {
      setIsSubmitting(true);
      await adminApi.updateAircraft(editingAircraft.aircraftID, {
        model: editingAircraft.model,
        seatingCapacity: editingAircraft.seatingCapacity,
        registration: editingAircraft.registration,
      });
      
      setShowEditModal(false);
      setEditingAircraft(null);
      await loadAircraft();
      toast.success('Aircraft updated successfully!');
    } catch (error: any) {
      console.error('Failed to update aircraft:', error);
      toast.error('Failed to update aircraft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAircraft = async (aircraftId: number) => {
    if (!confirm('Are you sure you want to delete this aircraft?')) {
      return;
    }

    try {
      await adminApi.deleteAircraft(aircraftId);
      await loadAircraft();
      toast.success('Aircraft deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete aircraft:', error);
      toast.error('Failed to delete aircraft. Please try again.');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'default';
      case 'in-service': return 'secondary';
      case 'maintenance': return 'destructive';
      case 'retired': return 'outline';
      default: return 'outline';
    }
  };

  const filteredAircraft = aircraft.filter(plane =>
    plane.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plane.registration.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Aircraft</h1>
              <p className="text-gray-600 mt-1">Manage your fleet of aircraft</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadAircraft} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Aircraft
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Add New Aircraft</DialogTitle>
                  <DialogDescription>
                    Add a new aircraft to your fleet.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="model">Aircraft Model</Label>
                    <Input
                      id="model"
                      value={newAircraft.model}
                      onChange={(e) => setNewAircraft(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="e.g., Boeing 737-800"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="registration">Registration</Label>
                    <Input
                      id="registration"
                      value={newAircraft.registration}
                      onChange={(e) => setNewAircraft(prev => ({ ...prev, registration: e.target.value }))}
                      placeholder="e.g., N123BT"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                    <Input
                      id="seatingCapacity"
                      type="number"
                      value={newAircraft.seatingCapacity || ''}
                      onChange={(e) => setNewAircraft(prev => ({ ...prev, seatingCapacity: parseInt(e.target.value) || 0 }))}
                      placeholder="e.g., 180"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAircraft} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Aircraft'}
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
              placeholder="Search aircraft by model or registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Fleet Management ({filteredAircraft.length} aircraft)
            </CardTitle>
            <CardDescription>
              Manage your aircraft fleet and maintenance schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading aircraft...</p>
              </div>
            ) : filteredAircraft.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aircraft</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Maintenance</TableHead>
                      <TableHead>Next Maintenance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAircraft.map((plane) => (
                      <TableRow key={plane.aircraftID}>
                        <TableCell>
                          <div className="font-medium">{plane.model}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">{plane.registration}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{plane.seatingCapacity} seats</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(plane.status)}>
                            {plane.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(parseISO(plane.lastMaintenance), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(parseISO(plane.nextMaintenance), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingAircraft(plane);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAircraft(plane.aircraftID)}
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
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No aircraft found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No aircraft match your search criteria.' : 'Get started by adding your first aircraft.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Aircraft
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Aircraft</DialogTitle>
              <DialogDescription>
                Update aircraft information.
              </DialogDescription>
            </DialogHeader>
            {editingAircraft && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-model">Aircraft Model</Label>
                  <Input
                    id="edit-model"
                    value={editingAircraft.model}
                    onChange={(e) => setEditingAircraft(prev => prev ? { ...prev, model: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-registration">Registration</Label>
                  <Input
                    id="edit-registration"
                    value={editingAircraft.registration}
                    onChange={(e) => setEditingAircraft(prev => prev ? { ...prev, registration: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-seatingCapacity">Seating Capacity</Label>
                  <Input
                    id="edit-seatingCapacity"
                    type="number"
                    value={editingAircraft.seatingCapacity}
                    onChange={(e) => setEditingAircraft(prev => prev ? { ...prev, seatingCapacity: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAircraft} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Aircraft'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 