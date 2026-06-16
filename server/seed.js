// Cria o usuário admin inicial. Execute uma vez: npm run seed
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';

const username = process.env.SEED_ADMIN_USER || 'admin';
const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

const existing = db.prepare('SELECT id FROM system_users WHERE username = ?').get(username);
if (existing) {
  console.log(`Usuário "${username}" já existe (id ${existing.id}). Nada a fazer.`);
  process.exit(0);
}

const hash = bcrypt.hashSync(password, 10);
const info = db
  .prepare(
    `INSERT INTO system_users (username, password_hash, name, role)
     VALUES (?, ?, ?, 'admin')`
  )
  .run(username, hash, 'Administrador');

console.log(`Admin criado: usuário "${username}" (id ${info.lastInsertRowid}).`);
console.log('IMPORTANTE: troque a senha padrão em produção.');
