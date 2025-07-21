const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  log: ['error']
});

async function main() {
  console.log('🌱 Starting seed...');
  
  // Leer el archivo de vehículos
  const vehiclesPath = path.join(__dirname, '..', 'example_vehicles_kars.json');
  const vehiclesData = JSON.parse(fs.readFileSync(vehiclesPath, 'utf8'));
  
  console.log(`📊 Found ${vehiclesData.length} vehicles to import`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const vehicle of vehiclesData) {
    try {
      // Convertir los campos según el schema de Prisma
      const vehicleData = {
        titolAnunci: vehicle['titol-anunci'] || '',
        descripcioAnunci: vehicle['descripcio-anunci'] || '',
        anunciActiu: vehicle['anunci-actiu'] === 'true',
        anunciDestacat: parseInt(vehicle['anunci-destacat']) || 0,
        tipusVehicle: vehicle['tipus-vehicle'] || '',
        marcaCotxe: vehicle['marques-cotxe'] || '',
        modelsCotxe: vehicle['models-cotxe'] || '',
        tipusCombustible: vehicle['tipus-combustible'] || '',
        tipusPropulsor: vehicle['tipus-propulsor'] || '',
        estatVehicle: vehicle['estat-vehicle'] || '',
        carrosseriaCotxe: vehicle['carroseria-cotxe'] || '',
        diesCaducitat: vehicle['dies-caducitat'] || '365',
        versio: vehicle['versio'] || '',
        any: vehicle['any'] || null,
        quilometratge: vehicle['quilometratge'] || null,
        cilindrada: vehicle['cilindrada'] || null,
        traccio: vehicle['traccio'] || '',
        potenciaCv: vehicle['potencia-cv'] || null,
        potenciaKw: vehicle['potencia-kw'] || null,
        emissionsVehicle: vehicle['emissions-vehicle'] || '',
        colorVehicle: vehicle['color-vehicle'] || '',
        preu: vehicle['preu'] || '0',
        imatgeDestacadaUrl: vehicle['imatge-destacada-url'] || '',
        slug: vehicle['slug'] || '',
        venut: vehicle['venut'] === 'true' || vehicle['venut'] === true,
        dataCreacio: vehicle['data-creacio'] ? new Date(vehicle['data-creacio']) : new Date(),
        authorId: vehicle['author_id'] || '1',
        status: vehicle['status'] || 'publish'
      };
      
      // Crear el vehículo
      await prisma.vehicle.create({
        data: vehicleData
      });
      
      imported++;
      console.log(`✅ Imported: ${vehicleData.titolAnunci}`);
      
    } catch (error) {
      console.log(`⚠️ Skipped vehicle: ${vehicle['titol-anunci']} - ${error.message}`);
      skipped++;
    }
  }
  
  console.log('\n🎉 Seed completed!');
  console.log(`✅ Imported: ${imported} vehicles`);
  console.log(`⚠️ Skipped: ${skipped} vehicles`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });