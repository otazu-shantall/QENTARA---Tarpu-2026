# Área de datos satelitales · reglas para asistentes de IA

Complementa el `AGENTS.md` de la raíz; si hay contradicción, manda el de la raíz.

- **Responsable:** Damaris. Esta carpeta es suya.
- **Misión:** saber qué datos de satélite usa TARPU, cómo se extraen y qué dicen (y qué no) sobre una parcela de Arequipa.

## Qué leer primero

1. [README.md](README.md): guía del área.
2. [analisis-recursos.md](analisis-recursos.md): qué fuentes sirven para Arequipa, verificado el 14/11/2026.
3. [power/consulta_power.py](power/consulta_power.py): el ejemplo que funciona. Cualquier script nuevo sigue su formato.
4. [../docs/areas/propuesta-datos.md](../docs/areas/propuesta-datos.md): la propuesta del área para la reunión de unión.

## Reglas

- **Cada consulta deja tres archivos en `muestras/`:**
  - `.original.*`: la respuesta del proveedor, sin tocar;
  - `.normalizado.csv`: una fila por fecha, con las unidades en la cabecera;
  - `.procedencia.json`: URL exacta, fecha de consulta, producto, versión, unidades, faltantes y escala.
- **Un faltante nunca se convierte en cero.** Se deja vacío o `null`, y se cuenta.
- **Prefiere los servicios sin cuenta:** POWER, el NDVI del servicio de ORNL, SoilGrids y GIBS. El servicio de ORNL es inestable: pide pocas fechas por vez (unas 10) y reintenta si responde 502.
- **Cuentas y claves:** si una fuente pide cuenta (Earthdata, Copernicus), las credenciales van en variables de entorno o en `~/.netrc`, **nunca** en el repositorio.
- **Archivos pesados:** no los subas al repositorio (HDF5, NetCDF, GeoTIFF grandes). Guarda muestras pequeñas y escribe cómo obtener el resto.
- **Cada dato con sus límites:** un valor de celda regional no es una medición en la parcela; el NDVI no es fertilidad.
- **Recursos de Estados Unidos:** no propongas USDA, USGS, PRISM, OpenET ni CoCoRaHS para Arequipa. Ver la sección 5 del análisis.
- **Python solo con la biblioteca estándar** mientras se pueda. Si hace falta una dependencia, anótala en el README del área.
- **Uso de IA:** si escribes o modificas un script, añade al encabezado «Escrito con asistencia de IA (<herramienta>)» y una fila en [../entrega/uso-de-ia.md](../entrega/uso-de-ia.md).
- **Al terminar algo que funcione:** actualiza la tabla de fuentes del [README](README.md) y añade la fuente a [../entrega/referencias.md](../entrega/referencias.md).
