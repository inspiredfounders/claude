import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useMyMentor } from "@/lib/useMyMentor";
import { SocialsEditor, type SocialLink } from "@/components/SocialsEditor";
import { Badge, Button, Card, EmptyState, ErrorState, Field, Input, PageHeader, Spinner, Textarea } from "@/components/ui";

export function MyProfile() {
  const { mentor, loading, error, reload } = useMyMentor();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [longBio, setLongBio] = useState("");
  const [expertise, setExpertise] = useState("");
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!mentor) return;
    setTitle(mentor.title);
    setLocation(mentor.location || "");
    setPhotoUrl(mentor.photo_url || "");
    setBio(mentor.bio);
    setLongBio(mentor.long_bio || "");
    setExpertise(mentor.expertise.join(", "));
    setSocials(Array.isArray(mentor.socials) ? (mentor.socials as unknown as SocialLink[]) : []);
    setAvailable(mentor.available);
  }, [mentor]);

  async function handleSave() {
    if (!mentor) return;
    if (!title.trim() || !bio.trim()) {
      setSaveError("Title and bio are required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    const { error: err } = await supabase
      .from("mentors")
      .update({
        title: title.trim(),
        location: location.trim() || null,
        photo_url: photoUrl.trim() || null,
        bio: bio.trim(),
        long_bio: longBio.trim() || null,
        expertise: expertise.split(",").map((e) => e.trim()).filter(Boolean),
        socials: socials.filter((s) => s.platform || s.handle || s.url),
        available,
      })
      .eq("id", mentor.id);
    setSaving(false);
    if (err) {
      setSaveError(err.message);
      return;
    }
    setSaved(true);
    reload();
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  if (!mentor) {
    return (
      <div>
        <PageHeader title="My Profile" />
        <EmptyState message="Your mentor profile hasn't been set up yet — contact an admin." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="This is what members see on your mentor profile."
        actions={<Badge tone={mentor.available ? "green" : "slate"}>{mentor.available ? "Available" : "Unavailable"}</Badge>}
      />

      <Card className="max-w-2xl p-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Field label="Photo URL">
              <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Bio (short)">
              <Textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Long bio">
              <Textarea rows={4} value={longBio} onChange={(e) => setLongBio(e.target.value)} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Expertise (comma-separated)">
              <Input value={expertise} onChange={(e) => setExpertise(e.target.value)} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Social links">
              <SocialsEditor value={socials} onChange={setSocials} />
            </Field>
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
              Available for new mentees
            </label>
          </div>
        </div>

        {saveError && (
          <div className="mt-4">
            <ErrorState message={saveError} />
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved && <span className="text-sm text-emerald-600">Saved.</span>}
        </div>
      </Card>
    </div>
  );
}
