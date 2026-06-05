import { AlertCircle, Clock, MapPin, Package, Shield, Sparkles, Smartphone } from "lucide-react";
import { useState } from "react";
import { diagnoseRepairIssue, type RepairDiagnosis } from "../services/geminiDiagnosis";

const WHATSAPP_NUMBER = "94767301586";
const CONTACT_PHONE = "+94713063163";
const CONTACT_EMAIL = "hewawasamnimantha@gmail.com";

type Device = "PlayStation" | "Laptop" | "Other";
type Logistics = "drop-off" | "courier";

interface RepairForm {
  device: Device | "";
  issue: string;
  useAiHelp: boolean;
  name: string;
  phone: string;
  email: string;
  logistics: Logistics;
}

const FEATURE_CARDS = [
  { icon: Clock, title: "Fast turnaround", desc: "2–4 business days" },
  { icon: Shield, title: "Service warranty", desc: "Repairs backed for 90 days" },
  { icon: Package, title: "Genuine parts", desc: "Verified components only" },
  { icon: Smartphone, title: "WhatsApp support", desc: "Live updates & tracking" },
];

const DEVICES: {
  id: Device;
  label: string;
  desc: string;
}[] = [
  { id: "PlayStation", label: "PlayStation", desc: "Consoles & VR" },
  { id: "Laptop", label: "Laptop", desc: "High Fidelity Systems" },
  { id: "Other", label: "Other Devices", desc: "Consoles & Accessories" },
];

function severityColor(severity: RepairDiagnosis["severity"]): string {
  if (severity === "low") return "#059669";
  if (severity === "medium") return "#d97706";
  if (severity === "high") return "#dc2626";
  return "var(--color-muted)";
}

export function RepairsPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [diagnosis, setDiagnosis] = useState<RepairDiagnosis | null>(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState("");

  const [form, setForm] = useState<RepairForm>({
    device: "",
    issue: "",
    useAiHelp: false,
    name: "",
    phone: "",
    email: "",
    logistics: "drop-off",
  });

  function patch(fields: Partial<RepairForm>) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  function startAiDiagnosis() {
    setSubmitted(false);
    setDiagnosis(null);
    setDiagnosisError("");
    patch({ device: form.device || "PlayStation", useAiHelp: true });
    setStep(2);
  }

  async function handleAiDiagnosis() {
    const issue = form.issue.trim();
    if (!issue || diagnosisLoading) return;

    setDiagnosisLoading(true);
    setDiagnosisError("");

    try {
      const result = await diagnoseRepairIssue(form.device, issue);
      setDiagnosis(result);
      patch({ useAiHelp: true });
    } catch (error) {
      setDiagnosis(null);
      setDiagnosisError(error instanceof Error ? error.message : "Unable to generate AI diagnosis.");
    } finally {
      setDiagnosisLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));

    const msg = [
      "🎮 *REPAIR TICKET — PlayStation.lk*",
      "",
      `*Device:* ${form.device}`,
      `*Issue:* ${form.issue || "Not specified"}`,
      form.useAiHelp && diagnosis ? `*AI diagnosis:* ${diagnosis.likelyCause}` : "",
      form.useAiHelp && diagnosis ? `*Estimated repair:* ${diagnosis.estimatedRepairType}` : "",
      "",
      `*Name:* ${form.name}`,
      `*Phone:* ${form.phone}`,
      form.email ? `*Email:* ${form.email}` : "",
      `*Delivery:* ${form.logistics === "drop-off" ? "Drop-Off at repair centre" : "Courier pickup requested"}`,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitting(false);
    setSubmitted(true);
  }

  function resetForm() {
    setSubmitted(false);
    setStep(1);
    setForm({ device: "", issue: "", useAiHelp: false, name: "", phone: "", email: "", logistics: "drop-off" });
    setDiagnosis(null);
    setDiagnosisError("");
    setDiagnosisLoading(false);
  }

  const progressPct = step === 1 ? 33 : step === 2 ? 67 : 100;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    background: "transparent",
    padding: "10px 14px",
    fontSize: "14px",
    color: "var(--color-text)",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div className="bg-bg text-text min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10" style={{ maxWidth: "840px" }}>

        {/* Page header */}
        <div style={{ paddingTop: "44px", paddingBottom: "32px" }}>
          <p className="text-textMuted" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <span>🔑</span>
            <span>Premium repair studio</span>
          </p>
          <h1 className="text-text font-bold" style={{ fontSize: "36px", letterSpacing: "-0.01em", marginBottom: "8px" }}>
            Book a repair
          </h1>
          <p className="text-textMuted" style={{ fontSize: "14px", maxWidth: "520px", lineHeight: "1.6" }}>
            Certified diagnostics and careful restoration for PlayStation consoles, controllers, and gaming laptops.
          </p>
        </div>

        {/* AI diagnosis entry */}
        <div
          className="rounded-xl border border-border bg-card"
          style={{ padding: "20px", marginBottom: "24px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div className="flex items-start gap-3" style={{ flex: 1, minWidth: "260px" }}>
              <span
                className="bg-accentSoft text-accent"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles style={{ width: "18px", height: "18px" }} />
              </span>
              <div>
                <p className="text-text" style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                  AI repair diagnosis
                </p>
                <p className="text-textMuted" style={{ fontSize: "13px", lineHeight: "1.6", maxWidth: "520px" }}>
                  Describe the fault and PlayStation.lk AI will create a safe first-pass triage summary for
                  our technicians before you submit the booking.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={startAiDiagnosis}
              className="inline-flex items-center bg-text text-bg font-medium rounded-md hover:opacity-90 transition-opacity"
              style={{ padding: "11px 18px", fontSize: "13px", gap: "8px" }}
            >
              <Sparkles style={{ width: "15px", height: "15px" }} />
              Start AI diagnosis
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "40px" }} className="sm:grid-cols-4">
          {FEATURE_CARDS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border" style={{ padding: "16px" }}>
              <Icon className="text-textMuted" style={{ width: "15px", height: "15px", marginBottom: "8px" }} />
              <p className="text-text" style={{ fontSize: "13px", fontWeight: "500", marginBottom: "2px" }}>{title}</p>
              <p className="text-textMuted" style={{ fontSize: "12px" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Step form card */}
        <div className="rounded-xl border border-border" style={{ marginBottom: "60px", overflow: "hidden" }}>

          {/* Step header */}
          <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", borderBottom: "1px solid var(--color-border)" }}>
            <div>
              <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", marginBottom: "4px" }}>
                Step {step} of 3
              </p>
              <p className="text-text font-semibold" style={{ fontSize: "17px" }}>
                {step === 1 ? "Select device" : step === 2 ? "Describe the issue" : "Your details"}
              </p>
            </div>
            {/* Progress bar */}
            <div style={{ flex: "1", maxWidth: "180px" }}>
              <p className="text-textMuted" style={{ fontSize: "11px", textAlign: "right", marginBottom: "6px" }}>
                {progressPct}% complete
              </p>
              <div className="rounded-full bg-bgSubtle" style={{ height: "4px", overflow: "hidden" }}>
                <div
                  className="bg-accent rounded-full"
                  style={{ width: `${progressPct}%`, height: "100%", transition: "width 0.4s ease" }}
                />
              </div>
            </div>
          </div>

          {/* Step content */}
          <div style={{ padding: "24px" }}>

            {/* Step 1: Device */}
            {step === 1 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
                  {DEVICES.map(({ id, label, desc }) => (
                    <button
                      key={id}
                      type="button"
                      id={`device-${id.toLowerCase()}`}
                      onClick={() => patch({ device: id })}
                      className={`rounded-xl border text-left transition-all duration-200 ${
                        form.device === id ? "border-accent bg-accentSoft" : "border-border hover:border-accent"
                      }`}
                      style={{ padding: "20px" }}
                    >
                      <span style={{ fontSize: "20px", display: "block", marginBottom: "10px" }}>🔧</span>
                      <p className={`font-medium ${form.device === id ? "text-accent" : "text-text"}`} style={{ fontSize: "14px", marginBottom: "4px" }}>
                        {label}
                      </p>
                      <p className="text-textMuted" style={{ fontSize: "12px" }}>{desc}</p>
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    id="step1-next"
                    disabled={!form.device}
                    onClick={() => setStep(2)}
                    className="bg-accent text-white font-medium rounded-md hover:bg-accentStrong transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ padding: "10px 24px", fontSize: "14px" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Issue */}
            {step === 2 && (
              <div>
                <textarea
                  rows={6}
                  value={form.issue}
                  onChange={(e) => {
                    patch({ issue: e.target.value });
                    setDiagnosis(null);
                    setDiagnosisError("");
                  }}
                  placeholder="Example: Console won't power on, controller buttons not responding"
                  style={{ ...inputStyle, marginBottom: "12px", resize: "vertical" }}
                />

                {/* AI help toggle */}
                <div className="rounded-xl border border-border" style={{ padding: "16px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div className="flex items-start gap-3" style={{ flex: "1", minWidth: "240px" }}>
                      <span
                        className="bg-accentSoft text-accent"
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "999px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Sparkles style={{ width: "16px", height: "16px" }} />
                      </span>
                      <div>
                        <p className="text-text" style={{ fontSize: "13px", fontWeight: "600" }}>
                          AI diagnosis assistant
                        </p>
                        <p className="text-textMuted" style={{ fontSize: "12px", marginTop: "3px", lineHeight: "1.6" }}>
                          Generates a safe first-pass triage summary for our technicians. It does not replace a bench inspection.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAiDiagnosis}
                      disabled={!form.issue.trim() || diagnosisLoading}
                      className="inline-flex items-center bg-text text-bg font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ padding: "9px 16px", fontSize: "13px", gap: "8px" }}
                    >
                      {diagnosisLoading ? (
                        <>
                          <span
                            className="rounded-full border-2 animate-spin"
                            style={{
                              width: "14px",
                              height: "14px",
                              borderColor: "rgba(255,255,255,0.35)",
                              borderTopColor: "currentColor",
                            }}
                          />
                          Diagnosing...
                        </>
                      ) : (
                        <>
                          <Sparkles style={{ width: "14px", height: "14px" }} />
                          Generate diagnosis
                        </>
                      )}
                    </button>
                  </div>

                  {diagnosisError ? (
                    <div
                      className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 text-red-600"
                      style={{ marginTop: "14px", padding: "10px 12px", fontSize: "12px" }}
                    >
                      <AlertCircle style={{ width: "15px", height: "15px", marginTop: "1px", flexShrink: 0 }} />
                      <span>{diagnosisError}</span>
                    </div>
                  ) : null}

                  {diagnosis ? (
                    <div className="rounded-lg border border-border bg-bgSubtle" style={{ marginTop: "14px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", marginBottom: "10px" }}>
                        <div>
                          <p className="text-text" style={{ fontSize: "13px", fontWeight: "600" }}>
                            {diagnosis.estimatedRepairType}
                          </p>
                          <p className="text-textMuted" style={{ fontSize: "12px", marginTop: "3px", lineHeight: "1.6" }}>
                            {diagnosis.likelyCause}
                          </p>
                        </div>
                        <span
                          className="rounded-full border border-border uppercase"
                          style={{
                            color: severityColor(diagnosis.severity),
                            fontSize: "10px",
                            letterSpacing: "0.2em",
                            padding: "4px 8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {diagnosis.severity}
                        </span>
                      </div>

                      {diagnosis.quickChecks.length ? (
                        <div style={{ marginTop: "12px" }}>
                          <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.2em", marginBottom: "8px" }}>
                            Safe checks
                          </p>
                          <ul style={{ display: "grid", gap: "6px" }}>
                            {diagnosis.quickChecks.map((check) => (
                              <li key={check} className="text-textMuted" style={{ fontSize: "12px" }}>
                                - {check}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {diagnosis.technicianNotes.length ? (
                        <div style={{ marginTop: "12px" }}>
                          <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.2em", marginBottom: "8px" }}>
                            Technician notes
                          </p>
                          <ul style={{ display: "grid", gap: "6px" }}>
                            {diagnosis.technicianNotes.map((note) => (
                              <li key={note} className="text-textMuted" style={{ fontSize: "12px" }}>
                                - {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-textMuted hover:text-text transition-colors"
                    style={{ fontSize: "14px" }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    id="step2-next"
                    disabled={!form.issue.trim()}
                    onClick={() => setStep(3)}
                    className="bg-accent text-white font-medium rounded-md hover:bg-accentStrong transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ padding: "10px 24px", fontSize: "14px" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }} className="sm:grid-cols-2">
                  <div>
                    <label className="text-textMuted" style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>Full name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => patch({ name: e.target.value })}
                      placeholder="Enter your name"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-textMuted" style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>Phone number</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => patch({ phone: e.target.value })}
                      placeholder="+94 77 123 4567"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label className="text-textMuted" style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => patch({ email: e.target.value })}
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                </div>

                {/* Delivery method */}
                <div style={{ marginBottom: "20px" }}>
                  <p className="text-textMuted" style={{ fontSize: "12px", marginBottom: "10px" }}>How will you send your device?</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <button
                      type="button"
                      id="logistics-drop-off"
                      onClick={() => patch({ logistics: "drop-off" })}
                      className={`rounded-xl border text-left transition-all duration-200 ${form.logistics === "drop-off" ? "border-accent bg-accentSoft" : "border-border hover:border-accent"}`}
                      style={{ padding: "16px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <MapPin className={form.logistics === "drop-off" ? "text-accent" : "text-textMuted"} style={{ width: "14px", height: "14px" }} />
                        <p className={`font-medium ${form.logistics === "drop-off" ? "text-accent" : "text-text"}`} style={{ fontSize: "13px" }}>Drop-off</p>
                      </div>
                      <p className="text-textMuted" style={{ fontSize: "12px" }}>Bring it to our repair centre</p>
                    </button>

                    <button
                      type="button"
                      id="logistics-courier"
                      onClick={() => patch({ logistics: "courier" })}
                      className={`rounded-xl border text-left transition-all duration-200 ${form.logistics === "courier" ? "border-accent bg-accentSoft" : "border-border hover:border-accent"}`}
                      style={{ padding: "16px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Package className={form.logistics === "courier" ? "text-accent" : "text-textMuted"} style={{ width: "14px", height: "14px" }} />
                        <p className={`font-medium ${form.logistics === "courier" ? "text-accent" : "text-text"}`} style={{ fontSize: "13px" }}>Courier pickup</p>
                      </div>
                      <p className="text-textMuted" style={{ fontSize: "12px" }}>We arrange pickup from your location</p>
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-textMuted hover:text-text transition-colors"
                    style={{ fontSize: "14px" }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    id="submit-repair"
                    disabled={!form.name.trim() || !form.phone.trim() || submitting}
                    onClick={handleSubmit}
                    className="inline-flex items-center bg-accent text-white font-medium rounded-md hover:bg-accentStrong transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ padding: "10px 24px", fontSize: "14px", gap: "8px" }}
                  >
                    {submitting ? (
                      <>
                        <span className="rounded-full border-2 animate-spin" style={{ width: "14px", height: "14px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                        Sending…
                      </>
                    ) : (
                      <>
                        <MapPin style={{ width: "14px", height: "14px" }} />
                        Book repair
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {submitted && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ padding: "16px" }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-bg rounded-xl border border-border" style={{ padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <p className="text-text font-semibold" style={{ fontSize: "16px" }}>Booking confirmed</p>
              <button type="button" onClick={resetForm} className="text-textMuted hover:text-text" style={{ fontSize: "13px" }}>Close</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>✅</span>
              <span className="text-emerald-600 font-medium" style={{ fontSize: "14px" }}>WhatsApp notification sent</span>
            </div>

            <p className="text-textMuted" style={{ fontSize: "13px", lineHeight: "1.6", marginBottom: "12px" }}>
              Your booking has been sent to our team. We will contact you within 2 to 4 hours to schedule the repair.
            </p>

            <div className="text-textMuted" style={{ fontSize: "13px", marginBottom: "20px" }}>
              <p>Phone: {CONTACT_PHONE}</p>
              <p>Email: {CONTACT_EMAIL}</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => { window.location.href = "/"; }}
                className="bg-accent text-white font-medium rounded-full hover:bg-accentStrong transition-colors"
                style={{ padding: "9px 20px", fontSize: "13px" }}
              >
                Return home
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-border text-text rounded-full hover:bg-bgSubtle transition-colors"
                style={{ padding: "9px 20px", fontSize: "13px" }}
              >
                Book another repair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
