# Roadmap de QENTARA · TARPU en NASA Space Apps 2026

> Desafío: **Field Shift: Adapting Farms with NASA Data**. Envío oficial: **domingo 15/11/2026, 11:59 p. m.**, hora del evento local.
>
> Este documento explica **qué le toca a cada uno** y **cómo nos organizamos** en tres fases. El punto de unión se fijó a las **2 horas** de empezar la fase 1, por acuerdo del equipo (Erick, 14/11/2026). Más detalle de las áreas en [docs/07-equipo-y-areas.md](docs/07-equipo-y-areas.md).

## Las tres fases

```text
FASE 1 · Planificar cada área          FASE 2 · Unir             FASE 3 · Construir
(cada uno por su lado, 2 h)  ───────▶  (reunión de todos)  ───▶  (nueva división, con
                                                                  pantallas definidas)
Damaris   → datos                      · presentar propuestas     · tareas con dueño
Shantall  → frontend y UX              · decidir recorrido,       · integración
Erick     → backend y motor              pantallas, datos,        · demo y envío
Derecho A → entrega y legal              contrato, demo           
Derecho B → pitch e investigación      · repartir de nuevo        
```

**Qué es TARPU, en una frase, para que todos remen hacia lo mismo:** una herramienta que ayuda al agricultor de Arequipa a entender su campo con datos de NASA y a **comparar al menos tres opciones de rotación, incluida la actual**, mostrando el porqué, la evidencia, lo que falta saber y los riesgos. **Apoya al agricultor; no decide por él.**

## Antes de empezar (todos)

- [ ] Leer este roadmap y la guía de tu área.
- [ ] Revisar que estás registrado en el **mismo evento local** que el resto y que apareces en *Members* del equipo.
- [x] Repositorio publicado: [https://github.com/otazu-shantall/QENTARA---Tarpu-2026](https://github.com/otazu-shantall/QENTARA---Tarpu-2026).
- [ ] Clonarlo (`git clone https://github.com/otazu-shantall/QENTARA---Tarpu-2026.git`) y crear tu rama: `datos/…`, `frontend/…`, `backend/…` o `entrega/…`.
- [ ] Cada uno abre su **plantilla de propuesta** (enlace en su sección) y la va llenando durante la fase 1.

---

## FASE 1 · Cada uno planifica su parte (2 horas)

El objetivo **no es construir todo**, sino llegar a la reunión con una propuesta clara, algo mínimo que mostrar y las preguntas resueltas o anotadas.

### Damaris · Datos satelitales

**Tu misión:** saber qué datos de satélite vamos a usar, cómo se sacan y qué dicen (y qué no) sobre una parcela de Arequipa.

| Lo que tienes | Dónde |
|---|---|
| Guía del área | [datos/README.md](datos/README.md) |
| Análisis verificado de los recursos oficiales | [datos/analisis-recursos.md](datos/analisis-recursos.md) |
| Ejemplo que funciona: consulta real a NASA POWER | [datos/power/consulta_power.py](datos/power/consulta_power.py) |

**Preguntas que debes responder:**

1. ¿Qué fuentes entran en la demo? **Decidido (DT-19, reemplaza DT-17):** POWER, SoilGrids, GAEZ, MODIS (ORNL), NASADEM, HLS, SMAP y el censo agropecuario 2012.
2. Para cada una: ¿cómo se pide?, ¿qué devuelve?, ¿en qué unidades?, ¿con qué resolución?, ¿cómo vienen los faltantes?
3. ¿Qué nos dice cada dato sobre **las rotaciones**? Por ejemplo, épocas sin cultivo, heladas, falta de agua o pendiente.
4. ¿Hay diferencia entre la **costa** (Majes) y la **sierra** (Chivay)? ¿Cuál usamos en la demo?

**Lo que traes a la reunión:**

- [ ] [Propuesta de datos](docs/areas/propuesta-datos.md) llena.
- [ ] Al menos **una muestra nueva** en `datos/muestras/` (por ejemplo, el NDVI de un punto).
- [ ] Una tabla con las variables que puede usar el backend (nombre, unidad, fuente).

### Shantall · Frontend y experiencia de usuario

**Tu misión:** decidir **cómo se ve y cómo se usa** TARPU, pensando en agricultores y en **personas mayores**: claro, conciso y fácil.

| Lo que tienes | Dónde |
|---|---|
| Guía del área | [docs/areas/frontend.md](docs/areas/frontend.md) |
| Prototipo de ejemplo (**guía, no diseño final**) | `Codigo/`: `npm --prefix Codigo run dev` |
| Referencias visuales y capturas | [docs/diseno/](docs/diseno/README.md) |

**Preguntas que debes responder:**

1. ¿Cuál es el **recorrido** del agricultor, paso a paso? La base propuesta: mi parcela → cómo está mi campo → tres opciones de rotación → preguntar a Tarpu → ver y descargar los datos.
2. ¿Qué **pantallas** hacen falta y qué muestra cada una? Una pregunta por pantalla.
3. ¿Qué **reglas de accesibilidad** aplicamos? Letra grande, contraste, botones grandes, palabras sencillas.
4. ¿Cómo resolvemos el **idioma**? La app es para hispanohablantes, pero lo que se entrega va en inglés.
5. ¿Qué **datos** necesita cada pantalla? Eso se lo pasas a Erick.

**Lo que traes a la reunión:**

- [ ] [Propuesta de frontend](docs/areas/propuesta-frontend.md) llena.
- [ ] **Bocetos** de las pantallas clave, en papel, Figma o capturas del prototipo marcadas.
- [ ] La lista de **datos que pide cada pantalla**.

### Erick · Backend, conectores y motor

**Tu misión:** decidir **cómo se conecta todo**: de dónde salen los datos, cómo llegan a las pantallas y cómo el motor compara las rotaciones.

| Lo que tienes | Dónde |
|---|---|
| Guía del área y borrador de contrato | [backend/README.md](backend/README.md) |
| Arquitectura propuesta | [docs/02-arquitectura.md](docs/02-arquitectura.md) |
| Motor de reglas propuesto | [docs/03-datos-y-fuentes.md](docs/03-datos-y-fuentes.md#motor-de-reglas-propuesto) |

**Preguntas que debes responder:**

1. **Stack:** ¿Python con FastAPI u otro? ¿Base de datos o archivos? ¿Dónde se publica, si se publica?
2. **Contrato:** ¿qué rutas y qué forma de JSON llegan a cada pantalla? Se cruza con lo que pide Shantall y lo que trae Damaris.
3. **Motor de rotaciones, versión 0:** ¿qué entradas usa? ¿Cómo arma las **tres estrategias** (la actual y dos alternativas)? ¿Qué criterios aplica? ¿Cuándo dice «no evaluable»?
4. **Agente:** ¿respuestas guiadas con los datos reales, o un modelo de IA? Si es un modelo, ¿cuál, y cómo se declara?
5. ¿Los datos se piden **en vivo** o se guardan antes, para que la demo no dependa de la red?

**Lo que traes a la reunión:**

- [ ] [Propuesta de backend](backend/PROPUESTA.md) llena.
- [ ] Un **esquema** de cómo se conectan las piezas.
- [ ] El **contrato v0**: rutas y ejemplos de JSON.
- [ ] Las **reglas del motor v0**, aunque sean simples.

### Derecho · Entrega, pitch e investigación

**Su misión:** que el proyecto **se pueda enviar, cumpla las reglas y se entienda**. Proponemos repartirse en dos frentes; ustedes pueden ajustarlo.

| Lo que tienen | Dónde |
|---|---|
| Guía del área y tareas | [entrega/README.md](entrega/README.md) |
| Reglas oficiales resumidas | [docs/09-entrega-oficial.md](docs/09-entrega-oficial.md) |
| Borradores | `entrega/`: formulario, guion, referencias, uso de IA, pendientes legales |

**Derecho A · Entrega y legal**

1. Confirmar que **los cinco** estamos registrados en el mismo evento local, sin lista de espera.
2. Hacer las **preguntas al líder local**: hora de la evaluación local, prototipo previo e idioma de la interfaz ([pendientes-legales.md](entrega/pendientes-legales.md)).
3. Proponer la **licencia** del repositorio y revisar las condiciones de Esri, OpenStreetMap, las tipografías y el branding.
4. Revisar las reglas de **uso de IA** y qué hay que declarar.

**Derecho B · Pitch e investigación**

1. Buscar **3 a 5 cifras** del problema con fuente, año y tabla: agricultores de Arequipa, cultivos, edad, acceso a internet (MIDAGRI e INEI).
2. Proponer el **formato de la demo**: video de 30 s o 7 diapositivas.
3. Escribir el **primer guion** y la historia: ¿qué agricultor?, ¿qué problema?, ¿qué hace TARPU por él?
4. Buscar los **equivalentes peruanos** de los datos que solo existen en EE. UU. ([análisis, sección 7](datos/analisis-recursos.md#7-equivalentes-peruanos-de-lo-que-solo-existe-en-estados-unidos)).

**Lo que traen a la reunión:**

- [ ] [Propuesta de entrega](docs/areas/propuesta-entrega.md) llena.
- [ ] Las respuestas del líder local, o la constancia de que se preguntó.
- [ ] Las cifras con su fuente.
- [ ] El formato de demo propuesto y el primer guion.

---

## FASE 2 · Reunión de unión (todos)

**Cuándo:** a las 2 horas de empezar la fase 1.
**Resultado:** las pantallas y el recorrido definidos, y una nueva división de tareas para construir.

### Orden del día

| # | Punto | Quién | Resultado |
|---|---|---|---|
| 1 | Cada área presenta su propuesta, en pocos minutos | Todos | Todos saben qué propone cada uno |
| 2 | **Recorrido y pantallas definitivas** | Shantall guía | Lista cerrada de pantallas y qué muestra cada una |
| 3 | **Datos que entran en la demo** | Damaris guía | Fuentes y variables elegidas, con zona (costa o sierra) |
| 4 | **Contrato de datos** entre backend y frontend | Erick y Shantall | Rutas y JSON acordados |
| 5 | **Motor y agente** para la demo | Erick guía | Cómo se arman las tres estrategias y qué responde el agente |
| 6 | **Formato de demo, idioma e historia** | Derecho guía | Video o diapositivas; cómo cumplimos lo del inglés |
| 7 | **Riesgos y recortes** | Todos | Qué queda fuera si no da el tiempo |
| 8 | **Nueva división** | Todos | Tabla de tareas de la fase 3, con dueño |

### Decisiones que deben salir de la reunión

- [ ] Recorrido y pantallas de la demo.
- [ ] Zona de la demo y quién declara el contexto de la parcela: un agricultor real (con permiso) o el presentador en vivo, rotulado como «declarado por el usuario».
- [ ] Fuentes de datos de la demo.
- [ ] Stack del backend y forma de publicar el proyecto.
- [ ] Contrato v1 entre backend y frontend.
- [ ] Cómo funcionan el motor y el agente en la demo.
- [ ] Formato de demo y estrategia de idioma.
- [ ] Licencia.

Cada decisión se anota en [docs/06-decisiones-y-riesgos.md](docs/06-decisiones-y-riesgos.md), con un código DT nuevo.

---

## FASE 3 · Construir (nueva división)

La división exacta sale de la reunión. Esta es la **forma esperada**, por orden de dependencia:

```text
Datos ──▶ Backend ──▶ Frontend ──▶ Integración ──▶ Grabar la demo ──▶ Envío
              ▲            ▲                             ▲
              └── contrato ┘                Entrega trabaja en paralelo:
                                            formulario, guion, referencias, legal
```

| Bloque | Responsable propuesto (se confirma en la reunión) | Hecho cuando… |
|---|---|---|
| Scripts de datos de la demo | Damaris | Cada fuente elegida deja original, normalizado y procedencia en `datos/muestras/` |
| API con el contrato v1 | Erick | Cada pantalla puede pedir su dato real |
| Motor de rotaciones v0 | Erick | Devuelve tres estrategias con motivo, evidencia, vacíos y riesgos, o «no evaluable» |
| Pantallas definitivas | Shantall | El recorrido se completa en el teléfono, con letra grande y lenguaje claro |
| Integración | Erick y Shantall | La app muestra al menos un dato real de NASA |
| Formulario y referencias | Derecho A | Todos los campos en inglés, sin pendientes |
| Demo | Derecho B, con capturas de Shantall | Video ≤ 30 s con subtítulos en inglés, o ≤ 7 diapositivas, con enlace público probado |
| Envío | Derecho A, con todos | «Submit for Judging» pulsado antes del cierre oficial |

### Lista final antes de enviar

- [ ] La app muestra **un dato real de NASA** (criterio *Relevance*).
- [ ] Se comparan **tres estrategias de rotación**, incluida la actual.
- [ ] **No hay datos sintéticos en la demo** (DT-16): todo valor tiene procedencia real o está rotulado como «declarado por el usuario».
- [ ] El repositorio es público, con licencia y con la sección de uso de IA en inglés.
- [ ] La demo cumple el límite y su enlace abre en una ventana privada.
- [ ] El formulario está en inglés y completo.
- [ ] Todos los recursos externos están en las referencias.
- [ ] Se pulsó **Submit for Judging**.

---

## Reglas para todos

- **Cada uno en su carpeta** y en su rama: `datos/` Damaris · `Codigo/` Shantall · `backend/` Erick · `entrega/` Derecho. `docs/` es de todos.
- **No inventar datos.** Lo sintético se rotula; lo que falta se dice.
- **Límites científicos:** el NDVI no es fertilidad; un histórico no es un pronóstico; un dato regional no es una medición en la parcela.
- **Declarar la IA** que se use en [entrega/uso-de-ia.md](entrega/uso-de-ia.md).
- **Lo que se entrega va en inglés.** Lo interno puede ir en español.
- Si te bloqueas, **avisa en el grupo** en vez de esperar a la reunión.
