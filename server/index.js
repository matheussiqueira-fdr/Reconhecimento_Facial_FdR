// Ponto de entrada da API + servidor estático do frontend.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/auth.js';
import peopleRoutes from './routes/people.js';
import recognizeRoutes from './routes/recognize.js';
import logsRoutes from './routes/logs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '256kb' })); // descriptors são pequenos

// API
app.use('/api/auth', authRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/recognize', recognizeRoutes);
app.use('/api/logs', logsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Frontend estático (sem build).
app.use(express.static(path.join(__dirname, '..', 'public')));

// Handler de erro genérico.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
