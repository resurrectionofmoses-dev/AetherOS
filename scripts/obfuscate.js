import fs from 'fs';
import path from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const DIST_DIR = path.resolve('./dist');

// Define specific obfuscation intensities for core vs vendor assets
const CORE_OBFUSCATION_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false, // Set to false to prevent runtime freeze in development/shared previews
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false, // Prevent cross-chunk linkage breaks
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 6,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64', 'rc4'],
  stringArrayThreshold: 0.8,
  unicodeEscapeSequence: false
};

const VENDOR_OBFUSCATION_OPTIONS = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: false,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: false,
  stringArray: true,
  stringArrayThreshold: 0.5,
  unicodeEscapeSequence: false
};

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      results.push(filePath);
    }
  });
  
  return results;
}

function runObfuscation() {
  console.log('🛡️ [AETHEROS OBFUSCATOR] Initializing secure post-build integrity layer...');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist folder does not exist! Run production build first.');
    process.exit(1);
  }

  const allFiles = getFilesRecursively(DIST_DIR);
  const targetFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.cjs'));

  console.log(`🔍 [AETHEROS OBFUSCATOR] Detected ${targetFiles.length} compile targets for obfuscation.`);

  let obfuscatedCount = 0;

  targetFiles.forEach((filePath) => {
    const relativePath = path.relative(DIST_DIR, filePath);
    const code = fs.readFileSync(filePath, 'utf8');
    
    // Determine the type of bundle to apply optimal rules
    const isVendor = relativePath.includes('priority1-boot-react') || 
                     relativePath.includes('priority4-sdk-firebase') || 
                     relativePath.includes('priority4-sdk-genai') || 
                     relativePath.includes('priority4-sdk-helpers') ||
                     relativePath.includes('priority3-ui-motion') ||
                     relativePath.includes('priority3-ui-charts') ||
                     relativePath.includes('priority2-ui-common');

    const options = isVendor ? VENDOR_OBFUSCATION_OPTIONS : CORE_OBFUSCATION_OPTIONS;
    const modeLabel = isVendor ? 'VENDOR (Lightweight compatibility)' : 'CORE APPLICATION (High-intensity)';

    console.log(`⚡ [AETHEROS OBFUSCATOR] Obfuscating [${modeLabel}]: ${relativePath}...`);

    try {
      const result = JavaScriptObfuscator.obfuscate(code, options);
      fs.writeFileSync(filePath, result.getObfuscatedCode(), 'utf8');
      obfuscatedCount++;
    } catch (err) {
      console.error(`❌ [AETHEROS OBFUSCATOR] Failed to obfuscate ${relativePath}:`, err);
    }
  });

  console.log(`✅ [AETHEROS OBFUSCATOR] Security compilation finished. ${obfuscatedCount} assets successfully obfuscated.`);
}

runObfuscation();
