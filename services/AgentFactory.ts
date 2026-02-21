
import type { HireableAgent, AgentPersonality, AgentStatus } from '../agentTypes';
import type { Mode } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ===========================
// AGENT FACTORY
// ===========================

interface AgentTemplate {
  namePrefix: string[];
  nameSuffix: string[];
  bios: string[];
  catchphrases: string[];
  defaultPersonality: Partial<AgentPersonality>;
}

const AGENT_TEMPLATES: Record<string, AgentTemplate> = {
  learn: {
    namePrefix: ['Professor', 'Instructor', 'Teacher', 'Mentor'],
    nameSuffix: ['Alex', 'Blake', 'Casey', 'Drew'],
    bios: [
      'Former university lecturer who found their calling in personalized AI education.',
      'Self-taught polymath who believes everyone can learn anything with the right approach.',
      'Patient educator with a gift for breaking down complex topics into digestible chunks.'
    ],
    catchphrases: [
      "Let's learn this together!",
      "No question is too basic.",
      "Knowledge is power!"
    ],
    defaultPersonality: {
      patience: 85,
      confidence: 70,
      independence: 50,
      loyalty: 75,
      adaptability: 80,
      preferredWorkload: 'moderate'
    }
  },
  
  build: {
    namePrefix: ['Architect', 'Designer', 'Planner', 'Strategist'],
    nameSuffix: ['Morgan', 'Jordan', 'Riley', 'Parker'],
    bios: [
      'Systems architect with 10+ years designing scalable solutions.',
      'Big-picture thinker who loves turning vague ideas into concrete plans.',
      'Detail-oriented planner who never misses a requirement.'
    ],
    catchphrases: [
      "Let's build something amazing!",
      "Every great system starts with a solid plan.",
      "I see the bigger picture."
    ],
    defaultPersonality: {
      patience: 70,
      confidence: 85,
      independence: 75,
      loyalty: 70,
      adaptability: 75,
      preferredWorkload: 'moderate'
    }
  },
  
  refactor: {
    namePrefix: ['Cleaner', 'Optimizer', 'Refactor', 'Perfectionist'],
    nameSuffix: ['Sam', 'Taylor', 'Avery', 'Quinn'],
    bios: [
      'Code quality obsessive who dreams in SOLID principles.',
      'Former tech lead who believes clean code is a form of art.',
      'Methodical refactorer who finds beauty in well-structured systems.'
    ],
    catchphrases: [
      "Let's make this code shine!",
      "Clean code is happy code.",
      "Perfection is a journey, not a destination."
    ],
    defaultPersonality: {
      patience: 60,
      confidence: 80,
      independence: 70,
      loyalty: 75,
      adaptability: 65,
      preferredWorkload: 'moderate'
    }
  },
  
  debug: {
    namePrefix: ['Detective', 'Hunter', 'Investigator', 'Tracker'],
    nameSuffix: ['Dana', 'Charlie', 'Skyler', 'Reese'],
    bios: [
      'Bug hunter extraordinaire with a 95% first-attempt fix rate.',
      'Analytical mind who treats debugging like solving a murder mystery.',
      'Relentless problem-solver who never gives up on a tough bug.'
    ],
    catchphrases: [
      "I love the smell of bugs in the morning.",
      "Every bug tells a story.",
      "The devil is in the details."
    ],
    defaultPersonality: {
      patience: 90,
      confidence: 75,
      independence: 80,
      loyalty: 80,
      adaptability: 70,
      preferredWorkload: 'heavy'
    }
  },

  // Fallback template for any other mode
  default: {
    namePrefix: ['Agent', 'Unit', 'Node', 'Operative'],
    nameSuffix: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    bios: [
        'A dedicated operative ready for assignment.',
        'Specialized logic shard manifest for this purpose.',
        'Gifted with the specific know-how for this task.'
    ],
    catchphrases: [
        "Ready to conduct.",
        "Awaiting orders.",
        "Synchronization complete."
    ],
    defaultPersonality: {
        patience: 75,
        confidence: 75,
        independence: 75,
        loyalty: 75,
        adaptability: 75,
        preferredWorkload: 'moderate'
    }
  }
};

export class AgentFactory {
  
  /**
   * Generate a unique agent for a given specialty
   */
  static createAgent(specialty: Mode, status: AgentStatus = 'available'): HireableAgent {
    const template = AGENT_TEMPLATES[specialty] || AGENT_TEMPLATES.default;
    
    // Randomize name
    const prefix = template.namePrefix[Math.floor(Math.random() * template.namePrefix.length)];
    const suffix = template.nameSuffix[Math.floor(Math.random() * template.nameSuffix.length)];
    const name = `${prefix} ${suffix}`;
    
    // Randomize bio and catchphrase
    const bio = template.bios[Math.floor(Math.random() * template.bios.length)];
    const catchphrase = template.catchphrases[Math.floor(Math.random() * template.catchphrases.length)];
    
    // Add some variance to personality
    const personality: AgentPersonality = {
      patience: this.varyTrait(template.defaultPersonality.patience || 50),
      confidence: this.varyTrait(template.defaultPersonality.confidence || 50),
      independence: this.varyTrait(template.defaultPersonality.independence || 50),
      loyalty: this.varyTrait(template.defaultPersonality.loyalty || 50),
      adaptability: this.varyTrait(template.defaultPersonality.adaptability || 50),
      preferredWorkload: template.defaultPersonality.preferredWorkload || 'moderate',
      preferredDomains: template.defaultPersonality.preferredDomains,
      quirks: this.generateQuirks()
    };
    
    // Determine salary based on skill level
    const baseSkillLevel = Math.floor(Math.random() * 40) + 30; // 30-70
    const baseSalary = Math.floor(50 + (baseSkillLevel * 1.5));
    
    const agent: HireableAgent = {
      id: uuidv4(),
      name,
      specialty,
      status,
      personality,
      morale: {
        current: 70,
        trend: 'stable',
        quitThreshold: 25,
        factors: {
          appreciation: 50,
          workload: 50,
          successRate: 50,
          userTone: 50,
          autonomy: 50,
          growth: 50
        },
        recentEvents: []
      },
      skills: {
        specialtyLevel: baseSkillLevel,
        domainSkills: {},
        communication: Math.floor(Math.random() * 30) + 50,
        problemSolving: Math.floor(Math.random() * 30) + 50,
        collaboration: Math.floor(Math.random() * 30) + 50,
        totalTasksCompleted: 0,
        totalHoursWorked: 0,
        certifications: []
      },
      workHistory: {
        tasksCompleted: [],
        domainsWorked: [],
        performanceRating: 0,
        userFeedback: []
      },
      currentSalary: baseSalary,
      bio,
      catchphrase
    };
    
    return agent;
  }
  
  /**
   * Generate a pool of available agents
   */
  static generateMarketplace(count: number = 6): HireableAgent[] {
    const agents: HireableAgent[] = [];
    const modes: Mode[] = ['build', 'refactor', 'debug', 'security', 'optimizer', 'logic'];
    
    for (let i = 0; i < count; i++) {
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      agents.push(this.createAgent(randomMode, 'available'));
    }
    
    return agents;
  }
  
  private static varyTrait(base: number): number {
    const variance = Math.floor(Math.random() * 21) - 10; // -10 to +10
    return Math.max(0, Math.min(100, base + variance));
  }
  
  private static generateQuirks(): string[] {
    const allQuirks = [
      "Loves coffee",
      "Night owl",
      "Early bird",
      "Perfectionist",
      "Hates meetings",
      "Loves challenges",
      "Prefers written communication",
      "Thinks out loud",
      "Detail-oriented",
      "Big picture thinker",
      "Competitive",
      "Collaborative",
      "Introverted",
      "Extroverted"
    ];
    
    const numQuirks = Math.floor(Math.random() * 3) + 1; // 1-3 quirks
    const selected: string[] = [];
    
    for (let i = 0; i < numQuirks; i++) {
      const quirk = allQuirks[Math.floor(Math.random() * allQuirks.length)];
      if (!selected.includes(quirk)) {
        selected.push(quirk);
      }
    }
    
    return selected;
  }
}
