# Temu Dash — notas técnicas y referencias de Geometry Dash

## Cambios de esta versión

- La generación aleatoria por intento se sustituyó por una lista fija de objetos.
- Importa JSON histórico de Temu Dash (con el campo encodedLevel), JSON con data de GDBrowser y cadenas de nivel.
- Decodifica Base64 URL-safe y descomprime GZIP con DecompressionStream cuando el formato lo permite.
- Interpreta cadenas de objetos con pares de clave/valor separados por comas y objetos separados por punto y coma.
- Implementa colisiones básicas, bloques 1–7, pinchos/saws comunes, monedas, orbes, pads y portales para ocho modos.
- Busca y descarga a través de la API pública de GDBrowser; no pide una clave personal de corsproxy.dev.

## Formato de nivel

Cada objeto de la cadena suele escribirse como 1,id,2,x,3,y,...; y los objetos se separan con punto y coma. Las claves 1, 2 y 3 son el ID, X e Y; también se interpretan rotación (6), giros (4/5) y escala (32). Los valores del objeto se guardan como strings numéricos en la codificación original.

Los niveles online normalmente llegan como Base64 URL-safe comprimido en GZIP. Se convierte Base64 a bytes, se descomprime y luego se analizan los objetos. Algunos datos oficiales históricos pueden omitir un prefijo gzip y requerir un intento alternativo.

## IDs principales reconocidos

### Modos y portales
| ID | Objeto |
|---:|---|
| 12 | Cubo |
| 13 | Nave |
| 47 | Bola |
| 111 | UFO |
| 660 | Wave |
| 745 | Robot |
| 1331 | Araña |
| 1933 | Swing |
| 10 / 11 | Portales de gravedad |
| 99 / 101 | Portales de tamaño |
| 200 / 201 / 202 / 203 / 1334 | Lento / normal / rápido / más rápido / velocidad máxima |
| 286 / 287 | Portales dual; el dual completo no está implementado |
| 747 / 749 | Portales de teletransporte; falta resolver el enlace entre destinos |

Los IDs de modo y portales se basan en enumeraciones comunitarias de gd.py. Temu Dash aproxima sus comportamientos: no incorpora ni usa el código interno de RobTop.

### Bloques, peligros, orbes y pads
| ID | Uso reconocido |
|---:|---|
| 1–7 | Familias básicas de bloques |
| 8, 39, 103 | Variantes de pincho |
| 88, 89, 98 | Objetos de sierra/variantes comunes; algunos IDs dependen del contexto |
| 35, 140, 1332 | Pads de salto amarillo, rosa y rojo |
| 67 | Pad de gravedad azul |
| 36, 141 | Orbes de salto amarillo y rosa |
| 84, 1022, 1330, 1333 | Orbes de acción/gravedad en variantes de color |
| 1704, 1751 | Dash orb y reverse dash orb |
| 1329, 142, 1324 | IDs relacionados con monedas en catálogos comunitarios; pueden depender de la versión |
| 34 | Objeto histórico relacionado con final de nivel |

object-ids.json incluye estas listas y propiedades de objetos en formato legible por máquina. El catálogo es deliberadamente honesto: no pretende ser exhaustivo y el motor no asigna colisiones inventadas a IDs desconocidos.

## Física y límites

Las constantes de gd-engine.js son parámetros prácticos de Canvas, no una reproducción exacta de los coeficientes internos de Geometry Dash. El resultado original varía según la versión, velocidad del nivel, tamaño mini, gravedad, modo, plataformas y triggers.

No se implementan todavía todos los cientos/miles de objetos, bloques decorativos, triggers 2.2, shaders, cámara dinámica, gravedad local, teletransporte enlazado, dual real, checkpoints/práctica, colisiones exactas en pendientes ni sincronización musical por BPM. Los gráficos son formas geométricas propias, no los sprites originales.

La API puede bloquear llamadas cross-origin (CORS, límites de uso o indisponibilidad); si ocurre, importa un JSON descargado previamente.

## Fuentes consultadas

- Estructura de los objetos por clave: https://github.com/gd-programming/gd.docs/blob/main/docs/resources/client/level-components/level-object.md
- Decodificación Base64/GZIP: https://github.com/gd-programming/gd.docs/blob/main/docs/topics/levelstring_encoding_decoding.md
- Enumeraciones de modos, portales, pads y orbes: https://gdpy.readthedocs.io/en/master/_modules/gd/api/enums.html
- Parser JavaScript comunitario GDParse: https://github.com/HectLM/GDParse
- Catálogo comunitario de nombres de IDs (muchos objetos y variantes): https://flowvix.github.io/gd-info-explorer/ids
- GDBrowser API y fuente: https://gdbrowser.com/api ; https://github.com/yoann256/GDBrowser-Maintained
