// Cadastro e gestão de pessoas reconhecíveis.
// Apenas ADMIN pode cadastrar/editar/remover. Operador pode listar.
import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../auth.js';

const router = Router();

function validDescriptor(d) {
  return Array.isArray(d) && d.length === 128 && d.every((n) => typeof n === 'number');
}

// GET /api/people  -> lista (sem expor o descriptor por padrão)
router.get('/', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, external_id, name, role, active, created_at
       FROM people ORDER BY name`
    )
    .all();
  res.json({ people: rows });
});

// POST /api/people  (admin)  { name, external_id?, role?, descriptor[128] }
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, external_id, role, descriptor } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
  if (!validDescriptor(descriptor)) {
    return res.status(400).json({ error: 'Descriptor inválido (esperado array de 128 números)' });
  }
  try {
    const info = db
      .prepare(
        `INSERT INTO people (external_id, name, role, descriptor, created_by)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(external_id || null, name, role || null, JSON.stringify(descriptor), req.user.sub);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'external_id já cadastrado' });
    }
    throw e;
  }
});

// PATCH /api/people/:id  (admin) -> atualiza dados e/ou ativa/desativa
router.patch('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { name, role, active, descriptor } = req.body || {};
  const person = db.prepare('SELECT * FROM people WHERE id = ?').get(req.params.id);
  if (!person) return res.status(404).json({ error: 'Pessoa não encontrada' });
  if (descriptor !== undefined && !validDescriptor(descriptor)) {
    return res.status(400).json({ error: 'Descriptor inválido' });
  }
  db.prepare(
    `UPDATE people SET
       name = COALESCE(?, name),
       role = COALESCE(?, role),
       active = COALESCE(?, active),
       descriptor = COALESCE(?, descriptor)
     WHERE id = ?`
  ).run(
    name ?? null,
    role ?? null,
    active === undefined ? null : active ? 1 : 0,
    descriptor ? JSON.stringify(descriptor) : null,
    req.params.id
  );
  res.json({ ok: true });
});

// DELETE /api/people/:id  (admin)
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const info = db.prepare('DELETE FROM people WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
  res.json({ ok: true });
});

export default router;
