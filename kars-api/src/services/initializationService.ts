import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ExternalBrand {
  value: string;
  label: string;
}

// Función para cargar marcas desde JSON local
function loadBrandsFromJSON(): { carBrands: ExternalBrand[], motorcycleBrands: ExternalBrand[] } {
  try {
    const brandsPath = path.join(__dirname, '..', '..', 'data', 'brands.json');
    
    if (fs.existsSync(brandsPath)) {
      console.log('📁 Cargando marcas desde archivo JSON local...');
      const brandsData = JSON.parse(fs.readFileSync(brandsPath, 'utf8'));
      return {
        carBrands: brandsData.carBrands || [],
        motorcycleBrands: brandsData.motorcycleBrands || []
      };
    } else {
      console.log('⚠️ Archivo brands.json no encontrado, fallback no disponible...');
      return {
        carBrands: [],
        motorcycleBrands: []
      };
    }
  } catch (error) {
    console.log('⚠️ Error cargando brands.json:', error);
    return {
      carBrands: [],
      motorcycleBrands: []
    };
  }
}

// Función para cargar modelos desde JSON local
function loadModelsFromJSON(): { carModels: any[], motorcycleModels: any[] } {
  try {
    const modelsPath = path.join(__dirname, '..', '..', 'data', 'models.json');
    
    if (fs.existsSync(modelsPath)) {
      console.log('📁 Cargando modelos desde archivo JSON local...');
      const modelsData = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
      return {
        carModels: modelsData.carModels || [],
        motorcycleModels: modelsData.motorcycleModels || []
      };
    } else {
      console.log('⚠️ Archivo models.json no encontrado, los modelos se cargarán desde API...');
      return {
        carModels: [],
        motorcycleModels: []
      };
    }
  } catch (error) {
    console.log('⚠️ Error cargando models.json, los modelos se cargarán desde API:', error);
    return {
      carModels: [],
      motorcycleModels: []
    };
  }
}

interface ExternalModel {
  value?: string;
  slug?: string;
  label?: string;
  name?: string;
}

interface InitializationProgress {
  stage: 'idle' | 'brands' | 'car_models' | 'motorcycle_models' | 'completed' | 'error';
  stageLabel: string;
  stageProgress: number; // 0-100
  overallProgress: number; // 0-100
  currentItem: string;
  details: {
    brands: { current: number; total: number; completed: boolean };
    carModels: { current: number; total: number; completed: boolean };
    motorcycleModels: { current: number; total: number; completed: boolean };
  };
  startedAt?: Date;
  errors: string[];
}

interface InitializationStats {
  brands: {
    imported: number;
    skipped: number;
    total: number;
  };
  carModels: {
    imported: number;
    skipped: number;
    total: number;
  };
  motorcycleModels: {
    imported: number;
    skipped: number;
    total: number;
  };
  totalTime: number;
  errors: string[];
}

export class InitializationService {
  private stats: InitializationStats = {
    brands: { imported: 0, skipped: 0, total: 0 },
    carModels: { imported: 0, skipped: 0, total: 0 },
    motorcycleModels: { imported: 0, skipped: 0, total: 0 },
    totalTime: 0,
    errors: []
  };

  private progress: InitializationProgress = {
    stage: 'idle',
    stageLabel: 'Preparando inicialización...',
    stageProgress: 0,
    overallProgress: 0,
    currentItem: '',
    details: {
      brands: { current: 0, total: 0, completed: false },
      carModels: { current: 0, total: 0, completed: false },
      motorcycleModels: { current: 0, total: 0, completed: false }
    },
    errors: []
  };

  private isRunning: boolean = false;

  /**
   * Obtener el progreso actual de la inicialización
   */
  getProgress(): InitializationProgress & { isRunning: boolean } {
    return {
      ...this.progress,
      isRunning: this.isRunning
    };
  }

  /**
   * Actualizar el progreso de la inicialización
   */
  private updateProgress(updates: Partial<InitializationProgress>) {
    this.progress = { ...this.progress, ...updates };
    
    // Calcular progreso general basado en las etapas completadas
    const stages = ['brands', 'carModels', 'motorcycleModels'] as const;
    const completedStages = stages.filter(stage => this.progress.details[stage].completed).length;
    const stageProgress = this.progress.stageProgress;
    const currentStageWeight = 33; // Cada etapa vale ~33%
    
    this.progress.overallProgress = Math.min(100, (completedStages * currentStageWeight) + (stageProgress * currentStageWeight / 100));
    
    console.log(`📊 Progreso actualizado: ${this.progress.stageLabel} - ${this.progress.stageProgress}% (General: ${this.progress.overallProgress}%)`);
  }

  /**
   * Resetear el progreso
   */
  private resetProgress() {
    this.progress = {
      stage: 'idle',
      stageLabel: 'Preparando inicialización...',
      stageProgress: 0,
      overallProgress: 0,
      currentItem: '',
      details: {
        brands: { current: 0, total: 0, completed: false },
        carModels: { current: 0, total: 0, completed: false },
        motorcycleModels: { current: 0, total: 0, completed: false }
      },
      startedAt: new Date(),
      errors: []
    };
  }

  /**
   * Inicialización completa de la base de datos con marcas y modelos
   */
  async initializeDatabase(options: {
    clearExisting?: boolean;
    importModels?: boolean;
    maxBrands?: number;
    maxModelsPerBrand?: number;
  } = {}): Promise<InitializationStats> {
    if (this.isRunning) {
      throw new Error('Initialization is already running');
    }

    const startTime = Date.now();
    this.isRunning = true;
    this.resetProgress();
    
    console.log('🚀 Iniciando inicialización completa de la base de datos...');
    
    const {
      clearExisting = false,
      importModels = true,
      maxBrands = 300, // Permitir todas las marcas disponibles
      maxModelsPerBrand = 50 // Aumentar modelos por marca
    } = options;

    try {
      // 1. Limpiar datos existentes si se solicita
      if (clearExisting) {
        this.updateProgress({
          stage: 'brands',
          stageLabel: 'Limpiando datos existentes...',
          currentItem: 'Base de datos'
        });
        await this.clearExistingData();
      }

      // 2. Importar todas las marcas (coches y motos) con manejo de duplicados
      this.updateProgress({
        stage: 'brands',
        stageLabel: 'Importando todas las marcas...',
        stageProgress: 0,
        currentItem: 'Procesando marcas desde JSON...'
      });
      await this.importAllBrands(maxBrands);

      // 3. Importar modelos de coches si se solicita
      if (importModels) {
        this.updateProgress({
          stage: 'car_models',
          stageLabel: 'Importando modelos de coches...',
          stageProgress: 0,
          currentItem: 'Procesando marcas...'
        });
        await this.importCarModels(maxModelsPerBrand);
      }

      // 4. Importar modelos de motos si se solicita
      if (importModels) {
        this.updateProgress({
          stage: 'motorcycle_models',
          stageLabel: 'Importando modelos de motos...',
          stageProgress: 0,
          currentItem: 'Procesando marcas...'
        });
        await this.importMotorcycleModels(maxModelsPerBrand);
      }

      // Completado
      this.updateProgress({
        stage: 'completed',
        stageLabel: 'Inicialización completada',
        stageProgress: 100,
        overallProgress: 100,
        currentItem: 'Finalizado'
      });

      this.stats.totalTime = Date.now() - startTime;
      this.isRunning = false;
      
      console.log('✅ Inicialización completa terminada');
      console.log('📊 Estadísticas:', this.stats);
      
      return this.stats;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error durante la inicialización:', errorMessage);
      this.stats.errors.push(errorMessage);
      this.progress.errors.push(errorMessage);
      this.stats.totalTime = Date.now() - startTime;
      this.isRunning = false;
      
      this.updateProgress({
        stage: 'error',
        stageLabel: 'Error durante la inicialización',
        currentItem: errorMessage
      });
      
      throw error;
    }
  }

  /**
   * Limpiar todos los datos existentes
   */
  private async clearExistingData(): Promise<void> {
    console.log('🗑️ Limpiando datos existentes...');
    
    try {
      // Eliminar modelos primero (por la relación)
      await prisma.model.deleteMany({});
      console.log('✅ Modelos eliminados');

      // Eliminar marcas
      await prisma.brand.deleteMany({});
      console.log('✅ Marcas eliminadas');

    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
      throw error;
    }
  }

  /**
   * Importar todas las marcas (coches y motos) desde archivo JSON local
   * Maneja marcas duplicadas usando arrays en vehicleTypes
   */
  private async importAllBrands(maxBrands: number): Promise<void> {
    try {
      console.log('📡 Importando todas las marcas desde JSON local...');
      
      const { carBrands, motorcycleBrands } = loadBrandsFromJSON();
      console.log(`📋 Encontradas ${carBrands.length} marcas de coches y ${motorcycleBrands.length} marcas de motos`);

      // Crear un mapa para manejar marcas duplicadas
      const brandsMap = new Map<string, { label: string; vehicleTypes: string[] }>();
      
      // Agregar marcas de coches
      carBrands.forEach(brand => {
        if (brandsMap.has(brand.value)) {
          brandsMap.get(brand.value)!.vehicleTypes.push('car');
        } else {
          brandsMap.set(brand.value, {
            label: brand.label,
            vehicleTypes: ['car']
          });
        }
      });
      
      // Agregar marcas de motos
      motorcycleBrands.forEach(brand => {
        if (brandsMap.has(brand.value)) {
          brandsMap.get(brand.value)!.vehicleTypes.push('motorcycle');
        } else {
          brandsMap.set(brand.value, {
            label: brand.label,
            vehicleTypes: ['motorcycle']
          });
        }
      });
      
      const allBrands = Array.from(brandsMap.entries()).map(([slug, data]) => ({
        value: slug,
        label: data.label,
        vehicleTypes: data.vehicleTypes
      }));
      
      const mixedBrands = allBrands.filter(b => b.vehicleTypes.length > 1);
      console.log(`🔄 Total de marcas únicas: ${allBrands.length} (incluye ${mixedBrands.length} marcas mixtas)`);
      
      // Limitar el número de marcas si se especifica
      const brandsToImport = allBrands.slice(0, maxBrands);
      this.stats.brands.total = brandsToImport.length;
      
      // Actualizar progreso con totales
      this.updateProgress({
        details: {
          ...this.progress.details,
          brands: { current: 0, total: brandsToImport.length, completed: false }
        }
      });

      for (let i = 0; i < brandsToImport.length; i++) {
        const brandData = brandsToImport[i];
        if (!brandData) continue;
        
        try {
          if (!brandData.value || !brandData.label) {
            console.warn('⚠️ Marca inválida:', brandData);
            this.stats.brands.skipped++;
            continue;
          }

          // Verificar si ya existe
          const existing = await prisma.brand.findUnique({
            where: { slug: brandData.value }
          });

          if (existing) {
            // Actualizar vehicleTypes si es necesario
            const newTypes = [...new Set([...existing.vehicleTypes, ...brandData.vehicleTypes])];
            if (newTypes.length !== existing.vehicleTypes.length) {
              await prisma.brand.update({
                where: { id: existing.id },
                data: { vehicleTypes: newTypes }
              });
              console.log(`🔄 Marca actualizada con nuevos tipos: ${brandData.label} - ${newTypes.join(', ')}`);
            } else {
              console.log(`⏭️ Marca ya existe: ${brandData.label}`);
            }
            this.stats.brands.skipped++;
            continue;
          }

          // Crear nueva marca
          await prisma.brand.create({
            data: {
              name: brandData.label,
              slug: brandData.value,
              vehicleTypes: brandData.vehicleTypes
            }
          });

          this.stats.brands.imported++;
          const typesLabel = brandData.vehicleTypes.length > 1 ? `${brandData.vehicleTypes.join(' + ')}` : brandData.vehicleTypes[0];
          console.log(`✅ Marca importada: ${brandData.label} (${typesLabel})`);

          // Actualizar progreso
          const currentProgress = Math.round((i + 1) / brandsToImport.length * 100);
          this.updateProgress({
            stageProgress: currentProgress,
            currentItem: `${brandData.label} - ${typesLabel} (${i + 1}/${brandsToImport.length})`,
            details: {
              ...this.progress.details,
              brands: { current: i + 1, total: brandsToImport.length, completed: false }
            }
          });

        } catch (error) {
          const errorMsg = `Error importando marca ${brandData.label}: ${error}`;
          console.error(`❌ ${errorMsg}`);
          this.stats.errors.push(errorMsg);
          this.stats.brands.skipped++;
        }
      }

      // Marcar etapa como completada
      this.updateProgress({
        details: {
          ...this.progress.details,
          brands: { current: brandsToImport.length, total: brandsToImport.length, completed: true }
        }
      });

      console.log(`📊 Marcas: ${this.stats.brands.imported} importadas, ${this.stats.brands.skipped} omitidas`);

    } catch (error) {
      console.error('❌ Error importando marcas:', error);
      throw error;
    }
  }

  /**
   * Importar modelos de coches para cada marca
   */
  private async importCarModels(maxModelsPerBrand: number): Promise<void> {
    try {
      // Obtener todas las marcas que fabrican coches
      const carBrands = await prisma.brand.findMany({
        where: { 
          vehicleTypes: { 
            hasSome: ['car'] 
          } 
        }
      });

      console.log(`🔧 Importando modelos para ${carBrands.length} marcas de coches...`);
      
      // Intentar cargar modelos desde JSON local primero
      const { carModels: jsonModels } = loadModelsFromJSON();
      const useJsonModels = jsonModels.length > 0;
      
      // Actualizar progreso inicial para modelos
      this.updateProgress({
        details: {
          ...this.progress.details,
          carModels: { current: 0, total: carBrands.length, completed: false }
        }
      });

      for (let brandIndex = 0; brandIndex < carBrands.length; brandIndex++) {
        const brand = carBrands[brandIndex];
        if (!brand) continue;
        
        try {
          let modelsToImport: any[] = [];
          
          if (useJsonModels) {
            // Usar modelos desde JSON local
            console.log(`📁 Obteniendo modelos desde JSON para marca: ${brand.name}`);
            const brandModels = jsonModels.filter(model => model.brandSlug === brand.slug);
            modelsToImport = brandModels.slice(0, maxModelsPerBrand);
          } else {
            // Usar API externa como fallback
            console.log(`📡 Obteniendo modelos desde API para marca: ${brand.name}`);
            
            const response = await axios.get(
              `https://api.motoraldia.com/wp-json/api-motor/v1/marques-cotxe?marca=${brand.slug}`,
              { timeout: 20000 }
            );

            let externalModels: ExternalModel[] = [];
            if (response.data?.data && Array.isArray(response.data.data)) {
              externalModels = response.data.data;
            } else if (Array.isArray(response.data)) {
              externalModels = response.data;
            }

            modelsToImport = externalModels.slice(0, maxModelsPerBrand);
          }

          this.stats.carModels.total += modelsToImport.length;

          let brandModelsImported = 0;
          for (const modelData of modelsToImport) {
            try {
              const value = modelData.value || modelData.slug;
              const label = modelData.label || modelData.name;

              if (!value || !label) {
                this.stats.carModels.skipped++;
                continue;
              }

              // Verificar si ya existe
              const existing = await prisma.model.findFirst({
                where: { 
                  brandId: brand.id,
                  slug: value
                }
              });

              if (existing) {
                this.stats.carModels.skipped++;
                continue;
              }

              // Crear nuevo modelo
              await prisma.model.create({
                data: {
                  name: label,
                  slug: value,
                  brandId: brand.id
                }
              });

              this.stats.carModels.imported++;
              brandModelsImported++;

            } catch (error) {
              const errorMsg = `Error importando modelo ${modelData.label} para marca ${brand.name}`;
              this.stats.errors.push(errorMsg);
              this.stats.carModels.skipped++;
            }
          }

          console.log(`✅ ${brandModelsImported} modelos importados para ${brand.name}`);
          
          // Actualizar progreso por marca procesada
          const currentProgress = Math.round((brandIndex + 1) / carBrands.length * 100);
          this.updateProgress({
            stageProgress: currentProgress,
            currentItem: `${brand.name} - ${brandModelsImported} modelos (${brandIndex + 1}/${carBrands.length})`,
            details: {
              ...this.progress.details,
              carModels: { current: brandIndex + 1, total: carBrands.length, completed: false }
            }
          });

        } catch (error) {
          const errorMsg = `Error obteniendo modelos para marca ${brand.name}: ${error}`;
          console.error(`❌ ${errorMsg}`);
          this.stats.errors.push(errorMsg);
        }
      }

      // Marcar etapa como completada
      this.updateProgress({
        details: {
          ...this.progress.details,
          carModels: { current: carBrands.length, total: carBrands.length, completed: true }
        }
      });

      console.log(`📊 Modelos de coches: ${this.stats.carModels.imported} importados, ${this.stats.carModels.skipped} omitidos`);

    } catch (error) {
      console.error('❌ Error importando modelos de coches:', error);
      throw error;
    }
  }

  /**
   * Importar modelos de motos para cada marca
   */
  private async importMotorcycleModels(maxModelsPerBrand: number): Promise<void> {
    try {
      // Obtener todas las marcas que fabrican motos
      const motorcycleBrands = await prisma.brand.findMany({
        where: { 
          vehicleTypes: { 
            hasSome: ['motorcycle'] 
          } 
        }
      });

      console.log(`🔧 Importando modelos para ${motorcycleBrands.length} marcas de motos...`);
      
      // Intentar cargar modelos desde JSON local primero
      const { motorcycleModels: jsonModels } = loadModelsFromJSON();
      const useJsonModels = jsonModels.length > 0;
      
      // Actualizar progreso inicial para modelos de motos
      this.updateProgress({
        details: {
          ...this.progress.details,
          motorcycleModels: { current: 0, total: motorcycleBrands.length, completed: false }
        }
      });

      for (let brandIndex = 0; brandIndex < motorcycleBrands.length; brandIndex++) {
        const brand = motorcycleBrands[brandIndex];
        if (!brand) continue;
        
        try {
          let modelsToImport: any[] = [];
          
          if (useJsonModels) {
            // Usar modelos desde JSON local
            console.log(`📁 Obteniendo modelos desde JSON para marca de moto: ${brand.name}`);
            const brandModels = jsonModels.filter(model => model.brandSlug === brand.slug);
            modelsToImport = brandModels.slice(0, maxModelsPerBrand);
          } else {
            // Usar API externa como fallback
            console.log(`📡 Obteniendo modelos desde API para marca de moto: ${brand.name}`);
            
            const response = await axios.get(
              `https://api.motoraldia.com/wp-json/api-motor/v1/marques-moto?marca=${brand.slug}`,
              { timeout: 20000 }
            );

            let externalModels: ExternalModel[] = [];
            if (response.data?.data && Array.isArray(response.data.data)) {
              externalModels = response.data.data;
            } else if (Array.isArray(response.data)) {
              externalModels = response.data;
            }

            modelsToImport = externalModels.slice(0, maxModelsPerBrand);
          }

          this.stats.motorcycleModels.total += modelsToImport.length;

          let brandModelsImported = 0;
          for (const modelData of modelsToImport) {
            try {
              const value = modelData.value || modelData.slug;
              const label = modelData.label || modelData.name;

              if (!value || !label) {
                this.stats.motorcycleModels.skipped++;
                continue;
              }

              // Verificar si ya existe
              const existing = await prisma.model.findFirst({
                where: { 
                  brandId: brand.id,
                  slug: value
                }
              });

              if (existing) {
                this.stats.motorcycleModels.skipped++;
                continue;
              }

              // Crear nuevo modelo
              await prisma.model.create({
                data: {
                  name: label,
                  slug: value,
                  brandId: brand.id
                }
              });

              this.stats.motorcycleModels.imported++;
              brandModelsImported++;

            } catch (error) {
              const errorMsg = `Error importando modelo ${modelData.label} para marca ${brand.name}`;
              this.stats.errors.push(errorMsg);
              this.stats.motorcycleModels.skipped++;
            }
          }

          console.log(`✅ ${brandModelsImported} modelos importados para ${brand.name}`);
          
          // Actualizar progreso por marca procesada
          const currentProgress = Math.round((brandIndex + 1) / motorcycleBrands.length * 100);
          this.updateProgress({
            stageProgress: currentProgress,
            currentItem: `${brand.name} - ${brandModelsImported} modelos (${brandIndex + 1}/${motorcycleBrands.length})`,
            details: {
              ...this.progress.details,
              motorcycleModels: { current: brandIndex + 1, total: motorcycleBrands.length, completed: false }
            }
          });

        } catch (error) {
          const errorMsg = `Error obteniendo modelos para marca de moto ${brand.name}: ${error}`;
          console.error(`❌ ${errorMsg}`);
          this.stats.errors.push(errorMsg);
        }
      }

      // Marcar etapa como completada
      this.updateProgress({
        details: {
          ...this.progress.details,
          motorcycleModels: { current: motorcycleBrands.length, total: motorcycleBrands.length, completed: true }
        }
      });

      console.log(`📊 Modelos de motos: ${this.stats.motorcycleModels.imported} importados, ${this.stats.motorcycleModels.skipped} omitidos`);

    } catch (error) {
      console.error('❌ Error importando modelos de motos:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas actuales de la base de datos
   */
  async getDatabaseStats() {
    const [
      carBrandsCount,
      motorcycleBrandsCount,
      totalModelsCount,
      carModelsCount,
      motorcycleModelsCount
    ] = await Promise.all([
      prisma.brand.count({ 
        where: { 
          vehicleTypes: { 
            hasSome: ['car'] 
          } 
        } 
      }),
      prisma.brand.count({ 
        where: { 
          vehicleTypes: { 
            hasSome: ['motorcycle'] 
          } 
        } 
      }),
      prisma.model.count(),
      prisma.model.count({
        where: {
          brand: {
            vehicleTypes: { 
              hasSome: ['car'] 
            }
          }
        }
      }),
      prisma.model.count({
        where: {
          brand: {
            vehicleTypes: { 
              hasSome: ['motorcycle'] 
            }
          }
        }
      })
    ]);

    return {
      brands: {
        cars: carBrandsCount,
        motorcycles: motorcycleBrandsCount,
        total: carBrandsCount + motorcycleBrandsCount
      },
      models: {
        cars: carModelsCount,
        motorcycles: motorcycleModelsCount,
        total: totalModelsCount
      }
    };
  }
}

export const initializationService = new InitializationService();