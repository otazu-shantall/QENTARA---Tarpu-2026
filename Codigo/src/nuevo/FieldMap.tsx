// Escrito con asistencia de OpenAI Codex; imagen nítida, zoom 21 y capa de sectores con Claude Code.
// Registro en entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Check, Layers, LocateFixed, Map as MapIcon, Minus, Plus, Undo2, X } from 'lucide-react'
import { sectorImage, sectorMap } from './api'
import type { SectorMap } from './api'
import type { Coordinate, Field, ReferencePlace } from './data'

interface Props {
  place: ReferencePlace
  field: Field | null
  drawing: boolean
  onDrawingChange: (drawing: boolean) => void
  onComplete: (coordinates: Coordinate[]) => void
}

// Valida cruces del contorno para que el dibujo se pueda corregir antes de guardarlo.
export function validContour(points: Coordinate[]) {
  if (
    points.length < 3 ||
    new Set(points.map((point) => point.join(','))).size !== points.length
  )
    return false
  const cross = (a: Coordinate, b: Coordinate, c: Coordinate) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
  const within = (a: Coordinate, b: Coordinate, c: Coordinate) =>
    Math.min(a[0], b[0]) <= c[0] &&
    c[0] <= Math.max(a[0], b[0]) &&
    Math.min(a[1], b[1]) <= c[1] &&
    c[1] <= Math.max(a[1], b[1])
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length]
    area += a[0] * b[1] - b[0] * a[1]
    for (let j = i + 2; j < points.length; j++) {
      if (i === 0 && j === points.length - 1) continue
      const c = points[j],
        d = points[(j + 1) % points.length]
      const turns = [
        cross(a, b, c),
        cross(a, b, d),
        cross(c, d, a),
        cross(c, d, b),
      ]
      if (
        (turns[0] * turns[1] < 0 && turns[2] * turns[3] < 0) ||
        (turns[0] === 0 && within(a, b, c)) ||
        (turns[1] === 0 && within(a, b, d)) ||
        (turns[2] === 0 && within(c, d, a)) ||
        (turns[3] === 0 && within(c, d, b))
      )
        return false
    }
  }
  return Math.abs(area) > 1e-12
}

export function FieldMap({
  place,
  field,
  drawing,
  onDrawingChange,
  onComplete,
}: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const imagery = useRef<L.TileLayer | null>(null)
  const outline = useRef<L.LayerGroup | null>(null)
  const [street, setStreet] = useState(false)
  const [points, setPoints] = useState<Coordinate[]>([])
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [error, setError] = useState('')
  const [sectors, setSectors] = useState<SectorMap | null>(null)
  const [showSectors, setShowSectors] = useState(true)

  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, {
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
      zoomControl: false,
      attributionControl: true,
      center: [-16.367023, -72.185771],
      zoom: 15,
      maxZoom: 21,
      scrollWheelZoom: false,
    })
    map.current = instance
    outline.current = L.layerGroup().addTo(instance)
    const observer = new ResizeObserver(() => instance.invalidateSize())
    observer.observe(container.current)
    return () => {
      observer.disconnect()
      instance.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    setMapState('loading')
    const layer = street
      ? L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxNativeZoom: 19,
          maxZoom: 21,
        })
      : L.tileLayer(
          // «Clarity»: la misma imagen de Esri con menos compresión (más nítida). En zonas rurales de
          // Arequipa hay imagen real hasta el zoom 17; desde ahí se amplía la última tesela real.
          'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Imágenes &copy; Esri, Maxar, Earthstar Geographics y comunidad GIS (World Imagery Clarity)',
            maxNativeZoom: 17,
            maxZoom: 21,
          },
        )
    layer.on('tileload', () => setMapState('ready'))
    layer.on('tileerror', () =>
      setMapState((current) => (current === 'ready' ? current : 'error')),
    )
    layer.addTo(instance)
    imagery.current = layer
    return () => {
      layer.remove()
      layer.off()
    }
  }, [street])

  // Sectores de Arequipa (S1, S2 y S3) desde la API; si no responde, el mapa sigue sin ellos.
  useEffect(() => {
    let alive = true
    sectorMap()
      .then((value) => alive && setSectors(value))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])
  useEffect(() => {
    const instance = map.current
    if (!instance || !sectors || !showSectors) return
    const layer = L.imageOverlay(sectorImage, sectors.limites_mapa, {
      opacity: 0.5,
      interactive: false,
    }).addTo(instance)
    // A mucho zoom las celdas de ≈ 1 km tapan el campo: se atenúan.
    const fade = () => layer.setOpacity(instance.getZoom() >= 14 ? 0.12 : 0.5)
    fade()
    instance.on('zoomend', fade)
    return () => {
      instance.off('zoomend', fade)
      layer.remove()
    }
  }, [sectors, showSectors])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    instance.stop()
    if (field)
      instance.fitBounds(
        L.latLngBounds(field.coordinates.map(([lon, lat]) => [lat, lon])),
        { padding: [60, 60], maxZoom: 18, animate: false },
      )
    else
      instance.setView([place.point.latitude, place.point.longitude], 15, {
        animate: false,
      })
  }, [place, field])

  useEffect(() => {
    if (!drawing) {
      setPoints([])
      setError('')
      return
    }
    const instance = map.current
    if (!instance) return
    instance.getContainer().classList.add('is-drawing')
    const addPoint = (event: L.LeafletMouseEvent) => {
      setPoints((previous) => [
        ...previous,
        [
          Number(event.latlng.lng.toFixed(7)),
          Number(event.latlng.lat.toFixed(7)),
        ],
      ])
      setError('')
    }
    instance.on('click', addPoint)
    return () => {
      instance.off('click', addPoint)
      instance.getContainer().classList.remove('is-drawing')
    }
  }, [drawing])

  useEffect(() => {
    const layer = outline.current
    if (!layer) return
    layer.clearLayers()
    if (drawing) {
      const latlngs = points.map(([lon, lat]): L.LatLngTuple => [lat, lon])
      if (points.length > 1)
        L.polyline(latlngs, { color: '#e0f0a5', weight: 3 }).addTo(layer)
      for (const point of latlngs)
        L.circleMarker(point, {
          radius: 6,
          color: '#233c28',
          weight: 2,
          fillColor: '#fff',
          fillOpacity: 1,
        }).addTo(layer)
    } else if (field) {
      L.polygon(
        field.coordinates.map(([lon, lat]) => [lat, lon]),
        {
          color: '#efffc6',
          weight: 3,
          fillColor: '#efffc6',
          fillOpacity: 0.12,
        },
      ).addTo(layer)
    } else {
      const marker = L.marker([place.point.latitude, place.point.longitude], {
        icon: L.divIcon({
          className: 'reference-marker',
          html: '<span></span>',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
        title: `Punto de consulta de ${place.name}`,
        keyboard: true,
      }).addTo(layer)
      marker.bindTooltip(`${place.name} · punto de consulta`, {
        permanent: true,
        direction: 'right',
        offset: [18, 0],
      })
    }
  }, [points, drawing, field, place])

  function finish() {
    if (!validContour(points)) {
      setError('Marca al menos tres esquinas distintas, sin cruzar los lados.')
      return
    }
    onComplete([...points, points[0]])
    onDrawingChange(false)
  }

  return (
    <>
      <div
        ref={container}
        className="field-map"
        role="region"
        aria-label="Mapa interactivo de Arequipa"
      />
      <div className="map-layer-label">
        <span className="live-dot" />
        {street ? 'Mapa de calles' : 'Imagen satelital'}
        <span className="map-label-secondary">Esri / OpenStreetMap</span>
      </div>
      <div className="map-controls" aria-label="Controles del mapa">
        <button onClick={() => setStreet((value) => !value)}>
          <Layers size={20} />
          {street ? 'Ver satélite' : 'Ver calles'}
        </button>
        {sectors && (
          <button
            onClick={() => setShowSectors((value) => !value)}
            aria-pressed={showSectors}
          >
            <MapIcon size={20} />
            {showSectors ? 'Ocultar zonas' : 'Ver zonas'}
          </button>
        )}
        <button onClick={() => map.current?.zoomIn()} aria-label="Acercar mapa">
          <Plus size={22} />
          <span>Acercar</span>
        </button>
        <button onClick={() => map.current?.zoomOut()} aria-label="Alejar mapa">
          <Minus size={22} />
          <span>Alejar</span>
        </button>
        <button
          onClick={() => {
            if (field)
              map.current?.fitBounds(
                L.latLngBounds(
                  field.coordinates.map(([lon, lat]) => [lat, lon]),
                ),
                { padding: [60, 60], maxZoom: 18 },
              )
            else
              map.current?.setView(
                [place.point.latitude, place.point.longitude],
                15,
              )
          }}
        >
          <LocateFixed size={21} />
          <span>Centrar</span>
        </button>
      </div>
      {sectors && showSectors && (
        <div className="sector-legend" aria-label="Zonas de Arequipa por altitud">
          {Object.entries(sectors.sectores).map(([key, sector]) => (
            <span key={key}>
              <i
                style={{
                  background: `rgba(${sector.color_rgba.slice(0, 3).join(',')})`,
                }}
              />
              {key} · {sector.altitud_m[0]}–{sector.altitud_m[1]} m
            </span>
          ))}
          <small>Altitud NASADEM · no es el límite oficial de la región</small>
        </div>
      )}
      {mapState !== 'ready' && (
        <div className="map-feedback" role="status">
          {mapState === 'loading' ? (
            'Cargando cartografía…'
          ) : (
            <>
              <span>La imagen necesita conexión.</span>
              <button
                onClick={() => {
                  setMapState('loading')
                  imagery.current?.redraw()
                }}
              >
                Reintentar
              </button>
            </>
          )}
        </div>
      )}
      {drawing && (
        <div className="draw-toolbar">
          <p aria-live="polite">
            {error ||
              `Marca las esquinas de tu campo · ${points.length} puntos`}
          </p>
          <div>
            <button
              onClick={() => setPoints((previous) => previous.slice(0, -1))}
              disabled={!points.length}
            >
              <Undo2 size={20} />
              Deshacer
            </button>
            <button
              className="button-primary"
              onClick={finish}
              disabled={points.length < 3}
            >
              <Check size={20} />
              Terminar
            </button>
            <button onClick={() => onDrawingChange(false)}>
              <X size={20} />
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
