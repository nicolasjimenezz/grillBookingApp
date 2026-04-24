const API_BASE_KEY = 'booking_app_api_url';
const getApiBase = () => {
    const base = localStorage.getItem(API_BASE_KEY) || '';
    if (base && (base.includes('localhost') || base.includes('127.0.0.1'))) {
        return '';
    }
    return base;
};

export async function fetchBookings(monthStr) {
    const res = await fetch(`${getApiBase()}/api/bookings?month=${monthStr}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load bookings');
    return res.json();
}

export async function createBooking(date, timeSlot) {
    return await fetch(`${getApiBase()}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, timeSlot }),
        credentials: 'include'
    });
}

export async function cancelBooking(id) {
    return await fetch(`${getApiBase()}/api/bookings/${id}/cancel`, {
        method: 'POST',
        credentials: 'include'
    });
}
