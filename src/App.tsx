import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { seedCategories } from "./data/seed";
import { supabaseAvailability } from "./lib/supabase";
import { getStockDisplay } from "./lib/stock";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminRoute } from "./pages/admin/AdminRoute";
import { CategoriesPage } from "./pages/admin/CategoriesPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { LandingManagerPage } from "./pages/admin/LandingManagerPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { ProductFormPage } from "./pages/admin/ProductFormPage";
import { ProductsPage } from "./pages/admin/ProductsPage";
import { catalogService } from "./services/catalogService";
import type { CartItem, HomeSection, Product } from "./types";
import { AboutPage } from "./pages/AboutPage";
import { CartPage } from "./pages/CartPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { RepairsPage } from "./pages/RepairsPage";
import { ShopPage } from "./pages/ShopPage";

const THEME_KEY = "psl_theme";

export default function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return "light"; // default to light for new visitors
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(seedCategories);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const refreshCatalog = useCallback(async () => {
    const [loadedProducts, loadedCategories, loadedSections] = await Promise.all([
      catalogService.getProducts(),
      catalogService.getCategories(),
      catalogService.getHomeSections(),
    ]);

    setProducts(loadedProducts);
    setCategories(loadedCategories);
    setHomeSections(loadedSections);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await refreshCatalog();
      setLoading(false);
    }

    void load();
  }, [refreshCatalog]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  function addToCart(product: Product): void {
    const stock = getStockDisplay(product);
    if (!stock.canPurchase) return;

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        const availableStock = Number.isFinite(product.stockCount) ? product.stockCount : 0;
        if (!stock.isService && existing.quantity >= availableStock) {
          return current;
        }

        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string): void {
    setCart((current) => current.filter((item) => item.id !== productId));
  }

  function updateQuantity(productId: string, delta: number): void {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== productId) return item;

          const stock = getStockDisplay(item);
          const availableStock = Number.isFinite(item.stockCount) ? item.stockCount : 0;
          const nextQuantity = Math.max(1, item.quantity + delta);
          const clampedQuantity = stock.isService
            ? nextQuantity
            : Math.min(nextQuantity, availableStock);

          return { ...item, quantity: Math.max(1, clampedQuantity) };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function clearCart(): void {
    setCart([]);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-border border-t-text rounded-full animate-spin mx-auto" />
          <p className="text-textMuted text-xs font-black uppercase tracking-widest">
            Loading inventory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {!supabaseAvailability.enabled && !isAdminPath ? (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-amber-600 text-center">
          Supabase env missing: {supabaseAvailability.missingKeys.join(", ")} | running in local
          fallback mode
        </div>
      ) : null}

      {!isAdminPath ? (
        <Header
          cartCount={cartCount}
          isAdmin={false}
          theme={theme}
          onLogout={() => undefined}
          onToggleTheme={() => setTheme((value) => (value === "light" ? "dark" : "light"))}
        />
      ) : null}

      <Routes>
        <Route
          path="/"
          element={<HomePage products={products} sections={homeSections} onAddToCart={addToCart} />}
        />
        <Route
          path="/shop"
          element={<ShopPage products={products} categories={categories} onAddToCart={addToCart} />}
        />
        <Route
          path="/product/:id"
          element={<ProductPage products={products} onAddToCart={addToCart} />}
        />
        <Route path="/repairs" element={<RepairsPage />} />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
              clearCart={clearCart}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/admin/login"
          element={<LoginPage />}
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout
                theme={theme}
                onToggleTheme={() => setTheme((value) => (value === "light" ? "dark" : "light"))}
              />
            </AdminRoute>
          }
        >
          <Route
            index
            element={
              <DashboardPage
                products={products}
                categories={categories}
                homeSections={homeSections}
              />
            }
          />
          <Route
            path="products"
            element={
              <ProductsPage products={products} categories={categories} onRefresh={refreshCatalog} />
            }
          />
          <Route
            path="products/new"
            element={
              <ProductFormPage
                products={products}
                categories={categories}
                onRefresh={refreshCatalog}
              />
            }
          />
          <Route
            path="products/:id/edit"
            element={
              <ProductFormPage
                products={products}
                categories={categories}
                onRefresh={refreshCatalog}
              />
            }
          />
          <Route
            path="categories"
            element={
              <CategoriesPage
                categories={categories}
                products={products}
                onRefresh={refreshCatalog}
              />
            }
          />
          <Route
            path="landing"
            element={
              <LandingManagerPage
                products={products}
                homeSections={homeSections}
                onRefresh={refreshCatalog}
              />
            }
          />
        </Route>
        <Route path="/account" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminPath ? <Footer /> : null}
    </div>
  );
}
