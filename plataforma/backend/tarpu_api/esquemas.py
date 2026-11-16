"""Contrato con el frontend (DISENO.md §8): modelos Pydantic de entrada y sobre común de salida.

Sobre común: { data, procedencia, avisos, modo, generado }.
- Lo que viene de una fuente lleva su procedencia (origen «fuente»).
- Lo que declara el usuario lleva origen «declarado».
`python -m tarpu_api.esquemas` escribe los JSON Schema en contrato/esquemas/.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from . import config
from .parcelas import CRITERIOS

Criterio = Literal["temperatura", "frio", "lluvia", "suelo", "familia", "altitud"]
assert set(CRITERIOS) == set(Criterio.__args__)


class _Estricto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class TrabajoEntrada(_Estricto):
    lat: Annotated[float | None, Field(default=None, ge=-90, le=90)] = None
    lon: Annotated[float | None, Field(default=None, ge=-180, le=180)] = None
    contorno: Annotated[dict | None, Field(default=None, description="GeoJSON Polygon [lon, lat] de la parcela")] = None
    nombre: Annotated[str | None, Field(default=None, max_length=60, pattern=r"^[A-Za-z0-9_-]+$")] = None


class ContornoEntrada(_Estricto):
    contorno: Annotated[dict, Field(description="GeoJSON Polygon [lon, lat], cerrado")]


class CancelarEntrada(_Estricto):
    claves: Annotated[list[str], Field(min_length=1, max_length=100)]


class ParcelaNueva(_Estricto):
    nombre: Annotated[str, Field(min_length=1, max_length=80, description="Nombre que le da el usuario")]
    contorno: dict[str, Any] = Field(description="GeoJSON Polygon en [longitud, latitud], dibujado por el usuario")


class ContornoNuevo(_Estricto):
    contorno: dict[str, Any] = Field(description="GeoJSON Polygon redibujado")


class ContextoEntrada(_Estricto):
    """Todo lo declara el usuario. null = «no sé»; nunca se rellena con un valor por defecto."""
    cultivo_actual: str | None = None
    cultivo_anterior: str | None = None
    agua: Literal["secano", "riego"] | None = None
    meses_campana: list[Annotated[int, Field(ge=1, le=12)]] | None = Field(None, description="Meses en que el cultivo está en el campo (1 = enero)")
    prioridades: list[Criterio] = Field(default_factory=list, description="Orden en que el usuario quiere ver los criterios. No son pesos.")


class NaturalizarEntrada(_Estricto):
    """Respuesta ya preparada por TARPU que la IA solo reescribe para decirla en voz alta."""
    pregunta: Annotated[str, Field(min_length=1, max_length=700)]
    respuesta: Annotated[str, Field(min_length=1, max_length=3000)]


class RotacionEntrada(_Estricto):
    """Comparación de rotaciones en una sola llamada: el lugar (contorno o punto) y lo que declara el usuario."""
    nombre: Annotated[str, Field(min_length=1, max_length=80)] = "mi campo"
    contorno: dict[str, Any] | None = Field(None, description="GeoJSON Polygon [lon, lat]; si falta, se usa el punto")
    lat: Annotated[float | None, Field(ge=-90, le=90)] = None
    lon: Annotated[float | None, Field(ge=-180, le=180)] = None
    contexto: ContextoEntrada = Field(default_factory=ContextoEntrada)


class MensajeIA(_Estricto):
    role: Literal['user', 'assistant']
    text: Annotated[str, Field(max_length=2000)]


class ConsultaIAEntrada(_Estricto):
    pregunta: Annotated[str, Field(min_length=1, max_length=700)]
    lat: Annotated[float | None, Field(ge=-90, le=90)] = None
    lon: Annotated[float | None, Field(ge=-180, le=180)] = None
    contorno: dict[str, Any] | None = None
    historial: Annotated[list[MensajeIA], Field(max_length=6)] = Field(default_factory=list)


class PreguntaEntrada(_Estricto):
    parcela_id: str
    pregunta: Annotated[str, Field(min_length=1, max_length=300)]


class Sobre(BaseModel):
    data: Any
    procedencia: list[dict[str, Any]] = Field(default_factory=list)
    avisos: list[str] = Field(default_factory=list)
    modo: Literal["en_vivo", "publicado"]
    generado: str


def sobre(data: Any, procedencia: list | None = None, avisos: list | None = None) -> dict:
    return {"data": data, "procedencia": procedencia or [], "avisos": avisos or [],
            "modo": config.obtener().modo, "generado": datetime.now(timezone.utc).isoformat(timespec="seconds")}


def exportar_esquemas(destino: Path) -> list[Path]:
    destino.mkdir(parents=True, exist_ok=True)
    escritos = []
    for modelo in (ParcelaNueva, ContornoNuevo, ContextoEntrada, PreguntaEntrada, Sobre):
        ruta = destino / f"{modelo.__name__}.json"
        ruta.write_text(json.dumps(modelo.model_json_schema(), ensure_ascii=False, indent=1), encoding="utf-8")
        escritos.append(ruta)
    return escritos


if __name__ == "__main__":
    for r in exportar_esquemas(config.BACKEND_DIR / "contrato" / "esquemas"):
        print(r)
