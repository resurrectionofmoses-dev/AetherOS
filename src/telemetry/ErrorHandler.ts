import TelemetryEngine from './TelemetryEngine';

/**
 * ErrorHandler: Comprehensive error diagnostics with root cause analysis
 * - Extracts error patterns and potential causes
 * - Suggests recovery strategies
 * - Tracks error frequency and severity
 * - Never deletes error records (append only)
 */

interface ErrorContext {
  code?: string;
  errno?: number;
  syscall?: string;
  path?: string;
  port?: number;
  address?: string;
  url?: string;
  method?: string;
  statusCode?: number;
}

interface ErrorAnalysis {
  timestamp: string;
  errorType: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rootCauses: string[];
  recoverySteps: string[];
  context: ErrorContext;
  stackTrace: string;
  frequency?: number; // How many times this error has occurred
}

export class ErrorHandler {
  private telemetry: TelemetryEngine;
  private errorHistory: Map<string, number> = new Map();
  private errorPatterns: Map<string, ErrorAnalysis> = new Map();

  constructor(telemetry: TelemetryEngine) {
    this.telemetry = telemetry;
  }

  /**
   * Analyze and handle an error
   */
  public handleError(error: Error | string, context?: ErrorContext): ErrorAnalysis {
    const analysis = this.analyzeError(error, context);
    const errorKey = this.generateErrorKey(analysis);

    // Track error frequency
    const count = (this.errorHistory.get(errorKey) || 0) + 1;
    this.errorHistory.set(errorKey, count);
    analysis.frequency = count;

    // Store pattern
    this.errorPatterns.set(errorKey, analysis);

    // Log to telemetry
    this.telemetry.log(
      'ERROR_HANDLER',
      `${analysis.errorType}: ${analysis.message}`,
      this.mapSeverityToTelemetry(analysis.severity),
      {
        rootCauses: analysis.rootCauses,
        recoverySteps: analysis.recoverySteps,
        context: analysis.context,
        frequency: analysis.frequency,
      },
      analysis.stackTrace
    );

    return analysis;
  }

  /**
   * Analyze error to determine type, severity, and recovery
   */
  private analyzeError(error: Error | string, context?: ErrorContext): ErrorAnalysis {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'string' ? '' : error.stack || '';
    const errorType = typeof error === 'string' ? 'UnknownError' : error.constructor.name;

    const analysis: ErrorAnalysis = {
      timestamp: new Date().toISOString(),
      errorType,
      message: errorMessage,
      severity: 'MEDIUM',
      rootCauses: [],
      recoverySteps: [],
      context: context || {},
      stackTrace,
    };

    // Determine severity based on error patterns
    if (
      errorMessage.includes('CRITICAL') ||
      errorMessage.includes('FATAL') ||
      errorMessage.includes('PANIC')
    ) {
      analysis.severity = 'CRITICAL';
    } else if (
      errorMessage.includes('ERROR') ||
      errorMessage.includes('EACCES') ||
      errorMessage.includes('ECONNREFUSED')
    ) {
      analysis.severity = 'HIGH';
    } else if (errorMessage.includes('WARN') || errorMessage.includes('DEPREC')) {
      analysis.severity = 'LOW';
    }

    // Analyze specific error codes
    if (context?.errno) {
      analysis.rootCauses.push(...this.analyzeErrno(context.errno));
    }

    if (context?.code) {
      analysis.rootCauses.push(...this.analyzeErrorCode(context.code));
      analysis.recoverySteps.push(...this.suggestRecovery(context.code, context));
    }

    // Generic pattern matching
    if (errorMessage.includes('ECONNREFUSED')) {
      analysis.rootCauses.push('Service or port not listening');
      analysis.recoverySteps.push(
        'Verify service is running',
        'Check network connectivity',
        'Verify port is correct'
      );
    } else if (errorMessage.includes('ENOTFOUND')) {
      analysis.rootCauses.push('DNS resolution failed');
      analysis.recoverySteps.push(
        'Check DNS configuration',
        'Verify hostname/IP address',
        'Check network connectivity'
      );
    } else if (errorMessage.includes('EACCES')) {
      analysis.rootCauses.push('Permission denied');
      analysis.recoverySteps.push(
        'Check file/directory permissions',
        'Verify user privileges',
        'Check process ownership'
      );
    } else if (errorMessage.includes('ENOMEM')) {
      analysis.rootCauses.push('Out of memory');
      analysis.recoverySteps.push(
        'Monitor system memory',
        'Optimize memory usage',
        'Increase available RAM or swap'
      );
    }

    return analysis;
  }

  /**
   * Analyze errno codes
   */
  private analyzeErrno(errno: number): string[] {
    const errorMap: Record<number, string> = {
      1: 'Operation not permitted',
      2: 'No such file or directory',
      3: 'No such process',
      4: 'Interrupted system call',
      5: 'Input/output error',
      12: 'Out of memory',
      13: 'Permission denied',
      21: 'Is a directory',
      28: 'No space left on device',
    };

    return [errorMap[errno] || `System error ${errno}`];
  }

  /**
   * Analyze named error codes
   */
  private analyzeErrorCode(code: string): string[] {
    const codeMap: Record<string, string[]> = {
      ECONNREFUSED: ['Connection refused', 'Server not running or port unreachable'],
      ENOTFOUND: ['DNS resolution failed', 'Hostname not found'],
      EACCES: ['Permission denied', 'Insufficient privileges'],
      ENOENT: ['File or directory not found', 'Path does not exist'],
      EEXIST: ['File already exists', 'Duplicate entry'],
      EISDIR: ['Is a directory', 'Expected file, got directory'],
      ENOTDIR: ['Not a directory', 'Expected directory, got file'],
      ETIMEDOUT: ['Operation timed out', 'Response took too long'],
      ENOMEM: ['Out of memory', 'System memory exhausted'],
      EAGAIN: ['Resource temporarily unavailable', 'Try again later'],
    };

    return codeMap[code] || [`Unknown error code: ${code}`];
  }

  /**
   * Suggest recovery steps based on error code
   */
  private suggestRecovery(code: string, context: ErrorContext): string[] {
    const steps: string[] = [];

    switch (code) {
      case 'ECONNREFUSED':
        if (context.port) steps.push(`Check if service is listening on port ${context.port}`);
        steps.push('Review firewall rules', 'Check service logs');
        break;
      case 'ENOTFOUND':
        steps.push('Verify DNS configuration', 'Check /etc/hosts file');
        break;
      case 'EACCES':
        steps.push('Review file permissions', 'Check user capabilities');
        break;
      case 'ENOMEM':
        steps.push('Check system memory', 'Kill non-essential processes', 'Increase swap');
        break;
      case 'ETIMEDOUT':
        steps.push('Increase timeout value', 'Check network latency', 'Review service performance');
        break;
    }

    return steps;
  }

  /**
   * Map error severity to telemetry severity
   */
  private mapSeverityToTelemetry(severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): 'WARN' | 'ERROR' | 'CRITICAL' {
    switch (severity) {
      case 'LOW':
        return 'WARN';
      case 'MEDIUM':
      case 'HIGH':
        return 'ERROR';
      case 'CRITICAL':
        return 'CRITICAL';
    }
  }

  /**
   * Generate unique key for error tracking
   */
  private generateErrorKey(analysis: ErrorAnalysis): string {
    return `${analysis.errorType}:${analysis.message}`.substring(0, 100);
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number;
    uniqueErrors: number;
    errorFrequencies: Array<{ error: string; count: number }>;
  } {
    const frequencies = Array.from(this.errorHistory.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalErrors: Array.from(this.errorHistory.values()).reduce((a, b) => a + b, 0),
      uniqueErrors: this.errorHistory.size,
      errorFrequencies: frequencies,
    };
  }

  /**
   * Clear error history (append only - creates archive first)
   */
  public archiveAndReset(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archive = {
      timestamp,
      statistics: this.getErrorStats(),
      patterns: Array.from(this.errorPatterns.values()),
    };

    // Log the archive event
    this.telemetry.log(
      'ERROR_ARCHIVE',
      `Archived ${this.errorHistory.size} unique error patterns`,
      'INFO',
      archive
    );

    // Reset for new session (old data preserved in telemetry logs)
    this.errorHistory.clear();
    this.errorPatterns.clear();
  }
}

export default ErrorHandler;
