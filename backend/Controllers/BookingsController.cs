using System.Security.Claims;
using BookingApp.API.DTOs;
using BookingApp.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.API.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly BookingService _bookingService;

    public BookingsController(BookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBookings([FromQuery] string month)
    {
        if (!DateTime.TryParseExact(month, "yyyy-MM", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
        {
            return BadRequest(new { message = "Invalid month format. Use YYYY-MM." });
        }

        var bookings = await _bookingService.GetBookingsAsync(parsedDate.Year, parsedDate.Month);
        return Ok(bookings);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _bookingService.CreateBookingAsync(userId, request.Date, request.TimeSlot);

        if (!result.Success)
        {
            if (result.ErrorMessage == "SLOT_TAKEN")
                return Conflict(new { code = "SLOT_TAKEN", message = "Slot already booked." });
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Booking);
    }

    [HttpPost("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAdminBooking([FromBody] CreateAdminBookingRequest request)
    {
        var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _bookingService.CreateBookingAsync(request.UserId, request.Date, request.TimeSlot, adminId);

        if (!result.Success)
        {
            if (result.ErrorMessage == "SLOT_TAKEN")
                return Conflict(new { code = "SLOT_TAKEN", message = "Slot already booked." });
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Booking);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = User.IsInRole("Admin");

        var result = await _bookingService.CancelBookingAsync(id, userId, isAdmin);

        if (!result.Success)
        {
            if (result.ErrorMessage == "Unauthorized.") return Forbid();
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(new { message = "Booking cancelled successfully." });
    }
}
