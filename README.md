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
- Refactor visual de la card de listado de vehículos: precio y tipo de usuario alineados a la derecha, botón "Veure més" debajo.
- Navegación al detalle de vehículo usando `slug` en vez de `id` para URLs amigables.
- Mejoras de layout y experiencia de usuario en el listado de vehículos.

Consulta el archivo [CHANGELOG.md](./CHANGELOG.md) para ver el historial completo de cambios.
