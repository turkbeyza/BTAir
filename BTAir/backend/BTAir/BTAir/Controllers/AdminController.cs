using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BTAir.Data;
using BTAir.Models;

namespace BTAir.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly BTAirDbContext _context;

        public AdminController(BTAirDbContext context)
        {
            _context = context;
        }

        [HttpGet("aircraft")]
        public async Task<IActionResult> GetAllAircraft()
        {
            var aircraft = await _context.Aircraft.ToListAsync();
            return Ok(aircraft);
        }

        [HttpGet("aircraft/{id}")]
        public async Task<IActionResult> GetAircraft(int id)
        {
            var aircraft = await _context.Aircraft.FindAsync(id);
            if (aircraft == null)
                return NotFound(new { message = "Aircraft not found" });

            return Ok(aircraft);
        }

        [HttpPost("aircraft")]
        public async Task<IActionResult> CreateAircraft([FromBody] CreateAircraftDto createAircraftDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var aircraft = new Aircraft
            {
                Model = createAircraftDto.Model,
                SeatingCapacity = createAircraftDto.SeatingCapacity,
                Status = "Available",
                Registration = createAircraftDto.Registration,
                LastMaintenance = DateTime.UtcNow,
                NextMaintenance = DateTime.UtcNow.AddDays(90),
                CreatedAt = DateTime.UtcNow
            };

            _context.Aircraft.Add(aircraft);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAircraft), new { id = aircraft.AircraftID }, aircraft);
        }

        [HttpPut("aircraft/{id}")]
        public async Task<IActionResult> UpdateAircraft(int id, [FromBody] UpdateAircraftDto updateAircraftDto)
        {
            var aircraft = await _context.Aircraft.FindAsync(id);
            if (aircraft == null)
                return NotFound(new { message = "Aircraft not found" });

            if (!string.IsNullOrEmpty(updateAircraftDto.Model))
                aircraft.Model = updateAircraftDto.Model;

            if (updateAircraftDto.SeatingCapacity.HasValue)
                aircraft.SeatingCapacity = updateAircraftDto.SeatingCapacity.Value;

            if (!string.IsNullOrEmpty(updateAircraftDto.Status))
                aircraft.Status = updateAircraftDto.Status;

            if (!string.IsNullOrEmpty(updateAircraftDto.Registration))
                aircraft.Registration = updateAircraftDto.Registration;

            if (updateAircraftDto.LastMaintenance.HasValue)
                aircraft.LastMaintenance = updateAircraftDto.LastMaintenance.Value;

            if (updateAircraftDto.NextMaintenance.HasValue)
                aircraft.NextMaintenance = updateAircraftDto.NextMaintenance.Value;

            await _context.SaveChangesAsync();
            return Ok(aircraft);
        }

        [HttpDelete("aircraft/{id}")]
        public async Task<IActionResult> DeleteAircraft(int id)
        {
            var aircraft = await _context.Aircraft.FindAsync(id);
            if (aircraft == null)
                return NotFound(new { message = "Aircraft not found" });

            var hasActiveFlights = await _context.Flights
                .AnyAsync(f => f.AircraftID == id && f.Status != "Cancelled");

            if (hasActiveFlights)
                return BadRequest(new { message = "Cannot delete aircraft with active flights" });

            _context.Aircraft.Remove(aircraft);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetSystemStatistics()
        {
            var stats = new
            {
                TotalFlights = await _context.Flights.CountAsync(),
                ActiveFlights = await _context.Flights.CountAsync(f => f.Status == "Scheduled"),
                TotalReservations = await _context.Reservations.CountAsync(),
                TotalCustomers = await _context.Customers.CountAsync(),
                TotalAircraft = await _context.Aircraft.CountAsync(),
                AvailableAircraft = await _context.Aircraft.CountAsync(a => a.Status == "Available"),
                TotalRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed")
                    .SumAsync(p => p.Amount)
            };

            return Ok(stats);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();

            var result = users.Select(u => new
            {
                u.UserID,
                FirstName = u.Name.Split(' ').Length > 0 ? u.Name.Split(' ')[0] : "",
                LastName = u.Name.Split(' ').Length > 1 ? string.Join(" ", u.Name.Split(' ').Skip(1)) : "",
                u.Email,
                u.Role,
                u.CreatedAt,
                u.IsActive
            });

            return Ok(result);
        }

        [HttpPut("users/{userId}/role")]
        public async Task<IActionResult> UpdateUserRole(int userId, [FromBody] UpdateUserRoleDto updateRoleDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.Role = updateRoleDto.Role;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User role updated successfully" });
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.Role == "Admin")
                return BadRequest(new { message = "Cannot delete admin users" });

            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserID == userId);
            if (customer != null)
            {
                var hasReservations = await _context.Reservations.AnyAsync(r => r.CustomerID == customer.CustomerID);
                if (hasReservations)
                    return BadRequest(new { message = "Cannot delete user with existing reservations" });

                _context.Customers.Remove(customer);
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _context.Customers
                .Include(c => c.User)
                .ToListAsync();

            var result = customers.Select(c => new
            {
                c.CustomerID,
                FirstName = c.User.Name.Split(' ').Length > 0 ? c.User.Name.Split(' ')[0] : "",
                LastName = c.User.Name.Split(' ').Length > 1 ? string.Join(" ", c.User.Name.Split(' ').Skip(1)) : "",
                Email = c.User.Email,
                c.PhoneNumber,
                DateOfBirth = c.User.CreatedAt,
                c.Address,
                c.CreatedAt,
                c.UserID
            });

            return Ok(result);
        }

        [HttpDelete("customers/{customerId}")]
        public async Task<IActionResult> DeleteCustomer(int customerId)
        {
            var customer = await _context.Customers
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.CustomerID == customerId);

            if (customer == null)
                return NotFound(new { message = "Customer not found" });

            var hasReservations = await _context.Reservations.AnyAsync(r => r.CustomerID == customerId);
            if (hasReservations)
                return BadRequest(new { message = "Cannot delete customer with existing reservations" });

            _context.Customers.Remove(customer);
            if (customer.User != null)
            {
                _context.Users.Remove(customer.User);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("recent-activities")]
        public async Task<IActionResult> GetRecentActivities()
        {
            var recentReservations = await _context.Reservations
                .Include(r => r.Flight)
                .Include(r => r.Customer)
                .ThenInclude(c => c.User)
                .OrderByDescending(r => r.BookingDateTime)
                .Take(10)
                .Select(r => new
                {
                    Type = "Reservation",
                    Description = $"New reservation by {r.Customer.User.Name} for flight {r.Flight.FlightNumber}",
                    Timestamp = r.BookingDateTime,
                    Amount = r.Price
                })
                .ToListAsync();

            var recentPayments = await _context.Payments
                .Include(p => p.Reservation)
                .ThenInclude(r => r.Customer)
                .ThenInclude(c => c.User)
                .OrderByDescending(p => p.PaymentDate)
                .Take(10)
                .Select(p => new
                {
                    Type = "Payment",
                    Description = $"Payment of ${p.Amount} received from {p.Reservation.Customer.User.Name}",
                    Timestamp = p.PaymentDate,
                    Amount = p.Amount
                })
                .ToListAsync();

            var activities = recentReservations.Concat(recentPayments)
                .OrderByDescending(a => a.Timestamp)
                .Take(20);

            return Ok(activities);
        }

        [HttpPost("flights/{flightId}/seats")]
        public async Task<IActionResult> CreateSeatsForFlight(string flightId)
        {
            var flight = await _context.Flights.FindAsync(flightId);
            if (flight == null)
                return NotFound(new { message = "Flight not found" });

            var existingSeats = _context.Seats.Any(s => s.FlightID == flightId);
            if (existingSeats)
                return BadRequest(new { message = "Seats already exist for this flight" });

            var aircraft = await _context.Aircraft.FindAsync(flight.AircraftID);
            if (aircraft == null)
                return BadRequest(new { message = "Aircraft not found" });

            var seats = CreateSeatsForFlightHelper(flightId, flight.AircraftID);
            _context.Seats.AddRange(seats);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Created {seats.Count} seats for flight {flightId}", seatsCreated = seats.Count });
        }

        [HttpDelete("seats")]
        public async Task<IActionResult> ClearAllSeats()
        {
            var seats = await _context.Seats.ToListAsync();
            _context.Seats.RemoveRange(seats);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Cleared {seats.Count} seats from database" });
        }

        private List<Seat> CreateSeatsForFlightHelper(string flightId, int aircraftId)
        {
            var seats = new List<Seat>();
            
            int firstClassRows, businessClassRows, economyClassRows;
            if (aircraftId == 1)
            {
                firstClassRows = 3;
                businessClassRows = 5;
                economyClassRows = 27;
            }
            else
            {
                firstClassRows = 2;
                businessClassRows = 4;
                economyClassRows = 24;
            }
            
            for (int row = 1; row <= firstClassRows; row++)
            {
                foreach (char seatLetter in new[] { 'A', 'B', 'C', 'D', 'E', 'F' })
                {
                    seats.Add(new Seat
                    {
                        SeatNumber = $"{row}{seatLetter}",
                        SeatClass = "First",
                        IsAvailable = true,
                        PriceMultiplier = 3.0m,
                        FlightID = flightId,
                        AircraftID = aircraftId
                    });
                }
            }
            
            for (int row = firstClassRows + 1; row <= firstClassRows + businessClassRows; row++)
            {
                foreach (char seatLetter in new[] { 'A', 'B', 'C', 'D', 'E', 'F' })
                {
                    seats.Add(new Seat
                    {
                        SeatNumber = $"{row}{seatLetter}",
                        SeatClass = "Business",
                        IsAvailable = true,
                        PriceMultiplier = 2.0m,
                        FlightID = flightId,
                        AircraftID = aircraftId
                    });
                }
            }
            
            for (int row = firstClassRows + businessClassRows + 1; row <= firstClassRows + businessClassRows + economyClassRows; row++)
            {
                foreach (char seatLetter in new[] { 'A', 'B', 'C', 'D', 'E', 'F' })
                {
                    seats.Add(new Seat
                    {
                        SeatNumber = $"{row}{seatLetter}",
                        SeatClass = "Economy",
                        IsAvailable = true,
                        PriceMultiplier = 1.0m,
                        FlightID = flightId,
                        AircraftID = aircraftId
                    });
                }
            }

            return seats;
        }
    }

    public class CreateAircraftDto
    {
        public string Model { get; set; } = string.Empty;
        public int SeatingCapacity { get; set; }
        public string Registration { get; set; } = string.Empty;
    }

    public class UpdateAircraftDto
    {
        public string? Model { get; set; }
        public int? SeatingCapacity { get; set; }
        public string? Status { get; set; }
        public string? Registration { get; set; }
        public DateTime? LastMaintenance { get; set; }
        public DateTime? NextMaintenance { get; set; }
    }

    public class UpdateUserRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }
} 