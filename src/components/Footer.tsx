import { Link } from "react-router-dom";

const COLS = [
  {
    title: "Shop",
    links: [
      { label: "Store", to: "/shop" },
      { label: "Consoles", to: "/shop?category=PlayStation" },
      { label: "Accessories", to: "/shop?category=Controllers" },
      { label: "Games", to: "/shop?category=Games" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Repairs", to: "/repairs" },
      { label: "Diagnostics", to: "/repairs" },
      { label: "Trade-in", to: "/shop" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Admin Login", to: "/admin/login" },
      { label: "Order Status", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/about" },
      { label: "Warranty", to: "/about" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", to: "/about" },
      { label: "Our Team", to: "/about" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="site-footer"
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-bg)",
      }}
    >
      <div
        className="site-footer-inner"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "36px 40px 24px",
        }}
      >
        {/* Single grid — auto-fit handles responsive layout natively */}
        <div
          className="site-footer-grid"
          style={{
            display: "grid",
            gap: "24px",
          }}
        >
          {COLS.map(({ title, links }) => (
            <div key={title} className="site-footer-col">
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-text)",
                  marginBottom: "12px",
                }}
              >
                {title}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {links.map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    style={{
                      fontSize: "12px",
                      color: "var(--color-muted)",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="site-footer-bottom"
          style={{
            marginTop: "28px",
            paddingTop: "18px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <p style={{ fontSize: "11px", color: "var(--color-muted)" }}>
            © {new Date().getFullYear()} PlayStation.lk. All rights reserved.
          </p>
          <p style={{ fontSize: "11px", color: "var(--color-muted)", opacity: 0.5 }}>
            Sri Lanka&apos;s Premier Gaming Authority
          </p>
        </div>
      </div>
    </footer>
  );
}
