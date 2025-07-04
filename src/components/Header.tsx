import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import logoMotoraldia from "../assets/logo-motoraldia-2024.jpg";
import { useFavorites } from "../hooks/useFavorites";

interface HeaderProps {
  onSearch?: (params: { vehicleType?: string; searchTerm?: string }) => void;
  onOpenAdvancedSearch?: () => void;
}

export default function Header({ onSearch, onOpenAdvancedSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const userDropdownMenuRef = useRef<HTMLDivElement>(null);
  const userCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const { favorites } = useFavorites();
  const [vehicleType, setVehicleType] = useState("");

  useEffect(() => {
    // Close menu with Escape key
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchDropdownOpen(false);
    }
    if (searchDropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchDropdownOpen]);

  function handleMouseEnterSearch() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setSearchDropdownOpen(true);
  }
  function handleMouseLeaveSearch() {
    closeTimeout.current = setTimeout(() => setSearchDropdownOpen(false), 250);
  }

  function handleMouseEnterUser() {
    if (userCloseTimeout.current) clearTimeout(userCloseTimeout.current);
    setUserDropdownOpen(true);
  }
  function handleMouseLeaveUser() {
    userCloseTimeout.current = setTimeout(() => setUserDropdownOpen(false), 250);
  }

  // Lógica para buscar desde el header
  const handleHeaderSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSearch) {
      onSearch({ vehicleType, searchTerm: searchQuery.trim() });
    }
  };

  return (
    <header className="rounded-b-2xl shadow-md">
      {/* Top Bar */}
      <div className="bg-tertiary text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 opacity-80">
              {/* Phone icon */}
              <svg className="w-4 h-4 inline-block text-primary-foreground opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V21a1 1 0 0 1-1.09 1A19.91 19.91 0 0 1 3 5.09 1 1 0 0 1 4 4h4.09a1 1 0 0 1 1 .75l1.13 4.52a1 1 0 0 1-.29 1L8.21 12.21a16 16 0 0 0 7.58 7.58l1.94-1.94a1 1 0 0 1 1-.29l4.52 1.13a1 1 0 0 1 .75 1V21z" /></svg>
              +34 900 123 456
            </span>
            <span className="flex items-center gap-1 opacity-80">
              {/* Email icon */}
              <svg className="w-4 h-4 inline-block text-primary-foreground opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></svg>
              info@motoraldia.com
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-9 rounded-md px-3 text-white hover:text-primary">Iniciar Sesión</button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-9 rounded-md px-3 text-white hover:text-primary">Registrarse</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 bg-white">
        <div className="flex items-center justify-between">
          {/* Logo y badge */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src={logoMotoraldia}
                alt="Logo Motoraldia 2024"
                className="h-[100px] w-auto mr-4"
              />
            </Link>
          </div>

          {/* Search Bar (solo si no es home) */}
          {location.pathname !== "/" && (
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative flex gap-2 items-center">
                {/* Select de tipo de vehículo */}
                <select
                  className="h-10 rounded-md border-2 border-gray-200 bg-background px-3 text-base text-gray-700 focus:border-primary focus:outline-none"
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value)}
                  style={{ minWidth: 140 }}
                >
                  <option value="">Todos</option>
                  <option value="cotxe">Coches</option>
                  <option value="moto-quad-atv">Motos</option>
                  <option value="autocaravana-camper">Caravanas</option>
                  <option value="vehicle-comercial">Comerciales</option>
                </select>
                {/* Search icon */}
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <form onSubmit={handleHeaderSearch} className="flex-1">
                  <input
                    className="flex h-10 rounded-md bg-background px-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-4 py-2 w-full border-2 border-gray-200 focus:border-primary"
                    placeholder="Buscar marca, modelo, año..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              to="/favoritos"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 rounded-xl px-5 shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {/* Bookmark icon */}
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" /></svg>
              {favorites.length > 0 ? `Favoritos (${favorites.length})` : "Favoritos"}
            </Link>
            {/* Iconos de idiomas como select solo con bandera */}
            <div className="ml-2">
              <select
                className="border rounded-xl px-3 py-2 bg-white text-sm shadow h-12 focus:outline-none"
                defaultValue="es"
                title="Seleccionar idioma"
                style={{ backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat' }}
              >
                <option value="en">🇬🇧</option>
                <option value="es">🇪🇸</option>
                <option value="ca">🏴</option>
                <option value="fr">🇫🇷</option>
              </select>
            </div>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium text-white h-12 px-6 bg-primary hover:bg-secondary shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
              {/* Calendar icon */}
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Publicar Anuncio
            </button>
            {/* Dropdown usuario */}
            <div className="relative"
              onMouseEnter={handleMouseEnterUser}
              onMouseLeave={handleMouseLeaveUser}
            >
              <button
                ref={userDropdownButtonRef}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 rounded-xl px-5 shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setUserDropdownOpen(open => !open)}
                aria-haspopup="true"
                aria-expanded={userDropdownOpen}
                onFocus={handleMouseEnterUser}
                onBlur={e => {
                  if (
                    !userDropdownMenuRef.current?.contains(e.relatedTarget as Node) &&
                    e.relatedTarget !== userDropdownButtonRef.current
                  ) {
                    setUserDropdownOpen(false);
                  }
                }}
              >
                {/* User icon */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>
              </button>
              {userDropdownOpen && (
                <div
                  ref={userDropdownMenuRef}
                  className="absolute right-0 mt-2 w-48 bg-white border border-border rounded shadow z-50"
                  tabIndex={-1}
                  onMouseEnter={handleMouseEnterUser}
                  onMouseLeave={handleMouseLeaveUser}
                  onBlur={e => {
                    if (
                      !userDropdownButtonRef.current?.contains(e.relatedTarget as Node) &&
                      e.relatedTarget !== userDropdownMenuRef.current
                    ) {
                      setUserDropdownOpen(false);
                    }
                  }}
                >
                  <a href="/dashboard" className="block px-4 py-2 hover:bg-primary/10 text-tertiary">Mi Dashboard</a>
                  <a href="/mis-anuncios" className="block px-4 py-2 hover:bg-primary/10 text-tertiary">Mis Anuncios</a>
                  <a href="/mis-favoritos" className="block px-4 py-2 hover:bg-primary/10 text-tertiary">Mis Favoritos</a>
                  <a href="/configuracion" className="block px-4 py-2 hover:bg-primary/10 text-tertiary">Configuración</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="border bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex space-x-8">
              {/* Dropdown Què busques? accesible con teclado y mouse, con retardo al cerrar */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnterSearch}
                onMouseLeave={handleMouseLeaveSearch}
              >
                <button
                  ref={dropdownButtonRef}

                  className="flex items-center text-tertiary hover:text-primary font-medium transition-colors"
                  aria-haspopup="true"
                  aria-expanded={searchDropdownOpen}
                  onFocus={handleMouseEnterSearch}
                  onBlur={e => {
                    if (
                      !dropdownMenuRef.current?.contains(e.relatedTarget as Node) &&
                      e.relatedTarget !== dropdownButtonRef.current
                    ) {
                      setSearchDropdownOpen(false);
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSearchDropdownOpen(open => !open);
                    }
                  }}
                >
                  <a href="/vehicles-andorra" className="text-tertiary hover:text-primary font-medium">Què busques?</a>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </button>
                {searchDropdownOpen && (
                  <div
                    ref={dropdownMenuRef}
                    className="absolute left-0 mt-2 w-64 bg-white border border-border rounded shadow-lg z-50 transition-opacity"
                    tabIndex={-1}
                    onMouseEnter={handleMouseEnterSearch}
                    onMouseLeave={handleMouseLeaveSearch}
                    onBlur={e => {
                      if (
                        !dropdownButtonRef.current?.contains(e.relatedTarget as Node) &&
                        e.relatedTarget !== dropdownMenuRef.current
                      ) {
                        setSearchDropdownOpen(false);
                      }
                    }}
                  >
                    <a href="/cotxes-nous-a-andorra/" className="block px-4 py-2 text-tertiary hover:text-primary">Nous</a>
                    <a href="/cotxes-seminous-a-andorra/" className="block px-4 py-2 text-tertiary hover:text-primary">Seminous</a>
                    <a href="/cotxes-de-segona-ma-a-andorra/" className="block px-4 py-2 text-tertiary hover:text-primary">Ocasió</a>
                    <a href="/cotxes-lloguer-a-andorra/" className="block px-4 py-2 text-tertiary hover:text-primary">Lloguer</a>
                    <a href="/cotxes-km0-a-andorra/" className="block px-4 py-2 text-tertiary hover:text-primary">Km0</a>
                    <a href="/cotxes-classics-a-andorra/" className="block px-4 py-2 text-tertiary hover:text-primary">Classics</a>
                    <a href="/cotxes-renting-a-andorra/" className="block px-4 py-2 text-tertiary hover:text-primary">Renting</a>
                  </div>
                )}
              </div>
              <a href="/prestec-cotxe" className="text-tertiary hover:text-primary font-medium">Prèstec cotxe</a>
              <a href="/taxacions" className="text-tertiary hover:text-primary font-medium">Taxacions</a>
              <a href="/documents" className="text-tertiary hover:text-primary font-medium">Documents compravenda</a>
              <a href="/blog" className="text-tertiary hover:text-primary font-medium">Blog</a>
              <a href="/favorits" className="text-tertiary hover:text-primary font-medium">Favorits</a>
            </div>
            {/* Botón blanco Filtros Avanzados en la barra inferior */}
            <button
              className="inline-flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 bg-white text-tertiary hover:bg-gray-100 font-medium transition-colors"
              onClick={onOpenAdvancedSearch}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707l-6.414 6.414A1 1 0 0 0 14 14.414V19a1 1 0 0 1-1.447.894l-4-2A1 1 0 0 1 8 17v-2.586a1 1 0 0 0-.293-.707L1.293 6.707A1 1 0 0 1 1 6V4z" /></svg>
              Filtros Avanzados
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
} 