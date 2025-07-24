import React from 'react';
import { Switch } from '../../ui/switch';
import SearchableSelect from '../../ui/SearchableSelect';

interface CommercialInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const CommercialInfoStep: React.FC<CommercialInfoStepProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Informació comercial
      </h3>
      
      {/* Sección de Precios */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          💰 Informació de Preus
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Precio Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preu Principal *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.preu || ''}
                onChange={(e) => updateFormData({ preu: e.target.value })}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="25000"
                required
              />
              <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">€</span>
            </div>
          </div>

          {/* Precio Antiguo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preu Antic
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.preuAntic || ''}
                onChange={(e) => updateFormData({ preuAntic: e.target.value })}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="30000"
              />
              <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">€</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Preu original per mostrar descompte</p>
          </div>

          {/* Número de Propietarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de Propietaris
            </label>
            <SearchableSelect
              options={[
                { value: '1', label: '1 propietari' },
                { value: '2', label: '2 propietaris' },
                { value: '3', label: '3 propietaris' },
                { value: '4', label: '4 propietaris' },
                { value: '5+', label: '5 o més propietaris' }
              ]}
              value={formData.nombrePropietaris || ''}
              onValueChange={(value) => updateFormData({ nombrePropietaris: value })}
              placeholder="Selecciona propietaris..."
              allowClear={true}
              showSearch={false}
              emptyMessage="No s'han trobat opcions"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Precio Mensual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preu Mensual (Leasing/Renting)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.preuMensual || ''}
                onChange={(e) => updateFormData({ preuMensual: e.target.value })}
                className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="450"
              />
              <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">€/mes</span>
            </div>
          </div>

          {/* Precio Diario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preu Diari (Lloguer)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.preuDiari || ''}
                onChange={(e) => updateFormData({ preuDiari: e.target.value })}
                className="w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="50"
              />
              <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">€/dia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Condiciones del Vehículo */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          🔧 Condicions del Vehicle
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Accidentat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Accidentat
            </label>
            <SearchableSelect
              options={[
                { value: 'false', label: 'No accidentat' },
                { value: 'true', label: 'Accidentat' }
              ]}
              value={formData.vehicleAccidentat || ''}
              onValueChange={(value) => updateFormData({ vehicleAccidentat: value })}
              placeholder="Selecciona estat..."
              allowClear={true}
              showSearch={false}
              emptyMessage="No s'han trobat opcions"
            />
          </div>

          {/* Llibre de Manteniment */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Llibre de Manteniment
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                El vehicle té llibre de manteniment oficial
              </p>
            </div>
            <div className="scale-75">
              <Switch
                checked={formData.llibreManteniment === true}
                onCheckedChange={(checked) => updateFormData({ llibreManteniment: checked })}
                className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          </div>

          {/* Revisions Oficials */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Revisions Oficials
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Revisions oficials al dia
              </p>
            </div>
            <div className="scale-75">
              <Switch
                checked={formData.revisionsOficials === true}
                onCheckedChange={(checked) => updateFormData({ revisionsOficials: checked })}
                className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          </div>

          {/* Días de Caducidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dies de Caducitat de l'Anunci
            </label>
            <SearchableSelect
              options={[
                { value: '30', label: '30 dies' },
                { value: '60', label: '60 dies' },
                { value: '90', label: '90 dies' },
                { value: '180', label: '180 dies' },
                { value: '365', label: '365 dies (1 any)' }
              ]}
              value={formData.diesCaducitat || '365'}
              onValueChange={(value) => updateFormData({ diesCaducitat: value })}
              placeholder="Selecciona durada..."
              allowClear={false}
              showSearch={false}
              emptyMessage="No s'han trobat opcions"
            />
          </div>
        </div>
      </div>

      {/* Sección de Información Comercial */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          🏪 Informació Comercial
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Warranty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Garantia
            </label>
            <SearchableSelect
              options={[
                { value: 'true', label: 'Amb garantia' },
                { value: 'false', label: 'Sense garantia' }
              ]}
              value={formData.garantia || ''}
              onValueChange={(value) => updateFormData({ garantia: value })}
              placeholder="Selecciona garantia..."
              allowClear={true}
              showSearch={false}
              emptyMessage="No s'han trobat opcions"
            />
          </div>

          {/* IVA/Impostos Deduïbles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Impostos Deduïbles
            </label>
            <SearchableSelect
              options={[
                { value: 'true', label: 'Impostos deduïbles' },
                { value: 'false', label: 'Impostos no deduïbles' }
              ]}
              value={formData.impostosDeduibles || ''}
              onValueChange={(value) => updateFormData({ impostosDeduibles: value })}
              placeholder="Selecciona impostos..."
              allowClear={true}
              showSearch={false}
              emptyMessage="No s'han trobat opcions"
            />
          </div>

          {/* Vehicle a Canvi */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle a Canvi
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Accepta vehicle a canvi
              </p>
            </div>
            <div className="scale-75">
              <Switch
                checked={formData.vehicleACanvi === true}
                onCheckedChange={(checked) => updateFormData({ vehicleACanvi: checked })}
                className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialInfoStep;