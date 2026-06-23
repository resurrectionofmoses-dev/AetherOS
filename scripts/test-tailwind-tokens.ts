// scripts/test-tailwind-tokens.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * Programmatic test script to assert that Tailwind design tokens
 * (specifically sovereign-gold) are defined in both tailwind.config.ts
 * and index.html (for Play CDN).
 */
function runTests() {
  console.log("=== RUNNING TAILWIND DESIGN TOKEN TESTS ===");
  let failures = 0;

  // 1. Check tailwind.config.ts
  const configPath = path.resolve(process.cwd(), 'tailwind.config.ts');
  if (!fs.existsSync(configPath)) {
    console.error("❌ Test Failed: tailwind.config.ts does not exist!");
    failures++;
  } else {
    const configContent = fs.readFileSync(configPath, 'utf8');
    if (!configContent.includes('sovereign-gold')) {
      console.error("❌ Test Failed: 'sovereign-gold' token is missing in tailwind.config.ts!");
      failures++;
    } else {
      console.log("✅ Passed: 'sovereign-gold' exists in tailwind.config.ts");
    }
  }

  // 2. Check index.html CDN integration
  const htmlPath = path.resolve(process.cwd(), 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.error("❌ Test Failed: index.html does not exist!");
    failures++;
  } else {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const hasConfig = htmlContent.includes('tailwind.config =') || htmlContent.includes('tailwind.config=');
    if (!hasConfig) {
      console.error("❌ Test Failed: tailwind.config configuration is missing in index.html!");
      failures++;
    } else if (!htmlContent.includes('sovereign-gold')) {
      console.error("❌ Test Failed: 'sovereign-gold' token is missing in index.html's Tailwind CDN configuration!");
      failures++;
    } else {
      console.log("✅ Passed: 'sovereign-gold' exists in index.html configuration");
    }
  }

  if (failures > 0) {
    console.error(`\n❌ Tests completed with ${failures} failure(s).`);
    process.exit(1);
  } else {
    console.log("\n🎉 All tests passed successfully!");
    process.exit(0);
  }
}

runTests();
