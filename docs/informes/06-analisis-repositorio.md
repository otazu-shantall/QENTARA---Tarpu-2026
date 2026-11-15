# 06 · Análisis del repositorio para continuar el trabajo

**Fecha:** 14/11/2026. **Petición:** analizar el contenido existente antes de empezar nuevos trabajos. **Asistencia:** OpenAI Codex.

## Conclusión

TARPU tiene una base documental extensa, un prototipo visual operativo y un backend funcional con POWER. El principal trabajo pendiente es completar y comprobar el recorrido entre ellos. No hay todavía una aplicación integrada ni validación agronómica del producto.

La fase organizativa registrada continúa siendo la fase 1 del ROADMAP; el código del backend ya avanzó a construcción. Este análisis no cambia la fase ni atribuye decisiones nuevas al equipo.

## Alcance y límites de la revisión

Se inventariaron las carpetas y se revisaron las reglas por área, documentación de estado y decisiones, informe maestro en Markdown, contratos, flujo de datos, código principal de frontend y backend, conector POWER, muestras y pruebas, documentación de diseño y borradores de entrega. Se contrastó la documentación con el árbol de trabajo local y Git.

No constituye una revisión línea por línea de todos los archivos. Los PDF, imágenes, fuentes, diagramas exportados y auxiliares de `tmp/` se consideran materiales existentes; no se certificó su contenido visual ni la sincronía Markdown/LaTeX/PDF. Tampoco se volvieron a verificar fuentes científicas, reglas del evento, licencias o accesos externos. Las afirmaciones de esos documentos siguen siendo evidencia registrada previamente, no comprobaciones nuevas de esta revisión.

No se modificó código de producto, muestras, dependencias, decisiones ni el informe maestro. Solo se añadieron este informe y referencias de seguimiento en `docs/`. Las pruebas produjeron compilados y resultados locales ignorados por Git.

## Qué existe y qué se puede reutilizar

| Área | Base existente | Límite actual |
|---|---|---|
| Producto y organización | Informe maestro v0.4, DEC-001 a DEC-008, DT-01 a DT-17, reglas por área, ROADMAP e informes | Las propuestas del producto y las decisiones acotadas a la demo deben leerse por separado |
| Frontend (`Codigo/`) | React, TypeScript, Vite, Leaflet, landing y siete vistas; navegación, filtros, diálogo del agente, exportación y persistencia local | Los datos de negocio proceden de fixtures; no consume la API TARPU |
| Cartografía | Esri y OpenStreetMap, controles, atribución y estados de error | Es mapa base; no es cálculo de NDVI ni delimitación de parcelas |
| Datos (`datos/`) | Script POWER con original JSON, CSV normalizado y procedencia; muestra Majes 2025 | MODIS y SoilGrids tienen investigación y consultas previas documentadas, pero no conectores implementados |
| Backend (`backend/`) | FastAPI, geometría geodésica, parcelas y contexto declarado, procesamiento, indicadores, comparación, agente, datos detallados y exportador estático | Almacenamiento JSON local; sin autenticación; pantallas desconectadas |
| Evidencia para pruebas | Consulta POWER de Chivay 2015–2025, 4018 registros diarios, y ejemplo de indicadores | El contorno de las pruebas es una entrada de prueba, no una parcela real de la demo |
| Motor | Catálogo de papa, haba, cebada y quinua con citas EcoCrop; comparación por criterio sin puntaje ni pesos | Compara candidatos al siguiente cultivo; no valida una secuencia completa de rotación ni su beneficio agronómico |
| Agente | Reconocimiento de intenciones y plantillas con datos y citas | No es un modelo de lenguaje; depende de resultados ya guardados |
| Entrega (`entrega/`) | Formulario en inglés por completar, guion, referencias, registro de IA y pendientes legales | Faltan contenidos definitivos, enlaces, licencia y respuestas registradas a las preguntas locales |
| Diseño e historial | Referencias visuales, capturas, marca monocroma, informes anteriores y contexto integral | El diseño sigue siendo guía; el contexto histórico no reemplaza decisiones posteriores |

## Cómo se conectan las piezas actualmente

El backend tiene este recorrido implementado:

`GeoJSON declarado → geometría y parcela → contexto declarado → conector POWER → archivos con procedencia → indicadores → API`

Desde los indicadores salen la comparación de cultivos y las respuestas guiadas. La consulta detallada accede a los registros sin ejecutar el motor. El exportador genera JSON para lectura estática.

El frontend sigue otro recorrido independiente:

`demo.ts + localStorage → estado React → pantallas, agente local e informes sintéticos`

Por eso conectar una URL no basta. Hay que adaptar los tipos, el estado y las pantallas al contrato real, incluidas las ausencias de datos y el origen de cada valor.

## Hallazgos que afectan al siguiente trabajo

### 1. El frontend todavía fuerza la presencia de datos de demostración

**Comprobado por lectura del código.** `Codigo/src/types/index.ts` exige valores numéricos para NDVI, temperatura, humedad y precipitación en cada parcela. `App.tsx` recupera los fixtures si no hay al menos tres parcelas locales válidas. `ParcelsPage.tsx` asigna indicadores fijos al crear una ficha y no captura GeoJSON.

**Consecuencia:** la API puede entregar una lista vacía, una parcela sin indicadores o fuentes no disponibles; la interfaz actual no representa esas situaciones. No debe rellenarse esa diferencia con ceros o valores de ejemplo.

**Trabajo propuesto:** tipos separados para geometría, contexto declarado, observaciones, procedencia y estado de procesamiento; cliente de API para modo en vivo y JSON publicado; recorrido vacío y faltantes explícitos. Requiere trabajo de frontend y coordinación con backend.

### 2. Los resultados anteriores no se invalidan en todas las rutas

**Comprobado por lectura del código; pendiente prueba de regresión específica.** `indicadores.leer()` compara la versión de la parcela, pero `agente/banco.py` y `datos_detallados.py` leen directamente los resultados guardados. Redibujar aumenta la versión sin retirar esos archivos. Cambiar el contexto tampoco invalida la comparación guardada que usa el agente.

**Consecuencia:** el agente o la descarga pueden usar resultados anteriores mientras indicadores y clima rechazan esa misma versión. Tras cambiar el cultivo o los meses, el agente puede seguir explicando la comparación anterior hasta solicitar otra vez la ruta de rotaciones.

**Trabajo propuesto:** una comprobación compartida de vigencia, con revisión del contexto además de versión geométrica; respuestas explícitas de resultado desactualizado y pruebas de ambos cambios.

### 3. La integridad mensual solo comprueba celdas presentes

**Reproducido.** Se ejecutó `indicadores.calcular()` con los dos primeros registros reales de la muestra Chivay. El resultado informó dos días, ninguna entrada en `meses_con_dias_sin_dato` y 2,1 mm como lluvia mensual. Ese valor procede exclusivamente del recorte de prueba: no es el total real de enero.

El código comprueba `None` en las filas disponibles, pero no contrasta fechas presentes con el calendario del mes. El test existente de mes incompleto cubre una celda vacía, no días totalmente ausentes. El total anual comprueba cantidad de filas, sin comprobar unicidad de fechas.

**Trabajo propuesto:** validar fechas, duplicados, orden y cobertura respecto del período solicitado; distinguir mes parcial de mes completo. No introducir umbrales de suficiencia sin cita.

### 4. El agente no tolera todos los resúmenes ausentes

**Reproducido.** `plantillas.frio()` con el resumen `meses_con_mas_noches_bajo_0c = None` genera `TypeError` al acceder a `r["meses"]`. `indicadores.calcular()` puede producir ese `None` cuando no hay conteos disponibles. La plantilla de lluvia usa el mismo patrón sin protección.

**Consecuencia:** un estado de evidencia insuficiente puede convertirse en error del servicio.

**Trabajo propuesto:** responder con el motivo de ausencia y faltantes; probar series sin observaciones válidas para cada variable y el banco completo del agente.

### 5. Incorporar MODIS y SoilGrids requiere más que registrar conectores

**Comprobado por lectura del código.** Los dos conectores están ausentes del registro. Además, `indicadores.actualizar()` solo lee POWER y `ingesta.leer_normalizado()` exige `fecha` como primera columna. SoilGrids necesita representar profundidad y estadístico; MODIS necesita conservar calidad, escala y fechas de sus observaciones.

**Trabajo propuesto:** concretar el contrato de cada fuente con el área de datos, implementar su ingesta y derivados y después conectarlos a las pantallas. Registrar un conector por sí solo no habilita pH ni NDVI en los indicadores.

### 6. La web estática y la API en vivo tienen capacidades distintas

**Comprobado en `exportar.py`, `main.py` y documentación.** La exportación publica lecturas de parcelas ya procesadas. No permite registrar ni procesar una parcela nueva ni enviar preguntas libres al servidor.

**Consecuencia:** la demo pública debe mostrar claramente qué puede hacerse en ese modo. Un recorrido con dibujo y procesamiento públicos requiere resolver la publicación de la API; no está autorizado por este análisis ni acreditado como hecho.

### 7. Una parte importante del backend aún no está versionada en Git

**Comprobado con `git status` y `git ls-files backend`.** Al iniciar esta revisión había numerosos cambios locales y carpetas nuevas sin seguimiento, incluidos código del backend, pruebas, catálogo y contratos. Git solo enumeraba las guías y la propuesta dentro de `backend/` como archivos seguidos.

**Consecuencia:** tener el backend funcionando en esta computadora no garantiza que otra persona pueda obtenerlo al clonar el repositorio. No se verificó el contenido remoto ni su visibilidad pública.

**Trabajo propuesto:** revisar y registrar los cambios por área, respetando los cambios preexistentes. No se hizo commit ni publicación durante este análisis.

### 8. Hay documentación pendiente de conciliación

Ejemplos concretos:

- `docs/00` todavía incluía inicializar Git entre los próximos pasos, pese a documentar que el repositorio ya está publicado. Se corrigió ese pendiente en esta revisión.
- `docs/informes/en-curso.md` registra fase 1 y propuesta de backend completa; convive con implementación y pruebas ya existentes. No hay evidencia suficiente para declarar celebrada la reunión de unión.
- El informe maestro mantiene propuestas de puntajes, fuentes y arquitectura más amplias. DT-13 a DT-17 delimitan la demo; no deben restaurarse propuestas antiguas al implementar.
- El frontend todavía menciona IMERG y Sentinel-2 en fixtures, respuestas y reportes, aunque las fuentes de la demo quedaron acotadas por DT-17.
- `datos/analisis-recursos.md` contiene una fila que dice POWER en Chivay «No consultado», mientras otra sección y las muestras del backend documentan la consulta.
- El formulario de entrega conserva marcadores de pendiente y descripciones que deberán contrastarse con la versión realmente integrada.

Se señalan estas diferencias sin editar documentos de otras áreas ni cambiar decisiones.

## Verificaciones realizadas

| Comprobación | Resultado |
|---|---|
| `npm --prefix Codigo run build` | Correcto: TypeScript y compilación Vite |
| `npm --prefix Codigo test` | 8 pruebas aprobadas |
| `.venv/Scripts/python -m pytest --tb=short`, desde `backend/` | 15 pruebas aprobadas |
| `npm --prefix Codigo run test:ui`, con servidor local en puerto 5178 | Correcto: landing, navegación, agente, descarga, persistencia y ocho vistas móviles |
| Recorte de la muestra real a dos días | Reproduce falta de detección de mes parcial |
| Plantilla del agente con resumen de frío ausente | Reproduce `TypeError` |

El primer intento de pytest falló al crear temporales por permisos del entorno restringido; la repetición con permiso de ejecución fuera de ese entorno pasó. Chrome también requirió esa repetición por `spawn EPERM`. Esos bloqueos no fueron defectos del producto.

Las suites aprobadas prueban los casos que contienen; no acreditan integración frontend/backend, cobertura científica, disponibilidad actual de proveedores, accesibilidad completa ni uso real con agricultores.

## Orden propuesto para continuar

1. **Base reproducible:** revisar y versionar el backend existente y mantener una distinción clara entre estado organizativo y código construido.
2. **Consistencia de resultados:** resolver vigencia de datos, integridad temporal y respuestas ante faltantes, con pruebas de regresión.
3. **Primer recorrido real visible:** una parcela declarada, POWER, procedencia, faltantes y descarga en la interfaz; sin fixtures en ese recorrido. Usar el backend actual y adaptar el contrato de frontend.
4. **Comparación y explicación conectadas:** mostrar los criterios del motor y usar el mismo resultado vigente en el agente y en los informes.
5. **Fuentes restantes:** completar MODIS y SoilGrids con sus contratos y controles específicos; conservar estados no disponibles hasta tener evidencia.
6. **Demo pública y entrega:** ajustar las acciones al modo publicado, completar textos y referencias, y resolver los pendientes de entrega registrados.

Es una propuesta por dependencias, sin plazos ni nuevas asignaciones acordadas. El primer avance de producto que conviene demostrar es **POWER real visible y descargable desde una pantalla**, con procedencia y escala. Si se empieza exclusivamente por backend, el punto concreto es **impedir que el agente y los datos detallados sirvan resultados desactualizados**.
