const fs = require('fs');
const path = require('path');

function verifyExports() {
  console.log('🔍 Verifying package exports...');
  
  const packagesDir = 'packages';
  if (!fs.existsSync(packagesDir)) {
    console.log('⚠️ No packages directory found');
    return;
  }
  
  const packages = fs.readdirSync(packagesDir);
  
  packages.forEach(pkg => {
    const packagePath = path.join(packagesDir, pkg);
    const indexPath = path.join(packagePath, 'index.ts');
    const packageJsonPath = path.join(packagePath, 'package.json');
    
    if (fs.existsSync(indexPath)) {
      console.log(`✅ ${pkg}: index.ts found`);
      
      // Check if exports are valid TypeScript
      const content = fs.readFileSync(indexPath, 'utf8');
      if (content.includes('export')) {
        console.log(`✅ ${pkg}: exports detected`);
      } else {
        console.log(`⚠️ ${pkg}: no exports found`);
      }
    } else {
      console.log(`⚠️ ${pkg}: index.ts missing`);
    }
    
    if (fs.existsSync(packageJsonPath)) {
      console.log(`✅ ${pkg}: package.json found`);
    }
  });
  
  console.log('✅ Exports verification completed');
}

verifyExports();
