"use client";
import DSButton from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useRef, useState } from "react";
import { useUpdateProfileMutation, OPEN_TO_OPTIONS, OPEN_TO_LABELS, type OpenToTag } from "@/lib/api/usersApi";
import { useAppDispatch } from "@/lib/hooks";
import { updateUser } from "@/lib/slices/authSlice";
import ImageCropper from "./ImageCropper";
import { Camera, X, Loader2, Handshake } from "lucide-react";

interface FounderProfile {
  name: string;
  bio?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  avatar?: string;
  banner?: string;
  openTo?: string[];
}



export default function EditProfileModal({ founder, onClose }: { founder: FounderProfile; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [form, setForm] = useState({
    name: founder.name || "",
    bio: founder.bio || "",
    twitter: founder.twitter || "",
    linkedin: founder.linkedin || "",
    website: founder.website || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(founder.avatar || "");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState(founder.banner || "");
  const [openTo, setOpenTo] = useState<OpenToTag[]>((founder.openTo as OpenToTag[]) || []);
  const [error, setError] = useState("");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [cropType, setCropType] = useState<"avatar" | "banner">("avatar");

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const toggleOpenTo = (tag: OpenToTag) =>
    setOpenTo(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleImageSelect = (type: "avatar" | "banner") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setTempImageUrl(url);
    setCropType(type);
    setCropperOpen(true);
  };

  const handleCropComplete = (croppedCanvas: HTMLCanvasElement) => {
    croppedCanvas.toBlob(blob => {
      if (blob) {
        const fileName = cropType === "avatar" ? "avatar.png" : "banner.png";
        const file = new File([blob], fileName, { type: "image/png" });
        const preview = URL.createObjectURL(file);

        if (cropType === "avatar") {
          setAvatarFile(file);
          setAvatarPreview(preview);
        } else {
          setBannerFile(file);
          setBannerPreview(preview);
        }
        setCropperOpen(false);
      }
    });
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) { setError("Name can't be empty"); return; }
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("bio", form.bio.trim());
      fd.append("twitter", form.twitter.trim());
      fd.append("linkedin", form.linkedin.trim());
      fd.append("website", form.website.trim());
      fd.append("openTo", JSON.stringify(openTo));
      if (avatarFile) fd.append("avatar", avatarFile);
      if (bannerFile) fd.append("banner", bannerFile);

      const { user } = await updateProfile(fd).unwrap();
      dispatch(updateUser({ name: user.name, avatar: user.avatar }));
      onClose();
    } catch (err: any) {
      setError(err?.data?.message || "Couldn't save changes. Try again.");
    }
  };

  return (
    <>
      {cropperOpen && tempImageUrl && (
        <ImageCropper
          imageSrc={tempImageUrl}
          onCrop={handleCropComplete}
          onClose={() => setCropperOpen(false)}
          aspectRatio={cropType === "avatar" ? 1 : 5 / 1}
          title={cropType === "avatar" ? "Crop profile photo" : "Crop banner"}
        />
      )}
      <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
        <Card padding="none" style={{position: "relative", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", padding: 24}}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: "var(--font-lg)", fontWeight: 700, letterSpacing: "-0.3px" }}>Edit profile</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "var(--radius-full)", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Banner */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", cursor: "pointer", position: "relative", marginBottom: 8 }}>
            <input type="file" accept="image/*" hidden onChange={handleImageSelect("banner")} />
            {bannerPreview ? (
              <img src={bannerPreview} alt="" style={{ width: "100%", height: 104, objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
            ) : (
              <div style={{ width: "100%", height: 104, borderRadius: "var(--radius-md)", background: "var(--bg-active)", border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                <div style={{ textAlign: "center", pointerEvents: "none" }}>
                  <Camera size={20} style={{ margin: "0 auto 6px", opacity: 0.5 }} />
                  <div style={{ fontSize: "var(--font-sm)", fontWeight: 600 }}>Click to add banner</div>
                </div>
              </div>
            )}
            {bannerPreview && (
              <div style={{
                position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%",
                background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.3)", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <Camera size={12} color="#fff" />
              </div>
            )}
          </label>
          <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>Recommended: 520x104px</div>
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <label style={{ position: "relative", cursor: "pointer" }}>
            <input type="file" accept="image/*" hidden onChange={handleImageSelect("avatar")} />
            {avatarPreview ? (
              <img src={avatarPreview} alt="" style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} />
            ) : (
              <div style={{ width: 84, height: 84, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--font-2xl)", fontWeight: 700, border: "2px solid var(--accent-border)" }}>
                {form.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{
              position: "absolute", bottom: -2, right: -2, width: 30, height: 30, borderRadius: "50%",
              background: "var(--accent)", border: "2px solid var(--bg-card)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <Camera size={13} color="#fff" />
            </div>
          </label>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="ds-label">Name</label>
            <input value={form.name} onChange={e => update("name", e.target.value)} className="ds-field" placeholder="Your name" />
          </div>
          <div>
            <label className="ds-label">Bio <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>({form.bio.length}/300)</span></label>
            <textarea value={form.bio} onChange={e => update("bio", e.target.value.slice(0, 300))} rows={3} className="ds-field" style={{ resize: "vertical"}} placeholder="Tell people what you're building" />
          </div>
          <div>
            <label className="ds-label">Twitter / X</label>
            <input value={form.twitter} onChange={e => update("twitter", e.target.value)} className="ds-field" placeholder="@yourhandle" />
          </div>
          <div>
            <label className="ds-label">LinkedIn</label>
            <input value={form.linkedin} onChange={e => update("linkedin", e.target.value)} className="ds-field" placeholder="linkedin.com/in/you" />
          </div>
          <div>
            <label className="ds-label">Website</label>
            <input value={form.website} onChange={e => update("website", e.target.value)} className="ds-field" placeholder="https://yoursite.com" />
          </div>
          <div>
            <label className="ds-label">
              <Handshake size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
              What are you open to?
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {OPEN_TO_OPTIONS.map(tag => {
                const active = openTo.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleOpenTo(tag)}
                    style={{
                      padding: "6px 12px", borderRadius: "var(--radius-lg)", fontSize: "var(--font-sm)", fontWeight: 600, cursor: "pointer",
                      background: active ? "var(--accent-dim)" : "var(--bg)",
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                      border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                    }}
                  >
                    {OPEN_TO_LABELS[tag]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && <p style={{ fontSize: "var(--font-sm)", color: "var(--red)", marginTop: 14 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <DSButton onClick={onClose} variant="outline" style={{flex: 1}}>
            Cancel
          </DSButton>
          <button onClick={handleSave} disabled={isLoading} style={{
            flex: 1, minHeight: 40, borderRadius: "var(--radius-full)", border: "none", background: "var(--accent)", color: "var(--accent-text)",
            fontSize: "var(--font-base)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: isLoading ? 0.75 : 1,
          }}>
            {isLoading && <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} />}
            {isLoading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </Card>
        <style jsx>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}
