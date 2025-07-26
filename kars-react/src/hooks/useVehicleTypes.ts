import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface TypeOption {
  value: string;
  label: string;
  color?: string;
  translations?: {
    catalan: string;
    spanish: string;
    french: string;
    english: string;
  };
}

interface TypeResponse {
  success: boolean;
  data: TypeOption[];
}

export const useVehicleTypes = () => {
  const [emissions, setEmissions] = useState<TypeOption[]>([]);
  const [upholsteryTypes, setUpholsteryTypes] = useState<TypeOption[]>([]);
  const [upholsteryColors, setUpholsteryColors] = useState<TypeOption[]>([]);
  const [exteriorColors, setExteriorColors] = useState<TypeOption[]>([]);
  const [batteryTypes, setBatteryTypes] = useState<TypeOption[]>([]);
  const [chargingSpeeds, setChargingSpeeds] = useState<TypeOption[]>([]);
  const [fuelTypes, setFuelTypes] = useState<TypeOption[]>([]);
  const [propulsionTypes, setPropulsionTypes] = useState<TypeOption[]>([]);
  const [transmissionTypes, setTransmissionTypes] = useState<TypeOption[]>([]);
  const [vehicleStates, setVehicleStates] = useState<TypeOption[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoints = [
        'emissions',
        'upholstery',
        'upholstery-colors',
        'exterior-colors',
        'battery',
        'charging-speed',
        'fuel',
        'propulsion',
        'transmission',
        'vehicle-state'
      ];

      const requests = endpoints.map(endpoint => 
        axios.get<TypeResponse>(`${API_BASE_URL}/types/${endpoint}`)
      );

      const responses = await Promise.all(requests);

      // Procesar las respuestas
      const [
        emissionsRes,
        upholsteryTypesRes,
        upholsteryColorsRes,
        exteriorColorsRes,
        batteryTypesRes,
        chargingSpeedsRes,
        fuelTypesRes,
        propulsionTypesRes,
        transmissionTypesRes,
        vehicleStatesRes
      ] = responses;

      if (emissionsRes.data.success) setEmissions(emissionsRes.data.data);
      if (upholsteryTypesRes.data.success) setUpholsteryTypes(upholsteryTypesRes.data.data);
      if (upholsteryColorsRes.data.success) setUpholsteryColors(upholsteryColorsRes.data.data);
      if (exteriorColorsRes.data.success) setExteriorColors(exteriorColorsRes.data.data);
      if (batteryTypesRes.data.success) setBatteryTypes(batteryTypesRes.data.data);
      if (chargingSpeedsRes.data.success) setChargingSpeeds(chargingSpeedsRes.data.data);
      if (fuelTypesRes.data.success) setFuelTypes(fuelTypesRes.data.data);
      if (propulsionTypesRes.data.success) setPropulsionTypes(propulsionTypesRes.data.data);
      if (transmissionTypesRes.data.success) setTransmissionTypes(transmissionTypesRes.data.data);
      if (vehicleStatesRes.data.success) setVehicleStates(vehicleStatesRes.data.data);

    } catch (err) {
      console.error('Error fetching vehicle types:', err);
      setError('Error loading vehicle types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  return {
    emissions,
    upholsteryTypes,
    upholsteryColors,
    exteriorColors,
    batteryTypes,
    chargingSpeeds,
    fuelTypes,
    propulsionTypes,
    transmissionTypes,
    vehicleStates,
    loading,
    error,
    refetch: fetchTypes
  };
};