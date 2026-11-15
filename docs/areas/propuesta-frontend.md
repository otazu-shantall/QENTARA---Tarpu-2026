# Propuesta del área de frontend y experiencia de usuario

> Responsable: **Shantall**. Borrador del **14/11/2026**. Alcance (DT-25): web para computadora, chat y voz iniciales, burbujas de estado y avatar posterior. Propuesta de fase 1 para la reunión de unión; las pantallas y el contrato no están acordados por el equipo. Base: [frontend.md](frontend.md) y [guía de diseño y arquitectura](../diseno/guia-frontend.md). `frontend/` contiene el primer prototipo interactivo del área ([arquitectura](../../frontend/README.md)); `Codigo/` es la referencia anterior conservada en Git. Esto no cierra el contrato con el equipo.

## 1. Para quién diseño

- Usuario principal: agricultor de Arequipa que quiere comprender su parcela y comparar alternativas; atención a personas mayores y poca experiencia digital.
- Dificultad a resolver: interpretar datos técnicos y encontrar una acción clara entre muchas opciones. Es una hipótesis de diseño, no un resultado de entrevistas.
- Dispositivo: computadora, con ratón, teclado y micrófono para la conversación por voz; pantallas y conectividad reales por comprobar.

## 2. Recorrido del agricultor

| Paso | Pantalla | Pregunta que responde | Botón principal |
|---|---|---|---|
| 1 | Inicio público y acceso | ¿Para qué sirve y cómo entro? | Descubre → Crear cuenta / Iniciar sesión |
| 2 | Mi campo y delimitación | ¿Dónde está y qué terreno consulto? | Usar mi ubicación / Marcar mi parcela |
| 3 | Contexto y evidencia | ¿Qué sabemos del campo y su manejo? | Completar contexto / Ver historial |
| 4 | Comparar rotaciones | ¿Qué puedo considerar después? (actual y dos alternativas como mínimo) | Comparar opciones |
| 5 | Pregunta a Tarpu por chat o voz | ¿Qué significa este dato o esta opción? | Escribir / Hablar / Ver evidencia |
| 6 | Informes y datos avanzados | ¿Cómo guardo o reviso el detalle? | Guardar resumen / Descargar selección |

Sidebar propuesta de computadora: Mi campo, Historial, Opciones de cultivo y Mis informes; datos avanzados, ayuda y cuenta en jerarquía secundaria. Panel y mapa aprovechan el ancho disponible; teléfono queda fuera del enfoque actual. Datos detallados también es accesible desde la evidencia, sin ejecutar el motor.

## 3. Bocetos

Los [bocetos de estructura](../diseno/guia-frontend.md#4-recorrido-y-pantallas) cubren inicio, escritorio y panel del asistente con burbujas. Las seis capturas de diseño y las cinco referencias guardadas orientan la composición, sin copiar marcas o resultados. Se mantienen abiertas las variantes clara y oscura para compararlas; ambas variantes ya están implementadas y se revisaron en escritorio; faltan pruebas con usuarios y elección del tema.

## 4. Reglas de accesibilidad que aplico

- Tamaño de letra: propuesta de cuerpo de 18 px; contenido mínimo de 16 px y ampliable.
- Contraste: mínimo 4,5:1 en texto normal; comprobar sobre imagen, foco, capas y ambos temas.
- Botones: área táctil de al menos 48 px; separación y etiqueta visible.
- Lenguaje: «Lluvia» antes de precipitación; «Verdor observado» junto a NDVI; humedad del aire y del suelo diferenciadas. No usar «fertilidad» como traducción de NDVI.
- Una pregunta y una acción principal por pantalla; teclado, lector de pantalla, movimiento reducido y alternativa manual a geolocalización.

## 5. Idioma

- Interfaz: español para el agricultor; estrategia técnica de traducción por definir.
- Entrega: versión en inglés del material que se envíe. Confirmar con Derecho la solución para la interfaz enlazada; no dar por suficiente un README traducido o subtítulos para todo el proyecto.

## 6. Datos que necesita cada pantalla (para Erick)

| Pantalla | Dato | De qué fuente |
|---|---|---|
| Acceso | Sesión, expiración, errores y recuperación | Backend; método por acordar |
| Mi campo | Parcelas autorizadas, geometría/versiones, superficie y contexto | Backend e información del productor |
| Mapa/evidencia | Indicadores, capa, fecha, unidad, escala, calidad, cobertura y faltantes | Datos → backend; POWER ya tiene muestra, otras fuentes por elegir |
| Historial | Observaciones, eventos con método y notas del agricultor diferenciadas | Datos/backend y productor |
| Comparación | Actual + alternativas, motivos, evidencia, riesgos, faltantes y reglas versionadas | Motor de Erick; necesita reglas y contexto revisados |
| Chat | Contexto autorizado, texto, referencias y estado por turno | Agente del backend; proveedor abierto |
| Voz y burbujas | Transcripción, respuesta hablada y estado del mismo turno | Entrada por micrófono y servicios por acordar con Erick |
| Datos avanzados/informes | Registros, niveles, selección, metadatos y copia de resultados | Misma consulta que resumen/gráfico; exportación con permisos |

La [matriz ampliada](../diseno/guia-frontend.md#11-matriz-para-acordar-con-erick-y-damaris) incluye estados de fallo. No se fijan rutas nuevas unilateralmente.

## 7. Qué reutilizo del prototipo y qué cambio

- Tomar React, TypeScript, Vite, funcionalidades, logo monocromo, Leaflet, Lucide, exportaciones y pruebas existentes como referencia para `frontend/`. La base modular ya está implementada con React Router, TanStack Query, Zod y adaptadores locales; ver [informe 09](../informes/09-arquitectura-y-prototipo-frontend.md).
- Revisar sidebar, tamaño de controles, jerarquía, contexto compartido y rutas. Nuevas dependencias son recomendaciones, no adopciones aprobadas.
- Separar entidades de parcela, contexto, observación y evaluación; quitar valores ficticios por defecto cuando se implemente el registro real.
- Unificar datos de resumen/gráfico/tabla/descarga; separar navegación por zonas de selección de parcela.
- Incluir chat y conversación por voz desde el inicio, con burbujas que distinguen escucha, preparación y respuesta hablada. La imagen humana con labios sincronizados se incorpora después; la voz no se pospone junto al avatar.

## 8. Riesgos y dudas

- Históricos no son pronósticos. Escenarios condicionados pueden compararse con reglas; pronósticos requieren otra fuente/modelo y validación, sin cambiar SUP-037 por esta propuesta.
- Arequipa necesita contexto local: no aplicar una receta única a costa y sierra; cultivos candidatos por revisar.
- Elegir tema después de comparar ambas variantes; apariencia y voz del avatar quedan abiertas.
- Acordar método de acceso, contrato, fuentes disponibles, eventos respaldados y criterios de no evaluable con Erick/Damaris.
- Validar entrada secundaria a datos avanzados sin ocultar evidencia ni tratarla como control de permisos.
- Faltan comparación visual de alta fidelidad y pruebas con agricultores; guía y bocetos textuales no sustituyen esas comprobaciones.
