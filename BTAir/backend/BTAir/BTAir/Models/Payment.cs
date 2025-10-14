using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTAir.Models
{
    public class Payment
    {
        [Key]
        [StringLength(50)]
        public string PaymentID { get; set; } = string.Empty;
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        
        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Pending";
        
        [StringLength(50)]
        public string PaymentMethod { get; set; } = "Credit Card";
        
        [StringLength(100)]
        public string TransactionReference { get; set; } = string.Empty;
        
        [ForeignKey("Reservation")]
        public int ReservationID { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual Reservation Reservation { get; set; } = null!;
    }
} 