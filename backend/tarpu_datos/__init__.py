"""Paquete de extracción de datos de TARPU, dentro del backend (esquema mixto, DT-22).

Origen: el paquete de la tarea T01 de Damaris (trabajo/T01-paquete-extraccion/tarpu_datos), copiado el
15/11/2026 con estos cambios para que funcione cada vez que se necesite y se pueda actualizar:
- caché con antigüedad máxima (cliente.Cache.obtener_json(max_edad_dias=...)), para refrescar listas de fechas;
- MODIS (ornl): bloques de 10 fechas anclados a la lista completa del punto, así una actualización solo pide
  las fechas nuevas; la lista de fechas se refresca cada 8 días;
- POWER: sin fecha de fin, pide hasta ayer y recorta los últimos días que POWER aún no publica; nombre fijo
  opcional (archivo_base) para que la actualización reemplace el mismo archivo;
- base_regional (capa 1, toda Arequipa) y actualizar (actualización periódica), nuevos.

Cada módulo de fuente (power, soilgrids, gaez, luz, ornl) expone obtener(*, lat, lon, salida, cache,
inicio=None, fin=None, progreso=None, ...) y deja original, normalizado y procedencia.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
