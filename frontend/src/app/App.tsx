// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
// 15/11/2026 (Claude Code): la portada es la de Codex (CodexLanding).
import { lazy, Suspense, useLayoutEffect } from 'react'
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WorkspaceProvider } from './WorkspaceProvider'
import { WorkspaceLayout } from '../components/layout/WorkspaceLayout'
import { CodexLanding } from '../features/landing/CodexLanding'
import { AccessPage } from '../features/auth/AccessPage'
import { OverviewPage } from '../features/dashboard/OverviewPage'
const HistoryPage = lazy(() =>
  import('../features/climate/HistoryPage').then((m) => ({ default: m.HistoryPage })),
)
const OptionsPage = lazy(() =>
  import('../features/rotations/OptionsPage').then((m) => ({ default: m.OptionsPage })),
)
const StudyPage = lazy(() =>
  import('../features/data/StudyPage').then((m) => ({ default: m.StudyPage })),
)

const ReportsPage = lazy(() =>
  import('../features/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })),
)
const ParcelEditorPage = lazy(() =>
  import('../features/parcels/ParcelEditorPage').then((m) => ({ default: m.ParcelEditorPage })),
)
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})
function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <HashRouter>
          <ScrollToTop />
          <Suspense
            fallback={
              <div className="route-loading" role="status">
                Preparando tu espacio…
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<CodexLanding />} />
              <Route path="/acceso" element={<AccessPage />} />
              <Route path="/app" element={<WorkspaceLayout />}>
                <Route index element={<OverviewPage />} />
                <Route path="historial" element={<HistoryPage />} />
                <Route path="opciones" element={<OptionsPage />} />
                <Route path="datos" element={<Navigate to="/app/estudio-tecnico" replace />} />
                <Route path="estudio-tecnico" element={<StudyPage />} />
                <Route path="informes" element={<ReportsPage />} />
                <Route path="parcela/nueva" element={<ParcelEditorPage />} />
              </Route>
              <Route
                path="*"
                element={
                  <div className="empty-state">
                    <h1>No encontramos esa página.</h1>
                    <Link to="/">Volver al inicio</Link>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </HashRouter>
      </WorkspaceProvider>
    </QueryClientProvider>
  )
}
