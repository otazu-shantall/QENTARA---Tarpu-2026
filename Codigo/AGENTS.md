# Área de frontend y experiencia de usuario · reglas para asistentes de IA

Complementa el `AGENTS.md` de la raíz; si hay contradicción, manda el de la raíz.

- **Responsable:** Shantall. Esta carpeta es suya.
- **Misión:** cómo se ve y cómo se usa TARPU. **Claro, conciso y fácil de usar para personas mayores** y agricultores con poca experiencia digital.

## Qué leer primero

1. [../docs/areas/frontend.md](../docs/areas/frontend.md): guía del área, qué revisar para personas mayores y el recorrido mínimo.
2. [README.md](README.md): cómo está hecho el código, cómo se ejecuta y cómo se prueba.
3. [../docs/areas/propuesta-frontend.md](../docs/areas/propuesta-frontend.md): la propuesta del área para la reunión de unión.
4. [../docs/diseno/README.md](../docs/diseno/README.md): referencias y sistema visual actual.

## Reglas

- **El prototipo es una guía, no el diseño final** (DT-10). Puedes reorganizar pantallas y estilos; las pantallas definitivas se acuerdan en la reunión de unión.
- **Accesibilidad:**
  - letra grande (cuerpo de 16 px o más) y contraste de al menos 4,5:1;
  - botones de 48 px o más;
  - un icono siempre acompañado de su palabra;
  - una pregunta por pantalla;
  - lenguaje sencillo, con el término técnico como opción.
- **Datos de demostración:** no quites los rótulos «Demo» o «sintético» mientras el dato no sea real. No pintes colores de «salud» sobre parcelas sin un dato que lo respalde.
- **Logo:** el vigente es el de blanco y negro (`public/brand/tarpu-logo-*`, `tarpu-mark-*`).
- **Sin claves en el frontend.** Los datos llegan del backend, con el contrato acordado con Erick ([../backend/README.md](../backend/README.md)).
- **Sin lógica agronómica en la interfaz.** Las reglas viven en el backend; la interfaz muestra y explica.
- **Idioma:** la interfaz es para hispanohablantes, pero lo que se entrega va en inglés. Cómo se resuelve está pendiente de decidir en la reunión.
- **Después de un cambio:** `npm run build` y `npm test` desde esta carpeta. Con un navegador disponible, también `npm run test:ui` con `npm run dev` encendido. Si cambias textos o rutas, ajusta `tests/browser.mjs`.
- **Uso de IA:** si escribes o modificas código, añade una fila en [../entrega/uso-de-ia.md](../entrega/uso-de-ia.md).
