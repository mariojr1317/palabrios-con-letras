# Temu Dash

Prototipo web independiente inspirado en plataformas rítmicas, pensado para Chromebook. La carpeta se llama `temu-dash`; el nombre del repositorio `palabrios-con-letras` se conserva sin cambiar el proyecto original de la raíz.

## Abrir el juego
Abre `index.html` desde esta carpeta o publica la carpeta con GitHub Pages:
https://mariojr1317.github.io/palabrios-con-letras/temu-dash/

## Música
- Carga un archivo de audio desde el Chromebook o pega una URL directa a un MP3/OGG/WAV.
- El navegador puede bloquear la reproducción automática hasta que interactúes.
- Algunas webs bloquean el audio externo. En ese caso, usa un archivo local que tengas derecho a reproducir.
- La búsqueda de niveles online no garantiza que se pueda obtener la canción asociada: depende de la información del nivel, la disponibilidad del audio y los permisos del proveedor.

## Buscar niveles creados por jugadores de Geometry Dash
El juego intenta usar el proxy público administrado de corsproxy.dev para consultar niveles sin que tengas que desplegar tu propio servidor:

1. Abre [corsproxy.dev](https://corsproxy.dev/) y crea una cuenta gratuita.
2. En su panel, crea una clave API. No publiques ni compartas la clave.
3. Abre Temu Dash en [GitHub Pages](https://mariojr1317.github.io/palabrios-con-letras/temu-dash/).
4. En **Proxy público**, deja `https://api.corsproxy.dev/proxy`.
5. Pega tu clave en **Clave API gratuita de corsproxy.dev**.
6. Pulsa **PROBAR CONEXIÓN**. Si responde correctamente, escribe el nombre de un nivel y pulsa **BUSCAR NIVELES**.
7. En los resultados, pulsa **DESCARGAR DATOS DEL NIVEL** para guardar los datos originales.

La integración envía peticiones POST a `getGJLevels21.php` y `downloadGJLevel.php` a través del proxy público. El plan gratuito documenta un límite de 500 solicitudes al día. El proxy es un servicio externo y puede rechazar la petición o no ser compatible con el servidor de Geometry Dash; la conexión aún debe probarse en vivo. La clave se introduce en el navegador y no está guardada en el código del proyecto.

## Limitación importante
Buscar y descargar los datos del servidor **no significa que los niveles ya se puedan jugar dentro de Temu Dash**. Los datos descargados usan el formato de Geometry Dash y aún necesitan decodificarse y convertirse a los objetos del motor de este prototipo. La canción asociada tampoco siempre es accesible o autorizada. La demo no inventa resultados ni afirma que estas partes estén terminadas.

## Estado
- Juego básico jugable: sí.
- Carga de música local/URL directa: sí.
- Interfaz de búsqueda de niveles de jugadores: sí.
- Proxy público de búsqueda/descarga: integración añadida; requiere una clave gratuita de corsproxy.dev y prueba en vivo.
- Reproducir niveles de Geometry Dash directamente dentro del juego: pendiente.
- Carga automática de canciones asociadas a niveles online: pendiente de resolver metadatos y disponibilidad.

Proyecto fan independiente, no afiliado a RobTop ni a Geometry Dash.
