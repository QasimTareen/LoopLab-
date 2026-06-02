import React, { useState } from 'react';
import { CoreMember } from '../types';
import { User, Mail, Compass, Briefcase, Plus, X, Github, MessageSquare, Clock } from 'lucide-react';

interface MemberFormProps {
  onSubmit: (member: Omit<CoreMember, 'id' | 'joinedAt'>) => void;
}

const PRESET_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'TailwindCSS', 'Figma', 
  'UI/UX', 'Community Ops', 'Technical Writing', 'Event Planning', 
  'Developer Relations', 'Growth Marketing', 'Product Strategy'
];

export default function MemberForm({ onSubmit }: MemberFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [department, setDepartment] = useState<'engineering' | 'design' | 'operations' | 'marketing' | 'relations'>('engineering');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [availabilityHours, setAvailabilityHours] = useState<number>(10);
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkill = customSkill.trim();
    if (cleanSkill && !selectedSkills.includes(cleanSkill)) {
      setSelectedSkills([...selectedSkills, cleanSkill]);
      setCustomSkill('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !roleTitle || !discordUsername) {
      return; // Handled by standard browser check or parent logic, but guard anyway
    }

    const payload: Omit<CoreMember, 'id' | 'joinedAt'> = {
      fullName,
      email,
      roleTitle,
      department,
      skills: selectedSkills,
      availabilityHours,
      bio,
      discordUsername,
    };

    if (githubUrl) {
      payload.githubUrl = githubUrl;
    }

    onSubmit(payload);

    // Reset fields
    setFullName('');
    setEmail('');
    setRoleTitle('');
    setDepartment('engineering');
    setSelectedSkills([]);
    setCustomSkill('');
    setAvailabilityHours(10);
    setBio('');
    setGithubUrl('');
    setDiscordUsername('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-purple-100">
      <div className="text-center mb-6">
        <h2 className="text-xl font-display font-semibold text-white">Join Core Fellowship</h2>
        <p className="text-xs text-purple-400 mt-1">Register as a primary builder, developer, or design operator of LoopLab</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g. Alara Vance"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Core Email <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              placeholder="alara@looplab.community"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Title */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Role Title <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <Briefcase className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g. Lead UI Architect"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Department Select */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Primary Division <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <Compass className="w-4 h-4" />
            </span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as any)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/35 border border-purple-500/20 rounded-lg text-sm text-purple-300 focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="engineering" className="bg-[#12091f] text-purple-100">Engineering & Dev</option>
              <option value="design" className="bg-[#12091f] text-purple-100">Design & Arts</option>
              <option value="operations" className="bg-[#12091f] text-purple-100">Operations & Admin</option>
              <option value="marketing" className="bg-[#12091f] text-purple-100">Marketing & Content</option>
              <option value="relations" className="bg-[#12091f] text-purple-100">Developer Relations</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-purple-500">▼</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Discord Handle */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Discord Username <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <MessageSquare className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g. alara_v"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* GitHub Username */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            GitHub Username <span className="text-purple-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <Github className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. alaravance"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Skills Manager Container */}
      <div>
        <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
          Select Expertises / Core Skills
        </label>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRESET_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-300 ${
                  isSelected
                    ? 'bg-purple-600/40 border-purple-400 text-white shadow-[0_0_10px_rgba(157,78,221,0.25)]'
                    : 'bg-purple-950/30 border-purple-500/10 text-purple-300 hover:border-purple-500/30 hover:bg-purple-950/50'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
        
        {/* Custom skills input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a custom skill..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomSkill(e);
              }
            }}
            className="flex-1 px-3 py-1.5 bg-purple-950/30 border border-purple-500/15 rounded-xl text-xs text-white placeholder-purple-600 focus:outline-none focus:border-purple-400/50"
          />
          <button
            type="button"
            onClick={handleAddCustomSkill}
            className="px-3 bg-purple-800/80 hover:bg-purple-700 active:bg-purple-900 text-white border border-purple-500/30 rounded-xl text-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Tag
          </button>
        </div>

        {/* Selected skills summary */}
        {selectedSkills.length > 0 && (
          <div className="mt-3 bg-purple-950/20 border border-purple-500/5 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-purple-400 mb-1.5">Selected tags</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 bg-purple-900/30 border border-purple-500/30 text-purple-200 text-xs px-2 py-0.5 rounded-md">
                  {skill}
                  <button type="button" onClick={() => toggleSkill(skill)} className="text-purple-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Commitment Hours Slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Weekly Commitment Range
          </label>
          <span className="text-xs px-2 py-0.5 bg-purple-950 border border-purple-500/30 text-purple-200 font-mono rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" /> {availabilityHours} hrs/week
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="40"
          value={availabilityHours}
          onChange={(e) => setAvailabilityHours(Number(e.target.value))}
          className="w-full accent-purple-500 h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer outline-none"
        />
        <div className="flex justify-between text-[10px] text-purple-500 font-mono mt-1">
          <span>1 hour</span>
          <span>10 hours</span>
          <span>20 hours</span>
          <span>30 hours</span>
          <span>40 hours (Full Dev focus)</span>
        </div>
      </div>

      {/* Bio / Core Focus Statement */}
      <div>
        <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
          Biography & Mission Interest
        </label>
        <textarea
          rows={3}
          placeholder="I build state management systems for open ecosystems or design interfaces. Looking to focus on loop-automation features at LoopLab..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 bg-purple-950/45 border border-purple-500/20 rounded-xl text-sm text-white placeholder-purple-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold rounded-xl border border-purple-400/30 text-xs shadow-xl shadow-purple-900/40 uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
      >
        <span>Initialize Core Membership</span>
      </button>
    </form>
  );
}
