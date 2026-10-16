# Temu Dash: API de niveles

GitHub Pages solo sirve archivos estáticos. Para consultar Geometry Dash sin depender de la API de GDBrowser, esta carpeta incluye una función de servidor para Vercel en api/levels.js. La función consulta primero los servidores oficiales de Boomlings y usa gdproxy.net como alternativa.

## Publicar en Vercel

1. Entra en https://vercel.com/ y crea un proyecto desde el repositorio mariojr1317/palabrios-con-letras.
2. En Root Directory, elige temu-dash.
3. No necesitas configurar variables de entorno ni pegar una API key.
4. Despliega el proyecto. Comprueba que la página abre en su dominio https://...vercel.app.
5. En ese despliegue, deja el campo Servidor API (opcional) vacío: la página llamará a /api/levels en el mismo dominio.
6. Si quieres seguir usando GitHub Pages, copia el dominio https://...vercel.app de Vercel y pégalo en el campo Servidor API (opcional) de Temu Dash en GitHub Pages.

## Cómo funciona

- GET /api/levels?mode=test: comprueba si responde uno de los servidores de nivel.
- GET /api/levels?mode=search&q=Stereo%20Madness: busca niveles por nombre.
- GET /api/levels?mode=download&id=128: devuelve el formato original del nivel para que Temu Dash lo decodifique.

Se incluye limitación básica de solicitudes y un límite de 30 peticiones por minuto y dirección IP (por instancia). No se debe convertir este endpoint en un servicio público de alto tráfico. La disponibilidad depende de los servidores de Geometry Dash y del proxy alternativo; el código no puede eliminar un bloqueo impuesto por esos servicios.

La cadena secret usada por el protocolo de Geometry Dash es un valor público incluido en el cliente del juego, no una API key personal. No compartas nunca contraseñas de tu cuenta de Geometry Dash.
