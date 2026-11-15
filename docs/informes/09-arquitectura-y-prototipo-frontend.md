# Arquitectura y primer prototipo del nuevo frontend

> Informe del trabajo local anterior a la integración. Sus referencias DT-13 a DT-17 pertenecen al [registro local archivado](../historial/decisiones-frontend-locales.md); la numeración vigente del equipo y DT-25 están en [docs/06](../06-decisiones-y-riesgos.md).


**Fecha:** 14/11/2026. **Área:** frontend y experiencia de usuario.

## Resultado

Base modular de escritorio en `frontend/`, independiente del prototipo de referencia de `Codigo/`. El recorrido incluye inicio, acceso de demostración, sidebar izquierda, mapa y editor de parcelas, historial, datos avanzados, opciones de cultivo ilustrativas, resúmenes y asistente. Los temas claro y oscuro se pueden alternar para comparar; ninguno representa una identidad visual aprobada.

React, TypeScript y Vite componen la SPA. React Router administra las rutas; TanStack Query la evidencia; Zod la validación. Leaflet se encapsula en el componente del mapa; la geometría, los resúmenes y las descargas se separan de la presentación. Los contratos `EvidenceRepository` y `AssistantService` aíslan los adaptadores locales para una integración posterior. Arquitectura y comandos: [frontend/README.md](../../frontend/README.md).

## Datos y funcionamiento

- Muestra real de NASA POWER: 365 observaciones diarias de Majes en 2025, empaquetadas desde el CSV normalizado existente. Valores, faltantes y procedencia conservados; originales de `datos/` sin cambios.
- Mapas Esri/OSM y geolocalización tras acción explícita. Contorno con puntos, cierre, edición por arrastre y área aproximada; validación de cruces, puntos repetidos, colinealidad y superficie degenerada.
- Parcelas nuevas guardadas localmente, sin heredar datos de la zona de referencia.
- Historial y consulta avanzada calculados sobre los mismos registros. JSON con metadatos; CSV tabular con fuente y unidades. Resúmenes locales descargables; PDF pendiente.
- Chat con respuestas guiadas y enlace a evidencia. Dictado y síntesis del navegador con parada, errores y alternativa escrita. Burbujas para estados de escucha, preparación y reproducción. No hay un modelo de IA ni avatar humano conectado.

## Comprobaciones

| Comprobación | Resultado |
|---|---|
| TypeScript estricto y build Vite | Correctos |
| Seis pruebas de dominio | Correctas: contornos, área/GeoJSON, faltantes, ventanas temporales, aislamiento de parcelas y límites del asistente |
| Recorrido Chrome | Inicio, acceso, temas, mapa, chat, descarga de selección, contorno, guardado y persistencia correctos; sin errores de JavaScript |
| Teclado | Salto al contenido sin alterar ruta; creación de puntos desde el centro del mapa disponible |
| Voz con dobles de Web Speech | Escucha, transcripción, reproducción, parada y permiso denegado correctos; sin grabar audio real |
| Anchos de escritorio | 1280, 1440 y 1920 px, sin desborde horizontal en el recorrido probado |
| Revisión visual | Inicio, espacio claro/oscuro y panel del asistente; capturas en `frontend/test-results/` |

Las pruebas detectaron un contorno colineal que podía producir una superficie numérica residual; se añadió una comprobación explícita. Se corrigió también el salto al contenido para conservar la ruta hash. La revisión en vivo detectó una pérdida del contexto durante el refresco de módulos; se separó la identidad del contexto del componente proveedor. Los 365 registros y sus cinco variables se contrastaron con el CSV original sin diferencias. Estas comprobaciones no acreditan validación agronómica ni una auditoría completa de accesibilidad.

## Pendiente

Autenticación, API, reglas agronómicas, capas científicas y modelo de IA siguen sin conectar. Una conversación con micrófono físico y audio real aún debe verificarse en el navegador de uso. La selección visual, las pruebas con agricultores, el PDF y la versión en inglés siguen abiertos. La muestra regional no se convierte en un diagnóstico ni en un pronóstico al dibujar una parcela.

La fase del equipo continúa según la bitácora; este prototipo del área no acredita que se haya celebrado la reunión de unión.
