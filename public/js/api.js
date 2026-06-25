/* ==========================================================
   API
   All communication with the backend server lives here.
   Everything else in the app calls these functions instead of
   using fetch() directly.
   ========================================================== */

async function apiGetEntries() {
  const res = await fetch(`${API_BASE}/api/entries`);
  if (!res.ok) throw new Error("Could not load the register from the server.");
  return res.json();
}

async function apiLogin(password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.token;
}

async function apiAddEntry(token, entry) {
  const res = await fetch(`${API_BASE}/api/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Could not save the entry.");
  }
  return res.json();
}

async function apiDeleteEntry(token, id) {
  const res = await fetch(`${API_BASE}/api/entries/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Could not delete the entry.");
  }
  return res.json();
}
