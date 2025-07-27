/**
 * HOOK UNIFICADO PARA DISPLAY DE VEHÍCULOS
 * 
 * Este hook combina:
 * - Traducciones de CLAVES (labels) desde useVehicleTranslations
 * - Traducciones de VALORES (data) desde vehicleValueMappings
 * 
 * USO RECOMENDADO:
 * En lugar de usar múltiples hooks, usa este para todo el display de vehículos
 */

import { useLanguage } from '../context/LanguageContext';
import useVehicleTranslations from './useVehicleTranslations';
import { translateValue, translateBoolean, ValueCategory } from '../utils/vehicleValueMappings';

export const useVehicleDisplay = () => {
  const { currentLanguage } = useLanguage();
  const { vehicleLabels, getTranslation } = useVehicleTranslations();

  /**
   * Traduce una clave (label) como "Marca", "Modelo"
   */
  const translateLabel = (key: string): string => {
    return getTranslation(key);
  };

  /**
   * Traduce un valor de BD como "cotxe", "benzina"
   */
  const translateDataValue = (
    value: string, 
    category: ValueCategory
  ): string => {
    return translateValue(value, category, currentLanguage);
  };

  /**
   * Traduce valores booleanos
   */
  const translateBooleanValue = (value: string | boolean): string => {
    return translateBoolean(value, currentLanguage);
  };

  /**
   * Traduce valores específicos como "Accepta", países, etc.
   */
  const translateSpecificValue = (value: string): string => {
    return translateDataValue(value, 'specific');
  };

  /**
   * FUNCIONES DE CONVENIENCIA PARA CAMPOS ESPECÍFICOS
   */

  // Tipo de vehículo
  const getVehicleTypeDisplay = (tipusVehicle: string): string => {
    return translateDataValue(tipusVehicle, 'vehicleType');
  };

  // Combustible
  const getFuelTypeDisplay = (tipusCombustible: string): string => {
    return translateDataValue(tipusCombustible, 'fuelType');
  };

  // Transmisión
  const getTransmissionDisplay = (tipusCanvi: string): string => {
    return translateDataValue(tipusCanvi, 'transmission');
  };

  // Estado del vehículo
  const getVehicleStateDisplay = (estatVehicle: string): string => {
    return translateDataValue(estatVehicle, 'vehicleState');
  };

  // Tracción
  const getTractionDisplay = (traccio: string): string => {
    return translateDataValue(traccio, 'traction');
  };

  // Carrocería
  const getBodyworkDisplay = (carroceria: string): string => {
    return translateDataValue(carroceria, 'bodywork');
  };

  // Color
  const getColorDisplay = (color: string): string => {
    return translateDataValue(color, 'color');
  };

  /**
   * FUNCIÓN HELPER PARA FORMATEAR INFORMACIÓN COMPLETA DEL VEHÍCULO
   */
  const getVehicleInfo = (vehicle: any) => {
    return {
      // Labels (claves)
      labels: {
        vehicleType: vehicleLabels.bodywork,
        fuelType: vehicleLabels.fuelType,
        transmission: vehicleLabels.transmission,
        year: vehicleLabels.year,
        power: vehicleLabels.power,
        doors: vehicleLabels.doors,
        seats: vehicleLabels.seats,
        color: vehicleLabels.color,
        condition: vehicleLabels.condition,
        // ... otros labels disponibles en vehicleLabels
      },
      
      // Values (datos traducidos)
      values: {
        vehicleType: getVehicleTypeDisplay(vehicle.tipusVehicle || ''),
        fuelType: getFuelTypeDisplay(vehicle.tipusCombustible || ''),
        transmission: getTransmissionDisplay(vehicle.tipusCanvi || ''),
        vehicleState: getVehicleStateDisplay(vehicle.estatVehicle || ''),
        traction: getTractionDisplay(vehicle.traccio || ''),
        bodywork: getBodyworkDisplay(vehicle.carroceria || vehicle.carrosseriaCotxe || ''),
        color: getColorDisplay(vehicle.colorExterior || vehicle.color || ''),
        smokerVehicle: translateBooleanValue(vehicle.vehicleFumador || false),
        airConditioning: translateBooleanValue(vehicle.climatitzacio || false),
        // ... otros campos que necesiten traducción
      }
    };
  };

  return {
    // Funciones principales
    translateLabel,
    translateDataValue,
    translateBooleanValue,
    translateSpecificValue,
    
    // Funciones de conveniencia
    getVehicleTypeDisplay,
    getFuelTypeDisplay,
    getTransmissionDisplay,
    getVehicleStateDisplay,
    getTractionDisplay,
    getBodyworkDisplay,
    getColorDisplay,
    
    // Helper completo
    getVehicleInfo,
    
    // Re-exportar vehicleLabels para compatibilidad
    vehicleLabels,
    
    // Idioma actual
    currentLanguage
  };
};

export default useVehicleDisplay;