using BookingApp.API.Data;
using BookingApp.API.Data.Entities;
using BookingApp.API.Data.Enums;
using BookingApp.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.API.Services;

public class BookingService
{
    private readonly BookingDbContext _context;

    public BookingService(BookingDbContext context)
    {
        _context = context;
    }

    private DateTime GetArgentinaTime()
    {
        var info = TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, info);
    }

    public async Task<List<BookingResponse>> GetBookingsAsync(int year, int month)
    {
        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Where(b => b.Date.Year == year && b.Date.Month == month && !b.IsCancelled)
            .ToListAsync();

        return bookings.Select(b => new BookingResponse
        {
            Id = b.Id,
            Date = b.Date,
            TimeSlot = b.TimeSlot,
            FullName = b.User.FullName,
            ApartmentCode = b.User.ApartmentCode,
            IsCancelled = b.IsCancelled,
            UserId = b.UserId
        }).ToList();
    }

    public async Task<(bool Success, string ErrorMessage, BookingResponse? Booking)> CreateBookingAsync(int userId, DateOnly date, TimeSlot timeSlot, int? adminId = null)
    {
        var today = DateOnly.FromDateTime(GetArgentinaTime());

        if (date < today)
            return (false, "Cannot book past dates.", null);

        var currentMonth = new DateOnly(today.Year, today.Month, 1);
        var maxAllowedMonth = currentMonth.AddMonths(1);
        
        if (date.Year > maxAllowedMonth.Year || (date.Year == maxAllowedMonth.Year && date.Month > maxAllowedMonth.Month))
            return (false, "Cannot book beyond next month.", null);

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var userBookingsThisMonth = await _context.Bookings
                .Where(b => b.UserId == userId && b.Date.Year == date.Year && b.Date.Month == date.Month)
                .Where(b => !b.IsCancelled || b.CountsTowardQuota)
                .CountAsync();

            if (userBookingsThisMonth >= 2)
                return (false, "Monthly limit reached.", null);

            var booking = new Booking
            {
                UserId = userId,
                Date = date,
                TimeSlot = timeSlot,
                IsCancelled = false,
                CreatedAt = DateTime.UtcNow,
                CountsTowardQuota = true,
                CreatedByAdminId = adminId
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var user = await _context.Users.FindAsync(userId);

            return (true, string.Empty, new BookingResponse
            {
                Id = booking.Id,
                Date = booking.Date,
                TimeSlot = booking.TimeSlot,
                FullName = user!.FullName,
                ApartmentCode = user.ApartmentCode,
                IsCancelled = booking.IsCancelled,
                UserId = booking.UserId
            });
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync();
            return (false, "SLOT_TAKEN", null);
        }
    }

    public async Task<(bool Success, string ErrorMessage)> CancelBookingAsync(int bookingId, int requestUserId, bool isAdmin)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null || booking.IsCancelled)
            return (false, "Booking not found or already cancelled.");

        if (!isAdmin && booking.UserId != requestUserId)
            return (false, "Unauthorized.");

        var today = DateOnly.FromDateTime(GetArgentinaTime());
        if (booking.Date < today)
            return (false, "Cannot cancel past bookings.");

        var daysDifference = booking.Date.DayNumber - today.DayNumber;

        booking.IsCancelled = true;
        booking.CancelledAt = DateTime.UtcNow;

        if (daysDifference >= 2)
        {
            booking.CountsTowardQuota = false;
        }
        else
        {
            booking.CountsTowardQuota = true;
        }

        await _context.SaveChangesAsync();
        return (true, string.Empty);
    }
}
