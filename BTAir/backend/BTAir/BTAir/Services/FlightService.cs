using Microsoft.EntityFrameworkCore;
using BTAir.Data;
using BTAir.Models;
using BTAir.DTOs;

namespace BTAir.Services
{
    public interface IFlightService
    {
        Task<IEnumerable<FlightDto>> GetAllFlightsAsync();
        Task<FlightDto?> GetFlightByIdAsync(string flightId);
        Task<IEnumerable<FlightDto>> SearchFlightsAsync(FlightSearchDto searchDto);
        Task<FlightDto?> CreateFlightAsync(CreateFlightDto createFlightDto);
        Task<FlightDto?> UpdateFlightAsync(string flightId, UpdateFlightDto updateFlightDto);
        Task<bool> DeleteFlightAsync(string flightId);
        Task<IEnumerable<SeatDto>> GetFlightSeatsAsync(string flightId);
        Task<bool> IsAircraftAvailableAsync(int aircraftId, DateTime departureTime, DateTime arrivalTime, string? excludeFlightId = null);
    }

    public class FlightService : IFlightService
    {
        private readonly BTAirDbContext _context;

        public FlightService(BTAirDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FlightDto>> GetAllFlightsAsync()
        {
            return await _context.Flights
                .Include(f => f.Aircraft)
                .Select(f => new FlightDto
                {
                    FlightID = f.FlightID,
                    FlightNumber = f.FlightNumber,
                    DepartureTime = f.DepartureTime,
                    ArrivalTime = f.ArrivalTime,
                    DepartureLocation = f.DepartureLocation,
                    ArrivalLocation = f.ArrivalLocation,
                    Status = f.Status,
                    AvailableSeats = f.AvailableSeats,
                    BasePrice = f.BasePrice,
                    AircraftID = f.AircraftID,
                    AircraftModel = f.Aircraft.Model
                })
                .ToListAsync();
        }

        public async Task<FlightDto?> GetFlightByIdAsync(string flightId)
        {
            return await _context.Flights
                .Include(f => f.Aircraft)
                .Where(f => f.FlightID == flightId)
                .Select(f => new FlightDto
                {
                    FlightID = f.FlightID,
                    FlightNumber = f.FlightNumber,
                    DepartureTime = f.DepartureTime,
                    ArrivalTime = f.ArrivalTime,
                    DepartureLocation = f.DepartureLocation,
                    ArrivalLocation = f.ArrivalLocation,
                    Status = f.Status,
                    AvailableSeats = f.AvailableSeats,
                    BasePrice = f.BasePrice,
                    AircraftID = f.AircraftID,
                    AircraftModel = f.Aircraft.Model
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<FlightDto>> SearchFlightsAsync(FlightSearchDto searchDto)
        {
            var query = _context.Flights
                .Include(f => f.Aircraft)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchDto.DepartureLocation))
            {
                query = query.Where(f => f.DepartureLocation.Contains(searchDto.DepartureLocation));
            }

            if (!string.IsNullOrEmpty(searchDto.ArrivalLocation))
            {
                query = query.Where(f => f.ArrivalLocation.Contains(searchDto.ArrivalLocation));
            }

            if (searchDto.DepartureDate.HasValue)
            {
                var startOfDay = searchDto.DepartureDate.Value.Date;
                var endOfDay = startOfDay.AddDays(1);
                query = query.Where(f => f.DepartureTime >= startOfDay && f.DepartureTime < endOfDay);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query = query.Where(f => f.BasePrice <= searchDto.MaxPrice.Value);
            }

            query = query.Where(f => f.AvailableSeats >= searchDto.Passengers);
            query = query.Where(f => f.Status == "Scheduled");

            return await query
                .Select(f => new FlightDto
                {
                    FlightID = f.FlightID,
                    FlightNumber = f.FlightNumber,
                    DepartureTime = f.DepartureTime,
                    ArrivalTime = f.ArrivalTime,
                    DepartureLocation = f.DepartureLocation,
                    ArrivalLocation = f.ArrivalLocation,
                    Status = f.Status,
                    AvailableSeats = f.AvailableSeats,
                    BasePrice = f.BasePrice,
                    AircraftID = f.AircraftID,
                    AircraftModel = f.Aircraft.Model
                })
                .OrderBy(f => f.DepartureTime)
                .ToListAsync();
        }

        public async Task<FlightDto?> CreateFlightAsync(CreateFlightDto createFlightDto)
        {
            if (!await IsAircraftAvailableAsync(createFlightDto.AircraftID, createFlightDto.DepartureTime, createFlightDto.ArrivalTime))
            {
                return null;
            }

            var aircraft = await _context.Aircraft.FindAsync(createFlightDto.AircraftID);
            if (aircraft == null || aircraft.Status != "Available")
            {
                return null;
            }

            var flightId = GenerateFlightId(createFlightDto.FlightNumber);

            var flight = new Flight
            {
                FlightID = flightId,
                FlightNumber = createFlightDto.FlightNumber,
                DepartureTime = createFlightDto.DepartureTime,
                ArrivalTime = createFlightDto.ArrivalTime,
                DepartureLocation = createFlightDto.DepartureLocation,
                ArrivalLocation = createFlightDto.ArrivalLocation,
                BasePrice = createFlightDto.BasePrice,
                AircraftID = createFlightDto.AircraftID,
                AvailableSeats = aircraft.SeatingCapacity,
                Status = "Scheduled",
                CreatedAt = DateTime.UtcNow
            };

            _context.Flights.Add(flight);
            await _context.SaveChangesAsync();

            await CreateSeatsForFlightAsync(flightId, createFlightDto.AircraftID);

            return await GetFlightByIdAsync(flightId);
        }

        public async Task<FlightDto?> UpdateFlightAsync(string flightId, UpdateFlightDto updateFlightDto)
        {
            var flight = await _context.Flights.FindAsync(flightId);
            if (flight == null) return null;

            if (updateFlightDto.AircraftID.HasValue && updateFlightDto.AircraftID != flight.AircraftID)
            {
                var departureTime = updateFlightDto.DepartureTime ?? flight.DepartureTime;
                var arrivalTime = updateFlightDto.ArrivalTime ?? flight.ArrivalTime;
                
                if (!await IsAircraftAvailableAsync(updateFlightDto.AircraftID.Value, departureTime, arrivalTime, flightId))
                {
                    return null;
                }
            }

            if (updateFlightDto.DepartureTime.HasValue)
                flight.DepartureTime = updateFlightDto.DepartureTime.Value;
            
            if (updateFlightDto.ArrivalTime.HasValue)
                flight.ArrivalTime = updateFlightDto.ArrivalTime.Value;
            
            if (!string.IsNullOrEmpty(updateFlightDto.DepartureLocation))
                flight.DepartureLocation = updateFlightDto.DepartureLocation;
            
            if (!string.IsNullOrEmpty(updateFlightDto.ArrivalLocation))
                flight.ArrivalLocation = updateFlightDto.ArrivalLocation;
            
            if (!string.IsNullOrEmpty(updateFlightDto.Status))
                flight.Status = updateFlightDto.Status;
            
            if (updateFlightDto.BasePrice.HasValue)
                flight.BasePrice = updateFlightDto.BasePrice.Value;
            
            if (updateFlightDto.AircraftID.HasValue)
                flight.AircraftID = updateFlightDto.AircraftID.Value;

            await _context.SaveChangesAsync();
            return await GetFlightByIdAsync(flightId);
        }

        public async Task<bool> DeleteFlightAsync(string flightId)
        {
            var flight = await _context.Flights.FindAsync(flightId);
            if (flight == null) return false;

            var hasReservations = await _context.Reservations.AnyAsync(r => r.FlightID == flightId);
            if (hasReservations)
            {
                flight.Status = "Cancelled";
                await _context.SaveChangesAsync();
                return true;
            }

            _context.Flights.Remove(flight);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<SeatDto>> GetFlightSeatsAsync(string flightId)
        {
            var flight = await _context.Flights.FindAsync(flightId);
            if (flight == null) return new List<SeatDto>();

            var reservedSeatIds = await _context.Reservations
                .Where(r => r.FlightID == flightId && r.Status != "Cancelled")
                .Select(r => r.SeatID)
                .ToListAsync();

            return await _context.Seats
                .Where(s => s.FlightID == flightId)
                .Select(s => new SeatDto
                {
                    SeatID = s.SeatID,
                    SeatNumber = s.SeatNumber,
                    SeatClass = s.SeatClass,
                    IsAvailable = !reservedSeatIds.Contains(s.SeatID),
                    PriceMultiplier = s.PriceMultiplier,
                    FlightID = s.FlightID,
                    AircraftID = s.AircraftID
                })
                .ToListAsync();
        }

        public async Task<bool> IsAircraftAvailableAsync(int aircraftId, DateTime departureTime, DateTime arrivalTime, string? excludeFlightId = null)
        {
            var conflictingFlights = await _context.Flights
                .Where(f => f.AircraftID == aircraftId && 
                           f.Status != "Cancelled" && 
                           f.FlightID != excludeFlightId &&
                           ((f.DepartureTime < arrivalTime && f.ArrivalTime > departureTime)))
                .AnyAsync();

            return !conflictingFlights;
        }

        private string GenerateFlightId(int flightNumber)
        {
            return $"BT{flightNumber:D4}";
        }

        private async Task CreateSeatsForFlightAsync(string flightId, int aircraftId)
        {
            var existingSeats = await _context.Seats.AnyAsync(s => s.FlightID == flightId);
            if (existingSeats)
                return;

            var seats = CreateSeatsForFlight(flightId, aircraftId);
            _context.Seats.AddRange(seats);
            await _context.SaveChangesAsync();
        }

        private List<Seat> CreateSeatsForFlight(string flightId, int aircraftId)
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
} 