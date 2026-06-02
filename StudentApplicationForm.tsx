import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  Crown, 
  Palette, 
  HelpCircle, 
  ArrowLeft,
  Info,
  Maximize2
} from 'lucide-react';

interface SecurityPortalProps {
  activePortalTab: 'login' | 'signup';
  setActivePortalTab: (tab: 'login' | 'signup') => void;
  setActiveTab: (tab: string) => void;
  portalUser: any;
  setPortalUser: (user: any) => void;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginChecksum: string;
  setLoginChecksum: (val: string) => void;
  regFullName: string;
  setRegFullName: (val: string) => void;
  regEmail: string;
  setRegEmail: (val: string) => void;
  regUsername: string;
  setRegUsername: (val: string) => void;
  regGender: string;
  setRegGender: (val: string) => void;
  generatedChecksum: string | null;
  setGeneratedChecksum: (val: string | null) => void;
  calculateChecksumValue: (email: string, username: string) => string;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type UIThemeColor = 'purple' | 'pink' | 'turquoise' | 'dark' | 'amber';

export default function SecurityPortal({
  activePortalTab,
  setActivePortalTab,
  setActiveTab,
  portalUser,
  setPortalUser,
  loginEmail,
  setLoginEmail,
  loginChecksum,
  setLoginChecksum,
  regFullName,
  setRegFullName,
  regEmail,
  setRegEmail,
  regUsername,
  setRegUsername,
  regGender,
  setRegGender,
  generatedChecksum,
  setGeneratedChecksum,
  calculateChecksumValue,
  addToast
}: SecurityPortalProps) {
  
  // Custom clay color themes
  const [theme, setTheme] = useState<UIThemeColor>('purple');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Custom claymorphism parameter controllers
  const [depth, setDepth] = useState<number>(3); // level of 3D depth shadow (1-5)
  const [lightDirection, setLightDirection] = useState<'top-left' | 'top-right'>('top-left');

  // Multi-theme values matching actual screenshot styles
  const themesDef = {
    purple: {
      cardBg: 'bg-[#8c52ff]',
      cardBorder: 'border-[#a175ff]',
      inputBg: 'bg-[#733ee0]',
      hoverBtnBg: 'hover:bg-[#a175ff]',
      shadowColor: 'rgba(115, 62, 224, 0.5)',
      buttonBg: 'bg-[#9f6eff]',
      buttonHighlight: 'border-[#bca5ff]',
      buttonShadow: 'shadow-[0_8px_0_#5a2db3,_0_15px_24px_rgba(0,0,0,0.3)]',
      pressedShadow: 'shadow-[0_2px_0_#5a2db3,_0_4px_8px_rgba(0,0,0,0.4)]',
      textAccent: 'text-[#d6c2ff]',
      accentBg: 'bg-[#5f2ebd]',
    },
    pink: {
      cardBg: 'bg-[#ec4899]',
      cardBorder: 'border-[#f271b3]',
      inputBg: 'bg-[#d02476]',
      hoverBtnBg: 'hover:bg-[#f271b3]',
      shadowColor: 'rgba(236, 72, 153, 0.5)',
      buttonBg: 'bg-[#f472b6]',
      buttonHighlight: 'border-[#f9a8d4]',
      buttonShadow: 'shadow-[0_8px_0_#9d174d,_0_15px_24px_rgba(0,0,0,0.3)]',
      pressedShadow: 'shadow-[0_2px_0_#9d174d,_0_4px_8px_rgba(0,0,0,0.4)]',
      textAccent: 'text-[#fbcfe8]',
      accentBg: 'bg-[#9d174d]',
    },
    turquoise: {
      cardBg: 'bg-[#0ea5e9]',
      cardBorder: 'border-[#38bdf8]',
      inputBg: 'bg-[#0369a1]',
      hoverBtnBg: 'hover:bg-[#38bdf8]',
      shadowColor: 'rgba(14, 165, 233, 0.5)',
      buttonBg: 'bg-[#38bdf8]',
      buttonHighlight: 'border-[#7dd3fc]',
      buttonShadow: 'shadow-[0_8px_0_#075985,_0_15px_24px_rgba(0,0,0,0.3)]',
      pressedShadow: 'shadow-[0_2px_0_#075985,_0_4px_8px_rgba(0,0,0,0.4)]',
      textAccent: 'text-[#bae6fd]',
      accentBg: 'bg-[#075985]',
    },
    dark: {
      cardBg: 'bg-[#4b5563]',
      cardBorder: 'border-[#6b7280]',
      inputBg: 'bg-[#1f2937]',
      hoverBtnBg: 'hover:bg-[#6b7280]',
      shadowColor: 'rgba(75, 85, 99, 0.5)',
      buttonBg: 'bg-[#6b7280]',
      buttonHighlight: 'border-[#9ca3af]',
      buttonShadow: 'shadow-[0_8px_0_#111827,_0_15px_24px_rgba(0,0,0,0.3)]',
      pressedShadow: 'shadow-[0_2px_0_#111827,_0_4px_8px_rgba(0,0,0,0.4)]',
      textAccent: 'text-[#e5e7eb]',
      accentBg: 'bg-[#111827]',
    },
    amber: {
      cardBg: 'bg-[#f59e0b]',
      cardBorder: 'border-[#fbbf24]',
      inputBg: 'bg-[#b45309]',
      hoverBtnBg: 'hover:bg-[#fbbf24]',
      shadowColor: 'rgba(245, 158, 11, 0.5)',
      buttonBg: 'bg-[#fbbf24]',
      buttonHighlight: 'border-[#fcd34d]',
      buttonShadow: 'shadow-[0_8px_0_#78350f,_0_15px_24px_rgba(0,0,0,0.3)]',
      pressedShadow: 'shadow-[0_2px_0_#78350f,_0_4px_8px_rgba(0,0,0,0.4)]',
      textAccent: 'text-[#fef3c7]',
      accentBg: 'bg-[#78350f]',
    }
  };

  const currentTheme = themesDef[theme];

  // Simulated button press state
  const [isBtnPressed, setIsBtnPressed] = useState(false);

  // Dynamic shadows depending on customized sliders
  const getClayStyle = () => {
    // Generate inner highlight & shadow according to light orientation
    const highlight = lightDirection === 'top-left' 
      ? `inset 4px 4px 8px rgba(255,255,255,${0.2 + depth * 0.05})`
      : `inset -4px 4px 8px rgba(255,255,255,${0.2 + depth * 0.05})`;
    
    const innerShadow = `inset -4px -6px ${4 + depth * 2}px rgba(0,0,0,${0.25 + depth * 0.04})`;
    const dropShadow = `0 ${8 + depth * 4}px ${16 + depth * 8}px rgba(0,0,0,0.5), 0 24px 48px ${currentTheme.shadowColor}`;
    
    return {
      boxShadow: `${highlight}, ${innerShadow}, ${dropShadow}`
    };
  };

  const handleSignIn = () => {
    if (!loginEmail || !loginChecksum) {
      addToast("Please enter both your email address and checksum key to proceed.", "error");
      return;
    }
    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanChecksum = loginChecksum.trim();

    const savedUsers = localStorage.getItem('looplab_custom_users') || '{}';
    const users = JSON.parse(savedUsers);

    if (!users[cleanEmail]) {
      addToast("No active user configuration found for this email.", "error");
      return;
    }

    if (users[cleanEmail].checksum !== cleanChecksum) {
      addToast("Checksum verification mismatch. Portal access declined.", "error");
      return;
    }

    const matchedUser = users[cleanEmail];
    setPortalUser(matchedUser);
    localStorage.setItem('looplab_custom_session', JSON.stringify(matchedUser));

    const activeSessions = JSON.parse(localStorage.getItem('looplab_active_sessions') || '[]');
    if (!activeSessions.includes(cleanEmail)) {
      activeSessions.push(cleanEmail);
      localStorage.setItem('looplab_active_sessions', JSON.stringify(activeSessions));
    }

    addToast(`Authenticated! Welcome back, ${matchedUser.fullName}.`, "success");
    setActiveTab('home');
  };

  const handleSignUp = () => {
    if (!regFullName || !regEmail || !regUsername) {
      addToast("Please fill in all requested fields to calculate your secure checksum.", "error");
      return;
    }
    const cleanEmail = regEmail.trim().toLowerCase();
    
    const savedUsers = localStorage.getItem('looplab_custom_users') || '{}';
    const users = JSON.parse(savedUsers);
    if (users[cleanEmail]) {
      addToast("This email is already registered. Please go to Sign-In.", "info");
      return;
    }

    const checksum = calculateChecksumValue(cleanEmail, regUsername);
    users[cleanEmail] = {
      fullName: regFullName,
      email: cleanEmail,
      username: regUsername,
      gender: regGender,
      checksum,
      profilePic: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${regUsername}`
    };
    
    localStorage.setItem('looplab_custom_users', JSON.stringify(users));
    setGeneratedChecksum(checksum);
    addToast("Access passport checksum computed successfully!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Return Button */}
      <div className="flex justify-between items-center px-2">
        <button
          onClick={() => setActiveTab('home')}
          className="text-xs text-purple-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/10 px-4 py-2.5 rounded-xl shadow-md font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home Hub</span>
        </button>

        {/* Live dynamic quick info */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-purple-400 bg-purple-950/30 border border-purple-500/5 px-3 py-1.5 rounded-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
          <span>STEREOSCOPIC CLAYMORPHISM ENGAGED</span>
        </div>
      </div>

      {/* Editor Mockup Wrapper Container (Matching the uploaded image beautifully) */}
      <div className="w-full rounded-3xl bg-[#090514] border border-purple-500/15 overflow-hidden shadow-2xl relative p-3 sm:p-6 md:p-8">
        
        {/* Editor Top Navigation Bar mimicking Magnific Web App Interface */}
        <div className="border-b border-purple-500/10 pb-4 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-md">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-wide">Magnific Studio UI</span>
                <span className="text-[9px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/25 px-1.5 py-0.5 rounded uppercase">PRESET v3.0</span>
              </div>
              <p className="text-[10px] text-purple-400 font-mono">File: modern_web_login_3d_claymorphic.psd</p>
            </div>
          </div>

          {/* Controller selectors for theme, depth & light - Adding rich engineering detail */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Color Changer preset bubbles representing "3D Color Changeable Icon" feature */}
            <div className="flex items-center gap-1.5 bg-[#140b26]/90 border border-purple-500/15 px-3 py-1.5 rounded-xl text-[10px] font-sans">
              <span className="text-purple-300 font-bold flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>3D Color Preset:</span>
              </span>
              <div className="flex gap-1 ml-1.5">
                {(['purple', 'pink', 'turquoise', 'dark', 'amber'] as UIThemeColor[]).map((col) => (
                  <button
                    key={col}
                    title={`Switch components to ${col}`}
                    onClick={() => {
                      setTheme(col);
                      addToast(`Visual theme shifted to ${col.toUpperCase()}`);
                    }}
                    className={`w-4 h-4 rounded-full border cursor-pointer transition-transform hover:scale-125 ${
                      col === 'purple' ? 'bg-[#8c52ff]' :
                      col === 'pink' ? 'bg-[#ec4899]' :
                      col === 'turquoise' ? 'bg-[#0ea5e9]' :
                      col === 'dark' ? 'bg-[#4b5563]' : 'bg-[#f59e0b]'
                    } ${theme === col ? 'border-white ring-2 ring-purple-600 scale-110' : 'border-black/50 hover:border-white'}`}
                  />
                ))}
              </div>
            </div>

            {/* Clay depth factor controller slider */}
            <div className="flex items-center gap-2 bg-[#140b26]/90 border border-purple-500/15 px-3 py-1.5 rounded-xl text-[10px]">
              <span className="text-purple-300 font-medium">3D Depth:</span>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={depth} 
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-16 accent-purple-500 h-1 cursor-ew-resize rounded"
              />
              <span className="text-white font-mono font-bold w-3">{depth}x</span>
            </div>

            {/* Simulation Light Source toggler */}
            <button
              onClick={() => {
                setLightDirection(prev => prev === 'top-left' ? 'top-right' : 'top-left');
                addToast("Dynamic illumination shifted.");
              }}
              className="px-2.5 py-1.5 bg-[#140b26] hover:bg-purple-900/30 border border-purple-500/15 rounded-xl text-[10px] font-sans text-purple-300 hover:text-white transition-all cursor-pointer"
            >
              Light: {lightDirection === 'top-left' ? '↖ TOP LEFT' : '↗ TOP RIGHT'}
            </button>
            
          </div>
        </div>

        {/* Outer Designer's Grid Mockup Canvas Sandbox */}
        <div className="w-full py-12 px-4 sm:px-6 md:py-16 bg-[#16102b] rounded-24 relative overflow-hidden flex items-center justify-center border border-purple-500/10"
             style={{ 
               backgroundImage: 'radial-gradient(rgba(139, 92, 246, 0.15) 1.5px, transparent 1.5px), linear-gradient(135deg, #110c22 0%, #17112e 100%)', 
               backgroundSize: '24px 24px, 100% 100%' 
             }}>
          
          {/* Holographic glowing rings floating behind card */}
          <div className="absolute w-72 h-72 bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl rounded-full top-1/4 left-1/4 pointer-events-none"></div>
          <div className="absolute w-60 h-60 bg-gradient-to-tr from-pink-500/10 to-transparent blur-3xl rounded-full bottom-1/4 right-1/4 pointer-events-none"></div>

          {/* Faithful Render: The 3D Claymorphic login page card */}
          <div className="w-full max-w-sm relative z-10 transition-all duration-500 transform hover:scale-[1.01]">
            
            {/* Ambient indicator decorations from screenshot */}
            <div className="absolute -top-7 -left-5 text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-purple-500/5 backdrop-blur-md select-none">
              <span>● LAYER: AUT_FRAME</span>
            </div>

            {/* MAIN CLAY CONTAINER */}
            <div 
              className={`w-full rounded-[2.5rem] p-8 md:p-9 border-4 ${currentTheme.cardBg} ${currentTheme.cardBorder} transition-all duration-300 font-sans`}
              style={getClayStyle()}
            >
              
              {/* Inner matrix details in card top left */}
              <div className="flex justify-between items-start mb-6 w-full">
                <div className="space-y-2">
                  {/* Yellow crown badge element */}
                  <div className="w-7 h-7 rounded-lg bg-black/25 flex items-center justify-center border border-white/10 shadow-sm">
                    <Crown className="w-4 h-4 text-amber-300" />
                  </div>
                  {/* Dot matrix element */}
                  <div className="grid grid-cols-2 gap-1 w-6 opacity-60">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <div key={idx} className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-white/50 block">MODERN DESIGN</span>
                  <span className="text-[11px] font-black text-white/90">LOOPTECH CORE</span>
                </div>
              </div>

              {/* Header Title corresponding beautifully to standard PSD format in uploaded photo */}
              <div className="text-center mb-8 space-y-1">
                <h2 className="text-2xl font-black text-white tracking-wider font-display uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                  {portalUser ? 'Active Session' : activePortalTab === 'login' ? 'User Login' : 'User Register'}
                </h2>
                <p className={`text-[11px] font-semibold tracking-wide ${currentTheme.textAccent}`}>
                  {portalUser 
                    ? 'ACCESS PERSISTED SUCCESSFULLY' 
                    : activePortalTab === 'login' 
                      ? 'Secure Cryptographic Core Verification' 
                      : 'Create secure developer checkpoint'}
                </p>
              </div>

              {/* Render dynamic Login vs Signup vs Active Session forms */}
              {portalUser ? (
                /* ALREADY THE USER IS SECURED AND REDIRECTED */
                <div className="space-y-6 animate-fadeIn">
                  <div className={`p-5 rounded-3xl ${currentTheme.inputBg} border border-white/10 text-center space-y-4 shadow-[inset_0_3px_6px_rgba(0,0,0,0.3)]`}>
                    <CheckCircle className="w-12 h-12 text-green-300 mx-auto drop-shadow-md animate-bounce" />
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] uppercase font-mono tracking-widest text-[#52b788] bg-black/30 border border-green-500/20 px-2.5 py-1 rounded-full">
                        PASSPORT VERIFIED
                      </span>
                      <h4 className="text-lg font-extrabold text-white mt-2">{portalUser.fullName}</h4>
                      <p className="text-[11px] text-white/60 font-mono">{portalUser.email}</p>
                    </div>

                    <div className="bg-black/25 p-3 rounded-2xl border border-white/5 space-y-1 shadow-inner">
                      <span className="block text-[8px] uppercase tracking-wider text-white/40 font-mono">My Secure Passcode</span>
                      <span className="block text-xs font-mono font-black text-amber-200 select-all tracking-wider">
                        {portalUser.checksum}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const activeSessions = JSON.parse(localStorage.getItem('looplab_active_sessions') || '[]');
                      const updated = activeSessions.filter((e: string) => e !== portalUser.email);
                      localStorage.setItem('looplab_active_sessions', JSON.stringify(updated));

                      setPortalUser(null);
                      localStorage.removeItem('looplab_custom_session');
                      addToast("Signed out of Portal Account.", "info");
                    }}
                    className="w-full py-4 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all duration-150 cursor-pointer bg-red-600 border-2 border-red-400 hover:bg-red-500 shadow-[0_6px_0_#991b1b,_0_12px_20px_rgba(0,0,0,0.35)] active:translate-y-1 active:shadow-[0_2px_0_#991b1b]"
                  >
                    Disconnect Session
                  </button>
                </div>
              ) : activePortalTab === 'login' ? (
                /* 3D CLAYMOPHIC LOGIN SCREEN (MATTER IMAGE FAITHFUL) */
                <div className="space-y-6">
                  
                  {/* Username Form Row with Inside Shadow & Icons on right side */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-white/80 select-none">
                      Username / Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Username"
                        className={`w-full py-4 pl-5 pr-12 rounded-full text-xs font-medium text-white placeholder-white/40 focus:outline-none transition-all duration-200 border border-white/10 ${currentTheme.inputBg} shadow-[inset_0_3px_6px_rgba(0,0,0,0.30)] focus:ring-2 focus:ring-white/20`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-75">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Password Form Row with Inside Shadow & Lock Icon on right side */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-white/80 select-none">
                      Password / Checksum
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={loginChecksum}
                        onChange={(e) => setLoginChecksum(e.target.value)}
                        placeholder="Password"
                        className={`w-full py-4 pl-5 pr-12 rounded-full text-xs font-mono font-medium text-white placeholder-white/40 focus:outline-none transition-all duration-200 border border-white/10 ${currentTheme.inputBg} shadow-[inset_0_3px_6px_rgba(0,0,0,0.30)] focus:ring-2 focus:ring-white/20`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-75">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Remember me and Forgot Password row */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-white/90 select-none px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="rounded accent-purple-600 cursor-pointer w-4 h-4"
                      />
                      <span className="hover:text-white transition-colors">Remember me</span>
                    </label>
                    <button 
                      type="button"
                      onClick={() => addToast("Forgot Checksum? Please review pre-seeded credentials at the form foot! Or register a fresh coordinate.", "info")}
                      className="hover:underline hover:text-white transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* 3D Skeuomorphic/Clay Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onMouseDown={() => setIsBtnPressed(true)}
                      onMouseUp={() => setIsBtnPressed(false)}
                      onMouseLeave={() => setIsBtnPressed(false)}
                      onClick={handleSignIn}
                      className={`w-full py-4 text-xs font-black uppercase tracking-widest text-[#2f1066] ${currentTheme.buttonBg} border-2 ${currentTheme.buttonHighlight} rounded-full transition-all duration-100 cursor-pointer outline-none ${
                        isBtnPressed 
                          ? currentTheme.pressedShadow + ' translate-y-1' 
                          : currentTheme.buttonShadow + ' hover:-translate-y-0.5'
                      }`}
                    >
                      LOGIN
                    </button>
                  </div>

                  {/* Tab switches */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActivePortalTab('signup')}
                      className={`text-xs font-bold ${currentTheme.textAccent} hover:text-white transition-colors cursor-pointer text-center underline decoration-dotted`}
                    >
                      Need a Checksum account? Get registered here &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                /* SIGN-UP FORM REPLICATED WITH EXQUISITE CLAY VISUALS */
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-white/80">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className={`w-full py-3 px-4 rounded-full text-xs font-medium text-white placeholder-white/30 focus:outline-none border border-white/5 ${currentTheme.inputBg} shadow-[inset_0_2.5px_5px_rgba(0,0,0,0.3)]`}
                    />
                  </div>

                  {/* Email & Username */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-white/80">
                      Your Email Coordinates
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. elena@looplab.community"
                      className={`w-full py-3 px-4 rounded-full text-xs font-medium text-white placeholder-white/30 focus:outline-none border border-white/5 ${currentTheme.inputBg} shadow-[inset_0_2.5px_5px_rgba(0,0,0,0.3)]`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase tracking-wider font-extrabold text-white/80">
                        Username
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="elena_r"
                        className={`w-full py-3 px-4 rounded-full text-xs font-medium text-white placeholder-white/30 focus:outline-none border border-white/5 ${currentTheme.inputBg} shadow-[inset_0_2.5px_5px_rgba(0,0,0,0.3)]`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase tracking-wider font-extrabold text-white/80">
                        Gender
                      </label>
                      <select
                        value={regGender}
                        onChange={(e: any) => setRegGender(e.target.value)}
                        className={`w-full py-3 px-3.5 rounded-full text-xs font-medium text-white focus:outline-none border border-white/5 ${currentTheme.inputBg} shadow-[inset_0_2.5px_5px_rgba(0,0,0,0.3)]`}
                      >
                        <option value="female" className="text-black">Woman/Girl</option>
                        <option value="male" className="text-black">Man/Boy</option>
                        <option value="other" className="text-black">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Unique generated checksum block */}
                  {generatedChecksum ? (
                    <div className={`p-4 rounded-2xl ${currentTheme.accentBg} border border-white/10 space-y-3.5 text-center animate-fadeIn shadow-inner`}>
                      <span className="text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-black/40 text-amber-300 border border-amber-500/10">
                        CHECKSUM PERSISTED
                      </span>
                      <p className="text-[10px] text-white/90 leading-relaxed">
                        Copy your security passport code key below to authenticate inside the Login gate:
                      </p>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/10 font-mono font-black text-xs text-yellow-300 select-all tracking-wider">
                        {generatedChecksum}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(regEmail);
                          setLoginChecksum(generatedChecksum);
                          setActivePortalTab('login');
                          setGeneratedChecksum(null);
                          addToast("Verification code populated into Login Form.");
                        }}
                        className={`w-full py-3 bg-[#ffffff] hover:bg-[#eaeaea] text-[#2f1066] font-bold text-[10px] uppercase rounded-full shadow-md cursor-pointer`}
                      >
                        Auto-fill Credentials
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        type="button"
                        onMouseDown={() => setIsBtnPressed(true)}
                        onMouseUp={() => setIsBtnPressed(false)}
                        onMouseLeave={() => setIsBtnPressed(false)}
                        onClick={handleSignUp}
                        className={`w-full py-4 text-xs font-black uppercase tracking-widest text-[#2f1066] ${currentTheme.buttonBg} border-2 ${currentTheme.buttonHighlight} rounded-full transition-all duration-100 cursor-pointer outline-none ${
                          isBtnPressed 
                            ? currentTheme.pressedShadow + ' translate-y-1' 
                            : currentTheme.buttonShadow + ' hover:-translate-y-0.5'
                        }`}
                      >
                        COMPILE PASSPORT
                      </button>
                    </div>
                  )}

                  {/* Return to Sign in */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePortalTab('login');
                        setGeneratedChecksum(null);
                      }}
                      className={`text-xs font-bold ${currentTheme.textAccent} hover:text-white transition-colors cursor-pointer text-center underline decoration-dotted`}
                    >
                      Have an account? Access Sign-In here &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Secure footer block */}
              <div className="flex items-center justify-center gap-2 mt-6 select-none opacity-80">
                <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-ping"></div>
                <span className="text-[9px] font-mono tracking-widest text-white/70 uppercase">CSUM v2.5 VERIFIED</span>
              </div>

            </div>
          </div>
        </div>

        {/* Quick info notes / Developer instructions below mock view */}
        <div className="mt-8 border-t border-purple-500/10 pt-6 flex flex-col sm:flex-row gap-6 items-start justify-between">
          <div className="space-y-1.5 max-w-md">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Info className="w-4 h-4 text-purple-400" />
              <span>Interactive Skeuomorphic Simulation Instructions</span>
            </h4>
            <p className="text-[11px] text-purple-355 leading-relaxed font-sans">
              We have synthesized a total 3D color changeable mock design layout to conform matching the design specification. Select colors above to instantly hot-swap PSD levels! Set depth sliders or light angles to fine-tune the plastic clay highlights.
            </p>
          </div>

          <div className="w-full sm:w-auto shrink-0 bg-[#120822] rounded-2xl p-4 border border-purple-550/15 max-w-sm">
            <span className="block text-[8px] font-mono tracking-widest text-indigo-400 uppercase font-black mb-1">Passcode Register Seed</span>
            <p className="text-[10px] text-purple-300 leading-relaxed mb-3">
              Use these pre-configured verification codes to enter active developer departments immediately:
            </p>
            <div className="font-mono text-[10px] space-y-1 select-all bg-black/50 p-2.5 rounded-xl border border-purple-500/10">
              <div className="flex justify-between">
                <span className="text-purple-420">Email:</span>
                <span className="text-white font-bold">student.lead@looplab.community</span>
              </div>
              <div className="flex justify-between border-t border-purple-500/5 pt-1">
                <span className="text-purple-420">Passport:</span>
                <span className="text-amber-300 font-bold">CSUM-4012</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
