import React, { useState } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-md border-b">
      {/* Top Bar */}
      <div className="bg-orange-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span>📞 +34 900 123 456</span>
            <span>✉️ info@motoraldia.com</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-orange-200 font-semibold">Iniciar Sesión</button>
            <button className="text-white hover:text-orange-200 font-semibold">Registrarse</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y badge */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-orange-600 tracking-tight">
              Motoraldia
            </a>
            <span className="ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded font-semibold">Premium</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              {/* Icono de búsqueda */}
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Buscar marca, modelo, año..."
                className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 focus:border-orange-600 rounded"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-3">
            <button className="flex items-center border border-gray-300 rounded px-3 py-1 text-gray-700 hover:text-orange-600">
              {/* Icono bookmark */}
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" /></svg>
              Favoritos
            </button>
            <button className="flex items-center bg-orange-600 hover:bg-orange-700 text-white rounded px-4 py-2 font-semibold shadow">
              {/* Icono calendar */}
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Publicar Anuncio
            </button>
            {/* Dropdown usuario */}
            <div className="relative">
              <button
                className="flex items-center border border-gray-300 rounded px-2 py-1 text-gray-700 hover:text-orange-600"
                onClick={() => setDropdownOpen(open => !open)}
              >
                {/* Icono usuario */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">
                  <a href="/dashboard" className="block px-4 py-2 hover:bg-orange-50 text-gray-700">Mi Dashboard</a>
                  <a href="/mis-anuncios" className="block px-4 py-2 hover:bg-orange-50 text-gray-700">Mis Anuncios</a>
                  <a href="/mis-favoritos" className="block px-4 py-2 hover:bg-orange-50 text-gray-700">Mis Favoritos</a>
                  <a href="/configuracion" className="block px-4 py-2 hover:bg-orange-50 text-gray-700">Configuración</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-orange-600 font-medium">Inicio</a>
              {/* Dropdown Què busques? */}
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-orange-600 font-medium transition-colors">
                  Què busques?
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                  <a href="/coches?estado=nuevo" className="block px-4 py-2 text-gray-700 hover:text-orange-600">Nous</a>
                  <a href="/coches?estado=seminuevo" className="block px-4 py-2 text-gray-700 hover:text-orange-600">Seminous</a>
                  <a href="/coches?estado=ocasion" className="block px-4 py-2 text-gray-700 hover:text-orange-600">Ocasió</a>
                  <a href="/coches?tipo=alquiler" className="block px-4 py-2 text-gray-700 hover:text-orange-600">Lloguer</a>
                  <a href="/coches?estado=km0" className="block px-4 py-2 text-gray-700 hover:text-orange-600">Km0</a>
                  <a href="/coches?categoria=clasicos" className="block px-4 py-2 text-gray-700 hover:text-orange-600">Clàssics</a>
                  <a href="/coches?tipo=renting" className="block px-4 py-2 text-gray-700 hover:text-orange-600">Renting</a>
                </div>
              </div>
              <a href="/prestec-cotxe" className="text-gray-700 hover:text-orange-600 font-medium">Prèstec cotxe</a>
              <a href="/taxacions" className="text-gray-700 hover:text-orange-600 font-medium">Taxacions</a>
              <a href="/documents" className="text-gray-700 hover:text-orange-600 font-medium">Documents compravenda</a>
              <a href="/blog" className="text-gray-700 hover:text-orange-600 font-medium">Blog</a>
              <a href="/favorits" className="text-gray-700 hover:text-orange-600 font-medium">Favorits</a>
            </div>
            <button className="flex items-center border border-gray-300 rounded px-3 py-1 text-gray-700 hover:text-orange-600">
              {/* Icono filtro */}
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707l-6.414 6.414A1 1 0 0 0 13 14.414V19a1 1 0 0 1-1.447.894l-2-1A1 1 0 0 1 9 18.118V14.414a1 1 0 0 0-.293-.707L2.293 6.707A1 1 0 0 1 2 6V4z" /></svg>
              Filtros Avanzados
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
} 