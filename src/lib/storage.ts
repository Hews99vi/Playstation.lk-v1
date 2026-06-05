import type { Category, HomeSection, Product } from "../types";

const PRODUCTS_KEY = "psl_products";
const CATEGORIES_KEY = "psl_categories";
const HOME_SECTIONS_KEY = "psl_home_sections";

function readJSON<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const localStorageStore = {
  readProducts: () => readJSON<Product[]>(PRODUCTS_KEY),
  writeProducts: (products: Product[]) => writeJSON(PRODUCTS_KEY, products),
  readCategories: () => readJSON<Category[]>(CATEGORIES_KEY),
  writeCategories: (categories: Category[]) => writeJSON(CATEGORIES_KEY, categories),
  readHomeSections: () => readJSON<HomeSection[]>(HOME_SECTIONS_KEY),
  writeHomeSections: (sections: HomeSection[]) => writeJSON(HOME_SECTIONS_KEY, sections),
};
