import type { LatLngTuple } from 'leaflet'

export type BasemapId = 'satellite' | 'streets'

// Approximate area centers for visual navigation. These are neither parcel
// coordinates nor measured boundaries; local records do not inherit geometry.
export const referenceZones: { id: string; name: string; center: LatLngTuple; zoom: number }[] = [
  { id: 'la-joya', name: 'La Joya', center: [-16.457, -71.840], zoom: 14 },
  { id: 'majes', name: 'Majes', center: [-16.351, -72.190], zoom: 14 },
  { id: 'camana', name: 'Camaná', center: [-16.623, -72.711], zoom: 14 },
]

export function zoneForSelection(id: string) {
  return referenceZones.find(zone => zone.id === id) ?? referenceZones[0]
}

// Public raster services for this local prototype. Use browser HTTP caching;
// do not prefetch regions, bulk download, or include basemap tiles in exports.
export const basemaps = {
  satellite: {
    label: 'Imagen satelital',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxNativeZoom: 19,
    attribution: 'Powered by <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> · Sources: Esri, Vantor, Earthstar Geographics, and the GIS User Community',
  },
  streets: {
    label: 'Mapa de calles',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxNativeZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer">Corregir el mapa</a>',
  },
} satisfies Record<BasemapId, { label: string; url: string; maxNativeZoom: number; attribution: string }>
