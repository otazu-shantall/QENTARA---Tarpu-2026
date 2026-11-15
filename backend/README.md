# Backend, conectores y motor

> Área de **Erick**. Aquí está **todo lo del backend en un solo lugar**: código, diseño, módulos, propuesta, diagramas, catálogo citado y contrato. Objetivo del área: **cómo se conecta todo**, es decir, la API que alimenta las pantallas, la orquestación de los conectores del área de datos, el motor que compara cultivos y el agente.

**Estado (14/11/2026):** **construido y probado.** La API funciona en vivo con datos reales de NASA POWER (probado de punta a punta con el servidor). Hay 15 pruebas automáticas y todas pasan. Falta lo que depende de otras áreas: los conectores de MODIS y SoilGrids (Damaris) y conectar las pantallas (Shantall).

## Arrancar en 3 comandos

Desde `backend/`, con Python 3.13:

```bash
py -3.13 -m venv .venv
```

```bash
.venv/Scripts/python -m pip install -r requirements.txt
```

```bash
.venv/Scripts/uvicorn tarpu_api.main:app --reload --port 8000
```

Abre http://127.0.0.1:8000/docs: ahí se prueban todas las rutas desde el navegador. Para las pruebas: `.venv/Scripts/python -m pytest`. Más comandos en [DISENO.md §12](DISENO.md#12-cómo-se-ejecuta).

## Por dónde empezar

| Si quieres… | Abre |
|---|---|
| Entenderlo en un minuto | [diagramas/tarpu-backend-interactivo.html](diagramas/tarpu-backend-interactivo.html) (doble clic; se abre en el navegador) |
| Saber cómo se conecta todo | [DISENO.md](DISENO.md) |
| Saber qué hace cada módulo | [MODULOS.md](MODULOS.md) |
| Preparar la reunión de unión | [PROPUESTA.md](PROPUESTA.md) |
| Llevar los datos de Damaris a TARPU y acelerar su extracción (propuesta) | [PLAN-DATOS-SATELITALES.md](PLAN-DATOS-SATELITALES.md) |
| Analizar Arequipa por sectores (propuesta) | [PLAN-SECTORES-AREQUIPA.md](PLAN-SECTORES-AREQUIPA.md) |
| Ver lo que ve el usuario y en qué rango funciona | [docs/10-recorrido-y-escala.md](../docs/10-recorrido-y-escala.md) (compartido con frontend) |
| Trabajar con un asistente de IA | [AGENTS.md](AGENTS.md) (Claude Code lo lee por [CLAUDE.md](CLAUDE.md)) |

## Qué hay en esta carpeta

```text
backend/
  README.md · AGENTS.md · CLAUDE.md · DISENO.md · MODULOS.md · PROPUESTA.md
  requirements.txt · .env.example · pytest.ini
  tarpu_api/        el código: 4 capas (API → lógica → núcleo → apoyo)
  tests/            15 pruebas; usan una consulta real de POWER guardada, sin red
  diagramas/        interactivo (HTML), mapa y archivos (PDF y PNG), y sus generadores
  catalogo/         ecocrop_2026-11-14.json: rangos de FAO EcoCrop con su URL
  contrato/         esquemas/ (JSON Schema de las entradas y del sobre) · ejemplos/ (Chivay, con POWER real)
  almacen/ · .venv/ se crean en cada computadora; no se suben a git
```

**Lo que vive fuera de esta carpeta, a propósito:**

| Qué | Dónde | Por qué ahí |
|---|---|---|
| Decisiones DT-13 a DT-17 | [docs/06](../docs/06-decisiones-y-riesgos.md) | Todas las decisiones del equipo se registran en un solo archivo |
| Recorrido del usuario y escala | [docs/10](../docs/10-recorrido-y-escala.md) | Lo comparten backend y frontend |
| Conectores a las fuentes | [datos/](../datos/README.md) | Son del área de Damaris; el backend solo los invoca |
| Pantallas | [Codigo/](../Codigo/README.md) | Área de Shantall |

## Cómo funciona, en pocas líneas

1. El usuario **dibuja su parcela**; `geometria` la valida y mide su área real y cuántos píxeles de MODIS (250 m) caben.
2. El usuario **declara** su cultivo, su agua, sus meses y sus prioridades; se rotula «declarado por ti».
3. `procesamiento` pide en segundo plano los datos del **centroide** de la parcela a los conectores del área de datos. `ingesta` e `indicadores` los convierten en conteos, promedios y totales con su procedencia.
4. El **motor** compara cada cultivo del catálogo con rangos **citados** de FAO EcoCrop, criterio por criterio, sin puntaje ni pesos.
5. El **agente** responde preguntas con esos datos y sus citas, sin modelo de IA.
6. Todo sale por una **API FastAPI**; `exportar` copia las rutas GET a JSON para la web publicada.

En la demo **no hay base de datos**: `almacen.py` guarda JSON en disco y es el único que lo toca, para que pasar después a PostGIS cambie un solo archivo.

## Fuentes de datos (DT-17)

| Fuente | Escala | Estado |
|---|---|---|
| NASA POWER | Celda ≈ 55 × 67 km | ✅ conectada y probada en vivo |
| NDVI de MODIS (ORNL) | Píxel nominal de 250 m | ⏳ falta el conector en `datos/`; mientras tanto aparece «no disponible» con su motivo |
| SoilGrids | 250 m | ⏳ falta el conector en `datos/`; el criterio de suelo sale `sin_dato` |

## Decisiones

| ID | Decisión |
|---|---|
| DT-13 | FastAPI para trabajar en vivo y exportación a JSON para la web publicada; sin base de datos en la demo |
| DT-14 | Agente guiado con plantillas y datos reales, sin modelo de IA |
| DT-15 | Publicación en Vercel o Netlify |
| **DT-16** | **Cero supuestos:** todo valor viene de una fuente real o lo declara el usuario; ninguna regla sin cita; nada sintético en la demo |
| **DT-17** | **Solo tres fuentes:** NASA POWER, NDVI de MODIS y SoilGrids, consultadas en el centroide |

## Lo que el desafío espera y cómo se responde

El [desafío](../docs/08-desafio-oficial.md) sugiere comparar al menos tres estrategias de rotación, incluida la actual, con el porqué, la evidencia, los beneficios, los vacíos y los riesgos.

| Lo que pide | Cómo lo responde TARPU |
|---|---|
| Al menos tres estrategias, incluida la actual | El cultivo actual y todos los del catálogo de otra familia (con papa, 4) |
| Por qué aparece cada una | Dato: cambia o no de familia respecto del cultivo actual |
| Evidencia | Cada criterio comparado con un rango citado de EcoCrop, usando datos reales |
| Beneficios | Solo con cita. Sin ella: «sin beneficio citado» |
| Vacíos de información | Datos o reglas que faltan, listados |
| Riesgos | Hechos medidos (por ejemplo, noches bajo la temperatura letal citada) y conflictos entre fuentes |

## Reglas

- **Sin puntaje y sin pesos:** no hay una fuente que los respalde (DT-16).
- La consulta de datos detallados **no ejecuta** el motor.
- El agente no inventa observaciones ni cambia las reglas.
- **Sin claves** en el repositorio ni en el frontend.
- La misma API servirá después a las apps de Android e iOS.
- Declarar el uso de IA en los archivos y en [entrega/uso-de-ia.md](../entrega/uso-de-ia.md).
