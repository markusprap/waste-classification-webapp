const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Dapatkan semua komponen UI
const uiComponents = fs.readdirSync('./components/ui')
  .filter(file => file.endsWith('.tsx'))
  .map(file => file.replace('.tsx', ''));

console.log('🔍 Checking unused UI components...\n');

const unusedComponents = [];

uiComponents.forEach(component => {
  try {
    // Cari penggunaan komponen di seluruh project (kecuali node_modules)
    const searchCommand = `findstr /s /i /c:"${component}" *.tsx *.jsx *.ts *.js 2>nul`;
    const result = execSync(searchCommand, { encoding: 'utf8', cwd: '.' });
    
    // Filter hasil untuk mengecualikan file komponen itu sendiri
    const lines = result.split('\n').filter(line => 
      line.trim() && 
      !line.includes(`components\\ui\\${component}.tsx`) &&
      !line.includes(`components/ui/${component}.tsx`)
    );
    
    if (lines.length === 0) {
      unusedComponents.push(component);
      console.log(`❌ ${component}.tsx - NOT USED`);
    } else {
      console.log(`✅ ${component}.tsx - Used in ${lines.length} places`);
    }
  } catch (error) {
    // Jika findstr tidak menemukan hasil, komponen tidak digunakan
    unusedComponents.push(component);
    console.log(`❌ ${component}.tsx - NOT USED`);
  }
});

console.log('\n📊 Summary:');
console.log(`Total UI components: ${uiComponents.length}`);
console.log(`Used components: ${uiComponents.length - unusedComponents.length}`);
console.log(`Unused components: ${unusedComponents.length}`);

if (unusedComponents.length > 0) {
  console.log('\n🗑️  Unused components to delete:');
  unusedComponents.forEach(component => {
    console.log(`- components/ui/${component}.tsx`);
  });
  
  console.log('\n💡 To delete unused components, run:');
  unusedComponents.forEach(component => {
    console.log(`del "components\\ui\\${component}.tsx"`);
  });
}