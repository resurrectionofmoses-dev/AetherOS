/**
 * Code Analysis Tool
 * Provides static analysis, complexity metrics, and code quality assessment
 */

interface CodeMetrics {
  cyclomatic: number;
  cognitive: number;
  lineCount: number;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  maintainability: number; // 0-100
}

interface AnalysisResult {
  file: string;
  metrics: CodeMetrics;
  issues: CodeIssue[];
  suggestions: string[];
}

interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  line: number;
  message: string;
  severity: number; // 1-10
}

export class CodeAnalyzer {
  private static readonly COMPLEXITY_THRESHOLD = 10;
  private static readonly COGNITIVE_THRESHOLD = 20;

  analyzeFile(content: string, fileName: string): AnalysisResult {
    const lines = content.split('\n');
    const metrics = this.calculateMetrics(content);
    const issues = this.detectIssues(content, lines);
    const suggestions = this.generateSuggestions(metrics, issues);

    return {
      file: fileName,
      metrics,
      issues,
      suggestions
    };
  }

  private calculateMetrics(content: string): CodeMetrics {
    const lineCount = content.split('\n').length;
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
    const cognitiveComplexity = this.calculateCognitiveComplexity(content);
    
    let complexity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (cyclomaticComplexity > 20) complexity = 'critical';
    else if (cyclomaticComplexity > 10) complexity = 'high';
    else if (cyclomaticComplexity > 5) complexity = 'medium';

    const maintainability = Math.max(0, Math.min(100, 
      100 - (cyclomaticComplexity * 3 + cognitiveComplexity * 2)
    ));

    return {
      cyclomatic: cyclomaticComplexity,
      cognitive: cognitiveComplexity,
      lineCount,
      complexity,
      maintainability
    };
  }

  private calculateCyclomaticComplexity(content: string): number {
    const patterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /&&|\|\|/g,
      /\?:/g
    ];

    let complexity = 1;
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      complexity += matches ? matches.length : 0;
    });

    return complexity;
  }

  private calculateCognitiveComplexity(content: string): number {
    const nestedPatterns = /(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g;
    const matches = content.match(nestedPatterns) || [];
    return matches.reduce((acc, match) => acc + (match.match(/\{/g)?.length || 0), 0);
  }

  private detectIssues(content: string, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      // Check for long lines
      if (line.length > 120) {
        issues.push({
          type: 'warning',
          line: index + 1,
          message: 'Line exceeds 120 characters',
          severity: 3
        });
      }

      // Check for unused variables
      if (/const\s+\w+\s*=/.test(line) && !new RegExp(`\\$\{?\\w+`).test(content)) {
        issues.push({
          type: 'info',
          line: index + 1,
          message: 'Potential unused variable',
          severity: 2
        });
      }

      // Check for TODO/FIXME
      if (/TODO|FIXME/.test(line)) {
        issues.push({
          type: 'info',
          line: index + 1,
          message: 'TODO/FIXME comment found',
          severity: 1
        });
      }
    });

    return issues;
  }

  private generateSuggestions(metrics: CodeMetrics, issues: CodeIssue[]): string[] {
    const suggestions: string[] = [];

    if (metrics.cyclomatic > this.COMPLEXITY_THRESHOLD) {
      suggestions.push('Consider breaking down this function into smaller units');
    }

    if (metrics.cognitive > this.COGNITIVE_THRESHOLD) {
      suggestions.push('High cognitive complexity detected - refactor nested conditions');
    }

    if (metrics.maintainability < 50) {
      suggestions.push('Maintainability is low - consider refactoring');
    }

    const errorCount = issues.filter(i => i.type === 'error').length;
    if (errorCount > 0) {
      suggestions.push(`${errorCount} error(s) found - review and fix`);
    }

    return suggestions;
  }
}

export const codeAnalyzer = new CodeAnalyzer();
