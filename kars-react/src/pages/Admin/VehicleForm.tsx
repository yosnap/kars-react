import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import MultiStepVehicleForm from '../../components/VehicleForm/MultiStepVehicleForm';
import { axiosAdmin } from '../../api/axiosClient';

interface VehicleFormProps {
  mode: 'create' | 'edit';
}

const VehicleForm: React.FC<VehicleFormProps> = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(mode === 'edit');
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadVehicle();
    }
  }, [mode, id]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const response = await axiosAdmin.get(`/vehicles/${id}`);
      setVehicleData(response.data);
    } catch (err) {
      console.error('Error loading vehicle:', err);
      setError('Error al carregar el vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (mode === 'create') {
        await axiosAdmin.post('/vehicles', formData);
        toast.success('🎉 Vehicle creat correctament!');
      } else {
        await axiosAdmin.put(`/vehicles/${id}`, formData);
        toast.success('✅ Vehicle actualitzat correctament!');
      }
      
      // Small delay to show the toast before navigation
      setTimeout(() => {
        navigate('/admin/kars-vehicles');
      }, 1000);
    } catch (err) {
      console.error('Error saving vehicle:', err);
      toast.error('❌ Error al guardar el vehicle. Si us plau, torna-ho a provar.');
      throw new Error('Error al guardar el vehicle');
    }
  };

  const handleCancel = () => {
    navigate('/admin/kars-vehicles');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate('/admin/kars-vehicles')}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Tornar al llistat
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Tornar al llistat
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Crear Nou Vehicle' : 'Editar Vehicle'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'create' 
              ? 'Completa el formulari per crear un nou vehicle' 
              : 'Modifica les dades del vehicle'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <MultiStepVehicleForm
            initialData={vehicleData}
            onSave={handleSave}
            onCancel={handleCancel}
            mode={mode}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default VehicleForm;