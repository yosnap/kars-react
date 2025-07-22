/**
 * Script para importar marcas predefinidas de coches y motos
 * Ejecutar con: node import-brands.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Marcas de coches (para coches, autocaravanas y vehículos comerciales)
const carBrands = [
  { "value": "abarth", "label": "Abarth" },
  { "value": "acura", "label": "Acura" },
  { "value": "aixam", "label": "Aixam" },
  { "value": "alfa-romeo", "label": "Alfa Romeo" },
  { "value": "alpine", "label": "Alpine" },
  { "value": "aro", "label": "Aro" },
  { "value": "aston-martin", "label": "Aston Martin" },
  { "value": "audi", "label": "Audi" },
  { "value": "austin", "label": "Austin" },
  { "value": "austin-healey", "label": "Austin Healey" },
  { "value": "autobianchi", "label": "Autobianchi" },
  { "value": "baic", "label": "BAIC" },
  { "value": "bentley", "label": "Bentley" },
  { "value": "bmw", "label": "BMW" },
  { "value": "borgward", "label": "Borgward" },
  { "value": "brilliance", "label": "Brilliance" },
  { "value": "bugatti", "label": "Bugatti" },
  { "value": "buick", "label": "Buick" },
  { "value": "byd", "label": "BYD" },
  { "value": "cadillac", "label": "Cadillac" },
  { "value": "casalini", "label": "Casalini" },
  { "value": "caterham", "label": "Caterham" },
  { "value": "chatenet", "label": "Chatenet" },
  { "value": "chery", "label": "Chery" },
  { "value": "chevrolet", "label": "Chevrolet" },
  { "value": "chrysler", "label": "Chrysler" },
  { "value": "citroen", "label": "Citroën" },
  { "value": "corvette", "label": "Corvette" },
  { "value": "cupra", "label": "Cupra" },
  { "value": "dacia", "label": "Dacia" },
  { "value": "daewoo", "label": "Daewoo" },
  { "value": "daihatsu", "label": "Daihatsu" },
  { "value": "daimler", "label": "Daimler" },
  { "value": "dfm", "label": "DFM" },
  { "value": "dodge", "label": "Dodge" },
  { "value": "donkervoort", "label": "Donkervoort" },
  { "value": "ds", "label": "DS" },
  { "value": "ferrari", "label": "Ferrari" },
  { "value": "fiat", "label": "Fiat" },
  { "value": "fisker", "label": "Fisker" },
  { "value": "ford", "label": "Ford" },
  { "value": "gac", "label": "GAC" },
  { "value": "galloper", "label": "Galloper" },
  { "value": "genesis", "label": "Genesis" },
  { "value": "gmc", "label": "GMC" },
  { "value": "great-wall", "label": "Great Wall" },
  { "value": "honda", "label": "Honda" },
  { "value": "hummer", "label": "Hummer" },
  { "value": "hyundai", "label": "Hyundai" },
  { "value": "infiniti", "label": "Infiniti" },
  { "value": "isuzu", "label": "Isuzu" },
  { "value": "iveco", "label": "Iveco" },
  { "value": "jac", "label": "JAC" },
  { "value": "jaguar", "label": "Jaguar" },
  { "value": "jeep", "label": "Jeep" },
  { "value": "kia", "label": "Kia" },
  { "value": "koenigsegg", "label": "Koenigsegg" },
  { "value": "lada", "label": "Lada" },
  { "value": "lamborghini", "label": "Lamborghini" },
  { "value": "lancia", "label": "Lancia" },
  { "value": "land-rover", "label": "Land Rover" },
  { "value": "lexus", "label": "Lexus" },
  { "value": "ligier", "label": "Ligier" },
  { "value": "lincoln", "label": "Lincoln" },
  { "value": "lotus", "label": "Lotus" },
  { "value": "lucid", "label": "Lucid" },
  { "value": "lynk-co", "label": "Lynk & Co" },
  { "value": "mahindra", "label": "Mahindra" },
  { "value": "maserati", "label": "Maserati" },
  { "value": "maybach", "label": "Maybach" },
  { "value": "mazda", "label": "Mazda" },
  { "value": "mclaren", "label": "McLaren" },
  { "value": "mercedes-benz", "label": "Mercedes-Benz" },
  { "value": "mg", "label": "MG" },
  { "value": "microcar", "label": "Microcar" },
  { "value": "mini", "label": "MINI" },
  { "value": "mitsubishi", "label": "Mitsubishi" },
  { "value": "morgan", "label": "Morgan" },
  { "value": "nio", "label": "NIO" },
  { "value": "nissan", "label": "Nissan" },
  { "value": "noble", "label": "Noble" },
  { "value": "oldsmobile", "label": "Oldsmobile" },
  { "value": "opel", "label": "Opel" },
  { "value": "pagani", "label": "Pagani" },
  { "value": "peugeot", "label": "Peugeot" },
  { "value": "polestar", "label": "Polestar" },
  { "value": "pontiac", "label": "Pontiac" },
  { "value": "porsche", "label": "Porsche" },
  { "value": "proton", "label": "Proton" },
  { "value": "ram", "label": "RAM" },
  { "value": "renault", "label": "Renault" },
  { "value": "rolls-royce", "label": "Rolls-Royce" },
  { "value": "rover", "label": "Rover" },
  { "value": "saab", "label": "Saab" },
  { "value": "santana", "label": "Santana" },
  { "value": "seat", "label": "SEAT" },
  { "value": "skoda", "label": "Škoda" },
  { "value": "smart", "label": "smart" },
  { "value": "ssangyong", "label": "SsangYong" },
  { "value": "subaru", "label": "Subaru" },
  { "value": "suzuki", "label": "Suzuki" },
  { "value": "tata", "label": "Tata" },
  { "value": "tesla", "label": "Tesla" },
  { "value": "toyota", "label": "Toyota" },
  { "value": "triumph", "label": "Triumph" },
  { "value": "tvr", "label": "TVR" },
  { "value": "vauxhall", "label": "Vauxhall" },
  { "value": "volkswagen", "label": "Volkswagen" },
  { "value": "volvo", "label": "Volvo" },
  { "value": "westfield", "label": "Westfield" },
  { "value": "wiesmann", "label": "Wiesmann" },
  { "value": "xpeng", "label": "XPeng" },
  { "value": "zagato", "label": "Zagato" }
];

// Marcas de motos (específicas para motocicletas)
const motorcycleBrands = [
  { "value": "adiva", "label": "Adiva" },
  { "value": "aeon", "label": "Aeon" },
  { "value": "ajs", "label": "AJS" },
  { "value": "aprilia", "label": "Aprilia" },
  { "value": "arctic-cat", "label": "Arctic Cat" },
  { "value": "atk", "label": "ATK" },
  { "value": "bajaj", "label": "Bajaj" },
  { "value": "benelli", "label": "Benelli" },
  { "value": "beta", "label": "Beta" },
  { "value": "bimota", "label": "Bimota" },
  { "value": "bmw", "label": "BMW" },
  { "value": "bombardier", "label": "Bombardier" },
  { "value": "brough-superior", "label": "Brough Superior" },
  { "value": "bsa", "label": "BSA" },
  { "value": "buell", "label": "Buell" },
  { "value": "can-am", "label": "Can-Am" },
  { "value": "cagiva", "label": "Cagiva" },
  { "value": "cfmoto", "label": "CFMoto" },
  { "value": "daelim", "label": "Daelim" },
  { "value": "derbi", "label": "Derbi" },
  { "value": "ducati", "label": "Ducati" },
  { "value": "energica", "label": "Energica" },
  { "value": "fantic", "label": "Fantic" },
  { "value": "gas-gas", "label": "Gas Gas" },
  { "value": "generic", "label": "Generic" },
  { "value": "gilera", "label": "Gilera" },
  { "value": "goes", "label": "Goes" },
  { "value": "harley-davidson", "label": "Harley-Davidson" },
  { "value": "hero", "label": "Hero" },
  { "value": "honda", "label": "Honda" },
  { "value": "husaberg", "label": "Husaberg" },
  { "value": "husqvarna", "label": "Husqvarna" },
  { "value": "hyosung", "label": "Hyosung" },
  { "value": "indian", "label": "Indian" },
  { "value": "italjet", "label": "Italjet" },
  { "value": "kawasaki", "label": "Kawasaki" },
  { "value": "keeway", "label": "Keeway" },
  { "value": "ksr-moto", "label": "KSR Moto" },
  { "value": "ktm", "label": "KTM" },
  { "value": "kymco", "label": "Kymco" },
  { "value": "laverda", "label": "Laverda" },
  { "value": "lifan", "label": "Lifan" },
  { "value": "linhai", "label": "Linhai" },
  { "value": "malaguti", "label": "Malaguti" },
  { "value": "masai", "label": "Masai" },
  { "value": "mbk", "label": "MBK" },
  { "value": "montesa", "label": "Montesa" },
  { "value": "moto-guzzi", "label": "Moto Guzzi" },
  { "value": "moto-morini", "label": "Moto Morini" },
  { "value": "mv-agusta", "label": "MV Agusta" },
  { "value": "norton", "label": "Norton" },
  { "value": "orcal", "label": "Orcal" },
  { "value": "peugeot", "label": "Peugeot" },
  { "value": "pgo", "label": "PGO" },
  { "value": "piaggio", "label": "Piaggio" },
  { "value": "polaris", "label": "Polaris" },
  { "value": "quadro", "label": "Quadro" },
  { "value": "rieju", "label": "Rieju" },
  { "value": "royal-enfield", "label": "Royal Enfield" },
  { "value": "sachs", "label": "Sachs" },
  { "value": "sherco", "label": "Sherco" },
  { "value": "suzuki", "label": "Suzuki" },
  { "value": "swm", "label": "SWM" },
  { "value": "sym", "label": "SYM" },
  { "value": "tm", "label": "TM" },
  { "value": "triumph", "label": "Triumph" },
  { "value": "ural", "label": "Ural" },
  { "value": "vespa", "label": "Vespa" },
  { "value": "victory", "label": "Victory" },
  { "value": "yamaha", "label": "Yamaha" },
  { "value": "zero", "label": "Zero" }
];

async function importBrands() {
  try {
    console.log('🚀 Iniciando importación de marcas...');

    // Importar marcas de coches
    console.log('📗 Importando marcas de coches/autocaravanas/comerciales...');
    let carImported = 0;
    let carSkipped = 0;

    for (const brand of carBrands) {
      try {
        // Verificar si ya existe
        const existing = await prisma.brand.findUnique({
          where: { slug: brand.value }
        });

        if (existing) {
          console.log(`⏭️  Marca ya existe: ${brand.label}`);
          carSkipped++;
          continue;
        }

        // Crear nueva marca
        await prisma.brand.create({
          data: {
            name: brand.label,
            slug: brand.value,
            vehicleType: 'car'
          }
        });

        carImported++;
        console.log(`✅ Marca de coche importada: ${brand.label}`);

      } catch (brandError) {
        console.error(`❌ Error importando marca de coche ${brand.label}:`, brandError);
        carSkipped++;
      }
    }

    // Importar marcas de motos
    console.log('🏍️  Importando marcas de motos...');
    let motoImported = 0;
    let motoSkipped = 0;

    for (const brand of motorcycleBrands) {
      try {
        // Verificar si ya existe
        const existing = await prisma.brand.findUnique({
          where: { slug: brand.value }
        });

        if (existing) {
          console.log(`⏭️  Marca ya existe: ${brand.label}`);
          motoSkipped++;
          continue;
        }

        // Crear nueva marca
        await prisma.brand.create({
          data: {
            name: brand.label,
            slug: brand.value,
            vehicleType: 'motorcycle'
          }
        });

        motoImported++;
        console.log(`✅ Marca de moto importada: ${brand.label}`);

      } catch (brandError) {
        console.error(`❌ Error importando marca de moto ${brand.label}:`, brandError);
        motoSkipped++;
      }
    }

    console.log('📊 Resumen de importación:');
    console.log(`   🚗 Coches: ${carImported} importadas, ${carSkipped} saltadas`);
    console.log(`   🏍️  Motos: ${motoImported} importadas, ${motoSkipped} saltadas`);
    console.log(`   📈 Total: ${carImported + motoImported} importadas, ${carSkipped + motoSkipped} saltadas`);

    console.log('✅ Importación completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
if (require.main === module) {
  importBrands()
    .then(() => {
      console.log('🎉 Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { importBrands, carBrands, motorcycleBrands };