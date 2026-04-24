using BookingApp.API.Data;
using BookingApp.API.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<BookingDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "BookingApp.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.IsEssential = true;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<BookingService>();

// Determine the port: Default to 3000 for AI Studio, but allow environment override for Azure
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

Console.WriteLine($"INFRA: Startup starting on port {port}...");

// Check connection string on startup
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("CRITICAL: DefaultConnection connection string is missing!");
}
else
{
    Console.WriteLine($"INFRA: Using connection string (starts with): {connectionString.Substring(0, Math.Min(connectionString.Length, 15))}...");
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var allowedOrigins = builder.Configuration["ALLOWED_ORIGINS"]?.Split(',', StringSplitOptions.RemoveEmptyEntries);
        
        if (allowedOrigins != null && allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            policy.SetIsOriginAllowed(origin => true) // Allow any origin for development/testing if none specified
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Ensure database is created and seeded
try
{
    Console.WriteLine("INFRA: Attempting to initialize database...");
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
        
        // If RESET_DB is set to "true", delete the database before creating it
        if (builder.Configuration["RESET_DB"] == "true")
        {
            Console.WriteLine("INFRA: RESET_DB is true. Deleting existing database...");
            context.Database.EnsureDeleted();
        }
        
        var created = context.Database.EnsureCreated();
        if (created)
        {
            Console.WriteLine("INFRA: Database was created successfully.");
        }
        else
        {
            Console.WriteLine("INFRA: Database already exists.");
        }

        // Test connection
        if (context.Database.CanConnect())
        {
            Console.WriteLine("INFRA: Successfully connected to database!");
        }
        else
        {
            Console.WriteLine("INFRA: WARNING: Database connection failed during startup test.");
        }
    }
}
catch (Exception ex)
{
    // Log the error loudly to console for Log Stream
    Console.WriteLine($"INFRA: CRITICAL ERROR during database initialization: {ex.Message}");
    if (ex.InnerException != null) Console.WriteLine($"INFRA: Inner Exception: {ex.InnerException.Message}");
    
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during database initialization.");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

// CORS must be after UseRouting and before UseAuthorization
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// Bypass "Private Network Access" browser security for localhost
app.Use((context, next) =>
{
    if (context.Request.Headers.ContainsKey("Access-Control-Request-Private-Network"))
    {
        context.Response.Headers.Append("Access-Control-Allow-Private-Network", "true");
    }
    return next();
});

app.MapGet("/health", () => "OK");
app.MapControllers();

// Only fallback if the request is not for the API
app.MapFallbackToFile("index.html");

app.Run();
