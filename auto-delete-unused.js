const fs = require('fs');
const path = require('path');

// Daftar komponen yang tidak digunakan (dari hasil check-unused.js)
const unusedComponents = [
  'alert',
  'badge', 
  'breadcrumb',
  'button',
  'calendar',
  'card',
  'checkbox',
  'command',
  'dialog',
  'form',
  'input',
  'label',
  'menubar',
  'pagination',
  'popover',
  'progress',
  'resizable',
  'select',
  'separator',
  'sheet',
  'sidebar',
  'slider',
  'switch',
  'table',
  'tabs',
  'textarea',
  'toggle',
  'tooltip'
];

console.log('🗑️  Starting auto-delete unused UI components...\n');

let deletedCount = 0;
let errorCount = 0;

unusedComponents.forEach(component => {
  const filePath = path.join('components', 'ui', `${component}.tsx`);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${filePath}`);
      deletedCount++;
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error deleting ${filePath}: ${error.message}`);
    errorCount++;
  }
});

console.log('\n📊 Deletion Summary:');
console.log(`Successfully deleted: ${deletedCount} files`);
console.log(`Errors: ${errorCount} files`);
console.log(`Total processed: ${unusedComponents.length} files`);

if (deletedCount > 0) {
  console.log('\n✨ Unused UI components have been deleted!');
  console.log('💡 Run "npm run build" or "pnpm run build" to test your build.');
}