import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Zap, RefreshCw, Cpu, HelpCircle, Compass } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onViewProductSlug: (slug: string) => void;
}

const CONFIGURATIONS = [
  {
    angle: 'Lateral Side',
    rotateX: 10,
    rotateY: -25,
    rotateZ: -5,
    scale: 1.1,
  },
  {
    angle: 'Top Down Scan',
    rotateX: 55,
    rotateY: 0,
    rotateZ: 45,
    scale: 0.95,
  },
  {
    angle: 'Heel Vector',
    rotateX: -5,
    rotateY: 135,
    rotateZ: 10,
    scale: 1.15,
  },
  {
    angle: 'Ankle Profile',
    rotateX: 15,
    rotateY: -90,
    rotateZ: 0,
    scale: 1.05,
  },
];

const LIGHTS = [
  { name: 'Aurora Cyan', color: '#00E5FF', glow: 'rgba(0, 229, 255, 0.45)', shadow: 'shadow-cyber-cyan/30' },
  { name: 'Solar Flare', color: '#FF6B00', glow: 'rgba(255, 107, 0, 0.45)', shadow: 'shadow-cyber-orange/30' },
  { name: 'Hyper Violet', color: '#7C3AED', glow: 'rgba(124, 58, 237, 0.45)', shadow: 'shadow-cyber-purple/30' },
  { name: 'Monochrome Luxe', color: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.35)', shadow: 'shadow-white/20' },
];

export default function HeroSection({ onExploreClick, onViewProductSlug }: HeroSectionProps) {
  const [activeAngle, setActiveAngle] = useState(0);
  const [activeLight, setActiveLight] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  // Sparkle / particles background
  const particles = Array.from({ length: 28 });

  const currentConfig = CONFIGURATIONS[activeAngle];
  const currentLight = LIGHTS[activeLight];

  return (
    <div className="relative w-full min-h-[92vh] flex flex-col justify-center items-center overflow-hidden rounded-[32px] border border-white/5 bg-black px-6 sm:px-12 py-16 sm:py-24 mb-16 premium-mesh-bg" id="cinematic-hero">
      
      {/* Absolute Dynamic Spotlight & Glow Backdrop */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] rounded-full filter blur-[150px] opacity-25 transition-all duration-1000 -z-10"
        style={{
          background: `radial-gradient(circle, ${currentLight.color} 0%, rgba(0,0,0,0) 70%)`
        }}
      />

      {/* Extreme Fine Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 -z-10" />

      {/* Particle Embers System */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              backgroundColor: currentLight.color,
              boxShadow: `0 0 10px ${currentLight.color}`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
            animate={{
              y: [0, -100 - Math.random() * 150],
              x: [0, (Math.random() - 0.5) * 60],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * -15,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Presentation & Editorial Layout */}
        <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
          
          {/* Tagline Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest text-zinc-400 uppercase select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            VIRTUAL METAVERSE AUTOMOTIVE GRADES
          </motion.div>

          {/* Epic Title Block */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display font-black text-5xl sm:text-7xl xl:text-8xl tracking-tight text-white uppercase leading-[0.9] text-luxury-text-gradient select-none"
            >
              MINTED <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-[#00E5FF]">
                ULTRA
              </span> LUXE
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto lg:mx-0 leading-relaxed font-sans"
            >
              Constructed like a high-end luxury vehicle. Merging custom fluid polymers, smart responsive led meshes, and active holographic cushioning details directly under your command.
            </motion.p>
          </div>

          {/* Action Callouts */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-zinc-200 text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(255,255,255,0.1)] hover:scale-105"
            >
              Explore Catalog
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
            
            <button
              onClick={() => onViewProductSlug('aether-revelation-x1')}
              className="w-full sm:w-auto px-8 py-4 bg-zinc-950 border border-white/10 hover:border-white/20 text-white text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 hover:bg-zinc-900/40"
            >
              Launch Configurator
            </button>
          </motion.div>

          {/* Digital Metrics Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 max-w-md mx-auto lg:mx-0 text-left font-mono"
          >
            <div>
              <span className="block text-2xl font-bold text-white tracking-tight">320G</span>
              <span className="block text-[9px] uppercase tracking-widest text-[#00E5FF] font-semibold">TENSION MESH</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-white tracking-tight">0.02S</span>
              <span className="block text-[9px] uppercase tracking-widest text-violet-400 font-semibold">RESPONSE LATENCY</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-white tracking-tight">LIMITED</span>
              <span className="block text-[9px] uppercase tracking-widest text-orange-400 font-semibold">MINT EDITIONS</span>
            </div>
          </motion.div>

        </div>

        {/* Right Interactive Configurator Stage */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center relative">
          
          {/* Aesthetic Ring Target Halo */}
          <div className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full border border-white/5 opacity-50 flex items-center justify-center -z-10">
            <div className="w-[180px] sm:w-[320px] h-[180px] sm:h-[320px] rounded-full border border-dashed border-white/10 animate-slow-spin" />
          </div>

          {/* Massive Floating 3D/Angle Sneaker Image Presentation */}
          <motion.div
            animate={{
              rotateX: currentConfig.rotateX,
              rotateY: currentConfig.rotateY,
              rotateZ: currentConfig.rotateZ,
              scale: currentConfig.scale,
              y: [0, -8, 0],
            }}
            transition={{
              rotateX: { type: 'spring', stiffness: 50, damping: 15 },
              rotateY: { type: 'spring', stiffness: 50, damping: 15 },
              rotateZ: { type: 'spring', stiffness: 50, damping: 15 },
              scale: { type: 'spring', stiffness: 60, damping: 15 },
              y: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
            }}
            className="w-full max-w-[420px] sm:max-w-[550px] aspect-square flex items-center justify-center cursor-pointer select-none drop-shadow-[0_35px_35px_rgba(0,0,0,0.8)]"
            style={{
              filter: `drop-shadow(0 0 100px ${currentLight.glow})`,
              transformStyle: 'preserve-3d',
              perspective: 1200,
            }}
          >
            {/* Superimposed futuristic geometric graphic overlays */}
            <div className="absolute bottom-10 left-10 font-mono text-[8px] text-zinc-500 uppercase tracking-widest space-y-1 pointer-events-none hidden sm:block">
              <p className="flex items-center gap-2 text-zinc-400">
                <Cpu className="w-3 h-3 text-[#00E5FF]" /> SYSTEM: NOMINAL_GRID
              </p>
              <p>PERSPECTIVE INDEX: {currentConfig.angle}</p>
              <p>CHASSIS RATINGS: A-5 LEVEL</p>
            </div>

            <img
              src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&auto=format&fit=crop&q=80"
              alt="Elite Luxury Sneaker"
              className="w-full h-auto object-contain select-none"
              draggable="false"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Interactive Configurations HUD overlay controllers */}
          <div className="w-full flex flex-col sm:flex-row gap-6 mt-1.5 justify-between items-center bg-zinc-950/65 border border-white/5 backdrop-blur-md p-4 rounded-3xl max-w-xl">
            
            {/* Angle Select */}
            <div className="space-y-1.5 w-full sm:w-auto">
              <span className="block font-mono text-[8px] tracking-widest text-[#00E5FF] font-bold uppercase text-center sm:text-left">
                PERSPECTIVE CAMERA VECTORS
              </span>
              <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                {CONFIGURATIONS.map((cfg, idx) => (
                  <button
                    key={cfg.angle}
                    onClick={() => setActiveAngle(idx)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-wider transition-all uppercase ${
                      activeAngle === idx
                        ? 'bg-white text-black font-bold shadow'
                        : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cfg.angle.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Light Select */}
            <div className="space-y-1.5 w-full sm:w-auto text-center sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-white/5">
              <span className="block font-mono text-[8px] tracking-widest text-violet-400 font-bold uppercase">
                ATMOSPHERIC FLOOD LIGHTS
              </span>
              <div className="flex gap-2 justify-center sm:justify-end mt-1.5">
                {LIGHTS.map((col, idx) => (
                  <button
                    key={col.name}
                    title={col.name}
                    onClick={() => setActiveLight(idx)}
                    className={`w-6 h-6 rounded-full border transition-all relative flex items-center justify-center ${
                      activeLight === idx
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                        : 'border-white/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.color }}
                  >
                    {activeLight === idx && (
                      <span className="w-1.5 h-1.5 bg-black rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
