# Desarrollo

> Cómo levantar y probar el prototipo. La referencia completa del código está en [Codigo/README.md](../Codigo/README.md).

## Requisitos

- **Node.js 24** o posterior y npm.
- **Internet** para el mapa, las imágenes satelitales y las fuentes tipográficas.
- **Google Chrome** instalado, solo para la suite de navegador (`test:ui`).

## Levantar

Desde la raíz del proyecto:

```bash
npm --prefix Codigo install
```

```bash
npm --prefix Codigo run dev
```

| Dirección | Qué abre |
|---|---|
| http://127.0.0.1:5173/ | Landing |
| http://127.0.0.1:5173/#/overview | Dashboard (Vista general) |
| `#/parcels`, `#/monitor`, `#/climate`, `#/rotations`, `#/data`, `#/reports` | Las demás vistas |

En la app de escritorio de Claude, la configuración `tarpu-dashboard` de `.claude/launch.json` levanta el mismo servidor y abre la vista previa.

## Probar

| Comando | Qué comprueba |
|---|---|
| `npm --prefix Codigo run build` | Tipos de TypeScript y compilación de producción (`Codigo/dist/`) |
| `npm --prefix Codigo test` | 8 pruebas de lógica: filtros, faltantes, CSV y límites del agente |
| `npm --prefix Codigo run test:ui` | Recorrido completo en Chrome: landing, mapa, agente, descarga, persistencia y 8 vistas móviles sin desborde. Requiere tener `dev` encendido en otra terminal |

Las capturas y resultados de `test:ui` quedan en `Codigo/test-results/` (ignorado). Las del diseño vigente se copiaron a [diseno/capturas/](diseno/capturas/).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Rutas y composición | `Codigo/src/app/App.tsx` |
| Datos sintéticos | `Codigo/src/data/demo.ts` |
| Respuestas del agente | `Codigo/src/lib/domain.ts` (`answerQuestion`) |
| Mapa y zonas de referencia | `Codigo/src/features/monitor/` (`FarmMap.tsx`, `mapConfig.ts`, `TileMosaic.tsx`) |
| Colores, tipografía y radios | `Codigo/src/styles/tokens.css` |
| Logos | `Codigo/public/brand/` |

## Reglas al tocar el código

- Comprobar primero el estado real de los archivos.
- No quitar los rótulos de demostración mientras no haya datos reales comprobados.
- No poner claves de proveedores en el frontend.
- No empaquetar ni descargar teselas en masa.
- Después de un cambio verificable, actualizar [00-estado-actual.md](00-estado-actual.md) y dejar el informe en [informes/](informes/README.md).
