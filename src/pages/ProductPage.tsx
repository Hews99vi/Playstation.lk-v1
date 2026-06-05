import { MessageCircle, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStockDisplay, stockToneColor } from "../lib/stock";
import { buildProductWhatsAppUrl } from "../lib/whatsapp";
import type { Product } from "../types";

type ProductPageProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
};

export function ProductPage({ products, onAddToCart }: ProductPageProps) {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }

    return Array.from(
      new Set([product.image, ...(product.images ?? [])].map((image) => image.trim()).filter(Boolean)),
    );
  }, [product]);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    setSelectedImage(galleryImages[0] ?? "");
  }, [galleryImages]);

  if (!product) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-sm text-textMuted">Product not found.</p>
          <Link to="/shop" className="text-xs text-text underline uppercase tracking-[0.2em]">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const stock = getStockDisplay(product);
  const activeImage = selectedImage || galleryImages[0] || product.image;
  const whatsappUrl = buildProductWhatsAppUrl(product);

  return (
    <div className="product-page bg-bg text-text min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="product-detail-grid grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="space-y-3">
              <div
                className="product-media-frame rounded-xl border border-border overflow-hidden bg-card"
                style={{ aspectRatio: "4 / 3" }}
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full"
                  style={{ objectFit: "contain" }}
                />
              </div>
              {galleryImages.length > 1 ? (
                <div
                  className="product-thumb-strip flex"
                  style={{ gap: "10px", overflowX: "auto", paddingBottom: "4px" }}
                  aria-label={`${product.name} image gallery`}
                >
                  {galleryImages.map((image, index) => {
                    const isSelected = image === activeImage;

                    return (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className="shrink-0 rounded-md border bg-card transition-opacity duration-150"
                        style={{
                          width: "76px",
                          height: "76px",
                          borderColor: isSelected ? "var(--color-text)" : "var(--color-border)",
                          opacity: isSelected ? 1 : 0.72,
                          padding: "3px",
                        }}
                        aria-label={`View image ${index + 1} of ${galleryImages.length}`}
                        aria-pressed={isSelected}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full rounded-sm"
                          style={{ objectFit: "cover" }}
                        />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            {product.specs.length ? (
              <div className="product-detail-card rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-xl font-semibold">Technical Details</h2>
                <ul className="space-y-2 text-sm text-textMuted">
                  {product.specs.map((spec) => (
                    <li key={spec}>• {spec}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {product.details.length ? (
              <div className="product-detail-card rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-xl font-semibold">Additional Details</h2>
                <ul className="space-y-2 text-sm text-textMuted">
                  {product.details.map((detail) => (
                    <li key={detail}>• {detail}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="product-info-card rounded-xl border border-border bg-card p-6 space-y-4 self-start sticky top-24">
            <p className="text-[10px] uppercase tracking-[0.3em] text-textMuted">{product.category}</p>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <p className="text-sm text-textMuted">{product.description}</p>
            <p className="text-lg font-semibold">LKR {product.price.toLocaleString()}</p>
            {stock.label && stock.tone ? (
              <span
                className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                style={{ color: stockToneColor(stock.tone) }}
              >
                {stock.label}
              </span>
            ) : null}
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-text text-bg py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
              onClick={() => onAddToCart(product)}
              disabled={!stock.canPurchase}
            >
              <ShoppingCart className="h-4 w-4" />
              {stock.canPurchase ? "Add to cart" : "Out of stock"}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-bgSubtle text-text py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-card transition-colors duration-200"
              style={{
                opacity: stock.canPurchase ? 1 : 0.5,
                pointerEvents: stock.canPurchase ? "auto" : "none",
              }}
              aria-disabled={!stock.canPurchase}
            >
              <MessageCircle className="h-4 w-4" />
              Buy on WhatsApp
            </a>
            <Link to="/shop" className="block text-xs uppercase tracking-[0.2em] text-textMuted hover:text-text transition-colors duration-200">
              Back to shop
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
