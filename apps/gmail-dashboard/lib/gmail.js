const HEADER_NAMES = ["From", "Subject", "Date"];

function headerValue(headers, name) {
  const h = (headers || []).find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return h ? h.value : "";
}

function toSummary(message) {
  const headers = message.payload?.headers || [];
  return {
    id: message.id,
    threadId: message.threadId,
    from: headerValue(headers, "From"),
    subject: headerValue(headers, "Subject") || "(no subject)",
    date: headerValue(headers, "Date"),
    snippet: message.snippet || "",
    unread: (message.labelIds || []).includes("UNREAD"),
    starred: (message.labelIds || []).includes("STARRED"),
    labelIds: message.labelIds || [],
  };
}

// Fetches unread and/or starred messages currently in the inbox, newest
// first, deduplicated (a message can be both unread and starred).
export async function listInboxDigest(gmail, maxResults = 30) {
  const { data } = await gmail.users.messages.list({
    userId: "me",
    q: "(is:unread OR is:starred) in:inbox",
    maxResults,
  });

  const ids = (data.messages || []).map((m) => m.id);
  if (ids.length === 0) return [];

  const messages = await Promise.all(
    ids.map((id) =>
      gmail.users.messages.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: HEADER_NAMES,
      })
    )
  );

  return messages
    .map((res) => toSummary(res.data))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function archiveMessage(gmail, messageId) {
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: { removeLabelIds: ["INBOX"] },
  });
}

export async function listUserLabels(gmail) {
  const { data } = await gmail.users.labels.list({ userId: "me" });
  return (data.labels || [])
    .filter((l) => l.type === "user")
    .map((l) => ({ id: l.id, name: l.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function ensureLabelId(gmail, labelName) {
  const trimmed = labelName.trim();
  if (!trimmed) throw new Error("Label name is required");

  const existing = await listUserLabels(gmail);
  const match = existing.find(
    (l) => l.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (match) return match.id;

  const { data } = await gmail.users.labels.create({
    userId: "me",
    requestBody: {
      name: trimmed,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });
  return data.id;
}

export async function labelMessage(gmail, messageId, labelId) {
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: { addLabelIds: [labelId] },
  });
}
