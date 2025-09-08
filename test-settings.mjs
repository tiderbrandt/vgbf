// Test the new settings functions
import { exportAllSettings, validateSettings, getDisplayConfig } from './src/lib/settings-storage-postgres.ts';

async function testNewFunctions() {
    console.log('🧪 Testing new settings functions...');

    try {
        // Test validation
        console.log('🔍 Testing validation function...');
        const invalidSettings = {
            siteName: '',
            siteDescription: 'test',
            adminEmail: 'invalid-email',
            itemsPerPage: 0,
            dateFormat: 'sv-SE',
            enableRegistration: false,
            enableNotifications: true,
            backupFrequency: 'weekly',
            maintenanceMode: false
        };

        const validationResult = await validateSettings(invalidSettings);
        console.log('✅ Validation result:', validationResult.isValid ? 'Valid' : `Invalid: ${validationResult.errors.join(', ')}`);

        // Test display config
        console.log('🎨 Testing display config...');
        const displayResult = await getDisplayConfig();
        console.log('✅ Display config:', displayResult.success ? `Language: ${displayResult.data.language}` : `Error: ${displayResult.error}`);

        // Test export
        console.log('📤 Testing export function...');
        const exportResult = await exportAllSettings();
        console.log('✅ Export result:', exportResult.success ? `Data size: ${exportResult.data.length} characters` : `Error: ${exportResult.error}`);

        console.log('🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testNewFunctions();
