# Formulario de envío (borrador)

> Los campos son los de la [guía oficial](https://www.spaceappschallenge.org/resources/project-submission-guide/). **El texto que se pega en el sitio va en inglés.** Los borradores describen lo que existe hoy (14/11/2026). Hay que actualizarlos con lo que de verdad quede hecho, y quitar todo lo marcado con `[…]`.

## Project Name

```
TARPU
```

Lema posible: `Data to harvest a better tomorrow` *(el lema en español no está aprobado por el equipo, SUP-013)*.

## High-Level Project Summary

Responde a: qué desarrollaron, cómo aborda el desafío y por qué importa.

```
TARPU is a decision-support tool that helps farmers in Arequipa, Peru understand
their fields and explore crop-rotation options. It combines NASA Earth observations
(NASA POWER agroclimatology data [add other datasets actually used]) with the
farmer's own field history and priorities, and explains every indicator in plain
language: what the data says, where it comes from, and what it does not allow us
to conclude. [Describe what the final demo actually does: e.g. compares three
rotation strategies, including the current one, with reasons, evidence, gaps and
risks.] TARPU supports, and never replaces, the farmer's judgment and local
agricultural expertise.
```

## Link to Project Demo

Video de 30 s o menos, o hasta 7 diapositivas. Enlace público, sin registro.

```
[URL]
```

## Link to Final Project

Repositorio o sitio público.

```
[URL]
```

## Detailed Project Description

Preguntas de la guía: qué hace exactamente, cómo funciona, qué beneficios tiene, qué esperan lograr, qué herramientas y lenguajes usaron.

```
WHAT IT DOES
[Describe only what works in the submitted version.]

HOW IT WORKS
- Data: a script queries the NASA POWER Daily API for a point in Arequipa and stores
  the provider's original response, a normalized table and a provenance record
  (request URL, date, units, missing values).
- Web app: React + TypeScript + Vite, with a Leaflet map.
- [Backend / rule engine / assistant: describe what was built.]

BENEFITS
- Farmers can see the evidence behind each option and its limits.
- When information is missing, TARPU says so instead of inventing a result.
- [Add benefits supported by evidence. Do not claim water savings or yield gains.]

WHAT WE HOPE TO ACHIEVE
[Next steps: pilot with farmers, agronomic review of rules, Android and iOS apps.]

LIMITATIONS
- Parcels and some indicators in the prototype are synthetic and are labelled as such.
- Regional gridded data is context, not an in-field measurement.

TOOLS
React, TypeScript, Vite, Leaflet, Python [add the rest].
```

## Use of Super Intelligence (SI)

Los jueces no ven este campo, pero es obligatorio declarar el uso. Sale de [uso-de-ia.md](uso-de-ia.md).

```
Yes. We used AI coding assistants (OpenAI Codex and Anthropic Claude Code) to help
write and refactor the web prototype, the NASA POWER data script and the project
documentation. [Add any other tool and use.] The idea, the scope and the scientific
limits of the project were defined by the team. AI-assisted code is acknowledged in
the repository README and in file headers. [State whether any image, video or audio
was AI-generated and how it is watermarked or acknowledged.]
```

## NASA Data

Detalle específico de los datos y recursos de NASA usados. Imprescindible para optar a premio global.

```
- NASA POWER (Prediction Of Worldwide Energy Resources), Daily Point API, community AG,
  API v2.10.3. Parameters: T2M, T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M, ALLSKY_SFC_SW_DWN.
  Point: Majes, Arequipa (-16.351, -72.190), 2025-01-01 to 2025-12-31.
  https://power.larc.nasa.gov/
- [Add every other NASA dataset actually used, with product name, version and link.]
```

## Space Agency Partner Data and Other References

Todos los datos, recursos y herramientas, aunque sean libres. Sale de [referencias.md](referencias.md).

```
[Paste the list from referencias.md]
```

## Antes de enviar

- [ ] Todo en inglés y sin corchetes pendientes.
- [ ] Los dos enlaces abren en una ventana privada, sin iniciar sesión.
- [ ] La demo cumple el límite (30 s o 7 diapositivas).
- [ ] Nada de lo que se afirma contradice [«Qué no se puede decir»](README.md#qué-no-se-puede-decir).
- [ ] Casillas marcadas y **Submit for Judging** pulsado antes del cierre.
