export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginDtoAlt {
  Email: string;
  Password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  userID: number;
  name: string;
  email: string;
  role: string;
  token: string;
  tokenExpiry: string;
}

export interface User {
  userID: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export interface Customer {
  customerID: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  createdAt: string;
  userID: number;
}

export interface Flight {
  flightID: string;
  flightNumber: number;
  departureTime: string;
  arrivalTime: string;
  departureLocation: string;
  arrivalLocation: string;
  status: string;
  availableSeats: number;
  basePrice: number;
  aircraftID: number;
  aircraftModel: string;
  duration: string;
}

export interface CreateFlightDto {
  flightNumber: number;
  departureTime: string;
  arrivalTime: string;
  departureLocation: string;
  arrivalLocation: string;
  basePrice: number;
  aircraftID: number;
}

export interface FlightSearchDto {
  departureLocation?: string;
  arrivalLocation?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  seatClass?: string;
  maxPrice?: number;
}

export interface Seat {
  seatID: number;
  seatNumber: string;
  seatClass: string;
  isAvailable: boolean;
  priceMultiplier: number;
  flightID: string;
  aircraftID: number;
}

export interface Reservation {
  reservationID: number;
  bookingDateTime: string;
  status: string;
  price: number;
  flightID: string;
  flightNumber: number;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  arrivalTime: string;
  seatNumber: string;
  seatClass: string;
  passengerName: string;
  passportNumber: string;
}

export interface CreateReservationDto {
  flightID: string;
  passengerID: number;
  seatID: number;
}

export interface Passenger {
  passengerID: number;
  fullName: string;
  passportNumber: string;
  age: number;
  nationality: string;
  gender: string;
  dateOfBirth: string;
}

export interface CreatePassengerDto {
  fullName: string;
  passportNumber: string;
  age: number;
  nationality: string;
  gender: string;
  dateOfBirth: string;
}

export interface Payment {
  paymentID: string;
  amount: number;
  paymentDate: string;
  status: string;
  paymentMethod: string;
  transactionReference: string;
}

export interface CreatePaymentDto {
  reservationID: number;
  paymentMethod: string;
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface Aircraft {
  aircraftID: number;
  model: string;
  seatingCapacity: number;
  status: string;
  registration: string;
  lastMaintenance: string;
  nextMaintenance: string;
  createdAt: string;
}

export interface CreateAircraftDto {
  model: string;
  seatingCapacity: number;
  registration: string;
}

export interface SystemStatistics {
  totalFlights: number;
  activeFlights: number;
  totalReservations: number;
  totalCustomers: number;
  totalAircraft: number;
  availableAircraft: number;
  totalRevenue: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
  amount: number;
} 