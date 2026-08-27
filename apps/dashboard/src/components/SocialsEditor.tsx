import { Button, Input } from "@/components/ui";

export interface SocialLink {
  platform: string;
  handle: string;
  url: string;
  // Index signature so this satisfies the `Json` type when saved to the
  // mentors.socials jsonb column.
  [key: string]: string;
}

/** Repeatable platform + handle + url rows, stored as the mentor's `socials` jsonb array. */
export function SocialsEditor({ value, onChange }: { value: SocialLink[]; onChange: (next: SocialLink[]) => void }) {
  function update(i: number, field: "platform" | "handle" | "url", fieldValue: string) {
    onChange(value.map((s, idx) => (idx === i ? { ...s, [field]: fieldValue } : s)));
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...value, { platform: "", handle: "", url: "" }]);
  }

  return (
    <div className="space-y-2">
      {value.map((s, i) => (
        <div key={i} className="flex gap-2">
          <Input placeholder="Platform (e.g. LinkedIn)" value={s.platform} onChange={(e) => update(i, "platform", e.target.value)} className="w-32" />
          <Input placeholder="Handle" value={s.handle} onChange={(e) => update(i, "handle", e.target.value)} className="w-32" />
          <Input placeholder="URL" value={s.url} onChange={(e) => update(i, "url", e.target.value)} />
          <Button type="button" variant="ghost" onClick={() => remove(i)}>
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={add}>
        + Add social link
      </Button>
    </div>
  );
}
