using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BTAir.Data;
using BTAir.Models;
using BTAir.DTOs;
using BTAir.Services;

namespace BTAir.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly BTAirDbContext _context;
        private readonly IAuthService _authService;

        public CustomersController(BTAirDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _context.Customers
                .Include(c => c.User)
                .Select(c => new CustomerDto
                {
                    CustomerID = c.CustomerID,
                    UserID = c.UserID,
                    Name = c.User.Name,
                    Email = c.User.Email,
                    Address = c.Address,
                    PhoneNumber = c.PhoneNumber,
                    CreatedAt = c.CreatedAt,
                    IsActive = c.User.IsActive
                })
                .ToListAsync();

            return Ok(customers);
        }

        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetCustomer(int customerId)
        {
            var customer = await _context.Customers
                .Include(c => c.User)
                .Where(c => c.CustomerID == customerId)
                .Select(c => new CustomerDto
                {
                    CustomerID = c.CustomerID,
                    UserID = c.UserID,
                    Name = c.User.Name,
                    Email = c.User.Email,
                    Address = c.Address,
                    PhoneNumber = c.PhoneNumber,
                    CreatedAt = c.CreatedAt,
                    IsActive = c.User.IsActive
                })
                .FirstOrDefaultAsync();

            if (customer == null)
                return NotFound(new { message = "Customer not found" });

            return Ok(customer);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerDto createCustomerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (await _context.Users.AnyAsync(u => u.Email == createCustomerDto.Email))
                return BadRequest(new { message = "User with this email already exists" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var user = new User
                {
                    Name = createCustomerDto.Name,
                    Email = createCustomerDto.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(createCustomerDto.Password),
                    Role = "Customer",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var customer = new Customer
                {
                    UserID = user.UserID,
                    Address = createCustomerDto.Address,
                    PhoneNumber = createCustomerDto.PhoneNumber,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var customerDto = new CustomerDto
                {
                    CustomerID = customer.CustomerID,
                    UserID = user.UserID,
                    Name = user.Name,
                    Email = user.Email,
                    Address = customer.Address,
                    PhoneNumber = customer.PhoneNumber,
                    CreatedAt = customer.CreatedAt,
                    IsActive = user.IsActive
                };

                return CreatedAtAction(nameof(GetCustomer), 
                    new { customerId = customer.CustomerID }, customerDto);
            }
            catch
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Failed to create customer" });
            }
        }

        [HttpPut("{customerId}")]
        public async Task<IActionResult> UpdateCustomer(int customerId, [FromBody] UpdateCustomerDto updateCustomerDto)
        {
            var customer = await _context.Customers
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.CustomerID == customerId);

            if (customer == null)
                return NotFound(new { message = "Customer not found" });

            if (!string.IsNullOrEmpty(updateCustomerDto.Address))
                customer.Address = updateCustomerDto.Address;

            if (!string.IsNullOrEmpty(updateCustomerDto.PhoneNumber))
                customer.PhoneNumber = updateCustomerDto.PhoneNumber;

            if (!string.IsNullOrEmpty(updateCustomerDto.Name))
                customer.User.Name = updateCustomerDto.Name;

            if (!string.IsNullOrEmpty(updateCustomerDto.Email))
            {
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Email == updateCustomerDto.Email && u.UserID != customer.UserID);
                
                if (emailExists)
                    return BadRequest(new { message = "Email already exists" });

                customer.User.Email = updateCustomerDto.Email;
            }

            if (updateCustomerDto.IsActive.HasValue)
                customer.User.IsActive = updateCustomerDto.IsActive.Value;

            await _context.SaveChangesAsync();

            var customerDto = new CustomerDto
            {
                CustomerID = customer.CustomerID,
                UserID = customer.UserID,
                Name = customer.User.Name,
                Email = customer.User.Email,
                Address = customer.Address,
                PhoneNumber = customer.PhoneNumber,
                CreatedAt = customer.CreatedAt,
                IsActive = customer.User.IsActive
            };

            return Ok(customerDto);
        }

        [HttpDelete("{customerId}")]
        public async Task<IActionResult> DeleteCustomer(int customerId)
        {
            var customer = await _context.Customers
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.CustomerID == customerId);

            if (customer == null)
                return NotFound(new { message = "Customer not found" });

            var hasActiveReservations = await _context.Reservations
                .AnyAsync(r => r.CustomerID == customerId && r.Status != "Cancelled");

            if (hasActiveReservations)
                return BadRequest(new { message = "Cannot delete customer with active reservations" });

            customer.User.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{customerId}/summary")]
        public async Task<IActionResult> GetCustomerSummary(int customerId)
        {
            var customer = await _context.Customers
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.CustomerID == customerId);

            if (customer == null)
                return NotFound(new { message = "Customer not found" });

            var summary = new
            {
                Customer = new CustomerDto
                {
                    CustomerID = customer.CustomerID,
                    UserID = customer.UserID,
                    Name = customer.User.Name,
                    Email = customer.User.Email,
                    Address = customer.Address,
                    PhoneNumber = customer.PhoneNumber,
                    CreatedAt = customer.CreatedAt,
                    IsActive = customer.User.IsActive
                },
                Statistics = new
                {
                    TotalReservations = await _context.Reservations.CountAsync(r => r.CustomerID == customerId),
                    ActiveReservations = await _context.Reservations.CountAsync(r => r.CustomerID == customerId && r.Status == "Confirmed"),
                    TotalPassengers = await _context.Passengers.CountAsync(p => p.CustomerID == customerId),
                    TotalSpent = await _context.Payments
                        .Where(p => p.Reservation.CustomerID == customerId && p.Status == "Completed")
                        .SumAsync(p => p.Amount)
                }
            };

            return Ok(summary);
        }
    }
}

public class CustomerDto
{
    public int CustomerID { get; set; }
    public int UserID { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCustomerDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}

public class UpdateCustomerDto
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public bool? IsActive { get; set; }
} 