# Propuesta del área de backend, conectores y motor

> Responsable: **Erick**. Fase 1 del [ROADMAP](../../ROADMAP.md): planificación del primer avance, para presentar en la reunión de unión. Revisada el 14/11/2026 para quitar todo supuesto (DT-16) y ajustada a las tres fuentes de la demo (DT-17).
>
> **Estado:** el backend ya está **construido y probado** (15 pruebas; recorrido completo en vivo con NASA POWER). Ver [README.md](README.md).
>
> - **Diseño completo:** [DISENO.md](DISENO.md): recorrido por módulo, herramientas, interfaces con datos y frontend, errores, pruebas y orden de construcción.
> - **Módulos:** [MODULOS.md](MODULOS.md) y los [diagramas](diagramas/).
> - **Recorrido del usuario y escala:** [docs/10-recorrido-y-escala.md](../../docs/10-recorrido-y-escala.md).

## 0. En una frase

El usuario dibuja su campo y declara lo que siembra. El backend pide a los conectores del área de datos los datos reales del **centroide** de ese campo (NASA POWER, NDVI de MODIS y SoilGrids), los describe (conteos, promedios y totales) y compara cada cultivo con rangos **citados** de FAO EcoCrop, sin puntajes ni pesos inventados. Todo se sirve por una API FastAPI y se exporta a JSON para la web publicada.

## 1. Decisiones tomadas

| ID | Decisión |
|---|---|
| DT-13 | API FastAPI para trabajar en vivo y exportación a JSON para la web publicada, con las mismas rutas. Sin base de datos en la demo |
| DT-14 | Agente guiado con plantillas y datos reales, sin modelo de IA |
| DT-15 | Publicación en Vercel o Netlify |
| **DT-16** | **Cero supuestos:** todo valor viene de una fuente real o lo declara el usuario; ninguna regla sin cita; nada sintético en la demo; lo que no se sabe se dice. Pedido de Erick (14/11/2026) |
| **DT-17** | **Solo tres fuentes:** NASA POWER, NDVI de MODIS (ORNL) y SoilGrids, consultadas en el centroide. Indicación de Erick (14/11/2026); confirmar con Damaris |

## 2. Lo que ya existe, con datos reales

| Pieza | Qué contiene |
|---|---|
| [catalogo/ecocrop_2026-11-14.json](catalogo/ecocrop_2026-11-14.json) | Rangos de FAO EcoCrop para papa, haba, cebada y quinua: temperatura, lluvia anual, pH, altitud, temperatura letal y ciclo. Copiados tal cual, con la URL de cada hoja; `null` donde EcoCrop no trae el dato |
| [contrato/ejemplos/indicadores_chivay.json](contrato/ejemplos/indicadores_chivay.json) | Ejemplo del contrato calculado con NASA POWER, 2015–2025, para el punto de Chivay |

**Datos reales de ese ejemplo (POWER, promedio 2015–2025, celda regional):**

| Mes | Noches con mínima bajo 0 °C (promedio) | Lluvia media (mm) |
|---|---|---|
| Junio, julio y agosto | 28,8 · 29,2 · 29,2 | 10,7 · 5,2 · 1,7 |
| Enero, febrero y marzo | 4,6 · 3,9 · 3,5 | 44,4 · 66,5 · 46,8 |

Lluvia anual entre 176 mm (2021) y 405 mm (2025). La celda de POWER informa una altitud de 4352 m.

## 3. Contrato (resumen)

| Ruta | Pantalla | Web publicada | Devuelve |
|---|---|---|---|
| `GET /api/meta` · `GET /api/catalogo` | Todas | ✅ | Versión, modo (`en_vivo` o `publicado`), fuentes con su estado, período; catálogo citado |
| `POST /api/parcelas` · `PUT …/contorno` | Dibujar mi parcela | ❌ en vivo | Área y perímetro geodésicos, píxeles de MODIS (250 m) que caben, centroide |
| `PUT …/contexto` | Contar mi campo | ❌ en vivo | Lo declarado por el usuario |
| `POST …/procesar` · `GET …/procesamiento` | Preparando tus datos | ❌ en vivo | Estado real por fuente |
| `GET /api/parcelas` · `GET /api/parcelas/{id}` | Mis parcelas | ✅ | Parcelas registradas |
| `GET …/indicadores` · `…/clima` | Cómo está mi campo | ✅ | Descripciones de datos reales, con procedencia |
| `GET …/rotaciones` | Qué siembro después | ✅ | Comparación por criterio con citas, sin puntaje |
| `GET …/agente` · `POST /api/agente` | Pregunta a Tarpu | ✅ / ❌ | Respuestas con datos y citas |
| `GET …/datos` | Ver y descargar | ✅ | Registros y metadatos, sin motor |

Sobre común de todas las respuestas: `{ data, procedencia, avisos, modo, generado }`. Cada valor indica si viene de una **fuente** o fue **declarado por el usuario**.

## 4. El motor, en resumen

1. **Estrategias:** el cultivo actual declarado más **todos** los del catálogo de otra familia. Con papa salen 4 estrategias; el desafío pide al menos 3.
2. **Evidencia:** qué datos reales hay y cuáles faltan.
3. **Comparación por criterio** frente a EcoCrop:
   - temperatura de los meses declarados;
   - noches bajo la temperatura letal;
   - lluvia anual;
   - pH;
   - familia.

   Cada criterio sale `dentro_optimo`, `dentro_absoluto`, `fuera_absoluto`, `sin_dato` o `sin_regla`.
4. **Presentación** ordenada por las prioridades que declara el usuario, **sin pesos ni puntaje**.
5. **Explicación** con datos y citas, más los vacíos y los conflictos entre fuentes.

**Conflicto verificado que se muestra en vez de decidirlo:** EcoCrop da una altitud máxima de 2800 m para la papa, y la celda de POWER de Chivay está a 4352 m, donde se cultiva papa. La altitud no se usa para excluir.

## 5. Lo que necesito de otras áreas

| De | Qué | Para qué |
|---|---|---|
| Damaris | Acordar la interfaz `obtener()` de los conectores ([DISENO.md, sección 7](DISENO.md#7-cómo-nos-conectamos-con-el-área-de-datos-damaris)) | Que el backend invoque sus conectores |
| Damaris | Conectores de NDVI de MODIS (ORNL) y de SoilGrids, con el mismo formato que POWER | Que el NDVI de la zona y el criterio de suelo tengan dato real |
| Damaris | El límite oficial de Arequipa (IGN o INEI) | Avisar si un contorno cae fuera |
| Shantall | Pantallas del recorrido y qué dato pide cada una | Cerrar el contrato |
| Shantall | Que la interfaz distinga «dato de la fuente» y «declarado por ti», y muestre la resolución de cada dato | Que nadie confunda zona con parcela |
| Derecho B | Definición oficial de helada (por ejemplo, SENAMHI) y reglas locales de rotación y beneficios (INIA), con su cita | Completar el catálogo sin inventar |
| Derecho A | Condiciones de uso de EcoCrop y de los datos usados | Referencias y licencia |

## 6. Riesgos

| Riesgo | Hecho verificado | Respuesta |
|---|---|---|
| Ninguna fuente describe el interior de la parcela | POWER: celda ≈ 55 × 67 km; MODIS y SoilGrids: 250 m. Una parcela de 4,7 ha ocupa 0,76 píxeles de MODIS | Consultar el centroide y mostrar siempre la escala junto al dato |
| EcoCrop no distingue variedades andinas | Conflicto de altitud con la papa y la haba en Chivay | Mostrar el conflicto; buscar reglas locales citadas |
| El NDVI de ORNL no siempre responde | Devolvió 502 en varias pruebas | Caché; si no responde, la fuente aparece «no disponible» con ese motivo |
| Faltan reglas citadas | La haba no tiene temperatura letal en EcoCrop | El criterio sale `sin_regla`, sin rellenarlo |

## 7. A decidir en la reunión

- **Contexto de la parcela de la demo:** que lo declare un agricultor real (con su permiso) o el presentador en vivo, rotulado como «declarado por el usuario».
- **Publicación:** la web publicada solo puede mostrar parcelas ya registradas y procesadas (no tiene servidor). Dibujar una parcela nueva requiere el modo en vivo. Opciones en [docs/10, sección 7](../../docs/10-recorrido-y-escala.md#7-qué-se-puede-hacer-en-la-web-publicada).
- **Vercel o Netlify.**
