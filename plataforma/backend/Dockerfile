# Imagen única del backend de TARPU (DT-23): api | trabajador | actualizador.
# Local: infra/docker-compose.yml. Nube: Google Cloud Run (servicio para la api, Cloud Run Job para el trabajador
# y el actualizador). Escrito con asistencia de IA (Claude Code); declarado en entrega/uso-de-ia.md.
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 \
    TARPU_ALMACEN=supabase PORT=8080
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY tarpu_api ./tarpu_api
COPY tarpu_datos ./tarpu_datos
COPY catalogo ./catalogo
COPY contrato ./contrato
COPY prueba_web ./prueba_web
COPY docker/entrada.sh /entrada.sh

# Los datos (base de Arequipa, caché y archivos de cada fuente) viven en /app/almacen:
# en local es un volumen; en la nube se bajan del bucket al arrancar (TARPU_SINCRONIZAR_BASE=1).
RUN mkdir -p /app/almacen
EXPOSE 8080
ENTRYPOINT ["sh", "/entrada.sh"]
CMD ["api"]
