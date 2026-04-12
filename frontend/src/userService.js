const API_BASE_KEY = 'booking_app_api_url';
const API_BASE = localStorage.getItem(API_BASE_KEY) || 'http://localhost:5000';

export async function fetchUsers() {
    const res = await fetch(`${API_BASE}/users`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
}

export async function createUser(userData) {
    return await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
    });
}

export async function resetPassword(userId, newPassword) {
    return await fetch(`${API_BASE}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
        credentials: 'include'
    });
}

export async function toggleStatus(userId) {
    return await fetch(`${API_BASE}/users/${userId}/toggle-status`, {
        method: 'POST',
        credentials: 'include'
    });
}
