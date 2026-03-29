using BookingApp.API.Data;
using BookingApp.API.Data.Entities;
using BookingApp.API.Data.Enums;
using BookingApp.API.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.API.Services;

public class UserService
{
    private readonly BookingDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher;

    public UserService(BookingDbContext context)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<User>();
    }

    public async Task<UserResponse?> CreateUserAsync(CreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username || u.ApartmentCode == request.ApartmentCode))
        {
            return null; // Username or ApartmentCode already exists
        }

        var user = new User
        {
            FullName = request.FullName,
            ApartmentCode = request.ApartmentCode,
            Username = request.Username,
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            ApartmentCode = user.ApartmentCode,
            Username = user.Username,
            Role = user.Role,
            IsActive = user.IsActive
        };
    }

    public async Task<UserResponse?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            ApartmentCode = user.ApartmentCode,
            Username = user.Username,
            Role = user.Role,
            IsActive = user.IsActive
        };
    }

    public async Task<IEnumerable<UserResponse>> GetAllUsersAsync()
    {
        return await _context.Users
            .Select(u => new UserResponse
            {
                Id = u.Id,
                FullName = u.FullName,
                ApartmentCode = u.ApartmentCode,
                Username = u.Username,
                Role = u.Role,
                IsActive = u.IsActive
            })
            .ToListAsync();
    }

    public async Task<bool> ResetPasswordAsync(AdminResetPasswordRequest request)
    {
        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null) return false;

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleUserStatusAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();
        return true;
    }
}
