"""Las capas solo importan hacia abajo (DISENO.md §5): API → lógica → núcleo → apoyo.
También: datos_detallados no importa el motor; motor y agente no llaman a los conectores.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import ast
from pathlib import Path

PAQUETE = Path(__file__).parent.parent / "tarpu_api"
CAPA = {
    "config": 1, "almacen": 1, "catalogo": 1, "conectores": 1, "errores": 1,
    "parcelas": 2, "geometria": 2, "base": 2, "ingesta": 2, "indicadores": 2, "datos_detallados": 2,
    "motor": 3, "agente": 3,
    "main": 4, "esquemas": 4, "coordenada": 4, "meta": 4, "procesamiento": 4, "exportar": 4,
}


def _modulo(ruta: Path) -> str:
    partes = ruta.relative_to(PAQUETE).with_suffix("").parts
    return partes[0]


def _importados(ruta: Path) -> set[str]:
    arbol = ast.parse(ruta.read_text(encoding="utf-8"))
    nombres = set()
    for nodo in ast.walk(arbol):
        if isinstance(nodo, ast.ImportFrom) and nodo.level >= 1:
            if nodo.module:
                nombres.add(nodo.module.split(".")[0])
            else:
                nombres.update(a.name for a in nodo.names)
    return nombres


def test_ninguna_capa_importa_hacia_arriba():
    for ruta in PAQUETE.rglob("*.py"):
        if ruta.name == "__init__.py" and ruta.parent == PAQUETE:
            continue
        propio = _modulo(ruta)
        for otro in _importados(ruta) & set(CAPA):
            if otro == propio:
                continue
            assert CAPA[otro] <= CAPA[propio], f"{ruta.relative_to(PAQUETE)} (capa {CAPA[propio]}) importa {otro} (capa {CAPA[otro]})"


def test_datos_detallados_no_importa_motor_y_motor_no_llama_conectores_para_descargar():
    assert "motor" not in _importados(PAQUETE / "datos_detallados.py")
    for ruta in list((PAQUETE / "motor").glob("*.py")) + list((PAQUETE / "agente").glob("*.py")):
        texto = ruta.read_text(encoding="utf-8")
        assert ".obtener(" not in texto, f"{ruta.name} no debe descargar datos"
