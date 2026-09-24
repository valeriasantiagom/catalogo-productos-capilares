# LEVÁRIA: catálogo interactivo auditado

Este proyecto está diseñado para funcionar como un sitio **estático y autónomo** en GitHub Pages y también puede abrirse localmente. No necesita bibliotecas externas, conexión a este chat ni CDN. Incluye las 11 imágenes, animación de pasar página, zoom de hasta 800 %, arrastre cuando hay zoom y navegación táctil.

## Estructura obligatoria

```text
index.html
styles.css
pages.js
app.js
assets/
  01-portada-fundamentos.png
  02-guia-rapida-seleccion.png
  03-lenora.png
  04-lenoray.png
  05-lenorae.png
  06-leave-in-nanokeratina.png
  07-hyalurelle.png
  08-oasis-hair-cream.png
  09-reparador-intensivo.png
  10-tonico-stop-caida.png
  11-rutinas-referencia.png
```

**Sube los cuatro archivos y la carpeta `assets` juntos a la raíz de GitHub.** No subas el ZIP sin descomprimir ni una carpeta envolvente con el nombre del proyecto. La raíz debe mostrar directamente `index.html`, `styles.css`, `pages.js`, `app.js` y `assets`.

En GitHub, abre **Settings → Pages → Build and deployment** y selecciona **Deploy from a branch**, rama `main`, carpeta `/(root)`. Espera la publicación y abre la URL de GitHub Pages. Si ves una copia anterior, recarga omitiendo caché o abre en una pestaña privada.

## Cómo usarlo

- Anterior / Siguiente, flechas del teclado, selector de página o deslizar horizontalmente en el móvil.
- Botones + y −, gesto de pellizco en pantallas táctiles o Ctrl+rueda para acercar; al ampliar puedes arrastrar la imagen para leerla.
- `Ajustar` muestra la página completa, sin recortar los renglones inferiores; los controles están en un área separada.
- Si una imagen no puede cargarse, la revista **no pasa a una hoja en blanco**: conserva la página actual y permite reintentar.

## Diagnóstico

Las imágenes se leen desde `assets/` mediante rutas relativas (funcionan tanto bajo `/` como bajo una ruta de repositorio GitHub Pages). El repositorio incluye un chequeo de integridad `audit_manifest.json` y el script opcional `audit.py`, que puedes ejecutar con Python para verificar que los 11 archivos de imagen siguen presentes e intactos.
