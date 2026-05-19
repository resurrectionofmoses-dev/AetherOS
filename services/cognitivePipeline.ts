export interface SensorData {
    rawInput: string;
    timestamp: number;
    source: string;
    metadata?: Record<string, any>;
}

export interface Percept {
    id: string;
    extractedEntities: string[];
    intent: string;
    sentiment: number;
    confidence: number;
    timestamp: number;
}

export interface ReasoningContext {
    percepts: Percept[];
    historicalContext: string[];
    inferredState: string;
    hypotheses: string[];
}

export interface Decision {
    id: string;
    actionType: string;
    target: string;
    parameters: Record<string, any>;
    priority: number;
    reasoningTrace: string;
}

export interface ActuationResult {
    success: boolean;
    output: string;
    error?: string;
    latencyMs: number;
}

/**
 * Layer 1: Sensing
 * Responsible for gathering raw data from the environment.
 */
export class SensingLayer {
    public gather(input: string, source: string = 'user_input'): SensorData {
        return {
            rawInput: input,
            timestamp: Date.now(),
            source,
            metadata: {
                length: input.length
            }
        };
    }
}

/**
 * Layer 2: Perception
 * Responsible for extracting meaning, intent, and entities from raw sensor data.
 */
export class PerceptionLayer {
    public perceive(data: SensorData): Percept {
        // In a real system, this would call an LLM or NLP model
        const intent = data.rawInput.toLowerCase().includes('help') ? 'request_assistance' : 'statement';
        return {
            id: `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            extractedEntities: [], // Mock extraction
            intent,
            sentiment: 0.5, // Neutral mock
            confidence: 0.85,
            timestamp: Date.now()
        };
    }
}

/**
 * Layer 3: Reasoning
 * Responsible for contextualizing percepts against history and forming hypotheses.
 */
export class ReasoningLayer {
    public reason(percept: Percept, history: string[]): ReasoningContext {
        return {
            percepts: [percept],
            historicalContext: history,
            inferredState: `User intent is ${percept.intent} with confidence ${percept.confidence}`,
            hypotheses: [
                'User needs immediate action',
                'User is providing information'
            ]
        };
    }
}

/**
 * Layer 4: Decision
 * Responsible for selecting the best action based on the reasoning context.
 */
export class DecisionLayer {
    public decide(context: ReasoningContext): Decision {
        const primaryPercept = context.percepts[0];
        let actionType = 'respond_text';
        if (primaryPercept.intent === 'request_assistance') {
            actionType = 'trigger_help_protocol';
        }

        return {
            id: `D-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            actionType,
            target: 'system',
            parameters: { context: context.inferredState },
            priority: primaryPercept.confidence > 0.8 ? 1 : 0,
            reasoningTrace: `Selected ${actionType} based on intent ${primaryPercept.intent}`
        };
    }
}

/**
 * Layer 5: Actuation
 * Responsible for executing the decision and interacting with the environment.
 */
export class ActuationLayer {
    public async actuate(decision: Decision): Promise<ActuationResult> {
        const start = Date.now();
        try {
            // Mock execution
            let output = `Executed action: ${decision.actionType}`;
            if (decision.actionType === 'trigger_help_protocol') {
                output = "Help protocol initiated. Awaiting further instructions.";
            }

            return {
                success: true,
                output,
                latencyMs: Date.now() - start
            };
        } catch (error: any) {
            return {
                success: false,
                output: '',
                error: error.message,
                latencyMs: Date.now() - start
            };
        }
    }
}

/**
 * Cognitive Pipeline
 * Orchestrates the independent layers.
 */
export class CognitivePipeline {
    private sensing = new SensingLayer();
    private perception = new PerceptionLayer();
    private reasoning = new ReasoningLayer();
    private decision = new DecisionLayer();
    private actuation = new ActuationLayer();

    // Allow dependency injection for testing/replacement
    constructor(
        sensing?: SensingLayer,
        perception?: PerceptionLayer,
        reasoning?: ReasoningLayer,
        decision?: DecisionLayer,
        actuation?: ActuationLayer
    ) {
        if (sensing) this.sensing = sensing;
        if (perception) this.perception = perception;
        if (reasoning) this.reasoning = reasoning;
        if (decision) this.decision = decision;
        if (actuation) this.actuation = actuation;
    }

    public async process(input: string, history: string[] = []): Promise<ActuationResult> {
        const sensorData = this.sensing.gather(input);
        const percept = this.perception.perceive(sensorData);
        const context = this.reasoning.reason(percept, history);
        const decision = this.decision.decide(context);
        return await this.actuation.actuate(decision);
    }
}

export const cognitivePipeline = new CognitivePipeline();
