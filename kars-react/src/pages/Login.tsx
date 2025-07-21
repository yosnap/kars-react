import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PageBreadcrumbs from "../components/PageBreadcrumbs";

export default function Login() {
  const { login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <PageBreadcrumbs
          items={[
            { label: { es: "Iniciar sesión", ca: "Iniciar sessió", en: "Login", fr: "Connexion" }, href: "/login" }
          ]}
        />
        
        <div className="flex items-center justify-center mt-12">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Àrea Professional</h2>
              <p className="text-gray-600 text-sm">Accés per a administradors i col·laboradors</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'usuari
                </label>
                <input
                  id="username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  type="text"
                  placeholder="Introdueix el teu nom d'usuari"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contrasenya
                </label>
                <input
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  type="password"
                  placeholder="Introdueix la teva contrasenya"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-black hover:border-white border border-transparent transition-all font-medium focus:ring-2 focus:ring-primary focus:ring-offset-2" 
                type="submit"
              >
                Iniciar sessió
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Només per a usuaris autoritzats
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 