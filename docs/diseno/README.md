# Diseño

> 09/11/2026 · Dirección **DT-05, propuesta**: «mapa protagonista» para el dashboard y «landing editorial». Composición basada en cinco referencias visuales. La identidad visual sigue sin aprobar (SUP-013).

**Capturas del diseño actual:** [capturas/](capturas/)

**Diseño del frontend · 14/11/2026 (DT-25):** [guía de diseño y arquitectura del frontend](guia-frontend.md). Web para computadora en `frontend/`: inicio/acceso, sidebar, delimitación, históricos y datos avanzados. Chat y voz son iniciales, con burbujas de estado; el avatar humano va después. Las variantes clara y oscura ya se pueden recorrer en el nuevo prototipo; la elección sigue abierta. Arquitectura y ejecución: [frontend/README.md](../../plataforma/frontend/README.md). La guía reúne seis capturas y las cinco referencias guardadas que se revisaron visualmente. Los valores y capturas de esta página describen el prototipo existente, no el diseño final.

- [landing en escritorio](capturas/landing-escritorio.png) y [en móvil](capturas/landing-movil.png);
- [vista general en escritorio](capturas/vista-general-escritorio.png) y [en móvil](capturas/vista-general-movil.png);
- [datos](capturas/datos-escritorio.png) y [agente](capturas/agente.png).

## Referencias de composición

| # | Referencia | Aporte al diseño | Dónde se aplica |
|---|---|---|---|
| 1 | [ref-1-mapa-con-panel-izquierdo](referencias/ref-1-mapa-con-panel-izquierdo.webp) | Panel de datos a la izquierda, mapa satelital grande, tarjeta flotante con lecturas y caja oscura de «Insights» | **Vista general**: panel, mapa fijo y tarjeta flotante de la parcela |
| 2 | [ref-2-zona-con-panel-derecho](referencias/ref-2-zona-con-panel-derecho.webp) | Panel lateral derecho con pestañas, lista en árbol y tabla con etiquetas de color | **Monitor** (pestañas Fuentes/Límites con árbol) y **Explorar datos** (etiquetas por variable) |
| 3 | [ref-3-alerta-sobre-mapa](referencias/ref-3-alerta-sobre-mapa.webp) | Controles del mapa en columna, tarjeta flotante sobre el mapa, barra de iconos estrecha | Columna de controles (capas, zoom, recentrar) y **barra de iconos** |
| 4 | [ref-4-seleccion-de-parcelas](referencias/ref-4-seleccion-de-parcelas.webp) | Sobriedad: blanco, verde como acento, barra de iconos con etiqueta debajo | Barra lateral con icono y nombre corto; botones verdes y negros |
| 5 | [ref-5-landing-editorial](referencias/ref-5-landing-editorial.webp) | Titular serif grande sobre una foto aérea, navegación en píldora, cifras en tarjetas, franja de nombres y tarjetas con imagen | **Landing** completa |

**No se tomaron** de las referencias:

- predicciones de producción («12 % production increase»);
- recomendaciones del tipo «Keep soil moisture…»;
- mapas de color sobre parcelas ajenas;
- cifras de impacto y logos de socios.

Contradicen los límites científicos de TARPU o serían datos inventados.

## Sistema visual

| Elemento | Valor |
|---|---|
| Logo | **Blanco y negro** (DT-06): `frontend/public/brand/tarpu-logo-black.png` y `-white.png` (logotipo), `tarpu-mark-black.png` y `-white.png` (símbolo). El sol queda integrado. El original a color solo aparece en la referencia de branding |
| Fondo de la app | `#F2F2EF` (gris cálido). Tarjetas y barra lateral en blanco |
| Texto | `#111311` principal · `#4B504C` secundario · `#868B85` tenue |
| Acción principal | Negro `#111311` en botón píldora |
| Acentos de marca | Verde `#2E7D4F` · verde claro `#A4C183` · sol `#F4B23E` · bosque `#1F4D2E` |
| Lo que hace el agente | Chip verde claro «✦ Tarpu» y cajas negras con texto claro |
| Etiqueta de demostración | Píldora ámbar (`#FDF1DA` sobre `#7A4F08`): «Demostración» y «Demo» |
| Tipografía | **Instrument Serif** en titulares de página y de landing · **Geist** en la interfaz |
| Radios | Tarjetas 22 px · controles 12 px · píldoras completas |
| Sombras | Mínimas en tarjetas; grandes solo en lo que flota (tarjetas del mapa, diálogos) |
| Móvil | La barra de iconos pasa a navegación inferior. El resumen textual va antes del mapa |

La paleta vigente vive en `frontend/src/styles/polish.css`, sobre los tokens base de `frontend/src/styles/tokens.css`. Los valores de las capturas antiguas son antecedentes.

## Movimiento

| Momento | Animación |
|---|---|
| Hero de la landing | La imagen satelital se acerca lentamente, una línea de escaneo la recorre y una retícula marca Majes |
| Titulares y secciones | Suben y aparecen al entrar en pantalla |
| Fuentes candidatas | Franja en movimiento continuo; se pausa al pasar el ratón |
| Capas de evidencia | Pila 3D que avanza sola hasta que el visitante elige una capa |
| Cambio de vista | La página entra con un desplazamiento corto |
| Agente | Panel lateral que entra desde la derecha |
| Accesibilidad | Con `prefers-reduced-motion` se desactivan las animaciones |

## Pendiente de este diseño

- La validación de la dirección (DT-05) y de la identidad visual (SUP-013).
- Pruebas de legibilidad en computadora y con agricultores para la propuesta actual (DT-25). Las capturas móviles conservadas pertenecen al prototipo anterior.
- Diseñar las pantallas de lo que aún no existe: dibujar la parcela, registrar el historial, la capa de vegetación y la comparación con reglas.
