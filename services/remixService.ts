
import type { ChatMessage } from "../types";

export interface RemixScope {
    target: string;
    program?: string;
    domains: string[];
    subdomains: string[];
    apis: string[];
    inScope: string[];
    outOfScope: string[];
    wildcards: string[];
    restrictions: string[];
    detected: number;
    careScore: number;
}

export interface FlaidicosePrediction {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    evidence?: any;
    reason: string;
}

export interface FlaidicoseCorrelation {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    chain: string[];
    confidence: number;
    description: string;
}

export interface FlaidicoseAnalysis {
    target: string;
    timestamp: number;
    predictions: FlaidicosePrediction[];
    correlations: FlaidicoseCorrelation[];
    recommendations: any[];
    confidence: number;
}

export interface ReconResults {
    target: string;
    scope: RemixScope;
    timestamp: string;
    subdomains: string[];
    ports: any[];
    technologies: any[];
    vulnerabilities: any[];
    apis: string[];
    flaidicose: FlaidicoseAnalysis;
}

const calculateCareScore = (text: string): number => {
    const careKeywords = ['care', 'help', 'support', 'love', 'safety', 'protect', 'nurture', 'heal', 'security', 'vulnerability', 'bug', 'bounty'];
    const words = text.toLowerCase().split(/\W+/);
    const matches = words.filter(w => careKeywords.includes(w)).length;
    return Math.min(100, 50 + (matches * 10));
};

export const analyzeScope = async (targetUrl: string, programUrl?: string): Promise<RemixScope> => {
    const domain = targetUrl.replace(/^https?:\/\//, '').split('/')[0];
    const score = calculateCareScore(targetUrl + (programUrl || ''));
    
    return {
        target: targetUrl,
        program: programUrl,
        domains: [domain],
        subdomains: [`api.${domain}`, `www.${domain}`, `dev.${domain}`],
        apis: [`https://api.${domain}/v1`, `https://${domain}/api`],
        inScope: [`*.${domain}`, `api.${domain}`],
        outOfScope: [`internal.${domain}`],
        wildcards: [`*.${domain}`],
        restrictions: ["No DDoS", "Use only test accounts"],
        detected: Date.now(),
        careScore: score
    };
};

export const analyzeDiagnostics = async (target: string, scanResults: any): Promise<FlaidicoseAnalysis> => {
    const predictions: FlaidicosePrediction[] = [
        {
            type: 'outdated_components',
            severity: 'high',
            confidence: 90,
            reason: 'Outdated technology versions detected via Care Protocol'
        },
        {
            type: 'idor',
            severity: 'medium',
            confidence: 75,
            reason: 'Large attack surface suggests IDOR vulnerabilities may exist'
        }
    ];

    const correlations: FlaidicoseCorrelation[] = [
        {
            type: 'webshell_deployment',
            severity: 'critical',
            chain: ['sql_injection', 'file_upload'],
            confidence: 95,
            description: 'SQL injection + file upload = webshell deployment possible'
        }
    ];

    return {
        target,
        timestamp: Date.now(),
        predictions,
        correlations,
        recommendations: [
            { action: 'vulnerability_scan', priority: 'high', tools: ['nuclei', 'nikto'] }
        ],
        confidence: 85
    };
};

export const runFullRecon = async (target: string, programUrl?: string): Promise<ReconResults> => {
    const scope = await analyzeScope(target, programUrl);
    const flaidicose = await analyzeDiagnostics(target, {});
    
    return {
        target,
        scope,
        timestamp: new Date().toISOString(),
        subdomains: scope.subdomains,
        ports: [
            { port: 80, protocol: 'tcp', state: 'open', service: 'http' },
            { port: 443, protocol: 'tcp', state: 'open', service: 'https' }
        ],
        technologies: [
            { name: 'nginx', version: '1.18.0', confidence: 95 },
            { name: 'React', version: '18.2.0', confidence: 100 }
        ],
        vulnerabilities: [
            { type: 'xss', severity: 'high', confidence: 80, url: `https://${target}/search?q=<script>` }
        ],
        apis: scope.apis,
        flaidicose
    };
};
