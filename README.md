# TARPU · QENTARA

**TARPU** es una plataforma de apoyo a decisiones agrícolas: ayuda a los agricultores a comprender sus parcelas y comparar alternativas de cultivo y rotación con datos ambientales, información satelital e historial agrícola. **QENTARA** es el equipo que la desarrolla. Responde al desafío **Field Shift: Adapting Farms with NASA Data** de NASA Space Apps Challenge 2026.

> Estado al 15/11/2026: **planificación y definición de producto**, con el **prototipo interactivo de escritorio** en `frontend/` (DT-25). `Codigo/` fue retirado y se conserva en el historial Git. El nuevo frontend muestra una muestra histórica real de NASA POWER para Majes; el acceso y el asistente son de demostración. Desde DT-26 y DT-27 el frontend lee datos reales de la API y todo el producto está en `plataforma/` (`npm start`). Modelo de IA y autenticación siguen pendientes. Detalle en [docs/00-estado-actual.md](docs/00-estado-actual.md).

## Estructura

```
QENTARA - Tarpu 2026/
├── docs/                    Documentación de trabajo: estado, visión, arquitectura, datos,
│   │                        módulos, entregables, decisiones, diseño e informes.
│   ├── diseno/              Referencias visuales, sistema visual y capturas.
│   ├── informes/            Un informe por trabajo terminado y la bitácora en curso.
│   └── historial/           Índice del material antiguo (solo lectura).
├── plataforma/              TARPU COMPLETO (DT-27): lo que se prueba y se despliega. `npm start` lo enciende todo.
│   ├── frontend/            FRONTEND (Shantall): portada, panel, mapa, historial, estudio y asistente.
│   ├── backend/             BACKEND, CONECTORES Y MOTOR (Erick): API, extracción, catálogos e investigación de cultivos.
│   ├── supabase/            Base de datos: migraciones y catálogo.
│   ├── infra/               Docker Compose: API, trabajador y actualizador.
│   ├── datos/               DATOS SATELITALES (Damaris): fichas de fuentes y muestras.
│   ├── documentacion/       Informe maestro (.md, .tex, .pdf) y modelo de datos (T03).
│   └── scripts/             iniciar.mjs y detener.mjs.
├── entrega/                 ENTREGA, PITCH E INVESTIGACIÓN (Derecho). Formulario, guion, referencias, uso de IA.
├── trabajo/                 TAREAS EN CURSO: T01 (paquete de extracción) y extraccion_pesada/ (datos de AppEEARS).
├── tmp/                     Auxiliares de sesiones anteriores (generador del PDF, capturas). No es software de TARPU.
├── TARPU_QENTARA_Contexto_Integral.md   Antecedente histórico completo.
├── Logo Tarpu.png, Tarpu_ Branding.png  Branding original aportado por el equipo.
├── ROADMAP.md               Qué le toca a cada uno y fases del hackathon.
├── AGENTS.md                Reglas de trabajo del repositorio.
└── CLAUDE.md                Punto de entrada que importa AGENTS.md.
```

## Por dónde empezar

1. **[ROADMAP.md](ROADMAP.md)**: qué le toca a cada uno y cómo nos organizamos en el hackathon.
2. [docs/README.md](docs/README.md): índice de toda la documentación.

## Abrir lo que ya funciona

| Qué | Cómo |
|---|---|
| Todo TARPU (web, API, Supabase) | En `plataforma/`: `npm install` y `npm start`. Abre http://127.0.0.1:5174/. Ver [plataforma/README.md](plataforma/README.md). |
| Consulta real a NASA POWER | `python plataforma/datos/power/consulta_power.py --lat -16.351 --lon -72.190 --inicio 20250101 --fin 20251231 --nombre majes` |
| Informe maestro | [plataforma/documentacion/informe-maestro/TARPU_Documentacion_Maestra.pdf](plataforma/documentacion/informe-maestro/TARPU_Documentacion_Maestra.pdf) |
