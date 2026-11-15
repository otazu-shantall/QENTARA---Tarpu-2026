# 01 · Dashboard inicial

> 24 de octubre de 2026. Primer frontend visual de TARPU. Reconstruido a partir de lo registrado en `AGENTS.md` y `Codigo/README.md`.

## Alcance del trabajo

Prototipo del dashboard en `Codigo/`, con el logo y la referencia visual del proyecto (`Logo Tarpu.png`, `Tarpu_ Branding.png`).

## Qué quedó hecho

- Proyecto React + TypeScript + Vite con siete vistas: Vista general, Mis parcelas, Monitor satelital, Clima e históricos, Rotaciones, Explorar datos y Mis informes.
- Datos sintéticos concentrados en `src/data/demo.ts`: tres parcelas, indicadores y 90 días de registros por parcela, todos rotulados como sintéticos.
- Agente con respuestas guiadas locales, que distinguen vegetación de fertilidad y no recetan riego.
- Consulta de registros con filtros y descarga CSV/JSON de **toda** la selección filtrada, conservando faltantes.
- Fichas e informes guardados solo en el navegador. El informe se puede imprimir como PDF.
- La paleta del branding (#1F4D2E, #5E7F4A, #A4C183, #F4B23E, #F7F2E6) y la fuente Plus Jakarta Sans.
- Copias del logo y del branding en `public/brand/`, con los originales conservados.

## Qué quedó comprobado

- TypeScript y compilación de producción.
- 8 pruebas de lógica.

La revisión visual quedó interrumpida porque no se pudo verificar la URL.

## Lo que quedó pendiente

- Revisión visual en un navegador.
- El mapa era un dibujo SVG con campos inventados (se sustituyó el 27/10).
