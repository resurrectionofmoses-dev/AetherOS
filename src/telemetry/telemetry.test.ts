import TelemetryEngine from './TelemetryEngine';
import ErrorHandler from './ErrorHandler';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Telemetry Test Suite
 * Tests all telemetry functionality before production use
 * Each test verifies code robustness and correct behavior
 */

const TEST_LOG_DIR = './test_logs';

// Utility: Clean up test files
function cleanupTestFiles() {
  if (fs.existsSync(TEST_LOG_DIR)) {
    const files = fs.readdirSync(TEST_LOG_DIR);
    files.forEach(file => {
      fs.unlinkSync(path.join(TEST_LOG_DIR, file));
    });
  }
}

describe('TelemetryEngine', () => {
  let telemetry: TelemetryEngine;

  beforeEach(() => {
    telemetry = new TelemetryEngine({
      localPath: TEST_LOG_DIR,
      backupPath: './test_backup',
      enableBackup: false, // Disable backup for tests
    });
  });

  afterEach(() => {
    telemetry.shutdown();
    cleanupTestFiles();
  });

  /**
   * Test 1: Basic event logging
   */
  test('should log events correctly', () => {
    telemetry.log('TEST', 'Test message', 'INFO');
    telemetry.log('TEST', 'Warning message', 'WARN');
    telemetry.log('TEST', 'Error message', 'ERROR');

    const sessionInfo = telemetry.getSessionInfo();
    expect(sessionInfo.eventCount).toBe(3);
  });

  /**
   * Test 2: Event severity levels
   */
  test('should handle all severity levels', () => {
    const severities: Array<'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'> = [
      'INFO',
      'WARN',
      'ERROR',
      'CRITICAL',
    ];

    severities.forEach(severity => {
      telemetry.log('TEST', `Testing ${severity}`, severity);
    });

    const sessionInfo = telemetry.getSessionInfo();
    expect(sessionInfo.eventCount).toBe(4);
  });

  /**
   * Test 3: Checksum generation consistency
   */
  test('should generate consistent checksums', () => {
    telemetry.log('TEST', 'Checksum test', 'INFO', { data: 'value' });
    telemetry.flush();

    const logFile = fs.readdirSync(TEST_LOG_DIR)[0];
    const logPath = path.join(TEST_LOG_DIR, logFile);

    const isValid = telemetry.verifyLogIntegrity(logPath);
    expect(isValid).toBe(true);
  });

  /**
   * Test 4: Buffer flush on size threshold
   */
  test('should flush logs when buffer reaches threshold', () => {
    // Fill buffer with many events
    for (let i = 0; i < 100; i++) {
      telemetry.log('BUFFER_TEST', `Event ${i}`, 'INFO');
    }

    telemetry.flush();

    const logFiles = fs.readdirSync(TEST_LOG_DIR);
    expect(logFiles.length).toBeGreaterThan(0);

    // Verify log file contains data
    const logContent = fs.readFileSync(path.join(TEST_LOG_DIR, logFiles[0]), 'utf8');
    expect(logContent.length).toBeGreaterThan(0);
  });

  /**
   * Test 5: Session information accuracy
   */
  test('should track session information accurately', () => {
    const sessionInfo = telemetry.getSessionInfo();

    expect(sessionInfo.sessionId).toBeDefined();
    expect(sessionInfo.sessionId.length).toBe(32); // 16 bytes = 32 hex chars
    expect(sessionInfo.startTime).toBeInstanceOf(Date);
    expect(sessionInfo.uptime).toBeGreaterThan(0);
  });

  /**
   * Test 6: Event data serialization
   */
  test('should handle complex event data', () => {
    const complexData = {
      nested: {
        array: [1, 2, 3],
        object: { key: 'value' },
      },
      timestamp: new Date().toISOString(),
    };

    telemetry.log('COMPLEX', 'Complex data test', 'INFO', complexData);
    telemetry.flush();

    const logFiles = fs.readdirSync(TEST_LOG_DIR);
    const logContent = fs.readFileSync(path.join(TEST_LOG_DIR, logFiles[0]), 'utf8');
    const event = JSON.parse(logContent.split('\n')[0]);

    expect(event.data).toEqual(complexData);
  });

  /**
   * Test 7: Stack trace handling
   */
  test('should preserve stack traces', () => {
    const error = new Error('Test error');
    telemetry.log('STACK_TEST', error.message, 'ERROR', undefined, error.stack);
    telemetry.flush();

    const logFiles = fs.readdirSync(TEST_LOG_DIR);
    const logContent = fs.readFileSync(path.join(TEST_LOG_DIR, logFiles[0]), 'utf8');
    const event = JSON.parse(logContent.split('\n')[0]);

    expect(event.stackTrace).toBeDefined();
    expect(event.stackTrace.length).toBeGreaterThan(0);
  });

  /**
   * Test 8: Append-only mode verification
   */
  test('should append logs without deleting previous data', () => {
    telemetry.log('APPEND_TEST_1', 'First batch', 'INFO');
    telemetry.flush();

    // Get file size after first flush
    const logFiles1 = fs.readdirSync(TEST_LOG_DIR);
    const firstLogPath = path.join(TEST_LOG_DIR, logFiles1[0]);
    const size1 = fs.statSync(firstLogPath).size;

    // Add more data
    telemetry.log('APPEND_TEST_2', 'Second batch', 'INFO');
    telemetry.flush();

    // File should have grown (appended, not replaced)
    const size2 = fs.statSync(firstLogPath).size;
    expect(size2).toBeGreaterThan(size1);
  });
});

describe('ErrorHandler', () => {
  let telemetry: TelemetryEngine;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    telemetry = new TelemetryEngine({
      localPath: TEST_LOG_DIR,
      enableBackup: false,
    });
    errorHandler = new ErrorHandler(telemetry);
  });

  afterEach(() => {
    telemetry.shutdown();
    cleanupTestFiles();
  });

  /**
   * Test 9: Basic error analysis
   */
  test('should analyze errors correctly', () => {
    const error = new Error('Test error message');
    const analysis = errorHandler.handleError(error);

    expect(analysis.errorType).toBe('Error');
    expect(analysis.message).toBe('Test error message');
    expect(analysis.severity).toBeDefined();
    expect(analysis.rootCauses).toBeDefined();
    expect(analysis.recoverySteps).toBeDefined();
  });

  /**
   * Test 10: Error severity detection
   */
  test('should detect error severity correctly', () => {
    const criticalError = new Error('CRITICAL: System failure');
    const criticalAnalysis = errorHandler.handleError(criticalError);
    expect(criticalAnalysis.severity).toBe('CRITICAL');

    const lowError = new Error('DEPRECATED: Use new function');
    const lowAnalysis = errorHandler.handleError(lowError);
    expect(lowAnalysis.severity).toBe('LOW');
  });

  /**
   * Test 11: Error code analysis (ECONNREFUSED)
   */
  test('should analyze ECONNREFUSED errors', () => {
    const analysis = errorHandler.handleError('Connection refused', {
      code: 'ECONNREFUSED',
      port: 3000,
    });

    expect(analysis.rootCauses.length).toBeGreaterThan(0);
    expect(analysis.recoverySteps.length).toBeGreaterThan(0);
    expect(analysis.rootCauses.join()).toContain('Connection refused');
  });

  /**
   * Test 12: Error code analysis (EACCES)
   */
  test('should analyze EACCES errors', () => {
    const analysis = errorHandler.handleError('Permission denied', {
      code: 'EACCES',
      path: '/etc/passwd',
    });

    expect(analysis.rootCauses.join()).toContain('Permission denied');
    expect(analysis.recoverySteps.join()).toContain('permissions');
  });

  /**
   * Test 13: Error frequency tracking
   */
  test('should track error frequency', () => {
    errorHandler.handleError('Repeated error');
    errorHandler.handleError('Repeated error');
    errorHandler.handleError('Different error');

    const stats = errorHandler.getErrorStats();

    expect(stats.totalErrors).toBe(3);
    expect(stats.uniqueErrors).toBe(2);
    expect(stats.errorFrequencies[0].count).toBe(2);
  });

  /**
   * Test 14: Error statistics accuracy
   */
  test('should provide accurate error statistics', () => {
    for (let i = 0; i < 5; i++) {
      errorHandler.handleError('Error A');
    }
    for (let i = 0; i < 3; i++) {
      errorHandler.handleError('Error B');
    }

    const stats = errorHandler.getErrorStats();

    expect(stats.totalErrors).toBe(8);
    expect(stats.uniqueErrors).toBe(2);
  });

  /**
   * Test 15: Archive and reset functionality
   */
  test('should archive errors without losing data', () => {
    errorHandler.handleError('Error for archive');
    const statsBefore = errorHandler.getErrorStats();

    errorHandler.archiveAndReset();
    const statsAfter = errorHandler.getErrorStats();

    // Data should be reset but telemetry should have archived it
    expect(statsAfter.totalErrors).toBe(0);
    expect(statsBefore.totalErrors).toBeGreaterThan(0);

    // Verify archive was logged
    telemetry.flush();
    const logFiles = fs.readdirSync(TEST_LOG_DIR);
    expect(logFiles.length).toBeGreaterThan(0);
  });
});

/**
 * Integration Tests
 */
describe('Telemetry Integration', () => {
  let telemetry: TelemetryEngine;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    telemetry = new TelemetryEngine({
      localPath: TEST_LOG_DIR,
      enableBackup: false,
    });
    errorHandler = new ErrorHandler(telemetry);
  });

  afterEach(() => {
    telemetry.shutdown();
    cleanupTestFiles();
  });

  /**
   * Test 16: Full error handling workflow
   */
  test('should handle complete error workflow', () => {
    try {
      throw new Error('Intentional test error');
    } catch (error) {
      errorHandler.handleError(error as Error);
    }

    telemetry.flush();

    const logFiles = fs.readdirSync(TEST_LOG_DIR);
    expect(logFiles.length).toBeGreaterThan(0);

    // Verify integrity
    const logPath = path.join(TEST_LOG_DIR, logFiles[0]);
    const isValid = telemetry.verifyLogIntegrity(logPath);
    expect(isValid).toBe(true);
  });

  /**
   * Test 17: Session lifecycle
   */
  test('should maintain session lifecycle', () => {
    const sessionBefore = telemetry.getSessionInfo();

    telemetry.log('LIFECYCLE', 'Testing session', 'INFO');
    telemetry.flush();

    const sessionAfter = telemetry.getSessionInfo();

    // Session ID should remain the same
    expect(sessionAfter.sessionId).toBe(sessionBefore.sessionId);
    expect(sessionAfter.uptime).toBeGreaterThanOrEqual(sessionBefore.uptime);
  });
});
