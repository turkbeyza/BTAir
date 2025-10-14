using System.ComponentModel.DataAnnotations;

namespace BTAir.DTOs
{
    public class ReservationDto
    {
        public int ReservationID { get; set; }
        public DateTime BookingDateTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string FlightID { get; set; } = string.Empty;
        public int FlightNumber { get; set; }
        public string DepartureLocation { get; set; } = string.Empty;
        public string ArrivalLocation { get; set; } = string.Empty;
        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }
        public string SeatNumber { get; set; } = string.Empty;
        public string SeatClass { get; set; } = string.Empty;
        public string PassengerName { get; set; } = string.Empty;
        public string PassportNumber { get; set; } = string.Empty;
    }

    public class CreateReservationDto
    {
        [Required]
        public string FlightID { get; set; } = string.Empty;
        
        [Required]
        public int PassengerID { get; set; }
        
        [Required]
        public int SeatID { get; set; }
    }

    public class UpdateReservationDto
    {
        public string? Status { get; set; }
        public int? SeatID { get; set; }
    }

    public class PassengerDto
    {
        public int PassengerID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PassportNumber { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Nationality { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
    }

    public class CreatePassengerDto
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string PassportNumber { get; set; } = string.Empty;
        
        [Required]
        [Range(0, 120)]
        public int Age { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Nationality { get; set; } = string.Empty;
        
        [StringLength(10)]
        public string Gender { get; set; } = string.Empty;
        
        public DateTime DateOfBirth { get; set; }
    }

    public class PaymentDto
    {
        public string PaymentID { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionReference { get; set; } = string.Empty;
    }

    public class CreatePaymentDto
    {
        [Required]
        public int ReservationID { get; set; }
        
        [Required]
        public string PaymentMethod { get; set; } = string.Empty;
        
        public string? CardNumber { get; set; }
        public string? CardHolderName { get; set; }
        public string? ExpiryDate { get; set; }
        public string? CVV { get; set; }
    }
} 