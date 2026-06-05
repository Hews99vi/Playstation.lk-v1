export type ProductCategory =
  | "PlayStation"
  | "Consoles"
  | "Controllers"
  | "Games"
  | "Accessories"
  | "Repairs";

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  platform: string;
  category: string;
  description: string;
  stockStatus: "in-stock" | "limited" | "out-of-stock";
  stockCount: number;
  rating: number;
  specs: string[];
  details: string[];
};

export type Category = {
  name: string;
};

export type HomeSection = {
  id: string;
  title: string;
  subtitle: string;
  accentColor: "white" | "blue";
  enabled: boolean;
  productIds: string[];
  sortOrder: number;
};

export type CartItem = Product & {
  quantity: number;
};
