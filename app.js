/* ==========================================================
   APP
   Holds app state and wires up every button/input on the page.
   Talks to the backend via the functions in api.js, and renders
   via the functions in ui.js.
   ========================================================== */

let entries = [];
let isAdmin = false;
let authToken = null;

function render() {
  renderRegister(entries, isAdmin, el("searchInput").value);
}

async function refreshEntries() {
  try {
    entries = await apiGetEntries();
    render();
  } catch (err) {
    showToast("Can't reach the server — is it running?");
  }
}

/* ---------- Add entry ---------- */
async function saveEntry() {
  const computer = el("f-computer").value.trim();
  const oldPart = el("f-old").value.trim();
  const newPart = el("f-new").value.trim();
  const date = el("f-date").value;
  const tech = el("f-tech").value.trim();

  if (!computer || !oldPart || !newPart || !date || !tech) {
    el("formError").style.display = "block";
    return;
  }
  el("formError").style.display = "none";

  try {
    await apiAddEntry(authToken, { computer, oldPart, newPart, date, tech });
    await refreshEntries();
    clearForm();
    showToast("Entry saved.");
  } catch (err) {
    showToast(err.message);
  }
}

function clearForm() {
  ["f-computer", "f-old", "f-new", "f-date", "f-tech"].forEach((id) => (el(id).value = ""));
  el("formError").style.display = "none";
}

/* ---------- Delete entry ---------- */
async function deleteEntry(id) {
  if (!confirm("Delete this register entry? This cannot be undone.")) return;
  try {
    await apiDeleteEntry(authToken, id);
    await refreshEntries();
    showToast("Entry deleted.");
  } catch (err) {
    showToast(err.message);
  }
}

el("tableBody").addEventListener("click", (ev) => {
  const btn = ev.target.closest("button[data-id]");
  if (btn && isAdmin) deleteEntry(btn.dataset.id);
});

/* ---------- Login / logout ---------- */
function setAdminMode(on) {
  isAdmin = on;
  el("addTicket").style.display = on ? "" : "none";
  el("modePill").className = "pill " + (on ? "pill-admin" : "pill-public");
  el("modePill").innerHTML = `<span class="dot"></span>${on ? "Signed in — editing enabled" : "Public view"}`;
  el("loginBtn").textContent = on ? "Sign out" : "Sign in";
  render();
}

el("loginBtn").addEventListener("click", () => {
  if (isAdmin) {
    isAdmin = false;
    authToken = null;
    setAdminMode(false);
    showToast("Signed out.");
  } else {
    el("loginOverlay").classList.remove("hidden");
    el("loginPassword").value = "";
    el("loginError").style.display = "none";
    el("loginPassword").focus();
  }
});

el("cancelLoginBtn").addEventListener("click", () => el("loginOverlay").classList.add("hidden"));
el("confirmLoginBtn").addEventListener("click", attemptLogin);
el("loginPassword").addEventListener("keydown", (e) => {
  if (e.key === "Enter") attemptLogin();
});

async function attemptLogin() {
  const token = await apiLogin(el("loginPassword").value);
  if (token) {
    authToken = token;
    el("loginOverlay").classList.add("hidden");
    setAdminMode(true);
    showToast("Signed in.");
  } else {
    el("loginError").style.display = "block";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") el("loginOverlay").classList.add("hidden");
});

/* ---------- Misc UI wiring ---------- */
el("ticketToggle").addEventListener("click", () => {
  el("ticketBody").classList.toggle("hidden");
  el("ticketToggle").classList.toggle("collapsed");
});
el("saveEntryBtn").addEventListener("click", saveEntry);
el("clearFormBtn").addEventListener("click", clearForm);
el("searchInput").addEventListener("input", render);

el("printBtn").addEventListener("click", () => {
  el("printDate").textContent =
    "Exported on " +
    new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) +
    " · " + entries.length + " entries";
  window.print();
});

/* ---------- Init ---------- */
refreshEntries();
// Keep the view in sync with what other computers add/delete.
setInterval(refreshEntries, 15000);
