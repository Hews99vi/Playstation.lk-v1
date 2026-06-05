import { Layers, PackagePlus, Tags } from "lucide-react";
import { Link } from "react-router-dom";
import { getStockDisplay } from "../../lib/stock";
import type { Category, HomeSection, Product } from "../../types";

type DashboardPageProps = {
  products: Product[];
  categories: Category[];
  homeSections: HomeSection[];
};

function statCard(label: string, value: number, helper: string) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 space-y-2">
      <p className="text-xs uppercase tracking-widest text-textMuted">{label}</p>
      <p style={{ fontSize: "32px", fontWeight: 800 }}>{value.toLocaleString()}</p>
      <p className="text-xs text-textMuted">{helper}</p>
    </article>
  );
}

export function DashboardPage({ products, categories, homeSections }: DashboardPageProps) {
  const activeSections = homeSections.filter((section) => section.enabled).length;
  const physicalProducts = products.filter((product) => !getStockDisplay(product).isService);
  const stockAttention = physicalProducts.filter((product) => {
    const stock = getStockDisplay(product);
    return !stock.canPurchase || stock.tone === "orange";
  }).length;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCard("Total Products", products.length, `${stockAttention} need stock attention`)}
        {statCard("Categories", categories.length, "Active catalog groups")}
        {statCard("Landing Sections", activeSections, `${homeSections.length} configured sections`)}
        {statCard(
          "Featured Products",
          homeSections.reduce((sum, section) => sum + section.productIds.length, 0),
          "Assigned across homepage sections",
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-textMuted">Quick Actions</p>
          <h2 className="text-xl font-semibold">Common admin tasks</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/products/new"
            className="rounded-md border border-border bg-bgSubtle p-4 hover:bg-accentSoft transition-colors duration-200"
          >
            <PackagePlus className="h-5 w-5 text-accent" />
            <p className="mt-3 text-sm font-semibold">Add Product</p>
            <p className="text-xs text-textMuted">Create a new product row.</p>
          </Link>
          <Link
            to="/admin/categories"
            className="rounded-md border border-border bg-bgSubtle p-4 hover:bg-accentSoft transition-colors duration-200"
          >
            <Tags className="h-5 w-5 text-accent" />
            <p className="mt-3 text-sm font-semibold">Manage Categories</p>
            <p className="text-xs text-textMuted">Add, rename, or clean up categories.</p>
          </Link>
          <Link
            to="/admin/landing"
            className="rounded-md border border-border bg-bgSubtle p-4 hover:bg-accentSoft transition-colors duration-200"
          >
            <Layers className="h-5 w-5 text-accent" />
            <p className="mt-3 text-sm font-semibold">Edit Landing Page</p>
            <p className="text-xs text-textMuted">Control homepage product sections.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
