"""Diagrama de archivos del backend de TARPU (compañero de tarpu-backend-mapa).

Genera backend/diagramas/tarpu-backend-archivos.pdf. Uso, desde la raíz del repositorio:
    python backend/diagramas/generar_archivos.py .
Luego, para el PNG: pdftoppm -png -r 110 -singlefile backend/diagramas/tarpu-backend-archivos.pdf backend/diagramas/tarpu-backend-archivos
Requiere reportlab y las fuentes Arial y Consolas de Windows.
Uso de IA: escrito con asistencia de Claude Code (14/11/2026); declarado en entrega/uso-de-ia.md.
"""
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(sys.argv[1])
OUT = ROOT / 'backend' / 'diagramas'
LOGO = ROOT / 'Codigo' / 'public' / 'brand' / 'tarpu-logo-black.png'

F = 'C:/Windows/Fonts/'
pdfmetrics.registerFont(TTFont('Arial', F + 'arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', F + 'arialbd.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Italic', F + 'ariali.ttf'))
pdfmetrics.registerFont(TTFont('Mono', F + 'consola.ttf'))
pdfmetrics.registerFont(TTFont('Mono-Bold', F + 'consolab.ttf'))
registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial-Italic', boldItalic='Arial-Bold')
registerFontFamily('Mono', normal='Mono', bold='Mono-Bold', italic='Mono', boldItalic='Mono-Bold')

W, H = 1700, 1045
INK = colors.HexColor('#111311')
INK2 = colors.HexColor('#4B504C')
INK3 = colors.HexColor('#868B85')
CARD_LINE = colors.HexColor('#D2D4CC')
DATA = colors.HexColor('#2F8F8A')
FUNC = colors.HexColor('#6C4BC2')
NAV = colors.HexColor('#5B6170')
OK = colors.HexColor('#2E7D32')
TODO = colors.HexColor('#B26A00')
IGN = colors.HexColor('#8A8F88')

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

c = canvas.Canvas(str(OUT / 'tarpu-backend-archivos.pdf'), pagesize=(W, H))
c.setTitle('TARPU · Archivos del backend')
c.setAuthor('QENTARA')
c.setFillColor(colors.HexColor('#F7F7F5'))
c.rect(0, 0, W, H, fill=1, stroke=0)


def Y(y):
    return H - y


ST = {
    'type': ParagraphStyle('type', fontName='Arial-Bold', fontSize=6.6, leading=8, textColor=INK3),
    'title': ParagraphStyle('title', fontName='Arial-Bold', fontSize=10.2, leading=12.2, textColor=INK),
    'file': ParagraphStyle('file', fontName='Arial', fontSize=7.5, leading=9.6, textColor=INK2, leftIndent=0),
    'note': ParagraphStyle('note', fontName='Arial', fontSize=7.8, leading=10.4, textColor=INK2),
    'tree': ParagraphStyle('tree', fontName='Mono', fontSize=7.9, leading=10.2, textColor=INK),
    'treed': ParagraphStyle('treed', fontName='Arial', fontSize=7.2, leading=9.2, textColor=INK2),
}


def ph(text, style, w):
    _, h = Paragraph(text, ST[style]).wrap(w, 2000)
    return h


def para(text, style, x, y, w):
    p = Paragraph(text, ST[style])
    _, h = p.wrap(w, 2000)
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


def file_line(name, desc):
    return f'<font name="Mono-Bold" color="#111311">{name}</font>  {desc}'


def card_h(w, kind, title, files):
    h = 8 + ph(kind.upper(), 'type', w - 18) + 3 + ph(title, 'title', w - 18) + 4
    for n, d in files:
        h += ph(file_line(n, d), 'file', w - 18) + 3
    return h + 6


def card(x, y, w, h, kind, title, files, dim=False):
    c.setFillColor(colors.white if not dim else colors.HexColor('#FAFAF8'))
    c.setStrokeColor(CARD_LINE)
    c.setLineWidth(0.8)
    if dim:
        c.setDash(2, 2)
    c.roundRect(x, Y(y + h), w, h, 4, fill=1, stroke=1)
    c.setDash()
    yy = y + 8
    yy += para(kind.upper(), 'type', x + 9, yy, w - 18) + 3
    yy += para(title, 'title', x + 9, yy, w - 18) + 4
    for i, (n, d) in enumerate(files):
        if i:
            c.setStrokeColor(colors.HexColor('#ECEDE8'))
            c.setLineWidth(0.5)
            c.line(x + 9, Y(yy - 1.5), x + w - 9, Y(yy - 1.5))
        yy += para(file_line(n, d), 'file', x + 9, yy, w - 18) + 3
    return {'l': (x, y + h / 2), 'r': (x + w, y + h / 2), 't': (x + w / 2, y), 'b': (x + w / 2, y + h), 'x': x, 'y': y, 'w': w, 'h': h}


def row(x0, y, total_w, gap, items, kind_zone=None):
    """items: (kind, title, files, weight). Igual alto para toda la fila."""
    tw = sum(i[3] for i in items)
    usable = total_w - gap * (len(items) - 1)
    ws = [usable * i[3] / tw for i in items]
    h = max(card_h(w, k, t, f) for w, (k, t, f, _) in zip(ws, items))
    out, x = [], x0
    for w, (k, t, f, _) in zip(ws, items):
        out.append(card(x, y, w, h, k, t, f))
        x += w + gap
    return out, h


def label(text, x, y, color):
    c.setFont('Arial', 6.8)
    tw = c.stringWidth(text, 'Arial', 6.8)
    c.setFillColor(colors.HexColor('#F7F7F5'))
    c.rect(x - 2, Y(y) - 2.5, tw + 4, 9.5, fill=1, stroke=0)
    c.setFillColor(color)
    c.drawString(x, Y(y), text)


def arrow(points, kind, text=None, at=0, lx=None):
    color = {'data': DATA, 'func': FUNC, 'nav': NAV}[kind]
    c.setStrokeColor(color)
    c.setLineWidth(1.0)
    if kind == 'data':
        c.setDash(3, 2.5)
    path = c.beginPath()
    path.moveTo(points[0][0], Y(points[0][1]))
    for x1, y1 in points[1:]:
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
c.drawString(140, Y(36), 'TARPU · Archivos del backend')
c.setFont('Arial', 8.6)
c.setFillColor(INK2)
c.drawString(140, Y(50), 'Carpetas, capas, módulos y lo que hace cada archivo · acompaña a tarpu-backend-mapa (módulos y flujo de datos) · sin supuestos (DT-16)')


def legend(x, kind, text):
    arrow([(x, 80), (x + 34, 80)], kind)
    c.setFont('Arial', 7.4)
    c.setFillColor(INK2)
    c.drawString(x + 42, Y(82.5), text)


legend(24, 'func', 'Importa: una capa solo usa las de abajo')
legend(250, 'data', 'Lee o escribe archivos')
legend(420, 'nav', 'Entrega a otra área')


def chip(x, y, text, color):
    c.setFont('Arial-Bold', 6.6)
    tw = c.stringWidth(text, 'Arial-Bold', 6.6)
    c.setFillColor(colors.white)
    c.setStrokeColor(color)
    c.setLineWidth(0.7)
    c.roundRect(x, Y(y) - 3, tw + 10, 11, 3, fill=1, stroke=1)
    c.setFillColor(color)
    c.drawString(x + 5, Y(y), text)
    return tw + 10


xx = 620
for t, col in (('EXISTE', OK), ('POR CREAR', TODO), ('IGNORADO POR GIT', IGN)):
    xx += chip(xx, 82.5, t, col) + 8
c.setFont('Arial', 7.4)
c.setFillColor(INK3)
c.drawRightString(W - 24, Y(82.5), 'Nombres de funciones: los de backend/DISENO.md · Área de Erick · datos: Damaris · frontend: Shantall')

# ================================================================= izquierda: árbol de carpetas
TX, TW = 20, 400
zone('consumo', TX, 108, TW, 525, 'Organización de la carpeta backend/', 'CARPETAS')

tree = [
    # (indent, name, desc, status)
    (0, 'backend/', '', None),
    (1, 'README.md', 'Punto de entrada: índice y resumen del área', 'ok'),
    (1, 'AGENTS.md', 'Reglas para asistentes de IA (DT-16)', 'ok'),
    (1, 'CLAUDE.md', 'Importa AGENTS.md para Claude Code', 'ok'),
    (1, 'DISENO.md', 'Cómo se conecta todo: recorrido, interfaces, errores, orden', 'ok'),
    (1, 'MODULOS.md', 'Qué es cada módulo y sus reglas', 'ok'),
    (1, 'PROPUESTA.md', 'Lo que se presenta en la reunión de unión', 'ok'),
    (1, 'requirements.txt', 'Versiones fijadas de FastAPI, Shapely, pyproj…', 'todo'),
    (1, '.env.example', 'Variables de config.py, sin valores secretos', 'todo'),
    (1, 'diagramas/', 'Mapa, archivos, interactivo y generadores', 'ok'),
    (1, 'catalogo/', 'Reglas citadas (van a git)', None),
    (2, 'ecocrop_2026-11-14.json', 'Rangos de FAO EcoCrop con su URL', 'ok'),
    (1, 'contrato/', 'Lo que se acuerda con el frontend', None),
    (2, 'esquemas/*.json', 'Generados por esquemas.py (Pydantic)', 'todo'),
    (2, 'ejemplos/', '', None),
    (3, 'indicadores_chivay.json', 'Calculado con POWER real 2015–2025', 'ok'),
    (1, 'tarpu_api/', 'El código: 4 capas (derecha)', 'todo'),
    (2, 'config · almacen · catalogo · conectores', 'capa 1 · apoyo', None),
    (2, 'parcelas · geometria · ingesta', 'capa 2 · núcleo', None),
    (2, 'zonal · indicadores · datos_detallados', 'capa 2 · núcleo', None),
    (2, 'motor/ · agente/', 'capa 3 · lógica', None),
    (2, 'main · esquemas · meta', 'capa 4 · API', None),
    (2, 'procesamiento · exportar', 'capa 4 · API', None),
    (1, 'tests/', 'Una prueba por módulo (abajo)', 'todo'),
    (1, 'almacen/', 'Lo escribe solo almacen.py', 'ign'),
    (2, 'parcelas/{id}/', 'parcela · contexto · procesamiento', None),
    (3, '', 'indicadores · rotaciones (.json)', None),
    (2, 'cache/{fuente}/{clave}/', 'Archivos de los conectores', None),
    (1, '.venv/', 'Entorno virtual de Python', 'ign'),
]
ty = 140
for ind, name, desc, st in tree:
    x = TX + 16 + ind * 16
    if ind:
        c.setStrokeColor(colors.HexColor('#B9BFC9'))
        c.setLineWidth(0.6)
        c.line(x - 9, Y(ty - 4), x - 3, Y(ty - 4))
        c.line(x - 9, Y(ty - 13), x - 9, Y(ty - 4))
    c.setFont('Mono-Bold' if name.endswith('/') or ind == 0 else 'Mono', 7.9)
    c.setFillColor(INK)
    c.drawString(x, Y(ty), name)
    nx = x + c.stringWidth(name, c._fontname, 7.9) + 6 if name else x
    if st:
        col = {'ok': OK, 'todo': TODO, 'ign': IGN}[st]
        c.setFillColor(col)
        c.circle(nx + 2.5, Y(ty - 2.6), 2.5, fill=1, stroke=0)
        nx += 9
    c.setFont('Arial', 7.1)
    c.setFillColor(INK2)
    dx = max(nx, TX + 200) if ind <= 1 and len(name) < 22 else nx
    c.drawString(dx, Y(ty), desc)
    ty += 14.5

para('<b>Por qué así:</b> la documentación vive en la raíz del área para que cualquiera (o Codex) la encuentre primero. '
     '<b>catalogo/</b> y <b>contrato/</b> son datos y acuerdos versionados en git: el motor y el frontend dependen de ellos. '
     '<b>tarpu_api/</b> es un paquete de Python (se ejecuta con <font name="Mono">python -m tarpu_api…</font>). '
     '<b>almacen/</b> y <b>.venv/</b> se generan en cada computadora y no se suben. '
     'Los conectores <b>no</b> están aquí: viven en <font name="Mono">datos/</font> (Damaris).', 'note', TX + 14, ty + 4, TW - 28)

# ----------------------------------------------------------------- izquierda: pruebas
zone('ampl', TX, 653, TW, 186, 'tests/ · una prueba por módulo', 'POR CREAR')
tests = [
    ('test_geometria.py', 'contorno con cruces rechazado con motivo; área de un polígono conocido'),
    ('test_ingesta.py', 'celda vacía → None, nunca 0; unidades conservadas'),
    ('test_zonal.py', 'píxeles dentro, válidos y cobertura con valores conocidos'),
    ('test_indicadores.py', 'reproduce indicadores_chivay.json desde el CSV de POWER'),
    ('test_catalogo.py', 'rechaza una regla sin fuente; coincide con EcoCrop'),
    ('test_motor.py', 'papa → 4 estrategias; sin_dato; la altitud no excluye; sin puntaje'),
    ('test_agente.py', 'cada respuesta cita su fuente; «pronóstico» → TARPU no pronostica'),
    ('test_datos_detallados.py', 'no importa motor'),
    ('test_rutas.py', 'cada GET cumple su esquema; exportar escribe un archivo por ruta'),
]
yy = 687
for n, d in tests:
    yy += para(file_line(n, d), 'file', TX + 14, yy, TW - 28) + 4
para('Herramienta: pytest + TestClient de FastAPI (sin levantar el servidor). Casos de DISENO.md, sección 10.', 'note', TX + 14, yy + 4, TW - 28)

# ================================================================= derecha: capas de tarpu_api/
RX, RW = 450, 1230
IX, IW = RX + 20, RW - 40   # interior de las zonas

# ---- capa 4 · API
api_items = [
    ('Capa 4 · API · tarpu_api/main.py', 'Rutas', [
        ('main.py', 'Crea la app FastAPI, CORS y las rutas. Cada ruta delega en un módulo; no calcula nada. Documentación en /docs.')], 1.15),
    ('Capa 4 · API · contrato', 'Esquemas', [
        ('esquemas.py', 'Modelos Pydantic. Sobre común {data, procedencia, avisos, modo, generado}; cada valor: fuente o «declarado». Genera contrato/esquemas/*.json.')], 1.15),
    ('Capa 4 · API', 'Meta', [
        ('meta.py', 'GET /api/meta: versión, modo (en_vivo o publicado), fuentes usadas y fecha de los datos.')], 0.95),
    ('Capa 4 · API · solo en vivo', 'Procesamiento', [
        ('procesamiento.py', 'iniciar(id): marca cada fuente en_proceso y lanza BackgroundTasks. Estado: listo · parcial · no_disponible + motivo real.')], 1.15),
    ('Capa 4 · API · comando', 'Exportar', [
        ('exportar.py', 'python -m tarpu_api.exportar: cada GET con TestClient → Codigo/public/api/**.json. Solo parcelas registradas con datos reales.')], 1.15),
]
api_h = max(card_h(IW * w / 5.55 - 8, k, t, f) for k, t, f, w in api_items)
zone('api', RX, 108, RW, api_h + 52, 'Capa 4 · API y salida · lo que ve el frontend', 'DT-13')
API, _ = row(IX, 140, IW, 10, api_items)
y_api_end = 108 + api_h + 52

# ---- capa 3 · lógica
L_Y = y_api_end + 30
motor_files = [
    ('__init__.py', 'comparar(parcela, contexto, indicadores) → estrategias. Única función pública del motor.'),
    ('estrategias.py', '1 · E1 = repetir el cultivo actual declarado; E2… = todos los del catálogo de otra familia.'),
    ('evidencia.py', '2 · Qué datos reales hay y cuáles faltan, por estrategia y criterio.'),
    ('comparacion.py', '3 · Temperatura, frío, lluvia, suelo y familia frente al rango citado: dentro_optimo · dentro_absoluto · fuera_absoluto · sin_dato · sin_regla.'),
    ('presentacion.py', '4 · Ordena los criterios según las prioridades declaradas. Sin pesos ni puntaje.'),
    ('explicacion.py', '5 · Frases solo con datos y citas; vacíos y conflictos entre fuentes (altitud).'),
]
agente_files = [
    ('intenciones.py', 'Reconoce 8 intenciones: frío, lluvia, por qué aparece un cultivo, qué falta, qué es el NDVI, fuentes, descargar y pronóstico.'),
    ('plantillas.py', 'Arma cada respuesta con valores reales y su cita. Sin dato, lo dice. Pronóstico → «TARPU no pronostica».'),
    ('banco.py', 'GET: banco de respuestas por parcela (se exporta). POST: pregunta libre (solo en vivo).'),
]
mw, aw = IW * 0.6 - 5, IW * 0.4 - 5
lh = max(card_h(mw, 'x', 'x', motor_files), card_h(aw, 'x', 'x', agente_files))
zone('motor', RX, L_Y, RW, lh + 52, 'Capa 3 · Lógica · motor/ y agente/ (paquetes)', 'SOLO LEEN LO CALCULADO')
MOT = card(IX, L_Y + 32, mw, lh, 'Paquete · tarpu_api/motor/ · 6 archivos', 'Motor de comparación (FAO EcoCrop citado)', motor_files)
AGE = card(IX + mw + 10, L_Y + 32, aw, lh, 'Paquete · tarpu_api/agente/ · DT-14, sin modelo de IA', 'Agente guiado', agente_files)
y_l_end = L_Y + lh + 52

# ---- capa 2 · núcleo
N_Y = y_l_end + 30
nuc_items = [
    ('Núcleo · declarado', 'Parcelas', [('parcelas.py', 'crear(...): id y versión. Contexto declarado: cultivo actual y anterior, agua, meses, prioridades. «No sé» = desconocido.')], 1),
    ('Núcleo · Shapely + pyproj', 'Geometría', [('geometria.py', 'validar · area_ha (geodésica) · pixeles_30m · centroide · recuadro. Sin límites de tamaño inventados.')], 1),
    ('Núcleo · lee conectores', 'Ingesta', [('ingesta.py', 'leer(...): normalizado + procedencia → registros. Celda vacía → None, nunca 0. Conserva unidades.')], 1),
    ('Núcleo · rasterio + NumPy', 'Zonal', [('zonal.py', 'resumir(...): solo 30 m (HLS, SRTM). Píxeles dentro, válidos, cobertura, mediana y cuartiles.')], 1),
    ('Núcleo · pandas', 'Indicadores', [('indicadores.py', 'actualizar(id): temperatura por mes, noches bajo 0 °C, lluvia por mes y año, meses sin dato.')], 1),
    ('Núcleo · DEC-003', 'Datos detallados', [('datos_detallados.py', 'Registros original, normalizado y derivado con metadatos. No importa el motor.')], 1),
]
nh = max(card_h(IW / 6 - 9, k, t, f) for k, t, f, _ in nuc_items)
zone('nucleo', RX, N_Y, RW, nh + 52, 'Capa 2 · Núcleo de datos · un archivo por responsabilidad', 'tarpu_api/')
NUC, _ = row(IX, N_Y + 32, IW, 10, nuc_items)
y_n_end = N_Y + nh + 52

# ---- capa 1 · apoyo + datos/ (externo)
S_Y = y_n_end + 30
sup_items = [
    ('Apoyo · entorno', 'Configuración', [('config.py', 'Lee TARPU_MODO, TARPU_DATOS_DIR, TARPU_ALMACEN_DIR, TARPU_CATALOGO, TARPU_EXPORT_DIR y TARPU_CORS.')], 1),
    ('Apoyo · disco', 'Almacén', [('almacen.py', 'guardar / leer JSON en almacen/parcelas/{id}/ y cache/. Único módulo que toca el disco; luego, PostGIS.')], 1),
    ('Apoyo · reglas', 'Catálogo', [('catalogo.py', 'Carga catalogo/ecocrop_2026-11-14.json y rechaza cualquier regla sin fuente.')], 1),
    ('Apoyo · unión con datos/', 'Registro de conectores', [('conectores.py', 'Por fuente: función obtener(), punto o contorno, al momento o por solicitud, resolución. POWER · SoilGrids · MODIS · HLS · SRTM.')], 1.1),
]
SW = IW - 250
DAT_FILES = [('power/consulta_power.py', 'Existe: escribe original, normalizado y procedencia.'),
             ('obtener(...)', 'Función por fuente que se propone a Damaris (DISENO §7).')]
sh = max([card_h(SW / 4.1 - 8, k, t, f) for k, t, f, _ in sup_items] + [card_h(208, 'Área de datos · no es del backend', 'Conectores', DAT_FILES)])
zone('ingesta', RX, S_Y, RW - 250, sh + 52, 'Capa 1 · Apoyo · lo usan todas las demás', 'tarpu_api/')
SUP, _ = row(IX, S_Y + 32, SW, 10, sup_items)
zone('fuentes', RX + RW - 236, S_Y, 236, sh + 52, 'Fuera del backend · datos/', 'DAMARIS')
DAT = card(RX + RW - 222, S_Y + 32, 208, sh, 'Área de datos · no es del backend', 'Conectores',
           DAT_FILES)
y_s_end = S_Y + sh + 52

# ----------------------------------------------------------------- flechas entre capas (lado izquierdo)
ax = RX - 14
arrow([(ax, 120), (ax, y_s_end - 10)], 'func')
c.saveState()
c.setFont('Arial-Bold', 7)
c.setFillColor(FUNC)
c.translate(ax - 4, Y((120 + y_s_end) / 2))
c.rotate(90)
c.drawCentredString(0, 0, 'importa hacia abajo · nada importa hacia arriba')
c.restoreState()

# conectores.py → datos/
arrow([SUP[3]['r'], DAT['l']], 'nav', 'invoca')
# almacen ↔ disco
arrow([(SUP[1]['x'] + 30, S_Y + 32 + sh), (SUP[1]['x'] + 30, y_s_end + 12)], 'data')
label('almacen/  (parcela · contexto · procesamiento · indicadores · rotaciones · cache)', SUP[1]['x'] + 38, y_s_end + 12, DATA)
# exportar → frontend

# notas de por qué, bajo las capas
NY = y_s_end + 34
para('<b>Por qué cuatro capas.</b> Cada capa solo importa las de abajo, así un cambio en una fuente o en el disco no rompe el motor ni las pantallas. '
     '<b>Capa 1</b> concentra lo que cambia por computadora o por proveedor (variables, disco, catálogo, registro de conectores). '
     '<b>Capa 2</b> convierte archivos en datos con procedencia, un archivo por responsabilidad para probarlos por separado. '
     '<b>Capa 3</b> solo lee lo ya calculado: el motor y el agente nunca descargan ni tocan el disco, por eso dan siempre la misma respuesta con los mismos datos. '
     '<b>Capa 4</b> es lo único que conoce HTTP; si mañana llega Android o iOS, consume las mismas rutas.', 'note', RX, NY, RW)
para('<b>Por qué el motor y el agente son paquetes (carpetas) y el resto archivos sueltos.</b> El motor tiene cinco pasos encadenados con una sola entrada pública (<font name="Mono">comparar</font>); '
     'el agente tiene tres piezas que se prueban por separado. Los demás módulos hacen una sola cosa y caben en un archivo.', 'note', RX, NY + 44, RW)

# ----------------------------------------------------------------- recorrido → archivos
R_Y = NY + 80
steps = [
    ('0 · Inicio', 'GET /api/meta', [('main → meta', ''), ('config', '')]),
    ('2 · Dibujar parcela', 'POST /api/parcelas', [('esquemas →', ''), ('geometria →', ''), ('parcelas → almacen', '')]),
    ('3 · Contar mi campo', 'PUT …/contexto', [('esquemas →', ''), ('parcelas →', ''), ('catalogo → almacen', '')]),
    ('4 · Preparar datos', 'POST …/procesar', [('procesamiento →', ''), ('conectores → datos/', ''), ('ingesta → zonal →', ''), ('indicadores → almacen', '')]),
    ('5 · Cómo está mi campo', 'GET …/indicadores', [('indicadores →', ''), ('almacen', '')]),
    ('6 · Qué siembro', 'GET …/rotaciones', [('motor/ (5 pasos)', ''), ('catalogo · almacen', '')]),
    ('7 · Pregunta a Tarpu', 'GET · POST agente', [('agente/ (3)', ''), ('lee indicadores', ''), ('y rotaciones', '')]),
    ('8 · Ver y descargar', 'GET …/datos', [('datos_detallados', ''), ('→ ingesta', ''), ('sin motor', '')]),
    ('Publicar', 'exportar', [('cada GET con', ''), ('TestClient →', ''), ('Codigo/public/api/', '')]),
]
gap = 8
cw = (IW - gap * (len(steps) - 1)) / len(steps)
rh = max(card_h(cw, k, t, f) for k, t, f in steps)
zone('consumo', RX, R_Y, RW, rh + 52, 'Recorrido del usuario → archivos que intervienen, en orden (DISENO.md §4)', 'PASO A PASO')
prev = None
for i, (k, t, f) in enumerate(steps):
    cd = card(IX + i * (cw + gap), R_Y + 32, cw, rh, k, t, f)

# ----------------------------------------------------------------- comandos (izquierda)
zone('agente', TX, 859, TW, R_Y + rh + 52 - 859, 'Cómo se ejecuta (cuando exista el código)', 'DISENO §12')
cmds = [
    ('python -m venv backend/.venv', 'crea el entorno'),
    ('pip install -r backend/requirements.txt', 'instala las versiones fijadas'),
    ('uvicorn tarpu_api.main:app --reload --port 8000', 'API en vivo; /docs'),
    ('python -m tarpu_api.exportar', 'JSON para la web publicada'),
    ('python -m pytest', 'todas las pruebas'),
]
yy = 893
for n, d in cmds:
    yy += para(file_line(n, d), 'file', TX + 14, yy, TW - 28) + 4

# pie
c.setFont('Arial', 7.4)
c.setFillColor(INK3)
c.drawString(24, Y(H - 20), 'Archivos del backend · 14/11/2026 · DT-16: sin supuestos · Flujo de datos en backend/diagramas/tarpu-backend-mapa.pdf · Detalle en backend/MODULOS.md y backend/DISENO.md')
c.drawRightString(W - 24, Y(H - 20), 'QENTARA · TARPU')
c.showPage()
c.save()
print('ok', y_s_end, NY)
