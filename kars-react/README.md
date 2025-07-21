# motoraldia-react

Proyecto web para la gestión y visualización de vehículos de Motoraldia, desarrollado con React, Vite y Tailwind CSS v4.

## 🚗 Descripción
Aplicación frontend para mostrar, crear y editar anuncios de vehículos, integrando la API oficial de Motoraldia.

## ⚡ Instalación

```bash
npm install
```

## 🛠️ Uso

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver la app.

## 📁 Estructura del proyecto

- `src/` — Código fuente de React
- `src/index.css` — Estilos principales con Tailwind
- `tailwind.config.js` — Configuración de Tailwind
- `postcss.config.cjs` — Configuración de PostCSS

## 📝 Documentación
- [API Motoraldia](https://api.motoraldia.com/api-documentation/)
- [Tailwind CSS](https://tailwindcss.com/docs/installation)

## 🤝 Contribución
1. Haz un fork del repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'feat: añade nueva funcionalidad'`)
4. Haz push a tu rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia
[MIT](LICENSE)

## 🆕 Cambios recientes
- El slider de 'Vehículos Destacados' solo muestra vehículos activos y no vendidos, con favoritos accesibles y autoplay que se pausa al interactuar.
- La sección 'Últimos vehículos añadidos' solo muestra los 12 últimos vehículos activos y no vendidos. El botón 'Ver Más Vehículos' lleva a '/vehicles-andorra'.
- Mejoras de accesibilidad: favoritos animados, navegación por teclado y apertura de detalle en nueva pestaña desde las cards.
- El botón 'Ver Más Vehículos' ahora usa el color primario.

Consulta el archivo [CHANGELOG.md](./CHANGELOG.md) para ver el historial completo de cambios.

## Notas de tipado y despliegue

- Los datos de la API pueden traer campos numéricos o booleanos, pero los componentes visuales esperan strings. Se debe mapear y convertir estos campos (por ejemplo, `quilometratge`, `preu`, `anunci-actiu`, `venut`, `anunci-destacat`) a string antes de pasarlos a los componentes. Esto es fundamental para evitar errores de build y asegurar compatibilidad con TypeScript y Vercel.
