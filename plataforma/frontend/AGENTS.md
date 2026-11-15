# Frontend de TARPU · reglas del área

Complementa el AGENTS.md de la raíz. Responsable del área: Shantall. Idioma de interfaz y documentación interna: español; identificadores del código: inglés.

- Trabajar en `frontend/`; `Codigo/` se retiró (DT-25) y sus versiones permanecen en Git.
- Leer `README.md`, `../docs/areas/frontend.md` y el estado compartido antes de modificar.
- Mantener el diseño para computadora, sidebar izquierda, temas claro/oscuro, letra legible y lenguaje sencillo.
- No incluir claves de proveedores ni persistir contraseñas o DNI.
- Mantener separados muestra real, ejemplos identificados y parcelas declaradas sin datos. Los fixtures locales no se presentan como la demo final: DT-16 exige evidencia real para la entrega.
- No dar por conectada la API, la autenticación o una IA remota. Revisar el contrato de T03 con el backend antes de integrar.
- Chat y conversación de voz con burbujas; avatar humano como ampliación.
- Verificar con `npm --prefix frontend run build` y `npm --prefix frontend test`; cuando haya navegador, `npm --prefix frontend run test:ui`, con dev en 5174.
- Declarar la asistencia de IA en los encabezados de código y en `../entrega/uso-de-ia.md`; actualizar estado e informe del área.
