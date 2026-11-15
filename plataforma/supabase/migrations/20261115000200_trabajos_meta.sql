-- TARPU · datos extra de cada trabajo (cancelación, traza de error, celdas reutilizadas). Escrito con asistencia de IA
-- (Claude Code); declarado en entrega/uso-de-ia.md.
alter table public.trabajos add column if not exists meta jsonb not null default '{}';

-- Upsert de una serie completa en una sola llamada (la usa el trabajador al guardar una celda).
create or replace function public.celda_id(p_producto text, p_clave text, p_lon double precision, p_lat double precision,
                                            p_huella jsonb, p_elevacion numeric default null, p_meta jsonb default '{}')
returns bigint
language plpgsql
as $$
declare v_id bigint;
begin
  insert into public.celdas (producto_id, clave, centro, geom, elevacion_m, meta)
  values (p_producto, p_clave, extensions.st_setsrid(extensions.st_makepoint(p_lon, p_lat), 4326),
          case when p_huella is null then null
               else extensions.st_setsrid(extensions.st_geomfromgeojson(
                      jsonb_build_object('type', 'Polygon', 'coordinates', jsonb_build_array(p_huella))::text), 4326) end,
          p_elevacion, p_meta)
  on conflict (producto_id, clave) do update set elevacion_m = coalesce(excluded.elevacion_m, public.celdas.elevacion_m)
  returning id into v_id;
  return v_id;
end;
$$;
