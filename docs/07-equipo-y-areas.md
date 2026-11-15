# Equipo y áreas

> Organización del equipo al **14/11/2026** (DT-09): cinco integrantes distribuidos en datos, frontend, backend y entrega. Cada área tiene su carpeta y guía.

## Quién hace qué

| Área | Responsable | Carpeta | Se encarga de | Guía |
|---|---|---|---|---|
| **Datos satelitales** | Damaris | [`datos/`](../plataforma/datos/README.md) | Cómo extraer los datos de los satélites: qué fuente, cómo se pide, qué devuelve y con qué límites | [datos/README.md](../plataforma/datos/README.md) |
| **Frontend y experiencia de usuario** | Shantall | [`frontend/`](../plataforma/frontend/README.md) (prototipo de escritorio) | Web para computadora, pantallas y experiencia clara para personas mayores; asistente por chat y voz | [areas/frontend.md](areas/frontend.md) |
| **Backend, conectores y motor** | Erick | [`backend/`](../plataforma/backend/README.md) | Cómo se conecta todo: API, conectores, el motor de TARPU y el agente | [backend/README.md](../plataforma/backend/README.md) |
| **Entrega, pitch e investigación** | Los dos integrantes de Derecho | [`entrega/`](../entrega/README.md) | Formulario oficial, demo, pitch, referencias, licencia, cifras del problema y lo que haga falta buscar | [entrega/README.md](../entrega/README.md) |

Los nombres de los dos integrantes de Derecho faltan por anotar aquí.

## Plataformas (DT-08)

| Orden | Plataforma | Estado |
|---|---|---|
| 1 | **Página web** | En curso. Es lo que se demuestra |
| 2 | **App Android** | Se construye después de la web |
| 3 | **App iOS** | Se deja implementada, pero quizá sin lanzar todavía |

El nuevo frontend (DT-25) se diseña para **computadora**, con sidebar izquierda, ratón y teclado. El diseño se organiza alrededor de pantallas de escritorio. La lógica (datos, reglas y agente) sigue en el backend para su reutilización; el orden de plataformas web → Android → iOS conserva su carácter de orientación futura.

## Cómo trabajamos

El trabajo va en tres etapas. No tienen duración fijada: se pasa a la siguiente cuando se cumple la condición.

| Etapa | Qué hace cada área | Se pasa a la siguiente cuando… |
|---|---|---|
| **1. Investigar y hacer la base** | Cada uno, por su parte, investiga, configura y deja una base o una idea clara de su área | Cada área puede explicar qué propone y mostrar algo mínimo |
| **2. Unir** | Se junta todo en el repositorio y se definen juntos las pantallas y el recorrido | Las pantallas y el recorrido están definidos y acordados |
| **3. Volver a segmentar** | Cada uno desarrolla su parte con la idea clara y las pantallas definidas | Está lo que hay que entregar ([05](05-entregables.md), [09](09-entrega-oficial.md)) |

**Sobre el frontend actual:** lo que hay en `frontend/` es **solo una guía**, no el diseño final. Sirve de base y de ejemplo; las pantallas definitivas se deciden en la etapa 2.

## Qué necesita cada área de las demás

| Área | Entrega a | Qué entrega |
|---|---|---|
| Datos | Backend | Para cada fuente: cómo pedirla, formato de respuesta, unidades, faltantes, escala y un archivo de muestra |
| Datos | Entrega | La lista exacta de datos de NASA usados, para el campo *NASA Data* |
| Backend | Frontend | El contrato: qué datos llegan a cada pantalla y con qué forma (ver [backend/README.md](../plataforma/backend/README.md)) |
| Frontend | Entrega | Capturas y un recorrido que se pueda grabar para la demo |
| Entrega | Todos | Qué exige el formulario, qué evalúan los jueces, la licencia y las cifras del problema |
| Todos | Entrega | Qué herramientas de IA usó cada uno y para qué ([entrega/uso-de-ia.md](../entrega/uso-de-ia.md)) |

## Trabajar en el mismo repositorio

Cada área trabaja **solo en su carpeta**. Así nadie pisa el trabajo de otro.

| Carpeta | Dueño | Los demás… |
|---|---|---|
| `datos/` | Damaris | leen |
| `frontend/` | Shantall; nuevo desarrollo | leen |
| `backend/` | Erick | leen |
| `entrega/` | Derecho | leen y aportan su parte de uso de IA |
| `docs/` | Todos | actualizan lo de su área |

**Ramas de git propuestas:**

| Rama | Para qué |
|---|---|
| `main` | Lo que funciona y está unido. Nadie trabaja directamente aquí |
| `datos/<tema>`, `frontend/<tema>`, `backend/<tema>`, `entrega/<tema>` | El trabajo de cada área. Ejemplo: `datos/power` |

Para unir: se abre un *pull request* hacia `main`, lo mira otra persona y se fusiona. Si dos áreas necesitan cambiar el mismo archivo, se avisan antes.

> Repositorio: **[https://github.com/otazu-shantall/QENTARA---Tarpu-2026](https://github.com/otazu-shantall/QENTARA---Tarpu-2026)**. Para empezar: `git clone https://github.com/otazu-shantall/QENTARA---Tarpu-2026.git` y luego `git checkout -b <area>/<tema>`. El enlace al proyecto final de la entrega debe ser público.

## Reglas comunes

- **Todo lo que va a la entrega, en inglés.** La documentación interna sigue en español.
- **Declarar la IA** que se use: en el registro de entrega y en un comentario del archivo.
- **No inventar datos.** Lo sintético se rotula; lo que falta se dice.
- **Límites científicos** de [01](01-vision-y-alcance.md): valen para todas las áreas, incluido el pitch.
- **Al terminar algo**, actualizar [00-estado-actual.md](00-estado-actual.md) y dejar el informe en [informes/](informes/README.md).
