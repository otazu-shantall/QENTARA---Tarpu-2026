// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Icon } from '../../components/ui/Icon'
export function AccessPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login'),
    [visible, setVisible] = useState(false),
    [error, setError] = useState('')
  const [remember, setRemember] = useState(false)
  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    username: localStorage.getItem('tarpu.prototype.username') ?? '',
    password: '',
    confirm: '',
  })
  const navigate = useNavigate()
  const update = (key: keyof typeof fields, value: string) =>
    setFields((previous) => ({ ...previous, [key]: value }))
  function enter(name = 'Explorador') {
    sessionStorage.setItem('tarpu.prototype.session', name)
    navigate('/app')
  }
  return (
    <main className="access-page">
      <section className="access-story">
        <Link to="/">
          <img src="brand/tarpu-logo-white.png" alt="TARPU" />
        </Link>
        <div>
          <span className="eyebrow light">CADA CAMPO TIENE SU HISTORIA</span>
          <h1>
            Empecemos
            <br />
            por conocer
            <br />
            <em>el tuyo.</em>
          </h1>
          <p>Un espacio para entender la evidencia, hacer preguntas y explorar posibilidades.</p>
        </div>
        <span>QENTARA · AREQUIPA, PERÚ</span>
        <span className="access-orbit" aria-hidden="true">
          ✳
        </span>
      </section>
      <section className="access-form">
        <Link to="/" className="text-link">
          <Icon name="back" size={17} />
          Volver al inicio
        </Link>
        <div className="access-card">
          <span className="eyebrow">BIENVENIDO A TARPU</span>
          <h2>{mode === 'login' ? 'Tu campo te espera.' : 'Cada historia empieza contigo.'}</h2>
          <div className="access-tabs" role="group" aria-label="Tipo de acceso">
            <button
              aria-pressed={mode === 'login'}
              onClick={() => {
                setMode('login')
                setError('')
              }}
            >
              Iniciar sesión
            </button>
            <button
              aria-pressed={mode === 'register'}
              onClick={() => {
                setMode('register')
                setError('')
              }}
            >
              Crear cuenta
            </button>
          </div>
          <form
            autoComplete="on"
            onSubmit={(event) => {
              event.preventDefault()
              if (mode === 'register' && fields.password !== fields.confirm) {
                setError('Las contraseñas no coinciden.')
                return
              }
              if (remember) localStorage.setItem('tarpu.prototype.username', fields.username)
              else localStorage.removeItem('tarpu.prototype.username')
              enter(mode === 'register' ? fields.firstName : fields.username)
            }}
          >
            {mode === 'register' && (
              <>
                <div className="form-two-columns">
                  <label>
                    Nombres
                    <input
                      name="given-name"
                      autoComplete="given-name"
                      required
                      maxLength={50}
                      value={fields.firstName}
                      onChange={(e) => update('firstName', e.target.value)}
                      placeholder="Ej. Ana"
                    />
                  </label>
                  <label>
                    Apellidos
                    <input
                      name="family-name"
                      autoComplete="family-name"
                      required
                      maxLength={70}
                      value={fields.lastName}
                      onChange={(e) => update('lastName', e.target.value)}
                      placeholder="Ej. Pérez"
                    />
                  </label>
                </div>
                <div className="form-two-columns">
                  <label>
                    DNI <small>(opcional)</small>
                    <input
                      name="dni"
                      inputMode="numeric"
                      pattern="[0-9]{8}"
                      maxLength={8}
                      title="Ocho dígitos"
                      autoComplete="off"
                      value={fields.dni}
                      onChange={(e) => update('dni', e.target.value.replace(/\D/g, ''))}
                      placeholder="8 dígitos"
                    />
                  </label>
                  <label>
                    Correo electrónico
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={fields.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="nombre@correo.com"
                    />
                  </label>
                </div>
              </>
            )}
            <label>
              Usuario
              <input
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={40}
                value={fields.username}
                onChange={(e) => update('username', e.target.value)}
                placeholder="Tu nombre de usuario"
              />
            </label>
            <label>
              Contraseña
              <span className="password-field">
                <input
                  type={visible ? 'text' : 'password'}
                  name="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  value={fields.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder={mode === 'register' ? 'Al menos 8 caracteres' : 'Tu contraseña'}
                />
                <button
                  type="button"
                  aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setVisible(!visible)}
                >
                  <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </span>
            </label>
            {mode === 'register' && (
              <label>
                Confirmar contraseña
                <input
                  type="password"
                  name="confirm-password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={fields.confirm}
                  onChange={(e) => update('confirm', e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </label>
            )}
            <label className="remember-user">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Recordar mi usuario en este equipo
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button className="button button-green full large" type="submit">
              {mode === 'login' ? 'Ingresar' : 'Crear cuenta de prueba'}
              <Icon name="arrow" size={18} />
            </button>
          </form>
          <div className="access-notice">
            <Icon name="shield" />
            <p>
              <strong>Estás explorando un prototipo</strong>Usa datos de ejemplo. No se crea una
              cuenta real ni se guardan el DNI o las contraseñas.
            </p>
          </div>
          <button className="button button-outline full" onClick={() => enter()}>
            Entrar al prototipo sin completar datos
          </button>
          <p className="small-note password-manager-note">
            Formularios preparados para autocompletar. El guardado en el Administrador de
            contraseñas de Google depende de Chrome y del acceso real del sitio.
          </p>
        </div>
        <small>TARPU · Un proyecto de QENTARA</small>
      </section>
    </main>
  )
}
