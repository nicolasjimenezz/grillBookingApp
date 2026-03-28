using System.ComponentModel.DataAnnotations;
using BookingApp.API.Data.Enums;

namespace BookingApp.API.DTOs;

public class LoginRequest
{
    [Required]
    public string Username { get; set; } = null!;
    [Required]
    public string Password { get; set; } = null!;
}

public class CreateUserRequest
{
    [Required]
    public string FullName { get; set; } = null!;
    [Required]
    [RegularExpression(@"\d+[A-Z]", ErrorMessage = "Apartment code must be digits followed by an uppercase letter (e.g. 2A)")]
    public string ApartmentCode { get; set; } = null!;
    [Required]
    public string Username { get; set; } = null!;
    [Required]
    [MinLength(4, ErrorMessage = "Password must be at least 4 characters long")]
    [RegularExpression(@".*\d.*", ErrorMessage = "Password must contain at least one number")]
    public string Password { get; set; } = null!;
    public Role Role { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string ApartmentCode { get; set; } = null!;
    public string Username { get; set; } = null!;
    public Role Role { get; set; }
}

public class BookingResponse
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public TimeSlot TimeSlot { get; set; }
    public string FullName { get; set; } = null!;
    public string ApartmentCode { get; set; } = null!;
    public bool IsCancelled { get; set; }
    public int UserId { get; set; }
}

public class CreateBookingRequest
{
    public DateOnly Date { get; set; }
    public TimeSlot TimeSlot { get; set; }
}

public class CreateAdminBookingRequest
{
    public int UserId { get; set; }
    public DateOnly Date { get; set; }
    public TimeSlot TimeSlot { get; set; }
}

public class AdminResetPasswordRequest
{
    public int UserId { get; set; }
    [Required]
    [MinLength(4, ErrorMessage = "Password must be at least 4 characters long")]
    [RegularExpression(@".*\d.*", ErrorMessage = "Password must contain at least one number")]
    public string NewPassword { get; set; } = null!;
}
