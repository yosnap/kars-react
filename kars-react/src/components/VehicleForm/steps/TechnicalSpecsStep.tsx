import React, { useState, useEffect } from 'react';
import { axiosAdmin } from '../../../api/axiosClient';
import SearchableSelect from '../../ui/SearchableSelect';

interface TechnicalSpecsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const TechnicalSpecsStep: React.FC<TechnicalSpecsStepProps> = ({ formData, updateFormData }) => {
  const [exteriorColors, setExteriorColors] = useState<Array<{value: string, label: string, color?: string}>>([]);
  const [upholsteryTypes, setUpholsteryTypes] = useState<Array<{value: string, label: string}>>([]);
  const [upholsteryColors, setUpholsteryColors] = useState<Array<{value: string, label: string, color?: string}>>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar colores exteriores
        const colorsResponse = await axiosAdmin.get('/exterior-colors');
        if (colorsResponse.data?.data) {
          setExteriorColors(colorsResponse.data.data.map((item: any) => ({
            value: item.slug,
            label: item.name,
            color: getColorHex(item.slug)
          })));
        }

        // Cargar tipos de tapicería
        const upholsteryTypesResponse = await axiosAdmin.get('/upholstery-types');
        if (upholsteryTypesResponse.data?.data) {
          setUpholsteryTypes(upholsteryTypesResponse.data.data.map((item: any) => ({
            value: item.slug,
            label: item.name
          })));
        }

        // Cargar colores de tapicería
        const upholsteryColorsResponse = await axiosAdmin.get('/upholstery-colors');
        if (upholsteryColorsResponse.data?.data) {
          setUpholsteryColors(upholsteryColorsResponse.data.data.map((item: any) => ({
            value: item.slug,
            label: item.name,
            color: getUpholsteryColorHex(item.slug)
          })));
        }

      } catch (error) {
        console.error('Error cargando datos técnicos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Mapeo de colores exteriores a códigos hex
  const getColorHex = (colorSlug: string): string => {
    const colorMap: Record<string, string> = {
      // Colores básicos
      'blanc': '#FFFFFF',
      'negre': '#000000',
      'gris': '#808080',
      'antracita': '#36454F',
      
      // Colores vivos
      'vermell': '#DC2626',
      'blau': '#2563EB',
      'verd': '#16A34A',
      'groc': '#EAB308',
      'taronja': '#EA580C',
      'rosa': '#EC4899',
      'lila': '#A855F7',
      
      // Colores especiales
      'daurat': '#D97706',
      'bordeus': '#991B1B',
      'granat': '#7F1D1D',
      
      // Colores naturales
      'marró': '#92400E',
      'beige': '#FEF3C7',
      'camel': '#D2B48C',
      
      // Colores especiales
      'bicolor': 'linear-gradient(45deg, #000000 50%, #FFFFFF 50%)',
      'altres-exterior': '#9CA3AF'
    };
    return colorMap[colorSlug] || '#9CA3AF';
  };

  // Mapeo de colores de tapicería a códigos hex
  const getUpholsteryColorHex = (colorSlug: string): string => {
    const colorMap: Record<string, string> = {
      // Colores básicos
      'tapisseria-negre': '#1F2937',
      'tapisseria-blanc': '#F9FAFB',
      'tapisseria-gris': '#6B7280',
      'tapisseria-antracita': '#374151',
      
      // Colores naturales
      'tapisseria-beige': '#F3E8D0',
      'tapisseria-camel': '#C19A6B',
      'tapisseria-marro': '#8B4513',
      
      // Colores vivos
      'tapisseria-blau': '#1E40AF',
      'tapisseria-vermell': '#DC2626',
      'tapisseria-verd': '#059669',
      'tapisseria-groc': '#D97706',
      'tapisseria-taronja': '#EA580C',
      'tapisseria-lila': '#7C3AED',
      
      // Colores especiales
      'tapisseria-bordeus': '#7F1D1D',
      'tapisseria-granat': '#991B1B',
      
      // Especiales
      'tapisseria-bicolor': 'linear-gradient(45deg, #1F2937 50%, #F9FAFB 50%)',
      'altres-tapisseria': '#9CA3AF'
    };
    return colorMap[colorSlug] || '#9CA3AF';
  };


  // Opciones de emisiones (pocas opciones, usamos botones)
  const emissionOptions = [
    { value: 'euro1', label: 'Euro1' },
    { value: 'euro2', label: 'Euro2' },
    { value: 'euro3', label: 'Euro3' },
    { value: 'euro4', label: 'Euro4' },
    { value: 'euro5', label: 'Euro5' },
    { value: 'euro6', label: 'Euro6' }
  ];

  // Componente para botones de selección numérica
  const NumberButtons: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    label: string;
  }> = ({ value, onChange, options, label }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(value === option.value ? '' : option.value)}
            className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
              value === option.value
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Componente para botones de emisiones
  const EmissionButtons: React.FC<{
    value: string;
    onChange: (value: string) => void;
  }> = ({ value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Emissions Vehicle
      </label>
      <div className="flex flex-wrap gap-2">
        {emissionOptions.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(value === option.value ? '' : option.value)}
            className={`px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
              value === option.value
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Componente para selección de colores con visualización
  const ColorSelector: React.FC<{
    value: string;
    onChange: (value: string) => void;
  }> = ({ value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Color Exterior
      </label>
      <div className="grid grid-cols-5 gap-3">
        {exteriorColors.map(color => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(value === color.value ? '' : color.value)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              value === color.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-300 mb-2"
              style={{ 
                background: color.color?.includes('gradient') ? color.color : undefined,
                backgroundColor: !color.color?.includes('gradient') ? color.color : undefined 
              }}
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
              {color.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Especificacions tècniques
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Carregant dades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Especificacions tècniques
      </h3>
      
      <div className="space-y-8">

        {/* Color - Visual Color Selector */}
        <ColorSelector
          value={formData.colorVehicle || ''}
          onChange={(value) => updateFormData({ colorVehicle: value })}
        />

        {/* Emissions - Buttons */}
        <EmissionButtons
          value={formData.emissionsVehicle || ''}
          onChange={(value) => updateFormData({ emissionsVehicle: value })}
        />

        {/* Numeric Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Power (CV) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Potència (CV)
            </label>
            <input
              type="number"
              min="0"
              value={formData.potenciaCv || ''}
              onChange={(e) => updateFormData({ potenciaCv: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="150"
            />
          </div>

          {/* Power (KW) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Potència (KW)
            </label>
            <input
              type="number"
              min="0"
              value={formData.potenciaKw || ''}
              onChange={(e) => updateFormData({ potenciaKw: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="110"
            />
          </div>

          {/* Engine Displacement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cilindrada (cc)
            </label>
            <input
              type="number"
              min="0"
              value={formData.cilindrada || ''}
              onChange={(e) => updateFormData({ cilindrada: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="1995"
            />
          </div>

          {/* CO2 Emissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Emissions CO2 (g/km)
            </label>
            <input
              type="number"
              min="0"
              value={formData.emissionsCo2 || ''}
              onChange={(e) => updateFormData({ emissionsCo2: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="120"
            />
          </div>

          {/* Fuel Consumption Urban */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Consum Urbà (l/100km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.consumUrba || ''}
              onChange={(e) => updateFormData({ consumUrba: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="6.5"
            />
          </div>

          {/* Fuel Consumption Highway */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Consum Carretera (l/100km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.consumCarretera || ''}
              onChange={(e) => updateFormData({ consumCarretera: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="4.2"
            />
          </div>

          {/* Fuel Consumption Mixed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Consum Mixt (l/100km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.consumMixt || ''}
              onChange={(e) => updateFormData({ consumMixt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="5.1"
            />
          </div>
        </div>

        {/* Car-specific fields */}
        {formData.tipusVehicle === 'cotxe' && (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Especificacions específiques per a cotxes
            </h4>
            
            {/* Doors - Number Buttons */}
            <NumberButtons
              value={formData.portesCotxe || ''}
              onChange={(value) => updateFormData({ portesCotxe: value })}
              options={[
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' }
              ]}
              label="Nombre de Portes"
            />

            {/* Seats - Number Buttons */}
            <NumberButtons
              value={formData.placesCotxe || ''}
              onChange={(value) => updateFormData({ placesCotxe: value })}
              options={[
                { value: '2', label: '2' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '7', label: '7' },
                { value: '8', label: '8' },
                { value: '9', label: '9' }
              ]}
              label="Nombre de Places"
            />

            {/* Upholstery Type - Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tipus Tapisseria
              </label>
              <div className="flex flex-wrap gap-3">
                {upholsteryTypes.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateFormData({ tipusTapisseria: formData.tipusTapisseria === option.value ? '' : option.value })}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      formData.tipusTapisseria === option.value
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upholstery Color - Visual Color Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Color Tapisseria
              </label>
              <div className="grid grid-cols-5 gap-3">
                {upholsteryColors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateFormData({ colorTapisseria: formData.colorTapisseria === color.value ? '' : color.value })}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      formData.colorTapisseria === color.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 mb-2"
                      style={{ 
                        background: color.color?.includes('gradient') ? color.color : undefined,
                        backgroundColor: !color.color?.includes('gradient') ? color.color : undefined 
                      }}
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                      {color.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campos adicionales de coches */}
            <div className="space-y-6 mt-8">
              <h5 className="text-md font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                Equipament i característiques addicionals
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Número de Maleteros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de Maleters
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.numeroMaleters || ''}
                    onChange={(e) => updateFormData({ numeroMaleters: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="2"
                  />
                </div>

                {/* Roda de Recanvi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Roda de Recanvi
                  </label>
                  <SearchableSelect
                    options={[
                      { value: 'roda_substitucio', label: 'Roda Substitució' },
                      { value: 'r_kit_reparacio', label: 'Kit reparació' }
                    ]}
                    value={formData.rodaRecanvi || ''}
                    onValueChange={(value) => updateFormData({ rodaRecanvi: value })}
                    placeholder="Selecciona roda de recanvi..."
                    allowClear={true}
                    showSearch={false}
                    emptyMessage="No s'han trobat opcions"
                  />
                </div>

                {/* Capacitat Total */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacitat Total (L)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.capacitatTotal || ''}
                    onChange={(e) => updateFormData({ capacitatTotal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="450"
                  />
                </div>
              </div>

              {/* Campos de rendimiento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Velocitat Màxima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Velocitat Màxima (km/h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.velocitatMaxima || ''}
                    onChange={(e) => updateFormData({ velocitatMaxima: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="200"
                  />
                </div>

                {/* Acceleració 0-100 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Acceleració 0-100 (km/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.acceleracio0100 || ''}
                    onChange={(e) => updateFormData({ acceleracio0100: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="8.5"
                  />
                </div>
              </div>

              {/* Campos específicos para vehículos eléctricos/híbridos */}
              {(formData.tipusPropulsor === 'electric' || 
                formData.tipusPropulsor === 'hibrid' || 
                formData.tipusPropulsor === 'hibrid-endollable') && (
                <div className="space-y-6 mt-8">
                  <h5 className="text-md font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    🔋 Especificacions de Vehicle Elèctric
                  </h5>
                  
                  {/* Campos de autonomía */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Autonomia mitjana WLTP (km)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.autonomiaWltp || ''}
                        onChange={(e) => updateFormData({ autonomiaWltp: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Autonomia urbana WLTP (km)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.autonomiaUrbanaWltp || ''}
                        onChange={(e) => updateFormData({ autonomiaUrbanaWltp: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Autonomia extraurbana WLTP (km)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.autonomiaExtraurbanaWltp || ''}
                        onChange={(e) => updateFormData({ autonomiaExtraurbanaWltp: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="450"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Autonomia 100% elèctrica WLTP (km)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.autonomiaElectrica || ''}
                        onChange={(e) => updateFormData({ autonomiaElectrica: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="80"
                      />
                    </div>
                  </div>

                  {/* Campos de batería y recarga */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bateria
                      </label>
                      <SearchableSelect
                        options={[
                          { value: 'ions-liti', label: 'Ions de Liti (Li-on)' },
                          { value: 'niquel-cadmi', label: 'Níquel / Cadmi (NiCd)' },
                          { value: 'fosfat-ferro', label: 'Fosfat de ferro i liti (LifePO4)' },
                          { value: 'polimer-ions-liti', label: 'Polímer ions de liti (Li-Po)' },
                          { value: 'sodi-ion', label: 'Sodi-ion (Na-ion)' }
                        ]}
                        value={formData.bateria || ''}
                        onValueChange={(value) => updateFormData({ bateria: value })}
                        placeholder="Selecciona tipus de bateria..."
                        allowClear={true}
                        showSearch={false}
                        emptyMessage="No s'han trobat opcions"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Velocitat Recarrega
                      </label>
                      <SearchableSelect
                        options={[
                          { value: 'v_lenta', label: 'Lenta' },
                          { value: 'v_mitjana', label: 'Mitjana' },
                          { value: 'v_rapida', label: 'Ràpida' },
                          { value: 'v_super_rapida', label: 'Super ràpida' }
                        ]}
                        value={formData.velocitatRecarrega || ''}
                        onValueChange={(value) => updateFormData({ velocitatRecarrega: value })}
                        placeholder="Selecciona velocitat de recarrega..."
                        allowClear={true}
                        showSearch={false}
                        emptyMessage="No s'han trobat opcions"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cables Recarrega
                      </label>
                      <SearchableSelect
                        options={[
                          { value: 'mennekes', label: 'Mennekes' },
                          { value: 'css-combo', label: 'CSS Combo' },
                          { value: 'cables-schuko', label: 'Schuko' },
                          { value: 'cables-supercharger', label: 'Súpercharger' },
                          { value: 'cables-chademo', label: 'CHAdeMo' },
                          { value: 'cables-sae-j1772-tipo1', label: 'SAE J1772 Tipo1' }
                        ]}
                        value={formData.cablesRecarrega || ''}
                        onValueChange={(value) => updateFormData({ cablesRecarrega: value })}
                        placeholder="Selecciona cables de recarrega..."
                        allowClear={true}
                        showSearch={false}
                        emptyMessage="No s'han trobat opcions"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Connectors
                      </label>
                      <SearchableSelect
                        options={[
                          { value: 'connector-shuko', label: 'Connector Shuko' },
                          { value: 'connector-mennekes', label: 'Connector Mennekes (Tipo 2)' },
                          { value: 'connector-combinado-css', label: 'Connector combinado CSS (Combo 2)' },
                          { value: 'connector-supercharger', label: 'Connector Supercharger' },
                          { value: 'connector-chademo', label: 'Connector CHAdeMo' },
                          { value: 'conector-sae-j1772', label: 'Connector SAE J1772 (Tipo 1)' }
                        ]}
                        value={formData.connectors || ''}
                        onValueChange={(value) => updateFormData({ connectors: value })}
                        placeholder="Selecciona connectors..."
                        allowClear={true}
                        showSearch={false}
                        emptyMessage="No s'han trobat opcions"
                      />
                    </div>
                  </div>

                  {/* Tiempos de recarga y capacidad bateria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Capacitat Bateria (kWh)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.capacitatBateria || ''}
                        onChange={(e) => updateFormData({ capacitatBateria: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="75"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Temps Recarrega Total (h)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.tempsRecarregaTotal || ''}
                        onChange={(e) => updateFormData({ tempsRecarregaTotal: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="8.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Temps Recarrega fins 80% (min)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.tempsRecarregaFins80 || ''}
                        onChange={(e) => updateFormData({ tempsRecarregaFins80: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalSpecsStep;