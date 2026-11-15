# 05 · Equipo, desafío y base por área

> 14 de noviembre de 2026. Decisiones: DT-08 a DT-11.

## Alcance del trabajo

- Registrar las plataformas: web, luego Android, luego iOS.
- Dividir el trabajo entre los cinco integrantes y segmentar el repositorio para que cada uno trabaje por su parte.
- Incorporar los recursos oficiales del desafío.
- Investigar todo lo que hay que entregar (documentación, video, pitch) para el área de Derecho.
- Dejar al menos la base, en documentación o en código, para cada área.

## Qué quedó hecho

| Pieza | Resultado |
|---|---|
| Desafío oficial | [08](../08-desafio-oficial.md): qué pide *Field Shift*, cómo responde TARPU y qué recursos sirven para Arequipa |
| Entrega oficial | [09](../09-entrega-oficial.md): fechas, requisitos, campos del formulario, reglas de IA, licencia, criterios y premios |
| Equipo y áreas | [07](../07-equipo-y-areas.md): responsables, plataformas, etapas, qué necesita cada área de las demás y cómo compartir el repositorio |
| Datos (Damaris) | `datos/`: guía y **una consulta real a NASA POWER** que funciona |
| Backend (Erick) | `backend/`: guía, decisiones por tomar y borrador de contrato con el frontend |
| Frontend (Shantall) | [areas/frontend.md](../areas/frontend.md): qué hay, dónde se cambia cada cosa y qué revisar para personas mayores |
| Entrega (Derecho) | `entrega/`: tareas, borrador del formulario en inglés, guion de la demo, referencias, registro de IA y pendientes legales |
| Repositorio | `.gitignore` en la raíz y propuesta de ramas por área |

## Qué pasó

- **Fechas del evento:** el hackathon es el 14 y 15 de noviembre de 2026, y el envío cierra el domingo 15 a las 11:59 p. m., hora del evento local.
- **Acceso al sitio oficial:** falló con dos herramientas por un error de certificados de esta máquina. Se leyó con el navegador integrado.
- **Primer dato real de NASA:** 365 días de 2025 para un punto de Majes, sin faltantes, guardados como original, normalizado y procedencia.
- **Recursos solo de Estados Unidos:** más de la mitad de los recursos oficiales (suelos, cultivos, clima y mercados del USDA y del USGS) no sirven para Arequipa.
- **Encaje con el desafío:** pide comparar al menos tres estrategias de rotación, incluida la actual, con razones, evidencia, vacíos y riesgos. Coincide con el enfoque de TARPU.

## Hallazgos que cambian el trabajo

- **Todo lo enviado va en inglés.** La interfaz está en español: hay que resolverlo con el líder local.
- **El uso de IA debe declararse** en texto y metadatos, y las imágenes generadas llevan marca de agua. El prototipo se hizo con asistencia de IA.
- **El contenido debe ser de código abierto.** Sin licencia elegida, se aplica Apache 2.0.
- **Los materiales de terceros deben ser de libre acceso.** Hay que revisar las condiciones de Esri World Imagery.
- **El dato de NASA debe ser central** (criterio Relevance). Hoy POWER está consultado, pero no llega a la app.

## Lo que falta

- Inicializar git y publicar el repositorio.
- Anotar los nombres de los dos integrantes de Derecho en [07](../07-equipo-y-areas.md).
- Resolver las preguntas para el líder local ([entrega/pendientes-legales.md](../../entrega/pendientes-legales.md)).
- Llevar el dato de POWER a una pantalla.
- Añadir la nota de IA a los archivos de código ya existentes.
- No se creó código de backend: su stack no está decidido.
