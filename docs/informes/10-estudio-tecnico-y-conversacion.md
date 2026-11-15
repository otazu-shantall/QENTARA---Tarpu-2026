# Estudio técnico, conversación y ampliación del frontend

> Informe del trabajo local anterior a la integración. Sus referencias DT-13 a DT-17 pertenecen al [registro local archivado](../historial/decisiones-frontend-locales.md); la numeración vigente del equipo y DT-25 están en [docs/06](../06-decisiones-y-riesgos.md).


**Fecha:** 14/11/2026. **Área:** frontend y experiencia de usuario.

## Resultado

El inicio tiene una cabecera compacta, imagen de lado a lado y acción «Descubre» dentro de la primera vista de escritorio. La sección de QENTARA presenta al equipo y sus cuatro áreas sin atribuir resultados de campo ni alianzas.

El acceso incorpora nombres, apellidos, DNI opcional, correo, usuario y contraseña con confirmación. El inicio de sesión muestra usuario y contraseña. Los caracteres se ocultan y los campos permiten autocompletado; el prototipo no autentica ni guarda contraseñas o DNI. El Administrador de contraseñas de Google depende del navegador y de la futura integración real del acceso.

## Parcelas, historial y estudio

- Dos parcelas de ejemplo con contornos y datos sintéticos permiten visualizar más estados; se distinguen de la muestra real de POWER y de las parcelas declaradas sin datos. La parcela seleccionada se conserva localmente.
- Lectura sencilla de frío, calor, agua en el suelo y falta de agua, sin convertir índices aislados en diagnósticos.
- Historial por día, semana o mes y rango de fechas; medias válidas y suma de lluvia. Los eventos de los ejemplos llevan rótulo de ficticios. La agrupación no simula una frecuencia de actualización satelital.
- Estudio técnico separado: series, nueve variables representables, registros completos, diccionario, fuente/calidad y exportación. POWER aporta sus seis variables disponibles, incluida radiación solar; suelo, NDVI y temperatura superficial solo tienen valores sintéticos.
- CSV con unidades/origen, JSON con registros y manifiesto, y GeoJSON del contorno. La descarga conserva la selección y distingue proveedor, sintético y declaración. No se exportan teselas ni rásteres inexistentes.

## Catálogo y voz

Ocho fichas por hortalizas, legumbres, frutas y flores; consulta de condiciones y comparación con el cultivo actual. Las referencias regionales de MIDAGRI/SENAMHI y la guía general de SENASA se enlazan en las fichas. Las propuestas sin fuente regional conservan su condición de ejemplo. No hay selección de aptitud por clima, altitud o coordenadas ni motor de recomendación. Las pautas de preparación revisan suelo, agua e historial sin prescribir dosis.

La conversación tiene una sala propia con aura y burbujas, inicio, pausa/reanudación, finalización y subtítulos opcionales de respuesta. La prueba encadena entrada de voz, respuesta guiada, reproducción y nueva escucha automática; no exige enviar cada dictado. Es una prueba por turnos del navegador, sin streaming bidireccional ni interrupción natural por voz. El avatar humano permanece pendiente.

El selector OpenAI/Gemini/Claude guarda una preferencia y muestra la cuenta sin vincular. No inicia autorización, consulta saldos ni cobra. Las suscripciones de chat y las API tienen condiciones distintas; los créditos eventualmente vinculables requieren verificar la elegibilidad. No se establece un precio ni un plan de TARPU.

## Comprobaciones y límites

Build de TypeScript/Vite y nueve pruebas de dominio correctos. El recorrido Chrome comprueba CTA visible en 1280×768, 1440×900 y 1920×1080, registro sin persistir secretos, selección de parcelas, agrupaciones, exportación, catálogo, proveedor, voz simulada y cuatro vistas en tres anchos. La sala se revisó también en la vista previa local sin activar un micrófono real.

Se corrigió un error de Leaflet al desmontar el mapa durante cambios de parcela: se cancelan animaciones y se comprueba que el observador pertenece a la instancia activa. El cambio de ruta restablece la posición antes de pintar la nueva vista.

Siguen pendientes micrófono/altavoz reales, autenticación, voz de IA remota, acceso autorizado a proveedores, consultas por parcela, capas científicas, evaluación agronómica, PDF y pruebas con agricultores. No se modificaron backend, scripts de datos ni el prototipo de `Codigo/`.

Arquitectura, fuentes y límites detallados: [frontend/README.md](../../frontend/README.md). Capturas locales: `frontend/test-results/`.
