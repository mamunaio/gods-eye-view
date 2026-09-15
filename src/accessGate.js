const ACCESS_USERNAME = 'Xias';
const ACCESS_PASSWORD = 'Cyber@2026';

/**
 * Blocks application startup until the local operator credentials are entered.
 * This is a client-side privacy gate for the local dashboard, not server auth.
 * @returns {Promise<void>}
 */
export function requireLocalAccess() {
  const gate = document.getElementById('access-gate');
  const form = document.getElementById('access-gate-form');
  const username = document.getElementById('access-username');
  const password = document.getElementById('access-password');
  const status = document.getElementById('access-gate-status');
  if (!gate || !form || !username || !password) return Promise.resolve();

  gate.hidden = false;
  document.body.classList.add('access-locked');
  username.focus();

  return new Promise((resolve) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (username.value.trim() !== ACCESS_USERNAME || password.value !== ACCESS_PASSWORD) {
        status.textContent = 'ACCESS DENIED';
        password.select();
        return;
      }
      gate.hidden = true;
      document.body.classList.remove('access-locked');
      form.reset();
      resolve();
    });
  });
}