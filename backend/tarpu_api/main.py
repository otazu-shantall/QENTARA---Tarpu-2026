"""Rutas de la API de TARPU (FastAPI). Cada ruta delega en un módulo; aquí no se calcula nada.

Ejecutar desde backend/:  .venv/Scripts/uvicorn tarpu_api.main:app --reload --port 8000
Documentación automática: http://127.0.0.1:8000/docs
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from . import __version__, agente, almacen, base, coordenada, catalogo, config, datos_detallados, errores, indicadores, meta, motor, parcelas, procesamiento
from .esquemas import TrabajoEntrada, ContextoEntrada, ContornoNuevo, ParcelaNueva, PreguntaEntrada, Sobre, sobre

@asynccontextmanager
async def _ciclo(_: FastAPI):
    """Con TARPU_ACTUALIZAR_CADA_HORAS, actualiza los datos en segundo plano (tarpu_datos.actualizacion, DT-22)."""
    parar = None
    cada = os.environ.get("TARPU_ACTUALIZAR_CADA_HORAS")
    if cada:
        from tarpu_datos import actualizacion  # solo si se activa: la API no depende de él para arrancar
        _, parar = actualizacion.iniciar_en_segundo_plano(float(cada))
    yield
    if parar:
        parar.set()


app = FastAPI(title="TARPU API", version=__version__, lifespan=_ciclo,
              description="Backend de TARPU (QENTARA · NASA Space Apps 2026). Datos reales con procedencia; sin supuestos (DT-16).")
app.add_middleware(CORSMiddleware, allow_origins=config.obtener().cors, allow_methods=["GET", "POST", "PUT"], allow_headers=["*"])


@app.exception_handler(errores.ErrorTarpu)
async def _error_tarpu(_: Request, e: errores.ErrorTarpu):
    return JSONResponse(e.cuerpo(), status_code=e.http)


@app.exception_handler(RequestValidationError)
async def _error_validacion(_: Request, e: RequestValidationError):
    detalle = [{"campo": ".".join(str(x) for x in err["loc"][1:]), "mensaje": err["msg"]} for err in e.errors()]
    return JSONResponse(errores.datos_invalidos(detalle).cuerpo(), status_code=422)


def _solo_en_vivo() -> None:
    if config.obtener().modo != "en_vivo":
        raise errores.solo_en_vivo()


# ---------------------------------------------------------------- meta y catálogo
@app.get("/api/meta", response_model=Sobre, tags=["meta"])
def get_meta():
    return sobre(meta.obtener())


@app.get("/api/base/sectores", response_model=Sobre, tags=["base de Arequipa"])
def get_base_sectores():
    """Mapa de sectores (DT-18) calculado desde NASADEM: límites, colores y conteos. Uso interno y de prueba."""
    m = base.mapa_sectores()
    return sobre(m, procedencia=[{"origen": "derivado", "metodo": m["metodo"], "fuente": "NASADEM_HGT v001"}], avisos=[m["aviso"]])


@app.get("/api/base/sectores.png", tags=["base de Arequipa"])
def get_base_sectores_png():
    return FileResponse(base.ruta_mapa_sectores(), media_type="image/png")


@app.post("/api/trabajos", response_model=Sobre, status_code=202, tags=["capa 2 por coordenada"])
def post_trabajo(entrada: TrabajoEntrada):
    """Lanza (o reutiliza) la extracción de datos pesados para un punto (DT-22)."""
    _solo_en_vivo()
    return sobre(coordenada.iniciar(entrada.lat, entrada.lon, entrada.nombre))


@app.get("/api/trabajos/{clave}", response_model=Sobre, tags=["capa 2 por coordenada"])
def get_trabajo(clave: str):
    return sobre(coordenada.estado(clave))


@app.get("/api/archivo", response_model=Sobre, tags=["datos detallados"])
def get_archivo(ruta: str):
    """Contenido en crudo de un .csv o .json del almacén (original, normalizado o procedencia)."""
    return sobre(coordenada.archivo(ruta))


@app.get("/api/base", response_model=Sobre, tags=["base de Arequipa"])
def get_base(lat: float, lon: float):
    """Capa 1 del esquema mixto (DT-22): relieve, sector y cultivos, suelo, aptitud y celda de clima en un punto."""
    r = base.en_punto(lat, lon)
    return sobre(r, procedencia=base.procedencia(r), avisos=r.get("avisos", []) + ([r["motivo"]] if r.get("motivo") else []))


@app.get("/api/catalogo", response_model=Sobre, tags=["meta"])
def get_catalogo():
    datos = catalogo.cargar()
    return sobre(datos["cultivos"], procedencia=[{"origen": "fuente", "source_id": "FAO EcoCrop",
                 "nota": datos["descripcion"]}], avisos=datos.get("advertencias", []))


# ---------------------------------------------------------------- parcelas
@app.get("/api/parcelas", response_model=Sobre, tags=["parcelas"])
def get_parcelas():
    return sobre(parcelas.listar())


@app.post("/api/parcelas", response_model=Sobre, status_code=201, tags=["parcelas"])
def post_parcela(entrada: ParcelaNueva):
    _solo_en_vivo()
    p = parcelas.crear(entrada.nombre, entrada.contorno)
    return sobre(p, avisos=["El contorno lo dibujaste tú; no acredita propiedad legal."])


@app.get("/api/parcelas/{parcela_id}", response_model=Sobre, tags=["parcelas"])
def get_parcela(parcela_id: str):
    p = parcelas.obtener(parcela_id)
    proc = almacen.leer(parcela_id, "procesamiento")
    return sobre({**p, "contexto": parcelas.leer_contexto(parcela_id),
                  "procesamiento": {"estado": proc["estado"], "fuentes": [{k: f.get(k) for k in ("id", "nombre", "estado", "motivo")} for f in proc["fuentes"]]} if proc else None})


@app.put("/api/parcelas/{parcela_id}/contorno", response_model=Sobre, tags=["parcelas"])
def put_contorno(parcela_id: str, entrada: ContornoNuevo):
    _solo_en_vivo()
    return sobre(parcelas.redibujar(parcela_id, entrada.contorno), avisos=["La parcela cambió de versión: vuelve a preparar sus datos."])


@app.put("/api/parcelas/{parcela_id}/contexto", response_model=Sobre, tags=["parcelas"])
def put_contexto(parcela_id: str, entrada: ContextoEntrada):
    _solo_en_vivo()
    ctx = parcelas.guardar_contexto(parcela_id, entrada.model_dump())
    return sobre(ctx, avisos=["Todo lo de esta sección lo declaraste tú."] + ctx["avisos"])


# ---------------------------------------------------------------- procesamiento
@app.post("/api/parcelas/{parcela_id}/procesar", response_model=Sobre, status_code=202, tags=["procesamiento"])
def post_procesar(parcela_id: str, tareas: BackgroundTasks):
    _solo_en_vivo()
    estado = procesamiento.iniciar(parcela_id)
    tareas.add_task(procesamiento.procesar, parcela_id)
    return sobre(estado)


@app.get("/api/parcelas/{parcela_id}/procesamiento", response_model=Sobre, tags=["procesamiento"])
def get_procesamiento(parcela_id: str):
    estado = procesamiento.leer(parcela_id)
    if estado is None:
        raise errores.datos_no_listos("Todavía no se pidió preparar los datos (POST …/procesar).")
    return sobre(estado)


# ---------------------------------------------------------------- resultados
@app.get("/api/parcelas/{parcela_id}/indicadores", response_model=Sobre, tags=["resultados"])
def get_indicadores(parcela_id: str):
    ind = indicadores.leer(parcela_id, parcelas.obtener(parcela_id)["version"])
    return sobre(ind["data"], ind["procedencia"], ind["avisos"])


@app.get("/api/parcelas/{parcela_id}/clima", response_model=Sobre, tags=["resultados"])
def get_clima(parcela_id: str):
    ind = indicadores.leer(parcela_id, parcelas.obtener(parcela_id)["version"])
    return sobre({"periodo": ind["data"]["periodo"], "serie_mensual": ind["serie_mensual"]}, ind["procedencia"], ind["avisos"])


@app.get("/api/parcelas/{parcela_id}/rotaciones", response_model=Sobre, tags=["resultados"])
def get_rotaciones(parcela_id: str):
    p = parcelas.obtener(parcela_id)
    ind = indicadores.leer(parcela_id, p["version"])
    resultado = motor.comparar(p, parcelas.leer_contexto(parcela_id), ind)
    almacen.guardar(parcela_id, "rotaciones", resultado)
    return sobre(resultado, ind["procedencia"], ind["avisos"] + ["Sin puntaje: compara cada criterio con su rango citado de FAO EcoCrop."])


@app.get("/api/parcelas/{parcela_id}/agente", response_model=Sobre, tags=["agente"])
def get_agente(parcela_id: str):
    parcelas.obtener(parcela_id)
    return sobre(agente.banco(parcela_id), avisos=["Respuestas armadas con plantillas y datos reales; sin modelo de IA (DT-14)."])


@app.post("/api/agente", response_model=Sobre, tags=["agente"])
def post_agente(entrada: PreguntaEntrada):
    _solo_en_vivo()
    parcelas.obtener(entrada.parcela_id)
    return sobre(agente.preguntar(entrada.parcela_id, entrada.pregunta))


@app.get("/api/parcelas/{parcela_id}/datos", response_model=Sobre, tags=["datos"])
def get_datos(parcela_id: str):
    parcelas.obtener(parcela_id)
    return sobre(datos_detallados.obtener(parcela_id), avisos=["Consulta detallada: no pasa por el motor de comparación."])


# ---------------------------------------------------------------- pantalla de prueba de la integración
_PRUEBA = Path(__file__).resolve().parent.parent / "prueba_web"
if _PRUEBA.exists():
    app.mount("/prueba", StaticFiles(directory=_PRUEBA, html=True), name="prueba")


@app.get("/", include_in_schema=False)
def raiz():
    return RedirectResponse("/prueba/")
