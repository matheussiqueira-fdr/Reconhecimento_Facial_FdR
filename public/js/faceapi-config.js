// Configuração e carregamento dos modelos da face-api.js.
//
// Por padrão carregamos os pesos de uma CDN — assim o teste funciona sem
// nenhuma etapa de download. Para uso offline/produção, baixe os modelos
// (`npm run download-models`) e troque MODEL_URL por '/models'.
//
// face-api.js é exposto globalmente como `faceapi` (carregado via <script>).

export const MODEL_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api@master/model';
// Offline/produção: export const MODEL_URL = '/models';

let loaded = false;

export async function loadModels(onProgress = () => {}) {
  if (loaded) return;
  onProgress('Carregando detector de rostos...');
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  onProgress('Carregando pontos faciais...');
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  onProgress('Carregando reconhecimento...');
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  loaded = true;
  onProgress('Modelos carregados.');
}

// Liga a webcam num elemento <video>.
export async function startCamera(videoEl) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 480, height: 360 },
    audio: false,
  });
  videoEl.srcObject = stream;
  await videoEl.play();
  return stream;
}

export function stopCamera(stream) {
  if (stream) stream.getTracks().forEach((t) => t.stop());
}

// Detecta UM rosto e retorna o descriptor (Float32Array de 128) ou null.
export async function detectDescriptor(videoEl) {
  const detection = await faceapi
    .detectSingleFace(videoEl)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection || null;
}

// Converte Float32Array -> array comum (para enviar como JSON).
export function descriptorToArray(descriptor) {
  return Array.from(descriptor);
}
