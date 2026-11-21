-- Acceso por código de puesto, sin correo, para todos (dueños incluidos).
-- Al cambiar un código, todos los teléfonos que entraron con el anterior pierden el acceso al instante.
-- Los datos pertenecen al barco, no a la persona: nada se pierde cuando cambia la tripulación.

create table public.codigos (
  id uuid primary key default gen_random_uuid(),
  barco_id uuid not null references public.barcos(id) on delete cascade,
  puesto text not null,
  rol public.rol not null,
  codigo text not null unique,
  creado_por uuid default auth.uid(),
  created_at timestamptz not null default now(),
  rotado_at timestamptz not null default now()
);
create index on public.codigos (barco_id);
alter table public.codigos enable row level security;
create policy "dueño ve códigos" on public.codigos for select to authenticated using (public.rol_en(barco_id) = 'dueno');
grant select on public.codigos to authenticated;

-- cada acceso por código queda ligado a su código: al cambiarlo o eliminarlo, el acceso se va con él
alter table public.miembros add column codigo_id uuid references public.codigos(id) on delete cascade;

-- código legible: 8 caracteres sin letras ni números confusos (sin 0/O, 1/I/L), formato XXXX-XXXX
create or replace function public.codigo_nuevo() returns text
language plpgsql volatile set search_path = public, extensions as $$
declare a text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; b bytea := gen_random_bytes(8); s text := ''; i int;
begin
  for i in 0..7 loop s := s || substr(a, (get_byte(b, i) % length(a)) + 1, 1); end loop;
  return substr(s, 1, 4) || '-' || substr(s, 5, 4);
end $$;

create or replace function public.es_anonimo() returns boolean
language sql stable as $$ select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) $$;

create or replace function public.crear_codigo(p_barco uuid, p_puesto text, p_rol public.rol)
returns public.codigos language plpgsql security definer set search_path = public as $$
declare r public.codigos;
begin
  if public.rol_en(p_barco) is distinct from 'dueno' then raise exception 'Solo el dueño crea accesos'; end if;
  insert into public.codigos (barco_id, puesto, rol, codigo) values (p_barco, p_puesto, p_rol, public.codigo_nuevo()) returning * into r;
  return r;
end $$;

create or replace function public.rotar_codigo(p_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare b uuid; c text;
begin
  select barco_id into b from public.codigos where id = p_id;
  if b is null or public.rol_en(b) is distinct from 'dueno' then raise exception 'Solo el dueño cambia códigos'; end if;
  -- quien cambia el código conserva su propio acceso (si entró con ese mismo código)
  delete from public.miembros where codigo_id = p_id and user_id <> auth.uid();
  c := public.codigo_nuevo();
  update public.codigos set codigo = c, rotado_at = now() where id = p_id;
  return c;
end $$;

create or replace function public.eliminar_codigo(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare b uuid;
begin
  select barco_id into b from public.codigos where id = p_id;
  if b is null or public.rol_en(b) is distinct from 'dueno' then raise exception 'Solo el dueño elimina accesos'; end if;
  if (select rol from public.codigos where id = p_id) = 'dueno'
     and (select count(*) from public.codigos where barco_id = b and rol = 'dueno') <= 1 then
    raise exception 'Debe quedar al menos un acceso de dueño';
  end if;
  delete from public.codigos where id = p_id;
end $$;

-- entrar con código: el teléfono abre una sesión anónima y la canjea por acceso al barco
create or replace function public.canjear_codigo(p_codigo text, p_nombre text) returns uuid
language plpgsql security definer set search_path = public as $$
declare k public.codigos; limpio text := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if auth.uid() is null then raise exception 'Sin sesión'; end if;
  select * into k from public.codigos where replace(codigo, '-', '') = limpio;
  if k.id is null then raise exception 'Código no válido'; end if;
  insert into public.miembros (barco_id, user_id, rol, nombre, codigo_id)
    values (k.barco_id, auth.uid(), k.rol, nullif(trim(p_nombre), ''), k.id)
    on conflict (barco_id, user_id) do update set rol = excluded.rol, nombre = excluded.nombre, codigo_id = excluded.codigo_id
    where public.miembros.rol <> 'dueno';
  return k.barco_id;
end $$;

-- los barcos se crean desde el panel de Supabase (abajo); la app ya no los crea
create or replace function public.crear_barco(p_nombre text, p_puerto text default 'Puerto La Cruz')
returns uuid language plpgsql security definer set search_path = public as $$
declare b uuid;
begin
  if auth.uid() is null or public.es_anonimo() then raise exception 'Entra con tu correo para crear un barco'; end if;
  insert into public.barcos (nombre, puerto, creado_por) values (p_nombre, p_puerto, auth.uid()) returning id into b;
  insert into public.miembros (barco_id, user_id, rol) values (b, auth.uid(), 'dueno');
  return b;
end $$;

-- funciones solo para usuarios con sesión (cierra los avisos de seguridad de Supabase)
revoke execute on function public.rol_en(uuid), public.es_miembro(uuid), public.puede_gestionar(uuid), public.ve_finanzas(uuid),
  public.crear_barco(text, text), public.aceptar_invitaciones(), public.codigo_nuevo(), public.crear_codigo(uuid, text, public.rol),
  public.rotar_codigo(uuid), public.eliminar_codigo(uuid), public.canjear_codigo(text, text) from public, anon;
grant execute on function public.rol_en(uuid), public.es_miembro(uuid), public.puede_gestionar(uuid), public.ve_finanzas(uuid),
  public.crear_barco(text, text), public.aceptar_invitaciones(), public.crear_codigo(uuid, text, public.rol),
  public.rotar_codigo(uuid), public.eliminar_codigo(uuid), public.canjear_codigo(text, text) to authenticated;
grant execute on function public.es_anonimo() to authenticated;

-- ---------- barco inicial y sus tres accesos ----------
do $$ declare b uuid; begin
  select id into b from public.barcos order by created_at limit 1;
  if b is null then
    insert into public.barcos (nombre, modelo, puerto) values ('Cay Sarah', 'Aquila 44', 'Puerto La Cruz') returning id into b;
  end if;
  if not exists (select 1 from public.codigos where barco_id = b) then
    insert into public.codigos (barco_id, puesto, rol, codigo) values
      (b, 'Dueño', 'dueno', public.codigo_nuevo()),
      (b, 'Capitán', 'capitan', public.codigo_nuevo()),
      (b, 'Tripulación', 'tripulacion', public.codigo_nuevo());
  end if;
end $$;

-- muestra los códigos al terminar (guárdalos: si se pierden, vuelve a correr solo esta línea en el SQL Editor)
select puesto, codigo from public.codigos order by case rol when 'dueno' then 1 when 'capitan' then 2 else 3 end;
