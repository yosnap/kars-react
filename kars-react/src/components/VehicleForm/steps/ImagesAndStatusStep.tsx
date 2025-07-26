import React, { useState } from 'react';
import { Upload, Image, Link, X } from 'lucide-react';
import { axiosAdmin } from '../../../api/axiosClient';
import { toast } from 'sonner';
import SearchableSelect from '../../ui/SearchableSelect';
import { Switch } from '../../ui/switch';

interface ImagesAndStatusStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

// Helper function for featured image URL
const getFeaturedImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  console.log('🔍 getFeaturedImageUrl input:', path);
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('✅ Returning full URL:', path);
    return path;
  }
  
  // For relative paths that start with /media, serve from React dev server
  if (path.startsWith('/media')) {
    // In development, images are saved to public folder and served by Vite
    // Use relative path to work regardless of the domain/port
    console.log('🔗 Using relative path:', path);
    return path;
  }
  
  // For other relative paths, ensure proper format
  if (!path.startsWith('/')) {
    const formattedPath = `/${path}`;
    console.log('📝 Formatting path:', formattedPath);
    return formattedPath;
  }
  
  console.log('↩️ Returning path as-is:', path);
  return path;
};

// Helper function for gallery image URLs
const getGalleryImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // For relative paths that start with /media, serve from React dev server
  if (path.startsWith('/media')) {
    // In development, images are saved to public folder and served by Vite
    // Use relative path to work regardless of the domain/port
    return path;
  }
  
  // For other relative paths, ensure proper format
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
};

const ImagesAndStatusStep: React.FC<ImagesAndStatusStepProps> = ({ formData, updateFormData }) => {
  const [showUrlInput, setShowUrlInput] = useState({ featured: false, gallery: false });
  const [urlInputs, setUrlInputs] = useState({ featured: '', gallery: '' });
  const [uploading, setUploading] = useState(false);

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent, type: 'featured' | 'gallery') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await uploadImages(imageFiles, type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle file input
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'gallery') => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await uploadImages(imageFiles, type);
    }
  };

  // Upload images to server
  const uploadImages = async (files: File[], type: 'featured' | 'gallery') => {
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      if (type === 'gallery' && files.length > 1) {
        // Upload multiple files for gallery
        const formDataUpload = new FormData();
        files.forEach(file => {
          formDataUpload.append('images', file);
        });

        const response = await axiosAdmin.post('/upload/gallery', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          const urls = response.data.data.map((item: any) => item.url);
          uploadedUrls.push(...urls);
        }
      } else {
        // Upload single files one by one
        for (const file of files) {
          const fileFormData = new FormData();
          fileFormData.append('image', file);

          const response = await axiosAdmin.post('/upload/image', fileFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.success) {
            uploadedUrls.push(response.data.data.url);
          }
        }
      }

      // Update form data
      if (type === 'featured') {
        updateFormData({ imatgeDestacadaUrl: uploadedUrls[0] });
      } else {
        const currentUrls = formData.galeriaVehicleUrls || [];
        updateFormData({ 
          galeriaVehicleUrls: [...currentUrls, ...uploadedUrls] 
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.message?.includes('File too large')) {
        toast.error('Les imatges són massa grans. Mida màxima: 50MB');
      } else if (error.message?.includes('Authentication')) {
        toast.error('Error d\'autenticació. Torna a iniciar sessió');
      } else {
        toast.error('Error pujant les imatges. Si us plau, torna-ho a provar.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle URL input - Download and save to media folder
  const handleUrlSubmit = async (type: 'featured' | 'gallery') => {
    const url = urlInputs[type];
    if (!url) return;

    console.log(`🔄 Subiendo imagen por URL - Tipo: ${type}, URL: ${url}`);
    setUploading(true);
    try {
      // Download image from URL and save to media folder
      const response = await axiosAdmin.post('/upload/image-from-url', {
        url,
        width: 1200,
        height: 800,
        quality: 80
      });

      console.log(`✅ Respuesta upload ${type}:`, response.data);

      if (response.data.success) {
        const downloadedUrl = response.data.data.url;
        console.log(`📸 URL descargada para ${type}: ${downloadedUrl}`);
        
        if (type === 'featured') {
          console.log('🎯 Actualizando imagen destacada:', downloadedUrl);
          updateFormData({ imatgeDestacadaUrl: downloadedUrl });
        } else {
          const currentUrls = formData.galeriaVehicleUrls || [];
          console.log('🖼️ Actualizando galería:', [...currentUrls, downloadedUrl]);
          updateFormData({ 
            galeriaVehicleUrls: [...currentUrls, downloadedUrl] 
          });
        }

        setUrlInputs(prev => ({ ...prev, [type]: '' }));
        setShowUrlInput(prev => ({ ...prev, [type]: false }));
        toast.success(`✅ Imagen ${type === 'featured' ? 'destacada' : 'de galería'} agregada correctamente`);
      } else {
        console.error(`❌ Error en respuesta ${type}:`, response.data);
        toast.error('Error en la respuesta del servidor');
      }
    } catch (error: any) {
      console.error(`❌ URL download error (${type}):`, error);
      console.error(`❌ Error response (${type}):`, error.response?.data);
      const errorMessage = error.response?.data?.error || 'Error descarregant la imatge des de la URL. Comprova que la URL sigui vàlida.';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Remove image from gallery
  const removeFromGallery = (index: number) => {
    const currentUrls = formData.galeriaVehicleUrls || [];
    const newUrls = currentUrls.filter((_: string, i: number) => i !== index);
    updateFormData({ galeriaVehicleUrls: newUrls });
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Imatges i estat de l'anunci
      </h3>
      
      {/* Featured Image Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Imatge Principal
        </h4>
        
        <div
          onDrop={(e) => handleDrop(e, 'featured')}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            formData.imatgeDestacadaUrl
              ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-gray-50 dark:bg-gray-700/50'
          }`}
        >
          {formData.imatgeDestacadaUrl ? (
            <div className="relative">
              <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                ✅ Imagen destacada carregada
              </p>
              <img
                src={getFeaturedImageUrl(formData.imatgeDestacadaUrl)}
                alt="Imagen destacada"
                className="w-full h-48 object-cover rounded-lg border border-green-200"
                onError={(e) => {
                  console.error('❌ Error loading featured image:', formData.imatgeDestacadaUrl);
                  console.error('❌ Processed URL:', getFeaturedImageUrl(formData.imatgeDestacadaUrl));
                  console.error('❌ Current formData:', formData);
                  toast.error('Error carregant la imatge destacada');
                  (e.target as HTMLImageElement).style.border = '2px solid red';
                }}
                onLoad={() => {
                  // Image loaded successfully
                }}
              />
              <button
                type="button"
                onClick={() => updateFormData({ imatgeDestacadaUrl: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Arrossega una imatge aquí o
                </p>
                <div className="mt-2 flex gap-2 justify-center">
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Seleccionar arxiu
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'featured')}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(prev => ({ ...prev, featured: !prev.featured }))}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Link className="w-4 h-4" />
                    URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showUrlInput.featured && (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInputs.featured}
              onChange={(e) => setUrlInputs(prev => ({ ...prev, featured: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => handleUrlSubmit('featured')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Afegir
            </button>
          </div>
        )}
      </div>

      {/* Gallery Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Galeria d'Imatges
        </h4>
        
        <div
          onDrop={(e) => handleDrop(e, 'gallery')}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 bg-gray-50 dark:bg-gray-700/50 transition-colors"
        >
          <div className="text-center">
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arrossega múltiples imatges aquí o
              </p>
              <div className="mt-2 flex gap-2 justify-center">
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Seleccionar arxius
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e, 'gallery')}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(prev => ({ ...prev, gallery: !prev.gallery }))}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <Link className="w-4 h-4" />
                  URL
                </button>
              </div>
            </div>
          </div>
        </div>

        {showUrlInput.gallery && (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInputs.gallery}
              onChange={(e) => setUrlInputs(prev => ({ ...prev, gallery: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => handleUrlSubmit('gallery')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Afegir
            </button>
          </div>
        )}

        {/* Gallery Grid */}
        {formData.galeriaVehicleUrls && formData.galeriaVehicleUrls.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {formData.galeriaVehicleUrls.length} imagen{formData.galeriaVehicleUrls.length !== 1 ? 's' : ''} carregad{formData.galeriaVehicleUrls.length !== 1 ? 'es' : 'a'}:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.galeriaVehicleUrls.map((url: string, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={getGalleryImageUrl(url)}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-green-200"
                    onError={(e) => {
                      console.error('❌ Error loading gallery image:', url);
                      console.error('❌ Processed URL:', getGalleryImageUrl(url));
                      toast.error(`Error carregant la imatge ${index + 1} de la galeria`);
                      (e.target as HTMLImageElement).style.border = '2px solid red';
                    }}
                    onLoad={() => {
                      // Gallery image loaded successfully
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFromGallery(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Estat de l'anunci
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Anunci Actiu */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Anunci Actiu
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  L'anunci es mostrarà públicament
                </p>
              </div>
              <div className="scale-75">
                <Switch
                  checked={formData.anunciActiu}
                  onCheckedChange={(checked) => updateFormData({ anunciActiu: checked })}
                  className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </div>

            {/* Vehicle Venut */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vehicle Venut
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Marcar com a venut
                </p>
              </div>
              <div className="scale-75">
                <Switch
                  checked={formData.venut}
                  onCheckedChange={(checked) => updateFormData({ venut: checked })}
                  className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </div>
          </div>

          <div>
            {/* Anunci Destacat */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Anunci Destacat
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  L'anunci apareixerà destacat
                </p>
              </div>
              <div className="scale-75">
                <Switch
                  checked={formData.anunciDestacat === 1}
                  onCheckedChange={(checked) => updateFormData({ anunciDestacat: checked ? 1 : 0 })}
                  className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-900 dark:text-white">Pujant imatges...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesAndStatusStep;