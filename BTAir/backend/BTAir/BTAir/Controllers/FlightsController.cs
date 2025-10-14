using Microsoft.AspNetCore.Mvc;
using BTAir.Services;
using BTAir.DTOs;

namespace BTAir.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightsController : ControllerBase
    {
        private readonly IFlightService _flightService;

        public FlightsController(IFlightService flightService)
        {
            _flightService = flightService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFlights()
        {
            var flights = await _flightService.GetAllFlightsAsync();
            return Ok(flights);
        }

        [HttpGet("{flightId}")]
        public async Task<IActionResult> GetFlight(string flightId)
        {
            var flight = await _flightService.GetFlightByIdAsync(flightId);
            if (flight == null)
                return NotFound(new { message = "Flight not found" });

            return Ok(flight);
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchFlights([FromBody] FlightSearchDto searchDto)
        {
            var flights = await _flightService.SearchFlightsAsync(searchDto);
            return Ok(flights);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFlight([FromBody] CreateFlightDto createFlightDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var flight = await _flightService.CreateFlightAsync(createFlightDto);
            if (flight == null)
                return BadRequest(new { message = "Failed to create flight. Aircraft may not be available or does not exist." });

            return CreatedAtAction(nameof(GetFlight), new { flightId = flight.FlightID }, flight);
        }

        [HttpPut("{flightId}")]
        public async Task<IActionResult> UpdateFlight(string flightId, [FromBody] UpdateFlightDto updateFlightDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var flight = await _flightService.UpdateFlightAsync(flightId, updateFlightDto);
            if (flight == null)
                return NotFound(new { message = "Flight not found or update failed" });

            return Ok(flight);
        }

        [HttpDelete("{flightId}")]
        public async Task<IActionResult> DeleteFlight(string flightId)
        {
            var result = await _flightService.DeleteFlightAsync(flightId);
            if (!result)
                return NotFound(new { message = "Flight not found" });

            return NoContent();
        }

        [HttpGet("{flightId}/seats")]
        public async Task<IActionResult> GetFlightSeats(string flightId)
        {
            var seats = await _flightService.GetFlightSeatsAsync(flightId);
            return Ok(seats);
        }

        [HttpGet("aircraft/{aircraftId}/availability")]
        public async Task<IActionResult> CheckAircraftAvailability(
            int aircraftId, 
            [FromQuery] DateTime departureTime, 
            [FromQuery] DateTime arrivalTime,
            [FromQuery] string? excludeFlightId = null)
        {
            var isAvailable = await _flightService.IsAircraftAvailableAsync(aircraftId, departureTime, arrivalTime, excludeFlightId);
            return Ok(new { isAvailable });
        }
    }
} 