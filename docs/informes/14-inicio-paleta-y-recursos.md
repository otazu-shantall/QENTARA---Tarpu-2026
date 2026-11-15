# Inicio con paleta compartida y recursos visuales

> La galería adicional y la adaptación del logo se reemplazaron en el [informe 15](15-tema-publico-y-logo-qentara.md). La paleta y el pie compacto se conservan.

**Fecha:** 15/11/2026. **Área:** frontend y experiencia de usuario.

El inicio utiliza los tokens de color del dashboard en fondos, texto, tarjetas, bordes y navegación. Los tonos oliva anteriores se sustituyen por verdes azulados, menta y superficies neutras, también al conservar el tema oscuro. Se mantienen la cabecera fija de ancho completo y el acceso verde.

Una galería incorpora dos fotografías de referencia agrícola, con créditos y enlaces a los autores. Las imágenes son locales y se cargan bajo demanda. El hero conserva la imagen satelital de Majes y su atribución. Las fotografías adicionales no se identifican como parcelas de Arequipa ni como resultados de análisis.

El panel del equipo incorpora una adaptación del logo QENTARA sobre verde profundo, sin el fondo azul de la referencia. La versión original permanece intacta en `frontend/assets/reference/`. La adaptación se realizó con IA y conserva su identificación visible. Procedencia, licencias y prompt final: [recursos del frontend](../../frontend/ASSETS.md).

El pie reduce su relleno vertical de 55 a 18 px, con logo más compacto, manteniendo los datos legibles. El funcionamiento del dashboard, sus datos, acceso y asistente no cambia.

**Verificación:** compilación TypeScript/Vite y recorrido Chrome correctos, sin errores JavaScript. Capturas de primera vista, galería, equipo, pie y tema oscuro en `frontend/test-results/`.
