const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, "data.db"));

db.prepare(`
  CREATE TABLE IF NOT EXISTS droidy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nazwa TEXT NOT NULL,
    typ TEXT NOT NULL,
    producent TEXT NOT NULL,
    rok_produkcji INTEGER NOT NULL CHECK(rok_produkcji BETWEEN 1970 AND 2050),
    status TEXT NOT NULL
  );
`).run();

console.log("✅ Migracja OK — tabela 'droidy' gotowa.");
