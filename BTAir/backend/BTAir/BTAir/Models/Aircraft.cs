using System.ComponentModel.DataAnnotations;

namespace BTAir.Models
{
    public class Aircraft
    {
        [Key]
        public int AircraftID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Model { get; set; } = string.Empty;
        
        [Required]
        public int SeatingCapacity { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Available";
        
        [StringLength(50)]
        public string Registration { get; set; } = string.Empty;
        
        public DateTime LastMaintenance { get; set; } = DateTime.UtcNow;
        
        public DateTime NextMaintenance { get; set; } = DateTime.UtcNow.AddDays(90);
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual ICollection<Flight> Flights { get; set; } = new List<Flight>();
        public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();
    }
} 