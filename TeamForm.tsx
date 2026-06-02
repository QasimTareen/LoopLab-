import { CoreMember, CoreTeam } from '../types';
import { motion } from 'motion/react';
import { Users, Layers, Clock, TrendingUp } from 'lucide-react';

interface StatsProps {
  members: CoreMember[];
  teams: CoreTeam[];
}

export default function StatsGrid({ members, teams }: StatsProps) {
  const totalMembers = members.length;
  const totalTeams = teams.length;
  
  const avgHours = totalMembers > 0 
    ? Math.round(members.reduce((acc, curr) => acc + curr.availabilityHours, 0) / totalMembers)
    : 0;

  // Code count check for recruiting teams
  const recruitingTeams = teams.filter(t => t.status === 'recruiting').length;

  // Department distribution
  const deptMap: Record<string, number> = {
    engineering: 0,
    design: 0,
    operations: 0,
    marketing: 0,
    relations: 0,
  };
  
  members.forEach(m => {
    if (deptMap[m.department] !== undefined) {
      deptMap[m.department]++;
    }
  });

  const maxDeptValue = Math.max(...Object.values(deptMap), 1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Stat 1: Core Members */}
      <div className="bg-[#12091f]/90 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div>
          <span className="text-xs text-purple-300 font-mono tracking-wider uppercase">Active Members</span>
          <h3 className="text-3xl font-display font-bold text-white mt-1"><motion.span initial={{number:0}} animate={{number:totalMembers}}>{totalMembers}</motion.span></h3>
          <p className="text-[10px] text-purple-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-purple-400" /> +100% locally saved
          </p>
        </div>
        <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/20 text-purple-400">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Stat 2: Active Circles */}
      <div className="bg-[#12091f]/90 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 w-24 h-24 bg-purple-700/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div>
          <span className="text-xs text-purple-300 font-mono tracking-wider uppercase">Core Circles</span>
          <h3 className="text-3xl font-display font-bold text-white mt-1">{totalTeams}</h3>
          <p className="text-[10px] text-purple-400 mt-1">
            {recruitingTeams} team{recruitingTeams !== 1 ? 's' : ''} recruiting members
          </p>
        </div>
        <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/20 text-purple-400">
          <Layers className="w-6 h-6" />
        </div>
      </div>

      {/* Stat 3: Avg Commited Hours */}
      <div className="bg-[#12091f]/90 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div>
          <span className="text-xs text-purple-300 font-mono tracking-wider uppercase">Avg Support</span>
          <h3 className="text-3xl font-display font-bold text-white mt-1">{avgHours}h <span className="text-xs font-normal">/wk</span></h3>
          <p className="text-[10px] text-purple-400 mt-1">
            Total active contribution band
          </p>
        </div>
        <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/20 text-purple-400">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Stat 4: Department Distribution Matrix */}
      <div className="bg-[#12091f]/90 border border-purple-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-col justify-between">
        <span className="text-xs text-purple-300 font-mono tracking-wider uppercase mb-2 block">Departments</span>
        <div className="space-y-1.5 flex-1 flex flex-col justify-center">
          {Object.entries(deptMap).map(([dept, count]) => (
            <div key={dept} className="flex items-center text-[10px]">
              <span className="w-20 text-purple-200 capitalize font-mono shrink-0 truncate">{dept}</span>
              <div className="flex-1 bg-purple-950/85 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(count / maxDeptValue) * 100}%` }}
                />
              </div>
              <span className="w-5 text-right font-mono text-purple-400 shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
