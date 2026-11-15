# Visión y alcance

> Resumen del apartado 01 del [informe maestro](../plataforma/documentacion/informe-maestro/TARPU_Documentacion_Maestra.md#01-identidad-visión-y-fundamentos). Los textos marcados como **confirmados** fueron aceptados por el usuario (DEC-001 a DEC-008) y se copian sin cambios. Para cambiarlos hace falta una decisión nueva.

## Qué es

**TARPU** es el producto: una plataforma de apoyo a decisiones agrícolas. **QENTARA** es el equipo que lo desarrolla. No son nombres intercambiables.

**Descripción breve (confirmada).** TARPU ayuda a los agricultores a comprender las condiciones de sus parcelas y comparar alternativas de cultivo y rotación. Combina datos ambientales, información satelital e historial agrícola para presentar indicadores y explicaciones trazables, con una experiencia accesible, un agente integrado y límites científicos visibles. Es una iniciativa del equipo QENTARA.

El proyecto nace en el contexto de NASA Space Apps Challenge 2026 y se quiere fundamentar para que continúe después. El desafío exacto y los requisitos oficiales no están verificados (SUP-035).

## Misión, visión y valores (confirmados)

**Misión:** transformar información ambiental y agronómica en explicaciones accesibles que ayuden a los agricultores a comprender sus parcelas y evaluar alternativas de campaña.

**Visión:** consolidar una herramienta confiable y accesible que permita a los agricultores comprender sus parcelas y tomar decisiones informadas con datos ambientales y conocimiento agronómico contextualizado. Se busca pulir la experiencia y la calidad del análisis en Arequipa y Perú, y ampliar su utilidad a otros territorios cuando sus datos, reglas y experiencia de uso hayan sido validados localmente.

**Valores, como conductas observables:**

| Valor | Qué significa en la práctica |
|---|---|
| Rigor | Conservar fórmulas y versiones |
| Transparencia | Mostrar datos faltantes y procedencia |
| Accesibilidad | La tarea principal se completa sin interpretar un mapa técnico |
| Utilidad local | Revisar reglas con especialistas del territorio |
| Respeto por los datos | Controlar quién puede consultar o compartir una parcela |

## Problema (confirmado)

Es difícil convertir información ambiental dispersa en criterios comprensibles para planificar una campaña. Hay cuatro causas propuestas:

- información repartida en servicios separados;
- diferencias de escala y lenguaje técnico;
- historial agrícola incompleto;
- asesoramiento o tiempo insuficientes.

La magnitud del problema en Arequipa **todavía no está medida**. Las fuentes para medirla son MIDAGRI e INEI.

## Para quién

- **Usuario principal: el propio agricultor.** Debe poder entender los resultados y decidir sin que un asesor le traduzca los datos obligatoriamente (DEC-002).
- **Usuarios de datos detallados:** el agricultor o cualquier persona autorizada que quiera más profundidad técnica (DEC-003).
- **Especialistas agronómicos:** revisan métodos y reglas. Validan, pero no son intermediarios obligatorios.

Segmentos, personas y entrevistas siguen siendo hipótesis por contrastar (SUP-005, SUP-006).

## Territorio (confirmado)

- **Alcance inicial:** todo Arequipa, con especial atención a la calidad del análisis en Perú (DEC-001).
- **Muestras:** las entrevistas y pruebas pueden usar localidades concretas, pero eso no reduce el alcance del producto.
- **Otros territorios:** posibles cuando los datos y las reglas lo permitan. Es una orientación, no una cobertura validada.

## Qué hace TARPU

| Capacidad | Estado |
|---|---|
| Describir una parcela con su historial | Confirmada como producto; sin implementar |
| Indicadores trazables de clima, vegetación y suelo | Confirmada; fuentes por seleccionar (SUP-016) |
| Comparar alternativas de cultivo y rotación con reglas explícitas | Confirmada; reglas por revisar (SUP-018) |
| **Agente integrado** para preguntar por datos, motivos y límites | Confirmada (DEC-002); proveedor y modelo abiertos (SUP-034) |
| **Datos detallados** sin pasar por el motor agronómico | Confirmada (DEC-003) |
| **Exportación** reutilizable y reportes legibles (PDF) | Confirmada (DEC-003); formatos por definir (SUP-021) |

El agente, el motor agronómico y la consulta de datos son **responsabilidades distintas**:

- **El agente** explica la evidencia disponible.
- **El motor** evalúa con reglas explícitas.
- **La consulta de datos** nunca exige ejecutar una recomendación.

## Qué queda fuera de la primera aceptación

Predicción de rendimiento, rentabilidad específica, prescripción de fertilización, control o dosis de riego, diagnóstico de plagas, pronóstico de heladas a nivel de planta y fechas precisas de siembra (SUP-037). Todo eso exigiría entradas y validaciones adicionales.

## Límites científicos que siempre se respetan

- Un dato regional no se vuelve preciso a escala de parcela por dibujar un polígono.
- El NDVI no demuestra fertilidad.
- La humedad estimada no equivale a un análisis de suelo.
- Un histórico no es un pronóstico.
- Un puntaje experimental no es una probabilidad de éxito.
- Si falta información, el resultado es **no evaluable** y se explica qué falta.
