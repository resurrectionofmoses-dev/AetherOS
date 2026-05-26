/**
 * AetherOS Debugger
 * Provides debugging utilities for code inspection and error tracking
 */

import { EventEmitter } from 'events';

interface DebugBreakpoint {
  id: string;
  file: string;
  line: number;
  condition?: string;
  enabled: boolean;
}

interface StackFrame {
  functionName: string;
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
  locals: Record<string, any>;
}

export class AetherOSDebugger extends EventEmitter {
  private breakpoints: Map<string, DebugBreakpoint> = new Map();
  private callStack: StackFrame[] = [];
  private isPaused = false;

  constructor() {
    super();
  }

  addBreakpoint(file: string, line: number, condition?: string): string {
    const id = `bp-${Date.now()}-${Math.random()}`;
    const breakpoint: DebugBreakpoint = {
      id,
      file,
      line,
      condition,
      enabled: true
    };
    this.breakpoints.set(id, breakpoint);
    this.emit('breakpoint:added', breakpoint);
    return id;
  }

  removeBreakpoint(id: string): boolean {
    const removed = this.breakpoints.delete(id);
    if (removed) {
      this.emit('breakpoint:removed', id);
    }
    return removed;
  }

  listBreakpoints(): DebugBreakpoint[] {
    return Array.from(this.breakpoints.values());
  }

  async evaluateExpression(expression: string, context: any): Promise<any> {
    try {
      const fn = new Function(...Object.keys(context), `return ${expression}`);
      return fn(...Object.values(context));
    } catch (error) {
      this.emit('eval:error', { expression, error });
      throw error;
    }
  }

  getCallStack(): StackFrame[] {
    return this.callStack;
  }

  pause(): void {
    this.isPaused = true;
    this.emit('debugger:paused');
  }

  resume(): void {
    this.isPaused = false;
    this.emit('debugger:resumed');
  }

  stepInto(): void {
    this.emit('debugger:step', 'into');
  }

  stepOver(): void {
    this.emit('debugger:step', 'over');
  }

  stepOut(): void {
    this.emit('debugger:step', 'out');
  }
}

export const debugger = new AetherOSDebugger();
