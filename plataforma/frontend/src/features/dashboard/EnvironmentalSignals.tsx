// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useWorkspace } from '../../app/WorkspaceContext'
import { Icon } from '../../components/ui/Icon'
import { number } from '../../lib/evidence'
export function EnvironmentalSignals() {
  const { points, evidence } = useWorkspace()
  const latest = points.at(-1),
    demo = evidence?.origin === 'synthetic'
  return (
    <section className="environment-section">
      <div className="section-title">
        <div>
          <span className="eyebrow">EN PALABRAS SENCILLAS</span>
          <h2>Lo que conviene observar.</h2>
        </div>
        <span className="muted">{demo ? 'Lectura ilustrativa' : 'Variables disponibles'}</span>
      </div>
      <div className="environment-grid">
        {[
          {
            title: 'Frío y heladas',
            icon: 'snow' as const,
            value: latest?.minimum ?? null,
            unit: '°C',
            tone: 'blue',
            label: 'Temperatura mínima del aire',
            text: demo
              ? 'Así se mostraría una noche fría. El aviso de helada del historial es ficticio.'
              : 'La mínima del aire no confirma congelamiento ni daño en la planta.',
          },
          {
            title: 'Calor',
            icon: 'temperature' as const,
            value: latest?.maximum ?? null,
            unit: '°C',
            tone: 'coral',
            label: 'Temperatura máxima del aire',
            text: demo
              ? 'Ejemplo de lectura de calor. Se revisarían duración, cultivo y etapa.'
              : 'Una máxima aislada no demuestra estrés térmico del cultivo.',
          },
          {
            title: 'Agua en el suelo',
            icon: 'humidity' as const,
            value: latest?.soilMoisture ?? null,
            unit: '% vol.',
            tone: 'blue',
            label: demo ? 'Contenido volumétrico ficticio' : 'Fuente de suelo sin conectar',
            text: 'Es diferente de la humedad del aire. No determina por sí sola cuánto regar.',
          },
          {
            title: 'Falta de agua / sequía',
            icon: 'rain' as const,
            value: null,
            unit: '',
            tone: 'amber',
            label: demo ? 'Ejemplo de aviso: revisar agua' : 'Sin diagnóstico de sequía',
            text: demo
              ? 'Un aviso puede ayudarte a revisar agua y riego. Aquí no corresponde a un evento real.'
              : 'La sequía necesita un indicador, una referencia temporal y un método.',
          },
        ].map((signal) => (
          <article key={signal.title} className={`environment-card tone-${signal.tone}`}>
            <span className="signal-icon">
              <Icon name={signal.icon} size={23} />
            </span>
            <h3>{signal.title}</h3>
            {signal.value !== null ? (
              <strong>
                {number(signal.value)}
                <small>{signal.unit}</small>
              </strong>
            ) : (
              <strong className="signal-word">{demo ? 'Por revisar' : 'Sin evaluación'}</strong>
            )}
            <span>{signal.label}</span>
            <p>{signal.text}</p>
            {demo && <small className="demo-caption">EJEMPLO · SIN DIAGNÓSTICO REAL</small>}
          </article>
        ))}
      </div>
    </section>
  )
}
