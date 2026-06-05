import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

const WHATSAPP_NUMBER = "94767301586";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSend() {
    const text = `Hello, I'm ${name} (${email}).\n\n${message}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const inputClass = "w-full border border-border rounded-md bg-bg text-text placeholder:text-textMuted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200";

  return (
    <div className="bg-bg text-text min-h-screen">
      {/* Hero */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: "48px", paddingBottom: "40px" }}>
          <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.35em", marginBottom: "10px" }}>
            Get in touch
          </p>
          <h1 className="text-text font-bold" style={{ fontSize: "36px", letterSpacing: "-0.01em", marginBottom: "8px" }}>
            Contact us
          </h1>
          <p className="text-textMuted" style={{ fontSize: "14px", maxWidth: "480px" }}>
            Reach out for product availability, order tracking, repair updates, or any general enquiry.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px" }} className="lg:grid-cols-[1fr_1.2fr]">

          {/* Left: contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Contact cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                {
                  icon: Phone,
                  label: "Phone & WhatsApp",
                  value: "+94 76 730 1586",
                  sub: "Mon–Sat, 9am–8pm",
                  href: `https://wa.me/${WHATSAPP_NUMBER}`,
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "support@playstation.lk",
                  sub: "24hr response",
                  href: "mailto:support@playstation.lk",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Colombo, Rajagiriya",
                  sub: "Sri Lanka — Open daily",
                  href: "https://maps.google.com/?q=Rajagiriya,+Sri+Lanka",
                },
                {
                  icon: MessageCircle,
                  label: "Social",
                  value: "@PlayStation.lk",
                  sub: "Facebook · Instagram",
                  href: "https://instagram.com",
                },
              ].map(({ icon: Icon, label, value, sub, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="rounded-xl border border-border bg-bgSubtle hover:border-accent hover:bg-card transition-all duration-200 block"
                  style={{ padding: "16px" }}
                >
                  <Icon className="text-textMuted" style={{ width: "16px", height: "16px", marginBottom: "10px" }} />
                  <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.2em", marginBottom: "4px" }}>{label}</p>
                  <p className="text-text font-medium" style={{ fontSize: "13px", marginBottom: "2px" }}>{value}</p>
                  <p className="text-textMuted" style={{ fontSize: "11px" }}>{sub}</p>
                </a>
              ))}
            </div>

            {/* Hours */}
            <div className="rounded-xl border border-border" style={{ padding: "20px" }}>
              <p className="text-text font-semibold" style={{ fontSize: "13px", marginBottom: "14px" }}>Opening hours</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { day: "Monday – Friday", hours: "10:00 – 20:00" },
                  { day: "Saturday", hours: "09:00 – 18:00" },
                  { day: "Sunday", hours: "11:00 – 17:00" },
                ].map(({ day, hours }) => (
                  <div key={day} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="text-textMuted" style={{ fontSize: "13px" }}>{day}</span>
                    <span className="text-text" style={{ fontSize: "13px" }}>{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: message form */}
          <div className="rounded-xl border border-border" style={{ padding: "32px" }}>
            <p className="text-text font-semibold" style={{ fontSize: "18px", marginBottom: "6px" }}>Send a message</p>
            <p className="text-textMuted" style={{ fontSize: "13px", marginBottom: "24px" }}>
              Fill out the form and we'll respond via WhatsApp or email within a few hours.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="text-textMuted" style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className={inputClass}
                  style={{ fontSize: "14px", padding: "10px 14px" }}
                />
              </div>

              <div>
                <label className="text-textMuted" style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  style={{ fontSize: "14px", padding: "10px 14px" }}
                />
              </div>

              <div>
                <label className="text-textMuted" style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className={inputClass}
                  style={{ fontSize: "14px", padding: "10px 14px", resize: "vertical" }}
                />
              </div>

              <button
                type="button"
                id="contact-submit"
                onClick={handleSend}
                className="w-full rounded-md bg-accent text-white font-medium hover:bg-accentStrong transition-colors duration-200"
                style={{ padding: "12px", fontSize: "14px" }}
              >
                Send via WhatsApp
              </button>

              <p className="text-textMuted text-center" style={{ fontSize: "11px" }}>
                Or call us directly at{" "}
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                  +94 76 730 1586
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
