// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { createContext, useContext } from 'react'
import type { Workspace } from './WorkspaceProvider'

// Identidad estable del contexto, independiente del refresco del componente proveedor.
export const WorkspaceContext = createContext<Workspace | null>(null)
export function useWorkspace() {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('Workspace provider missing')
  return value
}
