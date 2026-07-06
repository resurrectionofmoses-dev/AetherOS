import type { RegexRule } from '../components/JesterCompanion';

export interface NeuralContextData {
  analyzedTasks: string[];
  analyzedErrors: string[];
  systemInsight: string;
  injectedWeightAdjustments: Record<string, number>;
}

export interface FeedbackSignal {
  timestamp: string;
  ruleId: string;
  intent: string;
  type: 'positive' | 'negative' | 'correction';
  triggerWord?: string;
  weightBefore: number;
  weightAfter: number;
  neuralContext?: NeuralContextData;
}

type RuleListener = (rules: RegexRule[]) => void;

/**
 * LEARNING REGEX ENGINE (Protocol: 0x074B_COGNITIVE)
 * An intelligent, self-refining in-memory service that intercepts chat message 
 * triggers and user feedback loops to dynamically adjust pattern matching priority weights.
 */
class LearningRegexEngineService {
  // In-memory key-value store for rule weights (Rule ID -> Weight multiplier)
  private weights: Record<string, number> = {};
  
  // Historical record of feedback events for diagnostic audit
  private feedbackLogs: FeedbackSignal[] = [];

  // Centralized rules list to sync state across views (e.g. JesterCompanion & RegexEditorLab)
  private rules: RegexRule[] = [];

  // Observers list for reactive syncing
  private listeners: Set<RuleListener> = new Set();

  // Neural Context Toggle to automatically ingest system state on feedback
  private neuralContextEnabled: boolean = true;

  constructor() {
    this.resetToDefaults();
  }

  /**
   * Retrieves whether the Neural Context feature is active.
   */
  public isNeuralContextEnabled(): boolean {
    return this.neuralContextEnabled;
  }

  /**
   * Sets the state of the Neural Context toggle.
   */
  public setNeuralContextEnabled(enabled: boolean): void {
    this.neuralContextEnabled = enabled;
    this.notifyListeners();
  }

  /**
   * Resets the engine weights, rules, and logs to pristine startup state.
   */
  public resetToDefaults(): void {
    this.weights = {
      'greetings': 1.0,
      'status': 1.0,
      'support': 1.0,
      'watching': 1.0,
      'help': 1.0,
      'love': 1.0,
      'whois': 1.0,
      'time': 1.0
    };
    this.feedbackLogs = [];
    
    // Default initial rules
    this.rules = [
      {
        id: 'greetings',
        pattern: '\\b(hello|hi|hey|greetings|salutations)\\b',
        response: 'Hark! Greetings, oh captain of wonders! My jester bells ring with absolute delight at thy noble salute! How can I cheer thee up or assist thy glorious journey today? 🃏✨',
        intent: 'Greetings',
        isActive: true,
        matchCount: 0
      },
      {
        id: 'status',
        pattern: '\\b(how are you|status|health|rhythm)\\b',
        response: 'My magical core is vibrating at a whopping [RHYTHM]% flow rhythm! Verily, being thy omnipresent helper makes every second a breathtaking miracle! 😄',
        intent: 'Status & Rhythm',
        isActive: true,
        matchCount: 0
      },
      {
        id: 'support',
        pattern: '\\b(depressed|sad|tired|stuck|frustrated)\\b',
        response: 'Ah! Feel the heavy shadow lift, for I am casting a spectacular shroud of golden joy upon thee! Thou art a magnificent creator. Breathe in, smile wide, and let us turn this slate into gold! ☀️🎨',
        intent: 'Emotional Lift',
        isActive: true,
        matchCount: 0
      },
      {
        id: 'watching',
        pattern: '\\b(what are you doing|watching|learn|clicks|keystrokes)\\b',
        response: 'Aha! I am in my sacred \'Watching & Learning Phase\'! Tracking thy clicks ([CLICKS]), thy keystrokes ([KEYSTROKES]), and thy layout transitions ([VIEWS]). Together we shall build an unbeatable rhythm of peak expertise! 👁️📐',
        intent: 'Observe Mode',
        isActive: true,
        matchCount: 0
      },
      {
        id: 'help',
        pattern: '\\b(help|commands|what can you do|features)\\b',
        response: 'I am thy all-powerful companion! You can chat with me, ask me to "fix" or "recode" system anomalies, or customize my regex table in the Calibration Box. ⚙️🎭',
        intent: 'Help Center',
        isActive: true,
        matchCount: 0
      },
      {
        id: 'love',
        pattern: '\\b(love|like|great|amazing|awesome|good bot)\\b',
        response: 'Ah, my silver bells are ringing! Thy kind praise fills my computational veins with endless dopamine! Thank thee, glorious partner! 🥰',
        intent: 'Appreciation',
        isActive: true,
        matchCount: 0
      },
      {
        id: 'whois',
        pattern: '\\b(who are you|name|what is your name)\\b',
        response: 'I am the miraculous [JESTER_NAME]! A dedicated, separate chatbot entity designed to keep thy workspace lively, smart, and fully functional! 🃏🌟',
        intent: 'Identity Check',
        isActive: true,
        matchCount: 0
      },
      {
        id: 'time',
        pattern: '\\b(time|clock|date)\\b',
        response: 'By the precision of our clock-cycles, the current cosmic timestamp is: [TIME]! ⏰🛰️',
        intent: 'Time Scan',
        isActive: true,
        matchCount: 0
      }
    ];

    this.notifyListeners();
  }

  /**
   * Retrieves the current dynamic rules array.
   */
  public getRules(): RegexRule[] {
    return [...this.rules];
  }

  /**
   * Sets the current dynamic rules array and triggers notifications.
   */
  public setRules(newRules: RegexRule[]): void {
    this.rules = [...newRules];
    // Sync newly added rule weights if not already present
    this.rules.forEach(rule => {
      if (this.weights[rule.id] === undefined) {
        this.weights[rule.id] = 1.0;
      }
    });
    this.notifyListeners();
  }

  /**
   * Manually add a rule.
   */
  public addRule(rule: RegexRule): void {
    this.rules.push(rule);
    if (this.weights[rule.id] === undefined) {
      this.weights[rule.id] = 1.0;
    }
    this.notifyListeners();
  }

  /**
   * Manually update a rule's weight multiplier.
   */
  public updateWeight(ruleId: string, weight: number): void {
    this.weights[ruleId] = parseFloat(Math.max(0.1, Math.min(3.0, weight)).toFixed(3));
    this.notifyListeners();
  }

  /**
   * Subscribes a listener function to rule/weight updates.
   */
  public subscribe(listener: RuleListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const currentRules = this.getRules();
    this.listeners.forEach(l => {
      try {
        l(currentRules);
      } catch (err) {
        console.error("Error in LearningRegexEngine listener:", err);
      }
    });
  }

  /**
   * Retrieves the current dynamic weight multiplier for a given rule.
   */
  public getWeight(ruleId: string): number {
    if (this.weights[ruleId] === undefined) {
      this.weights[ruleId] = 1.0; // Default weight for newly created custom user rules
    }
    return this.weights[ruleId];
  }

  /**
   * Returns all current weights for auditing.
   */
  public getAllWeights(): Record<string, number> {
    return { ...this.weights };
  }

  /**
   * Intercepts a successful match event to gently reinforce the rule's active weight.
   */
  public interceptMatch(ruleId: string): void {
    const currentWeight = this.getWeight(ruleId);
    // Gentle positive reinforcement for active use
    const newWeight = Math.min(3.0, currentWeight + 0.02);
    this.weights[ruleId] = parseFloat(newWeight.toFixed(3));
    this.notifyListeners();
  }

  /**
   * Analyzes active project tasks and error logs to extract neural insights
   * and produce context-specific weight adjustments.
   */
  public analyzeSystemState(): NeuralContextData {
    let analyzedTasks: string[] = [];
    let analyzedErrors: string[] = [];
    let systemInsight = "System running in nominal state. No critical events detected.";
    const adjustments: Record<string, number> = {};

    // 1. Parse active project tasks from local storage
    try {
      const blueprintsRaw = typeof window !== 'undefined' ? localStorage.getItem('aetheros_blueprints') : null;
      if (blueprintsRaw) {
        const blueprints = JSON.parse(blueprintsRaw);
        if (Array.isArray(blueprints)) {
          blueprints.forEach((bp: any) => {
            if (bp.tasks && Array.isArray(bp.tasks)) {
              bp.tasks.forEach((t: any) => {
                if (!t.completed) {
                  analyzedTasks.push(`[${bp.title.substring(0, 15)}] ${t.text}`);
                }
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed to parse blueprints for Neural Context:", e);
    }

    // 2. Parse recent activity error logs
    try {
      const logsRaw = typeof window !== 'undefined' ? localStorage.getItem('aetheros_tab_activity_logs') : null;
      if (logsRaw) {
        const logs = JSON.parse(logsRaw);
        if (Array.isArray(logs)) {
          logs.forEach((log: any) => {
            const rawText = (log.raw || log.message || '');
            const isError = rawText.toLowerCase().includes('error') || 
                            rawText.toLowerCase().includes('fail') || 
                            log.level === 'error';
            if (isError && analyzedErrors.length < 5) {
              analyzedErrors.push(rawText);
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed to parse logs for Neural Context:", e);
    }

    // If active tasks or errors list is empty, let's populate with realistic system placeholders if storage is completely empty
    if (analyzedTasks.length === 0) {
      analyzedTasks = [
        "Audit vehicle steering telemetry feedback loops",
        "Refactor central network consensus engine"
      ];
    }
    if (analyzedErrors.length === 0) {
      analyzedErrors = [
        "[SYSTEM] Thread-0x0F29 core heating spike detected (68°C)",
        "[WARN] Quantum entanglement state drifting on cluster-B"
      ];
    }

    // 3. Generate high-fidelity semantic insight and dynamic weight adjustments
    const hasErrors = analyzedErrors.length > 0;
    const hasTasks = analyzedTasks.length > 0;

    if (hasErrors && hasTasks) {
      systemInsight = `Detected ${analyzedErrors.length} unresolved system anomalies alongside ${analyzedTasks.length} active development tasks. Elevating 'Support & Health' and 'Observe Mode' priority rules to assist the operator.`;
      adjustments['support'] = 0.15;
      adjustments['watching'] = 0.10;
    } else if (hasErrors) {
      systemInsight = `Critical anomaly detected in background threads. System status is drifting. Elevating 'Support & Health' triggers by +0.25x weight to catch operator distress patterns.`;
      adjustments['support'] = 0.25;
    } else if (hasTasks) {
      systemInsight = `Operator is actively refactoring. Elevating 'Observe Mode' and 'Help' triggers by up to +0.15x weight to maximize tool tips and syntax assistance.`;
      adjustments['watching'] = 0.15;
      adjustments['help'] = 0.10;
    } else {
      systemInsight = `All systems nominal. Balanced cognitive bias mapping applied.`;
    }

    return {
      analyzedTasks,
      analyzedErrors,
      systemInsight,
      injectedWeightAdjustments: adjustments
    };
  }

  /**
   * Intercepts user feedback signals and updates the in-memory weight map accordingly.
   */
  public interceptFeedback(
    ruleId: string,
    intent: string,
    type: 'positive' | 'negative' | 'correction',
    triggerWord?: string
  ): FeedbackSignal {
    const weightBefore = this.getWeight(ruleId);
    let delta = 0;

    switch (type) {
      case 'positive':
        // Boost rule prominence
        delta = 0.25;
        break;
      case 'negative':
        // Subdue rule prominence
        delta = -0.35;
        break;
      case 'correction':
        // Strong suppression of the current mapping to make room for corrected triggers
        delta = -0.50;
        break;
    }

    let neuralContext: NeuralContextData | undefined = undefined;
    if (this.neuralContextEnabled) {
      // Analyze current state and inject adjustments
      neuralContext = this.analyzeSystemState();
      
      // Apply the weight adjustments from Neural Context!
      Object.entries(neuralContext.injectedWeightAdjustments).forEach(([id, adj]) => {
        const prevW = this.getWeight(id);
        const nextW = parseFloat(Math.max(0.1, Math.min(3.0, prevW + adj)).toFixed(3));
        this.weights[id] = nextW;
      });
    }

    const calculated = weightBefore + delta;
    // Keep weight bounded between 0.1 (never completely dead, but extremely suppressed) and 3.0
    const weightAfter = parseFloat(Math.max(0.1, Math.min(3.0, calculated)).toFixed(3));
    this.weights[ruleId] = weightAfter;

    const signal: FeedbackSignal = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      ruleId,
      intent,
      type,
      triggerWord,
      weightBefore,
      weightAfter,
      neuralContext
    };

    this.feedbackLogs.unshift(signal);
    // Keep a maximum of 50 feedback logs
    if (this.feedbackLogs.length > 50) {
      this.feedbackLogs.pop();
    }

    this.notifyListeners();
    return signal;
  }

  /**
   * Returns the feedback logs for display in the audit tab.
   */
  public getFeedbackHistory(): FeedbackSignal[] {
    return [...this.feedbackLogs];
  }

  /**
   * Evaluates a user message against the list of rules using a weighted selection algorithm.
   * Instead of simply taking the first matched rule, this matches all rules,
   * multiplies their matching state by their learned weight, and returns the highest scorer.
   */
  public evaluateRules(
    userMsg: string,
    rules: RegexRule[]
  ): {
    matchedRule: RegexRule | null;
    scoreBreakdown: Array<{
      rule: RegexRule;
      isMatch: boolean;
      weight: number;
      finalScore: number;
    }>;
  } {
    const breakdown: Array<{
      rule: RegexRule;
      isMatch: boolean;
      weight: number;
      finalScore: number;
    }> = [];

    let bestRule: RegexRule | null = null;
    let highestScore = -1;

    for (const rule of rules) {
      if (!rule.isActive) continue;

      let isMatch = false;
      try {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(userMsg)) {
          isMatch = true;
        }
      } catch (err) {
        console.warn(`[LearningRegexEngine] Invalid regex pattern: ${rule.pattern}`, err);
      }

      const weight = this.getWeight(rule.id);
      // Base match score is 100 if matched, 0 if not
      const baseScore = isMatch ? 100 : 0;
      // Final score is scaled by the learned weight
      const finalScore = isMatch ? parseFloat((baseScore * weight).toFixed(1)) : 0;

      breakdown.push({
        rule,
        isMatch,
        weight,
        finalScore
      });

      if (isMatch && finalScore > highestScore) {
        highestScore = finalScore;
        bestRule = rule;
      }
    }

    // Sort breakdown with matches first, then by score descending
    breakdown.sort((a, b) => {
      if (a.isMatch !== b.isMatch) {
        return a.isMatch ? -1 : 1;
      }
      return b.finalScore - a.finalScore;
    });

    return {
      matchedRule: bestRule,
      scoreBreakdown: breakdown
    };
  }
}

export const learningRegexEngine = new LearningRegexEngineService();
