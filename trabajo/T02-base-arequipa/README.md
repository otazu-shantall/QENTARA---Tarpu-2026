# T02 · Base de Arequipa → movida al backend

> 15/11/2026. Escrito con asistencia de IA (Claude Code).

La extracción de la base de Arequipa (capa 1 del esquema mixto, DT-22) **ya vive en el backend**, junto con su actualización periódica:

- código: [backend/tarpu_datos/base_regional.py](../../backend/tarpu_datos/base_regional.py);
- actualización: [backend/tarpu_datos/actualizar.py](../../backend/tarpu_datos/actualizar.py);
- manifiesto (fuente, caja, resolución, fallos): [backend/catalogo/base_arequipa.json](../../backend/catalogo/base_arequipa.json);
- datos: `backend/almacen/base_arequipa/`, que git ignora (≈ 620 MB). Se regeneran con los comandos de [backend/tarpu_datos/README.md](../../backend/tarpu_datos/README.md).
