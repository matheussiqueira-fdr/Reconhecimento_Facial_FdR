// Baixa os pesos da face-api.js para public/models (uso offline/produção).
// Multiplataforma (usa fetch nativo do Node 18+). Pula arquivos já existentes.
// Rode com: npm run download-models
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST = path.join(__dirname, '..', 'public', 'models');
const BASE = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api@master/model';

const FILES = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.bin',
];

fs.mkdirSync(DEST, { recursive: true });

for (const f of FILES) {
  const out = path.join(DEST, f);
  if (fs.existsSync(out) && fs.statSync(out).size > 0) {
    console.log(`já existe: ${f}`);
    continue;
  }
  process.stdout.write(`baixando ${f} ... `);
  const res = await fetch(`${BASE}/${f}`);
  if (!res.ok) throw new Error(`falha (${res.status}) em ${f}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  console.log(`ok (${buf.length} bytes)`);
}

console.log('\nModelos salvos em public/models.');
console.log("Para usá-los, troque MODEL_URL para '/models' em public/js/faceapi-config.js.");
