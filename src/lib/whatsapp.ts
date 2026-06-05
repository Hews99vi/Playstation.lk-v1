import type { Product } from "../types";

export const WHATSAPP_NUMBER = "94767301586";

export function buildProductWhatsAppUrl(product: Product): string {
  const productUrl =
    typeof window === "undefined" ? `/product/${product.id}` : `${window.location.origin}/product/${product.id}`;
  const message = [
    "*Product enquiry - PlayStation.lk*",
    "",
    `*Product:* ${product.name}`,
    `*Price:* LKR ${product.price.toLocaleString()}`,
    `*Category:* ${product.category}`,
    `*Platform:* ${product.platform}`,
    `*Link:* ${productUrl}`,
    "",
    "Hi, I would like to buy this product. Please confirm availability and payment details.",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
