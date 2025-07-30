import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useVehicleContext, generateVehicleName } from '../context/VehicleContext';

interface WhatsAppConfig {
  number: string;
  contactName: string;
  messageTemplate: string;
  enabled: boolean;
}

export default function WhatsAppFloatingButton() {
  const { currentVehicle, isVehicleDetailPage } = useVehicleContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [config, setConfig] = useState<WhatsAppConfig>({
    number: '34612345678',
    contactName: 'Kars',
    messageTemplate: `Hola {contactName}, m'interessa el vehicle "{vehicleName}" que he vist a la vostra web: {vehicleUrl}.
Podríeu donar-me més informació per fer la compra?`,
    enabled: true
  });

  // Detectar si estamos en rutas de admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  const generateWhatsAppMessage = (): string => {
    const currentUrl = window.location.href;

    if (currentVehicle && isVehicleDetailPage) {
      // Generar nombre del vehículo usando la función del contexto
      const vehicleName = generateVehicleName(currentVehicle);

      // Reemplazar variables en la plantilla
      return config.messageTemplate
        .replace(/{contactName}/g, config.contactName)
        .replace(/{vehicleName}/g, vehicleName)
        .replace(/{vehicleUrl}/g, currentUrl);
    } else {
      // Mensaje genérico cuando no estamos en una página de vehículo
      return `Hola ${config.contactName}, m'agradaria rebre més informació sobre els vostres vehicles. Gràcies!`;
    }
  };

  const handleWhatsAppClick = () => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${config.number}?text=${encodedMessage}`;

    // Abrir WhatsApp en una nueva ventana
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Detectar si el menú móvil está abierto observando el DOM
  useEffect(() => {
    const checkMobileMenu = () => {
      // El menú móvil añade overflow:hidden al body cuando está abierto
      const isOpen = document.body.style.overflow === 'hidden' && window.innerWidth < 1024;
      setIsMobileMenuOpen(isOpen);
    };

    // Observar cambios en el style del body
    const observer = new MutationObserver(checkMobileMenu);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });

    // También escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkMobileMenu);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkMobileMenu);
    };
  }, []);

  // Mostrar el botón después de un pequeño delay para mejor UX
  useEffect(() => {
    // No mostrar en admin
    if (isAdminRoute) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(config.enabled);
    }, 1000);

    return () => clearTimeout(timer);
  }, [config.enabled, isAdminRoute]);

  // Cargar configuración (en el futuro desde API)
  useEffect(() => {
    // TODO: Cargar configuración desde API
    // const loadConfig = async () => {
    //   try {
    //     const response = await fetch('/api/settings/whatsapp');
    //     const data = await response.json();
    //     setConfig(data);
    //   } catch (error) {
    //     console.error('Error loading WhatsApp config:', error);
    //   }
    // };
    // loadConfig();
  }, []);

  // No mostrar si está deshabilitado, no es visible, estamos en admin, o el menú móvil está abierto
  if (!config.enabled || !isVisible || isAdminRoute || isMobileMenuOpen) {
    return null;
  }

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleWhatsAppClick}
          className="group relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Contactar per WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Contactar per WhatsApp
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
            </div>
          </div>

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
        </button>
      </div>

      {/* Indicador de nuevo mensaje (opcional) */}
      {isVehicleDetailPage && (
        <div className="fixed bottom-24 right-6 z-40">
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs rounded-lg py-2 px-3 shadow-lg border border-gray-200 dark:border-gray-700 max-w-48">
            <p className="font-medium">¿T'interessa aquest vehicle?</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Contacta'ns per WhatsApp!</p>
          </div>
        </div>
      )}
    </>
  );
}

