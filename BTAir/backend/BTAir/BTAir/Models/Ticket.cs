using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTAir.Models
{
    public class Ticket
    {
        [Key]
        [StringLength(20)]
        public string TicketID { get; set; } = string.Empty;
        
        [Required]
        public DateTime IssueDate { get; set; } = DateTime.UtcNow;
        
        [StringLength(50)]
        public string TicketStatus { get; set; } = "Valid";
        
        [StringLength(20)]
        public string TicketType { get; set; } = "Electronic";
        
        [ForeignKey("Reservation")]
        public int ReservationID { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual Reservation Reservation { get; set; } = null!;
    }
} 