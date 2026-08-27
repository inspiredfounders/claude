// The three Gmail accounts shown side by side on the dashboard.
// `key` is the identifier used in URLs and the token store — keep it stable.
export const ACCOUNTS = [
  {
    key: "inspiredfounders",
    email: "hello@inspiredfounders.com.au",
    label: "Inspired Founders",
    color: "#6366f1",
  },
  {
    key: "priscillaann",
    email: "priscilla@priscillaanncreative.com.au",
    label: "Priscilla Ann Creative",
    color: "#ec4899",
  },
  {
    key: "priscillaanncom",
    email: "hello@priscilla-ann.com",
    label: "Priscilla Ann",
    color: "#14b8a6",
  },
];

export function getAccount(key) {
  return ACCOUNTS.find((a) => a.key === key);
}
