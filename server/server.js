/* ==========================================================
   IT Asset Maintenance Register — backend server

   Stores the register in server/data/register.json and serves
   the frontend (the public/ folder) on the same address, so
   any computer on the office network can open one URL to both
   view the page and read/write the shared data.
   ========================================================== */

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Change this, or set ADMIN_PASSWORD as an environment variable
// before starting the server (recommended for shared deployments).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

const DATA_FILE = path.join(__dirname, "data", "register.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

/* ---------- very simple session tokens (kept in memory) ---------- */
const activeTokens = new Set();

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ error: "Please sign in again." });
  }
  next();
}

/* ---------- data file helpers ---------- */
function ensureDataFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

function readEntries() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    console.error("Could not read register data, starting empty:", err);
    return [];
  }
}

function writeEntries(entries) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
}

/* ---------- routes ---------- */

// Anyone can read the register (public, view-only).
app.get("/api/entries", (req, res) => {
  res.json(readEntries());
});

// Sign in with the shared password to get a session token.
app.post("/api/login", (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password." });
  }
  const token = crypto.randomBytes(24).toString("hex");
  activeTokens.add(token);
  res.json({ token });
});

app.post("/api/logout", requireAuth, (req, res) => {
  const token = req.headers.authorization.slice(7);
  activeTokens.delete(token);
  res.json({ ok: true });
});

// Add an entry — requires a valid session token.
app.post("/api/entries", requireAuth, (req, res) => {
  const { computer, oldPart, newPart, date, tech } = req.body || {};
  if (!computer || !oldPart || !newPart || !date || !tech) {
    return res.status(400).json({ error: "All fields are required." });
  }
  const entry = {
    id: "e" + Date.now() + Math.random().toString(16).slice(2, 6),
    computer: String(computer).trim(),
    oldPart: String(oldPart).trim(),
    newPart: String(newPart).trim(),
    date: String(date),
    tech: String(tech).trim(),
    createdAt: Date.now(),
  };
  const entries = readEntries();
  entries.push(entry);
  writeEntries(entries);
  res.status(201).json(entry);
});

// Delete an entry — requires a valid session token.
app.delete("/api/entries/:id", requireAuth, (req, res) => {
  const entries = readEntries();
  const stillThere = entries.filter((e) => e.id !== req.params.id);
  if (stillThere.length === entries.length) {
    return res.status(404).json({ error: "Entry not found." });
  }
  writeEntries(stillThere);
  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("IT Asset Maintenance Register server is running.");
  console.log(`  On this computer:   http://localhost:${PORT}`);
  console.log(`  On the office LAN:  http://<this computer's IP address>:${PORT}`);
  console.log("  (see README.md for how to find that IP address)");
});