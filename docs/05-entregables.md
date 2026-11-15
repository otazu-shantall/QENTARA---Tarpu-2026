# Entregables

> **Qué hay que entregar**, qué cuenta como hecho y en qué estado está cada cosa. Sin plazos ni calendarios: solo lo que debe existir al final. Sale del apartado 04 (recorrido mínimo) y del apartado 08 (paquete para NASA Space Apps) del [informe maestro](../Documentación/TARPU_Documentacion_Maestra.md#entrega-nasa-space-apps).
>
> Los requisitos oficiales ya están leídos del sitio de Space Apps: ver [09-entrega-oficial.md](09-entrega-oficial.md). El envío cierra el **domingo 15/11/2026 a las 11:59 p. m.**, hora del evento local. Esa fecha es del evento, no un plazo nuestro.

Estados: ✅ existe · 🟡 existe con datos de demostración o incompleto · ❌ falta.

## 1. La demostración

Un recorrido completo que el agricultor pueda seguir de principio a fin, con al menos un dato real. Se prioriza este recorrido sobre sumar fuentes o funciones.

| # | Entregable | Cuenta como hecho cuando… | Estado |
|---|---|---|---|
| 1.1 | Parcela | Una parcela dibujada sobre un campo real de la imagen, con su contexto declarado por un agricultor real (con permiso) o por el presentador en vivo, rotulado como «declarado por el usuario» | ❌ el prototipo solo tiene parcelas sintéticas, que se retiran (DT-16) |
| 1.2 | Dato climático real | Una serie de POWER (u otra fuente verificada) con fuente, período, unidad y faltantes visibles **en la app** | 🟡 consulta real hecha en `datos/`; falta mostrarla en la app |
| 1.3 | Procedencia | Desde el indicador se llega a la fuente, el producto, la fecha y el método | 🟡 rótulos de referencia, sin fuente real |
| 1.4 | Pregunta al agente | El agente responde sobre ese dato, muestra en qué se apoya y reconoce lo que falta | 🟡 respuestas guiadas, sin modelo |
| 1.5 | Datos detallados | Se abren los registros de esa misma consulta, sin pasar por una recomendación, con su nivel (original, normalizado o derivado) | 🟡 tabla y filtros con sintéticos |
| 1.6 | Descarga | Se descarga la selección en un formato reutilizable (CSV o JSON) con unidades, fechas, procedencia y advertencias | 🟡 funciona con sintéticos |
| 1.7 | Reporte legible | Un PDF que resume la selección y sus límites, distinto del archivo de datos | 🟡 impresión desde el navegador |
| 1.8 | Comparación de rotaciones | Al menos **tres estrategias, incluida la actual**, cada una con motivo, evidencia, vacíos y riesgos (lo sugiere el desafío) | 🟡 pantalla sin evidencia real |
| 1.9 | Interfaz | Landing y dashboard comprensibles en escritorio y teléfono, con lo sintético rotulado | ✅ prototipo visual |
| 1.10 | Estados de fallo | Si una fuente falla, se muestra como no disponible; nada simula una integración ausente | 🟡 mapa sí; datos no aplican todavía |

## 2. Envío oficial

Lo que exige el formulario de Space Apps. Todo **en inglés**. Borradores en [`entrega/`](../entrega/README.md).

| # | Entregable | Cuenta como hecho cuando… | Estado |
|---|---|---|---|
| E.1 | Project Name y High-Level Summary | Escritos en inglés y pegados en la página del proyecto | 🟡 borrador |
| E.2 | **Demo** | Video de 30 s o menos con subtítulos en inglés, o hasta 7 diapositivas en inglés, con enlace público probado | ❌ |
| E.3 | **Link to Final Project** | Repositorio o sitio público que abre sin registro | ❌ |
| E.4 | Detailed Project Description | Describe solo lo que funciona en la versión enviada | 🟡 borrador |
| E.5 | Use of SI | Declaración de las herramientas de IA usadas y para qué | 🟡 borrador y registro empezado |
| E.6 | NASA Data | Lista exacta de datos de NASA usados | 🟡 POWER listo |
| E.7 | Partner Data and Other References | Todos los datos, recursos y herramientas | 🟡 lista empezada |
| E.8 | Licencia | Licencia de código abierto elegida y puesta en el repositorio | ❌ |
| E.9 | Requisitos del equipo | Los cinco registrados en el mismo evento local, sin lista de espera | Por confirmar |
| E.10 | Envío | «Submit for Judging» pulsado antes del cierre, con las dos casillas marcadas | ❌ |

## 3. Materiales de presentación

| # | Entregable | Cuenta como hecho cuando… | Estado |
|---|---|---|---|
| 3.1 | Ficha del proyecto | Nombre, equipo, problema, público y propuesta en una página | 🟡 contenido en el informe; sin ficha separada |
| 3.2 | Problema y público con evidencia | Las cifras citan año, ámbito y tabla de origen (MIDAGRI, INEI) | ❌ fuentes identificadas, sin cifras extraídas |
| 3.3 | Uso real de datos espaciales | Se explica qué dato de NASA o de otra agencia se usa, cómo y con qué límites | 🟡 explicado como plan |
| 3.4 | Metodología | Indicadores, reglas y límites científicos explicados | ✅ en el informe (propuesta) |
| 3.5 | Demo reproducible | Cualquiera puede repetir el recorrido con las instrucciones | 🟡 el prototipo se levanta con un comando |
| 3.6 | Manifiesto de demostración | Versión de la app, fecha de corte, productos, métodos, reglas, limitaciones y cómo repetirlo | ❌ |
| 3.7 | Repositorio | Código versionado con licencia definida | ❌ sin git ni licencia |
| 3.8 | Video y respaldo | Grabación del mismo recorrido, por si falla la conexión en vivo | ❌ |
| 3.9 | Guion de la presentación | Pregunta del agricultor → parcela → dato real → agente → registros y descarga → límites | 🟡 guion propuesto en el informe |
| 3.10 | Continuidad | Qué sigue después del evento: piloto, validación y sostenibilidad | ✅ en el informe (propuesta) |

## 4. Documentación

| # | Entregable | Cuenta como hecho cuando… | Estado |
|---|---|---|---|
| 4.1 | Informe maestro | Recoge el estado real (incluido el prototipo), con .md, .tex y .pdf sincronizados | 🟡 v0.4 no recoge el prototipo |
| 4.2 | Documentación de trabajo | `docs/` al día, con estado, decisiones e informes | ✅ |

## Reglas para todo lo que se entregue

- Cada afirmación de la presentación corresponde a una evidencia o se identifica como hipótesis o función futura.
- No se afirma ahorro de agua, aumento de rendimiento, alianza con NASA ni IA entrenada sin evidencia propia.
- **Nada sintético en la demo (DT-16):** todo valor tiene procedencia real o está rotulado como «declarado por el usuario». Lo que no llegue con datos reales no se muestra.
- La demostración se separa de la evolución del producto: no se promete implementar toda la visión.
