-- ============================================
-- TABLA: cash_closings (Cierre de Caja)
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- ============================================

create table if not exists public.cash_closings (
  id uuid primary key default gen_random_uuid(),
  closing_date date not null,
  opening_cash numeric(12,2) not null default 0,
  cash_sales numeric(12,2) not null default 0,
  card_sales numeric(12,2) not null default 0,
  transfer_sales numeric(12,2) not null default 0,
  total_sales numeric(12,2) not null default 0,
  orders_count integer not null default 0,
  expected_cash numeric(12,2) not null default 0,
  counted_cash numeric(12,2) not null default 0,
  difference numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Permitir lectura/escritura con la anon key (mismo esquema que las demás tablas)
alter table public.cash_closings enable row level security;

create policy "Allow all on cash_closings"
  on public.cash_closings
  for all
  using (true)
  with check (true);
