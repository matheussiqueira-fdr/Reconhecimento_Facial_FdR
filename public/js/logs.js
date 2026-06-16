import { api, requireLogin } from './api.js';
import { renderNav } from './nav.js';

if (!requireLogin()) throw new Error('redirect');
renderNav('logs.html');

const filter = document.getElementById('filter');
const body = document.getElementById('logsBody');

async function load() {
  const q = filter.value ? `?result=${filter.value}` : '';
  try {
    const { logs } = await api(`/logs${q}`);
    body.innerHTML = logs
      .map(
        (l) => `<tr>
          <td>${l.created_at}</td>
          <td>${l.person_name || '—'}</td>
          <td><span class="badge ${l.result}">${l.result === 'granted' ? 'Liberado' : 'Negado'}</span></td>
          <td>${l.distance != null ? l.distance.toFixed(3) : '—'}</td>
          <td>${l.operator_username || '—'}</td>
          <td class="muted">${l.reason || ''}</td>
        </tr>`
      )
      .join('') || '<tr><td colspan="6" class="muted">Sem registros.</td></tr>';
  } catch (e) {
    body.innerHTML = `<tr><td colspan="6"><div class="status err">${e.message}</div></td></tr>`;
  }
}

filter.addEventListener('change', load);
load();
