-- ========================================================
-- Schema completo para Mr. Toasted en Supabase
-- Copia y pega esto en SQL Editor → New query → Run
-- ========================================================

-- Tabla: Configuración del restaurante (1 sola fila)
create table if not exists restaurant_config (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mr. Toasted',
  phone text not null default '',
  address text not null default '',
  logo text,
  slogan text,
  whatsapp_number text,
  tax_rate decimal(5,4) default 0.18,
  currency text default 'PEN',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla: Categorías del menú
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Tabla: Productos del menú
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10,2),
  category text not null references categories(name),
  image text,
  is_available boolean default true,
  is_featured boolean default false,
  variants jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla: Mesas
create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  capacity int default 4,
  status text default 'free' check (status in ('free','occupied')),
  created_at timestamptz default now()
);

-- Tabla: Pedidos
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  status text default 'pending' check (status in ('pending','preparing','ready','delivered','cancelled')),
  type text not null check (type in ('pickup','delivery','dine-in')),
  table_id uuid references tables(id),
  table_number int,
  customer_name text,
  customer_phone text,
  customer_address text,
  customer_notes text,
  total decimal(10,2) not null,
  tax decimal(10,2) default 0,
  payment_method text default 'cash',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla: Items dentro de cada pedido
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  name text not null,
  description text,
  variant text,
  price decimal(10,2) not null,
  quantity int not null default 1,
  created_at timestamptz default now()
);

-- ========================================================
-- Row Level Security (RLS) Policies
-- Para demo: permitir todo a anon. En producción agregar auth.
-- ========================================================

alter table restaurant_config enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table tables enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Permitir lectura/escritura pública para demo
create policy "Allow all" on restaurant_config for all using (true) with check (true);
create policy "Allow all" on categories for all using (true) with check (true);
create policy "Allow all" on menu_items for all using (true) with check (true);
create policy "Allow all" on tables for all using (true) with check (true);
create policy "Allow all" on orders for all using (true) with check (true);
create policy "Allow all" on order_items for all using (true) with check (true);

-- ========================================================
-- Realtime: habilitar cambios en tiempo real para orders
-- ========================================================

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
alter publication supabase_realtime add table menu_items;
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table tables;
alter publication supabase_realtime add table restaurant_config;

-- ========================================================
-- Seed data inicial (categorías y config por defecto)
-- ========================================================

insert into restaurant_config (id, name, phone, address, slogan)
values (
  '00000000-0000-0000-0000-000000000001',
  'Mr. Toasted',
  '+51 999 888 777',
  'Av. Principal 123, Lima',
  'El mejor sabor, tostado a la perfección'
)
on conflict (id) do nothing;

insert into categories (name, sort_order) values
  ('Papas', 1),
  ('Salchipapas', 2),
  ('Hamburguesas', 3),
  ('Bebidas', 4),
  ('Combos', 5)
on conflict (name) do nothing;
