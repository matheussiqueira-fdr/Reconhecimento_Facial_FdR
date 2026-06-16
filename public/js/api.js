// Cliente HTTP minimalista + sessão (token em memória/sessionStorage).
const TOKEN_KEY = 'fr_token';
const USER_KEY = 'fr_user';

export function saveSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
export function getUser() {
  const raw = sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
export function requireLogin() {
  if (!getToken()) { window.location.href = '/index.html'; return false; }
  return true;
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* sem corpo */ }
  if (res.status === 401) { clearSession(); window.location.href = '/index.html'; }
  if (!res.ok) throw new Error((data && data.error) || `Erro ${res.status}`);
  return data;
}
