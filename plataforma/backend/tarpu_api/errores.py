"""Errores con código estable para el frontend (DISENO.md §8).

Vive en la capa de apoyo para que cualquier módulo pueda lanzarlos sin importar la API.
Respuesta: { "error": { "codigo": "...", "mensaje": "texto para el usuario", "detalle": ... } }
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from typing import Any


class ErrorTarpu(Exception):
    def __init__(self, http: int, codigo: str, mensaje: str, detalle: Any = None):
        super().__init__(mensaje)
        self.http, self.codigo, self.mensaje, self.detalle = http, codigo, mensaje, detalle

    def cuerpo(self) -> dict:
        return {"error": {"codigo": self.codigo, "mensaje": self.mensaje, "detalle": self.detalle}}


def contorno_invalido(detalle: str) -> ErrorTarpu:
    return ErrorTarpu(400, "contorno_invalido", "El contorno dibujado no es válido. Revisa que no se cruce y vuelve a dibujarlo.", detalle)


def parcela_no_existe(parcela_id: str) -> ErrorTarpu:
    return ErrorTarpu(404, "parcela_no_existe", "No existe una parcela con ese identificador.", parcela_id)


def parcela_desactualizada(detalle: str) -> ErrorTarpu:
    return ErrorTarpu(409, "parcela_desactualizada", "La parcela se volvió a dibujar. Prepara sus datos otra vez.", detalle)


def datos_no_listos(detalle: str) -> ErrorTarpu:
    return ErrorTarpu(409, "datos_no_listos", "Los datos de esta parcela todavía no están preparados.", detalle)


def datos_invalidos(detalle: Any) -> ErrorTarpu:
    return ErrorTarpu(422, "datos_invalidos", "Los datos enviados no tienen la forma esperada.", detalle)


def solo_en_vivo() -> ErrorTarpu:
    return ErrorTarpu(405, "solo_en_vivo", "Esta acción solo funciona con la API en vivo, no en la web publicada.")
