export interface CoreMember {
  id: string;
  fullName: string;
  email: string;
  roleTitle: string; // e.g. Core Developer, Community Lead, UI Designer
  department: 'engineering' | 'design' | 'operations' | 'marketing' | 'relations';
  skills: string[];
  availabilityHours: number; // hours per week
  bio: string;
  githubUrl?: string;
  discordUsername: string;
  joinedAt: string;
  // Expanded for Student placements & LoopTech requirements
  gender?: 'male' | 'female' | 'other';
  isExistingLoopLabMember?: boolean;
  hasPaidFee?: boolean;
  feeAmountPaid?: number;
  isLoopTechMember?: boolean;
}

export interface CoreTeam {
  id: string;
  teamName: string;
  focusArea: string;
  leadName: string;
  leadEmail: string;
  communicationChannel: string; // e.g. #dev-core, #ops-core
  status: 'active' | 'forming' | 'recruiting' | 'paused';
  maxCapacity: number;
  currentMemberCount: number;
  goals: string[];
  createdAt: string;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface GamingAssessmentScore {
  totalQuestions: number;
  correctAnswers: number;
  timeRemainingSec: number;
  strategicDecisions: string[];
  strategicVerdict: 'Master Tactician' | 'High Strategist' | 'Tactical Lead' | 'Needs Training';
  completedAt: string;
}

export interface StudentApplication {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  gender: 'male' | 'female' | 'other';
  isExistingLoopLabMember: boolean;
  section: 'LoopLab' | 'LoopTech For Women';
  position: string; // Vice President, Tech Co-lead, etc.
  feeStatus: 'waived' | 'pending_payment' | 'paid';
  feeAmountPaid: number;
  answers: {
    experience: string;
    motivation: string;
    skills: string;
  };
  // VP Assessment
  gamingAssessment?: GamingAssessmentScore;
  status: ApplicationStatus;
  adminNotes?: string;
  submittedAt: string;
}

export const LISTED_POSITIONS = [
  { id: 'vp', title: 'Vice President', division: 'Executive', category: 'LoopLab' },
  { id: 'tech-co', title: 'Tech Co-lead', division: 'Core', category: 'Both' },
  { id: 'graphic-lead', title: 'Graphic Lead', division: 'Core', category: 'Both' },
  { id: 'graphic-co', title: 'Graphic Co-lead', division: 'Core', category: 'Both' },
  { id: 'reg-co', title: 'Registration Co-lead', division: 'Core', category: 'Both' },
  { id: 'social-lead', title: 'Social Media Lead', division: 'Core', category: 'Both' },
  { id: 'social-co', title: 'Social Media Co-lead', division: 'Core', category: 'Both' },
  { id: 'cinema-lead', title: 'Cinematics Lead', division: 'Core', category: 'Both' },
  { id: 'cinema-co', title: 'Cinematics Co-lead', division: 'Core', category: 'Both' },
  { id: 'events-lead', title: 'Events Lead', division: 'Core', category: 'Both' },
  { id: 'events-co', title: 'Events Co-lead', division: 'Core', category: 'Both' },
  { id: 'marketing-lead', title: 'Marketing Lead', division: 'Core', category: 'Both' },
  { id: 'marketing-co', title: 'Marketing Co-lead', division: 'Core', category: 'Both' },
] as const;
