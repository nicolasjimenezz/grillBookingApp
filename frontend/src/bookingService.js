const API_BASE_KEY = 'booking_app_api_url';
const API_BASE = localStorage.getItem(API_BASE_KEY) || 'http://localhost:5000';

export async function fetchBookings(monthStr) {
    const res = await fetch(`${API_BASE}/bookings?month=${monthStr}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load bookings');
    return res.json();
}

export async function createBooking(date, timeSlot) {
    return await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, timeSlot }),
        credentials: 'include'
    });
}

export async function cancelBooking(id) {
    return await fetch(`${API_BASE}/bookings/${id}/cancel`, {
        method: 'POST',
        credentials: 'include'
    });
}
