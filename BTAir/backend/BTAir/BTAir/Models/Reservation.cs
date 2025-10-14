using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTAir.Models
{
    public class Reservation
    {
        [Key]
        public int ReservationID { get; set; }
        
        [Required]
        public DateTime BookingDateTime { get; set; } = DateTime.UtcNow;
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Confirmed";
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        [ForeignKey("Customer")]
        public int CustomerID { get; set; }
        
        [ForeignKey("Flight")]
        public string FlightID { get; set; } = string.Empty;
        
        [ForeignKey("Passenger")]
        public int PassengerID { get; set; }
        
        [ForeignKey("Seat")]
        public int SeatID { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual Customer Customer { get; set; } = null!;
        public virtual Flight Flight { get; set; } = null!;
        public virtual Passenger Passenger { get; set; } = null!;
        public virtual Seat Seat { get; set; } = null!;
        public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
} 