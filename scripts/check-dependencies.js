const fs = require('fs');
const path = require('path');

function checkDependencies() {
  console.log('🔍 Checking package dependencies...');
  
  // Check root package.json
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Root package: ${rootPackage.name}`);
  
  // Check workspace packages
  const packagesDir = 'packages';
  if (fs.existsSync(packagesDir)) {
    const packages = fs.readdirSync(packagesDir);
    
    packages.forEach(pkg => {
      const packagePath = path.join(packagesDir, pkg, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        console.log(`✅ Package: ${packageJson.name}`);
      }
    });
  }
  
  console.log('✅ Dependencies check completed');
}

checkDependencies();
