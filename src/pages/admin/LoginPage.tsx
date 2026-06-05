import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase, supabaseAvailability } from "../../lib/supabase";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(Boolean(supabase));
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const destination = state?.from?.pathname?.startsWith("/admin") ? state.from.pathname : "/admin";

  useEffect(() => {
    if (!supabase) {
      return;
    }

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        setAuthenticated(Boolean(data.session));
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError(`Supabase env missing: ${supabaseAvailability.missingKeys.join(", ")}.`);
      return;
    }

    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate(destination, { replace: true });
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-border border-t-text rounded-full animate-spin" />
      </div>
    );
  }

  if (authenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-textMuted">Admin Login</p>
          <h1 className="text-xl font-semibold">Control Panel Access</h1>
          <p className="text-xs text-textMuted">
            Sign in with a Supabase Auth account to manage PlayStation.lk.
          </p>
        </div>

        {!supabaseAvailability.enabled ? (
          <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600">
            Supabase env missing: {supabaseAvailability.missingKeys.join(", ")}. Admin login is
            disabled until these values are configured.
          </div>
        ) : null}

        <label className="space-y-1 block">
          <span className="text-xs text-textMuted">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-border bg-bgSubtle px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-xs text-textMuted">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-border bg-bgSubtle px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        {error ? <p className="text-xs text-red-500">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-md bg-text text-bg py-3 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
          disabled={busy || !supabaseAvailability.enabled}
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
