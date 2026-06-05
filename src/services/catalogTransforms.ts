import type { HomeSection, Product } from "../types";

export type ProductRow = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  image: string;
  images: string[] | null;
  platform: string;
  category: string;
  description: string;
  stock_status: "in-stock" | "limited" | "out-of-stock";
  stock_count: number | null;
  rating: number;
  specs: string[];
  details: string[] | null;
};

export type HomeSectionRow = {
  id: string;
  title: string;
  subtitle: string;
  accent_color: "white" | "blue";
  enabled: boolean;
  sort_order: number;
};

export type HomeSectionProductRow = {
  section_id: string;
  product_id: string;
  sort_order: number;
};

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    image: row.image,
    images: row.images ?? undefined,
    platform: row.platform,
    category: row.category,
    description: row.description,
    stockStatus: row.stock_status,
    stockCount: row.stock_count ?? 0,
    rating: row.rating,
    specs: row.specs,
    details: row.details ?? [],
  };
}

export function fromProduct(product: Product): ProductRow {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    old_price: product.oldPrice ?? null,
    image: product.image,
    images: product.images?.length ? product.images : null,
    platform: product.platform,
    category: product.category,
    description: product.description,
    stock_status: product.stockStatus,
    stock_count: product.stockCount,
    rating: product.rating,
    specs: product.specs,
    details: product.details,
  };
}

export function toHomeSection(
  row: HomeSectionRow,
  productIds: string[] = [],
): HomeSection {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    accentColor: row.accent_color,
    enabled: row.enabled,
    productIds,
    sortOrder: row.sort_order,
  };
}
