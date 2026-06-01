import React, { useState } from 'react';
import { CoreTeam } from '../types';
import { Layers, User, Mail, Sparkles, MessageSquare, Plus, X, ListTodo, Users } from 'lucide-react';

interface TeamFormProps {
  onSubmit: (team: Omit<CoreTeam, 'id' | 'createdAt' | 'currentMemberCount'>) => void;
}

export default function TeamForm({ onSubmit }: TeamFormProps) {
  const [teamName, setTeamName] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [communicationChannel, setCommunicationChannel] = useState('#');
  const [status, setStatus] = useState<'active' | 'forming' | 'recruiting' | 'paused'>('forming');
  const [maxCapacity, setMaxCapacity] = useState<number>(5);
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGoal = newGoal.trim();
    if (cleanGoal && !goals.includes(cleanGoal)) {
      setGoals([...goals, cleanGoal]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !focusArea || !leadName || !leadEmail) {
      return;
    }

    onSubmit({
      teamName,
      focusArea,
      leadName,
      leadEmail,
      communicationChannel: communicationChannel.startsWith('#') ? communicationChannel : `#${communicationChannel}`,
      status,
      maxCapacity,
      goals: goals.length > 0 ? goals : ['Establish charter details', 'Coordinate milestone boards'],
    });

    // Reset fields
    setTeamName('');
    setFocusArea('');
    setLeadName('');
    setLeadEmail('');
    setCommunicationChannel('#');
    setStatus('forming');
    setMaxCapacity(5);
    setGoals([]);
    setNewGoal('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-purple-100">
      <div className="text-center mb-6">
        <h2 className="text-xl font-display font-semibold text-white">Create Core Circle</h2>
        <p className="text-xs text-purple-400 mt-1">Form a brand new core team/loop or initiative circle within LoopLab</p>
      </div>

      {/* Team name & Primary Focus Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team Name */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Circle Name <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <Layers className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g. Hyperion Engine Dev"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Focus Area / Mission */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Core Target / Focus Area <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <Sparkles className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Consensus Engine"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Circle Lead & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lead Name */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Circle Proposer / Lead <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Vance"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Lead Email */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Lead Coordination Email <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              placeholder="vance@looplab.community"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Target Status, Sync Channels, Capacity limits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core Channel */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Comms Channel <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500 font-mono text-sm">
              <MessageSquare className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="#hyperion-ops"
              value={communicationChannel}
              onChange={(e) => setCommunicationChannel(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Development Phase <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-purple-300 focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="forming" className="bg-[#12091f] text-purple-100">🟣 Forming / Structuring</option>
              <option value="recruiting" className="bg-[#12091f] text-purple-100">🔥 Recruiting Contributors</option>
              <option value="active" className="bg-[#12091f] text-purple-100">🟢 Active Operations</option>
              <option value="paused" className="bg-[#12091f] text-purple-100">⏳ Temporarily Paused</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-purple-500">▼</span>
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
            Max Member Cap <span className="text-purple-400">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-purple-500">
              <Users className="w-4 h-4" />
            </span>
            <input
              type="number"
              min="2"
              max="24"
              required
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Math.max(2, Number(e.target.value)))}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Circle Goals */}
      <div>
        <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
          Quarterly Target Goals & Initiatives
        </label>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
              <ListTodo className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. Publish core API specification alpha..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddGoal(e);
                }
              }}
              className="w-full pl-10 pr-3 py-2.5 bg-purple-950/30 border border-purple-500/15 rounded-lg text-sm text-white placeholder-purple-700 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="button"
            onClick={handleAddGoal}
            className="px-4 bg-purple-800/80 hover:bg-purple-700 active:bg-purple-900 text-white border border-purple-500/20 rounded-lg text-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Listed Goals */}
        {goals.length > 0 ? (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 bg-purple-950/20 border border-purple-500/5 rounded-xl p-3">
            {goals.map((goal, index) => (
              <div key={index} className="flex justify-between items-start gap-2 bg-purple-950/40 border border-purple-500/10 rounded-lg p-2 text-xs">
                <span className="text-purple-200">🚩 {goal}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(index)}
                  className="text-purple-400 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-purple-500 italic p-2">Specify at least one specific goal for the circle (default placeholder goals will be assigned if left empty)</p>
        )}
      </div>

      {/* Propose Button */}
      <button
        type="submit"
        className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold rounded-xl border border-purple-400/30 text-xs shadow-xl shadow-purple-900/40 uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
      >
        <span>Initialize Core Circle</span>
      </button>
    </form>
  );
}
