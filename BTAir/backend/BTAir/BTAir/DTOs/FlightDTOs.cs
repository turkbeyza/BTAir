using System.ComponentModel.DataAnnotations;

namespace BTAir.DTOs
{
    public class FlightDto
    {
        public string FlightID { get; set; } = string.Empty;
        public int FlightNumber { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }
        public string DepartureLocation { get; set; } = string.Empty;
        public string ArrivalLocation { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int AvailableSeats { get; set; }
        public decimal BasePrice { get; set; }
        public int AircraftID { get; set; }
        public string AircraftModel { get; set; } = string.Empty;
        public TimeSpan Duration => ArrivalTime - DepartureTime;
    }

    public class SeatDto
    {
        public int SeatID { get; set; }
        public string SeatNumber { get; set; } = string.Empty;
        public string SeatClass { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public decimal PriceMultiplier { get; set; }
        public string FlightID { get; set; } = string.Empty;
        public int AircraftID { get; set; }
    }

    public class CreateFlightDto
    {
        [Required]
        public int FlightNumber { get; set; }
        
        [Required]
        public DateTime DepartureTime { get; set; }
        
        [Required]
        public DateTime ArrivalTime { get; set; }
        
        [Required]
        [StringLength(100)]
        public string DepartureLocation { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string ArrivalLocation { get; set; } = string.Empty;
        
        [Required]
        public decimal BasePrice { get; set; }
        
        [Required]
        public int AircraftID { get; set; }
    }

    public class UpdateFlightDto
    {
        public DateTime? DepartureTime { get; set; }
        public DateTime? ArrivalTime { get; set; }
        public string? DepartureLocation { get; set; }
        public string? ArrivalLocation { get; set; }
        public string? Status { get; set; }
        public decimal? BasePrice { get; set; }
        public int? AircraftID { get; set; }
    }

    public class FlightSearchDto
    {
        public string? DepartureLocation { get; set; }
        public string? ArrivalLocation { get; set; }
        public DateTime? DepartureDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public int Passengers { get; set; } = 1;
        public string? SeatClass { get; set; }
        public decimal? MaxPrice { get; set; }
    }
} 