"""Recorrido completo por la API, motor, agente, datos detallados y exportación (DISENO.md §10).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json

from conftest import contorno_cuadrado


def _registrar(cliente, contexto: dict | None = None) -> str:
    r = cliente.post("/api/parcelas", json={"nombre": "Prueba Chivay", "contorno": contorno_cuadrado()})
    assert r.status_code == 201, r.text
    pid = r.json()["data"]["id"]
    if contexto is not None:
        assert cliente.put(f"/api/parcelas/{pid}/contexto", json=contexto).status_code == 200
    return pid


def _procesar(cliente, pid):
    r = cliente.post(f"/api/parcelas/{pid}/procesar")
    assert r.status_code == 202
    return cliente.get(f"/api/parcelas/{pid}/procesamiento").json()["data"]  # TestClient ejecuta la tarea al responder


CTX = {"cultivo_actual": "papa", "agua": "secano", "meses_campana": [11, 12, 1, 2, 3, 4], "prioridades": ["frio", "lluvia"]}


def _todas_las_claves(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield k
            yield from _todas_las_claves(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from _todas_las_claves(v)


def test_meta_y_errores_basicos(cliente):
    m = cliente.get("/api/meta").json()
    assert m["modo"] == "en_vivo" and {f["id"] for f in m["data"]["fuentes"]} == {"power", "modis_ndvi", "soilgrids"}
    assert cliente.get("/api/parcelas/no-existe").json()["error"]["codigo"] == "parcela_no_existe"
    r = cliente.post("/api/parcelas", json={"nombre": "x"})
    assert r.status_code == 422 and r.json()["error"]["codigo"] == "datos_invalidos"
    r = cliente.post("/api/parcelas", json={"nombre": "x", "contorno": {"type": "Polygon", "coordinates": [[[0, 0], [1, 1], [1, 0], [0, 1], [0, 0]]]}})
    assert r.status_code == 400 and r.json()["error"]["codigo"] == "contorno_invalido"


def test_recorrido_completo(cliente, cache_chivay):
    pid = _registrar(cliente, CTX)
    assert cliente.get(f"/api/parcelas/{pid}/indicadores").json()["error"]["codigo"] == "datos_no_listos"
    estado = _procesar(cliente, pid)
    por_id = {f["id"]: f for f in estado["fuentes"]}
    assert por_id["power"]["estado"] == "listo"
    assert por_id["modis_ndvi"]["estado"] == "no_disponible" and por_id["modis_ndvi"]["motivo"]
    assert estado["estado"] == "terminado"

    ind = cliente.get(f"/api/parcelas/{pid}/indicadores").json()
    assert ind["data"]["resumen"]["meses_con_mas_noches_bajo_0c"] == {"valor": 29.2, "meses": ["jul", "ago"]}
    assert ind["procedencia"][0]["elevacion_informada_por_power_m"] == 4351.89
    assert len(cliente.get(f"/api/parcelas/{pid}/clima").json()["data"]["serie_mensual"]) == 132

    rot = cliente.get(f"/api/parcelas/{pid}/rotaciones").json()["data"]
    cultivos = [e["cultivo"] for e in rot["estrategias"]]
    assert cultivos == ["papa", "haba", "cebada", "quinua"]          # E1 actual + todos los de otra familia
    assert not {"puntaje", "score", "peso", "pesos", "apto"} & set(_todas_las_claves(rot))
    papa = rot["estrategias"][0]
    assert [c["criterio"] for c in papa["criterios"]][:2] == ["frio", "lluvia"]   # orden declarado, sin pesos
    altitud = next(c for c in papa["criterios"] if c["criterio"] == "altitud")
    assert altitud["estado"] == "conflicto_entre_fuentes"           # 4351,89 m frente a 2800 m: no excluye
    haba = rot["estrategias"][1]
    assert next(c for c in haba["criterios"] if c["criterio"] == "frio")["estado"] == "sin_regla"
    assert next(c for c in papa["criterios"] if c["criterio"] == "suelo")["estado"] == "sin_dato"
    temp = next(c for c in papa["criterios"] if c["criterio"] == "temperatura")
    assert temp["regla"]["cita"]["url"].endswith("id=1971")
    assert temp["dato"]["meses"] == ["nov", "dic", "ene", "feb", "mar", "abr"]   # orden declarado

    banco = cliente.get(f"/api/parcelas/{pid}/agente").json()["data"]
    assert all(r["respuesta"] for r in banco)
    frio = cliente.post("/api/agente", json={"parcela_id": pid, "pregunta": "¿Cuántas noches de frío hay?"}).json()["data"]
    assert frio["intencion"] == "frio" and frio["citas"] and "29,2" in frio["respuesta"]
    pron = cliente.post("/api/agente", json={"parcela_id": pid, "pregunta": "¿Va a llover mañana?"}).json()["data"]
    assert pron["intencion"] == "pronostico" and "no pronostica" in pron["respuesta"]

    datos = cliente.get(f"/api/parcelas/{pid}/datos").json()["data"]
    power = next(f for f in datos["fuentes"] if f["fuente"] == "power")
    assert len(power["normalizado"]["filas"]) == 4018 and power["original"]["contenido"]["header"]


def test_sin_meses_declarados_temperatura_sin_dato(cliente, cache_chivay):
    pid = _registrar(cliente, {"cultivo_actual": "papa"})
    _procesar(cliente, pid)
    papa = cliente.get(f"/api/parcelas/{pid}/rotaciones").json()["data"]["estrategias"][0]
    estados = {c["criterio"]: c["estado"] for c in papa["criterios"]}
    assert estados["temperatura"] == "sin_dato" and estados["frio"] == "sin_dato"
    assert estados["lluvia"] in {"dentro_optimo", "dentro_absoluto", "fuera_absoluto"}


def test_redibujar_desactualiza_resultados(cliente, cache_chivay):
    pid = _registrar(cliente, CTX)
    _procesar(cliente, pid)
    r = cliente.put(f"/api/parcelas/{pid}/contorno", json={"contorno": contorno_cuadrado(d=0.002)})
    assert r.json()["data"]["version"] == 2
    r = cliente.get(f"/api/parcelas/{pid}/indicadores")
    assert r.status_code == 409 and r.json()["error"]["codigo"] == "parcela_desactualizada"


def test_exportar_escribe_un_archivo_por_ruta(cliente, cache_chivay, cfg):
    from tarpu_api import exportar
    pid = _registrar(cliente, CTX)
    _procesar(cliente, pid)
    _registrar(cliente, CTX)  # otra parcela sin datos preparados: no se exporta
    escritos = exportar.exportar(cfg.export_dir)
    rel = sorted(p.relative_to(cfg.export_dir).as_posix() for p in escritos)
    assert rel == sorted(["parcelas.json", "meta.json", "catalogo.json", f"parcelas/{pid}.json"] +
                         [f"parcelas/{pid}/{x}.json" for x in ("indicadores", "clima", "rotaciones", "agente", "datos")])
    lista = json.loads((cfg.export_dir / "parcelas.json").read_text(encoding="utf-8"))
    assert [p["id"] for p in lista["data"]] == [pid] and lista["modo"] == "publicado"
