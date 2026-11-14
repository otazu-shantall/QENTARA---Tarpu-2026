import { useState } from 'react'
import type { FormEvent } from 'react'
import { useWorkspace } from '../../app/context'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'
import { TileMosaic } from '../monitor/TileMosaic'
import { referenceZones } from '../monitor/mapConfig'
import { formatNumber } from '../../lib/domain'

export function ParcelsPage() {
  const { parcels, selectParcel, navigate, addParcel, notify } = useWorkspace()
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const visible = parcels.filter(p => `${p.name} ${p.location} ${p.crop}`.toLowerCase().includes(search.toLowerCase()))
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name')).trim(), location = String(data.get('location')).trim()
    const area = Number(data.get('area'))
    if (!name || !location || !Number.isFinite(area) || area <= 0) return
    addParcel({ id: crypto.randomUUID(), name, location, crop: String(data.get('crop')), area, color: '#a4c183', ndvi: 0.6, temperature: 24, moisture: .3, precipitation: 12, createdLocally: true })
    setAdding(false); notify('Parcela de demostración guardada en este navegador.')
  }
  return <>
    <SectionHeader eyebrow="Cada parcela, su propia historia" title="Aquí empieza tu campo." description="Un espacio para conocer, organizar y explorar tus parcelas." action={<button className="button primary" onClick={() => setAdding(true)}><Icon name="plus" size={16}/> Añadir parcela</button>}/>
    <div className="list-toolbar"><span><strong>{parcels.length}</strong> parcelas en tu espacio</span><label className="search-field"><Icon name="search" size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar parcela o cultivo" aria-label="Buscar parcela o cultivo"/></label></div>
    <div className="parcel-grid">{visible.map(parcel => {
      const zone = referenceZones.find(item => item.id === parcel.id)
      return <article className="card parcel-card" key={parcel.id}>
        <div className="parcel-thumb">
          {zone && !parcel.createdLocally ? <><TileMosaic lat={zone.center[0]} lon={zone.center[1]} zoom={14} cols={3} rows={2}/><span className="thumb-caption">Zona de referencia: {zone.name}</span></> : <div className="parcel-map-empty"><Icon name="pin" size={24}/><strong>Ubicación por delimitar</strong><span>Esta ficha no tiene geometría.</span></div>}
          <span className="parcel-crop-tag"><Icon name="sprout" size={13}/>{parcel.crop}</span>
        </div>
        <div className="parcel-body">
          <div className="parcel-title-row"><h2>{parcel.name}</h2><span className="tag">{parcel.createdLocally ? 'Local' : 'Demo'}</span></div>
          <p><Icon name="pin" size={13}/>{parcel.location}</p>
          <div className="parcel-stats"><div><small>Superficie</small><strong>{formatNumber(parcel.area)} <span>ha</span></strong></div><div><small>Vegetación</small><strong>{formatNumber(parcel.ndvi, 2)} <span>NDVI</span></strong></div></div>
          <button className="button tertiary full-width" onClick={() => { selectParcel(parcel.id); navigate(parcel.createdLocally ? 'data' : 'overview') }}>Ver mi parcela <Icon name="arrow" size={16}/></button>
          {parcel.createdLocally && <small className="subtle-note">Registro local · sin geometría real</small>}
        </div>
      </article>
    })}</div>
    {visible.length === 0 && <div className="empty-state"><Icon name="search" size={30}/><h2>No encontramos esa parcela.</h2><p>Prueba otro nombre, localidad o cultivo.</p><button className="button secondary" onClick={() => setSearch('')}>Limpiar búsqueda</button></div>}
    <div className="inline-note"><Icon name="book" size={18}/><p>Las parcelas de esta demostración son ficticias y la imagen de cada ficha muestra su zona de referencia, no sus límites. Al añadir una nueva, se guarda solo en este navegador con valores de ejemplo.</p></div>
    {adding && <Modal title="Añadir una parcela" onClose={() => setAdding(false)}><p className="modal-description">Crea una ficha local para explorar el diseño. La delimitación geográfica se incorporará al conectar el producto.</p><form onSubmit={submit} className="form-stack"><label>Nombre de la parcela<input name="name" autoComplete="off" required maxLength={60} placeholder="Ej. Mi parcela del valle"/></label><label>Localidad<input name="location" required maxLength={90} placeholder="Ej. Arequipa, Perú"/></label><div className="form-columns"><label>Superficie (ha)<input name="area" type="number" step="0.1" min="0.1" max="10000" required defaultValue="1.5"/></label><label>Cultivo<select name="crop"><option>Papa</option><option>Quinua</option><option>Haba</option><option>Cebada</option><option>Otro cultivo</option></select></label></div><button className="button primary" type="submit">Guardar parcela de ejemplo <Icon name="check" size={16}/></button></form></Modal>}
  </>
}
