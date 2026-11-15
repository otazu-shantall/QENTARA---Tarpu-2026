# Frontend y experiencia de usuario

El nuevo frontend de escritorio está en `frontend/`: primer prototipo interactivo, con temas claro y oscuro para comparar. La carpeta `Codigo/` fue retirada (DT-25); sus versiones se conservan en Git. La identidad visual y las pantallas definitivas siguen en revisión; el enfoque es claro, conciso y comprensible para personas mayores.

La revisión vigente incorpora **Estudio técnico**, historial diario/semanal/mensual, dos parcelas con datos de ejemplo, catálogo por familias, inicio panorámico con sección QENTARA y registro/acceso con campos completos. La sala de voz tiene aura, pausa y reescucha automática por turnos. Cuenta de IA sin vincular; no se consume una suscripción en esta demo. [Informe 10](../informes/10-estudio-tecnico-y-conversacion.md).

El ajuste visual vigente añade cabecera fija y sidebar de vidrio, paletas clara/oscura, texto más grande, capas ilustrativas del contorno, prioridad de ejemplo y gráficos de área/líneas/barras. Las barras de desplazamiento están ocultas y las tablas mantienen foco y desplazamiento. [Informe 11](../informes/11-vidrio-capas-y-graficos.md).

El inicio comparte los tonos del dashboard y ofrece cambio de tema claro/oscuro en la navbar, con persistencia y continuidad entre pantallas. Se mantiene el hero satelital, sin galería fotográfica adicional. La sección del equipo usa el nuevo logo QENTARA y el pie sigue compacto. [Informe 15](../informes/15-tema-publico-y-logo-qentara.md).

## Ejecutar y comprobar

Desde la raíz:

```powershell
npm --prefix frontend ci
npm --prefix frontend run dev
```

Abrir [http://127.0.0.1:5174/](http://127.0.0.1:5174/) y entrar por «Descubre TARPU». El acceso es de demostración: no crea cuentas ni pide contraseñas.

```powershell
npm --prefix frontend run build
npm --prefix frontend test
npm --prefix frontend run test:ui
```

La suite de navegador requiere `dev` encendido y Google Chrome. Arquitectura, rutas, límites y puntos de integración: [frontend/README.md](../../plataforma/frontend/README.md). La conexión anterior con la API está documentada en el [informe 08](../informes/08-frontend-conectado-api.md); todavía no se trasladó al frontend vigente.

## Qué funciona

| Pantalla o función | Estado |
|---|---|
| Inicio y acceso | Imagen aérea de referencia de Majes, introducción, «Descubre» y entrada local |
| Espacio de trabajo | Sidebar izquierda, cuatro destinos principales, tema claro/oscuro y datos avanzados secundarios |
| Mapa y parcela | Esri/OSM, geolocalización voluntaria, dibujo y edición por vértices, validación y guardado local |
| Contexto e historial | 365 registros reales de NASA POWER para Majes en 2025; contexto regional, sin diagnóstico de parcela |
| Estudio técnico | Series, nueve variables representables, registros, diccionario y calidad; CSV/JSON y GeoJSON del contorno |
| Recomendaciones | Ocho fichas por hortalizas, legumbres, frutas y flores; comparación con continuidad y pautas generales; sin motor de aptitud |
| Asistente | Chat guiado y sala de voz por turnos con reescucha, pausa, finalización y subtítulos opcionales; IA remota pendiente |
| Informes | Resúmenes locales descargables como JSON; PDF pendiente |

Una parcela nueva muestra «Sin dato». La muestra de Majes no se asocia a su geometría. No hay autenticación, backend, modelo de IA ni capas científicas calculadas. Los estados de voz se probaron mediante dobles del navegador; la prueba con micrófono físico sigue pendiente.

## Dónde se trabaja

| Elemento | Ubicación |
|---|---|
| Rutas y estado compartido | `frontend/src/app/` |
| Sidebar y cabecera | `frontend/src/components/layout/WorkspaceLayout.tsx` |
| Tokens y temas | `frontend/src/styles/tokens.css` |
| Pantallas | `frontend/src/features/` |
| Contratos y adaptador local | `frontend/src/services/` |
| Validación del contorno y resúmenes | `frontend/src/lib/` |
| Esquemas de datos | `frontend/src/types/domain.ts` |
| Logo monocromo | `frontend/public/brand/`, copiado del recurso vigente de `Codigo/` |

## Criterios de diseño

1. Respuesta comprensible primero y detalle opcional después; etiquetas junto a iconos.
2. Computadora con ratón y teclado, mapa amplio y sidebar izquierda.
3. Variables con significado: humedad del aire diferenciada de humedad del suelo; NDVI no equivale a fertilidad.
4. Fechas, fuente y límites visibles. Un histórico no es un pronóstico.
5. Estados vacíos, errores y alternativa manual a ubicación/voz. No fabricar valores para completar una pantalla.
6. Datos avanzados secundarios con retorno visible, sin confundir navegación con autorización.

El cuerpo y los controles principales tienen texto ampliado; quedan pendientes una auditoría completa de contraste y lector de pantalla y las pruebas con agricultores. Chat y voz forman parte del recorrido inicial; el avatar humano es posterior (DT-14).

## Revisión e integración pendientes

- Comparar legibilidad y jerarquía de los temas con usuarios y elegir la dirección visual.
- Acordar contrato, autorización, geometrías y caché privada con backend.
- Relacionar capas con fuentes realmente disponibles, escala y calidad.
- Incorporar evaluación agronómica y comparación de tres estrategias con razones, evidencia, vacíos y riesgos.
- Probar micrófono/audio reales y decidir el proveedor de conversación.
- Resolver PDF y versión en inglés de la entrega con el área correspondiente.

Referencias: [guía de diseño](../diseno/guia-frontend.md), [propuesta del área](propuesta-frontend.md), [informe de implementación](../informes/09-arquitectura-y-prototipo-frontend.md).

## Integración con el trabajo del equipo

Los contratos actuales están en [T03](../../plataforma/documentacion/modelo-de-datos/contrato-pantallas.md), el backend en [su índice](../../plataforma/backend/README.md) y el esquema mixto en [docs/11](../11-esquema-mixto.md). La conexión previa de `Codigo/src/nuevo/` permanece en el historial Git anterior a DT-25. El prototipo de `frontend/` no hereda automáticamente esa conexión.

DT-16 sigue rigiendo para la entrega: los ejemplos sintéticos del prototipo local no constituyen la demo final. La sustitución por evidencia real y la validación del contrato siguen pendientes.
