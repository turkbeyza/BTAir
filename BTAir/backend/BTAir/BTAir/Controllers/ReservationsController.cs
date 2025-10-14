using Microsoft.AspNetCore.Mvc;
using BTAir.Services;
using BTAir.DTOs;

namespace BTAir.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationsController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetCustomerReservations(int customerId)
        {
            var reservations = await _reservationService.GetUserReservationsAsync(customerId);
            return Ok(reservations);
        }

        [HttpGet("{reservationId}")]
        public async Task<IActionResult> GetReservation(int reservationId)
        {
            var reservation = await _reservationService.GetReservationByIdAsync(reservationId);
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            return Ok(reservation);
        }

        [HttpPost("customer/{customerId}")]
        public async Task<IActionResult> CreateReservation(int customerId, [FromBody] CreateReservationDto createReservationDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var reservation = await _reservationService.CreateReservationAsync(customerId, createReservationDto);
            if (reservation == null)
                return BadRequest(new { message = "Failed to create reservation. Flight may be full, seat unavailable, or passenger not found." });

            return CreatedAtAction(nameof(GetReservation), new { reservationId = reservation.ReservationID }, reservation);
        }

        [HttpPut("{reservationId}")]
        public async Task<IActionResult> UpdateReservation(int reservationId, [FromBody] UpdateReservationDto updateReservationDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var reservation = await _reservationService.UpdateReservationAsync(reservationId, updateReservationDto);
            if (reservation == null)
                return NotFound(new { message = "Reservation not found or update failed" });

            return Ok(reservation);
        }

        [HttpDelete("{reservationId}")]
        public async Task<IActionResult> CancelReservation(int reservationId)
        {
            var result = await _reservationService.CancelReservationAsync(reservationId);
            if (!result)
                return NotFound(new { message = "Reservation not found" });

            return NoContent();
        }

        [HttpPost("payments")]
        public async Task<IActionResult> ProcessPayment([FromBody] CreatePaymentDto createPaymentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var payment = await _reservationService.ProcessPaymentAsync(createPaymentDto);
            if (payment == null)
                return BadRequest(new { message = "Payment processing failed. Reservation may not exist or is not in pending status." });

            return Ok(payment);
        }

        [HttpGet("customers/{customerId}/passengers")]
        public async Task<IActionResult> GetCustomerPassengers(int customerId)
        {
            var passengers = await _reservationService.GetCustomerPassengersAsync(customerId);
            return Ok(passengers);
        }

        [HttpPost("customers/{customerId}/passengers")]
        public async Task<IActionResult> CreatePassenger(int customerId, [FromBody] CreatePassengerDto createPassengerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var passenger = await _reservationService.CreatePassengerAsync(customerId, createPassengerDto);
            if (passenger == null)
                return BadRequest(new { message = "Failed to create passenger. Passenger with this passport number may already exist." });

            return Ok(passenger);
        }
    }
} 