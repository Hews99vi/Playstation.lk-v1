import { supabase } from "../lib/supabase";
import type { Product } from "../types";
import { fromProduct } from "./catalogTransforms";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export const adminProductsService = {
  async saveProduct(product: Product): Promise<void> {
    const client = requireSupabase();
    const { error } = await client.from("products").upsert([fromProduct(product)]);

    if (error) {
      throw new Error(error.message);
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    const client = requireSupabase();
    const { error } = await client.from("products").delete().eq("id", productId);

    if (error) {
      throw new Error(error.message);
    }
  },
};
