"use client";
import { PageContent } from "@/components/ui/Surface";
import DSButton from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
import {
  Link2, CheckCircle, ImageIcon, Plus, Check, Copy, Shield, AlertCircle,
  Clock, X, CreditCard, Loader2, Sparkles, Globe, Tag, Type, FileText,
  DollarSign, Camera, Zap, ArrowRight, ChevronRight
} from "lucide-react";

const CREATE_STEPS = ["Basics", "Details", "Media", "Plan", "Badge"];
const EDIT_STEPS = ["Basics", "Details", "Media", "Badge"];
const categories = ["AI", "Dev Tools", "Analytics", "Design", "Productivity", "Marketing", "Finance", "HR", "Legal", "Other"];
const categoryIcons: Record<string, React.ReactNode> = {
  "AI": <Sparkles size={13} />,
  "Dev Tools": <FileText size={13} />,
  "Analytics": <Tag size={13} />,
  "Design": <ImageIcon size={13} />,
  "Productivity": <Zap size={13} />,
  "Marketing": <Globe size={13} />,
  "Finance": <DollarSign size={13} />,
  "HR": <Type size={13} />,
  "Legal": <Shield size={13} />,
  "Other": <Tag size={13} />,
};
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

const stepMeta: Record<string, { icon: React.ReactNode; description: string }> = {
  Basics: { icon: <Type size={18} />, description: "Name, tagline, and website — the essentials" },
  Details: { icon: <FileText size={18} />, description: "Help founders understand what you've built" },
  Media: { icon: <Camera size={18} />, description: "A picture is worth a thousand sign-ups" },
  Plan: { icon: <Zap size={18} />, description: "Pick the right visibility for your launch" },
  Badge: { icon: <Shield size={18} />, description: "Verify ownership and go live" },
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

  /* ── Success screen ── */
  if (submitted) {
    return (
      <AppShell title="Submit product">
        <PageContent style={{textAlign: "center"}}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: submitted.isDraft ? "var(--bg-active)" : "var(--accent-dim)", border: `2px solid ${submitted.isDraft ? "var(--border-hover)" : "var(--accent-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            {submitted.isDraft
              ? <Clock size={30} style={{ color: "var(--text-secondary)" }} />
              : <CheckCircle size={30} style={{ color: "var(--accent)" }} />}
          </div>
          <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 8 }}>
            {submitted.isDraft ? "Saved as draft" : "You're live! 🎉"}
          </h1>
          <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>
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
              padding: "14px 16px", marginBottom: 24, borderRadius: "var(--radius-lg)",
              background: submitted.paymentStatus === "completed" ? "var(--green-dim)" : "var(--bg-card)",
              border: `1px solid ${submitted.paymentStatus === "completed" ? "var(--green-border)" : "var(--border)"}`,
            }}>
              {submitted.paymentStatus === "completed" ? (
                <CheckCircle size={18} style={{ color: "var(--green)", flexShrink: 0 }} />
              ) : submitted.paymentStatus === "confirming" ? (
                <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent)", flexShrink: 0 }} />
              ) : (
                <CreditCard size={18} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "var(--font-base)", fontWeight: 700, marginBottom: 2 }}>
                  {submitted.paymentStatus === "completed"
                    ? `${submitted.plan === "pro" ? "Pro" : "Starter"} plan active`
                    : submitted.paymentStatus === "confirming"
                    ? "Confirming payment…"
                    : "Payment not completed yet"}
                </p>
                <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
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
                  className="ds-button ds-button--secondary ds-button--sm" style={{ flexShrink: 0 }}
                >
                  {isStartingCheckout ? "Opening…" : "Pay now"}
                </button>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {!submitted.isDraft && (
              <Link href={`/products/${submitted.slug}`} className="ds-button ds-button--secondary">
                View listing
              </Link>
            )}
            <Link href="/launchpad" className="ds-button ds-button--outline">
              Back to launchpad
            </Link>
          </div>
        </PageContent>
      </AppShell>
    );
  }

  if (isEditMode && isLoadingEdit) {
    return (
      <AppShell title="Edit product">
        <PageContent >
          <div className="fp-skeleton" style={{ height: 400, borderRadius: "var(--radius-lg)" }} />
        </PageContent>
      </AppShell>
    );
  }

  if (isEditMode && (isEditError || !editProduct || !canEditThis)) {
    return (
      <AppShell title="Edit product">
        <PageContent style={{textAlign: "center"}}>
          <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
            {isEditError || !editProduct ? "Product not found." : "You don't have permission to edit this product."}
          </p>
          <Link href="/launchpad" style={{ color: "var(--accent)", fontWeight: 600, fontSize: "var(--font-base)" }}>Back to launchpad</Link>
        </PageContent>
      </AppShell>
    );
  }

  const progressPercent = Math.round(((step) / (steps.length - 1)) * 100);
  const currentStepMeta = stepMeta[stepKey];

  return (
    <AppShell title={isEditMode ? "Edit product" : "Submit product"}>
      <PageContent >
        {/* Hero heading */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--font-2xl)", fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 6 }}>
            {isEditMode ? "Edit your product" : "Submit your product"}
          </h1>
          <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {isEditMode ? "Update your listing details, then verify to publish if it isn't live yet" : "Share what you're building with thousands of founders"}
          </p>
        </div>

        {/* URL scraper — creation-only shortcut, not relevant once a product exists */}
        {!isEditMode && (
        <div style={{
          padding: 20, marginBottom: 24,
          borderRadius: "var(--radius-lg)",
          border: scraped ? "1px solid var(--accent-border)" : "1px solid var(--border)",
          background: scraped ? "var(--accent-dim)" : "var(--bg)",
          transition: "all 0.25s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "var(--radius-md)",
              background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Link2 size={16} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <span style={{ fontSize: "var(--font-base)", fontWeight: 700 }}>Import from URL</span>
              <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginLeft: 8 }}>Auto-fill from your website</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={scrapeUrl}
              onChange={e => { setScrapeUrl(e.target.value); setScraped(false); setScrapeError(""); }}
              onKeyDown={e => e.key === "Enter" && handleScrape()}
              placeholder="https://yourproduct.com"
              className="ds-field" style={{ flex: 1, minHeight: 44 }}
            />
            <button onClick={handleScrape} disabled={isScraping || !scrapeUrl.trim()} className="ds-button ds-button--secondary" style={{ flexShrink: 0, minHeight: 44, borderRadius: "var(--radius-sm)" }}>
              {isScraping ? <><Loader2 size={14} className="animate-spin" /> Fetching…</> : <>
                <Sparkles size={14} /> Fetch details
              </>}
            </button>
          </div>
          {scrapeError && <p style={{ fontSize: "var(--font-sm)", color: "var(--red)", marginTop: 10 }}>{scrapeError}</p>}
          {scraped && !scrapeError && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "8px 12px", background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: "var(--radius-md)" }}>
              <CheckCircle size={14} style={{ color: "var(--green)", flexShrink: 0 }} />
              <span style={{ fontSize: "var(--font-sm)", color: "var(--green)", fontWeight: 600 }}>Details imported successfully — review and edit below</span>
            </div>
          )}
        </div>
        )}

        {/* Progress stepper */}
        <div style={{ marginBottom: 28 }}>
          {/* Progress bar */}
          <div style={{ height: 3, background: "var(--border)", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "var(--accent)", borderRadius: 2,
              width: `${progressPercent}%`,
              transition: "width 0.4s cubic-bezier(.16,1,.3,1)",
            }} />
          </div>
          {/* Step dots */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, flex: i < steps.length - 1 ? 1 : 0 }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: i < step ? "pointer" : "default" }}
                  onClick={() => { if (i < step) { setSubmitError(""); setStep(i); } }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: i < step ? "var(--accent)" : i === step ? "var(--accent-dim)" : "var(--bg)",
                    color: i < step ? "#fff" : i === step ? "var(--accent)" : "var(--text-secondary)",
                    border: i === step ? "1.5px solid var(--accent-border)" : i < step ? "none" : "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--font-sm)", fontWeight: 700, flexShrink: 0,
                    transition: "all 0.25s ease",
                  }}>
                    {i < step ? <Check size={13} /> : i + 1}
                  </div>
                  <span className="submit-step-label" style={{
                    fontSize: "var(--font-sm)", fontWeight: i === step ? 700 : 500,
                    color: i === step ? "var(--text)" : i < step ? "var(--accent)" : "var(--text-secondary)",
                    whiteSpace: "nowrap", transition: "color 0.2s",
                  }}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: i < step ? "var(--accent)" : "var(--border)", transition: "background 0.3s", margin: "0 4px" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step context header */}
        {currentStepMeta && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
            padding: "12px 16px", borderRadius: "var(--radius-lg)",
            background: "var(--bg-hover)",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "var(--radius-md)",
              background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--accent)", flexShrink: 0,
            }}>
              {currentStepMeta.icon}
            </div>
            <div>
              <p style={{ fontSize: "var(--font-base)", fontWeight: 700 }}>Step {step + 1}: {stepKey}</p>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>{currentStepMeta.description}</p>
            </div>
          </div>
        )}

        {/* Form card */}
        <Card padding="none" style={{padding: "28px 24px"}}>

          {/* Step 0 — Basics */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: "var(--font-sm)", fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
                  Product name <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  placeholder="e.g. AutoCRM"
                  className="ds-field"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <label style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Tagline <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <span style={{
                    fontSize: "var(--font-xs)",
                    color: form.tagline.length > 60 ? "var(--red)" : form.tagline.length > 45 ? "var(--yellow)" : "var(--text-secondary)",
                    fontWeight: 500, fontVariantNumeric: "tabular-nums",
                  }}>
                    {form.tagline.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => update("tagline", e.target.value)}
                  placeholder="Short, punchy description (under 60 chars)"
                  maxLength={80}
                  className="ds-field"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "var(--font-sm)", fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
                  Website URL <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Globe size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
                  <input
                    type="url"
                    value={form.url}
                    onChange={e => update("url", e.target.value)}
                    placeholder="https://yourproduct.com"
                    className="ds-field" style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "var(--font-sm)", fontWeight: 600, marginBottom: 10, color: "var(--text-secondary)" }}>
                  Category <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => update("category", cat)} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", fontSize: "var(--font-sm)", fontWeight: 600,
                      border: form.category === cat ? "1.5px solid var(--accent-border)" : "1px solid var(--border)",
                      borderRadius: "var(--radius-full)", cursor: "pointer",
                      background: form.category === cat ? "var(--accent-dim)" : "var(--bg)",
                      color: form.category === cat ? "var(--accent)" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                    }}>
                      {categoryIcons[cat]}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <label style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Description <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                    {form.description.length} chars
                  </span>
                </div>
                <textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Describe your product — what it does, who it's for, why it's different"
                  rows={6}
                  className="ds-field" style={{ resize: "vertical"}}
                />
                <p style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", marginTop: 6 }}>
                  Tip: Mention the problem you solve, your target audience, and what makes you unique.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "var(--font-sm)", fontWeight: 600, marginBottom: 10, color: "var(--text-secondary)" }}>Pricing model</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Free", "Freemium", "Paid", "Open source"].map(p => (
                    <button key={p} onClick={() => update("pricing", p)} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "8px 16px", fontSize: "var(--font-sm)", fontWeight: 600,
                      border: form.pricing === p ? "1.5px solid var(--accent-border)" : "1px solid var(--border)",
                      borderRadius: "var(--radius-full)", cursor: "pointer",
                      background: form.pricing === p ? "var(--accent-dim)" : "var(--bg)",
                      color: form.pricing === p ? "var(--accent)" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                    }}>
                      {form.pricing === p && <Check size={13} />}
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "var(--font-sm)", fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
                  Tags <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(comma separated)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Tag size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
                  <input value={form.tags} onChange={e => update("tags", e.target.value)} placeholder="AI, CRM, Sales automation" className="ds-field" style={{ paddingLeft: 36 }} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Media */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Logo */}
              <div>
                <label style={{ display: "block", fontSize: "var(--font-sm)", fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>
                  Logo <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>— square PNG or JPG, min 200×200px</span>
                </label>
                <label style={{ display: "block", cursor: "pointer" }}>
                  <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleLogoChange} />
                  {logoPreview || form.logo ? (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 16, padding: 16,
                      borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
                      background: "var(--bg-hover)", transition: "border-color 0.15s",
                    }}>
                      <div style={{ width: 72, height: 72, borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--bg)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {logoLoadFailed ? (
                          <ImageIcon size={24} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
                        ) : (
                          <img src={logoPreview || form.logo} width={56} height={56} alt="" style={{ objectFit: "contain" }} onError={() => setLogoLoadFailed(true)} onLoad={() => setLogoLoadFailed(false)} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "var(--font-base)", fontWeight: 600, color: logoLoadFailed ? "var(--red)" : "var(--text)", marginBottom: 4 }}>
                          {logoLoadFailed ? "Couldn't load this image" : logoFile ? logoFile.name : "Logo from your site"}
                        </p>
                        <p style={{ fontSize: "var(--font-sm)", color: "var(--accent)" }}>{logoLoadFailed ? "Click to choose a different file" : "Click to replace"}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      border: "2px dashed var(--border)", borderRadius: "var(--radius-lg)", padding: 36,
                      textAlign: "center", background: "var(--bg)", transition: "border-color 0.15s, background 0.15s",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-border)"; (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLDivElement).style.background = "var(--bg)"; }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                        <ImageIcon size={22} style={{ color: "var(--accent)" }} />
                      </div>
                      <div style={{ fontSize: "var(--font-base)", color: "var(--text)", marginBottom: 4, fontWeight: 600 }}>
                        Drop file or <span style={{ color: "var(--accent)" }}>browse</span>
                      </div>
                      <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>PNG, JPG, WebP — max 5 MB</div>
                    </div>
                  )}
                </label>
                {(logoPreview || form.logo) && (
                  <button onClick={() => { setLogoFile(null); setLogoPreview(""); setLogoLoadFailed(false); update("logo", ""); }} style={{ marginTop: 8, fontSize: "var(--font-sm)", color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}>
                    Remove logo
                  </button>
                )}
              </div>

              {/* Screenshots — editing them isn't supported by the update
                  endpoint yet, so this step is logo-only when editing. */}
              {isEditMode ? (
                <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", padding: "12px 16px", background: "var(--bg-hover)", borderRadius: "var(--radius-md)" }}>Screenshot changes aren&apos;t supported here yet.</p>
              ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Screenshots <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>— up to 5 images ({screenshotPreviews.length}/5)</span>
                  </label>
                  {screenshotPreviews.length > 0 && (
                    <button onClick={() => { setScreenshotFiles([]); setScreenshotPreviews([]); }} style={{ fontSize: "var(--font-sm)", color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}>
                      Remove all
                    </button>
                  )}
                </div>

                {screenshotPreviews.length > 0 ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {screenshotPreviews.map((src, i) => (
                      <div key={i} style={{ position: "relative", width: 120, height: 80, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "visible", background: "var(--bg)", flexShrink: 0 }}>
                        {/* image — clicking opens replace picker */}
                        <label style={{ display: "block", width: "100%", height: "100%", cursor: "pointer", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleReplaceScreenshot(i, e)} />
                          <img src={src} alt="" style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "var(--radius-md)" }} />
                          {/* replace overlay on hover */}
                          <div style={{ position: "absolute", inset: 0, borderRadius: "var(--radius-md)", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "0"}
                          >
                            <span style={{ fontSize: "var(--font-xs)", fontWeight: 700, color: "#fff", letterSpacing: "0.3px" }}>REPLACE</span>
                          </div>
                        </label>
                        {/* × remove button */}
                        <button
                          onClick={e => { e.stopPropagation(); handleRemoveScreenshot(i); }}
                          style={{ position: "absolute", top: -8, right: -8, width: 20, height: 20, borderRadius: "50%", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, padding: 0 }}
                        >
                          <X size={10} style={{ color: "var(--text-secondary)" }} />
                        </button>
                      </div>
                    ))}

                    {/* Add more button — only if < 5 */}
                    {screenshotPreviews.length < 5 && (
                      <label style={{
                        width: 120, height: 80, borderRadius: "var(--radius-md)",
                        border: "2px dashed var(--border)", display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 4,
                        color: "var(--text-secondary)", fontSize: "var(--font-sm)", cursor: "pointer",
                        flexShrink: 0, transition: "border-color 0.15s, background 0.15s",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLLabelElement).style.borderColor = "var(--accent-border)"; (e.currentTarget as HTMLLabelElement).style.background = "var(--bg-hover)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLLabelElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLLabelElement).style.background = "transparent"; }}
                      >
                        <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAddScreenshots} />
                        <Plus size={18} style={{ color: "var(--accent)" }} />
                        <span style={{ fontWeight: 600, color: "var(--accent)" }}>Add</span>
                      </label>
                    )}
                  </div>
                ) : (
                  <label style={{ display: "block", cursor: "pointer" }}>
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAddScreenshots} />
                    <div style={{
                      border: "2px dashed var(--border)", borderRadius: "var(--radius-lg)", padding: 36,
                      textAlign: "center", background: "var(--bg)", transition: "border-color 0.15s, background 0.15s",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-border)"; (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLDivElement).style.background = "var(--bg)"; }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                        <Camera size={22} style={{ color: "var(--accent)" }} />
                      </div>
                      <div style={{ fontSize: "var(--font-base)", color: "var(--text)", marginBottom: 4, fontWeight: 600 }}>
                        Drop files or <span style={{ color: "var(--accent)" }}>browse</span>
                      </div>
                      <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>Up to 5 screenshots of your product in action</div>
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
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: "var(--font-lg)", fontWeight: 800, marginBottom: 4 }}>Choose your plan</h2>
                <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>You can always upgrade later — start with what works for you</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                {plans.map(plan => (
                  <div
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan.key)}
                    style={{
                      display: "flex", flexDirection: "column", padding: 20,
                      border: selectedPlan === plan.key ? "1.5px solid var(--accent-border)" : "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)", cursor: "pointer",
                      background: selectedPlan === plan.key ? "var(--accent-dim)" : "var(--bg)",
                      boxShadow: selectedPlan === plan.key ? "var(--shadow-md)" : "none",
                      position: "relative", transition: "all 0.2s ease",
                    }}
                  >
                    {plan.popular && (
                      <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "var(--accent-text)", fontSize: "var(--font-xs)", fontWeight: 700, padding: "2px 14px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}>Most popular</span>
                    )}

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: selectedPlan === plan.key ? "var(--accent)" : "var(--border-hover)",
                          border: selectedPlan === plan.key ? "2px solid var(--accent)" : "2px solid var(--border-hover)",
                          boxShadow: selectedPlan === plan.key ? "0 0 0 2px var(--accent-dim)" : "none",
                          transition: "all 0.15s",
                        }} />
                        <span style={{ fontSize: "var(--font-base)", fontWeight: 700, color: selectedPlan === plan.key ? "var(--accent)" : "var(--text)" }}>{plan.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span style={{ fontSize: "var(--font-2xl)", fontWeight: 800, letterSpacing: "-1px" }}>{plan.price}</span>
                        <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>{plan.period}</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, marginBottom: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      {plan.features.map(f => (
                        <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", fontSize: "var(--font-sm)", lineHeight: 1.5, color: f.included ? "var(--text-secondary)" : "var(--text-secondary)" }}>
                          {f.included ? (
                            <Check size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} />
                          ) : (
                            <X size={13} style={{ color: "var(--text-secondary)", opacity: 0.4, flexShrink: 0, marginTop: 2 }} />
                          )}
                          <span style={{ opacity: f.included ? 1 : 0.5 }}>{f.text}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "10px", borderRadius: "var(--radius-full)", fontSize: "var(--font-sm)", fontWeight: 700, textAlign: "center",
                      background: selectedPlan === plan.key ? "var(--accent)" : "var(--bg-hover)",
                      color: selectedPlan === plan.key ? "#fff" : "var(--text-secondary)",
                      transition: "all 0.15s",
                    }}>
                      {selectedPlan === plan.key ? <Check size={13} /> : plan.key === "free" ? <Link2 size={13} /> : <Shield size={13} />}
                      {selectedPlan === plan.key ? "Selected" : plan.cta}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badge */}
          {stepKey === "Badge" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h2 style={{ fontSize: "var(--font-lg)", fontWeight: 800, marginBottom: 6 }}>Add the OnlyFounders badge</h2>
                <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {isEditMode
                    ? "Paste this badge on your website to verify ownership. Verifying publishes your listing if it isn't live yet."
                    : "Paste this badge on your website to verify ownership and publish your listing. Products without the badge are saved as drafts."}
                </p>
              </div>

              {/* Badge preview */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "16px 20px",
                background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "var(--accent)", borderRadius: "var(--radius-md)", flexShrink: 0 }}>
                  <Shield size={14} color="#fff" />
                  <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "#fff", letterSpacing: "0.2px" }}>Featured on OnlyFounders</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ArrowRight size={14} style={{ color: "var(--text-secondary)" }} />
                  <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>This badge will appear on your site</span>
                </div>
              </div>

              {/* Embed code */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>Embed code — paste into your website&apos;s HTML</label>
                  <button
                    onClick={handleCopyBadge}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                      fontSize: "var(--font-sm)", fontWeight: 600, borderRadius: "var(--radius-full)",
                      border: copied ? "1px solid var(--green-border)" : "1px solid var(--border)",
                      background: copied ? "var(--green-dim)" : "var(--bg)",
                      color: copied ? "var(--green)" : "var(--text-secondary)", cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre style={{
                  background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                  padding: "14px 16px", fontSize: "var(--font-sm)", lineHeight: 1.7, color: "var(--text-secondary)",
                  overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0,
                  fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                }}>
                  {BADGE_SNIPPET}
                </pre>
              </div>

              {/* Verify section */}
              <div style={{
                padding: 18, borderRadius: "var(--radius-lg)",
                background: badgeVerified ? "var(--green-dim)" : "var(--bg-hover)",
                border: `1px solid ${badgeVerified ? "var(--green-border)" : "var(--border)"}`,
                transition: "all 0.25s ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    {badgeVerified ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckCircle size={16} style={{ color: "var(--green)" }} />
                        </div>
                        <div>
                          <p style={{ fontSize: "var(--font-base)", fontWeight: 700, color: "var(--green)", marginBottom: 1 }}>Badge verified!</p>
                          <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                            {isEditMode ? "Your dofollow link is active." : "Your product will be published immediately."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: "var(--font-base)", fontWeight: 700, marginBottom: 3 }}>After adding the code, click Verify</p>
                        <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>Checking: <span style={{ color: "var(--text)", fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace" }}>{form.url || "your website"}</span></p>
                      </div>
                    )}
                  </div>
                  {!badgeVerified && (
                    <button
                      onClick={isEditMode ? handleVerifyProductBadge : handleVerifyBadge}
                      disabled={isEditMode ? isVerifyingProductBadge : isVerifying}
                      className="ds-button ds-button--secondary"
                      style={{
                        flexShrink: 0,
                        opacity: (isEditMode ? isVerifyingProductBadge : isVerifying) ? 0.7 : 1,
                      }}
                    >
                      {(isEditMode ? isVerifyingProductBadge : isVerifying)
                        ? <><Loader2 size={14} className="animate-spin" /> Checking…</>
                        : "Verify badge"}
                    </button>
                  )}
                </div>
                {verifyError && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 12, padding: "10px 14px", background: "var(--red-dim)", border: "1px solid var(--red-border)", borderRadius: "var(--radius-md)" }}>
                    <AlertCircle size={14} style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: "var(--font-sm)", color: "var(--red)" }}>{verifyError}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {submitError && (
            <div style={{
              marginTop: 16, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
              background: "var(--red-dim)", border: "1px solid var(--red-border)", borderRadius: "var(--radius-md)",
              fontSize: "var(--font-base)", color: "var(--red)",
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <DSButton
              onClick={() => { setSubmitError(""); setStep(s => s - 1); }}
              disabled={step === 0}
              variant="outline"
            >
              Back
            </DSButton>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {step < steps.length - 1 ? (
                <DSButton onClick={handleNext} variant="secondary" icon={<ChevronRight size={15} />}>
                  Continue
                </DSButton>
              ) : isEditMode ? (
                <DSButton
                  onClick={handleSaveEdit}
                  loading={isSaving}
                  variant="secondary"
                >
                  Save changes
                </DSButton>
              ) : (
                <>
                  {!badgeVerified && (
                    <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", maxWidth: 200, textAlign: "right", lineHeight: 1.4 }}>
                      Verifying is optional — you can launch now
                    </span>
                  )}
                  <DSButton
                    onClick={() => doSubmit(!badgeVerified)}
                    loading={isSubmitting}
                    variant="secondary"
                  >
                    {badgeVerified ? (selectedPlan === "free" ? "Launch now 🚀" : "Launch & pay 🚀") : "Continue without verifying"}
                  </DSButton>
                </>
              )}
            </div>
          </div>
        </Card>

        <style jsx>{`
          @media (max-width: 480px) {
            .submit-step-label { display: none; }
          }
        `}</style>
      </PageContent>
    </AppShell>
  );
}
