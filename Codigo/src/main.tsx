import React from 'react'
import ReactDOM from 'react-dom/client'
// Nueva interfaz escrita con asistencia de OpenAI Codex. Registro en entrega/uso-de-ia.md.
import { App } from './nuevo/App'
import 'leaflet/dist/leaflet.css'
import './nuevo/styles.css'
import './nuevo/dashboard.css'
import './nuevo/landing.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
