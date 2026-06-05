import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { adminCategoriesService } from "../../services/adminCategories";
import type { Category, Product } from "../../types";

type CategoriesPageProps = {
  categories: Category[];
  products: Product[];
  onRefresh: () => Promise<void>;
};

export function CategoriesPage({ categories, products, onRefresh }: CategoriesPageProps) {
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState("");
  const [editingName, setEditingName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const counts = useMemo(() => {
    const grouped = new Map<string, number>();
    products.forEach((product) => {
      grouped.set(product.category, (grouped.get(product.category) ?? 0) + 1);
    });
    return grouped;
  }, [products]);

  async function runMutation(action: () => Promise<void>, success: string): Promise<boolean> {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await action();
      await onRefresh();
      setMessage(success);
      return true;
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to update categories.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    const saved = await runMutation(async () => adminCategoriesService.addCategory(name), "Category added.");
    if (saved) {
      setNewName("");
    }
  }

  async function renameCategory(name: string) {
    const nextName = editingName.trim();
    if (!nextName || nextName === name) {
      setEditing("");
      return;
    }

    const saved = await runMutation(
      async () => adminCategoriesService.renameCategory(name, nextName),
      "Category renamed.",
    );
    if (saved) {
      setEditing("");
      setEditingName("");
    }
  }

  async function deleteCategory() {
    if (!pendingDelete) return;

    const deleted = await runMutation(
      async () => adminCategoriesService.deleteCategory(pendingDelete.name),
      "Category deleted.",
    );
    if (deleted) {
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-textMuted">Categories</p>
        <h1 className="text-2xl font-semibold">Catalog groups</h1>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <form onSubmit={addCategory} className="flex flex-wrap gap-3">
          <label className="flex-1 min-w-[240px] block space-y-1">
            <span className="text-xs text-textMuted">New category</span>
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              className="w-full rounded-md border border-border bg-bgSubtle px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Accessories"
            />
          </label>
          <button
            type="submit"
            className="self-end inline-flex items-center gap-2 rounded-md bg-text text-bg px-4 py-3 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
            disabled={busy || !newName.trim()}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </form>

        {message ? <p className="text-xs text-emerald-600">{message}</p> : null}
        {error ? <p className="text-xs text-red-500">{error}</p> : null}

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse" style={{ minWidth: "560px" }}>
            <thead className="bg-bgSubtle">
              <tr>
                {["Name", "Products", "Actions"].map((heading) => (
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
              {categories.map((category) => {
                const isEditing = editing === category.name;
                const productCount = counts.get(category.name) ?? 0;

                return (
                  <tr key={category.name} style={{ borderTop: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "12px" }}>
                      {isEditing ? (
                        <input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          className="w-full rounded-md border border-border bg-bgSubtle px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      ) : (
                        <p className="text-sm font-semibold">{category.name}</p>
                      )}
                    </td>
                    <td className="text-sm text-textMuted" style={{ padding: "12px" }}>
                      {productCount}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-textMuted hover:text-text"
                            disabled={busy}
                            onClick={() => void renameCategory(category.name)}
                            aria-label={`Save ${category.name}`}
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-textMuted hover:text-text"
                            disabled={busy}
                            onClick={() => {
                              setEditing("");
                              setEditingName("");
                            }}
                            aria-label="Cancel edit"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-textMuted hover:text-text"
                            onClick={() => {
                              setEditing(category.name);
                              setEditingName(category.name);
                            }}
                            aria-label={`Edit ${category.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-red-500 hover:text-red-600 disabled:opacity-50"
                            disabled={busy || productCount > 0}
                            onClick={() => setPendingDelete(category)}
                            title={
                              productCount > 0
                                ? "Move or delete products in this category first."
                                : `Delete ${category.name}`
                            }
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
              This permanently removes the category. Products must be moved out of the category
              before deletion is allowed.
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
                onClick={() => void deleteCategory()}
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
