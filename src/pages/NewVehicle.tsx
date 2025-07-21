import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import MultiStepVehicleForm from '../components/VehicleForm/MultiStepVehicleForm';
import { axiosAdmin } from '../api/axiosClient';

const NewVehicle = () => {
  const navigate = useNavigate();

  const handleSaveVehicle = async (vehicleData: any) => {
    try {
      // Convert form data to API format
      const apiData = {
        // Basic info
        slug: generateSlug(vehicleData.titolAnunci),
        titolAnunci: vehicleData.titolAnunci,
        tipusVehicle: vehicleData.tipusVehicle,
        preu: vehicleData.preu,
        quilometratge: vehicleData.quilometratge || '0',
        any: vehicleData.any,
        
        // Brand and model based on vehicle type
        marcaCotxe: vehicleData.marcaCotxe || null,
        marcaMoto: vehicleData.marcaMoto || null,
        marquesAutocaravana: vehicleData.marquesAutocaravana || null,
        modelsCotxe: vehicleData.modelsCotxe || null,
        modelsMoto: vehicleData.modelsMoto || null,
        modelsAutocaravana: vehicleData.modelsAutocaravana || null,
        versio: vehicleData.versio,
        
        // Technical specs
        tipusCombustible: vehicleData.tipusCombustible,
        tipusCanvi: vehicleData.tipusCanvi,
        tipusPropulsor: vehicleData.tipusPropulsor,
        potenciaCv: vehicleData.potenciaCv,
        potenciaKw: vehicleData.potenciaKw,
        cilindrada: vehicleData.cilindrada,
        colorVehicle: vehicleData.colorVehicle,
        portesCotxe: vehicleData.portesCotxe,
        placesCotxe: vehicleData.placesCotxe,
        estatVehicle: vehicleData.estatVehicle,
        
        // Multilingual descriptions
        descripcioAnunci: vehicleData.descripcioAnunciCA, // Legacy field
        descripcioAnunciCA: vehicleData.descripcioAnunciCA,
        descripcioAnunciEN: vehicleData.descripcioAnunciEN,
        descripcioAnunciFR: vehicleData.descripcioAnunciFR,
        descripcioAnunciES: vehicleData.descripcioAnunciES,
        
        // Images and status
        imatgeDestacadaUrl: vehicleData.imatgeDestacadaUrl,
        galeriaVehicleUrls: vehicleData.galeriaVehicleUrls || [],
        anunciActiu: vehicleData.anunciActiu,
        anunciDestacat: vehicleData.anunciDestacat,
        venut: vehicleData.venut,
        
        // Kars.ad specific fields
        userId: '113', // info@kars.ad user ID
        needsSync: true, // New vehicles need to be synced to Motoraldia
        dataCreacio: new Date().toISOString()
      };

      console.log('Saving vehicle data:', apiData);

      const response = await axiosAdmin.post('/vehicles', apiData);
      
      toast.success('Vehicle creat correctament!');
      
      // Navigate to vehicle detail or list
      if (response.data?.slug) {
        navigate(`/vehicle/${response.data.slug}`);
      } else {
        navigate('/');
      }
      
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast.error(
        error.response?.data?.message || 
        'Error al guardar el vehicle. Torna-ho a intentar.'
      );
      throw error; // Re-throw to keep loading state in form
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // Generate URL-friendly slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <PageBreadcrumbs
          items={[
            { label: { es: "Nuevo vehículo", ca: "Vehicle nou", en: "New vehicle", fr: "Nouveau véhicule" }, href: "/add-vehicle" }
          ]}
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Afegir Nou Vehicle
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Completa els passos per afegir un nou vehicle a Kars.ad
          </p>
        </div>

        <MultiStepVehicleForm 
          onSave={handleSaveVehicle}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default NewVehicle; 