// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordinate } from '../../types/domain'
import { buildParcelOverlay, parcelLayers } from '../../lib/parcelOverlay'
import type { ParcelLayer } from '../../lib/parcelOverlay'
import { Icon } from '../../components/ui/Icon'

export function FieldMap({
  points = [],
  drawing = false,
  closed = false,
  onChange,
  onError,
  illustrative = false,
  analysisLayer = 'none',
}: {
  points?: Coordinate[]
  drawing?: boolean
  closed?: boolean
  onChange?: (points: Coordinate[]) => void
  onError?: (message: string) => void
  illustrative?: boolean
  analysisLayer?: ParcelLayer
}) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const vertices = useRef<L.LayerGroup | null>(null)
  const deviceLocation = useRef<L.Circle | null>(null)
  const state = useRef({ points, drawing, closed, onChange, onError })
  state.current = { points, drawing, closed, onChange, onError }
  const [basemap, setBasemap] = useState<'satellite' | 'streets'>('satellite')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const [retry, setRetry] = useState(0)
  const [layers, setLayers] = useState(false)
  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, {
      center: [-16.351, -72.19],
      zoom: 14,
      zoomControl: false,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
      scrollWheelZoom: true,
      minZoom: 5,
      maxZoom: 19,
    })
    map.current = instance
    vertices.current = L.layerGroup().addTo(instance)
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(instance)
    instance.attributionControl.setPrefix('Leaflet')
    instance.on('click', (event: L.LeafletMouseEvent) => {
      const current = state.current
      if (current.drawing && !current.closed)
        current.onChange?.([...current.points, [event.latlng.lng, event.latlng.lat]])
    })
    const rubber = L.polyline([], { color: '#d7eabc', dashArray: '5 7', weight: 2 }).addTo(instance)
    instance.on('mousemove', (event: L.LeafletMouseEvent) => {
      const current = state.current
      rubber.setLatLngs(
        current.drawing && !current.closed && current.points.length
          ? [[current.points.at(-1)![1], current.points.at(-1)![0]], event.latlng]
          : [],
      )
    })
    const observer = new ResizeObserver(() => {
      if (map.current === instance) instance.invalidateSize({ animate: false })
    })
    observer.observe(container.current)
    return () => {
      observer.disconnect()
      instance.stop()
      instance.remove()
      map.current = null
      vertices.current = null
    }
  }, [])
  useEffect(() => {
    if (!map.current) return
    setStatus('loading')
    const source =
      basemap === 'satellite'
        ? {
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            credit:
              'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
          }
        : {
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            credit:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
    const tiles = L.tileLayer(source.url, {
      attribution: source.credit,
      maxZoom: 19,
      keepBuffer: 1,
    }).addTo(map.current)
    let loaded = false
    const timeout = setTimeout(() => {
      if (!loaded) setStatus('error')
    }, 12000)
    tiles.on('tileload', () => {
      loaded = true
      setStatus('ready')
    })
    tiles.on('load', () => {
      if (!loaded) setStatus('error')
    })
    return () => {
      clearTimeout(timeout)
      map.current?.removeLayer(tiles)
      tiles.off()
    }
  }, [basemap, retry])
  useEffect(() => {
    const group = vertices.current
    if (!group) return
    group.clearLayers()
    const coordinates = points.map(([lng, lat]) => [lat, lng] as L.LatLngTuple)
    if (coordinates.length) {
      const shape = closed
        ? L.polygon(coordinates, {
            color: '#d8efa4',
            fillColor: '#a3ca6d',
            fillOpacity: 0.16,
            weight: 3,
          })
        : L.polyline(coordinates, { color: '#d8efa4', weight: 3 })
      group.addLayer(shape)
    }
    points.forEach(([lng, lat], index) => {
      const marker = L.marker([lat, lng], {
        draggable: drawing && closed,
        keyboard: true,
        title: `Esquina ${index + 1}`,
        icon: L.divIcon({ className: 'vertex-marker', iconSize: [16, 16], iconAnchor: [8, 8] }),
      })
      marker.on('dragend', () => {
        const next = [...state.current.points]
        const position = marker.getLatLng()
        next[index] = [position.lng, position.lat]
        state.current.onChange?.(next)
      })
      group.addLayer(marker)
    })
  }, [points, drawing, closed])
  useEffect(() => {
    if (points.length && closed)
      map.current?.fitBounds(
        points.map(([lng, lat]) => [lat, lng] as L.LatLngTuple),
        { padding: illustrative ? [42, 42] : [60, 60], maxZoom: illustrative ? 18 : 17 },
      )
  }, [closed])
  useEffect(() => {
    const instance = map.current
    if (!instance || drawing || !closed) return
    const overlay = buildParcelOverlay(
      points,
      analysisLayer,
      illustrative ? 'synthetic' : 'declared',
    )
    if (!overlay) return
    const image = L.imageOverlay(overlay.url, overlay.bounds, {
      opacity: 0.88,
      interactive: false,
    }).addTo(instance)
    return () => {
      if (instance.hasLayer(image)) image.remove()
    }
  }, [points, analysisLayer, illustrative, drawing, closed])
  function locate() {
    if (!navigator.geolocation) {
      setLocationMessage('Ubicación no disponible. Puedes navegar por el mapa.')
      return
    }
    setLocating(true)
    setLocationMessage('Solicitando ubicación al navegador…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!map.current) return
        const { latitude, longitude, accuracy } = position.coords
        map.current.setView([latitude, longitude], 16)
        deviceLocation.current?.remove()
        const location = L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#b8ddf3',
          weight: 2,
          fillOpacity: 0.09,
        }).addTo(map.current)
        deviceLocation.current = location
        location.bindTooltip('Ubicación del dispositivo; no es el límite de tu parcela.')
        setLocationMessage(`Ubicación aproximada · margen de ${Math.round(accuracy)} m`)
        setLocating(false)
      },
      (error) => {
        const message =
          error.code === 1
            ? 'Permiso de ubicación denegado. Puedes mover el mapa manualmente.'
            : 'No se obtuvo la ubicación. Prueba de nuevo o mueve el mapa.'
        setLocationMessage(message)
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }
  return (
    <div className={`field-map ${drawing ? 'is-drawing' : ''}`}>
      <div
        ref={container}
        className="leaflet-surface"
        aria-label="Mapa de referencia de Majes, Arequipa"
      />
      <div className="map-caption">
        <span className="live-dot" />
        <span>AREQUIPA, PERÚ</span>
        <span className="map-caption-divider" />
        {illustrative && analysisLayer !== 'none'
          ? 'CAPA ILUSTRATIVA · SIN MEDICIÓN'
          : 'Vista de referencia'}
      </div>
      <div className="map-toolbar">
        <button
          title="Mi ubicación"
          aria-label="Usar mi ubicación"
          onClick={locate}
          disabled={locating}
        >
          <Icon name={locating ? 'loader' : 'locate'} />
        </button>
        <button title="Acercar" aria-label="Acercar mapa" onClick={() => map.current?.zoomIn()}>
          <Icon name="plus" />
        </button>
        <button title="Alejar" aria-label="Alejar mapa" onClick={() => map.current?.zoomOut()}>
          <span className="minus">−</span>
        </button>
        <button
          title="Capas"
          aria-label="Capas del mapa"
          aria-expanded={layers}
          onClick={() => setLayers(!layers)}
        >
          <Icon name="layers" />
        </button>
        <button
          title="Volver a Majes"
          aria-label="Volver a Majes"
          onClick={() => map.current?.setView([-16.351, -72.19], 14)}
        >
          <Icon name="compass" />
        </button>
        {drawing && !closed && (
          <button
            title="Añadir esquina en el centro del mapa"
            aria-label="Añadir esquina en el centro del mapa"
            onClick={() => {
              const center = map.current?.getCenter()
              if (center) onChange?.([...points, [center.lng, center.lat]])
            }}
          >
            <Icon name="pin" />
          </button>
        )}
      </div>
      {layers && (
        <div className="map-layer-menu">
          <strong>Mapa base</strong>
          <button
            onClick={() => {
              setBasemap('satellite')
              setLayers(false)
            }}
          >
            Imagen satelital {basemap === 'satellite' && <Icon name="check" size={16} />}
          </button>
          <button
            onClick={() => {
              setBasemap('streets')
              setLayers(false)
            }}
          >
            Mapa de calles {basemap === 'streets' && <Icon name="check" size={16} />}
          </button>
          <p>
            Los productos científicos están sin conectar. Las capas de ejemplo son patrones
            ficticios dentro del contorno.
          </p>
        </div>
      )}
      {drawing && (
        <div className="drawing-instruction">
          <Icon name="scan" size={17} />
          {closed
            ? 'Arrastra las esquinas para ajustar tu contorno.'
            : 'Haz clic en cada esquina del terreno.'}
          <b>{points.length} puntos</b>
        </div>
      )}
      {locationMessage && (
        <div className="map-status" role="status">
          {locationMessage}
          <button onClick={() => setLocationMessage('')} aria-label="Cerrar aviso de ubicación">
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
      {status === 'loading' && <div className="map-loading">Cargando cartografía…</div>}
      {status === 'error' && (
        <div className="map-failure" role="status">
          <Icon name="layers" />
          <strong>No se pudo cargar la imagen</strong>
          <p>El mapa necesita conexión. Puedes reintentar o cambiar de vista.</p>
          <button
            className="button"
            onClick={() => {
              setRetry(retry + 1)
              setBasemap(basemap === 'satellite' ? 'streets' : 'satellite')
            }}
          >
            Cambiar vista y reintentar
          </button>
        </div>
      )}
      {illustrative && analysisLayer !== 'none' && (
        <div
          className="parcel-color-legend"
          aria-label={`Leyenda de ${parcelLayers[analysisLayer].label}, ejemplo sintético`}
        >
          <div>
            <strong>{parcelLayers[analysisLayer].label}</strong>
            <span>Ejemplo</span>
          </div>
          <i
            style={{
              background: `linear-gradient(90deg,${parcelLayers[analysisLayer].colors.join(',')})`,
            }}
          />
          <div>
            <small>{parcelLayers[analysisLayer].low}</small>
            <small>{parcelLayers[analysisLayer].high}</small>
          </div>
        </div>
      )}
      <div className="map-legend">
        <span className="north">N ↑</span>
        <span>
          {illustrative && analysisLayer !== 'none'
            ? 'Patrón sintético · no es un dato satelital'
            : 'Imagen de referencia · sin capa de análisis'}
        </span>
      </div>
    </div>
  )
}
