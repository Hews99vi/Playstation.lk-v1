import { seedCategories, seedHomeSections, seedProducts } from "../data/seed";
import { localStorageStore } from "../lib/storage";
import { supabase } from "../lib/supabase";
import { isServiceProduct } from "../lib/stock";
import type { Category, HomeSection, Product } from "../types";
import {
  type HomeSectionProductRow,
  type HomeSectionRow,
  type ProductRow,
  toHomeSection,
  toProduct,
} from "./catalogTransforms";

function seedLocalIfMissing(): void {
  if (!localStorageStore.readProducts()) {
    localStorageStore.writeProducts(seedProducts);
  }
  if (!localStorageStore.readCategories()) {
    localStorageStore.writeCategories(seedCategories);
  }
  if (!localStorageStore.readHomeSections()) {
    localStorageStore.writeHomeSections(seedHomeSections);
  }
}

function fallbackStockCount(product: Product): number {
  if (isServiceProduct(product)) return 0;
  if (product.stockStatus === "out-of-stock") return 0;
  if (product.stockStatus === "limited") return 3;
  return 10;
}

function normalizeLocalProducts(products: Product[]): Product[] {
  return products.map((product) => ({
    ...product,
    stockCount:
      typeof product.stockCount === "number" && Number.isFinite(product.stockCount)
        ? product.stockCount
        : fallbackStockCount(product),
    details: Array.isArray(product.details) ? product.details : [],
  }));
}

function getLocalProducts(): Product[] {
  seedLocalIfMissing();
  const products = normalizeLocalProducts(localStorageStore.readProducts() ?? []);
  localStorageStore.writeProducts(products);
  return products;
}

function getLocalCategories(): Category[] {
  seedLocalIfMissing();
  return localStorageStore.readCategories() ?? [];
}

function getLocalHomeSections(): HomeSection[] {
  seedLocalIfMissing();
  return localStorageStore.readHomeSections() ?? [];
}

export const catalogService = {
  async getProducts(): Promise<Product[]> {
    if (!supabase) {
      return getLocalProducts();
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const products = (data ?? []).map((row) => toProduct(row as ProductRow));
      localStorageStore.writeProducts(products);
      return products;
    } catch {
      return getLocalProducts();
    }
  },

  async getCategories(): Promise<Category[]> {
    if (!supabase) {
      return getLocalCategories();
    }

    try {
      const { data, error } = await supabase.from("categories").select("name").order("name");
      if (error) {
        throw error;
      }

      const categories = (data ?? []).map((row) => ({ name: row.name as string }));
      localStorageStore.writeCategories(categories);
      return categories;
    } catch {
      return getLocalCategories();
    }
  },

  async getHomeSections(): Promise<HomeSection[]> {
    if (!supabase) {
      return getLocalHomeSections();
    }

    try {
      const [{ data: sections, error: sectionError }, { data: joins, error: joinError }] =
        await Promise.all([
          supabase.from("home_sections").select("*").order("sort_order"),
          supabase.from("home_section_products").select("*").order("sort_order"),
        ]);

      if (sectionError || joinError) {
        throw sectionError ?? joinError;
      }

      const grouped = new Map<string, string[]>();
      (joins as HomeSectionProductRow[] | null)?.forEach((row) => {
        const existing = grouped.get(row.section_id) ?? [];
        existing.push(row.product_id);
        grouped.set(row.section_id, existing);
      });

      const mapped: HomeSection[] = ((sections as HomeSectionRow[] | null) ?? []).map((section) =>
        toHomeSection(section, grouped.get(section.id) ?? []),
      );

      localStorageStore.writeHomeSections(mapped);
      return mapped;
    } catch {
      return getLocalHomeSections();
    }
  },

};
