import React from "react";
import { Link } from "react-router-dom";

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div>
    <header className="bg-blue-700 text-white p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Motoraldia</Link>
        <nav>
          <Link to="/" className="mr-4 hover:underline">Inicio</Link>
          <Link to="/nuevo" className="hover:underline">Nuevo Vehículo</Link>
        </nav>
      </div>
    </header>
    <main>{children}</main>
  </div>
);

export default MainLayout; 