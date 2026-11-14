# Backend, conectores y motor

> Área de **Erick**. Objetivo: decidir y construir **cómo se conecta todo**: los conectores a las fuentes, la API que alimenta las pantallas, el motor de TARPU y el agente. Contexto: [docs/02-arquitectura.md](../docs/02-arquitectura.md) y [docs/03-datos-y-fuentes.md](../docs/03-datos-y-fuentes.md).

**Estado:** esta carpeta solo tiene esta guía. No hay código de backend todavía, y el stack **no está decidido** (SUP-015).

## Decisiones que tomar primero

| Decisión | Opciones | Qué considerar |
|---|---|---|
| Lenguaje y framework | Python + FastAPI (propuesta del informe) · Node | El script de datos ya está en Python; las bibliotecas geoespaciales también |
| ¿Base de datos para la demo? | Ninguna (archivos y caché) · SQLite · PostgreSQL/PostGIS | Lo más simple que permita el recorrido |
| ¿Dónde se aloja? | Solo local · un servicio gratuito | El enlace al proyecto final debe ser público |
| Proveedor del agente | Por decidir (SUP-034) | La clave **nunca** va en el frontend. La IA debe declararse en la entrega |
| ¿Cómo llegan los datos? | En vivo en cada petición · guardados de antemano | POWER responde rápido; guardar evita depender de la red durante la demo |

Cuando se decida, se registra en [docs/06-decisiones-y-riesgos.md](../docs/06-decisiones-y-riesgos.md).

## Piezas del área

| Pieza | Qué hace | Punto de partida |
|---|---|---|
| **Conectores** | Piden el dato a cada fuente y lo dejan normalizado, con su procedencia | `datos/power/consulta_power.py` ya lo hace para POWER |
| **API** | Entrega a las pantallas los datos con la forma acordada | El contrato de abajo |
| **Motor de TARPU** | Compara estrategias de rotación con reglas explícitas y se abstiene si falta evidencia | [docs/03](../docs/03-datos-y-fuentes.md#motor-de-reglas-propuesto) |
| **Agente** | Responde preguntas apoyándose solo en la evidencia disponible | Hoy son respuestas fijas en `Codigo/src/lib/domain.ts` |

## Contrato con el frontend (borrador para discutir)

El frontend ya usa estos tipos (`Codigo/src/types/index.ts`). Conviene partir de ellos y ampliarlos juntos en la etapa 2.

```ts
interface Parcel {
  id: string; name: string; location: string; crop: string; area: number
  ndvi: number; temperature: number; moisture: number; precipitation: number
}

interface Observation {
  id: string
  date: string                  // AAAA-MM-DD
  parcelId: string
  variable: 'ndvi' | 'temperature' | 'precipitation' | 'moisture'
  value: number | null          // null = faltante, nunca 0
  unit: string
  reference: string             // fuente
  level: 'Normalizado' | 'Derivado'
}
```

Rutas propuestas, tomadas del informe maestro y sin implementar:

| Ruta | Devuelve |
|---|---|
| `GET /parcelas` | Lista de parcelas |
| `GET /parcelas/{id}/clima?inicio=&fin=` | Serie climática con fuente, unidad, período y faltantes |
| `GET /parcelas/{id}/datos` | Registros detallados y metadatos, **sin** evaluación del motor |
| `POST /parcelas/{id}/comparar` | Estrategias de rotación con motivos, evidencia, vacíos y riesgos |
| `POST /agente` | Respuesta a una pregunta, con la evidencia en que se apoya |

**Lo que toda respuesta con datos debe traer:** fuente, producto, fecha de observación, unidad, escala espacial y faltantes. Sin eso, la pantalla no puede mostrar la procedencia.

## Lo que el desafío espera del motor

Del [desafío oficial](../docs/08-desafio-oficial.md): comparar **al menos tres estrategias de rotación, incluida la actual**. Para cada una:

- por qué se sugiere;
- qué evidencia la respalda;
- qué beneficios puede ofrecer;
- **dónde hay vacíos de información**;
- qué riesgos necesitan revisión local.

Encaja con lo ya definido para TARPU: reglas visibles, puntaje sin calcular si falta un criterio y resultado «no evaluable» cuando no hay evidencia.

## Reglas

- La consulta de datos detallados **no ejecuta** el motor.
- El agente no inventa observaciones ni cambia las reglas.
- Un puntaje es un orden relativo, no una probabilidad.
- Sin claves en el repositorio.
- Pensar en que la misma API servirá después a las apps de Android e iOS.
- Declarar el uso de IA en los archivos y en [entrega/uso-de-ia.md](../entrega/uso-de-ia.md).
