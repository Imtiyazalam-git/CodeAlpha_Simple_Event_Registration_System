
const API_URL = 'http://localhost:5000/api';


function getToken() {
    return localStorage.getItem('token');
}

function getUserEmail() {
    return localStorage.getItem('userEmail');
}

function isLoggedIn() {
    return !!getToken();
}


function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showMessage(elementId, message, type = 'error') {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.innerHTML = `<p class="${type}">${message}</p>`;
    }
}



async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/events`);
        const events = await response.json();
        
        const container = document.getElementById('events-container');
        
        if (!container) return; 
        
        if (events.length === 0) {
            container.innerHTML = '<p class="loading">No events available at the moment.</p>';
            return;
        }
        
        container.innerHTML = events.map(event => `
            <div class="event-card">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><strong>📅 Date:</strong> ${formatDate(event.date)}</p>
                <p><strong>📍 Location:</strong> ${event.location}</p>
                <p><strong>💺 Available Seats:</strong> ${event.availableSeats}</p>
                <button class="btn btn-primary" onclick="registerForEvent('${event._id}')">Register Now</button>
            </div>
        `).join('');
    } catch (error) {
        const container = document.getElementById('events-container');
        if (container) {
            container.innerHTML = '<p class="loading">Error loading events. Please try again later.</p>';
        }
        console.error('Error loading events:', error);
    }
}


async function registerForEvent(eventId) {
    if (!isLoggedIn()) {
        alert('Please login first to register for events!');
        window.location.href = 'login.html';
        return;
    }
    
    if (!confirm('Would you like to register for this event?')) {
        return;
    }
    
    const token = getToken();
    const userEmail = getUserEmail();
    
    try {
        const response = await fetch(`${API_URL}/registrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                eventId: eventId,
                userEmail: userEmail
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Successfully registered for the event!');
            loadEvents(); 
        } else {
            alert(`❌ ${data.message || 'Registration failed'}`);
        }
    } catch (error) {
        alert('Error registering for event. Please try again.');
        console.error('Error:', error);
    }
}


async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showMessage('message', 'Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', email);
            
            showMessage('message', '✅ Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'events.html';
            }, 1500);
        } else {
            showMessage('message', `❌ ${data.message || 'Login failed'}`, 'error');
        }
    } catch (error) {
        showMessage('message', '❌ Error logging in. Please try again.', 'error');
        console.error('Login error:', error);
    }
}


async function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!name || !email || !password) {
        showMessage('message', 'Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('message', 'Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role: 'user'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('message', '✅ Registration successful! Redirecting to login...', 'success');
            
            document.getElementById('registerForm').reset();
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showMessage('message', `❌ ${data.message || 'Registration failed'}`, 'error');
        }
    } catch (error) {
        showMessage('message', '❌ Error registering. Please try again.', 'error');
        console.error('Registration error:', error);
    }
}



document.addEventListener('DOMContentLoaded', () => {
   
    if (document.getElementById('events-container')) {
        loadEvents();
    }
    
   
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
});
