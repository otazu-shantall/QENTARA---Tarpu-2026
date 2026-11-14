import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import './styles/tokens.css'
import 'leaflet/dist/leaflet.css'
import './styles/base.css'
import './styles/landing.css'
import './styles/app.css'
import './features/monitor/map.css'
import './styles/print.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
)
