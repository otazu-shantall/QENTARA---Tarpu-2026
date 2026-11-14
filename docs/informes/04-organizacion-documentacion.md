# 04 · Organización de la documentación

> 14 de noviembre de 2026. Hecho con Claude Code. Decisión: DT-07.

## Qué pidió el usuario

Organizar la documentación como en su proyecto Pulse, para poder organizarnos. Sin plan de entregas ni tiempos: solo los documentos de información y organización, y lo que se tiene que entregar.

## Qué quedó hecho

| Pieza | Contenido |
|---|---|
| `README.md` (raíz) | Qué es TARPU, estado, estructura de carpetas y cómo abrir la demo |
| `CLAUDE.md` (raíz) | Importa `AGENTS.md`, para que Claude Code y Codex lean las mismas reglas |
| `AGENTS.md` | Se acortó: conserva reglas y decisiones; el estado y el historial del código pasaron a `docs/` |
| `docs/README.md` | Índice, orden de lectura y reglas para mantener la documentación |
| `docs/00` a `06` | Estado actual, visión y alcance, arquitectura, datos y fuentes, módulos, **entregables** (sin plazos) y decisiones y riesgos |
| `docs/desarrollo.md` | Cómo levantar y probar el código |
| `docs/diseno/` | Las cinco referencias, el sistema visual, el movimiento y capturas del diseño actual |
| `docs/informes/` | Los informes 01 a 04, reconstruidos, y la bitácora `en-curso.md` |
| `docs/historial/` | Índice del material antiguo que se conserva |

## Qué cambia respecto de Pulse

- **Sin plan de entregas, hitos ni horas.** `05-entregables.md` dice qué hay que entregar y su estado, sin plazos.
- **Los códigos DEC y SUP del informe maestro se conservan.** Las decisiones del prototipo usan DT-xx para no confundirse con ellos.
- **El informe maestro sigue siendo el documento formal**, y `docs/` lo resume.
- **No se movió ningún archivo existente.** `Documentación/` y el Contexto Integral siguen donde estaban, para no romper `tmp/documentacion/generar.py`.

## Lo que falta

- Que el informe maestro recoja el prototipo y las decisiones DT-01 a DT-07, actualizando juntos el `.md`, el `.tex` y el `.pdf`.
- Decidir si algún día `Documentación/` pasa a `docs/`, ajustando las rutas del generador.
