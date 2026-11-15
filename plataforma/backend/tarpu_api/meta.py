"""Meta: versión, modo, fuentes y período de los datos (GET /api/meta).

Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from . import __version__, catalogo, conectores, config


def obtener() -> dict:
    c = config.obtener()
    return {
        "version": __version__,
        "modo": c.modo,
        "fuentes": conectores.describir(),
        "periodo_power": {"inicio": c.power_inicio, "fin": c.power_fin},
        "catalogo": {"fuente": "FAO EcoCrop", "archivo": c.catalogo.name, "cultivos": catalogo.nombres()},
        "acciones_en_vivo": c.modo == "en_vivo",
        "nota": "Los datos son reales en los dos modos. En la web publicada no se pueden registrar parcelas nuevas.",
    }
