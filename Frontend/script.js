/**
 * CONFIGURATION
 */
const BACKEND_BASE_URL = 'https://complaints-registration-platform-full-oyxq.onrender.com';
const API_BASE = `${BACKEND_BASE_URL}/api`;

let currentUser = null;
let currentLang = 'hi';
let ratings = {
    rating_behavior: 0,
    rating_time: 0,
    rating_cleanliness: 0
};

// Helper: Show Section
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    const targetId = sectionId.includes('-section') ? sectionId : sectionId + '-section';
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Refresh data if needed
    if (sectionId === 'my-complaints') fetchMyComplaints();
    if (sectionId === 'admin-dashboard') fetchAdminComplaints();
}

// Helper: Show Message
function showMsg(id, text, type = 'success') {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = text;
    el.className = `message ${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 8000);
}

// 1. Language Toggle
function toggleLanguage() {
    currentLang = currentLang === 'hi' ? 'en' : 'hi';
    const translations = {
        hi: {
            title: "उत्तर प्रदेश पुलिस फीडबैक पोर्टल",
            heroTitle: "जनता की सेवा में सदैव तत्पर",
            heroDesc: "आपकी प्रतिक्रिया हमारे लिए महत्वपूर्ण है। कृपया अपनी शिकायतें या सुझाव यहाँ दर्ज करें ताकि हम अपनी सेवाओं को और बेहतर बना सकें।"
        },
        en: {
            title: "Uttar Pradesh Police Feedback Portal",
            heroTitle: "Always Ready for Public Service",
            heroDesc: "Your feedback is valuable to us. Please register your complaints or suggestions here so we can improve our services."
        }
    };

    document.getElementById('main-title').innerText = translations[currentLang].title;
    document.getElementById('hero-title').innerText = translations[currentLang].heroTitle;
    document.getElementById('hero-desc').innerText = translations[currentLang].heroDesc;
}

// 2. Session Check
async function checkSession() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
        const data = await res.json();

        if (data.loggedIn) {
            currentUser = data;
            onLoginSuccess();
        } else {
            showSection('welcome-section');
        }
    } catch (err) {
        console.error('Session check failed:', err);
        showSection('welcome-section');
    }
}

function onLoginSuccess() {
    document.getElementById('main-nav').style.display = 'flex';
    document.getElementById('user-display').innerText = `${currentUser.name} (${currentUser.role})`;

    if (currentUser.role === 'admin') {
        document.getElementById('nav-admin-dashboard').style.display = 'inline';
        showSection('admin-dashboard');
    } else {
        document.getElementById('nav-admin-dashboard').style.display = 'none';
        showSection('my-feedback');
    }
}

// 3. Auth Actions
async function register() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;

    if (!name || !email || !password) return showMsg('register-msg', 'कृपया सभी जानकारी भरें (Fill all fields)', 'error');
    if (password !== confirm) return showMsg('register-msg', 'पासवर्ड मैच नहीं हुआ (Passwords do not match)', 'error');

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            showMsg('login-msg', 'खाता सफलतापूर्वक बन गया! अब लॉगिन करें।');
            showSection('login-section');
        } else {
            showMsg('register-msg', data.error || 'Registration failed', 'error');
        }
    } catch (err) {
        showMsg('register-msg', 'Connection failed. Check server.', 'error');
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (res.ok) {
            const data = await res.json();
            currentUser = { ...data, loggedIn: true };
            onLoginSuccess();
        } else {
            const data = await res.json();
            showMsg('login-msg', data.error || 'Login failed', 'error');
        }
    } catch (err) {
        showMsg('login-msg', 'Login failed. Check server connection.', 'error');
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
        console.error('Logout error:', err);
    }
    currentUser = null;
    document.getElementById('main-nav').style.display = 'none';
    showSection('welcome-section');
}

// 4. Star Rating Logic
document.addEventListener('click', (e) => {
    if (e.target.matches('.stars i')) {
        const star = e.target;
        const container = star.parentElement;
        const ratingId = container.dataset.ratingId;
        const value = parseInt(star.dataset.value);

        ratings[ratingId] = value;

        // Update UI
        Array.from(container.children).forEach(child => {
            const val = parseInt(child.dataset.value);
            if (val <= value) {
                child.classList.remove('far');
                child.classList.add('fas', 'active');
            } else {
                child.classList.remove('fas', 'active');
                child.classList.add('far');
            }
        });
    }
});

// 5. Feedback Submission
async function submitFeedback() {
    const district = document.getElementById('district').value;
    const police_station = document.getElementById('police_station').value;
    const service_type = document.getElementById('service_type').value;
    const complaint_text = document.getElementById('complaint-text').value;
    const corruption_val = document.querySelector('input[name="corruption"]:checked').value === 'true';

    if (!district || !police_station || !service_type || !complaint_text) {
        return showMsg('submit-msg', 'कृपया जिला, थाना और अन्य जानकारी भरें', 'error');
    }

    try {
        const res = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                district,
                police_station,
                service_type,
                rating_behavior: ratings.rating_behavior,
                rating_time: ratings.rating_time,
                rating_cleanliness: ratings.rating_cleanliness,
                is_corruption_free: corruption_val,
                complaint_text
            }),
            credentials: 'include'
        });

        if (res.ok) {
            document.getElementById('thank-you-modal').style.display = 'flex';
        } else {
            const data = await res.json();
            showMsg('submit-msg', data.error || 'Submission failed', 'error');
        }
    } catch (err) {
        showMsg('submit-msg', 'Submission failed. Check server connection.', 'error');
    }
}

function closeThankYou() {
    document.getElementById('thank-you-modal').style.display = 'none';
    // Reset Form
    document.getElementById('district').value = '';
    document.getElementById('police_station').value = '';
    document.getElementById('service_type').value = '';
    document.getElementById('complaint-text').value = '';
    ratings = { rating_behavior: 0, rating_time: 0, rating_cleanliness: 0 };
    document.querySelectorAll('.stars i').forEach(i => {
        i.classList.remove('fas', 'active');
        i.classList.add('far');
    });
    showSection('my-complaints');
}

// 6. Data Fetching
async function fetchMyComplaints() {
    const listEl = document.getElementById('my-complaints-list');
    listEl.innerHTML = '<p class="text-muted">Loading your feedback...</p>';

    try {
        const res = await fetch(`${API_BASE}/complaints/my`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            if (data.length === 0) {
                listEl.innerHTML = '<p class="text-muted">You haven\'t submitted any feedback yet.</p>';
                return;
            }
            listEl.innerHTML = data.map(c => `
                <div class="complaint-card glass-panel">
                    <div class="watermark" style="width: 150px; height: 150px;"></div>
                    <div class="complaint-header">
                        <span style="font-weight: 700; color: var(--police-blue);">${c.service_type}</span>
                        <span>${new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #444;">
                        District: <b>${c.district}</b> | PS: <b>${c.police_station}</b>
                    </div>
                    <div style="margin-bottom: 1rem; display: flex; gap: 1rem; font-size: 0.85rem;">
                        <span>Behavior: ${c.rating_behavior}⭐</span>
                        <span>Time: ${c.rating_time}⭐</span>
                        <span>Facility: ${c.rating_cleanliness}⭐</span>
                        <span>Corruption Free: ${c.is_corruption_free ? '✅' : '❌'}</span>
                    </div>
                    <div class="complaint-text">${c.complaint_text}</div>
                </div>
            `).join('');
        } else {
            listEl.innerHTML = '<p class="message error">Failed to load feedback</p>';
        }
    } catch (err) {
        listEl.innerHTML = '<p class="message error">Failed to connect to server</p>';
    }
}

async function fetchAdminComplaints() {
    const listEl = document.getElementById('admin-complaints-list');
    listEl.innerHTML = '<p class="text-muted">Loading all feedback...</p>';

    try {
        const res = await fetch(`${API_BASE}/admin/complaints`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            if (data.length === 0) {
                listEl.innerHTML = '<p class="text-muted">No feedback found in the system.</p>';
                return;
            }
            listEl.innerHTML = data.map(c => `
                <div class="complaint-card glass-panel" style="border-left-color: var(--police-blue);">
                    <div class="watermark" style="width: 200px; height: 200px;"></div>
                    <div class="complaint-header">
                        <span style="color: var(--police-blue); font-weight: 700;">${c.userName} (${c.userEmail})</span>
                        <span>${new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <div style="margin-bottom: 0.5rem; font-weight: 600; color: var(--crimson);">
                        District: ${c.district} | Police Station: ${c.police_station}
                    </div>
                    <div style="margin-bottom: 0.5rem; font-weight: 600;">Service: ${c.service_type}</div>
                    <div style="margin-bottom: 1rem; display: flex; gap: 1rem; font-size: 0.85rem;">
                        <span>Behavior: ${c.rating_behavior}⭐</span>
                        <span>Time: ${c.rating_time}⭐</span>
                        <span>Facility: ${c.rating_cleanliness}⭐</span>
                        <span>Corruption Free: ${c.is_corruption_free ? '✅' : '❌'}</span>
                    </div>
                    <div class="complaint-text" style="background: rgba(255,255,255,0.6); padding: 1rem; border-radius: 8px;">${c.complaint_text}</div>
                </div>
            `).join('');
        } else {
            listEl.innerHTML = '<p class="message error">Failed to load admin dashboard</p>';
        }
    } catch (err) {
        listEl.innerHTML = '<p class="message error">Failed to connect to server</p>';
    }
}

// Init
window.onload = checkSession;
