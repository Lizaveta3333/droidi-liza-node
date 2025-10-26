const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database("./db/data.db");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function validate(body) {
  const errors = [];
  if (!body.nazwa) errors.push("Brak nazwy");
  if (!body.typ) errors.push("Brak typu");
  if (!body.producent) errors.push("Brak producenta");
  if (!body.rok_produkcji) errors.push("Brak roku produkcji");
  if (!body.status) errors.push("Brak statusu");
  return errors;
}

app.get("/api/droidy", (req, res) => {
  res.json(db.prepare("SELECT * FROM droidy").all());
});

app.post("/api/droidy", (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const { nazwa, typ, producent, rok_produkcji, status } = req.body;
  const info = db
    .prepare("INSERT INTO droidy (nazwa, typ, producent, rok_produkcji, status) VALUES (?,?,?,?,?)")
    .run(nazwa, typ, producent, rok_produkcji, status);
  res.status(201).json(db.prepare("SELECT * FROM droidy WHERE id=?").get(info.lastInsertRowid));
});

app.put("/api/droidy/:id", (req, res) => {
  const ex = db.prepare("SELECT * FROM droidy WHERE id=?").get(req.params.id);
  if (!ex) return res.status(404).json({ error: "Nie znaleziono droida" });
  const nowy = { ...ex, ...req.body };
  db.prepare(
    "UPDATE droidy SET nazwa=?, typ=?, producent=?, rok_produkcji=?, status=? WHERE id=?"
  ).run(nowy.nazwa, nowy.typ, nowy.producent, nowy.rok_produkcji, nowy.status, req.params.id);
  res.json(db.prepare("SELECT * FROM droidy WHERE id=?").get(req.params.id));
});

app.delete("/api/droidy/:id", (req, res) => {
  const info = db.prepare("DELETE FROM droidy WHERE id=?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Nie znaleziono droida" });
  res.status(204).end();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => console.log(`✅ Serwer działa na http://localhost:${PORT}`));
