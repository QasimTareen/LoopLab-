import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Cpu, Network, Terminal, Rotate3d, Star } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface CubeFace {
  indices: number[];
  color: string;
}

interface CubicNode {
  letter: string;
  color: string;
  glowColor: string;
  baseOrbitRadius: number;
  orbitPhase: number;
  orbitSpeed: number;
  localRotX: number;
  localRotY: number;
  localRotZ: number;
  localRotSpeedX: number;
  localRotSpeedY: number;
  localRotSpeedZ: number;
  size: number;
}

export default function Hero3DHeader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<'normal' | 'fast' | 'hyper'>('normal');

  // Interactive drag-to-rotate state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const userRotationRef = useRef({ x: 0.3, y: -0.4 });
  const [isDraggingState, setIsDraggingState] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 420);
    let height = (canvas.height = 420);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 420;
      }
    };

    window.addEventListener('resize', handleResize);

    // Mouse and touch drag handlers for rotating the space scene
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      setIsDraggingState(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      userRotationRef.current.y += dx * 0.007;
      userRotationRef.current.x += dy * 0.007;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUpOrLeave = () => {
      isDraggingRef.current = false;
      setIsDraggingState(false);
    };

    // Touch support for dragging
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        setIsDraggingState(true);
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      
      userRotationRef.current.y += dx * 0.007;
      userRotationRef.current.x += dy * 0.007;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUpOrLeave);
    canvas.addEventListener('mouseleave', handleMouseUpOrLeave);

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleMouseUpOrLeave);

    // 7 floating deep space cubics, each containing a character of "L-O-O-P-L-A-B"
    const cubicNodes: CubicNode[] = [
      { letter: 'L', color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.8)', baseOrbitRadius: 105, orbitPhase: 0, orbitSpeed: 0.007, localRotX: 0.2, localRotY: 0.5, localRotZ: 0.1, localRotSpeedX: 0.012, localRotSpeedY: 0.015, localRotSpeedZ: 0.008, size: 28 },
      { letter: 'O', color: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.8)', baseOrbitRadius: 110, orbitPhase: (1 * Math.PI * 2) / 7, orbitSpeed: 0.007, localRotX: 0.1, localRotY: 0.4, localRotZ: 0.3, localRotSpeedX: 0.015, localRotSpeedY: 0.008, localRotSpeedZ: 0.012, size: 28 },
      { letter: 'O', color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.8)', baseOrbitRadius: 105, orbitPhase: (2 * Math.PI * 2) / 7, orbitSpeed: 0.007, localRotX: 0.3, localRotY: 0.1, localRotZ: 0.5, localRotSpeedX: 0.008, localRotSpeedY: 0.012, localRotSpeedZ: 0.015, size: 28 },
      { letter: 'P', color: '#f43f5e', glowColor: 'rgba(244, 63, 94, 0.8)', baseOrbitRadius: 115, orbitPhase: (3 * Math.PI * 2) / 7, orbitSpeed: 0.007, localRotX: 0.5, localRotY: 0.3, localRotZ: 0.2, localRotSpeedX: 0.014, localRotSpeedY: 0.011, localRotSpeedZ: 0.009, size: 28 },
      { letter: 'L', color: '#6366f1', glowColor: 'rgba(99, 102, 241, 0.8)', baseOrbitRadius: 110, orbitPhase: (4 * Math.PI * 2) / 7, orbitSpeed: 0.007, localRotX: 0.4, localRotY: 0.2, localRotZ: 0.4, localRotSpeedX: 0.010, localRotSpeedY: 0.014, localRotSpeedZ: 0.011, size: 28 },
      { letter: 'A', color: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.8)', baseOrbitRadius: 105, orbitPhase: (5 * Math.PI * 2) / 7, orbitSpeed: 0.007, localRotX: 0.2, localRotY: 0.6, localRotZ: 0.3, localRotSpeedX: 0.013, localRotSpeedY: 0.009, localRotSpeedZ: 0.014, size: 28 },
      { letter: 'B', color: '#eab308', glowColor: 'rgba(234, 179, 8, 0.8)', baseOrbitRadius: 115, orbitPhase: (6 * Math.PI * 2) / 7, orbitSpeed: 0.007, localRotX: 0.1, localRotY: 0.3, localRotZ: 0.6, localRotSpeedX: 0.011, localRotSpeedY: 0.013, localRotSpeedZ: 0.010, size: 28 },
    ];

    // Background stars that dynamically warp with drag or general orbit speeds
    interface StarField {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
    }

    const stars: StarField[] = Array.from({ length: 65 }, () => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500,
      z: (Math.random() - 0.5) * 500,
      size: Math.random() * 1.5 + 0.8,
      color: Math.random() > 0.6 ? '#a855f7' : '#ec4899',
    }));

    // Standard local cube vertex template (drawn relative to the center of each float cubic)
    const localCubeVertices: Point3D[] = [
      { x: -1, y: -1, z: -1 },
      { x: 1, y: -1, z: -1 },
      { x: 1, y: 1, z: -1 },
      { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 },
      { x: 1, y: -1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: -1, y: 1, z: 1 },
    ];

    // 6 faces of each cubic, ordered for rendering
    const cubeFaces: CubeFace[] = [
      { indices: [0, 1, 2, 3], color: 'rgba(15, 6, 32, 0.35)' }, // Front
      { indices: [1, 5, 6, 2], color: 'rgba(15, 6, 32, 0.35)' }, // Right
      { indices: [5, 4, 7, 6], color: 'rgba(15, 6, 32, 0.35)' }, // Back
      { indices: [4, 0, 3, 7], color: 'rgba(15, 6, 32, 0.35)' }, // Left
      { indices: [4, 5, 1, 0], color: 'rgba(15, 6, 32, 0.35)' }, // Top
      { indices: [3, 2, 6, 7], color: 'rgba(15, 6, 32, 0.35)' }, // Bottom
    ];

    // Standard edges (12 edges for the outline grid wireframe)
    const cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // top
      [4, 5], [5, 6], [6, 7], [7, 4], // bottom
      [0, 4], [1, 5], [2, 6], [3, 7]  // vertical lines
    ];

    // Speed multiplier state driven by activeSpeed state variable
    let speedMultiplier = 1.0;

    // Standard 3D matrix operations
    const rotateX = (p: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: p.x,
        y: p.y * cos - p.z * sin,
        z: p.y * sin + p.z * cos,
      };
    };

    const rotateY = (p: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: p.x * cos + p.z * sin,
        y: p.y,
        z: -p.x * sin + p.z * cos,
      };
    };

    const rotateZ = (p: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: p.x * cos - p.y * sin,
        y: p.x * sin + p.y * cos,
        z: p.z,
      };
    };

    // Perform perspective projection from 3D space to 2D view screen
    const project = (p: Point3D) => {
      const fov = 380;
      const viewerDistance = 450;
      const scale = fov / (viewerDistance + p.z);
      return {
        x: p.x * scale + width / 2,
        y: p.y * scale + height / 2,
        z: p.z,
        scale: scale,
      };
    };

    let automaticOrbitAngle = 0;

    // Render logic loop
    const render = () => {
      // Semi-translucent sweep to clear the frame screen, boosting the magical 3D neon trail effects
      ctx.fillStyle = 'rgba(7, 3, 17, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Dynamically load speed multiplier values
      if (activeSpeed === 'fast') speedMultiplier = 2.4;
      else if (activeSpeed === 'hyper') speedMultiplier = 4.2;
      else speedMultiplier = 1.0;

      // Slowly increment general base space rotation angle over time
      automaticOrbitAngle += 0.003 * speedMultiplier;

      // Soft decay or spring bounce for drag interactions
      if (!isDraggingRef.current) {
        userRotationRef.current.y += 0.0012 * speedMultiplier;
        userRotationRef.current.x += (0.25 - userRotationRef.current.x) * 0.02; // elastic snapping focus base Y
      }

      // Draw starry galaxy coordinate space in the background
      stars.forEach((star) => {
        // Rotate star coordinates using the scene rotational angles
        let rStar = rotateX(star, userRotationRef.current.x);
        rStar = rotateY(rStar, userRotationRef.current.y + (automaticOrbitAngle * 0.2));
        
        const pt = project(rStar);
        
        // Depth-based fading transparency
        const opacity = Math.max(0.08, 0.5 - pt.z / 350);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, star.size * Math.max(0.5, pt.scale), 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Orbit centers of each letter space box
      interface RenderableCube {
        letter: string;
        color: string;
        glowColor: string;
        size: number;
        index: number;
        rotatedCenter: Point3D;
        projectedCenter: any;
        vertices: Point3D[];
        projectedVertices: any[];
      }

      const generatedCubes: RenderableCube[] = cubicNodes.map((node, i) => {
        // Orbit math
        const currentPhase = node.orbitPhase + (automaticOrbitAngle * 1.3);
        const heightWaver = Math.sin(currentPhase * 2) * 25; // elegant wave movement

        // Define base 3D coordinate of the orbiting cube center
        const orbitX = Math.cos(currentPhase) * node.baseOrbitRadius;
        const orbitZ = Math.sin(currentPhase) * node.baseOrbitRadius;
        const orbitY = heightWaver;

        // Apply global user interaction rot matrix transformation
        let rotatedCenter = { x: orbitX, y: orbitY, z: orbitZ };
        rotatedCenter = rotateX(rotatedCenter, userRotationRef.current.x);
        rotatedCenter = rotateY(rotatedCenter, userRotationRef.current.y);

        const projectedCenter = project(rotatedCenter);

        // Calculate and build custom local vertices of the floating cubic
        node.localRotX += node.localRotSpeedX * speedMultiplier;
        node.localRotY += node.localRotSpeedY * speedMultiplier;
        node.localRotZ += node.localRotSpeedZ * speedMultiplier;

        const verticesGlobal = localCubeVertices.map((v) => {
          // Scale local box vertices
          let lv = { x: v.x * node.size * 0.5, y: v.y * node.size * 0.5, z: v.z * node.size * 0.5 };
          
          // Rotate locally on its own speed
          lv = rotateX(lv, node.localRotX);
          lv = rotateY(lv, node.localRotY);
          lv = rotateZ(lv, node.localRotZ);

          // Position around global orbiting coordinates
          const gX = orbitX + lv.x;
          const gY = orbitY + lv.y;
          const gZ = orbitZ + lv.z;

          // Apply global scene rotation Matrix values
          let rotG = { x: gX, y: gY, z: gZ };
          rotG = rotateX(rotG, userRotationRef.current.x);
          rotG = rotateY(rotG, userRotationRef.current.y);
          return rotG;
        });

        const projectedVertices = verticesGlobal.map(v => project(v));

        return {
          letter: node.letter,
          color: node.color,
          glowColor: node.glowColor,
          size: node.size,
          index: i,
          rotatedCenter,
          projectedCenter,
          vertices: verticesGlobal,
          projectedVertices
        };
      });

      // Depth sorting! Sort our floating space cubics from back to front
      generatedCubes.sort((a, b) => b.rotatedCenter.z - a.rotatedCenter.z);

      // Draw depth-sorted cubics
      generatedCubes.forEach((cube) => {
        const pVertices = cube.projectedVertices;

        // 1. Draw solid translucent glass faces first to prevent grid overlap artifacts
        cubeFaces.forEach((face) => {
          ctx.beginPath();
          face.indices.forEach((index, i) => {
            const pt = pVertices[index];
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();
          // Face opacity changes dynamically according to distance
          const depthAlpha = Math.max(0.04, 0.15 - cube.rotatedCenter.z / 350);
          ctx.fillStyle = `rgba(15, 6, 32, ${depthAlpha})`;
          ctx.fill();
        });

        // 2. Draw wireframe cubic edge pipelines with gorgeous neon gradient styles
        cubeEdges.forEach(([idxA, idxB]) => {
          const ptA = pVertices[idxA];
          const ptB = pVertices[idxB];
          if (!ptA || !ptB) return;

          const edgeGradient = ctx.createLinearGradient(ptA.x, ptA.y, ptB.x, ptB.y);
          edgeGradient.addColorStop(0, cube.color);
          edgeGradient.addColorStop(1, 'rgba(81, 15, 145, 0.3)');

          ctx.beginPath();
          ctx.moveTo(ptA.x, ptA.y);
          ctx.lineTo(ptB.x, ptB.y);
          ctx.strokeStyle = edgeGradient;
          ctx.lineWidth = 1.3 * ptA.scale;
          ctx.stroke();
        });

        // 3. Draw vertex node connection pins
        pVertices.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.0 * pt.scale, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });

        // 4. Draw high-tech center holographic letters mapping "L-O-O-P-L-A-B" inside each cube block
        const pCenter = cube.projectedCenter;
        
        // Depth-based font scale calculations
        const computedFontSize = Math.round(20 * pCenter.scale);
        
        ctx.save();
        ctx.font = `black ${computedFontSize}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Beautiful ambient shadow glow behind letters
        ctx.shadowBlur = 15;
        ctx.shadowColor = cube.glowColor;
        
        // Slightly wobble letter for extra life!
        const letterWobble = Math.sin(automaticOrbitAngle * 4 + cube.index) * 1.5;
        ctx.fillText(cube.letter, pCenter.x, pCenter.y + letterWobble);
        
        ctx.restore();

        // 5. Draw connecting energy link between closer cubes to denote LoopLab's "Loop" concept!
        // We can draw a subtle orbital particle trajectory line
        ctx.beginPath();
        ctx.arc(pCenter.x, pCenter.y, cube.size * 0.9 * pCenter.scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 92, 246, 0.08)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 6. Cybernetic status orbital tracking details overlaid at the bottom-right corner of canvas
      ctx.fillStyle = 'rgba(168, 85, 247, 0.55)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`SPACE_ROT_X: ${userRotationRef.current.x.toFixed(2)}`, 15, height - 30);
      ctx.fillText(`SPACE_ROT_Y: ${userRotationRef.current.y.toFixed(2)}`, 15, height - 18);
      ctx.fillText(`ORBIT_VEL: ${(0.007 * speedMultiplier).toFixed(3)} RAD/F`, 15, height - 6);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUpOrLeave);
      canvas.removeEventListener('mouseleave', handleMouseUpOrLeave);

      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleMouseUpOrLeave);
    };
  }, [activeSpeed]);

  return (
    <div className="relative w-full rounded-3xl bg-[#090412] border border-purple-500/15 overflow-hidden shadow-2xl backdrop-blur-3xl pt-10 pb-12 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
      {/* 3D backlighting glow layers representing soft volumetric rays */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      
      {/* Micro tech aesthetic background grid texture lines */}
      <div className="absolute inset-0 bg-[#090412] opacity-[0.22] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* LEFT: Text & Meta Content Column */}
      <motion.div 
        initial={{ opacity: 0, x: -35 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        className="flex-1 space-y-6 relative z-10 text-left"
      >
        {/* Sleek pill shape tag for events and bulletins */}
        <span className="inline-flex items-center gap-2 text-[9px] font-mono tracking-widest text-[#9d4edd] bg-purple-950/50 border border-purple-500/30 px-3 py-1.5 rounded-full shadow-lg pointer-events-none antialiased">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span className="font-extrabold uppercase select-none">3D FLOATING CUBICS SIMULATION ACTIVE</span>
        </span>

        {/* Master Logo Typography in bold sans-serif gradient */}
        <div className="space-y-1">
          <h1 className="text-5xl md:text-7xl font-sans tracking-tighter leading-none font-black text-white antialiased">
            LOOP<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 filter drop-shadow-[0_0_15px_rgba(157,78,221,0.25)]">LAB</span>
          </h1>
          <p className="text-xs md:text-sm font-mono tracking-[0.18em] text-indigo-300 font-extrabold antialiased mt-3">
            STIMULATING NEXT-GEN ENTERPRISE EXECUTION
          </p>
        </div>

        {/* Cinematic explanatory paragraph */}
        <p className="text-purple-200/80 text-xs sm:text-sm md:text-base leading-relaxed antialiased font-medium max-w-xl">
          Empowering university minds through production-scale engineering laboratories, interactive 3D virtual spaces, hackathons, and exclusive technical co-lead placements. Rotate the orbit or toggle speeds to explore.
        </p>

        {/* Interactive velocity controllers */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
            <Rotate3d className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>Interactive 3D Warp Controller:</span>
          </label>
          <div className="flex gap-2">
            {[
              { id: 'normal', label: '1.0x Realtime', color: 'hover:border-purple-500 text-purple-300' },
              { id: 'fast', label: '2.4x Speed-up', color: 'hover:border-pink-500 text-pink-300' },
              { id: 'hyper', label: '4.2x Hyperdrive', color: 'hover:border-yellow-500 text-yellow-300' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActiveSpeed(btn.id as any)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeSpeed === btn.id
                    ? 'bg-purple-600 border-purple-400 text-white font-bold shadow-lg shadow-purple-900/30'
                    : `bg-[#0f071a]/80 border-purple-950 ${btn.color}`
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status indicator console line row */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/10 rounded-xl px-2.5 py-1.5 font-mono text-[9px] text-purple-300 shadow-inner">
            <Cpu className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>CORE: LOOP_CUBICS_V4</span>
          </div>
          <div className="flex items-center gap-2 bg-pink-950/30 border border-pink-500/10 rounded-xl px-2.5 py-1.5 font-mono text-[9px] text-pink-300 shadow-inner">
            <Network className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>ORBIT: L-O-O-P-L-A-B</span>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-950/30 border border-indigo-500/10 rounded-xl px-2.5 py-1.5 font-mono text-[9px] text-indigo-300 shadow-inner">
            <Star className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            <span>DRAG CAM ROTATION RE-ACTIVATED</span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT: Real-time Interactive 3D Canvas Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.35 }}
        className="w-full md:w-[420px] h-[400px] md:h-[420px] flex items-center justify-center relative shrink-0 cursor-grab active:cursor-grabbing select-none"
      >
        {/* Holographic glowing ring encircling raw canvas container */}
        <div className={`absolute inset-4 rounded-full border border-purple-500/10 bg-gradient-to-tr from-purple-500/5 to-transparent filter blur-sm transition-all duration-700 ${isHovered ? 'scale-110 rotate-45 border-purple-500/20' : ''}`}></div>
        
        {/* Interactive instructions tooltip */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase text-purple-400/70 tracking-widest pointer-events-none z-20 text-center">
          {isDraggingState ? 'DRAGGING 3D PERSPECTIVE' : 'CLICK & DRAG TO SWIVEL ORBIT'}
        </span>

        {/* HTML Canvas component for real-time stereographical 3D projection */}
        <canvas 
          ref={canvasRef} 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative z-10 w-full h-full rounded-2xl block drop-shadow-[0_0_30px_rgba(236,72,153,0.12)] border border-purple-500/5"
        />
        
        {/* Volume lighting glowing aura directly behind core canvas element */}
        <div className="absolute inset-20 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full filter blur-[45px] animate-pulse pointer-events-none z-0"></div>
      </motion.div>
    </div>
  );
}

