using BookingApp.API.Data.Entities;
using BookingApp.API.Data.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.API.Data;

public class BookingDbContext : DbContext
{
    public BookingDbContext(DbContextOptions<BookingDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.ApartmentCode)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<Booking>()
            .HasIndex(b => new { b.Date, b.TimeSlot })
            .IsUnique()
            .HasFilter("[IsCancelled] = 0");

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.CreatedByAdmin)
            .WithMany()
            .HasForeignKey(b => b.CreatedByAdminId)
            .OnDelete(DeleteBehavior.Restrict);

        var hasher = new PasswordHasher<User>();
        
        var admin1 = new User 
        { 
            Id = 1, 
            FullName = "Admin One", 
            ApartmentCode = "0A", 
            Username = "admin1", 
            Role = Role.Admin, 
            IsActive = true, 
            CreatedAt = DateTime.UtcNow 
        };
        admin1.PasswordHash = hasher.HashPassword(admin1, "Admin123!");
        
        var admin2 = new User 
        { 
            Id = 2, 
            FullName = "Admin Two", 
            ApartmentCode = "0B", 
            Username = "admin2", 
            Role = Role.Admin, 
            IsActive = true, 
            CreatedAt = DateTime.UtcNow 
        };
        admin2.PasswordHash = hasher.HashPassword(admin2, "Admin123!");

        modelBuilder.Entity<User>().HasData(admin1, admin2);
    }
}
