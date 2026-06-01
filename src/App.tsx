/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoreMember, CoreTeam, StudentApplication } from './types';
import MemberForm from './components/MemberForm';
import TeamForm from './components/TeamForm';
import Toast, { ToastMessage } from './components/Toast';
import StudentApplicationForm from './components/StudentApplicationForm';
import AdminPortalDashboard from './components/AdminPortalDashboard';
import Hero3DHeader from './components/Hero3DHeader';
import SecurityPortal from './components/SecurityPortal';
import IntroCinematic from './components/IntroCinematic';

// Firebase Integrations
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './lib/firebase';

import { 
  ShieldCheck, PlusCircle, Users, Radio, Cpu, Sparkles, LogOut, 
  Award, Heart, HelpCircle, Gamepad2, Info, ArrowRight,
  CheckCircle, Hammer, Briefcase, FileText, Home, Menu, X
} from 'lucide-react';

// Prepopulated Seed Data to provide an instant, useful community state
const SEED_MEMBERS: CoreMember[] = [
  {
    id: 'm-1',
    fullName: 'Dr. Susan Vance',
    email: 'susan@looplab.community',
    roleTitle: 'Principal Cryptographer & Consensus Lead',
    department: 'engineering',
    skills: ['React', 'TypeScript', 'Node.js', 'Rust', 'Consensus Mechanics'],
    availabilityHours: 35,
    bio: 'Building autonomous state machine loops and deep security topologies.',
    githubUrl: 'susanvance-dev',
    discordUsername: 'susan_v',
    gender: 'female',
    isExistingLoopLabMember: true,
    hasPaidFee: true,
    feeAmountPaid: 0,
    isLoopTechMember: true,
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm-2',
    fullName: 'Marcus Sterling',
    email: 'marcus@looplab.community',
    roleTitle: 'Lead Design System Architect',
    department: 'design',
    skills: ['Figma', 'UI/UX', 'TailwindCSS'],
    availabilityHours: 20,
    bio: 'Obsessed with perfect micro-interactions, layout rhythms, and pink/purple design systems.',
    githubUrl: 'marcus-sterling',
    discordUsername: 'marcus_ux',
    gender: 'male',
    isExistingLoopLabMember: true,
    hasPaidFee: true,
    feeAmountPaid: 0,
    isLoopTechMember: false,
    joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm-3',
    fullName: 'Priya Patel',
    email: 'priya@looplab.community',
    roleTitle: 'Ecosystem Coordinator',
    department: 'relations',
    skills: ['Community Ops', 'Technical Writing'],
    availabilityHours: 25,
    bio: 'Bridging software requirements and amazing global female tech contributors.',
    githubUrl: 'priyapatel-community',
    discordUsername: 'priya_relations',
    gender: 'female',
    isExistingLoopLabMember: true,
    hasPaidFee: true,
    feeAmountPaid: 0,
    isLoopTechMember: true,
    joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_TEAMS: CoreTeam[] = [
  {
    id: 't-1',
    teamName: 'Hyperion Core Consensus',
    focusArea: 'Distributed Storage & DAG Consensus Loops',
    leadName: 'Dr. Susan Vance',
    leadEmail: 'susan@test.community',
    communicationChannel: '#hyperion-consensus',
    status: 'active',
    maxCapacity: 6,
    currentMemberCount: 2,
    goals: [
      'Deploy DAG Consensus Simulator Prototype',
      'Publish LoopLab consensus safety whitepaper draft',
      'Audit state compaction times under deep network simulation'
    ],
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-2',
    teamName: 'Helios UI & Design System',
    focusArea: 'Aesthetic Tokens & Accessible Workspace Toolkits',
    leadName: 'Marcus Sterling',
    leadEmail: 'marcus@test.community',
    communicationChannel: '#helios-design',
    status: 'recruiting',
    maxCapacity: 4,
    currentMemberCount: 1,
    goals: [
      'Publish dark-palette accessible Figma specifications v1.2',
      'Build core reactive dashboard components dynamically',
      'Benchmark screen reader accessibility'
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_APPLICATIONS: StudentApplication[] = [];

function cleanUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

interface HomeAnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function HomeAnimatedCounter({ value, suffix = '', duration = 1.3 }: HomeAnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const totalFrames = 60;
    const frameDuration = (duration * 1000) / totalFrames;
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress); // easeOutQuad
      const currentCount = Math.round(start + easeProgress * (end - start));
      setCount(currentCount);

      if (frame >= totalFrames) {
        clearInterval(counter);
        setCount(end);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, [value, duration]);

  return (
    <span className="inline-block tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function App() {
  const [members, setMembers] = useState<CoreMember[]>([]);
  const [teams, setTeams] = useState<CoreTeam[]>([]);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Custom user portal authentication & check-sum verification
  const [portalUser, setPortalUser] = useState<{ email: string; fullName: string; checksum: string; gender?: string } | null>(() => {
    const saved = localStorage.getItem('looplab_custom_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<'home' | 'mission' | 'auth' | 'looplab' | 'looptech' | 'fees' | 'admin' | 'register'>('home');
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('looplab_intro_seen');
    } catch {
      return true;
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Calculate standard checksum verification code for authentication
  const calculateChecksumValue = (email: string, username: string) => {
    const clean = (email + username).toLowerCase().replace(/[^a-z0-9]/g, '');
    let sum = 0;
    for (let i = 0; i < clean.length; i++) {
      sum += clean.charCodeAt(i) * (i + 1);
    }
    const val = (sum % 8999) + 1000;
    return `CSUM-${val}`;
  };

  // Application submission modals
  const [selectedRoleToApply, setSelectedRoleToApply] = useState<{ title: string; section: 'LoopLab' | 'LoopTech For Women' } | null>(null);

  // Home Page custom portal session state hooks
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('female');
  const [generatedChecksum, setGeneratedChecksum] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginChecksum, setLoginChecksum] = useState('');
  const [activePortalTab, setActivePortalTab] = useState<'login' | 'signup'>('login');

  // Active Profile Editor Fields & Custom Navigation Session Control
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editGender, setEditGender] = useState('female');
  const [editPicUrl, setEditPicUrl] = useState('');

  // Sync profile editor fields whenever active portalUser or currentUser changes
  useEffect(() => {
    if (portalUser) {
      setEditFullName(portalUser.fullName || '');
      setEditUsername(portalUser.username || '');
      setEditGender(portalUser.gender || 'female');
      setEditPicUrl(portalUser.profilePic || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${portalUser.username || 'default'}`);
    } else if (currentUser) {
      setEditFullName(currentUser.displayName || '');
      setEditUsername(currentUser.email?.split('@')[0] || 'innovator');
      setEditGender('female');
      setEditPicUrl(currentUser.photoURL || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=default');
    }
  }, [portalUser, currentUser]);

  const handleSaveProfileUpdates = () => {
    if (!editFullName.trim()) {
      addToast("Full display name cannot be empty.", 'error');
      return;
    }

    if (portalUser) {
      const updatedUser = {
        ...portalUser,
        fullName: editFullName.trim(),
        username: editUsername.trim() || portalUser.username,
        gender: editGender,
        profilePic: editPicUrl.trim()
      };
      setPortalUser(updatedUser);
      localStorage.setItem('looplab_custom_session', JSON.stringify(updatedUser));

      // Also update in registered lookup table list!
      const savedUsers = localStorage.getItem('looplab_custom_users') || '{}';
      const users = JSON.parse(savedUsers);
      if (users[portalUser.email]) {
        users[portalUser.email] = {
          ...users[portalUser.email],
          fullName: editFullName.trim(),
          username: editUsername.trim() || users[portalUser.email].username,
          gender: editGender,
          profilePic: editPicUrl.trim()
        };
        localStorage.setItem('looplab_custom_users', JSON.stringify(users));
      }
      addToast("Your secure profile identity details saved successfully!", 'success');
    } else if (currentUser) {
      // Localize Google Session configuration
      const localizedUser = {
        email: currentUser.email || 'google@user.org',
        fullName: editFullName.trim(),
        username: editUsername.trim() || 'google_user',
        gender: editGender,
        checksum: 'GOOGLE-FASTPASS',
        profilePic: editPicUrl.trim()
      };
      setPortalUser(localizedUser);
      localStorage.setItem('looplab_custom_session', JSON.stringify(localizedUser));
      addToast("Google credentials localized & secure profile created!", 'success');
    }
    setShowProfileEditor(false);
  };

  // Monitor Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Authentication requirements waived - anyone can view all pages without login constraints

  // Sync state data from Firestore (and write seed if empty)
  useEffect(() => {
    const loadFirebaseData = async () => {
      setLoadingDb(true);
      try {
        // Core members sync
        let tempMembers: CoreMember[] = [];
        try {
          const membersSnap = await getDocs(collection(db, 'members'));
          if (membersSnap.empty) {
            for (const m of SEED_MEMBERS) {
              await setDoc(doc(db, 'members', m.id), cleanUndefined(m));
            }
            tempMembers = SEED_MEMBERS;
          } else {
            membersSnap.forEach((docSnap) => {
              tempMembers.push(docSnap.data() as CoreMember);
            });
          }
        } catch (err) {
          console.warn("Firestore member fetch failed, defaulting to localStorage...", err);
          const local = localStorage.getItem('looplab_members');
          tempMembers = local ? JSON.parse(local) : SEED_MEMBERS;
        }
        setMembers(tempMembers);
        localStorage.setItem('looplab_members', JSON.stringify(tempMembers));

        // Core teams sync
        let tempTeams: CoreTeam[] = [];
        try {
          const teamsSnap = await getDocs(collection(db, 'teams'));
          if (teamsSnap.empty) {
            for (const t of SEED_TEAMS) {
              await setDoc(doc(db, 'teams', t.id), cleanUndefined(t));
            }
            tempTeams = SEED_TEAMS;
          } else {
            teamsSnap.forEach((docSnap) => {
              tempTeams.push(docSnap.data() as CoreTeam);
            });
          }
        } catch (err) {
          console.warn("Firestore team fetch failed, defaulting to localStorage...", err);
          const local = localStorage.getItem('looplab_teams');
          tempTeams = local ? JSON.parse(local) : SEED_TEAMS;
        }
        setTeams(tempTeams);
        localStorage.setItem('looplab_teams', JSON.stringify(tempTeams));

        // Applications sync
        let tempApps: StudentApplication[] = [];
        try {
          const appsSnap = await getDocs(collection(db, 'applications'));
          if (appsSnap.empty) {
            for (const a of SEED_APPLICATIONS) {
              await setDoc(doc(db, 'applications', a.id), cleanUndefined(a));
            }
            tempApps = SEED_APPLICATIONS;
          } else {
            appsSnap.forEach((docSnap) => {
              tempApps.push(docSnap.data() as StudentApplication);
            });
          }
        } catch (err) {
          console.warn("Firestore application fetch failed, defaulting to localStorage...", err);
          const local = localStorage.getItem('looplab_applications');
          tempApps = local ? JSON.parse(local) : SEED_APPLICATIONS;
        }
        setApplications(tempApps);
        localStorage.setItem('looplab_applications', JSON.stringify(tempApps));

      } catch (err) {
        console.error("Global Firestore hydration fail:", err);
      } finally {
        setLoadingDb(false);
      }
    };

    loadFirebaseData();
  }, []);

  const saveApplications = async (updatedApps: StudentApplication[], singleApp?: StudentApplication) => {
    const deletedApps = applications.filter(
      (existingApp) => !updatedApps.some((newApp) => newApp.id === existingApp.id)
    );

    setApplications(updatedApps);
    localStorage.setItem('looplab_applications', JSON.stringify(updatedApps));

    for (const app of deletedApps) {
      try {
        await deleteDoc(doc(db, 'applications', app.id));
      } catch (err) {
        console.error("Failed to delete application from Firestore:", err);
      }
    }

    if (singleApp) {
      try {
        await setDoc(doc(db, 'applications', singleApp.id), cleanUndefined(singleApp));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `applications/${singleApp.id}`);
      }
    } else {
      for (const app of updatedApps) {
        try {
          await setDoc(doc(db, 'applications', app.id), cleanUndefined(app));
        } catch (err) {
          console.error("Error batch syncing app:", app.id, err);
        }
      }
    }
  };

  const saveMembers = async (updatedMembers: CoreMember[], singleMember?: CoreMember) => {
    setMembers(updatedMembers);
    localStorage.setItem('looplab_members', JSON.stringify(updatedMembers));
    if (singleMember) {
      try {
        await setDoc(doc(db, 'members', singleMember.id), cleanUndefined(singleMember));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `members/${singleMember.id}`);
      }
    } else {
      for (const m of updatedMembers) {
        try {
          await setDoc(doc(db, 'members', m.id), cleanUndefined(m));
        } catch (err) {
          console.error("Error batch syncing member:", m.id, err);
        }
      }
    }
  };

  const saveTeams = async (updatedTeams: CoreTeam[], singleTeam?: CoreTeam) => {
    setTeams(updatedTeams);
    localStorage.setItem('looplab_teams', JSON.stringify(updatedTeams));
    if (singleTeam) {
      try {
        await setDoc(doc(db, 'teams', singleTeam.id), cleanUndefined(singleTeam));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `teams/${singleTeam.id}`);
      }
    } else {
      for (const t of updatedTeams) {
        try {
          await setDoc(doc(db, 'teams', t.id), cleanUndefined(t));
        } catch (err) {
          console.error("Error batch syncing team:", t.id, err);
        }
      }
    }
  };

  // Toast utilities
  const addToast = (text: string, type: ToastMessage['type'] = 'success') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Triggers when student application resolves successfully
  const handleAppSubmitSuccess = (newApp: StudentApplication) => {
    const updatedApps = [newApp, ...applications];
    saveApplications(updatedApps, newApp);
    addToast(`Application code ${newApp.id} logged to registry ledger under review.`);

    // If approved internally right away, register them as CoreMember as well
    if (newApp.status === 'approved') {
      const isExist = members.some(m => m.email.toLowerCase() === newApp.email.toLowerCase());
      if (!isExist) {
        const newMember: CoreMember = {
          id: `m-${Date.now()}`,
          fullName: newApp.fullName,
          email: newApp.email,
          roleTitle: newApp.position,
          department: newApp.section === 'LoopTech For Women' ? 'design' : 'engineering',
          skills: newApp.answers.skills.split(',').map(s => s.trim()),
          availabilityHours: 20,
          bio: newApp.answers.motivation,
          discordUsername: newApp.fullName.toLowerCase().replace(/\s+/g, '_') + '_member',
          gender: newApp.gender,
          isExistingLoopLabMember: true,
          hasPaidFee: true,
          feeAmountPaid: newApp.feeAmountPaid,
          isLoopTechMember: newApp.section === 'LoopTech For Women',
          joinedAt: new Date().toISOString()
        };
        saveMembers([newMember, ...members], newMember);
      }
    }
  };

  // Triggers when admin makes list model changes in portal (Accept, deny, insert, etc)
  const handleUpdateAppsByAdmin = (updatedApps: StudentApplication[]) => {
    saveApplications(updatedApps);
    addToast("Database credentials synced and verified successfully.", "info");

    // Re-synchronize approved students directly as LoopLab Core members
    let approvedCoreMembers = [...members];
    const appsByEmail = new Map<string, StudentApplication>();
    updatedApps.forEach(app => {
      appsByEmail.set(app.email.toLowerCase(), app);
    });

    updatedApps.forEach(app => {
      if (app.status === 'approved') {
        const existingIdx = approvedCoreMembers.findIndex(
          m => m.email.toLowerCase() === app.email.toLowerCase()
        );

        if (existingIdx !== -1) {
          // Update existing member record details
          approvedCoreMembers[existingIdx] = {
            ...approvedCoreMembers[existingIdx],
            fullName: app.fullName,
            roleTitle: app.position,
            department: app.section === 'LoopTech For Women' ? 'design' : 'engineering',
            skills: app.answers.skills.split(',').map(s => s.trim()),
            gender: app.gender,
            feeAmountPaid: app.feeAmountPaid,
            isLoopTechMember: app.section === 'LoopTech For Women'
          };
        } else {
          // Create new approved core member
          approvedCoreMembers.unshift({
            id: `m-${Date.now()}-${Math.floor(Math.random() * 900)}`,
            fullName: app.fullName,
            email: app.email,
            roleTitle: app.position,
            department: app.section === 'LoopTech For Women' ? 'design' : 'engineering',
            skills: app.answers.skills.split(',').map(s => s.trim()),
            availabilityHours: 25,
            bio: app.answers.motivation,
            discordUsername: app.fullName.toLowerCase().replace(/\s+/g, '_') + '_candidate',
            gender: app.gender,
            isExistingLoopLabMember: true,
            hasPaidFee: true,
            feeAmountPaid: app.feeAmountPaid,
            isLoopTechMember: app.section === 'LoopTech For Women',
            joinedAt: new Date().toISOString()
          });
        }
      }
    });

    // Remove any user who is marked as rejected or pending in Applications
    approvedCoreMembers = approvedCoreMembers.filter(m => {
      const app = appsByEmail.get(m.email.toLowerCase());
      if (app && app.status !== 'approved') {
        return false;
      }
      return true;
    });

    saveMembers(approvedCoreMembers);
  };

  const handleApplyRole = (title: string, section: 'LoopLab' | 'LoopTech For Women') => {
    setSelectedRoleToApply({ title, section });
  };

  // Delete Member
  const handleDeleteMember = async (id: string) => {
    const memberToDelete = members.find((m) => m.id === id);
    const updated = members.filter((m) => m.id !== id);
    await saveMembers(updated);
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (err) {
      console.error("Failed to delete member from Firestore:", err);
    }
    if (memberToDelete) {
      addToast(`Fellowship status revoked for ${memberToDelete.fullName}.`, 'info');
    }
  };

  // Delete Team
  const handleDeleteTeam = async (id: string) => {
    const teamToDelete = teams.find((t) => t.id === id);
    const updated = teams.filter((t) => t.id !== id);
    await saveTeams(updated);
    try {
      await deleteDoc(doc(db, 'teams', id));
    } catch (err) {
      console.error("Failed to delete team from Firestore:", err);
    }
    if (teamToDelete) {
      addToast(`Circle "${teamToDelete.teamName}" has been disbanded.`, 'info');
    }
  };

  // Export Database manifest
  const handleExportDB = () => {
    const fullDatabase = {
      manifestName: "LoopLab Community Core Hub Data",
      exportedAt: new Date().toISOString(),
      memberDatabase: members,
      teamDatabase: teams
    };

    const fileData = JSON.stringify(fullDatabase, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `looplab-communitycore-manifest-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast("LoopLab core database manifest exported successfully!");
  };

  // Register Member Directly
  const handleRegisterMember = (newMemberData: Omit<CoreMember, 'id' | 'joinedAt'>) => {
    const isExist = members.some(m => m.email.toLowerCase() === newMemberData.email.toLowerCase());
    if (isExist) {
      addToast(`A member with email ${newMemberData.email} is already registered!`, 'info');
      setActiveTab('looplab');
      return;
    }
    const newMember: CoreMember = {
      ...newMemberData,
      id: `m-${Date.now()}`,
      isExistingLoopLabMember: true,
      hasPaidFee: true,
      feeAmountPaid: 500,
      isLoopTechMember: newMemberData.department === 'design',
      joinedAt: new Date().toISOString()
    };
    saveMembers([newMember, ...members], newMember);
    addToast(`Successfully registered ${newMember.fullName} as Core Member!`);
    setActiveTab('looplab');
  };

  // Google sign in popup
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      addToast(`Welcome back, ${result.user.displayName}!`);
    } catch (err: any) {
      addToast(`Authentication failed: ${err.message}`, 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      addToast("Signed out successfully.");
    } catch (err: any) {
      addToast("Failed to sign out.", 'error');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between py-6 px-3 sm:px-6 md:px-8 bg-[#090412] text-white">
      
      {/* Top Header Panel */}
      {(currentUser || portalUser) ? (
        <header className="w-full max-w-7xl mx-auto mb-6">
          <div className="bg-[#110825] border border-purple-500/30 p-4 lg:py-5 lg:px-7 shadow-2xl relative overflow-hidden rounded-2xl backdrop-blur-xl">
             {/* Neon glowing elements */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
             <div className="absolute -left-10 w-48 h-full bg-gradient-to-r from-pink-500/5 to-transparent pointer-events-none"></div>
             
             <div className="flex items-center justify-between relative z-10 w-full">
               {/* Left: Branding & Welcome Profile Summary */}
               <div className="flex items-center gap-3 w-3/4 lg:w-1/3 justify-start">
                 <div className="relative group shrink-0">
                   <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-550 via-pink-550 to-amber-400 blur-sm group-hover:blur-md transition-all duration-300"></div>
                   <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-purple-400/80 bg-[#0f071a]">
                     <img 
                       src={editPicUrl || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=default_member'} 
                       alt="Profile Pic" 
                       className="w-full h-full object-cover" 
                       referrerPolicy="no-referrer"
                       onError={(e) => {
                         e.currentTarget.src = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=default_member';
                       }}
                     />
                     <button
                       onClick={() => setShowProfileEditor(!showProfileEditor)}
                       className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer text-[8px] font-black uppercase tracking-wider text-pink-300"
                     >
                       Edit
                     </button>
                   </div>
                   <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border border-[#110825] flex items-center justify-center shadow animate-pulse"></div>
                 </div>

                 <div className="text-left min-w-0">
                   <div className="flex items-center gap-1.5 flex-wrap">
                     <span className="text-[7px] font-mono bg-purple-950 font-black tracking-widest px-2 py-0.5 rounded border border-purple-500/30 text-purple-300 uppercase">
                       STUDENT PORTAL
                     </span>
                     {editGender === 'female' && (
                       <span className="text-[7px] font-mono bg-pink-950/75 font-black tracking-widest px-1.5 py-0.5 rounded border border-pink-500/30 text-pink-300 uppercase">
                         WOMEN TECH
                       </span>
                     )}
                   </div>
                   <h2 className="text-sm font-black text-white mt-1 flex items-center gap-1 truncate max-w-[150px] sm:max-w-[200px]">
                     <span className="truncate">{editFullName || portalUser?.fullName || currentUser?.displayName || 'Innovator'}</span>
                     <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                   </h2>
                   <p className="text-[9px] text-purple-400 font-mono tracking-wider truncate">
                     Node: {portalUser?.checksum || 'GOOGLE-OAUTH'}
                   </p>
                 </div>
               </div>

               {/* Center navigation: hidden on mobile, flex on desktop */}
               <div className="hidden lg:flex items-center justify-center lg:w-1/2">
                 <nav className="flex flex-wrap items-center justify-center gap-1 bg-[#120726] p-1 rounded-xl border border-purple-500/10">
                   <button
                     onClick={() => { setActiveTab('home'); setShowProfileEditor(false); }}
                     className={`text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                       activeTab === 'home'
                         ? 'bg-purple-650 text-white shadow-md'
                         : 'text-purple-300 hover:text-white hover:bg-white/5'
                     }`}
                   >
                     Home
                   </button>
                   <button
                     onClick={() => { setActiveTab('looplab'); setShowProfileEditor(false); }}
                     className={`text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                       activeTab === 'looplab'
                         ? 'bg-purple-650 text-white shadow-md'
                         : 'text-purple-300 hover:text-white hover:bg-white/5'
                     }`}
                   >
                     Positions
                   </button>
                   <button
                     onClick={() => { setActiveTab('looptech'); setShowProfileEditor(false); }}
                     className={`text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                       activeTab === 'looptech'
                         ? 'bg-gradient-to-r from-pink-600 to-purple-650 text-white shadow-md'
                         : 'text-purple-300 hover:text-pink-300 hover:bg-white/5'
                     }`}
                   >
                     LoopTech
                   </button>
                   <button
                     onClick={() => { setActiveTab('fees'); setShowProfileEditor(false); }}
                     className={`text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                       activeTab === 'fees'
                         ? 'bg-purple-650 text-white shadow-md'
                         : 'text-purple-300 hover:text-white hover:bg-white/5'
                     }`}
                   >
                     Fees
                   </button>
                   <button
                     onClick={() => { setActiveTab('admin'); setShowProfileEditor(false); }}
                     className={`text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                       activeTab === 'admin'
                         ? 'bg-purple-950/80 border border-purple-500/20 text-fuchsia-400 shadow-md'
                         : 'text-purple-450 hover:text-fuchsia-300 hover:bg-white/5'
                     }`}
                   >
                     Admin
                   </button>
                 </nav>
               </div>

               {/* Right side persona buttons: hidden on mobile, flex on desktop */}
               <div className="hidden lg:flex items-center gap-2 lg:w-1/6 justify-end">
                 <button
                   onClick={() => setShowProfileEditor(!showProfileEditor)}
                   className={`text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                     showProfileEditor 
                       ? 'bg-pink-600 text-white border-pink-400 shadow-lg' 
                       : 'text-pink-200 border-pink-500/20 bg-pink-950/10 hover:bg-pink-900/20 hover:text-white'
                   }`}
                 >
                   ⚙ Profile
                 </button>

                 <button
                   onClick={() => {
                     if (portalUser) {
                       setPortalUser(null);
                       localStorage.removeItem('looplab_custom_session');
                       addToast("Signed out of Custom Portal.");
                     } else {
                       handleSignOut();
                     }
                     setShowProfileEditor(false);
                     setActiveTab('home');
                   }}
                   className="p-2 bg-red-950/30 hover:bg-red-950/50 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500/35 rounded-lg transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center min-h-[36px]"
                   title="Disconnect secure portal session"
                 >
                   <LogOut className="w-3.5 h-3.5" />
                 </button>
               </div>

               {/* Mobile Hamburger / Toggle Button: visible on mobile, hidden on desktop */}
               <div className="flex lg:hidden items-center justify-end">
                 <button
                   type="button"
                   onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                   className="p-2 rounded-xl bg-purple-950/45 border border-purple-500/20 hover:border-purple-500/40 text-purple-250 cursor-pointer transition-all active:scale-90 flex items-center justify-center min-w-[44px] min-h-[44px]"
                   aria-label="Toggle navigation menu"
                 >
                   {mobileMenuOpen ? <X className="w-5 h-5 text-pink-400" /> : <Menu className="w-5 h-5 text-purple-300" />}
                 </button>
               </div>
             </div>

             {/* Mobile & Tablet Collapsible Menu Dropdown */}
             <AnimatePresence>
               {mobileMenuOpen && (
                 <motion.nav
                   initial={{ opacity: 0, height: 0, marginTop: 0 }}
                   animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                   exit={{ opacity: 0, height: 0, marginTop: 0 }}
                   transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                   className="lg:hidden overflow-hidden w-full relative z-20 border-t border-purple-500/10 pt-3"
                 >
                   <div className="bg-[#120726] p-3 rounded-xl border border-purple-500/10 space-y-3 shadow-xl">
                     <div className="grid grid-cols-2 gap-2 text-center">
                       <button
                         type="button"
                         onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); setShowProfileEditor(false); }}
                         className={`text-xs uppercase font-mono tracking-wider w-full min-h-[44px] p-2.5 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                           activeTab === 'home'
                             ? 'bg-purple-650 text-white shadow-md'
                             : 'bg-[#180b33]/60 text-purple-300 hover:text-white'
                         }`}
                       >
                         Home
                       </button>
                       <button
                         type="button"
                         onClick={() => { setActiveTab('looplab'); setMobileMenuOpen(false); setShowProfileEditor(false); }}
                         className={`text-xs uppercase font-mono tracking-wider w-full min-h-[44px] p-2.5 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                           activeTab === 'looplab'
                             ? 'bg-purple-650 text-white shadow-md'
                             : 'bg-[#180b33]/60 text-purple-300 hover:text-white'
                         }`}
                       >
                         Positions
                       </button>
                       <button
                         type="button"
                         onClick={() => { setActiveTab('looptech'); setMobileMenuOpen(false); setShowProfileEditor(false); }}
                         className={`text-xs uppercase font-mono tracking-wider w-full min-h-[44px] p-2.5 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                           activeTab === 'looptech'
                             ? 'bg-gradient-to-r from-pink-600 to-purple-650 text-white shadow-md'
                             : 'bg-[#180b33]/60 text-purple-300 hover:text-pink-300'
                         }`}
                       >
                         LoopTech
                       </button>
                       <button
                         type="button"
                         onClick={() => { setActiveTab('fees'); setMobileMenuOpen(false); setShowProfileEditor(false); }}
                         className={`text-xs uppercase font-mono tracking-wider w-full min-h-[44px] p-2.5 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                           activeTab === 'fees'
                             ? 'bg-purple-650 text-white shadow-md'
                             : 'bg-[#180b33]/60 text-purple-300 hover:text-white'
                         }`}
                       >
                         Fees
                       </button>
                     </div>

                     <div className="flex items-center gap-2 pt-2 border-t border-purple-500/10 justify-between">
                       <button
                         type="button"
                         onClick={() => { setShowProfileEditor(!showProfileEditor); setMobileMenuOpen(false); }}
                         className={`text-xs uppercase font-mono tracking-wider flex-1 min-h-[44px] p-2.5 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                           showProfileEditor 
                             ? 'bg-pink-600 text-white border-pink-400 shadow-lg' 
                             : 'text-pink-200 border-pink-500/25 bg-pink-950/20 hover:bg-pink-900/40'
                         }`}
                       >
                         ⚙ Profile Settings
                       </button>

                       <button
                         type="button"
                         onClick={() => {
                           if (portalUser) {
                             setPortalUser(null);
                             localStorage.removeItem('looplab_custom_session');
                             addToast("Signed out of Custom Portal.");
                           } else {
                             handleSignOut();
                           }
                           setMobileMenuOpen(false);
                           setShowProfileEditor(false);
                           setActiveTab('home');
                         }}
                         className="px-4 min-h-[44px] bg-red-950/40 hover:bg-red-950/60 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                         title="Disconnect secure portal session"
                       >
                         <LogOut className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 </motion.nav>
               )}
             </AnimatePresence>

             {/* Dynamic Slide-Down Profile Customizer Form */}
             <AnimatePresence>
               {showProfileEditor && (
                 <motion.div
                   initial={{ opacity: 0, height: 0, marginTop: 0 }}
                   animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                   exit={{ opacity: 0, height: 0, marginTop: 0 }}
                   transition={{ duration: 0.3, ease: 'easeInOut' }}
                   className="overflow-hidden border-t border-purple-500/15 pt-4 text-left font-sans"
                 >
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                     {/* Form inputs */}
                     <div className="space-y-3.5 md:col-span-2">
                       <h3 className="text-xs font-black uppercase tracking-widest text-[#d6c2ff] flex items-center gap-1.5">
                         <span>Identify Workspace personalization</span>
                         <span className="text-[7px] tracking-widest font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/20 text-yellow-350">LOCAL INTEGRATED UPDATE</span>
                       </h3>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <div className="space-y-1">
                           <label className="block text-[9px] uppercase tracking-wider font-extrabold text-purple-300">
                             Full Display Name
                           </label>
                           <input
                             type="text"
                             value={editFullName}
                             onChange={(e) => setEditFullName(e.target.value)}
                             placeholder="Full Name"
                             className="w-full py-2 px-3 bg-[#140b26] border border-purple-500/25 rounded-lg text-xs text-white placeholder-white/20 focus:outline-[#9d4edd] focus:outline focus:outline-1"
                           />
                         </div>

                         <div className="space-y-1">
                           <label className="block text-[9px] uppercase tracking-wider font-extrabold text-purple-300">
                             Tech Username
                           </label>
                           <input
                             type="text"
                             value={editUsername}
                             onChange={(e) => setEditUsername(e.target.value)}
                             placeholder="Username"
                             className="w-full py-2 px-3 bg-[#140b26] border border-purple-500/25 rounded-lg text-xs text-white placeholder-white/20 focus:outline-[#9d4edd] focus:outline focus:outline-1"
                           />
                         </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <div className="space-y-1">
                           <label className="block text-[9px] uppercase tracking-wider font-extrabold text-purple-300">
                             Gender Profile Category
                           </label>
                           <select
                             value={editGender}
                             onChange={(e) => setEditGender(e.target.value)}
                             className="w-full py-2 px-3 bg-[#140b26] border border-purple-500/25 rounded-lg text-xs text-purple-200 focus:outline-[#9d4edd]"
                           >
                             <option value="female">Woman / Girl</option>
                             <option value="male">Man / Boy</option>
                             <option value="other">Other Identity</option>
                           </select>
                         </div>

                         <div className="space-y-1">
                           <label className="block text-[9px] uppercase tracking-wider font-extrabold text-purple-300">
                             Profile Picture URL
                           </label>
                           <input
                             type="url"
                             value={editPicUrl}
                             onChange={(e) => setEditPicUrl(e.target.value)}
                             placeholder="Paste your custom picture URL"
                             className="w-full py-2 px-3 bg-[#140b26] border border-purple-500/25 rounded-lg text-xs text-white placeholder-white/20 focus:outline-[#9d4edd] focus:outline focus:outline-1"
                           />
                         </div>
                       </div>
                     </div>

                     {/* Avatar picker preset */}
                     <div className="space-y-3">
                       <h3 className="text-xs font-black uppercase tracking-widest text-[#d6c2ff]">
                         Pick a 3D Cyber Avatar
                       </h3>
                       
                       <div className="grid grid-cols-5 gap-1.5">
                         {[
                           { name: 'Developer Girl', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=elena' },
                           { name: 'Neon Glitch', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=neon' },
                           { name: 'Astronaut', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=astronaut' },
                           { name: 'Specialist Cyborg', url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=special' },
                           { name: 'Pixel Hacker', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=hacker' },
                         ].map((avatarItem) => (
                           <button
                             key={avatarItem.url}
                             type="button"
                             title={avatarItem.name}
                             onClick={() => setEditPicUrl(avatarItem.url)}
                             className={`p-1 rounded-lg bg-[#140b26] border transition-all hover:scale-110 flex items-center justify-center cursor-pointer ${
                               editPicUrl === avatarItem.url 
                                 ? 'border-pink-500 ring-1 ring-pink-500/30' 
                                 : 'border-purple-500/15 hover:border-purple-400'
                             }`}
                           >
                             <img src={avatarItem.url} alt="preset" className="w-8 h-8 rounded-md" />
                           </button>
                         ))}
                       </div>

                       <div className="pt-1 flex gap-2">
                         <button
                           type="button"
                           onClick={handleSaveProfileUpdates}
                           className="flex-1 py-1.5 bg-gradient-to-r from-purple-650 to-pink-600 hover:from-purple-555 hover:to-pink-500 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
                         >
                           Save Identity
                         </button>
                         <button
                           type="button"
                           onClick={() => setShowProfileEditor(false)}
                           className="px-3 py-1.5 bg-[#140b26] border border-purple-500/15 text-[10px] text-purple-300 rounded-lg hover:text-white cursor-pointer"
                         >
                           Cancel
                         </button>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </header>
      ) : (
        <header className="w-full max-w-7xl mx-auto mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between bg-[#0e0720]/80 border border-purple-500/15 p-4 lg:py-4 lg:px-6 shadow-2xl gap-4 relative overflow-hidden backdrop-blur-xl rounded-2xl">
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none"></div>
            
            {/* Logo brand & metadata - LEFTMOST SIDE */}
            <div className="flex items-center gap-3 relative z-10 lg:w-1/4 justify-start">
              <div className="relative w-11 h-11 p-0.5 bg-gradient-to-tr from-[#9d4edd] via-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10 tracking-tighter shrink-0 overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/d/1gpWuUXDK5W3vkWyRmtjWB72QRkpC7swd"
                  alt="LoopLab Logo" 
                  className="w-full h-full object-cover rounded-lg bg-[#0f071a]" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-[#9d4edd] to-indigo-600">
                  <span className="text-white font-black text-xl font-display">L</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-display font-black tracking-tight text-white uppercase leading-none">
                    loop<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">lab</span>
                  </h1>
                  <span className="text-[8px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/20 text-purple-300 font-extrabold">
                    v3.8
                  </span>
                </div>
                <p className="text-[10px] text-purple-400/70 font-mono tracking-wider uppercase leading-none mt-1">Student Tech Community</p>
              </div>
            </div>            {/* Navigation Menu - CENTER (MID) */}
            <div className="flex items-center justify-center relative z-10 w-full lg:w-2/4">
              <nav className="flex flex-wrap items-center justify-center gap-1.5 bg-purple-950/40 p-1.5 rounded-xl border border-purple-500/5">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className={`text-xs px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-purple-650 text-white shadow-md'
                      : 'text-purple-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Home className="w-3.5 h-3.5 text-purple-300" />
                  <span>Home</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('mission')}
                  className={`text-xs px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'mission'
                      ? 'bg-purple-650 text-white shadow-md'
                      : 'text-purple-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Our Mission</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('looplab')}
                  className={`text-xs px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'looplab'
                      ? 'bg-purple-650 text-white shadow-lg'
                      : 'text-purple-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Positions</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('looptech')}
                  className={`text-xs px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'looptech'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-650 text-white shadow-lg'
                      : 'text-purple-300 hover:text-pink-300 hover:bg-white/5'
                  }`}
                >
                  <span>LoopTech</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('fees')}
                  className={`text-xs px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'fees'
                      ? 'bg-purple-650 text-white shadow-md'
                      : 'text-purple-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Benefits</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowIntro(true)}
                  className="text-xs px-3.5 py-2 font-bold text-pink-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse shrink-0" />
                  <span>Watch Intro</span>
                </button>
              </nav>
            </div>

            {/* CTA / Auth Actions - Clean Aesthetic Identifier */}
            <div className="hidden lg:flex items-center gap-3 relative z-10 w-full lg:w-1/4 justify-end font-mono">
              <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest bg-purple-950/20 px-3 py-1.5 border border-purple-500/10 rounded-xl">
                ★ FELLOWSHIP INITIATIVE
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Main Container Workspace */}
      <main className="w-full max-w-7xl mx-auto flex-1 h-full" style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}>
        <AnimatePresence mode="wait">
                  {/* TAB 0: Home Hub Landing */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, rotateY: 10, rotateX: 6, z: -120, y: 30 }}
              animate={{ opacity: 1, rotateY: 0, rotateX: 0, z: 0, y: 0 }}
              exit={{ opacity: 0, rotateY: -10, rotateX: -6, z: -120, y: -30 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 mb-10 w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Brand New 3D Animated Interactive Hero Header */}
              <Hero3DHeader />

              {/* Cinematic Replay Banner Choice */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#110825] border border-pink-500/10 rounded-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/30 to-transparent"></div>
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-pink-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <span>Experience LoopLab Cinematic Teaser</span>
                      <span className="text-[7px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-pink-950/75 border border-pink-500/20 text-pink-300 font-extrabold uppercase">AI Animated</span>
                    </h4>
                    <p className="text-[10px] text-purple-450 font-mono">Alone we build features. Together we build the future.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIntro(true)}
                  className="px-5 py-2 hover:py-2 bg-gradient-to-r from-pink-600 to-purple-650 hover:from-pink-500 hover:to-purple-555 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all cursor-pointer relative overflow-hidden hover:scale-[1.02] shrink-0"
                >
                  🎬 Watch Animation Trailer
                </button>
              </div>

              {/* Main Corporate Showcase - Full Width */}
              <div className="bg-[#0b0518]/95 border border-purple-500/15 p-6 md:p-10 shadow-2xl flex flex-col justify-between space-y-8 relative overflow-hidden rounded-2xl backdrop-blur-xl">
                <div className="absolute inset-0 bg-[#0d071c] opacity-80 bg-[radial-gradient(#1c0f38_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="space-y-6 relative z-10 w-full">
                  {/* Highlighted beautiful primary mandate */}
                  <div className="p-6 bg-purple-950/40 border-l-[5px] border-[#9d4edd] rounded-r-xl shadow-md space-y-2.5">
                    <h3 className="text-[10px] uppercase font-mono tracking-widest font-black text-purple-300">LOOPLAB CORE MANDATE</h3>
                    <p className="text-sm md:text-base font-sans text-white leading-relaxed font-semibold italic">
                      "LoopLab is a Student-led tech community where creativity meets code , from hackthaons to workshops , we empower future innovators to learn , buld and grow together"
                    </p>
                  </div>

                  {/* Core engineering pillars inside responsive grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="p-5 bg-purple-950/20 border border-purple-500/10 rounded-xl space-y-2 group hover:border-purple-500/30 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-purple-900/30 text-[10px] text-purple-300 rounded font-mono font-bold border border-purple-500/10">01</span>
                        <h4 className="text-xs uppercase font-mono font-bold text-white tracking-wider">Engineering Suite</h4>
                      </div>
                      <p className="text-xs text-purple-200/80 leading-relaxed">
                        High-volume systems placement and code coordination across our agile workspace. Includes automated peer feedback loops, hackathons, and workshops.
                      </p>
                    </div>

                    <div className="p-5 bg-purple-900/10 border border-purple-500/10 rounded-xl space-y-2 group hover:border-pink-500/30 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-pink-950/30 text-[10px] text-pink-300 rounded font-mono font-bold border border-pink-500/10">02</span>
                        <h4 className="text-xs uppercase font-mono font-bold text-white tracking-wider">Female Tech Empowerment</h4>
                      </div>
                      <p className="text-xs text-purple-200/80 leading-relaxed">
                        Custom support networks, mentors, and all-female chapters built to ensure equitable learning and merit-based executive leadership pathways.
                      </p>
                    </div>
                  </div>

                  {/* Dedicated LoopTech for Women mandate banner */}
                  <div className="p-6 bg-gradient-to-r from-purple-950/50 via-pink-950/20 to-transparent border border-pink-500/20 rounded-xl relative shadow-md overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -right-3 -top-3 text-pink-500/10 text-7xl font-sans select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">❀</div>
                    
                    <h3 className="text-[10px] uppercase font-mono tracking-widest font-black text-pink-300 mb-3.5 flex items-center gap-2 pb-2 border-b border-purple-500/10">
                      <span className="p-1.5 bg-pink-900/30 rounded-lg text-xs leading-none border border-pink-500/20">🌸</span>
                      <span>DEDICATED EMPOWERMENT PILLAR &bull; LOOPTECH</span>
                    </h3>
                    
                    <div className="space-y-3 relative z-10">
                      <p className="text-sm md:text-base font-medium font-sans text-pink-100 leading-relaxed italic border-l-2 border-pink-500 pl-4">
                        "For LoopLab Tech for Women, there is a premier space where women grow in technology, explore limitless career horizons, and build something extraordinary of their own."
                      </p>
                      <p className="text-xs text-purple-200/70 leading-relaxed font-sans mt-2">
                        Designed to foster female co-leads, design authorities, and marketing engineers. Join active development forums to deploy enterprise applications collaboratively.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Industrial Value/Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-8 border-t border-purple-500/10 relative z-10 text-center sm:text-left" style={{ transformStyle: 'preserve-3d' }}>
                  <motion.div 
                    whileHover={{ scale: 1.05, rotateY: 6, rotateX: -6, z: 20, boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.35)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className="p-4 bg-purple-950/20 border border-purple-500/10 rounded-xl cursor-pointer"
                  >
                    <span className="block font-mono text-xs text-purple-400">Reach</span>
                    <span className="block font-display text-2xl text-white font-extrabold tracking-tight mt-0.5">
                      <HomeAnimatedCounter value={14} suffix="+" />
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-purple-300 font-mono mt-1">Ecosystem Chapters</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05, rotateY: 6, rotateX: -6, z: 20, boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.35)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className="p-4 bg-purple-950/20 border border-purple-500/10 rounded-xl cursor-pointer"
                  >
                    <span className="block font-mono text-xs text-purple-400">Placement</span>
                    <span className="block font-display text-2xl text-white font-extrabold tracking-tight mt-0.5">
                      <HomeAnimatedCounter value={100} suffix="%" />
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-purple-300 font-mono mt-1">Meritocratic Path</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05, rotateY: 6, rotateX: -6, z: 20, boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.35)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className="p-4 bg-purple-950/20 border border-purple-500/10 rounded-xl cursor-pointer"
                  >
                    <span className="block font-mono text-xs text-pink-400 font-semibold">LoopTech</span>
                    <span className="block font-display text-2xl text-pink-400 font-extrabold tracking-tight mt-0.5">
                      <HomeAnimatedCounter value={52} suffix="%" />
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-pink-300 font-mono mt-1">Female Lead Ratio</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05, rotateY: 6, rotateX: -6, z: 20, boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.35)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className="p-4 bg-[#120822] border border-indigo-500/20 rounded-xl cursor-pointer"
                  >
                    <span className="block font-mono text-xs text-indigo-400 font-bold">Standard</span>
                    <span className="block font-display text-2xl text-indigo-350 font-extrabold tracking-tight mt-0.5 animate-pulse">Secure</span>
                    <span className="block text-[8px] uppercase tracking-wider text-indigo-400 font-mono mt-1">Gateways Protocol</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: Dedicated Our Mission Page */}
          {activeTab === 'mission' && (
            <motion.div
              key="mission"
              initial={{ opacity: 0, rotateY: 10, rotateX: 6, z: -120, y: 30 }}
              animate={{ opacity: 1, rotateY: 0, rotateX: 0, z: 0, y: 0 }}
              exit={{ opacity: 0, rotateY: -10, rotateX: -6, z: -120, y: -30 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl mx-auto mb-10 space-y-8"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Mission Statement Showcase Card */}
              <div className="bg-[#0b0518]/95 border border-purple-500/15 p-6 md:p-10 shadow-2xl space-y-8 relative overflow-hidden rounded-2xl backdrop-blur-xl">
                <div className="absolute inset-0 bg-[#0d071c] opacity-80 bg-[radial-gradient(#1c0f38_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="space-y-6 relative z-10 text-center max-w-3xl mx-auto">
                  <span className="inline-flex items-center gap-2 text-[9px] uppercase font-mono tracking-widest text-[#9d4edd] bg-purple-950/80 border border-purple-500/30 px-3 py-1 rounded-full">
                    <span>PHILOSOPHICAL MANDATE & VALUES</span>
                  </span>

                  <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight uppercase leading-none">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 italic">Mission</span>
                  </h2>
                  <p className="text-xs text-purple-300 font-mono tracking-widest uppercase mt-4">CREATIVITY. COLLABORATION. SCALE.</p>
                  
                  <div className="h-0.5 w-24 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-4"></div>
                </div>

                {/* Primary Core Mandate (WORD FOR WORD) */}
                <div className="relative z-10 mt-6 md:mt-8 font-sans">
                  <div className="p-8 bg-purple-950/30 border-l-[6px] border-[#9d4edd] rounded-r-xl shadow-md space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-purple-900/30 rounded-lg text-lg leading-none border border-purple-500/20">🎯</span>
                      <h3 className="text-xs uppercase font-mono tracking-widest font-black text-purple-300">LOOPLAB CORE MANDATE</h3>
                    </div>
                    <p className="text-sm md:text-base text-white leading-relaxed font-semibold italic">
                      "LoopLab is a Student-led tech community where creativity meets code , from hackthaons to workshops , we empower future innovators to learn , buld and grow together"
                    </p>
                  </div>
                </div>

                {/* Dedicated Female Empowerment Statement Indicator (WORD FOR WORD) */}
                <div className="relative z-10 font-sans">
                  <div className="p-8 bg-[#150a2b]/40 border-l-[6px] border-pink-500 rounded-r-xl shadow-md space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-pink-950/30 rounded-lg text-lg leading-none border border-pink-500/20">🌸</span>
                      <h3 className="text-xs uppercase font-mono tracking-widest font-black text-pink-300">MEMBER EMPOWERMENT PILLAR &bull; LOOPTECH</h3>
                    </div>
                    <p className="text-sm md:text-base text-pink-100 leading-relaxed font-semibold italic">
                      "For LoopLab Tech for Women, there is a premier space where women grow in technology, explore limitless career horizons, and build something extraordinary of their own."
                    </p>
                  </div>
                </div>

                {/* Elaborate Details of our Culture & Philosophy */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 text-left font-sans">
                  <div className="p-5 bg-black/60 border border-purple-500/10 rounded-2xl space-y-2">
                    <h4 className="text-xs uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
                      <span className="text-purple-400">&bull;</span> Inclusive Mentoring
                    </h4>
                    <p className="text-xs text-purple-350 leading-relaxed">
                      Every student innovator has a designated track. We facilitate live workshops, collaborative peer programming chapters, and elite co-lead placements.
                    </p>
                  </div>

                  <div className="p-5 bg-black/60 border border-purple-500/10 rounded-2xl space-y-2">
                    <h4 className="text-xs uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
                      <span className="text-indigo-400">&bull;</span> Modern Hackathons
                    </h4>
                    <p className="text-xs text-purple-350 leading-relaxed">
                      We plan dynamic, interactive, and high-energy hackathons designed to challenge creative minds, test rapid prototyping capabilities, and solve issues.
                    </p>
                  </div>

                  <div className="p-5 bg-black/60 border border-purple-500/10 rounded-2xl space-y-2">
                    <h4 className="text-xs uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
                      <span className="text-pink-400">&bull;</span> Meritocratic Growth
                    </h4>
                    <p className="text-xs text-purple-350 leading-relaxed">
                      Our secure custom checksum tracking preserves complete historical activity records so memberships remain absolutely objective and performance-driven.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {/* TAB: Center-Stage Security Portals (Login/Signup/Active Sessions) */}
          {activeTab === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto mb-10"
            >
              <SecurityPortal
                activePortalTab={activePortalTab}
                setActivePortalTab={setActivePortalTab}
                setActiveTab={setActiveTab}
                portalUser={portalUser}
                setPortalUser={setPortalUser}
                loginEmail={loginEmail}
                setLoginEmail={setLoginEmail}
                loginChecksum={loginChecksum}
                setLoginChecksum={setLoginChecksum}
                regFullName={regFullName}
                setRegFullName={setRegFullName}
                regEmail={regEmail}
                setRegEmail={setRegEmail}
                regUsername={regUsername}
                setRegUsername={setRegUsername}
                regGender={regGender}
                setRegGender={setRegGender}
                generatedChecksum={generatedChecksum}
                setGeneratedChecksum={setGeneratedChecksum}
                calculateChecksumValue={calculateChecksumValue}
                addToast={addToast}
              />
            </motion.div>
          )}

          {/* TAB 1: LoopLab Positions */}
          {activeTab === 'looplab' && (
            <motion.div
              key="looplab"
              initial={{ opacity: 0, rotateY: 10, rotateX: 6, z: -120, y: 30 }}
              animate={{ opacity: 1, rotateY: 0, rotateX: 0, z: 0, y: 0 }}
              exit={{ opacity: 0, rotateY: -10, rotateX: -6, z: -120, y: -30 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12 max-w-6xl mx-auto font-sans"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Peachweb-inspired Header Section */}
              <div className="space-y-4 text-center md:text-left max-w-3xl">
                <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-fuchsia-400 font-extrabold bg-fuchsia-950/30 border border-fuchsia-500/10 px-3 py-1 rounded-full">
                  Primary Fellowship Tracks
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
                  LoopLab <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-indigo-300 italic font-serif">Leadership Core</span>
                </h2>
                <p className="text-sm text-purple-300/80 leading-relaxed mt-2">
                  We craft real-world software, foster robust engineer chapters, and manage digital communities. Choose a track below to apply for our active leadership and core development positions.
                </p>
              </div>

              {/* Executive Tier Feature Card */}
              <div className="relative overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-[#1b0a2c] via-[#120520] to-[#04010a] p-8 shadow-xl">
                <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-fuchsia-500/5 blur-3xl pointer-events-none" />
                <div className="md:flex md:items-center md:justify-between gap-8">
                  <div className="space-y-4 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-fuchsia-300 bg-fuchsia-950 px-2.5 py-0.5 rounded border border-fuchsia-400/30 uppercase font-bold">
                      ★ High Stakes Executive Track
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Vice President</h3>
                    <p className="text-xs text-purple-300 leading-relaxed">
                      Our ultimate strategic and operational leadership position. The selected candidate coordinates cross-departmental operations, drives developer relations chapters, and steers community strategy. 
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-fuchsia-200 font-mono bg-fuchsia-950/20 px-3 py-2 rounded-lg border border-fuchsia-500/10 w-fit">
                      <Gamepad2 className="w-4 h-4 text-fuchsia-400" />
                      <span>Required Action: Complete the Interactive VP Combat Simulator in Step 3 of the application.</span>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApplyRole('Vice President', 'LoopLab')}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-fuchsia-955/30 cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Apply & Launch Simulator</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Core Positions Grid */}
              <div className="space-y-6">
                <h3 className="text-xs font-mono uppercase tracking-[0.22em] text-purple-400 border-b border-purple-500/10 pb-2">
                  Core Management & Lead Positions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Tech Co-lead Card */}
                  <div className="group relative rounded-2xl border border-purple-500/10 bg-[#12081f]/80 p-6 flex flex-col justify-between hover:border-purple-500/30 hover:bg-[#180c28]/90 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/50 flex items-center justify-center text-purple-300 border border-purple-500/20">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight">Tech Co-lead</h4>
                      <p className="text-xs text-purple-300/80 leading-relaxed">
                        Responsible for software validation matrices, git ledger coordination, developer onboarding, and guiding core technical development models.
                      </p>
                    </div>
                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => handleApplyRole('Tech Co-lead', 'LoopLab')}
                        className="w-full py-2.5 bg-purple-950 hover:bg-purple-600 hover:text-white text-purple-300 text-xs font-extrabold tracking-widest uppercase rounded-xl transition-all border border-purple-500/20 cursor-pointer"
                      >
                        Apply for position
                      </button>
                    </div>
                  </div>

                  {/* Graphic Lead Card */}
                  <div className="group relative rounded-2xl border border-purple-500/10 bg-[#12081f]/80 p-6 flex flex-col justify-between hover:border-purple-500/30 hover:bg-[#180c28]/90 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/50 flex items-center justify-center text-purple-300 border border-purple-500/20">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight">Graphic Lead</h4>
                      <p className="text-xs text-purple-300/80 leading-relaxed">
                        Steers the community design aesthetic, from custom modern layouts and typography to promotional content designs, brand interfaces, and vector art.
                      </p>
                    </div>
                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => handleApplyRole('Graphic Lead', 'LoopLab')}
                        className="w-full py-2.5 bg-purple-950 hover:bg-purple-600 hover:text-white text-purple-300 text-xs font-extrabold tracking-widest uppercase rounded-xl transition-all border border-purple-500/20 cursor-pointer"
                      >
                        Apply for position
                      </button>
                    </div>
                  </div>

                  {/* Marketing Lead Card */}
                  <div className="group relative rounded-2xl border border-purple-500/10 bg-[#12081f]/80 p-6 flex flex-col justify-between hover:border-purple-500/30 hover:bg-[#180c28]/90 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/50 flex items-center justify-center text-purple-300 border border-purple-500/20">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight">Marketing Lead</h4>
                      <p className="text-xs text-purple-300/80 leading-relaxed">
                        Orchestrates outreach events, coordinates collaborative projects, handles public-relations coordinates, and expands community stature.
                      </p>
                    </div>
                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => handleApplyRole('Marketing Lead', 'LoopLab')}
                        className="w-full py-2.5 bg-purple-950 hover:bg-purple-600 hover:text-white text-purple-300 text-xs font-extrabold tracking-widest uppercase rounded-xl transition-all border border-purple-500/20 cursor-pointer"
                      >
                        Apply for position
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Fine grid of other support roles */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-purple-400 font-bold block">Additional Management Tracks</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Graphic Co-lead', desc: 'Co-directs asset libraries and designs interface layouts.' },
                    { title: 'Registration Co-lead', desc: 'Handles participant onboarding flow and roster coordination.' },
                    { title: 'Social Media Lead', desc: 'Owns content calendars, handles community engagement logs.' },
                    { title: 'Social Media Co-lead', desc: 'Maintains platform communication and schedules announcements.' },
                    { title: 'Cinematics Lead', desc: 'Directs elegant community trailers, motion promos, and captures.' },
                    { title: 'Cinematics Co-lead', desc: 'Processes cinematic renders, audio editing, and timing maps.' },
                    { title: 'Events Lead', desc: 'Organizes workspace hackathons and coordinates with external guest speakers.' },
                    { title: 'Events Co-lead', desc: 'Orchestrates live operational logistics, Q&As, and physical setups.' },
                    { title: 'Marketing Co-lead', desc: 'Drives newsletter distribution and manages registration campaigns.' }
                  ].map((role) => (
                    <div
                      key={role.title}
                      className="bg-[#10061c]/60 border border-purple-500/5 hover:border-purple-500/20 p-5 rounded-xl flex flex-col justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-purple-100 uppercase tracking-widest">{role.title}</h4>
                        <p className="text-[11px] text-purple-400 leading-relaxed">{role.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyRole(role.title, 'LoopLab')}
                        className="text-[10px] text-fuchsia-400 hover:text-white uppercase tracking-widest font-mono font-bold text-left hover:translate-x-1 transition-all flex items-center gap-1 cursor-pointer mt-2"
                      >
                        Request Track <span>&rarr;</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: LoopTech For Women */}
          {activeTab === 'looptech' && (
            <motion.div
              key="looptech"
              initial={{ opacity: 0, rotateY: 10, rotateX: 6, z: -120, y: 30 }}
              animate={{ opacity: 1, rotateY: 0, rotateX: 0, z: 0, y: 0 }}
              exit={{ opacity: 0, rotateY: -10, rotateX: -6, z: -120, y: -30 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12 max-w-6xl mx-auto font-sans"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Peachweb-inspired Premium Header */}
              <div className="relative overflow-hidden rounded-3xl border border-pink-500/15 bg-gradient-to-br from-[#1c081d] via-[#100315] to-[#04010a] p-8 md:p-12 shadow-2xl space-y-6">
                
                {/* Visual flower art floating, beautiful minimal design */}
                <div className="absolute right-6 top-6 text-pink-500/10 text-[10rem] select-none font-serif animate-spin [animation-duration:45s] pointer-events-none">❀</div>
                <div className="absolute left-1/4 bottom-0 text-pink-500/5 text-[15rem] select-none font-serif pointer-events-none">✿</div>

                <div className="space-y-4 max-w-3xl relative z-10">
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-[0.22em] text-pink-300 bg-pink-950/60 border border-pink-500/20 px-3 py-1 rounded-full font-bold">
                    <span>✿</span> Exclusively For Women Candidates
                  </span>
                  
                  <h2 className="text-3xl md:text-5xl font-extrabold text-[#fbcfe8] tracking-tight italic font-sans">
                    LoopTech <span className="font-normal font-serif text-white block mt-1 not-italic">Empowering Tech Leadership</span>
                  </h2>
                  
                  <div className="h-0.5 w-16 bg-gradient-to-r from-pink-500 to-purple-500 my-4" />
                  
                  <p className="text-sm md:text-base text-pink-200/90 leading-relaxed">
                    LoopTech is a dedicated, specialized tech wing operating under the parent wing of <strong className="text-white">LoopLab</strong>. To dismantle systemic imbalances and build a high-trust, safe, and elite space in the tech ecosystem, <strong className="text-pink-300">LoopTech takes women members only</strong>.
                  </p>
                  
                  <p className="text-xs text-pink-400/80 leading-relaxed max-w-2xl font-mono">
                    All graphics-arts, design blueprints, coding assignments, and chapter development coordinates in LoopTech are managed and driven autonomously by women innovators.
                  </p>
                </div>

                {/* Exclusive Perks Banner */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 bg-pink-950/15 border border-pink-500/10 rounded-2xl p-6 text-xs mt-6 max-w-4xl">
                  <div className="space-y-3">
                    <h3 className="font-bold text-[#fbcfe8] uppercase tracking-wider flex items-center gap-1.5">
                      <span>🌸</span> Elite Professional Support
                    </h3>
                    <ul className="space-y-2 text-[#f6ccd4]">
                      <li className="flex items-start gap-1.5">
                        <span className="text-pink-400 mt-0.5 font-bold">✦</span>
                        <span>Tailored 1-on-1 mentorship paths with seasoned women engineers.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-pink-400 mt-0.5 font-bold">✦</span>
                        <span>Specialized women-only engineering sprints, tech hackathons, and ideation pools.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-[#fbcfe8] uppercase tracking-wider flex items-center gap-1.5">
                      <span>🌸</span> Structural Startup Pipeline
                    </h3>
                    <ul className="space-y-2 text-[#f6ccd4]">
                      <li className="flex items-start gap-1.5">
                        <span className="text-pink-400 mt-0.5 font-bold">✦</span>
                        <span>Guaranteed allocation inside technical building sprints with <a href="https://loopdevelopers.com/" target="_blank" rel="noopener noreferrer" className="text-pink-400 font-bold hover:underline hover:text-pink-300 transition-colors">Loop Developer Studio</a>.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-pink-400 mt-0.5 font-bold">✦</span>
                        <span>Active priority channels to secure industry co-signs and speaker positions.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* LoopTech Dedicated Membership Showcase */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-400 font-bold block">Community Access</span>
                  <h3 className="text-xl font-bold text-white">General Membership Enrollment</h3>
                  <p className="text-xs text-purple-400">LoopTech operates as a safe, flat, peer-to-peer circle offering direct community participation without administrative hierarchy.</p>
                </div>

                <div className="relative rounded-3xl border border-pink-500/20 bg-gradient-to-br from-[#240a2c] via-[#100315] to-[#0a020e] p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                  <div className="absolute top-0 right-0 text-pink-500/5 text-9xl pointer-events-none select-none font-serif">🌸</div>
                  <div className="space-y-4 max-w-xl z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-pink-950/40 border border-pink-500/20 text-pink-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                      ✿ FLAT STRUCTURE CORE
                    </div>
                    
                    <h4 className="text-xl font-bold text-white tracking-tight">Become a LoopTech Member</h4>
                    <p className="text-xs text-pink-200/70 leading-relaxed">
                      To preserve an open, collaboration-first developer space and avoid administrative overheads, our platform functions without specialized active leadership roles. Members participate in collective software buildouts, share resources, and receive direct 1-on-1 industry mentorship.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-pink-300">
                      <span className="bg-pink-950/40 px-2 py-0.5 border border-pink-500/10 rounded">✦ Sprints & Hackathons</span>
                      <span className="bg-pink-950/40 px-2 py-0.5 border border-pink-500/10 rounded">✦ Female STEM Mentorship</span>
                      <span className="bg-pink-950/40 px-2 py-0.5 border border-pink-500/10 rounded">✦ Collaborative Build Circles</span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto z-10">
                    <button
                      type="button"
                      onClick={() => handleApplyRole('LoopTech Member', 'LoopTech For Women')}
                      className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-pink-700 to-fuchsia-700 hover:from-pink-600 hover:to-fuchsia-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-pink-900/40 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Apply for LoopTech Membership</span>
                      <span>🌸</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Fellowship Benefits */}
          {activeTab === 'fees' && (
            <motion.div
              key="fees"
              initial={{ opacity: 0, rotateY: 10, rotateX: 6, z: -120, y: 30 }}
              animate={{ opacity: 1, rotateY: 0, rotateX: 0, z: 0, y: 0 }}
              exit={{ opacity: 0, rotateY: -10, rotateX: -6, z: -120, y: -30 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl mx-auto space-y-12 font-sans"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Peachweb Header Style */}
              <div className="space-y-3 text-center max-w-2xl mx-auto">
                <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#a78bfa] font-black">
                  Value Architecture
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Fellowship Onboarding <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 italic font-serif">& Benefits</span>
                </h2>
                <p className="text-xs text-purple-400 leading-relaxed max-w-lg mx-auto">
                  LoopLab operates on a fully democratic, merit-first community template. All tuition, admission fees, and operational charges are waived.
                </p>
              </div>

              {/* Society Registration Fee Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-b from-[#10071c] to-[#04010a] border border-purple-500/15 p-6 rounded-2xl text-center space-y-2">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#a78bfa] font-bold block">
                    Financial Model
                  </span>
                  <span className="text-xs font-semibold text-purple-250 block">Society Registration Fee</span>
                  <span className="text-3xl font-black text-fuchsia-400 py-2 block">PKR 500</span>
                  <p className="text-xs text-purple-405 leading-relaxed max-w-xs mx-auto">
                    A society registration fee of <strong className="text-white">PKR 500</strong> applies for all general student and non-member applications to cover processing, portal resource reservation, and verification pipelines. Academic tuition remains 100% free.
                  </p>
                </div>

                <div className="bg-gradient-to-b from-[#10071c] to-[#04010a] border border-purple-500/15 p-6 rounded-2xl text-center space-y-2">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#a78bfa] font-bold block">
                    Admissions Pathway
                  </span>
                  <span className="text-xs font-semibold text-purple-200 block">Candidacy Selection Basis</span>
                  <span className="text-3xl font-black text-fuchsia-400 py-2 block">Merit First</span>
                  <p className="text-xs text-purple-400 leading-relaxed max-w-xs mx-auto">
                    Placements are finalized solely through structural strategic statements, answers, and simulated skill assessment ratings.
                  </p>
                </div>
              </div>

              {/* Massive Premium Benefits Grid */}
              <div className="space-y-6">
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-purple-400 border-b border-purple-500/10 pb-2">
                  The Fellowship Advantage
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Perk 1: Certificate */}
                  <div className="bg-[#12081f]/80 border border-purple-500/10 p-6 rounded-2xl space-y-4 hover:border-purple-500/30 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/25 flex items-center justify-center text-purple-300">
                      <Award className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight">Official Credentials & Certification</h4>
                    <p className="text-xs text-purple-300/80 leading-relaxed">
                      Receive an official signed Certificate of Contribution upon completing your operational fellowship milestone. This formal design credential serves as premium proof of leadership, technical capability, and design excellence.
                    </p>
                  </div>

                  {/* Perk 2: Active Mentorship Sessions */}
                  <div className="bg-[#12081f]/80 border border-purple-500/10 p-6 rounded-2xl space-y-4 hover:border-purple-500/30 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/25 flex items-center justify-center text-purple-300">
                      <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight">Mentorship & Guest Masterclasses</h4>
                    <p className="text-xs text-purple-300/80 leading-relaxed">
                      Gain direct access to specialized training sessions, code audits, peer programming, and curated design reviews with master developers. Enjoy exclusive live sessions hosted by senior tech co-leads and industry guest speakers.
                    </p>
                  </div>

                  {/* Perk 3: Loop Developer Studio */}
                  <div className="bg-gradient-to-br from-[#12081f] to-[#1c082e] border border-purple-500/20 p-6 rounded-2xl space-y-4 hover:border-purple-500/30 transition-all duration-300 relative group">
                    <span className="absolute top-3 right-3 text-[8px] font-mono tracking-wider text-pink-400 font-extrabold bg-pink-950/40 border border-pink-500/20 px-2.5 py-0.5 rounded uppercase">
                      Startup Track
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/25 flex items-center justify-center text-purple-300">
                      <Cpu className="w-5 h-5 text-pink-400" />
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight">Loop Developer Studio Projects</h4>
                    <p className="text-xs text-purple-300/80 leading-relaxed">
                      Step directly into the startup ecosystem. Select members are integrated into <a href="https://loopdevelopers.com/" target="_blank" rel="noopener noreferrer" className="text-pink-400 font-bold hover:underline hover:text-pink-300 transition-colors">Loop Developer Studio</a>—the software building & startup incubation arm of LoopLab. Collaborate on shipping real-world apps, commercial tech projects, and live client contracts.
                    </p>
                    <div className="pt-2">
                      <a 
                        href="https://loopdevelopers.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase text-pink-400 bg-pink-950/40 hover:bg-pink-950/80 border border-pink-500/20 px-3.5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-pink-950/20"
                      >
                        <span>Launch Loop Developers</span>
                        <span>&rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Active */}
              <div className="bg-purple-950/20 border border-purple-500/10 rounded-2xl p-6 text-center space-y-4">
                <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">Step into the future</span>
                <p className="text-xs text-purple-300 max-w-md mx-auto">
                  Ready to align with LoopLab or LoopTech For Women? Secure your registration slot today in less than five minutes.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('looplab')}
                    className="px-5 py-2.5 bg-purple-650 hover:bg-purple-500 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Apply for Positions
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('looptech')}
                    className="px-5 py-2.5 bg-pink-950 hover:bg-pink-900 border border-pink-500/20 text-[#fbcfe8] font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer animate-pulse"
                  >
                    LoopTech for Women 🌸
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Register as Member */}
          {activeTab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, rotateY: 10, rotateX: 6, z: -120, y: 30 }}
              animate={{ opacity: 1, rotateY: 0, rotateX: 0, z: 0, y: 0 }}
              exit={{ opacity: 0, rotateY: -10, rotateX: -6, z: -120, y: -30 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto space-y-6"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="bg-[#12091f]/95 border border-purple-500/20 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute right-4 top-4 text-purple-500/10 text-8xl select-none font-serif">✿</div>
                <MemberForm onSubmit={handleRegisterMember} />
              </div>
            </motion.div>
          )}

          {/* TAB 5: Admin Command Center */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, rotateY: 10, rotateX: 6, z: -120, y: 30 }}
              animate={{ opacity: 1, rotateY: 0, rotateX: 0, z: 0, y: 0 }}
              exit={{ opacity: 0, rotateY: -10, rotateX: -6, z: -120, y: -30 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <AdminPortalDashboard 
                applications={applications}
                onUpdateApplications={handleUpdateAppsByAdmin}
                onClose={() => setActiveTab('looplab')}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* STUDENT REGISTRATION INTERACTIVE MODAL OVERLAY */}
      {selectedRoleToApply && (
        <div className="fixed inset-0 bg-[#0c0515]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12091f] border border-purple-500/30 rounded-3xl p-6 shadow-2xl max-w-2xl w-full relative">
            
            <button
              onClick={() => setSelectedRoleToApply(null)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white transition-colors p-1"
            >
              ✕
            </button>

            <div className="space-y-1 mb-5 border-b border-purple-500/15 pb-4">
              <span className={`inline-block text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                selectedRoleToApply.section === 'LoopTech For Women' 
                  ? 'bg-pink-950/40 text-pink-300 border-pink-500/20' 
                  : 'bg-purple-950/40 text-purple-300 border-purple-500/20'
              }`}>
                {selectedRoleToApply.section} placement node
              </span>
              <h3 className="text-lg font-black text-white relative flex items-center gap-2">
                <span>Placement Request: {selectedRoleToApply.title}</span>
              </h3>
            </div>

            <StudentApplicationForm
              onSubmitSuccess={(newApp) => {
                handleAppSubmitSuccess(newApp);
              }}
              onClose={() => setSelectedRoleToApply(null)}
            />
          </div>
        </div>
      )}

      {/* Pristine Sophisticated Dark Footer bar with status indicator */}
      <footer className="w-full max-w-7xl mx-auto mt-8 bg-gradient-to-r from-[#160b26] to-[#04010a] border border-purple-500/15 rounded-xl px-5 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-white tracking-wider">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-purple-200 font-semibold uppercase tracking-widest text-[10px]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LoopLab Ecosystem
          </span>
          <span className="text-purple-800">|</span>
          <span className="text-[#a78bfa] text-[10px] font-mono">ALL SYSTEMS SECURE & OPERATIONAL</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono mt-2 sm:mt-0">
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className="text-fuchsia-300 hover:text-white transition-all uppercase font-bold text-[10px] tracking-wider px-3 py-1.5 bg-purple-950/40 border border-purple-500/15 rounded-lg hover:border-purple-500/30 cursor-pointer"
          >
            ⚖ Admin Portal
          </button>
        </div>
      </footer>

      {/* Cinematic Animation Intro Overlay */}
      <AnimatePresence>
        {showIntro && (
          <IntroCinematic onClose={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* alerts toasts display */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
