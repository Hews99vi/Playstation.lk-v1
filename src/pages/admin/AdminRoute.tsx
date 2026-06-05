import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type AdminRouteProps = {
  children: ReactNode;
};

export function AdminRoute({ children }: AdminRouteProps) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "authenticated" | "guest">("loading");

  useEffect(() => {
    if (!supabase) {
      setStatus("guest");
      return;
    }

    let active = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) {
          setStatus(data.session ? "authenticated" : "guest");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("guest");
        }
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "authenticated" : "guest");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-border border-t-text rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-textMuted">Checking admin session...</p>
        </div>
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
