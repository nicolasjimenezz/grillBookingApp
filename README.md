# grillBookingApp MVP

This project contains a full-stack application built with C# ASP.NET Core Web API and a Vanilla JS frontend.

## Project Structure

- `/backend`: The C# ASP.NET Core Web API project.
- `/frontend`: The Vanilla HTML/CSS/JS frontend (served by Vite).
- `/package.json`: Root configuration to manage the project.

## Local Development Requirements

To run this application locally (not recommended for non-technical people), you will need to install the following system software and packages:

# 1. System Requirements
*   **For the Backend:**
    *   **.NET 8.0 SDK**
    *   **Microsoft SQL Server** 
*   **For the Frontend:**
    *   **Node.js**
    *   **npm**
    *   **Vite**

# 2. Required Packages & Global Tools

# Backend (.NET Nuget Packages)
These will automatically install when you build the backend, but require .NET 8.0:
*   `Microsoft.EntityFrameworkCore` (v8.0.x)
*   `Microsoft.EntityFrameworkCore.SqlServer` (v8.0.x)
*   `Microsoft.EntityFrameworkCore.Design` (v8.0.x)
*   `Microsoft.AspNetCore.Authentication.JwtBearer` (v8.0.x)

To run database migrations, make sure to install the Entity Framework CLI tool globally:
```bash
dotnet tool install --global dotnet-ef

## How to Run the Backend
Must be running before launching front end and when the front end is up
Pres CTRL + C to stop

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the API:
   ```bash
   dotnet run
   ```
   The API will start on `https://localhost:3000`

## How to Run the Frontend
Backend must be running before launching front end and when the front end is up
Pres CTRL + C to stop

The frontend is served by Vite.
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Copy the "Local" URL and paste it in a browser

## Features Implemented

- **Backend**: C# ASP.NET Core Web API, EF Core, SQL Server.
- **Architecture**: Layered (Controllers -> Services -> Data).
- **Authentication**: Cookie-based authentication with ASP.NET Core `PasswordHasher<T>`.
- **Database Rules**: Filtered unique index on `(Date, TimeSlot)` where `IsCancelled = 0`.
- **Business Logic**: Monthly limits, future/past restrictions, cancellation policies (early vs late).
- **Frontend**: Vanilla HTML, CSS, JS using `fetch()` API. No frameworks.
