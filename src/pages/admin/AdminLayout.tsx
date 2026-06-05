import {
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Sun,
  Tags,
  X,
} from "lucide-react";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type AdminLayoutProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: Tags },
  { label: "Landing Page", to: "/admin/landing", icon: Layers },
];

const sidebarStyle: CSSProperties = {
  width: "260px",
  borderRight: "1px solid var(--color-border)",
  background: "var(--color-card)",
  minHeight: "100vh",
  position: "sticky",
  top: 0,
  padding: "18px",
};

const topButtonStyle: CSSProperties = {
  height: "36px",
  width: "36px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "10px",
  color: "var(--color-muted)",
};

function titleFromPath(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.includes("/products/new")) return "New Product";
  if (pathname.includes("/products/") && pathname.includes("/edit")) return "Edit Product";
  if (pathname.includes("/products")) return "Products";
  if (pathname.includes("/categories")) return "Categories";
  if (pathname.includes("/landing")) return "Landing Page";
  return "Admin";
}

export function AdminLayout({ theme, onToggleTheme }: AdminLayoutProps) {
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("Admin");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    void supabase?.auth
      .getUser()
      .then(({ data }) => {
        if (data.user?.email) {
          setEmail(data.user.email);
        }
      })
      .catch(() => undefined);
  }, []);

  const pageTitle = useMemo(() => titleFromPath(location.pathname), [location.pathname]);

  async function logout() {
    await supabase?.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  const sidebar = (
    <aside style={sidebarStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <Link to="/admin" style={{ display: "block" }}>
          <p className="text-xs uppercase tracking-widest text-textMuted">PlayStation.lk</p>
          <h1 style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>Admin</h1>
        </Link>
        <button
          type="button"
          className="lg:hidden"
          style={topButtonStyle}
          onClick={() => setMobileOpen(false)}
          aria-label="Close admin navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              fontSize: "13px",
              color: isActive ? "var(--color-text)" : "var(--color-muted)",
              background: isActive ? "var(--color-accent-soft)" : "transparent",
            })}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "32px", paddingTop: "18px", borderTop: "1px solid var(--color-border)" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-muted)",
            fontSize: "12px",
          }}
        >
          <Home className="h-4 w-4" />
          View storefront
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-bg text-text" style={{ display: "flex" }}>
      <div className="hidden lg:block">{sidebar}</div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">{sidebar}</div>
        </div>
      ) : null}

      <div style={{ minWidth: 0, flex: 1 }}>
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "0 18px",
            position: "sticky",
            top: 0,
            zIndex: 90,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <button
              type="button"
              className="lg:hidden"
              style={topButtonStyle}
              onClick={() => setMobileOpen(true)}
              aria-label="Open admin navigation"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div style={{ minWidth: 0 }}>
              <p className="text-xs uppercase tracking-widest text-textMuted">Admin / {pageTitle}</p>
              <h2 style={{ fontSize: "18px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
                {pageTitle}
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              style={topButtonStyle}
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <ThemeIcon className="h-4 w-4" />
            </button>
            <div className="hidden md:block" style={{ textAlign: "right", maxWidth: "220px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
                {email}
              </p>
              <p className="text-textMuted" style={{ fontSize: "11px" }}>
                Authenticated admin
              </p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              style={{
                ...topButtonStyle,
                width: "auto",
                padding: "0 12px",
                gap: "8px",
                color: "var(--color-text)",
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block" style={{ fontSize: "12px", fontWeight: 700 }}>
                Logout
              </span>
            </button>
          </div>
        </header>

        <main style={{ padding: "22px", maxWidth: "1280px", margin: "0 auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
