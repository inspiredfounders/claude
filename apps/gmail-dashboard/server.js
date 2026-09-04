import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ACCOUNTS, getAccount } from "./lib/accounts.js";
import {
  buildAuthUrl,
  exchangeCodeForTokens,
  gmailFor,
} from "./lib/googleClient.js";
import { isConnected, clearTokens } from "./lib/tokenStore.js";
import {
  listInboxDigest,
  archiveMessage,
  listUserLabels,
  ensureLabelId,
  labelMessage,
} from "./lib/gmail.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Optional shared-password gate. Set DASHBOARD_PASSWORD to require it —
// useful if this ever runs somewhere other than your own machine.
if (process.env.DASHBOARD_PASSWORD) {
  app.use((req, res, next) => {
    const auth = req.headers.authorization || "";
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const [, pass] = Buffer.from(encoded, "base64").toString().split(":");
      if (pass === process.env.DASHBOARD_PASSWORD) return next();
    }
    res.set("WWW-Authenticate", 'Basic realm="Gmail Dashboard"');
    res.status(401).send("Authentication required");
  });
}

function requireEnv(res) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res
      .status(500)
      .json({ error: "Server is missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET. See README.md." });
    return false;
  }
  return true;
}

app.get("/api/accounts", (req, res) => {
  res.json(
    ACCOUNTS.map((a) => ({
      key: a.key,
      email: a.email,
      label: a.label,
      color: a.color,
      connected: isConnected(a.key),
    }))
  );
});

app.get("/auth/:accountKey", (req, res) => {
  if (!requireEnv(res)) return;
  const account = getAccount(req.params.accountKey);
  if (!account) return res.status(404).send("Unknown account");
  res.redirect(buildAuthUrl(account.key, account.email));
});

app.get("/auth/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return res.status(400).send(`Google returned an error: ${error}`);

  const account = getAccount(state);
  if (!account) return res.status(400).send("Unknown account in OAuth state");

  try {
    await exchangeCodeForTokens(account.key, code);
    res.redirect("/?connected=" + encodeURIComponent(account.key));
  } catch (err) {
    console.error("OAuth exchange failed:", err.message);
    res.status(500).send("Failed to complete Google sign-in: " + err.message);
  }
});

app.post("/api/accounts/:accountKey/disconnect", (req, res) => {
  const account = getAccount(req.params.accountKey);
  if (!account) return res.status(404).json({ error: "Unknown account" });
  clearTokens(account.key);
  res.json({ ok: true });
});

app.get("/api/emails/:accountKey", async (req, res) => {
  const account = getAccount(req.params.accountKey);
  if (!account) return res.status(404).json({ error: "Unknown account" });

  const gmail = gmailFor(account.key);
  if (!gmail) return res.status(409).json({ error: "Account not connected" });

  try {
    const emails = await listInboxDigest(gmail);
    res.json({ emails });
  } catch (err) {
    console.error(`Failed to list emails for ${account.key}:`, err.message);
    res.status(502).json({ error: err.message });
  }
});

app.get("/api/labels/:accountKey", async (req, res) => {
  const account = getAccount(req.params.accountKey);
  if (!account) return res.status(404).json({ error: "Unknown account" });

  const gmail = gmailFor(account.key);
  if (!gmail) return res.status(409).json({ error: "Account not connected" });

  try {
    const labels = await listUserLabels(gmail);
    res.json({ labels });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post("/api/emails/:accountKey/:messageId/archive", async (req, res) => {
  const account = getAccount(req.params.accountKey);
  if (!account) return res.status(404).json({ error: "Unknown account" });

  const gmail = gmailFor(account.key);
  if (!gmail) return res.status(409).json({ error: "Account not connected" });

  try {
    await archiveMessage(gmail, req.params.messageId);
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post("/api/emails/:accountKey/:messageId/label", async (req, res) => {
  const account = getAccount(req.params.accountKey);
  if (!account) return res.status(404).json({ error: "Unknown account" });

  const labelName = (req.body?.label || "").trim();
  if (!labelName) return res.status(400).json({ error: "label is required" });

  const gmail = gmailFor(account.key);
  if (!gmail) return res.status(409).json({ error: "Account not connected" });

  try {
    const labelId = await ensureLabelId(gmail, labelName);
    await labelMessage(gmail, req.params.messageId, labelId);
    res.json({ ok: true, labelId });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Gmail dashboard running at http://localhost:${port}`);
});
