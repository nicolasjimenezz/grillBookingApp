const API_BASE_KEY = 'booking_app_api_url';
const API_BASE = localStorage.getItem(API_BASE_KEY) || '';

export async function fetchMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error('Failed to fetch user data');
    return res.json();
}

export async function login(username, password) {
    return await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
}

export async function logout() {
    return await fetch(`${API_BASE}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
    });
}
