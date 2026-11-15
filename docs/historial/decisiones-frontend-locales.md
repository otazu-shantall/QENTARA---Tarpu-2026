# Registro local de frontend anterior a la integración

Estos identificadores se usaron en el trabajo local sin sincronizar y coinciden con decisiones distintas del equipo. Se conservan como antecedente; no sustituyen DT-13 a DT-24 de [docs/06](../06-decisiones-y-riesgos.md). El registro vigente usa DT-25 para la ubicación y alcance del frontend.

### DT-13 · Recorrido y diseño del frontend
**Definido · 14/11/2026; actualizado parcialmente por DT-14.**

- Inicio con imagen del campo, frase introductoria y «Descubre» hacia registro/inicio de sesión.
- Sidebar izquierda, ubicación actual con permiso y delimitación editable de parcelas.
- Evidencia e historial comprensibles; datos avanzados como acceso secundario con retorno claro.
- Variantes clara y oscura pendientes de comparación. Identidad visual y lema siguen abiertos (SUP-013).
- Arquitectura y herramientas de la [guía](../diseno/guia-frontend.md) como propuestas; método de acceso, fuentes y contrato pendientes de integración.
- Escenarios condicionados diferenciados de pronósticos; se mantiene SUP-037 y los límites científicos.

El alcance inicial del asistente se actualiza en DT-14. DT-05 conserva el antecedente visual del prototipo y DT-10 su condición de referencia.

### DT-14 · Web para computadora y asistente por chat y voz
**Definido · 14/11/2026.**

- `frontend/` es el destino del nuevo desarrollo; `Codigo/` conserva el prototipo de referencia.
- Web para computadora con sidebar izquierda, ratón y teclado. Sustituye la prioridad de teléfono para este frontend; otras plataformas conservan su orientación futura.
- Asistente inicial con chat escrito y conversación por voz. Burbujas de estado durante escucha, procesamiento y reproducción de la respuesta.
- Avatar humano animado como ampliación posterior, manteniendo la misma conversación, voz y evidencia.
- Recursos visuales en `docs/diseno/referencias/` y logo en `Codigo/public/brand/`.

La [guía](../diseno/guia-frontend.md) y la [propuesta](../areas/propuesta-frontend.md) desarrollan estas definiciones. Proveedores, contrato y pantallas definitivas siguen pendientes.

### DT-15 · Base modular y primer prototipo del nuevo frontend
**Implementada en el prototipo del área de frontend · 14/11/2026.** Alcance técnico local, sin elección definitiva del stack del producto ni de identidad visual.

- Desarrollo independiente en `frontend/`: React, TypeScript y Vite, React Router, TanStack Query y Zod; Leaflet encapsulado, CSS con tokens y dos temas comparables.
- Funcionalidades, lógica de geometría/evidencia y contratos de servicios separados. Adaptadores locales sustituibles al acordar la API; sin añadir backend o infraestructura.
- Muestra histórica real de POWER para Majes empaquetada desde `datos/`, sin cambios a los originales. Las parcelas nuevas quedan sin indicadores asociados.
- Chat guiado y voz del navegador con burbujas. Acceso local de demostración; autenticación, modelo, capas científicas y avatar pendientes.

Registro técnico: [informe 09](../informes/09-arquitectura-y-prototipo-frontend.md) y [frontend/README.md](../../frontend/README.md). DT-02 conserva su alcance sobre el prototipo anterior; SUP-015 y SUP-013 siguen abiertos. La reunión de unión del equipo no se da por celebrada.

### DT-16 · Estudio técnico y conversación en el frontend de escritorio
**Definida en frontend · 14/11/2026 · Área: frontend (Shantall).**

- Estudio técnico separado para análisis especializado: series completas, diccionario, procedencia y descargas CSV/JSON/GeoJSON del alcance disponible.
- Múltiples parcelas, historial por día/semana/mes y lectura comprensible de variables; escenarios sintéticos rotulados para explorar la interfaz.
- Conversación de voz con burbujas y continuidad sin enviar cada dictado. El prototipo usa turnos automáticos; la IA remota y el avatar siguen pendientes.
- Selección de proveedor como preferencia; autorización y consumo de la cuenta quedan por integrar según condiciones de cada servicio. Sin precio aprobado.
- Catálogo por hortalizas, legumbres, frutas y flores, con referencias y faltantes, sin motor ni clasificación por coordenadas.
- Inicio panorámico, presentación de QENTARA y formularios de acceso. Autenticación y guardado de credenciales por el navegador no se dan por integrados.

Implementación y pruebas: [informe 10](../informes/10-estudio-tecnico-y-conversacion.md). No cierra supuestos de aptitud agronómica, proveedores o cobertura.

### DT-17 · Vidrio y jerarquía visual del frontend
**Implementada como iteración del prototipo · 14/11/2026 · Área: frontend (Shantall).**

- Cabecera pública fija con vidrio y sidebar transparente con paletas clara y oscura.
- Títulos contenidos, lectura más grande y barras de desplazamiento ocultas con desplazamiento operativo.
- Capas ilustrativas recortadas al contorno de ejemplos, con leyenda y origen visibles; fuentes científicas siguen sin conectar.
- Mayor prioridad primero en el catálogo de ejemplo, sin evaluación ficticia de parcelas reales.
- Gráficos de área, líneas y barras en ambas vías de consulta; color por variable y faltantes conservados.

No cierra la identidad visual ni valida aptitud o métodos científicos. Implementación: [informe 11](../informes/11-vidrio-capas-y-graficos.md).
