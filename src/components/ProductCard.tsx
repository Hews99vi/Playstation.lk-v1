import { MessageCircle, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { getStockDisplay, stockToneColor } from "../lib/stock";
import { buildProductWhatsAppUrl } from "../lib/whatsapp";
import type { Product } from "../types";

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const stock = getStockDisplay(product);
  const whatsappUrl = buildProductWhatsAppUrl(product);

  return (
    <article className="product-card group h-full flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="product-card-media block aspect-[4/3] bg-bgSubtle">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover opacity-90" />
      </Link>
      <div className="product-card-body p-4 flex flex-1 flex-col gap-3">
        <div className="product-card-meta space-y-1" style={{ minHeight: "76px" }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-textMuted">{product.category}</p>
          <Link to={`/product/${product.id}`} className="line-clamp-2 text-sm font-semibold text-text">
            {product.name}
          </Link>
          <p className="text-xs text-textMuted line-clamp-2">{product.platform}</p>
        </div>

        <div className="product-card-price-row flex items-end justify-between gap-3" style={{ minHeight: "44px" }}>
          <div className="min-w-0">
            <p className="text-base text-text font-semibold">LKR {product.price.toLocaleString()}</p>
            <p
              className="text-xs text-textMuted line-through"
              style={{ visibility: product.oldPrice ? "visible" : "hidden" }}
            >
              LKR {(product.oldPrice ?? product.price).toLocaleString()}
            </p>
          </div>
          {stock.label && stock.tone ? (
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-right"
              style={{ color: stockToneColor(stock.tone) }}
            >
              {stock.label}
            </span>
          ) : null}
        </div>

        <div className="product-card-actions space-y-2" style={{ marginTop: "auto" }}>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-text text-bg py-2 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-bgSubtle text-text py-2 text-xs font-semibold uppercase tracking-widest hover:bg-card transition-colors duration-200"
            style={{
              opacity: stock.canPurchase ? 1 : 0.5,
              pointerEvents: stock.canPurchase ? "auto" : "none",
            }}
            aria-disabled={!stock.canPurchase}
          >
            <MessageCircle className="h-4 w-4" />
            Buy on WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
