using Microsoft.EntityFrameworkCore;
using BTAir.Data;
using BTAir.Models;
using BTAir.DTOs;

namespace BTAir.Services
{
    public interface IReservationService
    {
        Task<IEnumerable<ReservationDto>> GetUserReservationsAsync(int userIdOrCustomerId);
        Task<ReservationDto?> GetReservationByIdAsync(int reservationId);
        Task<ReservationDto?> CreateReservationAsync(int userIdOrCustomerId, CreateReservationDto createReservationDto);
        Task<ReservationDto?> UpdateReservationAsync(int reservationId, UpdateReservationDto updateReservationDto);
        Task<bool> CancelReservationAsync(int reservationId);
        Task<PaymentDto?> ProcessPaymentAsync(CreatePaymentDto createPaymentDto);
        Task<IEnumerable<PassengerDto>> GetCustomerPassengersAsync(int userIdOrCustomerId);
        Task<PassengerDto?> CreatePassengerAsync(int userIdOrCustomerId, CreatePassengerDto createPassengerDto);
    }

    public class ReservationService : IReservationService
    {
        private readonly BTAirDbContext _context;

        public ReservationService(BTAirDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReservationDto>> GetUserReservationsAsync(int userIdOrCustomerId)
        {
            var isCustomerId = await _context.Customers.AnyAsync(c => c.CustomerID == userIdOrCustomerId);
            
            int customerId;
            if (isCustomerId)
            {
                customerId = userIdOrCustomerId;
            }
            else
            {
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserID == userIdOrCustomerId);
                if (customer == null)
                {
                    return new List<ReservationDto>();
                }
                customerId = customer.CustomerID;
            }

            return await _context.Reservations
                .Include(r => r.Flight)
                .Include(r => r.Seat)
                .Include(r => r.Passenger)
                .Where(r => r.CustomerID == customerId)
                .Select(r => new ReservationDto
                {
                    ReservationID = r.ReservationID,
                    BookingDateTime = r.BookingDateTime,
                    Status = r.Status,
                    Price = r.Price,
                    FlightID = r.FlightID,
                    FlightNumber = r.Flight.FlightNumber,
                    DepartureLocation = r.Flight.DepartureLocation,
                    ArrivalLocation = r.Flight.ArrivalLocation,
                    DepartureTime = r.Flight.DepartureTime,
                    ArrivalTime = r.Flight.ArrivalTime,
                    SeatNumber = r.Seat.SeatNumber,
                    SeatClass = r.Seat.SeatClass,
                    PassengerName = r.Passenger.FullName,
                    PassportNumber = r.Passenger.PassportNumber
                })
                .OrderByDescending(r => r.BookingDateTime)
                .ToListAsync();
        }

        public async Task<ReservationDto?> GetReservationByIdAsync(int reservationId)
        {
            return await _context.Reservations
                .Include(r => r.Flight)
                .Include(r => r.Seat)
                .Include(r => r.Passenger)
                .Where(r => r.ReservationID == reservationId)
                .Select(r => new ReservationDto
                {
                    ReservationID = r.ReservationID,
                    BookingDateTime = r.BookingDateTime,
                    Status = r.Status,
                    Price = r.Price,
                    FlightID = r.FlightID,
                    FlightNumber = r.Flight.FlightNumber,
                    DepartureLocation = r.Flight.DepartureLocation,
                    ArrivalLocation = r.Flight.ArrivalLocation,
                    DepartureTime = r.Flight.DepartureTime,
                    ArrivalTime = r.Flight.ArrivalTime,
                    SeatNumber = r.Seat.SeatNumber,
                    SeatClass = r.Seat.SeatClass,
                    PassengerName = r.Passenger.FullName,
                    PassportNumber = r.Passenger.PassportNumber
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ReservationDto?> CreateReservationAsync(int userIdOrCustomerId, CreateReservationDto createReservationDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var isCustomerId = await _context.Customers.AnyAsync(c => c.CustomerID == userIdOrCustomerId);
                
                int customerId;
                if (isCustomerId)
                {
                    customerId = userIdOrCustomerId;
                }
                else
                {
                    var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserID == userIdOrCustomerId);
                    if (customer == null)
                    {
                        return null;
                    }
                    customerId = customer.CustomerID;
                }
                var flight = await _context.Flights.FindAsync(createReservationDto.FlightID);
                if (flight == null)
                {
                    Console.WriteLine($"Flight not found: {createReservationDto.FlightID}");
                    return null;
                }
                
                if (flight.Status != "Scheduled")
                {
                    Console.WriteLine($"Flight status is not Scheduled: {flight.Status}");
                    return null;
                }
                
                if (flight.AvailableSeats <= 0)
                {
                    Console.WriteLine($"No available seats: {flight.AvailableSeats}");
                    return null;
                }

                var seat = await _context.Seats.FindAsync(createReservationDto.SeatID);
                if (seat == null)
                {
                    Console.WriteLine($"Seat not found: {createReservationDto.SeatID}");
                    return null;
                }

                var existingReservation = await _context.Reservations
                    .AnyAsync(r => r.FlightID == createReservationDto.FlightID && 
                                  r.SeatID == createReservationDto.SeatID && 
                                  r.Status != "Cancelled");
                
                if (existingReservation)
                {
                    Console.WriteLine($"Seat already reserved for flight: {createReservationDto.FlightID}, Seat: {createReservationDto.SeatID}");
                    return null;
                }

                if (seat.FlightID != createReservationDto.FlightID)
                {
                    Console.WriteLine($"Seat {createReservationDto.SeatID} does not belong to flight {createReservationDto.FlightID}");
                    return null;
                }

                var passenger = await _context.Passengers
                    .FirstOrDefaultAsync(p => p.PassengerID == createReservationDto.PassengerID && 
                                             p.CustomerID == customerId);
                if (passenger == null)
                {
                    Console.WriteLine($"Passenger not found or doesn't belong to customer: PassengerID={createReservationDto.PassengerID}, CustomerID={customerId}");
                    return null;
                }

                var price = flight.BasePrice * seat.PriceMultiplier;

                var reservation = new Reservation
                {
                    CustomerID = customerId,
                    FlightID = createReservationDto.FlightID,
                    PassengerID = createReservationDto.PassengerID,
                    SeatID = createReservationDto.SeatID,
                    BookingDateTime = DateTime.UtcNow,
                    Status = "Pending",
                    Price = price,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reservations.Add(reservation);

                flight.AvailableSeats--;

                await _context.SaveChangesAsync();

                var ticket = new Ticket
                {
                    TicketID = GenerateTicketId(),
                    ReservationID = reservation.ReservationID,
                    IssueDate = DateTime.UtcNow,
                    TicketStatus = "Valid",
                    TicketType = "Electronic",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tickets.Add(ticket);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetReservationByIdAsync(reservation.ReservationID);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating reservation: {ex.Message}");
                await transaction.RollbackAsync();
                return null;
            }
        }

        public async Task<ReservationDto?> UpdateReservationAsync(int reservationId, UpdateReservationDto updateReservationDto)
        {
            var reservation = await _context.Reservations.FindAsync(reservationId);
            if (reservation == null) return null;

            if (!string.IsNullOrEmpty(updateReservationDto.Status))
            {
                reservation.Status = updateReservationDto.Status;
            }

            if (updateReservationDto.SeatID.HasValue && updateReservationDto.SeatID != reservation.SeatID)
            {
                var newSeat = await _context.Seats.FindAsync(updateReservationDto.SeatID.Value);
                if (newSeat == null) return null;

                var seatTaken = await _context.Reservations
                    .AnyAsync(r => r.FlightID == reservation.FlightID && 
                                  r.SeatID == updateReservationDto.SeatID.Value && 
                                  r.Status != "Cancelled" &&
                                  r.ReservationID != reservationId);
                
                if (seatTaken) return null;

                var flight = await _context.Flights.FindAsync(reservation.FlightID);
                if (flight != null)
                {
                    reservation.SeatID = updateReservationDto.SeatID.Value;
                    reservation.Price = flight.BasePrice * newSeat.PriceMultiplier;
                }
            }

            await _context.SaveChangesAsync();
            return await GetReservationByIdAsync(reservationId);
        }

        public async Task<bool> CancelReservationAsync(int reservationId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var reservation = await _context.Reservations
                    .Include(r => r.Flight)
                    .FirstOrDefaultAsync(r => r.ReservationID == reservationId);
                
                if (reservation == null) return false;

                var tickets = await _context.Tickets
                    .Where(t => t.ReservationID == reservationId)
                    .ToListAsync();
                
                foreach (var ticket in tickets)
                {
                    ticket.TicketStatus = "Cancelled";
                }

                var payments = await _context.Payments
                    .Where(p => p.ReservationID == reservationId)
                    .ToListAsync();
                
                foreach (var payment in payments)
                {
                    if (payment.Status == "Completed")
                    {
                        payment.Status = "Refunded";
                    }
                }

                reservation.Status = "Cancelled";
                
                reservation.Flight.AvailableSeats++;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<PaymentDto?> ProcessPaymentAsync(CreatePaymentDto createPaymentDto)
        {
            var reservation = await _context.Reservations.FindAsync(createPaymentDto.ReservationID);
            if (reservation == null || reservation.Status != "Pending")
            {
                return null;
            }

            var paymentId = GeneratePaymentId();
            var transactionRef = GenerateTransactionReference();

            var payment = new Payment
            {
                PaymentID = paymentId,
                ReservationID = createPaymentDto.ReservationID,
                Amount = reservation.Price,
                PaymentDate = DateTime.UtcNow,
                Status = "Completed",
                PaymentMethod = createPaymentDto.PaymentMethod,
                TransactionReference = transactionRef,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);

            reservation.Status = "Confirmed";

            await _context.SaveChangesAsync();

            return new PaymentDto
            {
                PaymentID = payment.PaymentID,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                Status = payment.Status,
                PaymentMethod = payment.PaymentMethod,
                TransactionReference = payment.TransactionReference
            };
        }

        public async Task<IEnumerable<PassengerDto>> GetCustomerPassengersAsync(int userIdOrCustomerId)
        {
            var isCustomerId = await _context.Customers.AnyAsync(c => c.CustomerID == userIdOrCustomerId);
            
            int customerId;
            if (isCustomerId)
            {
                customerId = userIdOrCustomerId;
            }
            else
            {
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserID == userIdOrCustomerId);
                if (customer == null)
                {
                    return new List<PassengerDto>();
                }
                customerId = customer.CustomerID;
            }

            return await _context.Passengers
                .Where(p => p.CustomerID == customerId)
                .Select(p => new PassengerDto
                {
                    PassengerID = p.PassengerID,
                    FullName = p.FullName,
                    PassportNumber = p.PassportNumber,
                    Age = p.Age,
                    Nationality = p.Nationality,
                    Gender = p.Gender,
                    DateOfBirth = p.DateOfBirth
                })
                .ToListAsync();
        }

        public async Task<PassengerDto?> CreatePassengerAsync(int userIdOrCustomerId, CreatePassengerDto createPassengerDto)
        {
            var isCustomerId = await _context.Customers.AnyAsync(c => c.CustomerID == userIdOrCustomerId);
            
            int customerId;
            if (isCustomerId)
            {
                customerId = userIdOrCustomerId;
            }
            else
            {
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserID == userIdOrCustomerId);
                if (customer == null)
                {
                    return null;
                }
                customerId = customer.CustomerID;
            }

            var existingPassenger = await _context.Passengers
                .FirstOrDefaultAsync(p => p.CustomerID == customerId && p.PassportNumber == createPassengerDto.PassportNumber);
            
            if (existingPassenger != null)
            {
                return null;
            }

            var passenger = new Passenger
            {
                CustomerID = customerId,
                FullName = createPassengerDto.FullName,
                PassportNumber = createPassengerDto.PassportNumber,
                Age = createPassengerDto.Age,
                Nationality = createPassengerDto.Nationality,
                Gender = createPassengerDto.Gender,
                DateOfBirth = createPassengerDto.DateOfBirth,
                CreatedAt = DateTime.UtcNow
            };

            _context.Passengers.Add(passenger);
            await _context.SaveChangesAsync();

            return new PassengerDto
            {
                PassengerID = passenger.PassengerID,
                FullName = passenger.FullName,
                PassportNumber = passenger.PassportNumber,
                Age = passenger.Age,
                Nationality = passenger.Nationality,
                Gender = passenger.Gender,
                DateOfBirth = passenger.DateOfBirth
            };
        }

        private string GenerateTicketId()
        {
            return $"TKT{DateTime.UtcNow:yyMMddHHmmss}{Random.Shared.Next(100, 999)}";
        }

        private string GeneratePaymentId()
        {
            return $"PAY{DateTime.UtcNow:yyMMddHHmmss}{Random.Shared.Next(100, 999)}";
        }

        private string GenerateTransactionReference()
        {
            return $"TXN{DateTime.UtcNow:yyMMddHHmmss}{Random.Shared.Next(1000, 9999)}";
        }
    }
} 