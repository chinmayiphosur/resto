// Simple test to check if the Inventory model can be imported
try {
    const Inventory = require('./models/Inventory');
    console.log('✅ Inventory model imported successfully');
    
    // Test creating a new instance
    const testItem = new Inventory({
        name: 'Test Item',
        category: 'Grains',
        quantity: 10,
        unit: 'kg',
        reorderLevel: 5
    });
    
    console.log('✅ Test item created successfully:', testItem.name);
    console.log('✅ Status should be:', testItem.status); // Should be 'Available' based on the pre-save hook
    
} catch (error) {
    console.error('❌ Error:', error.message);
}