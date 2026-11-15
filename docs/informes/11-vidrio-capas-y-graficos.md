# Vidrio, capas de parcela y gráficos

> Informe del trabajo local anterior a la integración. Sus referencias DT-13 a DT-17 pertenecen al [registro local archivado](../historial/decisiones-frontend-locales.md); la numeración vigente del equipo y DT-25 están en [docs/06](../06-decisiones-y-riesgos.md).


**Fecha:** 14/11/2026. **Área:** frontend y experiencia de usuario.

## Interfaz

Cabecera pública flotante con transparencia, desenfoque y borde tenue. Permanece fija al desplazarse y conserva acceso al inicio de sesión. Las secciones tienen compensación de desplazamiento para que la cabecera no cubra sus títulos.

Sidebar con vidrio y colores independientes para tema claro y oscuro. La variante clara utiliza superficies menta y texto oscuro; la oscura combina fondos azul petróleo con acentos verdes. Se ajustaron contraste, navegación activa, logo y controles.

Los títulos del espacio de trabajo se contienen y el cuerpo, navegación, formularios y texto de tarjetas aumentan de tamaño. Las barras de desplazamiento se ocultan globalmente; el desplazamiento sigue habilitado. Las tablas extensas admiten foco por teclado.

## Parcelas y recomendaciones

Las parcelas de ejemplo muestran capas de calor, humedad del suelo y vegetación, además del mapa base. Cada patrón se recorta al contorno y tiene su paleta y leyenda. El historial de ejemplo vincula su variable a una capa apropiada; lluvia, humedad del aire y radiación no se interpretan como mapas de humedad del suelo.

Los patrones espaciales son ficticios y fijos, generados para explorar la presentación; no se calculan a partir de la muestra regional de POWER. No son mediciones satelitales, no cambian con la agrupación temporal y no aparecen en parcelas reales o declaradas. Esos productos siguen pendientes de integración.

El catálogo presenta mayor prioridad primero y destaca la primera alternativa en los escenarios de ejemplo. El orden cambia entre Los Olivos y El Molino y se conserva al filtrar por categoría. No se asigna prioridad a parcelas reales o declaradas sin evaluación. El orden de ejemplo no es un puntaje de aptitud ni una recomendación validada.

## Gráficos

Las vistas sencilla y técnica comparten gráficos con color por variable y selector de área, líneas o barras. La lluvia y radiación utilizan barras en modo automático; las tendencias de temperatura, humedad y vegetación usan líneas o áreas. Se conservan registros, agregaciones, unidades y huecos de información.

Los resúmenes describen los intervalos representados, sin confundirlos con extremos de todas las observaciones originales. Los datos detallados y sus descargas mantienen su procedencia.

## Verificación

- Compilación TypeScript/Vite correcta y once pruebas de dominio: incluyen aislamiento de capas sintéticas, recorte y prioridad de ejemplo.
- Recorrido Chrome de escritorio: cabecera fija al desplazarse, vidrio, tamaños de letra, cambio de capas y temas, prioridad por parcela, gráficos de área/líneas/barras, exportaciones y conversación.
- Tres anchos de escritorio y desplazamiento conservado con barras ocultas; sin errores de JavaScript en el recorrido.
- Revisión visual de inicio, temas claro/oscuro y mapa de ejemplo. Capturas en `frontend/test-results/`.

La identidad visual, la accesibilidad con usuarios y las integraciones de datos y evaluación continúan abiertas. Este trabajo no modifica backend, scripts de datos, el prototipo anterior ni el informe maestro.
