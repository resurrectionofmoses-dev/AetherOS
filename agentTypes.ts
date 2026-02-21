
import type { Mode } from './types';

// ===========================
// AGENT LIFECYCLE SYSTEM
// ===========================

export type AgentStatus = 'available' | 'working' | 'resting' | 'quit' | 'on_notice';

export type MoraleLevel = 'excellent' | 'good' | 'neutral' | 'poor' | 'critical';

export interface AgentPersonality {
  // Core traits (0-100)
  patience: number;          // How tolerant of user mistakes/rudeness
  confidence: number;        // Willingness to assert opinions
  independence: number;      // Prefers autonomy vs guidance
  loyalty: number;          // Resistance to quitting
  adaptability: number;     // Learning speed across domains
  
  // Preferences
  preferredWorkload: 'light' | 'moderate' | 'heavy';
  preferredDomains?: string[]; // e.g., ['vehicle', 'home']
  
  // Quirks (optional flavor text)
  quirks?: string[];  // e.g., "Hates being interrupted", "Loves challenges"
}

export interface AgentMorale {
  current: number;           // 0-100
  trend: 'rising' | 'stable' | 'falling';
  quitThreshold: number;     // When morale hits this, agent quits
  
  // Morale factors
  factors: {
    appreciation: number;    // How often user says thanks, positive feedback
    workload: number;        // Tasks assigned vs capacity
    successRate: number;     // Task completion success
    userTone: number;        // Sentiment analysis of user messages
    autonomy: number;        // Freedom to make decisions
    growth: number;          // Learning opportunities
  };
  
  recentEvents: MoraleEvent[];
}

export interface MoraleEvent {
  timestamp: Date;
  type: 'praise' | 'criticism' | 'overwork' | 'success' | 'failure' | 'ignored' | 'trusted';
  impact: number;            // -10 to +10
  description: string;
}

export interface AgentSkills {
  // Core competency in their specialty
  specialtyLevel: number;    // 0-100
  
  // Cross-domain skills
  domainSkills: Record<string, number>; // e.g., { 'vehicle': 75, 'home': 30 }
  
  // Meta-skills
  communication: number;     // How well they explain things
  problemSolving: number;
  collaboration: number;     // Works with other agents
  
  // Experience
  totalTasksCompleted: number;
  totalHoursWorked: number;
  certifications: string[];  // Unlocked achievements
}

export interface AgentWorkHistory {
  tasksCompleted: AgentTask[];
  domainsWorked: string[];
  performanceRating: number; // 0-5 stars
  userFeedback: UserFeedback[];
}

export interface AgentTask {
  id: string;
  domain: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  status: 'in_progress' | 'completed' | 'failed' | 'abandoned';
  difficultyLevel: number;   // 1-10
  xpGained: number;
  userRating?: number;       // 1-5
}

export interface UserFeedback {
  timestamp: Date;
  rating: number;            // 1-5
  sentiment: 'positive' | 'neutral' | 'negative';
  comment?: string;
}

export interface HireableAgent {
  id: string;
  name: string;              // e.g., "Mechanic Mike", "Debug Dana"
  specialty: Mode;           // Their core expertise
  
  // State
  status: AgentStatus;
  hireDate?: Date;
  quitDate?: Date;
  quitReason?: string;
  
  // Attributes
  personality: AgentPersonality;
  morale: AgentMorale;
  skills: AgentSkills;
  workHistory: AgentWorkHistory;
  
  // Employment
  currentSalary: number;     // Compute credits per day
  currentDomain?: string;    // Which domain they're assigned to
  
  // Avatar/Flavor
  avatarUrl?: string;
  bio: string;
  catchphrase?: string;      // e.g., "Let's optimize this!"
}
