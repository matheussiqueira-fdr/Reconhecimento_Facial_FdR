// Camada de banco de dados.
//
// Usamos o SQLite EMBUTIDO no Node.js (módulo `node:sqlite`, Node 22.5+).
// Vantagem: zero dependência nativa para compilar/baixar — o `npm install`
// não precisa de compilador nem de binários externos, então "simplesmente
// funciona". Um pequeno wrapper abaixo mantém a mesma API que o resto do
// código usa (prepare/get/run/all, exec, pragma).
//
// NOTA DE SEGURANÇA / LGPD:
// Nunca armazenamos imagens dos rostos. Guardamos apenas o "descriptor"
// (vetor de 128 floats gerado pela face-api.js) junto aos dados cadastrais.
// O descriptor é uma representação matemática não reversível para a imagem
// original, o que reduz o risco em caso de vazamento e torna a arquitetura
// mais defensável sob a LGPD do que centralizar imagens biométricas.
//
// Para migrar para PostgreSQL: troque este arquivo por uma conexão `pg`,
// ajuste os tipos (TEXT->JSONB ou pgvector, INTEGER PK->SERIAL) e as queries.
// A lógica de matching (server/lib/match.js) permanece igual.

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db');

// Garante que a pasta do banco exista.
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// --- Wrapper com a mesma superfície de API usada pelas rotas ---------------
class Statement {
  constructor(stmt) { this._stmt = stmt; }
  run(...params) {
    const r = this._stmt.run(...params);
    // node:sqlite devolve BigInt; convertemos para Number (JSON-safe).
    return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
  }
  get(...params) { return this._stmt.get(...params) ?? undefined; }
  all(...params) { return this._stmt.all(...params); }
}

class DB {
  constructor(file) { this._db = new DatabaseSync(file); }
  pragma(directive) { this._db.exec('PRAGMA ' + directive); }
  exec(sql) { this._db.exec(sql); return this; }
  prepare(sql) { return new Statement(this._db.prepare(sql)); }
  close() { this._db.close(); }
}

const db = new DB(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------------------------------------------------------------------------
// Esquema
// ---------------------------------------------------------------------------
db.exec(`
  -- Usuários do SISTEMA (quem opera/administra). RBAC por 'role'.
  CREATE TABLE IF NOT EXISTS system_users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'operador'
                          CHECK (role IN ('admin', 'operador')),
    active        INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Pessoas CADASTRADAS para reconhecimento (funcionários, alunos, etc.).
  -- 'descriptor' = JSON de um array de 128 floats. NUNCA guardamos imagem.
  CREATE TABLE IF NOT EXISTS people (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT    UNIQUE,
    name        TEXT    NOT NULL,
    role        TEXT,
    descriptor  TEXT    NOT NULL,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    created_by  INTEGER REFERENCES system_users(id)
  );

  -- Registro de TODAS as tentativas de acesso (auditoria).
  CREATE TABLE IF NOT EXISTS access_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id   INTEGER REFERENCES people(id),
    person_name TEXT,
    operator_id INTEGER REFERENCES system_users(id),
    result      TEXT    NOT NULL CHECK (result IN ('granted', 'denied')),
    distance    REAL,
    reason      TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_logs_created ON access_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_people_active ON people(active);
`);

export default db;
