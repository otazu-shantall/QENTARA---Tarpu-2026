# Historial (solo lectura)

Material de sesiones anteriores. Se conserva como referencia; **la documentación vigente está en `docs/` y en el informe maestro**. Estos archivos no se mueven, para no romper rutas que dependen de ellos.

| Material | Dónde está | Qué es |
|---|---|---|
| Contexto integral | [TARPU_QENTARA_Contexto_Integral.md](../../TARPU_QENTARA_Contexto_Integral.md) (raíz) | Antecedente completo v1.0 (19/10/2026): propuestas originales, preguntas recuperadas, ejemplos ficticios y límites de la información original |
| Auxiliares del informe | `tmp/documentacion/` | Generador del PDF (`generar.py`, que lee `maestra.md`), registros de compilación, capturas de revisión y copias de versiones anteriores (`originales/`) |
| Scripts de revisiones antiguas | `tmp/documentacion/editar_v03.py`, `editar_v04.py` | Transformaciones de revisiones concretas. **No se vuelven a ejecutar** |
| Auxiliares del dashboard | `tmp/dashboard/` | Script de revisión visual, perfiles de navegador, imagen de referencia de La Joya y comprobación de teselas |
| Branding original | `Logo Tarpu.png`, `Tarpu_ Branding.png` (raíz) | Logo a color y referencia de branding aportados por el usuario |

## Diferencias principales con lo vigente

- **Stack:** el contexto proponía React, MapLibre, Plotly y FastAPI (su propuesta P-03). El prototipo usa Leaflet y SVG; el stack del producto sigue abierto (SUP-015).
- **Visual:** el contexto proponía verde y crema, alto contraste y glasmorfismo moderado (su P-11). Ahora la propuesta es «mapa protagonista» con el logo en blanco y negro (DT-05, DT-06).
- **Códigos:** el contexto usa códigos `P-xx` para sus propuestas. Las decisiones de trabajo vigentes usan `DT-xx` ([06](../06-decisiones-y-riesgos.md)) para no confundirse con ellos.
- **Territorio y plazos:** las definiciones confirmadas después (todo Arequipa, DEC-001; sin calendarios de desarrollo, DEC-004) mandan sobre cualquier redacción anterior.
- **Supuestos cerrados:** SUP-001, SUP-003 y SUP-004 se cerraron por confirmación y no se reutilizan.
- **Prioridad:** no se restaura una propuesta antigua del contexto si ya fue corregida o aceptada después.

## Registro local de frontend

[Decisiones de frontend anteriores a la integración](decisiones-frontend-locales.md): conserva los identificadores locales que coincidían con otros del equipo. El registro vigente es `docs/06`, con DT-25 para frontend.
