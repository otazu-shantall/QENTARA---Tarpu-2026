# TARPU · QENTARA

**TARPU** es una plataforma de apoyo a decisiones agrícolas: ayuda a los agricultores a comprender sus parcelas y comparar alternativas de cultivo y rotación con datos ambientales, información satelital e historial agrícola. **QENTARA** es el equipo que la desarrolla. Responde al desafío **Field Shift: Adapting Farms with NASA Data** de NASA Space Apps Challenge 2026.

> Estado al 14/11/2026: **planificación y definición de producto**, con un **prototipo visual** (landing y dashboard de siete vistas). El mapa base es real; las parcelas, los indicadores y el agente son de demostración. Detalle en [docs/00-estado-actual.md](docs/00-estado-actual.md).

## Estructura

```
QENTARA - Tarpu 2026/
├── docs/                    Documentación de trabajo: estado, visión, arquitectura, datos,
│   │                        módulos, entregables, decisiones, diseño e informes.
│   ├── diseno/              Referencias visuales, sistema visual y capturas.
│   ├── informes/            Un informe por trabajo terminado y la bitácora en curso.
│   └── historial/           Índice del material antiguo (solo lectura).
├── Documentación/           Informe maestro formal (.md, .tex y .pdf, versión 0.4).
├── Codigo/                  FRONTEND (Shantall). Prototipo visual de guía: React + TypeScript + Vite + Leaflet.
├── datos/                   DATOS SATELITALES (Damaris). Consulta real a NASA POWER y fichas de fuentes.
├── backend/                 BACKEND, CONECTORES Y MOTOR (Erick). Todo el diseño del área reunido; índice en backend/README.md.
├── entrega/                 ENTREGA, PITCH E INVESTIGACIÓN (Derecho). Formulario, guion, referencias, uso de IA.
├── trabajo/                 TAREAS EN CURSO, una carpeta por tarea (T01: paquete de extracción de datos).
├── tmp/                     Auxiliares de sesiones anteriores (generador del PDF, capturas). No es software de TARPU.
├── TARPU_QENTARA_Contexto_Integral.md   Antecedente histórico completo.
├── Logo Tarpu.png, Tarpu_ Branding.png  Branding original aportado por el equipo.
├── ROADMAP.md               Qué le toca a cada uno y fases del hackathon.
├── AGENTS.md                Reglas para asistentes de IA (Codex).
└── CLAUDE.md                Lo mismo para Claude Code (importa AGENTS.md).
```

## Por dónde empezar

1. **[ROADMAP.md](ROADMAP.md)**: qué le toca a cada uno y cómo nos organizamos en el hackathon.
2. [docs/README.md](docs/README.md): índice de toda la documentación.

## Abrir lo que ya funciona

| Qué | Cómo |
|---|---|
| Prototipo (landing y dashboard) | `npm --prefix Codigo run dev` y abrir http://127.0.0.1:5173/. Ver [docs/desarrollo.md](docs/desarrollo.md). |
| Consulta real a NASA POWER | `python datos/power/consulta_power.py --lat -16.351 --lon -72.190 --inicio 20250101 --fin 20251231 --nombre majes` |
| Informe maestro | [Documentación/TARPU_Documentacion_Maestra.pdf](Documentación/TARPU_Documentacion_Maestra.pdf) |
