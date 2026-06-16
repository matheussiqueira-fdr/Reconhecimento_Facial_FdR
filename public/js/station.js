import { api, requireLogin } from './api.js';
import { renderNav } from './nav.js';
import { loadModels, startCamera, detectDescriptor, descriptorToArray } from './faceapi-config.js';

if (!requireLogin()) throw new Error('redirect');
renderNav('station.html');

const video = document.getElementById('video');
const recognizeBtn = document.getElementById('recognizeBtn');
const autoMode = document.getElementById('autoMode');
const resultEl = document.getElementById('result');

let autoTimer = null;
let busy = false;

function showResult(html) { resultEl.innerHTML = html; }

async function init() {
  try {
    showResult('<div class="status info">Carregando modelos...</div>');
    await loadModels((s) => showResult(`<div class="status info">${s}</div>`));
    await startCamera(video);
    showResult('<div class="status ok">Pronto para verificar.</div>');
    recognizeBtn.disabled = false;
  } catch (e) {
    showResult(`<div class="status err">Erro: ${e.message}</div>`);
  }
}

async function verify() {
  if (busy) return;
  busy = true;
  recognizeBtn.disabled = true;
  try {
    const detection = await detectDescriptor(video);
    if (!detection) {
      showResult('<div class="status err">Nenhum rosto detectado.</div>');
      return;
    }
    const r = await api('/recognize', {
      method: 'POST',
      body: { descriptor: descriptorToArray(detection.descriptor) },
    });
    if (r.result === 'granted') {
      showResult(`
        <div class="status ok">
          <div class="result-big">✓ ACESSO LIBERADO</div>
          <div style="text-align:center;font-size:1.2rem;">${r.person.name}</div>
          <div class="muted" style="text-align:center;">
            ${r.person.role || ''} ${r.person.external_id ? '· ' + r.person.external_id : ''}<br>
            distância ${r.distance.toFixed(3)} (limiar ${r.threshold})
          </div>
        </div>`);
    } else {
      showResult(`
        <div class="status err">
          <div class="result-big">✕ ACESSO NEGADO</div>
          <div class="muted" style="text-align:center;">
            ${r.reason}${r.distance != null ? ` · distância ${r.distance.toFixed(3)} (limiar ${r.threshold})` : ''}
          </div>
        </div>`);
    }
  } catch (e) {
    showResult(`<div class="status err">Erro: ${e.message}</div>`);
  } finally {
    busy = false;
    recognizeBtn.disabled = false;
  }
}

recognizeBtn.addEventListener('click', verify);

autoMode.addEventListener('change', () => {
  if (autoMode.checked) {
    autoTimer = setInterval(verify, 2000);
  } else {
    clearInterval(autoTimer);
    autoTimer = null;
  }
});

init();
