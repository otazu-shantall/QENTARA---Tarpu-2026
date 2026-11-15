# 03 · Rediseño visual y landing

> 9 de noviembre de 2026. Decisiones: DT-05 (dirección visual, propuesta) y DT-06 (logo en blanco y negro).

## Alcance del trabajo

Rediseño de landing y dashboard con mayor jerarquía visual, logo monocromo y cinco referencias de composición ([diseno/](../diseno/README.md)).

## Qué quedó hecho

| Pieza | Resultado |
|---|---|
| Logo | Versiones monocromas negra y blanca del logotipo y del símbolo, generadas desde el original. El sol queda integrado |
| Landing nueva (`#/`) | Hero con imagen satelital real de Majes y movimiento lento, franja de fuentes candidatas, tarjetas con imagen, capas de evidencia en 3D con «qué dice / qué no dice», pasos, principios, territorio, llamada a la demo y pie |
| Dashboard | Barra de iconos (navegación inferior en móvil), superficies blancas sobre gris claro, titulares Instrument Serif e interfaz Geist |
| Vista general | Panel de datos a la izquierda; mapa fijo con tarjeta flotante de indicadores rotulados «Demo» |
| Monitor | Panel lateral con pestañas Fuentes y Límites |
| Datos | Etiquetas de color por variable |
| Agente | Panel lateral desde la derecha |
| Estilos | Se eliminaron `global.css` y `glass.css`. Ahora están `tokens`, `base`, `landing`, `app` y `print` |
| `TileMosaic` | Imágenes satelitales estáticas a partir de pocas teselas de Esri, con crédito visible y carga bajo demanda |

## Qué pasó

- **Cifras del hero:** la referencia de landing muestra cifras de impacto («2,3 M ha»). Como TARPU no tiene logros que mostrar, se usaron definiciones del producto: Arequipa, cuatro fuentes candidatas y un agente.
- **Socios:** en vez de logos de socios, va la franja de fuentes rotulada «sin conexión activa».
- **Fallo previo de Leaflet:** al cambiar a «Mapa de calles» y luego acercar el zoom, el mapa se rompía. La causa: `tiles.off()` se ejecutaba antes de `removeLayer` y borraba el listener con el que Leaflet desregistra sus eventos. Venía del 27/10 y lo destapó la **primera ejecución real** de la suite Playwright. Ahora se retira primero la capa.
- **Imagen del hero:** una regla de `map.css` dejaba la imagen con altura cero. Se corrigió con más especificidad.
- **Aparición al hacer scroll:** dependía de `IntersectionObserver`, que no se activaba con desplazamientos rápidos. Ahora se comprueba la posición en cada scroll.
- **Ajustes menores:**
  - el informe imprimible usa nombres legibles en vez de ids internos;
  - la campana ya no muestra un aviso falso;
  - las miniaturas de parcela usan zoom 14;
  - el gráfico de clima va junto a las tarjetas.

## Qué quedó comprobado

- TypeScript, compilación y 8 pruebas de lógica.
- `npm run test:ui` **completo, por primera vez**: landing, mapa, error de teselas, agente, descarga JSON, persistencia y 8 vistas móviles sin desborde.
- Revisión visual de la landing y las siete vistas a 1440 px y 375 px.

## Lo que falta

- La validación de la dirección visual (DT-05) y de la identidad (SUP-013).
- Pruebas en teléfonos reales y con usuarios.
- Pendientes del prototipo que no se tocaron:
  - las series del gráfico no coinciden con los registros;
  - las parcelas locales reciben valores de ejemplo;
  - los botones de zona cambian la parcela seleccionada.
