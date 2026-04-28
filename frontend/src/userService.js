const API_BASE_KEY = 'booking_app_api_url';
const getApiBase = () => {
    let base = localStorage.getItem(API_BASE_KEY);
    if (!base || base === 'undefined') return '';
    return base.endsWith('/') ? base.slice(0, -1) : base;
};

export async function fetchUsers() {
    const res = await fetch(`${getApiBase()}/api/users`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
}

export async function createUser(userData) {
    return await fetch(`${getApiBase()}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
    });
}

export async function resetPassword(userId, newPassword) {
    return await fetch(`${getApiBase()}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
        credentials: 'include'
    });
}

export async function toggleStatus(userId) {
    return await fetch(`${getApiBase()}/api/users/${userId}/toggle-status`, {
        method: 'POST',
        credentials: 'include'
    });
}
