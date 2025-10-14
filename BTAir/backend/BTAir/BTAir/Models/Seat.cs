using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTAir.Models
{
    public class Seat
    {
        [Key]
        public int SeatID { get; set; }
        
        [Required]
        [StringLength(10)]
        public string SeatNumber { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string SeatClass { get; set; } = "Economy";
        
        public bool IsAvailable { get; set; } = true;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal PriceMultiplier { get; set; } = 1.0m;
        
        [ForeignKey("Flight")]
        public string FlightID { get; set; } = string.Empty;
        
        [ForeignKey("Aircraft")]
        public int AircraftID { get; set; }
        
        public virtual Flight Flight { get; set; } = null!;
        public virtual Aircraft Aircraft { get; set; } = null!;
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
} 