import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Heart, Sparkles, Award, PlayCircle, ShieldAlert,
  HelpCircle, CreditCard, CheckCircle2, Gamepad2, Users, Compass, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { LISTED_POSITIONS, StudentApplication, GamingAssessmentScore } from '../types';
import GamingAssessment from './GamingAssessment';

interface StudentApplicationFormProps {
  onSubmitSuccess: (application: StudentApplication) => void;
  onClose: () => void;
  initialSection?: 'LoopLab' | 'LoopTech For Women';
  initialPosition?: string;
}

export default function StudentApplicationForm({ 
  onSubmitSuccess, 
  onClose,
  initialSection = 'LoopLab',
  initialPosition = ''
}: StudentApplicationFormProps) {
  // Step model: 1 = Candidate Info, 2 = Core Position & Motivation, 3 = Assessment / Summary Review, 4 = Finalized
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Basic attributes
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(initialSection === 'LoopTech For Women' ? 'female' : 'male');
  const [isExistingLoopLab, setIsExistingLoopLab] = useState(false);
  
  // Placement selection
  const [section, setSection] = useState<'LoopLab' | 'LoopTech For Women'>(initialSection);
  const [positions, setPositions] = useState<string[]>(initialSection === 'LoopTech For Women' ? ['LoopTech Member'] : (initialPosition ? [initialPosition] : []));
  
  // Questionnaire
  const [experience, setExperience] = useState('');
  const [motivation, setMotivation] = useState('');
  const [skills, setSkills] = useState('');
  
  // Play test
  const [vpAssessment, setVpAssessment] = useState<GamingAssessmentScore | null>(null);
  const [isTakingVpTest, setIsTakingVpTest] = useState(false);

  // Society Registration Fee status
  const [feeStatus] = useState<'pending_payment'>('pending_payment');
  const [feeAmountPaid, setFeeAmountPaid] = useState<number>(500);

  // Field validation for Step 1
  const validateStep1 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pakPhoneRegex = /^(\+92|0)3\d{9}$/;
    if (!fullName || !email || !whatsapp) {
      alert('Kindly fill in all baseline contact inputs to proceed.');
      return false;
    }
    if (!emailRegex.test(email)) { alert('Please enter a valid email address.'); return false; }
    const cleanedPhone = whatsapp.replace(/[-\s]/g,'');
    if (!pakPhoneRegex.test(cleanedPhone)) { alert('Please enter a valid Pakistan mobile number (03XXXXXXXXX or +923XXXXXXXXX).'); return false; }
    // LoopTech check: Only women/girls can access LoopTech section or switch gender safely
    if (section === 'LoopTech For Women' && gender !== 'female') {
      alert('🔒 Access Denied: LoopTech For Women is a dedicated division exclusively designed as an empowered tech-space for Women/Girls. To register for LoopTech positions, candidate profile must correspond to woman-identifying focus.');
      return false;
    }
    return true;
  };

  // Field validation for Step 2
  const validateStep2 = () => {
    if (positions.length === 0) {
      alert('Kindly select a core position path.');
      return false;
    }
    if (!experience || !motivation || !skills) {
      alert('Kindly provide response inputs to help evaluate strategic alignment.');
      return false;
    }
    return true;
  };

  const handleNextToStep3 = () => {
    if (!validateStep2()) return;
    setStep(3);
  };

  const handleSubmission = () => {
    // Check if VP has assessment
    if (positions.includes('Vice President') && !vpAssessment) {
      alert('Vice President position requires completion of the tactical assessment simulation timer.');
      return;
    }

    // Construct registration structure
    const newApp: StudentApplication = {
      id: 'APP-' + Math.floor(100000 + Math.random() * 900000),
      fullName,
      email,
      whatsapp,
      gender,
      isExistingLoopLabMember: isExistingLoopLab,
      section,
      position: positions.join(', '),
      feeStatus,
      feeAmountPaid,
      answers: {
        experience,
        motivation,
        skills
      },
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    if (vpAssessment) {
      newApp.gamingAssessment = vpAssessment;
    }

    onSubmitSuccess(newApp);
    setStep(4);
  };

  // Switch sections smoothly and manage default values
  const selectSection = (sec: 'LoopLab' | 'LoopTech For Women') => {
    setSection(sec);
    if (sec === 'LoopTech For Women') {
      setPositions(['LoopTech Member']);
      setGender('female');
    } else {
      setPositions([]);
    }
  };

  return (
    <div className="w-full text-purple-100 space-y-4">
      
      {/* Step Progress indicators */}
      <div className="flex items-center justify-between px-2 py-1 bg-purple-950/20 border border-purple-500/10 rounded-xl mb-4">
        <span className={`text-[10px] font-mono tracking-wider uppercase transition-colors ${step === 1 ? 'text-fuchsia-400 font-bold' : 'text-purple-500'}`}>
          1. Registration Profile
        </span>
        <span className="text-purple-900">&rarr;</span>
        <span className={`text-[10px] font-mono tracking-wider uppercase transition-colors ${step === 2 ? 'text-fuchsia-400 font-bold' : 'text-purple-500'}`}>
          2. Placement & Skills
        </span>
        <span className="text-purple-900">&rarr;</span>
        <span className={`text-[10px] font-mono tracking-wider uppercase transition-colors ${step === 3 ? 'text-fuchsia-400 font-bold' : 'text-purple-500'}`}>
          3. Assessment
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Division choice */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-widest text-purple-400">
                Core Placement Society Division
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selectSection('LoopLab')}
                  className={`relative p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    section === 'LoopLab'
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_15px_rgba(157,78,221,0.2)]'
                      : 'bg-[#160b26]/50 border-purple-500/10 text-purple-300 hover:border-purple-500/25'
                  }`}
                >
                  <Users className="w-5 h-5 text-purple-400 mb-1" />
                  <div>
                    <span className="block font-bold text-xs">LoopLab General</span>
                    <span className="text-[10px] text-purple-400/80">Decentralized community clusters</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectSection('LoopTech For Women')}
                  className={`relative p-4 rounded-xl border text-left flex flex-col justify-between transition-all overflow-hidden cursor-pointer ${
                    section === 'LoopTech For Women'
                      ? 'bg-gradient-to-br from-pink-950/30 to-purple-950/40 border-pink-500 text-white shadow-[0_0_15px_rgba(244,143,177,0.25)]'
                      : 'bg-[#160b26]/50 border-purple-500/10 text-purple-300 hover:border-purple-500/25'
                  }`}
                >
                  {/* Botanical flower decoration for visual theme */}
                  <span className="absolute -right-2 -top-2 text-pink-500/10 text-3xl select-none font-serif">🌸</span>
                  <Heart className="w-5 h-5 text-pink-400 mb-1" />
                  <div>
                    <span className="block font-bold text-xs text-pink-300">LoopTech For Women</span>
                    <span className="text-[10px] text-pink-400/80">Female STEM-empowered tech portal</span>
                  </div>
                </button>
              </div>
            </div>

            {/* LoopTech warning block */}
            {section === 'LoopTech For Women' && (
              <div className="p-3.5 bg-pink-950/20 border border-pink-500/25 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-pink-300 font-bold">
                  <span>🌸</span>
                  <span className="uppercase tracking-wider">Empowered technology workspace style</span>
                </div>
                <p className="text-pink-400/85 text-[11px] leading-relaxed">
                  You are viewing the dedicated LoopTech platform. Designed around botanical themes, custom female avatars, and soft pink layouts, this represents standard membership-based access for girls to lead operational pipelines securely.
                </p>
              </div>
            )}

            {/* General input group */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-400 uppercase mb-1">
                    Candidate Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Maria Qasim"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-purple-950/20 border border-purple-500/20 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-400 uppercase mb-1">
                    Personal Email *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="maria@hotmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-purple-950/20 border border-purple-500/20 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-400 uppercase mb-1">
                    WhatsApp Address *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      placeholder="0312-3456789"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-purple-950/20 border border-purple-500/20 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-400 uppercase mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    disabled={section === 'LoopTech For Women'}
                    className="w-full px-3 py-2 bg-purple-950/30 border border-purple-500/20 rounded-lg text-xs text-white focus:outline-none"
                  >
                    {section === 'LoopTech For Women' ? (
                      <option value="female" className="bg-[#12091f]">Female (Required for LoopTech)</option>
                    ) : (
                      <>
                        <option value="male" className="bg-[#12091f]">Male</option>
                        <option value="female" className="bg-[#12091f]">Female</option>
                        <option value="other" className="bg-[#12091f]">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* LoopLab Member Status and benefits structure */}
              <div className="bg-purple-950/20 border border-purple-500/15 rounded-xl p-3.5 flex items-start gap-3 mt-1">
                <input
                  type="checkbox"
                  id="existing-check"
                  checked={isExistingLoopLab}
                  onChange={(e) => setIsExistingLoopLab(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-purple-500/20 bg-purple-950 text-purple-600 focus:ring-0 cursor-pointer"
                />
                <div className="text-xs space-y-1">
                  <label htmlFor="existing-check" className="font-bold text-[#d6c2ff] cursor-pointer">
                    Are you already a registered member of LoopLab?
                  </label>
                  <p className="text-[10px] text-purple-400 mt-1 leading-relaxed">
                    Checking this matches your candidacy against existing community records to coordinate onboarding directly with your department lead.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-purple-500/10">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-purple-500 hover:text-purple-300 font-mono"
              >
                Exit Form
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="px-5 py-2.5 bg-purple-650 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
              >
                <span>Define Placements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Position picker */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-2">
                Select Your Desired Role ({section})
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1.5">
                {section === 'LoopLab' ? (
                  <>
                    {/* Special VP position only for looplab section */}
                    <button
                      type="button"
                      onClick={() => setPositions(prev => prev.includes('Vice President') ? prev.filter(p=>p!=='Vice President') : [...prev,'Vice President'])}
                      className={`p-3 text-left border rounded-xl flex justify-between items-center transition-all ${
                        positions.includes('Vice President')
                          ? 'bg-fuchsia-950/40 border-fuchsia-500 text-white shadow-[0_0_12px_rgba(240,171,252,0.2)]'
                          : 'bg-[#160b26]/50 border-purple-500/10 text-purple-300 hover:border-purple-500/20'
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-xs text-fuchsia-300">Vice President</span>
                        <span className="text-[10px] text-fuchsia-400/80 font-mono">Executive Position (Gaming assessment quiz enabled)</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-fuchsia-950 border border-fuchsia-500/30 rounded text-fuchsia-300">VP Open</span>
                    </button>

                    {/* Rest of positions */}
                    {LISTED_POSITIONS.filter(pos => pos.id !== 'vp').map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPositions(prev => prev.includes(item.title) ? prev.filter(p=>p!==item.title) : [...prev,item.title])}
                        className={`p-3 text-left border rounded-xl flex justify-between items-center transition-all ${
                          positions.includes(item.title)
                            ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_12px_rgba(157,78,221,0.2)]'
                            : 'bg-[#160b26]/50 border-purple-500/10 text-purple-300 hover:border-purple-500/20'
                        }`}
                      >
                        <div>
                          <span className="block font-bold text-xs">{item.title}</span>
                          <span className="text-[10px] text-purple-400 font-mono">Core Position</span>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPositions(['LoopTech Member'])}
                    className="p-4 text-left border rounded-xl flex justify-between items-center col-span-2 transition-all bg-gradient-to-br from-pink-950/20 to-purple-950/20 border-pink-500 text-white shadow-[0_0_12px_rgba(244,143,177,0.2)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌸</span>
                      <div>
                        <span className="block font-bold text-xs text-pink-300">LoopTech General Member</span>
                        <span className="text-[10px] text-pink-400 font-mono">Exclusive STEM Community Membership</span>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-mono px-2.5 py-0.5 bg-pink-950 border border-pink-500/30 rounded text-pink-300 font-bold">FLAT TRACK</span>
                  </button>
                )}
              </div>
            </div>

            {/* Assessment Warning if VP is selected */}
            {positions.includes('Vice President') && (
              <div className="p-3 bg-fuchsia-950/30 border border-fuchsia-500/20 rounded-xl text-xs flex items-start gap-2.5">
                <Gamepad2 className="w-4 h-4 text-fuchsia-400 mt-0.5 shrink-0 animate-bounce" />
                <div className="space-y-0.5">
                  <span className="block font-bold text-fuchsia-300 uppercase tracking-widest text-[10px]">Gaming assessment Required</span>
                  <p className="text-purple-400 text-[11px] leading-relaxed">
                    This position incorporates our proprietary game-based assessment scenario timer. You will answer 3 high-intensity strategic esports scenario questions within the strict runtime limit to gauge cognitive tactical leadership.
                  </p>
                </div>
              </div>
            )}

            {/* Questionnaire */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-purple-400 uppercase mb-1">
                  1) Summarize your key past organization experience *
                </label>
                <textarea
                  rows={2}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. Led UI/UX core development during various regional tech hackathons..."
                  className="w-full p-2.5 bg-purple-950/20 border border-purple-500/20 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-400 uppercase mb-1">
                  2) Why do you believe you are optimal for this specific role? *
                </label>
                <textarea
                  rows={2}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Describe your creative leadership, motivation, and drive..."
                  className="w-full p-2.5 bg-purple-950/20 border border-purple-500/20 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-400 uppercase mb-1">
                  3) Outline relevant toolsets / technical skills *
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Figma, Git, React, Event Design, Copywriting"
                  className="w-full p-2.5 bg-purple-950/20 border border-purple-500/20 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-purple-500/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/15 text-purple-300 font-bold text-xs rounded-xl flex items-center gap-1 uppercase transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextToStep3}
                className="px-5 py-2.5 bg-purple-650 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 uppercase tracking-wider cursor-pointer font-sans"
              >
                <span>Validate Requirements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Core Verification checklist items */}
            <div className="bg-[#160b26] border border-purple-500/20 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-purple-500/10 pb-2">
                Final Assessment & Review Checklist
              </h4>

              <div className="space-y-2.5">
                {/* VP Test state check */}
                {positions.includes('Vice President') ? (
                  <div className="flex items-center justify-between bg-fuchsia-950/10 border border-fuchsia-500/20 p-3 rounded-lg">
                    <div>
                      <span className="block text-xs font-semibold text-fuchsia-200">VP Combat Simulator</span>
                      <span className="text-[10px] text-purple-400">Must score on high-stakes strategic timer</span>
                    </div>
                    {vpAssessment ? (
                      <span className="text-[10px] font-mono px-2.5 py-1 bg-[#102a45]/40 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Score: {vpAssessment.correctAnswers}/30 ({vpAssessment.strategicVerdict})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsTakingVpTest(true)}
                        className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[10px] font-mono rounded font-bold uppercase cursor-pointer"
                      >
                        Start Simulator
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 bg-purple-950/10 border border-purple-500/10 p-3 rounded-lg text-xs text-purple-200">
                    <span className="block font-bold text-[#d6c2ff] text-[10px] uppercase tracking-wider">Candidacy Summary</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-purple-400 font-mono text-[9px] block">NAME</span>
                        <div className="font-bold text-white truncate">{fullName}</div>
                      </div>
                      <div>
                        <span className="text-purple-400 font-mono text-[9px] block">DIVISION</span>
                        <div className="font-bold text-white truncate">{section}</div>
                      </div>
                      <div className="col-span-2 border-t border-purple-500/10 pt-1.5">
                        <span className="text-purple-400 font-mono text-[9px] block">DESIRED POSITION</span>
                        <div className="font-bold text-fuchsia-300 truncate">{positions.join(", ")}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Society Registration Fee Selection */}
                <div className="p-4 bg-purple-950/20 border border-purple-500/15 rounded-xl space-y-3.5 relative overflow-hidden">
                  <div className="absolute right-3 top-3 text-purple-500/5 text-6xl select-none font-bold font-serif">₨</div>
                  <div className="flex items-center justify-between">
                    <span className="block font-bold text-[#d6c2ff] text-xs uppercase tracking-wider">
                      Society Registration Fee
                    </span>
                    <span className="text-xs px-2.5 py-0.5 bg-fuchsia-950 border border-fuchsia-500/30 rounded text-fuchsia-300 font-mono font-bold">
                      PKR 500
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-400 leading-relaxed">
                    A society registration fee of <strong className="text-white">PKR 500</strong> is required to coordinate your candidacy processing, system resources allocation, and community onboarding tracks. Please confirm your fee status below:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFeeStatus('paid');
                        setFeeAmountPaid(500);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all duration-250 cursor-pointer flex flex-col justify-between h-20 ${
                        feeStatus === 'paid'
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                          : 'bg-[#12091f]/50 border-purple-500/10 text-purple-300 hover:border-purple-500/25'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <CheckCircle2 className={`w-4 h-4 ${feeStatus === 'paid' ? 'text-emerald-400' : 'text-purple-500'}`} />
                        {feeStatus === 'paid' && <span className="text-[8px] uppercase tracking-wider bg-emerald-950 border border-emerald-500/30 px-1.5 rounded text-emerald-400 font-bold">Selected</span>}
                      </div>
                      <div>
                        <span className="block font-bold text-[11px]">Paid PKR 500</span>
                        <span className="text-[9px] text-purple-400 block font-mono">Fee Paid</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFeeStatus('pending_payment');
                        setFeeAmountPaid(0);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all duration-250 cursor-pointer flex flex-col justify-between h-20 ${
                        feeStatus === 'pending_payment'
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                          : 'bg-[#12091f]/50 border-purple-500/10 text-purple-300 hover:border-purple-500/25'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <CreditCard className={`w-4 h-4 ${feeStatus === 'pending_payment' ? 'text-amber-400' : 'text-purple-500'}`} />
                        {feeStatus === 'pending_payment' && <span className="text-[8px] uppercase tracking-wider bg-amber-950 border border-amber-500/30 px-1.5 rounded text-amber-450 font-bold">Selected</span>}
                      </div>
                      <div>
                        <span className="block font-bold text-[11px]">Pay Later</span>
                        <span className="text-[9px] text-purple-400 block font-mono">Payment Pending</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active overlay simulations */}
            {isTakingVpTest && (
              <div className="fixed inset-0 bg-[#0f071a]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <GamingAssessment 
                  onComplete={(score) => {
                    setVpAssessment(score);
                    setIsTakingVpTest(false);
                  }}
                  onCancel={() => setIsTakingVpTest(false)}
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-purple-500/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/15 text-purple-300 font-bold text-xs rounded-xl flex items-center gap-1 uppercase transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              
              <button
                type="button"
                onClick={handleSubmission}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 uppercase tracking-widest cursor-pointer shadow-lg shadow-purple-950/40"
              >
                <span>Engage Ledger Entry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-950 border border-emerald-500 rounded-full text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Application Ledger Transmitted</h4>
              <p className="text-xs text-purple-400 px-4">
                Your credentials have been securely registered to our local datastore. We will check strategic score telemetry and notify you via WhatsApp shortly.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#160b26] hover:bg-purple-950 text-purple-300 font-bold text-xs rounded-lg uppercase tracking-wider"
            >
              Close Ledger Form
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
