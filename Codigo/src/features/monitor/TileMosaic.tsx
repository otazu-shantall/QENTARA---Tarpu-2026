import { useLayoutEffect, useRef, useState } from 'react'
import { basemaps } from './mapConfig'

interface TileMosaicProps {
  lat: number
  lon: number
  zoom: number
  /** Tiles loaded around the centre. Keep it small: tiles are requested on demand from Esri. */
  cols?: number
  rows?: number
  className?: string
  /** Show the provider credit inside the image. Turn off only when a visible credit sits nearby. */
  credit?: boolean
  eager?: boolean
}

const TILE = 256

function toTile(lat: number, lon: number, zoom: number) {
  const n = 2 ** zoom
  const x = (lon + 180) / 360 * n
  const y = (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n
  return { x, y }
}

/**
 * Static, non-interactive Esri World Imagery view built from a few tiles.
 * Used for decorative/reference imagery (landing, parcel thumbnails) where a
 * full Leaflet map would be heavier. It never represents a parcel boundary.
 */
export function TileMosaic({ lat, lon, zoom, cols = 4, rows = 3, className = '', credit = true, eager = false }: TileMosaicProps) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [failed, setFailed] = useState(0)
  const center = toTile(lat, lon, zoom)
  const x0 = Math.floor(center.x - cols / 2)
  const y0 = Math.floor(center.y - rows / 2)

  useLayoutEffect(() => {
    const element = box.current
    if (!element) return
    const update = () => setSize({ w: element.clientWidth, h: element.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Scale so the mosaic always covers the box while keeping the centre point centred.
  const left = (center.x - x0) * TILE, right = (x0 + cols - center.x) * TILE
  const top = (center.y - y0) * TILE, bottom = (y0 + rows - center.y) * TILE
  const scale = size.w && size.h ? Math.max(size.w / 2 / Math.min(left, right), size.h / 2 / Math.min(top, bottom)) : 1
  const tiles = []
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const url = basemaps.satellite.url.replace('{z}', String(zoom)).replace('{y}', String(y0 + j)).replace('{x}', String(x0 + i))
    tiles.push(<img key={`${i}-${j}`} src={url} alt="" draggable={false} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(value => value + 1)} style={{ left: i * TILE, top: j * TILE }} />)
  }

  return <div ref={box} className={`tile-mosaic ${failed >= cols * rows ? 'is-failed' : ''} ${className}`} aria-hidden="true">
    <div className="tile-mosaic-layer" style={{ width: cols * TILE, height: rows * TILE, transform: `translate(${size.w / 2 - left * scale}px, ${size.h / 2 - top * scale}px) scale(${scale})` }}>{tiles}</div>
    {credit && <span className="tile-credit">Esri World Imagery</span>}
  </div>
}
