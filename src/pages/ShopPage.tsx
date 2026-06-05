import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import type { Category, Product } from "../types";

type ShopPageProps = {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
};

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
];

function matchCategory(productCategory: string, filter: string): boolean {
  if (filter === "All") return true;
  const p = productCategory.toLowerCase();
  const f = filter.toLowerCase();
  return p === f || p.includes(f) || f.includes(p);
}

export function ShopPage({ products, categories, onAddToCart }: ShopPageProps) {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(() => categoryParam || "All");
  const [sortBy, setSortBy] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
    else setActiveCategory("All");
  }, [categoryParam]);

  const allCategories = useMemo(() => {
    const cats = categories.map((c) => c.name);
    return ["All", ...cats];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const queryMatch = `${product.name} ${product.category} ${product.platform}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const categoryMatch = activeCategory === "All" || matchCategory(product.category, activeCategory);
      return queryMatch && categoryMatch;
    });

    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "name-asc") result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, query, activeCategory, sortBy]);

  return (
    <div className="bg-bg text-text min-h-screen">
      {/* Page header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: "40px", paddingBottom: "32px" }}>
          <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.3em", marginBottom: "8px" }}>
            PlayStation Hardware Store
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 className="text-text font-bold" style={{ fontSize: "28px", letterSpacing: "-0.01em", marginBottom: "4px" }}>
                {activeCategory === "All" ? "All Products" : activeCategory}
              </h1>
              <p className="text-textMuted" style={{ fontSize: "13px" }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available
              </p>
            </div>
            {/* Sort + mobile filter trigger */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-border bg-bg text-text"
                style={{ fontSize: "13px", padding: "8px 12px", outline: "none" }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="md:hidden flex items-center gap-2 rounded-md border border-border text-textMuted hover:text-text transition-colors"
                style={{ fontSize: "13px", padding: "8px 12px" }}
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal style={{ width: "14px", height: "14px" }} />
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: "32px", paddingBottom: "64px" }}>
        <div className="lg:grid" style={{ gridTemplateColumns: "220px 1fr", gap: "48px", display: "grid" }}>

          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden lg:block">
            <div style={{ position: "sticky", top: "80px", display: "flex", flexDirection: "column", gap: "32px" }}>
              {/* Search */}
              <div>
                <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", marginBottom: "12px" }}>
                  Search
                </p>
                <div style={{ position: "relative" }}>
                  <Search className="text-textMuted" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px" }} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full border border-border rounded-md bg-bg text-text"
                    style={{ fontSize: "13px", padding: "9px 12px 9px 34px", outline: "none" }}
                  />
                </div>
              </div>

              {/* Category filter */}
              <div>
                <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", marginBottom: "12px" }}>
                  Category
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`text-left rounded-md transition-colors duration-150 ${
                        activeCategory === cat
                          ? "bg-accentSoft text-accent font-medium"
                          : "text-textMuted hover:text-text hover:bg-bgSubtle"
                      }`}
                      style={{ fontSize: "13px", padding: "8px 10px" }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {(query || activeCategory !== "All") && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setActiveCategory("All"); setSortBy("default"); }}
                  className="flex items-center gap-2 text-textMuted hover:text-text transition-colors"
                  style={{ fontSize: "12px" }}
                >
                  <X style={{ width: "12px", height: "12px" }} />
                  Clear filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Product grid ── */}
          <main>
            {/* Active filter chips (desktop) */}
            {(query || activeCategory !== "All") && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                {activeCategory !== "All" && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-accentSoft text-accent"
                    style={{ fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}
                    onClick={() => setActiveCategory("All")}
                  >
                    {activeCategory}
                    <X style={{ width: "10px", height: "10px" }} />
                  </span>
                )}
                {query && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-bgSubtle text-textMuted"
                    style={{ fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}
                    onClick={() => setQuery("")}
                  >
                    "{query}"
                    <X style={{ width: "10px", height: "10px" }} />
                  </span>
                )}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-border bg-bgSubtle" style={{ padding: "48px 24px", textAlign: "center" }}>
                <p className="text-textMuted" style={{ fontSize: "14px" }}>No products found for the current filters.</p>
                <button
                  type="button"
                  onClick={() => { setQuery(""); setActiveCategory("All"); }}
                  className="text-accent hover:underline"
                  style={{ fontSize: "13px", marginTop: "12px", display: "inline-block" }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "16px" }}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 bg-bg border-l border-border" style={{ width: "280px", padding: "24px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <p className="text-text font-semibold" style={{ fontSize: "15px" }}>Filters</p>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="text-textMuted hover:text-text">
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: "24px" }}>
              <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", marginBottom: "10px" }}>Search</p>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full border border-border rounded-md bg-bg text-text"
                style={{ fontSize: "13px", padding: "9px 12px", outline: "none" }}
              />
            </div>

            {/* Categories */}
            <div>
              <p className="text-textMuted uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", marginBottom: "10px" }}>Category</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setActiveCategory(cat); setMobileFiltersOpen(false); }}
                    className={`text-left rounded-md transition-colors ${activeCategory === cat ? "bg-accentSoft text-accent font-medium" : "text-textMuted hover:text-text hover:bg-bgSubtle"}`}
                    style={{ fontSize: "13px", padding: "10px 10px" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {(query || activeCategory !== "All") && (
              <button
                type="button"
                onClick={() => { setQuery(""); setActiveCategory("All"); setMobileFiltersOpen(false); }}
                className="flex items-center gap-2 text-textMuted hover:text-text transition-colors"
                style={{ fontSize: "12px", marginTop: "20px" }}
              >
                <X style={{ width: "12px", height: "12px" }} />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
