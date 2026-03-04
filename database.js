const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'myweb.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

module.exports = {
  db,
  getUserByEmail: (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(email),
  getUserByUsername: (username) => db.prepare('SELECT * FROM users WHERE username = ?').get(username),
  createUser: (username, email, passwordHash) =>
    db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, passwordHash),
  getDocumentsByUser: (userId) =>
    db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC').all(userId),
  getDocumentById: (id) => db.prepare('SELECT * FROM documents WHERE id = ?').get(id),
  createDocument: (userId, title, content) =>
    db.prepare('INSERT INTO documents (user_id, title, content) VALUES (?, ?, ?)').run(userId, title, content),
  updateDocument: (id, title, content) =>
    db.prepare('UPDATE documents SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, content, id),
  deleteDocument: (id) => db.prepare('DELETE FROM documents WHERE id = ?').run(id),
};
