
import { Card } from "@/components/ui/card";

interface AdBannerProps {
  size: 'small' | 'medium' | 'large';
  position: 'header' | 'sidebar' | 'content' | 'footer';
  className?: string;
}

const AdBanner = ({ size, position, className = "" }: AdBannerProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-24 w-full';
      case 'medium':
        return 'h-32 w-full';
      case 'large':
        return 'h-48 w-full';
      default:
        return 'h-32 w-full';
    }
  };

  const getAdContent = () => {
    switch (position) {
      case 'header':
        return {
          title: "Financiación al 0%",
          subtitle: "Consigue tu vehículo sin intereses",
          brand: "AutoFinance",
          bgColor: "bg-gradient-to-r from-blue-500 to-blue-600"
        };
      case 'sidebar':
        return {
          title: "Seguros de Coche",
          subtitle: "Hasta 40% de descuento",
          brand: "SecureAuto",
          bgColor: "bg-gradient-to-r from-green-500 to-green-600"
        };
      case 'content':
        return {
          title: "Taller Especializado",
          subtitle: "Revisiones oficiales",
          brand: "MasterService",
          bgColor: "bg-gradient-to-r from-purple-500 to-purple-600"
        };
      case 'footer':
        return {
          title: "Vende tu Coche",
          subtitle: "Tasación gratuita",
          brand: "VentaRápida",
          bgColor: "bg-gradient-to-r from-orange-500 to-orange-600"
        };
      default:
        return {
          title: "Publicidad",
          subtitle: "Tu anuncio aquí",
          brand: "Espacio Publicitario",
          bgColor: "bg-gradient-to-r from-gray-400 to-gray-500"
        };
    }
  };

  const adContent = getAdContent();

  return (
    <Card className={`${getSizeClasses()} ${className} overflow-hidden cursor-pointer hover:shadow-lg transition-shadow`}>
      <div className={`${adContent.bgColor} h-full flex items-center justify-center text-white p-4`}>
        <div className="text-center">
          <h3 className="font-bold text-lg mb-1">{adContent.title}</h3>
          <p className="text-sm opacity-90 mb-2">{adContent.subtitle}</p>
          <div className="text-xs opacity-75">{adContent.brand}</div>
        </div>
      </div>
    </Card>
  );
};

export default AdBanner;
