using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTAir.Models
{
    public class Admin
    {
        [Key]
        public int AdminID { get; set; }
        
        [ForeignKey("User")]
        public int UserID { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [StringLength(100)]
        public string AccessLevel { get; set; } = "SuperAdmin";
        
        public virtual User User { get; set; } = null!;
    }
} 