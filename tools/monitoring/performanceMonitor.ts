/**
 * Performance Monitoring Tool
 * Tracks metrics, latency, memory usage, and performance issues
 */

export interface PerformanceMetric {
  name: string;
  timestamp: Date;
  value: number;
  unit: string;
  threshold?: number;
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  value: number;
  threshold: number;
}

export interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  size: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private requestMetrics: RequestMetrics[] = [];
  
  private readonly MEMORY_THRESHOLD = 512; // MB
  private readonly CPU_THRESHOLD = 80; // %
  private readonly RESPONSE_TIME_THRESHOLD = 1000; // ms

  recordMetric(name: string, value: number, unit: string, threshold?: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      threshold,
      timestamp: new Date()
    };

    this.metrics.push(metric);

    if (threshold && value > threshold) {
      this.createAlert(name, value, threshold);
    }

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  recordRequest(path: string, method: string, statusCode: number, duration: number, size: number): void {
    const requestMetric: RequestMetrics = {
      path,
      method,
      statusCode,
      duration,
      size,
      timestamp: new Date()
    };

    this.requestMetrics.push(requestMetric);

    if (duration > this.RESPONSE_TIME_THRESHOLD) {
      this.createAlert('response-time', duration, this.RESPONSE_TIME_THRESHOLD);
    }

    // Keep only last 500 requests
    if (this.requestMetrics.length > 500) {
      this.requestMetrics = this.requestMetrics.slice(-500);
    }
  }

  private createAlert(metric: string, value: number, threshold: number): void {
    const severity = value > threshold * 1.5 ? 'critical' : 'warning';
    
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}`,
      metric,
      severity,
      message: `${metric} exceeded threshold: ${value} > ${threshold}`,
      timestamp: new Date(),
      value,
      threshold
    };

    this.alerts.push(alert);
    this.emit('alert', alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  private emit(event: string, data: any): void {
    // Simple event emission
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent(event, { detail: data });
      window.dispatchEvent(customEvent);
    }
  }

  getMetrics(name?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = this.metrics;
    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }
    return filtered.slice(-limit);
  }

  getAverageResponseTime(path?: string): number {
    let requests = this.requestMetrics;
    if (path) {
      requests = requests.filter(r => r.path === path);
    }

    if (requests.length === 0) return 0;
    const sum = requests.reduce((acc, r) => acc + r.duration, 0);
    return sum / requests.length;
  }

  getErrorRate(): number {
    if (this.requestMetrics.length === 0) return 0;
    const errors = this.requestMetrics.filter(r => r.statusCode >= 400).length;
    return (errors / this.requestMetrics.length) * 100;
  }

  getP95ResponseTime(path?: string): number {
    let requests = this.requestMetrics.map(r => r.duration);
    if (path) {
      requests = this.requestMetrics
        .filter(r => r.path === path)
        .map(r => r.duration);
    }

    if (requests.length === 0) return 0;
    requests.sort((a, b) => a - b);
    const index = Math.ceil(requests.length * 0.95) - 1;
    return requests[index] || 0;
  }

  getRecentAlerts(limit: number = 10): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  generateReport(): string {
    let report = `Performance Report\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;

    report += `Request Statistics:\n`;
    report += `  Total Requests: ${this.requestMetrics.length}\n`;
    report += `  Average Response Time: ${this.getAverageResponseTime().toFixed(2)}ms\n`;
    report += `  P95 Response Time: ${this.getP95ResponseTime().toFixed(2)}ms\n`;
    report += `  Error Rate: ${this.getErrorRate().toFixed(2)}%\n\n`;

    report += `Recent Alerts: ${this.alerts.length}\n`;
    this.getRecentAlerts(5).forEach(alert => {
      report += `  [${alert.severity.toUpperCase()}] ${alert.metric}: ${alert.message}\n`;
    });

    return report;
  }
}

export const performanceMonitor = new PerformanceMonitor();
