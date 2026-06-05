import type { Product } from "../types";

export type StockTone = "green" | "orange" | "red";

export type StockDisplay = {
  isService: boolean;
  canPurchase: boolean;
  label: string | null;
  tone: StockTone | null;
};

export function isServiceProduct(product: Pick<Product, "category" | "platform">): boolean {
  return product.category === "Repairs" || product.platform === "Service";
}

export function stockStatusFromCount(stockCount: number): Product["stockStatus"] {
  if (stockCount <= 0) return "out-of-stock";
  if (stockCount <= 5) return "limited";
  return "in-stock";
}

export function getStockDisplay(product: Product): StockDisplay {
  const stockCount = Number.isFinite(product.stockCount) ? product.stockCount : 0;

  if (isServiceProduct(product)) {
    return {
      isService: true,
      canPurchase: true,
      label: null,
      tone: null,
    };
  }

  if (stockCount <= 0) {
    return {
      isService: false,
      canPurchase: false,
      label: "Out of stock",
      tone: "red",
    };
  }

  if (stockCount <= 5) {
    return {
      isService: false,
      canPurchase: true,
      label: `Low stock (${stockCount} left)`,
      tone: "orange",
    };
  }

  return {
    isService: false,
    canPurchase: true,
    label: "In stock",
    tone: "green",
  };
}

export function stockToneColor(tone: StockTone): string {
  if (tone === "green") return "rgb(5, 150, 105)";
  if (tone === "orange") return "rgb(217, 119, 6)";
  return "rgb(220, 38, 38)";
}
