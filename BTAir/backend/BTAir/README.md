# BTAir - Airline Reservation System API

## Overview

BTAir is a comprehensive airline reservation system API built with ASP.NET Core 8.0 and Entity Framework Core. It provides functionality for flight management, customer reservations, payment processing, and administrative operations.

## Features

- **User Authentication & Authorization**
  - Customer registration and login
  - Role-based access (Customer, Staff, Admin)
  - Secure password hashing with BCrypt

- **Flight Management**
  - Create, update, and delete flights
  - Search flights by destination, date, and price
  - Aircraft assignment and availability checking
  - Seat management and pricing

- **Reservation System**
  - Create and manage reservations
  - Passenger information management
  - Seat selection and pricing
  - Cancellation handling

- **Payment Processing**
  - Simulated payment processing (for educational purposes)
  - Payment history tracking
  - Multiple payment methods support

- **Admin Features**
  - Aircraft fleet management
  - System statistics and reporting
  - User role management
  - Recent activities monitoring

## Technology Stack

- **Backend**: ASP.NET Core 8.0
- **Database**: SQL Server (LocalDB for development)
- **ORM**: Entity Framework Core
- **Authentication**: BCrypt for password hashing
- **API Documentation**: Swagger/OpenAPI
- **Architecture**: Clean Architecture with separate layers

## Setup Instructions

### Prerequisites

- .NET 8.0 SDK
- SQL Server LocalDB (or SQL Server)
- Visual Studio 2022 or VS Code

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BTAir/backend/BTAir
   ```

2. **Restore NuGet packages**
   ```bash
   dotnet restore
   ```

3. **Update database connection string** (if needed)
   Edit `appsettings.json` and update the connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=BTAirDB;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

4. **Run the application**
   ```bash
   dotnet run
   ```

5. **Access the API**
   - API: `https://localhost:7xxx` (port will be displayed in console)
   - Swagger UI: `https://localhost:7xxx/` (root path)

## Database Setup

The application automatically creates the database and seeds sample data on first run:

- **Default Admin User**: 
  - Email: `admin@btair.com`
  - Password: `admin123`
  - Role: Admin

- **Sample Aircraft**:
  - Boeing 737-800 (189 seats)
  - Airbus A320 (180 seats)

- **Sample Seats**: Automatically generated for each aircraft with different classes (First, Business, Economy)

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new customer account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "123 Main St, City, Country",
  "phoneNumber": "+1234567890"
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "userID": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Customer",
  "token": "generated-token",
  "tokenExpiry": "2024-01-02T12:00:00Z"
}
```

### Flight Endpoints

#### GET `/api/flights`
Get all flights.

#### GET `/api/flights/{flightId}`
Get specific flight details.

#### POST `/api/flights/search`
Search for flights.

**Request Body:**
```json
{
  "departureLocation": "New York",
  "arrivalLocation": "Los Angeles",
  "departureDate": "2024-01-15",
  "passengers": 2,
  "maxPrice": 500
}
```

#### POST `/api/flights`
Create a new flight (Admin/Staff only).

**Request Body:**
```json
{
  "flightNumber": 1001,
  "departureTime": "2024-01-15T08:00:00Z",
  "arrivalTime": "2024-01-15T11:00:00Z",
  "departureLocation": "New York",
  "arrivalLocation": "Los Angeles",
  "basePrice": 299.99,
  "aircraftID": 1
}
```

#### GET `/api/flights/{flightId}/seats`
Get available seats for a flight.

### Reservation Endpoints

#### GET `/api/reservations/customer/{customerId}`
Get all reservations for a customer.

#### POST `/api/reservations/customer/{customerId}`
Create a new reservation.

**Request Body:**
```json
{
  "flightID": "BT1001",
  "passengerID": 1,
  "seatID": 25
}
```

#### POST `/api/reservations/payments`
Process payment for a reservation.

**Request Body:**
```json
{
  "reservationID": 1,
  "paymentMethod": "Credit Card",
  "cardNumber": "4111111111111111",
  "cardHolderName": "John Doe",
  "expiryDate": "12/25",
  "cvv": "123"
}
```

#### GET `/api/reservations/customers/{customerId}/passengers`
Get all passengers for a customer.

#### POST `/api/reservations/customers/{customerId}/passengers`
Add a new passenger.

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "passportNumber": "P123456789",
  "age": 28,
  "nationality": "American",
  "gender": "Female",
  "dateOfBirth": "1995-05-15"
}
```

### Admin Endpoints

#### GET `/api/admin/aircraft`
Get all aircraft.

#### POST `/api/admin/aircraft`
Add new aircraft.

**Request Body:**
```json
{
  "model": "Boeing 777-300",
  "seatingCapacity": 396,
  "registration": "BT-003"
}
```

#### GET `/api/admin/statistics`
Get system statistics.

**Response:**
```json
{
  "totalFlights": 25,
  "activeFlights": 20,
  "totalReservations": 150,
  "totalCustomers": 75,
  "totalAircraft": 3,
  "availableAircraft": 2,
  "totalRevenue": 45750.00
}
```

#### GET `/api/admin/users`
Get all users (Admin only).

#### GET `/api/admin/recent-activities`
Get recent system activities.

## Data Models

### Core Models

- **User**: Base user information with role-based access
- **Customer**: Customer profile linked to User
- **Aircraft**: Aircraft information and seating capacity
- **Flight**: Flight details with scheduling and pricing
- **Seat**: Individual seat information with class and pricing
- **Passenger**: Passenger information for bookings
- **Reservation**: Booking information linking customer, flight, and seat
- **Payment**: Payment processing and history
- **Ticket**: Electronic ticket generation

### Relationships

- User (1) → Customer/Staff/Admin (1)
- Aircraft (1) → Flights (*)
- Aircraft (1) → Seats (*)
- Customer (1) → Passengers (*)
- Customer (1) → Reservations (*)
- Flight (1) → Reservations (*)
- Reservation (1) → Payments (*)
- Reservation (1) → Tickets (*)

## Business Rules

1. **Aircraft Availability**: Aircraft cannot be assigned to overlapping flights
2. **Seat Management**: Seats cannot be double-booked for the same flight
3. **Payment Processing**: Reservations must be paid to be confirmed
4. **Cancellation Policy**: Cancelled reservations free up seats automatically
5. **User Roles**: Different access levels for Customer, Staff, and Admin
6. **Data Integrity**: Foreign key constraints ensure data consistency

## Security Features

- Password hashing using BCrypt
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- Role-based access control
- CORS configuration for frontend integration

## Development Notes

- **Educational Purpose**: Payment processing is simulated for learning
- **Database**: Uses SQL Server LocalDB for easy development setup
- **Seeding**: Automatic data seeding for development environment
- **Error Handling**: Comprehensive error responses with meaningful messages
- **API Documentation**: Swagger UI available at root URL

## Sample Usage Flow

1. **Register/Login**: Create account or login as existing user
2. **Search Flights**: Find available flights by destination and date
3. **Add Passengers**: Add passenger information for booking
4. **Select Seats**: Choose seats from available options
5. **Create Reservation**: Book the flight with selected seat
6. **Process Payment**: Complete payment to confirm reservation
7. **Manage Booking**: View, modify, or cancel reservations

## Testing

Use the Swagger UI interface for easy API testing, or use tools like Postman with the provided endpoint examples.

For admin functions, login with the default admin account:
- Email: `admin@btair.com`
- Password: `admin123`

## Support

This is an educational project demonstrating airline reservation system concepts. For questions or improvements, please refer to the code documentation and comments. 