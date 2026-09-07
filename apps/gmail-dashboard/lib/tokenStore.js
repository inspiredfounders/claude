import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const TOKENS_FILE = path.join(DATA_DIR, "tokens.json");

function readAll() {
  if (!fs.existsSync(TOKENS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeAll(tokensByAccount) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokensByAccount, null, 2), {
    mode: 0o600,
  });
}

export function getTokens(accountKey) {
  return readAll()[accountKey] || null;
}

export function saveTokens(accountKey, tokens) {
  const all = readAll();
  // Google only returns refresh_token on the *first* consent grant, so
  // preserve the existing one if a later exchange/refresh omits it.
  const existing = all[accountKey] || {};
  all[accountKey] = { ...existing, ...tokens };
  writeAll(all);
  return all[accountKey];
}

export function clearTokens(accountKey) {
  const all = readAll();
  delete all[accountKey];
  writeAll(all);
}

export function isConnected(accountKey) {
  const tokens = getTokens(accountKey);
  return Boolean(tokens && tokens.refresh_token);
}
