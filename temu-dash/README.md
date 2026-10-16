# Temu Dash

Prototipo web independiente inspirado en plataformas rítmicas, pensado para Chromebook.

## Cómo abrirlo
Abre `index.html` desde esta carpeta o publica la carpeta con GitHub Pages:
https://mariojr1317.github.io/palabrios-con-letras/temu-dash/

## Música
- Carga un archivo de audio desde el dispositivo, o pega una URL directa a un MP3/OGG/WAV.
- El navegador puede bloquear autoplay hasta que el usuario interactúe.
- Algunos hosts no permiten reproducir audio desde otras webs; en ese caso, descarga un archivo que tengas derecho a usar y cárgalo localmente.

## Niveles online de Geometry Dash
La conexión a los servidores oficiales todavía no está implementada. El protocolo de niveles usa endpoints como `getGJLevels21.php` y `downloadGJLevel.php`; la página web necesita un backend/proxy para tratar con CORS y las protecciones del servidor. Después hay que interpretar los datos codificados del nivel y asociar la canción. Esta demo no finge que los niveles oficiales ya están conectados.

## Estado
- Juego básico jugable: sí.
- Carga de música local/URL directa: sí.
- Búsqueda/descarga real de niveles de los servidores de GD: pendiente.
- Reproducción automática de canciones asociadas a niveles online: pendiente de implementar la descarga y lectura de metadatos.

Proyecto fan independiente, no afiliado a RobTop ni a Geometry Dash.
