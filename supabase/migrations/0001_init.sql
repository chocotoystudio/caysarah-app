-- Cay Sarah · Bitácora
-- Esquema multi-barco: cada fila pertenece a un barco y solo la ven sus miembros.
-- Roles: dueno (todo, incluidas finanzas y miembros), capitan (operación y gastos), tripulacion (registra, no borra ni ve finanzas).

create extension if not exists pgcrypto;

-- ---------- barcos y miembros ----------
create table public.barcos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  modelo text,
  puerto text,
  capitan text,
  motores text,
  planta text,
  aceite text,
  racor text,
  combustible text,
  desal text,
  tender text,
  marinero text,
  ficha jsonb not null default '{}',  -- ficha técnica: matrícula, MMSI, HIN, eslora, arqueo, propietario, registro naval…
  creado_por uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.rol as enum ('dueno','capitan','tripulacion');

create table public.miembros (
  barco_id uuid not null references public.barcos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rol public.rol not null default 'tripulacion',
  nombre text,
  created_at timestamptz not null default now(),
  primary key (barco_id, user_id)
);

create table public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  barco_id uuid not null references public.barcos(id) on delete cascade,
  email text not null,
  rol public.rol not null default 'tripulacion',
  nombre text,
  creado_por uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (barco_id, email)
);

-- funciones de acceso (security definer para evitar recursión en RLS)
create or replace function public.rol_en(b uuid) returns public.rol
language sql stable security definer set search_path = public as $$
  select rol from public.miembros where barco_id = b and user_id = auth.uid()
$$;
create or replace function public.es_miembro(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.miembros where barco_id = b and user_id = auth.uid())
$$;
create or replace function public.puede_gestionar(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.rol_en(b) in ('dueno','capitan'), false)
$$;
create or replace function public.ve_finanzas(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.rol_en(b) in ('dueno','capitan'), false)
$$;

-- crear barco: quien lo crea queda como dueño
create or replace function public.crear_barco(p_nombre text, p_puerto text default 'Puerto La Cruz')
returns uuid language plpgsql security definer set search_path = public as $$
declare b uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero'; end if;
  insert into public.barcos (nombre, puerto, creado_por) values (p_nombre, p_puerto, auth.uid()) returning id into b;
  insert into public.miembros (barco_id, user_id, rol) values (b, auth.uid(), 'dueno');
  return b;
end $$;

-- aceptar invitaciones pendientes para el correo de la sesión
create or replace function public.aceptar_invitaciones() returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; r record; mail text;
begin
  select email into mail from auth.users where id = auth.uid();
  if mail is null then return 0; end if;
  for r in select * from public.invitaciones where lower(email) = lower(mail) loop
    insert into public.miembros (barco_id, user_id, rol, nombre) values (r.barco_id, auth.uid(), r.rol, r.nombre)
      on conflict (barco_id, user_id) do update set rol = excluded.rol;
    delete from public.invitaciones where id = r.id;
    n := n + 1;
  end loop;
  return n;
end $$;

-- ---------- tablas de operación ----------
-- Todas llevan id (uuid generado en el teléfono, para funcionar sin señal), barco_id,
-- updated_at (para sincronizar) y borrado (borrado lógico, para que el borrado viaje a otros teléfonos).
create table public.maquinas (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  clave text not null, nombre text not null, modelo text, serial text, nota text, orden int default 9,
  horas numeric default 0, fecha date, tareas jsonb not null default '[]',
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid(),
  unique (barco_id, clave)
);
create table public.lecturas (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  fecha date not null, maquina text not null, horas numeric not null, nota text,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.viajes (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  destino text not null, tipo text, cliente text, personas int, ingreso numeric,
  zarpe date, hora_zarpe text, llegada date, millas numeric,
  hz jsonb not null default '{}', hl jsonb not null default '{}', estado text not null default 'En curso', notas text,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.entradas (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  fecha date not null, hora text, tipo text not null, titulo text not null, detalle text, lugar text,
  litros numeric, costo numeric, viaje_id uuid, resuelta boolean default false,
  zona text, h_ini text, h_fin text, secado text, foto text,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.gastos (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  fecha date not null, concepto text not null, tipo text not null default 'Operativo', categoria text,
  monto numeric not null default 0, litros numeric, proveedor text, pago text, nota text,
  viaje_id uuid, entrada_id uuid, fijo_id uuid, recibo text,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.fijos (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  concepto text not null, monto numeric, frecuencia text default 'Mensual', dia int, mes_pago text default '1',
  categoria text, proveedor text, activo boolean default true,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.vencimientos (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  nombre text not null, numero text, emision date, vence date, aviso int default 60, nota text, archivo text,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.rev_items (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  texto text not null, ayuda text, orden int default 0, activo boolean default true,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.revisiones (
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  semana date not null, items jsonb not null default '{}',
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid(),
  unique (barco_id, semana)
);

create table public.trabajos (  -- refits, reparaciones e inversiones en el barco
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  fecha date not null, titulo text not null, categoria text, proveedor text, lugar text, horas text, factura text,
  estado text not null default 'Completado', monto numeric not null default 0, detalle text,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.facturas (  -- facturas y documentos de proveedores, con saldo por pagar
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  fecha date not null, proveedor text not null, nombre text not null, total numeric, saldo numeric not null default 0,
  trabajo_id uuid, archivo text, nota text,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.temas (  -- preguntas, problemas, mejoras y pendientes entre dueño y capitán
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  fecha date not null, tipo text not null default 'Pendiente', prioridad text not null default 'media', texto text not null,
  estado text not null default 'abierto', respuesta text, resuelto date,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);
create table public.equipos (  -- radio y navegación (certificado de seguridad radiotelefónica)
  id uuid primary key, barco_id uuid not null references public.barcos(id) on delete cascade,
  elemento text not null, fabricante text, modelo text, potencia text, frecuencia text, orden int default 99,
  borrado boolean not null default false, updated_at timestamptz not null default now(), autor uuid default auth.uid()
);

-- updated_at automático
create or replace function public.tocar() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

do $$ declare t text; begin
  foreach t in array array['barcos','maquinas','lecturas','viajes','entradas','gastos','fijos','vencimientos','rev_items','revisiones','trabajos','facturas','temas','equipos'] loop
    execute format('create trigger tocar_%1$s before insert or update on public.%1$s for each row execute function public.tocar()', t);
    execute format('create index on public.%1$s (updated_at)', t);
    execute format('alter table public.%1$s enable row level security', t);
  end loop;
  foreach t in array array['maquinas','lecturas','viajes','entradas','fijos','vencimientos','rev_items','revisiones','trabajos','facturas','temas','equipos'] loop
    execute format('create index on public.%1$s (barco_id)', t);
    execute format('create policy "leer %1$s" on public.%1$s for select using (public.es_miembro(barco_id))', t);
    execute format('create policy "crear %1$s" on public.%1$s for insert with check (public.es_miembro(barco_id))', t);
    -- el borrado lógico es un update: la tripulación no puede marcar borrado
    execute format('create policy "editar %1$s" on public.%1$s for update using (public.es_miembro(barco_id)) with check (public.es_miembro(barco_id) and (borrado = false or public.puede_gestionar(barco_id)))', t);
    execute format('create policy "borrar %1$s" on public.%1$s for delete using (public.puede_gestionar(barco_id))', t);
  end loop;
end $$;

-- gastos: todos los miembros registran; solo dueño y capitán los ven y gestionan
create index on public.gastos (barco_id);
create policy "leer gastos" on public.gastos for select using (public.ve_finanzas(barco_id) or autor = auth.uid());
create policy "crear gastos" on public.gastos for insert with check (public.es_miembro(barco_id));
-- quien registró un gasto puede corregirlo (no borrarlo); finanzas gestiona todos
create policy "editar gastos" on public.gastos for update using (public.ve_finanzas(barco_id) or (autor = auth.uid() and public.es_miembro(barco_id)))
  with check (public.ve_finanzas(barco_id) or (autor = auth.uid() and public.es_miembro(barco_id) and borrado = false));
create policy "borrar gastos" on public.gastos for delete using (public.puede_gestionar(barco_id));
-- fijos: solo finanzas
drop policy "leer fijos" on public.fijos; drop policy "crear fijos" on public.fijos; drop policy "editar fijos" on public.fijos;
create policy "leer fijos" on public.fijos for select using (public.ve_finanzas(barco_id));
create policy "crear fijos" on public.fijos for insert with check (public.ve_finanzas(barco_id));
create policy "editar fijos" on public.fijos for update using (public.ve_finanzas(barco_id)) with check (public.ve_finanzas(barco_id));
-- trabajos y facturas: solo finanzas (dueño y capitán)
do $$ declare t text; begin
  foreach t in array array['trabajos','facturas'] loop
    execute format('drop policy "leer %1$s" on public.%1$s; drop policy "crear %1$s" on public.%1$s; drop policy "editar %1$s" on public.%1$s', t);
    execute format('create policy "leer %1$s" on public.%1$s for select using (public.ve_finanzas(barco_id))', t);
    execute format('create policy "crear %1$s" on public.%1$s for insert with check (public.ve_finanzas(barco_id))', t);
    execute format('create policy "editar %1$s" on public.%1$s for update using (public.ve_finanzas(barco_id)) with check (public.ve_finanzas(barco_id))', t);
  end loop;
end $$;

-- barcos, miembros, invitaciones
alter table public.miembros enable row level security;
alter table public.invitaciones enable row level security;
create policy "leer barco" on public.barcos for select using (public.es_miembro(id));
create policy "editar barco" on public.barcos for update using (public.puede_gestionar(id)) with check (public.puede_gestionar(id));
create policy "leer miembros" on public.miembros for select using (public.es_miembro(barco_id));
create policy "dueño gestiona miembros" on public.miembros for all using (public.rol_en(barco_id) = 'dueno') with check (public.rol_en(barco_id) = 'dueno');
create policy "dueño ve invitaciones" on public.invitaciones for select using (public.rol_en(barco_id) = 'dueno');
create policy "dueño invita" on public.invitaciones for insert with check (public.rol_en(barco_id) = 'dueno');
create policy "dueño borra invitaciones" on public.invitaciones for delete using (public.rol_en(barco_id) = 'dueno');

grant execute on function public.crear_barco(text, text) to authenticated;
grant execute on function public.aceptar_invitaciones() to authenticated;

-- ---------- fotos de recibos ----------
insert into storage.buckets (id, name, public) values ('recibos', 'recibos', false) on conflict do nothing;
-- rutas: <barco_id>/fin/<archivo> (recibos y facturas: solo finanzas) y <barco_id>/docs/<archivo> (certificados: todos)
create policy "ver recibos" on storage.objects for select using (bucket_id = 'recibos' and public.es_miembro(((storage.foldername(name))[1])::uuid)
  and ((storage.foldername(name))[2] is distinct from 'fin' or public.ve_finanzas(((storage.foldername(name))[1])::uuid)));
create policy "subir recibos" on storage.objects for insert with check (bucket_id = 'recibos' and public.es_miembro(((storage.foldername(name))[1])::uuid));
create policy "borrar recibos" on storage.objects for delete using (bucket_id = 'recibos' and public.puede_gestionar(((storage.foldername(name))[1])::uuid));

-- ---------- tiempo real ----------
alter publication supabase_realtime add table public.maquinas, public.lecturas, public.viajes, public.entradas, public.gastos, public.fijos, public.vencimientos, public.rev_items, public.revisiones, public.trabajos, public.facturas, public.temas, public.equipos, public.barcos;
