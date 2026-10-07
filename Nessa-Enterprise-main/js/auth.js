/**
 * Auth Module - Nessa Enterprise Dashboard
 * Handles login/logout and session management
 */

const Auth = (() => {
  const SESSION_KEY = 'nessa_jwt_token'; // New key for JWT system

  function init() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }

    // Toggle password visibility
    const togglePwdBtn = document.getElementById('togglePassword');
    if (togglePwdBtn) {
      togglePwdBtn.addEventListener('click', () => {
        const pwdInput = document.getElementById('loginPassword') || document.getElementById('regPassword');
        if(!pwdInput) return;
        const icon = togglePwdBtn.querySelector('i');
        if (pwdInput.type === 'password') {
          pwdInput.type = 'text';
          icon.className = 'bi bi-eye-slash';
        } else {
          pwdInput.type = 'password';
          icon.className = 'bi bi-eye';
        }
      });
    }
  }

  // Simulated Session Logic (JSON-based for reliability)
  function generateSession(payload) {
    return JSON.stringify({
      ...payload,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hour expiry
    });
  }

  function validateSession(raw) {
    if (!raw) return null;
    try {
      const decoded = JSON.parse(raw);
      if (decoded.exp < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return decoded;
    } catch(e) { return null; }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const errorBox = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginSubmitBtn');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Authenticating...';

    try {
      await ExcelService.loadData(true);
      const users = ExcelService.getUsers();

      // Simulated network delay
      await new Promise(r => setTimeout(r, 600));

      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      // FORCED ADMIN OVERRIDE - Highest Priority for admin@nessa.com
      if (email === 'admin@nessa.com' && password === 'admin123') {
        user = { id: 1, name: 'Main Admin', email: 'admin@nessa.com', role: 'Admin' };
      }

      if (user) {
        const portalType = document.getElementById('portalTypeInput')?.value || 'customer';
        const uRole = String(user.role || 'Customer').toLowerCase();
        const isMgmt = uRole === 'admin' || uRole === 'manager' || uRole === 'staff' || user.email === 'admin@nessa.com';

        if (portalType === 'admin' && !isMgmt) {
          errorBox.classList.add('show');
          errorBox.innerHTML = '<i class="bi bi-exclamation-circle"></i> Access Denied: Customer accounts cannot log in via Admin Portal.';
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign In to Admin Panel';
          return;
        }

        const session = generateSession({
          id: user.id,
          name: user.name,
          email: user.email,
          role: String(user.role || 'Customer').trim()
        });
        
        localStorage.setItem(SESSION_KEY, session);
        redirectByRole();
      } else {
        errorBox.classList.add('show');
        errorBox.innerHTML = '<i class="bi bi-exclamation-circle"></i> Incorrect email or password.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In';
      }
    } catch (err) {
      errorBox.classList.add('show');
      errorBox.innerHTML = '<i class="bi bi-exclamation-circle"></i> Service unavailable.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In';
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errorBox = document.getElementById('registerError');
    const submitBtn = document.getElementById('registerSubmitBtn');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';

    try {
      const response = await ExcelService.registerUser({ name, email, password });
      const user = response.user;
      
      const session = generateSession({
        id: user.id,
        name: user.name,
        email: user.email,
        role: String(user.role || 'Customer').trim()
      });
      
      localStorage.setItem(SESSION_KEY, session);
      redirectByRole();
    } catch (err) {
      errorBox.classList.add('show');
      errorBox.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${err.message}`;
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Create Account';
    }
  }

  function redirectByRole() {
    const session = getSession();
    if (!session) {
      if (!window.location.pathname.includes('login.html')) {
        window.location.replace('login.html');
      }
      return;
    }
    
    const role = (session.role || '').toLowerCase();
    const email = (session.email || '').toLowerCase();
    
    // Management roles go to Dashboard, others go to Store
    const isManagement = (role === 'admin' || role === 'manager' || role === 'staff' || email === 'admin@nessa.com');
    
    const target = isManagement ? 'dashboard.html' : 'store.html';
    
    if (!window.location.pathname.includes(target)) {
      console.log(`Routing to ${target} (Role: ${role})`);
      window.location.replace(target);
    }
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return validateSession(raw);
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.replace('login.html');
      return false;
    }
    return true;
  }

  function requireRole(allowedRoles) {
    if (!requireAuth()) return false;
    const session = getSession();
    const role = session ? session.role : null;
    
    const isAllowed = role && allowedRoles.some(r => r.toLowerCase() === role.toLowerCase());
    
    if (!isAllowed) {
      console.warn("Unauthorized Role Detected:", role);
      redirectByRole(); // Send them back to their home
      return false;
    }
    return true;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
  }

  function populateUserInfo() {
    const session = getSession();
    if (!session) return;

    const nameEls = document.querySelectorAll('.user-display-name');
    const roleEls = document.querySelectorAll('.user-display-role');
    const avatarEls = document.querySelectorAll('.profile-avatar');

    nameEls.forEach(el => el.textContent = session.name);
    roleEls.forEach(el => el.textContent = session.role);
    avatarEls.forEach(el => {
      const initials = session.name.split(' ').map(n => n[0]).join('').toUpperCase();
      if (!el.querySelector('img')) {
        el.textContent = initials;
      }
    });
  }

  return { init, getSession, isLoggedIn, requireAuth, requireRole, logout, populateUserInfo, redirectByRole };
})();
