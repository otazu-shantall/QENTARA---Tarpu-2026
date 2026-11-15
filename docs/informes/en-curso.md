# Bitácora del trabajo en curso

> **Para retomar** (por ejemplo, si se corta la sesión o se acaba la ventana de uso): leer esta página completa y seguir desde **«Siguiente paso exacto»**.
> Se actualiza al terminar cada paso, al encontrar un error y antes de cada proceso largo. Al cerrar el trabajo, su contenido pasa a un informe nuevo y esta página se vacía para el siguiente.

**Trabajo:** Hackathon · **fase 1 del [ROADMAP](../../ROADMAP.md)**: cada área planifica su parte y llena su [plantilla de propuesta](../areas/).
**Último trabajo cerrado:** 06 · Análisis del repositorio y base para continuar (14/11/2026) → [06-analisis-repositorio.md](06-analisis-repositorio.md). Revisión sin cambios de código ni de fase organizativa; contiene comprobaciones y pendientes técnicos.

## Siguiente paso exacto

Cada área llena su propuesta: [datos](../areas/propuesta-datos.md), [frontend](../areas/propuesta-frontend.md), [backend](../../backend/PROPUESTA.md) y [entrega](../areas/propuesta-entrega.md). A las 2 horas de empezar, **reunión de unión** (fase 2 del ROADMAP). Sus decisiones van a [06](../06-decisiones-y-riesgos.md) y la nueva división a esta bitácora.

**Datos (Damaris):**
- La propuesta ya tiene la tabla de variables (sección 7) y «qué dicen y qué no dicen» (sección 4).
- Pendiente:
  - ~~la muestra de POWER en el punto de riego de Majes~~: hecha, `power_majes_riego_20250101_20251231.*`. Comprobado el 14/11/2026 frente al punto urbano: la radiación es idéntica los 365 días (misma celda de 1° × 1°), pero la temperatura, la humedad y la lluvia difieren (otra celda de ½° × ⅝°). Por ejemplo, la media del 01/01/2025 es de 20,08 °C en el punto urbano y de 16,50 °C en el de riego. Para Majes se usa la muestra del punto de riego;
  - comprobar el punto de Chivay en vista satélite;
  - las secciones 1, 2, 5 y 6 de la propuesta.

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
