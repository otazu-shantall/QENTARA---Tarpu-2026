"""Consulta el REDATAM del IV CENAGRO 2012 (INEI): tabla de un cultivo por una variable, para un departamento.

Uso: python backend/herramientas/redatam_cenagro.py "<universo>" UNIDADAG.WPISO salida.json
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
import re, html, sys, json, urllib.request, urllib.parse
B='http://censos1.inei.gob.pe/cgibin/RpWebEngine.exe/Crosstabs'
H={'User-Agent':'Mozilla/5.0 (tarpu-qentara-hackathon)'}
def consulta(universe, var2, select='arequipa.sel', tally='CCULTIVO.CP025', item='USOT206', var3=''):
    datos=urllib.parse.urlencode({'MAIN':'WebServerMain.inl','BASE':'IVCENAGRO','CODIGO':'xxUsuarioxx','ITEM':item,'TITLE':'','TALLY':tally,
        'INLINESELECTION':'','UNIVERSE':universe,'VAR1':'CCULTIVO.CP02403N','VAR2':var2,'VAR3':var3,'AREABREAK':'','SELECT':select,
        'PERCENT':'OFF','FORMAT':'HTML','SUBMIT':'Ejecutar'}).encode()
    t=urllib.request.urlopen(urllib.request.Request(B,data=datos,headers=H),timeout=600).read().decode('latin1')
    m=re.search(r'<iframe src="([^"]+)"',t)
    if not m:
        err=html.unescape(re.sub(r'<[^>]+>',' ',t)); raise SystemExit('sin tabla: '+re.sub(r'\s+',' ',err)[:600])
    t2=urllib.request.urlopen(urllib.request.Request(m.group(1).replace(' ',''),headers=H),timeout=600).read().decode('latin1')
    filas=[]
    for tr in re.findall(r'<tr.*?</tr>',t2,flags=re.S|re.I):
        celdas=[html.unescape(re.sub(r'<[^>]+>','',c)).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>',tr,flags=re.S|re.I)]
        if any(celdas): filas.append(celdas)
    return filas
if __name__=='__main__':
    f=consulta(sys.argv[1], sys.argv[2]); json.dump(f,open(sys.argv[3],'w',encoding='utf-8'),ensure_ascii=False)
    for r in f[:12]: print(r)
    print('...',len(f),'filas')
