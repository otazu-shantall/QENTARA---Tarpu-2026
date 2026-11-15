# Área de backend, conectores y motor · reglas para asistentes de IA

Complementa el `AGENTS.md` de la raíz; si hay contradicción, manda el de la raíz.

- **Responsable:** Erick. Esta carpeta es suya.
- **Misión:** cómo se conecta todo: conectores a las fuentes, la API que alimenta las pantallas, el motor que compara rotaciones y el agente.

## Qué leer primero

Todo lo del backend está en esta carpeta; [README.md](README.md) es el índice.

1. [README.md](README.md): resumen del área, estado, decisiones y mapa de la carpeta.
2. [DISENO.md](DISENO.md): cómo se conecta todo: recorrido por módulo, herramientas, interfaz con datos y frontend, errores y orden de construcción.
3. [MODULOS.md](MODULOS.md): módulos, estructura de carpetas y reglas de cada uno. Diagramas en `diagramas/`.
4. [PROPUESTA.md](PROPUESTA.md): la propuesta del área para la reunión de unión.
5. [../datos/README.md](../datos/README.md) y `../datos/muestras/`: qué datos hay y con qué formato.
6. [../docs/03-datos-y-fuentes.md](../docs/03-datos-y-fuentes.md): el motor de reglas propuesto.
7. [../docs/08-desafio-oficial.md](../docs/08-desafio-oficial.md): lo que el desafío espera del motor.

## Reglas

- **Estado:** el código existe en `tarpu_api/` y tiene pruebas en `tests/`. Antes de cambiar algo, ejecuta `.venv/Scripts/python -m pytest` desde `backend/`, y vuelve a ejecutarlo después. Si cambias un módulo, actualiza [MODULOS.md](MODULOS.md) y, si cambia una conexión, [DISENO.md](DISENO.md).
- **Fuentes (DT-17):** solo NASA POWER, NDVI de MODIS (ORNL) y SoilGrids, consultadas en el centroide. No añadas otra fuente sin una decisión nueva en `../docs/06`.
- **Capas:** API → lógica → núcleo → apoyo; nada importa hacia arriba (`tests/test_capas.py` lo comprueba).
- **Stack decidido para el hackathon:**
  - DT-13: Python 3.13, FastAPI y Pydantic v2, sin base de datos; las rutas `GET` se exportan a JSON estático en `Codigo/public/api/` con `exportar.py`.
  - DT-14: agente guiado con plantillas y datos reales, **sin modelo de IA**.
  - DT-15: publicación en Vercel o Netlify.
  - No añadas otro framework ni una base de datos sin una decisión nueva en `../docs/06`.
- **DT-16, cero supuestos (la regla más importante):**
  - todo valor que devuelva el backend viene de una fuente real, con su procedencia, o lo declaró el usuario (`origen: "declarado"`);
  - ninguna regla, umbral, rango, límite ni peso se usa sin cita;
  - nada sintético: ni parcelas, ni valores de ejemplo, ni personajes;
  - sin interpretaciones sin evidencia;
  - lo que no se sabe se devuelve como `sin_dato` o `sin_regla` con su motivo, nunca se rellena.
- **El plan manda:** sigue [DISENO.md](DISENO.md) y [MODULOS.md](MODULOS.md).
- **El backend no descarga:** invoca los conectores del área de datos (registro en `conectores.py`) y lee los archivos que dejan (original, normalizado y procedencia).
- **Catálogo:** `catalogo/ecocrop_2026-11-14.json` (FAO EcoCrop, copiado tal cual con su URL). No se le añade ningún valor sin cita; donde EcoCrop no trae el dato, es `null` y el criterio sale `sin_regla`.
- **Lo que devuelve el motor:** el cultivo actual y todos los del catálogo de otra familia (al menos tres estrategias, incluida la actual). Cada criterio se compara con su rango citado (`dentro_optimo`, `dentro_absoluto`, `fuera_absoluto`, `sin_dato`, `sin_regla`), con vacíos y conflictos entre fuentes.
  - **Sin puntaje, sin pesos y sin «apto / no apto».**
  - La altitud de EcoCrop **no excluye** cultivos (conflicto verificado con Chivay).
  - Los beneficios solo se muestran con cita.
- **Procedencia:** toda respuesta con datos incluye fuente, producto, fecha de observación, unidad, escala espacial y faltantes.
- **Datos detallados:** la consulta de registros **no ejecuta** el motor.
- **El agente:** solo responde con evidencia disponible y dice lo que falta. No inventa observaciones ni cambia las reglas.
- **Claves:** fuera del repositorio y fuera del frontend. Van en variables de entorno, y se deja un `.env.example` sin valores.
- **Reutiliza los conectores de `../datos/`.** No los dupliques; si necesitas cambiarlos, coordínalo con Damaris.
- **Contrato con el frontend:** parte de los tipos de `../Codigo/src/types/index.ts`. Si lo cambias, avisa a Shantall y actualiza [README.md](README.md).
- **Pensado para todas las plataformas:** la misma API servirá a la web y luego a Android e iOS.
- **Uso de IA:** si escribes o modificas código, añade una nota en el encabezado y una fila en [../entrega/uso-de-ia.md](../entrega/uso-de-ia.md).
