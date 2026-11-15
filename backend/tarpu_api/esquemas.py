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
