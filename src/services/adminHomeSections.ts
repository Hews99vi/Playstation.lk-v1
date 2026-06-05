import { supabase } from "../lib/supabase";
import type { HomeSection } from "../types";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export const adminHomeSectionsService = {
  async updateSection(section: HomeSection): Promise<void> {
    const client = requireSupabase();
    const { error } = await client
      .from("home_sections")
      .update({
        title: section.title,
        subtitle: section.subtitle,
        accent_color: section.accentColor,
        enabled: section.enabled,
        sort_order: section.sortOrder,
      })
      .eq("id", section.id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async setSectionProducts(sectionId: string, productIds: string[]): Promise<void> {
    const client = requireSupabase();
    const { error: deleteError } = await client
      .from("home_section_products")
      .delete()
      .eq("section_id", sectionId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (!productIds.length) {
      return;
    }

    const payload = productIds.map((productId, index) => ({
      section_id: sectionId,
      product_id: productId,
      sort_order: index + 1,
    }));

    const { error: insertError } = await client.from("home_section_products").insert(payload);

    if (insertError) {
      throw new Error(insertError.message);
    }
  },
};
