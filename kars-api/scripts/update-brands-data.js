const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE = 'https://motoraldia.net';
const OUTPUT_FILE = path.join(__dirname, '../src/data/brands-data.ts');

// Función para hacer peticiones HTTPS
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Función para limpiar sufijos numéricos de los values
function cleanBrandValue(value) {
  // Remover sufijos como -2, -3, etc. pero mantener casos como lc-100, lc-50
  return value.replace(/^(.+)-(\d+)$/, (match, base, num) => {
    // Mantener casos específicos como lc-100, lc-50
    if (base.toLowerCase() === 'lc') {
      return match;
    }
    // Para otros casos, remover el sufijo numérico
    return base;
  });
}

// Función para eliminar duplicados manteniendo el primer elemento
function deduplicateBrands(brands) {
  const seen = new Set();
  return brands.filter(brand => {
    const cleanValue = cleanBrandValue(brand.value);
    if (seen.has(cleanValue)) {
      return false;
    }
    seen.add(cleanValue);
    brand.value = cleanValue; // Actualizar el value con la versión limpia
    return true;
  });
}

// Función principal
async function updateBrandsData() {
  try {
    console.log('Fetching car brands from motoraldia.net...');
    const carBrandsResponse = await fetchData(`${API_BASE}/wp-json/api-motor/v1/marques-cotxe`);
    console.log(`Found ${carBrandsResponse.total} car brands`);

    console.log('Fetching motorcycle brands from motoraldia.net...');
    const motoBrandsResponse = await fetchData(`${API_BASE}/wp-json/api-motor/v1/marques-moto`);
    console.log(`Found ${motoBrandsResponse.total} motorcycle brands`);

    // Limpiar y deduplicar marcas
    console.log('Cleaning brand values and removing duplicates...');
    const cleanCarBrands = deduplicateBrands([...carBrandsResponse.data]);
    const cleanMotoBrands = deduplicateBrands([...motoBrandsResponse.data]);
    
    console.log(`Car brands after cleaning: ${cleanCarBrands.length} (removed ${carBrandsResponse.total - cleanCarBrands.length})`);
    console.log(`Moto brands after cleaning: ${cleanMotoBrands.length} (removed ${motoBrandsResponse.total - cleanMotoBrands.length})`);

    // Encontrar marcas duplicadas entre coches y motos
    const carBrandValues = new Set(cleanCarBrands.map(b => b.value));
    const duplicates = cleanMotoBrands.filter(b => carBrandValues.has(b.value));
    
    console.log(`Found ${duplicates.length} duplicate brands between cars and motorcycles`);

    // Crear el contenido del archivo
    const fileContent = `// Datos de marcas para importación
// Generado automáticamente desde la API de motoraldia.net
// Última actualización: ${new Date().toISOString()}

export interface BrandData {
  value: string;
  label: string;
}

export interface BrandsData {
  metadata: {
    createdAt: string;
    totalCarBrands: number;
    totalMotorcycleBrands: number;
    duplicateBrands: number;
    duplicateBrandsList: BrandData[];
    version: string;
  };
  carBrands: BrandData[];
  motorcycleBrands: BrandData[];
}

export const brandsData: BrandsData = {
  "metadata": {
    "createdAt": "${new Date().toISOString()}",
    "totalCarBrands": ${cleanCarBrands.length},
    "totalMotorcycleBrands": ${cleanMotoBrands.length},
    "duplicateBrands": ${duplicates.length},
    "duplicateBrandsList": ${JSON.stringify(duplicates, null, 6).split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n')},
    "version": "4.0"
  },
  "carBrands": ${JSON.stringify(cleanCarBrands, null, 4).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')},
  "motorcycleBrands": ${JSON.stringify(cleanMotoBrands, null, 4).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')}
};
`;

    // Escribir el archivo
    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`\n✅ Successfully updated ${OUTPUT_FILE}`);
    console.log(`📊 Final stats:`);
    console.log(`   • Car brands: ${cleanCarBrands.length}`);
    console.log(`   • Motorcycle brands: ${cleanMotoBrands.length}`);
    console.log(`   • Duplicate brands between types: ${duplicates.length}`);
    console.log(`   • Total unique brands: ${cleanCarBrands.length + cleanMotoBrands.length - duplicates.length}`);

  } catch (error) {
    console.error('❌ Error updating brands data:', error);
    process.exit(1);
  }
}

// Ejecutar
updateBrandsData();