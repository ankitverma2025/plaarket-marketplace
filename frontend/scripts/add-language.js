#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const scriptDir = __dirname;
const projectRoot = path.join(scriptDir, '..');
const localesDir = path.join(projectRoot, 'public', 'locales');

// Language codes and names
const languages = {
  'en': 'English',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi',
  'ur': 'Urdu',
  'or': 'Odia',
  'as': 'Assamese',
  'ne': 'Nepali',
  'si': 'Sinhala'
};

function addLanguage(langCode) {
  if (!languages[langCode]) {
    console.error(`❌ Language code '${langCode}' not supported.`);
    console.log('Supported languages:', Object.keys(languages).join(', '));
    process.exit(1);
  }

  const langDir = path.join(localesDir, langCode);
  const langFile = path.join(langDir, 'common.json');

  // Create directory if it doesn't exist
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
    console.log(`✅ Created directory: ${langDir}`);
  }

  // Check if translation file already exists
  if (fs.existsSync(langFile)) {
    console.log(`⚠️  Translation file already exists: ${langFile}`);
    return;
  }

  // Read English file as template
  const englishFile = path.join(localesDir, 'en', 'common.json');
  if (!fs.existsSync(englishFile)) {
    console.error(`❌ English template file not found: ${englishFile}`);
    process.exit(1);
  }

  try {
    const englishContent = JSON.parse(fs.readFileSync(englishFile, 'utf8'));
    
    // Create a placeholder version with English text as fallback
    const placeholderContent = JSON.stringify(englishContent, null, 2);
    
    fs.writeFileSync(langFile, placeholderContent);
    console.log(`✅ Created translation file: ${langFile}`);
    console.log(`📝 Please translate the content in: ${langFile}`);
    console.log(`🌐 Language: ${languages[langCode]} (${langCode})`);
    
  } catch (error) {
    console.error(`❌ Error creating translation file:`, error.message);
    process.exit(1);
  }
}

function listLanguages() {
  console.log('🌍 Available languages:');
  Object.entries(languages).forEach(([code, name]) => {
    const langDir = path.join(localesDir, code);
    const langFile = path.join(langDir, 'common.json');
    const exists = fs.existsSync(langFile);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${code} - ${name}`);
  });
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🚀 Language Management Script');
    console.log('');
    console.log('Usage:');
    console.log('  node add-language.js <language_code>  - Add a new language');
    console.log('  node add-language.js --list          - List all languages');
    console.log('');
    console.log('Examples:');
    console.log('  node add-language.js hi              - Add Hindi');
    console.log('  node add-language.js bn              - Add Bengali');
    console.log('  node add-language.js --list          - List all languages');
    return;
  }

  if (args[0] === '--list') {
    listLanguages();
    return;
  }

  const langCode = args[0].toLowerCase();
  addLanguage(langCode);
}

if (require.main === module) {
  main();
}

module.exports = { addLanguage, languages };
