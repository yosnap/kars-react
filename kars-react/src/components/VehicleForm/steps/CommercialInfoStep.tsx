import React from 'react';

interface CommercialInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const CommercialInfoStep: React.FC<CommercialInfoStepProps> = ({ formData, updateFormData }) => {
  const warrantyOptions = [
    { value: '', label: 'Selecciona garantia' },
    { value: '6-mesos', label: '6 mesos' },
    { value: '12-mesos', label: '12 mesos' },
    { value: '24-mesos', label: '24 mesos' },
    { value: '36-mesos', label: '36 mesos' },
    { value: '48-mesos', label: '48 mesos' },
    { value: 'fabricant', label: 'Garantia del fabricant' },
    { value: 'sense-garantia', label: 'Sense garantia' }
  ];

  const originOptions = [
    { value: '', label: 'Selecciona origen' },
    { value: 'andorra', label: 'Andorra' },
    { value: 'espanya', label: 'Espanya' },
    { value: 'franca', label: 'França' },
    { value: 'alemanya', label: 'Alemanya' },
    { value: 'importacio', label: 'Importació' },
    { value: 'altres', label: 'Altres' }
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Informació comercial
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warranty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Garantia
          </label>
          <select
            value={formData.garantia || ''}
            onChange={(e) => updateFormData({ garantia: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {warrantyOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Origin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Origen del Vehicle
          </label>
          <select
            value={formData.origen || ''}
            onChange={(e) => updateFormData({ origen: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {originOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Accidental Vehicle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vehicle Accidentat
          </label>
          <select
            value={formData.vehicleAccidentat || ''}
            onChange={(e) => updateFormData({ vehicleAccidentat: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona estat</option>
            <option value="no">No accidentat</option>
            <option value="si-reparat">Accidentat però reparat</option>
            <option value="danys-menors">Danys menors</option>
            <option value="danys-importants">Danys importants</option>
          </select>
        </div>

        {/* VAT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            IVA
          </label>
          <select
            value={formData.iva || ''}
            onChange={(e) => updateFormData({ iva: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona IVA</option>
            <option value="si">Amb IVA</option>
            <option value="no">Sense IVA</option>
            <option value="deductible">IVA deductible</option>
          </select>
        </div>

        {/* Transfer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trasllat
          </label>
          <select
            value={formData.trasllat || ''}
            onChange={(e) => updateFormData({ trasllat: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona trasllat</option>
            <option value="inclòs">Trasllat inclòs</option>
            <option value="no-inclòs">Trasllat no inclòs</option>
            <option value="a-convenir">A convenir</option>
          </select>
        </div>

        {/* Financing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Finançament
          </label>
          <select
            value={formData.financament || ''}
            onChange={(e) => updateFormData({ financament: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona finançament</option>
            <option value="disponible">Finançament disponible</option>
            <option value="no-disponible">Finançament no disponible</option>
            <option value="a-consultar">A consultar</option>
          </select>
        </div>

        {/* Negotiable Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preu Negociable
          </label>
          <select
            value={formData.preuNegociable || ''}
            onChange={(e) => updateFormData({ preuNegociable: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona negociació</option>
            <option value="si">Preu negociable</option>
            <option value="no">Preu fix</option>
          </select>
        </div>

        {/* Exchange */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Accepta Canvi
          </label>
          <select
            value={formData.acceptaCanvi || ''}
            onChange={(e) => updateFormData({ acceptaCanvi: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona canvi</option>
            <option value="si">Accepta canvi</option>
            <option value="no">No accepta canvi</option>
            <option value="a-valorar">A valorar</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CommercialInfoStep;