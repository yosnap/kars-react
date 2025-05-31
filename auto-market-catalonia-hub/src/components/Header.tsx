
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  User, 
  Bookmark, 
  Calendar,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white shadow-md border-b">
      {/* Top Bar */}
      <div className="bg-tertiary text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span>📞 +34 900 123 456</span>
            <span>✉️ info@motoraldia.com</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-primary">
              <User className="w-4 h-4 mr-1" />
              Iniciar Sesión
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-primary">
              Registrarse
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-primary">
              MotorPortal
            </a>
            <Badge variant="secondary" className="ml-2 bg-secondary text-white">
              Premium
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar marca, modelo, año..."
                className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4 mr-1" />
              Favoritos
            </Button>
            <Button className="bg-primary hover:bg-secondary">
              <Calendar className="w-4 h-4 mr-2" />
              Publicar Anuncio
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white z-50">
                <DropdownMenuItem>Mi Dashboard</DropdownMenuItem>
                <DropdownMenuItem>Mis Anuncios</DropdownMenuItem>
                <DropdownMenuItem>Mis Favoritos</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="border-t bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-primary font-medium">
                Inicio
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-primary font-medium transition-colors">
                  Què busques?
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white z-50">
                  <DropdownMenuItem asChild>
                    <a href="/coches?estado=nuevo" className="block w-full text-gray-700 hover:text-primary">
                      Nous
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/coches?estado=seminuevo" className="block w-full text-gray-700 hover:text-primary">
                      Seminous
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/coches?estado=ocasion" className="block w-full text-gray-700 hover:text-primary">
                      Ocasió
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/coches?tipo=alquiler" className="block w-full text-gray-700 hover:text-primary">
                      Lloguer
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/coches?estado=km0" className="block w-full text-gray-700 hover:text-primary">
                      Km0
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/coches?categoria=clasicos" className="block w-full text-gray-700 hover:text-primary">
                      Clàssics
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/coches?tipo=renting" className="block w-full text-gray-700 hover:text-primary">
                      Renting
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <a href="/prestec-cotxe" className="text-gray-700 hover:text-primary font-medium">
                Prèstec cotxe
              </a>
              <a href="/taxacions" className="text-gray-700 hover:text-primary font-medium">
                Taxacions
              </a>
              <a href="/documents" className="text-gray-700 hover:text-primary font-medium">
                Documents compravenda
              </a>
              <a href="/blog" className="text-gray-700 hover:text-primary font-medium">
                Blog
              </a>
              <a href="/favorits" className="text-gray-700 hover:text-primary font-medium">
                Favorits
              </a>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filtros Avanzados
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
