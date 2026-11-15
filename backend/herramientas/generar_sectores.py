"""Genera backend/catalogo/sectores.json: sectores de altitud (DT-18) y cultivos que TARPU muestra en cada uno (DT-20).

Regla (DT-20): en cada sector se ordenan las especies por superficie sembrada en el IV CENAGRO 2012 (INEI), sumando los
nombres del censo que corresponden a la misma especie de FAO EcoCrop. Se muestran primero las 8 con más superficie que
tengan ficha de EcoCrop; las demás con ficha van a «ver más». Las asociaciones (p. ej. «Haba-Maíz») y los nombres sin
especie identificable no se evalúan y se listan aparte.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
INV = RAIZ / "investigacion"
censo = json.loads((INV / "cenagro2012_arequipa_cultivos_por_sector.json").read_text(encoding="utf-8"))
fichas = json.loads((INV / "cultivos_arequipa_2026-11-14.json").read_text(encoding="utf-8"))["cultivos"]
forrajes = json.loads((INV / "ecocrop_forrajes_2026-11-15.json").read_text(encoding="utf-8"))["cultivos"]

# Nombre del censo -> clave de ficha EcoCrop (misma especie). Solo correspondencias de especie inequívocas.
ESPECIE = {
    "Ajo": "ajo", "Alcachofa": "alcachofa", "Alfalfa": "alfalfa", "Algodón": "algodon", "Arroz": "arroz", "Arveja": "arveja",
    "Avena forrajera": "avena", "Avena grano": "avena", "Camote": "camote", "Caña de azúcar para alcohol": "cana_de_azucar",
    "Caña de azúcar para azúcar": "cana_de_azucar", "Cebada forrajera": "cebada", "Cebada grano": "cebada", "Cebolla": "cebolla",
    "Frijol": "frijol", "Haba": "haba", "Kiwicha": "kiwicha", "Mashua": "mashua", "Maíz amarillo duro": "maiz",
    "Maíz amiláceo": "maiz", "Maíz chala": "maiz", "Maíz choclo": "maiz", "Maíz morado": "maiz", "Olivo": "olivo",
    "Olluco": "olluco", "Orégano": "oregano", "Palto": "palta", "Papa amarilla": "papa", "Papa blanca": "papa",
    "Papa nativa": "papa", "Paprika": "paprika", "Pasto dactilys": "dactylis", "Quinua": "quinua", "Tomate": "tomate",
    "Trigo": "trigo", "Tuna": "tuna", "Tuna para cochinilla": "tuna", "Vid": "vid", "Zanahoria": "zanahoria", "Zapallo": "zapallo",
}
REQUIERE_ESPECIE = {"Rye grass": ["rye_grass_perenne", "rye_grass_italiano"]}
CIENTIFICO = {k: v["ecocrop"]["cientifico"] for k, v in fichas.items()} | {k: v["cientifico"] for k, v in forrajes.items()}
MAXIMO = 8

SECTORES = {
    "S1": {"nombre": "Costa y valles bajos", "pisos_inei": {"1": "Costa o chala", "9": "Yunga marítima"}, "altitud_m": [0, 2300]},
    "S2": {"nombre": "Valles interandinos", "pisos_inei": {"3": "Quechua"}, "altitud_m": [2300, 3500]},
    "S3": {"nombre": "Altoandino", "pisos_inei": {"4": "Suni", "5": "Puna"}, "altitud_m": [3500, 4800]},
}

salida = {
    "descripcion": "Sectores internos de TARPU para Arequipa (DT-18) y cultivos que se muestran en cada uno (DT-20). Uso interno: el usuario ve un mapa normal.",
    "fuentes": {
        "pisos": "INEI, IV Censo Nacional Agropecuario 2012, Guía estadística (variable WPISO, piso altitudinal: 1 Costa o chala, 2 Yunga fluvial, 3 Quechua, 4 Suni, 5 Puna, 6 Janca, 7 Rupa Rupa, 8 Omagua, 9 Yunga marítima). http://censos1.inei.gob.pe/Cenagro/redatam/doc/Guia%20Estadistica.pdf",
        "limites": "Regiones naturales de J. Pulgar Vidal. Comprobado con los microdatos del censo (2012.zip, registro 01, WALTITUD por WPISO, Arequipa): Costa 2–461 m; Yunga marítima 502–2299 m; Quechua 2301–3500 m; Suni 3501–4000 m; Puna 4005–4782 m; Janca 4801–5139 m.",
        "superficie": censo["fuentes"]["piso_por_cultivo"],
        "fichas": "FAO EcoCrop (ver backend/investigacion/cultivos_arequipa_2026-11-14.json y ecocrop_forrajes_2026-11-15.json)",
    },
    "regla_cultivos": f"Especies ordenadas por superficie sembrada en el sector (IV CENAGRO 2012), sumando los nombres del censo de una misma especie; se muestran primero las {MAXIMO} con ficha EcoCrop y el resto con ficha en «ver más». Sin ficha o con especie sin declarar, no se evalúan.",
    "advertencias": censo["advertencias"] + [
        "La superficie es de 2012: indica dónde se sembraba entonces, no qué conviene sembrar.",
        "Una misma ficha de EcoCrop cubre todos los usos de una especie (p. ej., maíz chala y maíz amiláceo son Zea mays).",
        "El orden es por superficie, no un puntaje: no dice qué cultivo es mejor."],
    "sectores": {},
}
for s, meta in SECTORES.items():
    por_especie, sin_ficha, asociaciones, requiere = {}, [], [], []
    for nombre, v in censo["cultivos"].items():
        ha = round(v["ha_sembradas_2012"] * v["pct_por_sector"].get(s, 0) / 100, 1)
        if ha <= 0:
            continue
        if nombre in ESPECIE:
            e = por_especie.setdefault(ESPECIE[nombre], {"clave": ESPECIE[nombre], "cientifico": CIENTIFICO[ESPECIE[nombre]], "ha_2012": 0.0, "nombres_censo": {}})
            e["ha_2012"] = round(e["ha_2012"] + ha, 1)
            e["nombres_censo"][nombre] = ha
        elif nombre in REQUIERE_ESPECIE:
            requiere.append({"nombre_censo": nombre, "ha_2012": ha, "fichas_posibles": REQUIERE_ESPECIE[nombre]})
        elif "-" in nombre:
            asociaciones.append({"nombre_censo": nombre, "ha_2012": ha})
        else:
            sin_ficha.append({"nombre_censo": nombre, "ha_2012": ha})
    orden = sorted(por_especie.values(), key=lambda x: -x["ha_2012"])
    salida["sectores"][s] = meta | {
        "principales": orden[:MAXIMO], "ver_mas": orden[MAXIMO:],
        "requiere_especie": sorted(requiere, key=lambda x: -x["ha_2012"]),
        "asociaciones_no_evaluadas": sorted(asociaciones, key=lambda x: -x["ha_2012"]),
        "sin_ficha_ecocrop": sorted(sin_ficha, key=lambda x: -x["ha_2012"]),
    }
(RAIZ / "catalogo" / "sectores.json").write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
for s, v in salida["sectores"].items():
    print(s, "principales:", ", ".join(f"{e['clave']} {e['ha_2012']:.0f}" for e in v["principales"]))
    print("   ver más:", ", ".join(e["clave"] for e in v["ver_mas"]))
    print("   requiere especie:", v["requiere_especie"], "| sin ficha:", len(v["sin_ficha_ecocrop"]), "| asociaciones:", len(v["asociaciones_no_evaluadas"]))
