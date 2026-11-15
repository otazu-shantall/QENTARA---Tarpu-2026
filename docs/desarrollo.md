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
| http://127.0.0.1:5173/#/campo | Dashboard nuevo y mapa |
| `#/cultivos`, `#/datos`, `#/agente` | Cultivos, registros y conversación |

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
| Rutas y composición | `Codigo/src/nuevo/App.tsx` |
| Consultas reales guardadas | `Codigo/src/nuevo/reference-data.json`, generadas con `Codigo/scripts/prepare-reference-data.py` |
| Conversación y respuestas guiadas | `Codigo/src/nuevo/Chat.tsx`, `Codigo/src/nuevo/data.ts` |
| Mapa y dashboard | `Codigo/src/nuevo/FieldMap.tsx`, `Codigo/src/nuevo/FieldDashboard.tsx` |
| Portada | `Codigo/src/nuevo/Landing.tsx` |
| Estilos | `Codigo/src/nuevo/styles.css`, `dashboard.css`, `landing.css` |
| Logos | `Codigo/public/brand/` |

## Reglas al tocar el código

- Comprobar primero el estado real de los archivos.
- No quitar los rótulos de demostración mientras no haya datos reales comprobados.
- No poner claves de proveedores en el frontend.
- No empaquetar ni descargar teselas en masa.
- Después de un cambio verificable, actualizar [00-estado-actual.md](00-estado-actual.md) y dejar el informe en [informes/](informes/README.md).
