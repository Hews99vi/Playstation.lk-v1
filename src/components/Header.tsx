import { Menu, Moon, ShoppingCart, Sun, User, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

type HeaderProps = {
  cartCount: number;
  isAdmin: boolean;
  theme: "light" | "dark";
  onLogout: () => void;
  onToggleTheme: () => void;
};

const navItems = [
  { label: "Store", to: "/shop" },
  { label: "PlayStation", to: "/shop?category=PlayStation" },
  { label: "Laptop", to: "/shop?category=Laptop" },
  { label: "Repair", to: "/repairs" },
  { label: "Support", to: "/contact" },
];

export function Header({ cartCount, isAdmin, theme, onLogout, onToggleTheme }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <header className="sticky top-0 z-[120] border-b border-border bg-bg/95 backdrop-blur-md">
      <div
        className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10"
        style={{ height: "56px" }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="text-text font-semibold shrink-0"
          style={{ fontSize: "15px", letterSpacing: "0.01em" }}
        >
          PlayStation.lk
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center" style={{ gap: "28px" }}>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{ fontSize: "13px" }}
              className="text-textMuted hover:text-text transition-colors duration-150"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right icons */}
        <div className="hidden md:flex items-center" style={{ gap: "2px" }}>
          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center justify-center text-textMuted hover:text-text hover:bg-bgSubtle transition-colors duration-150 rounded-full"
            style={{ width: "36px", height: "36px" }}
            aria-label="Open cart"
          >
            <ShoppingCart style={{ width: "16px", height: "16px" }} />
            {cartCount > 0 && (
              <span
                className="absolute bg-accent text-white font-bold text-center rounded-full"
                style={{
                  top: "2px",
                  right: "2px",
                  width: "16px",
                  height: "16px",
                  fontSize: "9px",
                  lineHeight: "16px",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Theme toggle */}
          <button
            type="button"
            id="theme-toggle-desktop"
            className="flex items-center justify-center text-textMuted hover:text-text hover:bg-bgSubtle transition-colors duration-150 rounded-full"
            style={{ width: "36px", height: "36px" }}
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <ThemeIcon style={{ width: "16px", height: "16px" }} />
          </button>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "18px",
              background: "var(--color-border)",
              margin: "0 6px",
            }}
          />

          {/* Admin / Logout */}
          {isAdmin ? (
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-border text-textMuted hover:text-text hover:border-text transition-colors duration-150"
              style={{ height: "32px", padding: "0 14px", gap: "6px", fontSize: "12px" }}
              onClick={onLogout}
            >
              <User style={{ width: "13px", height: "13px" }} />
              Logout
            </button>
          ) : (
            <Link
              to="/admin/login"
              className="inline-flex items-center rounded-full border border-border text-textMuted hover:text-text hover:border-text transition-colors duration-150"
              style={{ height: "32px", padding: "0 14px", gap: "6px", fontSize: "12px" }}
            >
              <User style={{ width: "13px", height: "13px" }} />
              Admin
            </Link>
          )}
        </div>

        {/* Mobile right */}
        <div className="mobile-header-actions flex md:hidden items-center" style={{ gap: "4px" }}>
          <Link
            to="/cart"
            className="relative flex items-center justify-center text-textMuted hover:text-text transition-colors duration-150 rounded-full"
            style={{ width: "36px", height: "36px" }}
            aria-label="Open cart"
          >
            <ShoppingCart style={{ width: "16px", height: "16px" }} />
            {cartCount > 0 && (
              <span
                className="absolute bg-accent text-white font-bold text-center rounded-full"
                style={{
                  top: "2px",
                  right: "2px",
                  width: "15px",
                  height: "15px",
                  fontSize: "9px",
                  lineHeight: "15px",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            id="theme-toggle-mobile"
            className="flex items-center justify-center text-textMuted hover:text-text transition-colors duration-150 rounded-full"
            style={{ width: "36px", height: "36px" }}
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <ThemeIcon style={{ width: "16px", height: "16px" }} />
          </button>

          <button
            type="button"
            className="flex items-center justify-center text-text rounded-full"
            style={{ width: "36px", height: "36px" }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X style={{ width: "18px", height: "18px" }} />
            ) : (
              <Menu style={{ width: "18px", height: "18px" }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="mobile-nav-panel md:hidden border-t border-border bg-bg"
          style={{ padding: "8px 16px 16px" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="text-textMuted hover:text-text transition-colors duration-150"
              style={{
                fontSize: "14px",
                padding: "10px 4px",
                display: "block",
                borderBottom: "1px solid transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
          <div
            className="border-t border-border"
            style={{
              marginTop: "8px",
              paddingTop: "12px",
              display: "flex",
              gap: "16px",
            }}
          >
            {isAdmin ? (
              <button
                type="button"
                className="text-textMuted hover:text-text"
                style={{ fontSize: "13px" }}
                onClick={() => { setMobileOpen(false); onLogout(); }}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="text-textMuted hover:text-text"
                style={{ fontSize: "13px" }}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
