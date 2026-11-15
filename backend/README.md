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
| Extracción y actualización de datos | [tarpu_datos/README.md](tarpu_datos/README.md) | Carpeta oficial: fuentes, base de Arequipa (extraer y leer), trabajos por coordenada y actualización periódica (DT-22) |
| **Pantalla de prueba de la integración** | [prueba_web/index.html](prueba_web/index.html) | Mapa de Arequipa con los 3 sectores, datos base de cualquier punto en crudo y botón de datos pesados. Se abre con la API encendida en http://127.0.0.1:8000/ |
| Plataformas y extracción por coordenada | [PLAN-PLATAFORMAS-Y-COORDENADA.md](PLAN-PLATAFORMAS-Y-COORDENADA.md) | Dónde se sube la base (propuesta: Google Cloud) y la lógica de la capa 2 |
| Decisiones DT-13 a DT-22 | [docs/06](../docs/06-decisiones-y-riesgos.md) | Todas las decisiones del equipo se registran en un solo archivo |
| Recorrido del usuario y escala | [docs/10](../docs/10-recorrido-y-escala.md) | Lo comparten backend y frontend |
| Conectores a las fuentes | [datos/](../datos/README.md) | Son del área de Damaris; el backend solo los invoca |
| Pantallas | [Codigo/](../Codigo/README.md) | Área de Shantall |

## Cómo funciona, en pocas líneas

1. El usuario **dibuja su parcela**; `geometria` la valida y mide su área real y cuántos píxeles de MODIS (250 m) caben.
2. El usuario **declara** su cultivo, su agua, sus meses y sus prioridades; se rotula «declarado por ti».
3. `procesamiento` pide en segundo plano los datos del **centroide** de la parcela a los conectores del área de datos. `ingesta` e `indicadores` los convierten en conteos, promedios y totales con su procedencia.
4. El **motor** compara cada cultivo del catálogo con rangos **citados** de FAO EcoCrop, criterio por criterio, sin puntaje ni pesos.
5. El **agente** responde preguntas con esos datos y sus citas, sin modelo de IA.
6. Todo sale por la **API interna FastAPI** (DT-22): lee la base de Arequipa al instante y lanza un trabajo por coordenada para las series de satélite. `exportar` copia las rutas GET a JSON como respaldo de los lugares de ejemplo.

En la demo **no hay base de datos**: `almacen.py` guarda JSON en disco y es el único que lo toca, para que pasar después a PostGIS cambie un solo archivo.

## Fuentes de datos (DT-19, reemplaza DT-17)

| Fuente | Escala | Estado |
|---|---|---|
| NASA POWER (19 variables) | Celda ≈ 55 × 67 km | ✅ conectada y probada en vivo (hoy con las variables de DT-17; ampliar en T01) |
| SoilGrids (WCS), FAO GAEZ, MODIS de ORNL (NDVI, ET, LST, cobertura) | 250 m a 9 km | ⏳ paquete de extracción, tarea T01 (Damaris), en `trabajo/T01-paquete-extraccion/` |
| NASADEM, HLS, SMAP (AppEEARS) | 30 m a 9 km | ⏳ se bajan una vez para los tres lugares de ejemplo con `trabajo/extraccion_pesada/pesados.py` |
| IV CENAGRO 2012 (INEI) | Unidad agropecuaria | ✅ en `investigacion/`; da los cultivos por sector (`catalogo/sectores.json`, DT-20) |

Métodos con cita (Kc de FAO-56, factor LS de USLE con su rango válido, factor K de EPIC, horas de luz, rotación de SENASA, textura sin regla): [investigacion/metodos_citados_2026-11-15.json](investigacion/metodos_citados_2026-11-15.json).

## Decisiones

| ID | Decisión |
|---|---|
| DT-13 | FastAPI para trabajar en vivo y exportación a JSON para la web publicada; sin base de datos en la demo |
| DT-14 | Agente guiado con plantillas y datos reales, sin modelo de IA |
| DT-15 | Publicación en Vercel o Netlify (sitio estático) |
| **DT-16** | **Cero supuestos:** todo valor viene de una fuente real o lo declara el usuario; ninguna regla sin cita; nada sintético en la demo |
| ~~DT-17~~ | Reemplazada por DT-19 |
| **DT-19** | Fuentes y variables de la demo: POWER, SoilGrids, GAEZ, MODIS (ORNL), NASADEM, HLS, SMAP y el censo agropecuario 2012 |
| **DT-20** | Cultivos por sector: los 8 con más superficie en el censo 2012 que tengan ficha EcoCrop, más «ver más» |
| ~~DT-21~~ | Reemplazada por DT-22 |
| **DT-22** | Esquema mixto: base de Arequipa guardada + extracción por coordenada en Google Cloud con aviso; API interna sí, API pública no ([docs/11](../docs/11-esquema-mixto.md)) |

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
