#!/bin/sh
# Arranque del contenedor: api | trabajador | actualizador. Escrito con asistencia de IA (Claude Code).
set -e
MODO="${1:-api}"
if [ "${TARPU_SINCRONIZAR_BASE:-0}" = "1" ]; then
  echo "Bajando la base de Arequipa desde Storage (solo lo que falte)..."
  python -m tarpu_datos.base.sincronizar bajar
fi
case "$MODO" in
  api)          exec python -m uvicorn tarpu_api.main:app --host 0.0.0.0 --port "${PORT:-8080}" ;;
  trabajador)   exec python -m tarpu_datos.coordenada.trabajador ;;
  actualizador) exec python -m tarpu_datos.actualizacion bucle --cada-horas "${TARPU_ACTUALIZAR_CADA_HORAS:-6}" ;;
  *)            exec "$@" ;;
esac
