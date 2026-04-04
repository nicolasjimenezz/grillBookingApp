const API_BASE_KEY = 'booking_app_api_url';
const API_BASE = localStorage.getItem(API_BASE_KEY) || 'http://localhost:5000';

export async function fetchMe() {
    const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
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

export async function testReachability() {
    const start = Date.now();
    await fetch(`${API_BASE}/`, { mode: 'no-cors' });
    return Date.now() - start;
}

export async function testCors() {
    return await fetch(`${API_BASE}/`, { credentials: 'include' });
}
