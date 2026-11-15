# Desarrollo

El frontend vigente de escritorio está en `frontend/` (DT-25). Requisitos, rutas y arquitectura en [frontend/README.md](../frontend/README.md).

## Frontend

```powershell
npm --prefix frontend ci
npm --prefix frontend run dev
```

Abrir http://127.0.0.1:5174/. Inicio con selector de tema; acceso de demostración mediante «Descubre TARPU».

```powershell
npm --prefix frontend run build
npm --prefix frontend test
npm --prefix frontend run test:ui
```

Chrome requiere el servidor de desarrollo encendido. Resultados en `frontend/test-results/`; producción en `frontend/dist/`, ambos ignorados.

## Backend y datos del equipo

Se conservan sin cambios las áreas `backend/`, `datos/`, `trabajo/`, `supabase/` e `infra/`. Su ejecución y pruebas están en [backend/README.md](../backend/README.md), [datos/README.md](../datos/README.md) y [docs/12](12-carpetas-docker-y-despliegue.md). La configuración de lanzamiento del backend conserva sus entradas.

La interfaz conectada anterior de `Codigo/src/nuevo/` permanece en Git hasta `e08ea68` y en los informes [07](informes/07-frontend-nuevo.md) y [08](informes/08-frontend-conectado-api.md). La carpeta fue retirada; su conexión con la API no se ha trasladado a `frontend/`.

Antes de exportar JSON desde backend, indicar un destino explícito con `--destino` según su herramienta o configurar `TARPU_EXPORT_DIR`; el valor anterior menciona `Codigo/public/api`. No ejecutar esa exportación como si conectara automáticamente la app nueva. El puerto del frontend ahora es 5174; la configuración CORS deberá revisarse con el backend al integrar.

El contrato actual se revisa en [T03](../trabajo/T03-modelado-datos/contrato-pantallas.md). No se introducen claves en el frontend ni se presentan los escenarios locales como datos reales.
