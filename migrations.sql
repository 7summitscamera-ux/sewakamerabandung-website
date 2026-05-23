-- =====================================================================
-- 7summits Camera — Admin CMS migrations
-- Run this in your Supabase SQL editor (CMS project: mchsqiujfhvzbxzdqeeb)
-- Idempotent: safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. site_settings (single-row JSON config: branding, youtube, hero)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id           bigint primary key default 1,
  -- branding
  brand_orange      text default '#F06824',
  brand_green       text default '#8EC64E',
  brand_green_deep  text default '#4F7B39',
  brand_silver      text default '#E3E5E5',
  brand_bg          text default '#FAFAF7',
  brand_ink         text default '#0E1217',
  -- typography
  font_family       text default 'Inter',
  font_family_url   text default 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  font_weight_headline integer default 700,
  font_weight_body  integer default 400,
  font_size_base    integer default 15,
  headline_letter_spacing text default '-0.035em',
  -- logos
  logo_url          text,
  logo_mark_url     text,
  logo_dark_url     text,
  favicon_url       text,
  -- hero
  hero_image_url    text,
  hero_headline     text default 'Gear sinematik. Siap produksi.',
  hero_subheadline  text default '767+ unit gear profesional — kamera cinema, lensa premium, lighting studio, dan drone.',
  hero_cta_primary_text text default 'Mulai Booking',
  hero_cta_primary_url  text default 'https://booking.sewakamerabandung.id',
  hero_cta_secondary_text text default 'Jelajahi Gear',
  hero_cta_secondary_url  text default '#produk',
  ann_bar_text      text default 'Promo aktif: sewa 3 hari bayar 2 hari — berlaku semua produk',
  ann_bar_link_text text default 'Booking sekarang',
  ann_bar_link_url  text default 'https://booking.sewakamerabandung.id',
  -- youtube (jsonb array of {url,title})
  youtube_videos    jsonb default '[]'::jsonb,
  -- contact
  whatsapp_number   text default '6281121114410',
  instagram_url     text default 'https://instagram.com/sewakamerabandung.id',
  youtube_channel   text default 'https://www.youtube.com/@7summitscamera',
  booking_url       text default 'https://booking.sewakamerabandung.id',
  updated_at        timestamptz default now()
);

-- Ensure single-row pattern
insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

-- New columns (idempotent — alter table add column if not exists is pg14+)
do $$ begin
  alter table public.site_settings add column if not exists logo_mark_url text;
  alter table public.site_settings add column if not exists logo_dark_url text;
  alter table public.site_settings add column if not exists favicon_url text;
  alter table public.site_settings add column if not exists font_family text default 'Inter';
  alter table public.site_settings add column if not exists font_family_url text;
  alter table public.site_settings add column if not exists font_weight_headline integer default 700;
  alter table public.site_settings add column if not exists font_weight_body integer default 400;
  alter table public.site_settings add column if not exists font_size_base integer default 15;
  alter table public.site_settings add column if not exists headline_letter_spacing text default '-0.035em';
  alter table public.site_settings add column if not exists youtube_videos jsonb default '[]'::jsonb;
  alter table public.site_settings add column if not exists hero_image_url text;
  alter table public.site_settings add column if not exists hero_cta_secondary_text text;
  alter table public.site_settings add column if not exists hero_cta_secondary_url text;
  alter table public.site_settings add column if not exists ann_bar_link_text text;
  alter table public.site_settings add column if not exists ann_bar_link_url text;
  alter table public.site_settings add column if not exists hero_carousel_enabled boolean default false;
  alter table public.site_settings add column if not exists hero_carousel_images jsonb default '[]'::jsonb;
  alter table public.site_settings add column if not exists hero_carousel_duration integer default 5000;
  alter table public.site_settings add column if not exists hero_carousel_transition text default 'fade';
exception when duplicate_column then null; end $$;

-- ---------------------------------------------------------------------
-- 2. promos table (active promos shown on /promo page + homepage)
-- ---------------------------------------------------------------------
create table if not exists public.promos (
  id          bigserial primary key,
  title       text not null,
  description text,
  badge       text,                -- e.g. "-33%"
  detail      jsonb default '[]'::jsonb,  -- array of {label,value}
  cta_text    text default 'Booking Sekarang',
  cta_url     text default 'https://booking.sewakamerabandung.id',
  status      text default 'active',  -- active | soon | inactive
  is_featured boolean default false,
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 3. faqs — ensure category column exists
-- ---------------------------------------------------------------------
do $$ begin
  alter table public.faqs add column if not exists category text default 'umum';
exception when undefined_table then
  -- create the table if missing
  create table public.faqs (
    id          bigserial primary key,
    question    text not null,
    answer      text not null,
    category    text default 'umum',
    is_active   boolean default true,
    sort_order  integer default 0,
    created_at  timestamptz default now(),
    updated_at  timestamptz default now()
  );
end $$;

-- ---------------------------------------------------------------------
-- 4. locations — ensure expected columns exist
-- ---------------------------------------------------------------------
do $$ begin
  alter table public.locations add column if not exists branch_name text;
  alter table public.locations add column if not exists address text;
  alter table public.locations add column if not exists open_time text default '09.00';
  alter table public.locations add column if not exists close_time text default '20.00';
  alter table public.locations add column if not exists whatsapp_url text;
  alter table public.locations add column if not exists maps_url text;
  alter table public.locations add column if not exists phone text;
  alter table public.locations add column if not exists is_active boolean default true;
  alter table public.locations add column if not exists sort_order integer default 0;
  alter table public.locations add column if not exists slug text;
  alter table public.locations add column if not exists tagline text;
exception when undefined_table then
  create table public.locations (
    id          bigserial primary key,
    branch_name text not null,
    slug        text,
    tagline     text,
    address     text,
    phone       text,
    open_time   text default '09.00',
    close_time  text default '20.00',
    whatsapp_url text,
    maps_url    text,
    is_active   boolean default true,
    sort_order  integer default 0,
    created_at  timestamptz default now()
  );
end $$;

-- ---------------------------------------------------------------------
-- 5. product_enrichments — multi-image support (up to 6 images)
-- ---------------------------------------------------------------------
do $$ begin
  alter table public.product_enrichments add column if not exists image_url_3 text;
  alter table public.product_enrichments add column if not exists image_url_4 text;
  alter table public.product_enrichments add column if not exists image_url_5 text;
  alter table public.product_enrichments add column if not exists image_url_6 text;
exception when undefined_table then null; end $$;

-- ---------------------------------------------------------------------
-- 6. RLS — public read, anon read for all settings/content
-- ---------------------------------------------------------------------
alter table public.site_settings enable row level security;
alter table public.promos enable row level security;

drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read" on public.site_settings for select using (true);

drop policy if exists "promos public read" on public.promos;
create policy "promos public read" on public.promos for select using (true);

-- Admin write policies are intentionally permissive for the anon key;
-- if you need stricter control, swap to a service-role approach.
drop policy if exists "site_settings anon write" on public.site_settings;
create policy "site_settings anon write" on public.site_settings for all using (true) with check (true);

drop policy if exists "promos anon write" on public.promos;
create policy "promos anon write" on public.promos for all using (true) with check (true);
