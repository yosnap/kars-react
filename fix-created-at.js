const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCreatedAtFields() {
  try {
    console.log('🔧 Fixing createdAt fields in Brand model...');
    
    // Find all brands with null createdAt
    const brandsWithNullCreatedAt = await prisma.$runCommandRaw({
      find: 'Brand',
      filter: { created_at: null }
    });
    
    console.log(`Found ${brandsWithNullCreatedAt.cursor.firstBatch.length} brands with null createdAt`);
    
    // Update all brands with null createdAt to current date
    const updateResult = await prisma.$runCommandRaw({
      update: 'Brand',
      updates: [{
        q: { created_at: null },
        u: { 
          $set: { 
            created_at: new Date(),
            updated_at: new Date()
          } 
        },
        multi: true
      }]
    });
    
    console.log('✅ Update result:', updateResult);
    
    // Also check and fix Model collection if it exists
    try {
      const modelsWithNullCreatedAt = await prisma.$runCommandRaw({
        find: 'Model',
        filter: { created_at: null }
      });
      
      if (modelsWithNullCreatedAt.cursor.firstBatch.length > 0) {
        console.log(`Found ${modelsWithNullCreatedAt.cursor.firstBatch.length} models with null createdAt`);
        
        const updateModelsResult = await prisma.$runCommandRaw({
          update: 'Model',
          updates: [{
            q: { created_at: null },
            u: { 
              $set: { 
                created_at: new Date(),
                updated_at: new Date()
              } 
            },
            multi: true
          }]
        });
        
        console.log('✅ Models update result:', updateModelsResult);
      }
    } catch (error) {
      console.log('ℹ️ Model collection not found or no null dates');
    }
    
    console.log('✅ All createdAt fields fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing createdAt fields:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCreatedAtFields();