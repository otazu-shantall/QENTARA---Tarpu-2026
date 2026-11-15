// Portada nueva escrita con asistencia de OpenAI Codex. Registro en entrega/uso-de-ia.md.
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Database,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export function Landing() {
  return (
    <div className="nature-landing">
      <section className="nature-hero" aria-label="Bienvenida a TARPU">
        <img
          className="nature-photograph"
          src="images/wheat-field-wide.jpg"
          alt="Espigas verdes de trigo bajo un cielo azul, fotografiadas por Arnaud Weyts"
          fetchPriority="high"
        />
        <header className="nature-navigation">
          <a className="nature-brand" href="#/" aria-label="TARPU, inicio">
            <img src="brand/tarpu-logo-white.png" alt="TARPU" />
          </a>
          <nav aria-label="Navegación principal">
            <a className="current" href="#/">
              Inicio
            </a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#evidencia">Nuestros datos</a>
          </nav>
          <a className="nature-enter" href="#/campo">
            Entrar a mi campo
            <ArrowUpRight size={19} />
          </a>
        </header>
        <main className="nature-hero-content">
          <span className="nature-eyebrow">
            <span />
            CON LOS PIES EN AREQUIPA
          </span>
          <h1>
            Tu tierra.
            <br />
            Una mirada <em>más clara.</em>
          </h1>
          <p>
            Entiende el clima, conoce tu suelo y explora qué sembrar. Datos del
            espacio, explicados para ti.
          </p>
          <div className="nature-hero-actions">
            <a className="nature-primary" href="#/campo">
              Conocer mi campo
              <ArrowUpRight size={21} />
            </a>
            <a className="nature-secondary" href="#/agente">
              <Sparkles size={20} />
              Hablar con TARPU
            </a>
          </div>
        </main>
        <footer className="nature-hero-bottom">
          <a href="#como-funciona">
            <span className="scroll-circle">
              <ArrowDown size={20} />
            </span>
            Descubre otra perspectiva
          </a>
          <div>
            <ShieldCheck size={23} />
            <p>
              Tu conocimiento del campo.
              <br />
              <strong>Más información para decidir.</strong>
            </p>
          </div>
        </footer>
        <a
          className="nature-photo-credit"
          href="https://unsplash.com/photos/green-wheat-field-under-blue-sky-during-daytime-e2OulMxxiDQ"
          target="_blank"
          rel="noreferrer"
        >
          Fotografía de Arnaud Weyts · Unsplash
          <ArrowUpRight size={16} />
        </a>
      </section>
      <section
        className="nature-source-strip"
        id="evidencia"
        aria-label="Fuentes de datos"
      >
        <p>
          Información real.
          <br />
          <strong>Fuentes abiertas.</strong>
        </p>
        <div>
          NASA POWER<small>Clima</small>
        </div>
        <div>
          MODIS<small>Vegetación · ORNL DAAC</small>
        </div>
        <div>
          SoilGrids<small>Suelo · ISRIC</small>
        </div>
        <div>
          CENAGRO<small>Cultivos · INEI 2012</small>
        </div>
      </section>
      <section className="nature-how" id="como-funciona">
        <div className="nature-section-heading">
          <div>
            <span className="eyebrow">
              EL CAMPO ES TUYO. LA DECISIÓN TAMBIÉN.
            </span>
            <h2>
              Un poco de contexto.
              <br />
              <em>Una nueva perspectiva.</em>
            </h2>
          </div>
          <p>
            Cada terreno tiene una historia. TARPU te ayuda a leer sus datos,
            hacer preguntas y explorar tus próximos pasos.
          </p>
        </div>
        <div className="nature-feature-grid">
          <article>
            <div className="nature-feature-icon">
              <MapPinned size={29} />
            </div>
            <h3>Empieza por tu tierra.</h3>
            <p>
              Ubica tu zona en el mapa y dibuja el contorno de tu campo. Tus
              declaraciones acompañan a la consulta.
            </p>
            <a href="#/campo">
              Abrir el mapa
              <ArrowUpRight size={20} />
            </a>
          </article>
          <article>
            <div className="nature-feature-icon">
              <Leaf size={29} />
            </div>
            <h3>La evidencia, a la vista.</h3>
            <p>
              Conoce el clima, el suelo y el verdor. Revisa la fecha, la fuente
              y la escala de cada registro.
            </p>
            <a href="#/datos">
              Explorar los datos
              <ArrowUpRight size={20} />
            </a>
          </article>
          <article className="nature-agent-feature">
            <div className="nature-feature-icon">
              <Sparkles size={29} />
            </div>
            <h3>
              Preguntar es parte{' '}
              <br />
              del camino.
            </h3>
            <p>
              Conversa con TARPU sobre lo que estás viendo. Explicaciones
              sencillas, con sus fuentes a mano.
            </p>
            <a href="#/agente">
              Conocer al agente
              <ArrowUpRight size={20} />
            </a>
          </article>
        </div>
      </section>
      <section className="nature-callout">
        <div>
          <span className="nature-callout-icon">
            <Database size={30} />
          </span>
          <div>
            <span className="eyebrow">EMPIEZA CON UNA CONSULTA REAL</span>
            <h2>
              Majes y Chivay.
              <br />
              Dos maneras de conocer Arequipa.
            </h2>
          </div>
        </div>
        <a className="nature-primary" href="#/campo">
          Explorar TARPU
          <ArrowRight size={21} />
        </a>
      </section>
      <footer className="nature-footer">
        <a href="#/" aria-label="TARPU, inicio">
          <img src="brand/tarpu-logo-black.png" alt="TARPU" />
        </a>
        <p>Una iniciativa de QENTARA · Arequipa, Perú</p>
        <a href="#/agente">
          Conversa con TARPU
          <ArrowUpRight size={18} />
        </a>
      </footer>
    </div>
  )
}
