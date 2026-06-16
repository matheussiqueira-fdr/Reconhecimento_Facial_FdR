// Consulta dos registros de acesso (auditoria).
import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../auth.js';

const router = Router();

// GET /api/logs?limit=100&result=granted  (admin)
router.get('/', requireAuth, requireRole('admin'), (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 1000);
  const result = req.query.result;
  let sql = `SELECT l.*, u.username AS operator_username
             FROM access_logs l
             LEFT JOIN system_users u ON u.id = l.operator_id`;
  const params = [];
  if (result === 'granted' || result === 'denied') {
    sql += ' WHERE l.result = ?';
    params.push(result);
  }
  sql += ' ORDER BY l.created_at DESC LIMIT ?';
  params.push(limit);
  res.json({ logs: db.prepare(sql).all(...params) });
});

export default router;
