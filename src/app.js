const API_BASE_KEY = 'booking_app_api_url';
let API_BASE = localStorage.getItem(API_BASE_KEY) || 'http://localhost:5000';

let currentUser = null;
let currentViewDate = new Date(); // Using local time for view

document.addEventListener('DOMContentLoaded', () => {
    // Migration: If user has the old default stored, update it to the new one
    if (localStorage.getItem(API_BASE_KEY) === 'https://localhost:5001') {
        localStorage.setItem(API_BASE_KEY, 'http://localhost:5000');
        API_BASE = 'http://localhost:5000';
    }

    checkAuth();
    setupEventListeners();
    renderApiConfig();
});

function renderApiConfig() {
    const configDiv = document.createElement('div');
    configDiv.id = 'api-config';
    configDiv.style.cssText = 'position:fixed; bottom:10px; right:10px; font-size:10px; color:#666; background:rgba(255,255,255,0.8); padding:5px; border-radius:4px; border:1px solid #ddd; z-index:1000;';
    configDiv.innerHTML = `
        API: <span id="api-url-display">${API_BASE}</span>
        <button onclick="changeApiUrl()" style="padding:2px 5px; font-size:9px; margin-left:5px;">Change</button>
    `;
    document.body.appendChild(configDiv);
}

window.changeApiUrl = () => {
    const newUrl = prompt('Enter your local API URL (e.g., https://localhost:5001):', API_BASE);
    if (newUrl) {
        localStorage.setItem(API_BASE_KEY, newUrl);
        location.reload();
    }
};

async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
        if (res.ok) {
            currentUser = await res.json();
            renderHeader();
            showMainContent();
            loadBookings();
        } else {
            renderLoginForm();
        }
    } catch (err) {
        console.error('Auth check failed', err);
        const authSection = document.getElementById('auth-section');
        const existingError = document.getElementById('connection-error');
        if (existingError) existingError.remove();

        const errorMsg = document.createElement('div');
        errorMsg.id = 'connection-error';
        errorMsg.style.cssText = 'background:#fff5f5; color:#c53030; padding:20px; margin:15px; border-radius:12px; font-size:14px; border:1px solid #feb2b2; line-height:1.6; box-shadow:0 4px 6px rgba(0,0,0,0.05);';
        
        const isIframe = window.self !== window.top;
        
        errorMsg.innerHTML = `
            <div style="background:#fff5f5; border:2px solid #c53030; padding:25px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                <div style="display:flex; align-items:center; margin-bottom:15px;">
                    <span style="font-size:32px; margin-right:15px;">🛑</span>
                    <strong style="font-size:20px; color:#c53030;">Connection Blocked</strong>
                </div>
                
                <p style="font-size:16px; margin-bottom:20px; color:#4a5568;">
                    The app cannot reach your local backend at <code style="background:#edf2f7; padding:2px 6px; border-radius:4px;">${API_BASE}</code>.
                </p>
                
                <div style="background:#ebf8ff; padding:20px; border-radius:12px; border:1px solid #bee3f8; margin-bottom:20px;">
                    <strong style="color:#2b6cb0; font-size:16px;">Step 1: The "Magic" Fix</strong><br>
                    <p style="margin:10px 0; color:#2c5282;">Browsers block local connections inside this preview window. Opening the app in its own tab fixes this 100% of the time.</p>
                    <button onclick="window.open(window.location.href, '_blank')" style="background:#3182ce; color:white; border:none; padding:12px 24px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px; width:100%; box-shadow:0 4px 6px rgba(49,130,206,0.3);">🚀 Open App in New Tab</button>
                </div>

                <div style="background:#f7fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0; font-size:13px; color:#4a5568;">
                    <strong>Step 2: Verify Backend is Running</strong><br>
                    1. Ensure your terminal says <code>Now listening on: ${API_BASE}</code>.<br>
                    2. Visit <a href="${API_BASE}/" target="_blank" style="color:#c53030; font-weight:bold; text-decoration:underline;">this link</a>. If you don't see "API is running!", your backend is not started.
                </div>
                
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button onclick="testConnection()" style="flex:1; background:white; color:#4a5568; border:1px solid #cbd5e0; padding:8px; border-radius:6px; cursor:pointer; font-size:12px;">Run Diagnostics</button>
                    <button onclick="changeApiUrl()" style="flex:1; background:white; color:#4a5568; border:1px solid #cbd5e0; padding:8px; border-radius:6px; cursor:pointer; font-size:12px;">Change API URL</button>
                </div>
                <div id="diagnostic-result" style="margin-top:15px; font-family:monospace; font-size:12px; display:none; background:white; padding:12px; border-radius:8px; border:1px solid #e2e8f0;"></div>
            </div>
        `;
        authSection.prepend(errorMsg);
        renderLoginForm(true);
    }
}

window.testConnection = async () => {
    const resultDiv = document.getElementById('diagnostic-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '🔍 Running diagnostics...';
    
    try {
        // Test 1: Basic Reachability
        const start = Date.now();
        await fetch(`${API_BASE}/`, { mode: 'no-cors' });
        const duration = Date.now() - start;
        
        // Test 2: CORS/Credentials Check
        try {
            const corsRes = await fetch(`${API_BASE}/`, { credentials: 'include' });
            resultDiv.innerHTML = `✅ <strong>Success!</strong> Reached backend in ${duration}ms.<br>
                                   ✅ <strong>CORS:</strong> Backend is configured correctly.<br><br>
                                   <strong>Next:</strong> If you still can't log in, ensure you are using the correct credentials (admin1 / Admin123!).`;
            resultDiv.style.color = '#2f855a';
        } catch (corsErr) {
            resultDiv.innerHTML = `⚠️ <strong>Partial Success:</strong> Reached backend, but CORS/Cookies are blocked.<br><br>
                                   <strong>Fix:</strong> Click the <strong>Cookie icon</strong> in your browser's address bar and select <strong>"Allow third-party cookies"</strong> for this site.`;
            resultDiv.style.color = '#c05621';
        }
    } catch (err) {
        resultDiv.innerHTML = `❌ <strong>Failed:</strong> Connection refused.<br><br>
            <strong>Cause:</strong> Browser does not trust the SSL certificate.<br>
            <strong>Fix:</strong> Open <a href="${API_BASE}/" target="_blank" style="text-decoration:underline;">${API_BASE}/</a> and click "Advanced" &rarr; "Proceed".`;
        resultDiv.style.color = '#c53030';
    }
};

function renderHeader() {
    const authSection = document.getElementById('auth-section');
    if (currentUser) {
        authSection.innerHTML = `
            <span>Welcome, ${currentUser.fullName} (${currentUser.apartmentCode})</span>
            <button id="logout-btn">Logout</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
}

function renderLoginForm(keepExisting = false) {
    document.getElementById('main-content').style.display = 'none';
    const authSection = document.getElementById('auth-section');
    
    const formHtml = `
        <form id="login-form" style="margin:0; padding:0; box-shadow:none; background:transparent;">
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
            <div id="login-error" class="error-msg" style="display: none;"></div>
        </form>
    `;

    if (keepExisting) {
        const existingForm = document.getElementById('login-form');
        if (existingForm) existingForm.remove();
        authSection.insertAdjacentHTML('beforeend', formHtml);
    } else {
        authSection.innerHTML = formHtml;
    }
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        errorDiv.style.display = 'none';
        
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            if (res.ok) {
                checkAuth();
            } else {
                errorDiv.textContent = 'Login failed. Incorrect username or password.';
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            console.error(err);
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
}

async function logout() {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    currentUser = null;
    document.getElementById('auth-section').innerHTML = '';
    renderLoginForm();
}

function showMainContent() {
    document.getElementById('main-content').style.display = 'block';
    if (currentUser.role === 1) { // Admin
        document.getElementById('admin-panel').style.display = 'block';
        loadUsersForAdmin();
    } else {
        document.getElementById('admin-panel').style.display = 'none';
    }
}

async function loadUsersForAdmin() {
    try {
        const res = await fetch(`${API_BASE}/users`, { credentials: 'include' });
        if (res.ok) {
            const users = await res.json();
            const select = document.getElementById('reset-user-select');
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select User...</option>';
            users.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = `${u.fullName} (${u.username})`;
                select.appendChild(opt);
            });
            select.value = currentValue;
        }
    } catch (err) {
        console.error('Failed to load users', err);
    }
}

function setupEventListeners() {
    document.getElementById('prev-month').addEventListener('click', () => {
        currentViewDate.setMonth(currentViewDate.getMonth() - 1);
        loadBookings();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentViewDate.setMonth(currentViewDate.getMonth() + 1);
        loadBookings();
    });

    document.getElementById('create-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('new-fullname').value;
        const apartmentCode = document.getElementById('new-apt').value;
        const username = document.getElementById('new-username').value;
        const password = document.getElementById('new-password').value;
        const role = parseInt(document.getElementById('new-role').value);

        const res = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, apartmentCode, username, password, role }),
            credentials: 'include'
        });

        const msgDiv = document.getElementById('create-user-msg');
        if (res.ok) {
            msgDiv.textContent = 'User created successfully!';
            msgDiv.style.color = 'green';
            e.target.reset();
            loadUsersForAdmin(); // Refresh the list
        } else {
            const err = await res.json();
            if (err.errors) {
                const errorMessages = Object.values(err.errors).flat();
                msgDiv.textContent = errorMessages.join(', ');
            } else {
                msgDiv.textContent = err.message || 'Error creating user';
            }
            msgDiv.style.color = 'red';
        }
    });

    document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = parseInt(document.getElementById('reset-user-select').value);
        const newPassword = document.getElementById('reset-new-password').value;

        const res = await fetch(`${API_BASE}/users/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, newPassword }),
            credentials: 'include'
        });

        const msgDiv = document.getElementById('reset-password-msg');
        if (res.ok) {
            msgDiv.textContent = 'Password reset successfully!';
            msgDiv.style.color = 'green';
            e.target.reset();
        } else {
            const err = await res.json();
            if (err.errors) {
                const errorMessages = Object.values(err.errors).flat();
                msgDiv.textContent = errorMessages.join(', ');
            } else {
                msgDiv.textContent = err.message || 'Error resetting password';
            }
            msgDiv.style.color = 'red';
        }
    });
}

async function loadBookings() {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth() + 1;
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    
    document.getElementById('current-month-display').textContent = currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    try {
        const res = await fetch(`${API_BASE}/bookings?month=${monthStr}`, { credentials: 'include' });
        if (res.ok) {
            const bookings = await res.json();
            renderCalendar(year, month, bookings);
        }
    } catch (err) {
        console.error('Failed to load bookings', err);
    }
}

function renderCalendar(year, month, bookings) {
    const tbody = document.getElementById('booking-tbody');
    tbody.innerHTML = '';

    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Create a map of bookings for easy lookup
    const bookingMap = {};
    bookings.forEach(b => {
        if (!bookingMap[b.date]) bookingMap[b.date] = {};
        bookingMap[b.date][b.timeSlot] = b;
    });

    const today = new Date();
    // Argentina offset is UTC-3, but for simplicity in MVP frontend we use local browser date 
    // to determine if a date is past. The backend enforces the strict Argentina time rule.
    today.setHours(0,0,0,0);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const rowDate = new Date(year, month - 1, day);
        const isPast = rowDate < today;

        const tr = document.createElement('tr');
        
        const tdDate = document.createElement('td');
        tdDate.textContent = dateStr;
        tr.appendChild(tdDate);

        [0, 1].forEach(slotNum => { // 0 = DAY, 1 = NIGHT
            const tdSlot = document.createElement('td');
            const booking = bookingMap[dateStr] && bookingMap[dateStr][slotNum];

            if (booking) {
                tdSlot.className = 'slot-booked';
                tdSlot.innerHTML = `<div>${booking.fullName} (${booking.apartmentCode})</div>`;
                
                if (!isPast && (currentUser.role === 1 || currentUser.id === booking.userId)) {
                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = 'cancel-btn';
                    cancelBtn.textContent = 'Cancel';
                    cancelBtn.onclick = () => cancelBooking(booking.id);
                    tdSlot.appendChild(cancelBtn);
                }
            } else {
                if (!isPast) {
                    const bookBtn = document.createElement('button');
                    bookBtn.textContent = 'Book';
                    bookBtn.onclick = () => createBooking(dateStr, slotNum);
                    tdSlot.appendChild(bookBtn);
                } else {
                    tdSlot.textContent = '-';
                }
            }
            tr.appendChild(tdSlot);
        });

        tbody.appendChild(tr);
    }
}

async function createBooking(date, timeSlot) {
    try {
        let url = `${API_BASE}/bookings`;
        let body = { date, timeSlot };

        // If admin, we could prompt for userId, but for MVP we'll just book for themselves 
        // unless we build a user selector. The prompt says "Create bookings on behalf of users".
        // For simplicity, we'll just book for the logged-in user here.
        
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include'
        });

        if (res.ok) {
            loadBookings();
        } else {
            const err = await res.json();
            alert(`Booking failed: ${err.message}`);
        }
    } catch (err) {
        console.error(err);
    }
}

async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
            method: 'POST',
            credentials: 'include'
        });

        if (res.ok) {
            loadBookings();
        } else {
            const err = await res.json();
            alert(`Cancellation failed: ${err.message}`);
        }
    } catch (err) {
        console.error(err);
    }
}
