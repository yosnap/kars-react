import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Star, LogOut, User } from "lucide-react";
// Logo moved to public/media folder
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onSearch?: (params: { vehicleType?: string; searchTerm?: string }) => void;
  onOpenAdvancedSearch?: () => void;
}

export default function Header({ onSearch, onOpenAdvancedSearch }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('ca'); // Default to Catalan
  const location = useLocation();
  const { favorites } = useFavorites();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFavoritesClick = () => {
    navigate('/favorits');
  };

  return (
    <header className="w-full bg-black shadow-md relative z-10">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/media/kars-logo.png"
                alt="Kars.ad Logo"
                className="h-[60px] w-auto"
              />
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${location.pathname === '/' ? 'text-primary' : ''}`}
            >
              Inici
            </Link>
            <Link 
              to="/qui-som" 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${location.pathname === '/qui-som' ? 'text-primary' : ''}`}
            >
              Qui som
            </Link>
            <Link 
              to="/taller" 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${location.pathname === '/taller' ? 'text-primary' : ''}`}
            >
              Taller
            </Link>
            <Link 
              to="/serveis" 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${location.pathname === '/serveis' ? 'text-primary' : ''}`}
            >
              Serveis
            </Link>
            <Link 
              to="/vehicles" 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${location.pathname === '/vehicles' ? 'text-primary' : ''}`}
            >
              Vehicles
            </Link>
            <Link 
              to="/ultimes-vendes" 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${location.pathname === '/ultimes-vendes' ? 'text-primary' : ''}`}
            >
              Últimes vendes
            </Link>
            <Link 
              to="/contacta" 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${location.pathname === '/contacta' ? 'text-primary' : ''}`}
            >
              Contacta
            </Link>
            
            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/admin" 
                    className="bg-blue-600 text-white px-4 py-2 text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                    title="Admin"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 text-xs font-medium rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                    title="Tancar sessió"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Tancar sessió</span>
                  </button>
                </div>
              ) : (
                <Link 
                  to="/admin" 
                  className="bg-primary text-white px-4 py-2 text-xs font-medium rounded-lg hover:bg-black hover:border-white border border-transparent transition-all flex items-center gap-2"
                  title="Accés per a professionals"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Àrea Professional</span>
                </Link>
              )}
              
              {/* Favorites Button */}
              <button 
                onClick={handleFavoritesClick}
                className="relative text-white hover:text-yellow-400 transition-colors"
                title="Favorits"
              >
                <Star className="w-6 h-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>
          </nav>

          {/* Language Flags */}
          <div className="flex items-center space-x-2">
            {/* English Flag */}
            {currentLanguage !== 'en' && (
              <button 
                className="w-6 h-4 overflow-hidden rounded-sm border border-gray-600 hover:border-white transition-colors" 
                title="English"
                onClick={() => setCurrentLanguage('en')}
              >
                <img src="/flags/en.svg" alt="English" className="w-full h-full object-cover" />
              </button>
            )}
            
            {/* French Flag */}
            {currentLanguage !== 'fr' && (
              <button 
                className="w-6 h-4 overflow-hidden rounded-sm border border-gray-600 hover:border-white transition-colors" 
                title="Français"
                onClick={() => setCurrentLanguage('fr')}
              >
                <img src="/flags/fr.svg" alt="Français" className="w-full h-full object-cover" />
              </button>
            )}
            
            {/* Spanish Flag */}
            {currentLanguage !== 'es' && (
              <button 
                className="w-6 h-4 overflow-hidden rounded-sm border border-gray-600 hover:border-white transition-colors" 
                title="Español"
                onClick={() => setCurrentLanguage('es')}
              >
                <img src="/flags/es.svg" alt="Español" className="w-full h-full object-cover" />
              </button>
            )}
            
            {/* Catalan Flag */}
            {currentLanguage !== 'ca' && (
              <button 
                className="w-6 h-4 overflow-hidden rounded-sm border border-gray-600 hover:border-white transition-colors" 
                title="Català"
                onClick={() => setCurrentLanguage('ca')}
              >
                <img src="/flags/ca.svg" alt="Català" className="w-full h-full object-cover" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-white hover:text-primary">Inici</Link>
            <Link to="/qui-som" className="block px-3 py-2 text-white hover:text-primary">Qui som</Link>
            <Link to="/taller" className="block px-3 py-2 text-white hover:text-primary">Taller</Link>
            <Link to="/serveis" className="block px-3 py-2 text-white hover:text-primary">Serveis</Link>
            <Link to="/vehicles" className="block px-3 py-2 text-white hover:text-primary">Vehicles</Link>
            <Link to="/ultimes-vendes" className="block px-3 py-2 text-white hover:text-primary">Últimes vendes</Link>
            <Link to="/contacta" className="block px-3 py-2 text-white hover:text-primary">Contacta</Link>
            {/* Mobile Auth Section */}
            <div className="px-3 py-2 space-y-2">
              {user ? (
                <div className="space-y-2">
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Admin
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Tancar sessió
                  </button>
                </div>
              ) : (
                <Link 
                  to="/admin" 
                  className="flex px-3 py-2 bg-primary text-white rounded-lg hover:bg-black hover:border-white border border-transparent transition-all items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Àrea Professional
                </Link>
              )}
              <button 
                onClick={handleFavoritesClick}
                className="block px-3 py-2 text-white hover:text-yellow-400 flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Favorits {favorites.length > 0 && `(${favorites.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}