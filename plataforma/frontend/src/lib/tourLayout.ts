// Posición dentro de la ventana, también con zoom. Asistencia de IA (Codex); entrega/uso-de-ia.md.
export interface Rect {
  left: number
  top: number
  width: number
  height: number
}
export function tourLayout(
  target: Rect | null,
  card: { width: number; height: number },
  width: number,
  height: number,
) {
  const gap = 16
  const w = Math.min(card.width, Math.max(0, width - gap * 2))
  const h = Math.min(card.height, Math.max(0, height - gap * 2))
  const clamp = (value: number, max: number) => Math.max(gap, Math.min(value, Math.max(gap, max)))
  if (!target) return { left: (width - w) / 2, top: (height - h) / 2 }
  const candidates = [
    { left: target.left + target.width + gap, top: target.top },
    { left: target.left - w - gap, top: target.top },
    { left: target.left, top: target.top + target.height + gap },
    { left: target.left, top: target.top - h - gap },
  ]
  const fit = candidates.find(
    (c) => c.left >= gap && c.left + w <= width - gap && c.top >= gap && c.top + h <= height - gap,
  )
  const chosen = fit ?? {
    left: target.left > width / 2 ? gap : width - w - gap,
    top: (height - h) / 2,
  }
  return { left: clamp(chosen.left, width - w - gap), top: clamp(chosen.top, height - h - gap) }
}
