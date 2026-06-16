// Monta a barra superior conforme o perfil e a página atual.
import { getUser, clearSession } from './api.js';

export function renderNav(active) {
  const user = getUser();
  const links = [];
  if (user && user.role === 'admin') {
    links.push(['enroll.html', 'Cadastro']);
    links.push(['logs.html', 'Registros']);
  }
  links.push(['station.html', 'Estação de Acesso']);

  const nav = links
    .map(([href, label]) => {
      const cls = href === active ? ' class="active"' : '';
      return `<a href="/${href}"${cls}>${label}</a>`;
    })
    .join('');

  const header = document.querySelector('header.topbar nav');
  if (header) {
    header.innerHTML =
      nav +
      `<a href="#" id="logoutLink">Sair${user ? ` (${user.name})` : ''}</a>`;
    document.getElementById('logoutLink').addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = '/index.html';
    });
  }
}
