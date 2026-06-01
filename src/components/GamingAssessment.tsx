import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Timer, AlertTriangle, Shield, CheckCircle, RefreshCcw, Gamepad2, ArrowRight } from 'lucide-react';
import { GamingAssessmentScore } from '../types';

interface GamingAssessmentProps {
  onComplete: (score: GamingAssessmentScore) => void;
  onCancel: () => void;
}

const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    title: 'Defensive Fortification vs Shock Tactics',
    scenario: 'Your high-stakes team championship is in its final round. Your primary operator drops connection due to high network jitter. The enemy team is approaching your payload. What is your strategic move?',
    options: [
      { text: 'Deploy immediate defensive static barriers and command a hard turtling cycle to buy reconnection minutes.', score: 3, strategy: 'Defensive Barrier Protocol' },
      { text: 'Sacrifice the remaining support division to launch an aggressive, high-risk distraction offensive.', score: 5, strategy: 'Sacrifice Gamble' },
      { text: 'Execute a tactical grid fallback to bottle-neck the opponents in the tight server corridor.', score: 4, strategy: 'Choke-Point Relocation' },
      { text: 'Do nothing and wait for natural routing to self-adjust, risking immediate team wipe.', score: 1, strategy: 'Indecision Risk' }
    ]
  },
  {
    id: 2,
    title: 'Decentralized Guild Security Breach',
    scenario: 'An allied guild leaks intelligence that a rival clan has leased high-end nodes to spoof local server positions, gaining a 10ms frame Advantage. How do you respond?',
    options: [
      { text: 'Construct a multi-signature trust coalition with other sub-clans to blacklist their public address space.', score: 5, strategy: 'Consensus Alliance' },
      { text: 'Optimize packet payload compression scripts to reduce baseline frame latency to parity levels.', score: 4, strategy: 'Algorithmic Optimization' },
      { text: 'File an immediate arbitration complaint to the gaming commission and halt all training rounds.', score: 2, strategy: 'Bureaucratic Safeplay' },
      { text: 'Launch a counter DOS sweep on their gateway addresses to match their latency boost.', score: 3, strategy: 'Cyber Retaliation' }
    ]
  },
  {
    id: 3,
    title: 'The Catastrophic Stream Jitter',
    scenario: 'As Vice President organizing the regional esport cup, the stream encoder crashes live in front of 12,000 spectators. The chat is spamming offline emojis. What is your direct response?',
    options: [
      { text: 'Launch a backup decentralized stream mirror and run an interactive quiz game with digital key hand-outs.', score: 5, strategy: 'Interactive Diversion' },
      { text: 'Post a technical autopsy statement within 3 minutes, accepting responsibility and postponing the main lobby.', score: 4, strategy: 'Transparent Leadership' },
      { text: 'Re-stream cached rehearsal footage while technicians debug the master encoder line.', score: 1, strategy: 'Decoy Re-routing' },
      { text: 'Mute chat completely and cycle the server rack blindly hoping for hot plug fixes.', score: 2, strategy: 'Instinctual Debugging' }
    ]
  },
  {
    id: 4,
    title: 'Sponsorship Prize Match Discrepancy',
    scenario: 'A major tech sponsor threatens to withdraw a PKR 2,000,000 sponsorship because their logo size was rendered 15 pixels narrower on the main LAN overlay stage. How do you resolve this?',
    options: [
      { text: 'Offer immediate programmatic compensation: sponsor placements customized with premium 3D animations and full-screen mid-match breaks.', score: 5, strategy: 'Interactive Compensation' },
      { text: 'Issue a detailed analytical audit proving that audience impressions/reach far exceeded baseline expectations by 34%.', score: 4, strategy: 'Data-Backed Retention' },
      { text: 'Refund 20% of their cash funding and terminate the contract, sourcing alternative community partners.', score: 2, strategy: 'Aggressive Liquidation' },
      { text: 'Ignore the visual complaints and assume terms of agreement prevent formal withdrawal.', score: 1, strategy: 'Contractual Neglect' }
    ]
  },
  {
    id: 5,
    title: 'Rival Infiltration of Real-time Setup Room',
    scenario: 'You discover a shadow observer client connected under unauthorized credentials in your secure team-voice Discord setup minutes before grand finals kickoff. What is your protocol?',
    options: [
      { text: 'Generate an encrypted alternative workspace server, migrating players individually via physical coordinate verifications.', score: 5, strategy: 'Zero-Trust Migration' },
      { text: 'Instantly lock the client address, log their active IP coordinate, and file a formal breach report with evidence.', score: 4, strategy: 'Defensive Blacklisting' },
      { text: 'Confront the shadow user in the channel publicly to extract admission of guilt.', score: 2, strategy: 'Confrontational Risk' },
      { text: 'Delay match schedule by 2 hours while security runs complete antivirus scans on all systems.', score: 3, strategy: 'Operational Suspension' }
    ]
  },
  {
    id: 6,
    title: 'Esport Main Arena Power Surge Gridlock',
    scenario: 'A sudden electrical circuit surcharge trips the arena breakers during live gameplay, plunging the active competitors and 500 physical spectators into complete darkness. What is your emergency action plan?',
    options: [
      { text: 'Trigger the auxiliary battery backup to power the audio PA systems, command structural crowd marshals to light up stages using phone flashes, and host a live community chant to stabilize morale.', score: 5, strategy: 'Morale Mobilization' },
      { text: 'Command all players to log out and suspend the physical event, instructing safety personnel to evacuate the venue.', score: 4, strategy: 'Evacuation Protocol' },
      { text: 'Attempt to hot-wire the primary grid line immediately to force the power breakers back into active state.', score: 1, strategy: 'Instinctual Danger' },
      { text: 'Wait silently in the control room for the backup venue technicians to locate and fix the hardware break.', score: 2, strategy: 'Technological Reliance' }
    ]
  }
];

export default function GamingAssessment({ onComplete, onCancel }: GamingAssessmentProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(25); // 25 seconds per question
  const [points, setPoints] = useState<number>(0);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Timer loop
  useEffect(() => {
    if (isFinished) return;

    if (timeLeft <= 0) {
      handleNextQuestion();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isFinished]);

  const handleNextQuestion = () => {
    // Record selection or record timer out
    const question = ASSESSMENT_QUESTIONS[currentIdx];
    let addedPoints = 0;
    let strategySelect = 'Timer Expiry Force';

    if (selectedOpt !== null) {
      const opt = question.options[selectedOpt];
      addedPoints = opt.score;
      strategySelect = opt.strategy;
    }

    setPoints((prev) => prev + addedPoints);
    setDecisions((prev) => [...prev, strategySelect]);
    setSelectedOpt(null);

    if (currentIdx < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(25);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinish = () => {
    // Calculate strategic verdict
    let strategicVerdict: GamingAssessmentScore['strategicVerdict'] = 'Needs Training';
    if (points >= 25) {
      strategicVerdict = 'Master Tactician';
    } else if (points >= 19) {
      strategicVerdict = 'High Strategist';
    } else if (points >= 12) {
      strategicVerdict = 'Tactical Lead';
    }

    onComplete({
      totalQuestions: ASSESSMENT_QUESTIONS.length,
      correctAnswers: points, // Representing total tactical weights
      timeRemainingSec: timeLeft,
      strategicDecisions: decisions,
      strategicVerdict,
      completedAt: new Date().toISOString()
    });
  };

  const currentQuestion = ASSESSMENT_QUESTIONS[currentIdx];

  return (
    <div className="bg-[#12091f]/95 border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-5 select-none text-purple-100 max-w-xl mx-auto">
      
      {/* Header status */}
      <div className="flex justify-between items-center border-b border-purple-500/20 pb-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-fuchsia-400 animate-bounce" />
          <h3 className="font-display font-bold text-sm text-fuchsia-200 uppercase tracking-widest">
            VP Combat & Strategy Simulator
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#160b26] border border-purple-500/20">
          <Timer className={`w-4 h-4 ${timeLeft < 8 ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
          <span className={`font-mono text-xs font-bold ${timeLeft < 8 ? 'text-red-400' : 'text-purple-300'}`}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="w-full bg-[#160b26] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx) / ASSESSMENT_QUESTIONS.length) * 100}%` }}
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400">
              Scenario Assessment {currentIdx + 1} of {ASSESSMENT_QUESTIONS.length}
            </span>
            <h4 className="text-base font-bold text-white tracking-snug">
              {currentQuestion.title}
            </h4>
            <div className="text-xs text-purple-300 leading-relaxed bg-purple-950/25 p-3 rounded-lg border border-purple-500/10 italic">
              {currentQuestion.scenario}
            </div>
          </div>

          {/* Action Choice Option lists */}
          <div className="space-y-2 pt-2">
            {currentQuestion.options.map((option, oIdx) => (
              <button
                key={oIdx}
                type="button"
                onClick={() => setSelectedOpt(oIdx)}
                className={`w-full text-left text-xs p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                  selectedOpt === oIdx
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-[0_0_15px_rgba(157,78,221,0.2)]'
                    : 'bg-[#160b26]/60 border-purple-500/10 text-purple-300 hover:border-purple-500/30'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-purple-950 flex items-center justify-center font-mono font-bold text-[10px] text-purple-400 shrink-0 mt-0.5">
                  {String.fromCharCode(65 + oIdx)}
                </span>
                <span>{option.text}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-purple-500/10">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-purple-400 hover:text-white transition-colors uppercase tracking-wider"
            >
              Abort Test
            </button>
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 uppercase tracking-wider"
            >
              <span>{currentIdx === ASSESSMENT_QUESTIONS.length - 1 ? 'Complete' : 'Next Node'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 space-y-5">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-purple-950 border-2 border-fuchsia-500 rounded-full text-fuchsia-400 animate-pulse">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Simulation Sequence Complete</h4>
            <p className="text-xs text-purple-400">Tactical telemetry compiled successfully. Submit scores to your candidate registry ledger.</p>
          </div>

          {/* Decisive scorecard summary */}
          <div className="bg-[#160b26] border border-purple-500/20 rounded-xl p-4 text-left max-w-sm mx-auto space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-400">Strategy Decision Map</span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-500/30 rounded">
                Tactical Score: {points}/30
              </span>
            </div>
            <div className="space-y-1.5">
              {decisions.map((decision, dIdx) => (
                <div key={dIdx} className="text-xs text-purple-300 flex items-center justify-between">
                  <span>Scenario {dIdx + 1}:</span>
                  <span className="font-mono text-[11px] text-purple-400">{decision}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold rounded-xl border border-fuchsia-400/40 uppercase tracking-widest shadow-lg shadow-fuchsia-900/40"
            >
              Link Score with Application
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentIdx(0);
                setSelectedOpt(null);
                setTimeLeft(25);
                setPoints(0);
                setDecisions([]);
                setIsFinished(false);
              }}
              className="text-xs text-purple-500 hover:text-purple-300 flex items-center justify-center gap-1.5 py-1"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Retry Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
