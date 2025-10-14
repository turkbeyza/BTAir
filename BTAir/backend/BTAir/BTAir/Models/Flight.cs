using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTAir.Models
{
    public class Flight
    {
        [Key]
        [StringLength(10)]
        public string FlightID { get; set; } = string.Empty;
        
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
        [StringLength(50)]
        public string Status { get; set; } = "Scheduled";
        
        public int AvailableSeats { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal BasePrice { get; set; }
        
        [ForeignKey("Aircraft")]
        public int AircraftID { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual Aircraft Aircraft { get; set; } = null!;
        public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
} 