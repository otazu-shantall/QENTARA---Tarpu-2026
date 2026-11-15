// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { Link } from 'react-router'
import { Icon } from '../../components/ui/Icon'
import { useWorkspace } from '../../app/WorkspaceContext'
const aerial =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=-72.23,-16.39,-72.15,-16.32&bboxSR=4326&size=1600,1000&imageSR=3857&format=jpg&f=image'
export function LandingPage() {
  const { theme, setTheme } = useWorkspace()
  return (
    <main className="landing">
      <header className="public-nav">
        <Link to="/" aria-label="TARPU, inicio">
          <img src="brand/tarpu-logo-black.png" alt="TARPU" />
        </Link>
        <nav aria-label="Navegación pública">
          <a
            href="#como-funciona"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Cómo funciona
          </a>
          <a
            href="#nuestro-enfoque"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('nuestro-enfoque')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Nuestro enfoque
          </a>
          <a
            href="#equipo"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('equipo')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Equipo QENTARA
          </a>
        </nav>
        <div className="public-nav-actions">
          <button
            type="button"
            className="public-theme-switch"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
            <span>{theme === 'light' ? 'Tema oscuro' : 'Tema claro'}</span>
          </button>
          <Link to="/acceso" className="button button-outline">
            Iniciar sesión <Icon name="upRight" size={17} />
          </Link>
        </div>
      </header>
      <section className="landing-hero">
        <img
          className="hero-aerial"
          src={aerial}
          alt="Imagen satelital de referencia de la zona agrícola de Majes, Arequipa"
        />
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="eyebrow light">
            <span className="live-dot" /> LA TIERRA TIENE MUCHO QUE CONTAR
          </span>
          <h1>
            Tu campo.
            <br />
            Una nueva
            <br />
            <em>perspectiva.</em>
          </h1>
          <p>
            Comprende tu parcela y explora qué sembrar después, con información que puedes entender.
          </p>
          <Link to="/acceso" className="button button-lime large">
            Descubre TARPU <Icon name="upRight" />
          </Link>
          <div className="hero-territory">
            <Icon name="pin" size={16} />
            Desde Arequipa, mirando al futuro.
          </div>
        </div>
        <div className="hero-map-note">
          <Icon name="compass" size={27} />
          <span>
            Majes, Arequipa<small>Imagen satelital de referencia</small>
          </span>
          <span className="coordinates">
            16°21′ S<br />
            72°11′ O
          </span>
        </div>
        <div className="hero-footer">
          <span>TARPU / QENTARA</span>
          <span>Imagen: Esri, Maxar, Earthstar Geographics y comunidad GIS</span>
          <a
            href="#como-funciona"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Explora el proyecto ↓
          </a>
        </div>
      </section>
      <section className="landing-intro" id="como-funciona">
        <div>
          <span className="eyebrow">DEL DATO A UNA PREGUNTA ÚTIL</span>
          <h2>
            Menos complejidad.
            <br />
            <em>Más claridad para decidir.</em>
          </h2>
        </div>
        <p>
          Tu experiencia del campo importa. TARPU reúne evidencia ambiental y la explica con su
          origen, su fecha y sus límites, para que la decisión siga en tus manos.
        </p>
      </section>
      <section className="process-grid">
        {[
          {
            number: '01',
            icon: 'pin' as const,
            title: 'Ubica tu campo',
            text: 'Marca tu parcela en el mapa y añade lo que sabes de su manejo.',
          },
          {
            number: '02',
            icon: 'layers' as const,
            title: 'Comprende los datos',
            text: 'Explora el clima histórico y consulta qué representa cada observación.',
          },
          {
            number: '03',
            icon: 'sprout' as const,
            title: 'Explora posibilidades',
            text: 'Compara opciones con sus motivos, sus riesgos y lo que falta saber.',
          },
        ].map((item) => (
          <article key={item.number}>
            <div className="process-top">
              <Icon name={item.icon} size={27} />
              <span>{item.number}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
      <section className="landing-principle" id="nuestro-enfoque">
        <span className="eyebrow">EVIDENCIA, CON LOS PIES EN LA TIERRA</span>
        <h2>
          Lo que sabemos.
          <br />
          <em>Y lo que aún no.</em>
        </h2>
        <p>
          Un histórico no es un pronóstico. Un dato regional no es una medición dentro de la
          parcela. La claridad también consiste en reconocer lo que falta.
        </p>
        <Link to="/acceso" className="text-link">
          Conoce el prototipo <Icon name="arrow" size={18} />
        </Link>
        <span className="orbit-decoration" aria-hidden="true">
          ✳
        </span>
      </section>
      <section id="equipo" className="team-section">
        <div className="team-intro">
          <span className="eyebrow">EL EQUIPO DETRÁS DE TARPU</span>
          <h2>
            Somos QENTARA.
            <br />
            <em>Miramos la tierra juntos.</em>
          </h2>
          <p>
            Cinco integrantes, cuatro áreas y una misma intención: acercar la información al
            agricultor para que pueda decidir con claridad.
          </p>
          <span className="team-origin">
            <Icon name="pin" size={18} />
            Arequipa, Perú · NASA Space Apps 2026
          </span>
        </div>
        <div className="team-bento">
          <article className="team-main">
            <div className="team-logo-frame">
              <img
                className="team-logo"
                src="brand/qentara-logo.jpeg"
                alt="QENTARA, colibrí con hojas y una órbita de estrellas"
                width="640"
                height="640"
                loading="lazy"
              />
            </div>
            <div>
              <strong>Una mirada compartida.</strong>
              <p>
                Datos, tecnología, experiencia de usuario e investigación al servicio del campo.
              </p>
            </div>
          </article>
          {[
            {
              icon: 'layers' as const,
              title: 'Datos satelitales',
              text: 'Damaris · fuentes y evidencia ambiental.',
            },
            {
              icon: 'home' as const,
              title: 'Diseño y experiencia',
              text: 'Shantall · una web clara y accesible.',
            },
            {
              icon: 'settings' as const,
              title: 'Backend y motor',
              text: 'Erick · conectores y lógica de la plataforma.',
            },
            {
              icon: 'report' as const,
              title: 'Entrega e investigación',
              text: 'Dos integrantes de Derecho · pitch e investigación.',
            },
          ].map((area) => (
            <article key={area.title}>
              <Icon name={area.icon} size={24} />
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="public-footer">
        <img src="brand/tarpu-logo-black.png" alt="TARPU" />
        <p>Un proyecto de QENTARA · Arequipa, Perú</p>
        <span>Prototipo local · apoyo a decisiones agrícolas</span>
      </footer>
    </main>
  )
}
