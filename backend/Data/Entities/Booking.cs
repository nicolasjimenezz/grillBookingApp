using BookingApp.API.Data.Enums;

namespace BookingApp.API.Data.Entities;

public class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateOnly Date { get; set; }
    public TimeSlot TimeSlot { get; set; }
    public bool IsCancelled { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool CountsTowardQuota { get; set; }
    public int? CreatedByAdminId { get; set; }
    public User? CreatedByAdmin { get; set; }
}
