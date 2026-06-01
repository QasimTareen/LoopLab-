import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, X, SkipForward } from 'lucide-react';

interface IntroCinematicProps {
  onClose: () => void;
}

export default function IntroCinematic({ onClose }: IntroCinematicProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  // Auto-end when video finishes
  const handleEnded = () => {
    setIsEnding(true);
    setTimeout(onClose, 800);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSkip = () => {
    setIsEnding(true);
    setTimeout(onClose, 400);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic"
        initial={{ opacity: 0 }}
        animate={{ opacity: isEnding ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      >
        {/* Video fills screen on all devices */}
        <video
          ref={videoRef}
          src="/intro.mp4"
          muted={isMuted}
          playsInline
          autoPlay
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        />

        {/* Subtle vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* Looplab brand title — fades in after 1s */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.2 }}
          className="relative z-10 flex flex-col items-center select-none pointer-events-none"
        >
          <span
            className="text-white font-black tracking-widest uppercase"
            style={{
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              textShadow: '0 0 40px rgba(139,92,246,0.8), 0 2px 12px rgba(0,0,0,0.9)',
              letterSpacing: '0.25em',
            }}
          >
            LOOPLAB
          </span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="text-purple-300 tracking-[0.4em] uppercase text-xs sm:text-sm mt-1"
            style={{ textShadow: '0 0 16px rgba(139,92,246,0.6)' }}
          >
            Where Gamers Connect
          </motion.span>
        </motion.div>

        {/* Controls — top right */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all backdrop-blur-sm"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={handleSkip}
            className="p-2 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all backdrop-blur-sm"
            title="Skip intro"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Progress bar — bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10">
          <motion.div
            className="h-full bg-purple-500"
            style={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
