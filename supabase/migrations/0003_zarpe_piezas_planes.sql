-- Cay Sarah · zarpe completo, cambios de piezas con foto y mantenimiento por tiempo.
-- Solo agrega columnas y una tabla nueva: no toca datos existentes.

-- ---------- zarpe: número, origen y documentos ----------
alter table public.viajes
  add column if not exists numero_zarpe text,
  add column if not exists origen text,
  add column if not exists documentos jsonb not null default '[]';  -- [{nombre, archivo, fecha}]

-- ---------- bitácora: cambios de piezas ----------
-- Un cambio de pieza es una entrada tipo 'Mantenimiento' con equipo, pieza y foto (la columna foto ya existe).
alter table public.entradas
  add column if not exists equipo text,
  add column if not exists pieza text,
  add column if not exists plan_id uuid;

-- ---------- mantenimiento por tiempo (extintores, aires acondicionados, balsa…) ----------
create table if not exists public.planes (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  nombre text not null,            -- Ej. Extintores: inspección y recarga
  sistema text,                    -- Seguridad, Climatización, Agua, Casco, Eléctrico…
  cada int not null default 1,     -- cada N…
  unidad text not null default 'meses' check (unidad in ('dias','semanas','meses','anios')),
  ultimo date,                     -- última vez que se hizo
  aviso int not null default 15,   -- avisar con N días de anticipación
  nota text, activo boolean not null default true, orden int default 99,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create index if not exists planes_barco_id_idx on public.planes (barco_id);
create index if not exists planes_updated_at_idx on public.planes (updated_at);
alter table public.planes enable row level security;

drop trigger if exists tocar_planes on public.planes;
create trigger tocar_planes before insert or update on public.planes for each row execute function public.tocar();

drop policy if exists "leer planes" on public.planes;
drop policy if exists "crear planes" on public.planes;
drop policy if exists "editar planes" on public.planes;
drop policy if exists "borrar planes" on public.planes;
create policy "leer planes" on public.planes for select to authenticated using (public.es_miembro(barco_id));
create policy "crear planes" on public.planes for insert to authenticated with check (public.es_miembro(barco_id));
create policy "editar planes" on public.planes for update to authenticated using (public.es_miembro(barco_id))
  with check (public.es_miembro(barco_id) and (borrado = false or public.puede_gestionar(barco_id)));
create policy "borrar planes" on public.planes for delete to authenticated using (public.puede_gestionar(barco_id));

grant select, insert, update, delete on public.planes to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.planes;
exception when duplicate_object then null; end $$;
