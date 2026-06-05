# grillBookingApp MVP

This project contains a full-stack application built with C# ASP.NET Core Web API and a Vanilla JS frontend.

## Project Structure

- `/backend`: The C# ASP.NET Core Web API project.
- `/frontend`: The Vanilla HTML/CSS/JS frontend (served by Vite).
- `/package.json`: Root configuration to manage the project.

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
