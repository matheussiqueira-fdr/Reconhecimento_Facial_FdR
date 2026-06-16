import { api, saveSession, getToken } from './api.js';

if (getToken()) window.location.href = '/station.html';

const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.innerHTML = '';
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  try {
    const { token, user } = await api('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    saveSession(token, user);
    // Admin vai para cadastro; operador para a estação de acesso.
    window.location.href = user.role === 'admin' ? '/enroll.html' : '/station.html';
  } catch (err) {
    msg.innerHTML = `<div class="status err">${err.message}</div>`;
  }
});
