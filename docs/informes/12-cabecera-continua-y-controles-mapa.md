# Cabecera continua y controles del mapa

**Fecha:** 15/11/2026. **Área:** frontend y experiencia de usuario.

La cabecera pública ocupa todo el ancho, pegada al borde superior, con transparencia mayor y desenfoque. Conserva su posición fija durante el desplazamiento y deja de presentarse como una tarjeta flotante con esquinas redondeadas.

La navegación por secciones elimina la doble compensación de desplazamiento. La sección de QENTARA dispone de espacio para ocupar la vista, evitando que el límite inferior del documento deje visible contenido anterior al navegar a «Equipo».

En el mapa de Historial, los controles se distribuyen en una columna izquierda y la leyenda permanece abajo a la derecha. El menú de capas se abre junto a los controles. Las dimensiones del mapa y la composición junto al gráfico se conservan.

**Verificación:** compilación TypeScript/Vite y recorrido Chrome correctos. Se comprobaron cabecera de ancho completo en tres tamaños de escritorio, alineación de Equipo, separación entre leyenda y controles, y funcionamiento de acercar/alejar. Revisión visual del inicio y de la sección Equipo; capturas en `frontend/test-results/`.

Los datos, las capas ilustrativas y las integraciones conservan su estado anterior. Este ajuste afecta a presentación y navegación del frontend.
