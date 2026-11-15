"""Mapa de módulos del backend de TARPU (estilo del mapa general de Pulse).

Genera backend/diagramas/tarpu-backend-mapa.pdf. Uso, desde la raíz del repositorio:
    python backend/diagramas/generar_mapa.py .
Luego, para el PNG: pdftoppm -png -r 110 -singlefile backend/diagramas/tarpu-backend-mapa.pdf backend/diagramas/tarpu-backend-mapa
Requiere reportlab y las fuentes Arial de Windows.
Uso de IA: escrito con asistencia de Claude Code (14/11/2026); declarado en entrega/uso-de-ia.md.
"""
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(sys.argv[1])
OUT = ROOT / 'backend' / 'diagramas'
OUT.mkdir(parents=True, exist_ok=True)
LOGO = ROOT / 'Codigo' / 'public' / 'brand' / 'tarpu-logo-black.png'

F = 'C:/Windows/Fonts/'
pdfmetrics.registerFont(TTFont('Arial', F + 'arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', F + 'arialbd.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Italic', F + 'ariali.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial-Italic', boldItalic='Arial-Bold')

W, H = 1700, 1180
INK = colors.HexColor('#111311')
INK2 = colors.HexColor('#4B504C')
INK3 = colors.HexColor('#868B85')
CARD_LINE = colors.HexColor('#D2D4CC')
DATA = colors.HexColor('#2F8F8A')      # datos: alimentan (discontinua)
FUNC = colors.HexColor('#6C4BC2')      # función: produce o ejecuta
NAV = colors.HexColor('#5B6170')       # entrega a: consumidor

ZONES = {
    'fuentes': ('#EEF5E4', '#9DBB7C', '#D9EAC4'),
    'ingesta': ('#E8F0F8', '#8FB0D3', '#D2E2F2'),
    'nucleo': ('#FDF4E3', '#E0B35E', '#F8E2B4'),
    'agente': ('#FBEEF1', '#D88FA2', '#F5D6DE'),
    'motor': ('#F2EEFA', '#A18BD6', '#E2DAF5'),
    'api': ('#E7F4F2', '#7EB9B2', '#CDE8E4'),
    'consumo': ('#EEF1F5', '#9AA4B5', '#DCE1EA'),
    'ampl': ('#F2F2EF', '#B5B7AF', '#E3E3DD'),
}

c = canvas.Canvas(str(OUT / 'tarpu-backend-mapa.pdf'), pagesize=(W, H))
c.setTitle('TARPU · Mapa del backend')
c.setAuthor('QENTARA')
c.setFillColor(colors.HexColor('#F7F7F5'))
c.rect(0, 0, W, H, fill=1, stroke=0)


def Y(y):
    return H - y


ST = {
    'type': ParagraphStyle('type', fontName='Arial-Bold', fontSize=6.6, leading=8, textColor=INK3),
    'title': ParagraphStyle('title', fontName='Arial-Bold', fontSize=10.2, leading=12.2, textColor=INK),
    'desc': ParagraphStyle('desc', fontName='Arial', fontSize=7.7, leading=9.8, textColor=INK2),
    'note': ParagraphStyle('note', fontName='Arial', fontSize=7.8, leading=10.4, textColor=INK2, alignment=TA_LEFT),
}


def para(text, style, x, y, w):
    p = Paragraph(text, ST[style])
    _, h = p.wrap(w, 1000)
    p.drawOn(c, x, Y(y) - h)
    return h


def zone(key, x, y, w, h, title, tag):
    bg, border, chip = ZONES[key]
    c.setFillColor(colors.HexColor(bg))
    c.setStrokeColor(colors.HexColor(border))
    c.setDash(3, 3)
    c.setLineWidth(0.7)
    c.roundRect(x, Y(y + h), w, h, 4, fill=1, stroke=1)
    c.setDash()
    c.setFont('Arial-Bold', 8.6)
    tw = c.stringWidth(title, 'Arial-Bold', 8.6)
    c.setFillColor(colors.HexColor(chip))
    c.roundRect(x + 8, Y(y + 24), tw + 14, 16, 3, fill=1, stroke=0)
    c.setFillColor(INK)
    c.drawString(x + 15, Y(y + 19.5), title)
    c.setFont('Arial-Bold', 6.4)
    c.setFillColor(colors.HexColor(border))
    c.drawRightString(x + w - 12, Y(y + 18), tag)


def card(x, y, w, h, kind, title, desc, dim=False):
    c.setFillColor(colors.white if not dim else colors.HexColor('#FAFAF8'))
    c.setStrokeColor(CARD_LINE)
    c.setLineWidth(0.8)
    if dim:
        c.setDash(2, 2)
    c.roundRect(x, Y(y + h), w, h, 4, fill=1, stroke=1)
    c.setDash()
    yy = y + 8
    yy += para(kind.upper(), 'type', x + 9, yy, w - 18) + 3
    yy += para(title, 'title', x + 9, yy, w - 18) + 2
    para(desc, 'desc', x + 9, yy, w - 18)
    return {'l': (x, y + h / 2), 'r': (x + w, y + h / 2), 't': (x + w / 2, y), 'b': (x + w / 2, y + h), 'x': x, 'y': y, 'w': w, 'h': h}


def label(text, x, y, color):
    c.setFont('Arial', 6.8)
    tw = c.stringWidth(text, 'Arial', 6.8)
    c.setFillColor(colors.white)
    c.rect(x - 2, Y(y) - 2.5, tw + 4, 9.5, fill=1, stroke=0)
    c.setFillColor(color)
    c.drawString(x, Y(y), text)


def arrow(points, kind, text=None, at=0, hops=(), lx=None):
    color = {'data': DATA, 'func': FUNC, 'nav': NAV}[kind]
    c.setStrokeColor(color)
    c.setLineWidth(1.0 if kind != 'nav' else 0.9)
    if kind == 'data':
        c.setDash(3, 2.5)
    path = c.beginPath()
    path.moveTo(points[0][0], Y(points[0][1]))
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        if y0 == y1:  # horizontal: bridges over crossing lines
            for hx, hy in sorted(hops, key=lambda h: h[0] if x1 > x0 else -h[0]):
                if hy == y0 and min(x0, x1) < hx < max(x0, x1):
                    d = 4 if x1 > x0 else -4
                    path.lineTo(hx - d, Y(y0))
                    path.curveTo(hx - d, Y(y0) + 5.5, hx + d, Y(y0) + 5.5, hx + d, Y(y0))
        path.lineTo(x1, Y(y1))
    c.drawPath(path, stroke=1, fill=0)
    c.setDash()
    (xa, ya), (xb, yb) = points[-2], points[-1]
    c.setFillColor(color)
    s = 4.2
    tip = c.beginPath()
    if xb > xa:
        tip.moveTo(xb, Y(yb)); tip.lineTo(xb - s * 1.5, Y(yb) + s); tip.lineTo(xb - s * 1.5, Y(yb) - s)
    elif xb < xa:
        tip.moveTo(xb, Y(yb)); tip.lineTo(xb + s * 1.5, Y(yb) + s); tip.lineTo(xb + s * 1.5, Y(yb) - s)
    elif yb > ya:
        tip.moveTo(xb, Y(yb)); tip.lineTo(xb - s, Y(yb) + s * 1.5); tip.lineTo(xb + s, Y(yb) + s * 1.5)
    else:
        tip.moveTo(xb, Y(yb)); tip.lineTo(xb - s, Y(yb) - s * 1.5); tip.lineTo(xb + s, Y(yb) - s * 1.5)
    tip.close()
    c.drawPath(tip, stroke=0, fill=1)
    if text:
        (x0, y0), (x1, y1) = points[at], points[at + 1]
        if y0 == y1:
            label(text, lx if lx is not None else min(x0, x1) + 8, y0 - 3, color)
        else:
            label(text, x0 + 5, (y0 + y1) / 2 + 2, color)


# ----------------------------------------------------------------- cabecera
c.drawImage(str(LOGO), 24, Y(52), width=100, height=100 * 245 / 760, mask='auto')
c.setFillColor(INK)
c.setFont('Arial-Bold', 17)
c.drawString(140, Y(36), 'TARPU · Mapa del backend')
c.setFont('Arial', 8.6)
c.setFillColor(INK2)
c.drawString(140, Y(50), 'Módulos, motor de comparación y flujo de datos · NASA Space Apps 2026 · desafío Field Shift · sin supuestos (DT-16)')


def legend(x, kind, text):
    arrow([(x, 80), (x + 34, 80)], kind)
    c.setFont('Arial', 7.4)
    c.setFillColor(INK2)
    c.drawString(x + 42, Y(82.5), text)


legend(24, 'nav', 'Entrega a: lo consume')
legend(190, 'func', 'Función: produce o ejecuta')
legend(370, 'data', 'Datos: alimentan otro módulo')
c.setFont('Arial', 7.4)
c.setFillColor(INK3)
c.drawRightString(W - 24, Y(82.5), 'INICIO = se construye en el hackathon · DESPUÉS = siguiente etapa · Áreas: datos (Damaris) · backend (Erick) · frontend (Shantall)')

# ----------------------------------------------------------------- zonas
zone('fuentes', 20, 108, 330, 362, 'Fuentes de datos · área de datos', 'INICIO')
zone('ingesta', 370, 108, 330, 362, 'Conectores e ingesta', 'INICIO')
zone('nucleo', 720, 108, 330, 362, 'Núcleo de datos', 'INICIO')
zone('agente', 1090, 108, 590, 362, 'Agente guiado (DT-14)', 'INICIO')
zone('motor', 20, 500, 1030, 400, 'Motor de TARPU · comparación de rotaciones', 'INICIO')
zone('api', 1090, 500, 590, 400, 'API y salida (DT-13)', 'INICIO')
zone('ampl', 20, 930, 1030, 210, 'Ampliaciones por priorizar', 'DESPUÉS')
zone('consumo', 1090, 930, 590, 210, 'Quién consume la API', 'INICIO · DESPUÉS')

# ----------------------------------------------------------------- fuentes
F1 = card(40, 146, 290, 56, 'Datos · sin cuenta · probado', 'NASA POWER', 'Temperatura, lluvia, humedad y radiación diarias por punto (celda ≈ 55 × 67 km).')
F2 = card(40, 210, 290, 56, 'Datos · sin cuenta · inestable', 'NDVI MODIS / VIIRS (ORNL)', 'Serie de NDVI cada 16 días desde 2000, píxel de 250 m (dato de zona).')
F3 = card(40, 274, 290, 56, 'Datos · sin cuenta', 'SoilGrids (ISRIC)', 'pH, textura y carbono del suelo por profundidad (250 m).')
F4 = card(40, 338, 290, 56, 'Datos · sin cuenta', 'Capas NASA GIBS', 'Imágenes para el mapa. Van directo a la web, no pasan por el motor.')
F5 = card(40, 402, 290, 56, 'Datos · cuenta Earthdata · después', 'HLS · IMERG · SMAP · SRTM', 'NDVI a 30 m, lluvia, humedad del suelo y pendiente.', dim=True)

# ----------------------------------------------------------------- ingesta
I1 = card(390, 146, 290, 56, 'Script · datos/ (Damaris)', 'Conectores por fuente', 'obtener(punto o contorno, período, salida). Descargan; sin claves en el código.')
I2 = card(390, 210, 290, 56, 'Archivos · caché y muestras', 'Archivos estandarizados', 'Original sin tocar + normalizado (faltante = vacío) + procedencia.')
I3 = card(390, 274, 290, 56, 'Función · ingesta.py', 'Ingesta y procedencia', 'Lee normalizados, procedencia y recortes. El backend no descarga nada.')
IR = card(390, 338, 290, 56, 'Función · conectores.py · nuevo', 'Registro de conectores', 'Qué fuente, punto o contorno, rápida o asíncrona, escala. Lo invoca procesamiento.')
IA = card(390, 402, 290, 56, 'Datos · almacen.py · nuevo', 'Almacén', 'Único que toca el disco: parcela, contexto, estados y resultados. Luego PostGIS.')

# ----------------------------------------------------------------- núcleo
N1 = card(740, 146, 290, 56, 'Datos · parcelas.py', 'Parcelas y contexto', 'Contorno GeoJSON y contexto declarado por el usuario. Sin parcelas ficticias.')
NG = card(740, 210, 290, 56, 'Función · geometria.py · nuevo', 'Geometría', 'Valida el contorno, área geodésica, píxeles de 30 m que caben, centroide. Sin límites inventados.')
N2 = card(740, 274, 290, 56, 'Función · indicadores.py', 'Indicadores', 'Conteos, promedios y totales de datos reales (p. ej., noches bajo 0 °C), con su resolución.')
NZ = card(740, 338, 290, 56, 'Función · zonal.py · nuevo', 'Estadística dentro del contorno', 'Píxeles dentro y válidos, cobertura y mediana. Sin umbral inventado de representatividad.')
N3 = card(740, 402, 290, 56, 'Función · datos_detallados.py', 'Datos detallados', 'Registros por nivel y metadatos. No ejecuta el motor.')

# ----------------------------------------------------------------- agente
A1 = card(1110, 150, 260, 80, 'Datos · agente/intenciones', 'Intenciones', 'frío · lluvia · por qué aparece un cultivo · qué falta · NDVI · fuentes · descargar · pronóstico (no).')
A2 = card(1400, 150, 260, 80, 'Función · agente/plantillas', 'Plantillas con datos', 'Cada respuesta se arma con valores reales y cita su procedencia. Si no hay dato, lo dice.')
A3 = card(1110, 300, 550, 72, 'Función · agente/banco', 'Banco por parcela y respuesta en vivo', 'GET banco de respuestas por parcela (exportable a la web publicada) · POST respuesta a una pregunta libre (solo en vivo). Sin modelo de IA.')
para('Lee indicadores, procedencia y los resultados del motor. Nunca inventa observaciones ni cambia las reglas. Un modelo de lenguaje queda como ampliación.', 'note', 1112, 392, 548)

# ----------------------------------------------------------------- motor
M_cat = card(40, 540, 230, 80, 'Datos · catalogo/ecocrop_2026-11-14.json', 'Catálogo citado (FAO EcoCrop)', 'Papa, haba, cebada, quinua: rangos copiados con su URL. Si EcoCrop no trae el dato → null.')
M_in = card(290, 540, 230, 80, 'Datos · entrada del motor', 'Contexto + indicadores + suelo', 'Datos reales con su procedencia + lo declarado por el usuario (cultivo, meses, agua).')
M_pri = card(540, 540, 230, 80, 'Datos · declaradas por el usuario', 'Prioridades', 'Ordenan la presentación. No se convierten en pesos ni en puntaje.')
para('<b>Reglas (DT-16):</b> <b>sin puntaje y sin pesos</b> · sin «apto / no apto» · solo rangos con cita · la altitud <b>no excluye</b> (conflicto verificado: EcoCrop 2800 m para papa; celda POWER de Chivay a 4352 m) · lo que falta se dice, no se rellena.', 'note', 790, 540, 240)
steps = [
    ('1 · estrategias.py', 'Candidatas', 'El cultivo actual declarado + todos los del catálogo de otra familia.'),
    ('2 · evidencia.py', 'Evidencia', 'Qué datos reales hay y cuáles faltan, por criterio.'),
    ('3 · comparacion.py', 'Comparación', 'Cada criterio frente al rango citado: óptimo · absoluto · fuera · sin dato · sin regla.'),
    ('4 · presentacion.py', 'Presentación', 'Orden según las prioridades declaradas. Sin puntaje.'),
    ('5 · explicacion.py', 'Explicación', 'Frases solo con datos y citas; vacíos y conflictos entre fuentes.'),
]
M = []
for i, (k, t, d) in enumerate(steps):
    M.append(card(40 + i * 199, 690, 181, 112, 'Función · ' + k, t, d))
para('Resultado: el <b>cultivo actual y todos los alternativos del catálogo</b> (con papa: 4; el desafío pide al menos 3, incluida la actual), cada uno <b>criterio por criterio con su cita</b>, sus vacíos y sus conflictos. Beneficios solo con cita. Compara el <b>siguiente cultivo</b>.', 'note', 40, 820, 980)

# ----------------------------------------------------------------- API
P1 = card(1110, 540, 260, 90, 'API · main.py (FastAPI)', 'Rutas', 'meta · parcelas · contexto · procesamiento · indicadores · clima · datos · rotaciones · agente. Docs en /docs.')
P2 = card(1400, 540, 260, 90, 'Datos · esquemas.py (Pydantic)', 'Contrato v0', 'Sobre común: data + procedencia + avisos + modo. Cada valor: fuente o «declarado por ti».')
P3 = card(1110, 680, 260, 80, 'Función · exportar.py', 'Exportar a JSON estático', 'GET /api/X → Codigo/public/api/X.json. Solo parcelas registradas con datos reales.')
P4 = card(1400, 680, 260, 80, 'Datos · meta.py', 'Meta y fecha de corte', 'Versión, modo (en vivo o publicado), fuentes usadas y fecha de los datos.')
P5 = card(1400, 776, 260, 70, 'Función · procesamiento.py · nuevo', 'Estado por fuente', 'POST procesar + GET estado: listo · parcial · en proceso · no disponible. Solo en vivo.')
para('<b>Solo en vivo:</b> POST parcelas · PUT contexto · POST procesar · POST rotaciones y agente. <b>Se exportan:</b> las GET. Diseño: backend/DISENO.md', 'note', 1400, 854, 262)

# ----------------------------------------------------------------- consumidores y ampliaciones
C1 = card(1110, 970, 170, 86, 'Pantalla · Codigo/ · inicio', 'Web TARPU', 'En vivo contra la API, o leyendo los JSON publicados (Vercel o Netlify).')
C2 = card(1300, 970, 170, 86, 'App · después', 'Android', 'Consumirá la misma API en vivo.', dim=True)
C3 = card(1490, 970, 170, 86, 'App · después', 'iOS', 'Implementada con la misma API; quizá sin lanzar.', dim=True)
for i, (k, t, d) in enumerate([
    ('Ampliación', 'Agente con LLM', 'Modelo de lenguaje con solo la evidencia autorizada (SUP-034).'),
    ('Ampliación', 'Base de datos PostGIS', 'Parcelas con geometría real y versiones (SUP-015, SUP-023).'),
    ('Ampliación', 'Identidad y permisos', 'Cuentas y acceso por parcela (SUP-026).'),
    ('Ampliación', 'Trabajos y caché', 'Descargas largas, reintentos y actualización automática (SUP-024).'),
    ('Ampliación', 'Más fuentes y reglas', 'HLS, IMERG, SMAP, ECOSTRESS, FAO GAEZ y revisión agronómica.'),
]):
    card(40 + i * 198, 970, 180, 86, k, t, d, dim=True)
para('Se priorizan después de la demo, según lo que aprendamos. Ninguna es necesaria para el recorrido del hackathon.', 'note', 40, 1072, 980)

# ----------------------------------------------------------------- flechas: fuentes → ingesta
for f in (F1, F2, F3):
    arrow([f['r'], (360, f['r'][1]), (360, I1['l'][1]), I1['l']], 'data')
arrow([F5['r'], (360, F5['r'][1]), (360, I1['l'][1]), I1['l']], 'data')
arrow([I1['b'], I2['t']], 'func')
arrow([IR['l'], (380, IR['l'][1]), (380, 184), (390, 184)], 'func', 'invoca', at=1)
arrow([I2['b'], I3['t']], 'data')
arrow([I3['r'], N2['l']], 'data')
arrow([(700, I3['r'][1]), (716, I3['r'][1]), (716, NZ['l'][1]), NZ['l']], 'data')
arrow([(716, NZ['l'][1]), (716, N3['l'][1]), N3['l']], 'data')
arrow([N1['b'], NG['t']], 'func')
arrow([NZ['t'], N2['b']], 'func')
arrow([NG['r'], (1044, NG['r'][1]), (1044, NZ['r'][1]), NZ['r']], 'data')

# núcleo → motor (por el canal entre filas)
arrow([N1['r'], (1062, N1['r'][1]), (1062, 482), (395, 482), (395, 540)], 'data', 'contexto de la parcela', at=2, lx=560)
arrow([N2['r'], (1070, N2['r'][1]), (1070, 490), (415, 490), (415, 540)], 'data', 'indicadores', at=2, lx=780, hops=[(1044, N2['r'][1]), (1062, N2['r'][1])])

# dentro del motor
arrow([(114, 620), (114, 690)], 'data', 'reglas')
arrow([(330, 620), (330, 690)], 'data')
arrow([(500, 620), (500, 660), (612, 660), (612, 690)], 'data')
arrow([(760, 620), (760, 690)], 'data', 'orden')
for a, b in zip(M, M[1:]):
    arrow([(a['r'][0], 746), (b['l'][0], 746)], 'func')

# motor → API y agente
arrow([(M[-1]['r'][0], 735), (1086, 735), (1086, 585), P1['l']], 'func', 'estrategias', at=0, lx=1024)
arrow([(M[-1]['r'][0], 784), (1078, 784), (1078, A3['l'][1]), A3['l']], 'data', 'motivos y vacíos', at=0, lx=1012)
arrow([N3['r'], (1054, N3['r'][1]), (1054, 610), (1110, 610)], 'nav', 'sin motor', at=1, hops=[(1078, 610), (1086, 610)])

# agente
arrow([A1['r'], A2['l']], 'func')
arrow([A2['b'], (1530, 300)], 'func', 'arma')
arrow([(1240, 372), (1240, 540)], 'func', 'GET y POST agente')

# API
arrow([P2['l'], P1['r']], 'data', 'valida')
arrow([P1['b'], P3['t']], 'func', 'rutas GET')
arrow([P4['l'], P3['r']], 'data', 'fecha')
arrow([P3['b'], (1240, 961), (1195, 961), (1195, 970)], 'nav', 'JSON estático', at=0)
arrow([(1370, 615), (1385, 615), (1385, 952), (1385, 970)], 'nav')
arrow([(1385, 952), (1575, 952), (1575, 970)], 'nav', 'API en vivo (después)', at=0, lx=1420)

# pie
c.setFont('Arial', 7.4)
c.setFillColor(INK3)
c.drawString(24, Y(1160), 'Mapa del backend en revisión · 14/11/2026 · DT-16: sin supuestos · Detalle de cada módulo en backend/MODULOS.md · Diseño y conexiones en backend/DISENO.md · Propuesta en backend/PROPUESTA.md · Reglas en backend/AGENTS.md')
c.drawRightString(W - 24, Y(1160), 'QENTARA · TARPU')
c.showPage()
c.save()
print('ok')
