# Área de backend, conectores y motor · reglas para asistentes de IA

Complementa el `AGENTS.md` de la raíz; si hay contradicción, manda el de la raíz.

- **Responsable:** Erick. Esta carpeta es suya.
- **Misión:** cómo se conecta todo: conectores a las fuentes, la API que alimenta las pantallas, el motor que compara rotaciones y el agente.

## Qué leer primero

1. [README.md](README.md): guía, decisiones pendientes y borrador de contrato.
2. [../docs/areas/propuesta-backend.md](../docs/areas/propuesta-backend.md): la propuesta del área para la reunión de unión.
3. [../datos/README.md](../datos/README.md) y `../datos/muestras/`: qué datos hay y con qué formato.
4. [../docs/03-datos-y-fuentes.md](../docs/03-datos-y-fuentes.md): el motor de reglas propuesto.
5. [../docs/08-desafio-oficial.md](../docs/08-desafio-oficial.md): lo que el desafío espera del motor.

## Reglas

- **Stack sin decidir:** el stack del backend no está decidido (SUP-015). No lo elijas por tu cuenta. Si te piden empezar, propone opciones y espera la decisión, que va a `../docs/06` con un código DT.
- **Lo que debe devolver el motor:** al menos **tres estrategias de rotación, incluida la actual**. Para cada una: motivo, evidencia, beneficios, vacíos de información y riesgos.
  - Si falta un criterio necesario, el resultado es «no evaluable» y el puntaje queda `null`.
  - El puntaje es un orden relativo, no una probabilidad.
- **Procedencia:** toda respuesta con datos incluye fuente, producto, fecha de observación, unidad, escala espacial y faltantes.
- **Datos detallados:** la consulta de registros **no ejecuta** el motor.
- **El agente:** solo responde con evidencia disponible y dice lo que falta. No inventa observaciones ni cambia las reglas.
- **Claves:** fuera del repositorio y fuera del frontend. Van en variables de entorno, y se deja un `.env.example` sin valores.
- **Reutiliza los conectores de `../datos/`.** No los dupliques; si necesitas cambiarlos, coordínalo con Damaris.
- **Contrato con el frontend:** parte de los tipos de `../Codigo/src/types/index.ts`. Si lo cambias, avisa a Shantall y actualiza [README.md](README.md).
- **Pensado para todas las plataformas:** la misma API servirá a la web y luego a Android e iOS.
- **Uso de IA:** si escribes o modificas código, añade una nota en el encabezado y una fila en [../entrega/uso-de-ia.md](../entrega/uso-de-ia.md).
