# 02 · Mapa real, logo y glasmorfismo

> 27 de octubre de 2026. Reconstruido a partir de lo registrado en `AGENTS.md` y `Codigo/README.md`.

## Alcance del trabajo

- Reducir el logo.
- Usar más glasmorfismo.
- Sustituir el mapa artificial por uno real.

## Qué quedó hecho

- **Mapa real con Leaflet 1.9.4:**
  - mapas base Esri World Imagery (satélite) y OpenStreetMap (calles), cargados en vivo con créditos visibles;
  - los créditos de Esri se ajustan a la zona y al zoom cuando su servicio responde.
- **Zonas de referencia:** La Joya, Majes y Camaná, como centros aproximados para navegar. **No son coordenadas ni límites de parcelas.**
- **Se retiraron** los polígonos inventados y la falsa capa NDVI del SVG. Las fichas nuevas muestran «ubicación pendiente».
- **Estados del mapa:** carga, error parcial, error total, reintento y cambio de proveedor.
- **Interacción:** la rueda del ratón no captura el scroll de la página.
- **Logo lateral:** pasó de 214 a 178 px.
- **Glasmorfismo:** superficies translúcidas concentradas en `glass.css`. Se retiró en el trabajo 03.

## Qué quedó comprobado

- Respuesta HTTP 200 de una tesela de Esri y otra de OpenStreetMap.
- Metadatos y créditos de Esri.
- TypeScript, compilación y 8 pruebas de lógica.

## Qué pasó

- La suite Playwright se amplió con los controles del mapa y el error de teselas, pero **no se pudo ejecutar**: no había navegador conectado.
- Ahí estaba oculto un fallo del cambio de mapa base. Se encontró y corrigió el 09/11 (trabajo 03).

## Lo que quedó pendiente

- Elegir el proveedor de mapas definitivo para producción.
- Añadir capas científicas georreferenciadas.
