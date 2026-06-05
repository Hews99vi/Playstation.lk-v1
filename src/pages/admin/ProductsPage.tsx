import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getStockDisplay, stockToneColor } from "../../lib/stock";
import { adminProductsService } from "../../services/adminProducts";
import type { Category, Product } from "../../types";

type ProductsPageProps = {
  products: Product[];
  categories: Category[];
  onRefresh: () => Promise<void>;
};

const PAGE_SIZE = 8;

export function ProductsPage({ products, categories, onRefresh }: ProductsPageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [stock, setStock] = useState("All");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const queryMatch = `${product.name} ${product.platform} ${product.category}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const categoryMatch = category === "All" || product.category === category;
      const stockDisplay = getStockDisplay(product);
      const stockMatch =
        stock === "All" ||
        (stock === "service" && stockDisplay.isService) ||
        (stock === "out-of-stock" && !stockDisplay.canPurchase) ||
        (stock === "limited" && stockDisplay.tone === "orange") ||
        (stock === "in-stock" && stockDisplay.tone === "green");
      return queryMatch && categoryMatch && stockMatch;
    });
  }, [category, products, query, stock]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function deleteProduct() {
    if (!pendingDelete) return;
    setBusy(true);
    setError("");

    try {
      await adminProductsService.deleteProduct(pendingDelete.id);
      await onRefresh();
      setPendingDelete(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-textMuted">Products</p>
          <h1 className="text-2xl font-semibold">Catalog inventory</h1>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-text text-bg px-4 py-3 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Search</span>
            <div style={{ position: "relative" }}>
              <Search
                className="text-textMuted"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px" }}
              />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-border bg-bgSubtle py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
                style={{ paddingLeft: "36px", paddingRight: "12px" }}
                placeholder="Search products"
              />
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Category</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-border bg-bgSubtle px-3 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="All">All categories</option>
              {categories.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Stock</span>
            <select
              value={stock}
              onChange={(event) => {
                setStock(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-border bg-bgSubtle px-3 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="All">All stock statuses</option>
              <option value="in-stock">In stock</option>
              <option value="limited">Low stock</option>
              <option value="out-of-stock">Out of stock</option>
              <option value="service">Services</option>
            </select>
          </label>
        </div>

        {error ? <p className="text-xs text-red-500">{error}</p> : null}

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse" style={{ minWidth: "760px" }}>
            <thead className="bg-bgSubtle">
              <tr>
                {["Image", "Name", "Price", "Category", "Stock", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className="text-left text-xs uppercase tracking-widest text-textMuted"
                    style={{ padding: "12px" }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => {
                const stockDisplay = getStockDisplay(product);

                return (
                <tr key={product.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "12px" }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="rounded-md border border-border"
                      style={{ width: "56px", height: "44px", objectFit: "cover" }}
                    />
                  </td>
                  <td style={{ padding: "12px" }}>
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-textMuted">{product.platform}</p>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <p className="text-sm font-semibold">LKR {product.price.toLocaleString()}</p>
                    {product.oldPrice ? (
                      <p className="text-xs text-textMuted line-through">LKR {product.oldPrice.toLocaleString()}</p>
                    ) : null}
                  </td>
                  <td className="text-sm" style={{ padding: "12px" }}>
                    {product.category}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      className="rounded-full border border-border px-3 py-1 text-xs"
                      style={{
                        color: stockDisplay.tone
                          ? stockToneColor(stockDisplay.tone)
                          : "var(--color-muted)",
                      }}
                    >
                      {stockDisplay.label ?? "Service item"}
                    </span>
                    {!stockDisplay.isService ? (
                      <p
                        className="text-xs"
                        style={{
                          marginTop: "6px",
                          color: stockDisplay.tone ? stockToneColor(stockDisplay.tone) : "var(--color-muted)",
                        }}
                      >
                        {product.stockCount} in inventory
                      </p>
                    ) : null}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/products/${encodeURIComponent(product.id)}/edit`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-textMuted hover:text-text transition-colors duration-200"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-red-500 hover:text-red-600 transition-colors duration-200"
                        onClick={() => setPendingDelete(product)}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}

              {!visible.length ? (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-textMuted" style={{ padding: "36px" }}>
                    No products match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-textMuted">
            Showing {visible.length} of {filtered.length} products
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-border px-3 py-2 text-xs text-textMuted disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>
            <span className="text-xs text-textMuted">
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              className="rounded-md border border-border px-3 py-2 text-xs text-textMuted disabled:opacity-50"
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {pendingDelete ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPendingDelete(null)} />
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-textMuted">Confirm Delete</p>
              <h2 className="text-lg font-semibold">Delete {pendingDelete.name}?</h2>
            </div>
            <p className="text-sm text-textMuted">
              This permanently removes the product from Supabase and the storefront catalog.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-xs text-textMuted"
                onClick={() => setPendingDelete(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-red-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                onClick={() => void deleteProduct()}
                disabled={busy}
              >
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
