// Reconhecimento (matching server-side) + registro de acesso.
//
// O frontend captura o rosto e calcula o descriptor LOCALMENTE com a
// face-api.js. Aqui recebemos só o vetor de 128 floats, comparamos com os
// descriptors cadastrados e registramos a tentativa.
//
// LIVENESS: a operação exige um operador físico presente (autenticado por
// JWT). Uma tentativa com foto impressa é barrada no fluxo presencial pelo
// próprio operador, que acompanha o acesso.
import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { findBestMatch } from '../lib/match.js';

const router = Router();
const THRESHOLD = Number(process.env.MATCH_THRESHOLD || 0.55);

// POST /api/recognize  (operador|admin)  { descriptor[128] }
router.post('/', requireAuth, requireRole('operador', 'admin'), (req, res) => {
  const { descriptor } = req.body || {};
  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    return res.status(400).json({ error: 'Descriptor inválido (array de 128 números)' });
  }

  const people = db.prepare('SELECT * FROM people WHERE active = 1').all();
  const { matched, distance, person } = findBestMatch(descriptor, people, THRESHOLD);

  const logStmt = db.prepare(
    `INSERT INTO access_logs (person_id, person_name, operator_id, result, distance, reason)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  if (matched && person) {
    logStmt.run(person.id, person.name, req.user.sub, 'granted', distance, null);
    return res.json({
      result: 'granted',
      person: { id: person.id, name: person.name, role: person.role, external_id: person.external_id },
      distance,
      threshold: THRESHOLD,
    });
  }

  const reason = people.length === 0 ? 'nenhuma pessoa cadastrada' : 'rosto não reconhecido';
  logStmt.run(person ? person.id : null, person ? person.name : null, req.user.sub, 'denied', distance, reason);
  res.json({ result: 'denied', distance, threshold: THRESHOLD, reason });
});

export default router;
