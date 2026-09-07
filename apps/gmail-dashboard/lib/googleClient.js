import { google } from "googleapis";
import { getTokens, saveTokens } from "./tokenStore.js";

const SCOPES = [
  // Single scope covers reading messages, archiving (removing labels) and
  // adding/creating labels — everything the dashboard needs.
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email",
];

function baseClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function buildAuthUrl(accountKey, loginHintEmail) {
  const client = baseClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent select_account",
    scope: SCOPES,
    login_hint: loginHintEmail,
    state: accountKey,
  });
}

export async function exchangeCodeForTokens(accountKey, code) {
  const client = baseClient();
  const { tokens } = await client.getToken(code);
  saveTokens(accountKey, tokens);
  return tokens;
}

// Returns an authenticated OAuth2 client for the account, wired so a
// silent token refresh gets persisted back to the token store.
export function getAuthorizedClient(accountKey) {
  const tokens = getTokens(accountKey);
  if (!tokens || !tokens.refresh_token) return null;

  const client = baseClient();
  client.setCredentials(tokens);
  client.on("tokens", (newTokens) => {
    saveTokens(accountKey, newTokens);
  });
  return client;
}

export function gmailFor(accountKey) {
  const auth = getAuthorizedClient(accountKey);
  if (!auth) return null;
  return google.gmail({ version: "v1", auth });
}
