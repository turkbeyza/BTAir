using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BTAir.Models
{
    public class AirlineStaff
    {
        [Key]
        public int StaffID { get; set; }
        
        [Required]
        public int EmployeeNumber { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Department { get; set; } = string.Empty;
        
        [ForeignKey("User")]
        public int UserID { get; set; }
        
        public DateTime HireDate { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        public virtual User User { get; set; } = null!;
    }
} 