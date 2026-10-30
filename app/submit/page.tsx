"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import RequireAuth from "@/components/auth/RequireAuth";
import { useLazyScrapeUrlQuery, useLazyCheckBadgeOnSiteQuery } from "@/lib/api/scrapeApi";
import { useSubmitProductMutation, useGetProductQuery, useUpdateProductMutation } from "@/lib/api/productsApi";
import { useVerifyBadgeMutation } from "@/lib/api/badgesApi";
import { useCreateCheckoutMutation, useLazyGetPaymentStatusQuery } from "@/lib/api/paymentsApi";
import { openPaddleCheckout } from "@/lib/paddle";
import { useToast } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";
import AchievementIcon from "@/components/profile/AchievementIcon";
import { Link2, CheckCircle, ImageIcon, Plus, Check, Copy, Shield, AlertCircle, Clock, X, CreditCard, Loader2 } from "lucide-react";

const CREATE_STEPS = ["Basics", "Details", "Media", "Plan", "Badge"];
const EDIT_STEPS = ["Basics", "Details", "Media", "Badge"];
const categories = ["AI", "Dev Tools", "Analytics", "Design", "Productivity", "Marketing", "Finance", "HR", "Legal", "Other"];
const plans = [
  {
    key: "free", name: "Free", price: "$0", period: "forever", cta: "Verify backlink first",
    features: [
      { text: "Get a dofollow link after badge verification", included: true },
      { text: "Listing and traffic forever", included: true },
      { text: "Community upvotes & comments", included: true },
      { text: "Backlink to our site required", included: false },
      { text: "No priority review", included: false },
      { text: "No featured placement", included: false },
    ],
  },
  {
    key: "starter", name: "Starter", price: "$9.80", period: "one-time", popular: true, cta: "Pay & publish right now",
    features: [
      { text: "All benefits of Free plan", included: true },
      { text: "Verified badge on your listing", included: true },
      { text: "Backlink to our site optional", included: true },
      { text: "Priority review — listed within 48h", included: true },
      { text: "No featured homepage placement", included: false },
      { text: "No newsletter shoutout", included: false },
    ],
  },
  {
    key: "pro", name: "Pro", price: "$79", period: "one-time", cta: "Pay & publish right now",
    features: [
      { text: "All benefits of Starter plan", included: true },
      { text: "Featured homepage placement (30 days)", included: true },
      { text: "Newsletter mention", included: true },
      { text: "Category page spotlight", included: true },
      { text: "Premium support", included: true },
    ],
  },
];

const BADGE_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:5000";
const BADGE_SNIPPET = `<a href="https://onlyfounders.site" target="_blank" rel="noopener" data-onlyfounders-badge="verified">
  <img src="${BADGE_API_URL}/api/badge.svg" alt="Featured on OnlyFounders" width="180" height="44" />
</a>`;

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 13px", border: "1px solid var(--border)", borderRadius: 8,
  fontSize: 13, color: "var(--text)", outline: "none", background: "var(--bg)", boxSizing: "border-box",
};

export default function SubmitPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <SubmitForm />
      </Suspense>
    </RequireAuth>
  );
}

function SubmitForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const me = useAppSelector(s => s.auth.user);
  const initialPlan = searchParams.get("plan");
  const editSlug = searchParams.get("edit");
  const isEditMode = !!editSlug;
  const steps = isEditMode ? EDIT_STEPS : CREATE_STEPS;
  const [step, setStep] = useState(0);
  const stepKey = steps[step];
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeError, setScrapeError] = useState("");
  const [scraped, setScraped] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(
    initialPlan === "starter" || initialPlan === "pro" ? initialPlan : "free"
  );
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState<{
    slug: string;
    name: string;
    isDraft: boolean;
    plan: "free" | "starter" | "pro";
    productId?: string;
    paymentStatus?: "pending" | "confirming" | "completed" | "failed";
  } | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [badgeVerified, setBadgeVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "", tagline: "", url: "", category: "", tags: "",
    description: "", pricing: "Freemium", logo: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const [triggerScrape, { isFetching: isScraping }] = useLazyScrapeUrlQuery();
  const [triggerVerify, { isFetching: isVerifying }] = useLazyCheckBadgeOnSiteQuery();
  const [submitProduct, { isLoading: isSubmitting }] = useSubmitProductMutation();
  const [createCheckout, { isLoading: isStartingCheckout }] = useCreateCheckoutMutation();
  const [triggerPaymentStatus] = useLazyGetPaymentStatusQuery();
  const { push: pushToast } = useToast();

  // Edit mode: reuses this same screen instead of a separate modal — loads
  // the existing product, prefills the form once, and swaps the final step's
  // action from "launch" to "save changes" (see isEditMode branches below).
  const { data: editData, isLoading: isLoadingEdit, isError: isEditError } = useGetProductQuery(editSlug ?? "", { skip: !editSlug });
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();
  const [verifyProductBadge, { isLoading: isVerifyingProductBadge }] = useVerifyBadgeMutation();
  const editProduct = editData?.product;
  const canEditThis = !isEditMode || (!!editProduct && !!me && (
    me.role === "admin" || (editProduct.makers ?? []).some((m: any) => m._id === me.id)
  ));
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!editProduct || hydratedRef.current) return;
    hydratedRef.current = true;
    setForm({
      name: editProduct.name ?? "",
      tagline: editProduct.tagline ?? "",
      url: editProduct.website ?? "",
      category: editProduct.category ?? "",
      tags: (editProduct.tags ?? []).join(", "),
      description: editProduct.description ?? "",
      pricing: editProduct.pricing ?? "Freemium",
      logo: editProduct.logo ?? "",
    });
    setLogoPreview(editProduct.logo ?? "");
    setBadgeVerified(editProduct.hasBadge === true);
  }, [editProduct]);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setScrapeError("");
    try {
      const result = await triggerScrape(scrapeUrl.trim()).unwrap();
      setForm(f => ({
        ...f,
        name: result.name || f.name,
        tagline: result.tagline || f.tagline,
        description: result.description || f.description,
        url: result.website || f.url,
        logo: result.logo || f.logo,
      }));
      setLogoLoadFailed(false);
      setScraped(true);
    } catch {
      setScrapeError("Could not import from that URL — the site may block automated requests. Fill in the fields below manually.");
    }
  };

  const handleCopyBadge = () => {
    navigator.clipboard.writeText(BADGE_SNIPPET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleVerifyBadge = async () => {
    setVerifyError("");
    setBadgeVerified(false);
    const url = form.url.trim();
    if (!url) { setVerifyError("No website URL found. Go back to step 1 and add your URL."); return; }
    try {
      const result = await triggerVerify(url).unwrap();
      if (result.verified) {
        setBadgeVerified(true);
      } else {
        setVerifyError("Badge not found on your website. Make sure you saved the page after adding the code.");
      }
    } catch {
      setVerifyError("Could not reach your website. Check the URL and try again.");
    }
  };

  // Edit mode's Verify button — unlike handleVerifyBadge (a generic
  // "does this URL have the marker" check used before a product exists),
  // this hits the real per-product endpoint, which also publishes the
  // listing if it was still a draft/pending review.
  const handleVerifyProductBadge = async () => {
    setVerifyError("");
    if (!editSlug) return;
    try {
      const result = await verifyProductBadge(editSlug).unwrap();
      if (result.verified) {
        setBadgeVerified(true);
        if (result.published) {
          pushToast({ title: "Listing published!", description: `${form.name || "Your product"} is now live on OnlyFounders.` });
        }
      } else {
        setVerifyError(result.message || "Badge not found on your website. Make sure you saved the page after adding the code.");
      }
    } catch (err: any) {
      setVerifyError(err?.data?.message || "Could not reach your website. Check the URL and try again.");
    }
  };

  const handleSaveEdit = async () => {
    setSubmitError("");
    if (!editProduct?._id) return;
    if (!form.name.trim() || !form.tagline.trim() || !form.description.trim() || !form.url.trim()) {
      setSubmitError("Name, tagline, description, and website are required.");
      return;
    }
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("tagline", form.tagline.trim());
    fd.append("description", form.description.trim());
    fd.append("website", form.url.trim());
    fd.append("category", form.category);
    fd.append("tags", form.tags);
    fd.append("pricing", form.pricing);
    if (logoFile) fd.append("logo", logoFile);
    else if (form.logo) fd.append("logoUrl", form.logo);

    try {
      const res = await updateProduct({ id: editProduct._id, formData: fd }).unwrap();
      pushToast({ title: "Changes saved", description: `${res.product.name} has been updated.` });
      router.push(`/products/${res.product.slug}`);
    } catch (err: any) {
      setSubmitError(err?.data?.message || "Couldn't save changes. Please try again.");
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return "Product name is required.";
      if (!form.tagline.trim()) return "Tagline is required.";
      if (!form.url.trim()) return "Website URL is required.";
      if (!form.category) return "Please pick a category.";
    }
    if (step === 1) {
      if (!form.description.trim()) return "Description is required.";
    }
    return "";
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setSubmitError(err); return; }
    setSubmitError("");
    setStep(s => s + 1);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoLoadFailed(false);
    update("logo", "");
  };

  const handleAddScreenshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    const remaining = 5 - screenshotFiles.length;
    if (remaining <= 0) return;
    const toAdd = incoming.slice(0, remaining);
    setScreenshotFiles(prev => [...prev, ...toAdd]);
    setScreenshotPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleReplaceScreenshot = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFiles(prev => prev.map((f, i) => i === idx ? file : f));
    setScreenshotPreviews(prev => prev.map((src, i) => i === idx ? URL.createObjectURL(file) : src));
    e.target.value = "";
  };

  const handleRemoveScreenshot = (idx: number) => {
    setScreenshotFiles(prev => prev.filter((_, i) => i !== idx));
    setScreenshotPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Runs the Paddle checkout overlay for a just-created product, then polls
  // for the webhook confirmation (payment perks are only applied server-side
  // once that lands — see backend/src/routes/payments.js).
  const payForProduct = async (productId: string, plan: "starter" | "pro") => {
    setPaymentError("");
    try {
      const checkout = await createCheckout({ productId, plan }).unwrap();
      const outcome = await openPaddleCheckout({ priceId: checkout.priceId, customData: checkout.customData });

      if (outcome === "closed") {
        setPaymentError("Checkout was closed before payment completed. Your listing is live on the Free plan — you can finish upgrading any time.");
        setSubmitted(s => (s ? { ...s, paymentStatus: "pending" } : s));
        return;
      }

      setSubmitted(s => (s ? { ...s, paymentStatus: "confirming" } : s));
      for (let attempt = 0; attempt < 10; attempt++) {
        await new Promise(r => setTimeout(r, 1500));
        const status = await triggerPaymentStatus(checkout.paymentId).unwrap();
        if (status.status === "completed") {
          setSubmitted(s => (s ? { ...s, paymentStatus: "completed" } : s));
          return;
        }
      }
      // Still pending after ~15s — webhook is probably just slow, not failed.
      setSubmitted(s => (s ? { ...s, paymentStatus: "pending" } : s));
    } catch (err: any) {
      setPaymentError(err?.data?.message || err?.message || "Payment failed. You can retry below.");
      setSubmitted(s => (s ? { ...s, paymentStatus: "failed" } : s));
    }
  };

  const doSubmit = async (asDraft: boolean) => {
    setSubmitError("");
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("tagline", form.tagline.trim());
    fd.append("description", form.description.trim());
    fd.append("website", form.url.trim());
    fd.append("category", form.category);
    fd.append("tags", form.tags);
    fd.append("pricing", form.pricing);
    fd.append("plan", selectedPlan);
    fd.append("status", asDraft ? "draft" : "approved");
    if (logoFile) fd.append("logo", logoFile);
    else if (form.logo) fd.append("logoUrl", form.logo);
    screenshotFiles.forEach(f => fd.append("screenshots", f));

    try {
      const result = await submitProduct(fd).unwrap();
      const plan = (result.plan as "free" | "starter" | "pro") || "free";

      for (const a of result.unlockedAchievements ?? []) {
        pushToast({ title: `Achievement unlocked: ${a.label}`, description: a.description, icon: <AchievementIcon name={a.icon} size={18} style={{ color: "var(--accent)" }} /> });
      }

      if (asDraft || plan === "free") {
        setSubmitted({ slug: result.product.slug, name: result.product.name, isDraft: asDraft, plan: "free" });
        return;
      }

      setSubmitted({
        slug: result.product.slug,
        name: result.product.name,
        isDraft: false,
        plan,
        productId: result.product._id,
        paymentStatus: "pending",
      });
      await payForProduct(result.product._id, plan);
    } catch (err: any) {
      setSubmitError(err?.data?.message || "Submission failed. Please try again.");
    }
  };

  if (submitted) {
    return (
      <AppShell title="Submit product">
        <div style={{ maxWidth: 520, margin: "80px auto", padding: 24, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: submitted.isDraft ? "var(--bg-active)" : "var(--accent-dim)", border: `2px solid ${submitted.isDraft ? "var(--border-hover)" : "var(--accent-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            {submitted.isDraft
              ? <Clock size={28} style={{ color: "var(--text-secondary)" }} />
              : <CheckCircle size={28} style={{ color: "var(--accent)" }} />}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 8 }}>
            {submitted.isDraft ? "Saved as draft" : "You're live!"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 28 }}>
            {submitted.isDraft
              ? <>
                  <strong style={{ color: "var(--text)" }}>{submitted.name}</strong> is saved as a draft. Add the OnlyFounders badge to your website and verify to publish.
                </>
              : <>
                  <strong style={{ color: "var(--text)" }}>{submitted.name}</strong> is now listed on OnlyFounders.
                </>}
          </p>

          {submitted.plan !== "free" && !submitted.isDraft && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12, textAlign: "left",
              padding: "14px 16px", marginBottom: 24, borderRadius: 10,
              background: submitted.paymentStatus === "completed" ? "rgba(34,197,94,0.06)" : "var(--bg-card)",
              border: `1px solid ${submitted.paymentStatus === "completed" ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
            }}>
              {submitted.paymentStatus === "completed" ? (
                <CheckCircle size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
              ) : submitted.paymentStatus === "confirming" ? (
                <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent)", flexShrink: 0 }} />
              ) : (
                <CreditCard size={18} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                  {submitted.paymentStatus === "completed"
                    ? `${submitted.plan === "pro" ? "Pro" : "Starter"} plan active`
                    : submitted.paymentStatus === "confirming"
                    ? "Confirming payment…"
                    : "Payment not completed yet"}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {submitted.paymentStatus === "completed"
                    ? "Your upgrade perks are live on this listing."
                    : submitted.paymentStatus === "confirming"
                    ? "This can take a few seconds after checkout."
                    : paymentError || "You can finish the upgrade whenever you're ready — your listing stays live either way."}
                </p>
              </div>
              {(submitted.paymentStatus === "pending" || submitted.paymentStatus === "failed") && submitted.productId && (
                <button
                  onClick={() => payForProduct(submitted.productId!, submitted.plan as "starter" | "pro")}
                  disabled={isStartingCheckout}
                  style={{ padding: "7px 14px", fontSize: 12.5, fontWeight: 700, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {isStartingCheckout ? "Opening…" : "Pay now"}
                </button>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {!submitted.isDraft && (
              <Link href={`/products/${submitted.slug}`} style={{ padding: "9px 22px", background: "var(--accent)", color: "#fff", borderRadius: 9, fontSize: 13.5, fontWeight: 700 }}>
                View listing
              </Link>
            )}
            <Link href="/launchpad" style={{ padding: "9px 22px", border: "1px solid var(--border)", borderRadius: 9, fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)" }}>
              Back to launchpad
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (isEditMode && isLoadingEdit) {
    return (
      <AppShell title="Edit product">
        <div style={{ padding: 24, maxWidth: 620, margin: "0 auto" }}>
          <div className="fp-skeleton" style={{ height: 400, borderRadius: "var(--radius-lg)" }} />
        </div>
      </AppShell>
    );
  }

  if (isEditMode && (isEditError || !editProduct || !canEditThis)) {
    return (
      <AppShell title="Edit product">
        <div style={{ padding: 60, textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
            {isEditError || !editProduct ? "Product not found." : "You don't have permission to edit this product."}
          </p>
          <Link href="/launchpad" style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>Back to launchpad</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={isEditMode ? "Edit product" : "Submit product"}>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 5 }}>
            {isEditMode ? "Edit your product" : "Submit your product"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {isEditMode ? "Update your listing details, then verify to publish if it isn't live yet" : "Share what you're building with thousands of founders"}
          </p>
        </div>

        {/* URL scraper — creation-only shortcut, not relevant once a product exists */}
        {!isEditMode && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 18, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Link2 size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Import from URL</span>
            <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginLeft: 2 }}>— auto-fill from your website</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={scrapeUrl}
              onChange={e => { setScrapeUrl(e.target.value); setScraped(false); setScrapeError(""); }}
              onKeyDown={e => e.key === "Enter" && handleScrape()}
              placeholder="https://yourproduct.com"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={handleScrape} disabled={isScraping || !scrapeUrl.trim()} style={{
              padding: "9px 18px", fontSize: 13, fontWeight: 700, borderRadius: 8, border: "none",
              background: isScraping || !scrapeUrl.trim() ? "var(--bg-active)" : "var(--accent)",
              color: isScraping || !scrapeUrl.trim() ? "var(--text-tertiary)" : "#fff",
              cursor: isScraping || !scrapeUrl.trim() ? "default" : "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {isScraping ? "Fetching…" : "Fetch details"}
            </button>
          </div>
          {scrapeError && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>{scrapeError}</p>}
          {scraped && !scrapeError && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <CheckCircle size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Details imported — review and edit below</span>
            </div>
          )}
        </div>
        )}

        {/* Progress steps */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, alignItems: "center" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: i < step ? "pointer" : "default" }} onClick={() => { if (i < step) { setSubmitError(""); setStep(i); } }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: i < step ? "var(--accent)" : i === step ? "var(--bg-active)" : "var(--bg-card)",
                  color: i <= step ? (i < step ? "#fff" : "var(--text)") : "var(--text-tertiary)",
                  border: i === step ? "1px solid var(--border-hover)" : "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className="step-label" style={{ fontSize: 12.5, fontWeight: 500, color: i === step ? "var(--text)" : "var(--text-tertiary)", whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: i < step ? "var(--accent)" : "var(--border)", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
          <style jsx>{`
            @media (max-width: 480px) {
              .step-label { display: none; }
            }
          `}</style>
        </div>

        {/* Form card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }}>

          {/* Step 0 — Basics */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Basic information</h2>
              {[
                { label: "Product name *", field: "name", placeholder: "e.g. AutoCRM", type: "text" },
                { label: "Tagline *", field: "tagline", placeholder: "Short, punchy description (under 60 chars)", type: "text" },
                { label: "Website URL *", field: "url", placeholder: "https://yourproduct.com", type: "url" },
              ].map(item => (
                <div key={item.field}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-secondary)" }}>{item.label}</label>
                  <input
                    type={item.type}
                    value={(form as Record<string, string>)[item.field]}
                    onChange={e => update(item.field, e.target.value)}
                    placeholder={item.placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>Category *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => update("category", cat)} style={{
                      padding: "5px 13px", fontSize: 12, fontWeight: 500,
                      border: form.category === cat ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                      borderRadius: 20, cursor: "pointer",
                      background: form.category === cat ? "var(--accent-dim)" : "var(--bg)",
                      color: form.category === cat ? "var(--accent)" : "var(--text-secondary)",
                    }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Tell us more</h2>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-secondary)" }}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Describe your product — what it does, who it's for, why it's different"
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>Pricing model</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["Free", "Freemium", "Paid", "Open source"].map(p => (
                    <button key={p} onClick={() => update("pricing", p)} style={{
                      padding: "6px 14px", fontSize: 12, fontWeight: 500,
                      border: form.pricing === p ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                      borderRadius: 8, cursor: "pointer",
                      background: form.pricing === p ? "var(--accent-dim)" : "var(--bg)",
                      color: form.pricing === p ? "var(--accent)" : "var(--text-secondary)",
                    }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-secondary)" }}>Tags <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(comma separated)</span></label>
                <input value={form.tags} onChange={e => update("tags", e.target.value)} placeholder="AI, CRM, Sales automation" style={inputStyle} />
              </div>
            </div>
          )}

          {/* Step 2 — Media */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Media</h2>

              {/* Logo */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 7, color: "var(--text-secondary)" }}>
                  Logo <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>— square PNG or JPG, min 200×200px</span>
                </label>
                <label style={{ display: "block", cursor: "pointer" }}>
                  <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleLogoChange} />
                  {logoPreview || form.logo ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {logoLoadFailed ? (
                          <ImageIcon size={22} style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
                        ) : (
                          <img src={logoPreview || form.logo} width={52} height={52} alt="" style={{ objectFit: "contain" }} onError={() => setLogoLoadFailed(true)} onLoad={() => setLogoLoadFailed(false)} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: 12.5, fontWeight: 600, color: logoLoadFailed ? "var(--red)" : "var(--accent)", marginBottom: 3 }}>
                          {logoLoadFailed ? "Couldn't load this image" : logoFile ? logoFile.name : "Logo from your site"}
                        </p>
                        <p style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{logoLoadFailed ? "Click to choose a different file" : "Click to replace"}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 28, textAlign: "center", background: "var(--bg)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-border)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
                    >
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                        <ImageIcon size={26} style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 2 }}>
                        Drop file or <span style={{ color: "var(--accent)", fontWeight: 600 }}>browse</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>PNG, JPG, WebP — max 5 MB</div>
                    </div>
                  )}
                </label>
                {(logoPreview || form.logo) && (
                  <button onClick={() => { setLogoFile(null); setLogoPreview(""); setLogoLoadFailed(false); update("logo", ""); }} style={{ marginTop: 6, fontSize: 11.5, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    Remove logo
                  </button>
                )}
              </div>

              {/* Screenshots — editing them isn't supported by the update
                  endpoint yet, so this step is logo-only when editing. */}
              {isEditMode ? (
                <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Screenshot changes aren&apos;t supported here yet.</p>
              ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                    Screenshots <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>— up to 5 images ({screenshotPreviews.length}/5)</span>
                  </label>
                  {screenshotPreviews.length > 0 && (
                    <button onClick={() => { setScreenshotFiles([]); setScreenshotPreviews([]); }} style={{ fontSize: 11.5, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Remove all
                    </button>
                  )}
                </div>

                {screenshotPreviews.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {screenshotPreviews.map((src, i) => (
                      <div key={i} style={{ position: "relative", width: 110, height: 72, borderRadius: 8, border: "1px solid var(--border)", overflow: "visible", background: "var(--bg)", flexShrink: 0 }}>
                        {/* image — clicking opens replace picker */}
                        <label style={{ display: "block", width: "100%", height: "100%", cursor: "pointer", borderRadius: 8, overflow: "hidden" }}>
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleReplaceScreenshot(i, e)} />
                          <img src={src} alt="" style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: 8 }} />
                          {/* replace overlay on hover */}
                          <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "0"}
                          >
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.3px" }}>REPLACE</span>
                          </div>
                        </label>
                        {/* × remove button */}
                        <button
                          onClick={e => { e.stopPropagation(); handleRemoveScreenshot(i); }}
                          style={{ position: "absolute", top: -7, right: -7, width: 18, height: 18, borderRadius: "50%", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, padding: 0 }}
                        >
                          <X size={10} style={{ color: "var(--text-secondary)" }} />
                        </button>
                      </div>
                    ))}

                    {/* Add more button — only if < 5 */}
                    {screenshotPreviews.length < 5 && (
                      <label style={{ width: 110, height: 72, borderRadius: 8, border: "2px dashed var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--text-tertiary)", fontSize: 11, cursor: "pointer", flexShrink: 0, transition: "border-color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLLabelElement).style.borderColor = "var(--accent-border)"}
                        onMouseLeave={e => (e.currentTarget as HTMLLabelElement).style.borderColor = "var(--border)"}
                      >
                        <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAddScreenshots} />
                        <Plus size={16} style={{ opacity: 0.5 }} />
                        Add
                      </label>
                    )}
                  </div>
                ) : (
                  <label style={{ display: "block", cursor: "pointer" }}>
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAddScreenshots} />
                    <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 28, textAlign: "center", background: "var(--bg)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-border)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
                    >
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                        <ImageIcon size={26} style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 2 }}>
                        Drop files or <span style={{ color: "var(--accent)", fontWeight: 600 }}>browse</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>Up to 5 screenshots of your product in action</div>
                    </div>
                  </label>
                )}
              </div>
              )}
            </div>
          )}

          {/* Plan (create only — not shown when editing) */}
          {stepKey === "Plan" && (
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Choose your plan</h2>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 18 }}>You can always upgrade later</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 4 }}>
                {plans.map(plan => (
                  <div
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan.key)}
                    style={{
                      display: "flex", flexDirection: "column", padding: 18,
                      border: selectedPlan === plan.key ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                      borderRadius: 12, cursor: "pointer",
                      background: "var(--bg-card)",
                      boxShadow: selectedPlan === plan.key ? "var(--shadow-md)" : "none",
                      position: "relative", transition: "all 0.1s",
                    }}
                  >
                    {plan.popular && (
                      <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>Popular</span>
                    )}

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: selectedPlan === plan.key ? "var(--accent)" : "var(--text)" }}>{plan.name}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-1px" }}>{plan.price}</span>
                        <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{plan.period}</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, marginBottom: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                      {plan.features.map(f => (
                        <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", fontSize: 12, lineHeight: 1.5, color: f.included ? "var(--text-secondary)" : "var(--text-tertiary)" }}>
                          {f.included ? (
                            <Check size={13} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                          ) : (
                            <X size={13} style={{ color: "var(--text-tertiary)", flexShrink: 0, marginTop: 2 }} />
                          )}
                          {f.text}
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "9px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, textAlign: "center",
                      background: selectedPlan === plan.key ? "var(--accent)" : "var(--bg)",
                      color: selectedPlan === plan.key ? "#fff" : "var(--text-secondary)",
                      border: selectedPlan === plan.key ? "none" : "1px solid var(--border)",
                    }}>
                      {plan.key === "free" ? <Link2 size={13} /> : <Shield size={13} />}
                      {plan.cta}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badge */}
          {stepKey === "Badge" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Add the OnlyFounders badge</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {isEditMode
                    ? "Paste this badge on your website to verify ownership. Verifying publishes your listing if it isn't live yet."
                    : "Paste this badge on your website to verify ownership and publish your listing. Products without the badge are saved as drafts."}
                </p>
              </div>

              {/* Badge preview */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "14px 18px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "var(--accent)", borderRadius: 8, flexShrink: 0 }}>
                  <Shield size={14} color="#fff" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.2px" }}>Featured on OnlyFounders</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", minWidth: 160 }}>← this badge will appear on your site</span>
              </div>

              {/* Embed code */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Embed code — paste into your website&apos;s HTML</label>
                  <button
                    onClick={handleCopyBadge}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, border: "1px solid var(--border)", borderRadius: 6, background: copied ? "var(--accent-dim)" : "var(--bg)", color: copied ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer" }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre style={{
                  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8,
                  padding: "12px 14px", fontSize: 11.5, lineHeight: 1.7, color: "var(--text-secondary)",
                  overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0,
                  fontFamily: "monospace",
                }}>
                  {BADGE_SNIPPET}
                </pre>
              </div>

              {/* Verify section */}
              <div style={{ padding: 16, background: badgeVerified ? "rgba(34,197,94,0.06)" : "var(--bg)", border: `1px solid ${badgeVerified ? "rgba(34,197,94,0.25)" : "var(--border)"}`, borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    {badgeVerified ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", marginBottom: 1 }}>Badge verified!</p>
                          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            {isEditMode ? "Your dofollow link is active." : "Your product will be published immediately."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>After adding the code, click Verify</p>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Checking: <span style={{ color: "var(--text)", fontFamily: "monospace" }}>{form.url || "your website"}</span></p>
                      </div>
                    )}
                  </div>
                  {!badgeVerified && (
                    <button
                      onClick={isEditMode ? handleVerifyProductBadge : handleVerifyBadge}
                      disabled={isEditMode ? isVerifyingProductBadge : isVerifying}
                      style={{
                        padding: "8px 18px", fontSize: 13, fontWeight: 700, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8,
                        cursor: (isEditMode ? isVerifyingProductBadge : isVerifying) ? "default" : "pointer",
                        opacity: (isEditMode ? isVerifyingProductBadge : isVerifying) ? 0.7 : 1, whiteSpace: "nowrap", flexShrink: 0,
                      }}
                    >
                      {(isEditMode ? isVerifyingProductBadge : isVerifying) ? "Checking…" : "Verify badge"}
                    </button>
                  )}
                </div>
                {verifyError && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginTop: 10, padding: "8px 12px", background: "rgba(255,75,75,0.07)", border: "1px solid rgba(255,75,75,0.2)", borderRadius: 7 }}>
                    <AlertCircle size={13} style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "var(--red)" }}>{verifyError}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {submitError && (
            <div style={{ marginTop: 14, padding: "9px 14px", background: "rgba(255,75,75,0.08)", border: "1px solid rgba(255,75,75,0.25)", borderRadius: 8, fontSize: 13, color: "var(--red)" }}>
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
            <button
              onClick={() => { setSubmitError(""); setStep(s => s - 1); }}
              disabled={step === 0}
              style={{
                padding: "8px 18px", fontSize: 13, fontWeight: 600,
                border: "1px solid var(--border)", borderRadius: 8,
                background: "transparent", color: step === 0 ? "var(--text-tertiary)" : "var(--text-secondary)",
                cursor: step === 0 ? "default" : "pointer",
              }}
            >
              Back
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              {step < steps.length - 1 ? (
                <button onClick={handleNext} style={{
                  padding: "8px 22px", fontSize: 13, fontWeight: 700,
                  background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
                }}>
                  Continue
                </button>
              ) : isEditMode ? (
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  style={{
                    padding: "8px 22px", fontSize: 13, fontWeight: 700,
                    background: isSaving ? "var(--accent-hover)" : "var(--accent)",
                    color: "#fff", border: "none", borderRadius: 8,
                    cursor: isSaving ? "default" : "pointer",
                    opacity: isSaving ? 0.8 : 1,
                  }}
                >
                  {isSaving ? "Saving…" : "Save changes"}
                </button>
              ) : (
                <>
                  {!badgeVerified && (
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)", alignSelf: "center" }}>
                      Verifying is optional — you can launch now and add it later
                    </span>
                  )}
                  <button
                    onClick={() => doSubmit(!badgeVerified)}
                    disabled={isSubmitting}
                    style={{
                      padding: "8px 22px", fontSize: 13, fontWeight: 700,
                      background: isSubmitting ? "var(--accent-hover)" : "var(--accent)",
                      color: "#fff", border: "none",
                      borderRadius: 8,
                      cursor: isSubmitting ? "default" : "pointer",
                      opacity: isSubmitting ? 0.8 : 1,
                    }}
                  >
                    {isSubmitting ? "Launching…" : badgeVerified ? (selectedPlan === "free" ? "Launch now" : "Launch & pay") : "Continue without verifying"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
