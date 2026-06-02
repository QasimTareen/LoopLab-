import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, KeyRound, LogOut, Check, X, ShieldAlert, FileSpreadsheet, 
  Trash2, Edit, Plus, Eye, Clock, UserCheck, AlertCircle, FileText, Search
} from 'lucide-react';
import { StudentApplication, LISTED_POSITIONS } from '../types';

interface AdminPortalDashboardProps {
  applications: StudentApplication[];
  onUpdateApplications: (apps: StudentApplication[]) => void;
  onClose: () => void;
}

export default function AdminPortalDashboard({ 
  applications, 
  onUpdateApplications, 
  onClose 
}: AdminPortalDashboardProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [isUnlockAnimating, setIsUnlockAnimating] = useState(false);
  const [loginError, setLoginError] = useState('');

  // CRUD & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Custom non-blocking modal state representing the 'confirm' replacement
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionLabel: 'Confirm',
    onConfirm: () => {}
  });

  const triggerConfirm = (title: string, message: string, actionLabel: string, onConfirmAction: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      actionLabel,
      onConfirm: () => {
        onConfirmAction();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Buffer fields for Create/Edit operations
  const [bufName, setBufName] = useState('');
  const [bufEmail, setBufEmail] = useState('');
  const [bufWhatsapp, setBufWhatsapp] = useState('');
  const [bufGender, setBufGender] = useState<'male' | 'female' | 'other'>('male');
  const [bufIsExMember, setBufIsExMember] = useState(false);
  const [bufSection, setBufSection] = useState<'LoopLab' | 'LoopTech For Women'>('LoopLab');
  const [bufPosition, setBufPosition] = useState('');
  const [bufExp, setBufExp] = useState('');
  const [bufReason, setBufReason] = useState('');
  const [bufSkills, setBufSkills] = useState('');
  const [bufStatus, setBufStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [bufFeeStatus, setBufFeeStatus] = useState<'waived' | 'pending_payment' | 'paid'>('paid');
  const [bufFeeAmount, setBufFeeAmount] = useState<number>(500);

  // Sub-tab state for Administrator portal view toggling
  const [subTab, setSubTab] = useState<'applications' | 'accounts'>('applications');
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  
  // Custom sign-in and login record states
  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('looplab_custom_users');
      const usersObj = saved ? JSON.parse(saved) : {};
      return Object.values(usersObj);
    } catch {
      return [];
    }
  });

  const [activeSessions, setActiveSessions] = useState<string[]>(() => {
    try {
      const active = localStorage.getItem('looplab_active_sessions');
      return active ? JSON.parse(active) : [];
    } catch {
      return [];
    }
  });

  const [accountsSearchQuery, setAccountsSearchQuery] = useState('');

  const refreshUsers = () => {
    try {
      const saved = localStorage.getItem('looplab_custom_users');
      const usersObj = saved ? JSON.parse(saved) : {};
      setRegisteredUsers(Object.values(usersObj));

      const active = localStorage.getItem('looplab_active_sessions');
      setActiveSessions(active ? JSON.parse(active) : []);
    } catch (e) {
      console.error('Error refreshing portal accounts:', e);
    }
  };

  const handleDeleteUser = (email: string) => {
    triggerConfirm(
      "CONFIRM ACCOUNT TERMINATION",
      `ADMIN WARN: Are you absolutely sure you want to terminate the credentials for [${email}]? This will revoke access and cancel checksum login capability instantly.`,
      "Revoke Access",
      () => {
        try {
          const saved = localStorage.getItem('looplab_custom_users');
          const usersObj = saved ? JSON.parse(saved) : {};
          delete usersObj[email];
          localStorage.setItem('looplab_custom_users', JSON.stringify(usersObj));

          // Expel dynamic sessions
          const active = localStorage.getItem('looplab_active_sessions');
          let activeArr = active ? JSON.parse(active) : [];
          activeArr = activeArr.filter((item: string) => item !== email);
          localStorage.setItem('looplab_active_sessions', JSON.stringify(activeArr));

          refreshUsers();
          if (selectedAccount && selectedAccount.email === email) {
            setSelectedAccount(null);
          }
        } catch (e) {
          console.error("Error executing account deletion: ", e);
        }
      }
    );
  };

  const handleClearSession = (email: string) => {
    try {
      const active = localStorage.getItem('looplab_active_sessions');
      let activeArr = active ? JSON.parse(active) : [];
      activeArr = activeArr.filter((item: string) => item !== email);
      localStorage.setItem('looplab_active_sessions', JSON.stringify(activeArr));
      refreshUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllSessions = () => {
    triggerConfirm(
      "TERMINATE SYSTEM SESSIONS",
      "ADMIN RESET: Terminate all active concurrent user sessions across the student portal? This will instantly sign out all active accounts.",
      "Clear Sessions",
      () => {
        try {
          localStorage.setItem('looplab_active_sessions', '[]');
          refreshUsers();
        } catch (e) {
          console.error(e);
        }
      }
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passphrase.trim();
    const adminPasscode = import.meta.env.VITE_ADMIN_PASSCODE;
    if (adminPasscode ? cleanPass === adminPasscode : cleanPass === 'looplab-change-me') {
      setIsUnlockAnimating(true);
      setLoginError('');
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsUnlockAnimating(false);
      }, 1800);
    } else {
      setLoginError('VAULT DETECTED INVALID PASSCODE: Secure access key rejected.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassphrase('');
    onClose();
  };

  // Status controls
  const handleSetStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    const updated = applications.map(app => {
      if (app.id === id) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    onUpdateApplications(updated);
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, status: newStatus });
    }
  };

  // Delete control
  const handleDelete = (id: string) => {
    triggerConfirm(
      "DELETE CANDIDATE RECORD",
      "Verify: Are you absolutely sure you wish to delete this registry candidate from the data archives? This action is permanent.",
      "Delete permanently",
      () => {
        const updated = applications.filter(app => app.id !== id);
        onUpdateApplications(updated);
        setSelectedApp(null);
      }
    );
  };

  // Open candidate editor
  const handleOpenEdit = (app: StudentApplication) => {
    setSelectedApp(app);
    setBufName(app.fullName);
    setBufEmail(app.email);
    setBufWhatsapp(app.whatsapp);
    setBufGender(app.gender);
    setBufIsExMember(app.isExistingLoopLabMember);
    setBufSection(app.section);
    setBufPosition(app.position);
    setBufExp(app.answers.experience);
    setBufReason(app.answers.motivation);
    setBufSkills(app.answers.skills);
    setBufStatus(app.status);
    setBufFeeStatus(app.feeStatus || 'paid');
    setBufFeeAmount(app.feeAmountPaid !== undefined ? app.feeAmountPaid : 500);
    setIsEditing(true);
    setIsAdding(false);
  };

  // Save edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const updated = applications.map(app => {
      if (app.id === selectedApp.id) {
        return {
          ...app,
          fullName: bufName,
          email: bufEmail,
          whatsapp: bufWhatsapp,
          gender: bufGender,
          isExistingLoopLabMember: bufIsExMember,
          section: bufSection,
          position: bufPosition,
          status: bufStatus,
          feeStatus: bufFeeStatus,
          feeAmountPaid: Number(bufFeeAmount),
          answers: {
            experience: bufExp,
            motivation: bufReason,
            skills: bufSkills
          }
        };
      }
      return app;
    });

    onUpdateApplications(updated);
    setIsEditing(false);
    setSelectedApp(null);
  };

  // Open candidate adder
  const handleOpenAdd = () => {
    setBufName('');
    setBufEmail('');
    setBufWhatsapp('');
    setBufGender('male');
    setBufIsExMember(false);
    setBufSection('LoopLab');
    setBufPosition('Tech Co-lead');
    setBufExp('Simulated addition of profile');
    setBufReason('Assigned manually');
    setBufSkills('Figma, React');
    setBufStatus('pending');
    setIsAdding(true);
    setIsEditing(false);
  };

  // Save manual insert
  const handleSaveInsert = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: StudentApplication = {
      id: 'APP-' + Math.floor(100000 + Math.random() * 900000),
      fullName: bufName,
      email: bufEmail,
      whatsapp: bufWhatsapp,
      gender: bufGender,
      isExistingLoopLabMember: bufIsExMember,
      section: bufSection,
      position: bufPosition,
      feeStatus: 'waived',
      feeAmountPaid: 0,
      answers: {
        experience: bufExp,
        motivation: bufReason,
        skills: bufSkills
      },
      status: bufStatus,
      submittedAt: new Date().toISOString()
    };

    onUpdateApplications([newApp, ...applications]);
    setIsAdding(false);
  };

  // Structuring clean structured excel-compatible downloads of all individual candidate stats & essays
  const handleExportCSV = () => {
    if (applications.length === 0) {
      alert('Data Register is currently empty.');
      return;
    }

    const headers = [
      'Application ID', 'Full Name', 'Email', 'Whatsapp', 'Gender', 
      'Existing LoopLab Member', 'Society Division', 'Proposed Position', 
      'Fee Status', 'Fee Paid PKR', 'VP Score', 'VP Max Score', 'VP Time Remaining Sec', 
      'VP Strategic Verdict', 'VP Strategic Choices', 'Experience Essay', 'Motivation Essay', 
      'Technical Skills Essay', 'Review Status', 'Administrator Notes', 'Applied Date'
    ];

    const escapeCSV = (val: string | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const cleanVal = String(val).replace(/"/g, '""');
      return `"${cleanVal}"`;
    };

    const rows = applications.map(app => [
      escapeCSV(app.id),
      escapeCSV(app.fullName),
      escapeCSV(app.email),
      escapeCSV(app.whatsapp),
      escapeCSV(app.gender),
      escapeCSV(app.isExistingLoopLabMember ? 'Yes' : 'No'),
      escapeCSV(app.section),
      escapeCSV(app.position),
      escapeCSV(app.feeStatus),
      app.feeAmountPaid,
      app.gamingAssessment ? app.gamingAssessment.correctAnswers : 'N/A',
      app.gamingAssessment ? app.gamingAssessment.totalQuestions : 'N/A',
      app.gamingAssessment ? app.gamingAssessment.timeRemainingSec : 'N/A',
      escapeCSV(app.gamingAssessment?.strategicVerdict || 'N/A'),
      escapeCSV(app.gamingAssessment?.strategicDecisions ? app.gamingAssessment.strategicDecisions.join(' | ') : 'N/A'),
      escapeCSV(app.answers?.experience || ''),
      escapeCSV(app.answers?.motivation || ''),
      escapeCSV(app.answers?.skills || ''),
      escapeCSV(app.status.toUpperCase()),
      escapeCSV(app.adminNotes || ''),
      escapeCSV(new Date(app.submittedAt).toISOString())
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LoopLab_Candidate_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter application list
  const filteredApps = applications.filter(app => {
    const term = searchQuery.toLowerCase();
    return (
      app.fullName.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term) ||
      app.position.toLowerCase().includes(term) ||
      app.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full text-purple-100 min-h-[500px]">
      {!isAuthenticated ? (
        /* SECURE HIGH-TECH SCIFI VAULT DOOR LOGIN (Faithful mockup representation) */
        <div className="max-w-xl mx-auto bg-black/85 border border-teal-500/25 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_50px_rgba(20,184,166,0.18)] relative overflow-hidden backdrop-blur-xl font-sans">
          
          {/* Top Security Status Bar */}
          <div className="flex justify-between items-center mb-6 border-b border-teal-500/15 pb-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isUnlockAnimating ? 'bg-amber-400 animate-pulse' : 'bg-red-500 animate-ping'}`} />
              <span className="text-[10px] font-mono tracking-widest text-[#2dd4bf] font-extrabold uppercase">
                {isUnlockAnimating ? 'VAULT DECOMPRESSING...' : 'LEDGER SECURE DEPOSITORY VAULT'}
              </span>
            </div>
            <span className="text-[9px] font-mono bg-teal-950 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-md">
              VAULT SECTOR-7
            </span>
          </div>

          <div className="text-center mb-6 space-y-1">
            <h3 className="font-display font-black text-xl text-white uppercase tracking-wider drop-shadow-md">
              Vault Access Control
            </h3>
            <p className="text-xs text-slate-400">Unlock using the restricted master secret passcode</p>
          </div>

          {/* THE SKEUOMORPHIC STAINLESS STEEL SAFE VAULT DOOR */}
          <div className="relative w-full h-64 bg-[#0d151a] border-4 border-[#1b2b35] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center mb-6">
            
            {/* Thick Glowing Mint Neon Tube Bar Framing */}
            <div className="absolute inset-1.5 border-[3px] border-[#2dd4bf] rounded-xl pointer-events-none shadow-[0_0_22px_rgba(45,212,191,0.75),inset_0_0_18px_rgba(45,212,191,0.45)]" />

            {/* Tech grid layout backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#1c2d36_1.2px,transparent_1.2px)] bg-[size:16px_16px] opacity-35 pointer-events-none" />

            {/* Split Steel Door Halves */}
            <div className="absolute inset-3 rounded-lg overflow-hidden flex">
              
              {/* Left Steel Door Half */}
              <motion.div 
                initial={{ x: 0 }}
                animate={{ x: isUnlockAnimating ? -165 : 0 }}
                transition={{ delay: 0.6, duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
                className="w-1/2 h-full bg-gradient-to-r from-slate-800 to-slate-700 border-r border-[#15232c] shadow-inner relative flex items-center justify-end"
              >
                <div className="absolute left-4 top-4 w-3.5 h-3.5 rounded-full bg-black/45 border border-white/5" />
                <div className="absolute left-4 bottom-4 w-3.5 h-3.5 rounded-full bg-black/45 border border-white/5" />
                <div className="w-1 bg-[#0f191f] h-full" />
              </motion.div>

              {/* Right Steel Door Half */}
              <motion.div 
                initial={{ x: 0 }}
                animate={{ x: isUnlockAnimating ? 165 : 0 }}
                transition={{ delay: 0.6, duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
                className="w-1/2 h-full bg-gradient-to-l from-slate-800 to-slate-700 border-l border-[#15232c] shadow-inner relative flex items-center justify-start"
              >
                <div className="absolute right-4 top-4 w-3.5 h-3.5 rounded-full bg-black/45 border border-white/5" />
                <div className="absolute right-4 bottom-4 w-3.5 h-3.5 rounded-full bg-black/45 border border-white/5" />
                <div className="w-1 bg-[#0f191f] h-full" />
              </motion.div>
            </div>

            {/* Horizontal Locking Crossbar System with Pinkish Highlight Bracket */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: isUnlockAnimating ? 360 : 0, opacity: isUnlockAnimating ? 0 : 1 }}
              transition={{ duration: 0.75, ease: "easeInOut" }}
              className="absolute w-4/5 h-12 bg-gradient-to-r from-slate-700 via-slate-650 to-slate-700 border border-slate-500/25 shadow-xl rounded flex items-center justify-between px-6 pointer-events-none z-20"
            >
              {/* Left Bracket in Pink/Rose Accent matching the image style exactly */}
              <div className="w-5 h-full bg-gradient-to-b from-rose-500 to-rose-700 rounded-l border-r border-rose-400/30 flex items-center justify-center -ml-6 shadow-md shadow-rose-950/40">
                <div className="w-2 h-4 bg-black/45 rounded-full" />
              </div>

              {/* Little rivets on steel crossbar */}
              <div className="flex gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-black/55 border border-slate-500/35 shadow-inner" />
                <div className="w-2.5 h-2.5 rounded-full bg-black/55 border border-slate-500/35 shadow-inner" />
              </div>
              <div className="flex gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-black/55 border border-slate-500/35 shadow-inner" />
                <div className="w-2.5 h-2.5 rounded-full bg-black/55 border border-slate-500/35 shadow-inner" />
              </div>

              {/* Right Bracket */}
              <div className="w-5 h-full bg-gradient-to-b from-slate-600 to-slate-800 rounded-r border-l border-slate-500/35 -mr-6 flex items-center justify-center">
                <div className="w-2 h-4 bg-black/45 rounded-full" />
              </div>
            </motion.div>

            {/* Rotating Central Gear Dial / Rotary Locking Wheel with Neon Green Ring */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: isUnlockAnimating ? 360 : 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-slate-850 to-slate-650 border-8 border-slate-700 shadow-[0_0_25px_rgba(45,212,191,0.55),inset_0_3px_5px_rgba(255,255,255,0.25)] flex items-center justify-center pointer-events-none z-30"
            >
              {/* Spinning tooth ticks */}
              <div className="absolute inset-1 rounded-full border border-teal-400/35 border-dashed animate-spin [animation-duration:12s]" />

              {/* Inner rotary knob core */}
              <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center relative shadow-inner">
                
                {/* Visual Wheel spokes */}
                <div className="absolute inset-0.5 border border-teal-500/4 w-full rotate-45 transform" />
                <div className="absolute inset-0.5 border border-teal-500/4 w-full -rotate-45 transform" />
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-teal-500/35 -translate-x-1/2" />
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-teal-500/35 -translate-y-1/2" />

                {/* Secure Active core LED */}
                <div className={`w-5 h-5 rounded-full shadow-inner border transition-all duration-300 ${
                  isUnlockAnimating ? 'bg-[#14b8a6] border-emerald-300 shadow-emerald-500 animate-pulse' : 'bg-red-500 border-red-300 shadow-red-500'
                }`} />
              </div>
            </motion.div>

            {/* Ambient HUD text labels */}
            <div className="absolute top-6 left-6 z-10 text-[9px] font-mono text-teal-400/80 uppercase select-none tracking-wider">
              SYS STATUS: ARMED
            </div>

            <div className="absolute bottom-6 right-6 z-10 text-[9px] font-mono text-teal-400/80 uppercase select-none tracking-widest">
              {isUnlockAnimating ? 'OPENING...' : 'LOCKED'}
            </div>
          </div>

          {/* Access Key rejection warning */}
          {loginError && (
            <div className="p-3 bg-red-950/60 border border-red-500/20 rounded-xl text-xs text-red-100 flex items-start gap-2 mb-4 animate-fadeIn font-sans">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Core password entry interface */}
          <form onSubmit={handleLogin} className="space-y-4 font-sans max-w-md mx-auto">
            <div>
              <label className="block text-[10px] uppercase font-mono text-[#2dd4bf] font-black tracking-wider mb-2 text-center">
                ENTER LEGER VAULT SECRET SECURITY PASSCODE:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  disabled={isUnlockAnimating}
                  placeholder="••••••••••••"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full text-center py-4 px-6 bg-slate-950 border border-teal-500/20 rounded-full text-lg font-mono font-bold text-teal-300 placeholder-teal-900 focus:outline-none focus:border-teal-400 transition-all focus:ring-4 focus:ring-teal-500/10 shadow-[inset_0_3px_6px_rgba(0,0,0,0.6)]"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-60 text-teal-400">
                  <KeyRound className="w-5 h-5" />
                </div>
              </div>
              <span className="block text-[9px] text-slate-500 font-mono mt-2 text-center select-none">
                Note: Authorized credential input is calculated based on strict custom safety codes.
              </span>
            </div>

            <div className="pt-2 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isUnlockAnimating}
                className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-slate-400 border border-slate-800 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
              >
                Exit Vault
              </button>
              <button
                type="submit"
                disabled={isUnlockAnimating}
                className="flex-[2] py-3.5 bg-[#14b8a6] hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-black rounded-full border-2 border-teal-200 text-xs uppercase tracking-widest cursor-pointer transition-all shadow-[0_4px_12px_rgba(20,184,166,0.3)] disabled:opacity-50"
              >
                {isUnlockAnimating ? 'DECRYPTING...' : 'OPEN VAULT'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Admin dashboard screen */
        <div className="space-y-4">
          
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#160b26] p-4 rounded-xl border border-purple-500/10">
            <div>
              <h3 className="font-display font-bold text-sm text-purple-200 uppercase tracking-widest">
                Admin Workspace Active
              </h3>
              <p className="text-[10px] text-purple-400 font-mono">
                Ledger Sync Mode online: {applications.length} files tracked
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-1.5 bg-purple-650 hover:bg-purple-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 uppercase transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual Insert</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 uppercase transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel/CSV</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900 text-red-300 font-bold text-xs rounded-lg flex items-center gap-1 uppercase transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pure Candidate Database Registry Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-purple-500/15 pb-3">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#2dd4bf] bg-teal-950/50 border border-teal-500/25 px-2.5 py-0.5 rounded font-extrabold animate-pulse">
                SECURE CANDIDATE LEDGER GATEWAY
              </span>
              <p className="text-xs text-purple-300 mt-1">Review, approve/reject, and export candidate registrations and tactile scores database.</p>
            </div>
            <div className="text-[11px] font-mono font-black text-teal-400 bg-teal-950/20 px-3 py-1.5 border border-teal-500/10 rounded-lg">
              🎯 REGISTRANTS: {filteredApps.length} Candidates
            </div>
          </div>

          {true ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Candidates Database list */}
              <div className="lg:col-span-8 space-y-3 bg-[#12091f]/90 border border-purple-500/10 rounded-xl p-4">
                
                {/* Search registry bar */}
                <div className="relative">
                  <span className="absolute left-3 inset-y-0 flex items-center text-purple-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter by Full Name, Email, ID or Position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#160b26]/60 border border-purple-500/20 rounded-lg text-xs text-white placeholder-purple-600"
                  />
                </div>

                {/* Data registry table */}
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-purple-500/10 text-purple-400 font-mono uppercase tracking-wider">
                        <th className="py-2 px-1">ID / Candidate</th>
                        <th className="py-2">Division & Role</th>
                        <th className="py-2">VP Score</th>
                        <th className="py-2 text-center">Approve Status</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/5">
                      {filteredApps.map((app) => (
                        <tr key={app.id} className="hover:bg-purple-950/25 transition-colors">
                          <td className="py-3 px-1">
                            <span className="block font-bold text-white text-xs">{app.fullName}</span>
                            <span className="text-[10px] text-purple-500 font-mono">{app.id} | {app.whatsapp}</span>
                          </td>
                          <td className="py-3">
                            <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border mb-0.5 ${
                              app.section === 'LoopTech For Women' 
                                ? 'bg-pink-950/30 text-pink-400 border-pink-500/20' 
                                : 'bg-purple-950/40 text-purple-300 border-purple-500/20'
                            }`}>
                              {app.section}
                            </span>
                            <span className="block text-xs font-semibold text-purple-200">{app.position}</span>
                          </td>
                          <td className="py-3 font-mono">
                            {app.gamingAssessment ? (
                              <span className="text-fuchsia-300 font-bold">{app.gamingAssessment.correctAnswers}/30</span>
                            ) : (
                              <span className="text-purple-500">N/A</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                              app.status === 'approved' 
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' 
                                : app.status === 'rejected' 
                                ? 'bg-red-950/60 text-red-400 border border-red-500/30' 
                                : 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleSetStatus(app.id, 'approved')}
                              title="Approve Candidate"
                              className="p-1 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(app.id, 'rejected')}
                              title="Reject Candidate"
                              className="p-1 rounded bg-red-950/40 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(app)}
                              title="Edit / View Details"
                              className="p-1 rounded bg-[#160b26] border border-purple-500/20 text-purple-400 hover:border-purple-400 transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(app.id)}
                              title="Delete file record"
                              className="p-1 rounded bg-red-950/20 text-red-400 hover:bg-red-800 hover:text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredApps.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-purple-500">
                            No candidate registry found corresponding to the entry query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* In-Platform Editor (Form CRUD sidebar panel) */}
              <div className="lg:col-span-4 bg-[#12091f]/95 border border-purple-500/10 rounded-xl p-4">
                {isEditing ? (
                  /* Edit CRUD block */
                  <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
                    <div className="border-b border-purple-500/10 pb-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 block">MODIFICATION FRAMEWORK</span>
                      <h4 className="text-sm font-bold text-white relative">
                        Update Candidate profile
                        <button 
                          type="button" 
                          onClick={() => setIsEditing(false)} 
                          className="absolute right-0 top-0 text-purple-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Full Name</label>
                        <input 
                          type="text" 
                          value={bufName} 
                          onChange={(e) => setBufName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white" 
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Email Address</label>
                        <input 
                          type="email" 
                          value={bufEmail} 
                          onChange={(e) => setBufEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white" 
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">WhatsApp No.</label>
                        <input 
                          type="text" 
                          value={bufWhatsapp} 
                          onChange={(e) => setBufWhatsapp(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Gender</label>
                          <select 
                            value={bufGender}
                            onChange={(e) => setBufGender(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white text-[11px]"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Approval status</label>
                          <select 
                            value={bufStatus}
                            onChange={(e) => setBufStatus(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white text-[11px]"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Fee Status</label>
                          <select 
                            value={bufFeeStatus}
                            onChange={(e) => setBufFeeStatus(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white text-[11px]"
                          >
                            <option value="paid">Paid</option>
                            <option value="pending_payment">Pending Payment</option>
                            <option value="waived">Waived</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Fee Paid Amount</label>
                          <input 
                            type="number" 
                            value={bufFeeAmount} 
                            onChange={(e) => setBufFeeAmount(Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white text-[11px] font-mono" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Placed Division</label>
                        <select 
                          value={bufSection}
                          onChange={(e) => setBufSection(e.target.value as any)}
                          className="w-full px-2 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white text-[11px]"
                        >
                          <option value="LoopLab">LoopLab General</option>
                          <option value="LoopTech For Women">LoopTech For Women</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Target Placement Role</label>
                        <input 
                          type="text" 
                          value={bufPosition} 
                          onChange={(e) => setBufPosition(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white" 
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Experience profile response</label>
                        <textarea 
                          rows={2} 
                          value={bufExp} 
                          onChange={(e) => setBufExp(e.target.value)}
                          className="w-full p-2 bg-[#160b26] border border-purple-500/20 rounded-lg text-white" 
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-purple-650 hover:bg-purple-500 text-white font-bold rounded-lg uppercase tracking-wider text-[10px]"
                      >
                        Commit Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-300 rounded-lg text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : isAdding ? (
                  /* Create CRUD block */
                  <form onSubmit={handleSaveInsert} className="space-y-3 text-xs">
                    <div className="border-b border-purple-500/10 pb-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 block">NEW TELEMETRY CREATOR</span>
                      <h4 className="text-sm font-bold text-white relative">
                        Insert New Candidate Profile
                        <button 
                          type="button" 
                          onClick={() => setIsAdding(false)} 
                          className="absolute right-0 top-0 text-purple-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. Adan Vance" 
                          value={bufName} 
                          onChange={(e) => setBufName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white placeholder-purple-800" 
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Email Address</label>
                        <input 
                          type="email" 
                          required 
                          placeholder="adan@vance.com" 
                          value={bufEmail} 
                          onChange={(e) => setBufEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white placeholder-purple-800" 
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">WhatsApp No.</label>
                        <input 
                          type="text" 
                          placeholder="0300-1234567" 
                          value={bufWhatsapp} 
                          onChange={(e) => setBufWhatsapp(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white placeholder-purple-800" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Gender</label>
                          <select 
                            value={bufGender}
                            onChange={(e) => setBufGender(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white text-[11px]"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Existing Society</label>
                          <select 
                            value={bufIsExMember ? 'true' : 'false'}
                            onChange={(e) => setBufIsExMember(e.target.value === 'true')}
                            className="w-full px-2 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white text-[11px]"
                          >
                            <option value="false">New Candidate</option>
                            <option value="true">Current Member</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Placement Society Area</label>
                        <select 
                          value={bufSection}
                          onChange={(e) => setBufSection(e.target.value as any)}
                          className="w-full px-[#160b26] py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white text-[11px]"
                        >
                          <option value="LoopLab">LoopLab General</option>
                          <option value="LoopTech For Women">LoopTech For Women</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-400 uppercase font-mono mb-1">Target Placement Role</label>
                        <input 
                          type="text" 
                          value={bufPosition} 
                          onChange={(e) => setBufPosition(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#160b26] border border-purple-500/20 rounded-lg text-white" 
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg uppercase tracking-wider text-[10px]"
                      >
                        Insert entry
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-300 rounded-lg text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Information inspection sidebar block */
                  <div className="space-y-4">
                    <div className="border-b border-purple-500/10 pb-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 block">System Inspector</span>
                      <h4 className="text-sm font-bold text-white">Registry Dossier Detail</h4>
                    </div>

                    {selectedApp ? (
                      <div className="space-y-3.5 text-xs">
                        <div>
                          <span className="block text-[10px] uppercase font-mono text-purple-400">Selected Candidate</span>
                          <span className="font-bold text-white text-sm">{selectedApp.fullName}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#160b26]/60 p-2.5 rounded-lg border border-purple-500/10">
                          <div>
                            <span className="block text-[9px] text-purple-500 font-mono">ID CODE</span>
                            <span className="text-purple-300 font-bold">{selectedApp.id}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-purple-500 font-mono">WHATSAPP</span>
                            <span className="text-purple-300 font-bold">{selectedApp.whatsapp}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[9px] text-purple-500 font-mono uppercase">Key Experience summary:</span>
                          <p className="text-purple-300 bg-purple-950/25 p-2 rounded border border-purple-500/5 leading-relaxed italic text-[11px]">
                            {selectedApp.answers.experience || 'No previous experience declared.'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[9px] text-purple-500 font-mono uppercase">Role Alignment alignment motivation:</span>
                          <p className="text-purple-300 bg-purple-950/25 p-2 rounded border border-purple-500/5 leading-relaxed italic text-[11px]">
                            {selectedApp.answers.motivation || 'No motivation declared.'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[9px] text-purple-500 font-mono uppercase font-bold text-fuchsia-400">VP Combat Assessment Metrics:</span>
                          {selectedApp.gamingAssessment ? (
                            <div className="bg-fuchsia-950/20 border border-fuchsia-500/20 p-2.5 rounded-lg text-[11px] space-y-1">
                              <span className="block font-bold text-fuchsia-300">Strategic Verdict: {selectedApp.gamingAssessment.strategicVerdict}</span>
                              <span className="text-purple-300 block">Simulation Weighted Target: {selectedApp.gamingAssessment.correctAnswers}/30</span>
                              <div className="mt-1 space-y-1">
                                {selectedApp.gamingAssessment.strategicDecisions.map((dec, i) => (
                                  <div key={i} className="text-[10px] text-purple-405/80 font-mono flex justify-between">
                                    <span>Node {i + 1}:</span>
                                    <span>{dec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-purple-500 text-[10px]">Candidate does not hold assessment telemetry (Only required for Vice President applicants).</p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-purple-500/10 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(selectedApp)}
                            className="flex-1 py-1.5 bg-purple-650 hover:bg-purple-500 text-white font-bold rounded-lg uppercase text-[10px] tracking-wider"
                          >
                            Modify Record
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedApp(null)}
                            className="px-3 py-1.5 bg-[#160b26] hover:bg-purple-950 text-purple-400 rounded-lg text-[10px]"
                          >
                            Unselect
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-purple-500 text-xs">
                        Select any candidate line in the registration directory index to verify full responses, contact info, and strategic gaming scoring metrics instantly.
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Accounts Database directory */}
              <div className="lg:col-span-8 space-y-3 bg-[#12091f]/90 border border-purple-500/10 rounded-xl p-4">
                
                {/* Search account bar */}
                <div className="relative">
                  <span className="absolute left-3 inset-y-0 flex items-center text-fuchsia-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search accounts by full name, email, portal handle, or checksum..."
                    value={accountsSearchQuery}
                    onChange={(e) => setAccountsSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#160b26]/60 border border-purple-500/20 rounded-lg text-xs text-white placeholder-purple-800"
                  />
                </div>

                {/* Account data registry table */}
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-purple-500/10 text-fuchsia-400 font-mono uppercase tracking-wider">
                        <th className="py-2 px-1">Registered Student</th>
                        <th className="py-2">Portal Handle</th>
                        <th className="py-2">Gender Option</th>
                        <th className="py-2">Lobby Checksum</th>
                        <th className="py-2 text-center">Session State</th>
                        <th className="py-2 text-right">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/5">
                      {registeredUsers
                        .filter((u) => {
                          const term = accountsSearchQuery.toLowerCase();
                          return (
                            (u.fullName || '').toLowerCase().includes(term) ||
                            (u.email || '').toLowerCase().includes(term) ||
                            (u.username || '').toLowerCase().includes(term) ||
                            (u.checksum || '').toLowerCase().includes(term)
                          );
                        })
                        .map((u) => {
                          const isOnline = activeSessions.includes(u.email);
                          return (
                            <tr key={u.email} className="hover:bg-purple-950/25 transition-colors">
                              <td className="py-3 px-1">
                                <span className="block font-bold text-white text-xs">{u.fullName}</span>
                                <span className="text-[10px] text-purple-400 font-mono">{u.email}</span>
                              </td>
                              <td className="py-3 text-fuchsia-300 font-semibold">
                                @{u.username}
                              </td>
                              <td className="py-3">
                                <span className="text-purple-300 uppercase text-[10px] font-mono">{u.gender}</span>
                              </td>
                              <td className="py-3 font-mono text-xs text-yellow-400">
                                {u.checksum}
                              </td>
                              <td className="py-3 text-center">
                                <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                                  isOnline
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-900/40'
                                    : 'bg-zinc-950/70 text-zinc-400 border border-zinc-500/10'
                                }`}>
                                  {isOnline ? 'Active Online' : 'Offline'}
                                </span>
                              </td>
                              <td className="py-3 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedAccount(u)}
                                  className="px-2 py-1.5 rounded bg-[#160b26] border border-purple-500/20 text-purple-300 hover:border-purple-400 cursor-pointer text-[10px] font-mono"
                                  title="Inspect Account Credentials"
                                >
                                  Inspect Dossier
                                </button>
                                {isOnline && (
                                  <button
                                    type="button"
                                    onClick={() => handleClearSession(u.email)}
                                    className="p-1 rounded bg-yellow-950/40 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-650 hover:text-white transition-all cursor-pointer"
                                    title="Revoke active log-in lock"
                                  >
                                    <LogOut className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.email)}
                                  className="p-1 rounded bg-red-950/20 text-red-400 hover:bg-red-800 hover:text-white transition-colors cursor-pointer"
                                  title="Delete credentials register"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {registeredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-purple-500">
                            No student registration records found in the portal state database ledger.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar: Detail analysis */}
              <div className="lg:col-span-4 bg-[#12091f]/95 border border-purple-500/10 rounded-xl p-4 space-y-4">
                <div className="border-b border-purple-500/10 pb-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-fuchsia-400 block">SECURITY KEY VALIDATOR</span>
                  <h4 className="text-sm font-bold text-white">Cryptographic Passport</h4>
                </div>

                {selectedAccount ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase font-mono text-purple-400">Inspected User Account</span>
                      <span className="font-bold text-white text-base">{selectedAccount.fullName}</span>
                      <span className="block text-fuchsia-300">@{selectedAccount.username}</span>
                    </div>

                    <div className="bg-[#160b26]/80 p-3 rounded-lg border border-purple-500/10 space-y-2.5">
                      <div>
                        <span className="block text-[9px] text-purple-500 font-mono uppercase">E-Mail Address</span>
                        <span className="text-purple-200 font-bold break-all">{selectedAccount.email}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-purple-500 font-mono uppercase">Active Passport Checksum Key</span>
                        <span className="text-yellow-400 font-mono font-bold select-all tracking-wider">{selectedAccount.checksum}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-purple-500 font-mono uppercase flex items-center gap-1">Gender Node Placement</span>
                        <span className="text-purple-350 font-mono font-bold uppercase">{selectedAccount.gender}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-purple-500 font-mono uppercase">Session State Monitor</span>
                        <span className={`text-[10px] font-bold block ${
                          activeSessions.includes(selectedAccount.email)
                            ? 'text-emerald-405'
                            : 'text-zinc-400'
                        }`}>
                          {activeSessions.includes(selectedAccount.email)
                            ? '● Dynamically Checked-in with active Session'
                            : '○ Inter-session sleep state / Disconnected'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-950/20 border border-purple-500/10 rounded-lg space-y-1">
                      <span className="block text-[9px] uppercase font-mono text-purple-400">Cryptographic Lock Status</span>
                      <p className="text-[11px] text-purple-200 leading-relaxed font-sans mt-0.5">
                         Cryptographic authentication keys are generated at sign-up via local high-entropy hashes. The portal verifies the checksum dynamically on submission of login requests.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-purple-500/10 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedAccount.checksum);
                          alert("Checksum token copied to dynamic memory clipboard!");
                        }}
                        className="flex-1 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                      >
                        Copy Checksum Key
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedAccount(null)}
                        className="px-3 py-1.5 bg-[#160b26] hover:bg-purple-950 text-purple-400 rounded-lg text-[10px] transition-colors cursor-pointer"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-purple-500 text-xs leading-relaxed">
                    Select a student sign-in record line from the dynamic registration index on the left to inspect, diagnostic verify, and copy passport access credentials immediately.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Skeuomorphic Overlay Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#12091f] border-2 border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
            
            <div className="flex items-start gap-4 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-1.5 flex-1 text-left">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-purple-500/10">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-[#160b26]/50 hover:bg-[#160b26] border border-purple-500/15 text-xs text-purple-400 font-bold rounded-xl transition-all hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 bg-red-650 hover:bg-red-600 text-white border border-red-500/30 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
