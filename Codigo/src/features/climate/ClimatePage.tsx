import { useWorkspace } from '../../app/context'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { WorkspaceFilters } from '../../components/layout/WorkspaceFilters'
import { Icon } from '../../components/ui/Icon'
import { EvolutionChart } from './EvolutionChart'
import { MetricCards } from '../dashboard/MetricCards'

export function ClimatePage() {
  const { openAgent, navigate } = useWorkspace()
  return <><SectionHeader eyebrow="EL PASADO TAMBIÉN TIENE RESPUESTAS" title="Entiende el ritmo de tu zona." description="Temperatura, lluvia y contexto ambiental en una sola mirada."/><WorkspaceFilters/><MetricCards/><div className="climate-layout"><EvolutionChart initialMetric="temperature"/><div className="info-card-stack"><article className="card information-card"><span className="round-icon gold"><Icon name="sun" size={23}/></span><h2>Contexto, no pronóstico.</h2><p>Una serie histórica ayuda a explorar el pasado. No anticipa por sí sola una helada ni las condiciones de tu próxima campaña.</p><button className="text-button" onClick={()=>openAgent('¿Qué información hay sobre el agua y el riego?')}>Consultar a Tarpu <Icon name="arrow" size={15}/></button></article><article className="card information-card"><span className="round-icon"><Icon name="layers" size={23}/></span><h2>Conoce la escala.</h2><p>Un valor regional puede aportar contexto sin representar una medición precisa dentro de la parcela.</p><button className="text-button" onClick={()=>navigate('data')}>Revisar los registros <Icon name="arrow" size={15}/></button></article></div></div></>
}
