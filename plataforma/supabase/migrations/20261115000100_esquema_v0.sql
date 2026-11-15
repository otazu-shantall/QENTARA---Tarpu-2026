-- TARPU · esquema v0 (DT-23). Escrito por Erick con asistencia de IA (Claude Code); declarado en entrega/uso-de-ia.md.
--
-- Base para que el modelo de datos de Damaris (trabajo/T03-modelado-datos) se coloque encima:
-- sus cambios van como MIGRACIONES NUEVAS (nunca se edita una migración ya aplicada).
--
-- Ideas clave (docs/12-carpetas-docker-y-despliegue.md):
-- * Las series se guardan por CELDA o PÍXEL del producto, no por parcela: dos parcelas vecinas que caen en la misma
--   celda reutilizan la misma extracción (tablas celdas, extracciones, observaciones, parcela_celdas).
-- * Los mapas grandes (rasters) viven en Storage; aquí solo su ficha (capas_base).
-- * La cola de trabajos vive en la tabla trabajos; el trabajador los toma con tomar_trabajo() (FOR UPDATE SKIP LOCKED).
-- * Un faltante es NULL, nunca 0 (DT-16). Cada extracción guarda su procedencia.
-- * Solo el backend (conexión directa a Postgres) lee y escribe: RLS activado y sin políticas públicas.

create extension if not exists postgis with schema extensions;

-- ------------------------------------------------------------------ catálogo
create table public.fuentes (
  id          text primary key,                 -- 'nasa_power', 'ornl_modis', 'soilgrids', 'gaez', 'nasadem', 'cenagro'
  nombre      text not null,
  proveedor   text,
  url         text,
  cita        text,
  licencia    text,                             -- null = por verificar
  meta        jsonb not null default '{}'
);

create table public.productos (
  id            text primary key,               -- 'POWER_DIARIO_AG', 'MOD13Q1', 'MOD16A2GF', 'MOD11A2', 'MCD12Q1'
  fuente_id     text not null references public.fuentes(id),
  nombre        text not null,
  version       text,
  resolucion_m  numeric,                        -- tamaño nominal de la celda o píxel
  frecuencia    text,                           -- 'diaria', '8 días', '16 días', 'anual', 'estático'
  malla         text,                           -- cómo se calcula la clave de celda (ver tarpu_datos/celdas.py)
  nota          text,
  meta          jsonb not null default '{}'
);

create table public.variables (
  id            text primary key,               -- 'POWER_DIARIO_AG:T2M_MIN', 'MOD13Q1:250m_16_days_NDVI'
  producto_id   text not null references public.productos(id),
  nombre        text not null,
  unidad        text,
  factor        numeric,                        -- conversión aplicada (si la hay), leída del proveedor
  que_no_dice   text,                           -- T03 §3.2: lo que el dato NO permite concluir
  nivel         text not null default 'normalizado' check (nivel in ('original', 'normalizado', 'derivado')),
  meta          jsonb not null default '{}'
);

-- ------------------------------------------------------------------ celdas y series
create table public.celdas (
  id           bigint generated always as identity primary key,
  producto_id  text not null references public.productos(id),
  clave        text not null,                   -- p. ej. 'MOD13Q1:x=-7699330.73,y=-1702905.85' o 'POWER:-15.500,-71.875'
  centro       extensions.geometry(Point, 4326),
  geom         extensions.geometry(Polygon, 4326),  -- huella de la celda o píxel (si se conoce)
  elevacion_m  numeric,                         -- POWER informa la elevación de su celda
  meta         jsonb not null default '{}',
  creado       timestamptz not null default now(),
  unique (producto_id, clave)
);
create index celdas_geom_idx on public.celdas using gist (geom);
create index celdas_centro_idx on public.celdas using gist (centro);

create table public.extracciones (
  id                bigint generated always as identity primary key,
  celda_id          bigint not null references public.celdas(id) on delete cascade,
  variable_id       text not null references public.variables(id),
  desde             date,
  hasta             date,                       -- último día con dato (para saber si hace falta actualizar)
  filas             integer,
  faltantes         integer,
  estado            text not null default 'listo' check (estado in ('listo', 'listo_con_vacios', 'parcial', 'error')),
  procedencia       jsonb not null default '{}',-- URL, fecha de consulta, versión, método
  archivo_original  text,                       -- ruta en Storage del original del proveedor
  actualizado       timestamptz not null default now(),
  unique (celda_id, variable_id)
);

create table public.observaciones (
  celda_id     bigint not null references public.celdas(id) on delete cascade,
  variable_id  text not null references public.variables(id),
  fecha        date not null,
  valor        double precision,                -- NULL = sin dato (nunca 0)
  calidad      text,                            -- p. ej. confiabilidad de MOD13Q1
  primary key (celda_id, variable_id, fecha)
);

-- ------------------------------------------------------------------ base de Arequipa (rasters en Storage)
create table public.capas_base (
  id           text primary key,                -- 'soilgrids:phh2o_0-5cm_mean', 'gaez:256952', 'nasadem:s17w073'
  fuente_id    text not null references public.fuentes(id),
  variable     text,
  profundidad  text,
  estadistico  text,
  bucket       text not null default 'base-arequipa',
  ruta         text not null,                   -- ruta dentro del bucket
  crs          text,
  resolucion   text,
  bytes        bigint,
  meta         jsonb not null default '{}',
  actualizado  timestamptz not null default now()
);

-- ------------------------------------------------------------------ parcelas
create table public.parcelas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text,
  contorno      extensions.geometry(Polygon, 4326) not null,
  centroide     extensions.geometry(Point, 4326) not null,
  area_ha       numeric,
  perimetro_m   numeric,
  sector        text,                           -- S1, S2, S3 (DT-18)
  dueno         uuid,                           -- cuando haya cuentas (auth.users)
  creado        timestamptz not null default now()
);
create index parcelas_contorno_idx on public.parcelas using gist (contorno);

create table public.parcela_celdas (
  parcela_id         uuid not null references public.parcelas(id) on delete cascade,
  celda_id           bigint not null references public.celdas(id),
  producto_id        text not null references public.productos(id),
  fraccion_parcela   numeric,                   -- qué parte de la parcela cubre la celda (1 = toda)
  primary key (parcela_id, celda_id)
);

create table public.contexto_declarado (
  parcela_id   uuid primary key references public.parcelas(id) on delete cascade,
  datos        jsonb not null,                  -- origen «declarado» (DT-16)
  actualizado  timestamptz not null default now()
);

-- ------------------------------------------------------------------ cola de trabajos (capa 2)
create table public.trabajos (
  id           uuid primary key default gen_random_uuid(),
  clave        text not null unique,            -- clave del punto (centroide, 4 decimales), igual que hoy
  nombre       text,
  parcela_id   uuid references public.parcelas(id) on delete set null,
  punto        extensions.geometry(Point, 4326) not null,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente', 'en_proceso', 'listo', 'listo_con_vacios', 'parcial',
                                 'error', 'cancelado', 'interrumpido')),
  fuentes      jsonb not null default '{}',     -- estado por fuente, vacíos del proveedor, fallos, reutilizado
  parcela      jsonb,                           -- contorno y medidas tal como los mandó la web
  intentos     integer not null default 0,
  tomado_por   text,
  latido       timestamptz,
  cancelar     boolean not null default false,
  motivo       text,
  aviso        jsonb not null default '{}',
  creado       timestamptz not null default now(),
  iniciado     timestamptz,
  terminado    timestamptz,
  actualizado  timestamptz not null default now()
);
create index trabajos_estado_idx on public.trabajos (estado, creado);

-- El trabajador toma el trabajo pendiente más antiguo sin pisarse con otros trabajadores.
create or replace function public.tomar_trabajo(trabajador text)
returns setof public.trabajos
language sql
as $$
  update public.trabajos t
     set estado = 'en_proceso', tomado_por = trabajador, iniciado = now(), latido = now(),
         intentos = t.intentos + 1, actualizado = now()
   where t.id = (select id from public.trabajos
                  where estado = 'pendiente' and not cancelar
                  order by creado
                  for update skip locked
                  limit 1)
  returning t.*;
$$;

-- Un trabajo «en proceso» sin latido reciente quedó huérfano (se cayó el trabajador): vuelve a la cola.
create or replace function public.reencolar_huerfanos(minutos integer default 15)
returns integer
language sql
as $$
  with r as (
    update public.trabajos set estado = 'pendiente', tomado_por = null, actualizado = now(),
           motivo = 'reencolado: sin latido del trabajador'
     where estado = 'en_proceso' and latido < now() - make_interval(mins => minutos)
    returning 1)
  select count(*)::integer from r;
$$;

-- ------------------------------------------------------------------ motor (T03 lo refina)
create table public.evaluaciones (
  parcela_id   uuid not null references public.parcelas(id) on delete cascade,
  cultivo      text not null,
  criterio     text not null,
  estado       text not null check (estado in ('dentro_optimo', 'dentro_absoluto', 'fuera_absoluto', 'medido',
                                               'informativo', 'conflicto_entre_fuentes', 'sin_dato', 'sin_regla')),
  dato         jsonb,
  regla        jsonb,
  cita         text,
  calculado    timestamptz not null default now(),
  primary key (parcela_id, cultivo, criterio)
);

-- ------------------------------------------------------------------ vistas (contrato por pantalla: hueco para T03)
-- Puntos extraídos (la pestaña de la pantalla de prueba).
create or replace view public.vista_puntos_extraidos as
select t.clave, t.nombre, t.estado, t.creado, t.iniciado, t.terminado, t.actualizado,
       extensions.st_y(t.punto) as lat, extensions.st_x(t.punto) as lon,
       t.parcela, (select jsonb_object_agg(k, v->>'estado') from jsonb_each(t.fuentes) as f(k, v)) as fuentes
  from public.trabajos t;

-- Cobertura: qué celdas tienen serie y hasta cuándo (para reutilizar y para actualizar).
create or replace view public.vista_cobertura as
select c.producto_id, c.clave, c.id as celda_id, e.variable_id, e.desde, e.hasta, e.estado, e.actualizado
  from public.celdas c join public.extracciones e on e.celda_id = c.id;

-- ------------------------------------------------------------------ seguridad
alter table public.fuentes            enable row level security;
alter table public.productos          enable row level security;
alter table public.variables          enable row level security;
alter table public.celdas             enable row level security;
alter table public.extracciones       enable row level security;
alter table public.observaciones      enable row level security;
alter table public.capas_base         enable row level security;
alter table public.parcelas           enable row level security;
alter table public.parcela_celdas     enable row level security;
alter table public.contexto_declarado enable row level security;
alter table public.trabajos           enable row level security;
alter table public.evaluaciones       enable row level security;

-- ------------------------------------------------------------------ Storage
insert into storage.buckets (id, name, public) values
  ('base-arequipa', 'base-arequipa', false),     -- mapas de la capa 1
  ('originales', 'originales', false)             -- respuestas originales de cada proveedor
on conflict (id) do nothing;
