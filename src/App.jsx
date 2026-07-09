import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Activity, Heart, X, ChevronRight, ChevronLeft } from 'lucide-react';
import './index.css';

const FOCUS_TIME = 12 * 60;

// Web Audio API Helper
let audioCtx = null;
const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

const playSound = (type, volumeEnabled) => {
  if (!volumeEnabled) return;
  initAudio();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'chime') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(261.63, audioCtx.currentTime + 2.5);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 2.5);
  } else if (type === 'tick') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } else if (type === 'magic') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }
};

const Particles = ({ theme }) => {
  const particles = Array.from({ length: 40 });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.8 + 0.2,
            opacity: Math.random() * 0.4 + 0.1
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: theme.colors[i % 3],
            boxShadow: `0 0 10px ${theme.colors[i % 3]}`
          }}
        />
      ))}
    </div>
  );
};

const BurstParticles = ({ trigger, colors }) => {
  if (!trigger) return null;
  const particles = Array.from({ length: 30 });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {particles.map((_, i) => (
        <motion.div
          key={`burst-${i}-${Date.now()}`}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ 
            x: (Math.random() - 0.5) * 600, 
            y: (Math.random() - 0.5) * 600,
            scale: Math.random() * 2 + 1,
            opacity: 0
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: colors[i % 3],
            boxShadow: `0 0 20px ${colors[i % 3]}`
          }}
        />
      ))}
    </div>
  );
};

const themes = [
  { name: 'Aurora', colors: ['#38bdf8', '#818cf8', '#e879f9'] },
  { name: 'Ocean', colors: ['#34d399', '#3b82f6', '#8b5cf6'] },
  { name: 'Sunset', colors: ['#fbbf24', '#f87171', '#db2777'] },
  { name: 'Sakura', colors: ['#a78bfa', '#c084fc', '#f472b6'] },
  { name: 'Forest', colors: ['#a3e635', '#22c55e', '#14b8a6'] }
];

const groundingSteps = [
  {
    title: "Check in with your body",
    desc: "Let your shoulders drop down. Unclench your jaw. Take a slow, deep breath, feeling the air fill your chest, and release it gently."
  },
  {
    title: "Ground your senses",
    desc: "Look around you. Notice three colors you can see, and feel the solid weight of the chair or floor supporting you right now."
  },
  {
    title: "Acknowledge yourself",
    desc: "Speak kindly to yourself. Remind yourself: 'It is okay to feel overwhelmed, isolated, or anxious right now. I am here, and I am doing my best.'"
  },
  {
    title: "Reach out to the world",
    desc: "No app can replace human connection. If you are feeling lonely, consider sending a brief text to a friend, family member, or checking in with a professional support group. Real connection helps."
  }
];

export default function App() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const [themeIndex, setThemeIndex] = useState(0);
  const [burst, setBurst] = useState(false);
  const theme = themes[themeIndex];

  // Grounding Tool State
  const [showGrounding, setShowGrounding] = useState(false);
  const [groundingIndex, setGroundingIndex] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time - 1 === 0) playSound('chime', soundEnabled);
          else playSound('tick', soundEnabled);
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, soundEnabled]);

  const toggleTimer = () => {
    playSound('click', soundEnabled);
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    playSound('click', soundEnabled);
    setIsActive(false);
    setTimeLeft(FOCUS_TIME);
  };

  const toggleSound = () => {
    playSound('click', !soundEnabled);
    setSoundEnabled(!soundEnabled);
  };

  const changeTheme = (e) => {
    e.stopPropagation();
    playSound('magic', soundEnabled);
    setThemeIndex((prev) => (prev + 1) % themes.length);
    setBurst(true);
    setTimeout(() => setBurst(false), 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / FOCUS_TIME;
  const strokeLength = 1131; 

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#09090b', overflow: 'hidden' }}>
      
      {/* Interactive Cursor Light */}
      <motion.div 
        animate={{ x: mousePos.x - 300, y: mousePos.y - 300 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '600px', height: '600px', background: `radial-gradient(circle, ${theme.colors[0]}15 0%, transparent 60%)`, pointerEvents: 'none', borderRadius: '50%' }}
      />

      <Particles theme={theme} />
      <BurstParticles trigger={burst} colors={theme.colors} />

      {/* Ambient Orbs */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '5%', left: '15%', width: '40vw', height: '40vw', borderRadius: '50%', background: `radial-gradient(circle, ${theme.colors[0]}40, transparent)`, filter: 'blur(100px)' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 20, repeat: Infinity, delay: 2, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '5%', right: '15%', width: '45vw', height: '45vw', borderRadius: '50%', background: `radial-gradient(circle, ${theme.colors[2]}40, transparent)`, filter: 'blur(120px)' }} />
      </div>

      {/* Utilities Bar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ position: 'absolute', top: '40px', display: 'flex', gap: '20px', zIndex: 20 }}
      >
        <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }} onClick={toggleSound} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)', outline: 'none' }}>
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </motion.button>
        
        <motion.button whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.95 }} onClick={() => { playSound('click', soundEnabled); setTimeLeft(FOCUS_TIME); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '30px', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)', display: 'flex', gap: '10px', alignItems: 'center', outline: 'none' }}>
          <Activity size={18} /> Deep Focus
        </motion.button>

        <motion.button whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.95 }} onClick={() => { playSound('click', soundEnabled); setShowGrounding(true); setGroundingIndex(0); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '30px', color: '#f43f5e', cursor: 'pointer', backdropFilter: 'blur(10px)', display: 'flex', gap: '10px', alignItems: 'center', outline: 'none' }}>
          <Heart size={18} fill="#f43f5e" /> Grounding Check-in
        </motion.button>
      </motion.div>

      {/* Main Focus Ring */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ position: 'relative', width: '400px', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
          onClick={toggleTimer}
        >
          <svg width="400" height="400" viewBox="0 0 400 400" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
            <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
            <motion.circle 
              cx="200" cy="200" r="180" 
              fill="none" 
              stroke="url(#gradientMain)" 
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeLength}
              animate={{ strokeDashoffset: strokeLength - (progress * strokeLength) }}
              transition={{ duration: 1, ease: "linear" }}
              style={{ filter: `drop-shadow(0 0 15px ${theme.colors[2]}80)` }}
            />
            <defs>
              <linearGradient id="gradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.colors[0]} />
                <stop offset="50%" stopColor={theme.colors[1]} />
                <stop offset="100%" stopColor={theme.colors[2]} />
              </linearGradient>
            </defs>
          </svg>

          {/* Time Counter */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={timeLeft}
              initial={{ y: 15, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -15, opacity: 0, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ fontSize: '6.5rem', fontWeight: 200, letterSpacing: '6px', color: '#ffffff', textShadow: '0 0 30px rgba(255,255,255,0.3)', position: 'absolute' }}
            >
              {formatTime(timeLeft)}
            </motion.div>
          </AnimatePresence>
          
          {/* Inner Breathing Ring */}
          {isActive && (
            <motion.div 
              animate={{ scale: [1, 1.15, 1], opacity: [0, 0.15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 30, border: `2px solid ${theme.colors[1]}`, borderRadius: '50%', pointerEvents: 'none' }}
            />
          )}
        </motion.div>

        {/* Floating Controls */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          style={{ marginTop: '70px', display: 'flex', gap: '35px', alignItems: 'center' }}
        >
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)', rotate: -20 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); resetTimer(); }}
            style={{ width: '65px', height: '65px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)', outline: 'none' }}
          >
            <RotateCcw size={26} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${theme.colors[1]}b3` }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
            style={{ width: '96px', height: '96px', borderRadius: '50%', border: 'none', background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[2]})`, color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', outline: 'none', boxShadow: `0 10px 30px ${theme.colors[2]}66`, position: 'relative', overflow: 'hidden' }}
          >
            {isActive ? <Pause size={44} /> : <Play size={44} style={{ marginLeft: '6px' }} />}
            
            <motion.div 
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 60%)', pointerEvents: 'none' }}
            />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)', rotate: 20 }}
            whileTap={{ scale: 0.9 }}
            onClick={changeTheme}
            style={{ width: '65px', height: '65px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)', outline: 'none' }}
          >
            <Sparkles size={26} />
          </motion.button>
        </motion.div>
        
        {/* Helper State Text */}
        <motion.div style={{ marginTop: '50px', height: '30px' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={isActive ? 'active' : 'inactive'}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', fontWeight: 300, letterSpacing: '3px' }}
            >
              {isActive ? "Breathe in. Breathe out." : "Take control. Start when ready."}
            </motion.p>
          </AnimatePresence>
        </motion.div>
        
        {/* Theme indicator */}
        <motion.div style={{ marginTop: '20px', height: '20px' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={theme.name}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                style={{ fontSize: '0.85rem', color: theme.colors[0], fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}
              >
                {theme.name} Theme
              </motion.span>
            </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Grounding Check-in Modal Overlay */}
      <AnimatePresence>
        {showGrounding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(9, 9, 11, 0.85)', backdropFilter: 'blur(12px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'rgba(24, 24, 27, 0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '40px', borderRadius: '24px', maxWidth: '500px', width: '100%', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              {/* Close Button */}
              <motion.button 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => { playSound('click', soundEnabled); setShowGrounding(false); }} 
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', outline: 'none' }}
              >
                <X size={24} />
              </motion.button>

              {/* Progress Indicator */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
                {groundingSteps.map((_, i) => (
                  <div 
                    key={i} 
                    style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= groundingIndex ? theme.colors[0] : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} 
                  />
                ))}
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={groundingIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{ minHeight: '180px' }}
                >
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'white', marginBottom: '15px' }}>
                    {groundingSteps[groundingIndex].title}
                  </h3>
                  <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 300 }}>
                    {groundingSteps[groundingIndex].desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', alignItems: 'center' }}>
                <motion.button
                  disabled={groundingIndex === 0}
                  whileHover={{ scale: groundingIndex === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: groundingIndex === 0 ? 1 : 0.95 }}
                  onClick={() => { playSound('click', soundEnabled); setGroundingIndex(prev => prev - 1); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: groundingIndex === 0 ? 'rgba(255,255,255,0.2)' : 'white', cursor: groundingIndex === 0 ? 'default' : 'pointer', outline: 'none', fontSize: '1rem' }}
                >
                  <ChevronLeft size={20} /> Back
                </motion.button>

                {groundingIndex < groundingSteps.length - 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${theme.colors[0]}80` }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playSound('click', soundEnabled); setGroundingIndex(prev => prev + 1); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`, border: 'none', padding: '12px 24px', borderRadius: '30px', color: 'white', cursor: 'pointer', outline: 'none', fontSize: '1rem', fontWeight: 600 }}
                  >
                    Continue <ChevronRight size={20} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${theme.colors[1]}80` }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playSound('click', soundEnabled); setShowGrounding(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${theme.colors[1]}, ${theme.colors[2]})`, border: 'none', padding: '12px 24px', borderRadius: '30px', color: 'white', cursor: 'pointer', outline: 'none', fontSize: '1rem', fontWeight: 600 }}
                  >
                    Finish Check-in
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
