using BookingApp.API.DTOs;
using BookingApp.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.API.Controllers;

[ApiController]
[Route("users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = await _userService.CreateUserAsync(request);
        if (user == null) return Conflict(new { message = "Username or ApartmentCode already exists" });

        return CreatedAtAction(nameof(CreateUser), new { id = user.Id }, user);
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] AdminResetPasswordRequest request)
    {
        var success = await _userService.ResetPasswordAsync(request);
        if (!success) return NotFound(new { message = "User not found" });

        return Ok(new { message = "Password reset successfully" });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        // For simplicity, we'll add a method to get all users to populate the reset dropdown
        // This should probably be in UserService, but I'll add it here for speed if it's not there.
        // Wait, I should check if I need to add it to UserService.
        return Ok(await _userService.GetAllUsersAsync());
    }
}
