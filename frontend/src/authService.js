const API_BASE_KEY = 'booking_app_api_url';
const getApiBase = () => {
    const base = localStorage.getItem(API_BASE_KEY) || '';
    // Security: Filter out suspicious bases
    if (base && (base.includes('localhost') || base.includes('127.0.0.1'))) {
        return '';
    }
    return base;
};

export async function fetchMe() {
    const res = await fetch(`${getApiBase()}/api/auth/me`, { credentials: 'include' });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error('Failed to fetch user data');
    return res.json();
}

export async function login(username, password) {
    return await fetch(`${getApiBase()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
}

export async function logout() {
    return await fetch(`${getApiBase()}/api/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
    });
}
