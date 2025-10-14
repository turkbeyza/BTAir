using Microsoft.EntityFrameworkCore;
using BTAir.Data;
using BTAir.Models;
using BTAir.DTOs;
using System.Security.Cryptography;
using System.Text;

namespace BTAir.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
        Task<UserDto?> GetUserByIdAsync(int userId);
        Task<bool> ValidateTokenAsync(string token);
        string GenerateToken(User user);
    }

    public class AuthService : IAuthService
    {
        private readonly BTAirDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(BTAirDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email && u.IsActive);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
                return null;

            var token = GenerateToken(user);
            
            return new AuthResponseDto
            {
                UserID = user.UserID,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Token = token,
                TokenExpiry = DateTime.UtcNow.AddHours(24)
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return null;

            var user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = "Customer",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var customer = new Customer
            {
                UserID = user.UserID,
                Address = registerDto.Address,
                PhoneNumber = registerDto.PhoneNumber,
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            var token = GenerateToken(user);

            return new AuthResponseDto
            {
                UserID = user.UserID,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Token = token,
                TokenExpiry = DateTime.UtcNow.AddHours(24)
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserID == userId && u.IsActive);

            if (user == null)
                return null;

            return new UserDto
            {
                UserID = user.UserID,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive
            };
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            return !string.IsNullOrEmpty(token) && token.Length > 20;
        }

        public string GenerateToken(User user)
        {
            var tokenData = $"{user.UserID}:{user.Email}:{DateTime.UtcNow.Ticks}";
            var bytes = Encoding.UTF8.GetBytes(tokenData);
            
            using (var sha256 = SHA256.Create())
            {
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash) + ":" + Convert.ToBase64String(bytes);
            }
        }
    }
} 