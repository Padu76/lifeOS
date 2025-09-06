#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const REQUIRED_DOCS = [
  'README.md',
  'CONTRIBUTING.md', 
  'packages/ui/README.md',
  'packages/shared/README.md',
  'packages/dashboard/README.md',
  'packages/analytics/README.md',
  'packages/screens/README.md',
];

const COMPONENT_DIRS = [
  'packages/ui',
  'packages/shared', 
  'packages/dashboard',
  'packages/analytics',
  'packages/screens',
];

let errors = [];
let warnings = [];

function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing required documentation: ${filePath}`);
    return false;
  }
  return true;
}

function checkReadmeContent(filePath) {
  if (!checkFileExists(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const requiredSections = ['Installation', 'Usage', 'API'];
  
  requiredSections.forEach(section => {
    if (!content.includes(section)) {
      warnings.push(`${filePath} missing recommended section: ${section}`);
    }
  });
  
  if (content.length < 100) {
    warnings.push(`${filePath} seems too short (${content.length} chars)`);
  }
}

function getJSDocComments(content) {
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  return content.match(jsdocRegex) || [];
}

function checkComponentDocumentation(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath, { recursive: true })
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
    .filter(file => !file.includes('.stories.') && !file.includes('.test.'));
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for exported components without JSDoc
    const exportMatches = content.match(/export\s+(const|function|class)\s+([A-Z]\w+)/g);
    if (exportMatches) {
      exportMatches.forEach(match => {
        const componentName = match.split(/\s+/).pop();
        const jsdocs = getJSDocComments(content);
        
        const hasJSDoc = jsdocs.some(doc => 
          content.indexOf(doc) < content.indexOf(match)
        );
        
        if (!hasJSDoc && componentName.match(/^[A-Z]/)) {
          warnings.push(`Component ${componentName} in ${file} missing JSDoc documentation`);
        }
      });
    }
    
    // Check for TypeScript interfaces without docs
    const interfaceMatches = content.match(/export\s+interface\s+(\w+)/g);
    if (interfaceMatches) {
      interfaceMatches.forEach(match => {
        const interfaceName = match.split(/\s+/).pop();
        const jsdocs = getJSDocComments(content);
        
        const hasJSDoc = jsdocs.some(doc => 
          content.indexOf(doc) < content.indexOf(match)
        );
        
        if (!hasJSDoc) {
          warnings.push(`Interface ${interfaceName} in ${file} missing JSDoc documentation`);
        }
      });
    }
  });
}

function generateMissingDocs() {
  console.log('\n📝 Generating missing documentation files...\n');
  
  REQUIRED_DOCS.forEach(docPath => {
    if (!fs.existsSync(docPath)) {
      const dir = path.dirname(docPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const packageName = docPath.includes('packages/') 
        ? docPath.split('/')[1] 
        : 'LifeOS';
      
      const template = `# ${packageName}

## Overview
${packageName === 'LifeOS' ? 'AI-powered personal wellness platform' : `${packageName} package for LifeOS`}

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`typescript
// Example usage
\`\`\`

## API Reference
Documentation for components and utilities.

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
`;
      
      fs.writeFileSync(docPath, template);
      console.log(`✅ Generated ${docPath}`);
    }
  });
}

// Main execution
console.log('🔍 Checking documentation...\n');

// Check required documentation files
REQUIRED_DOCS.forEach(checkFileExists);
REQUIRED_DOCS.forEach(checkReadmeContent);

// Check component documentation
COMPONENT_DIRS.forEach(checkComponentDocumentation);

// Report results
console.log('\n📊 Documentation Check Results:\n');

if (errors.length > 0) {
  console.log('❌ Errors:');
  errors.forEach(error => console.log(`  - ${error}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`  - ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All documentation checks passed!');
  process.exit(0);
} else {
  console.log(`\n📈 Summary: ${errors.length} errors, ${warnings.length} warnings`);
  
  if (process.argv.includes('--fix')) {
    generateMissingDocs();
  } else {
    console.log('\n💡 Run with --fix to auto-generate missing documentation files');
  }
  
  if (errors.length > 0) {
    process.exit(1);
  }
}
