import React from 'react';

interface TechnicalSpecsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const TechnicalSpecsStep: React.FC<TechnicalSpecsStepProps> = ({ formData, updateFormData }) => {
  const fuelTypes = [
    { value: 'benzina', label: 'Benzina' },
    { value: 'diesel', label: 'Dièsel' },
    { value: 'electric', label: 'Elèctric' },
    { value: 'hibrid', label: 'Híbrid' },
    { value: 'hibrid-endollable', label: 'Híbrid Endollable' },
    { value: 'gnc', label: 'GNC' },
    { value: 'glp', label: 'GLP' }
  ];

  const transmissionTypes = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automàtic' },
    { value: 'auto-sequencial', label: 'Auto-Seqüencial' },
    { value: 'cvt', label: 'CVT' }
  ];

  const vehicleStates = [
    { value: 'nou', label: 'Nou' },
    { value: 'ocasio', label: 'Ocasió' },
    { value: 'km0-gerencia', label: 'Km0 / Gerència' },
    { value: 'seminou', label: 'Seminous' }
  ];

  const colors = [
    { value: 'blanc', label: 'Blanc' },
    { value: 'negre', label: 'Negre' },
    { value: 'gris', label: 'Gris' },
    { value: 'plata', label: 'Plata' },
    { value: 'vermell', label: 'Vermell' },
    { value: 'blau', label: 'Blau' },
    { value: 'verd', label: 'Verd' },
    { value: 'groc', label: 'Groc' },
    { value: 'taronja', label: 'Taronja' },
    { value: 'marron', label: 'Marró' },
    { value: 'bicolor', label: 'Bicolor' }
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Especificacions tècniques
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipus de Combustible
          </label>
          <select
            value={formData.tipusCombustible || ''}
            onChange={(e) => updateFormData({ tipusCombustible: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona combustible</option>
            {fuelTypes.map(fuel => (
              <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipus de Canvi
          </label>
          <select
            value={formData.tipusCanvi || ''}
            onChange={(e) => updateFormData({ tipusCanvi: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona canvi</option>
            {transmissionTypes.map(trans => (
              <option key={trans.value} value={trans.value}>{trans.label}</option>
            ))}
          </select>
        </div>

        {/* Vehicle State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estat del Vehicle
          </label>
          <select
            value={formData.estatVehicle || ''}
            onChange={(e) => updateFormData({ estatVehicle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona estat</option>
            {vehicleStates.map(state => (
              <option key={state.value} value={state.value}>{state.label}</option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <select
            value={formData.colorVehicle || ''}
            onChange={(e) => updateFormData({ colorVehicle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona color</option>
            {colors.map(color => (
              <option key={color.value} value={color.value}>{color.label}</option>
            ))}
          </select>
        </div>

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

        {/* Emissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Emissions Vehicle
          </label>
          <select
            value={formData.emissionsVehicle || ''}
            onChange={(e) => updateFormData({ emissionsVehicle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona emissions</option>
            <option value="euro-6">Euro 6</option>
            <option value="euro-5">Euro 5</option>
            <option value="euro-4">Euro 4</option>
            <option value="euro-3">Euro 3</option>
            <option value="eco">ECO</option>
            <option value="zero">ZERO</option>
          </select>
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

        {/* Upholstery Type (only for cars) */}
        {formData.tipusVehicle === 'COTXE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipus Tapisseria
            </label>
            <select
              value={formData.tipusTapisseria || ''}
              onChange={(e) => updateFormData({ tipusTapisseria: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecciona tapisseria</option>
              <option value="tela">Tela</option>
              <option value="cuir">Cuir</option>
              <option value="semicuir">Semicuir</option>
              <option value="alcantara">Alcantara</option>
              <option value="vinil">Vinil</option>
            </select>
          </div>
        )}

        {/* Doors (only for cars) */}
        {formData.tipusVehicle === 'COTXE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de Portes
            </label>
            <select
              value={formData.portesCotxe || ''}
              onChange={(e) => updateFormData({ portesCotxe: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecciona portes</option>
              <option value="2">2 portes</option>
              <option value="3">3 portes</option>
              <option value="4">4 portes</option>
              <option value="5">5 portes</option>
            </select>
          </div>
        )}

        {/* Seats (only for cars) */}
        {formData.tipusVehicle === 'COTXE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de Places
            </label>
            <select
              value={formData.placesCotxe || ''}
              onChange={(e) => updateFormData({ placesCotxe: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecciona places</option>
              <option value="2">2 places</option>
              <option value="4">4 places</option>
              <option value="5">5 places</option>
              <option value="7">7 places</option>
              <option value="8">8 places</option>
              <option value="9">9 places</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalSpecsStep;