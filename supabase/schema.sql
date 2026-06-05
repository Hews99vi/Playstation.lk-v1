-- PlayStation.lk Supabase schema
-- Run this in the Supabase SQL editor for a new project.

create table if not exists public.categories (
  name text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  price integer not null check (price >= 0),
  old_price integer check (old_price is null or old_price >= 0),
  image text not null,
  images text[],
  platform text not null,
  category text not null references public.categories(name) on update cascade on delete restrict,
  description text not null,
  stock_status text not null check (stock_status in ('in-stock', 'limited', 'out-of-stock')),
  stock_count integer not null default 0 check (stock_count >= 0),
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  specs text[] not null default '{}',
  details text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.home_sections (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  accent_color text not null default 'white' check (accent_color in ('white', 'blue')),
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.home_section_products (
  section_id text not null references public.home_sections(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (section_id, product_id)
);

-- Ensure existing projects also get the intended foreign-key behavior.
alter table public.products
  drop constraint if exists products_category_fkey;

alter table public.products
  add constraint products_category_fkey
  foreign key (category)
  references public.categories(name)
  on update cascade
  on delete restrict;

alter table public.home_section_products
  drop constraint if exists home_section_products_section_id_fkey;

alter table public.home_section_products
  add constraint home_section_products_section_id_fkey
  foreign key (section_id)
  references public.home_sections(id)
  on delete cascade;

alter table public.home_section_products
  drop constraint if exists home_section_products_product_id_fkey;

alter table public.home_section_products
  add constraint home_section_products_product_id_fkey
  foreign key (product_id)
  references public.products(id)
  on delete cascade;

alter table public.products
  add column if not exists stock_count integer not null default 0;

alter table public.products
  drop constraint if exists products_stock_count_nonnegative;

alter table public.products
  add constraint products_stock_count_nonnegative
  check (stock_count >= 0);

alter table public.products
  add column if not exists details text[] not null default '{}';

create index if not exists products_category_idx on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists home_sections_sort_order_idx on public.home_sections(sort_order);
create index if not exists home_section_products_section_sort_idx
  on public.home_section_products(section_id, sort_order);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.home_sections enable row level security;
alter table public.home_section_products enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select
  using (true);

drop policy if exists "Authenticated users can manage categories" on public.categories;
create policy "Authenticated users can manage categories"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products for select
  using (true);

drop policy if exists "Authenticated users can manage products" on public.products;
create policy "Authenticated users can manage products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public can read home sections" on public.home_sections;
create policy "Public can read home sections"
  on public.home_sections for select
  using (true);

drop policy if exists "Authenticated users can manage home sections" on public.home_sections;
create policy "Authenticated users can manage home sections"
  on public.home_sections for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public can read home section products" on public.home_section_products;
create policy "Public can read home section products"
  on public.home_section_products for select
  using (true);

drop policy if exists "Authenticated users can manage home section products" on public.home_section_products;
create policy "Authenticated users can manage home section products"
  on public.home_section_products for all
  to authenticated
  using (true)
  with check (true);

insert into public.categories (name) values
  ('PlayStation'),
  ('Consoles'),
  ('Controllers'),
  ('Games'),
  ('Accessories'),
  ('Repairs')
on conflict (name) do nothing;

insert into public.products (
  id,
  name,
  price,
  old_price,
  image,
  images,
  platform,
  category,
  description,
  stock_status,
  stock_count,
  rating,
  specs,
  details
) values
  (
    'ps5-disc',
    'PlayStation 5 Disc Edition',
    264900,
    279900,
    '/assets/hero-ps5.jpg',
    null,
    'PlayStation 5',
    'Consoles',
    'Next-gen performance with ultra-fast SSD and ray tracing.',
    'in-stock',
    10,
    4.9,
    array['825GB SSD', '4K 120Hz', 'DualSense Support'],
    array['Includes one DualSense controller', 'Official warranty support available']
  ),
  (
    'ps5-slim',
    'PlayStation 5 Slim',
    239900,
    null,
    '/assets/hero-ps5.jpg',
    null,
    'PlayStation 5',
    'Consoles',
    'Compact chassis with full next-gen PlayStation performance.',
    'limited',
    3,
    4.8,
    array['1TB SSD', 'Compact Body', 'Wi-Fi 6'],
    array['Slim chassis with detachable disc drive support', 'Includes HDMI and power cables']
  ),
  (
    'dualsense-white',
    'DualSense Wireless Controller',
    28900,
    null,
    '/assets/hero-ps5.jpg',
    null,
    'PlayStation 5',
    'Controllers',
    'Haptic feedback and adaptive triggers in the classic white finish.',
    'in-stock',
    14,
    4.7,
    array['Adaptive Triggers', 'Haptic Feedback', 'USB-C Charging'],
    array['Compatible with PS5 and supported PC games', 'USB-C cable sold separately']
  ),
  (
    'dualsense-edge',
    'DualSense Edge Controller',
    82900,
    null,
    '/assets/hero-ps5.jpg',
    null,
    'PlayStation 5',
    'Controllers',
    'Pro-level customization for serious competitive gaming.',
    'limited',
    4,
    4.9,
    array['Swappable Sticks', 'Back Buttons', 'Trigger Stops'],
    array['Includes carrying case and replaceable stick caps', 'Designed for competitive play']
  ),
  (
    'spiderman2',
    'Marvel''s Spider-Man 2',
    22900,
    null,
    '/assets/hero-ps5.jpg',
    null,
    'PlayStation 5',
    'Games',
    'A cinematic open-world adventure built for PS5.',
    'in-stock',
    8,
    4.9,
    array['PS5 Exclusive', '4K HDR', 'Fast Travel SSD'],
    array['Physical edition packaging', 'Suitable for local PS5 consoles']
  ),
  (
    'gt7',
    'Gran Turismo 7',
    18900,
    null,
    '/assets/hero-ps5.jpg',
    null,
    'PlayStation 5',
    'Games',
    'Real Driving Simulator with a premium racing experience.',
    'out-of-stock',
    0,
    4.6,
    array['DualSense Haptics', '120 FPS Mode', 'Online Multiplayer'],
    array['Physical disc copy', 'Online features require PlayStation Network']
  ),
  (
    'pulse-3d',
    'PULSE 3D Wireless Headset',
    36900,
    null,
    '/assets/hero-ps5.jpg',
    null,
    'PlayStation 5',
    'Accessories',
    'Engineered for Tempest 3D AudioTech.',
    'limited',
    2,
    4.5,
    array['Wireless', 'Noise-Cancelling Mics', '12h Battery'],
    array['Tuned for PlayStation 3D audio', 'Includes wireless adapter']
  ),
  (
    'repair-diagnostic',
    'Advanced Console Diagnostic',
    5000,
    null,
    '/assets/hero-ps5.jpg',
    null,
    'Service',
    'Repairs',
    'Full hardware and thermal diagnostic with service report.',
    'in-stock',
    0,
    4.8,
    array['Same Week', 'Certified Technicians', 'Genuine Parts'],
    array['Diagnostic fee may be credited toward repair', 'Service report provided after inspection']
  )
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  old_price = excluded.old_price,
  image = excluded.image,
  images = excluded.images,
  platform = excluded.platform,
  category = excluded.category,
  description = excluded.description,
  stock_status = excluded.stock_status,
  stock_count = excluded.stock_count,
  rating = excluded.rating,
  specs = excluded.specs,
  details = excluded.details;

insert into public.home_sections (
  id,
  title,
  subtitle,
  accent_color,
  enabled,
  sort_order
) values
  ('best-selling', 'BEST SELLING', 'Top sellers', 'white', true, 1),
  ('new-arrivals', 'NEW ARRIVALS', 'Freshly added', 'white', true, 2)
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  accent_color = excluded.accent_color,
  enabled = excluded.enabled,
  sort_order = excluded.sort_order;

insert into public.home_section_products (section_id, product_id, sort_order) values
  ('best-selling', 'ps5-disc', 1),
  ('best-selling', 'dualsense-white', 2),
  ('best-selling', 'spiderman2', 3),
  ('best-selling', 'pulse-3d', 4),
  ('new-arrivals', 'ps5-slim', 1),
  ('new-arrivals', 'dualsense-edge', 2),
  ('new-arrivals', 'gt7', 3),
  ('new-arrivals', 'repair-diagnostic', 4)
on conflict (section_id, product_id) do update set
  sort_order = excluded.sort_order;
