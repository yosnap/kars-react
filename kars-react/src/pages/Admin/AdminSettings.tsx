import React, { useState } from 'react';
import { MessageCircle, Save, Phone, User, MessageSquare } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';

interface WhatsAppConfig {
  number: string;
  contactName: string;
  messageTemplate: string;
  enabled: boolean;
}

export default function AdminSettings() {
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>({
    number: '34604128777',
    contactName: 'Elisabeth',
    messageTemplate: `Hola {contactName}, me interesa el producto "{productName}" cuyo enlace es: {productUrl}.
¿Me podrías dar información para realizar la compra?`,
    enabled: true
  });

  const [loading, setLoading] = useState(false);

  const handleWhatsAppChange = (field: keyof WhatsAppConfig, value: string | boolean) => {
    setWhatsAppConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveWhatsApp = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada API para guardar configuración
      // await axiosAdmin.post('/settings/whatsapp', whatsAppConfig);
      
      // Simulación temporal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configuración de WhatsApp guardada correctamente');
      console.log('WhatsApp config saved:', whatsAppConfig);
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona la configuración general del sistema
          </p>
        </div>
      </div>

      {/* WhatsApp Configuration Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Configuración de WhatsApp
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configura el botón flotante de WhatsApp para el frontend
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Habilitar WhatsApp
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mostrar el botón flotante de WhatsApp en el frontend
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={whatsAppConfig.enabled}
                onChange={(e) => handleWhatsAppChange('enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
              <Phone className="w-4 h-4" />
              Número de WhatsApp
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-sm bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs font-medium">
                  🇦🇩
                </span>
              </div>
              <input
                type="text"
                value={whatsAppConfig.number}
                onChange={(e) => handleWhatsAppChange('number', e.target.value)}
                placeholder="34604128777"
                className="w-full pl-16 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Número de WhatsApp con código de país (sin +)
            </p>
          </div>

          {/* Contact Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
              <User className="w-4 h-4" />
              Nombre de contacto
            </label>
            <input
              type="text"
              value={whatsAppConfig.contactName}
              onChange={(e) => handleWhatsAppChange('contactName', e.target.value)}
              placeholder="Elisabeth"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Nombre de la persona de contacto que aparecerá en el mensaje
            </p>
          </div>

          {/* Message Template */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
              <MessageSquare className="w-4 h-4" />
              Plantilla del mensaje
            </label>
            <textarea
              value={whatsAppConfig.messageTemplate}
              onChange={(e) => handleWhatsAppChange('messageTemplate', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Escribe tu plantilla de mensaje aquí..."
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p className="mb-1">Variables disponibles:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {'{contactName}'}
                </span>
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {'{productName}'}
                </span>
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {'{productUrl}'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSaveWhatsApp}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>

      {/* Future sections can be added here */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Más configuraciones próximamente
          </h3>
          <p className="text-sm">
            Aquí aparecerán más opciones de configuración del sistema
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}