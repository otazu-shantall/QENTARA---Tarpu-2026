# Bitácora del trabajo en curso

> **Para retomar** (por ejemplo, si se corta la sesión o se acaba la ventana de uso): leer esta página completa y seguir desde **«Siguiente paso exacto»**.
> Se actualiza al terminar cada paso, al encontrar un error y antes de cada proceso largo. Al cerrar el trabajo, su contenido pasa a un informe nuevo y esta página se vacía para el siguiente.

**Trabajo:** Hackathon · **fase 1 del [ROADMAP](../../ROADMAP.md)**: cada área planifica su parte y llena su [plantilla de propuesta](../areas/).
**Último trabajo cerrado:** 23 · Correcciones de datos, tutorial y asistente dentro del chat (15/11/2026) → [23-correcciones-chat-voz-publicacion.md](23-correcciones-chat-voz-publicacion.md). Build, 14 pruebas de frontend, 37 de backend y dos recorridos Chrome aprobados. Conexión local de ChatGPT preparada; cuenta real y despliegue remoto sin verificar. El producto está en `plataforma/` (DT-27). Las notas organizativas de abajo se conservan como antecedente; no describen por sí solas el estado técnico actual.

## Pendiente de la demo (no olvidar)

### Frontend vigente · 15/11/2026

`frontend/` incorpora el trabajo de escritorio de Shantall; `Codigo/` se retira con respaldo e historial Git. El backend, datos, Supabase y T03 mantienen sus archivos remotos. Documentación conciliada, build, once pruebas y recorrido Chrome correctos. Integración preparada en `codex/integrar-frontend`, sobre el estado remoto `e08ea68`. Registro: [informe 16](16-integracion-repositorio-frontend.md).

Datos completos de los lugares de ejemplo (capa 3 de DT-22), para que el jurado pruebe TARPU. Se dejaron para después el 15/11/2026 (Erick):

- [ ] **Majes riego:** NASA POWER y horas de luz 2015–2025 con T01 (Damaris). Comando en [trabajo/README.md](../../trabajo/README.md).
- [ ] **AppEEARS** (NASADEM, HLS, SMAP e imágenes de Chivay) con `trabajo/extraccion_pesada/pesados.py`, y subir `salida/` y `tareas.json`.
- [ ] **S2, Cabanaconde** (opcional): T01 completo.
- [ ] Incertidumbre de SoilGrids: verificar su factor en la documentación de ISRIC (T01 §9.4).

## Siguiente paso exacto

Cada área llena su propuesta: [datos](../areas/propuesta-datos.md), [frontend](../areas/propuesta-frontend.md), [backend](../../plataforma/backend/PROPUESTA.md) y [entrega](../areas/propuesta-entrega.md). A las 2 horas de empezar, **reunión de unión** (fase 2 del ROADMAP). Sus decisiones van a [06](../06-decisiones-y-riesgos.md) y la nueva división a esta bitácora.

**Datos (Damaris):**
- La propuesta ya tiene la tabla de variables (sección 7) y «qué dicen y qué no dicen» (sección 4).
- Pendiente:
  - ~~la muestra de POWER en el punto de riego de Majes~~: hecha, `power_majes_riego_20250101_20251231.*`. Comprobado el 14/11/2026 frente al punto urbano: la radiación es idéntica los 365 días (misma celda de 1° × 1°), pero la temperatura, la humedad y la lluvia difieren (otra celda de ½° × ⅝°). Por ejemplo, la media del 01/01/2025 es de 20,08 °C en el punto urbano y de 16,50 °C en el de riego. Para Majes se usa la muestra del punto de riego;
  - comprobar el punto de Chivay en vista satélite;
  - las secciones 1, 2, 5 y 6 de la propuesta.
  - **T01, paquete de extracción** (`trabajo/T01-paquete-extraccion/tarpu_datos/`): POWER, SoilGrids (WCS), GAEZ, luz y ORNL escritos y probados a pequeña escala en Chivay. Falta la cola completa de ORNL (MOD13Q1, MCD12Q1, MOD16A2GF y MOD11A2), que se lanza aparte, y cerrar la tabla de la §6 con `python -m tarpu_datos.pruebas`. Notas técnicas en la §9 de su README.
  - **T03, modelado de datos** (`trabajo/T03-modelado-datos/`): **5 de 5 entregables en borrador** (15/11/2026), revisados con los commits de Erick hasta `d78a70b` (DT-23, Supabase, frontend nuevo): `modelo-logico.md`, `agregaciones.md`, `diccionario-variables.md`, `contrato-pantallas.md` (sobre el frontend real) y `modelo-fisico.md` (delta SQL sobre el esquema v0, no aplicado). Pendiente de revisión de Erick y Shantall.

## Pasos

| # | Paso | Estado |
|---|---|---|
| 1 | Fase 1: propuestas de cada área | ⏳ Backend: propuesta completa y DT-13 a DT-15 tomadas (Erick). Faltan datos, frontend y entrega |
| 2 | Fase 2: reunión de unión y decisiones | |
| 3 | Fase 3: nueva división y construcción | |
| 4 | Envío oficial | |

## Qué pasó (para el informe)

- **Datos, 14/11/2026:** scripts, muestras y fichas de las tres fuentes del núcleo sin cuenta, todas con original, normalizado y procedencia en `datos/muestras/`:
  - NASA POWER, 2025, para Majes y Chivay;
  - ISRIC SoilGrids, a 0–5 y 5–15 cm;
  - NDVI MOD13Q1, de 2015 a 2026, por el servicio de ORNL.
- **Datos:** `datos/obtener_muestras.py` lanza las tres consultas. El script de NDVI guarda caché y retoma tras un corte, porque una descarga se perdió por un HTTP 503. La caché queda fuera de git (`.gitignore`).
- **Datos, cambio de punto:** el punto de Majes se cambió al de riego (−16,367023; −72,185771), elegido en vista satélite. El anterior (−16,351; −72,190) caía en el casco urbano y daba un NDVI bajo (mediana de 0,117). Sus muestras se conservan como referencia.
- **Datos, hallazgos por revisar:**
  - las heladas de POWER en Chivay pueden estar exageradas, porque la celda está a 4 352 m y el pueblo a unos 3 600 m;
  - la marca «nubes» de MOD13Q1 en el punto urbano no está contrastada;
  - la media del NDVI de 2026 en Majes riego (0,571) es mayor que la de otros años y no tiene explicación;
  - la lluvia de POWER en Majes (169,6 mm en 2025) está por contrastar.
- **Datos, 15/11/2026, T01:** el WCS de SoilGrids entrega GeoTIFF con Deflate (se lee con `zlib`, sin dependencias). Con una ventana de ±0,001° devuelve 1 píxel centrado en el punto: 32 de 32 valores iguales a la REST guardada. La `uncertainty` de SoilGrids queda pendiente de verificar su factor. El servicio de ORNL respondió 503 y 502 en `/bands`, y los reintentos lo resolvieron.
