const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, "data.db"));

try { require("./migrate"); } catch (_) {}

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function validate(body) {
  const errors = [];
  const { nazwa, typ, producent, rok_produkcji, status } = body || {};
  if (!nazwa || !nazwa.trim()) errors.push("Brak nazwy");
  if (!typ || !typ.trim()) errors.push("Brak typu");
  if (!producent || !producent.trim()) errors.push("Brak producenta");
  if (rok_produkcji === undefined || isNaN(Number(rok_produkcji)) || Number(rok_produkcji) < 1970 || Number(rok_produkcji) > 2050)
    errors.push("Rok produkcji musi być w zakresie 1970–2050");
  if (!status || !status.trim()) errors.push("Brak statusu");
  return errors;
}

app.get("/api/droidy", (req, res) => {
  res.json(db.prepare("SELECT * FROM droidy ORDER BY id DESC").all());
});

app.post("/api/droidy", (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const { nazwa, typ, producent, rok_produkcji, status } = req.body;
  const info = db.prepare("INSERT INTO droidy (nazwa, typ, producent, rok_produkcji, status) VALUES (?,?,?,?,?)")
    .run(nazwa, typ, producent, rok_produkcji, status);
  res.status(201).json(db.prepare("SELECT * FROM droidy WHERE id=?").get(info.lastInsertRowid));
});

app.put("/api/droidy/:id", (req, res) => {
  const ex = db.prepare("SELECT * FROM droidy WHERE id=?").get(req.params.id);
  if (!ex) return res.status(404).json({ error: "Nie znaleziono droida" });
  const nowy = { ...ex, ...req.body };
  const errors = validate(nowy);
  if (errors.length) return res.status(400).json({ errors });
  db.prepare("UPDATE droidy SET nazwa=?, typ=?, producent=?, rok_produkcji=?, status=? WHERE id=?")
    .run(nowy.nazwa, nowy.typ, nowy.producent, nowy.rok_produkcji, nowy.status, req.params.id);
  res.json(db.prepare("SELECT * FROM droidy WHERE id=?").get(req.params.id));
});

app.delete("/api/droidy/:id", (req, res) => {
  const info = db.prepare("DELETE FROM droidy WHERE id=?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Nie znaleziono droida" });
  res.status(204).end();
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`✅ Serwer działa na http://localhost:${PORT}`));