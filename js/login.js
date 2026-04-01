/**
 * LabOS - Login Page Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const roleTabs = document.querySelectorAll('.role-tab');
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn.querySelector('.btn-text');
  const btnLoader = document.getElementById('btnLoader');
  const pwdToggle = document.getElementById('pwdToggle');
  const passwordInput = document.getElementById('password');

  let selectedRole = 'user';

  // Role tab switching
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
    });
  });

  // Password toggle
  pwdToggle.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    pwdToggle.innerHTML = isHidden
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });

  // Demo quick login
  const roleDestinations = {
    user: 'user-dashboard.html',
    admin: 'admin-dashboard.html',
    sysadmin: 'sysadmin-dashboard.html'
  };

  document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.demo;
      const demos = { user: { username: '20210001', password: 'demo123' }, admin: { username: 'admin001', password: 'demo123' }, sysadmin: { username: 'sysadmin', password: 'demo123' } };
      document.getElementById('username').value = demos[role].username;
      document.getElementById('password').value = demos[role].password;
      // Set matching role tab
      roleTabs.forEach(t => t.classList.toggle('active', t.dataset.role === role));
      selectedRole = role;
    });
  });

  // SSO Button
  document.getElementById('ssoBtn').addEventListener('click', () => {
    showLoginLoading('正在跳转校园认证...');
    setTimeout(() => { window.location.href = 'user-dashboard.html'; }, 1500);
  });

  // Login form submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) return;

    showLoginLoading('登录中...');
    setTimeout(() => {
      window.location.href = roleDestinations[selectedRole];
    }, 1200);
  });

  function showLoginLoading(text) {
    btnText.textContent = text;
    btnLoader.style.display = 'flex';
    loginBtn.disabled = true;
  }

  // Add subtle parallax to blobs on mouse move
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    document.querySelector('.blob-1').style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
    document.querySelector('.blob-2').style.transform = `translate(${-x * 0.4}px, ${-y * 0.4}px)`;
    document.querySelector('.blob-3').style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
});
