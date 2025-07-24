import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Vehicle {
  id: string;
  titolAnunci?: string;
  'titol-anunci'?: string;
  marcaCotxe?: string;
  'marques-cotxe'?: string;
  modelsCotxe?: string;
  'models-cotxe'?: string;
  versio?: string;
  any?: number;
  'any-fabricacio'?: number;
  preu?: number;
  quilometratge?: number;
  [key: string]: unknown;
}

interface VehicleContextType {
  currentVehicle: Vehicle | null;
  setCurrentVehicle: (vehicle: Vehicle | null) => void;
  isVehicleDetailPage: boolean;
  setIsVehicleDetailPage: (isDetail: boolean) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [isVehicleDetailPage, setIsVehicleDetailPage] = useState(false);

  return (
    <VehicleContext.Provider 
      value={{ 
        currentVehicle, 
        setCurrentVehicle, 
        isVehicleDetailPage, 
        setIsVehicleDetailPage 
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicleContext = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicleContext must be used within a VehicleProvider');
  }
  return context;
};

// Utility function to generate vehicle name
export const generateVehicleName = (vehicle: Vehicle): string => {
  if (vehicle.titolAnunci || vehicle['titol-anunci']) {
    return vehicle.titolAnunci || vehicle['titol-anunci'] || '';
  }
  
  const marca = vehicle.marcaCotxe || vehicle['marques-cotxe'] || '';
  const model = vehicle.modelsCotxe || vehicle['models-cotxe'] || '';
  const versio = vehicle.versio || '';
  const any = vehicle.any || vehicle['any-fabricacio'] || '';
  
  return `${marca} ${model} ${versio} ${any}`.replace(/\s+/g, ' ').trim();
};