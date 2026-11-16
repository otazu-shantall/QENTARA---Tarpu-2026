# 20 · Pulido: tarjetas interactivas, rotación con el motor, historial por año, ayuda, tutorial y asistente

> 15/11/2026 · Erick, con Claude Code. Pedido de Erick tras probar la versión del [informe 19](19-mi-campo-simple.md).

## Qué cambió

- **Rotación de cultivos (lo central del desafío).** Página nueva `/app/rotacion` (reemplaza a «Recomendaciones»): el agricultor declara su cultivo, su agua y sus meses de campaña, y el motor del backend compara cada cultivo del catálogo, criterio por criterio, con el clima y el suelo del lugar. Cada tarjeta dice por qué aparece el cultivo, muestra cada criterio con su estado (en su rango ideal, lo tolera, fuera de lo que tolera, falta un dato…) y la explicación con cita. Sin puntaje ni «ganador». Debajo, los cultivos con más superficie en la zona (censo 2012).
  - **Backend:** ruta `POST /api/rotaciones` (lugar + contexto en una llamada). El motor ahora lee POWER de la celda de la base de Arequipa (`conectores.py`) y recibe el pH de SoilGrids de la base. Antes fallaba en Docker porque buscaba el conector antiguo de `datos/`.
- **«Lo que encontramos», interactivo.** Cada tarjeta tiene «¿Qué es este dato?»: una ventana que explica ese tipo de dato (definición y fuente, `dashboard/about.ts`), con enlace a su fuente y el botón «Explorar más con Yachaq». Cuatro tarjetas nuevas: temperatura de la superficie, humedad del aire, energía del sol y tamaño de la parcela.
- **Asistente con nombre: Yachaq** («el que sabe», en quechua). Es una **propuesta por confirmar con el equipo**; se cambia en una línea (`src/lib/agent.ts`). Ahora explica cada tipo de dato (pH, pendiente, altitud, textura, verdor, cobertura, radiación) y se abre con la pregunta ya enviada desde las tarjetas. Sigue sin modelo de IA (DT-14).
- **Mapa:** al elegir un lugar hace zoom a él (16 en puntos; ajuste al contorno en parcelas) y hay un botón «Ir a mi campo».
- **Historial, rehecho.** Se elige la variable (8 disponibles, incluidas las de MODIS) y el año; el gráfico muestra cada mes del año frente al promedio y al rango de todos los años, con el total o promedio del año, el mes más alto y el más bajo, y la tabla plegada. Un mes incompleto se marca y su lluvia no se da como total.
- **Ayuda y fuentes, como página** (`/app/ayuda`) con tres pestañas: cómo usar TARPU, preguntas frecuentes y fuentes (cada una con quién la publica, para qué se usa, su escala y su enlace). Los círculos «i» de la aplicación llevan a la fuente correspondiente.
- **Tutorial guiado** (`help/Tour.tsx`): 10 pasos que resaltan cada parte de la pantalla; explica los lugares de referencia. Se abre la primera vez y se repite desde Ayuda.
- **Mis informes:** ahora es una hoja del campo (lugar, suelo, clima del último año, cultivos de la zona frente al pH y avisos) con «Imprimir o guardar PDF» y descarga de datos.
- **Mi proveedor de IA:** aclara que hoy el asistente funciona sin proveedor y que solo se guarda una preferencia.
- **`npm start`:** si la web ya está encendida en el puerto 5174, la reutiliza.

## Límites que conviene saber

- **El catálogo del motor tiene 4 cultivos** (papa, haba, cebada y quinua), los únicos con familia y rangos copiados de FAO EcoCrop con su cita. Para la costa (Majes) son pocas alternativas. Ampliarlo requiere copiar la familia de cada cultivo desde su ficha.
- **Beneficios de la rotación:** el motor responde «sin fuente citada todavía».
- **Estudio técnico:** no se rediseñó en esta vuelta; solo recibe las series nuevas.
- El nombre «Yachaq» y los textos del tutorial y de las preguntas frecuentes están por revisar con el equipo.

## Comprobaciones

- Backend: 22 pruebas. Frontend: 11 pruebas y compilación.
- Recorrido en Chrome contra la API de Docker: tutorial, ventana de detalle y asistente, historial, rotación (al menos tres estrategias, incluida la actual, sin la palabra «puntaje»), ayuda y fuentes, informe, dibujo de parcela con extracción y tema oscuro.
