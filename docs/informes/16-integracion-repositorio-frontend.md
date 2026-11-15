# Integración del frontend en el repositorio compartido

**Fecha:** 15/11/2026. **Área:** frontend y documentación compartida.

Se incorporó `origin/main` hasta `e08ea68` antes de integrar el trabajo local. Las áreas de backend, datos, extracción, Supabase e infraestructura conservan íntegramente sus archivos remotos. Los registros de IA e informes incluyen las aportaciones de todas las áreas.

`frontend/` contiene la interfaz de escritorio vigente. Se retiró `Codigo/`; las versiones anteriores, incluida su conexión con la API, permanecen recuperables desde Git. El respaldo local previo incluye el árbol de trabajo, el parche de cambios y un archivo de la versión remota de `Codigo/`, en `tmp/respaldo-integracion-20261115/`, fuera del contenido publicado. El stash previo también se conserva.

Los cruces de documentación se conciliaron manteniendo las decisiones DT-13 a DT-24 del equipo. El registro local anterior de frontend está archivado con su identificación original y su contexto; DT-25 registra la ubicación vigente. La entrada de lanzamiento del frontend ahora usa `frontend/` y el puerto 5174, manteniendo las entradas del backend.

La conexión de `Codigo/src/nuevo/` con el backend no se ha trasladado a los adaptadores locales de `frontend/`. Se conservan el contrato de T03 y la API como referencia de integración. Antes de usar la exportación del backend debe elegirse su destino; el valor previo señala `Codigo/public/api`. Los ejemplos rotulados del prototipo no constituyen la entrega validada exigida por DT-16.

**Verificación:** build TypeScript/Vite y once pruebas de dominio aprobados. Comprobación de preservación de archivos del frontend y ausencia de cambios en `backend/`, `datos/`, `trabajo/`, `supabase/`, `infra/` y `Documentación/`. Revisión de patrones de credenciales en las incorporaciones sin hallazgos. Recorrido Chrome aprobado, sin errores JavaScript.

La integración se versiona en `codex/integrar-frontend` y se incorpora mediante revisión de diferencias hacia `main`, conservando su historial y sin reescribir commits del equipo.
