import { supabase } from "../lib/supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export const adminCategoriesService = {
  async addCategory(name: string): Promise<void> {
    const client = requireSupabase();
    const { error } = await client.from("categories").insert([{ name }]);

    if (error) {
      throw new Error(error.message);
    }
  },

  async renameCategory(currentName: string, nextName: string): Promise<void> {
    const client = requireSupabase();

    const { data: existingCategory, error: existingError } = await client
      .from("categories")
      .select("name")
      .eq("name", currentName)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existingCategory) {
      throw new Error("The category you are trying to rename no longer exists.");
    }

    const { data: duplicateCategory, error: duplicateError } = await client
      .from("categories")
      .select("name")
      .eq("name", nextName)
      .maybeSingle();

    if (duplicateError) {
      throw new Error(duplicateError.message);
    }

    if (duplicateCategory) {
      throw new Error("A category with that name already exists.");
    }

    const { error: insertError } = await client.from("categories").insert([{ name: nextName }]);

    if (insertError) {
      throw new Error(insertError.message);
    }

    const { error: productError } = await client
      .from("products")
      .update({ category: nextName })
      .eq("category", currentName);

    if (productError) {
      await client.from("categories").delete().eq("name", nextName);
      throw new Error(productError.message);
    }

    const { error: deleteError } = await client.from("categories").delete().eq("name", currentName);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  },

  async deleteCategory(name: string): Promise<void> {
    const client = requireSupabase();
    const { count, error: countError } = await client
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", name);

    if (countError) {
      throw new Error(countError.message);
    }

    if ((count ?? 0) > 0) {
      throw new Error(`Move or delete ${count} product${count === 1 ? "" : "s"} before deleting this category.`);
    }

    const { error } = await client.from("categories").delete().eq("name", name);

    if (error) {
      throw new Error(error.message);
    }
  },
};
