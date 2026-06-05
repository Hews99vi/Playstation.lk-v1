import { ArrowDown, ArrowUp, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adminHomeSectionsService } from "../../services/adminHomeSections";
import type { HomeSection, Product } from "../../types";

type LandingManagerPageProps = {
  products: Product[];
  homeSections: HomeSection[];
  onRefresh: () => Promise<void>;
};

function makeDrafts(sections: HomeSection[]): Record<string, HomeSection> {
  return Object.fromEntries(sections.map((section) => [section.id, { ...section }]));
}

function moveVisibleProduct(
  productIds: string[],
  productId: string,
  direction: -1 | 1,
  visibleProductIds: Set<string>,
): string[] {
  const visibleIds = productIds.filter((id) => visibleProductIds.has(id));
  const visibleIndex = visibleIds.indexOf(productId);
  const targetVisibleId = visibleIds[visibleIndex + direction];

  if (visibleIndex < 0 || !targetVisibleId) return productIds;

  const currentIndex = productIds.indexOf(productId);
  const targetIndex = productIds.indexOf(targetVisibleId);

  if (currentIndex < 0 || targetIndex < 0) return productIds;

  const copy = [...productIds];
  copy[currentIndex] = targetVisibleId;
  copy[targetIndex] = productId;
  return copy;
}

export function LandingManagerPage({ products, homeSections, onRefresh }: LandingManagerPageProps) {
  const sortedSections = useMemo(
    () => [...homeSections].sort((a, b) => a.sortOrder - b.sortOrder),
    [homeSections],
  );
  const [drafts, setDrafts] = useState<Record<string, HomeSection>>(() => makeDrafts(sortedSections));
  const [dirtySectionIds, setDirtySectionIds] = useState<Set<string>>(() => new Set());
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const productIds = useMemo(() => new Set(products.map((product) => product.id)), [products]);

  useEffect(() => {
    setDrafts((current) => {
      const next: Record<string, HomeSection> = {};

      sortedSections.forEach((section) => {
        next[section.id] = dirtySectionIds.has(section.id)
          ? current[section.id] ?? { ...section }
          : { ...section };
      });

      return next;
    });
  }, [dirtySectionIds, sortedSections]);

  function updateDraft(
    sectionId: string,
    update: Partial<HomeSection> | ((draft: HomeSection) => HomeSection),
  ) {
    setDirtySectionIds((current) => new Set(current).add(sectionId));
    setDrafts((current) => {
      const currentDraft = current[sectionId] ?? sortedSections.find((section) => section.id === sectionId);
      if (!currentDraft) return current;

      return {
        ...current,
        [sectionId]:
          typeof update === "function"
            ? update(currentDraft)
            : {
                ...currentDraft,
                ...update,
              },
      };
    });
  }

  function toggleProduct(sectionId: string, productId: string) {
    updateDraft(sectionId, (draft) => {
      const exists = draft.productIds.includes(productId);
      return {
        ...draft,
        productIds: exists
          ? draft.productIds.filter((id) => id !== productId)
          : [...draft.productIds, productId],
      };
    });
  }

  function moveProduct(sectionId: string, productId: string, direction: -1 | 1) {
    updateDraft(sectionId, (draft) => ({
      ...draft,
      productIds: moveVisibleProduct(draft.productIds, productId, direction, productIds),
    }));
  }

  async function saveSection(sectionId: string) {
    const draft = drafts[sectionId];
    if (!draft) return;
    const cleanedProductIds = draft.productIds.filter((productId) => productIds.has(productId));
    const cleanedDraft = { ...draft, productIds: cleanedProductIds };

    setBusyId(sectionId);
    setError("");
    setMessage("");

    try {
      await adminHomeSectionsService.updateSection(cleanedDraft);
      await adminHomeSectionsService.setSectionProducts(sectionId, cleanedProductIds);
      await onRefresh();
      setDirtySectionIds((current) => {
        const next = new Set(current);
        next.delete(sectionId);
        return next;
      });
      setMessage(`${cleanedDraft.title} saved.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save landing section.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-textMuted">Landing Page</p>
        <h1 className="text-2xl font-semibold">Homepage sections</h1>
      </div>

      {message ? <p className="text-xs text-emerald-600">{message}</p> : null}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      <div className="space-y-5">
        {sortedSections.map((section) => {
          const draft = drafts[section.id] ?? section;
          const selectedProducts = draft.productIds
            .map((productId) => products.find((product) => product.id === productId))
            .filter((product): product is Product => Boolean(product));
          const missingProductCount = draft.productIds.length - selectedProducts.length;

          return (
            <section key={section.id} className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-textMuted">{section.id}</p>
                  <h2 className="text-xl font-semibold">{draft.title || "Untitled section"}</h2>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-text text-bg px-4 py-3 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                  disabled={busyId === section.id}
                  onClick={() => void saveSection(section.id)}
                >
                  <Save className="h-4 w-4" />
                  {busyId === section.id ? "Saving..." : "Save Section"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <label className="block space-y-1 lg:col-span-2">
                  <span className="text-xs text-textMuted">Title</span>
                  <input
                    value={draft.title}
                    onChange={(event) => updateDraft(section.id, { title: event.target.value })}
                    className="w-full rounded-md border border-border bg-bgSubtle px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </label>
                <label className="block space-y-1 lg:col-span-2">
                  <span className="text-xs text-textMuted">Subtitle</span>
                  <input
                    value={draft.subtitle}
                    onChange={(event) => updateDraft(section.id, { subtitle: event.target.value })}
                    className="w-full rounded-md border border-border bg-bgSubtle px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-textMuted">Sort Order</span>
                  <input
                    value={draft.sortOrder}
                    onChange={(event) =>
                      updateDraft(section.id, { sortOrder: Number(event.target.value) || 0 })
                    }
                    type="number"
                    className="w-full rounded-md border border-border bg-bgSubtle px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-textMuted">Accent Color</span>
                  <select
                    value={draft.accentColor}
                    onChange={(event) =>
                      updateDraft(section.id, {
                        accentColor: event.target.value as HomeSection["accentColor"],
                      })
                    }
                    className="w-full rounded-md border border-border bg-bgSubtle px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="white">White</option>
                    <option value="blue">Blue</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 rounded-md border border-border bg-bgSubtle px-4 py-3">
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(event) => updateDraft(section.id, { enabled: event.target.checked })}
                    style={{ accentColor: "var(--color-accent)" }}
                  />
                  <span className="text-sm">Visible on homepage</span>
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-md border border-border bg-bgSubtle p-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-textMuted">Assigned Order</p>
                    <p className="text-sm font-semibold">{selectedProducts.length} selected products</p>
                  </div>
                  {missingProductCount > 0 ? (
                    <p className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600">
                      {missingProductCount} deleted product reference
                      {missingProductCount === 1 ? "" : "s"} will be removed on save.
                    </p>
                  ) : null}
                  <div className="space-y-2">
                    {selectedProducts.map((product) => {
                      const visibleIndex = selectedProducts.findIndex((item) => item.id === product.id);

                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3"
                        >
                          <div style={{ minWidth: 0 }}>
                            <p className="text-sm font-semibold truncate">{product.name}</p>
                            <p className="text-xs text-textMuted">{product.id}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-textMuted disabled:opacity-50"
                              disabled={visibleIndex === 0}
                              onClick={() => moveProduct(section.id, product.id, -1)}
                              aria-label={`Move ${product.name} up`}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-textMuted disabled:opacity-50"
                              disabled={visibleIndex === selectedProducts.length - 1}
                              onClick={() => moveProduct(section.id, product.id, 1)}
                              aria-label={`Move ${product.name} down`}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {!selectedProducts.length ? (
                      <p className="rounded-md border border-border bg-card p-3 text-sm text-textMuted">
                        No products assigned.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-md border border-border bg-bgSubtle p-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-textMuted">Product Assignment</p>
                    <p className="text-sm font-semibold">Select products for this section</p>
                  </div>
                  <div className="space-y-2" style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {products.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
                      >
                        <input
                          type="checkbox"
                          checked={draft.productIds.includes(product.id)}
                          onChange={() => toggleProduct(section.id, product.id)}
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        <img
                          src={product.image}
                          alt=""
                          className="rounded-md border border-border"
                          style={{ width: "44px", height: "34px", objectFit: "cover" }}
                        />
                        <span style={{ minWidth: 0 }}>
                          <span className="block text-sm font-semibold truncate">{product.name}</span>
                          <span className="block text-xs text-textMuted">{product.category}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
