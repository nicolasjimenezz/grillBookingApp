using BookingApp.API.Data.Enums;

namespace BookingApp.API.Data.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string ApartmentCode { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public Role Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
