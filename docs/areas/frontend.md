# Frontend y experiencia de usuario

> Guía para **Shantall**. Lo que hay en `Codigo/` es un **ejemplo para guiarse, no el diseño final**. El enfoque: **claro, conciso y fácil de usar para personas mayores**. Las pantallas definitivas se acuerdan en la etapa 2 ([07](../07-equipo-y-areas.md)).

## Empezar

```bash
npm --prefix Codigo install
```

```bash
npm --prefix Codigo run dev
```

Abre http://127.0.0.1:5173/ (landing) y http://127.0.0.1:5173/#/overview (dashboard). Más en [desarrollo.md](../desarrollo.md).

## Qué hay hoy

| Pantalla | Ruta | Archivo |
|---|---|---|
| Landing | `#/` | `Codigo/src/features/landing/LandingPage.tsx` |
| Vista general | `#/overview` | `features/dashboard/OverviewPage.tsx` |
| Mis parcelas | `#/parcels` | `features/parcels/ParcelsPage.tsx` |
| Monitor satelital | `#/monitor` | `features/monitor/MonitorPage.tsx` |
| Clima e históricos | `#/climate` | `features/climate/ClimatePage.tsx` |
| Rotaciones | `#/rotations` | `features/rotations/RotationsPage.tsx` |
| Explorar datos | `#/data` | `features/data/DataPage.tsx` |
| Mis informes | `#/reports` | `features/reports/ReportsPage.tsx` |
| Agente | panel lateral | `features/assistant/AssistantDrawer.tsx` |

Qué muestra cada una y qué es real o de demostración: [04-modulos.md](../04-modulos.md). Capturas: [diseno/capturas/](../diseno/capturas/). Referencias y sistema visual: [diseno/README.md](../diseno/README.md).

## Dónde se cambia cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Colores, tipografía, radios, sombras | `Codigo/src/styles/tokens.css` |
| Botones, formularios, diálogos | `Codigo/src/styles/base.css` |
| El dashboard | `Codigo/src/styles/app.css` |
| La landing | `Codigo/src/styles/landing.css` |
| El menú | `Codigo/src/components/layout/Sidebar.tsx` y `data/demo.ts` (`navItems`) |
| Los datos de ejemplo | `Codigo/src/data/demo.ts` |
| Los textos del agente | `Codigo/src/lib/domain.ts` |

## El prototipo actual frente al enfoque para personas mayores

El prototipo se diseñó como un dashboard moderno. Para personas mayores con poca experiencia digital **hay cosas que revisar**:

| Hoy en el prototipo | Problema para una persona mayor | Qué probar |
|---|---|---|
| Textos de 11 a 13 px en etiquetas, notas y tablas | Cuestan de leer | Cuerpo de 18 px o más; nada por debajo de 16 px |
| Texto gris claro sobre blanco | Poco contraste | Contraste mínimo de 4,5:1 (WCAG AA); mejor 7:1 en lo importante |
| Siete vistas en el menú | Demasiadas opciones | Tres o cuatro destinos con nombres de todos los días |
| Barra con iconos pequeños | Los iconos solos no se entienden | Icono grande siempre con su palabra |
| Palabras como «NDVI», «m³/m³», «derivado» | Jerga técnica | Lenguaje llano primero; el término técnico, opcional |
| Varias tarjetas y un mapa a la vez | Mucha información junta | **Una pregunta por pantalla** y un botón principal claro |
| Botones y chips pequeños | Difíciles de tocar | Áreas táctiles de 48 px o más, con separación |
| Animaciones en la landing | Pueden distraer o marear | Movimiento mínimo dentro de la app |
| Solo texto | Lectura difícil para algunos | Explorar lectura en voz alta y dictado de preguntas |

## Principios para el diseño nuevo

1. **Una cosa a la vez.** Cada pantalla responde una pregunta: «¿Cómo está mi campo?», «¿Qué puedo sembrar después?».
2. **Primero la respuesta, después el detalle.** Una frase clara arriba; los números y el mapa, debajo y opcionales.
3. **Palabras del campo.** «Lluvia» en vez de «precipitación acumulada»; «verdor del cultivo» junto a «NDVI».
4. **Grande y con contraste.** Letra grande, botones grandes, pocos colores.
5. **Decir siempre de dónde viene el dato y qué no significa**, en una línea sencilla.
6. **Nunca dejar sin salida.** Botón de volver siempre visible; errores que digan qué hacer.
7. **El teléfono primero.** Es el orden de plataformas: web, Android, iOS.

## Lo que el desafío espera de la interfaz

Del [desafío oficial](../08-desafio-oficial.md):

- que sea fácil de interpretar para agricultores con poca experiencia técnica;
- que el agricultor pueda indicar sus **prioridades o restricciones** (agua disponible, equipos, mercado);
- que recuerde que la herramienta **apoya y no reemplaza** el criterio local;
- que compare **al menos tres estrategias de rotación**, incluida la actual, con sus razones, su evidencia, sus vacíos y sus riesgos.

## Recorrido mínimo a diseñar

| Paso | Pantalla | Dato que necesita del backend |
|---|---|---|
| 1 | Elegir o ubicar mi parcela | Lista de parcelas |
| 2 | Cómo está mi campo (clima real de NASA POWER) | Serie climática con fuente y período |
| 3 | Qué puedo sembrar después: tres opciones comparadas | Estrategias con motivos, evidencia, vacíos y riesgos |
| 4 | Preguntar a Tarpu | Respuesta con la evidencia en que se apoya |
| 5 | Ver y descargar los datos | Registros y metadatos |

El contrato de datos se acuerda con Erick: [backend/README.md](../../backend/README.md).

## Reglas

- **DT-16, cero supuestos:** la entrega final no muestra ningún dato sintético; los fixtures de `Codigo/src/data/demo.ts` se sustituyen por datos de la API. Mientras existan, conservan sus rótulos. Cada dato indica su fuente y su resolución, o «declarado por ti».
- No pintar colores de «salud» sobre parcelas sin un dato que lo respalde.
- El logo vigente es el de blanco y negro (`Codigo/public/brand/`).
- **Todo lo que se vea en la entrega debe estar en inglés** o tener versión en inglés. Hay que decidirlo pronto: ver [09](../09-entrega-oficial.md).
- Después de cambiar algo: `npm --prefix Codigo run build` y `npm --prefix Codigo test`.
- Declarar el uso de IA en [entrega/uso-de-ia.md](../../entrega/uso-de-ia.md).
