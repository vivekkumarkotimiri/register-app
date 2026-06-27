/* ==========================================================
   UI HELPERS
   Small functions used to render the table, stats, and toast
   messages. No app state lives here — it just reads what it's
   given and updates the DOM.
   ========================================================== */

const el = (id) => document.getElementById(id);

function showToast(msg) {
  const toast = el("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Renders the table + stat cards from the given entries array.
function renderRegister(entries, isAdmin, query) {
  const tableBody = el("tableBody");
  query = (query || "").trim().toLowerCase();

  const filtered = entries
    .filter((e) => {
      if (!query) return true;
      return [e.computer, e.oldPart, e.newPart, e.tech].some((v) =>
        (v || "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || 0) - (a.createdAt || 0));

  el("actionsHeader").style.display = isAdmin ? "" : "none";

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr class="empty-row"><td colspan="6">${
      entries.length === 0 ? "No entries logged yet." : "No entries match your search."
    }</td></tr>`;
  } else {
    tableBody.innerHTML = filtered
      .map(
        (e) => `
      <tr>
        <td class="id-cell" data-label="Computer ID">${escapeHtml(e.computer)}</td>
        <td data-label="Old part"><span class="tag tag-old">${escapeHtml(e.oldPart)}</span></td>
        <td data-label="New part"><span class="tag tag-new">${escapeHtml(e.newPart)}</span></td>
        <td class="date-cell" data-label="Date">${formatDate(e.date)}</td>
        <td data-label="Technician">${escapeHtml(e.tech)}</td>
        ${
          isAdmin
            ? `<td class="col-actions" data-label="Actions"><button class="btn-danger" data-id="${e.id}">Delete</button></td>`
            : ""
        }
      </tr>`
      )
      .join("");
  }

  el("statTotal").textContent = entries.length;
  const monthKey = new Date().toISOString().slice(0, 7);
  el("statMonth").textContent = entries.filter((e) => (e.date || "").startsWith(monthKey)).length;
  el("statComputers").textContent = new Set(entries.map((e) => e.computer.toLowerCase())).size;
}
