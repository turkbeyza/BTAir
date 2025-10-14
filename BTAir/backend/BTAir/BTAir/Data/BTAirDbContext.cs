using Microsoft.EntityFrameworkCore;
using BTAir.Models;

namespace BTAir.Data
{
    public class BTAirDbContext : DbContext
    {
        public BTAirDbContext(DbContextOptions<BTAirDbContext> options) : base(options)
        {
        }
    
        public DbSet<User> Users { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<AirlineStaff> AirlineStaff { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Aircraft> Aircraft { get; set; }
        public DbSet<Flight> Flights { get; set; }
        public DbSet<Seat> Seats { get; set; }
        public DbSet<Passenger> Passengers { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Customer>()
                .HasOne(c => c.User)
                .WithOne(u => u.Customer)
                .HasForeignKey<Customer>(c => c.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AirlineStaff>()
                .HasOne(s => s.User)
                .WithOne(u => u.AirlineStaff)
                .HasForeignKey<AirlineStaff>(s => s.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Admin>()
                .HasOne(a => a.User)
                .WithOne(u => u.Admin)
                .HasForeignKey<Admin>(a => a.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Flight>()
                .HasOne(f => f.Aircraft)
                .WithMany(a => a.Flights)
                .HasForeignKey(f => f.AircraftID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Seat>()
                .HasOne(s => s.Flight)
                .WithMany(f => f.Seats)
                .HasForeignKey(s => s.FlightID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Seat>()
                .HasOne(s => s.Aircraft)
                .WithMany(a => a.Seats)
                .HasForeignKey(s => s.AircraftID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Passenger>()
                .HasOne(p => p.Customer)
                .WithMany(c => c.Passengers)
                .HasForeignKey(p => p.CustomerID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Customer)
                .WithMany(c => c.Reservations)
                .HasForeignKey(r => r.CustomerID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Flight)
                .WithMany(f => f.Reservations)
                .HasForeignKey(r => r.FlightID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Passenger)
                .WithMany(p => p.Reservations)
                .HasForeignKey(r => r.PassengerID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Seat)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.SeatID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Reservation)
                .WithMany(r => r.Tickets)
                .HasForeignKey(t => t.ReservationID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Reservation)
                .WithMany(r => r.Payments)
                .HasForeignKey(p => p.ReservationID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Flight>()
                .HasIndex(f => f.FlightNumber);

            modelBuilder.Entity<Passenger>()
                .HasIndex(p => p.PassportNumber)
                .IsUnique();

            modelBuilder.Entity<Seat>()
                .HasIndex(s => new { s.FlightID, s.SeatNumber })
                .IsUnique();

            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    UserID = 1,
                    Name = "Admin User",
                    Email = "admin@btair.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                }
            );

            modelBuilder.Entity<Admin>().HasData(
                new Admin
                {
                    AdminID = 1,
                    UserID = 1,
                    AccessLevel = "SuperAdmin",
                    CreatedAt = DateTime.UtcNow
                }
            );

            modelBuilder.Entity<Aircraft>().HasData(
                new Aircraft
                {
                    AircraftID = 1,
                    Model = "Boeing 737-800",
                    SeatingCapacity = 189,
                    Status = "Available",
                    Registration = "BT-001",
                    CreatedAt = DateTime.UtcNow
                },
                new Aircraft
                {
                    AircraftID = 2,
                    Model = "Airbus A320",
                    SeatingCapacity = 180,
                    Status = "Available",
                    Registration = "BT-002",
                    CreatedAt = DateTime.UtcNow
                }
            );

        }

        private List<Seat> CreateSeatsForFlight(string flightId, int aircraftId, ref int seatId)
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
                        SeatID = seatId++,
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
                        SeatID = seatId++,
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
                        SeatID = seatId++,
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