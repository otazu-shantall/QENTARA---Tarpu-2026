import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import L from 'leaflet'
import { Icon } from '../../components/ui/Icon'
import { basemaps, referenceZones, zoneForSelection } from './mapConfig'
import { addImageryAttribution } from './imageryAttribution'
import type { BasemapId } from './mapConfig'

type MapStatus = 'loading' | 'ready' | 'partial' | 'error'
interface FarmMapProps {
  selectedId?: string
  onSelect?: (id: string) => void
  large?: boolean
  interactive?: boolean
  /** Floating panels rendered above the map (e.g. the parcel summary card). */
  children?: ReactNode
}

export function FarmMap({ selectedId = 'all', onSelect, large = false, interactive = true, children }: FarmMapProps) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const initialZone = zoneForSelection(selectedId)
  const [visible, setVisible] = useState(false)
  const [basemap, setBasemap] = useState<BasemapId>('satellite')
  const [status, setStatus] = useState<MapStatus>('loading')
  const [showLayers, setShowLayers] = useState(false)
  const [retry, setRetry] = useState(0)
  const [zoom, setZoom] = useState(initialZone.zoom)
  const [zoneId, setZoneId] = useState(initialZone.id)
  const zone = referenceZones.find(item => item.id === zoneId) ?? referenceZones[0]
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect

  // Parcel cards outside the viewport do not download map tiles.
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect() }
    }, { rootMargin: '160px' })
    if (container.current) observer.observe(container.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !container.current) return
    const map = L.map(container.current, {
      center: referenceZones[0].center, zoom: referenceZones[0].zoom,
      minZoom: 3, maxZoom: 19, zoomControl: false,
      scrollWheelZoom: false, dragging: interactive, touchZoom: interactive,
      doubleClickZoom: interactive, boxZoom: interactive, keyboard: interactive,
      zoomAnimation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      fadeAnimation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
    mapRef.current = map
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>')
    if (interactive) L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 85 }).addTo(map)
    const onZoom = () => setZoom(map.getZoom())
    map.on('zoomend', onZoom)
    const resize = new ResizeObserver(() => map.invalidateSize({ animate: false, pan: false }))
    resize.observe(container.current)
    const credits = map.attributionControl.getContainer()
    const creditsResize = new ResizeObserver(() => {
      if (credits) container.current?.parentElement?.style.setProperty('--map-credits-height', `${credits.offsetHeight}px`)
    })
    if (credits) creditsResize.observe(credits)
    return () => { resize.disconnect(); creditsResize.disconnect(); map.off('zoomend', onZoom); map.remove(); mapRef.current = null }
  }, [visible, interactive])

  useEffect(() => {
    const map = mapRef.current
    if (!visible || !map) return
    const selected = zoneForSelection(selectedId)
    setZoneId(selected.id)
    map.setView(selected.center, interactive ? selected.zoom : selected.zoom - 1, { animate: false })
  }, [selectedId, visible, interactive])

  useEffect(() => {
    const map = mapRef.current
    if (!visible || !map) return
    const source = basemaps[basemap]
    let goodTiles = 0, failedTiles = 0, disposed = false
    let timeout: ReturnType<typeof setTimeout>
    const tiles = L.tileLayer(source.url, { attribution: source.attribution, maxZoom: 19, maxNativeZoom: source.maxNativeZoom, keepBuffer: 1 })
    const start = () => {
      goodTiles = 0; failedTiles = 0; setStatus('loading'); clearTimeout(timeout)
      timeout = setTimeout(() => { if (!disposed && !goodTiles) setStatus('error') }, 14000)
    }
    tiles.on('loading', start)
    tiles.on('tileload', () => { goodTiles++; setStatus('ready') })
    tiles.on('tileerror', () => { failedTiles++ })
    tiles.on('load', () => {
      clearTimeout(timeout)
      setStatus(goodTiles ? (failedTiles ? 'partial' : 'ready') : 'error')
    })
    start(); tiles.addTo(map)
    const removeCredits = basemap === 'satellite' ? addImageryAttribution(map) : () => {}
    // Remove the layer first: Leaflet unregisters its map events from the layer's
    // own 'remove' listener, which a prior `tiles.off()` would delete, leaving a
    // detached layer that crashes on the next zoom.
    return () => { disposed = true; clearTimeout(timeout); map.removeLayer(tiles); tiles.off(); removeCredits() }
  }, [basemap, retry, visible, interactive])

  function focusZone(id: string) {
    const next = referenceZones.find(item => item.id === id) ?? referenceZones[0]
    setZoneId(next.id)
    mapRef.current?.setView(next.center, next.zoom, { animate: false })
    selectRef.current?.(next.id)
  }

  return <div className={`farm-map real-map ${large ? 'large' : ''} ${!interactive ? 'map-preview' : ''}`} data-map-status={status}>
    <div ref={container} className="geographic-map" role="region" aria-label={`Mapa geográfico de ${zone.name}, Arequipa. ${interactive ? 'Usa las flechas para desplazarte y los botones para acercar.' : 'Vista de referencia.'}`} />
    {interactive && <>
      <div className="map-zone-switcher" role="group" aria-label="Zonas de referencia de Arequipa">{referenceZones.map(item => <button key={item.id} aria-pressed={zoneId === item.id} onClick={() => focusZone(item.id)}><Icon name="pin" size={12}/>{item.name}</button>)}</div>
      <div className="map-controls">
        <button onClick={() => setShowLayers(!showLayers)} className={`map-control ${showLayers ? 'pressed' : ''}`} aria-label="Elegir capa del mapa" aria-expanded={showLayers}><Icon name="layers" size={18}/></button>
        <div className="zoom-buttons"><button aria-label="Acercar mapa" disabled={zoom >= 19} onClick={() => mapRef.current?.zoomIn()}><Icon name="plus" size={18}/></button><button aria-label="Alejar mapa" disabled={zoom <= 3} onClick={() => mapRef.current?.zoomOut()}><Icon name="minus" size={18}/></button></div>
        <button className="map-control" aria-label="Recentrar mapa" onClick={() => mapRef.current?.setView(zone.center, zone.zoom, { animate: false })}><Icon name="locate" size={18}/></button>
      </div>
      {showLayers && <div className="map-layers"><span>Mapa base</span>{(Object.keys(basemaps) as BasemapId[]).map(id => <button key={id} aria-pressed={basemap === id} onClick={() => { setBasemap(id); setShowLayers(false) }}><Icon name={id === 'satellite' ? 'satellite' : 'map'} size={16}/>{basemaps[id].label}{basemap === id && <Icon name="check" size={15}/>}</button>)}<p>La imagen satelital es un mapa base. No es una capa NDVI ni una captura en vivo.</p></div>}
      <div className="map-location-card"><span className="map-location-symbol"><Icon name="pin" size={16}/></span><div><strong>{zone.name} <span>· Arequipa, Perú</span></strong><small>{basemaps[basemap].label} · zona de referencia, parcelas sin delimitar</small></div><span className="map-north" aria-label="Norte arriba">N</span></div>
    </>}
    {children}
    {status === 'loading' && <span className="map-loading" role="status"><span/> Cargando cartografía…</span>}
    {status === 'partial' && <span className="map-partial" role="status">Algunas teselas no cargaron. <button onClick={() => setRetry(value => value + 1)}>Reintentar</button></span>}
    {status === 'error' && <div className="map-error" role="status"><Icon name="map" size={26}/><strong>No se pudo cargar el mapa.</strong><p>Comprueba tu conexión o prueba otra vista.</p><div><button onClick={() => setRetry(value => value + 1)}>Reintentar</button><button onClick={() => setBasemap(basemap === 'satellite' ? 'streets' : 'satellite')}>Cambiar vista</button></div></div>}
    {!interactive && <span className="map-preview-caption">{zone.name} · referencia geográfica</span>}
  </div>
}
