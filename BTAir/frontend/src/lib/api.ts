import axios from 'axios';
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  User,
  Customer,
  Flight,
  CreateFlightDto,
  FlightSearchDto,
  Seat,
  Reservation,
  CreateReservationDto,
  Passenger,
  CreatePassengerDto,
  CreatePaymentDto,
  Payment,
  Aircraft,
  CreateAircraftDto,
  SystemStatistics,
  RecentActivity,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5058/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
  
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    console.log('API: Making login request to:', `${api.defaults.baseURL}/auth/login`);
    console.log('API: Login data:', { email: data.email });
    try {
      const response = await api.post('/auth/login', data);
      console.log('API: Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    console.log('API: Making register request to:', `${api.defaults.baseURL}/auth/register`);
    try {
      const response = await api.post('/auth/register', data);
      console.log('API: Register response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  },

  validateToken: async (token: string): Promise<{ isValid: boolean }> => {
    const response = await api.post('/auth/validate-token', { token });
    return response.data;
  },
};

export const flightsApi = {
  getAllFlights: async (): Promise<Flight[]> => {
    const response = await api.get('/flights');
    return response.data;
  },

  getFlight: async (flightId: string): Promise<Flight> => {
    const response = await api.get(`/flights/${flightId}`);
    return response.data;
  },

  searchFlights: async (searchData: FlightSearchDto): Promise<Flight[]> => {
    const response = await api.post('/flights/search', searchData);
    return response.data;
  },

  createFlight: async (data: CreateFlightDto): Promise<Flight> => {
    const response = await api.post('/flights', data);
    return response.data;
  },

  updateFlight: async (flightId: string, data: Partial<CreateFlightDto>): Promise<Flight> => {
    const response = await api.put(`/flights/${flightId}`, data);
    return response.data;
  },

  deleteFlight: async (flightId: string): Promise<void> => {
    await api.delete(`/flights/${flightId}`);
  },

  getFlightSeats: async (flightId: string): Promise<Seat[]> => {
    const response = await api.get(`/flights/${flightId}/seats`);
    return response.data;
  },

  checkAircraftAvailability: async (
    aircraftId: number,
    departureTime: string,
    arrivalTime: string,
    excludeFlightId?: string
  ): Promise<{ isAvailable: boolean }> => {
    const params = new URLSearchParams({
      departureTime,
      arrivalTime,
      ...(excludeFlightId && { excludeFlightId }),
    });
    const response = await api.get(`/flights/aircraft/${aircraftId}/availability?${params}`);
    return response.data;
  },
};

export const reservationsApi = {
  getCustomerReservations: async (customerId: number): Promise<Reservation[]> => {
    const response = await api.get(`/reservations/customer/${customerId}`);
    return response.data;
  },

  getReservation: async (reservationId: number): Promise<Reservation> => {
    const response = await api.get(`/reservations/${reservationId}`);
    return response.data;
  },

  createReservation: async (customerId: number, data: CreateReservationDto): Promise<Reservation> => {
    const response = await api.post(`/reservations/customer/${customerId}`, data);
    return response.data;
  },

  updateReservation: async (reservationId: number, data: { status?: string; seatID?: number }): Promise<Reservation> => {
    const response = await api.put(`/reservations/${reservationId}`, data);
    return response.data;
  },

  cancelReservation: async (reservationId: number): Promise<void> => {
    await api.delete(`/reservations/${reservationId}`);
  },

  processPayment: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await api.post('/reservations/payments', data);
    return response.data;
  },

  getCustomerPassengers: async (customerId: number): Promise<Passenger[]> => {
    const response = await api.get(`/reservations/customers/${customerId}/passengers`);
    return response.data;
  },

  createPassenger: async (customerId: number, data: CreatePassengerDto): Promise<Passenger> => {
    const response = await api.post(`/reservations/customers/${customerId}/passengers`, data);
    return response.data;
  },
};

export const adminApi = {
  getAllAircraft: async (): Promise<Aircraft[]> => {
    const response = await api.get('/admin/aircraft');
    return response.data;
  },

  getAircraft: async (id: number): Promise<Aircraft> => {
    const response = await api.get(`/admin/aircraft/${id}`);
    return response.data;
  },

  createAircraft: async (data: CreateAircraftDto): Promise<Aircraft> => {
    const response = await api.post('/admin/aircraft', data);
    return response.data;
  },

  updateAircraft: async (id: number, data: Partial<CreateAircraftDto>): Promise<Aircraft> => {
    const response = await api.put(`/admin/aircraft/${id}`, data);
    return response.data;
  },

  deleteAircraft: async (id: number): Promise<void> => {
    await api.delete(`/admin/aircraft/${id}`);
  },

  getSystemStatistics: async (): Promise<SystemStatistics> => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/admin/customers');
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  deleteCustomer: async (customerId: number): Promise<void> => {
    await api.delete(`/admin/customers/${customerId}`);
  },

  updateUserRole: async (userId: number, role: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  getRecentActivities: async (): Promise<RecentActivity[]> => {
    const response = await api.get('/admin/recent-activities');
    return response.data;
  },

  createSeatsForFlight: async (flightId: string): Promise<void> => {
    await api.post(`/admin/flights/${flightId}/seats`);
  },

  clearAllSeats: async (): Promise<void> => {
    await api.delete('/admin/seats');
  },
};

export default api; 