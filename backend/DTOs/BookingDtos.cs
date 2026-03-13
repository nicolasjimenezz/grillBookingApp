using BookingApp.API.Data.Enums;

namespace BookingApp.API.DTOs;

public class LoginRequest
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class CreateUserRequest
{
    public string FullName { get; set; } = null!;
    public string ApartmentCode { get; set; } = null!;
    public string Username { get; set; } = null!;
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
