// src/services/apiService.js
const API_BASE_KEY = 'booking_app_api_url';
let API_BASE = localStorage.getItem(API_BASE_KEY) || 'http://localhost:5000';

export async function fetchUserData() {
    const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
    
    if (res.status === 401) {
        return null; // Explicitly return null if not logged in
    }
    
    if (!res.ok) {
        throw new Error('Network error'); // Throw for actual connection failures
    }

    return await res.json();
}