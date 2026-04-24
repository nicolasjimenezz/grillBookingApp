import * as authService from './src/authService.js';
import * as userService from './src/userService.js';
import * as bookingService from './src/bookingService.js';

let currentUser = null;
let currentViewDate = new Date(); // Using local time for view

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

async function checkAuth() {
    try {
        const data = await authService.fetchMe();
        if (data) {
            currentUser = data;
            renderHeader();
            showMainContent();
            loadBookings();
        } else {
            renderLoginForm();
        }
    } catch (err) {
        console.error('Auth check failed', err);
        // Show your connection error UI here
    }
}

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
            const res = await authService.login(username, password);
            if (res.ok) {
                checkAuth();
            } else {
                let message = 'Login failed. Incorrect username or password.';
                let detail = '';
                try {
                    const data = await res.json();
                    if (data && data.message) message = data.message;
                    if (data && data.detail) detail = data.detail;
                } catch (e) {
                    // Fallback if not JSON
                }
                errorDiv.innerHTML = `<div>${message}</div>${detail ? `<div style="font-size: 0.8rem; margin-top: 5px; color: #666;">Technical Detail: ${detail}</div>` : ''}`;
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
    await authService.logout();
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
        const users = await userService.fetchUsers();
        
        // Update reset password dropdown
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

        // Update manage users table
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.fullName}</td>
                <td>${u.apartmentCode}</td>
                <td>${u.username}</td>
                <td style="color: ${u.isActive ? 'green' : 'red'}">${u.isActive ? 'Active' : 'Disabled'}</td>
                <td>
                    <button onclick="toggleUserStatus(${u.id}, ${u.isActive})">
                        ${u.isActive ? 'Disable' : 'Enable'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to load users', err);
    }
}

window.toggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    const confirmed = await showModal(`Are you sure you want to ${action} this user?`, 'confirm');
    if (!confirmed) return;

    try {
        const res = await userService.toggleStatus(userId);
        loadUsersForAdmin();
    } catch (err) {
        console.error(err);
        showModal('An error occurred while toggling user status.');
    }
};

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

        const res = await userService.createUser({ fullName, apartmentCode, username, password, role });

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

        const res = await userService.resetPassword(userId, newPassword);

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
        const bookings = await bookingService.fetchBookings(monthStr);
        renderCalendar(year, month, bookings);
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

function showModal(message, type = 'alert', defaultValue = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const msgPara = document.getElementById('modal-message');
        const yesBtn = document.getElementById('modal-yes-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const okBtn = document.getElementById('modal-ok-btn');
        
        // Handle prompt input
        let input = document.getElementById('modal-input');
        if (type === 'prompt') {
            if (!input) {
                input = document.createElement('input');
                input.id = 'modal-input';
                input.type = 'text';
                input.style.width = '100%';
                input.style.marginTop = '1rem';
                input.style.padding = '0.5rem';
                msgPara.after(input);
            }
            input.value = defaultValue;
            input.style.display = 'block';
            setTimeout(() => input.focus(), 10);
        } else if (input) {
            input.style.display = 'none';
        }

        msgPara.textContent = message;
        modal.style.display = 'flex';

        if (type === 'confirm') {
            yesBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            okBtn.style.display = 'none';
            yesBtn.textContent = 'Yes';
        } else if (type === 'prompt') {
            yesBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            okBtn.style.display = 'none';
            yesBtn.textContent = 'OK';
        } else {
            yesBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            okBtn.style.display = 'inline-block';
            msgPara.classList.add('modal-error');
        }

        const cleanup = (result) => {
            modal.style.display = 'none';
            msgPara.classList.remove('modal-error');
            yesBtn.textContent = 'Yes';
            yesBtn.onclick = null;
            cancelBtn.onclick = null;
            okBtn.onclick = null;
            resolve(result);
        };

        yesBtn.onclick = () => cleanup(type === 'prompt' ? input.value : true);
        cancelBtn.onclick = () => cleanup(false);
        okBtn.onclick = () => cleanup(true);
    });
}

async function createBooking(date, timeSlot) {
    try {
        const res = await bookingService.createBooking(date, timeSlot);

        if (res.ok) {
            loadBookings();
        } else {
            const err = await res.json();
            showModal(`Booking failed: ${err.message}`);
        }
    } catch (err) {
        console.error(err);
        showModal('An error occurred while creating the booking.');
    }
}

async function cancelBooking(id) {
    const confirmed = await showModal('Are you sure you want to cancel this booking?', 'confirm');
    if (!confirmed) return;
    
    try {
        const res = await bookingService.cancelBooking(id);

        if (res.ok) {
            loadBookings();
        } else {
            const err = await res.json();
            showModal(`Cancellation failed: ${err.message}`);
        }
    } catch (err) {
        console.error(err);
        showModal('An error occurred while cancelling the booking.');
    }
}
