export function AboutPage() {
  return (
    <div className="bg-bg text-text min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-4xl space-y-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-textMuted">About Us</p>
        <h1 className="text-3xl font-semibold">About PlayStation.lk</h1>
        <p className="text-sm text-textMuted">
          We source authentic PlayStation hardware, build curated bundles, and restore consoles with
          precision. Every interaction is designed to feel deliberate, informed, and reliable.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Mission</h2>
            <p className="mt-2 text-sm text-textMuted">
              To be Sri Lanka&apos;s most trusted destination for premium gaming hardware and repairs.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">What We Carry</h2>
            <p className="mt-2 text-sm text-textMuted">
              PlayStation consoles, DualSense controllers, curated accessories, and verified pre-owned hardware.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
