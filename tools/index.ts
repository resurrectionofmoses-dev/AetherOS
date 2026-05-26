/**
 * AetherOS Tools - Central Hub
 * Unified exports for all development, testing, security, monitoring, and DevOps tools
 */

export { AetherOSDebugger, debugger } from './development/debugger';
export { CodeAnalyzer, codeAnalyzer } from './development/codeAnalyzer';

export { TestRunner, Assert, testRunner } from './testing/testRunner';

export { InteractiveTutorial, interactiveTutorial } from './education/interactiveTutorial';

export { VulnerabilityScanner, vulnerabilityScanner } from './security/vulnerabilityScanner';

export { PerformanceMonitor, Timer, performanceMonitor } from './monitoring/performanceMonitor';

export { DatabaseManager, databaseManager } from './data/databaseManager';

export { BuildPipeline, buildPipeline } from './devops/buildPipeline';

/**
 * AetherOSTools
 * Unified interface for all AetherOS tools
 */
export class AetherOSTools {
  static init() {
    console.log('✓ AetherOS Tools initialized');
    console.log('Available tools:');
    console.log('  - Debugger (development)');
    console.log('  - Code Analyzer (development)');
    console.log('  - Test Runner (testing)');
    console.log('  - Interactive Tutorial (education)');
    console.log('  - Vulnerability Scanner (security)');
    console.log('  - Performance Monitor (monitoring)');
    console.log('  - Database Manager (data)');
    console.log('  - Build Pipeline (DevOps)');
  }

  static getToolsList() {
    return [
      {
        category: 'Development',
        tools: ['Debugger', 'Code Analyzer']
      },
      {
        category: 'Testing',
        tools: ['Test Runner']
      },
      {
        category: 'Education',
        tools: ['Interactive Tutorial']
      },
      {
        category: 'Security',
        tools: ['Vulnerability Scanner']
      },
      {
        category: 'Monitoring',
        tools: ['Performance Monitor']
      },
      {
        category: 'Data Management',
        tools: ['Database Manager']
      },
      {
        category: 'DevOps',
        tools: ['Build Pipeline']
      }
    ];
  }
}
