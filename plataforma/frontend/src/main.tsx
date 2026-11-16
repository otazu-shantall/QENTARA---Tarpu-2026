// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/landing.css'
import './styles/workspace.css'
import './styles/expansion.css'
import './styles/polish.css'
import './styles/landing-codex.css'
import './styles/glass.css'
import './styles/extras.css'
import './styles/asistente.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
