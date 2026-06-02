import { useState } from 'react';
import { CoreMember, CoreTeam } from '../types';
import { Search, Github, MessageSquare, Trash2, Shield, Calendar, Hammer, Users, ListFilter, Download, Code, Palette, Settings, TrendingUp, Radio } from 'lucide-react';

interface DirectoryProps {
  members: CoreMember[];
  teams: CoreTeam[];
  onDeleteMember: (id: string) => void;
  onDeleteTeam: (id: string) => void;
  onExport: () => void;
}

export default function CoreDirectory({
  members,
  teams,
  onDeleteMember,
  onDeleteTeam,
  onExport,
}: DirectoryProps) {
  const [viewTab, setViewTab] = useState<'members' | 'teams'>('members');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(search.toLowerCase()) ||
      member.roleTitle.toLowerCase().includes(search.toLowerCase()) ||
      member.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    
    const matchesDept = deptFilter === 'all' || member.department === deptFilter;
    
    return matchesSearch && matchesDept;
  });

  // Filter teams
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.teamName.toLowerCase().includes(search.toLowerCase()) ||
      team.focusArea.toLowerCase().includes(search.toLowerCase()) ||
      team.leadName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = deptFilter === 'all' || team.status === deptFilter;
    
    return matchesSearch && (deptFilter === 'all' || matchesStatus);
  });

  const getDeptColor = (dept: string) => {
    switch (dept) {
      case 'engineering': return 'text-purple-400 bg-purple-950/40 border-purple-500/20';
      case 'design': return 'text-pink-400 bg-pink-950/40 border-pink-500/20';
      case 'operations': return 'text-indigo-400 bg-indigo-950/40 border-indigo-500/20';
      case 'marketing': return 'text-fuchsia-400 bg-fuchsia-950/40 border-fuchsia-500/20';
      case 'relations': return 'text-violet-400 bg-violet-950/40 border-violet-500/20';
      default: return 'text-purple-300 bg-purple-950/30 border-purple-500/10';
    }
  };

  const getStatusBadge = (status: CoreTeam['status']) => {
    switch (status) {
      case 'active':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono flex items-center gap-1">● Active Operations</span>;
      case 'forming':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono flex items-center gap-1">● Forming Circle</span>;
      case 'recruiting':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-950/60 border border-fuchsia-500/30 text-fuchsia-400 font-mono flex items-center gap-1">● Recruiting Core</span>;
      case 'paused':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-950/60 border border-yellow-500/30 text-yellow-500 font-mono flex items-center gap-1">● Paused</span>;
    }
  };

  return (
    <div className="bg-[#12091f]/90 border border-purple-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-purple-500/10">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400 animate-pulse" /> Community Core Registry
          </h2>
          <p className="text-xs text-purple-400 mt-1">Live directory of authorized loops and active members</p>
        </div>
        
        {/* Export Button */}
        <button
          onClick={onExport}
          className="px-3 py-1.5 text-xs bg-purple-950 border border-purple-500/30 text-purple-200 hover:text-white hover:bg-purple-900 transition-colors rounded-xl flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Export DB
        </button>
      </div>

      {/* Primary tab switcher */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-purple-950/40 border border-purple-500/10 rounded-xl">
        <button
          onClick={() => { setViewTab('members'); setDeptFilter('all'); }}
          className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            viewTab === 'members'
              ? 'bg-purple-600/60 text-white shadow-md border border-purple-400/30'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/20'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Core Fellowship ({members.length})
        </button>
        <button
          onClick={() => { setViewTab('teams'); setDeptFilter('all'); }}
          className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            viewTab === 'teams'
              ? 'bg-purple-600/60 text-white shadow-md border border-purple-400/30'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/20'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Core Circles ({teams.length})
        </button>
      </div>

      {/* Directory search and filters control */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={viewTab === 'members' ? "Search fellowship by name, skill, or role..." : "Search circles by name, lead, or focus..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-purple-950/30 border border-purple-500/20 rounded-xl text-sm text-white placeholder-purple-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all"
          />
        </div>

        {/* Dynamic drop-down search fit */}
        <div className="flex items-center gap-2 min-w-44 shrink-0">
          <ListFilter className="w-4 h-4 text-purple-500" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-2 py-2 bg-purple-950/45 border border-purple-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400 transition-all appearance-none cursor-pointer"
          >
            {viewTab === 'members' ? (
              <>
                <option value="all">All Divisions</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="operations">Operations</option>
                <option value="marketing">Marketing</option>
                <option value="relations">Relations</option>
              </>
            ) : (
              <>
                <option value="all">All Phases</option>
                <option value="forming">Phase: Forming</option>
                <option value="recruiting">Phase: Recruiting</option>
                <option value="active">Phase: Active</option>
                <option value="paused">Phase: Paused</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Cards List Grid */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {viewTab === 'members' ? (
          filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="group relative bg-purple-950/20 border border-purple-500/10 hover:border-purple-500/30 rounded-2xl p-4 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Member main column */}
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      {member.fullName}
                    </h4>
                    <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md border ${getDeptColor(member.department)}`}>
                      {member.department}
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">
                      Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-purple-200 font-medium">
                    {member.roleTitle} — <span className="font-mono text-purple-400 text-[11px]">{member.availabilityHours}h/week commitment</span>
                  </p>

                  {member.bio && (
                    <p className="text-xs text-purple-400 italic line-clamp-2 max-w-xl">
                      &ldquo;{member.bio}&rdquo;
                    </p>
                  )}

                  {member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.skills.map(skill => (
                        <span key={skill} className="text-[10px] bg-purple-950/85 border border-purple-500/10 text-purple-300 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right actions and credentials handles */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-purple-500/10">
                  <div className="flex gap-2">
                    <span className="text-xs text-purple-400 font-mono flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-300" /> {member.discordUsername}
                    </span>
                    {member.githubUrl && (
                      <a
                        href={`https://github.com/${member.githubUrl}`}
                        target="_blank"
                        rel="referrer"
                        className="text-purple-400 hover:text-white transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteMember(member.id)}
                    className="p-1 px-2 text-purple-400 hover:text-red-400 hover:bg-red-500/10 text-xs rounded-lg transition-all flex items-center gap-1.5"
                    title="Remove active core member"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-purple-950/5 border border-purple-500/5 rounded-2xl">
              <Code className="w-8 h-8 text-purple-500/50 mx-auto mb-2" />
              <p className="text-sm text-purple-400 font-medium">No fellowship members found</p>
              <p className="text-xs text-purple-500 mt-1">Try matching other keywords or add a new candidate above</p>
            </div>
          )
        ) : (
          filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <div
                key={team.id}
                className="group relative bg-purple-950/20 border border-purple-500/10 hover:border-purple-500/30 rounded-2xl p-4 transition-all duration-300 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                      {team.teamName}
                    </h4>
                    <p className="text-xs text-purple-300 font-medium tracking-wide">
                      Focus: <span className="text-purple-200">{team.focusArea}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(team.status)}
                    <button
                      onClick={() => onDeleteTeam(team.id)}
                      className="p-1 text-purple-400 hover:text-red-400 hover:bg-red-500/10 text-xs rounded-lg transition-all"
                      title="Disband circle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs border-t border-purple-500/10">
                  <div>
                    <span className="text-purple-400 block font-mono text-[10px] uppercase">Circle Proposer / Lead</span>
                    <span className="text-purple-200 font-medium">{team.leadName}</span>
                    <span className="text-purple-400 text-[10px] block truncate">{team.leadEmail}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 block font-mono text-[10px] uppercase">Coordination Hub</span>
                    <span className="text-indigo-300 font-mono font-semibold">{team.communicationChannel}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 block font-mono text-[10px] uppercase">Circle Capacity</span>
                    <span className="text-purple-300 font-mono">
                      Cap: {team.maxCapacity} Seats
                    </span>
                  </div>
                </div>

                {team.goals && team.goals.length > 0 && (
                  <div className="bg-purple-950/40 rounded-xl p-3 border border-purple-500/5 mt-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 block mb-1.5">Quarterly Targets</span>
                    <ul className="space-y-1">
                      {team.goals.map((goal, index) => (
                        <li key={index} className="text-xs text-purple-300 flex items-start gap-1.5">
                          <span className="text-purple-400 mt-0.5 shrink-0">▫</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-purple-950/5 border border-purple-500/5 rounded-2xl">
              <Palette className="w-8 h-8 text-purple-500/50 mx-auto mb-2" />
              <p className="text-sm text-purple-400 font-medium">No circles found matching your guidelines</p>
              <p className="text-xs text-purple-500 mt-1">Start a fresh initiative by clicking Create Core Circle</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
