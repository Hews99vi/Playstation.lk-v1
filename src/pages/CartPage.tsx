import { MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getStockDisplay } from "../lib/stock";
import type { CartItem } from "../types";

const WHATSAPP_NUMBER = "94767301586";

type CartPageProps = {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
};

function buildWhatsAppMessage(cart: CartItem[], total: number): string {
  const lines = [
    "🛒 *New Order — PlayStation.lk*",
    "",
    ...cart.map(
      (item) =>
        `• *${item.name}* × ${item.quantity} — LKR ${(item.price * item.quantity).toLocaleString()}`
    ),
    "",
    `*Order Total: LKR ${total.toLocaleString()}*`,
    "",
    "Please confirm availability and payment details. Thank you!",
  ];
  return lines.join("\n");
}

export function CartPage({ cart, removeFromCart, updateQuantity, clearCart }: CartPageProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function handleCheckout() {
    if (cart.length === 0) return;
    const msg = buildWhatsAppMessage(cart, subtotal);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="bg-bg text-text min-h-screen">
      {/* Page header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: "40px", paddingBottom: "32px" }}>
          <p className="text-[10px] uppercase tracking-[0.4em] text-textMuted" style={{ marginBottom: "8px" }}>
            Your selection
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <h1 className="text-3xl font-semibold">Cart</h1>
            {itemCount > 0 && (
              <span className="text-sm text-textMuted">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: "32px", paddingBottom: "80px" }}>
        {cart.length === 0 ? (
          /* ── Empty state ── */
          <div
            className="rounded-xl border border-border bg-card"
            style={{ padding: "80px 24px", textAlign: "center" }}
          >
            <ShoppingBag
              className="text-textMuted mx-auto"
              style={{ width: "40px", height: "40px", marginBottom: "16px", opacity: 0.4 }}
            />
            <p className="text-text font-medium" style={{ fontSize: "16px", marginBottom: "6px" }}>
              Your cart is empty
            </p>
            <p className="text-textMuted" style={{ fontSize: "13px", marginBottom: "24px" }}>
              Browse our store and add products to get started.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center rounded-md bg-text text-bg hover:opacity-90 transition-opacity duration-200"
              style={{ padding: "10px 24px", fontSize: "13px", fontWeight: "600", gap: "8px" }}
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          /* ── Cart with items ── */
          <div className="cart-layout grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* Left: cart items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cart.map((item) => {
                const stock = getStockDisplay(item);
                const availableStock = Number.isFinite(item.stockCount) ? item.stockCount : 0;
                const canIncrease = stock.isService || item.quantity < availableStock;

                return (
                <article
                  key={item.id}
                  className="cart-line-item rounded-xl border border-border bg-card"
                  style={{ padding: "16px", display: "flex", gap: "16px", alignItems: "flex-start" }}
                >
                  {/* Thumbnail */}
                  <Link to={`/product/${item.id}`} className="cart-line-image" style={{ flexShrink: 0 }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rounded-lg object-cover"
                      style={{ width: "88px", height: "88px" }}
                    />
                  </Link>

                  {/* Details */}
                  <div className="cart-line-content" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div>
                      <Link
                        to={`/product/${item.id}`}
                        className="text-text font-medium hover:text-accent transition-colors duration-150"
                        style={{ fontSize: "14px", display: "block", marginBottom: "2px" }}
                      >
                        {item.name}
                      </Link>
                      <p className="text-textMuted" style={{ fontSize: "12px" }}>
                        {item.platform} · {item.category}
                      </p>
                    </div>

                    {/* Qty + price row */}
                    <div className="cart-line-meta-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                      {/* Qty controls */}
                      <div
                        className="border border-border rounded-lg"
                        style={{ display: "inline-flex", alignItems: "center", overflow: "hidden" }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-textMuted hover:text-text hover:bg-bgSubtle transition-colors duration-150"
                          style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          aria-label="Decrease quantity"
                        >
                          <Minus style={{ width: "12px", height: "12px" }} />
                        </button>
                        <span
                          className="text-text"
                          style={{ width: "36px", textAlign: "center", fontSize: "13px", fontWeight: "500" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-textMuted hover:text-text hover:bg-bgSubtle transition-colors duration-150"
                          style={{
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: canIncrease ? 1 : 0.45,
                          }}
                          aria-label="Increase quantity"
                          disabled={!canIncrease}
                        >
                          <Plus style={{ width: "12px", height: "12px" }} />
                        </button>
                      </div>

                      {/* Price + remove */}
                      <div className="cart-line-price-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <p className="text-text font-semibold" style={{ fontSize: "15px" }}>
                          LKR {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-textMuted hover:text-red-500 transition-colors duration-150"
                          aria-label="Remove item"
                        >
                          <Trash2 style={{ width: "15px", height: "15px" }} />
                        </button>
                      </div>
                    </div>
                    {!stock.isService && !canIncrease ? (
                      <p className="text-textMuted" style={{ fontSize: "11px" }}>
                        Only {availableStock} available.
                      </p>
                    ) : null}
                  </div>
                </article>
                );
              })}


            </div>

            {/* Right: order summary */}
            <aside
              className="cart-summary rounded-xl border border-border bg-card self-start sticky top-24"
              style={{ padding: "24px" }}
            >
              <p
                className="text-text font-semibold"
                style={{ fontSize: "15px", marginBottom: "20px" }}
              >
                Order Summary
              </p>

              {/* Line items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}
                  >
                    <p className="text-textMuted" style={{ fontSize: "12px", flex: 1 }}>
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="text-textMuted" style={{ marginLeft: "4px" }}>
                          × {item.quantity}
                        </span>
                      )}
                    </p>
                    <p className="text-text" style={{ fontSize: "12px", fontWeight: "500", flexShrink: 0 }}>
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider + total */}
              <div
                className="border-t border-border"
                style={{ paddingTop: "14px", marginBottom: "20px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p className="text-textMuted" style={{ fontSize: "12px" }}>Subtotal</p>
                  <p className="text-text font-bold" style={{ fontSize: "18px" }}>
                    LKR {subtotal.toLocaleString()}
                  </p>
                </div>
                <p className="text-textMuted" style={{ fontSize: "11px", marginTop: "4px" }}>
                  Shipping calculated via WhatsApp
                </p>
              </div>

              {/* Checkout button */}
              <button
                type="button"
                id="checkout-btn"
                onClick={handleCheckout}
                className="w-full rounded-md bg-accent text-white font-semibold hover:bg-accentStrong transition-colors duration-200"
                style={{ padding: "13px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "10px" }}
              >
                <MessageCircle style={{ width: "16px", height: "16px" }} />
                Order via WhatsApp
              </button>

              <p className="text-textMuted text-center" style={{ fontSize: "11px", lineHeight: "1.5" }}>
                We'll confirm your order and arrange payment &amp; delivery over WhatsApp.
              </p>

              {/* Continue shopping + Clear cart */}
              <div className="cart-summary-footer border-t border-border" style={{ marginTop: "16px", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link
                  to="/shop"
                  className="text-textMuted hover:text-text transition-colors duration-150"
                  style={{ fontSize: "12px" }}
                >
                  ← Continue shopping
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-textMuted hover:text-red-500 transition-colors duration-150"
                  style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Trash2 style={{ width: "11px", height: "11px" }} />
                  Clear cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
