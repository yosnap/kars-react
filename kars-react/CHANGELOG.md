# Changelog

Todas las modificaciones importantes del proyecto se documentarán en este archivo.

## [1.0.0] - 2024-06-10
### Añadido
- Instalación y configuración inicial de Tailwind CSS v4, PostCSS y Vite.
- Estructura base de carpetas para React.
- Documentación inicial en README.md y este CHANGELOG.md.

### Cambiado
- Nada por ahora.

### Eliminado
- Nada por ahora.

## [1.1.0] - 2024-06-11
### Cambiado
- Refactor visual de la card de listado de vehículos (`VehicleListCard`):
  - Precio y tipo de usuario alineados a la derecha, en la misma fila que el título y descripción.
  - Botón "Veure més" debajo, junto a la fila de información técnica.
- Navegación al detalle de vehículo usando `slug` en vez de `id` para URLs amigables.
- Ajustes de layout y estructura para mejorar la experiencia de usuario y la visualización responsive.
- Limpieza de archivos y componentes antiguos no utilizados.

## [2024-06-10] - v1.1.0

### Añadido
- Separador visual entre la imagen de portada y la información del vendedor en el perfil profesional (luego eliminado por decisión de diseño).
- Overlay oscuro con opacidad baja sobre la imagen de portada del perfil profesional para mejorar el contraste.
- Paginación real y recarga eficiente de vehículos en stock y vendidos, con carga paralela y prioridad visual para los vehículos en stock.
- Bordes y esquinas redondeadas en los contenedores principales del perfil profesional para mantener coherencia visual con el resto de la web.
- Separación visual y lógica robusta para distinguir entre vehículos en stock y vendidos, usando el campo `venut` como string ('true'/'false').
- Mejora en la visualización del logo de empresa, centrado y sin overlays innecesarios.

### Corregido
- Problemas de paginación y recarga de vehículos vendidos.
- Problemas de visualización y separación entre bloques en la cabecera del perfil profesional.
- Eliminación de logs y código de depuración.

### Eliminado
- Separador visual entre logo y contenido, ya que el overlay cumple la función de separación visual.

## [1.1.1] - 2024-06-XX
### Corregido
- Tipado robusto en `VehicleListLayout`: conversión de campos numéricos y booleanos (`quilometratge`, `preu`, `anunci-actiu`, `venut`, `anunci-destacat`) a string en el mapeo a `VehicleUI` para evitar errores de build y despliegue en Vercel.

## [Unreleased]
### Mejorado
- El slider de 'Vehículos Destacados' ahora solo muestra vehículos activos y no vendidos, con autoplay que se pausa al interactuar y favoritos accesibles desde el slider.
- La sección 'Últimos vehículos añadidos' solo muestra los 12 últimos vehículos activos y no vendidos, y el botón 'Ver Más Vehículos' lleva a la página '/vehicles-andorra'.
- Mejoras de accesibilidad y experiencia en las cards de vehículo: favoritos animados, navegación por teclado y apertura de detalle en nueva pestaña.
- El botón 'Ver Más Vehículos' ahora usa el color primario para mantener coherencia visual.

---

> Versión actualizada a la fecha de hoy tras los cambios en la página de perfil profesional y mejoras visuales/UX. 