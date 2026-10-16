# Temu Dash — notas técnicas y referencias de Geometry Dash

## Cambios de esta versión

- La generación aleatoria por intento se sustituyó por una lista fija de objetos.
- Importa JSON histórico de Temu Dash (con el campo encodedLevel), JSON con data de GDBrowser y cadenas de nivel.
- Decodifica Base64 URL-safe y descomprime GZIP con DecompressionStream cuando el formato lo permite.
- Interpreta cadenas de objetos con pares de clave/valor separados por comas y objetos separados por punto y coma.
- Implementa colisiones básicas, bloques 1–7, pinchos/saws comunes, monedas, orbes, pads y portales para ocho modos.
- Busca y descarga mediante el endpoint de servidor de Temu Dash (Boomlings oficial y un intento de respaldo por GD Proxy); no consulta directamente la API de GDBrowser ni necesita una clave personal.

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
| 88, 89, 98; 1705–1707 | Sierras grandes/medianas/pequeñas y sus IDs antiguos |
| 35, 140, 1332 | Pads de salto amarillo, rosa y rojo |
| 67 | Pad de gravedad azul |
| 36, 141 | Orbes de salto amarillo y rosa |
| 84, 1022, 1330, 1333 | Orbes de acción/gravedad en variantes de color |
| 1704, 1751 | Dash orb y reverse dash orb |
| 1329 | Moneda de nivel de usuario |
| 142 | Moneda secreta histórica usada en niveles oficiales; se elimina de niveles no oficiales |
| 34 | Objeto histórico relacionado con final de nivel |

object-ids.json incluye estas listas y propiedades de objetos en formato legible por máquina. El catálogo es deliberadamente honesto: no pretende ser exhaustivo y el motor no asigna colisiones inventadas a IDs desconocidos.

## Física y límites

El motor ahora usa pasos físicos fijos de 1/240 s, redondeo de velocidad vertical a 0.001 y escala vertical de 0.225 por tick. Estos valores y las tablas por modo se basan en la ingeniería inversa comunitaria de Geometry Dash 2.2081 para Windows/Steam; no son una especificación oficial publicada por RobTop. La constante horizontal por tick se modela como 1.0465 (velocidad 0.7), 1.29825044 (0.9), 1.6142578 (1.1), 1.95 (1.3) y 2.4 (1.6).

El cubo usa impulsos aproximados de salto 10.62 / 11.18 / 11.42 / 11.23 / 11.23 para esas velocidades, y gravedad por tick 0.212 / 0.216 / 0.215 / 0.216 / 0.216. Mini usa un impulso de salto 0.8×. Para la nave y UFO se añaden sus parámetros de empuje/gravedad y límites verticales; el robot aplica 0.9× gravedad, 0.5× salto y una flotación limitada; bola, araña y swing tienen cambios específicos de gravedad. Véase physics_reference en object-ids.json para la tabla.

En colisiones separamos familias: bloques rectangulares, un subconjunto de pendientes triangulares, pinchos con rectángulos rotados aproximados y sierras/objetos redondos con colisión círculo-rectángulo. El catálogo comunitario muestra que varios IDs negros son alias por versión y que los IDs 397–399 son hojas de pincho, no sierras. Esto mejora el modelo, pero todavía no equivale a las hitboxes de cada objeto y cada modo del juego original.

No se implementan todavía todos los cientos/miles de objetos, bloques decorativos, triggers 2.2, shaders, cámara dinámica, gravedad local, teletransporte enlazado, dual real, checkpoints/práctica, colisiones exactas en pendientes ni sincronización musical por BPM. Los gráficos son formas geométricas propias, no los sprites originales.

La API puede bloquear llamadas cross-origin (CORS, límites de uso o indisponibilidad); si ocurre, importa un JSON descargado previamente.

## Fuentes consultadas

- Estructura de los objetos por clave: https://github.com/gd-programming/gd.docs/blob/main/docs/resources/client/level-components/level-object.md
- Física calibrada mediante ingeniería inversa comunitaria: https://github.com/gdsolver/gdsolver
- Formas de hitbox de bloques, pendientes, pinchos y sierras: https://github.com/GDCreatorSchool/gdcs2/blob/main/content/docs/guides/the-editor/static-objects.md
- Decodificación Base64/GZIP: https://github.com/gd-programming/gd.docs/blob/main/docs/topics/levelstring_encoding_decoding.md
- Enumeraciones de modos, portales, pads y orbes: https://gdpy.readthedocs.io/en/master/_modules/gd/api/enums.html
- Parser JavaScript comunitario GDParse: https://github.com/HectLM/GDParse
- Catálogo comunitario y equivalencias de IDs por versión: https://a-zalt.github.io/gdknowledge/resources/object_ids.html
- GDBrowser API y fuente: https://gdbrowser.com/api ; https://github.com/yoann256/GDBrowser-Maintained
