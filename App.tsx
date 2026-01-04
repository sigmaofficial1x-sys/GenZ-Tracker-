
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, Brain, CheckCircle2, Circle, Quote, Heart, Sparkles, Settings, 
  ChevronLeft, ChevronRight, User, UserCheck, Calendar, Camera, Trophy, ListTodo, AlertCircle, StickyNote
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { THEMES, MONTH_NAMES, INITIAL_HABITS, INITIAL_RULES } from './constants';
import { AppState, AvatarType, AvatarGender, Problem } from './types';

const playSatisfyingTone = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    playNote(523.25, ctx.currentTime, 0.4);
    playNote(659.25, ctx.currentTime + 0.08, 0.4);
    playNote(783.99, ctx.currentTime + 0.15, 0.4);
  } catch (e) {}
};

const WeatherOverlay: React.FC<{ type: 'stars' | 'snow' | 'sun' }> = ({ type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: any[] = [];
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.4 + 0.1
      }));
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.speed;
        if (p.y > canvas.height) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    init(); animate();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, [type]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

const InteractiveAvatar: React.FC<{ 
  type: AvatarType; 
  mood: 'normal' | 'happy' | 'success'; 
  customUrl?: string;
}> = ({ type, mood, customUrl }) => {
  return (
    <div className={`relative transition-all duration-500 transform ${mood === 'success' ? 'scale-110 -translate-y-4' : 'hover:scale-105'}`}>
      <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-2xl border-2 border-white/30 shadow-2xl flex items-center justify-center relative overflow-hidden`}>
        {customUrl ? (
          <img src={customUrl} alt="Custom Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="text-8xl select-none">{type}</div>
        )}
        {(mood === 'success') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart size={48} className="text-red-500 animate-ping absolute -top-10" />
            <Sparkles size={36} className="text-yellow-400 absolute -right-6 -bottom-6 animate-bounce" />
          </div>
        )}
      </div>
    </div>
  );
};

const AVATAR_POOL: Record<AvatarGender, string[]> = {
  masculine: ['👨', '🧔', '🧑‍🚀', '🤵', '👨‍🏫', '👨‍💻', '🥷', '🧑‍🎨', '👨‍🚒'],
  feminine: ['👩', '👱‍♀️', '👩‍🚀', '👰', '👩‍🏫', '👩‍💻', '🧛‍♀️', '🧑‍🔬', '👩‍🎨'],
  neutral: ['🐧', '🐺', '🐱', '🦊', '🐼', '🐨', '🤖', '👽', '🦄']
};

const App: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [avatarMood, setAvatarMood] = useState<'normal' | 'happy' | 'success'>('normal');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('cosmic_v9_state');
    if (saved) return JSON.parse(saved);
    return {
      userName: 'Cosmic Explorer',
      habits: INITIAL_HABITS,
      rules: INITIAL_RULES,
      problems: [],
      data: {},
      theme: 'northernLights',
      notes: '',
      avatarType: '🧑‍🚀',
      avatarGender: 'neutral',
      tip: 'Small steps, cosmic results. The universe rewards consistency.',
      globalScale: 1,
      panelSizes: { sidebar: 1, mainGrid: 1, stats: 1 }
    };
  });

  useEffect(() => { localStorage.setItem('cosmic_v9_state', JSON.stringify(state)); }, [state]);

  const activeTheme = useMemo(() => THEMES[state.theme] || THEMES.northernLights, [state.theme]);
  const monthKey = `${currentYear}-${currentMonth}`;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthData = useMemo(() => {
    if (!state.data[monthKey]) return Array(state.habits.length).fill(null).map(() => Array(daysInMonth).fill(false));
    return state.data[monthKey];
  }, [state.data, monthKey, state.habits.length, daysInMonth]);

  const toggleHabit = (hIdx: number, dIdx: number) => {
    const isNowDone = !monthData[hIdx][dIdx];
    if (isNowDone) {
      playSatisfyingTone();
      setAvatarMood('success');
      setTimeout(() => setAvatarMood('normal'), 1200);
    }
    
    setState(prev => {
      const current = prev.data[monthKey] || Array(prev.habits.length).fill(null).map(() => Array(daysInMonth).fill(false));
      const next = [...current];
      next[hIdx] = [...next[hIdx]];
      next[hIdx][dIdx] = isNowDone;
      return { ...prev, data: { ...prev.data, [monthKey]: next } };
    });
  };

  const dailyProgress = useMemo(() => 
    Array.from({ length: daysInMonth }).map((_, dIdx) => ({
      day: dIdx + 1,
      val: (monthData.filter(r => r[dIdx]).length / (state.habits.length || 1)) * 100
    }))
  , [monthData, state.habits, daysInMonth]);

  const topHabits = useMemo(() => {
    return state.habits.map((h, i) => {
      const completed = monthData[i]?.filter(Boolean).length || 0;
      const pct = Math.round((completed / daysInMonth) * 100);
      return { name: h, pct };
    }).sort((a, b) => b.pct - a.pct).slice(0, 5);
  }, [state.habits, monthData, daysInMonth]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(p => ({ ...p, customAvatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor: activeTheme.bgMain, 
        color: activeTheme.textPrimary, 
        fontFamily: activeTheme.font 
      }} 
      className="min-h-screen flex flex-col items-center transition-all duration-700 relative p-4 lg:p-10"
    >
      <WeatherOverlay type={activeTheme.weather} />

      {/* Global Header */}
      <header className="w-full max-w-7xl z-10 flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-3xl bg-white/10 shadow-inner">
            <Sparkles size={32} style={{ color: activeTheme.accent1 }} />
          </div>
          <input 
            className="text-3xl md:text-4xl font-black italic tracking-tighter bg-transparent border-none outline-none focus:ring-0 w-full md:w-auto hover:opacity-80 transition-opacity"
            value={state.userName}
            onChange={e => setState(p => ({ ...p, userName: e.target.value }))}
            placeholder="Explorer Name..."
          />
        </div>

        <div className="flex items-center gap-4 bg-black/20 p-2 rounded-3xl">
          <button onClick={() => setCurrentMonth(m => (m === 0 ? 11 : m - 1))} className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110"><ChevronLeft /></button>
          <div className="flex flex-col items-center min-w-[160px]">
            <span className="text-[10px] uppercase font-black opacity-30 tracking-[0.3em]">Temporal Cycle</span>
            <div className="text-2xl font-black italic">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </div>
          </div>
          <button onClick={() => setCurrentMonth(m => (m === 11 ? 0 : m + 1))} className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110"><ChevronRight /></button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Calendar size={28} className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-full mt-4 hidden group-hover:block bg-gray-900/95 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 z-50 shadow-2xl min-w-[120px]">
              <div className="flex flex-col gap-3">
                {[2024, 2025, 2026, 2027].map(y => (
                  <button key={y} onClick={() => setCurrentYear(y)} className={`px-6 py-2 rounded-xl font-bold transition-all ${currentYear === y ? 'bg-white/20 text-white' : 'hover:bg-white/10 opacity-60'}`}>{y}</button>
                ))}
              </div>
            </div>
          </div>
          <select 
            value={state.theme} 
            onChange={e => setState(p => ({ ...p, theme: e.target.value }))}
            className="bg-white/10 border border-white/20 px-6 py-3 rounded-2xl text-xs font-black uppercase outline-none focus:ring-0 cursor-pointer hover:bg-white/20 transition-all"
            style={{ color: activeTheme.accent1 }}
          >
            {Object.keys(THEMES).map(t => <option key={t} value={t} className="bg-gray-900 text-white">{THEMES[t].name}</option>)}
          </select>
        </div>
      </header>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_360px] gap-8 relative z-10">
        
        {/* LEFT COLUMN: Identity & Foundation */}
        <aside className="flex flex-col gap-8">
          {/* Avatar Box Redesign */}
          <div className="p-8 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center group relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl opacity-20" />
            
            <InteractiveAvatar type={state.avatarType} mood={avatarMood} customUrl={state.customAvatarUrl} />
            
            <div className="mt-8 w-full space-y-6">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1">Cosmic Essence</span>
                <div className="flex gap-4 p-1 bg-black/30 rounded-2xl">
                  {(['masculine', 'feminine', 'neutral'] as AvatarGender[]).map(g => (
                    <button 
                      key={g} 
                      onClick={() => setState(p => ({ ...p, avatarGender: g, customAvatarUrl: undefined }))}
                      className={`p-3 rounded-xl transition-all ${state.avatarGender === g ? 'bg-white/20 shadow-lg' : 'opacity-30 hover:opacity-60'}`}
                      title={g}
                    >
                      {g === 'masculine' ? <User size={20}/> : g === 'feminine' ? <UserCheck size={20}/> : <Sparkles size={20}/>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-2">
                {AVATAR_POOL[state.avatarGender].map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => setState(p => ({ ...p, avatarType: emoji, customAvatarUrl: undefined }))}
                    className={`text-3xl p-2 rounded-2xl transition-all ${state.avatarType === emoji && !state.customAvatarUrl ? 'bg-white/20 scale-110' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <Camera size={20} className="group-hover:text-blue-400 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest">Upload Custom</span>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
              </button>
            </div>
          </div>

          {/* Rules Box */}
          <div className="p-8 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl group">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3" style={{ color: activeTheme.accent2 }}>
              <Brain size={20}/> Core Principles
            </h4>
            <div className="flex flex-col gap-6">
              {state.rules.map((rule, idx) => (
                <div key={idx} className="flex group/item items-start gap-4">
                  <div className="mt-1.5 w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: activeTheme.accent1 }} />
                  <input 
                    className="bg-transparent border-none outline-none font-bold text-xs flex-1 focus:text-white transition-colors"
                    value={rule}
                    onChange={e => setState(p => ({ ...p, rules: p.rules.map((r, i) => i === idx ? e.target.value : r) }))}
                  />
                  <button onClick={() => setState(p => ({ ...p, rules: p.rules.filter((_, i) => i !== idx) }))} className="opacity-0 group-hover/item:opacity-40 hover:opacity-100 transition-all text-red-400"><Trash2 size={14}/></button>
                </div>
              ))}
              <button 
                onClick={() => setState(p => ({ ...p, rules: [...p.rules, 'New Fundamental Rule'] }))} 
                className="text-[10px] font-black uppercase opacity-20 hover:opacity-100 mt-2 flex items-center gap-2 transition-all"
              >
                <Plus size={14} /> Add Principle
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: The Habit Engine */}
        <main className="flex flex-col gap-8">
          {/* Main Analytics Graph */}
          <div className="p-8 rounded-[4rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl h-72 relative flex items-end overflow-hidden group">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyProgress}>
                <defs>
                  <linearGradient id="vectorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTheme.accent1} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={activeTheme.accent1} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke={activeTheme.accent1} strokeWidth={8} fill="url(#vectorGrad)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="absolute top-12 left-12 group-hover:scale-105 transition-transform duration-700">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 block mb-2">Consistency Vector</span>
              <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter drop-shadow-2xl">Pulse Metrics</h2>
            </div>
          </div>

          {/* Habit Grid */}
          <div className="flex-1 p-8 md:p-12 rounded-[4rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-x-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-12 min-w-[900px]">
              <div className="flex items-center gap-4">
                <ListTodo size={24} className="opacity-40" />
                <h3 className="text-sm font-black uppercase tracking-[0.5em] opacity-50">Habit Matrix</h3>
              </div>
              <button 
                onClick={() => setState(p => ({ ...p, habits: [...p.habits, 'New Routine'] }))}
                className="px-8 py-4 rounded-3xl text-[10px] font-black uppercase text-white shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                style={{ backgroundColor: activeTheme.accent1 }}
              >
                <Plus size={16}/> Initialize New Routine
              </button>
            </div>

            <div className="min-w-[900px]">
              <div className="grid gap-x-6 gap-y-10" style={{ gridTemplateColumns: `260px repeat(${daysInMonth}, 1fr)` }}>
                <div />
                {Array.from({ length: daysInMonth }).map((_, i) => (
                  <div key={i} className="text-center text-[10px] font-black opacity-20 tracking-tighter">{i + 1}</div>
                ))}

                {state.habits.map((habit, hIdx) => (
                  <React.Fragment key={hIdx}>
                    <div className="flex items-center gap-5 group/row">
                      <button onClick={() => setState(p => ({ ...p, habits: p.habits.filter((_, i) => i !== hIdx) }))} className="opacity-0 group-hover/row:opacity-100 text-red-500 transition-all hover:scale-125"><Trash2 size={16}/></button>
                      <input 
                        className="bg-transparent border-none outline-none font-black text-base flex-1 truncate focus:text-white focus:scale-105 transition-all"
                        value={habit}
                        onChange={e => setState(p => ({ ...p, habits: p.habits.map((h, i) => i === hIdx ? e.target.value : h) }))}
                      />
                    </div>
                    {monthData[hIdx]?.map((val, dIdx) => {
                      const accent = dIdx < 7 ? activeTheme.accent1 : dIdx < 14 ? activeTheme.accent2 : dIdx < 21 ? activeTheme.accent3 : activeTheme.accent1;
                      return (
                        <div 
                          key={dIdx} 
                          onClick={() => toggleHabit(hIdx, dIdx)}
                          className={`w-10 h-10 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center border-2 ${val ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'opacity-10 hover:opacity-40 hover:scale-110'}`}
                          style={{ 
                            backgroundColor: val ? accent : 'transparent',
                            borderColor: accent
                          }}
                        >
                          {val && <CheckCircle2 size={24} className="text-white animate-in zoom-in duration-300" />}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: Analytics & Wisdom */}
        <aside className="hidden xl:flex flex-col gap-8 h-full">
          {/* Total Score Box */}
          <div className="p-10 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl h-64 flex flex-col items-center justify-center text-center group">
             <Trophy size={40} className="mb-4 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" style={{ color: activeTheme.accent1 }} />
             <div className="text-8xl font-black italic tracking-tighter drop-shadow-2xl" style={{ color: activeTheme.accent1 }}>
               {Math.round(dailyProgress.reduce((a, b) => a + b.val, 0) / daysInMonth)}%
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-4">Total Cosmic Score</span>
          </div>

          {/* Top Habits Box */}
          <div className="p-8 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-8 flex items-center gap-3">
               <Trophy size={16} /> Elite Performance
             </h4>
             <div className="flex flex-col gap-6">
                {topHabits.map((h, i) => (
                  <div key={i} className="flex flex-col gap-2 group/stat">
                    <div className="flex justify-between text-xs font-black italic">
                      <span className="truncate w-40 opacity-70 group-hover/stat:opacity-100">{h.name}</span>
                      <span style={{ color: activeTheme.accent1 }}>{h.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ width: `${h.pct}%`, backgroundColor: i % 2 === 0 ? activeTheme.accent1 : activeTheme.accent2 }} />
                    </div>
                  </div>
                ))}
                {topHabits.length === 0 && <span className="text-xs italic opacity-30 text-center">No rituals recorded yet...</span>}
             </div>
          </div>

          {/* Problems Box */}
          <div className="p-8 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-3">
               <AlertCircle size={16} /> Anomalies Resolved
             </h4>
             <div className="flex flex-col gap-4 max-h-48 overflow-y-auto custom-scrollbar">
               {state.problems.map((prob, idx) => (
                 <div key={idx} className="flex gap-4 group/prob items-center">
                   <button onClick={() => setState(p => ({ ...p, problems: p.problems.map((x, i) => i === idx ? { ...x, done: !x.done } : x) }))}>
                     {prob.done ? <CheckCircle2 className="text-green-400" size={20} /> : <Circle className="opacity-20" size={20} />}
                   </button>
                   <input 
                     className={`bg-transparent border-none outline-none font-bold text-xs flex-1 ${prob.done ? 'line-through opacity-30' : 'hover:text-white'}`}
                     value={prob.text}
                     onChange={e => setState(p => ({ ...p, problems: p.problems.map((x, i) => i === idx ? { ...x, text: e.target.value } : x) }))}
                   />
                   <button onClick={() => setState(p => ({ ...p, problems: p.problems.filter((_, i) => i !== idx) }))} className="opacity-0 group-hover/prob:opacity-40 hover:opacity-100 text-red-500"><Trash2 size={12}/></button>
                 </div>
               ))}
               <button onClick={() => setState(p => ({ ...p, problems: [...p.problems, { id: Date.now().toString(), text: 'New Observation', done: false }] }))} className="text-[10px] font-black uppercase opacity-20 hover:opacity-100 mt-2 flex items-center gap-2">
                 <Plus size={14}/> Log Anomaly
               </button>
             </div>
          </div>

          {/* Personal Notes Box */}
          <div className="p-8 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col flex-1 min-h-[200px] group">
            <div className="flex items-center gap-3 opacity-30 mb-4 group-hover:opacity-100 transition-opacity">
              <StickyNote size={20} />
              <h5 className="text-[10px] font-black uppercase tracking-widest">Personal Cosmic Notes</h5>
            </div>
            <textarea 
               className="bg-transparent border-none outline-none font-bold text-sm resize-none h-full placeholder:opacity-20 italic leading-relaxed focus:text-white transition-colors"
               value={state.notes}
               onChange={e => setState(p => ({ ...p, notes: e.target.value }))}
               placeholder="Capture reflections from your stellar journey..."
            />
          </div>
        </aside>
      </div>

      <footer className="w-full max-w-7xl mt-12 mb-10 z-10">
        <div className="p-10 rounded-[4rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-10 group">
           <div className="p-5 rounded-full bg-white/10 group-hover:rotate-[360deg] transition-all duration-1000 shadow-xl">
             <Sparkles size={40} style={{ color: activeTheme.accent2 }} />
           </div>
           <div className="flex-1">
             <span className="text-[10px] font-black uppercase opacity-30 mb-2 block tracking-[0.4em]">Stellar Instruction</span>
             <textarea 
               className="bg-transparent border-none outline-none font-black italic text-2xl w-full h-14 overflow-hidden resize-none p-0 leading-tight focus:text-white"
               value={state.tip}
               onChange={e => setState(p => ({ ...p, tip: e.target.value }))}
               style={{ color: activeTheme.accent1 }}
             />
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
