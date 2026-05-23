-- Hero Carousel Settings Migration
-- Adds columns for hero image carousel functionality

do $$ begin
  alter table public.site_settings add column if not exists hero_carousel_enabled boolean default false;
  alter table public.site_settings add column if not exists hero_carousel_images jsonb default '[]'::jsonb;
  alter table public.site_settings add column if not exists hero_carousel_duration integer default 5000;
  alter table public.site_settings add column if not exists hero_carousel_transition text default 'fade';
exception when duplicate_column then null; end $$;
