using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTAir.Models
{
    public class Passenger
    {
        [Key]
        public int PassengerID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string PassportNumber { get; set; } = string.Empty;
        
        [Required]
        public int Age { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Nationality { get; set; } = string.Empty;
        
        [StringLength(10)]
        public string Gender { get; set; } = string.Empty;
        
        public DateTime DateOfBirth { get; set; }
        
        [ForeignKey("Customer")]
        public int CustomerID { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual Customer Customer { get; set; } = null!;
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
} 