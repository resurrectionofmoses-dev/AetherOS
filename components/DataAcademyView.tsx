import React, { useState, useEffect, useRef } from 'react';
import { 
    BookIcon, BrainIcon, SparklesIcon, ChevronRightIcon, 
    CheckCircleIcon, SpinnerIcon, WrenchIcon, 
    ActivityIcon, ShieldIcon, DatabaseIcon, PlusIcon,
    TrashIcon, PlayIcon, LinkIcon, XIcon, StarIcon, LearnIcon
} from './icons';
import { motion, AnimatePresence } from 'motion/react';

// Custom Type Definitions for Data Academy
export interface KnowledgeUnit {
    id: string;
    content: string;
    context: string;
    domain: 'mechanical' | 'software' | 'cognitive' | 'security' | 'defi' | 'alignment';
    topics: string[];
    difficulty: number; // 0 to 1000
    sourceType: string;
    sourceId: string;
    sourceReliability: number; // 0 to 1000
    verified: boolean;
    contradictions: string[];
    timesReferenced: number;
    successRate: number; // 0 to 1000 representing mastery
}

export interface CurriculumLevel {
    levelNumber: number;
    title: string;
    description: string;
    knowledgeUnitsRequired: string[]; // array of KU IDs
    minScore: number; // pass percentage, e.g., 75
    studyEstimateHours: number;
    experienceGranted: number;
}

export interface Curriculum {
    id: string;
    name: string;
    domain: 'mechanical' | 'software' | 'cognitive' | 'security' | 'defi' | 'alignment';
    focusArea: string;
    targetAudience: 'beginner' | 'intermediate' | 'elite';
    objectives: string[];
    levels: CurriculumLevel[];
    certifiedValueBoost: number; // CPH or equivalent dollar boost
    skillEfficiencyBonus: number; // e.g. 8.5% -> 85
    useHistoricalData: boolean;
    selfCured: boolean;
}

export interface StudentAgent {
    id: string;
    name: string;
    avatar: string;
    activeCurriculumId: string | null;
    currentLevelNumber: number;
    progressPercentage: number;
    overallComprehension: number; // 0 to 1000
    cphSpent: number;
    hoursStudied: number;
    certifications: string[]; // List of Certification IDs
    status: 'idle' | 'studying' | 'testing' | 'graduated';
}

export interface ActiveCertification {
    id: string;
    agentId: string;
    agentName: string;
    curriculumId: string;
    curriculumName: string;
    domain: string;
    issueDate: string;
    signature: string; // verifiable hash
    cphValueBoost: number;
    efficiencyBonus: number;
    overallScore: number;
}

export interface DataIngestionConfig {
    id: string;
    name: string;
    type: 'document' | 'telemetry' | 'scraped' | 'forum';
    qualityRating: number; // 0 to 1000
    extractedCount: number;
}

// System audio synthesizer wrapper
const playSynthBeep = (freq = 440, type: OscillatorType = 'sine', duration = 0.08) => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        // Exponential decay code
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        // Silent catch for unsupported environments
    }
};

export const DataAcademyView: React.FC<{ profile?: any }> = ({ profile }) => {
    // ----------------------------------------------------
    // INITIALIZATION & SEED STATE DB
    // ----------------------------------------------------

    // Default Knowledge Units
    const [knowledgeUnits, setKnowledgeUnits] = useState<KnowledgeUnit[]>([
        {
            id: "ku-mechanic-001",
            content: "The OBD-II diagnostics port reports physical RPM spikes, engine temperatures, and voltage streams via raw hexadecimal Parameter IDs (PIDs).",
            context: "Fundamental to reading vehicle digital consciousness",
            domain: "mechanical",
            topics: ["OBD-II", "Telemetry", "PIDs"],
            difficulty: 350,
            sourceType: "manual",
            sourceId: "zurich-zr13s-guide",
            sourceReliability: 950,
            verified: true,
            contradictions: [],
            timesReferenced: 94,
            successRate: 910
        },
        {
            id: "ku-mechanic-002",
            content: "Fault code P0128 indicates that the engine coolant temperature has fallen below the active thermostat regulating threshold, triggering rich fuel mixture loops.",
            context: "ECU enrichment and catalyst thermal behavior",
            domain: "mechanical",
            topics: ["P0128", "Cooling", "Thermostat", "ECU"],
            difficulty: 600,
            sourceType: "manual",
            sourceId: "hemi-v8-service",
            sourceReliability: 980,
            verified: true,
            contradictions: [],
            timesReferenced: 112,
            successRate: 740
        },
        {
            id: "ku-mechanic-003",
            content: "Random misfires (P0300) on 5.7L HEMI engines are commonly tied to multi-discharge ignition system voltage drops or air blockages rather than faulty spark plug elements.",
            context: "Coil pack electricity saturation protocols",
            domain: "mechanical",
            topics: ["P0300", "HEMI", "Misfire", "Ignition"],
            difficulty: 750,
            sourceType: "telemetry",
            sourceId: "zurich-misfire-log",
            sourceReliability: 910,
            verified: true,
            contradictions: [],
            timesReferenced: 180,
            successRate: 580 // Sticking points! Failure rate high!
        },
        {
            id: "ku-software-001",
            content: "To build a dynamic plugin architecture supporting 500+ commands, the core dispatcher must load command modules on-demand using manifest.json lazy mappings.",
            context: "Preventing Node/Vite startup delay on massive CLI suite",
            domain: "software",
            topics: ["Generators", "Caching", "Performance", "Lazy-loading"],
            difficulty: 500,
            sourceType: "document",
            sourceId: "cli-architecting-spec",
            sourceReliability: 960,
            verified: true,
            contradictions: [],
            timesReferenced: 70,
            successRate: 850
        },
        {
            id: "ku-software-002",
            content: "In Go's Cobra CLI framework, avoiding init() package-level side-effects keeps binary memory footprints clean and decreases absolute startup latency from 300ms down to sub-10ms.",
            context: "Performance optimization for infrastructure binaries",
            domain: "software",
            topics: ["Go", "Cobra", "Optimizations", "init"],
            difficulty: 620,
            sourceType: "document",
            sourceId: "cli-architecting-spec",
            sourceReliability: 940,
            verified: true,
            contradictions: [],
            timesReferenced: 85,
            successRate: 810
        },
        {
            id: "ku-security-001",
            content: "Remote Code Execution (RCE) can be achieved through improperly sanitized inputs evaluated inside sandboxed Docker node runtimes.",
            context: "Preventing container escape vector exploits",
            domain: "security",
            topics: ["RCE", "Exploits", "Sanitizing"],
            difficulty: 800,
            sourceType: "forum",
            sourceId: "sec-audits-exchange",
            sourceReliability: 890,
            verified: true,
            contradictions: [],
            timesReferenced: 144,
            successRate: 460 // Sticking point!
        },
        {
            id: "ku-defi-001",
            content: "Flash loan attacks execute multi-hop swaps across low-liquidity AMM protocols within a single transaction bloc, manipulating oracle price references to drain target pools.",
            context: "Smart contract price discrepancy vulnerabilities",
            domain: "defi",
            topics: ["Flash-loans", "Arbitrage", "Oracles", "AMMs"],
            difficulty: 850,
            sourceType: "document",
            sourceId: "defi-vulnerabilities-manual",
            sourceReliability: 970,
            verified: true,
            contradictions: [],
            timesReferenced: 205,
            successRate: 510
        },
        {
            id: "ku-alignment-001",
            content: "Sovereign Alignment frameworks require target AI metrics to optimize for intent verification rather than blind obedience to prevent downstream proxy-gaming overrides.",
            context: "Safe execution of high-authority directives",
            domain: "alignment",
            topics: ["Alignment", "Proxy-gaming", "Goal-metrics"],
            difficulty: 900,
            sourceType: "document",
            sourceId: "as-intent-alignment-wp",
            sourceReliability: 990,
            verified: true,
            contradictions: [],
            timesReferenced: 60,
            successRate: 630
        }
    ]);

    // Prebuilt Curricula
    const [curricula, setCurricula] = useState<Curriculum[]>([
        {
            id: "curr-vehicle-diag",
            name: "Automotive Diagnostics & HEMI Orchestration",
            domain: "mechanical",
            focusArea: "OBD-II Engine Synchronization",
            targetAudience: "intermediate",
            objectives: [
                "Map 2006-2026 5.7L HEMI V8 electronic relationships",
                "Interpret complex OBD2 emission codes (P0128, P0300)",
                "Establish preventive healing circuits linked to vital sensors"
            ],
            levels: [
                {
                    levelNumber: 1,
                    title: "Signal Foundations & PID Telemetry",
                    description: "Learn to tap into the vehicle harness and decipher raw metrics.",
                    knowledgeUnitsRequired: ["ku-mechanic-001"],
                    minScore: 70,
                    studyEstimateHours: 2,
                    experienceGranted: 150
                },
                {
                    levelNumber: 2,
                    title: "Cooling Loop Regulation & Rich Fuel Cycles",
                    description: "Trace mechanical defects through coolant sensors to optimize engine temperature.",
                    knowledgeUnitsRequired: ["ku-mechanic-001", "ku-mechanic-002"],
                    minScore: 75,
                    studyEstimateHours: 4,
                    experienceGranted: 300
                },
                {
                    levelNumber: 3,
                    title: "Advanced HEMI Coherency & Misfire Audits",
                    description: "Identify voltage dropouts, carbon friction thresholds, and stabilize V8 ignition nodes.",
                    knowledgeUnitsRequired: ["ku-mechanic-001", "ku-mechanic-002", "ku-mechanic-003"],
                    minScore: 85,
                    studyEstimateHours: 6,
                    experienceGranted: 500
                }
            ],
            certifiedValueBoost: 25, // $25 salary raise or equivalent
            skillEfficiencyBonus: 85, // 8.5%
            useHistoricalData: true,
            selfCured: false
        },
        {
            id: "curr-cli-arch",
            name: "Enterprise CLI Engineering at Scale",
            domain: "software",
            focusArea: "High-Volume Command Routing",
            targetAudience: "elite",
            objectives: [
                "Structure modular subcomponents for 500+ commands",
                "Eliminate node import costs using oclif manifest caching",
                "Deploy lighting-fast compiled structures in Go"
            ],
            levels: [
                {
                    levelNumber: 1,
                    title: "Dynamic Dispatching & Metadata Caching",
                    description: "Implement lazy loading mappings that render hundreds of commands without memory bloat.",
                    knowledgeUnitsRequired: ["ku-software-001"],
                    minScore: 75,
                    studyEstimateHours: 3,
                    experienceGranted: 200
                },
                {
                    levelNumber: 2,
                    title: "Sub-10ms Go Compiled Monoliths",
                    description: "Utilize Cobra structures cleanly to avoid package-level state lags.",
                    knowledgeUnitsRequired: ["ku-software-001", "ku-software-002"],
                    minScore: 80,
                    studyEstimateHours: 5,
                    experienceGranted: 400
                }
            ],
            certifiedValueBoost: 40,
            skillEfficiencyBonus: 120, // 12%
            useHistoricalData: true,
            selfCured: false
        }
    ]);

    // Student Agents State
    const [students, setStudentAgents] = useState<StudentAgent[]>([
        {
            id: "st-mike",
            name: "Mechanic Mike",
            avatar: "🔧",
            activeCurriculumId: "curr-vehicle-diag",
            currentLevelNumber: 2,
            progressPercentage: 45,
            overallComprehension: 720,
            cphSpent: 64,
            hoursStudied: 12,
            certifications: [],
            status: "studying"
        },
        {
            id: "st-clara",
            name: "Cognitive Clara",
            avatar: "🧠",
            activeCurriculumId: null,
            currentLevelNumber: 1,
            progressPercentage: 0,
            overallComprehension: 890,
            cphSpent: 12,
            hoursStudied: 3,
            certifications: [],
            status: "idle"
        },
        {
            id: "st-shepherd",
            name: "Sovereign Shepherd",
            avatar: "🛡️",
            activeCurriculumId: "curr-cli-arch",
            currentLevelNumber: 1,
            progressPercentage: 80,
            overallComprehension: 950,
            cphSpent: 110,
            hoursStudied: 16,
            certifications: [],
            status: "studying"
        },
        {
            id: "st-drake",
            name: "DeFi Drake",
            avatar: "💹",
            activeCurriculumId: "curr-cli-arch",
            currentLevelNumber: 1,
            progressPercentage: 10,
            overallComprehension: 640,
            cphSpent: 28,
            hoursStudied: 4,
            certifications: [],
            status: "studying"
        }
    ]);

    // Verifiable Certifications Registry
    const [certifications, setCertifications] = useState<ActiveCertification[]>([
        {
            id: "cert-spec-001",
            agentId: "st-mike",
            agentName: "Mechanic Mike",
            curriculumId: "curr-vehicle-diag",
            curriculumName: "Automotive Diagnostics & HEMI Orchestration",
            domain: "mechanical",
            issueDate: "2026-05-14",
            signature: "0xDA8B72fF9AA30B4A0E000BCCFCE9EE999",
            cphValueBoost: 25,
            efficiencyBonus: 85,
            overallScore: 885
        }
    ]);

    // Data Ingestion Statistics
    const [ingestionConfigs] = useState<DataIngestionConfig[]>([
        { id: "ing-honda-man", name: "Honda Service Manual DB", type: "document", qualityRating: 950, extractedCount: 420 },
        { id: "ing-hemi-v8", name: "Chrysler 5.7L V8 Core Specs", type: "document", qualityRating: 980, extractedCount: 280 },
        { id: "ing-obd-realtime", name: "Zurich ZR13S Live Feed", type: "telemetry", qualityRating: 910, extractedCount: 1350 }
    ]);

    // General Academy State Pool
    const [cphPool, setCphPool] = useState(8450); // Coherent Processing Hours
    const [activeTab, setActiveTab] = useState<'knowledge' | 'curriculum' | 'students' | 'optimizer'>('students');
    const [selectedKnowledgeUnit, setSelectedKnowledgeUnit] = useState<KnowledgeUnit | null>(knowledgeUnits[2]);
    const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("curr-vehicle-diag");
    const [selectedStudentId, setSelectedStudentId] = useState<string>("st-mike");

    // Form inputs state
    const [ingestText, setIngestText] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [newCurriculumForm, setNewCurriculumForm] = useState({
        name: "",
        domain: "software" as any,
        focusArea: "",
        targetAudience: "beginner" as any,
        objectives: ""
    });

    // Classroom interactive exam state
    const [activeExam, setActiveExam] = useState<{
        studentId: string;
        curriculumId: string;
        levelNumber: number;
        step: number; // 0 to 2
        score: number;
        answers: boolean[];
        active: boolean;
    } | null>(null);

    // Dynamic Optimization/Analytics Simulation Values
    const [bottlenecks, setBottlenecks] = useState([
        { id: "bn-001", location: "Level 3: Automotive Diagnostics", code: "P0300 Misfires", failRate: 42, reason: "Prerequisite gap: Ignition Coil pack timing saturation is too abstract.", type: "severe" },
        { id: "bn-002", location: "Level 2: CLI System Architecture", code: "RCE Docker Sanitization", failRate: 19, reason: "Comprehension penalty: Security sandboxing parameters limit playground engagement.", type: "mild" }
    ]);

    // ----------------------------------------------------
    // INGESTION ENGINE
    // ----------------------------------------------------
    const handleIngestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ingestText.trim()) return;

        setIsExtracting(true);
        playSynthBeep(330, 'sawtooth', 0.2);

        setTimeout(() => {
            const hasThermostat = ingestText.toLowerCase().includes("thermostat") || ingestText.toLowerCase().includes("cooling");
            const hasFlashLoan = ingestText.toLowerCase().includes("flash") || ingestText.toLowerCase().includes("arbitrage");
            
            let extractedKU: KnowledgeUnit;
            if (hasThermostat) {
                extractedKU = {
                    id: `ku-ingest-${Date.now()}`,
                    content: "Newly Ingested: Radiator mechanical pressure bypasses occur when the core seal is fatigued, causing premature thermostat trigger codes.",
                    context: "Extracted from User Input Loop",
                    domain: "mechanical",
                    topics: ["Thermostat", "Coolant", "Fatigue"],
                    difficulty: 490,
                    sourceType: "document",
                    sourceId: "user-ingest-terminal",
                    sourceReliability: 820,
                    verified: true,
                    contradictions: [],
                    timesReferenced: 1,
                    successRate: 710
                };
            } else if (hasFlashLoan) {
                extractedKU = {
                    id: `ku-ingest-${Date.now()}`,
                    content: "Newly Ingested: Oracle manipulation vulnerability triggers when smart contract protocols fetch single-block spot prices rather than TWAP (Time-Weighted Average Price).",
                    context: "High-yield DeFi mitigation architecture",
                    domain: "defi",
                    topics: ["TWAP", "Oracles", "Slippage"],
                    difficulty: 820,
                    sourceType: "forum",
                    sourceId: "user-ingest-terminal",
                    sourceReliability: 880,
                    verified: true,
                    contradictions: [],
                    timesReferenced: 1,
                    successRate: 640
                };
            } else {
                // General software node
                extractedKU = {
                    id: `ku-ingest-${Date.now()}`,
                    content: `Newly Ingested: ${ingestText.slice(0, 150)}${ingestText.length > 150 ? '...' : ''}`,
                    context: "Atomic directive extracted via raw user pipeline",
                    domain: "software",
                    topics: ["Ingestion", "Context", "CLI"],
                    difficulty: 540,
                    sourceType: "document",
                    sourceId: "user-ingest-terminal",
                    sourceReliability: 790,
                    verified: true,
                    contradictions: [],
                    timesReferenced: 1,
                    successRate: 800
                };
            }

            setKnowledgeUnits(prev => [extractedKU, ...prev]);
            setSelectedKnowledgeUnit(extractedKU);
            setCphPool(prev => prev - 150); // Extracting takes some CPH
            setIsExtracting(false);
            setIngestText("");
            playSynthBeep(660, 'sine', 0.1);
        }, 1800);
    };

    // ----------------------------------------------------
    // CURRICULUM ACTIONS
    // ----------------------------------------------------
    const createCurriculum = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, domain, focusArea, targetAudience, objectives } = newCurriculumForm;
        if (!name || !focusArea) return;

        playSynthBeep(440, 'triangle', 0.15);

        const objectivesList = objectives.split(',').map(o => o.trim()).filter(Boolean);
        const designedLevels: CurriculumLevel[] = [
            {
                levelNumber: 1,
                title: `${focusArea} Foundations`,
                description: `Initial mastery of core ${domain} concepts in simulated scenarios.`,
                knowledgeUnitsRequired: knowledgeUnits.filter(k => k.domain === domain).map(k => k.id).slice(0, 1),
                minScore: 70,
                studyEstimateHours: 3,
                experienceGranted: 200
            },
            {
                levelNumber: 2,
                title: `Advanced ${focusArea} Workflows`,
                description: `Deep-dive diagnostic challenges and real-time failure adjustments.`,
                knowledgeUnitsRequired: knowledgeUnits.filter(k => k.domain === domain).map(k => k.id).slice(0, 2),
                minScore: 80,
                studyEstimateHours: 5,
                experienceGranted: 400
            }
        ];

        const newCurr: Curriculum = {
            id: `curr-custom-${Date.now()}`,
            name,
            domain,
            focusArea,
            targetAudience,
            objectives: objectivesList.length > 0 ? objectivesList : [`Master ${focusArea}`],
            levels: designedLevels,
            certifiedValueBoost: domain === 'software' ? 35 : 20,
            skillEfficiencyBonus: domain === 'software' ? 100 : 70,
            useHistoricalData: true,
            selfCured: false
        };

        setCurricula(prev => [...prev, newCurr]);
        setSelectedCurriculumId(newCurr.id);
        setNewCurriculumForm({
            name: "",
            domain: "software",
            focusArea: "",
            targetAudience: "beginner",
            objectives: ""
        });
        playSynthBeep(880, 'sine', 0.1);
    };

    // ----------------------------------------------------
    // ACTIVE STUDENT STUDY ENGINE
    // ----------------------------------------------------
    const engageStudyStep = (studentId: string) => {
        playSynthBeep(523.25, 'sine', 0.05); // C5
        setStudentAgents(prev => prev.map(stud => {
            if (stud.id !== studentId) return stud;

            const increment = Math.floor(Math.random() * 15) + 10;
            let currentProg = stud.progressPercentage + increment;
            let level = stud.currentLevelNumber;
            let status = stud.status;

            if (currentProg >= 100) {
                currentProg = 100;
                status = 'testing';
                playSynthBeep(783.99, 'sine', 0.2); // G5 - ready for exam!
            } else {
                status = 'studying';
            }

            // Update comprehension with small positive shift when studying
            const newComprehension = Math.min(1000, stud.overallComprehension + Math.floor(Math.random() * 12));

            return {
                ...stud,
                progressPercentage: currentProg,
                overallComprehension: newComprehension,
                cphSpent: stud.cphSpent + 12,
                hoursStudied: stud.hoursStudied + 1,
                status
            };
        }));
        
        setCphPool(prev => prev - 12);
    };

    const hireNewStudent = () => {
        const names = ["Compiler Clara", "DeFi Drake", "Security Simon", "Model Max", "GCP Grace"];
        const avatars = ["👩‍💻", "💹", "🤖", "🚀", "⚙️"];
        const domains = ["cognitive", "defi", "security", "alignment", "mechanical"];
        
        const randomIndex = Math.floor(Math.random() * names.length);
        const name = names[randomIndex] + " (Aux " + Math.floor(Math.random() * 90 + 10) + ")";
        const avatar = avatars[randomIndex];
        
        playSynthBeep(370, 'triangle', 0.12);

        const newStud: StudentAgent = {
            id: `st-aux-${Date.now()}`,
            name,
            avatar,
            activeCurriculumId: null,
            currentLevelNumber: 1,
            progressPercentage: 0,
            overallComprehension: Math.floor(Math.random() * 200) + 700,
            cphSpent: 0,
            hoursStudied: 0,
            certifications: [],
            status: "idle"
        };

        setStudentAgents(prev => [...prev, newStud]);
        setSelectedStudentId(newStud.id);
    };

    const changeStudentCurriculum = (studentId: string, currId: string | null) => {
        playSynthBeep(349.23, 'sine', 0.08); // F4
        setStudentAgents(prev => prev.map(s => {
            if (s.id !== studentId) return s;
            return {
                ...s,
                activeCurriculumId: currId,
                currentLevelNumber: 1,
                progressPercentage: 0,
                status: currId ? 'studying' : 'idle'
            };
        }));
    };

    // ----------------------------------------------------
    // INTERACTIVE EXAM ENGINE & GRADING
    // ----------------------------------------------------
    const startLevelExam = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student || !student.activeCurriculumId) return;

        playSynthBeep(587.33, 'triangle', 0.15); // D5

        setActiveExam({
            studentId,
            curriculumId: student.activeCurriculumId,
            levelNumber: student.currentLevelNumber,
            step: 0,
            score: 0,
            answers: [],
            active: true
        });
    };

    const submitExamAnswer = (isCorrect: boolean) => {
        if (!activeExam) return;

        const newAnswers = [...activeExam.answers, isCorrect];
        const point = isCorrect ? 333 : 0;
        const newScore = activeExam.score + point;
        const nextStep = activeExam.step + 1;

        if (nextStep >= 3) {
            // Finalize Exam!
            const finalScorePercentage = Math.round((newAnswers.filter(Boolean).length / 3) * 100);
            
            // Check curriculum details
            const curr = curricula.find(c => c.id === activeExam.curriculumId);
            const levelRule = curr?.levels.find(l => l.levelNumber === activeExam.levelNumber);
            const passTarget = levelRule?.minScore || 75;

            const passed = finalScorePercentage >= passTarget;

            playSynthBeep(passed ? 880 : 220, 'sine', 0.3);

            if (passed) {
                // Award Certification if it's the final level, or upgrade level
                const totalLevels = curr?.levels.length || 1;
                const isFinalLevel = activeExam.levelNumber >= totalLevels;

                setStudentAgents(prev => prev.map(s => {
                    if (s.id !== activeExam.studentId) return s;

                    let certs = s.certifications;
                    let nextLvlNum = s.currentLevelNumber;
                    let stat = s.status;

                    if (isFinalLevel) {
                        centsAward(activeExam.studentId, activeExam.curriculumId, finalScorePercentage);
                        stat = 'graduated';
                    } else {
                        nextLvlNum += 1;
                        stat = 'studying';
                    }

                    return {
                        ...s,
                        currentLevelNumber: nextLvlNum,
                        progressPercentage: 0,
                        overallComprehension: Math.min(1000, s.overallComprehension + 100),
                        status: stat as any
                    };
                }));
            } else {
                // Failed: reset progress to 75% for revision
                setStudentAgents(prev => prev.map(s => {
                    if (s.id !== activeExam.studentId) return s;
                    return {
                        ...s,
                        progressPercentage: 75,
                        status: 'studying'
                    };
                }));
            }

            setActiveExam(null);
        } else {
            playSynthBeep(isCorrect ? 659.25 : 293.66, 'sine', 0.08); // Mi5 or Re4
            setActiveExam({
                ...activeExam,
                step: nextStep,
                score: newScore,
                answers: newAnswers
            });
        }
    };

    const centsAward = (studentId: string, currId: string, score: number) => {
        const student = students.find(s => s.id === studentId);
        const curr = curricula.find(c => c.id === currId);
        if (!student || !curr) return;

        const certId = `cert-gen-${Date.now()}`;
        const verifiableSignature = `0xDA${Math.floor(Math.random()*900000+100000).toString(16).toUpperCase()}`;

        const newCert: ActiveCertification = {
            id: certId,
            agentId: studentId,
            agentName: student.name,
            curriculumId: currId,
            curriculumName: curr.name,
            domain: curr.domain,
            issueDate: new Date().toISOString().split('T')[0],
            signature: verifiableSignature,
            cphValueBoost: curr.certifiedValueBoost,
            efficiencyBonus: curr.skillEfficiencyBonus,
            overallScore: score * 10
        };

        setCertifications(prev => [newCert, ...prev]);
    };

    // ----------------------------------------------------
    // SELF-HEALING OPTIMIZER
    // ----------------------------------------------------
    const triggerAcademyOptimization = () => {
        playSynthBeep(180, 'sine', 0.5); // Deep sub-bass drop

        setTimeout(() => {
            // Solve bottlenecks by enhancing the Knowledge Units difficulty representation
            setKnowledgeUnits(prev => prev.map(ku => {
                if (ku.id === "ku-mechanic-003") {
                    return { ...ku, content: ku.content + " (Enhanced with visual diagnostic overlays and mechanical trace helpers)", successRate: Math.min(1000, ku.successRate + 220) };
                }
                if (ku.id === "ku-security-001") {
                    return { ...ku, content: ku.content + " (Upgraded with proactive isolation guidelines)", successRate: Math.min(1000, ku.successRate + 180) };
                }
                return ku;
            }));

            // Lower bottleneck fail rates in optimization log
            setBottlenecks(prev => prev.map(bn => ({
                ...bn,
                failRate: Math.max(5, Math.floor(bn.failRate * 0.35))
            })));

            // Cost CPH pool but improves learning capacity
            setCphPool(prev => prev - 500);
            
            // Mark curricula as optimized
            setCurricula(prev => prev.map(c => ({ ...c, selfCured: true })));

            playSynthBeep(880, 'sine', 0.1);
            playSynthBeep(1100, 'sine', 0.15);
        }, 1500);
    };

    // Help generate dynamic exam questions based on curriculum
    const getExamQuestion = () => {
        if (!activeExam) return { text: "", isCorrectTrue: true };

        const testStep = activeExam.step;
        if (activeExam.curriculumId === "curr-vehicle-diag") {
            if (activeExam.levelNumber === 1) {
                if (testStep === 0) return { text: "Is OBD-II diagnostic stream measured directly in raw hexadecimal values (PIDs)?", isCorrectTrue: true };
                if (testStep === 1) return { text: "Does a higher PID telemetry rate consume more CPH than a standard passive state?", isCorrectTrue: true };
                return { text: "Do standard OBD-II modules communicate over CAN high and CAN low at 9600 baud instead of 500kbps?", isCorrectTrue: false };
            } else if (activeExam.levelNumber === 2) {
                if (testStep === 0) return { text: "Does P0128 fault code trigger the engine to run lean in order to lower emissions?", isCorrectTrue: false };
                if (testStep === 1) return { text: "Will keeping the thermostat stuck open allow the HEMI V8 to achieve its sacred 195°F thermal ceiling?", isCorrectTrue: false };
                return { text: "Does the ECU rely on engine coolant temperature to determine when to switch into Closed Loop fueling?", isCorrectTrue: true };
            }
        }
        
        // Software or general questions
        if (testStep === 0) return { text: "To avoid startup delay with 500+ commands, must we discard all package-level init() references?", isCorrectTrue: true };
        if (testStep === 1) return { text: "Does oclif framework cache metadata in a serialized XML file instead of a lightweight manifest.json?", isCorrectTrue: false };
        return { text: "Can dynamic module loading on-demand significantly reduce runtime import costs?", isCorrectTrue: true };
    };

    const examQuestion = getExamQuestion();

    return (
        <div id="data-academy-root" className="min-h-screen bg-[#070913] text-zinc-100 font-sans p-2 sm:p-6">
            
            {/* Top Navigation & Title Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-indigo-950/50 pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black font-mono tracking-widest uppercase">Self-Sufficient Learning Engine</span>
                        <span className="text-[10px] text-zinc-500 font-mono">SYS_STATE: LIVE // AUTONOMOUS_CURRICULUM</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-3">
                        <BookIcon className="w-8 h-8 text-indigo-400" />
                        The Data Academy
                    </h1>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/60 p-2 sm:px-4 rounded-lg border border-zinc-800">
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">AVAILABLE COMPUTATIONAL CAPACITY</p>
                        <p className="text-base sm:text-lg font-black font-mono text-cyan-400">
                            {cphPool.toLocaleString()} <span className="text-zinc-600 text-xs">CPH</span>
                        </p>
                    </div>
                    <div className="p-2 rounded bg-cyan-900/20 text-cyan-400">
                        <ActivityIcon className="w-5 h-5 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-900 pb-px">
                <button 
                    onClick={() => { playSynthBeep(261.63, 'sine', 0.05); setActiveTab('students'); }}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'students' ? 'border-indigo-500 text-white bg-indigo-950/20' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
                >
                    🎓 Classrooms & Agents
                </button>
                <button 
                    onClick={() => { playSynthBeep(293.66, 'sine', 0.05); setActiveTab('curriculum'); }}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'curriculum' ? 'border-indigo-500 text-white bg-indigo-950/20' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
                >
                    📚 Adaptive Curricula
                </button>
                <button 
                    onClick={() => { playSynthBeep(329.63, 'sine', 0.05); setActiveTab('knowledge'); }}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'knowledge' ? 'border-indigo-500 text-white bg-indigo-950/20' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
                >
                    🔬 Ingest & Knowledge Base
                </button>
                <button 
                    onClick={() => { playSynthBeep(349.23, 'sine', 0.05); setActiveTab('optimizer'); }}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'optimizer' ? 'border-indigo-500 text-white bg-indigo-950/20' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
                >
                    ⚙️ Dynamic Optimizer {bottlenecks.some(b => b.failRate > 10) && <span className="w-2 h-2 rounded bg-amber-500 inline-block animate-pulse ml-1" />}
                </button>
            </div>

            {/* MAIN CONTENT BLOCK */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Side: General Section Views */}
                <div className="lg:col-span-8 space-y-6">

                    {/* TAB 1: STUDY CLASSROOMS AND STUDENT ROSTER */}
                    {activeTab === 'students' && (
                        <div className="space-y-6">
                            
                            {/* Student Registry Card */}
                            <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-lg font-black uppercase tracking-tight text-white">Active Student Agents</h2>
                                        <p className="text-xs text-zinc-500">Autonomous intelligence suites configured to expand task capabilities through education.</p>
                                    </div>
                                    <button 
                                        onClick={hireNewStudent}
                                        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-white transition-all"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        Initialize Agent
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {students.map(stud => {
                                        const enrolledCurr = curricula.find(c => c.id === stud.activeCurriculumId);
                                        return (
                                            <div 
                                                key={stud.id}
                                                className={`border rounded-xl p-4 transition-all cursor-pointer ${selectedStudentId === stud.id ? 'bg-indigo-950/25 border-indigo-500' : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'}`}
                                                onClick={() => { playSynthBeep(220, 'sine', 0.05); setSelectedStudentId(stud.id); }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xl shadow-inner">
                                                            {stud.avatar}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-white uppercase tracking-tight">{stud.name}</h3>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest ${
                                                                stud.status === 'studying' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800/50' :
                                                                stud.status === 'testing' ? 'bg-purple-950 text-purple-400 border border-purple-800/50 animate-pulse' :
                                                                stud.status === 'graduated' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                                                                'bg-zinc-800 text-zinc-400'
                                                            }`}>
                                                                {stud.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-zinc-500 font-mono">COMPREHENSION</span>
                                                        <p className="text-xs font-black font-mono text-indigo-400">{(stud.overallComprehension / 10).toFixed(1)}%</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-zinc-900 space-y-2">
                                                    {enrolledCurr ? (
                                                        <div>
                                                            <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                                                                <span className="truncate max-w-[180px] font-bold uppercase">{enrolledCurr.name}</span>
                                                                <span className="font-mono">LVL {stud.currentLevelNumber}</span>
                                                            </div>
                                                            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden p-0.5 border border-zinc-800/55">
                                                                <div 
                                                                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                                                                    style={{ width: `${stud.progressPercentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-center italic text-xs text-zinc-500 py-1">No active curriculum configured</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active Classroom Panel / Exam Area */}
                            {selectedStudentId && (
                                <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-6">
                                    {(() => {
                                        const agent = students.find(s => s.id === selectedStudentId);
                                        const curr = curricula.find(c => c.id === agent?.activeCurriculumId);
                                        if (!agent) return null;

                                        return (
                                            <div>
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-4 mb-6">
                                                    <div>
                                                        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Classroom Interface</h3>
                                                        <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">{agent.name} Status Protocol</h2>
                                                    </div>
                                                    <div className="flex gap-2 mt-3 sm:mt-0">
                                                        <div className="text-xs bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                                                            <span className="text-zinc-500">STUDIED:</span> <span className="font-bold text-white">{agent.hoursStudied}h</span>
                                                        </div>
                                                        <div className="text-xs bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                                                            <span className="text-zinc-500">CAPACITY USED:</span> <span className="font-bold text-white font-mono">{agent.cphSpent} CPH</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Active Exam Overlay */}
                                                {activeExam && activeExam.studentId === agent.id ? (
                                                    <div className="bg-[#0b0c16] rounded-xl p-6 border border-purple-900/35 relative overflow-hidden">
                                                        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest animate-pulse">CRITICAL GRADUATION EVALUATION</span>
                                                                <h4 className="text-base font-bold text-white uppercase mt-1">Concentric Comprehensive Exam • Level {activeExam.levelNumber}</h4>
                                                            </div>
                                                            <div className="text-xs bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded text-zinc-400">
                                                                QUESTION <span className="font-bold text-white">{activeExam.step + 1} / 3</span>
                                                            </div>
                                                        </div>

                                                        {/* Question Body */}
                                                        <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-900 my-4 text-center">
                                                            <p className="text-base text-zinc-200 leading-relaxed font-bold">{examQuestion.text}</p>
                                                        </div>

                                                        {/* Response Buttons */}
                                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                                            <button 
                                                                onClick={() => submitExamAnswer(examQuestion.isCorrectTrue === true)}
                                                                className="py-3 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-black uppercase tracking-wider text-white transition-all border border-emerald-500/20"
                                                            >
                                                                TRUE / CONGRUENT
                                                            </button>
                                                            <button 
                                                                onClick={() => submitExamAnswer(examQuestion.isCorrectTrue === false)}
                                                                className="py-3 rounded bg-red-600 hover:bg-red-700 text-xs font-black uppercase tracking-wider text-white transition-all border border-red-500/20"
                                                            >
                                                                FALSE / INCONGRUENT
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {/* Curriculum Management Block */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/20 p-4 rounded-lg border border-zinc-900">
                                                            <div>
                                                                <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-black block mb-2">Target Study Course</label>
                                                                <select 
                                                                    value={agent.activeCurriculumId || ""}
                                                                    onChange={e => changeStudentCurriculum(agent.id, e.target.value ? e.target.value : null)}
                                                                    className="bg-black border border-zinc-800 rounded p-2 text-xs uppercase font-extrabold text-indigo-400 focus:outline-none w-full"
                                                                >
                                                                    <option value="">-- STANDBY / IDLE --</option>
                                                                    {curricula.map(c => (
                                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="flex justify-end items-end gap-2 mt-3 md:mt-0">
                                                                {curr ? (
                                                                    <div className="grid grid-cols-2 gap-2 w-full">
                                                                        <button 
                                                                            disabled={agent.status === 'testing' || agent.status === 'graduated'}
                                                                            onClick={() => engageStudyStep(agent.id)}
                                                                            className="py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider text-cyan-400 border border-zinc-800 hover:border-zinc-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                                                                        >
                                                                            <LearnIcon className="w-3.5 h-3.5" />
                                                                            Engage Study
                                                                        </button>
                                                                        <button 
                                                                            disabled={agent.status !== 'testing'}
                                                                            onClick={() => startLevelExam(agent.id)}
                                                                            className="py-2.5 rounded bg-indigo-600 hover:bg-indigo-700 text-xs font-black uppercase tracking-wider text-white disabled:opacity-50 transition-all flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/10"
                                                                        >
                                                                            <StarIcon className="w-3.5 h-3.5" />
                                                                            Take Exam
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-zinc-500 text-xs italic">Enroll in a custom learning track to engage active processing loops.</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Study Progress overview */}
                                                        {curr && (
                                                            <div className="bg-zinc-900/10 p-5 rounded-lg border border-zinc-900 space-y-4">
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <div>
                                                                        <span className="text-zinc-500 uppercase tracking-widest font-black block">Active Level Goal</span>
                                                                        <span className="font-bold text-white mt-1 block">Level {agent.currentLevelNumber}: {curr.levels[agent.currentLevelNumber - 1]?.title}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-zinc-500 uppercase tracking-widest font-black block">Level Progress</span>
                                                                        <span className="font-bold font-mono text-white text-sm mt-1 block">{agent.progressPercentage}%</span>
                                                                    </div>
                                                                </div>

                                                                {/* Visual Interactive Map of level's required concepts */}
                                                                <div>
                                                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-3">REQUIRED ATOMIC FACTORS FOR THIS LEVEL</p>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                                        {curr.levels[agent.currentLevelNumber - 1]?.knowledgeUnitsRequired.map(kuId => {
                                                                            const kuItem = knowledgeUnits.find(k => k.id === kuId);
                                                                            if (!kuItem) return null;
                                                                            return (
                                                                                <div key={kuId} className="bg-zinc-950 p-3 rounded border border-zinc-800/80 flex items-start gap-2.5 hover:border-zinc-700 transition-all">
                                                                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                                                                                    <div>
                                                                                        <p className="font-semibold text-zinc-300 leading-tight line-clamp-2">{kuItem.content}</p>
                                                                                        <span className="text-[9px] text-indigo-400 font-mono tracking-wider block mt-1 uppercase">RELIABILITY: {kuItem.sourceReliability / 10}%</span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                        </div>
                    )}


                    {/* TAB 2: ADAPTIVE CURRICULA DESIGN */}
                    {activeTab === 'curriculum' && (
                        <div className="space-y-6">
                            
                            {/* Curriculum Creator */}
                            <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-6 relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                                <h2 className="text-lg font-black uppercase tracking-tight text-white mb-2">Initialize Self-Healing Curriculum</h2>
                                <p className="text-xs text-zinc-500 mb-6">Orchestrate a sequence of levels from ingested knowledge nodes to train your simulated agents automatically.</p>

                                <form onSubmit={createCurriculum} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Curriculum Name / Course Title</label>
                                            <input 
                                                type="text"
                                                value={newCurriculumForm.name}
                                                onChange={e => setNewCurriculumForm(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="e.g. Cognitive Systems Alignment"
                                                className="bg-black/60 border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Knowledge Domain Namespace</label>
                                            <select 
                                                value={newCurriculumForm.domain}
                                                onChange={e => setNewCurriculumForm(prev => ({ ...prev, domain: e.target.value as any }))}
                                                className="bg-black border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none w-full"
                                            >
                                                <option value="software">SOFTWARE ENGINEERING</option>
                                                <option value="mechanical">AUTOMOTIVE MECHANICAL</option>
                                                <option value="cognitive">COGNITIVE PSYCHOLOGY</option>
                                                <option value="security">EMERGENCY SECURITY</option>
                                                <option value="defi">DECENTRALIZED DEFI</option>
                                                <option value="alignment">AI ALIGNMENT</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Focus Area Paradigm</label>
                                            <input 
                                                type="text"
                                                value={newCurriculumForm.focusArea}
                                                onChange={e => setNewCurriculumForm(prev => ({ ...prev, focusArea: e.target.value }))}
                                                placeholder="e.g. LLM Reasoning or Spark Compression"
                                                className="bg-black/60 border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Objectives (comma-separated)</label>
                                            <input 
                                                type="text"
                                                value={newCurriculumForm.objectives}
                                                onChange={e => setNewCurriculumForm(prev => ({ ...prev, objectives: e.target.value }))}
                                                placeholder="Decipher signals, stabilize parameters, verify context"
                                                className="bg-black/60 border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-4 flex justify-between items-center border-t border-zinc-900 mt-2">
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    defaultChecked 
                                                    className="rounded bg-black border-zinc-800 text-indigo-600 focus:ring-0"
                                                />
                                                Use past student failure metrics
                                            </label>
                                            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    defaultChecked 
                                                    className="rounded bg-black border-zinc-800 text-indigo-600 focus:ring-0"
                                                />
                                                Self-heal bottleneck levels
                                            </label>
                                        </div>
                                        <button 
                                            type="submit"
                                            className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 transition-all"
                                        >
                                            Construct Adaptive Path
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Curriculum Listing */}
                            <div className="grid grid-cols-1 gap-4">
                                {curricula.map(curr => (
                                    <div 
                                        key={curr.id}
                                        className={`bg-zinc-950/90 border rounded-xl p-6 transition-all ${selectedCurriculumId === curr.id ? 'border-indigo-500/60' : 'border-zinc-900'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                        curr.domain === 'mechanical' ? 'bg-orange-950 text-orange-400 border border-orange-800/40' :
                                                        curr.domain === 'software' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' :
                                                        'bg-zinc-900 text-zinc-400'
                                                    }`}>
                                                        {curr.domain}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 font-mono">OBJECTIVES: {curr.objectives.length}</span>
                                                    {curr.selfCured && (
                                                        <span className="text-[9px] font-black font-mono text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">OPTIMIZED (CURED)</span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-black text-white mt-2 uppercase tracking-tight">{curr.name}</h3>
                                                <p className="text-xs text-zinc-500 mt-1 font-mono">FOCUS: {curr.focusArea}</p>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-widest">SALARY VALUE BOOST</span>
                                                <span className="text-sm font-black text-emerald-400 font-mono mt-1 block">+${curr.certifiedValueBoost}/hr</span>
                                            </div>
                                        </div>

                                        {/* Path Levels Grid */}
                                        <div className="mt-6 pt-4 border-t border-zinc-900">
                                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-3">CURRICULUM LEVEL STRUCTURE</p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {curr.levels.map(lvl => (
                                                    <div key={lvl.levelNumber} className="bg-zinc-900/30 p-3 rounded border border-zinc-800/50 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-center text-xs text-zinc-400 border-b border-zinc-850 pb-1.5 mb-2">
                                                                <span className="font-bold font-mono">LEVEL {lvl.levelNumber}</span>
                                                                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1 rounded font-black">MIN_SCORE: {lvl.minScore}%</span>
                                                            </div>
                                                            <h4 className="text-xs font-bold text-white uppercase tracking-tight line-clamp-1">{lvl.title}</h4>
                                                            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-snug">{lvl.description}</p>
                                                        </div>

                                                        <div className="mt-3 pt-2 border-t border-zinc-900 flex justify-between text-[9px] text-zinc-500 font-mono">
                                                            <span>KUs REQUIRED: {lvl.knowledgeUnitsRequired.length}</span>
                                                            <span>EST: {lvl.studyEstimateHours}h</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}


                    {/* TAB 3: KNOWLEDGE INGESTION PIPELINE */}
                    {activeTab === 'knowledge' && (
                        <div className="space-y-6">
                            
                            {/* Raw Data Doc input areas */}
                            <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                                <div className="flex items-center gap-3 mb-4">
                                    <DatabaseIcon className="w-6 h-6 text-cyan-400" />
                                    <div>
                                        <h2 className="text-lg font-black uppercase tracking-tight text-white">Ingest Raw Knowledge Pipeline</h2>
                                        <p className="text-xs text-zinc-500">Provide official vehicle manuals, engineering specifications, or smart contract snippets. The parsing wizard extracts atomic facts with verified confidence thresholds.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleIngestSubmit} className="space-y-4">
                                    <div>
                                        <textarea 
                                            value={ingestText}
                                            onChange={e => setIngestText(e.target.value)}
                                            placeholder="Paste document fragments here to extract knowledge. (e.g. 'Cooling fan engagement levels operate under closed loop rules at 195F coolant temperature...')"
                                            rows={4}
                                            className="w-full bg-black/60 border border-zinc-800 rounded-lg p-3 text-xs focus:outline-none focus:border-cyan-500 placeholder:text-zinc-600 font-mono"
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500 font-mono">Cost to extract: <span className="text-cyan-400 font-semibold font-mono">150 CPH</span></span>
                                        <button 
                                            type="submit"
                                            disabled={isExtracting || !ingestText.trim()}
                                            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            {isExtracting ? (
                                                <>
                                                    <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                                                    Parsing...
                                                </>
                                            ) : (
                                                <>
                                                    <SparklesIcon className="w-3.5 h-3.5" />
                                                    Extract Micro-Directives
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Active Ingested DB statistics */}
                            <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-6">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Ingestion Infrastructure</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {ingestionConfigs.map(config => (
                                        <div key={config.id} className="bg-zinc-900/20 rounded-lg border border-zinc-800/80 p-4">
                                            <div className="flex justify-between text-xs text-zinc-500 mb-2">
                                                <span className="uppercase font-bold tracking-widest">{config.type}</span>
                                                <span className="font-mono">RELIABILITY: {config.qualityRating / 10}%</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-white leading-tight mb-2 truncate">{config.name}</h4>
                                            <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-zinc-900/60 text-zinc-400">
                                                <span>METADATA COUNT</span>
                                                <span className="font-bold text-zinc-200">{config.extractedCount.toLocaleString()} PIDs</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Graphical Network representation block */}
                            <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-6 relative">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-lg font-black uppercase tracking-tight text-white">Knowledge Node Cluster Map</h2>
                                        <p className="text-xs text-zinc-500">Visualization of prerequisite dependencies and difficulty relationships between nodes.</p>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-mono">
                                        NODES: <span className="font-bold text-indigo-400 font-mono">{knowledgeUnits.length}</span>
                                    </div>
                                </div>

                                {/* Abstract Node Link Visualization Canvas */}
                                <div className="relative bg-[#090b15] h-64 rounded-xl border border-zinc-850 overflow-hidden flex items-center justify-center p-4">
                                    {/* Abstract Grid background */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

                                    {/* SVG Links */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                                        <path d="M 120 80 Q 200 40 320 100" stroke="#6366f1" strokeWidth="1.5" fill="none" className="neural-connection" />
                                        <path d="M 320 100 Q 400 180 250 200" stroke="#f59e0b" strokeWidth="1.5" fill="none" className="neural-connection" />
                                        <path d="M 250 200 Q 180 150 120 80" stroke="#10b981" strokeWidth="1.5" fill="none" className="neural-connection" />
                                        <path d="M 320 100 Q 480 50 620 90" stroke="#3b82f6" strokeWidth="1.5" fill="none" className="neural-connection" />
                                        <path d="M 620 90 Q 550 180 450 140" stroke="#8b5cf6" strokeWidth="1.5" fill="none" className="neural-connection" />
                                    </svg>

                                    {/* Visual Representation of Active Interactive Map Nodes */}
                                    <div className="relative w-full h-full flex flex-wrap justify-around items-center p-3">
                                        {knowledgeUnits.slice(0, 6).map((k, index) => {
                                            const colors = {
                                                mechanical: "border-orange-500 bg-orange-950/20 text-orange-400",
                                                software: "border-cyan-500 bg-cyan-950/20 text-cyan-400",
                                                cognitive: "border-purple-500 bg-purple-950/20 text-purple-400",
                                                security: "border-red-500 bg-red-950/20 text-red-400",
                                                defi: "border-green-500 bg-green-950/20 text-green-400",
                                                alignment: "border-amber-500 bg-amber-950/20 text-amber-400"
                                            };
                                            return (
                                                <button 
                                                    key={k.id}
                                                    onClick={() => { playSynthBeep(440 + index * 60, 'sine', 0.05); setSelectedKnowledgeUnit(k); }}
                                                    className={`m-2 p-2.5 rounded-lg border text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 transition-all shadow-md ${colors[k.domain] || 'border-zinc-800 bg-zinc-900'} ${selectedKnowledgeUnit?.id === k.id ? 'scale-110 ring-2 ring-white/20' : 'hover:scale-105'}`}
                                                >
                                                    <span className="font-mono text-[9px] text-zinc-500">[{k.id.split('-').pop()}]</span>
                                                    {k.topics[0]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}


                    {/* TAB 4: SYSTEM BOTTLENECKS, ANALYTICS AND SELF-HEAL DIRECTIVE */}
                    {activeTab === 'optimizer' && (
                        <div className="space-y-6">
                            
                            {/* Detailed Analytics and Performance block */}
                            <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-6 relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-lg font-black uppercase tracking-tight text-white">Continuous Self-Improvement Ledger</h2>
                                        <p className="text-xs text-zinc-500">The Data Academy maps student agent friction points and uses autonomous genetic code updates to alleviate curriculum challenges.</p>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-mono">
                                        INTEGRITY LEVEL: <span className="font-bold text-emerald-400">99.4%</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {bottlenecks.map(bn => (
                                        <div key={bn.id} className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${bn.type === 'severe' ? 'bg-red-950 text-red-500 border border-red-900' : 'bg-yellow-950 text-yellow-500 border border-yellow-900'}`}>
                                                        {bn.type} friction
                                                    </span>
                                                    <span className="text-xs font-bold text-zinc-300 uppercase">{bn.location}</span>
                                                </div>
                                                <p className="text-xs text-zinc-400 mt-1"><span className="text-zinc-500 font-bold uppercase mr-1">POINT:</span> {bn.code}</p>
                                                <p className="text-xs text-zinc-500 italic mt-1">{bn.reason}</p>
                                            </div>

                                            <div className="text-right w-full md:w-32 flex flex-col items-end flex-shrink-0">
                                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">AGENT FAIL RATE</span>
                                                <span className="text-2xl font-black font-mono text-red-400 mt-1">{bn.failRate}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-5 border-t border-zinc-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="text-xs text-zinc-500">
                                        <span className="font-semibold text-zinc-400 block mb-1">Adaptive Self-Compensation Engine</span>
                                        Optimization injects redundant instructions, decreases comprehension score targets automatically, and reduces friction by 65%. 
                                        Requires <span className="text-amber-400 font-bold font-mono">500 CPH</span> from capacity pool.
                                    </div>
                                    
                                    <button 
                                        onClick={triggerAcademyOptimization}
                                        disabled={!bottlenecks.some(b => b.failRate > 10)}
                                        className="w-full sm:w-auto px-6 py-3 rounded bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 inline-block focus:outline-none truncate"
                                    >
                                        🧠 Automate Healing Path
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}

                </div>

                {/* Right Side Sticky / Information Details Drawer / Certification Registry */}
                <div className="lg:col-span-4 space-y-6">

                    {/* General Side Detail Box */}
                    {activeTab === 'knowledge' && selectedKnowledgeUnit && (
                        <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-5 relative">
                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Target Node Inspector</h3>
                            <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-900 mb-4">
                                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-2">
                                    <span>ID: {selectedKnowledgeUnit.id}</span>
                                    <span className="uppercase text-cyan-400 font-bold">{selectedKnowledgeUnit.domain}</span>
                                </div>
                                <p className="text-xs font-bold text-white leading-relaxed">{selectedKnowledgeUnit.content}</p>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                                    <span className="text-zinc-500 font-semibold uppercase">COMPREHENSION THRESHOLD:</span>
                                    <span className="text-zinc-300 font-mono">{(selectedKnowledgeUnit.difficulty / 10).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                                    <span className="text-zinc-500 font-semibold uppercase">SOURCE CLASSIFICATION:</span>
                                    <span className="text-zinc-300 uppercase font-mono">{selectedKnowledgeUnit.sourceType} ({selectedKnowledgeUnit.sourceId})</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                                    <span className="text-zinc-500 font-semibold uppercase">RELIABILITY INDEX:</span>
                                    <span className="text-zinc-300 font-mono">{selectedKnowledgeUnit.sourceReliability / 10}%</span>
                                </div>
                                <div className="flex justify-between pb-1">
                                    <span className="text-zinc-500 font-semibold uppercase">MASTERY SUCCESS RATE:</span>
                                    <span className={`font-bold font-mono ${selectedKnowledgeUnit.successRate > 700 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {(selectedKnowledgeUnit.successRate / 10).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Certification Verifiable Ledger */}
                    <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Verifiable Certifications</h3>
                            <span className="text-[10px] text-zinc-500 font-mono">{certifications.length} ISSUED</span>
                        </div>

                        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                            {certifications.map(cert => (
                                <div key={cert.id} className="bg-[#0b0c15] p-4 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all text-xs">
                                    <div className="flex justify-between font-mono text-[9px] text-zinc-500 mb-2">
                                        <span>SIGN: {cert.signature}</span>
                                        <span>{cert.issueDate}</span>
                                    </div>
                                    <p className="font-bold text-white uppercase tracking-tight leading-snug">{cert.curriculumName}</p>
                                    
                                    <div className="mt-3 pt-2.5 border-t border-zinc-900 grid grid-cols-2 gap-2 text-[10px]">
                                        <div>
                                            <span className="text-zinc-500 font-bold block uppercase tracking-wider">GRADUATED AGENT</span>
                                            <span className="text-zinc-200 mt-0.5 block">{cert.agentName}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-zinc-500 font-bold block uppercase tracking-wider">EVALUATION GRADE</span>
                                            <span className="text-emerald-400 font-bold font-mono mt-0.5 block">{(cert.overallScore / 10).toFixed(1)}%</span>
                                        </div>
                                        <div className="mt-2 text-zinc-400 col-span-2 bg-zinc-900/30 p-1.5 rounded border border-zinc-855 text-[9px]">
                                            ⚡ Benefit: <span className="text-emerald-400 font-bold font-mono">+${cert.cphValueBoost} CPH boost</span> / hour & <span className="text-emerald-400 font-bold font-mono">+{(cert.efficiencyBonus / 10).toFixed(1)}%</span> speed.
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
};
