// Datos de modelos para importación
// Generado automáticamente desde models.json

export interface ModelData {
  value: string;
  label: string;
  brandSlug: string;
}

export interface ModelsData {
  metadata: {
    createdAt: string;
    version: string;
    totalCarModels: number;
    totalMotorcycleModels: number;
    totalModels: number;
  };
  carModels: ModelData[];
  motorcycleModels: ModelData[];
}

// Nota: Este archivo contiene más de 2800 modelos
// Por razones de rendimiento, se cargará dinámicamente desde el archivo JSON
// o se puede generar automáticamente cuando sea necesario

export const loadModelsData = async (): Promise<ModelsData> => {
  // En producción, cargar desde archivo JSON incluido en Docker
  const fs = require('fs');
  const path = require('path');
  
  try {
    const modelsFilePath = path.join(process.cwd(), 'data', 'models.json');
    const modelsFileContent = fs.readFileSync(modelsFilePath, 'utf-8');
    return JSON.parse(modelsFileContent);
  } catch (error) {
    console.error('Error loading models data:', error);
    throw new Error('No se pudo cargar el archivo de modelos');
  }
};