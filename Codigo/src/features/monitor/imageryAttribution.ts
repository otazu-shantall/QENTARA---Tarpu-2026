import type { Map } from 'leaflet'

interface Contributor {
  attribution: string
  coverageAreas: { bbox: [number, number, number, number]; zoomMin: number; zoomMax: number; score: number }[]
}
let creditsRequest: Promise<Contributor[]> | undefined

function loadCredits() {
  creditsRequest ??= fetch('https://static.arcgis.com/attribution/World_Imagery?f=json', { signal: AbortSignal.timeout(8000) })
    .then(response => { if (!response.ok) throw new Error('Attribution unavailable'); return response.json() })
    .then((data: { contributors?: Contributor[] }) => data.contributors ?? [])
    .catch(() => { creditsRequest = undefined; return [] })
  return creditsRequest
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)

// Esri supplies credits by viewport and zoom. Keep the general source credits
// on the tile layer as a fallback; provider text is escaped before insertion.
export function addImageryAttribution(map: Map) {
  let disposed = false, current = ''
  let contributors: Contributor[] = []
  function update() {
    const bounds = map.getBounds(), zoom = map.getZoom()
    const names = contributors.flatMap(contributor => contributor.coverageAreas
      .filter(area => zoom >= area.zoomMin && zoom <= area.zoomMax && bounds.intersects([[area.bbox[0], area.bbox[1]], [area.bbox[2], area.bbox[3]]]))
      .map(area => ({ name: contributor.attribution, score: area.score })))
      .sort((a, b) => b.score - a.score)
    const next = [...new Set(names.map(item => item.name))].map(escapeHtml).join(', ')
    if (current === next) return
    if (current) map.attributionControl.removeAttribution(current)
    current = next
    if (current) map.attributionControl.addAttribution(current)
  }
  map.on('moveend', update)
  void loadCredits().then(data => { if (!disposed) { contributors = data; update() } })
  return () => { disposed = true; map.off('moveend', update); if (current) map.attributionControl.removeAttribution(current) }
}
