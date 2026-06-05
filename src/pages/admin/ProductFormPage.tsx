import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isServiceProduct, stockStatusFromCount } from "../../lib/stock";
import { adminProductsService } from "../../services/adminProducts";
import type { Category, Product } from "../../types";

type ProductFormPageProps = {
  products: Product[];
  categories: Category[];
  onRefresh: () => Promise<void>;
};

type ProductFormState = {
  id: string;
  name: string;
  description: string;
  platform: string;
  category: string;
  price: string;
  oldPrice: string;
  stockStatus: Product["stockStatus"];
  stockCount: string;
  image: string;
  images: string;
  specs: string;
  details: string;
  rating: string;
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formFromProduct(product?: Product, fallbackCategory = ""): ProductFormState {
  return {
    id: product?.id ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    platform: product?.platform ?? "PlayStation 5",
    category: product?.category ?? fallbackCategory,
    price: product ? String(product.price) : "",
    oldPrice: product?.oldPrice ? String(product.oldPrice) : "",
    stockStatus: product?.stockStatus ?? "in-stock",
    stockCount: product ? String(product.stockCount) : "0",
    image: product?.image ?? "/assets/hero-ps5.jpg",
    images: product?.images?.join("\n") ?? "",
    specs: product?.specs.join("\n") ?? "",
    details: product?.details.join("\n") ?? "",
    rating: product ? String(product.rating) : "4.5",
  };
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProductFormPage({ products, categories, onRefresh }: ProductFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const decodedId = id ? decodeURIComponent(id) : "";
  const editing = Boolean(decodedId);
  const existing = useMemo(
    () => products.find((product) => product.id === decodedId),
    [decodedId, products],
  );
  const hasCategories = categories.length > 0;
  const fallbackCategory = categories[0]?.name ?? "";
  const [form, setForm] = useState<ProductFormState>(() => formFromProduct(existing, fallbackCategory));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const categoryExists = categories.some((category) => category.name === form.category);
  const formIsService = isServiceProduct({
    category: form.category,
    platform: form.platform.trim(),
  });

  useEffect(() => {
    setForm(formFromProduct(existing, fallbackCategory));
  }, [existing, fallbackCategory]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!hasCategories) {
      setError("Please create a category before saving products.");
      return;
    }

    if (!categoryExists) {
      setError("Choose an existing category before saving this product.");
      return;
    }

    const productId = editing ? decodedId : form.id.trim() || slugify(form.name);
    if (!productId) {
      setError("Add a product name or product ID before saving.");
      return;
    }

    const price = Number(form.price);
    const oldPrice = form.oldPrice.trim() ? Number(form.oldPrice) : undefined;
    const stockCount = formIsService ? 0 : Number(form.stockCount);
    const rating = Number(form.rating);

    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a valid positive number.");
      return;
    }

    if (oldPrice !== undefined && (!Number.isFinite(oldPrice) || oldPrice < 0)) {
      setError("Old price must be blank or a valid positive number.");
      return;
    }

    if (!Number.isInteger(stockCount) || stockCount < 0) {
      setError("Stock count must be a whole number of 0 or more.");
      return;
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    const product: Product = {
      id: productId,
      name: form.name.trim(),
      description: form.description.trim(),
      platform: form.platform.trim(),
      category: form.category,
      price,
      oldPrice,
      stockStatus: formIsService ? "in-stock" : stockStatusFromCount(stockCount),
      stockCount,
      image: form.image.trim(),
      images: lines(form.images),
      specs: lines(form.specs),
      details: lines(form.details),
      rating,
    };

    setBusy(true);
    try {
      await adminProductsService.saveProduct(product);
      await onRefresh();
      navigate("/admin/products");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save product.");
    } finally {
      setBusy(false);
    }
  }

  if (editing && !existing) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <p className="text-xs uppercase tracking-widest text-textMuted">Product not found</p>
        <h1 className="text-xl font-semibold">Unable to edit this product</h1>
        <Link to="/admin/products" className="text-sm text-accent underline">
          Return to products
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-md border border-border bg-bgSubtle px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/products" className="inline-flex items-center gap-2 text-xs text-textMuted hover:text-text">
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
          <h1 className="text-2xl font-semibold">{editing ? "Edit Product" : "New Product"}</h1>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-text text-bg px-4 py-3 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
          disabled={busy || !hasCategories || !categoryExists}
        >
          <Save className="h-4 w-4" />
          {busy ? "Saving..." : "Save Product"}
        </button>
      </div>

      {error ? <p className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">{error}</p> : null}
      {!hasCategories ? (
        <p className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600">
          Please create at least one category before adding or editing products.
        </p>
      ) : null}
      {hasCategories && !categoryExists ? (
        <p className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600">
          This product is using a missing category. Choose an existing category before saving.
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-textMuted">Basic Info</p>
          <h2 className="text-lg font-semibold">Product setup</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Product ID</span>
            <input
              value={editing ? decodedId : form.id}
              onChange={(event) => setForm((current) => ({ ...current, id: event.target.value }))}
              className={inputClass}
              disabled={editing}
              placeholder="auto-generated-from-name"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className={inputClass}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Platform</span>
            <input
              value={form.platform}
              onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value }))}
              className={inputClass}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Category</span>
            <select
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className={inputClass}
              disabled={!hasCategories}
            >
              {!hasCategories ? <option value="">No categories available</option> : null}
              {hasCategories && !categoryExists ? (
                <option value={form.category} disabled>
                  Missing category: {form.category || "none"}
                </option>
              ) : null}
              {categories.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs text-textMuted">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className={inputClass}
              rows={4}
              required
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-textMuted">Pricing And Stock</p>
          <h2 className="text-lg font-semibold">Availability</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Price</span>
            <input
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              className={inputClass}
              type="number"
              min={0}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Old Price</span>
            <input
              value={form.oldPrice}
              onChange={(event) => setForm((current) => ({ ...current, oldPrice: event.target.value }))}
              className={inputClass}
              type="number"
              min={0}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Stock Count</span>
            <input
              value={formIsService ? "Ignored" : form.stockCount}
              onChange={(event) => setForm((current) => ({ ...current, stockCount: event.target.value }))}
              className={inputClass}
              type={formIsService ? "text" : "number"}
              min={0}
              step={1}
              disabled={formIsService}
            />
          </label>
          <div className="block space-y-1">
            <span className="text-xs text-textMuted">Derived Stock</span>
            <div className="w-full rounded-md border border-border bg-bgSubtle px-4 py-3 text-sm text-text">
              {formIsService ? "Service item" : stockStatusFromCount(Number(form.stockCount) || 0)}
            </div>
          </div>
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Rating</span>
            <input
              value={form.rating}
              onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
              className={inputClass}
              type="number"
              min={0}
              max={5}
              step={0.1}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-textMuted">Media And Metadata</p>
          <h2 className="text-lg font-semibold">URLs, specs, and details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs text-textMuted">Main Image URL</span>
            <input
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
              className={inputClass}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Additional Image URLs</span>
            <textarea
              value={form.images}
              onChange={(event) => setForm((current) => ({ ...current, images: event.target.value }))}
              className={inputClass}
              rows={5}
              placeholder="One URL per line"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-textMuted">Specs</span>
            <textarea
              value={form.specs}
              onChange={(event) => setForm((current) => ({ ...current, specs: event.target.value }))}
              className={inputClass}
              rows={5}
              placeholder="One spec per line"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs text-textMuted">Additional Details</span>
            <textarea
              value={form.details}
              onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))}
              className={inputClass}
              rows={6}
              placeholder="One optional detail per line, e.g. warranty, included items, condition, compatibility"
            />
          </label>
        </div>
      </section>
    </form>
  );
}
