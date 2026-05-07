import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TelemetryEngine: Core logging system with integrity verification
 * - All logs backed up to EXTERNAL D:\ drive
 * - SHA256 checksums for data integrity
 * - Session management and append-only mode
 * - Never delete, always preserve history
 */

interface TelemetryEvent {
  timestamp: string;
  sessionId: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  category: string;
  message: string;
  data?: Record<string, any>;
  stackTrace?: string;
  checksum?: string;
}

interface TelemetryConfig {
  sessionId: string;
  localPath: string;
  backupPath: string; // D:\ EXTERNAL
  enableBackup: boolean;
  maxLogSize: number; // bytes before rotation
}

export class TelemetryEngine {
  private config: TelemetryConfig;
  private logBuffer: TelemetryEvent[] = [];
  private sessionStartTime: Date;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = {
      sessionId: crypto.randomBytes(16).toString('hex'),
      localPath: config.localPath || './logs',
      backupPath: config.backupPath || 'D:\\backups\\telemetry',
      enableBackup: config.enableBackup !== false,
      maxLogSize: config.maxLogSize || 10 * 1024 * 1024, // 10MB
    };

    this.sessionStartTime = new Date();
    this.initializePaths();
  }

  private initializePaths(): void {
    // Ensure local log directory exists
    if (!fs.existsSync(this.config.localPath)) {
      fs.mkdirSync(this.config.localPath, { recursive: true });
    }

    // Attempt to ensure backup path exists (may fail if D:\ not mounted)
    try {
      if (this.config.enableBackup && !fs.existsSync(this.config.backupPath)) {
        fs.mkdirSync(this.config.backupPath, { recursive: true });
      }
    } catch (error) {
      console.warn(`⚠️ Warning: Cannot initialize backup path ${this.config.backupPath}`);
    }
  }

  /**
   * Generate SHA256 checksum for data integrity
   */
  private generateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Log an event with automatic severity detection
   */
  public log(
    category: string,
    message: string,
    severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' = 'INFO',
    data?: Record<string, any>,
    stackTrace?: string
  ): void {
    const event: TelemetryEvent = {
      timestamp: new Date().toISOString(),
      sessionId: this.config.sessionId,
      severity,
      category,
      message,
      data,
      stackTrace,
    };

    // Add checksum for integrity verification
    const eventString = JSON.stringify(event);
    event.checksum = this.generateChecksum(eventString);

    this.logBuffer.push(event);

    // Flush if buffer reaches threshold
    if (this.logBuffer.length >= 100) {
      this.flush();
    }

    // Console output with color coding
    this.printConsole(event);
  }

  private printConsole(event: TelemetryEvent): void {
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      WARN: '\x1b[33m',    // Yellow
      ERROR: '\x1b[31m',   // Red
      CRITICAL: '\x1b[41m', // Red background
    };
    const reset = '\x1b[0m';

    const color = colors[event.severity] || colors.INFO;
    console.log(
      `${color}[${event.severity}]${reset} [${event.timestamp}] ${event.category}: ${event.message}`
    );
  }

  /**
   * Flush logs to disk (local + backup)
   */
  public flush(): void {
    if (this.logBuffer.length === 0) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `telemetry-${timestamp}.jsonl`;
    const localFilePath = path.join(this.config.localPath, filename);

    // Write as JSON Lines (one JSON object per line)
    const logContent = this.logBuffer.map(e => JSON.stringify(e)).join('\n');

    try {
      // Write to local path
      fs.appendFileSync(localFilePath, logContent + '\n', 'utf8');

      // Write to backup path if enabled
      if (this.config.enableBackup) {
        try {
          const backupFilePath = path.join(this.config.backupPath, filename);
          fs.appendFileSync(backupFilePath, logContent + '\n', 'utf8');
        } catch (backupError) {
          console.warn(`⚠️ Backup write failed: ${backupError}`);
        }
      }

      // Clear buffer after successful write
      this.logBuffer = [];
    } catch (error) {
      console.error(`❌ Telemetry flush failed: ${error}`);
    }
  }

  /**
   * Get session information
   */
  public getSessionInfo(): {
    sessionId: string;
    startTime: Date;
    uptime: number; // milliseconds
    eventCount: number;
    bufferedEvents: number;
  } {
    return {
      sessionId: this.config.sessionId,
      startTime: this.sessionStartTime,
      uptime: Date.now() - this.sessionStartTime.getTime(),
      eventCount: this.logBuffer.length,
      bufferedEvents: this.logBuffer.length,
    };
  }

  /**
   * Verify log integrity using checksums
   */
  public verifyLogIntegrity(logFilePath: string): boolean {
    try {
      const content = fs.readFileSync(logFilePath, 'utf8');
      const lines = content.trim().split('\n');

      let integrityOk = true;
      for (const line of lines) {
        if (!line) continue;
        const event = JSON.parse(line) as TelemetryEvent;
        const storedChecksum = event.checksum;

        // Remove checksum and recalculate
        delete event.checksum;
        const calculatedChecksum = this.generateChecksum(JSON.stringify(event));

        if (storedChecksum !== calculatedChecksum) {
          console.warn(`❌ Checksum mismatch: ${event.timestamp}`);
          integrityOk = false;
        }
      }

      return integrityOk;
    } catch (error) {
      console.error(`❌ Integrity verification failed: ${error}`);
      return false;
    }
  }

  /**
   * Clean shutdown - ensure all logs are flushed
   */
  public shutdown(): void {
    this.flush();
    console.log(`✅ Telemetry engine shutdown. Session: ${this.config.sessionId}`);
  }
}

export default TelemetryEngine;
