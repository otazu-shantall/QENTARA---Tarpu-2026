# T03 · 5. Modelo físico: delta sobre el esquema v0

> **Área:** datos (Damaris). **Tarea:** [README.md](README.md), §3.5 y §3 bis. **Estado:** propuesta para revisar con Erick, 15/11/2026.
> Escrito con asistencia de IA (Claude Code); declarado en [entrega/uso-de-ia.md](../../entrega/uso-de-ia.md).
>
> **Qué es:** lo que le falta al esquema v0 de Erick para guardar el [modelo lógico](modelo-logico.md) sin perder información. Es un **delta**: no repite lo que ya existe.
>
> **No toca `supabase/` ni `backend/`** (`trabajo/T03-modelado-datos/AGENTS.md`). El SQL va en el §6 como bloque de texto. Si Erick lo acepta, él lo pasa a una migración nueva, sin editar las ya aplicadas (docs/12 §4, «Huecos que llena T03»).

## 1. La base

| Archivo | Qué trae |
|---|---|
| `supabase/migrations/20261115000100_esquema_v0.sql` | Las tablas `fuentes`, `productos`, `variables`, `celdas`, `extracciones`, `observaciones`, `capas_base`, `parcelas`, `parcela_celdas`, `contexto_declarado`, `trabajos` y `evaluaciones`; las funciones `tomar_trabajo` y `reencolar_huerfanos`; las vistas `vista_puntos_extraidos` y `vista_cobertura`; RLS en todas las tablas; los buckets `base-arequipa` y `originales` |
| `supabase/migrations/20261115000200_trabajos_meta.sql` | `trabajos.meta` y la función `celda_id(...)` (upsert de una celda) |
| `supabase/seed.sql` | Generado por `backend/herramientas/generar_seed.py`: 6 fuentes, 8 productos y 26 variables (docs/12 §6 bis) |

**Decisiones que ya están tomadas y este delta respeta** (DT-23, docs/12 §9):
- **Supabase** (Postgres, PostGIS y Storage);
- **series por celda o píxel del producto**;
- **mapas grandes en Storage**, con `capas_base` como índice.

## 2. Qué ya cubre el v0

| Entidad | Tabla del v0 | Cobertura |
|---|---|---|
| E01 Parcela | `parcelas` | ✅ |
| E02 Contexto declarado | `contexto_declarado` (`datos jsonb`) | ✅. La forma de `datos` la da `backend/contrato/esquemas/ContextoEntrada.json` |
| E04 Fuente, E05 Producto | `fuentes`, `productos` | ✅. Faltan las filas de HLS y SMAP (§4.8) |
| E06 Variable | `variables` | 🟡 Faltan columnas (§3.2) |
| E07 Rejilla | `productos.malla` (texto) | ✅ suficiente: la clave la calcula `celdas.py` |
| E08 Celda | `celdas` (`producto_id + clave`, `geom`, `centro`, `elevacion_m`) | ✅ |
| E09 Parcela ↔ celda | `parcela_celdas` (`fraccion_parcela`) | 🟡 Falta la regla (§3.4; P-03) |
| E10 Capa estática | `capas_base` | ✅ |
| E11 Observación | `observaciones` (`valor`, `calidad`) | 🟡 Faltan motivo, nivel y consulta (§3.1) |
| E13 Archivo | `extracciones.archivo_original` y los buckets | ✅ suficiente para el original; los demás niveles van en `consultas.archivos` (§4.2) |
| E14 Consulta | `extracciones.procedencia` (jsonb) | 🟡 Una fila por celda y variable, no por consulta (§4.2) |
| E15 Trabajo, E16 Aviso | `trabajos` (con `aviso jsonb`, `meta`) | ✅. El aviso sigue en jsonb hasta que se decida el canal (docs/11 §6) |
| E23 Evaluación | `evaluaciones` | ✅. El `check` ya incluye `medido`, `informativo` y `conflicto_entre_fuentes` |
| E03 Punto | `trabajos.clave` y `trabajos.punto` | ✅ suficiente: el punto solo existe como origen de un trabajo |

## 3. Columnas que faltan

### 3.1 `observaciones` (E11)

| Columna | Tipo | Por qué |
|---|---|---|
| `motivo` | `text`, con `check` en la lista del modelo lógico §4.1 | **Un faltante nunca es 0** (DT-16): `valor` null no dice por qué falta (P-04) |
| `nivel` | `text`, con `check` (`original`, `normalizado` o `derivado`) | Plan maestro, «Acceso a datos detallados»: los niveles se identifican por separado. Hoy solo lo tiene `variables` |
| `consulta_id` | `bigint`, referencia a `consultas` (§4.2) | Cada valor debe poder llevar su procedencia (README de T03, §2.2) |
| `valor_crudo` | `double precision` | **No estaba en tu lista**, pero hace falta para `sin_verificar`: el valor existe y no se convierte (`uncertainty` de SoilGrids; MODIS con `add_offset` ≠ 0). Sin esta columna, ese entero se perdería o se confundiría con un vacío |

- **Regla propuesta:** si `valor` es null, `motivo` no puede ser null. Así nunca hay un vacío sin explicar.
  - Se añade como `not valid`: las filas ya cargadas se escribieron sin `motivo` (por ejemplo, las 82 346 de POWER de una celda; docs/12 §6 bis), y las que tengan `valor` null romperían la regla.
  - Se valida cuando se rellene el motivo de esas filas.
- **Aviso para Erick:** `calidad` existe en el v0, pero `backend/tarpu_datos/repositorio/supabase.py` no la rellena. El `insert` solo escribe `(celda_id, variable_id, fecha, valor)` (líneas 136-139), y la palabra `calidad` no aparece en el archivo.
  - **La fiabilidad de MOD13Q1 entra como otra variable:** cada columna del normalizado se guarda como variable si está en el catálogo (líneas 131-134), y `MOD13Q1:250m_16_days_pixel_reliability` lo está (`supabase/seed.sql:45`).

### 3.2 `variables` (E06)

| Columna | Tipo | Del diccionario |
|---|---|---|
| `unidad_proveedor` | `text` | Ej. `kg/m^2/8day`, `pH*10` (`bands.units`, `mapped_units`) |
| `unidad_final` | `text` | Ej. `kg/m²/8 días`, `pH` (`target_units`) |
| `relleno` | `double precision` | Ej. −3000 (MOD13Q1), −999 (POWER), −19999 (HLS, por verificar). Null si no se publica |
| `rango_min_crudo`, `rango_max_crudo` | `double precision` | `valid_range` en unidades **crudas**, antes del factor (ej. −2000 y 10000 en MOD13Q1) |
| `tipo` | `text`, con `check` (`continua` o `categorica`) | Diccionario, «Tipos» |
| `que_dice` | `text` | Columna «Qué dice». `que_no_dice` ya existe |

- **`unidad`** del v0 se mantiene, por compatibilidad con `generar_seed.py`. La propuesta es que pase a ser igual que `unidad_final`.
- **Lo demás que pide `catalogo/variables.json`** (`escala_espacial`, `frecuencia`, `latencia_observada`, `pantalla`, `cita`) sigue en `meta`, como lo diseñó Erick.

### 3.3 `extracciones.estado`
Añadir **`sin_datos`** (la fuente respondió sin datos: `trabajos.py`, `_power_de_la_base` y `_modis`) y **`no_disponible`** (vía no conectada: HLS y SMAP en `PENDIENTES`). El `check` del v0 solo admite `listo`, `listo_con_vacios`, `parcial` y `error`.

### 3.4 `parcela_celdas` (E09, P-03)

| Columna | Tipo | Por qué |
|---|---|---|
| `regla` | `text`, con `check` (`centro_dentro`, `toca` o `contiene_centroide`) | Es la regla de cobertura de `leer_parcela` (`cobertura`), que hoy no queda guardada con el resultado |
| `pixeles` | `integer` | Cuántos píxeles de la parcela cumplen la regla (`relieve.pixeles`, `suelo.pixeles`) |

`fraccion_parcela` se mantiene: es otra medida, compatible con la regla.

### 3.5 `observaciones`: más de un valor por día [por confirmar con Erick]
- **El problema:** la clave del v0 es `(celda_id, variable_id, fecha)`, con `fecha date`. **SMAP L4 da 8 valores por día** (01:30, 04:30… 22:30 UTC; `agregaciones.md` I17), y no caben.
- **Propuesta:** añadir `instante timestamptz`, igual a `fecha` a las 00:00 UTC para las series diarias, y pasar la clave primaria a `(celda_id, variable_id, instante)`.
- **Impacto:** cambia el `on conflict` de `supabase.py` (línea 139). Por eso va marcado para Erick y aparte en el SQL (bloque B del §6).

## 4. Tablas que faltan

| # | Tabla | Entidad | Por qué | Prioridad |
|---|---|---|---|---|
| 4.1 | `codigos_calidad` | E12 | Las etiquetas de los códigos (MOD13Q1 0–3, IGBP 1–17, banderas de SMAP) están hoy repartidas por el código: `ornl.py:40-42` y `FieldEvidence.tsx:42-62`. El frontend y el backend ya usan textos distintos (`Grasslands` frente a `Pastizal`) | Alta: alimenta las pantallas |
| 4.2 | `consultas` | E14 | `extracciones` tiene **una fila por celda y variable**, que se actualiza con cada vuelta (`on conflict … do update`), así que pierde qué petición trajo cada valor. `consultas` guarda una fila por petición: URL, fecha, versión, reintentos, bloques fallidos y archivos de cada nivel | Alta: procedencia de cada valor |
| 4.3 | `vueltas_actualizacion` | E17 | docs/12 §6 bis: «el actualizador, que en modo Supabase todavía actualiza puntos y no celdas». Una tabla por celda y producto permite actualizar celdas y saber cuándo se actualizó cada una | Media |
| 4.4 | `sectores`, `sector_cultivos` | E18 | `parcelas.sector` es texto libre sin referencia. Sus filas salen de `backend/catalogo/sectores.json` (DT-18, DT-20) | Media |
| 4.5 | `indicadores`, `indicador_resultados` | E21 | `backend/catalogo/indicadores.json` es el catálogo (2 implementados y NDVI por definir), pero los resultados por parcela no tienen tabla. Cada resultado guarda período, valor, faltantes y las consultas usadas (`agregaciones.md`, reglas comunes 3) | Alta: pantalla 5 |
| 4.6 | `estrategias` | E22 | `evaluaciones` va por cultivo y criterio, sin el **tipo** (`repetir_actual`, `cambiar_de_familia`…) ni el «por qué aparece» de `motor/estrategias.py`. El desafío pide al menos tres estrategias con su porqué (docs/08) | Media: pantalla 6 sin vista todavía |
| 4.7 | `cultivos`, `reglas_citadas` | E20 | Hoy, `evaluaciones.regla` (jsonb) y `cita` (texto). Puede seguir así mientras el catálogo de EcoCrop esté versionado en git (`catalogo/ecocrop_2026-11-14.json`). Se propone tabla solo si hay que consultar qué evaluaciones usaron una versión del catálogo | Baja |
| 4.8 | Filas de `fuentes` y `productos` para AppEEARS, HLS y SMAP | E04, E05 | El seed no las tiene: solo 6 fuentes y 8 productos. Hay datos descargados de `HLSL30_VI.020`, `HLSS30_VI.020`, `SPL3SMP_E.006` y `SPL4SMGP.008`. **Lo genera `generar_seed.py`**, así que es propuesta para Erick, no SQL | Media |
| — | E19 Unidad agropecuaria | E19 | **No se propone todavía:** `base_arequipa/cenagro2012/` no está en esta computadora (V-03) y sus unidades están por verificar (V-D11). Lo usable hoy son los agregados de `backend/investigacion/` | — |

## 5. Raster o tabla, e índices

**Raster o tabla** (igual que el v0; docs/12 §5):
- **Raster en Storage**, con `capas_base` como índice: SoilGrids, GAEZ, NASADEM y las imágenes HLS de Chivay (`img_chivay_*`).
- **Tabla:** las series (`observaciones`).

**Índices existentes:** GiST en `celdas.geom`, `celdas.centro` y `parcelas.contorno`; `trabajos (estado, creado)`; las claves primarias de las tablas.

**Índices nuevos propuestos:**
- `parcela_celdas (celda_id)`, para saber qué parcelas usan una celda: es lo que necesita el actualizador por celdas;
- `observaciones (consulta_id)`;
- `consultas (celda_id, variable_id, consultado)`.

`indicador_resultados` no necesita índice aparte: su clave primaria `(parcela_id, indicador_id)` ya lo es.

## 6. SQL propuesto

- **Nombre sugerido de la migración:** `20261115000300_t03_modelo.sql`.
- **No está aplicada.** Es texto para que Erick lo revise.
- **No lo probé contra la base:** Supabase no corre en esta computadora (V-F01).
- **Tipos comprobados contra `20261115000100_esquema_v0.sql`:** `celdas.id` es `bigint` (línea 52), `variables.id` y `productos.id` son `text` (40 y 28) y `parcelas.id` es `uuid` (107). Las referencias de este SQL usan esos mismos tipos. Los nombres de las restricciones están en V-F02.
- **Dos bloques:**
  - **A:** solo añade y no rompe nada de lo existente;
  - **B:** cambia la clave de `observaciones` y requiere cambiar `supabase.py`.

```sql
-- TARPU · T03 · delta sobre el esquema v0 (propuesta de Damaris, 15/11/2026; NO APLICADA).
-- Escrito con asistencia de IA (Claude Code); declarado en entrega/uso-de-ia.md.

-- =============== BLOQUE A · solo añade ===============

-- 4.2 Consultas (E14): una fila por petición a un proveedor.
create table public.consultas (
  id               bigint generated always as identity primary key,
  celda_id         bigint references public.celdas(id) on delete cascade,
  variable_id      text references public.variables(id),
  url              text not null,
  consultado       timestamptz not null,
  version_servicio text,
  peticiones       integer,
  reintentos       integer,
  bloques_fallidos integer,
  metodo           text,                         -- p. ej. 'value = raw * scale_factor; fill or out of valid_range => empty'
  archivos         jsonb not null default '{}',  -- {original, normalizado, detalle, procedencia}: rutas en Storage
  meta             jsonb not null default '{}'
);
create index consultas_celda_variable_idx on public.consultas (celda_id, variable_id, consultado);

-- 3.1 Observaciones (E11): motivo, nivel, consulta y valor crudo.
alter table public.observaciones
  add column motivo text check (motivo in ('relleno_del_proveedor', 'fuera_de_rango_valido', 'calidad_no_valida',
                                           'sin_verificar', 'fecha_ausente', 'nodata_del_raster',
                                           'fuera_de_cobertura', 'fallo_de_descarga', 'no_disponible')),
  add column nivel text not null default 'normalizado' check (nivel in ('original', 'normalizado', 'derivado')),
  add column consulta_id bigint references public.consultas(id),
  add column valor_crudo double precision;
-- NOT VALID: las filas ya cargadas tienen valor null sin motivo. La regla vale para las nuevas; se valida
-- (VALIDATE CONSTRAINT) cuando el trabajador rellene el motivo de las antiguas.
alter table public.observaciones
  add constraint observaciones_vacio_con_motivo check (valor is not null or motivo is not null) not valid;
create index observaciones_consulta_idx on public.observaciones (consulta_id);

-- 3.2 Variables (E06).
alter table public.variables
  add column unidad_proveedor text,
  add column unidad_final     text,
  add column relleno          double precision,
  add column rango_min_crudo  double precision,
  add column rango_max_crudo  double precision,
  add column tipo             text check (tipo in ('continua', 'categorica')),
  add column que_dice         text;

-- 3.3 Extracciones: dos estados más.
alter table public.extracciones drop constraint extracciones_estado_check;
alter table public.extracciones add constraint extracciones_estado_check
  check (estado in ('listo', 'listo_con_vacios', 'parcial', 'error', 'sin_datos', 'no_disponible'));

-- 3.4 Parcela ↔ celda (E09, P-03): la regla de cobertura.
alter table public.parcela_celdas
  add column regla   text check (regla in ('centro_dentro', 'toca', 'contiene_centroide')),
  add column pixeles integer;
create index parcela_celdas_celda_idx on public.parcela_celdas (celda_id);

-- 4.1 Códigos de calidad y clases (E12).
create table public.codigos_calidad (
  variable_id  text not null references public.variables(id),
  codigo       integer not null,
  etiqueta     text not null,                    -- p. ej. 0 'bueno', 3 'nubes'; 10 'Grasslands'
  etiqueta_es  text,                             -- texto en pantalla, p. ej. 'Pastizal'
  fuente       text not null,                    -- p. ej. 'MOD13 User Guide', 'MCD12 User Guide (Sulla-Menashe y Friedl, 2018)'
  primary key (variable_id, codigo)
);

-- 4.3 Vueltas de actualización por celda (E17).
create table public.vueltas_actualizacion (
  id          bigint generated always as identity primary key,
  celda_id    bigint not null references public.celdas(id) on delete cascade,
  producto_id text not null references public.productos(id),
  inicio      timestamptz not null default now(),
  fin         timestamptz,
  hasta       date,                              -- último dato traído en esta vuelta
  resultado   text check (resultado in ('listo', 'listo_con_vacios', 'parcial', 'error', 'sin_datos')),
  consulta_id bigint references public.consultas(id)
);

-- 4.4 Sectores (E18), desde backend/catalogo/sectores.json (DT-18, DT-20).
create table public.sectores (
  id          text primary key,                  -- 'S1', 'S2', 'S3'
  nombre      text not null,
  altitud_min numeric,
  altitud_max numeric,
  pisos_inei  jsonb not null default '{}',
  cita        text not null
);
create table public.sector_cultivos (
  sector_id text not null references public.sectores(id),
  cultivo   text not null,
  orden     integer,
  grupo     text check (grupo in ('principal', 'ver_mas')),
  cita      text not null,
  primary key (sector_id, cultivo)
);
-- parcelas.sector sigue siendo texto: el enlace se añade cuando sectores tenga filas.
-- alter table public.parcelas add constraint parcelas_sector_fk foreign key (sector) references public.sectores(id);

-- 4.5 Indicadores (E21).
create table public.indicadores (
  id        text primary key,                    -- p. ej. 'noches_tmin_bajo_0c_por_mes' (catalogo/indicadores.json)
  nombre    text not null,
  metodo    text,                                -- null = sin_regla
  cita      text,
  variables text[] not null default '{}',
  estado    text not null check (estado in ('implementado', 'propuesto', 'candidato', 'sin_regla')),
  meta      jsonb not null default '{}'
);
create table public.indicador_resultados (
  parcela_id   uuid not null references public.parcelas(id) on delete cascade,
  indicador_id text not null references public.indicadores(id),
  desde        date,
  hasta        date,
  valor        jsonb,                            -- serie mensual o por fecha; null = sin dato
  faltantes    jsonb not null default '[]',      -- [{periodo, motivo, n}]
  consultas    bigint[] not null default '{}',   -- consultas.id usadas
  celdas       bigint[] not null default '{}',   -- celdas.id usadas
  calculado    timestamptz not null default now(),
  primary key (parcela_id, indicador_id)
);

-- 4.6 Estrategias (E22).
create table public.estrategias (
  parcela_id      uuid not null references public.parcelas(id) on delete cascade,
  id              text not null,                 -- 'E1', 'E2'…
  cultivo         text not null,
  tipo            text not null check (tipo in ('repetir_actual', 'cambiar_de_familia', 'cultivo_del_catalogo')),
  por_que_aparece text not null,
  calculado       timestamptz not null default now(),
  primary key (parcela_id, id)
);

-- RLS, como el resto del esquema v0.
alter table public.consultas             enable row level security;
alter table public.codigos_calidad       enable row level security;
alter table public.vueltas_actualizacion enable row level security;
alter table public.sectores              enable row level security;
alter table public.sector_cultivos       enable row level security;
alter table public.indicadores           enable row level security;
alter table public.indicador_resultados  enable row level security;
alter table public.estrategias           enable row level security;

-- =============== BLOQUE B · cambia la clave (por confirmar con Erick) ===============
-- SMAP L4 trae 8 valores por día: la clave por fecha no basta (§3.5).
-- Requiere cambiar el «on conflict (celda_id, variable_id, fecha)» de backend/tarpu_datos/repositorio/supabase.py.

alter table public.observaciones add column instante timestamptz;
update public.observaciones set instante = (fecha::timestamp at time zone 'UTC') where instante is null;
alter table public.observaciones alter column instante set not null;
alter table public.observaciones drop constraint observaciones_pkey;
alter table public.observaciones add primary key (celda_id, variable_id, instante);
```

## 7. Lo que no decide este documento
- **Si se aplica, y cuándo:** Erick (DT-23; README de T03, §6).
- **El canal del aviso** (E16): sin decidir (docs/11 §6). Por eso `trabajos.aviso` sigue en jsonb.
- **Las vistas `vista_*` de cada pantalla:** salen del contrato (`contrato-pantallas.md`) cuando Erick lo revise. Aquí no se proponen.
- **Los textos de `codigos_calidad.etiqueta_es`:** Erick.

## 8. Pendientes de verificar

| Id | Qué falta | Cómo |
|---|---|---|
| V-F01 | Que el SQL corre sobre el v0 sin errores | Erick: `npm run db:reset` con la migración en una rama |
| V-F02 | ~~Nombre real de las restricciones del v0~~ | **Cerrada con el archivo:** `20261115000100_esquema_v0.sql` no da nombre a ninguna restricción (no usa `constraint`). El `check` de `extracciones.estado` va en la columna (línea 73) y la clave de `observaciones` es `primary key (celda_id, variable_id, fecha)` (línea 86), así que Postgres usa sus nombres por defecto: `extracciones_estado_check` y `observaciones_pkey`, los mismos de este SQL. Solo queda verlo en la base con `\d` si se quiere, dentro de V-F01 |
| V-F03 | Si la fiabilidad de MOD13Q1 se guarda en `calidad` o como variable aparte | Erick (`supabase.py`) |
| V-F04 | Si `consultas` reemplaza a `extracciones.procedencia` o convive con ella | Erick |
| V-F05 | Volumen de `observaciones` con SMAP L4 horario (5352 valores por lugar y capa en 2025–2026) | Medir tras cargar |
| V-03, V-D11 | CENAGRO completo y sus unidades (para E19) | Modelo lógico y diccionario |
