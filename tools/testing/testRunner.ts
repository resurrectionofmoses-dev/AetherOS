/**
 * Test Runner Framework
 * Provides unit and integration testing capabilities
 */

export interface TestCase {
  name: string;
  fn: () => Promise<void> | void;
  timeout?: number;
  skip?: boolean;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
  beforeEach?: () => Promise<void> | void;
  afterEach?: () => Promise<void> | void;
}

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: Error;
}

export interface SuiteResult {
  suiteName: string;
  results: TestResult[];
  total: number;
  passed: number;
  failed: number;
  duration: number;
}

export class TestRunner {
  private suites: TestSuite[] = [];

  describe(name: string, fn: () => void): void {
    const suite: TestSuite = {
      name,
      tests: []
    };

    const context = {
      test: (testName: string, testFn: () => Promise<void> | void) => {
        suite.tests.push({ name: testName, fn: testFn });
      },
      skip: (testName: string) => {
        suite.tests.push({ name: testName, fn: () => {}, skip: true });
      },
      before: (fn: () => Promise<void> | void) => {
        suite.beforeEach = fn;
      },
      after: (fn: () => Promise<void> | void) => {
        suite.afterEach = fn;
      }
    };

    fn.call(context);
    this.suites.push(suite);
  }

  async run(): Promise<SuiteResult[]> {
    const results: SuiteResult[] = [];

    for (const suite of this.suites) {
      const suiteStart = performance.now();
      const testResults: TestResult[] = [];

      for (const test of suite.tests) {
        if (test.skip) {
          testResults.push({
            name: test.name,
            passed: true,
            duration: 0
          });
          continue;
        }

        const testStart = performance.now();
        try {
          suite.beforeEach?.();
          await test.fn();
          suite.afterEach?.();

          testResults.push({
            name: test.name,
            passed: true,
            duration: performance.now() - testStart
          });
        } catch (error) {
          testResults.push({
            name: test.name,
            passed: false,
            duration: performance.now() - testStart,
            error: error as Error
          });
        }
      }

      const passed = testResults.filter(r => r.passed).length;
      results.push({
        suiteName: suite.name,
        results: testResults,
        total: testResults.length,
        passed,
        failed: testResults.length - passed,
        duration: performance.now() - suiteStart
      });
    }

    return results;
  }
}

// Assertion helpers
export class Assert {
  static equal(actual: any, expected: any, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected} but got ${actual}`);
    }
  }

  static deepEqual(actual: any, expected: any, message?: string): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Objects are not deeply equal`);
    }
  }

  static throws(fn: () => void, message?: string): void {
    try {
      fn();
      throw new Error(message || 'Expected function to throw');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Expected function to throw')) {
        throw error;
      }
    }
  }

  static ok(value: any, message?: string): void {
    if (!value) {
      throw new Error(message || 'Expected value to be truthy');
    }
  }

  static fail(message?: string): void {
    throw new Error(message || 'Test failed');
  }
}

export const testRunner = new TestRunner();
