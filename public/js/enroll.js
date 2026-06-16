import { api, requireLogin, getUser } from './api.js';
import { renderNav } from './nav.js';
import { loadModels, startCamera, detectDescriptor, descriptorToArray } from './faceapi-config.js';

if (!requireLogin()) throw new Error('redirect');
renderNav('enroll.html');

const user = getUser();
if (user.role !== 'admin') {
  // Operador não cadastra.
  document.querySelector('main').innerHTML =
    '<div class="card"><div class="status err">Apenas administradores podem cadastrar pessoas.</div></div>';
  throw new Error('forbidden');
}

const msg = document.getElementById('msg');
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const peopleBody = document.getElementById('peopleBody');

function setMsg(text, type = 'info') {
  msg.innerHTML = `<div class="status ${type}">${text}</div>`;
}

async function init() {
  try {
    setMsg('Carregando modelos de IA...');
    await loadModels((s) => setMsg(s));
    await startCamera(video);
    setMsg('Pronto. Posicione o rosto e clique em cadastrar.', 'ok');
    captureBtn.disabled = false;
  } catch (e) {
    setMsg('Erro ao iniciar câmera/modelos: ' + e.message, 'err');
  }
  await loadPeople();
}

captureBtn.addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  if (!name) return setMsg('Informe o nome.', 'err');
  captureBtn.disabled = true;
  setMsg('Detectando rosto...');
  try {
    const detection = await detectDescriptor(video);
    if (!detection) {
      setMsg('Nenhum rosto detectado. Aproxime-se e tente novamente.', 'err');
      captureBtn.disabled = false;
      return;
    }
    await api('/people', {
      method: 'POST',
      body: {
        name,
        external_id: document.getElementById('external_id').value.trim() || undefined,
        role: document.getElementById('role').value.trim() || undefined,
        descriptor: descriptorToArray(detection.descriptor),
      },
    });
    setMsg(`"${name}" cadastrado com sucesso.`, 'ok');
    document.getElementById('name').value = '';
    document.getElementById('external_id').value = '';
    document.getElementById('role').value = '';
    await loadPeople();
  } catch (e) {
    setMsg('Erro: ' + e.message, 'err');
  } finally {
    captureBtn.disabled = false;
  }
});

async function loadPeople() {
  const { people } = await api('/people');
  peopleBody.innerHTML = people
    .map(
      (p) => `<tr>
        <td>${p.name}</td>
        <td>${p.external_id || '—'}</td>
        <td>${p.role || '—'}</td>
        <td>${p.active ? 'Ativo' : 'Inativo'}</td>
        <td><button class="secondary" data-del="${p.id}">Remover</button></td>
      </tr>`
    )
    .join('');
  peopleBody.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remover esta pessoa?')) return;
      await api(`/people/${btn.dataset.del}`, { method: 'DELETE' });
      await loadPeople();
    });
  });
}

init();
