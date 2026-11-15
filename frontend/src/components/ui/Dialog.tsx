// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
export function Dialog({
  title,
  children,
  onClose,
  className = '',
}: {
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.showModal()
    return () => {
      ref.current?.close()
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      aria-label={title}
    >
      <header>
        <h2>{title}</h2>
        <button className="icon-button" aria-label="Cerrar" onClick={onClose}>
          <Icon name="close" />
        </button>
      </header>
      {children}
    </dialog>
  )
}
