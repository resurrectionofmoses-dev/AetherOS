import React, { useState } from 'react';
import { 
    BrainIcon, ActivityIcon, ZapIcon, TerminalIcon, 
    CheckCircleIcon, ShieldIcon, EyeIcon, LogicIcon,
    CodeIcon, WrenchIcon
} from './icons';
import { 
    cognitivePipeline, 
    SensingLayer, 
    PerceptionLayer, 
    ReasoningLayer, 
    DecisionLayer, 
    ActuationLayer,
    SensorData,
    Percept,
    ReasoningContext,
    Decision,
    ActuationResult
} from '../services/cognitivePipeline';

interface CognitivePipelineViewProps {
    onClose?: () => void;
}

export const CognitivePipelineView: React.FC<CognitivePipelineViewProps> = ({ onClose }) => {
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State for each layer's output
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const [percept, setPercept] = useState<Percept | null>(null);
    const [reasoning, setReasoning] = useState<ReasoningContext | null>(null);
    const [decision, setDecision] = useState<Decision | null>(null);
    const [actuation, setActuation] = useState<ActuationResult | null>(null);

    const handleProcess = async () => {
        if (!input.trim()) return;
        
        setIsProcessing(true);
        setSensorData(null);
        setPercept(null);
        setReasoning(null);
        setDecision(null);
        setActuation(null);

        // We instantiate the layers manually here to capture intermediate state
        // In a real app, the pipeline might emit events for visualization
        const sensing = new SensingLayer();
        const perception = new PerceptionLayer();
        const reasoningLayer = new ReasoningLayer();
        const decisionLayer = new DecisionLayer();
        const actuationLayer = new ActuationLayer();

        try {
            // 1. Sensing
            const sData = sensing.gather(input);
            setSensorData(sData);
            await new Promise(r => setTimeout(r, 400)); // Artificial delay for visual effect

            // 2. Perception
            const pData = perception.perceive(sData);
            setPercept(pData);
            await new Promise(r => setTimeout(r, 400));

            // 3. Reasoning
            const rData = reasoningLayer.reason(pData, []);
            setReasoning(rData);
            await new Promise(r => setTimeout(r, 400));

            // 4. Decision
            const dData = decisionLayer.decide(rData);
            setDecision(dData);
            await new Promise(r => setTimeout(r, 400));

            // 5. Actuation
            const aData = await actuationLayer.actuate(dData);
            setActuation(aData);

        } catch (error) {
            console.error("Pipeline error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const LayerCard = ({ 
        title, icon: Icon, color, data, isActive, isComplete 
    }: { 
        title: string, icon: any, color: string, data: any, isActive: boolean, isComplete: boolean 
    }) => (
        <div className={`
            p-4 rounded-xl border-2 transition-all duration-500 relative overflow-hidden
            ${isActive ? `border-${color}-500 bg-${color}-950/30 shadow-[0_0_20px_rgba(var(--tw-colors-${color}-500),0.3)]` : 
              isComplete ? `border-${color}-900/50 bg-black/40` : 
              'border-zinc-800 bg-black/20 opacity-50'}
        `}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${isActive ? `text-${color}-400 animate-pulse` : isComplete ? `text-${color}-600` : 'text-zinc-600'}`} />
                    <h3 className={`font-black uppercase tracking-widest text-xs ${isActive || isComplete ? 'text-white' : 'text-zinc-500'}`}>
                        {title}
                    </h3>
                </div>
                {isComplete && <CheckCircleIcon className={`w-4 h-4 text-${color}-500`} />}
            </div>
            
            <div className="h-32 overflow-y-auto custom-scrollbar font-mono text-[10px] bg-black/60 p-2 rounded border border-white/5">
                {data ? (
                    <pre className={`text-${color}-300 whitespace-pre-wrap`}>
                        {JSON.stringify(data, null, 2)}
                    </pre>
                ) : isActive ? (
                    <div className={`text-${color}-500/50 flex items-center gap-2 h-full justify-center`}>
                        <ActivityIcon className="w-4 h-4 animate-spin" /> Processing...
                    </div>
                ) : (
                    <div className="text-zinc-700 flex items-center justify-center h-full italic">
                        Awaiting input...
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-black text-gray-200 font-mono overflow-hidden relative p-8">
            {/* Background Ambience */}
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            {/* Header */}
            <div className="flex justify-between items-start mb-8 relative z-10 border-b-4 border-purple-600 pb-6">
                <div className="flex gap-6">
                    <div className="w-20 h-20 bg-purple-600/10 border-4 border-purple-600 rounded-none flex items-center justify-center shadow-[0_0_50px_rgba(147,51,234,0.3)]">
                        <BrainIcon className="w-10 h-10 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-purple-500 glitch-text" style={{ fontFamily: 'Impact, sans-serif' }}>
                            COGNITIVE PIPELINE
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="bg-purple-600 text-black px-2 py-1 text-xs font-black uppercase">MODULAR ARCHITECTURE</span>
                            <span className="text-purple-400 text-xs font-mono uppercase tracking-widest">SENSE → PERCEIVE → REASON → DECIDE → ACTUATE</span>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black transition-all uppercase font-black text-xs tracking-widest"
                    >
                        CLOSE PIPELINE
                    </button>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-6 relative z-10 min-h-0">
                {/* Input Area */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex gap-4 shrink-0">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
                        placeholder="Inject stimulus into the cognitive pipeline (e.g., 'I need help with my system')..."
                        className="flex-1 bg-black border-2 border-zinc-700 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all font-mono"
                        disabled={isProcessing}
                    />
                    <button 
                        onClick={handleProcess}
                        disabled={isProcessing || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        {isProcessing ? <ActivityIcon className="w-4 h-4 animate-spin" /> : <ZapIcon className="w-4 h-4" />}
                        {isProcessing ? 'PROCESSING' : 'INJECT'}
                    </button>
                </div>

                {/* Pipeline Visualization */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full">
                        <LayerCard 
                            title="1. Sensing" 
                            icon={EyeIcon} 
                            color="blue" 
                            data={sensorData} 
                            isActive={isProcessing && !sensorData} 
                            isComplete={!!sensorData} 
                        />
                        <LayerCard 
                            title="2. Perception" 
                            icon={BrainIcon} 
                            color="cyan" 
                            data={percept} 
                            isActive={isProcessing && !!sensorData && !percept} 
                            isComplete={!!percept} 
                        />
                        <LayerCard 
                            title="3. Reasoning" 
                            icon={LogicIcon} 
                            color="purple" 
                            data={reasoning} 
                            isActive={isProcessing && !!percept && !reasoning} 
                            isComplete={!!reasoning} 
                        />
                        <LayerCard 
                            title="4. Decision" 
                            icon={ShieldIcon} 
                            color="amber" 
                            data={decision} 
                            isActive={isProcessing && !!reasoning && !decision} 
                            isComplete={!!decision} 
                        />
                        <LayerCard 
                            title="5. Actuation" 
                            icon={WrenchIcon} 
                            color="green" 
                            data={actuation} 
                            isActive={isProcessing && !!decision && !actuation} 
                            isComplete={!!actuation} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
