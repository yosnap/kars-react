import React from 'react';
import { 
  Car, Wifi, Navigation, Shield, Zap, Music, Phone, Gauge, 
  Fan, Snowflake, Sun, Lock, Eye, Headphones, Volume2, 
  MonitorSpeaker, Smartphone, Disc3, Radio, Camera,
  Wind, Settings, Wrench, Fuel, Battery, Lightbulb,
  ShieldCheck, AlertTriangle, CheckCircle, Star,
  Home, Tv, Bed, Bath, Coffee, Utensils, Waves
} from 'lucide-react';

interface ExtraButtonProps {
  extra: {
    id: string;
    name: string;
    slug: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}

// Mapeo de iconos según el slug del extra
const getExtraIcon = (slug: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    // Seguridad
    'abs': <Shield className="w-5 h-5" />,
    'esp': <ShieldCheck className="w-5 h-5" />,
    'airbag-conductor': <Shield className="w-5 h-5" />,
    'airbag-copilot': <Shield className="w-5 h-5" />,
    'airbag-lateral': <Shield className="w-5 h-5" />,
    'airbag-cortina': <Shield className="w-5 h-5" />,
    'alarma': <Lock className="w-5 h-5" />,
    'immobilitzador': <Lock className="w-5 h-5" />,
    'control-estabilitat': <ShieldCheck className="w-5 h-5" />,
    'control-traccio': <ShieldCheck className="w-5 h-5" />,
    
    // Confort y climatización
    'aire-acondicionat': <Snowflake className="w-5 h-5" />,
    'climatitzador': <Fan className="w-5 h-5" />,
    'climatitzador-bizona': <Fan className="w-5 h-5" />,
    'climatitzador-trizona': <Fan className="w-5 h-5" />,
    'calefaccio-auxiliar': <Sun className="w-5 h-5" />,
    'sostre-solar': <Sun className="w-5 h-5" />,
    'sostre-panoramic': <Sun className="w-5 h-5" />,
    
    // Electrónica y conectividad
    'bluetooth': <Wifi className="w-5 h-5" />,
    'wifi': <Wifi className="w-5 h-5" />,
    'gps': <Navigation className="w-5 h-5" />,
    'navegador': <Navigation className="w-5 h-5" />,
    'sistema-navegacio': <Navigation className="w-5 h-5" />,
    'ordinador-bord': <MonitorSpeaker className="w-5 h-5" />,
    'pantalla-tactil': <MonitorSpeaker className="w-5 h-5" />,
    'usb': <Smartphone className="w-5 h-5" />,
    'conexio-usb': <Smartphone className="w-5 h-5" />,
    
    // Audio y entretenimiento  
    'radio': <Radio className="w-5 h-5" />,
    'cd-player': <Disc3 className="w-5 h-5" />,
    'mp3-player': <Music className="w-5 h-5" />,
    'sistema-audio': <Volume2 className="w-5 h-5" />,
    'altaveus-premium': <Volume2 className="w-5 h-5" />,
    'sistema-handfree': <Phone className="w-5 h-5" />,
    'handfree': <Headphones className="w-5 h-5" />,
    
    // Iluminación
    'faros-xenon': <Lightbulb className="w-5 h-5" />,
    'faros-led': <Lightbulb className="w-5 h-5" />,
    'faros-adapatius': <Lightbulb className="w-5 h-5" />,
    'llums-diurnes': <Lightbulb className="w-5 h-5" />,
    
    // Asistencia al conductor
    'control-creuer': <Gauge className="w-5 h-5" />,
    'control-velocitat': <Gauge className="w-5 h-5" />,
    'sensor-aparcament': <Eye className="w-5 h-5" />,
    'camera-marxa-enrere': <Camera className="w-5 h-5" />,
    'assistencia-aparcament': <Eye className="w-5 h-5" />,
    
    // Mecánica y motor
    'direccio-assistida': <Settings className="w-5 h-5" />,
    'servo-direccio': <Settings className="w-5 h-5" />,
    'turbo': <Zap className="w-5 h-5" />,
    'intercooler': <Wind className="w-5 h-5" />,
    
    // Ruedas y suspensión
    'llantes-aleacio': <Settings className="w-5 h-5" />,
    'suspensio-deportiva': <Settings className="w-5 h-5" />,
    'suspensio-neumatica': <Settings className="w-5 h-5" />,
    
    // Elementos eléctricos
    'elevador-cristalls-electric': <Zap className="w-5 h-5" />,
    'retrovisors-electrics': <Zap className="w-5 h-5" />,
    'seients-electrics': <Zap className="w-5 h-5" />,
    
    // Habitáculo (para autocaravanas)
    'cuina': <Utensils className="w-5 h-5" />,
    'nevera': <Snowflake className="w-5 h-5" />,
    'dutxa': <Bath className="w-5 h-5" />,
    'wc': <Home className="w-5 h-5" />,
    'tv': <Tv className="w-5 h-5" />,
    'llit': <Bed className="w-5 h-5" />,
    'cafetera': <Coffee className="w-5 h-5" />,
    'aigua-corrent': <Waves className="w-5 h-5" />,
    
    // Motos específicos
    'maletes': <Car className="w-5 h-5" />,
    'pantalla-vent': <Wind className="w-5 h-5" />,
    'windshield': <Wind className="w-5 h-5" />,
    'puny-calefactat': <Sun className="w-5 h-5" />,
    
    // Genéricos
    'altres': <Star className="w-5 h-5" />,
    'personalitzat': <Settings className="w-5 h-5" />
  };

  return iconMap[slug] || <Settings className="w-5 h-5" />;
};

const ExtraButton: React.FC<ExtraButtonProps> = ({ extra, isSelected, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 w-full h-[120px] hover:shadow-md
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md' 
          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
        }
      `}
    >
      {/* Icono */}
      <div className={`mb-2 p-2 rounded-lg ${
        isSelected 
          ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}>
        {getExtraIcon(extra.slug)}
      </div>
      
      {/* Nombre del extra */}
      <span className={`text-xs font-medium text-center leading-tight px-1 ${
        isSelected 
          ? 'text-blue-700 dark:text-blue-300' 
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {extra.name.length > 20 ? extra.name.substring(0, 20) + '...' : extra.name}
      </span>
      
      {/* Indicador de selección */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-4 h-4 text-blue-500" />
        </div>
      )}
    </button>
  );
};

export default ExtraButton;