# 04 · Organización de la documentación

> 14 de noviembre de 2026. Decisión: DT-07.

## Alcance del trabajo

Documentación organizada por estado, información del producto, entregables, decisiones e informes, sin calendarios estimados de desarrollo.

## Qué quedó hecho

| Pieza | Contenido |
|---|---|
| `README.md` (raíz) | Qué es TARPU, estado, estructura de carpetas y cómo abrir la demo |
| `CLAUDE.md` (raíz) | Importa `AGENTS.md` como fuente común de reglas |
| `AGENTS.md` | Se acortó: conserva reglas y decisiones; el estado y el historial del código pasaron a `docs/` |
| `docs/README.md` | Índice, orden de lectura y reglas para mantener la documentación |
| `docs/00` a `06` | Estado actual, visión y alcance, arquitectura, datos y fuentes, módulos, **entregables** (sin plazos) y decisiones y riesgos |
| `docs/desarrollo.md` | Cómo levantar y probar el código |
| `docs/diseno/` | Las cinco referencias, el sistema visual, el movimiento y capturas del diseño actual |
| `docs/informes/` | Los informes 01 a 04, reconstruidos, y la bitácora `en-curso.md` |
| `docs/historial/` | Índice del material antiguo que se conserva |

## Criterios de organización

- **Sin plan de entregas, hitos ni horas.** `05-entregables.md` dice qué hay que entregar y su estado, sin plazos.
- **Los códigos DEC y SUP del informe maestro se conservan.** Las decisiones del prototipo usan DT-xx para no confundirse con ellos.
- **El informe maestro sigue siendo el documento formal**, y `docs/` lo resume.
- **No se movió ningún archivo existente.** `Documentación/` y el Contexto Integral siguen donde estaban, para no romper `tmp/documentacion/generar.py`.

## Lo que falta

- Que el informe maestro recoja el prototipo y las decisiones DT-01 a DT-07, actualizando juntos el `.md`, el `.tex` y el `.pdf`.
- Decidir si algún día `Documentación/` pasa a `docs/`, ajustando las rutas del generador.
