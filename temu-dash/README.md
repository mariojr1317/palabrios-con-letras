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
El juego ahora incluye interfaz para buscar niveles reales y descargar sus datos originales. Para habilitarla, despliega `worker.js` como Cloudflare Worker:

1. Entra a Cloudflare y crea un Worker nuevo.
2. Copia el contenido completo de `worker.js` en el editor del Worker y despliega.
3. Copia la URL pública del Worker (por ejemplo, la que termina en `.workers.dev`).
4. Abre Temu Dash y pega esa URL en **URL del proxy de niveles**.
5. Pulsa **PROBAR CONEXIÓN**. Debe confirmar que el Worker está activo y que Geometry Dash respondió.
6. Si la prueba sale bien, escribe el nombre de un nivel y pulsa **BUSCAR NIVELES**. En cada resultado, usa **DESCARGAR DATOS DEL NIVEL** para guardar el JSON recibido.

El Worker consulta los endpoints comunitariamente documentados `getGJLevels21.php` y `downloadGJLevel.php`, enviando versión de juego y versión binaria, e incluye `/api/health` para diagnosticar la conexión. El protocolo de Geometry Dash no es una API pública estable; el servidor puede cambiar o rechazar solicitudes, y el proxy puede necesitar mantenimiento.

## Limitación importante
Buscar y descargar los datos del servidor **no significa que los niveles ya se puedan jugar dentro de Temu Dash**. Los datos descargados usan el formato de Geometry Dash y aún necesitan decodificarse y convertirse a los objetos del motor de este prototipo. La canción asociada tampoco siempre es accesible o autorizada. La demo no inventa resultados ni afirma que estas partes estén terminadas.

## Estado
- Juego básico jugable: sí.
- Carga de música local/URL directa: sí.
- Interfaz de búsqueda de niveles de jugadores: sí.
- Proxy de búsqueda/descarga incluido: sí, requiere desplegarlo en Cloudflare.
- Reproducir niveles de Geometry Dash directamente dentro del juego: pendiente.
- Carga automática de canciones asociadas a niveles online: pendiente de resolver metadatos y disponibilidad.

Proyecto fan independiente, no afiliado a RobTop ni a Geometry Dash.
