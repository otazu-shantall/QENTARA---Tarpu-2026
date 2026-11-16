# 22 · Revisión del código vigente para preparar correcciones

> 15/11/2026. Solicitado por Erick. Revisión realizada con asistencia de IA (Codex). Referencia: `8045059`, rama `main`. Análisis del código y verificación local; no acredita un despliegue público.

## Alcance y estado encontrado

Se revisaron la organización vigente, las instrucciones de las áreas, las decisiones y los informes recientes, el arranque conjunto, las rutas de la API, los adaptadores del frontend, la extracción, la persistencia, las migraciones y la preparación de despliegue. Se contrastaron los documentos de T03 con el código actual. No se afirma una lectura línea por línea de todos los datos originales ni de los archivos binarios del repositorio.

Todo el producto vigente está en `plataforma/` (DT-27):

- `frontend/`: React, TypeScript y Vite; portada, acceso de demostración, Mi campo, Historial, Rotación, Estudio técnico, Informes, ayuda, dibujo de parcelas y asistente.
- `backend/tarpu_api/`: FastAPI, lectura de la base, trabajos, rutas de parcelas, indicadores, motor y agente guiado; conector de IA para reformular respuestas al escucharlas.
- `backend/tarpu_datos/`: extracción oficial, base regional, consultas por coordenada, actualización y repositorios de archivos o Supabase.
- `supabase/`: esquema v0, catálogo y cola con toma de trabajos y latido.
- `infra/` y `scripts/`: Docker Compose y arranque local. El destino de nube sigue descrito en la documentación; no se verificó un despliegue remoto.
- `datos/` y `documentacion/`: muestras, antecedentes, informe maestro y borradores del modelo de datos.

La web ya consulta la API. Rotación llama a `POST /api/rotaciones`, que prepara POWER y pH de SoilGrids antes de comparar con el catálogo de cuatro cultivos. El chat actual prepara respuestas con `frontend/src/services/local.ts`; no llama al agente guiado del backend. «Escuchar» puede solicitar la reformulación de IA; la conversación de voz usa otro recorrido.

## Hallazgos para las siguientes correcciones

Son observaciones del código. Salvo las pruebas indicadas abajo, no se reprodujeron todavía en navegador ni en un despliegue separado.

### 1. Archivos entre API y trabajador: dependencia del disco compartido

`infra/docker-compose.yml` comparte `backend/almacen` entre contenedores. `tarpu_datos/repositorio/supabase.py` guarda observaciones en SQL y sube originales a Storage, pero conserva rutas locales al CSV normalizado en la procedencia. La web solicita esos CSV mediante `/api/archivo`; `tarpu_api/coordenada.py:archivo` solo lee el disco de la API.

Si API y trabajador se despliegan con discos independientes, que el trabajo figure terminado en Supabase no basta para que la API pueda servir su CSV de MODIS. Hay que cerrar esa lectura compartida antes de considerar trasladable el recorrido completo a la nube. Además, `tarpu_api/almacen.py` conserva parcelas, contextos e indicadores en JSON local; la existencia de tablas de parcelas no significa que estas rutas ya las utilicen.

Comprobación pendiente: ejecutar un trabajo con API y trabajador sin volumen compartido y abrir sus series desde la web.

### 2. Rotación conserva entradas al cambiar de parcela

En `frontend/src/features/rotations/RotationPage.tsx`, cultivo, agua y meses se inicializan con `useState` desde una clave de almacenamiento por parcela. Al cambiar `parcel.id`, el efecto borra resultados y cultivos de zona, pero no recarga esas tres entradas. `WorkspaceLayout` mantiene el mismo `Outlet`, por lo que el componente puede seguir montado.

También falta una comprobación de parcela vigente al resolver `rotations(...)`: una respuesta iniciada para A puede aparecer después de seleccionar B. El mismo tipo de comprobación falta al terminar `cancel()` en `services/parcelData.ts`.

Comprobación pendiente: alternar dos parcelas con contextos distintos y cambiar de selección mientras se compara o cancela.

### 3. Las fechas de MODIS quedan limitadas por POWER

`frontend/src/services/remote.ts:attach` añade MODIS solo cuando su fecha ya existe en el conjunto diario de POWER. Una observación satelital con fecha ausente en POWER se descarta, aunque exista en el archivo del proveedor. Deben conservarse los calendarios propios de cada producto y los faltantes de las otras variables.

### 4. Actualización y caché requieren conciliación

`services/remote.ts:cachedBase` mantiene indefinidamente las respuestas correctas durante la sesión. `WorkspaceProvider` también configura la evidencia con `staleTime: Infinity`. Invalidar la consulta de evidencia al terminar una extracción no invalida ese primer caché. El botón de reintento de `useParcelData` vuelve a usarlo.

Comprobación pendiente: actualizar la base en el servidor y confirmar que una actualización explícita de la pantalla recibe la nueva versión sin recargar toda la aplicación.

### 5. Chat, voz e IA tienen recorridos distintos

- `services/local.ts` asocia «lluvia» con la respuesta de humedad relativa del aire. No entrega el acumulado de precipitación solicitado.
- `useVoiceConversation.ts` usa el asistente local y la síntesis del navegador; no llama a `/api/ia/naturalizar`.
- `AssistantPanel.tsx` sí llama a naturalizar al pulsar «Escuchar», pero el estado «Detener» se reinicia con un temporizador fijo y la petición de reformulación no tiene cancelación ligada al cierre o a la selección de otro mensaje.
- `tarpu_api/ia.py:estado` considera al proveedor conectado si encuentra clave y SDK; no verifica credenciales ni disponibilidad del modelo. La llamada real a Anthropic continúa pendiente de validación. El prompt pide preservar hechos, pero el código no compara las cifras y advertencias de la salida con el texto original.

Esto no impide el recorrido guiado local; sí exige describir con precisión qué función de IA está disponible y comprobar la reproducción y detención de audio.

### 6. Configuración pública y acceso

`services/api.ts` usa `http://127.0.0.1:8000` si falta `VITE_TARPU_API`. El arranque local con Docker apunta a 8010. El build público necesita la dirección definitiva de la API y el backend necesita el dominio de la web en `TARPU_CORS`.

El acceso de `AccessPage` crea una sesión local en el navegador; no autentica contra el servidor. Las rutas de trabajos no comprueban identidad ni propiedad. La configuración `TARPU_MODO` controla algunas operaciones, pero no sustituye la autenticación. La forma de acceso de la demo pública debe quedar definida antes de exponer esos recorridos.

### 7. Procedencia del pH en la comparación

`tarpu_api/main.py:post_rotaciones` añade el pH de SoilGrids a los indicadores para esa llamada, pero devuelve la procedencia que ya tenía `ind`, sin añadir la lectura de suelo. Conviene conservar de forma explícita esa fuente, profundidad y escala junto con el resultado del motor.

### 8. Documentación y contrato de pantallas atrasados

El inicio de `docs/00-estado-actual.md`, parte de su inventario, la bitácora organizativa y varios README conservan estados anteriores a DT-26/DT-27. El contrato de T03 se declara borrador y referencia `Codigo/src/nuevo/` y `d78a70b`, anteriores a la unión del frontend. No se debe implementar ese contrato suponiendo que ya describe las pantallas vigentes.

La frase «sin cambiar código» del README de despliegue debe contrastarse con la dependencia de archivos descrita en el hallazgo 1. Esta revisión actualiza la entrada del estado y registra el desajuste; no sustituye la revisión coordinada del contrato ni las reglas de las otras áreas.

## Verificación realizada

| Comprobación | Resultado |
|---|---|
| `npm --prefix frontend run build`, desde `plataforma/` | Correcto: TypeScript y compilación de producción |
| Pruebas de frontend, mediante `npm run pruebas` | 11 aprobadas |
| `.venv/Scripts/python.exe -m pytest -q`, desde backend | 22 aprobadas, código de salida 0 |
| Pruebas de navegador y despliegue remoto | No ejecutadas en esta revisión |
| Llamada real a proveedor de IA | No realizada |

La ejecución inicial de pytest quedó esperando al crear el socket local del bucle de eventos de Windows dentro del aislamiento. Una ejecución diagnóstica mostró `socket._fallback_socketpair` en la pila; al ejecutar la misma suite fuera del aislamiento terminó correctamente. Se cerraron las ejecuciones detenidas. No se atribuye esa espera al producto.

La suite actual no cubre todos los hallazgos: aprobar sus pruebas no valida los cambios de parcela durante peticiones ni el traslado a servicios con discos independientes.

## Resultado

Queda una referencia del código vigente para responder preguntas y concretar las correcciones que indique Erick. No se modificó código del producto, no se cambiaron dependencias y no se ejecutó un despliegue. La rama local estaba tres commits por delante de la referencia local `origin/main`; no se consultó el remoto en esta revisión.
