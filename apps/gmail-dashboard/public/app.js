const columnsEl = document.getElementById("columns");
const columnTemplate = document.getElementById("column-template");
const emailTemplate = document.getElementById("email-template");
const labelOptions = document.getElementById("label-options");

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function renderEmail(email, account) {
  const node = emailTemplate.content.cloneNode(true);
  const article = node.querySelector(".email");
  article.dataset.id = email.id;
  if (email.unread) article.classList.add("is-unread");
  if (email.starred) article.classList.add("is-starred");

  node.querySelector(".email-from").textContent = email.from;
  node.querySelector(".email-subject").textContent = email.subject;
  node.querySelector(".email-snippet").textContent = email.snippet;

  const archiveBtn = node.querySelector(".archive-btn");
  archiveBtn.addEventListener("click", async () => {
    archiveBtn.disabled = true;
    try {
      await fetchJSON(`/api/emails/${account.key}/${email.id}/archive`, {
        method: "POST",
      });
      article.remove();
    } catch (err) {
      alert(`Couldn't archive: ${err.message}`);
      archiveBtn.disabled = false;
    }
  });

  const labelInput = node.querySelector(".label-input");
  const labelBtn = node.querySelector(".label-btn");
  labelBtn.addEventListener("click", async () => {
    const label = labelInput.value.trim();
    if (!label) return;
    labelBtn.disabled = true;
    try {
      await fetchJSON(`/api/emails/${account.key}/${email.id}/label`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      labelInput.value = "";
      labelBtn.textContent = "Applied";
      setTimeout(() => (labelBtn.textContent = "Apply"), 1200);
    } catch (err) {
      alert(`Couldn't apply label: ${err.message}`);
    } finally {
      labelBtn.disabled = false;
    }
  });

  return node;
}

async function loadEmailsInto(bodyEl, account) {
  bodyEl.innerHTML = '<p class="loading">Loading…</p>';
  try {
    const { emails } = await fetchJSON(`/api/emails/${account.key}`);
    bodyEl.innerHTML = "";
    if (emails.length === 0) {
      bodyEl.innerHTML = '<p class="empty">No unread or flagged emails.</p>';
      return;
    }
    for (const email of emails) {
      bodyEl.appendChild(renderEmail(email, account));
    }
  } catch (err) {
    bodyEl.innerHTML = `<p class="empty">Couldn't load: ${escapeHtml(err.message)}</p>`;
  }
}

async function loadLabelOptions(accounts) {
  const connected = accounts.find((a) => a.connected);
  if (!connected) return;
  try {
    const { labels } = await fetchJSON(`/api/labels/${connected.key}`);
    labelOptions.innerHTML = labels
      .map((l) => `<option value="${escapeHtml(l.name)}"></option>`)
      .join("");
  } catch {
    // Non-fatal — the label input still works without autocomplete.
  }
}

function renderColumn(account) {
  const node = columnTemplate.content.cloneNode(true);
  const section = node.querySelector(".column");
  section.dataset.key = account.key;
  node.querySelector(".dot").style.background = account.color;
  node.querySelector(".column-label").textContent = account.label;
  node.querySelector(".column-email").textContent = account.email;

  const connectBtn = node.querySelector(".connect-btn");
  const bodyEl = node.querySelector(".column-body");

  if (account.connected) {
    connectBtn.textContent = "Connected";
    connectBtn.classList.add("btn-ghost");
    connectBtn.disabled = true;
    loadEmailsInto(bodyEl, account);
  } else {
    connectBtn.textContent = "Connect";
    connectBtn.classList.add("btn-primary");
    connectBtn.addEventListener("click", () => {
      window.location.href = `/auth/${account.key}`;
    });
    bodyEl.innerHTML =
      '<p class="empty">Not connected yet. Click "Connect" and sign in with this Gmail account.</p>';
  }

  return section;
}

async function init() {
  columnsEl.innerHTML = '<p class="loading">Loading accounts…</p>';
  const accounts = await fetchJSON("/api/accounts");
  columnsEl.innerHTML = "";
  for (const account of accounts) {
    columnsEl.appendChild(renderColumn(account));
  }
  loadLabelOptions(accounts);
}

document.getElementById("refresh-btn").addEventListener("click", init);

init();
