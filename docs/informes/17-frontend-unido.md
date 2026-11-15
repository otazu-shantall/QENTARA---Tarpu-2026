# 17 · Frontend unido: portada de Codex, panel de Shantall y datos reales

> 15/11/2026 · Erick, con Claude Code. Decisión DT-26 (complementa DT-25).

## Qué se hizo

- **Portada:** la de Codex (`CodexLanding.tsx` y `styles/landing-codex.css`, solo las reglas de la portada), con su foto (`public/images/`, crédito en su README). Enlaces: «Entrar a mi campo» → acceso; «Hablar con TARPU» → espacio de trabajo.
- **Panel:** el de Shantall, sin cambiar su disposición. Se añadió vidrio (`styles/glass.css`) a tarjetas, banda de procedencia, selector de parcela y controles del mapa, con variantes clara y oscura.
- **Datos reales (contrato de T03, §5):**
  - `services/api.ts`: cliente de la API (traído de `Codigo/`), con el contorno cerrado antes de enviarlo.
  - `services/remote.ts`: reemplaza al repositorio local. La serie diaria es la celda de NASA POWER de la base; si el campo ya tiene trabajo, se añaden el NDVI de MOD13Q1 (fiabilidad 2 y 3 sin valor) y la temperatura de superficie de MOD11A2 (K − 273,15). Sin servidor, solo queda la muestra empaquetada de Majes.
  - `services/parcelData.ts` y `features/dashboard/ParcelDataPanel.tsx`: altitud, pendiente, pH, zona, textura, cultivos del censo de la zona y avisos; tarjeta «Datos satelitales» con estado por fuente, reutilización, «Detener» y «Volver a intentar». Si un dato falta, se muestra su motivo (por ejemplo, contorno sobre el borde de una tesela de NASADEM).
  - Lugares de referencia: Majes riego, Cabanaconde y Chivay, como puntos de consulta.
  - **Parcelas de ejemplo retiradas del selector** (DT-16). Sus archivos siguen en `src/data/`.
- **Mapa:** imagen Esri Clarity, zoom 21 (imagen real hasta 17 en zonas rurales), abre sobre toda Arequipa al dibujar, marcador del punto de referencia. **Sin capa de sectores.** En el editor, «O abre un campo ya analizado» lista los trabajos del servidor.
- **Backend:** CORS acepta el puerto 5174 (`config.py` y `.env.example`).

## Comprobaciones

- `npm --prefix frontend run build` y `npm --prefix frontend test` (11 de 11).
- `npm --prefix frontend run test:ui` con la API en el puerto 8000: portada, acceso de prueba, Majes y Cabanaconde con datos reales (S1 y S2), Historial y Estudio con POWER, dibujo de una parcela con datos de la base y tema oscuro. La suite anterior se basaba en la portada y las parcelas de ejemplo retiradas; queda en git (`75a6e63`).

## Lo que falta pulir

- Recomendaciones (catálogo de Shantall) todavía no usa los cultivos de la zona ni el motor (`/rotaciones`).
- El asistente sigue con respuestas guiadas locales.
- Informes: PDF pendiente.
- Textos del acceso que aún dicen «datos de ejemplo».
- Probar en anchos menores y revisar el vidrio en tema oscuro.
